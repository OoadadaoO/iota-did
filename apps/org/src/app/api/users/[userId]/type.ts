import type { UserType } from "@/lib/db/type";

import type { ErrorResponse, Response } from "../../type.js";

export type PatchUserResponse =
  | Response<{ user: Omit<UserType, "hashedPassword"> }>
  | ErrorResponse;
