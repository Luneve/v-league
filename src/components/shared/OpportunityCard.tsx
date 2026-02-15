"use client";

import Link from "next/link";
import type { Opportunity, ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { OPPORTUNITY_STATUS_BADGE, APPLICATION_STATUS_BADGE } from "@/lib/constants";
import { daysUntil } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: Opportunity;
  hasConflict?: boolean;
  applicationStatus?: ApplicationStatus;
}

function OpportunityCard({ opportunity, hasConflict = false, applicationStatus }: OpportunityCardProps) {
  // Use application status if available, otherwise use opportunity status
  const statusConfig = applicationStatus 
    ? APPLICATION_STATUS_BADGE[applicationStatus]
    : OPPORTUNITY_STATUS_BADGE[opportunity.status];
  const deadlineDays = daysUntil(opportunity.applyDeadline);
  const spotsLeft = opportunity.capacity - opportunity.currentApplicants;

  return (
    <SurfaceCard
      spotlight
      hover
      padding="md"
      className={hasConflict ? "border-warning/50" : ""}
    >
      <Link href={`/opportunity/${opportunity.id}`} className="block">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="default" size="sm">{opportunity.category}</Badge>
          <Badge variant={statusConfig.variant as any} size="sm">{statusConfig.label}</Badge>
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
          {opportunity.title}
        </h3>
        <p className="text-sm text-muted mb-3">{opportunity.organizationName}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-3">
          <span className="inline-flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {opportunity.city}
          </span>
          <span>·</span>
          <span>{opportunity.startDate}{opportunity.startDate !== opportunity.endDate ? ` — ${opportunity.endDate}` : ""}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" size="md">
              <span className="font-semibold">{opportunity.pointsReward}</span> pts
            </Badge>
            <span className="text-xs text-muted">
              {spotsLeft > 0 ? `${spotsLeft}/${opportunity.capacity} spots` : "Full"}
            </span>
          </div>
          <div className="text-right">
            {hasConflict && (
              <Badge variant="warning" size="sm">Conflict</Badge>
            )}
            {!hasConflict && deadlineDays > 0 && (
              <span className="text-xs text-muted">{deadlineDays}d left</span>
            )}
            {!hasConflict && deadlineDays <= 0 && (
              <span className="text-xs text-danger">Deadline passed</span>
            )}
          </div>
        </div>
      </Link>
    </SurfaceCard>
  );
}

export { OpportunityCard };
export type { OpportunityCardProps };
