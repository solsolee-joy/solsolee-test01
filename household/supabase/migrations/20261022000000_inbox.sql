-- 받은 메모. 분류 없이 아무렇게나 남긴 기록거리를 모아 두고, 나중에 가계부·자료로 정리한 뒤 지운다
create table public.inbox (
  id         bigint generated always as identity primary key,
  body       text not null check (length(body) between 1 and 4000),
  created_by text not null default public.my_email() references public.members (email),
  created_at timestamptz not null default now()
);
alter table public.inbox enable row level security;
create policy "members all" on public.inbox
  for all to authenticated using (public.is_member()) with check (public.is_member());

alter publication supabase_realtime add table public.inbox;
