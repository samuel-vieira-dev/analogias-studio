// ============================================================================
// videos/2026-10-30-terras-raras/scenes.js
// 3D scenes synced to audio/words.json (narration 0–98.4 s, video 100.4 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Generic imagery only: no car or mining brands. The two photo cards (Lula 74.6–76.96,
// Flávio 77.0–82.72) cover the stage: no hero is registered behind them.
// ============================================================================

// ---------------------------------------------------------------- local helpers
const PAPER = "#fbf7ef", INK = "#1c1410", GOLD = "#e0a83a", STEEL = "#8b9196", EARTH = "#7a4a2e";
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.06 }, o));
const detailAll = (obj) => obj.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; });
// Shrinks an object away from `at` (shown at full size `base` before). For an object that also pops in,
// use popInOut. Every call sets the state for its own t, so envelope() sweeps leave nothing behind.
function popOut(obj, t, at, d = 0.3, base = 1) { const k = 1 - sm(t, at, at + d); obj.scale.setScalar(Math.max(0.0001, k * base)); obj.visible = k > 0.01; }
// Pops in at `a` and shrinks away from `b`.
function popInOut(obj, t, a, b, d = 0.4, base = 1) { const k = pop(t, a, d) * (1 - sm(t, b, b + 0.3)); obj.scale.setScalar(Math.max(0.0001, k * base)); obj.visible = k > 0.01; }

// Small environment for metals (local to the materials that use it; the scene keeps no global envMap).
const ENV = (() => {
  const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
  const panel = (c, i, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); };
  es.background = new THREE.Color("#4a3428");
  panel("#ffd2a8", 4.0, 4, 6, 5, 6, 4); panel("#9ab8ff", 2.2, -6, 4, -4, 6, 5); panel("#ff8a4a", 2.4, 0, -3, 6, 10, 2); panel("#ffffff", 3.2, -3, 8, 3, 3, 3); panel("#ffe9d0", 2.0, 0, 2, 8, 8, 3);
  const tex = pm.fromScene(es, 0.03).texture; pm.dispose(); return tex;
})();
const chrome = (color = "#dfe3e8", o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: 0.14, envMap: ENV, envMapIntensity: 1.3 }, o));

function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Upright panel (w x h, 0.03 deep) whose front face (+z) is a repaintable canvas. Origin: centre.
// Registered as a plate so the QA measures its text (frac = cap height / panel height).
function makeScreenPanel(w, h, painter, { px = 512, frac = 0.3, bg = "#141414", label = "painel" } = {}) {
  const ct = canvasTex(px, Math.round(px * h / w), painter);
  const side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), side]);
  m.userData.plate = { text: label, w, h, depth: 0.03, frac, detail: false };
  return { mesh: m, paint: ct.paint };
}
// Cylinder between two points (rope, rod). API: set(a, b).
function makeRod(r, material) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), material);
  const set = (a, b) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, Math.max(0.001, L), 1); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); };
  return { mesh: m, set };
}

// ---------------------------------------------------------------- flags
// Five-pointed star, one point towards angle `rot` (radians, 0 = up).
function drawStar(x, cx, cy, r, rot = 0) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r * 0.382 : r; x.lineTo(cx + Math.sin(a) * rr, cy - Math.cos(a) * rr); }
  x.closePath(); x.fill();
}
// Flag faces drawn to the official proportions. "china": 3:2, big star and four small stars, each small
// star with one point aimed at the centre of the big one. "brasil": green, yellow rhombus, blue disc with
// the white band (no motto lettering, too small to read).
function flagPainter(kind) {
  if (kind === "china") return (x, w, h) => {
    const u = w / 30; x.fillStyle = "#de2910"; x.fillRect(0, 0, w, h); x.fillStyle = "#ffde00";
    drawStar(x, 5 * u, 5 * u, 3 * u, 0);
    for (const [sx, sy] of [[10, 2], [12, 4], [12, 7], [10, 9]]) { const a = Math.atan2(5 - sx, -(5 - sy)); drawStar(x, sx * u, sy * u, u, a); }
  };
  if (kind === "brasil") return (x, w, h) => {
    x.fillStyle = "#009c3b"; x.fillRect(0, 0, w, h);
    const m = h * 0.085; x.fillStyle = "#ffdf00"; x.beginPath(); x.moveTo(m * 1.2, h / 2); x.lineTo(w / 2, m); x.lineTo(w - m * 1.2, h / 2); x.lineTo(w / 2, h - m); x.closePath(); x.fill();
    const r = h * 0.25; x.fillStyle = "#002776"; x.beginPath(); x.arc(w / 2, h / 2, r, 0, Math.PI * 2); x.fill();
    x.save(); x.beginPath(); x.arc(w / 2, h / 2, r, 0, Math.PI * 2); x.clip();
    x.strokeStyle = "#ffffff"; x.lineWidth = r * 0.16; x.beginPath(); x.arc(w / 2 - r * 0.35, h / 2 + r * 2.0, r * 2.2, -Math.PI * 0.72, -Math.PI * 0.2); x.stroke(); x.restore();
    x.fillStyle = "#ffffff"; for (const [a, b] of [[0.47, 0.6], [0.53, 0.64], [0.5, 0.7], [0.44, 0.66], [0.56, 0.58]]) { x.beginPath(); x.arc(w * a, h * b, h * 0.008, 0, 6.3); x.fill(); }
  };
  throw new Error("bandeira desconhecida: " + kind);
}
function flagTex(kind, w = 600, h = 400) { return canvasTex(w, h, flagPainter(kind)).tex; }
// Flat flag panel (w x h) facing +z, like a plate. Origin: centre.
function makeFlagPanel(kind, w, h) {
  const side = mat("#e8e2d8");
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: flagTex(kind), toneMapped: false }), side]);
}
// Flag waving on a pole. Origin: foot of the pole. The cloth hangs from the pole's top towards +x.
// API: { group, update(t) }
function makeWavingFlag(kind, { w = 1.5, h = 1.0, pole = 3.2 } = {}) {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, pole, 12), mat("#d9d9d9", { metalness: 0.7, roughness: 0.3 })); p.position.y = pole / 2; g.add(p);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); knob.position.y = pole + 0.05; g.add(knob);
  const geo = new THREE.PlaneGeometry(w, h, 24, 10); geo.translate(w / 2, 0, 0);
  const base = geo.attributes.position.array.slice();
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: flagTex(kind), side: THREE.DoubleSide, roughness: 0.8 }));
  cloth.position.set(0.04, pole - h / 2 - 0.05, 0); g.add(cloth);
  const update = (t) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      const x = base[i], y = base[i + 1], k = x / w;
      a[i + 2] = Math.sin(x * 3.2 - t * 5.0 + y * 0.8) * 0.12 * k + Math.sin(x * 6.0 - t * 7.3) * 0.03 * k;
      a[i + 1] = y - 0.04 * k * k;
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  };
  update(0);
  g.add(contactShadow(0.5, 0.5));
  return { group: g, update };
}

// ---------------------------------------------------------------- vehicles, mine, ship
// Mining dump truck along +x (cab in front, tipping bed with an ore heap at the back). Origin: floor centre.
// Length ~2.0, width ~1.0. API { group, cabMat }
function makeDumpTruck({ color = "#f2b632" } = {}) {
  const g = new THREE.Group(), paint = mat(color, { roughness: 0.45 }), dark = mat("#262626", { roughness: 0.7 });
  const chassis = new THREE.Mesh(rbox(1.9, 0.18, 0.7, 0.04), dark); chassis.position.y = 0.42; g.add(chassis);
  const cab = new THREE.Mesh(rbox(0.55, 0.6, 0.86, 0.07), paint); cab.position.set(0.62, 0.81, 0); g.add(cab);
  const win = new THREE.Mesh(rbox(0.05, 0.28, 0.72, 0.02), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); win.position.set(0.9, 0.88, 0); g.add(win);
  const side = new THREE.Mesh(rbox(0.36, 0.24, 0.02, 0.01), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); side.position.set(0.62, 0.9, 0.435); g.add(side);
  // bed: trapezoid profile extruded across the width
  const s = new THREE.Shape(); s.moveTo(-0.62, 0); s.lineTo(0.28, 0); s.lineTo(0.36, 0.5); s.lineTo(-0.78, 0.5); s.closePath();
  const bedGeo = new THREE.ExtrudeGeometry(s, { depth: 0.92, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 }); bedGeo.translate(0, 0, -0.46);
  const bed = new THREE.Mesh(bedGeo, paint); bed.position.set(-0.22, 0.52, 0); g.add(bed);
  const rnd = mulberry32(17), cols = ["#8a4a2e", "#6e3b26", "#9c5a36", "#5a3222"];
  for (let i = 0; i < 9; i++) { const r = 0.12 + rnd() * 0.06; const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat(cols[i % 4], { roughness: 0.9, flatShading: true })); m.position.set(-0.75 + (i % 3) * 0.3 + rnd() * 0.05, 1.02 + Math.floor(i / 3) * 0.05 + (i === 4 ? 0.1 : 0), -0.25 + Math.floor(i / 3) * 0.25); m.rotation.set(rnd() * 3, rnd() * 3, 0); g.add(m); }
  for (const [x, z] of [[0.62, 0.42], [0.62, -0.42], [-0.45, 0.42], [-0.45, -0.42], [-0.8, 0.42], [-0.8, -0.42]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 20), mat("#141414", { roughness: 0.8 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.24, z); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.21, 12), mat("#9a9a9a", { metalness: 0.6 })); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub);
  }
  g.add(contactShadow(2.4, 1.4));
  return { group: g, cabMat: paint };
}
// Open-pit mine: a ground tile (W x D, height H) with a round pit cut in it and stepped terraces
// going down. Origin: floor centre; the ground top is at y = H. API { group, H, rim, floorY }
function makeOpenPit({ W = 6.0, D = 4.4, H = 1.0, r = 1.9, steps = 4 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-W / 2, -D / 2); s.lineTo(W / 2, -D / 2); s.lineTo(W / 2, D / 2); s.lineTo(-W / 2, D / 2); s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, r, 0, Math.PI * 2, true); s.holes.push(hole);
  const tile = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: H, bevelEnabled: false, curveSegments: 48 }), [mat("#5f8a3a", { roughness: 0.9 }), mat("#7a4a2e", { roughness: 0.95 })]);
  tile.rotation.x = -Math.PI / 2; g.add(tile);   // extrudes along +y after the turn
  // the top face of the extrusion is its "cap" (material 0 = green), the sides are material 1 (earth)
  const cols = ["#b5683c", "#a25a33", "#8f4d2c", "#7c4226", "#6a3820"];
  for (let i = 0; i < steps; i++) {
    const ro = r * (1 - i / (steps + 0.6)), ri = r * (1 - (i + 1) / (steps + 0.6)), top = H * (1 - (i + 1) / (steps + 1));
    const a = new THREE.Shape(); a.absarc(0, 0, ro, 0, Math.PI * 2, false); const hp = new THREE.Path(); hp.absarc(0, 0, ri, 0, Math.PI * 2, true); a.holes.push(hp);
    const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(a, { depth: top, bevelEnabled: false, curveSegments: 48 }), mat(cols[i], { roughness: 0.95 })); ring.rotation.x = -Math.PI / 2; g.add(ring);
  }
  const ri = r * (1 - steps / (steps + 0.6)), floorY = H * (1 / (steps + 1)) * 0.6;
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(ri, ri, floorY, 40), mat(cols[4], { roughness: 0.95 })); bottom.position.y = floorY / 2; g.add(bottom);
  g.add(contactShadow(W + 1.2, D + 1.2));
  return { group: g, H, rim: r, floorY };
}
// Cargo ship along +x: dark hull with a red waterline, bridge at the stern, stacked containers.
// A plate on the hull side (+z) carries `label`. Origin: waterline centre.
function makeShip(label = "EUA") {
  const g = new THREE.Group();
  const prof = new THREE.Shape(); prof.moveTo(-1.9, -0.25); prof.lineTo(1.4, -0.25); prof.quadraticCurveTo(2.1, -0.1, 2.25, 0.55); prof.lineTo(-1.9, 0.55); prof.closePath();
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 1.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }).translate(0, 0, -0.55), mat("#22313f", { roughness: 0.5 })); g.add(hull);
  const wl = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.16), mat("#a3271c", { roughness: 0.6 })); wl.position.set(0.0, -0.17, 0); g.add(wl);
  const bridge = new THREE.Mesh(rbox(0.6, 0.75, 0.9, 0.05), mat("#eeeae2")); bridge.position.set(-1.45, 0.55 + 0.375, 0); g.add(bridge);
  const bw = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.92), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); bw.position.set(-1.45, 1.15, 0); g.add(bw);
  const cc = ["#c0392b", "#2f6fb0", "#e0a83a", "#2fae66", "#8e44ad", "#d35400"]; let k = 0;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) for (let l = 0; l < (i % 2 ? 2 : 1); l++) {
    const c = new THREE.Mesh(rbox(0.62, 0.3, 0.42, 0.02), mat(cc[k++ % cc.length], { roughness: 0.6 })); c.position.set(-0.75 + i * 0.68, 0.55 + 0.15 + l * 0.31, -0.22 + j * 0.44); g.add(c);
  }
  const p = makePlate(label, 1.8, 0.7, { bg: "#ffffff", fg: "#22313f" }); p.position.set(0.4, 0.15, 0.585); g.add(p);
  return g;
}
// Water patch (decoration).
function makeWater(w, d) { const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), mat("#1f5468", { roughness: 0.25, metalness: 0.2 })); m.position.y = 0.03; m.userData.decor = true; return m; }

