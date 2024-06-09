import { AccountData } from "@did/iota";
import type { Response, ErrorResponse } from "../../../types";
export type GetAccountsResponseOk = Response<{
    name: string;
    accounts: AccountData[];
}>;
export type GetAccountsResponse = GetAccountsResponseOk | ErrorResponse;
//# sourceMappingURL=types.d.ts.map