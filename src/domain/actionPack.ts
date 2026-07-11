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

export interface RealityCheckPrompt {
  checkId: RealityCheckItem["id"];
  question: string;
  context: string;
  provider: "gemma" | "local-fallback";
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

/**
 * Selects the verification topic deterministically; Gemma may only turn this
 * selected topic into a more natural question when the farmer asks for help.
 */
export function buildLocalRealityCheckPrompt(input: FarmPlanInput, plan: FarmPlanResult): RealityCheckPrompt {
  const check = buildActionPack(input, plan).checks[0];

  return {
    checkId: check.id,
    context: check.detail,
    question: questionForCheck(check.id, input, plan),
    provider: "local-fallback",
  };
}

function questionForCheck(checkId: RealityCheckItem["id"], input: FarmPlanInput, plan: FarmPlanResult): string {
  if (checkId === "buyer-price") {
    return `What price, grade, delivery date, and quantity can you confirm for ${plan.crop.name.toLowerCase()} in writing?`;
  }
  if (checkId === "lease") {
    return `Can we confirm the ${formatCurrency(input.landLeaseCostPerAcre)} per-acre lease, payment date, and included services in writing?`;
  }
  if (checkId === "input-quotes") {
    return "What is the delivered price from two suppliers for seed, fertilizer, and fieldwork today?";
  }
  if (checkId === "yield-history") {
    return `What were this field's actual yields over the last three seasons, compared with the planned ${formatNumber(input.expectedHarvestPerAcre)} ${plan.crop.unitPlural} per acre?`;
  }
  return "What planting, harvest, and delivery dates can the field and buyer realistically support this season?";
}
