# heyhiheyhi

Hyeseung (Helen) Kim의 자기소개 웹사이트입니다. 명함 대신 보여 주는 페이지로, 일(Work)과 창작(Frames · Music)을 함께 아카이빙합니다.

## 구성

| 탭 | 내용 | 인터랙션 |
| --- | --- | --- |
| **Home** | Hyeseung → Helen → Hey Hi → 명함 | Three.js 파티클 글자가 스크롤에 따라 바뀌고 마지막에 명함 테두리로 모입니다. 글자를 클릭하면 반짝이며 흩어졌다가 다시 모입니다. 명함은 눌러서 뒤집고(뒷면에 연락처와 QR), 연락처(.vcf)나 명함 이미지(.png)로 저장할 수 있습니다. 떠다니는 챕터는 끌어서 아무 데나 놓을 수 있고(살짝 던지면 미끄러짐), 놓은 자리 근처에서 다시 떠다닙니다. |
| **Work** | 커리어 패스 + 프로젝트 | CSS 3D 노트북을 열면 프로젝트 5개가 브릭 오브젝트(변압기, 스킨케어, 프로브카드, 드론, 자동차 HUD)와 짧은 라벨로 나옵니다. 누르면 노트북 화면에 오브젝트, 기간, 짧은 설명이 열리고 ‹ › 로 다음 프로젝트로 넘어갑니다(모바일은 전체 화면). 오브젝트 모양은 `js/bricks.js`, 라벨·기간·설명은 `work.projects`에서 바꿉니다. |
| **Frames** | 사진 테이블 | 흰 테이블 위에 시리즈마다 사진 더미가 놓여 있고 맨 위에 표지 사진이 보입니다. 마우스를 올리면 부채처럼 펼쳐지고, 누르면 사진이 쏟아지듯 펼쳐집니다. 서울처럼 한 지역에 프로젝트가 여럿이면 프로젝트마다 더미가 하나씩 생깁니다. 아래에 Inspiration 무드보드가 있습니다. |
| **Music** | 앨범 랙 → 좋아하는 노래(브릭 턴테이블) → 공연(기타) → 티켓 북 | 앨범 10장이 5장씩 두 줄로 놓이고(공식 커버는 저장해 둔 것 → iTunes → Deezer 순), Shuffle Rack으로 섞고, 누르면 케이스가 열리고 CD가 돕니다(←→로 다음 앨범). 좋아하는 노래는 브릭 턴테이블 한 장의 양면입니다: Side A를 고르면 바늘이 내려가고 판이 돌고, Side B를 고르면 바늘이 올라가고 판이 뒤집힌 뒤 다시 내려갑니다(`js/turntable.js`). 곡을 누르면 30초 미리듣기, 턴테이블을 누르면 멈춤/재생. 공연 섹션은 브릭 기타·앰프 옆에 밴드 목록(`music.stage`)이 놓이고, 기타는 치거나 던질 수 있습니다. 티켓은 절취선을 뜯어 뒷면 메모를 봅니다. |

포인트 컬러는 Cobalt 하나입니다. `site.accents`에 색을 두 개 이상 넣으면 상단 바에 색 팔레트 버튼이 생깁니다(Red · Ink · Film orange · Pink가 주석으로 준비돼 있음).

## 내용 수정

모든 텍스트와 링크는 **`js/content.js`** 한 파일에 있습니다. `[PLACEHOLDER]` 표시가 있는 곳을 바꾸면 됩니다.

