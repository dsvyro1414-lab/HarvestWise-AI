import type { CropId, MarketPulseResponse } from "@/domain/types";

export async function requestMarketPulse(cropId: CropId): Promise<MarketPulseResponse> {
  const search = new URLSearchParams({ cropId });
  const response = await fetch(`/api/market-pulse?${search.toString()}`);

  if (!response.ok) {
    throw new Error(`Market Pulse request failed with ${response.status}`);
  }

  return response.json() as Promise<MarketPulseResponse>;
}
