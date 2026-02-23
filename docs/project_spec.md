# Patient Management Dashboard — Project Specification

## Overview

A full-stack web application that enables healthcare providers to manage comprehensive patient records, view practice analytics, schedule appointments, log visits, track immunizations, and create prescriptions with pharmacy locator functionality. Built with a focus on UI/UX quality, comprehensive data modeling, and real-world healthcare workflows.

## Features

### 1. Dashboard (Home Page)

**Analytics Section:**
- 4 status summary cards showing patient counts by status (Inquiry, Onboarding, Active, Churned)
- Pie/donut chart displaying patient status distribution
- Bar chart comparing patient counts across statuses
- Line/area chart showing status change trends over time (sourced from status_history table)

**Patient Table:**
- Server-side paginated table displaying all patients
- Columns: Name, Date of Birth, Status, City/State, Phone, Created Date
- Status filter dropdown (filter by Inquiry, Onboarding, Active, Churned)
- Name search (debounced input)
- Column sorting (clickable headers)
- Color-coded status badges
- Row click navigates to patient profile page
- "Add Patient" button navigates to multi-step creation flow

### 2. Patient Profile Page (`/patients/:id`)

Full patient record organized into editable sections. Each section has its own "Edit" button that opens a focused modal form.

**Header:**
- Back to Dashboard link
- Patient full name, status badge, date of birth, calculated age, sex
- "Create Prescription" button

**Sections:**

| Section | Fields | Edit UX |
|---------|--------|---------|
| Demographics | Name, DOB, sex, language, email, phone, full address | Modal form |
| Emergency Contacts | Name, relationship, phone, email, primary flag (supports multiple) | Modal form |
| Insurance | Provider name, policy number, group number, policy holder, relationship | Modal form |
| Medical Information | Primary diagnosis, allergies, current medications, additional conditions | Modal form |
| Preferred Pharmacy | Pharmacy name, address, phone | Modal form (auto-populates from prescription flow) |
| Upcoming Appointments | Date/time, provider, type, duration, location, status | Modal form for create/edit |
| Past Visits | Date, provider, type, summary, diagnosis, follow-up needed | Modal form for create/edit |
| Immunization Records | Vaccine name, date administered, provider, dose number, lot number, next due | Modal form for create/edit |
| Prescriptions | Medication, dosage, frequency, quantity, pharmacy, date | Read-only list + "Create Prescription" button |
| Status & Notes | Current status, referral source, notes, chronological status timeline | Modal form (status change logs to history) |

### 3. Patient Creation Flow (`/patients/new`)

Multi-step full-page workflow for adding a new patient. Emphasizes collecting key data while reassuring doctors that optional info can be added later.

**Step 1 — Basic Info (Required):**
- First name, middle name (optional), last name
- Date of birth, sex
- Primary language

**Step 2 — Contact & Address (Required):**
- Phone, email
- Street, city, state (dropdown), zip code

**Step 3 — Emergency Contacts (Optional):**
- Name, relationship, phone, email
- UI message: "Don't have this info? No worries — you can add it later from the patient profile."
- "Skip for now →" link alongside "Next" button

**Step 4 — Insurance (Optional):**
- Provider name, policy number, group number, holder name, holder relationship
- UI message: "Insurance details not available yet? You can always add this later."
- "Skip for now →" link

**Step 5 — Medical Info (Optional):**
- Primary diagnosis, allergies, current medications, additional conditions
- UI message: "Don't have the full medical history? Add what you know — the rest can come later."
- "Skip for now →" link

**Step 6 — Review & Create:**
- Summary card showing all entered data organized by section
- Sections that were skipped show "Not provided — can be added later"
- "Create Patient" button → calls API with all collected data → redirects to new patient's profile page

### 4. Prescription Flow (`/patients/:id/prescribe`)

Multi-step workflow:

