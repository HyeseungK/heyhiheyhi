// An iced americano in bricks next to the laptop. The longer the laptop stays open,
// the more the ice melts: the cubes shrink and sink, and the coffee turns lighter.
import * as THREE from 'three';
import { addLights } from './bricks.js';

const MELT_SECONDS = 60; // fully melted after this long with the laptop open

export function createCoffee(canvas) {
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
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 200);
  camera.position.set(0, 15, 34);
  camera.lookAt(0, 5.2, 0);

  const box = new THREE.BoxGeometry(0.94, 0.94, 0.94);
  const R = 3.6, H = 12;
  const inCup = (x, z, r) => Math.hypot(x, z) <= r;

  // the glass: a thin see-through wall and a frosted base
  const glassCells = [];
  for (let y = 0; y < H; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
    const d = Math.hypot(x, z);
    if (y === 0 ? d <= R : d <= R && d > R - 1) glassCells.push([x, y, z]);
  }
  const glassMat = new THREE.MeshStandardMaterial({ color: '#dfe8ee', roughness: 0.15, transparent: true, opacity: 0.28, depthWrite: false });
  const glass = new THREE.InstancedMesh(box, glassMat, glassCells.length);
  const m = new THREE.Matrix4();
  glassCells.forEach(([x, y, z], i) => glass.setMatrixAt(i, m.makeTranslation(x, y, z)));

  // the coffee: every brick inside the wall, shown up to the current level
  const coffeeCells = [];
  for (let y = 1; y < H - 1; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) if (inCup(x, z, R - 1)) coffeeCells.push([x, y, z]);
  const coffeeMat = new THREE.MeshStandardMaterial({ color: '#2b1a12', roughness: 0.3 });
  const coffee = new THREE.InstancedMesh(box, coffeeMat, coffeeCells.length);

  // ice: four cubes floating near the top
  const iceMat = new THREE.MeshStandardMaterial({ color: '#f4fbff', roughness: 0.05, transparent: true, opacity: 0.85 });
  const ice = [[-1.2, 0, -0.8, 0.3], [1.3, 0.4, 0.6, -0.4], [-0.4, 1.1, 1.4, 0.8], [0.9, 1.4, -1.3, 0.1]].map(([x, dy, z, r]) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.9, 1.9), iceMat);
    cube.userData = { x, dy, z, r };
    cube.rotation.set(r, r * 1.7, 0);
    return cube;
  });

  // the straw, in the site's accent
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f4cff';
  const straw = new THREE.Group();
  for (let y = 0; y < 15; y++) straw.add(new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 })).translateY(y));
  straw.position.set(1.4, 2, -0.6);
  straw.rotation.z = -0.22;

  // the puddle of condensation that spreads under the glass as it sweats
  const puddleMat = new THREE.MeshStandardMaterial({ color: '#cfe3ef', roughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false });
  const puddleCells = [];
  for (let x = -8; x <= 8; x++) for (let z = -8; z <= 8; z++) {
    const d = Math.hypot(x * 0.9, z + 0.6 * Math.sin(x)); // a little lopsided
    if (d <= 8) puddleCells.push([x, z, d]);
  }
  const puddle = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 0.18, 0.98), puddleMat, puddleCells.length);

  const cup = new THREE.Group();
  cup.add(puddle, coffee, ...ice, straw, glass);
  cup.rotation.y = -0.5;
  scene.add(cup);

  const dark = new THREE.Color('#2b1a12'), light = new THREE.Color('#8a6142');
  function melt(k) {
    // sip by sip the level drops, and what is left goes from black to a watery brown
    const level = 9 - k * 6; // sipped while working: the drink goes down as the ice melts
    let n = 0;
    coffeeCells.forEach(([x, y, z]) => {
      if (y > level) return;
      coffee.setMatrixAt(n++, m.makeTranslation(x, y, z));
    });
    coffee.count = n;
    coffee.instanceMatrix.needsUpdate = true;
    coffeeMat.color.copy(dark).lerp(light, k * 0.75);
    const spread = 3.6 + k * 4.4; // the puddle grows from under the glass
    let p = 0;
    puddleCells.forEach(([x, z, d]) => { if (k > 0.05 && d <= spread) puddle.setMatrixAt(p++, m.makeTranslation(x, -0.55, z)); });
    puddle.count = p;
    puddle.instanceMatrix.needsUpdate = true;
    ice.forEach((c, i) => {
      const left = Math.max(0, 1 - k * (1.15 - i * 0.1));
      c.visible = left > 0.02;
      c.scale.setScalar(Math.max(0.01, left));
      c.position.set(c.userData.x, level + 0.2 + c.userData.dy * left, c.userData.z);
    });
  }

  function fit() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(fit).observe(canvas);
  fit();

  let open = false, melted = 0, last = 0, raf = 0;
  melt(0);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    if (open && melted < 1) { melted = Math.min(1, melted + dt / MELT_SECONDS); melt(melted); }
    cup.rotation.y = -0.5 + Math.sin(now / 2400) * 0.12;
    ice.forEach((c, i) => (c.rotation.y += dt * 0.05 * (i % 2 ? 1 : -1)));
    renderer.render(scene, camera);
  }

  return {
    // the ice only melts while the laptop is open
    setOpen(v) { open = v; },
    start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}
