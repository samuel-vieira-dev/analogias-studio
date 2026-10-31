// ============================================================================
// videos/2026-10-30-reforma-tributaria-2027/scenes.js
// 3D scenes synced to audio/words.json (narration 0–91.45 s, video 93.45 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Generic imagery only: no store, food or appliance brands. Photos (TCU, Senado) sit in
// porta-retratos with their credit in the source zone for the whole time they are on screen.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const PAPER = "#fbf7ef", INK = "#1c1410", GOLD = "#e0a83a", GLASS = "#cfe6ff", BLUE = "#2f6fb0", WOODC = "#6a4a30", GREY = "#8a95a3";

const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.04 }, o));
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));
// Marks every printed plate under obj as texture (not read as text by the QA): small labels on props in the back.
const detailAll = (obj) => obj.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; });

// Canvas texture painted by a function (w x h px). API { tex, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Text fitted to a width: shrinks the font until the text fits maxW.
function fitText(x, text, cx, cy, px, weight, color, maxW) {
  let s = px; x.font = `${weight} ${s}px Inter`; while (x.measureText(text).width > maxW && s > 10) { s -= 4; x.font = `${weight} ${s}px Inter`; }
  centerText(x, text, cx, cy, `${weight} ${s}px Inter`, color); return s;
}
// Upright panel (w x h, 0.03 deep) whose front face (+z) is a repaintable canvas. Origin: centre.
// The face is registered as a plate so the QA measures its text (frac = cap height / panel height).
function makeScreenPanel(w, h, painter, { px = 512, frac = 0.3, bg = "#141414", label = "painel" } = {}) {
  const ct = canvasTex(px, Math.round(px * h / w), painter);
  const side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), side]);
  m.userData.plate = { text: label, w, h, depth: 0.03, frac, detail: false };
  return { mesh: m, paint: ct.paint, setFrac: (f) => { m.userData.plate.frac = f; } };
}

