import { ArrowRight, FlaskConical, ShieldCheck, TriangleAlert } from "lucide-react";
import { buildCostDrivers, buildPriceSafety } from "@/domain/dashboard";
import type { FarmPlanInput, FarmPlanResult } from "@/domain/types";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";

export interface PostPlanScenario {
  explanation: string;
  changedFields: string[];
  beforeInput: FarmPlanInput;
  afterInput: FarmPlanInput;
  beforePlan: FarmPlanResult;
  afterPlan: FarmPlanResult;
  provider: "gemma" | "local-fallback";
}

interface PostPlanDashboardProps {
  input: FarmPlanInput;
  plan: FarmPlanResult;
  scenario: PostPlanScenario | null;
  onOpenScenario: () => void;
}

export function PostPlanDashboard({ input, plan, scenario, onOpenScenario }: PostPlanDashboardProps) {
  const priceSafety = buildPriceSafety(input, plan);
  const costDrivers = buildCostDrivers(input, plan);
  const SafetyIcon = priceSafety.state === "safe" ? ShieldCheck : TriangleAlert;

  return (
    <section className="post-plan-dashboard" aria-labelledby="decision-dashboard-title">
      <header className="post-plan-dashboard__heading">
        <div>
          <span>Decision dashboard</span>
          <h3 id="decision-dashboard-title">Protect the plan before you commit</h3>
        </div>
        <p>Live from your inputs and HarvestWise calculations.</p>
      </header>

      <div className="post-plan-dashboard__grid">
        <section className="decision-panel decision-panel--safety" aria-labelledby="price-safety-title">
          <div className="decision-panel__heading">
            <div>
              <span className="decision-panel__eyebrow">Price safety</span>
              <h4 id="price-safety-title">How much price decline can this plan absorb?</h4>
            </div>
            <span className={`price-safety-state price-safety-state--${priceSafety.state}`}>
              <SafetyIcon aria-hidden="true" size={15} />
              {priceSafety.state}
            </span>
          </div>

          <dl className="price-safety-metrics">
            <div>
              <dt>Current price</dt>
              <dd>{formatCurrency(priceSafety.currentPrice)} <small>/ {plan.crop.unit}</small></dd>
            </div>
            <div>
              <dt>Break-even</dt>
              <dd>{formatCurrency(priceSafety.breakEvenPrice)} <small>/ {plan.crop.unit}</small></dd>
            </div>
            <div>
              <dt>Downside room</dt>
              <dd className={priceSafety.downsideRoom <= 0 ? "is-negative" : undefined}>
                {formatCurrency(priceSafety.downsideRoom)} <small>({formatPercent(priceSafety.downsideRoomPercent)})</small>
              </dd>
            </div>
          </dl>
          <p className="price-safety-copy">{priceSafetyCopy(priceSafety.state, priceSafety.downsideRoom, plan.crop.unit)}</p>
        </section>

        <section className="decision-panel decision-panel--costs" aria-labelledby="cost-drivers-title">
          <div className="decision-panel__heading">
            <div>
              <span className="decision-panel__eyebrow">Cost drivers</span>
              <h4 id="cost-drivers-title">Where the season budget goes</h4>
            </div>
            <strong>{formatCurrency(plan.totalSeasonCost)}</strong>
          </div>

          <ol className="cost-driver-list">
            {costDrivers.map((driver) => (
              <li key={driver.id}>
                <div className="cost-driver-list__copy">
                  <span>{driver.label}</span>
                  <strong>{formatCurrency(driver.amount)}</strong>
                </div>
                <div aria-hidden="true" className="cost-driver-list__track">
                  <span style={{ width: `${Math.min(driver.share * 100, 100)}%` }} />
                </div>
                <em>{formatPercent(driver.share)}</em>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="scenario-comparison" aria-labelledby="scenario-comparison-title">
        <div className="decision-panel__heading">
          <div>
            <span className="decision-panel__eyebrow">Scenario comparison</span>
            <h4 id="scenario-comparison-title">Baseline vs. the latest what-if</h4>
          </div>
          {scenario ? <span className="scenario-comparison__source">{scenario.provider === "gemma" ? "Gemma interpreted the change" : "Local interpreter"}</span> : null}
        </div>

        {scenario ? <ScenarioResult scenario={scenario} /> : (
          <div className="scenario-comparison__empty">
            <p>No what-if has been run yet. Test a change to see the plan before and after the new assumption.</p>
            <Button icon={<FlaskConical size={16} />} variant="secondary" onClick={onOpenScenario}>Test a change</Button>
          </div>
        )}
      </section>
    </section>
  );
}

function ScenarioResult({ scenario }: { scenario: PostPlanScenario }) {
  const profitChange = scenario.afterPlan.expectedProfit - scenario.beforePlan.expectedProfit;

  return (
    <div className="scenario-comparison__result">
      <div className="scenario-plan scenario-plan--baseline">
        <span>Baseline</span>
        <strong>{formatCurrency(scenario.beforePlan.expectedProfit)}</strong>
        <dl>
          <div><dt>Price</dt><dd>{formatCurrency(scenario.beforeInput.marketPricePerUnit)} / {scenario.beforePlan.crop.unit}</dd></div>
          <div><dt>Season cost</dt><dd>{formatCurrency(scenario.beforePlan.totalSeasonCost)}</dd></div>
        </dl>
      </div>
      <div className={`scenario-delta ${profitChange >= 0 ? "scenario-delta--positive" : "scenario-delta--negative"}`}>
        <ArrowRight aria-hidden="true" size={19} />
        <strong>{profitChange >= 0 ? "+" : ""}{formatCurrency(profitChange)}</strong>
        <span>profit change</span>
      </div>
      <div className="scenario-plan scenario-plan--latest">
        <span>Latest scenario</span>
        <strong>{formatCurrency(scenario.afterPlan.expectedProfit)}</strong>
        <dl>
          <div><dt>Price</dt><dd>{formatCurrency(scenario.afterInput.marketPricePerUnit)} / {scenario.afterPlan.crop.unit}</dd></div>
          <div><dt>Season cost</dt><dd>{formatCurrency(scenario.afterPlan.totalSeasonCost)}</dd></div>
        </dl>
      </div>
      <div className="scenario-comparison__notes">
        <div>
          <span>Changed assumptions</span>
          <ul>
            {scenario.changedFields.map((field) => <li key={field}>{field}</li>)}
          </ul>
        </div>
        <p>{scenario.explanation}</p>
      </div>
    </div>
  );
}

function priceSafetyCopy(state: "safe" | "watch" | "risk", downsideRoom: number, unit: string): string {
  if (state === "safe") return `Safe buffer: the entered price can fall ${formatCurrency(downsideRoom)} per ${unit} before this plan breaks even.`;
  if (state === "watch") return `Watch closely: only ${formatCurrency(downsideRoom)} per ${unit} separates this plan from break-even.`;
  return `Risk: the entered price is ${formatCurrency(Math.abs(downsideRoom))} per ${unit} below break-even.`;
}
