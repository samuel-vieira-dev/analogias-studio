// ============================================================================
// videos/2026-10-30-trajetoria-bolsonaro/scenes.js
// 3D scenes synced to audio/words.json (narration 0–108.0 s, video 110.0 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every shot of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery: generic magazine (no masthead of a real title), generic ballot boxes, no party
// symbols. The stabbing is a calendar date with a red slash (no wound, no knife). Photos: card of the
// captain (16.3–19.0) covers the stage, so no hero is registered behind it; the deputy, president and
// STF photos sit in 3D frames with their credit on screen.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const PAPER = "#fbf7ef", BEIGE = "#e7dfd0", GOLD = "#c9a45a", OLIVE = "#73854a", BLUE = "#2f6bbf", GREY = "#8d847c", MAROON = "#7a1f2b";

// Canvas texture painted by a function (w x h px). API { tex, ctx, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, ctx: x, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Thin rod (cylinder) between two local points a and b.
function rod(a, b, r, m) {
  const d = b.clone().sub(a), L = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), m);
  mesh.position.copy(a).addScaledVector(d, 0.5); mesh.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize());
  return mesh;
}
// Shared shot helper per scene.
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.08 }, o));
// Parabolic hop from a to b (V3s) with height hgt, k 0..1.
const hop = (a, b, k, hgt = 0.8) => a.clone().lerp(b, k).add(new V3(0, 4 * hgt * k * (1 - k), 0));

