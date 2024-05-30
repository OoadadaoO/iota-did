import type {
  IotaIdentityClient,
  MethodDigest,
  Storage,
} from "@iota/identity-wasm/node/index";
import type { Client, SecretManager, SecretManagerType } from "@iota/sdk";

import type { KeyIdDb } from "./db";
import {
  resolveDid,
  validateVC,
  validateVP,
  getBalance,
  requestFunds,
  createDid,
  deleteDid,
  deactivateDid,
  reactivateDid,
  publishDid,
  insertMethod,
  removeMethod,
  insertRelationship,
  removeRelationship,
  insertService,
  insertRevokeService,
  removeService,
  createVC,
  createVP,
  revokeVC,
  unrevokeVC,
  getDids,
} from "./methods";
import { buildStorage } from "./storage";
import { toDidIndex, toKeyIdIndex } from "./util";

export type DIDAddressOptions = {
  secretManagerType: SecretManagerType;
  // specific to Address
  accountIndex: number;
  addressIndex: number;
  // shared by WalletDIDExt
  client: Client;
  didClient: IotaIdentityClient;
  secretManager: SecretManager;
  keyIdDb: KeyIdDb;
};

export type DIDAddressMetadata = {
  accountIndex: number;
  addressIndex: number;
};

export class DIDAddress {
  private meta: DIDAddressMetadata;
  #secretManagerType: SecretManagerType;
  #client: Client;
  #didClient: IotaIdentityClient;
  #secretManager: SecretManager;
  #keyIdDb: KeyIdDb;
  #storage: Storage;
  constructor(options: DIDAddressOptions) {
    this.meta = {
      accountIndex: options.accountIndex,
      addressIndex: options.addressIndex,
    };
    this.#secretManagerType = options.secretManagerType;
    this.#client = options.client;
    this.#didClient = options.didClient;
    this.#secretManager = options.secretManager;
    this.#keyIdDb = options.keyIdDb;
    this.#storage = buildStorage(
      options.accountIndex,
      options.secretManager,
      options.keyIdDb,
    );
  }

  getMetadata() {
    return this.meta;
  }

  async getClient() {
    return this.#client;
  }

  async getDidClient() {
    return this.#didClient;
  }

  async getSecretManager() {
    return this.#secretManager;
  }

  async getSecretManagerType() {
    return this.#secretManagerType;
  }

  async getKeyIdDb() {
    return this.#keyIdDb;
  }

  async getStorage() {
    return this.#storage;
  }

  async getBech32Hrp() {
    return this.#didClient.getNetworkHrp();
  }

  async getBech32Address() {
    const addrs = await this.#secretManager.generateEd25519Addresses({
      accountIndex: this.meta.accountIndex,
      range: {
        start: this.meta.addressIndex,
        end: this.meta.addressIndex + 1,
      },
      bech32Hrp: await this.getBech32Hrp(),
    });
    return addrs[0];
  }

  toDidIndex(didString: string) {
    return toDidIndex(
      this.meta.accountIndex,
      this.meta.addressIndex,
      didString,
    );
  }

  toKeyIdIndex(methodDigest: MethodDigest) {
    return toKeyIdIndex(this.meta.accountIndex, methodDigest);
  }

  getBalance = getBalance.bind(this);
  requestFunds = requestFunds.bind(this);

  resolveDid = resolveDid.bind(this);
  validateVC = validateVC.bind(this);
  validateVP = validateVP.bind(this);

  getDids = getDids.bind(this);
  publishDid = publishDid.bind(this);
  createDid = createDid.bind(this);
  deleteDid = deleteDid.bind(this);
  deactivateDid = deactivateDid.bind(this);
  reactivateDid = reactivateDid.bind(this);

  insertMethod = insertMethod.bind(this);
  removeMethod = removeMethod.bind(this);

  insertRelationship = insertRelationship.bind(this);
  removeRelationship = removeRelationship.bind(this);

  insertService = insertService.bind(this);
  insertRevokeService = insertRevokeService.bind(this);
  removeService = removeService.bind(this);

  createVC = createVC.bind(this);
  createVP = createVP.bind(this);
  revokeVC = revokeVC.bind(this);
  unrevokeVC = unrevokeVC.bind(this);
}
