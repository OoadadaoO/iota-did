import { type AdapterOptions, LowDB } from "@did/lowdb";

import { env } from "../env";
import { Credential } from "../routes/iota";
import { b64uToUtf8 } from "../utils/base64url";
import { ensureDirExist } from "../utils/ensureDirExist";

export type VcSchema = {
  [id: string]: {
    id: string;
    did: string;
    jwt: string;
    credential: Credential;
  };
};

export type VcDbptions = AdapterOptions;

export class VcDb extends LowDB<VcSchema> {
  static #instances: Map<string, VcDb> = new Map();
  private constructor(adapterOptions: VcDbptions) {
    super(adapterOptions, {});
  }

  public static async getInstance(b64uName: string) {
    const name = b64uToUtf8(b64uName);
    if (!VcDb.#instances.has(name)) {
      const filepath = `${env.WALLET_BASEPATH}${name}/_vc.json`;
      ensureDirExist(filepath);
      const newWallet = new VcDb({
        filename: filepath,
        password: env.DB_PASSWORD,
      });
      await newWallet.read();
      VcDb.#instances.set(name, newWallet);
      console.log(`Constructed a new VcDb named ${name}.`);
    }
    return VcDb.#instances.get(name) as VcDb;
  }
}
