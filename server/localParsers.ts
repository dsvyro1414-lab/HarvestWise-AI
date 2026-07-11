import { cropCatalog } from "../src/domain/crops.js";
import {
  applyScenarioOperations,
  getMissingCoreFields,
  getPatchFields,
} from "../src/domain/patches.js";
import type {
  CropId,
  FarmInterviewResult,
  FarmPlanInput,
  FarmPlanPatch,
  NumericFarmPlanField,
  ScenarioOperation,
  ScenarioOperationKind,
  ScenarioParseResult,
} from "../src/domain/types.js";

const cropAliases: Array<[CropId, RegExp]> = [
  ["corn", /\b(corn|maize)\b/i],
  ["soybeans", /\b(soybean|soybeans|soy)\b/i],
  ["wheat", /\bwheat\b/i],
];

const fieldAliases: Array<[NumericFarmPlanField, RegExp]> = [
  ["fertilizerCostPerAcre", /\b(fertilizer|fertiliser|manure)\b/i],
  ["seedCostPerAcre", /\b(seed|seeds)\b/i],
  ["laborCostPerAcre", /\b(labor|labour|worker|workers|fieldwork|equipment)\b/i],
  ["landLeaseCostPerAcre", /\b(land lease|lease|rent|cash rent)\b/i],
  ["marketPricePerUnit", /\b(market price|selling price|sell price|price)\b/i],
  ["availableBudget", /\b(budget|available money|cash|capital)\b/i],
  ["expectedHarvestPerAcre", /\b(harvest|yield|produce)\b/i],
  ["transportCost", /\b(transport|transportation|logistics)\b/i],
  ["storageMonths", /\b(store|storage|stored|keep)\b/i],
  ["storageCostPerMonth", /\b(storage cost|store cost)\b/i],
  ["expectedMonthlyPriceGrowth", /\b(price growth|price rise|monthly growth)\b/i],
];

export function extractInterviewLocally(text: string): FarmInterviewResult {
  const patch: FarmPlanPatch = {};
  const normalized = text.replace(/\s+/g, " ");

  for (const [cropId, pattern] of cropAliases) {
    if (pattern.test(normalized)) {
      patch.cropId = cropId;
      break;
    }
  }

  const land = matchNumber(normalized, /(\d+(?:\.\d+)?)\s*(acre|acres|hectare|hectares|ha)\b/i);
  if (land) {
    patch.landSizeAcres = /hectare|ha/i.test(land.unit ?? "") ? land.value * 2.471 : land.value;
  }

  patch.availableBudget = matchMoneyAfter(normalized, /\b(budget|capital|cash|available money|i have)\b/i);
  patch.seedCostPerAcre = matchMoneyAfter(normalized, /\b(seed|seeds)\b/i);
  patch.fertilizerCostPerAcre = matchMoneyAfter(normalized, /\b(fertilizer|fertiliser|manure)\b/i);
  patch.laborCostPerAcre = matchMoneyAfter(normalized, /\b(labor|labour|workers?|fieldwork|equipment)\b/i);
  patch.landLeaseCostPerAcre = matchMoneyAfter(normalized, /\b(land lease|lease|rent|cash rent)\b/i);
  patch.marketPricePerUnit = matchMoneyAfter(
    normalized,
    /\b(market price|selling price|sell price|price|sell at|selling at)\b/i,
  );
  patch.transportCost = matchMoneyAfter(normalized, /\b(transport|transportation|logistics)\b/i);

  const harvest = matchHarvest(normalized, patch.landSizeAcres);
  if (harvest) patch.expectedHarvestPerAcre = harvest;

  const storageMonths = matchNumber(normalized, /\b(?:store|storage|keep)\D{0,20}(\d+(?:\.\d+)?)\s*(month|months)\b/i);
  if (storageMonths) patch.storageMonths = storageMonths.value;

  removeUndefinedKeys(patch);

  const extractedFields = getPatchFields(patch);

  return {
    patch,
    confidence: extractedFields.length > 2 ? 0.62 : 0.38,
    extractedFields,
    missingFields: getMissingCoreFields(patch),
    notes:
      extractedFields.length > 0
        ? ["Local parser extracted obvious farm assumptions. Connect GEMINI_API_KEY for Gemma extraction."]
        : ["No clear farm assumptions were detected."],
    provider: "local-fallback",
  };
}

