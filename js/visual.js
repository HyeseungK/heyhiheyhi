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

const media = (item, cls = 'ph') =>
  item.src
    ? `<img src="${esc(item.src)}" alt="${esc(item.caption)}" loading="lazy" decoding="async" />`
    : `<div class="${cls}" style="background:${esc(item.tone || '#eee')}">${esc(item.caption)}</div>`;

export function renderVisual(root) {
  // moving pictures
  root.querySelector('.video-grid').innerHTML = visual.videos
    .map((v, i) => {
      const p = parseVideo(v.url);
      return `
      <button class="video-card rv" data-i="${i}" ${p ? '' : 'aria-disabled="true"'}>
        <div class="video-screen">
          ${p && p.thumb ? `<img src="${p.thumb}" alt="" loading="lazy" />` : '<div class="noise"></div>'}
          ${p ? '<span class="play"></span>' : '<span class="soon">COMING SOON</span>'}
        </div>
        <div class="video-meta"><span class="t">${esc(v.title)}</span><span class="r">${esc(v.year)}</span></div>
        <div class="video-meta" style="margin-top:2px"><span class="r">${esc(v.role)}</span></div>
      </button>`;
    })
    .join('');

  // film strip
  root.querySelector('.film-track').innerHTML = visual.film
    .map(
      (f, i) => `
      <button class="film-frame" data-i="${i}" aria-label="${esc(f.caption)}">
        <span class="film-no">${String(i + 1).padStart(2, '0')}A ▸</span>
        <div class="inner">${media(f)}</div>
        <span class="film-cap">${esc(f.caption)}</span>
      </button>`
    )
    .join('');

  // digital wall
  root.querySelector('.digital-wall').innerHTML = visual.digital
    .map(
      (d, i) => `
      <button class="wall-item rv" data-i="${i}">
        <div class="frame" style="aspect-ratio:${d.src ? 'auto' : d.ratio || 1}">${media(d)}</div>
        <span class="cap">${esc(d.caption)}</span>
      </button>`
    )
    .join('');

  root.querySelector('.video-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.video-card');
    if (!card) return;
    const p = parseVideo(visual.videos[+card.dataset.i].url);
    if (!p) return;
    const modal = document.querySelector('.video-modal');
    modal.querySelector('.video-frame').innerHTML = `<iframe src="${esc(p.embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    openModal(modal, { onClose: () => (modal.querySelector('.video-frame').innerHTML = '') });
  });
  root.querySelector('.film-track').addEventListener('click', (e) => {
    const f = e.target.closest('.film-frame');
    if (f) openLightbox(visual.film, +f.dataset.i);
  });
  root.querySelector('.digital-wall').addEventListener('click', (e) => {
    const f = e.target.closest('.wall-item');
    if (f) openLightbox(visual.digital, +f.dataset.i);
  });
  root.querySelectorAll('.chip').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    })
  );
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
  lb.querySelector('.lb-cap').innerHTML = `${esc(it.caption)}${it.camera ? ` <em>· ${esc(it.camera)}</em>` : ''} <em>· ${lbIndex + 1}/${lbItems.length}</em>`;
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
  const track = root.querySelector('.film-track');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: root.querySelector('.film-block'),
      pin: root.querySelector('.film-pin'),
      start: 'top top',
      end: () => '+=' + dist(),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });
  root.querySelectorAll('.video-card, .wall-item').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  });
}
