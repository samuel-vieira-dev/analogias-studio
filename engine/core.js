// ============================================================================
// analogias-studio · engine/core.js
// Inlined by tools/build.py into compositions/world.html (one ES-module scope).
// The build header defines: THREE, RoundedBoxGeometry, LAYOUT, STYLE, DUR, host.
//
// Contract (the root-cause fixes):
//   1. Cameras are never placed by guessed numbers. CAM.pose() solves the camera
//      distance so the target's projected box fits inside a layout zone, with the
//      zone centre as the optical centre (setViewOffset). The target is the
//      envelope of everything the shot must show, across the whole shot
//      (envelope()), so animated parts cannot leave the frame.
//   2. Every meaningful object is registered: S.hero() / S.label() / S.solid().
//      window.__qa.frame() reports their on-screen boxes and 3D intersections so
//      tools/qa.cjs can block renders with cut objects, text over animation, or
//      objects passing through each other.
// ============================================================================

const W = LAYOUT.canvas.w, H = LAYOUT.canvas.h;
const ZONES = LAYOUT.zones;
const ORANGE = STYLE.laranja, RED = STYLE.vermelho, GREEN = STYLE.verde, CREAM = STYLE.creme, BG = STYLE.fundo;
const V3 = THREE.Vector3;

// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const sm = (t, a, b) => { const x = lin(t, a, b); return x * x * (3 - 2 * x); };
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eBack = (x) => { const c1 = 1.9, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const pop = (t, at, d = 0.4) => eBack(lin(t, at, at + d));
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- materials, geometry, textures
const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.0 }, o));
const rbox = (w, h, d, r = 0.06, s = 4) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function texFrom(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function chipTex(text, { bg = ORANGE, fg = "#fff", font = "900 120px Inter", pad = 50, h = 200, radius = 36 } = {}) {
  const m = makeCanvas(16, 16).getContext("2d"); m.font = font; const tw = Math.ceil(m.measureText(text).width);
  const c = makeCanvas(tw + pad * 2, h); const x = c.getContext("2d");
  if (bg) { x.fillStyle = bg; roundRect(x, 0, 0, c.width, c.height, radius); x.fill(); }
  x.font = font; x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, c.width / 2, h / 2 + 6);
  const t = texFrom(c); t.userData.textFrac = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]) / h; return t;
}
// Text on a rounded plate. The font shrinks until the text fits 88% of the plate width.
function plateTex(text, { bg = "#141414", fg = "#f5c400", w = 1024, h = 220, font = "900 120px Inter", radius = 24 } = {}) {
  const c = makeCanvas(w, h); const x = c.getContext("2d");
  if (bg) { x.fillStyle = bg; roundRect(x, 0, 0, w, h, radius); x.fill(); }
  let px = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]); const f = (n) => font.replace(/\d+(?:\.\d+)?px/, n + "px");
  x.font = f(px); while (x.measureText(text).width > w * 0.88 && px > 8) { px -= 2; x.font = f(px); }
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + px * 0.05);
  const t = texFrom(c); t.userData.textFrac = px / h; return t;
}
// A thin plate with printed text (w x h world units, 0.03 deep, text on the +z face).
// Use it instead of a sprite when the text belongs to an object: it is part of that object.
// The QA checks that the text is readable on screen while its hero is the subject (texto3d_ilegivel);
// `detail: true` marks text that is texture, not meant to be read (a tiny year on a truck door).
function makePlate(text, w, h, { bg = "#141414", fg = "#ffffff", font = "900 160px Inter", depth = 0.03, detail = false } = {}) {
  const ph = 256, pw = Math.max(64, Math.round(ph * w / h));
  const tex = plateTex(text, { bg, fg, w: pw, h: ph, font: font.replace(/\d+(?:\.\d+)?px/, Math.round(ph * 0.62) + "px"), radius: Math.round(ph * 0.12) });
  const face = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: !bg });
  const side = mat(bg || "#141414");
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [side, side, side, side, face, side]);
  m.userData.plate = { text, w, h, depth, frac: tex.userData.textFrac, detail }; return m;
}
function stripesTex() {
  const c = makeCanvas(512, 64); const x = c.getContext("2d"); x.fillStyle = "#141414"; x.fillRect(0, 0, 512, 64);
  x.fillStyle = "#f5c400"; for (let i = -2; i < 18; i++) { x.beginPath(); x.moveTo(i * 40, 64); x.lineTo(i * 40 + 20, 64); x.lineTo(i * 40 + 44, 0); x.lineTo(i * 40 + 24, 0); x.fill(); }
  const t = texFrom(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); return t;
}
function shadowTex() {
  const c = makeCanvas(256, 256); const x = c.getContext("2d"); const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return texFrom(c);
}
const SHADOW = shadowTex();
function contactShadow(w, d) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.005; m.userData.decor = true; return m;
}
// 3D text that always faces the camera. Register it with S.label(). Prefer makePlate() for text that sits on an object.
function sprite(tex, width) {
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const s = new THREE.Sprite(m); const img = tex.image; s.scale.set(width, width * img.height / img.width, 1); s.userData.w = width; return s;
}
function setSpriteScale(s, k) { const img = s.material.map.image; s.scale.set(s.userData.w * k, s.userData.w * k * img.height / img.width, 1); s.visible = k > 0.01; }
function popSprite(s, t, at, d = 0.35, until = Infinity) { const k = t < until ? pop(t, at, d) : 0; setSpriteScale(s, Math.max(0.0001, k)); }
// Pop any object in (scale from 0) at `at`; hidden before. Optional `until` hides it again.
function popIn(obj, t, at, d = 0.4, base = 1, until = Infinity) { const k = t < until ? pop(t, at, d) : 0; obj.visible = k > 0.01; obj.scale.setScalar(Math.max(0.0001, k) * base); }

