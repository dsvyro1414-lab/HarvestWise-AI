import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { DeterministicActionPack } from "@/domain/actionPack";

interface ActionPackPanelProps {
  pack: DeterministicActionPack;
}

export function ActionPackPanel({ pack }: ActionPackPanelProps) {
  return (
    <section className="action-pack" aria-labelledby="action-pack-title">
      <header className="action-pack__heading">
        <div>
          <span>Reality check + action pack</span>
          <h3 id="action-pack-title">Verify these local assumptions before you commit</h3>
        </div>
        <p>Financial action is calculated by HarvestWise. These are verification prompts, not forecasts.</p>
      </header>

      <div className="action-pack__body">
        <section className="action-pack__recommendation" aria-label="Deterministic recommendation">
          <span>Calculated next action</span>
          <strong>{pack.recommendation.title}</strong>
          <p>{pack.recommendation.reasons[0]}</p>
        </section>

        <section className="action-pack__steps" aria-labelledby="action-pack-steps-title">
          <h4 id="action-pack-steps-title">Next three practical steps</h4>
          <ol>
            {pack.nextSteps.map((step) => (
              <li key={step}>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="reality-check-list" aria-label="Assumptions to verify locally">
        {pack.checks.map((check) => (
          <article className={`reality-check reality-check--${check.priority}`} key={check.id}>
            <TriangleAlert aria-hidden="true" size={16} />
            <div>
              <div className="reality-check__title">
                <strong>{check.title}</strong>
                {check.priority === "urgent" ? <span>Verify first</span> : null}
              </div>
              <p>{check.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
