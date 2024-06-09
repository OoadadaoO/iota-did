import type { GetClassifiedMethodsResultBase } from "@did/iota";
import type { Response, ErrorResponse } from "../../types";
export type GetDIDsResponseOk = Response<{
    dids: {
        did: string;
        method: GetClassifiedMethodsResultBase<string>;
        service: {
            fragment: string;
            type: string[];
        }[];
    }[];
}>;
export type GetDIDsResponse = GetDIDsResponseOk | ErrorResponse;
//# sourceMappingURL=types.d.ts.map