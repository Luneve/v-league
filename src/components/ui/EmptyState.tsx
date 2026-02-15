"use client";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="max-w-sm text-sm text-muted mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover transition-colors focus-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
