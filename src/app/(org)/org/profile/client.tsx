"use client";

import { useState } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { CITIES } from "@/lib/constants";
import { getOrganizationProfile, updateOrganizationProfile, signOut } from "@/lib/actions";
import { mapOrganizationProfile } from "@/lib/mappers";
import type { OrganizationProfile } from "@/types";

interface OrgProfileClientProps {
  initialOrg: OrganizationProfile | null;
}

export function OrgProfileClient({ initialOrg }: OrgProfileClientProps) {
  const { toast } = useToast();
  const [org, setOrg] = useState<OrganizationProfile | null>(initialOrg);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: initialOrg?.name ?? "",
    about: initialOrg?.about ?? "",
    city: initialOrg?.city ?? "",
    instagram: initialOrg?.links.instagram ?? "",
    website: initialOrg?.links.website ?? "",
    tiktok: initialOrg?.links.tiktok ?? "",
    other: initialOrg?.links.other ?? "",
    telegram: initialOrg?.contacts.telegram ?? "",
    phone: initialOrg?.contacts.phone ?? "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateOrganizationProfile({
      name: form.name,
      about: form.about || null,
      city: form.city,
      links: {
        instagram: form.instagram || undefined,
        website: form.website || undefined,
        tiktok: form.tiktok || undefined,
        other: form.other || undefined,
      },
      contacts: {
        telegram: form.telegram || undefined,
        phone: form.phone || undefined,
      },
    });
    setSaving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Organization profile updated!");
      const { data } = await getOrganizationProfile();
      if (data) setOrg(mapOrganizationProfile(data));
    }
  };

  if (!org) {
    return <p className="text-muted">Profile not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Organization Profile</h1>
        {org.verified ? (
          <Badge variant="success" size="md">Verified</Badge>
        ) : (
          <Badge variant="warning" size="md">Pending Verification</Badge>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <SurfaceCard spotlight padding="md">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold">
              {org.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{form.name}</h2>
              <p className="text-sm text-muted">{form.city}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Input label="Organization name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            <Select label="City" options={CITIES.map((c) => ({ value: c, label: c }))} value={form.city} onChange={(v) => updateField("city", v)} />
            <Textarea label="About" value={form.about} onChange={(e) => updateField("about", e.target.value)} placeholder="Tell volunteers about your organization..." maxChars={500} currentLength={form.about.length} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Instagram" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="Website" value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://..." />
            <Input label="TikTok" value={form.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="https://tiktok.com/..." />
            <Input label="Other" value={form.other} onChange={(e) => updateField("other", e.target.value)} placeholder="Any other link" />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contacts</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telegram" value={form.telegram} onChange={(e) => updateField("telegram", e.target.value)} placeholder="@handle" />
            <Input label="Phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+7 ..." />
          </div>
        </SurfaceCard>

        <div className="flex justify-between items-center">
          <form action={signOut}>
            <Button type="submit" variant="outline">Log out</Button>
          </form>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save</Button>
        </div>
      </div>
    </div>
  );
}
