// ============================================================================
// videos/2026-10-31-master-lula-bolsonaro/scenes.js
// Quem está ligado ao caso Master? Lula, Bolsonaro e Vorcaro. Three sets: a cork evidence board in a
// dark room (real photos as polaroids, red strings), the PF desk (case file, phone, rubber stamps), and
// a generic bank front (MÁXIMA → MASTER → LIQUIDADO). Narration 0–104.4 s (audio/words.json), video 106.4 s.
//
// Pattern for every scene: anim(t) moves objects only; the camera comes from CAM.pose/CAM.move on the
// boxes of what the shot is about, inside the centred safe zone ("stage": the headline always has text
// in this video). Backdrops (room, desk, skyline) fill the frame and are never checked.
// Photo credits must fit one source line, so a board scene only holds the prints whose credits are in
// its source line; the centre of the board is a paper card (VORCARO) that needs no credit.
// ============================================================================

const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const brightSteel = () => pmat("#c3c6cc", { metalness: 1, roughness: 0.3 });

// ---------------------------------------------------------------- shared light and air
function indoorLight({ k = 1.9, h = 0.34, env = 0.34 } = {}) { key.intensity = k; key.color.set("#ffc497"); hemi.intensity = h; scene.environmentIntensity = env; floor.visible = false; }
function indoorFog() { const d = CAM.last.dist; scene.fog.near = d * 1.05 + 0.6; scene.fog.far = d * 2.8 + 8; }
function fillAt(color, x, y, z, k) { fill.color.set(color); fill.position.set(x, y, z); fill.intensity = k; }
// A sequence of shots [[t0, (t) => pose, d?], ...]: each one eases in from the previous one over `d` seconds.
function shotSeq(t, list, d = 0.7) {
  let i = 0; while (i + 1 < list.length && t >= list[i + 1][0]) i++;
  const cur = list[i][1](t); if (i === 0) return cur;
  const dd = list[i][2] ?? d, k = sm(t, list[i][0], list[i][0] + dd); return k >= 1 ? cur : CAM.blend(list[i - 1][1](t), cur, k);
}
// One named camera move over [t0, t1] as a shot for shotSeq.
const moveShot = (box, kind, t0, t1, o) => (t) => CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o });

// Dust motes drifting in the light (backdrop). API { points, update(t) }
const MOTE = (() => { const c = makeCanvas(64, 64), x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return texFrom(c); })();
function makeDustMotes(n, box, { color = "#ffdcb4", size = 0.06, seed = 3, opacity = 0.5 } = {}) {
  const r = mulberry32(seed), base = [];
  for (let i = 0; i < n; i++) base.push([lerp(box[0][0], box[1][0], r()), lerp(box[0][1], box[1][1], r()), lerp(box[0][2], box[1][2], r()), r() * 6.28]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const mtl = new THREE.PointsMaterial({ color, size, map: MOTE, transparent: true, opacity, depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mtl); points.userData.decor = true; points.frustumCulled = false;
  const H = box[1][1] - box[0][1];
  const update = (t) => {
    const a = geo.attributes.position.array;
    base.forEach(([x, y, z, ph], i) => { a[i * 3] = x + 0.25 * Math.sin(t * 0.21 + ph); a[i * 3 + 1] = box[0][1] + ((y - box[0][1] + 0.05 * t + 1000 * H) % H); a[i * 3 + 2] = z + 0.2 * Math.cos(t * 0.17 + ph); });
    geo.attributes.position.needsUpdate = true;
  };
  update(0); return { points, update, mtl };
}
// Window with blinds at night: cool light through the slats. set(k, colour?) dims it or tints it
// (the police lights in "alvo da PF"). Origin: centre. API { group, set }
function makeNightBlinds(w = 2.4, h = 2.4, tint = "#9db8ff") {
  const g = new THREE.Group(), frame = mat("#20160f", { roughness: 0.6 });
  const glow = new THREE.MeshBasicMaterial({ color: tint, toneMapped: false });
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h / 9 * 0.62), glow); s.position.set(0, -h / 2 + (i + 0.5) * h / 9, 0); g.add(s); }
  for (const [bw, bh, x, y] of [[w + 0.16, 0.08, 0, h / 2 + 0.04], [w + 0.16, 0.08, 0, -h / 2 - 0.04], [0.08, h, -w / 2 - 0.04, 0], [0.08, h, w / 2 + 0.04, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), frame); b.position.set(x, y, 0.02); g.add(b); }
  const set = (k, color = tint) => glow.color.set(color).multiplyScalar(0.42 * k);
  set(1); asBackdrop(g);
  return { group: g, set };
}
// Grey steel filing cabinet with four drawers. Origin: floor centre.
function makeFileCabinet() {
  const g = new THREE.Group(), cm = mat("#4f5a60", { metalness: 0.55, roughness: 0.45 });
  const body = new THREE.Mesh(rbox(0.9, 2.1, 0.8, 0.03), cm); body.position.y = 1.05; g.add(body);
  for (let i = 0; i < 4; i++) {
    const dr = new THREE.Mesh(rbox(0.82, 0.44, 0.02, 0.01), mat("#5d6a70", { metalness: 0.55, roughness: 0.4 })); dr.position.set(0, 0.32 + i * 0.5, 0.41); g.add(dr);
    const hd = new THREE.Mesh(rbox(0.22, 0.04, 0.04, 0.01), brightSteel()); hd.position.set(0, 0.42 + i * 0.5, 0.43); g.add(hd);
  }
  return g;
}
// The investigation room around the board: plank floor, dark plaster wall, a window with blinds, a
// filing cabinet, dust in the light. Backdrop. API { group, blinds, update(t) }
function makeCaseRoom({ wallZ = -1.3 } = {}) {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(44, 26), mat("#ffffff", { map: tileTex(woodTex("#4a3122"), 12, 7), roughness: 0.55 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.001, wallZ + 13); g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 18), mat("#ffffff", { map: tileTex(plasterTex("#33261f"), 8, 3), roughness: 0.95 })); wall.position.set(0, 9, wallZ); g.add(wall);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(44, 0.18, 0.04), mat("#22170f")); skirt.position.set(0, 0.09, wallZ + 0.02); g.add(skirt);
  const blinds = makeNightBlinds(2.4, 2.6); blinds.group.position.set(-7.2, 3.4, wallZ + 0.03); g.add(blinds.group);
  const cab = makeFileCabinet(); cab.position.set(7.0, 0, wallZ + 0.45); g.add(cab);
  const dust = makeDustMotes(160, [[-8, 0.2, -1.0], [8, 9, 5]], { seed: 13 }); g.add(dust.points);
  asBackdrop(g);
  return { group: g, blinds, dust, update: (t) => dust.update(t) };
}

// ---------------------------------------------------------------- the evidence board
const BOARD = { w: 9.6, h: 5.0, lift: 0.4 };
const BOARD_CY = BOARD.lift + BOARD.h / 2;
// Where each item hangs (x, y from the centre of the cork; tilt). Left: Lula's side; right: Bolsonaro's.
const SPOT = {
  vorcaro: [0, 0.75, 0.0], lula: [-2.3, 1.05, 0.03], bolsonaro: [2.3, 1.05, -0.035],
  cunhado: [1.0, -1.25, 0.035], ciro: [2.75, -1.35, -0.05], flavio: [4.1, 1.05, 0.045],
  mantega: [-1.05, -1.5, -0.04],
};
const PAPER_TEX = noiseTex({ base: "#efe6d2", amount: 0.07, size: 1.2, seed: 77 });
// Paper index card pinned to the board, with one or two lines printed on it (makePlate, no background).
// Same shape as a photo print for dropPrint: { group, pin, pinTop, w, h }
function makeEvidenceCard(lines, { w = 1.6, h = 1.0, ink = "#1c1410" } = {}) {
  const g = new THREE.Group();
  const sheet = new THREE.Mesh(rbox(w, h, 0.02, 0.008), mat("#ffffff", { map: PAPER_TEX, roughness: 0.92 })); sheet.position.z = 0.01; g.add(sheet);
  const rows = lines.length === 1 ? [[lines[0], h * 0.46, -h * 0.07]] : [[lines[0], h * 0.31, h * 0.06], [lines[1], h * 0.28, -h * 0.25]];
  for (const [t, ph, y] of rows) { const p = makePlate(t, w * 0.86, ph, { bg: null, fg: ink, depth: 0.001 }); p.position.set(0, y, 0.0215); g.add(p); }
  const pinTop = new V3(0, h / 2 - 0.1, 0.02), pin = makePin(); pin.position.copy(pinTop); g.add(pin);
  return { group: g, pin, pinTop, w, h };
}
// Kraft envelope (flap, a white label with the printed text). Origin: centre; faces +z.
function makeEnvelope(label, { w = 1.25, h = 0.8, color = "#c8a170" } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(w, h, 0.025, 0.01), mat(color, { roughness: 0.85 })); g.add(body);
  const fl = new THREE.Shape(); fl.moveTo(-w / 2 + 0.01, h / 2 - 0.01); fl.lineTo(w / 2 - 0.01, h / 2 - 0.01); fl.lineTo(0, h * 0.02); fl.closePath();
  const flap = new THREE.Mesh(new THREE.ExtrudeGeometry(fl, { depth: 0.006, bevelEnabled: false }), mat("#ad8656", { roughness: 0.8 })); flap.position.z = 0.0125; g.add(flap);
  const p = makePlate(label, w * 0.8, h * 0.42, { bg: "#f6efe2", fg: "#9c1d14", depth: 0.004 }); p.position.set(0, -h * 0.26, 0.016); g.add(p);
  return { group: g, w, h };
}
function makeBoardItem(id) {
  if (id === "vorcaro") return makeEvidenceCard(["VORCARO"], { w: 1.9, h: 0.95 });
  if (id === "cunhado") return makeEvidenceCard(["CUNHADO", "DE VORCARO"], { w: 1.75, h: 1.12 });
  return makePhotoPrint(id, { w: 1.3, shape: "retrato" });
}
// Builds the room + board with the given items at rest. Strings run pin to pin; `from`/`to` pick another
// point on an item (local x, y), where a second pin is pushed in, so a string never crosses a face.
// API { items, board, room, link(a, b, o), box(...ids), update(t) }
function buildBoard(S, ids, spots = {}) {
  const B = { items: {} };
  B.room = makeCaseRoom(); S.backdrop(B.room.group);
  B.board = makeCorkBoard(BOARD); S.backdrop(B.board.group);
  for (const id of ids) {
    const it = makeBoardItem(id), [x, y, rz] = spots[id] || SPOT[id];
    it.rest = { pos: new V3(x, BOARD_CY + y, B.board.face + 0.01), rotZ: rz };
    B.board.group.add(it.group); B.items[id] = it; dropPrint(it, 99, 0, it.rest);
  }
  const at = (id, lp) => { const it = B.items[id], r = it.rest; return new V3(r.pos.x + lp.x * Math.cos(r.rotZ) - lp.y * Math.sin(r.rotZ), r.pos.y + lp.x * Math.sin(r.rotZ) + lp.y * Math.cos(r.rotZ), r.pos.z + 0.17); };
  const pins = {};
  const end = (id, xy) => {
    if (!xy) return at(id, B.items[id].pinTop);
    const k = id + ":" + xy.join(","); // one pin per point, however many strings start there
    if (!pins[k]) { const p = makePin(); p.position.set(xy[0], xy[1], 0.02); B.items[id].group.add(p); pins[k] = true; }
    return at(id, new V3(xy[0], xy[1], 0));
  };
  B.link = (a, b, { sag = 0.12, from = null, to = null } = {}) => {
    const pa = end(a, from), pb = end(b, to), s = makeString(pa, pb, { sag });
    s.a = pa; s.b = pb; s.sag = sag; B.board.group.add(s.mesh); return s;
  };
  B.box = (...list) => frameBox(...list.map((id) => B.items[id].group));
  B.update = (t) => { B.room.update(t); B.board.group.updateMatrixWorld(true); };
  return B;
}
// Point at k (0..1) along a string made by B.link (the same curve as makeString).
function stringPoint(s, k) {
  const mid = s.a.clone().add(s.b).multiplyScalar(0.5); mid.y -= s.sag; mid.z += 0.04; const u = 1 - k;
  return s.a.clone().multiplyScalar(u * u).add(mid.multiplyScalar(2 * u * k)).add(s.b.clone().multiplyScalar(k * k));
}
// An envelope hanging from a string at k: it sits in front, the string tucked under its top edge.
function hangOn(env, s, k, sway = 0) { const p = stringPoint(s, k); env.group.position.set(p.x, p.y - env.h / 2 + 0.06, p.z + 0.05); env.group.rotation.z = sway; }
// Box of an envelope at full size wherever it is (for a camera that follows it).
function envBox(env) { const c = env.group.getWorldPosition(new V3()), hw = new V3(env.w * 0.55, env.h * 0.6, 0.05); return new THREE.Box3(c.clone().sub(hw), c.clone().add(hw)); }
// Corner points on a print (local), for the second pins.
const PRINT_BL = [-0.46, -0.8], PRINT_BR = [0.46, -0.8], PRINT_R = [0.56, -0.05];
const CARD_BL = [-0.78, -0.36], CARD_BR = [0.78, -0.36];

