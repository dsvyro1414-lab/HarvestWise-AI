import type { AdvisorPayload, FarmPlanInput } from "@/domain/types";

interface AdviceRequest {
  input: FarmPlanInput;
  mode: "explain" | "whatsapp";
  question?: string;
}

export async function requestAdvisorNotes(request: AdviceRequest): Promise<AdvisorPayload> {
  const response = await fetch("/api/advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Advice request failed with ${response.status}`);
  }

  return response.json() as Promise<AdvisorPayload>;
}
