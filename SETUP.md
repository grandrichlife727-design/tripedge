# TripEdge AI Setup

This repo is build-ready. The remaining setup is external service configuration.

## Local Files Already Prepared

- Environment file:
  - `/Users/fortunefavors/Documents/GitHub/tripedgeai/tripedge-project/.env.local`
- Combined Supabase SQL:
  - `/Users/fortunefavors/Documents/GitHub/tripedgeai/tripedge-project/supabase/migrations/all_migrations_001_005.sql`

## 1. Supabase

Create a new Supabase project for `tripedgeai`.

In Supabase SQL Editor, run either:

1. the single combined file:
   - `/Users/fortunefavors/Documents/GitHub/tripedgeai/tripedge-project/supabase/migrations/all_migrations_001_005.sql`

or

2. the individual migration files in this exact order:
   - `001_initial_schema.sql`
   - `002_new_features.sql`
   - `003_tier2_features.sql`
   - `004_trip_replay.sql`
   - `005_million_dollar_features.sql`

Then create this storage bucket:

- `trip-photos`
- public: `true`

Then copy these values into `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2. Stripe

Create these products and recurring prices:

- `Free`
- `Pro`
  - monthly: `$12`
  - annual: `$9.60`
- `Premium`
  - monthly: `$29`
  - annual: `$23.20`

Then copy these values into `.env.local`:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `STRIPE_PRICE_PREMIUM_MONTHLY`
- `STRIPE_PRICE_PREMIUM_ANNUAL`

## 3. OpenAI

Add:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_ITINERARY_MODEL`
  - recommended default: `gpt-5-mini`

## 4. Anthropic

Optional fallback only:

- `ANTHROPIC_API_KEY`

## 5. Travel Data

Choose at least one:

- Amadeus:
  - `AMADEUS_CLIENT_ID`
  - `AMADEUS_CLIENT_SECRET`
- or SerpApi:
  - `SERPAPI_KEY`

## 6. Email

Add:

- `RESEND_API_KEY`
- `EMAIL_FROM`

Recommended:

- `alerts@tripedge.ai`

## 7. App URL

For local:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

For production, replace with your deployed domain.

## 8. Run

After credentials are added:

```bash
npm run dev
```

## Current Status

The repo currently:

- builds successfully with `npm run build`
- has the new `Labs` route wired at `/app/labs`
- includes migration `005_million_dollar_features.sql`
- is not blocked by missing secrets at build time anymore

## What Still Requires Your Access

I cannot do these from the repo alone:

- create the Supabase project
- create the `trip-photos` storage bucket
- create Stripe products and prices
- generate real API keys/secrets

Once you provide those values, I can finish wiring and verify the live integrations.
