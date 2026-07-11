import { describe, expect, it } from "vitest";
import { createEmptyFarmInput } from "./crops.js";
import { buildLocalGuidedInterview } from "./guidedInterview.js";

describe("guided interview", () => {
  it("asks for exactly the next missing core assumption", () => {
    const empty = createEmptyFarmInput("corn");
    expect(buildLocalGuidedInterview(empty).field).toBe("landSizeAcres");

    const withLand = { ...empty, landSizeAcres: 40 };
    expect(buildLocalGuidedInterview(withLand).field).toBe("availableBudget");
  });

  it("switches to a captured-plan summary when all core inputs are present", () => {
    const complete = {
      ...createEmptyFarmInput("corn"),
      landSizeAcres: 40,
      availableBudget: 35_000,
      expectedHarvestPerAcre: 220,
      marketPricePerUnit: 4.05,
    };

    const guide = buildLocalGuidedInterview(complete);
    expect(guide.field).toBeNull();
    expect(guide.question).toBeNull();
    expect(guide.summary).toContain("40.0 acres");
  });
});
