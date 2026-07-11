import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFieldLabel } from "@/domain/patches";
import type { FarmInterviewResult } from "@/domain/types";

interface FarmInterviewCopilotProps {
  text: string;
  result: FarmInterviewResult | null;
  error: string | null;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onExtract: () => void;
}

export function FarmInterviewCopilot({
  text,
  result,
  error,
  isLoading,
  onTextChange,
  onExtract,
}: FarmInterviewCopilotProps) {
  return (
    <section className="copilot-box" aria-label="Farm interview copilot">
      <div className="copilot-box__heading">
        <div>
          <h3>Import a farm note</h3>
          <p>Paste a note, voice transcript, or supplier text. Gemma fills the fields it can identify.</p>
        </div>
      </div>

      <textarea
        placeholder="Example: 40 acres of corn; $35,000 budget; 220 bu/acre; buyer quote is $4.05/bu; cash rent $250/acre."
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
      />

      <Button
        fullWidth
        disabled={isLoading || text.trim().length < 5}
        icon={<WandSparkles size={16} />}
        variant="secondary"
        onClick={onExtract}
      >
        {isLoading ? "Reading note..." : "Fill fields with Gemma"}
      </Button>

      {result ? (
        <div className="copilot-result">
          <span>{result.provider === "gemma" ? "Gemma filled these fields" : "Local extraction fallback"}</span>
          <p>
            {result.extractedFields.length > 0
              ? result.extractedFields.map(formatFieldLabel).join(", ")
              : "No fields found yet"}
          </p>
        </div>
      ) : null}

      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </section>
  );
}