// Price tag: body with a pointed end (left, or right with point: "right") and a hole, printed text.
// Origin: centre, front +z. userData.hole = local position of the hole (where a tie string goes).
function makeTag(text, w = 1.2, h = 0.55, color = ORANGE, fg = "#ffffff", { point = "left" } = {}) {
  const g = new THREE.Group(), sx = point === "right" ? -1 : 1;
  const s = new THREE.Shape(); s.moveTo(sx * (-w / 2 + h * 0.4), -h / 2); s.lineTo(sx * (w / 2), -h / 2); s.lineTo(sx * (w / 2), h / 2); s.lineTo(sx * (-w / 2 + h * 0.4), h / 2); s.lineTo(sx * (-w / 2), 0); s.closePath();
  const hole = new THREE.Path(); hole.absarc(sx * (-w / 2 + h * 0.3), 0, h * 0.09, 0, Math.PI * 2, true); s.holes.push(hole);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }).translate(0, 0, -0.025), mat(color, { roughness: 0.5, side: THREE.DoubleSide })); g.add(body);
  const p = makePlate(text, w * 0.66, h * 0.66, { bg: color, fg }); p.position.set(sx * h * 0.2, 0, 0.026); g.add(p);
  g.userData.hole = new V3(sx * (-w / 2 + h * 0.3), 0, 0);
  return g;
}
// Thin string between two world points, set every frame. API { mesh, set(a, b) }
function makeTie(color = "#e9e1d4", r = 0.012) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6), mat(color, { roughness: 0.8 }));
  const set = (a, b) => { const d = b.clone().sub(a), L = d.length(); mesh.position.copy(a).addScaledVector(d, 0.5); mesh.scale.set(1, Math.max(0.001, L), 1); mesh.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); };
  return { mesh, set };
}
// Ties `tie` from the hole of `tag` to the world point `to` (hidden while the tag is hidden).
function tieTag(tie, tag, to) {
  tag.updateMatrixWorld(true); tie.mesh.visible = tag.visible && tag.scale.x > 0.3;
  tie.set(tag.localToWorld(tag.userData.hole.clone()), to);
}
// Plinth (display block) with an optional printed name on its front. Origin: floor centre. API { group, top }
function makePlinth({ w = 0.95, h = 0.4, d = 0.95, color = "#3a2a20", label = null, plateH = 0.5, labelY = null } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.04), mat(color, { roughness: 0.7 })); b.position.y = h / 2; g.add(b);
  if (label) { const p = makePlate(label, w * 0.9, h * plateH, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, labelY ?? h / 2, d / 2 + 0.016); g.add(p); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
// Standing block with a name printed on the front. Origin: floor, centre.
function makeBlock(label, { w = 1.2, h = 1.0, d = 0.5, color = "#3a3330", fg = "#ffffff", ph = 0.34 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.05), mat(color, { roughness: 0.55 })); b.position.y = h / 2; g.add(b);
  const p = makePlate(label, w * 0.88, Math.min(h * ph, 0.42), { bg: "#141414", fg }); p.position.set(0, h * 0.5, d / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 0.6, d + 0.6));
  g.userData.h = h; return g;
}
// Market price sign: a thin stick on a small foot with a card on top. The card has two printed faces
// (front `a`, back `b`) and turns about the stick: flip(k) 0 = front, 1 = back. Origin: floor at the stick.
// API { group, card, flip(k), cardY }
function makePriceSign(a, b = null, { w = 1.0, h = 0.5, stick = 1.6, colorA = ORANGE, colorB = GREEN, fgA = "#ffffff", fgB = "#ffffff" } = {}) {
  const g = new THREE.Group();
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, stick, 8), mat("#c9ced3", { metalness: 0.6, roughness: 0.3 })); st.position.y = stick / 2; g.add(st);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.05, 20), mat("#4a4440")); foot.position.y = 0.025; g.add(foot);
  const card = new THREE.Group(); card.position.y = stick + h / 2 - 0.04; g.add(card);
  const core = new THREE.Mesh(rbox(w + 0.06, h + 0.06, 0.04, 0.02), mat("#f4f1ea")); card.add(core);
  const pa = makePlate(a, w, h, { bg: colorA, fg: fgA }); pa.position.z = 0.036; card.add(pa);
  if (b) { const pb = makePlate(b, w, h, { bg: colorB, fg: fgB }); pb.rotation.y = Math.PI; pb.position.z = -0.036; card.add(pb); }
  const flip = (k) => { card.rotation.y = Math.PI * clamp(k); };
  return { group: g, card, flip, cardY: card.position.y };
}
// Grain texture for the window of a food pack: many small pale grains (rice) or fewer, bigger beans
// with a highlight. Seeded.
function grainTex(bg, grain, seed, { n = 260, rx = 7, ry = 3.2, shine = null } = {}) {
  const c = makeCanvas(256, 128), x = c.getContext("2d"), r = mulberry32(seed);
  x.fillStyle = bg; x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < n; i++) {
    x.save(); x.translate(r() * 256, r() * 128); x.rotate(r() * 3.14);
    x.fillStyle = grain; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); x.fill();
    if (shine) { x.fillStyle = shine; x.beginPath(); x.ellipse(-rx * 0.3, -ry * 0.3, rx * 0.35, ry * 0.3, 0, 0, Math.PI * 2); x.fill(); }
    x.restore();
  }
  return texFrom(c);
}
// Food pack (sealed plastic pack: body, flat heat seam on top, printed label and a clear window
// showing the grains): rice, beans. Origin: floor centre. Height 0.93 at s = 1.
function makeFoodBag(label, { s = 1, bag = "#f3efe6", labelBg = "#2f8a57", fg = "#ffffff", seam = "#e6dfcf", grainBg = "#e9e2cf", grain = "#fffaf0", beans = false } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(0.6, 0.86, 0.24, 0.08), mat(bag, { roughness: 0.45 })); b.position.y = 0.43; g.add(b);
  const top = new THREE.Mesh(rbox(0.63, 0.05, 0.03, 0.01), mat(seam, { roughness: 0.6 })); top.position.y = 0.885; g.add(top);
  const p = makePlate(label, 0.54, 0.22, { bg: labelBg, fg }); p.position.set(0, 0.62, 0.136); g.add(p);
  const tex = beans ? grainTex(grainBg, grain, 11, { n: 46, rx: 15, ry: 9, shine: "rgba(255,210,190,0.18)" }) : grainTex(grainBg, grain, 4);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }));
  win.position.set(0, 0.32, 0.122); g.add(win);
  g.scale.setScalar(s); g.add(contactShadow(0.9, 0.6)); return g;
}
const BEANS = { bag: "#f1e9dc", labelBg: "#6a2e14", fg: "#ffffff", grainBg: "#5a2414", grain: "#7a321e", beans: true };
// Meat pack: foam tray with a red cut (fat cap along the back) under film, label on the film; it rests
// tilted back against a low wooden prop, top toward the viewer. Origin: floor centre.
function makeMeatPack(s = 1) {
  const g = new THREE.Group(), pack = new THREE.Group(), tilt = 0.6;
  const tray = new THREE.Mesh(rbox(0.9, 0.08, 0.62, 0.03), mat("#f4f1ea", { roughness: 0.9 })); tray.position.y = 0.04; pack.add(tray);
  const meat = new THREE.Mesh(rbox(0.72, 0.12, 0.44, 0.06), mat("#c0392b", { roughness: 0.55 })); meat.position.set(0, 0.14, 0.02); pack.add(meat);
  const fat = new THREE.Mesh(rbox(0.7, 0.11, 0.07, 0.03), mat("#f3e3d6", { roughness: 0.6 })); fat.position.set(0, 0.14, -0.21); pack.add(fat);
  const bone = mat("#f4ead8", { roughness: 0.5 });
  const b1 = new THREE.Mesh(rbox(0.05, 0.03, 0.4, 0.01), bone); b1.position.set(0.06, 0.215, 0.02); pack.add(b1);
  const b2 = new THREE.Mesh(rbox(0.3, 0.03, 0.05, 0.01), bone); b2.position.set(0.06, 0.215, 0.2); pack.add(b2);
  const lbl = makePlate("CARNE", 0.3, 0.13, { bg: "#ffffff", fg: "#9a1f18", depth: 0.01, detail: true }); lbl.rotation.x = -Math.PI / 2; lbl.position.set(-0.27, 0.215, 0.22); pack.add(lbl);
  // tilt 0.6 rad: the front-bottom edge (y 0, z 0.31) drops to y ≈ -0.175, so the pack sits at y 0.18
  pack.rotation.x = tilt; pack.position.y = 0.18; g.add(pack);
  const prop = new THREE.Mesh(rbox(0.7, 0.26, 0.1, 0.03), mat("#3a2a20")); prop.position.set(0, 0.13, -0.28); g.add(prop);
  g.scale.setScalar(s); g.add(contactShadow(1.0, 0.8)); return g;
}
// Medicine box: white carton, red cross, green band. Origin: floor centre.
function makeMedBox(s = 1) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(0.8, 0.56, 0.36, 0.03), mat("#f6f4ef", { roughness: 0.6 })); b.position.y = 0.28; g.add(b);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.804, 0.1, 0.364), mat(GREEN, { roughness: 0.5 })); band.position.y = 0.08; g.add(band);
  const cm = mat(RED, { emissive: RED, emissiveIntensity: 0.25 });
  const cv = new THREE.Mesh(rbox(0.09, 0.28, 0.03, 0.01), cm); cv.position.set(0, 0.33, 0.185); g.add(cv);
  const ch = new THREE.Mesh(rbox(0.28, 0.09, 0.03, 0.01), cm); ch.position.set(0, 0.33, 0.185); g.add(ch);
  g.scale.setScalar(s); g.add(contactShadow(1.0, 0.6)); return g;
}
// School: wide two-storey block with a flat roof and parapet, a bell tower in the middle (bell under a
// pointed roof), two rows of windows, a door and a flag on a pole. Origin: floor centre.
function makeSchool(s = 1) {
  const g = new THREE.Group(), W = 1.3, H = 0.9, D = 0.7, wall = mat("#f0d79a", { roughness: 0.8 });
  const body = new THREE.Mesh(rbox(W, H, D, 0.03), wall); body.position.y = H / 2; g.add(body);
  const par = new THREE.Mesh(rbox(W + 0.06, 0.08, D + 0.06, 0.02), mat("#c98a3a")); par.position.y = H + 0.04; g.add(par);
  const tower = new THREE.Mesh(rbox(0.34, 0.36, 0.34, 0.02), wall); tower.position.y = H + 0.08 + 0.18; g.add(tower);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.26, 4), mat(BLUE, { roughness: 0.6 })); cone.rotation.y = Math.PI / 4; cone.position.y = H + 0.08 + 0.36 + 0.13; g.add(cone);
  const arch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), mat("#3a2a20")); arch.position.set(0, H + 0.26, 0.171); g.add(arch);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.1, 16), mat(GOLD, { metalness: 0.6, roughness: 0.3 })); bell.position.set(0, H + 0.25, 0.19); g.add(bell);
  const glass = mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 });
  for (const x of [-0.48, -0.24, 0.24, 0.48]) for (const y of [0.28, 0.66]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.02), glass); w.position.set(x, y, D / 2 + 0.01); g.add(w); }
  const door = new THREE.Mesh(rbox(0.22, 0.36, 0.03, 0.01), mat("#7a4a2e")); door.position.set(0, 0.18, D / 2 + 0.01); g.add(door);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), mat("#c9ced3", { metalness: 0.6 })); pole.position.set(W / 2 - 0.12, H + 0.08 + 0.275, 0.18); g.add(pole);
  const flag = new THREE.Mesh(rbox(0.22, 0.14, 0.01, 0.005), mat(GREEN)); flag.position.set(W / 2 - 0.12 + 0.11, H + 0.08 + 0.48, 0.18); g.add(flag);
  g.scale.setScalar(s); g.add(contactShadow(W + 0.6, D + 0.6)); return g;
}
// Doctor's bag (consulta): rounded leather bag, handle, clasp and a white plate with a red cross. Origin: floor centre.
function makeDoctorBag(s = 1) {
  const g = new THREE.Group(), leather = mat("#8a4a2a", { roughness: 0.5 });
  const body = new THREE.Mesh(rbox(0.86, 0.5, 0.4, 0.12), leather); body.position.y = 0.25; g.add(body);
  const lid = new THREE.Mesh(rbox(0.9, 0.08, 0.44, 0.04), mat("#6e3a20", { roughness: 0.5 })); lid.position.y = 0.52; g.add(lid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 24, Math.PI), mat("#4a2414")); handle.position.y = 0.56; g.add(handle);
  const clasp = new THREE.Mesh(rbox(0.1, 0.06, 0.03, 0.01), mat(GOLD, { metalness: 0.7 })); clasp.position.set(0, 0.46, 0.225); g.add(clasp);
  const plate = new THREE.Mesh(rbox(0.3, 0.22, 0.02, 0.02), mat("#ffffff")); plate.position.set(0, 0.27, 0.205); g.add(plate);
  const cm = mat(RED, { emissive: RED, emissiveIntensity: 0.25 });
  const cv = new THREE.Mesh(rbox(0.05, 0.16, 0.02, 0.005), cm); cv.position.set(0, 0.27, 0.217); g.add(cv);
  const ch = new THREE.Mesh(rbox(0.16, 0.05, 0.02, 0.005), cm); ch.position.set(0, 0.27, 0.217); g.add(ch);
  g.scale.setScalar(s); g.add(contactShadow(1.0, 0.6)); return g;
}
// T-shirt (extruded outline). Origin: bottom centre of the shirt.
function makeShirt(color = BLUE) {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-0.3, 0); s.lineTo(0.3, 0); s.lineTo(0.3, 0.55); s.lineTo(0.48, 0.45); s.lineTo(0.58, 0.62); s.lineTo(0.3, 0.84); s.lineTo(0.12, 0.84);
  s.quadraticCurveTo(0, 0.74, -0.12, 0.84); s.lineTo(-0.3, 0.84); s.lineTo(-0.58, 0.62); s.lineTo(-0.48, 0.45); s.lineTo(-0.3, 0.55); s.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }).translate(0, 0.015, -0.04), mat(color, { roughness: 0.85 }));
  g.add(m); return g;
}
// T-shirt on a hanger on a small clothes stand (base, post, hanger bar). Origin: floor centre.
function makeShirtStand(color = "#3d8ee0", s = 1) {
  const g = new THREE.Group(), metal = mat("#c9ced3", { metalness: 0.6, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.05, 28), mat("#2b2b2b")); base.position.y = 0.025; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 10), metal); post.position.set(0, 0.65, -0.12); g.add(post);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), metal); arm.rotation.x = Math.PI / 2; arm.position.set(0, 1.28, -0.05); g.add(arm);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 6, 16, Math.PI), metal); hook.position.set(0, 1.28, 0.03); g.add(hook);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.86, 8), mat("#7a4a2e")); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.21, 0.03); g.add(bar);
  const shirt = makeShirt(color); shirt.position.set(0, 1.21 - 0.84 - 0.01, 0.03); g.add(shirt);
  g.scale.setScalar(s); g.add(contactShadow(0.9, 0.7)); return g;
}
// Phone standing on a small dock, with a simple home screen. Origin: floor centre.
function makeDockedPhone(s = 1) {
  const g = new THREE.Group(), ph = makePhone();
  const x = ph.ctx; x.fillStyle = "#1a2a3a"; x.fillRect(0, 0, 720, 1500);
  const cols = [ORANGE, GREEN, BLUE, RED, GOLD, "#8a5ad0"];
  for (let i = 0; i < 12; i++) { x.fillStyle = cols[i % cols.length]; roundRect(x, 90 + (i % 3) * 200, 260 + Math.floor(i / 3) * 220, 140, 140, 32); x.fill(); }
  ph.tex.needsUpdate = true;
  ph.group.scale.setScalar(0.62); ph.group.rotation.x = -0.12; ph.group.position.set(0, 0.12 + 0.82 * 0.62, 0); g.add(ph.group);
  const dock = new THREE.Mesh(rbox(0.6, 0.14, 0.4, 0.04), mat("#2b2b2b")); dock.position.y = 0.07; g.add(dock);
  g.scale.setScalar(s); g.add(contactShadow(0.9, 0.6)); return g;
}
// Fridge: tall white body, freezer and main doors, two handles, feet. Origin: floor centre.
function makeFridge(s = 1) {
  const g = new THREE.Group(), W = 0.78, H = 1.6, D = 0.66, white = mat("#eef0f2", { roughness: 0.35, metalness: 0.1 });
  const body = new THREE.Mesh(rbox(W, H, D, 0.06), white); body.position.y = 0.05 + H / 2; g.add(body);
  const gap = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.02, 0.01), mat("#9aa0a6")); gap.position.set(0, 0.05 + H * 0.68, D / 2 + 0.003); g.add(gap);
  for (const [y, h] of [[0.05 + H * 0.84, 0.26], [0.05 + H * 0.46, 0.5]]) { const hd = new THREE.Mesh(rbox(0.05, h, 0.06, 0.02), mat("#9aa0a6", { metalness: 0.6, roughness: 0.3 })); hd.position.set(W / 2 - 0.1, y, D / 2 + 0.04); g.add(hd); }
  for (const sx of [-1, 1]) { const f = new THREE.Mesh(rbox(0.12, 0.05, 0.12, 0.02), mat("#2b2b2b")); f.position.set(sx * (W / 2 - 0.1), 0.025, 0); g.add(f); }
  g.scale.setScalar(s); g.add(contactShadow(W + 0.6, D + 0.6)); return g;
}
// Banknote standing in a wooden clip stand; the printed face is unlit so it keeps its blue. Origin: floor centre. Front +z.
function makeNoteStand(value = "100", { color1 = "#a6d0f2", color2 = "#4f8fd0", ink = "#0b2440" } = {}) {
  const g = new THREE.Group(), W = 1.5, H = 0.72;
  const ct = canvasTex(640, Math.round(640 * H / W), (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, color1); gr.addColorStop(1, color2); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(10,30,60,0.45)"; x.lineWidth = 8; x.strokeRect(12, 12, w - 24, h - 24);
    centerText(x, "R$ " + value, w * 0.5, h * 0.52, "900 150px Inter", ink);
  });
  const side = mat(color2);
  const note = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.012), [side, side, side, side, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), side]);
  note.userData.plate = { text: "R$ " + value, w: W, h: H, depth: 0.012, frac: 0.3, detail: false };
  note.position.set(0, 0.16 + H / 2, 0); g.add(note);
  const base = new THREE.Mesh(rbox(0.9, 0.16, 0.3, 0.04), mat(WOODC, { roughness: 0.7 })); base.position.y = 0.08; g.add(base);
  g.add(contactShadow(1.6, 0.7));
  return g;
}
// Stack of flat coins; set(n) shows the bottom n (fractional n grows the top coin in). Origin: floor centre.
// API { group, set(n), height(n), top(n) (local V3 of the top coin) }
function makeCoinStack(max = 30, { r = 0.2, h = 0.055 } = {}) {
  const g = new THREE.Group(), coins = [];
  const face = mat(GOLD, { metalness: 0.55, roughness: 0.3, emissive: "#7a4a00", emissiveIntensity: 0.3 });
  for (let i = 0; i < max; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.92, 28), face); c.position.set(Math.sin(i * 2.3) * 0.012, h / 2 + i * h, Math.cos(i * 1.7) * 0.012); g.add(c); coins.push(c); }
  const shadow = contactShadow(r * 4, r * 4); g.add(shadow);
  const set = (n) => { coins.forEach((c, i) => { const k = clamp(n - i); c.visible = k > 0.02; c.scale.setScalar(Math.max(0.0001, k)); }); shadow.visible = n > 0.05; };
  set(0);
  return { group: g, set, height: (n) => n * h };
}
// Coin sack: round burlap body, tied neck, printed "R$". Origin: floor centre.
function makeSack(s = 1) {
  const g = new THREE.Group(), cloth = mat("#c8a46a", { roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), cloth); body.scale.set(1, 0.82, 0.9); body.position.y = 0.41; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.2, 20), cloth); neck.position.y = 0.86; g.add(neck);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 24), mat("#7a4a2e")); tie.rotation.x = Math.PI / 2; tie.position.y = 0.86; g.add(tie);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), cloth); top.position.y = 0.95; g.add(top);
  const p = makePlate("R$", 0.56, 0.38, { bg: "#c8a46a", fg: "#4a2a10" }); p.position.set(0, 0.42, 0.47); g.add(p);
  g.scale.setScalar(s); g.add(contactShadow(1.1, 1.0)); return g;
}
// Shopping cart: wire basket (lines) on a tray, handle, legs and four wheels. Origin: floor centre, handle at -x.
function makeCart() {
  const g = new THREE.Group(), wm = new THREE.LineBasicMaterial({ color: "#d9dde2" });
  const W = 1.2, D = 0.7, y0 = 0.5, H = 0.4;
  const pts = [];
  for (let i = 0; i <= 6; i++) { const x = -W / 2 + (W * i) / 6; pts.push(x, y0, D / 2, x, y0 + H, D / 2, x, y0, -D / 2, x, y0 + H, -D / 2); }
  for (let j = 0; j <= 3; j++) { const y = y0 + (H * j) / 3; pts.push(-W / 2, y, D / 2, W / 2, y, D / 2, -W / 2, y, -D / 2, W / 2, y, -D / 2, -W / 2, y, -D / 2, -W / 2, y, D / 2, W / 2, y, -D / 2, W / 2, y, D / 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(geo, wm));
  const tray = new THREE.Mesh(new THREE.BoxGeometry(W, 0.03, D), mat("#aeb4ba", { metalness: 0.6, roughness: 0.35 })); tray.position.y = y0; g.add(tray);
  const rimM = mat("#c9ced3", { metalness: 0.6, roughness: 0.3 });
  for (const [bw, bd, x, z] of [[W + 0.04, 0.04, 0, D / 2], [W + 0.04, 0.04, 0, -D / 2], [0.04, D + 0.04, W / 2, 0], [0.04, D + 0.04, -W / 2, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.04, bd), rimM); b.position.set(x, y0 + H, z); g.add(b); }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, D + 0.1, 12), mat(RED)); handle.rotation.x = Math.PI / 2; handle.position.set(-W / 2 - 0.2, y0 + H + 0.12, 0); g.add(handle);
  for (const sz of [-1, 1]) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), mat("#c9ced3", { metalness: 0.6 })); a.position.set(-W / 2 - 0.1, y0 + H + 0.06, sz * D / 2); a.rotation.z = -0.5; g.add(a); }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, y0 - 0.1, 8), mat("#c9ced3", { metalness: 0.6 })); leg.position.set(sx * (W / 2 - 0.05), 0.1 + (y0 - 0.1) / 2, sz * (D / 2 - 0.05)); g.add(leg);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), mat("#141414")); wh.rotation.x = Math.PI / 2; wh.position.set(sx * (W / 2 - 0.05), 0.07, sz * (D / 2 - 0.05)); g.add(wh);
  }
  g.add(contactShadow(1.7, 1.1));
  g.userData.floorY = y0 + 0.015; g.userData.handle = new V3(-W / 2 - 0.2, y0 + H + 0.12, 0); return g;
}
// Desk calendar (A-frame) with a page that flips over the top. Origin: floor centre, front +z.
// API { group, setPage(top, big), flip(k, [top, big]) }
function makeDeskCalendar() {
  const g = new THREE.Group(), lean = 0.22, H = 1.5, W = 1.4;
  const back = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); back.position.set(0, H / 2 * Math.cos(lean), -H / 2 * Math.sin(lean) - 0.3); back.rotation.x = lean; g.add(back);
  const front = new THREE.Group(); front.rotation.x = -lean; g.add(front);
  const board = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); board.position.y = H / 2; front.add(board);
  const paintPage = (top, big) => (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = RED; x.fillRect(0, 0, w, h * 0.3);
    centerText(x, top, w / 2, h * 0.15, "900 84px Inter", "#ffffff"); fitText(x, big, w / 2, h * 0.64, 250, 900, "#141414", w * 0.86);
  };
  const page = makeScreenPanel(W * 0.92, H * 0.88, paintPage("DEZ 2026", "31"), { px: 512, frac: 0.22, bg: PAPER, label: "folha do calendário" });
  page.mesh.position.set(0, H / 2 - 0.02, 0.045); front.add(page.mesh);
  const hinge = new THREE.Group(); hinge.position.set(0, H - 0.02 - 0.06, 0.07); front.add(hinge);
  const flipper = makeScreenPanel(W * 0.92, H * 0.88, paintPage("DEZ 2026", "31"), { px: 512, frac: 0.22, bg: PAPER, label: "folha virando" });
  flipper.mesh.position.set(0, -(H * 0.88) / 2 + 0.04, 0); flipper.mesh.userData.plate.detail = true; hinge.add(flipper.mesh);
  for (const sx of [-0.4, 0.4]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 20), mat("#cfcfcf", { metalness: 0.8, roughness: 0.3 })); ring.rotation.y = Math.PI / 2; ring.position.set(sx, H - 0.06, 0.06); front.add(ring); }
  g.add(contactShadow(2, 1.6));
  let curA = "", curB = "";
  const setPage = (top, big) => { const k = top + big; if (k === curA) return; curA = k; page.paint(paintPage(top, big)); };
  const setFlip = (top, big) => { const k = top + big; if (k === curB) return; curB = k; flipper.paint(paintPage(top, big)); };
  const flip = (k, from) => { setFlip(from[0], from[1]); hinge.rotation.x = -Math.PI * 0.95 * k; flipper.mesh.visible = k < 0.98; };
  return { group: g, setPage, flip };
}
// Price board on an easel: header band "PREÇO" and a big value. Origin: floor centre, front +z.
function makePriceBoard(value = "R$ 100") {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), mat("#4a3424")); l.position.set(sx * 0.85, 1.1, -0.12); l.rotation.x = -0.08; g.add(l); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.0, 0.08), mat("#4a3424")); back.position.set(0, 1.0, -0.55); back.rotation.x = 0.28; g.add(back);
  const panel = makeScreenPanel(2.1, 1.4, (x, w, h) => {
    x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, w, h); x.fillStyle = ORANGE; x.fillRect(0, 0, w, h * 0.3);
    centerText(x, "PREÇO", w / 2, h * 0.155, "900 92px Inter", "#ffffff"); fitText(x, value, w / 2, h * 0.64, 190, 900, "#141414", w * 0.86);
  }, { px: 640, frac: 0.3, bg: "#f4f1ea", label: "placa de preço" });
  panel.mesh.position.set(0, 1.55, 0.0); panel.mesh.rotation.x = -0.08; g.add(panel.mesh);
  g.add(contactShadow(2.4, 1.4));
  return g;
}
// Pizza cut in six slices (each a closed wedge: crust, cheese, pepperoni); split(k) pulls the slices
// apart by up to 0.14 (the pizza "rachada"). Origin: centre of its bottom face. API { group, split(k) }
function makePizza(r = 1.0, n = 6) {
  const g = new THREE.Group(), slices = [], rnd = mulberry32(5), da = (Math.PI * 2) / n;
  // closed wedge in the floor plane (shape drawn in xy, laid flat: (x, y) → (x, 0, -y)), from y = 0 to depth
  const wedge = (rad, a0, span, depth) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(rad * Math.cos(a0), rad * Math.sin(a0)); s.absarc(0, 0, rad, a0, a0 + span, false); s.lineTo(0, 0); return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 12 }).rotateX(-Math.PI / 2); };
  const crustM = mat("#d9a05b", { roughness: 0.8 }), cheeseM = mat("#f2c14e", { roughness: 0.6 }), pepM = mat("#a8281e", { roughness: 0.5 });
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group(), a0 = i * da, mid = a0 + da / 2;
    s.add(new THREE.Mesh(wedge(r, a0 + 0.015, da - 0.03, 0.1), crustM));
    const ch = new THREE.Mesh(wedge(r * 0.87, a0 + 0.045, da - 0.09, 0.03), cheeseM); ch.position.y = 0.1; s.add(ch);
    for (let k = 0; k < 3; k++) { const a = a0 + da * (0.25 + 0.25 * k), d = r * (0.3 + 0.45 * rnd()); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 20), pepM); p.position.set(Math.cos(a) * d, 0.14, -Math.sin(a) * d); s.add(p); }
    s.userData.dir = new V3(Math.cos(mid), 0, -Math.sin(mid)); g.add(s); slices.push(s);
  }
  const split = (k) => slices.forEach((s) => s.position.copy(s.userData.dir).multiplyScalar(0.14 * k));
  return { group: g, split };
}
// Round table with a central leg. Origin: floor centre. API { group, top }
function makeRoundTable(r = 1.6) {
  const g = new THREE.Group(), h = 0.8;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 64), mat(WOODC, { roughness: 0.7 })); top.position.y = h - 0.04; g.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h - 0.08, 20), mat("#3a2a20")); leg.position.y = (h - 0.08) / 2; g.add(leg);
  g.add(contactShadow(2 * r + 0.8, 2 * r + 0.8));
  return { group: g, top: h };
}
// Top-pan balance: base, post, beam on a pivot with a pointer; at each beam end a short stem carries a
// pan ON TOP (the pans stay level, nothing hangs over the goods). setTilt(a) > 0 lowers the left pan.
// API { group, pans: [left, right] (put items at y = panTop), setTilt(a), panTop }
function makeBalance() {
  const g = new THREE.Group(), brass = mat("#d8a53a", { metalness: 0.6, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.18, 32), mat("#3a2a20")); base.position.y = 0.09; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.5, 16), brass); post.position.y = 0.18 + 0.75; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 1.74; g.add(beam);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), brass); beam.add(hub);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.8, 12), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.04, 0.7, 8), mat(RED, { emissive: RED, emissiveIntensity: 0.3 })); needle.position.y = 0.42; beam.add(needle);
  const pans = [];
  for (const s of [-1, 1]) {
    const hold = new THREE.Group(); hold.position.x = 1.8 * s; beam.add(hold);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 12), brass); stem.position.y = 0.18; hold.add(stem);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.72, 0.1, 40), brass); pan.position.y = 0.41; hold.add(pan);
    pans.push(hold);
  }
  g.add(contactShadow(1.8, 1.8));
  const setTilt = (a) => { beam.rotation.z = a; for (const p of pans) p.rotation.z = -a; };
  return { group: g, pans, setTilt, panTop: 0.46 };
}
// Electricity / water bill held upright in a small wooden stand (front lip and back block). Origin: floor centre.
function makeBill(word, { head = "#f5c400", headFg = "#141414", icon = "bolt" } = {}) {
  const g = new THREE.Group();
  const ct = canvasTex(360, 480, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = head; x.fillRect(0, 0, w, 180);
    centerText(x, "CONTA DE", w / 2, 26, "800 34px Inter", headFg); fitText(x, word, w / 2, 122, 116, 900, headFg, w * 0.9);
    x.fillStyle = head;
    if (icon === "bolt") { x.beginPath(); x.moveTo(200, 190); x.lineTo(140, 290); x.lineTo(185, 290); x.lineTo(160, 390); x.lineTo(235, 260); x.lineTo(190, 260); x.closePath(); x.fill(); }
    else { x.beginPath(); x.moveTo(180, 195); x.bezierCurveTo(230, 270, 250, 300, 250, 330); x.arc(180, 330, 70, 0, Math.PI); x.bezierCurveTo(110, 300, 130, 270, 180, 195); x.fill(); }
    x.fillStyle = "#c9c1b5"; for (let i = 0; i < 3; i++) x.fillRect(40, 410 + i * 20, 280, 9);
  });
  const side = mat(PAPER);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.012), [side, side, side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 }), side]);
  sheet.userData.plate = { text: "CONTA DE " + word, w: 0.6, h: 0.8, depth: 0.012, frac: 0.23, detail: false };
  sheet.position.set(0, 0.06 + 0.4, 0.0); sheet.rotation.x = -0.1; g.add(sheet);
  const lip = new THREE.Mesh(rbox(0.68, 0.12, 0.08, 0.02), mat(WOODC, { roughness: 0.7 })); lip.position.set(0, 0.06, 0.06); g.add(lip);
  const stand = new THREE.Mesh(rbox(0.6, 0.12, 0.16, 0.03), mat("#3a2a20")); stand.position.set(0, 0.06, -0.1); g.add(stand);
  g.add(contactShadow(0.9, 0.6)); return g;
}
// LPG cylinder (botijão): body, domed top, valve, carrying ring, foot ring, printed label. Origin: floor centre.
function makeGasCylinder(label = "GÁS") {
  const g = new THREE.Group(), m = mat("#7fa3c9", { roughness: 0.4, metalness: 0.15 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.1, 32), mat("#3b3f44")); foot.position.y = 0.05; g.add(foot);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.62, 40), m); body.position.y = 0.1 + 0.31; g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.45; dome.position.y = 0.72; g.add(dome);
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 16), mat("#c9a227", { metalness: 0.7, roughness: 0.3 })); valve.position.y = 0.95; g.add(valve);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 32), mat("#3b3f44")); ring.rotation.x = Math.PI / 2; ring.position.y = 1.02; g.add(ring);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), mat("#3b3f44")); s.position.set(Math.cos(a) * 0.2, 0.92, Math.sin(a) * 0.2); g.add(s); }
  const p = makePlate(label, 0.6, 0.32, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.42, 0.41); g.add(p);
  g.add(contactShadow(1.0, 1.0)); return g;
}
// Receipt printer (point of sale): dark body with a sloped lid, the paper roll on top at the back, a green
// light, and a slot in front of the roll from which the receipt grows up. Origin: floor centre.
// API { group, setLength(L), full, top(L) (world-free local V3 of the receipt top) }
function makeReceiptPrinter(lines, { w = 0.8, gap = 0.06, margin = 0.08 } = {}) {
  const g = new THREE.Group(), dark = mat("#3d4248", { roughness: 0.45 });
  const body = new THREE.Mesh(rbox(w + 0.3, 0.4, 0.8, 0.06), dark); body.position.y = 0.2; g.add(body);
  const lid = new THREE.Mesh(rbox(w + 0.24, 0.12, 0.42, 0.05), mat("#555b62", { roughness: 0.4 })); lid.position.set(0, 0.44, -0.16); g.add(lid);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, w - 0.04, 28), mat(PAPER, { roughness: 0.9 })); roll.rotation.z = Math.PI / 2; roll.position.set(0, 0.56, -0.2); g.add(roll);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, w, 16), mat("#8a7a66")); core.rotation.z = Math.PI / 2; core.position.copy(roll.position); g.add(core);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), mat(GREEN, { emissive: GREEN, emissiveIntensity: 1.2 })); led.position.set(w / 2 + 0.02, 0.3, 0.402); g.add(led);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.02, 0.05), mat("#141414")); slot.position.set(0, 0.405, 0.12); g.add(slot);
  const rc = new THREE.Group(); rc.position.set(0, 0.41, 0.12); g.add(rc);
  const geo = new THREE.BoxGeometry(w, 1, 0.012); geo.translate(0, 0.5, 0);
  const paper = new THREE.Mesh(geo, mat(PAPER, { roughness: 0.9 })); rc.add(paper);
  let y = margin; const items = lines.map((l) => {
    const p = makePlate(l.text, w * 0.9, l.h, { bg: l.bg || PAPER, fg: l.fg || INK, depth: 0.006, detail: !!l.detail });
    const off = y + l.h / 2; y += l.h + gap; rc.add(p); return { p, off, end: y - gap + margin * 0.5 };
  });
  const setLength = (L) => {
    paper.scale.y = Math.max(0.001, L); paper.visible = L > 0.01;
    for (const it of items) { it.p.visible = L >= it.end - 0.02; it.p.position.set(0, L - it.off, 0.01); }
  };
  setLength(0);
  g.add(contactShadow(w + 0.8, 1.1));
  return { group: g, setLength, full: y + margin * 0.5, top: (L) => new V3(0, 0.41 + L, 0.12) };
}
// Glass jar on a wooden base with a printed label on the base front; a gold fill rises inside.
// Two labels back to back on a flipper: flip(k) turns from `label` (k = 0) to `label2` (k = 1).
// Origin: floor, centre. API { group, setLevel(k), mouthY, r, flip(k), levelY(k) }
function makeJar({ r = 0.7, h = 1.6, label = "DE VOLTA", label2 = null, labelBg = "#141414", fillColor = GOLD, bH = 0.34 } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(2 * r + 0.3, bH, 2 * r + 0.3, 0.05), mat("#5a3a26", { roughness: 0.7 })); base.position.y = bH / 2; g.add(base);
  const flipper = new THREE.Group(); flipper.position.set(0, bH / 2, r + 0.15 + 0.03); g.add(flipper);
  const pw = 2 * r + 0.1, ph = bH * 0.8;
  const labelA = makePlate(label, pw, ph, { bg: labelBg, fg: "#ffffff" }); labelA.position.z = 0.016; flipper.add(labelA);
  let labelB = null;
  if (label2) { labelB = makePlate(label2, pw, ph, { bg: RED, fg: "#ffffff" }); labelB.rotation.x = Math.PI; labelB.position.z = -0.016; flipper.add(labelB); }
  const glassM = new THREE.MeshStandardMaterial({ color: GLASS, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), glassM); glass.position.y = bH + h / 2; g.add(glass);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.04, 40), mat("#9fb6c9", { transparent: true, opacity: 0.5 })); bottom.position.y = bH + 0.02; g.add(bottom);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 10, 48), mat("#d8e8f5", { roughness: 0.2 })); rim.rotation.x = Math.PI / 2; rim.position.y = bH + h; g.add(rim);
  const maxH = h - 0.06, cr = 0.13, layerH = 0.045, nL = Math.floor(maxH / layerH), per = Math.max(6, Math.round(1.6 * ((r - 0.06) / cr) ** 2));
  const rnd = mulberry32(17), spots = [];
  for (let l = 0; l < nL; l++) for (let i = 0; i < per; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (r - 0.06 - cr); spots.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, y: bH + 0.06 + l * layerH + rnd() * 0.02, rx: (rnd() - 0.5) * 0.6, rz: (rnd() - 0.5) * 0.6, ry: rnd() * 6 }); }
  const pile = new THREE.InstancedMesh(new THREE.CylinderGeometry(cr, cr, 0.03, 20), mat(fillColor, { metalness: 0.55, roughness: 0.3, emissive: "#7a4a00", emissiveIntensity: 0.3 }), spots.length);
  pile.frustumCulled = false; g.add(pile);
  const dm = new THREE.Object3D(); let shown = -1;
  const setLevel = (k) => {
    const n = Math.round(clamp(k, 0, 1) * nL) * per; if (n === shown) return; shown = n;
    spots.forEach((p, i) => { dm.position.set(p.x, p.y, p.z); dm.rotation.set(p.rx, p.ry, p.rz); dm.scale.setScalar(i < n ? 1 : 0.0001); dm.updateMatrix(); pile.setMatrixAt(i, dm.matrix); });
    pile.instanceMatrix.needsUpdate = true; pile.visible = n > 0; pile.computeBoundingBox();
  };
  setLevel(0);
  g.add(contactShadow(2 * r + 1, 2 * r + 1));
  const flip = (k) => { flipper.rotation.x = Math.PI * clamp(k); labelA.visible = k < 0.5; if (labelB) labelB.visible = k >= 0.5; };
  flip(0);
  return { group: g, setLevel, mouthY: bH + h, r, flip, levelY: (k) => bH + 0.04 + clamp(k, 0, 1) * maxH };
}
// Big rubber stamp with a word printed on the front of its block. Origin: the stamping face (rests on y = 0).
function makeWordStamp(word, { w = 1.9, d = 0.62 } = {}) {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(rbox(w, 0.08, d, 0.02), mat(RED, { roughness: 0.6 })); pad.position.y = 0.04; g.add(pad);
  const block = new THREE.Mesh(rbox(w + 0.1, 0.56, d + 0.08, 0.05), mat("#6a4330", { roughness: 0.7 })); block.position.y = 0.36; g.add(block);
  const p = makePlate(word, w, 0.42, { bg: "#ffffff", fg: RED }); p.position.set(0, 0.36, (d + 0.08) / 2 + 0.016); g.add(p);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.4, 16), mat("#2b2b2b")); neck.position.y = 0.84; g.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), mat("#2b2b2b", { roughness: 0.35 })); knob.scale.y = 0.8; knob.position.y = 1.12; g.add(knob);
  return g;
}
// Direction sign: post with an arrow-shaped board (dir = -1 left / +1 right) and two printed lines.
// Origin: floor at the post; front +z.
function makeArrowSign(l1, l2, dir, color) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.1, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.y = 1.55; g.add(post);
  const W = 2.3, Hh = 1.2, tip = 0.5;
  const s = new THREE.Shape(); s.moveTo(-W / 2, -Hh / 2); s.lineTo(W / 2 - tip, -Hh / 2); s.lineTo(W / 2, 0); s.lineTo(W / 2 - tip, Hh / 2); s.lineTo(-W / 2, Hh / 2); s.closePath();
  const board = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04), mat(color, { roughness: 0.5 }));
  const bg = new THREE.Group(); bg.position.set(dir * 0.6, 2.65, 0.1); bg.add(board); if (dir < 0) board.rotation.y = Math.PI; g.add(bg);
  const p1 = makePlate(l1, 1.6, 0.48, { bg: color, fg: "#ffffff" }); p1.position.set(-dir * 0.22, 0.26, 0.056); bg.add(p1);
  const p2 = makePlate(l2, 1.6, 0.48, { bg: color, fg: "#ffffff" }); p2.position.set(-dir * 0.22, -0.26, 0.056); bg.add(p2);
  g.add(contactShadow(0.8, 0.8));
  return g;
}

