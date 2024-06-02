import type { ErrorResponse, Response } from "../type.js";

export type PostAuthResponse = Response<true> | ErrorResponse;
