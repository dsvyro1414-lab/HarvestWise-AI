import { extractFarmInterview } from "../server/gemmaStructured";
import { farmInterviewRequestSchema } from "../server/validation";

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await readJson(request);
    const parsed = farmInterviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid farm interview request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await extractFarmInterview(parsed.data);
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
