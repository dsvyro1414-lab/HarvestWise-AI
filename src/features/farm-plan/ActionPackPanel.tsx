import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { DeterministicActionPack, RealityCheckPrompt } from "@/domain/actionPack";

interface ActionPackPanelProps {
  pack: DeterministicActionPack;
  gemmaPrompt: RealityCheckPrompt | null;
  gemmaError: string | null;
  isLoadingGemmaPrompt: boolean;
  onAskGemma: () => void;
}

export function ActionPackPanel({
  pack,
  gemmaPrompt,
  gemmaError,
  isLoadingGemmaPrompt,
  onAskGemma,
}: ActionPackPanelProps) {
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

      <section className="action-pack__gemma" aria-label="Gemma verification help">
        <div>
          <h4>Need help validating the first check?</h4>
          <p>Gemma can turn the already-selected verification item into one question to take to a buyer, landowner, or supplier.</p>
        </div>
        <Button disabled={isLoadingGemmaPrompt} variant="secondary" onClick={onAskGemma}>
          {isLoadingGemmaPrompt ? "Drafting question..." : "Ask Gemma for a verification question"}
        </Button>
        {gemmaPrompt ? (
          <div className="gemma-verification-question">
            <span>{gemmaPrompt.provider === "gemma" ? "Gemma wording" : "Local fallback wording"}</span>
            <strong>{gemmaPrompt.question}</strong>
          </div>
        ) : null}
        {gemmaError ? <p className="inline-error" role="alert">{gemmaError}</p> : null}
      </section>
    </section>
  );
}
