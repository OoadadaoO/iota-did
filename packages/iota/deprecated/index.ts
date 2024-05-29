import {
  IotaIdentityClient,
  JwkMemStore,
  KeyIdMemStore,
  Storage,
} from "@iota/identity-wasm/node/index";
import { Client } from "@iota/sdk-wasm/node/lib/index";

import { createWallet } from "../deprecated/methods/_create_wallet";
import { loadStorage } from "../deprecated/methods/_load_storage";
import {
  deactivateDid,
  reactivateDid,
} from "../deprecated/methods/activate_did";
import { createDid } from "../deprecated/methods/create_did";
import { createVC } from "../deprecated/methods/create_vc";
import { createVP } from "../deprecated/methods/create_vp";
import { deleteDid } from "../deprecated/methods/delete_did";
import { getBalance } from "../deprecated/methods/get_balance";
import { publishDid } from "../deprecated/methods/publish_did";
import { requestFunds } from "../deprecated/methods/request_funds";
import { resolveDid } from "../deprecated/methods/resolve_did";
import { revokeVC, unrevokeVC } from "../deprecated/methods/revoke_vc";
import {
  insertMethod,
  removeMethod,
  updateMethodKey,
} from "../deprecated/methods/update_method";
import {
  insertRelationship,
  removeelationship,
} from "../deprecated/methods/update_relationship";
import {
  insertService,
  removeService,
  insertRevokeService,
} from "../deprecated/methods/update_service";
import { validateVC } from "../deprecated/methods/validate_vc";
import { validateVP } from "../deprecated/methods/validate_vp";
import { WalletDB, type WalletOptions } from "./db";

export type IotaOptions = {
  primaryNode: string;
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

    this.db = new WalletDB(wallet);

    this.storage = new Storage(new JwkMemStore(), new KeyIdMemStore());
  }

  static async build(iota: IotaOptions, wallet: WalletOptions) {
    const client = new IotaClient(iota, wallet);
    await client.db.read();
    if (!client.db.data.mnemonic) {
      console.log("Creating wallet...");
      await createWallet(client.didClient, client.db);
    } else {
      console.log("Loading wallet...");
      await loadStorage(client.didClient, client.db, client.storage);
    }
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
