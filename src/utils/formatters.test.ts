import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatters.js";

describe("U.S. currency formatting", () => {
  it("keeps cents visible for per-unit commodity prices", () => {
    expect(formatCurrency(4.05)).toBe("$4.05");
  });

  it("keeps season-level amounts compact and readable", () => {
    expect(formatCurrency(2440)).toBe("$2,440");
  });
});
