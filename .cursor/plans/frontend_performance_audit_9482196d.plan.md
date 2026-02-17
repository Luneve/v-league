---
name: Frontend Performance Audit
overview: Comprehensive frontend performance audit of the V League Next.js app, identifying rendering bottlenecks, CSS paint costs, unnecessary re-renders, and missing optimizations -- with a prioritized fix plan.
todos:
  - id: fix-universal-transition
    content: Replace universal * CSS transition with .theme-transitioning class in globals.css and ThemeToggle.tsx
    status: completed
  - id: memo-layout-components
    content: Wrap Sidebar/TopNav in React.memo, memoize callbacks in all 3 layout files and AppShell
    status: completed
  - id: fix-admin-users-bug
    content: Remove duplicate useEffect in admin/users/page.tsx
    status: completed
  - id: usememo-dashboard-stats
    content: Add useMemo to derived stats in org and admin dashboard pages
    status: completed
  - id: cache-useprofile
    content: Add module-level caching/deduplication to useProfile hook
    status: completed
  - id: rsc-admin-pages
    content: Convert admin dashboard, audit, seasons, organizations pages to Server Components
    status: completed
  - id: remove-sidebar-blur
    content: Remove backdrop-blur-sm from mobile sidebar overlay in AppShell
    status: completed
  - id: rsc-volunteer-pages
    content: Convert volunteer feed, leaderboard, profile pages to Server Components
    status: completed
  - id: profile-provider-context
    content: Create ProfileProvider context at layout level for server-side profile fetch
    status: completed
  - id: gpu-hints-overlays
    content: "Add will-change: transform to Modal/Drawer overlays and optimize spotlight pseudo-element"
    status: completed
isProject: false
---

# Frontend Performance Audit & Optimization Plan

---

## A) Baseline Observations

### What was measured / inspected

Every page component, layout, shared component, UI component, hook, CSS file, and utility was read in full. The analysis covers: render tree structure, state management patterns, CSS compositing cost, memoization gaps, list rendering, bundle implications, and hydration concerns.

### Architecture summary

- **Next.js 16 App Router** with route groups: `(auth)`, `(volunteer)`, `(org)`, `(admin)`
- **All route-group layouts and ALL pages are `"use client"**` -- zero Server Components for data-fetching pages
- **No global state library** -- only React Context (`ToastProvider`) and a `useProfile` hook that fetches on every mount
- **Tailwind CSS v4** with CSS custom properties for theming
- **Supabase** for auth + data, called via Server Actions from client components

### Key cost signals


| Signal                                                                    | Location                     | Severity              |
| ------------------------------------------------------------------------- | ---------------------------- | --------------------- |
| Universal CSS transition on `*`                                           | `globals.css:107-109`        | **HIGH**              |
| `useProfile()` re-fetches on every layout mount                           | `useProfile.ts`              | MEDIUM                |
| Every page is `"use client"` -- no RSC data fetching                      | All pages                    | MEDIUM                |
| `backdrop-filter: blur` on 3 overlay components                           | AppShell, Modal, Drawer      | LOW-MEDIUM            |
| `surface-spotlight::before` pseudo-element on many cards                  | SurfaceCard with `spotlight` | LOW                   |
| Inline arrow functions as props in AppShell / layouts                     | Layout files                 | LOW                   |
| No virtualization on any list                                             | Users, Audit, Notifications  | LOW (lists are small) |
| Duplicate data fetches (org layout useProfile + org dashboard useProfile) | Org route                    | MEDIUM                |
| Admin Users page has TWO useEffect calls that both call setLoading        | `admin/users/page.tsx`       | LOW (bug)             |


---

## B) Hotspot List (Ranked by Impact)

### HOTSPOT 1 -- Universal CSS Transition Rule (HIGH)

**File:** `[src/app/globals.css](src/app/globals.css)`, lines 107-109

```css
*, *::before, *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease, box-shadow 0.3s ease, fill 0.3s ease, stroke 0.3s ease;
}
```

