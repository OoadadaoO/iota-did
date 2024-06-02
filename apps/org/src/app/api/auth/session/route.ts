import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { sessionToken } from "@/lib/auth/config";
import { encrypt } from "@/lib/auth/jwtCrypto";

import type { GetSessionResponse } from "./type";

const { expDiff, cookieName, cookieOptions } = sessionToken;
export async function GET(): Promise<NextResponse<GetSessionResponse>> {
  const session = await auth();
  if (!session || !session.user) {
    cookies().delete(sessionToken.cookieName);
    return NextResponse.json(
      { error: { code: 0, message: session.message } },
      { status: 200 },
    );
  }
  // refresh token
  const expires = new Date(Date.now() + expDiff);
  const jwt = await encrypt(
    { sub: session.user.id, scope: session.user.permission },
    expires,
  );
  cookies().set(cookieName, jwt, {
    expires: expires,
    ...cookieOptions,
  });

  return NextResponse.json({ data: session }, { status: 200 });
}
