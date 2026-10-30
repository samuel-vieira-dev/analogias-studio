// ============================================================================
// videos/2026-10-30-imposto-seletivo/scenes.js
// 3D scenes synced to audio/words.json (narration 0–87.8 s, video 89.8 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Generic imagery only: no drink, tobacco, car or bank brands. The photo card (Durigan, 46.96–51.04)
// covers the stage: no hero is registered behind it.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const PAPER = "#fbf7ef", INK = "#1c1410", GOLD = "#e0a83a", GLASS = "#cfe6ff", BLUE = "#2f6fb0", STEEL = "#8b9196", WOODC = "#6a4a30";

const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.06 }, o));
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));
// Marks every printed plate under obj as texture (not read as text by the QA): small labels on props in the back.
// makeCoin prints "R$" a quarter turn off: spin(COIN_UP) shows it upright.
const COIN_UP = Math.PI / 2;
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
// Label wrapped around a cylinder (bottle, can): an open cylinder segment centred on +z with the text.
// Registered as a plate (its front point is at z = r) so the QA measures the letters.
function makeWrapLabel(text, r, h, arc, { bg = "#141414", fg = "#ffffff" } = {}) {
  const w = r * arc, ph = 256, pw = Math.max(64, Math.round(ph * w / h));
  const tex = plateTex(text, { bg, fg, w: pw, h: ph, font: "900 " + Math.round(ph * 0.62) + "px Inter", radius: 1 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true, -arc / 2, arc), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  m.userData.plate = { text, w, h, depth: 2 * r, frac: tex.userData.textFrac, detail: false };
  return m;
}

// Beer bottle (brown glass, wrapped label, gold cap). Origin: floor centre. Height 1.37.
function makeBeerBottle() {
  const g = new THREE.Group(), glass = mat("#7a4316", { roughness: 0.18, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.78, 32), glass); body.position.y = 0.39; g.add(body);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.22, 0.24, 32), glass); shoulder.position.y = 0.9; g.add(shoulder);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.3, 24), glass); neck.position.y = 1.17; g.add(neck);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 20), mat("#d8b04a", { metalness: 0.7, roughness: 0.3 })); cap.position.y = 1.345; g.add(cap);
  const lbl = makeWrapLabel("CERVEJA", 0.226, 0.34, 2.8, { bg: "#f2e3b8", fg: "#5a2d0c" }); lbl.position.y = 0.42; g.add(lbl);
  g.add(contactShadow(0.7, 0.7)); return g;
}
// Soda can: coloured body, aluminium top and bottom, rim, tab, wrapped label. Origin: floor centre. Height 0.72.
function makeSodaCan({ color = RED, label = "REFRI" } = {}) {
  const g = new THREE.Group(), alu = mat("#c9ced3", { metalness: 0.8, roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.62, 32), mat(color, { roughness: 0.35, metalness: 0.3 })); body.position.y = 0.35; g.add(body);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.04, 32), alu); bot.position.y = 0.02; g.add(bot);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.05, 32), alu); top.position.y = 0.685; g.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.012, 8, 32), alu); rim.rotation.x = Math.PI / 2; rim.position.y = 0.71; g.add(rim);
  const tab = new THREE.Mesh(rbox(0.08, 0.012, 0.12, 0.004), alu); tab.position.set(0, 0.716, 0.05); g.add(tab);
  const lbl = makeWrapLabel(label, 0.215, 0.28, 2.1, { bg: color, fg: "#ffffff" }); lbl.position.y = 0.36; g.add(lbl);
  g.add(contactShadow(0.7, 0.7)); return g;
}
// Cigarette pack with the flip-top lid open (hinged at the back) and three cigarettes showing. Origin: floor centre.
function makeCigPack() {
  const g = new THREE.Group(), W = 0.58, Hb = 0.6, D = 0.24;
  const body = new THREE.Mesh(rbox(W, Hb, D, 0.02), mat("#f4f1ea", { roughness: 0.6 })); body.position.y = Hb / 2; g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.004, 0.08, D + 0.004), mat(RED, { roughness: 0.5 })); band.position.y = Hb - 0.06; g.add(band);
  const hinge = new THREE.Group(); hinge.position.set(0, Hb, -D / 2); hinge.rotation.x = -1.75; g.add(hinge);
  const lid = new THREE.Mesh(rbox(W, 0.18, D, 0.02), mat(RED, { roughness: 0.5 })); lid.position.set(0, 0.09, D / 2); hinge.add(lid);
  for (const x of [-0.15, 0, 0.15]) {
    const cig = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.2, 12), mat("#f7f3ea")); cig.position.set(x, Hb - 0.04, 0.02); g.add(cig);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.07, 12), mat("#d8893a")); tip.position.set(x, Hb + 0.095, 0.02); g.add(tip);
  }
  const p = makePlate("CIGARRO", 0.54, 0.23, { bg: "#f4f1ea", fg: RED }); p.position.set(0, 0.27, D / 2 + 0.016); g.add(p);
  g.add(contactShadow(0.8, 0.6)); return g;
}
// Juice carton with a straw and a printed "COM AÇÚCAR" label. Origin: floor centre.
function makeJuiceBox() {
  const g = new THREE.Group(), W = 0.58, H = 0.8, D = 0.34;
  const body = new THREE.Mesh(rbox(W, H, D, 0.03), mat("#f5b22a", { roughness: 0.6 })); body.position.y = H / 2; g.add(body);
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.34, 8), mat("#ffffff")); straw.position.set(0.12, H + 0.13, 0.04); straw.rotation.z = -0.25; g.add(straw);
  const p = makePlate("AÇÚCAR", 0.54, 0.27, { bg: "#ffffff", fg: "#a3530a" }); p.position.set(0, H * 0.58, D / 2 + 0.016); g.add(p);
  const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), mat("#ff8a1f", { roughness: 0.5 })); fruit.scale.z = 0.4; fruit.position.set(0, H * 0.22, D / 2 + 0.02); g.add(fruit);
  g.add(contactShadow(0.8, 0.6)); return g;
}
// Price tag: body with a pointed left end and a hole, printed text. Origin: centre, front +z.
function makeTag(text, w = 1.2, h = 0.55, color = ORANGE, fg = "#ffffff") {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-w / 2 + h * 0.4, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2 + h * 0.4, h / 2); s.lineTo(-w / 2, 0); s.closePath();
  const hole = new THREE.Path(); hole.absarc(-w / 2 + h * 0.3, 0, h * 0.09, 0, Math.PI * 2, true); s.holes.push(hole);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }).translate(0, 0, -0.025), mat(color, { roughness: 0.5 })); g.add(body);
  const p = makePlate(text, w * 0.66, h * 0.66, { bg: color, fg }); p.position.set(h * 0.2, 0, 0.026); g.add(p);
  return g;
}
// Plinth (display block). Origin: floor centre. API { group, top }
function makePlinth({ w = 0.95, h = 0.4, d = 0.95, color = "#3a2a20", label = null } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.04), mat(color, { roughness: 0.7 })); b.position.y = h / 2; g.add(b);
  if (label) { const p = makePlate(label, w * 0.9, h * 0.5, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h / 2, d / 2 + 0.016); g.add(p); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}

// Checkout counter: cabinet, moving belt (left), scanner glass, receipt printer (right end).
// Origin: floor centre, customer side +z. API { group, top, beltX0, beltX1, scanX, slot (V3), setBelt(t), scanGlow(k) }
function makeCheckout() {
  const g = new THREE.Group(), L = 3.6, Dp = 1.0, Ht = 0.9;
  const cab = new THREE.Mesh(rbox(L, Ht, Dp, 0.05), mat("#3a2a20", { roughness: 0.7 })); cab.position.y = Ht / 2; g.add(cab);
  const kick = new THREE.Mesh(new THREE.BoxGeometry(L - 0.3, 0.12, 0.02), mat("#1c1410")); kick.position.set(0, 0.08, Dp / 2 + 0.005); g.add(kick);
  const c = makeCanvas(512, 64), x = c.getContext("2d"); x.fillStyle = "#1b1b1b"; x.fillRect(0, 0, 512, 64); x.fillStyle = "#353535"; for (let i = 0; i < 16; i++) x.fillRect(i * 32, 0, 8, 64);
  const btex = texFrom(c); btex.wrapS = THREE.RepeatWrapping; btex.repeat.set(6, 1);
  const beltL = 2.2, beltX = -L / 2 + 0.2 + beltL / 2, dark = mat("#1b1b1b");
  const belt = new THREE.Mesh(new THREE.BoxGeometry(beltL, 0.04, Dp - 0.2), [dark, dark, new THREE.MeshStandardMaterial({ map: btex, roughness: 0.8 }), dark, dark, dark]);
  belt.position.set(beltX, Ht + 0.02, 0); g.add(belt);
  const scanX = beltX + beltL / 2 + 0.45;
  const glassM = mat("#2b3a44", { roughness: 0.1, metalness: 0.5, emissive: "#ff2a1a", emissiveIntensity: 0 });
  const scan = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.6), glassM); scan.position.set(scanX, Ht + 0.01, 0); g.add(scan);
  const prX = L / 2 - 0.35;
  const pr = new THREE.Mesh(rbox(0.5, 0.3, 0.5, 0.05), mat("#6d7378", { roughness: 0.5 })); pr.position.set(prX, Ht + 0.15, -0.15); g.add(pr);
  const slotM = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.05), mat("#141414")); slotM.position.set(prX, Ht + 0.305, -0.1); g.add(slotM);
  g.add(contactShadow(L + 1, Dp + 1));
  return { group: g, top: Ht + 0.04, beltX0: beltX - beltL / 2, beltX1: beltX + beltL / 2, scanX, slot: new V3(prX, Ht + 0.31, -0.1),
    setBelt: (t) => { btex.offset.x = -t * 0.6; }, scanGlow: (k) => { glassM.emissiveIntensity = k; } };
}
// Receipt coming out of a printer slot: the paper grows upwards and the printed lines ride with its top.
// lines: [{ text, h, bg, fg, detail }]. Origin: bottom centre (at the slot). API { group, setLength(L), lines, need }
function makeReceipt(lines, { w = 0.8, gap = 0.06, margin = 0.08 } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, 1, 0.012); geo.translate(0, 0.5, 0);
  const paper = new THREE.Mesh(geo, mat(PAPER, { roughness: 0.9 })); g.add(paper);
  let y = margin; const items = lines.map((l) => {
    const p = makePlate(l.text, w * 0.9, l.h, { bg: l.bg || PAPER, fg: l.fg || INK, depth: 0.006, detail: !!l.detail });
    const off = y + l.h / 2; y += l.h + gap; g.add(p); return { p, off, end: y - gap + margin * 0.5 };
  });
  const setLength = (L) => {
    paper.scale.y = Math.max(0.001, L); paper.visible = L > 0.01;
    for (const it of items) { it.p.visible = L >= it.end - 0.02; it.p.position.set(0, L - it.off, 0.01); }
  };
  setLength(0);
  return { group: g, setLength, need: items.map((it) => it.end) };
}

