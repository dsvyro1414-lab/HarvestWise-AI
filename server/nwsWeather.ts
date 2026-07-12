import { getActiveAlertsUrl, getPublicForecastUrl, getWeatherLocation } from "../src/domain/weather.js";
import type {
  WeatherAlert,
  WeatherAlerts,
  WeatherContext,
  WeatherForecast,
  WeatherFreshness,
  WeatherLocation,
  WeatherLocationId,
  WeatherResponse,
} from "../src/domain/types.js";

const NWS_API = "https://api.weather.gov";
const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "HarvestWise AI (https://harvestwise-ai.vercel.app)",
};
const FRESH_AFTER_MS = 8 * 60 * 60 * 1000;
const AGING_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Retrieves NWS forecast and alert context for a farmer-selected location.
 * This never alters a plan, calculation, risk score, or recommended action.
 */
export async function getNwsWeatherContext(locationId: WeatherLocationId): Promise<WeatherResponse> {
  const location = getWeatherLocation(locationId);

  try {
    const pointPayload = await fetchJson(`${NWS_API}/points/${location.latitude},${location.longitude}`);
    const forecastUrl = readText(getProperties(pointPayload), ["forecast"]);

    if (!isNwsApiUrl(forecastUrl)) {
      return unavailable(location, "no-forecast", "NWS did not return a usable forecast for this selected location.");
    }

    const [forecastResult, alertsResult] = await Promise.allSettled([
      fetchJson(forecastUrl),
      fetchJson(`${NWS_API}/alerts/active?point=${location.latitude},${location.longitude}`),
    ]);

    if (forecastResult.status !== "fulfilled") {
      return unavailable(location, "upstream-error", "NWS forecast data is unavailable right now. No plan assumptions have changed.");
    }

    const now = new Date();
    const context = buildWeatherContextFromPayloads({
      location,
      forecastPayload: forecastResult.value,
      alertsPayload: alertsResult.status === "fulfilled" ? alertsResult.value : null,
      now,
    });

    return context
      ? { status: "available", context }
      : unavailable(location, "no-forecast", "NWS returned no usable forecast period for this selected location.");
  } catch {
    return unavailable(location, "upstream-error", "NWS weather data is unavailable right now. No plan assumptions have changed.");
  }
}

export function buildWeatherContextFromPayloads(args: {
  location: WeatherLocation;
  forecastPayload: unknown;
  alertsPayload: unknown | null;
  now: Date;
}): WeatherContext | null {
  const forecast = parseForecast(args.forecastPayload, args.now);
  if (!forecast) return null;

  const alerts = args.alertsPayload === null
    ? { status: "unavailable", message: "NWS alerts could not be checked with this forecast." } satisfies WeatherAlerts
    : parseAlerts(args.alertsPayload, args.now);

  return {
    sourceName: "National Weather Service",
    forecastUrl: getPublicForecastUrl(args.location),
    alertsUrl: getActiveAlertsUrl(args.location),
    location: args.location,
    forecast,
    alerts,
    timingPrompt: buildTimingPrompt(forecast, alerts),
    fetchedAt: args.now.toISOString(),
  };
}

function parseForecast(payload: unknown, now: Date): WeatherForecast | null {
  const properties = getProperties(payload);
  const periods = Array.isArray(properties.periods) ? properties.periods.filter(isRecord) : [];
  const period = periods[0];
  if (!period) return null;

  const temperature = readNumber(period, ["temperature"]);
  const temperatureUnit = readText(period, ["temperatureUnit"]);
  const startTime = parseTimestamp(readText(period, ["startTime"]));
  const endTime = parseTimestamp(readText(period, ["endTime"]));
  const updatedAt = parseTimestamp(readText(properties, ["updateTime", "updated", "generatedAt"]));
  const shortForecast = readText(period, ["shortForecast"]);

  if (
    temperature === null ||
    (temperatureUnit !== "F" && temperatureUnit !== "C") ||
    !startTime ||
    !endTime ||
    !updatedAt ||
    !shortForecast
  ) {
    return null;
  }

  return {
    periodName: readText(period, ["name"]) || "Next forecast period",
    startTime,
    endTime,
    updatedAt,
    temperature,
    temperatureUnit,
    windSpeed: readText(period, ["windSpeed"]) || "Not reported",
    windDirection: readText(period, ["windDirection"]) || "Not reported",
    shortForecast,
    probabilityOfPrecipitation: readNumber(getRecord(period.probabilityOfPrecipitation), ["value"]),
    freshness: freshnessFor(new Date(updatedAt), now),
  };
}

