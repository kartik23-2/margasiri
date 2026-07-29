-- Supabase setup for Margasiri user data.
-- Run this in Supabase SQL Editor after creating the project and enabling Google Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  image text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile_pictures',
  'profile_pictures',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_slug text not null,
  created_at timestamptz not null default now(),
  unique(user_id, place_slug)
);

create table if not exists public.visited_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_slug text not null,
  visited_on date,
  created_at timestamptz not null default now(),
  unique(user_id, place_slug)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_slug text not null,
  type text not null,
  description text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.place_category_links (
  place_slug text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (place_slug, category_id)
);

alter table public.profiles enable row level security;
alter table public.saved_places enable row level security;
alter table public.visited_places enable row level security;
alter table public.contributions enable row level security;
alter table public.categories enable row level security;
alter table public.place_category_links enable row level security;

create policy "Profiles are visible to owner" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users edit own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users read own saved places" on public.saved_places for select using (auth.uid() = user_id);
create policy "Users insert own saved places" on public.saved_places for insert with check (auth.uid() = user_id);
create policy "Users delete own saved places" on public.saved_places for delete using (auth.uid() = user_id);

create policy "Users read own visited places" on public.visited_places for select using (auth.uid() = user_id);
create policy "Users insert own visited places" on public.visited_places for insert with check (auth.uid() = user_id);
create policy "Users update own visited places" on public.visited_places for update using (auth.uid() = user_id);
create policy "Users delete own visited places" on public.visited_places for delete using (auth.uid() = user_id);

create policy "Users read own contributions" on public.contributions for select using (auth.uid() = user_id);
create policy "Users submit own contributions" on public.contributions for insert with check (auth.uid() = user_id);

create policy "Anyone can read categories" on public.categories for select using (true);
create policy "Anyone can read place category links" on public.place_category_links for select using (true);

create policy "Users read own profile pictures"
on storage.objects for select
using (
  bucket_id = 'profile_pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users upload own profile pictures"
on storage.objects for insert
with check (
  bucket_id = 'profile_pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own profile pictures"
on storage.objects for update
using (
  bucket_id = 'profile_pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own profile pictures"
on storage.objects for delete
using (
  bucket_id = 'profile_pictures'
  and (storage.foldername(name))[1] = auth.uid()::text
);

insert into public.categories (name, slug) values
  ('Adventure', 'adventure'),
  ('Art & Culture', 'art-and-culture'),
  ('Architecture', 'architecture'),
  ('Beach', 'beach'),
  ('Heritage', 'heritage'),
  ('Hills', 'hills'),
  ('History', 'history'),
  ('Nature', 'nature'),
  ('Spiritual', 'spiritual'),
  ('Valley', 'valley'),
  ('Village', 'village'),
  ('Wildlife', 'wildlife'),
  ('Wilderness', 'wilderness')
on conflict (slug) do nothing;