await document.fonts.load("900 100px Inter"); await document.fonts.load("800 100px Inter");
await document.fonts.load("700 100px Inter"); await document.fonts.load("600 100px Inter");

// ---------------------------------------------------------------- renderer and world
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("w-canvas"), antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
// Realism (31/10/2026): soft shadows from the key light and a studio environment map, so metal,
// glass, ceramics and lacquer get real reflections instead of flat plastic shading.
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 12, 40);
const ENV = (() => { const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); return t; })();
scene.environment = ENV; scene.environmentIntensity = 0.42;
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 300);
const hemi = new THREE.HemisphereLight("#ffd9b8", "#1a0f0a", 0.5); scene.add(hemi);
const key = new THREE.DirectionalLight("#ffb98a", 2.4); key.position.set(4, 9, 6); scene.add(key); scene.add(key.target);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.025;
const KEY_DIR = new V3(4, 9, 6).normalize();
const rim = new THREE.DirectionalLight("#86a8ff", 1.1); rim.position.set(-6, 5, -7); scene.add(rim);
const fill = new THREE.PointLight(ORANGE, 0, 12, 1.6); scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat("#23160f", { roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
function resetLights() { fill.intensity = 0; fill.color.set(ORANGE); key.color.set("#ffb98a"); key.intensity = 2.4; hemi.intensity = 0.5; scene.environmentIntensity = 0.42; floor.visible = true; }
// Shadow camera follows the shot: centred on what the camera looks at, sized to the shot.
function fitShadow(look, dist) {
  const s = Math.max(2, dist * 0.75);
  key.target.position.copy(look); key.position.copy(look).addScaledVector(KEY_DIR, s * 2.2);
  const c = key.shadow.camera; c.left = -s; c.right = s; c.top = s; c.bottom = -s; c.near = 0.1; c.far = s * 5;
  c.updateProjectionMatrix(); key.target.updateMatrixWorld();
}

// ---------------------------------------------------------------- realistic materials and textures
// Physical material: clearcoat for lacquer/ceramics, transmission-free glass (cheap, no extra pass).
const pmat = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: 0.4, metalness: 0.0 }, o));
// Glass that reads as glass without a transmission pass: thin, transparent, reflective edges.
const glassMat = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: "#dfeef0", roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide }, o));
// Procedural wood (planks or a single board): grain lines + knots, seeded.
function woodTex({ base = "#6b4128", dark = "#3e2214", light = "#8a5a3a", planks = 1, w = 1024, h = 1024, seed = 5 } = {}) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), r = mulberry32(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const ph = h / planks;
  for (let p = 0; p < planks; p++) {
    const y0 = p * ph, tone = (r() - 0.5) * 0.18;
    x.fillStyle = tone > 0 ? `rgba(255,220,180,${tone})` : `rgba(0,0,0,${-tone})`; x.fillRect(0, y0, w, ph);
    for (let i = 0; i < ph * 0.9; i++) {
      const yy = y0 + r() * ph, amp = 2 + r() * 6, f = 0.004 + r() * 0.01, ph0 = r() * 6.28;
      x.strokeStyle = r() < 0.5 ? `rgba(30,14,6,${0.05 + r() * 0.12})` : `rgba(${light === "#8a5a3a" ? "160,110,70" : "200,170,130"},${0.04 + r() * 0.08})`;
      x.lineWidth = 0.6 + r() * 1.6; x.beginPath();
      for (let xx = 0; xx <= w; xx += 16) { const yv = yy + Math.sin(xx * f + ph0) * amp; xx ? x.lineTo(xx, yv) : x.moveTo(xx, yv); }
      x.stroke();
    }
    for (let k = 0; k < 2; k++) { const kx = r() * w, ky = y0 + ph * (0.2 + r() * 0.6), g = x.createRadialGradient(kx, ky, 1, kx, ky, 14 + r() * 14); g.addColorStop(0, "rgba(25,10,4,0.6)"); g.addColorStop(1, "rgba(25,10,4,0)"); x.fillStyle = g; x.beginPath(); x.ellipse(kx, ky, 40, 12, 0, 0, Math.PI * 2); x.fill(); }
    if (planks > 1) { x.fillStyle = "rgba(10,4,2,0.75)"; x.fillRect(0, y0, w, 3); }
  }
  const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
// Fine noise (fabric, paper, plaster). Use as roughnessMap/bumpMap or a light colour map.
function noiseTex({ w = 512, h = 512, base = "#808080", amount = 0.18, size = 1.5, seed = 9, weave = false } = {}) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), r = mulberry32(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w * h * 0.12; i++) { const v = r(); x.fillStyle = v < 0.5 ? `rgba(0,0,0,${amount * r()})` : `rgba(255,255,255,${amount * r()})`; x.fillRect(r() * w, r() * h, size, size); }
  if (weave) { x.strokeStyle = "rgba(0,0,0,0.05)"; x.lineWidth = 1; for (let i = 0; i < w; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 4) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } }
  const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// Soft round light (bokeh) texture.
