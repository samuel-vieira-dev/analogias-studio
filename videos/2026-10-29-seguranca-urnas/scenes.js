// ============================================================================
// videos/2026-10-29-seguranca-urnas/scenes.js
// 3D scenes synced to audio/words.json (narration 0–102.8 s, video 104.8 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery only: generic voting machine (no TSE logo), no party symbols, no real brands.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const BEIGE = "#e7dfd0", INK = "#1d1d1d", WOODC = "#6a4a30", PAPER = "#fbf7ef";

// Canvas texture painted by a function (w x h px). API { tex, ctx, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, ctx: x, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }

// Screen states for the voting machine (512 x 356 canvas).
function paintScreen(state) {
  return (x, w, h) => {
    const bg = { off: "#2b3238", voto: "#f4f6f8", lock: "#e9f6ee", ok: "#e9f6ee", x: "#fbe9e7", zero: "#f4f6f8", fim: "#f4f6f8" }[state] || "#f4f6f8";
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    if (state === "voto") { centerText(x, "SEU VOTO", w / 2, 90, "900 64px Inter", "#141414"); x.fillStyle = "#c9ced3"; x.fillRect(110, 170, 120, 110); x.fillRect(282, 170, 120, 110); centerText(x, "1", 170, 226, "900 80px Inter", "#141414"); centerText(x, "3", 342, 226, "900 80px Inter", "#141414"); }
    if (state === "lock" || state === "ok") {
      x.strokeStyle = GREEN; x.lineWidth = 22; x.beginPath(); x.arc(w / 2, 128, 52, Math.PI, 0); x.stroke();
      x.fillStyle = GREEN; roundRect(x, w / 2 - 82, 124, 164, 120, 18); x.fill();
      centerText(x, state === "ok" ? "PROGRAMA OK" : "PROTEGIDA", w / 2, 300, "900 50px Inter", "#1f6b43");
    }
    if (state === "x") { centerText(x, "✕", w / 2, 140, "900 170px Inter", RED); centerText(x, "RECUSADO", w / 2, 300, "900 56px Inter", RED); }
    if (state === "zero") { centerText(x, "0", w / 2, 150, "900 190px Inter", "#141414"); centerText(x, "VOTOS", w / 2, 300, "900 52px Inter", "#141414"); }
    if (state === "fim") centerText(x, "FIM", w / 2, h / 2, "900 150px Inter", "#141414");
  };
}
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
// Generic electronic voting machine: wedge-shaped beige body, sloped top with a screen (left) and a
// keypad (right), side ports, printer slot at the back of the top. Origin: floor, centre; front +z.
// API { group, screen(state), top: Group (sloped top, local y = surface), port(side) → world-local V3, slot }
function makeUrna({ label = null } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.55, 0); s.lineTo(0.55, 0); s.lineTo(0.55, 0.62); s.lineTo(-0.55, 0.3); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.translate(0, 0, -0.8); geo.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(geo, mat(BEIGE, { roughness: 0.6 })); body.position.y = 0.02; g.add(body);
  const theta = Math.atan2(0.32, 1.1);
  const top = new THREE.Group(); top.position.set(0, 0.48 + 0.025, 0); top.rotation.x = theta; g.add(top);
  const bezel = new THREE.Mesh(rbox(0.8, 0.03, 0.6, 0.01), mat("#3a3a3a")); bezel.position.set(-0.36, 0.0, -0.02); top.add(bezel);
  const scr = canvasTex(512, 356, paintScreen("voto"));
  const screenM = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
  screenM.rotation.x = -Math.PI / 2; screenM.position.set(-0.36, 0.017, -0.02); top.add(screenM);
  const kp = canvasTex(400, 440, paintKeypad);
  const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.62), new THREE.MeshStandardMaterial({ map: kp.tex, roughness: 0.6 }));
  keypad.rotation.x = -Math.PI / 2; keypad.position.set(0.42, 0.004, 0.0); top.add(keypad);
  // printer slot near the back edge of the top
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.05), mat("#222")); slot.position.set(-0.36, 0.006, -0.46); top.add(slot);
  // side ports (dark sockets on each side face)
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.3), mat("#1a1a1a")); p.position.set(sx * 0.815, 0.15, 0); g.add(p); }
  const plate = makePlate(label || "URNA ELETRÔNICA", 1.0, 0.16, { bg: BEIGE, fg: "#4a4038", detail: true }); plate.position.set(0, 0.16, 0.586); g.add(plate);
  g.add(contactShadow(2.4, 1.8));
  const slotWorld = () => { const v = new V3(-0.36, 0.006, -0.46); top.updateMatrix(); return v.applyMatrix4(top.matrix); };
  return { group: g, top, screen: (st) => scr.paint(paintScreen(st)), port: (side) => new V3(side * 0.83, 0.25, 0), slot: slotWorld() };
}
// Canvas ballot box ("urna de lona"): fabric bag on a wooden mouth frame with a slot. Origin: floor.
// API { group, body (scale it to make it bulge), top }
function makeLonaUrn() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.44, 0.9, 28, 4), mat("#b49a6c", { roughness: 1 })); body.position.y = 0.45; g.add(body);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.015, 6, 40), mat("#7d6a48")); seam.rotation.x = Math.PI / 2; seam.position.y = 0.45; body.add(seam); seam.position.y = 0;
  const frame = new THREE.Mesh(rbox(1.1, 0.12, 1.1, 0.03), mat(WOODC, { roughness: 0.8 })); frame.position.y = 0.96; g.add(frame);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.06), mat("#141414")); slot.position.y = 1.025; g.add(slot);
  const lbl = makePlate("URNA", 0.7, 0.22, { bg: "#efe4cf", fg: "#3a2a1e" }); lbl.position.set(0, 0.5, 0.5); g.add(lbl);
  g.add(contactShadow(1.8, 1.8));
  return { group: g, body, lbl, top: 1.02 };
}
// Paper ballot lying flat (a cédula), face up. Origin: centre of the sheet's bottom face.
const BALLOT_TEX = canvasTex(256, 340, (x, w, h) => {
  x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
  centerText(x, "CÉDULA", w / 2, 40, "900 34px Inter", "#3a3330");
  x.fillStyle = "#c2bab0"; for (let i = 0; i < 4; i++) { x.fillRect(30, 90 + i * 56, 34, 34); x.fillRect(80, 100 + i * 56, 140, 12); }
  x.strokeStyle = "#1d3fb8"; x.lineWidth = 7; x.beginPath(); x.moveTo(32, 148); x.lineTo(62, 178); x.moveTo(62, 148); x.lineTo(32, 178); x.stroke();
}).tex;
function makeCedula(s = 1) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.012, 0.56 * s), [mat(PAPER), mat(PAPER), new THREE.MeshStandardMaterial({ map: BALLOT_TEX, roughness: 0.9 }), mat(PAPER), mat(PAPER), mat(PAPER)]);
  m.geometry.translate(0, 0.006, 0); return m;
}
// Flat sheet of paper with a painted top face. Origin: centre of its bottom face. API { mesh, paint }
function makeSheet(w, d, painter, px = 512) {
  const ct = canvasTex(px, Math.round(px * d / w), painter);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.014, d), [mat(PAPER), mat(PAPER), new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 }), mat(PAPER), mat(PAPER), mat(PAPER)]);
  m.geometry.translate(0, 0.007, 0); return { mesh: m, paint: ct.paint };
}
// Simple table: top slab + four legs. Origin: floor. API { group, top }
function makeTable(w = 3.2, d = 1.8, h = 0.8) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(rbox(w, 0.08, d, 0.02), mat(WOODC, { roughness: 0.8 })); top.position.y = h - 0.04; g.add(top);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, h - 0.08, 0.08), mat("#4a3424")); l.position.set(x * (w / 2 - 0.12), (h - 0.08) / 2, z * (d / 2 - 0.12)); g.add(l); }
  g.add(contactShadow(w + 0.6, d + 0.6)); return { group: g, top: h };
}
// Eraser block. Origin: bottom centre.
function makeEraser() {
  const g = new THREE.Group();
  const a = new THREE.Mesh(rbox(0.5, 0.16, 0.26, 0.04), mat("#f2b8c6", { roughness: 0.9 })); a.position.y = 0.08; g.add(a);
  const b = new THREE.Mesh(rbox(0.3, 0.165, 0.27, 0.04), mat("#3a6aa8", { roughness: 0.7 })); b.position.set(0.1, 0.085, 0); g.add(b);
  return g;
}
// Clipboard standing on a small easel with a technical sketch of the voting machine. Origin: floor.
function makeClipboard() {
  const g = new THREE.Group();
  const inner = new THREE.Group(); inner.position.set(0, 1.0, 0); inner.rotation.x = -0.18; g.add(inner);
  const board = new THREE.Mesh(rbox(1.4, 1.8, 0.06, 0.04), mat("#8a5a3a", { roughness: 0.8 })); inner.add(board);
  const sk = canvasTex(512, 600, (x, w, h) => {
    x.fillStyle = "#eef3fb"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "#c9d6ea"; x.lineWidth = 2; for (let i = 0; i < w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.strokeStyle = "#1d3fb8"; x.lineWidth = 7;
    x.beginPath(); x.moveTo(70, 420); x.lineTo(440, 420); x.lineTo(440, 300); x.lineTo(70, 360); x.closePath(); x.stroke();
    x.strokeRect(110, 352, 130, 40); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) x.strokeRect(290 + c * 40, 318 + r * 26, 28, 18);
    centerText(x, "URNA · 1996", w / 2, 110, "900 58px Inter", "#1d3fb8");
    centerText(x, "PROJETO", w / 2, 190, "800 40px Inter", "#1d3fb8");
    x.lineWidth = 3; x.beginPath(); x.moveTo(70, 470); x.lineTo(440, 470); x.stroke(); centerText(x, "1,6 m", w / 2, 505, "700 30px Inter", "#1d3fb8");
  });
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 1.46), new THREE.MeshBasicMaterial({ map: sk.tex, toneMapped: false })); sheet.position.set(0, -0.1, 0.034); inner.add(sheet);
  const clip = new THREE.Mesh(rbox(0.5, 0.16, 0.08, 0.03), mat("#b8bcc0", { metalness: 0.7, roughness: 0.3 })); clip.position.set(0, 0.82, 0.05); inner.add(clip);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.06), mat("#5a3a26")); leg.position.set(0, 0.55, -0.42); leg.rotation.x = 0.4; g.add(leg);
  g.add(contactShadow(1.6, 1.2)); return g;
}
// Brazil map: flat extruded outline (approximate coastline/borders from ~26 lon/lat points), lying on
// the floor, north away from the camera, with city dots. Origin: floor, map centre.
// API { group, setFill(k) (grey → green), dots: [mesh], top }
const BR_LONLAT = [[-60, 5], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-39.5, -18], [-41, -22], [-45, -23.5], [-48, -25.5], [-48.5, -28], [-53, -33.7], [-57.5, -30], [-54, -26], [-55, -23.5], [-58, -20], [-58, -16.5], [-60.5, -14], [-65, -11], [-70, -11], [-73.5, -8], [-73, -4.5], [-70, -4], [-69.5, 1], [-67, 2], [-64, 4]];
function makeBrazilMap({ scale = 0.085, dotsN = 57, seed = 9 } = {}) {
  const g = new THREE.Group();
  const pts = BR_LONLAT.map(([lo, la]) => [(lo + 53) * scale, (la + 14) * scale]);
  const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
  geo.rotateX(-Math.PI / 2); geo.translate(0, 0.02, 0);
  const fillM = mat("#5a5048", { roughness: 0.7 }); const land = new THREE.Mesh(geo, fillM); g.add(land);
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const rnd = mulberry32(seed), dots = [];
  const dm = mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.6 });
  while (dots.length < dotsN) {
    const x = (rnd() * 40 - 74 + 53) * scale, y = (rnd() * 39 - 34 + 14) * scale;
    if (!inside(x, y)) continue;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), dm); d.position.set(x, 0.16, -y); g.add(d); dots.push(d);
  }
  g.add(contactShadow(4.4, 4.4));
  const grey = new THREE.Color("#5a5048"), green = new THREE.Color(GREEN);
  return { group: g, dots, top: 0.14, setFill: (k) => { fillM.color.copy(grey).lerp(green, k); fillM.emissive.copy(green).multiplyScalar(0.25 * k); } };
}
// Glass dome on a dark ring base. Origin: floor. API { group, mat }
function makeDome(r = 1.35) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const d = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), m); g.add(d);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 8, 64), mat("#3a3a3a", { metalness: 0.5 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.04; g.add(rim);
  return { group: g, mat: m, r };
}
// Round token with a printed word (INTERNET, WI-FI...). Faces +z. Origin: centre.
function makeToken(text, color = "#2c6fbf") {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 40), mat(color, { roughness: 0.4 })); disc.rotation.x = Math.PI / 2; g.add(disc);
  const p = makePlate(text, 0.72, 0.24, { bg: null, fg: "#ffffff" }); p.position.z = 0.052; g.add(p);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.04), mat(RED, { emissive: RED, emissiveIntensity: 0.4 })); bar.rotation.z = -0.7; bar.position.z = 0.09; bar.visible = false; g.add(bar);
  return { group: g, bar };
}
// USB stick lying flat, connector toward +x. Optional seal on top. Origin: bottom centre.
// API { group, seal, tag } — seal (red wax disc) and tag (printed plate on top) start hidden.
function makeUSB(tagText, color = "#2a2f35") {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(0.9, 0.2, 0.36, 0.05), mat(color, { roughness: 0.5 })); b.position.y = 0.1; g.add(b);
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.24), mat("#c9ced3", { metalness: 0.8, roughness: 0.25 })); c.position.set(0.6, 0.1, 0); g.add(c);
  const seal = new THREE.Group(); seal.position.set(-0.22, 0.2, 0); g.add(seal);
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.05, 28), mat("#a3161b", { roughness: 0.5 })); wax.position.y = 0.025; seal.add(wax);
  const tag = makePlate(tagText, 0.44, 0.17, { bg: null, fg: "#ffffff", detail: true }); tag.rotation.x = -Math.PI / 2; tag.position.set(0.17, 0.205, 0); g.add(tag);
  seal.visible = false; tag.visible = false;
  g.add(contactShadow(1.4, 0.8)); return { group: g, seal, tag };
}
// Paper strip that grows up out of a slot (receipt). Origin: bottom centre of the strip.
// API { group, set(k) 0..1 height }
function makeReceipt(painter, { w = 0.52, h = 0.9 } = {}) {
  const g = new THREE.Group();
  const ct = canvasTex(256, Math.round(256 * h / w), painter);
  const geo = new THREE.BoxGeometry(w, h, 0.01); geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, [mat(PAPER), mat(PAPER), mat(PAPER), mat(PAPER), new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 }), mat(PAPER)]);
  g.add(m);
  return { group: g, mesh: m, set: (k) => { m.scale.y = Math.max(0.001, k); m.visible = k > 0.01; } };
}
function receiptLines(title, sub, { rows = 6, big = null } = {}) {
  return (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
    let fs = 30; x.font = `900 ${fs}px Inter`; while (x.measureText(title).width > w * 0.9 && fs > 12) { fs -= 1; x.font = `900 ${fs}px Inter`; } centerText(x, title, w / 2, 44, `900 ${fs}px Inter`, "#141414"); if (sub) centerText(x, sub, w / 2, 84, "700 22px Inter", "#3a3330");
    if (big) centerText(x, big, w / 2, h * 0.45, "900 120px Inter", "#141414");
    x.fillStyle = "#b9b2a8"; for (let i = 0; i < rows; i++) { const y = (big ? h * 0.62 : 130) + i * 36; x.fillRect(24, y, 120, 10); x.fillRect(w - 80, y, 56, 10); }
  };
}
// Door in a short wall segment, with a knob. The door face is at z = face. Origin: floor.
function makeDoor() {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(rbox(2.6, 2.6, 0.2, 0.02), mat("#4a3a30", { roughness: 0.95 })); wall.position.set(0, 1.3, -0.1); g.add(wall);
  const door = new THREE.Mesh(rbox(1.1, 2.1, 0.08, 0.02), mat("#7a5232", { roughness: 0.7 })); door.position.set(0, 1.05, 0.04); g.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat("#c9a45a", { metalness: 0.7, roughness: 0.3 })); knob.position.set(0.4, 1.0, 0.11); g.add(knob);
  const sign = makePlate("SEÇÃO 0042", 1.1, 0.28, { bg: "#141414", fg: "#ffffff" }); sign.position.set(0, 2.25, 0.095); g.add(sign);
  g.add(contactShadow(3, 1)); return { group: g, wall, door, face: 0.08 };
}
// Desk monitor with a painted screen. Origin: floor of its stand. API { group, paint }
function makeMonitor(w = 1.5, h = 0.95, painter) {
  const g = new THREE.Group();
  const foot = new THREE.Mesh(rbox(0.6, 0.05, 0.4, 0.02), mat("#2a2a2a")); foot.position.y = 0.025; g.add(foot);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.06), mat("#2a2a2a")); neck.position.set(0, 0.25, -0.05); g.add(neck);
  const frame = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.06, 0.02), mat("#1a1a1a")); frame.position.set(0, 0.45 + h / 2, 0); g.add(frame);
  const ct = canvasTex(512, Math.round(512 * h / w), painter);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false })); scr.position.set(0, 0.45 + h / 2, 0.032); g.add(scr);
  g.add(contactShadow(w + 0.4, 0.8)); return { group: g, paint: ct.paint, screenY: 0.45 + h / 2 };
}
// Pocket calculator lying flat. Origin: bottom centre.
function makeCalculator() {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(0.6, 0.08, 0.86, 0.04), mat("#2f3439")); b.position.y = 0.04; g.add(b);
  const ct = canvasTex(300, 430, (x, w, h) => {
    x.fillStyle = "#2f3439"; x.fillRect(0, 0, w, h); x.fillStyle = "#b8d8b0"; x.fillRect(24, 24, w - 48, 90); centerText(x, "1.284", w / 2, 72, "800 56px Inter", "#1d2a1a");
    const lab = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ",", "=", "+"];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = c === 3 ? ORANGE : "#566068"; roundRect(x, 24 + c * 66, 140 + r * 70, 54, 56, 8); x.fill(); centerText(x, lab[r * 4 + c], 51 + c * 66, 170 + r * 70, "800 34px Inter", "#ffffff"); }
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.8), new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.5 })); face.rotation.x = -Math.PI / 2; face.position.y = 0.082; g.add(face);
  g.add(contactShadow(0.9, 1.1)); return g;
}
// Lottery globe: wire sphere on a stand with balls inside (spin with .spin(a)). Origin: floor.
function makeGlobe() {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.3, 24), mat("#3a2a20")); stand.position.y = 0.15; g.add(stand);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10), mat("#8b9196", { metalness: 0.6 })); post.position.y = 0.55; g.add(post);
  const ball = new THREE.Group(); ball.position.y = 1.5; g.add(ball);
  const wm = mat("#c9a45a", { metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.02, 6, 48), wm); r.rotation.y = i * Math.PI / 6; ball.add(r); }
  const eq = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.02, 6, 48), wm); eq.rotation.x = Math.PI / 2; ball.add(eq);
  const rnd = mulberry32(5), cols = [ORANGE, GREEN, CREAM, RED];
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), mat(cols[i % 4])); const a = rnd() * 6.28, e = (rnd() - 0.5) * 2.4, rr = 0.12 + rnd() * 0.28; b.position.set(Math.cos(a) * rr, e * 0.2, Math.sin(a) * rr); ball.add(b); }
  g.add(contactShadow(1.6, 1.6)); return { group: g, ball };
}
// Video camera on a tripod, lens toward +x. Origin: floor.
function makeTripodCam() {
  const g = new THREE.Group(), dm = mat("#7a7f86");
  for (let i = 0; i < 3; i++) { const a = i * 2.094; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8), dm); l.position.set(Math.cos(a) * 0.22, 0.62, Math.sin(a) * 0.22); l.rotation.set(Math.sin(a) * 0.32, 0, -Math.cos(a) * 0.32); g.add(l); }
  const body = new THREE.Mesh(rbox(0.6, 0.36, 0.3, 0.05), mat("#6b7380")); body.position.y = 1.42; g.add(body);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.24, 20), mat("#141414", { roughness: 0.3 })); lens.rotation.z = Math.PI / 2; lens.position.set(0.42, 1.42, 0); g.add(lens);
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), new THREE.MeshBasicMaterial({ color: RED, toneMapped: false })); rec.position.set(-0.18, 1.62, 0.1); g.add(rec);
  g.add(contactShadow(1, 1)); return { group: g, rec };
}
// Open laptop facing +z (screen with code). Origin: floor of its base. API { group, paint }
function makeLaptop(seed = 1) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.0, 0.05, 0.7, 0.02), mat("#8b9196", { metalness: 0.5, roughness: 0.4 })); base.position.y = 0.025; g.add(base);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.05, -0.34); hinge.rotation.x = -0.25; g.add(hinge);
  const lid = new THREE.Mesh(rbox(1.0, 0.66, 0.04, 0.02), mat("#8b9196", { metalness: 0.5, roughness: 0.4 })); lid.position.set(0, 0.33, -0.02); hinge.add(lid);
  const rnd = mulberry32(seed);
  const ct = canvasTex(400, 260, (x, w, h) => { x.fillStyle = "#0d1410"; x.fillRect(0, 0, w, h); for (let i = 0; i < 11; i++) { x.fillStyle = i % 4 === 3 ? ORANGE : "#4fd17a"; x.fillRect(16 + (i % 3) * 18, 14 + i * 22, 80 + rnd() * 240, 9); } });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.58), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false })); scr.position.set(0, 0.33, 0.002); hinge.add(scr);
  g.add(contactShadow(1.3, 1)); return { group: g };
}
// Small receipt printer, paper out of the top toward the front. Origin: floor. API { group, paper }
function makePrinter(label = "COMPROVANTE") {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(1.0, 0.5, 0.8, 0.06), mat("#6d7378", { roughness: 0.5 })); b.position.y = 0.25; g.add(b);
  const lid = new THREE.Mesh(rbox(0.9, 0.06, 0.5, 0.03), mat("#4a4f54")); lid.position.set(0, 0.52, -0.1); g.add(lid);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.04), mat("#141414")); slot.position.set(0, 0.512, 0.2); g.add(slot);
  const paper = makeReceipt(receiptLines(label, "VOTO 13", { rows: 3 }), { w: 0.56, h: 0.8 }); paper.group.position.set(0, 0.52, 0.2); paper.group.rotation.x = -0.25; g.add(paper.group);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false })); led.position.set(0.38, 0.35, 0.405); g.add(led);
  g.add(contactShadow(1.5, 1.2)); return { group: g, paper };
}
// Magnifying glass lying in the air, lens facing +z. Origin: lens centre.
function makeMagnifier() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 48), mat("#2a2a2a", { roughness: 0.4 })); g.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.4, 40), new THREE.MeshStandardMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false })); g.add(glass);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 16), mat("#6a4330")); handle.position.set(0.58, -0.58, 0); handle.rotation.z = Math.PI / 4; g.add(handle);
  return g;
}
// Judge's gavel: head + handle, head toward -x, lying above its strike block. Origin: head centre.
function makeGavel() {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 24), mat("#5a3a26", { roughness: 0.5 })); head.rotation.x = Math.PI / 2; g.add(head);
  for (const z of [-0.26, 0.26]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24), mat("#c9a45a", { metalness: 0.6, roughness: 0.3 })); b.rotation.x = Math.PI / 2; b.position.z = z; g.add(b); }
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 14), mat("#6a4330")); h.rotation.z = Math.PI / 2; h.position.x = 0.7; g.add(h);
  return g;
}

