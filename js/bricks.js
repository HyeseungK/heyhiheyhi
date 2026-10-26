// Shared brick (voxel) builder: turns a pixel map into studded plastic bricks.
// Used by the 3D guitar and by the little brick icons in the nav and hero.
import * as THREE from 'three';

const brickGeo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
const studGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 18).rotateX(Math.PI / 2);
const plastic = new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0 });

export const INK = '#151515';
export const COBALT = '#2f4cff'; // stands for "the accent colour" in maps; swapped at render time

const accentNow = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || COBALT;
const resolve = (hex) => (hex === COBALT ? accentNow() : hex);

// `map`: rows of characters, '.' = empty. `colors`: char → hex.
// `depthOf(ch)`: bricks deep. `liftOf(ch)`: bricks pushed toward the viewer.
export function buildBricks(map, colors, depthOf = () => 2, liftOf = () => 0) {
  const cells = [];
  map.forEach((row, r) => [...row].forEach((ch, c) => ch !== '.' && cells.push({ ch, c, r })));
  const total = cells.reduce((n, cell) => n + depthOf(cell.ch), 0);
  const bricks = new THREE.InstancedMesh(brickGeo, plastic, total);
  const studs = new THREE.InstancedMesh(studGeo, plastic, cells.length);
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  const w = Math.max(...map.map((row) => row.length)), h = map.length;
  let i = 0;
  cells.forEach((cell, s) => {
    const x = cell.c - (w - 1) / 2, y = (h - 1) / 2 - cell.r;
    const d = depthOf(cell.ch), lift = liftOf(cell.ch);
    col.set(resolve(colors[cell.ch]));
    for (let z = 0; z < d; z++) {
      m.makeTranslation(x, y, lift - z);
      bricks.setMatrixAt(i, m);
      bricks.setColorAt(i++, col);
    }
    m.makeTranslation(x, y, lift + 0.56);
    studs.setMatrixAt(s, m);
    studs.setColorAt(s, col);
  });
  const g = new THREE.Group();
  g.add(bricks, studs);
  g.userData = { size: { w, h }, cells, colors, depthOf };
  return g;
}

// re-applies colours (e.g. after the accent changes)
export function recolorBricks(g) {
  const [bricks, studs] = g.children;
  const { cells, colors, depthOf } = g.userData;
  const col = new THREE.Color();
  let i = 0;
  cells.forEach((cell, s) => {
    col.set(resolve(colors[cell.ch]));
    for (let z = 0; z < depthOf(cell.ch); z++) bricks.setColorAt(i++, col);
    studs.setColorAt(s, col);
  });
  bricks.instanceColor.needsUpdate = true;
  studs.instanceColor.needsUpdate = true;
}

export function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d2, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(30, 50, 60);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8);
  rim.position.set(-40, 20, -30);
  scene.add(rim);
}

// ── icons ───────────────────────────────────────────────────
function disc(size, fn) {
  const rows = [];
  const c = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) row += fn(Math.hypot(x - c, y - c));
    rows.push(row);
  }
  return rows;
}

const ICONS = {
  home: {
    map: ['HH...HH', 'HH...HH', 'HH...HH', 'HHHHHHH', 'HHHHHHH', 'HH...HH', 'HH...HH', 'HH...HH'],
    colors: { H: COBALT },
  },
  work: {
    map: [
      '..SSSSSSSSSS..',
      '..SBBBBBBBBS..',
      '..SBWWWWBBBS..',
      '..SBBBBBBBBS..',
      '..SBWWWBBBBS..',
      '..SBBBBBBBBS..',
      '..SSSSSSSSSS..',
      '.KKKKKKKKKKKK.',
      'KKKKKKKKKKKKKK',
    ],
    colors: { S: '#c9c9c5', B: COBALT, W: '#f7f7f4', K: '#a9a9a5' },
  },
  visual: {
    map: [
      '..KK......AA..',
      '.KKKKKKKKKKKK.',
      'KSSSSSSSSSSSSK',
      'KKKKKGGGGKKKKK',
      'KKKKGLLLLGKKKK',
      'KKKKGLWLLGKKKK',
      'KKKKGLLLLGKKKK',
      'KKKKKGGGGKKKKK',
      '.KKKKKKKKKKKK.',
    ],
    colors: { K: INK, S: '#d4d4d0', G: '#8c8c88', L: '#1d2766', W: '#ffffff', A: COBALT },
    lift: (ch) => ('GLW'.includes(ch) ? 1 : 0),
  },
  music: {
    map: disc(13, (r) => (r > 6.4 ? '.' : r < 0.9 ? 'W' : r < 2.6 ? 'A' : r > 3.6 && r < 4.3 ? 'D' : r > 5.2 && r < 5.8 ? 'D' : 'V')),
    colors: { V: INK, D: '#3c3c3a', A: COBALT, W: '#f7f7f4' },
    lift: (ch) => (ch === 'A' || ch === 'W' ? 0.3 : 0),
  },
};

// Renders each icon once to a transparent PNG data URL.
export function renderBrickIcons(px = 160) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(px, px, false);
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const out = {};
  for (const [name, icon] of Object.entries(ICONS)) {
    const scene = new THREE.Scene();
    addLights(scene);
    const g = buildBricks(icon.map, icon.colors, () => 2, icon.lift);
    g.rotation.set(0.32, -0.55, 0);
    scene.add(g);
    const half = Math.max(g.userData.size.w, g.userData.size.h) * 0.62;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, -100, 100);
    cam.position.set(0, 0, 50);
    renderer.render(scene, cam);
    out[name] = renderer.domElement.toDataURL('image/png');
    g.children.forEach((m) => m.dispose?.());
  }
  renderer.dispose();
  renderer.forceContextLoss?.();
  return out;
}
