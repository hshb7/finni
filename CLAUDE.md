# CLAUDE.md

<!-- Finni Health -->
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Patient Management Dashboard — a full-stack healthcare web app for managing patient records, analytics, appointments, visits, immunizations, and prescriptions with pharmacy locator. See `project_spec.md` for the complete specification.

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript, shadcn/ui, Tailwind CSS v4, React Hook Form + Zod, TanStack Query, React Router v7, Recharts, Mapbox GL JS + react-map-gl, Framer Motion
- **Auth:** Supabase Auth (email/password) with `@supabase/supabase-js` client
- **Backend:** Python FastAPI + SQLModel
- **Database:** Supabase (hosted PostgreSQL)
- **External APIs:** Google Places API (pharmacy search), Mapbox Geocoding API

## Project Structure

```
client/          # React + Vite frontend
  src/
    components/
      ui/        # shadcn/ui base components
      layout/    # AppShell, Sidebar, Header
      dashboard/ # Stats cards + charts
      patients/  # PatientTable, StatusBadge, create/, profile/, forms/, prescribe/
    contexts/    # AuthContext (Supabase auth state + user profile/settings)
    hooks/       # TanStack Query hooks
    lib/         # API client, validation schemas, constants, supabase client, theme utils
    pages/       # Dashboard, PatientCreate, PatientProfile, PrescriptionFlow, Login, Register, Profile, Settings
server/          # Python FastAPI backend
  app/
    main.py      # App entry, CORS, startup
    models.py    # SQLModel table definitions
    schemas.py   # Pydantic request/response schemas
    database.py  # Supabase connection (QueuePool + transaction pooler)
    seed.py      # Demo data generator (~50 patients)
    routes/      # patients, appointments, visits, immunizations, prescriptions, pharmacies, stats
```

## Development Commands

### Frontend (client/)
```bash
npm install            # Install dependencies
npm run dev            # Start dev server (Vite)
npm run build          # Production build
npm run lint           # Run linter
```

### Backend (server/)
```bash
pip install -r requirements.txt          # Install dependencies
uvicorn app.main:app --reload            # Start dev server (auto-reload)
curl -X POST http://localhost:8000/api/seedData  # Seed ~50 demo patients (run once)
```

API docs auto-generated at `/docs` (Swagger UI).

### Environment Variables
- **Frontend** (`client/.env.local`): `VITE_API_BASE_URL`, `VITE_MAPBOX_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Backend** (`server/.env`): `DATABASE_URL` (Supabase transaction pooler, port 6543), `GOOGLE_PLACES_API_KEY`, `MAPBOX_ACCESS_TOKEN`

### Deployment
- **Frontend:** Vercel — root directory `client/`, auto-detects Vite, SPA rewrites in `client/vercel.json`
- **Backend:** Render (free tier) — root directory `server/`, config in `server/render.yaml`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- After deploying backend, update `VITE_API_BASE_URL` in Vercel env vars to the Render URL (e.g. `https://finni-api-xxxx.onrender.com/api`)
- Render free tier spins down after 15 min of inactivity (~30s cold start)

## Architecture

### API Design
RPC-style endpoint naming (e.g., `/api/getPatients`, `/api/createPatient`, `/api/editDemographics/{id}`). Not RESTful — each endpoint name describes its action. The Google Places pharmacy search is proxied through the backend to keep the API key server-side.

### Data Model (11 clinical tables + 2 user tables)
- **Core:** `patients` (main record + `avatar_url`), `emergency_contacts` (1:many), `insurance_info` (1:1), `medical_info` (1:1), `preferred_pharmacy` (1:1)
- **Clinical:** `appointments`, `visits`, `immunizations`, `prescriptions`, `medications` (10 preloaded)
- **Tracking:** `status_history` (chronological log of status changes)
- **User:** `user_profiles` (display_name, role, phone, avatar_url), `user_settings` (theme, notifications_enabled, page_size, date_format) — both keyed by `auth_user_id` from Supabase Auth
- **Statuses:** Inquiry, Onboarding, Active, Churned (any-to-any transitions, all changes logged)

