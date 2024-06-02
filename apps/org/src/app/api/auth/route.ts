import { type NextRequest, NextResponse } from "next/server";

import { login } from "@/lib/auth";

import type { PostAuthResponse } from "./type";
import { postAuthSchema } from "./validator";

/**
 * Error:
 *
 * | code | message |
 * | ---- | ------- |
 * | 1002 | Invalid body |
 * | 1011 | Invalid email |
 * | 1012 | Invalid password |
 * | 1013 | Duplicate email |
 * | 1014 | Email Not found |
 * | 1015 | Password Incorrect |
 * | 9999 | Internal server error |
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<PostAuthResponse>> {
  const body = await req.json();
  const zBody = postAuthSchema.safeParse(body);
  if (!zBody.success) {
    return NextResponse.json(
      { error: { code: 1002, message: "Invalid body" } },
      { status: 200 },
    );
  }

  const data = zBody.data;

  if (
    data.email.split("@").length !== 2 ||
    data.email.split("@")[1].split(".").length < 2
  ) {
    return NextResponse.json(
      { error: { code: 1011, message: "Invalid email" } },
      { status: 200 },
    );
  }
  if (data.password.length < 8) {
    return NextResponse.json(
      { error: { code: 1012, message: "Invalid password" } },
      { status: 200 },
    );
  }

  const ret = await login(data);
  if (typeof ret === "number") {
    switch (ret) {
      case 1013:
        return NextResponse.json(
          { error: { code: 1013, message: "Duplicate email" } },
          { status: 200 },
        );
      case 1014:
        return NextResponse.json(
          { error: { code: 1014, message: "Email Not found" } },
          { status: 200 },
        );
      case 1015:
        return NextResponse.json(
          { error: { code: 1015, message: "Password Incorrect" } },
          { status: 200 },
        );
      default:
        return NextResponse.json(
          { error: { code: 9999, message: "Internal server error" } },
          { status: 200 },
        );
    }
  }
  return NextResponse.json({ data: true }, { status: 200 });
}
