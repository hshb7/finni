# Project Status

**Last updated:** 2026-02-22

## Overall Progress

| Layer | Status | Progress |
|-------|--------|----------|
| Frontend Shell & Theme | Done | 100% |
| Frontend Pages | Placeholder stubs | 5% |
| Frontend Components (patients, dashboard) | Not started | 0% |
| Frontend Hooks & API Client | Not started | 0% |
| Backend API | Done | 100% |
| Database Schema | Done | 100% |
| Seed Data | Done | 100% |
| External API Integration | Done (pharmacy proxy) | 100% |

**Estimated overall: ~40%** — Backend is complete. Frontend feature work remains.

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
- [x] Recent Patients section in sidebar (hardcoded placeholder data)
- [x] "Finni Health" branding with custom SVG logo
- [x] `MenuTrigger.tsx` — sidebar toggle (expand/collapse/mobile)
- [x] `SearchDialog.tsx` — command palette search (mock data)
- [x] `ActivityDialog.tsx` — right-side activity feed sheet (mock data)
- [x] `NotificationDropdown.tsx` — tabbed notifications dropdown (mock data)
- [x] `ProfileDropdown.tsx` — user profile dropdown menu
- [x] `SidebarUserDropdown.tsx` — sidebar footer user menu

### Dark Mode (Complete)
- [x] Class-based toggle (`dark` class on `<html>`)
- [x] `ThemeToggle.tsx` — Light/Dark/System dropdown
- [x] Flash prevention script in `index.html`
- [x] Persists to `localStorage` key `theme`

### UI Components (15 installed)
- [x] avatar, badge, button, card, collapsible
- [x] command, dialog, dropdown-menu, input, separator
- [x] sheet, sidebar, skeleton, tabs, tooltip

### Routing (Complete)
- [x] React Router v7 with `BrowserRouter`
- [x] 4 routes defined: `/`, `/patients/new`, `/patients/:id`, `/patients/:id/prescribe`
- [x] All routes nested under `AppShell` layout

### Environment Variables (Configured)
- [x] `client/.env.local` — `VITE_API_BASE_URL`, `VITE_MAPBOX_TOKEN`
- [x] `server/.env` — `DATABASE_URL`, `GOOGLE_PLACES_API_KEY`, `MAPBOX_ACCESS_TOKEN`

---

## What's Not Started

### Backend API (Complete — 24 endpoints + health + seed)

- [x] `server/requirements.txt` — Python dependencies
- [x] `server/app/main.py` — FastAPI app, CORS, route registration, seed endpoint
- [x] `server/app/database.py` — Supabase/SQLModel engine + NullPool session
- [x] `server/app/models.py` — 11 SQLModel table definitions with relationships
- [x] `server/app/schemas.py` — Pydantic request/response DTOs
- [x] `server/app/seed.py` — Demo data generator (~50 patients with full related data)
- [x] `server/app/routes/patients.py` — 9 endpoints (paginated list, detail, create, edit demographics/status/contacts/insurance/medical/pharmacy)
- [x] `server/app/routes/appointments.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/visits.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/immunizations.py` — 3 endpoints (list, create, edit)
- [x] `server/app/routes/prescriptions.py` — 3 endpoints (medications list, prescriptions list, create with preferred pharmacy upsert)
- [x] `server/app/routes/pharmacies.py` — Google Places nearby search proxy
- [x] `server/app/routes/stats.py` — Dashboard overview + monthly trends

### Database Schema (Complete — 11 tables + 10 seeded medications)

- [x] `patients` — core patient record with status tracking
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

### Frontend Pages (Stubs Only)

All 4 pages exist as files but contain only placeholder text:

- [ ] `Dashboard.tsx` — needs stats cards, charts (Recharts), patient table
- [ ] `PatientCreate.tsx` — needs 6-step multi-step form workflow
- [ ] `PatientProfile.tsx` — needs 10 profile sections with edit modals
- [ ] `PrescriptionFlow.tsx` — needs 3-step flow (medication, pharmacy map, confirm)

### Frontend Feature Components (0%)

None of these files exist yet:

**Dashboard:**
- [ ] Stats cards (4 status summary cards)
- [ ] Pie/donut chart (patient status distribution)
- [ ] Bar chart (patient counts by status)
- [ ] Line/area chart (status trends over time)

**Patient Table:**
- [ ] `PatientTable.tsx` — server-side paginated, filterable, searchable, sortable
- [ ] `StatusBadge.tsx` — color-coded status badges

