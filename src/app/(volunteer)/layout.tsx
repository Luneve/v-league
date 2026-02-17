import { createClient } from "@/lib/supabase/server";
import { mapVolunteerProfile, mapNotification } from "@/lib/mappers";
import { VolunteerLayoutShell } from "./layout-client";
import type { VolunteerProfile, Notification } from "@/types";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let volProfile: VolunteerProfile | null = null;
  let notifications: Notification[] = [];
  let unreadCount = 0;

  if (user) {
    const [profileResult, notifResult, unreadResult] = await Promise.all([
      supabase
        .from("volunteer_profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
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

    if (profileResult.data) {
      volProfile = mapVolunteerProfile(profileResult.data);
    }

    if (notifResult.data) {
      notifications = notifResult.data.map(mapNotification);
    }

    unreadCount = unreadResult.count ?? 0;
  }

  return (
    <VolunteerLayoutShell
      volProfile={volProfile}
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    >
      {children}
    </VolunteerLayoutShell>
  );
}
