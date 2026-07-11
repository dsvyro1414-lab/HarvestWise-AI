import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops.js";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "./finance.js";
import { getStoragePriceThreshold } from "./farmerAction.js";

describe("farm finance model", () => {
  it("calculates a positive baseline plan with a finite break-even price", () => {
    const plan = calculateFarmPlan(createDefaultFarmInput("corn"));

    expect(plan.expectedProfit).toBeGreaterThan(0);
    expect(plan.breakEvenPrice).toBeGreaterThan(0);
    expect(plan.sensitivity).toHaveLength(7);
  });

  it("includes land lease in season cost instead of treating field access as free", () => {
    const input = createDefaultFarmInput("corn");
    const withoutLease = calculateFarmPlan({ ...input, landLeaseCostPerAcre: 0 });
    const withLease = calculateFarmPlan(input);

    expect(withLease.totalSeasonCost - withoutLease.totalSeasonCost).toBe(
      input.landSizeAcres * input.landLeaseCostPerAcre,
    );
  });

  it("tells the farmer not to plant an unprofitable season", () => {
    const input = {
      ...createDefaultFarmInput("wheat"),
      marketPricePerUnit: 4,
    };
    const plan = calculateFarmPlan(input);

    expect(plan.expectedProfit).toBeLessThan(0);
    expect(plan.action.id).toBe("do-not-plant");
    expect(plan.action.title).toBe("Do not plant yet");
  });

  it("builds crop and market options for the dashboard", () => {
    const input = createDefaultFarmInput("corn");

    expect(buildCropComparison(input)).toHaveLength(3);
    expect(buildMarketDecisions(input)).toHaveLength(3);
  });

  it("recommends reducing acreage when a profitable plan exceeds the budget", () => {
    const input = {
      ...createDefaultFarmInput("corn"),
      availableBudget: 1_000,
    };

    expect(calculateFarmPlan(input).action.id).toBe("reduce-acreage");
  });

  it("requires a price threshold before storing a viable crop", () => {
    const input = {
      ...createDefaultFarmInput("corn"),
      storageMonths: 2,
    };
    const plan = calculateFarmPlan(input);
    const threshold = getStoragePriceThreshold(input, plan);
    const harvestAfterLoss = plan.expectedHarvest * (1 - plan.crop.storageLossRatePerMonth * input.storageMonths);
    const expectedThreshold =
      (plan.expectedHarvest * input.marketPricePerUnit + input.storageMonths * input.storageCostPerMonth) /
      harvestAfterLoss;

    expect(plan.action.id).toBe("store-if-price");
    expect(threshold).toBeCloseTo(expectedThreshold, 6);
    expect(plan.action.priceThreshold).toBeCloseTo(expectedThreshold, 6);
    expect(threshold).toBeGreaterThan(input.marketPricePerUnit);
  });

  it("asks for a buyer before planting a high-risk but profitable plan", () => {
    const input = {
      ...createDefaultFarmInput("corn"),
      availableBudget: 35_000,
      storageMonths: 12,
      marketPricePerUnit: 4.2,
    };
    const plan = calculateFarmPlan(input);

    expect(plan.expectedProfit).toBeGreaterThan(0);
    expect(plan.riskLevel).toBe("high");
    expect(plan.action.id).toBe("secure-buyer");
  });
});
