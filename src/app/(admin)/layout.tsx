import { createClient } from "@/lib/supabase/server";
import { mapNotification } from "@/lib/mappers";
import { AdminLayoutShell } from "./layout-client";
import type { Notification } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let notifications: Notification[] = [];
  let unreadCount = 0;

  if (user) {
    const [notifResult, unreadResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

    if (notifResult.data) {
      notifications = notifResult.data.map(mapNotification);
    }

    unreadCount = unreadResult.count ?? 0;
  }

  return (
    <AdminLayoutShell
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    >
      {children}
    </AdminLayoutShell>
  );
}
