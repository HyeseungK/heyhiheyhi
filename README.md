# heyhiheyhi

Hyeseung (Helen) Kim의 자기소개 웹사이트입니다. 명함 대신 보여 주는 페이지로, 일(Work)과 창작(Visual Work · Music)을 함께 아카이빙합니다.

## 구성

| 탭 | 내용 | 인터랙션 |
| --- | --- | --- |
| **Home** | 김혜승 → Hyeseung → Helen → Hey Hi | Three.js 파티클 글자가 스크롤에 따라 모핑되고, 커서를 피해 흩어집니다. 떠다니는 챕터 단어를 클릭하면 그 지점에서 물결(ripple)이나 픽셀(pixel) 전환이 일어납니다. |
| **Work** | 커리어 패스(줄글) + 프로젝트 | CSS 3D 노트북을 클릭해 열면 화면 안에서 프로젝트 목록을 스크롤할 수 있고, 프로젝트를 클릭하면 상세가 열립니다. |
| **Visual Work** | 영상 / 필름 / 디지털 | 영상은 모니터 카드(YouTube·Vimeo 임베드), 필름은 스크롤하면 가로로 감기는 35mm 스트립, 디지털은 사진 벽입니다. 사진은 라이트박스로 엽니다(키보드 ←→, 모바일 스와이프). |
| **Music** | 앨범 책장 + 기타 | 앨범을 꺼내면 케이스가 열리고 CD가 돌면서 트랙별 코멘트가 나옵니다. 브릭 3D 기타를 클릭하면 코드가 울리고 공연·SoundCloud 서랍이 열립니다. |

## 내용 수정

모든 텍스트와 링크는 **`js/content.js`** 한 파일에 있습니다. `[PLACEHOLDER]` 표시가 있는 곳을 바꾸면 됩니다.

- **사진**: `assets/photos/film/`, `assets/photos/digital/`에 파일을 넣고 `src: 'assets/photos/film/01.jpg'`처럼 적습니다. `src`가 비어 있으면 색 플레이스홀더가 보입니다.
- **앨범 커버**: `assets/albums/`에 넣고 `cover: 'assets/albums/heyhi.jpg'`로 적습니다. 커버가 없으면 앨범 제목을 시드로 한 플로우 필드 아트가 자동으로 그려집니다.
- **영상**: `url`에 YouTube나 Vimeo 링크를 넣습니다. 비워 두면 "Coming soon"으로 표시됩니다.
- **전환 효과**: `index.html`의 `data-fx="pixel"` 또는 `data-fx="ripple"`로 탭마다 고를 수 있습니다.

## 로컬 실행

ES 모듈을 쓰기 때문에 파일을 더블클릭하지 말고 서버로 엽니다.

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 배포 (GitHub Pages)

Settings → Pages → Branch에서 이 브랜치와 `/ (root)`를 선택하면 됩니다. 빌드 과정은 없습니다.

## 기술

- Three.js r160 (`vendor/`): 히어로 파티클(커스텀 셰이더), 브릭 기타(InstancedMesh)
- GSAP 3.12 + ScrollTrigger (`vendor/`): 스크롤 모핑, 필름 핀/가로 스크롤, 모든 열고 닫기 타임라인
- Canvas 2D: 픽셀/물결 페이지 전환, 시드 기반 플로우 필드 앨범 커버
- 라이브러리는 `vendor/`에 넣어 두어 CDN 없이 동작합니다.

`.claude/skills/`에는 이 작업에 쓴 Claude Code 스킬이 들어 있습니다. threejs-webgl, gsap-scrolltrigger, modern-web-design은 [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills)(MIT), p5js는 Lord1Egypt/awesome-skill-forge(MIT), algorithmic-art는 Anthropic 예시 스킬(Apache-2.0)입니다.
