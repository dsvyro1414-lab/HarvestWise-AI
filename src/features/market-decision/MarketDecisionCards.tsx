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
  const selectedDecision = decisions.find((decision) => decision.id === selectedId) ?? decisions[0];

  return (
    <section className="side-panel decision-panel" aria-label="Market decision">
      <div className="section-title">
        <ShoppingCart size={20} />
        <div>
          <h2>Harvest market options</h2>
          <p>Use after the crop is harvested</p>
        </div>
      </div>

      <div className="decision-panel__summary">
        <span>{selectedDecision.label}</span>
        <strong>{formatCurrency(selectedDecision.expectedProfit)}</strong>
        <p>{selectedDecision.recommendation}</p>
      </div>

      <div className="decision-list">
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
            <strong className="decision-card__profit">{formatCurrency(decision.expectedProfit)}</strong>
            <span className="decision-card__footer">
              <RiskBadge level={decision.riskLevel} />
              <em>
                {formatCurrency(decision.estimatedPrice)} · {formatNumber(decision.harvestAfterLoss, 1)} after loss
              </em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