// Law book with "IMPOSTO SELETIVO" printed big on the cover (civic.js makeLawBook).
// Heart (extruded, bevelled). Origin: centre; spans about y -0.55..0.5 at s = 1.
function makeHeart(s = 1) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.5); sh.bezierCurveTo(-0.15, -0.35, -0.55, -0.1, -0.55, 0.15); sh.bezierCurveTo(-0.55, 0.42, -0.2, 0.55, 0, 0.32);
  sh.bezierCurveTo(0.2, 0.55, 0.55, 0.42, 0.55, 0.15); sh.bezierCurveTo(0.55, -0.1, 0.15, -0.35, 0, -0.5);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 24 }); geo.translate(0, 0, -0.11);
  const m = new THREE.Mesh(geo, mat(RED, { roughness: 0.35, emissive: "#7a0d06", emissiveIntensity: 0.3 })); m.scale.setScalar(s);
  const g = new THREE.Group(); g.add(m); return g;
}
// Tree: trunk and four foliage balls. Origin: floor (trunk base).
function makeTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 14), mat("#6a4330", { roughness: 0.8 })); trunk.position.y = 0.35; g.add(trunk);
  for (const [x, y, z, r, c] of [[0, 0.85, 0, 0.36, "#2fae66"], [-0.28, 0.72, 0.06, 0.28, "#279255"], [0.27, 0.74, -0.04, 0.29, "#36c070"], [0.02, 1.12, 0.02, 0.27, "#3cc777"]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat(c, { roughness: 0.7 })); b.position.set(x, y, z); g.add(b);
  }
  return g;
}
// Red aiming reticle (ring + four ticks), facing +z; decoration (not measured). Origin: centre.
function makeReticle(r = 0.55) {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: "#ff3b1f", toneMapped: false, transparent: true });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 48), m); g.add(ring);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.02), m); t.position.set(Math.cos(a) * (r + 0.05), Math.sin(a) * (r + 0.05), 0); t.rotation.z = a; g.add(t); }
  g.traverse((n) => { n.userData.decor = true; });
  return { group: g, mat: m };
}

// Glass jar on a wooden base with a printed label on the base front; a gold fill rises inside.
// Two labels back to back on a flipper: flip(k) turns from `label` (k = 0) to `label2` (k = 1).
// Origin: floor, centre. API { group, setLevel(k), mouthY, r, flip(k), labelA, labelB }
function makeJar({ r = 0.7, h = 1.6, label = "PALAVRÃO", label2 = null, labelBg = "#141414", fillColor = GOLD, bH = 0.34 } = {}) {
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
  // coin pile: flat coins in layers (instanced, seeded); setLevel shows the layers up to the level
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
  // flip about the x axis: the back label comes to the front upright
  const flip = (k) => { flipper.rotation.x = Math.PI * clamp(k); labelA.visible = k < 0.5; if (labelB) labelB.visible = k >= 0.5; };
  flip(0);
  return { group: g, setLevel, mouthY: bH + h, r, flip, labelA, labelB, levelY: (k) => bH + 0.04 + clamp(k, 0, 1) * maxH };
}
// Speech balloon (plate + tail) facing +z. Origin: centre.
function makeBalloon(text, { w = 1.4, h = 0.6, bg = CREAM, fg = INK } = {}) {
  const g = new THREE.Group();
  const p = makePlate(text, w, h, { bg, fg }); g.add(p);
  const sh = new THREE.Shape(); sh.moveTo(-0.12, 0); sh.lineTo(0.12, 0); sh.lineTo(-0.2, -0.3); sh.lineTo(-0.12, 0);
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), mat(bg)); tail.position.set(-w * 0.22, -h / 2 + 0.01, -0.015); g.add(tail);
  return g;
}

// Car along +x: body, cabin with dark glass, four wheels, lights (copy of the ICMS video's car). Origin: floor centre.
function makeCar({ color = BLUE } = {}) {
  const g = new THREE.Group(), L = 2.1;
  const paint = mat(color, { roughness: 0.35, metalness: 0.25 });
  const body = new THREE.Mesh(rbox(L, 0.46, 1.0, 0.12), paint); body.position.y = 0.43; g.add(body);
  const cabin = new THREE.Mesh(rbox(L * 0.48, 0.4, 0.9, 0.1), paint); cabin.position.set(-0.08 * L, 0.86, 0); g.add(cabin);
  const gm = mat("#1b2733", { roughness: 0.15, metalness: 0.4 }), cx = -0.08 * L;
  for (const sz of [-1, 1]) for (const dx of [-0.24, 0.24]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.24, 0.02), gm); w.position.set(cx + dx * L / 2.1, 0.9, sz * 0.456); g.add(w); }
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.74), gm); w.position.set(cx + sx * (L * 0.24 + 0.005), 0.9, 0); g.add(w); }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(sx * L * 0.32, 0.22, sz * 0.45); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.17, 16), mat("#cfcfcf", { metalness: 0.6 })); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub);
  }
  for (const sz of [-0.32, 0.32]) {
    const hl = new THREE.Mesh(rbox(0.04, 0.1, 0.2, 0.02), mat("#fff4c8", { emissive: "#ffe9a0", emissiveIntensity: 0.8 })); hl.position.set(L / 2 + 0.005, 0.5, sz); g.add(hl);
    const tl = new THREE.Mesh(rbox(0.04, 0.1, 0.2, 0.02), mat("#c0261b", { emissive: "#c0261b", emissiveIntensity: 0.5 })); tl.position.set(-L / 2 - 0.005, 0.5, sz); g.add(tl);
  }
  g.add(contactShadow(L + 0.6, 1.5));
  g.userData.L = L; return g;
}
// EV charging post with a cable, "ELÉTRICO" printed on its front. Origin: floor centre; front +z.
// API { group, cable } — the cable runs from the post to `plug` (local V3) and can be revealed with setDrawRange.
function makeCharger(plug) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(rbox(0.5, 1.5, 0.36, 0.06), mat("#e9e4dc", { roughness: 0.5 })); post.position.y = 0.75; g.add(post);
  const head = new THREE.Mesh(rbox(0.56, 0.16, 0.42, 0.04), mat(GREEN, { roughness: 0.5 })); head.position.y = 1.55; g.add(head);
  const p = makePlate("ELÉTRICO", 0.9, 0.3, { bg: GREEN, fg: "#ffffff" }); p.position.set(0, 1.12, 0.196); g.add(p);
  const bolt = new THREE.Shape(); bolt.moveTo(0.04, 0.2); bolt.lineTo(-0.1, -0.02); bolt.lineTo(0.0, -0.02); bolt.lineTo(-0.05, -0.2); bolt.lineTo(0.1, 0.03); bolt.lineTo(0.0, 0.03); bolt.closePath();
  const b = new THREE.Mesh(new THREE.ExtrudeGeometry(bolt, { depth: 0.03, bevelEnabled: false }), mat("#f5c400", { emissive: "#f5c400", emissiveIntensity: 0.5 })); b.position.set(0, 0.62, 0.18); g.add(b);
  const curve = new THREE.CatmullRomCurve3([new V3(-0.1, 0.95, 0.19), new V3(-0.2, 0.5, 0.3), plug.clone().add(new V3(0.15, -0.08, 0.1)), plug.clone()]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.035, 8, false), mat("#141414", { roughness: 0.6 })); g.add(cable);
  g.add(contactShadow(0.9, 0.8));
  return { group: g, cable, plate: p };
}
// Box truck along +x: cab, cargo box, six wheels. Origin: floor centre.
function makeBoxTruck() {
  const g = new THREE.Group();
  const cab = new THREE.Mesh(rbox(0.95, 1.1, 1.1, 0.08), mat("#5a6670", { roughness: 0.5 })); cab.position.set(1.35, 0.3 + 0.55, 0); g.add(cab);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.86), mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 })); win.position.set(1.83, 1.12, 0); g.add(win);
  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.02), mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 })); sideWin.position.set(1.4, 1.12, 0.556); g.add(sideWin);
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.9), mat("#2b2b2b")); chassis.position.set(0.1, 0.36, 0); g.add(chassis);
  const box = new THREE.Mesh(rbox(2.4, 1.45, 1.2, 0.05), mat("#e9e4dc", { roughness: 0.6 })); box.position.set(-0.45, 0.43 + 0.725, 0); g.add(box);
  for (const x of [1.35, -0.2, -1.2]) for (const z of [0.5, -0.5]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w); }
  const p = makePlate("CAMINHÃO", 2.2, 0.44, { bg: "#141414", fg: "#ffffff" }); p.position.set(-0.45, 1.6, 0.616); g.add(p);
  g.add(contactShadow(4.0, 2.0)); return g;
}
// Big red X (two crossed bars) facing +z. Origin: centre.
function makeCross(s = 1.6) {
  const g = new THREE.Group(), m = mat(RED, { emissive: RED, emissiveIntensity: 0.45, roughness: 0.4 });
  for (const a of [Math.PI / 4, -Math.PI / 4]) { const b = new THREE.Mesh(rbox(s, s * 0.17, 0.12, 0.04), m); b.rotation.z = a; g.add(b); }
  return g;
}

