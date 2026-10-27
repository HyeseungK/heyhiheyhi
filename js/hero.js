// Home hero: the four name-words as one particle cloud that morphs on scroll.
import * as THREE from 'three';
import { mulberry32 } from './gen.js';

const vertex = /* glsl */ `
  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute vec3 aDir;
  attribute float aRand;

  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform vec3 uRipple;
  uniform float uFade;
  uniform vec3 uBurst;

  varying float vAlpha;
  varying float vSpark;
  varying float vRand;

  float stage(float p, float i, float d) {
    return smoothstep(i + d, i + d + 0.62, p);
  }

  // layered sine "noise": cheap stand-in for multi-octave flow
  vec2 flow(vec2 p, float t, float r) {
    vec2 f = vec2(0.0);
    float amp = 1.0;
    float freq = 0.9;
    for (int i = 0; i < 3; i++) {
      f += vec2(sin(p.y * freq + t * 0.7 + r * 6.2831), cos(p.x * freq - t * 0.6 + r * 4.0)) * amp;
      amp *= 0.5;
      freq *= 2.1;
    }
    return f;
  }

  void main() {
    float d = aRand * 0.36;
    float t1 = stage(uProgress, 0.0, d);
    float t2 = stage(uProgress, 1.0, d);
    float t3 = stage(uProgress, 2.0, d);
    float t4 = stage(uProgress, 3.0, d);

    vec3 pos = mix(aP0, aP1, t1);
    pos = mix(pos, aP2, t2);
    pos = mix(pos, aP3, t3);
    pos = mix(pos, aP4, t4);

    // in-between: particles leave the letters and ride a flow field
    float travel = sin(t1 * 3.14159) + sin(t2 * 3.14159) + sin(t3 * 3.14159) + sin(t4 * 3.14159);
    pos.xy += flow(pos.xy, uTime, aRand) * 0.22 * travel;
    pos += aDir * travel * 0.55;

    // idle breathing
    pos.xy += flow(pos.xy * 1.7, uTime * 0.6, aRand) * 0.012;

    // cursor pushes particles away
    vec2 diff = pos.xy - uMouse;
    float dist = length(diff);
    float push = smoothstep(0.85, 0.0, dist);
    pos.xy += normalize(diff + 1e-5) * push * 0.32;
    pos.z += push * 0.6;

    // ripple from a click
    float rt = uTime - uRipple.z;
    if (rt > 0.0 && rt < 3.0) {
      float rd = length(pos.xy - uRipple.xy);
      float front = rt * 4.2;
      float wave = sin((rd - front) * 5.0) * exp(-abs(rd - front) * 1.4) * (1.0 - rt / 3.0);
      pos.z += wave * 0.9;
      pos.xy += normalize(pos.xy - uRipple.xy + 1e-5) * wave * 0.12;
    }

    // burst from a click: letters fly apart in a sparkling swirl, then gather back
    float bt = uTime - uBurst.z - aRand * 0.12;
    float spark = 0.0;
    if (bt > 0.0 && bt < 2.6) {
      float away = 1.0 - exp(-bt * 7.0);
      float back = 1.0 - smoothstep(0.45, 2.5, bt);
      spark = away * back;
      vec2 from = pos.xy - uBurst.xy;
      vec2 dir = normalize(from + aDir.xy * 0.6 + 1e-5);
      float reach = (0.8 + aRand * 2.6) * (1.0 + 0.25 * length(from));
      float ang = spark * (aRand - 0.5) * 2.2;
      dir = vec2(dir.x * cos(ang) - dir.y * sin(ang), dir.x * sin(ang) + dir.y * cos(ang));
      pos.xy += dir * reach * spark;
      pos.z += aDir.z * 2.4 * spark;
      pos.y -= bt * bt * 0.12 * spark; // a little gravity on the way
    }
    vSpark = spark;
    vRand = aRand;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 1.0 + spark * (1.2 + 1.8 * step(0.82, fract(aRand * 13.0 + uTime * 3.0)));
    gl_PointSize = uSize * uPixelRatio * (0.65 + aRand * 0.7) * (10.0 / -mv.z) * twinkle;
    vAlpha = (0.55 + 0.45 * (1.0 - min(travel, 1.0)) * (0.6 + aRand * 0.4)) * uFade;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vSpark;
  varying float vRand;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.32, r) * vAlpha;
    // while bursting, about half the dots turn accent-coloured
    vec3 col = mix(uColor, uAccent, vSpark * step(0.45, vRand));
    gl_FragColor = vec4(col, a);
  }
`;