// Generic electronic voting machine (same shape as the 2026-10-29/30 videos): wedge body, sloped top
// with a screen (left) and keypad (right). Origin: floor, centre; front +z (the low side).
// API { group, screen(painter) }
function paintKeypad(x, w, h) {
  x.fillStyle = "#262626"; x.fillRect(0, 0, w, h);
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
  const kw = 96, kh = 68, gx = (w - 3 * kw) / 4;
  keys.forEach((k, i) => { if (!k) return; const c = i % 3, r = Math.floor(i / 3), px = gx + c * (kw + gx), py = 24 + r * (kh + 18); x.fillStyle = "#111"; roundRect(x, px, py, kw, kh, 12); x.fill(); centerText(x, k, px + kw / 2, py + kh / 2 + 3, "800 46px Inter", "#ffffff"); });
  [["BRANCO", "#f4f4f4", "#141414"], ["CORRIGE", ORANGE, "#141414"], ["CONFIRMA", GREEN, "#ffffff"]].forEach(([t, bg, fg], i) => { const bw = (w - 4 * 12) / 3, px = 12 + i * (bw + 12), py = h - 92; x.fillStyle = bg; roundRect(x, px, py, bw, 74, 12); x.fill(); centerText(x, t, px + bw / 2, py + 40, "800 26px Inter", fg); });
}
function makeUrna() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.55, 0); s.lineTo(0.55, 0); s.lineTo(0.55, 0.62); s.lineTo(-0.55, 0.3); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  geo.translate(0, 0, -0.8); geo.rotateY(Math.PI / 2);
  const body = new THREE.Mesh(geo, mat(BEIGE, { roughness: 0.6 })); body.position.y = 0.02; g.add(body);
  const theta = Math.atan2(0.32, 1.1);
  const top = new THREE.Group(); top.position.set(0, 0.48 + 0.025, 0); top.rotation.x = theta; g.add(top);
  const bezel = new THREE.Mesh(rbox(0.8, 0.03, 0.6, 0.01), mat("#3a3a3a")); bezel.position.set(-0.36, 0.0, -0.02); top.add(bezel);
  const scr = canvasTex(512, 356, (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); });
  const screenM = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.5), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
  screenM.rotation.x = -Math.PI / 2; screenM.position.set(-0.36, 0.017, -0.02); top.add(screenM);
  const kp = canvasTex(400, 440, paintKeypad);
  const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.62), new THREE.MeshStandardMaterial({ map: kp.tex, roughness: 0.6 }));
  keypad.rotation.x = -Math.PI / 2; keypad.position.set(0.42, 0.004, 0.0); top.add(keypad);
  g.add(contactShadow(2.4, 1.8));
  return { group: g, screen: (p) => scr.paint(p) };
}
// Voter card (título de eleitor) lying flat, header printed on top; a red SUSPENSO print shows when
// stamped. Origin: bottom centre; the face is up (+y). API { group, print, top }
function makeVoterCard({ w = 2.1, d = 1.3 } = {}) {
  const g = new THREE.Group();
  const face = canvasTex(512, 324, (x, W, H) => {
    x.fillStyle = "#e9efe4"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#2f6a4a"; x.fillRect(0, 0, W, 18); x.fillRect(0, H - 18, W, 18);
    x.fillStyle = "#b9c7b5"; for (let i = 0; i < 4; i++) x.fillRect(40, 150 + i * 36, 300 + (i % 2) * 90, 12);
    x.strokeStyle = "#9aa999"; x.lineWidth = 4; x.strokeRect(380, 140, 100, 130);
  });
  const side = mat("#e9efe4", { roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), [side, side, new THREE.MeshStandardMaterial({ map: face.tex, roughness: 0.85 }), side, side, side]);
  body.position.y = 0.015; g.add(body);
  const head = makePlate("TÍTULO DE ELEITOR", w * 0.9, d * 0.24, { bg: "#2f6a4a", fg: "#ffffff" });
  head.rotation.x = -Math.PI / 2; head.position.set(0, 0.03 + 0.016, d * 0.3); g.add(head);
  const print = makePlate("SUSPENSO", w * 0.62, d * 0.26, { bg: null, fg: RED, font: "900 160px Inter", depth: 0.004 });
  print.rotation.set(-Math.PI / 2, 0, 0.1); print.position.set(0.05, 0.03 + 0.017, -d * 0.17); print.visible = false; g.add(print);
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, print, top: 0.03 };
}
// Year post: post with the year printed on a sign on top, and a caption plate on the base.
// Origin: floor. API { group, light(on, col) }
function makeYearPost(year, caption, { color = "#3a3330" } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.9, 0.46, 0.7, 0.05), mat("#2a1b12", { roughness: 0.6 })); base.position.y = 0.23; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); post.position.y = 0.46 + 0.45; g.add(post);
  const signM = mat(color, { roughness: 0.5 });
  const board = new THREE.Mesh(rbox(1.4, 0.62, 0.1, 0.04), signM); board.position.y = 1.36 + 0.31; g.add(board);
  const sign = makePlate(year, 1.26, 0.5, { bg: null, fg: "#ffffff" }); sign.position.set(0, 1.67, 0.052); g.add(sign);
  if (caption) { const cap = makePlate(caption, 1.78, 0.38, { bg: "#141414", fg: "#ffffff" }); cap.position.set(0, 0.23, 0.366); g.add(cap); }
  g.add(contactShadow(2, 1.2));
  return { group: g, light: (on, col = ORANGE) => { signM.color.set(on ? col : color); signM.emissive = new THREE.Color(on ? col : "#000000"); signM.emissiveIntensity = on ? 0.35 : 0; } };
}
// Toy paratrooper: a pawn in olive with a striped canopy and six lines. Origin: the pawn's feet.
// API { group, person, canopy } — canopy.scale collapses it after landing.
function makeParatrooper() {
  const g = new THREE.Group();
  const person = makePerson(OLIVE); g.add(person);
  const beret = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 10), mat(MAROON, { roughness: 0.7 })); beret.scale.set(1.15, 0.45, 1.15); beret.position.set(0.02, 0.83, 0); person.add(beret);
  const canopy = new THREE.Group(); canopy.position.y = 1.3; g.add(canopy);
  const R = 0.62, th = 1.05;
  const tex = canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? CREAM : ORANGE; x.fillRect(i * w / 8, 0, w / 8 + 1, h); } });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 12, 0, Math.PI * 2, 0, th), new THREE.MeshStandardMaterial({ map: tex.tex, roughness: 0.7, side: THREE.DoubleSide }));
  dome.position.y = -R * Math.cos(th); canopy.add(dome);
  const lm = mat("#d8d0c4", { roughness: 0.8 }), rimR = R * Math.sin(th);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; canopy.add(rod(new V3(Math.cos(a) * rimR, 0, Math.sin(a) * rimR), new V3(Math.cos(a) * 0.1, 0.55 - 1.3, Math.sin(a) * 0.1), 0.008, lm)); }
  return { group: g, person, canopy };
}
// Generic magazine standing on a small easel: red band with "REVISTA" and a date, the article title
// printed on two plates. Origin: floor. API { group, mag }
function makeMagazine(lines, date) {
  const g = new THREE.Group();
  const wood = mat("#4a2f1e", { roughness: 0.7 });
  const ledge = new THREE.Mesh(rbox(1.7, 0.08, 0.36, 0.02), wood); ledge.position.set(0, 0.42, 0.14); g.add(ledge);
  for (const x of [-0.6, 0.6]) { const leg = new THREE.Mesh(rbox(0.08, 0.46, 0.08, 0.02), wood); leg.position.set(x, 0.21, 0.14); g.add(leg); }
  const back = new THREE.Mesh(rbox(0.08, 2.3, 0.08, 0.02), wood); back.position.set(0, 1.1, -0.42); back.rotation.x = -0.24; g.add(back);
  const mag = new THREE.Group(); mag.position.set(0, 0.46, 0.06); mag.rotation.x = -0.18; g.add(mag);
  const W = 1.5, H = 2.0;
  const cover = canvasTex(384, 512, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
    x.fillStyle = "#c62d22"; x.fillRect(0, 0, w, 92); centerText(x, "REVISTA", w / 2, 50, "900 58px Inter", "#ffffff");
    centerText(x, date, w / 2, 122, "800 26px Inter", "#3a3330");
    x.fillStyle = "#d9cfc0"; for (let i = 0; i < 6; i++) x.fillRect(40, 360 + i * 22, w - 80 - (i % 3) * 40, 9);
  });
  const side = mat(PAPER, { roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.05), [side, side, side, side, new THREE.MeshStandardMaterial({ map: cover.tex, roughness: 0.85 }), side]);
  body.position.y = H / 2; mag.add(body);
  lines.forEach((ln, i) => { const p = makePlate(ln, W * 0.88, 0.3, { bg: PAPER, fg: "#141414" }); p.position.set(0, H - 0.66 - i * 0.34, 0.04); mag.add(p); });
  g.add(contactShadow(2.2, 1.2));
  return { group: g, mag };
}
// Jail cell front: two posts, a beam with a printed plate, and a barred door hinged on the left post.
// Origin: floor, centre of the opening; the bars are in the plane z = 0. API { group, door, setClosed(k) }
function makeCellDoor(label = "15 DIAS", { w = 1.5, h = 2.1 } = {}) {
  const g = new THREE.Group(), iron = mat("#3b3f44", { metalness: 0.7, roughness: 0.35 });
  for (const x of [-w / 2 - 0.08, w / 2 + 0.08]) { const p = new THREE.Mesh(rbox(0.16, h + 0.2, 0.2, 0.03), iron); p.position.set(x, (h + 0.2) / 2, 0); g.add(p); }
  const beam = new THREE.Mesh(rbox(w + 0.5, 0.42, 0.24, 0.04), mat("#2a2d31", { metalness: 0.5, roughness: 0.4 })); beam.position.set(0, h + 0.38, 0); g.add(beam);
  const pl = makePlate(label, w * 0.9, 0.32, { bg: RED, fg: "#ffffff" }); pl.position.set(0, h + 0.38, 0.13); g.add(pl);
  const door = new THREE.Group(); door.position.set(-w / 2, 0, 0.02); g.add(door);
  const n = 7;
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h - 0.06, 10), iron); b.position.set(0.08 + (i * (w - 0.16)) / (n - 1), h / 2, 0); door.add(b); }
  for (const y of [0.12, h * 0.55, h - 0.08]) { const r = new THREE.Mesh(rbox(w, 0.08, 0.06, 0.02), iron); r.position.set(w / 2, y, 0); door.add(r); }
  g.add(contactShadow(w + 1, 1.0));
  const setClosed = (k) => { door.rotation.y = -1.45 * (1 - k); };
  setClosed(0);
  return { group: g, door, setClosed };
}
// Flat folder with a label printed on top. Origin: bottom centre. API { group, top }
function makeFlatFolder(label, { w = 1.5, d = 1.1, color = "#e8c27a" } = {}) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, 0.08, d, 0.02), m); body.position.y = 0.04; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.34, 0.08, 0.14, 0.02), m); tab.position.set(-w * 0.26, 0.04, -d / 2 - 0.06); g.add(tab);
  if (label) { const p = makePlate(label, w * 0.8, d * 0.26, { bg: "#141414", fg: "#ffffff" }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.081 + 0.015, -d * 0.2); g.add(p); }
  return { group: g, top: 0.08 };
}
// Low desk slab. Origin: floor. API { group, top }
// Desk: top slab, front apron (where a name can be printed) and four legs. Origin: floor.
// API { group, top, apron(text) }
function makeDesk(w = 3.0, d = 2.0, h = 0.8) {
  const g = new THREE.Group(), wood = mat("#5a3a26", { roughness: 0.7 }), dark = mat("#3e2819", { roughness: 0.7 });
  const top = new THREE.Mesh(rbox(w, 0.08, d, 0.02), wood); top.position.y = h - 0.04; g.add(top);
  const ap = new THREE.Mesh(rbox(w - 0.16, 0.34, 0.05, 0.02), dark); ap.position.set(0, h - 0.08 - 0.17, d / 2 - 0.08); g.add(ap);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(rbox(0.1, h - 0.08, 0.1, 0.02), dark); l.position.set(x * (w / 2 - 0.12), (h - 0.08) / 2, z * (d / 2 - 0.12)); g.add(l); }
  g.add(contactShadow(w + 0.8, d + 0.8));
  const apron = (text) => { const p = makePlate(text, (w - 0.3) * 0.8, 0.26, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h - 0.25, d / 2 - 0.08 + 0.026 + 0.016); g.add(p); return p; };
  return { group: g, top: h, apron };
}
// Uniform on a valet stand: pole on a round foot, shoulders bar, olive jacket with sleeves, buttons and
// a maroon beret on the knob. Origin: floor.
function makeUniformStand() {
  const g = new THREE.Group(), wood = mat("#4a2f1e", { roughness: 0.6 }), cloth = mat(OLIVE, { roughness: 0.85 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.08, 28), wood); foot.position.y = 0.04; g.add(foot);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.3, 12), wood); pole.position.set(0, 1.19, -0.24); g.add(pole);
  foot.position.z = -0.24;
  const arm = new THREE.Mesh(rbox(0.06, 0.06, 0.26, 0.02), wood); arm.position.set(0, 2.14, -0.12); g.add(arm);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI * 1.4), mat("#b8bcc0", { metalness: 0.7, roughness: 0.3 })); hook.position.set(0, 2.1, 0); hook.rotation.y = Math.PI / 2; g.add(hook);
  const hanger = new THREE.Mesh(rbox(1.0, 0.05, 0.05, 0.02), wood); hanger.position.set(0, 2.03, 0); g.add(hanger);
  const torso = new THREE.Mesh(rbox(0.86, 1.05, 0.3, 0.1), cloth); torso.position.y = 1.5; g.add(torso);
  for (const sx of [-1, 1]) { const sl = new THREE.Mesh(rbox(0.2, 0.9, 0.24, 0.08), cloth); sl.position.set(sx * 0.52, 1.52, 0); sl.rotation.z = sx * 0.05; g.add(sl); }
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); b.position.set(0, 1.85 - i * 0.22, 0.155); g.add(b); }
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(rbox(0.22, 0.14, 0.04, 0.02), cloth); p.position.set(sx * 0.22, 1.66, 0.16); g.add(p); }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), wood); knob.position.set(0, 2.36, -0.24); g.add(knob);
  const beret = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 12), mat(MAROON, { roughness: 0.7 })); beret.scale.set(1.15, 0.42, 1.15); beret.position.set(0.04, 2.4, -0.24); g.add(beret);
  g.add(contactShadow(1.4, 1.4));
  return g;
}
// Microphone stand (plenary style): heavy foot, pole, gooseneck and mic head. Origin: floor.
function makeMicStand() {
  const g = new THREE.Group(), dark = mat("#2b2b2b", { metalness: 0.5, roughness: 0.35 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.06, 28), dark); foot.position.y = 0.03; g.add(foot);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 12), dark); pole.position.y = 0.69; g.add(pole);
  const curve = new THREE.QuadraticBezierCurve3(new V3(0, 1.34, 0), new V3(0, 1.62, 0.02), new V3(0, 1.7, 0.3));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.022, 8, false), dark));
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.12, 6, 12), mat("#141414", { roughness: 0.6 })); head.position.set(0, 1.72, 0.36); head.rotation.x = Math.PI / 2 - 0.3; g.add(head);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 8, 20), mat(RED, { emissive: RED, emissiveIntensity: 0.8 })); ring.position.set(0, 1.71, 0.3); ring.rotation.x = Math.PI / 2 - 0.3; g.add(ring);
  g.add(contactShadow(0.9, 0.9));
  return g;
}
// Hemicycle of seats (instanced), opening toward +z. Origin: floor, centre. API { group, n, setColor(i, c) }
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
  const rOut = radii[rows - 1] + 0.3;
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(rOut, rOut, 0.08, 48, 1, false, Math.PI / 2, Math.PI), mat(base, { roughness: 0.8 })); slab.position.y = 0.04; g.add(slab);
  g.add(contactShadow(rOut * 2.4, rOut * 1.6));
  const c = new THREE.Color();
  return { group: g, n: pos.length, setColor: (i, col) => { im.setColorAt(i, c.set(col)); im.instanceColor.needsUpdate = true; } };
}
// Upright board on two feet with a printed plate; light(on) makes the board glow. Origin: floor.
function makeVoteBoard(text, { w = 1.5, h = 1.0, on = GREEN } = {}) {
  const g = new THREE.Group(), bm = mat("#1d1d22", { roughness: 0.6 });
  const board = new THREE.Mesh(rbox(w, h, 0.14, 0.05), bm); board.position.y = 0.3 + h / 2; g.add(board);
  for (const x of [-w * 0.35, w * 0.35]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), mat("#2a2a2a")); l.position.set(x, 0.15, 0); g.add(l); }
  const pm = makePlate(text, w * 0.8, h * 0.56, { bg: "#2a2a30", fg: "#ffffff" }); pm.position.set(0, 0.3 + h / 2, 0.071); g.add(pm);
  g.add(contactShadow(w + 0.6, 0.8));
  return { group: g, light: (k) => { bm.emissive = new THREE.Color(on); bm.emissiveIntensity = 0.45 * k; } };
}
// Desk calendar page standing on a dark board: "DIA" big, month/year band; a red slash can cross it.
// Origin: floor. API { group, slash }
function makeCalendarStand(day, monthYear) {
  const g = new THREE.Group(), lean = 0.18, H = 1.9, W = 1.6;
  const front = new THREE.Group(); front.rotation.x = -lean; g.add(front);
  const board = new THREE.Mesh(rbox(W, H, 0.06, 0.03), mat("#3a2a20")); board.position.y = H / 2; front.add(board);
  const back = new THREE.Mesh(rbox(0.1, H * 0.62, 0.06, 0.02), mat("#3a2a20")); back.position.set(0, H * 0.31 * Math.cos(lean), -0.55); back.rotation.x = lean; g.add(back);
  const page = canvasTex(400, 470, (x, w, h) => { x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = RED; x.fillRect(0, 0, w, 120); centerText(x, monthYear, w / 2, 64, "900 62px Inter", "#ffffff"); centerText(x, day, w / 2, 300, "900 260px Inter", "#141414"); });
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.9, H * 0.88), new THREE.MeshStandardMaterial({ map: page.tex, roughness: 0.9 })); pm.position.set(0, H / 2 - 0.02, 0.032); front.add(pm);
  for (const sx of [-0.45, 0.45]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 20), mat("#cfcfcf", { metalness: 0.8, roughness: 0.3 })); ring.rotation.y = Math.PI / 2; ring.position.set(sx, H - 0.06, 0.05); front.add(ring); }
  const slash = new THREE.Mesh(rbox(W * 1.05, 0.12, 0.03, 0.03), mat(RED, { emissive: RED, emissiveIntensity: 0.6 })); slash.position.set(0, H * 0.42, 0.06); slash.rotation.z = 0.62; front.add(slash);
  g.add(contactShadow(W + 0.8, 1.4));
  return { group: g, slash };
}
// Public building: steps, six columns, architrave with the name printed big, pediment. Origin: floor
// centre, front +z.
function makeTemple(label, { w = 2.6 } = {}) {
  const g = new THREE.Group(), stone = mat("#e6e0d4", { roughness: 0.55 }), shade = mat("#cfc8ba", { roughness: 0.55 });
  const s1 = new THREE.Mesh(rbox(w + 0.4, 0.14, 1.6, 0.03), shade); s1.position.y = 0.07; g.add(s1);
  const s2 = new THREE.Mesh(rbox(w + 0.2, 0.14, 1.4, 0.03), stone); s2.position.y = 0.21; g.add(s2);
  const colH = 1.2, n = 6;
  for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, colH, 16), stone); c.position.set(-w / 2 + 0.2 + (i * (w - 0.4)) / (n - 1), 0.28 + colH / 2, 0.45); g.add(c); }
  const core = new THREE.Mesh(rbox(w - 0.3, colH, 0.6, 0.02), shade); core.position.set(0, 0.28 + colH / 2, -0.2); g.add(core);
  const arch = new THREE.Mesh(rbox(w + 0.1, 0.54, 1.25, 0.03), stone); arch.position.set(0, 0.28 + colH + 0.27, 0.05); g.add(arch);
  const pl = makePlate(label, w * 0.96, 0.44, { bg: "#3a3330", fg: "#ffffff" }); pl.position.set(0, 0.28 + colH + 0.27, 0.69); g.add(pl);
  const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.05, 0); tri.lineTo(w / 2 + 0.05, 0); tri.lineTo(0, 0.42); tri.closePath();
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 1.1, bevelEnabled: false }), stone); ped.position.set(0, 0.28 + colH + 0.54, -0.5); g.add(ped);
  g.add(contactShadow(w + 1.2, 2.0));
  return g;
}
// Book standing upright (slightly leaning back on its own foot), title and year printed on the cover.
// Origin: floor centre; cover faces +z. API { group }
function makeStandingBook(title, year, { w = 1.3, h = 1.7, t = 0.55, color = "#1f3d5e" } = {}) {
  const g = new THREE.Group(), lean = new THREE.Group(); lean.rotation.x = -0.1; lean.position.z = 0.05; g.add(lean);
  const board = mat(color, { roughness: 0.6 });
  const pages = new THREE.Mesh(rbox(w - 0.08, h - 0.1, t - 0.08, 0.01), mat("#f1e8d6", { roughness: 0.9 })); pages.position.set(0.05, h / 2, 0); lean.add(pages);
  for (let i = 1; i < 6; i++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(0.004, h - 0.14, 0.004), mat("#cdbfa6")); ln.position.set(w / 2 - 0.035 + 0.002, h / 2, -t / 2 + 0.04 + (i * (t - 0.08)) / 6); lean.add(ln); }
  const ribbon = new THREE.Mesh(rbox(0.06, 0.4, 0.01, 0.005), mat(RED)); ribbon.position.set(w * 0.2, h + 0.1, 0.02); lean.add(ribbon);
  for (const z of [-t / 2 + 0.02, t / 2 - 0.02]) { const c = new THREE.Mesh(rbox(w, h, 0.04, 0.02), board); c.position.set(0.0, h / 2, z); lean.add(c); }
  const spine = new THREE.Mesh(rbox(0.1, h, t, 0.04), board); spine.position.set(-w / 2 + 0.05, h / 2, 0); lean.add(spine);
  const tp = makePlate(title, w * 0.94, 0.4, { bg: color, fg: "#f5d36b" }); tp.position.set(0.04, h * 0.68, t / 2 + 0.016); lean.add(tp);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 32), mat("#f5d36b", { metalness: 0.7, roughness: 0.3 })); ring.position.set(0.04, h * 0.32, t / 2 + 0.02); lean.add(ring);
  g.add(contactShadow(w + 0.6, t + 0.8));
  return { group: g };
}
// Benefit card (generic, no bank logo), standing on a small stand, with two printed lines. Origin: floor.
function makeBenefitCard() {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(1.2, 0.16, 0.5, 0.04), mat("#3a2a20")); stand.position.y = 0.08; g.add(stand);
  const card = new THREE.Group(); card.position.set(0, 0.16, 0); card.rotation.x = -0.12; g.add(card);
  const W = 2.0, H = 1.26;
  const face = canvasTex(512, 322, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#2f9a63"); gr.addColorStop(1, "#1f6f47"); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = "#e8c35a"; roundRect(x, 40, 120, 70, 54, 8); x.fill(); x.fillStyle = "rgba(255,255,255,0.75)"; for (let i = 0; i < 4; i++) x.fillRect(40 + i * 110, 268, 80, 14); });
  const side = mat("#1f6f47");
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), [side, side, side, side, new THREE.MeshStandardMaterial({ map: face.tex, roughness: 0.4 }), side]); body.position.y = H / 2; card.add(body);
  const a = makePlate("AUXÍLIO", W * 0.66, 0.32, { bg: null, fg: "#ffffff", depth: 0.004 }); a.position.set(-0.12, H - 0.25, 0.03); card.add(a);
  const b = makePlate("R$ 600", W * 0.5, 0.34, { bg: null, fg: "#ffe9a8", depth: 0.004 }); b.position.set(0.36, 0.5, 0.03); card.add(b);
  g.add(contactShadow(2.4, 1.0));
  return g;
}
// makeHourColumn always shows its dark label once tall enough; this hides it while the text is blank.
function labelOf(col) { return col.group.children.find((m) => Array.isArray(m.material)); }
function setColumn(col, v, text) { col.setHours(v, text || " "); if (!text) labelOf(col).visible = false; }
// Low plinth with a printed name (sits in front of a column). Origin: floor.
function makePlinth(label, w = 1.9) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, 0.42, 0.5, 0.04), mat("#2a1b12", { roughness: 0.6 })); b.position.y = 0.21; g.add(b);
  const p = makePlate(label, w * 0.9, 0.3, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.21, 0.266); g.add(p);
  g.add(contactShadow(w + 0.6, 1.0)); return g;
}
// Stack of coins (cylinders) on a base with a printed name; setN(k) shows k coins. Origin: floor.
function makeCoinStack(label, color, n = 10) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.0, 0.36, 0.8, 0.04), mat("#2a1b12", { roughness: 0.6 })); base.position.y = 0.18; g.add(base);
  const p = makePlate(label, 0.96, 0.29, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.18, 0.416); g.add(p);
  const coins = []; const cm = [mat(color, { metalness: 0.5, roughness: 0.35 }), mat(color, { metalness: 0.4, roughness: 0.4 }), mat(color, { metalness: 0.4, roughness: 0.4 })];
  for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.09, 28), cm); c.position.set(0.02 * Math.sin(i * 2.3), 0.36 + 0.045 + i * 0.1, 0.02 * Math.cos(i * 1.7)); g.add(c); coins.push(c); }
  g.add(contactShadow(1.5, 1.2));
  return { group: g, setN: (k) => coins.forEach((c, i) => { c.visible = i < k; }) };
}
// Memorial: dark slab with a printed word and rows of small candles that light up one by one.
// Origin: floor. API { group, light(k) } — k 0..1 share of lit candles.
function makeMemorial(label, { cols = 10, rows = 4 } = {}) {
  const g = new THREE.Group();
  const slab = new THREE.Mesh(rbox(3.0, 0.32, 1.9, 0.04), mat("#4a4440", { roughness: 0.7 })); slab.position.y = 0.16; g.add(slab);
  const p = makePlate(label, 2.4, 0.26, { bg: "#141414", fg: "#d8d2c8" }); p.position.set(0, 0.16, 0.966); g.add(p);
  const n = cols * rows, wax = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.1, 0.13, 14).translate(0, 0.065, 0), mat("#f3ead8", { roughness: 0.8, emissive: "#ffb860", emissiveIntensity: 0.25 }), n);
  const o = new THREE.Object3D(), flames = [];
  const fm = new THREE.MeshBasicMaterial({ color: "#ffcf6b", toneMapped: false });
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols), x = -1.2 + (c * 2.4) / (cols - 1), z = -0.6 + (r * 1.2) / (rows - 1);
    o.position.set(x, 0.32, z); o.updateMatrix(); wax.setMatrixAt(i, o.matrix);
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), fm); f.scale.set(1, 1.8, 1); f.position.set(x, 0.32 + 0.21, z); f.userData.decor = true; g.add(f); flames.push(f);
  }
  g.add(wax); g.add(contactShadow(3.6, 2.4));
  const glow = new THREE.PointLight("#ffbf6b", 2.2, 5, 1.6); glow.position.set(0, 1.0, 0.4); g.add(glow);
  const order = flames.map((_, i) => i).sort((a, b) => ((a * 37) % n) - ((b * 37) % n));
  return { group: g, light: (k, t = 0) => { const m = Math.floor(clamp(k) * n); order.forEach((idx, j) => { const f = flames[idx]; f.visible = j < m; f.scale.y = 1.8 + 0.3 * Math.sin(t * 9 + idx); }); glow.intensity = 2.2 * clamp(k); } };
}
// Two-bar scoreboard. rows: [[label, color, pctText, height]]. Origin: floor. API { group, setK(k) }
function makeScoreboard(rows) {
  const g = new THREE.Group();
  const panel = new THREE.Mesh(rbox(2.8, 2.2, 0.2, 0.06), mat("#1d1d22", { roughness: 0.6 })); panel.position.y = 1.3; g.add(panel);
  for (const x of [-1.1, 1.1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.12), mat("#2a2a2a")); l.position.set(x, 0.15, 0); g.add(l); }
  const bars = [];
  rows.forEach(([lab, c, pct, hh], i) => {
    const x = i ? 0.62 : -0.62;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1, 0.1).translate(0, 0.5, 0), mat(c, { emissive: c, emissiveIntensity: 0.2 })); b.position.set(x, 0.62, 0.12); g.add(b); bars.push([b, hh]);
    const n = makePlate(lab, 1.1, 0.22, { bg: "#1d1d22", fg: "#ffffff" }); n.position.set(x, 0.46, 0.11); g.add(n);
    const p = makePlate(pct, 1.0, 0.3, { bg: "#1d1d22", fg: "#ffffff" }); p.position.set(x, 2.1, 0.11); g.add(p);
  });
  const setK = (k) => bars.forEach(([b, hh]) => { b.scale.y = Math.max(0.001, hh * k); });
  setK(0); g.add(contactShadow(3.4, 1.2)); return { group: g, setK };
}
// Judge's gavel (head along z, handle along +x) and its round strike block with a printed name.
function makeGavel() {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 24), mat("#5a3a26", { roughness: 0.5 })); head.rotation.x = Math.PI / 2; g.add(head);
  for (const z of [-0.26, 0.26]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24), mat(GOLD, { metalness: 0.6, roughness: 0.3 })); b.rotation.x = Math.PI / 2; b.position.z = z; g.add(b); }
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 14), mat("#6a4330")); h.rotation.z = Math.PI / 2; h.position.x = 0.7; g.add(h);
  return g;
}
function makeStrikeBlock(label) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.22, 40), mat("#5a3a26", { roughness: 0.5 })); b.position.y = 0.11; g.add(b);
  if (label) { const p = makePlate(label, 0.7, 0.2, { bg: GOLD, fg: "#3a2416" }); p.position.set(0, 0.11, 0.61); g.add(p); }
  g.add(contactShadow(1.6, 1.6)); return g;
}
// Small football ground for the analogy: pitch with lines, a three-step stand behind, and a gate with
// a printed sign on the right. Origin: floor, pitch centre. API { group, standSeat(i), gateOut }
function makeStadium() {
  const g = new THREE.Group();
  const pitchTex = canvasTex(512, 320, (x, w, h) => { x.fillStyle = "#2f8a4a"; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#2a7f43" : "#34944f"; x.fillRect(i * w / 8, 0, w / 8 + 1, h); } x.strokeStyle = "#ffffff"; x.lineWidth = 6; x.strokeRect(16, 16, w - 32, h - 32); x.beginPath(); x.moveTo(w / 2, 16); x.lineTo(w / 2, h - 16); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 48, 0, Math.PI * 2); x.stroke(); });
  const pitch = new THREE.Mesh(rbox(3.4, 0.08, 2.1, 0.02), [mat("#2a6e3e"), mat("#2a6e3e"), new THREE.MeshStandardMaterial({ map: pitchTex.tex, roughness: 0.9 }), mat("#2a6e3e"), mat("#2a6e3e"), mat("#2a6e3e")]);
  pitch.position.y = 0.04; g.add(pitch);
  const stand = new THREE.Group(); stand.position.set(0, 0, -1.3); g.add(stand);
  const sm1 = mat("#8a8f96", { roughness: 0.7 }), sm2 = mat("#a2a7ad", { roughness: 0.7 });
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(rbox(3.6, 0.3 * (i + 1), 0.42, 0.03), i % 2 ? sm2 : sm1); s.position.set(0, 0.15 * (i + 1), -i * 0.42); stand.add(s); }
  const fans = [];
  for (let i = 0; i < 9; i++) { const p = makePerson([CREAM, "#c9b8a6", "#e0a070"][i % 3]); const row = i % 3, col = Math.floor(i / 3); p.position.set(-1.4 + col * 0.55 + row * 0.15, 0.3 * (row + 1), -row * 0.42); p.scale.setScalar(0.9); stand.add(p); fans.push(p); }
  const gate = new THREE.Group(); gate.position.set(2.5, 0, 1.25); g.add(gate);
  const pm = mat("#3b3f44", { metalness: 0.6, roughness: 0.35 });
  for (const x of [-0.6, 0.6]) { const p = new THREE.Mesh(rbox(0.14, 1.7, 0.14, 0.03), pm); p.position.set(x, 0.85, 0); gate.add(p); }
  const top = new THREE.Mesh(rbox(1.75, 0.58, 0.2, 0.03), mat("#2a2d31")); top.position.set(0, 1.97, 0); gate.add(top);
  const sign = makePlate("PORTÃO", 1.6, 0.5, { bg: "#141414", fg: "#ffffff" }); sign.position.set(0, 1.97, 0.11); gate.add(sign);
  const fm = mat("#5b6168", { metalness: 0.5, roughness: 0.4 });
  for (const [x0, z0, x1, z1] of [[-1.9, 1.25, 1.9, 1.25], [3.1, 1.25, 3.7, 1.25]]) {
    const L = Math.hypot(x1 - x0, z1 - z0), rail = new THREE.Mesh(rbox(0.06, 0.06, L, 0.02), fm); rail.position.set((x0 + x1) / 2, 0.55, (z0 + z1) / 2); rail.rotation.y = Math.atan2(x1 - x0, z1 - z0); g.add(rail);
    const n = Math.max(2, Math.round(L / 0.45)); for (let i = 0; i <= n; i++) { const k = i / n, post = new THREE.Mesh(rbox(0.06, 0.6, 0.06, 0.02), fm); post.position.set(x0 + (x1 - x0) * k, 0.3, z0 + (z1 - z0) * k); g.add(post); }
  }
  g.add(contactShadow(5.2, 4.0));
  return { group: g, stand, fans, gate };
}
// Ticket (two halves that can tear apart). Origin: centre; faces +z. API { group, tear(k) }
function makeTicket() {
  const g = new THREE.Group();
  const paper = mat("#ffd36b", { roughness: 0.6 });
  const halves = [[-1, 0.9], [1, 0.34]].map(([s, w]) => {
    const h = new THREE.Group(); g.add(h);
    const m = new THREE.Mesh(rbox(w, 0.6, 0.02, 0.02), paper); m.position.x = s * (w / 2 + 0.01); h.add(m);
    return { h, s, w };
  });
  const p = makePlate("INGRESSO", 0.84, 0.3, { bg: "#ffd36b", fg: "#3a2416" }); p.position.set(-0.46, 0.04, 0.016); halves[0].h.add(p);
  for (let i = 0; i < 6; i++) { const dot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.022), mat("#b8902e")); dot.position.set(0.0, -0.25 + i * 0.1, 0.0); halves[1].h.add(dot); }
  const tear = (k) => halves.forEach(({ h, s }) => { h.position.set(s * 0.25 * k, -0.6 * k * k, 0); h.rotation.z = -s * 0.7 * k; });
  tear(0); return { group: g, tear };
}
// Megaphone: cone + mouthpiece + handle; points along +x. Origin: centre of the cone.
function makeMegaphone() {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.9, 28, 1, true), mat("#e8e2d6", { roughness: 0.5, side: THREE.DoubleSide })); cone.rotation.z = -Math.PI / 2; g.add(cone);
  const bell = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 32), mat(RED)); bell.rotation.y = Math.PI / 2; bell.position.x = 0.45; g.add(bell);
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), mat("#2b2b2b")); mouth.rotation.z = Math.PI / 2; mouth.position.x = -0.55; g.add(mouth);
  const handle = new THREE.Mesh(rbox(0.1, 0.36, 0.1, 0.03), mat("#2b2b2b")); handle.position.set(-0.25, -0.3, 0); g.add(handle);
  return g;
}
// Balance scale: base, post, beam pivoting at the top; each pan hangs under a beam end.
// Origin: floor. API { group, setTilt(a), panL, panR, panTop }
function makeBalance({ arm = 1.7, postH = 2.3, hang = 1.05 } = {}) {
  const g = new THREE.Group(), metal = mat(GOLD, { metalness: 0.65, roughness: 0.3 }), dark = mat("#2a1b12", { roughness: 0.6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.16, 32), dark); base.position.y = 0.08; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, postH, 16), metal); post.position.y = 0.16 + postH / 2; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 0.16 + postH; g.add(beam);
  const bar = new THREE.Mesh(rbox(2 * arm + 0.2, 0.1, 0.12, 0.03), metal); beam.add(bar);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 14), metal); beam.add(cap);
  const pans = [-1, 1].map((sx) => {
    const end = new THREE.Group(); end.position.set(sx * arm, 0, 0); beam.add(end);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, hang, 8), metal); r.position.y = -hang / 2; end.add(r);
    const pan = new THREE.Group(); pan.position.y = -hang; end.add(pan);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.62, 0.08, 36), metal); dish.position.y = 0.04; pan.add(dish);
    return { end, pan };
  });
  g.add(contactShadow(3, 1.6));
  const setTilt = (a) => { beam.rotation.z = a; pans.forEach((p) => { p.end.rotation.z = -a; }); };
  setTilt(0);
  return { group: g, setTilt, panL: pans[0].pan, panR: pans[1].pan, panTop: 0.08 };
}
// Phone screen: a generic instant-payment confirmation (no logo): green check, "PIX", "ENVIADO".
function paintPix(ctx, k) {
  const w = 720, h = 1500; ctx.fillStyle = "#f4f6f8"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1f8a5a"; ctx.beginPath(); ctx.arc(w / 2, 560, 200 * Math.max(0.01, k), 0, Math.PI * 2); ctx.fill();
  if (k > 0.6) { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 40; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(w / 2 - 90, 570); ctx.lineTo(w / 2 - 20, 640); ctx.lineTo(w / 2 + 100, 490); ctx.stroke(); }
  centerText(ctx, "PIX", w / 2, 940, "900 190px Inter", "#141414");
  centerText(ctx, "ENVIADO", w / 2, 1110, "800 90px Inter", "#1f8a5a");
}

