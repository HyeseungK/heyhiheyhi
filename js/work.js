import { work } from './content.js';
import { openModal, closeModal } from './modal.js';

const deckModal = document.querySelector('.deck-modal');

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// [label](frames:new-york) in a career line links to that pile in Frames
const links = (html) => html.replace(/\[([^\]]+)\]\(frames:([\w-]+)\)/g, '<a href="#visual" class="inline-go" data-go="visual" data-open="$2">$1</a>');

export function renderWork(root) {
  // career, grouped (Experience / Education & activities …)
  const groups = [...new Set(work.career.map((c) => c.group || ''))];
  root.querySelector('.career-list').innerHTML = groups
    .map((g) => `${g ? `<li class="career-group">${esc(g)}</li>` : ''}${work.career.filter((c) => (c.group || '') === g).map(careerItem).join('')}`)
    .join('');

  function careerItem(c) {
    return `
      <li class="career-item rv">
        <div class="career-period">${esc(c.period)}</div>
        <div>
          <h3 class="career-org">${esc(c.org)}</h3>
          <p class="career-role">${esc(c.role)}</p>
          <p class="career-text">${links(esc(c.text))}</p>
        </div>
      </li>`;
  }

  root.querySelector('.os-title').textContent = work.projectsTitle || 'Projects';
  // one brick object per project; the image is filled in by main.js once the icons are rendered
  root.querySelector('.os-list').innerHTML = work.projects
    .map(
      (p, i) => `
      <button class="os-obj" role="listitem" data-i="${i}" aria-label="${esc(p.label)}: ${esc(p.about || '')}">
        <img data-icon="${esc(p.icon)}" alt="">
        <span>${esc(p.label)}</span>
        <small>${esc(p.period)}</small>
      </button>`
    )
    .join('');

  const laptop = root.querySelector('.laptop');
  const off = root.querySelector('.screen-off');
  const hint = root.querySelector('.laptop-hint');
  const prompt = root.querySelector('.laptop-prompt');
  const detail = root.querySelector('.os-detail');
  const gsap = window.gsap;
  let tl;

  function open() {
    if (laptop.dataset.open === 'true') return;
    laptop.dataset.open = 'true';
    tl?.kill();
    tl = gsap
      .timeline()
      .to(prompt, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
      .to(laptop, { '--lid': '4deg', duration: 1.25, ease: 'power3.inOut' }, 0.1)
      .to(off, { opacity: 0, duration: 0.5, ease: 'power1.out' }, '-=0.2')
      .from(root.querySelectorAll('.os-obj'), { y: 24, opacity: 0, scale: 0.8, stagger: 0.07, duration: 0.6, ease: 'back.out(1.8)' }, '-=0.25');
    hint.textContent = 'Details under NDA';
  }
  function close() {
    if (laptop.dataset.open !== 'true') return;
    hideDetail(true);
    tl?.kill();
    tl = gsap
      .timeline({ onComplete: () => (laptop.dataset.open = 'false') })
      .to(off, { opacity: 1, duration: 0.25 })
      .to(laptop, { '--lid': '-86deg', duration: 1, ease: 'power3.inOut' })
      .to(prompt, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    hint.textContent = 'Click the laptop to open it';
  }

  const small = () => window.matchMedia('(max-width: 640px)').matches;
  let deck = null;

  function showDetail(i) {
    if (small()) {
      // the laptop screen is too small on phones: open the deck full screen
      const host = deckModal.querySelector('.deck-host');
      deck = makeProject(host, i, () => closeModal(deckModal));
      openModal(deckModal, { onKey: deck.onKey, onClose: () => deck?.destroy() });
      return;
    }
    deck = makeProject(detail, i, () => hideDetail());
    detail.setAttribute('aria-hidden', 'false');
    gsap.to(detail, { x: '0%', duration: 0.55, ease: 'power3.out' });
    document.addEventListener('keydown', deck.onKey);
  }
  function hideDetail(instant) {
    detail.setAttribute('aria-hidden', 'true');
    if (deck) document.removeEventListener('keydown', deck.onKey);
    gsap.to(detail, { x: '100%', duration: instant ? 0 : 0.45, ease: 'power3.in' });
  }

  root.querySelector('.laptop-hit').addEventListener('click', open);
  root.querySelector('.os-close').addEventListener('click', close);
  root.querySelector('.os-list').addEventListener('click', (e) => {
    const obj = e.target.closest('.os-obj');
    if (!obj) return;
    gsap.timeline({ onComplete: () => showDetail(+obj.dataset.i) })
      .to(obj.querySelector('img'), { y: '-18%', rotate: gsap.utils.random([-12, 12]), duration: 0.2, ease: 'power2.out' })
      .to(obj.querySelector('img'), { y: 0, rotate: 0, duration: 0.25, ease: 'power2.in' });
  });

  return { close };
}

// ── one project, full screen on the laptop: the object, its label, a few lines ──
function makeProject(host, start, onBack) {
  const gsap = window.gsap;
  const icons = Object.fromEntries([...document.querySelectorAll('.os-obj img')].map((img) => [img.dataset.icon, img.src]));
  host.innerHTML = `
    <div class="deck-view">
      <div class="deck-bar">
        <button class="deck-back">← All projects</button>
        <span class="proj-count"></span>
        <div class="deck-nav"><button class="prev" aria-label="Previous project">‹</button><button class="next" aria-label="Next project">›</button></div>
      </div>
      <div class="proj"></div>
    </div>`;
  const view = host.querySelector('.proj');
  const prev = host.querySelector('.prev'), next = host.querySelector('.next');
  let idx = start;

  function paint(dir = 0) {
    const p = work.projects[idx];
    view.innerHTML = `
      <img class="proj-obj" src="${icons[p.icon] || ''}" alt="">
      <div class="proj-text">
        <p class="proj-meta">${esc(p.period)}${p.now ? ' <i class="proj-now">In progress</i>' : ''}</p>
        <h3>${esc(p.label)}</h3>
        <p class="proj-about">${esc(p.about)}</p>
        <p class="proj-body">${esc(p.text)}</p>
      </div>`;
    host.querySelector('.proj-count').textContent = `${idx + 1} / ${work.projects.length}`;
    prev.disabled = idx === 0;
    next.disabled = idx === work.projects.length - 1;
    gsap.from(view.querySelector('.proj-obj'), { x: 40 * dir, y: dir ? 0 : 20, rotate: -8 * (dir || 1), opacity: 0, duration: 0.6, ease: 'back.out(1.6)' });
    gsap.from(view.querySelectorAll('.proj-text > *'), { y: 14, opacity: 0, stagger: 0.06, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  }
  const go = (n) => {
    if (n < 0 || n >= work.projects.length) return;
    const dir = n > idx ? 1 : -1;
    idx = n;
    paint(dir);
  };
  paint();
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  host.querySelector('.deck-back').addEventListener('click', onBack);
  let sx = null;
  view.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  view.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(idx + 1);
    if (e.key === 'ArrowLeft') go(idx - 1);
  };
  return { onKey, destroy: () => {} };
}

// scroll animations, created each time the tab is shown
export function initWorkScroll(root) {
  const gsap = window.gsap;
  root.querySelectorAll('.career-item').forEach((el) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });
  gsap.from(root.querySelector('.laptop'), {
    y: 80, scale: 0.9, opacity: 0.4, ease: 'none',
    scrollTrigger: { trigger: root.querySelector('.laptop-section'), start: 'top bottom', end: 'top 30%', scrub: 0.8 },
  });
}
