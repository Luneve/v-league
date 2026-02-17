import { listOrganizations } from "@/lib/actions";
import { mapOrganizationProfile } from "@/lib/mappers";
import { OrganizationsClient } from "./client";

export default async function AdminOrganizationsPage() {
  const { data } = await listOrganizations();
  const organizations = data ? data.map(mapOrganizationProfile) : [];

  return <OrganizationsClient initialOrganizations={organizations} />;
}
