import { DIDWallet as DWallet } from "@did/iota";
import type { DIDWalletOptions } from "@did/iota";
import { CoinType } from "@iota/sdk";

import { env } from "../env";

export class DIDWallet extends DWallet {
  static #instances: Map<string, DIDWallet> = new Map();
  private constructor(didWalletOptions: DIDWalletOptions) {
    super(didWalletOptions);
  }

  public static async getInstance(name: string) {
    if (!DIDWallet.#instances.has(name)) {
      if (!isValidFolderName(name)) throw new Error("Invalid folder name.");
      const storagePath = `${env.WALLET_BASEPATH}${name}`;
      const newWallet = new DIDWallet({
        storagePath,
        clientOptions: {
          primaryNode: env.IOTA_API_ENDPOINT,
          localPow: true,
        },
        coinType: CoinType.Shimmer,
        password: {
          // stronghold: env.WALLET_PASSWORD,
        },
      });
      DIDWallet.#instances.set(name, newWallet);
      // await newWallet.startBackgroundSync();
      console.log(`Constructed a new DIDWallet named ${name}.`);
    }
    return DIDWallet.#instances.get(name) as DIDWallet;
  }
}

function isValidFolderName(folderName: string) {
  const regex = /^[0-9a-zA-Z_-]*$/;
  return regex.test(folderName);
}
