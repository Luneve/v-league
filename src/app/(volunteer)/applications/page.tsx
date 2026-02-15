"use client";

import { useState } from "react";
import Link from "next/link";
import { mockApplications } from "@/mocks";
import { Badge } from "@/components/ui/Badge";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { APPLICATION_STATUS_BADGE } from "@/lib/constants";
import { formatDate, getWithdrawalPenalty } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const tabs = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "accepted", label: "Accepted" },
  { id: "waitlist", label: "Waitlisted" },
  { id: "completed", label: "Completed" },
  { id: "withdrawn", label: "Withdrawn" },
];

// Filter only the current volunteer's applications
const myApps = mockApplications.filter((a) => a.volunteerId === "vol-1");

export default function ApplicationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [withdrawModal, setWithdrawModal] = useState<string | null>(null);

  const filtered =
    activeTab === "all"
      ? myApps
      : myApps.filter((a) => a.status === activeTab);

  const withdrawApp = myApps.find((a) => a.id === withdrawModal);
  const withdrawPenalty = withdrawApp
    ? getWithdrawalPenalty(withdrawApp.opportunity.startDate, withdrawApp.opportunity.startTime)
    : null;

  const canWithdraw = (status: ApplicationStatus) =>
    status === "applied" || status === "waitlist" || status === "accepted";

  const handleWithdraw = () => {
    if (!withdrawApp) return;
    toast(
      withdrawPenalty && withdrawPenalty.penalty > 0 ? "warning" : "success",
      withdrawPenalty && withdrawPenalty.penalty > 0
        ? `Application withdrawn. ${withdrawPenalty.penalty} points deducted.`
        : "Application withdrawn."
    );
    setWithdrawModal(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Applications</h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
          title="No applications yet"
          description="You haven't applied to any opportunities yet. Browse the feed to get started."
          action={{ label: "Browse opportunities", onClick: () => window.location.href = "/feed" }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => {
            const statusCfg = APPLICATION_STATUS_BADGE[app.status];
            return (
              <SurfaceCard key={app.id} padding="md" hover>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-base font-semibold text-text-primary hover:text-accent"
                    >
                      {app.opportunity.title}
                    </Link>
                    <p className="text-sm text-muted mt-0.5">
                      {app.opportunity.organizationName} · {app.opportunity.city}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {formatDate(app.opportunity.startDate)} · {app.opportunity.startTime}–{app.opportunity.endTime} · {app.opportunity.pointsReward} pts
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
                    {canWithdraw(app.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-danger border-danger/30 hover:bg-danger-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWithdrawModal(app.id);
                        }}
                      >
                        Withdraw
                      </Button>
                    )}
                    {app.status === "completed" && app.pointsEarned && (
                      <span className="text-sm font-medium text-success">+{app.pointsEarned} pts</span>
                    )}
                    {app.status === "no_show" && app.penaltyApplied && (
                      <span className="text-sm font-medium text-danger">-{app.penaltyApplied} pts</span>
                    )}
                    <Link href={`/applications/${app.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      )}

      {/* Withdraw Modal */}
      <Modal
        open={!!withdrawModal}
        onClose={() => setWithdrawModal(null)}
        title={`Withdraw from ${withdrawApp?.opportunity.title || ""}?`}
        variant={withdrawPenalty?.penalty ? "danger" : "default"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setWithdrawModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleWithdraw}>Confirm Withdrawal</Button>
          </>
        }
      >
        <p className="text-sm text-text-primary">
          {withdrawPenalty?.message || "You can withdraw without any penalty."}
        </p>
      </Modal>
    </div>
  );
}
