import { visual } from './content.js';
import { openModal, closeModal } from './modal.js';
import { createGlobe } from './globe.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function parseVideo(url) {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, thumb: '' };
  return { embed: url, thumb: '' };
}

// Frames: a globe of places. Pick one and its photos spill out of the pin.
let globe = null;
export const globeLoop = { start: () => globe?.start(), stop: () => globe?.stop() };

export function renderVisual(root) {
  const gsap = window.gsap;
  const places = visual.places;

  globe = createGlobe(root.querySelector('.globe-canvas'), root.querySelector('.pin-layer'), places, {
    onPick: (id) => openPlace(id),
  });
  if (!globe) root.querySelector('.globe-wrap').hidden = true;

  root.querySelector('.place-chips').innerHTML = places
    .map((p) => `<button class="place-chip" data-id="${esc(p.id)}">${esc(p.name)} <span>${p.photos.length}</span></button>`)
    .join('');
  root.querySelector('.place-chips').addEventListener('click', (e) => {
    const b = e.target.closest('.place-chip');
    if (b) openPlace(b.dataset.id);
  });

  root.querySelector('.video-row').innerHTML = visual.videos
    .map((v, i) => {
      const p = parseVideo(v.url);
      return `<button class="video-card" data-v="${i}" ${p ? '' : 'aria-disabled="true"'}>
        <span class="video-screen">
          ${p && p.thumb ? `<img src="${p.thumb}" alt="" loading="lazy" />` : '<span class="noise"></span>'}
          ${p ? '<span class="play"></span>' : '<span class="soon">COMING SOON</span>'}
        </span>
        <span class="video-meta"><span class="t">${esc(v.title)}</span><span class="r">${esc(v.year)} · ${esc(v.role)}</span></span>
      </button>`;
    })
    .join('');
  root.querySelector('.video-row').addEventListener('click', (e) => {
    const card = e.target.closest('.video-card');
    const p = card && parseVideo(visual.videos[+card.dataset.v].url);
    if (!p) return;
    const modal = document.querySelector('.video-modal');
    modal.querySelector('.video-frame').innerHTML = `<iframe src="${esc(p.embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    openModal(modal, { onClose: () => (modal.querySelector('.video-frame').innerHTML = '') });
  });

  // ── the spread ──
  const spread = document.querySelector('.spread');
  const grid = spread.querySelector('.spread-grid');
  let place = null;

  // where the photos fly from / back to: the pin if visible, else the chip
  function origin(id) {
    const r = globe?.pinRect(id);
    const pin = root.querySelector(`.pin[data-id="${id}"]`);
    if (r && r.width && pin && +pin.style.opacity > 0.5) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const chip = root.querySelector(`.place-chip[data-id="${id}"]`).getBoundingClientRect();
    return { x: chip.left + chip.width / 2, y: chip.top + chip.height / 2 };
  }

  // offsets that put each photo back inside the pin
  function fly(items, from) {
    return items.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: from.x - (r.left + r.width / 2), y: from.y - (r.top + r.height / 2), rotation: gsap.utils.random(-35, 35) };
    });
  }

  async function openPlace(id) {
    place = places.find((p) => p.id === id);
    if (!place) return;
    await globe?.focus(id);
    spread.querySelector('.spread-title').textContent = place.name;
    spread.querySelector('.spread-meta').textContent = `${place.kind} · ${place.year} · ${place.photos.length} frames`;
    grid.innerHTML = place.photos
      .map((p, j) => `<button class="spread-item${(p.ratio || 1) > 1.3 ? ' wide' : ''}" data-j="${j}" style="--r:${p.ratio || 1.5}">
          ${p.src ? `<img src="${esc(p.src)}" alt="${esc(p.caption)}" decoding="async" />` : `<span class="ph" style="background:${esc(p.tone || '#eee')}"><em>${esc(p.caption)}</em></span>`}
          <span class="spread-cap">${esc(p.caption)}</span>
        </button>`)
      .join('');
    const from = origin(id);
    openModal(spread, {
      from: { opacity: 1 },
      onClose: () => {
        const items = [...grid.children].reverse();
        const back = origin(id);
        const targets = fly(items, back);
        return new Promise((resolve) => {
          gsap.to(spread.querySelector('.spread-head'), { opacity: 0, duration: 0.25 });
          gsap.to(items, {
            x: (i) => targets[i].x, y: (i) => targets[i].y, scale: 0.06, rotation: (i) => targets[i].rotation, opacity: 0,
            duration: 0.55, ease: 'power3.in', stagger: 0.025,
            onComplete: () => { gsap.set(spread.querySelector('.spread-head'), { opacity: 1 }); resolve(); },
          });
          gsap.to(spread, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.5, delay: 0.2 });
        });
      },
    });
    spread.scrollTop = 0;
    const items = [...grid.children];
    const starts = fly(items, from);
    gsap.fromTo(spread, { backgroundColor: 'rgba(255,255,255,0)' }, { backgroundColor: 'rgba(255,255,255,1)', duration: 0.5 });
    gsap.fromTo(spread.querySelector('.spread-head'), { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power3.out' });
    gsap.fromTo(items, {
      x: (i) => starts[i].x, y: (i) => starts[i].y, scale: 0.06, rotation: (i) => starts[i].rotation, opacity: 0,
    }, {
      x: 0, y: 0, scale: 1, rotation: 0, opacity: 1,
      duration: 1, ease: 'power4.out', stagger: 0.05, clearProps: 'transform',
    });
  }

  spread.querySelector('.spread-back').addEventListener('click', () => closeModal(spread));
  grid.addEventListener('click', (e) => {
    const it = e.target.closest('.spread-item');
    if (it && place) openLightbox(place.photos.map((p) => ({ ...p, camera: `${place.name} · ${place.kind}` })), +it.dataset.j);
  });
}

// ── lightbox ────────────────────────────────────────────────
const lb = document.querySelector('.lightbox');
let lbItems = [], lbIndex = 0;

function paintLightbox(dir = 0) {
  const it = lbItems[lbIndex];
  const m = lb.querySelector('.lb-media');
  m.innerHTML = it.src
    ? `<img src="${esc(it.src)}" alt="${esc(it.caption)}" />`
    : `<div class="ph" style="background:${esc(it.tone || '#eee')};aspect-ratio:${it.ratio || 1.5}">${esc(it.caption)}</div>`;
  lb.querySelector('.lb-cap').innerHTML = `${esc(it.caption)}${it.camera ? ` <em>· ${esc(it.camera)}${it.stock ? ` · ${esc(it.stock)}` : ''}</em>` : ''} <em>· ${lbIndex + 1}/${lbItems.length}</em>`;
  if (dir) window.gsap.fromTo(m, { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
}
function step(d) {
  lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
  paintLightbox(d);
}
function openLightbox(items, i) {
  lbItems = items;
  lbIndex = i;
  paintLightbox();
  openModal(lb, {
    onKey: (e) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    },
  });
}
lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
lb.querySelector('.lb-next').addEventListener('click', () => step(1));
let sx = null;
lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
lb.addEventListener('touchend', (e) => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  sx = null;
});
lb.addEventListener('click', (e) => {
  if (e.target === lb) closeModal(lb);
});

// ── scroll animations ───────────────────────────────────────
export function initVisualScroll(root) {
  const gsap = window.gsap;
  gsap.from(root.querySelector('.globe-wrap'), { scale: 0.85, opacity: 0, duration: 1.2, ease: 'power3.out' });
  gsap.from(root.querySelectorAll('.place-chip'), { y: 14, opacity: 0, stagger: 0.06, duration: 0.6, delay: 0.4, ease: 'power3.out' });
  window.ScrollTrigger.create({
    trigger: root.querySelector('.globe-wrap'), start: 'top bottom', end: 'bottom top',
    onToggle: (self) => (self.isActive ? globeLoop.start() : globeLoop.stop()),
  });
}
