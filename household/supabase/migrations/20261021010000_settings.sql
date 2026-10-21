-- 앱 설정 (예상 월수입 등)
create table public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy "members all" on public.settings
  for all to authenticated using (public.is_member()) with check (public.is_member());

-- 운영기준: 급여 평월 실수령 약 280만원 + 남편 공동생활비 월 100만원
insert into public.settings (key, value) values ('expected_monthly_income', '3800000');
