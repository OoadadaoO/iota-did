import { type AdapterOptions, LowDB } from "@did/lowdb";

import { privateEnv } from "../env/private";
import { ensureDirExist } from "../utils/ensureDirExist";

export type WalletSchema = object;

export type WalletDbptions = AdapterOptions;

export class WalletDb extends LowDB<WalletSchema> {
  static #instance: WalletDb;
  private constructor(adapterOptions: WalletDbptions) {
    super(adapterOptions, {
      users: {},
      memberCredentials: {},
      partnerCredentials: {},
      allowedDids: {},
    });
  }

  public static async getInstance() {
    if (!WalletDb.#instance) {
      const filepath = `../../db/wallet/data.json`;
      ensureDirExist(filepath);
      WalletDb.#instance = new WalletDb({
        filename: filepath,
        password: privateEnv.DB_PASSWORD,
      });
      console.log("Constructed a new WalletDb instance.");
    }
    await WalletDb.#instance.read();
    return WalletDb.#instance;
  }
}
