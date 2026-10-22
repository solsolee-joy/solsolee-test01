-- 나만 보는 일정, 개인 할 일, 루틴

-- 일정에 나만 보기. private이면 쓴 사람만 읽고 고친다 (상대 화면엔 아예 안 나온다)
alter table public.events add column private boolean not null default false;
alter policy "members all" on public.events
  using (public.is_member() and (not private or created_by = public.my_email()))
  with check (public.is_member() and (not private or created_by = public.my_email()));

-- 한 번 하는 할 일. done_on이 있으면 끝낸 일
create table public.todos (
  id         uuid primary key default gen_random_uuid(),
  owner      text not null default public.my_email() references public.members (email),
  title      text not null,
  due_on     date,
  memo       text,
  done_on    date,
  created_at timestamptz not null default now()
);
create index todos_owner_idx on public.todos (owner, done_on);

-- 반복 루틴. weekdays는 하는 요일 (1 월요일 … 7 일요일). 일곱 개 다면 매일
create table public.routines (
  id         uuid primary key default gen_random_uuid(),
  owner      text not null default public.my_email() references public.members (email),
  title      text not null,
  weekdays   int[] not null default '{1,2,3,4,5,6,7}'
             check (cardinality(weekdays) > 0 and weekdays <@ '{1,2,3,4,5,6,7}'),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- 루틴을 한 날. 하루에 한 번. 연속 기록은 화면에서 계산한다
create table public.routine_logs (
  routine_id uuid not null references public.routines (id) on delete cascade,
  done_on    date not null default current_date,
  owner      text not null default public.my_email() references public.members (email),
  primary key (routine_id, done_on)
);

alter table public.todos        enable row level security;
alter table public.routines     enable row level security;
alter table public.routine_logs enable row level security;
create policy "owner only" on public.todos for all to authenticated
  using (owner = public.my_email() and public.is_member()) with check (owner = public.my_email() and public.is_member());
create policy "owner only" on public.routines for all to authenticated
  using (owner = public.my_email() and public.is_member()) with check (owner = public.my_email() and public.is_member());
create policy "owner only" on public.routine_logs for all to authenticated
  using (owner = public.my_email() and public.is_member()) with check (owner = public.my_email() and public.is_member());

alter publication supabase_realtime add table public.todos, public.routines, public.routine_logs;
