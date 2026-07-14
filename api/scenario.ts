import { parseScenarioQuestion } from "../server/gemmaStructured.js";
import { scenarioRequestSchema } from "../server/validation.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const startedAt = Date.now();
    const requestId = request.headers.get("x-vercel-id") ?? "local";
    const body = await readJson(request);
    const parsed = scenarioRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid scenario request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    console.log(JSON.stringify({
      level: "info",
      message: "scenario_request_started",
      route: "/api/scenario",
      requestId,
      questionLength: parsed.data.question.length,
    }));

    try {
      const result = await parseScenarioQuestion(parsed.data);
      console.log(JSON.stringify({
        level: "info",
        message: "scenario_request_completed",
        route: "/api/scenario",
        requestId,
        provider: result.provider,
        operationCount: result.operations.length,
        guidanceKind: result.guidance?.kind,
        durationMs: Date.now() - startedAt,
      }));
      return Response.json(result);
    } catch (error) {
      console.error(JSON.stringify({
        level: "error",
        message: "scenario_request_failed",
        route: "/api/scenario",
        requestId,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      }));
      return Response.json({ error: "Scenario request failed" }, { status: 500 });
    }
  },
};

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
