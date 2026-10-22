// backup.mjs로 받은 표를 새 프로젝트에 넣는 SQL을 만든다 (표 구조는 migrations로 먼저 만든다)
// 사용: node household/scripts/restore-sql.mjs <백업 폴더> > restore.sql
//       npx supabase db query --linked --project-ref <새 ref> -f restore.sql
// 만든 SQL에는 개인 자료가 들어 있으니 저장소 밖에 둔다
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// backup.mjs의 TABLES와 같은 순서 (외래 키 순서)
const TABLES = ['members', 'envelopes', 'debts', 'settings', 'rules', 'budgets', 'transactions', 'recurring',
  'notices', 'events', 'chores', 'chore_logs', 'private_notes', 'docs', 'doc_files', 'inbox',
  'todos', 'routines', 'routine_logs'];
const dir = process.argv[2];
if (!dir) { console.error('사용: node restore-sql.mjs <백업 폴더>'); process.exit(1); }

const out = ['begin;'];
// migrations가 넣은 시드(예산 10개 등)를 비우고 백업으로 채운다
out.push(`truncate ${TABLES.map(t => `public.${t}`).join(', ')} cascade;`);
for (const t of TABLES) {
  // 표가 생기기 전에 받은 백업에는 그 파일이 없다
  if (!existsSync(join(dir, 'tables', `${t}.json`))) continue;
  const json = readFileSync(join(dir, 'tables', `${t}.json`), 'utf8');
  if (JSON.parse(json).length === 0) continue;
  if (json.includes('$bk$')) throw new Error(`${t}에 구분 문자열이 들어 있어요`);
  // identity 열 값도 그대로 넣는다
  out.push(`insert into public.${t} overriding system value select * from json_populate_recordset(null::public.${t}, $bk$${json}$bk$);`);
}
// identity 열 다음 번호를 넣은 값 뒤로 맞춘다
out.push(`do $$ declare r record; begin
  for r in select table_name, column_name from information_schema.columns
    where table_schema = 'public' and is_identity = 'YES' loop
    execute format('select setval(pg_get_serial_sequence(%L, %L), coalesce((select max(%I) from public.%I), 0) + 1, false)',
      'public.' || r.table_name, r.column_name, r.column_name, r.table_name);
  end loop;
end $$;`);
out.push('commit;');
process.stdout.write(out.join('\n') + '\n');
