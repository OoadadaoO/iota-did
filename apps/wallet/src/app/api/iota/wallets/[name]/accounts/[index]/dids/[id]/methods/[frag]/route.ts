import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { DeleteMethodResponse, PatchMethodResponse } from "./type";
import { patchMethodSchema } from "./validator";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
      index: number;
      id: string;
      frag: string;
    };
  },
): Promise<NextResponse<DeleteMethodResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // delete method
    const res = await iotaAxios.delete<DeleteMethodResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}/methods/${params.frag}`,
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      "DELETE /api/iota/wallets/[name]/accounts/[index]/dids/[id]/methods/[frag]",
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
      index: number;
      id: string;
      frag: string;
    };
  },
): Promise<NextResponse<PatchMethodResponse>> {
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
    const zbody = patchMethodSchema.safeParse(body);
    if (!zbody.success)
      return NextResponse.json(
        { error: { code: 400, message: "Bad request" } },
        { status: 200 },
      );

    // patch method
    const res = await iotaAxios.patch<PatchMethodResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}/methods/${params.frag}`,
      { scope: zbody.data.scope },
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      "PATCH /api/iota/wallets/[name]/accounts/[index]/dids/[id]/methods/[frag]",
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
