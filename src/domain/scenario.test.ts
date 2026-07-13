import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops.js";
import { buildScenarioComparison } from "./scenario.js";
import type { ScenarioParseResult } from "./types.js";

function fertilizerIncrease(value = 20): ScenarioParseResult {
  return {
    operations: [
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value,
      },
    ],
    patch: { fertilizerCostPerAcre: 999_999 },
    changedFields: ["fertilizerCostPerAcre"],
    explanation: "The operation was interpreted; HarvestWise recalculated locally.",
    provider: "local-fallback",
  };
}

describe("buildScenarioComparison", () => {
  it("keeps the canonical input unchanged and calculates finance from typed operations", () => {
    const baseline = createDefaultFarmInput("corn");
    const result = buildScenarioComparison(baseline, fertilizerIncrease());

    expect(result.status).toBe("success");
    expect(baseline.fertilizerCostPerAcre).toBe(210);

    if (result.status === "success") {
      expect(result.scenario.beforeInput).toBe(baseline);
      expect(result.scenario.afterInput.fertilizerCostPerAcre).toBe(252);
      expect(result.scenario.beforePlan.expectedProfit).toBe(2_440);
      expect(result.scenario.afterPlan.expectedProfit).toBe(760);
    }
  });

  it("uses the same canonical baseline for repeated identical scenarios", () => {
    const baseline = createDefaultFarmInput("corn");
    const first = buildScenarioComparison(baseline, fertilizerIncrease());
    const repeated = buildScenarioComparison(baseline, fertilizerIncrease());

    expect(first).toEqual(repeated);
    expect(baseline.fertilizerCostPerAcre).toBe(210);
  });

  it("rejects zero-operation and unchanged scenarios", () => {
    const baseline = createDefaultFarmInput("corn");
    const empty = buildScenarioComparison(baseline, {
      operations: [],
      patch: {},
      changedFields: [],
      explanation: "No scenario changes were detected.",
      provider: "local-fallback",
    });
    const unchanged = buildScenarioComparison(baseline, {
      operations: [
        {
          field: "fertilizerCostPerAcre",
          operation: "set",
          value: baseline.fertilizerCostPerAcre,
        },
      ],
      patch: { fertilizerCostPerAcre: baseline.fertilizerCostPerAcre },
      changedFields: ["fertilizerCostPerAcre"],
      explanation: "The operation was interpreted.",
      provider: "gemma",
    });

    expect(empty).toEqual({ status: "invalid", message: "No scenario changes were detected." });
    expect(unchanged).toEqual({
      status: "invalid",
      message: "That change leaves the current plan unchanged. Try a different value or percentage.",
    });
  });
});
