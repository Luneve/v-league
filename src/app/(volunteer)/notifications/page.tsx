"use client";

import { mockNotifications } from "@/mocks";
import { NotificationList } from "@/components/shared/NotificationList";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>
      <NotificationList notifications={mockNotifications} />
    </div>
  );
}
