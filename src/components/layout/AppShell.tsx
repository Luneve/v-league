"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import type { Role } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  role: Role;
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

function AppShell({
  children,
  role,
  userName,
  userInitials,
  notificationCount = 0,
  onNotificationClick,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar role={role} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCloseSidebar}
          />
          <div className="relative z-10">
            <Sidebar role={role} onClose={handleCloseSidebar} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          onMenuToggle={handleOpenSidebar}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          userName={userName}
          userInitials={userInitials}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export { AppShell };
export type { AppShellProps };
