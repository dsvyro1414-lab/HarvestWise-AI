import { cropCatalog } from "./crops";
import type {
  FarmPlanField,
  FarmPlanInput,
  FarmPlanPatch,
  NumericFarmPlanField,
  ScenarioOperation,
} from "./types";

export const farmPlanFields: FarmPlanField[] = [
  "cropId",
  "landSizeAcres",
  "availableBudget",
  "seedCostPerAcre",
  "fertilizerCostPerAcre",
  "laborCostPerAcre",
  "expectedHarvestPerAcre",
  "marketPricePerUnit",
  "transportCost",
  "storageMonths",
  "storageCostPerMonth",
  "expectedMonthlyPriceGrowth",
];

export const numericFarmPlanFields: NumericFarmPlanField[] = farmPlanFields.filter(
  (field): field is NumericFarmPlanField => field !== "cropId",
);

const fieldLabels: Record<FarmPlanField, string> = {
  cropId: "Crop",
  landSizeAcres: "Land size",
  availableBudget: "Available budget",
  seedCostPerAcre: "Seed cost",
  fertilizerCostPerAcre: "Fertilizer cost",
  laborCostPerAcre: "Labor & ops cost",
  expectedHarvestPerAcre: "Expected harvest",
  marketPricePerUnit: "Market price",
  transportCost: "Transport cost",
  storageMonths: "Storage months",
  storageCostPerMonth: "Storage cost",
  expectedMonthlyPriceGrowth: "Expected monthly price growth",
};

export function applyFarmPlanPatch(input: FarmPlanInput, patch: FarmPlanPatch): FarmPlanInput {
  const next: FarmPlanInput = { ...input };

  for (const [field, value] of Object.entries(patch) as Array<[FarmPlanField, FarmPlanPatch[FarmPlanField]]>) {
    if (value === undefined || value === null) continue;

    if (field === "cropId") {
      if (typeof value === "string" && value in cropCatalog) {
        next.cropId = value as FarmPlanInput["cropId"];
      }
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      next[field] = clampField(field, value) as never;
    }
  }

  return next;
}

export function applyScenarioOperations(
  input: FarmPlanInput,
  operations: ScenarioOperation[],
): FarmPlanPatch {
  const patch: FarmPlanPatch = {};

  for (const operation of operations) {
    const currentValue = input[operation.field];
    const value = applyOperationValue(currentValue, operation);
    patch[operation.field] = clampField(operation.field, value) as never;
  }

  return patch;
}

export function getPatchFields(patch: FarmPlanPatch): FarmPlanField[] {
  return farmPlanFields.filter((field) => patch[field] !== undefined);
}

export function getMissingCoreFields(patch: FarmPlanPatch): FarmPlanField[] {
  const core: FarmPlanField[] = [
    "cropId",
    "landSizeAcres",
    "availableBudget",
    "expectedHarvestPerAcre",
    "marketPricePerUnit",
  ];

  return core.filter((field) => patch[field] === undefined);
}

export function formatFieldLabel(field: FarmPlanField): string {
  return fieldLabels[field];
}

export function describeOperations(operations: ScenarioOperation[]): string[] {
  return operations.map((operation) => {
    const label = fieldLabels[operation.field];

    if (operation.operation === "increasePercent") return `${label} +${operation.value}%`;
    if (operation.operation === "decreasePercent") return `${label} -${operation.value}%`;
    if (operation.operation === "increaseBy") return `${label} +${operation.value}`;
    if (operation.operation === "decreaseBy") return `${label} -${operation.value}`;
    return `${label} = ${operation.value}`;
  });
}

function applyOperationValue(currentValue: number, operation: ScenarioOperation): number {
  if (operation.operation === "increasePercent") return currentValue * (1 + operation.value / 100);
  if (operation.operation === "decreasePercent") return currentValue * (1 - operation.value / 100);
  if (operation.operation === "increaseBy") return currentValue + operation.value;
  if (operation.operation === "decreaseBy") return currentValue - operation.value;
  return operation.value;
}

function clampField(field: FarmPlanField, value: number): number {
  if (field === "expectedMonthlyPriceGrowth") return clamp(value, 0, 1);
  if (field === "storageMonths") return clamp(Math.round(value), 0, 12);
  return Math.max(0, value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
