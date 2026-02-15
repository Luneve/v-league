"use client";

import { mockAuditLog } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

const roleBadge: Record<string, string> = {
  volunteer: "info",
  organization: "default",
  admin: "warning",
};

export default function AuditLogPage() {
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
            {mockAuditLog.map((entry) => (
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

      {mockAuditLog.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted">No activity logged yet.</p>
        </div>
      )}
    </div>
  );
}
