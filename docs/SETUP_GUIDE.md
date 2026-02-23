# External Services Setup Guide

This guide walks you through setting up the three third-party services required by this project: **Supabase** (database), **Google Places API** (pharmacy search), and **Mapbox** (maps + geocoding).

**What you'll need before starting:**
- A GitHub account (for Supabase sign-in)
- A Google account (for Google Cloud)
- A credit card (required by Google Cloud and Mapbox, even on free tiers)

**Estimated time:** ~30 minutes total

---

## 1. Supabase (Database)

Supabase provides a hosted PostgreSQL database. The free tier requires no credit card.

### Create Account & Project

1. Go to [supabase.com](https://supabase.com) and click **Start your project**.
2. Sign in with your **GitHub account** (fastest option).
3. Click **New Project**.
4. Fill in the form:
   - **Organization:** Use your default personal org.
   - **Project Name:** `finni` (or whatever you prefer).
   - **Database Password:** Click **"Generate a password"** and **immediately copy it somewhere safe** (password manager, notes app). Supabase only shows this once — there is no "view password" button later.
   - **Region:** Pick the one closest to you (e.g., US East for East Coast).
5. Click **Create new project**. Wait ~60 seconds for provisioning.

### Get Your Connection String

1. Once the project is ready, click the **Connect** button at the top of the dashboard.
2. You'll see multiple connection options. Copy the **Transaction Mode (Supavisor)** connection string (port 6543). It looks like:
   ```
   postgres://postgres.abcdefghijklmnopqrst:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with the password you saved earlier.
4. Paste this into `server/.env` as `DATABASE_URL`.

> **Why Transaction Mode (port 6543)?** The direct connection uses IPv6 only, which fails on many networks. Transaction mode enables server-side connection multiplexing and works with SQLAlchemy's `QueuePool` for client-side connection reuse — both together eliminate per-request TCP+TLS handshake overhead. Note: psycopg2 (the default SQLModel driver) does not use prepared statements, so it is fully compatible with transaction mode.

### Important Notes

- **Free tier limits:** 500 MB storage, 2 projects, 5 GB bandwidth/month. No credit card required.
- **Auto-pause:** Free projects pause after **7 days of inactivity**. Go to the dashboard and click **Restore** to wake it up. To prevent this, set up a scheduled ping (e.g., a cron job that queries the database weekly).
- **Region is permanent** — you cannot change it after creation.

---

## 2. Google Cloud — Places API (Pharmacy Search)

The backend proxies pharmacy searches through the Google Places API (New). This requires a Google Cloud project with billing enabled.

### Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with your Google account.
2. Click the **project selector dropdown** in the top navigation bar, then click **New Project**.
3. Enter a project name (e.g., `finni-health`).
4. Click **Create**.

### Enable Billing

A credit card is required even if you stay within the free tier.

1. Go to **Billing** in the left sidebar (or [console.cloud.google.com/billing](https://console.cloud.google.com/billing)).
2. Click **Create Account** if you don't have a billing account yet.
3. Enter your payment information.
4. Link the billing account to your project.

### Enable the Places API

1. Go to **APIs & Services > Library** (left sidebar).
2. Search for **"Places API (New)"** — make sure it says **(New)**, not the legacy version.
3. Click it, then click **Enable**.

### Create an API Key

1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials > API key**.
3. Copy the key immediately.
4. Paste it into `server/.env` as `GOOGLE_PLACES_API_KEY`.

### Restrict Your API Key (Recommended)

While still on the key's settings page:

1. Under **Application restrictions**, select **IP addresses** and add your server's IP (or skip this during local development).
2. Under **API restrictions**, select **Restrict key** and check only **Places API (New)**.
3. Click **Save**.

### Set a Budget Alert

To avoid surprise charges:

1. Go to **Billing > Budgets & Alerts**.
2. Create a budget (e.g., $10/month) with email notifications.

### Free Tier & Pricing

The free tier gives you monthly free requests depending on which fields you request:

| Tier | Free Requests/Month | What Fields |
|------|---------------------|-------------|
| Essentials | 10,000 | id, location, types |
| Pro | 5,000 | displayName, formattedAddress, rating, openingHours |
| Enterprise | 1,000 | phoneNumber, website, reviews |

For pharmacy search, you'll likely need Pro-tier fields (name, address, rating, open/closed status), giving you **5,000 free requests/month**.

> **Important:** The Nearby Search (New) endpoint is a **POST** request to `https://places.googleapis.com/v1/places:searchNearby` — this is different from the legacy GET-based API. The project spec's backend proxy will need to use this format.

---

## 3. Mapbox (Maps + Geocoding)

Mapbox provides the map display and address-to-coordinates geocoding for the prescription pharmacy step.

### Create an Account

1. Go to [account.mapbox.com/auth/signup](https://account.mapbox.com/auth/signup/).
2. Enter a username, email, and password.
3. Verify your email via the confirmation link.
4. Enter your credit card information when prompted (required even for the free tier).

### Get Your Access Token

1. Go to [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/).
2. Copy the **Default public token** (starts with `pk.`). This works immediately for development.
3. Paste it into:
   - `client/.env.local` as `VITE_MAPBOX_TOKEN`
   - `server/.env` as `MAPBOX_ACCESS_TOKEN`

### Create a Production Token (Recommended for Deployment)

The default token can't be restricted by domain. For production:

1. On the tokens page, click **Create a token**.
2. Name it (e.g., `finni-production`).
3. Check scopes: **styles:read** and **fonts:read** (these cover both map display and geocoding).
4. Add your production domain under **URL restrictions** (e.g., `https://yourapp.com`).
5. Click **Create token**, confirm with your password, and **copy it immediately** — Mapbox only shows it once.

### Free Tier

| Product | Free Monthly Limit |
|---------|-------------------|
| Map loads (GL JS) | 50,000 |
| Geocoding requests | 100,000 |

A "map load" = one `Map` object initialization. Panning, zooming, etc. within the same session don't count as additional loads. These limits are very generous for development and small-scale production.

---

## Summary: Your .env Files After Setup

### `server/.env`
```
DATABASE_URL=postgres://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
GOOGLE_PLACES_API_KEY=AIzaSy...
MAPBOX_ACCESS_TOKEN=pk.ey...
```

### `client/.env.local`
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=pk.ey...
```

---

## Quick Reference: Service Dashboards

| Service | Dashboard URL |
|---------|--------------|
| Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) |
| Mapbox | [account.mapbox.com](https://account.mapbox.com) |