// ---------------------------------------------------------------- the PF desk
// Varnished desk (y = 0 is its top), dark wall with a night window, a shelf of binders, a desk lamp.
// Backdrop. API { group, blinds, lamp (PointLight), bulb }
function makePFDesk({ wallZ = -3.2 } = {}) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(30, 0.2, 14), mat("#ffffff", { map: tileTex(woodTex("#4f3222"), 8, 3.7), roughness: 0.42, envMapIntensity: 0.7 })); top.position.set(0, -0.1, wallZ + 7); g.add(top);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), mat("#ffffff", { map: tileTex(plasterTex("#2c221d"), 9, 3.5), roughness: 0.95, envMapIntensity: 0.4 })); wall.position.set(0, 8.8, wallZ); g.add(wall);
  const blinds = makeNightBlinds(2.6, 1.9); blinds.group.position.set(4.8, 1.5, wallZ + 0.02); g.add(blinds.group);
  const shelfM = mat("#ffffff", { map: woodTex("#3d281b"), roughness: 0.6 }), r = mulberry32(41);
  const shelf = new THREE.Mesh(rbox(3.0, 0.08, 0.5, 0.02), shelfM); shelf.position.set(-5.6, 1.7, wallZ + 0.27); g.add(shelf);
  const cols = ["#7a2e22", "#2f4a6a", "#5a4a2a", "#3d5a3a", "#2a2a2a"];
  let bx = -6.95; for (let i = 0; i < 9; i++) { const bw = 0.16 + r() * 0.08, bh = 0.5 + r() * 0.12; const b = new THREE.Mesh(rbox(bw, bh, 0.4, 0.015), mat(cols[i % cols.length], { roughness: 0.7 })); b.position.set(bx + bw / 2, 1.74 + bh / 2, wallZ + 0.27); g.add(b); bx += bw + 0.02; }
  const lamp = new THREE.Group(), lm = mat("#1f1f22", { metalness: 0.6, roughness: 0.35 }); lamp.position.set(-2.8, 0, wallZ + 1.5); g.add(lamp);
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 28), lm); lb.position.y = 0.03; lamp.add(lb);
  const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 10), lm); a1.position.set(0.18, 0.55, 0); a1.rotation.z = -0.35; lamp.add(a1);
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 10), lm); a2.position.set(0.62, 1.12, 0); a2.rotation.z = 1.1; lamp.add(a2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.34, 28, 1, true), mat("#1f1f22", { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); shade.position.set(0.98, 0.95, 0); shade.rotation.z = 0.5; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); bulb.position.set(1.02, 0.86, 0); lamp.add(bulb);
  const lampLight = new THREE.PointLight("#ffb36b", 2.6, 7, 1.5); lampLight.position.set(1.05, 0.8, 0.1); lamp.add(lampLight);
  const mug = new THREE.Group(); mug.position.set(-4.2, 0, -2.2); g.add(mug);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.3, 24), pmat("#e9e2d6", { roughness: 0.3, clearcoat: 0.6 })); cup.position.y = 0.15; mug.add(cup);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 16), pmat("#e9e2d6", { roughness: 0.3 })); handle.position.set(0.15, 0.16, 0); mug.add(handle);
  asBackdrop(g);
  return { group: g, blinds, lamp: lampLight, bulb };
}
function buildDesk(S) {
  const set = makePFDesk(); S.backdrop(set.group);
  return {
    set, blinds: set.blinds,
    light(k = 1) { key.intensity = 1.55 * k; key.color.set("#ffc9a0"); hemi.intensity = 0.3 * k; scene.environmentIntensity = 0.32; floor.visible = false; set.lamp.intensity = 2.6 * k; set.bulb.material.color.set("#ffd9a0").multiplyScalar(0.5 + 1.5 * k); },
  };
}
// Manila case file lying flat on the desk, label printed on the cover (+ an optional small red tag).
// Origin: desk surface, centre; the tab is at the back (-z). API { group, top, w, d }
function makeCaseFile(label, { w = 1.4, d = 1.0, sub = null, labelX = 0, labelW = 0.62, labelDetail = false, color = "#cfa762" } = {}) {
  const g = new THREE.Group(), kraft = pmat(color, { map: noiseTex({ base: "#e6e6e6", amount: 0.1, seed: 52 }), roughness: 0.85 });
  const back = new THREE.Mesh(rbox(w, 0.024, d, 0.008), kraft); back.position.y = 0.012; g.add(back);
  const pages = new THREE.Mesh(rbox(w - 0.06, 0.02, d - 0.05, 0.004), pmat("#f1ece2", { roughness: 0.9 })); pages.position.set(0, 0.034, 0); g.add(pages);
  const cover = new THREE.Mesh(rbox(w, 0.012, d, 0.006), kraft); cover.position.y = 0.05; g.add(cover);
  const tab = new THREE.Mesh(rbox(w * 0.32, 0.012, 0.11, 0.006), kraft); tab.position.set(-w * 0.26, 0.05, -d / 2 - 0.045); g.add(tab);
  const top = 0.056;
  const lp = makePlate(label, w * labelW, d * 0.24, { bg: "#f4efe6", fg: "#1c1410", depth: 0.004, detail: labelDetail }); lp.rotation.x = -Math.PI / 2; lp.position.set(labelX, top + 0.002, -d * 0.24); g.add(lp);
  if (sub) { const sp = makePlate(sub, w * 0.34, d * 0.09, { bg: RED, fg: "#ffffff", depth: 0.003, detail: true }); sp.rotation.x = -Math.PI / 2; sp.position.set(labelX, top + 0.0015, -d * 0.24 + d * 0.19); g.add(sp); }
  return { group: g, top, w, d };
}
// A typed sheet of paper lying flat (title, subtitle, grey text lines, a signature line).
// Origin: desk surface, centre. API { group, w, h, top }
function makePaperSheet(title, sub, { w = 0.9, h = 1.22 } = {}) {
  const c = makeCanvas(900, 1220), x = c.getContext("2d"), r = mulberry32(title.length * 7 + 3);
  x.fillStyle = "#f2ede2"; x.fillRect(0, 0, 900, 1220);
  for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.04})`; x.fillRect(r() * 900, r() * 1220, 2, 2); }
  x.fillStyle = "#1c1410"; x.font = "900 66px Inter"; x.textAlign = "left"; x.fillText(title, 70, 150);
  x.fillStyle = "#5a504a"; x.font = "600 38px Inter"; x.fillText(sub, 70, 215);
  x.fillStyle = "rgba(40,30,25,0.18)"; for (let i = 0; i < 13; i++) { const lw = 600 + r() * 160; roundRect(x, 70, 300 + i * 52, i % 5 === 4 ? lw * 0.55 : lw, 16, 6); x.fill(); }
  x.strokeStyle = "rgba(40,30,25,0.5)"; x.lineWidth = 3; x.beginPath(); x.moveTo(470, 1100); x.lineTo(830, 1100); x.stroke();
  const side = mat("#ece6da", { roughness: 0.9 }), face = mat("#ffffff", { map: texFrom(c), roughness: 0.85 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.006, h), [side, side, face, side, side, side]); m.position.y = 0.003;
  const g = new THREE.Group(); g.add(m); return { group: g, w, h, top: 0.006 };
}
// Rubber-stamp ink mark (framed word, worn edges) lying flat. Registered as printed text for the QA.
function makeInkMark(text, color, { w = 0.8, h = 0.27 } = {}) {
  const pw = 1024, ph = Math.round(pw * h / w), c = makeCanvas(pw, ph), x = c.getContext("2d");
  x.strokeStyle = color; x.lineWidth = ph * 0.075; roundRect(x, ph * 0.08, ph * 0.08, pw - ph * 0.16, ph - ph * 0.16, ph * 0.12); x.stroke();
  let px = Math.round(ph * 0.56); x.font = `900 ${px}px Inter`; while (x.measureText(text).width > pw * 0.8 && px > 10) { px -= 2; x.font = `900 ${px}px Inter`; }
  x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, pw / 2, ph / 2 + px * 0.05);
  x.globalCompositeOperation = "destination-out"; const r = mulberry32(text.length * 13);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.6})`; const s = 1 + r() * 4; x.fillRect(r() * pw, r() * ph, s, s); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texFrom(c), transparent: true, depthWrite: false, roughness: 0.9 }));
  m.rotation.x = -Math.PI / 2; m.userData.plate = { text, w, h, depth: 0, frac: px / ph, detail: false }; m.userData.noShadow = true;
  const g = new THREE.Group(); g.add(m); return g;
}
// Chat list on the phone screen: avatars and blurred lines (nothing readable), unread dots.
function paintChatList(ctx, on) {
  const x = ctx; x.clearRect(0, 0, 720, 1500); x.fillStyle = "#050506"; x.fillRect(0, 0, 720, 1500);
  if (!on) return;
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#141820"); g.addColorStop(1, "#0b0d12"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = "#9aa3b2"; x.font = "700 38px Inter"; x.textAlign = "left"; x.fillText("23:47", 46, 74);
  x.fillStyle = "#ffffff"; x.font = "900 64px Inter"; x.fillText("Conversas", 46, 210);
  const r = mulberry32(5);
  for (let i = 0; i < 8; i++) {
    const y = 290 + i * 150;
    x.fillStyle = `hsl(${(i * 47) % 360},18%,${32 + r() * 10}%)`; x.beginPath(); x.arc(100, y + 50, 46, 0, Math.PI * 2); x.fill();
    x.filter = "blur(7px)"; x.fillStyle = "#d9dde6"; roundRect(x, 176, y + 18, 220 + r() * 160, 26, 13); x.fill();
    x.fillStyle = "#7d8696"; roundRect(x, 176, y + 64, 300 + r() * 160, 22, 11); x.fill(); x.filter = "none";
    if (i % 3 === 0) { x.fillStyle = "#2fae66"; x.beginPath(); x.arc(650, y + 46, 18, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = "rgba(255,255,255,0.06)"; x.fillRect(176, y + 128, 520, 2);
  }
}

// ---------------------------------------------------------------- the bank front
// Generic bank (no real brand): stone wall, four columns, pediment, glass door; the name sign turns over
// on an axle (split-flap) from `name` to `next`; optional roll-down shutter with LIQUIDADO; `worn` adds
// grime and cracks. Origin: floor centre; faces +z. API { group, sign, plA, plB, shutter, glow(k) }
function crackTex(seed) {
  const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(seed);
  x.strokeStyle = "rgba(40,30,22,0.5)"; x.lineCap = "round";
  for (let k = 0; k < 3; k++) {
    let px = 120 + r() * 280, py = 40 + r() * 80; x.lineWidth = 3; x.beginPath(); x.moveTo(px, py);
    for (let i = 0; i < 14; i++) { px += (r() - 0.5) * 70; py += 20 + r() * 30; x.lineTo(px, py); if (r() < 0.25) { x.stroke(); x.lineWidth = Math.max(1.5, x.lineWidth - 1); x.beginPath(); x.moveTo(px, py); } }
    x.stroke();
  }
  return texFrom(c);
}
function makeBankFacade({ name = "BANCO MASTER", next = null, worn = false, shutter = false } = {}) {
  const g = new THREE.Group();
  const stoneT = noiseTex({ base: worn ? "#b3a796" : "#d8cfc1", amount: worn ? 0.17 : 0.1, size: 2, seed: 71 }); stoneT.repeat.set(3, 2);
  const stone = pmat("#ffffff", { map: stoneT, roughness: 0.75 });
  const wall = new THREE.Mesh(rbox(3.2, 2.6, 0.3, 0.02), stone); wall.position.set(0, 1.3, -0.15); g.add(wall);
  const steps = new THREE.Mesh(rbox(3.6, 0.16, 0.9, 0.02), stone); steps.position.set(0, 0.08, 0.35); g.add(steps);
  for (const x of [-1.25, -0.7, 0.7, 1.25]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.1, 32), stone); c.position.set(x, 0.16 + 1.05, 0.45); g.add(c); }
  const beam = new THREE.Mesh(rbox(3.4, 0.3, 0.8, 0.02), stone); beam.position.set(0, 2.45, 0.2); g.add(beam);
  const ped = new THREE.Shape(); ped.moveTo(-1.75, 0); ped.lineTo(1.75, 0); ped.lineTo(0, 0.55); ped.closePath();
  const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 0.7, bevelEnabled: false }), stone); pm.position.set(0, 2.6, -0.15); g.add(pm);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 1.68), new THREE.MeshBasicMaterial({ color: worn ? "#1a120c" : "#5a3d22", toneMapped: false })); inside.position.set(0, 1.01, 0.002); g.add(inside);
  const glassD = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.7), pmat("#1d252c", { metalness: 0.3, roughness: 0.06, clearcoat: 1, envMapIntensity: 1.6, transparent: true, opacity: 0.55 })); glassD.position.set(0, 1.01, 0.006); g.add(glassD);
  const bronze = pmat("#8a6a3a", { metalness: 0.9, roughness: 0.35 });
  for (const [bw, bh, x, y] of [[1.1, 0.05, 0, 1.885], [0.05, 1.72, -0.525, 1.01], [0.05, 1.72, 0.525, 1.01], [0.035, 1.7, 0, 1.01], [1.0, 0.035, 0, 1.42]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.04), bronze); b.position.set(x, y, 0.02); g.add(b); }
  for (const x of [-0.07, 0.07]) { const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.36, 10), bronze); hd.position.set(x, 1.0, 0.04); g.add(hd); }
  if (worn) for (const [x, y, s] of [[-1.0, 1.25, 1], [1.0, 0.95, 2]]) { const cr = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.2), new THREE.MeshStandardMaterial({ map: crackTex(s), transparent: true, depthWrite: false, roughness: 0.9 })); cr.position.set(x, y, 0.003); g.add(cr); }
  const sign = new THREE.Group(); sign.position.set(0, 2.45, 0.76); g.add(sign);
  const plA = makePlate(name, 2.2, 0.28, { bg: "#1c1410", fg: "#d9b66a" }); plA.position.z = 0.016; sign.add(plA);
  let plB = null;
  if (next) { plB = makePlate(next, 2.2, 0.28, { bg: "#1c1410", fg: "#f0cf7d" }); plB.rotation.x = Math.PI; plB.position.z = -0.016; sign.add(plB); }
  for (const x of [-1.16, 1.16]) { const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), brightSteel()); ax.rotation.x = Math.PI / 2; ax.position.set(x, 2.45, 0.68); g.add(ax); }
  let sh = null;
  if (shutter) { sh = makeShutter({ w: 1.1, h: 1.8, n: 12, sign: "LIQUIDADO" }); sh.group.position.set(0, 0.16, 0.08); sh.set(0); g.add(sh.group); }
  g.add(contactShadow(4.2, 2));
  const faces = [plA, plB].filter(Boolean).map((p) => p.material[4]);
  return { group: g, sign, plA, plB, shutter: sh, glow: (k) => faces.forEach((m) => m.color.setScalar(k)) };
}
// Red sign hanging on two thin chains. Origin: the top of the chains. API { group, board }
function makeHangingSign(text, { w = 1.1, h = 0.36, chain = 0.3 } = {}) {
  const g = new THREE.Group();
  const board = makePlate(text, w, h, { bg: RED, fg: "#ffffff", depth: 0.035 }); board.position.y = -chain - h / 2; g.add(board);
  for (const x of [-w * 0.36, w * 0.36]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, chain, 8), brightSteel()); c.position.set(x, -chain / 2, 0); g.add(c);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16), brightSteel()); hook.position.set(x, -chain - 0.01, 0.02); g.add(hook);
  }
  return { group: g, board };
}
// Lit windows of a makeSkyline backdrop: 1 = normal, 0 = the city goes dark.
function skyGlow(sky, k) { sky.group.traverse((m) => { if (m.isMesh && Array.isArray(m.material) && m.material[4]) m.material[4].color.setScalar(k); }); }

