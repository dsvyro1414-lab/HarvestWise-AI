import { ArrowRight, FlaskConical, ShieldCheck, TriangleAlert } from "lucide-react";
import { buildCostDrivers, buildPriceSafety } from "@/domain/dashboard";
import type { FarmPlanInput, FarmPlanResult, ScenarioGuidance } from "@/domain/types";
import type { PlanScenario } from "@/domain/scenario";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { ScenarioModePanel } from "@/features/scenario/ScenarioModePanel";

export type PostPlanScenario = PlanScenario;

interface PostPlanDashboardProps {
  scenario: PostPlanScenario | null;
  scenarioError: string | null;
  scenarioGuidance: ScenarioGuidance | null;
  scenarioQuestion: string;
  isRunningScenario: boolean;
  isScenarioOpen: boolean;
  onOpenScenario: () => void;
  onQuestionChange: (question: string) => void;
  onRunScenario: () => void;
}

interface PostPlanAnalysisProps {
  input: FarmPlanInput;
  plan: FarmPlanResult;
}

export function PostPlanDashboard({
  scenario,
  scenarioError,
  scenarioGuidance,
  scenarioQuestion,
  isRunningScenario,
  isScenarioOpen,
  onOpenScenario,
  onQuestionChange,
  onRunScenario,
}: PostPlanDashboardProps) {
  return (
    <section className="post-plan-dashboard post-plan-dashboard--primary" aria-labelledby="scenario-comparison-title">
      <header className="post-plan-dashboard__heading">
        <div>
          <span>Test a change</span>
          <h3 id="scenario-comparison-title">What changes if…?</h3>
        </div>
        <p>Ask a real farm what-if. HarvestWise recalculates only when you provide a numeric assumption.</p>
      </header>

      <section className="scenario-comparison">
        {scenario ? (
          <div className="decision-panel__heading">
            <div>
              <span className="decision-panel__eyebrow">HarvestWise recalculated this scenario</span>
              <h4>Baseline vs. your latest what-if</h4>
            </div>
            <span className="scenario-comparison__source">{scenario.provider === "gemma" ? "Gemma interpreted the change" : "Local interpreter"}</span>
          </div>
        ) : null}

        {isScenarioOpen ? (
          <div className="scenario-comparison__composer" id="scenario-composer">
            <ScenarioModePanel
              error={scenarioError}
              focusOnMount
              guidance={scenarioGuidance}
              isLoading={isRunningScenario}
              question={scenarioQuestion}
              onQuestionChange={onQuestionChange}
              onRunScenario={onRunScenario}
            />
          </div>
        ) : null}

        {scenario ? <ScenarioResult scenario={scenario} /> : !isScenarioOpen ? (
          <div className="scenario-comparison__empty">
            <p>No what-if has been run yet. Test a change to see the plan before and after the new assumption.</p>
            <Button
              aria-controls="scenario-composer"
              aria-expanded={isScenarioOpen}
              icon={<FlaskConical size={16} />}
              variant="secondary"
              onClick={onOpenScenario}
            >
              Test a change
            </Button>
          </div>
        ) : null}
      </section>
    </section>
  );
}

export function PostPlanAnalysis({ input, plan }: PostPlanAnalysisProps) {
  const priceSafety = buildPriceSafety(input, plan);
  const costDrivers = buildCostDrivers(input, plan);
  const SafetyIcon = priceSafety.state === "safe" ? ShieldCheck : TriangleAlert;

  return (
    <div className="post-plan-dashboard__grid post-plan-dashboard__grid--analysis">
      <section className="decision-panel decision-panel--safety" aria-labelledby="price-safety-title">
        <div className="decision-panel__heading">
          <div>
            <span className="decision-panel__eyebrow">How far can the price fall?</span>
            <h4 id="price-safety-title">Your price cushion before the plan loses money</h4>
          </div>
          <span className={`price-safety-state price-safety-state--${priceSafety.state}`}>
            <SafetyIcon aria-hidden="true" size={15} />
            {priceSafety.state}
          </span>
        </div>

        <dl className="price-safety-metrics">
          <div>
            <dt>Price used</dt>
            <dd>{formatCurrency(priceSafety.currentPrice)} <small>/ {plan.crop.unit}</small></dd>
          </div>
          <div>
            <dt>Price where you stop losing</dt>
            <dd>{formatCurrency(priceSafety.breakEvenPrice)} <small>/ {plan.crop.unit}</small></dd>
          </div>
          <div>
            <dt>Room before a loss</dt>
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
            <span className="decision-panel__eyebrow">Where the money goes</span>
            <h4 id="cost-drivers-title">Largest season costs</h4>
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
  );
}

function ScenarioResult({ scenario }: { scenario: PostPlanScenario }) {
  const profitChange = scenario.afterPlan.expectedProfit - scenario.beforePlan.expectedProfit;

  return (
    <div className="scenario-comparison__result" aria-live="polite" role="status">
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
  if (state === "safe") return `The entered price can fall ${formatCurrency(downsideRoom)} per ${unit} before this plan stops making money.`;
  if (state === "watch") return `Check this closely: only ${formatCurrency(downsideRoom)} per ${unit} separates this plan from a loss.`;
  return `The entered price is ${formatCurrency(Math.abs(downsideRoom))} per ${unit} below the price needed to cover costs.`;
}
