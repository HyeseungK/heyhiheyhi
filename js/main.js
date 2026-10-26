import { site, profile, work, visual, music, heroWords } from './content.js';
import { createHero } from './hero.js';
import { transition, isBusy } from './fx.js';
import { renderWork, initWorkScroll } from './work.js';
import { renderVisual, initVisualScroll } from './visual.js';
import { renderMusic, initMusicScroll, guitarLoop } from './music.js';
import { renderBrickIcons } from './bricks.js';
import { initCursor } from './cursor.js';
import { currentModal, closeModal } from './modal.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
ScrollTrigger.clearScrollMemory?.('manual');

document.body.classList.add(`layout-${site.layout}`);

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


// ── business card ───────────────────────────────────────────
function setupCard() {
  const c = profile.card;
  $('.bc-title').textContent = `${c.title} @ ${c.org}`;
  $('.bc-loc').textContent = profile.location;
  const rows = [
    ['Email', c.email && `mailto:${c.email}`, c.email],
    ['Phone', c.phone && `tel:${c.phone.replace(/\s/g, '')}`, c.phone],
    ...profile.links.filter((l) => l.label !== 'Email').map((l) => [l.label, l.href, l.display || l.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')]),
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
  $('.bc-vcf').href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));

  // QR code to the site, on the back of the card and on the saved image
  let qr = null;
  try {
    qr = window.qrcode(0, 'M');
    qr.addData(c.website);
    qr.make();
    $('.bc-qr').innerHTML = qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
  } catch (e) { $('.bc-qr').remove(); }

  const saveImg = $('.bc-img');
  if (c.image) saveImg.href = c.image;
  else saveImg.addEventListener('click', (e) => {
    if (saveImg.dataset.ready) return;
    e.preventDefault();
    saveImg.href = drawCardPNG(qr);
    saveImg.dataset.ready = '1';
    saveImg.click();
  });

  const card = $('.bcard');
  const flip = () => card.classList.toggle('flipped');
  card.addEventListener('click', (e) => { if (!e.target.closest('a')) flip(); });
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); flip(); }
  });
}
setupCard();

// 1050 × 600 PNG of the card front, with the QR code
function drawCardPNG(qr) {
  const W = 1050, H = 600, c = profile.card;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#0f0f0f';
  g.beginPath(); g.arc(96, 96, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = '600 28px "Inter Tight", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('H', 96, 97);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#0f0f0f'; g.font = '600 76px "Inter Tight", sans-serif';
  g.fillText(profile.name, 66, 300);
  g.fillStyle = '#3a3a3a'; g.font = 'italic 44px "Instrument Serif", serif';
  g.fillText(profile.nickname, 66, 356);
  g.fillStyle = '#8b8b88'; g.font = '500 22px "Inter Tight", sans-serif';
  g.fillText(`${c.title} @ ${c.org}`.toUpperCase(), 66, 500);
  g.fillText([c.email, c.phone].filter(Boolean).join('  ·  '), 66, 540);
  if (qr) {
    const n = qr.getModuleCount(), size = 170, cell = size / n, x0 = W - 66 - size, y0 = H - 66 - size;
    g.fillStyle = '#0f0f0f';
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) g.fillRect(x0 + k * cell, y0 + r * cell, cell + 0.5, cell + 0.5);
  }
  g.fillStyle = accent; g.fillRect(0, H - 10, W, 10);
  return cv.toDataURL('image/png');
}

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
  hero = createHero($('#hero-canvas'), heroWords, () => $('.bcard').getBoundingClientRect());
  if (hero && current === 'home') {
    hero.start();
    ctx.add(() => initHomeScroll());
  }
}

