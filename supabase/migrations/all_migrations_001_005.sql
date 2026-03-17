-- ============================================
-- TripEdge AI — Supabase Schema
-- Run this in Supabase SQL Editor or as a migration
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  tier text not null default 'free' check (tier in ('free', 'pro', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  subscription_status text default 'inactive' check (subscription_status in ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  trial_ends_at timestamptz,
  itineraries_used_this_month int not null default 0,
  itinerary_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================
-- ROUTE PRICES (for Deal Scanner)
-- ============================================

create table public.routes (
  id uuid primary key default uuid_generate_v4(),
  origin text not null,          -- airport code: "NYC", "LAX"
  destination text not null,     -- airport code or city: "LIS", "TYO"
  route_type text not null check (route_type in ('flight', 'hotel')),
  carrier text,                  -- airline or hotel name
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index idx_routes_origin_dest_type on public.routes (origin, destination, route_type);

create table public.route_prices (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes on delete cascade,
  price numeric(10,2) not null,
  currency text not null default 'USD',
  fetched_at timestamptz not null default now(),
  source text not null default 'amadeus'  -- amadeus, serpapi, manual
);

create index idx_route_prices_route_fetched on public.route_prices (route_id, fetched_at desc);

-- Materialized view for deal detection
-- Compares latest price vs 30-day rolling avg
create or replace view public.active_deals as
select
  r.id as route_id,
  r.origin,
  r.destination,
  r.route_type,
  r.carrier,
  latest.price as current_price,
  avg_30.avg_price,
  round((1 - latest.price / nullif(avg_30.avg_price, 0)) * 100, 1) as savings_pct,
  latest.fetched_at as last_updated,
  case
    when (1 - latest.price / nullif(avg_30.avg_price, 0)) >= 0.45 then 'hot'
    when (1 - latest.price / nullif(avg_30.avg_price, 0)) >= 0.30 then 'warm'
    else 'watch'
  end as urgency
from public.routes r
join lateral (
  select price, fetched_at
  from public.route_prices
  where route_id = r.id
  order by fetched_at desc
  limit 1
) latest on true
join lateral (
  select avg(price) as avg_price
  from public.route_prices
  where route_id = r.id
    and fetched_at >= now() - interval '30 days'
) avg_30 on true
where r.is_active = true
  and (1 - latest.price / nullif(avg_30.avg_price, 0)) >= 0.20
order by savings_pct desc;


-- ============================================
-- STEAM MOVE DETECTION
-- ============================================

create table public.steam_moves (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes on delete cascade,
  price_before numeric(10,2) not null,
  price_after numeric(10,2) not null,
  drop_pct numeric(5,2) not null,
  detected_at timestamptz not null default now(),
  window_hours int not null default 4
);

create index idx_steam_moves_detected on public.steam_moves (detected_at desc);


-- ============================================
-- PRICE ALERTS
-- ============================================

create table public.price_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  route_id uuid not null references public.routes on delete cascade,
  target_price numeric(10,2),          -- optional: alert when price drops below this
  alert_on_any_drop boolean default true,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_price_alerts_user on public.price_alerts (user_id, is_active);
create unique index idx_price_alerts_user_route on public.price_alerts (user_id, route_id);


-- ============================================
-- SAVED ITINERARIES
-- ============================================

create table public.itineraries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  destination text not null,
  tagline text,
  query_text text not null,            -- what the user typed
  itinerary_data jsonb not null,       -- full AI response
  estimated_daily_budget text,
  insider_tip text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_itineraries_user on public.itineraries (user_id, created_at desc);


-- ============================================
-- GROUP TRIPS
-- ============================================

create table public.group_trips (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles on delete cascade,
  name text not null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  status text not null default 'voting' check (status in ('voting', 'planned', 'booked', 'archived')),
  destination_options text[] not null default '{}',
  date_options text[] not null default '{}',
  ai_recommendation text,
  ai_recommended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_group_trips_creator on public.group_trips (creator_id);
create unique index idx_group_trips_invite on public.group_trips (invite_code);

create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_trip_id uuid not null references public.group_trips on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('creator', 'member')),
  budget numeric(10,2),
  destination_vote text,
  date_vote text,
  has_voted boolean not null default false,
  joined_at timestamptz not null default now()
);

create unique index idx_group_members_unique on public.group_members (group_trip_id, user_id);
create index idx_group_members_group on public.group_members (group_trip_id);


-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.price_alerts enable row level security;
alter table public.itineraries enable row level security;
alter table public.group_trips enable row level security;
alter table public.group_members enable row level security;
alter table public.routes enable row level security;
alter table public.route_prices enable row level security;
alter table public.steam_moves enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Routes & prices: readable by all authenticated users
create policy "Routes readable by authenticated" on public.routes for select using (auth.role() = 'authenticated');
create policy "Route prices readable by authenticated" on public.route_prices for select using (auth.role() = 'authenticated');
create policy "Steam moves readable by authenticated" on public.steam_moves for select using (auth.role() = 'authenticated');

-- Price alerts: users manage their own
create policy "Users manage own alerts" on public.price_alerts for all using (auth.uid() = user_id);

-- Itineraries: users manage their own
create policy "Users manage own itineraries" on public.itineraries for all using (auth.uid() = user_id);

-- Group trips: creator can manage, members can view
create policy "Creator manages group trips" on public.group_trips for all using (auth.uid() = creator_id);
create policy "Members can view group trips" on public.group_trips for select using (
  exists (select 1 from public.group_members where group_trip_id = id and user_id = auth.uid())
);

-- Group members: members can view co-members, manage own record
create policy "Members view co-members" on public.group_members for select using (
  exists (select 1 from public.group_members gm where gm.group_trip_id = group_trip_id and gm.user_id = auth.uid())
);
create policy "Users manage own membership" on public.group_members for update using (auth.uid() = user_id);
create policy "Creator manages members" on public.group_members for all using (
  exists (select 1 from public.group_trips where id = group_trip_id and creator_id = auth.uid())
);


-- ============================================
-- REALTIME (for group trip live voting)
-- ============================================

alter publication supabase_realtime add table public.group_members;
alter publication supabase_realtime add table public.group_trips;


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Reset monthly itinerary count (call via cron on 1st of each month)
create or replace function public.reset_monthly_itineraries()
returns void as $$
begin
  update public.profiles
  set itineraries_used_this_month = 0,
      itinerary_reset_at = now()
  where itinerary_reset_at < date_trunc('month', now());
end;
$$ language plpgsql security definer;

-- Get user's remaining itineraries
create or replace function public.get_remaining_itineraries(p_user_id uuid)
returns int as $$
declare
  v_tier text;
  v_used int;
  v_limit int;
begin
  select tier, itineraries_used_this_month
  into v_tier, v_used
  from public.profiles where id = p_user_id;

  v_limit := case v_tier
    when 'free' then 3
    when 'pro' then 999999
    when 'premium' then 999999
    else 3
  end;

  return greatest(v_limit - v_used, 0);
end;
$$ language plpgsql security definer;

-- Get user's alert limit
create or replace function public.get_alert_limit(p_user_id uuid)
returns int as $$
declare
  v_tier text;
begin
  select tier into v_tier from public.profiles where id = p_user_id;
  return case v_tier
    when 'free' then 1
    when 'pro' then 25
    when 'premium' then 999999
    else 1
  end;
end;
$$ language plpgsql security definer;

-- Get group member limit
create or replace function public.get_group_member_limit(p_user_id uuid)
returns int as $$
declare
  v_tier text;
begin
  select tier into v_tier from public.profiles where id = p_user_id;
  return case v_tier
    when 'free' then 3
    when 'pro' then 10
    when 'premium' then 999999
    else 3
  end;
end;
$$ language plpgsql security definer;


-- ============================================
-- SEED DATA: Popular routes to track
-- ============================================

insert into public.routes (origin, destination, route_type, carrier) values
  ('NYC', 'LIS', 'flight', 'TAP Portugal'),
  ('NYC', 'TYO', 'flight', 'ANA'),
  ('NYC', 'BCN', 'flight', 'Level'),
  ('LAX', 'CDG', 'flight', 'French Bee'),
  ('LAX', 'TYO', 'flight', 'Japan Airlines'),
  ('CHI', 'REK', 'flight', 'PLAY'),
  ('NYC', 'CDG', 'flight', 'Norse Atlantic'),
  ('SFO', 'LIS', 'flight', 'TAP Portugal'),
  ('NYC', 'DPS', 'flight', 'Singapore Airlines'),
  ('LAX', 'BCN', 'flight', 'Norwegian'),
  ('', 'Barcelona', 'hotel', 'Hotel Arts'),
  ('', 'Bali', 'hotel', 'Alila Seminyak'),
  ('', 'Lisbon', 'hotel', 'Memmo Alfama'),
  ('', 'Tokyo', 'hotel', 'Park Hyatt Tokyo'),
  ('', 'Paris', 'hotel', 'Hotel Monge'),
  ('', 'Reykjavik', 'hotel', 'Canopy by Hilton')
on conflict do nothing;
-- ============================================
-- TripEdge AI — Migration 002: New Features
-- Social Save, Price Forecasting, Hack Finder, Expenses
-- ============================================

-- ============================================
-- SOCIAL SAVE PIPELINE
-- ============================================

create table public.saved_spots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  city text,
  country text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  google_place_id text,
  source_platform text check (source_platform in ('tiktok', 'instagram', 'youtube', 'blog', 'manual', 'chrome_extension')),
  source_url text,
  source_note text,                       -- user's note or auto-extracted caption
  category text check (category in ('food', 'gem', 'culture', 'adventure', 'relax', 'stay', 'nightlife', 'shopping')),
  thumbnail_url text,
  metadata jsonb default '{}',            -- extracted data from the source (creator name, etc.)
  is_visited boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_saved_spots_user on public.saved_spots (user_id, created_at desc);
create index idx_saved_spots_city on public.saved_spots (user_id, city);

-- Collections (group saved spots by trip/theme)
create table public.spot_collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  city text,
  description text,
  cover_image_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.spot_collection_items (
  id uuid primary key default uuid_generate_v4(),
  collection_id uuid not null references public.spot_collections on delete cascade,
  spot_id uuid not null references public.saved_spots on delete cascade,
  sort_order int not null default 0,
  added_at timestamptz not null default now()
);

create unique index idx_collection_items_unique on public.spot_collection_items (collection_id, spot_id);

-- Generated itineraries from saved spots
create table public.spot_itineraries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  collection_id uuid references public.spot_collections,
  city text not null,
  spot_ids uuid[] not null,               -- which saved spots were used
  itinerary_data jsonb not null,          -- full AI-generated itinerary
  num_days int not null,
  created_at timestamptz not null default now()
);


-- ============================================
-- PRICE FORECASTING
-- ============================================

create table public.price_forecasts (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes on delete cascade,
  current_price numeric(10,2) not null,
  predicted_price numeric(10,2) not null,
  direction text not null check (direction in ('dropping', 'rising', 'stable')),
  confidence_pct int not null check (confidence_pct between 0 and 100),
  recommendation text not null check (recommendation in ('book_now', 'wait', 'neutral')),
  wait_days int,                          -- how many days to wait if "wait"
  reasoning text,                         -- AI explanation
  model_version text not null default 'v1',
  forecast_horizon_days int not null default 7,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index idx_forecasts_route on public.price_forecasts (route_id, generated_at desc);

-- Historical accuracy tracking (for model improvement)
create table public.forecast_outcomes (
  id uuid primary key default uuid_generate_v4(),
  forecast_id uuid not null references public.price_forecasts on delete cascade,
  actual_price numeric(10,2),
  was_correct boolean,                    -- did the direction prediction hold?
  accuracy_delta numeric(10,2),           -- predicted vs actual difference
  evaluated_at timestamptz not null default now()
);


-- ============================================
-- HACK FINDER
-- ============================================

create table public.booking_hacks (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid references public.routes on delete set null,
  origin text,
  destination text,
  hack_type text not null check (hack_type in (
    'hidden_city', 'split_ticket', 'direct_booking',
    'positioning_flight', 'error_fare', 'points_hack',
    'day_of_week', 'nearby_airport', 'package_deal'
  )),
  title text not null,
  description text not null,
  direct_price numeric(10,2) not null,
  hack_price numeric(10,2) not null,
  savings numeric(10,2) not null,
  steps jsonb not null,                   -- array of step strings
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  risk_note text,
  booking_links jsonb default '[]',       -- array of { label, url }
  promo_code text,
  valid_until timestamptz,
  is_active boolean not null default true,
  tier_required text not null default 'pro' check (tier_required in ('free', 'pro', 'premium')),
  generated_by text not null default 'ai', -- 'ai', 'manual', 'community'
  upvotes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_hacks_active on public.booking_hacks (is_active, savings desc);
create index idx_hacks_route on public.booking_hacks (origin, destination);

-- User-reported hack success/failure
create table public.hack_reports (
  id uuid primary key default uuid_generate_v4(),
  hack_id uuid not null references public.booking_hacks on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  worked boolean not null,
  actual_savings numeric(10,2),
  note text,
  reported_at timestamptz not null default now()
);


-- ============================================
-- GROUP EXPENSE SPLITTING
-- ============================================

create table public.trip_expenses (
  id uuid primary key default uuid_generate_v4(),
  group_trip_id uuid not null references public.group_trips on delete cascade,
  paid_by_user_id uuid not null references public.profiles on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  category text check (category in ('stay', 'food', 'transport', 'activity', 'shopping', 'other')),
  split_type text not null default 'equal' check (split_type in ('equal', 'custom', 'percentage')),
  split_details jsonb,                    -- for custom splits: { "user_id": amount, ... }
  receipt_url text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_expenses_group on public.trip_expenses (group_trip_id, expense_date);

-- Settlements (who pays whom)
create table public.trip_settlements (
  id uuid primary key default uuid_generate_v4(),
  group_trip_id uuid not null references public.group_trips on delete cascade,
  from_user_id uuid not null references public.profiles on delete cascade,
  to_user_id uuid not null references public.profiles on delete cascade,
  amount numeric(10,2) not null,
  is_settled boolean not null default false,
  settled_at timestamptz,
  payment_method text,                    -- 'venmo', 'zelle', 'cash', 'paypal'
  created_at timestamptz not null default now()
);

create index idx_settlements_group on public.trip_settlements (group_trip_id);

-- Function to calculate optimized settlements (fewest transactions)
create or replace function public.calculate_settlements(p_group_trip_id uuid)
returns table (
  from_user uuid,
  to_user uuid,
  amount numeric
) as $$
declare
  v_members record;
  v_balances jsonb := '{}';
begin
  -- Calculate net balance for each member
  -- Positive = owed money, Negative = owes money
  for v_members in (
    select gm.user_id
    from public.group_members gm
    where gm.group_trip_id = p_group_trip_id
  ) loop
    v_balances := v_balances || jsonb_build_object(
      v_members.user_id::text,
      coalesce((
        select sum(te.amount) - sum(te.amount / (
          select count(*) from public.group_members where group_trip_id = p_group_trip_id
        ))
        from public.trip_expenses te
        where te.group_trip_id = p_group_trip_id
        and te.paid_by_user_id = v_members.user_id
      ), 0) -
      coalesce((
        select sum(te.amount / (
          select count(*) from public.group_members where group_trip_id = p_group_trip_id
        ))
        from public.trip_expenses te
        where te.group_trip_id = p_group_trip_id
        and te.paid_by_user_id != v_members.user_id
      ), 0)
    );
  end loop;

  -- Return simplified settlement pairs
  -- (In production, use a greedy algorithm for minimum transactions)
  return query
  select
    debtor.user_id as from_user,
    creditor.user_id as to_user,
    least(abs(debtor.balance), creditor.balance) as amount
  from (
    select gm.user_id, (v_balances->>gm.user_id::text)::numeric as balance
    from public.group_members gm
    where gm.group_trip_id = p_group_trip_id
    and (v_balances->>gm.user_id::text)::numeric < 0
  ) debtor
  cross join (
    select gm.user_id, (v_balances->>gm.user_id::text)::numeric as balance
    from public.group_members gm
    where gm.group_trip_id = p_group_trip_id
    and (v_balances->>gm.user_id::text)::numeric > 0
  ) creditor
  where least(abs(debtor.balance), creditor.balance) > 0.01;
end;
$$ language plpgsql security definer;


-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

alter table public.saved_spots enable row level security;
alter table public.spot_collections enable row level security;
alter table public.spot_collection_items enable row level security;
alter table public.spot_itineraries enable row level security;
alter table public.price_forecasts enable row level security;
alter table public.forecast_outcomes enable row level security;
alter table public.booking_hacks enable row level security;
alter table public.hack_reports enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.trip_settlements enable row level security;

-- Saved spots: users manage own
create policy "Users manage own spots" on public.saved_spots for all using (auth.uid() = user_id);
create policy "Users manage own collections" on public.spot_collections for all using (auth.uid() = user_id);
create policy "Users manage own collection items" on public.spot_collection_items for all using (
  exists (select 1 from public.spot_collections where id = collection_id and user_id = auth.uid())
);
create policy "Users manage own spot itineraries" on public.spot_itineraries for all using (auth.uid() = user_id);

-- Forecasts: readable by authenticated
create policy "Forecasts readable" on public.price_forecasts for select using (auth.role() = 'authenticated');
create policy "Outcomes readable" on public.forecast_outcomes for select using (auth.role() = 'authenticated');

-- Hacks: readable by authenticated, gated by tier in API layer
create policy "Hacks readable" on public.booking_hacks for select using (auth.role() = 'authenticated');
create policy "Users manage own reports" on public.hack_reports for all using (auth.uid() = user_id);

-- Expenses: group members can view and manage
create policy "Group members manage expenses" on public.trip_expenses for all using (
  exists (select 1 from public.group_members where group_trip_id = trip_expenses.group_trip_id and user_id = auth.uid())
);
create policy "Group members view settlements" on public.trip_settlements for select using (
  exists (select 1 from public.group_members where group_trip_id = trip_settlements.group_trip_id and user_id = auth.uid())
);
create policy "Settlement parties can update" on public.trip_settlements for update using (
  auth.uid() = from_user_id or auth.uid() = to_user_id
);


-- ============================================
-- REALTIME for expenses
-- ============================================

alter publication supabase_realtime add table public.trip_expenses;
alter publication supabase_realtime add table public.trip_settlements;
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
-- ============================================
-- TripEdge AI — Migration 004: Trip Replay
-- ============================================

-- Completed trip replays
create table public.trip_replays (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  itinerary_id uuid references public.itineraries on delete set null,
  active_trip_id uuid references public.active_trips on delete set null,
  group_trip_id uuid references public.group_trips on delete set null,

  -- Trip metadata
  city text not null,
  country text,
  dates_label text not null,               -- "Apr 17–21, 2026"
  num_days int not null,
  num_travelers int not null default 1,
  group_name text,

  -- Trip stats (aggregated at generation time)
  stats jsonb not null default '{}',       -- { steps, spots_visited, meals, photos_count, total_spent, per_person, saved_amount }

  -- AI-generated content
  theme text not null default 'editorial' check (theme in ('editorial', 'polaroid', 'minimal')),
  headline text not null,
  subheadline text,
  narrative text not null,
  pull_quote text,
  social_caption text,
  ai_model text not null default 'claude-sonnet-4-20250514',

  -- Highlights (structured)
  highlights jsonb not null default '[]',  -- [{ day, name, type, note }]

  -- Publishing
  is_public boolean not null default false,
  public_slug text unique,                 -- for shareable URL: tripedge.ai/replay/{slug}
  share_url text,
  view_count int not null default 0,
  share_count int not null default 0,

  -- Timestamps
  generated_at timestamptz not null default now(),
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_replays_user on public.trip_replays (user_id, created_at desc);
create unique index idx_replays_slug on public.trip_replays (public_slug) where public_slug is not null;

-- Photos associated with a replay
create table public.replay_photos (
  id uuid primary key default uuid_generate_v4(),
  replay_id uuid not null references public.trip_replays on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  storage_path text not null,              -- Supabase Storage path
  public_url text not null,
  thumbnail_url text,
  caption text,
  day_number int,
  sort_order int not null default 0,
  width int,
  height int,
  exif_data jsonb,                         -- { lat, lng, taken_at, camera }
  is_hero boolean not null default false,  -- used as the main cover image
  is_featured boolean not null default false,
  uploaded_at timestamptz not null default now()
);

create index idx_replay_photos on public.replay_photos (replay_id, sort_order);
create index idx_replay_photos_day on public.replay_photos (replay_id, day_number);

-- User-uploaded photos (pre-replay, bulk upload)
create table public.trip_photo_uploads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  active_trip_id uuid references public.active_trips on delete set null,
  storage_path text not null,
  public_url text not null,
  filename text,
  size_bytes bigint,
  mime_type text,
  width int,
  height int,
  exif_lat numeric(10,7),
  exif_lng numeric(10,7),
  exif_taken_at timestamptz,
  ai_caption text,                         -- auto-generated by vision model
  ai_location_guess text,                  -- AI-inferred location name
  ai_category text,                        -- food, landmark, people, scenery, etc.
  is_selected_for_replay boolean not null default false,
  uploaded_at timestamptz not null default now()
);

create index idx_photo_uploads_user on public.trip_photo_uploads (user_id, uploaded_at desc);
create index idx_photo_uploads_trip on public.trip_photo_uploads (active_trip_id);

-- Share events (analytics)
create table public.replay_share_events (
  id uuid primary key default uuid_generate_v4(),
  replay_id uuid not null references public.trip_replays on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'twitter', 'facebook', 'whatsapp', 'link', 'download', 'pdf')),
  shared_at timestamptz not null default now()
);

create index idx_share_events_replay on public.replay_share_events (replay_id, shared_at desc);

-- View events (for public replays)
create table public.replay_view_events (
  id uuid primary key default uuid_generate_v4(),
  replay_id uuid not null references public.trip_replays on delete cascade,
  viewer_ip_hash text,                     -- hashed for privacy
  referrer text,
  viewed_at timestamptz not null default now()
);

create index idx_view_events_replay on public.replay_view_events (replay_id, viewed_at desc);

-- ─── Generate public slug function ───
create or replace function public.generate_replay_slug()
returns trigger as $$
begin
  if new.is_public = true and new.public_slug is null then
    new.public_slug := lower(
      regexp_replace(new.city, '[^a-zA-Z0-9]', '', 'g')
    ) || '-' || encode(gen_random_bytes(4), 'hex');
    new.share_url := 'https://tripedge.ai/replay/' || new.public_slug;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_replay_slug
  before insert or update on public.trip_replays
  for each row execute function public.generate_replay_slug();

-- ─── Increment view count function ───
create or replace function public.increment_replay_views(p_slug text)
returns void as $$
begin
  update public.trip_replays
  set view_count = view_count + 1,
      last_viewed_at = now()
  where public_slug = p_slug;
end;
$$ language plpgsql security definer;

-- ─── RLS ───
alter table public.trip_replays enable row level security;
alter table public.replay_photos enable row level security;
alter table public.trip_photo_uploads enable row level security;
alter table public.replay_share_events enable row level security;
alter table public.replay_view_events enable row level security;

-- Owner manages their own replays
create policy "own_replays" on public.trip_replays for all using (auth.uid() = user_id);
-- Public replays viewable by anyone
create policy "public_replays" on public.trip_replays for select using (is_public = true);

create policy "own_replay_photos" on public.replay_photos for all using (auth.uid() = user_id);
-- Photos in public replays are viewable
create policy "public_replay_photos" on public.replay_photos for select using (
  exists (select 1 from public.trip_replays where id = replay_id and is_public = true)
);

create policy "own_uploads" on public.trip_photo_uploads for all using (auth.uid() = user_id);
create policy "own_share_events" on public.replay_share_events for all using (
  exists (select 1 from public.trip_replays where id = replay_id and user_id = auth.uid())
);
-- View events insertable by anyone (for public replays)
create policy "insert_view_events" on public.replay_view_events for insert with check (
  exists (select 1 from public.trip_replays where id = replay_id and is_public = true)
);

-- ─── Storage bucket for trip photos ───
-- Run in Supabase dashboard or via API:
-- insert into storage.buckets (id, name, public) values ('trip-photos', 'trip-photos', true);
-- ============================================
-- TripEdge AI — Migration 005: Million Dollar Features
-- Affiliates, Creators, Price History, Error Fares, Passport,
-- Teams, WhatsApp Bot, Visa AI, Trip Dares
-- ============================================

-- ═══ 1. AFFILIATE TRACKING ═══

create table public.affiliate_partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  commission_type text not null check (commission_type in ('percentage','cpc','flat')),
  commission_value numeric(8,2) not null,
  api_key_encrypted text,
  tracking_url_template text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.affiliate_clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete set null,
  partner_id uuid not null references public.affiliate_partners on delete cascade,
  source_feature text not null check (source_feature in ('deal_scanner','hack_finder','itinerary','companion','creator_itinerary','error_fare','negotiator')),
  source_id text,
  clicked_at timestamptz not null default now()
);

create table public.affiliate_conversions (
  id uuid primary key default uuid_generate_v4(),
  click_id uuid references public.affiliate_clicks on delete set null,
  partner_id uuid not null references public.affiliate_partners on delete cascade,
  user_id uuid references public.profiles on delete set null,
  creator_id uuid references public.profiles on delete set null,
  booking_value numeric(10,2),
  commission_earned numeric(10,2) not null,
  creator_share numeric(10,2) default 0,
  platform_share numeric(10,2) default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','paid','rejected')),
  converted_at timestamptz not null default now()
);

create index idx_aff_clicks_user on public.affiliate_clicks (user_id, clicked_at desc);
create index idx_aff_conv_creator on public.affiliate_conversions (creator_id, status);

-- ═══ 2. CREATOR PLATFORM ═══

create table public.creator_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade unique,
  display_name text not null,
  bio text,
  social_links jsonb default '{}',
  is_verified boolean not null default false,
  follower_count int not null default 0,
  total_earnings numeric(10,2) not null default 0,
  stripe_connect_id text,
  commission_split numeric(3,2) not null default 0.70,
  status text not null default 'pending' check (status in ('pending','approved','suspended')),
  created_at timestamptz not null default now()
);

create table public.creator_itineraries (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.creator_profiles on delete cascade,
  title text not null,
  city text not null,
  country text,
  description text,
  cover_image_url text,
  itinerary_data jsonb not null,
  num_days int not null,
  estimated_budget text,
  tags text[] default '{}',
  clone_count int not null default 0,
  booking_count int not null default 0,
  revenue_generated numeric(10,2) not null default 0,
  rating_avg numeric(3,2),
  rating_count int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_creator_itin_city on public.creator_itineraries (city, is_published);

create table public.creator_itinerary_clones (
  id uuid primary key default uuid_generate_v4(),
  itinerary_id uuid not null references public.creator_itineraries on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  cloned_at timestamptz not null default now()
);

-- ═══ 3. PRICE HISTORY (public SEO pages) ═══

create table public.price_history_monthly (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references public.routes on delete cascade,
  month date not null,
  avg_price numeric(10,2) not null,
  min_price numeric(10,2) not null,
  max_price numeric(10,2) not null,
  sample_count int not null default 0,
  updated_at timestamptz not null default now()
);

create unique index idx_price_history_route_month on public.price_history_monthly (route_id, month);

-- ═══ 4. ERROR FARE DETECTION ═══

create table public.error_fares (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid references public.routes on delete set null,
  origin text not null,
  destination text not null,
  airline text not null,
  error_price numeric(10,2) not null,
  normal_price numeric(10,2) not null,
  savings_pct int not null,
  trip_type text not null check (trip_type in ('round_trip','one_way')),
  travel_dates text,
  booking_url text,
  booking_notes text,
  status text not null default 'live' check (status in ('live','expired','honored','rejected')),
  detected_at timestamptz not null default now(),
  expired_at timestamptz,
  tier_required text not null default 'premium'
);

create index idx_error_fares_status on public.error_fares (status, detected_at desc);

create table public.error_fare_alerts_sent (
  id uuid primary key default uuid_generate_v4(),
  error_fare_id uuid not null references public.error_fares on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  sent_at timestamptz not null default now()
);

-- ═══ 5. TRIPEDGE SCORE + PASSPORT ═══

create table public.user_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade unique,
  total_score int not null default 0,
  level text not null default 'Explorer',
  trips_completed int not null default 0,
  countries_visited int not null default 0,
  total_saved numeric(10,2) not null default 0,
  deals_booked int not null default 0,
  itineraries_created int not null default 0,
  group_trips_led int not null default 0,
  replays_shared int not null default 0,
  dares_completed int not null default 0,
  streak_days int not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.passport_stamps (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  icon text not null,
  description text,
  rarity text not null check (rarity in ('common','uncommon','rare','legendary')),
  xp_value int not null default 50,
  criteria jsonb not null,
  is_active boolean not null default true
);

create table public.user_stamps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles on delete cascade,
  stamp_id uuid not null references public.passport_stamps on delete cascade,
  earned_at timestamptz not null default now()
);

create unique index idx_user_stamps_unique on public.user_stamps (user_id, stamp_id);

-- Seed stamps
insert into public.passport_stamps (slug, name, icon, description, rarity, xp_value, criteria) values
  ('first_trip', 'First Trip', '🎫', 'Completed your first trip', 'common', 50, '{"trips_completed": 1}'),
  ('deal_hunter', 'Deal Hunter', '📉', 'Saved $100+', 'common', 75, '{"total_saved_min": 100}'),
  ('squad_leader', 'Squad Leader', '👥', 'Led a group trip', 'uncommon', 100, '{"group_trips_led": 1}'),
  ('globe_trotter', 'Globe Trotter', '🌍', 'Visited 5+ countries', 'uncommon', 150, '{"countries_visited": 5}'),
  ('error_legend', 'Error Fare Legend', '⚡', 'Booked an error fare', 'rare', 250, '{"error_fares_booked": 1}'),
  ('content_creator', 'Content Creator', '🎬', 'Trip Replay with 100+ views', 'rare', 200, '{"replay_views_min": 100}'),
  ('platinum_saver', 'Platinum Saver', '💎', 'Saved $2,000+ lifetime', 'legendary', 500, '{"total_saved_min": 2000}'),
  ('og_explorer', 'OG Explorer', '👑', 'Top 1% TripEdge Score', 'legendary', 1000, '{"score_percentile": 99}');

-- ═══ 6. TEAMS / CORPORATE ═══

create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles on delete cascade,
  stripe_subscription_id text,
  plan text not null default 'teams' check (plan in ('teams','enterprise')),
  max_members int not null default 10,
  travel_policies jsonb default '{}',
  created_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','deactivated')),
  joined_at timestamptz not null default now()
);