const BOKEH = (() => { const c = makeCanvas(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.55, "rgba(255,255,255,0.55)"); g.addColorStop(0.8, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return texFrom(c); })();
// Out-of-focus lights spread over a wide area behind the subject (backdrop: fills the whole frame,
// never checked by the QA, never framed). They drift slowly so a wide shot is never frozen.
// API: { group, update(t) } — call update(t) from the scene's anim.
function makeBokeh({ n = 60, center = [0, 3, -14], spread = [36, 18, 8], size = [0.5, 1.6], colors = ["#ffb35c", "#ffd08a", "#ff8a3c", "#fff1d6"], seed = 21, opacity = 0.55, drift = 0.25 } = {}) {
  const r = mulberry32(seed), group = new THREE.Group(), items = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.SpriteMaterial({ map: BOKEH, color: colors[Math.floor(r() * colors.length)], transparent: true, opacity: opacity * (0.35 + r() * 0.65), depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false });
    const s = new THREE.Sprite(m); const k = size[0] + r() * (size[1] - size[0]); s.scale.set(k, k, 1);
    const p = new V3(center[0] + (r() - 0.5) * spread[0], center[1] + (r() - 0.5) * spread[1], center[2] + (r() - 0.5) * spread[2]);
    s.position.copy(p); s.userData.decor = true; group.add(s); items.push({ s, p, ph: r() * 6.28, sp: 0.2 + r() * 0.5, o: m.opacity });
  }
  group.userData.decor = true;
  return { group, update(t) { for (const it of items) { it.s.position.set(it.p.x + Math.sin(t * it.sp * 0.6 + it.ph) * drift * 2, it.p.y + Math.cos(t * it.sp * 0.5 + it.ph) * drift, it.p.z); it.s.material.opacity = it.o * (0.75 + 0.25 * Math.sin(t * it.sp * 2 + it.ph)); } } };
}
// Marks a whole subtree as backdrop: context scenery that may fill the frame, is never framed by
// CAM.pose/envelope and never checked by the QA. The subject of the shot stays a registered hero.
function asBackdrop(obj) { obj.traverse((n) => { n.userData.decor = true; }); return obj; }