// Shared shot helper per scene.
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.08 }, o));

// ---------------------------------------------------------------- 1. gancho (0 – 2.95)
// "Você sabe o que impede alguém de mudar o seu voto?"
addScene("gancho", 0, 2.95, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen("voto");
  // hand pointing down: finger tip at the hand origin
  const hand = new THREE.Group(); S.add(hand);
  // hand, index finger pointing down (tip at the origin), three curled fingers, thumb, sleeve
  const gm = mat("#c98d63", { roughness: 0.6 });
  const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.3, 6, 12), gm); finger.position.set(-0.1, 0.2, 0.02); hand.add(finger);
  const palm = new THREE.Mesh(rbox(0.36, 0.36, 0.2, 0.08), gm); palm.position.set(0, 0.52, 0); hand.add(palm);
  [0.0, 0.1].forEach((x) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), gm); k.scale.set(1, 1.3, 1); k.position.set(x, 0.33, 0.06); hand.add(k); });
  const k3 = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), gm); k3.scale.set(1, 1.3, 1); k3.position.set(0.17, 0.36, 0.05); hand.add(k3);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.16, 6, 10), gm); thumb.position.set(-0.2, 0.45, 0.08); thumb.rotation.z = 0.7; hand.add(thumb);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.6, 20), mat("#2c5a9a", { roughness: 0.9 })); sleeve.position.set(0.02, 0.95, 0); hand.add(sleeve);
  hand.rotation.z = 0.3; hand.scale.setScalar(1.4);
  S.hero(u.group, "urna eletrônica"); S.hero(hand, "mão");
  S.solid(u.group, "urna"); S.solid(hand, "mão");
  const key = new V3(0.42, 0.62, 0.05);
  const anim = (t) => {
    const k = eOut(lin(t, 0.0, 1.5)), back = sm(t, 1.9, 2.6);
    hand.position.set(key.x + 0.9 * (1 - k) + 0.3 * back, key.y + 0.42 + 0.9 * (1 - k) + 0.3 * back, key.z + 0.15);
    u.screen(t < 1.75 ? "voto" : "lock");
  };
  const A0 = shotOf(anim)([u.group, hand], 0, 2.95, { from: [0.35, 0.7, 1], pull: 1.1 });
  const A1 = shotOf(anim)([u.group, hand], 0, 2.95, { from: [0.05, 0.62, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    fill.color.set(t < 1.75 ? RED : GREEN); fill.position.set(0, 1.6, 1.4); fill.intensity = t < 1.75 ? 3 : 5 * (1 - 0.5 * lin(t, 1.75, 2.95));
    CAM.apply(CAM.blend(A0, A1, sm(t, 0, 2.95)));
  };
});

