import { WalletData } from "@did/iota";

import type { Response, ErrorResponse } from "../types";

export type GetWalletsResponseOk = Response<{
  wallets: WalletData[];
}>;
export type GetWalletsResponse = GetWalletsResponseOk | ErrorResponse;
export type Account = {
  name: string;
  index: number;
  address: string;
  balance: string;
};
export type GetAccountsResponseOk = Response<{
  name: string;
  accounts: Account[];
}>;
export type GetAccountsResponse = GetAccountsResponseOk | ErrorResponse;
//# sourceMappingURL=types.d.ts.map
