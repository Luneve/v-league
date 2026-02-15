"use client";

import { AppShell } from "@/components/layout";
import { mockNotifications } from "@/mocks";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <AppShell
      role="volunteer"
      userName="Alex Nazarov"
      userInitials="AN"
      notificationCount={unreadCount}
      onNotificationClick={() => setNotifOpen(true)}
    >
      {children}
      <Drawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
      >
        <NotificationList notifications={mockNotifications} />
      </Drawer>
    </AppShell>
  );
}
