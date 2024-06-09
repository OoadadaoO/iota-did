import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { GetFaucetResponse } from "./type";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
      index: number;
    };
  },
): Promise<NextResponse<GetFaucetResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // get dids
    const res = await iotaAxios.get<GetFaucetResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/faucet`,
      { headers: { "X-Password": tk.password }, timeout: 60000 },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      `GET /api/iota/wallets/${params.name}/accounts/${params.index}/faucet`,
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
