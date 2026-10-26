// Page transitions: "pixel" (blocks fill out from the click) and
// "ripple" (a wavy ink drop spreads from the click, then opens again).

const INK = '#0f0f0f';

const canvas = document.querySelector('.fx-canvas');
const labelEl = document.querySelector('.fx-label');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;

function fit() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t) => Math.max(0, Math.min(1, t));

function animate(duration, draw) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now) => {
      const t = clamp01((now - t0) / duration);
      draw(t, (now - t0) / 1000);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

// `label`: a string, or { lead, word } for a small lead-in above a big word
function showLabel(label) {
  const gsap = window.gsap;
  labelEl.replaceChildren();
  const lead = document.createElement('span');
  const word = document.createElement('span');
  lead.className = 'fx-lead';
  word.className = 'fx-word';
  lead.textContent = typeof label === 'object' ? label.lead : '';
  word.textContent = typeof label === 'object' ? label.word : label || '';
  labelEl.append(lead, word);
  gsap.set(labelEl, { opacity: 1, y: 0 });
  gsap.fromTo(lead, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  gsap.fromTo(word, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.12, ease: 'power3.out' });
}
function hideLabel() {
  return window.gsap.to(labelEl, { opacity: 0, y: -16, duration: 0.3, ease: 'power2.in' });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── pixel ───────────────────────────────────────────────────
async function pixel(x, y, label, onCovered) {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const size = Math.round(Math.max(26, Math.min(58, W / 22)));
  const cols = Math.ceil(W / size), rows = Math.ceil(H / size);
  const maxD = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * size + size / 2, cy = r * size + size / 2;
      const d = Math.hypot(cx - x, cy - y) / maxD;
      cells.push({
        x: c * size, y: r * size,
        din: d * 0.62 + Math.random() * 0.2,
        dout: (1 - d) * 0.35 + Math.random() * 0.5,
        accent: Math.random() < 0.05,
      });
    }
  }
  const grow = 0.16;
  const drawCells = (prog, key, invert) => {
    ctx.clearRect(0, 0, W, H);
    for (const cell of cells) {
      let s = clamp01((prog - cell[key]) / grow);
      if (invert) s = 1 - s;
      if (s <= 0) continue;
      const k = easeOut(s);
      const inset = (size * (1 - k)) / 2;
      ctx.fillStyle = cell.accent && k < 1 ? accent : INK;
      ctx.fillRect(cell.x + inset, cell.y + inset, size * k + 0.5, size * k + 0.5);
    }
  };
  await animate(820, (t) => drawCells(t * (0.82 + grow), 'din', false));
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  showLabel(label);
  await onCovered();
  await wait(620);
  hideLabel();
  await animate(760, (t) => drawCells(t * (0.85 + grow), 'dout', true));
  ctx.clearRect(0, 0, W, H);
}

// ── ripple ──────────────────────────────────────────────────
function wavy(cx, cy, r, time, amp) {
  ctx.moveTo(cx + r, cy);
  const steps = 140;
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + amp * (0.6 * Math.sin(a * 5 + time * 6) + 0.4 * Math.sin(a * 9 - time * 8));
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

async function ripple(x, y, label, onCovered) {
  const maxR = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) * 1.15;
  await animate(950, (t, time) => {
    ctx.clearRect(0, 0, W, H);
    const r = easeInOut(t) * maxR;
    const amp = Math.min(26, 6 + r * 0.05) * (1 - t * 0.6);
    // rings travelling ahead of the drop
    for (let k = 1; k <= 3; k++) {
      const rr = r + k * 38 * (1 - t * 0.5) + 10;
      ctx.beginPath();
      wavy(x, y, rr, time + k, amp * 0.6);
      ctx.strokeStyle = `rgba(15,15,15,${0.22 / k})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.beginPath();
    wavy(x, y, Math.max(0, r), time, amp);
    ctx.fillStyle = INK;
    ctx.fill();
  });
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  showLabel(label);
  await onCovered();
  await wait(620);
  hideLabel();
  const ox = W / 2, oy = H / 2;
  const maxR2 = Math.hypot(W, H) * 0.62;
  await animate(1000, (t, time) => {
    ctx.clearRect(0, 0, W, H);
    const r = easeInOut(t) * maxR2;
    const amp = Math.min(30, 8 + r * 0.06) * (1 - t * 0.7);
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    wavy(ox, oy, Math.max(0.1, r), time, amp);
    ctx.fillStyle = INK;
    ctx.fill('evenodd');
    for (let k = 1; k <= 2; k++) {
      ctx.beginPath();
      wavy(ox, oy, Math.max(0.1, r - k * 34), time + k, amp * 0.5);
      ctx.strokeStyle = `rgba(15,15,15,${0.16 / k * (1 - t)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  ctx.clearRect(0, 0, W, H);
}

let busy = false;
export async function transition(type, { x, y, label, onCovered }) {
  if (busy) return;
  busy = true;
  fit();
  document.body.classList.add('is-transitioning');
  canvas.style.pointerEvents = 'auto';
  try {
    if (type === 'ripple') await ripple(x, y, label, onCovered);
    else await pixel(x, y, label, onCovered);
  } finally {
    canvas.style.pointerEvents = 'none';
    document.body.classList.remove('is-transitioning');
    busy = false;
  }
}
export const isBusy = () => busy;
