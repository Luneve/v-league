import { createClient } from "@/lib/supabase/server";
import { mapOrganizationProfile } from "@/lib/mappers";
import { OrgProfileClient } from "./client";

export default async function OrgProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
