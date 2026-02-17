"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/supabase";

// ============ Volunteer Profile ============

export async function getVolunteerProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("volunteer_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateVolunteerProfile(
  fields: Pick<
    TablesUpdate<"volunteer_profiles">,
    "first_name" | "last_name" | "nickname" | "city" | "date_of_birth" | "bio" | "avatar_url"
  >
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("volunteer_profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

export async function getPublicVolunteerProfile(volunteerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("volunteer_profiles")
    .select("id, first_name, last_name, nickname, city, bio, league, season_points, lifetime_hours, avatar_url")
    .eq("id", volunteerId)
    .single();

  return { data, error: error?.message ?? null };
}

// ============ Organization Profile ============

export async function getOrganizationProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("organization_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { data, error: error?.message ?? null };
}

export async function updateOrganizationProfile(
  fields: Pick<
    TablesUpdate<"organization_profiles">,
    "name" | "about" | "city" | "links" | "contacts"
  >
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("organization_profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
