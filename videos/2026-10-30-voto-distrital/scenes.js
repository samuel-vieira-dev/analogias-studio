// ============================================================================
// videos/2026-10-30-voto-distrital/scenes.js
// 3D scenes synced to audio/words.json (narration 0–90.6 s, video 93.0 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery only: generic ballot box and voting machine, no party symbols or colours of real
// parties, no real brands. Photo cards (Enéas 7.0–10.2, Motta 55.2–59.5) cover the stage: no hero
// is registered behind them.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const BEIGE = "#e7dfd0", PAPER = "#fbf7ef", BLUE = "#3a7bd5", GLASS = "#cfe6ff";

// Canvas texture painted by a function (w x h px). API { tex, ctx, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, ctx: x, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Small pawn icon (head + body) drawn on a canvas, centred at (cx, cy), height s.
function pawnIcon(x, cx, cy, s, color) {
  x.fillStyle = color; x.beginPath(); x.arc(cx, cy - s * 0.28, s * 0.18, 0, Math.PI * 2); x.fill();
  roundRect(x, cx - s * 0.2, cy - s * 0.06, s * 0.4, s * 0.5, s * 0.16); x.fill();
}

// Voting-machine screens (512 x 356 canvas).
const SCR = {
  deputado: (n) => (x, w, h) => {
    x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h);
    centerText(x, "DEPUTADO", w / 2, 70, "900 58px Inter", "#141414");
    for (let i = 0; i < 4; i++) { const px = 66 + i * 100; x.strokeStyle = "#141414"; x.lineWidth = 6; x.strokeRect(px, 140, 80, 110); if (i < n) { x.fillStyle = "#141414"; x.beginPath(); x.arc(px + 40, 195, 18, 0, Math.PI * 2); x.fill(); } }
    centerText(x, "2002", w / 2, 305, "800 40px Inter", "#6a6a6a");
  },
  dois: (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); centerText(x, "2", w / 2, 150, "900 180px Inter", ORANGE); centerText(x, "VOTOS", w / 2, 290, "900 64px Inter", "#141414"); },
  regiao: (win) => (x, w, h) => {
    x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h);
    centerText(x, "1 · SUA REGIÃO", w / 2, 50, "900 44px Inter", "#141414");
    [[0.9, ORANGE], [0.55, "#8a8f96"], [0.35, "#8a8f96"]].forEach(([v, c], i) => {
      const y = 110 + i * 80; pawnIcon(x, 60, y + 22, 64, c);
      x.fillStyle = win && i === 0 ? GREEN : c; x.fillRect(110, y, 330 * v, 44);
    });
    if (win) centerText(x, "ELEITO", 380, 132, "900 34px Inter", "#ffffff");
  },
  partido: (x, w, h) => {
    x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h);
    centerText(x, "2 · PARTIDO", w / 2, 50, "900 44px Inter", "#141414");
    ["A", "B", "C"].forEach((p, i) => { const y = 110 + i * 80; x.fillStyle = "#141414"; roundRect(x, 40, y, 60, 44, 8); x.fill(); centerText(x, p, 70, y + 24, "900 32px Inter", "#ffffff"); x.fillStyle = i === 0 ? ORANGE : "#8a8f96"; x.fillRect(120, y, 320 * [0.7, 0.5, 0.3][i], 44); });
  },
  escolha: (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); pawnIcon(x, 140, 180, 170, BLUE); centerText(x, "OU", w / 2, 180, "900 56px Inter", "#141414"); x.fillStyle = ORANGE; roundRect(x, 316, 110, 130, 150, 18); x.fill(); centerText(x, "P", 381, 188, "900 90px Inter", "#ffffff"); },
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
// Generic electronic voting machine (same shape as in the 2026-10-29 urnas video): wedge-shaped body,
// sloped top with a screen (left) and keypad (right). Origin: floor, centre; front +z.
// API { group, top, screen(painter), keyWorld() → world V3 of the keypad centre }
function makeUrna() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.55, 0); s.lineTo(0.55, 0); s.lineTo(0.55, 0.62); s.lineTo(-0.55, 0.3); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.translate(0, 0, -0.8); geo.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(geo, mat(BEIGE, { roughness: 0.6 })); body.position.y = 0.02; g.add(body);
  const theta = Math.atan2(0.32, 1.1);
  const top = new THREE.Group(); top.position.set(0, 0.48 + 0.025, 0); top.rotation.x = theta; g.add(top);
  const bezel = new THREE.Mesh(rbox(0.8, 0.03, 0.6, 0.01), mat("#3a3a3a")); bezel.position.set(-0.36, 0.0, -0.02); top.add(bezel);
  const scr = canvasTex(512, 356, SCR.dois);
  const screenM = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
  screenM.rotation.x = -Math.PI / 2; screenM.position.set(-0.36, 0.017, -0.02); top.add(screenM);
  const kp = canvasTex(400, 440, paintKeypad);
  const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.62), new THREE.MeshStandardMaterial({ map: kp.tex, roughness: 0.6 }));
  keypad.rotation.x = -Math.PI / 2; keypad.position.set(0.42, 0.004, 0.0); top.add(keypad);
  g.add(contactShadow(2.4, 1.8));
  const keyWorld = () => { g.updateMatrixWorld(true); return top.localToWorld(new V3(0.42, 0.01, 0.0)); };
  return { group: g, top, screen: (p) => scr.paint(p), keyWorld };
}
// Index finger pointing down with a sleeve; the fingertip is at the group origin.
function makeVoteFinger() {
  const g = new THREE.Group(), skin = mat("#c98d63", { roughness: 0.6 });
  const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 6, 12), skin); f.position.y = 0.23; g.add(f);
  const palm = new THREE.Mesh(rbox(0.34, 0.34, 0.2, 0.08), skin); palm.position.set(0.08, 0.55, 0); g.add(palm);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.6, 20), mat("#2c5a9a", { roughness: 0.9 })); sleeve.position.set(0.1, 0.98, 0); g.add(sleeve);
  return g;
}
// Paper vote card with a pawn icon, standing (faces +z). Origin: centre.
function makeVoteCard(color) {
  const ct = canvasTex(256, 340, (x, w, h) => { x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.strokeStyle = "#c2bab0"; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28); pawnIcon(x, w / 2, h / 2 + 10, 200, color); });
  const pm = mat(PAPER), face = new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 });
  return new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.012), [pm, pm, pm, pm, face, face]);
}
// Round podium. Origin: floor. API { group, top }
function makePodium(r = 0.5, h = 0.3, color = "#6a4a36") {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 36), mat(color, { roughness: 0.6 })); c.position.y = h / 2; g.add(c);
  g.add(contactShadow(r * 3, r * 3)); return { group: g, top: h };
}
// Generic National Congress silhouette: low platform, twin towers with a bridge, an upturned bowl
// (right) and a dome (left). Origin: floor, centre; front +z. API { group, top } (platform top).
function makeCongress({ label = "CONGRESSO" } = {}) {
  const g = new THREE.Group(), white = mat("#e6e0d4", { roughness: 0.5 });
  const pH = 0.36;
  const plat = new THREE.Mesh(rbox(3.4, pH, 1.8, 0.04), white); plat.position.y = pH / 2; g.add(plat);
  for (const x of [-0.19, 0.19]) { const tw = new THREE.Mesh(rbox(0.32, 2.4, 0.32, 0.02), mat("#cfc8ba", { roughness: 0.5 })); tw.position.set(x, pH + 1.2, -0.55); g.add(tw); }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.3), mat("#cfc8ba")); bridge.position.set(0, pH + 1.9, -0.55); g.add(bridge);
  const r = 0.62;
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat("#f1ece2", { roughness: 0.45, side: THREE.DoubleSide }));
  bowl.position.set(1.05, pH + 0.12 + r, 0.15); g.add(bowl);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 20), white); stem.position.set(1.05, pH + 0.07, 0.15); g.add(stem);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat("#f1ece2", { roughness: 0.45 }));
  dome.position.set(-1.05, pH, 0.15); g.add(dome);
  if (label) { const p = makePlate(label, 2.5, 0.31, { bg: "#3a3330", fg: "#ffffff" }); p.position.set(0, pH / 2, 0.915); g.add(p); }
  g.add(contactShadow(4.2, 2.6));
  return { group: g, top: pH };
}
// Glass jar ("the party pot") on a wooden base with a printed label; an orange fill rises inside and a
// red line marks "full". Origin: floor, centre. API { group, setLevel(k) (1 = at the line), lineY, mouthY }
function makeJar({ r = 0.7, h = 1.6, label = "PARTIDO", fillColor = ORANGE } = {}) {
  const g = new THREE.Group();
  const bH = 0.48;
  const base = new THREE.Mesh(rbox(2 * r + 0.3, bH, 2 * r + 0.3, 0.05), mat("#5a3a26", { roughness: 0.7 })); base.position.y = bH / 2; g.add(base);
  const plate = makePlate(label, 2 * r + 0.1, bH * 0.78, { bg: "#141414", fg: "#ffffff" }); plate.position.set(0, bH / 2, r + 0.166); g.add(plate);
  const glassM = new THREE.MeshStandardMaterial({ color: GLASS, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), glassM); glass.position.y = bH + h / 2; g.add(glass);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.04, 40), mat("#9fb6c9", { transparent: true, opacity: 0.5 })); bottom.position.y = bH + 0.02; g.add(bottom);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 10, 48), mat("#d8e8f5", { roughness: 0.2 })); rim.rotation.x = Math.PI / 2; rim.position.y = bH + h; g.add(rim);
  const lineY = bH + 0.04 + h * 0.8;
  const line = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.025, 8, 48), mat(RED, { emissive: RED, emissiveIntensity: 0.5 })); line.rotation.x = Math.PI / 2; line.position.y = lineY; g.add(line);
  const fillGeo = new THREE.CylinderGeometry(r - 0.05, r - 0.05, 1, 40); fillGeo.translate(0, 0.5, 0);
  const fill = new THREE.Mesh(fillGeo, mat(fillColor, { roughness: 0.4, emissive: fillColor, emissiveIntensity: 0.15 })); fill.position.y = bH + 0.04; g.add(fill);
  const full = h * 0.8, maxH = h - 0.02;
  const setLevel = (k) => { const hh = clamp(k * full, 0, maxH); fill.scale.y = Math.max(0.001, hh); fill.visible = hh > 0.005; };
  setLevel(0);
  g.add(contactShadow(2 * r + 1, 2 * r + 1));
  return { group: g, setLevel, lineY, mouthY: bH + h, r, levelY: (k) => bH + 0.04 + clamp(k * full, 0, maxH) };
}
// Vote token (a small disc, cream with an orange edge). Origin: centre. Lies flat.
function makeToken() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24), [mat(ORANGE), mat(CREAM), mat(CREAM)]);
  return m;
}
// Chair: four legs, seat, back. Origin: floor; front +z. API { group, seat (mesh), seatTop }
function makeChair(color = "#6a4330") {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.6 });
  const seatY = 0.55, sw = 0.66;
  const seat = new THREE.Mesh(rbox(sw, 0.08, sw, 0.02), m); seat.position.y = seatY; g.add(seat);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, seatY - 0.04, 0.06), m); l.position.set(x * (sw / 2 - 0.05), (seatY - 0.04) / 2, z * (sw / 2 - 0.05)); g.add(l); }
  const back = new THREE.Mesh(rbox(sw, 0.7, 0.07, 0.02), m); back.position.set(0, seatY + 0.39, -sw / 2 + 0.035); g.add(back);
  g.add(contactShadow(1.0, 1.0));
  return { group: g, seat, seatTop: seatY + 0.04 };
}
// A state cut into districts: a jittered grid of cols x rows cells with organic, shared edges, each cell
// its own extruded piece with two small houses. Pieces can split apart and take their own colours.
// Origin: floor, map centre. API { group, pieces: [{ group, mat, dir }], split(k) }
function makeDistrictMap({ cols = 3, rows = 2, cell = 1.25, seed = 4, colors = [ORANGE, "#2c6fbf", GREEN, "#c9a45a", "#b0466a", "#5a9aa0"] } = {}) {
  const g = new THREE.Group(), rnd = mulberry32(seed);
  const W0 = cols * cell, H0 = rows * cell, jit = cell * 0.18;
  const P = []; for (let j = 0; j <= rows; j++) { P.push([]); for (let i = 0; i <= cols; i++) P[j].push([i * cell - W0 / 2 + (rnd() - 0.5) * jit, j * cell - H0 / 2 + (rnd() - 0.5) * jit]); }
  const mids = {};
  const mid = (a, b) => { const k = [a, b].sort().join("|"); if (!mids[k]) { const [ja, ia] = a.split(",").map(Number), [jb, ib] = b.split(",").map(Number); const pa = P[ja][ia], pb = P[jb][ib]; const nx = -(pb[1] - pa[1]), ny = pb[0] - pa[0], L = Math.hypot(nx, ny); const o = (rnd() - 0.5) * cell * 0.3; mids[k] = [(pa[0] + pb[0]) / 2 + nx / L * o, (pa[1] + pb[1]) / 2 + ny / L * o]; } return mids[k]; };
  const grey = new THREE.Color("#7a6e64"), pieces = [];
  let n = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const c = [[j, i], [j, i + 1], [j + 1, i + 1], [j + 1, i]].map(([a, b]) => `${a},${b}`);
    const pts = []; for (let e = 0; e < 4; e++) { const a = c[e], b = c[(e + 1) % 4]; const [ja, ia] = a.split(",").map(Number); pts.push(P[ja][ia], mid(a, b)); }
    const s = new THREE.Shape(); pts.forEach(([x, y], k) => k ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, 0.015, 0);
    const m = mat("#7a6e64", { roughness: 0.75 });
    const pg = new THREE.Group(); const piece = new THREE.Mesh(geo, m); pg.add(piece); g.add(pg);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    for (const [dx, dy] of [[-0.27, 0.17], [0.27, -0.17]]) { const hs = makeHouse({ w: 0.36, h: 0.28, d: 0.32, roofH: 0.18 }); hs.position.set(cx + dx, 0.15, -(cy + dy)); pg.add(hs); }
    const L = Math.hypot(cx, cy) || 1;
    pieces.push({ group: pg, mat: m, dir: new V3(cx / L, 0, -cy / L), color: new THREE.Color(colors[n % colors.length]) }); n++;
  }
  g.add(contactShadow(W0 + 1.6, H0 + 1.6));
  const split = (k) => pieces.forEach((p) => { p.group.position.copy(p.dir).multiplyScalar(0.32 * k); p.mat.color.copy(grey).lerp(p.color, k); });
  split(0);
  return { group: g, pieces, split, w: W0, d: H0 };
}
// Hemicycle of seats (instanced), opening toward +z; seats on `rows` arcs, ordered left → right.
// Origin: floor, centre of the arcs. API { group, n, setColor(i, color), reset(color) }
function makeHemicycle({ n = 24, rows = 2, r0 = 1.0, dr = 0.36, seat = 0.2, base = "#5e4636", color = "#8d847c" } = {}) {
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
  const rOut = radii[rows - 1] + 0.3, rIn = Math.max(0.1, r0 - 0.3);
  const ring = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 48, 1, 0, Math.PI), mat(base, { roughness: 0.8, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; ring.scale.y = 1; g.add(ring);
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(rOut, rOut, 0.08, 48, 1, false, Math.PI / 2, Math.PI), mat(base, { roughness: 0.8 })); slab.position.y = 0.04; g.add(slab);
  g.add(contactShadow(rOut * 2.4, rOut * 1.6));
  const c = new THREE.Color();
  return { group: g, n: pos.length, setColor: (i, col) => { im.setColorAt(i, c.set(col)); im.instanceColor.needsUpdate = true; }, reset: (col) => { for (let i = 0; i < pos.length; i++) im.setColorAt(i, c.set(col)); im.instanceColor.needsUpdate = true; } };
}
// German flag on a pole (three horizontal stripes). Origin: floor. API { group, cloth }
function makeFlagDE() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.9, 12), mat("#b8bcc0", { metalness: 0.6, roughness: 0.3 })); pole.position.y = 0.95; g.add(pole);
  const cloth = new THREE.Group(); cloth.position.set(0.03, 1.85, 0); g.add(cloth);
  ["#111111", "#dd0000", "#ffce00"].forEach((c, i) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.2, 0.015), mat(c, { roughness: 0.7 })); s.position.set(0.48, -0.1 - i * 0.2, 0); cloth.add(s); });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 20), mat("#3a2a20")); foot.position.y = 0.04; g.add(foot);
  g.add(contactShadow(0.8, 0.8)); return { group: g, cloth };
}
// Year post for the timeline: post with the year printed on a sign on top, and a caption plate on the
// base that pops in later. Origin: floor. API { group, sign, caption, light(on) }
function makeYearPost(year, caption, { color = "#3a3330" } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.9, 0.46, 0.7, 0.05), mat("#2a1b12", { roughness: 0.6 })); base.position.y = 0.23; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); post.position.y = 0.46 + 0.45; g.add(post);
  const signM = mat(color, { roughness: 0.5 });
  const board = new THREE.Mesh(rbox(1.4, 0.62, 0.1, 0.04), signM); board.position.y = 1.36 + 0.31; g.add(board);
  const sign = makePlate(year, 1.26, 0.5, { bg: null, fg: "#ffffff" }); sign.position.set(0, 1.67, 0.052); g.add(sign);
  const cap = makePlate(caption, 1.78, 0.38, { bg: "#141414", fg: "#ffffff" }); cap.position.set(0, 0.23, 0.366); g.add(cap);
  g.add(contactShadow(2, 1.2));
  return { group: g, sign, caption: cap, light: (on, col = ORANGE) => { signM.color.set(on ? col : color); signM.emissive = new THREE.Color(on ? col : "#000000"); signM.emissiveIntensity = on ? 0.35 : 0; } };
}
// Folder lying flat with a label printed on top. Origin: bottom centre. API { group, top }
function makeFlatFolder(label, { w = 1.5, d = 1.1, color = "#e8c27a" } = {}) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, 0.08, d, 0.02), m); body.position.y = 0.04; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.34, 0.08, 0.14, 0.02), m); tab.position.set(-w * 0.26, 0.04, -d / 2 - 0.06); g.add(tab);
  if (label) { const p = makePlate(label, w * 0.86, d * 0.28, { bg: "#141414", fg: "#ffffff" }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.081 + 0.015, -d * 0.12); g.add(p); }
  return { group: g, top: 0.08 };
}
// Balance scale: base, post, beam pivoting at the top; each pan hangs vertically under a beam end.
// Origin: floor. API { group, setTilt(a), panL, panR (groups: put items at y = panTop) , panTop }
function makeBalance({ arm = 1.7, postH = 2.3, hang = 1.05 } = {}) {
  const g = new THREE.Group(), metal = mat("#c9a45a", { metalness: 0.65, roughness: 0.3 }), dark = mat("#2a1b12", { roughness: 0.6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.16, 32), dark); base.position.y = 0.08; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, postH, 16), metal); post.position.y = 0.16 + postH / 2; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 0.16 + postH; g.add(beam);
  const bar = new THREE.Mesh(rbox(2 * arm + 0.2, 0.1, 0.12, 0.03), metal); beam.add(bar);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), metal); beam.add(cap);
  const pans = [-1, 1].map((sx) => {
    const end = new THREE.Group(); end.position.set(sx * arm, 0, 0); beam.add(end);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, hang, 8), metal); rod.position.y = -hang / 2; end.add(rod);
    const pan = new THREE.Group(); pan.position.y = -hang; end.add(pan);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.62, 0.08, 36), metal); dish.position.y = 0.04; pan.add(dish);
    return { end, pan };
  });
  g.add(contactShadow(3, 1.6));
  const setTilt = (a) => { beam.rotation.z = a; pans.forEach((p) => { p.end.rotation.z = -a; }); };
  setTilt(0);
  return { group: g, setTilt, panL: pans[0].pan, panR: pans[1].pan, panTop: 0.08 };
}
// Irregular, crooked district outline (a "made-to-measure" district): flat piece with a zigzag edge.
function makeCrookedDistrict(color = "#b0466a") {
  const pts = [[-0.7, -0.5], [-0.2, -0.55], [-0.1, -0.1], [0.3, -0.45], [0.7, -0.3], [0.45, 0.05], [0.72, 0.42], [0.1, 0.3], [-0.05, 0.6], [-0.55, 0.45], [-0.35, 0.05]];
  const s = new THREE.Shape(); pts.forEach(([x, y], k) => k ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1 });
  geo.rotateX(-Math.PI / 2); geo.translate(0, 0.012, 0);
  return new THREE.Mesh(geo, mat(color, { roughness: 0.6 }));
}
// Low picket fence ring (isolates a house). Origin: floor, centre.
function makeFenceRing(r = 0.42, n = 16) {
  const g = new THREE.Group(), m = mat(CREAM, { roughness: 0.7 });
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.03), m); p.position.set(Math.cos(a) * r, 0.11, Math.sin(a) * r); p.rotation.y = -a; g.add(p); }
  const rail = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 6, 40), m); rail.rotation.x = Math.PI / 2; rail.position.y = 0.16; g.add(rail);
  return g;
}

