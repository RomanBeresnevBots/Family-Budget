alter table public.expense_series
  add column if not exists stopped_from date;
