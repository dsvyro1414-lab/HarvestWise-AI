import { describe, expect, it } from "vitest";
import { extractInterviewLocally } from "./localParsers.js";

describe("extractInterviewLocally", () => {
  it("extracts a U.S. corn plan, including cash rent", () => {
    const result = extractInterviewLocally(
      "I have 40 acres for corn, a $35,000 budget, expect 220 bushels per acre, and can sell at $4.05 per bushel. Seed is $115, fertilizer is $210, fieldwork is $230, and land lease is $250 per acre.",
    );

    expect(result.provider).toBe("local-fallback");
    expect(result.patch).toMatchObject({
      cropId: "corn",
      landSizeAcres: 40,
      availableBudget: 35_000,
      expectedHarvestPerAcre: 220,
      marketPricePerUnit: 4.05,
      seedCostPerAcre: 115,
      fertilizerCostPerAcre: 210,
      laborCostPerAcre: 230,
      landLeaseCostPerAcre: 250,
    });
  });
});
