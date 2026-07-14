import { describe, expect, it } from "vitest";
import { buildFallbackAdvice } from "./advice.js";
import { createDefaultFarmInput } from "./crops.js";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan } from "./finance.js";

function adviceFor(question: string) {
  const input = createDefaultFarmInput("corn");
  const plan = calculateFarmPlan(input);
  return buildFallbackAdvice({
    input,
    plan,
    comparisons: buildCropComparison(input),
    marketDecisions: buildMarketDecisions(input),
    question,
  });
}

describe("question-aware local advisor", () => {
  it("answers a greeting instead of repeating a generic finance report", () => {
    const advice = adviceFor("hello");

    expect(advice.summary).toMatch(/^Hi/);
    expect(advice.summary).toContain("current calculated next action");
    expect(advice.insights).toHaveLength(2);
    expect(advice.provider).toBe("local-fallback");
  });

  it("answers a rainy-winter question without changing or inventing finance", () => {
    const advice = adviceFor("What if the weather will be rainy the whole winter?");

    expect(advice.summary).toContain("rainy winter");
    expect(advice.summary).toContain("has not changed");
    expect(advice.insights.join(" ")).toContain("Weather timing check");
    expect(advice.insights.join(" ")).toContain("harvest per acre falling by 10%");
  });

  it("gives a scoped recovery path for an unsupported question", () => {
    const advice = adviceFor("Write a poem about tractors");

    expect(advice.summary).toContain("could not provide a usable answer");
    expect(advice.insights.join(" ")).toContain("focused plan question");
  });
});
