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

// Frames: a white table of photo piles, one per series. The cover print sits on top;
// hover fans the pile out, click spills the whole series across the screen.

// every project (or place without projects) becomes one series;
// a place with `onePile: true` keeps all its projects together in one pile (Europe)
function buildSeries() {
  const out = [];
  const withSrc = (g) => ({ ...g, photos: g.photos.filter((ph) => ph.src) });
  for (const place of visual.places) {
    const vids = (place.videos || []).filter((v) => parseVideo(v.url));
    if (vids.length) out.push({ id: place.id, title: place.name, place: place.name, kind: place.kind, year: place.year, photos: [], groups: [], videos: vids });
    const groups = (place.projects || (place.photos?.length ? [{ title: '', kind: place.kind, year: place.year, cover: place.cover, photos: place.photos, notes: place.notes }] : []))
      .map(withSrc)
      .filter((g) => g.photos.length);
    if (!groups.length) continue;
    if (place.onePile || !place.projects) {
      out.push({
        id: place.id, title: place.name, place: '', kind: place.kind || groups[0].kind, year: place.year || groups[0].year, cover: place.cover || groups[0].cover,
        photos: groups.flatMap((g) => g.photos), groups: place.projects ? groups : [{ ...groups[0], title: '' }], videos: [],
      });
    } else {
      groups.forEach((g, k) => out.push({ id: `${place.id}-${k}`, title: g.title, place: place.name, kind: g.kind, year: g.year, credit: g.credit, cover: g.cover, photos: g.photos, groups: [{ ...g, title: '' }], videos: [] }));
    }
  }
  return out;
}

