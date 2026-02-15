"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mockOpportunities, mockApplications, mockCurrentVolunteer } from "@/mocks";
import { Badge } from "@/components/ui/Badge";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { OPPORTUNITY_STATUS_BADGE } from "@/lib/constants";
import { formatDate, daysUntil, hasTimeOverlap, getInitials } from "@/lib/utils";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const opportunity = mockOpportunities.find((o) => o.id === params.id);

  const existingApplication = mockApplications.find(
    (a) => a.opportunityId === params.id && a.volunteerId === mockCurrentVolunteer.id
  );

  const conflict = useMemo(() => {
    if (!opportunity) return null;
    return hasTimeOverlap(mockApplications, opportunity);
  }, [opportunity]);

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Opportunity not found</h2>
          <p className="text-sm text-muted mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline" onClick={() => router.push("/feed")}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = OPPORTUNITY_STATUS_BADGE[opportunity.status];
  const deadlineDays = daysUntil(opportunity.applyDeadline);
  const spotsLeft = opportunity.capacity - opportunity.currentApplicants;
  const vol = mockCurrentVolunteer;
  const canApply = opportunity.status === "open" && !existingApplication && !conflict && deadlineDays > 0 && spotsLeft > 0;

  // Check age restriction
  const volunteerAge = Math.floor(
    (new Date().getTime() - new Date(vol.dateOfBirth).getTime()) / (365.25 * 24 * 3600000)
  );
  const meetsAge = !opportunity.ageRestriction || volunteerAge >= opportunity.ageRestriction;

  const handleApply = () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplyModalOpen(false);
      toast("success", "Application submitted!");
      router.push("/applications");
    }, 1000);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/feed" className="hover:text-accent">Feed</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{opportunity.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="default">{opportunity.category}</Badge>
          <Badge variant={statusConfig.variant as any}>{statusConfig.label}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{opportunity.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link href={`/org/profile/${opportunity.organizationId}`} className="text-accent hover:underline">
            {opportunity.organizationName}
          </Link>
          {opportunity.orgVerified && (
            <Badge variant="success" size="sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </Badge>
          )}
          <span>·</span>
          <span>{opportunity.city}</span>
        </div>
      </div>

      {/* Cancelled banner */}
      {opportunity.status === "cancelled" && (
        <div className="mb-6 rounded-xl bg-danger-light border border-danger/20 p-4">
          <p className="text-sm font-medium text-danger">
            This opportunity was cancelled by the organizer.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 max-w-3xl">
          {/* Description */}
          <SurfaceCard padding="md" className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </SurfaceCard>

          {/* Info grid */}
          <SurfaceCard padding="md" className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Date Range" value={`${formatDate(opportunity.startDate)}${opportunity.startDate !== opportunity.endDate ? ` — ${formatDate(opportunity.endDate)}` : ""}`} />
              <InfoItem label="Time" value={`${opportunity.startTime} — ${opportunity.endTime}`} />
              <InfoItem label="Planned Hours" value={`${opportunity.plannedHours}h`} />
              <InfoItem label="Capacity" value={`${opportunity.currentApplicants}/${opportunity.capacity} applied`} />
              {opportunity.ageRestriction && (
                <InfoItem label="Age Restriction" value={`${opportunity.ageRestriction}+`} />
              )}
              <InfoItem label="Points Reward" value={`${opportunity.pointsReward} pts`} />
              <InfoItem label="Apply Deadline" value={formatDate(opportunity.applyDeadline)} />
            </div>
          </SurfaceCard>

          {/* Contacts */}
          <SurfaceCard padding="md">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Contacts</h2>
            <div className="flex flex-col gap-2 text-sm">
              {opportunity.contacts.telegram && (
                <div className="flex items-center gap-2 text-muted">
                  <span className="font-medium text-text-primary">Telegram:</span>
                  {opportunity.contacts.telegram}
                </div>
              )}
              {opportunity.contacts.phone && (
                <div className="flex items-center gap-2 text-muted">
                  <span className="font-medium text-text-primary">Phone:</span>
                  {opportunity.contacts.phone}
                </div>
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* Right sidebar */}
        <div className="lg:w-80">
          <div className="lg:sticky lg:top-24">
            <SurfaceCard spotlight padding="md">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-accent">{opportunity.pointsReward}</p>
                <p className="text-sm text-muted">points reward</p>
              </div>

              {/* Spots progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted">Spots</span>
                  <span className="text-text-primary font-medium">{opportunity.currentApplicants}/{opportunity.capacity}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div
                    className="h-2 rounded-full bg-accent transition-all"
                    style={{ width: `${Math.min(100, (opportunity.currentApplicants / opportunity.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-4 text-sm text-muted text-center">
                {deadlineDays > 0 ? (
                  <span>{deadlineDays} days until deadline</span>
                ) : (
                  <span className="text-danger">Deadline passed</span>
                )}
              </div>

              {/* Conflict warning */}
              {conflict && (
                <div className="mb-4 rounded-xl bg-warning-light border border-warning/20 p-3">
                  <p className="text-xs font-medium text-warning">
                    Schedule conflict with &quot;{conflict.opportunity.title}&quot; on {conflict.opportunity.startDate} ({conflict.opportunity.startTime}–{conflict.opportunity.endTime})
                  </p>
                </div>
              )}

              {/* Age restriction warning */}
              {opportunity.ageRestriction && !meetsAge && (
                <div className="mb-4 rounded-xl bg-danger-light border border-danger/20 p-3">
                  <p className="text-xs font-medium text-danger">
                    You must be {opportunity.ageRestriction}+ to apply for this opportunity.
                  </p>
                </div>
              )}

              {/* Already applied */}
              {existingApplication && (
                <div className="mb-4 text-center">
                  <Badge variant="info" size="md">You have applied</Badge>
                </div>
              )}

              {/* Apply button */}
              {opportunity.status === "open" && !existingApplication && (
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!canApply || !meetsAge}
                  onClick={() => setApplyModalOpen(true)}
                >
                  Apply Now
                </Button>
              )}

              {opportunity.status === "closed" && (
                <Button variant="secondary" fullWidth disabled>
                  Applications Closed
                </Button>
              )}

              {opportunity.status === "completed" && (
                <p className="text-sm text-muted text-center">This opportunity has concluded.</p>
              )}
            </SurfaceCard>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to ${opportunity.title}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={applying} onClick={handleApply}>
              Submit Application
            </Button>
          </>
        }
      >
        {/* Profile summary */}
        <div className="rounded-xl bg-surface-2 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white text-sm font-medium">
              {getInitials(vol.firstName, vol.lastName)}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{vol.firstName} {vol.lastName}</p>
              <p className="text-xs text-muted">{vol.city} · {vol.league.charAt(0).toUpperCase() + vol.league.slice(1)} League</p>
            </div>
          </div>
        </div>

        <Textarea
          label="Message to organization (optional)"
          placeholder="Tell the organization why you'd like to volunteer..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxChars={500}
          currentLength={message.length}
        />
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
