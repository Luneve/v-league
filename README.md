# Volunteer League (MVP) — Full Product Logic + UI Design Standard  
Tech: **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**  
Modes: **Light + Dark**, themeable via **design tokens (CSS variables)**

---

## 1) Concept Overview

**Volunteer League** is a platform where:
- **Organizations** create volunteer opportunities (“posts”).
- **Volunteers** apply, get accepted/waitlisted/rejected, participate, and earn **season points**.
- Volunteers compete inside **mini-groups** within their **league** during a **90-day season**.
- At season end, top performers get promoted **by 1 league max**.  
- Volunteers also accumulate **lifetime hours** as a permanent metric.

Organizations are **restricted until admin verification**.

---

## 2) Roles & Permissions

### 2.1 Roles
- `volunteer`
- `organization`
- `admin`

### 2.2 Authentication
- Volunteers: **Email + Google**
- Organizations: **Email + Google**
- Organizations are **fully locked** until **admin verification**.

### 2.3 Organization Verification
- Verification is done via **Admin Panel**.
- Before verification, organization **cannot do anything** (no posts, no candidate lists, no accept/waitlist, no completion marking).

---

## 3) Volunteer Profile (Volunteer Account)

### 3.1 Editable Profile Fields
Volunteer can **create/update**:
- First name
- Last name
- Nickname
- City
- Date of birth (DOB)
- Bio (“About me”)

### 3.2 Volunteer Metrics
- **Lifetime Hours (persistent)**: sum of hours from all completed volunteer activities.
- **Season Points (reset every season)**: points earned in the current season.
- **League (persistent)**: Bronze/Silver/Gold/Platinum; can increase at season end.
- Optional future: Awards/Badges (structure can exist but may be empty in MVP).

### 3.3 What Organizations Can See
Organizations can view a volunteer candidate’s:
- Full name + nickname
- City
- Bio
- League
- Public “certificates” = **public completed history**
- Awards/Badges (if present)

---

## 4) Organization Profile (Organization Account)

### 4.1 Editable Organization Fields
Organization can **create/update**:
- Organization name
- About
- Links: Instagram / Website / TikTok / other
- Contacts: Telegram and/or Phone
- City

### 4.2 Organization Status & Badges
- `verified` boolean (admin-approved)
- **No organization levels/XP/league in MVP**
- Optional future: organization badges such as:
  - Verified
  - 10+ events hosted
  - 100+ volunteer-hours hosted

---

## 5) Volunteer Opportunities (“Posts”)

### 5.1 CRUD
Verified organizations can:
- Create / Read / Update / Delete **their own** opportunities.

### 5.2 Opportunity Fields
An opportunity includes:
- City
- Title
- Description
- Category (e.g., helping people, cleaning, support, etc.)
- Deadline to apply
- Date range (start/end date)
- Time range (from/to) — system calculates planned hours
- **Max 12 hours/day** (hard constraint)
- Capacity (number of available spots)
- Age restriction (e.g., 16+, 18+)
- Contacts (Telegram/phone)
- **Points Reward** (fixed, set by org, limited by platform)

### 5.3 Opportunity Statuses
- `draft`
- `open`
- `closed`
- `cancelled`
- `completed`

---

## 6) Applications (Volunteer → Opportunity)

### 6.1 CRUD
Volunteers can:
- Create / Read / Update / Delete **their own** application.

### 6.2 Application Content
When applying:
- Volunteer profile info is **auto-submitted** (no re-typing every time).
- Volunteer can add an optional message field (“Note to organization”).

### 6.3 Application Statuses
- `applied`
- `waitlist`
- `accepted`
- `rejected`
- `withdrawn` (volunteer отказался before start)
- `completed`
- `no_show`

---

## 7) Organization Candidate Management

For each opportunity, the organization can:
- View a **list of candidates** with statuses
- Accept candidates (`accepted`)
- Put candidates on waitlist (`waitlist`)
- Reject candidates (`rejected`)
- Open candidate details:
  - Volunteer profile
  - Volunteer message from application

**Waitlist logic:**
- If a spot opens (volunteer withdraws), org can promote from waitlist.

---

## 8) Scheduling & Overlap Rule (Hard Constraint)

A volunteer **cannot apply** to an opportunity if its time interval **overlaps** with another opportunity the volunteer is already engaged in (accepted/active) for that time window.

- Rule is based on **time interval overlap**, not just same date.
- Example:
  - 10:00–12:00 and 16:00–18:00 on same day → allowed  
  - 10:00–12:00 and 11:00–13:00 → **blocked**

---

## 9) Withdrawals, No-Show, Penalties & Strikes

### 9.1 Withdrawal
Volunteer can withdraw **only before start time**.

### 9.2 Penalties
- Penalties apply to **season points**.
- The closer to the start, the higher the penalty (logic defined in scoring config).

### 9.3 No-Show
- `no_show` is a special case:
  - stronger points penalty
  - adds a **strike**

### 9.4 Strikes
- “Warning” and “Strike” are the same concept.
- Strikes are used for discipline (optionally: too many strikes → temporary restriction on applying).

---

## 10) Completion Confirmation (MVP Rule)

