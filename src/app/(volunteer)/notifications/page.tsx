"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationList } from "@/components/shared/NotificationList";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions";
import { mapNotification } from "@/lib/mappers";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const { data } = await listNotifications({ pageSize: 50 });
    if (data) {
      setNotifications(data.map(mapNotification));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>
      <NotificationList
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
