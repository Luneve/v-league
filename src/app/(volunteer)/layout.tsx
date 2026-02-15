"use client";

import { AppShell } from "@/components/layout";
import { useState, useEffect, useCallback } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
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
import type { VolunteerProfile } from "@/types";

export default function VolunteerLayout({
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

  const vol = profile as VolunteerProfile | null;
  const userName = vol ? `${vol.firstName} ${vol.lastName}` : "";
  const userInitials = vol ? `${vol.firstName.charAt(0)}${vol.lastName.charAt(0)}` : "";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <AppShell
      role="volunteer"
      userName={userName}
      userInitials={userInitials}
      notificationCount={unreadCount}
      onNotificationClick={() => {
        setNotifOpen(true);
        fetchNotifications();
      }}
    >
      {children}
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
