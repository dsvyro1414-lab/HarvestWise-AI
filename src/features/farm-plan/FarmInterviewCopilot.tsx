import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFieldLabel } from "@/domain/patches";
import type { FarmInterviewResult } from "@/domain/types";

interface FarmInterviewCopilotProps {
  text: string;
  result: FarmInterviewResult | null;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onExtract: () => void;
}

export function FarmInterviewCopilot({
  text,
  result,
  isLoading,
  onTextChange,
  onExtract,
}: FarmInterviewCopilotProps) {
  return (
    <section className="copilot-box" aria-label="Farm interview copilot">
      <div className="copilot-box__heading">
        <div>
          <h3>Interview import</h3>
          <p>Paste a farmer note and fill assumptions.</p>
        </div>
      </div>

      <textarea
        placeholder="Example: I want to plant corn on 160 acres in Iowa. I have $145k, seed is $125/acre, fertilizer $210/acre, labor and operations $470/acre. I expect 210 bushels per acre and can sell at $4.55 per bushel."
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
        {isLoading ? "Extracting..." : "Extract plan with Gemma"}
      </Button>

      {result ? (
        <div className="copilot-result">
          <span>{result.provider === "gemma" ? "Gemma extracted" : "Fallback extracted"}</span>
          <p>
            {result.extractedFields.length > 0
              ? result.extractedFields.map(formatFieldLabel).join(", ")
              : "No fields found yet"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
