# Volunteer League Backend — Initial Implementation

Production-ready backend implementation demonstrating comprehensive CRUDL operations for a volunteer management platform. This branch implements the complete backend architecture including database schema, business logic, role-based access control, and audit logging.

## Project Overview

This backend supports a volunteer management platform where:

- **Organizations** create and manage volunteer opportunities
- **Volunteers** apply to opportunities, track participation, and earn points/hours
- **Admins** verify organizations and manage platform operations

**CRUDL-Enabled Entities:**
- Volunteer Profiles
- Organization Profiles  
- Opportunities (Volunteer Posts)
- Applications (Volunteer → Opportunity)
- Completion Records (Certificates)
- Notifications
- Seasons & Mini-Groups
- Audit Logs

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
- **Verification Gate:** Organizations are restricted from all write operations until admin verification

**Admin:**
- Read: All data, audit logs
- Write: Organization verification, season management, config updates
- Special: Access to audit logs and system-level operations

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

**CRUDL:** ✅ Full (own profile only)

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

**CRUDL:** ✅ Create/Read/Update (own profile only)

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

**CRUDL:** ✅ Full (own opportunities only, verified orgs only)

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

**CRUDL:** ✅ Full (volunteers: own apps; orgs: view candidates)

---

#### application_status_history
Audit trail for application status changes.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| application_id | uuid | FK → applications.id |
| status | app_status | New status |
| changed_at | timestamptz | Timestamp |
| changed_by | uuid | FK → profiles.id (actor) |

**CRUDL:** ❌ Write-only (via trigger), Read for audit

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

**CRUDL:** ✅ Create (orgs), Read (volunteers + orgs), Update (pdf_url only)

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

**CRUDL:** ✅ Create (system), Read/Update (own notifications only)

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

**CRUDL:** ✅ Full (admin only)

---

#### mini_groups
Competition groups within leagues.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| season_id | uuid | FK → seasons.id |
| league | league | bronze, silver, gold, platinum |
| created_at | timestamptz | |

**CRUDL:** ✅ Read (all), Write (admin via functions)

---

#### mini_group_members
Volunteer assignment to mini-groups.

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| mini_group_id | uuid | FK → mini_groups.id |
| volunteer_id | uuid | FK → volunteer_profiles.id |
| season_id | uuid | FK → seasons.id |

**Constraints:**
- UNIQUE(volunteer_id, season_id) — one group per season per volunteer

**CRUDL:** ✅ Read (all), Write (admin/system)

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

**CRUDL:** ❌ Write-only (system), Read (admin only)

---

#### config
System configuration key-value store.

| Column | Type | Purpose |
|--------|------|---------|
| key | text | PK, e.g., "points_config" |
| value | jsonb | Configuration object |
| description | text | Human-readable purpose |
| updated_at | timestamptz | |

**CRUDL:** ✅ Read (all), Write (admin only)

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

The backend uses **Next.js Server Actions** instead of REST API routes. All actions are located in `src/lib/actions/`.

### Authentication (`auth.ts`)

#### Sign Up (Volunteer)
```typescript
signUpVolunteer(data: SignUpVolunteerData)
```
- **Auth Required:** No
- **Body:**
  ```typescript
  {
    email: string
    password: string
    firstName: string
    lastName: string
    city: string
    dateOfBirth: string  // YYYY-MM-DD
  }
  ```
- **Response:** `{ error: string | null }`

#### Sign Up (Organization)
```typescript
signUpOrganization(data: SignUpOrgData)
```
- **Auth Required:** No
- **Body:**
  ```typescript
  {
    email: string
    password: string
    orgName: string
    city: string
  }
  ```
- **Response:** `{ error: string | null }`

#### Sign In
```typescript
signIn(email: string, password: string)
```
- **Auth Required:** No
- **Response:** `{ error: string | null }`

#### Sign In with Google
```typescript
signInWithGoogle()
```
- **Auth Required:** No
- **Note:** Redirects to OAuth flow

