import { work } from './content.js';
import { openModal, closeModal } from './modal.js';

const deckModal = document.querySelector('.deck-modal');

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderWork(root) {
  root.querySelector('.career-list').innerHTML = work.career
    .map(
      (c) => `
      <li class="career-item rv">
        <div class="career-period">${esc(c.period)}</div>
        <div>
          <h3 class="career-org">${esc(c.org)}</h3>
          <p class="career-role">${esc(c.role)}</p>
          <p class="career-text">${esc(c.text)}</p>
        </div>
      </li>`
    )
    .join('');

  root.querySelector('.os-title').textContent = `projects — ${work.projects.length} items`;
  root.querySelector('.os-list').innerHTML = work.projects
    .map(
      (p, i) => `
      <button class="os-row" role="listitem" data-i="${i}">
        <span class="y">${esc(p.year)}</span>
        <span><span class="t">${esc(p.title)}</span><span class="c">${esc(p.client)}</span></span>
        <span class="arrow">→</span>
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
      .from(root.querySelectorAll('.os-row'), { y: 14, opacity: 0, stagger: 0.05, duration: 0.45, ease: 'power2.out' }, '-=0.25');
    hint.textContent = 'Scroll inside the screen, click a project';
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
    const p = work.projects[i];
    if (small()) {
      // the laptop screen is too small on phones: open the deck full screen
      const host = deckModal.querySelector('.deck-host');
      deck = makeDeck(host, p, () => closeModal(deckModal));
      openModal(deckModal, { onKey: deck.onKey, onClose: () => deck?.destroy() });
      return;
    }
    deck = makeDeck(detail, p, () => hideDetail());
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
    const row = e.target.closest('.os-row');
    if (row) showDetail(+row.dataset.i);
  });

  return { close };
}

// ── project deck: Exec summary → Issue tree → Approach → Impact ──
function slides(p) {
  const head = (kicker) => `<p class="slide-kicker">${kicker}</p>`;
  return [
    `${head('Executive summary')}
     <p class="meta">${esc(p.year)} · ${esc(p.client)} · ${p.tags.map(esc).join(' / ')}</p>
     <h3>${esc(p.title)}</h3>
     <p class="lead">${esc(p.summary)}</p>`,
    `${head('Issue tree')}
     <div class="tree">
       <div class="tree-q">${esc(p.issueTree.question)}</div>
       <div class="tree-branches">
         ${p.issueTree.branches.map((b) => `<div class="tree-b"><b>${esc(b.label)}</b>${b.items.map((it) => `<span>${esc(it)}</span>`).join('')}</div>`).join('')}
       </div>
     </div>`,
    `${head('Approach')}
     <h3>How we worked</h3>
     <ol class="steps">${p.approach.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>`,
    `${head('Impact')}
     <h3>What changed</h3>
     <div class="kpis">${p.impact.map((k) => `<div class="kpi"><b>${esc(k.value)}</b><span>${esc(k.label)}</span></div>`).join('')}</div>`,
  ];
}

function makeDeck(host, p, onBack) {
  const gsap = window.gsap;
  const list = slides(p);
  host.innerHTML = `
    <div class="deck-view">
      <div class="deck-bar">
        <button class="deck-back">← All projects</button>
        <div class="deck-steps">${list.map((_, i) => `<button aria-label="Slide ${i + 1}"><i></i></button>`).join('')}</div>
        <div class="deck-nav"><button class="prev" aria-label="Previous slide">‹</button><button class="next" aria-label="Next slide">›</button></div>
      </div>
      <div class="deck-stage">${list.map((html, i) => `<section class="slide" aria-label="Slide ${i + 1} of ${list.length}">${html}</section>`).join('')}</div>
    </div>`;
  const els = [...host.querySelectorAll('.slide')];
  const steps = [...host.querySelectorAll('.deck-steps button')];
  const prev = host.querySelector('.prev'), next = host.querySelector('.next');
  let idx = 0;
  gsap.set(els, { xPercent: 100, autoAlpha: 0 });
  gsap.set(els[0], { xPercent: 0, autoAlpha: 1 });

  function go(n) {
    if (n < 0 || n >= els.length || n === idx) return;
    const dir = n > idx ? 1 : -1;
    gsap.killTweensOf(els);
    els.forEach((el, i) => i !== idx && i !== n && gsap.set(el, { autoAlpha: 0 }));
    gsap.to(els[idx], { xPercent: -30 * dir, autoAlpha: 0, duration: 0.5, ease: 'power3.inOut' });
    gsap.fromTo(els[n], { xPercent: 60 * dir, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
    gsap.from(els[n].querySelectorAll('.tree-b, .steps li, .kpi'), { y: 16, opacity: 0, stagger: 0.08, duration: 0.5, delay: 0.2, ease: 'power2.out' });
    idx = n;
    paint();
  }
  function paint() {
    steps.forEach((s, i) => s.classList.toggle('on', i <= idx));
    prev.disabled = idx === 0;
    next.disabled = idx === els.length - 1;
  }
  paint();
  steps.forEach((b, i) => b.addEventListener('click', () => go(i)));
  // click the left / right part of a slide to move; the cursor says which way
  const stage = host.querySelector('.deck-stage');
  const side = (e) => (e.clientX - stage.getBoundingClientRect().left) / stage.offsetWidth > 0.35 ? 1 : -1;
  stage.addEventListener('pointermove', (e) => {
    const d = side(e);
    stage.dataset.cursor = d > 0 ? (idx < els.length - 1 ? 'next →' : '') : idx > 0 ? '← prev' : '';
  });
  stage.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;
    go(idx + side(e));
    stage.dispatchEvent(new PointerEvent('pointermove', { clientX: e.clientX, clientY: e.clientY }));
  });
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  host.querySelector('.deck-back').addEventListener('click', onBack);
  let sx = null;
  stage.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
  stage.addEventListener('touchend', (e) => {
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
