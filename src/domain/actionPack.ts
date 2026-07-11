import { buildCostDrivers, buildPriceSafety } from "./dashboard.js";
import type { FarmerAction, FarmPlanInput, FarmPlanResult } from "./types.js";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

export type VerificationPriority = "urgent" | "verify";

export interface RealityCheckItem {
  id: "lease" | "input-quotes" | "yield-history" | "buyer-price" | "timing";
  title: string;
  detail: string;
  nextStep: string;
  priority: VerificationPriority;
}

export interface DeterministicActionPack {
  recommendation: FarmerAction;
  checks: RealityCheckItem[];
  nextSteps: string[];
}

/**
 * Keeps verification prompts and practical steps deterministic. These checks
 * help a farmer validate local assumptions; they never create a new price,
 * forecast, or recommended financial action.
 */
export function buildActionPack(input: FarmPlanInput, plan: FarmPlanResult): DeterministicActionPack {
  const priceSafety = buildPriceSafety(input, plan);
  const topCostDriver = buildCostDrivers(input, plan)[0];
  const yieldIsAggressive = input.expectedHarvestPerAcre > plan.crop.defaults.expectedHarvestPerAcre * 1.1;
  const cashIsTight = plan.budgetGap > 0 || input.availableBudget - plan.totalSeasonCost < plan.totalSeasonCost * 0.08;
  const priceIsTight = priceSafety.state !== "safe";

  const checks: RealityCheckItem[] = [
    {
      id: "buyer-price",
      title: "Buyer price",
      detail: `Confirm a comparable ${plan.crop.name.toLowerCase()} bid near ${formatCurrency(input.marketPricePerUnit)} per ${plan.crop.unit}, including grade and delivery terms.`,
      nextStep: "Call a buyer or cooperative and record the price, grade, and delivery terms you can actually use.",
      priority: priceIsTight ? "urgent" : "verify",
    },
    {
      id: "yield-history",
      title: "Yield history",
      detail: `Compare the planned ${formatNumber(input.expectedHarvestPerAcre)} ${plan.crop.unitPlural} per acre with at least three years of field history.`,
      nextStep: "Write down the last three field yields and replace the estimate if the average is lower.",
      priority: yieldIsAggressive || plan.riskLevel === "high" ? "urgent" : "verify",
    },
    {
      id: "lease",
      title: "Land lease",
      detail: `Verify the cash-rent estimate of ${formatCurrency(input.landLeaseCostPerAcre)} per acre and what it includes before signing.`,
      nextStep: "Confirm the lease rate, payment date, and included services with the landowner in writing.",
      priority: cashIsTight ? "urgent" : "verify",
    },
    {
      id: "input-quotes",
      title: "Input quotes",
      detail: `Get two current quotes for seed, fertilizer, and fieldwork; ${topCostDriver?.label ?? "inputs"} is the largest cost line in this plan.`,
      nextStep: "Collect two delivered input quotes before ordering and update the plan with the higher confirmed cost.",
      priority: cashIsTight ? "urgent" : "verify",
    },
    {
      id: "timing",
      title: "Timing",
      detail: `Confirm the planting window, harvest timing, and a delivery slot for this ${plan.crop.cycleMonths}-month ${plan.crop.name.toLowerCase()} cycle.`,
      nextStep: "Check the field and buyer calendar this week, then set your planting and delivery dates.",
      priority: "verify",
    },
  ];

  const sortedChecks = checks.sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority));

  return {
    recommendation: plan.action,
    checks: sortedChecks,
    nextSteps: sortedChecks.slice(0, 3).map((check) => check.nextStep),
  };
}

function priorityRank(priority: VerificationPriority): number {
  return priority === "urgent" ? 0 : 1;
}
