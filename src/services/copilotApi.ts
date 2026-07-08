import type {
  FarmInterviewResult,
  FarmPlanInput,
  ScenarioParseResult,
} from "@/domain/types";

export async function requestFarmInterviewExtraction(request: {
  text: string;
  currentInput: FarmPlanInput;
}): Promise<FarmInterviewResult> {
  const response = await fetch("/api/interview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Farm interview request failed with ${response.status}`);
  }

  return response.json() as Promise<FarmInterviewResult>;
}

export async function requestScenarioParsing(request: {
  question: string;
  currentInput: FarmPlanInput;
}): Promise<ScenarioParseResult> {
  const response = await fetch("/api/scenario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Scenario request failed with ${response.status}`);
  }

  return response.json() as Promise<ScenarioParseResult>;
}
