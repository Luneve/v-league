"use client";

import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "text" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  className = "",
}: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v !== "");

  return (
    <div
      className={`flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] ${className}`}
    >
      {filters.map((filter) => {
        if (filter.type === "select" && filter.options) {
          return (
            <div key={filter.key} className="min-w-[140px]">
              <Select
                label={filter.label}
                options={filter.options}
                value={values[filter.key] || ""}
                onChange={(val) => onChange(filter.key, val)}
                placeholder={filter.placeholder || `All ${filter.label}`}
              />
            </div>
          );
        }
        if (filter.type === "date") {
          return (
            <div key={filter.key} className="min-w-[140px]">
              <Input
                label={filter.label}
                type="date"
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
              />
            </div>
          );
        }
        if (filter.type === "number") {
          return (
            <div key={filter.key} className="min-w-[100px]">
              <Input
                label={filter.label}
                type="number"
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                placeholder={filter.placeholder}
              />
            </div>
          );
        }
        return (
          <div key={filter.key} className="min-w-[140px]">
            <Input
              label={filter.label}
              type="text"
              value={values[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
            />
          </div>
        );
      })}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps, FilterConfig };
