"use client";

import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxChars?: number;
  currentLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, maxChars, currentLength, className = "", id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            min-h-[100px] rounded-xl border px-3 py-2.5 text-sm
            bg-surface text-text-primary placeholder:text-muted
            transition-colors duration-150 resize-y
            focus-ring
            ${error ? "border-danger" : "border-border hover:border-muted"}
            ${className}
          `}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-danger">{error}</p>}
            {hint && !error && <p className="text-xs text-muted">{hint}</p>}
          </div>
          {maxChars !== undefined && (
            <p
              className={`text-xs ${
                (currentLength ?? 0) > maxChars ? "text-danger" : "text-muted"
              }`}
            >
              {currentLength ?? 0}/{maxChars}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
export type { TextareaProps };
