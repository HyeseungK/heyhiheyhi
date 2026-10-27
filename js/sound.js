// One switch for everything on the site that makes a sound (guitar, CD previews).
let on = true;
try { on = localStorage.getItem('sound') !== 'off'; } catch (e) { /* storage blocked */ }
const listeners = new Set();

export const sound = {
  get on() { return on; },
  set(v) {
    on = v;
    try { localStorage.setItem('sound', v ? 'on' : 'off'); } catch (e) { /* ignore */ }
    listeners.forEach((fn) => fn(on));
  },
  toggle() { this.set(!on); },
  onChange(fn) { listeners.add(fn); },
};
