import { music } from './content.js';
import { openModal } from './modal.js';
import { flowCoverURL, isDark, mulberry32, hashString } from './gen.js';
import { createGuitar } from './guitar3d.js';
import { findAlbum, findSong } from './itunes.js';
import { sound } from './sound.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const coverCache = new Map();
function coverSrc(a) {
  if (a.cover) return a.cover;
  if (a.official?.artwork) return a.official.artwork;
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
  root.querySelector('.shuffle-btn').addEventListener('click', () => shuffleRack(shelf));
  loadCovers(shelf);

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
  renderMixtape(root);

  const guitar = root.querySelector('.guitar');
  const rig = root.querySelector('.guitar-rig');
  // the amp stays put on its own canvas; the guitar canvas on top is the one you can throw
  const ampScene = createGuitar(root.querySelector('.amp-canvas'), { part: 'amp', hoverEl: rig });
  const guitarScene = createGuitar(guitar.querySelector('canvas'), { part: 'guitar', hoverEl: rig });
  guitar3d = guitarScene && {
    start() { ampScene?.start(); guitarScene.start(); },
    stop() { ampScene?.stop(); guitarScene.stop(); },
    strum: () => guitarScene.strum(),
    nudge: () => guitarScene.nudge(),
    recolor() { ampScene?.recolor(); guitarScene.recolor(); },
  };
  if (!guitar3d) guitar.innerHTML = '<span class="guitar-fallback">♪ Guitar</span>';
  guitar.addEventListener('click', (e) => {
    if (guitar.dataset.thrown) { e.preventDefault(); return; } // the end of a throw, not a click
    strum();
    setTimeout(openStage, 700);
  });
  guitar.addEventListener('pointerenter', () => guitar3d?.nudge());
  makeThrowable(guitar, root.querySelector('.shelf'));
}

// Drag the guitar and fling it: if it reaches the record ledge, the sleeves get knocked
// about and it twangs; either way it floats back home.
function makeThrowable(guitar, shelf) {
  const gsap = window.gsap;
  let drag = null;
  guitar.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    gsap.killTweensOf(guitar);
    drag = { x: e.clientX, y: e.clientY, ox: gsap.getProperty(guitar, 'x'), oy: gsap.getProperty(guitar, 'y'), moved: false, hist: [] };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    if (!drag.moved) { drag.moved = true; guitar.classList.add('is-held'); try { guitar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
    drag.hist.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (drag.hist.length > 6) drag.hist.shift();
    gsap.set(guitar, { x: drag.ox + dx, y: drag.oy + dy, rotation: gsap.utils.clamp(-35, 35, (e.movementX || 0) * 2) });
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.moved) return;
    guitar.dataset.thrown = '1';
    setTimeout(() => delete guitar.dataset.thrown, 0);
    // release velocity from the last few moves (px per ms)
    const a = d.hist[0], b = d.hist[d.hist.length - 1];
    const dt = Math.max(16, (b?.t || 0) - (a?.t || 0));
    const vx = a ? (b.x - a.x) / dt : 0, vy = a ? (b.y - a.y) / dt : 0;
    fly(vx, vy);
  });

  function hitShelf() {
    const g = guitar.getBoundingClientRect();
    const cx = g.left + g.width / 2, cy = g.top + g.height * 0.35;
    return [...shelf.querySelectorAll('.sleeve')].filter((el) => {
      const r = el.getBoundingClientRect();
      return Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)) < Math.max(r.width, g.width * 0.35);
    });
  }

  function fly(vx, vy) {
    const speed = Math.hypot(vx, vy);
    let done = false;
    const x0 = gsap.getProperty(guitar, 'x'), y0 = gsap.getProperty(guitar, 'y');
    gsap.to(guitar, {
      x: x0 + vx * 420, y: y0 + vy * 420, rotation: `+=${gsap.utils.clamp(-540, 540, vx * 500)}`,
      duration: speed > 0.3 ? 0.8 : 0.3, ease: 'power2.out',
      onUpdate() {
        if (done) return;
        const hits = hitShelf();
        if (!hits.length) return;
        done = true;
        this.kill();
        bonk(hits);
      },
      onComplete: () => !done && goHome(0.5),
    });
  }

  function bonk(hits) {
    strum();
    guitar3d?.strum();
    gsap.to(guitar, { y: '+=40', rotation: '+=25', duration: 0.35, ease: 'power2.out' });
    const all = [...shelf.querySelectorAll('.sleeve')];
    const g = guitar.getBoundingClientRect();
    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - (g.left + g.width / 2)) / r.width;
      const k = hits.includes(el) ? 1 : Math.max(0, 1 - dist / 3);
      if (!k) return;
      const dir = Math.sign(r.left + r.width / 2 - (g.left + g.width / 2)) || 1;
      gsap.timeline()
        .to(el, { y: -36 * k, x: dir * 14 * k, rotation: dir * 18 * k, duration: 0.18, ease: 'power2.out', overwrite: 'auto' })
        .to(el, { y: 0, x: 0, rotation: +el.dataset.tilt, duration: 1.1, ease: 'elastic.out(1, 0.3)' });
    });
    goHome(0.9);
  }

  function goHome(delay) {
    gsap.to(guitar, {
      x: 0, y: 0, rotation: 0, duration: 1.2, delay, ease: 'elastic.out(1, 0.55)',
      onStart: () => guitar.classList.remove('is-held'),
    });
  }
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

