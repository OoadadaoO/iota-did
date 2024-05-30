import { type IotaDocument } from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

export async function revokeVC(
  this: DIDAddress,
  issuerDidString: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<IotaDocument> {
  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(issuerDidString);
  const did = document.id();

  document.revokeCredentials(did.join(issuerRevokeFragment), issuerRevokeIndex);
  const published = await this.publishDid({ document });

  return published;
}

export async function unrevokeVC(
  this: DIDAddress,
  issuerDidString: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<IotaDocument> {
  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(issuerDidString);
  const did = document.id();

  document.unrevokeCredentials(
    did.join(issuerRevokeFragment),
    issuerRevokeIndex,
  );
  const published = await this.publishDid({ document });

  return published;
}