// ---------------------------------------------------------------- boxes (shared by framing and QA)
// Exact world-space box of an object's visible meshes (vertex-precise), skipping decoration
// (userData.decor) and sprites. Instanced meshes count all their instances.
// {all: true} also measures hidden parts (used for framing things that appear later).
const _p = new V3();
function heroBox(obj, o = {}) {
  const box = new THREE.Box3(), tmp = new THREE.Box3();
  obj.updateWorldMatrix(true, true);
  (function visit(n) {
    if ((!n.visible && !o.all) || n.userData.decor || n.isSprite || n.isPoints) return;
    if (n.isInstancedMesh) {
      n.computeBoundingBox(); tmp.copy(n.boundingBox).applyMatrix4(n.matrixWorld); box.union(tmp);
    } else if ((n.isMesh || n.isLine || n.isLineSegments) && n.geometry) {
      const pos = n.geometry.attributes.position;
      if (pos && pos.count <= 20000) { for (let i = 0; i < pos.count; i++) box.expandByPoint(_p.fromBufferAttribute(pos, i).applyMatrix4(n.matrixWorld)); }
      else { if (!n.geometry.boundingBox) n.geometry.computeBoundingBox(); tmp.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld); box.union(tmp); }
    }
    for (const c of n.children) visit(c);
  })(obj);
  return box;
}
// World box of a sprite at its full size (userData.w), whatever its current pop scale.
function spriteBox(s) {
  s.updateWorldMatrix(true, false);
  const p = s.getWorldPosition(new V3()); const ws = s.parent ? s.parent.getWorldScale(new V3()).x : 1;
  const w = (s.userData.w || s.scale.x) * ws, img = s.material.map.image, h = w * img.height / img.width;
  return new THREE.Box3(p.clone().sub(new V3(w / 2, h / 2, w / 4)), p.clone().add(new V3(w / 2, h / 2, w / 4)));
}
// Union box for framing: objects, sprites (at full size), [[min],[max]] arrays, Box3.
// frameBox() measures every part, hidden ones too (things that appear later in the shot).
function frameBox(...items) { return boxOf(items, true); }
function visibleUpTo(n, root) { for (let o = n; o; o = o.parent) { if (!o.visible) return false; if (o === root) return true; } return true; }
function boxOf(items, all) {
  const box = new THREE.Box3();
  for (const it of items) {
    if (!it) continue;
    if (it.isBox3) box.union(it);
    else if (Array.isArray(it) && Array.isArray(it[0])) box.union(new THREE.Box3(new V3(...it[0]), new V3(...it[1])));
    else if (it.isSprite) { if (all || it.visible) box.union(spriteBox(it)); }
    else if (it.isObject3D) {
      const b = heroBox(it, { all }); if (!b.isEmpty()) box.union(b);
      it.traverse((n) => { if (n !== it && n.isSprite && !n.userData.decor && (all || visibleUpTo(n, it))) box.union(spriteBox(n)); });
    }
  }
  return box;
}
// Envelope of a shot: runs `anim(t)` (the scene's object animation, no camera) across [t0, t1]
// and unions the boxes of what is visible at every step. Frame this, and nothing that moves
// can leave the shot.
function envelope(objs, anim, t0, t1, dt = 0.1) {
  const box = new THREE.Box3(); const list = Array.isArray(objs) ? objs : [objs];
  for (let t = t0; t <= t1 + 1e-6; t += dt) { anim(Math.min(t, t1)); box.union(boxOf(list, false)); }
  anim(t0); return box;
}

