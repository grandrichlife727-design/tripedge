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
