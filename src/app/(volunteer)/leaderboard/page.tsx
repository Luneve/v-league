"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { getMyMiniGroup, getCurrentSeason, getVolunteerProfile } from "@/lib/actions";
import { mapMiniGroup, mapSeason, mapVolunteerProfile } from "@/lib/mappers";
import type { MiniGroup, Season, VolunteerProfile } from "@/types";

export default function LeaderboardPage() {
  const [group, setGroup] = useState<MiniGroup | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [vol, setVol] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [noGroup, setNoGroup] = useState(false);

  useEffect(() => {
    async function load() {
      const [groupResult, seasonResult, profileResult] = await Promise.all([
        getMyMiniGroup(),
        getCurrentSeason(),
        getVolunteerProfile(),
      ]);

      if (groupResult.data) {
        setGroup(mapMiniGroup(groupResult.data));
      } else {
        setNoGroup(true);
      }
      if (seasonResult.data) {
        setSeason(mapSeason(seasonResult.data));
      }
      if (profileResult.data) {
        setVol(mapVolunteerProfile(profileResult.data));
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (noGroup || !group) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Leaderboard</h1>
        {season && (
          <p className="text-sm text-muted mb-6">
            Season: {formatDate(season.startDate)} — {formatDate(season.endDate)}
          </p>
        )}
        <SurfaceCard padding="lg" className="text-center">
          <p className="text-sm text-muted">You are not assigned to a mini-group yet. Groups are assigned at the start of each season.</p>
        </SurfaceCard>
      </div>
    );
  }

  const leagueCfg = LEAGUE_CONFIG[group.league];
  const myRank = vol ? group.members.find((m) => m.volunteerId === vol.id) : null;
  const topCount = group.members.length >= 15 ? 5 : 3;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Leaderboard</h1>
      {season && (
        <p className="text-sm text-muted mb-6">
          Season: {formatDate(season.startDate)} — {formatDate(season.endDate)}
        </p>
      )}

      {/* My Position */}
      {myRank && (
        <SurfaceCard spotlight padding="md" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Your Position</p>
              <p className="text-3xl font-bold text-accent">#{myRank.rank}</p>
            </div>
            <div className="text-right">
              <Badge variant="default" size="md">{leagueCfg.label} League</Badge>
              <p className="text-sm text-muted mt-1">{myRank.points} points</p>
            </div>
          </div>
          {myRank.rank <= topCount && (
            <div className="mt-3 rounded-xl bg-success-light border border-success/20 p-3">
              <p className="text-xs font-medium text-success">
                You are in the promotion zone! Top {topCount} get promoted to the next league.
              </p>
            </div>
          )}
        </SurfaceCard>
      )}

      {/* Group Table */}
      <SurfaceCard padding="none" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {leagueCfg.label} League — Group
          </h2>
          <p className="text-xs text-muted">{group.members.length} members · Top {topCount} promoted</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted w-16">Rank</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted">Name</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted">Points</th>
            </tr>
          </thead>
          <tbody>
            {group.members.map((member) => {
              const isMe = vol ? member.volunteerId === vol.id : false;
              const inPromoZone = member.rank <= topCount;
              return (
                <tr
                  key={member.volunteerId}
                  className={`border-b border-border transition-colors ${
                    isMe ? "bg-accent/5" : "hover:bg-surface-2/30"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className={`text-sm font-bold ${inPromoZone ? "text-success" : "text-muted"}`}>
                      #{member.rank}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-sm ${isMe ? "font-bold text-accent" : "text-text-primary"}`}>
                      {member.name} {isMe && "(You)"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-sm font-medium text-text-primary">{member.points}</span>
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
