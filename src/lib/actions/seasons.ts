"use server";

import * as seasonService from "@/services/seasons";

export const getCurrentSeason = seasonService.getCurrentSeason;
export const listSeasons = seasonService.listSeasons;
export const getLeaderboard = seasonService.getLeaderboard;
