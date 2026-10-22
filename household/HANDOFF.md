# 다음 세션에 이어서 할 일

새 세션을 열면 이 파일과 README부터 읽는다. 마지막 갱신 2026-10-22 (로컬 세션).

## 지금 상태

- 화면: `household/index.html` 한 파일. GitHub Pages가 브랜치 `ccr-1624c47a-rm3p6v`에서 배포
  - https://solsolee-joy.github.io/solsolee-test01/household/
- 데이터: Supabase 프로젝트 `twrcgrflwvwljdyhxuwr`. 스키마는 `supabase/migrations/`에 순서대로 있고 전부 적용됨
- 디자인: 크림·월넛·올리브·앰버 팔레트, 온글잎 박다현체 제목, 이서윤체 본문·숫자, 손그림 테두리, 동숲 아이콘. 자세한 결정은 README 진행 상황

## 확인된 것

- 2026-10-21 로컬 세션: 예전 월세·월급날 일정은 지워져 있다. `events`에 제목이 '월세'·'월급'을 포함하는 행 0건 (전체 8건).
  날짜 열 이름은 `starts_on`이 아니라 `date`다
- 2026-10-21 로컬 세션: 이관용 `import` 스키마와 `http` 확장을 지웠다. 거래 253건 그대로

## 1월 공개 전 할 일

목표: 2027년 1월에 연표(남편)에게 보여 주고 같이 쓰기 시작한다. 하나씩 끝나면 [x]로 바꾸고 날짜를 적는다.

꼭 할 것 (주소·서버는 이 순서로. 로그인 설정을 새 프로젝트에 한 번만 하려고)
- [ ] 1. Cloudflare Pages 연결 (새별, 브라우저): 저장소 solsolee-joy/solsolee-test01, 프로덕션 브랜치 `ccr-1624c47a-rm3p6v`,
  빌드 명령 없음, 빌드 출력 디렉터리 `household` (저장소 맨 위 index.html은 다른 페이지라서). 나온 `이름.pages.dev`를 받는다
- [ ] 2. Supabase를 시드니(ap-southeast-2)에서 서울(ap-northeast-2)로 옮기기
  - 새별이 서울 지역 새 프로젝트를 만든다. 무료 프로젝트 수 제한에 걸리면 옮긴 뒤 시드니 프로젝트를 지우거나 멈춘다
  - Claude: `supabase/migrations/` 순서대로 적용 → public 표 데이터 복사 → Storage `docs` 버킷 파일 복사 →
    index.html의 SUPABASE_URL·키, scripts/upload-doc-file.mjs의 REF, 문서의 프로젝트 id를 바꾼다
  - 옮기는 동안은 사이트에 입력하지 않는다. 새별은 메일 링크로 다시 들어와 비밀번호를 다시 정한다 (Auth 사용자는 옮기지 않는다)
- [ ] 3. 새 프로젝트 Authentication → URL Configuration에 새 주소(Site URL, Redirect URLs). 문서·manifest의 주소도 바꾼다.
  연표가 홈 화면 아이콘을 추가하기 전에 끝낸다
- [ ] 아직 실제로 못 써 본 기능을 새별 휴대폰으로 확인
  - [ ] 비밀번호 로그인: 메일 링크로 들어와 비밀번호 정하기 → 로그아웃 → 비밀번호로 다시 들어오기
  - [ ] 메모 남기기: 남기기, 숫자 표시, 지우기
  - [ ] 자료 사진 크게 보기: 손가락으로 넘기기, 어두운 곳 눌러 닫기
  - [ ] 홈 화면 '우리집' 아이콘: 추가하면 바로 메모 창이 뜨는지
  - [ ] 새 메뉴 묶음(2026-10-22): 아래 탭 4개, 묶음 안 작은 탭, 이름 칩 → 내 계정
- [ ] 연표 첫 로그인 흐름 점검: 메일 링크 → 비밀번호 정하기 → 프로필 주민 고르기 (연표는 아직 Auth 계정이 없다)

해 두면 좋은 것
- [ ] 로딩 속도: Supabase가 시드니(ap-southeast-2)에 있다. 서울로 옮기거나, 첫 화면 데이터를 먼저 불러오게 바꾸기.
  로그인 직후 is_member → members → loadStatic → loadPrivate가 차례로 기다리는 것도 동시에 보내기
- [ ] 탭마다 같이 둘러보며 어색한 문구·헷갈리는 곳 목록 만들어 고치기
- [ ] 연표용 짧은 안내 공지 ("메모 남기기만 쓰면 돼")

