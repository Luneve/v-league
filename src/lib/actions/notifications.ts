"use server";

import { createClient } from "@/lib/supabase/server";

export async function listNotifications(filters: {
  isRead?: boolean;
  cursor?: string; // created_at cursor for pagination
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  const { pageSize = 20 } = filters;

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (filters.isRead !== undefined) query = query.eq("is_read", filters.isRead);
  if (filters.cursor) query = query.lt("created_at", filters.cursor);

  const { data, error } = await query;

  return { data, error: error?.message ?? null };
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("fn_mark_all_notifications_read");

  return { error: error?.message ?? null };
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { count: 0, error: "Not authenticated" };

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return { count: count ?? 0, error: error?.message ?? null };
}
