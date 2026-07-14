import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdvisorPanel } from "@/features/advisor/AdvisorPanel";
import { CropComparisonTable } from "@/features/crop-comparison/CropComparisonTable";
import { DecisionPackPanel } from "@/features/decision-pack/DecisionPackPanel";
import { FarmInputPanel } from "@/features/farm-plan/FarmInputPanel";
import { FarmerActionCard } from "@/features/farm-plan/FarmerActionCard";
import { PlanNumbersDetails, ProfitSnapshot } from "@/features/farm-plan/ProfitSnapshot";
import { ActionPackPanel } from "@/features/farm-plan/ActionPackPanel";
import { MarketDecisionCards } from "@/features/market-decision/MarketDecisionCards";
import { MarketPulsePanel } from "@/features/market-pulse/MarketPulsePanel";
import { PostPlanAnalysis, PostPlanDashboard, type PostPlanScenario } from "@/features/post-plan/PostPlanDashboard";
import { WeatherContextPanel } from "@/features/weather/WeatherContextPanel";
import { buildFallbackAdvice } from "@/domain/advice";
import { buildActionPack, type RealityCheckPrompt } from "@/domain/actionPack";
import { applyCropDefaults, createEmptyFarmInput } from "@/domain/crops";
import { buildCropComparison, buildMarketDecisions, calculateFarmPlan, getBestMarketDecision } from "@/domain/finance";
import { applyFarmPlanPatch } from "@/domain/patches";
import { buildScenarioComparison } from "@/domain/scenario";
import type {
  AdvisorPayload,
  AdvisorChatMessage,
  DecisionId,
  FarmInterviewResult,
  FarmPlanInput,
  FarmPlanPatch,
  ScenarioGuidance,
  WeatherLocationId,
  WeatherResponse,
} from "@/domain/types";
import { requestAdvisorNotes } from "@/services/adviceApi";
import {
  requestFarmInterviewExtraction,
  requestRealityCheckQuestion,
  requestScenarioParsing,
} from "@/services/copilotApi";
import { requestWeatherContext } from "@/services/weatherApi";

