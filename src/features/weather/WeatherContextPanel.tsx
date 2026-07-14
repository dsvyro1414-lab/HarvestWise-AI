import { AlertTriangle, CloudSun, MapPin, RefreshCw, Wind } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { weatherLocations } from "@/domain/weather";
import type { WeatherContext, WeatherLocationId, WeatherResponse } from "@/domain/types";

interface WeatherContextPanelProps {
  error: string | null;
  isLoading: boolean;
  locationId: WeatherLocationId | "";
  response: WeatherResponse | null;
  onLocationChange: (locationId: WeatherLocationId | "") => void;
  onRefresh: () => void;
}

export function WeatherContextPanel({
  error,
  isLoading,
  locationId,
  response,
  onLocationChange,
  onRefresh,
}: WeatherContextPanelProps) {
  const context = response?.status === "available" ? response.context : null;
  const unavailable = response?.status === "unavailable" ? response : null;

  return (
    <section className="weather-context" aria-labelledby="weather-context-title">
      <header className="weather-context__heading">
        <div>
          <span>Check the timing</span>
          <h3 id="weather-context-title">Weather timing check</h3>
        </div>
        <p>Weather helps you verify timing. It never changes your financial plan or next action.</p>
      </header>

      <div className="weather-context__controls">
        <label>
          <span>Farm area</span>
          <select
            aria-label="Farm area for NWS weather"
            value={locationId}
            onChange={(event) => onLocationChange(event.target.value as WeatherLocationId | "")}
          >
            <option value="">Choose a Midwest location</option>
            {weatherLocations.map((location) => <option key={location.id} value={location.id}>{location.label}</option>)}
          </select>
        </label>
        <Button
          disabled={!locationId || isLoading}
          icon={<RefreshCw aria-hidden="true" size={16} />}
          variant="secondary"
          onClick={onRefresh}
        >
          {isLoading ? "Checking the forecast…" : context ? "Refresh weather" : "Check weather timing"}
        </Button>
      </div>

      {context ? <WeatherObservation context={context} /> : (
        <WeatherEmptyState locationId={locationId} message={unavailable?.message} />
      )}
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
    </section>
  );
}

function WeatherObservation({ context }: { context: WeatherContext }) {
  const { alerts, forecast, location } = context;

  return (
    <div className="weather-context__observation">
      <div className="weather-context__forecast">
        <CloudSun aria-hidden="true" size={24} />
        <div>
          <span>{forecast.periodName}</span>
          <strong>{forecast.temperature}°{forecast.temperatureUnit}</strong>
          <p>{forecast.shortForecast}</p>
        </div>
        <span className={`weather-context__freshness weather-context__freshness--${forecast.freshness}`}>
          {forecast.freshness}
        </span>
      </div>

      <dl className="weather-context__details">
        <div><dt>Location</dt><dd><MapPin aria-hidden="true" size={13} />{location.label}</dd></div>
        <div><dt>Forecast updated</dt><dd>{formatDateTime(forecast.updatedAt)}</dd></div>
        <div><dt>Wind</dt><dd><Wind aria-hidden="true" size={13} />{formatWind(forecast.windSpeed, forecast.windDirection)}</dd></div>
        <div><dt>Precipitation</dt><dd>{forecast.probabilityOfPrecipitation === null ? "Not reported" : `${forecast.probabilityOfPrecipitation}% chance`}</dd></div>
      </dl>

      <div className="weather-context__prompt">
        <span>Timing prompt</span>
        <p>{context.timingPrompt}</p>
      </div>

      <WeatherAlerts context={context} />

      <p className="weather-context__source">
        Source: <a href={context.forecastUrl} rel="noreferrer" target="_blank">{context.sourceName} forecast</a>
        <span> · checked {formatDateTime(context.fetchedAt)}</span>
      </p>
    </div>
  );
}

function WeatherAlerts({ context }: { context: WeatherContext }) {
  const { alerts } = context;

  if (alerts.status === "unavailable") {
    return <p className="weather-context__alerts-status"><AlertTriangle aria-hidden="true" size={15} />{alerts.message}</p>;
  }

  if (alerts.items.length === 0) {
    return <p className="weather-context__alerts-status">No active NWS alerts for this selected point as of {formatDateTime(alerts.checkedAt)}.</p>;
  }

  return (
    <section className="weather-alerts" aria-labelledby="weather-alerts-title">
      <div className="weather-alerts__heading">
        <AlertTriangle aria-hidden="true" size={16} />
        <h4 id="weather-alerts-title">Active NWS alert{alerts.items.length > 1 ? "s" : ""}</h4>
      </div>
      <ul>
        {alerts.items.map((alert) => (
          <li key={alert.id}>
            <div>
              <strong>{alert.event}</strong>
              <span>{alert.severity} · {alert.urgency}</span>
            </div>
            <p>{alert.headline}</p>
            <a href={alert.sourceUrl} rel="noreferrer" target="_blank">Effective {formatDateTime(alert.effectiveAt)} · expires {formatDateTime(alert.expiresAt)}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WeatherEmptyState({ locationId, message }: { locationId: WeatherLocationId | ""; message?: string }) {
  return (
    <div className="weather-context__empty">
      <CloudSun aria-hidden="true" size={20} />
      <div>
        <strong>{message ? "Weather observation unavailable" : locationId ? "Ready to check this area" : "Choose the farm area first"}</strong>
        <p>{message ?? (locationId ? "Check NWS when you want to verify a forecast and active alerts for this location." : "HarvestWise will not infer a location. Select a Midwest area before checking NWS.")}</p>
      </div>
    </div>
  );
}

function formatWind(speed: string, direction: string): string {
  return direction === "N/A" || direction === "Not reported" ? speed : `${speed} ${direction}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not reported";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
