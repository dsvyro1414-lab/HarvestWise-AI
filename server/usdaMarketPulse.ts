import type { CropId, MarketPulseFreshness, MarketPulseObservation, MarketPulseResponse, MarketPulseSource } from "../src/domain/types.js";

const MARKET_NEWS_URL = "https://marsapi.ams.usda.gov/services/v1.2/reports/3192";
const REPORT_URL = "https://mymarketnews.ams.usda.gov/viewReport/3192";
const FRESH_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
const AGING_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

const cropLabels: Record<CropId, string> = {
  corn: "Corn",
  soybeans: "Soybeans",
  wheat: "Wheat",
};

export const illinoisGrainBidsSource: MarketPulseSource = {
  name: "USDA AMS Market News",
  reportName: "Illinois Grain Bids",
  reportUrl: REPORT_URL,
  location: "Illinois cash-bid market",
};

/**
 * Retrieves a single, comparable cash-bid observation from USDA Market News.
 * The key stays on the server; lack of a key is an explicit unavailable state,
 * never a fabricated or default market price.
 */
export async function getUsdaMarketPulse(cropId: CropId): Promise<MarketPulseResponse> {
  const apiKey = process.env.USDA_MARKET_NEWS_API_KEY?.trim();

  if (!apiKey) {
    return unavailable(
      "not-configured",
      "USDA Market Pulse needs a MyMarketNews API key before HarvestWise can load a live cash-bid observation.",
    );
  }

  const url = new URL(MARKET_NEWS_URL);
  url.searchParams.set("q", `commodity=${cropLabels[cropId]}`);
  url.searchParams.set("allSections", "true");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return unavailable(
        "upstream-error",
        "USDA Market News could not be reached right now. Your plan price has not changed.",
      );
    }

    const payload = (await response.json()) as unknown;
    const observation = extractComparableObservation(payload, cropId);

    return observation
      ? { status: "available", observation }
      : unavailable(
          "no-comparable-observation",
          "The latest Illinois report has no comparable USD/bu observation for this crop. Your plan price remains unchanged.",
        );
  } catch {
    return unavailable(
      "upstream-error",
      "USDA Market News could not be reached right now. Your plan price has not changed.",
    );
  }
}

export function extractComparableObservation(
  payload: unknown,
  cropId: CropId,
  now = new Date(),
): MarketPulseObservation | null {
  const records = getRecords(payload);
  const cropLabel = cropLabels[cropId].toLowerCase();

  const candidates = records
    .filter((record) => readText(record, ["commodity"]).toLowerCase() === cropLabel)
    .map((record) => toObservation(record, cropId, now))
    .filter((observation): observation is MarketPulseObservation => observation !== null)
    .sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt));

  return candidates[0] ?? null;
}

function toObservation(record: Record<string, unknown>, cropId: CropId, now: Date): MarketPulseObservation | null {
  const unit = readText(record, ["price_unit", "unit"]);
  const price = readNumber(record, ["avg_price", "price", "average_price", "price_average"]);
  const observedAt = parseDate(readText(record, ["report_date", "published_date", "report_begin_date"]));

  if (price === null || price <= 0 || !isBushelUnit(unit) || !observedAt) return null;

  const location = readText(record, ["market_location_name", "market_name", "office_name", "office_city"])
    || illinoisGrainBidsSource.location;
  const reportName = readText(record, ["report_title"]) || illinoisGrainBidsSource.reportName;
  const grade = readText(record, ["quality_grade_name", "grade", "class"]) || "Not reported";
  const contract = readText(record, ["delivery", "delivery_period", "contract", "price_type"]) || "Current cash bid";

  return {
    ...illinoisGrainBidsSource,
    reportName,
    location,
    cropId,
    commodity: cropLabels[cropId],
    grade,
    contract,
    unit: "USD/bu",
    price,
    observedAt: observedAt.toISOString(),
    fetchedAt: now.toISOString(),
    freshness: freshnessFor(observedAt, now),
    limitation: "This is a reported cash-bid observation, not a guaranteed buyer offer. Confirm grade, basis, delivery point, and timing locally before committing.",
  };
}

function unavailable(
  reason: Extract<MarketPulseResponse, { status: "unavailable" }>["reason"],
  message: string,
): MarketPulseResponse {
  return { status: "unavailable", reason, message, source: illinoisGrainBidsSource };
}

function getRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.results)) return payload.results.filter(isRecord);
  if (Array.isArray(payload.data)) return payload.data.filter(isRecord);
  return [];
}

function readText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[$,\s]/g, "");
      if (/^\d+(?:\.\d+)?$/.test(normalized)) return Number(normalized);
    }
  }
  return null;
}

function parseDate(value: string): Date | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function isBushelUnit(unit: string): boolean {
  return /\b(?:bu|bushel|bushels)\b/i.test(unit);
}

function freshnessFor(observedAt: Date, now: Date): MarketPulseFreshness {
  const age = Math.max(0, now.getTime() - observedAt.getTime());
  if (age <= FRESH_AFTER_MS) return "fresh";
  if (age <= AGING_AFTER_MS) return "aging";
  return "stale";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
