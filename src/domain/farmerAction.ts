import type { FarmPlanInput, FarmPlanResult, FarmerAction } from "./types.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";

type ActionContext = Pick<
  FarmPlanResult,
  "crop" | "expectedHarvest" | "expectedProfit" | "totalSeasonCost" | "breakEvenPrice" | "roi" | "profitMargin" | "budgetGap" | "riskLevel"
>;

/**
 * Produces the single, deterministic action that HarvestWise shows first.
 * Gemma can explain this result, but never chooses or changes it.
 */
export function buildFarmerAction(input: FarmPlanInput, plan: ActionContext): FarmerAction {
  const currentPrice = Math.max(0, input.marketPricePerUnit);

  if (plan.expectedHarvest <= 0 || currentPrice <= 0) {
    return {
      id: "do-not-plant",
      title: "Do not plant yet",
      stage: "before-planting",
      reasons: [
        "Add a realistic harvest and market-price estimate before committing the season budget.",
        "Without both figures, HarvestWise cannot verify that the plan can cover its costs.",
      ],
    };
  }

  if (plan.expectedProfit <= 0) {
    return {
      id: "do-not-plant",
      title: "Do not plant yet",
      stage: "before-planting",
      reasons: [
        `Expected revenue of ${formatCurrency(plan.expectedProfit + plan.totalSeasonCost)} does not cover season costs of ${formatCurrency(plan.totalSeasonCost)}.`,
        `The market price needs to stay above ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}; the current estimate is ${formatCurrency(currentPrice)}.`,
      ],
    };
  }

  if (plan.budgetGap > 0) {
    return {
      id: "reduce-acreage",
      title: "Reduce acreage before planting",
      stage: "before-planting",
      reasons: [
        `The season needs ${formatCurrency(plan.budgetGap)} more than the available budget.`,
        `Keep costs within budget before planting, even though this plan could earn about ${formatCurrency(plan.expectedProfit)} at the current price estimate.`,
      ],
    };
  }

  if (plan.riskLevel === "high") {
    return {
      id: "secure-buyer",
      title: "Secure a buyer before planting",
      stage: "before-planting",
      reasons: [
        `The plan is high risk with a ${formatPercent(plan.profitMargin)} profit margin and ${formatPercent(plan.crop.volatility)} price volatility.`,
        `A buyer commitment helps protect the plan before the price reaches its ${formatCurrency(plan.breakEvenPrice)} break-even point.`,
      ],
    };
  }

  if (input.storageMonths > 0) {
    const priceThreshold = getStoragePriceThreshold(input, plan);
    const forecastPrice = currentPrice * (1 + Math.max(0, input.expectedMonthlyPriceGrowth) * input.storageMonths);

    return {
      id: "store-if-price",
      title: `Store only if price exceeds ${formatCurrency(priceThreshold)} per ${plan.crop.unit}`,
      stage: "after-harvest",
      priceThreshold,
      reasons: [
        `After ${input.storageMonths} month${input.storageMonths === 1 ? "" : "s"}, expected losses leave about ${formatStoredHarvest(input, plan)} ${plan.crop.unitPlural}.`,
        `Storage beats selling at harvest only above ${formatCurrency(priceThreshold)} per ${plan.crop.unit}; the current forecast is ${formatCurrency(forecastPrice)}.`,
      ],
    };
  }

  return {
    id: "plant-plan",
    title: "Plant this plan",
    stage: "before-planting",
    reasons: [
      `Expected profit is ${formatCurrency(plan.expectedProfit)} with a ${formatPercent(plan.profitMargin)} margin.`,
      `The plan stays within budget and remains profitable above ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}.`,
    ],
  };
}

/** Minimum future market price at which storage beats selling immediately. */
export function getStoragePriceThreshold(input: FarmPlanInput, plan: Pick<FarmPlanResult, "crop" | "expectedHarvest">): number {
  const months = Math.max(0, input.storageMonths);
  const harvestAfterLoss = plan.expectedHarvest * Math.max(0, 1 - plan.crop.storageLossRatePerMonth * months);

  if (harvestAfterLoss <= 0) return 0;

  const immediateRevenue = plan.expectedHarvest * Math.max(0, input.marketPricePerUnit);
  const storageCost = months * Math.max(0, input.storageCostPerMonth);
  return (immediateRevenue + storageCost) / harvestAfterLoss;
}

function formatStoredHarvest(input: FarmPlanInput, plan: Pick<FarmPlanResult, "crop" | "expectedHarvest">): string {
  const harvestAfterLoss = plan.expectedHarvest * Math.max(0, 1 - plan.crop.storageLossRatePerMonth * input.storageMonths);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(harvestAfterLoss);
}