// Shared shot helper per scene.
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.08 }, o));
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));

// ---------------------------------------------------------------- 1. gancho (0 – 4.45)
// "Você vota numa pessoa… mas o seu voto pode eleger outra."
addScene("gancho", 0, 4.45, (S) => {
  const box = makeBallotBox(); S.add(box); box.userData.ballot.visible = false;
  const voter = makePerson(BLUE); voter.position.set(-1.45, 0, 0.3); voter.scale.setScalar(1.6); S.add(voter);
  const pod = makePodium(0.5, 0.3); pod.group.position.set(1.5, 0, 0.3); S.add(pod.group);
  const elected = makePerson(ORANGE); elected.position.set(1.5, pod.top, 0.3); S.add(elected);
  const card = makeVoteCard(BLUE); S.add(card);
  S.hero(box, "urna de papel"); S.hero(voter, "eleitor azul"); S.hero(pod.group, "pódio");
  S.hero(elected, "eleito laranja", { when: (t) => t > 3.6 });
  S.solid(box, "urna"); S.solid(pod.group, "pódio"); S.solid(elected, "eleito", { restsOn: ["pódio"], when: (t) => t > 3.6 });
  const from = new V3(-1.15, 1.05, 0.45), slot = new V3(0, 1.32, 0);
  const anim = (t) => {
    const f = eOut(lin(t, 0.5, 1.5)), dn = sm(t, 1.55, 1.95);
    const p = hop(from, slot, f, 0.55); p.y -= 0.7 * dn; card.position.copy(p);
    card.rotation.set(0, 0.6 * (1 - f), 0.5 * (1 - f) + 0.15 * Math.sin(t * 5) * (1 - f));
    card.visible = t > 0.45 && t < 1.95;
    voter.rotation.y = 0.25 * Math.sin(Math.min(t, 1.5) * 2);
    popIn(elected, t, 3.25, 0.45, 1.6);
    elected.position.y = pod.top + 0.08 * Math.abs(Math.sin(Math.max(0, t - 3.7) * 6)) * (t > 3.7 ? 1 : 0);
  };
  const shot = shotOf(anim);
  const A0 = shot([box, voter, pod.group, elected, card], 0, 4.45, { from: [0.25, 0.45, 1], pull: 1.08 });
  const A1 = shot([box, voter, pod.group, elected, card], 0, 4.45, { from: [-0.1, 0.38, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 3.3 ? BLUE : ORANGE); fill.position.set(t < 3.3 ? -1.4 : 1.5, 2.0, 1.4); fill.intensity = t < 3.3 ? 2.5 : 6 * sm(t, 3.3, 3.6);
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 0, 4.45)), t, 3.44, 0.04, 0.4));
  };
});

