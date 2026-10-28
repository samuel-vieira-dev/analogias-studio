// ============================================================================
// videos/2026-10-28-trajetoria-lula/scenes.js
// 3D scenes synced to audio/words.json (narration 0–117.3 s, video 119.3 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage" whenever the headline band has text at that moment, "stage-tall" otherwise
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery only: no party logos, no real brands. Lula is a stylised 3D figure (makeLula), never a photo edit.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const WOOD = "#8a5a3a", DARKWOOD = "#5a3a26", STEEL = "#8b9196", GREY = "#6d6763";

// Shoeshine box: wooden box with a slanted foot rest and two brushes. Origin: floor, centre.
function makeShoeBox() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(rbox(1.3, 0.62, 0.8, 0.04), mat(WOOD, { roughness: 0.8 })); box.position.y = 0.31; g.add(box);
  const rest = new THREE.Mesh(rbox(0.5, 0.08, 0.7, 0.02), mat(DARKWOOD, { roughness: 0.8 })); rest.position.set(0, 0.78, 0); rest.rotation.z = -0.25; g.add(rest);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), mat(DARKWOOD)); post.position.set(0, 0.69, 0); g.add(post);
  for (const [x, c] of [[-0.42, "#2a1a12"], [0.42, "#3a2a1e"]]) {
    const b = new THREE.Mesh(rbox(0.32, 0.1, 0.16, 0.03), mat(c)); b.position.set(x, 0.67, 0.12); g.add(b);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.13), mat("#141414", { roughness: 1 })); br.position.set(x, 0.6, 0.12); g.add(br);
  }
  const plate = makePlate("ENGRAXATE", 1.16, 0.28, { bg: "#f4e8da", fg: "#3a2416" }); plate.position.set(0, 0.32, 0.416); g.add(plate);
  g.add(contactShadow(2, 1.4)); return g;
}
// Lectern with microphones (generic). Origin: floor, centre.
function makeLectern(front = "") {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(1.2, 1.5, 0.7, 0.05), mat("#3a2a20", { roughness: 0.6 })); body.position.y = 0.75; g.add(body);
  const top = new THREE.Mesh(rbox(1.36, 0.08, 0.86, 0.03), mat("#4a3628")); top.position.y = 1.54; top.rotation.x = -0.12; g.add(top);
  for (const x of [-0.18, 0.18]) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8), mat("#222", { metalness: 0.6, roughness: 0.3 }));
    stem.position.set(x, 1.83, 0.1); stem.rotation.x = 0.35; stem.rotation.z = -x; g.add(stem);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat("#1a1a1a", { roughness: 0.4 })); head.position.set(x * 1.6, 2.05, 0.2); g.add(head);
  }
  if (front) { const p = makePlate(front, 0.9, 0.3, { bg: ORANGE, fg: "#ffffff" }); p.position.set(0, 0.95, 0.366); g.add(p); }
  g.add(contactShadow(1.8, 1.3)); return g;
}
// Mechanical press: base, two columns, crown and a ram (move ram.position.y). Origin: floor.
function makePress() {
  const g = new THREE.Group(), steel = mat("#4a5560", { metalness: 0.5, roughness: 0.45 }), dark = mat("#2a2f35", { metalness: 0.4, roughness: 0.5 });
  const base = new THREE.Mesh(rbox(2.0, 0.9, 1.3, 0.05), dark); base.position.y = 0.45; g.add(base);
  const bed = new THREE.Mesh(rbox(1.4, 0.1, 1.0, 0.02), steel); bed.position.y = 0.95; g.add(bed);
  for (const x of [-0.85, 0.85]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 2.4, 20), steel); c.position.set(x, 2.1, 0); g.add(c); }
  const crown = new THREE.Mesh(rbox(2.1, 0.55, 1.1, 0.05), mat("#c9a227", { metalness: 0.3, roughness: 0.5 })); crown.position.y = 3.45; g.add(crown);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.18), new THREE.MeshStandardMaterial({ map: stripesTex(), roughness: 0.6 })); stripe.position.set(0, 3.45, 0.556); g.add(stripe);
  const ram = new THREE.Group(); ram.position.y = 2.6; g.add(ram);
  const rb = new THREE.Mesh(rbox(1.3, 0.4, 0.9, 0.04), steel); ram.add(rb);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16), dark); rod.position.y = 0.5; ram.add(rod);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: "#5a1410", toneMapped: false })); lamp.position.set(0.85, 3.85, 0.3); g.add(lamp);
  g.add(contactShadow(3, 2.2));
  return { group: g, ram, lamp, bedTop: 1.0 };
}
// Work glove lying flat, palm down, with four fingers (thumb + three) — the missing little finger is the point.
function makeGlove(color = "#c98a3a") {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.9 });
  const palm = new THREE.Mesh(rbox(0.5, 0.1, 0.55, 0.04), m); palm.position.y = 0.05; g.add(palm);
  const cuff = new THREE.Mesh(rbox(0.56, 0.12, 0.25, 0.04), mat("#8a5a22", { roughness: 0.9 })); cuff.position.set(0, 0.06, 0.38); g.add(cuff);
  [[-0.17, 0.3], [-0.055, 0.36], [0.06, 0.33]].forEach(([x, l]) => {
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, l, 6, 10), m); f.rotation.x = Math.PI / 2; f.position.set(x, 0.05, -0.27 - l / 2); g.add(f);
  });
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 10), m); th.rotation.set(Math.PI / 2, 0, -0.9); th.position.set(-0.33, 0.05, -0.05); g.add(th);
  const stub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), m); stub.scale.set(1, 1, 0.5); stub.position.set(0.18, 0.05, -0.28); g.add(stub);
  return g;
}
// Round wall clock showing ~3 h (decoration on a back wall).
function makeClock() {
  const c = makeCanvas(256, 256), x = c.getContext("2d");
  x.fillStyle = "#f4e8da"; x.beginPath(); x.arc(128, 128, 120, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#3a2a20"; x.lineWidth = 10; x.stroke();
  x.fillStyle = "#3a2a20"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.fillRect(128 + Math.sin(a) * 96 - 4, 128 - Math.cos(a) * 96 - 4, 8, 8); }
  x.lineCap = "round"; x.lineWidth = 12; x.beginPath(); x.moveTo(128, 128); x.lineTo(196, 128); x.stroke();
  x.lineWidth = 7; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 40); x.stroke();
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.45, 48), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false }));
  return m;
}
// Pau-de-arara truck: cab + open bed with wooden benches and a canvas-frame. Faces +x. Origin: floor.
function makeTruck() {
  const g = new THREE.Group();
  const cab = new THREE.Mesh(rbox(0.9, 0.95, 1.1, 0.08), mat("#2f6b8a")); cab.position.set(1.15, 0.75, 0); g.add(cab);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.35), mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 })); win.position.set(1.15, 0.98, 0.556); g.add(win);
  const bed = new THREE.Mesh(rbox(2.0, 0.5, 1.2, 0.04), mat(WOOD, { roughness: 0.85 })); bed.position.set(-0.3, 0.55, 0); g.add(bed);
  for (const z of [-0.35, 0.35]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.18), mat(DARKWOOD)); b.position.set(-0.3, 0.9, z); g.add(b); }
  for (const x of [-1.2, -0.3, 0.6]) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 24, Math.PI), mat("#3a2a20")); arch.position.set(x, 0.8, 0); arch.rotation.y = Math.PI / 2; g.add(arch);
  }
  for (const [x, z] of [[1.2, 0.5], [1.2, -0.5], [-0.9, 0.5], [-0.9, -0.5]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 20), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z * 1.15); g.add(w);
  }
  const p = makePlate("1952", 0.7, 0.26, { bg: "#f4e8da", fg: "#141414" }); p.position.set(-0.3, 0.55, 0.616); g.add(p);
  g.add(contactShadow(3.4, 2)); return g;
}
// Small union hall with a printed sign. Origin: floor, centre.
function makeHall(sign, year) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(2.2, 1.6, 1.4, 0.04), mat("#d9cbb8", { roughness: 0.9 })); body.position.y = 0.8; g.add(body);
  const roof = new THREE.Mesh(rbox(2.4, 0.14, 1.6, 0.03), mat("#5a4434")); roof.position.y = 1.67; g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.04), mat("#5a3a26")); door.position.set(0, 0.43, 0.715); g.add(door);
  const p = makePlate(sign, 1.9, 0.34, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 1.3, 0.716); g.add(p);
  const y = makePlate(year, 0.6, 0.24, { bg: ORANGE, fg: "#ffffff" }); y.position.set(0.75, 0.55, 0.716); g.add(y);
  g.add(contactShadow(3, 2.2)); return g;
}
// Banner on two poles (for the strike crowd). Origin: floor, centre.
function makeBanner(text, w = 2.6) {
  const g = new THREE.Group();
  for (const x of [-w / 2, w / 2]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 10), mat("#6a4a30")); p.position.set(x, 1.1, 0); g.add(p); }
  const cloth = makePlate(text, w, 0.6, { bg: "#f4e8da", fg: RED }); cloth.position.set(0, 1.75, 0.02); g.add(cloth);
  return g;
}
// Prison door: a frame (fixed) and a bar gate in front of it that slides to the right. Origin: floor.
function makeCell(sign) {
  const g = new THREE.Group(), iron = mat("#3a3f45", { metalness: 0.6, roughness: 0.4 });
  const wall = new THREE.Mesh(rbox(3.4, 2.8, 0.3, 0.03), mat("#4a3a30", { roughness: 0.95 })); wall.position.set(0, 1.4, -0.3); g.add(wall);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), new THREE.MeshBasicMaterial({ color: "#0b0705" })); hole.position.set(0, 1.05, -0.14); hole.userData.decor = true; g.add(hole);
  const lintel = makePlate(sign, 1.7, 0.34, { bg: "#141414", fg: "#f4e8da" }); lintel.position.set(0, 2.35, -0.13); g.add(lintel);
  const gate = new THREE.Group(); gate.position.set(0, 0, 0.05); g.add(gate);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 10), iron); b.position.set(-0.6 + i * 0.2, 1.05, 0); gate.add(b); }
  for (const y of [0.1, 1.05, 2.0]) { const r = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.07), iron); r.position.set(0, y, 0); gate.add(r); }
  g.add(contactShadow(3.6, 1.6)); return { group: g, gate, wall };
}
// Five-pointed star, extruded, standing up, with a printed label. Origin: floor under it.
function makeStar(label, color = RED, r = 0.75) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }); geo.translate(0, 0, -0.09);
  const g = new THREE.Group(); const m = new THREE.Mesh(geo, mat(color, { roughness: 0.45 })); m.position.y = r + 0.05; g.add(m);
  const p = makePlate(label, 0.5, 0.24, { bg: null, fg: "#ffffff" }); p.position.set(0, r + 0.02, 0.15); g.add(p);
  g.add(contactShadow(1.4, 1)); return g;
}
// Ballot box with its year printed on the front and a mark plate (X or check) that can pop on top of the label.
function makeYearUrn(year) {
  const urn = makeBallotBox(); urn.userData.ballot.visible = false;
  const p = makePlate(year, 1.04, 0.44, { bg: "#3a3330", fg: "#ffffff" }); p.position.set(0, 0.5, 0.47); urn.add(p);
  const glowMat = new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false, transparent: true, opacity: 0 });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.92), glowMat); glow.position.set(0, 0.5, 0.458); glow.userData.decor = true; urn.add(glow);
  const x = makePlate("✕", 0.42, 0.42, { bg: null, fg: "#9a948e", font: "900 200px Inter" }); x.position.set(0, 1.22, 0); x.visible = false; urn.add(x);
  return { group: urn, glow: glowMat, x };
}
// Benefit card (flat-ish card standing on an edge). Origin: floor.
function makeCard(text, color) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(rbox(1.3, 0.82, 0.06, 0.06), mat(color, { roughness: 0.4 })); c.position.y = 0.43; g.add(c);
  const chip = new THREE.Mesh(rbox(0.2, 0.15, 0.02, 0.02), mat("#d9b56a", { metalness: 0.6, roughness: 0.3 })); chip.position.set(-0.4, 0.52, 0.035); g.add(chip);
  const p = makePlate(text, 1.1, 0.22, { bg: null, fg: "#ffffff" }); p.position.set(0, 0.24, 0.036); g.add(p);
  g.add(contactShadow(1.6, 0.8)); return g;
}
// Up arrow on a pedestal (salary above inflation). Origin: floor.
function makeUpArrow(color = GREEN) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.45 });
  const shaft = new THREE.Mesh(rbox(0.3, 0.8, 0.3, 0.04), m); shaft.position.y = 0.4; g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 4), m); head.rotation.y = Math.PI / 4; head.position.y = 1.05; g.add(head);
  g.add(contactShadow(1, 1)); return g;
}
// Ledger slab lying flat with a printed title (the FMI bill). Origin: floor. API { group, top }.
function makeLedger(text, { w = 1.8, d = 1.2, t = 0.12 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(rbox(w, t, d, 0.03), mat("#f4e8da", { roughness: 0.9 })); s.position.y = t / 2; g.add(s);
  const p = makePlate(text, w * 0.7, 0.3, { bg: "#141414", fg: "#ffffff" }); p.rotation.x = -Math.PI / 2; p.position.set(0, t + 0.016, -d * 0.22); g.add(p);
  g.add(contactShadow(w + 0.6, d + 0.6)); return { group: g, top: t };
}
// Thermometer-like gauge: glass tube with a fill (setLevel 0..1) and a printed label. Origin: floor.
function makeGauge(label) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.2, 0.4, 0.9, 0.05), mat("#3a2a20")); base.position.y = 0.2; g.add(base);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.6, 32, 1, true), new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.18, roughness: 0.1 })); tube.position.y = 1.7; g.add(tube);
  const fillM = mat(GREEN, { emissive: GREEN, emissiveIntensity: 0.25 });
  const fillMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1, 24).translate(0, 0.5, 0), fillM); fillMesh.position.y = 0.4; g.add(fillMesh);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.18 })); cap.position.y = 3.0; g.add(cap);
  const p = makePlate(label, 1.12, 0.32, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.2, 0.466); g.add(p);
  g.add(contactShadow(1.4, 1.4));
  return { group: g, setLevel: (k) => { fillMesh.scale.y = Math.max(0.001, 2.6 * k); }, mat: fillM };
}
// Suitcase (closed) with a handle. Origin: floor.
function makeSuitcase(label) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(1.5, 1.0, 0.45, 0.07), mat("#3a2a20", { roughness: 0.6 })); b.position.y = 0.5; g.add(b);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 20, Math.PI), mat("#141414")); h.position.y = 1.0; g.add(h);
  const p = makePlate(label, 1.1, 0.26, { bg: "#d9b56a", fg: "#141414" }); p.position.set(0, 0.55, 0.24); g.add(p);
  g.add(contactShadow(2, 1)); return g;
}
// Generic 3-storey building with a printed sign. Origin: floor.
function makeBuilding(sign) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(rbox(1.8, 0.78, 1.4, 0.03), mat(i % 2 ? "#cfc2b0" : "#e0d4c2", { roughness: 0.9 })); f.position.y = 0.4 + i * 0.8; g.add(f);
    for (const x of [-0.5, 0, 0.5]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.36), mat("#6f8ea0", { roughness: 0.2, metalness: 0.3 })); w.position.set(x, 0.42 + i * 0.8, 0.705); g.add(w); }
  }
  const roof = new THREE.Mesh(rbox(1.9, 0.12, 1.5, 0.03), mat("#5a4434")); roof.position.y = 2.46; g.add(roof);
  const p = makePlate(sign, 1.3, 0.34, { bg: RED, fg: "#ffffff" }); p.position.set(0, 2.75, 0); g.add(p);
  g.add(contactShadow(2.6, 2.2)); return g;
}
// Wall panel with a live counter. API { group, set(n) }.
function makeCounter(suffix) {
  const g = new THREE.Group();
  const c = makeCanvas(768, 320), x = c.getContext("2d"), tex = texFrom(c);
  const side = mat("#141414");
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.84, 0.08), [side, side, side, side, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), side]); panel.position.y = 1.4; g.add(panel);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.98, 0.12), mat("#3a3330")); stand.position.y = 0.49; g.add(stand);
  const foot = new THREE.Mesh(rbox(0.9, 0.08, 0.6, 0.03), mat("#3a3330")); foot.position.y = 0.04; g.add(foot);
  let cur = -1;
  function set(n) {
    n = Math.round(n); if (n === cur) return; cur = n;
    x.fillStyle = "#141414"; x.fillRect(0, 0, 768, 320);
    x.fillStyle = "#ffffff"; x.font = "900 190px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(n), 330, 168);
    x.fillStyle = ORANGE; x.font = "900 80px Inter"; x.fillText(suffix, 640, 190); tex.needsUpdate = true;
  }
  set(0); g.add(contactShadow(1.2, 1)); return { group: g, set };
}
// Exam paper lying flat (on a desk slab), with a red grade circle that can be erased (set grade opacity).
function makeExam() {
  const g = new THREE.Group();
  const desk = new THREE.Mesh(rbox(2.6, 0.14, 1.8, 0.03), mat("#6a4a30", { roughness: 0.8 })); desk.position.y = 0.07; g.add(desk);
  const c = makeCanvas(512, 680), x = c.getContext("2d");
  x.fillStyle = "#fbf7ef"; x.fillRect(0, 0, 512, 680);
  x.fillStyle = "#141414"; x.font = "900 54px Inter"; x.fillText("PROVA", 40, 80);
  x.fillStyle = "#b9b2a8"; for (let i = 0; i < 9; i++) x.fillRect(40, 150 + i * 56, i % 3 === 2 ? 260 : 420, 14);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 1.6), [mat("#fbf7ef"), mat("#fbf7ef"), new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.9 }), mat("#fbf7ef"), mat("#fbf7ef"), mat("#fbf7ef")]);
  paper.position.y = 0.15; paper.rotation.y = 0.06; g.add(paper);
  const gc = makeCanvas(256, 256), gx = gc.getContext("2d");
  gx.strokeStyle = RED; gx.lineWidth = 14; gx.beginPath(); gx.arc(128, 128, 104, 0, Math.PI * 2); gx.stroke();
  gx.fillStyle = RED; gx.font = "900 120px Inter"; gx.textAlign = "center"; gx.textBaseline = "middle"; gx.fillText("8,5", 128, 136);
  const gradeMat = new THREE.MeshBasicMaterial({ map: texFrom(gc), transparent: true, toneMapped: false, depthWrite: false });
  const grade = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), gradeMat); grade.rotation.x = -Math.PI / 2; grade.position.set(0.3, 0.162, -0.48); grade.userData.decor = true; g.add(grade);
  return { group: g, gradeMat, top: 0.16 };
}
// Eraser block. Origin: bottom centre.
function makeEraser() {
  const g = new THREE.Group();
  const a = new THREE.Mesh(rbox(0.5, 0.16, 0.26, 0.04), mat("#f2b8c6", { roughness: 0.9 })); a.position.y = 0.08; g.add(a);
  const b = new THREE.Mesh(rbox(0.3, 0.165, 0.27, 0.04), mat("#3a6aa8", { roughness: 0.7 })); b.position.set(0.1, 0.085, 0); g.add(b);
  return g;
}
// Picture frame standing on a little easel, the name printed on the "photo" area (no faces).
function makeFrame(lines, color = "#3a3330") {
  const g = new THREE.Group();
  const fr = new THREE.Mesh(rbox(1.25, 1.5, 0.1, 0.03), mat(color, { roughness: 0.5 })); fr.position.y = 0.85; fr.rotation.x = -0.1; g.add(fr);
  const inner = new THREE.Group(); inner.position.set(0, 0.85, 0.055); inner.rotation.x = -0.1; g.add(inner);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25), mat("#e9e3d8", { roughness: 0.9 })); inner.add(bg);
  lines.forEach(([t, fg, h], i) => { const p = makePlate(t, 0.92, h, { bg: null, fg }); p.position.set(0, 0.3 - i * 0.36, 0.005); p.scale.z = 0.2; inner.add(p); });
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.06), mat(color)); leg.position.set(0, 0.5, -0.35); leg.rotation.x = 0.35; g.add(leg);
  g.add(contactShadow(1.5, 1)); return g;
}

