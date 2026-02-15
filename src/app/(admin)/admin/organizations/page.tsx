"use client";

import { useState } from "react";
import Link from "next/link";
import { mockOrganizations } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function AdminOrganizationsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? mockOrganizations
    : filter === "pending"
    ? mockOrganizations.filter((o) => !o.verified)
    : mockOrganizations.filter((o) => o.verified);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Organizations</h1>

      <div className="flex items-center gap-3 mb-6">
        <Select
          options={[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "verified", label: "Verified" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <SurfaceCard padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left font-medium text-muted">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-muted">City</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr key={org.id} className="border-b border-border hover:bg-surface-2/30 transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{org.name}</td>
                <td className="px-4 py-3 text-muted">{org.city}</td>
                <td className="px-4 py-3">
                  {org.verified ? (
                    <Badge variant="success" size="sm">Verified</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/organizations/${org.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