### Database CHECK Constraints
The Supabase schema has CHECK constraints on several columns — values must exactly match:
- **patients.sex:** `Male`, `Female`, `Other`
- **patients.status / status_history:** `Inquiry`, `Onboarding`, `Active`, `Churned`
- **appointments.appointment_type:** `Check-up`, `Follow-up`, `Initial Consultation`, `Urgent`, `Other`
- **appointments.status:** `Scheduled`, `Completed`, `Cancelled`, `No-Show`
- **visits.visit_type:** `Check-up`, `Follow-up`, `Sick Visit`, `Procedure`, `Other`
- **emergency_contacts.relationship:** `Parent`, `Spouse`, `Sibling`, `Guardian`, `Other`
- **insurance_info.holder_relationship:** `Self`, `Spouse`, `Parent`, `Other`
- **medications.form:** `tablet`, `capsule`, `inhaler`, `liquid`

### API Endpoints (25 + health + seed)

**Patients (9 endpoints):**
- `GET /api/getPatients` — paginated list with `page`, `page_size`, `status`, `search`, `sort_by`, `sort_order` params
- `GET /api/getPatient/{id}` — full detail with relationships (1:1 via joinedload, 1:many via selectinload)
- `POST /api/createPatient` — multi-step creation (contacts, insurance, medical optional); auto-creates StatusHistory
- `PATCH /api/editDemographics/{id}` — partial update of patient fields
- `PATCH /api/editStatus/{id}` — status change with automatic StatusHistory logging
- `PUT /api/editContacts/{id}` — full replacement of emergency contacts
- `PUT /api/editInsurance/{id}` — upsert insurance info
- `PUT /api/editMedical/{id}` — upsert medical info
- `PUT /api/editPharmacy/{id}` — upsert preferred pharmacy

**Appointments / Visits / Immunizations (3 each = 9 endpoints):**
- `GET /api/get{Resource}s/{patient_id}` — list by patient, ordered by date desc
- `POST /api/create{Resource}/{patient_id}` — create for patient (404 if patient not found)
- `PATCH /api/edit{Resource}/{id}` — partial update (404 if not found)

**Prescriptions (3 endpoints):**
- `GET /api/getMedications` — all medications sorted by name
- `GET /api/getPrescriptions/{patient_id}` — with eager-loaded medication
- `POST /api/createPrescription/{patient_id}` — creates prescription; optionally upserts preferred pharmacy

**Pharmacies (1 endpoint):**
- `GET /api/getNearbyPharmacies?lat=&lng=&radius=` — Google Places API proxy

**Stats (7 endpoints):**
- `GET /api/getStatsOverview` — patient counts grouped by status
- `GET /api/getStatsTrends` — monthly status transition counts (DATE_TRUNC pivot)
- `GET /api/getRecentAppointments` — upcoming scheduled appointments (optional `month` param for calendar mode)
- `GET /api/getCareGaps` — patients needing follow-up with no scheduled appointment
- `GET /api/getNewPatientsTrend` — monthly new patient registration counts
- `GET /api/getTopMedications` — most prescribed medications
- `GET /api/getRecentActivity` — aggregated recent events across 5 tables (UNION ALL, top 20)

**Utility:**
- `GET /api/health` — health check
- `POST /api/seedData` — generates ~50 demo patients (skips if data exists)

