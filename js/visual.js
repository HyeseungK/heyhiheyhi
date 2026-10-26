import { visual } from './content.js';
import { openModal, closeModal } from './modal.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function parseVideo(url) {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, thumb: '' };
  return { embed: url, thumb: '' };
}

const pad = (n) => String(n).padStart(2, '0');
const thumb = (p) =>
  p.src
    ? `<img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy" decoding="async" />`
    : `<span class="ph" style="background:${esc(p.tone || '#eee')}"><em>${esc(p.caption)}</em></span>`;

// Frames: an index of series. Each row opens into a horizontal gallery.
export function renderVisual(root) {
  const list = root.querySelector('.series-list');
  const rows = visual.series.map((s, i) => {
    const gallery = s.photos
      .map((p, j) => `<button class="shot" data-j="${j}" style="--r:${p.src ? 'auto' : p.ratio || 1.5}">
          <span class="shot-media">${thumb(p)}</span>
          <span class="shot-cap"><span>${esc(p.caption)}</span><span>${pad(j + 1)}</span></span>
        </button>`)
      .join('');
    return row(i, s.title, `${esc(s.kind)} · ${esc(s.year)}`, `${s.photos.length} frames`, `<div class="gallery" data-s="${i}">${gallery}</div>`);
  });
  const videos = visual.videos
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
  rows.push(row(visual.series.length, 'Moving', 'Video', `${visual.videos.length} films`, `<div class="video-row">${videos}</div>`));
  list.innerHTML = rows.join('');

  function row(i, title, meta, count, body) {
    return `<li class="series" data-i="${i}">
      <button class="series-head" aria-expanded="false">
        <span class="series-no">${pad(i + 1)}</span>
        <span class="series-title">${esc(title)}</span>
        <span class="series-meta">${meta}</span>
        <span class="series-count">${count}</span>
        <span class="series-pm" aria-hidden="true"></span>
      </button>
      <div class="series-body">${body}</div>
    </li>`;
  }

  const gsap = window.gsap;
  function toggle(li, open) {
    const head = li.querySelector('.series-head');
    const body = li.querySelector('.series-body');
    li.classList.toggle('open', open);
    head.setAttribute('aria-expanded', open);
    gsap.to(body, {
      height: open ? 'auto' : 0, duration: open ? 0.8 : 0.5, ease: open ? 'power3.inOut' : 'power3.in',
      onComplete: () => window.ScrollTrigger.refresh(),
    });
    if (open) {
      gsap.fromTo(body.querySelectorAll('.shot, .video-card'), { x: 60, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.05, duration: 0.7, delay: 0.2, ease: 'power3.out' });
      const scroller = body.querySelector('.gallery');
      if (scroller) scroller.scrollLeft = 0;
    }
  }
  list.addEventListener('click', (e) => {
    const head = e.target.closest('.series-head');
    if (head) {
      const li = head.parentElement;
      const open = !li.classList.contains('open');
      list.querySelectorAll('.series.open').forEach((o) => o !== li && toggle(o, false));
      toggle(li, open);
      hidePeek();
      if (open) setTimeout(() => window.scrollTo({ top: li.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }), 350);
      return;
    }
    const shot = e.target.closest('.shot');
    if (shot) {
      const s = visual.series[+shot.closest('.gallery').dataset.s];
      openLightbox(s.photos.map((p) => ({ ...p, camera: `${s.title} · ${s.kind}` })), +shot.dataset.j);
      return;
    }
    const card = e.target.closest('.video-card');
    if (card) {
      const p = parseVideo(visual.videos[+card.dataset.v].url);
      if (!p) return;
      const modal = document.querySelector('.video-modal');
      modal.querySelector('.video-frame').innerHTML = `<iframe src="${esc(p.embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
      openModal(modal, { onClose: () => (modal.querySelector('.video-frame').innerHTML = '') });
    }
  });

  // drag the open gallery sideways with the mouse (touch scrolls natively)
  list.querySelectorAll('.gallery').forEach((g) => {
    let down = null, moved = false;
    g.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { down = { x: e.clientX, left: g.scrollLeft }; moved = false; } });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 4) moved = true;
      g.scrollLeft = down.left - dx;
    });
    window.addEventListener('pointerup', () => (down = null));
    g.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); moved = false; } }, true);
  });

  // a small preview that follows the cursor over closed rows and flips through the series
  const peek = root.querySelector('.series-peek');
  const qx = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3' });
  const qy = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3' });
  let timer = null, peekRow = -1;
  function showPeek(i) {
    if (peekRow === i) return;
    peekRow = i;
    clearInterval(timer);
    const s = visual.series[i];
    if (!s) return hidePeek();
    let k = 0;
    const paint = () => { peek.innerHTML = thumb(s.photos[k++ % s.photos.length]); };
    paint();
    timer = setInterval(paint, 650);
    gsap.to(peek, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  }
  function hidePeek() {
    peekRow = -1;
    clearInterval(timer);
    gsap.to(peek, { autoAlpha: 0, scale: 0.9, duration: 0.25 });
  }
  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    qx(e.clientX + 24);
    qy(e.clientY - 90);
    const li = e.target.closest('.series');
    if (li && !li.classList.contains('open') && e.target.closest('.series-head')) showPeek(+li.dataset.i);
    else hidePeek();
  });
  list.addEventListener('pointerleave', hidePeek);
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
  window.gsap.from(root.querySelectorAll('.series-head'), {
    y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.series-list'), start: 'top 90%' },
  });
}
