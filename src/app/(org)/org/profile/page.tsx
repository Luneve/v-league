import { getSupabaseClient, getAuthUser } from "@/lib/supabase/user";
import { mapOrganizationProfile } from "@/lib/mappers";
import { OrgProfileClient } from "./client";

export default async function OrgProfilePage() {
  const [supabase, user] = await Promise.all([
    getSupabaseClient(),
    getAuthUser(),
  ]);

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  const { data } = await supabase
    .from("organization_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const org = data ? mapOrganizationProfile(data) : null;

  return <OrgProfileClient initialOrg={org} />;
}
