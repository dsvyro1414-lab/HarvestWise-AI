import { CheckCircle2, ShoppingCart } from "lucide-react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { DecisionId, MarketDecision } from "@/domain/types";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface MarketDecisionCardsProps {
  decisions: MarketDecision[];
  selectedId: DecisionId;
  onSelect: (id: DecisionId) => void;
}

export function MarketDecisionCards({ decisions, selectedId, onSelect }: MarketDecisionCardsProps) {
  return (
    <section className="content-panel">
      <div className="section-title">
        <ShoppingCart size={20} />
        <div>
          <h2>Market Decision</h2>
          <p>Sell now, store, or wait for a better price</p>
        </div>
      </div>

      <div className="decision-grid">
        {decisions.map((decision) => (
          <button
            className={`decision-card ${decision.id === selectedId ? "decision-card--active" : ""}`}
            key={decision.id}
            type="button"
            onClick={() => onSelect(decision.id)}
          >
            <span className="decision-card__header">
              <strong>{decision.label}</strong>
              {decision.id === selectedId ? <CheckCircle2 size={18} /> : <span className="decision-card__radio" />}
            </span>
            <span>
              <small>Est. price</small>
              {formatCurrency(decision.estimatedPrice)}
            </span>
            <span>
              <small>Est. profit</small>
              {formatCurrency(decision.expectedProfit)}
            </span>
            <span>
              <small>Harvest after loss</small>
              {formatNumber(decision.harvestAfterLoss, 1)}
            </span>
            <span className="decision-card__footer">
              <RiskBadge level={decision.riskLevel} />
              <em>{decision.recommendation}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
