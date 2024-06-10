import { type NextRequest, NextResponse } from "next/server";

import axios from "axios";

import { auth } from "@/lib/auth";
import { ConfigDb, DataDb } from "@/lib/db";
import type { PartnerCredentialType } from "@/lib/db/type";
import { privateEnv } from "@/lib/env/private";
import { Id } from "@/lib/utils/id";
import {
  decodePermission,
  encodePermission,
} from "@/lib/utils/parsePermission";
import { parseTimeToMilliSeconds } from "@/lib/utils/parseTimeToMilliSeconds";

import type { PostValidateVpResponse } from "./type";
import { postValidateVcSchema } from "./validator";

export const dynamic = "force-dynamic";
export async function POST(
  req: NextRequest,
): Promise<NextResponse<PostValidateVpResponse>> {
  try {
    // session does not exist
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 401, message: "Please login first." } },
        { status: 200 },
      );
    }

    // parse body data
    const zbody = postValidateVcSchema.safeParse(await req.json());
    if (!zbody.success) {
      return NextResponse.json(
        { error: { code: 400, message: "Invalid request body" } },
        { status: 200 },
      );
    }

    // validate vp(jwt)
    const res = await axios.post<PostValidateVpResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/validate/vp`,
      { ...zbody.data },
    );
    if (res.data.error) {
      return NextResponse.json(res.data, { status: 200 });
    }

    // check allow list
    const vcData = res.data.data.vc;
    const configDb = await ConfigDb.getInstance();
    const allowList = configDb.data.allowedIssuers;
    const issuer = allowList.find((issuer) => issuer.did === vcData.issuerDid);
    if (!issuer) {
      return NextResponse.json(
        { error: { code: 401, message: "Unauthorized issuer" } },
        { status: 200 },
      );
    }

    // save vc to db
    const db = await DataDb.getInstance();
    const newVc: PartnerCredentialType = {
      id: Id(),
      userId: session.user.id,
      ...vcData,
      expiredAt: new Date(
        Date.now() + parseTimeToMilliSeconds(privateEnv.VC_REVALIDATE_TIME),
      ).toISOString(),
    };
    db.update((data) => {
      data.partnerCredentials[newVc.id] = newVc;
      const permission = decodePermission(session.user.permission);
      const nwePermission = encodePermission({ ...permission, partner: true });
      data.users[session.user.id].permission = nwePermission;
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("POST /api/iota/dids", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
