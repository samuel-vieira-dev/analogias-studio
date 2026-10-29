// ============================================================================
// videos/2026-10-29-icms-combustiveis/scenes.js
// 3D scenes synced to audio/words.json (narration 0–98.2 s, video 100.2 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage": the headline band has text in every scene of this video
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Generic imagery only: no fuel brands, no party symbols, no real logos.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const PAPER = "#fbf7ef", STEEL = "#8d939a", DARK = "#1d1d1d", WOODC = "#6a4a30", NOTE = "#d9893a";

const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.06 }, o));

// Canvas texture painted by a function (w x h px). API { tex, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Upright panel (w x h, 0.03 deep) whose front face (+z) is a repaintable canvas. Origin: centre.
// The face is registered as a plate so the QA measures its text (frac = cap height / panel height).
function makeScreenPanel(w, h, painter, { px = 512, frac = 0.3, bg = "#141414", label = "painel" } = {}) {
  const ct = canvasTex(px, Math.round(px * h / w), painter);
  const side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), side]);
  m.userData.plate = { text: label, w, h, depth: 0.03, frac, detail: false };
  return { mesh: m, paint: ct.paint, setFrac: (f) => { m.userData.plate.frac = f; } };
}

// Fuel pump: base, cream body, orange cap, price screen, nozzle holster and hose. Origin: floor centre, front +z.
// API { group, screen(text) }
function makePump({ label = "COMBUSTÍVEL", screenDetail = false, screenPx = 120 } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(1.0, 0.12, 0.72, 0.03), mat("#4a4440")); base.position.y = 0.06; g.add(base);
  const body = new THREE.Mesh(rbox(0.8, 1.9, 0.56, 0.06), mat("#ece4d8", { roughness: 0.5 })); body.position.y = 0.12 + 0.95; g.add(body);
  const cap = new THREE.Mesh(rbox(0.9, 0.26, 0.64, 0.05), mat(ORANGE, { roughness: 0.45 })); cap.position.y = 2.02 + 0.13; g.add(cap);
  const scr = makeScreenPanel(0.62, 0.38, (x, w, h) => { x.fillStyle = "#0f1a14"; x.fillRect(0, 0, w, h); centerText(x, "R$ 0,00", w / 2, h / 2, "800 120px Inter", "#7dffa8"); }, { frac: 0.36, bg: "#2a2a2a", label: "visor da bomba" });
  scr.mesh.position.set(0, 1.6, 0.295); scr.mesh.userData.plate.detail = screenDetail; scr.setFrac(0.36 * screenPx / 120); g.add(scr.mesh);
  const lbl = makePlate(label, 0.62, 0.15, { bg: "#141414", fg: "#ffffff", detail: true }); lbl.position.set(0, 1.12, 0.295); g.add(lbl);
  const holster = new THREE.Mesh(rbox(0.14, 0.34, 0.18, 0.03), mat("#2b2b2b")); holster.position.set(0.47, 1.05, 0.1); g.add(holster);
  const nozzle = new THREE.Mesh(rbox(0.1, 0.32, 0.1, 0.03), mat("#1d1d1d")); nozzle.position.set(0.47, 1.12, 0.12); g.add(nozzle);
  const curve = new THREE.CatmullRomCurve3([new V3(0.47, 0.95, 0.12), new V3(0.6, 0.55, 0.2), new V3(0.52, 0.28, 0.24), new V3(0.4, 0.35, 0.29)]);
  const hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 8), mat("#141414", { roughness: 0.7 })); g.add(hose);
  g.add(contactShadow(1.6, 1.3));
  let cur = "";
  const screen = (text) => { if (text === cur) return; cur = text; scr.paint((x, w, h) => { x.fillStyle = "#0f1a14"; x.fillRect(0, 0, w, h); centerText(x, text, w / 2, h / 2, "800 " + screenPx + "px Inter", "#7dffa8"); }); };
  return { group: g, screen };
}

// Car along +x: body, cabin with dark glass, four wheels, lights. Origin: floor centre.
function makeCar({ color = "#2f6fb0", lux = false } = {}) {
  const g = new THREE.Group(), L = lux ? 2.7 : 2.0;
  const paint = mat(color, { roughness: lux ? 0.25 : 0.45, metalness: lux ? 0.5 : 0.15 });
  const body = new THREE.Mesh(rbox(L, 0.46, 1.0, 0.12), paint); body.position.y = 0.2 + 0.23; g.add(body);
  const cabin = new THREE.Mesh(rbox(L * 0.48, 0.4, 0.9, 0.1), paint); cabin.position.set(-0.08 * L, 0.66 + 0.2, 0); g.add(cabin);
  const glass = new THREE.Mesh(rbox(L * 0.44, 0.3, 0.92, 0.06), mat("#1b2733", { roughness: 0.15, metalness: 0.4 })); glass.position.set(-0.08 * L, 0.88, 0); g.add(glass);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 24), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(sx * L * 0.32, 0.22, sz * 0.45); g.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.17, 16), mat(lux ? "#d9d9d9" : "#9a9a9a", { metalness: 0.6 })); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); g.add(hub);
  }
  for (const sz of [-0.32, 0.32]) {
    const hl = new THREE.Mesh(rbox(0.04, 0.1, 0.2, 0.02), mat("#fff4c8", { emissive: "#ffe9a0", emissiveIntensity: 0.8 })); hl.position.set(L / 2 + 0.005, 0.5, sz); g.add(hl);
    const tl = new THREE.Mesh(rbox(0.04, 0.1, 0.2, 0.02), mat("#c0261b", { emissive: "#c0261b", emissiveIntensity: 0.5 })); tl.position.set(-L / 2 - 0.005, 0.5, sz); g.add(tl);
  }
  if (lux) { const chrome = new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.04, 1.02), mat("#e6e6e6", { metalness: 0.9, roughness: 0.15 })); chrome.position.set(0, 0.5, 0); g.add(chrome); }
  g.add(contactShadow(L + 0.6, 1.5));
  g.userData.L = L; return g;
}

// Gate arm on a post. Origin: floor at the post; the arm hinges at the post top and points along -x.
// set(k): 0 = arm up (vertical), 1 = arm down (horizontal). ghost = translucent glowing arm.
function makeGateArm({ len = 2.4, ghost = false } = {}) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(rbox(0.22, 1.2, 0.22, 0.04), mat("#3a3530")); post.position.y = 0.6; g.add(post);
  const motor = new THREE.Mesh(rbox(0.36, 0.3, 0.3, 0.05), mat("#f5c400")); motor.position.y = 1.2; g.add(motor);
  const pivot = new THREE.Group(); pivot.position.set(0, 1.2, 0); g.add(pivot);
  const c = makeCanvas(512, 32), x = c.getContext("2d");
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#ffffff" : RED; x.fillRect(i * 64, 0, 64, 32); }
  const armMat = new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.5, transparent: ghost, opacity: ghost ? 0.55 : 1, emissive: ghost ? "#ff8a5a" : "#000000", emissiveIntensity: ghost ? 0.35 : 0 });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.08), armMat); arm.position.set(-len / 2 - 0.18, 0, 0); pivot.add(arm);
  g.add(contactShadow(0.8, 0.8));
  const set = (k) => { pivot.rotation.z = -Math.PI / 2 * (1 - clamp(k)); };
  set(1);
  return { group: g, set, armMat };
}

// Toll booth with a tariff sign on a post. Origin: floor at the booth; front +z.
// API { group, setTariff(text) }
function makeTollBooth() {
  const g = new THREE.Group();
  const booth = new THREE.Mesh(rbox(1.0, 1.7, 0.9, 0.06), mat("#e9e1d6")); booth.position.y = 0.85; g.add(booth);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.02), mat("#9fc3d6", { roughness: 0.15, metalness: 0.3 })); win.position.set(0, 1.2, 0.456); g.add(win);
  const roof = new THREE.Mesh(rbox(1.3, 0.14, 1.2, 0.04), mat(ORANGE)); roof.position.y = 1.77; g.add(roof);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 12), mat("#3a3530")); post.position.set(-1.05, 1.0, 0); g.add(post);
  const sign = makeScreenPanel(1.75, 1.08, null, { frac: 0.3, bg: "#141414", label: "placa de tarifa" });
  sign.mesh.position.set(-1.05, 2.48, 0.05); g.add(sign.mesh);
  let cur = "";
  const setTariff = (text, head = "TARIFA") => {
    if (text + head === cur) return; cur = text + head;
    sign.paint((x, w, h) => { x.fillStyle = "#1f6b43"; roundRect(x, 0, 0, w, h, 26); x.fill(); centerText(x, head, w / 2, h * 0.27, "800 60px Inter", "#ffffff"); centerText(x, text, w / 2, h * 0.68, "900 104px Inter", "#ffffff"); });
  };
  setTariff("R$ 1,57");
  g.add(contactShadow(2.0, 1.4));
  return { group: g, setTariff };
}

