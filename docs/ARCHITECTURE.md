# Architecture

## System Overview

Finni Health is a patient management dashboard built as a three-tier application: a React SPA frontend, a Python FastAPI backend, and a Supabase-hosted PostgreSQL database. External services (Google Places, Mapbox) are proxied through the backend to protect API keys.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React 19 + Vite + TypeScript                                 │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │  │
│  │  │ React Router│  │ TanStack     │  │ React Hook Form     │   │  │
│  │  │ v7          │  │ Query        │  │ + Zod               │   │  │
│  │  │ (routing)   │  │ (server      │  │ (form state +       │   │  │
│  │  │             │  │  state)      │  │  validation)        │   │  │
│  │  └─────────────┘  └──────┬───────┘  └─────────────────────┘   │  │
│  │                          │                                    │  │
│  │  ┌───────────────────────┼────────────────────────────────┐   │  │
│  │  │ shadcn/ui + Tailwind CSS v4 + Recharts + react-map-gl  │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────┬───────────────────────────────────┘  │
│                              │ HTTP (fetch)                         │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                                │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Python FastAPI + SQLModel                                     │  │
│  │                                                                │  │
│  │  /api/getPatients          /api/createPatient                  │  │
│  │  /api/getPatient/{id}      /api/editDemographics/{id}          │  │
│  │  /api/getAppointments/..   /api/createAppointment/..           │  │
│  │  /api/getVisits/..         /api/createVisit/..                 │  │
│  │  /api/getImmunizations/..  /api/createImmunization/..          │  │
│  │  /api/getMedications       /api/createPrescription/..          │  │
│  │  /api/getStatsOverview     /api/getStatsTrends                 │  │
│  │  /api/getNearbyPharmacies  /api/seedData                       │  │
│  │                                                                │  │
│  └────────┬──────────────────────────────────┬────────────────────┘  │
│           │                                  │                       │
│           ▼                                  ▼                       │
│  ┌─────────────────┐              ┌─────────────────────┐            │
│  │ Supabase        │              │ External APIs       │            │
│  │ (PostgreSQL)    │              │ - Google Places     │            │
│  │                 │              │ - Mapbox Geocoding  │            │
│  └─────────────────┘              └─────────────────────┘            │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Dashboard Load

```
Browser                    Backend                    Database
  │                          │                          │
  │  GET /api/getStatsOverview                          │
  │─────────────────────────►│  SELECT count(*) FROM    │
  │                          │  patients GROUP BY status│
  │                          │─────────────────────────►│
  │                          │◄─────────────────────────│
  │◄─────────────────────────│  { inquiry: 12, ... }    │
  │                          │                          │
  │  GET /api/getStatsTrends │                          │
  │─────────────────────────►│  SELECT FROM             │
  │                          │  status_history          │
  │                          │  GROUP BY period         │
  │                          │─────────────────────────►│
  │◄─────────────────────────│  [{ period, counts }]    │
  │                          │                          │
  │  GET /api/getPatients    │                          │
  │  ?page=1&page_size=10    │                          │
  │─────────────────────────►│  SELECT FROM patients    │
  │                          │  LIMIT 10 OFFSET 0       │
  │                          │─────────────────────────►│
  │◄─────────────────────────│  { data, total, page }   │
  │                          │                          │
  │  TanStack Query caches   │                          │
  │  all responses           │                          │
```

### 2. Patient Creation (6-Step Flow)

```
Browser (multi-step form)         Backend              Database
  │                                  │                    │
  │  Step 1: Basic Info (required)   │                    │
  │  Step 2: Contact (required)      │                    │
  │  Step 3: Emergency (optional)    │                    │
  │  Step 4: Insurance (optional)    │                    │
  │  Step 5: Medical (optional)      │                    │
  │  Step 6: Review                  │                    │
  │                                  │                    │
  │  All steps collected in          │                    │
  │  local React state               │                    │
  │                                  │                    │
  │  POST /api/createPatient         │                    │
  │  { demographics, contacts,       │                    │
  │    insurance?, medical? }        │                    │
  │─────────────────────────────────►│                    │
  │                                  │  BEGIN TRANSACTION │
  │                                  │  INSERT patients   │
  │                                  │  INSERT emergency  │
  │                                  │  INSERT insurance? │
  │                                  │  INSERT medical?   │
  │                                  │  INSERT status_    │
  │                                  │    history (new)   │
  │                                  │─────────────────►  │
  │                                  │◄────────────────── │
  │                                  │  COMMIT            │
  │◄─────────────────────────────────│  { patient }       │
  │                                  │                    │
  │  Redirect to /patients/:id       │                    │
```

