"use client";

import { memo } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface TopNavProps {
  onMenuToggle: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  userName?: string;
  userInitials?: string;
}

const TopNav = memo(function TopNav({
  onMenuToggle,
  notificationCount = 0,
  onNotificationClick,
  userName,
  userInitials = "U",
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-8">
      {/* Left: Hamburger + search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-text-primary transition-colors lg:hidden focus-ring"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Search stub */}
        <div className="hidden sm:flex items-center h-9 w-64 rounded-xl border border-border bg-bg px-3 text-sm text-muted">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search...
        </div>
      </div>

      {/* Right: Theme, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Notification bell */}
          <button
            onClick={onNotificationClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-text-primary transition-colors focus-ring"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Avatar */}
        <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white text-sm font-medium cursor-pointer" title={userName}>
          {userInitials}
        </Link>
      </div>
    </header>
  );
});

export { TopNav };
export type { TopNavProps };
