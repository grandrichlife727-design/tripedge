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