**Why it's expensive:** This applies a CSS transition to **every single DOM node** (including `::before`/`::after`). On any theme toggle or class change, the browser must compute transition state for hundreds/thousands of elements. This is the **single biggest paint/compositing tax** in the app. It forces the browser to track transition state on every element at all times, even elements that never change theme. It also makes initial paint slower because every element starts with transition metadata.

**Proof:** This is a well-documented anti-pattern. Chrome DevTools "Rendering > Paint flashing" will show the entire page lights up on any class change. The Performance panel will show long "Recalculate Style" entries.

### HOTSPOT 2 -- All Pages Are Client Components (MEDIUM-HIGH)

**Every single page** uses `"use client"` and fetches data in `useEffect`. This means:

- The entire page JavaScript ships to the client
- No streaming / Suspense benefit from RSC
- Data fetching begins only **after** hydration completes (waterfall)
- Every page shows a skeleton loader while waiting for client-side fetch

**Affected files:** All 15+ page.tsx files.

**Expected cost:** Extra ~200-500ms of perceived load time per navigation (hydrate -> mount -> fetch -> render).

### HOTSPOT 3 -- `useProfile()` Hook Re-fetches on Every Layout Mount (MEDIUM)

**File:** `[src/hooks/useProfile.ts](src/hooks/useProfile.ts)`

The `useProfile()` hook is called in:

- `[src/app/(volunteer)/layout.tsx](src/app/(volunteer)`/layout.tsx) line 24
- `[src/app/(org)/layout.tsx](src/app/(org)`/layout.tsx) line 26
- `[src/app/(org)/org/dashboard/page.tsx](src/app/(org)`/org/dashboard/page.tsx) line 10
- `[src/app/(volunteer)/profile/page.tsx](src/app/(volunteer)`/profile/page.tsx) (indirectly)

Each call triggers a fresh `getProfile()` + `getVolunteerProfile()`/`getOrganizationProfile()` server action call. The org dashboard page calls `useProfile()` AND its parent layout also calls `useProfile()`, resulting in **duplicate fetches** on every org dashboard mount.

There is no caching, no deduplication, no shared state between layout and page.

### HOTSPOT 4 -- Inline Functions and Missing Memoization in Layouts (MEDIUM)

**Files:** All three layout files (`[(volunteer)/layout.tsx](src/app/(volunteer)`/layout.tsx), `[(org)/layout.tsx](src/app/(org)`/layout.tsx), `[(admin)/layout.tsx](src/app/(admin)`/layout.tsx))

Each layout passes inline arrow functions to `AppShell`:

```tsx
onNotificationClick={() => {
  setNotifOpen(true);
  fetchNotifications();
}}
```

and `AppShell` passes inline functions down:

```tsx
onMenuToggle={() => setSidebarOpen(true)}
onClick={() => setSidebarOpen(false)}
```

Every state change in the layout (notifOpen, notifications, unreadCount) causes `AppShell`, `TopNav`, and `Sidebar` to re-render because none of them use `React.memo` and the inline function props create new references every render.

### HOTSPOT 5 -- `backdrop-filter: blur` on Overlays (LOW-MEDIUM)

**Files:**

- `[src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)` line 38: `backdrop-blur-sm` on mobile sidebar overlay
- `[src/components/ui/Modal.tsx](src/components/ui/Modal.tsx)` line 61: `backdrop-blur-sm`
- `[src/components/ui/Drawer.tsx](src/components/ui/Drawer.tsx)` line 54: `backdrop-blur-sm`

`backdrop-filter` is a compositing-heavy operation. It's acceptable on overlays that appear infrequently, but it contributes to jank when opening/closing.

### HOTSPOT 6 -- `surface-spotlight::before` Pseudo-Element on Cards (LOW)

**File:** `[src/app/globals.css](src/app/globals.css)` lines 112-127, used via `SurfaceCard` when `spotlight={true}`.

The dashboard pages render 4+ stat cards with `spotlight` enabled, each adding a `::before` pseudo-element with a `radial-gradient`. This is a minor paint cost but adds up in grids.

### HOTSPOT 7 -- Admin Users Page Double useEffect Bug (LOW)

**File:** `[src/app/(admin)/admin/users/page.tsx](src/app/(admin)`/admin/users/page.tsx)

