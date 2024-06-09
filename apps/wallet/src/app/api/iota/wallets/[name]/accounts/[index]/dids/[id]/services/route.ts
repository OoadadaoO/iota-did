import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { PostServicesResponse } from "./type";
import { postServiceSchema } from "./validator";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
      index: number;
      id: string;
    };
  },
): Promise<NextResponse<PostServicesResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // check body
    const body = await req.json();
    const zbody = postServiceSchema.safeParse(body);
    if (!zbody.success)
      return NextResponse.json(
        { error: { code: 400, message: "Bad request" } },
        { status: 200 },
      );

    // post services
    const res = await iotaAxios.post<PostServicesResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}/services`,
      { ...zbody.data },
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      "POST /api/iota/wallets/[name]/accounts/[index]/dids/[id]/services",
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