// Stylised Lula (illustration, not a likeness of a photo): stocky build, round face, full trimmed
// beard, short hair receding at the front, thick brows, wide nose. Hair/beard colour follow the era.
// Origin: floor, centre, facing +z, ~1.85 tall. API { group, armR, armL, head, pose(t) }
//   pose(t): idle breathing + head sway; set armR.rotation.z / armL.rotation.z to gesture.
const LULA_ERAS = {
  "1978": { hair: "#2a211b", beard: "#1f1914", brows: "#1a1410", top: "#b9c4cc", tie: null, jacket: null },
  "1980": { hair: "#2e251e", beard: "#231c16", brows: "#1a1410", top: "#8a7a62", tie: null, jacket: null },
  "2005": { hair: "#9a948d", beard: "#87817a", brows: "#3e3732", top: "#ffffff", tie: "#8a1f24", jacket: "#34405e" },
  "hoje": { hair: "#ebe7e1", beard: "#f2efea", brows: "#8f8780", top: "#cfd9ec", tie: "#7a1d22", jacket: "#3a4870" },
};
function makeLula(era = "hoje") {
  const E = LULA_ERAS[era], SKIN = "#d6a07c", g = new THREE.Group();
  const skin = mat(SKIN, { roughness: 0.6 }), hairM = mat(E.hair, { roughness: 0.9 }), beardM = mat(E.beard, { roughness: 0.95 });
  const coat = mat(E.jacket || E.top, { roughness: 0.7 }), pants = mat(E.jacket || "#2a2a30", { roughness: 0.75 });
  // legs and shoes
  for (const x of [-0.14, 0.14]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.62, 6, 12), pants); leg.position.set(x, 0.42, 0); g.add(leg);
    const shoe = new THREE.Mesh(rbox(0.17, 0.09, 0.3, 0.04), mat("#141414", { roughness: 0.4 })); shoe.position.set(x, 0.045, 0.05); g.add(shoe);
  }
  // torso: a wide, slightly round trunk (he is stocky), shirt opening and tie in front
  const body = new THREE.Group(); body.position.y = 0.82; g.add(body);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.66, 28), coat); trunk.scale.z = 0.78; trunk.position.y = 0.33; body.add(trunk);
  const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.36, 6, 16), coat); sh.rotation.z = Math.PI / 2; sh.scale.z = 0.95; sh.position.y = 0.62; body.add(sh);
  if (E.jacket) {
    const v = new THREE.Shape(); v.moveTo(-0.11, 0.66); v.lineTo(0.11, 0.66); v.lineTo(0, 0.3); v.lineTo(-0.11, 0.66);
    const shirt = new THREE.Mesh(new THREE.ShapeGeometry(v), mat(E.top, { roughness: 0.6 })); shirt.position.z = 0.236; body.add(shirt);
    if (E.tie) { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.012), mat(E.tie, { roughness: 0.5 })); tie.position.set(0, 0.5, 0.24); body.add(tie); }
  } else {
    const coll = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 20, Math.PI), mat(E.top, { roughness: 0.7 })); coll.rotation.set(Math.PI / 2 + 0.4, 0, Math.PI); coll.position.set(0, 0.68, 0.05); body.add(coll);
  }
  // arms: pivots at the shoulders, rotate .z to raise (armR negative = up and out to his left of screen)
  const mkArm = (side) => {
    const a = new THREE.Group(); a.position.set(0.36 * side, 0.6, 0); body.add(a);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.46, 6, 12), coat); up.position.y = -0.3; a.add(up);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12), skin); hand.scale.set(0.9, 1.15, 0.7); hand.position.y = -0.62; a.add(hand);
    a.rotation.z = 0.12 * side; return a;
  };
  const armR = mkArm(-1), armL = mkArm(1);
  // neck and head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 16), skin); neck.position.y = 1.55; g.add(neck);
  const head = new THREE.Group(); head.position.y = 1.78; g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), skin); skull.scale.set(1, 1.05, 0.98); head.add(skull);
  // full, trimmed beard: the lower part of a slightly larger sphere, from sideburn to chin
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.232, 32, 16, -Math.PI * 0.05, Math.PI * 1.1, Math.PI * 0.53, Math.PI * 0.4), beardM);
  beard.scale.set(1.03, 1.08, 1.06); beard.position.set(0, -0.005, 0.012); head.add(beard);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), beardM); chin.scale.set(1.2, 0.7, 0.8); chin.position.set(0, -0.165, 0.115); head.add(chin);
  const must = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.1, 6, 10), beardM); must.rotation.z = Math.PI / 2; must.position.set(0, -0.068, 0.228); head.add(must);
  // his wide smile: an upturned arc just in front of the beard
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.009, 8, 20, Math.PI), mat("#5a2a22", { roughness: 0.5 })); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.085, 0.236); head.add(mouth);
  // short hair on the back and sides, receding at the front (top of the forehead shows)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.228, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM);
  hair.scale.set(1.03, 0.92, 1.02); hair.rotation.x = -0.85; hair.position.set(0, 0.02, -0.02); head.add(hair);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 10), hairM); side.scale.set(0.5, 1.1, 1.2); side.position.set(0.205 * s, 0.03, -0.04); head.add(side);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), skin); ear.scale.set(0.45, 1, 0.75); ear.position.set(0.222 * s, -0.01, 0); head.add(ear);
    const brow = new THREE.Mesh(rbox(0.085, 0.028, 0.03, 0.012), mat(E.brows, { roughness: 0.9 })); brow.position.set(0.07 * s, 0.075, 0.2); brow.rotation.z = -0.12 * s; head.add(brow);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 10), mat("#1d1410", { roughness: 0.3 })); eye.scale.set(1.2, 0.75, 0.6); eye.position.set(0.068 * s, 0.035, 0.205); head.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat("#cc9472", { roughness: 0.6 })); nose.scale.set(1.25, 1, 1); nose.position.set(0, -0.02, 0.222); head.add(nose);
  g.add(contactShadow(1.1, 0.9));
  const pose = (t) => { body.scale.y = 1 + 0.012 * Math.sin(t * 2.4); head.rotation.y = 0.12 * Math.sin(t * 0.9); head.rotation.z = 0.03 * Math.sin(t * 1.3); };
  return { group: g, armR, armL, head, pose };
}
// Waving / pointing gestures on a makeLula arm (k 0..1 how far up, t drives the wave).
function wave(arm, k, t, side = -1) { arm.rotation.z = side * (0.12 + 2.5 * k) + side * 0.18 * k * Math.sin(t * 7); arm.rotation.x = -0.15 * k; }
function point(arm, k, t, side = -1) { arm.rotation.x = -1.35 * k + 0.08 * k * Math.sin(t * 5); arm.rotation.z = side * (0.12 + 0.25 * k); }

