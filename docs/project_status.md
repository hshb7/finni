# Project Status

**Last updated:** 2026-02-23

## Overall Progress

| Layer | Status | Progress |
|-------|--------|----------|
| Frontend Shell & Theme | Done | 100% |
| Frontend Pages | Done | 100% |
| Frontend Components (patients, dashboard) | Done | 100% |
| Frontend Hooks & API Client | Done | 100% |
| Authentication & User Management | Done | 100% |
| Animations & Motion | Done | 100% |
| Backend API | Done | 100% |
| Database Schema | Done | 100% |
| Seed Data | Done | 100% |
| External API Integration | Done (pharmacy proxy) | 100% |

**Estimated overall: ~100%** — All pages, components, backend endpoints, authentication, and animations are complete. Notifications and activity feed are wired to live data. All cosmetic components are data-driven.

---

## What's Done

### Frontend Scaffolding (Complete)
- [x] Vite + React 19 + TypeScript project initialized
- [x] Tailwind CSS v4 configured
- [x] shadcn/ui initialized with `components.json`
- [x] Path alias `@/*` → `src/` working
- [x] ESLint configured for TypeScript + React
- [x] `npm run build` passes cleanly (421 KB JS, 62 KB CSS)

### Design System (Complete)
- [x] Ghibli Studio theme applied — OKLCH color variables in `index.css`
- [x] Light mode (olive green primary) and dark mode (forest green primary)
- [x] Nunito font loaded from Google Fonts
- [x] CSS variables for all semantic colors, radius, shadows

### Application Shell (Complete)
- [x] `AppShell.tsx` — floating sidebar + primary-color header + content outlet
- [x] Sidebar navigation: Dashboard, Patients (with `NavLink` active states)
- [x] Recent Patients section in sidebar (live data from `usePatients` hook)
- [x] "Finni Health" branding with custom SVG logo
- [x] `MenuTrigger.tsx` — sidebar toggle (expand/collapse/mobile)
- [x] `SearchDialog.tsx` — command palette search (live API search with debounce)
- [x] `ActivityDialog.tsx` — right-side activity feed sheet (live data from `useRecentActivity` hook)
- [x] `NotificationDropdown.tsx` — tabbed notifications dropdown (live data: Inbox = upcoming appointments, General = care gaps)
- [x] `ProfileDropdown.tsx` — user profile dropdown menu
- [x] `SidebarUserDropdown.tsx` — sidebar footer user menu

### Dark Mode (Complete)
- [x] Class-based toggle (`dark` class on `<html>`)
- [x] `ThemeToggle.tsx` — Light/Dark/System dropdown
- [x] Flash prevention script in `index.html`
- [x] Persists to `localStorage` key `theme`

### UI Components (28 installed)
- [x] avatar, badge, button, calendar, card, chart
- [x] collapsible, command, dialog, dropdown-menu, form
- [x] input, label, pagination, popover, progress
- [x] select, separator, sheet, sidebar, skeleton
- [x] sonner, switch, table, tabs, textarea, tooltip
- [x] Custom: dock (Framer Motion magnification)

### Routing (Complete)
- [x] React Router v7 with `BrowserRouter`
- [x] 9 routes defined: `/login`, `/register`, `/`, `/patients`, `/patients/new`, `/patients/:id`, `/patients/:id/prescribe`, `/profile`, `/settings`
- [x] Public routes: `/login`, `/register`
- [x] Protected routes nested under `ProtectedRoute` + `AppShell` layout

