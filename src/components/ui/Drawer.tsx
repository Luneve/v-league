"use client";

import { useEffect, useRef, useCallback } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  width?: string;
}

function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  width = "400px",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ width }}
        className={`
          relative z-10 flex h-full flex-col
          border-border bg-surface shadow-[var(--shadow-lg)]
          ${side === "right" ? "ml-auto border-l" : "mr-auto border-r"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text-primary transition-colors focus-ring"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export { Drawer };
export type { DrawerProps };