Two separate `useEffect` hooks both run on mount and both call `setLoading(false)`. The first one (lines 29-38) calls `listUsers()` but doesn't use the result properly. The second (lines 43-55) does the actual work via direct Supabase client. This causes a wasted server action call.

### HOTSPOT 8 -- Org Dashboard Derived Data in Render (LOW)

**File:** `[src/app/(org)/org/dashboard/page.tsx](src/app/(org)`/org/dashboard/page.tsx) lines 61-66

```tsx
const stats = [
  { label: "Open", value: opportunities.filter((o) => o.status === "open").length },
  { label: "Total Applicants", value: opportunities.reduce((acc, o) => acc + o.currentApplicants, 0) },
  { label: "Completed", value: opportunities.filter((o) => o.status === "completed").length },
];
```

These `.filter()` and `.reduce()` calls run on every render. Should be wrapped in `useMemo`.

---

## C) Fixes (Ranked by ROI)

### FIX 1 -- Replace universal `*` transition with targeted theme-transition class (HIGH ROI, LOW RISK)

**File:** `[src/app/globals.css](src/app/globals.css)`

**Change:** Remove the `*, *::before, *::after` transition rule. Instead, apply transitions only to elements that actually need them during theme changes (backgrounds, borders of major surfaces).

**Replace:**

```css
*, *::before, *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease, box-shadow 0.3s ease, fill 0.3s ease, stroke 0.3s ease;
}
```

**With:**

```css
/* Theme transition -- only applied during toggle, removed after */
html.theme-transitioning,
html.theme-transitioning *,
html.theme-transitioning *::before,
html.theme-transitioning *::after {
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.2s ease, box-shadow 0.3s ease !important;
}
```

Then in `ThemeToggle.tsx`, add/remove the class during toggle:

```tsx
const toggle = () => {
  document.documentElement.classList.add('theme-transitioning');
  setTheme(theme === 'dark' ? 'light' : 'dark');
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 350);
};
```

**Impact:** Eliminates transition metadata tracking on every DOM node at all times. Reduces "Recalculate Style" time significantly on every interaction. **Expected: 30-50% reduction in style recalc time.**

**Risk:** LOW -- theme toggle will still animate smoothly; other interactions will be snappier.

### FIX 2 -- Convert data-fetching pages to Server Components (HIGH ROI, MEDIUM RISK)

Convert the dashboards and list pages to use RSC for data fetching. This eliminates the hydration-then-fetch waterfall.

**Priority pages to convert:**

1. `[src/app/(admin)/admin/dashboard/page.tsx](src/app/(admin)`/admin/dashboard/page.tsx)
2. `[src/app/(admin)/admin/organizations/page.tsx](src/app/(admin)`/admin/organizations/page.tsx)
3. `[src/app/(admin)/admin/audit/page.tsx](src/app/(admin)`/admin/audit/page.tsx)
4. `[src/app/(admin)/admin/seasons/page.tsx](src/app/(admin)`/admin/seasons/page.tsx)
5. `[src/app/(volunteer)/leaderboard/page.tsx](src/app/(volunteer)`/leaderboard/page.tsx)

**Pattern:** Move data fetching to the server component, pass data as props to a client-side interactive wrapper.

```tsx
// page.tsx (Server Component -- no "use client")
import { AdminDashboardClient } from './client';
import { listOrganizations, listUsers, getAuditLogs, getCurrentSeason } from '@/lib/actions';

export default async function AdminDashboardPage() {
  const [orgsResult, usersResult, auditResult, seasonResult, pendingResult] = await Promise.all([
    listOrganizations(),
    listUsers(),
    getAuditLogs({ pageSize: 7 }),
    getCurrentSeason(),
    listOrganizations({ verified: false }),
  ]);
  
  return (
    <AdminDashboardClient
      orgs={orgsResult}
      users={usersResult}
      audit={auditResult}
      season={seasonResult}
      pending={pendingResult}
    />
  );
}
```

**Impact:** Eliminates skeleton flash, streams HTML immediately, reduces client JS bundle. **Expected: 200-500ms faster perceived load per page.**

**Risk:** MEDIUM -- requires restructuring each page into server/client split. No UI change.