### 3. Patient Profile Load

```
Browser                          Backend                  Database
  │                                │                        │
  │  (prefetched on hover in       │                        │
  │   PatientTable via onMouseEnter)                        │
  │                                │                        │
  │  GET /api/getPatient/{id}      │                        │
  │───────────────────────────────►│                        │
  │                                │  SELECT patient        │
  │                                │  JOIN insurance_info   │  ← joinedload (1:1)
  │                                │  JOIN medical_info     │
  │                                │  JOIN preferred_pharmacy│
  │                                │───────────────────────►│
  │                                │                        │
  │                                │  SELECT IN:            │  ← selectinload (1:many)
  │                                │  emergency_contacts    │
  │                                │  appointments          │
  │                                │  visits                │
  │                                │  immunizations         │
  │                                │  prescriptions         │
  │                                │  status_history        │
  │                                │───────────────────────►│
  │◄───────────────────────────────│  { full patient obj }  │
  │                                │                        │
  │  Renders 10 profile sections   │                        │
  │  each with Edit button         │                        │
  │                                │                        │
  │  TanStack Query caches result  │                        │
  │  (staleTime: 30s)             │                        │
```

### 4. Section Edit (Modal Pattern)

```
Browser                            Backend              Database
  │                                  │                    │
  │  User clicks "Edit" on section   │                    │
  │  → Modal opens with form          │                   │
  │  → Pre-populated with current data│                   │
  │                                  │                    │
  │  Zod validates on submit         │                    │
  │                                  │                    │
  │  PATCH /api/editDemographics/{id}│                    │
  │  (or PUT for contacts/insurance) │                    │
  │─────────────────────────────────►│  UPDATE table      │
  │                                  │─────────────────►  │
  │◄─────────────────────────────────│  { updated data }  │
  │                                  │                    │
  │  TanStack Query invalidates      │                    │
  │  patient cache → section re-renders                   │
```

### 5. Prescription Flow (3-Step)

```
Browser                     Backend                 External APIs
  │                           │                        │
  │  Step 1: Medication       │                        │
  │  GET /api/getMedications  │                        │
  │──────────────────────────►│  (from medications     │
  │◄──────────────────────────│   table, 10 preloaded) │
  │  User selects medication, │                        │
  │  fills dosage/frequency   │                        │
  │                           │                        │
  │  Step 2: Pharmacy         │                        │
  │  Patient address geocoded │                        │
  │  via Mapbox (client-side) │─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►│ Mapbox Geocoding
  │◄─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │                        │ → lat/lng
  │                           │                        │
  │  GET /api/getNearbyPharmacies                      │
  │  ?lat=X&lng=Y&radius=8000│                         │
  │──────────────────────────►│  Google Places         │
  │                           │  Nearby Search ───────►│
  │                           │◄───────────────────────│
  │◄──────────────────────────│  [{ name, addr, ... }] │
  │                           │                        │
  │  Map + list rendered      │                        │
  │  User selects pharmacy    │                        │
  │                           │                        │
  │  Step 3: Confirm          │                        │
  │  POST /api/createPrescription/{patientId}          │
  │──────────────────────────►│  INSERT prescription   │
  │                           │  (optionally UPDATE    │
  │                           │   preferred_pharmacy)  │
  │◄──────────────────────────│  { prescription }      │
  │                           │                        │
  │  Redirect to profile      │                        │
```

### 6. Status Change (Auto-Logging)

```
Browser                     Backend                  Database
  │                           │                        │
  │  PATCH /api/editStatus/{id}                        │
  │  { status: "Active" }     │                        │
  │──────────────────────────►│                        │
  │                           │  Read current status   │
  │                           │  (e.g. "Onboarding")   │
  │                           │───────────────────────►│
  │                           │                        │
  │                           │  UPDATE patients       │
  │                           │  SET status = "Active" │
  │                           │───────────────────────►│
  │                           │                        │
  │                           │  INSERT status_history │
  │                           │  { old: "Onboarding",  │
  │                           │    new: "Active",      │
  │                           │    changed_at: now() } │
  │                           │───────────────────────►│
  │◄──────────────────────────│  { patient }           │
  │                           │                        │
  │  Profile timeline updates │                        │
  │  Dashboard trends update  │                        │
```

