import { buildRealityCheckQuestion } from "../../server/gemmaRealityCheck.js";
import { realityCheckRequestSchema } from "../../server/validation.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await readJson(request);
    const parsed = realityCheckRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid reality-check request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    return Response.json(await buildRealityCheckQuestion(parsed.data));
  },
};

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
