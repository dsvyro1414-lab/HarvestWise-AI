import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdvisorPanel } from "@/features/advisor/AdvisorPanel";
import { CropComparisonTable } from "@/features/crop-comparison/CropComparisonTable";
import { FarmInputPanel } from "@/features/farm-plan/FarmInputPanel";
import { FarmerActionCard } from "@/features/farm-plan/FarmerActionCard";
import { ProfitSnapshot } from "@/features/farm-plan/ProfitSnapshot";
import { MarketDecisionCards } from "@/features/market-decision/MarketDecisionCards";
import { buildFallbackAdvice } from "@/domain/advice";
import { applyCropDefaults, createEmptyFarmInput } from "@/domain/crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan, getBestMarketDecision } from "@/domain/finance";
import { applyFarmPlanPatch, describeOperations, formatFieldLabel } from "@/domain/patches";
import type {
  AdvisorPayload,
  AdvisorChatMessage,
  DecisionId,
  FarmInterviewResult,
  FarmPlanInput,
  FarmPlanPatch,
} from "@/domain/types";
import { requestAdvisorNotes } from "@/services/adviceApi";
import { requestFarmInterviewExtraction, requestScenarioParsing } from "@/services/copilotApi";
import { ScenarioModePanel } from "@/features/scenario/ScenarioModePanel";

