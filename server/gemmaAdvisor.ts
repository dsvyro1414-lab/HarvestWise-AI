import { GoogleGenAI, Type } from "@google/genai";
import { buildFallbackAdvice } from "../src/domain/advice";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "../src/domain/finance";
import type { AdvisorPayload, FarmPlanInput } from "../src/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "../src/utils/formatters";

interface BuildAdvisorArgs {
  input: FarmPlanInput;
  mode: "explain" | "whatsapp";
  question?: string;
}

const modelName = process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";

const advisorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
    whatsappMessage: { type: Type.STRING },
  },
  required: ["summary", "insights", "whatsappMessage"],
};

export async function buildAdvisorNotes({ input, mode, question }: BuildAdvisorArgs): Promise<AdvisorPayload> {
  const plan = calculateFarmPlan(input);
  const comparisons = buildCropComparison(input);
  const marketDecisions = buildMarketDecisions(input);
  const fallback = buildFallbackAdvice({ input, plan, comparisons, marketDecisions });
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: buildPrompt({ fallback, input, mode, question }),
      config: {
        temperature: 0.35,
        responseMimeType: "application/json",
        responseSchema: advisorResponseSchema,
        systemInstruction:
          "You are the explanation layer of HarvestWise AI for smallholder farmers. Explain only the supplied deterministic plan and decision in practical, cautious language. Never calculate, replace, or add a recommendation. Do not invent numbers or recommend borrowing.",
      },
    });
    const parsed = parseAdvisorJson(response.text ?? "");

    return {
      ...fallback,
      ...parsed,
      provider: "gemma",
    };
  } catch (error) {
    console.warn("Gemma advice failed; using fallback.", error);
    return fallback;
  }
}

function buildPrompt(args: {
  fallback: AdvisorPayload;
  input: FarmPlanInput;
  mode: "explain" | "whatsapp";
  question?: string;
}): string {
  const { fallback, input, mode, question } = args;
  const plan = calculateFarmPlan(input);
  const comparisons = buildCropComparison(input).slice(0, 4);
  const marketDecisions = buildMarketDecisions(input);

  return JSON.stringify(
    {
      task:
        mode === "whatsapp"
          ? "Generate a concise WhatsApp explanation of the deterministic plan and its already-made decision."
          : "Explain the deterministic farm plan and its already-made decision in simple language for a farmer and cooperative advisor.",
      userQuestion: question,
      requiredJsonShape: {
        summary: "string",
        insights: ["string", "string"],
        whatsappMessage: "string",
      },
      rules: [
        "Use only the provided numbers.",
        "Do not claim certainty about future prices.",
        "Do not tell the farmer to take a loan.",
        "Keep the language simple and actionable.",
        "Mention risk if profit depends strongly on market price.",
        "Do not create, replace, or reword the recommended next action. Explain the deterministic decision exactly as supplied.",
      ],
      deterministicPlan: {
        crop: plan.crop.name,
        landSizeAcres: formatNumber(input.landSizeAcres, 1),
        expectedProfit: formatCurrency(plan.expectedProfit),
        totalSeasonCost: formatCurrency(plan.totalSeasonCost),
        grossRevenue: formatCurrency(plan.grossRevenue),
        breakEvenPrice: `${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}`,
        riskLevel: plan.riskLevel,
        roi: formatPercent(plan.roi),
        budgetGap: formatCurrency(plan.budgetGap),
      },
      deterministicDecision: plan.action,
      cropComparison: comparisons.map((item) => ({
        crop: item.crop.name,
        expectedProfit: formatCurrency(item.expectedProfit),
        breakEvenPrice: `${formatCurrency(item.breakEvenPrice)} per ${item.crop.unit}`,
        riskLevel: item.riskLevel,
        cashReturnMonths: item.cashReturnMonths,
      })),
      marketDecisions: marketDecisions.map((item) => ({
        option: item.label,
        estimatedPrice: formatCurrency(item.estimatedPrice),
        expectedProfit: formatCurrency(item.expectedProfit),
        riskLevel: item.riskLevel,
      })),
      fallbackDraft: fallback,
    },
    null,
    2,
  );
}

function parseAdvisorJson(rawText: string): Partial<AdvisorPayload> {
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(jsonText) as Partial<AdvisorPayload>;
  const result: Partial<AdvisorPayload> = {};

  if (typeof parsed.summary === "string") result.summary = parsed.summary;
  if (typeof parsed.whatsappMessage === "string") result.whatsappMessage = parsed.whatsappMessage;

  const insights = cleanList(parsed.insights);
  if (insights) result.insights = insights;

  return result;
}

function cleanList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items.slice(0, 4) : undefined;
}