// Shelf price strip that flips: a strip held by two small brackets in front of a plinth face, turning
// about a horizontal axis from `a` (k = 0) to `b` (k = 1). Origin: the point on the plinth face it is
// mounted on (the pivot sits `gap` in front of it). API { group, flip(k) }
function makeShelfStrip(a, b, { w = 1.2, h = 0.34, colorA = "#141414", colorB = GREEN, gap = 0.2 } = {}) {
  const g = new THREE.Group(), metal = mat("#c9ced3", { metalness: 0.6, roughness: 0.3 });
  for (const sx of [-1, 1]) { const br = new THREE.Mesh(rbox(0.05, 0.05, gap, 0.01), metal); br.position.set(sx * (w / 2 - 0.12), 0, gap / 2); g.add(br); }
  const pivot = new THREE.Group(); pivot.position.z = gap; g.add(pivot);
  const core = new THREE.Mesh(rbox(w + 0.04, h + 0.04, 0.02, 0.01), mat("#f4f1ea")); pivot.add(core);
  const pa = makePlate(a, w, h, { bg: colorA, fg: "#ffffff", depth: 0.012 }); pa.position.z = 0.016; pivot.add(pa);
  const pb = makePlate(b, w, h, { bg: colorB, fg: "#ffffff", depth: 0.012 }); pb.rotation.x = Math.PI; pb.position.z = -0.016; pivot.add(pb);
  const flip = (k) => { pivot.rotation.x = Math.PI * clamp(k); pa.visible = k < 0.5; pb.visible = k >= 0.5; };
  flip(0);
  return { group: g, flip };
}
// Tent card (A-frame table sign) with a printed front. Origin: floor centre, front +z.
function makeTentCard(text, { w = 0.95, h = 0.44, color = RED, fg = "#ffffff", lean = 0.28 } = {}) {
  const g = new THREE.Group();
  const front = makePlate(text, w, h, { bg: color, fg, depth: 0.02 }); front.rotation.x = -lean; front.position.set(0, h / 2 * Math.cos(lean), h / 2 * Math.sin(lean)); g.add(front);
  const back = new THREE.Mesh(rbox(w, h, 0.02, 0.01), mat(color)); back.rotation.x = lean; back.position.set(0, h / 2 * Math.cos(lean), -h / 2 * Math.sin(lean)); g.add(back);
  g.add(contactShadow(w + 0.3, 0.5));
  return g;
}