function sampleWord(word, font, W, H, gap) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, W / 2, H / 2);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += gap) {
    for (let x = 0; x < W; x += gap) {
      if (data[(y * W + x) * 4 + 3] > 140) pts.push(x - W / 2, H / 2 - y);
    }
  }
  return { pts, width: ctx.measureText(word).width };
}

// `getCard()` returns the business card's screen rect; particles end on its outline.
export function createHero(canvas, words, getCard) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return null;
  }
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0xffffff, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;
  const COUNT = isSmall ? 3600 : 7600;

  const uniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: isSmall ? 2.3 : 2.1 },
    uPixelRatio: { value: pr },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uRipple: { value: new THREE.Vector3(0, 0, -99) },
    uFade: { value: 1 },
    uBurst: { value: new THREE.Vector3(0, 0, -99) },
    uColor: { value: new THREE.Color('#0f0f0f') },
    uAccent: { value: new THREE.Color('#2f4cff') },
  };

  const geometry = new THREE.BufferGeometry();
  const rand = mulberry32(20240521);
  const aRand = new Float32Array(COUNT);
  const aDir = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    aRand[i] = rand();
    const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
    aDir[i * 3] = Math.sin(ph) * Math.cos(th);
    aDir[i * 3 + 1] = Math.sin(ph) * Math.sin(th);
    aDir[i * 3 + 2] = Math.cos(ph);
  }
  geometry.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1));
  geometry.setAttribute('aDir', new THREE.BufferAttribute(aDir, 3));
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));

  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  let view = { w: 1, h: 1 };

  function layoutWords() {
    const W = 1600, H = 420, gap = isSmall ? 4 : 3;
    const samples = words.map((w) => {
      const korean = /[ㄱ-힝]/.test(w);
      const font = korean ? '700 250px "Noto Sans KR", sans-serif' : '650 270px "Inter Tight", sans-serif';
      return sampleWord(w, font, W, H, gap);
    });
    // each word fills the width on its own, up to a common letter height
    const fitW = view.w * (view.w < view.h ? 0.86 : 0.74);
    const capH = (view.h * (view.w < view.h ? 0.2 : 0.3)) / 270;
    const yOff = view.w < view.h ? 0.15 : 0.05;
    const r = mulberry32(7);
    samples.forEach((s, idx) => {
      const scale = Math.min(fitW / s.width, capH);
      const n = s.pts.length / 2;
      const arr = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const k = Math.floor(r() * n) * 2;
        arr[i * 3] = s.pts[k] * scale + (r() - 0.5) * 0.02;
        arr[i * 3 + 1] = s.pts[k + 1] * scale + (r() - 0.5) * 0.02 + yOff;
        arr[i * 3 + 2] = (r() - 0.5) * 0.12;
      }
      geometry.setAttribute(`aP${idx}`, new THREE.BufferAttribute(arr, 3));
    });
    layoutCard(r);
  }

  // final shape: the outline of the business card
  function layoutCard(r) {
    const arr = new Float32Array(COUNT * 3);
    const cv = canvas.getBoundingClientRect();
    let rect = getCard?.();
    if (rect && !rect.width) rect = null; // card not laid out (home tab hidden)
    const cvW = cv.width || window.innerWidth, cvH = cv.height || window.innerHeight;
    const perPx = view.h / cvH;
    const w = (rect ? rect.width : Math.min(440, cvW * 0.82)) * perPx * 1.03;
    const h = (rect ? rect.height : Math.min(440, cvW * 0.82) / 1.75) * perPx * 1.03;
    const cx = rect ? (rect.left + rect.width / 2 - cv.left - cv.width / 2) * perPx : 0;
    const cy = rect ? -(rect.top + rect.height / 2 - cv.top - cv.height / 2) * perPx : 0;
    const rad = Math.min(w, h) * 0.06;
    const straight = 2 * (w - 2 * rad) + 2 * (h - 2 * rad);
    const per = straight + 2 * Math.PI * rad;
    for (let i = 0; i < COUNT; i++) {
      let s = r() * per, x, y;
      const sw = w - 2 * rad, sh = h - 2 * rad;
      if (s < sw) { x = -sw / 2 + s; y = h / 2; }
      else if ((s -= sw) < sh) { x = w / 2; y = sh / 2 - s; }
      else if ((s -= sh) < sw) { x = sw / 2 - s; y = -h / 2; }
      else if ((s -= sw) < sh) { x = -w / 2; y = -sh / 2 + s; }
      else {
        s -= sh;
        const a = (s / rad), q = Math.floor(a / (Math.PI / 2));
        const ang = a - q * (Math.PI / 2);
        const corners = [[sw / 2, sh / 2, 0], [sw / 2, -sh / 2, -Math.PI / 2], [-sw / 2, -sh / 2, Math.PI], [-sw / 2, sh / 2, Math.PI / 2]];
        const [ox, oy, base] = corners[q % 4];
        x = ox + Math.cos(base + Math.PI / 2 - ang) * rad;
        y = oy + Math.sin(base + Math.PI / 2 - ang) * rad;
      }
      const jit = (r() - 0.5) * 0.05;
      arr[i * 3] = cx + x + jit;
      arr[i * 3 + 1] = cy + y + (r() - 0.5) * 0.05;
      arr[i * 3 + 2] = (r() - 0.5) * 0.1;
    }
    // the card fills every slot after the last word (the shader has five)
    for (let k = words.length; k <= 4; k++) geometry.setAttribute(`aP${k}`, new THREE.BufferAttribute(arr, 3));
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    view = { w: vh * camera.aspect, h: vh };
    layoutWords();
  }

  function toWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    return [(nx * view.w) / 2, (ny * view.h) / 2];
  }

  const target = new THREE.Vector2(99, 99);
  const onMove = (e) => {
    const p = e.touches ? e.touches[0] : e;
    const [x, y] = toWorld(p.clientX, p.clientY);
    target.set(x, y);
  };
  const onLeave = () => target.set(99, 99);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);
  window.addEventListener('touchend', onLeave, { passive: true });

  let running = false;
  const clock = new THREE.Clock();
  const tilt = { x: 0, y: 0 };

  function frame() {
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    const m = uniforms.uMouse.value;
    if (target.x > 50) m.copy(target);
    else if (m.x > 50) m.copy(target);
    else m.lerp(target, 0.12);
    const tx = target.x > 50 ? 0 : target.y / view.h;
    const ty = target.x > 50 ? 0 : target.x / view.w;
    tilt.x += (-tx * 0.18 - tilt.x) * 0.05;
    tilt.y += (ty * 0.25 - tilt.y) * 0.05;
    points.rotation.set(tilt.x, tilt.y, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(resize, 120);
  });

  return {
    uniforms,
    start() {
      if (running) return;
      running = true;
      clock.start();
      requestAnimationFrame(frame);
    },
    stop() { running = false; },
    relayout: resize,
    // sparkle burst from a click on the letters
    burst(clientX, clientY) {
      const [x, y] = toWorld(clientX, clientY);
      if (uniforms.uTime.value - uniforms.uBurst.value.z < 1.2) return;
      uniforms.uBurst.value.set(x, y, uniforms.uTime.value);
      uniforms.uAccent.value.set(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f4cff');
    },
    ripple(clientX, clientY) {
      const [x, y] = toWorld(clientX, clientY);
      uniforms.uRipple.value.set(x, y, uniforms.uTime.value);
    },
  };
}
