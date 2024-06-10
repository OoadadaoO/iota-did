import { type AdapterOptions, LowDB } from "@did/lowdb";

import { privateEnv } from "../env/private";
import { ensureDirExist } from "../utils/ensureDirExist";

export type VcSchema = {
  [id: string]: {
    id: string;
    did: string;
    jwt: string;
  };
};

export type VcDbptions = AdapterOptions;

export class VcDb extends LowDB<VcSchema> {
  static #instances: Map<string, VcDb> = new Map();
  private constructor(adapterOptions: VcDbptions) {
    super(adapterOptions, {});
  }

  public static async getInstance(name: string) {
    if (!VcDb.#instances.has(name)) {
      const filepath = `${privateEnv.WALLET_BASEPATH}${name}/_vc.json`;
      ensureDirExist(filepath);
      const newWallet = new VcDb({
        filename: filepath,
        password: privateEnv.DB_PASSWORD,
      });
      VcDb.#instances.set(name, newWallet);
      console.log(`Constructed a new VcDb named ${name}.`);
    }
    return VcDb.#instances.get(name) as VcDb;
  }
}