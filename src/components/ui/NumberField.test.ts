import { describe, expect, it } from "vitest";
import {
  getNumberFieldAriaValue,
  parseNumberFieldInput,
  validateNumberFieldInput,
} from "./NumberField";

describe("parseNumberFieldInput", () => {
  it.each([
    ["4.05", 4.05],
    ["4,05", 4.05],
    ["10.2", 10.2],
    ["10,2", 10.2],
  ])("parses direct input %s as %s", (raw, expected) => {
    expect(parseNumberFieldInput(raw)).toBe(expected);
  });

  it("maps an empty field to zero and leaves incomplete input unstored", () => {
    expect(parseNumberFieldInput("")).toBe(0);
    expect(parseNumberFieldInput("4,")).toBeNull();
    expect(Number.isNaN(parseNumberFieldInput("4,"))).toBe(false);
  });
});

describe("validateNumberFieldInput", () => {
  it("enforces configured minimum and maximum values", () => {
    expect(validateNumberFieldInput("-1", 0, 6)).toEqual({
      value: null,
      error: "Enter 0 or more.",
    });
    expect(validateNumberFieldInput("7", 0, 6)).toEqual({
      value: null,
      error: "Enter 6 or less.",
    });
    expect(validateNumberFieldInput("4,5", 0, 6)).toEqual({ value: 4.5, error: null });
  });

  it("rejects unsupported pasted formats without producing NaN", () => {
    expect(validateNumberFieldInput("1e2")).toMatchObject({ value: null });
    expect(validateNumberFieldInput("35 000")).toMatchObject({ value: null });
  });

  it("only exposes an in-range value through aria-valuenow", () => {
    expect(getNumberFieldAriaValue("4,5", 0, 6)).toBe(4.5);
    expect(getNumberFieldAriaValue("7", 0, 6)).toBeUndefined();
    expect(getNumberFieldAriaValue("-1", 0, 6)).toBeUndefined();
    expect(getNumberFieldAriaValue("", 0, 6)).toBeUndefined();
  });
});
