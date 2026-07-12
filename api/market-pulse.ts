import { getUsdaMarketPulse } from "../server/usdaMarketPulse.js";
import { marketPulseRequestSchema } from "../server/validation.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const cropId = new URL(request.url).searchParams.get("cropId");
    const parsed = marketPulseRequestSchema.safeParse({ cropId });

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid market-pulse request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    return Response.json(await getUsdaMarketPulse(parsed.data.cropId));
  },
};
