-- Run this in your Supabase SQL editor

-- User profiles (one row per device, identified by UUID generated on first launch)
create table if not exists user_profiles (
  device_id       text primary key,
  age             integer not null,
  sex             text not null check (sex in ('male', 'female')),
  height_cm       numeric(5,1) not null,
  weight_kg       numeric(5,1) not null,
  target_weight_kg numeric(5,1) not null,
  activity_level  text not null,
  goal            text not null check (goal in ('lose', 'maintain', 'gain')),
  ai_style        text not null,
  updated_at      timestamptz default now()
);

-- Body fat analysis history
create table if not exists body_fat_analyses (
  id                      uuid primary key default gen_random_uuid(),
  device_id               text not null references user_profiles(device_id) on delete cascade,
  estimated_body_fat_pct  numeric(5,2) not null,
  lean_mass_kg            numeric(5,1) not null,
  fat_mass_kg             numeric(5,1) not null,
  category                text not null,
  recommendations         text[] not null default '{}',
  confidence              numeric(4,3) not null,
  created_at              timestamptz default now()
);

-- Daily food log
create table if not exists daily_food_logs (
  id          uuid primary key default gen_random_uuid(),
  device_id   text not null references user_profiles(device_id) on delete cascade,
  log_date    date not null,
  food_name   text not null,
  calories    integer not null,
  protein_g   numeric(6,1) not null,
  carbs_g     numeric(6,1) not null,
  fat_g       numeric(6,1) not null,
  meal_time   text not null check (meal_time in ('breakfast', 'lunch', 'dinner', 'snack')),
  icon        text not null default '🍽️',
  created_at  timestamptz default now()
);

-- Permissive RLS for MVP (anon key, device-based identification)
alter table user_profiles enable row level security;
alter table body_fat_analyses enable row level security;
alter table daily_food_logs enable row level security;

create policy "Allow all for anon" on user_profiles for all to anon using (true) with check (true);
create policy "Allow all for anon" on body_fat_analyses for all to anon using (true) with check (true);
create policy "Allow all for anon" on daily_food_logs for all to anon using (true) with check (true);

-- Index for log queries by device + date
create index if not exists idx_food_logs_device_date on daily_food_logs(device_id, log_date);
create index if not exists idx_body_fat_device on body_fat_analyses(device_id, created_at desc);
