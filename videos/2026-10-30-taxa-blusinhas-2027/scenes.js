// ============================================================================
// videos/2026-10-30-taxa-blusinhas-2027/scenes.js
// 3D scenes synced to audio/words.json (narration 0–92.0 s, video 94.0 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
//   S.backdrop: the full-screen context of the take (desk and wall, road to the horizon at dusk,
//   office, store, warehouse). The main animation stays in the safe area (docs/visual.md).
// The analogy (one, at the hard point): a two-lane road. The Brazilian-shop lane always had a toll
// (tax hidden in the price); the foreign-site lane had its own toll (the 20% "taxa das blusinhas"),
// removed in May; in 2027 the old toll goes and one new toll covers both lanes.
// Generic imagery only: no store, app or platform brands. Photos (MP signing, law signing) sit on a
// cork board with their credits in the source zone for the whole time they are on screen.
// ============================================================================

// ---------------------------------------------------------------- local helpers (this video)
const PAPER = "#fbf7ef", INK = "#1c1410", GOLD = "#e0a83a", BLUE = "#2f6fb0", PINK = "#e85aa6", HWY = "#1f6b43", SKYBLUE = "#3d8ee0";

const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.04 }, o));
const pulse = (t, a, b, ramp = 0.3) => sm(t, a - ramp, a) * (1 - sm(t, b, b + ramp));
// Like CAM.pose, but fits each object's own box instead of one box around all of them: a wide road
// with tall signs at the back leaves the union box mostly empty, and the shot would come out small.
// Same look point and direction as CAM.pose(union); the distance is the closest at which every box fits.
function poseFit(objs, o = {}) {
  const boxes = objs.map((x) => (x.isBox3 ? x : Array.isArray(x) ? CAM.toBox(x) : CAM.toBox(frameBox(x))));
  const union = boxes.reduce((u, b) => u.union(b), new THREE.Box3());
  const P = CAM.pose(union, Object.assign({}, o, { pull: 1 })), z = ZONES[o.zone || "stage"], pad = (LAYOUT.camera && LAYOUT.camera.pad_px) || 28;
  const dir = P.pos.clone().sub(P.look).normalize(), at = (d) => Object.assign({}, P, { pos: P.look.clone().addScaledVector(dir, d), dist: d });
  const fits = (p) => { CAM.apply(p); return boxes.every((b) => { const r = CAM.projectBox(b); return !r.behind && r.x >= z.x + pad && r.y >= z.y + pad && r.x + r.w <= z.x + z.w - pad && r.y + r.h <= z.y + z.h - pad; }); };
  let lo = P.dist * 0.25, hi = P.dist; for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2; if (fits(at(m))) hi = m; else lo = m; }
  return at(hi * Math.max(1, o.pull || 1));
}

// Canvas texture painted by a function (w x h px). API { tex, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Text fitted to a width: shrinks the font until the text fits maxW. Returns the final px.
function fitText(x, text, cx, cy, px, weight, color, maxW) {
  let s = px; x.font = `${weight} ${s}px Inter`; while (x.measureText(text).width > maxW && s > 10) { s -= 4; x.font = `${weight} ${s}px Inter`; }
  centerText(x, text, cx, cy, `${weight} ${s}px Inter`, color); return s;
}
// Upright panel (w x h, 0.03 deep) whose front face (+z) is a repaintable canvas. Origin: centre.
// The face is registered as a plate so the QA measures its text (frac = letter px / panel px height).
function makeScreenPanel(w, h, painter, { px = 512, frac = 0.3, bg = "#141414", label = "painel" } = {}) {
  const ct = canvasTex(px, Math.round(px * h / w), painter);
  const side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), side]);
  m.userData.plate = { text: label, w, h, depth: 0.03, frac, detail: false };
  return { mesh: m, paint: ct.paint, setFrac: (f) => { m.userData.plate.frac = f; }, ph: Math.round(px * h / w) };
}
// Registers a phone screen as printed text for the QA (frac = letter px / 1500 of its main line).
function screenPlate(ph, text, frac) { ph.screen.userData.plate = { text, w: 0.74, h: 1.56, depth: 0.0, frac, detail: false }; }
// Thin cord between two points (local to the same parent).
function cordBetween(a, b, r = 0.007, color = "#e9e1d4") {
  const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), mat(color, { roughness: 0.8 }));
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return m;
}

