import { cropCatalog } from "./crops.js";
import type { FarmPlanField, FarmPlanInput, GuidedInterviewPrompt } from "./types.js";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

const guidedFields: Array<{ field: FarmPlanField; isMissing: (input: FarmPlanInput) => boolean; question: string }> = [
  {
    field: "landSizeAcres",
    isMissing: (input) => input.landSizeAcres <= 0,
    question: "How many acres are you planning to farm this season?",
  },
  {
    field: "availableBudget",
    isMissing: (input) => input.availableBudget <= 0,
    question: "What cash budget is available for this season before you commit to inputs?",
  },
  {
    field: "expectedHarvestPerAcre",
    isMissing: (input) => input.expectedHarvestPerAcre <= 0,
    question: "What yield does this field normally deliver in bushels per acre?",
  },
  {
    field: "marketPricePerUnit",
    isMissing: (input) => input.marketPricePerUnit <= 0,
    question: "What comparable buyer price can you realistically use per bushel today?",
  },
];

/** Selects one missing core assumption. Gemma may rephrase this prompt, but cannot select a financial value. */
export function buildLocalGuidedInterview(input: FarmPlanInput): GuidedInterviewPrompt {
  const next = guidedFields.find((step) => step.isMissing(input));

  return {
    field: next?.field ?? null,
    question: next?.question ?? null,
    summary: buildCapturedPlanSummary(input),
    provider: "local-fallback",
  };
}

/** Gives the extraction layer enough context to structure a short guided answer safely. */
export function buildGuidedAnswerStatement(field: FarmPlanField, answer: string): string {
  const value = answer.trim();
  const looksLikeFullNote =
    value.split(/\s+/).length > 6 && /\b(acres?|budget|yield|harvest|price|seed|fertilizer|lease)\b/i.test(value);

  if (looksLikeFullNote) return value;

  switch (field) {
    case "landSizeAcres":
      return `I have ${value} acres available for this farm plan. Farmer answer: ${value}`;
    case "availableBudget":
      return `My available budget is ${value}. Farmer answer: ${value}`;
    case "expectedHarvestPerAcre":
      return `I expect ${value} bushels per acre. Farmer answer: ${value}`;
    case "marketPricePerUnit":
      return `My comparable market price is ${value} per bushel. Farmer answer: ${value}`;
    default:
      return value;
  }
}

export function buildCapturedPlanSummary(input: FarmPlanInput): string {
  const crop = cropCatalog[input.cropId];
  const facts: string[] = [];

  if (input.landSizeAcres > 0) facts.push(`${formatNumber(input.landSizeAcres, 1)} acres`);
  if (input.availableBudget > 0) facts.push(`${formatCurrency(input.availableBudget)} available`);
  if (input.expectedHarvestPerAcre > 0) facts.push(`${formatNumber(input.expectedHarvestPerAcre)} ${crop.unitPlural} per acre expected`);
  if (input.marketPricePerUnit > 0) facts.push(`${formatCurrency(input.marketPricePerUnit)} per ${crop.unit} as the price assumption`);

  return facts.length > 0
    ? `So far: ${crop.name} on ${facts.join(", ")}.`
    : `${crop.name} is selected. I will collect one assumption at a time.`;
}
