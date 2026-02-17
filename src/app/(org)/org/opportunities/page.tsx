import { createClient } from "@/lib/supabase/server";
import { mapOpportunity } from "@/lib/mappers";
import { OrgOpportunitiesClient } from "./client";

export default async function OrgOpportunitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  // Fetch opportunities for this organization
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*, organization_profiles(name, verified)")
    .eq("organization_id", user.id)
    .order("created_at", { ascending: false });

  const oppList = opportunities ?? [];
  const opportunityIds = oppList.map((o) => o.id);

  // Fetch application counts for enrichment
  let enriched = oppList.map((o) => ({ ...o, current_applicants: 0 }));

  if (opportunityIds.length > 0) {
    const { data: appCounts } = await supabase
      .from("applications")
      .select("opportunity_id")
      .in("opportunity_id", opportunityIds)
      .not("status", "in", '("rejected","withdrawn")');

    const countMap: Record<string, number> = {};
    if (appCounts) {
      for (const app of appCounts) {
        countMap[app.opportunity_id] = (countMap[app.opportunity_id] || 0) + 1;
      }
    }
    enriched = oppList.map((opp) => ({
      ...opp,
      current_applicants: countMap[opp.id] || 0,
    }));
  }

  const mapped = enriched.map(mapOpportunity);

  return <OrgOpportunitiesClient initialOpportunities={mapped} />;
}
