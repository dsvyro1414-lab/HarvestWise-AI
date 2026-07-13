import { cropCatalog } from "../src/domain/crops.js";
import {
  parseLocaleNumber,
  type NumericNormalizationOptions,
} from "../src/utils/numericNormalization.js";
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

const numericTokenSource = String.raw`\d+(?:[.,]\d+)*[kKmM]?`;
const currencySource = String.raw`(?:\$|USD)`;
const budgetLabelSource = String.raw`(?:budget|capital|available money|available cash|cash budget|cash available|cash on hand)`;
const acreageSource = String.raw`\d+(?:[.,]\d+)*\s*(?:acre|acres|hectare|hectares|ha)`;
const budgetConnectorSource = String.raw`\s*(?:(?:is|was|will be|equals?|totals?|of|at|:)\s*)?(?:(?:about|around|approximately|roughly)\s*)?`;

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
  ["availableBudget", /\b(budget|available money|available cash|cash budget|cash available|cash on hand|capital)\b/i],
  ["expectedHarvestPerAcre", /\b(harvest|yield|produce)\b/i],
  ["transportCost", /\b(transport|transportation|logistics)\b/i],
  ["storageMonths", /\b(store|storage|stored|keep)\b/i],
  ["storageCostPerMonth", /\b(storage cost|store cost)\b/i],
  ["expectedMonthlyPriceGrowth", /\b(expected monthly price growth|monthly price growth|monthly growth)\b/i],
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

  const land = matchNumber(normalized, /(\d+(?:[.,]\d+)*)\s*(acre|acres|hectare|hectares|ha)\b/i);
  if (land) {
    patch.landSizeAcres = /hectare|ha/i.test(land.unit ?? "") ? land.value * 2.471 : land.value;
  }

  patch.availableBudget = matchBudget(normalized);
  patch.seedCostPerAcre = matchMoneyAfter(normalized, /\b(seed|seeds)\b/i, { allowCurrencyGrouping: true });
  patch.fertilizerCostPerAcre = matchMoneyAfter(normalized, /\b(fertilizer|fertiliser|manure)\b/i, { allowCurrencyGrouping: true });
  patch.laborCostPerAcre = matchMoneyAfter(normalized, /\b(labor|labour|workers?|fieldwork|equipment)\b/i, { allowCurrencyGrouping: true });
  patch.landLeaseCostPerAcre = matchMoneyAfter(normalized, /\b(land lease|lease|rent|cash rent)\b/i, { allowCurrencyGrouping: true });
  patch.marketPricePerUnit = matchMoneyAfter(
    normalized,
    /\b(market price|selling price|sell price|buyer price|price(?!\s+(?:growth|rise|increase))|sell at|selling at)\b/i,
  );
  patch.transportCost = matchMoneyAfter(normalized, /\b(transport|transportation|logistics)\b/i, { allowCurrencyGrouping: true });
  patch.expectedMonthlyPriceGrowth = matchMonthlyPriceGrowth(normalized);

  const harvest = matchHarvest(normalized, patch.landSizeAcres);
  if (harvest) patch.expectedHarvestPerAcre = harvest;

  const storageMonths = matchNumber(normalized, /\b(?:store|storage|keep)\D{0,20}(\d+(?:[.,]\d+)*)\s*(month|months)\b/i);
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

  for (const clause of splitScenarioClauses(normalized)) {
    const storage = matchNumber(clause, /\b(?:store|storage|stored|keep)\D{0,24}(\d+(?:[.,]\d+)*)\s*(month|months)\b/i);
    if (storage) {
      operations.push({ field: "storageMonths", operation: "set", value: storage.value });
    }

    for (const field of getScenarioFields(clause)) {
      if (field === "storageMonths") continue;
      const operation = extractOperation(clause, field);
      if (operation) operations.push({ field, ...operation });
    }
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

function extractOperation(
  text: string,
  field: NumericFarmPlanField,
): { operation: ScenarioOperationKind; value: number } | null {
  const currencyOptions: NumericNormalizationOptions = allowsCurrencyGrouping(field)
    ? { allowSingleUsGroupingSeparator: true }
    : {};
  if (field === "expectedMonthlyPriceGrowth") {
    const targetPercent = matchNumber(
      text,
      /\b(?:to|at|becomes?|become|is|equals?)\s*(\d+(?:[.,]\d+)*)\s*%/i,
    );
    if (targetPercent) {
      return { operation: "set", value: targetPercent.value / 100 };
    }
  }

  const percent = matchNumber(text, /(\d+(?:[.,]\d+)*)\s*%/i);
  const toValue = matchNumber(text, /\b(?:to|at|becomes?|become)\s*(?:\$|USD)?\s*(\d+(?:[.,]\d+)*[kKmM]?)/i);
  const money = matchNumber(
    text,
    /(?:\$|USD)\s*(\d+(?:[.,]\d+)*[kKmM]?)/i,
    currencyOptions,
  );
  const currencyByValue = matchNumber(
    text,
    /\bby\s*(?:\$|USD)\s*(\d+(?:[.,]\d+)*[kKmM]?)/i,
    currencyOptions,
  );
  const plainValue =
    currencyByValue ??
    matchNumber(text, /\bby\s*(?:\$|USD)?\s*(\d+(?:[.,]\d+)*[kKmM]?)/i);
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

function matchMoneyAfter(
  text: string,
  label: RegExp,
  options: { allowCurrencyGrouping?: boolean } = {},
): number | undefined {
  const match = label.exec(text);
  if (!match) return undefined;
  const tail = text.slice(match.index + match[0].length, match.index + match[0].length + 48);
  const currencyValue = matchNumber(
    tail,
    /^[^\d,;.]{0,24}(?:\$|USD)\s*(\d+(?:[.,]\d+)*[kKmM]?)/i,
    options.allowCurrencyGrouping ? { allowSingleUsGroupingSeparator: true } : {},
  );
  if (currencyValue) return currencyValue.value;

  return matchNumber(tail, /^[^\d,;.]{0,24}(\d+(?:[.,]\d+)*[kKmM]?)/i)?.value;
}

function matchBudget(text: string): number | undefined {
  const patterns: Array<{ pattern: RegExp; allowGrouping: boolean }> = [
    {
      pattern: new RegExp(`${currencySource}\\s*(${numericTokenSource})\\s+${budgetLabelSource}\\b`, "i"),
      allowGrouping: true,
    },
    {
      pattern: new RegExp(
        `\\b${budgetLabelSource}\\b\\s+for\\s+${acreageSource}${budgetConnectorSource}${currencySource}\\s*(${numericTokenSource})`,
        "i",
      ),
      allowGrouping: true,
    },
    {
      pattern: new RegExp(
        `\\b${budgetLabelSource}\\b${budgetConnectorSource}${currencySource}\\s*(${numericTokenSource})`,
        "i",
      ),
      allowGrouping: true,
    },
    {
      pattern: new RegExp(
        `\\b${budgetLabelSource}\\b\\s+for\\s+${acreageSource}${budgetConnectorSource}(${numericTokenSource})`,
        "i",
      ),
      allowGrouping: false,
    },
    {
      pattern: new RegExp(
        `\\b${budgetLabelSource}\\b${budgetConnectorSource}(${numericTokenSource})`,
        "i",
      ),
      allowGrouping: false,
    },
    {
      pattern: new RegExp(
        `\\bi have\\s*(?:(?:about|around|approximately|roughly)\\s*)?${currencySource}\\s*(${numericTokenSource})(?=\\s*(?:$|[;,.!?]|available\\b|in cash\\b|cash on hand\\b|budget\\b|to spend\\b))`,
        "i",
      ),
      allowGrouping: true,
    },
  ];

  for (const { pattern, allowGrouping } of patterns) {
    const result = matchNumber(
      text,
      pattern,
      allowGrouping ? { allowSingleUsGroupingSeparator: true } : {},
    );
    if (result) return result.value;
  }

  return undefined;
}

function matchMonthlyPriceGrowth(text: string): number | undefined {
  const label = /\b(?:expected\s+)?monthly price growth|\bmonthly growth\b/i.exec(text);
  if (!label) return undefined;

  const tail = text.slice(label.index + label[0].length, label.index + label[0].length + 48);
  const percent = matchNumber(
    tail,
    /^[^\d,;.]{0,24}(\d+(?:[.,]\d+)*)\s*%/i,
  );
  if (percent) return percent.value / 100;

  const decimal = matchNumber(tail, /^[^\d,;.]{0,24}(\d+(?:[.,]\d+)*)/i);
  return decimal && decimal.value <= 1 ? decimal.value : undefined;
}

function matchHarvest(text: string, landSize?: number): number | undefined {
  const perAcre = matchNumber(text, /\b(?:expect|expected|harvest|yield|produce)\D{0,30}(\d+(?:[.,]\d+)*)\s*(bushels?|bu)\s*(?:per|\/)\s*acre\b/i);
  if (perAcre) return perAcre.value;

  const total = matchNumber(text, /\b(?:expect|expected|harvest|yield|produce)\D{0,30}(\d+(?:[.,]\d+)*)\s*(bushels?|bu)\b/i);
  if (total && landSize && landSize > 0) return total.value / landSize;
  return total?.value;
}

function matchNumber(
  text: string,
  pattern: RegExp,
  options: NumericNormalizationOptions = {},
): { value: number; unit?: string } | undefined {
  const match = pattern.exec(text);
  if (!match) return undefined;
  if (!isCompleteNumericToken(text, match, match[1])) return undefined;
  const value = parseNumber(match[1], options);
  if (value === null) return undefined;

  return {
    value,
    unit: match[2],
  };
}

function isCompleteNumericToken(text: string, match: RegExpExecArray, raw: string): boolean {
  const tokenOffset = match[0].lastIndexOf(raw);
  if (tokenOffset < 0) return false;

  const tokenStart = match.index + tokenOffset;
  const tokenEnd = tokenStart + raw.length;
  const consumedPrefix = match[0].slice(0, tokenOffset);
  const consumedSuffix = match[0].slice(tokenOffset + raw.length);

  if (consumedPrefix === "") {
    const before = text.slice(0, tokenStart);
    if (/[A-Za-z0-9.,+/'’\-]$/.test(before) || /\d\s+$/.test(before)) return false;
  }

  if (consumedSuffix.trim() === "") {
    const after = text.slice(tokenEnd);
    if (
      /^[A-Za-z0-9+/'’\-]/.test(after) ||
      /^[.,](?=[\d.,+-])/.test(after) ||
      /^\s+\d/.test(after)
    ) return false;
  }

  return true;
}

function splitScenarioClauses(text: string): string[] {
  return text
    .split(/\s*(?:;|,(?!\d)|\.(?!\d)|\b(?:but|while|whereas)\b)\s*/i)
    .map((clause) => clause.trim())
    .filter(Boolean)
    .flatMap(splitCoordinatedClause);
}

function splitCoordinatedClause(clause: string): string[] {
  const pieces = clause.split(/\s+and\s+/i);
  if (pieces.length < 2) return [clause];

  const clauses: string[] = [];
  let current = pieces[0];

  for (const next of pieces.slice(1)) {
    if (hasIndependentScenarioAction(current) && hasIndependentScenarioAction(next)) {
      clauses.push(current.trim());
      current = next;
    } else {
      current = `${current} and ${next}`;
    }
  }

  clauses.push(current.trim());
  return clauses.filter(Boolean);
}

function hasIndependentScenarioAction(clause: string): boolean {
  return getScenarioFields(clause).length > 0 && (
    /\d/.test(clause) ||
    /\b(rise|rises|increase|increases|higher|up|goes up|grow|grows|drop|drops|fall|falls|decrease|decreases|reduce|reduces|lower|down|stays?|remains?|unchanged|same|no change)\b/i.test(clause)
  );
}

function getScenarioFields(clause: string): NumericFarmPlanField[] {
  const fields = fieldAliases
    .filter(([, pattern]) => pattern.test(clause))
    .map(([field]) => field);

  if (
    fields.includes("expectedMonthlyPriceGrowth") &&
    !/\b(?:market|selling|sell|buyer)\s+price\b/i.test(clause)
  ) {
    return fields.filter((field) => field !== "marketPricePerUnit");
  }

  return fields;
}

function allowsCurrencyGrouping(field: NumericFarmPlanField): boolean {
  return [
    "availableBudget",
    "seedCostPerAcre",
    "fertilizerCostPerAcre",
    "laborCostPerAcre",
    "landLeaseCostPerAcre",
    "transportCost",
    "storageCostPerMonth",
  ].includes(field);
}

function parseNumber(
  raw: string,
  options: NumericNormalizationOptions = {},
): number | null {
  const multiplier = /m$/i.test(raw) ? 1_000_000 : /k$/i.test(raw) ? 1_000 : 1;
  const numericPart = raw.replace(/[kKmM]$/, "");
  const value = parseLocaleNumber(numericPart, options);
  return value === null ? null : value * multiplier;
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
