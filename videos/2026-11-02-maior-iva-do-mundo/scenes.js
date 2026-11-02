// ============================================================================
// videos/2026-11-02-maior-iva-do-mundo/scenes.js
// 3D scenes synced to audio/words.json (narration 0–93.1 s, video 95.1 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.move(envelope(objs, anim, t0, t1), kind, k, { zone: "stage" })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check; S.backdrop is the place behind
// Places (one per act): the glass hall of records (pódio, colunas), the clothes shop (camiseta, nota),
// the road at dusk (a analogia do pedágio) and the government office (2027, TCU, Senado).
// Generic imagery only: no brands, no flags. Photos (TCU, Senado, Parlamento húngaro) sit in
// porta-retratos with their credit in the source zone for the whole time they are on screen.
// ============================================================================

const PAPER = "#fbf7ef", INK = "#1c1410", GOLD = "#e0a83a", BLUE = "#2f6fb0", GREY = "#7d858f", WOODC = "#6a4a30";
const Z = { zone: "stage" };
// Camera move over the whole shot: kind ∈ push, reveal, orbit, crane, drop, truck (docs/visual.md → Direção).
const moveOf = (anim) => (objs, t0, t1, kind, o = {}) => moveBox(envelope(objs, anim, t0, t1), t0, t1, kind, o);
// Same move over a box built by hand (union of envelopes: things that drop in from above are framed where they land).
const moveBox = (box, t0, t1, kind, o = {}) => (t) => CAM.move(box, kind, lin(t, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.35, 1], pull: 1.02 }, o));
const unionBox = (...bs) => bs.reduce((a, b) => a.union(b), new THREE.Box3());
// ---- reaproveitado de videos/2026-10-30-reforma-tributaria-2027/scenes.js
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));
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
// ---- reaproveitado de videos/2026-10-30-taxa-blusinhas-2027/scenes.js
// ---------------------------------------------------------------- backdrops (full screen, context only)
// Soft round sprite texture (dust, glow).
const SOFT = (() => { const c = makeCanvas(64, 64), x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return texFrom(c); })();
// Dust motes drifting in the light across the whole frame. API { points, update(t) }
function makeDust(n, box, { color = "#ffdcb4", size = 0.05, seed = 3, opacity = 0.6 } = {}) {
  const r = mulberry32(seed), base = [];
  for (let i = 0; i < n; i++) base.push([lerp(box[0][0], box[1][0], r()), lerp(box[0][1], box[1][1], r()), lerp(box[0][2], box[1][2], r()), r() * 6.28]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, map: SOFT, transparent: true, opacity, depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
  points.userData.decor = true; points.frustumCulled = false;
  const H = box[1][1] - box[0][1];
  const update = (t) => {
    const a = geo.attributes.position.array;
    base.forEach(([x, y, z, ph], i) => { a[i * 3] = x + 0.25 * Math.sin(t * 0.21 + ph); a[i * 3 + 1] = box[0][1] + ((y - box[0][1] + 0.06 * t + 1000 * H) % H); a[i * 3 + 2] = z + 0.2 * Math.cos(t * 0.17 + ph); });
    geo.attributes.position.needsUpdate = true;
  };
  update(0); return { points, update };
}
// Dusk sky dome (vertex colours by elevation): warm glow on the horizon, violet, deep blue overhead.
function makeSky(R = 170) {
  const geo = new THREE.SphereGeometry(R, 48, 32), pos = geo.attributes.position, col = [];
  const stops = [[-1, "#140d09"], [-0.01, "#3a2219"], [0.0, "#7a3c28"], [0.04, "#c8692e"], [0.1, "#8a4038"], [0.24, "#3a2440"], [0.55, "#171629"], [1, "#0b0c18"]];
  const c = new THREE.Color(), a = new THREE.Color(), b = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const e = pos.getY(i) / R; let k = 0; while (k < stops.length - 2 && e > stops[k + 1][0]) k++; a.set(stops[k][1]); b.set(stops[k + 1][1]); c.copy(a).lerp(b, clamp((e - stops[k][0]) / (stops[k + 1][0] - stops[k][0]))); col.push(c.r, c.g, c.b); }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }));
  m.userData.decor = true; m.renderOrder = -1; return m;
}
// Soft clouds drifting along the horizon. API { group, update(t) }
function makeClouds(n = 7, seed = 5) {
  const g = new THREE.Group(), r = mulberry32(seed), list = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: new THREE.Color("#e8a070").multiplyScalar(0.55), transparent: true, opacity: 0.35, depthWrite: false, fog: false }));
    const w = 30 + r() * 30; s.scale.set(w, w * 0.18, 1); s.userData.decor = true;
    list.push({ s, x: -90 + r() * 180, y: 14 + r() * 16, z: -120 - r() * 30, v: 0.4 + r() * 0.5 }); g.add(s);
  }
  const update = (t) => list.forEach((c) => c.s.position.set(((c.x + c.v * t + 100) % 200) - 100, c.y, c.z));
  update(0); return { group: g, update };
}
// Countryside around the road at dusk: sky, grass, the road going on to the horizon (asphalt, lines,
// kerbs), lamp posts along it, trees in the fields, hills far away. roadFrom: z where the main road ends.
function makeLandscape({ roadFrom = -4.2, lane = 1.6, road = true, seed = 7 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  g.add(makeSky());
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), mat("#ffffff", { map: tileTex(grassTex(), 90, 90), roughness: 1, envMapIntensity: 0.3 })); grass.rotation.x = -Math.PI / 2; grass.position.y = 0.001; g.add(grass);
  if (road) {
    const len = 130, zc = roadFrom - len / 2, W = 2 * lane + 0.3;
    // and toward the camera: from the main road's front end (z = 2.9) out of the frame
    const near = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 12), mat("#ffffff", { map: tileTex(asphaltTex(), W / 2, 6), roughness: 0.95 })); near.position.set(0, 0.03, 2.9 + 6); g.add(near);
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.006, 12), mat("#e9e4dc", { roughness: 0.55 })); e.position.set(sx * (lane - 0.05), 0.063, 8.9); g.add(e); const k = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 12), mat("#8f8a84", { roughness: 0.85 })); k.position.set(sx * (lane + 0.23), 0.06, 8.9); g.add(k); }
    for (let z = 3.25; z < 14; z += 0.9) { const dsh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.5), mat("#f2c200", { roughness: 0.55 })); dsh.position.set(0, 0.063, z); g.add(dsh); }
    const asphalt = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, len), mat("#ffffff", { map: tileTex(asphaltTex(), W / 2, len / 2), roughness: 0.95 })); asphalt.position.set(0, 0.03, zc); g.add(asphalt);
    const white = mat("#e9e4dc", { roughness: 0.55 }), concrete = mat("#8f8a84", { roughness: 0.85 });
    for (const sx of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.006, len), white); edge.position.set(sx * (lane - 0.05), 0.063, zc); g.add(edge);
      const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, len), concrete); kerb.position.set(sx * (lane + 0.23), 0.06, zc); g.add(kerb);
      const gravel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, len + 8), mat("#4a4038", { roughness: 1 })); gravel.position.set(sx * (lane + 0.76), 0.01, zc + 4); g.add(gravel);
    }
    const nd = Math.floor(len / 0.9), dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.006, 0.5), mat("#f2c200", { roughness: 0.55 }), nd), d = new THREE.Object3D();
    for (let i = 0; i < nd; i++) { d.position.set(0, 0.063, roadFrom - 0.45 - i * 0.9); d.updateMatrix(); dashes.setMatrixAt(i, d.matrix); } g.add(dashes);
    // lamp posts every 9 units on both sides
    const pm = mat("#6d7074", { metalness: 0.7, roughness: 0.35 }), glow = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd29a").multiplyScalar(1.6), toneMapped: false });
    for (let z = roadFrom - 3; z > roadFrom - 100; z -= 9) for (const sx of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 10), pm); pole.position.set(sx * 3.7, 2.3, z); g.add(pole);
      const armM = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.06), pm); armM.position.set(sx * 3.25, 4.55, z); g.add(armM);
      const head = new THREE.Mesh(rbox(0.36, 0.08, 0.18, 0.02), pm); head.position.set(sx * 2.8, 4.5, z); g.add(head);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.12), glow); bulb.position.set(sx * 2.8, 4.45, z); g.add(bulb);
    }
  }
  // trees in the fields (trunk + clustered canopy), hills on the horizon
  const trunkM = mat("#3a2618", { roughness: 0.9 }), leafM = [mat("#24381e", { roughness: 0.95 }), mat("#2d4422", { roughness: 0.95 }), mat("#1d2e19", { roughness: 0.95 })];
  for (let i = 0; i < 46; i++) {
    const sx = r() < 0.5 ? -1 : 1, x = sx * (6.5 + r() * 40), z = 3 - r() * 95, s = 0.8 + r() * 0.9, tr = new THREE.Group(); tr.position.set(x, 0, z); tr.scale.setScalar(s);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.6, 8), trunkM); trunk.position.y = 0.8; tr.add(trunk);
    for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 + r() * 0.35, 1), leafM[k % 3]); c.position.set((r() - 0.5) * 0.9, 1.9 + r() * 0.7, (r() - 0.5) * 0.9); tr.add(c); }
    g.add(tr);
  }
  for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(30 + r() * 25, 24, 12), mat("#1c2420", { roughness: 1 })); h.scale.y = 0.28 + r() * 0.12; h.position.set(-160 + i * 40 + r() * 15, -4, -120 - r() * 30); g.add(h); }
  return g;
}
// Clothing store: wooden floor, back wall with shelves of folded clothes, two rails of blouses.
function makeStore({ wallZ = -4.4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(51);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), mat("#ffffff", { map: tileTex(woodTex("#7a5236"), 12, 9), roughness: 0.45 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.001, wallZ + 15); g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), mat("#ffffff", { map: tileTex(plasterTex("#2c221e"), 8, 3), roughness: 0.95, envMapIntensity: 0.4 })); wall.position.set(0, 8, wallZ); g.add(wall);
  const cols = ["#c9b8a6", "#7a8a9a", "#a65a4a", "#e8e0d4", "#5a6a4a", "#d49a6a", "#3a4a6a", "#b07aa0"], shelfM = mat("#ffffff", { map: woodTex("#5a3a28"), roughness: 0.5 });
  for (const y of [0.9, 1.9, 2.9]) {
    const sh = new THREE.Mesh(rbox(9, 0.07, 0.6, 0.02), shelfM); sh.position.set(0, y, wallZ + 0.32); g.add(sh);
    for (let x = -4.1; x < 4.2; x += 0.75) { const n = 2 + Math.floor(r() * 3), c = cols[Math.floor(r() * cols.length)]; for (let k = 0; k < n; k++) { const f = new THREE.Mesh(rbox(0.6, 0.12, 0.42, 0.04), mat("#ffffff", { map: fabricTex(c), roughness: 0.9 })); f.position.set(x + (r() - 0.5) * 0.04, y + 0.095 + k * 0.125, wallZ + 0.34); g.add(f); } }
  }
  for (const sx of [-1, 1]) {
    const rail = new THREE.Group(); rail.position.set(sx * 4.3, 0, wallZ + 2.4); rail.rotation.y = -sx * 0.5; g.add(rail);
    const cm = mat("#c9ced3", { metalness: 0.9, roughness: 0.2 });
    for (const px of [-1.3, 1.3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 10), cm); p.position.set(px, 0.95, 0); rail.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.7, 10), cm); bar.rotation.z = Math.PI / 2; bar.position.y = 1.88; rail.add(bar);
    for (let i = 0; i < 5; i++) { const b = makeBlouse(cols[(i * 3 + (sx > 0 ? 1 : 0)) % cols.length]); b.scale.setScalar(0.9); b.position.set(-1.05 + i * 0.52, 1.85 - 0.74, 0.02 * i); b.rotation.y = 1.2; rail.add(b); }
  }
  return g;
}
// Indoor backdrops (desk, office, store, warehouse) fade into the dark a little behind the subject.
function indoorAir(k = 1) { const d = CAM.last.dist; scene.fog.near = d * (1.0 + 0.2 * k); scene.fog.far = d * (2.4 + 0.6 * k) + 4; }
// Dusk lighting for the road scenes: fog in the colour of the horizon, far enough to keep the land.
function duskAir() { floor.visible = false; scene.fog.color.set("#7a3c28"); scene.fog.near = 26; scene.fog.far = 150; hemi.color.set("#ffc9a0"); hemi.groundColor.set("#1a120c"); }

