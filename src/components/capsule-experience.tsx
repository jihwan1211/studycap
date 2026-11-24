"use client";
import {useReducer, useRef, type CSSProperties} from "react";
import dynamic from "next/dynamic";
import {COLOR_NAMES, initialPanel, panelReducer, STAND_COLORS, standIntensity, useWhiteNoise, NOISE_STEPS, type PanelAction} from "./capsule-panel";
import {useCapsuleScroll} from "./use-capsule-scroll";

const CapsuleRoom = dynamic(() => import("./capsule-room"), {ssr: false});
const stories = [
 {heading: ["세상은 잠시 밖에.", "여기는, 오직 나."], description: ["나만의 리듬으로 공부하는 1인 캡슐.", "스크롤하며 당신의 공간으로 들어가 보세요."], label: "나만의 공간을 만나다"},
 {heading: ["문을 열면,", "집중이 시작되는 곳."], description: ["책상부터 작은 수납까지.", "한 사람의 시간을 위해 채운 공간을 만나보세요."], label: "몰입의 안쪽으로"},
 {heading: ["이제, 나에게 맞는", "공간으로."], description: ["조명의 밝기와 색을 바꿔보세요.", "화면 아래 버튼이나 스탠드 패널을 눌러 보세요."], label: "내 취향으로 완성하다"},
];
type CapsuleStyle = CSSProperties & {"--light-color": string};
export default function CapsuleExperience() {
 const journeyRef = useRef<HTMLElement>(null);
 const {progress, reducedMotion} = useCapsuleScroll(journeyRef);
 const [panel, dispatch] = useReducer(panelReducer, initialPanel);
 useWhiteNoise(panel.noise);
 const chapter = progress < .2 ? 0 : progress < .6 ? 1 : 2;
 const story = stories[chapter];
 const opening = Math.max(0, Math.min(1, (progress - .12) / .38));
 const style: CapsuleStyle = {"--light-color": STAND_COLORS[panel.color]};
 function scrollToProgress(target: number) {
   const journey = journeyRef.current;
   if (!journey) return;
   window.scrollTo({top: window.scrollY + journey.getBoundingClientRect().top + (journey.offsetHeight - window.innerHeight) * target, behavior: reducedMotion ? "instant" : "smooth"});
 }
 const stepText = `${panel.level}/4`;
 const panelButtons: {action: PanelAction; label: string; value: string; pressed: boolean; disabled?: boolean}[] = [
  {action: "power", label: "전원", value: panel.standOn ? "켜짐" : "꺼짐", pressed: panel.standOn},
  {action: "brightness", label: "밝기", value: panel.standOn ? stepText : "-", pressed: standIntensity(panel) > 0, disabled: !panel.standOn},
  {action: "color", label: "색", value: COLOR_NAMES[panel.color], pressed: panel.color !== "warm", disabled: !panel.standOn},
  {action: "ceiling", label: "천장등", value: panel.ceilingOn ? "켜짐" : "꺼짐", pressed: panel.ceilingOn},
  {action: "supply", label: "급기", value: panel.supplyOn ? "켜짐" : "꺼짐", pressed: panel.supplyOn},
  {action: "exhaust", label: "배기", value: panel.exhaustOn ? "켜짐" : "꺼짐", pressed: panel.exhaustOn},
  {action: "noise", label: "백색소음", value: panel.noise === 0 ? "꺼짐" : `${panel.noise}/${NOISE_STEPS}`, pressed: panel.noise > 0},
 ];
 return <div style={style}>
<header><a className="brand" href="#">studycap<span>●</span></a><span className="header-note">한 사람을 위한, 온전한 공간</span><button className="small-button" id="enter" onClick={() => scrollToProgress(.74)}>공간 체험하기</button></header>
<main>
<section className="journey" id="journey" ref={journeyRef} aria-label="스크롤로 캡슐 공간 둘러보기">
<div className={chapter === 2 ? "stage inside" : "stage"}>
<div className="ambient"></div>
<div className="story"><div className="eyebrow">YOUR OWN LITTLE WORLD</div><h1 id="headline">{story.heading[0]} <br />{story.heading[1]}</h1><p id="description">{story.description[0]} <br />{story.description[1]}</p><div className="chapter"><span id="chapter">0{chapter + 1}</span><span className="line"></span><span id="chapter-name">{story.label}</span></div></div>
<div className="room-wrap" id="room-wrap">
<span className="room-loading">공간을 불러오는 중…</span>
<CapsuleRoom progress={progress} opening={opening} panel={panel} onAction={dispatch} />
<div className={chapter === 2 ? "panel-bar visible" : "panel-bar"} id="controls" inert={chapter !== 2}>
<div className="panel-chips" role="group" aria-label="스탠드 패널">{panelButtons.map(item => <button key={item.action} aria-pressed={item.pressed} disabled={item.disabled} onClick={() => dispatch(item.action)}><span>{item.label}</span><span>{item.value}</span></button>)}</div>
<button id="reset" className="text-button" onClick={() => dispatch("reset")}>초기화</button>
</div>
<span className="room-caption">CAPSULE 01 <span>·</span> INTERACTIVE CONCEPT</span>
</div>
<div className="scroll-hint" id="scroll-hint" style={{opacity: chapter === 2 ? 0 : 1}}><span className="mouse"></span>스크롤해서 들어가기</div><div className="progress"><div id="progress" style={{width: `${progress * 100}%`}}></div></div>
</div></section>
<section className="closing"><div className="eyebrow">MAKE ROOM FOR YOURSELF</div><h2>집중의 시작은,<br />나만의 공간에서.</h2><p>작은 공간 안에 담긴 가능성.<br />실제 공간과 비교하며 나에게 맞는 자리를 찾아보세요.</p><div className="closing-actions"><button id="replay" onClick={() => scrollToProgress(0)}>다시 체험하기</button><a href="https://naver.me/xeAf3z7Q" target="_blank" rel="noopener noreferrer">네이버에서 실제 공간 보기</a></div><footer><span className="brand">studycap<span>●</span></span><span>공간 체험 프로토타입 · 실제 시설 및 사양과 다를 수 있습니다.</span></footer></section>
</main></div>;
}
