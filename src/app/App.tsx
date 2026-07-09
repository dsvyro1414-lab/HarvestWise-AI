import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdvisorPanel } from "@/features/advisor/AdvisorPanel";
import { CropComparisonTable } from "@/features/crop-comparison/CropComparisonTable";
import { FarmInputPanel } from "@/features/farm-plan/FarmInputPanel";
import { ProfitSnapshot } from "@/features/farm-plan/ProfitSnapshot";
import { MarketDecisionCards } from "@/features/market-decision/MarketDecisionCards";
import { buildFallbackAdvice } from "@/domain/advice";
import { applyCropDefaults } from "@/domain/crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan, getBestMarketDecision } from "@/domain/finance";
import { applyFarmPlanPatch, describeOperations, formatFieldLabel } from "@/domain/patches";
import { getSamplePlan, marketContext, samplePlans } from "@/domain/samplePlans";
import type {
  AdvisorPayload,
  DecisionId,
  FarmInterviewResult,
  FarmPlanInput,
  FarmPlanPatch,
  SamplePlanId,
} from "@/domain/types";
import { requestAdvisorNotes } from "@/services/adviceApi";
import { requestFarmInterviewExtraction, requestScenarioParsing } from "@/services/copilotApi";
import { ScenarioModePanel } from "@/features/scenario/ScenarioModePanel";

export function App() {
  const [input, setInput] = useState<FarmPlanInput>(() => getSamplePlan("balanced").input);
  const [activeSamplePlanId, setActiveSamplePlanId] = useState<SamplePlanId | null>("balanced");
  const [selectedDecisionId, setSelectedDecisionId] = useState<DecisionId>("sell-harvest");
  const [remoteAdvice, setRemoteAdvice] = useState<AdvisorPayload | null>(null);
  const [question, setQuestion] = useState("");
  const [interviewText, setInterviewText] = useState(
    "I want to plant corn on 160 acres in Iowa. I have $145k. Seed is $125 per acre, fertilizer $210 per acre, labor and operations $470 per acre. I expect 210 bushels per acre and can sell at $4.55 per bushel.",
  );
  const [interviewResult, setInterviewResult] = useState<FarmInterviewResult | null>(null);
  const [scenarioQuestion, setScenarioQuestion] = useState("");
  const [lastScenario, setLastScenario] = useState<{
    explanation: string;
    changedFields: string[];
    beforeProfit: number;
    afterProfit: number;
    provider: "gemma" | "local-fallback";
  } | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isExtractingInterview, setIsExtractingInterview] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);

  const plan = useMemo(() => calculateFarmPlan(input), [input]);
  const comparisons = useMemo(() => buildCropComparison(input), [input]);
  const marketDecisions = useMemo(() => buildMarketDecisions(input), [input]);
  const bestMarketDecision = useMemo(() => getBestMarketDecision(marketDecisions), [marketDecisions]);
  const fallbackAdvice = useMemo(
    () => buildFallbackAdvice({ input, plan, comparisons, marketDecisions }),
    [comparisons, input, marketDecisions, plan],
  );
  const advice = remoteAdvice ?? fallbackAdvice;

  useEffect(() => {
    setSelectedDecisionId(bestMarketDecision.id);
    setRemoteAdvice(null);
  }, [bestMarketDecision.id, input]);

  function handleInputChange(nextInput: FarmPlanInput) {
    setInput(nextInput);
    setActiveSamplePlanId(null);
  }

  function handleSelectSamplePlan(planId: SamplePlanId) {
    const plan = getSamplePlan(planId);

    setInput(plan.input);
    setActiveSamplePlanId(plan.id);
    setRemoteAdvice(null);
    setInterviewResult(null);
    setLastScenario(null);
  }

  async function handleAskGemma(mode: "explain" | "farmerMessage" = "explain") {
    setIsLoadingAdvice(true);
    try {
      const response = await requestAdvisorNotes({
        input,
        mode,
        question: question.trim() || undefined,
      });
      setRemoteAdvice(response);
    } catch {
      setRemoteAdvice({
        ...fallbackAdvice,
        summary: `${fallbackAdvice.summary} Gemma is not connected yet, so this is the local fallback explanation.`,
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  }

  async function handleExtractInterview() {
    setIsExtractingInterview(true);
    try {
      const response = await requestFarmInterviewExtraction({
        text: interviewText,
        currentInput: input,
      });
      setInterviewResult(response);
      applyPatch(response.patch);
    } finally {
      setIsExtractingInterview(false);
    }
  }

  async function handleRunScenario() {
    setIsRunningScenario(true);
    const beforeInput = input;
    const beforePlan = calculateFarmPlan(beforeInput);

    try {
      const response = await requestScenarioParsing({
        question: scenarioQuestion,
        currentInput: beforeInput,
      });
      const nextInput = applyPatch(response.patch, beforeInput);
      const afterPlan = calculateFarmPlan(nextInput);

      setLastScenario({
        explanation: response.explanation,
        changedFields:
          response.operations.length > 0
            ? describeOperations(response.operations)
            : response.changedFields.map(formatFieldLabel),
        beforeProfit: beforePlan.expectedProfit,
        afterProfit: afterPlan.expectedProfit,
        provider: response.provider,
      });
    } finally {
      setIsRunningScenario(false);
    }
  }

  function applyPatch(patch: FarmPlanPatch, baseInput = input): FarmPlanInput {
    const base =
      patch.cropId && patch.cropId !== baseInput.cropId
        ? applyCropDefaults(baseInput, patch.cropId)
        : baseInput;
    const nextInput = applyFarmPlanPatch(base, patch);

    setInput(nextInput);
    setActiveSamplePlanId(null);
    setRemoteAdvice(null);
    return nextInput;
  }

  return (
    <AppShell>
      <main className="analysis-layout">
        <FarmInputPanel
          activeSamplePlanId={activeSamplePlanId}
          input={input}
          interviewResult={interviewResult}
          interviewText={interviewText}
          isExtractingInterview={isExtractingInterview}
          marketContext={marketContext}
          samplePlans={samplePlans}
          onChange={handleInputChange}
          onExtractInterview={() => void handleExtractInterview()}
          onInterviewTextChange={setInterviewText}
          onSelectSamplePlan={handleSelectSamplePlan}
        />

        <section className="analysis-board" id="analysis-board" aria-label="HarvestWise AI analysis board">
          <ProfitSnapshot input={input} plan={plan} />
          <ScenarioModePanel
            isLoading={isRunningScenario}
            lastScenario={lastScenario}
            question={scenarioQuestion}
            onQuestionChange={setScenarioQuestion}
            onRunScenario={() => void handleRunScenario()}
          />
          <CropComparisonTable activeCropId={input.cropId} comparisons={comparisons.slice(0, 4)} />
        </section>

        <section className="action-rail" aria-label="Decision and advisor rail">
          <MarketDecisionCards decisions={marketDecisions} selectedId={selectedDecisionId} onSelect={setSelectedDecisionId} />
          <AdvisorPanel
            advice={advice}
            isLoading={isLoadingAdvice}
            question={question}
            onAskGemma={() => void handleAskGemma("explain")}
            onGenerateFarmerMessage={() => void handleAskGemma("farmerMessage")}
            onQuestionChange={setQuestion}
          />
        </section>
      </main>
    </AppShell>
  );
}
