"use client";

import { AppShell } from "@/components/layout";
import { mockCurrentOrg, mockNotifications } from "@/mocks";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { NotificationList } from "@/components/shared/NotificationList";
import { OrgUnverifiedLock } from "@/components/shared/OrgUnverifiedLock";

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <AppShell
      role="organization"
      userName={mockCurrentOrg.name}
      userInitials={mockCurrentOrg.name.charAt(0)}
      notificationCount={unreadCount}
      onNotificationClick={() => setNotifOpen(true)}
    >
      {!mockCurrentOrg.verified ? <OrgUnverifiedLock /> : children}
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
