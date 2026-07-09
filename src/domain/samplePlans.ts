import { createDefaultFarmInput } from "./crops";
import type { MarketContext, SamplePlan } from "./types";

export const marketContext: MarketContext = {
  region: "Iowa, United States",
  sourceLabel: "USDA/NASS demo baseline",
  confidence: "Medium",
  updatedDate: "Jul 9, 2026",
};

export const samplePlans: SamplePlan[] = [
  {
    id: "balanced",
    name: "Balanced",
    summary: "Corn baseline with a modest margin above break-even.",
    input: createDefaultFarmInput("corn"),
  },
  {
    id: "risky",
    name: "Risky",
    summary: "Soybeans with soft prices, storage risk, and a tight budget.",
    input: {
      ...createDefaultFarmInput("soybeans"),
      landSizeAcres: 140,
      availableBudget: 65000,
      seedCostPerAcre: 82,
      fertilizerCostPerAcre: 82,
      laborCostPerAcre: 390,
      expectedHarvestPerAcre: 54,
      marketPricePerUnit: 10.85,
      transportCost: 2300,
      storageMonths: 2,
      storageCostPerMonth: 850,
      expectedMonthlyPriceGrowth: 0.01,
    },
  },
  {
    id: "lossMaking",
    name: "Loss-making",
    summary: "Wheat price shock that falls below the break-even line.",
    input: {
      ...createDefaultFarmInput("wheat"),
      landSizeAcres: 120,
      availableBudget: 70000,
      seedCostPerAcre: 54,
      fertilizerCostPerAcre: 125,
      laborCostPerAcre: 330,
      expectedHarvestPerAcre: 62,
      marketPricePerUnit: 4.85,
      transportCost: 1800,
      storageMonths: 0,
      storageCostPerMonth: 650,
      expectedMonthlyPriceGrowth: 0.008,
    },
  },
];

export function getSamplePlan(planId: SamplePlan["id"]): SamplePlan {
  return samplePlans.find((plan) => plan.id === planId) ?? samplePlans[0];
}
