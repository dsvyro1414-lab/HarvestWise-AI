import { buildAdvisorNotes } from "../server/gemmaAdvisor.js";
import { adviceRequestSchema } from "../server/validation.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const startedAt = Date.now();
    const requestId = request.headers.get("x-vercel-id") ?? "local";
    const body = await readJson(request);
    const parsed = adviceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid advice request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    console.log(JSON.stringify({
      level: "info",
      message: "advice_request_started",
      route: "/api/advice",
      requestId,
      mode: parsed.data.mode,
      questionLength: parsed.data.question?.length ?? 0,
    }));

    try {
      const advice = await buildAdvisorNotes(parsed.data);
      console.log(JSON.stringify({
        level: "info",
        message: "advice_request_completed",
        route: "/api/advice",
        requestId,
        provider: advice.provider,
        durationMs: Date.now() - startedAt,
      }));
      return Response.json(advice);
    } catch (error) {
      console.error(JSON.stringify({
        level: "error",
        message: "advice_request_failed",
        route: "/api/advice",
        requestId,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      }));
      return Response.json({ error: "Advice request failed" }, { status: 500 });
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
