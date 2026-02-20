// Auth
export {
  signUpVolunteer,
  signUpOrganization,
  signIn,
  signInWithGoogle,
  signOut,
  getSession,
  getProfile,
} from "./auth";

// Profiles
export {
  getVolunteerProfile,
  updateVolunteerProfile,
  getPublicVolunteerProfile,
  getOrganizationProfile,
  updateOrganizationProfile,
} from "./profiles";

// Opportunities
export {
  canApply,
  listOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
  cancelOpportunity,
} from "./opportunities";

// Applications
export {
  applyToOpportunity,
  withdrawApplication,
  listMyApplications,
  listCandidates,
  acceptCandidate,
  waitlistCandidate,
  rejectCandidate,
  promoteFromWaitlist,
  markCompletion,
  getApplicationStatusHistory,
} from "./applications";

// Admin
export {
  verifyOrganization,
  unverifyOrganization,
  listOrganizations,
  listUsers,
  createSeason,
  triggerSeasonRollover,
  getAuditLogs,
  updateConfig,
  getConfig,
  getAllConfig,
} from "./admin";

// Notifications
export {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notifications";

// Seasons & Leaderboard
export {
  getCurrentSeason,
  listSeasons,
  getLeaderboard,
} from "./seasons";

// Certificates
export {
  getCompletedHistory,
  uploadCertificatePdf,
  getCertificatePdfUrl,
} from "./certificates";
