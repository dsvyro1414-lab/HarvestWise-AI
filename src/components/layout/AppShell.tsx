import { Calculator, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  hasPlan: boolean;
}

export function AppShell({ children, hasPlan }: AppShellProps) {
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
            <p>Plan the season. Know the next step.</p>
          </div>
        </div>

        <nav className="journey-nav" aria-label="Plan progress">
          <a href="#farm-plan"><span>1</span>Plan</a>
          <a
            aria-disabled={!hasPlan}
            className={!hasPlan ? "is-locked" : undefined}
            href={hasPlan ? "#plan-results" : "#farm-plan"}
            onClick={(event) => {
              if (!hasPlan) event.preventDefault();
            }}
          ><span>2</span>Results</a>
          <a
            aria-disabled={!hasPlan}
            className={!hasPlan ? "is-locked" : undefined}
            href={hasPlan ? "#ask-gemma" : "#farm-plan"}
            onClick={(event) => {
              if (!hasPlan) event.preventDefault();
            }}
          ><span>3</span>Ask Gemma</a>
        </nav>

        <div className="topbar__context" aria-label="Farm planning context">
          <span>
            <ShieldCheck size={14} />
            Your inputs
          </span>
          <span>
            <Calculator size={14} />
            Local calculation
          </span>
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
        fill="#67B783"
      />
      <path
        d="M57.4 86.8C49.2 64.4 28.9 48.5 7.4 49.4C9.8 69.6 26.6 81.3 46.5 82.8C51.4 83.2 54.7 84.6 57.4 86.8Z"
        fill="#0C684A"
      />
      <path
        d="M62.6 86.8C70.8 64.4 91.1 48.5 112.6 49.4C110.2 69.6 93.4 81.3 73.5 82.8C68.6 83.2 65.3 84.6 62.6 86.8Z"
        fill="#0C684A"
      />
      <path
        d="M55.6 112C55.6 95.8 51.4 85.8 42.8 77.8L49.3 74.6C54.8 80.8 58.4 88.8 60 98.4C61.6 88.8 65.2 80.8 70.7 74.6L77.2 77.8C68.6 85.8 64.4 95.8 64.4 112H55.6Z"
        fill="#15392F"
      />
    </svg>
  );
}
