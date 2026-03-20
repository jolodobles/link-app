-- link. — Supabase schema
-- Run this in your Supabase SQL editor

-- Sessions
create table if not exists sessions (
  id text primary key,
  name text not null,
  category text,
  date_time text,
  budget text,
  created_at timestamptz default now()
);

-- Session members
create table if not exists session_members (
  id text primary key,
  session_id text references sessions(id) on delete cascade,
  display_name text not null,
  avatar_color text,
  joined_at timestamptz default now()
);

-- Venues
create table if not exists venues (
  id text primary key,
  name text not null,
  emoji text,
  cuisine text,
  distance text,
  price text,
  tags text[],
  bg_color text
);

-- Swipes
create table if not exists swipes (
  id text primary key,
  session_id text references sessions(id) on delete cascade,
  member_id text references session_members(id) on delete cascade,
  venue_id text references venues(id),
  direction text check (direction in ('yes', 'no', 'maybe')),
  swiped_at timestamptz default now()
);

-- Enable realtime on swipes and session_members
alter publication supabase_realtime add table swipes;
alter publication supabase_realtime add table session_members;

-- Enable RLS (open policies for MVP)
alter table sessions enable row level security;
alter table session_members enable row level security;
alter table venues enable row level security;
alter table swipes enable row level security;

create policy "public read" on sessions for select using (true);
create policy "public insert" on sessions for insert with check (true);
create policy "public read" on session_members for select using (true);
create policy "public insert" on session_members for insert with check (true);
create policy "public read" on venues for select using (true);
create policy "public read" on swipes for select using (true);
create policy "public insert" on swipes for insert with check (true);

-- Seed venues
insert into venues (id, name, emoji, cuisine, distance, price, tags, bg_color) values
  ('v1', 'Mamasita',    '🌮', 'Mexican',      '0.4km', '$',  array['Tacos','Bar','Lively'],           '#FF6B6B'),
  ('v2', 'Tipo 00',     '🍝', 'Italian',      '0.9km', '$',  array['Pasta','Wine','Cozy'],            '#F59E0B'),
  ('v3', 'Kisume',      '🍣', 'Japanese',     '0.8km', '$$', array['Sushi','Omakase'],                '#3B82F6'),
  ('v4', 'Longrain',    '🍜', 'Thai',         '0.6km', '$',  array['Noodles','Cocktails'],            '#14B8A6'),
  ('v5', 'Gimlet',      '🥩', 'Australian',   '0.5km', '$$', array['Fine dining','Wine'],             '#8B5CF6'),
  ('v6', 'Anchovy',     '🐟', 'Vietnamese',   '1.1km', '$',  array['Modern','Share plates'],          '#EC4899'),
  ('v7', 'Lee Ho Fook', '🥟', 'Chinese',      '0.7km', '$',  array['Dumplings','Lively'],             '#22C55E'),
  ('v8', 'Supernormal', '🦞', 'Asian fusion', '0.3km', '$',  array['Lobster roll','Bar'],             '#6B7280')
on conflict (id) do nothing;