// Banknote standing upright (front +z), split in a main part and a right-hand slice that can fly off.
// Origin: centre of the note. API { group, main, slice }
function makeNote(value = "50") {
  const g = new THREE.Group(), W = 1.3, H = 0.62, cut = 0.34;
  const paintNote = (x, w, h, withText) => {
    const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#e9a85a"); gr.addColorStop(1, "#c8742c"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(90,40,10,0.45)"; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    if (withText) { centerText(x, "R$ " + value, w * 0.5, h * 0.48, "900 150px Inter", "#4a2208"); }
    else { x.fillStyle = "rgba(90,40,10,0.35)"; x.beginPath(); x.arc(w / 2, h / 2, h * 0.28, 0, Math.PI * 2); x.fill(); }
  };
  const part = (w, withText) => {
    const ct = canvasTex(512, Math.round(512 * H / w), (x, cw, ch) => paintNote(x, cw, ch, withText));
    const side = mat("#b8682a");
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, 0.012), [side, side, side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.8 }), side]);
    if (withText) m.userData.plate = { text: "R$ " + value, w, h: H, depth: 0.012, frac: 0.3, detail: false };
    return m;
  };
  const main = part(W - cut, true); main.position.x = -cut / 2; g.add(main);
  const slice = part(cut, false); slice.position.x = (W - cut) / 2; g.add(slice);
  return { group: g, main, slice };
}

// Generic state government building: two steps, six columns, architrave with a printed name, pediment.
// Origin: floor centre, front +z.
function makeGovBuilding(label = "ESTADO") {
  const g = new THREE.Group(), stone = mat("#e8dfd2", { roughness: 0.8 });
  const s1 = new THREE.Mesh(rbox(2.6, 0.14, 1.5, 0.03), stone); s1.position.y = 0.07; g.add(s1);
  const s2 = new THREE.Mesh(rbox(2.3, 0.14, 1.3, 0.03), stone); s2.position.y = 0.21; g.add(s2);
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.2, 16), stone); c.position.set(-0.95 + i * 0.38, 0.28 + 0.6, 0.45); g.add(c); }
  const wall = new THREE.Mesh(rbox(2.0, 1.2, 0.7, 0.03), mat("#cfc4b4")); wall.position.set(0, 0.88, -0.1); g.add(wall);
  const arch = new THREE.Mesh(rbox(2.4, 0.3, 1.25, 0.03), stone); arch.position.y = 1.48 + 0.15; g.add(arch);
  const tri = new THREE.Shape(); tri.moveTo(-1.2, 0); tri.lineTo(1.2, 0); tri.lineTo(0, 0.5); tri.closePath();
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 1.2, bevelEnabled: false }).translate(0, 0, -0.6), stone); ped.position.y = 1.78; g.add(ped);
  const p = makePlate(label, 1.7, 0.28, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 1.63, 0.64); g.add(p);
  g.add(contactShadow(3.4, 2.2));
  return g;
}

