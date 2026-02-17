"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";
import { getPublicVolunteerProfile, getCompletedHistory } from "@/lib/actions";
import { mapVolunteerProfile, mapCompletedEntry } from "@/lib/mappers";
import type { VolunteerProfile, CompletedEntry } from "@/types";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [volunteer, setVolunteer] = useState<VolunteerProfile | null>(null);
  const [history, setHistory] = useState<CompletedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const [profileResult, historyResult] = await Promise.all([
        getPublicVolunteerProfile(id),
        getCompletedHistory(id),
      ]);

      if (profileResult.data) {
        setVolunteer(mapVolunteerProfile(profileResult.data));
      } else {
        setNotFound(true);
      }

      if (historyResult.data) {
        setHistory(historyResult.data.map(mapCompletedEntry));
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (notFound || !volunteer) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Volunteer not found</h2>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIG[volunteer.league];

  return (
    <div className="max-w-3xl">
      <SurfaceCard spotlight padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-xl font-bold">
            {getInitials(volunteer.firstName, volunteer.lastName)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {volunteer.firstName} {volunteer.lastName}
            </h1>
            {volunteer.nickname && (
              <p className="text-sm text-muted">@{volunteer.nickname}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" size="sm">{leagueConfig.label}</Badge>
              <span className="text-sm text-muted">{volunteer.city}</span>
            </div>
          </div>
        </div>

        {volunteer.bio && (
          <p className="text-sm text-muted mb-6">{volunteer.bio}</p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-xs text-muted">Season Points</p>
            <p className="text-lg font-bold text-text-primary">{volunteer.seasonPoints}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-xs text-muted">Lifetime Hours</p>
            <p className="text-lg font-bold text-text-primary">{volunteer.lifetimeHours}h</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3 text-center">
            <p className="text-xs text-muted">League</p>
            <p className="text-lg font-bold text-text-primary">{leagueConfig.label}</p>
          </div>
        </div>

        {/* Completed History */}
        <h3 className="text-base font-semibold text-text-primary mb-3">Completed History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted">No completed volunteer activities yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-surface-2 p-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{entry.opportunityTitle}</p>
                  <p className="text-xs text-muted">{entry.organizationName} · {formatDate(entry.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{entry.hours}h</p>
                  <p className="text-xs text-success">+{entry.pointsEarned} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
