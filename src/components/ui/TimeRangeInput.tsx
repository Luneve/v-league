"use client";

interface TimeRangeInputProps {
  label?: string;
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
  error?: string;
  className?: string;
}

function computeDuration(start: string, end: string): string {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (endMin <= startMin) return "Invalid range";
  const diff = endMin - startMin;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
}

function isOver12Hours(start: string, end: string): boolean {
  if (!start || !end) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 720; // 12 * 60
}

function TimeRangeInput({
  label,
  startTime = "",
  endTime = "",
  onStartTimeChange,
  onEndTimeChange,
  error,
  className = "",
}: TimeRangeInputProps) {
  const duration = computeDuration(startTime, endTime);
  const over12 = isOver12Hours(startTime, endTime);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange?.(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
        />
        <span className="text-sm text-muted">to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange?.(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text-primary focus-ring"
        />
        {duration && (
          <span
            className={`text-sm whitespace-nowrap ${
              over12 ? "text-danger font-medium" : "text-muted"
            }`}
          >
            {duration}
          </span>
        )}
      </div>
      {over12 && !error && (
        <p className="text-xs text-danger">
          Maximum 12 hours per day exceeded. Please adjust time range.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export { TimeRangeInput };
export type { TimeRangeInputProps };
