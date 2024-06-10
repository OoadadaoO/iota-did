import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { base64url } from "jose";

import { privateEnv } from "../env/private";
import { publicEnv } from "../env/public";
import { parseTimeToMilliSeconds } from "../utils/parseTimeToMilliSeconds";

export const sessionToken: {
  secret: Uint8Array;
  protectedHeader: { alg: string; enc: string };
  expDiff: number;
  cookieName: string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  secret: base64url.decode(privateEnv.AUTH_SECRET),
  protectedHeader: { alg: "dir", enc: "A128CBC-HS256" },
  expDiff: parseTimeToMilliSeconds(privateEnv.AUTH_EXPIRES),
  cookieName:
    privateEnv.NODE_ENV === "production"
      ? `${publicEnv.NEXT_PUBLIC_NAME}_SST`
      : `__Dev.${publicEnv.NEXT_PUBLIC_NAME}_SST`,
  cookieOptions: {
    httpOnly: true,
    secure: publicEnv.NEXT_PUBLIC_BASE_URL.startsWith("https"),
    sameSite: "lax",
  },
};
