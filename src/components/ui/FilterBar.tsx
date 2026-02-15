"use client";

import { useCallback } from "react";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "text" | "number" | "range";
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** For range type: the two keys to store min/max values */
  rangeKeys?: [string, string];
  /** For range type */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
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
        if (filter.type === "range" && filter.rangeKeys) {
          const [minKey, maxKey] = filter.rangeKeys;
          const rangeMin = filter.min ?? 0;
          const rangeMax = filter.max ?? 100;
          const step = filter.step ?? 1;
          const currentMin = values[minKey] ? Number(values[minKey]) : rangeMin;
          const currentMax = values[maxKey] ? Number(values[maxKey]) : rangeMax;
          const unit = filter.unit ?? "";

          return (
            <div key={filter.key} className="min-w-[200px]">
              <RangeSlider
                label={filter.label}
                min={rangeMin}
                max={rangeMax}
                step={step}
                valueMin={currentMin}
                valueMax={currentMax}
                unit={unit}
                onChangeMin={(v) => onChange(minKey, v === rangeMin ? "" : String(v))}
                onChangeMax={(v) => onChange(maxKey, v === rangeMax ? "" : String(v))}
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

/* ===== Dual-thumb Range Slider ===== */

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  unit?: string;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

function RangeSlider({
  label,
  min,
  max,
  step,
  valueMin,
  valueMax,
  unit = "",
  onChangeMin,
  onChangeMax,
}: RangeSliderProps) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), valueMax - step);
      onChangeMin(v);
    },
    [valueMax, step, onChangeMin]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), valueMin + step);
      onChangeMax(v);
    },
    [valueMin, step, onChangeMax]
  );

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <div className="flex items-center justify-between text-xs text-text-primary font-medium mb-2">
        <span>{valueMin}{unit}</span>
        <span>{valueMax >= max ? `${max}+` : `${valueMax}${unit}`}</span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-surface-2" />
        {/* Active track */}
        <div
          className="absolute h-1.5 rounded-full bg-accent"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMinChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMaxChange}
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps, FilterConfig };
