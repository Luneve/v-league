import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { APPLICATION_STATUS_BADGE } from "@/lib/constants";
import { formatDate, formatTime, formatTzDate, formatTzTime, formatRelativeTime } from "@/lib/utils";
import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapApplication } from "@/lib/mappers";
import type { ApplicationStatus } from "@/types";

const statusBannerColors: Record<string, string> = {
  applied: "bg-info-light border-info/20 text-info",
  waitlist: "bg-warning-light border-warning/20 text-warning",
  accepted: "bg-success-light border-success/20 text-success",
  rejected: "bg-danger-light border-danger/20 text-danger",
  withdrawn: "bg-surface-2 border-border text-muted",
  completed: "bg-success-light border-success/20 text-success",
  no_show: "bg-danger-light border-danger/20 text-danger",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  // Fetch specific application + status history in parallel (no more fetching ALL applications)
  const [appResult, historyResult] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "*, opportunities(id, title, description, category, city, start_date, end_date, start_time, end_time, start_at, end_at, apply_deadline_at, planned_hours, points_reward, status, organization_id, organization_profiles(name, verified))"
      )
      .eq("id", id)
      .eq("volunteer_id", user.id)
      .single(),
    supabase
      .from("application_status_history")
      .select("*")
      .eq("application_id", id)
      .order("changed_at", { ascending: true }),
  ]);

  if (!appResult.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Application not found</h2>
          <Link href="/applications">
            <Button variant="outline">Back to Applications</Button>
          </Link>
        </div>
      </div>
    );
  }

  const application = mapApplication(appResult.data);

  if (historyResult.data) {
    application.statusHistory = historyResult.data.map((h: any) => ({
      status: h.status as ApplicationStatus,
      at: h.changed_at,
    }));
  }

  const statusCfg = APPLICATION_STATUS_BADGE[application.status];
  const opp = application.opportunity;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/applications" className="hover:text-accent">Applications</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{opp.title}</span>
      </nav>

      {/* Status banner */}
      <div className={`mb-6 rounded-xl border p-4 ${statusBannerColors[application.status] || "bg-surface-2 border-border text-text-primary"}`}>
        <p className="text-sm font-medium">
          Your application is <span className="font-bold">{statusCfg.label}</span>
        </p>
      </div>

      {/* Penalty banner for no_show */}
      {application.status === "no_show" && (
        <div className="mb-6 rounded-xl bg-danger-light border border-danger/20 p-4">
          <p className="text-sm font-medium text-danger">
            You were marked as a no-show.{application.penaltyApplied ? ` A penalty of ${application.penaltyApplied} points was applied.` : ""}
          </p>
        </div>
      )}

      {/* Points earned for completed */}
      {application.status === "completed" && application.pointsEarned && (
        <div className="mb-6 rounded-xl bg-success-light border border-success/20 p-4">
          <p className="text-sm font-medium text-success">
            Completed! You earned {application.pointsEarned} points and {opp.plannedHours} hours.
          </p>
        </div>
      )}

      {/* Opportunity summary */}
      <SurfaceCard padding="md" className="mb-6">
        <Link href={`/opportunity/${opp.id}`} className="block hover:opacity-80">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" size="sm">{opp.category}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">{opp.title}</h2>
          <p className="text-sm text-muted mt-1">{opp.organizationName} · {opp.city}</p>
          <p className="text-xs text-muted mt-1">
            {opp.startAt ? formatTzDate(opp.startAt) : formatDate(opp.startDate)} · {opp.startAt && opp.endAt ? `${formatTzTime(opp.startAt)}–${formatTzTime(opp.endAt)}` : `${formatTime(opp.startTime)}–${formatTime(opp.endTime)}`} · {opp.pointsReward} pts
          </p>
        </Link>
      </SurfaceCard>

      {/* Message */}
      {application.message && (
        <SurfaceCard padding="md" className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Your message</h3>
          <p className="text-sm text-muted">{application.message}</p>
        </SurfaceCard>
      )}

      {/* Status timeline */}
      <SurfaceCard padding="md">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Status Timeline</h3>
        {application.statusHistory.length === 0 ? (
          <p className="text-sm text-muted">No status changes recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {application.statusHistory.map((entry, idx) => {
              const entryCfg = APPLICATION_STATUS_BADGE[entry.status];
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${
                      entry.status === "completed" || entry.status === "accepted" ? "bg-success" :
                      entry.status === "rejected" || entry.status === "no_show" ? "bg-danger" :
                      entry.status === "waitlist" ? "bg-warning" :
                      "bg-accent"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{entryCfg.label}</p>
                    <p className="text-xs text-muted">{formatRelativeTime(entry.at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