// Generic electric car along +x (no brand): body, cabin, glass, wheels. Origin: floor centre.
function makeCar({ color = "#2f6fb0" } = {}) {
  const g = new THREE.Group(), L = 2.2;
  const paint = mat(color, { roughness: 0.35, metalness: 0.25 });
  const body = new THREE.Mesh(rbox(L, 0.46, 1.0, 0.14), paint); body.position.y = 0.43; g.add(body);
  const cabin = new THREE.Mesh(rbox(L * 0.5, 0.4, 0.9, 0.12), paint); cabin.position.set(-0.1 * L, 0.84, 0); g.add(cabin);
  const glass = new THREE.Mesh(rbox(L * 0.46, 0.3, 0.92, 0.07), mat("#1b2733", { roughness: 0.15, metalness: 0.4 })); glass.position.set(-0.1 * L, 0.86, 0); g.add(glass);
  const wheels = [];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 24), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(sx * L * 0.31, 0.23, sz * 0.45); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 16), mat("#b0b0b0", { metalness: 0.6 })); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub); wheels.push(hub);
  }
  for (const sz of [-0.32, 0.32]) {
    const hl = new THREE.Mesh(rbox(0.04, 0.08, 0.24, 0.02), mat("#fff4c8", { emissive: "#ffe9a0", emissiveIntensity: 0.8 })); hl.position.set(L / 2 + 0.005, 0.52, sz); g.add(hl);
    const tl = new THREE.Mesh(rbox(0.04, 0.08, 0.24, 0.02), mat("#c0261b", { emissive: "#c0261b", emissiveIntensity: 0.5 })); tl.position.set(-L / 2 - 0.005, 0.52, sz); g.add(tl);
  }
  g.add(contactShadow(L + 0.6, 1.5));
  g.userData.L = L; return g;
}
// Glowing orange magnet disc (the rare-earth magnet). Origin: centre; faces +z. API { group, glow(k) }
function makeMagnet(r = 0.2, d = 0.08) {
  const g = new THREE.Group();
  const m = new THREE.MeshPhysicalMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.2, envMap: ENV, emissive: ORANGE, emissiveIntensity: 0.6 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d, 40), m); disc.rotation.x = Math.PI / 2; g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, d * 0.18, 8, 40), new THREE.MeshBasicMaterial({ color: "#ffb36b", toneMapped: false })); ring.position.z = d / 2; g.add(ring);
  return { group: g, glow: (k) => { m.emissiveIntensity = 0.3 + 1.6 * k; ring.scale.setScalar(1 + 0.08 * k); } };
}

// ---------------------------------------------------------------- scene props
// Clump of earth: many small rough grains (instanced) packed in a ball of radius R. explode(k, t)
// throws them outwards and down. Origin: centre. API { mesh, explode(k) }
function makeClump(R = 0.8, n = 170, seed = 3) {
  const rnd = mulberry32(seed), geo = new THREE.DodecahedronGeometry(1, 0);
  const mesh = new THREE.InstancedMesh(geo, mat("#ffffff", { roughness: 0.95, flatShading: true }), n);
  const cols = ["#6b4226", "#7a4b2b", "#5a3620", "#835233", "#4e2f1b"], data = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) {
    const dir = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), rr = R * Math.cbrt(0.15 + 0.85 * rnd());
    data.push({ p: dir.clone().multiplyScalar(rr), v: dir.clone().multiplyScalar(2.2 + rnd() * 2.0).add(new V3(0, 1.2, 0)), s: 0.11 + rnd() * 0.08, rot: [rnd() * 6, rnd() * 6, rnd() * 6], spin: rnd() * 8 });
    mesh.setColorAt(i, new THREE.Color(cols[i % cols.length]));
  }
  const explode = (k) => {
    for (let i = 0; i < n; i++) {
      const d = data[i], tt = k * 0.9, s = d.s * (1 - 0.85 * k);
      const p = d.p.clone().addScaledVector(d.v, tt); p.y -= 4.9 * tt * tt;
      e.set(d.rot[0] + d.spin * tt, d.rot[1], d.rot[2]); q.setFromEuler(e);
      m4.compose(p, q, new V3(s, s, s)); mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingBox(); mesh.computeBoundingSphere();
  };
  explode(0); mesh.instanceColor.needsUpdate = true;
  return { mesh, explode };
}
// Soil block cut open like a museum diorama: grass on top, four earth layers, and hundreds of small
// metal glints set in every layer (front and right faces). Origin: floor centre. API { group, top, twinkle(t) }
function makeSoilBlock({ W = 3.6, D = 2.2, H = 1.7 } = {}) {
  const g = new THREE.Group(), layers = [["#3e2414", 0.45], ["#5a3420", 0.4], ["#7a4a2e", 0.4], ["#93603a", 0.3]];
  let y = 0;
  for (const [c, h] of layers) { const m = new THREE.Mesh(rbox(W, h, D, 0.02), mat(c, { roughness: 0.95 })); m.position.y = y + h / 2; g.add(m); y += h; }
  const grass = new THREE.Mesh(rbox(W + 0.04, 0.12, D + 0.04, 0.03), mat("#4f8a35", { roughness: 0.9 })); grass.position.y = y + 0.06; g.add(grass);
  const top = y + 0.12, rnd = mulberry32(21);
  for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 5), mat("#5fa040")); b.position.set((rnd() - 0.5) * (W - 0.2), top + 0.07, (rnd() - 0.5) * (D - 0.2)); g.add(b); }
  const n = 260, gm = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 1, roughness: 0.15, envMap: ENV, emissive: "#ffcf8a", emissiveIntensity: 0.55 }), n);
  const tint = ["#e8ecf2", "#f0c66a", "#ffb08a", "#cfd8ff", "#f6e0a8"], gd = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    const front = i < n * 0.62, u = rnd(), v = rnd() * (top - 0.18) + 0.06;
    const p = front ? new V3((u - 0.5) * (W - 0.12), v, D / 2 + 0.012) : new V3(W / 2 + 0.012, v, (u - 0.5) * (D - 0.12));
    gd.push({ p, s: 0.022 + rnd() * 0.03, ph: rnd() * 6.28, rot: rnd() * 3 }); gm.setColorAt(i, new THREE.Color(tint[i % tint.length]));
  }
  gm.instanceColor.needsUpdate = true; gm.userData.decor = true; g.add(gm);
  const twinkle = (t) => {
    for (let i = 0; i < n; i++) { const d = gd[i], s = d.s * (0.75 + 0.45 * Math.max(0, Math.sin(t * 3.1 + d.ph))); q.setFromAxisAngle(new V3(0, 0, 1), d.rot + t * 0.4); m4.compose(d.p, q, new V3(s, s, s * 0.5)); gm.setMatrixAt(i, m4); }
    gm.instanceMatrix.needsUpdate = true; gm.computeBoundingSphere();
  };
  twinkle(0);
  g.add(contactShadow(W + 1, D + 1));
  return { group: g, top, twinkle };
}

// Phone that comes apart in layers (exploded view): back shell, battery, board with chips, speaker
// module (bottom), screen with a repaintable canvas (720x1500). Faces +z, height 1.64.
// API { group, ctx, tex, explode(k), speakerAnchor (V3, local), screenPoint(sx, sy) }
function makeExplodedPhone() {
  const g = new THREE.Group(), L = {};
  const canvas = makeCanvas(720, 1500), ctx = canvas.getContext("2d"), tex = texFrom(canvas);
  L.back = new THREE.Mesh(rbox(0.8, 1.64, 0.04, 0.09, 6), mat("#2a2d33", { metalness: 0.5, roughness: 0.3 }));
  const cam = new THREE.Mesh(rbox(0.22, 0.22, 0.03, 0.05), mat("#16181c", { metalness: 0.4, roughness: 0.3 })); cam.position.set(-0.22, 0.6, -0.03); L.back.add(cam);
  L.battery = new THREE.Mesh(rbox(0.6, 0.86, 0.05, 0.04), mat("#4a4f57", { roughness: 0.5, metalness: 0.3 })); L.battery.position.y = 0.05;
  L.board = new THREE.Group();
  const pcb = new THREE.Mesh(rbox(0.7, 0.42, 0.02, 0.02), mat("#1f6b3f", { roughness: 0.6 })); L.board.add(pcb); L.board.position.y = 0.55;
  for (const [x, y, w, h] of [[-0.22, 0.0, 0.18, 0.12], [0.02, 0.0, 0.14, 0.12], [0.22, 0.0, 0.14, 0.12]]) { const c = new THREE.Mesh(rbox(w, h, 0.025, 0.01), mat("#1a1a1a", { roughness: 0.4 })); c.position.set(x, y, 0.02); L.board.add(c); }
  L.speaker = new THREE.Group(); L.speaker.position.y = -0.66;
  const spk = new THREE.Mesh(rbox(0.34, 0.16, 0.05, 0.03), mat("#1a1a1a", { roughness: 0.5 })); L.speaker.add(spk);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24), mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.9 })); cone.rotation.x = Math.PI / 2; cone.position.z = 0.035; L.speaker.add(cone);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.014, 8, 32), new THREE.MeshBasicMaterial({ color: "#ffb36b", toneMapped: false, transparent: true, opacity: 0 })); halo.position.z = 0.05; halo.userData.decor = true; L.speaker.add(halo); L.halo = halo;
  L.screen = new THREE.Group();
  const glassBody = new THREE.Mesh(rbox(0.8, 1.64, 0.03, 0.09, 6), mat("#0c0c0c", { roughness: 0.2, metalness: 0.2 })); L.screen.add(glassBody);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 1.56), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = 0.017; L.screen.add(scr);
  const order = [["back", -0.04], ["battery", -0.005], ["board", -0.005], ["speaker", -0.005], ["screen", 0.03]];
  for (const [k] of order) g.add(L[k]);
  const spread = { back: [-1.0, 0], battery: [-0.5, 0], board: [-0.02, 0.06], speaker: [0.42, -0.1], screen: [0.92, 0] };
  const explode = (k) => {
    for (const [name, z0] of order) { const [dz, dy] = spread[name]; L[name].position.z = z0 + dz * k; L[name].userData.y0 ??= L[name].position.y; L[name].position.y = L[name].userData.y0 + dy * k; }
    L.screen.rotation.y = 0;
  };
  explode(0);
  return { group: g, ctx, tex, explode, layers: L, screenPoint: (sx, sy) => new V3((sx / 720 - 0.5) * 0.74, (0.5 - sy / 1500) * 1.56, 0.05) };
}
// Music player painted on the phone canvas: album art, track bars, progress, play/pause and an equaliser.
function paintPlayer(x, { playing = false, prog = 0, t = 0, press = 0 } = {}) {
  const w = 720, h = 1500;
  const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#2b1a12"); bg.addColorStop(1, "#120b08"); x.fillStyle = bg; x.fillRect(0, 0, w, h);
  const ag = x.createLinearGradient(110, 180, 610, 680); ag.addColorStop(0, "#ff8a3d"); ag.addColorStop(1, "#c2261b"); x.fillStyle = ag; roundRect(x, 110, 200, 500, 500, 36); x.fill();
  x.fillStyle = "rgba(255,255,255,0.92)"; x.beginPath(); x.ellipse(330, 560, 58, 44, -0.4, 0, 6.3); x.fill(); x.fillRect(374, 330, 22, 230); x.beginPath(); x.moveTo(396, 330); x.quadraticCurveTo(470, 360, 470, 440); x.quadraticCurveTo(440, 390, 396, 385); x.fill();
  x.fillStyle = "#f4e8da"; roundRect(x, 110, 760, 360, 34, 17); x.fill(); x.fillStyle = "#8a7a6e"; roundRect(x, 110, 820, 240, 26, 13); x.fill();
  x.fillStyle = "#3a2c25"; roundRect(x, 110, 920, 500, 12, 6); x.fill(); x.fillStyle = ORANGE; roundRect(x, 110, 920, Math.max(12, 500 * prog), 12, 6); x.fill();
  x.beginPath(); x.arc(110 + 500 * prog, 926, 16, 0, 6.3); x.fill();
  const r = 92 * (1 - 0.12 * press); x.fillStyle = ORANGE; x.beginPath(); x.arc(360, 1110, r, 0, 6.3); x.fill(); x.fillStyle = "#ffffff";
  if (playing) { x.fillRect(325, 1068, 24, 84); x.fillRect(371, 1068, 24, 84); }
  else { x.beginPath(); x.moveTo(334, 1060); x.lineTo(334, 1160); x.lineTo(414, 1110); x.closePath(); x.fill(); }
  x.fillStyle = "#f4e8da"; for (const sx of [190, 530]) { x.beginPath(); x.moveTo(sx + (sx < 360 ? 30 : -30), 1080); x.lineTo(sx + (sx < 360 ? 30 : -30), 1140); x.lineTo(sx + (sx < 360 ? -20 : 20), 1110); x.closePath(); x.fill(); }
  for (let i = 0; i < 12; i++) { const a = playing ? 0.25 + 0.75 * Math.abs(Math.sin(t * 6 + i * 1.7) * Math.cos(t * 3.3 + i)) : 0.15; x.fillStyle = i % 2 ? "#ff8a3d" : "#ffb36b"; roundRect(x, 130 + i * 39, 1360 - 110 * a, 24, 110 * a, 8); x.fill(); }
}
// Expanding sound rings (decoration). API { group, update(t, on) }
function makeSoundRings(n = 4) {
  const g = new THREE.Group(), rings = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 48), new THREE.MeshBasicMaterial({ color: "#ffb36b", transparent: true, toneMapped: false })); m.userData.decor = true; g.add(m); rings.push(m); }
  g.userData.decor = true;
  const update = (t, on) => rings.forEach((m, i) => { const k = ((t * 0.9 + i / n) % 1); m.scale.setScalar(0.08 + k * 0.3); m.material.opacity = on * (1 - k) * 0.9; m.visible = on > 0.01; });
  return { group: g, update };
}
// Speaker driver blown up (the "dive" target): base block with "TERRA RARA" printed on its front, the
// glowing magnet disc, a ring frame and a membrane cone that lifts off. Origin: floor centre, front +z.
// API { group, magnet, membrane, open(k), pulse(k) }
function makeSpeakerDriver() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.7, 0.42, 1.3, 0.05), mat("#24262b", { roughness: 0.5, metalness: 0.3 })); base.position.y = 0.21; g.add(base);
  const p = makePlate("TERRA RARA", 1.5, 0.3, { bg: ORANGE, fg: "#ffffff" }); p.position.set(0, 0.21, 0.666); g.add(p);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.18, 40), mat("#3a3d44", { metalness: 0.6, roughness: 0.35 })); pot.position.y = 0.51; g.add(pot);
  const mg = makeMagnet(0.4, 0.16); mg.group.rotation.x = -Math.PI / 2; mg.group.position.y = 0.66; g.add(mg.group);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 48), mat("#9aa0a8", { metalness: 0.7, roughness: 0.3 })); frame.rotation.x = Math.PI / 2; frame.position.y = 0.8; g.add(frame);
  const membrane = new THREE.Group(); membrane.position.y = 0.8; g.add(membrane);
  const coneM = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.32, 40, 1, true), mat("#151515", { roughness: 0.7, side: THREE.DoubleSide })); coneM.rotation.x = Math.PI; coneM.position.y = 0.0; membrane.add(coneM);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat("#2b2b2b", { roughness: 0.4 })); cap.position.y = -0.12; membrane.add(cap);
  g.add(contactShadow(2.2, 1.8));
  const open = (k) => { membrane.position.y = 0.8 + 1.1 * k; membrane.rotation.z = 0.5 * k; membrane.scale.setScalar(Math.max(0.0001, 1 - 0.9 * sm(k, 0.6, 1))); membrane.visible = k < 0.99; };
  return { group: g, magnet: mg, membrane, open, pulse: mg.glow };
}

