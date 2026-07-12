import { describe, expect, it } from "vitest";
import { formatPriceEvidenceSource, getPriceEvidenceStatus } from "./priceEvidence.js";

describe("market price evidence", () => {
  const now = new Date("2026-07-12T12:00:00.000Z");

  it("flags an unrecorded source without changing any finance input", () => {
    expect(getPriceEvidenceStatus(undefined, now)).toMatchObject({
      freshness: "unverified",
      label: "source not recorded",
    });
  });

  it("classifies a price record by the date it was confirmed", () => {
    expect(
      getPriceEvidenceStatus(
        { sourceType: "co-op", sourceName: "Prairie Co-op", location: "Champaign, IL", checkedAt: "2026-07-10" },
        now,
      ).freshness,
    ).toBe("fresh");

    expect(
      getPriceEvidenceStatus(
        { sourceType: "buyer", sourceName: "River Grain", location: "", checkedAt: "2026-06-15" },
        now,
      ).freshness,
    ).toBe("stale");
  });

  it("keeps the source readable for a copied decision pack", () => {
    expect(
      formatPriceEvidenceSource({ sourceType: "elevator", sourceName: "Central Grain", location: "", checkedAt: "2026-07-10" }),
    ).toBe("Grain elevator quote · Central Grain");
  });
});
