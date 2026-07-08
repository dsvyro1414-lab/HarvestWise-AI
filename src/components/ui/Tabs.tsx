import type { ReactNode } from "react";

interface TabItem<TValue extends string> {
  label: string;
  value: TValue;
  icon?: ReactNode;
}

interface TabsProps<TValue extends string> {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export function Tabs<TValue extends string>({ items, value, onChange }: TabsProps<TValue>) {
  return (
    <div className="tabs" role="tablist" aria-label="HarvestWise AI sections">
      {items.map((item) => (
        <button
          aria-selected={value === item.value}
          className="tabs__item"
          key={item.value}
          role="tab"
          type="button"
          onClick={() => onChange(item.value)}
        >
          {item.icon ? <span className="tabs__icon">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}
