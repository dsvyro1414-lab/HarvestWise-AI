import { afterEach, describe, expect, it, vi } from "vitest";
import { buildActionPack } from "./actionPack.js";
import { buildDecisionPackShareText } from "./decisionPack.js";
import { calculateFarmPlan } from "./finance.js";
import type { FarmPlanInput, WeatherResponse } from "./types.js";

const input: FarmPlanInput = {
  cropId: "corn",
  landSizeAcres: 40,
  availableBudget: 35_000,
  seedCostPerAcre: 115,
  fertilizerCostPerAcre: 210,
  laborCostPerAcre: 230,
  landLeaseCostPerAcre: 250,
  expectedHarvestPerAcre: 220,
  marketPricePerUnit: 4.05,
  transportCost: 1_000,
  storageMonths: 0,
  storageCostPerMonth: 0,
  expectedMonthlyPriceGrowth: 0,
  priceEvidence: {
    sourceType: "co-op",
    sourceName: "Prairie Co-op",
    location: "Central Illinois",
    checkedAt: "2026-07-10",
  },
};

describe("decision pack share text", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the deterministic action, verification checks, and source limitations together", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T12:00:00.000Z"));

    const plan = calculateFarmPlan(input);
    const weatherResponse: WeatherResponse = {
      status: "available",
      context: {
        sourceName: "National Weather Service",
        forecastUrl: "https://example.test/forecast",
        alertsUrl: "https://example.test/alerts",
        location: { id: "central-illinois", label: "Central Illinois — Champaign, IL", latitude: 40.1164, longitude: -88.2434 },
        forecast: {
          periodName: "Tonight",
          startTime: "2026-07-12T18:00:00.000Z",
          endTime: "2026-07-13T06:00:00.000Z",
          updatedAt: "2026-07-12T12:00:00.000Z",
          temperature: 65,
          temperatureUnit: "F",
          windSpeed: "5 mph",
          windDirection: "NE",
          shortForecast: "Clear",
          probabilityOfPrecipitation: 0,
          freshness: "fresh",
        },
        alerts: { status: "available", checkedAt: "2026-07-12T13:00:00.000Z", items: [] },
        timingPrompt: "Confirm the field, road, and buyer schedule locally.",
        fetchedAt: "2026-07-12T13:00:00.000Z",
      },
    };

    const text = buildDecisionPackShareText({
      input,
      plan,
      pack: buildActionPack(input, plan),
      weatherResponse,
      scenario: {
        changedFields: ["Fertilizer cost +20%"],
        beforePlan: plan,
        afterPlan: { ...plan, expectedProfit: 1_600 },
      },
    });

    expect(text).toContain("Calculated next action: Plant this plan");
    expect(text).toContain("Market price record: Co-op quote · Prairie Co-op, Central Illinois, confirmed 2026-07-10; confirmed recently.");
    expect(text).toContain("Weather timing: Central Illinois — Champaign, IL");
    expect(text).toContain("Latest what-if: Fertilizer cost +20%");
    expect(text).toContain("Gemma may interpret or explain the plan but does not choose the action.");
  });

  it("keeps an absent price record visibly absent instead of inventing a source", () => {
    const inputWithoutEvidence = { ...input, priceEvidence: undefined };
    const plan = calculateFarmPlan(inputWithoutEvidence);
    const text = buildDecisionPackShareText({
      input: inputWithoutEvidence,
      plan,
      pack: buildActionPack(inputWithoutEvidence, plan),
      weatherResponse: null,
      scenario: null,
    });

    expect(text).toContain("Market price record: Not recorded; source not recorded.");
    expect(text).toContain("Weather timing: not checked");
    expect(text).toContain("Latest what-if: none run yet.");
  });

  it("distinguishes an unavailable weather lookup from a lookup that was never requested", () => {
    const plan = calculateFarmPlan(input);
    const text = buildDecisionPackShareText({
      input,
      plan,
      pack: buildActionPack(input, plan),
      weatherResponse: {
        status: "unavailable",
        reason: "upstream-error",
        message: "NWS weather data is unavailable right now.",
        location: { id: "central-iowa", label: "Central Iowa — Des Moines, IA", latitude: 41.5868, longitude: -93.625 },
      },
      scenario: null,
    });

    expect(text).toContain("Weather timing: unavailable for Central Iowa — Des Moines, IA.");
  });
});