### FIX 3 -- Add caching/deduplication to `useProfile` (MEDIUM ROI, LOW RISK)

**File:** `[src/hooks/useProfile.ts](src/hooks/useProfile.ts)`

**Option A (simple):** Use a module-level cache with timestamp:

```tsx
let profileCache: { data: ProfileState; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30s

export function useProfile() {
  const [state, setState] = useState<ProfileState>(
    profileCache && Date.now() - profileCache.timestamp < CACHE_TTL
      ? profileCache.data
      : { profile: null, role: null, loading: true }
  );

  const load = async () => {
    if (profileCache && Date.now() - profileCache.timestamp < CACHE_TTL) {
      setState(profileCache.data);
      return;
    }
    // ... existing fetch logic ...
    profileCache = { data: newState, timestamp: Date.now() };
    setState(newState);
  };
  // ...
}
```

**Option B (better):** Lift profile fetching to the layout as a Server Component and pass it down via props or a context that only sets once.

**Impact:** Eliminates duplicate profile fetches (org layout + org dashboard both calling useProfile). **Expected: 1 fewer API round-trip on org pages.**

### FIX 4 -- Memoize layout callbacks + wrap AppShell/TopNav/Sidebar in React.memo (MEDIUM ROI, LOW RISK)

**Files:**

- `[src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)`
- `[src/components/layout/TopNav.tsx](src/components/layout/TopNav.tsx)`
- `[src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)`
- All three layout files

**Changes:**

1. Wrap `Sidebar` and `TopNav` in `React.memo`:

```tsx
const Sidebar = React.memo(function Sidebar({ role, collapsed, onClose }: SidebarProps) {
  // ... existing code
});
```

1. In layouts, wrap callbacks in `useCallback`:

```tsx
const handleNotifClick = useCallback(() => {
  setNotifOpen(true);
  fetchNotifications();
}, [fetchNotifications]);

const handleMenuToggle = useCallback(() => setSidebarOpen(true), []);
```

1. In `AppShell`, wrap the `onMenuToggle` callback:

```tsx
const handleMenuToggle = useCallback(() => setSidebarOpen(true), []);
const handleOverlayClose = useCallback(() => setSidebarOpen(false), []);
```

**Impact:** Prevents Sidebar and TopNav from re-rendering when notification state changes in the layout. **Expected: ~40% fewer component re-renders on notification interactions.**

### FIX 5 -- Memoize derived data in dashboard/list pages (LOW ROI, LOW RISK)

**Files:**

- `[src/app/(org)/org/dashboard/page.tsx](src/app/(org)`/org/dashboard/page.tsx) -- wrap `stats` in `useMemo`
- `[src/app/(admin)/admin/dashboard/page.tsx](src/app/(admin)`/admin/dashboard/page.tsx) -- wrap `stats` in `useMemo`
- `[src/app/(org)/org/opportunities/page.tsx](src/app/(org)`/org/opportunities/page.tsx) -- `filtered` is already memoized (good), but `tabs` recomputes even though it uses `useMemo` (correct)

**Example for org dashboard:**

```tsx
const stats = useMemo(() => [
  { label: "Total Opportunities", value: opportunities.length },
  { label: "Open", value: opportunities.filter((o) => o.status === "open").length },
  { label: "Total Applicants", value: opportunities.reduce((acc, o) => acc + o.currentApplicants, 0) },
  { label: "Completed", value: opportunities.filter((o) => o.status === "completed").length },
], [opportunities]);
```

### FIX 6 -- Fix Admin Users page double-fetch bug (LOW ROI, LOW RISK)

**File:** `[src/app/(admin)/admin/users/page.tsx](src/app/(admin)`/admin/users/page.tsx)

Remove the first `useEffect` (lines 29-38) entirely. It calls `listUsers()` but never uses the volunteer-specific fields. Only keep the second `useEffect` that fetches from `volunteer_profiles` directly.

---

## D) Performance Plan

### Quick Wins (1-2 hours)

