import { useEffect, useRef } from "react";
import { CloudRain, FlaskConical, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ScenarioGuidance } from "@/domain/types";

interface ScenarioModePanelProps {
  question: string;
  error: string | null;
  guidance: ScenarioGuidance | null;
  focusOnMount?: boolean;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onRunScenario: () => void;
}

export function ScenarioModePanel({
  question,
  error,
  guidance,
  focusOnMount = false,
  isLoading,
  onQuestionChange,
  onRunScenario,
}: ScenarioModePanelProps) {
  const questionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focusOnMount) return;

    const input = questionInputRef.current;
    input?.focus({ preventScroll: true });
    input?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
    });
  }, [focusOnMount]);

  return (
    <section aria-busy={isLoading} className="scenario-panel" aria-label="Scenario mode">
      <div className="section-title">
        <FlaskConical size={20} />
        <div>
          <h2>Test a change</h2>
          <p>Gemma answers the question. HarvestWise recalculates only explicit numeric changes.</p>
        </div>
      </div>

      <form
        className="scenario-panel__input"
        onSubmit={(event) => {
          event.preventDefault();
          if (isLoading || question.trim().length < 3) return;
          onRunScenario();
        }}
      >
        <input
          aria-label="Your what-if question"
          disabled={isLoading}
          placeholder="What if winter is rainy, or harvest falls by 10%?"
          ref={questionInputRef}
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
        />
        <Button
          disabled={isLoading || question.trim().length < 3}
          icon={<RotateCcw size={16} />}
          type="submit"
        >
          {isLoading ? "Turning your what-if into a calculation…" : "Test change"}
        </Button>
      </form>

      {error ? <p className="inline-error" role="alert">{error}</p> : null}

      {guidance ? (
        <div className={`scenario-guidance scenario-guidance--${guidance.kind}`} role="status">
          <div className="scenario-guidance__heading">
            {guidance.kind === "weather" ? <CloudRain aria-hidden="true" size={19} /> : <Lightbulb aria-hidden="true" size={19} />}
            <div>
              <strong>{guidance.title}</strong>
              <span>{guidance.provider === "gemma" ? "Answered by Gemma" : "Answered locally because Gemma was unavailable"}</span>
            </div>
          </div>
          <p>{guidance.answer}</p>
          <ul>
            {guidance.nextSteps.map((step) => <li key={step}>{step}</li>)}
          </ul>
          {guidance.suggestedScenario ? (
            <button className="scenario-guidance__suggestion" type="button" onClick={() => onQuestionChange(guidance.suggestedScenario ?? "")}>
              <span>Stress-test the numbers</span>
              <strong>{guidance.suggestedScenario}</strong>
            </button>
          ) : null}
          <small>Advisory answer only. HarvestWise did not change the plan or its calculated action.</small>
        </div>
      ) : null}
    </section>
  );
}