create unique index idx_team_members_unique on public.team_members (team_id, user_id);

create table public.team_expense_reports (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams on delete cascade,
  period_start date not null,
  period_end date not null,
  total_spend numeric(10,2) not null default 0,
  total_saved numeric(10,2) not null default 0,
  trip_count int not null default 0,
  export_format text check (export_format in ('csv','quickbooks','xero')),
  generated_at timestamptz not null default now()
);

-- ═══ 7. WHATSAPP / IMESSAGE BOT ═══

create table public.bot_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete set null,
  platform text not null check (platform in ('whatsapp','imessage','telegram','instagram')),
  phone_number_hash text,
  conversation_history jsonb default '[]',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.bot_actions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.bot_sessions on delete cascade,
  action_type text not null check (action_type in ('search_deals','set_alert','save_spot','generate_itinerary','check_price','visa_check')),
  input_text text,
  result_data jsonb,
  actioned_at timestamptz not null default now()
);

create index idx_bot_sessions_user on public.bot_sessions (user_id, last_message_at desc);

-- ═══ 8. VISA & ENTRY REQUIREMENTS ═══

create table public.visa_requirements (
  id uuid primary key default uuid_generate_v4(),
  passport_country text not null,
  destination_country text not null,
  visa_required boolean not null,
  visa_type text,
  stay_limit_days int,
  purpose text default 'tourism',
  requirements jsonb default '[]',
  processing_time text,
  cost text,
  vaccinations text,
  advisories jsonb default '[]',
  currency_info text,
  plug_type text,
  emergency_numbers text,
  last_verified_at timestamptz not null default now(),
  source text default 'ai_generated'
);

