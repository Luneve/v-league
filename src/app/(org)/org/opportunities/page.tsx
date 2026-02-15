"use client";

import { useState } from "react";
import Link from "next/link";
import { mockOpportunities, mockCurrentOrg } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { OPPORTUNITY_STATUS_BADGE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const orgOpps = mockOpportunities.filter((o) => o.organizationId === mockCurrentOrg.id);

const tabs = [
  { id: "all", label: "All", count: orgOpps.length },
  { id: "draft", label: "Draft", count: orgOpps.filter((o) => o.status === "draft").length },
  { id: "open", label: "Open", count: orgOpps.filter((o) => o.status === "open").length },
  { id: "closed", label: "Closed", count: orgOpps.filter((o) => o.status === "closed").length },
  { id: "completed", label: "Completed", count: orgOpps.filter((o) => o.status === "completed").length },
  { id: "cancelled", label: "Cancelled", count: orgOpps.filter((o) => o.status === "cancelled").length },
];

export default function OrgOpportunitiesPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? orgOpps
      : orgOpps.filter((o) => o.status === activeTab);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">My Opportunities</h1>
        <Link href="/org/opportunities/new">
          <Button variant="primary">Create New</Button>
        </Link>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
          title="No opportunities yet"
          description="You haven't created any opportunities yet. Start by creating your first one."
          action={{ label: "Create Opportunity", onClick: () => window.location.href = "/org/opportunities/new" }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((opp) => {
            const statusCfg = OPPORTUNITY_STATUS_BADGE[opp.status];
            return (
              <SurfaceCard key={opp.id} padding="md" hover>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary">
                      {opp.title}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {formatDate(opp.startDate)} · {opp.city} · {opp.currentApplicants}/{opp.capacity} applicants
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
                    <Link href={`/org/opportunities/${opp.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                    <Link href={`/org/opportunities/${opp.id}/candidates`}>
                      <Button variant="outline" size="sm">Candidates</Button>
                    </Link>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
