"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { LEAGUE_CONFIG, CITIES } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";
import { getVolunteerProfile, updateVolunteerProfile, getCompletedHistory } from "@/lib/actions";
import { mapVolunteerProfile, mapCompletedEntry } from "@/lib/mappers";
import type { VolunteerProfile, CompletedEntry } from "@/types";

export default function ProfileEditPage() {
  const { toast } = useToast();
  const [vol, setVol] = useState<VolunteerProfile | null>(null);
  const [history, setHistory] = useState<CompletedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    city: "",
    dateOfBirth: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const [profileResult, historyResult] = await Promise.all([
        getVolunteerProfile(),
        getCompletedHistory(),
      ]);
      if (profileResult.data) {
        const mapped = mapVolunteerProfile(profileResult.data);
        setVol(mapped);
        setForm({
          firstName: mapped.firstName,
          lastName: mapped.lastName,
          nickname: mapped.nickname || "",
          city: mapped.city,
          dateOfBirth: mapped.dateOfBirth,
          bio: mapped.bio || "",
        });
      }
      if (historyResult.data) {
        setHistory(historyResult.data.map(mapCompletedEntry));
      }
      setLoading(false);
    }
    load();
  }, []);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateVolunteerProfile({
      first_name: form.firstName,
      last_name: form.lastName,
      nickname: form.nickname || null,
      city: form.city,
      date_of_birth: form.dateOfBirth,
      bio: form.bio || null,
    });
    setSaving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Profile updated successfully!");
      // Refresh profile data
      const { data } = await getVolunteerProfile();
      if (data) setVol(mapVolunteerProfile(data));
    }
  };

  if (loading || !vol) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIG[vol.league];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      {/* Top row: Profile edit + Stats side by side on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 mb-6">
        {/* Avatar + Name + Edit form */}
        <div className="flex-1 min-w-0">
          <SurfaceCard spotlight padding="md" className="h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-xl font-bold">
                {getInitials(form.firstName, form.lastName)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {form.firstName} {form.lastName}
                </h2>
                {form.nickname && (
                  <p className="text-sm text-muted">@{form.nickname}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
              <Input
                label="Nickname"
                value={form.nickname}
                onChange={(e) => updateField("nickname", e.target.value)}
                placeholder="Optional"
              />
              <Select
                label="City"
                options={CITIES.map((c) => ({ value: c, label: c }))}
                value={form.city}
                onChange={(val) => updateField("city", val)}
              />
              <Input
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                value={form.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                maxChars={300}
                currentLength={form.bio.length}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="primary" loading={saving} onClick={handleSave}>
                Save
              </Button>
            </div>
          </SurfaceCard>
        </div>

        {/* Stats sidebar */}
        <div className="lg:w-80">
          <SurfaceCard spotlight padding="md" className="h-full">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Stats</h2>
            <div className="flex flex-col gap-3">
              <StatCard
                label="League"
                value={leagueConfig.label}
                sub={<Badge variant="default" size="sm">{leagueConfig.label}</Badge>}
              />
              <StatCard label="Season Points" value={String(vol.seasonPoints)} />
              <StatCard label="Lifetime Hours" value={`${vol.lifetimeHours}h`} />
              <StatCard
                label="Strikes"
                value={String(vol.strikes)}
                danger={vol.strikes > 0}
              />
            </div>
          </SurfaceCard>
        </div>
      </div>

      {/* Completed History */}
      <SurfaceCard padding="md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Completed History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">No completed volunteer activities yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl bg-surface-2 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{entry.opportunityTitle}</p>
                  <p className="text-xs text-muted">{entry.organizationName} · {formatDate(entry.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{entry.hours}h</p>
                  <p className="text-xs text-success">+{entry.pointsEarned} pts</p>
                  {entry.pdfUrl && (
                    <a
                      href={entry.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline"
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  danger,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-2 p-3">
      <p className="text-sm text-muted">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-base font-bold ${danger ? "text-danger" : "text-text-primary"}`}>
          {value}
        </p>
        {sub && <div>{sub}</div>}
      </div>
    </div>
  );
}
