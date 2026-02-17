"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCompletedHistory(volunteerId?: string) {
  const supabase = await createClient();

  let targetId = volunteerId;
  if (!targetId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };
    targetId = user.id;
  }

  const { data, error } = await supabase
    .from("completion_records")
    .select(
      "*, opportunities!inner(title, start_date, organization_profiles!inner(name))"
    )
    .eq("volunteer_id", targetId)
    .eq("result", "completed")
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function uploadCertificatePdf(
  opportunityId: string,
  volunteerId: string,
  file: File
) {
  const supabase = await createClient();

  const filePath = `${opportunityId}/${volunteerId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) return { url: null, error: uploadError.message };

  // Update completion record with the pdf_url path
  const { error: updateError } = await supabase
    .from("completion_records")
    .update({ pdf_url: filePath })
    .eq("opportunity_id", opportunityId)
    .eq("volunteer_id", volunteerId);

  if (updateError) return { url: null, error: updateError.message };

  return { url: filePath, error: null };
}

export async function getCertificatePdfUrl(completionRecordId: string) {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("completion_records")
    .select("pdf_url")
    .eq("id", completionRecordId)
    .single();

  if (error || !record?.pdf_url)
    return { url: null, error: error?.message ?? "No PDF attached" };

  const { data: signedUrl } = await supabase.storage
    .from("certificates")
    .createSignedUrl(record.pdf_url, 3600); // 1 hour expiry

  return { url: signedUrl?.signedUrl ?? null, error: null };
}
