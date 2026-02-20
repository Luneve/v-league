"use server";

import * as appService from "@/services/applications";
import type { Database } from "@/types/supabase";

type AppStatus = Database["public"]["Enums"]["app_status"];

export async function applyToOpportunity(opportunityId: string, message?: string) {
  return appService.applyToOpportunity(opportunityId, message);
}

export async function withdrawApplication(applicationId: string) {
  return appService.setApplicationStatus(applicationId, "withdrawn");
}

export const listMyApplications = appService.listMyApplications;
export const listCandidates = appService.listCandidates;
export const getApplicationStatusHistory = appService.getApplicationStatusHistory;

export async function acceptCandidate(applicationId: string) {
  return appService.setApplicationStatus(applicationId, "accepted");
}

export async function waitlistCandidate(applicationId: string) {
  return appService.setApplicationStatus(applicationId, "waitlist");
}

export async function rejectCandidate(applicationId: string) {
  return appService.setApplicationStatus(applicationId, "rejected");
}

export async function promoteFromWaitlist(applicationId: string) {
  return appService.setApplicationStatus(applicationId, "accepted");
}

export async function markCompletion(
  applicationId: string,
  result: "completed" | "no_show"
) {
  return appService.markCompletion(applicationId, result);
}