// ---------------------------------------------------------------- local props (this video)
// Places. Hall of records: the modern glass hall (city at night behind the glass, blue LED lines) + bokeh.
function recordHall(S, seed = 6) {
  const hall = makeEraHall([{ x0: -16, x1: 16, kind: "modern" }], { wallZ: -4.2, ceil: 9, front: 14, seed }); S.backdrop(hall.group);
  const bok = makeBokeh({ n: 46, center: [0, 4.5, -9], spread: [26, 9, 4], colors: ["#7fb0ff", "#ffd08a", "#ff8a3c"], seed, opacity: 0.4 }); S.backdrop(bok.group);
  return { update: (t) => { hall.update(t); bok.update(t); floor.visible = false; }, tint: hall.tint };
}
// Clothes shop: shelves of folded clothes, rails, two pendant lamps with their beams, dust in the light.
function shopSet(S, seed = 3) {
  S.backdrop(makeStore({ wallZ: -4.4 }));
  const shafts = [];
  for (const x of [-2.4, 2.4]) {
    const lamp = makePendantLamp({ drop: 1.6, r: 0.34 }); lamp.position.set(x, 6.4, -2.2); S.backdrop(asBackdrop(lamp));
    const sh = makeLightShaft([x, 4.5, -2.2], [x * 0.8, 0.02, 0.6], { w0: 0.5, w1: 2.6, color: "#ffd9a8", opacity: 0.12 }); S.backdrop(asBackdrop(sh.group)); shafts.push(sh);
  }
  const dust = makeDust(140, [[-5, 0.3, -4], [5, 6.5, 2.5]], { seed }); S.backdrop(dust.points);
  return { update: (t) => { dust.update(t); floor.visible = false; }, shafts };
}
// Government office (sets.js): plank floor, windows with blinds and the city at night, archive shelves.
function officeSet(S, seed = 4) {
  const off = makeOfficeSet({ wallZ: -2.6, clear: 3.4, seed }); S.backdrop(off.group);
  return Object.assign({}, off, { update: (t) => { off.update(t); floor.visible = false; } });
}

