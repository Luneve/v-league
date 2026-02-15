# Volunteer League

Production-ready volunteer management platform demonstrating comprehensive CRUDL operations with role-based access control, audit logging, and transactional business logic.

## Project Overview

A volunteer management platform where organizations create opportunities, volunteers apply and participate, and admins manage operations. The system tracks volunteer metrics (points, hours, strikes), implements competitive leagues with seasonal rollover, and maintains complete audit trails. Core capabilities include multi-role authentication, CRUDL operations across 11 entities, row-level security enforcement, automated notifications, PDF certificate management, and competitive leagues with seasonal promotion.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router with Server Actions) |
| **Runtime** | Node.js 25.2.1+ |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth (Email/Password + Google OAuth) |
| **Authorization** | Row Level Security (RLS) Policies |
| **Storage** | Supabase Storage (PDF certificates) |
| **Type Safety** | TypeScript 5 (Strict mode) |

## Architecture Overview

### Request Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│    Next.js Server Actions           │
│    • Authentication Check           │
│    • Business Logic Validation      │
│    • Data Transformation            │
└──────┬──────────────────┬───────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│RPC Functions│    │Direct Queries│
└──────┬──────┘    └──────┬───────┘
       │                  │
       └────────┬─────────┘
                ▼
      ┌──────────────────┐
      │Row Level Security│
      │Policy Enforcement│
      └────────┬─────────┘
               ▼
      ┌──────────────────┐
      │PostgreSQL Database│
      │ • Tables         │
      │ • Functions      │
      │ • Triggers       │
      │ • Indexes        │
      └──────────────────┘
