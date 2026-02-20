"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, formatDate, formatTzDate } from "@/lib/utils";
import type { OrganizationProfile, AuditLogEntry, Season } from "@/types";

interface AdminDashboardClientProps {
  totalOrgs: number;
  totalUsers: number;
  auditEntries: AuditLogEntry[];
  season: Season | null;
  pendingOrgs: OrganizationProfile[];
}

export function AdminDashboardClient({
  totalOrgs,
  totalUsers,
  auditEntries,
  season,
  pendingOrgs,
}: AdminDashboardClientProps) {
  const stats = useMemo(
    () => [
      { label: "Total Users", value: totalUsers },
      { label: "Total Orgs", value: totalOrgs },
      { label: "Pending Verification", value: pendingOrgs.length },
      {
        label: "Active Season",
        value: season?.active
          ? `${season.startAt ? formatTzDate(season.startAt) : formatDate(season.startDate)} — ${season.endAt ? formatTzDate(season.endAt) : formatDate(season.endDate)}`
          : "None",
      },
    ],
    [totalUsers, totalOrgs, pendingOrgs.length, season]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <SurfaceCard
            key={stat.label}
            spotlight
            padding="md"
            className="text-center"
          >
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <SurfaceCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Pending Verifications
            </h2>
            <Link
              href="/admin/organizations"
              className="text-sm text-accent hover:underline"
            >
              View All
            </Link>
          </div>
          {pendingOrgs.length === 0 ? (
            <p className="text-sm text-muted">No pending verifications.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingOrgs.slice(0, 5).map((org) => (
                <Link
                  key={org.id}
                  href={`/admin/organizations/${org.id}`}
                  className="flex items-center justify-between rounded-xl bg-surface-2 p-3 hover:bg-surface-2/80 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {org.name}
                    </p>
                    <p className="text-xs text-muted">{org.city}</p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </SurfaceCard>

        {/* Recent Audit Events */}
        <SurfaceCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Recent Activity
            </h2>
            <Link
              href="/admin/audit"
              className="text-sm text-accent hover:underline"
            >
              View All
            </Link>
          </div>
          {auditEntries.length === 0 ? (
            <p className="text-sm text-muted">No activity logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl bg-surface-2 p-3"
                >
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{entry.actor.name}</span> —{" "}
                      {entry.action}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.target} · {formatRelativeTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
