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
        <p className="advisor-intro">Gemma can turn a farm note into inputs or explain a result. It does not calculate profit or choose the recommendation.</p>
      )}

      <div className="advisor-actions">
        <label className="question-box">
          <span>Ask about this calculation</span>
          <div>
            <input
              placeholder="Why is this plan high risk?"
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
            />
            <button aria-label="Send question" type="button" onClick={onAskGemma}>
              <Send size={16} />
            </button>
          </div>
        </label>

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