// Phone on a small dock (dark anodised metal), slightly tilted back. Origin: floor centre. API { group, ph }
function makePhoneOnDock(s = 1.6) {
  const g = new THREE.Group(), ph = makePhone();
  ph.group.scale.setScalar(s); ph.group.rotation.x = -0.08; ph.group.position.set(0, 0.16 + 0.82 * s, -0.02); g.add(ph.group);
  const dock = new THREE.Mesh(rbox(0.62 * s, 0.16, 0.34 * s, 0.05), mat("#2e2f33", { metalness: 0.6, roughness: 0.35 })); dock.position.y = 0.08; g.add(dock);
  g.add(contactShadow(0.9 * s, 0.6 * s));
  return { group: g, ph };
}
// Price tag (card with a hole and a string) hanging from a point; text printed on the front.
// Origin: the hole. API { group } — the card hangs below the origin.
function makeHangTag(text, { w = 0.5, h = 0.3, color = "#141414" } = {}) {
  const g = new THREE.Group();
  const card = new THREE.Mesh(rbox(w, h, 0.012, 0.02), mat(PAPER, { roughness: 0.8 })); card.position.y = -h / 2 - 0.05; g.add(card);
  const p = makePlate(text, w * 0.86, h * 0.62, { bg: color, fg: "#ffffff", depth: 0.006 }); p.position.set(0, -h / 2 - 0.08, 0.01); g.add(p);
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 6, 16), mat("#c9a45a", { metalness: 0.7, roughness: 0.3 })); eye.position.set(0, -0.08, 0.008); g.add(eye);
  return g;
}
// Blouse on a hanger on a clothes stand (weighted base, chrome post, wooden hanger) with a price tag
// hanging from the hanger. Origin: floor centre.
function makeBlouseStand(color = PINK, s = 1, price = "R$ 100") {
  const g = new THREE.Group(), chrome = mat("#d4d7db", { metalness: 0.9, roughness: 0.22 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.05, 32), mat("#26272a", { metalness: 0.5, roughness: 0.4 })); base.position.y = 0.025; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.3, 14), chrome); post.position.set(0, 0.65, -0.12); g.add(post);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10), chrome); arm.rotation.x = Math.PI / 2; arm.position.set(0, 1.28, -0.05); g.add(arm);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.009, 8, 20, Math.PI), chrome); hook.position.set(0, 1.28, 0.03); g.add(hook);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 12), mat("#ffffff", { map: woodTex("#8a5a36"), roughness: 0.5 })); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.21, 0.03); g.add(bar);
  const bl = makeBlouse(color); bl.position.set(0, 1.21 - 0.82 - 0.02, 0.03); g.add(bl);
  if (price) {
    const tag = makeHangTag(price, { w: 0.56, h: 0.34 }); tag.position.set(0.3, 0.86, 0.2); tag.rotation.z = 0.08; g.add(tag);
    g.add(cordBetween(new V3(0.34, 1.2, 0.04), new V3(0.3, 0.86, 0.2)));
  }
  g.scale.setScalar(s); g.add(contactShadow(0.9 * s, 0.7 * s)); return g;
}
// Stack of coins (ridged gold edge, "R$" on the face); set(n) shows the bottom n (fractional n grows
// the top coin in). Origin: floor centre.
function makeCoinStack(max = 30, { r = 0.2, h = 0.055 } = {}) {
  const g = new THREE.Group(), coins = [];
  const edgeT = canvasTex(256, 16, (x) => { x.fillStyle = "#b07a1c"; x.fillRect(0, 0, 256, 16); x.fillStyle = "#f2c25a"; for (let i = 0; i < 256; i += 8) x.fillRect(i, 0, 4, 16); }).tex;
  edgeT.wrapS = THREE.RepeatWrapping; edgeT.repeat.set(4, 1);
  // the cylinder's top cap is mapped upside down for a camera in front: draw the face rotated 180°
  const topT = canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(110, 100, 10, 128, 128, 128); gr.addColorStop(0, "#ffe08a"); gr.addColorStop(1, "#d99a22"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); x.strokeStyle = "#b67d12"; x.lineWidth = 14; x.beginPath(); x.arc(128, 128, 100, 0, Math.PI * 2); x.stroke(); centerText(x, "R$", 128, 134, "900 96px Inter", "#9a6408"); }).tex;
  const face = [mat("#ffffff", { map: edgeT, metalness: 0.6, roughness: 0.3 }), mat("#ffffff", { map: topT, metalness: 0.5, roughness: 0.3 }), mat(GOLD, { metalness: 0.6, roughness: 0.3 })];
  for (let i = 0; i < max; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.92, 40), face); c.position.set(Math.sin(i * 2.3) * 0.006, h / 2 + i * h, Math.cos(i * 1.7) * 0.006); c.rotation.y = Math.PI / 2; g.add(c); coins.push(c); }
  const shadow = contactShadow(r * 4, r * 4); g.add(shadow);
  const set = (n) => { coins.forEach((c, i) => { const k = clamp(n - i); c.visible = k > 0.02; c.scale.setScalar(Math.max(0.0001, k)); }); shadow.visible = n > 0.05; };
  set(0);
  return { group: g, set };
}
// Display block (dark varnished wood) with two printed lines on its front: a name and a value.
// Origin: floor centre. API { group, top }
function makeValuePlinth(name, value, color, { w = 1.45, h = 1.3, d = 1.0 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.04), mat("#ffffff", { map: tileTex(woodTex("#3e281c"), 1, 1), roughness: 0.45 })); b.position.y = h / 2; g.add(b);
  const pn = makePlate(name, w * 0.9, 0.54, { bg: "#141414", fg: "#ffffff" }); pn.position.set(0, h - 0.33, d / 2 + 0.016); g.add(pn);
  const pv = makePlate(value, w * 0.9, 0.54, { bg: color, fg: "#ffffff" }); pv.position.set(0, 0.33, d / 2 + 0.016); g.add(pv);
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
// Roadside lane sign, low and near the camera on the shoulder (below the toll boards on screen):
// two posts and a board with two printed lines. Origin: floor centre; board faces +z.
function makeRoadSign(l1, l2, color, { w = 1.7, h = 0.9, y = 1.05 } = {}) {
  const g = new THREE.Group(), metal = mat("#9aa0a6", { metalness: 0.75, roughness: 0.3 });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, y + h / 2, 12), metal); p.position.set(sx * w * 0.36, (y + h / 2) / 2, -0.05); g.add(p); }
  let px2 = 0;
  const panel = makeScreenPanel(w, h, (c, cw, chh) => {
    c.fillStyle = color; c.fillRect(0, 0, cw, chh); c.strokeStyle = "#ffffff"; c.lineWidth = 8; roundRect(c, 12, 12, cw - 24, chh - 24, 16); c.stroke();
    const a = fitText(c, l1, cw / 2, chh * 0.33, chh * 0.3, 900, "#ffffff", cw * 0.84); px2 = Math.min(a, fitText(c, l2, cw / 2, chh * 0.69, chh * 0.3, 900, "#ffffff", cw * 0.84));
  }, { px: 512, bg: color, label: l1 + " " + l2 });
  panel.setFrac(px2 / panel.ph); panel.mesh.position.set(0, y, 0); g.add(panel.mesh);
  g.add(contactShadow(w * 0.9, 0.6));
  return { group: g };
}
// Small parcel for the road traffic (closed, taped, label on the front). Origin: floor centre; front +z.
const MB = (() => {
  const label = new THREE.MeshStandardMaterial({ map: shippingLabelTex("BR", false), roughness: 0.8 });
  const labelI = new THREE.MeshStandardMaterial({ map: shippingLabelTex("INTL", true), roughness: 0.8 });
  return { kraft: mat("#ffffff", { map: tileTex(cardboardTex(), 0.6, 0.55), roughness: 0.88 }), kraftI: mat("#e8d4bc", { map: tileTex(cardboardTex(), 0.6, 0.55), roughness: 0.88 }), tape: mat("#d9b779", { roughness: 0.22 }), label, labelI };
})();
function makeMiniBox(intl) {
  const g = new THREE.Group(), w = 0.6, h = 0.55, d = 0.5;
  const b = new THREE.Mesh(rbox(w, h, d, 0.03), intl ? MB.kraftI : MB.kraft); b.position.y = h / 2; g.add(b);
  const tp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.006, d + 0.01), MB.tape); tp.position.y = h + 0.003; g.add(tp);
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), intl ? MB.labelI : MB.label); lb.position.set(0.1, h * 0.45, d / 2 + 0.003); g.add(lb);
  g.add(contactShadow(0.9, 0.8)); return g;
}

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
// Window with blinds: warm light through the slats, on a wall. Origin: centre of the window.
function makeBlindsWindow(w = 2.6, h = 2.4) {
  const g = new THREE.Group(), frame = mat("#2a1d16", { roughness: 0.6 });
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffcf9a").multiplyScalar(0.6), toneMapped: false });
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h / 9 * 0.62), glow); s.position.set(0, -h / 2 + (i + 0.5) * h / 9, 0); g.add(s); }
  for (const [bw, bh, x, y] of [[w + 0.16, 0.08, 0, h / 2 + 0.04], [w + 0.16, 0.08, 0, -h / 2 - 0.04], [0.08, h, -w / 2 - 0.04, 0], [0.08, h, w / 2 + 0.04, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), frame); b.position.set(x, y, 0.02); g.add(b); }
  return g;
}
// Potted plant (terracotta pot, soil, a cluster of leaves). Origin: floor centre.
function makePlant(s = 1) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.36, 24), mat("#a5532e", { roughness: 0.8 })); pot.position.y = 0.18; g.add(pot);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 24), mat("#2a1a10")); soil.position.y = 0.35; g.add(soil);
  const leafM = mat("#2f5a2a", { roughness: 0.7, side: THREE.DoubleSide }), r = mulberry32(31);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), leafM); l.scale.set(0.45, 1.5, 0.12); const a = (i / 9) * Math.PI * 2; l.position.set(Math.cos(a) * 0.1, 0.55 + r() * 0.12, Math.sin(a) * 0.1); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); g.add(l); }
  g.scale.setScalar(s); return g;
}
// Desk and wall: varnished wooden desk top (y = 0 is its surface), a plaster wall at the back with a
// sunny window behind blinds, a shelf with books and a plant, a desk lamp.
function makeDeskSet({ wallZ = -3.4 } = {}) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(34, 0.2, 16), mat("#ffffff", { map: tileTex(woodTex("#6b4630"), 9, 4.5), roughness: 0.42, envMapIntensity: 0.7 })); top.position.set(0, -0.1, wallZ + 8); g.add(top);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 18), mat("#ffffff", { map: tileTex(plasterTex("#3a2b24"), 9, 3.5), roughness: 0.95, envMapIntensity: 0.4 })); wall.position.set(0, 8.9, wallZ); g.add(wall);
  const win = makeBlindsWindow(2.6, 1.9); win.position.set(-4.4, 1.9, wallZ + 0.02); g.add(win);
  const shelfM = mat("#ffffff", { map: woodTex("#4a2f20"), roughness: 0.6 }), r = mulberry32(41);
  const shelf = new THREE.Mesh(rbox(3.4, 0.08, 0.5, 0.02), shelfM); shelf.position.set(4.0, 1.6, wallZ + 0.27); g.add(shelf);
  const bookCols = ["#7a2e22", "#2f4a6a", "#c9a45a", "#3d5a3a", "#5a3a5a", "#8a6a4a", "#2a2a2a"];
  let bx = 2.55; for (let i = 0; i < 11; i++) { const bw = 0.08 + r() * 0.07, bh = 0.42 + r() * 0.3; const b = new THREE.Mesh(rbox(bw, bh, 0.34, 0.01), mat(bookCols[i % bookCols.length], { roughness: 0.7 })); b.position.set(bx + bw / 2, 1.64 + bh / 2, wallZ + 0.27); b.rotation.z = i === 7 ? -0.25 : 0; g.add(b); bx += bw + 0.015; }
  const plant = makePlant(1.3); plant.position.set(5.0, 1.64, wallZ + 0.28); g.add(plant);
  // desk lamp at the back left: weighted base, two arm segments, a shade with a warm bulb
  const lamp = new THREE.Group(), lm = mat("#1f1f22", { metalness: 0.6, roughness: 0.35 }); lamp.position.set(-2.7, 0, wallZ + 1.4); g.add(lamp);
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 28), lm); lb.position.y = 0.03; lamp.add(lb);
  const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 10), lm); a1.position.set(0.18, 0.55, 0); a1.rotation.z = -0.35; lamp.add(a1);
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 10), lm); a2.position.set(0.62, 1.12, 0); a2.rotation.z = 1.1; lamp.add(a2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.34, 28, 1, true), mat("#1f1f22", { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); shade.position.set(0.98, 0.95, 0); shade.rotation.z = 0.5; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffd9a0").multiplyScalar(2), toneMapped: false })); bulb.position.set(1.02, 0.86, 0); lamp.add(bulb);
  const lampLight = new THREE.PointLight("#ffb36b", 2.5, 6, 1.6); lampLight.position.set(1.05, 0.8, 0.1); lamp.add(lampLight);
  return g;
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
// Office corner behind the cork board: wooden floor, plaster wall with a sunny window, a filing cabinet, a plant.
function makeOffice({ wallZ = -1.2 } = {}) {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), mat("#ffffff", { map: tileTex(woodTex("#5e3e2a"), 12, 9), roughness: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.001, wallZ + 15); g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), mat("#ffffff", { map: tileTex(plasterTex("#4a3a33"), 8, 3), roughness: 0.95 })); wall.position.set(0, 8, wallZ); g.add(wall);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(40, 0.18, 0.04), mat("#2a1d16")); skirt.position.set(0, 0.09, wallZ + 0.02); g.add(skirt);
  const win = makeBlindsWindow(2.4, 2.6); win.position.set(-4.4, 3.4, wallZ + 0.02); g.add(win);
  const cab = new THREE.Group(); cab.position.set(4.2, 0, wallZ + 0.45); g.add(cab);
  const cm = mat("#5d6a70", { metalness: 0.55, roughness: 0.45 });
  const body = new THREE.Mesh(rbox(0.9, 2.1, 0.8, 0.03), cm); body.position.y = 1.05; cab.add(body);
  for (let i = 0; i < 4; i++) { const dr = new THREE.Mesh(rbox(0.82, 0.44, 0.02, 0.01), mat("#6b7a80", { metalness: 0.55, roughness: 0.4 })); dr.position.set(0, 0.32 + i * 0.5, 0.41); cab.add(dr); const hd = new THREE.Mesh(rbox(0.22, 0.04, 0.04, 0.01), mat("#c9ced3", { metalness: 0.9, roughness: 0.2 })); hd.position.set(0, 0.42 + i * 0.5, 0.43); cab.add(hd); }
  const plant = makePlant(1.8); plant.position.set(-3.6, 0, wallZ + 0.6); g.add(plant);
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
// Parcel warehouse: concrete floor, steel racks (blue uprights, orange beams) full of boxes on both
// sides, receding into the dark.
function makeWarehouse() {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), mat("#ffffff", { map: tileTex(plasterTex("#5d5a56"), 14, 14), roughness: 0.75 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.001; g.add(fl);
  const up = mat("#2f5f9a", { metalness: 0.5, roughness: 0.4 }), beam = mat("#e07a1f", { metalness: 0.4, roughness: 0.45 }), r = mulberry32(61);
  const card = mat("#ffffff", { map: tileTex(cardboardTex(), 0.7, 0.5), roughness: 0.9 });
  for (const sx of [-1, 1]) for (let z = -1.5; z > -26; z -= 3.2) {
    const x0 = sx * 3.8;
    for (const dx of [-0.6, 0.6]) for (const dz of [-1.4, 1.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.09, 4.2, 0.09), up); p.position.set(x0 + dx, 2.1, z + dz); g.add(p); }
    for (const y of [0.15, 1.5, 2.85]) {
      for (const dx of [-0.6, 0.6]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 2.9), beam); b.position.set(x0 + dx, y, z); g.add(b); }
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.04, 2.9), mat("#6a5a48", { roughness: 0.8 })); deck.position.set(x0, y + 0.08, z); g.add(deck);
      for (let k = -1; k <= 1; k++) { if (r() < 0.15) continue; const bw = 0.7 + r() * 0.35, bh = 0.5 + r() * 0.5; const b = new THREE.Mesh(rbox(bw, bh, 0.75, 0.02), card); b.position.set(x0 + (r() - 0.5) * 0.2, y + 0.1 + bh / 2, z + k * 0.92); g.add(b); }
    }
  }
  return g;
}

