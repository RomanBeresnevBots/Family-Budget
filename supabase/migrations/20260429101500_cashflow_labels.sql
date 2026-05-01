alter table public.cashflow_settings
  add column if not exists received_income_label text,
  add column if not exists budget_reserve_priority_label text,
  add column if not exists emergency_reserve_priority_label text,
  add column if not exists investments_priority_label text;

update public.cashflow_settings
set
  received_income_label = coalesce(received_income_label, 'Получено доходов'),
  budget_reserve_priority_label = coalesce(budget_reserve_priority_label, 'Перевести в бюджетную кубышку'),
  emergency_reserve_priority_label = coalesce(emergency_reserve_priority_label, 'Пополнить сейф безопасности'),
  investments_priority_label = coalesce(investments_priority_label, 'Можно направить в инвестиции и цели');