// ── rack: official covers + shuffle ──────────────────────────
// covers saved into the repo by scripts/fetch-covers.mjs (GitHub Action); live lookup is the fallback
const saved = fetch(`assets/albums/covers.json?h=${Math.floor(Date.now() / 3.6e6)}`)
  .then((r) => (r.ok ? r.json() : {}))
  .catch(() => ({}));
async function officialFor(kind, a) {
  const hit = (await saved)[`${kind}|${a.artist}|${a.title}`];
  if (hit) return hit;
  const q = { artist: a.artist, title: a.title, spotify: a.spotify, ...(a.itunes || {}) };
  return kind === 'album' ? findAlbum(q) : findSong(q);
}

const rackOrder = () => [...document.querySelectorAll('.shelf .sleeve')].map((el) => +el.dataset.i);

function loadCovers(shelf) {
  music.albums.forEach((a, i) => {
    if (a.cover) return;
    officialFor('album', a).then((r) => {
      if (!r?.artwork) return;
      a.official = r;
      const img = shelf.querySelector(`.sleeve[data-i="${i}"] img`);
      if (!img) return;
      const next = new Image();
      next.onload = () => {
        img.src = r.artwork;
        window.gsap.fromTo(img, { opacity: 0.2 }, { opacity: 1, duration: 0.6 });
      };
      next.src = r.artwork;
    }).catch(() => {});
  });
}

// shuffle the records across both ledges, with a little hop (FLIP: measure, move, animate back)
function shuffleRack(shelf) {
  const gsap = window.gsap;
  const sleeves = [...shelf.querySelectorAll('.sleeve')];
  const before = new Map(sleeves.map((el) => [el, el.getBoundingClientRect()]));
  const order = gsap.utils.shuffle(sleeves.slice());
  const rows = [...shelf.querySelectorAll('.shelf-row')];
  const per = Math.ceil(order.length / rows.length);
  order.forEach((el, k) => rows[Math.floor(k / per)].appendChild(el));
  order.forEach((el, k) => {
    const a = before.get(el), b = el.getBoundingClientRect();
    gsap.fromTo(el,
      { x: a.left - b.left, y: a.top - b.top, rotation: gsap.utils.random(-25, 25) },
      { x: 0, y: 0, rotation: +el.dataset.tilt, duration: 0.9, delay: k * 0.03, ease: 'power3.inOut',
        overwrite: true });
    gsap.fromTo(el, { scale: 1 }, { scale: 1.08, duration: 0.45, delay: k * 0.03, yoyo: true, repeat: 1, ease: 'sine.inOut' });
  });
}

// ── the burned CD ───────────────────────────────────────────
let player = null;
// "Artist · Album, 1999" once the lookup has found the record
const subLine = (s) => esc([s.artist, [s.found?.album || s.album, s.found?.year || s.year].filter(Boolean).join(', ')].filter(Boolean).join(' · '));

function discHTML(label, sub) {
  return `<div class="burn-disc" aria-hidden="true">
    <span class="burn-rings"></span><span class="burn-holo"></span><span class="burn-shine"></span><span class="burn-hub"></span>
    <span class="burn-label">${esc(label)}</span><span class="burn-note">${esc(sub)}</span>
  </div>`;
}

