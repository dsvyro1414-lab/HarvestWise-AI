import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "./crops.js";
import { buildActionPack } from "./actionPack.js";
import { calculateFarmPlan } from "./finance.js";

describe("deterministic action pack", () => {
  it("contains the five local verification areas and three practical steps", () => {
    const input = createDefaultFarmInput("corn");
    const plan = calculateFarmPlan(input);
    const pack = buildActionPack(input, plan);

    expect(pack.recommendation).toEqual(plan.action);
    expect(pack.checks.map((check) => check.id).sort()).toEqual([
      "buyer-price",
      "input-quotes",
      "lease",
      "timing",
      "yield-history",
    ]);
    expect(pack.nextSteps).toHaveLength(3);
  });

  it("elevates a tight price assumption for verification", () => {
    const input = createDefaultFarmInput("corn");
    const plan = calculateFarmPlan(input);
    const pack = buildActionPack(input, plan);

    expect(pack.checks[0]).toMatchObject({ id: "buyer-price", priority: "urgent" });
  });
});
