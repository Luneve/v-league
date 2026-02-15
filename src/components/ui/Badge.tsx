"use client";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-accent/10 text-accent",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
  muted: "bg-surface-2 text-muted",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

function Badge({
  variant = "default",
  size = "sm",
  children,
  icon,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