#### Sign Out
```typescript
signOut()
```
- **Auth Required:** Yes
- **Note:** Clears session and redirects

#### Get Session
```typescript
getSession()
```
- **Auth Required:** Yes
- **Response:** `User | null`

---

### Profiles (`profiles.ts`)

#### Get Volunteer Profile (Own)
```typescript
getVolunteerProfile()
```
- **Auth Required:** Yes (volunteer)
- **Response:** `{ data: VolunteerProfile | null, error: string | null }`

#### Update Volunteer Profile
```typescript
updateVolunteerProfile(fields: UpdateFields)
```
- **Auth Required:** Yes (volunteer)
- **Body:** `{ first_name?, last_name?, nickname?, city?, date_of_birth?, bio?, avatar_url? }`
- **Response:** `{ data: VolunteerProfile | null, error: string | null }`

#### Get Public Volunteer Profile
```typescript
getPublicVolunteerProfile(volunteerId: string)
```
- **Auth Required:** Yes (any role)
- **Response:** `{ data: PublicVolunteerProfile | null, error: string | null }`
- **Note:** Returns limited fields (no strikes, no private data)

#### Get Organization Profile (Own)
```typescript
getOrganizationProfile()
```
- **Auth Required:** Yes (organization)
- **Response:** `{ data: OrganizationProfile | null, error: string | null }`

#### Update Organization Profile
```typescript
updateOrganizationProfile(fields: UpdateFields)
```
- **Auth Required:** Yes (organization)
- **Body:** `{ name?, about?, city?, links?, contacts? }`
- **Response:** `{ data: OrganizationProfile | null, error: string | null }`

---

### Opportunities (`opportunities.ts`)

#### List Opportunities
```typescript
listOpportunities(filters?: OpportunityFilters)
```
- **Auth Required:** No (public endpoint)
- **Filters:**
  ```typescript
  {
    city?: string
    category?: string
    deadlineBefore?: string
    startDateFrom?: string
    startDateTo?: string
    organizationId?: string
    pointsMin?: number
    pointsMax?: number
    status?: OppStatus
    page?: number
    pageSize?: number  // default: 20
  }
  ```
- **Response:** `{ data: Opportunity[] | null, error: string | null, count: number }`

#### Get Opportunity
```typescript
getOpportunity(id: string)
```
- **Auth Required:** No
- **Response:** `{ data: Opportunity | null, error: string | null }`

#### Create Opportunity
```typescript
createOpportunity(fields: OpportunityInsert)
```
- **Auth Required:** Yes (verified organization)
- **Body:**
  ```typescript
  {
    title: string
    description: string
    category: string
    city: string
    apply_deadline: string
    start_date: string
    end_date: string
    start_time: string  // HH:MM:SS
    end_time: string    // HH:MM:SS
    capacity: number    // > 0
    age_restriction?: 16 | 18
    contacts: { telegram?, phone? }
    points_reward: number
  }
  ```
- **Response:** `{ data: Opportunity | null, error: string | null }`

#### Update Opportunity
```typescript
updateOpportunity(id: string, fields: OpportunityUpdate)
```
- **Auth Required:** Yes (own opportunity, verified org)
- **Body:** Same as create (partial update)
- **Response:** `{ data: Opportunity | null, error: string | null }`

#### Delete Opportunity
```typescript
deleteOpportunity(id: string)
```
- **Auth Required:** Yes (own draft opportunity only)
- **Response:** `{ error: string | null }`

#### Update Opportunity Status
```typescript
updateOpportunityStatus(id: string, newStatus: OppStatus)
```
- **Auth Required:** Yes (own opportunity)
- **Body:** `"draft" | "open" | "closed" | "cancelled" | "completed"`
- **Response:** `{ error: string | null }`

#### Cancel Opportunity
```typescript
cancelOpportunity(id: string)
```
- **Auth Required:** Yes (own opportunity)
- **Note:** Notifies all accepted volunteers
- **Response:** `{ error: string | null }`

