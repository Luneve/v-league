"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { getAuditLogs } from "@/lib/actions";
import { mapAuditLogEntry } from "@/lib/mappers";
import type { AuditLogEntry } from "@/types";

const roleBadge: Record<string, string> = {
  volunteer: "info",
  organization: "default",
  admin: "warning",
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getAuditLogs({ pageSize: 50 });
      if (data) {
        setEntries(data.map(mapAuditLogEntry));
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Audit Log</h1>

      <SurfaceCard padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left font-medium text-muted">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Action</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Target</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Details</th>
              <th className="px-4 py-3 text-right font-medium text-muted">Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border hover:bg-surface-2/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{entry.actor.name}</span>
                    <Badge variant={roleBadge[entry.actor.role] as any || "muted"} size="sm">{entry.actor.role}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-primary font-mono text-xs">{entry.action}</td>
                <td className="px-4 py-3 text-muted">{entry.target}</td>
                <td className="px-4 py-3 text-muted text-xs">{entry.details || "—"}</td>
                <td className="px-4 py-3 text-right text-muted text-xs">{formatRelativeTime(entry.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceCard>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted">No activity logged yet.</p>
        </div>
      )}
    </div>
  );
}
