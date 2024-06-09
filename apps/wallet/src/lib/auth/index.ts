import { cookies } from "next/headers";

import type { JWTPayload } from "jose";

import { sessionToken } from "./config";
import { decrypt, encrypt } from "./jwtCrypto";
import type { Token } from "./types";

const { expDiff, cookieName, cookieOptions } = sessionToken;

/**
 * token
 */
export async function token(
  sub: string,
): Promise<(Token & JWTPayload) | undefined> {
  // get jwt/token from cookie
  const { jwt, token } = await getToken(sub);
  if (!token || !jwt) return undefined;
  return token;
}

export async function login(params: Token) {
  try {
    // refresh token
    const expires = new Date(Date.now() + expDiff);
    const jwt = await encrypt({ ...params }, expires);
    cookies().set(cookieName(params.sub), jwt, {
      expires: expires,
      ...cookieOptions,
    });
  } catch (error) {
    console.error(error);
    return;
  }
}

export async function logout(sub: string) {
  // get jwt/token from cookie
  const { token } = await getToken(sub);
  if (!token) return;

  // remove jwt from cookie
  cookies().delete(cookieName(sub));
}

async function getToken(
  sub: string,
): Promise<{ jwt: string | null; token: Token | null }> {
  const jwt = cookies().get(cookieName(sub))?.value;
  if (!jwt) return { jwt: null, token: null };
  const token = await decrypt(jwt);
  if (!token || !token.sub) return { jwt: null, token: null };
  return { jwt, token };
}