---

### Applications (`applications.ts`)

#### Apply to Opportunity
```typescript
applyToOpportunity(opportunityId: string, message?: string)
```
- **Auth Required:** Yes (volunteer)
- **Body:** `{ opportunityId: string, message?: string }`
- **Response:** `{ data: Application | null, error: string | null }`
- **Validation:**
  - Opportunity must be open
  - No time overlap with accepted applications
  - Capacity not exceeded

#### Withdraw Application
```typescript
withdrawApplication(applicationId: string)
```
- **Auth Required:** Yes (volunteer, own application)
- **Note:** Can only withdraw before start_time. Penalty applies.
- **Response:** `{ error: string | null }`

#### List My Applications
```typescript
listMyApplications(filters?: ApplicationFilters)
```
- **Auth Required:** Yes (volunteer)
- **Filters:** `{ status?: AppStatus, page?: number, pageSize?: number }`
- **Response:** `{ data: Application[] | null, error: string | null, count: number }`

#### List Candidates (Organization)
```typescript
listCandidates(opportunityId: string, status?: AppStatus)
```
- **Auth Required:** Yes (organization, own opportunity)
- **Response:** `{ data: ApplicationWithVolunteer[] | null, error: string | null }`

#### Accept Candidate
```typescript
acceptCandidate(applicationId: string)
```
- **Auth Required:** Yes (organization)
- **Note:** Sends notification to volunteer
- **Response:** `{ error: string | null }`

#### Waitlist Candidate
```typescript
waitlistCandidate(applicationId: string)
```
- **Auth Required:** Yes (organization)
- **Response:** `{ error: string | null }`

#### Reject Candidate
```typescript
rejectCandidate(applicationId: string)
```
- **Auth Required:** Yes (organization)
- **Response:** `{ error: string | null }`

#### Promote from Waitlist
```typescript
promoteFromWaitlist(applicationId: string)
```
- **Auth Required:** Yes (organization)
- **Note:** Checks capacity before promotion
- **Response:** `{ error: string | null }`

#### Mark Completion
```typescript
markCompletion(applicationId: string, result: "completed" | "no_show")
```
- **Auth Required:** Yes (organization)
- **Effect:**
  - **completed:** Awards points + hours to volunteer
  - **no_show:** Applies penalty + adds strike
- **Response:** `{ data: CompletionRecord | null, error: string | null }`

#### Get Application Status History
```typescript
getApplicationStatusHistory(applicationId: string)
```
- **Auth Required:** Yes (related volunteer or organization)
- **Response:** `{ data: StatusHistory[] | null, error: string | null }`

---

### Notifications (`notifications.ts`)

#### List Notifications
```typescript
listNotifications(filters?: NotificationFilters)
```
- **Auth Required:** Yes
- **Filters:** `{ isRead?: boolean, cursor?: string, pageSize?: number }`
- **Response:** `{ data: Notification[] | null, error: string | null }`

#### Mark Notification Read
```typescript
markNotificationRead(id: string)
```
- **Auth Required:** Yes (own notification)
- **Response:** `{ error: string | null }`

#### Mark All Notifications Read
```typescript
markAllNotificationsRead()
```
- **Auth Required:** Yes
- **Response:** `{ error: string | null }`

#### Get Unread Count
```typescript
getUnreadCount()
```
- **Auth Required:** Yes
- **Response:** `{ count: number, error: string | null }`

---

### Certificates (`certificates.ts`)

#### Get Completed History
```typescript
getCompletedHistory(volunteerId?: string)
```
- **Auth Required:** Yes
- **Note:** If no volunteerId, returns own history
- **Response:** `{ data: CompletionRecord[] | null, error: string | null }`

#### Upload Certificate PDF
```typescript
uploadCertificatePdf(opportunityId: string, volunteerId: string, file: File)
```
- **Auth Required:** Yes (organization)
- **Body:** FormData with PDF file
- **Response:** `{ url: string | null, error: string | null }`

