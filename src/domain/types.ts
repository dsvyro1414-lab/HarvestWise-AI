export type CurrencyCode = "USD";

export type CropId = "corn" | "soybeans" | "wheat" | "tomato" | "dryBeans";

export type SamplePlanId = "balanced" | "risky" | "lossMaking";

export type RiskLevel = "low" | "medium" | "high";

export type DecisionId = "sell-harvest" | "store-short" | "store-long";

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

export interface MarketContext {
  region: string;
  sourceLabel: string;
  confidence: "High" | "Medium" | "Low";
  updatedDate: string;
}

export interface SamplePlan {
  id: SamplePlanId;
  name: string;
  summary: string;
  input: FarmPlanInput;
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
  bestAction: string;
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
  recommendations: string[];
  farmerMessage: string;
  provider: "gemma" | "local-fallback";
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
