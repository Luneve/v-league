"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { APPLICATION_STATUS_BADGE, LEAGUE_CONFIG } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import {
  acceptCandidate,
  waitlistCandidate,
  rejectCandidate,
  markCompletion,
  getCompletedHistory,
} from "@/lib/actions";
import { mapCompletedEntry } from "@/lib/mappers";
import type { Opportunity, Application, CompletedEntry } from "@/types";

interface CandidatesClientProps {
  initialOpportunity: Opportunity;
  initialCandidates: Application[];
}

export function CandidatesClient({
  initialOpportunity,
  initialCandidates,
}: CandidatesClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [opportunity] = useState(initialOpportunity);
  const [candidates, setCandidates] = useState(initialCandidates);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [noShowModal, setNoShowModal] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [drawerHistory, setDrawerHistory] = useState<CompletedEntry[]>([]);

  const stats = {
    total: candidates.length,
    accepted: candidates.filter((a) => a.status === "accepted" || a.status === "completed").length,
    waitlisted: candidates.filter((a) => a.status === "waitlist").length,
    rejected: candidates.filter((a) => a.status === "rejected").length,
  };

  const eventPassed = new Date(`${opportunity.endDate}T${opportunity.endTime}`) < new Date();

  const handleAction = async (app: Application, action: string) => {
    setActionLoading(true);
    let error: string | null = null;

    if (action === "accept") {
      ({ error } = await acceptCandidate(app.id));
    } else if (action === "waitlist") {
      ({ error } = await waitlistCandidate(app.id));
    } else if (action === "reject") {
      ({ error } = await rejectCandidate(app.id));
    } else if (action === "complete") {
      ({ error } = await markCompletion(app.id, "completed"));
    }

    setActionLoading(false);

    if (error) {
      toast("error", error);
    } else {
      const actionLabels: Record<string, string> = {
        accept: "Candidate accepted.",
        waitlist: "Candidate waitlisted.",
        reject: "Candidate rejected.",
        complete: `${app.volunteerName || "Volunteer"} marked as completed. +${opportunity.pointsReward} points awarded.`,
      };
      toast(action === "reject" ? "warning" : "success", actionLabels[action] || "Action completed.");
      router.refresh();
    }
  };

  const handleNoShow = async () => {
    if (!noShowModal) return;
    setActionLoading(true);
    const { error } = await markCompletion(noShowModal.id, "no_show");
    setActionLoading(false);
    if (error) {
      toast("error", error);
    } else {
      toast("error", `${noShowModal.volunteerName || "Volunteer"} marked as no-show. Penalty and strike applied.`);
      router.refresh();
    }
    setNoShowModal(null);
  };

  const openDrawer = async (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
    const { data } = await getCompletedHistory(app.volunteerId);
    if (data) {
      setDrawerHistory(data.map(mapCompletedEntry));
    } else {
      setDrawerHistory([]);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/org/opportunities" className="text-sm text-muted hover:text-accent mb-2 inline-block">
          &larr; Back to opportunities
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">
            Candidates for {opportunity.title}
          </h1>
          <Badge variant={APPLICATION_STATUS_BADGE[opportunity.status as keyof typeof APPLICATION_STATUS_BADGE]?.variant as any || "muted"}>
            {opportunity.status}
          </Badge>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SurfaceCard padding="sm" className="flex items-center gap-2 px-4">
          <span className="text-sm text-muted">Total:</span>
          <span className="text-sm font-semibold text-text-primary">{stats.total}</span>
        </SurfaceCard>
        <SurfaceCard padding="sm" className="flex items-center gap-2 px-4">
          <span className="text-sm text-muted">Accepted:</span>
          <span className="text-sm font-semibold text-success">{stats.accepted}/{opportunity.capacity}</span>
        </SurfaceCard>
        <SurfaceCard padding="sm" className="flex items-center gap-2 px-4">
          <span className="text-sm text-muted">Waitlisted:</span>
          <span className="text-sm font-semibold text-warning">{stats.waitlisted}</span>
        </SurfaceCard>
        <SurfaceCard padding="sm" className="flex items-center gap-2 px-4">
          <span className="text-sm text-muted">Rejected:</span>
          <span className="text-sm font-semibold text-danger">{stats.rejected}</span>
        </SurfaceCard>
      </div>

      {/* Candidates table */}
      {candidates.length === 0 ? (
        <SurfaceCard padding="lg">
          <div className="text-center py-8">
            <p className="text-sm text-muted">No one has applied to this opportunity yet.</p>
          </div>
        </SurfaceCard>
      ) : (
        <SurfaceCard padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="px-4 py-3 text-left font-medium text-muted">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">City</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">League</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Applied</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((app) => {
                  const statusCfg = APPLICATION_STATUS_BADGE[app.status];
                  const leagueCfg = app.volunteerLeague ? LEAGUE_CONFIG[app.volunteerLeague] : null;
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-border hover:bg-surface-2/30 cursor-pointer transition-colors"
                      onClick={() => openDrawer(app)}
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {app.volunteerName || "Volunteer"}
                      </td>
                      <td className="px-4 py-3 text-muted">{app.volunteerCity || <span className="text-muted">-</span>}</td>
                      <td className="px-4 py-3">
                        {leagueCfg ? (
                          <Badge variant="default" size="sm">{leagueCfg.label}</Badge>
                        ) : <span className="text-muted">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusCfg.variant as any} size="sm">{statusCfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatRelativeTime(app.appliedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {(app.status === "applied" || app.status === "waitlist") && (
                            <>
                              <Button size="sm" variant="primary" disabled={actionLoading} onClick={() => handleAction(app, "accept")}>Accept</Button>
                              {app.status === "applied" && (
                                <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => handleAction(app, "waitlist")}>Waitlist</Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-danger" disabled={actionLoading} onClick={() => handleAction(app, "reject")}>Reject</Button>
                            </>
                          )}
                          {app.status === "accepted" && eventPassed && (
                            <>
                              <Button size="sm" variant="primary" disabled={actionLoading} onClick={() => handleAction(app, "complete")}>Complete</Button>
                              <Button size="sm" variant="danger" disabled={actionLoading} onClick={() => setNoShowModal(app)}>No-Show</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      )}

      {/* Candidate Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Candidate Details"
        footer={
          selectedApp && (selectedApp.status === "applied" || selectedApp.status === "waitlist") ? (
            <>
              <Button variant="primary" disabled={actionLoading} onClick={() => { handleAction(selectedApp, "accept"); setDrawerOpen(false); }}>Accept</Button>
              <Button variant="outline" disabled={actionLoading} onClick={() => { handleAction(selectedApp, "waitlist"); setDrawerOpen(false); }}>Waitlist</Button>
              <Button variant="danger" disabled={actionLoading} onClick={() => { handleAction(selectedApp, "reject"); setDrawerOpen(false); }}>Reject</Button>
            </>
          ) : selectedApp && selectedApp.status === "accepted" && eventPassed ? (
            <>
              <Button variant="primary" disabled={actionLoading} onClick={() => { handleAction(selectedApp, "complete"); setDrawerOpen(false); }}>Mark Completed</Button>
              <Button variant="danger" disabled={actionLoading} onClick={() => { setNoShowModal(selectedApp); setDrawerOpen(false); }}>Mark No-Show</Button>
            </>
          ) : undefined
        }
      >
        {selectedApp && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-bold">
                {(selectedApp.volunteerName || "V")[0]}
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">{selectedApp.volunteerName || "Volunteer"}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {selectedApp.volunteerLeague && (
                    <Badge variant="default" size="sm">
                      {LEAGUE_CONFIG[selectedApp.volunteerLeague].label}
                    </Badge>
                  )}
                  <span>{selectedApp.volunteerCity || "-"}</span>
                </div>
              </div>
            </div>

            {selectedApp.volunteerBio && (
              <p className="text-sm text-muted">{selectedApp.volunteerBio}</p>
            )}

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Application Message</h4>
              {selectedApp.message ? (
                <div className="rounded-xl bg-surface-2 p-3">
                  <p className="text-sm text-text-primary">{selectedApp.message}</p>
                </div>
              ) : (
                <p className="text-sm text-muted italic">No message provided.</p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Recent Completions</h4>
              {drawerHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {drawerHistory.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-xs">
                      <span className="text-text-primary">{entry.opportunityTitle}</span>
                      <span className="text-muted">{entry.hours}h · +{entry.pointsEarned}pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No completed activities.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* No-Show Confirmation Modal */}
      <Modal
        open={!!noShowModal}
        onClose={() => setNoShowModal(null)}
        title="Mark as No-Show"
        variant="danger"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNoShowModal(null)}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleNoShow}>Confirm No-Show</Button>
          </>
        }
      >
        {noShowModal && (
          <p className="text-sm text-text-primary">
            <strong>{noShowModal.volunteerName || "This volunteer"}</strong> will receive a points penalty and 1 strike. This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
