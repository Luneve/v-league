"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate, Database } from "@/types/supabase";

type OppStatus = Database["public"]["Enums"]["opp_status"];

interface OpportunityFilters {
  city?: string;
  category?: string;
  deadlineBefore?: string;
  deadlineAfter?: string;
  startDateFrom?: string;
  startDateTo?: string;
  organizationId?: string;
  pointsMin?: number;
  pointsMax?: number;
  status?: OppStatus;
  /** When true, only returns opportunities where applications are open (deadline not passed, spots left) */
  openForApplications?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listOpportunities(filters: OpportunityFilters = {}) {
  const supabase = await createClient();
  const useOpenFilter = filters.openForApplications;
  const { page = 1, pageSize = useOpenFilter ? 100 : 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (useOpenFilter) {
    filters.status = "open";
    filters.deadlineAfter = filters.deadlineAfter ?? new Date().toISOString().slice(0, 10);
  }

  let query = supabase
    .from("opportunities")
    .select("*, organization_profiles(name, verified)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.city) query = query.eq("city", filters.city);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.deadlineBefore) query = query.lte("apply_deadline", filters.deadlineBefore);
  if (filters.deadlineAfter) query = query.gte("apply_deadline", filters.deadlineAfter);
  if (filters.startDateFrom) query = query.gte("start_date", filters.startDateFrom);
  if (filters.startDateTo) query = query.lte("start_date", filters.startDateTo);
  if (filters.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters.pointsMin) query = query.gte("points_reward", filters.pointsMin);
  if (filters.pointsMax) query = query.lte("points_reward", filters.pointsMax);

  const { data: opportunities, error, count } = await query;

  if (error) return { data: null, error: error.message, count };
  if (!opportunities) return { data: [], error: null, count: 0 };

  // Fetch application counts for all opportunities
  const opportunityIds = opportunities.map(o => o.id);
  
  if (opportunityIds.length > 0) {
    const { data: appCounts } = await supabase
      .from("applications")
      .select("opportunity_id")
      .in("opportunity_id", opportunityIds)
      .not("status", "in", '("rejected","withdrawn")');

    // Count applications per opportunity
    const countMap: Record<string, number> = {};
    if (appCounts) {
      for (const app of appCounts) {
        countMap[app.opportunity_id] = (countMap[app.opportunity_id] || 0) + 1;
      }
    }

    // Add current_applicants to each opportunity
    let enrichedData = opportunities.map(opp => ({
      ...opp,
      current_applicants: countMap[opp.id] || 0,
    }));

    if (useOpenFilter) {
      enrichedData = enrichedData.filter(o => (o.current_applicants ?? 0) < o.capacity);
    }

    return { data: enrichedData, error: null, count: useOpenFilter ? enrichedData.length : count };
  }

  let result = opportunities.map(o => ({ ...o, current_applicants: 0 }));
  if (useOpenFilter) {
    result = result.filter(o => 0 < o.capacity);
  }
  return { data: result, error: null, count: useOpenFilter ? result.length : count };
}

export async function getOpportunity(id: string) {
  const supabase = await createClient();

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*, organization_profiles(name, verified)")
    .eq("id", id)
    .single();

  if (error) return { data: null, error: error.message };

  // Count active applicants
  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("opportunity_id", id)
    .not("status", "in", '("rejected","withdrawn")');

  return {
    data: { ...opportunity, current_applicants: count ?? 0 },
    error: null,
  };
}

export async function createOpportunity(
  fields: Omit<TablesInsert<"opportunities">, "id" | "organization_id" | "planned_hours" | "status" | "created_at" | "updated_at">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("opportunities")
    .insert({ ...fields, organization_id: user.id })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateOpportunity(
  id: string,
  fields: Omit<TablesUpdate<"opportunities">, "id" | "organization_id" | "planned_hours" | "created_at">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function updateOpportunityStatus(id: string, newStatus: OppStatus) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_update_opportunity_status", {
    p_opportunity_id: id,
    p_new_status: newStatus,
  });

  return { error: error?.message ?? null };
}

export async function cancelOpportunity(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_cancel_opportunity", {
    p_opportunity_id: id,
  });

  return { error: error?.message ?? null };
}
