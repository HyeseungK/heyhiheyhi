import { music } from './content.js';
import { openModal } from './modal.js';
import { flowCoverURL, isDark, mulberry32, hashString } from './gen.js';
import { createGuitar } from './guitar3d.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const coverCache = new Map();
function coverSrc(a) {
  if (a.cover) return a.cover;
  const key = a.title + a.artist;
  if (!coverCache.has(key)) coverCache.set(key, flowCoverURL(key, a.color || '#2f4cff'));
  return coverCache.get(key);
}

export function renderMusic(root) {
  // album covers face out on two picture ledges
  const shelf = root.querySelector('.shelf');
  const perRow = Math.ceil(music.albums.length / 2);
  const rows = [music.albums.slice(0, perRow), music.albums.slice(perRow)];
  shelf.innerHTML = rows
    .map((row, r) => {
      const sleeves = row
        .map((a, j) => {
          const i = r * perRow + j;
          const rnd = mulberry32(hashString(a.title));
          const tilt = (rnd() - 0.5) * 5;
          return `<button class="sleeve" data-i="${i}" data-tilt="${tilt.toFixed(2)}" aria-label="${esc(a.title)} by ${esc(a.artist)}">
              <img src="${esc(coverSrc(a))}" alt="" loading="lazy" />
            </button>`;
        })
        .join('');
      return `<div class="shelf-row">${sleeves}</div>`;
    })
    .join('');

  shelf.addEventListener('click', (e) => {
    const s = e.target.closest('.sleeve');
    if (s) openAlbum(+s.dataset.i);
  });

  // hover like a dock: the record under the cursor rises most, its neighbours a little
  const gsap = window.gsap;
  shelf.querySelectorAll('.sleeve').forEach((el) => gsap.set(el, { rotation: +el.dataset.tilt, transformOrigin: '50% 100%' }));
  function wave(row, x) {
    row.querySelectorAll('.sleeve').forEach((el) => {
      if (current === +el.dataset.i) return;
      const r = el.getBoundingClientRect();
      const d = x === null ? Infinity : (x - (r.left + r.width / 2)) / r.width;
      const k = Math.exp(-d * d * 1.6); // 1 under the cursor, fading out to the sides
      gsap.to(el, {
        y: -20 * k, scale: 1 + 0.07 * k, rotation: +el.dataset.tilt * (1 - k),
        x: x === null ? 0 : -Math.sign(d) * 10 * k * (1 - k) * 4, // neighbours lean away
        zIndex: Math.round(k * 10), duration: 0.6, ease: 'power3.out', overwrite: 'auto',
      });
    });
  }
  shelf.querySelectorAll('.shelf-row').forEach((row) => {
    row.addEventListener('pointermove', (e) => e.pointerType === 'mouse' && wave(row, e.clientX));
    row.addEventListener('pointerleave', () => wave(row, null));
    row.addEventListener('focusin', (e) => {
      const r = e.target.getBoundingClientRect();
      wave(row, r.left + r.width / 2);
    });
    row.addEventListener('focusout', () => wave(row, null));
  });

  renderTickets(root);

  const guitar = root.querySelector('.guitar');
  guitar3d = createGuitar(guitar.querySelector('canvas'));
  if (!guitar3d) guitar.innerHTML = '<span class="guitar-fallback">♪ Guitar</span>';
  guitar.addEventListener('click', () => {
    strum();
    setTimeout(openStage, 700);
  });
  guitar.addEventListener('pointerenter', () => guitar3d?.nudge());
}

let guitar3d = null;
window.addEventListener('accentchange', () => guitar3d?.recolor());
export const guitarLoop = {
  start: () => guitar3d?.start(),
  stop: () => guitar3d?.stop(),
};

