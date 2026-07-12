import { getNwsWeatherContext } from "../server/nwsWeather.js";
import { weatherContextRequestSchema } from "../server/validation.js";

export default {
  async fetch(request: Request) {
    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const locationId = new URL(request.url).searchParams.get("locationId");
    const parsed = weatherContextRequestSchema.safeParse({ locationId });

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid weather request",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    return Response.json(await getNwsWeatherContext(parsed.data.locationId));
  },
};