**Step 1 — Select Medication:**
- Search/autocomplete from 10 preloaded medications
- Displays: medication name, generic name, category, form
- On select, form expands with: dosage (from medication's common dosages), frequency, quantity, duration, notes

**Step 2 — Select Pharmacy:**
- Automatically geocodes patient's home address using Mapbox Geocoding API
- Queries Google Places API (via backend proxy) for nearby pharmacies
- Split-view layout:
  - Left: scrollable pharmacy list sorted by distance (name, address, distance, rating, open/closed)
  - Right: Mapbox map with blue dot (patient home) and red pins (pharmacies)
- Click list item or map pin to select pharmacy
- Selection syncs between list and map
- Option to save selected pharmacy as patient's preferred pharmacy

**Step 3 — Confirm & Save:**
- Summary showing patient, medication details, and selected pharmacy
- "Confirm & Save" creates the prescription and redirects to patient profile

## Data Model

### patients
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| first_name | VARCHAR(100) | yes | |
| middle_name | VARCHAR(100) | no | |
| last_name | VARCHAR(100) | yes | |
| date_of_birth | DATE | yes | Must be in the past, max 150 years |
| sex | VARCHAR(20) | yes | Male, Female, Other |
| primary_language | VARCHAR(50) | no | Default: "English" |
| email | VARCHAR(255) | no | Valid email format |
| phone | VARCHAR(20) | no | US phone format |
| street | VARCHAR(255) | yes | |
| city | VARCHAR(100) | yes | |
| state | VARCHAR(2) | yes | US state abbreviation |
| zip_code | VARCHAR(5) | yes | 5 digits |
| status | VARCHAR(20) | yes | Default: "Inquiry" |
| referral_source | VARCHAR(255) | no | |
| notes | TEXT | no | |
| created_at | TIMESTAMP | auto | |
| updated_at | TIMESTAMP | auto | |

### emergency_contacts
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| name | VARCHAR(200) | yes | |
| relationship | VARCHAR(50) | yes | Parent, Spouse, Sibling, Guardian, Other |
| phone | VARCHAR(20) | yes | |
| email | VARCHAR(255) | no | |
| is_primary | BOOLEAN | no | Default: false |

### insurance_info (1:1 with patient)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients, UNIQUE |
| provider_name | VARCHAR(200) | yes | |
| policy_number | VARCHAR(100) | yes | |
| group_number | VARCHAR(100) | no | |
| holder_name | VARCHAR(200) | yes | |
| holder_relationship | VARCHAR(50) | yes | Self, Spouse, Parent, Other |

### medical_info (1:1 with patient)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients, UNIQUE |
| primary_diagnosis | VARCHAR(255) | no | |
| allergies | TEXT | no | |
| current_medications | TEXT | no | |
| additional_conditions | TEXT | no | |

### preferred_pharmacy (1:1 with patient)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients, UNIQUE |
| name | VARCHAR(255) | yes | |
| address | VARCHAR(500) | yes | |
| phone | VARCHAR(20) | no | |
| lat | FLOAT | no | For map display |
| lng | FLOAT | no | |

### appointments
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| provider_name | VARCHAR(200) | yes | Doctor/therapist name |
| appointment_type | VARCHAR(100) | yes | Check-up, Follow-up, Initial Consultation, Urgent, Other |
| date_time | TIMESTAMP | yes | Scheduled date and time |
| duration_minutes | INT | no | Default: 30 |
| location | VARCHAR(255) | no | Office/clinic location |
| notes | TEXT | no | |
| status | VARCHAR(20) | yes | Scheduled, Completed, Cancelled, No-Show |
| created_at | TIMESTAMP | auto | |

### visits (past visit / encounter records)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| provider_name | VARCHAR(200) | yes | |
| visit_type | VARCHAR(100) | yes | Check-up, Follow-up, Sick Visit, Procedure, Other |
| visit_date | DATE | yes | |
| summary | TEXT | no | Visit summary/notes |
| diagnosis | VARCHAR(255) | no | Diagnosis from visit |
| follow_up_needed | BOOLEAN | no | Default: false |
| created_at | TIMESTAMP | auto | |

### immunizations
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| vaccine_name | VARCHAR(200) | yes | e.g. Influenza, COVID-19, Tdap, MMR |
| date_administered | DATE | yes | |
| administered_by | VARCHAR(200) | no | Provider name |
| dose_number | INT | no | e.g. 1, 2, 3 for multi-dose vaccines |
| lot_number | VARCHAR(100) | no | |
| next_due_date | DATE | no | |
| notes | TEXT | no | |

### medications (preloaded, 10 entries)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| name | VARCHAR(200) | yes | Unique |
| generic_name | VARCHAR(200) | no | |
| description | TEXT | no | |
| common_dosages | VARCHAR(255) | yes | e.g. "250mg, 500mg" |
| form | VARCHAR(50) | yes | tablet, capsule, inhaler, liquid |
| category | VARCHAR(100) | yes | e.g. "Antibiotic", "Pain Relief" |

**Preloaded medications:**

| Name | Generic | Category | Form | Common Dosages |
|------|---------|----------|------|---------------|
| Amoxicillin | Amoxicillin | Antibiotic | Capsule | 250mg, 500mg |
| Lisinopril | Lisinopril | Blood Pressure | Tablet | 5mg, 10mg, 20mg |
| Metformin | Metformin HCl | Diabetes | Tablet | 500mg, 850mg, 1000mg |
| Atorvastatin | Atorvastatin Calcium | Cholesterol | Tablet | 10mg, 20mg, 40mg, 80mg |
| Omeprazole | Omeprazole | Acid Reflux | Capsule | 20mg, 40mg |
| Albuterol | Albuterol Sulfate | Respiratory | Inhaler | 90mcg/actuation |
| Ibuprofen | Ibuprofen | Pain Relief | Tablet | 200mg, 400mg, 600mg, 800mg |
| Sertraline | Sertraline HCl | Antidepressant | Tablet | 25mg, 50mg, 100mg |
| Gabapentin | Gabapentin | Nerve Pain | Capsule | 100mg, 300mg, 400mg |
| Prednisone | Prednisone | Anti-inflammatory | Tablet | 5mg, 10mg, 20mg, 50mg |

### prescriptions
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| medication_id | UUID | yes | FK → medications |
| dosage | VARCHAR(100) | yes | e.g. "500mg" |
| frequency | VARCHAR(100) | yes | e.g. "Twice daily" |
| quantity | INT | yes | e.g. 30 |
| duration | VARCHAR(100) | no | e.g. "14 days" |
| pharmacy_name | VARCHAR(255) | yes | |
| pharmacy_address | VARCHAR(500) | yes | |
| pharmacy_lat | FLOAT | yes | |
| pharmacy_lng | FLOAT | yes | |
| prescribed_at | TIMESTAMP | auto | |
| notes | TEXT | no | |

### status_history
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | |
| patient_id | UUID | yes | FK → patients |
| old_status | VARCHAR(20) | no | null on creation |
| new_status | VARCHAR(20) | yes | |
| changed_at | TIMESTAMP | auto | |

**Status values:** Inquiry, Onboarding, Active, Churned

## API Endpoints

API uses RPC-style naming — each endpoint name describes the action performed.

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getPatients` | List patients (paginated, filterable, searchable, sortable) |
| GET | `/api/getPatient/{id}` | Get full patient with all related data |
| POST | `/api/createPatient` | Create patient (from multi-step flow, all sections in one call) |
| PATCH | `/api/editDemographics/{id}` | Update demographics section |
| PATCH | `/api/editStatus/{id}` | Update status (automatically logs to status_history) |
| PUT | `/api/editContacts/{id}` | Replace all emergency contacts |
| PUT | `/api/editInsurance/{id}` | Create or update insurance info |
| PUT | `/api/editMedical/{id}` | Create or update medical info |
| PUT | `/api/editPharmacy/{id}` | Create or update preferred pharmacy |

**GET `/api/getPatients` query params:**
- `page` (default: 1)
- `page_size` (default: 10)
- `status` (filter by status)
- `search` (search by patient name)
- `sort_by` (column name)
- `sort_order` (asc/desc)

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getAppointments/{patientId}` | List patient's appointments |
| POST | `/api/createAppointment/{patientId}` | Schedule new appointment |
| PATCH | `/api/editAppointment/{id}` | Update an appointment |

### Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getVisits/{patientId}` | List patient's past visits |
| POST | `/api/createVisit/{patientId}` | Log a new visit |
| PATCH | `/api/editVisit/{id}` | Update a visit record |

### Immunizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getImmunizations/{patientId}` | List patient's immunizations |
| POST | `/api/createImmunization/{patientId}` | Add immunization record |
| PATCH | `/api/editImmunization/{id}` | Update an immunization |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getMedications` | List all preloaded medications |
| GET | `/api/getPrescriptions/{patientId}` | List patient's prescriptions |
| POST | `/api/createPrescription/{patientId}` | Create new prescription |

### Pharmacy Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getNearbyPharmacies` | Proxy to Google Places Nearby Search |

**Query params:** `lat`, `lng`, `radius` (meters, default 8000)

Backend proxies to Google Places API (keeps API key server-side). Returns: pharmacy name, address, lat/lng, distance, rating, open_now status.

### Dashboard Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/getStatsOverview` | Patient counts by status |
| GET | `/api/getStatsTrends` | Status changes grouped by time period |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seedData` | Seed database with demo data (dev only) |

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Analytics + charts + patient table |
| `/patients/new` | Patient Creation Flow | Multi-step form (6 steps) |
| `/patients/:id` | Patient Profile | Full record with all sections |
| `/patients/:id/prescribe` | Prescription Flow | Multi-step: medication → pharmacy → confirm |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| UI Components | shadcn/ui (Studio Pro template) |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | shadcn/ui charts (Recharts) |
| Maps | Mapbox GL JS + react-map-gl |
| Routing | React Router v7 |
| Server State | TanStack Query |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Supabase (hosted PostgreSQL) |
| Pharmacy Search | Google Places API (Nearby Search) |
| Geocoding | Mapbox Geocoding API |

## External Services & API Keys

| Service | Purpose | Key Type |
|---------|---------|----------|
| Supabase | Hosted PostgreSQL database | Connection string |
| Mapbox | Map display + address geocoding | Access token |
| Google Cloud | Pharmacy location search (Places API) | API key |

## Validation Rules

### Demographics
- first_name/last_name: 1-100 chars, required, allow hyphens/apostrophes
- middle_name: optional, 0-100 chars
- date_of_birth: required, must be in the past, max 150 years ago
- sex: required, one of Male/Female/Other
- email: valid format or empty
- phone: valid US format or empty
- street: required, 1-255 chars
- city: required, 1-100 chars
- state: required, valid 2-letter US state abbreviation
- zip_code: required, exactly 5 digits

### Emergency Contacts
- name: 1-200 chars, required
- relationship: required (Parent, Spouse, Sibling, Guardian, Other)
- phone: required, valid format
- email: optional, valid format if provided

### Insurance
- provider_name, policy_number, holder_name, holder_relationship: all required
- group_number: optional

### Medical
- All fields optional

### Appointments
- provider_name: required, 1-200 chars
- appointment_type: required (Check-up, Follow-up, Initial Consultation, Urgent, Other)
- date_time: required, must be in the future (for new appointments)
- duration_minutes: optional, positive integer, default 30
- status: required (Scheduled, Completed, Cancelled, No-Show)

### Visits
- provider_name: required, 1-200 chars
- visit_type: required (Check-up, Follow-up, Sick Visit, Procedure, Other)
- visit_date: required, must be in the past or today
- summary, diagnosis: optional free text

### Immunizations
- vaccine_name: required, 1-200 chars
- date_administered: required, must be in the past or today
- dose_number: optional, positive integer
- next_due_date: optional, must be in the future if provided

### Prescription
- medication_id: required, must exist in medications table
- dosage: required, from medication's common_dosages list
- frequency: required (Once daily, Twice daily, Three times daily, Four times daily, As needed, At bedtime)
- quantity: required, positive integer
- pharmacy selection: required (name, address, lat, lng)

## Non-Functional Requirements

- **Dark mode:** Toggle between light/dark themes
- **Responsive:** Sidebar collapses on mobile, tables scroll horizontally, map stacks below list on small screens
- **Loading states:** Skeleton loaders for dashboard cards, tables, profile sections
- **Error handling:** Toast notifications for API failures
- **Empty states:** Friendly messages when no data exists (e.g., "No patients yet", "No insurance on file")
- **Skip messaging:** Optional creation steps show reassuring "Don't have this? You can add it later" copy
- **Seed data:** ~50 demo patients with full data across all tables, spanning 6 months of history
- **API documentation:** Auto-generated Swagger UI at `/docs` (FastAPI built-in)

## Project Structure

```
finni/
├── client/                              # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                      # shadcn/ui base components
│   │   │   ├── layout/                  # AppShell, Sidebar, Header
│   │   │   ├── dashboard/              # Stats cards + charts
│   │   │   └── patients/
│   │   │       ├── PatientTable.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── create/              # Multi-step patient creation
│   │   │       │   ├── BasicInfoStep.tsx
│   │   │       │   ├── ContactStep.tsx
│   │   │       │   ├── EmergencyContactsStep.tsx
│   │   │       │   ├── InsuranceStep.tsx
│   │   │       │   ├── MedicalStep.tsx
│   │   │       │   └── ReviewStep.tsx
│   │   │       ├── profile/             # Patient profile sections
│   │   │       │   ├── DemographicsSection.tsx
│   │   │       │   ├── ContactsSection.tsx
│   │   │       │   ├── InsuranceSection.tsx
│   │   │       │   ├── MedicalSection.tsx
│   │   │       │   ├── PharmacySection.tsx
│   │   │       │   ├── AppointmentsSection.tsx
│   │   │       │   ├── VisitsSection.tsx
│   │   │       │   ├── ImmunizationsSection.tsx
│   │   │       │   ├── PrescriptionsSection.tsx
│   │   │       │   ├── StatusSection.tsx
│   │   │       │   └── StatusTimeline.tsx
│   │   │       ├── forms/               # Section edit forms (modals)
│   │   │       │   ├── DemographicsForm.tsx
│   │   │       │   ├── ContactsForm.tsx
│   │   │       │   ├── InsuranceForm.tsx
│   │   │       │   ├── MedicalForm.tsx
│   │   │       │   ├── PharmacyForm.tsx
│   │   │       │   ├── AppointmentForm.tsx
│   │   │       │   ├── VisitForm.tsx
│   │   │       │   └── ImmunizationForm.tsx
│   │   │       └── prescribe/           # Prescription flow steps
│   │   │           ├── MedicationStep.tsx
│   │   │           ├── PharmacyStep.tsx
│   │   │           ├── PharmacyMap.tsx
│   │   │           ├── PharmacyList.tsx
│   │   │           └── ConfirmationStep.tsx
│   │   ├── hooks/                       # TanStack Query hooks
│   │   ├── lib/                         # API client, validation schemas, constants
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PatientCreate.tsx        # Multi-step creation flow
│   │   │   ├── PatientProfile.tsx
│   │   │   └── PrescriptionFlow.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                              # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                      # App entry, CORS, startup
│   │   ├── models.py                    # SQLModel table definitions
│   │   ├── schemas.py                   # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── patients.py              # Patient CRUD + section edits
│   │   │   ├── appointments.py          # Appointment CRUD
│   │   │   ├── visits.py                # Visit CRUD
│   │   │   ├── immunizations.py         # Immunization CRUD
│   │   │   ├── prescriptions.py         # Prescription + medications
│   │   │   ├── pharmacies.py            # Google Places proxy
│   │   │   └── stats.py                 # Dashboard stats
│   │   ├── database.py                  # Supabase connection
│   │   └── seed.py                      # Demo data generator
│   ├── requirements.txt
│   └── .env.example
├── project_spec.md
├── README.md
└── .gitignore
```

## Assumptions

These decisions were made proactively and documented for transparency:

1. **No delete functionality** — Healthcare data shouldn't be casually deletable (data retention concerns)
2. **US-only addresses** — State dropdown with 2-letter abbreviations, 5-digit zip codes
3. **No authentication** — Out of scope for take-home project
4. **No duplicate detection** — Out of scope
5. **No status transition rules** — Any status can change to any other; all changes are logged
6. **Generic healthcare** — Not specific to any specialty (ABA, pediatrics, etc.)
7. **Pharmacy search returns all types** — Not limited to a single chain; uses Google Places to find any nearby pharmacy
8. **Patient creation is multi-step** — Not a quick modal; dedicated page with required + optional steps and friendly skip messaging
