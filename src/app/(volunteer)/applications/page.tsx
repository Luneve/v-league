import { createClient } from "@/lib/supabase/server";
import { mapApplication } from "@/lib/mappers";
import { ApplicationsClient } from "./client";

export default async function ApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-muted">Not authenticated.</p>;
  }

  const { data } = await supabase
    .from("applications")
    .select(
      "*, opportunities(id, title, description, category, city, start_date, end_date, start_time, end_time, planned_hours, points_reward, status, organization_id, organization_profiles(name, verified))"
    )
    .eq("volunteer_id", user.id)
    .order("applied_at", { ascending: false });

  const applications = data ? data.map(mapApplication) : [];

  return <ApplicationsClient initialApplications={applications} />;
}
