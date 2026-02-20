"use server";

import { createClient } from "@/lib/supabase/server";

export async function markAllRead() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("fn_mark_all_notifications_read");
  return { error: error?.message ?? null };
}
