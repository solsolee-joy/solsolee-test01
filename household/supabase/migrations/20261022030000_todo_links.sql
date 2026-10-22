-- 할 일에 일정 연결과 하위 할 일 (한 단계까지)
alter table public.todos
  add column event_id  uuid references public.events (id) on delete set null,
  add column parent_id uuid references public.todos (id) on delete cascade,
  add constraint todos_not_own_parent check (parent_id is distinct from id);
create index todos_parent_idx on public.todos (parent_id);
create index todos_event_idx on public.todos (event_id);
