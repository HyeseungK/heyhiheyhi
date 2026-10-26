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

  // film contact sheet + canister filter
  renderSheet(root);
  window.matchMedia('(max-width: 640px)').addEventListener('change', () => renderSheet(root));
  const stockCount = (k) => visual.film.filter((f) => f.stock === k).length;
  root.querySelector('.canisters').innerHTML = Object.entries(visual.stocks)
    .map(([k, c]) => `<button class="can" data-stock="${esc(k)}" aria-pressed="false"><span class="can-ico" style="--c:${esc(c)}"><i></i></span>${esc(k)} <span class="n">${stockCount(k)}</span></button>`)
    .join('');
  root.querySelector('.canisters').addEventListener('click', (e) => {
    const b = e.target.closest('.can');
    if (!b) return;
    const on = !b.classList.contains('is-on');
    root.querySelectorAll('.can').forEach((x) => { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); });
    if (on) { b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); }
    filterStock = on ? b.dataset.stock : null;
    applyFilter(root);
  });
  setupLoupe(root);

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
  root.querySelector('.sheet').addEventListener('click', (e) => {
    const f = e.target.closest('.frame');
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

// ── contact sheet ───────────────────────────────────────────
let filterStock = null;
const GREASE = 'M14 55 C 8 20, 86 6, 93 44 C 99 84, 22 97, 8 62 C 4 46, 18 27, 38 22';

function renderSheet(root) {
  const per = window.matchMedia('(max-width: 640px)').matches ? 3 : 6;
  const rows = [];
  for (let i = 0; i < visual.film.length; i += per) rows.push(visual.film.slice(i, i + per).map((f, j) => [f, i + j]));
  root.querySelector('.sheet').innerHTML =
    `<div class="sheet-head"><span>HELEN · ROLL 01</span><span>${visual.film.length} EXP</span></div>` +
    rows
      .map(
        (row) => `<div class="strip" style="--per:${per}">${row
          .map(
            ([f, i]) => `<button class="frame" data-i="${i}" data-stock="${esc(f.stock)}" aria-label="${esc(f.caption)}">
              <span class="fno">${i + 1} ▸ ${i + 1}A</span>
              ${f.src ? `<img src="${esc(f.src)}" alt="" loading="lazy" />` : `<div class="ph" style="background:${esc(f.tone)}">${esc(f.caption)}</div>`}
              ${f.pick ? `<svg class="grease" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${GREASE}" pathLength="1" /></svg>` : ''}
            </button>`
          )
          .join('')}</div>`
      )
      .join('');
  applyFilter(root);
}

function applyFilter(root) {
  root.querySelectorAll('.sheet .frame').forEach((f) => f.classList.toggle('dim', !!filterStock && f.dataset.stock !== filterStock));
  syncLoupe?.();
}

let syncLoupe = null;
function setupLoupe(root) {
  const wrap = root.querySelector('.sheet-wrap');
  const sheet = root.querySelector('.sheet');
  const loupe = root.querySelector('.loupe');
  const inner = root.querySelector('.loupe-inner');
  const Z = 2.6, R = 110;
  let dirty = true;
  syncLoupe = () => (dirty = true);
  window.addEventListener('resize', syncLoupe);
  wrap.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (dirty) {
      const clone = sheet.cloneNode(true);
      clone.style.width = sheet.offsetWidth + 'px';
      inner.replaceChildren(clone);
      dirty = false;
    }
    const r = sheet.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    loupe.style.transform = `translate(${x}px, ${y}px)`;
    inner.style.transform = `translate(${R - x * Z}px, ${R - y * Z}px) scale(${Z})`;
    loupe.classList.add('on');
  });
  wrap.addEventListener('pointerleave', () => loupe.classList.remove('on'));
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
  gsap.from(root.querySelectorAll('.strip'), {
    y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.sheet'), start: 'top 85%' },
  });
  // grease-pencil circles draw themselves once the sheet is in view
  gsap.fromTo(root.querySelectorAll('.grease path'), { strokeDasharray: 1, strokeDashoffset: 1 }, {
    strokeDashoffset: 0, duration: 0.9, stagger: 0.25, ease: 'power2.inOut',
    scrollTrigger: { trigger: root.querySelector('.sheet'), start: 'top 60%' },
  });
  root.querySelectorAll('.video-card, .wall-item').forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  });
}