// Bigger name plate on a photo frame's pedestal (the kit's plate is 0.18 tall): hides the original if any.
function namePlate(fr, text, w) { if (fr.plate) fr.plate.visible = false; const p = makePlate(text, w * 0.62, 0.28, { bg: "#c9a45a", fg: "#1c1410" }); p.position.set(0, 0.16, 0.356); fr.group.add(p); return p; }
// Low sign block with a two-line printed front (makePlate2). Origin: floor centre.
function makeSign2(text, { w = 2.3, h = 0.8, d = 0.3, color = "#3a2a20" } = {}) {
  const g = new THREE.Group(); const b = new THREE.Mesh(rbox(w, h, d, 0.05), mat(color, { roughness: 0.55 })); b.position.y = h / 2; g.add(b);
  const p = makePlate2(text, w * 0.88, h * 0.8, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h / 2, d / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 0.6, d + 0.6)); return g;
}
// Pile of folded T-shirts (fabric slabs with a fold line). Origin: floor centre. Height ≈ 0.13 per shirt.
function makeFoldedShirts(n = 3, colors = ["#3d8ee0", "#e8e0d4", "#c0392b"]) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const c = colors[i % colors.length], m = mat("#ffffff", { map: fabricTex(c), roughness: 0.9 });
    const f = new THREE.Mesh(rbox(0.86, 0.12, 0.62, 0.05), m); f.position.set(Math.sin(i * 2.1) * 0.03, 0.06 + i * 0.13, Math.cos(i * 1.7) * 0.02); f.rotation.y = 0.05 * Math.sin(i * 3); g.add(f);
    const fold = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.012, 0.01), mat("#000000", { transparent: true, opacity: 0.25 })); fold.position.set(f.position.x, 0.06 + i * 0.13, 0.2); g.add(fold);
  }
  g.add(contactShadow(1.2, 0.9)); return g;
}
// Coin column split in two colours: `a` coins below (value that came from before, grey), `b` on top
// (what this step added, gold). Origin: floor centre. API { group, set(ka, kb), height }
function makeTwoToneColumn(a, b, { r = 0.3, t = 0.1, colorA = "#c8ccd2", colorB = "#d9a63c", glowB = false } = {}) {
  const g = new THREE.Group();
  const ca = makeCoinColumn(a, { r, t, seed: a * 7 + 1, material: coinMetalMat(colorA) }); g.add(ca.group);
  const cb = makeCoinColumn(b, { r, t, seed: b * 5 + 3, material: coinMetalMat(colorB, glowB ? { emissive: colorB, emissiveIntensity: 0.35 } : {}) });
  cb.group.position.y = a * t; g.add(cb.group);
  const set = (ka, kb) => { ca.set(ka); cb.set(kb); cb.group.position.y = ca.height(ka); cb.group.visible = kb > 0.001; g.visible = ka > 0.001 || kb > 0.001; };
  return { group: g, set, height: (a + b) * t, t };
}
// Delivery truck facing +z: cab with windscreen, cargo box with an orange band, six wheels. Origin: floor centre.
function makeTruck(s = 1) {
  const g = new THREE.Group(), white = pmat("#eeeae2", { roughness: 0.35, clearcoat: 0.6 });
  const box = new THREE.Mesh(rbox(0.78, 0.82, 1.15, 0.05), white); box.position.set(0, 0.22 + 0.41, -0.25); g.add(box);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.79, 0.12, 1.0), mat(ORANGE, { roughness: 0.5 })); band.position.set(0, 0.5, -0.25); g.add(band);
  const cab = new THREE.Mesh(rbox(0.74, 0.62, 0.5, 0.08), pmat(ORANGE, { roughness: 0.35, clearcoat: 0.8 })); cab.position.set(0, 0.22 + 0.31, 0.6); g.add(cab);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.02), pmat("#1d2a33", { roughness: 0.1, metalness: 0.6 })); glass.position.set(0, 0.66, 0.856); glass.rotation.x = -0.18; g.add(glass);
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.3), pmat("#1d2a33", { roughness: 0.1, metalness: 0.6 })); w.position.set(sx * 0.372, 0.66, 0.62); g.add(w); }
  const bump = new THREE.Mesh(rbox(0.76, 0.12, 0.08, 0.03), mat("#2b2b2b")); bump.position.set(0, 0.26, 0.86); g.add(bump);
  for (const sx of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: "#fff3d0", toneMapped: false })); hl.position.set(sx * 0.26, 0.38, 0.861); g.add(hl); }
  const tyre = mat("#161616", { roughness: 0.8 }), hub = mat("#b8bcc2", { metalness: 0.6, roughness: 0.3 });
  for (const z of [0.6, -0.15, -0.6]) for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 20), tyre); w.rotation.z = Math.PI / 2; w.position.set(sx * 0.36, 0.17, z); g.add(w);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.125, 12), hub); h.rotation.z = Math.PI / 2; h.position.copy(w.position); g.add(h);
  }
  g.add(contactShadow(1.2, 1.9)); g.scale.setScalar(s); return g;
}
// Toll board on its own post (two faces: today / with the IVA, swapped by show(which)). Origin: floor at the post.
function makeTollBoard(a, b, { w = 1.5, h = 0.5, colorA = RED, colorB = GREEN, y = 1.75 } = {}) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, y, 10), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.y = y / 2; g.add(post);
  const back = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.05, 0.02), mat("#2b2b2b")); back.position.y = y + h / 2; g.add(back);
  const pa = makePlate(a, w, h, { bg: colorA, fg: "#ffffff" }); pa.position.set(0, y + h / 2, 0.04); g.add(pa);
  const pb = makePlate(b, w, h, { bg: colorB, fg: "#ffffff" }); pb.position.set(0, y + h / 2, 0.04); g.add(pb);
  const show = (which, k = 1) => { pa.visible = which === 0; pb.visible = which === 1; (which ? pb : pa).scale.setScalar(Math.max(0.0001, k)); };
  show(0); g.add(contactShadow(0.5, 0.5));
  return { group: g, show };
}
// Flat painted band on the road (a "trecho"): emissive strip whose colour and glow change. API { mesh, set(k, color) }
function makeRoadBand(x, z0, z1, w = 0.7) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, z1 - z0 - 0.08), new THREE.MeshStandardMaterial({ color: "#3a332e", emissive: "#000000", roughness: 0.6, transparent: true, opacity: 0.0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.068, (z0 + z1) / 2); m.userData.decor = true;
  const set = (k, color) => { m.material.opacity = 0.85 * k; m.material.color.set(color); m.material.emissive.set(color); m.material.emissiveIntensity = 0.9 * k; m.visible = k > 0.01; };
  set(0, RED); return { mesh: m, set };
}
// Ground number on the road (a plate lying flat, text up). Origin: on the road surface.
function groundMark(text, w, h, bg, fg = "#ffffff") { const p = makePlate(text, w, h, { bg, fg, depth: 0.01 }); p.rotation.x = -Math.PI / 2; p.position.y = 0.07; return p; }
// Grid of small price tags with "IVA" printed (a wall of countries using the tax); light(t) lights them in a wave.
// Origin: bottom centre of the board. API { group, light(k) } (k 0..1 = share of tags lit)
function makeTagWall(cols = 7, rows = 5, { w = 0.46, h = 0.26, gap = 0.1 } = {}) {
  const g = new THREE.Group(), W = cols * (w + gap) + gap, H = rows * (h + gap) + gap;
  const board = new THREE.Mesh(rbox(W, H, 0.06, 0.03), mat("#2a1f19", { roughness: 0.8 })); board.position.y = H / 2 + 0.3; g.add(board);
  const legs = mat("#4a3424"); for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3 + H, 0.08), legs); l.position.set(sx * (W / 2 - 0.2), (0.3 + H) / 2, -0.07); g.add(l); }
  const tags = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const p = makePlate("IVA", w, h, { bg: "#3a2f28", fg: "#8a7b70", detail: true });
    p.position.set(-W / 2 + gap + w / 2 + c * (w + gap), 0.3 + H - gap - h / 2 - r * (h + gap), 0.05); g.add(p);
    const on = makePlate("IVA", w, h, { bg: ORANGE, fg: "#ffffff", detail: true }); on.position.copy(p.position); on.position.z += 0.004; on.visible = false; g.add(on);
    tags.push({ on, order: (c + r * 0.6) / (cols + rows * 0.6) });
  }
  const light = (k) => tags.forEach((tg) => { tg.on.visible = k > tg.order; });
  g.add(contactShadow(W + 0.4, 0.8));
  return { group: g, light, W, H: H + 0.3 };
}
// 3D arrow pointing up (shaft + head), red, standing on a small foot. Origin: floor centre.
function makeUpArrow(h = 1.4, color = RED) {
  const g = new THREE.Group(), m = mat(color, { emissive: color, emissiveIntensity: 0.25, roughness: 0.45 });
  const shaft = new THREE.Mesh(rbox(0.26, h * 0.62, 0.2, 0.04), m); shaft.position.y = 0.06 + h * 0.31; g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.34, h * 0.38, 4), m); head.rotation.y = Math.PI / 4; head.position.y = 0.06 + h * 0.62 + h * 0.19; g.add(head);
  const foot = new THREE.Mesh(rbox(0.5, 0.06, 0.4, 0.02), mat("#2b2b2b")); foot.position.y = 0.03; g.add(foot);
  g.add(contactShadow(0.8, 0.7)); return g;
}
// Shopping bag (paper, handles) with rice, beans and a milk carton sticking out. Origin: floor centre.
function makeGroceryBag(s = 1) {
  const g = new THREE.Group();
  const bag = new THREE.Mesh(rbox(1.0, 1.0, 0.6, 0.03), mat("#c79b6a", { roughness: 0.9 })); bag.position.y = 0.5; g.add(bag);
  const fold = new THREE.Mesh(rbox(1.02, 0.08, 0.62, 0.02), mat("#b58958", { roughness: 0.9 })); fold.position.y = 0.97; g.add(fold);
  for (const sx of [-1, 1]) { const hd = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 20, Math.PI), mat("#8a6440")); hd.position.set(sx * 0.27, 1.0, 0); g.add(hd); }
  const rice = makeFoodBag("ARROZ", { s: 0.62 }); rice.position.set(-0.22, 0.78, 0.02); rice.rotation.z = 0.12; g.add(rice);
  const beans = makeFoodBag("FEIJÃO", Object.assign({ s: 0.56 }, BEANS)); beans.position.set(0.12, 0.74, -0.08); beans.rotation.z = -0.1; g.add(beans);
  const milk = new THREE.Group(); milk.position.set(0.3, 0.7, 0.06); g.add(milk);
  const carton = new THREE.Mesh(rbox(0.24, 0.6, 0.24, 0.02), mat("#f4f1ea")); carton.position.y = 0.3; milk.add(carton);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.14, 4), mat("#f4f1ea")); roof.rotation.y = Math.PI / 4; roof.position.y = 0.67; milk.add(roof);
  const lbl = new THREE.Mesh(new THREE.BoxGeometry(0.245, 0.2, 0.245), mat("#3d7fd0")); lbl.position.y = 0.3; milk.add(lbl);
  [rice, beans].forEach((o) => o.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; }));
  g.add(contactShadow(1.4, 1.0)); g.scale.setScalar(s); return g;
}