### Environment Variables (Configured)
- [x] `client/.env.local` — `VITE_API_BASE_URL`, `VITE_MAPBOX_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [x] `server/.env` — `DATABASE_URL`, `GOOGLE_PLACES_API_KEY`, `MAPBOX_ACCESS_TOKEN`

### Frontend API Client & Hooks (Complete — Phase 4)

- [x] `lib/constants.ts` — All enum values as `as const` arrays matching database CHECK constraints (statuses, sex, relationships, appointment types, visit types, medication forms, sort columns, US states)
- [x] `lib/types.ts` — TypeScript interfaces mirroring all 17 backend Pydantic response schemas + 14 request body interfaces + param types
- [x] `lib/schemas.ts` — Zod v4 validation schemas for all forms (basic info, contact/address, emergency contacts, insurance, medical, demographics edit, status edit, appointments, visits, immunizations, prescriptions, pharmacy)
- [x] `lib/api.ts` — Fetch wrapper with `ApiError` class + 24 typed endpoint functions matching all backend routes
- [x] `lib/query-keys.ts` — Centralized TanStack Query key factory (patients, appointments, visits, immunizations, prescriptions, medications, pharmacies, stats)
- [x] `hooks/use-patients.ts` — 9 hooks (usePatients with keepPreviousData + staleTime 30s, usePatient with staleTime 30s, useCreatePatient, useEditDemographics, useEditStatus, useEditContacts, useEditInsurance, useEditMedical, useEditPharmacy) with cache invalidation
- [x] `hooks/use-appointments.ts` — 3 hooks (useAppointments, useCreateAppointment, useEditAppointment)
- [x] `hooks/use-visits.ts` — 3 hooks (useVisits, useCreateVisit, useEditVisit)
- [x] `hooks/use-immunizations.ts` — 3 hooks (useImmunizations, useCreateImmunization, useEditImmunization)
- [x] `hooks/use-prescriptions.ts` — 3 hooks (useMedications with staleTime: Infinity, usePrescriptions, useCreatePrescription)
- [x] `hooks/use-pharmacies.ts` — 1 hook (useNearbyPharmacies with enabled guard and 5min staleTime)
- [x] `hooks/use-stats.ts` — 7 hooks (useStatsOverview, useStatsTrends, useRecentAppointments, useCareGaps, useNewPatientsTrend, useTopMedications, useRecentActivity)
- [x] `main.tsx` — QueryClientProvider wrapping App (staleTime: 2min, retry: 1, refetchOnWindowFocus: false)

### Backend API (Complete — 24 endpoints + health + seed)

- [x] `server/requirements.txt` — Python dependencies (FastAPI, SQLModel, httpx, pydantic, psycopg2, uvicorn, python-dotenv)
- [x] `server/app/main.py` — FastAPI app, CORS, route registration, seed endpoint
- [x] `server/app/database.py` — Supabase/SQLModel engine + QueuePool (transaction pooler port 6543, pool_size=5)
- [x] `server/app/models.py` — 11 SQLModel table definitions with relationships
- [x] `server/app/schemas.py` — All Pydantic request/response DTOs
- [x] `server/app/seed.py` — Demo data generator (~50 patients with full related data spanning 6 months)
- [x] `server/app/routes/patients.py` — 9 endpoints (paginated list with filter/search/sort, detail with joinedload for 1:1 + selectinload for 1:many, create with auto status history, edit demographics/status/contacts/insurance/medical/pharmacy)
- [x] `server/app/routes/appointments.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/visits.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/immunizations.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/prescriptions.py` — 3 endpoints (medications list, prescriptions list, create with preferred pharmacy upsert)
- [x] `server/app/routes/pharmacies.py` — Google Places nearby search proxy (async httpx)
- [x] `server/app/routes/stats.py` — Dashboard overview + trends + recent appointments + care gaps + new patients trend + top medications + recent activity (7 endpoints)

### Database Schema (Complete — 11 clinical tables + 2 user tables + 10 seeded medications)

- [x] `patients` — core patient record with status tracking + `avatar_url`
- [x] `emergency_contacts` — 1:many with patients
- [x] `insurance_info` — 1:1 with patients
- [x] `medical_info` — 1:1 with patients
- [x] `preferred_pharmacy` — 1:1 with patients
- [x] `appointments` — 1:many with patients
- [x] `visits` — 1:many with patients
- [x] `immunizations` — 1:many with patients
- [x] `prescriptions` — 1:many with patients
- [x] `medications` — lookup table (10 preloaded entries)
- [x] `status_history` — 1:many chronological status change log
- [x] `user_profiles` — user display info (display_name, role, phone, avatar_url), keyed by `auth_user_id`
- [x] `user_settings` — user preferences (theme, notifications_enabled, page_size, date_format), keyed by `auth_user_id`

### Seed Data (Complete — 50 patients seeded)

- [x] 50 demo patients with realistic names, addresses across 16 US cities
- [x] Status distribution weighted: ~50% Active, ~20% Onboarding, ~15% Inquiry, ~15% Churned
- [x] Each patient has: 1-2 emergency contacts, insurance (80%), medical info (70%), preferred pharmacy (60%)
- [x] 0-4 appointments, 0-3 visits, 0-3 immunizations, 0-2 prescriptions per patient
- [x] Full status history chains matching current status (Inquiry -> Onboarding -> Active -> Churned)
- [x] All data spans 6 months of history for realistic trend charts

### Frontend Pages (Complete)

- [x] `Dashboard.tsx` — stats cards, charts (Recharts), patient table, calendar, care gaps, top medications
- [x] `PatientCreate.tsx` — 6-step multi-step form with progress bar, skip logic, slide animations, review step
- [x] `PatientProfile.tsx` — 4 tabs (Overview, Appointments, Clinical, Prescriptions & Status), 9 edit/create dialogs
- [x] `PrescriptionFlow.tsx` — 3-step flow (medication autocomplete, pharmacy map with Mapbox + Google Places, confirmation)
- [x] `Login.tsx` — email/password sign-in with Supabase Auth
- [x] `Register.tsx` — display name + email/password sign-up with password confirmation
- [x] `Profile.tsx` — edit display name, role, phone, avatar (12 preset options with selection grid)
- [x] `Settings.tsx` — theme picker (light/dark/system cards), notifications toggle (Switch), page size, date format

### Frontend Feature Components (Complete)

**Dashboard:**
- [x] Stats cards (5 status summary cards including total)
- [x] Calendar with appointment dots
- [x] Care gaps list
- [x] New patients trend chart (with empty state)
- [x] Top medications bar chart
- [x] Status trends area chart (with empty state)
- [x] Patient table with server-side pagination, filtering, sorting, search

**Patient Creation (7 components):**
- [x] `StepIndicator.tsx` — progress bar + numbered circles with completed/current/skipped/upcoming states
- [x] `Step1BasicInfo.tsx` — name, DOB, sex, language
- [x] `Step2ContactAddress.tsx` — phone, email, address
- [x] `Step3EmergencyContacts.tsx` — useFieldArray, optional with skip
- [x] `Step4Insurance.tsx` — optional with skip
- [x] `Step5Medical.tsx` — optional with skip
- [x] `Step6Review.tsx` — read-only summary with edit-step callbacks
- [x] Slide animation on step transitions (CSS keyframes, direction-aware)

**Patient Profile (22 components):**
- [x] 4 tabs: Overview, Appointments, Clinical, Prescriptions & Status
- [x] 9 edit/create dialogs with react-hook-form + zod validation
- [x] Loading skeleton + 404 error state

**Prescription Flow (5 components):**
- [x] `MedicationStep.tsx` — search/autocomplete from medications list
- [x] `PharmacyStep.tsx` — split-view layout with map + list
- [x] `PharmacyMap.tsx` — Mapbox map with pharmacy pins
- [x] `PharmacyList.tsx` — scrollable pharmacy list from Google Places
- [x] `ConfirmationStep.tsx` — summary + save

### Phase 9: Polish (Complete)
- [x] Search dialog wired to live patient API (debounced search, recent patients, navigation)
- [x] Empty states for TrendsAreaChart and NewPatientsTrend
- [x] Responsive layout (sidebar collapse, table scroll, map stacking)
- [x] Loading skeleton loaders on all pages

### Phase 10: Live Notifications & Activity Feed (Complete)
- [x] `GET /getRecentActivity` — UNION ALL aggregation across 5 tables (appointments, visits, prescriptions, status_history, patients), top 20 by timestamp
- [x] `NotificationDropdown` — Inbox tab shows upcoming appointments, General tab shows care gaps, dynamic count badge, loading/empty states, clickable navigation
- [x] `ActivityDialog` — live activity feed with event-type icons, relative timestamps, color-coded status dots, loading/empty states
- [x] `AppShell` — conditional red dot on bell icon (only shows when upcoming appointments or care gaps exist)
- [x] `formatRelativeTime` helper added to `lib/format.ts`

### Phase 11: Authentication & User Management (Complete)
- [x] Supabase Auth integration (`@supabase/supabase-js` client in `lib/supabase.ts`)
- [x] `AuthProvider` context — manages auth state, user profile, user settings, sign-out
- [x] `ProtectedRoute` component — redirects unauthenticated users to `/login`
- [x] Login page — email/password with Zod validation (`loginSchema`)
- [x] Register page — display name + email/password + confirmation (`registerSchema`)
- [x] Profile page — edit display name, role (Staff/Administrator/Provider/Nurse), phone, avatar grid (12 presets)
- [x] Settings page — theme picker, notifications toggle, page size (10/20/50), date format
- [x] Zod schemas: `loginSchema`, `registerSchema`, `profileSchema`, `settingsSchema`
- [x] `user_profiles` and `user_settings` Supabase tables (created via DB triggers on signup)
- [x] ProfileDropdown & SidebarUserDropdown wired to auth context (dynamic name, email, avatar, role)
- [x] Logout functionality in both dropdown menus (clears auth state, navigates to `/login`)

### Phase 12: Avatars & Visual Polish (Complete)
- [x] `avatar_url` column added to `patients` table (backend model + schemas + frontend types)
- [x] 12 preset avatar options from shadcnstudio.com CDN (`AVATAR_OPTIONS` in constants)
- [x] `.avatar-pfp` CSS class — sepia/saturate/hue-rotate skin-tone tint with light/dark variants
- [x] Avatar picker in EditDemographicsDialog (grid with selection ring + checkmark)
- [x] Patient avatars displayed in PatientHeader, sidebar Recent Patients, patient table
- [x] `getInitials()` utility in `lib/utils.ts` for AvatarFallback text

### Phase 13: Animations & Microinteractions (Complete)
- [x] Dock magnification (`client/src/components/ui/dock.tsx`) — Framer Motion springs for macOS-style header icon hover effect
- [x] Theme toggle circular reveal — View Transitions API with `clipPath` circle expansion (700ms ease-out)
- [x] ThemeToggle changed from 3-option dropdown to single-click light ↔ dark toggle
- [x] Dialog 3D spring pop — CSS `perspective(800px) rotateX(40deg)` entrance animation (400ms)
- [x] Dialog/Sheet overlay blur — `backdrop-blur-sm` + reduced opacity (`bg-black/40`)
- [x] `framer-motion` added as dependency

---

## Build Order (Complete)

### ~~Phase 1: Backend Foundation~~ (DONE)
### ~~Phase 2: Core API Endpoints~~ (DONE — 24 endpoints implemented)
### ~~Phase 3: Seed Data~~ (DONE — 50 patients seeded)
### ~~Phase 4: Frontend — API Client & Hooks~~ (DONE)
### ~~Phase 5: Frontend — Dashboard~~ (DONE)
### ~~Phase 6: Frontend — Patient Profile~~ (DONE)
### ~~Phase 7: Frontend — Patient Creation~~ (DONE)
### ~~Phase 8: Frontend — Prescription Flow~~ (DONE)
### ~~Phase 9: Polish~~ (DONE)
### ~~Phase 10: Live Notifications & Activity Feed~~ (DONE)
### ~~Phase 11: Authentication & User Management~~ (DONE)
### ~~Phase 12: Avatars & Visual Polish~~ (DONE)
### ~~Phase 13: Animations & Microinteractions~~ (DONE)