1. **Replace universal `*` CSS transition** with `.theme-transitioning` class approach in `[globals.css](src/app/globals.css)` and `[ThemeToggle.tsx](src/components/ui/ThemeToggle.tsx)`. (Fix 1)
2. **Wrap `Sidebar` and `TopNav` in `React.memo**`; memoize callbacks in layouts with `useCallback`. (Fix 4)
3. **Fix admin users page double-fetch**. (Fix 6)
4. **Add `useMemo` to dashboard stats** in org and admin dashboards. (Fix 5)

### Medium (1 day)

1. **Add caching to `useProfile` hook** to prevent duplicate fetches across layout and page. (Fix 3)
2. **Convert admin dashboard, audit, seasons, and organizations pages** to Server Components with client wrappers. (Fix 2 -- partial)
3. **Remove `backdrop-blur-sm` from mobile sidebar overlay** in AppShell (it's a full-screen overlay; `bg-black/50` is sufficient without the blur). Keep blur on Modal/Drawer since those are infrequent.

### Larger (1 week)

1. **Convert remaining pages to Server Components** (volunteer feed, leaderboard, profile, opportunity detail) with proper server/client split.
2. **Create a `ProfileProvider` context** at the layout level that fetches once (server-side) and provides profile data to all child pages, eliminating per-page `useProfile()` calls.
3. **Add `will-change: transform` to Modal/Drawer overlays** for GPU compositing hint.
4. **Consider virtualization for admin users table** if the user count grows beyond ~100 rows (not urgent now).
5. **Optimize `SurfaceCard` spotlight** -- make the `::before` pseudo-element use `will-change: opacity` and consider removing spotlight from stat cards in grids (4+ cards with radial gradient pseudo-elements is unnecessary visual weight).

---

## E) Verification Checklist

### Before/After Metrics to Capture

1. **Chrome DevTools Performance Panel:**
  - Record a "Theme Toggle" interaction. Compare "Recalculate Style" duration before and after Fix 1.
  - **Target:** Recalculate Style drops from ~15-30ms to under 5ms.
2. **React DevTools Profiler:**
  - Record navigation to org dashboard. Count component renders.
  - **Target after Fix 4:** Sidebar and TopNav show 0 re-renders when notification drawer opens/closes.
  - **Target after Fix 3:** Only 1 profile fetch call total (not 2).
3. **Network Tab:**
  - Count server action calls on org dashboard load.
  - **Before:** 2x `getProfile` + 2x `getVolunteerProfile/getOrganizationProfile` (layout + page).
  - **After Fix 3:** 1x each.
4. **Lighthouse (production build):**
  - Run `next build && next start`, then Lighthouse.
  - **Target:** TBT (Total Blocking Time) improvement of 20-40% after Fix 1+2.
  - **Target:** LCP improvement of 200-500ms after Fix 2 (RSC conversion).
5. **CSS Paint Verification:**
  - Chrome DevTools > Rendering > "Paint flashing" checkbox.
  - **Before Fix 1:** Entire page flashes green on theme toggle.
  - **After Fix 1:** Only visible surfaces flash briefly during the 300ms transition window.
6. **Production vs Dev:**
  - React strict mode double-invokes effects in dev, making `useProfile` fetch 4x instead of 2x. Always validate in `next build && next start`.
  - Dev mode includes React DevTools overhead (~10-20% slower rendering).
  - The universal `*` transition is equally expensive in both dev and prod.

---

## Top 5 Changes by ROI


| Rank | Fix                                     | Files                            | Effort  | Impact                                          |
| ---- | --------------------------------------- | -------------------------------- | ------- | ----------------------------------------------- |
| 1    | Remove universal `*` transition         | `globals.css`, `ThemeToggle.tsx` | 15 min  | HIGH -- eliminates constant transition tracking |
| 2    | RSC conversion for dashboards           | 5 page files                     | 3-4 hrs | HIGH -- eliminates fetch waterfall              |
| 3    | `React.memo` + `useCallback` in layouts | 6 files                          | 30 min  | MEDIUM -- stops cascade re-renders              |
| 4    | `useProfile` caching                    | `useProfile.ts`                  | 30 min  | MEDIUM -- eliminates duplicate API calls        |
| 5    | `useMemo` for derived stats             | 2 dashboard pages                | 10 min  | LOW -- prevents redundant array operations      |


