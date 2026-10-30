// ============================================================================
// videos/2026-10-30-funcoes-senado/scenes.js
// 3D scenes synced to audio/words.json (narration 0.3–91.9 s, video 94.1 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery: generic voting machine and Congress silhouette, no party symbols or colours.
// Câmara = green, Senado = blue (the colours of the two plenaries). The Messias photo card
// (58.4–63.85) covers the stage: no hero is registered behind it.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const BEIGE = "#e7dfd0", PAPER = "#fbf7ef", BLUE = "#2f6fd8", GREY = "#5a5048";

// Canvas texture painted by a function (w x h px). API { tex, ctx, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, ctx: x, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }

// Voting-machine screen for the Senate race: two vote boxes, filled as the voter confirms.
const senadorScreen = (n) => (x, w, h) => {
  x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h);
  centerText(x, "SENADOR", w / 2, 64, "900 76px Inter", "#141414");
  for (let i = 0; i < 2; i++) {
    const bx = 60 + i * 210, done = i < n;
    x.fillStyle = done ? GREEN : "#dfe3e8"; roundRect(x, bx, 120, 180, 150, 18); x.fill();
    centerText(x, `${i + 1}º VOTO`, bx + 90, 160, "900 34px Inter", done ? "#ffffff" : "#141414");
    centerText(x, done ? "OK" : "—", bx + 90, 230, "900 64px Inter", done ? "#ffffff" : "#8a8f96");
  }
  centerText(x, "2 VAGAS", w / 2, 318, "800 34px Inter", "#6a6a6a");
};
function paintKeypad(x, w, h) {
  x.fillStyle = "#262626"; x.fillRect(0, 0, w, h);
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
  const kw = 96, kh = 68, gx = (w - 3 * kw) / 4;
  keys.forEach((k, i) => {
    if (!k) return; const c = i % 3, r = Math.floor(i / 3), px = gx + c * (kw + gx), py = 24 + r * (kh + 18);
    x.fillStyle = "#111"; roundRect(x, px, py, kw, kh, 12); x.fill(); centerText(x, k, px + kw / 2, py + kh / 2 + 3, "800 46px Inter", "#ffffff");
  });
  [["BRANCO", "#f4f4f4", "#141414"], ["CORRIGE", ORANGE, "#141414"], ["CONFIRMA", GREEN, "#ffffff"]].forEach(([t, bg, fg], i) => {
    const bw = (w - 4 * 12) / 3, px = 12 + i * (bw + 12), py = h - 92;
    x.fillStyle = bg; roundRect(x, px, py, bw, 74, 12); x.fill(); centerText(x, t, px + bw / 2, py + 40, "800 26px Inter", fg);
  });
}
// Generic electronic voting machine (same shape as in the 2026-10-30 voto distrital video): wedge-shaped
// body, sloped top with a screen (left) and keypad (right). Origin: floor, centre; front +z.
// API { group, top, screen(painter), keyWorld() → world V3 of the CONFIRMA key }
function makeUrna() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.55, 0); s.lineTo(0.55, 0); s.lineTo(0.55, 0.62); s.lineTo(-0.55, 0.3); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.translate(0, 0, -0.8); geo.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(geo, mat(BEIGE, { roughness: 0.6 })); body.position.y = 0.02; g.add(body);
  const theta = Math.atan2(0.32, 1.1);
  const top = new THREE.Group(); top.position.set(0, 0.48 + 0.025, 0); top.rotation.x = theta; g.add(top);
  const bezel = new THREE.Mesh(rbox(0.8, 0.03, 0.6, 0.01), mat("#3a3a3a")); bezel.position.set(-0.36, 0.0, -0.02); top.add(bezel);
  const scr = canvasTex(512, 356, senadorScreen(0));
  const screenM = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
  screenM.rotation.x = -Math.PI / 2; screenM.position.set(-0.36, 0.017, -0.02); top.add(screenM);
  const kp = canvasTex(400, 440, paintKeypad);
  const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.62), new THREE.MeshStandardMaterial({ map: kp.tex, roughness: 0.6 }));
  keypad.rotation.x = -Math.PI / 2; keypad.position.set(0.42, 0.004, 0.0); top.add(keypad);
  g.add(contactShadow(2.4, 1.8));
  const keyWorld = () => { g.updateMatrixWorld(true); return top.localToWorld(new V3(0.6, 0.01, 0.22)); };
  return { group: g, top, screen: (p) => scr.paint(p), keyWorld };
}
// Lectern: box with a name printed on the front; a pawn stands on top. Origin: floor. API { group, top }
function makeLectern(label, { w = 1.5, h = 0.5, d = 0.85, ph = 0.52 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.05), mat("#6a4a36", { roughness: 0.6 })); b.position.y = h / 2; g.add(b);
  const p = makePlate(label, w * 0.9, h * ph, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h / 2, d / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 1, d + 1));
  return { group: g, top: h };
}
// Round podium. Origin: floor. API { group, top }
function makePodium(r = 0.5, h = 0.3, color = "#3a2a20") {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 36), mat(color, { roughness: 0.6 })); c.position.y = h / 2; g.add(c);
  g.add(contactShadow(r * 3, r * 3)); return { group: g, top: h };
}
// Chair: four legs, seat, back. Origin: floor; front +z. API { group, seat (mesh), seatTop }
function makeChair(color = BLUE) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.6 });
  const seatY = 0.55, sw = 0.66;
  const seat = new THREE.Mesh(rbox(sw, 0.08, sw, 0.02), m); seat.position.y = seatY; g.add(seat);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, seatY - 0.04, 0.06), m); l.position.set(x * (sw / 2 - 0.05), (seatY - 0.04) / 2, z * (sw / 2 - 0.05)); g.add(l); }
  const back = new THREE.Mesh(rbox(sw, 0.7, 0.07, 0.02), m); back.position.set(0, seatY + 0.39, -sw / 2 + 0.035); g.add(back);
  g.add(contactShadow(1.0, 1.0));
  return { group: g, seat, seatTop: seatY + 0.04 };
}
// Low slab with a name printed on its front edge (a "state" the crowd stands on).
// Origin: floor, centre. API { group, top }
function makeSlab(label, w, d, { h = 0.3, color = "#5e4332" } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(rbox(w, h, d, 0.05), mat(color, { roughness: 0.7 })); s.position.y = h / 2; g.add(s);
  if (label) { const p = makePlate(label, Math.min(w * 0.9, label.length * 0.2 + 0.3), h * 0.82, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h / 2, d / 2 + 0.016); g.add(p); }
  g.add(contactShadow(w + 1, d + 1));
  return { group: g, top: h };
}
// Sign board on a post, name printed on the board (faces +z). Origin: foot of the post.
function makeSign(label, w, h, { postH = 1.2, bg = "#141414", fg = "#ffffff" } = {}) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, postH, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); post.position.y = postH / 2; g.add(post);
  const p = makePlate(label, w, h, { bg, fg, depth: 0.06 }); p.position.y = postH + h / 2 - 0.05; g.add(p);
  g.add(contactShadow(0.8, 0.8));
  return g;
}
// Generic National Congress silhouette: low platform, twin towers with a bridge, the Senate dome
// (left, facing down) and the Câmara bowl (right, facing up). Origin: floor, centre; front +z.
// Names are printed on the platform front under each. API { group, top, dome, bowl, domeMat, bowlMat }
function makeCongress() {
  const g = new THREE.Group(), white = mat("#e6e0d4", { roughness: 0.5 });
  const pH = 0.34;
  const plat = new THREE.Mesh(rbox(3.6, pH, 1.8, 0.04), white); plat.position.y = pH / 2; g.add(plat);
  for (const x of [-0.19, 0.19]) { const tw = new THREE.Mesh(rbox(0.32, 2.4, 0.32, 0.02), mat("#cfc8ba", { roughness: 0.5 })); tw.position.set(x, pH + 1.2, -0.55); g.add(tw); }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.3), mat("#cfc8ba")); bridge.position.set(0, pH + 1.9, -0.55); g.add(bridge);
  const r = 0.62;
  const bowlMat = mat("#f1ece2", { roughness: 0.45, side: THREE.DoubleSide, emissive: GREEN, emissiveIntensity: 0 });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bowlMat);
  bowl.position.set(1.1, pH + 0.12 + r, 0.15); g.add(bowl);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 20), white); stem.position.set(1.1, pH + 0.07, 0.15); g.add(stem);
  const domeMat = mat("#f1ece2", { roughness: 0.45, emissive: BLUE, emissiveIntensity: 0 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.set(-1.1, pH, 0.15); g.add(dome);
  const pS = makePlate("SENADO", 1.3, pH * 0.8, { bg: BLUE, fg: "#ffffff" }); pS.position.set(-1.1, pH / 2, 0.916); g.add(pS);
  const pC = makePlate("CÂMARA", 1.3, pH * 0.8, { bg: GREEN, fg: "#ffffff" }); pC.position.set(1.1, pH / 2, 0.916); g.add(pC);
  g.add(contactShadow(4.4, 2.6));
  return { group: g, top: pH, dome, bowl, domeMat, bowlMat };
}
// Generic apartment building: block with a grid of lit windows on the front, a roof slab and a
// door. Origin: floor, centre; front +z. API { group, h }
function makeBuilding({ w = 1.4, d = 1.2, floors = 12, floorH = 0.32, wall = "#d9cbb8" } = {}) {
  const g = new THREE.Group(), h = floors * floorH;
  const cols = Math.max(2, Math.round(w / 0.34));
  const ct = canvasTex(64 * cols, 64 * floors, (x, cw, ch) => {
    x.fillStyle = wall; x.fillRect(0, 0, cw, ch);
    const r = mulberry32(floors * 7 + cols);
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) { x.fillStyle = r() > 0.3 ? "#ffd27a" : "#3a3330"; x.fillRect(c * 64 + 14, f * 64 + 14, 36, 34); }
  });
  const wallM = mat(wall, { roughness: 0.8 }), front = new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.8, emissive: "#ffffff", emissiveMap: ct.tex, emissiveIntensity: 0.25 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [wallM, wallM, wallM, wallM, front, wallM]); body.position.y = h / 2; g.add(body);
  const roof = new THREE.Mesh(rbox(w + 0.04, 0.07, d + 0.04, 0.02), mat("#8a7a6a")); roof.position.y = h + 0.035; g.add(roof);
  g.add(contactShadow(w + 1.2, d + 1.2));
  return { group: g, h, d };
}
// Many small pawns on a grid (instanced), shown one by one in order. Origin: floor, grid centre.
// API { group, show(k) } — k = how many are visible (fractions pop the next one in).
function makeDelegates(n, cols, { sx = 0.22, sz = 0.24, color = ORANGE, size = 0.55 } = {}) {
  const rows = Math.ceil(n / cols), items = [];
  for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols; items.push({ x: (c - (cols - 1) / 2) * sx, z: (r - (rows - 1) / 2) * sz }); }
  const g = new THREE.Group();
  const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.11 * size, 0.26 * size, 6, 10), mat(color, { roughness: 0.5 }), n);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1 * size, 14, 10), mat(color, { roughness: 0.5 }), n);
  bodies.frustumCulled = heads.frustumCulled = false; g.add(bodies, heads);
  const d = new THREE.Object3D();
  function show(k) {
    items.forEach((it, i) => {
      const s = Math.max(0.0001, eBack(clamp(k - i)));
      d.scale.setScalar(s); d.position.set(it.x, 0.24 * size * s, it.z); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
      d.position.set(it.x, 0.56 * size * s, it.z); d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    });
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
    g.visible = k > 0.01;
  }
  show(0);
  return { group: g, show };
}
// Pedestal block with a coloured top and a name on the front. Origin: floor, centre. API { group, top }
function makePedestal(label, color, { w = 1.7, h = 0.8, d = 1.4 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.05), mat("#3a2a20", { roughness: 0.7 })); b.position.y = h / 2; g.add(b);
  const cap = new THREE.Mesh(rbox(w + 0.06, 0.08, d + 0.06, 0.03), mat(color, { roughness: 0.5 })); cap.position.y = h + 0.04; g.add(cap);
  const p = makePlate(label, w * 0.88, h * 0.46, { bg: color, fg: "#ffffff" }); p.position.set(0, h * 0.5, d / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 1, d + 1));
  return { group: g, top: h + 0.08 };
}
// Folder lying flat (no label). Origin: bottom centre. API { group, top }
function makeFlatFolder({ w = 1.5, d = 1.1, color = "#e8c27a" } = {}) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, 0.08, d, 0.02), m); body.position.y = 0.04; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.34, 0.08, 0.14, 0.02), m); tab.position.set(-w * 0.26, 0.04, -d / 2 - 0.06); g.add(tab);
  return { group: g, top: 0.08 };
}
// A plate lying on top of something (readable from above-front). y = surface height.
function printOn(parent, text, w, h, y, z, { bg = "#141414", fg = "#ffffff", twist = 0, x = 0 } = {}) {
  const p = makePlate(text, w, h, { bg, fg }); p.rotation.set(-Math.PI / 2, 0, twist); p.position.set(x, y + 0.016, z); parent.add(p); return p;
}
// Hemicycle of seats (instanced), opening toward +z; seats on `rows` arcs, ordered left → right.
// Origin: floor, centre of the arcs. API { group, n, setColor(i, color) }
function makeHemicycle({ n = 81, rows = 3, r0 = 1.0, dr = 0.36, seat = 0.2, base = "#1e3a6a", color = GREY } = {}) {
  const g = new THREE.Group();
  const radii = []; for (let r = 0; r < rows; r++) radii.push(r0 + r * dr);
  const sum = radii.reduce((a, b) => a + b, 0); const per = radii.map((r) => Math.round(n * r / sum)); per[rows - 1] += n - per.reduce((a, b) => a + b, 0);
  const pos = []; radii.forEach((r, k) => { for (let i = 0; i < per[k]; i++) { const a = Math.PI * (per[k] === 1 ? 0.5 : i / (per[k] - 1)); pos.push({ x: -Math.cos(a) * r, z: -Math.sin(a) * r, a }); } });
  pos.sort((p, q) => p.a - q.a);
  const geo = new THREE.BoxGeometry(seat, seat * 0.7, seat * 0.9); geo.translate(0, seat * 0.35, 0);
  const im = new THREE.InstancedMesh(geo, mat("#ffffff", { roughness: 0.5 }), pos.length);
  const o = new THREE.Object3D();
  pos.forEach((p, i) => { o.position.set(p.x, 0.08, p.z); o.rotation.y = Math.PI / 2 - p.a; o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, new THREE.Color(color)); });
  g.add(im);
  const rOut = radii[rows - 1] + seat * 0.9;
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(rOut, rOut, 0.08, 48, 1, false, Math.PI / 2, Math.PI), mat(base, { roughness: 0.8 })); slab.position.y = 0.04; g.add(slab);
  g.add(contactShadow(rOut * 2.4, rOut * 1.6));
  const c = new THREE.Color();
  return { group: g, n: pos.length, setColor: (i, col) => { im.setColorAt(i, c.set(col)); im.instanceColor.needsUpdate = true; } };
}
// Year post: post with the year printed on a sign on top, and a name plate on the base that pops in
// later. Origin: floor. API { group, sign, caption, light(on) }
function makeYearPost(year, caption, { color = "#3a3330" } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.5, 0.36, 0.7, 0.05), mat("#2a1b12", { roughness: 0.6 })); base.position.y = 0.18; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); post.position.y = 0.36 + 0.45; g.add(post);
  const signM = mat(color, { roughness: 0.5 });
  const board = new THREE.Mesh(rbox(1.4, 0.62, 0.1, 0.04), signM); board.position.y = 1.26 + 0.31; g.add(board);
  const sign = makePlate(year, 1.26, 0.5, { bg: null, fg: "#ffffff" }); sign.position.set(0, 1.57, 0.052); g.add(sign);
  const cap = makePlate(caption, 1.36, 0.26, { bg: "#141414", fg: "#ffffff" }); cap.position.set(0, 0.18, 0.366); g.add(cap);
  g.add(contactShadow(2, 1.2));
  return { group: g, sign, caption: cap, light: (on, col = ORANGE) => { signM.color.set(on ? col : color); signM.emissive = new THREE.Color(on ? col : "#000000"); signM.emissiveIntensity = on ? 0.35 : 0; } };
}
// Hourglass: two glass bulbs (lathe), wooden end discs and three posts, sand in both bulbs.
// Origin: its centre (the neck). Upright, the "upper" bulb is +y. API { group, setFlow(k), halfH, r }
//   setFlow(k): 0 = all sand in the upper bulb, 1 = all in the lower one.
function makeHourglass({ r = 0.48, bulbH = 0.62 } = {}) {
  const g = new THREE.Group(), wood = mat("#5a3a26", { roughness: 0.55 }), sandM = mat("#e8b04a", { roughness: 0.8 });
  const prof = []; for (let i = 0; i <= 24; i++) { const v = i / 24, y = -bulbH + 2 * bulbH * v; const k = Math.abs(y) / bulbH; prof.push(new THREE.Vector2(0.05 + (r - 0.05) * Math.sin(Math.min(1, k) * Math.PI / 2) * (k > 0.9 ? 1 - (k - 0.9) * 2 : 1), y)); }
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshStandardMaterial({ color: "#d8ecff", transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide }));
  g.add(glass);
  const discH = 0.1, halfH = bulbH + discH;
  for (const s of [-1, 1]) { const dsk = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.12, r + 0.12, discH, 40), wood); dsk.position.y = s * (bulbH + discH / 2); g.add(dsk); }
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.5; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2 * bulbH, 10), wood); p.position.set(Math.cos(a) * (r + 0.05), 0, Math.sin(a) * (r + 0.05)); g.add(p); }
  // upper sand: cone, apex at the neck; lower sand: pile on the lower disc, apex up
  const upGeo = new THREE.ConeGeometry(r * 0.82, bulbH * 0.8, 32); upGeo.rotateX(Math.PI); upGeo.translate(0, bulbH * 0.4, 0);
  const up = new THREE.Mesh(upGeo, sandM); g.add(up);
  const loGeo = new THREE.ConeGeometry(r * 0.85, bulbH * 0.7, 32); loGeo.translate(0, bulbH * 0.35, 0);
  const lo = new THREE.Mesh(loGeo, sandM); lo.position.y = -bulbH; g.add(lo);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, bulbH, 6), sandM); stream.position.y = -bulbH / 2; g.add(stream);
  const setFlow = (k) => {
    const a = clamp(1 - k), b = clamp(k);
    up.scale.set(Math.max(0.001, Math.sqrt(a)), Math.max(0.001, a), Math.max(0.001, Math.sqrt(a))); up.visible = a > 0.01;
    lo.scale.set(Math.max(0.001, Math.sqrt(b)), Math.max(0.001, b), Math.max(0.001, Math.sqrt(b))); lo.visible = b > 0.01;
    stream.visible = k > 0.01 && k < 0.99;
  };
  setFlow(0);
  return { group: g, setFlow, halfH, r: r + 0.12 };
}
// Standing block with a name printed on the front. Origin: floor, centre.
function makeBlock(label, { w = 1.2, h = 1.0, d = 0.32, color = "#3a3330", fg = "#ffffff", ph = 0.3 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.05), mat(color, { roughness: 0.6 })); b.position.y = h / 2; g.add(b);
  const p = makePlate(label, w * 0.9, h * ph, { bg: "#141414", fg }); p.position.set(0, h * 0.5, d / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 0.8, d + 0.9));
  return g;
}
// Balance scale: base, post, beam pivoting at the top; each pan hangs vertically under a beam end.
// Origin: floor. API { group, setTilt(a), panL, panR (groups: put items at y = panTop) , panTop }
function makeBalance({ arm = 1.7, postH = 2.4, hang = 1.75 } = {}) {
  const g = new THREE.Group(), metal = mat("#c9a45a", { metalness: 0.65, roughness: 0.3 }), dark = mat("#2a1b12", { roughness: 0.6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.16, 32), dark); base.position.y = 0.08; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, postH, 16), metal); post.position.y = 0.16 + postH / 2; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 0.16 + postH; g.add(beam);
  const beamBar = new THREE.Mesh(rbox(2 * arm + 0.2, 0.1, 0.12, 0.03), metal); beam.add(beamBar);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), metal); beam.add(cap);
  const pans = [-1, 1].map((sx) => {
    const end = new THREE.Group(); end.position.set(sx * arm, 0, 0); beam.add(end);
    // a rod down to a yoke bar, then two strings from the bar ends to the pan rim (they pass outside what sits on the pan)
    const yoke = 0.5, half = 0.72;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, yoke, 8), metal); top.position.y = -yoke / 2; end.add(top);
    const bar = new THREE.Mesh(rbox(2 * half + 0.1, 0.06, 0.06, 0.02), metal); bar.position.y = -yoke; end.add(bar);
    for (const x of [-half, half]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, hang - yoke, 8), metal); r.position.set(x, -yoke - (hang - yoke) / 2, 0); end.add(r); }
    const pan = new THREE.Group(); pan.position.y = -hang; end.add(pan);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.62, 0.08, 36), metal); dish.position.y = 0.04; pan.add(dish);
    return { end, pan };
  });
  g.add(contactShadow(3, 1.6));
  const setTilt = (a) => { beam.rotation.z = a; pans.forEach((p) => { p.end.rotation.z = -a; }); };
  setTilt(0);
  return { group: g, setTilt, panL: pans[0].pan, panR: pans[1].pan, panTop: 0.08 };
}

