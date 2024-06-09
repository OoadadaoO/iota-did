import { NextResponse, type NextRequest } from "next/server";

import { token } from "@/lib/auth";
import { iotaAxios } from "@/lib/axios/iotaAxios";
import { privateEnv } from "@/lib/env/private";

import type { DeleteServiceResponse } from "./type";

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
): Promise<NextResponse<DeleteServiceResponse>> {
  try {
    // check cookies
    const tk = await token(params.name);
    if (!tk)
      return NextResponse.json(
        { error: { code: 401, message: "Password is required" } },
        { status: 200 },
      );

    // delete method
    const res = await iotaAxios.delete<DeleteServiceResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets/${params.name}/accounts/${params.index}/dids/${params.id}/services/${params.frag}`,
      { headers: { "X-Password": tk.password } },
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error(
      "DELETE /api/iota/wallets/[name]/accounts/[index]/dids/[id]/services/[frag]",
      error,
    );
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
