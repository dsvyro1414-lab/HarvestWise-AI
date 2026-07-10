import { describe, expect, it } from "vitest";
import { parseGemmaJson } from "./gemmaJson.js";

describe("parseGemmaJson", () => {
  it("reads a fenced object", () => {
    expect(parseGemmaJson('```json\n{"patch":{"landSizeAcres":2}}\n```')).toEqual({
      patch: { landSizeAcres: 2 },
    });
  });

  it("uses the last complete JSON object when a model emits an extra draft", () => {
    expect(parseGemmaJson('{"operations":[]}\n{"operations":[{"value":20}]}')).toEqual({
      operations: [{ value: 20 }],
    });
  });

  it("does not confuse braces inside strings with object boundaries", () => {
    expect(parseGemmaJson('Result: {"summary":"Use {only} supplied figures"}\nThanks')).toEqual({
      summary: "Use {only} supplied figures",
    });
  });
});
