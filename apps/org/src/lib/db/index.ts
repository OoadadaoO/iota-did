import { type AdapterOptions, LowDB } from "@did/lowdb";

import { privateEnv } from "../env/private";
import { publicEnv } from "../env/public";
import { ensureDirExist } from "../utils/ensureDirExist";
import type {
  AllowedDidType,
  MemberCredentialType,
  PartnerCredentialType,
  UserType,
} from "./type";

export type DataSchema = {
  users: { [id: string]: UserType };
  memberCredentials: { [id: string]: MemberCredentialType };
  partnerCredentials: { [id: string]: PartnerCredentialType };
  allowedDids: { [id: string]: AllowedDidType };
};

export type DataDbptions = AdapterOptions;

export class DataDb extends LowDB<DataSchema> {
  static #instance: DataDb;
  private constructor(adapterOptions: DataDbptions) {
    super(adapterOptions, {
      users: {},
      memberCredentials: {},
      partnerCredentials: {},
      allowedDids: {},
    });
  }

  public static async getInstance() {
    if (!DataDb.#instance) {
      const filepath = `../../db/${publicEnv.NEXT_PUBLIC_NAME}/data.json`;
      ensureDirExist(filepath);
      DataDb.#instance = new DataDb({
        filename: filepath,
        password: privateEnv.DB_PASSWORD,
      });
      console.log("Constructed a new DataDb instance.");
    }
    await DataDb.#instance.read();
    return DataDb.#instance;
  }
}

export type ConfigSchema = {
  issueDid?: string;
  issueFragment?: string;
  revokeFragment?: string;
};

export type ConfigDbptions = AdapterOptions;

export class ConfigDb extends LowDB<ConfigSchema> {
  static #instance: ConfigDb;
  private constructor(adapterOptions: ConfigDbptions) {
    super(adapterOptions, {});
  }

  public static async getInstance() {
    if (!ConfigDb.#instance) {
      const filepath = `../../db/${publicEnv.NEXT_PUBLIC_NAME}/config.json`;
      ensureDirExist(filepath);
      ConfigDb.#instance = new ConfigDb({
        filename: filepath,
        password: privateEnv.DB_PASSWORD,
      });
      console.log("Constructed a new ConfigDb instance.");
    }
    await ConfigDb.#instance.read();
    return ConfigDb.#instance;
  }
}
