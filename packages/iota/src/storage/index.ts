import { Storage } from "@iota/identity-wasm/node/index";
import type { SecretManager } from "@iota/sdk";

import type { KeyIdDb } from "../db";
import { JwkStrongholdStore } from "./JwkStrongholdStore";
import { KeyIdFileStore } from "./KeyIdJsonStore";

export function buildStorage(
  account: number,
  secretManager: SecretManager,
  keyIdDb: KeyIdDb,
): Storage {
  const jwkStore = new JwkStrongholdStore({
    index: { account },
    ref: { secretManager },
  });

  const keyIdStore = new KeyIdFileStore({
    index: { account },
    ref: { secretManager, keyIdDb },
  });
  return new Storage(jwkStore, keyIdStore);
}

export * from "./utils";
export * from "./JwkStrongholdStore";
export * from "./KeyIdJsonStore";
