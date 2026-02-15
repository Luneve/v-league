"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type SeasonDuration = Database["public"]["Enums"]["season_duration"];

// ============ Org Verification ============

export async function verifyOrganization(orgId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_verify_organization", {
    p_org_id: orgId,
  });

  return { error: error?.message ?? null };
}

export async function unverifyOrganization(orgId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_profiles")
    .update({ verified: false, verified_at: null, verified_by: null, updated_at: new Date().toISOString() })
    .eq("id", orgId);

  return { error: error?.message ?? null };
}

// ============ Organization Management ============

export async function listOrganizations(filters: {
  verified?: boolean;
  city?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const { page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("organization_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.verified !== undefined) query = query.eq("verified", filters.verified);
  if (filters.city) query = query.eq("city", filters.city);

  const { data, error, count } = await query;

  return { data, error: error?.message ?? null, count };
}

// ============ User Management ============

export async function listUsers(filters: {
  role?: Database["public"]["Enums"]["app_role"];
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const { page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.role) query = query.eq("role", filters.role);

  const { data, error, count } = await query;

  return { data, error: error?.message ?? null, count };
}

// ============ Seasons ============

export async function createSeason(startDate: string, durationDays: SeasonDuration = "90") {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("fn_create_season", {
    p_start_date: startDate,
    p_duration_days: durationDays,
  });

  return { data, error: error?.message ?? null };
}

export async function triggerSeasonRollover() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_run_season_rollover");

  return { error: error?.message ?? null };
}

// ============ Audit Logs ============

export async function getAuditLogs(filters: {
  action?: string;
  targetType?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const { page = 1, pageSize = 50 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.action) query = query.eq("action", filters.action);
  if (filters.targetType) query = query.eq("target_type", filters.targetType);
  if (filters.actorId) query = query.eq("actor_id", filters.actorId);

  const { data, error, count } = await query;

  return { data, error: error?.message ?? null, count };
}

// ============ Config ============

export async function updateConfig(key: string, value: Record<string, unknown>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("config")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  return { error: error?.message ?? null };
}

export async function getConfig(key: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("key", key)
    .single();

  return { data, error: error?.message ?? null };
}

export async function getAllConfig() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("config")
    .select("*")
    .order("key");

  return { data, error: error?.message ?? null };
}