// ── ticket book ─────────────────────────────────────────────
function renderTickets(root) {
  const gsap = window.gsap;
  const book = root.querySelector('.ticket-book');
  book.innerHTML = music.tickets
    .map((t, i) => {
      const c = t.color || '#2f4cff';
      const dark = isDark(c);
      return `<button class="ticket${dark ? '' : ' light'}" data-type="${esc(t.type)}" data-i="${i}" style="--c:${esc(c)};--fg:${dark ? '#fff' : '#111'}" aria-label="${esc(t.name)} ticket. Press to tear the stub" aria-pressed="false">
        <span class="t-main">
          <span class="t-face">
            <span class="t-type">${esc(t.type)} · ${esc(t.city)}</span>
            <span><span class="t-name" style="display:block">${esc(t.name)}</span><span class="t-line">${esc(t.lineup)}</span></span>
            <span class="t-meta"><span>${esc(t.date)}</span><span>${esc(t.venue)}</span>${t.seat ? `<span>${esc(t.seat)}</span>` : ''}</span>
          </span>
          <span class="t-back">
            <span class="t-type">${esc(t.date)} · ${esc(t.venue)}</span>
            <span class="t-memo">“${esc(t.memo)}”</span>
            <span class="t-type">Tap to put it back</span>
          </span>
        </span>
        <span class="t-stub"><span class="admit">ADMIT ONE</span><span>No. ${String(i + 1).padStart(4, '0')}</span></span>
      </button>`;
    })
    .join('');

  book.addEventListener('click', (e) => {
    const t = e.target.closest('.ticket');
    if (!t) return;
    const stub = t.querySelector('.t-stub');
    const torn = !t.classList.contains('torn');
    t.setAttribute('aria-pressed', torn);
    if (torn) {
      gsap.timeline()
        .to(stub, { rotation: 6, x: 4, duration: 0.12, ease: 'power1.out', transformOrigin: '0% 100%' })
        .to(stub, { rotation: 32, x: 40, y: 70, opacity: 0, duration: 0.55, ease: 'power2.in' })
        .add(() => t.classList.add('torn'), 0.2);
    } else {
      t.classList.remove('torn');
      gsap.fromTo(stub, { rotation: -12, x: 30, y: -20, opacity: 0 }, { rotation: 0, x: 0, y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'back.out(1.6)' });
    }
  });

  root.querySelector('.ticket-filter').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    root.querySelectorAll('.ticket-filter .chip').forEach((c) => c.classList.toggle('is-on', c === chip));
    const shown = [];
    book.querySelectorAll('.ticket').forEach((t) => {
      t.hidden = chip.dataset.t !== 'all' && t.dataset.type !== chip.dataset.t;
      if (!t.hidden) shown.push(t);
    });
    gsap.fromTo(shown, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: 'power3.out' });
    window.ScrollTrigger.refresh();
  });
}

// ── album ───────────────────────────────────────────────────
const modal = document.querySelector('.album-modal');

let current = -1;
let spin = null;
const sleeveOf = (i) => document.querySelector(`.sleeve[data-i="${i}"]`);

