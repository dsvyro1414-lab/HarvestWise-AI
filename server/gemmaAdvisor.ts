import { GoogleGenAI } from "@google/genai";
import { buildFallbackAdvice } from "../src/domain/advice";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "../src/domain/finance";
import type { AdvisorPayload, FarmPlanInput } from "../src/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "../src/utils/formatters";

interface BuildAdvisorArgs {
  input: FarmPlanInput;
  mode: "explain" | "farmerMessage";
  question?: string;
}

const modelName = process.env.GEMMA_MODEL ?? "gemma-3-27b-it";

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
        systemInstruction:
          "You are HarvestWise AI, an agriculture finance advisor for smallholder farmers. Explain deterministic calculations clearly. Do not invent new numbers. Do not recommend borrowing. Keep advice practical, cautious, and farmer-friendly.",
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
  mode: "explain" | "farmerMessage";
  question?: string;
}): string {
  const { fallback, input, mode, question } = args;
  const plan = calculateFarmPlan(input);
  const comparisons = buildCropComparison(input).slice(0, 4);
  const marketDecisions = buildMarketDecisions(input);

  return JSON.stringify(
    {
      task:
        mode === "farmerMessage"
          ? "Generate a concise advisor explanation and farmer-facing message."
          : "Explain the farm profit plan in simple language for a farmer and cooperative advisor.",
      userQuestion: question,
      requiredJsonShape: {
        summary: "string",
        insights: ["string", "string", "string"],
        recommendations: ["string", "string", "string"],
        farmerMessage: "string",
      },
      rules: [
        "Use only the provided numbers.",
        "Do not claim certainty about future prices.",
        "Do not tell the farmer to take a loan.",
        "Keep the language simple and actionable.",
        "Mention risk if profit depends strongly on market price.",
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
        bestAction: plan.bestAction,
        budgetGap: formatCurrency(plan.budgetGap),
      },
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
  if (typeof parsed.farmerMessage === "string") result.farmerMessage = parsed.farmerMessage;

  const insights = cleanList(parsed.insights);
  if (insights) result.insights = insights;

  const recommendations = cleanList(parsed.recommendations);
  if (recommendations) result.recommendations = recommendations;

  return result;
}

function cleanList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return items.length > 0 ? items.slice(0, 4) : undefined;
}
