import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { applyCropDefaults, cropOptions } from "@/domain/crops";
import type { CropId, FarmInterviewResult, FarmPlanInput, GuidedInterviewPrompt } from "@/domain/types";
import { NumberField } from "@/components/ui/NumberField";
import { FarmInterviewCopilot } from "./FarmInterviewCopilot";

interface FarmInputPanelProps {
  input: FarmPlanInput;
  interviewText: string;
  interviewResult: FarmInterviewResult | null;
  guidedPrompt: GuidedInterviewPrompt;
  interviewError: string | null;
  guidanceError: string | null;
  isExtractingInterview: boolean;
  isRequestingGuidance: boolean;
  isPlanCreated: boolean;
  onChange: (input: FarmPlanInput) => void;
  onCreatePlan: () => void;
  onReset: () => void;
  onInterviewTextChange: (text: string) => void;
  onExtractInterview: () => void;
  onRequestGuidance: () => void;
}

export function FarmInputPanel({
  input,
  interviewText,
  interviewResult,
  guidedPrompt,
  interviewError,
  guidanceError,
  isExtractingInterview,
  isRequestingGuidance,
  isPlanCreated,
  onChange,
  onCreatePlan,
  onReset,
  onInterviewTextChange,
  onExtractInterview,
  onRequestGuidance,
}: FarmInputPanelProps) {
  const selectedCrop = cropOptions.find((crop) => crop.id === input.cropId) ?? cropOptions[0];
  const completedCoreInputs = [
    input.landSizeAcres,
    input.availableBudget,
    input.expectedHarvestPerAcre,
    input.marketPricePerUnit,
  ].filter((value) => value > 0).length;
  const isReady = completedCoreInputs === 4;

  function updateNumber(key: keyof FarmPlanInput, value: number) {
    onChange({
      ...input,
      [key]: value,
    });
  }

  function updateCrop(cropId: CropId) {
    onChange({
      ...applyCropDefaults(input, cropId),
      expectedHarvestPerAcre: 0,
      marketPricePerUnit: 0,
    });
  }

  return (
    <section className="input-panel" id="farm-inputs" aria-label="Farm inputs">
      <div className="panel-heading">
        <div>
          <h2>Farm details</h2>
          <p>Use your own season assumptions. Results stay hidden until you create the plan.</p>
        </div>
        <button className="reset-button" type="button" onClick={onReset}>
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
          emptyWhenZero
          label="Land"
          min={0.1}
          placeholder="e.g. 40"
          step={0.1}
          unit="acres"
          value={input.landSizeAcres}
          onChange={(value) => updateNumber("landSizeAcres", value)}
        />
        <NumberField
          emptyWhenZero
          label="Available budget"
          min={1}
          placeholder="e.g. 35000"
          step={500}
          unit="USD"
          value={input.availableBudget}
          onChange={(value) => updateNumber("availableBudget", value)}
        />
        <NumberField
          emptyWhenZero
          label="Expected harvest"
          min={0.1}
          placeholder="e.g. 220"
          step={1}
          unit={`${selectedCrop.unitPlural}/acre`}
          value={input.expectedHarvestPerAcre}
          onChange={(value) => updateNumber("expectedHarvestPerAcre", value)}
        />
        <NumberField
          emptyWhenZero
          label="Market price"
          min={0.01}
          placeholder="e.g. 4.05"
          step={0.05}
          unit={`USD/${selectedCrop.unit}`}
          value={input.marketPricePerUnit}
          onChange={(value) => updateNumber("marketPricePerUnit", value)}
        />
      </div>

      <details className="assumption-disclosure">
        <summary>Costs and market assumptions</summary>
        <div className="input-panel__fields input-panel__fields--advanced">
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
          label="Fieldwork & equipment"
          step={5}
          unit="USD/acre"
          value={input.laborCostPerAcre}
          onChange={(value) => updateNumber("laborCostPerAcre", value)}
        />
        <NumberField
          label="Land lease"
          step={5}
          unit="USD/acre"
          value={input.landLeaseCostPerAcre}
          onChange={(value) => updateNumber("landLeaseCostPerAcre", value)}
        />
        <NumberField
          label="Hauling & delivery"
          step={50}
          unit="USD total"
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
        <p className="assumption-disclosure__note">Midwest U.S. benchmarks are starting assumptions, not live bids. Review lease, fieldwork, and local market costs before relying on the result.</p>
      </details>

      <FarmInterviewCopilot
        error={interviewError}
        guidanceError={guidanceError}
        isLoading={isExtractingInterview}
        isRequestingGuidance={isRequestingGuidance}
        prompt={guidedPrompt}
        result={interviewResult}
        text={interviewText}
        onExtract={onExtractInterview}
        onRequestGuidance={onRequestGuidance}
        onTextChange={onInterviewTextChange}
      />

      <div className="input-readiness" aria-live="polite">
        <span>{completedCoreInputs} of 4 personal inputs complete</span>
        <span className="input-readiness__track" aria-hidden="true">
          <span style={{ width: `${completedCoreInputs * 25}%` }} />
        </span>
      </div>

      <Button
        className="input-panel__cta"
        disabled={!isReady}
        fullWidth
        icon={isPlanCreated ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
        onClick={onCreatePlan}
      >
        {isPlanCreated ? "View updated plan" : "Create my farm plan"}
      </Button>

      <p className="input-panel__timestamp">
        {isReady ? "Ready to calculate from your entries" : "Complete the four blank fields to continue"}
      </p>
    </section>
  );
}
