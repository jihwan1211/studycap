const journey = document.querySelector('#journey');
const stage = document.querySelector('.stage');
const room = document.querySelector('#room-wrap');
const door = document.querySelector('#door');
const controls = document.querySelector('#controls');
const headline = document.querySelector('#headline');
const description = document.querySelector('#description');
const brightness = document.querySelector('#brightness');
const drawer = document.querySelector('#drawer');
const drawerButton = document.querySelector('#drawer-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');
const clamp = value => Math.max(0, Math.min(1, value));
let previousChapter = -1;
let scheduled = false;
function render() {
  scheduled = false;
  const progress = clamp(-journey.getBoundingClientRect().top / (journey.offsetHeight - window.innerHeight));
  const opening = clamp((progress - .12) / .38);
  const chapter = progress < .2 ? 0 : progress < .6 ? 1 : 2;
  door.style.transform = `skewY(${-opening * 12}deg) scaleX(${1 - opening * .98})`;
  door.style.opacity = 1 - opening * .6;
  room.style.transform = reduced.matches ? 'translateY(-48%)' : `translateY(-48%) scale(${1 + opening * (mobile.matches ? .02 : .09)})`;
  document.querySelector('#progress').style.width = `${progress * 100}%`;
  if (chapter !== previousChapter) {
    previousChapter = chapter;
    stage.classList.toggle('inside', chapter === 2);
    controls.classList.toggle('visible', chapter === 2);
    controls.inert = chapter !== 2;
    document.querySelector('#scroll-hint').style.opacity = chapter === 2 ? 0 : 1;
    const headings = ['세상은 잠시 밖에.<br>여기는, 오직 나.', '문을 열면,<br>집중이 시작되는 곳.', '이제, 나에게 맞는<br>공간으로.'];
    const descriptions = ['나만의 리듬으로 공부하는 1인 캡슐.<br>스크롤하며 당신의 공간으로 들어가 보세요.', '책상부터 작은 수납까지.<br>한 사람의 시간을 위해 채운 공간을 만나보세요.', '빛을 바꾸고, 서랍을 열어보세요.<br>아래 컨트롤로 직접 체험할 수 있어요.'];
    headline.innerHTML = headings[chapter]; description.innerHTML = descriptions[chapter];
    document.querySelector('#chapter').textContent = `0${chapter + 1}`;
    document.querySelector('#chapter-name').textContent = ['나만의 공간을 만나다', '몰입의 안쪽으로', '내 취향으로 완성하다'][chapter];
  }
}
function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } }
addEventListener('scroll', schedule, {passive:true}); addEventListener('resize', schedule);
function scrollToProgress(progress) { window.scrollTo({top:journey.offsetTop + (journey.offsetHeight-window.innerHeight)*progress, behavior:reduced.matches?'instant':'smooth'}); }
document.querySelector('#enter').addEventListener('click', () => scrollToProgress(.74));
document.querySelector('#replay').addEventListener('click', () => scrollToProgress(0));
function setBrightness() { document.querySelector('#light-wash').style.opacity = brightness.value / 100; document.querySelector('#brightness-value').textContent = `${brightness.value}%`; }
brightness.addEventListener('input', setBrightness);
function setColor(color) {
  document.documentElement.style.setProperty('--light-color', {warm:'#ffe7ab',neutral:'#f7f6df',cool:'#c5e5ff'}[color]);
  document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color===color)));
}
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click',()=>setColor(button.dataset.color)));
function setDrawer(open) { drawer.classList.toggle('open',open); drawerButton.setAttribute('aria-pressed',String(open)); document.querySelector('#drawer-label').textContent = open?'닫기 −':'열어보기 ＋'; }
drawerButton.addEventListener('click',()=>setDrawer(!drawer.classList.contains('open')));
document.querySelector('#reset').addEventListener('click',()=>{ brightness.value=75; setBrightness(); setColor('warm'); setDrawer(false); });
render();
