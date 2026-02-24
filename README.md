# Hshb Health — Patient Management Dashboard

A full-stack patient management dashboard that allows healthcare providers to manage patient records, schedule appointments, log visits, track immunizations, and create prescriptions with an integrated pharmacy locator.

**Live demo:** [finni-three.vercel.app](https://finni-three.vercel.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI, SQLModel |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Maps | Mapbox GL, Google Places API |
| Deployment | Vercel (frontend), Render (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (free tier works)
- Mapbox access token (free tier)
- Google Places API key (free tier)

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed instructions on setting up external services.

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

**Environment variables** — create `client/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=<your-mapbox-token>
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Backend

```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend runs on `http://localhost:8000`.

**Environment variables** — create `server/.env`:

```
DATABASE_URL=<your-supabase-connection-string>
GOOGLE_PLACES_API_KEY=<your-google-api-key>
MAPBOX_ACCESS_TOKEN=<your-mapbox-token>
```

### Seed Demo Data

Once both servers are running:

```bash
curl -X POST http://localhost:8000/api/seedData
```

This populates the database with 50 demo patients and 6 months of realistic clinical data.

## API Documentation

The backend auto-generates interactive API docs via FastAPI:

- **Swagger UI:** [finni-czni.onrender.com/docs](https://finni-czni.onrender.com/docs)
- **ReDoc:** [finni-czni.onrender.com/redoc](https://finni-czni.onrender.com/redoc)

When running locally: [localhost:8000/docs](http://localhost:8000/docs)

## Database Schema

All tables use UUID primary keys with auto-generated timestamps. Patient deletions cascade to all related records.

```
patients
├── emergency_contacts    (many)
├── insurance_info        (one)
├── medical_info          (one)
├── preferred_pharmacy    (one)
├── appointments          (many)
├── visits                (many)
├── immunizations         (many)
├── prescriptions         (many)  ──→ medications (lookup)
└── status_history        (many)
```

| Table | Description |
|-------|-------------|
| `patients` | Core patient record — name, DOB, sex, address, status, contact info |
| `emergency_contacts` | Multiple contacts per patient with primary flag |
| `insurance_info` | Policy number, group number, holder details |
| `medical_info` | Primary diagnosis, allergies, current medications, conditions |
| `preferred_pharmacy` | Name, address, coordinates |
| `appointments` | Provider, type, date/time, duration, location, status |
| `visits` | Provider, type, date, diagnosis, summary, follow-up flag |
| `immunizations` | Vaccine name, dose number, lot number, next due date |
| `prescriptions` | Medication, dosage, frequency, quantity, pharmacy details |
| `medications` | Static lookup — name, generic name, common dosages, form, category |
| `status_history` | Tracks every patient status change (old → new) with timestamp |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design, data flows, and deployment architecture.
