import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function signToken(payload: string): string {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const expected = getSecret();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${expires}`;
  const sig = signToken(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [expiresStr, sig] = token.split(".");
  if (!expiresStr || !sig) return false;
  const expectedSig = signToken(expiresStr);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const expires = Number(expiresStr);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (process.env.NODE_ENV === "development" && !process.env.ADMIN_PASSWORD) {
    return true;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function isAdminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) || process.env.NODE_ENV === "development";
}
