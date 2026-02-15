"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { listUsers } from "@/lib/actions";

interface VolunteerRow {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  league: string;
  season_points: number;
  lifetime_hours: number;
  strikes: number;
}

export default function UsersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // listUsers returns profiles table; we need volunteer_profiles
      // For now, use the profiles endpoint and get volunteer-specific data
      const { data } = await listUsers({ role: "volunteer" });
      // The listUsers returns from profiles table which doesn't have volunteer fields
      // We'll need to fetch from volunteer_profiles directly via a workaround
      // For simplicity, import the supabase client approach
      setLoading(false);
    }
    load();
  }, []);

  // Since listUsers returns profiles (id, role, created_at), 
  // and we need volunteer_profiles fields, let's fetch them directly
  useEffect(() => {
    async function loadVolunteers() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("volunteer_profiles")
        .select("id, first_name, last_name, city, league, season_points, lifetime_hours, strikes")
        .order("season_points", { ascending: false });

      if (data) {
        setVolunteers(data as VolunteerRow[]);
      }
      setLoading(false);
    }
    loadVolunteers();
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
            {volunteers.map((vol) => {
              const leagueCfg = LEAGUE_CONFIG[vol.league as keyof typeof LEAGUE_CONFIG];
              return (
                <tr key={vol.id} className="border-b border-border hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {vol.first_name} {vol.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted">{vol.city}</td>
                  <td className="px-4 py-3">
                    {leagueCfg ? (
                      <Badge variant="default" size="sm">{leagueCfg.label}</Badge>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{vol.season_points}</td>
                  <td className="px-4 py-3 text-muted">{Number(vol.lifetime_hours)}h</td>
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
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">No volunteers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