// Business jet (copy of the Flávio video's jet): fuselage along +x, swept wings, T-tail, rear engines. Origin: centre.
function makeJet({ color = "#eef0f2", stripe = ORANGE } = {}) {
  const g = new THREE.Group(), body = mat(color, { roughness: 0.35, metalness: 0.2 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 2.2, 8, 24), body); fus.rotation.z = Math.PI / 2; g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), body); nose.scale.set(1.9, 1, 1); nose.position.x = 1.15; g.add(nose);
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 24), body); tailCone.rotation.z = Math.PI / 2; tailCone.position.x = -1.55; g.add(tailCone);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); cockpit.scale.set(1.5, 0.7, 1.2); cockpit.position.set(1.32, 0.1, 0); g.add(cockpit);
  const ln = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.452), mat(stripe, { roughness: 0.5 })); ln.position.set(-0.05, -0.04, 0); g.add(ln);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), mat("#1d2a36", { roughness: 0.2 })); w.position.set(0.7 - i * 0.26, 0.07, s * 0.222); w.rotation.y = s > 0 ? 0 : Math.PI; g.add(w); }
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(0.35, 0); sh.lineTo(-0.35, 0); sh.lineTo(-0.75, 1.55); sh.lineTo(-0.45, 1.55); sh.lineTo(0.35, 0);
    const wing = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), body);
    wing.rotation.x = s * Math.PI / 2; wing.position.set(0, -0.12, s * 0.15); if (s < 0) wing.position.y += 0.05; g.add(wing);
    const eng = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.38, 6, 16), mat("#c9ccd0", { roughness: 0.4, metalness: 0.4 })); eng.rotation.z = Math.PI / 2; eng.position.set(-1.05, 0.15, s * 0.36); g.add(eng);
    const pyl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.16), body); pyl.position.set(-1.05, 0.12, s * 0.24); g.add(pyl);
  }
  const fs = new THREE.Shape(); fs.moveTo(-1.25, 0.15); fs.lineTo(-1.85, 0.15); fs.lineTo(-2.05, 0.95); fs.lineTo(-1.8, 0.95); fs.lineTo(-1.25, 0.15);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.05, bevelEnabled: false }), body); fin.position.z = -0.025; g.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 1.1), body); stab.position.set(-1.95, 0.95, 0); g.add(stab);
  return g;
}
// Motor yacht along +x: white hull with a raised bow and a blue stripe, two-deck cabin, dark windows,
// mast. Origin: waterline centre.
function makeYacht() {
  const g = new THREE.Group(), white = mat("#f2f0eb", { roughness: 0.4 });
  const prof = new THREE.Shape(); prof.moveTo(-1.15, -0.12); prof.lineTo(0.55, -0.12); prof.quadraticCurveTo(1.15, -0.05, 1.4, 0.42); prof.lineTo(-1.15, 0.42); prof.closePath();
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 0.84, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }).translate(0, 0, -0.42), white); g.add(hull);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.02), mat("#1f4f8a")); st.position.set(-0.05, 0.12, s * 0.455); g.add(st); }
  const c1 = new THREE.Mesh(rbox(1.3, 0.32, 0.66, 0.06), white); c1.position.set(-0.3, 0.42 + 0.16, 0); g.add(c1);
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.68), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); w1.position.set(-0.3, 0.6, 0); g.add(w1);
  const c2 = new THREE.Mesh(rbox(0.7, 0.24, 0.52, 0.05), white); c2.position.set(-0.4, 0.74 + 0.12, 0); g.add(c2);
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.44), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); w2.position.set(-0.06, 0.88, 0); g.add(w2);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), mat("#d9d9d9", { metalness: 0.6 })); mast.position.set(-0.55, 1.23, 0); g.add(mast);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 24, Math.PI), mat("#d9d9d9", { metalness: 0.6 })); rail.rotation.set(Math.PI / 2, 0, -Math.PI / 2); rail.position.set(0.95, 0.5, 0); g.add(rail);
  return g;
}
// Small water patch (decoration) for the yacht and the rig.
function makeWater(w, d) {
  const m = new THREE.Mesh(rbox(w, 0.04, d, 0.02), mat("#1f5468", { roughness: 0.25, metalness: 0.2 })); m.position.y = 0.02; m.userData.decor = true; return m;
}
// Pile of ore rocks (reddish-brown dodecahedrons). Origin: floor centre.
function makeOrePile() {
  const g = new THREE.Group(), rnd = mulberry32(5), cols = ["#8a4a2e", "#6e3b26", "#9c5a36", "#5a3222"];
  const spots = [[-0.45, 0.2, 0.15, 0.24], [0.0, 0.22, 0.25, 0.26], [0.45, 0.2, 0.1, 0.24], [-0.22, 0.2, -0.3, 0.25], [0.25, 0.2, -0.28, 0.24], [-0.2, 0.5, 0.0, 0.24], [0.2, 0.52, 0.02, 0.24], [0.0, 0.78, -0.08, 0.22], [-0.6, 0.15, -0.2, 0.18], [0.62, 0.14, -0.12, 0.17]];
  for (const [x, y, z, r] of spots) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), mat(cols[Math.floor(rnd() * 4)], { roughness: 0.9, flatShading: true })); m.position.set(x, y, z); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); g.add(m); }
  g.add(contactShadow(2.0, 1.6)); return g;
}
// Lottery ticket standing on a small foot, slightly leaning back: "LOTERIA" band and a number grid with marks.
// Origin: floor centre.
function makeTicket() {
  const g = new THREE.Group(), W = 1.0, H = 1.3;
  const card = new THREE.Group(); card.rotation.x = -0.12; g.add(card);
  const ct = canvasTex(400, 520, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = GREEN; x.fillRect(0, 0, w, 120);
    for (let i = 0; i < 30; i++) {
      const cx = 52 + (i % 6) * 59, cy = 170 + Math.floor(i / 6) * 70, mark = [3, 8, 14, 19, 22, 27].includes(i);
      x.strokeStyle = "#9a8f84"; x.lineWidth = 3; x.strokeRect(cx - 22, cy - 22, 44, 44);
      centerText(x, String(i + 1).padStart(2, "0"), cx, cy + 2, "700 24px Inter", "#3a3330");
      if (mark) { x.strokeStyle = RED; x.lineWidth = 6; x.beginPath(); x.moveTo(cx - 18, cy - 18); x.lineTo(cx + 18, cy + 18); x.moveTo(cx + 18, cy - 18); x.lineTo(cx - 18, cy + 18); x.stroke(); }
    }
  });
  const side = mat(PAPER);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.02), [side, side, side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.85 }), side]);
  sheet.position.y = H / 2 + 0.12; card.add(sheet);
  const p = makePlate("LOTERIA", W * 0.86, 0.22, { bg: GREEN, fg: "#ffffff" }); p.position.set(0, 0.12 + H - 0.115, 0.016); card.add(p);
  const foot = new THREE.Mesh(rbox(0.7, 0.12, 0.4, 0.03), mat("#3a2a20")); foot.position.set(0, 0.06, 0); g.add(foot);
  g.add(contactShadow(1.3, 0.8)); return g;
}