// ---------------------------------------------------------------- phone screens
// Chat with the rumour; n bubbles; falso 0..1 stamps "FALSO" over it.
function paintChat(x, n, falso) {
  x.fillStyle = "#0e1215"; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = HWY; x.fillRect(0, 0, 720, 180);
  x.fillStyle = "#cfe9d9"; x.beginPath(); x.arc(84, 100, 44, 0, Math.PI * 2); x.fill();
  x.textAlign = "left"; x.textBaseline = "middle"; x.fillStyle = "#ffffff"; x.font = "800 46px Inter"; x.fillText("Grupo da família", 150, 82);
  x.font = "600 30px Inter"; x.fillStyle = "#cfe9d9"; x.fillText("12 participantes", 150, 130);
  const msgs = [[["A TAXA DAS", "BLUSINHAS VOLTA", "EM 2027!!"], 0], [["SÉRIO??"], 1], [["VOLTA SIM,", "VI NO VÍDEO"], 0], [["VAI FICAR TUDO", "MAIS CARO"], 0], [["COMPARTILHEM!!"], 1]];
  let y = 215;
  msgs.slice(0, n).forEach(([lines, mine]) => {
    x.font = "800 58px Inter"; const tw = Math.max(...lines.map((l) => x.measureText(l).width)), bw = tw + 64, bh = lines.length * 70 + 40, bx = mine ? 720 - 30 - bw : 30;
    x.fillStyle = mine ? "#2f8a57" : "#2a2f36"; roundRect(x, bx, y, bw, bh, 28); x.fill();
    x.fillStyle = "#ffffff"; x.textAlign = "left"; lines.forEach((l, i) => x.fillText(l, bx + 32, y + 56 + i * 70));
    y += bh + 26;
  });
  if (falso > 0) {
    x.save(); x.translate(360, 700); x.rotate(-0.2); const s = 1 + 0.9 * (1 - eOut(falso)); x.scale(s, s); x.globalAlpha = clamp(falso * 2);
    x.fillStyle = "rgba(16,20,24,0.55)"; roundRect(x, -300, -120, 600, 240, 30); x.fill();
    x.strokeStyle = RED; x.lineWidth = 20; roundRect(x, -300, -120, 600, 240, 30); x.stroke();
    centerText(x, "FALSO", 0, 8, "900 168px Inter", RED);
    x.restore();
  }
}
function blousePath(x) {
  x.beginPath(); x.moveTo(-0.27, 0); x.quadraticCurveTo(0, -0.04, 0.27, 0); x.lineTo(0.25, 0.3); x.lineTo(0.29, 0.55); x.lineTo(0.5, 0.47); x.lineTo(0.58, 0.6); x.lineTo(0.33, 0.8);
  x.lineTo(0.14, 0.82); x.quadraticCurveTo(0, 0.66, -0.14, 0.82); x.lineTo(-0.33, 0.8); x.lineTo(-0.58, 0.6); x.lineTo(-0.5, 0.47); x.lineTo(-0.29, 0.55); x.lineTo(-0.25, 0.3); x.closePath();
}
// Shop checkout on a foreign site: the blouse for R$ 100; taxa 0..1 slides the tax block in (big
// letters: it is what the shot is about); zero 0..1 strikes it and turns it into R$ 0.
function paintShop(x, taxa, zero) {
  x.fillStyle = "#f6f3ee"; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = ORANGE; x.fillRect(0, 0, 720, 170);
  x.strokeStyle = "#ffffff"; x.lineWidth = 6; x.beginPath(); x.arc(88, 92, 38, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.ellipse(88, 92, 17, 38, 0, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(50, 92); x.lineTo(126, 92); x.stroke();
  x.textAlign = "left"; x.textBaseline = "middle"; x.fillStyle = "#ffffff"; x.font = "900 54px Inter"; x.fillText("SITE DE FORA", 150, 94);
  x.fillStyle = "#fde3ea"; roundRect(x, 40, 200, 640, 400, 30); x.fill();
  x.save(); x.translate(360, 565); x.scale(400, -400); blousePath(x); x.fillStyle = PINK; x.fill(); x.clip(); x.fillStyle = "#ffffff";
  for (let i = -7; i <= 7; i++) for (let j = 0; j <= 9; j++) { x.beginPath(); x.arc(i * 0.1 + (j % 2) * 0.05, j * 0.1, 0.02, 0, Math.PI * 2); x.fill(); }
  x.restore();
  x.textAlign = "left"; x.fillStyle = "#4a4440"; x.font = "700 50px Inter"; x.fillText("Blusinha", 50, 660);
  x.fillStyle = INK; x.font = "900 100px Inter"; x.fillText("R$ 100,00", 46, 750);
  const grow = 170 * eOut(clamp(taxa)), cardH = 230 + grow;
  x.fillStyle = "#ffffff"; roundRect(x, 30, 830, 660, cardH, 28); x.fill(); x.strokeStyle = "#e2dcd2"; x.lineWidth = 4; roundRect(x, 30, 830, 660, cardH, 28); x.stroke();
  const row = (label, value, y, color = INK, font = "700 54px Inter") => { x.font = font; x.fillStyle = INK; x.textAlign = "left"; x.fillText(label, 60, y); x.fillStyle = color; x.textAlign = "right"; x.fillText(value, 660, y); };
  row("Produto", "R$ 100", 890);
  if (taxa > 0) {
    x.save(); x.globalAlpha = clamp(taxa * 1.5); x.translate(80 * (1 - eOut(taxa)), 0);
    x.fillStyle = zero > 0.5 ? "rgba(47,174,102,0.16)" : "rgba(224,38,27,0.13)"; roundRect(x, 44, 935, 632, 160, 20); x.fill();
    x.font = "800 50px Inter"; x.fillStyle = INK; x.textAlign = "left"; x.fillText("Taxa das blusinhas", 64, 978);
    x.textAlign = "right"; x.font = "900 86px Inter";
    if (zero < 0.5) {
      x.fillStyle = RED; x.fillText("+ R$ 20", 660, 1052);
      if (zero > 0) { const w = x.measureText("+ R$ 20").width; x.strokeStyle = RED; x.lineWidth = 10; x.beginPath(); x.moveTo(660 - w - 8, 1054); x.lineTo(660 - w - 8 + (w + 16) * clamp(zero * 2), 1054); x.stroke(); }
    } else { x.fillStyle = GREEN; x.fillText("R$ 0", 660, 1052); }
    x.restore();
  }
  x.fillStyle = "#e2dcd2"; x.fillRect(60, 945 + grow, 600, 4);
  const total = taxa > 0.5 && zero < 0.5 ? "R$ 120" : "R$ 100";
  row("Total", total, 1010 + grow, taxa > 0.5 && zero < 0.5 ? RED : INK, "900 64px Inter");
  x.fillStyle = ORANGE; roundRect(x, 40, 1340, 640, 120, 60); x.fill(); centerText(x, "COMPRAR", 360, 1402, "900 58px Inter", "#ffffff");
}
// Chat-bubble sprite textures (no text: the rumour spreading, as background).
const BUBBLES = ["#2f8a57", "#3a4048"].map((col) => canvasTex(160, 120, (x) => {
  x.fillStyle = col; roundRect(x, 6, 6, 148, 86, 30); x.fill(); x.beginPath(); x.moveTo(36, 86); x.lineTo(24, 114); x.lineTo(62, 88); x.fill();
  x.fillStyle = "#ffffff"; for (const cx of [52, 80, 108]) { x.beginPath(); x.arc(cx, 49, 9, 0, Math.PI * 2); x.fill(); }
}).tex);

// ---------------------------------------------------------------- 1. boato (0 – 10.80)
// "Estão dizendo que a taxa das blusinhas volta em 2027. O governo diz que é falso.
//  Só que essa história tem uma segunda parte... que quase ninguém conta."
addScene("boato", 0, 10.8, (S) => {
  S.backdrop(makeDeskSet());
  const dust = makeDust(160, [[-6, 0.2, -3.2], [6, 6.5, 2.5]]); S.backdrop(dust.points);
  const pd = makePhoneOnDock(1.55); pd.group.position.set(-0.9, 0, -0.35); pd.group.rotation.y = 0.12; S.add(pd.group);
  const box = makeParcel({ w: 1.5, h: 1.0, d: 1.2, label: "ENCOMENDA", airmail: true }); box.group.position.set(1.25, 0, 0.55); box.group.rotation.y = -0.4; S.add(box.group);
  const bl = makeBlouse(PINK); box.group.add(bl);
  // the tag hanging on the front: its face is turned, only "?" shows (the part nobody tells)
  const tagG = new THREE.Group(); tagG.position.set(-box.w * 0.22, box.h - 0.01, box.d / 2 + 0.09); box.group.add(tagG); // pivot at the wall's top edge
  const tagA = makePlate("?", 0.36, 0.44, { bg: ORANGE, fg: "#ffffff", depth: 0.02 }); tagA.position.y = -0.52; tagG.add(tagA);
  const tagB = makePlate("?", 0.36, 0.44, { bg: ORANGE, fg: "#ffffff", depth: 0.02 }); tagB.rotation.y = Math.PI; tagB.position.set(0, -0.52, -0.021); tagG.add(tagB);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), mat("#e9e1d4")); cord.position.y = -0.15; tagG.add(cord);
  // the rumour spreading: bubbles leave the phone and fly out across the whole screen, then burst at "falso"
  const rb = mulberry32(77), bubbles = [];
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: BUBBLES[i % 3 === 1 ? 0 : 1], transparent: true, depthWrite: false })); s.userData.decor = true; S.backdrop(s);
    const side = i % 2 ? 1 : -1; bubbles.push({ s, t0: 0.1 + i * 0.33, to: new V3(side * (2.6 + rb() * 2.6), 0.9 + rb() * 2.2, -1.0 - rb() * 1.6), size: 0.45 + rb() * 0.3 });
  }
  pd.group.updateMatrixWorld(true); const from = pd.ph.group.localToWorld(new V3(0, 0.35, 0.06));
  S.hero(pd.group, "celular com boato no grupo", { when: (t) => t < 6.1 });
  S.hero(box.group, "caixa de encomenda com blusinha", { when: (t) => t > 6.9 });
  let key = "";
  const anim = (t) => {
    const n = (t > 0.15) + (t > 0.7) + (t > 1.3) + (t > 1.9) + (t > 2.6), f = lin(t, 5.45, 5.7);
    const k = n + "|" + f.toFixed(2); if (k !== key) { key = k; paintChat(pd.ph.ctx, n, f); pd.ph.tex.needsUpdate = true; }
    box.open(1);
    bl.position.set(0, box.floorY + 0.12 + 0.5 * eOut(lin(t, 0.0, 1.1)), -0.05); bl.rotation.set(-0.22, 0, 0.06 * Math.sin(t * 1.6));
    tagG.rotation.y = 0.3 * Math.sin(t * 1.25); tagG.rotation.z = 0.05 * Math.sin(t * 1.7);
    pd.group.position.y = 0.04 * pop(t, 5.45, 0.2) * (t < 5.9 ? 1 : 0);
    const gone = sm(t, 6.15, 6.6); pd.group.scale.setScalar(Math.max(0.0001, 1 - gone)); pd.group.visible = gone < 0.99;
    const burst = sm(t, 5.5, 5.8);
    for (const b of bubbles) {
      const u = lin(t, b.t0, b.t0 + 2.4), k2 = Math.min(eOut(lin(t, b.t0, b.t0 + 0.3)), 1 - burst);
      b.s.visible = t > b.t0 && k2 > 0.01; b.s.position.copy(from).lerp(b.to, eOut(u)); b.s.position.y += 0.15 * Math.sin(t * 2 + b.t0);
      b.s.scale.set(b.size * k2 * (1 + 0.6 * burst), b.size * 0.75 * k2 * (1 + 0.6 * burst), 1); b.s.material.opacity = 0.85 * (1 - 0.5 * u);
    }
    dust.update(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([pd.group], 0, 6.1, { from: [0.18, 0.22, 1], pull: 1.05 }), A1 = shot([pd.group], 0, 6.1, { from: [-0.02, 0.18, 1], pull: 1.0 });
  const B0 = shot([box.group], 6.2, 10.8, { from: [0.3, 0.42, 1], pull: 1.08 }), B1 = shot([box.group], 6.2, 10.8, { from: [0.08, 0.34, 1], pull: 1.0 });
  return (t) => {
    anim(t); floor.visible = false;
    fill.color.set(t < 5.4 ? ORANGE : RED); fill.position.set(-0.6, 2.6, 2.0); fill.intensity = t < 5.4 ? 1.0 : 2.4 * (1 - sm(t, 6.2, 7.0)) + 0.8;
    const p = CAM.track(t, [[0, A0], [6.0, A1, 6.0], [7.0, B0, 1.0], [10.8, B1, 3.8]]);
    CAM.apply(CAM.shake(p, t, 5.5, 0.18, 0.35)); indoorAir(1);
  };
});

