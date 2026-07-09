import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops";
import { applyFarmPlanPatch, applyScenarioOperations } from "./patches";

describe("farm plan patches", () => {
  it("applies extracted interview fields without changing unspecified values", () => {
    const input = createDefaultFarmInput("corn");
    const next = applyFarmPlanPatch(input, {
      cropId: "soybeans",
      landSizeAcres: 3,
      availableBudget: 450000,
    });

    expect(next.cropId).toBe("soybeans");
    expect(next.landSizeAcres).toBe(3);
    expect(next.availableBudget).toBe(450000);
    expect(next.marketPricePerUnit).toBe(input.marketPricePerUnit);
  });

  it("turns scenario operations into deterministic parameter patches", () => {
    const input = createDefaultFarmInput("corn");
    const patch = applyScenarioOperations(input, [
      { field: "fertilizerCostPerAcre", operation: "increasePercent", value: 20 },
      { field: "storageMonths", operation: "set", value: 2 },
    ]);

    expect(patch.fertilizerCostPerAcre).toBe(252);
    expect(patch.storageMonths).toBe(2);
  });
});
