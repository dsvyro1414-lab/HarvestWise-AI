import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops.js";
import { buildCostDrivers, buildPriceSafety } from "./dashboard.js";
import { calculateFarmPlan } from "./finance.js";

describe("post-plan dashboard data", () => {
  it("classifies narrow, healthy, and below-break-even price buffers", () => {
    const input = createDefaultFarmInput("corn");
    const plan = calculateFarmPlan(input);

    expect(buildPriceSafety(input, plan).state).toBe("watch");

    const safeInput = { ...input, marketPricePerUnit: plan.breakEvenPrice * 1.3 };
    expect(buildPriceSafety(safeInput, calculateFarmPlan(safeInput)).state).toBe("safe");

    const unprofitableInput = { ...input, marketPricePerUnit: plan.breakEvenPrice - 0.01 };
    expect(buildPriceSafety(unprofitableInput, calculateFarmPlan(unprofitableInput)).state).toBe("risk");
  });

  it("ranks every entered cost category and keeps shares tied to season cost", () => {
    const input = createDefaultFarmInput("corn");
    const plan = calculateFarmPlan(input);
    const drivers = buildCostDrivers(input, plan);

    expect(drivers.map((driver) => driver.id)).toHaveLength(6);
    expect(drivers).toEqual([...drivers].sort((left, right) => right.amount - left.amount));
    expect(drivers.reduce((sum, driver) => sum + driver.amount, 0)).toBeCloseTo(plan.totalSeasonCost, 6);
    expect(drivers.reduce((sum, driver) => sum + driver.share, 0)).toBeCloseTo(1, 6);
  });
});