// ---------------------------------------------------------------- FGC set (the analogy: the insurance)
// Stack of big gold coins (instanced). Origin bottom centre. set(k) shows k·n coins.
function makeGoldStack(n, { r = 0.13, t = 0.03, seed = 3 } = {}) {
  const g = new THREE.Group(), rnd = mulberry32(seed);
  const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, t, 40), pmat(GOLD_METAL, { metalness: 1, roughness: 0.26 }), n);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.set((rnd() - 0.5) * 0.012, t / 2 + i * t * 1.02, (rnd() - 0.5) * 0.012); d.rotation.set(0, rnd() * 6, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
  g.add(m); g.add(contactShadow(r * 3, r * 3));
  return { group: g, set: (k) => { m.count = Math.max(1, Math.round(clamp(k) * n)); } };
}
// Black marble plinth. Origin floor centre.
function makeMarblePlinth(w, h, d) {
  const tex = noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 }); tex.repeat.set(2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#1b1a1d", { map: tex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2;
  const g = new THREE.Group(); g.add(m); g.add(contactShadow(w + 0.6, d + 0.6)); return g;
}
// Polished steel shield with a gold rim and a printed plate. Origin centre; faces +z.
function makeGuardShield(label = "FGC", { w = 1.0, h = 1.2 } = {}) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, h / 2); s.lineTo(w / 2, h / 2); s.lineTo(w / 2, 0); s.quadraticCurveTo(w / 2, -h * 0.32, 0, -h / 2); s.quadraticCurveTo(-w / 2, -h * 0.32, -w / 2, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 }); geo.translate(0, 0, -0.04);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, pmat("#cdd2d8", { metalness: 1, roughness: 0.18, clearcoat: 0.5 })));
  const rimS = new THREE.Shape(s.getPoints(48)); const inner = s.getPoints(48).map((p) => p.clone().multiplyScalar(0.86)); rimS.holes.push(new THREE.Path(inner.reverse()));
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(rimS, { depth: 0.03, bevelEnabled: false }), pmat(GOLD_METAL, { metalness: 1, roughness: 0.25 })); rim.position.z = 0.07; g.add(rim);
  const p = makePlate(label, w * 0.72, h * 0.3, { bg: "#14171c", fg: "#f4e3b5", depth: 0.01 }); p.position.set(0, h * 0.08, 0.1); g.add(p);
  return g;
}