// Price tag: orange body with a pointed left end, a hole, and printed text. Origin: centre, front +z.
function makeTag(text, w = 1.2, h = 0.55) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-w / 2 + h * 0.4, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2 + h * 0.4, h / 2); s.lineTo(-w / 2, 0); s.closePath();
  const hole = new THREE.Path(); hole.absarc(-w / 2 + h * 0.3, 0, h * 0.09, 0, Math.PI * 2, true); s.holes.push(hole);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }).translate(0, 0, -0.025), mat(ORANGE, { roughness: 0.5 })); g.add(body);
  const p = makePlate(text, w * 0.62, h * 0.62, { bg: ORANGE, fg: "#ffffff" }); p.position.set(h * 0.2, 0, 0.026); g.add(p);
  return g;
}
// Rice bag (white sack with crimped top and printed label). Origin: floor centre.
function makeRiceBag(s = 1) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(0.62, 0.86, 0.32, 0.1), mat("#f3efe6", { roughness: 0.9 })); b.position.y = 0.43; g.add(b);
  const top = new THREE.Mesh(rbox(0.56, 0.1, 0.12, 0.03), mat("#e2dccf")); top.position.y = 0.9; g.add(top);
  const p = makePlate("ARROZ", 0.58, 0.25, { bg: "#2f8a57", fg: "#ffffff" }); p.position.set(0, 0.6, 0.168); g.add(p);
  g.scale.setScalar(s); g.add(contactShadow(0.9, 0.6)); return g;
}
// T-shirt standing upright (extruded outline). Origin: floor centre.
function makeShirt(color = "#2f6fb0") {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-0.3, 0); s.lineTo(0.3, 0); s.lineTo(0.3, 0.55); s.lineTo(0.48, 0.45); s.lineTo(0.58, 0.62); s.lineTo(0.3, 0.84); s.lineTo(0.12, 0.84);
  s.quadraticCurveTo(0, 0.74, -0.12, 0.84); s.lineTo(-0.3, 0.84); s.lineTo(-0.58, 0.62); s.lineTo(-0.48, 0.45); s.lineTo(-0.3, 0.55); s.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }).translate(0, 0.015, -0.04), mat(color, { roughness: 0.85 }));
  g.add(m); g.add(contactShadow(1.0, 0.5)); return g;
}
// Electricity bill leaning on a small block. Origin: floor centre.
function makeBill() {
  const g = new THREE.Group();
  const ct = canvasTex(360, 480, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = "#f5c400"; x.fillRect(0, 0, w, 110);
    x.fillRect(0, 0, w, 170); centerText(x, "CONTA", w / 2, 50, "900 70px Inter", "#141414"); centerText(x, "DE LUZ", w / 2, 122, "900 70px Inter", "#141414");
    x.fillStyle = "#f5c400"; x.beginPath(); x.moveTo(200, 190); x.lineTo(140, 290); x.lineTo(185, 290); x.lineTo(160, 390); x.lineTo(235, 260); x.lineTo(190, 260); x.closePath(); x.fill();
    x.fillStyle = "#c9c1b5"; for (let i = 0; i < 3; i++) x.fillRect(40, 400 + i * 22, 280, 10);
  });
  const side = mat(PAPER);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.012), [side, side, side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 }), side]);
  sheet.userData.plate = { text: "CONTA DE LUZ", w: 0.6, h: 0.8, depth: 0.012, frac: 0.146, detail: false };
  sheet.position.set(0, 0.41, 0.02); sheet.rotation.x = -0.1; g.add(sheet);
  const stand = new THREE.Mesh(rbox(0.5, 0.12, 0.12, 0.03), mat("#3a2a20")); stand.position.set(0, 0.06, -0.1); g.add(stand);
  g.add(contactShadow(0.9, 0.6)); return g;
}
// Pie chart: 3/4 orange (state) and 1/4 cream (municipalities) slice that can slide out. Origin: floor centre.
function makePie(r = 1.1, hgt = 0.3) {
  const g = new THREE.Group();
  const big = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 48, 1, false, Math.PI / 2, Math.PI * 1.5), mat(ORANGE, { roughness: 0.5 })); big.position.y = hgt / 2; g.add(big);
  const capM = mat(ORANGE); const cap1 = new THREE.Mesh(new THREE.PlaneGeometry(r, hgt), capM); cap1.userData.decor = true;
  const slice = new THREE.Group(); g.add(slice);
  const small = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 16, 1, false, 0, Math.PI / 2), mat(CREAM, { roughness: 0.5 })); small.position.y = hgt / 2; slice.add(small);
  g.add(contactShadow(2 * r + 0.6, 2 * r + 0.6));
  return { group: g, slice };
}
// One-litre bottle with a printed label. Origin: floor centre.
function makeBottle(label = "1 LITRO") {
  const g = new THREE.Group();
  const glass = mat("#d9e8f2", { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 32), glass); body.position.y = 0.45; g.add(body);
  const fuel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.72, 32), mat("#f2b53a", { roughness: 0.3, emissive: "#a8650a", emissiveIntensity: 0.25 })); fuel.position.y = 0.4; g.add(fuel);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.22, 32), glass); shoulder.position.y = 1.01; g.add(shoulder);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 24), glass); neck.position.y = 1.19; g.add(neck);
  const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 24), mat(RED)); capB.position.y = 1.31; g.add(capB);
  const p = makePlate(label, 0.5, 0.2, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.5, 0.315); g.add(p);
  g.add(contactShadow(0.9, 0.9)); return g;
}
// Desk calendar (A-frame) with a page that flips over the top. Origin: floor centre, front +z.
// API { group, setPage(top, big), flip(k, nextTop, nextBig) }
function makeDeskCalendar() {
  const g = new THREE.Group(), lean = 0.22, H = 1.5, W = 1.4;
  const back = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); back.position.set(0, H / 2 * Math.cos(lean), -H / 2 * Math.sin(lean) - 0.3); back.rotation.x = lean; g.add(back);
  const front = new THREE.Group(); front.position.set(0, 0, 0.0); front.rotation.x = -lean; g.add(front);
  const board = new THREE.Mesh(rbox(W, H, 0.05, 0.02), mat("#3a2a20")); board.position.y = H / 2; front.add(board);
  const paintPage = (top, big) => (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = RED; x.fillRect(0, 0, w, h * 0.3);
    centerText(x, top, w / 2, h * 0.15, "900 78px Inter", "#ffffff"); centerText(x, big, w / 2, h * 0.63, "900 230px Inter", "#141414");
  };
  const page = makeScreenPanel(W * 0.92, H * 0.88, paintPage("OUT 2026", "28"), { px: 512, frac: 0.16, bg: PAPER, label: "folha do calendário" });
  page.mesh.position.set(0, H / 2 - 0.02, 0.045); front.add(page.mesh);
  const hinge = new THREE.Group(); hinge.position.set(0, H - 0.02 - 0.06, 0.07); front.add(hinge);
  const flipper = makeScreenPanel(W * 0.92, H * 0.88, paintPage("OUT 2026", "28"), { px: 512, frac: 0.16, bg: PAPER, label: "folha virando" });
  flipper.mesh.position.set(0, -(H * 0.88) / 2 + 0.04, 0); flipper.mesh.userData.plate.detail = true; hinge.add(flipper.mesh);
  for (const sx of [-0.4, 0.4]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 20), mat("#cfcfcf", { metalness: 0.8, roughness: 0.3 })); ring.rotation.y = Math.PI / 2; ring.position.set(sx, H - 0.06, 0.06); front.add(ring); }
  g.add(contactShadow(2, 1.6));
  let curA = "", curB = "";
  const setPage = (top, big) => { const k = top + big; if (k === curA) return; curA = k; page.paint(paintPage(top, big)); };
  const setFlip = (top, big) => { const k = top + big; if (k === curB) return; curB = k; flipper.paint(paintPage(top, big)); };
  // k: 0 = flipper lies on the page (showing `from`), 1 = flipped over the top (hidden)
  const flip = (k, from) => { setFlip(from[0], from[1]); hinge.rotation.x = -Math.PI * 0.95 * k; flipper.mesh.visible = k < 0.98; };
  return { group: g, setPage, flip, front, H };
}
// Round meeting table with small name blocks around the edge. Origin: floor centre. API { group, top }
function makeRoundTable(r = 1.6, n = 27) {
  const g = new THREE.Group(), h = 0.8;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 64), mat(WOODC, { roughness: 0.7 })); top.position.y = h - 0.04; g.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h - 0.08, 20), mat("#3a2a20")); leg.position.y = (h - 0.08) / 2; g.add(leg);
  const cols = [CREAM, ORANGE, "#c9b8a6", GREEN, "#2f6fb0"];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = new THREE.Mesh(rbox(0.2, 0.12, 0.06, 0.02), mat(cols[i % cols.length]));
    b.position.set(Math.cos(a) * (r - 0.18), h + 0.06, Math.sin(a) * (r - 0.18)); b.rotation.y = -a + Math.PI / 2; g.add(b);
  }
  g.add(contactShadow(2 * r + 0.8, 2 * r + 0.8));
  return { group: g, top: h };
}
// Sheet lying flat on a surface (top face painted). Origin: centre of its bottom face. API { mesh, paint }
function makeSheet(w, d, painter, px = 512, frac = 0.12, label = "folha") {
  const ct = canvasTex(px, Math.round(px * d / w), painter);
  const side = mat(PAPER);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.014, d), [side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.9 }), side, side, side]);
  m.geometry.translate(0, 0.007, 0); return { mesh: m, paint: ct.paint };
}
// Jerrycan (fuel can) with handle, spout and printed label. Origin: floor centre, front +z.
function makeJerrycan(color, label) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.7, 0.86, 0.34, 0.07), mat(color, { roughness: 0.45 })); body.position.y = 0.43; g.add(body);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 24, Math.PI), mat(color, { roughness: 0.45 })); handle.position.set(-0.12, 0.86, 0); g.add(handle);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 16), mat("#2b2b2b")); spout.position.set(0.22, 0.93, 0); spout.rotation.z = -0.5; g.add(spout);
  const p = makePlate(label, 0.64, 0.27, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.46, 0.186); g.add(p);
  g.add(contactShadow(1.0, 0.7)); return g;
}
// LPG cylinder (botijão): body, domed top, valve, carrying ring, foot ring, printed label. Origin: floor centre.
function makeGasCylinder(label = "GÁS 13 kg") {
  const g = new THREE.Group(), m = mat("#7fa3c9", { roughness: 0.4, metalness: 0.15 });
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.1, 32), mat("#3b3f44")); foot.position.y = 0.05; g.add(foot);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.62, 40), m); body.position.y = 0.1 + 0.31; g.add(body);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.45; dome.position.y = 0.72; g.add(dome);
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 16), mat("#c9a227", { metalness: 0.7, roughness: 0.3 })); valve.position.y = 0.95; g.add(valve);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 32), mat("#3b3f44")); ring.rotation.x = Math.PI / 2; ring.position.y = 1.02; g.add(ring);
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), mat("#3b3f44")); s.position.set(Math.cos(a) * 0.2, 0.92, Math.sin(a) * 0.2); g.add(s); }
  const p = makePlate(label, 0.66, 0.27, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.42, 0.41); g.add(p);
  g.add(contactShadow(1.0, 1.0)); return g;
}
// Easel board with a price line drawn over time (no numbers). Origin: floor centre. API { group, draw(k, up) }
function makeChartBoard() {
  const g = new THREE.Group();
  for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), mat("#4a3424")); l.position.set(sx * 0.9, 1.1, -0.1); l.rotation.x = -0.08; g.add(l); }
  const panel = makeScreenPanel(2.3, 1.5, null, { px: 640, frac: 0.125, bg: "#f4f1ea", label: "gráfico de preços" });
  panel.mesh.position.set(0, 1.45, 0.02); panel.mesh.rotation.x = -0.08; g.add(panel.mesh);
  const pts = [[0.08, 0.72], [0.2, 0.7], [0.32, 0.66], [0.44, 0.67], [0.56, 0.58], [0.68, 0.52], [0.8, 0.44], [0.92, 0.36]];
  let last = -1;
  const draw = (k) => {
    const q = Math.round(k * 60); if (q === last) return; last = q;
    panel.paint((x, w, h) => {
      x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, w, h);
      centerText(x, "PREÇO MÉDIO · ANP", w / 2, h * 0.11, "900 52px Inter", "#141414");
      x.strokeStyle = "#c9c1b5"; x.lineWidth = 3; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(w * 0.06, h * (0.3 + i * 0.16)); x.lineTo(w * 0.95, h * (0.3 + i * 0.16)); x.stroke(); }
      centerText(x, "2025", w * 0.2, h * 0.9, "800 44px Inter", "#6a6058"); centerText(x, "2026", w * 0.8, h * 0.9, "800 44px Inter", "#6a6058");
      const n = (pts.length - 1) * k; x.strokeStyle = RED; x.lineWidth = 14; x.lineJoin = "round"; x.beginPath();
      for (let i = 0; i <= Math.floor(n); i++) { const [a, b] = pts[i]; i ? x.lineTo(a * w, b * h) : x.moveTo(a * w, b * h); }
      const i0 = Math.floor(n), f = n - i0; if (i0 < pts.length - 1) { const [a0, b0] = pts[i0], [a1, b1] = pts[i0 + 1]; x.lineTo((a0 + (a1 - a0) * f) * w, (b0 + (b1 - b0) * f) * h); }
      x.stroke();
    });
  };
  draw(0);
  g.add(contactShadow(2.6, 1.2));
  return { group: g, draw };
}
// Crate with a printed name on its front. Origin: floor centre.
function makeCrate(label, color = "#8a5a3a", W = 1.2) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(W, 0.7, 0.62, 0.05), mat(color, { roughness: 0.8 })); b.position.y = 0.35; g.add(b);
  const p = makePlate(label, W - 0.08, 0.34, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.36, 0.316); g.add(p);
  g.add(contactShadow(1.4, 1.0)); return g;
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
  const rim = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.04, D + 0.04), mat("#c9ced3", { metalness: 0.6, roughness: 0.3 })); rim.position.y = y0 + H; g.add(rim);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, D + 0.1, 12), mat(RED)); handle.rotation.x = Math.PI / 2; handle.position.set(-W / 2 - 0.2, y0 + H + 0.12, 0); g.add(handle);
  for (const sz of [-1, 1]) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), mat("#c9ced3", { metalness: 0.6 })); a.position.set(-W / 2 - 0.1, y0 + H + 0.06, sz * D / 2); a.rotation.z = -0.5; g.add(a); }
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, y0 - 0.1, 8), mat("#c9ced3", { metalness: 0.6 })); leg.position.set(sx * (W / 2 - 0.05), 0.1 + (y0 - 0.1) / 2, sz * (D / 2 - 0.05)); g.add(leg);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), mat("#141414")); wh.rotation.x = Math.PI / 2; wh.position.set(sx * (W / 2 - 0.05), 0.07, sz * (D / 2 - 0.05)); g.add(wh);
  }
  g.add(contactShadow(1.7, 1.1));
  g.userData.floorY = y0 + 0.015; return g;
}
// Truck along +x: cab, flat bed with sacks of rice. Origin: floor centre.
function makeRiceTruck() {
  const g = new THREE.Group();
  const cab = new THREE.Mesh(rbox(0.95, 1.05, 1.15, 0.08), mat("#2f6b8a")); cab.position.set(1.45, 0.3 + 0.525, 0); g.add(cab);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.9), mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 })); win.position.set(1.93, 1.1, 0); g.add(win);
  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.02), mat("#9fc3d6", { roughness: 0.2, metalness: 0.3 })); sideWin.position.set(1.5, 1.1, 0.58); g.add(sideWin);
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.9), mat("#2b2b2b")); chassis.position.set(0.05, 0.36, 0); g.add(chassis);
  const bed = new THREE.Mesh(rbox(2.6, 0.12, 1.2, 0.03), mat(WOODC, { roughness: 0.85 })); bed.position.set(-0.45, 0.48, 0); g.add(bed);
  for (const z of [-0.58, 0.58]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 0.05), mat("#5a3e28")); rail.position.set(-0.45, 0.68, z); g.add(rail); }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const sack = new THREE.Mesh(rbox(0.7, 0.32, 0.5, 0.12), mat("#efe8da", { roughness: 0.95 })); sack.position.set(-1.25 + i * 0.8, 0.54 + 0.16 + 0.01, -0.27 + j * 0.54); g.add(sack);
  }
  const lbl = makePlate("ARROZ", 1.5, 0.42, { bg: "#2f8a57", fg: "#ffffff" }); lbl.position.set(-0.45, 0.68, 0.61); g.add(lbl);
  for (const x of [1.45, -0.2, -1.2]) for (const z of [0.52, -0.52]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), mat("#141414")); w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w); }
  g.add(contactShadow(4.4, 2.0)); return g;
}
// Balance scale with two pans (local copy of the Flávio video's scale). API { group, pans, setTilt(a) }
function makeBalance() {
  const g = new THREE.Group(), brass = mat("#d8a53a", { metalness: 0.6, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.18, 32), mat("#3a2a20")); base.position.y = 0.09; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 16), brass); post.position.y = 1.38; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 2.58; g.add(beam);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.0, 12), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  const pans = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = 1.9 * s; beam.add(hang);
    for (const a of [0, 2.1, 4.2]) {
      // string from the beam end (0,0,0) down to the pan rim point
      const end = new V3(Math.cos(a) * 0.72, -1.2, Math.sin(a) * 0.72), mid = end.clone().multiplyScalar(0.5);
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, end.length(), 6), brass);
      str.position.copy(mid); str.quaternion.setFromUnitVectors(new V3(0, 1, 0), end.clone().normalize()); hang.add(str);
    }
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.62, 0.08, 32), brass); pan.position.y = -1.24; hang.add(pan);
    pans.push(hang);
  }
  g.add(contactShadow(1.8, 1.8));
  const setTilt = (a) => { beam.rotation.z = a; for (const p of pans) p.rotation.z = -a; };
  return { group: g, pans, setTilt, panTop: -1.2 };
}

