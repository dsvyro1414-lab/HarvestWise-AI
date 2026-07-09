import type { CropDefinition, CropId, FarmPlanInput } from "./types";

export const cropCatalog: Record<CropId, CropDefinition> = {
  corn: {
    id: "corn",
    name: "Corn",
    unit: "bushel",
    unitPlural: "bushels",
    cycleMonths: 5,
    volatility: 0.16,
    storageLossRatePerMonth: 0.003,
    storageSuitability: 0.86,
    color: "#4C6B3F",
    defaults: {
      seedCostPerAcre: 125,
      fertilizerCostPerAcre: 210,
      laborCostPerAcre: 470,
      expectedHarvestPerAcre: 210,
      marketPricePerUnit: 4.55,
      transportCost: 3200,
    },
  },
  soybeans: {
    id: "soybeans",
    name: "Soybeans",
    unit: "bushel",
    unitPlural: "bushels",
    cycleMonths: 5,
    volatility: 0.19,
    storageLossRatePerMonth: 0.002,
    storageSuitability: 0.78,
    color: "#A1B978",
    defaults: {
      seedCostPerAcre: 78,
      fertilizerCostPerAcre: 72,
      laborCostPerAcre: 360,
      expectedHarvestPerAcre: 57,
      marketPricePerUnit: 11.35,
      transportCost: 2100,
    },
  },
  wheat: {
    id: "wheat",
    name: "Wheat",
    unit: "bushel",
    unitPlural: "bushels",
    cycleMonths: 4,
    volatility: 0.17,
    storageLossRatePerMonth: 0.003,
    storageSuitability: 0.82,
    color: "#1C2B1F",
    defaults: {
      seedCostPerAcre: 48,
      fertilizerCostPerAcre: 115,
      laborCostPerAcre: 285,
      expectedHarvestPerAcre: 70,
      marketPricePerUnit: 5.4,
      transportCost: 1700,
    },
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    unit: "bushel",
    unitPlural: "bushels",
    cycleMonths: 3,
    volatility: 0.34,
    storageLossRatePerMonth: 0.12,
    storageSuitability: 0.18,
    color: "#111417",
    defaults: {
      seedCostPerAcre: 450,
      fertilizerCostPerAcre: 350,
      laborCostPerAcre: 3600,
      expectedHarvestPerAcre: 750,
      marketPricePerUnit: 5.5,
      transportCost: 6000,
    },
  },
  dryBeans: {
    id: "dryBeans",
    name: "Dry Beans",
    unit: "bushel",
    unitPlural: "bushels",
    cycleMonths: 3,
    volatility: 0.22,
    storageLossRatePerMonth: 0.003,
    storageSuitability: 0.86,
    color: "#F4F6F2",
    defaults: {
      seedCostPerAcre: 95,
      fertilizerCostPerAcre: 80,
      laborCostPerAcre: 340,
      expectedHarvestPerAcre: 32,
      marketPricePerUnit: 17.5,
      transportCost: 1700,
    },
  },
};

export const cropOptions = Object.values(cropCatalog);

export function createDefaultFarmInput(cropId: CropId = "corn"): FarmPlanInput {
  const crop = cropCatalog[cropId];

  return {
    cropId,
    landSizeAcres: 160,
    availableBudget: 145000,
    seedCostPerAcre: crop.defaults.seedCostPerAcre,
    fertilizerCostPerAcre: crop.defaults.fertilizerCostPerAcre,
    laborCostPerAcre: crop.defaults.laborCostPerAcre,
    expectedHarvestPerAcre: crop.defaults.expectedHarvestPerAcre,
    marketPricePerUnit: crop.defaults.marketPricePerUnit,
    transportCost: crop.defaults.transportCost,
    storageMonths: 0,
    storageCostPerMonth: 900,
    expectedMonthlyPriceGrowth: 0.015,
  };
}

export function applyCropDefaults(input: FarmPlanInput, cropId: CropId): FarmPlanInput {
  const nextCrop = cropCatalog[cropId];

  return {
    ...input,
    cropId,
    seedCostPerAcre: nextCrop.defaults.seedCostPerAcre,
    fertilizerCostPerAcre: nextCrop.defaults.fertilizerCostPerAcre,
    laborCostPerAcre: nextCrop.defaults.laborCostPerAcre,
    expectedHarvestPerAcre: nextCrop.defaults.expectedHarvestPerAcre,
    marketPricePerUnit: nextCrop.defaults.marketPricePerUnit,
    transportCost: nextCrop.defaults.transportCost,
  };
}
