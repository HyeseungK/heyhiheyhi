# heyhiheyhi

Hyeseung (Helen) Kim의 자기소개 웹사이트입니다. 명함 대신 보여 주는 페이지로, 일(Work)과 창작(Frames · Music)을 함께 아카이빙합니다.

## 구성

| 탭 | 내용 | 인터랙션 |
| --- | --- | --- |
| **Home** | Hyeseung → Helen → Hey Hi → 명함 | Three.js 파티클 글자가 스크롤에 따라 바뀌고 마지막에 명함 테두리로 모입니다. 명함은 눌러서 뒤집고(뒷면에 연락처와 QR), 연락처(.vcf)나 명함 이미지(.png)로 저장할 수 있습니다. 떠다니는 챕터는 끌어서 아무 데나 놓을 수 있고(살짝 던지면 미끄러짐), 놓은 자리 근처에서 다시 떠다닙니다. |
| **Work** | 커리어 패스 + 프로젝트 | CSS 3D 노트북을 열면 프로젝트 목록이 나오고, 프로젝트는 장표(Exec summary → Issue tree → Approach → Impact)로 넘겨 봅니다. 슬라이드 좌우 클릭, 진행 막대, ←→, 스와이프로 이동합니다. |
| **Frames** | 지구본 + 지역별 사진 | 점으로 된 지구본을 끌어서 돌리고 핀(New York, Seoul · Euljiro, Lisbon 등)을 누르면, 지구본이 그 지역으로 돌아간 뒤 사진이 핀에서 쏟아져 나와 사진첩처럼 펼쳐집니다. 닫으면 다시 핀으로 빨려 들어갑니다. 아래에 영상(Moving)과 Inspiration(좋아하는 사진작가·디렉터·뮤비·앨범 콘셉트 무드보드, 카드를 누르면 뒤집혀 이유와 링크가 나옴)가 있습니다. |
| **Music** | 앨범 진열대 + 티켓 북 + 브릭 기타 | 앨범을 누르면 케이스가 열리고 CD가 돕니다(←→로 다음 앨범). 티켓은 절취선을 뜯어 뒷면 메모를 봅니다. 기타를 누르면 코드가 울리고 공연·SoundCloud 서랍이 열립니다. |

포인트 컬러는 Cobalt입니다. `site.accents`에 색을 두 개 이상 넣으면 상단 바에 색 팔레트 버튼이 생깁니다(Red · Ink · Film orange · Pink가 주석으로 준비돼 있음).

## 내용 수정

모든 텍스트와 링크는 **`js/content.js`** 한 파일에 있습니다. `[PLACEHOLDER]` 표시가 있는 곳을 바꾸면 됩니다.

- **레이아웃**: `site.layout`을 `'compact'`(한 줄 소개, 기본값)나 `'wordy'`(큰 제목 + 소개 문단, 예전 버전)로 바꿉니다.
- **포인트 컬러**: `site.accents`. 첫 번째가 기본이고, 두 개 이상이면 방문자가 고를 수 있는 팔레트가 생깁니다.
- **명함**: `profile.card`. 실제 명함 스캔이 있으면 `image: 'assets/card.jpg'`로 넣으면 "Save card"가 그 파일을 내려받습니다.
- **사진**: `assets/photos/new-york/`처럼 지역별 폴더에 넣고 `visual.places[].photos`의 `src`에 경로를 적습니다. 지역을 추가하려면 블록을 복사하고 `lat`, `lon`(위도, 경도)을 바꿉니다. `src`가 비어 있으면 색 플레이스홀더가 보입니다.
- **영상**: `visual.videos`의 `url`에 YouTube나 Vimeo 링크를 넣습니다.
- **앨범 커버**: `assets/albums/`에 넣고 `cover`에 경로를 적습니다. 비어 있으면 제목을 시드로 한 플로우 필드 아트가 그려집니다.
- **Inspiration**: `visual.muses`. 카드 한 장 = 좋아하는 것 하나(사람이든 작품이든). `type`이 필터가 되고(Photographers · Directors · Videos · Other Artwork, 이름과 순서는 `visual.museTypes`), 사람은 `works`에 대표작 이미지 2~3장, 작품은 `image` 한 장을 넣습니다. `instagram`에 아이디를 적으면 카드에 @아이디와 인스타 버튼이 생깁니다(살아 있는 작가만). 다른 작가의 이미지는 출처를 밝히고 `url`에 원본 링크를 넣어 주세요.
- **티켓**: `music.tickets`.
- **전환 효과**: `index.html`의 `data-fx="pixel"` 또는 `data-fx="ripple"`. 전환 화면 문구("Hey Hi, I’m listening" 등)는 `site.greeting`에서 바꿉니다.

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
- 지구본 육지 점: Natural Earth 110m(world-atlas, 퍼블릭 도메인)에서 미리 계산 (`js/globedots.js`)
- GSAP 3.12 + ScrollTrigger (`vendor/`): 스크롤 모핑, 필름 핀/가로 스크롤, 모든 열고 닫기 타임라인
- Canvas 2D: 픽셀/물결 페이지 전환, 시드 기반 플로우 필드 앨범 커버
- 라이브러리는 `vendor/`에 넣어 두어 CDN 없이 동작합니다.

`.claude/skills/`에는 이 작업에 쓴 Claude Code 스킬이 들어 있습니다. threejs-webgl, gsap-scrolltrigger, modern-web-design은 [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)(MIT), p5js는 Lord1Egypt/awesome-skill-forge(MIT), algorithmic-art는 Anthropic 예시 스킬(Apache-2.0)입니다.
