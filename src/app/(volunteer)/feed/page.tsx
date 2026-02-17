import { listOpportunities, listMyApplications, getVolunteerProfile } from "@/lib/actions";
import { mapOpportunity, mapApplication, mapVolunteerProfile } from "@/lib/mappers";
import { FeedClient } from "./client";

export default async function FeedPage() {
  const [profileResult, oppResult, appResult] = await Promise.all([
    getVolunteerProfile(),
    listOpportunities({ status: "open" }),
    listMyApplications(),
  ]);

  const vol = profileResult.data ? mapVolunteerProfile(profileResult.data) : null;
  const opportunities = oppResult.data ? oppResult.data.map(mapOpportunity) : [];
  const applications = appResult.data ? appResult.data.map(mapApplication) : [];

  return (
    <FeedClient
      initialOpportunities={opportunities}
      initialApplications={applications}
      defaultCity={vol?.city ?? ""}
    />
  );
}
