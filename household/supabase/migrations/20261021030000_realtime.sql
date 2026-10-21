-- 화면이 변경을 실시간으로 받도록 Realtime 발행에 추가. RLS는 그대로 적용된다
alter publication supabase_realtime add table
  public.transactions, public.budgets, public.debts, public.events,
  public.chores, public.chore_logs, public.settings, public.notes;
