import {
  BarChart3,
  CalendarDays,
  Home,
  LogOut,
  MapPin,
  MessageSquareText,
  Settings,
  ShoppingCart,
  Sprout,
} from "lucide-react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Farm Plan", icon: Sprout },
  { label: "Compare Crops", icon: BarChart3 },
  { label: "Market Decision", icon: ShoppingCart },
  { label: "Advisor Notes", icon: MessageSquareText },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar__brand" aria-label="HarvestWise AI">
          <Sprout size={26} strokeWidth={2.2} />
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item, index) => (
            <button
              className={`sidebar__item ${index === 0 ? "sidebar__item--active" : ""}`}
              key={item.label}
              type="button"
              title={item.label}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__item" type="button" title="Settings">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="sidebar__item" type="button" title="Logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar__title">
            <Sprout className="topbar__logo" size={31} strokeWidth={2.4} />
            <div>
              <h1>HarvestWise AI</h1>
              <p>Can this farm season make money?</p>
            </div>
          </div>

          <div className="topbar__meta">
            <button className="meta-button" type="button">
              <MapPin size={16} />
              Oyo, Nigeria
            </button>
            <button className="meta-button" type="button">
              <CalendarDays size={16} />
              Season 2026 A
            </button>
            <button className="avatar-button" type="button" aria-label="Advisor profile">
              HW
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
