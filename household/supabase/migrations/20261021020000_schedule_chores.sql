-- 일정과 집안일

-- 일정. owner가 null이면 둘이 함께하는 일정
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  owner      text references public.members (email),
  date       date not null,
  start_time time,
  end_time   time,
  title      text not null,
  place      text,
  memo       text,
  created_by text default (auth.jwt() ->> 'email'),
  created_at timestamptz not null default now()
);
create index events_date_idx on public.events (date);

-- 집안일. assignee가 null이면 누구나. repeat_days가 null이면 한 번만 하는 일
create table public.chores (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  assignee    text references public.members (email),
  repeat_days int check (repeat_days > 0),
  due_on      date not null default current_date,
  memo        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.chore_logs (
  id       bigint generated always as identity primary key,
  chore_id uuid not null references public.chores (id) on delete cascade,
  done_by  text not null default (auth.jwt() ->> 'email'),
  done_on  date not null default current_date
);
create index chore_logs_chore_idx on public.chore_logs (chore_id, done_on desc);

alter table public.events     enable row level security;
alter table public.chores     enable row level security;
alter table public.chore_logs enable row level security;

create policy "members all" on public.events
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.chores
  for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members all" on public.chore_logs
  for all to authenticated using (public.is_member()) with check (public.is_member());
