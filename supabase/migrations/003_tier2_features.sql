-- ============================================
-- TripEdge AI — Migration 003: Tier 2 Features
-- Live Companion, Fitness Pacing, AI Negotiator
-- ============================================

-- ============================================
-- LIVE TRIP COMPANION
-- ============================================

-- Active trips (when user is currently traveling)
create table public.active_trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  itinerary_id uuid references public.itineraries,
  city text not null,
  country text,
  start_date date not null,
  end_date date not null,
  current_day int not null default 1,
  is_active boolean not null default true,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create unique index idx_active_trips_user on public.active_trips (user_id) where is_active = true;

-- Companion suggestions pushed to user
create table public.companion_suggestions (
  id uuid primary key default uuid_generate_v4(),
  active_trip_id uuid not null references public.active_trips on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  suggestion_type text not null check (suggestion_type in (
    'nearby_gem', 'weather_alert', 'timing_window',
    'deal_nearby', 'transit_tip', 'crowd_alert',
    'event_nearby', 'safety_alert', 'backup_plan'
  )),
  priority text not null check (priority in ('high', 'medium', 'low')),
  title text not null,
  body text not null,
  action_label text,                       -- "Navigate", "Swap plan", etc.
  action_data jsonb,                       -- { type: "navigate", lat, lng } or { type: "swap", new_activity_id }
  meta jsonb not null default '{}',        -- distance, rating, wait time, etc.
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  trigger_radius_m int,                    -- how close user needs to be
  weather_condition text,                  -- if weather-triggered
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_dismissed boolean not null default false,
  is_acted_on boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_companion_trip on public.companion_suggestions (active_trip_id, is_dismissed, priority);
create index idx_companion_user_active on public.companion_suggestions (user_id, is_dismissed) where is_dismissed = false;

-- User location pings (for proximity-based suggestions)
create table public.user_location_pings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  active_trip_id uuid references public.active_trips on delete set null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  accuracy_m int,
  pinged_at timestamptz not null default now()
);

-- Only keep last 100 pings per user (cleanup via cron)
create index idx_location_pings_user on public.user_location_pings (user_id, pinged_at desc);

-- Weather cache for trip cities
create table public.weather_cache (
  id uuid primary key default uuid_generate_v4(),
  city text not null,
  forecast_date date not null,
  hourly_forecast jsonb not null,          -- array of { hour, temp_c, condition, rain_pct, wind_kph }
  fetched_at timestamptz not null default now()
);

create unique index idx_weather_city_date on public.weather_cache (city, forecast_date);


-- ============================================
-- FITNESS-AWARE PACING
-- ============================================

-- User fitness profile (synced from Apple Health / Google Fit)
create table public.fitness_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade unique,
  source text not null check (source in ('apple_health', 'google_fit', 'manual', 'inferred')),
  avg_daily_steps int,
  comfort_zone_steps int,                  -- max before fatigue sets in
  fatigue_threshold_hour int,              -- hour of day when energy typically drops (0-23)
  preferred_rest_duration_min int default 45,
  walking_speed_kmh numeric(3,1) default 4.5,
  mobility_notes text,                     -- "bad knees", "stroller", etc.
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily activity log (synced or manual)
create table public.daily_activity (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  activity_date date not null,
  steps int not null default 0,
  distance_km numeric(5,2),
  active_minutes int,
  flights_climbed int,
  resting_hr int,
  energy_level int check (energy_level between 1 and 10), -- self-reported or inferred
  synced_at timestamptz not null default now()
);

create unique index idx_daily_activity_user_date on public.daily_activity (user_id, activity_date);

-- Paced itinerary items (enhanced with fitness data)
create table public.paced_itinerary_items (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references public.itineraries on delete cascade,
  sort_order int not null,
  time_slot text not null,                 -- "9:00 AM"
  activity_name text not null,
  activity_type text check (activity_type in ('food', 'gem', 'culture', 'adventure', 'relax', 'transport', 'stay')),
  estimated_steps int not null default 0,
  estimated_duration_min int not null,
  energy_demand text check (energy_demand in ('low', 'medium', 'high', 'rest')),
  predicted_energy_pct int,                -- predicted user energy at this point
  is_ai_inserted boolean not null default false,  -- rest breaks, swaps
  ai_note text,                            -- explanation of why AI modified
  original_activity text,                  -- what was here before AI swapped
  latitude numeric(10,7),
  longitude numeric(10,7),
  google_place_id text
);