// a double jewel case: open it, pick disc A or B, play a track and that disc spins
function renderMixtape(root) {
  const gsap = window.gsap;
  const m = music.mixtape;
  if (!m) return;
  const box = root.querySelector('.mixtape');
  const caseEl = box.querySelector('.dcase');
  const cover = box.querySelector('.dcase-cover');
  const sides = Object.entries(m.sides || {});
  const songsOf = (key) => m.songs.map((s, i) => [s, i]).filter(([s]) => s.side === key);

  // paper insert on the front
  box.querySelector('.ins-label').textContent = m.label;
  box.querySelector('.ins-vol').textContent = m.note || '';
  box.querySelector('.ins-sides').innerHTML = sides.map(([, label], k) => `<span>${'AB'[k] || k + 1} — ${esc(label.replace(/^Side \w+ · /, ''))}</span>`).join('');

  // one burned disc per side: A sits in the cover, B in the base
  const slots = [...box.querySelectorAll('.disc-slot')].sort((x, y) => x.dataset.side - y.dataset.side);
  sides.forEach(([key, label], k) => {
    if (!slots[k]) return;
    slots[k].dataset.key = key;
    slots[k].innerHTML = discHTML(m.label, `${'AB'[k] || k + 1} · ${label.replace(/^Side \w+ · /, '')}`);
  });

  box.querySelector('.side-tabs').innerHTML = sides
    .map(([key, label]) => `<button class="chip" role="tab" data-key="${esc(key)}">${esc(label)} <span>${songsOf(key).length}</span></button>`)
    .join('');

  const list = box.querySelector('.mix-list');
  let side = sides[0]?.[0];
  function paintList(animate) {
    let n = 0;
    const offset = sides.findIndex(([k]) => k === side) ? songsOf(sides[0][0]).length : 0;
    list.innerHTML = `<ol>${songsOf(side)
      .map(([s, i]) => `<li><button class="mix-track${playing === i ? ' is-playing' : ''}" data-i="${i}">
          <span class="n">${String(offset + ++n).padStart(2, '0')}</span>
          <span class="art"${s.found?.artwork ? ` style="background-image:url('${esc(s.found.artwork.replace('600x600bb', '200x200bb'))}')"` : ''}></span>
          <span class="tt"><b>${esc(s.title)}</b><span class="sub">${subLine(s)}</span></span>
          <span class="pl" aria-hidden="true"></span>
        </button></li>`)
      .join('')}</ol>`;
    box.querySelectorAll('.side-tabs .chip').forEach((c) => {
      c.classList.toggle('is-on', c.dataset.key === side);
      c.setAttribute('aria-selected', c.dataset.key === side);
    });
    slots.forEach((sl) => sl.classList.toggle('is-picked', sl.dataset.key === side));
    if (animate) gsap.from(list.querySelectorAll('li'), { x: 24, opacity: 0, stagger: 0.035, duration: 0.45, ease: 'power3.out' });
  }

  // open / close the case: the cover swings on its left hinge, the case slides to stay centred
  let open = false;
  function setOpen(v) {
    if (open === v) return;
    open = v;
    caseEl.dataset.open = v;
    box.querySelector('.case-hint').textContent = v ? 'Pick a disc' : 'Open the case';
    gsap.to(cover, { rotationY: v ? -180 : 0, duration: 1.1, ease: 'power3.inOut' });
    gsap.to(caseEl, { xPercent: v ? 50 : 0, duration: 1.1, ease: 'power3.inOut' });
    if (v) gsap.fromTo(slots.map((s) => s.querySelector('.burn-disc')), { rotation: -40 }, { rotation: 0, duration: 1.4, ease: 'power3.out', stagger: 0.1 });
  }
  box.querySelector('.dcase-hit').addEventListener('click', () => setOpen(true));
  caseEl.addEventListener('click', (e) => {
    if (!open) return;
    const slot = e.target.closest('.disc-slot');
    if (slot) pickSide(slot.dataset.key);
    else if (!e.target.closest('.dcase-hit')) setOpen(false);
  });

  function pickSide(key, quiet) {
    if (!key) return;
    const changed = key !== side;
    side = key;
    paintList(changed && !quiet);
    const slot = slots.find((s) => s.dataset.key === key);
    if (slot && changed) gsap.fromTo(slot.querySelector('.burn-disc'), { rotation: -90 }, { rotation: 0, duration: 1, ease: 'power3.out' });
  }
  box.querySelector('.side-tabs').addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (!c) return;
    setOpen(true);
    pickSide(c.dataset.key);
  });

  // playback: the chosen disc keeps spinning until you stop it; previews play through
  // the side like a real CD, moving on to the next track when one ends
  const audio = new Audio();
  audio.preload = 'none';
  audio.muted = !sound.on;
  sound.onChange((on) => (audio.muted = !on));
  let playing = null;
  let spin = null;
  let spinning = null;
  function spinDisc(key) {
    const slot = slots.find((sl) => sl.dataset.key === key);
    if (!slot || spinning === slot) return;
    stopSpin();
    spinning = slot;
    slot.classList.add('is-spinning');
    spin = gsap.to(slot.querySelector('.burn-disc'), { rotation: '+=360', duration: 1.8, ease: 'none', repeat: -1 });
    gsap.fromTo(spin, { timeScale: 0.1 }, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
  }
  function stopSpin() {
    if (spin) { const sp = spin; gsap.to(sp, { timeScale: 0, duration: 1.4, ease: 'power2.out', onComplete: () => sp.kill() }); }
    spin = null;
    spinning?.classList.remove('is-spinning');
    spinning = null;
  }
  function mark(i) {
    list.querySelectorAll('.mix-track').forEach((b) => b.classList.toggle('is-playing', +b.dataset.i === i));
  }
  function stop() {
    audio.pause();
    playing = null;
    mark(-1);
    stopSpin();
  }
  function play(i) {
    const s = m.songs[i];
    playing = i;
    setOpen(true);
    if (s.side !== side) pickSide(s.side, true);
    mark(i);
    spinDisc(s.side);
    if (s.found?.preview) {
      audio.src = s.found.preview;
      audio.play().catch(() => {});
    } else {
      audio.pause();
      const url = s.found?.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.artist} ${s.title}`)}`;
      window.open(url, '_blank', 'noopener');
    }
  }
  // when a preview ends, go on to the next track on the same disc that has one
  audio.addEventListener('ended', () => {
    if (playing === null) return;
    const order = songsOf(m.songs[playing].side).map(([, i]) => i);
    const next = order.slice(order.indexOf(playing) + 1).find((i) => m.songs[i].found?.preview);
    if (next !== undefined) play(next);
    else stop();
  });
  player = { stop };

  list.addEventListener('click', (e) => {
    const b = e.target.closest('.mix-track');
    if (!b) return;
    const i = +b.dataset.i;
    if (playing === i) return stop();
    play(i);
  });

  // artwork + previews (saved covers first, live lookup for the rest), once in view
  let looked = false;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || looked) return;
    looked = true;
    m.songs.forEach((s, i) => {
      officialFor('song', s).then((r) => {
        if (!r) return;
        s.found = r;
        const art = list.querySelector(`.mix-track[data-i="${i}"] .art`);
        if (art && r.artwork) art.style.backgroundImage = `url("${r.artwork.replace('600x600bb', '200x200bb')}")`;
        const sub = list.querySelector(`.mix-track[data-i="${i}"] .sub`);
        if (sub) sub.innerHTML = subLine(s);
      }).catch(() => {});
    });
  }, { rootMargin: '300px' }).observe(box);

  // the case tilts a little toward the cursor; the discs catch the light
  const stage = box.querySelector('.burn-stage');
  const qx = gsap.quickTo(caseEl, 'rotationY', { duration: 0.8, ease: 'power3' });
  const qy = gsap.quickTo(caseEl, 'rotationX', { duration: 0.8, ease: 'power3' });
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    qx((fx - 0.5) * 12);
    qy(-((e.clientY - r.top) / r.height - 0.5) * 8);
    box.style.setProperty('--shine', `${fx * 360}deg`);
  });
  stage.addEventListener('pointerleave', () => { qx(0); qy(0); });

  paintList(false);
}
export const stopMixtape = () => player?.stop();

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
  modal.querySelector('.album-count').textContent = `${String(rackOrder().indexOf(current) + 1).padStart(2, '0')} / ${String(music.albums.length).padStart(2, '0')}`;
  info.innerHTML = `
    <p class="year">${esc(a.year)}</p>
    <h3>${esc(a.title)}</h3>
    <p class="artist">${esc(a.artist)}</p>
    ${a.why ? `<p class="why">${esc(a.why)}</p>` : ''}
    ${a.official?.url ? `<p><a class="listen" href="${esc(a.official.url)}" target="_blank" rel="noopener">Listen ↗</a></p>` : ''}
    ${a.tracks.length ? '' : '<p class="tracks-soon">Favourite tracks, coming soon.</p>'}
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
  const order = rackOrder();
  const next = order[(order.indexOf(current) + d + order.length) % order.length];
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
  if (!sound.on) return;
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
  gsap.from(root.querySelector('.guitar-rig'), {
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
