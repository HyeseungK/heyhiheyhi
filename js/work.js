import { work } from './content.js';

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

  function showDetail(i) {
    const p = work.projects[i];
    detail.innerHTML = `
      <button class="os-back">← All projects</button>
      <p class="meta">${esc(p.year)} · ${esc(p.client)}</p>
      <h3>${esc(p.title)}</h3>
      <div class="os-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      <dl>
        <dt>Challenge</dt><dd>${esc(p.challenge)}</dd>
        <dt>Approach</dt><dd>${esc(p.approach)}</dd>
        <dt>Impact</dt><dd>${esc(p.impact)}</dd>
      </dl>`;
    detail.scrollTop = 0;
    detail.setAttribute('aria-hidden', 'false');
    gsap.to(detail, { x: '0%', duration: 0.55, ease: 'power3.out' });
    detail.querySelector('.os-back').focus({ preventScroll: true });
  }
  function hideDetail(instant) {
    detail.setAttribute('aria-hidden', 'true');
    gsap.to(detail, { x: '100%', duration: instant ? 0 : 0.45, ease: 'power3.in' });
  }

  root.querySelector('.laptop-hit').addEventListener('click', open);
  root.querySelector('.os-close').addEventListener('click', close);
  root.querySelector('.os-list').addEventListener('click', (e) => {
    const row = e.target.closest('.os-row');
    if (row) showDetail(+row.dataset.i);
  });
  detail.addEventListener('click', (e) => {
    if (e.target.closest('.os-back')) hideDetail();
  });

  return { close };
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
