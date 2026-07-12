import type { WeatherLocationId, WeatherResponse } from "@/domain/types";

export async function requestWeatherContext(locationId: WeatherLocationId): Promise<WeatherResponse> {
  const search = new URLSearchParams({ locationId });
  const response = await fetch(`/api/weather?${search.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }

  return response.json() as Promise<WeatherResponse>;
}
