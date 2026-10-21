# 다음 세션에 이어서 할 일

마지막 클라우드 세션(2026-10-21)에서 넘겨받는 메모. 로컬에서 새 세션을 열면 이 파일부터 읽게 한다.

## 지금 상태

- 화면: `household/index.html` 한 파일. GitHub Pages가 브랜치 `ccr-1624c47a-rm3p6v`에서 배포
  - https://solsolee-joy.github.io/solsolee-test01/household/
- 데이터: Supabase 프로젝트 `twrcgrflwvwljdyhxuwr`. 스키마는 `supabase/migrations/`에 순서대로 있고 전부 적용됨
- 디자인: 크림·월넛·올리브·앰버 팔레트, 온글잎 박다현체 제목, 이서윤체 본문·숫자, 손그림 테두리, 동숲 아이콘. 자세한 결정은 README 진행 상황

## 확인된 것

- 2026-10-21 로컬 세션: 예전 월세·월급날 일정은 지워져 있다. `events`에 제목이 '월세'·'월급'을 포함하는 행 0건 (전체 8건).
  날짜 열 이름은 `starts_on`이 아니라 `date`다
- 2026-10-21 로컬 세션: 이관용 `import` 스키마와 `http` 확장을 지웠다. 거래 253건 그대로

## 남은 일

- 비밀번호 로그인(README 진행 상황)을 실제로 써 보기: 메일 링크로 들어와 비밀번호 정하기 → 로그아웃 → 비밀번호로 다시 들어오기
- 화면을 다듬은 뒤 남편에게 보여 주기. 그다음 남편 계정으로 로그인해서 프로필 주민 고르기, 일정·집안일 같이 써 보기
- 주소를 Cloudflare Pages(`이름.pages.dev`)로 옮기기. 새별이 Cloudflare에서 이 저장소를 연결하면,
  첫 화면이 household로 가게 하고 Supabase Auth Site URL·Redirect URL과 문서의 주소를 새 주소로 바꾼다.
  남편이 홈 화면 아이콘을 추가하기 전에 하는 게 좋다
- 봉투 배정액은 2027년까지 확정하지 않고 지출 추이를 본다. 10월·11월 초안을 두고, 새 달은 '지난달 값 복사'로 채운다

Supabase Auth의 Site URL과 Redirect URL은 배포 주소로 돼 있는 것 확인함 (2026-10-21)

## 받은 메모 정리하는 법

새별이 "받은 메모 정리해 줘"라고 하면:

1. `select * from public.inbox order by created_at`로 메모를 읽는다
2. 메모마다 가계부 거래인지, 자료(위키)에 둘 내용인지, 일정인지 나눈다. 애매하면 새별에게 묻는다
3. 거래는 README '기록 규칙'과 `rules` 표의 키워드 분류를 따른다. id는 `TX-YYYYMMDD-NNN`(그달 건수 다음 번호),
   `source = '받은 메모'`, `created_by`는 메모 쓴 사람. 금액·날짜·봉투가 확실하지 않으면 `needs_review = true`
4. 넣기 전에 정리한 결과를 새별에게 보여 주고, 확인받은 뒤 넣는다
5. 넣은 메모만 `inbox`에서 지운다

## 그만둔 것

- 2026-10-22 '그냥 적기'(AI 자동 정리, OpenCode Go). 직접 입력하는 쪽이 편해서 되돌렸다.
  Supabase의 `ai-assist` 함수와 비밀값 `OPENCODE_API_KEY`는 새별이 대시보드에서 지우기로 했다

## 로컬에서 테스트할 때

- 클라우드 컨테이너는 네트워크가 막혀 있어 Supabase 모듈을 가짜로 바꿔 Playwright로 화면을 찍었다. 로컬에선 그냥 페이지를 열면 된다
- 아이콘을 더 그릴 때: `design/acnh-icons/icons.mjs`에 추가하고
  `npm i playwright && npx playwright install chromium && node design/acnh-icons/render.mjs <png폴더>`로 뽑은 뒤 96px WebP로 줄여 `img/acnh/`에 넣는다.
  `index.html`의 `PIX` 표에 이름을 연결하면 된다
