# STUDYCAP · Next.js

Next.js App Router + React + TypeScript 기반의 캡슐 체험 프로토타입입니다.

## 실행

Node.js 20.9 이상에서 프로젝트 폴더를 열고 실행합니다.

```powershell
npm install
npm run dev
```

http://localhost:3000 에 접속하세요. 

## 확인 및 배포 빌드

```powershell
npm run typecheck
npm run build
npm start
```

## 구조

- src/app/page.tsx: 메인 페이지. 새 페이지는 src/app/예약경로/page.tsx 형태로 추가합니다.
- src/app/layout.tsx: 공통 레이아웃과 검색 메타데이터.
- src/app/globals.css: 기존 디자인과 반응형 스타일.
- src/components/capsule-experience.tsx: 체험 UI와 React 상태 관리.
- src/components/capsule-room.tsx: three.js(react-three-fiber) 캔버스와 카메라 연출. 스크롤 진행률로 카메라가 복도에서 캡슐 안으로 들어갑니다.
- src/components/capsule-scene.tsx: 캡슐 3D 모델(벽, 문, 책상, 개방형 선반, LED 바, 의자)과 조명.
- src/components/capsule-panel.ts: 스탠드 패널 상태(전원, 밝기 4단계, 색 순환, 천장등, 급기, 배기, 백색 소음)와 리듀서, 백색 소음 오디오.
- src/components/capsule-stand-panel.tsx: 3D 스탠드 패널. 버튼을 클릭해 같은 상태를 조작합니다. CALL 버튼은 동작하지 않습니다.
- src/components/capsule-model.ts: 폭 1000/1100/1200mm 치수와 카메라 타임라인. 깊이와 높이는 실측 전 추정값입니다.
- src/components/use-capsule-scroll.ts: 스크롤 진행률과 모바일·동작 줄이기 설정. 이벤트와 프레임은 언마운트 시 정리됩니다.

조명·서랍은 브라우저 내 상태이며 예약, 결제, 데이터베이스는 아직 연결하지 않았습니다. 실제 시설과 다른 예시 공간을 사용하는 3D 시안입니다.
