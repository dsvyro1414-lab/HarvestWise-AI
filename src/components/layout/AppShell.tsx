import {
  CalendarDays,
  MapPin,
  Sprout,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true">
            <Sprout size={22} strokeWidth={2.1} />
          </span>
          <div>
            <h1>HarvestWise AI</h1>
            <p>Farm profit planner</p>
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
            Live plan
          </span>
          <span className="meta-pill">
            <MapPin size={14} />
            Oyo, Nigeria
          </span>
          <span className="meta-pill">
            <CalendarDays size={14} />
            Season 2026 A
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
