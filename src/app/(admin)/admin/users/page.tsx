"use client";

import { mockVolunteers } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { LEAGUE_CONFIG } from "@/lib/constants";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Users & Strikes</h1>

      <SurfaceCard padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted">City</th>
              <th className="px-4 py-3 text-left font-medium text-muted">League</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Season Points</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Lifetime Hours</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Strikes</th>
            </tr>
          </thead>
          <tbody>
            {mockVolunteers.map((vol) => {
              const leagueCfg = LEAGUE_CONFIG[vol.league];
              return (
                <tr key={vol.id} className="border-b border-border hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {vol.firstName} {vol.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted">{vol.city}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default" size="sm">{leagueCfg.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-text-primary">{vol.seasonPoints}</td>
                  <td className="px-4 py-3 text-muted">{vol.lifetimeHours}h</td>
                  <td className="px-4 py-3">
                    {vol.strikes > 0 ? (
                      <Badge variant="danger" size="sm">{vol.strikes} strike{vol.strikes > 1 ? "s" : ""}</Badge>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
