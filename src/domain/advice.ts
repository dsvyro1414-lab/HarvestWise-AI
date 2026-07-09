import { getBestMarketDecision } from "./finance";
import type {
  AdvisorPayload,
  CropComparison,
  FarmPlanInput,
  FarmPlanResult,
  MarketDecision,
} from "./types";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

export function buildFallbackAdvice(args: {
  input: FarmPlanInput;
  plan: FarmPlanResult;
  comparisons: CropComparison[];
  marketDecisions: MarketDecision[];
}): AdvisorPayload {
  const { input, plan, comparisons, marketDecisions } = args;
  const bestMarketDecision = getBestMarketDecision(marketDecisions);
  const strongestAlternative = comparisons.find((item) => item.crop.id !== plan.crop.id);
  const budgetLine =
    plan.budgetGap > 0
      ? `The plan is above the available budget by ${formatCurrency(plan.budgetGap)}.`
      : `The plan stays within the available budget by ${formatCurrency(input.availableBudget - plan.totalSeasonCost)}.`;

  return {
    provider: "local-fallback",
    summary: `This ${plan.crop.name.toLowerCase()} season can make ${formatCurrency(
      plan.expectedProfit,
    )} if the market price stays near ${formatCurrency(input.marketPricePerUnit)} per ${
      plan.crop.unit
    }. The break-even price is ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}.`,
    insights: [
      budgetLine,
      `Risk is ${plan.riskLevel} because the plan has ${formatPercent(plan.profitMargin)} margin and ${formatPercent(
        plan.crop.volatility,
      )} price volatility.`,
      strongestAlternative
        ? `${strongestAlternative.crop.name} is the closest alternative with expected profit of ${formatCurrency(
            strongestAlternative.expectedProfit,
          )}.`
        : "Compare another crop before committing the full season budget.",
    ],
    recommendations: [
      plan.bestAction,
      `${bestMarketDecision.label} is currently the strongest market option, with estimated profit of ${formatCurrency(
        bestMarketDecision.expectedProfit,
      )}.`,
      `Monitor price weekly. If price falls below ${formatCurrency(plan.breakEvenPrice)} per ${
        plan.crop.unit
      }, the season stops being profitable.`,
    ],
    farmerMessage: `HarvestWise AI update: ${plan.crop.name} on ${formatNumber(
      input.landSizeAcres,
      1,
    )} acres can make about ${formatCurrency(plan.expectedProfit)}. Break-even is ${formatCurrency(
      plan.breakEvenPrice,
    )}/${plan.crop.unit}. Suggested action: ${plan.bestAction}.`,
  };
}
