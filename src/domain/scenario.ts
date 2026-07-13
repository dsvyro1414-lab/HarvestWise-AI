import { calculateFarmPlan } from "./finance.js";
import {
  applyFarmPlanPatch,
  applyScenarioOperations,
  describeOperations,
} from "./patches.js";
import type {
  FarmPlanInput,
  FarmPlanResult,
  ScenarioParseResult,
} from "./types.js";

export interface PlanScenario {
  explanation: string;
  changedFields: string[];
  beforeInput: FarmPlanInput;
  afterInput: FarmPlanInput;
  beforePlan: FarmPlanResult;
  afterPlan: FarmPlanResult;
  provider: "gemma" | "local-fallback";
}

export type ScenarioComparisonResult =
  | { status: "success"; scenario: PlanScenario }
  | { status: "invalid"; message: string };

/**
 * Builds a what-if against the canonical plan without mutating it. The client
 * intentionally derives the patch from typed operations again, so model text
 * and server-provided finance can never become calculation inputs.
 */
export function buildScenarioComparison(
  baselineInput: FarmPlanInput,
  response: ScenarioParseResult,
): ScenarioComparisonResult {
  if (response.operations.length === 0) {
    return {
      status: "invalid",
      message: response.explanation || "No clear scenario change was detected. Try a specific value or percentage.",
    };
  }

  const patch = applyScenarioOperations(baselineInput, response.operations);
  const afterInput = applyFarmPlanPatch(baselineInput, patch);
  const changedOperations = response.operations.filter((operation) => {
    return afterInput[operation.field] !== baselineInput[operation.field];
  });

  if (changedOperations.length === 0) {
    return {
      status: "invalid",
      message: "That change leaves the current plan unchanged. Try a different value or percentage.",
    };
  }

  return {
    status: "success",
    scenario: {
      explanation: response.explanation,
      changedFields: describeOperations(changedOperations),
      beforeInput: baselineInput,
      afterInput,
      beforePlan: calculateFarmPlan(baselineInput),
      afterPlan: calculateFarmPlan(afterInput),
      provider: response.provider,
    },
  };
}
