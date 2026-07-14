import { describe, expect, it } from "vitest";
import { parseAdvisorJson } from "./gemmaAdvisor.js";

describe("parseAdvisorJson", () => {
  it("accepts a focused explain response without requiring an unrelated WhatsApp draft", () => {
    expect(parseAdvisorJson(JSON.stringify({
      summary: "Hi — I can explain the current plan and its calculated next action.",
      insights: ["Ask about profit or risk.", "Use a numeric what-if to recalculate."],
    }), "explain")).toEqual({
      summary: "Hi — I can explain the current plan and its calculated next action.",
      insights: ["Ask about profit or risk.", "Use a numeric what-if to recalculate."],
    });
  });

  it("accepts a WhatsApp-only response in WhatsApp mode", () => {
    expect(parseAdvisorJson(JSON.stringify({
      whatsappMessage: "HarvestWise update: confirm the entered buyer price before planting.",
    }), "whatsapp")).toEqual({
      whatsappMessage: "HarvestWise update: confirm the entered buyer price before planting.",
    });
  });

  it("rejects an explain response without two useful insights", () => {
    expect(() => parseAdvisorJson(JSON.stringify({
      summary: "This answer is long enough to pass the text sanitizer.",
      insights: ["Only one insight is present."],
    }), "explain")).toThrow("incomplete or malformed advisor response");
  });
});