// ---------------------------------------------------------------- 1. gancho (0 – 5.2)
// "Teve quase cinquenta e oito milhões de votos. Hoje, nem pode votar."
addScene("gancho", 0, 5.2, (S) => {
  const u = makeUrna(); u.group.scale.setScalar(1.45); u.group.position.set(-0.15, 0, -0.55); S.add(u.group);
  const card = makeVoterCard(); card.group.position.set(0.35, 0, 1.25); card.group.rotation.y = -0.12; S.add(card.group);
  const stamp = makeStamp({ w: 1.15, d: 0.38 }); S.add(stamp);
  let shown = -1;
  const paint = (v) => (x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); centerText(x, v.toFixed(1).replace(".", ","), w / 2, 150, "900 170px Inter", "#141414"); centerText(x, "MILHÕES", w / 2, 290, "900 64px Inter", ORANGE); };
  S.hero(u.group, "urna eletrônica"); S.hero(card.group, "título de eleitor", { when: (t) => t > 3.4 });
  S.solid(u.group, "urna"); S.solid(card.group, "título");
  S.solid(stamp, "carimbo", { restsOn: ["título"], when: (t) => t > 4.0 && t < 4.8 });
  const anim = (t) => {
    const v = 57.8 * eOut(lin(t, 0.3, 2.6)), q = Math.round(v * 10);
    if (q !== shown) { u.screen(paint(q / 10)); shown = q; }
    popIn(card.group, t, 3.3, 0.4);
    const down = eOut(lin(t, 4.0, 4.28)), up = sm(t, 4.55, 4.95);
    stamp.visible = t > 3.9 && t < 4.95;
    stamp.position.set(0.4, card.top + 0.75 * (1 - down) + 0.75 * up, 1.25 - 0.22); stamp.rotation.y = 0.0;
    card.print.visible = t > 4.28;
  };
  const shot = shotOf(anim);
  const A0 = shot([u.group, card.group], 0, 5.2, { from: [0.2, 1.05, 1], pull: 1.08 }), A1 = shot([u.group, card.group], 0, 5.2, { from: [-0.1, 0.95, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 4.28 ? ORANGE : RED); fill.position.set(0.3, 2.4, 2.0); fill.intensity = t < 4.28 ? 2.5 : 3 + 3 * (1 - lin(t, 4.28, 4.9));
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 0, 5.2)), t, 4.28, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 2. 1986 (5.2 – 16.3)
// "Imagina: 1986. Você é capitão paraquedista, e o salário não fecha o mês. Reclama disso numa
//  revista... e pega quinze dias de prisão."
addScene("1986", 5.2, 16.3, (S) => {
  const post = makeYearPost("1986", "PARAQUEDISTA"); post.group.position.set(-1.7, 0, 0); S.add(post.group);
  const para = makeParatrooper(); para.group.scale.setScalar(2.0); S.add(para.group);
  const mag = makeMagazine(["O SALÁRIO", "ESTÁ BAIXO"], "SET · 1986"); mag.group.position.set(2.15, 0, 0.1); mag.group.rotation.y = -0.22; S.add(mag.group);
  const cell = makeCellDoor("15 DIAS"); cell.group.position.set(0.15, 0, 0.55); S.add(cell.group);
  const land = new V3(0.15, 0, 0.0);
  S.hero(post.group, "placa 1986", { when: (t) => t < 12.4 });
  S.hero(para.group, "paraquedista", { when: (t) => t > 10.4 });
  S.hero(mag.group, "revista 1986", { when: (t) => t > 12.9 });
  S.hero(cell.group, "porta de cela", { when: (t) => t > 14.6 });
  S.solid(post.group, "placa"); S.solid(mag.group, "revista");
  const anim = (t) => {
    post.light(true, t > 7.9 ? ORANGE : "#8a5a3a"); popIn(post.group, t, 0, 0.01, 1, 12.45);
    // descent 8.6 → 10.4, then the canopy folds away
    const k = eOut(lin(t, 8.9, 10.4));
    para.group.visible = t > 8.9;
    para.group.position.set(land.x + 0.7 * (1 - k), land.y + 0.6 * (1 - k), land.z);
    para.group.rotation.z = 0.12 * Math.sin(t * 2.6) * (1 - k);
    const fold = sm(t, 10.4, 10.8); para.canopy.scale.set(Math.max(0.001, 1 - fold), Math.max(0.001, 1 - fold), Math.max(0.001, 1 - fold)); para.canopy.position.y = 1.3 - 0.55 * fold; para.canopy.visible = fold < 0.9;
    para.person.rotation.y = t > 10.9 && t < 12.4 ? 0.35 * Math.sin((t - 10.9) * 5) : 0;   // "o salário não fecha o mês"
    popIn(mag.group, t, 12.5, 0.45); mag.mag.rotation.y = 0.05 * Math.sin(t * 1.4);
    popIn(cell.group, t, 13.8, 0.35);
    cell.setClosed(eOut(lin(t, 14.25, 14.7)));
  };
  const shot = shotOf(anim);
  const A0 = shot([post.group], 5.2, 8.5, { from: [0.3, 0.35, 1], pull: 1.1 }), A0b = shot([post.group], 5.2, 8.5, { from: [-0.1, 0.28, 1], pull: 1.0 }), A1 = shot([post.group, para.group], 10.3, 12.2, { from: [0.0, 0.35, 1], pull: 1.0 });
  const B0 = shot([para.group, mag.group, cell.group], 12.3, 16.3, { from: [0.15, 0.35, 1], pull: 1.08 }), B1 = shot([para.group, mag.group, cell.group], 12.3, 16.3, { from: [-0.1, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    if (t < 12.3) NIGHT();
    fill.color.set(t > 14.25 ? RED : ORANGE); fill.position.set(t < 12.3 ? -0.8 : 0.4, 2.6, 1.8); fill.intensity = t > 14.25 ? 4 : 2.6;
    CAM.apply(CAM.shake(CAM.track(t, [[5.2, A0], [8.4, A0b, 3.2], [9.4, A1, 1.0], [12.6, B0, 0.4], [16.3, B1, 3.7]]), t, 14.7, 0.05, 0.4));
  };
});
function NIGHT() { key.color.set("#b8c4e0"); key.intensity = 2.0; hemi.intensity = 0.6; }

// ---------------------------------------------------------------- 3. bombas, 1987 (16.3 – 25.85)
// "Esse é Jair Messias Bolsonaro. [cartão 16.3–19.0] Em 1987, a mesma revista o acusa de planejar
//  bombas em quartéis. Ele nega e é absolvido."
addScene("bombas", 16.3, 25.85, (S) => {
  const mag = makeMagazine(["BOMBAS NOS", "QUARTÉIS?"], "OUT · 1987"); mag.group.position.set(-1.05, 0, -0.2); mag.group.rotation.y = 0.18; S.add(mag.group);
  const desk = makeDesk(2.4, 1.9, 0.8); desk.group.position.set(1.15, 0, 0.35); S.add(desk.group);
  const folder = makeFlatFolder(null, { w: 1.9, d: 1.35 });
  desk.apron("STM · 1988"); folder.group.position.set(1.15, desk.top, 0.35); S.add(folder.group);
  const print = makePlate("ABSOLVIDO", 1.5, 0.36, { bg: GREEN, fg: "#ffffff" }); print.rotation.set(-Math.PI / 2, 0, -0.06); print.position.set(0, folder.top + 0.017, 0.3); folder.group.add(print);
  const stamp = makeStamp({ w: 1.55, d: 0.42, ink: GREEN }); S.add(stamp);
  S.hero(mag.group, "revista 1987", { when: (t) => t > 19.0 && t < 24.2 });
  S.hero(desk.group, "mesa do STM", { when: (t) => t > 19.0 && t < 24.2 });
  S.hero(folder.group, "pasta STM", { when: (t) => t > 19.0 });
  S.solid(mag.group, "revista"); S.solid(desk.group, "mesa"); S.solid(folder.group, "pasta", { restsOn: ["mesa"] });
  S.solid(stamp, "carimbo", { restsOn: ["pasta"], when: (t) => t > 24.6 && t < 25.5 });
  const anim = (t) => {
    popIn(mag.group, t, 18.6, 0.4, 1, 24.25);
    mag.mag.rotation.y = 0.06 * Math.sin(t * 1.3);
    const down = eOut(lin(t, 24.8, 25.15)), up = sm(t, 25.35, 25.8);
    stamp.visible = t > 24.5;
    stamp.position.set(1.15, desk.top + folder.top + 0.8 * (1 - down) + 0.8 * up, 0.35 + 0.3); stamp.rotation.y = -0.06;
    print.visible = t > 25.15;
  };
  const shot = shotOf(anim);
  const A0 = shot([mag.group, desk.group, folder.group], 18.6, 24.2, { from: [0.2, 0.42, 1], pull: 1.04 }), A1 = shot([mag.group, desk.group, folder.group], 18.6, 24.2, { from: [-0.1, 0.38, 1], pull: 1.0 });
  const B0 = shot([desk.group, folder.group, stamp], 24.2, 25.85, { from: [0.1, 1.2, 1], pull: 1.08 }), B1 = shot([desk.group, folder.group, stamp], 24.2, 25.85, { from: [-0.05, 1.1, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 25.15 ? GREEN : ORANGE); fill.position.set(t < 24.2 ? -0.6 : 1.0, 2.6, 1.8); fill.intensity = t > 25.15 ? 4 : 2.6;
    CAM.apply(CAM.shake(CAM.track(t, [[16.3, A0], [24.0, A1, 5.0], [24.4, B0, 0.4], [25.85, B1, 1.4]]), t, 25.15, 0.05, 0.35));
  };
});

// ---------------------------------------------------------------- 4. vereador e deputado (25.85 – 33.4)
// "Em 1988, vai pra reserva e vira vereador no Rio. Depois, sete mandatos de deputado federal."
addScene("vereador", 25.85, 33.4, (S) => {
  const stand = makeUniformStand(); stand.position.set(-0.95, 0, 0); S.add(stand);
  const box = makeBallotBox(); box.position.set(0.55, 0, 0.1); box.userData.ballot.visible = false; S.add(box);
  const bl = makePlate("RIO · 1988", 1.17, 0.28, { bg: "#3a3330", fg: "#ffffff" }); bl.position.set(0, 0.19, 0.462); box.add(bl);
  const elected = makePerson(ORANGE); elected.scale.setScalar(1.4); S.add(elected);
  const tag = new THREE.Group(); tag.position.set(2.6, 0, 0.35); S.add(tag);
  const podV = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.36, 32), mat("#6a4a36", { roughness: 0.6 })); podV.position.set(1.72, 0.18, 0.2); S.add(podV);
  const tagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 10), mat("#8b9196", { metalness: 0.6, roughness: 0.3 })); tagPole.position.y = 0.6; tag.add(tagPole);
  const tagBoard = new THREE.Mesh(rbox(1.25, 0.42, 0.08, 0.03), mat(ORANGE, { roughness: 0.5 })); tagBoard.position.y = 1.38; tag.add(tagBoard);
  const tagPl = makePlate("VEREADOR", 1.1, 0.3, { bg: ORANGE, fg: "#ffffff" }); tagPl.position.set(0, 1.38, 0.056); tag.add(tagPl);
  const tagFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 20), mat("#3a2a20")); tagFoot.position.y = 0.03; tag.add(tagFoot); tag.add(contactShadow(0.8, 0.8));
  // shot B: the deputy photo frame and seven mandate blocks, a few metres to the right
  const XB = 8;
  const fr = makePhotoFrame("deputado-2016", { w: 1.8, name: "DEPUTADO", shape: "paisagem" }); fr.group.position.set(XB, 0, 0); S.add(fr.group);
  const blocks = new THREE.Group(); blocks.position.set(XB + 1.3, 0, 0.1); S.add(blocks);
  const bms = [];
  for (let i = 0; i < 7; i++) { const m = mat("#8d847c", { roughness: 0.5 }); const b = new THREE.Mesh(rbox(0.3, 0.24, 0.3, 0.03), m); b.position.set(0, 0.125 + i * 0.255, 0); blocks.add(b); bms.push(m); }
  blocks.add(contactShadow(0.8, 0.8));
  S.hero(stand, "farda no cabide", { when: (t) => t < 30.5 }); S.hero(box, "urna de papel", { when: (t) => t < 30.5 });
  S.hero(fr.group, "porta-retrato do deputado", { when: (t) => t > 30.9 });
  S.solid(stand, "cabide"); S.solid(box, "urna"); S.hero(tag, "placa vereador", { when: (t) => t > 29.9 && t < 30.5 });
  S.solid(podV, "pódio"); S.solid(elected, "vereador", { restsOn: ["pódio"], when: (t) => t > 29.8 && t < 30.5 });
  S.solid(fr.group, "porta-retrato");
  const anim = (t) => {
    stand.rotation.y = 0.15 * Math.sin(t * 0.9);
    const k = pop(t, 29.2, 0.45); elected.visible = k > 0.01; elected.scale.setScalar(1.4 * Math.max(0.0001, k)); elected.position.set(1.72, 0.36, 0.2); popIn(podV, t, 29.0, 0.3);
    popIn(tag, t, 29.5, 0.35);
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, 30.5, 31.1))); fr.zoom(1 + 0.14 * lin(t, 30.6, 33.4));
    bms.forEach((m, i) => { const on = t > 31.4 + i * 0.2; m.color.set(on ? ORANGE : "#8d847c"); m.emissive = new THREE.Color(on ? ORANGE : "#000000"); m.emissiveIntensity = on ? 0.35 : 0; });
  };
  const shot = shotOf(anim);
  const A0 = shot([stand, box, podV, elected, tag], 25.85, 30.5, { from: [0.2, 0.36, 1], pull: 1.03 }), A1 = shot([stand, box, podV, elected, tag], 25.85, 30.5, { from: [-0.05, 0.35, 1], pull: 1.0 });
  const B0 = shot([fr.group, blocks], 30.5, 33.4, { from: [-0.15, 0.3, 1], pull: 1.06 }), B1 = shot([fr.group, blocks], 30.5, 33.4, { from: [0.12, 0.25, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(t < 30.5 ? 0.8 : XB, 2.6, 1.8); fill.intensity = 2.6 + (t > 29.2 && t < 30.5 ? 2 : 0);
    CAM.apply(CAM.track(t, [[25.85, A0], [30.4, A1, 4.5], [30.6, B0, 0.2], [33.4, B1, 2.8]]));
  };
});

