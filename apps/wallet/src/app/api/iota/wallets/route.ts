import { type NextRequest, NextResponse } from "next/server";

import axios from "axios";

import { login } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { GetWalletsResponse } from "./type";
import { postWalletSchema } from "./validator";

export const dynamic = "force-dynamic";
export async function GET(): Promise<NextResponse<GetWalletsResponse>> {
  try {
    // get wallets
    const res = await axios.get<GetWalletsResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets`,
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("GET /api/iota/wallets", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
export async function POST(
  req: NextRequest,
): Promise<NextResponse<GetWalletsResponse>> {
  try {
    // check password
    const body = await req.json();
    const zbody = postWalletSchema.safeParse(body);
    if (!zbody.success)
      return NextResponse.json(
        { error: { code: 400, message: "Bad request" } },
        { status: 200 },
      );

    // login cookies
    await login({ sub: zbody.data.name, password: zbody.data.password });

    // get wallets
    const res = await iotaAxios.post<GetWalletsResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets`,
      {
        name: zbody.data.name,
        password: zbody.data.password,
        mnemonic: zbody.data.mnemonic,
      },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("POST /api/iota/wallets", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
