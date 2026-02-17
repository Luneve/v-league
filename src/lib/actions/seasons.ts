"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

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
    .order("start_date", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getMyMiniGroup() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  // Get active season
  const { data: season } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!season) return { data: null, error: "No active season" };

  // Get the member's group assignment
  const { data: membership } = await supabase
    .from("mini_group_members")
    .select("mini_group_id")
    .eq("volunteer_id", user.id)
    .eq("season_id", season.id)
    .single();

  if (!membership) return { data: null, error: "Not assigned to a group" };

  // Get the group with all members
  const { data: group, error } = await supabase
    .from("mini_groups")
    .select("*")
    .eq("id", membership.mini_group_id)
    .single();

  if (error || !group) return { data: null, error: error?.message ?? "Group not found" };

  // Get all members with their volunteer profiles
  const { data: members } = await supabase
    .from("mini_group_members")
    .select("volunteer_id, volunteer_profiles!inner(first_name, last_name, season_points, lifetime_hours, league)")
    .eq("mini_group_id", group.id)
    .order("volunteer_profiles(season_points)", { ascending: false });

  return {
    data: {
      ...group,
      members: members ?? [],
    },
    error: null,
  };
}

export async function getLeaderboard(filters: {
  seasonId?: string;
  league?: string;
} = {}) {
  const supabase = await createClient();

  // Get the season
  let seasonId = filters.seasonId;
  if (!seasonId) {
    const { data: season } = await supabase
      .from("seasons")
      .select("id")
      .eq("is_active", true)
      .single();
    seasonId = season?.id;
  }

  if (!seasonId) return { data: null, error: "No season found" };

  let groupQuery = supabase
    .from("mini_groups")
    .select("*")
    .eq("season_id", seasonId);

  if (filters.league) groupQuery = groupQuery.eq("league", filters.league as Database["public"]["Enums"]["league"]);

  const { data: groups, error } = await groupQuery;

  return { data: groups, error: error?.message ?? null };
}
