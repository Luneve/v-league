"use client";

interface SurfaceCardProps {
  level?: 1 | 2;
  spotlight?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

function SurfaceCard({
  level = 1,
  spotlight = false,
  hover = false,
  padding = "md",
  className = "",
  children,
  onClick,
}: SurfaceCardProps) {
  const bgClass = level === 1 ? "bg-surface" : "bg-surface-2";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        relative rounded-2xl border border-border
        ${bgClass}
        ${paddingClasses[padding]}
        shadow-[var(--shadow-md)]
        ${spotlight ? "surface-spotlight" : ""}
        ${hover ? "transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:brightness-[1.02] cursor-pointer" : ""}
        ${onClick ? "focus-ring" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export { SurfaceCard };
export type { SurfaceCardProps };
