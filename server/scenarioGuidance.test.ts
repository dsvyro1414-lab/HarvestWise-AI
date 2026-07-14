import { describe, expect, it } from "vitest";
import { createDefaultFarmInput } from "../src/domain/crops.js";
import { buildLocalScenarioGuidance, normalizeScenarioGuidance } from "./scenarioGuidance.js";

describe("scenario guidance", () => {
  it("answers a rainy-winter question and suggests a separate numeric stress test", () => {
    const guidance = buildLocalScenarioGuidance(
      "What if the weather will be rainy the whole winter?",
      createDefaultFarmInput("corn"),
    );

    expect(guidance.kind).toBe("weather");
    expect(guidance.answer).toContain("No plan numbers");
    expect(guidance.nextSteps.join(" ")).toContain("Weather timing");
    expect(guidance.suggestedScenario).toContain("10%");
    expect(guidance.provider).toBe("local-fallback");
  });

  it("keeps a valid model guidance object but strips unsupported fields", () => {
    expect(normalizeScenarioGuidance({
      kind: "weather",
      title: "Wet fields can delay access",
      answer: "Rain can affect field access, but no plan values changed without a numeric assumption.",
      nextSteps: ["Check the location forecast.", "Choose a harvest stress test."],
      suggestedScenario: "What if harvest falls by 10%?",
      inventedFinance: 999999,
    })).toEqual({
      kind: "weather",
      title: "Wet fields can delay access",
      answer: "Rain can affect field access, but no plan values changed without a numeric assumption.",
      nextSteps: ["Check the location forecast.", "Choose a harvest stress test."],
      suggestedScenario: "What if harvest falls by 10%?",
    });
  });

  it("rejects incomplete model guidance", () => {
    expect(normalizeScenarioGuidance({ title: "Too short", answer: "No", nextSteps: [] })).toBeUndefined();
  });
});
