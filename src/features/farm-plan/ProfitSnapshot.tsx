import { ArrowUpRight, BarChart3 } from "lucide-react";
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
  return (
    <section className="content-panel content-panel--snapshot">
      <div className="section-title-row">
        <div className="section-title">
          <BarChart3 size={20} />
          <div>
            <h2>Profit Snapshot ({plan.crop.name})</h2>
            <p>
              {formatNumber(input.landSizeAcres, 1)} acres · {formatNumber(plan.expectedHarvest)}{" "}
              {plan.crop.unitPlural}
            </p>
          </div>
        </div>
        <button className="link-button" type="button">
          View full breakdown <ArrowUpRight size={15} />
        </button>
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
          tone="blue"
          value={formatCurrency(plan.breakEvenPrice)}
        />
        <MetricCard helper="Price + budget pressure" label="Risk Level" tone="amber" value={<RiskBadge level={plan.riskLevel} />} />
        <MetricCard helper={`ROI ${formatPercent(plan.roi)}`} label="Best Action" tone="green" value={plan.bestAction} />
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
          <span>Budget gap</span>
          <strong>{formatCurrency(plan.budgetGap)}</strong>
        </div>
        <div>
          <span>Profit margin</span>
          <strong>{formatPercent(plan.profitMargin)}</strong>
        </div>
      </div>

      <PriceSensitivityChart breakEvenPrice={plan.breakEvenPrice} points={plan.sensitivity} />
    </section>
  );
}