// Turntable (low drum) for showing three things in turn. Origin: floor centre. API { group, top, disc }
function makeTurntable(r = 2.4) {
  const g = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.05, 0.28, 64), mat("#3a2a20", { roughness: 0.6 })); drum.position.y = 0.14; g.add(drum);
  const disc = new THREE.Group(); disc.position.y = 0.28; g.add(disc);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.06, r - 0.06, 0.04, 64), mat("#4a362a", { roughness: 0.5 })); top.position.y = 0.02; disc.add(top);
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(r - 0.06, 0.025, 8, 80), mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.6 })); ringM.rotation.x = Math.PI / 2; ringM.position.y = 0.04; disc.add(ringM);
  g.add(contactShadow(2 * r + 1, 2 * r + 1));
  return { group: g, disc, top: 0.32 };
}
// Wind turbine: tapered tower, nacelle, hub with a glowing generator ring and three blades.
// Origin: foot of the tower; the rotor faces +z. API { group, spin(a), glow }
function makeWindTurbine(H = 2.9) {
  const g = new THREE.Group(), white = mat("#eef0f2", { roughness: 0.45 });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, H, 20), white); tower.position.y = H / 2; g.add(tower);
  const nac = new THREE.Mesh(rbox(0.26, 0.24, 0.62, 0.08), white); nac.position.set(0, H + 0.08, -0.05); g.add(nac);
  const mg = makeMagnet(0.15, 0.06); mg.group.position.set(0, H + 0.08, 0.27); g.add(mg.group);
  const rotor = new THREE.Group(); rotor.position.set(0, H + 0.08, 0.34); g.add(rotor);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), white); hub.scale.z = 1.4; rotor.add(hub);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Shape(); s.moveTo(-0.05, 0); s.quadraticCurveTo(-0.11, 0.5, -0.03, 1.4); s.lineTo(0.02, 1.4); s.quadraticCurveTo(0.08, 0.5, 0.06, 0); s.closePath();
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: false }).translate(0, 0.06, -0.012), white); b.rotation.z = i * Math.PI * 2 / 3; rotor.add(b);
  }
  g.add(contactShadow(0.8, 0.8));
  return { group: g, spin: (a) => { rotor.rotation.z = a; }, glow: mg.glow };
}
// Missile on a launch rail (side view along +x): white body, red nose, four fins, glowing guidance band.
// Origin: floor centre. API { group, glow }
function makeMissile() {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(1.0, 0.3, 0.7, 0.05), mat("#4b5320", { roughness: 0.7 })); stand.position.y = 0.15; g.add(stand);
  const arm = new THREE.Mesh(rbox(0.12, 0.6, 0.12, 0.03), mat("#4b5320")); arm.position.set(0, 0.55, 0); g.add(arm);
  const body = new THREE.Group(); body.position.set(0, 0.95, 0); body.rotation.z = 0.7; g.add(body);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.9, 24), mat("#eef0f2", { roughness: 0.4 })); tube.rotation.z = -Math.PI / 2; body.add(tube);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 24), mat(RED, { roughness: 0.4 })); nose.rotation.z = -Math.PI / 2; nose.position.x = 1.16; body.add(nose);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.24), mat("#c9ccd2")); f.position.x = -0.8; const pv = new THREE.Group(); pv.rotation.x = i * Math.PI / 2; f.position.z = 0.22; pv.add(f); body.add(pv); }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.16, 24), mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 1.0 })); band.rotation.z = -Math.PI / 2; band.position.x = 0.62; body.add(band);
  g.add(contactShadow(1.6, 1.0));
  return { group: g, glow: (k) => { band.material.emissiveIntensity = 0.4 + 1.6 * k; } };
}

// Simple globe on a stand: blue ball with soft green landmasses (seeded blobs). Origin: floor.
// API { group, ball, top }
function makeGlobe(r = 1.1) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.3, 32), mat("#3a2a20")); stand.position.y = 0.15; g.add(stand);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 12), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); neck.position.y = 0.48; g.add(neck);
  const tex = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = "#1f5f8f"; x.fillRect(0, 0, w, h); const rnd = mulberry32(8); x.fillStyle = "#4f9a4a";
    for (let c = 0; c < 7; c++) { const cx = rnd() * w, cy = h * (0.2 + rnd() * 0.6); for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(cx + (rnd() - 0.5) * 170, cy + (rnd() - 0.5) * 110, 18 + rnd() * 40, 0, 6.3); x.fill(); } }
  }).tex;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 })); ball.position.y = 0.68 + r; g.add(ball);
  g.add(contactShadow(2.4, 2.4));
  return { group: g, ball, top: 0.68 + 2 * r };
}
// Rough grey rock with glowing coloured crystals and specks. Origin: centre. API { group }
function makeRock(r = 0.5, { crystals = true, specks = 0, colors = null, seed = 4 } = {}) {
  const g = new THREE.Group(), rnd = mulberry32(seed);
  const geo = new THREE.IcosahedronGeometry(r, 1), pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) { const v = new V3().fromBufferAttribute(pa, i), k = 0.82 + 0.3 * Math.abs(Math.sin(v.x * 7.1 + v.y * 5.3 + v.z * 3.7)); pa.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k); }
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, mat("#77706a", { roughness: 0.95, flatShading: true })));
  if (crystals) for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(r * 0.22, 0), new THREE.MeshPhysicalMaterial({ color: ["#ffd36b", "#ff8a3d", "#e8ecf2"][i % 3], metalness: 0.8, roughness: 0.15, envMap: ENV, emissive: ["#ffb000", "#ff6a2b", "#c9d4ff"][i % 3], emissiveIntensity: 0.8 }));
    const d = new V3(rnd() - 0.5, rnd() * 0.8, rnd() - 0.5).normalize(); c.position.copy(d.multiplyScalar(r * 0.88)); c.scale.y = 1.6; c.lookAt(c.position.clone().multiplyScalar(2)); c.rotateX(Math.PI / 2); g.add(c);
  }
  if (specks) {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat("#ffffff", { roughness: 0.6 }), specks), m4 = new THREE.Matrix4();
    for (let i = 0; i < specks; i++) { const d = new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); const s = r * (0.035 + rnd() * 0.02); m4.compose(d.multiplyScalar(r * (0.86 + 0.12 * rnd())), new THREE.Quaternion(), new V3(s, s, s)); im.setMatrixAt(i, m4); im.setColorAt(i, new THREE.Color(colors[i % colors.length])); }
    im.instanceColor.needsUpdate = true; im.computeBoundingBox(); g.add(im);
  }
  return { group: g };
}
// 3D question mark (tube hook + dot). Origin: bottom of the dot.
function makeQuestion(color = ORANGE) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.4, emissive: color, emissiveIntensity: 0.35 });
  const pts = [[-0.3, 0.75], [-0.27, 0.95], [-0.1, 1.1], [0.12, 1.1], [0.29, 0.97], [0.31, 0.78], [0.18, 0.62], [0.03, 0.52], [0.0, 0.34]].map(([x, y]) => new V3(x, y, 0));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.085, 12, false), m));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), m); cap.position.copy(pts[0]); g.add(cap);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), m); dot.position.set(0, 0.1, 0); g.add(dot);
  return g;
}

// Glass jar on a wooden base, filled with sand grains in 17 nearly identical tones (instanced).
// Origin: floor centre. API { group, grains, colors, mouthY, r, setLevel(k) }
const SAND17 = Array.from({ length: 17 }, (_, i) => new THREE.Color().setHSL((14 + i * 2.1) / 360, 0.5 + (i % 4) * 0.08, 0.42 + ((i * 7) % 6) * 0.05));
function makeSandJar({ r = 0.95, h = 2.0, n = 1500, seed = 12 } = {}) {
  const g = new THREE.Group(), bH = 0.3;
  const base = new THREE.Mesh(rbox(2 * r + 0.3, bH, 2 * r + 0.3, 0.05), mat("#5a3a26", { roughness: 0.7 })); base.position.y = bH / 2; g.add(base);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48, 1, true), new THREE.MeshStandardMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.y = bH + h / 2; g.add(glass);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 48), mat("#dfeaf5", { transparent: true, opacity: 0.6 })); lip.rotation.x = Math.PI / 2; lip.position.y = bH + h; g.add(lip);
  const rnd = mulberry32(seed), im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), mat("#ffffff", { roughness: 0.8 }), n), m4 = new THREE.Matrix4(), fill = h * 0.72;
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, rr = (r - 0.07) * Math.sqrt(rnd()), y = bH + 0.04 + rnd() * fill, s = 0.05 + rnd() * 0.025;
    m4.compose(new V3(Math.cos(a) * rr, y, Math.sin(a) * rr), new THREE.Quaternion(), new V3(s, s, s)); im.setMatrixAt(i, m4); im.setColorAt(i, SAND17[Math.floor(rnd() * 17)]);
  }
  im.instanceColor.needsUpdate = true; im.computeBoundingBox(); g.add(im);
  g.add(contactShadow(2 * r + 1, 2 * r + 1));
  return { group: g, mouthY: bH + h, sandY: bH + 0.04 + fill, r };
}
// Small test tube on a foot with a coloured fill that rises. Origin: floor. API { group, set(k) }
function makeVial(color, { r = 0.085, h = 0.62 } = {}) {
  const g = new THREE.Group();
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.6, r * 1.8, 0.05, 20), mat("#3a2a20")); foot.position.y = 0.025; g.add(foot);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20, 1, true), new THREE.MeshStandardMaterial({ color: "#d8ecff", transparent: true, opacity: 0.28, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide })); tube.position.y = 0.05 + h / 2; g.add(tube);
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), tube.material); bottom.position.y = 0.05; g.add(bottom);
  const fillM = mat(color, { roughness: 0.85 });
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 1, 20), fillM); g.add(fill);
  const set = (k) => { k = clamp(k); fill.visible = k > 0.01; fill.scale.y = Math.max(0.001, k * h * 0.85); fill.position.y = 0.05 + (k * h * 0.85) / 2; };
  set(0);
  return { group: g, set, fillMat: fillM };
}
// Tweezers (two tapered arms joined at the back). Tip at the origin, arms along +y. API { group, pinch(k) }
function makeTweezers() {
  const g = new THREE.Group(), m = mat("#c9ccd2", { metalness: 0.8, roughness: 0.25 }), arms = [];
  for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.y = 0.9; g.add(pv); const a = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.92, 0.02), m); a.position.y = -0.46; pv.add(a); arms.push([pv, s]); }
  const back = new THREE.Mesh(rbox(0.16, 0.12, 0.05, 0.02), m); back.position.y = 0.93; g.add(back);
  const pinch = (k) => arms.forEach(([pv, s]) => { pv.rotation.z = s * (0.07 * (1 - k) + 0.01); });
  pinch(0); return { group: g, pinch };
}

