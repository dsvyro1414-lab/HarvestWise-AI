import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatters";

interface ScenarioSummary {
  explanation: string;
  changedFields: string[];
  beforeProfit: number;
  afterProfit: number;
  provider: "gemma" | "local-fallback";
}

interface ScenarioModePanelProps {
  question: string;
  lastScenario: ScenarioSummary | null;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onRunScenario: () => void;
}

export function ScenarioModePanel({
  question,
  lastScenario,
  isLoading,
  onQuestionChange,
  onRunScenario,
}: ScenarioModePanelProps) {
  return (
    <section className="scenario-panel" aria-label="Scenario mode">
      <div className="section-title">
        <FlaskConical size={20} />
        <div>
          <h2>Run scenario</h2>
          <p>Ask what changes profit or risk.</p>
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
          <span>{lastScenario.provider === "gemma" ? "Gemma operations" : "Fallback operations"}</span>
          <strong>
            {formatCurrency(lastScenario.beforeProfit)} → {formatCurrency(lastScenario.afterProfit)}
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
    </section>
  );
}
