// 자료 페이지에 파일을 붙인다. Claude가 대신 이미지를 올릴 때 쓴다
// 사용: node household/scripts/upload-doc-file.mjs <doc_id> <파일 경로> [보일 이름] [올린 사람 이메일]
// 키는 저장하지 않는다. 실행할 때마다 Supabase CLI 로그인(npx supabase login)으로 service_role 키를 받아 쓴다
import { execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

const REF = 'jryxpbtudqzjtchcauim';
const URL = `https://${REF}.supabase.co`;
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.heic': 'image/heic', '.pdf': 'application/pdf' };

const [docId, file, name = basename(file ?? ''), createdBy = 'birdsol1122@gmail.com'] = process.argv.slice(2);
if (!docId || !file) {
  console.error('사용: node upload-doc-file.mjs <doc_id> <파일 경로> [보일 이름] [올린 사람 이메일]');
  process.exit(1);
}

const keys = JSON.parse(execSync(`npx --yes supabase projects api-keys --project-ref ${REF} -o json`,
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const key = keys.find(k => k.name === 'service_role')?.api_key;
if (!key) throw new Error('service_role 키를 받지 못했어요. npx supabase login을 다시 해 주세요');
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const ext = extname(file).toLowerCase();
const mime = MIME[ext] ?? 'application/octet-stream';
const size = statSync(file).size;
if (size > 52428800) throw new Error('50MB가 넘는 파일은 올릴 수 없어요');
// 화면에서 올릴 때와 같은 경로 규칙: docs/{doc_id}/{uuid}.{ext}
const path = `${docId}/${randomUUID()}${ext}`;

const up = await fetch(`${URL}/storage/v1/object/docs/${path}`, {
  method: 'POST', headers: { ...headers, 'Content-Type': mime }, body: readFileSync(file),
});
if (!up.ok) throw new Error(`업로드 실패 ${up.status} ${await up.text()}`);

const row = await fetch(`${URL}/rest/v1/doc_files`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ doc_id: docId, path, name, size, mime, created_by: createdBy }),
});
if (!row.ok) {
  // 기록을 못 남겼으면 올린 파일도 지워서 고아 파일이 남지 않게 한다
  await fetch(`${URL}/storage/v1/object/docs/${path}`, { method: 'DELETE', headers });
  throw new Error(`기록 실패 ${row.status} ${await row.text()}`);
}
console.log(JSON.stringify({ ok: true, path, name, size, mime }));
