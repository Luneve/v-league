import { listOpportunities, listMyApplications, getVolunteerProfile, canApply } from "@/lib/actions";
import { mapOpportunity, mapApplication, mapVolunteerProfile } from "@/lib/mappers";
import { FeedClient } from "./client";

export default async function FeedPage() {
  const [profileResult, oppResult, appResult] = await Promise.all([
    getVolunteerProfile(),
    listOpportunities({ openForApplications: true }),
    listMyApplications(),
  ]);

  const vol = profileResult.data ? mapVolunteerProfile(profileResult.data) : null;
  const opportunities = oppResult.data ? oppResult.data.map(mapOpportunity) : [];
  const applications = appResult.data ? appResult.data.map(mapApplication) : [];

  // Eligibility from fn_can_apply (single source of truth)
  const canApplyResults = await Promise.all(
    opportunities.map((opp) => canApply(opp.id))
  );
  const canApplyMap: Record<string, { canApply: boolean; reason: string | null }> = {};
  opportunities.forEach((opp, i) => {
    const r = canApplyResults[i];
    canApplyMap[opp.id] = {
      canApply: r.can_apply,
      reason: r.reason,
    };
  });

  return (
    <FeedClient
      initialOpportunities={opportunities}
      initialApplications={applications}
      canApplyMap={canApplyMap}
      defaultCity={vol?.city ?? ""}
    />
  );
}
