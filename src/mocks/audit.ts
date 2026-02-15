import type { AuditLogEntry } from "@/types";

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: "audit-1",
    actor: { id: "org-1", role: "organization", name: "Green Almaty" },
    action: "opportunity.created",
    target: "Spring Park Cleanup 2026",
    details: "Status: draft",
    timestamp: "2026-02-15T10:00:00Z",
  },
  {
    id: "audit-2",
    actor: { id: "org-1", role: "organization", name: "Green Almaty" },
    action: "opportunity.published",
    target: "Spring Park Cleanup 2026",
    details: "Status: draft → open",
    timestamp: "2026-02-16T08:30:00Z",
  },
  {
    id: "audit-3",
    actor: { id: "vol-1", role: "volunteer", name: "Alex Nazarov" },
    action: "application.submitted",
    target: "Spring Park Cleanup 2026",
    timestamp: "2026-02-20T10:30:00Z",
  },
  {
    id: "audit-4",
    actor: { id: "org-1", role: "organization", name: "Green Almaty" },
    action: "application.accepted",
    target: "Alex Nazarov → Spring Park Cleanup",
    timestamp: "2026-02-22T14:00:00Z",
  },
  {
    id: "audit-5",
    actor: { id: "admin-1", role: "admin", name: "Admin" },
    action: "organization.verified",
    target: "Green Almaty",
    timestamp: "2026-01-10T09:00:00Z",
  },
  {
    id: "audit-6",
    actor: { id: "org-2", role: "organization", name: "Helping Hands KZ" },
    action: "completion.marked",
    target: "Timur Zhakanov → Tutoring Session",
    details: "Result: completed, +40 points",
    timestamp: "2026-03-01T18:30:00Z",
  },
  {
    id: "audit-7",
    actor: { id: "org-2", role: "organization", name: "Helping Hands KZ" },
    action: "completion.no_show",
    target: "Assel Bekmuratova → Tutoring Session",
    details: "Penalty: -30 points, +1 strike",
    timestamp: "2026-03-01T20:00:00Z",
  },
];
