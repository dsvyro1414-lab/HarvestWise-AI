export type CurrencyCode = "NGN";

export type CropId = "maize" | "cassava" | "rice" | "tomato" | "beans";

export type RiskLevel = "low" | "medium" | "high";

export type DecisionId = "sell-harvest" | "store-short" | "store-long";

export type FarmerActionId =
  | "plant-plan"
  | "reduce-acreage"
  | "secure-buyer"
  | "do-not-plant"
  | "store-if-price";

export type FarmerActionStage = "before-planting" | "after-harvest";

export type FarmPlanField =
  | "cropId"
  | "landSizeAcres"
  | "availableBudget"
  | "seedCostPerAcre"
  | "fertilizerCostPerAcre"
  | "laborCostPerAcre"
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
  expectedHarvestPerAcre: number;
  marketPricePerUnit: number;
  transportCost: number;
  storageMonths: number;
  storageCostPerMonth: number;
  expectedMonthlyPriceGrowth: number;
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
