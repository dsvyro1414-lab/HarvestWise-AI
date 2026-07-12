import type { MarketPriceEvidence, MarketPriceSourceType } from "./types.js";

export type PriceEvidenceFreshness = "fresh" | "aging" | "stale" | "unverified";

export const priceSourceLabels: Record<MarketPriceSourceType, string> = {
  buyer: "Buyer offer",
  "co-op": "Co-op quote",
  elevator: "Grain elevator quote",
  other: "Other local source",
};

export function getPriceEvidenceStatus(
  evidence: MarketPriceEvidence | undefined,
  now = new Date(),
): { freshness: PriceEvidenceFreshness; label: string; message: string } {
  if (!evidence?.sourceType && !evidence?.sourceName) {
    return {
      freshness: "unverified",
      label: "source not recorded",
      message: "Record where this price came from before relying on the plan.",
    };
  }

  const checkedAt = parseEvidenceDate(evidence.checkedAt);
  if (!checkedAt) {
    return {
      freshness: "unverified",
      label: "date not recorded",
      message: "Add the date you confirmed this price so you know when to verify it again.",
    };
  }

  const ageDays = Math.max(0, Math.floor((now.getTime() - checkedAt.getTime()) / 86_400_000));
  if (ageDays <= 7) {
    return {
      freshness: "fresh",
      label: "confirmed recently",
      message: "This price record is recent. Confirm delivery terms before committing.",
    };
  }

  if (ageDays <= 21) {
    return {
      freshness: "aging",
      label: "reconfirm soon",
      message: "This price record is over a week old. Reconfirm it before acting.",
    };
  }

  return {
    freshness: "stale",
    label: "outdated — reconfirm",
    message: "This price record is over three weeks old. Reconfirm it before relying on the plan.",
  };
}

export function formatPriceEvidenceSource(evidence: MarketPriceEvidence | undefined): string {
  if (!evidence) return "Not recorded";

  const type = evidence.sourceType ? priceSourceLabels[evidence.sourceType] : "Local price source";
  return evidence.sourceName ? `${type} · ${evidence.sourceName}` : type;
}

function parseEvidenceDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
