import { CircleCheck, Landmark, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CropDefinition, MarketPulseObservation, MarketPulseResponse } from "@/domain/types";
import { formatCurrency } from "@/utils/formatters";

interface MarketPulsePanelProps {
  crop: CropDefinition;
  currentPrice: number;
  error: string | null;
  isLoading: boolean;
  pulse: MarketPulseResponse | null;
  onApply: (price: number) => void;
  onRefresh: () => void;
}

export function MarketPulsePanel({
  crop,
  currentPrice,
  error,
  isLoading,
  pulse,
  onApply,
  onRefresh,
}: MarketPulsePanelProps) {
  const observation = pulse?.status === "available" ? pulse.observation : null;
  const isApplied = observation ? Math.abs(currentPrice - observation.price) < 0.005 : false;

  return (
    <section className="market-pulse" aria-labelledby="market-pulse-title">
      <header className="market-pulse__heading">
        <div>
          <span>Optional market observation</span>
          <h3 id="market-pulse-title">USDA Market Pulse</h3>
        </div>
        <p>See one comparable cash-bid observation, then choose whether to use it in your plan.</p>
      </header>

      <div className="market-pulse__body">
        {observation ? (
          <ObservationDetails
            crop={crop}
            currentPrice={currentPrice}
            isApplied={isApplied}
            observation={observation}
            onApply={onApply}
          />
        ) : (
          <EmptyState pulse={pulse} />
        )}

        <Button
          disabled={isLoading}
          icon={<RefreshCw aria-hidden="true" size={16} />}
          variant="secondary"
          onClick={onRefresh}
        >
          {isLoading ? "Checking USDA..." : observation ? "Refresh observation" : "Check USDA market"}
        </Button>
      </div>

      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </section>
  );
}

function ObservationDetails({
  crop,
  currentPrice,
  isApplied,
  observation,
  onApply,
}: {
  crop: CropDefinition;
  currentPrice: number;
  isApplied: boolean;
  observation: MarketPulseObservation;
  onApply: (price: number) => void;
}) {
  const cannotApply = observation.freshness === "stale";

  return (
    <div className="market-pulse__observation">
      <div className="market-pulse__price-row">
        <div>
          <span>Observed price</span>
          <strong>{formatCurrency(observation.price)} <small>/ {crop.unit}</small></strong>
        </div>
        <span className={`market-pulse__freshness market-pulse__freshness--${observation.freshness}`}>
          {observation.freshness}
        </span>
      </div>

      <dl className="market-pulse__details">
        <div><dt>Commodity</dt><dd>{observation.commodity}</dd></div>
        <div><dt>Location</dt><dd>{observation.location}</dd></div>
        <div><dt>Grade</dt><dd>{observation.grade}</dd></div>
        <div><dt>Contract</dt><dd>{observation.contract}</dd></div>
        <div><dt>Unit</dt><dd>{observation.unit}</dd></div>
        <div><dt>Observed</dt><dd>{formatObservedAt(observation.observedAt)}</dd></div>
      </dl>

      <div className="market-pulse__source">
        <Landmark aria-hidden="true" size={16} />
        <p>
          <strong>{observation.name}</strong>
          <a href={observation.reportUrl} rel="noreferrer" target="_blank">{observation.reportName}</a>
        </p>
      </div>

      <p className="market-pulse__limitation">
        <TriangleAlert aria-hidden="true" size={15} />
        {observation.limitation}
      </p>

      <div className="market-pulse__apply">
        <p>
          Plan price: <strong>{formatCurrency(currentPrice)} / {crop.unit}</strong>
        </p>
        <Button
          disabled={cannotApply || isApplied}
          icon={isApplied ? <CircleCheck aria-hidden="true" size={16} /> : undefined}
          onClick={() => onApply(observation.price)}
        >
          {isApplied ? "Applied to plan" : cannotApply ? "Stale — do not apply" : "Apply to plan"}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ pulse }: { pulse: MarketPulseResponse | null }) {
  const unavailable = pulse?.status === "unavailable" ? pulse : null;

  return (
    <div className="market-pulse__empty">
      <Landmark aria-hidden="true" size={18} />
      <div>
        <strong>
          {unavailable?.reason === "no-comparable-observation"
            ? "No comparable observation"
            : unavailable
              ? "Market observation unavailable"
              : "Keep your entered price in control"}
        </strong>
        <p>{unavailable?.message ?? "HarvestWise never replaces an entered market price automatically. Load a USDA observation when you want one more point of reference."}</p>
        {unavailable ? <a href={unavailable.source.reportUrl} rel="noreferrer" target="_blank">Open {unavailable.source.reportName}</a> : null}
      </div>
    </div>
  );
}

function formatObservedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not reported";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
