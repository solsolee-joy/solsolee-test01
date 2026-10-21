// 아무렇게나 적은 글을 가계부 기록이나 자료 초안으로 정리한다. 저장은 하지 않고 초안만 돌려준다
// 키는 Edge Function 비밀값 OPENCODE_API_KEY. 다른 AI로 바꿀 때는 OPENCODE_BASE_URL, OPENCODE_MODEL만 바꾼다
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const BASE_URL = Deno.env.get('OPENCODE_BASE_URL') ?? 'https://opencode.ai/inference/go/openai/v1';
const MODEL = Deno.env.get('OPENCODE_MODEL') ?? 'kimi-k3';
const TYPES = ['수입', '지출', '이동'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply({ error: 'POST만 받아요' }, 405);

  const key = Deno.env.get('OPENCODE_API_KEY');
  if (!key) return reply({ error: 'AI 키가 아직 없어요. Supabase Edge Functions 비밀값에 OPENCODE_API_KEY를 넣어 주세요' }, 500);

  // 로그인한 사람 권한 그대로 읽는다. members에 없으면 RLS 때문에 아무것도 못 읽는다
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: ok } = await sb.rpc('is_member');
  if (!ok) return reply({ error: '등록된 사람만 쓸 수 있어요' }, 403);

  const { mode, text, today } = await req.json().catch(() => ({}));
  if (!['tx', 'doc'].includes(mode) || typeof text !== 'string' || !text.trim())
    return reply({ error: '정리할 내용을 적어 주세요' }, 400);
  if (text.length > 4000) return reply({ error: '4,000자까지 한 번에 정리할 수 있어요' }, 400);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : new Date().toISOString().slice(0, 10);

  try {
    if (mode === 'tx') return reply({ items: await draftTransactions(sb, text, day) });
    return reply({ doc: await draftDoc(sb, text) });
  } catch (err) {
    console.error(err);
    return reply({ error: `AI가 정리하지 못했어요: ${(err as Error).message}` }, 502);
  }
});

async function ask(system: string, user: string) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('OPENCODE_API_KEY')}`,
      'Content-Type': 'application/json',
      // OpenCode Go는 요청마다 세션 번호와 앱 이름을 요구한다. 정리 한 번이 대화 하나다
      'x-opencode-session': crypto.randomUUID(),
      'User-Agent': 'two-clocks-home/1.0',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const content: string = (await res.json()).choices?.[0]?.message?.content ?? '';
  // 모델이 앞뒤에 설명이나 코드 블록을 붙여도 JSON만 꺼낸다
  const json = content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1);
  return JSON.parse(json);
}

// deno-lint-ignore no-explicit-any
async function draftTransactions(sb: any, text: string, today: string) {
  const [env, rules, debts] = await Promise.all([
    sb.from('envelopes').select('name').order('sort_order'),
    sb.from('rules').select('keyword, type, envelope, category, subcategory, default_payment, debt_id'),
    sb.from('debts').select('id, lender, product'),
  ]);
  const envelopes: string[] = (env.data ?? []).map((e: { name: string }) => e.name);
  const debtIds: string[] = (debts.data ?? []).map((d: { id: string }) => d.id);

  const system = `너는 두 사람이 같이 쓰는 가계부의 기록 도우미다. 사용자가 아무렇게나 적은 글에서 거래를 뽑아 JSON으로만 답한다.
오늘은 ${today}이다. "어제", "지난 금요일" 같은 말은 오늘을 기준으로 날짜(YYYY-MM-DD)로 바꾼다. 날짜가 없으면 오늘로 한다.

답 형식: {"items":[{"date","description","type","amount","envelope","category","subcategory","payment_method","debt_id","tags","one_off","needs_review","reason"}]}
- type: 수입, 지출, 이동 중 하나
- amount: 원 단위 정수. "5만2천" → 52000
- description: 가게나 내용을 짧게. 예: "이마트 장보기"
- envelope: 지출이면 반드시 다음 중 하나 ${JSON.stringify(envelopes)}. 수입·이동이면 null
- debt_id: 대출 상환일 때만 ${JSON.stringify(debtIds)} 중 하나, 아니면 null
- tags: 문자열 배열. 이사, 사이드 프로젝트 같은 묶음이 보일 때만
- one_off: 이사 비용, 가구 판매처럼 평소 흐름과 무관한 큰 금액이면 true
- needs_review: 금액, 날짜, 분류 중 확실하지 않은 게 있으면 true
- reason: 확인이 필요한 이유를 한 문장으로. 없으면 null

기록 규칙:
- 카드·휴대폰 결제는 산 날 지출로 기록한다. 카드 대금이나 휴대폰 요금 납부는 '이동'이다 (두 번 잡히지 않게)
- 내 계좌끼리 옮긴 돈, 저축 이체도 '이동'이다
- 아래 분류 규칙의 키워드가 내용에 들어 있으면 그 규칙의 값을 그대로 쓴다
- 거래가 아닌 내용은 빼고, 거래가 없으면 {"items":[]}

분류 규칙:
${JSON.stringify(rules.data ?? [])}`;

  const out = await ask(system, text);
  return (Array.isArray(out.items) ? out.items : []).slice(0, 20).map((t: Record<string, unknown>) => {
    const type = TYPES.includes(t.type as string) ? t.type as string : '지출';
    const envelope = envelopes.includes(t.envelope as string) ? t.envelope as string : null;
    const amount = Math.max(0, Math.round(Number(t.amount) || 0));
    const date = /^\d{4}-\d{2}-\d{2}$/.test(t.date as string) ? t.date as string : today;
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
    return {
      date, type, amount,
      description: str(t.description) ?? '내용 없음',
      envelope: type === '지출' ? envelope : null,
      category: str(t.category),
      subcategory: str(t.subcategory),
      payment_method: str(t.payment_method),
      debt_id: debtIds.includes(t.debt_id as string) ? t.debt_id : null,
      tags: Array.isArray(t.tags) ? t.tags.filter(x => typeof x === 'string') : [],
      one_off: t.one_off === true,
      // 봉투를 못 정했거나 금액이 없으면 꼭 확인하게 한다
      needs_review: t.needs_review === true || !amount || (type === '지출' && !envelope),
      reason: str(t.reason),
    };
  });
}

// deno-lint-ignore no-explicit-any
async function draftDoc(sb: any, text: string) {
  const { data } = await sb.from('docs').select('category');
  const cats = [...new Set(['집·이사', '금융', '보험', '가전·보증서', '건강', '기타', ...(data ?? []).map((d: { category: string }) => d.category)])];

  const system = `너는 두 사람이 같이 쓰는 집 위키의 정리 도우미다. 사용자가 붙여 넣은 메모·카톡·링크를 자료 한 페이지로 정리해 JSON으로만 답한다.
답 형식: {"title","category","body"}
- title: 나중에 찾기 쉬운 짧은 제목
- category: 가능하면 ${JSON.stringify(cats)} 중 하나. 정말 안 맞으면 새로 짓는다
- body: 사실만 남기고 보기 좋게 줄을 나눈다. "항목: 값" 형태를 쓴다. 주소, 금액, 날짜, 전화번호, 링크는 한 글자도 바꾸지 않는다. 원문에 없는 내용은 지어내지 않는다`;

  const out = await ask(system, text);
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  return { title: str(out.title) ?? '새 자료', category: str(out.category) ?? '기타', body: str(out.body) ?? text };
}
