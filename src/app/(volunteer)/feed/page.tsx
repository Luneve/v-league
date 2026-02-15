"use client";

import { useState, useMemo } from "react";
import { mockOpportunities, mockApplications, mockCurrentVolunteer } from "@/mocks";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { hasTimeOverlap } from "@/lib/utils";
import { CATEGORIES, CITIES } from "@/lib/constants";
import type { FilterConfig } from "@/components/ui/FilterBar";

const filters: FilterConfig[] = [
  {
    key: "city",
    label: "City",
    type: "select",
    options: CITIES.map((c) => ({ value: c, label: c })),
    placeholder: "All cities",
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: CATEGORIES.map((c) => ({ value: c, label: c })),
    placeholder: "All categories",
  },
  {
    key: "availableWithin",
    label: "Available within",
    type: "select",
    options: [
      { value: "7", label: "Next 7 days" },
      { value: "14", label: "Next 14 days" },
      { value: "30", label: "Next 30 days" },
      { value: "60", label: "Next 60 days" },
      { value: "90", label: "Next 90 days" },
    ],
    placeholder: "Any time",
  },
  {
    key: "organization",
    label: "Organization",
    type: "text",
    placeholder: "Search org...",
  },
  {
    key: "points",
    label: "Points",
    type: "range",
    rangeKeys: ["minPoints", "maxPoints"],
    min: 0,
    max: 200,
    step: 5,
    unit: " pts",
  },
];

export default function FeedPage() {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    city: mockCurrentVolunteer.city,
    category: "",
    availableWithin: "",
    organization: "",
    minPoints: "",
    maxPoints: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({
      city: mockCurrentVolunteer.city,
      category: "",
      availableWithin: "",
      organization: "",
      minPoints: "",
      maxPoints: "",
    });
  };

  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter((opp) => {
      // Only show non-draft, non-cancelled
      if (opp.status === "draft") return false;

      if (filterValues.city && opp.city !== filterValues.city) return false;
      if (filterValues.category && opp.category !== filterValues.category) return false;
      if (filterValues.availableWithin) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + Number(filterValues.availableWithin));
        if (new Date(opp.startDate) > cutoff) return false;
      }
      if (filterValues.organization && !opp.organizationName.toLowerCase().includes(filterValues.organization.toLowerCase())) return false;
      if (filterValues.minPoints && opp.pointsReward < Number(filterValues.minPoints)) return false;
      if (filterValues.maxPoints && opp.pointsReward > Number(filterValues.maxPoints)) return false;

      return true;
    });
  }, [filterValues]);

  const conflictMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const opp of filteredOpportunities) {
      const conflict = hasTimeOverlap(mockApplications, opp);
      if (conflict) map[opp.id] = true;
    }
    return map;
  }, [filteredOpportunities]);

  return (
    <div>
      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        className="mb-6"
      />

      {filteredOpportunities.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
          title="No opportunities found"
          description="No opportunities match your filters. Try adjusting them or clearing all filters."
          action={{ label: "Clear filters", onClick: handleClearFilters }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              hasConflict={!!conflictMap[opp.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