// ---------------------------------------------------------------- 2. carrinho (10.80 – 21.80)
// "Imagina: você compra uma blusinha de cem reais num site de fora. Até maio deste ano, você pagava
//  uns vinte reais a mais, só dessa taxa. Aí o governo zerou essa taxa."
addScene("carrinho", 10.8, 21.8, (S) => {
  S.backdrop(makeDeskSet());
  const dust = makeDust(160, [[-6, 0.2, -3.2], [6, 6.5, 2.5]], { seed: 9 }); S.backdrop(dust.points);
  const pd = makePhoneOnDock(1.8); pd.group.position.set(-0.55, 0, 0); pd.group.rotation.y = 0.1; S.add(pd.group);
  screenPlate(pd.ph, "R$ 100,00", 100 / 1500);
  const stand = makeBlouseStand(PINK, 1.3, "R$ 100"); stand.position.set(1.4, 0, -0.1); S.add(stand);
  const sparks = makeSparks(40, 5); S.add(sparks);
  S.hero(pd.group, "celular com a compra da blusinha"); S.hero(stand, "blusinha no cabide com etiqueta R$ 100", { when: (t) => t < 16.5 });
  S.solid(pd.group, "celular"); S.solid(stand, "cabide");
  let key = "";
  const anim = (t) => {
    const a = lin(t, 15.0, 15.4), z = lin(t, 19.85, 20.35), k = a.toFixed(2) + "|" + z.toFixed(2);
    if (k !== key) { key = k; paintShop(pd.ph.ctx, a, z); pd.ph.tex.needsUpdate = true; }
    const out = sm(t, 16.6, 16.95);
    stand.rotation.y = 0.1 * Math.sin(t * 1.1); stand.scale.setScalar(Math.max(0.0001, 1.3 * (1 - out))); stand.visible = out < 0.99;
    updateSparks(sparks, t, 20.35, pd.ph.group.localToWorld(phoneScreenPoint(560, 1052)).add(new V3(0, 0, 0.2)));
    dust.update(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([pd.group, stand], 10.8, 16.5, { from: [0.25, 0.32, 1], pull: 1.04 }), A1 = shot([pd.group, stand], 10.8, 16.5, { from: [0.02, 0.28, 1], pull: 1.0 });
  const B0 = shot([pd.group], 17.0, 21.8, { from: [0.12, 0.22, 1], pull: 1.03 }), B1 = shot([pd.group], 17.0, 21.8, { from: [-0.06, 0.2, 1], pull: 1.0 });
  return (t) => {
    anim(t); floor.visible = false;
    fill.color.set(t < 20.4 ? (t > 17.1 ? RED : ORANGE) : GREEN); fill.position.set(0, 2.6, 2.2); fill.intensity = t > 17.1 ? 1.8 : 0.9;
    const p = CAM.track(t, [[10.8, A0], [16.4, A1, 5.6], [17.1, B0, 0.7], [21.8, B1, 4.7]]);
    CAM.apply(CAM.shake(CAM.shake(p, t, 15.05, 0.08, 0.3), t, 20.0, 0.1, 0.3)); indoorAir(1);
  };
});

// ---------------------------------------------------------------- 3. quadro (21.80 – 28.50)
// "O Congresso confirmou, virou lei. E o governo garante: ela não volta. Essa é a primeira parte."
addScene("quadro", 21.8, 28.5, (S) => {
  S.backdrop(makeOffice());
  const dust = makeDust(120, [[-6, 0.2, -1.1], [6, 6, 3]], { seed: 13 }); S.backdrop(dust.points);
  const board = makeCorkBoard({ w: 5.0, h: 3.9, lift: 0.35 }); S.backdrop(board.group); // the wall of the take
  const pr1 = makePhotoPrint("mp", { w: 2.15, caption: "MAIO" }), pr2 = makePhotoPrint("sancao", { w: 2.15, caption: "SETEMBRO" });
  board.group.add(pr1.group, pr2.group);
  const r1 = { pos: board.point(-0.5, 0.3).add(new V3(0, 0, 0.01)), rotZ: 0.04 }, r2 = { pos: board.point(0.5, 0.3).add(new V3(0, 0, 0.01)), rotZ: -0.035 };
  const pinAt = (r, pr) => { const py = pr.pinTop.y; return new V3(r.pos.x - py * Math.sin(r.rotZ), r.pos.y + py * Math.cos(r.rotZ), r.pos.z + 0.12); };
  const str = makeString(pinAt(r1, pr1), pinAt(r2, pr2), { sag: 0.05 }); board.group.add(str.mesh);
  const card = new THREE.Group(); board.group.add(card);
  const cardP = makePlate("NÃO VOLTA", 2.8, 1.0, { bg: RED, fg: "#ffffff", depth: 0.03 }); card.add(cardP);
  const cpin = makePin("#f4efe6"); cpin.position.set(0, 0.38, 0.016); card.add(cpin);
  const cardRest = board.point(0, -0.62).add(new V3(0, 0, 0.03));
  S.hero(pr1.group, "polaroid MAIO", { when: (t) => (t > 22.4 && t < 22.85) || t > 24.65 }); S.hero(pr2.group, "polaroid SETEMBRO", { when: (t) => (t > 23.5 && t < 24.05) || t > 24.65 });
  S.hero(card, "cartão NÃO VOLTA", { when: (t) => t > 24.8 });
  const anim = (t) => {
    dropPrint(pr1, t, 21.85, r1, { from: [-3.2, 0.1, 1.8] }); dropPrint(pr2, t, 22.95, r2, { from: [3.2, 0.1, 1.8] });
    pr1.zoom(1 + 0.12 * lin(t, 21.9, 28.5)); pr2.zoom(1 + 0.12 * lin(t, 23.0, 28.5));
    str.setProgress(lin(t, 23.6, 24.1));
    const k = eOut(lin(t, 24.3, 24.65));
    card.visible = t > 24.3; card.position.set(cardRest.x, cardRest.y + 1.2 * (1 - k), cardRest.z + 1.6 * (1 - k)); card.rotation.set(-0.4 * (1 - k), 0, -0.05 + 0.4 * (1 - k));
    cpin.visible = t > 24.6; cpin.scale.setScalar(Math.max(0.0001, pop(t, 24.6, 0.25)));
    dust.update(t);
  };
  // shots: each print as it lands, then the two prints and the card (the board edges may leave the frame)
  dropPrint(pr1, 99, 0, r1); dropPrint(pr2, 99, 0, r2); anim(99); card.position.copy(cardRest); card.rotation.set(0, 0, -0.05);
  const b1 = CAM.toBox(frameBox(pr1.group)), b2 = CAM.toBox(frameBox(pr2.group)), bc = CAM.toBox(frameBox(card)); anim(21.8);
  const P1 = CAM.pose(b1, { zone: "stage", from: [0.12, 0.1, 1], pull: 1.14 }), P1b = CAM.pose(b1, { zone: "stage", from: [0.04, 0.08, 1], pull: 1.06 });
  const P2 = CAM.pose(b2, { zone: "stage", from: [-0.04, 0.1, 1], pull: 1.14 }), P2b = CAM.pose(b2, { zone: "stage", from: [-0.12, 0.08, 1], pull: 1.06 });
  const A0 = poseFit([b1, b2, bc], { from: [0.08, 0.1, 1], pull: 1.06 }), A1 = poseFit([b1, b2, bc], { from: [-0.06, 0.06, 1], pull: 1.0 });
  return (t) => {
    anim(t); floor.visible = false;
    fill.color.set(t < 24.3 ? GOLD : RED); fill.position.set(0, 3.2, 3.0); fill.intensity = 1.2;
    CAM.apply(CAM.shake(CAM.track(t, [[21.8, P1], [22.85, P1b, 1.05], [23.35, P2, 0.5], [24.05, P2b, 0.7], [24.6, A0, 0.55], [28.5, A1, 3.9]]), t, 24.65, 0.1, 0.3)); indoorAir(1);
  };
});

// ---------------------------------------------------------------- road set (scenes 4 and 7)
// Boxes travel each lane toward the camera; with a toll down at the stop line they wait `p` seconds
// ("pay": a coin flies into the cabinet), the boom lifts and they go on. Pure functions of time.
const ROAD = { z0: -5.4, zIn: -3.9, z1: 1.5, stop: -1.05, v: 2.0, p: 0.9, LX: -0.8, RX: 0.8, GX: 2.15 }; // boxes show from zIn (road start) to z1
const arrival = (s) => s + (ROAD.stop - ROAD.z0) / ROAD.v;
function boxZ(t, s, toll) {
  const ta = arrival(s);
  if (!toll || t < ta) return ROAD.z0 + ROAD.v * (t - s);
  if (t < ta + ROAD.p) return ROAD.stop;
  return ROAD.stop + ROAD.v * (t - ta - ROAD.p);
}
// Boom lift for a gate from the pay-end times of the boxes it stopped.
const boomUp = (t, ends) => ends.reduce((m, e) => Math.max(m, sm(t, e - 0.4, e - 0.1) * (1 - sm(t, e + 0.6, e + 0.9))), 0);
function makeTraffic(S, x, intl, n = 6) {
  const boxes = []; for (let i = 0; i < n; i++) { const b = makeMiniBox(intl); b.visible = false; S.add(b); boxes.push(b); }
  const coin = makeCoin(0.2, "R$"); coin.spin(Math.PI / 2); coin.group.visible = false; S.add(coin.group); // spin: "R$" upright
  // spawns: sorted spawn times; tollAt(ta): a gate is down at arrival time ta; cab: cabinet front (world)
  const update = (t, spawns, tollAt, cab) => {
    boxes.forEach((b) => (b.visible = false)); coin.group.visible = false;
    spawns.forEach((s, i) => {
      if (t < s) return; const toll = tollAt(arrival(s)), z = boxZ(t, s, toll); if (z > ROAD.z1 || z < ROAD.zIn) return;
      const b = boxes[i % n]; b.visible = true;
      const k = Math.min(eOut(lin(z, ROAD.zIn, ROAD.zIn + 0.6)), 1 - sm(z, ROAD.z1 - 0.5, ROAD.z1));
      b.position.set(x, 0.06, z); b.scale.setScalar(Math.max(0.0001, k));
      const ta = arrival(s);
      if (toll && t >= ta && t < ta + ROAD.p) {
        const u = lin(t, ta, ta + ROAD.p), from = new V3(x, 0.95, ROAD.stop);
        coin.group.visible = true; coin.group.position.copy(from.clone().lerp(cab, eOut(u))).add(new V3(0, 0.3 * Math.sin(u * Math.PI), 0));
        coin.group.rotation.y = 0; coin.group.scale.setScalar(Math.max(0.0001, Math.min(pop(t, ta, 0.2), 1 - sm(u, 0.8, 1))));
      }
    });
  };
  const ends = (spawns, tollAt) => spawns.map((s) => [arrival(s), tollAt(arrival(s))]).filter(([, tl]) => tl).map(([ta]) => ta + ROAD.p);
  return { update, ends };
}
const range = (a, b, step) => { const o = []; for (let s = a; s <= b + 1e-6; s += step) o.push(+s.toFixed(3)); return o; };
// Builds the road, its landscape (backdrop) and the two lane signs (gates are added by each scene).
function buildRoad(S) {
  S.backdrop(makeLandscape({ roadFrom: -4.2 }));
  const clouds = makeClouds(); S.backdrop(clouds.group);
  const road = makeTwoLaneRoad({ lane: 1.6, back: 4.2, front: 2.9, tints: [GREEN, BLUE] }); S.add(road.group);
  const signL = makeRoadSign("LOJA", "BRASILEIRA", HWY), signR = makeRoadSign("SITE", "DE FORA", BLUE);
  signL.group.position.set(-2.65, 0, 1.6); signL.group.rotation.y = 0.28; signR.group.position.set(2.65, 0, 1.6); signR.group.rotation.y = -0.28; S.add(signL.group, signR.group);
  return { road, signL, signR, clouds };
}
// Indoor backdrops (desk, office, store, warehouse) fade into the dark a little behind the subject.
function indoorAir(k = 1) { const d = CAM.last.dist; scene.fog.near = d * (1.0 + 0.2 * k); scene.fog.far = d * (2.4 + 0.6 * k) + 4; }
// Dusk lighting for the road scenes: fog in the colour of the horizon, far enough to keep the land.
function duskAir() { floor.visible = false; scene.fog.color.set("#7a3c28"); scene.fog.near = 26; scene.fog.far = 150; hemi.color.set("#ffc9a0"); hemi.groundColor.set("#1a120c"); }
// The new toll (2027): a gantry over both lanes with the board in the middle and one boom per lane.
// Group origin: the road centre line. API { group, setL(k), setR(k), board }
function newGate() {
  const g = new THREE.Group();
  const L = makeTollGate({ arm: 1.8, side: 1, board: false }), R = makeTollGate({ arm: 1.8, side: -1, board: false });
  L.group.position.x = -ROAD.GX; R.group.position.x = ROAD.GX; g.add(L.group, R.group);
  const metal = mat("#9aa0a6", { metalness: 0.75, roughness: 0.3 }), H = 2.75, zb = -0.3;
  for (const x of [-2.6, 2.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, H, 14), metal); p.position.set(x, H / 2, zb); g.add(p); }
  const bar = new THREE.Mesh(rbox(5.6, 0.18, 0.18, 0.04), metal); bar.position.set(0, H, zb); g.add(bar);
  const board = makePlate2("IMPOSTO\nNOVO", 2.4, 1.0, { bg: ORANGE, fg: "#ffffff", depth: 0.05 }); board.position.set(0, H - 0.09 - 0.12 - 0.5, zb + 0.11); g.add(board);
  for (const dx of [-0.8, 0.8]) { const hgr = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.05), metal); hgr.position.set(dx, H - 0.16, zb + 0.1); g.add(hgr); }
  return { group: g, setL: L.set, setR: R.set, board };
}
// Ground marking (a plate lying flat on the asphalt, text up). Origin: on the road surface.
function groundMark(text, w, h, bg, fg) { const p = makePlate(text, w, h, { bg, fg, depth: 0.01 }); p.rotation.x = -Math.PI / 2; p.position.y = 0.066; return p; }

