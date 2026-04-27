alter table public.households
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.household_memberships (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default timezone('utc', now()),
  unique (household_id, user_id),
  constraint household_memberships_role check (role in ('owner', 'member'))
);

create index if not exists household_memberships_user_idx
  on public.household_memberships (user_id, household_id);

create index if not exists households_owner_idx
  on public.households (owner_user_id);

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete
  on public.user_profiles,
     public.household_memberships,
     public.households,
     public.people,
     public.categories,
     public.expense_series,
     public.expense_series_versions,
     public.expense_occurrences
  to authenticated, service_role;

revoke all
  on public.user_profiles,
     public.household_memberships,
     public.households,
     public.people,
     public.categories,
     public.expense_series,
     public.expense_series_versions,
     public.expense_occurrences
  from anon;

alter table public.user_profiles enable row level security;
alter table public.household_memberships enable row level security;
alter table public.households enable row level security;
alter table public.people enable row level security;
alter table public.categories enable row level security;
alter table public.expense_series enable row level security;
alter table public.expense_series_versions enable row level security;
alter table public.expense_occurrences enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.user_profiles;
create policy "profiles_insert_own"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.user_profiles;
create policy "profiles_update_own"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "memberships_select_own" on public.household_memberships;
create policy "memberships_select_own"
  on public.household_memberships
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "memberships_insert_owned_household" on public.household_memberships;
create policy "memberships_insert_owned_household"
  on public.household_memberships
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.households
      where households.id = household_memberships.household_id
        and households.owner_user_id = auth.uid()
    )
  );

drop policy if exists "memberships_delete_owned_household" on public.household_memberships;
create policy "memberships_delete_owned_household"
  on public.household_memberships
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.households
      where households.id = household_memberships.household_id
        and households.owner_user_id = auth.uid()
    )
  );

drop policy if exists "households_select_member" on public.households;
create policy "households_select_member"
  on public.households
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = households.id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "households_insert_owner" on public.households;
create policy "households_insert_owner"
  on public.households
  for insert
  to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists "households_update_owner" on public.households;
create policy "households_update_owner"
  on public.households
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = households.id
        and household_memberships.user_id = auth.uid()
        and household_memberships.role = 'owner'
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = households.id
        and household_memberships.user_id = auth.uid()
        and household_memberships.role = 'owner'
    )
  );

drop policy if exists "people_access_by_household_membership" on public.people;
create policy "people_access_by_household_membership"
  on public.people
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = people.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = people.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "categories_access_by_household_membership" on public.categories;
create policy "categories_access_by_household_membership"
  on public.categories
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = categories.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = categories.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "expense_series_access_by_household_membership" on public.expense_series;
create policy "expense_series_access_by_household_membership"
  on public.expense_series
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = expense_series.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = expense_series.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "expense_occurrences_access_by_household_membership" on public.expense_occurrences;
create policy "expense_occurrences_access_by_household_membership"
  on public.expense_occurrences
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = expense_occurrences.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = expense_occurrences.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "expense_series_versions_access_via_series_membership" on public.expense_series_versions;
create policy "expense_series_versions_access_via_series_membership"
  on public.expense_series_versions
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.expense_series
      join public.household_memberships
        on household_memberships.household_id = expense_series.household_id
      where expense_series.id = expense_series_versions.series_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.expense_series
      join public.household_memberships
        on household_memberships.household_id = expense_series.household_id
      where expense_series.id = expense_series_versions.series_id
        and household_memberships.user_id = auth.uid()
    )
  );