## Data Model (Entity Relationships)

```
                          ┌──────────────────┐
                          │    patients      │
                          │──────────────────│
                          │ id (PK)          │
                          │ first_name       │
                          │ last_name        │
                          │ date_of_birth    │
                          │ sex              │
                          │ email, phone     │
                          │ street, city,    │
                          │ state, zip_code  │
                          │ status           │
                          │ notes            │
                          │ created_at       │
                          │ updated_at       │
                          └────────┬─────────┘
                                   │
          ┌──────────────┬─────────┼──────────┬───────────────┐
          │              │         │          │               │
          ▼              ▼         ▼          ▼               ▼
  ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐
  │ emergency_    │ │insurance_│ │medical_  │ │preferred_ │ │status_       │
  │ contacts      │ │info      │ │info      │ │pharmacy   │ │history       │
  │───────────────│ │──────────│ │──────────│ │───────────│ │──────────────│
  │ 1:MANY        │ │ 1:1      │ │ 1:1      │ │ 1:1       │ │ 1:MANY       │
  │ name          │ │ provider │ │ diagnosis│ │ name      │ │ old_status   │
  │ relationship  │ │ policy_# │ │ allergies│ │ address   │ │ new_status   │
  │ phone, email  │ │ group_#  │ │ meds     │ │ phone     │ │ changed_at   │
  │ is_primary    │ │ holder   │ │  conditions│ │ lat, lng  │ │              │
  └───────────────┘ └──────────┘ └──────────┘ └───────────┘ └──────────────┘

          ┌──────────────┬─────────┼──────────┐
          │              │         │          │
          ▼              ▼         ▼          ▼
  ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐
  │ appointments  │ │ visits   │ │immuniza- │ │ prescriptions     │
  │───────────────│ │──────────│ │tions     │ │───────────────────│
  │ 1:MANY        │ │ 1:MANY   │ │──────────│ │ 1:MANY            │
  │ provider      │ │ provider │ │ 1:MANY   │ │ medication_id ──►─┼─┐
  │ type          │ │ type     │ │ vaccine  │ │ dosage, frequency │ │
  │ date_time     │ │ date     │ │ date     │ │ quantity, duration│ │
  │ duration      │ │ summary  │ │ dose_#   │ │ pharmacy info     │ │
  │ location      │ │ diagnosis│ │ lot_#    │ │ prescribed_at     │ │
  │ status        │ │ follow_up│ │ next_due │ │                   │ │
  └───────────────┘ └──────────┘ └──────────┘ └───────────────────┘ │
                                                                     │
                                               ┌─────────────────────┘
                                               ▼
                                       ┌───────────────┐
                                       │ medications   │
                                       │───────────────│
                                       │ LOOKUP TABLE  │
                                       │ 10 preloaded  │
                                       │ name          │
                                       │ generic_name  │
                                       │ category      │
                                       │ form          │
                                       │ dosages       │
                                       └───────────────┘
```

**13 clinical tables + 2 user tables.** All IDs are UUIDs. All timestamps are auto-generated. Foreign keys cascade from `patients`. Patients and users both have an `avatar_url` column for profile images (12 preset avatar options from shadcnstudio.com CDN).

## Frontend Architecture

### Routing

```
/login                      → Login (public, email/password)
/register                   → Register (public, name/email/password)
/                           → Dashboard (stats + patient table)
/patients                   → Patients list (redirected from Dashboard table)
/patients/new               → PatientCreate (6-step form)
/patients/:id               → PatientProfile (10 sections)
/patients/:id/prescribe     → PrescriptionFlow (3-step form)
/profile                    → User profile editor (name, role, phone, avatar)
/settings                   → App preferences (theme, notifications, page size, date format)
```

All routes are nested under `AppShell` which provides the sidebar + header layout.

### State Management

