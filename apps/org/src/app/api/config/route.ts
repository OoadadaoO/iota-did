import { NextResponse, type NextRequest } from "next/server";

import axios from "axios";

import { auth } from "@/lib/auth";
import { ConfigDb } from "@/lib/db";
import { privateEnv } from "@/lib/env/private";
import { decodePermission } from "@/lib/utils/parsePermission";
import type { GetDIDsResponse } from "@did/org-server/types";

import type { PutConfigResponse } from "./type";
import { putConfigSchema } from "./validator";

export async function PUT(
  req: NextRequest,
): Promise<NextResponse<PutConfigResponse>> {
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

    // parse body
    const body = await req.json();
    const zbody = putConfigSchema.safeParse(body);
    if (!zbody.success) {
      return NextResponse.json(
        { error: { code: 400, message: "Invalid body." } },
        { status: 200 },
      );
    }
    const newData = zbody.data;

    const db = await ConfigDb.getInstance();
    // get dids
    if (
      newData.issuerDid !== db.data.issuerDid ||
      newData.issuerFragment !== db.data.issuerFragment ||
      newData.revokeFragment !== db.data.revokeFragment
    ) {
      const res = await axios.get<GetDIDsResponse>(
        `${privateEnv.IOTA_EXPRESS_URL}/api/iota/dids`,
      );
      if (res.data.error) {
        return NextResponse.json(res.data, { status: 200 });
      }
      const dids = res.data.data.dids;
      const did = dids.find((d) => d.did === newData.issuerDid);
      if (
        !did ||
        !did.method.assertion.includes(newData.issuerFragment) ||
        !did.service.some((s) => s.fragment === newData.revokeFragment)
      ) {
        return NextResponse.json(
          { error: { code: 400, message: "Invalid Body" } },
          { status: 200 },
        );
      }
    }

    // put config
    await db.update((data) => {
      data.issuerDid = newData.issuerDid;
      data.issuerFragment = newData.issuerFragment;
      data.revokeFragment = newData.revokeFragment;
      data.allowedIssuers = newData.allowedIssuers;
    });

    return NextResponse.json({ data: { config: db.data } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
