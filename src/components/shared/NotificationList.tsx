"use client";

import type { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  status_change: (
    <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  update: (
    <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  ),
  cancellation: (
    <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  completion: (
    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  penalty: (
    <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  strike: (
    <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

function NotificationList({ notifications, onMarkRead, onMarkAllRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="h-12 w-12 text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-sm text-muted">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {onMarkAllRead && (
        <button
          onClick={onMarkAllRead}
          className="self-end text-xs text-accent hover:underline mb-3"
        >
          Mark all as read
        </button>
      )}
      <div className="flex flex-col gap-1">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`
              flex items-start gap-3 rounded-xl p-3 transition-colors cursor-pointer
              hover:bg-surface-2
              ${!notif.read ? "border-l-2 border-accent bg-accent/5" : ""}
            `}
            onClick={() => {
              if (!notif.read && onMarkRead) onMarkRead(notif.id);
            }}
          >
            <div className="mt-0.5 shrink-0">
              {typeIcon[notif.type] || typeIcon.status_change}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{notif.title}</p>
              <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.body}</p>
              <p className="text-xs text-muted mt-1">{formatRelativeTime(notif.createdAt)}</p>
            </div>
            {!notif.read && (
              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { NotificationList };
