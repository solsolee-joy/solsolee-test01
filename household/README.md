# 우리집 가계부

두 사람이 같이 쓰는 생활 허브. 첫 화면은 가계부이고, 집안일 등은 나중에 붙인다.

- 데이터와 로그인: Supabase 프로젝트 `twrcgrflwvwljdyhxuwr` (개인용 조직, 회사 위키 조직과 분리)
- 화면: 정적 페이지. 호스팅 위치는 미정 (GitHub Pages 또는 Cloudflare Pages)
- 접근: `members` 테이블에 등록된 이메일만 RLS로 읽고 쓴다. publishable key는 공개돼도 된다
- 거래 기록은 이 저장소에 두지 않는다. 데이터는 Supabase에만 있다

## 스키마

`supabase/migrations/20261021000000_ledger.sql`

| 테이블 | 내용 |
|---|---|
| `transactions` | 거래. 유형은 수입·지출·이동 |
| `envelopes` | 봉투 10개 |
| `budgets` | 월별 봉투 배정액 (month는 그 달 1일) |
| `debts` | 대출 13건 |
| `rules` | 키워드별 분류 기본값 |
| `notes` | 운영 메모. 작성자만 본다 |
| `members` | 접근 허용 이메일 |
| `settings` | 예상 월수입 등 설정 |
| `events` | 일정 (owner null = 함께) |
| `chores` / `chore_logs` | 집안일과 완료 기록 |
| `private_notes` | 나만 보는 메모 (작성자만 접근) |
| `notices` | 함께 보는 공지 |

뷰: `monthly_summary`(월 수입·지출, 일회성 제외 수지, 검토 필요 건수), `monthly_envelope_summary`(봉투별 사용액과 남은 금액)

## 기록 규칙

- 카드·휴대폰 결제는 산 날 지출로 기록하고, 대금 납부는 `이동`으로 기록한다 (두 번 잡히지 않게)
- 확인이 필요한 거래는 `needs_review = true`
- 이사, 사이드 프로젝트 같은 묶음은 `tags`에 넣는다
- 자부담금, 가구 판매처럼 평소 흐름과 무관한 큰 금액은 `one_off = true`

## 진행 상황

- 2026-10-21 스키마 적용, 구글 시트 데이터 이관 완료 (거래 253건, 부채 13건, 규칙 79개, 운영메모 28개)
  - 9월·10월 봉투별 지출 합계와 월 수입·지출이 원래 시트 대시보드와 일치함을 확인
- 이관에 쓴 `import.fetch_sheet` 함수와 `http` 확장은 아직 남아 있다. API로 노출되지 않지만 지워도 된다:
  `drop schema import cascade; drop extension http;`
- 2026-10-21 `members`에 두 사람 등록, 10월·11월 봉투 배정 초안 입력, 9월 집 계약금 일회성 처리
- 2026-10-21 화면(`index.html`) 작성. GitHub Pages로 배포
  - 주소: https://solsolee-joy.github.io/solsolee-test01/household/
  - 로그인은 이메일 링크(Supabase Auth). Supabase 대시보드 Authentication → URL Configuration에서
    Site URL과 Redirect URLs에 위 주소를 넣어야 링크가 이 페이지로 돌아온다
- 2026-10-21 일정(`events`)과 집안일(`chores`, `chore_logs`) 추가. 탭은 홈·내역·일정·집안일·더보기
  - 일정 owner가 null이면 함께. 토요일은 남편 쉬는 날로 달력에 표시
  - 집안일은 완료하면 기록이 남고 반복 주기만큼 다음 날짜가 밀린다
- 2026-10-21 공개 범위 정리
  - `private_notes`: 거래·일정·집안일에 다는 나만 보는 메모. RLS로 작성자만 읽고 쓴다
  - `notes`(운영 메모)는 `owner` 열을 추가해 작성자만 보게 바꿈. 기존 28개는 새별 소유
  - `notices`: 둘이 함께 보는 공지. `pinned`면 홈 맨 위에 나온다
  - 주의: 일정·거래·집안일의 본문과 `memo`는 두 사람 모두 본다. 상대에게 숨길 내용은 `private_notes`에만 쓴다
- 남은 일: 봉투 배정액 확정

## 구글 시트에서 옮길 때 정리한 것

원본: 가계부 구글 시트의 `거래내역_2026-09`, `거래내역_2026-10`, `부채현황`, `분류규칙`, `운영기준` 탭

1. 검토상태 `확인 필요`·`검토 필요` → `needs_review = true`
2. 구독 분류 통일: `고정비 > 통신비 > 구독` → `고정비 > 구독 > (서비스 종류)`
3. 상담 소분류 `헬스서비스` → `심리서비스`
4. 메모 끝의 `[이사]` `[사이드 프로젝트]` `[인디보드게임마켓]` → `tags`
5. 2026-10-03 자부담금 2,200,000원과 가구 판매 대금 1,500,000원 → `one_off = true`
6. 2026-10-07 신한은행 상환 41,185원: 부채명 `신한`이 부채현황에 없음 → `debt_id` 비우고 `needs_review = true`
7. 분류규칙에 휴대폰 요금 납부 규칙 추가: 휴대폰 결제분 정산은 `이동`
