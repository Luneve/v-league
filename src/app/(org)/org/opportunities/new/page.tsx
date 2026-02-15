"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { TimeRangeInput } from "@/components/ui/TimeRangeInput";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, CITIES, AGE_RESTRICTIONS } from "@/lib/constants";
import { createOpportunity, updateOpportunityStatus } from "@/lib/actions";

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    city: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
    ageRestriction: "",
    pointsReward: "",
    applyDeadline: "",
    telegram: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title) e.title = "Title is required.";
    if (!form.category) e.category = "Category is required.";
    if (!form.city) e.city = "City is required.";
    if (!form.description) e.description = "Description is required.";
    if (!form.startDate) e.startDate = "Start date is required.";
    if (!form.endDate) e.endDate = "End date is required.";
    if (!form.startTime || !form.endTime) e.time = "Time range is required.";
    if (!form.capacity) e.capacity = "Capacity is required.";
    if (!form.pointsReward) e.pointsReward = "Points reward is required.";
    if (!form.applyDeadline) e.applyDeadline = "Apply deadline is required.";
    if (form.applyDeadline && form.startDate && form.applyDeadline > form.startDate) {
      e.applyDeadline = "Deadline must be before the event start date.";
    }
    return e;
  };

  const handleSave = async (publish: boolean) => {
    if (publish) {
      const e = validate();
      if (Object.keys(e).length > 0) {
        setErrors(e);
        toast("error", "Please fix the errors in the form.");
        return;
      }
    }
    setSaving(true);

    const { data, error } = await createOpportunity({
      title: form.title,
      category: form.category,
      city: form.city,
      description: form.description,
      start_date: form.startDate,
      end_date: form.endDate,
      start_time: form.startTime,
      end_time: form.endTime,
      capacity: Number(form.capacity),
      age_restriction: form.ageRestriction ? Number(form.ageRestriction) : null,
      points_reward: Number(form.pointsReward),
      apply_deadline: form.applyDeadline,
      contacts: {
        telegram: form.telegram || undefined,
        phone: form.phone || undefined,
      },
    });

    if (error) {
      setSaving(false);
      toast("error", error);
      return;
    }

    // If publishing, set status to 'open'
    if (publish && data) {
      await updateOpportunityStatus(data.id, "open");
    }

    setSaving(false);
    toast("success", publish ? "Opportunity published!" : "Draft saved!");
    router.push("/org/opportunities");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Create Opportunity</h1>

      <div className="flex flex-col gap-6">
        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Basic Info</h2>
          <div className="flex flex-col gap-4">
            <Input label="Title" value={form.title} onChange={(e) => updateField("title", e.target.value)} error={errors.title} placeholder="e.g. Spring Park Cleanup" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={form.category} onChange={(v) => updateField("category", v)} placeholder="Select category" error={errors.category} />
              <Select label="City" options={CITIES.map((c) => ({ value: c, label: c }))} value={form.city} onChange={(v) => updateField("city", v)} placeholder="Select city" error={errors.city} />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => updateField("description", e.target.value)} error={errors.description} placeholder="Describe the opportunity..." maxChars={2000} currentLength={form.description.length} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Schedule</h2>
          <div className="flex flex-col gap-4">
            <DateRangePicker label="Event dates" startDate={form.startDate} endDate={form.endDate} onStartDateChange={(v) => updateField("startDate", v)} onEndDateChange={(v) => updateField("endDate", v)} error={errors.startDate || errors.endDate} />
            <TimeRangeInput label="Time range" startTime={form.startTime} endTime={form.endTime} onStartTimeChange={(v) => updateField("startTime", v)} onEndTimeChange={(v) => updateField("endTime", v)} error={errors.time} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} error={errors.capacity} placeholder="e.g. 20" />
            <Select label="Age restriction" options={AGE_RESTRICTIONS} value={form.ageRestriction} onChange={(v) => updateField("ageRestriction", v)} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Reward & Deadline</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Points reward" type="number" value={form.pointsReward} onChange={(e) => updateField("pointsReward", e.target.value)} error={errors.pointsReward} placeholder="e.g. 75" hint="Platform max: 200" />
            <Input label="Apply deadline" type="date" value={form.applyDeadline} onChange={(e) => updateField("applyDeadline", e.target.value)} error={errors.applyDeadline} />
          </div>
        </SurfaceCard>

        <SurfaceCard padding="md">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Contacts</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telegram" value={form.telegram} onChange={(e) => updateField("telegram", e.target.value)} placeholder="@handle" />
            <Input label="Phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+7 ..." />
          </div>
        </SurfaceCard>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} loading={saving}>
            Save as Draft
          </Button>
          <Button variant="primary" onClick={() => handleSave(true)} loading={saving}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
