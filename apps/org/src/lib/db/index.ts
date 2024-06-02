import { type AdapterOptions, LowDB } from "@did/lowdb";

import { privateEnv } from "../env/private";
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

const defaultData: DataSchema = {
  users: {},
  memberCredentials: {},
  partnerCredentials: {},
  allowedDids: {},
};

export type DataDbptions = AdapterOptions;

export class DataDb extends LowDB<DataSchema> {
  static #instance: DataDb;
  private constructor(adapterOptions: DataDbptions) {
    super(adapterOptions, JSON.parse(JSON.stringify(defaultData)));
  }

  public static async getInstance() {
    if (!DataDb.#instance) {
      DataDb.#instance = new DataDb({
        filename: privateEnv.DB_FILEPATH,
        password: privateEnv.DB_PASSWORD,
      });
      console.log("Constructed a new DataDb instance.");
    }
    await DataDb.#instance.read();
    return DataDb.#instance;
  }
}
