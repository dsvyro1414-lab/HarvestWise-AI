import { parseScenarioQuestion } from "../server/gemmaStructured";
import { scenarioRequestSchema } from "../server/validation";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

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

    const result = await parseScenarioQuestion(parsed.data);
    return Response.json(result);
  },
};

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