// Open-front hangar (galpão): an arched roof on two side walls and a back wall, dark inside.
// Origin: floor centre, opening towards +z. API { group, W, D, H }
function makeHangar({ W = 7.2, D = 2.6, H = 2.1 } = {}) {
  const g = new THREE.Group(), wall = mat("#c9c1b5", { roughness: 0.75 }), roofM = mat("#8b9196", { roughness: 0.45, metalness: 0.4, side: THREE.DoubleSide });
  const back = new THREE.Mesh(rbox(W, H, 0.12, 0.03), wall); back.position.set(0, H / 2, -D / 2); g.add(back);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(rbox(0.12, H, D, 0.03), wall); sw.position.set(s * W / 2, H / 2, 0); g.add(sw); }
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(W / 2 + 0.08, W / 2 + 0.08, D + 0.2, 48, 1, true, -Math.PI / 2, Math.PI), roofM);
  roof.rotation.x = -Math.PI / 2; roof.scale.set(1, 1, 0.32); roof.position.y = H; g.add(roof);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, H - 0.05), mat("#4a3a30", { roughness: 1, emissive: "#3a2a1e", emissiveIntensity: 0.6 })); inside.position.set(0, H / 2, -D / 2 + 0.07); g.add(inside);
  const floorIn = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, D), mat("#3a2e26", { roughness: 1 })); floorIn.rotation.x = -Math.PI / 2; floorIn.position.y = 0.01; g.add(floorIn);
  g.add(contactShadow(W + 1.2, D + 1.2));
  return { group: g, W, D, H };
}

// Faucet mounted on a wall plate printed with a flag: body pipe out of the plate, spout curving down,
// cross handle on top. Origin: centre of the wall plate (the plate faces +z). Spout mouth at `mouth` (local).
// API { group, handle, mouth }
function makeFaucet(flagKind = "china") {
  const g = new THREE.Group(), brass = new THREE.MeshPhysicalMaterial({ color: "#e6e9ee", metalness: 1, roughness: 0.18, envMap: ENV, envMapIntensity: 1.2 });
  const plate = makeFlagPanel(flagKind, 1.5, 1.0); plate.position.x = -0.4; g.add(plate);
  const frame = new THREE.Mesh(rbox(1.6, 1.1, 0.05, 0.03), mat("#2a1b12")); frame.position.set(-0.4, 0, -0.03); g.add(frame);
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32), brass); flange.rotation.x = Math.PI / 2; flange.position.set(0, 0, 0.05); g.add(flange);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 24), brass); body.rotation.x = Math.PI / 2; body.position.set(0, 0, 0.5); g.add(body);
  const bend = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 16, 32, Math.PI / 2), brass); bend.rotation.y = -Math.PI / 2; bend.position.set(0, -0.28, 0.95); g.add(bend);
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.32, 24), brass); drop.position.set(0, -0.44, 1.23); g.add(drop);
  const mouthR = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 24), brass); mouthR.rotation.x = Math.PI / 2; mouthR.position.set(0, -0.6, 1.23); g.add(mouthR);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12), brass); stem.position.set(0, 0.2, 0.42); g.add(stem);
  const handle = new THREE.Group(); handle.position.set(0, 0.34, 0.42); g.add(handle);
  for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 10), brass); a.rotation.z = Math.PI / 2; const pv = new THREE.Group(); pv.rotation.y = i * Math.PI / 4 * 2; a.position.x = 0.25; pv.add(a); const k = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), mat(RED)); k.position.x = 0.5; pv.add(k); handle.add(pv); }
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 10), brass); handle.add(cap);
  return { group: g, handle, mouth: new V3(0, -0.64, 1.23) };
}
// Small magnet pieces falling in a stream (instanced). Spawned on a fixed clock; `flow(t)` (0..1)
// decides which pieces exist. API { mesh, update(t, from, to) } — from (V3) the spout, to.y the catch height.
function makeMagnetStream(n = 70, flow, seed = 9) {
  const rnd = mulberry32(seed), im = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.5, 14), new THREE.MeshPhysicalMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.25, envMap: ENV, emissive: ORANGE, emissiveIntensity: 0.35 }), n);
  const d = Array.from({ length: n }, () => ({ r: rnd(), ox: (rnd() - 0.5) * 0.12, oz: (rnd() - 0.5) * 0.12, sp: rnd() * 6 })), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  im.userData.decor = true;
  const period = 0.05, fall = 0.55;
  const update = (t, from, toY) => {
    for (let i = 0; i < n; i++) {
      const cyc = Math.floor((t - i * period) / (n * period)), born = cyc * n * period + i * period, age = t - born;
      const alive = age >= 0 && age <= fall && flow(born) > d[i].r;
      const y = from.y - 4.9 * age * age * 2.4;
      const s = alive && y > toY ? 0.07 : 0.0001;
      e.set(d[i].sp * age, d[i].sp, 0); q.setFromEuler(e);
      m4.compose(new V3(from.x + d[i].ox, Math.max(toY, y), from.z + d[i].oz), q, new V3(s, s, s)); im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere();
  };
  return { mesh: im, update };
}
// Conveyor belt (moving stripes) on legs. Origin: floor centre; belt runs along x. API { group, top, set(off) }
function makeConveyor(L = 5.2, w = 1.4) {
  const g = new THREE.Group(), H = 0.55;
  const c = makeCanvas(512, 64), x = c.getContext("2d"); x.fillStyle = "#1b1b1b"; x.fillRect(0, 0, 512, 64); x.fillStyle = "#3a3a3a"; for (let i = 0; i < 16; i++) x.fillRect(i * 32, 0, 10, 64);
  const tex = texFrom(c); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(9, 1);
  const dark = mat("#1b1b1b"), belt = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, w), [dark, dark, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), dark, dark, dark]); belt.position.y = H; g.add(belt);
  for (const s of [-1, 1]) { const rail = new THREE.Mesh(rbox(L + 0.1, 0.14, 0.08, 0.03), mat("#f2b632")); rail.position.set(0, H + 0.02, s * (w / 2 + 0.04)); g.add(rail); }
  for (const xx of [-L / 2 + 0.3, 0, L / 2 - 0.3]) for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, H, 0.1), mat("#3a3d44")); leg.position.set(xx, H / 2, s * (w / 2 - 0.05)); g.add(leg); }
  g.add(contactShadow(L + 0.8, w + 0.8));
  return { group: g, top: H + 0.04, set: (off) => { tex.offset.x = -off; } };
}
// Industrial robot arm: base, shoulder, upper arm, forearm and a two-finger gripper.
// Origin: floor. API { group, pose(yaw, a1, a2, grip), tip() (world V3) }
function makeRobotArm() {
  const g = new THREE.Group(), o = mat("#ff6a2b", { roughness: 0.4 }), dk = mat("#2b2b2b", { roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 32), dk); base.position.y = 0.15; g.add(base);
  const yaw = new THREE.Group(); yaw.position.y = 0.3; g.add(yaw);
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 24), o); turret.position.y = 0.15; yaw.add(turret);
  const sh = new THREE.Group(); sh.position.y = 0.36; yaw.add(sh);
  const j1 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.36, 20), dk); j1.rotation.x = Math.PI / 2; sh.add(j1);
  const up = new THREE.Mesh(rbox(0.2, 1.2, 0.24, 0.06), o); up.position.y = 0.6; sh.add(up);
  const el = new THREE.Group(); el.position.y = 1.2; sh.add(el);
  const j2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 20), dk); j2.rotation.x = Math.PI / 2; el.add(j2);
  const fo = new THREE.Mesh(rbox(0.16, 1.0, 0.2, 0.05), o); fo.position.y = 0.5; el.add(fo);
  const wr = new THREE.Group(); wr.position.y = 1.02; el.add(wr);
  const hand = new THREE.Mesh(rbox(0.26, 0.1, 0.2, 0.03), dk); wr.add(hand);
  const fingers = [];
  for (const s of [-1, 1]) { const f = new THREE.Mesh(rbox(0.05, 0.24, 0.12, 0.02), dk); f.position.set(s * 0.09, 0.15, 0); wr.add(f); fingers.push([f, s]); }
  const tipObj = new THREE.Object3D(); tipObj.position.y = 0.28; wr.add(tipObj);
  const pose = (ay, a1, a2, grip = 0) => { yaw.rotation.y = ay; sh.rotation.z = a1; el.rotation.z = a2; wr.rotation.z = -(a1 + a2) + Math.PI; fingers.forEach(([f, s]) => { f.position.x = s * (0.09 - 0.05 * grip); }); };
  pose(0, 0.4, 1.2);
  g.add(contactShadow(1.4, 1.4));
  return { group: g, pose, tip: () => tipObj.getWorldPosition(new V3()) };
}
// Rotating siren light on a short post. Origin: floor. API { group, set(on, t) }
function makeSiren() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12), mat("#3a3d44")); post.position.y = 0.7; g.add(post);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.12, 24), mat("#2b2b2b")); base.position.y = 1.46; g.add(base);
  const domeM = new THREE.MeshStandardMaterial({ color: "#b0170a", emissive: "#ff2a10", emissiveIntensity: 0.2, roughness: 0.25 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.position.y = 1.52; g.add(dome);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 24, 1, true), new THREE.MeshBasicMaterial({ color: "#ff2a10", transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, blending: THREE.AdditiveBlending }));
  beam.visible = false; const spin = new THREE.Group(); spin.position.y = 1.6; spin.add(beam); g.add(spin); beam.userData.decor = true;
  g.add(contactShadow(0.7, 0.7));
  return { group: g, set: (on, t) => { domeM.emissiveIntensity = 0.2 + on * (1.4 + 0.8 * Math.max(0, Math.sin(t * 12))); spin.rotation.y = t * 6; beam.material.opacity = 0.45 * on; } };
}
// Price tag: pointed left end with a hole, printed text. Origin: centre, front +z.
function makeTag(text, w = 1.2, h = 0.55, color = ORANGE, fg = "#ffffff") {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-w / 2 + h * 0.4, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2 + h * 0.4, h / 2); s.lineTo(-w / 2, 0); s.closePath();
  const hole = new THREE.Path(); hole.absarc(-w / 2 + h * 0.3, 0, h * 0.09, 0, Math.PI * 2, true); s.holes.push(hole);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }).translate(0, 0, -0.03), mat(color, { roughness: 0.5 })); g.add(body);
  const p = makePlate(text, w * 0.7, h * 0.66, { bg: color, fg }); p.position.set(h * 0.2, 0, 0.031); g.add(p);
  return g;
}
// Bar standing on the floor (its height is the data) with a placard in front: flag on top, live label below.
// Origin: floor centre. API { group, setH(h), label(text), colMat }
function makeRankColumn(flagKind, { w = 1.2, color = RED } = {}) {
  const g = new THREE.Group();
  const colM = mat(color, { roughness: 0.4, emissive: color, emissiveIntensity: 0.25 });
  const col = new THREE.Mesh(rbox(w, 1, w, 0.04), colM); g.add(col);
  const pc = new THREE.Group(); pc.position.set(0, 0, w / 2 + 0.95); pc.rotation.x = -0.8; g.add(pc);
  const board = new THREE.Mesh(rbox(1.7, 1.3, 0.08, 0.04), mat("#1c1410", { roughness: 0.6 })); board.position.y = 0.75; pc.add(board);
  const fl = makeFlagPanel(flagKind, 0.9, 0.6); fl.position.set(0, 1.04, 0.05); pc.add(fl);
  const lab = makeScreenPanel(1.55, 0.46, null, { frac: 0.62, bg: "#141414", label: "rótulo" }); lab.mesh.position.set(0, 0.4, 0.05); pc.add(lab.mesh);
  const foot = new THREE.Mesh(rbox(1.2, 0.1, 0.5, 0.03), mat("#2a1b12")); foot.position.y = 0.05; pc.add(foot);
  const setH = (h) => { h = Math.max(0.01, h); col.scale.y = h; col.position.y = h / 2; };
  let cur = ""; const label = (text) => { if (text === cur) return; cur = text; lab.paint((x, W, H) => { x.fillStyle = "#141414"; x.fillRect(0, 0, W, H); let px = Math.round(H * 0.62); x.font = `900 ${px}px Inter`; while (x.measureText(text).width > W * 0.9) { px -= 2; x.font = `900 ${px}px Inter`; } centerText(x, text, W / 2, H / 2 + 4, `900 ${px}px Inter`, "#ffffff"); }); };
  setH(1); g.add(contactShadow(w + 1, w + 2));
  return { group: g, setH, label, colMat: colM };
}
// Two-pan balance (brass). Each pan hangs from a bent rod that runs down behind it, so whatever sits on
// the pan is never crossed by a string. Origin: floor. API { group, pans, setTilt(a), panTop }
function makeBalance() {
  const g = new THREE.Group(), brass = mat("#d8a53a", { metalness: 0.6, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.18, 32), mat("#3a2a20")); base.position.y = 0.09; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 16), brass); post.position.set(0, 1.48, -1.0); g.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 12), brass); foot.rotation.x = Math.PI / 2; foot.position.set(0, 0.2, -0.5); g.add(foot);
  const beam = new THREE.Group(); beam.position.set(0, 2.78, -1.0); g.add(beam);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 12), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), brass); beam.add(pivot);
  const pans = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = 2.1 * s; beam.add(hang);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8), brass); rod.position.set(0, -0.65, 0); hang.add(rod);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 8), brass); arm.rotation.x = Math.PI / 2; arm.position.set(0, -1.3, 0.475); hang.add(arm);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.7, 0.08, 32), brass); pan.position.set(0, -1.34, 1.0); hang.add(pan);
    const holder = new THREE.Group(); holder.position.set(0, -1.3, 1.0); hang.add(holder);
    pans.push(holder); hang.userData.holder = holder;
  }
  g.add(contactShadow(2, 2));
  const setTilt = (a) => { beam.rotation.z = a; for (const h of beam.children) if (h.userData.holder) h.rotation.z = -a; };
  return { group: g, pans, setTilt, panTop: 0 };
}
// Block that sits on a pan with a two-line label printed on its front. Origin: bottom centre.
function makeLabelBlock(l1, l2, color) {
  const g = new THREE.Group(), w = 1.6, h = 0.95, d = 0.7;
  const b = new THREE.Mesh(rbox(w, h, d, 0.06), mat(color, { roughness: 0.5 })); b.position.y = h / 2; g.add(b);
  const p1 = makePlate(l1, w * 0.9, 0.36, { bg: color, fg: "#ffffff" }); p1.position.set(0, h * 0.7, d / 2 + 0.016); g.add(p1);
  const p2 = makePlate(l2, w * 0.9, 0.36, { bg: color, fg: "#ffffff" }); p2.position.set(0, h * 0.3, d / 2 + 0.016); g.add(p2);
  return g;
}
// Road sign with an arrow board (two printed lines). Origin: foot of the post. dir = -1 left, +1 right.
function makeArrowSign(l1, l2, dir, color, { y = 2.65, post: ph = 3.1 } = {}) {
  const g = new THREE.Group();
  if (ph > 0) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, ph, 12), mat(STEEL, { metalness: 0.6, roughness: 0.35 })); post.position.y = ph / 2; g.add(post); g.add(contactShadow(0.8, 0.8)); }
  const W = 3.3, Hh = 1.35, tip = 0.5;
  const s = new THREE.Shape(); s.moveTo(-W / 2, -Hh / 2); s.lineTo(W / 2 - tip, -Hh / 2); s.lineTo(W / 2, 0); s.lineTo(W / 2 - tip, Hh / 2); s.lineTo(-W / 2, Hh / 2); s.closePath();
  const board = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04), mat(color, { roughness: 0.5 }));
  const bg = new THREE.Group(); bg.position.set(dir * (W / 2 - 0.15), y, dir < 0 ? 0.1 : -0.06); bg.add(board); if (dir < 0) board.rotation.y = Math.PI; g.add(bg);
  const p1 = makePlate(l1, 2.65, 0.5, { bg: color, fg: "#ffffff" }); p1.position.set(-dir * 0.22, 0.28, 0.056); bg.add(p1);
  const p2 = makePlate(l2, 2.65, 0.5, { bg: color, fg: "#ffffff" }); p2.position.set(-dir * 0.22, -0.25, 0.056); bg.add(p2);
  return g;
}
// Hourglass (wooden caps, glass bulbs, running sand). Origin: floor. API { group, setK(k) }
function makeHourglass() {
  const g = new THREE.Group(), wood = mat("#5a3a26", { roughness: 0.6 });
  for (const y of [0.05, 1.45]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32), wood); p.position.y = y; g.add(p); }
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 10), wood); r.position.set(Math.cos(a) * 0.42, 0.75, Math.sin(a) * 0.42); g.add(r); }
  const glassM = new THREE.MeshStandardMaterial({ color: "#d8ecff", emissive: "#5a7a9a", emissiveIntensity: 0.35, transparent: true, opacity: 0.42, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 32, 1, true), glassM); top.rotation.x = Math.PI; top.position.y = 1.1; g.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 32, 1, true), glassM); bot.position.y = 0.4; g.add(bot);
  const sandM = mat("#e8b04a", { roughness: 0.9 });
  const sTop = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 32), sandM); sTop.rotation.x = Math.PI; g.add(sTop);
  const sBot = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 32), sandM); g.add(sBot);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 8), sandM); stream.position.y = 0.67; g.add(stream);
  const setK = (k) => { k = clamp(k); const a = Math.max(0.001, 1 - k), b = Math.max(0.001, k); sTop.scale.set(a ** 0.5, a, a ** 0.5); sTop.position.y = 0.8 + 0.25 * a; sBot.scale.set(b ** 0.5, b, b ** 0.5); sBot.position.y = 0.1 + 0.25 * b; stream.visible = k > 0.01 && k < 0.99; };
  setK(0); g.add(contactShadow(1.4, 1.4));
  return { group: g, setK };
}
// Gear (extruded, with a hole). Origin: centre, faces +z.
function makeGear(r = 0.45, teeth = 10, color = "#9aa0a8") {
  const s = new THREE.Shape(), n = teeth * 2;
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = (Math.floor(i / 2) % 2) ? r * 0.8 : r; if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const h = new THREE.Path(); h.absarc(0, 0, r * 0.32, 0, Math.PI * 2, true); s.holes.push(h);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 }).translate(0, 0, -0.07), mat(color, { metalness: 0.6, roughness: 0.35 }));
}

