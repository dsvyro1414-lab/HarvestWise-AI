import type { WeatherLocation, WeatherLocationId } from "./types.js";

export const weatherLocations: WeatherLocation[] = [
  {
    id: "central-illinois",
    label: "Central Illinois — Champaign, IL",
    latitude: 40.1164,
    longitude: -88.2434,
  },
  {
    id: "central-iowa",
    label: "Central Iowa — Des Moines, IA",
    latitude: 41.5868,
    longitude: -93.625,
  },
  {
    id: "central-indiana",
    label: "Central Indiana — Indianapolis, IN",
    latitude: 39.7684,
    longitude: -86.1581,
  },
];

export function getWeatherLocation(id: WeatherLocationId): WeatherLocation {
  const location = weatherLocations.find((candidate) => candidate.id === id);
  if (!location) throw new Error(`Unsupported weather location: ${id}`);
  return location;
}

export function getPublicForecastUrl(location: WeatherLocation): string {
  return `https://forecast.weather.gov/MapClick.php?lat=${location.latitude}&lon=${location.longitude}`;
}

export function getActiveAlertsUrl(location: WeatherLocation): string {
  return `https://api.weather.gov/alerts/active?point=${location.latitude},${location.longitude}`;
}