export function App() {
  const [input, setInput] = useState<FarmPlanInput>(() => createEmptyFarmInput("corn"));
  const [isPlanCreated, setIsPlanCreated] = useState(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<DecisionId>("sell-harvest");
  const [remoteAdvice, setRemoteAdvice] = useState<AdvisorPayload | null>(null);
  const [question, setQuestion] = useState("");
  const [interviewText, setInterviewText] = useState("");
  const [interviewResult, setInterviewResult] = useState<FarmInterviewResult | null>(null);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [realityCheckPrompt, setRealityCheckPrompt] = useState<RealityCheckPrompt | null>(null);
  const [realityCheckError, setRealityCheckError] = useState<string | null>(null);
  const [scenarioQuestion, setScenarioQuestion] = useState("");
  const [lastScenario, setLastScenario] = useState<PostPlanScenario | null>(null);
  const [scenarioGuidance, setScenarioGuidance] = useState<ScenarioGuidance | null>(null);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [weatherLocationId, setWeatherLocationId] = useState<WeatherLocationId | "">("");
  const [weatherResponse, setWeatherResponse] = useState<WeatherResponse | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorChatMessage[]>([]);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [isExtractingInterview, setIsExtractingInterview] = useState(false);
  const [isRequestingRealityCheck, setIsRequestingRealityCheck] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const adviceRequestId = useRef(0);
  const scenarioRequestId = useRef(0);

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
  const fallbackAdvice = useMemo(() => {
    if (!lastScenario) {
      return buildFallbackAdvice({ input, plan, comparisons, marketDecisions });
    }

    return buildFallbackAdvice({
      input: lastScenario.afterInput,
      plan: lastScenario.afterPlan,
      comparisons: buildCropComparison(lastScenario.afterInput),
      marketDecisions: buildMarketDecisions(lastScenario.afterInput),
    });
  }, [comparisons, input, lastScenario, marketDecisions, plan]);
  const advice = remoteAdvice ?? fallbackAdvice;
  const actionPack = useMemo(() => buildActionPack(input, plan), [input, plan]);

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

    const explanationInput = lastScenario?.afterInput ?? input;
    const userQuestion = question.trim() || (lastScenario
      ? "Please explain the latest what-if result and its recalculated next action."
      : "Please explain this plan and why this is the recommended next action.");
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
        input: explanationInput,
        mode,
        question: userQuestion,
        history,
      });
      if (requestId !== adviceRequestId.current) return;
      setRemoteAdvice(response);
      setAdvisorError(null);
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
      const localPlan = calculateFarmPlan(explanationInput);
      const localResponse: AdvisorPayload = {
        ...buildFallbackAdvice({
          input: explanationInput,
          plan: localPlan,
          comparisons: buildCropComparison(explanationInput),
          marketDecisions: buildMarketDecisions(explanationInput),
          question: userQuestion,
        }),
      };
      setRemoteAdvice(localResponse);
      setAdvisorError("Gemma could not be reached. HarvestWise answered locally, and no plan numbers changed.");
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
      setInterviewText("");
    } catch {
      setInterviewError("We could not read that note. Check your connection or enter the four essentials manually.");
    } finally {
      setIsExtractingInterview(false);
    }
  }

  async function handleAskRealityCheck() {
    if (!showPlan) return;
    setRealityCheckError(null);
    setIsRequestingRealityCheck(true);
    try {
      const response = await requestRealityCheckQuestion({ input });
      setRealityCheckPrompt(response);
    } catch {
      setRealityCheckError("Gemma could not draft the verification question. Try again in a moment.");
    } finally {
      setIsRequestingRealityCheck(false);
    }
  }

  async function handleRunScenario() {
    setScenarioError(null);
    setScenarioGuidance(null);
    setIsRunningScenario(true);
    const baselineInput = input;
    const requestId = scenarioRequestId.current + 1;
    scenarioRequestId.current = requestId;

    try {
      const response = await requestScenarioParsing({
        question: scenarioQuestion,
        currentInput: baselineInput,
      });
      if (requestId !== scenarioRequestId.current) return;

      if (response.guidance) {
        setScenarioGuidance(response.guidance);
        return;
      }

      const comparison = buildScenarioComparison(baselineInput, response);
      if (comparison.status === "invalid") {
        setScenarioError(comparison.message);
        return;
      }

      adviceRequestId.current += 1;
      setRemoteAdvice(null);
      setAdvisorMessages([]);
      setAdvisorError(null);
      setIsLoadingAdvice(false);
      setScenarioGuidance(null);
      setLastScenario(comparison.scenario);
    } catch {
      if (requestId !== scenarioRequestId.current) return;
      setScenarioError("We could not interpret that change. Try a specific value, such as “fertilizer cost rises by 20%.”");
    } finally {
      if (requestId === scenarioRequestId.current) setIsRunningScenario(false);
    }
  }

  async function handleLoadWeather() {
    if (!weatherLocationId) return;
    setWeatherError(null);
    setIsLoadingWeather(true);

    try {
      setWeatherResponse(await requestWeatherContext(weatherLocationId));
    } catch {
      setWeatherError("We could not load NWS weather. No plan assumptions have changed.");
    } finally {
      setIsLoadingWeather(false);
    }
  }

  function handleWeatherLocationChange(locationId: WeatherLocationId | "") {
    setWeatherLocationId(locationId);
    setWeatherResponse(null);
    setWeatherError(null);
  }

  function applyPatch(patch: FarmPlanPatch, baseInput = input): FarmPlanInput {
    const base =
      patch.cropId && patch.cropId !== baseInput.cropId
        ? applyCropDefaults(baseInput, patch.cropId)
        : baseInput;
    const nextInput = applyFarmPlanPatch(base, patch);

    scenarioRequestId.current += 1;
    setInput(nextInput);
    setRemoteAdvice(null);
    setLastScenario(null);
    setIsRunningScenario(false);
    setScenarioError(null);
    setScenarioGuidance(null);
    setRealityCheckPrompt(null);
    setRealityCheckError(null);
    return nextInput;
  }

  function handleInputChange(nextInput: FarmPlanInput) {
    scenarioRequestId.current += 1;
    setInput(nextInput);
    setLastScenario(null);
    setIsScenarioOpen(false);
    setIsRunningScenario(false);
    setScenarioError(null);
    setScenarioGuidance(null);
    setRealityCheckPrompt(null);
    setRealityCheckError(null);
  }

  function handleScenarioQuestionChange(nextQuestion: string) {
    setScenarioQuestion(nextQuestion);
    setScenarioError(null);
    setScenarioGuidance(null);
  }

  function handleCreatePlan() {
    if (!isPlanReady) return;
    setIsPlanCreated(true);
    window.setTimeout(() => {
      document.getElementById("plan-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function handleReset() {
    const nextInput = createEmptyFarmInput(input.cropId);
    scenarioRequestId.current += 1;
    setInput(nextInput);
    setIsPlanCreated(false);
    setInterviewText("");
    setInterviewResult(null);
    setInterviewError(null);
    setRealityCheckPrompt(null);
    setRealityCheckError(null);
    setLastScenario(null);
    setWeatherLocationId("");
    setWeatherResponse(null);
    setWeatherError(null);
    setIsScenarioOpen(false);
    setIsRunningScenario(false);
    setScenarioQuestion("");
    setScenarioError(null);
    setScenarioGuidance(null);
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
              <p>Every number and next action is calculated by HarvestWise.</p>
            </div>

            <FarmerActionCard key={`${plan.action.id}-${Math.round(plan.expectedProfit)}`} action={plan.action} />
            <ProfitSnapshot input={input} plan={plan} />
            <PostPlanDashboard
              isRunningScenario={isRunningScenario}
              isScenarioOpen={isScenarioOpen}
              scenario={lastScenario}
              scenarioError={scenarioError}
              scenarioGuidance={scenarioGuidance}
              scenarioQuestion={scenarioQuestion}
              onOpenScenario={() => setIsScenarioOpen(true)}
              onQuestionChange={handleScenarioQuestionChange}
              onRunScenario={() => void handleRunScenario()}
            />

            <section className="secondary-analysis" aria-labelledby="secondary-analysis-title">
              <div className="secondary-analysis__heading">
                <span>Optional detail</span>
                <h3 id="secondary-analysis-title">Review more before you commit</h3>
                <p>The decision above stays visible. Open only the detail you need.</p>
              </div>

              <details className="analysis-disclosure analysis-disclosure--group">
                <summary>
                  <span>Explore the numbers</span>
                  <small>Price sensitivity, plan totals, and where the money goes</small>
                </summary>
                <div className="secondary-analysis__content">
                  <PlanNumbersDetails input={input} plan={plan} />
                  <PostPlanAnalysis input={input} plan={plan} />
                </div>
              </details>

              <details className="analysis-disclosure analysis-disclosure--group">
                <summary>
                  <span>Check before you commit</span>
                  <small>Price source, weather timing, and your next steps</small>
                </summary>
                <div className="secondary-analysis__content">
                  <MarketPulsePanel crop={plan.crop} input={input} />
                  <WeatherContextPanel
                    error={weatherError}
                    isLoading={isLoadingWeather}
                    locationId={weatherLocationId}
                    response={weatherResponse}
                    onLocationChange={handleWeatherLocationChange}
                    onRefresh={() => void handleLoadWeather()}
                  />
                  <ActionPackPanel
                    gemmaError={realityCheckError}
                    gemmaPrompt={realityCheckPrompt}
                    isLoadingGemmaPrompt={isRequestingRealityCheck}
                    pack={actionPack}
                    onAskGemma={() => void handleAskRealityCheck()}
                  />
                </div>
              </details>

              <details className="analysis-disclosure analysis-disclosure--group">
                <summary>
                  <span>Compare and share</span>
                  <small>Other crops, harvest options, and an advisor-ready summary</small>
                </summary>
                <div className="secondary-analysis__content">
                  <div className="analysis-disclosure-grid">
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
                  <DecisionPackPanel
                    input={input}
                    pack={actionPack}
                    plan={plan}
                    scenario={lastScenario}
                    weatherResponse={weatherResponse}
                  />
                </div>
              </details>
            </section>
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
