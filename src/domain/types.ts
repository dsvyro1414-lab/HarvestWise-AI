export type CropId = "corn" | "soybeans" | "wheat";

export type RiskLevel = "low" | "medium" | "high";

export type DecisionId = "sell-harvest" | "store-short" | "store-long";

export type FarmerActionId =
  | "plant-plan"
  | "reduce-acreage"
  | "secure-buyer"
  | "do-not-plant"
  | "store-if-price";

export type FarmerActionStage = "before-planting" | "after-harvest";

export type MarketPriceSourceType = "buyer" | "co-op" | "elevator" | "other";

export type FarmPlanField =
  | "cropId"
  | "landSizeAcres"
  | "availableBudget"
  | "seedCostPerAcre"
  | "fertilizerCostPerAcre"
  | "laborCostPerAcre"
  | "landLeaseCostPerAcre"
  | "expectedHarvestPerAcre"
  | "marketPricePerUnit"
  | "transportCost"
  | "storageMonths"
  | "storageCostPerMonth"
  | "expectedMonthlyPriceGrowth";

export type NumericFarmPlanField = Exclude<FarmPlanField, "cropId">;

export type FarmPlanPatch = Partial<Pick<FarmPlanInput, FarmPlanField>>;

export type ScenarioOperationKind =
  | "set"
  | "increasePercent"
  | "decreasePercent"
  | "increaseBy"
  | "decreaseBy";

export interface ScenarioOperation {
  field: NumericFarmPlanField;
  operation: ScenarioOperationKind;
  value: number;
}

export interface CropDefaults {
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  laborCostPerAcre: number;
  landLeaseCostPerAcre: number;
  expectedHarvestPerAcre: number;
  marketPricePerUnit: number;
  transportCost: number;
}

export interface CropDefinition {
  id: CropId;
  name: string;
  unit: string;
  unitPlural: string;
  cycleMonths: number;
  volatility: number;
  storageLossRatePerMonth: number;
  storageSuitability: number;
  color: string;
  defaults: CropDefaults;
}

export interface FarmPlanInput {
  cropId: CropId;
  landSizeAcres: number;
  availableBudget: number;
  seedCostPerAcre: number;
  fertilizerCostPerAcre: number;
  laborCostPerAcre: number;
  landLeaseCostPerAcre: number;
  expectedHarvestPerAcre: number;
  marketPricePerUnit: number;
  transportCost: number;
  storageMonths: number;
  storageCostPerMonth: number;
  expectedMonthlyPriceGrowth: number;
  priceEvidence?: MarketPriceEvidence;
}

/**
 * Farmer-recorded context for the market price used in the deterministic plan.
 * It is evidence only: none of these fields alters the finance calculation.
 */
export interface MarketPriceEvidence {
  sourceType: MarketPriceSourceType | "";
  sourceName: string;
  location: string;
  checkedAt: string;
}

export interface PriceSensitivityPoint {
  price: number;
  profit: number;
}

export interface FarmerAction {
  id: FarmerActionId;
  title: string;
  stage: FarmerActionStage;
  reasons: string[];
  priceThreshold?: number;
}

export interface FarmPlanResult {
  crop: CropDefinition;
  totalSeasonCost: number;
  inputCost: number;
  expectedHarvest: number;
  grossRevenue: number;
  expectedProfit: number;
  breakEvenPrice: number;
  roi: number;
  profitMargin: number;
  budgetGap: number;
  riskLevel: RiskLevel;
  riskScore: number;
  action: FarmerAction;
  sensitivity: PriceSensitivityPoint[];
}

export interface CropComparison {
  crop: CropDefinition;
  expectedProfit: number;
  breakEvenPrice: number;
  totalSeasonCost: number;
  cashReturnMonths: number;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface MarketDecision {
  id: DecisionId;
  label: string;
  months: number;
  estimatedPrice: number;
  expectedProfit: number;
  netRevenue: number;
  harvestAfterLoss: number;
  riskLevel: RiskLevel;
  recommendation: string;
}

export interface AdvisorPayload {
  summary: string;
  insights: string[];
  whatsappMessage: string;
  provider: "gemma" | "local-fallback";
}

export interface AdvisorConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AdvisorChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  insights?: string[];
  provider?: AdvisorPayload["provider"];
}

export interface FarmInterviewResult {
  patch: FarmPlanPatch;
  confidence: number;
  extractedFields: FarmPlanField[];
  missingFields: FarmPlanField[];
  notes: string[];
  provider: "gemma" | "local-fallback";
}

export interface ScenarioParseResult {
  operations: ScenarioOperation[];
  patch: FarmPlanPatch;
  changedFields: NumericFarmPlanField[];
  explanation: string;
  provider: "gemma" | "local-fallback";
}

export type MarketPulseFreshness = "fresh" | "aging" | "stale";

export interface MarketPulseSource {
  name: string;
  reportName: string;
  reportUrl: string;
  location: string;
}

export interface MarketPulseObservation extends MarketPulseSource {
  cropId: CropId;
  commodity: string;
  grade: string;
  contract: string;
  unit: string;
  price: number;
  observedAt: string;
  fetchedAt: string;
  freshness: MarketPulseFreshness;
  limitation: string;
}

export type MarketPulseResponse =
  | {
      status: "available";
      observation: MarketPulseObservation;
    }
  | {
      status: "unavailable";
      reason: "not-configured" | "no-comparable-observation" | "upstream-error";
      message: string;
      source: MarketPulseSource;
    };

export type WeatherLocationId = "central-illinois" | "central-iowa" | "central-indiana";

export interface WeatherLocation {
  id: WeatherLocationId;
  label: string;
  latitude: number;
  longitude: number;
}

export type WeatherFreshness = "fresh" | "aging" | "stale";

export interface WeatherForecast {
  periodName: string;
  startTime: string;
  endTime: string;
  updatedAt: string;
  temperature: number;
  temperatureUnit: "F" | "C";
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  probabilityOfPrecipitation: number | null;
  freshness: WeatherFreshness;
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: string;
  urgency: string;
  headline: string;
  effectiveAt: string;
  expiresAt: string;
  sourceUrl: string;
}

export type WeatherAlerts =
  | {
      status: "available";
      checkedAt: string;
      items: WeatherAlert[];
    }
  | {
      status: "unavailable";
      message: string;
    };

export interface WeatherContext {
  sourceName: string;
  forecastUrl: string;
  alertsUrl: string;
  location: WeatherLocation;
  forecast: WeatherForecast;
  alerts: WeatherAlerts;
  timingPrompt: string;
  fetchedAt: string;
}

export type WeatherResponse =
  | {
      status: "available";
      context: WeatherContext;
    }
  | {
      status: "unavailable";
      reason: "no-forecast" | "upstream-error";
      message: string;
      location: WeatherLocation;
    };
