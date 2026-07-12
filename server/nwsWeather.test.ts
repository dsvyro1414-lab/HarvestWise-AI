import { describe, expect, it } from "vitest";
import { getWeatherLocation } from "../src/domain/weather.js";
import { buildWeatherContextFromPayloads } from "./nwsWeather.js";

describe("NWS weather normalization", () => {
  const now = new Date("2026-07-12T16:00:00.000Z");

  it("keeps a timestamped forecast, selected location, and active alert separate from plan math", () => {
    const context = buildWeatherContextFromPayloads({
      location: getWeatherLocation("central-illinois"),
      forecastPayload: {
        properties: {
          updateTime: "2026-07-12T14:00:00+00:00",
          periods: [
            {
              name: "This Afternoon",
              startTime: "2026-07-12T12:00:00-05:00",
              endTime: "2026-07-12T18:00:00-05:00",
              temperature: 82,
              temperatureUnit: "F",
              windSpeed: "10 mph",
              windDirection: "SW",
              shortForecast: "Chance Thunderstorms",
              probabilityOfPrecipitation: { value: 55 },
            },
          ],
        },
      },
      alertsPayload: {
        features: [
          {
            id: "https://api.weather.gov/alerts/NWS-123",
            properties: {
              event: "Severe Thunderstorm Watch",
              severity: "Severe",
              urgency: "Expected",
              headline: "Severe thunderstorms possible",
              effective: "2026-07-12T13:00:00-05:00",
              expires: "2026-07-12T21:00:00-05:00",
            },
          },
        ],
      },
      now,
    });

    expect(context).toMatchObject({
      sourceName: "National Weather Service",
      location: { id: "central-illinois" },
      forecast: { temperature: 82, temperatureUnit: "F", freshness: "fresh" },
      alerts: { status: "available" },
    });
    expect(context?.alerts.status === "available" && context.alerts.items[0]?.event).toBe("Severe Thunderstorm Watch");
    expect(context?.timingPrompt).toContain("Confirm fieldwork");
  });

  it("marks a stale forecast and never claims there are no alerts when the alert request fails", () => {
    const context = buildWeatherContextFromPayloads({
      location: getWeatherLocation("central-iowa"),
      forecastPayload: {
        properties: {
          updated: "2026-07-10T10:00:00+00:00",
          periods: [
            {
              name: "Today",
              startTime: "2026-07-12T12:00:00-05:00",
              endTime: "2026-07-12T18:00:00-05:00",
              temperature: 76,
              temperatureUnit: "F",
              windSpeed: "Calm",
              windDirection: "N/A",
              shortForecast: "Mostly Sunny",
              probabilityOfPrecipitation: { value: 10 },
            },
          ],
        },
      },
      alertsPayload: null,
      now,
    });

    expect(context?.forecast.freshness).toBe("stale");
    expect(context?.alerts).toMatchObject({ status: "unavailable" });
  });
});