// ---------------------------------------------------------------- 1. gancho: do engraxate ao púlpito (0 – 5.04)
// "Como um engraxate de Pernambuco virou o político mais polêmico do Brasil?"
addScene("gancho", 0, 5.04, (S) => {
  const box = makeShoeBox(); box.position.set(-1.25, 0, 0.2); box.scale.setScalar(1.2); S.add(box);
  const lec = makeLectern(); lec.position.set(0.55, 0, -0.1); lec.scale.setScalar(0.85); S.add(lec);
  const lula = makeLula("hoje"); lula.group.position.set(2.0, 0, 0); S.add(lula.group);
  const q = makePlate("?", 0.5, 0.6, { bg: RED, fg: "#ffffff" }); q.position.set(1.2, 2.3, -0.1); S.add(q);
  S.hero(box, "caixa de engraxate");
  S.hero(lec, "púlpito", { when: (t) => t > 2.6 }); S.hero(lula.group, "Lula no púlpito", { when: (t) => t > 2.6 });
  S.solid(box, "caixa"); S.solid(lec, "púlpito"); S.solid(lula.group, "Lula");
  const anim = (t) => {
    popIn(lec, t, 2.04, 0.45); popIn(lula.group, t, 2.2, 0.45); popIn(q, t, 3.47, 0.35);
    lula.pose(t); wave(lula.armL, sm(t, 2.7, 3.1) * (1 - sm(t, 4.4, 4.9)), t, 1);
  };
  const A0 = CAM.pose(envelope([box], anim, 0, 2.0), { zone: "stage", from: [-0.3, 0.4, 1], pull: 1.08 });
  const A1 = CAM.pose(envelope([box], anim, 0, 2.0), { zone: "stage", from: [-0.12, 0.36, 1], pull: 1.02 });
  const B0 = CAM.pose(envelope([box, lec, lula.group, q], anim, 2.0, 5.04), { zone: "stage", from: [0.05, 0.32, 1], pull: 1.1 });
  const B1 = CAM.pose(envelope([box, lec, lula.group, q], anim, 2.0, 5.04), { zone: "stage", from: [0.2, 0.3, 1], pull: 1.04 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(1.3, 2.2, 1.6); fill.intensity = 5 * sm(t, 2.1, 2.6);
    CAM.apply(CAM.track(t, [[0, A0], [1.8, A1, 1.8], [2.7, B0, 0.9], [5.04, B1, 2.3]]));
  };
});

// ---------------------------------------------------------------- 2. a prensa, 1964, madrugada (5.04 – 16.28)
// "Imagina: 1964, madrugada. Você tem dezenove anos e opera uma prensa numa metalúrgica.
//  A máquina desce... e o seu dedo mínimo fica lá."
addScene("prensa", 5.04, 16.28, (S) => {
  const pr = makePress(); S.add(pr.group);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), mat("#1e1510", { roughness: 1 })); wall.position.set(0, 2.5, -1.6); wall.userData.decor = true; S.add(wall);
  const clock = makeClock(); clock.position.set(-1.9, 3.3, -1.58); clock.userData.decor = true; S.add(clock);
  const bench = new THREE.Mesh(rbox(1.4, 0.7, 0.9, 0.03), mat("#3a2a20", { roughness: 0.8 })); bench.position.set(2.1, 0.35, 0.3); S.add(bench);
  const glove = makeGlove(); glove.position.set(2.1, 0.7, 0.3); glove.rotation.y = -0.5; glove.scale.setScalar(1.5); S.add(glove);
  S.hero(pr.group, "prensa");
  S.hero(glove, "luva", { when: (t) => t > 14.9 });
  S.solid(bench, "bancada"); S.solid(glove, "luva", { restsOn: ["bancada"] });
  const anim = (t) => {
    // the press works in slow strokes through the night, then the stroke that takes the finger
    const idle = t < 12.6 ? 0.22 * (0.5 - 0.5 * Math.cos((t - 5.04) * Math.PI / 1.4)) * (1 - sm(t, 12.0, 12.6)) : 0;
    const down = eOut(lin(t, 13.06, 13.3)), up = sm(t, 13.9, 14.6);
    pr.ram.position.y = 2.6 - idle - 1.38 * down * (1 - up);
    popIn(glove, t, 14.43, 0.4, 1.5);
  };
  const A0 = CAM.pose(envelope([pr.group], anim, 5.04, 12.5), { zone: "stage", from: [-0.45, 0.32, 1], pull: 1.14 });
  const A1 = CAM.pose(envelope([pr.group], anim, 5.04, 12.5), { zone: "stage", from: [-0.1, 0.24, 1], pull: 1.02 });
  const B0 = CAM.pose(envelope([pr.group, bench, glove], anim, 12.5, 16.28), { zone: "stage", from: [0.2, 0.4, 1], pull: 1.08 });
  const B1 = CAM.pose(envelope([pr.group, bench, glove], anim, 12.5, 16.28), { zone: "stage", from: [0.35, 0.45, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    const hit = t > 13.3 ? 1 - lin(t, 13.3, 14.4) : 0;
    const blink = t > 13.3 && t < 15.8 ? (Math.sin((t - 13.3) * 18) > 0 ? 1 : 0.2) : 0;
    pr.lamp.material.color.set(blink > 0.5 ? "#ff2a1a" : "#5a1410");
    fill.color.set(RED); fill.position.set(0.85, 3.6, 1.2); fill.intensity = 6 * blink + 3 * hit;
    key.color.set("#c9d3ea"); key.intensity = 3.0; hemi.intensity = 1.5;
    CAM.apply(CAM.shake(CAM.track(t, [[5.04, A0], [11.8, A1, 6.7], [12.6, B0, 0.8], [16.28, B1, 3.0]]), t, 13.3, 0.06, 0.5));
  };
});

// ---------------------------------------------------------------- 3. trajetória: Lula, pau de arara, sindicato, greves (16.28 – 33.56)
// "Esse é Luiz Inácio Lula da Silva. Chegou de pau de arara em 1952. Em 1975, já presidia o sindicato
//  dos metalúrgicos. Em 1978, as greves do ABC levam o rosto dele pro país inteiro."
addScene("trajetoria", 16.28, 33.56, (S) => {
  const lula = makeLula("hoje"); lula.group.position.set(-5, 0, 0); S.add(lula.group);
  const truck = makeTruck(); truck.position.set(0, 0, 0); S.add(truck);
  const hall = makeHall("SINDICATO DOS METALÚRGICOS", "1975"); hall.position.set(6, 0, 0); S.add(hall);
  const crowd = makeCrowd({ rows: 5, cols: 11, seed: 7 }); crowd.group.position.set(12, 0, 0.6); S.add(crowd.group);
  const banner = makeBanner("GREVE · 1978"); banner.position.set(11.1, 0, -0.9); S.add(banner);
  // 1978: the young union leader (dark hair and beard) on a box beside the banner
  const podium = new THREE.Mesh(rbox(0.9, 0.6, 0.8, 0.03), mat(WOOD, { roughness: 0.85 })); podium.position.set(13.9, 0.3, -0.95); S.add(podium);
  const young = makeLula("1978"); young.group.position.set(13.9, 0.6, -0.95); S.add(young.group);
  const YS = 1.25;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(26, 0.12), new THREE.MeshBasicMaterial({ color: "#5a4434" })); road.rotation.x = -Math.PI / 2; road.position.set(4, 0.006, 1.6); road.userData.decor = true; S.add(road);
  S.hero(lula.group, "Lula hoje", { when: (t) => t < 18.9 });
  S.hero(truck, "caminhão", { when: (t) => t > 19.8 && t < 22.2 });
  S.hero(hall, "sindicato", { when: (t) => t > 23.0 && t < 27.4 });
  S.hero(banner, "faixa", { when: (t) => t > 28.4 }); S.hero(young.group, "Lula 1978", { when: (t) => t > 28.4 });
  S.scenery(crowd.group, "multidão", { when: (t) => t > 28.6 });
  S.solid(lula.group, "Lula"); S.solid(truck, "caminhão"); S.solid(hall, "sindicato"); S.solid(banner, "faixa");
  S.solid(podium, "caixote"); S.solid(young.group, "Lula 1978", { restsOn: ["caixote"] });
  const anim = (t) => {
    lula.pose(t); wave(lula.armR, sm(t, 16.6, 17.1) * (1 - sm(t, 18.8, 19.3)), t);
    truck.position.x = lerp(-1.4, 0, eOut(lin(t, 19.2, 20.9)));
    popIn(hall, t, 22.1, 0.45);
    crowd.reveal(lin(t, 27.7, 29.4));
    popIn(banner, t, 27.9, 0.45); popIn(podium, t, 28.1, 0.4); popIn(young.group, t, 28.25, 0.45, YS);
    young.pose(t + 3); wave(young.armR, sm(t, 29.75, 30.2), t);
  };
  const shot = (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.25, 0.35, 1], pull: 1.1 }, o));
  const L0 = shot([lula.group], 16.28, 19.4, { from: [-0.25, 0.25, 1], pull: 1.08 }), L1 = shot([lula.group], 16.28, 19.4, { from: [0.05, 0.2, 1], pull: 1.02 });
  const A0 = shot([truck], 19.8, 22.2, { pull: 1.14 }), A1 = shot([truck], 19.8, 22.2, { from: [0.4, 0.3, 1], pull: 1.06 });
  const B0 = shot([hall], 22.4, 27.4, { from: [-0.25, 0.3, 1], pull: 1.12 }), B1 = shot([hall], 22.4, 27.4, { from: [0.05, 0.26, 1], pull: 1.04 });
  const strike = [crowd.group, banner, podium, young.group];
  const C0 = shot(strike, 27.4, 33.56, { from: [0.0, 0.5, 1], pull: 1.1 }), C1 = shot(strike, 27.4, 33.56, { from: [0.2, 0.42, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    CAM.apply(CAM.track(t, [[16.28, L0], [18.9, L1, 2.6], [19.8, A0, 0.9], [22.2, A1, 2.0], [23.0, B0, 0.8], [27.4, B1, 4.4], [28.4, C0, 1.0], [33.56, C1, 5.1]]));
  };
});