### Authentication
- **Provider:** Supabase Auth (email/password sign-in and sign-up)
- **Client:** `@supabase/supabase-js` initialized in `client/src/lib/supabase.ts` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Context:** `AuthProvider` in `client/src/contexts/AuthContext.tsx` — exposes `user`, `profile` (from `user_profiles`), `settings` (from `user_settings`), `isLoading`, `signOut`, `refreshProfile`, `refreshSettings`
- **Route protection:** `ProtectedRoute` component wraps `AppShell`; redirects unauthenticated users to `/login`
- **Auth pages:** `/login` (email + password), `/register` (display_name + email + password + confirm)
- **User pages:** `/profile` (edit display name, role, phone, avatar from 12 preset options), `/settings` (theme, notifications toggle, page size, date format)
- **Theme sync:** ThemeToggle persists preference to both `localStorage` and `user_settings` table; `AuthProvider` applies server-stored theme on login
- **User data flow:** Supabase Auth → `onAuthStateChange` listener → fetch `user_profiles` + `user_settings` → populate context

### Frontend Patterns
- **Pages:** Dashboard (`/`), Patients (`/patients`), PatientCreate (`/patients/new`), PatientProfile (`/patients/:id`), PrescriptionFlow (`/patients/:id/prescribe`), Login (`/login`), Register (`/register`), Profile (`/profile`), Settings (`/settings`)
- **Profile editing:** Each section has a dedicated Edit button opening a modal form (not inline editing)
- **Patient creation:** 6-step multi-step workflow; single `useForm` with `createPatientSchema` across all steps; per-step validation via `form.trigger([...fields])`; steps 3-5 are optional with skip messaging; direction-aware CSS slide animations on step transitions; progress bar (`<Progress>`) with numbered step circles inside the card; submit handler transforms form values to `CreatePatientRequest` (strips empty optionals)
- **Prescription flow:** 3 steps — medication autocomplete, pharmacy search with map, confirmation
- **Server state:** TanStack Query for all API data fetching/caching
- **Form validation:** Zod schemas mirroring backend validation rules

### Performance Optimizations
- **Connection pooling:** Backend uses Supabase **transaction pooler** (port 6543) with SQLAlchemy `QueuePool` (`pool_size=5, max_overflow=10, pool_pre_ping=True`) to reuse connections instead of opening a new TCP+TLS connection per request
- **Query staleTime:** Patient list and detail queries use `staleTime: 30_000` (30s) to serve cached data on re-visits and prevent unnecessary refetches
- **Next-page prefetch:** PatientTable prefetches page N+1 in the background whenever the current page loads, making pagination feel instant
- **Hover prefetch:** PatientTable prefetches patient detail data on row hover (`onMouseEnter`), so the profile page loads near-instantly when clicked
- **Eager loading strategy:** `getPatient/{id}` uses `joinedload` for 1:1 relationships (insurance, medical, pharmacy) and `selectinload` for 1:many — reduces round trips from 9 to 7 queries

### Key Design Decisions
- No delete functionality (healthcare data retention)
- Supabase Auth for authentication (email/password); user profiles and settings stored in custom tables
- US-only addresses (state abbreviations, 5-digit zips)
- Patient table is server-side paginated, filterable, searchable, sortable with next-page prefetch
- Status changes auto-log to `status_history` for timeline/trend charts
- Dark mode support via theme toggle
- Sidebar "Recent Patients" section is live data (fetched from API), not hardcoded

## Design System & UI Reference

### Theme
- **Ghibli Studio** theme for shadcn/ui — warm earth tones, soft greens, OKLCH color values
- Font: **Nunito** (loaded from Google Fonts)
- Light primary: `oklch(0.71 0.10 111.99)` (olive green); Dark primary: `oklch(0.72 0.12 145.00)` (forest green)
- Radius: `0.625rem` base
- CSS variables defined in `client/src/index.css` (`:root` for light, `.dark` for dark)

