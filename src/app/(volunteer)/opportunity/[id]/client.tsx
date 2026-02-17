"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { getInitials } from "@/lib/utils";
import { applyToOpportunity } from "@/lib/actions";
import type { VolunteerProfile } from "@/types";

interface OpportunityApplySectionProps {
  opportunityId: string;
  opportunityTitle: string;
  opportunityStatus: string;
  canApply: boolean;
  hasExistingApplication: boolean;
  volunteer: VolunteerProfile | null;
}

export function OpportunityApplySection({
  opportunityId,
  opportunityTitle,
  opportunityStatus,
  canApply,
  hasExistingApplication,
  volunteer,
}: OpportunityApplySectionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    const { error } = await applyToOpportunity(opportunityId, message || undefined);
    setApplying(false);
    if (error) {
      setApplyModalOpen(false);
      toast("error", error);
    } else {
      setApplyModalOpen(false);
      toast("success", "Application submitted!");
      router.push("/applications");
    }
  };

  return (
    <>
      {opportunityStatus === "open" && !hasExistingApplication && (
        <Button
          variant="primary"
          fullWidth
          disabled={!canApply}
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Now
        </Button>
      )}

      {opportunityStatus === "closed" && (
        <Button variant="secondary" fullWidth disabled>
          Applications Closed
        </Button>
      )}

      {opportunityStatus === "completed" && (
        <p className="text-sm text-muted text-center">This opportunity has concluded.</p>
      )}

      {/* Apply Modal */}
      <Modal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to ${opportunityTitle}`}
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
        {volunteer && (
          <div className="rounded-xl bg-surface-2 p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white text-sm font-medium">
                {getInitials(volunteer.firstName, volunteer.lastName)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{volunteer.firstName} {volunteer.lastName}</p>
                <p className="text-xs text-muted">{volunteer.city} · {volunteer.league.charAt(0).toUpperCase() + volunteer.league.slice(1)} League</p>
              </div>
            </div>
          </div>
        )}

        <Textarea
          label="Message to organization (optional)"
          placeholder="Tell the organization why you'd like to volunteer..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxChars={500}
          currentLength={message.length}
        />
      </Modal>
    </>
  );
}