export function App() {
  const [input, setInput] = useState<FarmPlanInput>(() => createEmptyFarmInput("maize"));
  const [isPlanCreated, setIsPlanCreated] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<DecisionId>("sell-harvest");
  const [remoteAdvice, setRemoteAdvice] = useState<AdvisorPayload | null>(null);
  const [question, setQuestion] = useState("");
  const [interviewText, setInterviewText] = useState("");
  const [interviewResult, setInterviewResult] = useState<FarmInterviewResult | null>(null);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [scenarioQuestion, setScenarioQuestion] = useState("");
  const [lastScenario, setLastScenario] = useState<{
    explanation: string;
    changedFields: string[];
    beforeProfit: number;
    afterProfit: number;
    provider: "gemma" | "local-fallback";
  } | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorChatMessage[]>([]);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [isExtractingInterview, setIsExtractingInterview] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const adviceRequestId = useRef(0);

  const isPlanReady =
    input.landSizeAcres > 0 &&
    input.availableBudget > 0 &&
    input.expectedHarvestPerAcre > 0 &&
    input.marketPricePerUnit > 0;
  const showPlan = isPlanCreated && isPlanReady;

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
    setAdvisorMessages([]);
    setAdvisorError(null);
    setIsLoadingAdvice(false);
    adviceRequestId.current += 1;
  }, [bestMarketDecision.id, input]);

  async function handleAskGemma(mode: "explain" | "whatsapp" = "explain") {
    if (!showPlan) return;

    const userQuestion = question.trim() || "Please explain this plan and why this is the recommended next action.";
    const history = advisorMessages.map((message) => ({
      role: message.role,
      content: message.text,
    }));

    setAdvisorError(null);
    setIsLoadingAdvice(true);
    const requestId = adviceRequestId.current + 1;
    adviceRequestId.current = requestId;
    if (mode === "explain") {
      setAdvisorMessages((messages) => [
        ...messages,
        { id: createMessageId("user"), role: "user", text: userQuestion },
      ]);
      setQuestion("");
    }

    try {
      const response = await requestAdvisorNotes({
        input,
        mode,
        question: userQuestion,
        history,
      });
      if (requestId !== adviceRequestId.current) return;
      setRemoteAdvice(response);
      if (mode === "explain") {
        setAdvisorMessages((messages) => [
          ...messages,
          {
            id: createMessageId("assistant"),
            role: "assistant",
            text: response.summary,
            insights: response.insights,
            provider: response.provider,
          },
        ]);
      }
    } catch {
      if (requestId !== adviceRequestId.current) return;
      const localResponse: AdvisorPayload = {
        ...fallbackAdvice,
        summary: `${fallbackAdvice.summary} Gemma is not connected yet, so this is the local fallback explanation.`,
        provider: "local-fallback",
      };
      setRemoteAdvice(localResponse);
      setAdvisorError("Gemma could not be reached. A local explanation is shown instead.");
      if (mode === "explain") {
        setAdvisorMessages((messages) => [
          ...messages,
          {
            id: createMessageId("assistant"),
            role: "assistant",
            text: localResponse.summary,
            insights: localResponse.insights,
            provider: "local-fallback",
          },
        ]);
      }
    } finally {
      if (requestId === adviceRequestId.current) setIsLoadingAdvice(false);
    }
  }

  async function handleExtractInterview() {
    setInterviewError(null);
    setIsExtractingInterview(true);
    try {
      const response = await requestFarmInterviewExtraction({
        text: interviewText,
        currentInput: input,
      });
      setInterviewResult(response);
      applyPatch(response.patch);
    } catch {
      setInterviewError("We could not read that note. Check your connection or enter the four essentials manually.");
    } finally {
      setIsExtractingInterview(false);
    }
  }

  async function handleRunScenario() {
    setScenarioError(null);
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
    } catch {
      setScenarioError("We could not interpret that change. Try a specific value, such as “fertilizer cost rises by 20%.”");
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

  function handleInputChange(nextInput: FarmPlanInput) {
    setInput(nextInput);
    setLastScenario(null);
    setScenarioError(null);
  }

  function handleCreatePlan() {
    if (!isPlanReady) return;
    setIsPlanCreated(true);
    window.setTimeout(() => {
      document.getElementById("plan-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function handleReset() {
    setInput(createEmptyFarmInput(input.cropId));
    setIsPlanCreated(false);
    setInterviewText("");
    setInterviewResult(null);
    setInterviewError(null);
    setLastScenario(null);
    setScenarioQuestion("");
  }

  return (
    <AppShell hasPlan={showPlan}>
      <main className="guided-layout">
        <header className="journey-intro">
          <span className="journey-intro__eyebrow">Farm profit planner</span>
          <h2>Plan your farm season with confidence</h2>
          <p>Start with your own numbers. HarvestWise calculates the plan, then Gemma helps you understand it.</p>
        </header>

        <section className="journey-section" id="farm-plan" aria-labelledby="farm-plan-title">
          <div className="journey-step" aria-hidden="true">1</div>
          <div className="journey-section__body">
            <div className="journey-section__heading">
              <div>
                <span>Plan</span>
                <h2 id="farm-plan-title">Tell us about your farm</h2>
              </div>
              <p>Five inputs are enough to calculate the first plan.</p>
            </div>
            <FarmInputPanel
              input={input}
              interviewError={interviewError}
              interviewResult={interviewResult}
              interviewText={interviewText}
              isExtractingInterview={isExtractingInterview}
              isPlanCreated={showPlan}
              onChange={handleInputChange}
              onCreatePlan={handleCreatePlan}
              onExtractInterview={() => void handleExtractInterview()}
              onInterviewTextChange={setInterviewText}
              onReset={handleReset}
            />
          </div>
        </section>

        {showPlan ? <section className="journey-section journey-section--revealed" id="plan-results" aria-labelledby="plan-results-title">
          <div className="journey-step" aria-hidden="true">2</div>
          <div className="journey-section__body results-stack">
            <div className="journey-section__heading">
              <div>
                <span>Results</span>
                <h2 id="plan-results-title">Your plan at a glance</h2>
              </div>
              <p>Every number and recommendation is calculated locally.</p>
            </div>

            <FarmerActionCard key={`${plan.action.id}-${Math.round(plan.expectedProfit)}`} action={plan.action} />
            <ProfitSnapshot input={input} plan={plan} />

            <div className="analysis-disclosure-grid">
              <details className="analysis-disclosure">
                <summary>Test a change to this plan</summary>
                <ScenarioModePanel
                  error={scenarioError}
                  isLoading={isRunningScenario}
                  lastScenario={lastScenario}
                  question={scenarioQuestion}
                  onQuestionChange={setScenarioQuestion}
                  onRunScenario={() => void handleRunScenario()}
                />
              </details>

              <details className="analysis-disclosure">
                <summary>Compare other crops</summary>
                <CropComparisonTable activeCropId={input.cropId} comparisons={comparisons.slice(0, 4)} />
              </details>

              <details className="analysis-disclosure">
                <summary>Explore harvest market options</summary>
                <MarketDecisionCards
                  decisions={marketDecisions}
                  selectedId={selectedDecisionId}
                  onSelect={setSelectedDecisionId}
                />
              </details>
            </div>
          </div>
        </section> : null}

        {showPlan ? <section className="journey-section journey-section--gemma journey-section--revealed" id="ask-gemma" aria-labelledby="ask-gemma-title">
          <div className="journey-step" aria-hidden="true">3</div>
          <div className="journey-section__body">
            <div className="journey-section__heading">
              <div>
                <span>Gemma</span>
                <h2 id="ask-gemma-title">Ask about this plan</h2>
              </div>
              <p>Gemma explains. HarvestWise calculates.</p>
            </div>
            <AdvisorPanel
              advice={advice}
              error={advisorError}
              isLoading={isLoadingAdvice}
              messages={advisorMessages}
              question={question}
              onAskGemma={() => void handleAskGemma("explain")}
              onGenerateWhatsApp={() => void handleAskGemma("whatsapp")}
              onQuestionChange={setQuestion}
            />
          </div>
        </section> : null}
      </main>
    </AppShell>
  );
}

function createMessageId(role: AdvisorChatMessage["role"]): string {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
