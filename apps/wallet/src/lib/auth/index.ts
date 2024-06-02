import { cookies } from "next/headers";

import type { JWTPayload } from "jose";

import type { UserType } from "../db/type";
import { decodePermission } from "../utils/decodePermission";
import { sessionToken } from "./config";
import { decrypt, encrypt } from "./jwtCrypto";
import type { Session, Token } from "./types";

const { expDiff, cookieName, cookieOptions } = sessionToken;

/**
 * for server side rendering & route handler (api)
 */
export async function auth(): Promise<Session> {
  /* For production */
  // get jwt/token from cookie
  const { jwt, token } = await getToken();
  if (!token || !jwt) return { message: "Invalid token" };

  // validate & create session
  const session = await getSession({ token });
  return typeof session === "string" ? { message: session } : session;

  // // refresh jwt
  // const jwt = await encrypt(token);
  // if (!jwt) return null;

  /* For testing */
  // identifier;
  // return {
  //   user: { id: "1", username: "adada", permission: 0 },
  //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  // };
}

type LoginParams = {
  username: string;
  hashedPassword: string;
};

export async function login(params: LoginParams) {
  try {
    // TODO: check user exist, hashed password match
    const user: UserType = {
      id: "kassjdlfkjsflkjdskfjsldf",
      username: params.username,
      hashedPassword: params.hashedPassword,
      permission: 1,
      did: "did:iota:tst:0xab5bf3ebd5335c9a113cb3e692764aa8d112121c3915a15d18073ab68dfc5de0",
    };
    // TODO END
    // TODO: find credential of user and validate credential
    if (decodePermission(user.permission).partner) {
      //
    }
    // TODO END

    // refresh token
    const expires = new Date(Date.now() + expDiff);
    const jwt = await encrypt({ sub: user.id }, expires);
    cookies().set(cookieName, jwt, {
      expires: expires,
      ...cookieOptions,
    });
  } catch (error) {
    console.error(error);
    return;
  }
}

export async function logout() {
  // get jwt/token from cookie
  const { token } = await getToken();
  if (!token) return;

  // remove jwt from cookie
  cookies().delete(cookieName);
}

async function getToken() {
  const jwt = cookies().get(cookieName)?.value;
  if (!jwt) return { jwt: null, token: null };
  const token = await decrypt(jwt);
  if (!token || !token.sub) return { jwt: null, token: null };
  return { jwt, token };
}

export async function getSession({
  token,
}: {
  token: Token & JWTPayload;
}): Promise<Session | string> {
  const { sub, exp } = token;
  if (!sub || !exp) return "Invalid token";

  // TODO: find user by id(sub)
  const existedUser: UserType = {
    id: sub,
    username: "username",
    hashedPassword: "hashedPassword",
    permission: 1,
    did: "did:iota:tst:0xab5bf3ebd5335c9a113cb3e692764aa8d112121c3915a15d18073ab68dfc5de0",
  };
  if (!existedUser) return "User not found";
  // TODO END

  return {
    user: {
      id: existedUser.id,
      username: existedUser.username,
      permission: existedUser.permission,
      did: existedUser.did,
    },
    expires: new Date(exp * 1000),
  };
}