// ---------------------------------------------------------------- film set
function zebraTex(shift = 0) {
  const c = makeCanvas(512, 64), x = c.getContext("2d"); x.fillStyle = "#f2f0ea"; x.fillRect(0, 0, 512, 64);
  x.fillStyle = "#151515"; for (let i = -2; i < 12; i++) { const x0 = i * 56 + shift; x.beginPath(); x.moveTo(x0, 64); x.lineTo(x0 + 28, 64); x.lineTo(x0 + 56, 0); x.lineTo(x0 + 28, 0); x.fill(); }
  return texFrom(c);
}
// Film clapperboard (generic): black slate with chalk lines and a printed title, striped band, hinged
// stick. Origin: bottom centre; faces +z. API { group, open(k) } — k 0 closed, 1 open.
function makeClapperboard(label = "FILME", { w = 1.3, h = 0.95 } = {}) {
  const g = new THREE.Group(), dark = pmat("#18181a", { roughness: 0.5, clearcoat: 0.4 });
  const body = new THREE.Mesh(rbox(w, h, 0.05, 0.015), dark); body.position.y = h / 2; g.add(body);
  const cw = 1024, chh = Math.round(cw * h / w), c = makeCanvas(cw, chh), x = c.getContext("2d");
  x.strokeStyle = "rgba(240,236,228,0.85)"; x.lineWidth = 5;
  for (const yy of [0.36, 0.62, 0.84]) { x.beginPath(); x.moveTo(30, chh * yy); x.lineTo(cw - 30, chh * yy); x.stroke(); }
  for (const xx of [0.36, 0.68]) { x.beginPath(); x.moveTo(cw * xx, chh * 0.62); x.lineTo(cw * xx, chh * 0.97); x.stroke(); }
  x.fillStyle = "rgba(240,236,228,0.85)"; x.font = "700 40px Inter"; x.textAlign = "left";
  [["CENA", 0.04], ["TAKE", 0.39], ["ROLO", 0.71]].forEach(([s, xx]) => x.fillText(s, cw * xx, chh * 0.7));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.96), new THREE.MeshStandardMaterial({ map: texFrom(c), transparent: true, roughness: 0.8 })); face.position.set(0, h / 2, 0.026); g.add(face);
  const t = makePlate(label, w * 0.8, h * 0.28, { bg: "#18181a", fg: "#f4f1ea", depth: 0.004 }); t.position.set(0, h * 0.82, 0.028); g.add(t);
  const zm = (s) => new THREE.MeshStandardMaterial({ map: zebraTex(s), roughness: 0.6 });
  const band = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.05), [dark, dark, dark, dark, zm(0), dark]); band.position.y = h + 0.07; g.add(band);
  const hinge = new THREE.Group(); hinge.position.set(-w / 2, h + 0.14, 0); g.add(hinge);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(w, 0.13, 0.05), [dark, dark, dark, dark, zm(28), dark]); stick.position.set(w / 2, 0.07, 0); hinge.add(stick);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.07, 12), brightSteel()); axle.rotation.x = Math.PI / 2; axle.position.set(0.04, 0.0, 0); hinge.add(axle);
  const strut = new THREE.Mesh(rbox(0.06, h * 0.9, 0.04, 0.01), dark); strut.position.set(0, h * 0.42, -0.2); strut.rotation.x = 0.36; g.add(strut);
  return { group: g, open: (k) => { hinge.rotation.z = 0.6 * clamp(k); } };
}

// Bundle of banknotes: printed faces on top and bottom, note-coloured paper edges, a paper band.
// Origin: bottom centre (lies flat).
const NOTE_EDGES = (() => { const c = makeCanvas(256, 64), x = c.getContext("2d"), r = mulberry32(19); x.fillStyle = "#6f93a3"; x.fillRect(0, 0, 256, 64); for (let y = 0; y < 64; y += 2) { x.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"; x.fillRect(0, y, 256, 1); } return texFrom(c); })();
function makeBillBundle({ w = 0.48, d = 0.22, h = 0.07 } = {}) {
  const g = new THREE.Group(), side = pmat("#ffffff", { map: NOTE_EDGES, roughness: 0.85 }), face = pmat("#ffffff", { map: NOTE100, roughness: 0.75 });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, face, face, side, side]); stack.position.y = h / 2; g.add(stack);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.05, h + 0.004, d + 0.004), pmat("#e9d9a6", { roughness: 0.7 })); band.position.y = h / 2; g.add(band);
  return g;
}

// ============================================================ 1 · gancho (0–5.2)
// "E se eu te dissesse que tanto Lula quanto Bolsonaro estão ligados ao Vorcaro?"
addScene("gancho", 0, 5.2, (S) => {
  const B = buildBoard(S, ["vorcaro", "lula", "bolsonaro"], { lula: [-0.85, 0.85, 0.03], bolsonaro: [0.85, 0.85, -0.035], vorcaro: [0, -1.15, 0] });
  const V = B.items.vorcaro, L = B.items.lula, R = B.items.bolsonaro;
  const sL = B.link("lula", "vorcaro", { from: PRINT_BR, sag: 0.06 }), sR = B.link("bolsonaro", "vorcaro", { from: PRINT_BL, sag: 0.06 });
  const box = B.box("vorcaro", "lula", "bolsonaro");
  const anim = (t) => {
    B.update(t);
    dropPrint(L, t, -0.35, L.rest, { from: [-1.4, 0.8, 2.2] }); dropPrint(R, t, -0.2, R.rest, { from: [1.4, 0.8, 2.2] });
    L.zoom(1 + 0.1 * lin(t, 0, 5.2)); R.zoom(1 + 0.1 * lin(t, 0, 5.2));
    sL.setProgress(eOut(lin(t, 3.75, 4.3))); sR.setProgress(eOut(lin(t, 3.95, 4.5)));
    V.group.scale.setScalar(1 + 0.07 * beat(t, 4.55, 0.4));
  };
  S.hero(V.group, "ficha VORCARO"); S.hero(L.group, "polaroid Lula", { when: (t) => t > 0.15 }); S.hero(R.group, "polaroid Bolsonaro", { when: (t) => t > 0.3 });
  return (t) => {
    anim(t); indoorLight();
    // the room answers the words: a warm light on each name, red while the strings are drawn
    const red = beat(t, 3.75, 1.1), fl = beat(t, 1.65, 0.6), fr = beat(t, 2.45, 0.6);
    if (red > 0.01) fillAt(RED, 0, BOARD_CY, 3.0, 2.6 * red); else if (fl > 0.01) fillAt(ORANGE, -0.9, BOARD_CY + 1.2, 2.4, 1.8 * fl); else fillAt(ORANGE, 0.9, BOARD_CY + 1.2, 2.4, 1.8 * fr);
    B.room.dust.mtl.opacity = 0.5 + 0.4 * red;
    CAM.apply(CAM.move(box, "push", lin(t, 0, 5.2), { zone: "stage", from: [0, 0.1, 1], pull0: 1.3 })); indoorFog();
  };
});

// ============================================================ 2 · imagina: você é da PF (5.2–12.55)
// "Imagina: você é da PF. Na sua mão, o celular do dono do Banco Master. Cada conversa puxa um fio."
addScene("pf", 5.2, 12.55, (S) => {
  const D = buildDesk(S);
  const file = makeCaseFile("PF", { sub: "SIGILOSO", labelW: 0.5 }); file.group.position.set(-0.62, 0, 0.05); file.group.rotation.y = 0.1; S.add(file.group);
  const ph = makePhone(); ph.group.scale.setScalar(0.42); ph.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 }); S.add(ph.group);
  ph.group.position.set(0.6, 0.019, 0.12); ph.group.rotation.set(-Math.PI / 2, 0, -0.16); // lying face up
  let lit = -1; const paint = (k) => { if (k === lit) return; lit = k; paintChatList(ph.ctx, k); ph.tex.needsUpdate = true; };
  ph.group.updateMatrixWorld(true);
  // three threads pulled up out of the conversations on the screen
  const knots = new THREE.Group(); S.add(knots);
  const threads = [[-0.15, 0.25, [-0.55, 0.85, -0.25]], [0.1, 0.0, [0.05, 1.05, -0.35]], [-0.05, -0.3, [0.6, 0.8, -0.15]]].map(([sx, sy, d]) => {
    const a = ph.group.localToWorld(new V3(sx, sy, 0.06)), b = a.clone().add(new V3(...d)), s = makeString(a, b, { sag: -0.12, r: 0.01 }); knots.add(s.mesh);
    return s;
  });
  const anim = (t) => {
    paint(t > 7.75 ? 1 : 0); ph.screen.material.color.setScalar(t > 7.75 ? 0.6 + 0.4 * sm(t, 7.75, 8.1) : 1);
    threads.forEach((s, i) => s.setProgress(eOut(lin(t, 11.1 + i * 0.15, 11.85 + i * 0.15))));
  };
  S.hero(file.group, "pasta PF", { when: (t) => t < 7.6 });
  S.hero(ph.group, "celular", { when: (t) => t > 7.6 && t < 9.2 }); S.hero(knots, "fios saindo do celular", { when: (t) => t > 12.0 });
  anim(5.2);
  const deskBox = frameBox(file.group, ph.group), phBox = frameBox(ph.group);
  const A0 = CAM.move(deskBox, "drop", 0, { zone: "stage", from: [0.1, 1.15, 0.8], rise: 0.55 });
  const A1 = CAM.move(deskBox, "drop", 1, { zone: "stage", from: [0.1, 1.15, 0.8], rise: 0.55 });
  const P0 = CAM.pose(phBox, { zone: "stage", from: [0.04, 1.0, 0.4], pull: 1.3 });   // over the phone (your point of view)
  const P1 = CAM.pose(phBox, { zone: "stage", from: [0.1, 1.0, 0.36], pull: 1.08 });
  const P2 = CAM.pose(phBox, { zone: "stage", from: [-0.12, 0.95, 0.42], pull: 1.12 });
  const P3 = CAM.pose(frameBox(ph.group, knots), { zone: "stage", from: [0.05, 0.5, 1], pull: 1.08 }); // in front: the threads rise off the screen
  return (t) => {
    anim(t); D.light(1);
    D.blinds.set(1 + 0.35 * beat(t, 7.75, 0.6));
    fillAt("#7fa8ff", 0.6, 0.5, 0.4, 1.4 * sm(t, 7.75, 8.2) * (1 - 0.4 * sm(t, 11.0, 11.6)));
    if (t > 11.0) fillAt(RED, 0.6, 1.2, 0.5, 1.6 * sm(t, 11.0, 11.6));
    const p = CAM.track(t, [[5.2, A0], [7.55, A1, 2.3], [8.7, P0, 1.1], [9.25, P1, 0.55], [11.05, P2, 1.8], [12.55, P3, 1.4]]);
    CAM.apply(p); indoorFog();
  };
});

