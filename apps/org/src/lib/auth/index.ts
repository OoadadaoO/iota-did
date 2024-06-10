import { cookies } from "next/headers";

import axios from "axios";
import bcrypt from "bcrypt";
import type { JWTPayload } from "jose";

import type { PostValidateVcResponse } from "@did/org-server/types";

import { DataDb } from "../db";
import type { UserType } from "../db/type";
import { privateEnv } from "../env/private";
import { Id } from "../utils/id";
import { decodePermission, encodePermission } from "../utils/parsePermission";
import { parseTimeToMilliSeconds } from "../utils/parseTimeToMilliSeconds";
import { sessionToken } from "./config";
import { decrypt, encrypt } from "./jwtCrypto";
import type { Session, Token } from "./type";

const { expDiff, cookieName, cookieOptions } = sessionToken;

/**
 * for server side rendering & route handler (api)
 */
export async function auth(): Promise<Session> {
  // get jwt/token from cookie
  const { jwt, token } = await getToken();
  if (!token || !jwt) return { message: "Invalid token" };

  // validate & create session
  return await getSession({ token });
}

/**
 * lightweight token-based auth()
 */
export async function token(): Promise<Token | undefined> {
  // get jwt/token from cookie
  const { jwt, token } = await getToken();
  if (!token || !jwt) return undefined;
  return token;
}

type LoginParams = {
  email: string;
  password: string;
  type: "signup" | "login";
};

export async function login(params: LoginParams) {
  try {
    let user: UserType;
    const db = await DataDb.getInstance();
    if (params.type === "signup") {
      const id = Id();
      const hashedPassword = await bcrypt.hash(
        params.password,
        privateEnv.AUTH_SALT_ROUNDS,
      );
      user = {
        id,
        username: params.email.split("@")[0],
        email: params.email,
        hashedPassword,
        permission: 0,
      };
      const existedUser = Object.values(db.data.users).find(
        (u) => u.email === user.email,
      );
      if (existedUser) return 1013;
      db.data.users[id] = user;
      await db.write();
    } else {
      const existedUser = Object.values(db.data.users).find(
        (u) => u.email === params.email,
      );
      if (!existedUser) return 1014;
      const match = await bcrypt.compare(
        params.password,
        existedUser.hashedPassword,
      );
      if (!match) return 1015;
      user = existedUser;
    }
    // TODO: find credential of user and validate credential
    if (decodePermission(user.permission).partner) {
      //
    }
    // TODO END

    // refresh token
    const expires = new Date(Date.now() + expDiff);
    const jwt = await encrypt(
      { sub: user.id, scope: user.permission },
      expires,
    );
    cookies().set(cookieName, jwt, {
      expires: expires,
      ...cookieOptions,
    });
    return;
  } catch (error) {
    console.error(error);
    return 9999;
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
}): Promise<Session> {
  const { sub, exp } = token;
  if (!sub || !exp) return { message: "Invalid token" };

  // find user by id(sub)
  const db = await DataDb.getInstance();
  let existedUser = db.data.users[sub];
  if (!existedUser) return { message: "User not found" };

  // check partner permission validity
  const permission = decodePermission(existedUser.permission);
  if (permission.partner) {
    const credential = Object.values(db.data.partnerCredentials).find(
      (c) => c.userId === existedUser.id,
    );
    // credential removed & scheduled re-validation
    if (!credential) {
      const newPermission = encodePermission({ ...permission, partner: false });
      await db.update((data) => {
        data.users[sub].permission = newPermission;
      });
    } else if (new Date(credential.expiredAt) < new Date()) {
      // re-validate credential
      const res = await axios.post<PostValidateVcResponse>(
        `${privateEnv.IOTA_EXPRESS_URL}/api/iota/validate/vc`,
        { jwt: credential.jwt },
      );
      if (res.data.error) {
        // invalid => update permission & remove credential
        const newPermission = encodePermission({
          ...permission,
          partner: false,
        });
        await db.update((data) => {
          data.users[sub].permission = newPermission;
          delete data.partnerCredentials[credential.id];
        });
      } else {
        // valid => update expiredAt
        const newExpiredAt = new Date(
          Date.now() + parseTimeToMilliSeconds(privateEnv.VC_REVALIDATE_TIME),
        ).toISOString();
        await db.update((data) => {
          data.partnerCredentials[credential.id].expiredAt = newExpiredAt;
        });
      }
    }
  }
  existedUser = db.data.users[sub];

  return {
    user: {
      id: existedUser.id,
      username: existedUser.username,
      email: existedUser.email,
      permission: existedUser.permission,
    },
    expires: new Date(exp * 1000),
  };
}