// ---------------------------------------------------------------- camera rig (layout-aware)
const CAM = (() => {
  const _v = new V3();
  const DEF = LAYOUT.camera || { pad_px: 28, fov: 40, from: [0, 0.35, 1] };
  function zoneRect(z) { return typeof z === "string" ? ZONES[z] : z; }
  // Optical centre at (cx, cy) in canvas px; `fov` is the vertical lens angle over the full 1920 px.
  function setPrincipal(cx, cy, fov) {
    const fullW = 2 * Math.max(cx, W - cx), fullH = 2 * Math.max(cy, H - cy);
    const f = (H / 2) / Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((fullH / 2) / f));
    camera.aspect = fullW / fullH;
    camera.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, W, H);
    camera.updateProjectionMatrix();
  }
  function toBox(target) {
    if (target && target.isBox3) return target;
    if (Array.isArray(target) && Array.isArray(target[0]) && typeof target[0][0] === "number") return new THREE.Box3(new V3(...target[0]), new V3(...target[1]));
    return frameBox(...(Array.isArray(target) ? target : [target]));
  }
  function projectBox(box) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, behind = false;
    for (let i = 0; i < 8; i++) {
      _v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      _v.applyMatrix4(camera.matrixWorldInverse); if (_v.z > -camera.near) behind = true;
      _v.applyMatrix4(camera.projectionMatrix);
      const px = (_v.x + 1) / 2 * W, py = (1 - _v.y) / 2 * H;
      x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, behind };
  }
  function place(look, dir, d) { camera.position.copy(look).addScaledVector(dir, d); camera.up.set(0, 1, 0); camera.lookAt(look); camera.updateMatrixWorld(); }
  // pose(target, {zone, pad, fov, from, look, pull})
  //   target: object(s), Box3, [[min],[max]] or an envelope(); zone: name in config/layout.json;
  //   from: direction from the subject to the camera; pull > 1 backs off (more room), never < 1.
  // Returns the closest camera at which the target's projected box fits inside zone minus pad.
  function pose(target, o = {}) {
    const zone = zoneRect(o.zone || "stage"), pad = o.pad ?? DEF.pad_px, fov = o.fov ?? DEF.fov;
    const box = toBox(target);
    const look = o.look ? new V3(...o.look) : box.getCenter(new V3());
    const dir = new V3(...(o.from || DEF.from)).normalize();
    const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
    setPrincipal(cx, cy, fov);
    const fits = (d) => { place(look, dir, d); const r = projectBox(box); return !r.behind && r.x >= zone.x + pad && r.y >= zone.y + pad && r.x + r.w <= zone.x + zone.w - pad && r.y + r.h <= zone.y + zone.h - pad; };
    let lo = 0.05, hi = 800;
    if (!fits(hi)) console.warn("CAM.pose: alvo não cabe na zona", o.zone);
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
    const d = hi * Math.max(1, o.pull || 1);
    return { pos: look.clone().addScaledVector(dir, d), look: look.clone(), cx, cy, fov, dist: d, zone };
  }
  // A hand-placed shot (still optically centred on a zone). QA verifies it.
  function at(pos, look, o = {}) { const z = zoneRect(o.zone || "stage"); return { pos: new V3(...pos), look: new V3(...look), cx: z.x + z.w / 2, cy: z.y + z.h / 2, fov: o.fov ?? DEF.fov, dist: new V3(...pos).distanceTo(new V3(...look)), zone: z }; }
  function blend(a, b, k) { return { pos: a.pos.clone().lerp(b.pos, k), look: a.look.clone().lerp(b.look, k), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), fov: lerp(a.fov, b.fov, k), dist: lerp(a.dist, b.dist, k), zone: k < 0.5 ? a.zone : b.zone }; }
  // Pick along a list of [time, pose] keys, easing between consecutive keys over `ease` seconds before each key.
  function track(t, keys, ease = 1.0) {
    let p = keys[0][1];
    for (let i = 1; i < keys.length; i++) { const [tk, pk] = keys[i]; const e = keys[i][2] ?? ease; if (t >= tk - e) p = blend(p, pk, sm(t, tk - e, tk)); }
    return p;
  }
  // Deterministic shake: a small offset that decays over `dur` seconds after `t0`.
  function shake(p, t, t0, amp, dur) {
    const k = 1 - lin(t, t0, t0 + dur); if (t < t0 || k <= 0) return p;
    const o = { ...p, pos: p.pos.clone(), look: p.look.clone() }; const a = amp * k * p.dist * 0.1;
    o.pos.x += Math.sin(t * 61) * a; o.pos.y += Math.cos(t * 47) * a; return o;
  }
  let last = null;
  function apply(p) {
    last = p; setPrincipal(p.cx, p.cy, p.fov);
    camera.position.copy(p.pos); camera.up.set(0, 1, 0); camera.lookAt(p.look); camera.updateMatrixWorld();
    scene.fog.near = p.dist * 1.15 + 1.5; scene.fog.far = p.dist * 3.2 + 12;
    fitShadow(p.look, p.dist);
  }
  return { pose, at, blend, track, shake, apply, projectBox, toBox, setPrincipal, get last() { return last; } };
})();