// ============================================================ 3 · 2017, o Máxima (12.55–18.15)
// "Tudo começa em 2017: Vorcaro compra um banco quase quebrado, o Máxima."
addScene("maxima", 12.55, 18.15, (S) => {
  const sky = makeSkyline({ z: -12, seed: 4 }); S.add(sky.group);
  const F = makeBankFacade({ name: "BANCO MÁXIMA", worn: true }); S.add(F.group);
  const hs = makeHangingSign("VENDIDO"); F.group.add(hs.group);
  const flicker = (t) => (t > 16.25 && t < 17.7 && Math.sin(t * 53) * Math.sin(t * 17.3) > 0.12 ? 0.22 : 1); // "quase quebrado"
  const anim = (t) => {
    sky.update(t); skyGlow(sky, 0.75);
    F.sign.rotation.z = -0.07; // one screw gone
    F.glow(flicker(t));
    const k = eOut(lin(t, 15.55, 15.9)); hs.group.visible = t > 15.5;
    hs.group.position.set(0, 2.3 + 0.45 * (1 - k), 0.66);
    hs.group.rotation.x = t > 15.9 ? 0.1 * Math.sin((t - 15.9) * 7) * Math.exp(-(t - 15.9) * 1.6) : 0;
  };
  S.hero(F.group, "fachada do banco");
  const box = envelope([F.group], anim, 12.55, 18.15);
  return (t) => {
    anim(t); key.intensity = 1.9;
    fillAt("#ffd28a", 0, 2.6, 2.2, 0.9 * flicker(t));
    CAM.apply(CAM.move(box, "reveal", lin(t, 12.55, 18.15), { zone: "stage", from: [0.16, 0.12, 1], pull0: 1.25 }));
  };
});

// ============================================================ 4 · veto, Campos Neto, aprova (18.15–27.0)
// "Técnicos do Banco Central pedem veto. Mas em 2019, o Banco Central, já com Campos Neto, indicado por
// Bolsonaro, aprova."  (Campos Neto's card covers the stage 22.25–25.95: no hero then.)
addScene("veto", 18.15, 27.0, (S) => {
  const D = buildDesk(S);
  const p1 = makePaperSheet("PARECER TÉCNICO", "Compra do Banco Máxima"), p2 = makePaperSheet("DECISÃO DA DIRETORIA", "Compra do Banco Máxima");
  S.add(p1.group, p2.group);
  const m1 = makeInkMark("VETO", "#c8231a"), m2 = makeInkMark("APROVADO", "#1d8f4c");
  m1.position.set(0.02, 0.0068, 0.15); m1.rotation.y = 0.14; p1.group.add(m1);
  m2.position.set(0.0, 0.0068, 0.15); m2.rotation.y = -0.1; p2.group.add(m2);
  const st1 = makeStamp({ w: 0.86, d: 0.32, ink: "#c8231a" }), st2 = makeStamp({ w: 0.86, d: 0.32, ink: "#1d8f4c" });
  for (const s of [st1, st2]) { s.scale.setScalar(0.68); S.add(s); }
  const R1 = new V3(0, 0, 0.08), R2 = new V3(0.04, 0.008, 0.1);
  // stamp k: 0 high above the mark, 1 pressed on it
  const stampAt = (st, paper, mark, k, ry) => { paper.group.updateMatrixWorld(true); const w = mark.getWorldPosition(new V3()); st.position.set(w.x, w.y + 1.3 * (1 - k), w.z); st.rotation.y = ry; };
  const anim = (t) => {
    const in1 = eOut(lin(t, 18.15, 18.75)), out1 = eInOut(lin(t, 20.95, 21.5));
    p1.group.position.set(R1.x + 2.6 * (1 - in1) - 2.9 * out1, R1.y, R1.z); p1.group.rotation.y = 0.06 + 0.3 * (1 - in1) - 0.2 * out1; p1.group.visible = out1 < 0.999;
    const in2 = eOut(lin(t, 21.05, 21.65));
    p2.group.position.set(R2.x + 2.6 * (1 - in2), R2.y, R2.z); p2.group.rotation.y = -0.05 + 0.3 * (1 - in2); p2.group.visible = t > 21.0;
    m1.visible = t > 19.97; m1.scale.setScalar(t > 19.97 ? 1 + 0.15 * (1 - eOut(lin(t, 19.97, 20.2))) : 1);
    m2.visible = t > 26.33; m2.scale.setScalar(t > 26.33 ? 1 + 0.15 * (1 - eOut(lin(t, 26.33, 26.55))) : 1);
    const k1 = t < 19.96 ? eInOut(lin(t, 19.45, 19.96)) : 1 - eOut(lin(t, 20.0, 20.45));
    st1.visible = t > 19.4 && t < 20.45; stampAt(st1, p1, m1, k1, 0.14);
    const k2 = t < 26.32 ? eInOut(lin(t, 25.95, 26.32)) : 1 - 1.6 * eOut(lin(t, 26.34, 26.56));
    st2.visible = t > 25.9 && t < 26.56; stampAt(st2, p2, m2, k2, -0.1);
  };
  S.hero(p1.group, "papel PARECER TÉCNICO", { when: (t) => t > 18.8 && t < 20.95 });
  S.hero(st1, "carimbo VETO", { when: (t) => t > 19.7 && t < 20.2 });
  S.hero(p2.group, "papel DECISÃO", { when: (t) => (t > 21.7 && t < 22.2) || t > 26.0 });
  anim(19.96); const b1 = frameBox(p1.group, st1);
  anim(26.32); const b2 = frameBox(p2.group, st2);
  anim(22.0); const b2p = frameBox(p2.group);
  const A0 = CAM.pose(b1, { zone: "stage", from: [0.05, 1.5, 0.45], pull: 1.25 }), A1 = CAM.pose(b1, { zone: "stage", from: [0.0, 1.5, 0.42], pull: 1.02 });
  const B = CAM.pose(b2p, { zone: "stage", from: [-0.12, 1.5, 0.5], pull: 1.08 });
  const C = CAM.pose(b2p, { zone: "stage", from: [0.14, 1.3, 0.55], pull: 1.16 });
  const E = CAM.pose(b2, { zone: "stage", from: [0.04, 1.5, 0.42], pull: 1.0 });
  return (t) => {
    anim(t); D.light(1);
    const hit = Math.max(beat(t, 19.96, 0.5), beat(t, 26.32, 0.5));
    fillAt(t < 23 ? RED : GREEN, 0, 1.2, 0.8, 2.2 * hit); D.blinds.set(1 + 0.5 * hit);
    const p = CAM.track(t, [[18.15, A0], [20.2, A1, 2.0], [21.9, B, 1.2], [25.9, C, 3.6], [26.4, E, 0.45]]);
    CAM.apply(CAM.shake(CAM.shake(p, t, 19.96, 0.12, 0.35), t, 26.32, 0.12, 0.35)); indoorFog();
  };
});

// ============================================================ 5 · o Máxima vira Master (27.0–29.8)
addScene("vira-master", 27.0, 29.8, (S) => {
  const sky = makeSkyline({ z: -12, seed: 4 }); S.add(sky.group);
  const F = makeBankFacade({ name: "BANCO MÁXIMA", next: "BANCO MASTER", worn: true }); S.add(F.group);
  const glowS = sprite(BOKEH, 4.2); glowS.material.color.set("#ffcf8a"); glowS.material.blending = THREE.AdditiveBlending; glowS.material.opacity = 0; glowS.userData.decor = true; glowS.position.set(0, 2.45, 0.4); S.add(glowS);
  const anim = (t) => {
    sky.update(t);
    const k = eInOut(lin(t, 28.75, 29.25));
    F.sign.rotation.x = Math.PI * k; F.sign.rotation.z = -0.07 * (1 - k);
    F.glow(1 + 0.6 * beat(t, 29.2, 0.5)); skyGlow(sky, 0.75 + 0.35 * sm(t, 29.0, 29.6));
    glowS.material.opacity = 0.5 * beat(t, 29.1, 0.7);
  };
  S.hero(F.group, "fachada do banco");
  const box = envelope([F.group], anim, 27.0, 29.8);
  return (t) => {
    anim(t); key.intensity = 1.9 + 0.5 * sm(t, 29.0, 29.6);
    fillAt("#ffd28a", 0, 2.4, 2.4, 1.6 * beat(t, 29.05, 0.7));
    CAM.apply(CAM.move(box, "orbit", lin(t, 27.0, 29.8), { zone: "stage", from: [0.12, 0.14, 1], deg: 36 }));
  };
});

