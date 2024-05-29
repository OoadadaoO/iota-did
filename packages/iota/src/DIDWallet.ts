import crypto from "crypto";

import { IotaIdentityClient } from "@iota/identity-wasm/node/index";
import {
  Utils,
  Wallet,
  type Client,
  type SecretManager,
  type SecretManagerType,
  type WalletOptions,
} from "@iota/sdk";
import { type Client as ClientWasm } from "@iota/sdk-wasm/node/lib/index";

import { DIDAddress } from "./DIDAddress";
import { DidDb, KeyIdDb } from "./db";
import { resolveDid, validateVC, validateVP } from "./methods";

export type DIDWalletOptions = Omit<
  Required<WalletOptions>,
  "secretManager"
> & {
  password: {
    stronghold: string;
    keyIdDb?: string;
    didDb?: string;
  };
};

export type DIDWalletMetadata = Record<string, string>;

export class DIDWallet extends Wallet {
  private meta: DIDWalletMetadata;
  #secretManagerType: SecretManagerType;
  #client?: Client;
  #didClient?: IotaIdentityClient;
  #secretManager?: SecretManager;
  #keyIdDb: KeyIdDb;
  #didDb: DidDb;
  constructor(options: DIDWalletOptions) {
    const storagePath =
      options.storagePath?.replace(/\/$/, "") ||
      `./wallet/${generateRandomBase64Url(16)}`;
    const walletOptions: Required<WalletOptions> = {
      ...options,
      storagePath,
      secretManager: {
        stronghold: {
          password: options.password.stronghold,
          snapshotPath: `${storagePath}/wallet.stronghold`,
        },
      },
    };
    super(walletOptions);
    this.meta = {};
    this.#secretManagerType = walletOptions.secretManager;
    this.#keyIdDb = new KeyIdDb({
      filename: `${storagePath}/keyid${options.password.keyIdDb ? "" : ".json"}`,
      password: options.password.keyIdDb,
    });
    this.#didDb = new DidDb({
      filename: `${storagePath}/did${options.password.didDb ? "" : ".json"}`,
      password: options.password.didDb,
    });
  }

  getMetadata(): DIDWalletMetadata {
    return this.meta;
  }

  async getClient(): Promise<Client> {
    if (!this.#client) {
      this.#client = await super.getClient();
    }
    return this.#client;
  }

  async getDidClient(): Promise<IotaIdentityClient> {
    if (!this.#didClient) {
      this.#didClient = new IotaIdentityClient(
        (await this.getClient()) as unknown as ClientWasm,
      );
    }
    return this.#didClient;
  }

  async getSecretManager(): Promise<SecretManager> {
    if (!this.#secretManager) {
      this.#secretManager = await super.getSecretManager();
    }
    return this.#secretManager;
  }

  async getKeyIdDb(): Promise<KeyIdDb> {
    await this.#keyIdDb.read();
    return this.#keyIdDb;
  }

  async getDidDb(): Promise<DidDb> {
    await this.#didDb.read();
    return this.#didDb;
  }

  async getDIDAddress(
    accountAlias: string,
    addressIndex: number,
  ): Promise<DIDAddress> {
    let account;
    try {
      account = await super.getAccount(accountAlias);
    } catch (error) {
      account = await super.createAccount({ alias: accountAlias });
    }
    const { index: accountIndex } = account.getMetadata();
    const client = await this.getClient();
    return new DIDAddress({
      secretManagerType: this.#secretManagerType,
      accountIndex,
      addressIndex,
      client,
      didClient: await this.getDidClient(),
      secretManager: await this.getSecretManager(),
      keyIdDb: await this.getKeyIdDb(),
      didDb: await this.getDidDb(),
    });
  }

  static generateMnemonic(): string {
    return Utils.generateMnemonic();
  }

  async isMnemonicStored() {
    try {
      await super.generateEd25519Address(0, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  resolveDid = resolveDid.bind(this);
  validateVC = validateVC.bind(this);
  validateVP = validateVP.bind(this);
}

export function generateRandomBase64Url(length: number): string {
  if (length <= 0) {
    throw new Error("Invalid length");
  }

  const charSet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return crypto
    .randomBytes(length)
    .reduce((str, n) => str + charSet[n % charSet.length], "");
}
