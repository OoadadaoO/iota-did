import { NextResponse } from "next/server";

import axios from "axios";

import { auth } from "@/lib/auth";
import { privateEnv } from "@/lib/env/private";
import { decodePermission } from "@/lib/utils/parsePermission";

import type { GetDIDsResponse } from "./type";

export const dynamic = "force-dynamic";
export async function GET(): Promise<NextResponse<GetDIDsResponse>> {
  try {
    // session does not exist
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 401, message: "Please login first." } },
        { status: 200 },
      );
    }
    // check authorization
    const requesterPermission = decodePermission(session.user.permission);
    const isAdmin = requesterPermission.admin;
    if (!isAdmin) {
      return NextResponse.json(
        { error: { code: 401, message: "Have no required permission" } },
        { status: 200 },
      );
    }

    // get dids
    const res = await axios.get<GetDIDsResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/dids`,
    );

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("GET /api/iota/dids", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
