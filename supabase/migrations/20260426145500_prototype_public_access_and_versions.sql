alter table public.expense_series_versions
  add column if not exists previous_amount numeric(12, 2);

update public.expense_series_versions
set previous_amount = amount
where previous_amount is null;

alter table public.expense_series_versions
  alter column previous_amount set not null;

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on public.households,
     public.people,
     public.categories,
     public.expense_series,
     public.expense_series_versions,
     public.expense_occurrences
  to anon, authenticated, service_role;