export function renderVisual(root) {
  const gsap = window.gsap;
  const series = buildSeries();
  const table = root.querySelector('.photo-table');

  table.innerHTML = series
    .map((s, i) => {
      const covers = s.videos.length
        ? [{ src: parseVideo(s.videos[0].url).thumb, ratio: 16 / 9, video: true }]
        : (() => {
            // `cover` (a photo's src) goes on top, then the next two
            const top = s.photos.find((ph) => ph.src === s.cover) || s.photos[0];
            return [top, ...s.photos.filter((ph) => ph !== top).slice(0, 2)];
          })();
      const prints = covers
        .map((c, k) => `<span class="print" style="--r:${covers[0].ratio || 1.5};--k:${k}">${c.src ? `<img src="${esc(c.src)}" alt="" loading="lazy" decoding="async" />` : ''}${c.video ? '<span class="play"></span>' : ''}</span>`)
        .reverse() // first photo ends up on top
        .join('');
      const count = s.videos.length ? `${s.videos.length} film${s.videos.length > 1 ? 's' : ''}` : `${s.photos.length}`;
      return `<button class="stack" data-i="${i}" style="--seed:${(i * 37) % 7 - 3}" aria-label="${esc(s.title)}: open">
        <span class="pile">${prints}</span>
        <span class="stack-label"><b>${esc(s.title)}</b><span>${esc([s.place, s.year, count].filter(Boolean).join(' · '))}</span></span>
      </button>`;
    })
    .join('');

  // each pile gets its own slight disorder
  table.querySelectorAll('.stack').forEach((st) => {
    const seed = +st.style.getPropertyValue('--seed');
    const prints = [...st.querySelectorAll('.print')].reverse(); // top first
    const rest = (k) => ({ rotation: k === 0 ? 0 : (k % 2 ? 2.2 : -2.6) + seed * 0.2, x: k * (k % 2 ? 3 : -3), y: k * 2 });
    prints.forEach((p, k) => gsap.set(p, rest(k)));
    st.addEventListener('pointerenter', () => {
      prints.forEach((p, k) => gsap.to(p, { rotation: [0, -4, 4][k] ?? 0, x: [0, -14, 14][k] ?? 0, y: [-6, 0, 0][k] ?? 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }));
    });
    st.addEventListener('pointerleave', () => {
      prints.forEach((p, k) => gsap.to(p, { ...rest(k), duration: 0.6, ease: 'power3.out', overwrite: 'auto' }));
    });
  });
  table.addEventListener('click', (e) => {
    const st = e.target.closest('.stack');
    if (st) openSeries(+st.dataset.i);
  });

  // ── the spread ──
  const spread = document.querySelector('.spread');
  const grid = spread.querySelector('.spread-grid');
  let current = null;

  // where the photos fly from / back to: the top print of the pile
  function origin(i) {
    const top = table.querySelector(`.stack[data-i="${i}"] .print:last-child`) || table.querySelector(`.stack[data-i="${i}"]`);
    const r = top.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // offsets that put each photo back onto the pile
  function fly(items, from) {
    return items.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: from.x - (r.left + r.width / 2), y: from.y - (r.top + r.height / 2), rotation: gsap.utils.random(-35, 35) };
    });
  }

  function openSeries(i) {
    const place = (current = series[i]);
    spread.querySelector('.spread-title').textContent = place.title;
    const total = place.photos.length;
    spread.querySelector('.spread-meta').textContent = [place.place, place.kind, place.year, total && `${total} frames`, place.credit].filter(Boolean).join(' · ');
    // films play right in the spread
    const film = (v) => {
      const pv = parseVideo(v.url);
      return `<section class="project"><div class="project-head"><h4>${esc(v.title)}</h4><p>${esc(v.role || '')}</p></div>
          <div class="spread-film"><iframe src="${esc(pv.embed.replace('autoplay=1', 'autoplay=0'))}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(v.title)}" loading="lazy"></iframe></div></section>`;
    };
    const films = place.videos.map(film).join('');
    const groups = place.groups;
    let j = 0;
    grid.innerHTML = films + groups
      .map((g) => {
        const photoHTML = g.photos.map((p) => `<button class="spread-item${(p.ratio || 1) > 1.3 ? ' wide' : ''}" data-j="${j++}" style="--r:${p.ratio || 1.5}">
          <img src="${esc(p.src)}" alt="${esc(p.caption)}" decoding="async" />
          <span class="spread-cap">${esc(p.caption)}${p.year ? ` · ${esc(p.year)}` : ''}</span>
        </button>`);
        // diary scraps slot in after every few photos
        const noteHTML = (g.notes || []).map((n, k) => `<div class="diary" style="--tilt:${k % 2 ? 2.5 : -2}deg">
          <span class="tape" aria-hidden="true"></span>
          ${n.src ? `<img src="${esc(n.src)}" alt="Diary, ${esc(n.date || place.title)}" decoding="async" />` : `<p class="diary-text">${esc(n.text || '')}</p>`}
          ${n.date ? `<span class="diary-date">${esc(n.date)}</span>` : ''}
        </div>`);
        const mixed = [];
        photoHTML.forEach((h, k) => {
          mixed.push(h);
          if ((k + 1) % 3 === 2 && noteHTML.length) mixed.push(noteHTML.shift());
        });
        const head = g.title ? `<div class="project-head"><h4>${esc(g.title)}</h4><p>${esc([g.kind, g.year].filter(Boolean).join(' · '))}</p></div>` : '';
        // a project's own films (e.g. the song a photo became the cover of) follow its photos
        const own = (g.videos || []).filter((v) => parseVideo(v.url)).map(film).join('');
        return `<section class="project">${head}<div class="project-grid">${[...mixed, ...noteHTML].join('')}</div></section>${own}`;
      })
      .join('');
    place.allPhotos = place.photos.map((p) => ({ ...p, camera: [place.title, place.kind, p.year].filter(Boolean).join(' · ') }));
    const id = i;
    const from = origin(id);
    openModal(spread, {
      from: { opacity: 1 },
      onClose: () => {
        const items = [...grid.querySelectorAll('.project-head, .spread-item, .diary, .spread-film')].reverse();
        grid.querySelectorAll('.spread-film iframe').forEach((f) => f.remove()); // stop the film
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
    const items = [...grid.querySelectorAll('.project-head, .spread-item, .diary, .spread-film')];
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

  renderMuses(root);

  spread.querySelector('.spread-back').addEventListener('click', () => closeModal(spread));
  grid.addEventListener('click', (e) => {
    const it = e.target.closest('.spread-item');
    if (it && current) openLightbox(current.allPhotos, +it.dataset.j);
  });

  // open a pile from elsewhere on the site, by place id (e.g. 'new-york')
  return {
    open(id) {
      const i = series.findIndex((s) => s.id === id || s.id.startsWith(`${id}-`));
      const st = table.querySelector(`.stack[data-i="${i}"]`);
      if (!st) return;
      st.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(() => openSeries(i), 650);
    },
  };
}

// ── Inspiration: a moodboard of people and work I love ────────────
const RATIO = { Work: '16 / 9', Video: '16 / 9', 'Other artwork': '1 / 1' };
// a card can have one type or several (e.g. ['Photographer', 'Director'])
const typesOf = (m) => [].concat(m.type || []);
const isFilm = (url) => /youtu\.be\/|youtube\.com\/(watch|embed|shorts)|vimeo\.com\/(video\/)?\d/.test(url || ''); // a single film, not a channel
// Korean runs get their own upright font (the serif italic has no Hangul)
const ko = (html) => html.replace(/[\u3131-\u318E\uAC00-\uD7A3]+(?:\s+[\u3131-\u318E\uAC00-\uD7A3]+)*/g, '<span class="ko">$&</span>');

function playVideo(url) {
  const p = parseVideo(url);
  if (!p) return false;
  const modal = document.querySelector('.video-modal');
  modal.querySelector('.video-frame').innerHTML = `<iframe src="${esc(p.embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
  openModal(modal, { onClose: () => (modal.querySelector('.video-frame').innerHTML = '') });
  return true;
}

function renderMuses(root) {
  const gsap = window.gsap;
  const muses = visual.muses || [];
  const board = root.querySelector('.muse-board');
  // chips from visual.museTypes (only the ones that have cards), then any other types used
  const listed = (visual.museTypes || []).filter((t) => muses.some((m) => typesOf(m).includes(t.type)));
  const extra = [...new Set(muses.flatMap(typesOf))].filter((t) => !listed.some((l) => l.type === t)).map((t) => ({ type: t, label: t }));
  root.querySelector('.muse-filter').innerHTML = [{ type: 'All', label: 'All' }, ...listed, ...extra]
    .map((t, i) => `<button class="chip${i ? '' : ' is-on'}" data-t="${esc(t.type)}">${esc(t.label)}</button>`)
    .join('');

  board.innerHTML = muses
    .map((m, i) => {
      const imgs = m.works?.length ? m.works : m.image ? [m.image] : [];
      // `videos` ([{ title, url }]) for a card with several films, or a single film in `url`
      const films = (m.videos || (isFilm(m.url) ? [{ title: '', url: m.url }] : [])).filter((v) => isFilm(v.url));
      const video = films.length && parseVideo(films[0].url);
      const thumb = !imgs.length && video?.thumb ? video.thumb : '';
      const dark = /^#[0-3]/.test(m.tone || '');
      const media = imgs.length
        ? `<span class="muse-media${imgs.length > 1 ? ' collage' : ''}">${imgs.slice(0, 3).map((src) => `<img src="${esc(src)}" alt="" loading="lazy" />`).join('')}</span>`
        : thumb
          ? `<span class="muse-media"><img src="${esc(thumb)}" alt="" loading="lazy" /><span class="play"></span></span>`
          : `<span class="muse-media ph${dark ? ' dark' : ''}" style="background:${esc(m.tone || '#eee')}">${video ? '<span class="play"></span>' : `<em>${ko(esc(m.title.split(' ')[0]))}</em>`}</span>`;
      const tilt = ((i * 37) % 7) - 3;
      const handle = (m.instagram || '').replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
      const ig = handle ? `https://www.instagram.com/${encodeURIComponent(handle)}/` : '';
      return `<div class="muse" data-type="${esc(typesOf(m).join('|'))}" role="button" tabindex="0" aria-pressed="false" style="--tilt:${tilt}deg;--ratio:${(video && !imgs.length ? '16 / 9' : RATIO[typesOf(m)[0]]) || '4 / 5'}" aria-label="${esc(m.title)}. Press to read why">
        <span class="tape" aria-hidden="true"></span>
        <span class="muse-inner">
          <span class="muse-front">
            ${media}
            <span class="muse-text"><span class="muse-type">${esc(typesOf(m).join(' · '))}</span><b>${esc(m.title)}</b><span class="muse-credit">${ko(esc(m.credit || ''))}</span>${ig ? `<a class="muse-ig" href="${ig}" target="_blank" rel="noopener">@${esc(handle)}</a>` : ''}</span>
          </span>
          <span class="muse-back">
            <span class="muse-type">${esc(typesOf(m).join(' · '))}</span>
            <b>${esc(m.title)}</b>
            ${m.why ? `<span class="muse-why">“${ko(esc(m.why))}”</span>` : ''}
            <span class="muse-actions">
              ${films.map((v, k) => `<button class="muse-btn" data-play="${i}" data-k="${k}">▶ ${esc(v.title || 'Watch')}</button>`).join('')}
              ${m.url && !video ? `<a class="muse-btn" href="${esc(m.url)}" target="_blank" rel="noopener">Open ↗</a>` : ''}
              ${ig ? `<a class="muse-btn" href="${ig}" target="_blank" rel="noopener">Instagram ↗</a>` : ''}
            </span>
          </span>
        </span>
      </div>`;
    })
    .join('');

  const flip = (card) => {
    const on = !card.classList.contains('flipped');
    card.classList.toggle('flipped', on);
    card.setAttribute('aria-pressed', on);
  };
  board.addEventListener('click', (e) => {
    const play = e.target.closest('[data-play]');
    if (play) {
      const m = muses[+play.dataset.play];
      return playVideo((m.videos || [{ url: m.url }])[+play.dataset.k || 0].url);
    }
    if (e.target.closest('a')) return;
    const card = e.target.closest('.muse');
    if (card) flip(card);
  });
  board.addEventListener('keydown', (e) => {
    const card = e.target.closest('.muse');
    if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flip(card); }
  });

  root.querySelector('.muse-filter').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    root.querySelectorAll('.muse-filter .chip').forEach((c) => c.classList.toggle('is-on', c === chip));
    const shown = [];
    board.querySelectorAll('.muse').forEach((m) => {
      m.hidden = chip.dataset.t !== 'All' && !m.dataset.type.split('|').includes(chip.dataset.t);
      if (!m.hidden) shown.push(m);
    });
    gsap.fromTo(shown, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    window.ScrollTrigger.refresh();
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
  gsap.from(root.querySelectorAll('.stack'), {
    y: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.photo-table'), start: 'top 90%' },
  });
  gsap.from(root.querySelectorAll('.muse'), {
    y: 50, opacity: 0, stagger: 0.07, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: root.querySelector('.muse-board'), start: 'top 85%' },
  });
}
