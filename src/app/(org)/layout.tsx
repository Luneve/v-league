"use client";

import { AppShell } from "@/components/layout";
import { useState, useEffect, useCallback } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
import { OrgUnverifiedLock } from "@/components/shared/OrgUnverifiedLock";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProfile } from "@/hooks/useProfile";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import type { Notification } from "@/types";
import type { OrganizationProfile } from "@/types";

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useProfile();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const [notifResult, countResult] = await Promise.all([
      listNotifications(),
      getUnreadCount(),
    ]);
    if (notifResult.data) {
      setNotifications(notifResult.data.map(mapNotification));
    }
    setUnreadCount(countResult.count ?? 0);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  };

  const org = profile as OrganizationProfile | null;
  const orgName = org?.name ?? "";
  const orgInitial = orgName.charAt(0) || "O";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <AppShell
      role="organization"
      userName={orgName}
      userInitials={orgInitial}
      notificationCount={unreadCount}
      onNotificationClick={() => {
        setNotifOpen(true);
        fetchNotifications();
      }}
    >
      {org && !org.verified ? <OrgUnverifiedLock /> : children}
      <Drawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
      >
        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
        />
      </Drawer>
    </AppShell>
  );
}
