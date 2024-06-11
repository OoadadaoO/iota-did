import { NextResponse, type NextRequest } from "next/server";

import { DataDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  },
) {
  const db = await DataDb.getInstance();
  const credential = db.data.memberCredentials[params.id];
  if (!credential) {
    return NextResponse.json(
      { error: { code: 404, message: "Credential not found" } },
      { status: 200 },
    );
  }
  return NextResponse.json(
    { ...JSON.parse(credential.content), jwt: credential.jwt },
    { status: 200 },
  );
}
