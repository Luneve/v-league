"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-1 border-b border-border overflow-x-auto ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-4 py-2.5 text-sm font-medium whitespace-nowrap
              transition-colors duration-150
              focus-ring rounded-t-lg
              ${
                isActive
                  ? "text-accent"
                  : "text-muted hover:text-text-primary"
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 text-xs ${
                  isActive ? "text-accent" : "text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
