import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops.js";
import { applyFarmPlanPatch, applyScenarioOperations } from "./patches.js";

describe("farm plan patches", () => {
  it("applies extracted interview fields without changing unspecified values", () => {
    const input = createDefaultFarmInput("maize");
    const next = applyFarmPlanPatch(input, {
      cropId: "cassava",
      landSizeAcres: 3,
      availableBudget: 450000,
    });

    expect(next.cropId).toBe("cassava");
    expect(next.landSizeAcres).toBe(3);
    expect(next.availableBudget).toBe(450000);
    expect(next.marketPricePerUnit).toBe(input.marketPricePerUnit);
  });

  it("turns scenario operations into deterministic parameter patches", () => {
    const input = createDefaultFarmInput("maize");
    const patch = applyScenarioOperations(input, [
      { field: "fertilizerCostPerAcre", operation: "increasePercent", value: 20 },
      { field: "storageMonths", operation: "set", value: 2 },
    ]);

    expect(patch.fertilizerCostPerAcre).toBe(78000);
    expect(patch.storageMonths).toBe(2);
  });
});
