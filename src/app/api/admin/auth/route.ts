import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieOptions,
  clearSessionCookieOptions,
  verifyPassword,
  isAdminEnabled,
  isAdminAuthenticated,
} from "@/lib/auth";

export async function GET() {
  const enabled = isAdminEnabled();
  const authenticated = enabled ? await isAdminAuthenticated() : false;
  return NextResponse.json({ enabled, authenticated });
}

export async function POST(request: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "Admin 未启用" }, { status: 503 });
  }
  const { password } = (await request.json()) as { password?: string };
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }
  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookieOptions());
  return response;
}