// ============================================================================ scenes
// ---------------------------------------------------------------- 1. gancho (0 – 3.85)
// "Terras raras não são terra... e nem são raras."
addScene("gancho", 0, 3.85, (S) => {
  const soil = makeSoilBlock(); S.add(soil.group);
  const clump = makeClump(0.85); const cg = new THREE.Group(); cg.add(clump.mesh); cg.position.set(0, soil.top + 1.25, 0.1); S.add(cg);
  const cube = new THREE.Mesh(rbox(1.2, 1.2, 1.2, 0.1), chrome("#f2f4f7", { roughness: 0.08, envMapIntensity: 2.0, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 820] }));
  const cubeG = new THREE.Group(); cubeG.add(cube); cubeG.position.copy(cg.position); S.add(cubeG);
  const sparks = makeSparks(46, 7); S.add(sparks);
  const TX = 1.6;
  S.hero(cg, "torrão de terra", { when: (t) => t < TX });
  S.hero(cubeG, "cubo de metal espelhado", { when: (t) => t > TX + 0.3 });
  S.hero(soil.group, "bloco de terra em corte com pontos brilhantes");
  const anim = (t) => {
    clump.explode(lin(t, TX, TX + 1.0)); cg.visible = t < TX + 0.95; cg.rotation.y = t * 0.7; cg.rotation.x = 0.2 * Math.sin(t);
    cubeG.visible = t >= TX; cubeG.scale.setScalar(Math.max(0.0001, pop(t, TX, 0.45)));
    cube.rotation.set(0.55 + t * 0.35, t * 1.1, 0.3);
    cubeG.position.y = soil.top + (t < TX + 0.5 ? 1.25 : lerp(1.25, 0.95, sm(t, TX + 0.5, TX + 1.3))) + 0.06 * Math.sin(t * 2.2);
    soil.twinkle(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([cg, soil.group], 0, 1.5, { from: [-0.3, 0.3, 1], pull: 1.02 });
  const A1 = shot([cg, soil.group], 0, 1.5, { from: [-0.05, 0.32, 1], pull: 0.98 });
  const B0 = shot([cubeG, soil.group], 2.6, 3.85, { from: [0.5, 0.5, 1], pull: 1.08 });
  const B1 = shot([cubeG, soil.group], 2.6, 3.85, { from: [0.35, 0.45, 1], pull: 1.02 });
  return (t) => {
    anim(t); updateSparks(sparks, t, TX, cg.position);
    fill.color.set(ORANGE); fill.position.set(0.8, soil.top + 2.4, 1.8); fill.intensity = 1.2 + 2.2 * sm(t, TX, TX + 0.4);
    CAM.apply(CAM.shake(CAM.track(t, [[0, A0], [1.55, A1, 1.55], [3.0, B0, 1.2], [3.85, B1, 0.85]]), t, TX, 0.25, 0.4));
  };
});

// ---------------------------------------------------------------- 2. celular (3.85 – 10.35)
// "Imagina: você põe uma música no celular. O som sai de um ímã minúsculo, feito de terra rara."
addScene("celular", 3.85, 10.35, (S) => {
  const table = new THREE.Mesh(rbox(3.6, 0.12, 2.2, 0.04), mat("#4a3020", { roughness: 0.85 })); table.position.y = 0.06; S.add(table);
  const stand = new THREE.Mesh(rbox(0.7, 0.16, 0.5, 0.04), mat("#2a1b12")); stand.position.set(0, 0.2, -0.1); S.add(stand);
  const ph = makeExplodedPhone(); ph.group.position.set(0, 0.28 + 0.84, -0.1); S.add(ph.group);
  const finger = makeFinger(); S.add(finger);
  const rings = makeSoundRings(4); S.add(rings.group);
  const drv = makeSpeakerDriver(); S.add(drv.group);
  const TAP = 4.86, EX = 6.66, SW = 7.95, OPEN = 8.75;
  S.hero(ph.group, "celular", { when: (t) => t < SW });
  S.hero(finger, "dedo", { when: (t) => t > 4.4 && t < 5.25 });
  S.hero(drv.group, "alto-falante com ímã", { when: (t) => t > SW + 0.45 });
  S.solid(table, "mesa"); S.solid(drv.group, "alto-falante", { restsOn: ["mesa"], when: (t) => t > SW + 0.45 });
  const rest = new V3(0, 0.12, 0.05), spkLocal = new V3(0, -0.66, 0.06);
  const anim = (t) => {
    const playing = t > TAP + 0.05, press = Math.max(0, 1 - Math.abs(t - TAP) / 0.12);
    paintPlayer(ph.ctx, { playing, prog: playing ? 0.18 + 0.08 * (t - TAP) : 0.18, t, press }); ph.tex.needsUpdate = true;
    const k = sm(t, EX, EX + 0.8); ph.explode(k);
    ph.group.rotation.set(-0.06, 0.4 * k + 0.08 * Math.sin(t * 0.8), 0); ph.group.position.y = 0.28 + 0.84 + 0.35 * k;
    ph.layers.speaker.children[1].material.emissiveIntensity = 0.9 + 2.5 * sm(t, 7.2, 7.6); { const hk = sm(t, 7.2, 7.5); ph.layers.halo.material.opacity = hk; ph.layers.halo.scale.setScalar(1 + 0.25 * Math.abs(Math.sin(t * 9)) * hk); }
    popOut(ph.group, t, SW, 0.3);
    // finger: comes in from the lower right, taps play, leaves
    const target = ph.group.localToWorld(ph.screenPoint(360, 1110).add(new V3(0, 0, 0.03)));
    const dir = new V3(0.55, -0.35, 0.75).normalize(), kin = sm(t, 4.3, TAP), kout = sm(t, TAP + 0.12, TAP + 0.5);
    finger.position.copy(target).addScaledVector(dir, 0.55 * (1 - kin) + 0.6 * kout);
    finger.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir); finger.visible = t > 4.25 && t < TAP + 0.5;
    // sound rings out of the speaker while the music plays
    const spk = ph.group.localToWorld(spkLocal.clone()); rings.group.position.copy(spk).add(new V3(0, 0, 0.05));
    rings.update(t, playing ? (1 - k) * sm(t, TAP, TAP + 0.3) : 0);
    // the driver flies out of the speaker slot and grows to full size
    const kd = sm(t, SW, SW + 0.5); drv.group.visible = t > SW; drv.group.scale.setScalar(Math.max(0.0001, lerp(0.08, 1, kd)));
    drv.group.position.copy(spk.clone().lerp(rest, kd)); drv.group.rotation.y = 0.5 * (1 - kd) + 0.12 * Math.sin((t - SW) * 1.2);
    drv.open(sm(t, OPEN, OPEN + 0.6));
    drv.pulse(t > OPEN ? 0.5 + 0.5 * Math.abs(Math.sin((t - OPEN) * Math.PI * 2.2)) : 0.2);
  };
  const shot = shotOf(anim);
  const A0 = shot([ph.group, finger], 3.85, 6.6, { from: [0.3, 0.25, 1], pull: 1.02 });
  const A1 = shot([ph.group, finger], 3.85, 6.6, { from: [0.12, 0.2, 1], pull: 0.98 });
  const E0 = shot([ph.group], 6.7, 7.9, { from: [1.3, 0.35, 0.7], pull: 1.0 });
  const B0 = shot([drv.group], SW + 0.5, 10.35, { from: [0.25, 0.65, 1], pull: 1.04 });
  const B1 = shot([drv.group], SW + 0.5, 10.35, { from: [-0.1, 0.55, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0.6, 2.2, 1.8); fill.intensity = t > OPEN ? 2.6 : 1.6;
    CAM.apply(CAM.track(t, [[3.85, A0], [6.55, A1, 2.7], [7.4, E0, 0.75], [8.45, B0, 0.5], [10.35, B1, 1.9]]));
  };
});

// ---------------------------------------------------------------- 3. elementos (10.35 – 17.32)
// "São dezessete elementos químicos, usados no motor do carro elétrico, na turbina de vento e até em míssil."
addScene("elementos", 10.35, 17.32, (S) => {
  const fr = makePhotoFrame("oxidos", { w: 3.2, shape: "paisagem", name: "ÓXIDOS DE TERRAS RARAS" }); S.add(fr.group);
  const tt = makeTurntable(2.7); S.add(tt.group);
  const car = makeCar({ color: "#2f6fb0" }), tur = makeWindTurbine(2.3), mis = makeMissile();
  const cm = makeMagnet(0.11, 0.05); cm.group.position.set(-0.68, 0.23, 0.545); car.add(cm.group);
  const items = [car, tur.group, mis.group], R = 1.75;
  items.forEach((it, i) => { const a = i * Math.PI * 2 / 3; it.position.set(Math.sin(a) * R, 0.04, Math.cos(a) * R); it.rotation.y = a; tt.disc.add(it); });
  mis.group.rotation.y += Math.PI; mis.group.rotation.y += 0;
  const P0 = 12.62;
  S.hero(fr.group, "porta-retrato com foto de pós", { when: (t) => t > 10.8 && t < 12.4 });
  S.hero(car, "carro elétrico", { when: (t) => t > P0 + 0.4 && t < 14.4 });
  S.hero(tur.group, "turbina eólica", { when: (t) => t > 15.0 && t < 15.9 });
  S.hero(mis.group, "míssil na rampa", { when: (t) => t > 16.5 });
  const anim = (t) => {
    popInOut(fr.group, t, 10.36, 12.4); fr.frame.rotation.y = 1.3 * (1 - eOut(lin(t, 10.36, 10.95))); fr.zoom(1 + 0.14 * lin(t, 10.6, 12.6));
    popIn(tt.group, t, P0 - 0.1, 0.45);
    tt.disc.rotation.y = -(Math.PI * 2 / 3) * (sm(t, 14.42, 14.95) + sm(t, 15.92, 16.45)) + 0.12 * Math.sin((t - P0) * 0.9);
    cm.glow(sm(t, 13.2, 13.5) * (1 - sm(t, 14.4, 14.7)) + 0.15); tur.glow(sm(t, 14.9, 15.2) * (1 - sm(t, 15.9, 16.2)) + 0.15); mis.glow(sm(t, 16.4, 16.7) + 0.15);
    tur.spin(t * 2.6);
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 10.9, 12.3, { from: [0.2, 0.18, 1], pull: 1.04 });
  const A1 = shot([fr.group], 10.9, 12.3, { from: [-0.12, 0.15, 1], pull: 0.98 });
  const B0 = shot([car], P0 + 0.3, 14.4, { from: [0.25, 0.32, 1], pull: 1.12 });
  const B1 = shot([car], P0 + 0.3, 14.4, { from: [0.05, 0.28, 1], pull: 1.05 });
  const C0 = shot([tur.group], 15.0, 15.9, { from: [0.15, 0.25, 1], pull: 1.08 });
  const D0 = shot([mis.group], 16.5, 17.32, { from: [0.2, 0.3, 1], pull: 1.12 });
  const D1 = shot([mis.group], 16.5, 17.32, { from: [0.0, 0.25, 1], pull: 1.04 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.6, 2.6); fill.intensity = 2.0;
    CAM.apply(CAM.track(t, [[10.35, A0], [12.4, A1, 2.0], [12.95, B0, 0.5], [14.4, B1, 1.4], [14.95, C0, 0.5], [16.45, D0, 0.5], [17.32, D1, 0.85]]));
  };
});

// ---------------------------------------------------------------- 4. briga (17.32 – 21.38)
// "Mas se nem são raras... por que o mundo briga por elas?"
addScene("briga", 17.32, 21.38, (S) => {
  const gl = makeGlobe(0.5); S.add(gl.group);
  const rock = makeRock(0.6, { seed: 6 }); rock.group.position.set(0, gl.top + 0.5, 0); S.add(rock.group);
  const q = makeQuestion(ORANGE); q.scale.setScalar(1.1); S.add(q);
  const cols = [CREAM, ORANGE, "#c9b8a6", "#e0a070"], ropeM = mat("#d9c29a", { roughness: 0.8 }), pawns = [], ropes = [];
  for (let i = 0; i < 4; i++) {
    const p = makePerson(cols[i]); const a = Math.PI / 4 + i * Math.PI / 2; p.userData.a = a; p.position.set(Math.sin(a) * 2.0, 0, Math.cos(a) * 2.0); p.scale.setScalar(2.4); S.add(p); pawns.push(p);
    const r = makeRod(0.03, ropeM); r.mesh.userData.decor = true; S.add(r.mesh); ropes.push(r);
  }
  S.hero(gl.group, "globo pequeno sob a pedra"); S.hero(rock.group, "pedra brilhante");
  S.hero(q, "ponto de interrogação", { when: (t) => t > 19.6 });
  pawns.forEach((p, i) => S.hero(p, "pessoa puxando corda " + (i + 1)));
  const anim = (t) => {
    gl.ball.rotation.y = t * 0.3; gl.group.visible = true;
    rock.group.rotation.y = t * 0.8; rock.group.position.set(0.06 * Math.sin(t * 5.1), gl.top + 0.5 + 0.05 * Math.sin(t * 2.2), 0.06 * Math.cos(t * 4.3));
    pawns.forEach((p, i) => { const a = p.userData.a, lean = 0.32 + 0.1 * Math.sin(t * 4 + i * 1.7); p.rotation.set(0, 0, 0); p.rotateOnWorldAxis(new V3(Math.cos(a), 0, -Math.sin(a)), lean); popIn(p, t, 17.4 + i * 0.12, 0.35, 2.4); });
    pawns.forEach((p, i) => { const hand = p.localToWorld(new V3(0, 0.45, 0)).add(new V3(-Math.sin(p.userData.a), 0, -Math.cos(p.userData.a)).multiplyScalar(0.36)); ropes[i].set(hand, rock.group.position.clone()); ropes[i].mesh.visible = p.visible; });
    popIn(q, t, 19.55, 0.4, 1.1); q.position.set(0, gl.top + 1.25 + 0.08 * Math.sin(t * 3), 0); q.rotation.y = 0.5 * Math.sin(t * 1.6);
  };
  const shot = shotOf(anim);
  const A0 = shot([gl.group, rock.group, q, ...pawns], 17.6, 21.38, { from: [0.15, 0.32, 1], pull: 1.0 });
  const A1 = shot([gl.group, rock.group, q, ...pawns], 17.6, 21.38, { from: [-0.25, 0.28, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.6, 1.6); fill.intensity = 2.2 + 0.6 * Math.sin(t * 6);
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 17.32, 21.38)), t, 19.5, 0.12, 0.35));
  };
});

