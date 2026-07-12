import type {
  FarmPlanInput,
  FarmPlanResult,
  WeatherResponse,
} from "./types.js";
import type { DeterministicActionPack } from "./actionPack.js";
import { formatPriceEvidenceSource, getPriceEvidenceStatus } from "./priceEvidence.js";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters.js";

export interface DecisionPackScenario {
  changedFields: string[];
  beforePlan: Pick<FarmPlanResult, "expectedProfit">;
  afterPlan: Pick<FarmPlanResult, "expectedProfit">;
}

interface BuildDecisionPackShareTextArgs {
  input: FarmPlanInput;
  plan: FarmPlanResult;
  pack: DeterministicActionPack;
  weatherResponse: WeatherResponse | null;
  scenario: DecisionPackScenario | null;
}

/**
 * Formats the deterministic plan as a compact text handoff. It is deliberately
 * sourced from the same local plan and verification data shown on screen, so a
 * copied or printed pack never turns model language into a financial decision.
 */
export function buildDecisionPackShareText({
  input,
  plan,
  pack,
  weatherResponse,
  scenario,
}: BuildDecisionPackShareTextArgs): string {
  const lines = [
    "HarvestWise AI — field decision pack",
    `${formatNumber(input.landSizeAcres, 1)} acres of ${plan.crop.name} · ${formatNumber(plan.expectedHarvest)} ${plan.crop.unitPlural} expected`,
    "",
    `Calculated next action: ${plan.action.title}`,
    ...plan.action.reasons.slice(0, 2).map((reason) => `• ${reason}`),
    "",
    `Expected profit: ${formatCurrency(plan.expectedProfit)} · Break-even: ${formatCurrency(plan.breakEvenPrice)} / ${plan.crop.unit} · Margin: ${formatPercent(plan.profitMargin)}`,
    `Entered market price: ${formatCurrency(input.marketPricePerUnit)} / ${plan.crop.unit}`,
    "",
    "Verify before committing:",
    ...pack.checks.slice(0, 3).map((check) => `• ${check.title}: ${check.detail}`),
    "",
    priceEvidenceLine(input, plan),
    weatherLine(weatherResponse),
    scenarioLine(scenario),
    "",
    "Financial figures and the next action are calculated by HarvestWise. Gemma may interpret or explain the plan but does not choose the action.",
  ];

  return lines.join("\n");
}

function priceEvidenceLine(input: FarmPlanInput, plan: FarmPlanResult): string {
  const evidence = input.priceEvidence;
  const status = getPriceEvidenceStatus(evidence);
  const location = evidence?.location ? `, ${evidence.location}` : "";
  const date = evidence?.checkedAt ? `, confirmed ${evidence.checkedAt}` : "";

  return `Market price record: ${formatPriceEvidenceSource(evidence)}${location}${date}; ${status.label}. Plan retains the entered ${formatCurrency(input.marketPricePerUnit)} / ${plan.crop.unit} price.`;
}

function weatherLine(weatherResponse: WeatherResponse | null): string {
  if (weatherResponse?.status === "available") {
    const { alerts, forecast, location, timingPrompt } = weatherResponse.context;
    const alertState = alerts.status === "available"
      ? alerts.items.length > 0
        ? `${alerts.items.length} active NWS alert${alerts.items.length > 1 ? "s" : ""}`
        : "no active NWS alerts"
      : "NWS alerts unavailable";

    return `Weather timing: ${location.label} — ${forecast.periodName}, ${forecast.shortForecast}, ${forecast.temperature}°${forecast.temperatureUnit}; ${alertState}. ${timingPrompt}`;
  }

  if (weatherResponse?.status === "unavailable") {
    return `Weather timing: unavailable for ${weatherResponse.location.label}. ${weatherResponse.message}`;
  }

  return "Weather timing: not checked; confirm field, road, and delivery conditions locally.";
}

function scenarioLine(scenario: DecisionPackScenario | null): string {
  if (!scenario) return "Latest what-if: none run yet.";

  const change = scenario.afterPlan.expectedProfit - scenario.beforePlan.expectedProfit;
  const fields = scenario.changedFields.join(", ") || "assumptions updated";
  return `Latest what-if: ${fields}; profit changed ${change >= 0 ? "+" : ""}${formatCurrency(change)} to ${formatCurrency(scenario.afterPlan.expectedProfit)}.`;
}