// ---------------------------------------------------------------- 2. Enéas, 2002 (4.45 – 16.25)
// "Imagina: 2002, São Paulo. Você digita o número do Enéas. [cartão 7.0–10.2] Ele faz mais de um milhão
//  e meio de votos… e leva junto pra Câmara um deputado que teve menos de trezentos."
addScene("eneas", 4.45, 16.25, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen(SCR.deputado(0));
  const finger = makeVoteFinger(); S.add(finger);
  // columns (shot B) a few metres to the right
  const X = 7;
  const colA = new THREE.Group(); colA.position.set(X - 1.5, 0, 0); S.add(colA);
  const cbase = new THREE.Mesh(rbox(1.5, 0.14, 1.4, 0.04), mat("#3a2a20")); cbase.position.y = 0.07; colA.add(cbase);
  const cGeo = new THREE.BoxGeometry(1.2, 1, 1.1); cGeo.translate(0, 0.5, 0);
  const cBody = new THREE.Mesh(cGeo, mat(ORANGE, { roughness: 0.5 })); cBody.position.y = 0.14; colA.add(cBody);
  const plA = makePlate("1,5 MILHÃO", 1.15, 0.36, { bg: "#141414", fg: "#ffffff" }); plA.position.set(0, 0.62, 0.567); colA.add(plA);
  colA.add(contactShadow(2.3, 2.2));
  const colB = new THREE.Group(); colB.position.set(X + 0.1, 0, 0); S.add(colB);
  const bb = new THREE.Mesh(rbox(1.1, 0.36, 0.8, 0.04), mat("#3a2a20")); bb.position.y = 0.18; colB.add(bb);
  const plB = makePlate("< 300", 0.98, 0.3, { bg: "#141414", fg: "#ffffff" }); plB.position.set(0, 0.18, 0.416); colB.add(plB);
  colB.add(contactShadow(1.6, 1.4));
  const pA = makePerson(ORANGE); pA.scale.setScalar(1.25); S.add(pA);
  const pB = makePerson(CREAM); pB.scale.setScalar(1.25); S.add(pB);
  const cg = makeCongress(); cg.group.position.set(X + 3.6, 0, -0.4); cg.group.scale.setScalar(0.85); S.add(cg.group);
  const HMAX = 2.6;
  S.hero(u.group, "urna eletrônica", { when: (t) => t < 7.0 }); S.hero(finger, "dedo", { when: (t) => t > 5.0 && t < 7.0 });
  S.hero(colA, "coluna de votos alta", { when: (t) => t > 10.6 && t < 13.0 }); S.hero(colB, "base pequena < 300", { when: (t) => t > 10.6 && t < 13.0 });
  S.hero(cg.group, "Congresso", { when: (t) => t > 13.8 });
  S.solid(u.group, "urna"); S.solid(colA, "coluna"); S.solid(colB, "base"); S.solid(cg.group, "congresso");
  S.solid(pA, "boneco laranja", { restsOn: ["coluna"], when: (t) => t > 10.6 && (t < 12.6 || t > 13.7) });
  S.solid(pB, "boneco creme", { restsOn: ["base"], when: (t) => t > 10.6 && (t < 12.8 || t > 14.0) });
  const aTop = () => 0.14 + cBody.scale.y;
  const destA = new V3(X + 3.6 - 1.8, 0, 0.1), destB = new V3(X + 3.6 + 1.8, 0, 0.1);
  let painted = -1;
  const anim = (t) => {
    // typing: four presses 5.3 → 6.5, screen fills a dot per press
    const presses = [5.3, 5.6, 5.95, 6.3];
    const n = presses.filter((p) => t > p + 0.08).length;
    if (n !== painted) { u.screen(SCR.deputado(n)); painted = n; }
    const kp = u.keyWorld();
    let lift = 0.55 * (1 - eOut(lin(t, 4.6, 5.2)));
    presses.forEach((p) => { lift += 0.12 * Math.sin(clamp((t - p + 0.15) / 0.3) * Math.PI); });
    finger.position.set(kp.x, kp.y + 0.02 + lift, kp.z + 0.05); finger.rotation.set(0.28, 0, 0.12);
    finger.visible = t < 7.1;
    // columns
    cBody.scale.y = Math.max(0.001, 0.2 + (HMAX - 0.2) * eOut(lin(t, 10.3, 11.8)));
    plA.visible = cBody.scale.y > 0.8;
    popIn(cg.group, t, 12.3, 0.45, 0.85);                   // the Câmara appears as the camera turns to it
    const kA = sm(t, 12.6, 13.6), kB = sm(t, 12.9, 13.9);
    pA.position.copy(hop(new V3(X - 1.5, aTop(), 0), destA, kA, 0.6));
    pB.position.copy(hop(new V3(X + 0.1, 0.36, 0), destB, kB, 1.0));
    const pulse = t > 14.6 ? 1 + 0.18 * Math.sin(clamp((t - 14.6) / 0.6) * Math.PI) : 1;
    pB.scale.setScalar(1.25 * pulse);
  };
  const shot = shotOf(anim);
  const A0 = shot([u.group, finger], 4.6, 7.0, { from: [0.35, 0.95, 1], pull: 1.08 }), A1 = shot([u.group, finger], 4.6, 7.0, { from: [0.1, 0.9, 1], pull: 1.0 });
  const B0 = shot([colA, colB, pA, pB], 10.2, 12.6, { from: [-0.15, 0.4, 1], pull: 1.06 }), B1 = shot([colA, colB, pA, pB], 10.2, 12.6, { from: [0.05, 0.35, 1], pull: 1.0 });
  const C0 = shot([cg.group, pA, pB], 13.9, 16.25, { from: [-0.1, 0.4, 1], pull: 1.06 }), C1 = shot([cg.group, pA, pB], 13.9, 16.25, { from: [0.12, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 14.5 ? RED : ORANGE); fill.position.set(t < 8 ? 0 : t < 12.8 ? X - 0.7 : X + 3.6, 2.2, 1.4); fill.intensity = t < 8 ? 2.5 : 3 + (t > 14.5 ? 3 * sm(t, 14.5, 14.9) : 0);
    CAM.apply(CAM.track(t, [[4.45, A0], [7.0, A1, 2.4], [10.2, B0, 0.2], [12.5, B1, 2.3], [13.8, C0, 1.3], [16.25, C1, 2.45]]));
  };
});

