-- 나만 보는 메모, 운영메모 비공개 전환, 공지

create or replace function public.my_email()
returns text
language sql
stable
set search_path = ''
as $$ select auth.jwt() ->> 'email' $$;

-- 거래·일정·집안일에 다는 개인 메모. 쓴 사람만 읽고 쓴다
create table public.private_notes (
  owner       text not null default public.my_email() references public.members (email),
  target_type text not null check (target_type in ('transaction', 'event', 'chore')),
  target_id   text not null,
  body        text not null,
  updated_at  timestamptz not null default now(),
  primary key (owner, target_type, target_id)
);
alter table public.private_notes enable row level security;
create policy "owner only" on public.private_notes
  for all to authenticated
  using (owner = public.my_email() and public.is_member())
  with check (owner = public.my_email() and public.is_member());

-- 운영메모는 작성자만 본다. 기존 메모는 모두 새별 것
alter table public.notes add column owner text references public.members (email) default public.my_email();
update public.notes set owner = 'birdsol1122@gmail.com' where owner is null;
alter table public.notes alter column owner set not null;
-- 정책 이름은 그대로 두고 조건만 작성자 본인으로 좁힌다
alter policy "members all" on public.notes
  using (owner = public.my_email() and public.is_member())
  with check (owner = public.my_email() and public.is_member());

-- 둘이 함께 보는 공지
create table public.notices (
  id         bigint generated always as identity primary key,
  title      text not null,
  body       text,
  pinned     boolean not null default false,
  created_by text default public.my_email(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notices enable row level security;
create policy "members all" on public.notices
  for all to authenticated using (public.is_member()) with check (public.is_member());

alter publication supabase_realtime add table public.private_notes, public.notices;