- **레이아웃**: `site.layout`을 `'compact'`(한 줄 소개, 기본값)나 `'wordy'`(큰 제목 + 소개 문단, 예전 버전)로 바꿉니다.
- **포인트 컬러**: `site.accents`. 첫 번째가 기본이고, 두 개 이상이면 방문자가 고를 수 있는 팔레트가 생깁니다.
- **명함**: `profile.card`. 실제 명함 스캔이 있으면 `image: 'assets/card.jpg'`로 넣으면 "Save card"가 그 파일을 내려받습니다.
- **사진**: `assets/photos/new-york/`처럼 지역별 폴더에 넣고 (서울처럼 `projects`로 프로젝트별 묶음도 가능) `visual.places[].photos`의 `src`에 경로를 적습니다. 지역을 추가하려면 블록을 복사하고 `lat`, `lon`(위도, 경도)을 바꿉니다. `src`가 비어 있으면 색 플레이스홀더가 보입니다.
- **영상**: 지역의 `videos`에 YouTube나 Vimeo 링크를 넣습니다(예: Suncheon).
- **앨범**: `music.albums`. 공식 커버는 `itunes`의 검색 힌트(다른 표기 `artists`/`titles`, 나라 `country`)로 자동으로 찾습니다. 틀린 커버가 나오면 힌트를 고치거나 `cover: 'assets/albums/…'`로 직접 지정합니다. 커버를 못 찾으면 플로우 필드 아트가 그려집니다.
- **CD**: `music.mixtape`. 곡마다 `side`로 A면/B면을 나눕니다.
- **Inspiration**: `visual.muses`. 카드 한 장 = 좋아하는 것 하나(사람이든 작품이든). `type`이 필터가 되고(Photographers · Directors · Videos · Other Artwork, 이름과 순서는 `visual.museTypes`), 사람은 `works`에 대표작 이미지 2~3장, 작품은 `image` 한 장을 넣습니다. `instagram`에 아이디를 적으면 카드에 @아이디와 인스타 버튼이 생깁니다(살아 있는 작가만). 다른 작가의 이미지는 출처를 밝히고 `url`에 원본 링크를 넣어 주세요.
- **티켓**: `music.tickets`.
- **전환 효과**: `index.html`의 `data-fx="pixel"` 또는 `data-fx="ripple"`. 전환 화면 문구("Hey Hi, I’m playing" 등)는 `site.greeting`에서 바꿉니다.

## 앨범 커버 자동 저장

`js/content.js`의 음악 목록이 바뀌면 GitHub Action(`.github/workflows/covers.yml`)이 `scripts/fetch-covers.mjs`를 실행해, 공식 커버(iTunes → Deezer)와 미리듣기 주소를 찾아 `assets/albums/`, `assets/songs/`, `assets/albums/covers.json`에 저장하고 커밋합니다. 사이트는 저장된 파일을 먼저 쓰고, 없을 때만 브라우저에서 직접 찾습니다. Actions 탭에서 "Fetch album covers"를 직접 실행할 수도 있습니다. 잘못 찾은 커버는 해당 jpg를 지우고 `itunes` 힌트를 고친 뒤 다시 실행하면 됩니다.

## 파일 수정 후 (캐시)

브라우저와 GitHub Pages가 JS/CSS를 저장해 두기 때문에, 파일을 고친 뒤에는 커밋 전에 아래를 실행해 주세요. `index.html`의 파일 주소에 내용 기반 버전(`?v=…`)이 붙어서 방문자가 바로 새 파일을 받습니다.

```bash
python3 scripts/version.py
```

## 로컬 실행

ES 모듈을 쓰기 때문에 파일을 더블클릭하지 말고 서버로 엽니다.

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 배포 (GitHub Pages)

Settings → Pages → Branch에서 이 브랜치와 `/ (root)`를 선택하면 됩니다. 빌드 과정은 없습니다.

## 기술

- Three.js r160 (`vendor/`): 히어로 파티클(커스텀 셰이더), 브릭 기타·아이콘(InstancedMesh)
- qrcode-generator (`vendor/qrcode.js`, MIT): 명함 QR
- GSAP 3.12 + ScrollTrigger (`vendor/`): 스크롤 모핑, 필름 핀/가로 스크롤, 모든 열고 닫기 타임라인
- Canvas 2D: 픽셀/물결 페이지 전환, 시드 기반 플로우 필드 앨범 커버
- 라이브러리는 `vendor/`에 넣어 두어 CDN 없이 동작합니다.

`.claude/skills/`에는 이 작업에 쓴 Claude Code 스킬이 들어 있습니다. threejs-webgl, gsap-scrolltrigger, modern-web-design은 [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)(MIT), p5js는 Lord1Egypt/awesome-skill-forge(MIT), algorithmic-art는 Anthropic 예시 스킬(Apache-2.0)입니다.
