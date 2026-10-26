import { profile, work, visual, music, heroWords } from './content.js';
import { createHero } from './hero.js';
import { transition, isBusy } from './fx.js';
import { renderWork, initWorkScroll } from './work.js';
import { renderVisual, initVisualScroll } from './visual.js';
import { renderMusic, initMusicScroll, guitarLoop } from './music.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
ScrollTrigger.clearScrollMemory?.('manual');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ── fill simple text slots ──────────────────────────────────
const data = { profile, work, visual, music };
$$('[data-fill]').forEach((el) => {
  const val = el.dataset.fill.split('.').reduce((o, k) => o?.[k], data);
  if (Array.isArray(val)) {
    el.innerHTML = '';
    val.forEach((l) => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      if (/^https?:/.test(l.href)) { a.target = '_blank'; a.rel = 'noopener'; }
      el.appendChild(a);
    });
  } else if (val != null) el.textContent = val;
});
$('.year').textContent = new Date().getFullYear();

$('.hero-captions').innerHTML = heroWords
  .map((w, i) => `<p class="hero-caption" data-i="${i}"><b>0${i + 1} / 0${heroWords.length}</b>${w.caption}</p>`)
  .join('');

// ── sections ────────────────────────────────────────────────
const tabs = Object.fromEntries($$('.tab').map((el) => [el.dataset.tab, el]));
const workApi = renderWork(tabs.work);
renderVisual(tabs.visual);
renderMusic(tabs.music);

// ── hero ────────────────────────────────────────────────────
let hero = null;
async function bootHero() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('650 270px "Inter Tight"'),
        document.fonts.load('700 250px "Noto Sans KR"', '김혜승'),
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch (e) { /* fall back to system fonts */ }
  hero = createHero($('#hero-canvas'), heroWords.map((w) => w.word));
  if (hero && current === 'home') {
    hero.start();
    ctx.add(() => initHomeScroll());
  }
}

function initHomeScroll() {
  if (!hero) return;
  const u = hero.uniforms.uProgress;
  const caps = $$('.hero-caption');
  const n = heroWords.length - 1;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.9 },
  });
  gsap.set(caps[0], { opacity: 1 });
  tl.to({}, { duration: 0.35 });
  for (let i = 1; i <= n; i++) {
    tl.to(u, { value: i, duration: 1, ease: 'none' })
      .to(caps[i - 1], { opacity: 0, y: -10, duration: 0.25 }, '<')
      .fromTo(caps[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, '<0.6')
      .to({}, { duration: 0.35 });
  }
  // chapters grow in as the last word lands
  tl.fromTo('.chapter-word', { scale: 0.86 }, { scale: 1.12, duration: n, ease: 'none', transformOrigin: 'left center' }, 0);
  gsap.to('.scroll-hint', {
    opacity: 0,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=200', scrub: true },
  });
}

// chapters float around and lean toward the cursor
const chapters = $$('.chapter');
if (!reduceMotion) {
  chapters.forEach((el, i) => {
    const drift = () =>
      gsap.to(el, {
        x: gsap.utils.random(-40, 40),
        y: gsap.utils.random(-30, 30),
        rotation: gsap.utils.random(-3, 3),
        duration: gsap.utils.random(3.5, 6),
        ease: 'sine.inOut',
        onComplete: drift,
      });
    drift();
    const qx = gsap.quickTo(el.querySelector('.chapter-word'), 'xPercent', { duration: 1.2, ease: 'power3' });
    const qy = gsap.quickTo(el.querySelector('.chapter-word'), 'yPercent', { duration: 1.2, ease: 'power3' });
    const depth = [10, -14, 8][i] || 8;
    window.addEventListener('pointermove', (e) => {
      if (current !== 'home') return;
      qx(((e.clientX / window.innerWidth) - 0.5) * depth);
      qy(((e.clientY / window.innerHeight) - 0.5) * depth * 1.4);
    }, { passive: true });
  });
}

// ── router ──────────────────────────────────────────────────
const inits = { home: initHomeScroll, work: initWorkScroll, visual: initVisualScroll, music: initMusicScroll };
const labels = { home: 'Hey Hi', work: 'Work', visual: 'Visual Work', music: 'Music' };
let current = null;
let ctx = null;

function activate(name) {
  ctx?.revert();
  Object.entries(tabs).forEach(([k, el]) => (el.hidden = k !== name));
  current = name;
  $$('.tab-btn').forEach((b) => {
    if (b.dataset.go === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (name !== 'work') workApi.close();
  if (name !== 'music') guitarLoop.stop();
  window.scrollTo(0, 0);
  if (name === 'home') hero?.start();
  else hero?.stop();
  ctx = gsap.context(() => inits[name]?.(tabs[name]));
  ScrollTrigger.refresh();
  window.scrollTo(0, 0);
  document.title = name === 'home' ? 'Hyeseung Kim — Helen' : `${labels[name]} — Hyeseung Kim`;
}

function go(name, { fx = 'pixel', x, y } = {}) {
  if (!tabs[name] || name === current || isBusy()) return;
  if (location.hash.slice(1) !== name) history.pushState(null, '', name === 'home' ? '#' : `#${name}`);
  if (reduceMotion) return activate(name);
  if (x == null) { x = window.innerWidth / 2; y = window.innerHeight / 2; }
  if (current === 'home' && fx === 'ripple') hero?.ripple(x, y);
  transition(fx, {
    x, y,
    label: labels[name],
    onCovered: async () => activate(name),
  });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-go]');
  if (!t) return;
  e.preventDefault();
  const r = t.getBoundingClientRect();
  const x = e.clientX || r.left + r.width / 2;
  const y = e.clientY || r.top + r.height / 2;
  if (current === 'home' && t.classList.contains('chapter')) {
    hero?.ripple(x, y);
    gsap.fromTo(t, { scale: 1 }, { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
  }
  go(t.dataset.go, { fx: t.dataset.fx || 'pixel', x, y });
});

window.addEventListener('popstate', () => {
  const name = location.hash.slice(1) || 'home';
  if (tabs[name] && name !== current) go(name, { fx: 'pixel' });
});

window.addEventListener('scroll', () => {
  $('.topbar').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// pause the WebGL loop when the hero is off-screen
new IntersectionObserver(([entry]) => {
  if (!hero || current !== 'home') return;
  entry.isIntersecting ? hero.start() : hero.stop();
}).observe($('.hero'));

// first paint
const initial = tabs[location.hash.slice(1)] ? location.hash.slice(1) : 'home';
activate(initial);
bootHero();
