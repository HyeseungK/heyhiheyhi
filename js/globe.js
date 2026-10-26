// Frames globe: a dotted Earth you can spin, with a pin per place.
import * as THREE from 'three';
import { DOTS } from './globedots.js';

const DEG = Math.PI / 180;

function toVec(lat, lon, r = 1) {
  const phi = (90 - lat) * DEG, theta = (lon + 180) * DEG;
  return new THREE.Vector3(-Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(theta) * r);
}

// `places`: [{ id, name, lat, lon }]. `layer`: element that holds the pin buttons.
export function createGlobe(canvas, layer, places, { onPick } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 4.1);

  const globe = new THREE.Group();
  scene.add(globe);

  // white core hides the dots on the far side
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.985, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffffff })));

  const n = DOTS.length / 2;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = toVec(DOTS[i * 2] / 10, DOTS[i * 2 + 1] / 10);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dotMat = new THREE.PointsMaterial({ color: 0x0f0f0f, size: 0.016, sizeAttenuation: true, transparent: true, opacity: 0.8 });
  globe.add(new THREE.Points(geo, dotMat));

  // rim ring for a crisp edge
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.004, 128), new THREE.MeshBasicMaterial({ color: 0xe0dfda }));
  scene.add(ring);

  // pins: DOM buttons positioned over projected points
  const pins = places.map((p) => {
    const btn = document.createElement('button');
    btn.className = 'pin';
    btn.dataset.id = p.id;
    btn.innerHTML = `<i></i><span>${p.name}</span>`;
    btn.setAttribute('aria-label', `${p.name}: open photos`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!dragMoved) onPick?.(p.id, btn);
    });
    layer.appendChild(btn);
    return { p, btn, local: toVec(p.lat, p.lon, 1.0) };
  });

  // drag to spin, with inertia; idles into a slow turn
  let dragging = false, dragMoved = false, last = null, vx = 0, vy = 0, focusTween = null;
  // start looking at the North Atlantic: New York on the left, Europe on the right
  {
    const v = toVec(35, -35);
    globe.rotation.set(Math.atan2(v.y, Math.hypot(v.x, v.z)) * 0.85, Math.atan2(-v.x, v.z), 0);
  }
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; dragMoved = false; last = { x: e.clientX, y: e.clientY };
    focusTween?.kill();
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    vx = dx * 0.006; vy = dy * 0.004;
    globe.rotation.y += vx;
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + vy, -1.1, 1.1);
    last = { x: e.clientX, y: e.clientY };
  });
  const end = () => { dragging = false; setTimeout(() => (dragMoved = false), 0); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole globe in view on narrow screens
    camera.position.z = w / h < 1 ? 4.1 / Math.max(0.62, w / h) : 4.1;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);

  const tmp = new THREE.Vector3(), normal = new THREE.Vector3(), toCam = new THREE.Vector3();
  function placePins() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (const pin of pins) {
      tmp.copy(pin.local).applyQuaternion(globe.quaternion);
      normal.copy(tmp).normalize();
      toCam.copy(camera.position).sub(tmp).normalize();
      const facing = normal.dot(toCam);
      tmp.project(camera);
      pin.x = (tmp.x * 0.5 + 0.5) * w;
      pin.y = (-tmp.y * 0.5 + 0.5) * h;
      pin.visible = facing > 0.15;
      pin.btn.style.opacity = pin.visible ? Math.min(1, (facing - 0.15) * 4) : 0;
      pin.btn.style.pointerEvents = facing > 0.3 ? 'auto' : 'none';
    }
    // pins close together on screen (Seoul / Suncheon): the lower one puts its label on the left
    for (const pin of pins) {
      pin.flip = pins.some((o) => o !== pin && o.visible && pin.visible && o.y < pin.y && pin.y - o.y < 26 && Math.abs(pin.x - o.x) < 140);
      pin.btn.classList.toggle('flip', pin.flip);
      pin.btn.style.transform = `translate(${pin.x}px, ${pin.y}px)${pin.flip ? ' translateX(calc(-100% + 14px))' : ''}`;
    }
  }

  let running = false;
  function frame() {
    if (!running) return;
    if (!dragging && !focusTween?.isActive()) {
      vx *= 0.94; vy *= 0.9;
      globe.rotation.y += vx + 0.0012;
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + vy, -1.1, 1.1);
    }
    placePins();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  return {
    start() { if (!running) { running = true; resize(); requestAnimationFrame(frame); } },
    stop() { running = false; },
    // turn the globe so a place faces the viewer
    focus(id) {
      const pin = pins.find((p) => p.p.id === id);
      if (!pin) return;
      const v = pin.local;
      let a = Math.atan2(-v.x, v.z);
      const r = Math.hypot(v.x, v.z);
      const b = Math.atan2(v.y, r) * 0.85;
      // shortest way round
      const cur = globe.rotation.y;
      a += Math.round((cur - a) / (Math.PI * 2)) * Math.PI * 2;
      vx = vy = 0;
      focusTween?.kill();
      focusTween = window.gsap.to(globe.rotation, { y: a, x: b, duration: 1.1, ease: 'power3.inOut' });
      return focusTween;
    },
    pinRect(id) {
      return pins.find((p) => p.p.id === id)?.btn.querySelector('i').getBoundingClientRect();
    },
  };
}