create unique index idx_visa_req_pair on public.visa_requirements (passport_country, destination_country);

-- ═══ 9. TRIP DARES ═══

create table public.trip_dares (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  city text,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  xp_reward int not null default 100,
  time_limit text,
  emoji text,
  completion_count int not null default 0,
  is_active boolean not null default true,
  generated_by text not null default 'ai',
  created_at timestamptz not null default now()
);

create table public.dare_attempts (
  id uuid primary key default uuid_generate_v4(),
  dare_id uuid not null references public.trip_dares on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  status text not null default 'accepted' check (status in ('accepted','in_progress','completed','abandoned')),
  proof_photos text[],
  proof_notes text,
  completed_at timestamptz,
  accepted_at timestamptz not null default now()
);

create unique index idx_dare_attempts_unique on public.dare_attempts (dare_id, user_id);

-- Seed some dares
insert into public.trip_dares (title, description, city, difficulty, xp_reward, time_limit, emoji) values
  ('The €40 Lisbon Feast', 'Eat at 5 different restaurants in Lisbon spending €40 or less total. Document each meal.', 'Lisbon', 'medium', 150, '1 day', '🍽'),
  ('Sunset Collector', 'Photograph sunset from 3 different viewpoints in one evening. No repeats.', null, 'easy', 75, '1 evening', '🌅'),
  ('Tokyo Neighborhood Crawl', 'Visit Shinjuku, Shibuya, Asakusa, Akihabara, and Ginza using only trains. Photo in each.', 'Tokyo', 'hard', 250, '1 day', '🚃'),
  ('Local''s Choice', 'Ask 3 different locals for their favorite hidden spot. Visit all 3. Rate them.', null, 'medium', 200, '1 day', '🗣'),
  ('The $0 Day', 'Spend an entire day exploring without spending any money. Free museums, parks, street art, people-watching.', null, 'easy', 100, '1 day', '💸'),
  ('Alphabet Eats', 'Eat foods starting with 5 consecutive letters of the alphabet in one day.', null, 'hard', 300, '1 day', '🔤');


