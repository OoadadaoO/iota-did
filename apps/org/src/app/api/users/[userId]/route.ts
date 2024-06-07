import { NextResponse, type NextRequest } from "next/server";

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
    const user = db.data.users[params.userId];
    if (!user) {
      return NextResponse.json(
        { error: { code: 404, message: "User not found" } },
        { status: 200 },
      );
    }
    if (data.username) user.username = data.username;
    if (data.password) {
      const hashedPassword = await bcrypt.hash(
        data.password,
        privateEnv.AUTH_SALT_ROUNDS,
      );
      user.hashedPassword = hashedPassword;
    }
    if (typeof data.permission === "number") user.permission = data.permission;
    await db.write();
    const newUser = db.data.users[params.userId];
    const resUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      permission: newUser.permission,
      did: newUser.did,
    };

    return NextResponse.json({ data: { user: resUser } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 200 },
    );
  }
}
