import { MessageSquareText, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AdvisorPayload } from "@/domain/types";

interface AdvisorPanelProps {
  advice: AdvisorPayload;
  isLoading: boolean;
  question: string;
  onQuestionChange: (question: string) => void;
  onAskGemma: () => void;
  onGenerateWhatsApp: () => void;
}

export function AdvisorPanel({
  advice,
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
            <h2>Advisor</h2>
            <p>{advice.provider === "gemma" ? "Live AI explanation" : "Local fallback ready"}</p>
          </div>
        </div>
      </div>

      <div className="advisor-copy">
        <p className="advisor-copy__summary">{advice.summary}</p>
        <ul>
          {advice.insights.slice(0, 2).map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      </div>

      <div className="advisor-actions">
        <label className="question-box">
          <span>Ask Gemma</span>
          <div>
            <input
              placeholder="Ask a question about this plan..."
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
            />
            <button aria-label="Send question" type="button" onClick={onAskGemma}>
              <Send size={16} />
            </button>
          </div>
        </label>

        <Button fullWidth icon={<MessageSquareText size={17} />} variant="secondary" onClick={onAskGemma}>
          {isLoading ? "Asking Gemma..." : "Ask Gemma to explain"}
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
