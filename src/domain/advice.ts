import type {
  AdvisorPayload,
  CropComparison,
  FarmPlanInput,
  FarmPlanResult,
  MarketDecision,
} from "./types.js";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters.js";

export function buildFallbackAdvice(args: {
  input: FarmPlanInput;
  plan: FarmPlanResult;
  comparisons: CropComparison[];
  marketDecisions: MarketDecision[];
  question?: string;
}): AdvisorPayload {
  const { input, plan, comparisons, question } = args;
  const strongestAlternative = comparisons.find((item) => item.crop.id !== plan.crop.id);
  const budgetLine =
    plan.budgetGap > 0
      ? `The plan is above the available budget by ${formatCurrency(plan.budgetGap)}.`
      : `The plan stays within the available budget by ${formatCurrency(input.availableBudget - plan.totalSeasonCost)}.`;

  const baseAdvice: AdvisorPayload = {
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
    whatsappMessage: `HarvestWise AI update: ${plan.crop.name} on ${formatNumber(
      input.landSizeAcres,
      1,
    )} acres can make about ${formatCurrency(plan.expectedProfit)}. Break-even is ${formatCurrency(
      plan.breakEvenPrice,
    )}/${plan.crop.unit}. Recommended next action: ${plan.action.title}.`,
  };

  return question ? answerQuestionLocally(question, input, plan, baseAdvice) : baseAdvice;
}

function answerQuestionLocally(
  question: string,
  input: FarmPlanInput,
  plan: FarmPlanResult,
  baseAdvice: AdvisorPayload,
): AdvisorPayload {
  const normalized = question.trim().toLowerCase();
  const withAnswer = (summary: string, insights: string[]): AdvisorPayload => ({
    ...baseAdvice,
    summary,
    insights,
  });

  if (isGreeting(normalized)) {
    return withAnswer(
      `Hi — I can help you understand this ${plan.crop.name.toLowerCase()} plan. The current calculated next action is “${plan.action.title}.”`,
      [
        "Ask about profit, costs, the break-even price, risk, or why this action was selected.",
        "For a recalculated what-if, include a number such as “harvest falls by 10%.”",
      ],
    );
  }

  if (/(rain|rainy|weather|winter|storm|snow|flood|wet\s+soil|drought)/i.test(normalized)) {
    return withAnswer(
      `A wet or rainy winter can leave fields saturated, delay field access, increase compaction risk, and raise concern about nutrient loss. HarvestWise has not changed the ${plan.crop.name.toLowerCase()} profit estimate because this question does not specify a numeric cost or harvest impact.`,
      [
        "Use the Weather timing check for the selected location before fieldwork.",
        "To stress-test the finances, choose an assumption you want to test, such as harvest per acre falling by 10%.",
      ],
    );
  }

  if (/(why|next action|what should i do|recommend|plant)/i.test(normalized)) {
    return withAnswer(
      `The calculated next action is “${plan.action.title}.” HarvestWise selected it from the profit, budget, break-even price, and risk rules — not from an AI recommendation.`,
      plan.action.reasons.slice(0, 2),
    );
  }

  if (/(risk|risky|safe|uncertain|volatil)/i.test(normalized)) {
    return withAnswer(
      `This plan's calculated risk level is ${plan.riskLevel}. It has a ${formatPercent(plan.profitMargin)} profit margin, while ${plan.crop.name} uses an ${formatPercent(plan.crop.volatility)} price-volatility assumption.`,
      [
        `The plan stops covering its entered costs below ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}.`,
        "Verify the local buyer price first if a small price move would erase the expected profit.",
      ],
    );
  }

  if (/(break.?even|stop losing|loss|price fall|minimum price)/i.test(normalized)) {
    return withAnswer(
      `The entered-cost break-even price is ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}. Above that price, the plan covers the costs entered here; below it, the plan loses money.`,
      [
        `The current plan uses ${formatCurrency(input.marketPricePerUnit)} per ${plan.crop.unit}.`,
        "Confirm that price with a local buyer or elevator before committing money.",
      ],
    );
  }

  if (/(profit|make|earn|revenue)/i.test(normalized)) {
    return withAnswer(
      `Expected profit is ${formatCurrency(plan.expectedProfit)} if harvest reaches ${formatNumber(input.expectedHarvestPerAcre, 1)} ${plan.crop.unitPlural} per acre and price stays near ${formatCurrency(input.marketPricePerUnit)} per ${plan.crop.unit}.`,
      [
        `Expected revenue is ${formatCurrency(plan.grossRevenue)} before ${formatCurrency(plan.totalSeasonCost)} in entered season costs.`,
        "This is a planning estimate, not a guaranteed outcome.",
      ],
    );
  }

  if (/(cost|budget|cash|money left|afford)/i.test(normalized)) {
    const budgetAnswer =
      plan.budgetGap > 0
        ? `The plan is ${formatCurrency(plan.budgetGap)} over the available budget.`
        : `The plan leaves ${formatCurrency(input.availableBudget - plan.totalSeasonCost)} of the available budget after entered season costs.`;

    return withAnswer(
      `${budgetAnswer} Total entered season cost is ${formatCurrency(plan.totalSeasonCost)}.`,
      [
        "Review seed, fertilizer, fieldwork, land rent, transport, and storage assumptions before committing.",
        `The calculated next action remains “${plan.action.title}.”`,
      ],
    );
  }

  if (/(assumption|verify|check first|confirm)/i.test(normalized)) {
    return withAnswer(
      `Verify the expected price of ${formatCurrency(input.marketPricePerUnit)} per ${plan.crop.unit} and the expected harvest of ${formatNumber(input.expectedHarvestPerAcre, 1)} ${plan.crop.unitPlural} per acre first. Those assumptions directly affect whether the plan covers its costs.`,
      [
        "Record where the price came from and when it was confirmed.",
        "Use Test a change to see how one uncertain assumption changes the result.",
      ],
    );
  }

  return withAnswer(
    "Gemma could not provide a usable answer to that message. The local assistant can still explain this plan's action, profit, costs, break-even price, risk, or assumptions.",
    [
      `Current calculated next action: ${plan.action.title}.`,
      "Try asking one focused plan question, or use Test a change with a specific number.",
    ],
  );
}

function isGreeting(question: string): boolean {
  return /^(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy|привет)[!.\s]*$/i.test(question);
}
