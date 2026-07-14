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
      ? formatCurrency(plan.budgetGap)
      : formatCurrency(input.availableBudget - plan.totalSeasonCost);
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
          <h2>Three key numbers</h2>
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
          label="Expected profit"
          tone={plan.expectedProfit >= 0 ? "green" : "amber"}
          value={formatCurrency(plan.expectedProfit)}
        />
        <MetricCard
          helper={`Break-even: ${formatCurrency(plan.breakEvenPrice)} per ${plan.crop.unit}`}
          label="Price where you stop losing"
          tone="neutral"
          value={formatCurrency(plan.breakEvenPrice)}
        />
        <MetricCard
          helper="Compared with your available budget"
          label={plan.budgetGap > 0 ? "Amount over budget" : "Money left after costs"}
          tone={plan.budgetGap > 0 ? "amber" : "green"}
          value={cashStatus}
        />
      </div>

      <div className="insight-strip">
        <div>
          <span>What could change this result?</span>
          <strong>{riskDriver}</strong>
        </div>
      </div>

    </section>
  );
}

export function PlanNumbersDetails({ input, plan }: ProfitSnapshotProps) {
  return (
    <div className="plan-numbers-details">
      <section aria-labelledby="price-sensitivity-title">
        <div className="secondary-panel-heading">
          <div>
            <span>Price sensitivity</span>
            <h4 id="price-sensitivity-title">How profit changes with price</h4>
          </div>
          <p>The dashed line marks the break-even price.</p>
        </div>
        <div className="chart-panel">
          <PriceSensitivityChart
            breakEvenPrice={plan.breakEvenPrice}
            currentPrice={input.marketPricePerUnit}
            currentProfit={plan.expectedProfit}
            points={plan.sensitivity}
          />
        </div>
      </section>

      <section aria-labelledby="plan-totals-title">
        <div className="secondary-panel-heading">
          <div>
            <span>Plan totals</span>
            <h4 id="plan-totals-title">The calculation behind the result</h4>
          </div>
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
      </section>
    </div>
  );
}