// ---------------------------------------------------------------- 1. gancho (0 – 4.30)
// "Imagina pagar um pedágio invisível toda vez que você abastece."
addScene("gancho", 0, 4.30, (S) => {
  const pump = makePump({ label: "GASOLINA", screenDetail: true }); pump.group.position.set(-0.4, 0, -0.55); S.add(pump.group);
  const car = makeCar(); S.add(car);
  const gate = makeGateArm({ len: 1.3, ghost: true }); gate.group.position.set(2.15, 0, 0.75); S.add(gate.group);
  S.hero(pump.group, "bomba de gasolina"); S.hero(car, "carro"); S.hero(gate.group, "cancela");
  S.solid(pump.group, "bomba"); S.solid(car, "carro"); S.solid(gate.group, "cancela");
  const anim = (t) => {
    car.position.set(-0.75 - 0.9 * (1 - eOut(lin(t, 0, 1.6))), 0, 0.75);
    gate.set(eOut(lin(t, 1.6, 2.4)));
    gate.armMat.opacity = 0.35 + 0.25 * Math.sin(t * 5) ** 2;
    pump.screen(t < 2.6 ? "R$ 0,00" : "R$ " + Math.min(50, Math.round((t - 2.6) * 40)) + ",00");
  };
  const shot = shotOf(anim);
  const A0 = shot([pump.group, car, gate.group], 0, 4.3, { from: [0.4, 0.4, 1], pull: 1.03 });
  const A1 = shot([pump.group, car, gate.group], 0, 4.3, { from: [0.2, 0.35, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(1.0, 1.8, 1.2); fill.intensity = 3 * sm(t, 1.6, 2.4);
    CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 0, 4.3)), t, 2.4, 0.25, 0.4));
  };
});

