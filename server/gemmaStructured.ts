import { GoogleGenAI } from "@google/genai";
import { applyScenarioOperations, getMissingCoreFields, getPatchFields } from "../src/domain/patches.js";
import type {
  FarmInterviewResult,
  FarmPlanField,
  FarmPlanInput,
  FarmPlanPatch,
  NumericFarmPlanField,
  ScenarioOperation,
  ScenarioParseResult,
} from "../src/domain/types.js";
import { extractInterviewLocally, normalizeCropId, parseScenarioLocally } from "./localParsers.js";
import { parseGemmaJson } from "./gemmaJson.js";

const modelName = process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";

export async function extractFarmInterview(args: {
  text: string;
  currentInput: FarmPlanInput;
}): Promise<FarmInterviewResult> {
  const fallback = extractInterviewLocally(args.text);
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { retryOptions: { attempts: 3 } },
    });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: buildInterviewPrompt(args.text),
      config: {
        temperature: 0.1,
        systemInstruction:
          "Extract farm planning parameters from natural language. Do not calculate profit, risk, ROI, or break-even. Return only fields explicitly stated or strongly implied by the text.",
      },
    });
    const patch = normalizePatch(parseGemmaJson(response.text ?? "{}"));
    const extractedFields = getPatchFields(patch);

    return {
      patch,
      confidence: extractedFields.length > 2 ? 0.86 : 0.55,
      extractedFields,
      missingFields: getMissingCoreFields(patch),
      notes: [
        "Gemma extracted structured farm assumptions only. HarvestWise AI recalculates finance in deterministic code.",
      ],
      provider: "gemma",
    };
  } catch (error) {
    console.warn("Gemma interview extraction failed; using fallback.", error);
    return fallback;
  }
}

export async function parseScenarioQuestion(args: {
  question: string;
  currentInput: FarmPlanInput;
}): Promise<ScenarioParseResult> {
  const fallback = parseScenarioLocally(args.question, args.currentInput);
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { retryOptions: { attempts: 3 } },
    });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: buildScenarioPrompt(args.question, args.currentInput),
      config: {
        temperature: 0.1,
        systemInstruction:
          "Convert what-if questions into parameter operations. Do not calculate profit, risk, ROI, revenue, or break-even. The app will apply operations and recalculate.",
      },
    });
    const operations = normalizeOperations(parseGemmaJson(response.text ?? "{}"));
    const patch = applyScenarioOperations(args.currentInput, operations);

    return {
      operations,
      patch,
      changedFields: operations.map((operation) => operation.field),
      explanation:
        operations.length > 0
          ? "Gemma converted the scenario into parameter operations. HarvestWise AI recalculated the plan deterministically."
          : "Gemma did not find a clear parameter change in the question.",
      provider: "gemma",
    };
  } catch (error) {
    console.warn("Gemma scenario parsing failed; using fallback.", error);
    return fallback;
  }
}

function buildInterviewPrompt(text: string): string {
  return JSON.stringify(
    {
      task: "Extract a farm plan patch from the farmer's natural-language plan.",
      allowedCropIds: ["corn", "soybeans", "wheat"],
      allowedPatchFields: [
        "cropId",
        "landSizeAcres",
        "availableBudget",
        "seedCostPerAcre",
        "fertilizerCostPerAcre",
        "laborCostPerAcre",
        "landLeaseCostPerAcre",
        "expectedHarvestPerAcre",
        "marketPricePerUnit",
        "transportCost",
        "storageMonths",
        "storageCostPerMonth",
        "expectedMonthlyPriceGrowth",
      ],
      units: {
        money: "USD numbers only",
        landSizeAcres: "acres",
        expectedHarvestPerAcre: "crop units per acre",
        expectedMonthlyPriceGrowth: "decimal, so 5% is 0.05",
      },
      rules: [
        "Return JSON object with patch only.",
        "Do not include fields that are not present in the text.",
        "If total harvest is provided and land size is provided, convert to per-acre harvest.",
        "Do not calculate profit, risk, or recommendations.",
      ],
      outputExample: {
        patch: {
          cropId: "corn",
          landSizeAcres: 40,
          availableBudget: 35000,
          fertilizerCostPerAcre: 210,
        },
      },
      farmerText: text,
    },
    null,
    2,
  );
}

function buildScenarioPrompt(question: string, currentInput: FarmPlanInput): string {
  return JSON.stringify(
    {
      task: "Convert a what-if question into parameter operations.",
      currentInput,
      allowedNumericFields: [
        "landSizeAcres",
        "availableBudget",
        "seedCostPerAcre",
        "fertilizerCostPerAcre",
        "laborCostPerAcre",
        "landLeaseCostPerAcre",
        "expectedHarvestPerAcre",
        "marketPricePerUnit",
        "transportCost",
        "storageMonths",
        "storageCostPerMonth",
        "expectedMonthlyPriceGrowth",
      ],
      allowedOperations: ["set", "increasePercent", "decreasePercent", "increaseBy", "decreaseBy"],
      rules: [
        "Return JSON object with operations only.",
        "Do not calculate finance outputs.",
        "For 'what if fertilizer rises by 20%', use field fertilizerCostPerAcre, operation increasePercent, value 20.",
        "For 'what if I store for 2 months', use field storageMonths, operation set, value 2.",
      ],
      outputExample: {
        operations: [
          {
            field: "fertilizerCostPerAcre",
            operation: "increasePercent",
            value: 20,
          },
        ],
      },
      question,
    },
    null,
    2,
  );
}

function normalizePatch(raw: unknown): FarmPlanPatch {
  const source = unwrapObject(raw, "patch");
  const patch: FarmPlanPatch = {};

  if (typeof source !== "object" || source === null) return patch;

  for (const [key, value] of Object.entries(source)) {
    if (key === "cropId") {
      const cropId = normalizeCropId(value);
      if (cropId) patch.cropId = cropId;
      continue;
    }

    if (isFarmPlanField(key) && typeof value === "number" && Number.isFinite(value)) {
      patch[key] = value as never;
    }
  }

  return patch;
}

function normalizeOperations(raw: unknown): ScenarioOperation[] {
  const source = unwrapObject(raw, "operations");
  if (!Array.isArray(source)) return [];

  return source
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      field: item.field,
      operation: item.operation,
      value: item.value,
    }))
    .filter((item): item is ScenarioOperation => {
      return (
        isNumericFarmPlanField(item.field) &&
        typeof item.value === "number" &&
        Number.isFinite(item.value) &&
        ["set", "increasePercent", "decreasePercent", "increaseBy", "decreaseBy"].includes(
          String(item.operation),
        )
      );
    });
}

function unwrapObject(raw: unknown, key: string): unknown {
  if (typeof raw === "object" && raw !== null && key in raw) {
    return (raw as Record<string, unknown>)[key];
  }

  return raw;
}

function isFarmPlanField(value: string): value is FarmPlanField {
  return [
    "landSizeAcres",
    "availableBudget",
    "seedCostPerAcre",
    "fertilizerCostPerAcre",
    "laborCostPerAcre",
    "landLeaseCostPerAcre",
    "expectedHarvestPerAcre",
    "marketPricePerUnit",
    "transportCost",
    "storageMonths",
    "storageCostPerMonth",
    "expectedMonthlyPriceGrowth",
  ].includes(value);
}

function isNumericFarmPlanField(value: unknown): value is NumericFarmPlanField {
  return typeof value === "string" && isFarmPlanField(value);
}
