import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, MessageSquareText, ShoppingCart, Sprout } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs } from "@/components/ui/Tabs";
import { AdvisorPanel } from "@/features/advisor/AdvisorPanel";
import { AdvisorWorkspace } from "@/features/advisor/AdvisorWorkspace";
import { CropComparisonTable } from "@/features/crop-comparison/CropComparisonTable";
import { FarmInputPanel } from "@/features/farm-plan/FarmInputPanel";
import { ProfitSnapshot } from "@/features/farm-plan/ProfitSnapshot";
import { MarketDecisionCards } from "@/features/market-decision/MarketDecisionCards";
import { buildFallbackAdvice } from "@/domain/advice";
import { applyCropDefaults, createDefaultFarmInput } from "@/domain/crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan, getBestMarketDecision } from "@/domain/finance";
import { applyFarmPlanPatch, describeOperations, formatFieldLabel } from "@/domain/patches";
import type {
  AdvisorPayload,
  DecisionId,
  FarmInterviewResult,
  FarmPlanInput,
  FarmPlanPatch,
} from "@/domain/types";
import { requestAdvisorNotes } from "@/services/adviceApi";
import { requestFarmInterviewExtraction, requestScenarioParsing } from "@/services/copilotApi";
import { ScenarioModePanel } from "@/features/scenario/ScenarioModePanel";

type WorkspaceTab = "farm-plan" | "compare-crops" | "market-decision" | "advisor-notes";

const tabs = [
  { label: "Farm Plan", value: "farm-plan", icon: <Sprout size={16} /> },
  { label: "Compare Crops", value: "compare-crops", icon: <BarChart3 size={16} /> },
  { label: "Market Decision", value: "market-decision", icon: <ShoppingCart size={16} /> },
  { label: "Advisor Notes", value: "advisor-notes", icon: <MessageSquareText size={16} /> },
] satisfies Array<{ label: string; value: WorkspaceTab; icon: ReactNode }>;

export function App() {
  const [input, setInput] = useState<FarmPlanInput>(() => createDefaultFarmInput("maize"));
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("farm-plan");
  const [selectedDecisionId, setSelectedDecisionId] = useState<DecisionId>("sell-harvest");
  const [remoteAdvice, setRemoteAdvice] = useState<AdvisorPayload | null>(null);
  const [question, setQuestion] = useState("");
  const [interviewText, setInterviewText] = useState(
    "I want to plant maize on 2 acres. I have ₦320k. Seed is ₦22k per acre, fertilizer ₦65k per acre, labor ₦45k per acre. I expect 26 bags per acre and can sell at ₦18,500 per bag.",
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

  async function handleAskGemma(mode: "explain" | "whatsapp" = "explain") {
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
    setRemoteAdvice(null);
    return nextInput;
  }

  function renderActiveTab() {
    if (activeTab === "compare-crops") {
      return <CropComparisonTable activeCropId={input.cropId} comparisons={comparisons} />;
    }

    if (activeTab === "market-decision") {
      return (
        <MarketDecisionCards
          decisions={marketDecisions}
          selectedId={selectedDecisionId}
          onSelect={setSelectedDecisionId}
        />
      );
    }

    if (activeTab === "advisor-notes") {
      return <AdvisorWorkspace advice={advice} />;
    }

    return (
      <>
        <ProfitSnapshot input={input} plan={plan} />
        <CropComparisonTable activeCropId={input.cropId} comparisons={comparisons.slice(0, 4)} />
        <MarketDecisionCards decisions={marketDecisions} selectedId={selectedDecisionId} onSelect={setSelectedDecisionId} />
      </>
    );
  }

  return (
    <AppShell>
      <main className="app-grid">
        <FarmInputPanel
          input={input}
          interviewResult={interviewResult}
          interviewText={interviewText}
          isExtractingInterview={isExtractingInterview}
          onChange={setInput}
          onExtractInterview={() => void handleExtractInterview()}
          onInterviewTextChange={setInterviewText}
        />

        <section className="main-content" aria-label="HarvestWise AI workspace">
          <Tabs items={tabs} value={activeTab} onChange={setActiveTab} />
          <ScenarioModePanel
            isLoading={isRunningScenario}
            lastScenario={lastScenario}
            question={scenarioQuestion}
            onQuestionChange={setScenarioQuestion}
            onRunScenario={() => void handleRunScenario()}
          />
          {renderActiveTab()}
        </section>

        <AdvisorPanel
          advice={advice}
          isLoading={isLoadingAdvice}
          question={question}
          onAskGemma={() => void handleAskGemma("explain")}
          onGenerateWhatsApp={() => void handleAskGemma("whatsapp")}
          onQuestionChange={setQuestion}
        />
      </main>
    </AppShell>
  );
}