```

### Separation of Concerns

**Presentation Layer** (`src/app/`) - Next.js pages, server-side rendering, client components

**Business Logic Layer** (`src/lib/actions/`) - Server Actions with authentication, validation, and RPC calls

**Data Access Layer** (Supabase) - Direct queries, RPC functions, RLS enforcement, database triggers

**Data Storage Layer** (PostgreSQL) - Normalized schema, custom enums, indexes, audit trails

### Role-Based Access Control

**Volunteer:** Read own profile/applications/notifications and public opportunities. Write own profile and applications. Cannot access other volunteers' private data or modify opportunities.

**Organization:** Read own profile/opportunities and candidates for own opportunities. Write own profile, opportunities (CRUD), candidate status changes, and completion marking. Cannot create opportunities until verified by admin.

**Admin:** Read all data including audit logs. Write organization verification, season management, and config updates. Access to all system-level operations.

## CRUDL Matrix

| Entity | Create | Read | Update | Delete | List |
|--------|--------|------|--------|--------|------|
| **Volunteer Profiles** | ✅ (signup) | ✅ (own/public) | ✅ (own) | ❌ | ❌ |
| **Organization Profiles** | ✅ (signup) | ✅ (own/all) | ✅ (own) | ❌ | ✅ (admin) |
| **Opportunities** | ✅ (verified orgs) | ✅ (all) | ✅ (own) | ✅ (draft only) | ✅ (filtered) |
| **Applications** | ✅ (volunteers) | ✅ (own/related) | ✅ (withdraw) | ❌ | ✅ (own/candidates) |
| **Completion Records** | ✅ (orgs) | ✅ (related) | ✅ (pdf_url) | ❌ | ✅ (history) |
| **Notifications** | ✅ (system) | ✅ (own) | ✅ (mark read) | ❌ | ✅ (own) |
| **Seasons** | ✅ (admin) | ✅ (all) | ✅ (admin) | ✅ (admin) | ✅ (all) |
| **Mini-Groups** | ✅ (system) | ✅ (all) | ❌ | ❌ | ✅ (leaderboard) |
| **Audit Logs** | ✅ (system) | ✅ (admin) | ❌ | ❌ | ✅ (admin) |
| **Config** | ✅ (admin) | ✅ (all) | ✅ (admin) | ✅ (admin) | ✅ (all) |

## Database Schema

### Core Tables

**profiles** - Base table for all users (FK to auth.users). Contains role enum (volunteer/organization/admin) and timestamps.

**volunteer_profiles** - Extended volunteer data including first/last name, city, DOB, bio, avatar, league (bronze/silver/gold/platinum), season_points (reset per season), lifetime_hours (cumulative), and strikes (penalty counter). References profiles.

**organization_profiles** - Extended organization data including name, about, city, links (JSONB), contacts (JSONB), verification status, verified_at, and verified_by (admin FK). References profiles.

**opportunities** - Volunteer opportunities with title, description, category, city, dates/times, planned_hours (generated column), capacity (CHECK > 0), age_restriction (16/18), contacts (JSONB), points_reward, and status enum (draft/open/closed/cancelled/completed). References organization_profiles.

**applications** - Volunteer applications with volunteer_id, opportunity_id, optional message, status enum (applied/waitlist/accepted/rejected/withdrawn/completed/no_show), and timestamps. UNIQUE constraint on (volunteer_id, opportunity_id). References volunteer_profiles and opportunities.

**application_status_history** - Audit trail for application status changes. Populated automatically via trigger. Contains application_id, status, changed_at, changed_by.

**completion_records** - Final outcome tracking with result (completed/no_show), points_awarded, hours_awarded, penalty_applied, strike_applied, and optional pdf_url. UNIQUE constraint on application_id. References applications, opportunities, volunteer_profiles.

**notifications** - In-app notifications with user_id, type enum (status_change/update/cancellation/completion/penalty/strike), title, body, link_to, is_read, and created_at. References profiles.

**seasons** - Season management with start_date, end_date, duration_days enum (30/60/90/120), is_active (only one active at a time). Used for competitive league tracking.

**mini_groups** - Competition groups within leagues. Contains season_id, league enum. Volunteers compete within their league's mini-groups.

**mini_group_members** - Volunteer assignment to mini-groups. UNIQUE constraint on (volunteer_id, season_id). References mini_groups, volunteer_profiles, seasons.

**audit_logs** - System-wide audit trail with actor_id, actor_role, action, target_type, target_id, details (JSONB), created_at. Admin-only read access.

**config** - System configuration key-value store with key (PK), value (JSONB), description, updated_at. Used for points/penalty configuration.

**Key Constraints:** Foreign keys with CASCADE/RESTRICT rules, UNIQUE constraints for business rules (one application per volunteer per opportunity), CHECK constraints (capacity > 0, age_restriction IN (16,18)), enum types for type safety, generated columns for calculated fields (planned_hours).

**Indexes:** Composite indexes on common query patterns (volunteer/opportunity/status combinations), single-column indexes on all foreign keys, unique indexes on business constraints. Result: sub-millisecond query performance for typical operations.

Full schema details available in 22 migration files in the migrations directory.

## API Endpoints

The system uses Next.js Server Actions (`src/lib/actions/*.ts`) instead of REST routes.

**Authentication** - `signUpVolunteer`, `signUpOrganization`, `signIn`, `signInWithGoogle`, `signOut`, `getSession`

**Profiles** - `getVolunteerProfile`, `updateVolunteerProfile`, `getPublicVolunteerProfile`, `getOrganizationProfile`, `updateOrganizationProfile`

**Opportunities** - `listOpportunities` (with filters), `getOpportunity`, `createOpportunity` (verified orgs only), `updateOpportunity`, `deleteOpportunity` (draft only), `updateOpportunityStatus`, `cancelOpportunity`

**Applications** - `applyToOpportunity`, `withdrawApplication`, `listMyApplications`, `listCandidates`, `acceptCandidate`, `waitlistCandidate`, `rejectCandidate`, `promoteFromWaitlist`, `markCompletion`, `getApplicationStatusHistory`

**Notifications** - `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `getUnreadCount`

**Certificates** - `getCompletedHistory`, `uploadCertificatePdf`, `getCertificatePdfUrl`

**Seasons** - `getCurrentSeason`, `listSeasons`, `getMyMiniGroup`, `getLeaderboard`

**Admin** - `verifyOrganization`, `unverifyOrganization`, `listOrganizations`, `listUsers`, `createSeason`, `triggerSeasonRollover`, `getAuditLogs`, `updateConfig`, `getConfig`, `getAllConfig`

All endpoints return `{ data, error }` structure. Authentication handled via Supabase session cookies. Authorization enforced via RLS policies.

## End-to-End Flow Example

**Complete Volunteer Participation Lifecycle:**

1. **Volunteer Signup** - User registers via `signUpVolunteer()`. System creates `profiles` record (role: volunteer) and `volunteer_profiles` record (league: bronze, season_points: 0, lifetime_hours: 0).

2. **Organization Creates Opportunity** - Verified organization calls `createOpportunity()`. System validates organization verification status via RLS, creates opportunity record with status: draft.

3. **Organization Opens Opportunity** - Organization calls `updateOpportunityStatus(id, "open")`. System validates capacity and deadlines, updates status.

4. **Volunteer Applies** - Volunteer calls `applyToOpportunity(oppId, message)`. System validates: (a) opportunity is open, (b) no time overlap with accepted applications, (c) capacity not exceeded. Creates application record with status: applied. Trigger populates `application_status_history`. System sends notification to organization.

5. **Organization Accepts** - Organization calls `acceptCandidate(appId)`. System validates capacity, updates application status to accepted. Trigger logs status change. System sends notification to volunteer.

6. **Event Completion** - Organization calls `markCompletion(appId, "completed")`. RPC function: (a) creates completion_record, (b) adds points_reward to volunteer's season_points, (c) adds planned_hours to volunteer's lifetime_hours, (d) creates audit log entry, (e) sends notification to volunteer, (f) updates application status to completed.

7. **Season Rollover** - Admin triggers `triggerSeasonRollover()`. System: (a) ranks volunteers within mini-groups, (b) promotes top performers (+1 league max), (c) resets all season_points to 0, (d) creates new season, (e) assigns volunteers to new mini-groups based on updated leagues.

**Key Technical Points:** All state changes are transactional via RPC functions. Audit logs capture actor, action, target, and before/after snapshots. RLS policies enforce authorization at every data access. Triggers ensure audit trail completeness without application-level coordination.

## Environment Setup

### Prerequisites

- Node.js 25.x or higher
- npm 10.x or higher
- Supabase account

### Installation

```bash
git clone <repository-url>
cd v-league
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get credentials: Create Supabase project → Project Settings → API → Copy URL and anon key.

### Database Setup

Apply 22 migrations sequentially via Supabase CLI or SQL Editor. Migrations cover enums, tables, functions, RLS policies, indexes, triggers, and storage buckets. Verify RLS is enabled on all tables.

### Running

```bash
npm run dev      # Development mode at http://localhost:3000
npm run build    # Production build
npm start        # Production server
npm run lint     # Code linting
```

## Design Decisions

### Stack Selection

**Next.js Server Actions** provide type-safe API calls without REST boilerplate, automatic request deduplication, and simplified authentication (session cookies handled automatically).

**Supabase** offers PostgreSQL with full relational integrity, built-in authentication with OAuth, Row Level Security for database-level authorization, integrated file storage, and no additional infrastructure.

**TypeScript Strict Mode** enables compile-time error detection, auto-generated types from database schema, and reduced runtime errors.

### Multi-Layer Authorization

Authorization enforced at three levels: (1) Application layer validates authentication and business rules with fast feedback, (2) RLS policies provide security guarantee preventing privilege escalation, (3) Database functions ensure atomic state changes with validation. Defense in depth approach prevents bypasses.

### Validation Strategy

**Database Constraints** - Type safety via enums, foreign key integrity, check constraints (capacity > 0), unique constraints (one application per volunteer per opportunity).

**Business Logic** - Time overlap detection, capacity enforcement, withdrawal deadline checks, organization verification gates.

**Generated Fields** - Auto-calculated planned_hours, auto-updated timestamps via triggers. Prevents data inconsistency.

### Database Design

**Referential Integrity** - All foreign keys with appropriate CASCADE/RESTRICT rules prevent orphaned records.

**Indexes** - Composite indexes on query patterns, foreign key indexes, unique indexes on business constraints enable sub-millisecond queries.

**Triggers** - Auto-populate application_status_history, audit_logs, and notifications ensure audit trail completeness without application coordination.

**Enums vs Strings** - PostgreSQL enums provide type safety, storage efficiency, and indexing performance. Trade-off: schema migration needed to add values (acceptable for stable domains).

## Known Limitations

- **Offset-based pagination** for opportunities (cursor-based would be more efficient for large datasets)
- **No real-time updates** (status changes require refresh; Supabase Realtime available but not implemented)
- **No email notifications** (only in-app; integration recommended for critical events)
- **Manual season rollover** (cron job requires Supabase Pro plan activation)
- **No application-level rate limiting** (relies on Supabase built-in protections)

## Future Improvements

- Add PostgreSQL full-text search for opportunities and organizations
- Enable Supabase Realtime channels for live status updates
- Integrate transactional emails via Supabase Edge Functions or external service
- Implement Redis caching for leaderboards and active season data
- Add comprehensive testing suite (unit tests for RPC functions, integration tests for critical flows, RLS policy tests)
- Add application-level rate limiting and CAPTCHA for signup

## Contact

For technical questions, refer to commit history and inline code documentation.
