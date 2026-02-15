"use client";

import { AppShell } from "@/components/layout";
import { useState, useEffect, useCallback } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import type { Notification } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <AppShell
      role="admin"
      userName="Admin"
      userInitials="A"
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
