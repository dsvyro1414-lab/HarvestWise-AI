import { buildAdvisorNotes } from "../server/gemmaAdvisor";
import { adviceRequestSchema } from "../server/validation";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

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

    const advice = await buildAdvisorNotes(parsed.data);
    return Response.json(advice);
  },
};

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
