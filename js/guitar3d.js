// A brick-built electric guitar leaning on an amp, rendered with Three.js.
import * as THREE from 'three';
import { buildBricks, addLights, recolorBricks, COBALT } from './bricks.js';

// Pixel maps, top row first. One character = one brick.
// H head · P peg · F fret · N neck · B body · W pickguard · G pickup · K bridge/knob
const GUITAR = [
  '.....HHHHH.....',
  '....PHHHHHP....',
  '.....HHHHH.....',
  '....PHHHHHP....',
  '.....HHHHH.....',
  '....PHHHHHP....',
  '......HHH......',
  '......FFF......',
  ...Array.from({ length: 20 }, (_, i) => (i % 3 === 2 ? '......FFF......' : '......NNN......')),
  '..BBB.NNN......',
  '.BBBBBNNNB.....',
  '.BBBBBNNNBB....',
  'BBBBBBNNNBBB...',
  'BBBBBWNNNBBBB..',
  'BBBBWWNNNBBBBB.',
  'BBBWWWGGGWBBBB.',
  '.BBWWWWWWWBBB..',
  '..BWWWWWWWBBB..',
  '..BBWWWWWWBBB..',
  '.BBBWWGGGWBBBB.',
  'BBBBBWWWWWBBBBB',
  'BBBBBBKKKBBBKBB',
  'BBBBBBBBBBBBKBB',
  'BBBBBBBBBBBBBBB',
  '.BBBBBBBBBBBBB.',
  '..BBBBBBBBBBB..',
  '....BBBBBBB....',
];

// A amp panel · K knob · E edge · C/D grille checker
const AMP = [
  'EEEEEEEEEEEEEE',
  'EAAAAAAAAAAAAE',
  'EAKAKAKAKAKAAE',
  'EAAAAAAAAAAAAE',
  'EEEEEEEEEEEEEE',
  ...Array.from({ length: 16 }, (_, r) => 'E' + Array.from({ length: 12 }, (_, c) => ((r + c) % 2 ? 'D' : 'C')).join('') + 'E'),
  'EEEEEEEEEEEEEE',
];

const COLORS = {
  H: COBALT, B: COBALT, A: COBALT,
  P: '#e9e9e6', W: '#f7f7f4',
  F: '#9a9a96', G: '#8c8c88', E: '#7d7d7a',
  N: '#151515', K: '#151515', C: '#151515', D: '#4a4a48',
};

export function createGuitar(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 400);

  addLights(scene);

  const guitar = buildBricks(GUITAR, COLORS, (ch) => ('BWGK'.includes(ch) ? 3 : ch === 'P' ? 1 : 2));
  const amp = buildBricks(AMP, COLORS, () => 6);

  // strings: thin bars from the nut to the bridge, sitting above the studs
  const strings = new THREE.Group();
  const nutY = (GUITAR.length - 1) / 2 - 7;
  const bridgeY = (GUITAR.length - 1) / 2 - 40;
  const len = nutY - bridgeY;
  const stringMat = new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.2, metalness: 0.6 });
  [-0.75, -0.25, 0.25, 0.75].forEach((x) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, len, 0.07), stringMat);
    s.position.set(x, bridgeY + len / 2, 0.85);
    strings.add(s);
  });
  guitar.add(strings);

  const rig = new THREE.Group();
  amp.position.set(-6.5, -12.5, -6);
  amp.rotation.y = 0.18;
  guitar.position.set(3, 0, 1);
  guitar.rotation.z = 0.12;
  const guitarPivot = new THREE.Group();
  guitarPivot.add(guitar);
  rig.add(amp, guitarPivot);
  scene.add(rig);

  // soft contact shadow
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sg = sc.getContext('2d');
  const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 10),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(-1, -23.6, -2);
  scene.add(shadow);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // fit a 34 x 50 box
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distH = 26 / Math.tan(fov / 2);
    const distW = 19 / (Math.tan(fov / 2) * camera.aspect);
    camera.position.set(0, 4, Math.max(distH, distW));
    camera.lookAt(0, -1, 0);
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  canvas.addEventListener('pointerleave', () => (pointer.tx = pointer.ty = 0));

  let running = false, strumT = -10, hoverT = -10;
  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    rig.rotation.y = Math.sin(t * 0.4) * 0.22 + pointer.x * 0.45;
    rig.rotation.x = pointer.y * 0.12;
    rig.position.y = Math.sin(t * 1.1) * 0.5;

    // strum: strings vibrate, the guitar hops and rocks
    const ds = t - strumT;
    const dh = t - hoverT;
    const amt = Math.max(ds < 1.4 ? 1 - ds / 1.4 : 0, dh < 0.6 ? (1 - dh / 0.6) * 0.4 : 0);
    strings.children.forEach((s, i) => {
      s.position.x = [-0.75, -0.25, 0.25, 0.75][i] + Math.sin(t * 90 + i * 1.7) * 0.12 * amt;
    });
    const hop = ds < 0.9 ? Math.sin((ds / 0.9) * Math.PI) : 0;
    guitarPivot.position.y = hop * 2.2;
    guitarPivot.rotation.z = hop * Math.sin(ds * 18) * 0.06;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);

  return {
    start() {
      if (running) return;
      running = true;
      resize();
      requestAnimationFrame(frame);
    },
    stop() { running = false; },
    strum() { strumT = clock.getElapsedTime(); },
    nudge() { hoverT = clock.getElapsedTime(); },
    recolor() {
      recolorBricks(guitar);
      recolorBricks(amp);
      if (!running) renderer.render(scene, camera);
    },
  };
}