| State Type | Tool | Scope |
|-----------|------|-------|
| Auth state (user, profile, settings) | Supabase Auth + React Context | Global via `AuthProvider` |
| Server data (patients, appointments, etc.) | TanStack Query | Global cache, auto-refetch |
| Form state (creation/edit) | React Hook Form | Per-form instance |
| Form validation | Zod schemas | Mirrors backend rules |
| Theme preference | localStorage + user_settings table | Persistent, synced on login |
| UI state (modals, sidebar collapse) | React useState | Component-local |

### Component Organization

```
components/
├── ui/           shadcn/ui primitives (button, card, dialog, dock, switch, etc.)
├── layout/       Application shell (sidebar, header, dropdowns, ProtectedRoute)
├── dashboard/    Stats cards + charts (Recharts)
└── patients/
    ├── PatientTable, StatusBadge
    ├── create/    6 step components for patient creation
    ├── profile/   10 section display components + StatusTimeline
    ├── forms/     8 modal edit forms
    └── prescribe/ 5 prescription flow components (includes map)

contexts/
└── AuthContext.tsx  Auth state provider (Supabase Auth + user_profiles + user_settings)

lib/
├── supabase.ts     Supabase client initialization
├── theme.ts        Theme utility (getInitialTheme, applyTheme)
└── ...             API client, schemas, constants, types, utils
```

### API Client Pattern

TanStack Query hooks in `hooks/` wrap fetch calls to the backend:
- Queries: `usePatients()`, `usePatient(id)`, `useStats()`, etc.
- Mutations: `useCreatePatient()`, `useEditDemographics()`, etc.
- Automatic cache invalidation after mutations
- Debounced search via query key changes
- `staleTime: 30s` on patient list/detail queries to prevent redundant refetches
- Next-page prefetch on PatientTable (prefetches page N+1 when page N loads)
- Hover prefetch on patient rows (prefetches detail data on `onMouseEnter`)

## Backend Architecture

### FastAPI Application Structure

```
server/app/
├── main.py        App factory, CORS config, route registration, startup event
├── database.py    SQLModel engine + QueuePool + session dependency (Supabase transaction pooler)
├── models.py      SQLModel table classes (13 models)
├── schemas.py     Pydantic request/response DTOs
├── seed.py        Demo data generator (~50 patients, 6 months of history)
└── routes/
    ├── patients.py         Patient CRUD + section edits (9 endpoints)
    ├── appointments.py     Appointment CRUD (3 endpoints)
    ├── visits.py           Visit CRUD (3 endpoints)
    ├── immunizations.py    Immunization CRUD (3 endpoints)
    ├── prescriptions.py    Medications lookup + prescription creation (3 endpoints)
    ├── pharmacies.py       Google Places proxy (1 endpoint)
    └── stats.py            Dashboard aggregation + activity feed (7 endpoints)
```

### API Design (RPC-Style)

Endpoints are named by action, not by resource:

| Pattern | Example | HTTP Method |
|---------|---------|-------------|
| `get{Resource}` | `/api/getPatients` | GET |
| `create{Resource}` | `/api/createPatient` | POST |
| `edit{Section}` | `/api/editDemographics/{id}` | PATCH/PUT |

This is intentionally not RESTful. Each endpoint name explicitly describes what it does.

### External API Proxying

Google Places API calls go through the backend to keep the API key server-side:

```
Client                    Backend                   Google Places
  │                         │                          │
  │ GET /api/               │                          │
  │ getNearbyPharmacies     │                          │
  │ ?lat=X&lng=Y            │                          │
  │────────────────────────►│                          │
  │                         │  GET places/nearby       │
  │                         │  + API_KEY (server-side)  │
  │                         │─────────────────────────►│
  │                         │◄─────────────────────────│
  │                         │  Transform response      │
  │◄────────────────────────│  [pharmacies]            │
```

Mapbox geocoding is called client-side (token is publishable, not secret).

## Authentication & User Management

### Auth Flow