// ---------------------------------------------------------------- 1. gancho (0 – 3.90)
// "Começa em janeiro: o Brasil vai ter o maior IVA do mundo."
addScene("gancho", 0, 3.90, (S) => {
  const set = recordHall(S, 6);
  const steps = [[0.72, 1.1, "1º"], [-0.72, 0.7, "2º"]].map(([x, h, l]) => { const p = makePlinth({ w: 1.4, h, d: 1.1, color: "#2a2420", label: l, plateH: 0.6 }); p.group.position.x = x; S.add(p.group); return p; });
  const hu = makeBlock("HUNGRIA", { w: 1.32, h: 0.8, d: 0.62, color: "#7e1a1d", ph: 0.6 }); S.add(hu);
  const br = makeBlock("BRASIL", { w: 1.32, h: 0.86, d: 0.64, color: "#1f6b43", fg: "#f5c400", ph: 0.6 }); S.add(br);
  steps.forEach((p, i) => { S.hero(p.group, ["degrau 1º", "degrau 2º"][i]); S.solid(p.group, "degrau " + i); });
  S.hero(hu, "bloco HUNGRIA"); S.hero(br, "bloco BRASIL", { when: (t) => t > 2.7 });
  S.solid(hu, "hungria", { restsOn: ["degrau 0", "degrau 1"] }); S.solid(br, "brasil", { restsOn: ["degrau 0"] });
  const top0 = new V3(0.72, 1.1, 0), top1 = new V3(-0.72, 0.7, 0);
  const anim = (t) => {
    const k = sm(t, 1.6, 2.2); hu.position.copy(hop(top0, top1, k, 0.9)); hu.rotation.z = 0.25 * Math.sin(Math.PI * k);
    const d = eOut(lin(t, 2.3, 2.72)), b = t > 2.72 ? Math.sin(clamp((t - 2.72) / 0.3) * Math.PI) * 0.1 : 0;
    br.visible = t > 2.25; br.position.set(0.72, 1.1 + 3.0 * (1 - d) + b, 0); br.rotation.y = 0.5 * (1 - d) + 0.05 * Math.sin(t * 1.5);
  };
  const cam = moveBox(unionBox(envelope([...steps.map((p) => p.group), hu], anim, 0, 3.9), envelope([br], anim, 2.75, 3.9)), 0, 3.9, "push", { from: [0.18, 0.28, 1], pull0: 1.12, pull: 1.0 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0.7, 3.2, 1.6); fill.intensity = 1.0 + 3.0 * sm(t, 2.5, 2.8);
    CAM.apply(CAM.shake(cam(t), t, 2.72, 0.22, 0.35));
  };
});

