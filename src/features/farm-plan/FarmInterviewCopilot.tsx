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
          <h3>Farm interview copilot</h3>
          <p>Describe the season. Gemma fills the form.</p>
        </div>
      </div>

      <textarea
        placeholder="Example: I want to plant maize on 2 acres. I have ₦320k, seed is ₦22k/acre, fertilizer ₦65k/acre, labor ₦45k/acre. I expect 26 bags per acre and can sell at ₦18,500 per bag."
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
