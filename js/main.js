import { profile, work, visual, music, heroWords } from './content.js';
import { createHero } from './hero.js';
import { transition, isBusy } from './fx.js';
import { renderWork, initWorkScroll } from './work.js';
import { renderVisual, initVisualScroll } from './visual.js';
import { renderMusic, initMusicScroll, guitarLoop } from './music.js';
import { renderBrickIcons } from './bricks.js';
import { initCursor } from './cursor.js';

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

// ── business card ───────────────────────────────────────────
function setupCard() {
  const c = profile.card;
  $('.bc-title').textContent = `${c.title} · ${c.org}`;
  $('.bc-loc').textContent = profile.location;
  const rows = [
    ['Email', c.email && `mailto:${c.email}`, c.email],
    ['Phone', c.phone && `tel:${c.phone.replace(/\s/g, '')}`, c.phone],
    ...profile.links.filter((l) => l.label !== 'Email').map((l) => [l.label, l.href, l.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')]),
    ['Web', c.website, c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')],
  ].filter((r) => r[1]);
  $('.bc-rows').innerHTML = rows
    .map(([k, href, v]) => `<a class="bc-row" href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}><span class="k">${k}</span><span class="v">${v}</span></a>`)
    .join('');

  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:Kim;Hyeseung;;;`, `FN:${profile.name}`, `NICKNAME:${profile.nickname}`,
    `TITLE:${c.title}`, `ORG:${c.org}`,
    c.email && `EMAIL;TYPE=INTERNET:${c.email}`,
    c.phone && `TEL;TYPE=CELL:${c.phone}`,
    `URL:${c.website}`,
    ...profile.links.filter((l) => /^https?:/.test(l.href)).map((l) => `X-SOCIALPROFILE;TYPE=${l.label.toLowerCase()}:${l.href}`),
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
  $('.bc-save').href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));

  const card = $('.bcard');
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', (e) => { if (!e.target.closest('a')) flip(); });
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); flip(); }
  });
}
setupCard();

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
  hero = createHero($('#hero-canvas'), heroWords.map((w) => w.word), () => $('.bcard').getBoundingClientRect());
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
  // finally the particles gather into a business card
  tl.to(u, { value: n + 1, duration: 1, ease: 'none' })
    .to(caps[n], { opacity: 0, y: -10, duration: 0.25 }, '<')
    .to(hero.uniforms.uFade, { value: 0.35, duration: 0.3 }, '>-0.15')
    .fromTo('.card-wrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, '<')
    .fromTo('.bcard', { rotateX: 25, rotateY: -12 }, { rotateX: 0, rotateY: 0, duration: 0.35 }, '<')
    .to({}, { duration: 0.6 });
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

// brick icons for the nav and the floating chapters
(window.requestIdleCallback || ((f) => setTimeout(f, 300)))(paintIcons);
function paintIcons() {
  const icons = renderBrickIcons();
  if (!icons) return;
  $$('[data-icon]').forEach((img) => (img.src = icons[img.dataset.icon]));
}
initCursor();

// first paint
const initial = tabs[location.hash.slice(1)] ? location.hash.slice(1) : 'home';
activate(initial);
bootHero();
