// Shared open/close for modals and the drawer: fade, scroll lock, Esc, focus return.
let current = null;

export function openModal(el, { onClose, onKey, from } = {}) {
  if (current) closeModal(current.el, true);
  const returnFocus = document.activeElement;
  el.hidden = false;
  document.body.classList.add('lock');
  const keyHandler = (e) => {
    if (e.key === 'Escape') closeModal(el);
    else onKey?.(e);
  };
  document.addEventListener('keydown', keyHandler);
  const x = el.querySelector('.modal-x');
  const xHandler = () => closeModal(el);
  x?.addEventListener('click', xHandler);
  current = { el, onClose, keyHandler, xHandler, returnFocus };
  window.gsap.fromTo(el, from || { opacity: 0 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
  x?.focus({ preventScroll: true });
}

export function closeModal(el, instant = false) {
  if (!current || current.el !== el) return;
  const { onClose, keyHandler, xHandler, returnFocus } = current;
  current = null;
  document.removeEventListener('keydown', keyHandler);
  el.querySelector('.modal-x')?.removeEventListener('click', xHandler);
  const done = () => {
    el.hidden = true;
    document.body.classList.remove('lock');
    returnFocus?.focus?.({ preventScroll: true });
  };
  const maybe = onClose?.();
  if (instant) return done();
  Promise.resolve(maybe).then(() => window.gsap.to(el, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done }));
}

export const currentModal = () => current?.el || null;
