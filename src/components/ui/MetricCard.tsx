import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper: string;
  tone?: "green" | "blue" | "amber" | "neutral";
}

export function MetricCard({ label, value, helper, tone = "neutral" }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__helper">{helper}</span>
    </div>
  );
}
