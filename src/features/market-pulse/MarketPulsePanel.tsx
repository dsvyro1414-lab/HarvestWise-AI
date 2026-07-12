import { Landmark, TriangleAlert } from "lucide-react";
import { getPriceEvidenceStatus, formatPriceEvidenceSource } from "@/domain/priceEvidence";
import type { CropDefinition, FarmPlanInput } from "@/domain/types";
import { formatCurrency } from "@/utils/formatters";

interface MarketPulsePanelProps {
  crop: CropDefinition;
  input: FarmPlanInput;
}

/**
 * Shows evidence for the farmer-entered plan price. No remote quote is loaded
 * or applied here: financial calculations remain based on the user's number.
 */
export function MarketPulsePanel({ crop, input }: MarketPulsePanelProps) {
  const evidence = input.priceEvidence;
  const status = getPriceEvidenceStatus(evidence);

  return (
    <section className="market-pulse" aria-labelledby="market-pulse-title">
      <header className="market-pulse__heading">
        <div>
          <span>Farmer-recorded evidence</span>
          <h3 id="market-pulse-title">Market price record</h3>
        </div>
        <p>Keep a checkable source for the price used in this plan. HarvestWise never replaces it automatically.</p>
      </header>

      <div className="market-pulse__observation">
        <div className="market-pulse__price-row">
          <div>
            <span>Plan price</span>
            <strong>{formatCurrency(input.marketPricePerUnit)} <small>/ {crop.unit}</small></strong>
          </div>
          <span className={`market-pulse__freshness market-pulse__freshness--${status.freshness}`}>
            {status.label}
          </span>
        </div>

        <dl className="market-pulse__details">
          <div><dt>Source</dt><dd>{formatPriceEvidenceSource(evidence)}</dd></div>
          <div><dt>Market</dt><dd>{evidence?.location || "Not recorded"}</dd></div>
          <div><dt>Confirmed</dt><dd>{formatCheckedAt(evidence?.checkedAt)}</dd></div>
        </dl>

        <p className="market-pulse__limitation">
          <TriangleAlert aria-hidden="true" size={15} />
          <span>{status.message} {status.freshness === "unverified" ? <a href="#price-evidence">Record price evidence</a> : null}</span>
        </p>

        <div className="market-pulse__source">
          <Landmark aria-hidden="true" size={16} />
          <p>
            <strong>Why this matters</strong>
            A buyer, co-op, or elevator can confirm the actual grade, delivery point, and timing behind this number.
          </p>
        </div>
      </div>
    </section>
  );
}

function formatCheckedAt(value: string | undefined): string {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
