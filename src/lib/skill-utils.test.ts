import { describe, it, expect } from "vitest";
import { parseMultilineField, joinMultilineField } from "./skill-utils";

describe("skill-utils", () => {
  it("parseMultilineField splits lines", () => {
    expect(parseMultilineField("a\nb\n c ")).toEqual(["a", "b", "c"]);
  });

  it("joinMultilineField joins array", () => {
    expect(joinMultilineField(["a", "b"])).toBe("a\nb");
  });
});
