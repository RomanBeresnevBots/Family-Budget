create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency_code text not null default 'CZK',
  timezone text not null default 'Europe/Prague',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  slug text not null,
  emoji text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (household_id, slug)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  label text not null,
  icon text not null,
  color text not null,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (household_id, label),
  constraint categories_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.expense_series (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  source_expense_client_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz
);

create table if not exists public.expense_series_versions (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.expense_series(id) on delete cascade,
  effective_from date not null,
  title text not null,
  amount numeric(12, 2) not null,
  cadence text not null,
  frequency text not null,
  day_of_month smallint not null,
  month_of_year smallint,
  owner_scope text not null,
  owner_person_id uuid references public.people(id) on delete set null,
  payer_person_id uuid not null references public.people(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  unique (series_id, effective_from),
  constraint expense_series_versions_amount_positive check (amount >= 0),
  constraint expense_series_versions_cadence check (cadence in ('manual', 'auto')),
  constraint expense_series_versions_frequency check (frequency in ('monthly', 'yearly')),
  constraint expense_series_versions_day_of_month check (day_of_month between 1 and 28),
  constraint expense_series_versions_month_of_year check (
    month_of_year is null or month_of_year between 1 and 12
  ),
  constraint expense_series_versions_owner_scope check (owner_scope in ('person', 'household')),
  constraint expense_series_versions_owner_match check (
    (owner_scope = 'household' and owner_person_id is null) or
    (owner_scope = 'person' and owner_person_id is not null)
  ),
  constraint expense_series_versions_yearly_month_required check (
    (frequency = 'monthly' and month_of_year is null) or
    (frequency = 'yearly' and month_of_year is not null)
  )
);

create table if not exists public.expense_occurrences (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  series_id uuid references public.expense_series(id) on delete set null,
  occurrence_month date not null,
  due_on date not null,
  title text not null,
  amount numeric(12, 2) not null,
  cadence text not null,
  frequency text not null,
  owner_scope text not null,
  owner_person_id uuid references public.people(id) on delete set null,
  payer_person_id uuid not null references public.people(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  source_type text not null default 'manual',
  status text not null default 'planned',
  completed_at timestamptz,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint expense_occurrences_amount_positive check (amount >= 0),
  constraint expense_occurrences_cadence check (cadence in ('manual', 'auto')),
  constraint expense_occurrences_frequency check (frequency in ('monthly', 'yearly', 'one_time')),
  constraint expense_occurrences_owner_scope check (owner_scope in ('person', 'household')),
  constraint expense_occurrences_owner_match check (
    (owner_scope = 'household' and owner_person_id is null) or
    (owner_scope = 'person' and owner_person_id is not null)
  ),
  constraint expense_occurrences_source_type check (source_type in ('manual', 'series')),
  constraint expense_occurrences_status check (status in ('planned', 'completed', 'skipped'))
);

create unique index if not exists expense_occurrences_series_month_unique
  on public.expense_occurrences (series_id, occurrence_month)
  where series_id is not null;

create index if not exists people_household_sort_idx
  on public.people (household_id, sort_order, name);

create index if not exists categories_household_sort_idx
  on public.categories (household_id, sort_order, label);

create index if not exists expense_series_household_idx
  on public.expense_series (household_id, is_active);

create index if not exists expense_series_versions_series_effective_idx
  on public.expense_series_versions (series_id, effective_from desc);

create index if not exists expense_occurrences_household_month_idx
  on public.expense_occurrences (household_id, occurrence_month, due_on);

create index if not exists expense_occurrences_status_idx
  on public.expense_occurrences (household_id, status, due_on);
