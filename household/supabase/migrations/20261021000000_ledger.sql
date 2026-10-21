-- 우리집 가계부 스키마
-- 거래·봉투·부채·분류규칙·운영메모. 접근은 members 테이블에 등록된 이메일만 허용한다.

-- 구성원 ------------------------------------------------------------------

create table public.members (
  email        text primary key,
  display_name text not null,
  created_at   timestamptz not null default now()
);

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.email = (auth.jwt() ->> 'email')
  );
$$;

revoke execute on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

-- 봉투 --------------------------------------------------------------------

create table public.envelopes (
  name       text primary key,
  sort_order int  not null
);

insert into public.envelopes (name, sort_order) values
  ('식비', 1), ('교통', 2), ('생활·주거', 3), ('건강·의료', 4),
  ('여가·모임', 5), ('쇼핑·자기계발', 6), ('고정비', 7),
  ('부채상환', 8), ('비상금', 9), ('기타', 10);

-- 부채 --------------------------------------------------------------------

create table public.debts (
  id                 text primary key,          -- KEY, 광주, OK, 신한 1 ...
  lender             text   not null,
  product            text   not null,
  balance            bigint not null,
  rate               numeric(5,2),
  monthly_payment    bigint,
  due_day            int check (due_day between 1 and 31),  -- 미확인이면 null
  next_due           date,
  status             text   not null default '상환 중',
  principal          bigint,
  maturity           date,
  repayment_method   text,
  memo               text,
  balance_checked_on date,                      -- 앱에서 잔액을 마지막으로 확인한 날
  updated_at         timestamptz not null default now()
);

-- 거래 --------------------------------------------------------------------

create table public.transactions (
  id             text primary key,              -- TX-YYYYMMDD-NNN
  date           date   not null,
  description    text   not null,               -- 원문
  type           text   not null check (type in ('수입', '지출', '이동')),
  amount         bigint not null check (amount >= 0),
  envelope       text references public.envelopes (name),
  category       text,                          -- 중분류
  subcategory    text,                          -- 소분류
  payment_method text,
  debt_id        text references public.debts (id),
  memo           text,
  needs_review   boolean not null default false,
  tags           text[]  not null default '{}', -- 이사, 사이드 프로젝트 ...
  one_off        boolean not null default false, -- 월 수지 비교에서 뺄 일회성 거래
  source         text,                          -- 대화 입력, 기존 가계부 ...
  created_by     text default (auth.jwt() ->> 'email'),
  created_at     timestamptz not null default now()
);

create index transactions_date_idx on public.transactions (date);
create index transactions_review_idx on public.transactions (needs_review) where needs_review;

-- 월별 봉투 배정 ------------------------------------------------------------

create table public.budgets (
  month      date   not null check (extract(day from month) = 1),
  envelope   text   not null references public.envelopes (name),
  allocated  bigint not null default 0,
  carry_over bigint not null default 0,
  extra      bigint not null default 0,
  moved_out  bigint not null default 0,
  memo       text,
  primary key (month, envelope)
);

-- 분류규칙 ------------------------------------------------------------------

create table public.rules (
  id              bigint generated always as identity primary key,
  keyword         text not null unique,
  type            text check (type in ('수입', '지출', '이동')),
  envelope        text references public.envelopes (name),
  category        text,
  subcategory     text,
  default_payment text,
  debt_id         text references public.debts (id),
  note            text
);

-- 운영메모 (목표, 보호지출, 소득, 계좌 흐름 등) ---------------------------------

create table public.notes (
  id         bigint generated always as identity primary key,
  section    text not null,
  item       text not null,
  content    text not null,
  updated_on date
);

-- 집계 뷰 -----------------------------------------------------------------

create view public.monthly_envelope_summary
with (security_invoker = true) as
select
  b.month,
  b.envelope,
  e.sort_order,
  b.allocated + b.carry_over + b.extra - b.moved_out as available,
  coalesce(s.spent, 0) as spent,
  b.allocated + b.carry_over + b.extra - b.moved_out - coalesce(s.spent, 0) as remaining
from public.budgets b
join public.envelopes e on e.name = b.envelope
left join (
  select date_trunc('month', date)::date as month, envelope, sum(amount) as spent
  from public.transactions
  where type = '지출'
  group by 1, 2
) s on s.month = b.month and s.envelope = b.envelope;

create view public.monthly_summary
with (security_invoker = true) as
select
  date_trunc('month', date)::date as month,
  sum(amount) filter (where type = '수입')                       as income,
  sum(amount) filter (where type = '지출')                       as expense,
  sum(amount) filter (where type = '수입' and not one_off)       as income_regular,
  sum(amount) filter (where type = '지출' and not one_off)       as expense_regular,
  sum(amount) filter (where type = '지출' and envelope = '부채상환') as debt_repaid,
  count(*)    filter (where needs_review)                        as review_count
from public.transactions
group by 1;

-- 접근 제어 ---------------------------------------------------------------

alter table public.members      enable row level security;
alter table public.envelopes    enable row level security;
alter table public.debts        enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets      enable row level security;
alter table public.rules        enable row level security;
alter table public.notes        enable row level security;

create policy "members read" on public.members
  for select to authenticated using (public.is_member());

create policy "members all" on public.envelopes
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.debts
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.transactions
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.budgets
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.rules
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.notes
  for all to authenticated using (public.is_member()) with check (public.is_member());
