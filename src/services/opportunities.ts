"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate, Database } from "@/types/supabase";

type OppStatus = Database["public"]["Enums"]["opp_status"];

const TZ = "Asia/Qyzylorda";

function computeTimestamptz(date: string, time: string): string {
  return `${date}T${time}+06:00`;
}

function computeDeadlineTimestamptz(date: string): string {
  return `${date}T23:59:59+06:00`;
}

export interface CanApplyResult {
  can_apply: boolean;
  reason: string | null;
  effective_status: string;
}

export async function canApply(opportunityId: string): Promise<CanApplyResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fn_can_apply", {
    p_opportunity_id: opportunityId,
  });
  if (error) {
    return { can_apply: false, reason: error.message, effective_status: "error" };
  }
  const r = data as unknown as CanApplyResult;
  return {
    can_apply: r?.can_apply ?? false,
    reason: r?.reason ?? null,
    effective_status: r?.effective_status ?? "unknown",
  };
}

export async function listOpportunities(filters: {
  openForApplications?: boolean;
  organizationId?: string;
  city?: string;
  category?: string;
  status?: OppStatus;
  startDateFrom?: string;
  startDateTo?: string;
  deadlineBefore?: string;
  deadlineAfter?: string;
  pointsMin?: number;
  pointsMax?: number;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const useOpenFilter = filters.openForApplications;
  const { page = 1, pageSize = useOpenFilter ? 100 : 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("opportunities_with_counts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (useOpenFilter) query = query.eq("effective_status", "open");
  else if (filters.status) query = query.eq("effective_status", filters.status);

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters.deadlineBefore) query = query.lte("apply_deadline", filters.deadlineBefore);
  if (filters.deadlineAfter) query = query.gte("apply_deadline", filters.deadlineAfter);
  if (filters.startDateFrom) query = query.gte("start_date", filters.startDateFrom);
  if (filters.startDateTo) query = query.lte("start_date", filters.startDateTo);
  if (filters.pointsMin) query = query.gte("points_reward", filters.pointsMin);
  if (filters.pointsMax) query = query.lte("points_reward", filters.pointsMax);

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message, count: 0 };
  if (!data) return { data: [], error: null, count: 0 };

  let result = data;
  if (useOpenFilter) {
    result = result.filter((o) => (o.current_applicants ?? 0) < (o.capacity ?? 0));
  }
  return { data: result, error: null, count: useOpenFilter ? result.length : (count ?? 0) };
}

export async function getOpportunity(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opportunities_with_counts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createOpportunity(
  fields: Omit<TablesInsert<"opportunities">, "id" | "organization_id" | "planned_hours" | "status" | "created_at" | "updated_at" | "start_at" | "end_at" | "apply_deadline_at">
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      ...fields,
      organization_id: user.id,
      start_at: computeTimestamptz(fields.start_date, fields.start_time),
      end_at: computeTimestamptz(fields.end_date, fields.end_time),
      apply_deadline_at: computeDeadlineTimestamptz(fields.apply_deadline),
    })
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateOpportunity(
  id: string,
  fields: Omit<TablesUpdate<"opportunities">, "id" | "organization_id" | "planned_hours" | "created_at" | "start_at" | "end_at" | "apply_deadline_at">
) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  if (fields.start_date && fields.start_time)
    payload.start_at = computeTimestamptz(fields.start_date, fields.start_time);
  if (fields.end_date && fields.end_time)
    payload.end_at = computeTimestamptz(fields.end_date, fields.end_time);
  if (fields.apply_deadline)
    payload.apply_deadline_at = computeDeadlineTimestamptz(fields.apply_deadline);

  const { data, error } = await supabase.from("opportunities").update(payload).eq("id", id).select().single();
  return { data, error: error?.message ?? null };
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function setOpportunityStatus(opportunityId: string, newStatus: OppStatus) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("fn_set_opportunity_status", {
    p_opportunity_id: opportunityId,
    p_new_status: newStatus,
  });
  return { error: error?.message ?? null };
}
