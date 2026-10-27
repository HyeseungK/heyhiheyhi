// A brick turntable for the favourite songs. Side A and side B are the two faces of one record:
// switching sides lifts the needle, flips the record over and drops the needle again.
import * as THREE from 'three';
import { addLights, INK } from './bricks.js';

const brickGeo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 16);
const plastic = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0 });
const accentNow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f4cff';

// cells: { x, y, z, c, stud: 1 (up) | -1 (down) | 0 }
function voxels(cells) {
  const bricks = new THREE.InstancedMesh(brickGeo, plastic, cells.length);
  const studded = cells.filter((v) => v.stud);
  const studs = new THREE.InstancedMesh(studGeo, plastic, Math.max(1, studded.length));
  const m = new THREE.Matrix4(), col = new THREE.Color();
  cells.forEach((v, i) => {
    bricks.setMatrixAt(i, m.makeTranslation(v.x, v.y, v.z));
    bricks.setColorAt(i, col.set(v.c));
  });
  studded.forEach((v, i) => {
    studs.setMatrixAt(i, m.makeTranslation(v.x, v.y + v.stud * 0.56, v.z));
    studs.setColorAt(i, col.set(v.c));
  });
  studs.count = studded.length;
  const g = new THREE.Group();
  g.add(bricks, studs);
  return g;
}

// a letter drawn on the record label (3 × 5), rows from the back of the label to the front
const LETTERS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
};

function record(accent) {
  const cells = [];
  const R = 9.6, labelR = 3.2;
  const letterAt = (ch, x, z, mirror) => {
    const rows = mirror ? [...LETTERS[ch]].reverse() : LETTERS[ch];
    const r = rows[z + 2], c = x + 1;
    return !!r && c >= 0 && c < 3 && r[c] === '#';
  };
  for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
      const d = Math.hypot(x, z);
      if (d > R) continue;
      // top face is side A, bottom face is side B (its letter is mirrored so it reads right once flipped)
      const groove = Math.round(d) % 2 ? '#1f1f1f' : '#161616';
      // A (analog) gets the warm beige label, B (modern) the accent
      const top = d < labelR ? (letterAt('A', x, z) ? INK : '#efe6d2') : groove;
      const bottom = d < labelR ? (letterAt('B', x, z, true) ? '#ffffff' : accent) : groove;
      cells.push({ x, y: 0.5, z, c: top, stud: d < 0.5 ? 0 : 1 });
      cells.push({ x, y: -0.5, z, c: bottom, stud: d < 0.5 ? 0 : -1 });
    }
  }
  return voxels(cells);
}

function deck(accent) {
  const cells = [];
  // plinth: a cream slab with ink feet
  for (let x = -13; x <= 13; x++) {
    for (let z = -11; z <= 10; z++) {
      cells.push({ x, y: -3, z, c: '#e9e6de', stud: 0 });
      cells.push({ x, y: -2, z, c: '#f6f4ef', stud: Math.hypot(x, z) > 10.2 ? 1 : 0 });
    }
  }
  for (const [x, z] of [[-12, -10], [12, -10], [-12, 9], [12, 9]]) cells.push({ x, y: -4, z, c: INK, stud: 0 });
  // platter under the record
  for (let x = -10; x <= 10; x++) for (let z = -10; z <= 10; z++) if (Math.hypot(x, z) <= 10.2) cells.push({ x, y: -1, z, c: '#b9bcc1', stud: 0 });
  // start button and speed knob, front left
  cells.push({ x: -11, y: -1, z: 8, c: accent, stud: 1 }, { x: -9, y: -1, z: 8, c: '#d6d6d2', stud: 1 });
  // tonearm base, back right
  for (const [x, z] of [[11, -8], [12, -8], [11, -7], [12, -7]]) cells.push({ x, y: -1, z, c: '#8e9399', stud: 0 });
  return voxels(cells);
}

function arm(accent) {
  // built pointing toward the viewer (+z) from the pivot; the counterweight sits behind it
  const cells = [];
  for (let z = 0; z <= 12; z++) cells.push({ x: 0, y: 0, z, c: '#c9ccd0', stud: z % 3 === 0 ? 1 : 0 });
  cells.push({ x: 0, y: 0, z: -1, c: INK, stud: 1 }, { x: 0, y: 0, z: -2, c: INK, stud: 1 });
  cells.push({ x: 0, y: 0, z: 13, c: accent, stud: 1 }, { x: 0, y: -1, z: 13, c: INK, stud: 0 });
  return voxels(cells);
}

export function createTurntable(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  const gsap = window.gsap;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  addLights(scene);
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 1, 400);
  camera.position.set(0, 37, 41);
  camera.lookAt(0, -1.5, -1.5);

  const root = new THREE.Group();
  root.scale.setScalar(0.92);
  scene.add(root);
  const accent = accentNow();
  root.add(deck(accent));

  // record: lift (position) → flip (rotation.x) → spin (rotation.y)
  const lift = new THREE.Group();
  const flip = new THREE.Group();
  const spin = new THREE.Group();
  spin.add(record(accent));
  spin.scale.y = 0.55; // a record, not a cake
  flip.add(spin);
  lift.add(flip);
  lift.position.y = 0.5;
  root.add(lift);

  // tonearm: swing (rotation.y) → tilt (rotation.x)
  const swing = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.add(arm(accent));
  swing.add(tilt);
  swing.position.set(11.5, 1.6, -7.5);
  root.add(swing);
  const REST = 0.12, ON = -0.6, UP = -0.16, DOWN = 0;
  swing.rotation.y = REST;
  tilt.rotation.x = UP;

  const state = { side: 'A', on: false, speed: 0 };
  let tl = null;

  function fit() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(fit).observe(canvas);
  fit();

  let raf = 0, last = 0;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    // flipped over, the record's own up axis points down: turn the other way so it always goes clockwise
    spin.rotation.y -= state.speed * dt * (state.side === 'B' ? -1 : 1);
    renderer.render(scene, camera);
  }

  const needleOn = () => gsap.timeline()
    .to(swing.rotation, { y: ON, duration: 0.7, ease: 'power2.inOut' })
    .to(tilt.rotation, { x: DOWN, duration: 0.35, ease: 'power2.in' })
    .to(state, { speed: 3.5, duration: 1.1, ease: 'power2.out' }, '<');
  const needleOff = () => gsap.timeline()
    .to(state, { speed: 0, duration: 0.9, ease: 'power2.out' })
    .to(tilt.rotation, { x: UP, duration: 0.3, ease: 'power2.out' }, 0)
    .to(swing.rotation, { y: REST, duration: 0.6, ease: 'power2.inOut' }, 0.25);

  return {
    start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    get side() { return state.side; },
    get on() { return state.on; },
    // put the needle down on `side`, flipping the record first if the other side is up
    play(side) {
      if (side === state.side && state.on) return;
      tl?.kill();
      tl = gsap.timeline();
      if (side !== state.side) {
        if (state.on || swing.rotation.y !== REST) tl.add(needleOff());
        const turned = side === 'B';
        tl.to(lift.position, { y: 6, duration: 0.45, ease: 'power2.out' })
          .to(flip.rotation, { x: turned ? Math.PI : 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.15')
          .add(() => (state.side = side), '<0.35')
          .to(lift.position, { y: 0.5, duration: 0.45, ease: 'bounce.out' });
      }
      state.on = true;
      tl.add(needleOn());
    },
    pause() {
      if (!state.on) return;
      state.on = false;
      tl?.kill();
      tl = needleOff();
    },
  };
}
