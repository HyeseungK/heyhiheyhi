// Seeded generative art (flow fields), after the p5.js / algorithmic-art skills:
// seeded randomness, multi-octave noise, particles tracing a vector field.
// Plain canvas, no p5 dependency.

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D value noise on a seeded lattice, summed over octaves.
function makeNoise(rand) {
  const perm = new Uint8Array(512);
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) { perm[i] = i; vals[i] = rand(); }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const fade = (t) => t * t * (3 - 2 * t);
  const v = (x, y) => vals[perm[(x & 255) + perm[y & 255]]];
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = fade(xf), w = fade(yf);
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
  return (x, y, oct = 3) => {
    let sum = 0, amp = 0.5, f = 1, norm = 0;
    for (let o = 0; o < oct; o++) { sum += noise(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2; }
    return sum / norm;
  };
}

function hexToHsl(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}

export function isDark(hex) {
  return hexToHsl(hex)[2] < 55;
}

// Draws a flow-field cover seeded by `seedText` in the album's colour.
export function drawFlowCover(canvas, seedText, baseHex = '#2f4cff') {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(hashString(seedText));
  const noise = makeNoise(rand);
  const [h, s, l] = hexToHsl(baseHex);
  const dark = l < 55;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  const scale = 1.2 + rand() * 2.4;
  const twist = 2 + rand() * 4;
  const count = 900;
  const steps = 70;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    let x = rand() * size, y = rand() * size;
    const hueShift = (rand() - 0.5) * 40;
    const light = dark ? 60 + rand() * 35 : Math.max(5, l - 25 - rand() * 35);
    ctx.strokeStyle = `hsla(${h + hueShift}, ${Math.min(100, s + 10)}%, ${light}%, ${0.05 + rand() * 0.14})`;
    ctx.lineWidth = 0.5 + rand() * 1.4 * (size / 400);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < steps; k++) {
      const a = noise((x / size) * scale, (y / size) * scale, 3) * Math.PI * twist;
      x += Math.cos(a) * (size / 220);
      y += Math.sin(a) * (size / 220);
      if (x < 0 || y < 0 || x > size || y > size) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return canvas;
}

export function flowCoverURL(seedText, baseHex, size = 480) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return drawFlowCover(c, seedText, baseHex).toDataURL('image/jpeg', 0.86);
}