하고 싶은 것 (아직 정하는 중)
- [ ] 새별 개인 할 일·루틴 (2026-10-22 아이디어). 나만 보기 표 하나(private_notes처럼 owner RLS),
  일정 묶음에 '내 할 일' 작은 탭, 홈 '오늘' 카드에 오늘 루틴 체크. 반복·완료 기록은 chores를 본뜬다.
  넣을 것: 한 번 하는 할 일, 매일·매주 반복 루틴, 연속 기록 셋 다 (2026-10-22 새별). 서버를 서울로 옮긴 다음에 만든다
- [ ] 개인 일정 (같이 만든다). 지금 `events.owner`는 표시일 뿐 둘 다 본다. `events`에 나만 보기(예: `private boolean`)를 두고
  RLS로 private이면 작성자만 읽게 한다. 달력에 자물쇠·다른 색으로 구분, 위에 전체/함께/나만 거르기.
  기존 일정 8건은 함께 보기 그대로. 홈 '오늘' 카드에 함께 일정·내 일정·오늘 루틴을 같이

계속 쌓을 것
- 10월부터 가계부 기록, 자료(레시피·살림팁) 채우기
- 예산 배정액은 2027년까지 확정하지 않고 지출 추이를 본다. 10월·11월 초안을 두고, 새 달은 '지난달 값 복사'로 채운다

## 배포 안 된 변경

- 없음 (2026-10-22 6ae63e6까지 배포). 새로 생기면 여기 적는다

Supabase Auth의 Site URL과 Redirect URL은 배포 주소로 돼 있는 것 확인함 (2026-10-21)

## 받은 메모 정리하는 법

새별이 "받은 메모 정리해 줘"라고 하면:

1. `select * from public.inbox order by created_at`로 메모를 읽는다
2. 메모마다 가계부 거래인지, 자료(위키)에 둘 내용인지, 일정인지 나눈다. 애매하면 새별에게 묻는다
3. 거래는 README '기록 규칙'과 `rules` 표의 키워드 분류를 따른다. id는 `TX-YYYYMMDD-NNN`(그달 건수 다음 번호),
   `source = '받은 메모'`, `created_by`는 메모 쓴 사람. 금액·날짜·봉투가 확실하지 않으면 `needs_review = true`
4. 넣기 전에 정리한 결과를 새별에게 보여 주고, 확인받은 뒤 넣는다
5. 넣은 메모만 `inbox`에서 지운다

## 자료에 이미지·파일 붙이는 법 (Claude가 대신)

이 PC는 Supabase CLI에 로그인돼 있다(`npx supabase login`, 2026-10-22). 로그인이 풀렸으면 새별에게 다시 해 달라고 한다.

1. 자료 페이지가 없으면 SQL로 만든다: `insert into public.docs (title, category, body, shared, owner) values (..., 'birdsol1122@gmail.com') returning id`
   분류는 집·이사, 금융, 보험, 가전·보증서, 건강, 레시피, 살림팁, 기타
2. `node household/scripts/upload-doc-file.mjs <doc_id> <파일> [보일 이름] [올린 사람 이메일]`
   Storage `docs/{doc_id}/{uuid}.{ext}`에 올리고 `doc_files`에 기록한다. 키는 실행할 때마다 CLI로 받고 저장하지 않는다
3. 인터넷 레시피는 글을 통째로 옮기지 않고 재료·순서를 짧게 정리하고 원래 링크를 단다. 남의 사진은 올리지 않고 링크만 둔다
4. 개인 자료(계약서 등)는 저장소에 넣지 않는다. 저장소는 공개다

## 그만둔 것

- 2026-10-22 '그냥 적기'(AI 자동 정리, OpenCode Go). 직접 입력하는 쪽이 편해서 되돌렸다.
  Supabase의 `ai-assist` 함수와 비밀값 `OPENCODE_API_KEY`는 새별이 대시보드에서 지우기로 했다

## 로컬에서 테스트할 때

- 클라우드 컨테이너는 네트워크가 막혀 있어 Supabase 모듈을 가짜로 바꿔 Playwright로 화면을 찍었다. 로컬에선 그냥 페이지를 열면 된다
- 아이콘을 더 그릴 때: `design/acnh-icons/icons.mjs`에 추가하고
  `npm i playwright && npx playwright install chromium && node design/acnh-icons/render.mjs <png폴더>`로 뽑은 뒤 96px WebP로 줄여 `img/acnh/`에 넣는다.
  `index.html`의 `PIX` 표에 이름을 연결하면 된다
