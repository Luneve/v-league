"use client";

interface SkeletonProps {
  variant?: "text" | "card" | "row" | "circle" | "rect";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const variantDefaults: Record<string, { width: string; height: string; rounded: string }> = {
  text: { width: "100%", height: "16px", rounded: "rounded-md" },
  card: { width: "100%", height: "200px", rounded: "rounded-2xl" },
  row: { width: "100%", height: "48px", rounded: "rounded-xl" },
  circle: { width: "40px", height: "40px", rounded: "rounded-full" },
  rect: { width: "100%", height: "100px", rounded: "rounded-xl" },
};

function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className = "",
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-surface-2 ${defaults.rounded} ${className}`}
          style={{
            width: width || defaults.width,
            height: height || defaults.height,
          }}
        />
      ))}
    </>
  );
}

export { Skeleton };
export type { SkeletonProps };
