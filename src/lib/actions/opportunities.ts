"use server";

import * as oppService from "@/services/opportunities";
import type { Database } from "@/types/supabase";

type OppStatus = Database["public"]["Enums"]["opp_status"];

export const canApply = oppService.canApply;
export const listOpportunities = oppService.listOpportunities;
export const getOpportunity = oppService.getOpportunity;
export const createOpportunity = oppService.createOpportunity;
export const updateOpportunity = oppService.updateOpportunity;
export const deleteOpportunity = oppService.deleteOpportunity;

export async function updateOpportunityStatus(id: string, newStatus: OppStatus) {
  return oppService.setOpportunityStatus(id, newStatus);
}

export async function cancelOpportunity(id: string) {
  return oppService.setOpportunityStatus(id, "cancelled");
}
