import {
  CalendarDays,
  MapPin,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { marketContext } from "@/domain/samplePlans";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true">
            <HarvestWiseMark />
          </span>
          <div className="topbar__brand-copy">
            <h1>
              <span>HarvestWise</span>
              <span className="topbar__ai"> AI</span>
            </h1>
            <p>US farm planning decisions.</p>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Workspace sections">
          <a className="topbar__nav-item topbar__nav-item--active" href="#analysis-board">
            Analysis
          </a>
          <a className="topbar__nav-item" href="#farm-inputs">
            Inputs
          </a>
          <a className="topbar__nav-item" href="#advisor-notes">
            Advisor
          </a>
        </nav>

        <div className="topbar__meta">
          <span className="meta-pill">
            <TrendingUp size={14} />
            Live USD plan
          </span>
          <span className="meta-pill">
            <MapPin size={14} />
            {marketContext.region}
          </span>
          <span className="meta-pill">
            <CalendarDays size={14} />
            2026 season
          </span>
          <button className="avatar-button" type="button" aria-label="Advisor profile">
            HW
          </button>
        </div>
      </header>

      <div className="workspace">{children}</div>
    </div>
  );
}

function HarvestWiseMark() {
  return (
    <svg className="harvestwise-mark" viewBox="0 0 120 120" focusable="false">
      <path
        d="M60 6C46.8 21.4 42.5 43.6 60 64.2C77.5 43.6 73.2 21.4 60 6Z"
        fill="#A1B978"
      />
      <path
        d="M57.4 86.8C49.2 64.4 28.9 48.5 7.4 49.4C9.8 69.6 26.6 81.3 46.5 82.8C51.4 83.2 54.7 84.6 57.4 86.8Z"
        fill="#4C6B3F"
      />
      <path
        d="M62.6 86.8C70.8 64.4 91.1 48.5 112.6 49.4C110.2 69.6 93.4 81.3 73.5 82.8C68.6 83.2 65.3 84.6 62.6 86.8Z"
        fill="#4C6B3F"
      />
      <path
        d="M55.6 112C55.6 95.8 51.4 85.8 42.8 77.8L49.3 74.6C54.8 80.8 58.4 88.8 60 98.4C61.6 88.8 65.2 80.8 70.7 74.6L77.2 77.8C68.6 85.8 64.4 95.8 64.4 112H55.6Z"
        fill="#1C2B1F"
      />
    </svg>
  );
}
