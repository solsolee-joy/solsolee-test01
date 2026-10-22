// backup.mjs로 받은 Storage docs 파일을 새 프로젝트에 같은 경로로 올린다 (doc_files.path가 그대로 맞게)
// 사용: node household/scripts/restore-storage.mjs <새 프로젝트 ref> <백업 폴더>
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [ref, dir] = process.argv.slice(2);
if (!ref || !dir) { console.error('사용: node restore-storage.mjs <새 프로젝트 ref> <백업 폴더>'); process.exit(1); }
const URL = `https://${ref}.supabase.co`;
const keys = JSON.parse(execSync(`npx --yes supabase projects api-keys --project-ref ${ref} -o json`,
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const key = keys.find(k => k.name === 'service_role')?.api_key;
if (!key) throw new Error('service_role 키를 받지 못했어요. npx supabase login을 다시 해 주세요');

const { files } = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
for (const f of files) {
  const res = await fetch(`${URL}/storage/v1/object/docs/${f.path}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': f.mime || 'application/octet-stream', 'x-upsert': 'true' },
    body: readFileSync(join(dir, 'storage', 'docs', f.path)),
  });
  if (!res.ok) throw new Error(`${f.path} 올리기 실패 ${res.status} ${await res.text()}`);
  console.log('ok', f.path, f.size);
}
