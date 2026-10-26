// A small ink dot that follows the mouse and says what a click will do.
const LABELS = [
  ['.spread-item, .lb-media', 'view'],
  ['.pin, .place-chip', 'open'],
  ['.globe-canvas', 'spin'],
  ['.sleeve', 'open'],
  ['.guitar', 'strum'],
  ['.ticket', 'tear'],
  ['.muse-btn', 'open'],
  ['.muse', 'flip'],
  ['.bcard', 'flip'],
  ['.laptop-hit', 'open'],
  ['.os-row', 'deck'],
  ['.chapter, .tab-btn, .brand', 'go'],
  ['a', 'open'],
  ['button, [role="button"]', ''],
];

export function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const gsap = window.gsap;
  const el = document.querySelector('.cursor');
  const label = el.querySelector('.cursor-label');
  const qx = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' });
  const qy = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    qx(e.clientX);
    qy(e.clientY);
    el.classList.add('is-on');
    let text;
    const custom = e.target.closest?.('[data-cursor]');
    if (custom) text = custom.dataset.cursor;
    else for (const [sel, t] of LABELS) {
      if (e.target.closest?.(sel)) { text = t; break; }
    }
    el.classList.toggle('is-hidden', text === null);
    el.classList.toggle('is-big', !!text);
    if (text) label.textContent = text;
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  window.addEventListener('pointerdown', () => gsap.to(el, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 }));
}
