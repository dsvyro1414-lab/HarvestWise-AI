import { ArrowRight, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFieldLabel } from "@/domain/patches";
import type { FarmInterviewResult, GuidedInterviewPrompt } from "@/domain/types";

interface FarmInterviewCopilotProps {
  text: string;
  result: FarmInterviewResult | null;
  prompt: GuidedInterviewPrompt;
  error: string | null;
  guidanceError: string | null;
  isLoading: boolean;
  isRequestingGuidance: boolean;
  onTextChange: (text: string) => void;
  onExtract: () => void;
  onRequestGuidance: () => void;
}

export function FarmInterviewCopilot({
  text,
  result,
  prompt,
  error,
  guidanceError,
  isLoading,
  isRequestingGuidance,
  onTextChange,
  onExtract,
  onRequestGuidance,
}: FarmInterviewCopilotProps) {
  const hasNextQuestion = prompt.field !== null && prompt.question !== null;

  return (
    <section className="copilot-box" aria-label="Farm interview copilot">
      <div className="copilot-box__heading">
        <div>
          <h3>Guided farm interview</h3>
          <p>Gemma asks one assumption at a time; HarvestWise structures the plan.</p>
        </div>
        <span className={`copilot-box__provider copilot-box__provider--${prompt.provider}`}>
          {prompt.provider === "gemma" ? "Gemma guide" : "Local guide"}
        </span>
      </div>

      <div className="copilot-question">
        <span>{hasNextQuestion ? "Next assumption" : "Captured plan"}</span>
        <strong>{hasNextQuestion ? prompt.question : prompt.summary}</strong>
        {hasNextQuestion ? <p>{prompt.summary}</p> : <p>Use the reality check after calculation to validate local lease, quotes, yield, buyer price, and timing.</p>}
      </div>

      {hasNextQuestion ? (
        <>
          <textarea
            placeholder="Answer this question, or paste your full farm note."
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
          />

          <Button
            fullWidth
            disabled={isLoading || text.trim().length < 1}
            icon={<WandSparkles size={16} />}
            variant="secondary"
            onClick={onExtract}
          >
            {isLoading ? "Structuring answer..." : "Use this answer"}
          </Button>
        </>
      ) : null}

      <button className="copilot-box__refresh" disabled={isRequestingGuidance} type="button" onClick={onRequestGuidance}>
        {isRequestingGuidance ? <Sparkles size={15} /> : <ArrowRight size={15} />}
        {isRequestingGuidance
          ? "Gemma is preparing..."
          : hasNextQuestion
            ? "Ask Gemma to phrase the next question"
            : "Ask Gemma for a plain-language summary"}
      </button>

      {result ? (
        <div className="copilot-result">
          <span>{result.provider === "gemma" ? "Gemma structured the answer" : "Local structuring fallback"}</span>
          <p>
            {result.extractedFields.length > 0
              ? result.extractedFields.map(formatFieldLabel).join(", ")
              : "No fields found yet"}
          </p>
        </div>
      ) : null}

      {error ? <p className="inline-error" role="alert">{error}</p> : null}
      {guidanceError ? <p className="inline-error" role="alert">{guidanceError}</p> : null}
    </section>
  );
}