```
Browser                     Supabase Auth                Supabase DB
  │                            │                           │
  │  POST /auth/signup         │                           │
  │  { email, password,        │                           │
  │    display_name }          │                           │
  │───────────────────────────►│                           │
  │                            │  Create auth.users row    │
  │                            │  Trigger: create          │
  │                            │  user_profiles +          │
  │                            │  user_settings rows       │
  │                            │──────────────────────────►│
  │◄───────────────────────────│  { session, user }        │
  │                            │                           │
  │  AuthContext listens to    │                           │
  │  onAuthStateChange         │                           │
  │  → fetch user_profiles     │                           │
  │  → fetch user_settings     │                           │
  │  → apply stored theme      │                           │
```

### User Data Model

```
  ┌──────────────────┐
  │  auth.users       │  (Supabase managed)
  │──────────────────│
  │  id (UUID)        │
  │  email            │
  │  encrypted_password│
  └────────┬─────────┘
           │ auth_user_id
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌──────────────┐ ┌──────────────┐
│user_profiles │ │user_settings │
│──────────────│ │──────────────│
│ display_name │ │ theme        │
│ role         │ │ notifications│
│ phone        │ │ page_size    │
│ avatar_url   │ │ date_format  │
└──────────────┘ └──────────────┘
```

### Route Protection

```
App.tsx
├── /login          → Login page (public)
├── /register       → Register page (public)
└── ProtectedRoute  → checks useAuth().user
    └── AppShell    → authenticated layout
        ├── /               → Dashboard
        ├── /patients       → Patient list
        ├── /patients/new   → Patient creation
        ├── /patients/:id   → Patient profile
        ├── /patients/:id/prescribe → Prescription flow
        ├── /profile        → User profile editor
        └── /settings       → App preferences
```

## Security Considerations

- Supabase Auth for authentication (email/password sign-in/sign-up)
- Route protection via `ProtectedRoute` component (redirects to `/login` if unauthenticated)
- `user_profiles` and `user_settings` tables should have RLS policies restricting access to own rows
- No delete operations (healthcare data retention policy)
- Google Places API key kept server-side via proxy
- Mapbox token is publishable (client-side usage is fine)
- CORS configured on backend for local development
- Input validation on both client (Zod) and server (Pydantic)
- No SQL injection risk — SQLModel uses parameterized queries

## Performance Optimizations

### Backend: Connection Pooling

The backend uses Supabase's **transaction pooler** (port 6543) with SQLAlchemy's `QueuePool` instead of NullPool. This reuses pre-established TCP+TLS connections across requests rather than opening a new connection for each one.

- `pool_size=5` — 5 persistent connections
- `max_overflow=10` — up to 10 additional connections under load
- `pool_pre_ping=True` — validates connections before use (handles idle disconnects)
- psycopg2 (SQLModel's default driver) does not use prepared statements, making it compatible with Supabase transaction mode

### Backend: Eager Loading Strategy

`GET /api/getPatient/{id}` uses a mixed loading strategy to minimize database round trips:
- **`joinedload`** for 1:1 relationships (insurance_info, medical_info, preferred_pharmacy) — fetched via LEFT JOIN in the main query
- **`selectinload`** for 1:many relationships (emergency_contacts, appointments, visits, immunizations, prescriptions, status_history) — fetched via separate SELECT IN queries

This results in 7 queries instead of 10 (1 main + 6 selectinloads vs 1 main + 9 selectinloads).

### Frontend: Query Caching & Prefetching

- **staleTime (30s):** Patient list and detail queries won't refetch for 30 seconds after loading, making back-navigation and tab switches instant
- **keepPreviousData:** Patient table shows the previous page's data (dimmed) while the next page loads
- **Next-page prefetch:** When page N loads, page N+1 is prefetched in the background
- **Hover prefetch:** Hovering a patient row in the table prefetches that patient's full detail data, so the profile page loads near-instantly when clicked

## Environment Configuration

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | `client/.env.local` | Backend API URL |
| `VITE_MAPBOX_TOKEN` | `client/.env.local` | Mapbox map display (client) |
| `VITE_SUPABASE_URL` | `client/.env.local` | Supabase project URL (auth) |
| `VITE_SUPABASE_ANON_KEY` | `client/.env.local` | Supabase anon/public key (auth) |
| `DATABASE_URL` | `server/.env` | Supabase PostgreSQL connection |
| `GOOGLE_PLACES_API_KEY` | `server/.env` | Pharmacy search (server-only) |
| `MAPBOX_ACCESS_TOKEN` | `server/.env` | Address geocoding (server) |
