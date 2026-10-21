-- 자료 보관: 문서 페이지와 첨부 파일
-- 페이지마다 함께 보기(shared) 또는 나만 보기. 파일은 비공개 버킷 docs/{doc_id}/... 에 둔다

create table public.docs (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text not null default '기타',
  body       text,
  shared     boolean not null default true,
  owner      text not null default public.my_email() references public.members (email),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doc_files (
  id         uuid primary key default gen_random_uuid(),
  doc_id     uuid not null references public.docs (id) on delete cascade,
  path       text not null unique,
  name       text not null,
  size       bigint,
  mime       text,
  created_by text default public.my_email(),
  created_at timestamptz not null default now()
);
create index doc_files_doc_idx on public.doc_files (doc_id);

-- 이 문서를 지금 사용자가 볼 수 있는가
create or replace function public.can_see_doc(doc uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_member() and exists (
    select 1 from public.docs d
    where d.id = doc and (d.shared or d.owner = public.my_email())
  );
$$;
revoke execute on function public.can_see_doc(uuid) from public, anon;
grant execute on function public.can_see_doc(uuid) to authenticated;

alter table public.docs      enable row level security;
alter table public.doc_files enable row level security;

create policy "visible docs" on public.docs
  for select to authenticated using (public.is_member() and (shared or owner = public.my_email()));
create policy "insert own docs" on public.docs
  for insert to authenticated with check (public.is_member() and owner = public.my_email());
create policy "edit visible docs" on public.docs
  for update to authenticated
  using (public.is_member() and (shared or owner = public.my_email()))
  with check (public.is_member() and (shared or owner = public.my_email()));
create policy "delete visible docs" on public.docs
  for delete to authenticated using (public.is_member() and (shared or owner = public.my_email()));

create policy "files of visible docs" on public.doc_files
  for all to authenticated using (public.can_see_doc(doc_id)) with check (public.can_see_doc(doc_id));

-- 비공개 버킷 (파일 하나 최대 50MB)
insert into storage.buckets (id, name, public, file_size_limit)
values ('docs', 'docs', false, 52428800);

create policy "docs bucket read" on storage.objects
  for select to authenticated
  using (bucket_id = 'docs' and public.can_see_doc(((storage.foldername(name))[1])::uuid));
create policy "docs bucket insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'docs' and public.can_see_doc(((storage.foldername(name))[1])::uuid));
create policy "docs bucket delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'docs' and public.can_see_doc(((storage.foldername(name))[1])::uuid));

alter publication supabase_realtime add table public.docs, public.doc_files;
