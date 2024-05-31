import {
  type KeyIdStorage,
  type MethodDigest,
} from "@iota/identity-wasm/node/index";
import type { SecretManager } from "@iota/sdk";

import type { KeyIdDb } from "../db";
import { toKeyIdIndex } from "../utils";
import { buildJwk } from "./utils";

export type KeyIdFileStoreOptions = {
  index: {
    account: number;
  };
  ref: {
    secretManager: SecretManager;
    keyIdDb: KeyIdDb;
  };
};

export class KeyIdFileStore implements KeyIdStorage {
  #account: number;
  #secretManager: SecretManager;
  #db: KeyIdDb;
  constructor({ index, ref }: KeyIdFileStoreOptions) {
    this.#account = index.account;
    this.#secretManager = ref.secretManager;
    this.#db = ref.keyIdDb;
  }

  async insertKeyId(methodDigest: MethodDigest, keyId: string): Promise<void> {
    const index = toKeyIdIndex(this.#account, methodDigest);
    const seed = Buffer.from(keyId, "base64url");
    const { kid: fragment } = await buildJwk(
      seed,
      this.#secretManager,
      this.#account,
    );
    const value = this.#db.data[index];
    if (value !== undefined) {
      throw new Error("KeyId already exists");
    }
    this.#db.update((data) => {
      data[index] = { keyId, fragment };
    });
  }

  async getKeyId(methodDigest: MethodDigest): Promise<string> {
    const index = toKeyIdIndex(this.#account, methodDigest);
    const { keyId } = this.#db.data[index];
    if (keyId == undefined) {
      throw new Error("KeyId not found");
    }
    return keyId;
  }

  async deleteKeyId(methodDigest: MethodDigest): Promise<void> {
    const index = toKeyIdIndex(this.#account, methodDigest);
    const exists = this.#db.data[index] !== undefined;
    if (exists) {
      this.#db.update((data) => {
        delete data[index];
      });
    } else {
      throw new Error("KeyId not found!");
    }
  }

  count(): number {
    return Math.pow(2, 32 * 2);
  }
}
