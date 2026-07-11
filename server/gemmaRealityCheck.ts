import { GoogleGenAI } from "@google/genai";
import { buildLocalRealityCheckPrompt } from "../src/domain/actionPack.js";
import { calculateFarmPlan } from "../src/domain/finance.js";
import type { RealityCheckPrompt } from "../src/domain/actionPack.js";
import type { FarmPlanInput } from "../src/domain/types.js";
import { parseGemmaJson } from "./gemmaJson.js";

const modelName = process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it";

export async function buildRealityCheckQuestion(args: {
  input: FarmPlanInput;
}): Promise<RealityCheckPrompt> {
  const plan = calculateFarmPlan(args.input);
  const fallback = buildLocalRealityCheckPrompt(args.input, plan);
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) return fallback;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { retryOptions: { attempts: 3 } },
    });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: JSON.stringify(
        {
          task: "Turn the already-selected farm verification topic into one concise practical question.",
          selectedCheck: fallback.checkId,
          deterministicContext: fallback.context,
          localQuestion: fallback.question,
          rules: [
            "Return exactly one JSON object with question only.",
            "Ask only about selectedCheck.",
            "Do not calculate, forecast, recommend an action, or introduce a price or number not present in deterministicContext.",
            "Write one question under 45 words for a farmer to ask a buyer, landowner, supplier, or themselves.",
          ],
          outputExample: { question: fallback.question },
        },
        null,
        2,
      ),
      config: {
        temperature: 0.25,
        systemInstruction:
          "You are the wording layer of HarvestWise AI. The app selected the verification topic deterministically; you only phrase the supplied question in plain, practical language.",
      },
    });
    const parsed = parseGemmaJson(response.text ?? "") as Record<string, unknown>;
    const question = cleanQuestion(parsed.question);

    if (!question) throw new SyntaxError("Gemma returned no usable reality-check question.");

    return { ...fallback, question, provider: "gemma" };
  } catch (error) {
    console.warn("Gemma reality-check wording failed; using local question.", error);
    return fallback;
  }
}

function cleanQuestion(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const question = value.trim();
  return question.length >= 12 && question.length <= 280 && !/[{}]/.test(question) ? question : undefined;
}
