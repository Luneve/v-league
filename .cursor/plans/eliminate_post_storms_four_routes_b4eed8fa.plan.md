---
name: Eliminate POST storms four routes
overview: Convert four client-rendered pages (/applications, /applications/[id], /org/opportunities, /opportunity/[id]) to Server Components with server-side data fetching, eliminating all mount-triggered POST storms and reducing proxy.ts latency.
todos:
  - id: convert-applications-list
    content: Convert /applications to RSC page.tsx + client.tsx (handles tabs + withdraw modal)
    status: completed
  - id: convert-application-detail
    content: Convert /applications/[id] to fully server-rendered RSC (no interactivity needed, query specific application instead of fetching all)
    status: completed
  - id: convert-org-opportunities
    content: Convert /org/opportunities to RSC page.tsx + client.tsx (handles tab filtering)
    status: completed
  - id: convert-opportunity-detail
    content: Convert /opportunity/[id] to RSC page.tsx + client.tsx (handles apply modal + toast)
    status: completed
  - id: build-verify
    content: Run production build, verify zero linter errors, confirm routes are Dynamic in build output
    status: completed
isProject: false
---

# Eliminate POST Storms on Four Routes

## A. Root Cause Analysis

All four routes follow the identical anti-pattern: a `"use client"` page with a `useEffect` that calls server actions on mount. In Next.js 16, each server action call is a POST to the current route URL. Combined with the layout's own `useEffect` (which calls `getFullProfile` + `listNotifications`), this produces 2+ layout POSTs plus N page POSTs on every initial navigation.

### POST breakdown per route


| Route                | Page useEffect server actions                                           | Layout actions                             | Total POSTs |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------ | ----------- |
| `/applications`      | `listMyApplications()`                                                  | `getFullProfile()` + `listNotifications()` | 3           |
| `/applications/[id]` | `listMyApplications()` + `getApplicationStatusHistory(id)`              | same                                       | 4           |
| `/org/opportunities` | `listOpportunities({organizationId})`                                   | `getFullProfile()` + `listNotifications()` | 3           |
| `/opportunity/[id]`  | `getOpportunity(id)` + `listMyApplications()` + `getVolunteerProfile()` | same                                       | 5           |


### Source of each POST (with file/line proof)

`**/applications**` -- [src/app/(volunteer)/applications/page.tsx](src/app/(volunteer)/applications/page.tsx)

- Line 44: `useEffect(() => { fetchApplications(); }, [])` calls `listMyApplications()` (line 37) = 1 POST

`**/applications/[id]**` -- [src/app/(volunteer)/applications/[id]/page.tsx](src/app/(volunteer)/applications/[id]/page.tsx)

- Lines 25-27: `useEffect` calls `listMyApplications()` + `getApplicationStatusHistory(id)` in `Promise.all` = 2 POSTs
- Note: it fetches ALL applications just to `.find()` one by ID -- highly wasteful

`**/org/opportunities**` -- [src/app/(org)/org/opportunities/page.tsx](src/app/(org)/org/opportunities/page.tsx)

- Lines 26-35: `useEffect` calls `listOpportunities({ organizationId: org.id })` = 1 POST
- Depends on `org` from `useProfileContext()`, so fires after profile loads

`**/opportunity/[id]**` -- [src/app/(volunteer)/opportunity/[id]/page.tsx](src/app/(volunteer)/opportunity/[id]/page.tsx)

- Lines 39-43: `useEffect` calls `getOpportunity(id)` + `listMyApplications()` + `getVolunteerProfile()` in `Promise.all` = 3 POSTs

## B. Conversion Strategy Per Route

### Route 1: `/applications` (read-only list + interactive withdraw modal)

**Current:** Client component fetches `listMyApplications()` in useEffect.

**Plan:** Split into Server Component `page.tsx` + Client Component `client.tsx`.

