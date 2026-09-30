-- Run in the Supabase SQL editor to provision Finny's private data tables.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Friend', goal numeric not null default 10000,
  currency text not null default 'THB', avatar text not null default '🐷', language text not null default 'en',
  monthly_budget numeric not null default 5000, reminders boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists monthly_budget numeric not null default 5000;
alter table public.profiles add column if not exists reminders boolean not null default false;
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0), note text not null default '', deposited_on date not null default current_date,
  created_at timestamptz not null default now()
);
create table if not exists public.spending_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, amount numeric not null check (amount >= 0), category text not null default 'want' check (category in ('need','want','emergency')),
  note text not null default '', item_date date not null default current_date, purchased_on date, completed_at timestamptz,
  stage text not null default 'wishlist' check (stage in ('wishlist','pending','ledger','abandoned')),
  created_at timestamptz not null default now()
);
alter table public.spending_items add column if not exists note text not null default '';
alter table public.spending_items add column if not exists item_date date not null default current_date;
alter table public.spending_items add column if not exists purchased_on date;
alter table public.spending_items add column if not exists completed_at timestamptz;
alter table public.profiles enable row level security;
alter table public.deposits enable row level security;
alter table public.spending_items enable row level security;
drop policy if exists "Profiles are private" on public.profiles;
drop policy if exists "Deposits are private" on public.deposits;
drop policy if exists "Spending items are private" on public.spending_items;
create policy "Profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Deposits are private" on public.deposits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Spending items are private" on public.spending_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