// ---------------------------------------------------------------- 1. gancho (0 – 4.80)
// "Em janeiro, o arroz fica com imposto zero... e não fica mais barato."
addScene("gancho", 0, 4.80, (S) => {
  const pl = makePlinth({ w: 1.5, h: 0.5, d: 1.1 }); S.add(pl.group);
  const rice = makeFoodBag("ARROZ", { s: 1.55 }); rice.position.set(-0.05, pl.top, 0); S.add(rice);
  // green seal slapped on the pack at "zero"
  const seal = makePlate("IMPOSTO 0%", 0.58, 0.2, { bg: GREEN, fg: "#ffffff", depth: 0.012 }); seal.position.set(0, 0.31, 0.136); seal.rotation.z = -0.08; rice.add(seal);
  const sign = makePriceSign("PREÇO", "IGUAL", { w: 1.1, h: 0.56, stick: 1.9, colorA: ORANGE, colorB: "#141414" }); sign.group.position.set(1.3, 0, 0.25); S.add(sign.group);
  S.hero(pl.group, "pedestal"); S.hero(rice, "pacote de arroz"); S.hero(sign.group, "placa de preço");
  S.solid(pl.group, "pedestal"); S.solid(rice, "arroz", { restsOn: ["pedestal"] });
  const anim = (t) => {
    seal.visible = t > 2.42; seal.scale.setScalar(1 + 0.9 * (1 - eOut(lin(t, 2.42, 2.62))));
    rice.rotation.y = 0.12 * Math.sin(t * 1.2);
    // the price card slides down the stick ("não fica mais barato") and springs back up
    const down = sm(t, 3.38, 3.85) * (1 - eBack(lin(t, 3.9, 4.35)));
    sign.card.position.y = sign.cardY - 0.75 * down;
    sign.flip(sm(t, 4.25, 4.6));
  };
  const shot = shotOf(anim);
  const A0 = shot([pl.group, rice, sign.group], 0, 4.8, { from: [0.3, 0.36, 1], pull: 1.02 });
  const A1 = shot([pl.group, rice, sign.group], 0, 4.8, { from: [0.05, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 3.3 ? GREEN : RED); fill.position.set(0, 2.4, 1.6); fill.intensity = 1.2 + 2.2 * sm(t, 2.4, 2.9);
    CAM.apply(CAM.shake(CAM.shake(CAM.blend(A0, A1, sm(t, 0, 4.8)), t, 2.42, 0.2, 0.3), t, 3.9, 0.12, 0.3));
  };
});

// ---------------------------------------------------------------- 2. virada (4.80 – 12.58)
// "Imagina: virada do ano, você no mercado. Dois impostos federais, escondidos no preço de quase tudo, somem."
addScene("virada", 4.80, 12.58, (S) => {
  const cart = makeCart(); cart.scale.setScalar(1.45); cart.position.set(-1.25, 0, 0.35); S.add(cart);
  const inCart = [makeFoodBag("ARROZ", { s: 0.5 }), makeShirt(RED), makeFoodBag("FEIJÃO", Object.assign({ s: 0.5 }, BEANS))];
  [[-0.32, 0.0], [0.05, 0.6], [0.36, 0.0]].forEach(([x, s], i) => { const it = inCart[i]; if (s) it.scale.setScalar(s); it.position.set(x, cart.userData.floorY, i === 1 ? -0.05 : 0.06); detailAll(it); cart.add(it); });
  const cal = makeDeskCalendar(); cal.group.position.set(1.1, 0, -0.2); S.add(cal.group);
  const board = makePriceBoard("R$ 100"); board.position.set(5.2, 0, -0.3); S.add(board);
  const pis = makeBlock("PIS", { w: 1.0, h: 0.8, color: GREY }), cof = makeBlock("COFINS", { w: 1.5, h: 0.8, color: GREY });
  S.add(pis); S.add(cof);
  const sparks = [makeSparks(40, 3), makeSparks(40, 9)]; sparks.forEach((s) => S.add(s));
  S.hero(cart, "carrinho de compras", { when: (t) => t < 7.9 }); S.hero(cal.group, "calendário de mesa", { when: (t) => t < 7.9 });
  S.hero(board, "placa de preço R$ 100", { when: (t) => t > 8.4 });
  S.hero(pis, "bloco PIS", { when: (t) => t > 8.9 && t < 12.2 }); S.hero(cof, "bloco COFINS", { when: (t) => t > 9.3 && t < 12.2 });
  S.solid(cart, "carrinho"); S.solid(cal.group, "calendário"); S.solid(pis, "pis"); S.solid(cof, "cofins");
  const anim = (t) => {
    // before the flip the page shows 31 DEZ; while the old page turns over the top, the new one is underneath
    const k = sm(t, 5.84, 6.2);
    if (k <= 0) cal.setPage("DEZ 2026", "31"); else cal.setPage("JAN 2027", "1º");
    cal.flip(k, ["DEZ 2026", "31"]);
    cart.position.x = -1.25 - 0.35 * (1 - eOut(lin(t, 4.8, 6.0)));
    // the two blocks pop up in front of the price board ("escondidos no preço"), then vanish ("somem")
    const gone = sm(t, 12.15, 12.5);
    pis.position.set(4.45, 0.5 * (1 - eOut(lin(t, 8.1, 8.4))), 1.0); cof.position.set(6.05, 0.5 * (1 - eOut(lin(t, 8.5, 8.8))), 1.0);
    pis.scale.setScalar(Math.max(0.0001, pop(t, 8.1, 0.35) * (1 - gone))); cof.scale.setScalar(Math.max(0.0001, pop(t, 8.5, 0.35) * (1 - gone)));
    pis.visible = t > 8.1 && gone < 0.99; cof.visible = t > 8.5 && gone < 0.99;
    pis.rotation.y = 0.15 * Math.sin(t * 2); cof.rotation.y = -0.15 * Math.sin(t * 2 + 1);
    updateSparks(sparks[0], t, 12.2, new V3(4.45, 0.5, 1.0)); updateSparks(sparks[1], t, 12.25, new V3(6.05, 0.5, 1.0));
  };
  const shot = shotOf(anim);
  const A0 = shot([cart, cal.group], 4.8, 7.9, { from: [0.25, 0.35, 1], pull: 1.03 }), A1 = shot([cart, cal.group], 4.8, 7.9, { from: [-0.05, 0.3, 1], pull: 1.0 });
  const B0 = shot([board, pis, cof], 8.6, 12.1, { from: [0.15, 0.3, 1], pull: 1.03 }), B1 = shot([board, pis, cof], 8.6, 12.1, { from: [-0.1, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(t < 7.9 ? 0 : 5.2, 2.4, 1.6); fill.intensity = 2.0;
    CAM.apply(CAM.track(t, [[4.8, A0], [7.7, A1, 2.9], [8.3, B0, 0.6], [12.58, B1, 4.2]]));
  };
});

// ---------------------------------------------------------------- 3. cbs (12.58 – 15.42)
// "No lugar, entra um só: a CBS"
addScene("cbs", 12.58, 15.42, (S) => {
  const board = makePriceBoard("R$ 100"); board.position.set(0, 0, -0.3); S.add(board);
  const cbs = makeBlock("CBS", { w: 1.45, h: 0.72, d: 0.6, color: ORANGE, ph: 0.56 }); S.add(cbs);
  S.hero(board, "placa de preço R$ 100"); S.hero(cbs, "bloco CBS", { when: (t) => t > 14.75 });
  S.solid(cbs, "cbs");
  const anim = (t) => {
    const k = eOut(lin(t, 14.3, 14.62)), b = Math.sin(clamp((t - 14.62) / 0.3) * Math.PI) * 0.12 * (t > 14.62 ? 1 : 0);
    cbs.visible = t > 14.2; cbs.position.set(0, 3.2 * (1 - k) + b, 1.15); cbs.rotation.y = 0.25 * (1 - k) + 0.06 * Math.sin(t * 1.6);
  };
  const shot = shotOf(anim);
  const A0 = shot([board, cbs], 14.62, 15.42, { from: [0.2, 0.3, 1], pull: 1.08 }), A1 = shot([board, cbs], 14.62, 15.42, { from: [-0.05, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.2, 1.8); fill.intensity = 1.5 + 2.5 * sm(t, 14.5, 14.8);
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 12.58, 15.42)), t, 14.62, 0.25, 0.35));
  };
});