// ---------------------------------------------------------------- 5. impeachment, 2016 (33.4 – 40.15)
// "Em 2016, dedica o voto do impeachment de Dilma a um coronel reconhecido pela Justiça como torturador."
addScene("ustra", 33.4, 40.15, (S) => {
  const hemi = makeHemicycle({ n: 60, rows: 3, r0: 1.3, dr: 0.36, seat: 0.22 }); hemi.group.position.set(0, 0, -0.6); S.add(hemi.group);
  const mic = makeMicStand(); mic.scale.setScalar(0.66); mic.rotation.y = Math.PI; mic.position.set(-0.55, 0, 1.5); S.add(mic);
  const dep = makePerson(GREY); dep.scale.setScalar(1.5); dep.position.set(-0.55, 0, 1.0); S.add(dep);
  const board = makeVoteBoard("SIM", { w: 1.4, h: 0.85 }); board.group.position.set(1.85, 0, 1.6); board.group.rotation.y = -0.25; S.add(board.group);
  S.hero(hemi.group, "plenário"); S.hero(mic, "microfone"); S.hero(board.group, "painel SIM", { when: (t) => t > 36.0 });
  S.solid(hemi.group, "plenário"); S.solid(mic, "microfone"); S.solid(board.group, "painel");
  const anim = (t) => {
    for (let i = 0; i < hemi.n; i++) hemi.setColor(i, t > 34.0 + (i / hemi.n) * 4.6 && i % 4 !== 3 ? GREEN : GREY);
    popIn(board.group, t, 35.7, 0.4); board.light(sm(t, 36.3, 36.8));
    dep.position.y = 0.03 * Math.abs(Math.sin(t * 2.2));
  };
  const shot = shotOf(anim);
  const objs = [hemi.group, mic, dep, board.group];
  const A0 = shot(objs, 33.4, 40.15, { from: [0.0, 0.75, 1], pull: 1.08 }), A1 = shot(objs, 33.4, 40.15, { from: [0.2, 0.6, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 36.3 ? GREEN : ORANGE); fill.position.set(0.4, 2.6, 2.0); fill.intensity = 3;
    CAM.apply(CAM.blend(A0, A1, sm(t, 33.4, 40.15)));
  };
});

// ---------------------------------------------------------------- 6. 2018 (40.15 – 46.15)
// "Em 2018, leva uma facada em plena campanha... e é eleito presidente."
addScene("eleito", 40.15, 46.15, (S) => {
  const cal = makeCalendarStand("6", "SET · 2018"); cal.group.position.set(0, 0, 0.4); S.add(cal.group);
  const crowd = makeCrowd({ rows: 4, cols: 12, sx: 0.42, sz: 0.46 }); crowd.group.position.set(0, 0, -1.6); S.add(crowd.group);
  const XB = 8;
  const fr = makePhotoFrame("presidente-2019", { w: 1.45, name: "PRESIDENTE" }); fr.group.position.set(XB, 0, 0); S.add(fr.group);
  S.scenery(crowd.group, "multidão de campanha", { when: (t) => t < 43.4 });
  S.hero(cal.group, "calendário 6 de setembro", { when: (t) => t < 43.4 });
  S.hero(fr.group, "porta-retrato do presidente", { when: (t) => t > 44.0 });
  S.solid(cal.group, "calendário"); S.solid(fr.group, "porta-retrato");
  const anim = (t) => {
    crowd.reveal(1); crowd.group.position.y = 0.04 * Math.abs(Math.sin(t * 3));
    const sk = eOut(lin(t, 41.9, 42.15)); cal.slash.scale.set(Math.max(0.001, sk), 1, 1); cal.slash.visible = sk > 0.01;
    fr.frame.rotation.y = 1.3 * (1 - eOut(lin(t, 43.4, 44.0))); fr.zoom(1 + 0.15 * lin(t, 43.5, 46.15));
  };
  const shot = shotOf(anim);
  const A0 = shot([cal.group], 40.15, 43.4, { from: [0.25, 0.3, 1], pull: 1.1 }), A1 = shot([cal.group], 40.15, 43.4, { from: [-0.1, 0.25, 1], pull: 1.0 });
  const B0 = shot([fr.group], 43.4, 46.15, { from: [-0.2, 0.25, 1], pull: 1.08 }), B1 = shot([fr.group], 43.4, 46.15, { from: [0.12, 0.2, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 41.9 && t < 43.4 ? RED : ORANGE); fill.position.set(t < 43.4 ? 0 : XB, 2.6, 1.8); fill.intensity = t > 41.9 && t < 43.4 ? 4.5 : 2.6;
    CAM.apply(CAM.shake(CAM.track(t, [[40.15, A0], [43.3, A1, 3.1], [43.5, B0, 0.2], [46.15, B1, 2.6]]), t, 42.0, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 7. governo (46.15 – 50.95)
// "No governo, aprova a reforma da Previdência e a autonomia do Banco Central. E o Pix é lançado."
addScene("governo", 46.15, 50.95, (S) => {
  const base = new THREE.Mesh(rbox(9.6, 0.3, 1.9, 0.05), mat("#2a1b12", { roughness: 0.6 })); base.position.y = 0.15; S.add(base);
  const rim = new THREE.Mesh(rbox(9.62, 0.05, 0.05, 0.02), mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.4 })); rim.position.set(0, 0.27, 0.96); S.add(rim);
  const top = 0.3;
  const book = makeStandingBook("PREVIDÊNCIA", "2019", { w: 2.0, h: 2.0 }); book.group.position.set(-3.5, top, 0.25); book.group.rotation.y = -0.38; S.add(book.group);
  const temple = makeTemple("BANCO CENTRAL", { w: 2.25 }); temple.position.set(0.3, top, -0.1); S.add(temple);
  const phoneStand = new THREE.Mesh(rbox(0.9, 0.12, 0.6, 0.03), mat("#3a2a20")); phoneStand.position.set(3.9, top + 0.06, 0.2); S.add(phoneStand);
  const ph = makePhone(); ph.group.scale.setScalar(1.05); ph.group.position.set(3.9, top + 0.12 + 0.86, 0.2); ph.group.rotation.set(-0.08, -0.25, 0); S.add(ph.group);
  let pk = -1;
  S.hero(book.group, "livro Previdência", { when: (t) => t > 46.6 && t < 47.9 });
  S.hero(temple, "prédio do Banco Central", { when: (t) => t > 48.35 && t < 49.75 }); S.hero(ph.group, "celular com Pix", { when: (t) => t > 50.25 });
  S.solid(base, "pedestal"); S.solid(book.group, "livro", { restsOn: ["pedestal"] }); S.solid(temple, "banco central", { restsOn: ["pedestal"] });
  const anim = (t) => {
    popIn(book.group, t, 46.3, 0.4); popIn(temple, t, 47.9, 0.4); popIn(ph.group, t, 49.85, 0.4, 1.05); popIn(phoneStand, t, 49.75, 0.3);
    const k = Math.round(10 * eOut(lin(t, 50.1, 50.6))) / 10;
    if (k !== pk) { paintPix(ph.ctx, k); ph.tex.needsUpdate = true; pk = k; }
    ph.group.rotation.y = -0.25 + 0.06 * Math.sin(t * 2);
  };
  const shot = shotOf(anim);
  const P0 = shot([book.group], 46.15, 48.0, { from: [0.05, 0.32, 1], pull: 1.1 }), P1 = shot([book.group], 46.15, 48.0, { from: [0.22, 0.28, 1], pull: 1.02 });
  const Q0 = shot([temple], 47.9, 49.85, { from: [-0.15, 0.3, 1], pull: 1.08 }), Q1 = shot([temple], 47.9, 49.85, { from: [0.12, 0.26, 1], pull: 1.0 });
  const R0 = shot([ph.group, phoneStand], 49.75, 50.95, { from: [-0.25, 0.2, 1], pull: 1.1 }), R1 = shot([ph.group, phoneStand], 49.75, 50.95, { from: [-0.1, 0.18, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(t < 47.9 ? -3.4 : t < 49.8 ? 0.3 : 3.9, 2.6, 1.8); fill.intensity = 3.5;
    CAM.apply(CAM.track(t, [[46.15, P0], [47.85, P1, 1.7], [48.25, Q0, 0.4], [49.7, Q1, 1.45], [50.1, R0, 0.4], [50.95, R1, 0.85]]));
  };
});

// ---------------------------------------------------------------- 8. pandemia (50.95 – 72.45)
// "Na pandemia, o auxílio de seiscentos reais chega a sessenta e oito milhões de pessoas, e a extrema
//  pobreza cai ao menor nível registrado até então, segundo o Banco Mundial. Quase dez milhões de
//  trabalhadores têm a jornada reduzida, com parte do salário pago pelo governo. Críticos apontam a
//  condução da pandemia: quase setecentas mil mortes."
addScene("pandemia", 50.95, 72.45, (S) => {
  // A: benefit card + crowd
  const card = makeBenefitCard(); card.position.set(0, 0, 0.9); S.add(card);
  const crowd = makeCrowd({ rows: 6, cols: 14, sx: 0.4, sz: 0.42, seed: 5 }); crowd.group.position.set(0, 0, -1.1); S.add(crowd.group);
  // B: extreme-poverty column shrinking
  const XB = 9;
  const pov = makeHourColumn({ hours: 10, unit: 0.24, w: 0.95, color: "#a7adb3" }); pov.group.position.set(XB, 0, 0); S.add(pov.group);
  const povPl = makePlinth("POBREZA EXTREMA", 2.0); povPl.position.set(XB, 0, 1.05); S.add(povPl);
  const arrow = new THREE.Group(); arrow.position.set(XB + 1.15, 0, 0.2); S.add(arrow);
  const am = mat(GREEN, { emissive: GREEN, emissiveIntensity: 0.35 });
  const shaft = new THREE.Mesh(rbox(0.22, 0.9, 0.22, 0.04), am); shaft.position.y = 0.95; arrow.add(shaft);
  const headA = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 4), am); headA.rotation.x = Math.PI; headA.rotation.y = Math.PI / 4; headA.position.y = 0.3; arrow.add(headA);
  arrow.add(contactShadow(0.8, 0.8));
  // C: work hours shrink, the government completes the wage
  const XC = 18;
  const hours = makeHourColumn({ hours: 8, unit: 0.26, w: 0.9, color: ORANGE }); hours.group.position.set(XC - 1.4, 0, 0); S.add(hours.group);
  const hoursPl = makePlinth("JORNADA", 1.4); hoursPl.position.set(XC - 1.4, 0, 1.0); S.add(hoursPl);
  const emp = makeCoinStack("EMPRESA", "#c9ced3", 10); emp.group.position.set(XC + 0.15, 0, 0.2); S.add(emp.group);
  const gov = makeCoinStack("GOVERNO", "#e0b84a", 10); gov.group.position.set(XC + 1.4, 0, 0.2); S.add(gov.group);
  // D: memorial
  const XD = 27;
  const mem = makeMemorial("PANDEMIA"); mem.group.position.set(XD, 0, 0); S.add(mem.group);
  S.hero(card, "cartão do auxílio", { when: (t) => t < 56.3 }); S.hero(crowd.group, "multidão", { when: (t) => t > 54.6 && t < 56.3 });
  S.hero(pov.group, "coluna da pobreza", { when: (t) => t > 56.5 && t < 61.4 }); S.hero(povPl, "placa pobreza extrema", { when: (t) => t > 56.5 && t < 61.4 });
  S.hero(hours.group, "coluna da jornada", { when: (t) => t > 61.7 && t < 67.3 }); S.hero(emp.group, "moedas empresa", { when: (t) => t > 61.7 && t < 67.3 }); S.hero(gov.group, "moedas governo", { when: (t) => t > 65.4 && t < 67.3 });
  S.hero(mem.group, "memorial de velas", { when: (t) => t > 67.5 });
  S.solid(card, "cartão"); S.solid(pov.group, "coluna"); S.solid(povPl, "plinto"); S.solid(hours.group, "jornada"); S.solid(hoursPl, "plinto jornada");
  S.solid(emp.group, "empresa"); S.solid(gov.group, "governo"); S.solid(mem.group, "memorial");
  const anim = (t) => {
    crowd.reveal(sm(t, 53.9, 56.0)); card.rotation.y = 0.12 * Math.sin(t * 1.2);
    const ph = 10 - 6.3 * eOut(lin(t, 57.8, 59.6)); setColumn(pov, ph, t > 59.6 ? "2020" : null);
    arrow.visible = t > 57.6; arrow.position.y = 0.0; arrow.scale.set(1, 1 + 0.08 * Math.sin(t * 6), 1);
    const h = 8 - 4 * eOut(lin(t, 63.9, 64.9)); hours.setHours(h);
    emp.setN(Math.round(10 - 5 * eOut(lin(t, 64.0, 64.9))));
    gov.setN(Math.round(5 * eOut(lin(t, 65.3, 66.6))));
    mem.light(1, t);
  };
  const shot = shotOf(anim);
  const A0 = shot([card], 50.95, 53.8, { from: [0.0, 0.3, 1], pull: 1.06 }), A1 = shot([card, crowd.group], 53.8, 56.35, { from: [0.18, 0.45, 1], pull: 1.0 });
  const B0 = shot([pov.group, povPl, arrow], 56.35, 61.5, { from: [-0.2, 0.3, 1], pull: 1.08 }), B1 = shot([pov.group, povPl, arrow], 56.35, 61.5, { from: [0.15, 0.25, 1], pull: 1.0 });
  const C0 = shot([hours.group, hoursPl, emp.group, gov.group], 61.5, 67.35, { from: [0.15, 0.4, 1], pull: 1.06 }), C1 = shot([hours.group, hoursPl, emp.group, gov.group], 61.5, 67.35, { from: [-0.12, 0.35, 1], pull: 1.0 });
  const D0 = shot([mem.group], 67.35, 72.45, { from: [0.0, 0.8, 1], pull: 1.08 }), D1 = shot([mem.group], 67.35, 72.45, { from: [0.2, 0.65, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    if (t > 67.35) { key.intensity = 1.3; hemi.intensity = 0.45; }
    fill.color.set(t < 56.35 ? GREEN : t < 61.5 ? "#ffffff" : t < 67.35 ? ORANGE : "#ffcf6b"); fill.position.set(t < 56.35 ? 0 : t < 61.5 ? XB : t < 67.35 ? XC : XD, 2.6, 1.8); fill.intensity = t > 67.35 ? 3 : 3;
    CAM.apply(CAM.track(t, [[50.95, A0], [55.0, A1, 1.5], [56.45, B0, 0.25], [61.4, B1, 4.9], [61.6, C0, 0.2], [67.25, C1, 5.6], [67.45, D0, 0.2], [72.45, D1, 5.0]]));
  };
});

// ---------------------------------------------------------------- 9. 2022 e TSE (72.45 – 85.85)
// "Em 2022, com o desemprego no menor nível pra época em oito anos, perde pra Lula por menos de dois
//  pontos. Em 2023, o TSE o torna inelegível por atacar as urnas diante de embaixadores."
addScene("derrota", 72.45, 85.85, (S) => {
  const job = makeHourColumn({ hours: 10, unit: 0.24, w: 0.95, color: ORANGE }); job.group.position.set(0, 0, 0); S.add(job.group);
  const jobPl = makePlinth("DESEMPREGO", 1.8); jobPl.position.set(0, 0, 1.05); S.add(jobPl);
  const XB = 8;
  const sb = makeScoreboard([["BOLSONARO", BLUE, "49,1%", 1.16], ["LULA", "#c0392b", "50,9%", 1.2]]); sb.group.position.set(XB, 0, 0); S.add(sb.group);
  const XC = 16;
  const desk = makeDesk(2.6, 2.2, 0.8); desk.group.position.set(XC, 0, 0); S.add(desk.group);
  const folder = makeFlatFolder(null, { w: 2.1, d: 1.0 }); folder.group.position.set(XC + 0.1, desk.top, 0.3); S.add(folder.group);
  const tse = makePlate("TSE", 1.0, 0.24, { bg: "#141414", fg: "#ffffff" }); tse.rotation.x = -Math.PI / 2; tse.position.set(0, folder.top + 0.016, 0.3); folder.group.add(tse);
  const print = makePlate("INELEGÍVEL ATÉ 2030", 1.95, 0.32, { bg: RED, fg: "#ffffff" }); print.rotation.set(-Math.PI / 2, 0, -0.04); print.position.set(0, folder.top + 0.017, -0.14); folder.group.add(print);
  const stamp = makeStamp({ w: 2.0, d: 0.4 }); S.add(stamp);
  const u = makeUrna(); u.group.scale.setScalar(0.7); u.group.position.set(XC - 0.65, desk.top, -0.76); S.add(u.group);
  u.screen((x, w, h) => { x.fillStyle = "#f4f6f8"; x.fillRect(0, 0, w, h); centerText(x, "?", w / 2, h / 2 + 10, "900 260px Inter", RED); });
  S.hero(job.group, "coluna do desemprego", { when: (t) => t < 77.0 }); S.hero(jobPl, "placa desemprego", { when: (t) => t < 77.0 });
  S.hero(sb.group, "placar 2022", { when: (t) => t > 77.3 && t < 79.5 });
  S.hero(desk.group, "mesa", { when: (t) => t > 79.8 }); S.hero(folder.group, "pasta TSE", { when: (t) => t > 79.8 });
  S.solid(job.group, "coluna"); S.solid(jobPl, "plinto"); S.solid(sb.group, "placar"); S.solid(desk.group, "mesa");
  S.solid(folder.group, "pasta", { restsOn: ["mesa"] }); S.solid(u.group, "urna", { restsOn: ["mesa"] });
  S.solid(stamp, "carimbo", { restsOn: ["pasta"], when: (t) => t > 82.2 && t < 83.2 });
  const anim = (t) => {
    const v = 10 - 5 * eOut(lin(t, 73.9, 76.0)); setColumn(job, v, t > 76.0 ? "8,3%" : null);
    sb.setK(eOut(lin(t, 77.2, 78.4)));
    const down = eOut(lin(t, 82.2, 82.5)), up = sm(t, 82.8, 83.3);
    stamp.visible = t > 81.9 && t < 83.3;
    stamp.position.set(XC + 0.1, desk.top + folder.top + 0.85 * (1 - down) + 0.85 * up, 0.3 - 0.14); stamp.rotation.y = -0.05;
    print.visible = t > 82.5;
  };
  const shot = shotOf(anim);
  const A0 = shot([job.group, jobPl], 72.45, 77.0, { from: [0.2, 0.3, 1], pull: 1.08 }), A1 = shot([job.group, jobPl], 72.45, 77.0, { from: [-0.15, 0.25, 1], pull: 1.0 });
  const B0 = shot([sb.group], 77.0, 79.55, { from: [-0.15, 0.25, 1], pull: 1.06 }), B1 = shot([sb.group], 77.0, 79.55, { from: [0.12, 0.2, 1], pull: 1.0 });
  const C0 = shot([desk.group, folder.group, u.group, stamp], 79.55, 85.85, { from: [0.1, 1.4, 1], pull: 1.06 }), C1 = shot([desk.group, folder.group, u.group, stamp], 79.55, 85.85, { from: [-0.1, 1.25, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 82.5 ? RED : ORANGE); fill.position.set(t < 77 ? 0 : t < 79.55 ? XB : XC, 2.6, 1.8); fill.intensity = 3 + (t > 82.5 && t < 83.4 ? 3 : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[72.45, A0], [76.9, A1, 4.4], [77.1, B0, 0.2], [79.45, B1, 2.3], [79.65, C0, 0.2], [85.85, C1, 6.1]]), t, 82.5, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 10. condenação (85.85 – 102.5)
// "Em 2025, o Supremo o condena por tentativa de golpe a vinte e sete anos e três meses. Ele nega, e a
//  defesa chama a pena de excessiva. Inelegível, já estava fora do jogo, mas podia torcer. Agora perdeu
//  até o ingresso: nem votar pode."
addScene("condenacao", 85.85, 102.5, (S) => {
  const fr = makePhotoFrame("stf-2025", { w: 1.7, name: "STF" }); fr.group.position.set(0, 0, 0); S.add(fr.group);
  const XB = 8;
  const block = makeStrikeBlock("STF"); block.position.set(XB - 0.5, 0, 0.3); S.add(block);
  const gavel = makeGavel(); S.add(gavel);
  const score = makeVoteBoard("4 × 1", { w: 1.4, h: 0.9, on: ORANGE }); score.group.position.set(XB + 1.35, 0, -0.1); score.group.rotation.y = -0.2; S.add(score.group);
  const XC = 17;
  const st = makeStadium(); st.group.position.set(XC, 0, 0); S.add(st.group);
  const fan = makePerson(BLUE); fan.scale.setScalar(1.35); S.add(fan);
  const ticket = makeTicket(); S.add(ticket.group);
  S.hero(fr.group, "porta-retrato do STF", { when: (t) => t < 89.4 });
  S.hero(block, "base do martelo", { when: (t) => t > 89.7 && t < 95.0 }); S.hero(score.group, "placar 4 a 1", { when: (t) => t > 90.0 && t < 95.0 });
  S.hero(st.group, "estádio", { when: (t) => t > 95.3 }); S.hero(fan, "torcedor azul", { when: (t) => t > 95.3 });
  S.hero(ticket.group, "ingresso", { when: (t) => t > 99.5 && t < 100.2 });
  S.solid(fr.group, "porta-retrato"); S.solid(block, "base"); S.solid(score.group, "placar 4x1");
  const P0 = new V3(XC - 0.3, 0.08, 0.2), P1 = new V3(XC + 1.15, 0.6, -1.72), G1 = new V3(XC + 2.5, 0, 0.55), P2 = new V3(XC + 3.25, 0, 2.15);
  const anim = (t) => {
    fr.frame.rotation.y = 0.9 * (1 - eOut(lin(t, 85.85, 86.5))); fr.zoom(1.9 + 0.25 * lin(t, 85.9, 89.5));
    // gavel strikes at 89.9 and 91.1
    let a = 0.9; [89.9, 91.1].forEach((s) => { a -= 0.9 * Math.sin(clamp((t - s + 0.18) / 0.36) * Math.PI); });
    gavel.position.set(XB - 0.5 - 0.15, 0.22 + 0.17 + 0.35 * Math.max(0, a), 0.3); gavel.rotation.set(0, 0.3, Math.max(0, a) * 0.5);
    popIn(score.group, t, 89.6, 0.4); score.light(t > 90.0 ? 1 : 0);
    // the fan: on the pitch → stand (96.3–97.6) → outside the gate (100.6–101.8)
    let p;
    if (t < 96.3) p = P0.clone(); else if (t < 100.6) p = hop(P0, P1, sm(t, 96.3, 97.6), 0.7); else if (t < 101.3) p = hop(P1, G1, sm(t, 100.6, 101.3), 0.6); else p = hop(G1, P2, sm(t, 101.3, 101.9), 0.15);
    fan.position.copy(p); fan.rotation.y = t > 98.3 && t < 99.2 ? 0.4 * Math.sin((t - 98.3) * 12) : 0;
    st.fans.forEach((f, i) => { f.position.y = 0.3 * ((i % 3) + 1) + 0.05 * Math.abs(Math.sin(t * 4 + i)); });
    ticket.group.visible = t > 99.2 && t < 100.9;
    ticket.group.position.set(P1.x + 0.55, P1.y + 2.45, P1.z + 0.2); ticket.group.scale.setScalar(Math.max(0.0001, pop(t, 99.2, 0.35)) * 1.9);
    ticket.tear(sm(t, 100.0, 100.8));
  };
  const shot = shotOf(anim);
  const A0 = shot([fr.group], 85.85, 89.5, { from: [-0.18, 0.25, 1], pull: 1.08 }), A1 = shot([fr.group], 85.85, 89.5, { from: [0.12, 0.2, 1], pull: 1.0 });
  const B0 = shot([block, gavel, score.group], 89.5, 95.1, { from: [0.15, 0.45, 1], pull: 1.08 }), B1 = shot([block, gavel, score.group], 89.5, 95.1, { from: [-0.15, 0.4, 1], pull: 1.0 });
  const C0 = shot([st.group, fan, ticket.group], 95.1, 102.5, { from: [-0.1, 0.85, 1], pull: 1.04 }), C1 = shot([st.group, fan, ticket.group], 95.1, 102.5, { from: [0.15, 0.75, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t < 95.1 ? ORANGE : t < 99.2 ? BLUE : RED); fill.position.set(t < 89.5 ? 0 : t < 95.1 ? XB : XC + 1, 2.6, 1.8); fill.intensity = 3;
    CAM.apply(CAM.shake(CAM.track(t, [[85.85, A0], [89.4, A1, 3.5], [89.6, B0, 0.2], [95.0, B1, 5.4], [95.2, C0, 0.2], [102.5, C1, 7.3]]), t, 89.9, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 11. pergunta (102.5 – 110.0)
// "Então me diz: pra você, a condenação dele foi justiça... ou perseguição política?"
addScene("pergunta", 102.5, 110.0, (S) => {
  const bal = makeBalance(); S.add(bal.group);
  const gv = makeGavel(); gv.scale.setScalar(0.7); gv.position.set(-0.3, bal.panTop + 0.18 * 0.7, 0.32); gv.rotation.y = 0.35; bal.panL.add(gv);
  const mg = makeMegaphone(); mg.scale.setScalar(0.7); mg.rotation.set(-Math.PI / 2, 0, 0); mg.position.set(0.0, bal.panTop + 0.42 * 0.7 + 0.01, 0.3); bal.panR.add(mg);
  const aTop = sprite(chipTex("JUSTIÇA", { bg: GOLD, fg: "#1c1410", font: "900 120px Inter", h: 180 }), 1.6); S.add(aTop);
  const bTop = sprite(chipTex("PERSEGUIÇÃO", { bg: RED, font: "900 120px Inter", h: 180 }), 2.0); S.add(bTop);
  S.hero(bal.group, "balança");
  S.label(aTop, "JUSTIÇA", { on: "balança" }); S.label(bTop, "PERSEGUIÇÃO", { on: "balança" });
  S.solid(bal.group, "balança");
  const TA = 105.5, TB = 106.7;
  const anim = (t) => {
    const tilt = 0.16 * sm(t, TA, TA + 0.4) - 0.32 * sm(t, TB, TB + 0.4) + 0.16 * sm(t, 107.3, 107.8);
    bal.setTilt(tilt + 0.02 * Math.sin(t * 2.2));
    bal.group.updateMatrixWorld(true);
    const pl = bal.panL.getWorldPosition(new V3()), pr = bal.panR.getWorldPosition(new V3());
    aTop.position.set(pl.x, pl.y + 1.75, pl.z); bTop.position.set(pr.x, pr.y + 1.75, pr.z);
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 102.7, 0.4)) * (1 + 0.12 * (t > TA && t < TA + 0.5 ? 1 : 0)));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 102.9, 0.4)) * (1 + 0.12 * (t > TB && t < TB + 0.5 ? 1 : 0)));
  };
  const box = envelope([bal.group, aTop, bTop], anim, 102.5, 110.0);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.35, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.1, 0.3, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > TB ? RED : t > TA ? GOLD : ORANGE); fill.position.set(t > TB ? 1.6 : t > TA ? -1.6 : 0, 2.4, 1.8); fill.intensity = 4;
    CAM.apply(CAM.blend(P0, P1, sm(t, 102.5, 110.0)));
  };
});