#### Get Certificate PDF URL
```typescript
getCertificatePdfUrl(completionRecordId: string)
```
- **Auth Required:** Yes (related volunteer or organization)
- **Response:** `{ url: string | null, error: string | null }`
- **Note:** Returns signed URL valid for 1 hour

---

### Seasons (`seasons.ts`)

#### Get Current Season
```typescript
getCurrentSeason()
```
- **Auth Required:** No
- **Response:** `{ data: Season | null, error: string | null }`

#### List Seasons
```typescript
listSeasons()
```
- **Auth Required:** No
- **Response:** `{ data: Season[] | null, error: string | null }`

#### Get My Mini-Group
```typescript
getMyMiniGroup()
```
- **Auth Required:** Yes (volunteer)
- **Response:** `{ data: MiniGroupWithMembers | null, error: string | null }`

#### Get Leaderboard
```typescript
getLeaderboard(filters?: LeaderboardFilters)
```
- **Auth Required:** Yes
- **Filters:** `{ seasonId?: string, league?: string }`
- **Response:** `{ data: MiniGroup[] | null, error: string | null }`

---

### Admin (`admin.ts`)

#### Verify Organization
```typescript
verifyOrganization(orgId: string)
```
- **Auth Required:** Yes (admin)
- **Effect:** Unlocks organization write permissions
- **Response:** `{ error: string | null }`

#### Unverify Organization
```typescript
unverifyOrganization(orgId: string)
```
- **Auth Required:** Yes (admin)
- **Response:** `{ error: string | null }`

#### List Organizations
```typescript
listOrganizations(filters?: OrgFilters)
```
- **Auth Required:** Yes (admin)
- **Filters:** `{ verified?: boolean, city?: string, page?: number, pageSize?: number }`
- **Response:** `{ data: OrganizationProfile[] | null, error: string | null, count: number }`

#### List Users
```typescript
listUsers(filters?: UserFilters)
```
- **Auth Required:** Yes (admin)
- **Filters:** `{ role?: AppRole, page?: number, pageSize?: number }`
- **Response:** `{ data: Profile[] | null, error: string | null, count: number }`

#### Create Season
```typescript
createSeason(startDate: string, durationDays?: SeasonDuration)
```
- **Auth Required:** Yes (admin)
- **Body:** `{ startDate: "YYYY-MM-DD", durationDays: "30" | "60" | "90" | "120" }`
- **Response:** `{ data: Season | null, error: string | null }`

#### Trigger Season Rollover
```typescript
triggerSeasonRollover()
```
- **Auth Required:** Yes (admin)
- **Effect:**
  - Ends active season
  - Promotes top performers (max +1 league)
  - Resets season_points to 0
  - Creates new mini-groups for new season
- **Response:** `{ error: string | null }`

#### Get Audit Logs
```typescript
getAuditLogs(filters?: AuditFilters)
```
- **Auth Required:** Yes (admin)
- **Filters:** `{ action?: string, targetType?: string, actorId?: string, page?: number, pageSize?: number }`
- **Response:** `{ data: AuditLog[] | null, error: string | null, count: number }`

#### Update Config
```typescript
updateConfig(key: string, value: Record<string, unknown>)
```
- **Auth Required:** Yes (admin)
- **Body:** `{ key: string, value: object }`
- **Response:** `{ error: string | null }`

#### Get Config
```typescript
getConfig(key: string)
```
- **Auth Required:** No
- **Response:** `{ data: ConfigEntry | null, error: string | null }`

#### Get All Config
```typescript
getAllConfig()
```
- **Auth Required:** No
- **Response:** `{ data: ConfigEntry[] | null, error: string | null }`

---

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

---

## Environment Setup

### Prerequisites

- **Node.js:** 25.x or higher (tested on 25.2.1)
- **npm:** 10.x or higher
- **Supabase Account:** Required for database and auth

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd v-league

