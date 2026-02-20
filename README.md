# V-League — Volunteer Management Platform

**A role-based web platform that connects volunteers with organizations, tracks participation through a league/season points system, and gives admins oversight of the entire ecosystem.**

---

## Problem / Solution / Impact

| | |
|---|---|
| **Problem** | In Kazakhstan, volunteer coordination is fragmented — organizations post on social media, volunteers have no unified place to discover, apply, and track their service hours. |
| **Solution** | V-League is a three-role platform (Volunteer, Organization, Admin) where organizations publish opportunities, volunteers apply and earn points, and admins govern seasons and verify organizations. |
| **Impact** | Encourages youth volunteerism by gamifying participation (leagues: Bronze → Silver → Gold → Platinum), providing verifiable completion records, and giving organizations a structured pipeline. |

---

## Key Features

| Feature | Roles | Evidence |
|---|---|---|
| Email/password + Google OAuth signup with role selection | All | `src/lib/actions/auth.ts`, `src/app/(auth)/` |
| Role-based middleware (route protection + redirects) | All | `src/middleware.ts` |
| Opportunity CRUD + status lifecycle (draft→open→closed→cancelled→completed) | Org | `src/services/opportunities.ts`, `src/lib/actions/opportunities.ts` |
| Volunteer feed with filters (city, category, date, points) | Vol | `src/app/(volunteer)/feed/` |
| Apply / withdraw with eligibility checks and capacity enforcement | Vol | `src/services/applications.ts`, RPC `fn_apply_to_opportunity` |
| Candidate management: accept / waitlist / reject / promote | Org | `src/app/(org)/org/opportunities/[id]/candidates/` |
| Completion marking (completed / no-show) with points & hours | Org | RPC `fn_mark_completion`, table `completion_records` |
| League system (Bronze→Platinum) with season points | Vol | `volunteer_profiles.league`, `volunteer_profiles.season_points` |
| Season management + automated rollover (pg_cron daily) | Admin | RPC `fn_start_season`, `fn_run_season_rollover`, cron job |
| Organization verification gate | Admin | RPC `fn_verify_organization`, RLS `opp_insert` requires verified |
| Notifications (status changes, cancellations, completions) | All | table `notifications`, `src/lib/actions/notifications.ts` |
| Audit logging | Admin | table `audit_logs`, `src/app/(admin)/admin/audit/` |
| Configurable rules (penalties, promotion thresholds, caps) | Admin | table `config` (6 keys), `src/lib/actions/admin.ts` |
| Row-Level Security on every table (27 policies) | — | DB: 27 RLS policies across 11 tables |
| Cron: auto-close expired opportunities | — | `src/app/api/cron/close-expired/route.ts`, RPC `fn_close_expired_opportunities` |
| Dark/light theme | All | `next-themes`, `src/components/ui/ThemeToggle.tsx` |

### Not Implemented / Out of Scope

- **Telegram bot** — not present in codebase
- **Certificate PDF generation** — upload endpoint exists (`src/lib/actions/certificates.ts`) but no auto-generation
- **Search / full-text search** — no search implementation
- **Automated tests** — no test files; SQL smoke tests exist in migration `20260218181046_smoke_tests`
- **i18n** — English UI only
- **AI/ML model** — no AI component; the project is a full-stack CRUD platform

---

## Quickstart

```bash
git clone <REPO_URL> && cd v-league
# Create .env.local with: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL, CRON_SECRET
npm install
npm run dev          # http://localhost:3000
```

**Database**: The project uses a hosted Supabase instance. All schema is managed via 40 migrations applied through the Supabase dashboard. No local `supabase/` CLI directory is present — migrations live in the Supabase cloud project.

**Demo accounts**: Create accounts via `/auth/register` selecting each role (volunteer, organization). An admin account must be manually set in the `profiles` table (`role = 'admin'`).

---

## Demo Scenarios (end-to-end)

### Flow 1: Volunteer Journey
1. Register as volunteer → redirected to `/feed`
2. Browse open opportunities → apply (with optional message)
3. View application status at `/applications`
4. Get accepted by org → notification appears
5. After event: org marks completion → points + hours awarded
6. Check leaderboard at `/leaderboard`

### Flow 2: Organization Journey
1. Register as organization → see "unverified" lock screen
2. Admin verifies org → lock lifts
3. Create opportunity (draft) → publish (open)
4. Review candidates → accept / waitlist / reject
5. After event: mark each accepted volunteer as completed or no-show
6. Close or complete the opportunity

### Flow 3: Admin Journey
1. Login as admin → `/admin/dashboard` (stats, pending verifications)
2. Verify/unverify organizations at `/admin/organizations`
3. Start a new season at `/admin/seasons`
4. View audit trail at `/admin/audit`
5. Update config (penalties, promotion rules) at dashboard

---

## CRUDL Summary

| Entity | Create | Read | Update | Delete | List |
|---|:---:|:---:|:---:|:---:|:---:|
| Opportunities | Org | All | Org | Org (draft only) | All (feed) / Org (own) |
| Applications | Vol (apply) | Vol+Org | Org (status) / Vol (withdraw) | — | Vol (own) / Org (candidates) |
| Volunteer Profiles | Auto (signup) | Vol+Org+Admin | Vol (own) | — | Admin / Leaderboard |
| Organization Profiles | Auto (signup) | All | Org (own) / Admin (verify) | — | Admin |
| Notifications | System (triggers) | Own user | Own (mark read) | — | Own user |
| Seasons | Admin | All | Admin (rollover) | Admin | Admin |
| Config | Admin | All | Admin | Admin | Admin |
| Audit Logs | System (RPCs) | Admin | — | — | Admin |
| Completion Records | Org (mark) | Vol+Org | Org (pdf_url) | — | Vol (history) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS 4 |
| Backend | Supabase (Postgres 17, Auth, Storage, pg_cron) |
| Data access | Server Actions + Supabase RPC (no REST API layer) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Security | 27 RLS policies, SECURITY DEFINER functions with `auth.uid()`, middleware route guards |
| Deployment | Vercel (frontend) + Supabase Cloud (backend) |

---

## Repository Structure

```
src/
├── app/
│   ├── (auth)/auth/login|register/     # Auth pages
│   ├── (volunteer)/                     # Volunteer routes: feed, applications, profile, leaderboard, notifications
│   ├── (org)/org/                       # Org routes: dashboard, opportunities CRUD, candidates, profile
│   ├── (admin)/admin/                   # Admin routes: dashboard, seasons, organizations, users, audit
│   └── api/cron/close-expired/          # Cron endpoint
├── components/
│   ├── layout/                          # AppShell, Sidebar, TopNav
│   ├── shared/                          # OpportunityCard, NotificationList, OrgUnverifiedLock
│   └── ui/                              # 18 reusable UI components
├── lib/
│   ├── actions/                         # Server Actions (8 modules, ~40 exported functions)
│   ├── mappers.ts                       # DB row → domain type mappers
│   └── utils.ts                         # Date/time formatting, penalty calculation
├── services/                            # Service layer (opportunities, applications, seasons, notifications)
├── types/
│   ├── index.ts                         # Domain types
│   └── supabase.ts                      # Generated Supabase types
└── middleware.ts                         # Auth + role-based route protection
```

---

## Links

| | |
|---|---|
| GitHub | `https://github.com/Luneve/v-league/tree/main` |
| YouTube Demo | `https://www.youtube.com/watch?v=Sbz5fHiKNtA` |

---

## License

This project was built for the INFOMATRIX-ASIA 2026 competition. All code is original.
