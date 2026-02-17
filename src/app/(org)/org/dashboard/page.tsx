import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapOpportunity, mapNotification } from "@/lib/mappers";
import { perfRoute, perfStart, perfEnd, perfSummary } from "@/lib/perf/timing";

export default async function OrgDashboardPage() {
  perfRoute("/org/dashboard");
  perfStart("auth");
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);
  perfEnd("auth");

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  perfStart("db-queries");
  const [oppResult, notifResult] = await Promise.all([
    supabase
      .from("opportunities_with_counts")
      .select("*")
      .eq("organization_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  perfEnd("db-queries");

  perfStart("transform");
  const mappedOpportunities = (oppResult.data ?? []).map(mapOpportunity);
  const recentNotifs = notifResult.data ? notifResult.data.map(mapNotification) : [];

  const stats = [
    { label: "Total Opportunities", value: mappedOpportunities.length },
    { label: "Open", value: mappedOpportunities.filter((o) => o.status === "open").length },
    { label: "Total Applicants", value: mappedOpportunities.reduce((acc, o) => acc + o.currentApplicants, 0) },
    { label: "Completed", value: mappedOpportunities.filter((o) => o.status === "completed").length },
  ];
  perfEnd("transform");

  perfSummary();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <Link href="/org/opportunities/new">
          <Button variant="primary">Create New Opportunity</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <SurfaceCard key={stat.label} spotlight padding="md" className="text-center">
            <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </SurfaceCard>
        ))}
      </div>

      {/* Recent Activity (from notifications) */}
      <SurfaceCard padding="md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
        {recentNotifs.length === 0 ? (
          <p className="text-sm text-muted">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentNotifs.map((notif) => (
              <div key={notif.id} className="flex items-start gap-3 rounded-xl bg-surface-2 p-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{notif.title}: {notif.body}</p>
                  <p className="text-xs text-muted mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
