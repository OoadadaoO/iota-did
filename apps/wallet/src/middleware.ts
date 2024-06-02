import { type NextRequest, NextResponse } from "next/server";

import { sessionToken } from "@/lib/auth/config";
import { decrypt, encrypt } from "@/lib/auth/jwtCrypto";
import { applySetCookie } from "@/lib/utils/applySetCookie";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const routes = pathname.split("/");

  if (pathname.startsWith("/wallets/") && routes.length === 3) {
    return NextResponse.redirect(new URL(`/`, request.nextUrl));
  }
  if (pathname.startsWith("/wallets/") && routes.length <= 5) {
    return NextResponse.redirect(
      new URL(`/wallets/${routes[2]}/accounts/0`, request.nextUrl),
    );
  }

  // refresh JWT session
  const oldJwt = request.cookies.get(sessionToken.cookieName)?.value;
  if (oldJwt) {
    const expires = new Date(Date.now() + sessionToken.expDiff);
    const token = await decrypt(oldJwt);
    if (!token) return Response.redirect(new URL("/", request.url));
    const jwt = await encrypt(token, expires);
    res.cookies.set({
      name: sessionToken.cookieName,
      value: jwt,
      expires,
      ...sessionToken.cookieOptions,
    });
    return res;
  }

  applySetCookie(request, res);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
  missing: [
    { type: "header", key: "next-router-prefetch" },
    { type: "header", key: "purpose", value: "prefetch" },
  ],
};
