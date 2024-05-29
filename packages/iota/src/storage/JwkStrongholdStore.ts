import crypto from "crypto";

import {
  JwkGenOutput,
  JwkMemStore,
  type Jwk,
  type JwsAlgorithm,
  type JwkStorage,
} from "@iota/identity-wasm/node/index";
import type { SecretManager } from "@iota/sdk";

import { buildJwk } from "./utils";

export type JwkStrongholdStoreOptions = {
  index: {
    account: number;
  };
  ref: {
    secretManager: SecretManager;
  };
};

export class JwkStrongholdStore implements JwkStorage {
  #account: number;
  #secretManager;
  constructor({ index, ref }: JwkStrongholdStoreOptions) {
    this.#account = index.account;
    this.#secretManager = ref.secretManager;
  }

  static ed25519KeyType(): string {
    return "Ed25519";
  }

  async generate(
    keyType: string,
    algorithm: JwsAlgorithm,
  ): Promise<JwkGenOutput> {
    if (keyType !== JwkMemStore.ed25519KeyType()) {
      throw new Error(`unsupported key type ${keyType}`);
    }
    if (algorithm !== "EdDSA" /* JwsAlgorithm.EdDSA */) {
      throw new Error(`unsupported algorithm`);
    }

    const seed = crypto.randomBytes(12);

    const keyId = seed.toString("base64url");
    const { jwk } = await buildJwk(seed, this.#secretManager, this.#account);

    const publicJWK = jwk.toPublic();
    if (!publicJWK) {
      throw new Error(`JWK is not a public key`);
    }
    return new JwkGenOutput(keyId, publicJWK);
  }

  async sign(
    keyId: string,
    data: Uint8Array,
    publicKey: Jwk,
  ): Promise<Uint8Array> {
    if (publicKey.alg() !== "EdDSA" /* JwsAlgorithm.EdDSA */) {
      throw new Error("unsupported JWS algorithm");
    } else {
      if (publicKey.paramsOkp()?.crv !== "Ed25519" /* EdCurve.Ed25519 */) {
        throw new Error("unsupported Okp parameter");
      }
    }
    const seed = Buffer.from(keyId, "base64url");
    const addressIndex = Buffer.from(
      seed.filter((_, i) => i % 3 === 1),
    ).readUInt32BE(0);

    const { signature } = await this.#secretManager.signEd25519(
      `0x${Buffer.from(data).toString("hex")}`,
      {
        account: this.#account, // account index
        change: 1, // internal account
        addressIndex, // address index
      },
    );
    const sig = Buffer.from(signature.slice(2), "hex");
    return sig;
  }

  async insert(jwk: Jwk): Promise<string> {
    if (!jwk.isPrivate) {
      throw new Error("expected a JWK with all private key components set");
    }
    if (!jwk.alg()) {
      throw new Error("expected a Jwk with an `alg` parameter");
    }
    throw new Error("Method not allow.");
    return "";
  }

  async delete(keyId: string): Promise<void> {
    keyId;
  }

  async exists(keyId: string): Promise<boolean> {
    // check if base64url encoded
    if (keyId !== Buffer.from(keyId, "base64url").toString("base64url")) {
      return false;
    }
    return true;
  }

  count(): number {
    return Math.pow(2, 32);
  }
}