export function parseScenarioLocally(question: string, currentInput: FarmPlanInput): ScenarioParseResult {
  const operations: ScenarioOperation[] = [];
  const normalized = question.replace(/\s+/g, " ");

  const storage = matchNumber(normalized, /\b(?:store|storage|stored|keep)\D{0,24}(\d+(?:\.\d+)?)\s*(month|months)\b/i);
  if (storage) {
    operations.push({ field: "storageMonths", operation: "set", value: storage.value });
  }

  for (const [field, pattern] of fieldAliases) {
    if (!pattern.test(normalized) || field === "storageMonths") continue;
    const operation = extractOperation(normalized);
    if (operation) operations.push({ field, ...operation });
  }

  const patch = applyScenarioOperations(currentInput, operations);
  const changedFields = operations.map((operation) => operation.field);

  return {
    operations,
    patch,
    changedFields,
    explanation:
      operations.length > 0
        ? "The scenario was converted into parameter changes. HarvestWise AI will recalculate the plan with deterministic code."
        : "No scenario changes were detected. Try asking about fertilizer cost, market price, harvest, budget, transport, or storage months.",
    provider: "local-fallback",
  };
}

function extractOperation(text: string): { operation: ScenarioOperationKind; value: number } | null {
  const percent = matchNumber(text, /(\d+(?:\.\d+)?)\s*%/i);
  const toValue = matchNumber(text, /\b(?:to|at|becomes?|become)\s*(?:\$|USD)?\s*([\d,.]+[kKmM]?)/i);
  const money = matchNumber(text, /(?:\$|USD)\s*([\d,.]+[kKmM]?)/i);
  const plainValue = matchNumber(text, /\bby\s*(?:\$|USD)?\s*([\d,.]+[kKmM]?)/i);
  const isDown = /\b(drop|drops|fall|falls|decrease|decreases|reduce|reduces|lower|down)\b/i.test(text);
  const isUp = /\b(rise|rises|increase|increases|higher|up|goes up|grow|grows)\b/i.test(text);

  if (percent) {
    return {
      operation: isDown ? "decreasePercent" : "increasePercent",
      value: percent.value,
    };
  }

  if (toValue) return { operation: "set", value: toValue.value };
  if (money && !/\bby\b/i.test(text)) return { operation: "set", value: money.value };
  if (plainValue) {
    return {
      operation: isDown ? "decreaseBy" : isUp ? "increaseBy" : "set",
      value: plainValue.value,
    };
  }

  return null;
}

function matchMoneyAfter(text: string, label: RegExp): number | undefined {
  const match = label.exec(text);
  if (!match) return undefined;
  const tail = text.slice(match.index, match.index + 96);
  const currencyValue = matchNumber(tail, /(?:\$|USD)\s*([\d,.]+[kKmM]?)/i);
  if (currencyValue) return currencyValue.value;

  return matchNumber(tail, /([\d,.]+[kKmM]?)/i)?.value;
}

function matchHarvest(text: string, landSize?: number): number | undefined {
  const perAcre = matchNumber(text, /\b(?:expect|expected|harvest|yield|produce)\D{0,30}(\d+(?:\.\d+)?)\s*(bushels?|bu)\s*(?:per|\/)\s*acre\b/i);
  if (perAcre) return perAcre.value;

  const total = matchNumber(text, /\b(?:expect|expected|harvest|yield|produce)\D{0,30}(\d+(?:\.\d+)?)\s*(bushels?|bu)\b/i);
  if (total && landSize && landSize > 0) return total.value / landSize;
  return total?.value;
}

function matchNumber(text: string, pattern: RegExp): { value: number; unit?: string } | undefined {
  const match = pattern.exec(text);
  if (!match) return undefined;
  return {
    value: parseNumber(match[1]),
    unit: match[2],
  };
}

function parseNumber(raw: string): number {
  const multiplier = /m$/i.test(raw) ? 1_000_000 : /k$/i.test(raw) ? 1_000 : 1;
  const clean = raw.replace(/[^\d.]/g, "");
  return Number(clean) * multiplier;
}

function removeUndefinedKeys(patch: FarmPlanPatch): void {
  for (const key of Object.keys(patch) as Array<keyof FarmPlanPatch>) {
    if (patch[key] === undefined) delete patch[key];
  }
}

export function normalizeCropId(value: unknown): CropId | undefined {
  if (typeof value !== "string") return undefined;
  const lower = value.toLowerCase();
  if (lower in cropCatalog) return lower as CropId;
  return cropAliases.find(([, pattern]) => pattern.test(lower))?.[0];
}