function initHomeScroll() {
  if (!hero) return;
  const u = hero.uniforms.uProgress;
  const n = heroWords.length - 1;
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.9 },
  });
  tl.to({}, { duration: 0.35 });
  for (let i = 1; i <= n; i++) {
    tl.to(u, { value: i, duration: 1, ease: 'none' }).to({}, { duration: 0.35 });
  }
  // chapters grow in as the last word lands
  tl.fromTo('.chapter-word', { scale: 0.86 }, { scale: 1.12, duration: n, ease: 'none', transformOrigin: 'left center' }, 0);
  // finally the particles gather into a business card
  tl.to(u, { value: n + 1, duration: 1, ease: 'none' })
    .to(hero.uniforms.uFade, { value: 0.35, duration: 0.3 }, '>-0.15')
    .fromTo('.card-wrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, '<')
    .fromTo('.bcard', { rotateX: 25, rotateY: -12 }, { rotateX: 0, rotateY: 0, duration: 0.35 }, '<')
    .to({}, { duration: 0.6 });
  gsap.to('.scroll-hint', {
    opacity: 0,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=200', scrub: true },
  });
}

// chapters float around and lean toward the cursor.
// Drag one anywhere and let go: it glides a little, settles, and floats around its new spot.
const chapters = $$('.chapter');

// each chapter drifts around an anchor (its layout spot plus wherever it was dropped)
function drift(el) {
  const ax = +el.dataset.ax || 0, ay = +el.dataset.ay || 0;
  gsap.to(el, {
    x: ax + gsap.utils.random(-0.12, 0.12) * window.innerWidth,
    y: ay + gsap.utils.random(-0.09, 0.09) * window.innerHeight,
    rotation: gsap.utils.random(-6, 6),
    duration: gsap.utils.random(5, 9),
    ease: 'sine.inOut',
    onComplete: () => drift(el),
  });
}
const stopDrift = (el) => gsap.killTweensOf(el, 'x,y,rotation');

// keeps a chapter fully on screen: returns the clamped x / y offsets
function clampOnScreen(el, x, y) {
  const r = el.getBoundingClientRect();
  const cx = gsap.getProperty(el, 'x'), cy = gsap.getProperty(el, 'y');
  const left = r.left - cx, top = r.top - cy, pad = 12;
  const minX = pad - left, maxX = window.innerWidth - pad - r.width - left;
  const minY = 70 - top, maxY = window.innerHeight - pad - r.height - top;
  return [gsap.utils.clamp(minX, maxX, x), gsap.utils.clamp(minY, maxY, y)];
}

if (!reduceMotion) {
  chapters.forEach((el, i) => {
    drift(el);
    gsap.to(el.querySelector('.chapter-ico'), {
      rotation: gsap.utils.random(-16, 16), y: gsap.utils.random(-10, -4),
      duration: gsap.utils.random(1.6, 2.6), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.4,
    });
    const qx = gsap.quickTo(el.querySelector('.chapter-word'), 'xPercent', { duration: 1.2, ease: 'power3' });
    const qy = gsap.quickTo(el.querySelector('.chapter-word'), 'yPercent', { duration: 1.2, ease: 'power3' });
    const depth = [10, -14, 8][i] || 8;
    window.addEventListener('pointermove', (e) => {
      if (current !== 'home') return;
      qx(((e.clientX / window.innerWidth) - 0.5) * depth);
      qy(((e.clientY / window.innerHeight) - 0.5) * depth * 1.4);
    }, { passive: true });

    // drag and drop (with a little throw)
    let drag = null;
    el.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, ox: gsap.getProperty(el, 'x'), oy: gsap.getProperty(el, 'y'), moved: false, vx: 0, vy: 0, t: performance.now() };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) { drag.moved = true; stopDrift(el); el.classList.add('is-dragging'); }
      const now = performance.now(), dt = Math.max(1, now - drag.t);
      drag.vx = (e.movementX || 0) / dt; drag.vy = (e.movementY || 0) / dt; drag.t = now;
      gsap.set(el, { x: drag.ox + dx, y: drag.oy + dy, rotation: gsap.utils.clamp(-18, 18, (e.movementX || 0) * 1.5) });
    });
    window.addEventListener('pointerup', () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      el.classList.remove('is-dragging');
      if (!d.moved) return;
      el.dataset.dragged = '1';
      setTimeout(() => delete el.dataset.dragged, 0);
      const [x, y] = clampOnScreen(el, gsap.getProperty(el, 'x') + d.vx * 90, gsap.getProperty(el, 'y') + d.vy * 90);
      el.dataset.ax = x; el.dataset.ay = y;
      gsap.to(el, { x, y, rotation: 0, duration: 0.9, ease: 'power3.out', onComplete: () => drift(el) });
    });
  });
}

