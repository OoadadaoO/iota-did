import { WalletData } from "@did/iota";

import type { Response, ErrorResponse } from "../../types";

export type GetWalletsResponseOk = Response<{
  wallets: WalletData[];
}>;
export type GetWalletsResponse = GetWalletsResponseOk | ErrorResponse;
//# sourceMappingURL=types.d.ts.map
