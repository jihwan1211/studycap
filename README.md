# STUDYCAP · Next.js

Next.js App Router + React + TypeScript 기반의 캡슐 체험 프로토타입입니다.

## 실행

Node.js 20.9 이상에서 프로젝트 폴더를 열고 실행합니다.

```powershell
npm install
npm run dev
```

http://localhost:3000 에 접속하세요. HTML 파일을 더블클릭하는 방식은 더 이상 사용하지 않습니다.

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
- src/components/capsule-room.tsx: 캡슐 SVG 장면. 실제 3D로 교체할 때 이 컴포넌트를 변경합니다.
- src/components/use-capsule-scroll.ts: 스크롤 진행률과 모바일·동작 줄이기 설정. 이벤트와 프레임은 언마운트 시 정리됩니다.

조명·서랍은 브라우저 내 상태이며 예약, 결제, 데이터베이스는 아직 연결하지 않았습니다. 실제 시설과 다른 예시 공간을 사용하는 2.5D 시안입니다.
`index.html`, `style.css`, `app.js`, `server.cjs`는 비교용 원본으로 보존되어 있으며 Next.js 실행에는 사용하지 않습니다.
