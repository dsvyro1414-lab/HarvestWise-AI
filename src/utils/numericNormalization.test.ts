import { describe, expect, it } from "vitest";
import { normalizeNumericString, parseLocaleNumber } from "./numericNormalization";

describe("numeric normalization", () => {
  it.each([
    ["4.05", 4.05],
    ["4,05", 4.05],
    ["10.2", 10.2],
    ["10,2", 10.2],
    [".125", 0.125],
    [",125", 0.125],
    ["0.125", 0.125],
    ["1,234.56", 1234.56],
    ["1.234,56", 1234.56],
  ])("parses %s as %s", (raw, expected) => {
    expect(parseLocaleNumber(raw)).toBe(expected);
  });

  it("rejects incomplete and ambiguous values instead of returning NaN", () => {
    expect(parseLocaleNumber("4,")).toBeNull();
    expect(parseLocaleNumber("1,234")).toBeNull();
    expect(parseLocaleNumber("1e2")).toBeNull();
    expect(parseLocaleNumber("35 000")).toBeNull();
    expect(parseLocaleNumber("not a number")).toBeNull();
  });

  it("only resolves an ambiguous separator as grouping when the caller opts in", () => {
    expect(normalizeNumericString("35,000", { allowSingleUsGroupingSeparator: true })).toBe("35000");
    expect(normalizeNumericString("35.000", { allowSingleUsGroupingSeparator: true })).toBeNull();
  });
});