// ---------------------------------------------------------------- 2. papel, 1994 (2.95 – 16.3)
// "Imagina: 1994. Você vota num papel, que cai numa urna de lona e é contado à mão.
//  Naquele ano, a Justiça Eleitoral do Rio chegou a anular a eleição de deputados, por suspeita de fraude."
addScene("papel", 2.95, 16.3, (S) => {
  const urn = makeLonaUrn(); S.add(urn.group);
  const ced = makeCedula(1.4); S.add(ced);
  const table = makeTable(3.0, 1.7); table.group.position.set(5.5, 0, 0); S.add(table.group);
  const pileA = new THREE.Group(), pileB = new THREE.Group(); pileA.position.set(4.85, table.top, 0.1); pileB.position.set(6.1, table.top, 0.1); S.add(pileA, pileB);
  const NA = 16; const sheetsA = [], sheetsB = [];
  for (let i = 0; i < NA; i++) { const a = makeCedula(1.6); a.position.y = i * 0.013; a.rotation.y = (i % 3 - 1) * 0.05; pileA.add(a); sheetsA.push(a); const b = makeCedula(1.6); b.position.y = i * 0.013; b.rotation.y = (i % 2 ? 0.04 : -0.03); pileB.add(b); sheetsB.push(b); }
  const lamp = new THREE.Group(); lamp.position.set(5.5, 2.6, 0); S.add(lamp);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 6), mat("#222")); cord.position.y = 0.4; lamp.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.26, 24, 1, true), mat("#2a2a2a", { side: THREE.DoubleSide })); lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffe2a8", toneMapped: false })); bulb.position.y = -0.08; lamp.add(bulb);
  const stamp = makeStamp({ ink: RED }); S.add(stamp);
  const imprint = makePlate("ANULADA", 1.0, 0.3, { bg: RED, fg: "#ffffff" }); imprint.rotation.set(-Math.PI / 2, 0, 0.12); S.add(imprint);
  const pileTop = (n) => table.top + n * 0.013 + 0.017;
  S.hero(urn.group, "urna de lona", { when: (t) => t < 8.4 }); S.hero(ced, "cédula", { when: (t) => t > 3.2 && t < 7.4 });
  S.hero(table.group, "mesa de apuração", { when: (t) => t > 8.9 }); S.hero(pileA, "pilha de cédulas", { when: (t) => t > 8.9 });
  S.solid(urn.group, "urna de lona"); S.solid(table.group, "mesa");
  S.solid(stamp, "carimbo", { restsOn: ["pilha"], when: (t) => t > 12 }); S.solid(pileA, "pilha", { restsOn: ["mesa"] });
  const anim = (t) => {
    // ballot: floats in at 3.0, tilts, drops into the slot at 7.4–8.0
    popIn(ced, t, 3.0, 0.45, 1, 8.05);
    const drop = sm(t, 7.35, 8.0);
    ced.position.set(0, urn.top + 0.75 - 0.75 * drop, 0.05);
    ced.rotation.set(lerp(1.15, Math.PI / 2, drop), 0.25 * (1 - drop) + 0.1 * Math.sin(t * 1.6) * (1 - drop), 0);
    // counting by hand: sheets move from pile A to pile B, one by one
    const moved = Math.floor(clamp((t - 9.0) / 0.32, 0, 9));
    sheetsB.forEach((s, i) => { s.visible = i < 3 + moved; });
    sheetsA.forEach((s, i) => { s.visible = i < NA - moved; });
    const nA = NA - moved;
    const down = eOut(lin(t, 12.7, 12.95)), up = sm(t, 13.5, 14.2);
    stamp.visible = t > 12.2 && t < 14.25;
    stamp.position.set(4.85, pileTop(nA) + 1.3 * (1 - down) + 1.3 * up, 0.12);
    imprint.visible = t >= 12.95;
    imprint.position.set(4.85, pileTop(nA) + 0.002, 0.12);
  };
  const shot = shotOf(anim);
  const A0 = shot([urn.group, ced], 2.95, 8.3, { from: [-0.3, 0.45, 1], pull: 1.12 }), A1 = shot([urn.group, ced], 2.95, 8.3, { from: [0.1, 0.4, 1], pull: 1.03 });
  const B0 = shot([table.group, pileA, pileB], 8.6, 16.3, { from: [-0.1, 0.9, 1], pull: 1.04 }), B1 = shot([table.group, pileA, pileB], 8.6, 16.3, { from: [0.15, 1.05, 0.9], pull: 1.0 });
  return (t) => {
    anim(t);
    key.color.set("#ffd9a0"); key.intensity = t < 8.5 ? 2.2 : 1.6;
    const hit = t > 12.95 ? 1 - lin(t, 12.95, 14) : 0;
    fill.color.set(t < 12.9 ? "#ffd9a0" : RED); fill.position.set(5.5, 2.0, 0.6); fill.intensity = t > 8.5 ? 4 + 5 * hit : 0;
    CAM.apply(CAM.shake(CAM.track(t, [[2.95, A0], [8.1, A1, 5.1], [8.9, B0, 0.8], [16.3, B1, 7.3]]), t, 12.95, 0.05, 0.45));
  };
});

