import { MessageSquareText, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AdvisorChatMessage, AdvisorPayload } from "@/domain/types";
import { getAdviceLoadingStatus } from "./adviceProgress";

interface AdvisorPanelProps {
  advice: AdvisorPayload;
  error: string | null;
  isLoading: boolean;
  messages: AdvisorChatMessage[];
  question: string;
  onQuestionChange: (question: string) => void;
  onAskGemma: () => void;
  onGenerateWhatsApp: () => void;
}

const questionSuggestions = [
  "Why is this my next action?",
  "What makes this plan risky?",
  "Which assumption should I verify first?",
];

export function AdvisorPanel({
  advice,
  error,
  isLoading,
  messages,
  question,
  onQuestionChange,
  onAskGemma,
  onGenerateWhatsApp,
}: AdvisorPanelProps) {
  const elapsedSeconds = useAdviceElapsedSeconds(isLoading);
  const loadingStatus = getAdviceLoadingStatus(elapsedSeconds);

  return (
    <aside className="side-panel advisor-panel" id="advisor-notes" aria-label="Advisor notes">
      <div className="advisor-panel__heading">
        <div className="section-title">
          <Sparkles size={21} />
          <div>
            <h2>Gemma explains the plan</h2>
            <p>Ask follow-up questions about the numbers already calculated above.</p>
          </div>
        </div>
      </div>

      <div className="advisor-thread" aria-live="polite">
        {messages.length === 0 ? (
          <div className="advisor-message advisor-message--gemma">
            <Sparkles size={16} aria-hidden="true" />
            <p className="advisor-intro">I can explain the recommendation, risk, costs, and assumptions in this plan. Financial decisions remain calculated by HarvestWise.</p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div className={`advisor-message advisor-message--${message.role}`} key={message.id}>
            {message.role === "assistant" ? <Sparkles size={16} aria-hidden="true" /> : null}
            <div className="advisor-copy">
              <p className="advisor-copy__summary">{message.text}</p>
              {message.insights && message.insights.length > 0 ? (
                <ul>
                  {message.insights.slice(0, 2).map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              ) : null}
              {message.provider ? (
                <span className="advisor-message__provider">
                  {message.provider === "gemma" ? "Answered by Gemma" : "Local fallback answer"}
                </span>
              ) : null}
            </div>
          </div>
        ))}

        {isLoading ? (
          <div className="advisor-message advisor-message--gemma advisor-message--loading">
            <Sparkles size={16} aria-hidden="true" />
            <div className="advisor-loading__copy">
              <p aria-atomic="true" aria-live="polite" role="status">{loadingStatus.message}</p>
              <span aria-hidden="true" className="advisor-loading__elapsed">{elapsedSeconds}s elapsed</span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="inline-error" role="alert">{error}</p> : null}

      <div className="advisor-suggestions" aria-label="Suggested questions">
        {questionSuggestions.map((suggestion) => (
          <button disabled={isLoading} key={suggestion} type="button" onClick={() => onQuestionChange(suggestion)}>
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
              disabled={isLoading}
              id="gemma-question"
              placeholder="Ask about this plan…"
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
            />
            <button aria-label="Send question" disabled={isLoading || question.trim().length === 0} type="submit">
              <Send size={16} />
            </button>
          </div>
        </form>

        <Button disabled={isLoading} fullWidth icon={<MessageSquareText size={17} />} variant="secondary" onClick={onAskGemma}>
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

function useAdviceElapsedSeconds(isLoading: boolean): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const updateElapsedSeconds = () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateElapsedSeconds();
    const intervalId = window.setInterval(updateElapsedSeconds, 250);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  return elapsedSeconds;
}