# Checkout the initial-backend branch
git checkout initial-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

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
3. Copy the **Project URL** and **anon/public key**
4. Run the migrations (see below)

### Database Setup

The database schema is managed via Supabase migrations. 22 migration files are included:

```
20260215160719_create_enums.sql
20260215160730_create_profiles.sql
20260215160742_create_volunteer_profiles.sql
20260215160755_create_organization_profiles.sql
20260215160809_create_opportunities.sql
20260215160817_create_applications.sql
20260215160830_create_application_status_history.sql
20260215160841_create_completion_records.sql
20260215160853_create_seasons_and_groups.sql
20260215160901_create_notifications.sql
20260215160910_create_audit_logs.sql
20260215160929_create_config.sql
20260215160949_create_storage_bucket.sql
20260215161008_create_helper_functions.sql
20260215161043_create_rls_policies.sql
20260215161226_create_business_functions.sql
20260215161241_create_cron_jobs.sql
20260215161721_fix_function_search_paths.sql
20260215161748_add_missing_fk_indexes.sql
20260215163014_fix_handle_new_user_empty_date.sql
20260215174749_fix_org_notifications_on_application.sql
20260215174810_add_org_notification_on_withdrawal.sql
```

These migrations are already applied to the linked Supabase project. For a fresh setup:

1. Connect to your Supabase project
2. Use the Supabase CLI or SQL Editor to run migrations
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

The application will be available at `http://localhost:3000`.

---

## Development Notes

### Assumptions

1. **Database First:** All migrations are pre-applied. No runtime schema changes.
2. **Authentication Strategy:** Supabase Auth handles session management. Frontend must include session cookie in requests.
3. **Organization Verification:** Default is `verified: false`. Admins must manually verify.
4. **Time Overlap Validation:** Enforced in `fn_apply_to_opportunity()` using date/time range checks.
5. **Season Rollover:** Currently manual trigger via `triggerSeasonRollover()`. Cron job included but may need activation.
6. **No QR Codes in MVP:** Completion marking is done manually by organization.

### Known Limitations

1. **No Pagination Cursor for Opportunities:** Uses offset-based pagination (not ideal for large datasets).
2. **No Real-time Updates:** Volunteers must refresh to see status changes. Consider Supabase Realtime for production.
3. **File Upload in Server Actions:** Certificate PDFs use File API. May need FormData workaround depending on Next.js version.
4. **No Rate Limiting:** Application-level rate limiting not implemented. Relies on Supabase's built-in protections.
5. **No Email Notifications:** Only in-app notifications. Email integration (via Supabase Edge Functions or external service) recommended.
6. **Manual Season Rollover:** Cron job exists but may require Supabase Pro plan to enable.
7. **Static Points Config:** Penalty/reward logic is hardcoded in functions. Config table exists but not fully integrated.

### Future Improvements

1. **Search Optimization:**
   - Add full-text search (PostgreSQL `tsvector`) for opportunities and organizations
   - Implement proper cursor-based pagination

2. **Real-time Features:**
   - Enable Supabase Realtime channels for notifications
   - Add live candidate count updates on opportunity detail pages

3. **Enhanced Validation:**
   - Move time-overlap checks to a database constraint
   - Add age restriction enforcement based on volunteer DOB

4. **Email System:**
   - Integrate email notifications for critical events (application status, opportunity cancellation)
   - Use Supabase Edge Functions or services like SendGrid

5. **Analytics:**
   - Add aggregate views for volunteer participation trends
   - Organization dashboard with completion rate metrics

6. **Testing:**
   - Add unit tests for business logic functions (RPC functions)
   - Integration tests for critical flows (apply → accept → complete)
   - RLS policy tests to ensure authorization correctness

7. **Performance:**
   - Add Redis caching layer for frequently accessed data (leaderboards, active season)
   - Optimize RLS policies (some queries do multiple `auth.uid()` calls)

8. **Security:**
   - Add rate limiting at application layer
   - Implement CAPTCHA for signup
   - Add audit log retention policy