// ---------------------------------------------------------------- 5. pote (21.38 – 34.62)
// "Imagina um pote de areia com dezessete cores quase iguais, misturadas. Pra separar, são mais de cem etapas.
//  Terras raras são assim: vêm juntas na pedra, e quase ninguém sabe separar."
addScene("pote", 21.38, 34.62, (S) => {
  const jar = makeSandJar(); jar.group.position.set(0, 0, -0.5); S.add(jar.group);
  const vials = SAND17.map((c, i) => { const v = makeVial(c, { r: 0.13, h: 0.95 }); const a = (-0.47 + i / 16 * 0.94) * Math.PI; v.group.position.set(Math.sin(a) * 1.85, 0, -0.5 + Math.cos(a) * 1.85); S.add(v.group); return v; });
  const vialsG = new THREE.Group(); S.add(vialsG); vials.forEach((v) => { S.group.remove(v.group); vialsG.add(v.group); });
  const tw = makeTweezers(); S.add(tw.group);
  const grain = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat("#ffffff")); S.add(grain);
  const cnt = makeScreenPanel(2.4, 0.95, null, { frac: 0.5, bg: "#1c1410", label: "contador de etapas" });
  const cntG = new THREE.Group(); cntG.add(cnt.mesh); cnt.mesh.position.y = 1.75;
  const cstand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 10), mat(STEEL, { metalness: 0.6 })); cstand.position.y = 0.62; cntG.add(cstand);
  const cfoot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 20), mat("#2a1b12")); cfoot.position.y = 0.04; cntG.add(cfoot);
  cntG.position.set(2.75, 0, -1.6); S.add(cntG);
  const rock = makeRock(1.0, { crystals: false, specks: 260, colors: SAND17, seed: 11 }); rock.group.position.set(0, 0.8, 0); rock.group.add(contactShadow(2.6, 2.6)); S.add(rock.group);
  const T0 = 26.6, DT = 0.153, SEP = 29.55;
  S.hero(jar.group, "pote de vidro com areia", { when: (t) => t < SEP });
  S.hero(vialsG, "fila de 17 tubinhos", { when: (t) => t > 26.7 && t < SEP });
  S.hero(cntG, "contador de etapas", { when: (t) => t > T0 && t < SEP });
  S.hero(rock.group, "pedra com grãos coloridos", { when: (t) => t > SEP + 0.45 });
  let cur = "";
  const paintCnt = (s, hot) => { if (s === cur) return; cur = s; cnt.paint((x, w, h) => { x.fillStyle = "#141414"; x.fillRect(0, 0, w, h); centerText(x, s, w / 2, h / 2 + 4, `900 ${Math.round(h * 0.5)}px Inter`, hot ? ORANGE : "#ffffff"); }); };
  const mouth = () => jar.group.localToWorld(new V3(0, jar.sandY + 0.15, 0));
  const anim = (t) => {
    jar.group.rotation.y = 0.15 * Math.sin(t * 0.5);
    vials.forEach((v, i) => { popIn(v.group, t, 26.35 + i * 0.02, 0.3); v.set(sm(t, T0 + i * DT + 0.08, T0 + i * DT + 0.25) * 0.6); });
    // tweezers: one fast trip per vial
    const i = clamp(Math.floor((t - T0) / DT), 0, 16), ph = clamp((t - T0 - i * DT) / DT), on = t > T0 - 0.2 && t < T0 + 17 * DT;
    const vTop = vialsG.localToWorld(vials[i].group.position.clone().add(new V3(0, 1.15, 0)));
    const m = mouth(), go = ph < 0.5 ? sm(ph, 0, 0.5) : 1 - sm(ph, 0.5, 1);
    const p = m.clone().lerp(vTop, go); p.y += Math.sin(go * Math.PI) * 0.5;
    tw.group.position.copy(p); tw.group.rotation.set(0, 0, -0.25); tw.pinch(ph < 0.5 ? 1 : 0); tw.group.visible = on;
    grain.visible = on && ph < 0.5; grain.position.copy(p).add(new V3(0, 0.02, 0)); grain.material.color.copy(SAND17[i]);
    paintCnt(t < T0 ? "ETAPA 1" : t < 29.2 ? "ETAPA " + (1 + Math.floor(99 * lin(t, T0, 29.2))) : "100+", t >= 29.2);
    popInOut(cntG, t, 26.45, SEP, 0.35);
    for (const o of [jar.group, vialsG]) popOut(o, t, SEP, 0.3);
    popIn(rock.group, t, SEP + 0.1, 0.45); rock.group.rotation.set(0, t * 0.45, 0);
    if (t > 32.42) rock.group.position.x = 0.04 * Math.sin(t * 37) * (1 - sm(t, 32.42, 33.2));
  };
  const shot = shotOf(anim);
  const A0 = shot([jar.group], 21.38, 26.3, { from: [0.15, 0.55, 1], pull: 1.06 });
  const A1 = shot([jar.group], 21.38, 26.3, { from: [-0.1, 0.45, 1], pull: 0.98 });
  const B0 = shot([jar.group, vialsG, cntG], 26.7, 29.5, { from: [0.05, 0.28, 1], pull: 1.0 });
  const C0 = shot([rock.group], SEP + 0.5, 34.62, { from: [0.2, 0.3, 1], pull: 1.05 });
  const C1 = shot([rock.group], SEP + 0.5, 34.62, { from: [-0.2, 0.25, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(t > 32.4 ? RED : ORANGE); fill.position.set(0, 2.8, 2.0); fill.intensity = t > 32.4 ? 2 + 2 * sm(t, 32.4, 32.9) : 2.0;
    CAM.apply(CAM.track(t, [[21.38, A0], [26.2, A1, 4.8], [26.75, B0, 0.55], [SEP + 0.5, C0, 0.6], [34.62, C1, 4.4]]));
  };
});

// ---------------------------------------------------------------- 6. china (34.62 – 45.6)
// "Quem sabe é a China. De cada dez toneladas tiradas do chão, sete saem de lá.
//  E na hora de separar, a fatia é ainda maior: mais de oito em cada dez."
addScene("china", 34.62, 45.6, (S) => {
  const hg = makeHangar({ W: 6.6, D: 2.6, H: 2.2 }); hg.group.position.set(0, 0, -1.9); S.add(hg.group);
  const fl = makeWavingFlag("china", { w: 1.8, h: 1.2, pole: 5.1 }); fl.group.position.set(-3.75, 0, -0.9); S.add(fl.group);
  const trucks = [], tG = new THREE.Group(); S.add(tG);
  for (let i = 0; i < 10; i++) { const tr = makeDumpTruck(); tr.group.scale.setScalar(0.6); tr.group.rotation.y = Math.PI / 2; tr.group.position.set(-2.79 + i * 0.62, 0, 1.1); tG.add(tr.group); trucks.push(tr); }
  const vials = [], vG = new THREE.Group(); S.add(vG);
  for (let i = 0; i < 10; i++) { const v = makeVial("#d9d0c2", { r: 0.18, h: 1.0 }); v.group.position.set(-2.79 + i * 0.62, 0, 1.1); vG.add(v.group); vials.push(v); }
  const GO = 39.04, RED_AT = 43.5, VI = 40.35;
  const red = new THREE.Color(RED), yellow = new THREE.Color("#f2b632"), grey = new THREE.Color("#d9d0c2");
  S.hero(hg.group, "galpão aberto"); S.hero(fl.group, "bandeira da China no mastro");
  S.hero(tG, "fila de 10 caminhões de minério", { when: (t) => t < GO - 0.05 });
  S.hero(vG, "fila de 10 tubos de pó", { when: (t) => t > VI + 0.5 });
  const anim = (t) => {
    fl.update(t);
    trucks.forEach((tr, i) => {
      const go = i < 7, t0 = GO + i * 0.11, k = go ? sm(t, t0, t0 + 0.85) : 0;
      tr.group.position.z = 1.1 - 2.5 * k; tr.group.visible = t < VI + 0.3;
      tr.cabMat.color.copy(yellow).lerp(red, go ? sm(t, t0 - 0.05, t0 + 0.2) : 0);
      popOut(tr.group, t, VI, 0.3, 0.6);
    });
    vials.forEach((v, i) => {
      popIn(v.group, t, VI + i * 0.04, 0.35);
      const isRed = i < 8 || i === 8, kr = isRed ? sm(t, RED_AT + i * 0.14, RED_AT + i * 0.14 + 0.2) : 0;
      v.set(i === 8 ? lerp(0.8, 0.45, kr) : 0.8 * sm(t, VI + 0.3, VI + 1.0));
      if (i === 8 && kr === 0) v.set(0.8 * sm(t, VI + 0.3, VI + 1.0));
      v.fillMat.color.copy(grey).lerp(red, kr); v.fillMat.emissive.copy(red); v.fillMat.emissiveIntensity = 0.6 * kr;
    });
  };
  const shot = shotOf(anim);
  const A0 = shot([hg.group, fl.group, tG], 34.62, 40.2, { from: [0.2, 0.3, 1], pull: 1.02 });
  const A1 = shot([hg.group, fl.group, tG], 34.62, 40.2, { from: [-0.06, 0.26, 1], pull: 0.98 });
  const B1 = shot([hg.group, fl.group, vG], 40.6, 45.6, { from: [0.12, 0.22, 1], pull: 0.97 });
  return (t) => {
    anim(t);
    fill.color.set(t > RED_AT ? RED : ORANGE); fill.position.set(0, 2.6, 2.4); fill.intensity = 1.6 + (t > RED_AT ? 1.6 * sm(t, RED_AT, RED_AT + 1) : 0);
    CAM.apply(CAM.track(t, [[34.62, A0], [40.2, A1, 5.5], [45.6, B1, 5.0]]));
  };
});