// Desk calendar (A-frame) whose page flips over the top; pages show a month name and a year.
// Origin: floor centre, front +z. API { group, front, H, setPage(year, month), flip(k, [year, month]) }
function makeDeskCalendar() {
  const g = new THREE.Group(), lean = 0.22, H = 1.5, W = 1.4;
  const back = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); back.position.set(0, H / 2 * Math.cos(lean), -H / 2 * Math.sin(lean) - 0.3); back.rotation.x = lean; g.add(back);
  const front = new THREE.Group(); front.rotation.x = -lean; g.add(front);
  const board = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); board.position.y = H / 2; front.add(board);
  const paintPage = (year, month) => (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = RED; x.fillRect(0, 0, w, h * 0.3);
    centerText(x, year, w / 2, h * 0.15, "900 84px Inter", "#ffffff"); fitText(x, month, w / 2, h * 0.64, 210, 900, "#141414", w * 0.86);
  };
  const page = makeScreenPanel(W * 0.92, H * 0.88, paintPage("2026", "NOV"), { px: 512, frac: 0.22, bg: PAPER, label: "folha do calendário" });
  page.mesh.position.set(0, H / 2 - 0.02, 0.045); front.add(page.mesh);
  const hinge = new THREE.Group(); hinge.position.set(0, H - 0.02 - 0.06, 0.07); front.add(hinge);
  const flipper = makeScreenPanel(W * 0.92, H * 0.88, paintPage("2026", "OUT"), { px: 512, frac: 0.22, bg: PAPER, label: "folha virando" });
  flipper.mesh.position.set(0, -(H * 0.88) / 2 + 0.04, 0); flipper.mesh.userData.plate.detail = true; hinge.add(flipper.mesh);
  for (const sx of [-0.4, 0.4]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 20), mat("#cfcfcf", { metalness: 0.8, roughness: 0.3 })); ring.rotation.y = Math.PI / 2; ring.position.set(sx, H - 0.06, 0.06); front.add(ring); }
  g.add(contactShadow(2, 1.6));
  let curA = "", curB = "";
  const setPage = (y, m) => { const k = y + m; if (k === curA) return; curA = k; page.paint(paintPage(y, m)); };
  const setFlip = (y, m) => { const k = y + m; if (k === curB) return; curB = k; flipper.paint(paintPage(y, m)); };
  const flip = (k, from) => { setFlip(from[0], from[1]); hinge.rotation.x = -Math.PI * 0.95 * k; flipper.mesh.visible = k < 0.98; };
  return { group: g, setPage, flip, front, H };
}
// Day counter on a small stand: a dark screen that shows "DIA n". Origin: floor centre. API { group, set(n) }
function makeDayCounter() {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(1.35, 0.8, 0.5, 0.06), mat("#d9d2c6", { roughness: 0.5 })); stand.position.y = 0.4; g.add(stand);
  const scr = makeScreenPanel(1.15, 0.52, null, { frac: 0.42, bg: "#141414", label: "contador de dias" });
  scr.mesh.position.set(0, 0.42, 0.266); g.add(scr.mesh);
  let cur = -1;
  const set = (n) => { if (n === cur) return; cur = n; scr.paint((x, w, h) => { x.fillStyle = "#141414"; x.fillRect(0, 0, w, h); centerText(x, "DIA " + n, w / 2, h / 2 + 4, "900 150px Inter", n >= 90 ? ORANGE : "#ffffff"); }); };
  set(0); g.add(contactShadow(1.6, 0.9));
  return { group: g, set };
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
// Public building: steps, columns, architrave with a big printed name, pediment. Origin: floor centre, front +z.
function makeBuilding(label, { w = 2.4, color = "#e8dfd2", plateBg = "#141414" } = {}) {
  const g = new THREE.Group(), stone = mat(color, { roughness: 0.8 }), k = w / 2.4;
  const s1 = new THREE.Mesh(rbox(2.6 * k, 0.14, 1.5, 0.03), stone); s1.position.y = 0.07; g.add(s1);
  const s2 = new THREE.Mesh(rbox(2.3 * k, 0.14, 1.3, 0.03), stone); s2.position.y = 0.21; g.add(s2);
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.2, 16), stone); c.position.set((-0.95 + i * 0.38) * k, 0.88, 0.45); g.add(c); }
  const wall = new THREE.Mesh(rbox(2.0 * k, 1.2, 0.7, 0.03), mat("#cfc4b4")); wall.position.set(0, 0.88, -0.1); g.add(wall);
  const arch = new THREE.Mesh(rbox(2.4 * k, 0.5, 1.25, 0.03), stone); arch.position.y = 1.48 + 0.25; g.add(arch);
  const tri = new THREE.Shape(); tri.moveTo(-1.2 * k, 0); tri.lineTo(1.2 * k, 0); tri.lineTo(0, 0.5); tri.closePath();
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 1.2, bevelEnabled: false }).translate(0, 0, -0.6), stone); ped.position.y = 1.98; g.add(ped);
  const p = makePlate(label, 2.1 * k, 0.42, { bg: plateBg, fg: "#ffffff" }); p.position.set(0, 1.73, 0.641); g.add(p);
  g.add(contactShadow(3.4 * k, 2.2));
  return g;
}
// Hospital: white block with windows, a red cross, a glass door and a "HOSPITAL" sign. Origin: floor centre, front +z.
function makeHospital() {
  const g = new THREE.Group(), W = 2.4, H = 1.9, D = 1.3;
  const body = new THREE.Mesh(rbox(W, H, D, 0.05), mat("#f1ede6", { roughness: 0.6 })); body.position.y = H / 2; g.add(body);
  const roof = new THREE.Mesh(rbox(W + 0.1, 0.1, D + 0.1, 0.03), mat("#c9c1b5")); roof.position.y = H + 0.05; g.add(roof);
  const glassM = mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 });
  for (const x of [-0.85, -0.45, 0.45, 0.85]) for (const y of [0.75, 1.15]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.02), glassM); w.position.set(x, y, D / 2 + 0.01); g.add(w); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.7, 0.02), mat("#6fa3bf", { roughness: 0.15, metalness: 0.4 })); door.position.set(0, 0.35, D / 2 + 0.012); g.add(door);
  const crossM = mat(RED, { emissive: RED, emissiveIntensity: 0.4 });
  const cv = new THREE.Mesh(rbox(0.16, 0.5, 0.06, 0.02), crossM); cv.position.set(0, 1.0, D / 2 + 0.04); g.add(cv);
  const ch = new THREE.Mesh(rbox(0.5, 0.16, 0.06, 0.02), crossM); ch.position.set(0, 1.0, D / 2 + 0.04); g.add(ch);
  const p = makePlate("HOSPITAL", 1.8, 0.4, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, H - 0.3, D / 2 + 0.016); g.add(p);
  g.add(contactShadow(W + 0.8, D + 0.8));
  return { group: g, doorFront: new V3(0, 0, D / 2) };
}
// Safe: steel box, door with a dial and a three-spoke handle, a coin slot on top, "CAIXA GERAL" sign.
// Origin: floor centre, front +z. API { group, slotTop (local V3), handle }
function makeSafe() {
  const g = new THREE.Group(), W = 1.6, H = 2.1, D = 1.2, steel = mat("#5b6168", { metalness: 0.6, roughness: 0.35 });
  const body = new THREE.Mesh(rbox(W, H, D, 0.08), steel); body.position.y = H / 2; g.add(body);
  const door = new THREE.Mesh(rbox(W - 0.24, 1.1, 0.06, 0.04), mat("#6f767e", { metalness: 0.6, roughness: 0.3 })); door.position.set(0, 0.55 + 0.12, D / 2 + 0.03); g.add(door);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 32), mat("#c9ced3", { metalness: 0.8, roughness: 0.25 })); dial.rotation.x = Math.PI / 2; dial.position.set(-0.3, 0.68, D / 2 + 0.1); g.add(dial);
  const handle = new THREE.Group(); handle.position.set(0.35, 0.68, D / 2 + 0.1); g.add(handle);
  for (const a of [0, 2.09, 4.19]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 8), mat("#d9d9d9", { metalness: 0.8 })); s.rotation.z = a; handle.add(s); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), mat("#d9d9d9", { metalness: 0.8 })); hub.rotation.x = Math.PI / 2; handle.add(hub);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.1), mat("#141414")); slot.position.set(0, H + 0.002, 0.1); g.add(slot);
  const p = makePlate("CAIXA", 1.36, 0.38, { bg: GOLD, fg: "#1c1410" }); p.position.set(0, H - 0.26, D / 2 + 0.016); g.add(p);
  const p2 = makePlate("GERAL", 1.36, 0.38, { bg: GOLD, fg: "#1c1410" }); p2.position.set(0, H - 0.68, D / 2 + 0.016); g.add(p2);
  for (const sx of [-1, 1]) { const f = new THREE.Mesh(rbox(0.2, 0.08, 0.2, 0.02), mat("#2b2b2b")); f.position.set(sx * (W / 2 - 0.15), 0.04, 0); g.add(f); }
  body.position.y = H / 2 + 0.08; for (const m of [door, dial, handle, slot, p, p2]) m.position.y += 0.08;
  g.add(contactShadow(W + 0.8, D + 0.8));
  return { group: g, slotTop: new V3(0, H + 0.09, 0.1), handle };
}
// Rubber stamp with a printed side ("SAÚDE"), handle up. Origin: the stamping face (it rests on y = 0).
function makeHealthStamp() {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(rbox(1.1, 0.08, 0.6, 0.02), mat(RED, { roughness: 0.6 })); pad.position.y = 0.04; g.add(pad);
  const block = new THREE.Mesh(rbox(1.24, 0.56, 0.7, 0.05), mat("#6a4330", { roughness: 0.7 })); block.position.y = 0.36; g.add(block);
  const p = makePlate("SAÚDE", 1.12, 0.44, { bg: "#ffffff", fg: RED }); p.position.set(0, 0.36, 0.366); g.add(p);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.45, 16), mat("#2b2b2b")); neck.position.y = 0.865; g.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), mat("#2b2b2b", { roughness: 0.35 })); knob.position.y = 1.18; g.add(knob);
  return g;
}

// Shopping cart (copy of the ICMS video's cart). Origin: floor centre, handle at -x. userData.floorY = basket floor.
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
  g.userData.floorY = y0 + 0.015; return g;
}
// Direction sign: post with an arrow-shaped board (pointing dir = -1 left / +1 right) and two printed lines.
// Origin: floor at the post; front +z.
function makeArrowSign(l1, l2, dir, color) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.1, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.y = 1.55; g.add(post);
  const W = 2.3, Hh = 1.2, tip = 0.5;
  const s = new THREE.Shape(); s.moveTo(-W / 2, -Hh / 2); s.lineTo(W / 2 - tip, -Hh / 2); s.lineTo(W / 2, 0); s.lineTo(W / 2 - tip, Hh / 2); s.lineTo(-W / 2, Hh / 2); s.closePath();
  const board = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04), mat(color, { roughness: 0.5 }));
  const bg = new THREE.Group(); bg.position.set(dir * 0.6, 2.65, 0.1); bg.add(board); if (dir < 0) board.rotation.y = Math.PI; g.add(bg);
  const p1 = makePlate(l1, 1.6, 0.44, { bg: color, fg: "#ffffff" }); p1.position.set(-dir * 0.22, 0.25, 0.056); bg.add(p1);
  const p2 = makePlate(l2, 1.6, 0.44, { bg: color, fg: "#ffffff" }); p2.position.set(-dir * 0.22, -0.25, 0.056); bg.add(p2);
  g.add(contactShadow(0.8, 0.8));
  return g;
}