// ---------------------------------------------------------------- 2. camiseta (3.90 – 14.50)
// "Imagina: você compra uma camiseta. No preço, tem imposto do algodão, do tecido, da loja... e parte é
//  cobrada em cima de imposto. Quanto? A etiqueta não mostra."
addScene("camiseta", 3.90, 14.50, (S) => {
  const set = shopSet(S, 3);
  const stand = makeShirtStand("#3d8ee0", 1.55); stand.position.set(-1.05, 0, 0); S.add(stand);
  const sign = makePriceSign("R$ 100", "?", { w: 1.2, h: 0.62, stick: 2.25, colorA: ORANGE, colorB: RED }); sign.group.position.set(0.2, 0, -0.35); S.add(sign.group);
  const pl = makePlinth({ w: 1.6, h: 0.22, d: 0.9, color: "#3a2a20" }); pl.group.position.set(1.4, 0, 0.45); S.add(pl.group);
  const names = ["ALGODÃO", "TECIDO", "LOJA", "IMPOSTO"], at = [7.6, 8.3, 9.2, 10.85];
  const blocks = names.map((n, i) => { const b = makeBlock(n, { w: 1.45, h: 0.38, d: 0.62, color: i === 3 ? RED : ORANGE, ph: 0.76 }); S.add(b); return b; });
  S.hero(stand, "camiseta no cabide"); S.hero(sign.group, "placa de preço"); S.solid(pl.group, "base");
  blocks.forEach((b, i) => { S.hero(b, "bloco " + names[i], { when: (t) => t > at[i] + 0.35 && t < 13.2 }); S.solid(b, "bloco " + i, { restsOn: [i ? "bloco " + (i - 1) : "base"], when: (t) => t < 13.05 }); });
  const sparks = makeSparks(40, 5); S.add(sparks);
  const anim = (t) => {
    stand.rotation.y = 0.45 * Math.sin(t * 1.4); sign.card.rotation.z = 0.05 * Math.sin(t * 2.1);
    const gone = sm(t, 13.1, 13.6);
    blocks.forEach((b, i) => {
      const k = eOut(lin(t, at[i], at[i] + 0.35)), y = 0.22 + i * 0.38;
      b.visible = t > at[i] && gone < 0.99; b.position.set(1.4, y + 1.6 * (1 - k), 0.45);
      b.scale.setScalar(Math.max(0.0001, 1 - gone)); b.rotation.y = 0.04 * Math.sin(t * 2 + i);
    });
    sign.flip(sm(t, 12.45, 12.8) * (1 - sm(t, 13.95, 14.3)));
    updateSparks(sparks, t, 10.95, new V3(1.4, 1.5, 0.75));
  };
  const all = [stand, sign.group, pl.group, ...blocks];
  const cam = moveBox(unionBox(envelope([stand, sign.group, pl.group], anim, 3.9, 14.5), envelope(blocks, anim, 11.3, 12.9)), 3.9, 14.5, "orbit", { from: [0.1, 0.32, 1], deg: 50 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(t < 10.8 ? ORANGE : RED); fill.position.set(1.0, 2.6, 1.8); fill.intensity = 1.6 + 1.5 * beat(t, 10.85, 0.6);
    CAM.apply(CAM.shake(cam(t), t, 10.95, 0.15, 0.3)); indoorAir();
  };
});

// ---------------------------------------------------------------- 3. iva (14.50 – 21.55)
// "O IVA vem pra acabar com isso: imposto sobre valor agregado, usado em mais de cento e setenta países."
addScene("iva", 14.50, 21.55, (S) => {
  const set = shopSet(S, 9);
  const pl = makePlinth({ w: 2.0, h: 0.5, d: 1.1, color: "#2a2420" }); pl.group.position.set(0, 0, 0.9); S.add(pl.group);
  const iva = makeBlock("IVA", { w: 1.7, h: 1.0, d: 0.7, color: ORANGE, ph: 0.62 }); S.add(iva);
  const wall = makeTagWall(7, 5); wall.group.position.set(0, 0, -0.6); S.add(wall.group);
  S.hero(pl.group, "pedestal"); S.hero(iva, "bloco IVA", { when: (t) => t > 15.0 }); S.hero(wall.group, "parede de etiquetas IVA");
  S.solid(pl.group, "pedestal"); S.solid(iva, "iva", { restsOn: ["pedestal"] });
  const anim = (t) => {
    const k = eOut(lin(t, 14.62, 14.98)), b = t > 14.98 ? Math.sin(clamp((t - 14.98) / 0.3) * Math.PI) * 0.1 : 0;
    iva.visible = t > 14.55; iva.position.set(0, 0.5 + 3.0 * (1 - k) + b, 0.9); iva.rotation.y = 0.35 * (1 - k) + 0.3 * Math.sin(t * 0.9);
    wall.light(lin(t, 19.1, 21.0));
  };
  const cam = moveBox(unionBox(envelope([pl.group, wall.group], anim, 14.5, 21.55), envelope([iva], anim, 15.3, 21.55)), 14.5, 21.55, "reveal", { from: [-0.12, 0.3, 1], pull0: 1.2 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.6, 2.2); fill.intensity = 1.4 + 2.0 * beat(t, 14.95, 0.6) + 1.2 * sm(t, 19.1, 21.0);
    CAM.apply(CAM.shake(cam(t), t, 14.98, 0.18, 0.3)); indoorAir();
  };
});

// ---------------------------------------------------------------- 4. pedagio (21.55 – 29.90) — a analogia
// "Pensa num pedágio. Hoje, é como se algumas praças cobrassem de novo a estrada inteira.
//  Com o IVA, cada praça cobra só o seu trecho."
// The road runs along z; three toll plazas at G; the trechos 1–3 are painted bands on the left lane.
// Today (truck 1): at plaza i the bands 1..i light red (it charges the whole road again).
// With the IVA (truck 2): at plaza i only band i lights green.
addScene("pedagio", 21.55, 29.90, (S) => {
  S.backdrop(makeLandscape({ roadFrom: -5.4, lane: 1.0 }));
  const clouds = makeClouds(); S.backdrop(clouds.group);
  const road = makeTwoLaneRoad({ lane: 1.0, back: 5.4, front: 2.9 }); S.add(road.group);
  const G = [-2.9, -0.6, 1.7], segs = [[-5.2, -2.9], [-2.9, -0.6], [-0.6, 1.7]];
  const gates = G.map((z) => { const g = makeTollGate({ arm: 0.95, side: -1, board: false }); g.group.position.set(1.5, 0, z); S.add(g.group); return g; });
  const boards = G.map((z, i) => { const b = makeTollBoard(["1", "1+2", "1+2+3"][i], String(i + 1), { w: 1.6, h: 0.72, y: 1.5 }); b.group.position.set(2.5, 0, z - 0.35); S.add(b.group); return b; });
  const bands = segs.map(([a, b]) => { const bd = makeRoadBand(-0.5, a, b); S.add(bd.mesh); return bd; });
  const marks = segs.map(([a, b], i) => { const m = groundMark(String(i + 1), 0.8, 0.8, "#141414"); m.position.set(-0.5, m.position.y, (a + b) / 2); S.add(m); return m; });
  const truck = makeTruck(0.9); truck.position.x = 0.5; S.add(truck);
  gates.forEach((g, i) => S.hero(g.group, "cancela de pedágio " + (i + 1)));
  boards.forEach((b, i) => S.hero(b.group, "placa da praça " + (i + 1)));
  S.hero(road.group, "estrada com três trechos"); S.hero(truck, "caminhão de entrega", { when: (t) => (t > 22.0 && t < 26.2) || (t > 27.0 && t < 29.6) });
  // truck 1: z -7.6 → 3.3 over 21.7–26.4; truck 2: 26.75–29.85 (faster)
  const tz = (t) => (t < 26.55 ? lerp(-5.6, 3.0, lin(t, 21.7, 26.4)) : lerp(-5.6, 3.0, lin(t, 26.75, 29.85)));
  const passAt = (z, t0, t1) => t0 + (t1 - t0) * (z + 5.6) / 8.6;
  const T1 = G.map((z) => passAt(z, 21.7, 26.4)), T2 = G.map((z) => passAt(z, 26.75, 29.85));
  const pulse = (t, at) => sm(t, at, at + 0.15) * (1 - sm(t, at + 0.85, at + 1.05));
  const anim = (t) => {
    const z = tz(t), first = t < 26.55, t0 = first ? 21.6 : 26.7;
    const tk = Math.min(eOut(lin(t, t0, t0 + 0.3)), first ? 1 - sm(t, 26.2, 26.45) : 1), vis = t > t0 && tk > 0.01;
    truck.position.z = z; truck.visible = vis; truck.scale.setScalar(0.9 * Math.max(0.0001, tk));
    gates.forEach((g, i) => { const dz = z - G[i]; g.set(vis ? sm(dz, -1.9, -1.35) * (1 - sm(dz, 1.0, 1.5)) : 0); g.lamp.material.emissiveIntensity = 0.6 + 0.8 * (Math.sin(t * 6 + i) > 0 ? 1 : 0); });
    const iva = t > 26.72;
    boards.forEach((b, i) => b.show(iva ? 1 : 0, 1 + 0.12 * pulse(t, iva ? T2[i] : T1[i])));
    bands.forEach((bd, j) => {
      if (!iva) { let k = 0; for (let i = j; i < 3; i++) k = Math.max(k, pulse(t, T1[i])); bd.set(k, RED); }
      else bd.set(pulse(t, T2[j]), GREEN);
    });
    clouds.update(t);
  };
  const pathBox = [[-1.3, 0, -5.45], [3.3, 2.3, 2.95]];
  const cam = moveOf(anim)([pathBox, ...gates.map((g) => g.group), ...boards.map((b) => b.group)], 21.55, 29.9, "truck", { from: [-0.5, 0.62, 1], side: 0.3 });
  return (t) => {
    anim(t); duskAir();
    fill.color.set(t < 26.72 ? RED : GREEN); fill.position.set(0, 3, tz(t)); fill.intensity = 1.2;
    CAM.apply(cam(t));
  };
});

// ---------------------------------------------------------------- 5. cadeia (29.90 – 35.66)
// "A confecção paga só pelo que acrescentou ao tecido; a loja, só pelo que acrescentou à camiseta."
// Coin columns: grey = value that came from before, gold = what this step added; the red ring marks
// where the tax falls (only on the gold).
addScene("cadeia", 29.90, 35.66, (S) => {
  const set = shopSet(S, 21);
  const xs = [-1.05, 1.05], labels = ["CONFECÇÃO", "LOJA"];
  const pls = xs.map((x, i) => { const p = makePlinth({ w: 1.95, h: 0.5, d: 1.1, color: "#2a2420", label: labels[i], plateH: 0.62 }); p.group.position.x = x; S.add(p.group); return p; });
  const shirt = makeFoldedShirts(3); shirt.position.set(-1.45, 0.5, 0.05); S.add(shirt);
  const stand = makeShirtStand("#3d8ee0", 0.85); stand.position.set(0.62, 0.5, 0); S.add(stand);
  const cols = [makeTwoToneColumn(6, 4, { glowB: true, t: 0.1, r: 0.36 }), makeTwoToneColumn(10, 4, { glowB: true, t: 0.1, r: 0.36 })];
  cols.forEach((c, i) => { c.group.position.set(xs[i] + 0.5, 0.5, 0); S.add(c.group); });
  const rings = cols.map((c, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.04, 10, 40), mat(RED, { emissive: RED, emissiveIntensity: 0.6 })); r.rotation.x = Math.PI / 2; S.add(r); return r; });
  const A = [[29.95, 31.0, 32.0], [33.05, 34.3, 35.1]]; // grey in, gold grows, ring on
  pls.forEach((p, i) => { S.hero(p.group, "pedestal " + labels[i]); S.solid(p.group, "pedestal " + i); });
  S.hero(shirt, "camisetas dobradas"); S.solid(shirt, "camisetas", { restsOn: ["pedestal 0"] }); S.hero(stand, "camiseta no cabide", { when: (t) => t > 33.2 });
  cols.forEach((c, i) => S.hero(c.group, "coluna de moedas " + (i + 1), { when: (t) => t > A[i][0] + 0.4 }));
  const anim = (t) => {
    popIn(shirt, t, 29.92, 0.4); popIn(stand, t, 32.95, 0.4, 0.85);
    cols.forEach((c, i) => {
      const [a0, b0, r0] = A[i]; c.set(lin(t, a0, a0 + 0.6), lin(t, b0, b0 + 0.7));
      const ry = 0.5 + c.t * ((i ? 10 : 6) + 2);
      rings[i].position.set(xs[i] + 0.5, ry, 0); rings[i].visible = t > r0; rings[i].scale.setScalar(Math.max(0.0001, pop(t, r0, 0.35)));
    });
  };
  const cam = moveOf(anim)([...pls.map((p) => p.group), shirt, stand, ...cols.map((c) => c.group)], 29.9, 35.66, "truck", { from: [-0.05, 0.35, 1], side: 0.35 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(GOLD); fill.position.set(t < 32.9 ? -1.2 : 1.2, 2.6, 1.8); fill.intensity = 1.6;
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 6. nota (35.66 – 39.28)
// "No fim, o imposto aparece uma vez só: na sua nota."
addScene("nota", 35.66, 39.28, (S) => {
  const set = shopSet(S, 33);
  const counter = makePlinth({ w: 2.4, h: 0.9, d: 1.3, color: "#3a2a20" }); S.add(counter.group);
  const pr = makeReceiptPrinter([{ text: "CAMISETA", h: 0.2 }, { text: "IMPOSTO", h: 0.24, bg: ORANGE, fg: "#ffffff" }, { text: "TOTAL", h: 0.2 }], { w: 1.0 });
  pr.group.position.set(0, counter.top, 0.05); S.add(pr.group);
  S.hero(counter.group, "balcão"); S.hero(pr.group, "impressora de nota fiscal");
  S.solid(counter.group, "balcão"); S.solid(pr.group, "impressora", { restsOn: ["balcão"] });
  const anim = (t) => { pr.setLength(pr.full * eOut(lin(t, 36.2, 38.4))); };
  const cam = moveOf(anim)([counter.group, pr.group], 35.66, 39.28, "crane", { from: [0.2, 0.5, 1], rise: 0.25 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.8, 1.6); fill.intensity = 1.4 + 1.6 * sm(t, 37.6, 38.2);
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 7. virada (39.28 – 45.02)
// "Em janeiro, PIS e Cofins acabam e entra a CBS, a parte federal do IVA:"
addScene("virada", 39.28, 45.02, (S) => {
  const off = officeSet(S, 4);
  const cal = makeDeskCalendar(); cal.group.position.set(-1.45, 0, 0); S.add(cal.group);
  const pl = makePlinth({ w: 2.45, h: 0.75, d: 1.1, color: "#2a2420", label: "PARTE FEDERAL", plateH: 0.66 }); pl.group.position.set(1.15, 0, 0.1); S.add(pl.group);
  const pis = makeBlock("PIS", { w: 0.95, h: 0.75, d: 0.6, color: GREY, ph: 0.56 }); pis.position.set(0.5, 0.75, 0.1); S.add(pis);
  const cof = makeBlock("COFINS", { w: 1.15, h: 0.75, d: 0.6, color: GREY, ph: 0.56 }); cof.position.set(1.78, 0.75, 0.1); S.add(cof);
  const cbs = makeBlock("CBS", { w: 1.9, h: 0.95, d: 0.7, color: ORANGE, ph: 0.6 }); S.add(cbs);
  const sparks = [makeSparks(40, 3), makeSparks(40, 9)]; sparks.forEach((s) => S.add(s));
  S.hero(cal.group, "calendário de mesa"); S.hero(pl.group, "pedestal PARTE FEDERAL"); S.solid(pl.group, "pedestal");
  S.hero(pis, "bloco PIS", { when: (t) => t < 40.9 }); S.hero(cof, "bloco COFINS", { when: (t) => t < 40.9 }); S.hero(cbs, "bloco CBS", { when: (t) => t > 42.2 });
  S.solid(pis, "pis", { restsOn: ["pedestal"] }); S.solid(cof, "cofins", { restsOn: ["pedestal"] }); S.solid(cbs, "cbs", { restsOn: ["pedestal"] });
  const anim = (t) => {
    const k = sm(t, 39.35, 39.8); if (k <= 0) cal.setPage("DEZ 2026", "31"); else cal.setPage("JAN 2027", "1º"); cal.flip(k, ["DEZ 2026", "31"]);
    const gone = sm(t, 40.95, 41.35);
    [pis, cof].forEach((b, i) => { b.visible = gone < 0.99; b.scale.setScalar(Math.max(0.0001, 1 - gone)); b.rotation.y = 0.05 * Math.sin(t * 2 + i); });
    updateSparks(sparks[0], t, 41.0, new V3(0.5, 1.1, 0.3)); updateSparks(sparks[1], t, 41.1, new V3(1.78, 1.1, 0.3));
    const d = eOut(lin(t, 41.75, 42.1)), b = t > 42.1 ? Math.sin(clamp((t - 42.1) / 0.3) * Math.PI) * 0.1 : 0;
    cbs.visible = t > 41.7; cbs.position.set(1.15, 0.75 + 2.8 * (1 - d) + b, 0.1); cbs.rotation.y = 0.3 * (1 - d);
  };
  const cam = moveBox(unionBox(envelope([cal.group, pl.group, pis, cof], anim, 39.28, 45.02), envelope([cbs], anim, 42.5, 45.02)), 39.28, 45.02, "drop", { from: [0.1, 0.5, 1], rise: 0.25 });
  return (t) => {
    anim(t); off.update(t); off.lights(0.4);
    fill.color.set(ORANGE); fill.position.set(1.1, 2.6, 1.8); fill.intensity = 1.4 + 2.2 * beat(t, 42.05, 0.6);
    CAM.apply(CAM.shake(cam(t), t, 42.1, 0.2, 0.3)); indoorAir();
  };
});

// ---------------------------------------------------------------- 8. tcu (45.02 – 48.28)
// "onze vírgula três por cento, pela conta do TCU." (foto real no porta-retrato)
addScene("tcu", 45.02, 48.28, (S) => {
  const off = officeSet(S, 11);
  const fr = makePhotoFrame("tcu", { w: 2.8 }); namePlate(fr, "TCU", 2.8); S.add(fr.group);
  S.hero(fr.group, "porta-retrato TCU");
  const anim = (t) => { fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, 45.02, 45.5))); fr.zoom(1 + 0.14 * lin(t, 45.02, 48.28)); };
  const cam = moveOf(anim)([fr.group], 45.02, 48.28, "orbit", { from: [0.0, 0.12, 1], deg: 26 });
  return (t) => { anim(t); off.update(t); fill.color.set(ORANGE); fill.position.set(0, 2.4, 2.0); fill.intensity = 1.2; CAM.apply(cam(t)); indoorAir(); };
});

// ---------------------------------------------------------------- 9. senado (48.28 – 50.06)
// "Falta o Senado confirmar." (foto real no porta-retrato)
addScene("senado", 48.28, 50.06, (S) => {
  const off = officeSet(S, 17);
  const fr = makePhotoFrame("senado", { w: 2.8 }); namePlate(fr, "SENADO", 2.8); S.add(fr.group);
  S.hero(fr.group, "porta-retrato Senado");
  const anim = (t) => { fr.frame.rotation.y = -1.2 * (1 - eOut(lin(t, 48.28, 48.7))); fr.zoom(1 + 0.12 * lin(t, 48.28, 50.06)); };
  const cam = moveOf(anim)([fr.group], 48.28, 50.06, "push", { from: [-0.1, 0.12, 1], pull0: 1.25 });
  return (t) => { anim(t); off.update(t); fill.color.set(BLUE); fill.position.set(0, 2.4, 2.0); fill.intensity = 1.0; CAM.apply(cam(t)); indoorAir(); };
});

// ---------------------------------------------------------------- 10. estados (50.06 – 54.84)
// "Estados e cidades entram aos poucos, de 2029 a 2033."
// Three coin columns: CBS (fixed), ICMS + ISS (falls 10% a year from 2029, gone in 2033), IBS (grows).
addScene("estados", 50.06, 54.84, (S) => {
  const off = officeSet(S, 23);
  const pl = makePlinth({ w: 4.2, h: 0.45, d: 1.2, color: "#2a2420" }); S.add(pl.group);
  const xs = [-1.35, 0, 1.35], names = ["CBS", "ICMS+ISS", "IBS"];
  const plates = names.map((n, i) => { const p = makePlate(n, 1.2, 0.3, { bg: "#141414", fg: "#ffffff" }); p.position.set(xs[i], 0.225, 0.616); pl.group.add(p); return p; });
  const mk = (n, color, seed) => makeCoinColumn(n, { r: 0.42, t: 0.11, seed, material: coinMetalMat(color) });
  const cbs = mk(9, "#d9a63c", 3), old = mk(16, "#c8ccd2", 5), ibs = mk(16, "#5a8fd0", 7);
  [cbs, old, ibs].forEach((c, i) => { c.group.position.set(xs[i], 0.45, 0); S.add(c.group); });
  S.hero(pl.group, "pedestal com três colunas"); S.hero(cbs.group, "coluna CBS"); S.hero(old.group, "coluna ICMS+ISS", { when: (t) => t < 53.9 }); S.hero(ibs.group, "coluna IBS", { when: (t) => t > 52.8 });
  const steps = [52.62, 52.95, 53.3, 53.62, 53.98]; // 2029 … 2033
  const anim = (t) => {
    let n = 0; for (const s of steps) if (t > s) n++;
    const share = [1, 0.9, 0.8, 0.7, 0.6, 0][n];
    cbs.set(lin(t, 50.1, 50.6)); old.set(share * lin(t, 50.1, 50.6)); ibs.set(n === 0 ? 0.07 * lin(t, 50.6, 51.0) : 1 - share); ibs.group.visible = t > 50.6;
  };
  const cam = moveOf(anim)([pl.group, cbs.group, old.group, ibs.group], 50.06, 54.84, "orbit", { from: [0.05, 0.4, 1], deg: 30 });
  return (t) => {
    anim(t); off.update(t); off.lights(0.4);
    fill.color.set(BLUE); fill.position.set(0, 2.6, 1.8); fill.intensity = 1.3 + 0.8 * beat(t, 53.98, 0.5);
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 11. soma (54.84 – 59.58)
// "Somando tudo, as estimativas vão de vinte e oito a trinta por cento."
// One coin = one point: 28 gold coins, then 2 glowing orange ones (the top of the estimate).
addScene("soma", 54.84, 59.58, (S) => {
  const set = recordHall(S, 12);
  const pl = makePlinth({ w: 1.7, h: 0.4, d: 1.3, color: "#2a2420", label: "BRASIL", plateH: 0.6 }); S.add(pl.group);
  const col = makeTwoToneColumn(28, 2, { r: 0.5, t: 0.065, colorA: "#d9a63c", colorB: ORANGE, glowB: true }); col.group.position.y = 0.4; S.add(col.group);
  const sparks = makeSparks(50, 13); S.add(sparks);
  S.hero(pl.group, "pedestal BRASIL"); S.hero(col.group, "coluna de moedas", { when: (t) => t > 55.3 });
  const anim = (t) => { col.set(lin(t, 54.9, 58.0), lin(t, 58.15, 58.7)); updateSparks(sparks, t, 58.6, new V3(0, 0.4 + 30 * 0.065, 0.2)); };
  const cam = moveOf(anim)([pl.group, col.group], 54.84, 59.58, "crane", { from: [0.18, 0.45, 1], rise: 0.3, pull: 1.0 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0, 3.0, 1.8); fill.intensity = 1.4 + 2.0 * beat(t, 58.4, 0.7);
    CAM.apply(CAM.shake(cam(t), t, 58.6, 0.07, 0.3));
  };
});

// ---------------------------------------------------------------- 12. hungria (59.58 – 63.12)
// "A Hungria, recordista mundial, cobra vinte e sete." (foto real no porta-retrato + as duas colunas)
addScene("hungria", 59.58, 61.02, (S) => {
  const set = recordHall(S, 18);
  const fr = makePhotoFrame("hungria", { w: 3.0 }); namePlate(fr, "HUNGRIA", 3.0); S.add(fr.group);
  S.hero(fr.group, "porta-retrato Parlamento húngaro");
  const anim = (t) => { fr.frame.rotation.y = 1.0 * (1 - eOut(lin(t, 59.58, 60.05))); fr.zoom(1 + 0.12 * lin(t, 59.58, 61.02)); };
  const cam = moveOf(anim)([fr.group], 59.58, 61.02, "push", { from: [0.12, 0.14, 1], pull0: 1.2 });
  return (t) => { anim(t); set.update(t); fill.color.set(ORANGE); fill.position.set(0, 2.6, 2.0); fill.intensity = 1.2; CAM.apply(cam(t)); };
});

// ---------------------------------------------------------------- 12b. ranking (61.02 – 63.12)
// "... cobra vinte e sete." (as duas colunas: Hungria 27, Brasil 28 a 30)
addScene("ranking", 61.02, 63.12, (S) => {
  const set = recordHall(S, 19);
  const mkCol = (x, label, a, b, colorA, colorB) => {
    const p = makePlinth({ w: 1.3, h: 0.45, d: 1.1, color: "#2a2420", label, plateH: 0.7 }); p.group.position.x = x; S.add(p.group);
    const c = makeTwoToneColumn(a, b, { r: 0.45, t: 0.065, colorA, colorB, glowB: true }); c.group.position.set(x, 0.45, 0); S.add(c.group);
    return { p, c };
  };
  const hu = mkCol(-0.72, "HUNGRIA", 27, 0, "#b8463a", "#b8463a"), br = mkCol(0.72, "BRASIL", 28, 2, "#d9a63c", ORANGE);
  S.hero(hu.p.group, "pedestal HUNGRIA"); S.hero(br.p.group, "pedestal BRASIL");
  S.hero(hu.c.group, "coluna HUNGRIA", { when: (t) => t > 61.5 }); S.hero(br.c.group, "coluna BRASIL");
  const anim = (t) => { hu.c.set(0.6 + 0.4 * lin(t, 61.05, 61.9), 0); br.c.set(1, 1); };
  const cam = moveOf(anim)([hu.p.group, hu.c.group, br.p.group, br.c.group], 61.02, 63.12, "orbit", { from: [0.05, 0.22, 1], deg: 24 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0, 3, 1.8); fill.intensity = 1.3 + 1.2 * beat(t, 62.1, 0.6);
    CAM.apply(cam(t));
  };
});

// ---------------------------------------------------------------- 13. excecoes (63.12 – 72.84)
// "Por que tão alto? Exceções. Só a cesta básica com imposto zero empurra a parte federal quase três
//  pontos pra cima. Quem paga cheio cobre a diferença."
addScene("excecoes", 63.12, 72.84, (S) => {
  const set = shopSet(S, 41);
  const xs = [-1.5, 0.2, 1.85];
  const pA = makePlinth({ w: 1.7, h: 0.65, d: 1.1, color: "#2a2420" }); pA.group.position.x = xs[0]; S.add(pA.group);
  const pAl = makePlate2("CESTA\nBÁSICA", 1.45, 0.56, { bg: "#141414", fg: "#ffffff" }); pAl.position.set(0, 0.325, 0.566); pA.group.add(pAl);
  const bag = makeGroceryBag(1.25); bag.position.set(xs[0], 0.65, 0); S.add(bag);
  const seal = makePlate("0%", 0.7, 0.42, { bg: GREEN, fg: "#ffffff", depth: 0.015 }); seal.position.set(0, 0.4, 0.31); seal.rotation.z = -0.08; bag.add(seal);
  const pB = makePlinth({ w: 1.3, h: 0.65, d: 1.1, color: "#2a2420", label: "CBS", plateH: 0.66 }); pB.group.position.x = xs[1]; S.add(pB.group);
  const col = makeTwoToneColumn(13, 4, { r: 0.42, t: 0.1, colorA: "#d9a63c", colorB: ORANGE, glowB: true }); col.group.position.set(xs[1], 0.65, 0); S.add(col.group);
  const pC = makePlinth({ w: 1.6, h: 0.65, d: 1.1, color: "#2a2420", label: "PAGA CHEIO", plateH: 0.66 }); pC.group.position.x = xs[2]; S.add(pC.group);
  const stand = makeShirtStand("#3d8ee0", 1.25); stand.position.set(xs[2], 0.65, 0); S.add(stand);
  [pA, pB, pC].forEach((p, i) => { S.hero(p.group, ["pedestal CESTA BÁSICA", "pedestal CBS", "pedestal PAGA CHEIO"][i]); S.solid(p.group, "pedestal " + i); });
  S.hero(bag, "sacola de compras"); S.solid(bag, "sacola", { restsOn: ["pedestal 0"] });
  S.hero(col.group, "coluna de moedas CBS"); S.hero(stand, "camiseta no cabide", { when: (t) => t > 71.0 });
  pC.group.visible = false;
  const anim = (t) => {
    seal.visible = t > 67.05; seal.scale.setScalar(1 + 0.9 * (1 - eOut(lin(t, 67.05, 67.25))));
    col.set(lin(t, 63.2, 63.8), lin(t, 67.6, 70.2));
    popIn(stand, t, 70.8, 0.4, 1.25); popIn(pC.group, t, 70.7, 0.35); stand.rotation.y = 0.15 * Math.sin(t * 1.1);
  };
  const cam = moveOf(anim)([pA.group, bag, pB.group, col.group, pC.group, stand], 63.12, 72.84, "truck", { from: [-0.05, 0.32, 1], side: 0.4 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(t < 67.0 ? ORANGE : t < 70.7 ? GREEN : RED); fill.position.set(t < 67.0 ? xs[1] : t < 70.7 ? xs[0] : xs[2], 2.6, 1.8); fill.intensity = 1.5 + 1.5 * beat(t, 67.05, 0.5);
    CAM.apply(CAM.shake(cam(t), t, 67.1, 0.12, 0.3)); indoorAir();
  };
});

// ---------------------------------------------------------------- 14. neutra (72.84 – 77.24)
// "Mas a conta foi feita pra arrecadar o mesmo que os impostos escondidos de hoje."
addScene("neutra", 72.84, 77.24, (S) => {
  const off = officeSet(S, 29);
  const bal = makeBalance(); S.add(bal.group);
  const [L, R] = bal.pans;
  const small = ["PIS", "COFINS", "IPI", "ICMS", "ISS"], pos = [[-0.55, 0], [0.0, 0], [0.55, 0], [-0.28, 1], [0.28, 1]];
  const blocks = small.map((n, i) => { const b = makeBlock(n, { w: 0.52, h: 0.34, d: 0.42, color: GREY, ph: 0.6 }); b.position.set(pos[i][0], bal.panTop + pos[i][1] * 0.34, 0); L.add(b); return b; });
  blocks.forEach((b) => b.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; }));
  const iva = makeBlock("IVA", { w: 1.5, h: 0.95, d: 0.62, color: ORANGE, ph: 0.6 }); iva.position.set(0, bal.panTop, 0); R.add(iva);
  const sl = makeSign2("IMPOSTOS\nDE HOJE", { w: 1.7 }); sl.position.set(-1.95, 0, 1.0); S.add(sl);
  const sr = makeSign2("O IVA\nSOZINHO", { w: 1.7 }); sr.position.set(1.95, 0, 1.0); S.add(sr);
  S.hero(bal.group, "balança de dois pratos"); blocks.forEach((b, i) => S.hero(b, "bloco " + small[i])); S.hero(iva, "bloco IVA");
  S.hero(sl, "placa IMPOSTOS DE HOJE"); S.hero(sr, "placa IVA"); S.solid(sl, "placa hoje"); S.solid(sr, "placa iva");
  const anim = (t) => {
    blocks.forEach((b, i) => popIn(b, t, 72.9 + i * 0.18, 0.35)); popIn(iva, t, 74.3, 0.4);
    const k = sm(t, 72.9, 73.3) * (1 - sm(t, 74.35, 75.1));
    bal.setTilt(0.2 * k + 0.02 * Math.sin(t * 2.2) * (1 - sm(t, 75.1, 75.8)) + 0.008 * Math.sin(t * 1.3));
  };
  const cam = moveOf(anim)([bal.group, sl, sr], 72.84, 77.24, "orbit", { from: [0.55, 0.3, 1], deg: 40 });
  return (t) => {
    anim(t); off.update(t); off.lights(0.4);
    fill.color.set(GOLD); fill.position.set(0, 3.0, 1.8); fill.intensity = 2.4;
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 15. preco (77.24 – 79.88)
// "Mesmo assim, há quem preveja preço subindo."
addScene("preco", 77.24, 79.88, (S) => {
  const set = shopSet(S, 47);
  const sign = makePriceSign("PREÇO", null, { w: 1.3, h: 0.62, stick: 1.2, colorA: ORANGE }); sign.group.position.set(-0.45, 0, 0); S.add(sign.group);
  const arrow = makeUpArrow(1.5, RED); arrow.position.set(0.75, 0, 0.1); S.add(arrow);
  S.hero(sign.group, "placa PREÇO"); S.hero(arrow, "seta vermelha para cima");
  const anim = (t) => {
    popIn(arrow, t, 77.3, 0.4); arrow.position.y = 0.0; arrow.scale.y *= 1 + 0.35 * eOut(lin(t, 77.6, 78.4));
    sign.card.rotation.z = 0.06 * Math.sin(t * 4) * sm(t, 78.2, 78.6); sign.group.rotation.y = 0.15 * Math.sin(t * 1.2);
  };
  const cam = moveOf(anim)([sign.group, arrow], 77.24, 79.88, "push", { from: [0.25, 0.25, 1], pull0: 1.3 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(RED); fill.position.set(0.3, 2.6, 1.8); fill.intensity = 1.4 + 1.2 * sm(t, 77.6, 78.2);
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 16. nota2033 (79.88 – 86.66)
// "Imagina 2033: a nota da camiseta mostra, centavo por centavo, o imposto que você pagou."
addScene("nota2033", 79.88, 86.66, (S) => {
  const set = shopSet(S, 53);
  const cal = makeDeskCalendar(); cal.group.position.set(-1.55, 0, -0.1); S.add(cal.group);
  const counter = makePlinth({ w: 2.2, h: 0.85, d: 1.3, color: "#3a2a20" }); counter.group.position.x = 0.95; S.add(counter.group);
  const pr = makeReceiptPrinter([{ text: "CAMISETA", h: 0.25 }, { text: "CBS", h: 0.26, bg: ORANGE, fg: "#ffffff" }, { text: "IBS", h: 0.26, bg: ORANGE, fg: "#ffffff" }, { text: "TOTAL", h: 0.26 }], { w: 1.0 });
  pr.group.scale.setScalar(1.45); pr.group.position.set(0.95, counter.top, 0.05); S.add(pr.group);
  S.hero(cal.group, "calendário de mesa"); S.hero(counter.group, "balcão"); S.hero(pr.group, "impressora de nota fiscal");
  S.solid(counter.group, "balcão"); S.solid(pr.group, "impressora", { restsOn: ["balcão"] });
  const anim = (t) => {
    const k = sm(t, 79.92, 80.3); if (k <= 0) cal.setPage("JAN 2027", "1º"); else cal.setPage("ANO", "2033"); cal.flip(k, ["JAN 2027", "1º"]);
    pr.setLength(pr.full * eOut(lin(t, 82.2, 85.4)));
  };
  const cam = moveOf(anim)([cal.group, counter.group, pr.group], 79.88, 86.66, "crane", { from: [0.15, 0.5, 1], rise: 0.25 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(ORANGE); fill.position.set(0.9, 2.8, 1.6); fill.intensity = 1.4 + 1.4 * sm(t, 83.6, 84.4);
    CAM.apply(cam(t)); indoorAir();
  };
});

// ---------------------------------------------------------------- 17. pergunta (86.66 – 95.10)
// "Então me diz: o maior IVA do mundo é imposto a mais... ou é o imposto de sempre, só que agora aparecendo?"
addScene("pergunta", 86.66, 95.10, (S) => {
  const set = shopSet(S, 61);
  // one signpost, two boards: the upper points left (red), the lower one right (green); the second post is hidden
  const left = makeArrowSign("IMPOSTO", "A MAIS", -1, RED); S.add(left);
  const right = makeArrowSign("O DE SEMPRE", "APARECENDO", 1, GREEN); right.children[0].visible = false; right.position.set(0, -1.3, 0.12); S.add(right);
  S.hero(left, "placa IMPOSTO A MAIS"); S.hero(right, "placa O DE SEMPRE APARECENDO", { when: (t) => t > 90.3 });
  const anim = (t) => {
    popIn(left, t, 86.7, 0.45); right.visible = t > 89.9; right.scale.setScalar(Math.max(0.0001, pop(t, 89.9, 0.45)));
    left.rotation.y = 0.06 * Math.sin(t * 1.3); right.rotation.y = -0.06 * Math.sin(t * 1.3 + 1);
  };
  const cam = moveOf(anim)([left, right], 86.66, 95.1, "orbit", { from: [0.0, 0.2, 1], deg: 22 });
  return (t) => {
    anim(t); set.update(t);
    fill.color.set(t < 89.9 ? RED : GREEN); fill.position.set(t < 89.9 ? -1.0 : 1.0, 2.8, 1.8); fill.intensity = 1.6;
    CAM.apply(cam(t)); indoorAir();
  };
});