// ============================================================ 6 · o fio do Bolsonaro (29.8–42.85)
// "Agora, o fio do Bolsonaro. Em 2022, o cunhado de Vorcaro doa três milhões, declarados, pra campanha de
// Bolsonaro. Em 2024, Ciro Nogueira, ex-ministro de Bolsonaro, ..."
addScene("fio-bolsonaro", 29.8, 42.85, (S) => {
  const B = buildBoard(S, ["vorcaro", "bolsonaro", "cunhado", "ciro"]);
  const V = B.items.vorcaro, R = B.items.bolsonaro, K = B.items.cunhado, C = B.items.ciro;
  B.link("bolsonaro", "vorcaro");
  const sVK = B.link("vorcaro", "cunhado", { from: CARD_BR, sag: 0.06 });
  const sKR = B.link("cunhado", "bolsonaro", { to: PRINT_BL, sag: 0.05 });
  const sCR = B.link("ciro", "bolsonaro", { to: PRINT_BR, sag: 0.04 });
  const env = makeEnvelope("R$ 3 MI"); B.board.group.add(env.group);
  const anim = (t) => {
    B.update(t);
    dropPrint(K, t, 32.3, K.rest); dropPrint(C, t, 38.6, C.rest, { from: [0.6, -1.4, 2.2] });
    R.zoom(1 + 0.12 * lin(t, 29.8, 42.85)); C.zoom(1 + 0.12 * lin(t, 38.6, 42.85));
    sVK.setProgress(eOut(lin(t, 33.3, 33.8))); sKR.setProgress(eOut(lin(t, 34.3, 34.75))); sCR.setProgress(eOut(lin(t, 41.1, 41.6)));
    // the envelope rides the string from the brother-in-law up to Bolsonaro and slips behind his print
    const k = eInOut(lin(t, 34.95, 36.3));
    env.group.visible = t > 34.85 && t < 36.7; hangOn(env, sKR, 0.1 + 0.75 * k, 0.15 * Math.sin(k * Math.PI * 2) * (1 - k));
    env.group.scale.setScalar(Math.max(0.001, pop(t, 34.85, 0.3) * (1 - sm(t, 36.3, 36.7))));
  };
  anim(42.85);
  const bA = B.box("vorcaro", "bolsonaro", "cunhado"), bB = B.box("cunhado", "bolsonaro"), bD = B.box("ciro", "bolsonaro"), bF = B.box("bolsonaro", "ciro", "cunhado");
  const bE = envelope([env.group, R.group], anim, 35.2, 36.25);
  anim(29.8);
  const shots = [
    [29.8, moveShot(bA, "truck", 29.8, 32.75, { from: [0, 0.12, 1], side: 0.3 })],
    [32.75, moveShot(bB, "push", 32.75, 34.8, { from: [0.08, 0.1, 1], pull0: 1.2 })],
    [34.8, moveShot(bE, "orbit", 34.8, 36.4, { from: [0, 0.1, 1], deg: 14, pull: 1.3 })],
    [36.45, moveShot(bB, "reveal", 36.45, 38.5, { from: [0.08, 0.1, 1], pull0: 1.15 })],
    [38.5, moveShot(bD, "push", 38.5, 40.9, { from: [-0.05, 0.12, 1], pull0: 1.2 })],
    [40.9, moveShot(bF, "drop", 40.9, 42.85, { from: [-0.05, 0.3, 1], rise: 0.2 })],
  ];
  S.hero(V.group, "ficha VORCARO", { when: (t) => t < 32.75 });
  S.hero(R.group, "polaroid Bolsonaro");
  S.hero(K.group, "ficha CUNHADO", { when: (t) => (t > 32.85 && t < 34.8) || (t > 37.25 && t < 38.5) || t > 41.65 });
  S.hero(env.group, "envelope R$ 3 MI", { when: (t) => t > 35.6 && t < 36.25 });
  S.hero(C.group, "polaroid Ciro", { when: (t) => t > 39.3 });
  return (t) => {
    anim(t); indoorLight();
    const money = beat(t, 34.9, 1.6), drop = Math.max(beat(t, 32.35, 0.6), beat(t, 38.65, 0.6));
    if (money > 0.01) fillAt("#ffd36b", 1.6, BOARD_CY - 0.5, 2.4, 2.0 * money); else fillAt(ORANGE, 2.3, BOARD_CY, 2.6, 1.3 * drop);
    CAM.apply(shotSeq(t, shots, 0.75)); indoorFog();
  };
});

// ============================================================ 7 · a garantia do FGC (42.85–47.4)
// "... propõe quadruplicar a garantia do FGC, o seguro do seu investimento."  The analogy: an insurance shield.
addScene("fgc", 42.85, 47.4, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.6, -8], spread: [20, 9, 3], seed: 77 }); S.add(bk.group);
  const base = new THREE.Group(); S.add(base);
  base.add(makeMarblePlinth(2.6, 0.35, 1.1));
  const XS = [-0.93, -0.31, 0.31, 0.93];
  const stacks = XS.map((x, i) => { const s = makeGoldStack(22, { r: 0.2, t: 0.034, seed: 4 + i }); s.group.position.set(x, 0.35, -0.15); S.add(s.group); return s; });
  const pA = makePlate("R$ 250 MIL", 1.35, 0.24, { bg: "#141414", fg: "#f4e3b5" }), pB = makePlate("R$ 1 MILHÃO", 1.35, 0.24, { bg: "#141414", fg: "#ffd36b" });
  for (const p of [pA, pB]) { p.position.set(0, 0.175, 0.566); base.add(p); }
  const guard = new THREE.Group(); S.add(guard);
  const brass = pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 });
  const foot = new THREE.Mesh(rbox(0.42, 0.06, 0.26, 0.02), brass); foot.position.y = 0.03; guard.add(foot);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.38, 16), brass); post.position.y = 0.06 + 0.19; guard.add(post);
  const shield = makeGuardShield("FGC", { w: 0.82, h: 0.98 }); shield.position.y = 0.06 + 0.38 + 0.49 - 0.08; guard.add(shield);
  const glow = sprite(BOKEH, 2.6); glow.material.color.set("#ffd28a"); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = 0; glow.userData.decor = true; S.add(glow);
  const anim = (t) => {
    bk.update(t);
    stacks[0].group.position.x = lerp(0, XS[0], eInOut(lin(t, 43.2, 43.6))); // one stack in the middle, then four
    for (let i = 1; i < 4; i++) { const k = eOut(lin(t, 43.3 + i * 0.2, 43.9 + i * 0.2)); stacks[i].group.visible = k > 0.04; stacks[i].set(k); }
    const sw = sm(t, 44.1, 44.3); pA.visible = sw < 0.999; pA.scale.setScalar(Math.max(0.001, 1 - sw));
    pB.visible = t > 44.3; pB.scale.setScalar(Math.max(0.001, pop(t, 44.3, 0.35)));
    const k = eOut(lin(t, 44.85, 45.4)); guard.visible = t > 44.8;
    guard.position.set(0, 0.35 + 1.4 * (1 - k), 0.32); guard.rotation.y = (1 - k) * 2.2 + Math.sin(t * 1.3) * 0.05 * k; guard.scale.setScalar(Math.max(0.001, k));
    glow.position.set(0, 0.35 + 0.95, 0.25); glow.material.opacity = 0.6 * sm(t, 45.75, 46.3);
  };
  S.hero(base, "pedestal com placa"); S.hero(stacks[0].group, "pilha de moedas", { when: (t) => t < 43.2 });
  S.hero(guard, "escudo FGC", { when: (t) => t > 45.45 });
  const box = envelope([base, ...stacks.map((s) => s.group), guard], anim, 45.5, 47.4);
  return (t) => {
    anim(t); key.intensity = 2.0; scene.environmentIntensity = 0.5;
    fillAt("#ffd28a", 0, 1.6, 1.8, 1.6 * Math.max(beat(t, 43.4, 0.9), sm(t, 45.75, 46.4)));
    CAM.apply(CAM.move(box, "orbit", lin(t, 42.85, 47.4), { zone: "stage", from: [0, 0.32, 1], deg: 40 }));
  };
});

// ============================================================ 8 · a emenda (47.4–50.8)
// "Pra PF, o texto saiu do banco. Ele nega."
addScene("emenda", 47.4, 50.8, (S) => {
  const B = buildBoard(S, ["vorcaro", "bolsonaro", "cunhado", "ciro"]);
  const V = B.items.vorcaro, C = B.items.ciro, R = B.items.bolsonaro;
  B.link("bolsonaro", "vorcaro"); B.link("vorcaro", "cunhado", { from: CARD_BR, sag: 0.06 }); B.link("cunhado", "bolsonaro", { to: PRINT_BL, sag: 0.05 }); B.link("ciro", "bolsonaro", { to: PRINT_BR, sag: 0.04 });
  const sVC = B.link("vorcaro", "ciro", { from: CARD_BR, sag: 0.1 });
  const env = makeEnvelope("EMENDA"); B.board.group.add(env.group);
  const anim = (t) => {
    B.update(t); C.zoom(1.12 + 0.08 * lin(t, 47.4, 50.8)); R.zoom(1.12);
    sVC.setProgress(eOut(lin(t, 47.5, 47.95)));
    const k = eInOut(lin(t, 47.95, 49.15));
    env.group.visible = t > 47.9 && t < 49.45; hangOn(env, sVC, 0.06 + 0.72 * k, -0.08 + 0.15 * Math.sin(k * Math.PI * 2) * (1 - k));
    env.group.scale.setScalar(Math.max(0.001, pop(t, 47.9, 0.3) * (1 - sm(t, 49.15, 49.45))));
  };
  const bA = B.box("vorcaro", "bolsonaro", "ciro"), bC = B.box("ciro", "bolsonaro");
  const shots = [
    [47.4, moveShot(bA, "push", 47.4, 49.3, { from: [0.1, 0.08, 1], pull0: 1.15 })],
    [49.3, moveShot(bC, "push", 49.3, 50.8, { from: [-0.06, 0.08, 1], pull0: 1.15 })],
  ];
  S.hero(V.group, "ficha VORCARO", { when: (t) => t < 49.3 }); S.hero(R.group, "polaroid Bolsonaro");
  S.hero(env.group, "envelope EMENDA", { when: (t) => t > 48.3 && t < 49.15 });
  S.hero(C.group, "polaroid Ciro");
  return (t) => {
    anim(t); indoorLight();
    fillAt(RED, 1.4, BOARD_CY, 2.8, 2.2 * beat(t, 47.5, 1.4) + 1.2 * beat(t, 50.0, 0.7));
    CAM.apply(shotSeq(t, shots, 0.6)); anim(t); indoorFog();
  };
});

// ============================================================ 9 · o filme (50.8–56.4)
// "Em 2025, Vorcaro manda pelo menos sessenta e um milhões pro filme sobre Bolsonaro"
addScene("filme", 50.8, 56.4, (S) => {
  const bk = makeBokeh({ n: 60, center: [0, 3, -9], spread: [24, 10, 4], seed: 23, colors: ["#ffcf8a", "#ff9a4a", "#fff1d6"] }); S.add(bk.group);
  const set = new THREE.Group(); S.add(set);
  const riser = new THREE.Mesh(rbox(2.8, 0.3, 1.2, 0.03), pmat("#141214", { roughness: 0.3, clearcoat: 0.7 })); riser.position.y = 0.15; set.add(riser); set.add(contactShadow(3.4, 1.8));
  const clap = makeClapperboard("FILME"); clap.group.position.set(-0.62, 0.304, 0.05); clap.group.rotation.set(-0.1, 0.18, 0); set.add(clap.group);
  const COLS = [[0.4, -0.16], [0.95, -0.16], [0.4, 0.16], [0.95, 0.16]], N = 60, BH = 0.07;
  const bundles = [];
  for (let j = 0; j < N; j++) { const b = makeBillBundle({ w: 0.48, d: 0.22, h: BH }); b.userData.col = COLS[j % 4]; b.userData.lv = Math.floor(j / 4); b.userData.at = 51.0 + j * 0.066; b.rotation.y = Math.sin(j * 2.1) * 0.05; set.add(b); bundles.push(b); }
  const anim = (t) => {
    bk.update(t);
    for (const b of bundles) { const k = eOut(lin(t, b.userData.at, b.userData.at + 0.2)); b.visible = t >= b.userData.at; b.position.set(b.userData.col[0], 0.3 + b.userData.lv * BH * 1.01 + 0.4 * (1 - k), b.userData.col[1]); }
    clap.open(t < 55.38 ? sm(t, 54.85, 55.2) : 1 - eOut(lin(t, 55.38, 55.46)));
  };
  S.hero(set, "claquete e pilhas de dinheiro");
  const box = envelope([set], anim, 55.5, 56.4);
  return (t) => {
    anim(t); key.intensity = 2.0; scene.environmentIntensity = 0.45;
    fillAt("#ffe0a0", 0.6, 2.2, 1.8, 0.8 + 1.4 * beat(t, 55.38, 0.5));
    CAM.apply(CAM.move(box, "crane", lin(t, 50.8, 56.4), { zone: "stage", from: [0.25, 0.55, 1], rise: 0.3 }));
  };
});

