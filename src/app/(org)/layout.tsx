import { createClient } from "@/lib/supabase/server";
import { mapOrganizationProfile, mapNotification } from "@/lib/mappers";
import { OrgLayoutShell } from "./layout-client";
import type { OrganizationProfile, Notification } from "@/types";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orgProfile: OrganizationProfile | null = null;
  let notifications: Notification[] = [];
  let unreadCount = 0;

  if (user) {
    const [profileResult, notifResult, unreadResult] = await Promise.all([
      supabase
        .from("organization_profiles")
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
      orgProfile = mapOrganizationProfile(profileResult.data);
    }

    if (notifResult.data) {
      notifications = notifResult.data.map(mapNotification);
    }

    unreadCount = unreadResult.count ?? 0;
  }

  return (
    <OrgLayoutShell
      orgProfile={orgProfile}
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    >
      {children}
    </OrgLayoutShell>
  );
}
