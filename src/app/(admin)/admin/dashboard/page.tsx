import {
  listOrganizations,
  listUsers,
  getAuditLogs,
  getCurrentSeason,
} from "@/lib/actions";
import { mapOrganizationProfile, mapAuditLogEntry, mapSeason } from "@/lib/mappers";
import { AdminDashboardClient } from "./client";

export default async function AdminDashboardPage() {
  const [orgsResult, usersResult, auditResult, seasonResult, pendingResult] = await Promise.all([
    listOrganizations(),
    listUsers(),
    getAuditLogs({ pageSize: 7 }),
    getCurrentSeason(),
    listOrganizations({ verified: false }),
  ]);

  const totalOrgs = orgsResult.data
    ? orgsResult.count ?? orgsResult.data.length
    : 0;
  const totalUsers = usersResult.data
    ? usersResult.count ?? usersResult.data.length
    : 0;
  const auditEntries = auditResult.data
    ? auditResult.data.map(mapAuditLogEntry)
    : [];
  const season = seasonResult.data ? mapSeason(seasonResult.data) : null;
  const pendingOrgs = pendingResult.data
    ? pendingResult.data.map(mapOrganizationProfile)
    : [];

  return (
    <AdminDashboardClient
      totalOrgs={totalOrgs}
      totalUsers={totalUsers}
      auditEntries={auditEntries}
      season={season}
      pendingOrgs={pendingOrgs}
    />
  );
}
