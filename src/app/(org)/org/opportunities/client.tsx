"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { OPPORTUNITY_STATUS_BADGE } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatTzDate } from "@/lib/utils";
import { updateOpportunityStatus, cancelOpportunity, deleteOpportunity } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";
import type { Opportunity } from "@/types";

interface OrgOpportunitiesClientProps {
  initialOpportunities: Opportunity[];
}

export function OrgOpportunitiesClient({ initialOpportunities }: OrgOpportunitiesClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    setOpportunities(initialOpportunities);
  }, [initialOpportunities]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  const actualStatus = (opp: Opportunity) => opp.actualStatus ?? opp.status;
  const tabs = useMemo(() => [
    { id: "all", label: "All", count: opportunities.length },
    { id: "draft", label: "Draft", count: opportunities.filter((o) => actualStatus(o) === "draft").length },
    { id: "open", label: "Open", count: opportunities.filter((o) => actualStatus(o) === "open").length },
    { id: "closed", label: "Closed", count: opportunities.filter((o) => actualStatus(o) === "closed").length },
    { id: "completed", label: "Completed", count: opportunities.filter((o) => actualStatus(o) === "completed").length },
    { id: "cancelled", label: "Cancelled", count: opportunities.filter((o) => actualStatus(o) === "cancelled").length },
  ], [opportunities]);

  const filtered = activeTab === "all" ? opportunities : opportunities.filter((o) => actualStatus(o) === activeTab);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setLoadingId(id);
    const { error } = await deleteOpportunity(id);
    setLoadingId(null);
    setDeleteTarget(null);
    if (error) {
      toast("error", error);
    } else {
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      toast("success", "Opportunity deleted.");
      router.refresh();
    }
  };

  const handleStatusChange = async (opp: Opportunity, newStatus: "open" | "closed" | "completed" | "cancelled") => {
    setLoadingId(opp.id);
    const { error } = newStatus === "cancelled"
      ? await cancelOpportunity(opp.id)
      : await updateOpportunityStatus(opp.id, newStatus);
    setLoadingId(null);
    if (error) {
      toast("error", error);
    } else {
      toast("success", `Status updated to ${newStatus}`);
      router.refresh();
    }
  };

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
            const status = actualStatus(opp);
            const statusCfg = OPPORTUNITY_STATUS_BADGE[status];
            const loading = loadingId === opp.id;
            return (
              <SurfaceCard key={opp.id} padding="md" hover>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary">{opp.title}</h3>
                    <p className="text-sm text-muted mt-0.5">
                      {opp.startAt ? formatTzDate(opp.startAt) : formatDate(opp.startDate)} · {opp.city} · {opp.currentApplicants}/{opp.capacity} applicants
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
                    {status === "draft" && (
                      <>
                        <Button variant="primary" size="sm" disabled={loading} onClick={() => handleStatusChange(opp, "open")}>
                          Publish
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger" disabled={loading} onClick={() => setDeleteTarget(opp)}>
                          Delete
                        </Button>
                      </>
                    )}
                    {status === "open" && (
                      <>
                        <Button variant="outline" size="sm" disabled={loading} onClick={() => handleStatusChange(opp, "closed")}>
                          Close
                        </Button>
                        <Button variant="ghost" size="sm" className="text-danger" disabled={loading} onClick={() => handleStatusChange(opp, "cancelled")}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {status === "closed" && (
                      <>
                        <Button variant="outline" size="sm" disabled={loading} onClick={() => handleStatusChange(opp, "open")}>
                          Reopen
                        </Button>
                        {(opp.acceptedCount ?? 0) > 0 ? (
                          <span title={`Mark all ${opp.acceptedCount} accepted candidate(s) as completed or no-show first`} className="inline-flex">
                            <Button variant="primary" size="sm" disabled>
                              Mark completed ({opp.acceptedCount} to go)
                            </Button>
                          </span>
                        ) : (
                          <Button variant="primary" size="sm" disabled={loading} onClick={() => handleStatusChange(opp, "completed")}>
                            Mark completed
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-danger" disabled={loading} onClick={() => handleStatusChange(opp, "cancelled")}>
                          Cancel
                        </Button>
                      </>
                    )}
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

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete draft?"
        variant="danger"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={!!loadingId} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-text-primary">
            Permanently delete &quot;{deleteTarget.title}&quot;? This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