-- ═══ RLS ═══

alter table public.affiliate_partners enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.creator_itineraries enable row level security;
alter table public.creator_itinerary_clones enable row level security;
alter table public.price_history_monthly enable row level security;
alter table public.error_fares enable row level security;
alter table public.error_fare_alerts_sent enable row level security;
alter table public.user_scores enable row level security;
alter table public.passport_stamps enable row level security;
alter table public.user_stamps enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_expense_reports enable row level security;
alter table public.bot_sessions enable row level security;
alter table public.bot_actions enable row level security;
alter table public.visa_requirements enable row level security;
alter table public.trip_dares enable row level security;
alter table public.dare_attempts enable row level security;

-- Public reads
create policy "partners_read" on public.affiliate_partners for select using (auth.role() = 'authenticated');
create policy "price_history_read" on public.price_history_monthly for select using (true);
create policy "error_fares_read" on public.error_fares for select using (auth.role() = 'authenticated');
create policy "stamps_read" on public.passport_stamps for select using (true);
create policy "visa_read" on public.visa_requirements for select using (true);
create policy "dares_read" on public.trip_dares for select using (true);
create policy "creator_itin_read" on public.creator_itineraries for select using (is_published = true);
create policy "creator_profiles_read" on public.creator_profiles for select using (status = 'approved');

