import { useMemo, useState } from "react";
import { CheckCircle2, CloudSun, Copy, Landmark, Printer, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DeterministicActionPack } from "@/domain/actionPack";
import { buildDecisionPackShareText, type DecisionPackScenario } from "@/domain/decisionPack";
import { formatPriceEvidenceSource, getPriceEvidenceStatus } from "@/domain/priceEvidence";
import type { FarmPlanInput, FarmPlanResult, WeatherResponse } from "@/domain/types";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/formatters";

interface DecisionPackPanelProps {
  input: FarmPlanInput;
  pack: DeterministicActionPack;
  plan: FarmPlanResult;
  weatherResponse: WeatherResponse | null;
  scenario: DecisionPackScenario | null;
}

export function DecisionPackPanel({
  input,
  pack,
  plan,
  weatherResponse,
  scenario,
}: DecisionPackPanelProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const shareText = useMemo(
    () => buildDecisionPackShareText({ input, plan, pack, weatherResponse, scenario }),
    [input, pack, plan, scenario, weatherResponse],
  );
  const riskLabel = plan.riskLevel === "low" ? "within range" : plan.riskLevel === "medium" ? "watch closely" : "needs review";

  async function handleCopy() {
    if (!navigator.clipboard) {
      setCopyStatus("Copy is not available in this browser. Use Print / Save PDF instead.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus("Decision summary copied. It is ready to paste into WhatsApp or a co-op note.");
    } catch {
      setCopyStatus("We could not copy the summary. Use Print / Save PDF instead.");
    }
  }

  return (
    <section className="decision-pack" aria-labelledby="decision-pack-title">
      <header className="decision-pack__heading">
        <div>
          <span>Compare and share</span>
          <h3 id="decision-pack-title">Share this plan with a buyer or advisor</h3>
        </div>
        <p>One concise handoff for a buyer, landowner, supplier, or cooperative.</p>
        <div className="decision-pack__actions">
          <Button icon={<Copy aria-hidden="true" size={16} />} variant="secondary" onClick={() => void handleCopy()}>
            Copy summary
          </Button>
          <Button icon={<Printer aria-hidden="true" size={16} />} variant="ghost" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>
      </header>

      <article className="decision-pack__sheet" aria-label="Field decision summary">
        <header className="decision-pack__masthead">
          <div>
            <span>HarvestWise AI · current plan</span>
            <h4>{plan.crop.name} field decision</h4>
            <p>{formatNumber(input.landSizeAcres, 1)} acres · {formatNumber(plan.expectedHarvest)} {plan.crop.unitPlural} expected · {plan.crop.cycleMonths}-month cycle</p>
          </div>
          <div className={`decision-pack__action decision-pack__action--${plan.riskLevel}`}>
            <span>Calculated next action</span>
            <strong>{plan.action.title}</strong>
            <em>{riskLabel}</em>
          </div>
        </header>

        <section className="decision-pack__metrics" aria-label="Decision metrics">
          <Metric label="Expected profit" value={formatCurrency(plan.expectedProfit)} detail="season result" />
          <Metric label="Break-even" value={`${formatCurrency(plan.breakEvenPrice)} / ${plan.crop.unit}`} detail="minimum plan price" />
          <Metric label="Plan margin" value={formatPercent(plan.profitMargin)} detail="at entered price" />
          <Metric label="Cash position" value={plan.budgetGap > 0 ? `${formatCurrency(plan.budgetGap)} short` : `${formatCurrency(input.availableBudget - plan.totalSeasonCost)} buffer`} detail="after season costs" />
        </section>

        <div className="decision-pack__body">
          <section className="decision-pack__reasons" aria-labelledby="decision-pack-reasons-title">
            <div className="decision-pack__section-title">
              <ShieldCheck aria-hidden="true" size={17} />
              <div>
                <span>Why this action</span>
                <h5 id="decision-pack-reasons-title">Calculated decision evidence</h5>
              </div>
            </div>
            <ul>
              {plan.action.reasons.slice(0, 3).map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </section>

          <section className="decision-pack__checks" aria-labelledby="decision-pack-checks-title">
            <div className="decision-pack__section-title">
              <CheckCircle2 aria-hidden="true" size={17} />
              <div>
                <span>Before you commit</span>
                <h5 id="decision-pack-checks-title">Three local checks to carry forward</h5>
              </div>
            </div>
            <ol>
              {pack.checks.slice(0, 3).map((check) => (
                <li key={check.id}>
                  <strong>{check.title}</strong>
                  <p>{check.nextStep}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="decision-pack__references" aria-labelledby="decision-pack-references-title">
          <div className="decision-pack__section-title">
            <TriangleAlert aria-hidden="true" size={17} />
            <div>
              <span>Context, not automatic inputs</span>
              <h5 id="decision-pack-references-title">Source and scenario record</h5>
            </div>
          </div>
          <div className="decision-pack__reference-grid">
            <MarketReference plan={plan} input={input} />
            <WeatherReference weatherResponse={weatherResponse} />
            <ScenarioReference scenario={scenario} />
          </div>
        </section>

        <footer className="decision-pack__trust">
          Financial figures and the next action are calculated by HarvestWise. Gemma may interpret or explain this plan, but it does not choose the action.
        </footer>
      </article>

      <p className="decision-pack__status" role="status" aria-live="polite">{copyStatus}</p>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function MarketReference({
  plan,
  input,
}: {
  plan: FarmPlanResult;
  input: FarmPlanInput;
}) {
  const evidence = input.priceEvidence;
  const status = getPriceEvidenceStatus(evidence);

  return (
    <article className="decision-pack__reference">
      <Landmark aria-hidden="true" size={17} />
      <div>
        <span>Price used in this plan</span>
        <strong>{formatPriceEvidenceSource(evidence)}</strong>
        <p>{formatCurrency(input.marketPricePerUnit)} / {plan.crop.unit} · {evidence?.location || "market not recorded"} · {formatDateTime(evidence?.checkedAt ?? "")} · {status.label}</p>
      </div>
    </article>
  );
}

function WeatherReference({ weatherResponse }: { weatherResponse: WeatherResponse | null }) {
  const context = weatherResponse?.status === "available" ? weatherResponse.context : null;
  const unavailable = weatherResponse?.status === "unavailable" ? weatherResponse : null;

  return (
    <article className="decision-pack__reference">
      <CloudSun aria-hidden="true" size={17} />
      <div>
        <span>Weather timing check</span>
        {context ? (
          <>
            <strong>{context.location.label} · {context.forecast.shortForecast}</strong>
            <p>{context.timingPrompt}</p>
          </>
        ) : (
          <>
            <strong>{unavailable ? "Unavailable" : "Not checked"}</strong>
            <p>{unavailable?.message ?? "Confirm the field, road, and delivery conditions locally before acting."}</p>
          </>
        )}
      </div>
    </article>
  );
}

function ScenarioReference({ scenario }: { scenario: DecisionPackScenario | null }) {
  const change = scenario ? scenario.afterPlan.expectedProfit - scenario.beforePlan.expectedProfit : null;

  return (
    <article className="decision-pack__reference">
      <TriangleAlert aria-hidden="true" size={17} />
      <div>
        <span>Latest what-if</span>
        {scenario && change !== null ? (
          <>
            <strong>{scenario.changedFields.join(", ") || "Assumptions updated"}</strong>
            <p>Profit change: {change >= 0 ? "+" : ""}{formatCurrency(change)} · latest {formatCurrency(scenario.afterPlan.expectedProfit)}</p>
          </>
        ) : (
          <>
            <strong>No scenario run</strong>
            <p>Use a what-if before committing if a price, cost, or yield assumption is uncertain.</p>
          </>
        )}
      </div>
    </article>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not reported";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
