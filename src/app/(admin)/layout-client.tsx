"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import type { Notification } from "@/types";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export function AdminLayoutShell({
  children,
  initialNotifications,
  initialUnreadCount,
}: AdminLayoutShellProps) {
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

  return (
    <AppShell
      role="admin"
      userName="Admin"
      userInitials="A"
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
  );
}