// ── router ──────────────────────────────────────────────────
const inits = { home: initHomeScroll, work: initWorkScroll, visual: initVisualScroll, music: initMusicScroll };
const labels = { home: 'Hey Hi', work: 'Work', visual: 'Frames', music: 'Music' };
let current = null;
let ctx = null;

function activate(name) {
  if (currentModal()) closeModal(currentModal(), true);
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
  if (name === 'home') { hero?.relayout(); hero?.start(); }
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
    label: site.greeting ? { lead: site.greeting.lead, word: site.greeting[name] || labels[name] } : labels[name],
    onCovered: async () => activate(name),
  });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-go]');
  if (!t) return;
  e.preventDefault();
  if (t.dataset.dragged) return; // the end of a drag, not a click
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

// ── accent colour (dot in the top bar opens a palette) ──────
const accents = site.accents;
let accentIdx = 0;
try {
  const saved = localStorage.getItem('accent');
  const k = accents.findIndex((a) => a.name === saved);
  if (k >= 0) accentIdx = k;
} catch (e) { /* storage blocked */ }
if (accents.length < 2) $('.accent-wrap').hidden = true;
const swatches = $('.swatches');
swatches.innerHTML = accents
  .map((a, i) => `<button class="swatch" role="option" data-i="${i}" style="--c:${a.hex}"><i></i><span>${a.name}</span></button>`)
  .join('');
function applyAccent() {
  const a = accents[accentIdx];
  document.documentElement.style.setProperty('--accent', a.hex);
  $('.accent-dot').setAttribute('aria-label', `Accent colour: ${a.name}. Change`);
  $$('.swatch').forEach((b, i) => b.setAttribute('aria-selected', i === accentIdx));
  window.dispatchEvent(new CustomEvent('accentchange', { detail: a }));
}
applyAccent();
function togglePalette(open = swatches.hidden) {
  swatches.hidden = !open;
  $('.accent-dot').setAttribute('aria-expanded', open);
  if (open) gsap.fromTo($$('.swatch'), { y: -8, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.3, ease: 'power3.out' });
}
$('.accent-dot').addEventListener('click', (e) => { e.stopPropagation(); togglePalette(); });
swatches.addEventListener('click', (e) => {
  const b = e.target.closest('.swatch');
  if (!b) return;
  e.stopPropagation();
  accentIdx = +b.dataset.i;
  try { localStorage.setItem('accent', accents[accentIdx].name); } catch (err) { /* ignore */ }
  applyAccent();
  gsap.fromTo('.accent-dot i', { scale: 0.4 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
});
document.addEventListener('click', (e) => { if (!swatches.hidden && !e.target.closest('.accent-wrap')) togglePalette(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !swatches.hidden) togglePalette(false); });
window.addEventListener('accentchange', () => icons && paintIcons());

// brick icons for the nav and the floating chapters
(window.requestIdleCallback || ((f) => setTimeout(f, 300)))(paintIcons);
let icons = null;
function paintIcons() {
  icons = renderBrickIcons();
  if (!icons) return;
  $$('[data-icon]').forEach((img) => (img.src = icons[img.dataset.icon]));
}
initCursor();

// first paint
// a fresh visit starts at home; a refresh stays on the tab in the URL (#work, #visual, #music)
const initial = tabs[location.hash.slice(1)] ? location.hash.slice(1) : 'home';
activate(initial);
bootHero();
