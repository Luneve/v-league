"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockOpportunities } from "@/mocks";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { TimeRangeInput } from "@/components/ui/TimeRangeInput";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, CITIES, AGE_RESTRICTIONS, OPPORTUNITY_STATUS_BADGE } from "@/lib/constants";

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const opportunity = mockOpportunities.find((o) => o.id === params.id);

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Opportunity not found</h2>
          <Button variant="outline" onClick={() => router.push("/org/opportunities")}>Back</Button>
        </div>
      </div>
    );
  }

  return <EditForm opportunity={opportunity} />;
}

function EditForm({ opportunity }: { opportunity: typeof mockOpportunities[0] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const statusCfg = OPPORTUNITY_STATUS_BADGE[opportunity.status];

  const [form, setForm] = useState({
    title: opportunity.title,
    category: opportunity.category,
    city: opportunity.city,
    description: opportunity.description,
    startDate: opportunity.startDate,
    endDate: opportunity.endDate,
    startTime: opportunity.startTime,
    endTime: opportunity.endTime,
    capacity: String(opportunity.capacity),
    ageRestriction: opportunity.ageRestriction ? String(opportunity.ageRestriction) : "",
    pointsReward: String(opportunity.pointsReward),
    applyDeadline: opportunity.applyDeadline,
    telegram: opportunity.contacts.telegram || "",
    phone: opportunity.contacts.phone || "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast("success", "Opportunity updated!");
      router.push("/org/opportunities");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit Opportunity</h1>
        <Badge variant={statusCfg.variant as any}>{statusCfg.label}</Badge>
      </div>

      <div className="flex flex-col gap-6">
        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Basic Info</h2>
          <div className="flex flex-col gap-4">
            <Input label="Title" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={form.category} onChange={(v) => updateField("category", v)} />
              <Select label="City" options={CITIES.map((c) => ({ value: c, label: c }))} value={form.city} onChange={(v) => updateField("city", v)} />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => updateField("description", e.target.value)} maxChars={2000} currentLength={form.description.length} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Schedule</h2>
          <div className="flex flex-col gap-4">
            <DateRangePicker label="Event dates" startDate={form.startDate} endDate={form.endDate} onStartDateChange={(v) => updateField("startDate", v)} onEndDateChange={(v) => updateField("endDate", v)} />
            <TimeRangeInput label="Time range" startTime={form.startTime} endTime={form.endTime} onStartTimeChange={(v) => updateField("startTime", v)} onEndTimeChange={(v) => updateField("endTime", v)} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} />
            <Select label="Age restriction" options={AGE_RESTRICTIONS} value={form.ageRestriction} onChange={(v) => updateField("ageRestriction", v)} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Reward & Deadline</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Points reward" type="number" value={form.pointsReward} onChange={(e) => updateField("pointsReward", e.target.value)} hint="Platform max: 200" />
            <Input label="Apply deadline" type="date" value={form.applyDeadline} onChange={(e) => updateField("applyDeadline", e.target.value)} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contacts</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telegram" value={form.telegram} onChange={(e) => updateField("telegram", e.target.value)} />
            <Input label="Phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
        </SurfaceCard>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Update</Button>
        </div>
      </div>
    </div>
  );
}
