import { describe, expect, it } from "vitest";
import { getAdviceLoadingStatus } from "./adviceProgress.js";

describe("advisor loading progress", () => {
  it("moves from a starting state to a clear long-wait message", () => {
    expect(getAdviceLoadingStatus(0).message).toBe("Gemma is starting your explanation…");
    expect(getAdviceLoadingStatus(4).message).toBe("Gemma is working on a farmer-friendly answer…");
    expect(getAdviceLoadingStatus(12).message).toBe("Still working — detailed AI replies can take a little longer.");
    expect(getAdviceLoadingStatus(20).message).toBe(
      "Still connected. Keep this page open — your answer will appear here.",
    );
  });
});