function parseAlerts(payload: unknown, now: Date): WeatherAlerts {
  if (!isRecord(payload) || !Array.isArray(payload.features)) {
    return { status: "unavailable", message: "NWS alerts returned an unreadable response." };
  }

  const items = payload.features
    .filter(isRecord)
    .map((feature) => toAlert(feature))
    .filter((alert): alert is WeatherAlert => alert !== null)
    .sort((left, right) => alertPriority(left) - alertPriority(right));

  return { status: "available", checkedAt: now.toISOString(), items: items.slice(0, 2) };
}

function toAlert(feature: Record<string, unknown>): WeatherAlert | null {
  const properties = getProperties(feature);
  const event = readText(properties, ["event"]);
  const effectiveAt = parseTimestamp(readText(properties, ["effective", "sent"]));
  const expiresAt = parseTimestamp(readText(properties, ["expires", "ends"]));
  const id = readText(feature, ["id", "@id"]);

  if (!event || !effectiveAt || !expiresAt || !id) return null;

  return {
    id,
    event,
    severity: readText(properties, ["severity"]) || "Unknown",
    urgency: readText(properties, ["urgency"]) || "Unknown",
    headline: readText(properties, ["headline"]) || event,
    effectiveAt,
    expiresAt,
    sourceUrl: isNwsApiUrl(id) ? id : NWS_API,
  };
}

function buildTimingPrompt(forecast: WeatherForecast, alerts: WeatherAlerts): string {
  const activeAlert = alerts.status === "available" ? alerts.items[0] : null;
  if (activeAlert) {
    return `An active ${activeAlert.event} is in effect. Confirm fieldwork, hauling, and crew timing with local conditions before acting.`;
  }

  if (/(thunderstorm|heavy rain|snow|ice|wind|fog)/i.test(forecast.shortForecast)) {
    return `Before fieldwork or hauling during ${forecast.periodName.toLowerCase()}, verify the local weather window and road conditions.`;
  }

  if ((forecast.probabilityOfPrecipitation ?? 0) >= 50) {
    return `A ${forecast.probabilityOfPrecipitation}% precipitation chance is forecast. Keep fieldwork and delivery timing flexible, then verify locally.`;
  }

  return `Use this ${forecast.periodName.toLowerCase()} forecast as a timing check; confirm the field, road, and buyer schedule locally.`;
}

function unavailable(
  location: WeatherLocation,
  reason: Extract<WeatherResponse, { status: "unavailable" }>["reason"],
  message: string,
): WeatherResponse {
  return { status: "unavailable", reason, message, location };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: NWS_HEADERS, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`NWS request failed with ${response.status}`);
  return response.json();
}

function getProperties(payload: unknown): Record<string, unknown> {
  return isRecord(payload) ? getRecord(payload.properties) : {};
}

function getRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function readText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function parseTimestamp(value: string): string | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function freshnessFor(updatedAt: Date, now: Date): WeatherFreshness {
  const age = Math.max(0, now.getTime() - updatedAt.getTime());
  if (age <= FRESH_AFTER_MS) return "fresh";
  if (age <= AGING_AFTER_MS) return "aging";
  return "stale";
}

function alertPriority(alert: WeatherAlert): number {
  const severity = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 }[alert.severity] ?? 4;
  const urgency = { Immediate: 0, Expected: 1, Future: 2, Past: 3, Unknown: 4 }[alert.urgency] ?? 4;
  return severity * 10 + urgency;
}

function isNwsApiUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "api.weather.gov";
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
