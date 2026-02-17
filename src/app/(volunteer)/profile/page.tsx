import { getVolunteerProfile, getCompletedHistory } from "@/lib/actions";
import { mapVolunteerProfile, mapCompletedEntry } from "@/lib/mappers";
import { ProfileClient } from "./client";

export default async function ProfileEditPage() {
  const [profileResult, historyResult] = await Promise.all([
    getVolunteerProfile(),
    getCompletedHistory(),
  ]);

  const vol = profileResult.data
    ? mapVolunteerProfile(profileResult.data)
    : null;
  const history = historyResult.data
    ? historyResult.data.map(mapCompletedEntry)
    : [];

  return <ProfileClient initialProfile={vol} initialHistory={history} />;
}
