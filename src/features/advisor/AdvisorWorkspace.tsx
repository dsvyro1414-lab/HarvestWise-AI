import { MessageSquareText } from "lucide-react";
import type { AdvisorPayload } from "@/domain/types";

interface AdvisorWorkspaceProps {
  advice: AdvisorPayload;
}

export function AdvisorWorkspace({ advice }: AdvisorWorkspaceProps) {
  return (
    <section className="content-panel advisor-workspace">
      <div className="section-title">
        <MessageSquareText size={20} />
        <div>
          <h2>Advisor Notes</h2>
          <p>Farmer-friendly explanation and cooperative memo</p>
        </div>
      </div>

      <div className="memo-grid">
        <article>
          <h3>Farmer explanation</h3>
          <p>{advice.summary}</p>
          <ul>
            {advice.insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h3>Cooperative memo</h3>
          <p>
            HarvestWise AI combines the farmer's season assumptions with deterministic cost, revenue, risk, and
            action calculations. Gemma explains those results in plain language; it does not choose the action.
          </p>
          <p>{advice.whatsappMessage}</p>
        </article>
      </div>
    </section>
  );
}
