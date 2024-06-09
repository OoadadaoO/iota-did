import type { MemberCredentialType } from "@/lib/db/type";

import type { ErrorResponse, Response } from "../../type";

export type {
  PostVcResponse as EPostVcResponse,
  PostVcResponseOk as EPostVcResponseOk,
} from "@did/org-server/types";
export type PostVcResponseOk = Response<{ vc: MemberCredentialType }>;
export type PostVcResponse = PostVcResponseOk | ErrorResponse;
