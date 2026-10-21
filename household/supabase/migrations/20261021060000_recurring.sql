-- 정기 지출과 월급날. 홈의 '나갈 돈 미리보기'와 부채 상환 계획에 쓴다

create table public.recurring (
  id             bigint generated always as identity primary key,
  name           text not null,
  amount         bigint not null check (amount >= 0),
  day            int check (day between 1 and 31),       -- 매월 며칠. on_payday면 무시
  on_payday      boolean not null default false,          -- 월급날에 함께 나가는 돈
  envelope       text references public.envelopes (name),
  payment_method text,
  estimated      boolean not null default false,          -- 금액이 추정치
  start_on       date not null default current_date,
  end_on         date,
  active         boolean not null default true,
  memo           text
);
alter table public.recurring enable row level security;
create policy "members all" on public.recurring
  for all to authenticated using (public.is_member()) with check (public.is_member());
alter publication supabase_realtime add table public.recurring;

-- 월급날에 몰아서 갚는 대출인지. 신한 햇살론 Youth는 각자 납부일에 따로 나간다
alter table public.debts add column pay_on_payday boolean not null default true;
update public.debts set pay_on_payday = false where id in ('신한 1', '신한 2', '신한 3', '학자금');

-- 월급날: 매월 25일, 주말이면 앞 금요일
insert into public.settings (key, value) values ('payday_day', '25');

insert into public.recurring (name, amount, day, on_payday, envelope, payment_method, estimated, start_on, memo) values
  ('신림 월세',        400000,    4, false, '생활·주거', null,         false, '2026-11-01', '관악구 복은14길 24, 402호'),
  ('LH 이자',          194500, null, true,  '생활·주거', null,         true,  '2026-10-01', '이사 후에도 그대로일 것으로 추정'),
  ('쿠팡 와우',          7890,    3, false, '고정비',    '부부통장',   false, '2026-10-01', null),
  ('드래곤빌리지3',      9900,    2, false, '고정비',    '휴대폰 결제', false, '2026-10-01', '광고제거권'),
  ('캔바 Pro',           9900,    4, false, '고정비',    '부부통장',   false, '2026-10-01', null),
  ('우주패스',          15500,    4, false, '고정비',    '부부통장',   false, '2026-10-01', '유튜브 프리미엄 포함'),
  ('커버링',             4900,    8, false, '고정비',    '농협카드',   false, '2026-10-01', null),
  ('런드리고',          46600,    8, false, '고정비',    '부부통장',   false, '2026-10-01', '런드리온리 베이직'),
  ('라프텔',            14900,   23, false, '고정비',    '농협카드',   false, '2026-10-01', null),
  ('와이즐리',           2990,   25, false, '고정비',    '농협카드',   false, '2026-10-01', null),
  ('OpenCode',          15149,   26, false, '고정비',    '부부통장',   true,  '2026-10-01', 'US$10, 환율에 따라 달라짐');
