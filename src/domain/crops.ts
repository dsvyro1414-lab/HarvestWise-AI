import type { CropDefinition, CropId, FarmPlanInput } from "./types.js";

export const cropCatalog: Record<CropId, CropDefinition> = {
  corn: {
    id: "corn",
    name: "Corn",
    unit: "bu",
    unitPlural: "bushels",
    cycleMonths: 5,
    volatility: 0.18,
    storageLossRatePerMonth: 0.008,
    storageSuitability: 0.84,
    color: "#4C6B3F",
    defaults: {
      seedCostPerAcre: 115,
      fertilizerCostPerAcre: 210,
      laborCostPerAcre: 230,
      landLeaseCostPerAcre: 250,
      expectedHarvestPerAcre: 220,
      marketPricePerUnit: 4.05,
      transportCost: 1_000,
    },
  },
  soybeans: {
    id: "soybeans",
    name: "Soybeans",
    unit: "bu",
    unitPlural: "bushels",
    cycleMonths: 5,
    volatility: 0.16,
    storageLossRatePerMonth: 0.006,
    storageSuitability: 0.88,
    color: "#788F55",
    defaults: {
      seedCostPerAcre: 72,
      fertilizerCostPerAcre: 95,
      laborCostPerAcre: 220,
      landLeaseCostPerAcre: 250,
      expectedHarvestPerAcre: 70,
      marketPricePerUnit: 10,
      transportCost: 800,
    },
  },
  wheat: {
    id: "wheat",
    name: "Wheat",
    unit: "bu",
    unitPlural: "bushels",
    cycleMonths: 4,
    volatility: 0.2,
    storageLossRatePerMonth: 0.005,
    storageSuitability: 0.9,
    color: "#B59655",
    defaults: {
      seedCostPerAcre: 45,
      fertilizerCostPerAcre: 145,
      laborCostPerAcre: 190,
      landLeaseCostPerAcre: 230,
      expectedHarvestPerAcre: 75,
      marketPricePerUnit: 5.5,
      transportCost: 800,
    },
  },
};

export const cropOptions = Object.values(cropCatalog);

export function createDefaultFarmInput(cropId: CropId = "corn"): FarmPlanInput {
  const crop = cropCatalog[cropId];

  return {
    cropId,
    landSizeAcres: 40,
    availableBudget: 35_000,
    seedCostPerAcre: crop.defaults.seedCostPerAcre,
    fertilizerCostPerAcre: crop.defaults.fertilizerCostPerAcre,
    laborCostPerAcre: crop.defaults.laborCostPerAcre,
    landLeaseCostPerAcre: crop.defaults.landLeaseCostPerAcre,
    expectedHarvestPerAcre: crop.defaults.expectedHarvestPerAcre,
    marketPricePerUnit: crop.defaults.marketPricePerUnit,
    transportCost: crop.defaults.transportCost,
    storageMonths: 0,
    storageCostPerMonth: 150,
    expectedMonthlyPriceGrowth: 0.01,
  };
}

export function createEmptyFarmInput(cropId: CropId = "corn"): FarmPlanInput {
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
    landLeaseCostPerAcre: nextCrop.defaults.landLeaseCostPerAcre,
    expectedHarvestPerAcre: nextCrop.defaults.expectedHarvestPerAcre,
    marketPricePerUnit: nextCrop.defaults.marketPricePerUnit,
    transportCost: nextCrop.defaults.transportCost,
  };
}
