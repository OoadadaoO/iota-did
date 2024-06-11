import { NextResponse, type NextRequest } from "next/server";

import axios from "axios";
import bcrypt from "bcrypt";

import { auth } from "@/lib/auth";
import { DataDb } from "@/lib/db";
import { privateEnv } from "@/lib/env/private";
import { decodePermission } from "@/lib/utils/parsePermission";

import type { PatchUserResponse } from "./type";
import { patchUserSchema } from "./validator";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userId: string;
    };
  },
): Promise<NextResponse<PatchUserResponse>> {
  try {
    // session does not exist
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 401, message: "Please login first." } },
        { status: 200 },
      );
    }

    // parse body
    const body = await req.json();
    const zbody = patchUserSchema.safeParse(body);
    if (!zbody.success) {
      return NextResponse.json(
        { error: { code: 400, message: "Invalid body." } },
        { status: 200 },
      );
    }
    const data = zbody.data;

    // check authorization
    const requesterPermission = decodePermission(session.user.permission);
    const isSelf = params.userId === session.user.id;
    const isAdmin = requesterPermission.admin;
    if (data.permission && !isAdmin) {
      return NextResponse.json(
        { error: { code: 401, message: "Have no required permission" } },
        { status: 200 },
      );
    }
    if ((data.username || data.password) && !(isSelf || isAdmin)) {
      return NextResponse.json(
        { error: { code: 401, message: "Have no required permission" } },
        { status: 200 },
      );
    }

    // patch user
    const db = await DataDb.getInstance();
    const dbUser = db.data.users[params.userId];
    if (!dbUser) {
      return NextResponse.json(
        { error: { code: 404, message: "User not found" } },
        { status: 200 },
      );
    }
    // - username
    if (data.username) {
      dbUser.username = data.username;
    }
    // - password
    if (data.password) {
      const hashedPassword = await bcrypt.hash(
        data.password,
        privateEnv.AUTH_SALT_ROUNDS,
      );
      dbUser.hashedPassword = hashedPassword;
    }
    // - permission
    if (typeof data.permission === "number") {
      const origin = decodePermission(dbUser.permission);
      const update = decodePermission(data.permission);
      if (origin.member !== update.member) {
        // revoke/unrevoke if needed
        const existedCredential = Object.values(db.data.memberCredentials).find(
          (c) => c.userId === dbUser.id,
        );
        if (existedCredential) {
          try {
            await axios.post(`${privateEnv.IOTA_EXPRESS_URL}/api/iota/revoke`, {
              type: update.member ? "unrevoke" : "revoke",
              did: existedCredential.issuerDid,
              frag: existedCredential.revokeFragment,
              index: existedCredential.revokeIndex,
            });
          } catch (error) {
            throw new Error("Failed to revoke/unrevoke credential");
          }
        }
      }
      if (!update.partner) {
        const c = Object.values(db.data.partnerCredentials).find(
          (c) => c.userId === dbUser.id,
        );
        if (c) {
          delete db.data.partnerCredentials[c.id];
        }
      }
      dbUser.permission = data.permission;
    }
    await db.write();

    const newUser = db.data.users[params.userId];
    const resUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      permission: newUser.permission,
    };

    return NextResponse.json({ data: { user: resUser } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