### Application Shell
- Source reference: `application-shell-05/` (shadcn Studio block, Next.js)
- Migrated to Vite + React Router in `client/src/components/layout/`
- **Layout:** Floating sidebar (`variant='floating'`, `collapsible='icon'`) + primary-color header bar + muted background
- **Sidebar width:** `17.5rem` (expanded), `3.5rem` (icon-only)
- **Header:** Muted background bar with greeting (uses authenticated user's display name), search, header icons with Dock magnification animation, profile dropdown (shows authenticated user avatar/name)
- **Header icon Dock:** Icons in the top-right (search, theme toggle, activity, notifications, profile avatar) are wrapped in a `<Dock>` component that applies macOS-style magnification on hover using Framer Motion (`useMotionValue` + `useSpring` + `useTransform`)
- **Notification dot:** Conditional red dot on bell icon — only renders when upcoming appointments or care gaps exist
- **No footer** (removed from original block)
- **Branding:** "Finni Health" with logo SVG
- **Navigation:** Dashboard, Patients (sidebar); Recent Patients section (live data from API, avatar initials)
- **Content area:** `<Outlet />` for React Router nested routes

### Shell Adaptations from Original Block
- "Payment" branding → "Finni Health"
- "Pages" sidebar items → Dashboard + Patients navigation
- "Recipients" section → "Recent Patients" (avatar images with skin-tone tint, live data from `usePatients` hook)
- Language dropdown → Light/Dark theme toggle (single-click with circular reveal animation)
- Footer removed entirely
- `<a href>` links → React Router `<NavLink>`
- External avatar images → `<AvatarImage>` with CDN avatars (shadcnstudio.com) + `<AvatarFallback>` initials; `.avatar-pfp` class for skin-tone tint
- Content cards → `<Outlet />` for routed pages

### Dark Mode
- Class-based toggle (`dark` class on `<html>`)
- Flash prevention: inline script in `index.html` reads `localStorage.theme` before React hydration
- ThemeToggle component at `client/src/components/layout/ThemeToggle.tsx` — single-click toggle (light ↔ dark), no dropdown
- Uses **View Transitions API** for a circular reveal animation on theme switch (falls back to instant toggle in unsupported browsers)
- Persists to both `localStorage` key `theme` and `user_settings` table (syncs on login)

### Animations & Motion
- **Dock magnification:** Header icons use Framer Motion springs for macOS-style hover magnification (`client/src/components/ui/dock.tsx`). Uses `useMotionValue` + `useSpring` + `useTransform` with `mass: 0.1, stiffness: 150, damping: 12`.
- **Dialog 3D pop:** Dialogs use CSS `@keyframes` with `perspective(800px) rotateX()` for an Aceternity-style spring entrance. Custom animation replaces shadcn default zoom.
- **Overlay blur:** Dialog and Sheet overlays use `backdrop-blur-sm` + `bg-black/40` instead of default `bg-black/50`.
- **Theme circular reveal:** View Transitions API with `clipPath` circle expansion from click origin (700ms ease-out).
- **Avatar skin tint:** `.avatar-pfp` class applies sepia/saturate/hue-rotate CSS filters for warm skin tones on avatar images, with theme-aware variants for light/dark mode.

### Status Color System
All status colors are defined as CSS custom properties in `client/src/index.css` and registered as Tailwind theme colors. Use these consistently everywhere — charts, text, dots, icons.

**CSS variables** (light/dark defined in `:root` / `.dark`):
- `--status-inquiry` / `--status-onboarding` / `--status-active` / `--status-churned`

**Tailwind utilities** (via `@theme inline` mapping):
- `text-status-inquiry`, `bg-status-inquiry`, etc.

**Patient status mapping:**
- **Inquiry:** `status-inquiry` (blue, hue 230)
- **Onboarding:** `status-onboarding` (amber, hue 75)
- **Active:** `status-active` (green, hue 145)
- **Churned:** `status-churned` (red, hue 27)

**Appointment status mapping** (same palette):
- **Scheduled** → `status-inquiry` (blue)
- **Completed** → `status-active` (green)
- **Cancelled** → `status-onboarding` (amber)
- **No-Show** → `status-churned` (red)

### Status Indicator Pattern
**NEVER use pill/badge components (`<Badge>`) for status indicators, counts, or labels.** They look generic and AI-generated. Instead use:
- **Status text:** colored dot (`size-2 rounded-full bg-status-*`) + colored text (`text-status-*`)
- **Counts/metadata:** plain text with `text-muted-foreground`, no background
- **Contextual labels:** plain colored text, no rounded background or border
- The `<Badge>` component from shadcn/ui should NOT be used for status display anywhere in the app

### Avatar System
- **Preset avatars:** 12 avatar options from `cdn.shadcnstudio.com` defined in `AVATAR_OPTIONS` (`client/src/lib/constants.ts`)
- **Skin-tone tint:** `.avatar-pfp` CSS class applies warm skin-tone filters via `sepia() saturate() hue-rotate()` with light/dark mode variants
- **Patient avatars:** `patients` table has `avatar_url` column; displayed in PatientHeader, PatientTable rows, and Recent Patients sidebar
- **User avatars:** `user_profiles` table has `avatar_url`; selectable in Profile page and shown in header/sidebar dropdowns
- **Fallback:** `<AvatarFallback>` shows initials via `getInitials()` utility from `client/src/lib/utils.ts`

### Component & Spacing Conventions
- All UI primitives from shadcn/ui (`client/src/components/ui/`)
- Icons from `lucide-react`
- Layout components in `client/src/components/layout/`
- Pages in `client/src/pages/`
- Use `cn()` from `@/lib/utils` for conditional class merging
- Single quotes in JSX attributes (matching original block style)

**Branching:**
- ALWAYS create a feature branch before starting major changes
- NEVER commit directly to `main`
- Branch naming: `feature/description` or `fix/description`

**Git workflow for major changes:**
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Develop and commit on the feature branch
3. Test locally before pushing:
   - `npm run dev` – start dev server at localhost:3000
   - `npm run lint` – check for linting errors
   - `npm run build` – production build to catch type errors
4. Push the branch: `git push -u origin feature/your-feature-name`
5. Create a PR to merge into `main`
6. Use the `/update-docs-and-commit` slash command for commits – this ensures docs are updated alongside code changes

**Commits:**
- Write clear commit messages describing the change
- Keep commits focused on single changes
- DO not mention that it was written by claude or anything claude related in the commit message or pr

**Pull Requests:**
- Create PRs for all changes to `main`
- NEVER force push to `main`
- Include description of what changed and why

**Before pushing:**
1. Run `npm run lint`
2. Run `npm run build` to catch type errors

## Documentation
- [Project Spec](docs/project_spec.md) - Full requirements, API specs, tech details
- [Architecture](docs/architecture.md) - System design and data flow
- [Project Status](docs/project_status.md) - Current progress
- Update files in the docs folder after major milestones and major additions to the project.
- Update this CLAUDE.md file every time we come across a common error.

## Common Errors & Gotchas

- **Zod enum default values:** When initializing form default values for Zod enum fields (e.g., `holder_relationship` from `insuranceSchema`), you can't use `undefined` — TypeScript rejects it. Use `'' as any` with an eslint-disable comment instead.
- **`zodResolver` type mismatch:** Zod v4 + `@hookform/resolvers` v5 has type issues with `z.coerce`/`.default()`. Always use `zodResolver(schema) as any` cast.
- **shadcn `npx shadcn add`:** May create a literal `@/` directory instead of resolving path alias to `src/`. Manually move files to `src/` after install.
- **`<Toaster />`:** Must be in `App.tsx` for toast notifications from sonner to work.
- **`verbatimModuleSyntax: true`:** Use `import type` for type-only imports in tsconfig.
- **Supabase pooler region:** Project is in **us-west-2** — pooler host is `aws-0-us-west-2.pooler.supabase.com` (NOT us-east-1). Uses transaction pooler port 6543.
- **Step indicator visibility:** Don't use `ring-*` or `bg-primary/10` for step circles on the page background — they're invisible against the Ghibli theme. Place step indicators inside a Card component for contrast.
- **CSS animations for step transitions:** Use CSS `@keyframes` with a React state-based `key` prop (not `useRef`) to trigger remount and replay the animation on step change.