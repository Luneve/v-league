"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { listOrganizations } from "@/lib/actions";
import { mapOrganizationProfile } from "@/lib/mappers";
import type { OrganizationProfile } from "@/types";

interface OrganizationsClientProps {
  initialOrganizations: OrganizationProfile[];
}

export function OrganizationsClient({
  initialOrganizations,
}: OrganizationsClientProps) {
  const [filter, setFilter] = useState("all");
  const [organizations, setOrganizations] =
    useState<OrganizationProfile[]>(initialOrganizations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filter === "all") {
      setOrganizations(initialOrganizations);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      const verified = filter === "true";
      const { data } = await listOrganizations({ verified });
      if (!cancelled && data) {
        setOrganizations(data.map(mapOrganizationProfile));
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, initialOrganizations]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Organizations
      </h1>

      <div className="flex items-center gap-3 mb-6">
        <Select
          options={[
            { value: "all", label: "All" },
            { value: "false", label: "Pending" },
            { value: "true", label: "Verified" },
          ]}
          value={filter === "all" ? "all" : filter === "true" ? "true" : "false"}
          onChange={(v) => setFilter(v)}
        />
      </div>

      <SurfaceCard padding="none" className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="px-4 py-3 text-left font-medium text-muted">
                Organization
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                City
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr
                key={org.id}
                className="border-b border-border hover:bg-surface-2/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {org.name}
                </td>
                <td className="px-4 py-3 text-muted">{org.city}</td>
                <td className="px-4 py-3">
                  {org.verified ? (
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/organizations/${org.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {organizations.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted"
                >
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
