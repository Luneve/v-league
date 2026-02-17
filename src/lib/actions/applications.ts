"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type AppStatus = Database["public"]["Enums"]["app_status"];

// ============ Volunteer Actions ============

export async function applyToOpportunity(opportunityId: string, message?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("fn_apply_to_opportunity", {
    p_opportunity_id: opportunityId,
    p_message: message ?? undefined,
  });

  return { data, error: error?.message ?? null };
}

export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_withdraw_application", {
    p_application_id: applicationId,
  });

  return { error: error?.message ?? null };
}

export async function listMyApplications(filters: {
  status?: AppStatus;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated", count: 0 };

  const { page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("applications")
    .select(
      "*, opportunities(id, title, description, category, city, start_date, end_date, start_time, end_time, planned_hours, points_reward, status, organization_id, organization_profiles(name, verified))",
      { count: "exact" }
    )
    .eq("volunteer_id", user.id)
    .order("applied_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);

  const { data, error, count } = await query;

  return { data, error: error?.message ?? null, count };
}

// ============ Org Candidate Actions ============

export async function listCandidates(
  opportunityId: string,
  status?: AppStatus
) {
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "*, volunteer_profiles(id, first_name, last_name, nickname, city, bio, league, season_points, lifetime_hours, avatar_url)"
    )
    .eq("opportunity_id", opportunityId)
    .order("applied_at", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  return { data, error: error?.message ?? null };
}

export async function acceptCandidate(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_accept_candidate", {
    p_application_id: applicationId,
  });

  return { error: error?.message ?? null };
}

export async function waitlistCandidate(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_waitlist_candidate", {
    p_application_id: applicationId,
  });

  return { error: error?.message ?? null };
}

export async function rejectCandidate(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_reject_candidate", {
    p_application_id: applicationId,
  });

  return { error: error?.message ?? null };
}

export async function promoteFromWaitlist(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_promote_from_waitlist", {
    p_application_id: applicationId,
  });

  return { error: error?.message ?? null };
}

export async function markCompletion(
  applicationId: string,
  result: "completed" | "no_show"
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("fn_mark_completion", {
    p_application_id: applicationId,
    p_result: result,
  });

  return { data, error: error?.message ?? null };
}

export async function getApplicationStatusHistory(applicationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("application_status_history")
    .select("*")
    .eq("application_id", applicationId)
    .order("changed_at", { ascending: true });

  return { data, error: error?.message ?? null };
}