// sparks: seeded burst, pure function of time
function makeSparks(n, seed) {
  const r = mulberry32(seed); const v = []; for (let i = 0; i < n; i++) v.push([(r() - 0.5) * 3.2, r() * 2.6 + 0.6, (r() - 0.2) * 2.2]);
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: "#ffd36b", size: 0.06, transparent: true, depthWrite: false, toneMapped: false }));
  p.userData = { v, n, decor: true }; p.visible = false; p.frustumCulled = false; return p;
}
function updateSparks(p, t, at, origin) {
  const dt = t - at; if (dt < 0 || dt > 0.9) { p.visible = false; return; }
  p.visible = true; const a = p.geometry.attributes.position.array; const { v, n } = p.userData;
  for (let i = 0; i < n; i++) { a[i * 3] = origin.x + v[i][0] * dt; a[i * 3 + 1] = origin.y + v[i][1] * dt - 4.9 * dt * dt; a[i * 3 + 2] = origin.z + v[i][2] * dt; }
  p.geometry.attributes.position.needsUpdate = true; p.material.opacity = 1 - dt / 0.9;
}

// ---------------------------------------------------------------- scenes + QA registry
const SCENES = [];
let ACTIVE = null, LAST_T = 0;
// addScene(name, t0, t1, (S) => { ...build...; return (t) => { ...update; CAM.apply(pose) } })
//   S.add(obj)                        add to the scene group
//   S.hero(obj, name, {when})         must stay fully inside the safe zone; no text may cover it
//   S.label(sprite, name, {on, when}) 3D text: inside the safe zone; may only overlap the hero named in `on`
//   S.solid(obj, name, {restsOn})     must not pass through other solids; may touch (not sink into) restsOn
//   S.scenery(obj, name, {when})      environment that may run past the frame (a crowd, a skyline),
//                                     but no text may sit on it
//   `when: (t) => bool` limits a check to the moments the object is the subject of the shot.
function addScene(name, t0, t1, build) {
  const s = { name, t0, t1, group: new THREE.Group(), heroes: [], labels: [], solids: [], scenery: [], update: null };
  s.group.visible = false; scene.add(s.group);
  const S = {
    group: s.group, t0, t1,
    add: (...objs) => { s.group.add(...objs); return objs[0]; },
    hero: (obj, name, o = {}) => { s.heroes.push({ obj, name, when: o.when || null }); return obj; },
    label: (spr, name, o = {}) => { s.labels.push({ obj: spr, name, on: o.on || null, when: o.when || null }); return spr; },
    solid: (obj, name, o = {}) => { s.solids.push({ obj, name, restsOn: o.restsOn || [], when: o.when || null }); return obj; },
    scenery: (obj, name, o = {}) => { s.scenery.push({ obj, name, when: o.when || null }); return obj; },
  };
  s.update = build(S);
  // shadows: every lit, opaque mesh casts and receives (glass, text faces and sprites do not cast)
  s.group.traverse((n) => {
    if (!n.isMesh || n.userData.noShadow) return;
    const ms = Array.isArray(n.material) ? n.material : [n.material];
    const lit = ms.some((m) => m && (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial));
    const opaque = ms.every((m) => m && !m.transparent);
    n.receiveShadow = lit; n.castShadow = lit && opaque;
  });
  SCENES.push(s);
}