// Shared shot helper per scene.
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.06 }, o));
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));

// ---------------------------------------------------------------- 1. gancho (0 – 3.9)
// "Você votou em dois senadores este mês. Sabe o que eles fazem?"
addScene("gancho", 0, 3.9, (S) => {
  const u = makeUrna(); u.group.position.set(-0.75, 0, 0); u.group.scale.setScalar(1.25); S.add(u.group);
  const pods = [1.35, 2.35].map((x) => { const p = makePodium(0.38, 0.26); p.group.position.set(x, 0, 0.1); S.add(p.group); return p; });
  const sens = pods.map((p) => { const s = makePerson(BLUE); s.scale.setScalar(1.3); s.position.set(p.group.position.x, p.top, 0.1); S.add(s); return s; });
  const qs = sens.map((s, i) => { const q = sprite(chipTex("?", { bg: ORANGE, font: "900 150px Inter", h: 200, pad: 40 }), 0.5); q.position.set(s.position.x, 1.75, 0.1); S.add(q); return q; });
  S.hero(u.group, "urna eletrônica");
  pods.forEach((p, i) => S.hero(p.group, "pódio " + (i + 1), { when: (t) => t > 2.9 }));
  sens.forEach((s, i) => S.hero(s, "senador " + (i + 1), { when: (t) => t > [2.95, 3.25][i] }));
  qs.forEach((q, i) => S.label(q, "? " + (i + 1), { on: "senador " + (i + 1), when: (t) => t > [3.2, 3.4][i] }));
  S.solid(u.group, "urna"); pods.forEach((p, i) => S.solid(p.group, "pódio " + (i + 1)));
  sens.forEach((s, i) => S.solid(s, "senador " + (i + 1), { restsOn: ["pódio " + (i + 1)], when: (t) => t > 3.3 }));
  let painted = -1;
  const presses = [1.3, 2.0];
  const anim = (t) => {
    const n = presses.filter((p) => t > p + 0.06).length;
    if (n !== painted) { u.screen(senadorScreen(n)); painted = n; }
    u.group.scale.setScalar(1.25 * presses.reduce((k, p) => k + 0.035 * Math.sin(clamp((t - p) / 0.25) * Math.PI), 1));
    pods.forEach((p, i) => popIn(p.group, t, [2.55, 2.85][i], 0.4));
    sens.forEach((s, i) => { const at = [2.7, 3.0][i]; s.visible = t > at; s.scale.setScalar(1.3 * Math.max(0.0001, pop(t, at, 0.4))); s.rotation.y = 0.3 * Math.sin(t * 3 + i); });
    qs.forEach((q, i) => { popSprite(q, t, [2.95, 3.2][i], 0.3); q.position.y = 1.75 + 0.05 * Math.sin(t * 6 + i); });
  };
  const shot = shotOf(anim);
  const objs = [u.group, ...pods.map((p) => p.group), ...sens, ...qs];
  const U0 = shot([u.group], 0, 2.3, { from: [-0.3, 0.95, 1], pull: 1.08 }), U1 = shot([u.group], 0, 2.3, { from: [-0.1, 0.9, 1], pull: 1.0 });
  const A1 = shot(objs, 2.4, 3.9, { from: [0.15, 0.55, 1], pull: 1.0 }), A2 = shot(objs, 2.4, 3.9, { from: [0.22, 0.5, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 2.6 ? ORANGE : BLUE); fill.position.set(t < 2.6 ? -0.8 : 1.8, 2.2, 1.5); fill.intensity = 3.5;
    CAM.apply(CAM.track(t, [[0, U0], [2.2, U1, 2.2], [2.75, A1, 0.55], [3.9, A2, 1.15]]));
  };
});

// ---------------------------------------------------------------- 2. plenário (3.9 – 12.0)
// "Imagina: você é um deles. Entra no plenário azul, debaixo da cúpula virada pra baixo, e senta numa
//  das oitenta e uma cadeiras."  — Congresso (zoom na cúpula do Senado) → plenário azul
addScene("plenario", 3.9, 12.0, (S) => {
  const frA = makePhotoFrame("congresso", { w: 2.4, name: "CONGRESSO" }); S.add(frA.group);
  const XB = 6;
  const frB = makePhotoFrame("plenario", { w: 2.4, name: "PLENÁRIO" }); frB.group.position.x = XB; S.add(frB.group);
  const onA = (t) => (t > 4.55 && t < 5.55) || (t > 7.75 && t < 9.1), onB = (t) => (t > 6.15 && t < 7.05) || t > 9.7;
  S.hero(frA.group, "porta-retrato do Congresso", { when: onA });
  S.hero(frB.group, "porta-retrato do plenário", { when: onB });
  S.solid(frA.group, "porta-retrato A"); S.solid(frB.group, "porta-retrato B");
  const anim = (t) => {
    frA.frame.rotation.y = 1.2 * (1 - eOut(lin(t, 3.9, 4.55)));
    frA.zoom(1 + 0.1 * lin(t, 3.9, 5.9) + 0.8 * sm(t, 7.4, 9.3));
    frB.frame.rotation.y = -1.0 * (1 - eOut(lin(t, 5.85, 6.45)));
    frB.zoom(1 + 0.06 * lin(t, 5.9, 7.35) + 0.14 * lin(t, 9.35, 12.0));
  };
  const shot = shotOf(anim);
  const A0 = shot([frA.group], 4.55, 9.3, { from: [-0.22, 0.25, 1], pull: 1.0 }), A1 = shot([frA.group], 4.55, 9.3, { from: [-0.05, 0.22, 1], pull: 1.0 });
  const A2 = shot([frA.group], 4.55, 9.3, { from: [0.05, 0.2, 1], pull: 1.0 }), A3 = shot([frA.group], 4.55, 9.3, { from: [0.18, 0.18, 1], pull: 1.0 });
  const B0 = shot([frB.group], 6.45, 12.0, { from: [0.2, 0.25, 1], pull: 1.02 }), B1 = shot([frB.group], 6.45, 12.0, { from: [0.08, 0.22, 1], pull: 1.0 });
  const B2 = shot([frB.group], 6.45, 12.0, { from: [0.0, 0.22, 1], pull: 1.02 }), B3 = shot([frB.group], 6.45, 12.0, { from: [-0.15, 0.2, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const onPlen = (t > 5.9 && t < 7.4) || t > 9.35;
    fill.color.set(onPlen ? BLUE : ORANGE); fill.position.set(onPlen ? XB : 0, 2.4, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.shake(CAM.track(t, [[3.9, A0], [5.6, A1, 1.7], [5.95, B0, 0.35], [7.3, B1, 1.35], [7.75, A2, 0.4], [9.25, A3, 1.5], [9.7, B2, 0.4], [12.0, B3, 2.3]]), t, 10.38, 0.03, 0.35));
  };
});

// ---------------------------------------------------------------- 3. mistério (12.0 – 20.6)
// "Mas olha o mistério: São Paulo tem setenta vezes mais gente que Roraima… e os dois têm os mesmos
//  três senadores. Por quê?"
addScene("misterio", 12.0, 20.6, (S) => {
  const sp = makeSlab(null, 4.1, 2.9); sp.group.position.set(-0.7, 0, -1.1); S.add(sp.group);
  const spCrowd = makeCrowd({ rows: 7, cols: 10, sx: 0.37, sz: 0.37, seed: 5 }); spCrowd.group.position.y = sp.top; sp.group.add(spCrowd.group);
  const spSign = makeSign("SÃO PAULO", 2.9, 0.72, { postH: 1.0 }); spSign.position.set(0, sp.top, -1.3); sp.group.add(spSign);
  const rr = makeSlab(null, 1.2, 1.0); rr.group.position.set(2.75, 0, 1.6); S.add(rr.group);
  const rrCrowd = makeCrowd({ rows: 1, cols: 1, sx: 0.4, sz: 0.4, seed: 9 }); rrCrowd.group.position.y = rr.top; rr.group.add(rrCrowd.group);
  const rrSign = makeSign("RORAIMA", 2.5, 0.8, { postH: 0.8 }); rrSign.position.set(0, rr.top, -0.38); rr.group.add(rrSign);
  // three blue chairs in front of each state
  const chairs = [];
  for (const [cx, cz, gap, k] of [[-0.7, 1.05, 0.75, 0.62], [2.75, 2.55, 0.45, 0.5]]) for (let i = 0; i < 3; i++) {
    const c = makeChair(BLUE); c.group.scale.setScalar(k); c.group.position.set(cx + (i - 1) * gap, 0, cz); S.add(c.group); chairs.push({ c, k });
  }
  S.hero(sp.group, "São Paulo com multidão", { when: (t) => t > 13.6 }); S.hero(rr.group, "Roraima com grupinho", { when: (t) => t > 16.6 });
  chairs.forEach(({ c }, i) => S.hero(c.group, "cadeira azul " + (i + 1), { when: (t) => t > 19.4 }));
  S.solid(sp.group, "sp"); S.solid(rr.group, "rr"); chairs.forEach(({ c }, i) => S.solid(c.group, "cadeira " + (i + 1)));
  const anim = (t) => {
    popIn(sp.group, t, 12.05, 0.45); spCrowd.reveal(lin(t, 12.4, 14.6));
    popIn(rr.group, t, 12.25, 0.45); rrCrowd.reveal(lin(t, 16.3, 16.9));
    chairs.forEach(({ c, k }, i) => popIn(c.group, t, 18.9 + (i % 3) * 0.12 + (i > 2 ? 0.05 : 0), 0.35, k));
  };
  const shot = shotOf(anim);
  const objs = [sp.group, rr.group, ...chairs.map(({ c }) => c.group)];
  const A0 = shot(objs, 12.0, 20.6, { from: [-0.1, 1.5, 1], pull: 1.04 }), A1 = shot(objs, 12.0, 20.6, { from: [0.15, 1.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 18.9 ? ORANGE : BLUE); fill.position.set(t < 16.3 ? -0.7 : 2.75, 2.6, 2.0); fill.intensity = 3 + 2 * (t > 18.9 && t < 19.6 ? 1 : 0);
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 12.0, 20.6)), t, 18.94, 0.035, 0.35));
  };
});

