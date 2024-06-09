import type { Response, ErrorResponse } from "../types";

export type PostVcResponseOk = Response<{
  vc: {
    jwt: string;
    content: string;
  };
}>;

export type PostVcResponse = PostVcResponseOk | ErrorResponse;
