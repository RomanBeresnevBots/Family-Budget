create table if not exists public.cashflow_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  owner text not null default 'shared',
  account_type text not null default 'bank',
  default_currency text not null default 'CZK',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cashflow_accounts_owner_check check (owner in ('roma', 'sasha', 'shared')),
  constraint cashflow_accounts_type_check check (account_type in ('bank', 'cash', 'broker', 'other'))
);

create table if not exists public.cashflow_funds (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  fund_type text not null,
  target_mode text not null default 'manual',
  target_multiplier numeric(12,2) not null default 1,
  manual_target_amount numeric(14,2),
  currency text not null default 'CZK',
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cashflow_funds_type_check check (
    fund_type in ('budget_reserve', 'emergency_reserve', 'investments', 'savings_goal', 'free_balance')
  ),
  constraint cashflow_funds_target_mode_check check (
    target_mode in ('manual', 'auto_average_mandatory_budget')
  )
);

create table if not exists public.cashflow_balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid not null references public.cashflow_accounts(id) on delete cascade,
  fund_id uuid not null references public.cashflow_funds(id) on delete cascade,
  snapshot_date date not null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'CZK',
  amount_czk numeric(14,2) not null default 0,
  exchange_rate_to_czk numeric(14,6) not null default 1,
  asset_type text not null default 'cash',
  owner text not null default 'shared',
  created_at timestamptz not null default timezone('utc', now()),
  constraint cashflow_snapshots_owner_check check (owner in ('roma', 'sasha', 'shared')),
  constraint cashflow_snapshots_asset_type_check check (
    asset_type in ('cash', 'bank_account', 'stocks', 'bonds', 'crypto', 'metals', 'other')
  )
);

create table if not exists public.cashflow_income_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  income_date date not null,
  owner text not null default 'shared',
  income_type text not null default 'other',
  status text not null default 'expected',
  expected_amount numeric(14,2),
  actual_amount numeric(14,2),
  currency text not null default 'CZK',
  amount_czk numeric(14,2) not null default 0,
  exchange_rate_to_czk numeric(14,6) not null default 1,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint cashflow_income_owner_check check (owner in ('roma', 'sasha', 'shared')),
  constraint cashflow_income_type_check check (
    income_type in ('salary', 'bonus', 'refund', 'gift', 'other')
  ),
  constraint cashflow_income_status_check check (
    status in ('expected', 'received')
  )
);

create table if not exists public.cashflow_settings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references public.households(id) on delete cascade,
  budget_reserve_months_multiplier numeric(12,2) not null default 2,
  emergency_reserve_months_multiplier numeric(12,2) not null default 3,
  mandatory_budget_average_months integer not null default 6,
  budget_reserve_manual_target numeric(14,2),
  emergency_reserve_manual_target numeric(14,2),
  base_currency text not null default 'CZK',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists cashflow_accounts_household_idx
  on public.cashflow_accounts (household_id, created_at);

create index if not exists cashflow_funds_household_idx
  on public.cashflow_funds (household_id, created_at);

create index if not exists cashflow_balance_snapshots_household_idx
  on public.cashflow_balance_snapshots (household_id, snapshot_date desc);

create index if not exists cashflow_income_events_household_idx
  on public.cashflow_income_events (household_id, income_date desc);

grant select, insert, update, delete
  on public.cashflow_accounts,
     public.cashflow_funds,
     public.cashflow_balance_snapshots,
     public.cashflow_income_events,
     public.cashflow_settings
  to authenticated, service_role;

revoke all
  on public.cashflow_accounts,
     public.cashflow_funds,
     public.cashflow_balance_snapshots,
     public.cashflow_income_events,
     public.cashflow_settings
  from anon;

alter table public.cashflow_accounts enable row level security;
alter table public.cashflow_funds enable row level security;
alter table public.cashflow_balance_snapshots enable row level security;
alter table public.cashflow_income_events enable row level security;
alter table public.cashflow_settings enable row level security;

drop policy if exists "cashflow_accounts_access_by_household_membership" on public.cashflow_accounts;
create policy "cashflow_accounts_access_by_household_membership"
  on public.cashflow_accounts
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_accounts.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_accounts.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "cashflow_funds_access_by_household_membership" on public.cashflow_funds;
create policy "cashflow_funds_access_by_household_membership"
  on public.cashflow_funds
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_funds.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_funds.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "cashflow_balance_snapshots_access_by_household_membership" on public.cashflow_balance_snapshots;
create policy "cashflow_balance_snapshots_access_by_household_membership"
  on public.cashflow_balance_snapshots
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_balance_snapshots.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_balance_snapshots.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "cashflow_income_events_access_by_household_membership" on public.cashflow_income_events;
create policy "cashflow_income_events_access_by_household_membership"
  on public.cashflow_income_events
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_income_events.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_income_events.household_id
        and household_memberships.user_id = auth.uid()
    )
  );

drop policy if exists "cashflow_settings_access_by_household_membership" on public.cashflow_settings;
create policy "cashflow_settings_access_by_household_membership"
  on public.cashflow_settings
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_settings.household_id
        and household_memberships.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.household_memberships
      where household_memberships.household_id = cashflow_settings.household_id
        and household_memberships.user_id = auth.uid()
    )
  );
