/**
 * Format time string to HH:MM (no seconds).
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a datetime string to relative time ("2 hours ago", "3 days ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Calculate days until a deadline.
 */
export function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

/**
 * Get initials from a name.
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Calculate withdrawal penalty tier based on hours until start.
 */
export function getWithdrawalPenalty(startDate: string, startTime: string): {
  penalty: number;
  tier: "none" | "low" | "high";
  message: string;
} {
  const startDateTime = new Date(`${startDate}T${startTime}`);
  const now = new Date();
  const hoursUntilStart = (startDateTime.getTime() - now.getTime()) / 3600000;

  if (hoursUntilStart <= 0) {
    return { penalty: 0, tier: "none", message: "Event has already started. You cannot withdraw." };
  }
  if (hoursUntilStart > 72) {
    return { penalty: 0, tier: "none", message: "You can withdraw without any penalty." };
  }
  if (hoursUntilStart > 24) {
    return { penalty: 10, tier: "low", message: "A penalty of 10 season points will be applied." };
  }
  return { penalty: 25, tier: "high", message: "A penalty of 25 season points will be applied. This is close to the event start." };
}
