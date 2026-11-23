"use client";
import {useRef, useState, type CSSProperties} from "react";
import CapsuleRoom from "./capsule-room";
import {useCapsuleScroll} from "./use-capsule-scroll";

const stories = [
 {heading: ["세상은 잠시 밖에.", "여기는, 오직 나."], description: ["나만의 리듬으로 공부하는 1인 캡슐.", "스크롤하며 당신의 공간으로 들어가 보세요."], label: "나만의 공간을 만나다"},
 {heading: ["문을 열면,", "집중이 시작되는 곳."], description: ["책상부터 작은 수납까지.", "한 사람의 시간을 위해 채운 공간을 만나보세요."], label: "몰입의 안쪽으로"},
 {heading: ["이제, 나에게 맞는", "공간으로."], description: ["빛을 바꾸고, 서랍을 열어보세요.", "아래 컨트롤로 직접 체험할 수 있어요."], label: "내 취향으로 완성하다"},
];
const lightColors = {warm: "#ffe7ab", neutral: "#f7f6df", cool: "#c5e5ff"};
type CapsuleStyle = CSSProperties & {"--light-color": string};
export default function CapsuleExperience() {
 const journeyRef = useRef<HTMLElement>(null);
 const {progress, mobile, reducedMotion} = useCapsuleScroll(journeyRef);
 const [brightness, setBrightness] = useState(75);
 const [lightColor, setLightColor] = useState<keyof typeof lightColors>("warm");
 const [drawerOpen, setDrawerOpen] = useState(false);
 const chapter = progress < .2 ? 0 : progress < .6 ? 1 : 2;
 const story = stories[chapter];
 const opening = Math.max(0, Math.min(1, (progress - .12) / .38));
 const style: CapsuleStyle = {"--light-color": lightColors[lightColor]};
 function reset() { setBrightness(75); setLightColor("warm"); setDrawerOpen(false); }
 function scrollToProgress(target: number) {
   const journey = journeyRef.current;
   if (!journey) return;
   window.scrollTo({top: window.scrollY + journey.getBoundingClientRect().top + (journey.offsetHeight - window.innerHeight) * target, behavior: reducedMotion ? "instant" : "smooth"});
 }
 return <div style={style}>
<header><a className="brand" href="#">studycap<span>●</span></a><span className="header-note">한 사람을 위한, 온전한 공간</span><button className="small-button" id="enter" onClick={() => scrollToProgress(.74)}>공간 체험하기</button></header>
<main>
<section className="journey" id="journey" ref={journeyRef} aria-label="스크롤로 캡슐 공간 둘러보기">
<div className={chapter === 2 ? "stage inside" : "stage"}>
<div className="ambient"></div>
<div className="story"><div className="eyebrow">YOUR OWN LITTLE WORLD</div><h1 id="headline">{story.heading[0]}<br />{story.heading[1]}</h1><p id="description">{story.description[0]}<br />{story.description[1]}</p><div className="chapter"><span id="chapter">0{chapter + 1}</span><span className="line"></span><span id="chapter-name">{story.label}</span></div></div>
<div className="room-wrap" id="room-wrap" style={{transform: `translateY(-48%) scale(${reducedMotion ? 1 : 1 + opening * (mobile ? .02 : .09)})`}}>
<CapsuleRoom opening={opening} brightness={brightness} drawerOpen={drawerOpen} />
<span className="room-caption">CAPSULE 01 <span>·</span> INTERACTIVE CONCEPT</span>
</div>
<div className={chapter === 2 ? "controls visible" : "controls"} id="controls" inert={chapter !== 2}>
<div className="control-heading"><span>나에게 맞춰보세요</span><button id="reset" onClick={reset} className="text-button">초기화</button></div>
<div className="control-row"><label htmlFor="brightness">조명 밝기 <output id="brightness-value">{brightness}%</output></label><input id="brightness" type="range" min="0" max="100" value={brightness} onChange={event => setBrightness(Number(event.target.value))} /></div>
<div className="colors" aria-label="조명 색상"><button data-color="warm" aria-pressed={lightColor === "warm"} onClick={() => setLightColor("warm")}><i className="warm"></i>따뜻하게</button><button data-color="neutral" aria-pressed={lightColor === "neutral"} onClick={() => setLightColor("neutral")}><i className="neutral"></i>자연스럽게</button><button data-color="cool" aria-pressed={lightColor === "cool"} onClick={() => setLightColor("cool")}><i className="cool"></i>선명하게</button></div>
<button className="drawer-button" id="drawer-toggle" aria-pressed={drawerOpen} onClick={() => setDrawerOpen(open => !open)}><span>개인 수납 서랍</span><span id="drawer-label">{drawerOpen ? "닫기 −" : "열어보기 ＋"}</span></button>
<p className="demo-note">공간과 기능은 체험을 위한 예시입니다.</p>
</div>
<div className="scroll-hint" id="scroll-hint" style={{opacity: chapter === 2 ? 0 : 1}}><span className="mouse"></span>스크롤해서 들어가기</div><div className="progress"><div id="progress" style={{width: `${progress * 100}%`}}></div></div>
</div></section>
<section className="closing"><div className="eyebrow">MAKE ROOM FOR YOURSELF</div><h2>집중의 시작은,<br />나만의 공간에서.</h2><p>작은 공간 안에 담긴 가능성.<br />실제 공간과 비교하며 나에게 맞는 자리를 찾아보세요.</p><div className="closing-actions"><button id="replay" onClick={() => scrollToProgress(0)}>다시 체험하기</button><a href="https://naver.me/xeAf3z7Q" target="_blank" rel="noopener noreferrer">네이버에서 실제 공간 보기</a></div><footer><span className="brand">studycap<span>●</span></span><span>공간 체험 프로토타입 · 실제 시설 및 사양과 다를 수 있습니다.</span></footer></section>
</main></div>;
}
