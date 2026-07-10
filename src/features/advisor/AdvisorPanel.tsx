import { MessageSquareText, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdvisorPayload } from "@/domain/types";

interface AdvisorPanelProps {
  advice: AdvisorPayload;
  hasExplanation: boolean;
  isLoading: boolean;
  question: string;
  onQuestionChange: (question: string) => void;
  onAskGemma: () => void;
  onGenerateWhatsApp: () => void;
}

const questionSuggestions = [
  "What if prices drop 20%?",
  "Which cost should I reduce first?",
  "Should I store or sell now?",
];

export function AdvisorPanel({
  advice,
  hasExplanation,
  isLoading,
  question,
  onQuestionChange,
  onAskGemma,
  onGenerateWhatsApp,
}: AdvisorPanelProps) {
  return (
    <aside className="side-panel advisor-panel" id="advisor-notes" aria-label="Advisor notes">
      <div className="advisor-panel__heading">
        <div className="section-title">
          <Sparkles size={21} />
          <div>
            <h2>Gemma explains the plan</h2>
            <p>{advice.provider === "gemma" ? "Gemma explanation · deterministic decision" : "Optional explanation · deterministic decision"}</p>
          </div>
        </div>
      </div>

      <div className="advisor-thread" aria-live="polite">
        <div className="advisor-message advisor-message--gemma">
          <Sparkles size={16} aria-hidden="true" />
          {hasExplanation ? (
            <div className="advisor-copy">
              <p className="advisor-copy__summary">{advice.summary}</p>
              <ul>
                {advice.insights.slice(0, 2).map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="advisor-intro">I can explain this plan, test an assumption, or turn the result into a farmer-friendly message.</p>
          )}
        </div>
      </div>

      <div className="advisor-suggestions" aria-label="Suggested questions">
        {questionSuggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => onQuestionChange(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="advisor-actions">
        <form
          className="question-box"
          onSubmit={(event) => {
            event.preventDefault();
            onAskGemma();
          }}
        >
          <label htmlFor="gemma-question">Ask about this calculation</label>
          <div>
            <input
              id="gemma-question"
              placeholder="Ask about this plan…"
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
            />
            <button aria-label="Send question" type="submit">
              <Send size={16} />
            </button>
          </div>
        </form>

        <Button fullWidth icon={<MessageSquareText size={17} />} variant="secondary" onClick={onAskGemma}>
          {isLoading ? "Getting explanation..." : "Explain with Gemma"}
        </Button>
      </div>

      <details className="whatsapp-preview">
        <summary>WhatsApp draft</summary>
        <p>{advice.whatsappMessage}</p>
        <button className="mini-link-button" type="button" onClick={onGenerateWhatsApp}>
          Refresh draft
        </button>
      </details>
    </aside>
  );
}
