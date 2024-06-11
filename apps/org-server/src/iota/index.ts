import { DIDAddress as DAddress, KeyIdDb } from "@did/iota";
import type { DIDAddressOptions } from "@did/iota";
import { IotaIdentityClient } from "@iota/identity-wasm/node";
import { Client, SecretManager, StrongholdSecretManager } from "@iota/sdk";
import type { Client as ClientWasm } from "@iota/sdk-wasm/node";

import { env } from "../env";

// export class DIDWallet extends DWallet {
//   static #instance: DIDWallet;
//   static #address: DIDAddress;
//   private constructor(didWalletOptions: DIDWalletOptions) {
//     super(didWalletOptions);
//   }

//   public static async getInstance() {
//     if (!DIDWallet.#instance || !DIDWallet.#address) {
//       const storagePath = `../../wallet/${env.NAME}`;
//       DIDWallet.#instance = new DIDWallet({
//         storagePath,
//         clientOptions: {
//           primaryNode: env.IOTA_API_ENDPOINT,
//           localPow: true,
//         },
//         coinType: CoinType.Shimmer,
//         password: {
//           stronghold: env.WALLET_PASSWORD,
//         },
//       });
//       DIDWallet.#address = await DIDWallet.#instance.getDIDAddress(0, 0);
//       // await DIDWallet.#instance.startBackgroundSync();
//       console.log("Constructed a new DIDWallet instance.");
//     }
//     return {
//       wallet: DIDWallet.#instance,
//       address: DIDWallet.#address,
//     };
//   }
// }
export class DIDAddress extends DAddress {
  static #instance: DIDAddress;
  private constructor(didAddressOptions: DIDAddressOptions) {
    super(didAddressOptions);
  }

  public static async getInstance() {
    if (!DIDAddress.#instance) {
      const storagePath = `../../wallet/${env.NAME}`;
      const accountIndex = 0;
      const addressIndex = 0;
      const client = new Client({
        primaryNode: env.IOTA_API_ENDPOINT,
        localPow: true,
      });
      const didClient = new IotaIdentityClient(client as unknown as ClientWasm);
      const secretManagerType: StrongholdSecretManager = {
        stronghold: {
          password: env.WALLET_PASSWORD,
          snapshotPath: `${storagePath}/wallet.stronghold`,
        },
      };
      const secretManager = new SecretManager(secretManagerType);
      const keyIdDb = new KeyIdDb({
        filename: `${storagePath}/_keyid.json`,
      });
      DIDAddress.#instance = new DIDAddress({
        secretManagerType,
        accountIndex,
        addressIndex,
        client,
        didClient,
        secretManager,
        keyIdDb,
      });
      console.log("Constructed a new DIDAddress instance.");
    }
    return DIDAddress.#instance;
  }
}
