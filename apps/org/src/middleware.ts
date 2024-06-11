import { type NextRequest, NextResponse } from "next/server";

import { sessionToken } from "@/lib/auth/config";
import { decrypt, encrypt } from "@/lib/auth/jwtCrypto";
import { applySetCookie } from "@/lib/utils/applySetCookie";

import { decodePermission } from "./lib/utils/parsePermission";

const authMatch = /^\/auth\/.*$/;
const adminForbid: RegExp[] = [];
const memberForbid: RegExp[] = [/^\/admin\/.*$/];
const partnerForbid: RegExp[] = [/^\/(admin|private)\/.*$/];
const normalForbid: RegExp[] = [/^\/(admin|private|shared)\/.*$/];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  let permission = 0;
  // refresh JWT session
  const oldJwt = request.cookies.get(sessionToken.cookieName)?.value;
  if (oldJwt) {
    // redirect to home page if on login & signup page
    if (authMatch.test(pathname))
      return NextResponse.redirect(
        new URL(searchParams.get("redirect") || "/", request.url),
      );

    // refresh JWT
    const expires = new Date(Date.now() + sessionToken.expDiff);
    const token = await decrypt(oldJwt);
    if (!token) return NextResponse.redirect(new URL("/", request.url));
    const jwt = await encrypt(token, expires);
    res.cookies.set({
      name: sessionToken.cookieName,
      value: jwt,
      expires,
      ...sessionToken.cookieOptions,
    });

    // get permission
    permission = token.scope;
  }

  // route protection by permission
  const auth = decodePermission(permission);
  const reherf = "/";
  if (auth.admin) {
    if (adminForbid.some((r) => r.test(pathname)))
      return NextResponse.redirect(new URL(reherf, request.url));
  } else if (auth.member) {
    if (memberForbid.some((r) => r.test(pathname)))
      return NextResponse.redirect(new URL(reherf, request.url));
  } else if (auth.partner) {
    if (partnerForbid.some((r) => r.test(pathname)))
      return NextResponse.redirect(new URL(reherf, request.url));
  } else {
    if (normalForbid.some((r) => r.test(pathname)))
      return NextResponse.redirect(new URL(reherf, request.url));
  }

  applySetCookie(request, res);

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*[/]favicon.ico|.*\\.png$).*)"],
  missing: [
    { type: "header", key: "next-router-prefetch" },
    { type: "header", key: "purpose", value: "prefetch" },
  ],
};
