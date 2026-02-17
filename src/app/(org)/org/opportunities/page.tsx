import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapOpportunity } from "@/lib/mappers";
import { OrgOpportunitiesClient } from "./client";
import { perfRoute, perfStart, perfEnd, perfSummary } from "@/lib/perf/timing";

export default async function OrgOpportunitiesPage() {
  perfRoute("/org/opportunities");
  perfStart("auth");
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);
  perfEnd("auth");

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  perfStart("db-view-query");
  const { data: opportunities } = await supabase
    .from("opportunities_with_counts")
    .select("*")
    .eq("organization_id", user.id)
    .order("created_at", { ascending: false });
  perfEnd("db-view-query");

  perfStart("transform");
  const mapped = (opportunities ?? []).map(mapOpportunity);
  perfEnd("transform");

  perfSummary();

  return <OrgOpportunitiesClient initialOpportunities={mapped} />;
}
