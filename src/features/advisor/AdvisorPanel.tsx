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
    <aside className="advisor-panel" aria-label="Advisor notes">
      <div className="advisor-panel__heading">
        <div className="section-title">
          <Sparkles size={21} />
          <div>
            <h2>Advisor Notes (Gemma)</h2>
            <p>{advice.provider === "gemma" ? "Live AI explanation" : "Local fallback ready"}</p>
          </div>
        </div>
      </div>

      <div className="ai-notice">
        Gemma explains the financial plan. Calculations stay deterministic in the app.
      </div>

      <div className="advisor-copy">
        <h3>Summary</h3>
        <p>{advice.summary}</p>

        <h3>Key Insights</h3>
        <ul>
          {advice.insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>

        <h3>Recommendations</h3>
        <ol>
          {advice.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ol>
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
        <Button fullWidth icon={<MessageSquareText size={17} />} onClick={onGenerateWhatsApp}>
          Generate WhatsApp advice
        </Button>
      </div>

      <div className="whatsapp-preview">
        <span>WhatsApp draft</span>
        <p>{advice.whatsappMessage}</p>
      </div>
    </aside>
  );
}
