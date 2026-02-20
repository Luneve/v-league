// ===== Roles =====
export type Role = "volunteer" | "organization" | "admin";

// ===== Statuses =====
export type OpportunityStatus =
  | "draft"
  | "open"
  | "closed"
  | "cancelled"
  | "completed";

export type ApplicationStatus =
  | "applied"
  | "waitlist"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed"
  | "no_show";

export type League = "bronze" | "silver" | "gold" | "platinum";

// ===== Profiles =====
export interface VolunteerProfile {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  city: string;
  dateOfBirth: string;
  bio?: string;
  league: League;
  seasonPoints: number;
  lifetimeHours: number;
  avatarUrl?: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  about?: string;
  city: string;
  verified: boolean;
  links: {
    instagram?: string;
    website?: string;
    tiktok?: string;
    other?: string;
  };
  contacts: { telegram?: string; phone?: string };
}

// ===== Opportunities =====
export interface Opportunity {
  id: string;
  organizationId: string;
  organizationName: string;
  orgVerified: boolean;
  title: string;
  description: string;
  category: string;
  city: string;
  applyDeadline: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  startAt: string;
  endAt: string;
  applyDeadlineAt: string;
  plannedHours: number;
  capacity: number;
  currentApplicants: number;
  /** Count of applications with status=accepted (unmarked). Must be 0 to complete opportunity. */
  acceptedCount?: number;
  ageRestriction?: number;
  contacts: { telegram?: string; phone?: string };
  pointsReward: number;
  status: OpportunityStatus;
  /** Actual DB status; use for org status transitions. When absent, use status. */
  actualStatus?: OpportunityStatus;
}

// ===== Applications =====
export interface Application {
  id: string;
  volunteerId: string;
  opportunityId: string;
  opportunity: Opportunity;
  volunteerName?: string;
  volunteerCity?: string;
  volunteerLeague?: League;
  volunteerBio?: string;
  message?: string;
  status: ApplicationStatus;
  appliedAt: string;
  statusHistory: { status: ApplicationStatus; at: string }[];
  pointsEarned?: number;
  penaltyApplied?: number;
}

// ===== Notifications =====
export type NotificationType =
  | "status_change"
  | "update"
  | "cancellation"
  | "completion"
  | "penalty";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

// ===== Audit =====
export interface AuditLogEntry {
  id: string;
  actor: { id: string; role: Role; name: string };
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}

// ===== Seasons & Leagues =====
export interface Season {
  id: string;
  startDate: string;
  endDate: string;
  startAt: string;
  endAt: string;
  durationDays: 30 | 60 | 90 | 120;
  active: boolean;
}

// ===== Leaderboard Entry =====
export interface LeaderboardEntry {
  volunteerId: string;
  name: string;
  league: League;
  seasonPoints: number;
  lifetimeHours: number;
  rank: number;
}

// ===== Completed History Entry =====
export interface CompletedEntry {
  id: string;
  opportunityTitle: string;
  organizationName: string;
  date: string;
  hours: number;
  pointsEarned: number;
  pdfUrl?: string;
}

// ===== Filter Config (for FilterBar) =====
export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "date-range" | "text" | "number-range";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

// ===== Navigation =====
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
