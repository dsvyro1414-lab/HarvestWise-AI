import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "./finance";

describe("farm finance model", () => {
  it("calculates a positive baseline plan with a finite break-even price", () => {
    const plan = calculateFarmPlan(createDefaultFarmInput("corn"));

    expect(plan.expectedProfit).toBeGreaterThan(0);
    expect(plan.breakEvenPrice).toBeGreaterThan(0);
    expect(plan.sensitivity).toHaveLength(7);
  });

  it("marks an unprofitable season as high risk or revision-worthy", () => {
    const input = {
      ...createDefaultFarmInput("tomato"),
      marketPricePerUnit: 1.25,
    };
    const plan = calculateFarmPlan(input);

    expect(plan.expectedProfit).toBeLessThan(0);
    expect(plan.bestAction).toBe("Revise costs before planting");
  });

  it("builds crop and market options for the dashboard", () => {
    const input = createDefaultFarmInput("corn");

    expect(buildCropComparison(input).length).toBeGreaterThan(3);
    expect(buildMarketDecisions(input)).toHaveLength(3);
  });
});
