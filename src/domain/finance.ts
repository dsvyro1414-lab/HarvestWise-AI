import { cropCatalog, cropOptions } from "./crops.js";
import { buildFarmerAction } from "./farmerAction.js";
import type {
  CropComparison,
  CropDefinition,
  FarmPlanInput,
  FarmPlanResult,
  MarketDecision,
  PriceSensitivityPoint,
  RiskLevel,
} from "./types.js";

const sensitivityMultipliers = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3];

export function calculateFarmPlan(
  input: FarmPlanInput,
  crop: CropDefinition = cropCatalog[input.cropId],
): FarmPlanResult {
  const landSize = positive(input.landSizeAcres);
  const harvest = landSize * positive(input.expectedHarvestPerAcre);
  const inputCost =
    landSize *
    (positive(input.seedCostPerAcre) +
      positive(input.fertilizerCostPerAcre) +
      positive(input.laborCostPerAcre) +
      positive(input.landLeaseCostPerAcre));
  const storageCost = positive(input.storageMonths) * positive(input.storageCostPerMonth);
  const totalSeasonCost = inputCost + positive(input.transportCost) + storageCost;
  const grossRevenue = harvest * positive(input.marketPricePerUnit);
  const expectedProfit = grossRevenue - totalSeasonCost;
  const breakEvenPrice = harvest > 0 ? totalSeasonCost / harvest : 0;
  const profitMargin = grossRevenue > 0 ? expectedProfit / grossRevenue : 0;
  const roi = totalSeasonCost > 0 ? expectedProfit / totalSeasonCost : 0;
  const budgetGap = Math.max(0, totalSeasonCost - positive(input.availableBudget));
  const riskScore = calculateRiskScore({
    budgetGap,
    crop,
    input,
    profitMargin,
    roi,
  });
  const riskLevel = riskLevelFromScore(riskScore);
  const sensitivity = buildPriceSensitivity(input, totalSeasonCost, harvest);
  const plan = {
    crop,
    totalSeasonCost,
    inputCost,
    expectedHarvest: harvest,
    grossRevenue,
    expectedProfit,
    breakEvenPrice,
    roi,
    profitMargin,
    budgetGap,
    riskLevel,
    riskScore,
    sensitivity,
  };

  return {
    ...plan,
    action: buildFarmerAction(input, plan),
  };
}

export function buildCropComparison(input: FarmPlanInput): CropComparison[] {
  const activeCrop = cropCatalog[input.cropId];

  return cropOptions
    .map((crop) => {
      const comparisonInput =
        crop.id === activeCrop.id
          ? input
          : {
              ...input,
              cropId: crop.id,
              seedCostPerAcre: crop.defaults.seedCostPerAcre,
              fertilizerCostPerAcre: crop.defaults.fertilizerCostPerAcre,
              laborCostPerAcre: crop.defaults.laborCostPerAcre,
              landLeaseCostPerAcre: crop.defaults.landLeaseCostPerAcre,
              expectedHarvestPerAcre: crop.defaults.expectedHarvestPerAcre,
              marketPricePerUnit: crop.defaults.marketPricePerUnit,
              transportCost: crop.defaults.transportCost,
              storageMonths: crop.storageSuitability > 0.75 ? 2 : 0,
            };
      const plan = calculateFarmPlan(comparisonInput, crop);

      return {
        crop,
        expectedProfit: plan.expectedProfit,
        breakEvenPrice: plan.breakEvenPrice,
        totalSeasonCost: plan.totalSeasonCost,
        cashReturnMonths: crop.cycleMonths + comparisonInput.storageMonths,
        riskLevel: plan.riskLevel,
        recommendation: plan.action.title,
      };
    })
    .sort((left, right) => {
      if (left.crop.id === activeCrop.id) return -1;
      if (right.crop.id === activeCrop.id) return 1;
      return right.expectedProfit - left.expectedProfit;
    });
}

