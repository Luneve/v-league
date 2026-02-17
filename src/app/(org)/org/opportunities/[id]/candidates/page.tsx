import { redirect } from "next/navigation";
import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapOpportunity, mapCandidate } from "@/lib/mappers";
import { CandidatesClient } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CandidatesPage({ params }: Props) {
  const { id } = await params;

  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);

  if (!user) redirect("/auth/login");

  // Fetch opportunity (with org profile + applicant count) and candidates in parallel
  const [oppResult, candResult] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*, organization_profiles(name, verified)")
      .eq("id", id)
      .single()
      .then(async (res) => {
        if (res.error || !res.data) return { data: null, error: res.error };
        // Count active applicants
        const { count } = await supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .eq("opportunity_id", id)
          .not("status", "in", '("rejected","withdrawn")');
        return { data: { ...res.data, current_applicants: count ?? 0 }, error: null };
      }),
    supabase
      .from("applications")
      .select(
        "*, volunteer_profiles(id, first_name, last_name, nickname, city, bio, league, season_points, lifetime_hours, avatar_url)"
      )
      .eq("opportunity_id", id)
      .order("applied_at", { ascending: true }),
  ]);

  if (!oppResult.data) {
    redirect("/org/opportunities");
  }

  const opportunity = mapOpportunity(oppResult.data);
  const candidates = (candResult.data ?? []).map(mapCandidate);

  return (
    <CandidatesClient
      initialOpportunity={opportunity}
      initialCandidates={candidates}
    />
  );
}