function paintAlbum(a) {
  const gsap = window.gsap;
  const src = coverSrc(a);
  const info = modal.querySelector('.album-info');
  modal.style.setProperty('--c', a.color || '#ddd');
  modal.querySelector('.cover-face').innerHTML = `<img src="${esc(src)}" alt="${esc(a.title)} cover" />`;
  modal.querySelector('.cover-back').innerHTML = `${esc(a.artist)}<br>${esc(a.title)}<br>${esc(a.year)}`;
  modal.querySelector('.cd-art').innerHTML = `<img src="${esc(src)}" alt="" />`;
  modal.querySelector('.album-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(music.albums.length).padStart(2, '0')}`;
  info.innerHTML = `
    <p class="year">${esc(a.year)}</p>
    <h3>${esc(a.title)}</h3>
    <p class="artist">${esc(a.artist)}</p>
    <p class="why">${esc(a.why)}</p>
    <ol class="tracks">
      ${a.tracks
        .map(
          (t, i) => `<li class="track">
            <button aria-expanded="false"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="name">${esc(t.name)}</span><span class="pm">+</span></button>
            <div class="note"><p>${esc(t.why || '—')}</p></div>
          </li>`
        )
        .join('')}
    </ol>`;
  info.querySelectorAll('.track button').forEach((b) =>
    b.addEventListener('click', () => {
      const li = b.parentElement;
      const open = !li.classList.contains('open');
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
      gsap.to(li.querySelector('.note'), { height: open ? 'auto' : 0, duration: 0.45, ease: 'power3.inOut' });
    })
  );
}

// case slides in, cover swings open, CD rolls out and spins
function playIn(dir = 0) {
  const gsap = window.gsap;
  const caseEl = modal.querySelector('.case');
  const cover = modal.querySelector('.case-cover');
  const cd = modal.querySelector('.cd');
  const art = modal.querySelector('.cd-art');
  const info = modal.querySelector('.album-info');
  const small = window.matchMedia('(max-width: 860px)').matches;
  gsap.killTweensOf([caseEl, cover, cd]);
  gsap.set([cover, cd], { clearProps: 'transform' });
  const tl = gsap.timeline();
  if (dir) tl.fromTo(caseEl, { x: dir * 80, opacity: 0, y: 0, rotateX: 0, rotateZ: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  else tl.fromTo(caseEl, { y: 90, x: 0, rotateX: 28, rotateZ: -6, opacity: 0 }, { y: 0, rotateX: 0, rotateZ: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2);
  tl.to(cover, { rotateY: -128, duration: dir ? 0.8 : 1.1, ease: 'power3.inOut' }, dir ? 0.25 : 0.95)
    .to(cd, { x: small ? '42%' : '56%', duration: 0.8, ease: 'power3.out' }, dir ? 0.75 : 1.6)
    .add(() => {
      spin?.kill();
      spin = gsap.to(art, { rotation: '+=360', duration: 2.6, ease: 'none', repeat: -1 });
    }, '<0.1')
    .fromTo(info.children, { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: 'power3.out' }, dir ? 0.15 : 0.7);
  return tl;
}

// CD goes back in, cover closes, case leaves
function playOut(dir = 0) {
  const gsap = window.gsap;
  spin?.kill();
  return gsap
    .timeline()
    .to(modal.querySelector('.album-info').children, { opacity: 0, y: -10, duration: 0.2, stagger: 0.02 }, 0)
    .to(modal.querySelector('.cd'), { x: 0, duration: 0.35, ease: 'power2.in' }, 0)
    .to(modal.querySelector('.case-cover'), { rotateY: 0, duration: 0.4, ease: 'power2.inOut' }, 0.2)
    .to(modal.querySelector('.case'), dir ? { x: -dir * 80, opacity: 0, duration: 0.3, ease: 'power2.in' } : { y: 60, opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.5);
}

function liftSleeve(i, out) {
  const el = sleeveOf(i);
  if (el) window.gsap.to(el, out ? { y: -40, opacity: 0, duration: 0.4, ease: 'power3.in' } : { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
}

let switching = false;
async function step(d) {
  if (switching || current < 0) return;
  switching = true;
  const next = (current + d + music.albums.length) % music.albums.length;
  await playOut(d);
  liftSleeve(current, false);
  current = next;
  liftSleeve(current, true);
  paintAlbum(music.albums[current]);
  await playIn(d);
  switching = false;
}

function openAlbum(i) {
  current = i;
  paintAlbum(music.albums[i]);
  liftSleeve(i, true);
  openModal(modal, {
    onKey: (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    },
    onClose: async () => {
      await playOut(0);
      liftSleeve(current, false);
      current = -1;
    },
  });
  playIn(0);
  modal.scrollTop = 0;
}
modal.querySelector('.album-prev').addEventListener('click', () => step(-1));
modal.querySelector('.album-next').addEventListener('click', () => step(1));
let touchX = null;
modal.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
modal.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
  touchX = null;
});

// ── guitar ──────────────────────────────────────────────────
let audio;
function pluck(freq, when, gain = 0.18) {
  const sr = audio.sampleRate;
  const len = Math.floor(sr * 2.2);
  const buf = audio.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const N = Math.round(sr / freq);
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  let p = 0;
  for (let i = 0; i < len; i++) {
    const nx = (p + 1) % N;
    const v = ring[p];
    ring[p] = 0.996 * 0.5 * (ring[p] + ring[nx]);
    d[i] = v;
    p = nx;
  }
  const src = audio.createBufferSource();
  src.buffer = buf;
  const g = audio.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 2.1);
  const lp = audio.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3200;
  src.connect(lp).connect(g).connect(audio.destination);
  src.start(when);
}

function strum() {
  guitar3d?.strum();
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const t = audio.currentTime + 0.02;
    // a G major chord, low to high
    [98.0, 123.47, 146.83, 196.0, 246.94, 392.0].forEach((f, i) => pluck(f, t + i * 0.028));
  } catch (e) {
    /* no audio, no problem */
  }
}

const drawer = document.querySelector('.stage-drawer');
function openStage() {
  const s = music.stage;
  drawer.querySelector('.drawer-body').innerHTML = `
    <p class="eyebrow">On stage</p>
    <h3>Where I’ve played</h3>
    <p class="intro">${esc(s.intro)}</p>
    <ul class="perf">
      ${s.performances
        .map((p) => {
          const inner = `<span class="t">${esc(p.title)}${p.url ? ' ↗' : ''}</span><span class="d">${esc(p.date)}</span><span class="r">${esc(p.role)}</span>`;
          return `<li>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="row">${inner}</div>`}</li>`;
        })
        .join('')}
    </ul>
    <a class="sc-btn" href="${esc(s.soundcloud)}" target="_blank" rel="noopener">Listen on SoundCloud ↗</a>`;
  openModal(drawer, { from: { x: '100%', opacity: 1 } });
  window.gsap.from(drawer.querySelectorAll('.drawer-body > *, .perf li'), { y: 20, opacity: 0, stagger: 0.05, duration: 0.5, delay: 0.15, ease: 'power3.out' });
}

export function initMusicScroll(root) {
  const gsap = window.gsap;
  gsap.from(root.querySelectorAll('.ticket'), {
    y: 40, rotation: () => gsap.utils.random(-4, 4), opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.ticket-book'), start: 'top 85%' },
  });
  root.querySelectorAll('.shelf-row').forEach((row) => {
    gsap.from(row.querySelectorAll('.sleeve'), {
      y: 50, opacity: 0, stagger: 0.05, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: row, start: 'top 90%' },
    });
  });
  gsap.from(root.querySelector('.guitar'), {
    y: 60, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.guitar-wrap'), start: 'top 92%' },
  });
  // render the 3D guitar only while it is on screen
  renderWhileVisible(root.querySelector('.guitar-wrap'));
}

function renderWhileVisible(el) {
  window.ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? guitarLoop.start() : guitarLoop.stop()),
  });
}