export function buildMarketDecisions(input: FarmPlanInput): MarketDecision[] {
  const crop = cropCatalog[input.cropId];
  const months = crop.storageSuitability > 0.45 ? [0, 2, 4] : [0, 1, 2];
  const labels = ["Sell at harvest", "Store short-term", "Store longer"];

  return months.map((month, index) => {
    const storedHarvest =
      positive(input.landSizeAcres) *
      positive(input.expectedHarvestPerAcre) *
      Math.max(0, 1 - crop.storageLossRatePerMonth * month);
    const price = positive(input.marketPricePerUnit) * (1 + positive(input.expectedMonthlyPriceGrowth) * month);
    const storageCost = positive(input.storageCostPerMonth) * month;
    const totalCost =
      positive(input.landSizeAcres) *
        (positive(input.seedCostPerAcre) +
          positive(input.fertilizerCostPerAcre) +
          positive(input.laborCostPerAcre) +
          positive(input.landLeaseCostPerAcre)) +
      positive(input.transportCost) +
      storageCost;
    const netRevenue = storedHarvest * price;
    const expectedProfit = netRevenue - totalCost;
    const riskScore = calculateRiskScore({
      budgetGap: Math.max(0, totalCost - positive(input.availableBudget)),
      crop,
      input: { ...input, storageMonths: month },
      profitMargin: netRevenue > 0 ? expectedProfit / netRevenue : 0,
      roi: totalCost > 0 ? expectedProfit / totalCost : 0,
    });
    const id = index === 0 ? "sell-harvest" : index === 1 ? "store-short" : "store-long";

    return {
      id,
      label: labels[index],
      months: month,
      estimatedPrice: price,
      expectedProfit,
      netRevenue,
      harvestAfterLoss: storedHarvest,
      riskLevel: riskLevelFromScore(riskScore),
      recommendation:
        month === 0
          ? "Fast cash and lower storage risk"
          : crop.storageSuitability > 0.65
            ? "Worth considering if cashflow allows"
            : "Use only with confirmed buyer demand",
    };
  });
}

export function getBestMarketDecision(decisions: MarketDecision[]): MarketDecision {
  return decisions.reduce((best, current) => {
    const bestPenalty = riskPenalty(best.riskLevel);
    const currentPenalty = riskPenalty(current.riskLevel);
    return current.expectedProfit - currentPenalty > best.expectedProfit - bestPenalty ? current : best;
  }, decisions[0]);
}

function buildPriceSensitivity(
  input: FarmPlanInput,
  totalSeasonCost: number,
  harvest: number,
): PriceSensitivityPoint[] {
  return sensitivityMultipliers.map((multiplier) => {
    const price = positive(input.marketPricePerUnit) * multiplier;

    return {
      price,
      profit: harvest * price - totalSeasonCost,
    };
  });
}

function calculateRiskScore(args: {
  budgetGap: number;
  crop: CropDefinition;
  input: FarmPlanInput;
  profitMargin: number;
  roi: number;
}): number {
  const { budgetGap, crop, input, profitMargin, roi } = args;
  const costPressure =
    input.availableBudget > 0
      ? Math.max(0, (budgetGap / Math.max(input.availableBudget, 1)) * 30)
      : 20;
  const marginPressure = profitMargin < 0 ? 35 : profitMargin < 0.12 ? 22 : profitMargin < 0.22 ? 12 : 4;
  const roiPressure = roi < 0 ? 20 : roi < 0.25 ? 12 : roi < 0.55 ? 6 : 2;
  const volatilityPressure = crop.volatility * 45;
  const storagePressure = input.storageMonths * (1 - crop.storageSuitability) * 8;
  const cyclePressure = crop.cycleMonths > 8 ? 8 : crop.cycleMonths > 5 ? 4 : 0;

  return clamp(costPressure + marginPressure + roiPressure + volatilityPressure + storagePressure + cyclePressure, 0, 100);
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 55) return "high";
  if (score >= 36) return "medium";
  return "low";
}

function riskPenalty(level: RiskLevel): number {
  if (level === "high") return 90000;
  if (level === "medium") return 35000;
  return 0;
}

function positive(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
