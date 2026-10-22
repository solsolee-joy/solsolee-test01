-- 매년 나가는 정기 지출. month가 있으면 그 달 day일에만 나간다. null이면 매달
alter table public.recurring add column month int check (month between 1 and 12);
alter table public.recurring add constraint recurring_yearly_day check (month is null or (day is not null and not on_payday));
