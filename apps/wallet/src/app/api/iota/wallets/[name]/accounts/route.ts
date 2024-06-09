import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";

import type { GetAccountsResponse, PostAccountsResponse } from "./type";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
    };
  },
): Promise<NextResponse<GetAccountsResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // get accounts
    const res = await iotaAxios.get<GetAccountsResponse>(
      `/api/iota/wallets/${params.name}/accounts`,
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(`GET /api/iota/wallets/${params.name}/accounts`, error);
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
    };
  },
): Promise<NextResponse<PostAccountsResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // get accounts
    const res = await iotaAxios.post<PostAccountsResponse>(
      `/api/iota/wallets/${params.name}/accounts`,
      {},
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(`POST /api/iota/wallets/${params.name}/accounts`, error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
