import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { DeleteDidResponse, PatchDidResponse } from "./type";
import { patchDidSchema } from "./validator";

export async function PATCH(
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
): Promise<NextResponse<PatchDidResponse>> {
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
    const zbody = patchDidSchema.safeParse(body);
    if (!zbody.success)
      return NextResponse.json(
        { error: { code: 400, message: "Bad request" } },
        { status: 200 },
      );

    // patch dids
    const res = await iotaAxios.patch<PatchDidResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}`,
      { deactivate: zbody.data.deactivate },
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      `PATCH /api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}`,
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}

export async function DELETE(
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
): Promise<NextResponse<DeleteDidResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // patch dids
    const res = await iotaAxios.delete<DeleteDidResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}`,
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      `DELETE /api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}`,
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