// ---------------------------------------------------------------- 4. 1980: preso pelo DOPS; funda o PT (33.56 – 39.73)
// "Em 1980, a ditadura o prende por trinta e um dias. E ele ajuda a fundar o PT."
addScene("prisao", 33.56, 39.73, (S) => {
  const cell = makeCell("DOPS · 1980"); S.add(cell.group);
  cell.gate.position.z = 0.55;
  const lula = makeLula("1980"); lula.group.position.set(0, 0, 0.12); S.add(lula.group);
  const star = makeStar("PT"); star.position.set(1.25, 0, 1.05); S.add(star);
  S.hero(cell.group, "cela"); S.hero(lula.group, "Lula preso");
  S.hero(star, "estrela", { when: (t) => t > 38.6 });
  S.solid(cell.wall, "parede"); S.solid(lula.group, "Lula"); S.solid(star, "estrela");
  const anim = (t) => {
    cell.gate.position.x = 1.4 * sm(t, 37.88, 38.4);
    lula.pose(t); point(lula.armR, sm(t, 38.3, 38.7), t);
    lula.group.position.z = 0.12 + 0.15 * sm(t, 38.0, 38.6);
    popIn(star, t, 38.22, 0.45);
  };
  const box = envelope([cell.group, lula.group, star], anim, 33.56, 39.73);
  const P0 = CAM.pose(box, { zone: "stage", from: [-0.12, 0.25, 1], pull: 1.12 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.1, 0.3, 1], pull: 1.04 });
  return (t) => {
    anim(t);
    const hit = t > 35.97 ? 1 - lin(t, 35.97, 36.9) : 0;
    fill.color.set(t < 38 ? "#9fb3d6" : RED); fill.position.set(0, 2.2, 1.8); fill.intensity = 3.5 + hit * 5 + (t > 38.3 ? 4 * (1 - lin(t, 38.3, 39.5)) : 0);
    CAM.apply(CAM.shake(CAM.blend(P0, P1, sm(t, 33.56, 39.73)), t, 35.97, 0.04, 0.4));
  };
});

