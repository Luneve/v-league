"use client";

import { useState } from "react";
import { mockCurrentVolunteer, mockCompletedHistory } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { LEAGUE_CONFIG, CITIES } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";

export default function ProfileEditPage() {
  const { toast } = useToast();
  const vol = mockCurrentVolunteer;
  const leagueConfig = LEAGUE_CONFIG[vol.league];

  const [form, setForm] = useState({
    firstName: vol.firstName,
    lastName: vol.lastName,
    nickname: vol.nickname || "",
    city: vol.city,
    dateOfBirth: vol.dateOfBirth,
    bio: vol.bio || "",
  });
  const [saving, setSaving] = useState(false);

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast("success", "Profile updated successfully!");
    }, 800);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Profile</h1>

      <div className="flex flex-col gap-6">
        {/* Avatar + Name */}
        <SurfaceCard spotlight padding="md">
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

        {/* Metrics */}
        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

        {/* Completed History */}
        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Completed History</h2>
          {mockCompletedHistory.length === 0 ? (
            <p className="text-sm text-muted">No completed volunteer activities yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {mockCompletedHistory.map((entry) => (
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
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${danger ? "text-danger" : "text-text-primary"}`}>
        {value}
      </p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}