**No QR in MVP.**

- Organization marks attendance outcome:
  - `completed` or `no_show`
- System actions:
  - If `completed`:
    - add **Points Reward** to volunteer’s **season points**
    - add planned hours to volunteer’s **lifetime hours**
    - add record to “completed history” (public)
  - If `no_show`:
    - apply points penalty
    - add strike

---

## 11) “Certificates” (MVP Definition)

In MVP:
- “Certificates” = **public completed history**
- Optional: organization can attach a **PDF** to a completed record
  - stored in Supabase Storage
  - referenced via `pdf_url` on the completion record

No special PDF generation is required for MVP.

---

## 12) Seasons, Leagues & Mini-Groups

### 12.1 Seasons
- Default season length: **90 days**
- Ideally configurable by admin (recommended fixed options like 30/60/90/120).
- Seasons run automatically by date; end triggers rollover.

### 12.2 Leagues
Four leagues:
- Bronze
- Silver
- Gold
- Platinum

League is **persistent** and can be increased at season end.

### 12.3 Mini-Groups
- Volunteers compete within mini-groups **inside their current league**.
- Group size: **20**
- Groups start at **season start**.
- Volunteers who join after season start are assigned into an **existing group** in their league.

### 12.4 Season Points Reset
- **Season points reset** at the end of each season.

### 12.5 Promotion Rules (End of Season)
- Max promotion: **+1 league per season**
- Promotion per mini-group:
  - If group size **>= 15** → promote **Top 5**
  - Else → promote **Top 3**
- Everyone else stays in current league.

### 12.6 Annual Reset (Planned Future)
- Once per year: reset leagues (future feature)
- Issue annual award: `"X League in Y Year"` (future feature)

---

## 13) Search & Filtering (Volunteer Feed)

Volunteers can browse opportunities with filters:
- City (default = volunteer’s city)
- Category
- Deadline date
- Event date range
- Organization
- **Points Reward range** (points given to volunteer)

No award/badge filter in MVP.

---

## 14) Notifications (In-App)

Minimum notification events:
- Application status changed: accepted / waitlist / rejected
- Opportunity updated (date/time/description/contact)
- Opportunity cancelled
- Completion/no-show/penalty/strike
- Optional: deadline soon

---

## 15) Audit Logs (Required)

MVP must include **audit logs** for:
- Opportunity status changes
- Application status changes
- Completion/no-show marking
- Points awards/penalties
- Strike events

Log fields should include:
- actor (volunteer/org/admin)
- action type
- target entity (opportunity/application/completion)
- before/after snapshot (or key diffs)
- timestamp

Purpose:
- dispute review
- fraud detection
- admin moderation

---

# UI Design Standard (Themeable, Deep, Modern)

## A) Design Principles
- Depth through **brightness hierarchy**, borders, soft shadows, and subtle highlights.
- “Light falloff” / “spotlight” effect on surfaces to create a premium, layered UI.
- Clean, minimal, high-contrast text (readability first).

## B) Theme & Tokens (Must-Have)
All colors must be centrally changeable via **CSS variables** (design tokens).  
Use tokens like:
- `--bg`
- `--surface`
- `--surface-2`
- `--text`
- `--muted`
- `--border`
- `--accent`
- `--accent-2`
- `--success`
- `--warning`
- `--danger`

**Tailwind must map to tokens**, so changing tokens updates all components.

## C) Light/Dark Mode
- Use `next-themes` with `class` strategy (`class="dark"`).
- Dark mode:
  - near-black background
  - cards slightly brighter
  - soft inner highlights
  - subtle vignette possible
- Light mode:
  - soft gray background
  - white cards
  - subtle shadow + border

## D) Core Component System (Required)
Build reusable components under `/components`:
- Layout: `AppShell`, `Sidebar`, `TopNav`
- UI atoms:
  - `Button`
  - `Input`, `Textarea`, `Select`
  - `Badge`
  - `Card/SurfaceCard` (variants surface/surface-2)
  - `Modal/Drawer`
  - `Table`
  - `Tabs`
  - `Pagination`
  - `EmptyState`
  - `Skeleton`
  - `Toast` (optional)
- System: `ThemeToggle`

## E) Visual Depth Implementation
- Cards should use:
  - subtle border (`border` token)
  - soft shadow
  - inner highlight (very subtle)
  - optional radial gradient overlay to simulate “spotlight”
- Hover states:
  - slightly brighter surface
  - slightly stronger border or shadow
- Focus states:
  - accessible focus ring based on `accent`

## F) Typography & Spacing
- Consistent spacing scale (Tailwind defaults ok).
- Rounded corners: prefer `2xl`.
- Clear hierarchy:
  - page title
  - section headings
  - muted helper text
- Avoid visual noise: no heavy gradients, keep them subtle.

---

## Implementation Notes (Non-UI)
- Strict TypeScript everywhere.
- Supabase RLS policies:
  - volunteers: only own applications/profile edits; read open opportunities.
  - organizations: only own opportunities; view candidates for own opportunities; mark completion.
  - admin: verify organizations; manage seasons.
- In MVP, points numbers and penalty schedule are configurable in a single place (constants/config table).

---
