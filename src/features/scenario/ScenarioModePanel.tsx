import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatters";

interface ScenarioSummary {
  explanation: string;
  changedFields: string[];
  beforePlan: { expectedProfit: number };
  afterPlan: { expectedProfit: number };
  provider: "gemma" | "local-fallback";
}

interface ScenarioModePanelProps {
  question: string;
  lastScenario: ScenarioSummary | null;
  error: string | null;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onRunScenario: () => void;
}

export function ScenarioModePanel({
  question,
  lastScenario,
  error,
  isLoading,
  onQuestionChange,
  onRunScenario,
}: ScenarioModePanelProps) {
  return (
    <section className="scenario-panel" aria-label="Scenario mode">
      <div className="section-title">
        <FlaskConical size={20} />
        <div>
          <h2>Test a change</h2>
          <p>Gemma reads the question; HarvestWise recalculates.</p>
        </div>
      </div>

      <div className="scenario-panel__input">
        <input
          placeholder="What if fertilizer cost rises by 20%?"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
        />
        <Button
          disabled={isLoading || question.trim().length < 3}
          icon={<RotateCcw size={16} />}
          onClick={onRunScenario}
        >
          {isLoading ? "Running..." : "Run scenario"}
        </Button>
      </div>

      {lastScenario ? (
        <div className="scenario-panel__result">
          <span>{lastScenario.provider === "gemma" ? "Gemma interpreted the change" : "Local interpreter"}</span>
          <strong>
            {formatCurrency(lastScenario.beforePlan.expectedProfit)} → {formatCurrency(lastScenario.afterPlan.expectedProfit)}
          </strong>
          <p>{lastScenario.explanation}</p>
          {lastScenario.changedFields.length > 0 ? (
            <ul>
              {lastScenario.changedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </section>
  );
}
