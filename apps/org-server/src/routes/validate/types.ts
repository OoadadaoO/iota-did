import type { Response, ErrorResponse } from "../types";

export type PostValidateVcResponseOk = Response<{
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

export type PostValidateVcResponse = PostValidateVcResponseOk | ErrorResponse;

export type PostValidateVpResponseOk = Response<{
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

export type PostValidateVpResponse = PostValidateVpResponseOk | ErrorResponse;
