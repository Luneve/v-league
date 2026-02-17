"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
import { ProfileProvider } from "@/components/providers/ProfileProvider";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import type { Notification, VolunteerProfile } from "@/types";

interface VolunteerLayoutShellProps {
  children: React.ReactNode;
  volProfile: VolunteerProfile | null;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export function VolunteerLayoutShell({
  children,
  volProfile,
  initialNotifications,
  initialUnreadCount,
}: VolunteerLayoutShellProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const fetchNotifications = useCallback(async () => {
    const notifResult = await listNotifications({ includeUnreadCount: true });
    if (notifResult.data) {
      setNotifications(notifResult.data.map(mapNotification));
    }
    setUnreadCount(notifResult.unreadCount ?? 0);
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  }, []);

  const handleNotifClick = useCallback(() => {
    setNotifOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotifClose = useCallback(() => setNotifOpen(false), []);

  const userName = volProfile
    ? `${volProfile.firstName} ${volProfile.lastName}`
    : "";
  const userInitials = volProfile
    ? `${volProfile.firstName.charAt(0)}${volProfile.lastName.charAt(0)}`
    : "";

  return (
    <ProfileProvider profile={volProfile} role="volunteer">
      <AppShell
        role="volunteer"
        userName={userName}
        userInitials={userInitials}
        notificationCount={unreadCount}
        onNotificationClick={handleNotifClick}
      >
        {children}
        <Drawer
          open={notifOpen}
          onClose={handleNotifClose}
          title="Notifications"
        >
          <NotificationList
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        </Drawer>
      </AppShell>
    </ProfileProvider>
  );
}
