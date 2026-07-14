import type { FarmPlanInput, ScenarioGuidance } from "../src/domain/types.js";

const weatherPattern = /(rain|rainy|weather|winter|storm|snow|flood|wet\s+soil|drought|temperature|freeze|frost)/i;

export function buildLocalScenarioGuidance(
  question: string,
  currentInput: FarmPlanInput,
): ScenarioGuidance {
  if (weatherPattern.test(question)) {
    return {
      kind: "weather",
      title: "Rainy weather can affect timing and field conditions",
      answer: `A rainy winter can leave fields saturated, delay field access, increase soil-compaction risk, and raise concern about nutrient loss. No plan numbers were changed because weather alone does not supply a numeric cost or harvest impact for the ${currentInput.cropId} plan.`,
      nextSteps: [
        "Check the Weather timing section for the selected location before fieldwork.",
        "Inspect drainage and field access, then choose a cautious harvest or cost assumption to stress-test.",
      ],
      suggestedScenario: "What if expected harvest per acre falls by 10%?",
      provider: "local-fallback",
    };
  }

  return {
    kind: "needs-number",
    title: "This question needs one testable assumption",
    answer:
      "It is a valid planning question, but HarvestWise needs a specific price, cost, budget, acreage, storage, or harvest change before it can recalculate the plan. No plan numbers were changed.",
    nextSteps: [
      "Choose the one assumption you are most uncertain about.",
      "Enter a percentage or target value so the before-and-after result is auditable.",
    ],
    suggestedScenario: "What if expected harvest per acre falls by 10%?",
    provider: "local-fallback",
  };
}

export function normalizeScenarioGuidance(raw: unknown): Omit<ScenarioGuidance, "provider"> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const source = raw as Record<string, unknown>;
  const kind = ["weather", "needs-number", "general"].includes(String(source.kind))
    ? (source.kind as ScenarioGuidance["kind"])
    : "general";
  const title = cleanText(source.title, 8, 120);
  const answer = cleanText(source.answer, 24, 900);
  const nextSteps = cleanList(source.nextSteps, 4, 240);
  const suggestedScenario = cleanText(source.suggestedScenario, 10, 180);

  if (!title || !answer || nextSteps.length === 0) return undefined;

  return {
    kind,
    title,
    answer,
    nextSteps,
    ...(suggestedScenario ? { suggestedScenario } : {}),
  };
}

function cleanList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  const items = value
    .map((item) => cleanText(item, 8, maxLength))
    .filter((item): item is string => item !== undefined);
  return [...new Set(items)].slice(0, maxItems);
}

function cleanText(value: unknown, minLength: number, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (text.length < minLength || text.length > maxLength) return undefined;
  if (/[{}]/.test(text) || /_{6,}/.test(text)) return undefined;
  return text;
}