create index idx_paced_items_itinerary on public.paced_itinerary_items (itinerary_id, sort_order);


-- ============================================
-- AI NEGOTIATOR / PRICE COMPARISON
-- ============================================

-- Price comparison snapshots
create table public.price_comparisons (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes on delete cascade,
  search_params jsonb not null,            -- { dates, adults, cabin_class, etc. }
  sites jsonb not null,                    -- array of { name, price, url, logo, note }
  cheapest_site text not null,
  cheapest_price numeric(10,2) not null,
  fetched_at timestamptz not null default now()
);

create index idx_comparisons_route on public.price_comparisons (route_id, fetched_at desc);

-- AI-found booking hacks per search
create table public.negotiator_hacks (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references public.price_comparisons on delete cascade,
  hack_type text not null check (hack_type in (
    'timing', 'nearby_airport', 'split_ticket',
    'package_deal', 'direct_booking', 'hidden_city',
    'day_of_week', 'vpn_pricing', 'loyalty_match',
    'error_fare', 'cashback_stack'
  )),
  title text not null,
  description text not null,
  estimated_savings numeric(10,2) not null,
  confidence_pct int check (confidence_pct between 0 and 100),
  action_url text,
  action_label text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_negotiator_hacks_comparison on public.negotiator_hacks (comparison_id);

-- AI Negotiator "best pick" (the final recommendation)
create table public.negotiator_picks (
  id uuid primary key default uuid_generate_v4(),
  comparison_id uuid not null references public.price_comparisons on delete cascade,
  user_id uuid references public.profiles on delete set null,
  recommended_price numeric(10,2) not null,
  recommended_method text not null,        -- "Fly EWR on Tuesday"
  total_savings numeric(10,2) not null,
  hacks_applied uuid[],                    -- which negotiator_hacks contributed
  booking_steps jsonb,                     -- step-by-step to execute
  created_at timestamptz not null default now()
);

-- User search history for negotiator
create table public.negotiator_searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  origin text not null,
  destination text not null,
  depart_date date,
  return_date date,
  adults int not null default 1,
  comparison_id uuid references public.price_comparisons,
  pick_id uuid references public.negotiator_picks,
  searched_at timestamptz not null default now()
);

create index idx_negotiator_searches_user on public.negotiator_searches (user_id, searched_at desc);


-- ============================================
-- RLS POLICIES
-- ============================================

alter table public.active_trips enable row level security;
alter table public.companion_suggestions enable row level security;
alter table public.user_location_pings enable row level security;
alter table public.weather_cache enable row level security;
alter table public.fitness_profiles enable row level security;
alter table public.daily_activity enable row level security;
alter table public.paced_itinerary_items enable row level security;
alter table public.price_comparisons enable row level security;
alter table public.negotiator_hacks enable row level security;
alter table public.negotiator_picks enable row level security;
alter table public.negotiator_searches enable row level security;

-- Users manage their own data
create policy "own_active_trips" on public.active_trips for all using (auth.uid() = user_id);
create policy "own_companion" on public.companion_suggestions for all using (auth.uid() = user_id);
create policy "own_location" on public.user_location_pings for all using (auth.uid() = user_id);
create policy "own_fitness" on public.fitness_profiles for all using (auth.uid() = user_id);
create policy "own_activity" on public.daily_activity for all using (auth.uid() = user_id);
create policy "own_searches" on public.negotiator_searches for all using (auth.uid() = user_id);

-- Weather and comparisons readable by authenticated
create policy "weather_read" on public.weather_cache for select using (auth.role() = 'authenticated');
create policy "comparisons_read" on public.price_comparisons for select using (auth.role() = 'authenticated');
create policy "hacks_read" on public.negotiator_hacks for select using (auth.role() = 'authenticated');
create policy "picks_read" on public.negotiator_picks for select using (auth.role() = 'authenticated');

-- Paced items: accessible if user owns the itinerary
create policy "paced_items_via_itinerary" on public.paced_itinerary_items for all using (
  exists (select 1 from public.itineraries where id = itinerary_id and user_id = auth.uid())
);

-- Realtime for companion suggestions
alter publication supabase_realtime add table public.companion_suggestions;