**Patient Creation (6 steps):**
- [ ] `BasicInfoStep.tsx` — name, DOB, sex, language
- [ ] `ContactStep.tsx` — phone, email, address
- [ ] `EmergencyContactsStep.tsx` — optional, with skip
- [ ] `InsuranceStep.tsx` — optional, with skip
- [ ] `MedicalStep.tsx` — optional, with skip
- [ ] `ReviewStep.tsx` — summary + create button

**Patient Profile (10 sections):**
- [ ] `DemographicsSection.tsx`
- [ ] `ContactsSection.tsx`
- [ ] `InsuranceSection.tsx`
- [ ] `MedicalSection.tsx`
- [ ] `PharmacySection.tsx`
- [ ] `AppointmentsSection.tsx`
- [ ] `VisitsSection.tsx`
- [ ] `ImmunizationsSection.tsx`
- [ ] `PrescriptionsSection.tsx`
- [ ] `StatusSection.tsx` + `StatusTimeline.tsx`

**Edit Forms (8 modals):**
- [ ] `DemographicsForm.tsx`
- [ ] `ContactsForm.tsx`
- [ ] `InsuranceForm.tsx`
- [ ] `MedicalForm.tsx`
- [ ] `PharmacyForm.tsx`
- [ ] `AppointmentForm.tsx`
- [ ] `VisitForm.tsx`
- [ ] `ImmunizationForm.tsx`

**Prescription Flow (5 components):**
- [ ] `MedicationStep.tsx` — search/autocomplete
- [ ] `PharmacyStep.tsx` — split-view layout
- [ ] `PharmacyMap.tsx` — Mapbox map with pins
- [ ] `PharmacyList.tsx` — scrollable pharmacy list
- [ ] `ConfirmationStep.tsx` — summary + save

### Frontend Infrastructure (0%)

- [ ] `lib/api.ts` — fetch wrapper / API client
- [ ] `lib/schemas.ts` — Zod validation schemas
- [ ] `lib/constants.ts` — US states, status values, etc.
- [ ] `hooks/usePatients.ts` — TanStack Query hooks for patients
- [ ] `hooks/useStats.ts` — TanStack Query hooks for dashboard stats
- [ ] Additional TanStack Query hooks per resource

### Missing shadcn/ui Components

Components that will be needed but aren't installed yet:

- [ ] `table` — for PatientTable
- [ ] `select` — for dropdowns (status filter, state picker)
- [ ] `form` + `label` — for React Hook Form integration
- [ ] `textarea` — for notes fields
- [ ] `popover` + `calendar` — for date pickers
- [ ] `toast` / `sonner` — for API error/success notifications
- [ ] `chart` — for Recharts integration
- [ ] `pagination` — for patient table
- [ ] `progress` — for multi-step form progress indicator

---

## Suggested Build Order

### Phase 1: Backend Foundation
1. Create `requirements.txt` and install dependencies
2. Set up `database.py` (Supabase connection via SQLModel)
3. Define all 13 table models in `models.py`
4. Create database tables (via Supabase migration or SQLModel create_all)
5. Build `schemas.py` with Pydantic DTOs
6. Implement `main.py` with CORS and route registration

### Phase 2: Core API Endpoints
7. `routes/patients.py` — CRUD + section edits (9 endpoints)
8. `routes/stats.py` — dashboard aggregations (2 endpoints)
9. `routes/appointments.py` (3 endpoints)
10. `routes/visits.py` (3 endpoints)
11. `routes/immunizations.py` (3 endpoints)
12. `routes/prescriptions.py` (3 endpoints)
13. `routes/pharmacies.py` — Google Places proxy (1 endpoint)

### Phase 3: Seed Data
14. Build `seed.py` — generate ~50 patients with full related data
15. Run seeder to populate development database

### Phase 4: Frontend — API Client & Hooks
16. Build `lib/api.ts`, `lib/schemas.ts`, `lib/constants.ts`
17. Build TanStack Query hooks for all resources
18. Install remaining shadcn/ui components

### Phase 5: Frontend — Dashboard
19. Stats cards + charts (Recharts)
20. Patient table with server-side pagination, filtering, sorting, search

### Phase 6: Frontend — Patient Profile
21. Build 10 profile section components
22. Build 8 modal edit forms
23. Wire up to API via TanStack Query mutations

### Phase 7: Frontend — Patient Creation
24. Build 6-step multi-step form with React Hook Form + Zod
25. Progress indicator, skip messaging, review step

### Phase 8: Frontend — Prescription Flow
26. Medication autocomplete step
27. Pharmacy search with Mapbox map + Google Places list
28. Confirmation and save step

### Phase 9: Polish
29. Loading states (skeleton loaders)
30. Error handling (toast notifications)
31. Empty states
32. Responsive design (mobile sidebar, table scroll)
33. Wire shell components to real data (search, recent patients, notifications)
