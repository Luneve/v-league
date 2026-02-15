"use client";

interface DateRangePickerProps {
  label?: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  error?: string;
  className?: string;
}

function DateRangePicker({
  label,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  error,
  className = "",
}: DateRangePickerProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange?.(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
        />
        <span className="text-sm text-muted">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange?.(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export { DateRangePicker };
export type { DateRangePickerProps };
