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
