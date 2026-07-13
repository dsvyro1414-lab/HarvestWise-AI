import { describe, expect, it } from "vitest";
import { extractInterviewLocally, parseScenarioLocally } from "./localParsers.js";
import { createDefaultFarmInput } from "../src/domain/crops.js";

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

  it.each(["4.05", "4,05"])("extracts a market price written as %s", (price) => {
    const result = extractInterviewLocally(`I have 40 acres of corn and can sell at ${price} per bushel.`);

    expect(result.patch.marketPricePerUnit).toBe(4.05);
    expect(result.patch.availableBudget).toBeUndefined();
  });

  it("does not mistake comma-decimal acreage or a nearby price for budget", () => {
    const result = extractInterviewLocally(
      "I have 10,2 acres of corn and can sell at USD 4,05 per bushel.",
    );

    expect(result.patch).toMatchObject({
      landSizeAcres: 10.2,
      marketPricePerUnit: 4.05,
    });
    expect(result.patch.availableBudget).toBeUndefined();
  });

  it("does not mistake cash rent for available cash", () => {
    const result = extractInterviewLocally("Cash rent is $250 for 40 acres of corn.");

    expect(result.patch.landLeaseCostPerAcre).toBe(250);
    expect(result.patch.availableBudget).toBeUndefined();
  });

  it("does not treat an amount before cash rent as available budget", () => {
    const result = extractInterviewLocally("I have $250 cash rent for 40 acres of corn.");

    expect(result.patch.availableBudget).toBeUndefined();
  });

  it.each([
    ["Our 2026 budget is $35,000 for corn.", 35_000],
    ["My budget for 40 acres is $35,000.", 35_000],
    ["I have $35,000 available for corn.", 35_000],
  ])("associates the intended budget in %s", (text, expectedBudget) => {
    expect(extractInterviewLocally(text).patch.availableBudget).toBe(expectedBudget);
  });

  it.each([
    "I have $4.05 per bushel for corn.",
    "I have USD 4,05 per bushel for corn.",
  ])("does not mistake a per-bushel price for budget in %s", (text) => {
    expect(extractInterviewLocally(text).patch.availableBudget).toBeUndefined();
  });

  it("rejects ambiguous grouping for a field that expects a decimal price", () => {
    expect(extractInterviewLocally("Market price is $4,050 per bushel.").patch.marketPricePerUnit).toBeUndefined();
    expect(extractInterviewLocally("Market price is $4,05 per bushel.").patch.marketPricePerUnit).toBe(4.05);
  });

  it.each([
    ["I have 1e2 acres of corn.", "landSizeAcres"],
    ["My budget is $35 000.", "availableBudget"],
    ["Market price is 4e0.", "marketPricePerUnit"],
  ] as const)("rejects an unsupported numeric token in %s", (text, field) => {
    expect(extractInterviewLocally(text).patch[field]).toBeUndefined();
  });

  it("keeps monthly price growth separate from the current market price", () => {
    const growthOnly = extractInterviewLocally("Expected monthly price growth is 2%.");
    const both = extractInterviewLocally(
      "Monthly price growth is 2.5% and market price is $4.05.",
    );

    expect(growthOnly.patch).toMatchObject({ expectedMonthlyPriceGrowth: 0.02 });
    expect(growthOnly.patch.marketPricePerUnit).toBeUndefined();
    expect(both.patch).toMatchObject({
      expectedMonthlyPriceGrowth: 0.025,
      marketPricePerUnit: 4.05,
    });
  });

  it.each([
    ["I have 1/2 acre of corn.", "landSizeAcres"],
    ["My budget is $1/234.", "availableBudget"],
    ["My budget is $1'234.", "availableBudget"],
  ] as const)("rejects a partial slash or apostrophe token in %s", (text, field) => {
    expect(extractInterviewLocally(text).patch[field]).toBeUndefined();
  });

  it("does not guess an ambiguous bare thousands separator", () => {
    const result = extractInterviewLocally("I have a budget of 1,234 for corn.");

    expect(result.patch.availableBudget).toBeUndefined();
  });
});

describe("parseScenarioLocally", () => {
  it.each(["10.2", "10,2"])("extracts a percentage written as %s", (percent) => {
    const result = parseScenarioLocally(
      `fertilizer cost rises by ${percent}%`,
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
  });

  it("uses explicit U.S. currency context for a grouped increase", () => {
    const result = parseScenarioLocally(
      "fertilizer cost rises by $1,234",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increaseBy",
        value: 1234,
      },
    ]);
  });

  it("rejects the same ambiguous grouped increase without currency context", () => {
    const result = parseScenarioLocally(
      "fertilizer cost rises by 1,234",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([]);
  });

  it("does not apply one clause's operation to a field in another clause", () => {
    const result = parseScenarioLocally(
      "fertilizer rises by 10,2%, market price stays the same",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
  });

  it("separates coordinated clauses while preserving a compound subject", () => {
    const input = createDefaultFarmInput("corn");

    expect(
      parseScenarioLocally(
        "fertilizer rises by 10,2% and market price stays the same",
        input,
      ).operations,
    ).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
    expect(
      parseScenarioLocally(
        "market price and fertilizer rise by 10,2%",
        input,
      ).operations,
    ).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value: 10.2,
      },
      {
        field: "marketPricePerUnit",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
  });

  it("does not confuse monthly price growth with the current market price", () => {
    const result = parseScenarioLocally(
      "monthly price growth rises by 10,2%",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "expectedMonthlyPriceGrowth",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
  });

  it("sets a target monthly growth percentage as a decimal rate", () => {
    const result = parseScenarioLocally(
      "monthly price growth rises to 2%",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "expectedMonthlyPriceGrowth",
        operation: "set",
        value: 0.02,
      },
    ]);
    expect(result.patch.expectedMonthlyPriceGrowth).toBe(0.02);
  });

  it("does not leak an amountless second clause's direction into the first", () => {
    const result = parseScenarioLocally(
      "fertilizer rises by 10% and market price drops",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "fertilizerCostPerAcre",
        operation: "increasePercent",
        value: 10,
      },
    ]);
  });

  it("treats cash rent as land lease without also changing budget", () => {
    const result = parseScenarioLocally(
      "cash rent rises by 10,2%",
      createDefaultFarmInput("corn"),
    );

    expect(result.operations).toEqual([
      {
        field: "landLeaseCostPerAcre",
        operation: "increasePercent",
        value: 10.2,
      },
    ]);
  });

  it("rejects ambiguous grouping for a scenario market price", () => {
    const input = createDefaultFarmInput("corn");

    expect(parseScenarioLocally("market price rises to $4,050", input).operations).toEqual([]);
    expect(parseScenarioLocally("market price rises to $4,05", input).operations).toEqual([
      {
        field: "marketPricePerUnit",
        operation: "set",
        value: 4.05,
      },
    ]);
  });

  it.each([
    "fertilizer rises by 1e3",
    "fertilizer rises by $35 000",
    "fertilizer rises by 1/2",
    "fertilizer rises by $1'234",
  ])("rejects an unsupported scenario token in %s", (question) => {
    expect(parseScenarioLocally(question, createDefaultFarmInput("corn")).operations).toEqual([]);
  });
});
