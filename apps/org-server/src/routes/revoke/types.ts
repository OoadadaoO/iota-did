import type { Response, ErrorResponse } from "../types";

export type RevokeVcResponseOk = Response<Record<string, never>>;

export type RevokeVcResponse = RevokeVcResponseOk | ErrorResponse;
