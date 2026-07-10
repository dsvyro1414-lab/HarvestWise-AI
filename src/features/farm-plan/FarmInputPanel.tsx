import { ArrowDown, RotateCcw } from "lucide-react";
import { applyCropDefaults, cropOptions, createDefaultFarmInput } from "@/domain/crops";
import type { CropId, FarmInterviewResult, FarmPlanInput } from "@/domain/types";
import { NumberField } from "@/components/ui/NumberField";
import { FarmInterviewCopilot } from "./FarmInterviewCopilot";

interface FarmInputPanelProps {
  input: FarmPlanInput;
  interviewText: string;
  interviewResult: FarmInterviewResult | null;
  isExtractingInterview: boolean;
  onChange: (input: FarmPlanInput) => void;
  onInterviewTextChange: (text: string) => void;
  onExtractInterview: () => void;
}

export function FarmInputPanel({
  input,
  interviewText,
  interviewResult,
  isExtractingInterview,
  onChange,
  onInterviewTextChange,
  onExtractInterview,
}: FarmInputPanelProps) {
  const selectedCrop = cropOptions.find((crop) => crop.id === input.cropId) ?? cropOptions[0];

  function updateNumber(key: keyof FarmPlanInput, value: number) {
    onChange({
      ...input,
      [key]: value,
    });
  }

  function updateCrop(cropId: CropId) {
    onChange(applyCropDefaults(input, cropId));
  }

  return (
    <section className="input-panel" id="farm-inputs" aria-label="Farm inputs">
      <div className="panel-heading">
        <div>
          <h2>Farm details</h2>
          <p>Results update instantly as you type.</p>
        </div>
        <button className="reset-button" type="button" onClick={() => onChange(createDefaultFarmInput(input.cropId))}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <div className="input-panel__fields">
        <label className="field">
          <span className="field__label">Crop</span>
          <span className="field__control">
            <select value={input.cropId} onChange={(event) => updateCrop(event.target.value as CropId)}>
              {cropOptions.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        <NumberField
          label="Land"
          min={0.1}
          step={0.1}
          unit="acres"
          value={input.landSizeAcres}
          onChange={(value) => updateNumber("landSizeAcres", value)}
        />
        <NumberField
          label="Available budget"
          step={5000}
          unit="NGN"
          value={input.availableBudget}
          onChange={(value) => updateNumber("availableBudget", value)}
        />
        <NumberField
          label="Expected harvest"
          step={1}
          unit={`${selectedCrop.unitPlural}/acre`}
          value={input.expectedHarvestPerAcre}
          onChange={(value) => updateNumber("expectedHarvestPerAcre", value)}
        />
        <NumberField
          label="Market price"
          step={500}
          unit={`NGN/${selectedCrop.unit}`}
          value={input.marketPricePerUnit}
          onChange={(value) => updateNumber("marketPricePerUnit", value)}
        />
      </div>

      <details className="assumption-disclosure">
        <summary>Costs and market assumptions</summary>
        <div className="input-panel__fields input-panel__fields--advanced">
        <NumberField
          label="Seed"
          step={1000}
          unit="NGN/acre"
          value={input.seedCostPerAcre}
          onChange={(value) => updateNumber("seedCostPerAcre", value)}
        />
        <NumberField
          label="Fertilizer"
          step={1000}
          unit="NGN/acre"
          value={input.fertilizerCostPerAcre}
          onChange={(value) => updateNumber("fertilizerCostPerAcre", value)}
        />
        <NumberField
          label="Labor"
          step={1000}
          unit="NGN/acre"
          value={input.laborCostPerAcre}
          onChange={(value) => updateNumber("laborCostPerAcre", value)}
        />
        <NumberField
          label="Transport"
          step={1000}
          unit="NGN"
          value={input.transportCost}
          onChange={(value) => updateNumber("transportCost", value)}
        />
        <NumberField
          label="Storage"
          max={6}
          step={1}
          unit="months"
          value={input.storageMonths}
          onChange={(value) => updateNumber("storageMonths", value)}
        />
        </div>
        <p className="assumption-disclosure__note">Costs are applied to the plan immediately. Storage changes the recommended action to the harvest stage.</p>
      </details>

      <details className="copilot-disclosure">
        <summary>Import a farm note with Gemma</summary>
        <FarmInterviewCopilot
          isLoading={isExtractingInterview}
          result={interviewResult}
          text={interviewText}
          onExtract={onExtractInterview}
          onTextChange={onInterviewTextChange}
        />
      </details>

      <a className="button button--primary button--full input-panel__cta" href="#plan-results">
        View my plan
        <ArrowDown size={16} />
      </a>

      <p className="input-panel__timestamp">Live calculation · edited today</p>
    </section>
  );
}
