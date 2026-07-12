import { describe, expect, it } from "vitest";
import { extractComparableObservation } from "./usdaMarketPulse.js";

describe("USDA Market Pulse normalization", () => {
  const now = new Date("2026-07-12T16:00:00.000Z");

  it("keeps only a comparable bushel observation for the selected crop", () => {
    const observation = extractComparableObservation(
      {
        results: [
          {
            commodity: "Corn",
            avg_price: "4.24",
            price_unit: "USD/BU",
            report_date: "2026-07-11",
            market_location_name: "Central Illinois",
            quality_grade_name: "No. 2 Yellow",
            delivery: "Current",
            report_title: "Illinois Grain Bids",
          },
          {
            commodity: "Corn",
            avg_price: "125.00",
            price_unit: "USD/ton",
            report_date: "2026-07-12",
          },
          {
            commodity: "Soybeans",
            avg_price: "10.55",
            price_unit: "USD/bu",
            report_date: "2026-07-12",
          },
        ],
      },
      "corn",
      now,
    );

    expect(observation).toMatchObject({
      cropId: "corn",
      commodity: "Corn",
      price: 4.24,
      unit: "USD/bu",
      grade: "No. 2 Yellow",
      freshness: "fresh",
    });
  });

  it("rejects a price range, a missing timestamp, and stale observations only after classifying freshness", () => {
    expect(
      extractComparableObservation(
        {
          results: [
            { commodity: "Wheat", price: "5.10-5.32", price_unit: "USD/bu", report_date: "2026-07-12" },
            { commodity: "Wheat", avg_price: "5.20", price_unit: "USD/bu" },
          ],
        },
        "wheat",
        now,
      ),
    ).toBeNull();

    expect(
      extractComparableObservation(
        {
          results: [
            { commodity: "Wheat", avg_price: "5.20", price_unit: "USD/bu", report_date: "2026-06-30" },
          ],
        },
        "wheat",
        now,
      )?.freshness,
    ).toBe("stale");
  });
});
