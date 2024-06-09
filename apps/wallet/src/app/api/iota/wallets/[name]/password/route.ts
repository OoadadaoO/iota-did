import { NextResponse, type NextRequest } from "next/server";

import { login } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";

import type { PostPasswordResponse } from "./type";
import { postPasswordSchema } from "./validator";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
    };
  },
): Promise<NextResponse<PostPasswordResponse>> {
  try {
    // check password
    const body = await req.json();
    const zbody = postPasswordSchema.safeParse(body);
    if (!zbody.success)
      return NextResponse.json(
        { error: { code: 400, message: "Bad request" } },
        { status: 200 },
      );

    // login cookies
    await login({ sub: params.name, password: zbody.data.password });

    // login express
    const res = await iotaAxios.post<PostPasswordResponse>(
      `/api/iota/wallets/${params.name}/password`,
      {},
      { headers: { "X-Password": zbody.data.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(`POST /api/iota/wallets/${params.name}/password`, error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
