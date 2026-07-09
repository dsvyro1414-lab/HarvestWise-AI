import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "./finance";
import { getStoragePriceThreshold } from "./farmerAction";

describe("farm finance model", () => {
  it("calculates a positive baseline plan with a finite break-even price", () => {
    const plan = calculateFarmPlan(createDefaultFarmInput("maize"));

    expect(plan.expectedProfit).toBeGreaterThan(0);
    expect(plan.breakEvenPrice).toBeGreaterThan(0);
    expect(plan.sensitivity).toHaveLength(7);
  });

  it("tells the farmer not to plant an unprofitable season", () => {
    const input = {
      ...createDefaultFarmInput("tomato"),
      marketPricePerUnit: 600,
    };
    const plan = calculateFarmPlan(input);

    expect(plan.expectedProfit).toBeLessThan(0);
    expect(plan.action.id).toBe("do-not-plant");
    expect(plan.action.title).toBe("Do not plant yet");
  });

  it("builds crop and market options for the dashboard", () => {
    const input = createDefaultFarmInput("maize");

    expect(buildCropComparison(input).length).toBeGreaterThan(3);
    expect(buildMarketDecisions(input)).toHaveLength(3);
  });

  it("recommends reducing acreage when a profitable plan exceeds the budget", () => {
    const input = {
      ...createDefaultFarmInput("maize"),
      availableBudget: 100000,
    };

    expect(calculateFarmPlan(input).action.id).toBe("reduce-acreage");
  });

  it("requires a price threshold before storing a viable crop", () => {
    const input = {
      ...createDefaultFarmInput("maize"),
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
      ...createDefaultFarmInput("cassava"),
      availableBudget: 400000,
      storageMonths: 6,
      marketPricePerUnit: 18400,
    };
    const plan = calculateFarmPlan(input);

    expect(plan.expectedProfit).toBeGreaterThan(0);
    expect(plan.riskLevel).toBe("high");
    expect(plan.action.id).toBe("secure-buyer");
  });
});