// ---------------------------------------------------------------- 7. torneira (45.6 – 56.62)
// "Em 2025, a China dificultou a venda delas pra outros países. Resultado: faltou ímã,
//  e uma fábrica da Ford nos Estados Unidos ficou uma semana parada."
addScene("torneira", 45.6, 56.62, (S) => {
  const wall = new THREE.Mesh(rbox(2.4, 3.8, 0.12, 0.03), mat("#4a3a30", { roughness: 0.9 })); wall.position.set(-1.6, 1.9, -1.62); S.add(wall);
  const fc = makeFaucet("china"); fc.group.position.set(-1.6, 3.2, -1.5); S.add(fc.group);
  const bin = new THREE.Group(); const binM = mat("#a9aeb5", { roughness: 0.45, metalness: 0.3, emissive: "#2a2a2a", emissiveIntensity: 0.4 });
  for (const [w, h, d, x, y, z] of [[1.0, 0.06, 1.0, 0, 0.03, 0], [1.0, 0.8, 0.06, 0, 0.4, 0.47], [1.0, 0.8, 0.06, 0, 0.4, -0.47], [0.06, 0.8, 1.0, 0.47, 0.4, 0], [0.06, 0.8, 1.0, -0.47, 0.4, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), binM); b.position.set(x, y, z); bin.add(b); }
  bin.position.set(-1.6, 0, -0.27); bin.add(contactShadow(1.5, 1.5)); S.add(bin);
  const NP = 40, pile = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.5, 14), new THREE.MeshPhysicalMaterial({ color: "#c9ccd2", metalness: 1, roughness: 0.25, envMap: ENV, emissive: ORANGE, emissiveIntensity: 0.35 }), NP);
  { const rnd = mulberry32(4), m4 = new THREE.Matrix4(); for (let i = 0; i < NP; i++) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, 0)); m4.compose(new V3((rnd() - 0.5) * 0.75, 0.1 + (i / NP) * 0.55, (rnd() - 0.5) * 0.75), q, new V3(0.08, 0.08, 0.08)); pile.setMatrixAt(i, m4); } }
  bin.add(pile);
  const flow = (t) => 1 - sm(t, 47.4, 50.2) * 0.97 - (t > 50.6 ? 0.03 : 0);
  const stream = makeMagnetStream(70, flow); S.add(stream.mesh);
  const conv = makeConveyor(3.8, 1.4); conv.group.position.set(0.9, 0, 0.95); S.add(conv.group);
  const car = makeCar({ color: "#e8dcc8" }); car.scale.setScalar(0.85); car.position.set(1.5, conv.top, 0.95); S.add(car);
  const bay = new THREE.Mesh(rbox(0.62, 0.12, 0.8, 0.03), mat("#0d0d0d")); bay.position.set(0.72, 0.62, 0); car.add(bay);
  const hood = new THREE.Group(); hood.position.set(0.45, 0.66, 0); car.add(hood);
  const hp = new THREE.Mesh(rbox(0.66, 0.06, 0.9, 0.03), mat("#e8dcc8", { roughness: 0.35, metalness: 0.25 })); hp.position.x = 0.33; hood.add(hp); hood.rotation.z = 1.2;
  const arm = makeRobotArm(); arm.group.position.set(-0.1, 0, -0.75); S.add(arm.group);
  const held = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), pile.material); S.add(held);
  const siren = makeSiren(); siren.group.scale.setScalar(1.5); siren.group.position.set(2.6, 0, -0.45); S.add(siren.group);
  const cnt = makeScreenPanel(3.0, 1.0, null, { frac: 0.4, bg: "#141414", label: "contador de dias" }); cnt.mesh.position.set(1.2, 2.75, -1.35); S.add(cnt.mesh);
  const cpost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.25, 10), mat(STEEL, { metalness: 0.6 })); cpost.position.set(1.2, 1.12, -1.4); S.add(cpost);
  const STOP = 52.3, EMPTY = 51.2;
  S.hero(fc.group, "torneira com bandeira da China", { when: (t) => t < 51.0 });
  S.hero(bin, "caixa de ímãs", { when: (t) => t < 51.0 });
  S.hero(arm.group, "braço robótico", { when: (t) => t > 51.45 });
  S.hero(car, "carro sem motor na esteira", { when: (t) => t > 51.45 });
  S.hero(siren.group, "sirene vermelha", { when: (t) => t > STOP + 0.2 });
  S.hero(cnt.mesh, "painel DIAS PARADA", { when: (t) => t > 53.4 });
  S.solid(conv.group, "esteira"); S.solid(bin, "caixa");
  // planar 2-link IK for the arm: target world point → (yaw, a1, a2)
  const L1 = 1.2, L2 = 1.3, SH = 0.66;
  const ik = (p) => {
    const base = arm.group.position, dx = p.x - base.x, dz = p.z - base.z, u = Math.hypot(dx, dz), v = p.y - SH;
    const yaw = Math.atan2(dz, -dx), D = Math.min(L1 + L2 - 0.01, Math.hypot(u, v));
    const a2 = Math.acos(clamp((D * D - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1)), a1 = Math.atan2(u, v) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
    return [yaw, a1, a2];
  };
  const binP = new V3(-1.6, 1.3, -0.27), carP = new V3(1.5 + 0.72 * 0.85, 1.45, 0.95);
  const lerpAng = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
  let paintedN = -1;
  const anim = (t) => {
    fc.handle.rotation.y = -2.4 * sm(t, 47.4, 48.8);
    const lvl = 1 - sm(t, 47.8, 51.0); pile.count = Math.round(NP * lvl);
    stream.update(t, fc.group.localToWorld(fc.mouth.clone()), 0.3 + 0.55 * lvl);
    // arm: pick-and-place loop until the bin runs dry, then one empty dip and it stops
    let target, grip = 0, carry = false;
    if (t < EMPTY) {
      const per = 1.6, ph = ((t - 45.6) % per) / per;
      const k = ph < 0.35 ? sm(ph, 0, 0.35) : ph < 0.5 ? 1 : ph < 0.85 ? 1 - sm(ph, 0.5, 0.85) : 0;
      target = binP.clone().lerp(carP, k); target.y += Math.sin(k * Math.PI) * 0.7; carry = ph < 0.5 && lvl > 0.05; grip = ph < 0.5 ? 1 : 0;
    } else {
      const k = sm(t, EMPTY, EMPTY + 0.45), up = sm(t, 51.75, STOP);
      target = binP.clone(); target.y += 0.5 * (1 - k) - 0.2 * k + 1.0 * up; grip = sm(t, 51.5, 51.65);
    }
    const [yw, a1, a2] = ik(target); arm.pose(yw, a1, a2, grip);
    held.visible = carry; if (carry) held.position.copy(arm.tip());
    conv.set(t < STOP ? (t - 45.6) * 0.5 : (STOP - 45.6) * 0.5);
    siren.set(t > STOP ? 1 : 0, t);
    const n = t < 53.4 ? 0 : 1 + Math.floor(6.99 * lin(t, 53.4, 55.9));
    if (n !== paintedN) { paintedN = n; cnt.paint((x, w, h) => { x.fillStyle = "#141414"; x.fillRect(0, 0, w, h); if (n) { const s = n + (n > 1 ? " DIAS PARADA" : " DIA PARADA"); let px = Math.round(h * 0.5); x.font = `900 ${px}px Inter`; while (x.measureText(s).width > w * 0.9) { px -= 2; x.font = `900 ${px}px Inter`; } centerText(x, s, w / 2, h / 2 + 4, `900 ${px}px Inter`, n >= 7 ? "#ff3b1f" : "#ffffff"); } }); }
    cnt.mesh.visible = t > 53.3;
  };
  const shot = shotOf(anim);
  const A0 = shot([fc.group, bin, arm.group, car, siren.group], 45.6, 51.0, { from: [0.25, 0.28, 1], pull: 1.03 });
  const A1 = shot([fc.group, bin, arm.group, car, siren.group], 45.6, 51.0, { from: [0.08, 0.25, 1], pull: 1.0 });
  const B0 = shot([arm.group, car, siren.group, cnt.mesh], 51.2, 56.62, { from: [0.15, 0.38, 1], pull: 1.02 });
  const B1 = shot([arm.group, car, siren.group, cnt.mesh], 51.2, 56.62, { from: [-0.05, 0.32, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(t > STOP ? RED : ORANGE); fill.position.set(0.6, 3.4, 2.6); fill.intensity = t > STOP ? 3.0 + 1.5 * Math.max(0, Math.sin(t * 12)) : 2.6;
    CAM.apply(CAM.shake(CAM.track(t, [[45.6, A0], [50.9, A1, 5.3], [51.5, B0, 0.45], [56.62, B1, 5.1]]), t, STOP, 0.15, 0.35));
  };
});

// ---------------------------------------------------------------- 8. brasil (56.62 – 62.3)
// "E o Brasil? Segunda maior reserva do mundo... e produz menos de um por cento."
addScene("brasil", 56.62, 62.3, (S) => {
  const cn = makeRankColumn("china", { color: RED }); cn.group.position.set(-1.15, 0, 0); S.add(cn.group);
  const br = makeRankColumn("brasil", { color: GREEN }); br.group.position.set(1.15, 0, 0); S.add(br.group);
  const UNIT = 4.0 / 44, PROD = 60.2;
  S.hero(cn.group, "coluna com bandeira da China"); S.hero(br.group, "coluna com bandeira do Brasil");
  S.solid(cn.group, "coluna china"); S.solid(br.group, "coluna brasil");
  const anim = (t) => {
    const prod = sm(t, PROD, PROD + 0.8);
    cn.setH(44 * UNIT * sm(t, 56.7, 57.4));
    br.setH(lerp(11 * UNIT * sm(t, 57.3, 57.95), 4.0 * 2 / 270, prod));
    cn.label(t < PROD ? "44 MILHÕES t" : "270 MIL t"); br.label(t < PROD ? "11 MILHÕES t" : "2 MIL t");
    br.colMat.emissiveIntensity = 0.25 + (t > 57.8 && t < PROD ? 0.6 * Math.abs(Math.sin((t - 57.8) * 4)) : 0);
    cn.group.rotation.y = 0.08; br.group.rotation.y = -0.08;
  };
  const shot = shotOf(anim);
  const A0 = shot([cn.group, br.group], 57.4, 62.3, { from: [0.3, 0.5, 1], pull: 1.04 });
  const A1 = shot([cn.group, br.group], 57.4, 62.3, { from: [-0.2, 0.45, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(t < PROD ? GREEN : RED); fill.position.set(1.2, 3.2, 2.2); fill.intensity = 2.0;
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 56.62, 62.3)), t, PROD, 0.12, 0.35));
  };
});

