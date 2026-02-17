"use client";

import { useState, useCallback } from "react";
import { NotificationList } from "@/components/shared/NotificationList";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import type { Notification } from "@/types";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const handleMarkRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationRead(id);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Notifications
      </h1>
      <NotificationList
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
