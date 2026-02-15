import type { Notification } from "@/types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "status_change",
    title: "Application Accepted",
    body: "Your application for Spring Park Cleanup 2026 has been accepted!",
    read: false,
    createdAt: "2026-02-22T14:00:00Z",
    linkTo: "/applications/app-1",
  },
  {
    id: "notif-2",
    type: "completion",
    title: "Volunteer Completed",
    body: "You completed Tutoring Session for Kids. +40 points earned!",
    read: false,
    createdAt: "2026-03-01T18:30:00Z",
    linkTo: "/applications/app-3",
  },
  {
    id: "notif-3",
    type: "update",
    title: "Opportunity Updated",
    body: "Spring Park Cleanup 2026 description has been updated by the organizer.",
    read: true,
    createdAt: "2026-02-21T09:00:00Z",
    linkTo: "/opportunity/opp-1",
  },
  {
    id: "notif-4",
    type: "cancellation",
    title: "Opportunity Cancelled",
    body: "Winter Coat Drive has been cancelled by the organizer.",
    read: true,
    createdAt: "2025-11-18T12:00:00Z",
    linkTo: "/opportunity/opp-8",
  },
  {
    id: "notif-5",
    type: "penalty",
    title: "Withdrawal Penalty",
    body: "You withdrew from Winter Coat Drive. -10 season points.",
    read: true,
    createdAt: "2025-11-14T12:01:00Z",
    linkTo: "/applications/app-4",
  },
];
