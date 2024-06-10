import { GetMethodsResult, WalletData, Relationship } from "@did/iota";

import type { Response, ErrorResponse } from "../types";

export type Account = {
  name: string;
  index: number;
  address: string;
  balance: string;
  accountBalance: {
    total: string;
    available: string;
  };
};
export type Method = {
  fragment: string;
  controller: string;
  relationship: Relationship;
  json: Record<string, any>;
};
export type Service = {
  fragment: string;
  type: string[];
  endpoint: string;
  json: Record<string, any>;
};
export type Credential = {
  "@context": string;
  id: string;
  type: string[];
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialStatus?: {
    id: string;
    type: string;
    [key: string]: any;
  };
};
export type Vc = {
  id: string;
  did: string;
  jwt: string;
  credential: Credential;
};

export type DocumentMethod =
  | string
  | {
      id: string;
      type: string;
      controller: string;
      [key: string]: any;
    };
export type DocumentService = {
  id: string;
  type: string;
  serviceEndpoint: string;
  [key: string]: any;
};
export type Document = {
  id?: string;
  verificationMethod?: DocumentMethod[];
  authentication?: DocumentMethod[];
  assertionMethod?: DocumentMethod[];
  keyAgreement?: DocumentMethod[];
  capabilityInvocation?: DocumentMethod[];
  capabilityDelegation?: DocumentMethod[];
  service?: DocumentService[];
  [key: string]: any;
};
export type Metadata = {
  created?: string;
  updated?: string;
  deactivated?: boolean;
  governorAddress?: string;
  stateControllerAddress?: string;
  [key: string]: any;
};
export type Did = {
  did: string;
  method: GetMethodsResult;
  service: Service[];
  vc: Vc[];
  deactive: boolean;
  json: Document;
  metadata: Metadata;
};
export type Balance = {
  balance: string;
  accountBalance: {
    total: string;
    available: string;
  };
};

export type GetWalletsResponseOk = Response<{
  wallets: WalletData[];
}>;
export type GetWalletsResponse = GetWalletsResponseOk | ErrorResponse;
export type PostWalletsResponseOk = Response<{
  wallet: WalletData & { mnemonic: string };
}>;
export type PostWalletsResponse = PostWalletsResponseOk | ErrorResponse;

export type PostPasswordResponseOk = Response<Record<string, never>>;
export type PostPasswordResponse = PostPasswordResponseOk | ErrorResponse;

export type GetAccountsResponseOk = Response<{
  name: string;
  accounts: Account[];
}>;
export type GetAccountsResponse = GetAccountsResponseOk | ErrorResponse;

export type PostAccountsResponseOk = Response<{
  name: string;
  account: Account;
}>;
export type PostAccountsResponse = PostAccountsResponseOk | ErrorResponse;

export type GetBalanceResponseOk = Response<Balance>;
export type GetBalanceResponse = GetBalanceResponseOk | ErrorResponse;

export type GetFaucetResponseOk = Response<Balance>;
export type GetFaucetResponse = GetBalanceResponseOk | ErrorResponse;

export type GetDidsResponseOk = Response<{ dids: Did[] }>;
export type GetDidsResponse = GetDidsResponseOk | ErrorResponse;
export type PostDidsResponseOk = Response<{ did: Did }>;
export type PostDidsResponse = PostDidsResponseOk | ErrorResponse;
export type PatchDidResponseOk = PostDidsResponseOk;
export type PatchDidResponse = PatchDidResponseOk | ErrorResponse;
export type DeleteDidResponseOk = Response<Record<string, never>>;
export type DeleteDidResponse = DeleteDidResponseOk | ErrorResponse;

export type PostMethodsResponseOk = PostDidsResponseOk;
export type PostMethodsResponse = PostMethodsResponseOk | ErrorResponse;
export type DeleteMethodResponseOk = PostDidsResponseOk;
export type DeleteMethodResponse = DeleteMethodResponseOk | ErrorResponse;
export type PatchMethodResponseOk = PostDidsResponseOk;
export type PatchMethodResponse = PatchMethodResponseOk | ErrorResponse;

export type PostServicesResponseOk = PostDidsResponseOk;
export type PostServicesResponse = PostServicesResponseOk | ErrorResponse;
export type DeleteServiceResponseOk = PostDidsResponseOk;
export type DeleteServiceResponse = DeleteServiceResponseOk | ErrorResponse;

export type PostVcsResponseOk = PostDidsResponseOk;
export type PostVcsResponse = PostVcsResponseOk | ErrorResponse;
export type DeleteVcResponseOk = PostDidsResponseOk;
export type DeleteVcResponse = DeleteVcResponseOk | ErrorResponse;
export type PostVpResponseOk = Response<{ vp: string }>;
export type PostVpResponse = PostVpResponseOk | ErrorResponse;