---

## Testing

### Manual Testing with Supabase Studio

1. Navigate to your project in Supabase Studio
2. Use the **Table Editor** to view data
3. Use the **SQL Editor** to test RPC functions:

```sql
-- Test creating a volunteer application
SELECT fn_apply_to_opportunity(
  p_opportunity_id := '<opportunity-id-uuid>',
  p_message := 'I am interested in volunteering!'
);

-- Test accepting a candidate
SELECT fn_accept_candidate(
  p_application_id := '<application-id-uuid>'
);

-- Test marking completion
SELECT fn_mark_completion(
  p_application_id := '<application-id-uuid>',
  p_result := 'completed'
);
```

### Testing with Thunder Client (VSCode Extension)

1. Install Thunder Client extension
2. Create requests for each Server Action
3. Set authentication header with Supabase session token

Example request for `applyToOpportunity`:

```http
POST http://localhost:3000/api/test-action
Content-Type: application/json

{
  "action": "applyToOpportunity",
  "params": {
    "opportunityId": "uuid-here",
    "message": "Test application"
  }
}
```

**Note:** You'll need to create a test API route wrapper to call Server Actions from HTTP clients, as Server Actions are designed to be called from Next.js components.

### Testing Authentication Flow

1. **Volunteer Signup:**
   - Navigate to `/auth/signup/volunteer`
   - Fill in form and submit
   - Verify `profiles` and `volunteer_profiles` records created
   - Check `league` defaults to `bronze`

2. **Organization Signup:**
   - Navigate to `/auth/signup/organization`
   - Fill in form and submit
   - Verify `verified: false` in `organization_profiles`
   - Attempt to create opportunity (should fail until verified)

3. **Admin Verification:**
   - As admin, call `verifyOrganization(orgId)`
   - Verify `verified: true` and `verified_at` populated
   - Organization should now be able to create opportunities

### Testing CRUDL Operations

**Opportunities:**
```typescript
// CREATE
await createOpportunity({ title: "Beach Cleanup", city: "Almaty", ... });

// READ
await getOpportunity(opportunityId);
await listOpportunities({ city: "Almaty", status: "open" });

// UPDATE
await updateOpportunity(opportunityId, { capacity: 50 });

// DELETE
await deleteOpportunity(opportunityId); // Only works for draft status

// LIST
await listOpportunities({ page: 1, pageSize: 20 });
```

**Applications:**
```typescript
// CREATE
await applyToOpportunity(opportunityId, "I have experience");

// READ
await listMyApplications({ status: "accepted" });

// UPDATE (via specialized functions)
await withdrawApplication(applicationId);

// DELETE (not supported)

// LIST
await listCandidates(opportunityId); // Organization view
```

### Testing Business Logic

**Time Overlap Prevention:**
1. Create opportunity A (10:00-12:00)
2. Create opportunity B (11:00-13:00) on same date
3. Apply to opportunity A as volunteer
4. Org accepts application A
5. Attempt to apply to opportunity B → Should fail with overlap error

**Capacity Enforcement:**
1. Create opportunity with capacity: 2
2. Have 3 volunteers apply
3. Accept 2 volunteers
4. Attempt to accept 3rd volunteer → Should fail with capacity error

**Verification Gate:**
1. Create unverified organization
2. Attempt to create opportunity → Should fail with RLS policy error
3. Verify organization via admin
4. Retry creating opportunity → Should succeed

**Season Rollover:**
1. Create season with start_date in past, end_date today
2. Create mini-groups for Bronze/Silver/Gold/Platinum
3. Assign volunteers with varying season_points
4. Call `triggerSeasonRollover()`
5. Verify:
   - Top performers promoted (max +1 league)
   - All season_points reset to 0
   - New season created and activated

---

## License

This is a demonstration project for backend evaluation purposes.

---

## Contact

For technical questions about this implementation, refer to the commit history and inline code documentation.
