import type { PathLike } from "fs";

import {
  IotaIdentityClient,
  JwkMemStore,
  KeyIdMemStore,
  Storage,
} from "@iota/identity-wasm/node/index";
import { Client } from "@iota/sdk-wasm/node/lib/index";

import { WalletDB } from "./db";
import { createWallet } from "./method/_create_wallet";
import { loadStorage } from "./method/_load_storage";
import { deactivateDid, reactivateDid } from "./method/activate_did";
import { createDid } from "./method/create_did";
import { createVC } from "./method/create_vc";
import { createVP } from "./method/create_vp";
import { deleteDid } from "./method/delete_did";
import { getBalance } from "./method/get_balance";
import { publishDid } from "./method/publish_did";
import { requestFunds } from "./method/request_funds";
import { resolveDid } from "./method/resolve_did";
import { revokeVC, unrevokeVC } from "./method/revoke_vc";
import {
  insertMethod,
  removeMethod,
  updateMethodKey,
} from "./method/update_method";
import {
  insertRelationship,
  removeelationship,
} from "./method/update_relationship";
import {
  insertService,
  removeService,
  insertRevokeService,
} from "./method/update_service";
import { validateVC } from "./method/validate_vc";
import { validateVP } from "./method/validate_vp";

export type IotaOptions = {
  primaryNode: string;
};

export type WalletOptions = {
  dbPath: PathLike;
};

export class IotaClient {
  client: Client;
  didClient: IotaIdentityClient;
  storage: Storage;
  db: WalletDB;

  private constructor(iota: IotaOptions, wallet: WalletOptions) {
    this.client = new Client({
      primaryNode: iota.primaryNode,
      localPow: true,
    });
    this.didClient = new IotaIdentityClient(this.client);

    this.db = new WalletDB({ filename: wallet.dbPath });

    this.storage = new Storage(new JwkMemStore(), new KeyIdMemStore());
  }

  static async build(iota: IotaOptions, wallet: WalletOptions) {
    const client = new IotaClient(iota, wallet);
    await client.db.read();
    if (!client.db.data.mnemonic) {
      await createWallet(client.didClient, client.db);
    } else {
      await loadStorage(client.didClient, client.db, client.storage);
    }
    await client.db.read();
    return client;
  }

  // ===========================================================================
  // Basic wallet operations
  // ===========================================================================
  getBalance = getBalance.bind(this);
  requestFunds = requestFunds.bind(this);

  // ===========================================================================
  // DID Document operations
  // ===========================================================================
  createDid = createDid.bind(this);
  resolveDid = resolveDid.bind(this);
  publishDid = publishDid.bind(this);
  deactivateDid = deactivateDid.bind(this);
  reactivateDid = reactivateDid.bind(this);
  deleteDid = deleteDid.bind(this);

  // ===========================================================================
  // Verifiable Method operations
  // ===========================================================================
  /**Update the key stored in db*/
  updateMethodKey = updateMethodKey.bind(this);
  insertMethod = insertMethod.bind(this);
  removeMethod = removeMethod.bind(this);

  insertRelationship = insertRelationship.bind(this);
  removeelationship = removeelationship.bind(this);

  insertService = insertService.bind(this);
  removeService = removeService.bind(this);
  insertRevokeService = insertRevokeService.bind(this);

  // ===========================================================================
  // Verifiable Credential operations
  // ===========================================================================
  createVC = createVC.bind(this);
  validateVC = validateVC.bind(this);
  revokeVC = revokeVC.bind(this);
  unrevokeVC = unrevokeVC.bind(this);

  // ===========================================================================
  // Verifiable Presentation operations
  // ===========================================================================
  createVP = createVP.bind(this);
  validateVP = validateVP.bind(this);
}