// ---------------------------------------------------------------- 4. tcu (15.42 – 17.72)
// "de onze vírgula três por cento" — o TCU fez a conta (foto real no porta-retrato)
addScene("tcu", 15.42, 17.72, (S) => {
  const fr = makePhotoFrame("tcu", { w: 2.8, name: "TCU FEZ A CONTA" }); S.add(fr.group);
  S.hero(fr.group, "porta-retrato TCU");
  const anim = (t) => {
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, 15.42, 15.9))); fr.zoom(1 + 0.14 * lin(t, 15.42, 17.72));
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 15.42, 17.72, { from: [0.18, 0.12, 1], pull: 1.02 }), A1 = shot([fr.group], 15.42, 17.72, { from: [-0.08, 0.1, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.4, 2.0); fill.intensity = 1.2;
    CAM.apply(CAM.blend(A0, A1, sm(t, 15.42, 17.72)));
  };
});

// ---------------------------------------------------------------- 5. cem (17.72 – 20.66)
// "A cada cem reais, mais onze de imposto."
addScene("cem", 17.72, 20.66, (S) => {
  const pl = makePlinth({ w: 3.6, h: 0.45, d: 1.1 }); S.add(pl.group);
  const note = makeNoteStand("100"); note.position.set(-0.95, pl.top, 0); S.add(note);
  const stack = makeCoinStack(30, { r: 0.27, h: 0.05 }); stack.group.position.set(0.55, pl.top, -0.05); S.add(stack.group);
  const card = makeTentCard("+R$ 11", { w: 0.9, h: 0.42, color: RED }); card.position.set(1.22, pl.top, 0.28); S.add(card);
  S.hero(pl.group, "pedestal"); S.hero(note, "nota de 100 reais"); S.hero(stack.group, "pilha de moedas", { when: (t) => t > 19.6 }); S.hero(card, "plaquinha +R$ 11", { when: (t) => t > 20.1 });
  S.solid(pl.group, "pedestal"); S.solid(note, "nota", { restsOn: ["pedestal"] }); S.solid(stack.group, "moedas", { restsOn: ["pedestal"] });
  const anim = (t) => {
    popIn(note, t, 17.75, 0.4);
    stack.set(11 * lin(t, 19.28, 19.9));
    popIn(card, t, 19.92, 0.35); card.rotation.y = -0.15;
  };
  const shot = shotOf(anim);
  const A0 = shot([pl.group, note, stack.group], 17.72, 20.66, { from: [0.25, 0.35, 1], pull: 1.04 }), A1 = shot([pl.group, note, stack.group], 17.72, 20.66, { from: [0.0, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(GOLD); fill.position.set(0.6, 2.2, 1.6); fill.intensity = 1.2 + 2 * sm(t, 19.3, 19.9);
    CAM.apply(CAM.blend(A0, A1, sm(t, 17.72, 20.66)));
  };
});

// ---------------------------------------------------------------- 6. senado (20.66 – 22.30)
// "Falta o Senado confirmar." (foto real no porta-retrato)
addScene("senado", 20.66, 22.30, (S) => {
  const fr = makePhotoFrame("senado", { w: 2.8, name: "SENADO DECIDE" }); S.add(fr.group);
  S.hero(fr.group, "porta-retrato Senado");
  const anim = (t) => {
    fr.frame.rotation.y = -1.2 * (1 - eOut(lin(t, 20.66, 21.1))); fr.zoom(1 + 0.12 * lin(t, 20.66, 22.3));
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 20.66, 22.3, { from: [-0.15, 0.12, 1], pull: 1.03 }), A1 = shot([fr.group], 20.66, 22.3, { from: [0.08, 0.1, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(BLUE); fill.position.set(0, 2.4, 2.0); fill.intensity = 1.0;
    CAM.apply(CAM.blend(A0, A1, sm(t, 20.66, 22.3)));
  };
});

// ---------------------------------------------------------------- 7. arroz (22.30 – 31.95)
// "E o arroz? Fica no zero, como feijão e carne. Mas eles já não pagavam os impostos antigos.
//  Trocou zero por zero... e o preço, por isso, não muda."
addScene("arroz", 22.30, 31.95, (S) => {
  const xs = [-1.95, 0, 1.95];
  const pls = xs.map((x) => { const p = makePlinth({ w: 1.45, h: 0.8, d: 1.1 }); p.group.position.set(x, 0, 0); S.add(p.group); return p; });
  const items = [makeFoodBag("ARROZ", { s: 1.55 }), makeFoodBag("FEIJÃO", Object.assign({ s: 1.55 }, BEANS)), makeMeatPack(1.28)];
  items.forEach((it, i) => { it.position.set(xs[i], pls[i].top, i === 2 ? 0.08 : 0.0); S.add(it); });
  // shelf price strips on the plinth fronts: "HOJE 0%" turns over into "2027 0%"
  const strips = xs.map((x) => { const st = makeShelfStrip("HOJE 0%", "2027 0%", { w: 1.25, h: 0.36 }); st.group.position.set(x, 0.4, 0.55); S.add(st.group); return st; });
  const pop0 = [22.3, 24.4, 24.75], sAt = [25.6, 25.8, 26.0], fAt = [28.6, 28.95, 29.3];
  pls.forEach((p, i) => S.solid(p.group, "pedestal " + (i + 1)));
  items.forEach((it, i) => { S.hero(it, ["pacote de arroz", "pacote de feijão", "bandeja de carne"][i], { when: (t) => t > pop0[i] + 0.4 }); S.solid(it, "item " + (i + 1), { restsOn: ["pedestal " + (i + 1)] }); });
  pls.forEach((p, i) => S.hero(p.group, "pedestal " + (i + 1)));
  strips.forEach((st, i) => S.hero(st.group, "etiqueta de preço " + (i + 1), { when: (t) => t > sAt[i] + 0.4 }));
  const anim = (t) => {
    items.forEach((it, i) => { popIn(it, t, pop0[i], 0.4, i === 2 ? 1.28 : 1.55); it.rotation.y = 0.1 * Math.sin(t * 1.2 + i); });
    strips.forEach((st, i) => { popIn(st.group, t, sAt[i], 0.35); st.flip(sm(t, fAt[i], fAt[i] + 0.45)); });
  };
  const all = [...pls.map((p) => p.group), ...items, ...strips.map((st) => st.group)];
  const shot = shotOf(anim);
  const B0 = shot(all, 22.3, 31.95, { from: [0.2, 0.3, 1], pull: 1.02 }), B1 = shot(all, 22.3, 31.95, { from: [-0.1, 0.26, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 28.5 ? ORANGE : GREEN); fill.position.set(0, 2.6, 1.8); fill.intensity = 2.0;
    CAM.apply(CAM.blend(B0, B1, sm(t, 22.3, 31.95)));
  };
});

// ---------------------------------------------------------------- 8. peso (31.95 – 37.62)
// "E o resto do carrinho? A conta foi feita pra arrecadar o mesmo, mas o peso muda de lugar."
addScene("peso", 31.95, 37.62, (S) => {
  const bal = makeBalance(); S.add(bal.group);
  const [L, R] = bal.pans;
  const rice = makeFoodBag("ARROZ", { s: 0.7 }); rice.position.set(-0.42, bal.panTop, 0); detailAll(rice); L.add(rice);
  const cart = makeCart(); cart.scale.setScalar(0.8); cart.position.set(-0.4, bal.panTop, 0); R.add(cart);
  const sack = makeSack(0.95); S.add(sack);
  const bl = makeBlock("CESTA BÁSICA", { w: 2.1, h: 0.56, d: 0.3, color: "#3a2a20", ph: 0.72 }); bl.position.set(-1.95, 0, 1.35); S.add(bl);
  const br = makeBlock("RESTO", { w: 2.1, h: 0.56, d: 0.3, color: "#3a2a20", ph: 0.72 }); br.position.set(1.95, 0, 1.35); S.add(br);
  S.hero(bal.group, "balança de dois pratos"); S.hero(sack, "saco de dinheiro"); S.hero(bl, "placa CESTA BÁSICA"); S.hero(br, "placa RESTO");
  S.solid(bl, "placa cesta"); S.solid(br, "placa resto");
  const panPoint = (hold, x) => { hold.updateWorldMatrix(true, false); return hold.localToWorld(new V3(x, bal.panTop, 0)); };
  const anim = (t) => {
    // level while "arrecada o mesmo"; the sack hops to the other pan and the beam tips ("o peso muda de lugar")
    const k = sm(t, 35.6, 36.2), tilt = -0.17 * eOut(lin(t, 36.1, 36.6));
    bal.setTilt(tilt + 0.012 * Math.sin(t * 1.8) * (1 - sm(t, 35.6, 36.1)));
    sack.position.copy(hop(panPoint(L, 0.3), panPoint(R, 0.5), k, 1.0)); sack.rotation.z = -0.6 * Math.sin(Math.PI * k);
  };
  const shot = shotOf(anim);
  const A0 = shot([bal.group, sack, bl, br], 31.95, 37.62, { from: [0.18, 0.3, 1], pull: 1.03 }), A1 = shot([bal.group, sack, bl, br], 31.95, 37.62, { from: [-0.08, 0.26, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(GOLD); fill.position.set(0, 3.0, 1.8); fill.intensity = 1.6;
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 31.95, 37.62)), t, 36.4, 0.15, 0.4));
  };
});

// ---------------------------------------------------------------- 9. pizza (37.62 – 47.30) — a analogia
// "Pensa numa pizza rachada entre amigos. Se três não pagam, a fatia dos outros cresce.
//  Aqui é igual: cada desconto engorda a conta de quem paga cheio."
addScene("pizza", 37.62, 47.30, (S) => {
  const table = makeRoundTable(1.6); S.add(table.group);
  const pizza = makePizza(0.95); pizza.group.position.y = table.top; S.add(pizza.group);
  const cols = [ORANGE, BLUE, GREEN, "#c9b8a6", RED, "#8a5ad0"], n = 6;
  const people = [], stacks = [], ang = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * (Math.PI * 2 / n); ang.push(a);
    const p = makePerson(cols[i]); p.scale.setScalar(1.7); S.add(p); people.push(p);
    const st = makeCoinStack(9, { r: 0.2, h: 0.08 }); S.add(st.group); stacks.push(st);
  }
  const leave = [1, 3, 4]; // right, front-left, left: the three who don't pay
  S.hero(table.group, "mesa redonda"); S.hero(pizza.group, "pizza");
  people.forEach((p, i) => S.hero(p, "pessoa " + (i + 1), leave.includes(i) ? { when: (t) => t < 40.35 } : {}));
  stacks.forEach((st, i) => { if (!leave.includes(i)) S.hero(st.group, "pilha de moedas " + (i + 1), { when: (t) => t > 42.6 }); });
  S.solid(table.group, "mesa");
  const anim = (t) => {
    pizza.group.rotation.y = 0.08 * t; pizza.split(sm(t, 38.3, 38.9));
    people.forEach((p, i) => {
      const away = leave.includes(i) ? eOut(lin(t, 40.3, 40.9)) : 0, gone = leave.includes(i) ? sm(t, 40.95, 41.3) : 0;
      const rr = 2.05 + 0.7 * away, a = ang[i];
      p.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); p.rotation.y = -a + Math.PI / 2;
      p.scale.setScalar(Math.max(0.0001, 1.7 * (1 - gone))); p.visible = gone < 0.99;
      const st = stacks[i]; st.group.position.set(Math.cos(a) * 1.37, table.top, Math.sin(a) * 1.37);
      if (leave.includes(i)) st.set(3 * (1 - sm(t, 40.35, 40.9)));
      else st.set(3 + 2 * sm(t, 41.6, 42.5) + 3 * sm(t, 45.06, 45.8));
    });
  };
  const shot = shotOf(anim);
  const stay = people.filter((p, i) => !leave.includes(i)), stayStacks = stacks.filter((st, i) => !leave.includes(i)).map((st) => st.group);
  const A0 = shot([table.group, pizza.group, ...people], 37.62, 40.3, { from: [0.15, 0.72, 1], pull: 1.03 }), A1 = shot([table.group, pizza.group, ...people], 37.62, 40.3, { from: [0.0, 0.68, 1], pull: 1.0 });
  const B0 = shot([table.group, pizza.group, ...stay, ...stayStacks], 41.2, 47.3, { from: [-0.02, 0.66, 1], pull: 1.02 }), B1 = shot([table.group, pizza.group, ...stay, ...stayStacks], 41.2, 47.3, { from: [-0.14, 0.58, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 40.3 ? ORANGE : RED); fill.position.set(0, 2.6, 1.0); fill.intensity = 2.0 + 1.5 * (sm(t, 41.6, 42.0) * (1 - sm(t, 42.6, 43.2)) + sm(t, 45.06, 45.4) * (1 - sm(t, 46.0, 46.6)));
    CAM.apply(CAM.shake(CAM.shake(CAM.track(t, [[37.62, A0], [40.3, A1, 2.68], [41.4, B0, 1.0], [47.3, B1, 5.9]]), t, 42.0, 0.1, 0.3), t, 45.4, 0.12, 0.35));
  };
});

// ---------------------------------------------------------------- 10. prateleira (47.30 – 55.80)
// "Remédio, escola e consulta pagam menos de cinco reais a cada cem.
//  Já roupa, celular e geladeira pagam os onze cheios."
addScene("prateleira", 47.30, 55.80, (S) => {
  const xs = [-4.9, -3.5, -2.1, 2.1, 3.5, 4.9], names = ["REMÉDIO", "ESCOLA", "CONSULTA", "ROUPA", "CELULAR", "GELADEIRA"];
  const pls = xs.map((x, i) => { const p = makePlinth({ w: 1.3, h: 0.8, d: 1.0, label: names[i], plateH: 0.32, labelY: 0.6 }); p.group.position.set(x, 0, 0); S.add(p.group); return p; });
  const base = [1.25, 0.85, 1.2, 1.0, 0.8, 1.02];
  const items = [makeMedBox(), makeSchool(), makeDoctorBag(), makeShirtStand(), makeDockedPhone(), makeFridge()];
  items.forEach((it, i) => { it.position.set(xs[i], pls[i].top, 0.0); S.add(it); });
  // shelf price labels printed on the lower half of each plinth front
  const tags = xs.map((x, i) => { const g = i < 3; const p = makePlate(g ? "+R$ 4,50" : "+R$ 11", 1.17, 0.28, { bg: g ? GREEN : RED, fg: "#ffffff", depth: 0.014 }); p.position.set(x, 0.24, 0.5 + 0.018); S.add(p); return p; });
  const pAt = [47.3, 48.22, 48.8, 52.26, 52.9, 53.46], tAt = [50.48, 50.62, 50.76, 54.72, 54.86, 55.0];
  pls.forEach((p, i) => { S.solid(p.group, "pedestal " + (i + 1)); });
  items.forEach((it, i) => { S.solid(it, "item " + (i + 1), { restsOn: ["pedestal " + (i + 1)] }); });
  const left = (t) => t < 51.35, right = (t) => t > 52.3;
  [0, 1, 2].forEach((i) => { S.hero(pls[i].group, "pedestal " + names[i], { when: left }); S.hero(items[i], ["caixa de remédio", "escola", "maleta de médico"][i], { when: (t) => left(t) && t > pAt[i] + 0.4 }); S.hero(tags[i], "preço verde " + (i + 1), { when: (t) => left(t) && t > tAt[i] + 0.4 }); });
  [3, 4, 5].forEach((i) => { S.hero(pls[i].group, "pedestal " + names[i], { when: right }); S.hero(items[i], ["camiseta no cabide", "celular", "geladeira"][i - 3], { when: (t) => right(t) && t > pAt[i] + 0.4 }); S.hero(tags[i], "preço vermelho " + (i - 2), { when: (t) => right(t) && t > tAt[i] + 0.4 }); });
  const anim = (t) => {
    items.forEach((it, i) => { popIn(it, t, pAt[i], 0.4, base[i]); it.rotation.y = 0.12 * Math.sin(t * 1.1 + i); });
    tags.forEach((p, i) => popIn(p, t, tAt[i], 0.35));
  };
  const L = [0, 1, 2].flatMap((i) => [pls[i].group, items[i], tags[i]]), R = [3, 4, 5].flatMap((i) => [pls[i].group, items[i], tags[i]]);
  const shot = shotOf(anim);
  const A0 = shot(L, 47.3, 51.6, { from: [0.2, 0.28, 1], pull: 1.02 }), A1 = shot(L, 47.3, 51.6, { from: [0.0, 0.26, 1], pull: 1.0 });
  const B0 = shot(R, 52.0, 55.8, { from: [0.05, 0.26, 1], pull: 1.02 }), B1 = shot(R, 52.0, 55.8, { from: [-0.2, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 51.8 ? GREEN : "#ff7a4a"); fill.position.set(t < 51.8 ? -3.5 : 3.5, 2.8, 1.8); fill.intensity = t < 51.8 ? 2.0 : 1.4;
    CAM.apply(CAM.track(t, [[47.3, A0], [51.4, A1, 4.1], [52.2, B0, 0.8], [55.8, B1, 3.6]]));
  };
});

// ---------------------------------------------------------------- 11. familia (55.80 – 64.20)
// "Agora imagina uma família de baixa renda, no Cadastro Único. O imposto da luz, da água,
//  do telefone e do botijão volta inteiro."
addScene("familia", 55.80, 64.20, (S) => {
  const house = makeHouse(); house.scale.setScalar(2.0); house.position.set(0, 0, -1.3); S.add(house);
  const fam = [makePerson(ORANGE), makePerson(BLUE), makePerson(GREEN)];
  [[-1.0, 0.3, 1.3], [1.0, 0.3, 1.3], [-0.5, 0.6, 0.9]].forEach(([x, z, s], i) => { fam[i].scale.setScalar(s); fam[i].position.set(x, 0, z); S.add(fam[i]); });
  const items = [makeBill("LUZ"), makeBill("ÁGUA", { head: "#4f9bd9", headFg: "#ffffff", icon: "drop" }), makeDockedPhone(1.0), makeGasCylinder("GÁS")];
  const pos = [[-2.45, 0.95], [-1.4, 1.75], [1.4, 1.75], [2.45, 0.95]], base = [1.55, 1.55, 1.15, 1.4];
  items.forEach((it, i) => { it.position.set(pos[i][0], 0, pos[i][1]); it.rotation.y = -0.25 * Math.sign(pos[i][0]); S.add(it); });
  const coins = items.map(() => { const c = makeCoin(0.28); S.add(c.group); return c; });
  const sparks = makeSparks(50, 21); S.add(sparks);
  const at = [60.12, 60.92, 61.46, 62.3];
  S.hero(house, "casa"); fam.forEach((p, i) => S.hero(p, ["adulto 1", "adulto 2", "criança"][i]));
  items.forEach((it, i) => { S.hero(it, ["conta de luz", "conta de água", "celular", "botijão de gás"][i], { when: (t) => t > at[i] + 0.4 }); S.solid(it, "item " + (i + 1)); });
  S.solid(house, "casa");
  const home = new V3(0, 1.0, 0.75); // between the two adults: the money goes back to the family
  const anim = (t) => {
    items.forEach((it, i) => popIn(it, t, at[i], 0.4, base[i]));
    fam.forEach((p, i) => { p.position.y = 0.05 * Math.max(0, Math.sin(t * 6 + i)) * sm(t, 62.9, 63.3) * (1 - sm(t, 63.9, 64.2)); });
    coins.forEach((c, i) => {
      const k = lin(t, 62.92 + i * 0.1, 63.45 + i * 0.1), a = new V3(pos[i][0], 1.2, pos[i][1] + 0.2);
      c.group.position.copy(hop(a, home, eOut(k), 0.35)); c.spin(t * 8);
      c.group.scale.setScalar(Math.max(0.0001, 1 - sm(k, 0.8, 1.0))); c.group.visible = k > 0 && k < 1;
    });
    updateSparks(sparks, t, 63.7, home);
  };
  const shot = shotOf(anim);
  const A0 = shot([house, ...fam], 55.8, 59.9, { from: [0.35, 0.42, 1], pull: 1.03 }), A1 = shot([house, ...fam], 55.8, 59.9, { from: [-0.05, 0.36, 1], pull: 1.0 });
  const B0 = shot([house, ...fam, ...items], 60.1, 64.2, { from: [0.12, 0.45, 1], pull: 1.0 }), B1 = shot([house, ...fam, ...items], 60.1, 64.2, { from: [-0.1, 0.4, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(GOLD); fill.position.set(0, 2.2, 1.8); fill.intensity = 1.2 + 2 * sm(t, 62.9, 63.4);
    CAM.apply(CAM.track(t, [[55.8, A0], [59.6, A1, 3.8], [60.3, B0, 0.7], [64.2, B1, 3.9]]));
  };
});

// ---------------------------------------------------------------- 12. cofrinho (64.20 – 71.90)
// "Nas outras compras, com CPF na nota, volta vinte por cento. O governo estima uns trezentos e cinquenta reais por ano."
addScene("cofrinho", 64.20, 71.90, (S) => {
  const pr = makeReceiptPrinter([{ text: "NOTA FISCAL", h: 0.3 }, { text: "CPF NA NOTA", h: 0.36, bg: ORANGE, fg: "#ffffff" }, { text: "COMPRAS", h: 0.3 }], { w: 1.3 });
  pr.group.position.set(-1.35, 0, 0); S.add(pr.group);
  const jar = makeJar({ r: 0.62, h: 1.5, label: "DE VOLTA", label2: "≈ R$ 350/ANO" }); jar.group.position.set(1.2, 0, 0); S.add(jar.group);
  const coin = makeCoin(0.17); S.add(coin.group);
  const rain = [0, 1, 2, 3, 4].map(() => { const c = makeCoin(0.15); S.add(c.group); return c; });
  S.hero(pr.group, "impressora de nota fiscal"); S.hero(jar.group, "pote de moedas");
  S.solid(pr.group, "impressora"); S.solid(jar.group, "pote");
  const L = pr.full, L0 = 0.45;
  const anim = (t) => {
    const len = L0 + (L - L0) * sm(t, 64.35, 66.6); pr.setLength(len);
    const k = lin(t, 67.28, 68.0), a = pr.top(len).add(pr.group.position).add(new V3(0, 0.15, 0)), b = new V3(1.2, jar.mouthY + 0.1, 0);
    coin.group.position.copy(hop(a, b, eOut(k), 0.8)); coin.spin(t * 9); coin.group.visible = k > 0 && k < 1;
    rain.forEach((c, i) => { const q = lin(t, 68.6 + i * 0.45, 69.2 + i * 0.45); c.group.position.set(1.2 + 0.2 * Math.sin(i * 2.1), jar.mouthY + 1.2 - 1.3 * q * q, 0.1 * Math.cos(i)); c.spin(t * 7 + i); c.group.visible = q > 0 && q < 1; });
    jar.setLevel(0.06 * sm(t, 67.9, 68.1) + 0.74 * sm(t, 68.7, 71.3));
    jar.flip(sm(t, 70.3, 70.7));
  };
  const shot = shotOf(anim);
  const A0 = shot([pr.group, jar.group, coin.group], 64.2, 71.9, { from: [0.2, 0.32, 1], pull: 1.03 }), A1 = shot([pr.group, jar.group, coin.group], 64.2, 71.9, { from: [-0.08, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(GOLD); fill.position.set(1.2, 2.6, 1.6); fill.intensity = 1.4 + 1.6 * sm(t, 68.6, 69.2);
    CAM.apply(CAM.blend(A0, A1, sm(t, 64.2, 71.9)));
  };
});

// ---------------------------------------------------------------- 13. federal (71.90 – 77.20)
// "E isso é só a parte federal. Com estados e cidades, em 2033,"
addScene("federal", 71.90, 77.20, (S) => {
  const fed = makeBlock("FEDERAL", { w: 1.9, h: 0.85, d: 0.9, color: ORANGE, ph: 0.4 }); S.add(fed);
  const est = makeBlock("ESTADOS", { w: 1.9, h: 1.15, d: 0.9, color: BLUE, ph: 0.32 }); S.add(est);
  const cid = makeBlock("CIDADES", { w: 1.9, h: 0.7, d: 0.9, color: GREEN, ph: 0.48 }); S.add(cid);
  const year = makePriceSign("2033", null, { w: 1.1, h: 0.56, stick: 2.1, colorA: "#141414" }); year.group.position.set(1.95, 0, 0.3); S.add(year.group);
  S.hero(fed, "bloco FEDERAL"); S.hero(est, "bloco ESTADOS", { when: (t) => t > 75.0 }); S.hero(cid, "bloco CIDADES", { when: (t) => t > 75.6 }); S.hero(year.group, "placa 2033", { when: (t) => t > 76.5 });
  S.solid(fed, "federal"); S.solid(est, "estados", { restsOn: ["federal"] }); S.solid(cid, "cidades", { restsOn: ["estados"] });
  const land = (t, at, y0) => { const k = eOut(lin(t, at, at + 0.3)), b = Math.sin(clamp((t - at - 0.3) / 0.25) * Math.PI) * 0.08 * (t > at + 0.3 ? 1 : 0); return y0 + 2.6 * (1 - k) + b; };
  const anim = (t) => {
    fed.rotation.y = 0.08 * Math.sin(t * 1.3);
    est.visible = t > 74.6; est.position.set(0, land(t, 74.72, 0.85), 0); est.rotation.y = fed.rotation.y;
    cid.visible = t > 75.15; cid.position.set(0, land(t, 75.28, 2.0), 0); cid.rotation.y = fed.rotation.y;
    popIn(year.group, t, 76.08, 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([fed], 71.9, 74.4, { from: [0.2, 0.3, 1], pull: 1.25 }), A1 = shot([fed], 71.9, 74.4, { from: [0.0, 0.28, 1], pull: 1.18 });
  const B0 = shot([fed, est, cid, year.group], 75.6, 77.2, { from: [0.15, 0.3, 1], pull: 1.03 }), B1 = shot([fed, est, cid, year.group], 75.6, 77.2, { from: [-0.05, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 3.2, 1.8); fill.intensity = 1.8;
    let p = CAM.track(t, [[71.9, A0], [74.3, A1, 2.4], [75.3, B0, 0.9], [77.2, B1, 1.9]]);
    p = CAM.shake(CAM.shake(p, t, 75.02, 0.15, 0.3), t, 75.58, 0.15, 0.3);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 14. estimativa (77.20 – 85.10)
// "a estimativa é de uns vinte e oito reais a cada cem, no lugar dos impostos escondidos de hoje.
//  Atenção: é só uma estimativa."
addScene("estimativa", 77.20, 85.10, (S) => {
  const pl = makePlinth({ w: 3.9, h: 0.45, d: 1.2 }); S.add(pl.group);
  const note = makeNoteStand("100"); note.position.set(-1.2, pl.top, -0.1); S.add(note);
  const stack = makeCoinStack(30, { r: 0.27, h: 0.05 }); stack.group.position.set(0.2, pl.top, -0.12); S.add(stack.group);
  const stamp = makeWordStamp("ESTIMATIVA", { w: 1.2, d: 0.45 }); S.add(stamp);
  S.hero(pl.group, "pedestal"); S.hero(note, "nota de 100 reais"); S.hero(stack.group, "pilha de moedas alta");
  S.hero(stamp, "carimbo ESTIMATIVA", { when: (t) => t > 83.3 });
  S.solid(pl.group, "pedestal"); S.solid(note, "nota", { restsOn: ["pedestal"] }); S.solid(stack.group, "moedas", { restsOn: ["pedestal"] }); S.solid(stamp, "carimbo", { restsOn: ["pedestal"] });
  const anim = (t) => {
    stack.set(11 + 17 * sm(t, 78.5, 79.25));
    // the stamp comes down next to the coins ("Atenção: é só uma estimativa")
    const k = eOut(lin(t, 82.92, 83.18)), b = Math.sin(clamp((t - 83.18) / 0.22) * Math.PI) * 0.06 * (t > 83.18 ? 1 : 0);
    stamp.visible = t > 82.85; stamp.position.set(1.22, pl.top + 2.8 * (1 - k) + b, -0.05); stamp.rotation.y = -0.12;
  };
  const shot = shotOf(anim);
  const A0 = shot([pl.group, note, stack.group], 77.2, 82.8, { from: [0.22, 0.35, 1], pull: 1.03 }), A1 = shot([pl.group, note, stack.group], 77.2, 82.8, { from: [-0.02, 0.32, 1], pull: 1.0 });
  const B0 = shot([pl.group, note, stack.group, stamp], 83.2, 85.1, { from: [0.05, 0.3, 1], pull: 1.02 }), B1 = shot([pl.group, note, stack.group, stamp], 83.2, 85.1, { from: [-0.08, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 82.9 ? GOLD : RED); fill.position.set(0.5, 2.6, 1.8); fill.intensity = t < 82.9 ? 1.4 + 1.5 * sm(t, 78.5, 79.2) : 3.2;
    CAM.apply(CAM.shake(CAM.track(t, [[77.2, A0], [82.6, A1, 5.4], [83.1, B0, 0.5], [85.1, B1, 1.9]]), t, 83.18, 0.3, 0.4));
  };
});

// ---------------------------------------------------------------- 15. escolha (85.10 – 93.45)
// "Então me diz: em 2027, você acha que suas compras ficam mais caras... ou mais baratas?"
addScene("escolha", 85.10, 93.45, (S) => {
  const cart = makeCart(); cart.scale.setScalar(1.9); S.add(cart);
  const inside = [makeFoodBag("ARROZ", { s: 0.42 }), makeShirt(RED), makeFoodBag("FEIJÃO", Object.assign({ s: 0.42 }, BEANS))];
  [[-0.3, 0], [0.05, 0.5], [0.33, 0]].forEach(([x, s], i) => { const it = inside[i]; if (s) it.scale.setScalar(s); it.position.set(x, cart.userData.floorY, i === 1 ? -0.05 : 0.05); detailAll(it); cart.add(it); });
  const left = makeArrowSign("MAIS", "CARAS", -1, RED); left.position.set(-2.05, 0, -1.3); S.add(left);
  const right = makeArrowSign("MAIS", "BARATAS", 1, GREEN); right.position.set(2.05, 0, -1.3); S.add(right);
  S.hero(cart, "carrinho de compras"); S.hero(left, "placa MAIS CARAS"); S.hero(right, "placa MAIS BARATAS");
  S.solid(cart, "carrinho"); S.solid(left, "placa esquerda"); S.solid(right, "placa direita");
  const anim = (t) => {
    const sway = -0.28 * sm(t, 89.5, 90.0) * (1 - sm(t, 90.5, 91.0)) + 0.28 * sm(t, 90.5, 91.0) * (1 - sm(t, 91.8, 92.6)) + 0.14 * Math.sin((t - 91.8) * 2.4) * sm(t, 91.8, 92.6);
    cart.position.set(sway, 0, 0.55); cart.rotation.y = -0.2 * sway;
    left.rotation.y = 0.2; right.rotation.y = -0.2;
    popIn(left, t, 85.15, 0.4); popIn(right, t, 85.4, 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([cart, left, right], 85.1, 93.45, { from: [0.2, 0.35, 1], pull: 1.03 });
  const A1 = shot([cart, left, right], 85.1, 93.45, { from: [-0.05, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 90.4 ? RED : GREEN); fill.position.set(t < 90.4 ? -2 : 2, 2.6, 1.6); fill.intensity = t < 89.4 ? 1.5 : 2.5;
    CAM.apply(CAM.blend(A0, A1, sm(t, 85.1, 93.45)));
  };
});

