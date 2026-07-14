import { useEffect, useRef } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ScenarioModePanelProps {
  question: string;
  error: string | null;
  focusOnMount?: boolean;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onRunScenario: () => void;
}

export function ScenarioModePanel({
  question,
  error,
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
          <p>Gemma reads the change. HarvestWise recalculates the numbers.</p>
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
          placeholder="What if fertilizer cost rises by 20%?"
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
    </section>
  );
}
