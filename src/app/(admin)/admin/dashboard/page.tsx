"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  listOrganizations,
  listUsers,
  listOpportunities,
  getAuditLogs,
  getCurrentSeason,
} from "@/lib/actions";
import { mapOrganizationProfile, mapAuditLogEntry, mapSeason } from "@/lib/mappers";
import type { OrganizationProfile, AuditLogEntry, Season } from "@/types";

export default function AdminDashboardPage() {
  const [pendingOrgs, setPendingOrgs] = useState<OrganizationProfile[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [orgsResult, usersResult, auditResult, seasonResult, pendingResult] = await Promise.all([
        listOrganizations(),
        listUsers(),
        getAuditLogs({ pageSize: 7 }),
        getCurrentSeason(),
        listOrganizations({ verified: false }),
      ]);

      if (orgsResult.data) {
        setTotalOrgs(orgsResult.count ?? orgsResult.data.length);
      }
      if (usersResult.data) {
        setTotalUsers(usersResult.count ?? usersResult.data.length);
      }
      if (auditResult.data) {
        setAuditEntries(auditResult.data.map(mapAuditLogEntry));
      }
      if (seasonResult.data) {
        setSeason(mapSeason(seasonResult.data));
      }
      if (pendingResult.data) {
        const mapped = pendingResult.data.map(mapOrganizationProfile);
        setPendingOrgs(mapped);
        setPendingCount(mapped.length);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: totalUsers },
    { label: "Total Orgs", value: totalOrgs },
    { label: "Pending Verification", value: pendingCount },
    { label: "Active Season", value: season?.active ? `${formatDate(season.startDate)} — ${formatDate(season.endDate)}` : "None" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <SurfaceCard key={stat.label} spotlight padding="md" className="text-center">
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <SurfaceCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Pending Verifications</h2>
            <Link href="/admin/organizations" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          {pendingOrgs.length === 0 ? (
            <p className="text-sm text-muted">No pending verifications.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingOrgs.slice(0, 5).map((org) => (
                <Link key={org.id} href={`/admin/organizations/${org.id}`} className="flex items-center justify-between rounded-xl bg-surface-2 p-3 hover:bg-surface-2/80 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{org.name}</p>
                    <p className="text-xs text-muted">{org.city}</p>
                  </div>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </Link>
              ))}
            </div>
          )}
        </SurfaceCard>

        {/* Recent Audit Events */}
        <SurfaceCard padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
            <Link href="/admin/audit" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          {auditEntries.length === 0 ? (
            <p className="text-sm text-muted">No activity logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {auditEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-xl bg-surface-2 p-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{entry.actor.name}</span> — {entry.action}
                    </p>
                    <p className="text-xs text-muted">{entry.target} · {formatRelativeTime(entry.timestamp)}</p>
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
