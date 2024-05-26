import { type AdapterOptions, LowDB } from "@did/lowdb";

export type JWK = {
  kty: string;
  alg: string;
  crv: string;
  x: string;
  d: string;
};

export type Wallet = {
  mnemonic: string;
  bech32Address: string;
  docs: {
    id: string;
    methods: {
      fragment: string;
      jwk: JWK;
    }[];
  }[];
};

export const defaultWallet: Wallet = {
  mnemonic: "",
  bech32Address: "",
  docs: [],
};

export class WalletDB extends LowDB<Wallet> {
  constructor(adapterOptions: AdapterOptions) {
    super(adapterOptions, defaultWallet);
  }
}
