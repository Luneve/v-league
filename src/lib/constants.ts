import type { ApplicationStatus, OpportunityStatus } from "@/types";

// Re-export the BadgeVariant from Badge component for mapping
type BadgeColor = "default" | "success" | "warning" | "danger" | "info" | "muted";

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, { variant: BadgeColor; label: string }> = {
  applied: { variant: "info", label: "Applied" },
  waitlist: { variant: "warning", label: "Waitlisted" },
  accepted: { variant: "success", label: "Accepted" },
  rejected: { variant: "danger", label: "Rejected" },
  withdrawn: { variant: "muted", label: "Withdrawn" },
  completed: { variant: "success", label: "Completed" },
  no_show: { variant: "danger", label: "No-Show" },
};

export const OPPORTUNITY_STATUS_BADGE: Record<OpportunityStatus, { variant: BadgeColor; label: string }> = {
  draft: { variant: "muted", label: "Draft" },
  open: { variant: "success", label: "Open" },
  closed: { variant: "info", label: "Closed" },
  cancelled: { variant: "danger", label: "Cancelled" },
  completed: { variant: "success", label: "Completed" },
};

export const LEAGUE_CONFIG = {
  bronze: { label: "Bronze", color: "text-amber-700", bgColor: "bg-amber-100" },
  silver: { label: "Silver", color: "text-gray-500", bgColor: "bg-gray-100" },
  gold: { label: "Gold", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  platinum: { label: "Platinum", color: "text-cyan-600", bgColor: "bg-cyan-100" },
} as const;

export const CATEGORIES = [
  "Environment",
  "Social Support",
  "Education",
  "Elderly Care",
  "Events",
  "Animal Welfare",
  "Healthcare",
  "Community",
  "Other",
];

export const CITIES = [
  "Almaty",
  "Astana",
  "Shymkent",
  "Karaganda",
  "Aktobe",
  "Taraz",
  "Pavlodar",
  "Semey",
  "Atyrau",
  "Kostanay",
];

export const AGE_RESTRICTIONS = [
  { value: "", label: "None" },
  { value: "16", label: "16+" },
  { value: "18", label: "18+" },
];
