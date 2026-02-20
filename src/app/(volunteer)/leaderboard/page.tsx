import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { LEAGUE_CONFIG } from "@/lib/constants";
import { formatDate, formatTzDate } from "@/lib/utils";
import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapLeaderboardEntry, mapSeason, mapVolunteerProfile } from "@/lib/mappers";
import type { League } from "@/types";

export default async function LeaderboardPage() {
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  const [seasonResult, profileResult, leaderboardResult] = await Promise.all([
    supabase
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .single(),
    supabase
      .from("volunteer_profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("volunteer_profiles")
      .select("id, first_name, last_name, nickname, league, season_points, lifetime_hours")
      .order("season_points", { ascending: false })
      .order("lifetime_hours", { ascending: false })
      .limit(50),
  ]);

  const season = seasonResult.data ? mapSeason(seasonResult.data) : null;
  const vol = profileResult.data ? mapVolunteerProfile(profileResult.data) : null;
  const allEntries = (leaderboardResult.data ?? []).map((row, idx) => mapLeaderboardEntry(row, idx + 1));

  const myLeague: League = vol?.league ?? "bronze";
  const leagueEntries = allEntries.filter((e) => e.league === myLeague);
  const myRank = vol ? leagueEntries.find((e) => e.volunteerId === vol.id) : null;
  const leagueCfg = LEAGUE_CONFIG[myLeague];
  const promoteCount = 5;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Leaderboard</h1>
      {season && (
        <p className="text-sm text-muted mb-6">
          Season: {season.startAt ? formatTzDate(season.startAt) : formatDate(season.startDate)} — {season.endAt ? formatTzDate(season.endAt) : formatDate(season.endDate)}
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
              <Badge variant="default" size="md">
                {leagueCfg.label} League
              </Badge>
              <p className="text-sm text-muted mt-1">{myRank.seasonPoints} points</p>
            </div>
          </div>
          {myRank.rank <= promoteCount && (
            <div className="mt-3 rounded-xl bg-success-light border border-success/20 p-3">
              <p className="text-xs font-medium text-success">
                You are in the promotion zone! Top {promoteCount} get promoted to the next league.
              </p>
            </div>
          )}
        </SurfaceCard>
      )}

      {/* League Table */}
      <SurfaceCard padding="none" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            {leagueCfg.label} League
          </h2>
          <p className="text-xs text-muted">
            {leagueEntries.length} volunteers · Top {promoteCount} promoted
          </p>
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
            {leagueEntries.map((entry) => {
              const isMe = vol ? entry.volunteerId === vol.id : false;
              const inPromoZone = entry.rank <= promoteCount;
              return (
                <tr
                  key={entry.volunteerId}
                  className={`border-b border-border transition-colors ${
                    isMe ? "bg-accent/5" : "hover:bg-surface-2/30"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-sm font-bold ${inPromoZone ? "text-success" : "text-muted"}`}
                    >
                      #{entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-sm ${isMe ? "font-bold text-accent" : "text-text-primary"}`}
                    >
                      {entry.name} {isMe && "(You)"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-sm font-medium text-text-primary">
                      {entry.seasonPoints}
                    </span>
                  </td>
                </tr>
              );
            })}
            {leagueEntries.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No volunteers in this league yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