- `page.tsx` (Server): fetch applications via Supabase server client directly (same query as `listMyApplications` in [src/lib/actions/applications.ts](src/lib/actions/applications.ts) lines 31-58)
- `client.tsx` (Client): receives `initialApplications` prop, handles tab filtering, withdraw modal, and re-fetch after withdrawal

**Files:**

- Rewrite [src/app/(volunteer)/applications/page.tsx](src/app/(volunteer)/applications/page.tsx) as async Server Component
- Create `src/app/(volunteer)/applications/client.tsx` for interactive parts

### Route 2: `/applications/[id]` (read-only detail)

**Current:** Client component fetches `listMyApplications()` + `getApplicationStatusHistory(id)` in useEffect. Fetches ALL applications just to find one by ID.

**Plan:** Convert to fully server-rendered page. No interactivity needed (the page is pure display).

- `page.tsx` (Server): fetch single application + status history via Supabase server client
- Query the specific application directly instead of fetching all and filtering

**Files:**

- Rewrite [src/app/(volunteer)/applications/[id]/page.tsx](src/app/(volunteer)/applications/[id]/page.tsx) as async Server Component

### Route 3: `/org/opportunities` (list with tabs + links)

**Current:** Client component reads `useProfileContext()` for org ID, then calls `listOpportunities({organizationId})` in useEffect.

**Plan:** Split into Server Component `page.tsx` + Client Component `client.tsx`.

- `page.tsx` (Server): get user ID from Supabase auth, fetch opportunities directly
- `client.tsx` (Client): receives `initialOpportunities` prop, handles tab state

**Files:**

- Rewrite [src/app/(org)/org/opportunities/page.tsx](src/app/(org)/org/opportunities/page.tsx) as async Server Component
- Create `src/app/(org)/org/opportunities/client.tsx` for tab filtering

### Route 4: `/opportunity/[id]` (detail + apply modal)

**Current:** Client component calls `getOpportunity(id)` + `listMyApplications()` + `getVolunteerProfile()` in useEffect. Has an interactive "Apply" modal.

**Plan:** Split into Server Component `page.tsx` + Client Component `client.tsx`.

- `page.tsx` (Server): fetch opportunity, applications, and volunteer profile in `Promise.all` via Supabase server client
- `client.tsx` (Client): receives all data as props, handles apply modal + toast

**Files:**

- Rewrite [src/app/(volunteer)/opportunity/[id]/page.tsx](src/app/(volunteer)/opportunity/[id]/page.tsx) as async Server Component
- Create `src/app/(volunteer)/opportunity/[id]/client.tsx` for apply modal interaction

## C. proxy.ts / Middleware Context

There is no `proxy.ts` file in this codebase. The `proxy.ts` timing in logs refers to Next.js middleware processing. We already optimized middleware in the previous round (reading role from `user.user_metadata.role` instead of querying the DB). The remaining proxy.ts time (~250-450ms for GETs) is dominated by:

1. `supabase.auth.getUser()` in middleware (~100-200ms Supabase GoTrue round-trip)
2. The server component's own `createClient()` + `supabase.auth.getUser()` call

These are irreducible costs of authentication per request. The key win is **eliminating the POSTs entirely** so this cost is paid once (on the initial GET) instead of N+1 times.

## D. Expected Impact


| Route                | Before (POSTs) | After (POSTs) | Saved round-trips |
| -------------------- | -------------- | ------------- | ----------------- |
| `/applications`      | 3              | 0             | 3                 |
| `/applications/[id]` | 4              | 0             | 4                 |
| `/org/opportunities` | 3              | 0             | 3                 |
| `/opportunity/[id]`  | 5              | 0             | 5                 |


Each eliminated POST saves ~300-800ms of middleware + server action overhead. The layout POSTs (profile + notifications) remain unchanged (2 per navigation) as those are in the layout component which stays client-side.

## E. Implementation Order

Start with the simplest conversions first, ending with the most complex (opportunity detail with its apply modal).