// ---------------------------------------------------------------- 3. fraudes (16.3 – 20.6)
// "Tinha urna que já chegava cheia e mapa de resultado adulterado."
addScene("fraudes", 16.3, 20.6, (S) => {
  const urn = makeLonaUrn(); S.add(urn.group);
  const poke = []; for (let i = 0; i < 5; i++) { const c = makeCedula(1.0); c.rotation.set(Math.PI / 2 - 0.25 + i * 0.12, (i - 2) * 0.25, 0); c.position.set((i - 2) * 0.09, urn.top + 0.12, 0); S.add(c); poke.push(c); }
  const table = makeTable(2.6, 1.7); table.group.position.set(3.6, 0, 0); S.add(table.group);
  const draw = (fake) => (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
    centerText(x, "MAPA DE APURAÇÃO", w / 2, 50, "900 40px Inter", "#141414");
    x.strokeStyle = "#8a8278"; x.lineWidth = 3; for (let r = 0; r < 5; r++) { x.strokeRect(40, 100 + r * 66, w - 80, 66); }
    ["CANDIDATO A", "CANDIDATO B", "CANDIDATO C", "BRANCOS", "NULOS"].forEach((n, r) => {
      centerText(x, n, 170, 133 + r * 66, "700 28px Inter", "#3a3330");
      const v = r === 3 ? (fake ? "18" : "212") : r === 0 ? (fake ? "552" : "358") : ["", "", "301", "", "47"][r] || "290";
      centerText(x, v, w - 120, 133 + r * 66, "900 38px Inter", r === 0 && fake ? RED : "#141414");
    });
  };
  const sheet = makeSheet(1.8, 1.25, draw(false), 680); sheet.mesh.position.set(3.6, table.top, 0.05); S.add(sheet.mesh);
  const eraser = makeEraser(); S.add(eraser);
  S.hero(urn.group, "urna de lona cheia", { when: (t) => t < 18.1 });
  S.hero(sheet.mesh, "mapa de apuração", { when: (t) => t > 18.5 });
  S.solid(urn.group, "urna de lona"); S.solid(table.group, "mesa"); S.solid(eraser, "borracha", { restsOn: ["mapa"], when: (t) => t > 18.5 }); S.solid(sheet.mesh, "mapa", { restsOn: ["mesa"] });
  let painted = false;
  const anim = (t) => {
    const g = eOut(lin(t, 16.6, 17.9));
    const bx = 1 + 0.42 * g + 0.03 * Math.sin(t * 9) * g; urn.body.scale.set(bx, 1 + 0.08 * g, 1 + 0.42 * g); urn.lbl.position.z = 0.5 * (1 + 0.42 * g) + 0.02;
    poke.forEach((c, i) => { popIn(c, t, 17.3 + i * 0.08, 0.3); });
    // eraser rubs over candidate A's number and the number changes
    const on = sm(t, 18.3, 18.7) * (1 - sm(t, 19.3, 19.7));
    eraser.position.set(3.6 + 0.58 + 0.1 * Math.sin(t * 14) * (t > 18.7 && t < 19.3 ? 1 : 0), table.top + 0.014 + 0.6 * (1 - on), 0.05 - 0.27);
    const fake = t > 19.3;
    if (fake !== painted) { sheet.paint(draw(fake)); painted = fake; }
  };
  const shot = shotOf(anim);
  const A0 = shot([urn.group, ...poke], 16.3, 18.1, { from: [0.2, 0.4, 1], pull: 1.1 }), A1 = shot([urn.group, ...poke], 16.3, 18.1, { from: [-0.05, 0.35, 1], pull: 1.03 });
  const B0 = shot([sheet.mesh, eraser], 18.3, 20.6, { from: [0, 1.4, 0.7], pull: 1.08 }), B1 = shot([sheet.mesh, eraser], 18.3, 20.6, { from: [0.1, 1.5, 0.6], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(RED); fill.position.set(t < 18.2 ? 0 : 3.6, 2.0, 1.2); fill.intensity = t < 18.2 ? 4 * sm(t, 16.8, 17.6) : 3 + 3 * sm(t, 19.3, 19.6);
    CAM.apply(CAM.track(t, [[16.3, A0], [18.1, A1, 1.8], [18.5, B0, 0.4], [20.6, B1, 2.1]]));
  };
});

// ---------------------------------------------------------------- 4. história (20.6 – 32.1)
// "Então o TSE chama engenheiros do Inpe e do CTA. Em 1996, a urna eletrônica estreia em
//  cinquenta e sete cidades. Em 2000, chega ao país inteiro."
addScene("historia", 20.6, 32.1, (S) => {
  const cb = makeClipboard(); cb.position.set(-0.6, 0, 0); S.add(cb);
  const u = makeUrna({ label: "MODELO 1996" }); u.group.position.set(1.35, 0, 0.25); u.group.scale.setScalar(0.95); S.add(u.group); u.screen("voto");
  const map = makeBrazilMap(); map.group.position.set(8, 0, 0); S.add(map.group);
  S.hero(cb, "prancheta com projeto", { when: (t) => t < 26.4 });
  S.hero(u.group, "urna de 1996", { when: (t) => t > 24.8 && t < 26.4 });
  S.hero(map.group, "mapa do Brasil", { when: (t) => t > 26.9 });
  S.solid(cb, "prancheta"); S.solid(u.group, "urna 1996");
  const order = map.dots.map((d, i) => i);
  const anim = (t) => {
    popIn(u.group, t, 24.43, 0.45, 0.95);
    map.dots.forEach((d, i) => { const at = 27.93 + (order[i] / map.dots.length) * 1.1; d.visible = t > at; d.scale.setScalar(Math.max(0.0001, pop(t, at, 0.25))); });
    map.setFill(sm(t, 29.86, 30.8));
  };
  const shot = shotOf(anim);
  const A0 = shot([cb], 20.6, 24.2, { from: [-0.2, 0.25, 1], pull: 1.1 }), A1 = shot([cb], 20.6, 24.2, { from: [0.05, 0.2, 1], pull: 1.03 });
  const B0 = shot([cb, u.group], 24.3, 26.4, { from: [0.2, 0.4, 1], pull: 1.08 }), B1 = shot([cb, u.group], 24.3, 26.4, { from: [0.35, 0.45, 1], pull: 1.03 });
  const C0 = shot([map.group], 26.4, 32.1, { from: [0, 1.6, 1], pull: 1.08 }), C1 = shot([map.group], 26.4, 32.1, { from: [0.1, 1.9, 0.8], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(t < 29.8 ? ORANGE : GREEN); fill.position.set(t < 26.5 ? 1.3 : 8, 2.2, 1.4); fill.intensity = t < 26.5 ? 4 * sm(t, 24.4, 24.9) : 2 + 4 * sm(t, 29.86, 30.6);
    CAM.apply(CAM.track(t, [[20.6, A0], [24.0, A1, 3.4], [24.8, B0, 0.6], [26.4, B1, 1.6], [26.9, C0, 0.5], [32.1, C1, 5.2]]));
  };
});

// ---------------------------------------------------------------- 5. sem internet (32.1 – 38.0)
// "Primeira camada: ela não tem internet, Wi-Fi nem Bluetooth. Ninguém invade de longe."
addScene("internet", 32.1, 38.0, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen("voto");
  const dome = makeDome(1.3); S.add(dome.group);
  const toks = [["INTERNET", 34.11, -1], ["WI-FI", 34.6, 1], ["BLUETOOTH", 35.51, -1]].map(([txt, at, side], i) => { const k = makeToken(txt, ["#2c6fbf", "#3a8fd6", "#1f4fa0"][i]); S.add(k.group); return { ...k, at, side, i }; });
  S.hero(u.group, "urna eletrônica"); S.hero(dome.group, "redoma de vidro", { when: (t) => t > 33.0 });
  S.solid(u.group, "urna");
  const hitPoint = (side, i) => new V3(side * (i === 2 ? 1.5 : 1.38), 0.62 + i * 0.25, i === 2 ? 0.15 : 0.8);
  const anim = (t) => {
    popIn(dome.group, t, 32.47, 0.5);
    toks.forEach((k) => {
      const h = hitPoint(k.side, k.i), start = new V3(k.side * 1.9, 1.5 + k.i * 0.2, 1.1);
      const fly = eOut(lin(t, k.at - 0.55, k.at)), fall = lin(t, k.at, k.at + 1.0);
      const p = start.clone().lerp(h, fly);
      if (t > k.at) { p.x = h.x + k.side * 0.35 * fall; p.y = Math.max(0.42, h.y + 1.2 * fall - 2.6 * fall * fall); p.z = h.z + 0.3 * fall; }
      k.group.position.copy(p); k.group.rotation.set(0, -k.side * 0.4, t > k.at ? k.side * 0.6 * fall : 0);
      k.group.visible = t > k.at - 0.6; k.bar.visible = t > k.at;
    });
    u.screen(t > 36.28 ? "lock" : "voto");
  };
  const all = [u.group, dome.group, ...toks.map((k) => k.group)];
  const shot = shotOf(anim);
  const U0 = shot([u.group], 32.1, 32.9, { from: [-0.3, 0.5, 1], pull: 1.0 });
  const A0 = shot([u.group, dome.group, ...toks.map((k) => k.group)], 33.0, 38.0, { from: [-0.3, 0.45, 1], pull: 1.0 }), A1 = shot([u.group, dome.group, ...toks.map((k) => k.group)], 33.0, 38.0, { from: [0.25, 0.4, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const flash = Math.max(...toks.map((k) => (t > k.at ? 1 - lin(t, k.at, k.at + 0.4) : 0)));
    fill.color.set(t > 36.28 ? GREEN : "#7fb4ff"); fill.position.set(0, 1.8, 1.6); fill.intensity = 2 + 5 * flash + (t > 36.28 ? 3 : 0);
    CAM.apply(CAM.track(t, [[32.1, U0], [33.2, A0, 0.9], [38.0, A1, 4.8]]));
  };
});

// ---------------------------------------------------------------- 6. assinatura digital e lacre (38.0 – 47.5)
// "Segunda: o programa é assinado digitalmente e lacrado em cerimônia pública.
//  Se trocarem uma vírgula, a assinatura não bate e a urna recusa."
addScene("assinatura", 38.0, 47.5, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen("off");
  const good = makeUSB("ASSINADO", "#2f6fb0"); good.group.rotation.y = Math.PI; good.group.scale.setScalar(1.5); S.add(good.group);
  const bad = makeUSB("ALTERADO", "#8a3a2a"); bad.group.scale.setScalar(1.5); S.add(bad.group);
  const comma = makePlate(",", 0.3, 0.42, { bg: RED, fg: "#ffffff" }); comma.rotation.x = -Math.PI / 2; comma.position.set(0.2, 0.21, 0.0); comma.visible = false; bad.group.add(comma);
  const lacre = makePlate("LACRADO", 0.62, 0.17, { bg: "#d9b56a", fg: "#141414", detail: true }); lacre.position.set(0, 0.11, -0.185); lacre.rotation.y = Math.PI; lacre.visible = false; good.group.add(lacre); good.tag.rotation.z = Math.PI;
  S.hero(u.group, "urna eletrônica");
  S.hero(good.group, "pendrive assinado", { when: (t) => t > 39.0 && t < 43.0 });
  S.hero(bad.group, "pendrive alterado", { when: (t) => t > 43.5 });
  S.solid(u.group, "urna");
  const anim = (t) => {
    popIn(good.group, t, 38.76, 0.4);
    good.seal.visible = t > 39.47; good.seal.scale.setScalar(Math.max(0.0001, pop(t, 39.47, 0.35)));
    good.tag.visible = t > 40.08;
    lacre.visible = t > 41.13; lacre.scale.setScalar(Math.max(0.0001, pop(t, 41.13, 0.35)));
    const inG = sm(t, 42.0, 42.6);
    good.group.position.set(lerp(2.75, 1.96, inG), 0, 0);
    popIn(bad.group, t, 43.16, 0.4);
    comma.visible = t > 44.14; comma.scale.setScalar(Math.max(0.0001, pop(t, 44.14, 0.35)));
    const inB = sm(t, 45.6, 46.2);
    bad.group.position.set(lerp(-2.75, -1.96, inB), 0, 0);
    u.screen(t > 46.5 ? "x" : t > 42.6 ? "ok" : "off");
  };
  const shot = shotOf(anim);
  const A0 = shot([good.group, u.group], 38.0, 42.9, { from: [0.45, 0.55, 1], pull: 1.04 }), A1 = shot([good.group, u.group], 38.0, 42.9, { from: [0.3, 0.5, 1], pull: 1.0 });
  const B0 = shot([bad.group, u.group], 43.0, 47.5, { from: [-0.45, 0.55, 1], pull: 1.04 }), B1 = shot([bad.group, u.group], 43.0, 47.5, { from: [-0.3, 0.5, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const ok = t > 42.6 && t < 43.2 ? 1 : 0, x = t > 46.5 ? 1 - 0.5 * lin(t, 46.5, 47.5) : 0;
    fill.color.set(x > 0 ? RED : GREEN); fill.position.set(0, 1.6, 1.4); fill.intensity = 6 * Math.max(ok, x);
    CAM.apply(CAM.shake(CAM.track(t, [[38.0, A0], [42.9, A1, 4.9], [43.5, B0, 0.6], [47.5, B1, 4.0]]), t, 46.86, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 7. zerésima, boletim de urna, extrato (47.5 – 60.1)
// "Terceira: ela começa provando que está vazia, e termina imprimindo o boletim de urna, que vai pra porta
//  da seção e pra internet. É como o extrato do banco: qualquer um soma e confere com o total do TSE."
addScene("boletim", 47.5, 60.1, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen("zero");
  const zer = makeReceipt(receiptLines("ZERÉSIMA", "SEÇÃO 0042", { big: "0", rows: 3 })); S.add(zer.group);
  const bu = makeReceipt(receiptLines("BOLETIM DE URNA", "SEÇÃO 0042", { rows: 9 })); S.add(bu.group);
  const door = makeDoor(); door.group.position.set(4.2, 0, -0.3); S.add(door.group);
  const web = makeMonitor(1.0, 0.66, (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); x.fillStyle = "#2c6fbf"; x.fillRect(0, 0, w, 54); centerText(x, "BOLETINS NA INTERNET", w / 2, 28, "800 26px Inter", "#ffffff"); x.fillStyle = "#c9ced3"; for (let i = 0; i < 6; i++) x.fillRect(40, 80 + i * 40, w - 80, 22); });
  web.group.position.set(5.75, 0, 0.2); web.group.rotation.y = -0.35; S.add(web.group);
  // analogy: bank statement + calculator + TSE total panel
  const ext = makeSheet(1.3, 1.7, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
    centerText(x, "EXTRATO", w / 2, 64, "900 64px Inter", "#141414");
    x.fillStyle = "#b9b2a8"; for (let i = 0; i < 8; i++) { x.fillRect(40, 140 + i * 62, 220, 14); x.fillRect(w - 150, 140 + i * 62, 110, 14); }
    x.fillStyle = "#141414"; x.fillRect(40, h - 130, w - 80, 4); centerText(x, "TOTAL  1.284", w / 2, h - 80, "900 48px Inter", "#141414");
  });
  const desk = makeTable(3.6, 1.8, 0.8); desk.group.position.set(9.5, 0, 0); S.add(desk.group);
  ext.mesh.position.set(8.75, desk.top, 0.15); ext.mesh.rotation.y = 0.08; S.add(ext.mesh);
  const calc = makeCalculator(); calc.position.set(10.0, desk.top, 0.35); calc.rotation.y = -0.2; S.add(calc);
  const tse = makeMonitor(1.1, 0.7, (x, w, h) => { x.fillStyle = "#e9f6ee"; x.fillRect(0, 0, w, h); centerText(x, "TOTAL DO TSE", w / 2, 70, "900 44px Inter", "#141414"); centerText(x, "1.284", w / 2, 170, "900 92px Inter", "#141414"); centerText(x, "CONFERE", w / 2, 270, "900 44px Inter", "#1f6b43"); });
  tse.group.position.set(10.55, desk.top, -0.45); tse.group.scale.setScalar(0.85); S.add(tse.group);
  const doorPos = new V3(4.2, 1.35, -0.3 + door.face + 0.012);
  S.hero(u.group, "urna eletrônica", { when: (t) => t < 52.6 });
  S.hero(zer.group, "zerésima", { when: (t) => t > 48.9 && t < 50.4 });
  S.hero(bu.group, "boletim de urna", { when: (t) => t > 51.6 && t < 52.6 });
  S.hero(door.group, "porta da seção", { when: (t) => t > 53.3 && t < 55.3 }); S.hero(web.group, "monitor da internet", { when: (t) => t > 54.8 && t < 55.3 });
  S.hero(ext.mesh, "extrato", { when: (t) => t > 55.9 }); S.hero(calc, "calculadora", { when: (t) => t > 57.6 }); S.hero(tse.group, "painel do TSE", { when: (t) => t > 58.9 });
  S.solid(u.group, "urna"); S.solid(door.wall, "parede"); S.solid(desk.group, "mesa");
  S.solid(ext.mesh, "extrato", { restsOn: ["mesa"] }); S.solid(calc, "calculadora", { restsOn: ["mesa"] }); S.solid(tse.group, "painel", { restsOn: ["mesa"] });
  const slot = u.slot;
  const anim = (t) => {
    zer.group.position.copy(slot); zer.group.position.y += 0.005;
    zer.set(sm(t, 48.46, 49.4) * (1 - sm(t, 50.4, 50.9)));
    // the bulletin prints, then flies to the door and sticks there
    const fly = sm(t, 52.65, 53.3);
    const p0 = slot.clone(); p0.y += 0.005;
    bu.set(t < 52.65 ? sm(t, 51.03, 51.9) : 1);
    bu.group.position.copy(p0.clone().lerp(doorPos.clone().add(new V3(0, -0.45, 0)), fly));
    bu.group.position.y += Math.sin(fly * Math.PI) * 0.8;
    bu.group.rotation.set(0, -0.3 * Math.sin(fly * Math.PI), 0);
    bu.group.scale.setScalar(lerp(1, 1.15, fly));
    popIn(web.group, t, 54.42, 0.4);
    popIn(ext.mesh, t, 55.6, 0.4); popIn(calc, t, 57.2, 0.35); popIn(tse.group, t, 58.4, 0.4, 0.85);
    u.screen(t < 50.4 ? "zero" : "fim");
  };
  const shot = shotOf(anim);
  const A0 = shot([u.group, zer.group, bu.group], 47.5, 52.6, { from: [0.2, 0.5, 1], pull: 1.08 }), A1 = shot([u.group, zer.group, bu.group], 47.5, 52.6, { from: [-0.1, 0.45, 1], pull: 1.03 });
  const B0 = shot([door.group, web.group], 52.7, 55.3, { from: [0.15, 0.25, 1], pull: 1.06 }), B1 = shot([door.group, web.group], 52.7, 55.3, { from: [0.3, 0.25, 1], pull: 1.02 });
  const C0 = shot([ext.mesh], 55.4, 57.4, { from: [0, 1.0, 1], pull: 1.02 }), C1 = shot([ext.mesh, calc, tse.group], 55.4, 60.1, { from: [0.15, 0.9, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(t > 58.9 ? GREEN : ORANGE); fill.position.set(t < 52.6 ? 0 : t < 55.4 ? 4.6 : 9.6, 2.0, 1.4); fill.intensity = t > 58.9 ? 6 : 3;
    CAM.apply(CAM.track(t, [[47.5, A0], [52.4, A1, 4.9], [53.3, B0, 0.7], [55.3, B1, 2.0], [55.9, C0, 0.6], [60.1, C1, 4.2]]));
  };
});

// ---------------------------------------------------------------- 8. teste de integridade (60.1 – 69.0)
// "Em 2022, seiscentas e quarenta e uma urnas sorteadas foram testadas com votos de papel,
//  no dia da eleição: nenhuma divergência."
addScene("integridade", 60.1, 69.0, (S) => {
  const globe = makeGlobe(); globe.group.position.set(-3.6, 0, -1.0); S.add(globe.group);
  const urns = [0, 1, 2].map((i) => { const u = makeUrna(); u.group.scale.setScalar(0.8); u.group.position.set(-1.0 + i * 1.45, 0, 0.1); S.add(u.group); return u; });
  const cam = makeTripodCam(); cam.group.position.set(-2.3, 0, 1.05); cam.group.rotation.y = -0.6; S.add(cam.group);
  const pile = new THREE.Group(); pile.position.set(2.95, 0, 0.8); S.add(pile);
  for (let i = 0; i < 10; i++) { const c = makeCedula(1.3); c.position.y = i * 0.013; c.rotation.y = (i % 3 - 1) * 0.06; pile.add(c); }
  const board = new THREE.Group(); board.position.set(0.55, 0, -1.2); S.add(board);
  const bp = new THREE.Mesh(rbox(3.2, 1.1, 0.14, 0.04), mat("#1d1d1d")); bp.position.y = 2.0; board.add(bp);
  const legs = [-1.3, 1.3].map((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), mat("#2a2a2a")); l.position.set(x, 0.75, 0); board.add(l); return l; });
  const pA = makePlate("URNA", 1.2, 0.42, { bg: "#2c6fbf", fg: "#ffffff" }); pA.position.set(-0.85, 2.0, 0.075); board.add(pA);
  const pEq = makePlate("=", 0.42, 0.42, { bg: null, fg: "#ffffff" }); pEq.position.set(0, 2.0, 0.075); board.add(pEq);
  const pB = makePlate("PAPEL", 1.2, 0.42, { bg: "#f4e8da", fg: "#141414" }); pB.position.set(0.85, 2.0, 0.075); board.add(pB);
  const okM = new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false, transparent: true, opacity: 0 });
  const okGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.2), okM); okGlow.position.set(0, 2.0, 0.069); okGlow.userData.decor = true; board.add(okGlow);
  S.hero(globe.group, "globo de sorteio", { when: (t) => t < 63.3 });
  urns.forEach((u, i) => S.hero(u.group, "urna sorteada " + (i + 1), { when: (t) => t > 64.0 && t < 66.6 }));
  S.hero(cam.group, "câmera filmando", { when: (t) => t > 65.0 && t < 66.6 });
  S.hero(board, "placar urna = papel", { when: (t) => t > 67.3 });
  urns.forEach((u, i) => S.solid(u.group, "urna " + (i + 1))); S.solid(globe.group, "globo"); S.solid(cam.group, "câmera"); S.solid(pile, "cédulas");
  const anim = (t) => {
    globe.ball.rotation.y = t * 2.4; globe.ball.rotation.x = 0.3 * Math.sin(t);
    urns.forEach((u, i) => { popIn(u.group, t, 63.47 + i * 0.15, 0.4, 0.8); u.screen(t > 67.75 ? "ok" : "voto"); });
    popIn(globe.group, t, 0, 0.3, 1, 63.8); popIn(cam.group, t, 64.45, 0.4, 1, 66.9); popIn(pile, t, 65.21, 0.4);
    popIn(board, t, 66.6, 0.45);
    okM.opacity = 0.5 * sm(t, 67.75, 68.2);
  };
  const shot = shotOf(anim);
  const A0 = shot([globe.group], 60.1, 63.3, { from: [-0.2, 0.3, 1], pull: 1.1 }), A1 = shot([globe.group], 60.1, 63.3, { from: [0.1, 0.3, 1], pull: 1.03 });
  const B0 = shot([...urns.map((u) => u.group), cam.group, pile], 63.5, 66.6, { from: [0.1, 0.55, 1], pull: 1.08 }), B1 = shot([...urns.map((u) => u.group), cam.group, pile], 63.5, 66.6, { from: [0.25, 0.5, 1], pull: 1.03 });
  const C0 = shot([board, ...urns.map((u) => u.group)], 66.6, 69.0, { from: [0, 0.25, 1], pull: 1.06 }), C1 = shot([board, ...urns.map((u) => u.group)], 66.6, 69.0, { from: [0.12, 0.22, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    cam.rec.visible = Math.sin(t * 6) > 0;
    fill.color.set(t > 67.75 ? GREEN : ORANGE); fill.position.set(0.5, 2.4, 1.4); fill.intensity = t > 67.75 ? 6 : 2.5;
    CAM.apply(CAM.track(t, [[60.1, A0], [63.0, A1, 2.9], [64.0, B0, 0.7], [66.4, B1, 2.4], [67.3, C0, 0.7], [69.0, C1, 1.7]]));
  };
});

// ---------------------------------------------------------------- 9. teste público com hackers (69.0 – 83.5)
// "E desde 2009 o TSE convida hackers pra atacar o sistema. Em 2012 e 2017, o professor Diego Aranha achou
//  falhas sérias no teste, e o TSE corrigiu. Mesmo assim, ele defende um comprovante impresso."
addScene("hackers", 69.0, 83.5, (S) => {
  const u = makeUrna(); S.add(u.group); u.screen("voto");
  const laps = [[-1.95, -0.65], [-0.72, -1.45], [0.72, -1.45], [1.95, -0.65]].map(([x, z], i) => { const l = makeLaptop(i + 3); l.group.position.set(x, 0, z); l.group.rotation.y = -x * 0.22; S.add(l.group); return l; });
  const alerts = [["FALHA 2012", -0.75], ["FALHA 2017", 0.75]].map(([txt, x]) => {
    const g = new THREE.Group(); g.position.set(x, 1.7, 0); S.add(g);
    const red = makePlate(txt, 1.3, 0.38, { bg: RED, fg: "#ffffff" }); g.add(red);
    const ok = makePlate(txt.replace("FALHA", "OK"), 1.3, 0.38, { bg: GREEN, fg: "#ffffff" }); ok.visible = false; g.add(ok);
    return { g, red, ok };
  });
  const pr = makePrinter(); pr.group.position.set(2.0, 0, 0.7); pr.group.rotation.y = -0.3; pr.group.scale.setScalar(1.2); S.add(pr.group);
  S.hero(u.group, "urna eletrônica", { when: (t) => t < 81.3 });
  laps.forEach((l, i) => S.hero(l.group, "notebook " + (i + 1), { when: (t) => t > 72.4 && t < 81.3 }));
  alerts.forEach((a, i) => S.hero(a.g, "alerta " + (i + 1), { when: (t) => t > 74.6 && t < 81.3 }));
  S.hero(pr.group, "impressora de comprovante", { when: (t) => t > 81.8 });
  S.solid(u.group, "urna"); laps.forEach((l, i) => S.solid(l.group, "notebook " + (i + 1))); S.solid(pr.group, "impressora");
  const anim = (t) => {
    laps.forEach((l, i) => popIn(l.group, t, 71.25 + i * 0.25, 0.4, 1, 81.5)); popIn(u.group, t, 0, 0.3, 1, 81.5);
    alerts.forEach((a, i) => { const at = i ? 74.24 : 73.75; popIn(a.g, t, at, 0.35, 1, 81.5); a.g.position.y = 1.7 + 0.05 * Math.sin(t * 3 + i); const fixed = t > 79.97 + i * 0.15; a.red.visible = !fixed; a.ok.visible = fixed; });
    popIn(pr.group, t, 81.6, 0.4, 1.2);
    pr.paper.set(sm(t, 82.3, 83.1));
  };
  const shot = shotOf(anim);
  const allL = laps.map((l) => l.group);
  const A0 = shot([u.group], 69.0, 71.1, { from: [0.1, 0.55, 1], pull: 1.1 });
  const B0 = shot([u.group, ...allL], 71.2, 73.5, { from: [0.2, 0.9, 1], pull: 1.08 });
  const C0 = shot([u.group, ...allL, ...alerts.map((a) => a.g)], 73.6, 81.3, { from: [-0.15, 0.35, 1], pull: 1.0 }), C1 = shot([u.group, ...allL, ...alerts.map((a) => a.g)], 73.6, 81.3, { from: [0.15, 0.3, 1], pull: 0.96 });
  const D0 = shot([pr.group], 81.4, 83.5, { from: [0.4, 0.45, 1], pull: 1.04 }), D1 = shot([pr.group], 81.4, 83.5, { from: [0.55, 0.45, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const red = t > 73.75 && t < 79.97, ok = t > 79.97;
    fill.color.set(ok ? GREEN : red ? RED : "#4fd17a"); fill.position.set(0, 2.4, 1.2); fill.intensity = red ? 3 + 2 * (Math.sin(t * 8) > 0 ? 1 : 0) : ok ? 5 : 2.5;
    CAM.apply(CAM.track(t, [[69.0, A0], [71.6, B0, 1.0], [74.0, C0, 0.8], [81.0, C1, 7.0], [81.9, D0, 0.6], [83.5, D1, 1.6]]));
  };
});

// ---------------------------------------------------------------- 10. Forças Armadas, 2022 (83.5 – 91.3)
// "As Forças Armadas, em 2022, não acharam fraude, mas disseram que não dá pra garantir que não exista código malicioso."
addScene("forcas", 83.5, 91.3, (S) => {
  const desk = makeTable(3.4, 1.8, 0.8); S.add(desk.group);
  const mon = makeMonitor(1.6, 0.95, (x, w, h) => { x.fillStyle = "#0d1410"; x.fillRect(0, 0, w, h); const r = mulberry32(21); for (let i = 0; i < 13; i++) { x.fillStyle = i === 7 ? ORANGE : "#4fd17a"; x.fillRect(20 + (i % 4) * 22, 16 + i * 23, 90 + r() * 280, 10); } });
  mon.group.position.set(0.55, desk.top, -0.45); S.add(mon.group);
  const rep = makeSheet(1.2, 1.5, (x, w, h) => { x.fillStyle = PAPER; x.fillRect(0, 0, w, h); centerText(x, "RELATÓRIO", w / 2, 70, "900 60px Inter", "#141414"); centerText(x, "DEFESA · 2022", w / 2, 135, "800 40px Inter", "#3a3330"); x.fillStyle = "#b9b2a8"; for (let i = 0; i < 8; i++) x.fillRect(40, 200 + i * 48, i % 3 === 2 ? 260 : 420, 14); });
  rep.mesh.position.set(-0.85, desk.top, 0.2); rep.mesh.rotation.y = 0.1; S.add(rep.mesh);
  const mag = makeMagnifier(); S.add(mag);
  const stamp = makeStamp({ ink: GREEN }); S.add(stamp);
  const imprint = makePlate("SEM FRAUDE", 1.0, 0.3, { bg: GREEN, fg: "#ffffff" }); imprint.rotation.set(-Math.PI / 2, 0, 0.1); imprint.position.set(-0.85, desk.top + 0.016, 0.35); S.add(imprint);
  const q = makePlate("?", 0.42, 0.52, { bg: ORANGE, fg: "#ffffff" }); q.position.set(1.55, desk.top + 1.35, -0.4); S.add(q);
  S.hero(mon.group, "monitor com código"); S.hero(rep.mesh, "relatório", { when: (t) => t > 85.7 }); S.hero(mag, "lupa", { when: (t) => t < 85.8 });
  S.hero(q, "ponto de interrogação", { when: (t) => t > 89.7 });
  S.solid(desk.group, "mesa"); S.solid(mon.group, "monitor", { restsOn: ["mesa"] }); S.solid(rep.mesh, "relatório", { restsOn: ["mesa"] });
  S.solid(stamp, "carimbo", { restsOn: ["relatório"], when: (t) => t > 86 });
  const anim = (t) => {
    const sw = lin(t, 83.6, 86.0);
    mag.position.set(0.55 + 0.55 * Math.sin(sw * Math.PI * 2), desk.top + mon.screenY + 0.1 * Math.cos(sw * Math.PI * 3), 0.0);
    mag.visible = t < 86.2;
    const down = eOut(lin(t, 86.35, 86.63)), up = sm(t, 87.1, 87.8);
    stamp.visible = t > 86.2 && t < 87.85;
    stamp.position.set(-0.85, desk.top + 0.016 + 1.3 * (1 - down) + 1.3 * up, 0.35);
    imprint.visible = t >= 86.63;
    popIn(q, t, 89.3, 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([mon.group, mag, rep.mesh], 83.5, 86.0, { from: [0.1, 0.35, 1], pull: 1.04 }), A1 = shot([mon.group, mag, rep.mesh], 83.5, 86.0, { from: [-0.05, 0.35, 1], pull: 1.0 });
  const B0 = shot([mon.group, rep.mesh, stamp, q], 86.0, 91.3, { from: [-0.2, 0.75, 1], pull: 1.06 }), B1 = shot([mon.group, rep.mesh, stamp, q], 86.0, 91.3, { from: [0.1, 0.7, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    const hit = t > 86.63 ? 1 - lin(t, 86.63, 87.6) : 0;
    fill.color.set(t > 89.3 ? ORANGE : GREEN); fill.position.set(0, 2.2, 1.4); fill.intensity = 2.5 + 5 * hit + (t > 89.3 ? 2 : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[83.5, A0], [85.6, A1, 2.1], [86.4, B0, 0.8], [91.3, B1, 4.9]]), t, 86.63, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 11. voto impresso barrado (91.3 – 96.9)
// "O voto impresso foi barrado pelo Supremo, por risco ao sigilo, e pela Câmara, em 2021."
addScene("impresso", 91.3, 96.9, (S) => {
  const pr = makePrinter(); pr.group.position.set(-1.0, 0, 0.2); S.add(pr.group);
  const block = new THREE.Group(); block.position.set(0.7, 0, 0.3); S.add(block);
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.26, 32), mat("#5a3a26", { roughness: 0.6 })); bb.position.y = 0.11; block.add(bb);
  const bb2 = bb; bb2.position.y = 0.13; const bl = makePlate("STF · 2020", 1.1, 0.26, { bg: "#141414", fg: "#ffffff" }); bl.position.set(0, 0.13, 0.7); block.add(bl);
  block.add(contactShadow(1.4, 1.4));
  const gavel = makeGavel(); S.add(gavel);
  const board = new THREE.Group(); board.position.set(2.15, 0, -0.4); S.add(board);
  const bp = new THREE.Mesh(rbox(1.9, 1.5, 0.12, 0.04), mat("#1d1d1d")); bp.position.y = 1.55; board.add(bp);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), mat("#2a2a2a")); stand.position.y = 0.42; board.add(stand);
  board.add(contactShadow(1.6, 1));
  const rows = [["CÂMARA 2021", "#3a3330"], ["SIM 229 · NÃO 218", "#2c6fbf"], ["PRECISAVA 308", RED]].map(([t, bg], i) => { const p = makePlate(t, 1.7, 0.36, { bg, fg: "#ffffff" }); p.position.set(0, 2.0 - i * 0.45, 0.07); board.add(p); return p; });
  S.hero(pr.group, "impressora de comprovante", { when: (t) => t < 92.3 });
  S.hero(block, "base do martelo", { when: (t) => t > 92.9 && t < 95.1 }); S.hero(gavel, "martelo", { when: (t) => t > 92.9 && t < 95.1 });
  S.hero(board, "placar da Câmara", { when: (t) => t > 95.7 });
  S.solid(pr.group, "impressora"); S.solid(block, "base"); S.solid(board, "placar");
  const anim = (t) => {
    pr.paper.set(0.9); popIn(pr.group, t, 91.0, 0.3, 1.25, 93.0);
    const lift = 1 - eOut(lin(t, 92.8, 93.08)) + sm(t, 93.4, 94.0) * 0.6;
    gavel.position.set(0.55, 0.26 + 0.17 + 0.5 * lift, 0.15); gavel.rotation.set(0, -Math.PI / 2 + 0.35, 0.5 * lift);
    popIn(gavel, t, 92.3, 0.35); popIn(block, t, 92.3, 0.35);
    popIn(board, t, 95.1, 0.4);
    rows.forEach((p, i) => { p.visible = t > 95.3 + i * 0.2; });
  };
  const shot = shotOf(anim);
  const A0 = shot([pr.group], 91.3, 92.8, { from: [-0.2, 0.45, 1], pull: 1.1 });
  const B0 = shot([block, gavel], 92.3, 95.0, { from: [0, 0.45, 1], pull: 0.93 });
  const C0 = shot([board, block], 95.1, 96.9, { from: [0.15, 0.25, 1], pull: 1.06 }), C1 = shot([board, block], 95.1, 96.9, { from: [0.25, 0.25, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    const hit = t > 93.08 ? 1 - lin(t, 93.08, 94.0) : 0;
    fill.color.set(RED); fill.position.set(0.6, 2.0, 1.4); fill.intensity = 2 + 6 * hit;
    CAM.apply(CAM.shake(CAM.track(t, [[91.3, A0], [93.0, B0, 0.7], [95.4, C0, 0.6], [96.9, C1, 1.5]]), t, 93.08, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 12. a escolha (96.9 – 104.8)
// "Então me diz: pra você, a urna já está segura... ou ainda precisa do voto impresso?"
addScene("escolha", 96.9, 104.8, (S) => {
  const u = makeUrna(); u.group.position.set(-1.15, 0, 0); S.add(u.group); u.screen("lock");
  const pr = makePrinter(); pr.group.position.set(1.2, 0, 0); pr.group.scale.setScalar(1.35); S.add(pr.group);
  const aTop = sprite(chipTex("SEGURA", { bg: GREEN, font: "900 120px Inter", h: 180 }), 1.7); aTop.position.set(-1.15, 1.45, 0); S.add(aTop);
  const bTop = sprite(chipTex("IMPRESSO", { bg: ORANGE, font: "900 120px Inter", h: 180 }), 1.9); bTop.position.set(1.2, 2.1, 0); S.add(bTop);
  const lA = new THREE.PointLight(GREEN, 0, 6, 1.5); lA.position.set(-1.3, 1.6, 1.2); S.add(lA);
  const lB = new THREE.PointLight(ORANGE, 0, 6, 1.5); lB.position.set(1.4, 1.6, 1.2); S.add(lB);
  S.hero(u.group, "urna eletrônica"); S.hero(pr.group, "impressora");
  S.label(aTop, "SEGURA", { on: "urna eletrônica" }); S.label(bTop, "IMPRESSO", { on: "impressora" });
  S.solid(u.group, "urna"); S.solid(pr.group, "impressora");
  const TA = 99.89, TB = 102.01;
  const anim = (t) => {
    pr.paper.set(0.4 + 0.3 * sm(t, TB, TB + 0.6));
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 97.1, 0.4)) * (1 + 0.12 * (t > TA && t < TA + 0.5 ? 1 : 0)));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 97.3, 0.4)) * (1 + 0.12 * (t > TB && t < TB + 0.5 ? 1 : 0)));
  };
  const box = envelope([u.group, pr.group, aTop, bTop], anim, 96.9, 104.8);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.45, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.06, 0.4, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const late = t > 103.0 ? 0.5 + 0.5 * Math.sin((t - 103.0) * 4) : 0;
    const ea = Math.max(t > TA && t < TB ? 1 : 0, late), eb = Math.max(t > TB ? 1 - (t > 103 ? late : 0) : 0, 0);
    lA.intensity = ea * 7; lB.intensity = eb * 7;
    CAM.apply(CAM.blend(P0, P1, sm(t, 96.9, 104.8)));
  };
});