// ============================================================ 10 · Flávio (56.4–60.1)
// "a pedido do filho, Flávio, que nega irregularidade."
addScene("flavio", 56.4, 60.1, (S) => {
  const B = buildBoard(S, ["vorcaro", "bolsonaro", "cunhado", "ciro", "flavio"]);
  const R = B.items.bolsonaro, C = B.items.ciro, Fl = B.items.flavio;
  B.link("bolsonaro", "vorcaro"); B.link("vorcaro", "cunhado", { from: CARD_BR, sag: 0.06 }); B.link("cunhado", "bolsonaro", { to: PRINT_BL, sag: 0.05 });
  B.link("ciro", "bolsonaro", { to: PRINT_BR, sag: 0.04 }); B.link("vorcaro", "ciro", { from: CARD_BR, sag: 0.1 });
  const sFR = B.link("flavio", "bolsonaro", { to: PRINT_R, sag: 0.05 }), sFV = B.link("flavio", "vorcaro", { from: PRINT_BL, to: CARD_BR, sag: 0.12 });
  const anim = (t) => {
    B.update(t); dropPrint(Fl, t, 56.5, Fl.rest, { from: [1.2, 0.6, 2.2] });
    R.zoom(1.12); C.zoom(1.18); Fl.zoom(1 + 0.12 * lin(t, 56.5, 60.1));
    sFR.setProgress(eOut(lin(t, 57.4, 57.85))); sFV.setProgress(eOut(lin(t, 58.5, 59.2)));
  };
  const shots = [
    [56.4, moveShot(B.box("bolsonaro", "flavio", "ciro"), "truck", 56.4, 58.4, { from: [-0.05, 0.1, 1], side: 0.3 })],
    [58.4, moveShot(B.box("flavio"), "push", 58.4, 60.1, { from: [-0.1, 0.08, 1], pull0: 1.25 }), 0.35],
  ];
  S.hero(R.group, "polaroid Bolsonaro", { when: (t) => t < 58.4 }); S.hero(C.group, "polaroid Ciro", { when: (t) => t < 58.4 }); S.hero(Fl.group, "polaroid Flávio", { when: (t) => t > 57.05 });
  return (t) => {
    anim(t); indoorLight();
    fillAt(ORANGE, 4.0, BOARD_CY, 2.6, 1.8 * beat(t, 56.6, 0.7) + 1.4 * beat(t, 58.6, 0.8));
    CAM.apply(shotSeq(t, shots, 0.7)); indoorFog();
  };
});

// ============================================================ 11 · o fio do Lula (60.1–62.15)
addScene("fio-lula", 60.1, 62.15, (S) => {
  const B = buildBoard(S, ["vorcaro", "lula"]);
  const L = B.items.lula, sL = B.link("lula", "vorcaro");
  const anim = (t) => { B.update(t); dropPrint(L, t, 60.75, L.rest, { from: [-1.6, 0.6, 2.2] }); L.zoom(1 + 0.08 * lin(t, 60.75, 62.15)); sL.setProgress(eOut(lin(t, 61.4, 61.85))); };
  S.hero(B.items.vorcaro.group, "ficha VORCARO"); S.hero(L.group, "polaroid Lula", { when: (t) => t > 61.55 });
  const A = CAM.pose(B.box("vorcaro"), { zone: "stage", from: [0.1, 0.1, 1], pull: 1.1 }), Bp = CAM.pose(B.box("vorcaro", "lula"), { zone: "stage", from: [-0.12, 0.1, 1] }), Bp2 = CAM.pose(B.box("vorcaro", "lula"), { zone: "stage", from: [-0.16, 0.08, 1] });
  return (t) => {
    anim(t); indoorLight();
    fillAt(ORANGE, -2.3, BOARD_CY + 1, 2.6, 1.8 * beat(t, 61.4, 0.7));
    CAM.apply(CAM.track(t, [[60.1, A], [61.5, Bp, 1.3], [62.15, Bp2, 0.65]])); indoorFog();
  };
});

// ============================================================ 12 · Planalto, fora da agenda (62.15–67.6)
addScene("planalto", 62.15, 67.6, (S) => {
  const bk = makeBokeh({ n: 60, center: [0, 3, -9], spread: [24, 10, 4], seed: 31, colors: ["#ffd08a", "#9fc3ff", "#fff1d6"] }); S.add(bk.group);
  const fr = makePhotoFrame("planalto", { w: 2.6 }); S.add(fr.group);
  const nameP = makePlate("PLANALTO", 1.7, 0.26, { bg: "#c9a45a", fg: "#1c1410" }); nameP.position.set(0, 0.16, 0.366); fr.group.add(nameP);
  const anim = (t) => { bk.update(t); fr.frame.rotation.y = 1.4 * (1 - eOut(lin(t, 62.2, 62.95))); fr.zoom(1 + 0.14 * lin(t, 62.2, 67.6)); };
  S.hero(fr.group, "porta-retrato do Planalto", { when: (t) => t > 63.0 });
  anim(67.6); const box = frameBox(fr.group); anim(62.15);
  return (t) => {
    anim(t); key.intensity = 2.0;
    fillAt(RED, 0, 1.6, 2.0, 1.8 * beat(t, 65.4, 1.4));
    CAM.apply(CAM.move(box, "orbit", lin(t, 62.15, 67.6), { zone: "stage", from: [0, 0.18, 1], deg: 34 }));
  };
});

// ============================================================ 13 · Mantega (67.6–72.45)
// "Quem levou: Guido Mantega, ex-ministro de Lula e consultor do Master."
addScene("mantega", 67.6, 72.45, (S) => {
  const B = buildBoard(S, ["vorcaro", "lula", "mantega"]);
  const L = B.items.lula, M = B.items.mantega;
  B.link("lula", "vorcaro");
  const sML = B.link("mantega", "lula", { to: PRINT_BR, sag: 0.05 }), sVM = B.link("vorcaro", "mantega", { from: CARD_BL, sag: 0.06 });
  const anim = (t) => {
    B.update(t); dropPrint(M, t, 67.45, M.rest, { from: [0.4, -1.2, 2.2] });
    L.zoom(1.08 + 0.06 * lin(t, 67.6, 72.45)); M.zoom(1 + 0.12 * lin(t, 67.65, 72.45));
    sML.setProgress(eOut(lin(t, 70.2, 70.7))); sVM.setProgress(eOut(lin(t, 71.1, 71.6)));
  };
  const shots = [
    [67.6, moveShot(B.box("lula", "mantega"), "push", 67.6, 70.0, { from: [0.06, 0.1, 1], pull0: 1.2 })],
    [70.0, moveShot(B.box("vorcaro", "lula", "mantega"), "reveal", 70.0, 72.45, { from: [0.1, 0.3, 1], pull0: 1.12 })],
  ];
  S.hero(M.group, "polaroid Mantega", { when: (t) => t > 67.97 });
  S.hero(B.items.vorcaro.group, "ficha VORCARO", { when: (t) => t > 70.75 }); S.hero(L.group, "polaroid Lula");
  return (t) => {
    anim(t); indoorLight();
    fillAt(ORANGE, -1.0, BOARD_CY - 0.5, 2.6, 1.7 * beat(t, 67.7, 0.7) + 1.3 * beat(t, 70.2, 0.6) + 1.6 * beat(t, 71.1, 0.7));
    CAM.apply(shotSeq(t, shots, 0.75)); indoorFog();
  };
});

// ============================================================ 14 · o que Lula diz (72.45–75.65)
addScene("lula", 72.45, 75.65, (S) => {
  const B = buildBoard(S, ["vorcaro", "lula"]);
  const L = B.items.lula; B.link("lula", "vorcaro"); B.items.vorcaro.group.visible = false; // out of this close-up; only its string leaves the frame
  const anim = (t) => { B.update(t); L.zoom(1.1 + 0.12 * lin(t, 72.45, 75.65)); };
  S.hero(L.group, "polaroid Lula");
  const box = B.box("lula");
  return (t) => {
    anim(t); indoorLight();
    fillAt("#ffd9a8", -2.3, BOARD_CY + 1.2, 2.2, 1.0);
    CAM.apply(CAM.move(box, "push", lin(t, 72.45, 75.65), { zone: "stage", from: [0.08, 0.06, 1], pull0: 1.2 })); indoorFog();
  };
});

// ============================================================ 15 · Lewandowski e Wagner (75.65–86.1)
// Two photo cards on the stage; behind them only the PF desk (no hero). The window flashes like a police
// car on "virou alvo da PF".
addScene("cartoes", 75.65, 86.1, (S) => {
  const D = buildDesk(S);
  const file = makeCaseFile("PF", { sub: "SIGILOSO", labelW: 0.5 }); file.group.position.set(-0.5, 0, 0.1); file.group.rotation.y = -0.08; S.add(file.group);
  const pA = makePaperSheet("RELATÓRIO", "Operação Compliance Zero"), pB = makePaperSheet("CONTRATO", "Consultoria");
  pA.group.position.set(0.75, 0.002, -0.05); pA.group.rotation.y = 0.2; pB.group.position.set(0.95, 0.009, 0.25); pB.group.rotation.y = -0.15; S.add(pA.group, pB.group);
  const box = frameBox(file.group, pA.group, pB.group);
  return (t) => {
    D.light(1);
    const police = t > 83.9 ? (Math.floor(t * 6) % 2 ? "#ff2d2d" : "#2d5bff") : "#9db8ff";
    D.blinds.set(t > 83.9 ? 2.4 : 1, police);
    if (t > 83.9) fillAt(police, 3.0, 2.0, -1.0, 1.6); else fillAt("#7fa8ff", 3.0, 2.0, -1.0, 0.5);
    CAM.apply(CAM.move(box, "truck", lin(t, 75.65, 86.1), { zone: "stage", from: [0, 0.85, 0.75], side: 0.5, pull: 1.2 })); indoorFog();
  };
});

