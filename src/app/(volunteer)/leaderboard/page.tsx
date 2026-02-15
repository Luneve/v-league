"use client";

import { mockMiniGroup, mockCurrentVolunteer, mockCurrentSeason } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function LeaderboardPage() {
  const leagueCfg = LEAGUE_CONFIG[mockMiniGroup.league];
  const myRank = mockMiniGroup.members.find((m) => m.volunteerId === mockCurrentVolunteer.id);
  const topCount = mockMiniGroup.members.length >= 15 ? 5 : 3;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Leaderboard</h1>
      <p className="text-sm text-muted mb-6">
        Season: {formatDate(mockCurrentSeason.startDate)} — {formatDate(mockCurrentSeason.endDate)}
      </p>

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
            {leagueCfg.label} League — Group {mockMiniGroup.id.split("-")[1]}
          </h2>
          <p className="text-xs text-muted">{mockMiniGroup.members.length} members · Top {topCount} promoted</p>
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
            {mockMiniGroup.members.map((member) => {
              const isMe = member.volunteerId === mockCurrentVolunteer.id;
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
