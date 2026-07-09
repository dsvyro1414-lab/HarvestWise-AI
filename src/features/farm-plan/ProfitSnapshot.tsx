import { BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { FarmPlanInput, FarmPlanResult } from "@/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/formatters";
import { PriceSensitivityChart } from "./PriceSensitivityChart";

interface ProfitSnapshotProps {
  input: FarmPlanInput;
  plan: FarmPlanResult;
}

export function ProfitSnapshot({ input, plan }: ProfitSnapshotProps) {
  const cashStatus =
    plan.budgetGap > 0
      ? `${formatCurrency(plan.budgetGap)} gap`
      : `${formatCurrency(input.availableBudget - plan.totalSeasonCost)} buffer`;
  const priceRoom = input.marketPricePerUnit - plan.breakEvenPrice;
  const priceRoomPercent = priceRoom / Math.max(input.marketPricePerUnit, 1);
  const riskDriver =
    plan.budgetGap > 0
      ? `Budget is short by ${formatCurrency(plan.budgetGap)}, so the season needs cheaper inputs or a smaller plot.`
      : priceRoom <= 0
        ? `Current price is below break-even. Profit needs a price above ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}.`
        : `Profit turns negative below ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}. Current price has ${formatPercent(
            priceRoomPercent,
          )} room.`;

  return (
    <section className="content-panel content-panel--snapshot" aria-label="Plan snapshot">
      <div className="snapshot-header">
        <div className="section-title">
          <BarChart3 size={20} />
          <div>
          <h2>Plan snapshot</h2>
            <p>
              {formatNumber(input.landSizeAcres, 1)} acres · {formatNumber(plan.expectedHarvest)}{" "}
              {plan.crop.unitPlural} · {plan.crop.name}
            </p>
          </div>
        </div>
        <span className="snapshot-header__meta">Live calculation</span>
      </div>

      <div className="metric-grid">
        <MetricCard
          helper="Expected season result"
          label="Expected Profit"
          tone={plan.expectedProfit >= 0 ? "green" : "amber"}
          value={formatCurrency(plan.expectedProfit)}
        />
        <MetricCard
          helper={`Per ${plan.crop.unit}`}
          label="Break-even Price"
          tone="neutral"
          value={formatCurrency(plan.breakEvenPrice)}
        />
        <MetricCard helper="Budget after costs" label="Cash status" tone={plan.budgetGap > 0 ? "amber" : "green"} value={cashStatus} />
      </div>

      <div className="insight-strip">
        <div>
          <span>Risk driver</span>
          <strong>{riskDriver}</strong>
        </div>
      </div>

      <details className="snapshot-disclosure">
        <summary>Show price and cost details</summary>
        <div className="chart-panel">
          <PriceSensitivityChart
            breakEvenPrice={plan.breakEvenPrice}
            currentPrice={input.marketPricePerUnit}
            currentProfit={plan.expectedProfit}
            points={plan.sensitivity}
          />
        </div>

        <div className="snapshot-details">
          <div>
            <span>Total cost</span>
            <strong>{formatCurrency(plan.totalSeasonCost)}</strong>
          </div>
          <div>
            <span>Gross revenue</span>
            <strong>{formatCurrency(plan.grossRevenue)}</strong>
          </div>
          <div>
            <span>Profit margin</span>
            <strong>{formatPercent(plan.profitMargin)}</strong>
          </div>
          <div>
            <span>Risk</span>
            <strong><RiskBadge level={plan.riskLevel} /></strong>
          </div>
        </div>
      </details>
    </section>
  );
}
