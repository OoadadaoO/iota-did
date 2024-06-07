import * as fs from "fs";
import * as path from "path";

import {
  JwsAlgorithm,
  MethodScope,
  verifyEd25519,
  type IJwsVerifier,
  type IotaDocument,
  type Jwk,
  type MethodDigest,
  type VerificationMethod,
} from "@iota/identity-wasm/node/index";

import type { DIDWallet, DIDAddress } from ".";

/**
 * A custom JWS Verifier capabale of verifying EdDSA signatures with curve Ed25519.
 */
export class Ed25519JwsVerifier implements IJwsVerifier {
  verify(
    alg: JwsAlgorithm,
    signingInput: Uint8Array,
    decodedSignature: Uint8Array,
    publicKey: Jwk,
  ) {
    switch (alg) {
      case JwsAlgorithm.EdDSA:
        // This verifies that the curve is Ed25519 so we don't need to check ourselves.
        return verifyEd25519(alg, signingInput, decodedSignature, publicKey);
      default:
        throw new Error(`unsupported jws algorithm ${alg}`);
    }
  }
}

/**
 * Converts a `MethodDigest` to a base64 encoded string.
 */
export function methodDigestToB64U(methodDigest: MethodDigest) {
  const arrayBuffer = methodDigest.pack().buffer;
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

export function toDidIndex(
  accountIndex: number,
  addressIndex: number,
  didString: string,
) {
  return `${accountIndex}/${addressIndex}/${didString}`;
}

export function toKeyIdIndex(accountIndex: number, methodDigest: MethodDigest) {
  return `${accountIndex}/${methodDigestToB64U(methodDigest)}`;
}

// ===========================================================================
// VerificationMethod Set Operations
// ===========================================================================

/**
 * Returns the union of an array of arrays of `VerificationMethod`.
 */
export function methodUnion(
  arrays: VerificationMethod[][],
): VerificationMethod[] {
  const map = new Map();
  arrays.forEach((array) => {
    array.forEach((method) => map.set(method.id().fragment(), method));
  });
  return [...map.values()];
}

/**
 * Returns the intersection of two arrays of `VerificationMethod`.
 */
export function methodIntersection(
  array1: VerificationMethod[],
  array2: VerificationMethod[],
): VerificationMethod[] {
  const set1 = new Set(array1.map((method) => method.id().fragment()));
  return array2.filter((method) => set1.has(method.id().fragment()));
}

/**
 * Returns the difference of two arrays of `VerificationMethod`.
 */
export function methodDifference(
  array1: VerificationMethod[],
  array2: VerificationMethod[],
): VerificationMethod[] {
  const set2 = new Set(array2.map((method) => method.id().fragment()));
  return array1.filter((method) => !set2.has(method.id().fragment()));
}

// ===========================================================================
// Find all wallets' assets/details
// ===========================================================================

export type WalletData = {
  name: string;
  path: string;
};

export type AccountData = {
  name: string;
  index: number;
  addresses: DIDAddress[];
};

/**
 * Return the stored wallets.
 */
export function getWalletsData(): WalletData[] {
  const dirPath = "../../wallet";
  const requiredFiles = ["wallet.stronghold", "_keyid.json"];
  const wallets: WalletData[] = [];

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach((item) => {
      if (item.isDirectory()) {
        const folderPath = path.join(dirPath, item.name);
        const filesInFolder = fs.readdirSync(folderPath);
        console.log("filesInFolder", filesInFolder);

        if (
          requiredFiles.every((requiredFile) =>
            filesInFolder.includes(requiredFile),
          )
        ) {
          wallets.push({ name: item.name, path: folderPath });
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
  }

  return wallets;
}

/**
 * Return the accounts and their DIDAddress of a DIDWallet.
 */
export async function getAccountsData(
  wallet: DIDWallet,
): Promise<AccountData[]> {
  const accounts = await wallet.getAccounts();
  const acc: AccountData[] = [];
  for (const account of accounts) {
    const meta = account.getMetadata();
    const addrs = await account.addresses();
    acc.push({
      name: meta.alias,
      index: meta.index,
      addresses: await Promise.all(
        addrs
          .filter((addr) => !addr.internal)
          .map((addr) => wallet.getDIDAddress(meta.index, addr.keyIndex)),
      ),
    });
  }
  return await Promise.all(
    accounts.map(async (account) => {
      const meta = account.getMetadata();
      const addrs = await account.addresses();
      return {
        name: meta.alias,
        index: meta.index,
        addresses: await Promise.all(
          addrs
            .filter((addr) => !addr.internal)
            .map((addr) => wallet.getDIDAddress(meta.index, addr.keyIndex)),
        ),
      };
    }),
  );
}

/**
 * Return the DID documents of a DIDAddress.
 */
export async function getDidDocuments(address: DIDAddress) {
  return await address.getDids();
}

export type GetClassifiedMethodsResultBase<T> = {
  authentication: T[];
  assertion: T[];
  keyAgreement: T[];
  capabilityInvocation: T[];
  capabilityDelegation: T[];
};

export type GetClassifiedMethodsResult<T extends boolean> = T extends true
  ? GetClassifiedMethodsResultBase<string>
  : GetClassifiedMethodsResultBase<VerificationMethod>;

/**
 * Returns the classified VerificationMethods of a DID document.
 */
export function getClassfiedMethods<T extends boolean>(
  didDocument: IotaDocument,
  onlyFragment: T = false as T,
): GetClassifiedMethodsResult<T> {
  const allMethods = didDocument.methods();
  const auth = didDocument.methods(MethodScope.Authentication());
  const assert = didDocument.methods(MethodScope.AssertionMethod());
  const key = didDocument.methods(MethodScope.KeyAgreement());
  const invoke = didDocument.methods(MethodScope.CapabilityInvocation());
  const delegate = didDocument.methods(MethodScope.CapabilityDelegation());
  const specificMethods = methodUnion([auth, assert, key, invoke, delegate]);
  const generalMethods = methodDifference(allMethods, specificMethods);
  const authentication = methodUnion([auth, generalMethods]);
  const assertion = methodUnion([assert, generalMethods]);
  const keyAgreement = methodUnion([key, generalMethods]);
  const capabilityInvocation = methodUnion([invoke, generalMethods]);
  const capabilityDelegation = methodUnion([delegate, generalMethods]);
  if (onlyFragment) {
    return {
      authentication: authentication.map((m) => m.id().fragment()!),
      assertion: assertion.map((m) => m.id().fragment()!),
      keyAgreement: keyAgreement.map((m) => m.id().fragment()!),
      capabilityInvocation: capabilityInvocation.map((m) => m.id().fragment()!),
      capabilityDelegation: capabilityDelegation.map((m) => m.id().fragment()!),
    } as GetClassifiedMethodsResult<T>;
  }
  return {
    authentication,
    assertion,
    keyAgreement,
    capabilityInvocation,
    capabilityDelegation,
  } as GetClassifiedMethodsResult<T>;
}

/**
 * Returns the services of a DID document.
 */
export function getServices(didDocument: IotaDocument) {
  return didDocument.service();
}
