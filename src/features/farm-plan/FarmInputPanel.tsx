import { RotateCcw } from "lucide-react";
import { applyCropDefaults, cropOptions } from "@/domain/crops";
import type {
  CropId,
  FarmInterviewResult,
  FarmPlanInput,
  MarketContext,
  SamplePlan,
  SamplePlanId,
} from "@/domain/types";
import { NumberField } from "@/components/ui/NumberField";
import { FarmInterviewCopilot } from "./FarmInterviewCopilot";

interface FarmInputPanelProps {
  input: FarmPlanInput;
  activeSamplePlanId: SamplePlanId | null;
  interviewText: string;
  interviewResult: FarmInterviewResult | null;
  isExtractingInterview: boolean;
  marketContext: MarketContext;
  samplePlans: SamplePlan[];
  onChange: (input: FarmPlanInput) => void;
  onInterviewTextChange: (text: string) => void;
  onExtractInterview: () => void;
  onSelectSamplePlan: (planId: SamplePlanId) => void;
}

export function FarmInputPanel({
  input,
  activeSamplePlanId,
  interviewText,
  interviewResult,
  isExtractingInterview,
  marketContext,
  samplePlans,
  onChange,
  onInterviewTextChange,
  onExtractInterview,
  onSelectSamplePlan,
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
          <h2>Assumptions</h2>
          <p>What this result is based on</p>
        </div>
        <button className="reset-button" type="button" onClick={() => onSelectSamplePlan("balanced")}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <div className="sample-plan-switcher" aria-label="Sample plans">
        {samplePlans.map((plan) => (
          <button
            className={`sample-plan-button ${plan.id === activeSamplePlanId ? "sample-plan-button--active" : ""}`}
            key={plan.id}
            type="button"
            onClick={() => onSelectSamplePlan(plan.id)}
          >
            <strong>{plan.name}</strong>
            <span>{plan.summary}</span>
          </button>
        ))}
      </div>

      <div className="market-context" aria-label="Market context">
        <div>
          <span>Region</span>
          <strong>{marketContext.region}</strong>
        </div>
        <div>
          <span>Source</span>
          <strong>{marketContext.sourceLabel}</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{marketContext.confidence} · {marketContext.updatedDate}</strong>
        </div>
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
          step={1000}
          unit="USD"
          value={input.availableBudget}
          onChange={(value) => updateNumber("availableBudget", value)}
        />
        <NumberField
          label="Seed"
          step={5}
          unit="USD/acre"
          value={input.seedCostPerAcre}
          onChange={(value) => updateNumber("seedCostPerAcre", value)}
        />
        <NumberField
          label="Fertilizer"
          step={5}
          unit="USD/acre"
          value={input.fertilizerCostPerAcre}
          onChange={(value) => updateNumber("fertilizerCostPerAcre", value)}
        />
        <NumberField
          label="Labor & ops"
          step={10}
          unit="USD/acre"
          value={input.laborCostPerAcre}
          onChange={(value) => updateNumber("laborCostPerAcre", value)}
        />
        <NumberField
          label="Harvest"
          step={1}
          unit={`${selectedCrop.unitPlural}/acre`}
          value={input.expectedHarvestPerAcre}
          onChange={(value) => updateNumber("expectedHarvestPerAcre", value)}
        />
        <NumberField
          label="Market price"
          step={0.05}
          unit={`USD/${selectedCrop.unit}`}
          value={input.marketPricePerUnit}
          onChange={(value) => updateNumber("marketPricePerUnit", value)}
        />
        <NumberField
          label="Transport"
          step={100}
          unit="USD"
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

      <details className="copilot-disclosure">
        <summary>Import from interview</summary>
        <FarmInterviewCopilot
          isLoading={isExtractingInterview}
          result={interviewResult}
          text={interviewText}
          onExtract={onExtractInterview}
          onTextChange={onInterviewTextChange}
        />
      </details>

      <p className="input-panel__timestamp">Live USD calculation · {marketContext.updatedDate}</p>
    </section>
  );
}