// ---------------------------------------------------------------- 2. nota (4.30 – 11.0)
// "Você pede cinquenta reais de gasolina... e um pedaço desse dinheiro nem fica com o posto. Vai pro seu estado."
addScene("nota", 4.30, 11.0, (S) => {
  const pump = makePump({ label: "GASOLINA" }); pump.group.position.set(-1.7, 0, -0.4); S.add(pump.group);
  const note = makeNote("50"); note.group.position.set(-0.1, 1.3, 0.5); S.add(note.group);
  const gov = makeGovBuilding("ESTADO"); gov.position.set(2.3, 0, -0.6); S.add(gov);
  S.hero(pump.group, "bomba de gasolina", { when: (t) => t < 9.5 }); S.hero(note.group, "nota de 50 reais", { when: (t) => t > 6.9 && t < 9.6 });
  S.hero(gov, "prédio do governo do estado", { when: (t) => t > 9.9 });
  S.solid(pump.group, "bomba"); S.solid(gov, "prédio");
  const sliceHome = note.slice.position.clone();
  const anim = (t) => {
    pump.screen("R$ " + Math.min(50, Math.max(0, Math.round((t - 4.4) * 32))) + ",00");
    popIn(note.group, t, 6.6, 0.4);
    note.group.rotation.y = 0.15 * Math.sin(t * 1.3);
    const lift = sm(t, 7.0, 7.6), fly = sm(t, 9.74, 10.6);
    const p = sliceHome.clone(); p.x += 0.15 * lift; p.y += 0.12 * lift;
    // flight to the building, in the note's frame (note is at (-0.1,1.3,0.5))
    const tgt = new V3(2.3 + 0.1, 2.0 - 1.3, -0.6 - 0.5 + 0.8);
    p.lerp(tgt, fly); p.y += Math.sin(Math.PI * fly) * 0.8;
    note.slice.position.copy(p); note.slice.rotation.z = fly * 1.2;
    note.slice.scale.setScalar(1 - 0.5 * fly); note.slice.visible = t < 10.45;
    note.slice.material[4].emissive = new THREE.Color(RED); note.slice.material[4].emissiveIntensity = 0.5 * lift;
    popIn(gov, t, 9.6, 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([pump.group, note.group], 4.3, 9.5, { from: [0.1, 0.3, 1], pull: 1.1 }), A1 = shot([pump.group, note.group], 4.3, 9.5, { from: [-0.1, 0.25, 1], pull: 1.02 });
  const B0 = shot([gov], 9.5, 11.0, { from: [0.05, 0.2, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(RED); fill.position.set(0.5, 2, 1.5); fill.intensity = 3 * sm(t, 7.0, 7.6);
    CAM.apply(CAM.track(t, [[4.3, A0], [9.2, A1, 4.9], [9.9, B0, 0.6]]));
  };
});

// ---------------------------------------------------------------- 3. icms (11.0 – 21.85)
// "Esse pedágio se chama ICMS... Ele está no arroz, na roupa, na conta de luz... e no combustível."
addScene("icms", 11.0, 21.85, (S) => {
  const tag = makeTag("ICMS", 2.4, 1.1); tag.position.set(0, 1.4, 0); S.add(tag);
  const rice = makeRiceBag(1.1); rice.position.set(-0.8, 0, 0.8); S.add(rice);
  const shirt = makeShirt(); shirt.position.set(0.8, 0, 0.8); S.add(shirt);
  const bill = makeBill(); bill.scale.setScalar(1.3); bill.position.set(-0.8, 0, -1.5); S.add(bill);
  const pump = makePump({ label: "GASOLINA", screenDetail: true }); pump.group.scale.setScalar(0.5); pump.group.position.set(0.8, 0, -1.5); S.add(pump.group); pump.screen("R$ 50,00");
  const items = [rice, shirt, bill, pump.group], at = [18.16, 18.99, 19.75, 21.07];
  const tags = items.map((it, i) => { const tg = makeTag("ICMS", 1.05, 0.47); tg.position.set(items[i].position.x + 0.15, items[i] === pump.group ? 1.65 : items[i] === bill ? 1.6 : items[i] === shirt ? 1.25 : 1.5, items[i].position.z); S.add(tg); return tg; });
  S.hero(tag, "etiqueta ICMS", { when: (t) => t < 17.4 });
  ["saco de arroz", "camiseta", "conta de luz", "bomba de gasolina pequena"].forEach((n, i) => S.hero(items[i], n, { when: (t) => t > 18.1 }));
  tags.forEach((tg, i) => S.hero(tg, "etiqueta ICMS " + (i + 1), { when: (t) => t > at[i] + 0.4 }));
  items.forEach((it, i) => S.solid(it, "item " + (i + 1)));
  const anim = (t) => {
    popIn(tag, t, 11.05, 0.45, 1, 17.6); tag.rotation.y = 0.35 * Math.sin((t - 11) * 1.1);
    tag.position.y = 1.4 + 0.08 * Math.sin(t * 2);
    items.forEach((it, i) => popIn(it, t, 17.6, 0.4, it === pump.group ? 0.5 : (it === rice ? 1.35 : it === bill ? 1.55 : it === shirt ? 1.2 : 0.6)));
    tags.forEach((tg, i) => { popIn(tg, t, at[i], 0.35); tg.rotation.z = 0.12 * Math.sin(t * 2 + i); });
  };
  const shot = shotOf(anim);
  const A0 = shot([tag], 11.0, 17.5, { from: [0.2, 0.15, 1], pull: 1.12 }), A1 = shot([tag], 11.0, 17.5, { from: [-0.2, 0.1, 1], pull: 1.04 });
  const B0 = shot([...items, ...tags], 17.8, 21.85, { from: [0.15, 1.0, 1], pull: 1.06 }), B1 = shot([...items, ...tags], 17.8, 21.85, { from: [-0.1, 0.9, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.2, 1.6); fill.intensity = 2.5;
    CAM.apply(CAM.track(t, [[11.0, A0], [17.3, A1, 6.2], [17.9, B0, 0.6], [21.85, B1, 3.9]]));
  };
});

// ---------------------------------------------------------------- 4. pizza (21.85 – 25.8)
// "Cada estado cobra o seu, e um quarto vai pras prefeituras."
addScene("pizza", 21.85, 25.8, (S) => {
  const pie = makePie(1.2, 0.34); pie.group.position.set(-0.8, 0, 0); S.add(pie.group);
  const pState = makePlate("ESTADO", 1.3, 0.34, { bg: "#141414", fg: "#ffffff" }); pState.position.set(-1.25, 0.2, 1.24); pState.rotation.x = -0.2; S.add(pState);
  const house = makeHouse({ w: 1.2, h: 0.85, d: 1.0, roofH: 0.55 }); house.position.set(2.2, 0, -0.2); S.add(house);
  const pCity = makePlate("PREFEITURA", 1.5, 0.3, { bg: "#141414", fg: "#ffffff" }); pCity.position.set(2.2, 0.17, 0.75); pCity.rotation.x = -0.2; S.add(pCity);
  S.hero(pie.group, "gráfico de pizza", { when: (t) => t < 23.5 }); S.hero(pState, "placa ESTADO", { when: (t) => t < 23.5 });
  S.hero(house, "casa da prefeitura", { when: (t) => t > 24.0 }); S.hero(pCity, "placa PREFEITURA", { when: (t) => t > 24.0 });
  S.solid(pie.group, "pizza"); S.solid(house, "prefeitura", { restsOn: [] });
  const anim = (t) => {
    pie.group.rotation.y = 0.25 + 0.15 * sm(t, 21.85, 25.8);
    const k = sm(t, 23.62, 24.8);
    pie.slice.position.set(0.95 * k, 0.8 * Math.sin(Math.PI * k), 0.45 * k);
    popIn(house, t, 23.4, 0.4); pie.group.visible = t < 24.1; popIn(pCity, t, 23.7, 0.35); popIn(pState, t, 22.1, 0.35);
  };
  const shot = shotOf(anim);
  const A0 = shot([pie.group, pState], 21.85, 23.5, { from: [0.15, 0.75, 1], pull: 1.04 }), A1 = shot([pie.group, pState], 21.85, 23.5, { from: [-0.05, 0.65, 1], pull: 1.0 });
  const B0 = shot([house, pCity], 23.6, 25.8, { from: [-0.3, 0.4, 1], pull: 1.04 }), B1 = shot([house, pCity], 23.6, 25.8, { from: [-0.1, 0.35, 1], pull: 1.0 });
  return (t) => { anim(t); fill.intensity = 2; fill.position.set(0, 2, 2); CAM.apply(CAM.track(t, [[21.85, A0], [23.4, A1, 1.5], [23.95, B0, 0.55], [25.8, B1, 1.8]])); };
});

// ---------------------------------------------------------------- 5. regra (25.8 – 33.95)
// "No combustível, uma lei de 2022 mudou a regra: em vez de uma porcentagem do preço, é um valor fixo em cada litro."
addScene("regra", 25.8, 33.95, (S) => {
  const book = makeLawBook({ title: "LEI 192/2022", color: "#1f3d2e", emblem: false }); book.group.position.set(0, 0, 0); S.add(book.group);
  const pct = makePlate("%", 1.1, 1.1, { bg: CREAM, fg: "#141414" }); pct.position.set(-1.1, 0.9, 0); S.add(pct);
  const xA = new THREE.Mesh(rbox(1.5, 0.16, 0.08, 0.03), mat(RED, { emissive: RED, emissiveIntensity: 0.4 })); xA.rotation.z = 0.78; xA.position.set(-1.1, 0.9, 0.08); S.add(xA);
  const xB = xA.clone(); xB.rotation.z = -0.78; S.add(xB);
  const bottle = makeBottle("1 LITRO"); bottle.position.set(1.1, 0, 0); S.add(bottle);
  const fixed = makePlate("VALOR FIXO", 1.5, 0.36, { bg: GREEN, fg: "#ffffff" }); fixed.position.set(1.1, 0.24, 0.85); fixed.rotation.x = -0.35; S.add(fixed);
  S.hero(book.group, "livro da lei", { when: (t) => t < 29.5 });
  S.hero(pct, "símbolo de porcentagem", { when: (t) => t > 30.1 && t < 31.9 });
  S.hero(bottle, "garrafa de 1 litro", { when: (t) => t > 32.3 }); S.hero(fixed, "placa VALOR FIXO", { when: (t) => t > 32.6 });
  S.solid(bottle, "garrafa");
  const anim = (t) => {
    popIn(book.group, t, 25.8, 0.01, 1, 29.75); book.group.rotation.y = -0.25 + 0.2 * sm(t, 25.8, 29.7);
    popIn(pct, t, 29.8, 0.4); pct.rotation.y = 0.1 * Math.sin(t * 2);
    const xk = pop(t, 31.2, 0.3); for (const x of [xA, xB]) { x.visible = xk > 0.01; x.scale.setScalar(Math.max(0.001, xk)); }
    popIn(bottle, t, 31.97, 0.4, 1.4); popIn(fixed, t, 32.4, 0.35);
    bottle.rotation.y = 0.3 * Math.sin(t * 0.9);
  };
  const shot = shotOf(anim);
  const A0 = shot([book.group], 25.8, 29.7, { from: [0.1, 0.9, 0.8], pull: 1.1 }), A1 = shot([book.group], 25.8, 29.7, { from: [-0.1, 0.95, 0.7], pull: 1.02 });
  const B0 = shot([pct, xA, xB], 29.8, 31.8, { from: [0.15, 0.2, 1], pull: 1.06 }), B1 = shot([pct, xA, xB], 29.8, 31.8, { from: [0.0, 0.15, 1], pull: 1.0 });
  const C0 = shot([pct, bottle, fixed, xA, xB], 31.9, 33.95, { from: [0.1, 0.25, 1], pull: 1.02 }), C1 = shot([pct, bottle, fixed, xA, xB], 31.9, 33.95, { from: [-0.08, 0.2, 1], pull: 1.0 });
  return (t) => { anim(t); fill.intensity = 2; fill.position.set(0, 2, 2); CAM.apply(CAM.track(t, [[25.8, A0], [29.5, A1, 3.7], [29.95, B0, 0.3], [31.7, B1, 1.7], [32.3, C0, 0.6], [33.95, C1, 1.6]])); };
});

// ---------------------------------------------------------------- 6. pedagio (33.95 – 38.45)
// "Igual pedágio: a tarifa é a mesma, não importa quanto vale o carro."
addScene("pedagio", 33.95, 38.45, (S) => {
  const booth = makeTollBooth(); booth.group.position.set(0.4, 0, -1.9); S.add(booth.group);
  const gate = makeGateArm({ len: 2.0 }); gate.group.rotation.y = Math.PI / 2; gate.group.position.set(-0.9, 0, -0.85); S.add(gate.group);
  const c1 = makeCar({ color: "#2f6fb0" }); S.add(c1);
  const c2 = makeCar({ color: "#9a1f1f", lux: true }); S.add(c2);
  const coins = [makeCoin(0.3), makeCoin(0.3)]; coins.forEach((c) => S.add(c.group));
  S.hero(booth.group, "cabine de pedágio"); S.hero(gate.group, "cancela");
  S.hero(c1, "carro popular", { when: (t) => t > 34.3 && t < 36.1 }); S.hero(c2, "carro de luxo", { when: (t) => t > 36.6 });
  S.solid(booth.group, "cabine"); S.solid(gate.group, "cancela"); S.solid(c1, "carro 1"); S.solid(c2, "carro 2");
  const drive = (car, t, t0, t1) => { const k = lin(t, t0, t1); car.position.set(lerp(-2.7, 2.4, k), 0, 0.15); car.visible = k > 0 && k < 1; };
  const anim = (t) => {
    drive(c1, t, 33.6, 36.6); drive(c2, t, 36.0, 39.4);
    const near = (car) => car.visible && Math.abs(car.position.x + 0.9) < car.userData.L / 2 + 0.8;
    const up = (near(c1) || near(c2)) ? 1 : 0;
    gate.set(1 - up);
    [[c1, 34.9], [c2, 37.0]].forEach(([car, at], i) => { const c = coins[i]; popIn(c.group, t, at, 0.3, 1, at + 0.9); c.group.position.set(0.4, 2.3 + 0.4 * sm(t, at, at + 0.9), -1.9); c.spin(t * 6); });
    booth.setTariff("R$ 1,57");
  };
  // gate must be up while a car passes: open it from the pose of the car, then smooth it
  const gateK = (t) => { const k1 = lin(t, 33.6, 36.6), k2 = lin(t, 36.0, 39.4); const x1 = lerp(-2.7, 2.4, k1), x2 = lerp(-2.7, 2.4, k2); const d = Math.min(t > 33.6 && t < 36.6 ? Math.abs(x1 + 0.9) - 1.0 : 9, t > 36.0 && t < 39.4 ? Math.abs(x2 + 0.9) - 1.35 : 9); return clamp((d - 0.4) / 1.2); };
  const animS = (t) => { anim(t); gate.set(gateK(t)); };
  const shot = shotOf(animS);
  const A0 = shot([booth.group, gate.group, c1, c2], 34.6, 38.2, { from: [0.9, 0.4, 0.55], pull: 1.0 }), A1 = shot([booth.group, gate.group, c1, c2], 34.6, 38.2, { from: [0.75, 0.35, 0.7], pull: 1.0 });
  return (t) => { animS(t); fill.intensity = 2; fill.position.set(0, 2.4, 1.5); CAM.apply(CAM.blend(A0, A1, sm(t, 33.95, 38.45))); };
});

// ---------------------------------------------------------------- 7. reajuste (38.45 – 41.35)
// "E uma vez por ano, a tabela é reajustada."
addScene("reajuste", 38.45, 41.35, (S) => {
  const booth = makeTollBooth(); booth.group.position.set(-0.3, 0, 0); S.add(booth.group);
  const cal = makeDeskCalendar(); cal.group.position.set(1.5, 0, 0.3); S.add(cal.group);
  S.hero(booth.group, "placa de tarifa do pedágio"); S.hero(cal.group, "calendário de mesa");
  S.solid(booth.group, "cabine"); S.solid(cal.group, "calendário");
  const anim = (t) => {
    const k = sm(t, 39.1, 39.7);
    cal.setPage("JAN 2027", "1"); cal.flip(k, ["JAN 2026", "1"]);
    booth.setTariff(t < 40.4 ? "R$ 1,57" : "R$ 1,64");
  };
  const shot = shotOf(anim);
  const A0 = shot([booth.group, cal.group], 38.45, 41.35, { from: [0.2, 0.3, 1], pull: 1.08 }), A1 = shot([booth.group, cal.group], 38.45, 41.35, { from: [-0.05, 0.25, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(GREEN); fill.position.set(0.5, 2.6, 1.5); fill.intensity = t > 40.4 ? 4 : 1.5; CAM.apply(CAM.shake(CAM.blend(A0, A1, sm(t, 38.45, 41.35)), t, 40.4, 0.2, 0.35)); };
});

// ---------------------------------------------------------------- 8. confaz (41.35 – 49.55)
// "Os secretários de Fazenda dos estados, no Confaz, aprovaram a nova tabela, publicada em 28 de outubro."
addScene("confaz", 41.35, 49.55, (S) => {
  const table = makeRoundTable(1.7, 27); S.add(table.group);
  const paintSheet = (stamped) => (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
    centerText(x, "NOVA TABELA", w / 2, h * 0.16, "900 78px Inter", "#141414");
    x.fillStyle = "#c9c1b5"; for (let i = 0; i < 5; i++) x.fillRect(w * 0.1, h * (0.3 + i * 0.1), w * 0.8, 10);
    if (stamped) { x.save(); x.translate(w / 2, h * 0.62); x.rotate(-0.18); x.strokeStyle = GREEN; x.lineWidth = 12; x.strokeRect(-200, -60, 400, 120); centerText(x, "APROVADO", 0, 4, "900 76px Inter", GREEN); x.restore(); }
  };
  const sheet = makeSheet(1.3, 0.95, paintSheet(false)); sheet.mesh.position.set(0, table.top, 0.2); S.add(sheet.mesh);
  sheet.mesh.userData.plate = { text: "NOVA TABELA", w: 1.3, h: 0.95, depth: 0.014, frac: 0.21, detail: false };
  const stamp = makeStamp({ w: 0.7, d: 0.26, ink: GREEN }); S.add(stamp);
  const dou = makeScreenPanel(1.5, 1.05, (x, w, h) => {
    x.fillStyle = PAPER; x.fillRect(0, 0, w, h); x.fillStyle = "#1d3fb8"; x.fillRect(0, 0, w, h * 0.24);
    centerText(x, "DIÁRIO OFICIAL", w / 2, h * 0.12, "900 58px Inter", "#ffffff");
    centerText(x, "28/10/2026", w / 2, h * 0.38, "900 66px Inter", "#141414");
    x.fillStyle = "#c9c1b5"; for (let i = 0; i < 5; i++) x.fillRect(w * 0.1, h * (0.52 + i * 0.08), w * 0.8, 9);
  }, { frac: 0.075, bg: PAPER, label: "Diário Oficial" });
  dou.mesh.position.set(0, table.top + 0.62, 0.35); S.add(dou.mesh);
  S.hero(table.group, "mesa redonda do Confaz", { when: (t) => t < 44.5 }); S.hero(sheet.mesh, "folha nova tabela", { when: (t) => t > 42.6 && t < 47.5 });
  S.hero(dou.mesh, "página do Diário Oficial", { when: (t) => t > 48.1 });
  S.solid(table.group, "mesa"); S.hero(stamp, "carimbo", { when: (t) => t > 44.9 && t < 47.5 });
  let stamped = false;
  const anim = (t) => {
    const down = sm(t, 45.5, 45.87) * (1 - sm(t, 46.2, 46.7));
    stamp.position.set(0, table.top + 0.014 + 1.2 * (1 - down), 0.25); popIn(stamp, t, 44.6, 0.35, 1, 47.6);
    const st = t > 45.87; if (st !== stamped) { stamped = st; sheet.paint(paintSheet(st)); }
    popIn(sheet.mesh, t, 42.6, 0.35, 1, 47.7);
    popIn(dou.mesh, t, 47.68, 0.45);
    dou.mesh.rotation.y = 0.12 * Math.sin(t * 1.2);
  };
  const shot = shotOf(anim);
  const A0 = shot([table.group], 41.35, 44.6, { from: [0.3, 0.9, 1], pull: 1.08 }), A1 = shot([table.group, sheet.mesh], 41.35, 44.6, { from: [0.1, 0.85, 1], pull: 1.02 });
  const B0 = shot([sheet.mesh, stamp], 44.6, 47.5, { from: [0.05, 1.6, 0.8], pull: 1.03 }), B1 = shot([sheet.mesh, stamp], 44.6, 47.5, { from: [-0.05, 1.6, 0.8], pull: 1.0 });
  const C0 = shot([dou.mesh], 47.7, 49.55, { from: [0.15, 0.1, 1], pull: 1.1 }), C1 = shot([dou.mesh], 47.7, 49.55, { from: [-0.1, 0.05, 1], pull: 1.03 });
  return (t) => {
    anim(t); fill.color.set(GREEN); fill.position.set(0, 2.4, 1.2); fill.intensity = t > 45.87 && t < 47.6 ? 4 : 1.2;
    CAM.apply(CAM.shake(CAM.track(t, [[41.35, A0], [44.3, A1, 2.9], [44.8, B0, 0.5], [47.3, B1, 2.5], [47.7, C0, 0.4], [49.55, C1, 1.8]]), t, 45.87, 0.2, 0.3));
  };
});

// ---------------------------------------------------------------- 9. valores (49.55 – 63.7)
// gasolina 1,57 → 1,64 · diesel 1,17 → 1,30 (+11%) · gás +R$ 0,91 no botijão
addScene("valores", 49.55, 63.7, (S) => {
  const UNIT = 0.014;
  const defs = [
    { obj: makeJerrycan(RED, "GASOLINA"), x: -1.7, a: 157, b: 164, ta: "1,57", tb: "1,64", at: 49.64, up: 52.26, name: "galão de gasolina" },
    { obj: makeJerrycan("#e8b923", "DIESEL"), x: 0, a: 117, b: 130, ta: "1,17", tb: "1,30", at: 54.64, up: 56.6, name: "galão de diesel" },
    { obj: makeGasCylinder("GÁS 13 kg"), x: 1.7, a: 147, b: 154, ta: "1,47", tb: "1,54", at: 60.16, up: 61.5, name: "botijão de gás" },
  ];
  defs.forEach((d) => {
    S.add(d.obj);
    d.col = makeHourColumn({ hours: d.a, unit: UNIT, w: 0.8, color: "#5a5048" }); d.col.group.position.set(d.x, 0, 0); S.add(d.col.group);
    d.cap = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1, 0.82), mat(RED, { emissive: RED, emissiveIntensity: 0.35 })); d.col.group.add(d.cap);
    S.hero(d.obj, d.name, { when: (t) => t > d.at + 0.45 }); S.hero(d.col.group, "coluna " + d.name, { when: (t) => t > d.at + 0.45 });
    S.solid(d.obj, d.name, { restsOn: ["coluna " + d.name] }); S.solid(d.col.group, "coluna " + d.name);
  });
  const anim = (t) => {
    defs.forEach((d) => {
      popIn(d.col.group, t, d.at - 0.35, 0.35); popIn(d.obj, t, d.at + 0.05, 0.35, 1.45);
      const k = sm(t, d.up, d.up + 0.6), v = lerp(d.a, d.b, k);
      d.col.setHours(v, k > 0.5 ? d.tb : d.ta);
      const hA = 0.12 + d.a * UNIT, hV = 0.12 + v * UNIT; d.cap.scale.y = Math.max(0.001, hV - hA); d.cap.position.y = (hA + hV) / 2; d.cap.visible = k > 0.02;
      d.obj.position.set(d.x, d.col.top(), 0);
    });
  };
  const shot = shotOf(anim);
  const all = defs.flatMap((d) => [d.obj, d.col.group]);
  const A = shot([defs[0].obj, defs[0].col.group], 49.6, 54.6, { from: [0.2, 0.3, 1], pull: 1.1 }), A1 = shot([defs[0].obj, defs[0].col.group], 49.6, 54.6, { from: [0.05, 0.25, 1], pull: 1.04 });
  const B = shot([defs[0].obj, defs[0].col.group, defs[1].obj, defs[1].col.group], 54.6, 60.1, { from: [0.2, 0.3, 1], pull: 1.06 }), B1 = shot([defs[0].obj, defs[0].col.group, defs[1].obj, defs[1].col.group], 54.6, 60.1, { from: [0.0, 0.25, 1], pull: 1.0 });
  const C = shot(all, 60.1, 63.7, { from: [0.05, 0.3, 1], pull: 1.04 }), C1 = shot(all, 60.1, 63.7, { from: [-0.12, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t); fill.color.set(RED); fill.position.set(0, 2.6, 1.8); fill.intensity = 2;
    CAM.apply(CAM.track(t, [[49.55, A], [54.4, A1, 4.8], [55.0, B, 0.6], [60.0, B1, 5.0], [60.6, C, 0.6], [63.7, C1, 3.0]]));
  };
});

// ---------------------------------------------------------------- 10. calendario (63.7 – 67.95)
// "Mas calma: só vale a partir de fevereiro de 2027."
addScene("calendario", 63.7, 67.95, (S) => {
  const cal = makeDeskCalendar(); S.add(cal.group);
  const pin = new THREE.Group(); const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), mat(RED, { roughness: 0.35 })); head.position.z = 0.16; pin.add(head);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.16, 8), mat("#cfcfcf", { metalness: 0.8 })); needle.rotation.x = Math.PI / 2; needle.position.z = 0.08; pin.add(needle);
  pin.position.set(-0.5, cal.H * 0.88, 0.075); cal.front.add(pin);
  S.hero(cal.group, "calendário de mesa"); S.solid(cal.group, "calendário");
  const pages = [["OUT 2026", "28"], ["NOV 2026", "1"], ["DEZ 2026", "1"], ["JAN 2027", "1"], ["FEV 2027", "1"]];
  const flips = [64.3, 64.8, 65.3, 65.8];
  const anim = (t) => {
    let i = 0; for (const f of flips) if (t >= f + 0.4) i++;
    const cur = pages[Math.min(i, 4)], nxt = pages[Math.min(i + 1, 4)];
    const f = flips[i]; const k = f !== undefined ? sm(t, f, f + 0.4) : 0;
    if (f !== undefined && t >= f) { cal.setPage(nxt[0], nxt[1]); cal.flip(k, cur); } else { cal.setPage(cur[0], cur[1]); cal.flip(f !== undefined ? 0 : 1, cur); }
    popIn(pin, t, 66.55, 0.35);
  };
  const shot = shotOf(anim);
  const A0 = shot([cal.group], 63.7, 67.95, { from: [0.25, 0.25, 1], pull: 1.08 }), A1 = shot([cal.group], 63.7, 67.95, { from: [-0.05, 0.2, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 1.8, 1.6); fill.intensity = 2; CAM.apply(CAM.blend(A0, A1, sm(t, 63.7, 67.95))); };
});

// ---------------------------------------------------------------- 11. porque (67.95 – 77.3)
// "A lei manda corrigir pela média de preços da ANP, e o combustível ficou mais caro este ano. Os estados dizem que só cumprem a lei."
addScene("porque", 67.95, 77.3, (S) => {
  const board = makeChartBoard(); board.group.position.set(-0.6, 0, -0.3); S.add(board.group);
  const booth = makeTollBooth(); booth.group.scale.setScalar(0.75); booth.group.position.set(2.45, 0, -0.2); S.add(booth.group);
  const book = makeLawBook({ title: "LEI 192/2022", color: "#1f3d2e", emblem: false }); book.group.scale.setScalar(0.6); book.group.position.set(-0.3, 0, 1.3); S.add(book.group);
  S.hero(board.group, "quadro com gráfico de preços"); S.hero(booth.group, "placa de tarifa", { when: (t) => t > 72.8 });
  S.hero(book.group, "livro da lei", { when: (t) => t > 75.3 });
  S.solid(board.group, "quadro"); S.solid(booth.group, "cabine"); S.solid(book.group, "livro");
  const anim = (t) => {
    board.draw(sm(t, 69.6, 74.3));
    popIn(booth.group, t, 72.5, 0.4, 0.75); booth.setTariff(t < 73.9 ? "R$ 1,57" : "R$ 1,64");
    popIn(book.group, t, 74.95, 0.4, 0.6); book.group.rotation.y = 0.2 * Math.sin(t);
  };
  const shot = shotOf(anim);
  const A0 = shot([board.group], 67.95, 72.4, { from: [0.15, 0.2, 1], pull: 1.1 }), A1 = shot([board.group], 67.95, 72.4, { from: [-0.05, 0.15, 1], pull: 1.03 });
  const B0 = shot([board.group, booth.group, book.group], 72.4, 77.3, { from: [0.1, 0.3, 1], pull: 1.04 }), B1 = shot([board.group, booth.group, book.group], 72.4, 77.3, { from: [-0.1, 0.3, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(RED); fill.position.set(0, 2.5, 1.6); fill.intensity = 1.5 + 2 * sm(t, 72, 74.3); CAM.apply(CAM.track(t, [[67.95, A0], [72.2, A1, 4.2], [72.9, B0, 0.7], [77.3, B1, 4.4]])); };
});

// ---------------------------------------------------------------- 12. preco (77.3 – 83.25)
// "E a bomba não sobe sozinha: o preço final depende também de refinaria, frete e postos."
addScene("preco", 77.3, 83.25, (S) => {
  const pump = makePump({ label: "GASOLINA", screenPx: 160 }); pump.group.scale.setScalar(1.35); pump.group.position.set(0, 0, -0.5); S.add(pump.group); pump.screen("R$ ?");
  const crates = [["ICMS", ORANGE, -1.35, 0.7, 77.4], ["REFINARIA", "#5a5048", -1.45, -1.75, 81.0], ["FRETE", "#2f6b8a", 1.35, -1.75, 81.85], ["POSTO", "#8a5a3a", 1.35, 0.7, 82.5]];
  const cs = crates.map(([l, c, x, z, at]) => { const k = makeCrate(l, c, l === "REFINARIA" ? 1.5 : 1.2); k.position.set(x, 0, z + 0.3); S.add(k); return { k, at, l }; });
  S.hero(pump.group, "bomba de gasolina");
  cs.forEach((c) => { S.hero(c.k, "caixa " + c.l, { when: (t) => t > c.at + 0.4 }); S.solid(c.k, "caixa " + c.l); });
  S.solid(pump.group, "bomba");
  const anim = (t) => { cs.forEach((c) => popIn(c.k, t, c.at, 0.35)); pump.screen(Math.floor(t * 2) % 2 ? "R$ ?" : "R$ ??"); };
  const shot = shotOf(anim);
  const A0 = shot([pump.group, ...cs.map((c) => c.k)], 77.3, 83.25, { from: [0.2, 0.7, 1], pull: 1.04 }), A1 = shot([pump.group, ...cs.map((c) => c.k)], 77.3, 83.25, { from: [-0.1, 0.62, 1], pull: 1.0 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.4, 1.6); fill.intensity = 2; CAM.apply(CAM.blend(A0, A1, sm(t, 77.3, 83.25))); };
});

// ---------------------------------------------------------------- 13. caminhao (83.25 – 93.05)
// "Agora imagina o caminhoneiro que leva o arroz até o mercado. Cada litro de diesel dele paga treze centavos a mais. Esse custo pode chegar no seu carrinho."
addScene("caminhao", 83.25, 93.05, (S) => {
  const truck = makeRiceTruck(); S.add(truck);
  const booth = makeTollBooth(); booth.group.position.set(2.2, 0, -2.4); S.add(booth.group); booth.setTariff("+R$ 0,13", "ICMS DIESEL/L");
  const cart = makeCart(); cart.position.set(0, 0, 0.2); S.add(cart);
  const bag = makeRiceBag(0.9); bag.position.set(0.15, cart.userData.floorY, 0.2); bag.rotation.y = 0.1; S.add(bag);
  const coin = makeCoin(0.32); S.add(coin.group);
  S.hero(truck, "caminhão com arroz", { when: (t) => t > 83.5 && t < 89.9 });
  S.hero(cart, "carrinho de mercado", { when: (t) => t > 90.4 }); S.hero(bag, "saco de arroz", { when: (t) => t > 90.4 });
  S.solid(truck, "caminhão"); S.solid(cart, "carrinho"); 
  const anim = (t) => {
    truck.position.set(lerp(-2.6, 0.9, eOut(lin(t, 83.25, 88.6))), 0, 0); truck.visible = t < 90.3;
    booth.group.visible = false;
    popIn(cart, t, 90.3, 0.35); popIn(bag, t, 90.3, 0.35, 0.9);
    if (t < 90.3) { popIn(coin.group, t, 88.95, 0.3); coin.group.position.set(truck.position.x + 1.45, 1.95 + 0.25 * sm(t, 88.95, 89.8), 0); }
    else { coin.group.visible = true; coin.group.scale.setScalar(1); const k = sm(t, 91.6, 92.4); coin.group.position.set(0.5, lerp(2.0, cart.userData.floorY + 0.35, k), 0.2); }
    coin.spin(t * 5);
  };
  const shot = shotOf(anim);
  const A0 = shot([truck], 83.25, 90.2, { from: [0.4, 0.35, 1], pull: 1.0 }), A1 = shot([truck, coin.group], 86.0, 90.2, { from: [0.1, 0.3, 1], pull: 1.0 });
  const B0 = shot([cart, bag, coin.group], 90.3, 93.05, { from: [0.3, 0.45, 1], pull: 1.08 }), B1 = shot([cart, bag, coin.group], 90.3, 93.05, { from: [0.05, 0.4, 1], pull: 1.02 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 2.6, 1.6); fill.intensity = 2; CAM.apply(CAM.track(t, [[83.25, A0], [89.9, A1, 4.0], [90.3, B0, 0.3], [93.05, B1, 2.6]])); };
});

// ---------------------------------------------------------------- 14. escolha (93.05 – 100.2)
// "Então me diz: combustível deve pagar mais imposto que comida... ou menos?"
addScene("escolha", 93.05, 100.2, (S) => {
  const sc = makeBalance(); S.add(sc.group);
  const pump = makePump({ label: "GASOLINA", screenDetail: true }); pump.group.scale.setScalar(0.8); pump.group.position.set(0, sc.panTop, 0); sc.pans[0].add(pump.group); pump.screen("R$ 50,00");
  const cart = makeCart(); cart.scale.setScalar(1.3); cart.position.set(0, sc.panTop, 0); sc.pans[1].add(cart);
  const bag = makeRiceBag(0.5); bag.position.set(0.1, cart.userData.floorY, 0); cart.add(bag); bag.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; });
  S.hero(sc.group, "balança de dois pratos"); S.solid(sc.group, "balança");
  const anim = (t) => {
    const a = 0.16 * Math.sin((t - 93.05) * 1.1) * (1 - sm(t, 95.4, 95.8)) + 0.14 * sm(t, 95.4, 95.8) * (1 - sm(t, 97.3, 97.7)) - 0.14 * sm(t, 97.3, 97.7);
    sc.setTilt(a);
  };
  const shot = shotOf(anim);
  const A0 = shot([sc.group], 93.05, 100.2, { from: [0.2, 0.25, 1], pull: 1.08 }), A1 = shot([sc.group], 93.05, 100.2, { from: [-0.1, 0.2, 1], pull: 1.02 });
  return (t) => { anim(t); fill.color.set(ORANGE); fill.position.set(0, 3, 1.6); fill.intensity = 2.5; CAM.apply(CAM.blend(A0, A1, sm(t, 93.05, 100.2))); };
});
