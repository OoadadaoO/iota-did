import type { ConfigSchema } from "@/lib/db/index.js";

import type { ErrorResponse, Response } from "../type.js";

export type PutConfigResponse =
  | Response<{ config: Required<ConfigSchema> }>
  | ErrorResponse;
