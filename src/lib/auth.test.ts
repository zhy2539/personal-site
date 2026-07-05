import { describe, it, expect, afterEach } from "vitest";
import {
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from "./auth";

describe("auth", () => {
  const originalEnv = process.env.ADMIN_PASSWORD;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ADMIN_PASSWORD = originalEnv;
    } else {
      delete process.env.ADMIN_PASSWORD;
    }
  });

  it("verifyPassword returns true for correct password", () => {
    process.env.ADMIN_PASSWORD = "test-secret";
    expect(verifyPassword("test-secret")).toBe(true);
  });

  it("verifyPassword returns false for wrong password", () => {
    process.env.ADMIN_PASSWORD = "test-secret";
    expect(verifyPassword("wrong")).toBe(false);
  });

  it("session token roundtrip", () => {
    process.env.ADMIN_PASSWORD = "test-secret";
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
  });

  it("rejects tampered token", () => {
    process.env.ADMIN_PASSWORD = "test-secret";
    const token = createSessionToken();
    expect(verifySessionToken(token + "x")).toBe(false);
  });
});
