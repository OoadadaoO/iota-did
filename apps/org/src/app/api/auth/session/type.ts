import type { ErrorResponse, Response } from "@/app/api/type";
import type { Session } from "@/lib/auth/type";

export type GetSessionResponse = Response<Session> | ErrorResponse;
