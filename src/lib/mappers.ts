import type {
  VolunteerProfile,
  OrganizationProfile,
  Opportunity,
  Application,
  Notification,
  AuditLogEntry,
  Season,
  MiniGroup,
  CompletedEntry,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ===== Volunteer Profile =====
export function mapVolunteerProfile(row: any): VolunteerProfile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname ?? undefined,
    city: row.city,
    dateOfBirth: row.date_of_birth,
    bio: row.bio ?? undefined,
    league: row.league,
    seasonPoints: row.season_points ?? 0,
    lifetimeHours: Number(row.lifetime_hours ?? 0),
    strikes: row.strikes ?? 0,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

// ===== Organization Profile =====
export function mapOrganizationProfile(row: any): OrganizationProfile {
  return {
    id: row.id,
    name: row.name,
    about: row.about ?? undefined,
    city: row.city,
    verified: row.verified ?? false,
    links: row.links ?? {},
    contacts: row.contacts ?? {},
  };
}

// ===== Opportunity =====
export function mapOpportunity(row: any): Opportunity {
  if (!row) {
    throw new Error("Cannot map null or undefined opportunity row");
  }
  
  // Handle both direct organization_profiles and nested structure
  const orgProfiles = row.organization_profiles;
  
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: orgProfiles?.name ?? "Unknown Organization",
    orgVerified: orgProfiles?.verified ?? false,
    title: row.title,
    description: row.description,
    category: row.category,
    city: row.city,
    applyDeadline: row.apply_deadline,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    plannedHours: Number(row.planned_hours ?? 0),
    capacity: row.capacity,
    currentApplicants: row.current_applicants ?? 0,
    ageRestriction: row.age_restriction ?? undefined,
    contacts: row.contacts ?? {},
    pointsReward: row.points_reward,
    status: row.status,
  };
}

// ===== Application =====
export function mapApplication(row: any): Application {
  if (!row) {
    throw new Error("Cannot map null or undefined application row");
  }
  
  const opp = row.opportunities;
  const oppOrgProfiles = opp?.organization_profiles;
  
  return {
    id: row.id,
    volunteerId: row.volunteer_id,
    opportunityId: row.opportunity_id,
    opportunity: opp
      ? {
          id: opp.id,
          organizationId: opp.organization_id,
          organizationName: oppOrgProfiles?.name ?? "Unknown Organization",
          orgVerified: oppOrgProfiles?.verified ?? false,
          title: opp.title,
          description: opp.description ?? "",
          category: opp.category,
          city: opp.city,
          applyDeadline: opp.apply_deadline ?? "",
          startDate: opp.start_date,
          endDate: opp.end_date,
          startTime: opp.start_time,
          endTime: opp.end_time,
          plannedHours: Number(opp.planned_hours ?? 0),
          capacity: opp.capacity ?? 0,
          currentApplicants: 0,
          ageRestriction: opp.age_restriction ?? undefined,
          contacts: opp.contacts ?? {},
          pointsReward: opp.points_reward,
          status: opp.status,
        }
      : ({} as Opportunity),
    volunteerName: row.volunteer_profiles
      ? `${row.volunteer_profiles.first_name} ${row.volunteer_profiles.last_name}`
      : undefined,
    volunteerCity: row.volunteer_profiles?.city ?? undefined,
    volunteerLeague: row.volunteer_profiles?.league ?? undefined,
    volunteerBio: row.volunteer_profiles?.bio ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    appliedAt: row.applied_at,
    statusHistory: [],
    pointsEarned: row.points_earned ?? undefined,
    penaltyApplied: row.penalty_applied ?? undefined,
  };
}

// ===== Application (from candidate query with volunteer_profiles) =====
export function mapCandidate(row: any): Application {
  return {
    id: row.id,
    volunteerId: row.volunteer_id,
    opportunityId: row.opportunity_id,
    opportunity: {} as Opportunity,
    volunteerName: row.volunteer_profiles
      ? `${row.volunteer_profiles.first_name} ${row.volunteer_profiles.last_name}`
      : undefined,
    volunteerCity: row.volunteer_profiles?.city ?? undefined,
    volunteerLeague: row.volunteer_profiles?.league ?? undefined,
    volunteerBio: row.volunteer_profiles?.bio ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    appliedAt: row.applied_at,
    statusHistory: [],
    pointsEarned: undefined,
    penaltyApplied: undefined,
  };
}

// ===== Notification =====
export function mapNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.is_read ?? false,
    createdAt: row.created_at,
    linkTo: row.link_to ?? undefined,
  };
}

// ===== Audit Log Entry =====
export function mapAuditLogEntry(row: any): AuditLogEntry {
  return {
    id: row.id,
    actor: {
      id: row.actor_id,
      role: row.actor_role,
      name: row.actor_name ?? row.actor_id,
    },
    action: row.action,
    target: `${row.target_type}:${row.target_id}`,
    details: row.details ? JSON.stringify(row.details) : undefined,
    timestamp: row.created_at,
  };
}

// ===== Season =====
export function mapSeason(row: any): Season {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    durationDays: Number(row.duration_days) as 30 | 60 | 90 | 120,
    active: row.is_active ?? false,
  };
}

// ===== Mini Group =====
export function mapMiniGroup(row: any): MiniGroup {
  const members = (row.members ?? []).map((m: any, index: number) => ({
    volunteerId: m.volunteer_id,
    name: m.volunteer_profiles
      ? (m.volunteer_profiles.nickname || `${m.volunteer_profiles.first_name} ${m.volunteer_profiles.last_name}`)
      : "Unknown",
    points: m.volunteer_profiles?.season_points ?? 0,
    rank: index + 1,
  }));

  return {
    id: row.id,
    league: row.league,
    seasonId: row.season_id,
    members,
  };
}

// ===== Completed Entry =====
export function mapCompletedEntry(row: any): CompletedEntry {
  return {
    id: row.id,
    opportunityTitle: row.opportunities?.title ?? "",
    organizationName: row.opportunities?.organization_profiles?.name ?? "",
    date: row.opportunities?.start_date ?? row.created_at,
    hours: Number(row.hours_awarded ?? 0),
    pointsEarned: row.points_awarded ?? 0,
    pdfUrl: row.pdf_url ?? undefined,
  };
}