-- User-specific
create policy "own_clicks" on public.affiliate_clicks for all using (auth.uid() = user_id);
create policy "own_conversions" on public.affiliate_conversions for select using (auth.uid() = user_id or auth.uid() = creator_id);
create policy "own_creator_profile" on public.creator_profiles for all using (auth.uid() = user_id);
create policy "own_creator_itin" on public.creator_itineraries for all using (
  exists (select 1 from public.creator_profiles where id = creator_id and user_id = auth.uid())
);
create policy "own_clones" on public.creator_itinerary_clones for all using (auth.uid() = user_id);
create policy "own_score" on public.user_scores for all using (auth.uid() = user_id);
create policy "own_stamps" on public.user_stamps for select using (auth.uid() = user_id);
create policy "own_error_alerts" on public.error_fare_alerts_sent for all using (auth.uid() = user_id);
create policy "own_bot_sessions" on public.bot_sessions for all using (auth.uid() = user_id);
create policy "own_bot_actions" on public.bot_actions for all using (
  exists (select 1 from public.bot_sessions where id = session_id and user_id = auth.uid())
);
create policy "own_dare_attempts" on public.dare_attempts for all using (auth.uid() = user_id);

-- Team policies
create policy "team_owner" on public.teams for all using (auth.uid() = owner_id);
create policy "team_members_view" on public.team_members for select using (
  exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
);
create policy "team_reports_view" on public.team_expense_reports for select using (
  exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
);