// ---------------------------------------------------------------- 4. condomínio (20.6 – 43.1)
// "Pensa num condomínio com vários prédios. Na Câmara, cada prédio manda representantes conforme o número
//  de moradores: o prédio gigante manda setenta, o pequeno manda oito. No Senado, cada prédio manda três,
//  não importa o tamanho. Assim, os prédios grandes não decidem tudo sozinhos. [39.2] A Câmara representa
//  o povo. O Senado representa os estados."
addScene("condominio", 20.6, 43.1, (S) => {
  const big = makeBuilding({ w: 1.7, d: 1.3, floors: 10 }); big.group.position.set(-1.95, 0, -1.6); S.add(big.group);
  const small = makeBuilding({ w: 1.3, d: 1.1, floors: 3, wall: "#c9b49a" }); small.group.position.set(1.85, 0, -1.4); S.add(small.group);
  const tileB = makeSlab(null, 2.6, 1.9, { h: 0.2 }); tileB.group.position.set(-1.95, 0, 0.75); S.add(tileB.group);
  const tileS = makeSlab(null, 1.5, 1.9, { h: 0.2 }); tileS.group.position.set(1.85, 0, 0.75); S.add(tileS.group);
  // Câmara: 70 and 8 representatives; Senado: 3 and 3
  const repB = makeDelegates(70, 10, { sx: 0.23, sz: 0.24 }); repB.group.position.set(0, tileB.top, 0.05); tileB.group.add(repB.group);
  const repS = makeDelegates(8, 4, { sx: 0.3, sz: 0.62 }); repS.group.position.set(0, tileS.top, 0.05); tileS.group.add(repS.group);
  const senB = [], senS = [];
  for (let i = 0; i < 3; i++) {
    const a = makePerson(BLUE); a.position.set((i - 1) * 0.6, tileB.top, 0.15); tileB.group.add(a); senB.push(a);
    const b = makePerson(BLUE); b.position.set((i - 1) * 0.42, tileS.top, 0.15); tileS.group.add(b); senS.push(b);
  }
  // house sign between the buildings: CÂMARA (green) → SENADO (blue)
  const sign = new THREE.Group(); sign.position.set(0, 0, -0.55); S.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); post.position.y = 0.8; sign.add(post);
  const sC = makePlate("CÂMARA", 1.6, 0.62, { bg: GREEN, fg: "#ffffff", depth: 0.06 }); sC.position.y = 1.95; sign.add(sC);
  const sS = makePlate("SENADO", 1.6, 0.62, { bg: BLUE, fg: "#ffffff", depth: 0.06 }); sS.position.y = 1.95; sign.add(sS);
  sign.add(contactShadow(0.8, 0.8));
  // counts on banners hung on each building's facade
  const counts = [["70", big, 1.25], ["8", small, 0.5], ["3", big, 1.25], ["3", small, 0.5]].map(([txt, b, y], i) => {
    const p = makePlate(txt, b === big ? 1.0 : 0.62, b === big ? 0.66 : 0.48, { bg: i < 2 ? GREEN : BLUE, fg: "#ffffff", depth: 0.04 }); p.position.set(0, y, b.d / 2 + 0.021); b.group.add(p); return p;
  });
  // shot D: the Congress, bowl = Câmara (people), dome = Senado (states)
  const XD = 12;
  const cg = makeCongress(); cg.group.position.set(XD, 0, 0); cg.group.scale.setScalar(1.1); S.add(cg.group);
  S.hero(big.group, "prédio gigante", { when: (t) => t > 21.0 && t < 39.0 }); S.hero(small.group, "prédio pequeno", { when: (t) => t > 21.5 && t < 39.0 });
  S.hero(tileB.group, "base do prédio gigante", { when: (t) => t > 23.3 && t < 39.2 }); S.hero(tileS.group, "base do prédio pequeno", { when: (t) => t > 23.3 && t < 39.2 });
  S.hero(sign, "placa Câmara/Senado", { when: (t) => t > 23.6 && t < 39.2 });
  S.hero(cg.group, "Congresso Nacional", { when: (t) => t > 39.4 });
  S.solid(big.group, "prédio gigante"); S.solid(small.group, "prédio pequeno"); S.solid(tileB.group, "base gigante"); S.solid(tileS.group, "base pequena"); S.solid(cg.group, "congresso");
  const anim = (t) => {
    popIn(big.group, t, 20.6, 0.5); popIn(small.group, t, 21.1, 0.45);
    popIn(tileB.group, t, 23.2, 0.4); popIn(tileS.group, t, 23.35, 0.4);
    popIn(sign, t, 23.4, 0.4);
    sC.visible = t < 31.75; sS.visible = t >= 31.75;
    sign.rotation.y = t > 31.55 && t < 31.95 ? Math.PI * 2 * sm(t, 31.55, 31.95) : 0.12 * Math.sin(t * 1.3);
    const out = 1 - sm(t, 31.6, 32.1);
    repB.show(70 * lin(t, 25.9, 29.1) * (out > 0.01 ? 1 : 0)); repB.group.scale.setScalar(Math.max(0.0001, out));
    repS.show(8 * lin(t, 30.2, 30.95) * (out > 0.01 ? 1 : 0)); repS.group.scale.setScalar(Math.max(0.0001, out));
    senB.forEach((p, i) => { const at = 32.9 + i * 0.22; p.visible = t > at; p.scale.setScalar(Math.max(0.0001, pop(t, at, 0.35))); p.position.y = tileB.top + (t > 35.6 && t < 39.2 ? 0.12 * Math.abs(Math.sin((t - 35.6) * 5 + i)) : 0); });
    senS.forEach((p, i) => { const at = 33.0 + i * 0.22; p.visible = t > at; p.scale.setScalar(Math.max(0.0001, pop(t, at, 0.35))); p.position.y = tileS.top + (t > 35.6 && t < 39.2 ? 0.12 * Math.abs(Math.sin((t - 35.6) * 5 + i + 1.5)) : 0); });
    counts[0].visible = t > 29.16 && t < 31.6; counts[1].visible = t > 30.96 && t < 31.6;
    counts[2].visible = t > 33.6; counts[3].visible = t > 33.65;
    cg.bowlMat.emissiveIntensity = 0.55 * sm(t, 40.2, 40.6); cg.domeMat.emissiveIntensity = 0.55 * sm(t, 41.5, 41.9);
  };
  const shot = shotOf(anim);
  const objsA = [big.group, small.group];
  const A0 = shot(objsA, 20.6, 23.2, { from: [-0.2, 0.35, 1], pull: 1.08 }), A1 = shot(objsA, 20.6, 23.2, { from: [0.05, 0.3, 1], pull: 1.0 });
  const objsB = [big.group, small.group, tileB.group, tileS.group, sign];
  const B0 = shot(objsB, 23.2, 39.2, { from: [-0.12, 0.75, 1], pull: 1.06 }), B1 = shot(objsB, 23.2, 39.2, { from: [0.12, 0.85, 1], pull: 1.0 });
  const B2 = shot(objsB, 23.2, 39.2, { from: [-0.08, 0.65, 1], pull: 1.0 });
  const D0 = shot([cg.group], 39.2, 43.1, { from: [-0.15, 0.35, 1], pull: 1.08 }), D1 = shot([cg.group], 39.2, 43.1, { from: [0.15, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 31.6 ? (t > 23.2 ? GREEN : ORANGE) : t < 39.2 ? BLUE : t < 41.5 ? GREEN : BLUE);
    fill.position.set(t < 39.2 ? 0 : XD + (t < 41.5 ? 1.2 : -1.2), 2.8, 2.0); fill.intensity = 3.2;
    CAM.apply(CAM.shake(CAM.track(t, [[20.6, A0], [23.0, A1, 2.4], [23.6, B0, 0.6], [31.5, B1, 7.9], [39.0, B2, 7.5], [39.4, D0, 0.4], [43.1, D1, 3.7]]), t, 33.6, 0.035, 0.35));
  };
});

