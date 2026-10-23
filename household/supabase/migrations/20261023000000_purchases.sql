-- 구매 목록. 이사 뒤 살 가구·가전·비품을 순위와 예상 금액으로 정리하고, 산 것은 체크한다.
-- 가계부와는 따로 둔다 (산 날 지출은 지금처럼 거래로 기록)
create table public.purchases (
  id          bigint generated always as identity primary key,
  name        text not null check (length(name) between 1 and 200),
  category    text not null default '비품' check (category in ('가구', '가전', '비품', '생필품', '위시')),
  priority    smallint not null default 2 check (priority between 0 and 4),
  est_amount  integer check (est_amount >= 0),
  paid_amount integer check (paid_amount >= 0),
  buyer       text not null default '같이' check (buyer in ('새별', '연표', '같이', '선물')),
  gift_from   text,
  status      text not null default '살 것' check (status in ('살 것', '고민 중', '샀음')),
  bought_on   date,
  link        text,
  memo        text,
  created_by  text not null default public.my_email() references public.members (email),
  created_at  timestamptz not null default now()
);
alter table public.purchases enable row level security;
create policy "members all" on public.purchases
  for all to authenticated using (public.is_member()) with check (public.is_member());

alter publication supabase_realtime add table public.purchases;
