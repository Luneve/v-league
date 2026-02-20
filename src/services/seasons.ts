"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type League = Database["public"]["Enums"]["league"];

export async function getCurrentSeason() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();
  return { data, error: error?.message ?? null };
}

export async function listSeasons() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("start_at", { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function startSeason(durationDays: number = 90) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fn_start_season", {
    p_duration_days: durationDays,
  });
  return { data, error: error?.message ?? null };
}

export async function runSeasonRollover() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("fn_run_season_rollover");
  return { error: error?.message ?? null };
}

export async function getLeaderboard(filters: { league?: League; limit?: number } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("volunteer_profiles")
    .select("id, first_name, last_name, nickname, league, season_points, lifetime_hours")
    .order("season_points", { ascending: false })
    .order("lifetime_hours", { ascending: false })
    .limit(filters.limit ?? 50);
  if (filters.league) query = query.eq("league", filters.league);
  const { data, error } = await query;
  return { data, error: error?.message ?? null };
}
