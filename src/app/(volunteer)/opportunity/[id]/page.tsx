import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Button } from "@/components/ui/Button";
import { OPPORTUNITY_STATUS_BADGE } from "@/lib/constants";
import { formatDate, daysUntil, hasTimeOverlap } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { mapOpportunity, mapApplication, mapVolunteerProfile } from "@/lib/mappers";
import { OpportunityApplySection } from "./client";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  // Fetch opportunity, user's applications, and volunteer profile in parallel
  const [oppResult, appsResult, volResult] = await Promise.all([
    (async () => {
      const { data: opportunity } = await supabase
        .from("opportunities")
        .select("*, organization_profiles(name, verified)")
        .eq("id", id)
        .single();

      if (!opportunity) return null;

      const { count } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("opportunity_id", id)
        .not("status", "in", '("rejected","withdrawn")');

      return { ...opportunity, current_applicants: count ?? 0 };
    })(),
    supabase
      .from("applications")
      .select(
        "*, opportunities(id, title, description, category, city, start_date, end_date, start_time, end_time, planned_hours, points_reward, status, organization_id, organization_profiles(name, verified))"
      )
      .eq("volunteer_id", user.id)
      .order("applied_at", { ascending: false }),
    supabase
      .from("volunteer_profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
  ]);

  if (!oppResult) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Opportunity not found</h2>
          <p className="text-sm text-muted mb-4">The opportunity you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/feed">
            <Button variant="outline">Back to Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  const opportunity = mapOpportunity(oppResult);
  const myApplications = appsResult.data ? appsResult.data.map(mapApplication) : [];
  const vol = volResult.data ? mapVolunteerProfile(volResult.data) : null;

  const existingApplication = myApplications.find(
    (a) => a.opportunityId === opportunity.id
  ) ?? null;

  const conflict = hasTimeOverlap(
    myApplications.filter((a) => a.opportunityId !== opportunity.id),
    opportunity
  );

  const statusConfig = OPPORTUNITY_STATUS_BADGE[opportunity.status];
  const deadlineDays = daysUntil(opportunity.applyDeadline);
  const spotsLeft = opportunity.capacity - opportunity.currentApplicants;

  const volunteerAge = vol
    ? Math.floor(
        (new Date().getTime() - new Date(vol.dateOfBirth).getTime()) / (365.25 * 24 * 3600000)
      )
    : 0;
  const meetsAge = !opportunity.ageRestriction || volunteerAge >= opportunity.ageRestriction;
  const canApply = opportunity.status === "open" && !existingApplication && !conflict && deadlineDays > 0 && spotsLeft > 0;

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
          <span className="text-accent">
            {opportunity.organizationName}
          </span>
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

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
        {/* Main content */}
        <div className="flex-1 lg:max-w-3xl flex flex-col gap-6">
          <SurfaceCard padding="md">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </SurfaceCard>

          <SurfaceCard padding="md" className="flex-1">
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
        </div>

        {/* Right sidebar */}
        <div className="lg:w-80 flex flex-col gap-6">
          <SurfaceCard spotlight padding="md">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-accent">{opportunity.pointsReward}</p>
              <p className="text-sm text-muted">points reward</p>
            </div>

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

            <div className="mb-4 text-sm text-muted text-center">
              {deadlineDays > 0 ? (
                <span>{deadlineDays} days until deadline</span>
              ) : (
                <span className="text-danger">Deadline passed</span>
              )}
            </div>

            {conflict && (
              <div className="mb-4 rounded-xl bg-warning-light border border-warning/20 p-3">
                <p className="text-xs font-medium text-warning">
                  Schedule conflict with &quot;{conflict.opportunity.title}&quot; on {conflict.opportunity.startDate} ({conflict.opportunity.startTime}–{conflict.opportunity.endTime})
                </p>
              </div>
            )}

            {opportunity.ageRestriction && !meetsAge && (
              <div className="mb-4 rounded-xl bg-danger-light border border-danger/20 p-3">
                <p className="text-xs font-medium text-danger">
                  You must be {opportunity.ageRestriction}+ to apply for this opportunity.
                </p>
              </div>
            )}

            {existingApplication && (
              <div className="mb-4 text-center">
                <Badge variant="info" size="md">You have applied</Badge>
              </div>
            )}

            {/* Interactive apply section (client component) */}
            <OpportunityApplySection
              opportunityId={opportunity.id}
              opportunityTitle={opportunity.title}
              opportunityStatus={opportunity.status}
              canApply={canApply && meetsAge}
              hasExistingApplication={!!existingApplication}
              volunteer={vol}
            />
          </SurfaceCard>

          <SurfaceCard padding="md" className="flex-1">
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
      </div>
    </div>
  );
}
