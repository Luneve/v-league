# Volunteer League

Production-ready volunteer management platform demonstrating comprehensive CRUDL operations with role-based access control, audit logging, and transactional business logic.

## Project Overview

A volunteer management platform where organizations create opportunities, volunteers apply and participate, and admins manage platform operations. The system tracks volunteer metrics (points, hours, strikes), implements competitive leagues with seasonal rollover, and maintains complete audit trails.

**Core Capabilities:**
- Multi-role authentication (volunteer, organization, admin)
- CRUDL operations across 11 entities
- Row-level security enforcement
- Real-time application status tracking
- Automated notifications
- PDF certificate management
- Competitive leagues with seasonal promotion

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router with Server Actions) |
| **Runtime** | Node.js 25.2.1+ |
| **Database** | PostgreSQL (via Supabase) |
| **Query Builder** | Supabase Client SDK 2.95.3 |
| **Authentication** | Supabase Auth (Email/Password + Google OAuth) |
| **Authorization** | Row Level Security (RLS) Policies |
| **Storage** | Supabase Storage (PDF certificates) |
| **Type Safety** | TypeScript 5 (Strict mode) |
| **Validation** | Database constraints + business logic functions |

## Architecture Overview

### Request Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────────────┐
│        Next.js Server Actions               │
│  (src/lib/actions/*.ts)                     │
│                                             │
│  • Authentication Check                     │
│  • Business Logic Validation                │
│  • Data Transformation                      │
└──────┬──────────────────────────────────┬──┘
       │                                   │
       │ Supabase Client                   │
       ▼                                   ▼
┌─────────────────┐              ┌─────────────────┐
│  RPC Functions  │              │  Direct Queries │
│  (Database)     │              │  (Supabase SDK) │
└────────┬────────┘              └────────┬────────┘
         │                                │
         └───────────┬────────────────────┘
                     ▼
         ┌───────────────────────┐
         │   Row Level Security  │
         │   Policy Enforcement  │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   PostgreSQL Database │
         │   • Tables            │
         │   • Functions         │
         │   • Triggers          │
         │   • Indexes           │
         └───────────────────────┘
```

### Separation of Concerns

**Presentation Layer** (`src/app/`)
- Next.js App Router pages
- Server-side rendering
- Client components

**Business Logic Layer** (`src/lib/actions/`)
- Server Actions (marked with `"use server"`)
- Authentication and authorization
- Data validation and transformation
- RPC function calls for complex operations

**Data Access Layer** (Supabase)
- Direct table queries via Supabase SDK
- RPC functions for transactional operations
- Row Level Security for authorization
- Database triggers for automation

**Data Storage Layer** (PostgreSQL)
- Normalized schema with referential integrity
- Custom enums for type safety
- Indexes for query optimization
- Audit trail via triggers

### Role-Based Access Control

The system implements three distinct roles with RLS enforcement:

**Volunteer:**
- Read: Own profile, own applications, open opportunities, own notifications
- Write: Own profile, own applications (create/update/delete)
- Cannot: Access other volunteers' private data, modify opportunities

**Organization:**
- Read: Own profile, own opportunities, candidates for own opportunities, volunteer public profiles
- Write: Own profile, own opportunities (CRUD), candidate status changes, completion marking
- Cannot: Create opportunities if not verified, access admin functions
- **Verification Gate:** Organizations are restricted from write operations until admin verification

**Admin:**
- Read: All data, audit logs
- Write: Organization verification, season management, config updates
- Special: Access to audit logs and system-level operations

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
| **Mini-Group Members** | ✅ (system) | ✅ (all) | ❌ | ❌ | ✅ (via groups) |
| **Audit Logs** | ✅ (system) | ✅ (admin) | ❌ | ❌ | ✅ (admin) |
| **Config** | ✅ (admin) | ✅ (all) | ✅ (admin) | ✅ (admin) | ✅ (all) |

**Legend:**
- ✅ Fully implemented
- ❌ Not supported (by design)
- `(role)` Access restricted to role
- `(own)` User can only access their own data
- `(related)` User can access data related to their activities

## Database Schema

### Core Entities

#### profiles
Base table for all users. Referenced by auth.users.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK, FK → auth.users.id |
| role | app_role | enum: volunteer, organization, admin |
| created_at | timestamptz | Account creation timestamp |
| updated_at | timestamptz | Last profile update |

**Relationships:** Referenced by volunteer_profiles, organization_profiles

---

#### volunteer_profiles
Extended profile for volunteers with metrics and league data.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK, FK → profiles.id |
| first_name | text | Required |
| last_name | text | Required |
| nickname | text | Optional display name |
| city | text | Required for filtering |
| date_of_birth | date | Age verification |
| bio | text | About me section |
| avatar_url | text | Profile picture URL |
| league | league | enum: bronze, silver, gold, platinum |
| season_points | integer | Reset per season |
| lifetime_hours | numeric | Cumulative across all seasons |
| strikes | integer | Penalty counter (no-shows) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:** 
- 1:N → applications
- 1:N → completion_records
- 1:N → mini_group_members

---

#### organization_profiles
Extended profile for organizations with verification status.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK, FK → profiles.id |
| name | text | Organization display name |
| about | text | Description |
| city | text | Required |
| links | jsonb | {instagram, website, tiktok, other} |
| contacts | jsonb | {telegram, phone} |
| verified | boolean | Admin verification status |
| verified_at | timestamptz | When verified |
| verified_by | uuid | FK → profiles.id (admin) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:**
- 1:N → opportunities

---

#### opportunities
Volunteer opportunities created by organizations.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| organization_id | uuid | FK → organization_profiles.id |
| title | text | Opportunity name |
| description | text | Full description |
| category | text | e.g., "helping people", "cleaning" |
| city | text | Location |
| apply_deadline | date | Application cutoff |
| start_date | date | Event start |
| end_date | date | Event end |
| start_time | time | Start time of day |
| end_time | time | End time of day |
| planned_hours | numeric | **Generated:** (end_time - start_time) / 3600 |
| capacity | integer | Max volunteers (CHECK > 0) |
| age_restriction | smallint | NULL or 16 or 18 |
| contacts | jsonb | {telegram, phone} |
| points_reward | integer | Points awarded on completion |
| status | opp_status | enum: draft, open, closed, cancelled, completed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Relationships:**
- N:1 → organization_profiles
- 1:N → applications
- 1:N → completion_records

**Constraints:**
- planned_hours ≤ 12 (enforced in business logic)
- capacity > 0

---

#### applications
Volunteer applications to opportunities.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| volunteer_id | uuid | FK → volunteer_profiles.id |
| opportunity_id | uuid | FK → opportunities.id |
| message | text | Optional note to organization |
| status | app_status | applied, waitlist, accepted, rejected, withdrawn, completed, no_show |
| applied_at | timestamptz | Application timestamp |
| updated_at | timestamptz | Last status change |

**Relationships:**
- N:1 → volunteer_profiles
- N:1 → opportunities
- 1:N → application_status_history
- 1:1 → completion_records

**Constraints:**
- UNIQUE(volunteer_id, opportunity_id) — one application per opportunity per volunteer

---

#### completion_records
Final outcome tracking for completed/no-show events.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| application_id | uuid | FK → applications.id (UNIQUE) |
| opportunity_id | uuid | FK → opportunities.id |
| volunteer_id | uuid | FK → volunteer_profiles.id |
| marked_by | uuid | FK → profiles.id (org actor) |
| result | text | "completed" or "no_show" |
| points_awarded | integer | Points added to season_points |
| hours_awarded | numeric | Hours added to lifetime_hours |
| penalty_applied | integer | Negative points for no-show |
| strike_applied | integer | 0 or 1 |
| pdf_url | text | Optional certificate path |
| created_at | timestamptz | |

---

#### notifications
In-app notification system.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| type | notif_type | status_change, update, cancellation, completion, penalty, strike |
| title | text | Notification headline |
| body | text | Full message |
| link_to | text | Optional deep link |
| is_read | boolean | Read status |
| created_at | timestamptz | |

---

#### seasons
Season management for competitive periods.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| start_date | date | Season start |
| end_date | date | Season end |
| duration_days | season_duration | enum: 30, 60, 90, 120 |
| is_active | boolean | Only one active at a time (enforced) |
| created_at | timestamptz | |

---

#### audit_logs
System-wide audit trail.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| actor_id | uuid | FK → profiles.id |
| actor_role | app_role | volunteer, organization, admin |
| action | text | e.g., "accept_candidate" |
| target_type | text | e.g., "application" |
| target_id | uuid | Entity ID |
| details | jsonb | Before/after snapshot |
| created_at | timestamptz | |

---

### Indexes

Key indexes for query optimization:

```
applications:         idx_app_vol, idx_app_opp, idx_app_status, uq_vol_opp
opportunities:        idx_opp_org, idx_opp_status, idx_opp_city, idx_opp_dates, idx_opp_category, idx_opp_points
volunteer_profiles:   idx_vp_league, idx_vp_city
organization_profiles: idx_op_verified, idx_op_city
completion_records:   idx_cr_volunteer, idx_cr_opp
notifications:        idx_notif_user_read, idx_notif_created
audit_logs:           idx_audit_actor, idx_audit_target, idx_audit_action, idx_audit_created
```

## API Endpoints

The system uses **Next.js Server Actions** instead of REST API routes. All actions are located in `src/lib/actions/`.

### Key Endpoints

**Authentication** (`auth.ts`)
- `signUpVolunteer(data)` - Register volunteer account
- `signUpOrganization(data)` - Register organization account
- `signIn(email, password)` - Email/password authentication
- `signInWithGoogle()` - OAuth authentication
- `signOut()` - Session termination

**Profiles** (`profiles.ts`)
- `getVolunteerProfile()` - Get own volunteer profile
- `updateVolunteerProfile(fields)` - Update own profile
- `getPublicVolunteerProfile(id)` - View public volunteer data
- `getOrganizationProfile()` - Get own organization profile
- `updateOrganizationProfile(fields)` - Update own org profile

**Opportunities** (`opportunities.ts`)
- `listOpportunities(filters)` - List with filtering/pagination
- `getOpportunity(id)` - Get single opportunity
- `createOpportunity(fields)` - Create (verified orgs only)
- `updateOpportunity(id, fields)` - Update own opportunity
- `deleteOpportunity(id)` - Delete draft opportunity
- `updateOpportunityStatus(id, status)` - Change status
- `cancelOpportunity(id)` - Cancel with notifications

**Applications** (`applications.ts`)
- `applyToOpportunity(opportunityId, message)` - Submit application
- `withdrawApplication(applicationId)` - Withdraw before start
- `listMyApplications(filters)` - Volunteer view
- `listCandidates(opportunityId, status)` - Organization view
- `acceptCandidate(applicationId)` - Accept application
- `waitlistCandidate(applicationId)` - Move to waitlist
- `rejectCandidate(applicationId)` - Reject application
- `promoteFromWaitlist(applicationId)` - Promote to accepted
- `markCompletion(applicationId, result)` - Mark completed/no-show

**Notifications** (`notifications.ts`)
- `listNotifications(filters)` - List own notifications
- `markNotificationRead(id)` - Mark single as read
- `markAllNotificationsRead()` - Mark all as read
- `getUnreadCount()` - Get unread count

**Admin** (`admin.ts`)
- `verifyOrganization(orgId)` - Unlock organization
- `unverifyOrganization(orgId)` - Lock organization
- `listOrganizations(filters)` - View all organizations
- `listUsers(filters)` - View all users
- `createSeason(startDate, durationDays)` - Create new season
- `triggerSeasonRollover()` - End season and promote volunteers
- `getAuditLogs(filters)` - View audit trail
- `updateConfig(key, value)` - Update system config

For complete API documentation including request/response schemas, see inline TypeScript definitions in `src/lib/actions/*.ts`.

## Environment Setup

### Prerequisites

- Node.js 25.x or higher
- npm 10.x or higher
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd v-league

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**How to get Supabase credentials:**

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the Project URL and anon/public key
4. Apply the database migrations

### Database Setup

The database schema is managed via 22 Supabase migrations covering:
- Enums and base tables
- Profile tables (volunteer, organization)
- Core entities (opportunities, applications, completion records)
- Supporting tables (seasons, mini-groups, notifications, audit logs)
- Helper functions and RPC procedures
- RLS policies for authorization
- Indexes for performance
- Storage buckets for certificates
- Database triggers for automation

To set up:

1. Connect to your Supabase project
2. Use the Supabase CLI or SQL Editor to run migrations sequentially
3. Verify tables are created with RLS enabled

### Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Application runs at `http://localhost:3000`.

## Quick API Testing

### Testing with Supabase Studio

Navigate to your Supabase project and use the SQL Editor:

```sql
-- Test volunteer application
SELECT fn_apply_to_opportunity(
  p_opportunity_id := '<opportunity-uuid>',
  p_message := 'I am interested in volunteering'
);

-- Test accepting a candidate
SELECT fn_accept_candidate(
  p_application_id := '<application-uuid>'
);

-- Test marking completion
SELECT fn_mark_completion(
  p_application_id := '<application-uuid>',
  p_result := 'completed'
);
```

### Testing with Thunder Client

Since Server Actions are designed for Next.js components, you need a test API wrapper.

**Example Test Route** (`src/app/api/test-action/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as actions from '@/lib/actions';

export async function POST(req: NextRequest) {
  const { action, params } = await req.json();
  const result = await actions[action](...Object.values(params));
  return NextResponse.json(result);
}
```

**Example Request:**

```http
POST http://localhost:3000/api/test-action
Content-Type: application/json

{
  "action": "applyToOpportunity",
  "params": {
    "opportunityId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "I have experience with community outreach"
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "volunteer_id": "770e8400-e29b-41d4-a716-446655440002",
    "opportunity_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "applied",
    "applied_at": "2026-02-16T10:30:00Z"
  },
  "error": null
}
```

### Testing Authentication Flow

1. **Volunteer Registration:**
   - Navigate to `/auth/signup/volunteer`
   - Submit form with required fields
   - Verify `profiles` and `volunteer_profiles` created
   - Check `league` defaults to `bronze`

2. **Organization Registration:**
   - Navigate to `/auth/signup/organization`
   - Submit form
   - Verify `verified: false` in database
   - Attempt to create opportunity (should fail with RLS error)

3. **Admin Verification:**
   - Call `verifyOrganization(orgId)` as admin
   - Verify `verified: true` set
   - Organization can now create opportunities

### Testing Business Logic

**Time Overlap Prevention:**
1. Create opportunity A: 2026-03-01, 10:00-12:00
2. Create opportunity B: 2026-03-01, 11:00-13:00
3. Volunteer applies to A, gets accepted
4. Volunteer attempts to apply to B
5. Expected: Error "Time overlap detected"

**Capacity Enforcement:**
1. Create opportunity with capacity: 2
2. Three volunteers apply
3. Accept first two volunteers
4. Attempt to accept third
5. Expected: Error "Capacity reached"

**Verification Gate:**
1. Unverified organization attempts to create opportunity
2. Expected: RLS policy blocks with permission error
3. Admin verifies organization
4. Organization successfully creates opportunity

## Design Decisions

### Stack Selection

**Next.js App Router + Server Actions**
- Type-safe API calls without REST boilerplate
- Automatic request deduplication
- Streaming and progressive enhancement support
- Simplified authentication flow (session cookies handled automatically)

**Supabase**
- PostgreSQL with full relational integrity
- Built-in authentication with OAuth providers
- Row Level Security for authorization at database level
- Real-time subscriptions (not used in current implementation but available)
- Integrated file storage for PDFs
- No additional infrastructure needed

**TypeScript Strict Mode**
- Compile-time error detection
- Auto-generated types from database schema
- Improved developer experience with IntelliSense
- Reduced runtime errors

### Role-Based Checks at Multiple Layers

Authorization is enforced at three levels:

**1. Application Layer (Server Actions)**
- Authentication check via `supabase.auth.getUser()`
- Business logic validation (e.g., verified organization check)
- Input sanitization and transformation

**2. Database RLS Policies**
- Final authorization enforcement
- Cannot be bypassed by direct database access
- Prevents privilege escalation attacks
- Example: Organizations can only update their own opportunities

**3. Database Functions (RPC)**
- Complex transactional operations
- Atomic state changes with validation
- Example: `fn_accept_candidate()` checks capacity, updates application status, creates audit log, and sends notification

**Rationale:** Defense in depth. Application layer provides fast feedback, RLS policies provide security guarantee, database functions ensure data consistency.

### Validation Strategy

**Database Constraints**
- Type safety via enums (`app_role`, `app_status`, `opp_status`, `league`)
- Foreign key integrity (all relationships enforced)
- Check constraints (e.g., `capacity > 0`, `age_restriction IN (16, 18)`)
- Unique constraints (e.g., one application per volunteer per opportunity)

**Business Logic Validation**
- Time overlap detection in `fn_apply_to_opportunity()`
- Capacity enforcement in `fn_accept_candidate()`
- Withdrawal deadline check in `fn_withdraw_application()`
- Organization verification check before opportunity creation

**Generated Fields**
- `planned_hours` auto-calculated from time range
- `updated_at` auto-updated via triggers
- Prevents data inconsistency from manual entry

**Rationale:** Database constraints prevent invalid states at storage level. Business logic enforces domain rules. Generated fields eliminate manual calculation errors.

### Database Constraints Strategy

**Referential Integrity**
- All foreign keys use `ON DELETE` rules (mostly `CASCADE` or `RESTRICT`)
- Orphaned records prevented at database level
- Example: Deleting an opportunity cascades to applications

**Indexes**
- Composite indexes on common query patterns (e.g., `idx_app_vol_status`)
- Single-column indexes on foreign keys
- Unique indexes on business constraints
- Result: Sub-millisecond query performance for typical operations

**Triggers**
- `application_status_history` populated automatically on status change
- `audit_logs` created for sensitive operations
- Notification records generated on state transitions
- Rationale: Ensures audit trail completeness without relying on application code

**Enums vs Strings**
- PostgreSQL enums for fixed value sets
- Benefits: Type safety, storage efficiency, indexing performance
- Trade-off: Schema migration needed to add values (acceptable for stable domains)

## Known Limitations

1. **Offset-based Pagination:** Uses `OFFSET`/`LIMIT` for opportunities list. Cursor-based pagination would be more efficient for large datasets.

2. **No Real-time Updates:** Status changes require manual refresh. Supabase Realtime channels available but not implemented.

3. **No Email Notifications:** Only in-app notifications. Email integration recommended for critical events.

4. **Manual Season Rollover:** Cron job exists but requires Supabase Pro plan activation.

5. **Static Points Configuration:** Penalty/reward logic hardcoded in functions. Config table exists but not fully integrated.

6. **No Rate Limiting:** Relies on Supabase built-in protections. Application-level rate limiting recommended for production.

## Future Improvements

1. **Search Optimization:** Add PostgreSQL full-text search for opportunities and organizations
2. **Real-time Features:** Enable Supabase Realtime channels for live updates
3. **Email System:** Integrate transactional emails via Supabase Edge Functions
4. **Analytics Dashboard:** Add aggregate views for participation trends and completion rates
5. **Testing Suite:** Add unit tests for RPC functions, integration tests for critical flows, RLS policy tests
6. **Performance:** Implement Redis caching for leaderboards and active season data
7. **Security:** Add application-level rate limiting and CAPTCHA for signup

## License

Demonstration project for technical review purposes.

## Contact

For technical questions, refer to commit history and inline code documentation.