// ---------------------------------------------------------------- 5. revisa as leis (43.1 – 49.6)
// "E o que você faz lá? Primeiro: revisa as leis. Toda lei federal precisa passar pelas duas casas."
addScene("leis", 43.1, 49.6, (S) => {
  const pc = makePedestal("CÂMARA", GREEN, { w: 1.8, h: 0.9 }); pc.group.position.set(-1.1, 0, 0); S.add(pc.group);
  const ps = makePedestal("SENADO", BLUE, { w: 1.8, h: 0.9 }); ps.group.position.set(1.1, 0, 0); S.add(ps.group);
  // the bill stands on the pedestal facing us; the stamps hit its front
  const doc = makeFolder("LEI", { w: 1.3, h: 1.45, color: PAPER }); S.add(doc);
  const pr1 = makePlate("APROVADO", 1.16, 0.3, { bg: GREEN, fg: "#ffffff" }); pr1.rotation.z = 0.06; pr1.position.set(0, 0.36, 0.06); doc.add(pr1);
  const pr2 = makePlate("REVISADO", 1.16, 0.3, { bg: BLUE, fg: "#ffffff" }); pr2.rotation.z = -0.05; pr2.position.set(0, 1.1, 0.06); doc.add(pr2);
  S.hero(pc.group, "pedestal Câmara"); S.hero(ps.group, "pedestal Senado"); S.hero(doc, "folha da lei", { when: (t) => t > 43.6 });
  S.solid(pc.group, "pedestal câmara"); S.solid(ps.group, "pedestal senado");
  S.solid(doc, "lei", { restsOn: ["pedestal câmara", "pedestal senado"], when: (t) => t > 43.6 && (t < 46.4 || t > 47.3) });
  const A = new V3(-1.1, pc.top + 0.005, 0.3), B = new V3(1.1, ps.top + 0.005, 0.3);
  const anim = (t) => {
    popIn(doc, t, 43.3, 0.4);
    doc.position.copy(hop(A, B, sm(t, 46.4, 47.3), 0.7)); doc.rotation.y = 0.06 * Math.sin(t * 2);
    // the marks slam onto the bill like a stamp: 45.92 (Câmara) and 48.0 (Senado)
    for (const [pr, at] of [[pr1, 45.92], [pr2, 48.0]]) { pr.visible = t > at; pr.scale.setScalar(1 + 0.8 * (1 - eOut(lin(t, at, at + 0.16)))); }
  };
  const shot = shotOf(anim);
  const objs = [pc.group, ps.group, doc];
  const A0 = shot(objs, 43.1, 49.6, { from: [-0.15, 0.42, 1], pull: 1.0 }), A1 = shot(objs, 43.1, 49.6, { from: [0.15, 0.36, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 46.8 ? GREEN : BLUE); fill.position.set(t < 46.8 ? -1.2 : 1.2, 2.6, 1.8); fill.intensity = 3.2;
    CAM.apply(CAM.shake(CAM.shake(CAM.blend(A0, A1, sm(t, 43.1, 49.6)), t, 45.92, 0.04, 0.3), t, 48.0, 0.04, 0.3));
  };
});

// ---------------------------------------------------------------- 6. aprova autoridades (49.6 – 58.3)
// "Segundo: aprova quem o presidente escolhe pro Supremo, pro Banco Central, pra Procuradoria-Geral e
//  pras embaixadas. [56.94] E não é só carimbo."
addScene("autoridades", 49.6, 58.3, (S) => {
  const pod = makeLectern("PRESIDENTE"); pod.group.position.set(-3.6, 0, 0.2); S.add(pod.group);
  const pres = makePerson(CREAM); pres.scale.setScalar(1.5); pres.position.set(-3.6, pod.top, 0.1); S.add(pres);
  const labels = ["STF", "BANCO CENTRAL", "PGR", "EMBAIXADAS"], times = [52.58, 53.32, 54.7, 56.08];
  const xs = [-1.5, 0.75, 3.0, 5.25];
  const folders = labels.map((l) => { const f = makeFolder(l, { w: 1.25, h: 1.45, color: "#e8c27a" }); S.add(f); return f; });
  const reject = makePlate("REJEITADO", 1.1, 0.3, { bg: RED, fg: "#ffffff" }); reject.rotation.z = -0.14; reject.position.set(0, 0.36, 0.06); folders[0].add(reject);
  // each folder is the subject from its landing until the next one lands (the camera follows it)
  const until = [53.0, 54.35, 55.7, 56.7];
  S.hero(pod.group, "púlpito do presidente", { when: (t) => t < 52.0 }); S.hero(pres, "presidente", { when: (t) => t < 52.0 });
  folders.forEach((f, i) => S.hero(f, "pasta " + labels[i], { when: (t) => t > times[i] + 0.1 && t < until[i] }));
  S.hero(folders[0], "pasta STF carimbada", { when: (t) => t > 57.3 });
  S.solid(pod.group, "pódio"); S.solid(pres, "presidente", { restsOn: ["pódio"] });
  folders.forEach((f, i) => S.solid(f, "pasta " + i, { when: (t) => t > times[i] + 0.1 }));
  const from = new V3(-3.6, 1.4, 0.2);
  const anim = (t) => {
    folders.forEach((f, i) => {
      const at = times[i] - 0.45, k = sm(t, at, at + 0.45);
      f.visible = t > at; f.position.copy(hop(from, new V3(xs[i], 0, 0), k, 0.7)); f.rotation.y = 0.9 * (1 - k);
      f.scale.setScalar(Math.max(0.0001, 0.4 + 0.6 * k));
    });
    pres.rotation.y = 0.4 + 0.3 * Math.sin(t * 2.5);
    // REJEITADO slams onto the STF folder at 57.68
    reject.visible = t > 57.68; reject.scale.setScalar(1 + 0.9 * (1 - eOut(lin(t, 57.68, 57.86))));
  };
  const shot = shotOf(anim);
  const P0 = shot([pod.group, pres], 49.6, 52.0, { from: [-0.25, 0.4, 1], pull: 1.04 }), P1 = shot([pod.group, pres], 49.6, 52.0, { from: [0.1, 0.35, 1], pull: 1.0 });
  const F = folders.map((f, i) => shot([f], times[i] + 0.1, until[i], { from: [0.12 * (i % 2 ? -1 : 1), 0.3, 1], pull: 1.0 }));
  const B0 = shot([folders[0]], 56.9, 58.3, { from: [0.15, 0.3, 1], pull: 1.2 }), B1 = shot([folders[0]], 56.9, 58.3, { from: [0.05, 0.28, 1], pull: 1.12 });
  return (t) => {
    anim(t);
    fill.color.set(t < 57.6 ? ORANGE : RED); fill.position.set(t < 52 ? -3.6 : t < 56.9 ? 0.6 : xs[0], 2.4, 1.8); fill.intensity = 3 + (t > 57.68 && t < 58.3 ? 3 : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[49.6, P0], [51.8, P1, 2.2], [52.6, F[0], 0.55], [53.35, F[1], 0.3], [54.75, F[2], 0.35], [56.1, F[3], 0.35], [57.15, B0, 0.4], [58.3, B1, 1.15]]), t, 57.68, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 7. Messias (58.3 – 69.2)
// "Em abril, o presidente indicou Jorge Messias pro Supremo. Precisava de quarenta e um votos. [cartão
//  58.4–63.85] Teve trinta e quatro. Foi a primeira rejeição em cento e trinta e dois anos."
addScene("messias", 58.3, 69.2, (S) => {
  const fr = makePhotoFrame("painel", { w: 2.6, name: "PLACAR" }); S.add(fr.group);
  S.hero(fr.group, "porta-retrato do placar", { when: (t) => t > 64.4 }); S.solid(fr.group, "porta-retrato");
  const anim = (t) => {
    fr.group.visible = t > 63.85;
    fr.frame.rotation.y = 1.3 * (1 - eOut(lin(t, 63.85, 64.4)));
    fr.zoom(1 + 0.15 * sm(t, 64.2, 69.2));
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 64.4, 69.2, { from: [-0.2, 0.22, 1], pull: 1.02 }), A1 = shot([fr.group], 64.4, 69.2, { from: [0.12, 0.18, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(RED); fill.position.set(0.8, 2.4, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 58.3, 69.2)), t, 67.44, 0.035, 0.35));
  };
});

// ---------------------------------------------------------------- 8. impeachment (69.2 – 80.9)
// "Terceiro: se a Câmara abre um impeachment, quem julga o presidente é você. [73.9] Pra tirar do cargo,
//  precisa de cinquenta e quatro dos oitenta e um. [77.7] O Senado já julgou dois: Collor e Dilma."
addScene("impeachment", 69.2, 80.9, (S) => {
  const hemi = makeHemicycle({ n: 81, rows: 4, r0: 1.55, dr: 0.45, seat: 0.27 }); S.add(hemi.group);
  const pod = makeLectern("PRESIDENTE", { w: 2.6, h: 0.9, d: 0.8, ph: 0.62 }); pod.group.position.set(0, 0.08, -0.1); S.add(pod.group);
  const pres = makePerson(CREAM); pres.scale.setScalar(1.3); pres.position.set(0, 0.08 + pod.top, -0.2); pres.rotation.y = Math.PI; S.add(pres);
  const YOU = 52;                                              // "você": one seat of the outer arcs lights up blue
  const XC = 12;
  const posts = [["1992", "COLLOR"], ["2016", "DILMA"]].map(([y, c], i) => { const p = makeYearPost(y, c, { color: "#6a5446" }); p.group.position.set(XC + (i - 0.5) * 2.0, 0, 0); S.add(p.group); return p; });
  S.hero(hemi.group, "semicírculo de 81 cadeiras", { when: (t) => t < 77.4 }); S.hero(pod.group, "púlpito do presidente", { when: (t) => t < 75.4 }); S.hero(pres, "presidente de costas", { when: (t) => t < 75.4 });
  posts.forEach((p, i) => S.hero(p.group, "placa " + ["1992", "2016"][i], { when: (t) => t > 77.95 }));
  S.solid(pod.group, "púlpito"); S.solid(pres, "presidente", { restsOn: ["púlpito"] });
  posts.forEach((p, i) => S.solid(p.group, "poste " + i));
  const anim = (t) => {
    for (let i = 0; i < hemi.n; i++) {
      let c = GREY;
      if (i < 54 && t > 75.6 + (i / 54) * 1.3) c = ORANGE;
      else if (i === YOU && t > 73.3 && t < 75.6) c = Math.sin((t - 73.3) * 9) > -0.3 ? BLUE : "#7aa6ff";
      hemi.setColor(i, c);
    }
    pres.rotation.y = Math.PI + 0.2 * Math.sin(t * 1.6);
    posts.forEach((p, i) => { const at = [79.74, 80.46][i]; p.caption.visible = t > at; p.light(t > at, ORANGE); });
  };
  const shot = shotOf(anim);
  const objsA = [hemi.group, pod.group, pres];
  const A0 = shot(objsA, 69.2, 77.5, { from: [0.3, 0.9, 1], pull: 1.0 }), A1 = shot(objsA, 69.2, 77.5, { from: [-0.1, 1.1, 1], pull: 1.0 });
  const A2 = shot(objsA, 69.2, 77.5, { from: [0.12, 1.15, 1], pull: 1.0 });
  const allC = posts.map((p) => p.group);
  const C0 = shot(allC, 77.7, 80.9, { from: [-0.15, 0.35, 1], pull: 1.06 }), C1 = shot(allC, 77.7, 80.9, { from: [0.15, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 73.3 && t < 75.6 ? BLUE : ORANGE); fill.position.set(t < 77.7 ? 0 : XC, 2.8, 1.8); fill.intensity = 3.2;
    let P = CAM.track(t, [[69.2, A0], [73.3, A1, 4.1], [77.4, A2, 3.5], [77.95, C0, 0.5], [80.9, C1, 2.95]]);
    P = CAM.shake(P, t, 73.34, 0.04, 0.35);
    CAM.apply(P);
  };
});

// ---------------------------------------------------------------- 9. mandato (80.9 – 85.8)
// "E tudo isso por oito anos. Um mandato que atravessa dois governos."
addScene("mandato", 80.9, 85.8, (S) => {
  const ped = makePedestal("8 ANOS", ORANGE, { w: 1.7, h: 0.85, d: 1.4 }); ped.group.position.set(-1.0, 0, 0); S.add(ped.group);
  const hg = makeHourglass(); S.add(hg.group);
  const blocks = ["GOVERNO 1", "GOVERNO 2"].map((l, i) => { const b = makeBlock(l, { w: 1.5, h: 1.1, ph: 0.36, color: "#c9a45a" }); b.position.set(1.05 + i * 1.65, 0, 0); S.add(b); return b; });
  S.hero(ped.group, "pedestal 8 anos", { when: (t) => t < 83.6 || t > 84.2 }); S.hero(hg.group, "ampulheta", { when: (t) => t > 81.75 && (t < 83.6 || t > 84.2) });
  blocks.forEach((b, i) => S.hero(b, "bloco governo " + (i + 1), { when: (t) => t > [84.1, 84.85][i] }));
  S.solid(ped.group, "pedestal"); S.solid(hg.group, "ampulheta", { restsOn: ["pedestal"], when: (t) => t > 81.75 });
  blocks.forEach((b, i) => S.solid(b, "bloco " + i));
  const rest = ped.top + hg.halfH;
  const anim = (t) => {
    const f = sm(t, 81.0, 81.7);
    hg.group.rotation.z = Math.PI * (1 - f);
    hg.group.position.set(-1.0, rest + 0.55 * Math.sin(f * Math.PI), 0);
    hg.setFlow(lin(t, 81.75, 85.8) * 0.85);
    blocks.forEach((b, i) => popIn(b, t, [83.86, 84.6][i], 0.4));
  };
  const shot = shotOf(anim);
  const objs = [ped.group, hg.group, ...blocks];
  const H0 = shot([ped.group, hg.group], 80.9, 83.7, { from: [-0.2, 0.4, 1], pull: 1.04 }), H1 = shot([ped.group, hg.group], 80.9, 83.7, { from: [0.05, 0.35, 1], pull: 1.0 });
  const A1 = shot(objs, 83.8, 85.8, { from: [0.15, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(t < 83.8 ? -1.0 : 1.0, 2.6, 1.8); fill.intensity = 3;
    CAM.apply(CAM.track(t, [[80.9, H0], [83.6, H1, 2.7], [84.2, A1, 0.6]]));
  };
});

// ---------------------------------------------------------------- 10. pergunta (85.8 – 94.1)
// "E você: oito anos é tempo certo pra trabalhar com calma… ou tempo demais sem prestar contas?"
addScene("pergunta", 85.8, 94.1, (S) => {
  const bal = makeBalance(); S.add(bal.group);
  const bL = makeBlock("CERTO", { w: 1.3, h: 0.85, d: 0.28, color: GREEN, ph: 0.46 }); bL.position.set(0, bal.panTop, 0); bal.panL.add(bL);
  const bR = makeBlock("DEMAIS", { w: 1.3, h: 0.85, d: 0.28, color: RED, ph: 0.46 }); bR.position.set(0, bal.panTop, 0); bal.panR.add(bR);
  S.hero(bal.group, "balança com CERTO e DEMAIS");
  const TA = 87.82, TB = 90.42;
  const anim = (t) => {
    popIn(bL, t, 86.0, 0.4); popIn(bR, t, 86.2, 0.4);
    const tilt = 0.15 * sm(t, TA - 0.2, TA + 0.4) - 0.3 * sm(t, TB - 0.2, TB + 0.4) + 0.15 * sm(t, 91.2, 91.8) + 0.06 * Math.sin((t - 91.8) * 3.2) * (t > 91.8 ? 1 : 0);
    bal.setTilt(tilt + 0.02 * Math.sin(t * 2.2));
  };
  const shot = shotOf(anim);
  const A0 = shot([bal.group], 85.8, 94.1, { from: [-0.18, 0.3, 1], pull: 1.06 }), A1 = shot([bal.group], 85.8, 94.1, { from: [0.18, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const left = t > TA - 0.2 && t < TB - 0.2;
    fill.color.set(left ? GREEN : t > TB - 0.2 && t < 91.6 ? RED : ORANGE); fill.position.set(left ? -1.6 : 1.6, 2.2, 1.8); fill.intensity = 3.5;
    CAM.apply(CAM.blend(A0, A1, sm(t, 85.8, 94.1)));
  };
});
