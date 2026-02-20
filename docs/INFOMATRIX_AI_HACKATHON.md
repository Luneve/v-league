# INFOMATRIX-ASIA 2026 — AI Hackathon Submission

---

## 1. Title Page

| | |
|---|---|
| **Project** | V-League — Volunteer Management Platform |
| **Category** | AI Hackathon |
| **Team** | `Vibegod` |
| **School / City** | `Astana`, `Quantum STEM`, Kazakhstan |
| **Year** | 2026 |
| **GitHub** | `https://github.com/Luneve/v-league/tree/main` |
| **YouTube Demo** | `https://www.youtube.com/watch?v=Sbz5fHiKNtA` |

---

## 2. Table of Contents

1. [Title Page](#1-title-page)
2. [Table of Contents](#2-table-of-contents)
3. [Abstract](#3-abstract)
4. [Introduction](#4-introduction)
5. [Solution Overview](#5-solution-overview)
6. [Implementation](#6-implementation)
7. [CRUDL Evidence](#7-crudl-evidence)
8. [End-to-End Demo Scenarios](#8-end-to-end-demo-scenarios)
9. [Setup & Reproducibility](#9-setup--reproducibility)
10. [Originality & Impact](#10-originality--impact)
11. [UI/UX Notes](#11-uiux-notes)
12. [Limitations / Out of Scope](#12-limitations--out-of-scope)
13. [References](#13-references)
14. [Submission Links](#14-submission-links)

---

## 3. Abstract

V-League is a full-stack web platform that solves the fragmentation of volunteer coordination in Kazakhstan. Organizations publish volunteer opportunities; volunteers discover, apply, and earn points through a gamified league system (Bronze → Silver → Gold → Platinum); administrators govern seasons, verify organizations, and maintain platform integrity.

The platform implements a complete CRUDL cycle across 9 database entities with 27 Row-Level Security policies enforcing data isolation at the database layer. Key technical features include: a Server Actions architecture (zero client-side fetching on mount), PostgreSQL RPC functions for atomic multi-table operations (apply, mark completion, season rollover), automated status transitions via pg_cron, and a configurable rules engine (penalties, promotion thresholds, reward caps) stored in a `config` table.

The system serves three distinct roles — Volunteer, Organization, and Admin — each with dedicated UI routes, middleware-enforced access control, and role-specific RLS policies. The result is a production-grade platform that can be deployed to serve real volunteer communities.

Built with: Next.js 16 (App Router), React 19, Supabase (Postgres 17, Auth, Storage, pg_cron), TypeScript 5, Tailwind CSS 4.

---

## 4. Introduction

### Problem Context

In Kazakhstan and Central Asia, volunteer activity is growing but coordination remains ad-hoc. Organizations post opportunities on Instagram or Telegram channels. Volunteers have no unified way to:
- Discover opportunities filtered by city, category, or schedule
- Track their application status
- Accumulate verifiable service hours
- Compare their engagement with peers

Organizations lack tools to manage applicant pipelines, enforce capacity limits, or verify volunteer attendance. There is no accountability mechanism for no-shows.

### Why This Matters

Youth volunteerism is a key driver of civic engagement. Without proper tooling, motivated volunteers drop off due to friction, and organizations waste time on manual coordination. A centralized platform with built-in gamification (leagues, seasons, points) can sustain engagement over time.

---

## 5. Solution Overview

V-League is a three-role platform:

| Role | What they do |
|---|---|
| **Volunteer** | Browse opportunities, apply, track applications, earn points/hours, climb leagues, view leaderboard |
| **Organization** | Create/manage opportunities, review candidates (accept/waitlist/reject), mark completion/no-show, upload certificates |
| **Admin** | Verify organizations, manage seasons (start/rollover), view audit logs, configure platform rules |

### Core Flows

```
Volunteer: Register → Browse Feed → Apply → Get Accepted → Attend → Earn Points → Climb League
Organization: Register → Get Verified → Create Opportunity → Manage Candidates → Mark Completion
Admin: Verify Orgs → Start Season → Monitor Audit Logs → Trigger Rollover
```

### Key Differentiators
- **Defense-in-depth security**: Middleware route guards + 27 RLS policies + SECURITY DEFINER RPCs with `auth.uid()`
- **Atomic business operations**: Apply, status change, completion, and rollover are single RPC calls — no partial state
- **Configurable rules engine**: Penalties, promotion thresholds, and caps are stored in DB (`config` table), not hardcoded
- **Automated lifecycle**: pg_cron closes expired opportunities daily and runs season rollover

---

## 6. Implementation

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16.1.6 (App Router) | Server Components + Server Actions |
| UI | React 19, Tailwind CSS 4 | Component library, responsive design |
| Language | TypeScript 5 | Type safety across stack |
| Database | Supabase (Postgres 17) | Tables, views, RPC, RLS, triggers |
| Auth | Supabase Auth | Email/password, Google OAuth |
| Storage | Supabase Storage | Certificate PDF uploads |
| Scheduling | pg_cron | Daily rollover, weekly notification cleanup |
| Hosting | Vercel + Supabase Cloud | Frontend + backend |

### Database Schema (11 tables, 1 view)

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | Base user record (links to `auth.users`) | `id`, `role` (volunteer/organization/admin) |
| `volunteer_profiles` | Volunteer details + stats | `first_name`, `last_name`, `city`, `league`, `season_points`, `lifetime_hours` |
| `organization_profiles` | Org details + verification | `name`, `city`, `verified`, `verified_by`, `links`, `contacts` |
| `opportunities` | Volunteer opportunities | `title`, `category`, `city`, `capacity`, `points_reward`, `status`, `start_at`, `end_at`, `apply_deadline_at` |
| `applications` | Volunteer applications | `volunteer_id`, `opportunity_id`, `status`, `message` |
| `application_status_history` | Audit trail per application | `application_id`, `status`, `changed_at`, `changed_by` |
| `completion_records` | Post-event results | `result` (completed/no_show), `points_awarded`, `hours_awarded`, `penalty_applied`, `pdf_url` |
| `notifications` | In-app notifications | `user_id`, `type`, `title`, `body`, `is_read` |
| `seasons` | Season periods | `start_at`, `end_at`, `duration_days`, `is_active`, `rollover_done_at` |
| `audit_logs` | System audit trail | `actor_id`, `actor_role`, `action`, `target_type`, `target_id`, `details` |
| `config` | Platform configuration | `key`, `value` (JSONB), `description` |
| **View**: `opportunities_with_counts` | Enriched opportunities | All opp fields + `current_applicants`, `accepted_count`, `effective_status`, org name/verified |

### PostgreSQL Functions (17 functions)

| Function | Type | Purpose |
|---|---|---|
| `fn_apply_to_opportunity` | SECURITY DEFINER | Atomic apply: checks eligibility, capacity, deadline, inserts application |
| `fn_can_apply` | SECURITY DEFINER | Returns eligibility status as JSONB |
| `fn_set_application_status` | SECURITY DEFINER | Status transitions with validation + notification + audit |
| `fn_mark_completion` | SECURITY DEFINER | Records completion/no-show, awards points/hours, applies penalties |
| `fn_set_opportunity_status` | SECURITY DEFINER | Opportunity lifecycle transitions with validation |
| `fn_close_expired_opportunities` | SECURITY DEFINER | Bulk-closes past-deadline opportunities |
| `fn_start_season` | SECURITY DEFINER | Creates new season, deactivates previous |
| `fn_run_season_rollover` | SECURITY DEFINER | Promotes/demotes volunteers based on config thresholds, resets points |
| `fn_verify_organization` | SECURITY DEFINER | Admin verifies org, sets `verified_by` |
| `fn_mark_all_notifications_read` | SECURITY DEFINER | Bulk mark-read for current user |
| `handle_new_user` | SECURITY DEFINER | Trigger: creates profile + role-specific profile on signup |
| `fn_track_app_initial_status` | SECURITY DEFINER | Trigger: logs initial application status |
| `fn_track_app_status` | SECURITY DEFINER | Trigger: logs status changes to history table |
| `get_my_role` | SECURITY DEFINER | Returns current user's role |
| `is_org_verified` | SECURITY DEFINER | Returns whether current org is verified |
| `get_config` | SECURITY DEFINER | Reads config value by key |
| `next_league` | SECURITY INVOKER | Pure function: returns next league tier |

### Triggers

| Trigger | Table | Event | Function |
|---|---|---|---|
| `trg_app_initial_status` | `applications` | AFTER INSERT | `fn_track_app_initial_status` |
| `trg_app_status_history` | `applications` | AFTER UPDATE | `fn_track_app_status` |

### Cron Jobs (pg_cron)

| Schedule | Command | Purpose |
|---|---|---|
| `0 0 * * *` (daily midnight) | `fn_run_season_rollover()` | Check & execute season rollover |
| `0 3 * * 0` (weekly Sunday 3AM) | `DELETE FROM notifications WHERE created_at < now() - interval '90 days'` | Cleanup old notifications |

External cron: `GET /api/cron/close-expired` (Vercel cron, protected by `CRON_SECRET`) calls `fn_close_expired_opportunities`.

### Config Keys

| Key | Description |
|---|---|
| `no_show_penalty` | Points deducted and strikes added for no-show |
| `withdrawal_penalty_tiers` | Penalty schedule based on hours before event start |
| `promotion_rules` | League promotion/demotion thresholds per season |
| `points_reward_cap` | Maximum points an org can assign to a single opportunity |
| `season_duration_default` | Default season length in days |
| `notification_retention_days` | How long to keep notifications before cleanup |

---

## 7. CRUDL Evidence

Every cell below is verified against the actual database schema and application code.

| Entity | Create | Read | Update | Delete | List |
|---|---|---|---|---|---|
| **Opportunities** | Org creates via `createOpportunity` → `INSERT INTO opportunities` | `getOpportunity` → `SELECT FROM opportunities_with_counts` | `updateOpportunity` → `UPDATE opportunities` | `deleteOpportunity` → `DELETE FROM opportunities` (draft only, RLS: `opp_delete_draft`) | `listOpportunities` → `SELECT FROM opportunities_with_counts` with filters |
| **Applications** | Vol applies via RPC `fn_apply_to_opportunity` → `INSERT INTO applications` | `listMyApplications` → `SELECT FROM applications JOIN opportunities` | Status change via RPC `fn_set_application_status` / Vol withdraws | — (no delete) | `listMyApplications` (Vol) / `listCandidates` (Org) |
| **Volunteer Profiles** | Auto-created by trigger `handle_new_user` on signup | `getVolunteerProfile` → `SELECT FROM volunteer_profiles` | `updateVolunteerProfile` → `UPDATE volunteer_profiles` | — (no delete) | `getLeaderboard` → `SELECT FROM volunteer_profiles ORDER BY season_points` |
| **Org Profiles** | Auto-created by trigger `handle_new_user` on signup | `getOrganizationProfile` → `SELECT FROM organization_profiles` | `updateOrganizationProfile` → `UPDATE organization_profiles` | — (no delete) | `listOrganizations` → `SELECT FROM organization_profiles` (Admin) |
| **Notifications** | Created by RPCs (status change, cancellation, completion triggers) | `listNotifications` → `SELECT FROM notifications` | `markNotificationRead` → `UPDATE notifications SET is_read=true` | — (auto-cleanup via pg_cron) | `listNotifications` with filters |
| **Seasons** | Admin via RPC `fn_start_season` → `INSERT INTO seasons` | `getCurrentSeason` → `SELECT FROM seasons WHERE is_active` | Rollover via `fn_run_season_rollover` | `seasons_admin_delete` RLS policy exists | `listSeasons` → `SELECT FROM seasons` |
| **Config** | Admin via `config_insert_admin` RLS | `getAllConfig` → `SELECT FROM config` | `updateConfig` → `UPDATE config` | `config_delete_admin` RLS policy exists | `getAllConfig` |
| **Audit Logs** | System-generated inside RPCs | `getAuditLogs` → `SELECT FROM audit_logs` (Admin only) | — (immutable) | — (immutable) | `getAuditLogs` with filters |
| **Completion Records** | Org via RPC `fn_mark_completion` → `INSERT INTO completion_records` | `getCompletedHistory` → `SELECT FROM completion_records JOIN opportunities` | `cr_update_pdf` RLS (Org updates `pdf_url`) | — (no delete) | `getCompletedHistory` (Vol history) |

### Code Paths

| Module | Path |
|---|---|
| Server Actions (auth) | `src/lib/actions/auth.ts` |
| Server Actions (opportunities) | `src/lib/actions/opportunities.ts` |
| Server Actions (applications) | `src/lib/actions/applications.ts` |
| Server Actions (notifications) | `src/lib/actions/notifications.ts` |
| Server Actions (admin) | `src/lib/actions/admin.ts` |
| Server Actions (seasons) | `src/lib/actions/seasons.ts` |
| Server Actions (certificates) | `src/lib/actions/certificates.ts` |
| Server Actions (profiles) | `src/lib/actions/profiles.ts` |
| Service layer (opportunities) | `src/services/opportunities.ts` |
| Service layer (applications) | `src/services/applications.ts` |
| Service layer (seasons) | `src/services/seasons.ts` |
| Service layer (notifications) | `src/services/notifications.ts` |
| Domain types | `src/types/index.ts` |
| Supabase types (generated) | `src/types/supabase.ts` |
| DB row mappers | `src/lib/mappers.ts` |
| Utilities (dates, penalties) | `src/lib/utils.ts` |
| Middleware (auth + RBAC) | `src/middleware.ts` |
| Cron endpoint | `src/app/api/cron/close-expired/route.ts` |

---

## 8. End-to-End Demo Scenarios

### Scenario A: Volunteer Lifecycle

| Step | Action | Route | What to verify |
|---|---|---|---|
| 1 | Register as volunteer (email or Google) | `/auth/register` | Account created, redirected to feed |
| 2 | Browse open opportunities | `/feed` | Cards show title, org, city, points, capacity, deadline |
| 3 | Apply to an opportunity | `/feed` or `/opportunity/[id]` | Application created, status = "applied" |
| 4 | View my applications | `/applications` | Application appears with status badge |
| 5 | Receive acceptance notification | `/notifications` | Notification with type "status_change" |
| 6 | After event: org marks completion | — (org side) | Points and hours added to volunteer profile |
| 7 | Check leaderboard | `/leaderboard` | Volunteer appears ranked by season_points |
| 8 | View profile stats | `/profile` | League, season points, lifetime hours updated |

### Scenario B: Organization Lifecycle

| Step | Action | Route | What to verify |
|---|---|---|---|
| 1 | Register as organization | `/auth/register` | Account created, see unverified lock |
| 2 | Admin verifies organization | `/admin/organizations/[id]` | Lock lifts, org can create opportunities |
| 3 | Create opportunity (save as draft) | `/org/opportunities/new` | Opportunity in draft status |
| 4 | Edit and publish (draft → open) | `/org/opportunities` | Status changes to open, appears in volunteer feed |
| 5 | Review candidates | `/org/opportunities/[id]/candidates` | See applied volunteers, accept/waitlist/reject |
| 6 | Mark completion for accepted volunteers | Same page | Completion records created, points awarded |
| 7 | Complete the opportunity | `/org/opportunities` | Status → completed (requires all accepted marked) |

### Scenario C: Admin Governance

| Step | Action | Route | What to verify |
|---|---|---|---|
| 1 | View dashboard stats | `/admin/dashboard` | Total orgs, users, pending verifications |
| 2 | Verify a pending organization | `/admin/organizations/[id]` | Org becomes verified |
| 3 | Start a new season (30/60/90/120 days) | `/admin/seasons` | Season created with start/end dates |
| 4 | View audit trail | `/admin/audit` | All admin/system actions logged |
| 5 | Update config (e.g., penalty rules) | `/admin/dashboard` | Config value updated in DB |

---

## 9. Setup & Reproducibility

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Steps

```bash
# 1. Clone
git clone <REPO_URL> && cd v-league

# 2. Environment
# Create .env.local with:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000
#   CRON_SECRET=any-random-string

# 3. Install
npm install

# 4. Database
# Migrations are applied via Supabase dashboard (40 migrations).
# The schema includes all tables, views, functions, triggers, RLS policies, and cron jobs.

# 5. Run
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL (for OAuth redirects) |
| `CRON_SECRET` | Yes | Bearer token for cron endpoint |

### Demo Accounts

No seed script is provided. Create accounts manually:
1. Register a volunteer at `/auth/register`
2. Register an organization at `/auth/register`
3. To create an admin: manually update `profiles.role` to `'admin'` in Supabase SQL Editor

---

## 10. Originality & Impact

### What is Original

1. **League/Season gamification for volunteering** — not a generic CRUD "Note" app; the points → league → season rollover cycle is a unique engagement mechanism
2. **Defense-in-depth security model** — three layers (middleware, RLS, SECURITY DEFINER RPCs) each independently enforce access control
3. **Configurable rules engine** — platform behavior (penalties, promotion thresholds, caps) is data-driven via the `config` table, not hardcoded
4. **Atomic RPC operations** — complex multi-table operations (apply, complete, rollover) are single database transactions, preventing partial state
5. **Zero client-side fetch on mount** — strict Server Components + Server Actions architecture; no POST requests on initial page load

### Social Impact

- **Promotes youth volunteerism** in Kazakhstan by making it discoverable and rewarding
- **Accountability** through no-show penalties and completion tracking
- **Transparency** through audit logs and status history
- **Fairness** through capacity limits, age restrictions, and configurable promotion rules

---

## 11. UI/UX Notes

### Key Screens

| Screen | Purpose | UX Highlights |
|---|---|---|
| Volunteer Feed (`/feed`) | Discover opportunities | Filter bar (city, category, date range, points), card-based layout, deadline countdown |
| Application Detail (`/applications/[id]`) | Track application | Status timeline showing all transitions |
| Candidate Management (`/org/opportunities/[id]/candidates`) | Review applicants | Drawer-based detail view, bulk status actions |
| Admin Dashboard (`/admin/dashboard`) | Platform overview | Stats cards, pending verifications, recent audit entries |
| Leaderboard (`/leaderboard`) | Competitive ranking | League badges, top-50 display, personal rank highlight |

### Design Decisions
- **Dark/light theme** toggle via `next-themes` (persisted)
- **Responsive layout** with collapsible sidebar (`AppShell` component)
- **Role-specific navigation** — sidebar items change per role
- **Empty states** — dedicated `EmptyState` component for zero-data screens
- **Toast notifications** for action feedback
- **Skeleton loaders** for loading states

---

## 12. Limitations / Out of Scope

| Item | Status |
|---|---|
| Telegram bot integration | Not implemented |
| Certificate PDF auto-generation | Not implemented (upload-only) |
| Full-text search | Not implemented |
| Automated test suite | Not present (SQL smoke tests only) |
| Internationalization (i18n) | Not implemented (English UI) |
| AI/ML components | Not present — this is a full-stack CRUD platform |
| Mobile native app | Not implemented (responsive web only) |
| Email notifications | Not implemented (in-app only) |
| Seed/demo data script | Not provided |

---

## 13. References

| Resource | URL |
|---|---|
| Next.js Documentation | https://nextjs.org/docs |
| Supabase Documentation | https://supabase.com/docs |
| Supabase Auth | https://supabase.com/docs/guides/auth |
| Supabase Row-Level Security | https://supabase.com/docs/guides/database/postgres/row-level-security |
| PostgreSQL RPC Functions | https://www.postgresql.org/docs/17/plpgsql.html |
| pg_cron Extension | https://github.com/citusdata/pg_cron |
| Tailwind CSS 4 | https://tailwindcss.com/docs |
| React 19 | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |

All code in this repository is original work by the team. No code was copied from external projects. Third-party dependencies are limited to the packages listed in `package.json`.

---

## 14. Submission Links

| Item | Link |
|---|---|
| GitHub Repository | `<REPLACE_ME>` |
| YouTube Demo Video | `<REPLACE_ME>` |
| Live Demo | `<REPLACE_ME>` |