// ---------------------------------------------------------------- 1. gancho (0 – 5.55)
// "Você sabe quais compras suas viram pecado a partir de 2027?"
addScene("gancho", 0, 5.55, (S) => {
  const co = makeCheckout(); S.add(co.group);
  const items = [makeBeerBottle(), makeSodaCan(), makeCigPack()];
  const xs = [-1.45, -0.3, 0.8], sc = [1.15, 1.35, 1.3];
  items.forEach((it, i) => { it.position.set(xs[i], co.top, 0.08); it.scale.setScalar(sc[i]); S.add(it); });
  const tags = items.map((it, i) => { const tg = makeTag("PECADO", 1.08, 0.5, RED); tg.position.set(xs[i] + 0.05, 0.6, 0.55); S.add(tg); return tg; });
  const at = [2.44, 3.15, 3.78];
  items.forEach((it, i) => S.hero(it, ["garrafa de cerveja", "lata de refrigerante", "maço de cigarro"][i]));
  tags.forEach((tg, i) => S.hero(tg, "etiqueta PECADO " + (i + 1), { when: (t) => t > at[i] + 0.4 }));
  S.solid(co.group, "balcão");
  const anim = (t) => {
    co.setBelt(t);
    items.forEach((it, i) => { it.rotation.y = 0.18 * Math.sin(t * 1.3 + i); });
    tags.forEach((tg, i) => { popIn(tg, t, at[i], 0.3); tg.rotation.z = 0.06 * Math.sin(t * 3 + i) * (t > at[i] + 0.3 ? 1 : 0) - 0.04; });
  };
  const shot = shotOf(anim);
  const A0 = shot([...items, ...tags], 0, 5.55, { from: [0.3, 0.4, 1], pull: 1.0 });
  const A1 = shot([...items, ...tags], 0, 5.55, { from: [0.05, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(RED); fill.position.set(0, 2.2, 1.6); fill.intensity = 1.5 + 2.5 * sm(t, 2.4, 3.9);
    let p = CAM.blend(A0, A1, sm(t, 0, 5.55));
    for (const a of at) p = CAM.shake(p, t, a, 0.18, 0.3);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 2. caixa (5.55 – 15.78)
// "Imagina você no caixa do mercado. Uma cerveja, um refri, um maço de cigarro.
//  Ano que vem, eles ganham um imposto com apelido curioso: imposto do pecado."
addScene("caixa", 5.55, 15.78, (S) => {
  const co = makeCheckout(); S.add(co.group);
  const items = [makeBeerBottle(), makeSodaCan(), makeCigPack()], sc = [1.1, 1.3, 1.2];
  items.forEach((it, i) => { it.scale.setScalar(sc[i]); detailAll(it); S.add(it); });
  const T = [7.7, 8.8, 9.64], v = 0.75;
  const rc = makeReceipt([
    { text: "CERVEJA", h: 0.2, detail: true }, { text: "REFRI", h: 0.2, detail: true }, { text: "CIGARRO", h: 0.2, detail: true },
    { text: "IMPOSTO", h: 0.22, bg: RED, fg: "#ffffff" }, { text: "DO PECADO", h: 0.22, bg: RED, fg: "#ffffff" },
  ], { w: 0.8 });
  rc.group.position.copy(co.slot); rc.group.rotation.x = -0.12; S.add(rc.group);
  const L = (t) => {
    const n = rc.need; let L = 0.06;
    [[7.75, n[0]], [8.85, n[1]], [9.7, n[2]], [12.3, n[3]], [14.45, n[4]]].forEach(([at, len], i) => { if (t > at) L = Math.max(L, lerp(i ? n[i - 1] : 0.06, len + 0.06, sm(t, at, at + 0.45))); });
    return L;
  };
  S.hero(co.group, "balcão do caixa", { when: (t) => t < 10.0 });
  items.forEach((it, i) => S.hero(it, ["garrafa de cerveja", "lata de refrigerante", "maço de cigarro"][i], { when: (t) => t < T[i] + 0.15 && t < 10.0 }));
  S.hero(rc.group, "cupom fiscal", { when: (t) => t > 11.0 });
  S.solid(co.group, "balcão");
  const anim = (t) => {
    co.setBelt(t);
    let glow = 0;
    items.forEach((it, i) => {
      const x = co.scanX - Math.min(2.0, Math.max(0, T[i] - t)) * v + 0.3 * sm(t, T[i] + 0.1, T[i] + 0.5);
      it.position.set(x, co.top, 0.12);
      popIn(it, t, Math.max(5.0, T[i] - 2.0), 0.3, sc[i], T[i] + 0.5); if (t > T[i] + 0.2 && t < T[i] + 0.5) it.scale.setScalar(sc[i] * (1 - sm(t, T[i] + 0.2, T[i] + 0.5)) + 0.0001);
      glow = Math.max(glow, 1 - Math.min(1, Math.abs(t - T[i]) / 0.25));
    });
    co.scanGlow(1.4 * glow);
    rc.setLength(L(t));
  };
  const shot = shotOf(anim);
  const A0 = shot([co.group, ...items], 5.55, 10.0, { from: [0.3, 0.5, 1], pull: 1.04 });
  const A1 = shot([co.group, ...items], 5.55, 10.0, { from: [0.1, 0.42, 1], pull: 1.0 });
  const B0 = shot([rc.group], 11.0, 15.78, { from: [-0.25, 0.25, 1], pull: 1.12 });
  const B1 = shot([rc.group], 11.0, 15.78, { from: [0.05, 0.18, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(t < 12 ? ORANGE : RED); fill.position.set(1.8, 2.0, 1.5); fill.intensity = t < 12 ? 2 : 2 + 2.5 * sm(t, 14.4, 14.9);
    CAM.apply(CAM.shake(CAM.track(t, [[5.55, A0], [10.0, A1, 4.4], [11.0, B0, 1.0], [15.78, B1, 4.7]]), t, 14.45, 0.15, 0.35));
  };
});

// ---------------------------------------------------------------- 3. seletivo (15.78 – 21.85)
// "O nome oficial é Imposto Seletivo, e ele mira o que faz mal à saúde ou ao meio ambiente."
addScene("seletivo", 15.78, 21.85, (S) => {
  const book = makeLawBook({ title: "CONSTITUIÇÃO", color: "#1f3d2e" }); book.group.scale.setScalar(1.25); book.group.position.set(0, 0, 0.9); S.add(book.group);
  const sel = book.print("IMPOSTO SELETIVO", 1.55, 0.36, 0.45, { bg: RED, fg: "#ffffff" });
  const pl = makePlinth({ w: 1.75, h: 0.8, d: 1.0, label: "SAÚDE" }); pl.group.position.set(-1.45, 0, -1.25); S.add(pl.group);
  const pr = makePlinth({ w: 1.75, h: 0.8, d: 1.0, label: "MEIO AMBIENTE" }); pr.group.position.set(1.45, 0, -1.25); S.add(pr.group);
  const heart = makeHeart(1.0); heart.position.set(-1.45, pl.top + 0.6, -1.25); S.add(heart);
  const tree = makeTree(); tree.scale.setScalar(1.15); tree.position.set(1.45, pr.top, -1.25); S.add(tree);
  const ret = makeReticle(0.62); S.add(ret.group);
  S.hero(book.group, "livro da Constituição", { when: (t) => t > 16.2 && t < 19.5 });
  S.hero(pl.group, "pedestal SAÚDE", { when: (t) => t > 20.4 }); S.hero(heart, "coração", { when: (t) => t > 20.4 });
  S.hero(pr.group, "pedestal MEIO AMBIENTE", { when: (t) => t > 20.95 }); S.hero(tree, "árvore", { when: (t) => t > 21.4 });
  S.solid(pl.group, "pedestal saúde"); S.solid(pr.group, "pedestal ambiente");
  S.solid(tree, "árvore", { restsOn: ["pedestal ambiente"] });
  const anim = (t) => {
    popIn(book.group, t, 15.8, 0.4, 1.25, 19.85); if (t > 19.5 && t < 19.85) book.group.scale.setScalar(1.25 * Math.max(0.0001, 1 - sm(t, 19.5, 19.85))); popIn(sel, t, 16.95, 0.35);
    popIn(pl.group, t, 19.7, 0.35); popIn(heart, t, 20.1, 0.4); heart.rotation.y = 0.5 * Math.sin((t - 20) * 1.8);
    popIn(pr.group, t, 20.7, 0.35); popIn(tree, t, 21.1, 0.4, 1.15);
    const toH = sm(t, 19.4, 20.1), toT = sm(t, 20.9, 21.25);
    const p = new V3(0, 1.2, 0.4).lerp(new V3(-1.45, pl.top + 0.62, -0.7), toH).lerp(new V3(1.45, pr.top + 0.9, -0.7), toT);
    ret.group.position.copy(p); ret.group.visible = t > 18.9; ret.group.scale.setScalar(Math.max(0.0001, pop(t, 18.9, 0.35)) * (1 + 0.08 * Math.sin(t * 9)));
  };
  const shot = shotOf(anim);
  const A0 = shot([book.group], 15.78, 19.3, { from: [0.1, 1.3, 1], pull: 1.1 });
  const A1 = shot([book.group], 15.78, 19.3, { from: [-0.05, 1.15, 1], pull: 1.02 });
  const B0 = shot([pl.group, pr.group, heart, tree], 19.6, 21.85, { from: [0.1, 0.45, 1], pull: 1.04 });
  const B1 = shot([pl.group, pr.group, heart, tree], 19.6, 21.85, { from: [-0.08, 0.38, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.5, 1.6); fill.intensity = 2; CAM.apply(CAM.track(t, [[15.78, A0], [19.0, A1, 3.2], [19.9, B0, 0.9], [21.85, B1, 1.9]])); };
});

// ---------------------------------------------------------------- 4. pote (21.85 – 32.85)
// "Sabe o pote do palavrão? Cada palavrão, uma moeda. A ideia não é encher o pote, é você falar menos.
//  Esse imposto é igual. Encarece pra você consumir menos."
addScene("pote", 21.85, 32.85, (S) => {
  const jar = makeJar({ r: 0.7, h: 1.6, label: "PALAVRÃO", label2: "IMPOSTO" }); S.add(jar.group);
  const person = makePerson(BLUE); person.scale.setScalar(2.3); person.position.set(-1.9, 0, 0.2); S.add(person);
  const balloon = makeBalloon("#@$%!", { w: 1.3, h: 0.56 }); balloon.position.set(-1.45, 2.55, 0.3); S.add(balloon);
  const coins = [0, 1, 2, 3, 4].map(() => { const c = makeCoin(0.17); S.add(c.group); return c; });
  const drops = [23.76, 24.76, 26.4, 26.75, 27.1];
  const can = makeSodaCan(); can.scale.setScalar(1.7); can.position.set(1.65, 0, 0.3); S.add(can);
  const tag = makeTag("R$", 0.9, 0.42, ORANGE); S.add(tag);
  const stack = []; const sx = 2.95;
  [[-0.42, 0], [0, 0], [0.42, 0], [-0.21, 1], [0.21, 1], [0, 2]].forEach(([x, row]) => { const c = makeSodaCan(); detailAll(c); c.scale.setScalar(0.95); c.position.set(sx + x, row * 0.72 * 0.95, 0.0); S.add(c); stack.push(c); });
  S.hero(jar.group, "pote de vidro");
  S.hero(person, "pessoa", { when: (t) => t < 28.4 }); S.hero(balloon, "balão de fala com palavrão", { when: (t) => t > 22.9 && t < 27.9 });
  S.hero(can, "lata de refrigerante grande", { when: (t) => t > 29.3 }); S.hero(tag, "etiqueta de preço", { when: (t) => t > 30.6 });
  stack.forEach((c, i) => S.hero(c, "pilha de latas " + (i + 1), { when: (t) => t > 29.6 && (i < 3 || t < 31.6) }));
  S.solid(jar.group, "pote"); S.solid(can, "lata grande");
  const mouth = new V3(0, jar.mouthY + 0.15, 0);
  const anim = (t) => {
    const n = drops.filter((d) => t > d + 0.55).length;
    jar.setLevel(0.06 * n + 0.04 * sm(t, 26.4, 27.8) + 0.25 * sm(t, 29.5, 31.0));
    jar.flip(sm(t, 28.9, 29.5));
    person.visible = t < 28.6; person.rotation.y = 0.3 * Math.sin(t * 1.5);
    const talk = (t > 22.88 && t < 23.4) || (t > 23.76 && t < 24.4) || (t > 24.7 && t < 25.3) || (t > 26.3 && t < 27.4);
    const bk = t < 27.96 ? (talk ? 1 : 0.85) : 1 - sm(t, 27.96, 28.3);
    balloon.visible = t > 22.85 && bk > 0.02; balloon.scale.setScalar(Math.max(0.0001, pop(t, 22.85, 0.3) * bk));
    coins.forEach((c, i) => {
      const k = lin(t, drops[i], drops[i] + 0.55);
      c.group.visible = k > 0 && k < 1;
      c.group.position.copy(hop(new V3(-1.5, 2.1, 0.3), mouth, k, 0.5)); c.spin(t * 7 + i);
      if (k > 0.85) c.group.position.y = lerp(mouth.y, jar.levelY(0.06 * i), (k - 0.85) / 0.15);
    });
    popIn(can, t, 28.95, 0.4, 1.7);
    tag.position.set(1.65, 1.75 + 0.05 * Math.sin(t * 3), 0.55); tag.visible = t > 30.4;
    tag.scale.setScalar(Math.max(0.0001, pop(t, 30.4, 0.35)) * (1 + 0.7 * sm(t, 30.56, 31.3)));
    tag.rotation.z = 0.08 * Math.sin(t * 4);
    stack.forEach((c, i) => { popIn(c, t, 29.3 + 0.08 * i, 0.3, 0.95, i < 3 ? Infinity : 31.64 + 0.12 * (i - 3)); });
  };
  const shot = shotOf(anim);
  const A0 = shot([jar.group, person, balloon], 21.85, 28.4, { from: [0.2, 0.35, 1], pull: 1.06 });
  const A1 = shot([jar.group, person, balloon], 21.85, 28.4, { from: [-0.05, 0.3, 1], pull: 1.0 });
  const B0 = shot([jar.group, can, tag, ...stack], 29.4, 32.85, { from: [0.15, 0.35, 1], pull: 1.04 });
  const B1 = shot([jar.group, can, tag, ...stack], 29.4, 32.85, { from: [-0.05, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 28.8 ? ORANGE : RED); fill.position.set(0, 2.6, 1.6); fill.intensity = 2.2;
    CAM.apply(CAM.track(t, [[21.85, A0], [28.4, A1, 6.5], [29.4, B0, 0.9], [32.85, B1, 3.4]]));
  };
});

// ---------------------------------------------------------------- 5. consumo (32.85 – 37.4)
// "Cigarro, bebida alcoólica, refrigerante e outras bebidas com açúcar."
addScene("consumo", 32.85, 37.4, (S) => {
  const at = [32.94, 33.7, 34.86, 36.18], xs = [-1.5, -0.5, 0.45, 1.45];
  const things = [makeCigPack(), makeBeerBottle(), makeSodaCan(), makeJuiceBox()], sc = [1.65, 1.4, 1.6, 1.5];
  const names = ["maço de cigarro", "garrafa de cerveja", "lata de refrigerante", "caixinha de suco"];
  const shelf = makePlinth({ w: 4.2, h: 0.45, d: 1.0 }); S.add(shelf.group);
  things.forEach((it, i) => { it.position.set(xs[i], shelf.top, 0.05); S.add(it); });
  S.hero(shelf.group, "prateleira"); S.solid(shelf.group, "prateleira");
  things.forEach((it, i) => { S.hero(it, names[i], { when: (t) => t > at[i] + 0.35 }); S.solid(it, names[i], { restsOn: ["prateleira"] }); });
  const anim = (t) => { things.forEach((it, i) => { popIn(it, t, at[i], 0.35, sc[i]); it.rotation.y = 0.25 * Math.sin(t * 1.2 + i); }); };
  const shot = shotOf(anim);
  const A0 = shot([shelf.group, ...things], 32.85, 37.4, { from: [0.25, 0.4, 1], pull: 1.03 });
  const A1 = shot([shelf.group, ...things], 32.85, 37.4, { from: [-0.1, 0.32, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.4, 1.6); fill.intensity = 2; CAM.apply(CAM.blend(A0, A1, sm(t, 32.85, 37.4))); };
});

// ---------------------------------------------------------------- 6. veiculos (37.4 – 41.4)
// "Carro novo, até elétrico, mas caminhão ficou de fora."
addScene("veiculos", 37.4, 41.4, (S) => {
  const car = makeCar({ color: BLUE }); car.position.set(-1.9, 0, 0.3); S.add(car);
  const ch = makeCharger(new V3(-0.555, 0.5, 0.0)); ch.group.position.set(-0.25, 0, 0.3); S.add(ch.group);
  const truck = makeBoxTruck(); truck.position.set(2.4, 0, -0.2); S.add(truck);
  const cross = makeCross(1.3); S.add(cross);
  S.hero(car, "carro", { when: (t) => t < 39.6 }); S.hero(ch.group, "carregador elétrico", { when: (t) => t > 39.0 && t < 39.6 });
  S.hero(truck, "caminhão baú", { when: (t) => t > 40.3 }); S.hero(cross, "X vermelho", { when: (t) => t > 40.3 });
  S.solid(car, "carro"); S.solid(ch.group, "carregador"); S.solid(truck, "caminhão");
  const anim = (t) => {
    car.position.x = -1.9 - 0.8 * (1 - eOut(lin(t, 37.4, 38.3)));
    popIn(ch.group, t, 38.68, 0.4, 1, 40.2); popIn(car, t, 37.0, 0.01, 1, 40.2);
    ch.cable.geometry.setDrawRange(0, Math.floor(sm(t, 38.9, 39.4) * 40) * 8 * 6);
    popIn(truck, t, 39.62, 0.4); truck.position.x = 2.4 + 0.9 * sm(t, 40.1, 41.3);
    cross.position.set(truck.position.x - 0.45, 0.92, 0.75); popIn(cross, t, 39.84, 0.35, 1);
    cross.rotation.z = 0.1 * Math.sin(t * 5);
  };
  const shot = shotOf(anim);
  const A0 = shot([car, ch.group], 37.4, 39.6, { from: [0.35, 0.4, 1], pull: 1.06 });
  const A1 = shot([car, ch.group], 37.4, 39.6, { from: [0.15, 0.35, 1], pull: 1.0 });
  const B0 = shot([truck, cross], 40.0, 41.4, { from: [0.1, 0.3, 1], pull: 1.04 });
  const B1 = shot([truck, cross], 40.0, 41.4, { from: [-0.1, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 39.8 ? GREEN : RED); fill.position.set(t < 39.8 ? -1.2 : 2.2, 2.2, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.shake(CAM.track(t, [[37.4, A0], [39.5, A1, 2.1], [40.25, B0, 0.6], [41.4, B1, 1.15]]), t, 40.3, 0.15, 0.3));
  };
});

// ---------------------------------------------------------------- 7. luxo (41.4 – 45.88)
// "Jatinho, iate, petróleo, minério e até loteria."
addScene("luxo", 41.4, 45.88, (S) => {
  const jet = makeJet(); jet.scale.setScalar(0.92); jet.position.set(-1.55, 1.9, -1.5); S.add(jet);
  const yacht = makeYacht(); yacht.position.set(-1.85, 0.04, 0.95); S.add(yacht);
  const water1 = makeWater(3.2, 1.6); water1.position.set(-1.85, 0, 0.95); S.add(water1);
  const rig = makeOilRig(); rig.group.scale.setScalar(0.5); rig.group.position.set(1.7, 0, -1.2); detailAll(rig.group); S.add(rig.group);
  const water2 = makeWater(2.4, 1.9); water2.position.set(1.7, 0, -1.2); S.add(water2);
  const ore = makeOrePile(); ore.position.set(0.45, 0, 1.05); S.add(ore);
  const ticket = makeTicket(); ticket.position.set(1.95, 0, 1.25); S.add(ticket);
  const at = [41.46, 42.36, 43.16, 43.92, 45.14];
  S.hero(jet, "jatinho", { when: (t) => t > 41.85 && t < 44.6 }); S.hero(yacht, "iate", { when: (t) => t > 42.75 && t < 44.6 });
  S.hero(rig.group, "plataforma de petróleo", { when: (t) => t > 43.55 && t < 44.6 }); S.hero(ore, "monte de minério", { when: (t) => t > 44.3 && t < 44.6 });
  S.hero(ticket, "bilhete de loteria", { when: (t) => t > 45.0 });
  S.solid(yacht, "iate"); S.solid(rig.group, "plataforma"); S.solid(ore, "minério");
  const anim = (t) => {
    popIn(jet, t, at[0], 0.4, 0.92); jet.position.y = 1.9 + 0.08 * Math.sin(t * 2.2); jet.rotation.z = 0.04 * Math.sin(t * 1.7);
    popIn(yacht, t, at[1], 0.4); popIn(water1, t, at[1], 0.4); yacht.rotation.z = 0.03 * Math.sin(t * 2.6); yacht.position.y = 0.04 + 0.02 * Math.sin(t * 2.6);
    popIn(rig.group, t, at[2], 0.4, 0.5); popIn(water2, t, at[2], 0.4);
    rig.flame.scale.setScalar(1.6 * (0.85 + 0.15 * Math.sin(t * 13)));
    popIn(ore, t, at[3], 0.4);
    const out = 1 - sm(t, 44.7, 45.0);
    if (t > 44.7) { jet.scale.setScalar(Math.max(0.0001, 0.92 * out)); yacht.scale.setScalar(Math.max(0.0001, out)); water1.scale.setScalar(Math.max(0.0001, out)); rig.group.scale.setScalar(Math.max(0.0001, 0.5 * out)); water2.scale.setScalar(Math.max(0.0001, out)); ore.scale.setScalar(Math.max(0.0001, out)); }
    popIn(ticket, t, at[4] - 0.25, 0.4); ticket.rotation.y = -0.25 + 0.1 * Math.sin(t * 2);
  };
  const shot = shotOf(anim);
  const A0 = shot([jet, yacht, rig.group, ore], 41.4, 44.6, { from: [0.15, 0.6, 1], pull: 1.04 });
  const A1 = shot([jet, yacht, rig.group, ore], 41.4, 44.6, { from: [-0.05, 0.5, 1], pull: 1.0 });
  const B0 = shot([ticket], 44.9, 45.88, { from: [-0.15, 0.25, 1], pull: 1.1 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.6, 1.8); fill.intensity = 2; CAM.apply(CAM.track(t, [[41.4, A0], [44.3, A1, 2.9], [45.0, B0, 0.7]])); };
});

// ---------------------------------------------------------------- 8. custo (45.88 – 51.1)
// "Quanto vai custar? O ministro da Fazenda, Dario Durigan, prevê os valores pra esta semana." [cartão 46.96–51.04]
addScene("custo", 45.88, 51.1, (S) => {
  const tag = makeTag("R$ ?", 2.4, 1.1, ORANGE); tag.position.set(0, 1.4, 0); S.add(tag);
  S.hero(tag, "etiqueta de preço com interrogação", { when: (t) => t < 46.9 });
  const anim = (t) => { popIn(tag, t, 45.9, 0.35, 1, 47.25); if (t > 46.95) tag.scale.setScalar(Math.max(0.0001, 1 - sm(t, 46.95, 47.25))); tag.rotation.y = 0.6 * Math.sin((t - 45.9) * 1.6); tag.position.y = 1.4 + 0.07 * Math.sin(t * 2.4); };
  const shot = shotOf(anim);
  const A0 = shot([tag], 45.88, 51.1, { from: [0.25, 0.2, 1], pull: 1.08 });
  const A1 = shot([tag], 45.88, 51.1, { from: [-0.25, 0.15, 1], pull: 1.25 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.2, 1.6); fill.intensity = 2; CAM.apply(CAM.blend(A0, A1, sm(t, 45.88, 51.1))); };
});

// ---------------------------------------------------------------- 9. noventa (51.1 – 56.7)
// "E como a lei exige esperar noventa dias, a cobrança só deve começar lá pra fevereiro."
addScene("noventa", 51.1, 56.7, (S) => {
  const cal = makeDeskCalendar(); cal.group.position.set(-0.55, 0, 0); S.add(cal.group);
  const cnt = makeDayCounter(); cnt.group.position.set(1.15, 0, 0.55); S.add(cnt.group);
  const pin = new THREE.Group(); const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), mat(RED, { roughness: 0.35 })); head.position.z = 0.16; pin.add(head);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.16, 8), mat("#cfcfcf", { metalness: 0.8 })); needle.rotation.x = Math.PI / 2; needle.position.z = 0.08; pin.add(needle);
  pin.position.set(-0.5, cal.H * 0.88, 0.075); cal.front.add(pin);
  S.hero(cal.group, "calendário de mesa"); S.hero(cnt.group, "contador de dias");
  S.solid(cal.group, "calendário"); S.solid(cnt.group, "contador");
  const pages = [["2026", "NOV"], ["2026", "DEZ"], ["2027", "JAN"], ["2027", "FEV"]];
  const flips = [53.0, 54.0, 55.0];
  const anim = (t) => {
    let i = 0; for (const f of flips) if (t >= f + 0.4) i++;
    const cur = pages[Math.min(i, 3)], nxt = pages[Math.min(i + 1, 3)];
    const f = flips[i]; const k = f !== undefined ? sm(t, f, f + 0.4) : 0;
    if (f !== undefined && t >= f) { cal.setPage(nxt[0], nxt[1]); cal.flip(k, cur); } else { cal.setPage(cur[0], cur[1]); cal.flip(f !== undefined ? 0 : 1, cur); }
    cnt.set(Math.round(90 * lin(t, 52.0, 55.4)));
    popIn(pin, t, 55.7, 0.35);
  };
  const shot = shotOf(anim);
  const A0 = shot([cal.group, cnt.group], 51.1, 56.7, { from: [0.3, 0.3, 1], pull: 1.03 });
  const A1 = shot([cal.group, cnt.group], 51.1, 56.7, { from: [-0.05, 0.25, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 1.8, 1.6); fill.intensity = 2; CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 51.1, 56.7)), t, 56.2, 0.12, 0.3)); };
});

// ---------------------------------------------------------------- 10. arrecada (56.7 – 62.9)
// "A previsão é arrecadar quase quarenta e dois bilhões de reais. E pra onde vai esse dinheiro?"
addScene("arrecada", 56.7, 62.9, (S) => {
  const jar = makeJar({ r: 1.05, h: 2.0, label: "IMPOSTO", labelBg: RED, bH: 0.6 }); S.add(jar.group);
  const coins = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const c = makeCoin(0.2); S.add(c.group); return c; });
  const stacks = [[-2.15, 0.55], [2.15, 0.5], [-2.05, -0.75], [2.05, -0.8]].map(([x, z], i) => { const m = makeMoneyStack("R$"); m.scale.setScalar(1.3); m.position.set(x, 0, z); m.rotation.y = 0.4 * (i % 2 ? 1 : -1); S.add(m); return m; });
  const q = makeQuestion(); q.scale.setScalar(1.3); S.add(q);
  S.hero(jar.group, "pote cheio de moedas"); S.hero(q, "ponto de interrogação", { when: (t) => t > 61.7 });
  stacks.forEach((m, i) => S.hero(m, "maço de notas " + (i + 1), { when: (t) => t > 59.2 }));
  S.solid(jar.group, "pote");
  const top = new V3(0, jar.mouthY + 0.2, 0);
  const anim = (t) => {
    jar.setLevel(0.1 + 0.85 * sm(t, 56.8, 60.8));
    coins.forEach((c, i) => {
      const period = 0.9, ph = ((t - 56.7) / period + i / coins.length) % 1, k = ph;
      c.group.visible = t < 61.0;
      const from = new V3(Math.sin(i * 2.3) * 1.0, jar.mouthY + 0.9, Math.cos(i * 1.7) * 0.5);
      c.group.position.copy(from.lerp(top, k)); c.group.position.y -= 0.2 * k; c.spin(t * 6 + i); c.group.scale.setScalar(k > 0.9 ? Math.max(0.0001, (1 - k) * 10) : 1);
    });
    stacks.forEach((m, i) => popIn(m, t, 58.8 + 0.15 * i, 0.35, 1.3));
    q.position.set(0, jar.mouthY + 0.35 + 0.08 * Math.sin(t * 3), 0.1); popIn(q, t, 61.34, 0.4, 1.3); q.rotation.y = 0.4 * Math.sin(t * 2);
  };
  const shot = shotOf(anim);
  const A0 = shot([jar.group, ...stacks, q, ...coins.map((c) => c.group)], 56.7, 62.9, { from: [0.2, 0.35, 1], pull: 1.12 });
  const A1 = shot([jar.group, ...stacks, q], 56.7, 62.9, { from: [-0.05, 0.3, 1], pull: 1.02 });
  return (t) => { anim(t); fill.color.set(GOLD); fill.position.set(0, 3.2, 1.8); fill.intensity = 2 + 2 * sm(t, 57, 60.8); CAM.apply(CAM.blend(A0, A1, sm(t, 56.7, 62.9))); };
});

// ---------------------------------------------------------------- 11. divide (62.9 – 72.33)
// "Agora o pote cheio é dividido: de cada dez reais, seis vão pra estados, prefeituras e fundos regionais.
//  Quatro ficam com o governo federal."
addScene("divide", 62.9, 72.33, (S) => {
  const jar = makeJar({ r: 0.8, h: 1.8, label: "IMPOSTO", labelBg: RED }); jar.setLevel(0.95); jar.group.position.set(0, 0, -0.9); S.add(jar.group);
  const R = 0.36, gap = 0.8;
  // the ten coins live in one group so the row counts as one thing on screen (each coin alone is under 1% of the frame)
  const row = new THREE.Group(); S.add(row);
  const coins = Array.from({ length: 10 }, (_, i) => { const c = makeCoin(R); row.add(c.group); return { c, x0: (i - 4.5) * gap }; });
  S.scenery(row, "fila de dez moedas", { when: (t) => t > 64.4 && t < 66.8 });
  const est = makeBuilding("ESTADOS"); est.position.set(-7.85, 0, -0.9); S.add(est);
  const pref = makeBuilding("PREFEITURAS", { w: 2.6, color: "#f0e6d6", plateBg: "#2b3a44" }); pref.position.set(-4.85, 0, -0.9); S.add(pref);
  const uni = makeBuilding("UNIÃO", { color: "#d9d2c6" }); uni.position.set(5.75, 0, -0.9); S.add(uni);
  // destinations: six coins in a row in front of the left buildings, four in front of the right one
  const destL = (j) => new V3(-8.55 + j * 0.78, R, 1.35), destR = (j) => new V3(4.6 + j * 0.78, R, 1.35);
  S.hero(jar.group, "pote", { when: (t) => t < 64.3 });
  coins.forEach(({ c }, i) => S.hero(c.group, "moeda " + (i + 1), { when: (t) => (t > 64.9 && t < 66.75) || (i < 6 ? t > 67.9 && t < 69.95 : t > 71.3) }));
  S.hero(est, "prédio ESTADOS", { when: (t) => t > 67.75 && t < 69.95 }); S.hero(pref, "prédio PREFEITURAS", { when: (t) => t > 67.75 && t < 69.95 });
  S.hero(uni, "prédio UNIÃO", { when: (t) => t > 71.25 });
  S.solid(est, "estados"); S.solid(pref, "prefeitura"); S.solid(uni, "união");
  const anim = (t) => {
    popIn(est, t, 66.85, 0.4); popIn(pref, t, 67.0, 0.4); popIn(uni, t, 70.0, 0.4);
    popIn(jar.group, t, 62.5, 0.01, 1, 64.55); if (t > 64.1 && t < 64.55) jar.group.scale.setScalar(Math.max(0.0001, 1 - sm(t, 64.1, 64.55)));
    coins.forEach(({ c, x0 }, i) => {
      const k0 = pop(t, 64.4 + 0.06 * i, 0.35);
      const start = new V3(x0, R, 0.4);
      let p = start.clone();
      if (i < 6) { const k = sm(t, 66.8 + 0.08 * i, 67.9 + 0.08 * i); p = start.clone().lerp(destL(i), k); }
      else { const k = sm(t, 70.2 + 0.08 * (i - 6), 71.1 + 0.08 * (i - 6)); p = start.clone().lerp(destR(i - 6), k); }
      c.group.position.copy(p); c.group.visible = t > 64.4; c.group.scale.setScalar(Math.max(0.0001, k0));
      // roll, but land upright: the total turn is rounded to whole turns
      const end = i < 6 ? destL(i) : destR(i - 6), D = end.x - start.x, turns = Math.max(1, Math.round(Math.abs(D) / R / (2 * Math.PI)));
      c.spin(COIN_UP - Math.sign(D) * turns * 2 * Math.PI * (Math.abs(D) > 1e-6 ? (p.x - start.x) / D : 0));
    });
  };
  const shot = shotOf(anim);
  const A0 = shot([jar.group], 62.9, 64.2, { from: [0.1, 0.35, 1], pull: 1.1 });
  const B0 = shot(coins.map(({ c }) => c.group), 64.8, 66.7, { from: [0.0, 0.5, 1], pull: 1.06 });
  const C0 = shot([est, pref, ...coins.slice(0, 6).map(({ c }) => c.group)], 68.0, 70.2, { from: [0.15, 0.4, 1], pull: 1.03 });
  const C1 = shot([est, pref, ...coins.slice(0, 6).map(({ c }) => c.group)], 68.0, 70.2, { from: [-0.05, 0.35, 1], pull: 1.0 });
  const D0 = shot([uni, ...coins.slice(6).map(({ c }) => c.group)], 71.3, 72.33, { from: [-0.15, 0.4, 1], pull: 1.05 });
  return (t) => {
    anim(t);
    fill.color.set(GOLD); fill.position.set(0, 3, 2); fill.intensity = 2;
    CAM.apply(CAM.shake(CAM.track(t, [[62.9, A0], [64.8, B0, 0.6], [67.7, C0, 0.9], [69.95, C1, 2.25], [70.6, D0, 0.6]]), t, 64.5, 0.12, 0.3));
  };
});

// ---------------------------------------------------------------- 12. surpresa (72.33 – 80.98)
// "E a surpresa: nenhum real tem carimbo pra saúde. O dinheiro do cigarro não vai direto pro tratamento do pulmão: cai no caixa geral."
addScene("surpresa", 72.33, 80.98, (S) => {
  const hos = makeHospital(); hos.group.position.set(-2.0, 0, -0.7); S.add(hos.group);
  const safe = makeSafe(); safe.group.position.set(2.05, 0, -0.6); S.add(safe.group);
  const R = 0.42, coin = makeCoin(R); S.add(coin.group);
  const stamp = makeHealthStamp(); S.add(stamp);
  S.hero(hos.group, "hospital"); S.hero(safe.group, "cofre CAIXA GERAL"); S.hero(coin.group, "moeda", { when: (t) => t < 79.9 });
  S.hero(stamp, "carimbo SAÚDE", { when: (t) => t > 73.0 && t < 75.55 });
  S.solid(hos.group, "hospital"); S.solid(safe.group, "cofre"); S.solid(coin.group, "moeda", { when: (t) => t < 79.4 }); S.solid(stamp, "carimbo");
  const mid = new V3(0, R, 0.7), dodge = new V3(1.2, R, 0.7), door = new V3(-2.0, R, 0.3), front = new V3(1.25, R, 0.75);
  const slot = safe.slotTop.clone().add(safe.group.position);
  const anim = (t) => {
    // coin: centre → dodges the stamp → rolls to the hospital door → bounces back → hops into the safe slot
    let p = mid.clone();
    if (t > 74.35) p = mid.clone().lerp(dodge, sm(t, 74.35, 74.62));
    if (t > 76.8) p = dodge.clone().lerp(door, sm(t, 76.8, 77.75));
    if (t > 77.75) p = door.clone().lerp(front, sm(t, 77.95, 79.1));
    if (t > 79.1) { const k = lin(t, 79.1, 79.75); p = hop(front, slot.clone().add(new V3(0, 0.05, 0)), k, 0.9); }
    coin.group.position.copy(p); coin.spin(COIN_UP - (p.x - mid.x) / R); coin.group.visible = t < 79.78;
    coin.group.position.y += t > 77.6 && t < 77.95 ? 0.12 * Math.sin(lin(t, 77.6, 77.95) * Math.PI) : 0;
    // stamp: hovers over the coin, comes down at "carimbo" and hits the floor where the coin was
    const down = sm(t, 74.3, 74.66), up = sm(t, 75.25, 75.55);
    stamp.position.set(0, lerp(1.7, 0.0, down) + lerp(0, 0.5, up) + 0.06 * Math.sin(t * 3) * (1 - down), 0.7);
    stamp.visible = t > 72.6 && t < 75.8; stamp.scale.setScalar(Math.max(0.0001, pop(t, 72.6, 0.35)) * (t > 75.55 ? Math.max(0.0001, 1 - sm(t, 75.55, 75.8)) : 1));
    safe.handle.rotation.z = 2.0 * sm(t, 79.8, 80.5);
  };
  const shot = shotOf(anim);
  const A0 = shot([hos.group, safe.group, coin.group, stamp], 72.33, 80.98, { from: [0.2, 0.4, 1], pull: 1.04 });
  const A1 = shot([hos.group, safe.group, coin.group, stamp], 72.33, 80.98, { from: [-0.1, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 79.5 ? RED : GOLD); fill.position.set(t < 79.5 ? -1 : 2.2, 2.4, 1.6); fill.intensity = 2.2;
    let p = CAM.blend(A0, A1, sm(t, 72.33, 80.98)); p = CAM.shake(p, t, 74.66, 0.2, 0.35); p = CAM.shake(p, t, 79.75, 0.12, 0.3);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 13. escolha (80.98 – 89.8)
// "Então me diz: imposto mais caro faz você comprar menos... ou você só paga mais e continua igual?"
addScene("escolha", 80.98, 89.8, (S) => {
  const cart = makeCart(); cart.scale.setScalar(1.9); S.add(cart);
  const inside = [makeBeerBottle(), makeSodaCan(), makeCigPack()];
  [[-0.3, 0.42], [0.06, 0.55], [0.34, 0.48]].forEach(([x, s], i) => { const it = inside[i]; it.scale.setScalar(s); it.position.set(x, cart.userData.floorY, i === 1 ? 0.1 : -0.05); detailAll(it); cart.add(it); });
  const tag = makeTag("R$", 1.5, 0.68, RED); S.add(tag);
  const left = makeArrowSign("COMPRA", "MENOS", -1, GREEN); left.position.set(-1.75, 0, -1.3); S.add(left);
  const right = makeArrowSign("PAGA", "MAIS", 1, RED); right.position.set(1.75, 0, -1.3); S.add(right);
  S.hero(cart, "carrinho de compras"); S.hero(tag, "etiqueta de preço", { when: (t) => t > 81.6 }); S.hero(left, "placa COMPRA MENOS"); S.hero(right, "placa PAGA MAIS");
  S.solid(cart, "carrinho"); S.solid(left, "placa esquerda"); S.solid(right, "placa direita");
  const anim = (t) => {
    const sway = -0.4 * sm(t, 83.6, 84.3) * (1 - sm(t, 85.4, 86.0)) + 0.4 * sm(t, 85.4, 86.0) * (1 - sm(t, 87.6, 88.6)) + 0.2 * Math.sin((t - 87.6) * 2.4) * sm(t, 87.6, 88.6);
    cart.position.set(sway, 0, 0.55); cart.rotation.y = -0.2 * sway;
    tag.position.set(sway * 0.5, 2.55 + 0.06 * Math.sin(t * 3), 0.2); tag.scale.setScalar(Math.max(0.0001, pop(t, 81.1, 0.35)) * (1 + 0.35 * sm(t, 82.4, 83.2)));
    tag.rotation.z = 0.08 * Math.sin(t * 3.5);
    left.rotation.y = 0.2; right.rotation.y = -0.2;
    popIn(left, t, 81.15, 0.4); popIn(right, t, 81.45, 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([cart, tag, left, right], 80.98, 89.8, { from: [0.2, 0.35, 1], pull: 1.06 });
  const A1 = shot([cart, tag, left, right], 80.98, 89.8, { from: [-0.05, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 85.4 ? GREEN : RED); fill.position.set(t < 85.4 ? -2 : 2, 2.6, 1.6); fill.intensity = t < 83.5 ? 1.5 : 2.5;
    CAM.apply(CAM.blend(A0, A1, sm(t, 80.98, 89.8)));
  };
});
