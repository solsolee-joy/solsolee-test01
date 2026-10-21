-- 프로필 주민 얼굴. 각자 자기 것만 바꾼다
alter table public.members add column avatar text;
create policy "update own profile" on public.members
  for update to authenticated
  using (email = public.my_email())
  with check (email = public.my_email());
