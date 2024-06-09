import { type NextRequest, NextResponse } from "next/server";

import axios from "axios";
import crypto from "crypto";

import { auth } from "@/lib/auth";
import { ConfigDb, DataDb } from "@/lib/db";
import type { MemberCredentialType } from "@/lib/db/type";
import { privateEnv } from "@/lib/env/private";
import { publicEnv } from "@/lib/env/public";
import { Id } from "@/lib/utils/id";
import { decodePermission } from "@/lib/utils/parsePermission";

import type { EPostVcResponse, PostVcResponse } from "./type";
import { postVcSchema } from "./validator";

export const dynamic = "force-dynamic";
export async function POST(
  req: NextRequest,
): Promise<NextResponse<PostVcResponse>> {
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
    const isMember = requesterPermission.admin || requesterPermission.member;
    if (!isMember) {
      return NextResponse.json(
        { error: { code: 401, message: "Have no required permission" } },
        { status: 200 },
      );
    }
    // check vc in db
    const db = await DataDb.getInstance();
    const vc = Object.values(db.data.memberCredentials).find(
      (vc) => vc.userId === session.user.id,
    );
    if (vc) {
      return NextResponse.json({ data: { vc } }, { status: 200 });
    }

    // parse body data
    const zbody = postVcSchema.safeParse(await req.json());
    if (!zbody.success) {
      return NextResponse.json(
        { error: { code: 400, message: "Invalid request body" } },
        { status: 200 },
      );
    }
    const { did: holderDid } = zbody.data;

    // get vc
    const config = (await ConfigDb.getInstance()).data;
    if (!config.issueDid || !config.issueFragment || !config.revokeFragment) {
      return NextResponse.json(
        { error: { code: 500, message: "Invalid config" } },
        { status: 200 },
      );
    }
    const index = crypto.randomBytes(4).readUInt32BE(0);
    const data = {
      issuer: { did: config.issueDid, frag: config.issueFragment },
      credData: {
        id: `${publicEnv.NEXT_PUBLIC_BASE_URL}/credentials/${session.user.id}`,
        type: "GroupMemberCredential",
        issuer: config.issueDid,
        credentialSubject: {
          id: holderDid,
          name: session.user.username,
          groupName: publicEnv.NEXT_PUBLIC_NAME,
        },
      },
      revoke: { frag: config.revokeFragment, index: index.toString() },
    };
    const res = await axios.post<EPostVcResponse>(
      `${privateEnv.IOTA_EXPRESS_URL}/api/iota/vc`,
      data,
    );
    if (res.data.error) {
      return NextResponse.json(res.data, { status: 200 });
    }

    // save vc to db
    const vcData = res.data.data.vc;
    const newVc: MemberCredentialType = {
      id: Id(),
      userId: session.user.id,
      did: holderDid,
      jwt: vcData.jwt,
      content: vcData.content,
      issuerdid: data.issuer.did,
      issuerFragment: data.issuer.frag,
      revokeFragment: data.revoke.frag,
      revokeIndex: index,
    };
    db.update((data) => {
      data.memberCredentials[newVc.id] = newVc;
    });

    return NextResponse.json({ data: { vc: newVc } }, { status: 200 });
  } catch (error) {
    console.error("GET /api/iota/dids", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
