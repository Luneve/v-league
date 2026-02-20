# INFOMATRIX-ASIA 2026 — AI Programming Submission

---

## 1. Title Page

| | |
|---|---|
| **Project** | V-League — Volunteer Management Platform |
| **Category** | AI Programming |
| **Team** | `Vibegod` |
| **School / City** | `Quantum STEM`, `Astana`, Kazakhstan |
| **Year** | 2026 |
| **GitHub** | `https://github.com/Luneve/v-league/tree/main` |
| **YouTube Demo** | `https://www.youtube.com/watch?v=Sbz5fHiKNtA` |

---

## 2. Table of Contents

1. [Title Page](#1-title-page)
2. [Table of Contents](#2-table-of-contents)
3. [Abstract](#3-abstract)
4. [Introduction](#4-introduction)
5. [Requirements & Design Goals](#5-requirements--design-goals)
6. [System Architecture](#6-system-architecture)
7. [Data Model & Security](#7-data-model--security)
8. [Core Algorithms / AI Components](#8-core-algorithms--ai-components)
9. [Implementation Details](#9-implementation-details)
10. [Testing / Quality](#10-testing--quality)
11. [Setup & Reproducibility](#11-setup--reproducibility)
12. [Originality, Code Skills, and Engineering Decisions](#12-originality-code-skills-and-engineering-decisions)
13. [Social Impact & Ethics](#13-social-impact--ethics)
14. [Limitations / Future Work](#14-limitations--future-work)
15. [References](#15-references)
16. [Submission Links](#16-submission-links)

---

## 3. Abstract

V-League is a full-stack volunteer management platform built with Next.js 16 (App Router, Server Actions), Supabase (Postgres 17, Auth, Storage, pg_cron), and TypeScript 5. It serves three roles — Volunteer, Organization, and Admin — through a gamified league system where volunteers earn points for completed service, climb league tiers (Bronze → Platinum) across configurable seasons, and compete on a leaderboard.

The engineering focus is on defense-in-depth security (middleware route guards + 27 Row-Level Security policies + SECURITY DEFINER RPCs using `auth.uid()`), atomic database operations (all multi-table mutations are single RPC transactions), and a zero-client-fetch architecture (Server Components fetch data; Server Actions handle mutations; no `useEffect` fetch-on-mount). The platform manages 11 tables, 1 materialized view, 17 PostgreSQL functions, 2 triggers, 2 pg_cron jobs, and 6 configurable rule parameters.

The system demonstrates production-grade engineering: role-based access control at three layers, automated lifecycle management (expired opportunity closure, season rollover), immutable audit logging, and a configurable rules engine that decouples business logic from code.

---

## 4. Introduction

### Problem

Volunteer coordination in Kazakhstan is fragmented. Organizations advertise on social media; volunteers discover opportunities by chance. There is no:
- Centralized discovery with filtering
- Application pipeline management
- Verifiable service hour tracking
- Engagement incentive beyond personal motivation

### Why It Matters

Structured volunteerism platforms exist in Western markets (VolunteerMatch, JustServing) but none target the Central Asian context with local language support potential, city-based filtering for Kazakh cities, and a gamification model designed for youth engagement.

### Our Approach

Build a three-role platform with:
1. **Strong data model** — PostgreSQL with RLS, not application-level auth checks
2. **Atomic operations** — RPC functions that cannot leave data in inconsistent state
3. **Configurable behavior** — business rules in a `config` table, not hardcoded
4. **Modern stack** — Next.js App Router with Server Actions (no REST API boilerplate)

---

## 5. Requirements & Design Goals

| # | Requirement | How We Addressed It |
|---|---|---|
| R1 | Three distinct user roles with isolated data access | `profiles.role` enum + middleware + RLS policies per table |
| R2 | Full opportunity lifecycle (draft → open → closed → completed/cancelled) | `opp_status` enum + `fn_set_opportunity_status` RPC with state machine validation |
| R3 | Application pipeline with status tracking | `app_status` enum (7 states) + `application_status_history` table + triggers |
| R4 | Gamification (points, leagues, seasons) | `volunteer_profiles.season_points/league` + `seasons` table + `fn_run_season_rollover` |
| R5 | Accountability for no-shows | `fn_mark_completion` applies configurable penalties from `config.no_show_penalty` |
| R6 | Admin governance | Verification gate, season management, audit logs, config CRUD |
| R7 | Security at every layer | Middleware (route), RLS (data), SECURITY DEFINER (operation) |
| R8 | No client-side fetch on mount | Server Components for data, Server Actions for mutations |
| R9 | Automated lifecycle management | pg_cron for rollover + Vercel cron for expired opportunity closure |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Volunteer│  │   Org    │  │  Admin   │  │   Auth   │           │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Pages   │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└───────┼──────────────┼──────────────┼──────────────┼────────────────┘
        │              │              │              │
┌───────┼──────────────┼──────────────┼──────────────┼────────────────┐
│       ▼              ▼              ▼              ▼    NEXT.JS     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE (src/middleware.ts)             │   │
│  │         Session refresh + Role-based route protection       │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │              SERVER COMPONENTS (page.tsx)                    │   │
│  │         Async data fetch via Supabase client                │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │              CLIENT COMPONENTS (client.tsx)                  │   │
│  │    Tabs, modals, toasts, forms — call Server Actions        │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │              SERVER ACTIONS (src/lib/actions/)               │   │
│  │    Thin wrappers → Service layer → Supabase RPC/queries     │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │              SERVICE LAYER (src/services/)                   │   │
│  │    Business logic, Supabase client calls, error handling    │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │              CRON ENDPOINT (src/app/api/cron/)               │   │
│  │    GET /api/cron/close-expired (CRON_SECRET protected)      │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────┐
│                             ▼           SUPABASE                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE AUTH                             │   │
│  │         Email/password + Google OAuth + JWT                 │   │
│  │         Trigger: handle_new_user → profiles + role profile  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    POSTGRES 17                               │   │
│  │                                                             │   │
│  │  Tables (11):  profiles, volunteer_profiles,                │   │
│  │    organization_profiles, opportunities, applications,      │   │
│  │    application_status_history, completion_records,           │   │
│  │    notifications, seasons, audit_logs, config               │   │
│  │                                                             │   │
│  │  View (1):  opportunities_with_counts                       │   │
│  │    (joins opp + org + applicant counts + effective_status)  │   │
│  │                                                             │   │
│  │  Functions (17):  RPCs for atomic business operations       │   │
│  │  Triggers (2):  application status history tracking         │   │
│  │  RLS Policies (27):  per-table, per-operation               │   │
│  │  Enums (6):  app_role, app_status, opp_status, league,     │   │
│  │              notif_type, season_duration                     │   │
│  │                                                             │   │
│  │  pg_cron (2 jobs):                                          │   │
│  │    Daily: fn_run_season_rollover()                          │   │
│  │    Weekly: notification cleanup (>90 days)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SUPABASE STORAGE                          │   │
│  │         Bucket: certificates (PDF uploads)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Key Files |
|---|---|---|
| Middleware | Session refresh, route protection, role-based redirects | `src/middleware.ts` |
| Server Components | Fetch data on the server (GET-only, no POST on load) | `src/app/**/page.tsx` |
| Client Components | Interactivity: forms, tabs, modals, toasts | `src/app/**/client.tsx` |
| Server Actions | Mutation entry points (POST on explicit user action) | `src/lib/actions/*.ts` (8 modules) |
| Service Layer | Supabase client calls, RPC invocations, error mapping | `src/services/*.ts` (4 modules) |
| Mappers | DB row → domain type conversion | `src/lib/mappers.ts` |
| Types | Domain types + generated Supabase types | `src/types/index.ts`, `src/types/supabase.ts` |
| Database | Tables, views, functions, triggers, RLS, cron | 40 Supabase migrations |

---

## 7. Data Model & Security

### Entity-Relationship Summary

```
auth.users (Supabase Auth)
    │
    ▼ (trigger: handle_new_user)
profiles (id, role)
    │
    ├──► volunteer_profiles (1:1, FK profiles.id)
    │       │
    │       └──► applications (volunteer_id FK)
    │               │
    │               ├──► application_status_history (application_id FK)
    │               └──► completion_records (application_id FK, unique)
    │
    ├──► organization_profiles (1:1, FK profiles.id)
    │       │
    │       └──► opportunities (organization_id FK)
    │               │
    │               ├──► applications (opportunity_id FK)
    │               └──► completion_records (opportunity_id FK)
    │
    ├──► notifications (user_id FK)
    └──► audit_logs (actor_id FK)

seasons (standalone, admin-managed)
config (standalone, admin-managed)
```

### Row-Level Security (27 policies)

All 11 tables have RLS enabled. Policy summary:

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own + admin | — (trigger) | Own | — |
| `volunteer_profiles` | Own + admin + org (if applicant) | Own (volunteer role) | Own | — |
| `organization_profiles` | All (public) | Own (org role) | Own | — |
| `opportunities` | Open/closed/completed (public) + own org + admin | Own org (verified only) | Own org (verified) | Own org (draft only) |
| `applications` | Own vol + own org's opps + admin | — (via RPC) | — (via RPC) | — |
| `application_status_history` | Related vol/org/admin | — (via trigger) | — | — |
| `completion_records` | Own vol + own org's opps + admin | — (via RPC) | Own org (pdf_url field) | — |
| `notifications` | Own user | — (via RPC) | Own user (is_read) | — |
| `seasons` | All (public) | Admin | Admin | Admin |
| `audit_logs` | Admin only | — (via RPC) | — | — |
| `config` | All (public) | Admin | Admin | Admin |

### Security Architecture (3 layers)

```
Layer 1: MIDDLEWARE (src/middleware.ts)
├── Unauthenticated → redirect to /auth/login
├── Volunteer accessing /org/* or /admin/* → redirect to /feed
├── Organization accessing /volunteer/* or /admin/* → redirect to /org/dashboard
└── Admin accessing /volunteer/* or /org/* → redirect to /admin/dashboard

Layer 2: ROW-LEVEL SECURITY (27 Postgres policies)
├── Every SELECT/INSERT/UPDATE/DELETE has a policy
├── Policies use auth.uid() and get_my_role() helper
└── Data isolation enforced at database level (cannot bypass via API)

Layer 3: SECURITY DEFINER RPCs (16 functions)
├── All business mutations go through RPCs
├── RPCs validate state transitions (e.g., can't accept if opportunity is closed)
├── RPCs use auth.uid() internally — no user_id parameter trust
└── search_path set to 'public' to prevent injection
```

---

## 8. Core Algorithms / AI Components

**Transparency note**: This project does not contain an AI/ML model, LLM integration, or neural network. The project focuses on full-stack software engineering with a PostgreSQL-centric architecture.

The algorithmic complexity lies in:

### 8.1 Season Rollover Algorithm (`fn_run_season_rollover`)

The rollover function executes atomically when a season ends:
1. Check if active season has ended (`end_at <= now()`)
2. Load promotion rules from `config` table (thresholds vary by group size)
3. For each league tier (bronze → platinum): rank volunteers by `season_points`
4. Promote top N volunteers to the next league (N depends on group size threshold)
5. Demote bottom volunteers if applicable
6. Reset `season_points` to 0 for all volunteers
7. Mark season as rolled over (`rollover_done_at = now()`)
8. Deactivate the season

### 8.2 Eligibility Check (`fn_can_apply`)

Returns a JSONB object with eligibility status:
- Is the opportunity open?
- Has the deadline passed?
- Is capacity full?
- Does the volunteer meet age restrictions?
- Has the volunteer already applied?
- Is the volunteer's organization (if any) the owner? (prevent self-apply)

### 8.3 Withdrawal Penalty Calculation (`src/lib/utils.ts: getWithdrawalPenalty`)

Tiered penalty based on hours before event start:
- Reads `withdrawal_penalty_tiers` from config
- Tiers ordered by `min_hours_before` descending
- First matching tier determines penalty points

### 8.4 Effective Status Computation (DB view)

The `opportunities_with_counts` view computes `effective_status`:
- If status is `cancelled` or `completed` → keep as-is
- If status is `draft` → keep as `draft`
- If `now() >= apply_deadline_at` → `closed`
- If `now() >= end_at` → `closed`
- Otherwise → use stored `status`

This ensures the UI always shows the real-time status without requiring a cron to update every row.

---

## 9. Implementation Details

### 9.1 Server Actions Architecture

The project uses a two-layer pattern:

```
Client Component → Server Action (src/lib/actions/) → Service (src/services/) → Supabase RPC/query
```

**Actions** (`src/lib/actions/`) are thin wrappers that:
- Are marked `"use server"`
- Re-export service functions
- Provide a stable API surface for client components

**Services** (`src/services/`) contain:
- Supabase client creation
- RPC calls and query construction
- Error handling and response mapping

This separation allows services to be reused across multiple actions and tested independently.

### 9.2 Module Inventory

| Module | File | Exported Functions | Tables/RPCs Used |
|---|---|---|---|
| Auth | `src/lib/actions/auth.ts` | 7 (signUp×2, signIn, signInWithGoogle, signOut, getSession, getProfile) | `auth.*`, `profiles` |
| Opportunities | `src/lib/actions/opportunities.ts` + `src/services/opportunities.ts` | 8 (canApply, list, get, create, update, delete, setStatus, cancel) | `opportunities`, `opportunities_with_counts`, RPCs: `fn_can_apply`, `fn_set_opportunity_status` |
| Applications | `src/lib/actions/applications.ts` + `src/services/applications.ts` | 10 (apply, withdraw, listMine, listCandidates, getHistory, accept, waitlist, reject, promote, markCompletion) | `applications`, RPCs: `fn_apply_to_opportunity`, `fn_set_application_status`, `fn_mark_completion` |
| Profiles | `src/lib/actions/profiles.ts` | 5 (getVol, updateVol, getPublicVol, getOrg, updateOrg) | `volunteer_profiles`, `organization_profiles` |
| Notifications | `src/lib/actions/notifications.ts` + `src/services/notifications.ts` | 4 (list, markRead, markAllRead, getUnreadCount) | `notifications`, RPC: `fn_mark_all_notifications_read` |
| Admin | `src/lib/actions/admin.ts` | 10 (verify/unverify org, listOrgs, listUsers, createSeason, triggerRollover, getAuditLogs, updateConfig, getConfig, getAllConfig) | `organization_profiles`, `profiles`, `audit_logs`, `config`, RPCs: `fn_verify_organization`, `fn_start_season`, `fn_run_season_rollover` |
| Seasons | `src/lib/actions/seasons.ts` + `src/services/seasons.ts` | 3 (getCurrent, list, getLeaderboard) | `seasons`, `volunteer_profiles` |
| Certificates | `src/lib/actions/certificates.ts` | 3 (getCompletedHistory, uploadPdf, getPdfUrl) | `completion_records`, Supabase Storage (`certificates` bucket) |

### 9.3 Route Structure

```
src/app/
├── (auth)/auth/
│   ├── login/page.tsx          # Email/password + Google OAuth
│   └── register/page.tsx       # Role selection + registration form
├── (volunteer)/
│   ├── feed/                   # page.tsx (server) + client.tsx → opportunity discovery
│   ├── applications/           # page.tsx + client.tsx → my applications list
│   ├── applications/[id]/      # page.tsx → application detail + status timeline
│   ├── opportunity/[id]/       # page.tsx + client.tsx → opportunity detail + apply
│   ├── profile/                # page.tsx + client.tsx → edit profile + stats
│   ├── profile/[id]/           # page.tsx → public volunteer profile
│   ├── leaderboard/            # page.tsx → season leaderboard
│   └── notifications/          # page.tsx + client.tsx → notification list
├── (org)/org/
│   ├── dashboard/              # page.tsx → org stats + recent activity
│   ├── opportunities/          # page.tsx + client.tsx → manage opportunities
│   ├── opportunities/new/      # page.tsx → create opportunity form
│   ├── opportunities/[id]/edit/# page.tsx → edit opportunity form
│   ├── opportunities/[id]/candidates/ # page.tsx + client.tsx → candidate management
│   └── profile/                # page.tsx + client.tsx → org profile editor
├── (admin)/admin/
│   ├── dashboard/              # page.tsx + client.tsx → admin overview
│   ├── seasons/                # page.tsx + client.tsx → season management
│   ├── organizations/          # page.tsx + client.tsx → org list + verification
│   ├── organizations/[id]/     # page.tsx → org detail + verify action
│   ├── users/                  # page.tsx → volunteer list
│   └── audit/                  # page.tsx → audit log viewer
└── api/cron/close-expired/     # route.ts → cron endpoint
```

### 9.4 UI Component Library

18 reusable UI components in `src/components/ui/`:

`Badge`, `Button`, `DateRangePicker`, `Drawer`, `EmptyState`, `FilterBar`, `Input`, `Modal`, `Pagination`, `Select`, `Skeleton`, `SurfaceCard`, `Table`, `Tabs`, `Textarea`, `ThemeToggle`, `TimeRangeInput`, `Toast`

3 shared components: `OpportunityCard`, `NotificationList`, `OrgUnverifiedLock`

3 layout components: `AppShell` (sidebar + top nav), `Sidebar` (role-based nav), `TopNav` (notifications + theme + avatar)

---

## 10. Testing / Quality

### Current State

- **No automated test suite** (no Jest, Vitest, Playwright, or Cypress configured)
- **SQL smoke tests** exist in migration `20260218181046_smoke_tests` — these validate database functions and constraints at migration time
- **TypeScript strict mode** provides compile-time type safety across the entire codebase
- **ESLint** configured with `eslint-config-next` for code quality
- **Generated Supabase types** (`src/types/supabase.ts`) ensure type-safe database queries

### Manual Testing Guide

| Test | Steps | Expected |
|---|---|---|
| Auth flow | Register → login → logout → login again | Redirects correctly per role |
| RLS isolation | Login as Vol A, try to access Vol B's applications | Only own data visible |
| Opportunity lifecycle | Create draft → publish → close → complete | Status transitions work, candidates required before complete |
| Capacity enforcement | Apply when capacity is full | Rejection with clear message |
| No-show penalty | Mark volunteer as no-show | Points deducted per config |
| Season rollover | Start season → wait for end → rollover triggers | Points reset, leagues adjusted |

### Quality Metrics

- **0 runtime dependencies** beyond React, Next.js, Supabase client, and next-themes (4 production deps)
- **40 database migrations** — incremental, ordered, each with a descriptive name
- **27 RLS policies** — every table protected
- **17 PostgreSQL functions** — business logic in the database, not scattered in application code

---

## 11. Setup & Reproducibility

### Prerequisites
- Node.js 18+
- A Supabase project (free tier sufficient)

### Installation

```bash
git clone <REPO_URL> && cd v-league
# Create .env.local with variables below
npm install
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL for OAuth redirects |
| `CRON_SECRET` | Yes | Bearer token for `/api/cron/close-expired` |

### Database Setup

The database schema is managed through 40 Supabase migrations applied via the Supabase dashboard. The migrations create:
- 11 tables with all constraints and indexes
- 1 view (`opportunities_with_counts`)
- 17 functions (RPCs + triggers + helpers)
- 2 triggers on the `applications` table
- 27 RLS policies
- 2 pg_cron jobs
- 1 storage bucket (`certificates`)
- 6 config entries with default values

### Creating Test Accounts

1. Register a **volunteer** at `/auth/register` (select "Volunteer")
2. Register an **organization** at `/auth/register` (select "Organization")
3. Create an **admin** by running in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
   ```
4. As admin: verify the organization at `/admin/organizations`
5. As org: create and publish an opportunity
6. As volunteer: apply to the opportunity

---

## 12. Originality, Code Skills, and Engineering Decisions

### Key Engineering Decisions

| Decision | Why | Alternative Considered |
|---|---|---|
| Server Actions instead of REST API | Eliminates API route boilerplate; type-safe end-to-end; no client-side fetch on mount | REST API with tRPC |
| RPC functions for mutations | Atomic transactions; business logic co-located with data; prevents partial state | Application-level transaction management |
| RLS instead of application-level auth checks | Defense-in-depth; cannot be bypassed even via direct DB access | Middleware-only auth |
| `config` table for business rules | Rules can be changed without deployment; A/B testable | Hardcoded constants |
| `effective_status` in view | Real-time status without cron dependency for every row | Cron job to update all statuses |
| Two-layer actions/services | Actions provide stable API; services are reusable and testable | Single-layer actions |
| Mappers (`src/lib/mappers.ts`) | Decouple DB schema from domain types; single place to update if schema changes | Inline mapping in every query |
| pg_cron for rollover | Runs in-database; no external scheduler dependency | Vercel cron calling an API endpoint |

### Code Quality Indicators

- **Minimal dependency footprint**: 4 production dependencies
- **Type safety**: Generated Supabase types + domain types + TypeScript strict mode
- **Consistent patterns**: Every page follows `page.tsx` (server fetch) + `client.tsx` (interactivity)
- **No N+1 queries**: All list views use joins or the `opportunities_with_counts` view
- **Parallel data fetching**: Independent queries use `Promise.all` in layouts and pages

### What Makes This More Than a CRUD App

1. **Gamification engine**: League tiers + season points + configurable promotion rules + automated rollover
2. **State machine enforcement**: Opportunity and application status transitions are validated in RPCs — invalid transitions are rejected
3. **Three-layer security**: Each layer independently prevents unauthorized access
4. **Audit trail**: Every significant action is logged with actor, role, target, and details
5. **Configurable penalties**: No-show and withdrawal penalties are data-driven, not hardcoded

---

## 13. Social Impact & Ethics

### Social Impact

- **Promotes youth volunteerism** by making opportunities discoverable and participation rewarding
- **Reduces coordination overhead** for organizations — structured pipeline instead of DM-based management
- **Creates accountability** — no-show tracking discourages uncommitted sign-ups, freeing spots for serious volunteers
- **Provides verifiable records** — completion records with hours and points serve as proof of service
- **Encourages sustained engagement** — league system and seasonal competition motivate continued participation

### Ethical Considerations

- **Data minimization**: Only essential personal data collected (name, city, DOB for age restrictions)
- **Transparency**: Audit logs visible to admins; status history visible to applicants
- **Fairness**: Capacity limits and age restrictions enforced uniformly; no hidden criteria
- **No dark patterns**: Withdrawal is always available (with transparent penalty disclosure)
- **Privacy**: RLS ensures volunteers cannot see other volunteers' applications or personal data

---

## 14. Limitations / Future Work

### Current Limitations

| Limitation | Details |
|---|---|
| No AI/ML component | Project is a full-stack CRUD platform; no model training or inference |
| No automated tests | SQL smoke tests only; no unit/integration/E2E test suite |
| No i18n | English UI only; Kazakh/Russian localization not implemented |
| No Telegram bot | Integration not present despite being a common channel in Kazakhstan |
| No email notifications | In-app notifications only |
| No certificate auto-generation | PDF upload exists but no auto-generation from templates |
| No full-text search | Filtering by category/city/date only; no keyword search |
| No seed script | Demo data must be created manually |
| No mobile app | Responsive web only |

### Future Work (if continued)

- AI-powered opportunity matching based on volunteer history and preferences
- Telegram bot for notifications and quick-apply
- Certificate PDF generation with QR code verification
- Kazakh/Russian language support
- Automated E2E tests with Playwright
- Analytics dashboard for organizations (conversion rates, retention)

---

## 15. References

| Resource | URL |
|---|---|
| Next.js 16 Documentation | https://nextjs.org/docs |
| Next.js Server Actions | https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations |
| Supabase Documentation | https://supabase.com/docs |
| Supabase Row-Level Security | https://supabase.com/docs/guides/database/postgres/row-level-security |
| Supabase Auth | https://supabase.com/docs/guides/auth |
| Supabase Storage | https://supabase.com/docs/guides/storage |
| PostgreSQL 17 PL/pgSQL | https://www.postgresql.org/docs/17/plpgsql.html |
| pg_cron | https://github.com/citusdata/pg_cron |
| React 19 | https://react.dev |
| Tailwind CSS 4 | https://tailwindcss.com/docs |
| TypeScript 5 | https://www.typescriptlang.org/docs |

All code is original. No code was copied from external projects or generated by AI tools. Third-party dependencies are limited to the 4 production packages listed in `package.json`.

---

## 16. Submission Links

| Item | Link |
|---|---|
| GitHub Repository | `<REPLACE_ME>` |
| YouTube Demo Video | `<REPLACE_ME>` |
| Live Demo | `<REPLACE_ME>` |