function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
function spriteRect(spr) {
  const p = new V3(); spr.getWorldPosition(p); const ws = new V3(); spr.getWorldScale(ws);
  const right = new V3().setFromMatrixColumn(camera.matrixWorld, 0), up = new V3().setFromMatrixColumn(camera.matrixWorld, 1);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const q = p.clone().addScaledVector(right, sx * ws.x / 2).addScaledVector(up, sy * ws.y / 2).project(camera);
    const px = (q.x + 1) / 2 * W, py = (1 - q.y) / 2 * H; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function boxVolume(b) { const s = b.getSize(new V3()); return Math.max(0, s.x) * Math.max(0, s.y) * Math.max(0, s.z); }
const _toPx = (v) => { const q = v.clone().project(camera); return { x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H, front: q.z < 1 }; };
// On-screen height (px) of the capital letters printed on a plate, or null when the plate faces away.
function plateCapPx(m) {
  const pd = m.userData.plate; m.updateWorldMatrix(true, false);
  const c = new V3(0, 0, pd.depth / 2).applyMatrix4(m.matrixWorld);
  const nrm = new V3(0, 0, 1).transformDirection(m.matrixWorld), toCam = camera.position.clone().sub(c).normalize();
  if (nrm.dot(toCam) < 0.35) return null;
  const a = _toPx(new V3(0, -pd.h / 2, pd.depth / 2).applyMatrix4(m.matrixWorld)), b = _toPx(new V3(0, pd.h / 2, pd.depth / 2).applyMatrix4(m.matrixWorld));
  if (!a.front || !b.front) return null;
  return Math.hypot(a.x - b.x, a.y - b.y) * pd.frac * 0.72;
}
// Share (%) of the 3D picture that clearly changed (luminance step > 16) against the picture
// `lag` calls ago, on a 108x192 thumbnail. The QA seeks in order and asks with lag = 1 s, so a
// slow push-in counts as motion and a frozen shot does not. null until there is history.
const _mo = makeCanvas(108, 192), _moCtx = _mo.getContext("2d", { willReadFrequently: true }), _moHist = [];
function worldMotion(lag) {
  _moCtx.drawImage(renderer.domElement, 0, 0, 108, 192); const d = _moCtx.getImageData(0, 0, 108, 192).data;
  const cur = new Float32Array(108 * 192); for (let i = 0; i < cur.length; i++) cur[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11;
  _moHist.push(cur); if (_moHist.length > 64) _moHist.shift();
  const prev = _moHist[_moHist.length - 1 - lag]; if (!prev) return null;
  let n = 0; for (let i = 0; i < cur.length; i++) if (Math.abs(cur[i] - prev[i]) > 16) n++;
  return (100 * n) / cur.length;
}
window.__qa = {
  frame(o = {}) {
    const s = ACTIVE; if (!s) return null;
    const active = (x) => !x.when || x.when(LAST_T);
    const heroes = s.heroes.filter((h) => active(h) && shown(h.obj)).map((h) => { const b = heroBox(h.obj); return b.isEmpty() ? null : { name: h.name, rect: CAM.projectBox(b) }; }).filter(Boolean);
    const labels = s.labels.filter((l) => active(l) && shown(l.obj) && l.obj.scale.x > 0.01).map((l) => ({ name: l.name, on: l.on, rect: spriteRect(l.obj) }));
    const clip = (r) => { const x0 = Math.max(0, r.x), y0 = Math.max(0, r.y), x1 = Math.min(W, r.x + r.w), y1 = Math.min(H, r.y + r.h); return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) }; };
    const scenery = s.scenery.filter((x) => active(x) && shown(x.obj)).map((x) => { const b = heroBox(x.obj); return b.isEmpty() ? null : { name: x.name, rect: clip(CAM.projectBox(b)) }; }).filter(Boolean);
    const solids = [];
    const live = s.solids.filter((x) => active(x) && shown(x.obj)).map((x) => ({ ...x, box: heroBox(x.obj) })).filter((x) => !x.box.isEmpty());
    for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];
      const inter = a.box.clone().intersect(b.box); if (inter.isEmpty()) continue;
      if (a.restsOn.includes(b.name) || b.restsOn.includes(a.name)) {
        // resting contact is fine; sinking into the support is not
        const sz = inter.getSize(new V3()); const depth = Math.min(sz.x, sz.y, sz.z);
        if (depth > LAYOUT.qa.contact_tol) solids.push({ a: a.name, b: b.name, ratio: +depth.toFixed(3), kind: "afundou" });
        continue;
      }
      const ratio = boxVolume(inter) / Math.max(1e-9, Math.min(boxVolume(a.box), boxVolume(b.box)));
      if (ratio > LAYOUT.qa.solid_overlap_ratio) solids.push({ a: a.name, b: b.name, ratio: +ratio.toFixed(3), kind: "atravessou" });
    }
    // every registered object on screen, `when` or not (QA: quadro_vazio)
    const SAFE = LAYOUT.safe, safeArea = SAFE.w * SAFE.h;
    const onArea = (r) => { const x0 = Math.max(SAFE.x, r.x), y0 = Math.max(SAFE.y, r.y), x1 = Math.min(SAFE.x + SAFE.w, r.x + r.w), y1 = Math.min(SAFE.y + SAFE.h, r.y + r.h); return Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / safeArea; };
    let onscreen = 0;
    for (const x of s.heroes.concat(s.solids, s.scenery)) { if (!shown(x.obj)) continue; const b = heroBox(x.obj); if (b.isEmpty()) continue; const r = CAM.projectBox(b); if (!r.behind && onArea(r) > 0.01) onscreen++; }
    // printed text of the heroes in the shot, and 3D labels (QA: texto3d_ilegivel)
    const texts3d = [];
    for (const h of s.heroes) if (active(h) && shown(h.obj)) h.obj.traverse((m) => {
      if (!m.userData.plate || m.userData.plate.detail || !shown(m)) return;
      const px = plateCapPx(m); if (px !== null) texts3d.push({ name: h.name, text: m.userData.plate.text, px: +px.toFixed(1) });
    });
    for (const l of labels) { const spr = s.labels.find((x) => x.name === l.name).obj, f = spr.material.map.userData.textFrac; if (f) texts3d.push({ name: l.name, text: l.name, px: +(l.rect.h * f * 0.72).toFixed(1) }); }
    // photos on screen: size and how much the source image is stretched (QA: foto_sem_credito, foto_em_baixa_resolucao)
    const photos = [];
    s.group.traverse((m) => {
      if (!m.userData.photo || !shown(m)) return;
      const r = CAM.projectBox(heroBox(m)); if (r.behind || onArea(r) < 0.01) return;
      const ph = m.userData.photo, tex = m.material.map;
      const shownPx = ph.imgH * tex.repeat.y;
      photos.push({ id: ph.id, rect: r, upscale: +(r.h / Math.max(1, shownPx)).toFixed(2) });
    });
    return { t: LAST_T, scene: s.name, zone: CAM.last && CAM.last.zone, heroes, labels, solids, scenery, onscreen, texts3d, photos, motion: o.lag ? worldMotion(o.lag) : null };
  },
  // Cover (tools/capa.cjs): the same shot with the camera moved along its own angle until the heroes
  // and 3D labels on screen fit `zone` (the headline band is left free for the cover title).
  // Renders and returns the new frame; the next __seek() goes back to the video's own camera.
  reframe(zone, pull = 1.06) {
    const s = ACTIVE, p = CAM.last; if (!s || !p) return null;
    const active = (x) => !x.when || x.when(LAST_T);
    const objs = s.heroes.concat(s.labels).filter((x) => active(x) && shown(x.obj)).map((x) => x.obj);
    if (!objs.length) return null;
    CAM.apply(CAM.pose(boxOf(objs, false), { zone, from: p.pos.clone().sub(p.look).toArray(), fov: p.fov, pull }));
    renderer.render(scene, camera);
    return window.__qa.frame();
  },
};

function renderAt(t) {
  LAST_T = t;
  let active = SCENES[0];
  for (const s of SCENES) if (t >= s.t0 && t < s.t1) active = s;
  if (t >= SCENES[SCENES.length - 1].t1) active = SCENES[SCENES.length - 1];
  for (const s of SCENES) s.group.visible = s === active;
  ACTIVE = active; resetLights();
  active.update(t);
  renderer.render(scene, camera);
}
