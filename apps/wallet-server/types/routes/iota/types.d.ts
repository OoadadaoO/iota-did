import { GetMethodsResult, WalletData } from "@did/iota";
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
export type Service = {
    fragment: string;
    type: string[];
    endpoint: string;
    text: string;
};
export type Did = {
    did: string;
    method: GetMethodsResult;
    service: Service[];
    deactive: boolean;
    document: string;
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
    wallet: WalletData & {
        mnemonic: string;
    };
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
export type GetDidsResponseOk = Response<{
    dids: Did[];
}>;
export type GetDidsResponse = GetDidsResponseOk | ErrorResponse;
export type PostDidsResponseOk = Response<{
    did: Did;
}>;
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
//# sourceMappingURL=types.d.ts.map