import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapVolunteerProfile, mapNotification } from "@/lib/mappers";
import { VolunteerLayoutShell } from "./layout-client";
import { perfRoute, perfStart, perfEnd, perfSummary } from "@/lib/perf/timing";
import type { VolunteerProfile, Notification } from "@/types";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  perfRoute("/volunteer/layout");
  perfStart("auth");
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);
  perfEnd("auth");

  let volProfile: VolunteerProfile | null = null;
  let notifications: Notification[] = [];
  let unreadCount = 0;

  if (user) {
    perfStart("layout-queries");
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
    perfEnd("layout-queries");

    if (profileResult.data) {
      volProfile = mapVolunteerProfile(profileResult.data);
    }

    if (notifResult.data) {
      notifications = notifResult.data.map(mapNotification);
    }

    unreadCount = unreadResult.count ?? 0;
  }

  perfSummary();

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
