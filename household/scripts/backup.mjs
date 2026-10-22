// Supabase 프로젝트의 public 표 전부와 Storage docs 버킷 파일을 내려받는다
// 사용: node household/scripts/backup.mjs <프로젝트 ref> <저장할 폴더>
// 키는 저장하지 않는다. Supabase CLI 로그인(npx supabase login)으로 service_role 키를 받아 쓴다
// 백업에는 개인 자료가 들어 있으니 저장소 밖에 둔다. 저장소는 공개다
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// 외래 키 순서 (넣을 때 이 순서대로)
export const TABLES = ['members', 'envelopes', 'debts', 'settings', 'rules', 'budgets', 'transactions', 'recurring',
  'notes', 'notices', 'events', 'chores', 'chore_logs', 'private_notes', 'docs', 'doc_files', 'inbox',
  'todos', 'routines', 'routine_logs'];

const [ref, out] = process.argv.slice(2);
if (!ref || !out) {
  console.error('사용: node backup.mjs <프로젝트 ref> <저장할 폴더>');
  process.exit(1);
}
const URL = `https://${ref}.supabase.co`;
const keys = JSON.parse(execSync(`npx --yes supabase projects api-keys --project-ref ${ref} -o json`,
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const key = keys.find(k => k.name === 'service_role')?.api_key;
if (!key) throw new Error('service_role 키를 받지 못했어요. npx supabase login을 다시 해 주세요');
const headers = { apikey: key, Authorization: `Bearer ${key}` };

mkdirSync(join(out, 'tables'), { recursive: true });
const manifest = { ref, taken_at: new Date().toISOString(), tables: {}, files: [] };

for (const t of TABLES) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL}/rest/v1/${t}?select=*`, { headers: { ...headers, Range: `${from}-${from + 999}` } });
    if (!res.ok) throw new Error(`${t} 읽기 실패 ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  writeFileSync(join(out, 'tables', `${t}.json`), JSON.stringify(rows, null, 1));
  manifest.tables[t] = rows.length;
}

// Storage는 폴더(doc_id)별로 목록을 받아 파일을 하나씩 내려받는다
async function list(prefix) {
  const res = await fetch(`${URL}/storage/v1/object/list/docs`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  if (!res.ok) throw new Error(`목록 실패 ${res.status} ${await res.text()}`);
  return res.json();
}
for (const dir of await list('')) {
  if (dir.id) continue; // 맨 위에 바로 놓인 파일은 없다
  for (const f of await list(dir.name)) {
    const path = `${dir.name}/${f.name}`;
    const res = await fetch(`${URL}/storage/v1/object/docs/${path}`, { headers });
    if (!res.ok) throw new Error(`${path} 받기 실패 ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = join(out, 'storage', 'docs', path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    manifest.files.push({ path, size: buf.length, mime: f.metadata?.mimetype ?? null });
  }
}

writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(JSON.stringify({ tables: manifest.tables, files: manifest.files.length, bytes: manifest.files.reduce((a, f) => a + f.size, 0) }));