// ============================================================ 16 · quem fechou o Master (86.1–88.25)
addScene("fechou", 86.1, 88.25, (S) => {
  const sky = makeSkyline({ z: -12, seed: 9 }); S.add(sky.group);
  const F = makeBankFacade({ name: "BANCO MASTER", shutter: true }); S.add(F.group);
  const anim = (t) => {
    sky.update(t);
    F.shutter.set(eOut(lin(t, 86.75, 87.35)));
    F.shutter.sign.visible = t > 87.4; F.shutter.sign.scale.setScalar(Math.max(0.001, pop(t, 87.4, 0.3)));
    F.glow(1 - 0.75 * sm(t, 87.45, 87.8)); skyGlow(sky, 1 - 0.75 * sm(t, 87.35, 88.0)); // the city goes dark on LIQUIDADO
  };
  S.hero(F.group, "fachada BANCO MASTER");
  const box = envelope([F.group], anim, 86.1, 88.25);
  return (t) => {
    anim(t); key.intensity = 2.0 - 0.6 * sm(t, 87.4, 87.9);
    fillAt(RED, 0, 1.4, 2.2, 2.4 * beat(t, 87.4, 0.6));
    CAM.apply(CAM.shake(CAM.move(box, "push", lin(t, 86.1, 88.25), { zone: "stage", from: [-0.1, 0.12, 1], pull0: 1.15 }), t, 87.4, 0.14, 0.4));
  };
});

// ============================================================ 17 · Galípolo e Campos Neto (88.25–94.0)
// Galípolo's card first (no hero behind it), then each portrait in turn.
addScene("galipolo", 88.25, 94.0, (S) => {
  const sky = makeSkyline({ z: -12, seed: 9 }); S.add(sky.group);
  const fG = makePhotoFrame("galipolo", { w: 1.7 }), fC = makePhotoFrame("campos-neto", { w: 1.9 });
  fG.group.position.set(-1.15, 0, 0); fC.group.position.set(1.2, 0, 0); S.add(fG.group, fC.group);
  const anim = (t) => {
    sky.update(t); skyGlow(sky, 0.3);
    for (const [f, at, dir] of [[fG, 90.95, 1], [fC, 91.15, -1]]) { f.group.visible = t > at; f.frame.rotation.y = dir * 1.3 * (1 - eOut(lin(t, at, at + 0.6))); f.zoom(1 + 0.12 * lin(t, at, 94.0)); }
  };
  S.hero(fG.group, "porta-retrato Galípolo", { when: (t) => t > 91.7 && t < 92.5 }); S.hero(fC.group, "porta-retrato Campos Neto", { when: (t) => t > 93.25 });
  anim(94.0); const bG = frameBox(fG.group), bC = frameBox(fC.group); anim(88.25);
  const A = CAM.at([0, 2.4, 7], [0, 2.8, -10], { zone: "stage" }), A2 = CAM.at([1.0, 2.7, 6.4], [0.3, 3.2, -10], { zone: "stage" });
  const shots = [
    [88.25, (t) => CAM.blend(A, A2, sm(t, 88.25, 90.9))],
    [90.9, moveShot(bG, "push", 90.9, 92.5, { from: [-0.15, 0.15, 1], pull0: 1.2 })],
    [92.5, moveShot(bC, "truck", 92.5, 94.0, { from: [0.1, 0.15, 1], side: 0.25 })],
  ];
  return (t) => {
    anim(t); key.intensity = 1.9;
    fillAt("#ffd9a8", 0, 1.8, 2.4, 0.9 * sm(t, 91.0, 91.6));
    CAM.apply(shotSeq(t, shots, 0.7));
  };
});

// ============================================================ PF desk props shared by 18 and 19
const FOLDER = { w: 1.6, d: 1.15 };
const MARKS = [[-0.3, 0.2, -0.12], [0.32, 0.3, 0.1]]; // x, z, turn of the two RECUSADA marks on the folder
function deskFolder(S, marks) {
  const file = makeCaseFile("DELAÇÃO", { w: FOLDER.w, d: FOLDER.d, labelX: 0, labelW: 0.56, labelDetail: marks }); S.add(file.group);
  const ms = MARKS.map(([x, z, r]) => { const m = makeInkMark("RECUSADA", "#c8231a", { w: 0.78, h: 0.27 }); m.position.set(x, file.top + 0.0008, z); m.rotation.y = r; m.visible = marks; m.children[0].userData.plate.detail = marks; file.group.add(m); return m; });
  return { file, ms };
}

// ============================================================ 18 · delação recusada (94.0–99.4)
// "Preso, Vorcaro tentou delação duas vezes. PF e PGR recusaram."
addScene("delacao", 94.0, 99.4, (S) => {
  const D = buildDesk(S);
  const { file, ms } = deskFolder(S, false);
  const st = makeStamp({ w: 0.86, d: 0.32, ink: "#c8231a" }); st.scale.setScalar(0.66); S.add(st);
  const hitAt = [97.2, 97.94];
  const anim = (t) => {
    const k = eOut(lin(t, 94.0, 94.6)); file.group.position.set(1.9 * (1 - k), 0, 0.05); file.group.rotation.y = 0.3 * (1 - k);
    file.group.updateMatrixWorld(true);
    ms.forEach((m, i) => { m.visible = t > hitAt[i] + 0.01; m.scale.setScalar(t > hitAt[i] ? 1 + 0.15 * (1 - eOut(lin(t, hitAt[i], hitAt[i] + 0.22))) : 1); });
    // one stamp, two blows: down on the first mark, up and across, down on the second, away
    const w0 = ms[0].getWorldPosition(new V3()), w1 = ms[1].getWorldPosition(new V3());
    let p, lift;
    if (t < 97.2) { p = w0; lift = 1 - eInOut(lin(t, 96.8, 97.2)); }
    else if (t < 97.94) { const a = eInOut(lin(t, 97.3, 97.75)); p = w0.clone().lerp(w1, a); lift = t < 97.75 ? 0.5 * Math.sin(Math.PI * lin(t, 97.22, 97.75)) : 0.35 * (1 - eInOut(lin(t, 97.75, 97.94))); }
    else { p = w1; lift = eOut(lin(t, 98.0, 98.5)) * 1.3; }
    st.visible = t > 96.75 && t < 98.5; st.position.set(p.x, p.y + 1.3 * Math.max(0, lift), p.z); st.rotation.y = t < 97.6 ? MARKS[0][2] : MARKS[1][2];
  };
  S.hero(file.group, "pasta DELAÇÃO", { when: (t) => t > 94.65 });
  S.hero(st, "carimbo RECUSADA", { when: (t) => t > 97.1 && t < 98.1 });
  anim(98.1); const box = frameBox(file.group, st); anim(94.0);
  return (t) => {
    anim(t);
    const dim = 1 - 0.5 * sm(t, 98.4, 99.0); D.light(dim); // the lamp dims on "recusaram"
    fillAt(RED, 0, 1.2, 0.9, 2.2 * Math.max(beat(t, 97.2, 0.45), beat(t, 97.94, 0.45)));
    D.blinds.set(dim);
    const p = CAM.move(box, "drop", lin(t, 94.0, 99.4), { zone: "stage", from: [0.06, 1.6, 0.5], rise: 0.35, pull: 1.06 });
    CAM.apply(CAM.shake(CAM.shake(p, t, 97.2, 0.1, 0.3), t, 97.94, 0.12, 0.3)); indoorFog();
  };
});

// ============================================================ 19 · a pergunta (99.4–106.4)
// "Vorcaro deveria ganhar delação pra contar tudo, ou ficar preso sem acordo nenhum?"
// Two rubber stamps (the two answers) with their name cards, Vorcaro's photo on a stand between them.
addScene("pergunta", 99.4, 106.4, (S) => {
  const D = buildDesk(S);
  const stand = new THREE.Group(); stand.position.set(0, 0, -0.05); S.add(stand);
  const wood = pmat("#3a2214", { roughness: 0.45, clearcoat: 0.4 });
  const BH = 0.24, base = new THREE.Mesh(rbox(0.84, BH, 0.42, 0.02), wood); base.position.y = BH / 2; stand.add(base);
  const photo = makePhotoPrint("vorcaro", { w: 1.0, shape: "retrato", pin: false }); stand.add(photo.group);
  const lean = 0.14; photo.group.rotation.x = -lean; photo.group.position.set(0, BH + (photo.h / 2) * Math.cos(lean), 0.06 - (photo.h / 2) * Math.sin(lean));
  const strut = new THREE.Mesh(rbox(0.05, photo.h * 0.72, 0.03, 0.01), wood); strut.position.set(0, BH + photo.h * 0.34, -0.2); strut.rotation.x = 0.3; stand.add(strut);
  // both answers in the same lettering size (the shorter word is padded)
  const sides = [["   DELAÇÃO   ", -1.02, "#e8742a"], ["SEM ACORDO", 1.02, "#3a6fb0"]].map(([label, x, ink]) => {
    const g = new THREE.Group(); g.position.set(x, 0, -0.1); S.add(g);
    const st = makeStamp({ w: 0.86, d: 0.32, ink }); st.scale.setScalar(1.25); g.add(st);
    const card = makePlaceCard(label, { w: 1.2, h: 0.42, bg: "#141414", fg: "#f4f1ea" }); card.group.position.set(0, 0, 0.62); g.add(card.group);
    return { g, st };
  });
  const anim = (t) => {
    photo.zoom(1 + 0.12 * lin(t, 99.4, 106.4));
    sides.forEach((s, i) => { const at = i ? 103.4 : 100.8; s.st.position.y = 0.22 * Math.sin(Math.PI * lin(t, at, at + 0.45)); });
  };
  S.hero(stand, "foto de Vorcaro no suporte");
  sides.forEach((s, i) => S.hero(s.g, i ? "carimbo SEM ACORDO" : "carimbo DELAÇÃO"));
  const box = envelope([stand, ...sides.map((s) => s.g)], anim, 99.4, 106.4);
  return (t) => {
    anim(t); D.light(1.0); D.blinds.set(0.35);
    const a = beat(t, 100.75, 0.8), b = beat(t, 103.35, 0.8);
    if (a > 0.01) fillAt("#e8742a", -1.1, 1.0, 0.9, 2.0 * a); else fillAt("#5d8fd6", 1.1, 1.0, 0.9, 2.0 * b);
    CAM.apply(CAM.move(box, "orbit", lin(t, 99.4, 106.4), { zone: "stage", from: [0, 0.45, 1], deg: 30 })); indoorFog();
  };
});
