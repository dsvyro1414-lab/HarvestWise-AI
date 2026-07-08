import type { RiskLevel } from "@/domain/types";

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  return <span className={`risk-badge risk-badge--${level}`}>{capitalize(level)}</span>;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
