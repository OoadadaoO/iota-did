import { DIDWallet as DWallet, type DIDAddress } from "@did/iota";
import type { DIDWalletOptions } from "@did/iota";
import { CoinType } from "@iota/sdk";

import { env } from "../env";

export class DIDWallet extends DWallet {
  static #instance: DIDWallet;
  static #address: DIDAddress;
  private constructor(didWalletOptions: DIDWalletOptions) {
    super(didWalletOptions);
  }

  public static async getInstance() {
    if (!DIDWallet.#instance || !DIDWallet.#address) {
      const storagePath = `${env.WALLET_BASEPATH}${env.ORG_NAME}`;
      DIDWallet.#instance = new DIDWallet({
        storagePath,
        clientOptions: {
          primaryNode: env.IOTA_API_ENDPOINT,
          localPow: true,
        },
        coinType: CoinType.Shimmer,
        password: {
          stronghold: env.WALLET_PASSWORD,
        },
      });
      DIDWallet.#address = await DIDWallet.#instance.getDIDAddress(0, 0);
      // await DIDWallet.#instance.startBackgroundSync();
      console.log("Constructed a new DIDWallet instance.");
    }
    return {
      wallet: DIDWallet.#instance,
      address: DIDWallet.#address,
    };
  }
}
