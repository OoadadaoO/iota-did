import type { Response, ErrorResponse } from "../types";

export type PostVcResponseOk = Response<{
  vc: {
    jwt: string;
    content: string;
    did: string;
    issuerDid: string;
    issuerFragment: string;
    revokeFragment: string;
    revokeIndex: string;
  };
}>;

export type PostVcResponse = PostVcResponseOk | ErrorResponse;