// ---------------------------------------------------------------- 5. três derrotas, 2002, 2006 (39.73 – 44.61)
// "Depois de três derrotas, vira presidente em 2002. E é reeleito."
addScene("eleicoes", 39.73, 44.61, (S) => {
  const years = ["1989", "1994", "1998", "2002", "2006"];
  const urns = years.map((y, i) => { const u = makeYearUrn(y); u.group.position.set((i - 2) * 1.5 + (i > 2 ? 0.6 : 0), 0, 0); S.add(u.group); return u; });
  urns.forEach((u, i) => { S.hero(u.group, "urna " + years[i], { when: i < 3 ? (t) => t < 41.9 : (t) => t > 42.6 }); S.solid(u.group, "urna " + years[i]); });
  const anim = (t) => {
    urns.forEach((u, i) => {
      popIn(u.group, t, 39.75 + i * 0.12, 0.35);
      if (i < 3) { u.x.visible = t > 40.33 + i * 0.12; u.x.scale.setScalar(Math.max(0.0001, pop(t, 40.33 + i * 0.12, 0.3))); }
    });
    urns[3].glow.opacity = 0.55 * sm(t, 42.44, 42.8);
    urns[4].glow.opacity = 0.55 * sm(t, 43.88, 44.2);
  };
  const lost = urns.slice(0, 3).map((u) => u.group), won = urns.slice(3).map((u) => u.group);
  const A0 = CAM.pose(envelope(lost, anim, 39.73, 41.9), { zone: "stage", from: [-0.15, 0.4, 1], pull: 1.08 });
  const A1 = CAM.pose(envelope(lost, anim, 39.73, 41.9), { zone: "stage", from: [0.05, 0.36, 1], pull: 1.03 });
  const B0 = CAM.pose(envelope(won, anim, 42.0, 44.61), { zone: "stage", from: [-0.05, 0.38, 1], pull: 1.1 });
  const B1 = CAM.pose(envelope(won, anim, 42.0, 44.61), { zone: "stage", from: [0.15, 0.34, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    fill.color.set(GREEN); fill.position.set(2.6, 2.0, 1.8); fill.intensity = 5 * sm(t, 42.44, 42.9) * (1 - 0.4 * sm(t, 43.2, 43.8));
    CAM.apply(CAM.track(t, [[39.73, A0], [41.9, A1, 2.1], [42.6, B0, 0.7], [44.61, B1, 2.0]]));
  };
});

// ---------------------------------------------------------------- 6. no governo: programas, FMI, 83% (44.61 – 56.33)
// "No governo: Bolsa Família, Minha Casa Minha Vida, salário mínimo acima da inflação e a dívida com o FMI
//  paga antes do prazo. Termina com oitenta e três por cento de aprovação."
addScene("governo", 44.61, 56.33, (S) => {
  const card = makeCard("BOLSA FAMÍLIA", "#2f8a57"); card.position.set(-3.2, 0, 0); S.add(card);
  const house = makeHouse(); house.position.set(0, 0, 0); S.add(house);
  const money = makeMoneyStack("SALÁRIO"); money.position.set(3.2, 0, 0.1); S.add(money);
  const arrow = makeUpArrow(); arrow.position.set(3.2, 0.27, 0.1); S.add(arrow);
  const led = makeLedger("DÍVIDA COM O FMI"); led.group.position.set(7.5, 0, 0); S.add(led.group);
  const imprint = makePlate("QUITADA · 2005", 1.25, 0.34, { bg: GREEN, fg: "#ffffff" }); imprint.rotation.set(-Math.PI / 2, 0, 0.08); imprint.position.set(7.5, led.top + 0.016, 0.25); S.add(imprint);
  const stamp = makeStamp({ ink: GREEN }); S.add(stamp);
  const gauge = makeGauge("APROVAÇÃO"); gauge.group.position.set(11.5, 0, 0); S.add(gauge.group);
  // each hero is the subject while the camera holds on it (track keys below)
  S.hero(card, "cartão", { when: (t) => t > 44.8 && t < 46.0 });
  S.hero(house, "casa", { when: (t) => t > 46.5 && t < 47.4 });
  S.hero(money, "salário", { when: (t) => t > 47.9 && t < 49.4 });
  S.hero(led.group, "dívida", { when: (t) => t > 50.2 && t < 52.5 });
  S.hero(gauge.group, "aprovação", { when: (t) => t > 53.2 });
  S.solid(card, "cartão"); S.solid(house, "casa"); S.solid(money, "salário"); S.solid(arrow, "seta", { restsOn: ["salário"] });
  S.solid(led.group, "dívida"); S.solid(stamp, "carimbo", { restsOn: ["dívida"] }); S.solid(gauge.group, "aprovação");
  const sx = 7.55, sz = 0.25;
  const anim = (t) => {
    popIn(card, t, 44.62, 0.4); popIn(house, t, 46.3, 0.4); popIn(money, t, 47.6, 0.4);
    arrow.visible = t > 48.92; arrow.scale.setScalar(Math.max(0.0001, pop(t, 48.92, 0.4)));
    const down = eOut(lin(t, 51.4, 51.7)), up = sm(t, 52.0, 52.6);
    stamp.visible = t > 51.2 && t < 52.65;
    stamp.position.set(sx, led.top + 0.002 + 1.2 * (1 - down) + 1.2 * up, sz);
    imprint.visible = t >= 51.7;
    gauge.setLevel(0.83 * eOut(lin(t, 53.75, 55.4)));
  };
  const A1 = CAM.pose(envelope([card], anim, 44.61, 46.0), { zone: "stage", from: [-0.2, 0.3, 1], pull: 1.12 });
  const A2 = CAM.pose(envelope([house], anim, 46.5, 47.4), { zone: "stage", from: [0.15, 0.35, 1], pull: 1.12 });
  const A = CAM.pose(envelope([money, arrow], anim, 47.9, 50.0), { zone: "stage", from: [0.2, 0.3, 1], pull: 1.1 });
  const B = CAM.pose(envelope([led.group], anim, 50.0, 53.0), { zone: "stage", from: [0, 1.0, 0.75], pull: 1.1 });
  const C = CAM.pose(envelope([gauge.group], anim, 53.0, 56.33), { zone: "stage", from: [0.2, 0.25, 1], pull: 1.1 });
  const C1 = CAM.pose(envelope([gauge.group], anim, 53.0, 56.33), { zone: "stage", from: [0.05, 0.22, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    const hit = t > 51.7 ? 1 - lin(t, 51.7, 52.6) : 0;
    fill.color.set(GREEN); fill.position.set(t < 53 ? sx : 11.5, 2.2, 1.6); fill.intensity = hit * 6 + (t > 54 ? 3 : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[44.61, A1], [46.5, A2, 0.5], [47.9, A, 0.5], [50.2, B, 0.8], [53.2, C, 0.7], [56.33, C1, 3.1]]), t, 51.7, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 7. populismo ou inclusão social (56.33 – 66.65)
// "Críticos chamam de populismo: um líder carismático falando direto com os pobres, no discurso do nós
//  contra eles. Apoiadores chamam de inclusão social."
addScene("populismo", 56.33, 66.65, (S) => {
  const stage = new THREE.Group(); S.add(stage);
  const H = 1.2;
  const left = new THREE.Mesh(rbox(2.4, H, 2.0, 0.03), mat("#3a2a20")); left.position.set(-1.25, H / 2, 0); stage.add(left);
  const right = new THREE.Mesh(rbox(2.4, H, 2.0, 0.03), mat("#3a2a20")); right.position.set(1.25, H / 2, 0); stage.add(right);
  [["CRÍTICOS", "POPULISMO", ORANGE, -1.25], ["APOIADORES", "INCLUSÃO SOCIAL", GREEN, 1.25]].forEach(([a, b, c, x]) => {
    const p1 = makePlate(a, 2.2, 0.34, { bg: c, fg: "#ffffff" }); p1.position.set(x, 0.98, 1.016); stage.add(p1);
    const p2 = makePlate(b, 2.2, 0.34, { bg: c, fg: "#ffffff" }); p2.position.set(x, 0.62, 1.016); stage.add(p2);
  });
  const lec = makeLectern(); lec.position.set(-0.6, H, -0.2); S.add(lec);
  const lula = makeLula("2005"); lula.group.position.set(0.8, H, -0.35); S.add(lula.group);
  const crowd = makeCrowd({ rows: 2, cols: 9, seed: 5 }); crowd.group.position.set(0, 0, 1.75); S.add(crowd.group);
  const lL = new THREE.PointLight(ORANGE, 0, 7, 1.4); lL.position.set(-1.6, 2.8, 1.6); S.add(lL);
  const lR = new THREE.PointLight(GREEN, 0, 7, 1.4); lR.position.set(1.6, 2.8, 1.6); S.add(lR);
  S.hero(stage, "palco"); S.hero(lec, "púlpito"); S.hero(lula.group, "Lula discursando");
  S.scenery(crowd.group, "plateia", { when: (t) => t > 59.5 });
  S.solid(stage, "palco"); S.solid(lec, "púlpito", { restsOn: ["palco"] }); S.solid(lula.group, "Lula", { restsOn: ["palco"] });
  const anim = (t) => {
    crowd.reveal(lin(t, 59.7, 61.2));
    lula.pose(t);
    point(lula.armR, sm(t, 58.0, 58.5) * (1 - sm(t, 62.6, 63.1)), t);
    wave(lula.armL, sm(t, 64.0, 64.5), t, 1);
  };
  const box = envelope([stage, lec, lula.group], anim, 56.33, 66.65);
  const P0 = CAM.pose(box, { zone: "stage", from: [-0.25, 0.5, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.25, 0.48, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    const a = sm(t, 57.46, 57.9) * (1 - sm(t, 63.5, 64.0)), b = sm(t, 65.36, 65.8);
    lL.intensity = 8 * a; lR.intensity = 8 * b;
    CAM.apply(CAM.blend(P0, P1, sm(t, 56.33, 66.65)));
  };
});

// ---------------------------------------------------------------- 8. mensalão (66.65 – 73.12)
// "Em 2005, estoura o mensalão: aliados dele são condenados pelo Supremo. Ele não foi réu."
addScene("mensalao", 66.65, 73.12, (S) => {
  const bag = makeSuitcase("MENSALÃO · 2005"); bag.position.set(-4.2, 0, 0); S.add(bag);
  const f1 = makeFolder("ALIADOS", { w: 1.3, h: 1.4, color: "#d9b56a" }); f1.position.set(-0.75, 0, 0); S.add(f1);
  const f2 = makeFolder("CONDENADOS", { w: 1.3, h: 1.4, color: "#d9b56a" }); f2.position.set(0.75, 0, 0); S.add(f2);
  const lula = makeLula("2005"); lula.group.position.set(3.9, 0, 0); S.add(lula.group);
  const f3 = makeFolder("NÃO FOI RÉU", { w: 1.3, h: 1.4, color: "#b9b2a8" }); f3.position.set(5.2, 0, 0.1); S.add(f3);
  S.hero(bag, "mala", { when: (t) => t < 68.9 });
  S.hero(f1, "aliados", { when: (t) => t > 69.6 && t < 71.4 }); S.hero(f2, "condenados", { when: (t) => t > 70.9 && t < 71.4 });
  S.hero(lula.group, "Lula 2005", { when: (t) => t > 72.1 }); S.hero(f3, "não foi réu", { when: (t) => t > 72.3 });
  [[bag, "mala"], [f1, "aliados"], [f2, "condenados"], [lula.group, "Lula"], [f3, "não foi réu"]].forEach(([o, n]) => S.solid(o, n));
  const anim = (t) => {
    popIn(bag, t, 66.7, 0.4); popIn(f1, t, 69.36, 0.4); popIn(f2, t, 70.42, 0.4); popIn(f3, t, 71.94, 0.4);
    bag.rotation.z = 0.05 * Math.sin(Math.PI * lin(t, 68.39, 68.8)) * Math.sin(t * 40);
    lula.pose(t); point(lula.armL, 0.6 * sm(t, 72.2, 72.6), t, 1);
  };
  const A0 = CAM.pose(envelope([bag], anim, 66.65, 68.9), { zone: "stage", from: [-0.2, 0.3, 1], pull: 1.1 });
  const A1 = CAM.pose(envelope([bag], anim, 66.65, 68.9), { zone: "stage", from: [0.05, 0.26, 1], pull: 1.03 });
  const B0 = CAM.pose(envelope([f1, f2], anim, 69.4, 71.4), { zone: "stage", from: [-0.1, 0.3, 1], pull: 1.1 });
  const B1 = CAM.pose(envelope([f1, f2], anim, 69.4, 71.4), { zone: "stage", from: [0.12, 0.28, 1], pull: 1.03 });
  const C0 = CAM.pose(envelope([lula.group, f3], anim, 72.0, 73.12), { zone: "stage", from: [-0.1, 0.25, 1], pull: 1.08 });
  const C1 = CAM.pose(envelope([lula.group, f3], anim, 72.0, 73.12), { zone: "stage", from: [0.05, 0.22, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    const hit = t > 70.42 ? 1 - lin(t, 70.42, 71.3) : 0;
    fill.color.set(RED); fill.position.set(0.6, 2.0, 1.6); fill.intensity = hit * 6;
    CAM.apply(CAM.shake(CAM.track(t, [[66.65, A0], [68.9, A1, 2.2], [69.5, B0, 0.6], [71.4, B1, 1.9], [72.1, C0, 0.6], [73.12, C1, 1.0]]), t, 70.45, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 9. Lava Jato: triplex, 580 dias (73.12 – 79.59)
// "Depois, a Lava Jato. Condenado no caso do triplex, Lula passa quinhentos e oitenta dias preso."
addScene("lavajato", 73.12, 79.59, (S) => {
  const bld = makeBuilding("TRIPLEX"); bld.position.set(-1.4, 0, 0); S.add(bld);
  const ctr = makeCounter("DIAS"); ctr.group.position.set(1.5, 0, 0.2); S.add(ctr.group);
  S.hero(bld, "prédio"); S.hero(ctr.group, "contador", { when: (t) => t > 77.6 });
  S.solid(bld, "prédio"); S.solid(ctr.group, "contador");
  const anim = (t) => { popIn(bld, t, 73.2, 0.45); popIn(ctr.group, t, 76.82, 0.4); ctr.set(580 * eOut(lin(t, 77.46, 78.4))); };
  const box = envelope([bld, ctr.group], anim, 73.12, 79.59);
  const P0 = CAM.pose(box, { zone: "stage", from: [-0.2, 0.25, 1], pull: 1.1 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.15, 0.25, 1], pull: 1.04 });
  return (t) => {
    anim(t);
    const hit = t > 76.03 ? 1 - lin(t, 76.03, 77.0) : 0;
    fill.color.set(RED); fill.position.set(-1.4, 3.2, 1.6); fill.intensity = hit * 6;
    CAM.apply(CAM.shake(CAM.blend(P0, P1, sm(t, 73.12, 79.59)), t, 76.05, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 10. 2021: anulação; a prova do professor errado (79.59 – 95.92)
// "Em 2021, o Supremo anula as condenações: o caso estava no tribunal errado, e o juiz Moro foi considerado
//  parcial. Mas anular não é absolver. É como apagar a nota de uma prova corrigida pelo professor errado...
//  sem dizer se a resposta estava certa."
addScene("anulacao", 79.59, 95.92, (S) => {
  const led = makeLedger("CONDENAÇÕES", { w: 2.4, d: 1.6 }); S.add(led.group);
  const sub = makePlate("TRIPLEX E ATIBAIA", 1.9, 0.26, { bg: "#3a3330", fg: "#ffffff" }); sub.rotation.x = -Math.PI / 2; sub.position.set(0, led.top + 0.016, -0.06); led.group.add(sub);
  const imp = makePlate("ANULADAS · 2021", 1.6, 0.4, { bg: RED, fg: "#ffffff" }); imp.rotation.set(-Math.PI / 2, 0, -0.08); imp.position.set(0, led.top + 0.02, 0.36); S.add(imp);
  const stamp = makeStamp({ w: 1.5, d: 0.5 }); S.add(stamp);
  const exam = makeExam(); exam.group.position.set(6, 0, 0); S.add(exam.group);
  const eraser = makeEraser(); eraser.scale.setScalar(1.6); S.add(eraser);
  const wrong = makePlate("PROFESSOR ERRADO", 1.6, 0.34, { bg: RED, fg: "#ffffff" }); wrong.rotation.set(-Math.PI / 2, 0, 0.1); wrong.position.set(6 - 0.05, exam.top + 0.02, 0.4); S.add(wrong);
  const qm = makePlate("?", 0.42, 0.5, { bg: ORANGE, fg: "#ffffff" }); qm.position.set(6.3, exam.top + 0.3, -0.48); S.add(qm);
  S.hero(led.group, "condenações", { when: (t) => t < 86.8 });
  S.hero(exam.group, "prova", { when: (t) => t > 88.4 });
  S.solid(led.group, "condenações"); S.solid(stamp, "carimbo", { restsOn: ["condenações"] });
  S.solid(exam.group, "prova"); S.solid(eraser, "borracha", { restsOn: ["prova"] });
  const ex = 6.3, ez = -0.48;
  const anim = (t) => {
    const down = eOut(lin(t, 81.41, 81.7)), up = sm(t, 82.0, 82.6);
    stamp.visible = t > 81.2 && t < 82.65;
    stamp.position.set(0.05, led.top + 0.002 + 1.2 * (1 - down) + 1.2 * up, 0.36);
    imp.visible = t >= 81.7;
    // the eraser comes in, rubs over the grade, and leaves
    const inE = sm(t, 89.9, 90.3), outE = sm(t, 91.4, 91.8);
    eraser.visible = t > 89.85 && t < 91.85;
    eraser.position.set(ex + 0.12 * Math.sin((t - 90.3) * 22) * (t > 90.3 && t < 91.3 ? 1 : 0) + 1.5 * (1 - inE) + 1.5 * outE, exam.top + 0.012, ez);
    exam.gradeMat.opacity = 1 - sm(t, 90.4, 91.2);
    wrong.visible = t > 92.41; wrong.scale.setScalar(Math.max(0.0001, pop(t, 92.41, 0.35)));
    qm.visible = t > 94.46; qm.scale.setScalar(Math.max(0.0001, pop(t, 94.46, 0.35)));
  };
  const A0 = CAM.pose(envelope([led.group], anim, 79.59, 87.5), { zone: "stage", from: [-0.15, 1.0, 0.8], pull: 1.1 });
  const A1 = CAM.pose(envelope([led.group], anim, 79.59, 87.5), { zone: "stage", from: [0.15, 1.0, 0.85], pull: 1.02 });
  const B0 = CAM.pose(envelope([exam.group, qm], anim, 87.5, 95.92), { zone: "stage", from: [-0.05, 1.0, 0.7], pull: 1.1 });
  const B1 = CAM.pose(envelope([exam.group, qm], anim, 87.5, 95.92), { zone: "stage", from: [0.2, 1.0, 0.75], pull: 1.02 });
  return (t) => {
    anim(t);
    const hit = t > 81.7 ? 1 - lin(t, 81.7, 82.6) : 0;
    fill.color.set(RED); fill.position.set(t < 87.5 ? 0 : 6, 2.0, 1.4); fill.intensity = hit * 6 + (t > 92.41 ? 4 * (1 - lin(t, 92.41, 93.4)) : 0);
    CAM.apply(CAM.shake(CAM.track(t, [[79.59, A0], [86.9, A1, 7.3], [87.7, B0, 0.8], [95.92, B1, 8.2]]), t, 81.7, 0.04, 0.35));
  };
});

// ---------------------------------------------------------------- 11. relações criticadas (95.92 – 103.27)
// "No caminho, relações criticadas: Paulo Maluf, o iraniano Ahmadinejad e o venezuelano Nicolás Maduro."
addScene("relacoes", 95.92, 103.27, (S) => {
  const lula = makeLula("2005"); lula.group.position.set(-3.7, 0, 0.1); S.add(lula.group);
  const shelf = new THREE.Mesh(rbox(4.5, 0.16, 1.2, 0.03), mat("#4a3628", { roughness: 0.8 })); shelf.position.y = 0.08; S.add(shelf);
  const frames = [
    makeFrame([["PAULO MALUF", "#141414", 0.22], ["SÃO PAULO", "#6d6763", 0.16], ["2012", RED, 0.2]]),
    makeFrame([["AHMADINEJAD", "#141414", 0.22], ["IRÃ", "#6d6763", 0.16], ["2010", RED, 0.2]]),
    makeFrame([["NICOLÁS MADURO", "#141414", 0.22], ["VENEZUELA", "#6d6763", 0.16], ["2023", RED, 0.2]]),
  ];
  const names = ["maluf", "irã", "maduro"], at = [98.34, 99.96, 102.0], until = [99.6, 101.6, 999];
  frames.forEach((f, i) => { f.position.set((i - 1) * 1.42, 0.16, 0); S.add(f); S.hero(f, names[i], { when: (t) => t > at[i] + 0.3 && t < until[i] }); S.solid(f, names[i], { restsOn: ["prateleira"] }); });
  S.hero(lula.group, "Lula", { when: (t) => t < 97.6 });
  S.solid(lula.group, "Lula"); S.solid(shelf, "prateleira");
  const anim = (t) => {
    frames.forEach((f, i) => popIn(f, t, at[i], 0.4));
    lula.pose(t); point(lula.armL, 0.7 * sm(t, 96.3, 96.8), t, 1);
  };
  const P0 = CAM.pose(envelope([lula.group], anim, 95.92, 97.8), { zone: "stage", from: [-0.2, 0.3, 1], pull: 1.08 });
  const P1 = CAM.pose(envelope([lula.group], anim, 95.92, 97.8), { zone: "stage", from: [0.05, 0.28, 1], pull: 1.03 });
  const F = frames.map((f) => [
    CAM.pose(envelope([f], anim, 98.0, 103.27), { zone: "stage", from: [-0.1, 0.22, 1], pull: 1.12 }),
    CAM.pose(envelope([f], anim, 98.0, 103.27), { zone: "stage", from: [0.1, 0.2, 1], pull: 1.05 }),
  ]);
  return (t) => {
    anim(t);
    CAM.apply(CAM.track(t, [[95.92, P0], [97.7, P1, 1.8], [98.6, F[0][0], 0.8], [99.5, F[0][1], 0.9], [100.3, F[1][0], 0.7], [101.5, F[1][1], 1.2], [102.3, F[2][0], 0.7], [103.27, F[2][1], 1.0]]));
  };
});

// ---------------------------------------------------------------- 12. hoje: 4º mandato; fora do Mapa da Fome (103.27 – 111.78)
// "Hoje, aos oitenta e um anos, foi eleito pela quarta vez. E no terceiro mandato, o Brasil saiu de novo do Mapa da Fome da ONU."
addScene("hoje", 103.27, 111.78, (S) => {
  const lula = makeLula("hoje"); lula.group.position.set(-4.6, 0, 0); S.add(lula.group);
  const years = ["2002", "2006", "2022", "2026"];
  const urns = years.map((y, i) => { const u = makeYearUrn(y); u.group.position.set((i - 1.5) * 1.5, 0, 0); S.add(u.group); return u; });
  urns.forEach((u, i) => { S.hero(u.group, "urna " + years[i], { when: (t) => t > 105.6 && t < 107.4 }); S.solid(u.group, "urna " + years[i]); });
  // Hunger map board: a red band labelled MAPA DA FOME; a green tile BRASIL slides out of it
  const board = new THREE.Group(); board.position.set(8, 0, 0); S.add(board);
  const bb = new THREE.Mesh(rbox(3.2, 2.0, 0.12, 0.04), mat("#2a2421")); bb.position.y = 1.2; board.add(bb);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.3), mat("#2a2421")); legs.position.y = 0.1; board.add(legs);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), mat("#2a2421")); post.position.y = 0.3; board.add(post);
  const zone = makePlate("MAPA DA FOME · ONU", 2.9, 0.5, { bg: RED, fg: "#ffffff" }); zone.position.set(0, 1.65, 0.075); board.add(zone);
  const tile = makePlate("BRASIL", 1.2, 0.42, { bg: GREEN, fg: "#ffffff" }); board.add(tile);
  S.hero(lula.group, "Lula hoje", { when: (t) => t < 104.9 });
  S.hero(board, "mapa", { when: (t) => t > 108.2 });
  S.solid(lula.group, "Lula"); S.solid(board, "mapa");
  const anim = (t) => {
    lula.pose(t); wave(lula.armR, sm(t, 103.4, 103.8) * (1 - sm(t, 104.8, 105.2)), t);
    urns.forEach((u, i) => { u.glow.opacity = 0.55 * sm(t, 105.5 + i * 0.15, 105.8 + i * 0.15) * (i === 3 ? 1 : 0.7); popIn(u.group, t, 104.6 + i * 0.1, 0.3); });
    urns[3].group.scale.setScalar(urns[3].group.scale.x * (1 + 0.08 * Math.sin(Math.PI * lin(t, 106.14, 106.8))));
    const out = sm(t, 109.14, 109.8);
    tile.position.set(0, lerp(1.65, 0.75, out), out > 0.6 ? 0.12 : 0.03); tile.visible = t > 109.0;
  };
  const H0 = CAM.pose(envelope([lula.group], anim, 103.27, 104.9), { zone: "stage", from: [-0.2, 0.25, 1], pull: 1.08 });
  const H1 = CAM.pose(envelope([lula.group], anim, 103.27, 104.9), { zone: "stage", from: [0.05, 0.22, 1], pull: 1.03 });
  const urnObjs = urns.map((u) => u.group);
  const U0 = CAM.pose(envelope(urnObjs, anim, 105.4, 107.4), { zone: "stage", from: [0.0, 0.4, 1], pull: 1.08 });
  const U1 = CAM.pose(envelope(urnObjs, anim, 105.4, 107.4), { zone: "stage", from: [0.15, 0.36, 1], pull: 1.03 });
  const B0 = CAM.pose(envelope([board], anim, 107.4, 111.78), { zone: "stage", from: [0.15, 0.2, 1], pull: 1.1 });
  const B1 = CAM.pose(envelope([board], anim, 107.4, 111.78), { zone: "stage", from: [-0.05, 0.18, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    fill.color.set(GREEN); fill.position.set(t < 107.5 ? 2.2 : 8, 2.2, 1.8); fill.intensity = t < 107.5 ? 5 * sm(t, 106.14, 106.6) : 5 * sm(t, 109.4, 109.9);
    CAM.apply(CAM.track(t, [[103.27, H0], [104.9, H1, 1.6], [105.6, U0, 0.7], [107.4, U1, 1.8], [108.2, B0, 0.8], [111.78, B1, 3.5]]));
  };
});

// ---------------------------------------------------------------- 13. a escolha: programas ou escândalos (111.78 – 119.3)
// "Então me diz: o que pesa mais na história dele... os programas sociais ou os escândalos?"
addScene("escolha", 111.78, 119.3, (S) => {
  const a = makeButton(GREEN, "PROGRAMAS", "#ffffff"), b = makeButton(RED, "ESCÂNDALOS", "#ffffff");
  a.position.set(-1.35, 0, 0); b.position.set(1.35, 0, 0); a.scale.setScalar(0.75); b.scale.setScalar(0.75); S.add(a, b);
  const aTop = sprite(chipTex("PROGRAMAS", { bg: GREEN, font: "900 120px Inter", h: 180 }), 2.0); aTop.position.set(-1.35, 2.1, 0); S.add(aTop);
  const bTop = sprite(chipTex("ESCÂNDALOS", { bg: RED, font: "900 120px Inter", h: 180 }), 2.0); bTop.position.set(1.35, 2.1, 0); S.add(bTop);
  const lA = new THREE.PointLight(GREEN, 0, 6, 1.5); lA.position.set(-1.75, 1.6, 1.2); S.add(lA);
  const lB = new THREE.PointLight(RED, 0, 6, 1.5); lB.position.set(1.75, 1.6, 1.2); S.add(lB);
  S.hero(a, "botão programas"); S.hero(b, "botão escândalos");
  S.label(aTop, "PROGRAMAS", { on: "botão programas" }); S.label(bTop, "ESCÂNDALOS", { on: "botão escândalos" });
  S.solid(a, "botão programas"); S.solid(b, "botão escândalos");
  const TA = 114.8, TB = 116.42;
  const anim = (t) => {
    const pa = pressCurve(t, TA), pb = pressCurve(t, TB);
    a.userData.dome.position.y = 0.78 - 0.16 * pa; b.userData.dome.position.y = 0.78 - 0.16 * pb;
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 112.0, 0.4)) * (1 + 0.15 * pa));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 112.2, 0.4)) * (1 + 0.15 * pb));
  };
  const box = envelope([a, b, aTop, bTop], anim, 111.78, 119.3);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.45, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.04, 0.4, 1] });
  return (t) => {
    anim(t);
    const pa = pressCurve(t, TA), pb = pressCurve(t, TB);
    const late = t > 117.4 ? 0.5 + 0.5 * Math.sin((t - 117.4) * 4) : 0;
    const ea = Math.max(pa, t > TA && t < TB - 0.2 ? 0.5 : 0, late), eb = Math.max(pb, t > TB ? 0.5 : 0, t > 117.4 ? 1 - late : 0);
    a.userData.domeMat.emissiveIntensity = ea * 1.0; b.userData.domeMat.emissiveIntensity = eb * 1.0; lA.intensity = ea * 7; lB.intensity = eb * 7;
    CAM.apply(CAM.blend(P0, P1, sm(t, 111.78, 119.3)));
  };
});