// ---------------------------------------------------------------- 4. estrada (28.50 – 64.20)
// "Agora, a segunda parte. Pensa numa estrada com duas pistas. Na pista da loja brasileira, sempre teve
//  pedágio... Na pista dos sites de fora, a taxa das blusinhas era um pedágio só pra essa pista. Em maio,
//  ele saiu. Hoje, quem passa ali não paga nada pro governo. Em janeiro de 2027, isso muda. O pedágio
//  antigo da pista brasileira sai... e entra um novo, que atravessa as duas pistas. É o imposto novo da
//  reforma tributária. Loja brasileira e site de fora pagam o mesmo pedágio."
addScene("estrada", 28.5, 64.2, (S) => {
  const { road, signL, signR, clouds } = buildRoad(S);
  const gBR = makeTollGate({ arm: 1.8, side: 1, label: "PEDÁGIO" }); gBR.group.position.set(-ROAD.GX, 0, 0); S.add(gBR.group);
  const g20 = makeTollGate({ arm: 1.8, side: -1, label: "TAXA 20%", color: RED, fg: "#ffffff" }); g20.group.position.set(ROAD.GX, 0, 0); S.add(g20.group);
  const gNew = newGate(); S.add(gNew.group);
  const zero = groundMark("ZERO", 1.15, 0.6, GREEN, "#ffffff"); zero.position.set(0.75, zero.position.y, 2.2); S.add(zero);
  const L = makeTraffic(S, ROAD.LX, false), R = makeTraffic(S, ROAD.RX, true);
  // timeline: old BR toll until 53.9–54.5; 20% toll until 44.4–45.3; new toll rises 54.7–55.3, booms down 55.5–56.3
  const T = { brOut: 53.9, f20Out: 44.4, newIn: 54.7, newDown: 55.5 };
  const sync = [54.4, 58.0, 60.6];
  const spL = range(23.6, 52.2, 2.6).concat(sync), spR = range(25.4, 39.8, 2.4).concat(range(42.6, 52.2, 1.45), sync);
  const newDownAt = (ta) => ta >= T.newDown + 0.8;
  const tollL = (ta) => ta < T.brOut || newDownAt(ta), tollR = (ta) => ta < T.f20Out || newDownAt(ta);
  const endsBR = L.ends(spL, (ta) => ta < T.brOut), ends20 = R.ends(spR, (ta) => ta < T.f20Out);
  const endsNL = L.ends(spL, newDownAt), endsNR = R.ends(spR, newDownAt);
  const cab = (x) => new V3(x, 0.6, 0.22); // the coin goes into the slot on the cabinet front
  // QA: who is the subject when
  S.hero(road.group, "estrada de duas pistas", { when: (t) => (t > 29.0 && t < 33.4) || (t > 50.0 && t < 51.0) });
  S.hero(gNew.group, "pórtico IMPOSTO NOVO", { when: (t) => (t > 55.6 && t < 57.6) || (t > 58.6 && t < 60.4) || t > 61.5 });
  S.hero(gBR.group, "cancela PEDÁGIO (loja brasileira)", { when: (t) => (t > 34.0 && t < 38.8) || (t > 52.5 && t < 53.3) }); S.hero(signL.group, "placa LOJA BRASILEIRA", { when: (t) => t > 34.0 && t < 38.8 });
  S.hero(g20.group, "cancela TAXA 20% (sites de fora)", { when: (t) => t > 39.8 && t < 44.6 }); S.hero(signR.group, "placa SITE DE FORA", { when: (t) => (t > 39.8 && t < 44.6) || (t > 45.15 && t < 48.9) });
  S.hero(zero, "marca ZERO no chão", { when: (t) => t > 45.15 && t < 48.9 });
  const anim = (t) => {
    // old Brazilian toll: lifts its boom per box, then leaves (boom up, sinks into the ground)
    gBR.set(Math.max(boomUp(t, endsBR), sm(t, T.brOut, T.brOut + 0.3))); gBR.group.position.y = -1.8 * sm(t, T.brOut + 0.3, T.brOut + 0.6); gBR.group.visible = t < T.brOut + 0.6;
    gBR.lamp.material.emissiveIntensity = 0.6 + 0.8 * (Math.sin(t * 6) > 0 ? 1 : 0);
    // the 20% toll: pulses at "taxa das blusinhas", then leaves in May
    g20.set(Math.max(boomUp(t, ends20), sm(t, T.f20Out, T.f20Out + 0.3))); g20.group.position.y = -1.8 * sm(t, T.f20Out + 0.35, T.f20Out + 0.9); g20.group.visible = t < T.f20Out + 0.9;
    g20.board.scale.setScalar(1 + 0.12 * Math.sin(clamp((t - 40.95) / 0.6) * Math.PI));
    // the new toll rises from the ground with its booms up, then they come down across both lanes
    gNew.group.visible = t > T.newIn; gNew.group.position.y = -3.0 * (1 - eOut(lin(t, T.newIn, T.newIn + 0.6)));
    const dn = (ends) => (t < T.newDown + 0.8 ? 1 - sm(t, T.newDown, T.newDown + 0.8) : boomUp(t, ends));
    gNew.setL(dn(endsNL)); gNew.setR(dn(endsNR));
    gNew.board.scale.setScalar(1 + 0.1 * Math.sin(clamp((t - 57.75) / 0.6) * Math.PI));
    zero.visible = t > 44.95 && t < T.newIn; zero.scale.setScalar(Math.max(0.0001, pop(t, 45.0, 0.35) * (1 - sm(t, T.newIn - 0.3, T.newIn))));
    L.update(t, spL, tollL, cab(-ROAD.GX)); R.update(t, spR, tollR, cab(ROAD.GX));
    clouds.update(t);
  };
  // wide: the road, the sign bridge and the cabinets (the gate boards sit in the margin, outside the safe area)
  const cabs = [[-2.6, 0, -0.3], [2.6, 1.2, 0.3]], front = [[-1.95, 0, -1.4], [1.95, 0.62, 2.9]];
  const W = poseFit([road.group, cabs, signL.group, signR.group], { from: [0, 0.62, 1], pull: 1.0 });
  const W0 = poseFit([road.group, cabs, signL.group, signR.group], { from: [0, 1.3, 0.6], pull: 1.0 });
  const W2 = poseFit([road.group, cabs, signL.group, signR.group], { from: [0, 0.56, 1], pull: 1.0 });
  const laneL = [[-1.65, 0, -1.3], [0.05, 0.62, 0.8]], laneR = [[-0.05, 0, -1.3], [1.65, 0.62, 0.8]];
  const CB = poseFit([gBR.group, signL.group, laneL], { from: [-0.45, 0.45, 1], pull: 1.06 });
  const CB2 = poseFit([gBR.group, signL.group, laneL], { from: [-0.3, 0.4, 1], pull: 1.0 });
  const CF = poseFit([g20.group, signR.group, laneR], { from: [0.45, 0.45, 1], pull: 1.06 });
  const CF2 = poseFit([g20.group, signR.group, laneR], { from: [0.3, 0.42, 1], pull: 1.0 });
  const CF3 = poseFit([g20.group, signR.group, [[-0.05, 0, -1.3], [1.65, 0.62, 2.6]]], { from: [0.12, 0.62, 1], pull: 1.0 });
  const CF4 = poseFit([g20.group, signR.group, [[-0.05, 0, -1.3], [1.65, 0.62, 2.6]]], { from: [0.02, 0.56, 1], pull: 1.0 });
  const CBm = poseFit([gBR.group, laneL], { from: [-0.25, 0.5, 1], pull: 1.0 });
  const CNw = poseFit([gNew.group, front], { from: [0.06, 0.5, 1], pull: 1.02 }), CNw2 = poseFit([gNew.group, front], { from: [-0.06, 0.46, 1], pull: 1.0 });
  const CN = poseFit([gNew.group], { from: [0.05, 0.3, 1], pull: 1.08 });
  const CN2 = poseFit([gNew.group], { from: [-0.08, 0.26, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.position.set(0, 3.0, 2.0);
    if (t < 39.6) { fill.color.set(GREEN); fill.intensity = 0.6; } else if (t < 49.0) { fill.color.set(t < 44.4 ? RED : GREEN); fill.intensity = 1.0; } else { fill.color.set(ORANGE); fill.intensity = 1.0 + 1.2 * sm(t, 55.4, 56.3); }
    let p = CAM.track(t, [[28.5, W0], [30.8, W, 2.3], [33.2, W2, 2.4], [34.0, CB, 0.8], [38.8, CB2, 4.8], [39.7, CF, 0.9], [44.3, CF2, 4.6], [46.1, CF3, 1.8], [48.9, CF4, 2.8],
      [49.9, W, 1.0], [51.2, W2, 1.3], [52.4, CBm, 1.2], [54.6, CNw, 1.3], [57.6, CNw2, 3.0], [58.5, CN, 0.9], [60.4, CN2, 1.9], [61.4, CNw, 1.0], [64.2, CNw2, 2.8]]);
    p = CAM.shake(CAM.shake(p, t, 56.3, 0.12, 0.35), t, 45.3, 0.08, 0.3);
    CAM.apply(p); duskAir();
  };
});

// ---------------------------------------------------------------- 5. quanto (64.20 – 74.00)
// "Quanto? Naquela blusinha de cem reais, uns onze reais. Menos que os vinte de antes... e mais que o
//  zero de hoje. O número final sai até dezembro."
addScene("quanto", 64.2, 74.0, (S) => {
  S.backdrop(makeStore());
  const dust = makeDust(120, [[-6, 0.2, -4.2], [6, 6, 2.5]], { seed: 17 }); S.backdrop(dust.points);
  const stand = makeBlouseStand(PINK, 1.3, "R$ 100"); stand.position.set(0, 0, -0.1); S.add(stand);
  const pA = makeValuePlinth("ANTES", "R$ 20", RED), pH = makeValuePlinth("HOJE", "R$ 0", GREEN), pN = makeValuePlinth("2027", "≈ R$ 11", ORANGE);
  pA.group.position.set(-1.65, 0, 0); pH.group.position.set(0, 0, 0); pN.group.position.set(1.65, 0, 0); S.add(pA.group, pH.group, pN.group);
  const cA = makeCoinStack(20, { r: 0.36, h: 0.065 }), cN = makeCoinStack(11, { r: 0.36, h: 0.065 });
  cA.group.position.set(-1.65, pA.top, 0); cN.group.position.set(1.65, pN.top, 0); S.add(cA.group, cN.group);
  S.hero(stand, "blusinha no cabide com etiqueta R$ 100", { when: (t) => t < 66.6 });
  S.hero(pN.group, "bloco 2027 ≈ R$ 11", { when: (t) => t > 67.3 }); S.hero(cN.group, "pilha de 11 moedas", { when: (t) => t > 67.9 });
  S.hero(pA.group, "bloco ANTES R$ 20", { when: (t) => t > 69.0 }); S.hero(cA.group, "pilha de 20 moedas", { when: (t) => t > 69.3 });
  S.hero(pH.group, "bloco HOJE R$ 0", { when: (t) => t > 70.9 });
  S.solid(pA.group, "bloco antes"); S.solid(pH.group, "bloco hoje"); S.solid(pN.group, "bloco 2027");
  S.solid(cA.group, "moedas antes", { restsOn: ["bloco antes"] }); S.solid(cN.group, "moedas 2027", { restsOn: ["bloco 2027"] });
  const anim = (t) => {
    // the blouse (R$ 100) leaves as the three blocks come in: 2027 first ("uns onze"), then ANTES, then HOJE
    const out = sm(t, 66.55, 66.9);
    stand.rotation.y = 0.12 * Math.sin(t * 1.0); stand.scale.setScalar(Math.max(0.0001, 1.3 * (1 - out))); stand.visible = out < 0.99;
    popIn(pN.group, t, 66.9, 0.4); cN.set(11 * sm(t, 67.3, 67.85));
    popIn(pA.group, t, 68.4, 0.4); cA.set(20 * sm(t, 68.8, 69.25));
    popIn(pH.group, t, 70.5, 0.4);
    dust.update(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([stand], 64.2, 66.5, { from: [0.25, 0.3, 1], pull: 1.08 }), A1 = shot([stand], 64.2, 66.5, { from: [0.1, 0.28, 1], pull: 1.0 });
  const blocks = [pA.group, pH.group, pN.group, cA.group, cN.group];
  const N0 = shot([pN.group, cN.group], 67.9, 68.4, { from: [0.15, 0.34, 1], pull: 1.1 }), N1 = shot([pN.group, cN.group], 67.9, 68.4, { from: [0.05, 0.32, 1], pull: 1.04 });
  const B0 = shot(blocks, 71.0, 74.0, { from: [0.1, 0.36, 1], pull: 1.05 }), B1 = shot(blocks, 71.0, 74.0, { from: [-0.06, 0.32, 1], pull: 1.0 });
  return (t) => {
    anim(t); floor.visible = false;
    fill.color.set(t < 71.9 ? GOLD : ORANGE); fill.position.set(1.0, 2.8, 2.4); fill.intensity = 1.3;
    CAM.apply(CAM.track(t, [[64.2, A0], [66.5, A1, 2.3], [67.2, N0, 0.7], [68.35, N1, 1.15], [69.0, B0, 0.65], [74.0, B1, 5.0]])); indoorAir(1);
  };
});

// ---------------------------------------------------------------- 6. estado (74.00 – 78.30)
// "E o imposto do estado, que essas compras já pagam hoje, continua igual."
addScene("estado", 74.0, 78.3, (S) => {
  S.backdrop(makeWarehouse());
  const dust = makeDust(140, [[-6, 0.2, -8], [6, 6, 2.5]], { seed: 19 }); S.backdrop(dust.points);
  const box = makeParcel({ w: 1.9, h: 1.3, d: 1.3, label: null }); box.group.rotation.y = 0.14; S.add(box.group);
  let sealPx = 0;
  const seal = makeScreenPanel(1.5, 0.74, (x, w, h) => {
    x.fillStyle = RED; x.fillRect(0, 0, w, h); x.strokeStyle = "#ffffff"; x.lineWidth = 8; roundRect(x, 12, 12, w - 24, h - 24, 18); x.stroke();
    const a = fitText(x, "ESTADO", w / 2, h * 0.33, h * 0.3, 900, "#ffffff", w * 0.84), b = fitText(x, "17% A 20%", w / 2, h * 0.69, h * 0.3, 900, "#ffffff", w * 0.84); sealPx = Math.min(a, b);
  }, { px: 512, bg: RED, label: "selo ESTADO 17% A 20%" });
  seal.setFrac(sealPx / seal.ph);
  seal.mesh.position.set(0, box.h * 0.6, box.d / 2 + 0.02); box.group.add(seal.mesh);
  // "continua igual": a green sticker slapped under the red one
  const keep = makePlate("CONTINUA IGUAL", 1.5, 0.28, { bg: GREEN, fg: "#ffffff", depth: 0.012 }); keep.position.set(0, box.h * 0.17, box.d / 2 + 0.02); box.group.add(keep);
  S.hero(box.group, "caixa com selos ESTADO e CONTINUA IGUAL");
  const anim = (t) => {
    box.open(0);
    const k = eOut(lin(t, 74.5, 74.7)); seal.mesh.visible = t > 74.5; seal.mesh.scale.setScalar(Math.max(0.0001, 1 + 0.7 * (1 - k))); seal.mesh.rotation.z = -0.05 - 0.3 * (1 - k);
    const k2 = eOut(lin(t, 77.55, 77.75)); keep.visible = t > 77.55; keep.scale.setScalar(Math.max(0.0001, 1 + 0.7 * (1 - k2))); keep.rotation.z = 0.03 + 0.25 * (1 - k2);
    dust.update(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([box.group], 74.0, 78.3, { from: [0.22, 0.32, 1], pull: 1.06 }), A1 = shot([box.group], 74.0, 78.3, { from: [-0.02, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t); floor.visible = false;
    fill.color.set(t < 77.5 ? RED : GREEN); fill.position.set(0, 2.6, 2.2); fill.intensity = 1.2;
    CAM.apply(CAM.shake(CAM.shake(CAM.blend(A0, A1, sm(t, 74.0, 78.3)), t, 74.7, 0.15, 0.3), t, 77.75, 0.1, 0.3)); indoorAir(1);
  };
});

// ---------------------------------------------------------------- 7. resumo (78.30 – 86.30)
// "Ou seja: os vinte por cento da taxa das blusinhas não voltam. Mas a blusinha de fora volta, sim,
//  a pagar imposto pro governo."
addScene("resumo", 78.3, 86.3, (S) => {
  const { road, signL, signR, clouds } = buildRoad(S);
  const gNew = newGate(); S.add(gNew.group);
  // where the 20% toll stood: only its mark on the asphalt, crossed out by a thin red line
  const mark = new THREE.Group(); mark.position.set(0.75, 0, 2.2); S.add(mark);
  const m20 = groundMark("20%", 1.1, 0.72, "#34302d", "#f4efe6"); mark.add(m20);
  const xbar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.014, 0.06), mat(RED, { emissive: RED, emissiveIntensity: 0.5 })); xbar.position.y = 0.075; xbar.rotation.y = 0.32; mark.add(xbar);
  const L = makeTraffic(S, ROAD.LX, false), R = makeTraffic(S, ROAD.RX, true);
  const sp = range(75.9, 86.3, 2.5), toll = () => true, ends = L.ends(sp, toll);
  S.hero(mark, "marca 20% riscada no chão", { when: (t) => t > 78.9 && t < 82.6 }); S.hero(signR.group, "placa SITE DE FORA", { when: (t) => t > 78.9 && t < 82.6 });
  S.hero(gNew.group, "pórtico IMPOSTO NOVO", { when: (t) => t > 83.6 });
  const anim = (t) => {
    gNew.setL(boomUp(t, ends)); gNew.setR(boomUp(t, ends));
    xbar.scale.x = Math.max(0.0001, eOut(lin(t, 78.5, 78.9)));
    gNew.board.scale.setScalar(1 + 0.1 * Math.sin(clamp((t - 82.7) / 0.6) * Math.PI));
    L.update(t, sp, toll, new V3(-ROAD.GX, 0.6, 0.22)); R.update(t, sp, toll, new V3(ROAD.GX, 0.6, 0.22));
    clouds.update(t);
  };
  const zone = [[-0.05, 0, -1.0], [1.65, 0.62, 2.7]];
  const C0 = poseFit([mark, signR.group, gNew.group, zone], { from: [0.2, 0.62, 1], pull: 1.04 }), C1 = poseFit([mark, signR.group, gNew.group, zone], { from: [0.06, 0.58, 1], pull: 1.0 });
  const front = [[-1.95, 0, -1.4], [1.95, 0.62, 2.9]];
  const W0 = poseFit([gNew.group, front, signL.group, signR.group], { from: [0, 0.56, 1], pull: 1.04 }), W1 = poseFit([gNew.group, front, signL.group, signR.group], { from: [0, 0.5, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 82.6 ? RED : ORANGE); fill.position.set(0, 3.0, 2.0); fill.intensity = 1.1;
    CAM.apply(CAM.shake(CAM.track(t, [[78.3, C0], [82.6, C1, 4.3], [83.5, W0, 0.9], [86.3, W1, 2.8]]), t, 82.75, 0.1, 0.3)); duskAir();
  };
});

// ---------------------------------------------------------------- 8. pergunta (86.30 – 94.00)
// "Então me diz: em 2027, a taxa das blusinhas volta... ou não volta?"
// Crossroads signpost (to the right of the box): VOLTA points left (higher), NÃO VOLTA points right.
function makeCrossSign() {
  const g = new THREE.Group(), metal = mat("#9aa0a6", { metalness: 0.75, roughness: 0.3 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 3.62, 14), metal); post.position.y = 1.81; g.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.12, 20), mat("#6d6a66", { roughness: 0.8 })); foot.position.y = 0.06; g.add(foot);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), metal); cap.position.y = 3.64; g.add(cap);
  const arrow = (text, dir, color, y, Hh = 0.72) => {
    const W = 1.9, tip = 0.38, s = new THREE.Shape();
    s.moveTo(-W / 2, -Hh / 2); s.lineTo(W / 2 - tip, -Hh / 2); s.lineTo(W / 2, 0); s.lineTo(W / 2 - tip, Hh / 2); s.lineTo(-W / 2, Hh / 2); s.closePath();
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }).translate(0, 0, -0.04), mat(color, { roughness: 0.4 }));
    const bg = new THREE.Group(); bg.position.set(dir * (W / 2 - 0.15), y, 0.1); bg.add(b); if (dir < 0) b.rotation.y = Math.PI; g.add(bg);
    const p = text.includes("\n") ? makePlate2(text, 1.42, Hh - 0.14, { bg: color, fg: "#ffffff", depth: 0.03 }) : makePlate(text, 1.42, 0.52, { bg: color, fg: "#ffffff" }); p.position.set(-dir * 0.14, 0, 0.07); bg.add(p);
    return bg;
  };
  const left = arrow("VOLTA", -1, ORANGE, 3.15), right = arrow("NÃO\nVOLTA", 1, SKYBLUE, 2.2, 1.0);
  g.add(contactShadow(0.8, 0.8));
  return { group: g, left, right };
}
addScene("pergunta", 86.3, 94.0, (S) => {
  S.backdrop(makeLandscape({ road: false, seed: 11 }));
  const clouds = makeClouds(7, 9); S.backdrop(clouds.group);
  // two dirt roads diverging behind the box: the two answers
  const dirt = mat("#ffffff", { map: tileTex(plasterTex("#6a4e36"), 2, 20), roughness: 1 });
  for (const sx of [-1, 1]) { const rd = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 90), dirt); rd.rotation.set(-Math.PI / 2, 0, sx * 0.55); rd.position.set(sx * 24.2, 0.004, -40.5); S.backdrop(rd); }
  const box = makeParcel({ w: 1.3, h: 0.85, d: 1.0, label: "ENCOMENDA", airmail: true }); box.group.scale.setScalar(1.55); S.add(box.group);
  const bl = makeBlouse(PINK); box.group.add(bl);
  const cross = makeCrossSign(); cross.group.position.set(0.8, 0, -1.55); S.add(cross.group);
  S.hero(box.group, "caixa com blusinha"); S.hero(cross.group, "placa VOLTA / NÃO VOLTA", { when: (t) => t > 87.2 });
  S.solid(box.group, "caixa"); S.solid(cross.group, "placa");
  const anim = (t) => {
    box.open(0.72);
    bl.position.set(0, box.floorY + 0.12 + 0.46 * eOut(lin(t, 86.3, 87.2)), -0.05); bl.rotation.x = -0.22;
    const sway = -0.22 * sm(t, 89.9, 90.4) * (1 - sm(t, 90.8, 91.3)) + 0.22 * sm(t, 90.8, 91.3) * (1 - sm(t, 92.0, 92.8)) + 0.08 * Math.sin((t - 92.0) * 2.4) * sm(t, 92.0, 92.8);
    box.group.position.set(-0.45 + sway, 0, 0.85); box.group.rotation.y = 0.12 - 0.25 * sway; bl.rotation.z = 0.08 * Math.sin(t * 2.0);
    popIn(cross.group, t, 86.35, 0.4); cross.left.scale.setScalar(1 + 0.12 * pulse(t, 90.0, 90.6, 0.2)); cross.right.scale.setScalar(1 + 0.12 * pulse(t, 90.9, 91.6, 0.2));
    clouds.update(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([box.group, cross.group], 86.3, 94.0, { from: [0.18, 0.3, 1], pull: 1.02 }), A1 = shot([box.group, cross.group], 86.3, 94.0, { from: [-0.05, 0.26, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 90.7 ? ORANGE : SKYBLUE); fill.position.set(t < 90.7 ? -2 : 2, 2.6, 1.6); fill.intensity = t < 89.8 ? 2.4 : 3.2; hemi.intensity = 1.0; key.intensity = 3.3;
    CAM.apply(CAM.blend(A0, A1, sm(t, 86.3, 94.0))); duskAir();
  };
});
