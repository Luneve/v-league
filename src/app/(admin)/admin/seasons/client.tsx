"use client";

import { useState } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatTzDate } from "@/lib/utils";
import { listSeasons, createSeason } from "@/lib/actions";
import { mapSeason } from "@/lib/mappers";
import type { Season } from "@/types";

interface SeasonsClientProps {
  initialSeasons: Season[];
}

export function SeasonsClient({ initialSeasons }: SeasonsClientProps) {
  const { toast } = useToast();
  const [seasons, setSeasons] = useState<Season[]>(initialSeasons);
  const [duration, setDuration] = useState("90");
  const [creating, setCreating] = useState(false);

  const fetchSeasons = async () => {
    const { data } = await listSeasons();
    if (data) {
      setSeasons(data.map(mapSeason));
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    const { error } = await createSeason(Number(duration));
    setCreating(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", `New ${duration}-day season created!`);
      fetchSeasons();
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Season Management
      </h1>

      {/* Current / Past Seasons */}
      <div className="flex flex-col gap-4 mb-8">
        {seasons.length === 0 ? (
          <SurfaceCard padding="lg" className="text-center">
            <p className="text-sm text-muted">No seasons created yet.</p>
          </SurfaceCard>
        ) : (
          seasons.map((season) => (
            <SurfaceCard key={season.id} spotlight padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      {season.startAt ? formatTzDate(season.startAt) : formatDate(season.startDate)} —{" "}
                      {season.endAt ? formatTzDate(season.endAt) : formatDate(season.endDate)}
                    </h3>
                    {season.active && (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted">{season.durationDays} days</p>
                </div>
              </div>
            </SurfaceCard>
          ))
        )}
      </div>

      {/* Create New Season */}
      <SurfaceCard padding="md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Start New Season
        </h2>
        <div className="flex items-end gap-4">
          <div className="min-w-[200px]">
            <Select
              label="Duration"
              options={[
                { value: "30", label: "30 days" },
                { value: "60", label: "60 days" },
                { value: "90", label: "90 days (default)" },
                { value: "120", label: "120 days" },
              ]}
              value={duration}
              onChange={setDuration}
            />
          </div>
          <Button variant="primary" onClick={handleCreate} loading={creating}>
            Start Season
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