// ---------------------------------------------------------------- 9. mina (62.3 – 74.5)
// "Só uma mina está produzindo, em Goiás. Este ano, uma empresa americana comprou por quase três bilhões de dólares,
//  e a produção vai pros Estados Unidos. O governo brasileiro estuda contestar."
addScene("mina", 62.3, 74.5, (S) => {
  const pit = makeOpenPit({ W: 7.0, D: 5.0 }); S.add(pit.group);
  const sign = new THREE.Group(); sign.position.set(2.5, pit.H, -1.7); S.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 10), mat(STEEL, { metalness: 0.6 })); post.position.y = 0.6; sign.add(post);
  const sp = makePlate("MINAÇU (GO)", 2.3, 0.62, { bg: GREEN, fg: "#ffffff" }); sp.position.set(0, 1.35, 0.05); sign.add(sp);
  const pin = new THREE.Group(); const pinM = mat(RED, { roughness: 0.35, emissive: RED, emissiveIntensity: 0.3 });
  const ph = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), pinM); ph.position.y = 0.72; pin.add(ph);
  const pc = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 24), pinM); pc.rotation.x = Math.PI; pc.position.y = 0.3; pin.add(pc);
  S.add(pin);
  const tag = makeTag("US$ 2,8 BI", 2.1, 0.78, ORANGE); S.add(tag);
  const water = makeWater(4.2, 3.0); water.position.set(6.0, 0, 0.3); S.add(water);
  const ship = makeShip("EUA"); ship.scale.setScalar(1.3); ship.position.set(6.0, 0.25, 0.3); S.add(ship);
  const truck = makeDumpTruck(); truck.group.scale.setScalar(0.72); S.add(truck.group);
  const book = makeLawBook({ title: "GOVERNO", color: "#1f3d5e", w: 1.9, d: 1.3, t: 0.3, emblem: false }); book.group.position.set(-2.3, 0, 3.4); S.add(book.group);
  const mark = book.print("CONTESTAR?", 1.65, 0.44, 0.22, { bg: RED, fg: "#ffffff" });
  const stamp = makeStamp({ w: 1.75, d: 0.5 }); S.add(stamp);
  const T_TAG = 66.1, T_TR = 70.05, T_BK = 72.3, T_ST = 73.76;
  S.hero(pit.group, "mina a céu aberto", { when: (t) => t < 69.75 });
  S.hero(sign, "placa MINAÇU (GO)", { when: (t) => t < T_TAG });
  S.hero(pin, "pino de mapa", { when: (t) => t > 62.8 && t < T_TAG });
  S.hero(tag, "etiqueta US$ 2,8 BI", { when: (t) => t > T_TAG + 0.5 && t < 69.4 });
  S.hero(truck.group, "caminhão de minério", { when: (t) => t > 70.45 && t < 72.1 });
  S.hero(ship, "navio cargueiro EUA", { when: (t) => t > 70.45 && t < 72.1 });
  S.hero(book.group, "pasta do governo", { when: (t) => t > T_BK + 0.4 });
  S.hero(stamp, "carimbo", { when: (t) => t > T_BK + 0.4 && t < 74.3 });
  S.solid(pit.group, "terreno", { when: (t) => t < T_BK }); S.solid(truck.group, "caminhão", { restsOn: ["terreno"], when: (t) => t > T_TR && t < 71.8 });
  const anim = (t) => {
    popInOut(pin, t, 62.5, 66.0); pin.position.set(0, pit.H + 1.0 + 0.12 * Math.sin(t * 3), 0); pin.rotation.y = t;
    popIn(sign, t, 62.4, 0.35);
    const kt = eOut(lin(t, T_TAG, T_TAG + 0.45)), bounce = Math.sin(clamp((t - T_TAG - 0.45) / 0.4) * Math.PI) * 0.12 * (t > T_TAG + 0.45 ? 1 : 0);
    tag.visible = t > T_TAG; tag.position.set(2.15, pit.H + 0.39 + 3.5 * (1 - kt) + bounce, 1.95); tag.rotation.set(0, -0.15, 0.25 * (1 - kt) + 0.03 * Math.sin(t * 2.5));
    popOut(tag, t, 69.4, 0.3); if (t <= T_TAG) tag.visible = false;
    const kr = sm(t, T_TR, 72.0); truck.group.position.set(lerp(0.4, 2.75, kr), pit.H, 2.0); truck.group.rotation.y = 0; truck.group.visible = t > 69.6;
    ship.visible = t > 69.6; water.visible = ship.visible; ship.position.x = lerp(9.2, 6.0, eOut(lin(t, 69.6, 70.6))); water.position.x = ship.position.x;
    ship.position.y = 0.25 + 0.04 * Math.sin(t * 1.7); ship.rotation.z = 0.015 * Math.sin(t * 1.3);
    popIn(book.group, t, T_BK, 0.35); mark.visible = t > T_ST;
    popOut(pit.group, t, T_BK - 0.05, 0.3); popOut(sign, t, T_BK - 0.05, 0.3); if (t < T_BK) popIn(sign, t, 62.4, 0.35); ship.visible = ship.visible && t < T_BK + 0.1; truck.group.visible = truck.group.visible && t < T_BK + 0.1; water.visible = ship.visible;
    const ks = t < T_ST ? sm(t, T_BK + 0.3, T_ST) : 1 - sm(t, T_ST + 0.15, T_ST + 0.5);
    stamp.visible = t > T_BK + 0.2 && t < 74.4; stamp.position.set(-2.25, book.top + 0.02 + 1.6 * (1 - (t < T_ST ? Math.pow(ks, 3) : ks)) * (t < T_ST ? 1 : 0) + (t >= T_ST ? 1.6 * (1 - ks) : 0), 1.6);
  };
  const shot = shotOf(anim);
  const A0 = shot([pit.group, sign, pin], 62.5, 66.0, { from: [0.2, 0.7, 1], pull: 1.0 });
  const A1 = shot([pit.group, sign, pin], 62.5, 66.0, { from: [-0.05, 0.6, 1], pull: 0.96 });
  const B0 = shot([pit.group, tag], T_TAG + 0.5, 70.0, { from: [0.1, 0.45, 1], pull: 1.0 });
  const B1 = shot([pit.group, tag], T_TAG + 0.5, 70.0, { from: [0.32, 0.5, 1], pull: 1.0 });
  const C0 = shot([pit.group, truck.group, ship], T_TR, 72.2, { from: [0.15, 0.5, 1], pull: 1.02 });
  const D0 = shot([book.group, stamp], T_BK + 0.3, 74.5, { from: [0.1, 0.9, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(t > T_ST ? RED : ORANGE); fill.position.set(0, 3, 2.4); fill.intensity = 2.0;
    CAM.apply(CAM.shake(CAM.track(t, [[62.3, A0], [65.9, A1, 3.6], [66.6, B0, 0.6], [69.75, B1, 3.1], [70.4, C0, 0.6], [72.75, D0, 0.6]]), t, T_ST, 0.15, 0.35));
  };
});

// ---------------------------------------------------------------- 10. debate (74.5 – 90.32)
// "No debate da eleição, Lula perguntou se Flávio Bolsonaro ia entregar as terras raras aos americanos.
//  Flávio chamou de fake news. Lula quer controle e indústria nacional. Flávio defende parceria com os
//  Estados Unidos, que querem depender menos da China."  [cartões: Lula 74.6–76.96, Flávio 77.0–82.72]
addScene("debate", 74.5, 90.32, (S) => {
  const bal = makeBalance(); bal.group.position.set(0, 0, 0.0); S.add(bal.group);
  const left = makeLabelBlock("CONTROLE", "NACIONAL", "#2f7f6f"), right = makeLabelBlock("PARCERIA", "COM EUA", "#8a6a2f"); left.position.z = 0.05; right.position.z = 0.05;
  bal.pans[0].add(left); bal.pans[1].add(right);
  const B0T = 82.78, LT = 82.85, RT = 85.55;
  S.hero(bal.group, "balança de dois pratos", { when: (t) => t > B0T + 0.4 });
  S.hero(left, "bloco CONTROLE NACIONAL", { when: (t) => t > LT + 0.45 });
  S.hero(right, "bloco PARCERIA COM EUA", { when: (t) => t > RT + 0.45 });
  const anim = (t) => {
    popIn(bal.group, t, B0T - 0.15, 0.4);
    const kl = eOut(lin(t, LT, LT + 0.4)), kr = eOut(lin(t, RT, RT + 0.4));
    left.visible = t > LT; left.position.y = 2.4 * (1 - kl); right.visible = t > RT; right.position.y = 2.4 * (1 - kr);
    const tilt = 0.14 * sm(t, LT + 0.3, LT + 0.7) * (1 - sm(t, RT + 0.3, RT + 0.9)) + 0.035 * Math.sin((t - RT) * 2.6) * sm(t, RT + 0.6, RT + 1.2);
    bal.setTilt(tilt);
  };
  const shot = shotOf(anim);
  const D0 = CAM.pose([[-2.4, 0, -1.4], [2.4, 3.2, 1.8]], { zone: "stage", from: [0.2, 0.3, 1] });
  const D1 = CAM.pose([[-2.4, 0, -1.4], [2.4, 3.2, 1.8]], { zone: "stage", from: [-0.2, 0.3, 1] });
  const A0 = shot([bal.group, left, right], 83.4, 90.32, { from: [0.18, 0.3, 1], pull: 1.04 });
  const A1 = shot([bal.group, left, right], 83.4, 90.32, { from: [-0.15, 0.25, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 3.4, 2.4); fill.intensity = 1.8;
    CAM.apply(CAM.track(t, [[74.5, D0], [82.5, D1, 8.0], [83.2, A0, 0.6], [90.32, A1, 7.1]]));
  };
});

// ---------------------------------------------------------------- 11. escolha (90.32 – 100.4)
// "Então me diz: quem deve explorar? Empresa estrangeira, com dinheiro e tecnologia...
//  ou só empresa brasileira, mesmo que demore mais?"
addScene("escolha", 90.32, 100.4, (S) => {
  const pit = makeOpenPit({ W: 4.4, D: 2.6, H: 0.6, r: 1.0, steps: 3 }); pit.group.position.set(0, 0, -3.6); S.add(pit.group);
  const roadM = mat("#3b3430", { roughness: 0.9 });
  const road = (a, b) => { const d = b.clone().sub(a), L = d.length(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, L), roadM); m.position.copy(a).add(b).multiplyScalar(0.5); m.position.y = 0.015; m.rotation.y = Math.atan2(d.x, d.z); m.userData.decor = true; S.add(m); };
  const fork = new V3(0, 0, 0.3);
  road(new V3(0, 0, -2.1), fork); road(fork, new V3(-2.3, 0, 2.0)); road(fork, new V3(2.3, 0, 2.0));
  const signG = new THREE.Group(); signG.position.set(0, 0, -0.7); S.add(signG);
  const lsg = makeArrowSign("EMPRESA", "ESTRANGEIRA", -1, "#2f6fb0", { y: 4.15, post: 4.85 }); signG.add(lsg);
  const rsg = makeArrowSign("EMPRESA", "BRASILEIRA", 1, GREEN, { y: 2.7, post: 0 }); signG.add(rsg);
  const coin = makeCoin(0.6, "$"); S.add(coin.group);
  const gear = makeGear(0.6, 10, "#c9ccd2"); const gearG = new THREE.Group(); gearG.add(gear); S.add(gearG);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 12), mat(STEEL, { metalness: 0.6 })); axle.position.y = 0.37; gearG.add(axle); const gfoot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 20), mat("#2a1b12")); gfoot.position.y = 0.04; gearG.add(gfoot); gear.position.y = 0.8; gearG.add(contactShadow(1.0, 1.0));
  const hg = makeHourglass(); hg.group.scale.setScalar(1.25); hg.group.position.set(2.3, 0, 1.9); S.add(hg.group);
  const truck = makeDumpTruck(); truck.group.scale.setScalar(1.0); S.add(truck.group);
  S.hero(lsg, "placa EMPRESA ESTRANGEIRA"); S.hero(rsg, "placa EMPRESA BRASILEIRA");
  S.hero(truck.group, "caminhão de minério", { when: (t) => t > 91.2 });
  S.hero(coin.group, "moeda de dólar", { when: (t) => t > 92.9 }); S.hero(gearG, "engrenagem no eixo", { when: (t) => t > 93.9 });
  S.hero(hg.group, "ampulheta", { when: (t) => t > 96.5 });
  S.solid(signG, "placa"); S.solid(hg.group, "ampulheta");
  const anim = (t) => {
    popIn(lsg, t, 90.4, 0.4); popIn(rsg, t, 90.6, 0.4); signG.rotation.y = 0.06 * Math.sin(t * 0.7);
    const kd = sm(t, 90.4, 91.4); truck.group.position.set(0, 0, lerp(2.4, 1.1, kd));
    const look = 0.35 * sm(t, 92.7, 93.2) * (1 - sm(t, 95.4, 95.9)) - 0.35 * sm(t, 95.4, 95.9) * (1 - sm(t, 98.2, 98.8));
    truck.group.rotation.y = -Math.PI / 2 + look;
    popIn(coin.group, t, 92.65, 0.4); coin.group.position.set(-2.7, 1.6 + 0.08 * Math.sin(t * 2.4), 1.2); coin.spin(Math.PI / 2); coin.group.rotation.y = 0.5 * Math.sin(t * 1.5);
    popIn(gearG, t, 93.75, 0.4); gearG.position.set(-2.0, 0, 2.3); gearG.rotation.y = 0.3; gear.rotation.z = t * 1.2;
    popIn(hg.group, t, 96.3, 0.4); hg.setK(lin(t, 96.4, 100.4) * 0.8);
  };
  const shot = shotOf(anim);
  const A0 = shot([lsg, rsg, truck.group, coin.group, gearG, hg.group], 92.0, 100.4, { from: [0.12, 0.3, 1], pull: 1.03 });
  const A1 = shot([lsg, rsg, truck.group, coin.group, gearG, hg.group], 92.0, 100.4, { from: [-0.08, 0.26, 1], pull: 0.98 });
  return (t) => {
    anim(t);
    fill.color.set(t < 95.4 ? "#4a8ad8" : GREEN); fill.position.set(t < 95.4 ? -2.4 : 2.4, 3.0, 2.2); fill.intensity = 2.2;
    CAM.apply(CAM.blend(A0, A1, sm(t, 90.32, 100.4)));
  };
});
