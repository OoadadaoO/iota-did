import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { base64url } from "jose";

import { privateEnv } from "../env/private";
import { publicEnv } from "../env/public";
import { parseTimeToMilliSeconds } from "../utils/parseTimeToMilliSeconds";

export const sessionToken: {
  secret: Uint8Array;
  protectedHeader: { alg: string; enc: string };
  expDiff: number;
  baseCookieName: string;
  cookieName: (sub: string) => string;
  cookieOptions: Partial<ResponseCookie>;
} = {
  secret: base64url.decode(privateEnv.PASSWORD_SECRET),
  protectedHeader: { alg: "dir", enc: "A128CBC-HS256" },
  expDiff: parseTimeToMilliSeconds(privateEnv.PASSWORD_EXPIRES),
  baseCookieName: privateEnv.NODE_ENV === "production" ? "WPSD" : "__Dev.WPSD",
  cookieName: (sub: string) =>
    privateEnv.NODE_ENV === "production" ? `WPSD_${sub}` : `__Dev.WPSD_${sub}`,
  cookieOptions: {
    httpOnly: true,
    secure: publicEnv.NEXT_PUBLIC_BASE_URL.startsWith("https://"),
    sameSite: "lax",
  },
};
