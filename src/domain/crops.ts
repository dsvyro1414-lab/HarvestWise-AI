import type { CropDefinition, CropId, FarmPlanInput } from "./types.js";

export const cropCatalog: Record<CropId, CropDefinition> = {
  maize: {
    id: "maize",
    name: "Maize",
    unit: "bag",
    unitPlural: "bags",
    cycleMonths: 4,
    volatility: 0.18,
    storageLossRatePerMonth: 0.012,
    storageSuitability: 0.82,
    color: "#4C6B3F",
    defaults: {
      seedCostPerAcre: 22000,
      fertilizerCostPerAcre: 65000,
      laborCostPerAcre: 45000,
      expectedHarvestPerAcre: 26,
      marketPricePerUnit: 18500,
      transportCost: 18000,
    },
  },
  cassava: {
    id: "cassava",
    name: "Cassava",
    unit: "ton",
    unitPlural: "tons",
    cycleMonths: 10,
    volatility: 0.12,
    storageLossRatePerMonth: 0.04,
    storageSuitability: 0.38,
    color: "#A1B978",
    defaults: {
      seedCostPerAcre: 30000,
      fertilizerCostPerAcre: 28000,
      laborCostPerAcre: 55000,
      expectedHarvestPerAcre: 10,
      marketPricePerUnit: 42000,
      transportCost: 26000,
    },
  },
  rice: {
    id: "rice",
    name: "Rice",
    unit: "bag",
    unitPlural: "bags",
    cycleMonths: 5,
    volatility: 0.16,
    storageLossRatePerMonth: 0.01,
    storageSuitability: 0.8,
    color: "#1C2B1F",
    defaults: {
      seedCostPerAcre: 26000,
      fertilizerCostPerAcre: 74000,
      laborCostPerAcre: 64000,
      expectedHarvestPerAcre: 23,
      marketPricePerUnit: 22500,
      transportCost: 22000,
    },
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    unit: "crate",
    unitPlural: "crates",
    cycleMonths: 3,
    volatility: 0.34,
    storageLossRatePerMonth: 0.18,
    storageSuitability: 0.18,
    color: "#111417",
    defaults: {
      seedCostPerAcre: 38000,
      fertilizerCostPerAcre: 82000,
      laborCostPerAcre: 90000,
      expectedHarvestPerAcre: 120,
      marketPricePerUnit: 4300,
      transportCost: 30000,
    },
  },
  beans: {
    id: "beans",
    name: "Beans",
    unit: "bag",
    unitPlural: "bags",
    cycleMonths: 3,
    volatility: 0.2,
    storageLossRatePerMonth: 0.009,
    storageSuitability: 0.88,
    color: "#F4F6F2",
    defaults: {
      seedCostPerAcre: 28000,
      fertilizerCostPerAcre: 32000,
      laborCostPerAcre: 43000,
      expectedHarvestPerAcre: 12,
      marketPricePerUnit: 30500,
      transportCost: 16000,
    },
  },
};

export const cropOptions = Object.values(cropCatalog);

export function createDefaultFarmInput(cropId: CropId = "maize"): FarmPlanInput {
  const crop = cropCatalog[cropId];

  return {
    cropId,
    landSizeAcres: 2,
    availableBudget: 320000,
    seedCostPerAcre: crop.defaults.seedCostPerAcre,
    fertilizerCostPerAcre: crop.defaults.fertilizerCostPerAcre,
    laborCostPerAcre: crop.defaults.laborCostPerAcre,
    expectedHarvestPerAcre: crop.defaults.expectedHarvestPerAcre,
    marketPricePerUnit: crop.defaults.marketPricePerUnit,
    transportCost: crop.defaults.transportCost,
    storageMonths: 0,
    storageCostPerMonth: 15000,
    expectedMonthlyPriceGrowth: 0.05,
  };
}

export function createEmptyFarmInput(cropId: CropId = "maize"): FarmPlanInput {
  const defaults = createDefaultFarmInput(cropId);

  return {
    ...defaults,
    landSizeAcres: 0,
    availableBudget: 0,
    expectedHarvestPerAcre: 0,
    marketPricePerUnit: 0,
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
