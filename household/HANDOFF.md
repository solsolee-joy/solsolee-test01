# 다음 세션에 이어서 할 일

마지막 클라우드 세션(2026-10-21)에서 넘겨받는 메모. 로컬에서 새 세션을 열면 이 파일부터 읽게 한다.

## 지금 상태

- 화면: `household/index.html` 한 파일. GitHub Pages가 브랜치 `ccr-1624c47a-rm3p6v`에서 배포
  - https://solsolee-joy.github.io/solsolee-test01/household/
- 데이터: Supabase 프로젝트 `twrcgrflwvwljdyhxuwr`. 스키마는 `supabase/migrations/`에 순서대로 있고 전부 적용됨
- 디자인: 크림·월넛·올리브·앰버 팔레트, 온글잎 박다현체 제목, 손그림 테두리, 동숲 아이콘. 자세한 결정은 README 진행 상황

## 확인된 것

- 2026-10-21 로컬 세션: 예전 월세·월급날 일정은 지워져 있다. `events`에 제목이 '월세'·'월급'을 포함하는 행 0건 (전체 8건).
  날짜 열 이름은 `starts_on`이 아니라 `date`다
- 2026-10-21 로컬 세션: 이관용 `import` 스키마와 `http` 확장을 지웠다. 거래 253건 그대로

## 남은 일

- 봉투 배정액 확정 (10월·11월은 초안)
- 남편 계정으로 로그인해서 프로필 주민 고르기, 일정·집안일 같이 써 보기
- Supabase Auth의 Site URL과 Redirect URL이 위 주소로 돼 있는지 확인

## 로컬에서 테스트할 때

- 클라우드 컨테이너는 네트워크가 막혀 있어 Supabase 모듈을 가짜로 바꿔 Playwright로 화면을 찍었다. 로컬에선 그냥 페이지를 열면 된다
- 아이콘을 더 그릴 때: `design/acnh-icons/icons.mjs`에 추가하고
  `npm i playwright && npx playwright install chromium && node design/acnh-icons/render.mjs <png폴더>`로 뽑은 뒤 96px WebP로 줄여 `img/acnh/`에 넣는다.
  `index.html`의 `PIX` 표에 이름을 연결하면 된다
