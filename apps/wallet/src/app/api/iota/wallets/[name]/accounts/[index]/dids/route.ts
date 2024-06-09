import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { GetDidsResponse, PostDidsResponse } from "./type";

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
): Promise<NextResponse<GetDidsResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // get dids
    const res = await iotaAxios.get<GetDidsResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids`,
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      `GET /api/iota/wallets/${params.name}/accounts/${params.index}/dids`,
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
      index: number;
    };
  },
): Promise<NextResponse<PostDidsResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // get dids
    const res = await iotaAxios.post<PostDidsResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids`,
      {},
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("POST /api/iota/wallets/[name]/accounts/[index]/dids", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
