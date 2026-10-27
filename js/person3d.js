// Work, desktop: a brick figure beside the career list that grows younger as you scroll,
// from the full-time consultant at the top to the student and, at the bottom, a baby.
// The same bricks fly from one figure to the next; drag to turn it around.
import * as THREE from 'three';
import { addLights, INK, COBALT } from './bricks.js';

const SKIN = '#f1c9a5', HAIR = '#2a211c';
const FIGURES = [
  { // the consultant: suit, tie, briefcase
    map: [
      '....HHHHH....',
      '...HHHHHHH...',
      '...HSSSSSH...',
      '...SESSSES...',
      '...SSSSSSS...',
      '....SSRSS....',
      '.....SSS.....',
      '..JJJWTWJJJ..',
      '.JJJJWTWJJJJ.',
      '.JJJJJTJJJJJ.',
      '.JJ.JJTJJ.JJ.',
      '.JJ.JJJJJ.JJ.',
      '.SS.JJJJJ.SS.',
      '....PPPPP.BBB',
      '....PP.PP.BBB',
      '....PP.PP.BBB',
      '....PP.PP....',
      '...KKK.KKK...',
    ],
    colors: { H: HAIR, S: SKIN, E: INK, R: '#d9826f', J: INK, W: '#f7f7f4', T: COBALT, P: '#3b3b3e', K: '#151515', B: '#8a5a35' },
  },
  { // the student: a graduation cap and a hoodie
    map: [
      '..CCCCCCCCC..',
      '....CCCCC.Q..',
      '...HHHHHHHQ..',
      '...HSSSSSH...',
      '...SESSSES...',
      '...SSSSSSS...',
      '....SSRSS....',
      '..UUUUUUUUU..',
      '.UUUUUUUUUUU.',
      '.UU.UUUUU.UU.',
      '.SS.UUUUU.SS.',
      '....DDDDD....',
      '....DD.DD....',
      '....DD.DD....',
      '...WWW.WWW...',
    ],
    colors: { C: INK, Q: '#f2c14e', H: HAIR, S: SKIN, E: INK, R: '#d9826f', U: COBALT, D: '#6f8fb8', W: '#f7f7f4' },
  },
  { // the baby: a pacifier and a onesie
    map: [
      '.....HHH.....',
      '...SSSSSSS...',
      '..SSSSSSSSS..',
      '..SSESSSESS..',
      '..SSSSSSSSS..',
      '...SSSAASS...',
      '....SSSSS....',
      '...OOOOOOO...',
      '..SOOOOOOOS..',
      '...OOOOOOO...',
      '...OOO.OOO...',
      '...SS...SS...',
    ],
    colors: { H: HAIR, S: SKIN, E: INK, A: COBALT, O: '#f6dfa8' },
  },
];

// every figure as a list of bricks (two deep), bottom-aligned, sorted so neighbours travel together
function bricksOf(fig) {
  const out = [];
  const h = fig.map.length, w = Math.max(...fig.map.map((r) => r.length));
  fig.map.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') return;
    const col = new THREE.Color(fig.colors[ch] === COBALT ? accentNow() : fig.colors[ch]);
    for (let z = 0; z < 2; z++) out.push({ x: c - (w - 1) / 2, y: h - 1 - r, z: -z, col, front: z === 0 });
  }));
  return out.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);
}
const accentNow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || COBALT;

export function createPerson(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  addLights(scene);
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 400);
  camera.position.set(0, 9.5, 52);
  camera.lookAt(0, 8.5, 0);

  const sets = FIGURES.map(bricksOf);
  const N = Math.max(...sets.map((s) => s.length));
  const geo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
  const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 14).rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0 });
  const bricks = new THREE.InstancedMesh(geo, mat, N);
  const studs = new THREE.InstancedMesh(studGeo, mat, N);
  const group = new THREE.Group();
  group.add(bricks, studs);
  scene.add(group);

  // brick i of figure k; a figure with fewer bricks parks the rest inside its body, shrunk to nothing
  const at = (k, i) => sets[k][i] || { ...sets[k][Math.floor((i * 7919) % sets[k].length)], gone: true };
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let target = 0, shown = -1;
  function pose(p) {
    const k = Math.min(FIGURES.length - 2, Math.floor(p));
    const t = ease(Math.min(1, Math.max(0, p - k)));
    for (let i = 0; i < N; i++) {
      const a = at(k, i), b = at(k + 1, i);
      // each brick waits its turn (by height), then hops along a little arc
      const d = Math.min(1, Math.max(0, t * 1.6 - (i / N) * 0.6));
      const lift = Math.sin(d * Math.PI) * 2.2;
      pos.set(a.x + (b.x - a.x) * d, a.y + (b.y - a.y) * d + lift, a.z + (b.z - a.z) * d + Math.sin(d * Math.PI) * 1.5);
      const s = (a.gone ? d : 1) * (b.gone ? 1 - d : 1);
      scl.setScalar(Math.max(0.0001, s));
      m.compose(pos, q, scl);
      bricks.setMatrixAt(i, m);
      col.copy(a.col).lerp(b.col, d);
      bricks.setColorAt(i, col);
      const front = d < 0.5 ? a.front : b.front;
      pos.z += 0.56;
      scl.setScalar(front ? Math.max(0.0001, s) : 0.0001);
      m.compose(pos, q, scl);
      studs.setMatrixAt(i, m);
      studs.setColorAt(i, col);
    }
    bricks.instanceMatrix.needsUpdate = studs.instanceMatrix.needsUpdate = true;
    bricks.instanceColor.needsUpdate = studs.instanceColor.needsUpdate = true;
  }

  function fit() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(fit).observe(canvas);
  fit();

  // drag to spin; it eases back to a gentle sway when let go
  let spin = 0, vel = 0, drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: spin }; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (drag) { const s = drag.s + (e.clientX - drag.x) * 0.012; vel = s - spin; spin = s; } });
  const end = () => { drag = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  let raf = 0, cur = 0, t0 = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    cur += (target - cur) * 0.08;
    if (Math.abs(cur - shown) > 0.0005) { pose(cur); shown = cur; }
    if (!drag) { spin += vel; vel *= 0.94; }
    group.rotation.y = spin + Math.sin((now - t0) / 1600) * 0.25 - 0.35;
    renderer.render(scene, camera);
  }

  return {
    // 0 = consultant, 1 = student, 2 = baby
    set(p) { target = Math.max(0, Math.min(FIGURES.length - 1, p)); },
    start() { if (!raf) raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}