// ---------------------------------------------------------------- 3. vaquinha (16.25 – 29.9)
// "Por quê? Pra deputado, o seu voto cai numa vaquinha do partido. Cada vez que o pote enche, o partido
//  ganha uma cadeira. Senta quem tem mais voto na lista. Se um candidato traz voto demais, o que sobra
//  transborda pros colegas."
addScene("vaquinha", 16.25, 29.9, (S) => {
  const jar = makeJar(); S.add(jar.group);
  const chairs = [1.55, 2.35, 3.15].map((x, i) => { const c = makeChair(); c.group.position.set(x, 0, -0.1 - i * 0.12); c.group.rotation.y = -0.25; S.add(c.group); return c; });
  const sitters = [ORANGE, CREAM, CREAM].map((c) => { const p = makePerson(c); p.scale.setScalar(1.15); S.add(p); return p; });
  const tokens = []; for (let i = 0; i < 9; i++) { const k = makeToken(); S.add(k); tokens.push(k); }
  const star = new THREE.Group(); star.position.set(-1.85, 0, 0.1); S.add(star);
  const stackBase = new THREE.Mesh(rbox(0.7, 0.1, 0.7, 0.03), mat("#3a2a20")); stackBase.position.y = 0.05; star.add(stackBase);
  const stack = []; for (let i = 0; i < 14; i++) { const k = makeToken(); k.position.set(0, 0.1 + 0.03 + i * 0.065, 0); k.rotation.y = i * 0.4; star.add(k); stack.push(k); }
  const starP = makePerson(ORANGE); starP.scale.setScalar(1.35); S.add(starP);
  star.add(contactShadow(1.2, 1.2));
  const pour = []; for (let i = 0; i < 10; i++) { const k = makeToken(); S.add(k); pour.push(k); }
  const spill = []; for (let i = 0; i < 6; i++) { const k = makeToken(); S.add(k); spill.push(k); }
  S.hero(jar.group, "pote de vidro");
  S.hero(chairs[0].group, "cadeira 1", { when: (t) => t > 21.8 });
  S.hero(star, "pilha de fichas", { when: (t) => t > 25.9 && t < 27.6 }); S.hero(starP, "candidato puxador", { when: (t) => t > 25.9 });
  S.hero(chairs[1].group, "cadeira 2", { when: (t) => t > 29.0 }); S.hero(chairs[2].group, "cadeira 3", { when: (t) => t > 29.6 });
  S.solid(jar.group, "pote"); chairs.forEach((c, i) => S.solid(c.seat, "cadeira " + (i + 1)));
  sitters.forEach((p, i) => S.solid(p, "sentado " + (i + 1), { restsOn: ["cadeira " + (i + 1)], when: (t) => t > [24.3, 29.0, 29.6][i] }));
  const drops = [17.3, 17.75, 18.2, 18.6, 18.95, 19.4, 19.9, 20.4, 20.9];
  const seatPos = (i) => { const c = chairs[i].group; return new V3(c.position.x, chairs[i].seatTop, c.position.z + 0.05); };
  const level = (t) => {
    let k = 1.0 * lin(t, 17.3, 21.36);                      // nine votes fill it
    k -= 0.75 * sm(t, 22.9, 23.5);                           // a chair "spent" the pot
    k += 1.25 * sm(t, 26.6, 28.2);                           // the big candidate pours in → overflow
    k -= 0.7 * sm(t, 28.6, 29.6);                            // spills go to colleagues
    return k;
  };
  const anim = (t) => {
    const lv = level(t); jar.setLevel(lv);
    tokens.forEach((k, i) => { const a = drops[i]; const f = lin(t, a, a + 0.45); k.visible = t > a && f < 1; k.position.set(Math.sin(i * 2.1) * 0.25, lerp(jar.mouthY + 0.8, jar.levelY(lv) + 0.05, f * f), Math.cos(i * 1.3) * 0.2); k.rotation.set(f * 2 + i, i, 0); });
    chairs.forEach((c, i) => popIn(c.group, t, [21.36, 28.6, 29.2][i], 0.4));
    // seat 1: the top of the list hops from beside the jar onto the chair
    const s1 = sm(t, 23.6, 24.25);
    sitters[0].position.copy(hop(new V3(0.95, 0, 0.75), seatPos(0), s1, 0.7)); sitters[0].visible = t > 22.9; sitters[0].scale.setScalar(1.15 * Math.max(0.0001, pop(t, 22.9, 0.35)));
    // the big candidate on a tall pile of votes
    popIn(star, t, 25.6, 0.4); starP.visible = t > 25.6; starP.scale.setScalar(1.35 * Math.max(0.0001, pop(t, 25.6, 0.4)));
    const used = Math.floor(clamp((t - 26.6) / 1.6) * stack.length);
    stack.forEach((k, i) => { k.visible = i < stack.length - used; });
    starP.position.set(star.position.x, 0.1 + 0.03 + (stack.length - used) * 0.065 + 0.03, star.position.z);
    pour.forEach((k, i) => { const a = 26.6 + i * 0.16, f = lin(t, a, a + 0.5); k.visible = t > a && f < 1; k.position.copy(hop(new V3(star.position.x + 0.5, 0.13 + (stack.length - used) * 0.065, 0.1), new V3(0, jar.mouthY - 0.1, 0), f, 0.9)); k.rotation.set(f * 6, i, 0); });
    spill.forEach((k, i) => { const a = 28.0 + i * 0.22, f = lin(t, a, a + 0.6), dst = seatPos(1 + (i % 2)); k.visible = t > a && f < 1; k.position.copy(hop(new V3(0.2, jar.mouthY + 0.05, 0), dst.clone().add(new V3(0, 0.3, 0)), f, 0.8)); k.rotation.set(f * 5, i, 0); });
    [1, 2].forEach((i) => { const at = [28.6, 29.2][i - 1]; sitters[i].visible = t > at + 0.2; sitters[i].position.copy(seatPos(i)); sitters[i].scale.setScalar(1.15 * Math.max(0.0001, pop(t, at + 0.2, 0.35))); });
  };
  const shot = shotOf(anim);
  const objsA = [jar.group, chairs[0].group, sitters[0]];
  const A0 = shot(objsA, 16.25, 25.6, { from: [0.1, 0.55, 1], pull: 1.1, look: undefined }), A1 = shot(objsA, 16.25, 25.6, { from: [-0.05, 0.45, 1], pull: 1.02 });
  const objsB = [star, starP, jar.group, ...chairs.map((c) => c.group), ...sitters];
  const B0 = shot(objsB, 25.6, 29.9, { from: [0.05, 0.6, 1], pull: 1.05 }), B1 = shot(objsB, 25.6, 29.9, { from: [0.15, 0.5, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.6, 1.4); fill.intensity = 2.5 + 3 * (t > 21.36 && t < 22.2 ? 1 : 0) + 3 * sm(t, 27.6, 28.2) * (1 - sm(t, 29.0, 29.6));
    CAM.apply(CAM.track(t, [[16.25, A0], [25.3, A1, 9.0], [26.1, B0, 0.8], [29.9, B1, 3.8]]));
  };
});

// ---------------------------------------------------------------- 4. troca (29.9 – 33.5)
// "A Câmara quer trocar isso pelo voto distrital misto."  — foto do plenário no porta-retrato
addScene("troca", 29.9, 33.5, (S) => {
  const fr = makePhotoFrame("plenario", { w: 1.8, name: "PLENÁRIO" }); S.add(fr.group);
  S.hero(fr.group, "porta-retrato do plenário"); S.solid(fr.group, "porta-retrato");
  const anim = (t) => {
    fr.frame.rotation.y = 0.9 * (1 - eOut(lin(t, 29.9, 30.5)));
    fr.zoom(1.3 + 0.15 * lin(t, 30.0, 33.5));      // starts past the lit ceiling of the plenary
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 29.9, 33.5, { from: [-0.2, 0.25, 1], pull: 1.08 }), A1 = shot([fr.group], 29.9, 33.5, { from: [0.12, 0.2, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.4, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 29.9, 33.5)), t, 30.4, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 5. distrital misto (33.5 – 52.7)
// "Imagina a eleição de 2034. O estado foi dividido em pedaços, os distritos. Na urna, você vota duas
//  vezes. Primeiro, num candidato da sua região: quem tiver mais votos ali leva a vaga. Depois, num
//  partido. Mais ou menos metade das cadeiras sai de cada voto. A Alemanha faz parecido."
addScene("distrital", 33.5, 52.7, (S) => {
  const map = makeDistrictMap(); S.add(map.group);
  // shot B: voting machine beside one district with three candidates
  const XB = 9;
  const u = makeUrna(); u.group.position.set(XB - 0.95, 0, 0.1); u.group.scale.setScalar(1.15); S.add(u.group); u.screen(SCR.dois);
  const finger = makeVoteFinger(); S.add(finger);
  const tile = new THREE.Group(); tile.position.set(XB + 1.35, 0, 0); S.add(tile);
  const tileM = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.14, 7), mat(ORANGE, { roughness: 0.65 })); tileM.position.y = 0.07; tile.add(tileM);
  tile.add(contactShadow(2.4, 2.4));
  const cands = [ORANGE, "#8a8f96", "#8a8f96"].map((c, i) => { const p = makePerson(c); p.scale.setScalar(1.05); p.position.set([-0.48, 0.05, 0.52][i], 0.14, [0.1, -0.35, 0.15][i]); tile.add(p); return p; });
  const winPod = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.3, 24), mat(GREEN, { roughness: 0.5 })); winPod.position.set(-0.48, 0.14, 0.1); tile.add(winPod);
  // shot C: hemicycle half "região" (orange), half "partido" (cream) + German flag
  const XC = 18;
  const hemi = makeHemicycle({ n: 36, rows: 3, r0: 1.1, dr: 0.36, seat: 0.24 }); hemi.group.position.set(XC, 0, 0); S.add(hemi.group);
  const plR = makePlate("REGIÃO", 1.2, 0.3, { bg: ORANGE, fg: "#ffffff" }); plR.position.set(XC - 1.05, 0.15, 0.55); plR.rotation.x = -0.6; S.add(plR);
  const plP = makePlate("PARTIDO", 1.2, 0.3, { bg: CREAM, fg: "#141414" }); plP.position.set(XC + 1.05, 0.15, 0.55); plP.rotation.x = -0.6; S.add(plP);
  const flag = makeFlagDE(); flag.group.position.set(XC + 2.35, 0, -0.5); S.add(flag.group);
  S.hero(map.group, "mapa com distritos", { when: (t) => t < 39.0 });
  S.hero(u.group, "urna eletrônica", { when: (t) => t > 39.3 && t < 48.0 }); S.hero(tile, "distrito com candidatos", { when: (t) => t > 42.0 && t < 48.0 });
  S.hero(hemi.group, "plenário semicírculo", { when: (t) => t > 48.2 }); S.hero(flag.group, "bandeira da Alemanha", { when: (t) => t > 51.5 });
  S.solid(u.group, "urna"); S.solid(tile, "distrito"); S.solid(hemi.group, "plenário"); S.solid(flag.group, "bandeira");
  let scr = "";
  const setScr = (k, p) => { if (scr !== k) { u.screen(p); scr = k; } };
  const anim = (t) => {
    map.split(sm(t, 36.6, 37.6));
    map.pieces.forEach((p, i) => { p.group.position.y = 0.08 * Math.sin(clamp((t - 37.0 - i * 0.12) / 0.4) * Math.PI); });
    if (t < 41.5) setScr("dois", SCR.dois); else if (t < 45.5) setScr("r0", SCR.regiao(false)); else if (t < 46.4) setScr("r1", SCR.regiao(true)); else setScr("p", SCR.partido);
    const kp = u.keyWorld();
    let lift = 0.5;
    [40.5, 40.9, 47.3].forEach((p) => { lift -= 0.48 * Math.sin(clamp((t - p + 0.18) / 0.36) * Math.PI); });
    finger.position.set(kp.x, kp.y + 0.03 + lift, kp.z + 0.05); finger.rotation.set(0.28, 0, 0.12); finger.scale.setScalar(1.15);
    popIn(tile, t, 41.6, 0.45);
    const w = sm(t, 45.4, 45.9); winPod.scale.y = Math.max(0.001, w); winPod.visible = w > 0.01; winPod.position.y = 0.14 + 0.15 * w;
    cands[0].position.y = 0.14 + 0.3 * w;
    for (let i = 0; i < hemi.n; i++) { const at = 48.7 + i * 0.075; hemi.setColor(i, t > at ? (i < hemi.n / 2 ? ORANGE : CREAM) : "#8d847c"); }
    plR.visible = t > 49.4; plP.visible = t > 50.3;
    popIn(flag.group, t, 51.24, 0.45); flag.cloth.rotation.y = 0.18 * Math.sin(t * 3);
  };
  const shot = shotOf(anim);
  const A0 = shot([map.group], 33.5, 39.0, { from: [0, 1.5, 1], pull: 1.1 }), A1 = shot([map.group], 33.5, 39.0, { from: [0.2, 1.3, 1], pull: 1.0 });
  const U0 = shot([u.group, finger], 39.0, 41.6, { from: [0.15, 0.8, 1], pull: 1.08 }), U1 = shot([u.group, finger], 39.0, 41.6, { from: [-0.05, 0.75, 1], pull: 1.0 });
  const B0 = shot([u.group, finger, tile], 39.0, 48.0, { from: [0.1, 0.75, 1], pull: 1.06 }), B1 = shot([u.group, finger, tile], 39.0, 48.0, { from: [-0.1, 0.7, 1], pull: 1.0 });
  const C0 = shot([hemi.group, plR, plP, flag.group], 48.0, 52.7, { from: [0, 0.9, 1], pull: 1.06 }), C1 = shot([hemi.group, plR, plP, flag.group], 48.0, 52.7, { from: [0.15, 0.8, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 45.4 || t > 46.4 ? ORANGE : GREEN); fill.position.set(t < 39 ? 0 : t < 48 ? XB : XC, 2.4, 1.6); fill.intensity = 3;
    CAM.apply(CAM.shake(CAM.track(t, [[33.5, A0], [38.8, A1, 5.3], [39.4, U0, 0.6], [41.5, U1, 2.1], [42.3, B0, 0.8], [47.8, B1, 5.5], [48.4, C0, 0.6], [52.7, C1, 4.3]]), t, 36.9, 0.03, 0.35));
  };
});

// ---------------------------------------------------------------- 6. quando (52.7 – 64.8)
// "E quando? Em vinte e oito de outubro, o presidente da Câmara, Hugo Motta, disse que quer votar ainda
//  este ano. [cartão 55.2–59.5] 2030 seria a transição. O sistema completo, só em 2034."
addScene("quando", 52.7, 64.8, (S) => {
  const posts = [["2026", "VOTAÇÃO?"], ["2030", "TRANSIÇÃO"], ["2034", "COMPLETO"]].map(([y, c], i) => { const p = makeYearPost(y, c); p.group.position.set((i - 1) * 2.05, 0, 0); S.add(p.group); return p; });
  const rail = new THREE.Mesh(rbox(5.6, 0.06, 0.16, 0.02), mat("#8b9196", { metalness: 0.5, roughness: 0.4 })); rail.position.set(0, 0.03, 0.75); S.add(rail);
  S.hero(posts[0].group, "placa 2026", { when: (t) => t < 55.2 || t > 59.5 });
  S.hero(posts[1].group, "placa 2030", { when: (t) => t > 60.0 }); S.hero(posts[2].group, "placa 2034", { when: (t) => t > 62.4 });
  posts.forEach((p, i) => S.solid(p.group, "poste " + i));
  const anim = (t) => {
    posts.forEach((p, i) => { p.caption.visible = t > [52.9, 59.66, 61.9][i]; });
    posts[0].light(t > 52.9 && t < 59.66, ORANGE); posts[1].light(t > 59.66, ORANGE); posts[2].light(t > 61.9, GREEN);
    popIn(posts[1].group, t, 59.5, 0.45); popIn(posts[2].group, t, 61.9, 0.45);
  };
  const shot = shotOf(anim);
  const A0 = shot([posts[0].group], 52.7, 55.2, { from: [0.3, 0.35, 1], pull: 1.12 }), A1 = shot([posts[0].group], 52.7, 55.2, { from: [0.1, 0.3, 1], pull: 1.02 });
  const all = [...posts.map((p) => p.group)];
  const B0 = shot(all, 59.0, 64.8, { from: [-0.15, 0.4, 1], pull: 1.06 }), B1 = shot(all, 59.0, 64.8, { from: [0.15, 0.35, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 61.9 ? GREEN : ORANGE); fill.position.set(t < 61.9 ? 0 : 2.05, 2.4, 1.6); fill.intensity = 3;
    CAM.apply(CAM.track(t, [[52.7, A0], [55.2, A1, 2.5], [59.4, B0, 0.3], [64.8, B1, 5.4]]));
  };
});

// ---------------------------------------------------------------- 7. PEC (64.8 – 76.5)
// "Mas é mudança na Constituição: precisa de trezentos e oito dos quinhentos e treze deputados, e depois
//  do Senado. O Senado até aprovou isso em 2017… e empacou na Câmara."
addScene("pec", 64.8, 76.5, (S) => {
  const book = makeLawBook({ w: 2.2, d: 2.3 }); book.group.position.set(-6.0, 0, 0.9); book.group.rotation.y = 0.25; S.add(book.group);
  const camH = makeHemicycle({ n: 513, rows: 9, r0: 0.9, dr: 0.21, seat: 0.11 }); camH.group.position.set(0, 0, -0.6); S.add(camH.group);
  const senH = makeHemicycle({ n: 81, rows: 3, r0: 0.45, dr: 0.18, seat: 0.11 }); senH.group.position.set(2.1, 0, 1.0); S.add(senH.group);
  const plC = makePlate("CÂMARA", 1.3, 0.3, { bg: "#141414", fg: "#ffffff" }); plC.position.set(0, 0.16, -0.32); plC.rotation.x = -0.5; S.add(plC);
  const plS = makePlate("SENADO", 1.1, 0.26, { bg: "#141414", fg: "#ffffff" }); plS.position.set(2.1, 0.14, 1.35); plS.rotation.x = -0.5; S.add(plS);
  // shot B: folder stamped "APROVADO 2017", then buried under other folders on the Câmara pile
  const XB = 9;
  // the Câmara pile sits behind the folder (depth), so the shot stays narrow and the label reads big
  const desk = new THREE.Mesh(rbox(2.8, 0.12, 3.6, 0.03), mat("#5a3a26", { roughness: 0.7 })); desk.position.set(XB, 0.06, -0.45); S.add(desk);
  const deskTop = 0.12, PZ = -1.15;
  const pile = []; for (let i = 0; i < 3; i++) { const f = makeFlatFolder(null, { color: ["#c9b8a6", "#d8c49a", "#b9a88f"][i] }); f.group.position.set(XB, deskTop + i * 0.08, PZ); f.group.rotation.y = (i - 1) * 0.06; S.add(f.group); pile.push(f); }
  const main = makeFlatFolder("DISTRITAL MISTO", { w: 1.9, d: 1.2, color: "#e8c27a" }); S.add(main.group);
  const stampPrint = makePlate("APROVADO · 2017", 1.5, 0.32, { bg: RED, fg: "#ffffff" }); stampPrint.rotation.set(-Math.PI / 2, 0, -0.08); main.group.add(stampPrint); stampPrint.position.set(0.0, 0.081 + 0.015, 0.27);
  const stamp = makeStamp({ w: 1.6, d: 0.45 }); S.add(stamp);
  const later = []; for (let i = 0; i < 3; i++) { const f = makeFlatFolder(null, { color: ["#a89a88", "#c2b49c", "#9c8f80"][i] }); S.add(f.group); later.push(f); }
  const plPile = makePlate("CÂMARA", 1.2, 0.3, { bg: "#141414", fg: "#ffffff" }); plPile.position.set(XB, deskTop + 0.15, PZ - 0.8); S.add(plPile);
  S.hero(book.group, "Constituição", { when: (t) => t < 66.2 });
  S.hero(camH.group, "plenário 513 cadeiras", { when: (t) => t > 67.4 && t < 71.9 }); S.hero(senH.group, "plenário do Senado", { when: (t) => t > 71.3 && t < 71.9 });
  S.hero(main.group, "pasta distrital misto", { when: (t) => t > 72.4 }); S.hero(pile[1].group, "pilha da Câmara", { when: (t) => t > 72.4 });
  S.solid(book.group, "livro"); S.solid(camH.group, "câmara"); S.solid(senH.group, "senado"); S.solid(desk, "mesa");
  pile.forEach((f, i) => S.solid(f.group, "pilha " + i, { restsOn: ["mesa", "pilha " + (i - 1)] }));
  S.solid(main.group, "pasta", { restsOn: ["mesa", "pilha 2"], when: (t) => t > 72.6 && (t < 74.85 || t > 75.6) });
  S.solid(stamp, "carimbo", { restsOn: ["pasta"], when: (t) => t > 73.4 && t < 74.7 });
  const mainA = new V3(XB, deskTop, 0.35), mainB = new V3(XB, deskTop + 3 * 0.08, PZ);
  const anim = (t) => {
    for (let i = 0; i < camH.n; i++) camH.setColor(i, t > 67.7 + (i / 308) * 2.2 && i < 308 ? GREEN : "#8d847c");
    popIn(senH.group, t, 71.0, 0.4); plS.visible = t > 71.2;
    for (let i = 0; i < senH.n; i++) senH.setColor(i, i < 49 && t > 71.4 + (i / 49) * 0.6 ? GREEN : "#8d847c");
    // folder: lies on the desk, gets stamped at 74.06, slides onto the pile at 74.85, buried 75.2–76.2
    const mv = sm(t, 74.85, 75.5);
    const p = hop(mainA, mainB, mv, 0.35); main.group.position.copy(p); main.group.rotation.y = 0.04 * mv;
    stampPrint.visible = t > 74.08;
    const down = eOut(lin(t, 73.75, 74.06)), up = sm(t, 74.3, 74.8);
    stamp.visible = t > 73.3 && t < 74.85; stamp.position.set(mainA.x, deskTop + 0.081 + 0.03 + 0.7 * (1 - down) + 0.7 * up, mainA.z + 0.27); stamp.rotation.y = -0.08;
    later.forEach((f, i) => { const a = 75.25 + i * 0.32, k = eOut(lin(t, a, a + 0.3)); f.group.visible = t > a; f.group.position.set(mainB.x + (i - 1) * 0.05, mainB.y + 0.08 * (i + 1) + 0.8 * (1 - k), PZ + (i - 1) * 0.04); f.group.rotation.y = (i - 1) * 0.12; });
  };
  const shot = shotOf(anim);
  const A0 = shot([book.group], 64.8, 67.0, { from: [0.1, 0.9, 1], pull: 1.1 });
  const B0 = shot([camH.group, senH.group, plC, plS], 66.9, 72.2, { from: [0.0, 0.95, 1], pull: 1.06 }), B1 = shot([camH.group, senH.group, plC, plS], 66.9, 72.2, { from: [0.15, 0.85, 1], pull: 1.0 });
  const objsC = [main.group, stamp, plPile, ...pile.map((f) => f.group), ...later.map((f) => f.group)];
  const C0 = shot(objsC, 72.2, 76.5, { from: [0.0, 1.5, 1], pull: 1.06 }), C1 = shot(objsC, 72.2, 76.5, { from: [0.12, 1.4, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 72.2 ? GREEN : t < 74.8 ? RED : "#8a8a8a"); fill.position.set(t < 72.2 ? 0 : XB, 2.4, 1.6); fill.intensity = t < 67.6 ? 2.5 : t < 72.2 ? 4 : 3 + (t > 74.06 && t < 74.8 ? 4 : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[64.8, A0], [67.4, B0, 1.2], [71.8, B1, 4.4], [72.4, C0, 0.5], [76.5, C1, 4.1]]), t, 74.06, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 8. debate (76.5 – 86.0)
// "Quem defende diz que você passa a saber de quem cobrar. Quem critica teme distritos desenhados sob
//  medida, e deputado que só pensa no próprio bairro."
addScene("debate", 76.5, 86.0, (S) => {
  const bal = makeBalance(); S.add(bal.group);
  // left pan: a voter and "their" deputy's house
  const houseL = makeHouse({ w: 0.62, h: 0.44, d: 0.5, roofH: 0.28 }); houseL.position.set(0.22, bal.panTop, -0.05); bal.panL.add(houseL);
  const voterL = makePerson(BLUE); voterL.scale.setScalar(1.1); voterL.position.set(-0.38, bal.panTop, 0.15); bal.panL.add(voterL);
  // right pan: crooked district (80.15) and an isolated, fenced house (83.4)
  const crook = new THREE.Group(); crook.position.set(-0.27, bal.panTop, 0.05); bal.panR.add(crook);
  const crookIn = new THREE.Group(); crookIn.scale.setScalar(0.62); crook.add(crookIn); crookIn.add(makeCrookedDistrict());
  for (const [x, z] of [[-0.45, -0.2], [0.42, 0.25], [-0.3, -0.4]]) { const h = makeHouse({ w: 0.3, h: 0.24, d: 0.26, roofH: 0.16 }); h.position.set(x, 0.124, z); crookIn.add(h); }
  const houseR = makeHouse({ w: 0.34, h: 0.26, d: 0.3, roofH: 0.18, roof: "#5a6a8a" }); bal.panR.add(houseR);
  const fence = makeFenceRing(0.3); bal.panR.add(fence);
  S.hero(bal.group, "balança"); S.solid(bal.group, "balança");
  const anim = (t) => {
    const tilt = -0.2 * sm(t, 77.6, 78.6) + 0.34 * sm(t, 80.6, 81.6) + 0.12 * sm(t, 83.9, 84.6) - 0.26 * sm(t, 85.0, 85.9);
    bal.setTilt(tilt + 0.015 * Math.sin(t * 2.2));
    popIn(houseL, t, 76.7, 0.4); popIn(voterL, t, 77.0, 0.4, 1.1);
    voterL.rotation.y = 0.4 + 0.2 * Math.sin(t * 3) * (t > 78.6 && t < 79.6 ? 1 : 0);
    popIn(crook, t, 80.3, 0.45); crook.rotation.y = 0.4 * Math.sin(t * 1.2);
    const hk = pop(t, 83.5, 0.45); houseR.visible = hk > 0.01; houseR.scale.setScalar(Math.max(0.0001, hk)); houseR.position.set(0.42, bal.panTop, -0.05);
    fence.visible = hk > 0.01; fence.scale.setScalar(Math.max(0.0001, hk)); fence.position.set(0.42, bal.panTop, -0.05);
  };
  const shot = shotOf(anim);
  const A0 = shot([bal.group], 76.5, 86.0, { from: [-0.2, 0.3, 1], pull: 1.06 }), A1 = shot([bal.group], 76.5, 86.0, { from: [0.2, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 80.1 ? BLUE : RED); fill.position.set(t < 80.1 ? -1.6 : 1.6, 2.0, 1.6); fill.intensity = 4;
    CAM.apply(CAM.blend(A0, A1, sm(t, 76.5, 86.0)));
  };
});

// ---------------------------------------------------------------- 9. a escolha (86.0 – 93.0)
// "E você: na hora de votar, o que pesa mais… a pessoa, ou o partido?"
addScene("escolha", 86.0, 93.0, (S) => {
  const pod = makePodium(0.55, 0.35); pod.group.position.set(-1.25, 0, 0); S.add(pod.group);
  const person = makePerson(BLUE); person.scale.setScalar(1.7); person.position.set(-1.25, pod.top, 0); S.add(person);
  const jar = makeJar({ r: 0.55, h: 1.25 }); jar.group.position.set(1.2, 0, 0); S.add(jar.group); jar.setLevel(0.75);
  const aTop = sprite(chipTex("PESSOA", { bg: BLUE, font: "900 120px Inter", h: 180 }), 1.6); aTop.position.set(-1.25, 2.25, 0); S.add(aTop);
  const bTop = sprite(chipTex("PARTIDO", { bg: ORANGE, font: "900 120px Inter", h: 180 }), 1.75); bTop.position.set(1.2, 2.25, 0); S.add(bTop);
  const lA = new THREE.PointLight(BLUE, 0, 6, 1.5); lA.position.set(-1.3, 1.8, 1.3); S.add(lA);
  const lB = new THREE.PointLight(ORANGE, 0, 6, 1.5); lB.position.set(1.3, 1.8, 1.3); S.add(lB);
  S.hero(pod.group, "pódio"); S.hero(person, "pessoa"); S.hero(jar.group, "pote do partido");
  S.label(aTop, "PESSOA", { on: "pessoa" }); S.label(bTop, "PARTIDO", { on: "pote do partido" });
  S.solid(pod.group, "pódio"); S.solid(person, "pessoa", { restsOn: ["pódio"] }); S.solid(jar.group, "pote");
  const TA = 89.32, TB = 90.38;
  const anim = (t) => {
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 86.3, 0.4)) * (1 + 0.12 * (t > TA && t < TA + 0.5 ? 1 : 0)));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 86.5, 0.4)) * (1 + 0.12 * (t > TB && t < TB + 0.5 ? 1 : 0)));
    jar.setLevel(0.75 + 0.05 * Math.sin(t * 2));
    person.rotation.y = 0.3 * Math.sin(t * 1.5);
  };
  const box = envelope([pod.group, person, jar.group, aTop, bTop], anim, 86.0, 93.0);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.45, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.08, 0.38, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const late = t > 91.0 ? 0.5 + 0.5 * Math.sin((t - 91.0) * 4) : 0;
    const ea = Math.max(t > TA && t < TB ? 1 : 0, late), eb = Math.max(t > TB ? 1 - (t > 91 ? late : 0) : 0, 0);
    lA.intensity = ea * 7; lB.intensity = eb * 7;
    fill.color.set("#ffffff"); fill.position.set(0, 2.4, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.blend(P0, P1, sm(t, 86.0, 93.0)));
  };
});
