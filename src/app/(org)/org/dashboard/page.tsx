"use client";

import Link from "next/link";
import { mockOpportunities, mockApplications, mockCurrentOrg } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";

const orgOpps = mockOpportunities.filter((o) => o.organizationId === mockCurrentOrg.id);
const orgApps = mockApplications.filter((a) =>
  orgOpps.some((o) => o.id === a.opportunityId)
);

const stats = [
  { label: "Total Opportunities", value: orgOpps.length },
  { label: "Open", value: orgOpps.filter((o) => o.status === "open").length },
  { label: "Total Applicants", value: orgApps.length },
  { label: "Completed", value: orgOpps.filter((o) => o.status === "completed").length },
];

const recentActivity = [
  { text: "New application from Diana Kim for Spring Park Cleanup 2026", time: "2026-02-21T14:20:00Z" },
  { text: "Alex Nazarov accepted for Spring Park Cleanup 2026", time: "2026-02-22T14:00:00Z" },
  { text: "Arman Tulegenov waitlisted for Spring Park Cleanup 2026", time: "2026-02-23T10:00:00Z" },
  { text: "Madina Omarova rejected for Spring Park Cleanup 2026", time: "2026-02-24T09:00:00Z" },
];

export default function OrgDashboardPage() {
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

      {/* Recent Activity */}
      <SurfaceCard padding="md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl bg-surface-2 p-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div className="flex-1">
                <p className="text-sm text-text-primary">{item.text}</p>
                <p className="text-xs text-muted mt-0.5">{formatRelativeTime(item.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
