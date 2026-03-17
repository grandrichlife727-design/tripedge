alter table public.profiles
add column if not exists home_airport text;

create index if not exists idx_profiles_home_airport on public.profiles (home_airport);
