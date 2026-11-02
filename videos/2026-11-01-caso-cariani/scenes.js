// ============================================================================
// videos/2026-11-01-caso-cariani/scenes.js
// O caso Renato Cariani e a PF — informativo, tom neutro (pedido do Samuel): toda acusação é atribuída
// a quem fez (PF, MP); a defesa e a prisão negada aparecem; fecha em "ainda não há sentença".
// Sem fotos (pedido do Samuel): Cariani é uma figura 3D estilizada (manequim de academia, sem rosto, sem
// imitar ninguém); a sócia é um manequim de terno genérico. Viatura e galpão sem brasão nem logo.
// Narration 0–95.8 s (audio/words.json), video 97.9 s.
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.pose/CAM.move(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops
// (street at dawn, factory hall, pharmacy, gym, courtroom, road at night) fill the whole frame.
// ============================================================================

const eIn = (x) => x * x * x;
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// Fall from `h` to 0 over [at, at + d] with one small bounce at the end.
const dropY = (t, at, h, d = 0.5) => { const k = lin(t, at, at + d); if (k < 0.72) return h * (1 - Math.pow(k / 0.72, 2)); return h * 0.05 * Math.sin(Math.PI * (k - 0.72) / 0.28); };

// ---------------------------------------------------------------- local backdrops
// Vertical gradient sky on a far plane (backdrop). stops: [[0..1, colour], ...] from top to bottom.
function skyPlane(stops, { w = 90, h = 44, y = 14, z = -34 } = {}) {
  const c = makeCanvas(8, 512), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 512);
  for (const [k, col] of stops) gr.addColorStop(k, col); x.fillStyle = gr; x.fillRect(0, 0, 8, 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false, fog: false })); m.position.set(0, y, z); return m;
}
// The street at dawn around the house door (the door itself is the hero, 2 m of wall around it):
// the rest of the facade with two lit windows, eave and roof, sidewalk and kerb, a street lamp, the sky
// going from night blue to orange, and the police lights (red/blue point light) from the left.
// API { group, update(t), siren(k) }
function makeDawnStreet({ door = 1.3, doorH = 2.45 } = {}) {
  const g = new THREE.Group();
  g.add(skyPlane([[0, "#0a1230"], [0.5, "#24305a"], [0.78, "#8a4b3c"], [1, "#e2955a"]]));
  const plaster = mat("#ffffff", { map: tileTex(plasterTex("#6e5d4f"), 9, 3), roughness: 0.92 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(6, doorH, 0.24), plaster); p.position.set(s * (door / 2 + 3), doorH / 2, -0.12); g.add(p); }
  const upper = new THREE.Mesh(new THREE.BoxGeometry(door + 12, 4.0 - doorH, 0.24), plaster); upper.position.set(0, (4.0 + doorH) / 2, -0.12); g.add(upper);
  const band = mat("#3b302a", { roughness: 0.85 });
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(6, 0.28, 0.03), band); b.position.set(s * (door / 2 + 3), 0.14, 0.015); g.add(b); }
  const eave = new THREE.Mesh(new THREE.BoxGeometry(door + 13, 0.18, 1.1), mat("#2a1d16", { roughness: 0.7 })); eave.position.set(0, 4.08, 0.3); g.add(eave);
  const tc = makeCanvas(256, 128), tx = tc.getContext("2d"); tx.fillStyle = "#5a2a1e"; tx.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 ? 0 : 16; x < 256; x += 32) { tx.fillStyle = "rgba(0,0,0,0.35)"; tx.fillRect(x, y + 12, 30, 4); tx.fillStyle = "rgba(255,190,150,0.08)"; tx.fillRect(x, y, 30, 4); }
  const tt = texFrom(tc); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(8, 3);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(door + 13, 3.2), mat("#ffffff", { map: tt, roughness: 0.8 })); roof.position.set(0, 4.9, -0.8); roof.rotation.x = -1.0; g.add(roof);
  const wins = [];
  for (const s of [-1, 1]) {
    const wn = makeGlowWindow(1.1, 1.35, { cols: 2, rows: 2, color: "#ffcf94", frame: "#1b1511" }); wn.group.position.set(s * 2.5, 1.75, 0.01); g.add(wn.group); wins.push(wn);
    const sill = new THREE.Mesh(rbox(1.3, 0.06, 0.16, 0.02), mat("#8a837a", { roughness: 0.6 })); sill.position.set(s * 2.5, 1.04, 0.07); g.add(sill);
  }
  const conc = mat("#ffffff", { map: tileTex(plasterTex("#6d6863"), 6, 2), roughness: 0.85 });
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(30, 4), conc); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.004, 2); g.add(walk);
  for (let x = -14; x <= 14; x += 1.2) { const j = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.002, 4), mat("#3d3a37")); j.position.set(x, 0.006, 2); g.add(j); }
  const kerb = new THREE.Mesh(rbox(30, 0.14, 0.25, 0.03), conc); kerb.position.set(0, 0.07, 4.1); g.add(kerb);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), mat("#ffffff", { map: tileTex(asphaltTex(), 10, 4), roughness: 0.92 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.003, 10.2); g.add(road);
  // street lamp at the right, warm, and its pool
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 12), pmat("#1c1d20", { metalness: 0.6, roughness: 0.4 })); pole.position.set(-5.4, 2.3, 3.9); g.add(pole);
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false }); const head = new THREE.Mesh(rbox(0.5, 0.12, 0.26, 0.04), lampM); head.position.set(-5.05, 4.6, 3.9); g.add(head);
  const pool = makeFloorGlow(4, 3, { color: "#ffcf8a", opacity: 0.14 }); pool.position.set(-4.6, 0.01, 3.4); g.add(pool);
  const bk = makeBokeh({ n: 30, center: [0, 3, -14], spread: [30, 6, 4], size: [0.3, 0.9], colors: ["#ffcf8a", "#9fc3ff", "#ff8a5c"], opacity: 0.35, seed: 41 }); g.add(bk.group);
  const siren = new THREE.PointLight("#2a6bff", 0, 12, 1.4); siren.position.set(-3.4, 1.4, 4.2); g.add(siren);
  const glowL = makeFloorGlow(5, 4, { color: "#2a6bff", opacity: 0 }); glowL.position.set(-2.5, 0.012, 2.6); g.add(glowL);
  asBackdrop(g);
  let sk = 0;
  return {
    group: g,
    update(t) { bk.update(t); const blue = Math.sin(t * 13) > 0; siren.color.set(blue ? "#2a6bff" : "#ff2a1a"); siren.intensity = sk * 26 * (0.6 + 0.4 * Math.abs(Math.sin(t * 13))); glowL.material.color.set(blue ? "#2a6bff" : "#ff2a1a"); glowL.material.opacity = 0.16 * sk; },
    siren(k) { sk = k; },
  };
}
// Industrial hall for the chemicals (brick, tall factory windows of blue night light, enamel lamps).
function chemHall(seed = 7, wallZ = -4.5) { return makeEraHall([{ x0: -14, x1: 14, kind: "industrial" }], { wallZ, ceil: 9, front: 14, seed }); }
// Night road with street lights fading into the dark. fork: the road splits at z = -6 into a lit left
// branch (with its street lights) and a dark right branch. API { group, update(t), lights(k) }
function makeNightRoad({ fork = false, len = 70 } = {}) {
  const g = new THREE.Group();
  g.add(skyPlane([[0, "#04060f"], [0.6, "#0d1530"], [1, "#2a2f48"]], { y: 10, z: -60, w: 160, h: 40 }));
  const field = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mat("#ffffff", { map: tileTex(grassTex(), 40, 40), roughness: 1, color: "#3a4a3a" })); field.rotation.x = -Math.PI / 2; field.position.y = 0.002; g.add(field);
  const poles = [], lampM = new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false }), pools = [];
  const lamp = (x, z, rotY = 0, parent = g) => {
    const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = rotY; parent.add(p);
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 5, 10), pmat("#24262a", { metalness: 0.6, roughness: 0.4 })); pl.position.y = 2.5; p.add(pl);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 0.08), pmat("#24262a", { metalness: 0.6, roughness: 0.4 })); arm.position.set(-0.95 * Math.sign(x || 1), 4.95, 0); p.add(arm);
    const hd = new THREE.Mesh(rbox(0.5, 0.1, 0.24, 0.04), lampM); hd.position.set(-1.85 * Math.sign(x || 1), 4.9, 0); p.add(hd);
    const pool = makeFloorGlow(5, 4, { color: "#ffcf8a", opacity: 0.12 }); pool.position.set(-2.0 * Math.sign(x || 1), 0.075, 0); p.add(pool); pools.push(pool); poles.push(p);
  };
  if (!fork) {
    const rd = makeTwoLaneRoad({ lane: 2.4, back: len, front: 8 }); g.add(rd.group);
    // lamps only on the near half: the far road is dark (where the truck disappears)
    for (let z = 4; z > -26; z -= 6) lamp(-4.6, z);
  } else {
    const main = makeTwoLaneRoad({ lane: 2.4, back: 6, front: 10 }); g.add(main.group);
    for (const [ang, lit] of [[0.42, true], [-0.42, false]]) {
      const br = new THREE.Group(); br.position.set(0, 0.001, -6); br.rotation.y = ang; g.add(br);
      const rd = makeTwoLaneRoad({ lane: 2.4, back: 46, front: 0.5 }); br.add(rd.group);
      if (lit) for (let z = -3; z > -40; z -= 7) lamp(-4.6, z, 0, br);
    }
    lamp(-4.6, 7);
  }
  const bk = makeBokeh({ n: 40, center: [0, 3, -40], spread: [60, 4, 10], size: [0.2, 0.7], colors: ["#ffcf8a", "#ff8a5c", "#9fc3ff"], opacity: 0.3, seed: 77 }); g.add(bk.group);
  asBackdrop(g);
  return { group: g, update(t) { bk.update(t); }, lights(k) { lampM.color.set("#ffcf8a").multiplyScalar(k); pools.forEach((p) => { p.material.opacity = 0.12 * k; }); } };
}
// Pharmacy behind the counter: shelves full of boxes (instanced), a green cross sign glowing high up,
// ceiling light panels and a tiled floor. API { group, update(t) }
function makePharmacySet({ wallZ = -2.4, seed = 12 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), mat("#ffffff", { map: tileTex(plasterTex("#2e3a36"), 3, 1), roughness: 0.9 })); wall.position.set(0, 4, wallZ); g.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), mat("#ffffff", { map: tileTex(tileTex(noiseTex({ base: "#cfd3cf", amount: 0.06, seed: 4 }), 1, 1), 15, 10), roughness: 0.3, color: "#8f9592" })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.004, wallZ + 10); g.add(fl);
  const shelfM = pmat("#6f7672", { roughness: 0.4 }), cols = ["#2f6fb0", "#2fae66", "#e9ece8", "#6a4f9a", "#3a8a9a", "#c9ccd1"];
  const geo = new THREE.BoxGeometry(1, 1, 1), boxes = new THREE.InstancedMesh(geo, pmat("#ffffff", { roughness: 0.5 }), 900), d = new THREE.Object3D(); let n = 0;
  for (let x = -9; x < 9; x += 2.2) for (let lv = 0; lv < 6; lv++) {
    const y = 0.5 + lv * 0.62, sh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.42), shelfM); sh.position.set(x, y, wallZ + 0.21); g.add(sh);
    for (let bx = x - 0.95; bx < x + 0.95 && n < 900;) { const w = 0.12 + r() * 0.14, h = 0.16 + r() * 0.26; d.position.set(bx + w / 2, y + 0.02 + h / 2, wallZ + 0.2); d.scale.set(w * 0.94, h, 0.3); d.updateMatrix(); boxes.setMatrixAt(n, d.matrix); boxes.setColorAt(n, new THREE.Color(cols[Math.floor(r() * cols.length)]).multiplyScalar(0.42)); n++; bx += w; }
  }
  boxes.count = n; g.add(boxes);
  for (let x = -10.1; x < 10; x += 2.2) { const up = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4, 0.42), shelfM); up.position.set(x, 2, wallZ + 0.21); g.add(up); }
  // green cross sign
  const crossM = new THREE.MeshBasicMaterial({ color: "#2fdc7a", toneMapped: false });
  const cr = new THREE.Group(); cr.position.set(0, 5.6, wallZ + 0.1); g.add(cr);
  cr.add(new THREE.Mesh(rbox(0.36, 1.1, 0.08, 0.04), crossM)); cr.add(new THREE.Mesh(rbox(1.1, 0.36, 0.08, 0.04), crossM));
  const halo = sprite(BOKEH, 3.4); halo.material.color.set("#2fdc7a"); halo.material.opacity = 0.35; halo.material.blending = THREE.AdditiveBlending; halo.position.set(0, 5.6, wallZ + 0.3); g.add(halo);
  const panelM = new THREE.MeshBasicMaterial({ color: "#f2fff6", toneMapped: false });
  for (let z = wallZ + 1.5; z < wallZ + 16; z += 3) for (const x of [-2.5, 2.5]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), panelM); p.rotation.x = Math.PI / 2; p.position.set(x, 6.8, z); g.add(p); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), mat("#1a201e", { roughness: 0.9 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 6.82, wallZ + 10); g.add(ceil);
  asBackdrop(g);
  return { group: g, update(t) { halo.material.opacity = 0.3 + 0.06 * Math.sin(t * 3); } };
}
// Gym behind the athlete: rubber floor, dark concrete wall with tall mirror panels and cool LED strips,
// a dumbbell rack (instanced), weight plates, ceiling light bars receding. API { group, update(t) }
function makeGymSet({ wallZ = -3.2, seed = 9 } = {}) {
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), mat("#ffffff", { map: tileTex(noiseTex({ base: "#1d1f22", amount: 0.22, size: 2, seed }), 12, 10), roughness: 0.85 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.004, wallZ + 12); g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), mat("#ffffff", { map: tileTex(plasterTex("#33302d"), 3, 1), roughness: 0.9 })); wall.position.set(0, 4, wallZ); g.add(wall);
  const mirror = pmat("#0e1216", { metalness: 0.9, roughness: 0.06, envMapIntensity: 1.4 });
  const led = new THREE.MeshBasicMaterial({ color: "#bfe0ff", toneMapped: false });
  for (let x = -9; x <= 9; x += 2.4) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.6), mirror); m.position.set(x, 2.2, wallZ + 0.01); g.add(m);
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.03), led); s.position.set(x, 3.62, wallZ + 0.02); g.add(s);
  }
  // dumbbell rack along the wall
  const steel = pmat("#2a2c30", { metalness: 0.8, roughness: 0.35 }), chrome = pmat("#c9ccd1", { metalness: 1, roughness: 0.2 });
  for (const y of [0.45, 0.85]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(14, 0.06, 0.5), steel); rail.position.set(0, y, wallZ + 0.6); g.add(rail); }
  const bellGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.09, 16); bellGeo.rotateZ(Math.PI / 2);
  const bells = new THREE.InstancedMesh(bellGeo, pmat("#141414", { roughness: 0.5 }), 200), dd = new THREE.Object3D(); let n = 0;
  for (const y of [0.55, 0.95]) for (let x = -6.8; x < 7; x += 0.36) for (const e of [-0.14, 0.14]) { dd.position.set(x + e, y, wallZ + 0.6); dd.updateMatrix(); bells.setMatrixAt(n++, dd.matrix); }
  bells.count = n; g.add(bells);
  for (const x of [-7.5, 7.5]) for (let i = 0; i < 4; i++) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.42 - i * 0.06, 0.42 - i * 0.06, 0.06, 32), pmat("#151515", { roughness: 0.6 })); pl.rotation.x = Math.PI / 2; pl.position.set(x, 0.45 - i * 0.02, wallZ + 1.2 + i * 0.07); g.add(pl); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), mat("#121315", { roughness: 0.9 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 6.5, wallZ + 12); g.add(ceil);
  for (let z = wallZ + 1.2; z < wallZ + 18; z += 2.4) { const bar = new THREE.Mesh(new THREE.BoxGeometry(9, 0.05, 0.12), led); bar.position.set(0, 6.45, z); g.add(bar); const pool = makeFloorGlow(8, 1.6, { color: "#bfe0ff", opacity: 0.06 }); pool.position.set(0, 0.008, z); g.add(pool); }
  const motes = makeSetMotes(120, [[-6, 0.3, wallZ + 0.4], [6, 5, wallZ + 5]], { color: "#d6e8ff", seed: seed + 2, opacity: 0.4 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t) { motes.update(t); } };
}

// ---------------------------------------------------------------- local props
// Factory front (galpão): corrugated metal walls, a gable, a big roll-up door, an office wing with lit
// windows, the company name on a sign board, two drums and a pallet by the door, a lamp over the door.
// Origin: floor centre of the facade; front +z. API { group, lamp }
function makeFactoryFront(name = "ANIDROL") {
  const g = new THREE.Group(), W = 6.4, H = 3.4, D = 5;
  const c = makeCanvas(256, 32), x = c.getContext("2d");
  for (let i = 0; i < 256; i++) { const v = 0.5 + 0.5 * Math.sin(i / 256 * Math.PI * 2 * 16); x.fillStyle = `rgb(${Math.round(92 + 46 * v)},${Math.round(100 + 46 * v)},${Math.round(108 + 46 * v)})`; x.fillRect(i, 0, 1, 32); }
  const rib = texFrom(c); rib.wrapS = rib.wrapT = THREE.RepeatWrapping; rib.repeat.set(W / 1.6, 1);
  const metal = pmat("#ffffff", { map: rib, metalness: 0.5, roughness: 0.42 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), metal); box.position.set(0, H / 2, -D / 2); g.add(box);
  const gs = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, 1.1)]);
  const gable = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: D, bevelEnabled: false }), metal); gable.position.set(0, H, -D); g.add(gable);
  const roofM = pmat("#3a3f46", { metalness: 0.6, roughness: 0.5 }), half = Math.hypot(W / 2, 1.1);
  for (const s of [-1, 1]) { const rs = new THREE.Mesh(new THREE.BoxGeometry(half + 0.25, 0.08, D + 0.4), roofM); rs.position.set(s * W / 4, H + 0.58, -D / 2); rs.rotation.z = -s * Math.atan2(1.1, W / 2); g.add(rs); }
  const trim = pmat("#1f2328", { metalness: 0.6, roughness: 0.4 });
  for (const s of [-1, 1]) { const cnr = new THREE.Mesh(new THREE.BoxGeometry(0.14, H, 0.14), trim); cnr.position.set(s * W / 2, H / 2, 0); g.add(cnr); }
  const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.35, 0.1), mat("#5d5953", { roughness: 0.85 })); base.position.set(0, 0.175, 0.03); g.add(base);
  // roll-up door
  const doorW = 2.6, doorH = 2.5;
  const fr = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.2, doorH + 0.15, 0.08), trim); fr.position.set(-0.9, (doorH + 0.15) / 2, 0.03); g.add(fr);
  for (let i = 0; i < 14; i++) { const sl = new THREE.Mesh(rbox(doorW, doorH / 14 * 0.92, 0.05, 0.01), pmat(i % 2 ? "#5a5f66" : "#666b72", { metalness: 0.5, roughness: 0.45 })); sl.position.set(-0.9, doorH / 14 * (i + 0.5), 0.09); g.add(sl); }
  // office wing: a row of lit windows
  const winM = new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false });
  for (const wx of [1.35, 2.35]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.9), winM); w.position.set(wx, 1.75, 0.01); g.add(w); const f = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.04), trim); f.position.set(wx, 1.75, -0.005); g.add(f); }
  // sign board with the name
  const board = makePlate(name, 3.2, 0.62, { bg: "#16324f", fg: "#ffffff" }); board.position.set(0, H + 0.42, 0.05); g.add(board);
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffe6bf", toneMapped: false });
  const lamp = new THREE.Mesh(rbox(0.5, 0.1, 0.3, 0.03), lampM); lamp.position.set(-0.9, doorH + 0.32, 0.25); g.add(lamp);
  const cone = makeLightShaft([-0.9, doorH + 0.28, 0.3], [-0.9, 0.02, 1.4], { w0: 0.5, w1: 2.4, color: "#ffe6bf", opacity: 0.12 }); g.add(cone.group);
  // two drums and a pallet by the door
  const pal = new THREE.Mesh(rbox(1.2, 0.14, 1.0, 0.02), pmat("#ffffff", { map: woodTex("#8a6a48"), roughness: 0.8 })); pal.position.set(-3.3 + 0.9, 0.07, 0.9); g.add(pal);
  for (const [dx, dz] of [[-0.25, 0], [0.32, 0.05]]) { const d = makeChemDrum("QUÍMICO", { r: 0.26, h: 0.82 }); d.label.userData.plate.detail = true; d.group.position.set(-2.4 + dx, 0.14, 0.9 + dz); d.group.rotation.y = 0.3; g.add(d.group); }
  g.add(contactShadow(W + 1.5, 2.5));
  return { group: g, lamp: lampM };
}
// Factory yard at dusk around the front: sky, yard asphalt, lamp posts with pools, a fence line and a
// low skyline far behind. API { group, update(t) }
function makeFactoryYard() {
  const g = new THREE.Group();
  g.add(skyPlane([[0, "#101a3a"], [0.55, "#3a3f6a"], [0.8, "#b0603e"], [1, "#f2a35e"]], { y: 12, z: -40, w: 140, h: 40 }));
  const sky = makeSkyline({ n: 30, z: -22, spread: 60, seed: 19, hMin: 2, hMax: 7 }); g.add(sky.group);
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), mat("#ffffff", { map: tileTex(asphaltTex(), 18, 12), roughness: 0.9 })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.003, 4); g.add(yard);
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false });
  for (const x of [-6.5, 6.5]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 5, 10), pmat("#24262a", { metalness: 0.6, roughness: 0.4 })); p.position.set(x, 2.5, 2.5); g.add(p);
    const hd = new THREE.Mesh(rbox(0.5, 0.1, 0.26, 0.04), lampM); hd.position.set(x, 5.0, 2.5); g.add(hd);
    const pool = makeFloorGlow(5, 4, { color: "#ffcf8a", opacity: 0.12 }); pool.position.set(x, 0.01, 2.8); g.add(pool);
  }
  const fenceM = pmat("#2a2c30", { metalness: 0.6, roughness: 0.5 });
  for (let x = -20; x <= 20; x += 1.6) if (Math.abs(x) > 4.2) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2, 6), fenceM); f.position.set(x, 1, -6); g.add(f); }
  for (const y of [0.6, 1.9]) for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(16, 0.03, 0.03), fenceM); r.position.set(s * 12.2, y, -6); g.add(r); }
  asBackdrop(g);
  return { group: g, update: (t) => sky.update(t) };
}
// Marble plinth with a name plate on its front and a flip plate below it (two faces: flip(0) shows
// the first, flip(1) the second; it turns over around x). Origin: floor centre; top at `h`.
// API { group, top, flip(k), name }
function makeNamePlinth(name, flip = null, { w = 1.6, h = 0.6, d = 1.0, flipBg = ["#2a2522", RED], flipFg = ["#f4e8da", "#ffffff"] } = {}) {
  const g = new THREE.Group();
  const tex = noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 }); tex.repeat.set(2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#1b1a1d", { map: tex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2; g.add(m);
  const nm = makePlate(name, w * 0.94, h * 0.4, { bg: "#141414", fg: "#d9b66a" }); nm.position.set(0, h * 0.72, d / 2 + 0.016); g.add(nm);
  let pivot = null;
  if (flip) {
    pivot = new THREE.Group(); pivot.position.set(0, h * 0.27, d / 2 + 0.05); g.add(pivot);
    const mk = (txt, i) => (txt.includes("\n") ? makePlate2(txt, w * 0.84, h * 0.42, { bg: flipBg[i], fg: flipFg[i], depth: 0.02 }) : makePlate(txt, w * 0.8, h * 0.4, { bg: flipBg[i], fg: flipFg[i], depth: 0.02 }));
    const a = mk(flip[0], 0); a.position.z = 0.012; pivot.add(a);
    const b = mk(flip[1], 1); b.position.z = -0.012; b.rotation.x = Math.PI; pivot.add(b);
  }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h, flip: (k) => { if (pivot) pivot.rotation.x = Math.PI * eInOut(clamp(k)); }, name: nm };
}
// Steel workbench (top, apron, four legs). Origin: floor centre; top at h. API { group, top }
function makeSteelBench({ w = 2.6, d = 1.3, h = 0.9 } = {}) {
  const g = new THREE.Group(), steel = pmat("#8d9096", { metalness: 0.85, roughness: 0.32 });
  const top = new THREE.Mesh(rbox(w, 0.05, d, 0.015), pmat("#3b3e43", { metalness: 0.7, roughness: 0.35 })); top.position.y = h - 0.025; g.add(top);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.12, d - 0.1), steel); apron.position.y = h - 0.11; g.add(apron);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, h - 0.05, 0.06), steel); l.position.set(sx * (w / 2 - 0.08), (h - 0.05) / 2, sz * (d / 2 - 0.08)); g.add(l); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
// Wooden desk with a dark leather top. Origin: floor centre; top at h. API { group, top }
function makeLeatherDesk({ w = 2.6, d = 1.4, h = 0.78 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat("#1f3a2c", { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}
// Ceramic mug. Origin: bottom centre.
function makeMug(color = "#e9e4dc") {
  const g = new THREE.Group(), m = pmat(color, { roughness: 0.25, clearcoat: 1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 28, 1, true), m); body.position.y = 0.06; g.add(body);
  const bot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 28), m); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.002; g.add(bot);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.056, 28), pmat("#2a1408", { roughness: 0.2 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.1; g.add(coffee);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 10, 20, Math.PI), m); h.rotation.z = -Math.PI / 2; h.position.set(0.06, 0.06, 0); g.add(h);
  return g;
}
// Phone on a tripod with a ring light around it (an influencer's setup). Origin: floor centre; the
// screen faces +z. API { group, phone, paint(fn) }
function makeTripodPhone({ h = 1.45 } = {}) {
  const g = new THREE.Group(), metal = pmat("#1c1d20", { metalness: 0.6, roughness: 0.35 });
  for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3 + 0.4, foot = new V3(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38), top = new V3(0, h * 0.55, 0), mid = foot.clone().add(top).multiplyScalar(0.5);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, foot.distanceTo(top), 8), metal); leg.position.copy(mid); leg.quaternion.setFromUnitVectors(new V3(0, 1, 0), top.clone().sub(foot).normalize()); g.add(leg); }
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, h * 0.45, 10), metal); col.position.y = h * 0.775; g.add(col);
  const ringM = new THREE.MeshBasicMaterial({ color: "#fff4e6", toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 12, 64), ringM); ring.position.set(0, h, 0); g.add(ring);
  const phone = makePhone(); phone.group.scale.setScalar(0.3); phone.group.position.set(0, h, 0.03); g.add(phone.group);
  const clampM = new THREE.Mesh(rbox(0.06, 0.6, 0.03, 0.01), metal); clampM.position.set(0, h, -0.005); g.add(clampM);
  g.add(contactShadow(1, 1));
  return { group: g, phone, paint: (fn) => { fn(phone.ctx); phone.tex.needsUpdate = true; } };
}
// Social profile / video screen painted on the phone (no real app, no real handle).
function paintProfile(x, mode, k = 0) {
  x.clearRect(0, 0, 720, 1500);
  const bg = x.createLinearGradient(0, 0, 0, 1500); bg.addColorStop(0, "#15161b"); bg.addColorStop(1, "#0b0b0e"); x.fillStyle = bg; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = "#8f96a3"; x.font = "700 38px Inter"; x.textAlign = "left"; x.fillText("9:41", 48, 74);
  if (mode === "perfil") {
    const cx = 360, cy = 300; const ring = x.createLinearGradient(cx - 150, cy - 150, cx + 150, cy + 150); ring.addColorStop(0, "#ff8a3c"); ring.addColorStop(1, "#e0261b");
    x.fillStyle = ring; x.beginPath(); x.arc(cx, cy, 150, 0, Math.PI * 2); x.fill(); x.fillStyle = "#2a2c33"; x.beginPath(); x.arc(cx, cy, 136, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#6b6f7a"; x.beginPath(); x.arc(cx, cy - 30, 52, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(cx, cy + 92, 96, 70, 0, Math.PI, 0); x.fill();
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "900 54px Inter"; x.fillText("PERFIL FITNESS", cx, 530);
    x.fillStyle = "#ff8a3c"; x.font = "900 150px Inter"; x.fillText("MILHÕES", cx, 760);
    x.fillStyle = "#e9e4dc"; x.font = "800 54px Inter"; x.fillText("DE SEGUIDORES", cx, 840);
    for (let i = 0; i < 9; i++) { const gx = 40 + (i % 3) * 216, gy = 920 + Math.floor(i / 3) * 190; x.fillStyle = ["#3a2a22", "#2a3340", "#3a3324", "#2d3a2d"][i % 4]; roundRect(x, gx, gy, 204, 178, 14); x.fill(); x.fillStyle = "rgba(255,255,255,0.55)"; x.fillRect(gx + 62, gy + 84, 80, 10); x.fillRect(gx + 50, gy + 64, 16, 50); x.fillRect(gx + 138, gy + 64, 16, 50); }
    for (let i = 0; i < 6; i++) { const p = (k * 1.4 + i * 0.17) % 1, hx = 590 + Math.sin(i * 2.1) * 30, hy = 1400 - p * 420; x.globalAlpha = 1 - p; x.fillStyle = "#ff3b5c"; x.font = "900 64px Inter"; x.fillText("♥", hx, hy); }
    x.globalAlpha = 1;
  } else {
    x.fillStyle = "#24262d"; roundRect(x, 30, 140, 660, 1100, 30); x.fill();
    x.fillStyle = "rgba(255,255,255,0.9)"; x.beginPath(); x.moveTo(300, 560); x.lineTo(300, 760); x.lineTo(460, 660); x.closePath(); x.fill();
    x.fillStyle = "#0b0b0e"; roundRect(x, 70, 900, 580, 230, 20); x.fill();
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "900 60px Inter"; x.fillText("“FOI VÍTIMA", 360, 990); x.fillText("DE FRAUDE”", 360, 1070);
    x.fillStyle = "#3a3d44"; roundRect(x, 60, 1290, 600, 14, 7); x.fill(); x.fillStyle = "#ff3b2b"; roundRect(x, 60, 1290, 600 * clamp(k), 14, 7); x.fill();
  }
}
// Doctor's prescription lying flat: white paper with a blue header printed RECEITA, the Rx lines, a blue
// doctor's stamp and a signature, and a pen lying across it. Origin: centre of the underside; face +y.
// API { group, top, plates }
function makePrescription({ w = 0.74, d = 0.96 } = {}) {
  const g = new THREE.Group(), T = 0.004, H = Math.round(512 * d / w);
  const c = makeCanvas(512, H), x = c.getContext("2d");
  x.fillStyle = "#fbfaf6"; x.fillRect(0, 0, 512, H);
  x.fillStyle = "#1f4f8a"; x.fillRect(0, 0, 512, H * 0.17);
  x.fillStyle = "#1c1410"; x.font = "italic 900 70px Inter"; x.textAlign = "left"; x.fillText("Rx", 36, H * 0.31);
  x.fillStyle = "rgba(30,40,70,0.85)"; for (let y = H * 0.42; y < H * 0.7; y += 52) x.fillRect(40, y, 260 + ((y * 7) % 120), 9);
  x.strokeStyle = "#2a5fb0"; x.lineWidth = 6; x.beginPath(); x.arc(380, H * 0.82, 58, 0, Math.PI * 2); x.stroke(); x.lineWidth = 3; x.beginPath(); x.arc(380, H * 0.82, 44, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "#2a5fb0"; x.fillRect(350, H * 0.81, 60, 5);
  x.strokeStyle = "rgba(20,20,60,0.8)"; x.lineWidth = 3; x.beginPath(); x.moveTo(60, H * 0.86); x.bezierCurveTo(100, H * 0.8, 130, H * 0.9, 170, H * 0.84); x.bezierCurveTo(200, H * 0.8, 220, H * 0.88, 250, H * 0.85); x.stroke();
  const tex = texFrom(c), pm = pmat("#fbfaf6", { roughness: 0.9 }), face = pmat("#ffffff", { map: tex, roughness: 0.88 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [pm, pm, face, pm, pm, pm]); sheet.position.y = T / 2; g.add(sheet);
  const title = makePlate("RECEITA", w * 0.62, d * 0.13, { bg: "#1f4f8a", fg: "#ffffff", depth: 0.002 }); title.rotation.x = -Math.PI / 2; title.position.set(0, T + 0.001, -d / 2 + d * 0.085); g.add(title);
  const pen = new THREE.Group(); pen.position.set(w * 0.12, T + 0.009, d * 0.18); pen.rotation.y = 0.7; g.add(pen);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.15, 16), pmat("#1b2a4a", { roughness: 0.3, clearcoat: 1 })); body.rotation.z = Math.PI / 2; pen.add(body);
  const capP = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.05, 16), pmat("#c9a45a", { metalness: 1, roughness: 0.3 })); capP.rotation.z = Math.PI / 2; capP.position.x = 0.075; pen.add(capP);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.025, 12), pmat("#8d9096", { metalness: 1, roughness: 0.3 })); tip.rotation.z = Math.PI / 2; tip.position.x = -0.087; pen.add(tip);
  g.add(contactShadow(w + 0.2, d + 0.2));
  return { group: g, top: T, plates: { title } };
}
// Desk dressing: a banker's lamp with its pool of light, a stack of folders, optional law books — it
// says "office" or "court" even in a shot from above. Nothing here is a hero. Positions are [x, z].
function dressDesk(S, top, { lamp = [-1.15, -0.5], folders = [1.15, -0.45], books = null } = {}) {
  const g = new THREE.Group(), brass = pmat("#c9a45a", { metalness: 1, roughness: 0.3 });
  if (lamp) {
    const [lx, lz] = lamp, base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.025, 28), brass); base.position.set(lx, top + 0.0125, lz); g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 12), brass); stem.position.set(lx, top + 0.17, lz); g.add(stem);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.38, 28, 1, false, 0, Math.PI), new THREE.MeshPhysicalMaterial({ color: "#1f6b3a", roughness: 0.15, clearcoat: 1, emissive: "#2fae66", emissiveIntensity: 0.35, side: THREE.DoubleSide }));
    shade.rotation.z = Math.PI / 2; shade.position.set(lx, top + 0.33, lz + 0.04); g.add(shade);
    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12), new THREE.MeshBasicMaterial({ color: "#fff1d0", toneMapped: false })); bulb.rotation.z = Math.PI / 2; bulb.position.set(lx, top + 0.31, lz + 0.04); g.add(bulb);
    const pool = makeFloorGlow(1.1, 0.8, { color: "#ffe2a8", opacity: 0.3 }); pool.position.set(lx, top + 0.003, lz + 0.35); g.add(pool);
  }
  if (folders) {
    const [fx, fz] = folders;
    ["#d9b66a", "#2f5f9a", "#9b1c1c", "#d9b66a"].forEach((cl, i) => { const f = new THREE.Mesh(rbox(0.42, 0.028, 0.32, 0.01), pmat(cl, { roughness: 0.75 })); f.position.set(fx + (i % 2) * 0.02, top + 0.014 + i * 0.03, fz); f.rotation.y = (i - 1.5) * 0.08; g.add(f); });
  }
  if (books) for (const [bx, bz, ttl, col] of books) { const b = makeLawBook({ w: 0.34, d: 0.46, t: 0.08, color: col, title: ttl, emblem: false }); b.group.position.set(bx, top, bz); b.group.rotation.y = 0.15; g.add(b.group); }
  g.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; });
  S.add(g); return g;
}
// The factory floor behind the bench: a pallet of drums and yellow floor markings (seen from above).
function dressFactoryFloor(S, { x = 0.3, z = -1.9 } = {}) {
  const g = new THREE.Group();
  const pal = new THREE.Mesh(rbox(1.25, 0.14, 1.25, 0.02), pmat("#ffffff", { map: woodTex("#8a6a48"), roughness: 0.8 })); pal.position.set(x, 0.07, z); g.add(pal);
  for (const [dx, dz] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) { const d = makeChemDrum("ACETONA", { r: 0.28, h: 0.86 }); d.label.userData.plate.detail = true; d.group.position.set(x + dx, 0.14, z + dz); d.group.rotation.y = dx * 3; g.add(d.group); }
  const ym = mat("#e8b500", { roughness: 0.6 });
  for (const zz of [-0.95, 1.05]) { const l = new THREE.Mesh(new THREE.BoxGeometry(5, 0.004, 0.08), ym); l.position.set(0, 0.006, zz + 0.0); g.add(l); }
  S.add(g); return g;
}
// Answer board hung on the front rim of a scale pan (two brass hooks over the rim): the chains stay behind
// it. Origin: the hook line on the rim; the board hangs below and faces +z.
function makeHangBoard(text, { w = 0.8, h = 0.34, bg = "#141414", fg = "#ffffff" } = {}) {
  const g = new THREE.Group(), brass = pmat("#d0a54e", { metalness: 1, roughness: 0.24 });
  const board = text.includes("\n") ? makePlate2(text, w, h, { bg, fg, depth: 0.03 }) : makePlate(text, w, h, { bg, fg, depth: 0.03 });
  board.position.set(0, -h / 2 + 0.05, 0.025); g.add(board);
  for (const sx of [-1, 1]) { const hk = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 16, Math.PI), brass); hk.rotation.y = Math.PI / 2; hk.position.set(sx * w * 0.32, 0.06, 0.005); g.add(hk); }
  return g;
}
// Industrial platform scale: diamond-plate deck with hazard edges and a post with a red LED readout.
// Origin: floor centre; deck top at 0.12. API { group, deckY, set(kg) }
function makeFloorScale({ w = 2.4, d = 2.0 } = {}) {
  const g = new THREE.Group(), deckY = 0.12;
  const dc = makeCanvas(128, 128), dx = dc.getContext("2d"); dx.fillStyle = "#6d7176"; dx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < 128; x += 16) { dx.fillStyle = "rgba(255,255,255,0.18)"; dx.save(); dx.translate(x + 4, y + 4); dx.rotate(0.6); dx.fillRect(-5, -1.5, 10, 3); dx.restore(); }
  const dt = texFrom(dc); dt.wrapS = dt.wrapT = THREE.RepeatWrapping; dt.repeat.set(w * 2, d * 2);
  const deck = new THREE.Mesh(rbox(w, deckY, d, 0.02), pmat("#ffffff", { map: dt, metalness: 0.8, roughness: 0.38 })); deck.position.y = deckY / 2; g.add(deck);
  const hz = hazardTex();
  for (const [x, z, ww, dd] of [[0, d / 2 + 0.04, w + 0.16, 0.08], [0, -d / 2 - 0.04, w + 0.16, 0.08], [w / 2 + 0.04, 0, 0.08, d], [-w / 2 - 0.04, 0, 0.08, d]]) { const e = new THREE.Mesh(new THREE.BoxGeometry(ww, deckY, dd), mat("#ffffff", { map: hz, roughness: 0.6 })); e.position.set(x, deckY / 2, z); g.add(e); }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.5, 12), pmat("#2a2c30", { metalness: 0.7, roughness: 0.4 })); post.position.set(w / 2 - 0.3, 0.75, -d / 2 - 0.25); g.add(post);
  const c = makeCanvas(512, 160), x = c.getContext("2d"), tex = texFrom(c);
  const side = pmat("#1b1c1f", { metalness: 0.5, roughness: 0.4 });
  const disp = new THREE.Mesh(rbox(0.9, 0.32, 0.12, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), side]);
  disp.position.set(w / 2 - 0.3, 1.6, -d / 2 - 0.25); disp.rotation.y = -0.15; g.add(disp);
  let cur = "";
  const set = (kg) => { const s = Math.round(kg).toLocaleString("pt-BR") + " kg"; if (s === cur) return; cur = s; x.fillStyle = "#070707"; x.fillRect(0, 0, 512, 160); x.fillStyle = "#ff3b2b"; x.font = "800 92px Inter"; x.textAlign = "right"; x.textBaseline = "middle"; x.fillText(s, 488, 84); tex.needsUpdate = true; };
  set(0); g.add(contactShadow(w + 1.2, d + 1.2));
  return { group: g, deckY, set, display: disp };
}
// Pallet of tape-wrapped packages (instanced), filled layer by layer. Origin: floor centre.
// API { group, set(k), h(k) }
function makeBrickPallet({ cols = 4, rows = 3, layers = 7, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), bw = 0.26, bd = 0.17, bh = 0.07;
  const pal = new THREE.Mesh(rbox(cols * bw + 0.08, 0.12, rows * bd + 0.08, 0.015), pmat("#ffffff", { map: woodTex("#8a6a48"), roughness: 0.8 })); pal.position.y = 0.06; g.add(pal);
  const tape = pmat("#b8955a", { roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const n = cols * rows * layers, mesh = new THREE.InstancedMesh(rbox(bw * 0.96, bh * 0.94, bd * 0.96, 0.02), tape, n), d = new THREE.Object3D();
  let i = 0;
  for (let l = 0; l < layers; l++) for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) { d.position.set((c - (cols - 1) / 2) * bw + (r() - 0.5) * 0.01, 0.12 + bh * (l + 0.5), (rr - (rows - 1) / 2) * bd + (r() - 0.5) * 0.01); d.rotation.y = (r() - 0.5) * 0.06; d.updateMatrix(); mesh.setMatrixAt(i++, d.matrix); }
  g.add(mesh); g.add(contactShadow(cols * bw + 0.6, rows * bd + 0.6));
  const set = (k) => { mesh.count = Math.max(1, Math.round(clamp(k) * n)); };
  set(1);
  return { group: g, set, h: (k) => 0.12 + bh * Math.ceil(clamp(k) * layers) };
}
// Green road sign on two posts with a printed board. Origin: floor centre; board faces +z.
function makeRoadSign(text, { w = 2.2, h = 0.7, y = 2.3 } = {}) {
  const g = new THREE.Group(), pm = pmat("#8d9096", { metalness: 0.8, roughness: 0.4 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, y + h / 2, 10), pm); p.position.set(s * w * 0.35, (y + h / 2) / 2, -0.06); g.add(p); }
  const back = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.05, 0.03), pmat("#e9e4dc", { roughness: 0.5 })); back.position.set(0, y, -0.02); g.add(back);
  const b = makePlate(text, w, h, { bg: "#1f6b3a", fg: "#ffffff", depth: 0.03 }); b.position.set(0, y, 0.02); g.add(b);
  return g;
}
// Office door with a frosted glass panel and a name plate; a warm lit room behind. Origin: floor centre
// of the doorway; front +z. API { group, glass }
function makeFrostDoor(label = "SUA EMPRESA") {
  const g = new THREE.Group(), w = 1.1, h = 2.2, wood = pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.45, clearcoat: 0.5 });
  for (const s of [-1, 1]) { const st = new THREE.Mesh(rbox(0.16, h, 0.08, 0.01), wood); st.position.set(s * (w / 2 - 0.08), h / 2, 0); g.add(st); }
  for (const [y, hh] of [[0.45, 0.9], [h - 0.08, 0.16], [0.95, 0.12]]) { const r = new THREE.Mesh(rbox(w, hh, 0.08, 0.01), wood); r.position.set(0, y, 0); g.add(r); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.32, h - 1.17), new THREE.MeshPhysicalMaterial({ color: "#f3e7d2", roughness: 0.9, transparent: true, opacity: 0.5, depthWrite: false, emissive: "#ffcf94", emissiveIntensity: 0.3 }));
  glass.position.set(0, 1.01 + (h - 1.17) / 2, 0.005); g.add(glass);
  const plate = makePlate(label, 0.9, 0.26, { bg: "#141414", fg: "#d9b66a" }); plate.position.set(0, 1.5, 0.03); g.add(plate);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), pmat("#c9a45a", { metalness: 1, roughness: 0.3 })); knob.position.set(w / 2 - 0.16, 0.98, 0.07); g.add(knob);
  const room = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.2, h), new THREE.MeshBasicMaterial({ color: "#c9965a", toneMapped: false })); room.position.set(0, h / 2, -1.4); g.add(room);
  const sideW = mat("#ffffff", { map: tileTex(plasterTex("#4f3b2f"), 3, 3), roughness: 0.9 });
  const walls = new THREE.Group();
  for (const s of [-1, 1]) { const wl = new THREE.Mesh(new THREE.BoxGeometry(0.9, h + 0.4, 0.2), sideW); wl.position.set(s * (w / 2 + 0.45), (h + 0.4) / 2, -0.1); walls.add(wl); }
  const top = new THREE.Mesh(new THREE.BoxGeometry(w + 1.8, 0.4, 0.2), sideW); top.position.set(0, h + 0.2, -0.1); walls.add(top);
  asBackdrop(walls);
  return { group: g, glass, plate, walls };
}

// ============================================================ 1 · gancho: a porta (0–3.55)
// "Por que a Polícia Federal bateu na porta do Renato Cariani?" Dawn; three knocks rattle the door; the
// police lights (red/blue) wash over the facade from the left.
const KNOCKS = [0.6, 1.02, 1.44];
addScene("porta", 0, 3.55, (S) => {
  const st = makeDawnStreet(); S.backdrop(st.group);
  const door = makeHouseDoor({ wallW: 1.3, wallH: 2.45 }); S.add(door.group);
  const anim = (t) => {
    st.siren(0.35 + 0.65 * sm(t, 0.1, 0.9)); st.update(t);
    key.intensity = 1.5; key.color.set("#ffc9a0"); hemi.intensity = 0.38; hemi.color.set("#9fb2ff");
    let r = 0; for (const k of KNOCKS) r += beat(t, k, 0.16); door.open(0.008 * r);
  };
  S.hero(door.group, "porta da casa");
  const box = envelope([door.group], anim, 0, 3.55);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, 3.55), { zone: "stage", from: [0.22, 0.1, 1], pull0: 1.15 }); for (const k of KNOCKS) p = CAM.shake(p, t, k, 0.035, 0.22); CAM.apply(p); };
});

// ============================================================ 2 · a resposta: químicos (3.55–7.05)
// "Venda suspeita de químicos que podem virar droga." Three drums drop into the factory hall; on
// "droga" the hall flashes red.
addScene("quimicos", 3.55, 7.05, (S) => {
  const hall = chemHall(7); S.backdrop(hall.group);
  const spec = [["ACETONA", -0.72, "#1d5ea8", 3.62, "INFLAMÁVEL"], ["ÉTER", 0, "#1d5ea8", 3.86, "INFLAMÁVEL"], ["ÁCIDO", 0.72, "#e8e2d4", 4.1, "CORROSIVO"]];
  const drums = spec.map(([nm, x, c, at, hz]) => { const d = makeChemDrum(nm, { color: c, hazard: hz }); d.group.position.set(x, 0, 0); S.add(d.group); return { d, x, at }; });
  const anim = (t) => {
    hall.update(t); hall.tint(0.85 * beat(t, 5.9, 1.0), "#ff2a1a"); key.intensity = 2.0;
    for (const { d, x, at } of drums) { d.group.visible = t >= at; d.group.position.set(x, dropY(t, at, 1.3, 0.38), 0); d.group.rotation.y = 0.25 * (1 - eOut(lin(t, at, at + 0.6))) - 0.1 + x * 0.12; }
  };
  drums.forEach(({ d, at }, i) => { S.hero(d.group, "galão " + spec[i][0].toLowerCase(), { when: (t) => t > at + 0.45 }); S.solid(d.group, "galão " + i); });
  const box = envelope(drums.map((x) => x.d.group), anim, 4.7, 7.05);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, 3.55, 7.05), { zone: "stage", from: [0, 0.32, 1], deg: 34, pull: 1.06 })); };
});

// ============================================================ 3 · as notas (7.05–9.75)
// "Sessenta notas fiscais no nome da empresa dele." Invoices fan out on a steel bench, issued by
// ANIDROL; the camera drops onto the top one.
addScene("notas", 7.05, 9.75, (S) => {
  const hall = chemHall(9); S.backdrop(hall.group);
  const bench = makeSteelBench({ w: 2.8, d: 1.5 }); S.add(bench.group); dressFactoryFloor(S, { x: 2.4, z: -3.0 });
  const N = 9, fan = new THREE.Group(); fan.position.set(0, bench.top + 0.003, 0.35); S.add(fan);
  const sheets = [];
  for (let i = 0; i < N; i++) {
    const main = i === (N - 1) / 2, inv = makeInvoiceSheet({ w: 0.7, d: 0.96 });
    if (!main) { Object.values(inv.plates).forEach((p) => { p.userData.plate.detail = true; }); inv.plates.issuer.visible = false; inv.plates.to.visible = false; }
    const piv = new THREE.Group(); piv.add(inv.group); inv.group.position.set(0, (main ? N : i) * 0.0012, -0.42); fan.add(piv);
    sheets.push({ piv, inv, a: (i - (N - 1) / 2) * 0.2, at: 7.15 + (main ? N - 1 : i < (N - 1) / 2 ? i : i - 1) * 0.11, main });
  }
  const anim = (t) => {
    hall.update(t); key.intensity = 2.1;
    for (const s of sheets) { const k = eOut(lin(t, s.at, s.at + 0.35)); s.piv.visible = t >= s.at - 0.02; s.piv.rotation.y = s.a * k; s.piv.position.y = 0.25 * (1 - k); }
  };
  const main = sheets.find((s) => s.main);
  S.hero(fan, "leque de notas fiscais", { when: (t) => t < 8.6 });
  S.hero(main.inv.group, "nota fiscal da anidrol", { when: (t) => t >= 8.6 });
  S.solid(bench.group, "bancada");
  const A0 = CAM.pose(envelope([fan], anim, 8.2, 8.6), { zone: "stage", from: [0, 0.55, 1], pull: 1.1 });
  const A = CAM.pose(envelope([fan], anim, 8.2, 8.6), { zone: "stage", from: [0, 1.2, 0.6], pull: 1.04 });
  const B = CAM.pose(envelope([main.inv.group], anim, 9.0, 9.75), { zone: "stage", from: [0.05, 1.5, 0.55], pull: 1.02 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[7.05, A0], [8.4, A, 1.1], [9.2, B, 0.8]])); };
});

// ============================================================ 4 · o desvio (9.75–14.66)
// "E, segundo a acusação, doze toneladas desviadas pro tráfico." A truck full of drums drives away down
// a road at night, past the last street light, into the dark.
function makeLoadedTruck() {
  const tr = makeCargoTruck(); tr.open(1);
  const { x0, x1, y, w } = tr.cargo;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const d = makeChemDrum("ACETONA", { r: 0.27, h: 0.84 }); d.label.userData.plate.detail = true; d.group.position.set(x0 + 0.35 + i * 0.6, y, (j - 1) * (w / 3)); d.group.rotation.y = Math.PI / 2 + (i + j) * 0.4; tr.group.add(d.group); }
  return tr;
}
addScene("desvio", 9.75, 14.66, (S) => {
  const road = makeNightRoad(); S.backdrop(road.group);
  const tr = makeLoadedTruck(); tr.group.rotation.y = Math.PI / 2; S.add(tr.group);
  const zAt = (t) => 2 - 3.5 * lin(t, 9.75, 14.66) - 12 * eIn(lin(t, 9.75, 14.66));
  const anim = (t) => { road.update(t); road.lights(1 - 0.75 * sm(t, 12.8, 14.2)); key.intensity = 0.9; key.color.set("#9fb2ff"); hemi.intensity = 0.28; tr.group.position.set(1.25, 0, zAt(t)); };
  S.hero(tr.group, "caminhão com galões");
  return (t) => { anim(t); const box = frameBox(tr.group); CAM.apply(CAM.pose(box, { zone: "stage", from: [lerp(0.55, 0.25, lin(t, 9.75, 14.66)), lerp(0.35, 0.55, lin(t, 9.75, 14.66)), 1], pull: 1.05 })); };
});

// ============================================================ 5 · divide (14.66–18.05)
// "Fica até o final, porque esse caso divide todo mundo." The scales in a dim courtroom, both pans
// still covered, rocking; a beam of light from above.
function scaleRig(S, { covered = false } = {}) {
  const sc = makeJusticeScale({ arm: 1.15, panR: 0.5 }); S.add(sc.group);
  const domes = sc.holders.map((h) => { const d = makeCloche({ r: 0.44 }); h.add(d); d.visible = covered; return d; });
  return { sc, domes };
}
addScene("divide", 14.66, 18.05, (S) => {
  const court = makeCourtroomSet({ seed: 5 }); S.backdrop(court.group);
  const { sc } = scaleRig(S, { covered: true });
  const shaft = makeLightShaft([0, 7.4, 0.2], [0, 0.02, 0.4], { w0: 0.6, w1: 3.2, color: "#ffe2b0", opacity: 0.16 }); asBackdrop(shaft.group); S.backdrop(shaft.group);
  const pool = makeFloorGlow(3.2, 2.4, { color: "#ffe2b0", opacity: 0.22 }); asBackdrop(pool); S.backdrop(pool);
  const anim = (t) => { court.lights(0.4); court.update(t); shaft.set(1); key.intensity = 1.6; hemi.intensity = 0.25; sc.setTilt(0.16 * Math.sin((t - 14.66) * 2.3)); };
  S.hero(sc.group, "balança coberta");
  const box = envelope([sc.group], anim, 14.66, 18.05);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, 14.66, 18.05), { zone: "stage", from: [0.1, 0.25, 1], rise: 0.35, pull: 1.05 })); };
});

// ============================================================ 6 · a empresa (18.05–21.85)
// "A empresa é a Anidrol, indústria química de Diadema." The factory at dusk, name on the board.
addScene("anidrol", 18.05, 21.85, (S) => {
  const yard = makeFactoryYard(); S.backdrop(yard.group);
  const f = makeFactoryFront("ANIDROL"); S.add(f.group);
  const anim = (t) => { yard.update(t); key.intensity = 1.6; key.color.set("#ffc29a"); hemi.intensity = 0.4; hemi.color.set("#a8b8ff"); };
  S.hero(f.group, "galpão anidrol");
  const box = envelope([f.group], anim, 18.05, 21.85);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "reveal", lin(t, 18.05, 21.85), { zone: "stage", from: [-0.3, 0.16, 1], pull0: 1.18 })); };
});

// ============================================================ 7 · um dos donos (21.85–27.14)
// "Um dos donos: Renato Cariani, influenciador fitness com milhões de seguidores." A: the athlete
// mannequin on a plinth (RENATO CARIANI · SÓCIO) strikes a double-biceps pose. B (cut 24.45): the
// phone on a tripod with a ring light, "milhões de seguidores".
addScene("socio", 21.85, 27.14, (S) => {
  const gym = makeGymSet(); S.backdrop(gym.group);
  const pl = makeNamePlinth("RENATO CARIANI", ["SÓCIO", "RÉU"]); pl.group.position.set(0, 0, 0); S.add(pl.group);
  const fig = makeAthleteFigure(); fig.group.position.set(0, pl.top, 0); S.add(fig.group);
  const tp = makeTripodPhone(); tp.group.position.set(0.9, 0, 2.4); tp.group.rotation.y = -0.15; S.add(tp.group);
  let painted = -1;
  const anim = (t) => {
    gym.update(t); key.intensity = 2.0; key.color.set("#fff0e0"); hemi.intensity = 0.42; hemi.color.set("#cfe0ff");
    fig.setPose({ turn: 0.15 * Math.sin((t - 21.85) * 0.9) });
    tp.group.visible = t >= 24.45; fig.group.visible = pl.group.visible = t < 24.45;
    const fr = Math.floor(t * 15); if (fr !== painted) { painted = fr; tp.paint((x) => paintProfile(x, "perfil", lin(t, 24.45, 27.14))); }
  };
  S.hero(fig.group, "atleta 3d", { when: (t) => t < 24.45 }); S.hero(pl.group, "pedestal com nome", { when: (t) => t < 24.45 });
  S.hero(tp.phone.group, "celular no tripé", { when: (t) => t >= 24.45 });
  const A = envelope([fig.group, pl.group], anim, 21.85, 24.45);
  const B = envelope([tp.phone.group], anim, 24.45, 27.14);
  return (t) => {
    anim(t);
    if (t < 24.45) CAM.apply(CAM.move(A, "orbit", lin(t, 21.85, 24.45), { zone: "stage", from: [0, 0.18, 1], deg: 40, pull: 1.04 }));
    else CAM.apply(CAM.move(B, "push", lin(t, 24.45, 27.14), { zone: "stage", from: [-0.1, 0.05, 1], pull: 1.08, pull0: 1.45 }));
  };
});

// ============================================================ 8 · tarja preta (27.14–31.6)
// "Pensa num remédio tarja preta: só sai da farmácia com receita." The box on the pharmacy counter; the
// prescription slides in next to it.
function pharmacyCounter(S) {
  const g = new THREE.Group(), H = 1.0;
  const front = new THREE.Mesh(rbox(3.4, H - 0.05, 1.4, 0.02), pmat("#e9ece8", { roughness: 0.45 })); front.position.y = (H - 0.05) / 2; g.add(front);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.12, 1.42), pmat("#1f8a4c", { roughness: 0.4 })); stripe.position.y = 0.75; g.add(stripe);
  const top = new THREE.Mesh(rbox(3.6, 0.05, 1.6, 0.02), pmat("#2a2f2d", { roughness: 0.25, clearcoat: 1 })); top.position.y = H - 0.025; g.add(top);
  g.add(contactShadow(4, 1.8)); S.add(g); S.solid(g, "balcão"); return { group: g, top: H };
}
addScene("tarja", 27.14, 31.6, (S) => {
  const ph = makePharmacySet(); S.backdrop(ph.group);
  const ct = pharmacyCounter(S);
  const box = makeMedicineBox({ w: 0.8, h: 0.48, d: 0.28, name: "COMPRIMIDOS" }); box.group.position.set(0, ct.top, -0.45); box.group.rotation.y = 0.06; S.add(box.group);
  const rx = makePrescription({ w: 0.74, d: 0.96 }); rx.group.position.set(0.04, ct.top, 0.3); S.add(rx.group);
  const anim = (t) => {
    ph.update(t); key.intensity = 2.0; key.color.set("#fff4ea");
    popIn(box.group, t, 27.2, 0.4);
    const k = eOut(lin(t, 29.35, 29.9)); popIn(rx.group, t, 29.3, 0.3); rx.group.position.x = lerp(1.35, 0.04, k); rx.group.rotation.y = lerp(0.5, -0.06, k);
  };
  S.hero(box.group, "caixa tarja preta", { when: (t) => t > 27.6 }); S.hero(rx.group, "receita médica", { when: (t) => t > 29.9 });
  S.solid(box.group, "caixa", { restsOn: ["balcão"] });
  const A = envelope([box.group], anim, 27.6, 29.3), B = envelope([box.group, rx.group], anim, 29.95, 31.6);
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[27.14, CAM.move(A, "push", lin(t, 27.14, 29.3), { zone: "stage", from: [0.1, 0.42, 1], pull0: 1.3 })], [29.9, CAM.pose(B, { zone: "stage", from: [-0.05, 1.05, 0.85], pull: 1.0 }), 0.7]])); };
});

// ============================================================ 9 · químicos são iguais (31.6–34.6)
// "Alguns químicos são iguais: podem virar droga." On the same counter the box becomes a drum and the
// prescription becomes an invoice.
addScene("igual", 31.6, 34.6, (S) => {
  const ph = makePharmacySet(); S.backdrop(ph.group);
  const ct = pharmacyCounter(S);
  const box = makeMedicineBox({ w: 0.8, h: 0.48, d: 0.28, name: "COMPRIMIDOS" }); box.group.position.set(0, ct.top, -0.45); box.group.rotation.y = 0.06; S.add(box.group);
  const dr = makeReagentBottle("ACETONA", { r: 0.115, h: 0.48 }); dr.group.position.set(0, ct.top, -0.45); S.add(dr.group);
  const rx = makePrescription({ w: 0.74, d: 0.96 }); rx.group.position.set(0.04, ct.top, 0.3); rx.group.rotation.y = -0.06; S.add(rx.group);
  const inv = makeInvoiceSheet({ w: 0.74, d: 0.96, to: null }); inv.group.position.set(0.04, ct.top, 0.3); S.add(inv.group);
  for (const doc of [inv.group, rx.group]) doc.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; });
  const anim = (t) => {
    ph.update(t); key.intensity = 2.0; key.color.set("#fff4ea");
    const kb = sm(t, 31.75, 32.1); box.group.visible = kb < 0.99; box.group.scale.setScalar(Math.max(0.001, 1 - kb));
    popIn(dr.group, t, 32.0, 0.45); dr.group.rotation.y = 0.6 * (1 - eOut(lin(t, 32.0, 32.8)));
    const kr = sm(t, 32.5, 32.85); rx.group.visible = kr < 0.99; rx.group.position.x = lerp(0.04, 1.35, kr); rx.group.scale.setScalar(Math.max(0.001, 1 - sm(t, 32.65, 32.85)));
    const ki = eOut(lin(t, 32.75, 33.25)); popIn(inv.group, t, 32.7, 0.3); inv.group.position.x = lerp(1.35, 0.04, ki); inv.group.rotation.y = lerp(0.5, -0.06, ki);
  };
  S.hero(box.group, "caixa tarja preta", { when: (t) => t < 31.85 }); S.hero(dr.group, "frasco de acetona", { when: (t) => t > 32.5 }); S.hero(rx.group, "receita", { when: (t) => t < 32.5 }); S.hero(inv.group, "nota fiscal", { when: (t) => t > 33.0 });
  const box0 = envelope([box.group, rx.group], anim, 31.6, 32.3).union(envelope([dr.group, inv.group], anim, 33.3, 34.6));
  return (t) => { anim(t); CAM.apply(CAM.move(box0, "orbit", lin(t, 31.6, 34.6), { zone: "stage", from: [-0.05, 0.72, 1], deg: 18, pull: 1.0 })); };
});

// ============================================================ 10 · a PF controla (34.6–40.05)
// "Então, a PF controla quem vende, e cada venda tem nota dizendo pra quem foi." On a bench in the
// factory hall: the drum, the licence (LICENÇA DA PF) stamped, then the invoice with the buyer's line.
addScene("licenca", 34.6, 40.05, (S) => {
  const hall = chemHall(11, -3.6); S.backdrop(hall.group);
  const bench = makeSteelBench({ w: 3.0, d: 1.5 }); S.add(bench.group); dressFactoryFloor(S, { x: -2.0, z: -2.5 });
  const dr = makeChemDrum("ACETONA", { r: 0.28, h: 0.86 }); dr.label.userData.plate.detail = true; dr.group.position.set(-0.92, bench.top, -0.15); dr.group.rotation.y = 0.2; S.add(dr.group);
  const lic = makeCertificate("LICENÇA DA PF", { w: 0.9, d: 1.15 }); lic.group.position.set(0.05, bench.top, 0.05); S.add(lic.group);
  const ink = makeInkMark("AUTORIZADA", 0.72, 0.28, { ink: "#1f6b3a" }); ink.rotation.x = -Math.PI / 2; ink.position.set(-0.12, lic.top + 0.003, 0.24); lic.group.add(ink);
  const stamp = makeStamp({ w: 0.54, d: 0.26, ink: "#1f6b3a" }); S.add(stamp);
  const inv = makeInvoiceSheet({ w: 0.8, d: 1.08, issuer: "EMITENTE: ANIDROL", to: "PARA: QUEM COMPROU" }); inv.group.position.set(0.98, bench.top + 0.002, 0.1); S.add(inv.group);
  const anim = (t) => {
    hall.update(t); key.intensity = 2.1;
    const kl = eOut(lin(t, 34.7, 35.2)); lic.group.visible = t > 34.65; lic.group.position.y = bench.top + 0.6 * (1 - kl); lic.group.rotation.y = 0.4 * (1 - kl) - 0.05;
    const press = t < 35.9 ? 0 : t < 36.1 ? lin(t, 35.9, 36.1) : 1 - sm(t, 36.2, 36.7);
    stamp.visible = t > 35.4 && t < 36.8; stamp.position.set(0.05 - 0.12, bench.top + lic.top + 0.004 + 0.5 * (1 - press) + (t < 35.9 ? 0.3 * (1 - lin(t, 35.4, 35.9)) : 0), 0.05 + 0.24);
    ink.visible = t > 36.08; ink.material.opacity = 1;
    const ki = eOut(lin(t, 37.0, 37.5)); popIn(inv.group, t, 36.95, 0.3); inv.group.position.x = lerp(1.3, 0.98, ki); inv.group.rotation.y = 0.5 * (1 - ki) - 0.08;
  };
  S.hero(dr.group, "galão", { when: (t) => t < 35.2 });
  S.hero(lic.group, "licença da pf", { when: (t) => t > 35.6 && t < 36.8 });
  S.hero(inv.group, "nota com o comprador", { when: (t) => t > 37.6 });
  S.solid(bench.group, "bancada");
  const A0 = CAM.pose(envelope([dr.group, lic.group], anim, 35.2, 36.9), { zone: "stage", from: [0.05, 0.6, 1], pull: 1.08 });
  const A = CAM.pose(envelope([dr.group, lic.group], anim, 35.2, 36.9), { zone: "stage", from: [0.0, 1.3, 0.7], pull: 1.0 });
  const B = CAM.pose(envelope([inv.group], anim, 37.6, 40.05), { zone: "stage", from: [0.15, 1.6, 0.55], pull: 1.06 });
  const B2 = CAM.pose(envelope([inv.group], anim, 38.6, 40.05), { zone: "stage", from: [0.25, 1.7, 0.45], pull: 1.0 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[34.6, A0], [35.6, A, 0.95], [37.55, B, 0.75], [40.05, B2, 2.2]])); };
});

// ============================================================ 11 · imagina: a Receita (40.05–46.8)
// "Imagina: você trabalha numa multinacional de remédios, e a Receita pergunta por que vocês compraram
// esses químicos." An office at night; the Receita's letter slides onto your desk, then the invoice.
addScene("receita", 40.05, 46.8, (S) => {
  const office = makeOfficeSet({ ceil: 7.5, wallZ: -3.0, wall: "#4f3b2f", seed: 21 }); S.backdrop(office.group);
  const desk = makeLeatherDesk({ w: 2.9, d: 1.5 }); S.add(desk.group);
  const letter = makeCertificate("RECEITA FEDERAL", { w: 1.0, d: 1.3 }); letter.group.position.set(-0.48, desk.top, 0.05); S.add(letter.group);
  const inv = makeInvoiceSheet({ w: 0.8, d: 1.08, issuer: "EMITENTE: ANIDROL", to: "PARA: MULTINACIONAL" }); inv.group.position.set(0.66, desk.top + 0.002, 0.08); S.add(inv.group);
  const mug = makeMug(); mug.position.set(1.25, desk.top, 0.5); S.add(mug); dressDesk(S, desk.top, { lamp: [-1.2, -0.5], folders: [1.15, -0.45] });
  const anim = (t) => {
    office.update(t); key.intensity = 1.8;
    const kl = eOut(lin(t, 40.3, 40.95)); popIn(letter.group, t, 40.25, 0.3); letter.group.position.x = lerp(-1.0, -0.48, kl); letter.group.rotation.y = 0.35 * (1 - kl) + 0.06;
    const ki = eOut(lin(t, 43.5, 44.1)); popIn(inv.group, t, 43.45, 0.3); inv.group.position.x = lerp(1.05, 0.66, ki); inv.group.rotation.y = 0.5 * (1 - ki) - 0.1;
  };
  S.hero(letter.group, "ofício da receita", { when: (t) => t > 41.9 && t < 43.6 });
  S.hero(inv.group, "nota para multinacional", { when: (t) => t > 44.1 });
  S.solid(desk.group, "mesa");
  const A = envelope([letter.group], anim, 40.95, 43.4), B = envelope([inv.group], anim, 44.1, 46.8);
  const W0 = CAM.pose(envelope([letter.group, desk.group], anim, 40.95, 41.0), { zone: "stage", from: [-0.12, 0.5, 1], pull: 1.02 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[40.05, W0], [41.9, CAM.move(A, "push", lin(t, 41.0, 43.4), { zone: "stage", from: [-0.1, 1.65, 0.55], pull0: 1.15 }), 1.6], [44.05, CAM.move(B, "truck", lin(t, 44.0, 46.8), { zone: "stage", from: [0.1, 1.7, 0.5], side: 0.08, pull: 1.02 }), 0.75]])); };
});

// ============================================================ 12 · nunca compraram (46.8–48.33)
// "Vocês nunca compraram." A stamp slams NUNCA COMPRAMOS on the invoice.
addScene("nunca", 46.8, 48.33, (S) => {
  const office = makeOfficeSet({ ceil: 7.5, wallZ: -3.0, wall: "#4f3b2f", seed: 21 }); S.backdrop(office.group);
  const desk = makeLeatherDesk({ w: 2.9, d: 1.5 }); S.add(desk.group);
  const inv = makeInvoiceSheet({ w: 0.8, d: 1.08, issuer: "EMITENTE: ANIDROL", to: "PARA: MULTINACIONAL" }); inv.group.position.set(0.1, desk.top + 0.002, 0.08); inv.group.rotation.y = -0.1; S.add(inv.group);
  const ink = makeInkMark("NUNCA\nCOMPRAMOS", 0.62, 0.36, { ink: "#c8231a", seed: 4 }); ink.rotation.x = -Math.PI / 2; ink.position.set(0, inv.top + 0.004, 0.27); ink.rotation.z = 0.12; inv.group.add(ink);
  const stamp = makeStamp({ w: 0.56, d: 0.3 }); S.add(stamp); dressDesk(S, desk.top, { lamp: [-1.2, -0.5], folders: [1.15, -0.45] });
  const anim = (t) => {
    office.update(t); office.windows(1 - 0.4 * beat(t, 47.12, 0.5)); key.intensity = 1.9;
    const press = t < 47.05 ? 0 : t < 47.15 ? lin(t, 47.05, 47.15) : 1 - sm(t, 47.25, 47.6);
    stamp.position.set(0.1 + Math.sin(-0.1) * 0.27, desk.top + inv.top + 0.004 + 0.55 * (1 - press) + 0.3 * (1 - lin(t, 46.8, 47.05)), 0.08 + 0.27); stamp.rotation.y = -0.1 + 0.12;
    stamp.visible = t < 47.6; ink.visible = t > 47.14;
  };
  S.hero(inv.group, "nota carimbada");
  S.solid(desk.group, "mesa");
  const box = envelope([inv.group], anim, 46.8, 48.33);
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.move(box, "push", lin(t, 46.8, 48.33), { zone: "stage", from: [0.05, 1.6, 0.55], pull0: 1.1, pull: 1.0 }), t, 47.15, 0.06, 0.35)); };
});

// ============================================================ 13 · notas de fachada (48.33–53.02)
// "Pra acusação, as notas eram de fachada: o produto ia pro tráfico." At a fork at night the sign points
// left to FARMACÊUTICA; the truck takes the dark road on the right.
addScene("fachada", 48.33, 53.02, (S) => {
  const road = makeNightRoad({ fork: true }); S.backdrop(road.group);
  const sign = makeRoadSign("← FARMACÊUTICA", { w: 4.8, h: 1.3, y: 3.1 }); sign.position.set(-2.6, 0, -1.4); sign.rotation.y = 0.12; S.add(sign);
  const tr = makeLoadedTruck(); S.add(tr.group);
  const P0 = new V3(1.25, 0, 2.5), P1 = new V3(1.25, 0, -6.5), P2 = new V3(5.2, 0, -14.6);
  const at = (k) => { const a = P0.clone().lerp(P1, k), b = P1.clone().lerp(P2, k); return { p: a.clone().lerp(b, k), d: b.clone().sub(a).normalize() }; };
  const anim = (t) => {
    road.update(t); key.intensity = 0.9; key.color.set("#9fb2ff"); hemi.intensity = 0.3;
    const k = eInOut(lin(t, 48.33, 53.02)) * 0.92, q = at(k); tr.group.position.copy(q.p); tr.group.rotation.y = Math.atan2(-q.d.z, q.d.x);
  };
  S.hero(tr.group, "caminhão na bifurcação"); S.hero(sign, "placa farmacêutica", { when: (t) => t < 50.9 });
  // the sign leaves the framing smoothly (a blend between the two framings, never a jump)
  return (t) => {
    anim(t); const k = lin(t, 48.33, 53.02), from = [lerp(-0.2, 0.4, k), lerp(0.7, 0.95, k), 1];
    const A = CAM.pose(boxOf([tr.group, sign], true), { zone: "stage", from, pull: 1.06 }), B = CAM.pose(boxOf([tr.group], true), { zone: "stage", from, pull: 1.1 });
    CAM.apply(CAM.blend(A, B, sm(t, 50.9, 52.0)));
  };
});

// ============================================================ 14 · 19 toneladas (53.02–58.75)
// "Pela conta da PF, daria pra fazer mais de dezenove toneladas de cocaína e crack." Pallets of
// wrapped packages pile on a platform scale; the readout climbs to 19.000 kg (an estimate).
addScene("dezenove", 53.02, 58.75, (S) => {
  const hall = chemHall(13); S.backdrop(hall.group);
  const sc = makeFloorScale({ w: 2.6, d: 2.0 }); S.add(sc.group);
  const pals = [[-0.62, -0.45], [0.62, -0.45], [-0.62, 0.5], [0.62, 0.5]].map(([x, z], i) => { const p = makeBrickPallet({ seed: 5 + i }); p.group.position.set(x, sc.deckY, z); S.add(p.group); return p; });
  const anim = (t) => {
    hall.update(t); hall.tint(0.7 * beat(t, 57.2, 1.2), "#ff2a1a"); key.intensity = 2.0;
    const k = lin(t, 53.3, 55.3);
    pals.forEach((p, i) => { const ki = clamp(k * 4 - i); p.group.visible = ki > 0.001; p.set(ki); });
    sc.set(19000 * eOut(k));
  };
  S.hero(sc.group, "balança de piso", { when: (t) => t < 56.4 }); pals.forEach((p, i) => S.hero(p.group, "pallet " + (i + 1), { when: (t) => t > 53.4 + i * 0.5 && t < 56.4 }));
  S.hero(sc.display, "visor 19.000 kg", { when: (t) => t > 56.9 });
  const box = envelope([sc.group, ...pals.map((p) => p.group)], anim, 55.3, 58.75);
  const D = CAM.pose(frameBox(sc.display), { zone: "stage", from: [-0.05, 0.08, 1], pull: 1.1 }), D2 = CAM.pose(frameBox(sc.display), { zone: "stage", from: [0.08, 0.05, 1], pull: 1.03 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[53.02, CAM.move(box, "orbit", lin(t, 53.02, 56.4), { zone: "stage", from: [0.1, 0.55, 1], deg: 40, pull: lerp(1.15, 1.0, eOut(lin(t, 53.02, 56.0))) })], [56.9, D, 0.5], [58.75, D2, 1.8]])); };
});

// ============================================================ 15 · as buscas (58.75–62.95)
// "Em dezembro de 2023, a PF faz buscas na casa dele." The same door, now open; a police car (no crest)
// parked in front, light bar flashing.
addScene("busca", 58.75, 62.95, (S) => {
  const st = makeDawnStreet(); S.backdrop(st.group);
  const door = makeHouseDoor({ wallW: 1.3, wallH: 2.45 }); door.open(1); S.add(door.group);
  const car = makePoliceCar(); car.group.traverse((m) => { if (m.userData.plate) m.userData.plate.detail = true; }); car.group.position.set(2.6, 0, 5.4); car.group.rotation.y = 0.08; S.add(car.group);
  const anim = (t) => { st.siren(1); st.update(t); car.flash(t); key.intensity = 1.5; key.color.set("#ffc9a0"); hemi.intensity = 0.38; hemi.color.set("#9fb2ff"); };
  S.hero(door.group, "porta aberta"); S.hero(car.group, "viatura da pf");
  const box = envelope([door.group, car.group], anim, 58.75, 62.95);
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[58.75, CAM.pose(envelope([car.group], anim, 58.75, 59.6), { zone: "stage", from: [0.35, 0.2, 1], pull: 1.02 })], [61.0, CAM.move(box, "truck", lin(t, 59.6, 62.95), { zone: "stage", from: [0.15, 0.22, 1], side: 0.25, pull: 1.03 }), 1.4]])); };
});

// ============================================================ courtroom shots
// The bench top in the courtroom, as a desk in front of the camera (the court set stays behind).
function benchDesk(S, w = 2.4, dd = 1.6) { const d = makeLeatherDesk({ w, d: dd }); S.add(d.group); S.solid(d.group, "mesa do juiz"); return d; }

// ============================================================ 16 · prisão negada (62.95–65.7)
// "A prisão é pedida, e a Justiça nega." The request on the judge's desk; the gavel comes down and
// NEGADO is stamped across it.
addScene("negada", 62.95, 65.7, (S) => {
  const court = makeCourtroomSet({ seed: 6 }); S.backdrop(court.group);
  const desk = benchDesk(S, 2.6, 2.3); dressDesk(S, desk.top, { lamp: [-1.05, -0.85], folders: null, books: [[0.95, -0.75, "CÓDIGO PENAL", "#5a1515"]] });
  const req = makeCertificate("PEDIDO DE PRISÃO", { w: 1.3, d: 1.5, seal: false }); req.group.position.set(-0.05, desk.top, 0.38); req.group.rotation.y = 0.06; S.add(req.group);
  const ink = makeInkMark("NEGADO", 0.8, 0.3, { ink: "#c8231a", seed: 9 }); ink.rotation.x = -Math.PI / 2; ink.rotation.z = 0.1; ink.position.set(0, req.top + 0.004, 0.12); req.group.add(ink);
  const gv = makeJudgeGavel(); gv.group.position.set(-0.2, desk.top, -0.72); gv.group.rotation.y = 0.0; S.add(gv.group);
  const anim = (t) => {
    court.lights(0.9); court.update(t); key.intensity = 1.9;
    const s = t < 64.3 ? 1 - sm(t, 63.2, 63.8) : t < 64.92 ? sm(t, 64.6, 64.92) : 1; gv.strike(s);
    ink.visible = t > 64.95;
  };
  S.hero(req.group, "pedido de prisão", { when: (t) => t > 63.9 }); S.hero(gv.group, "martelo do juiz", { when: (t) => t > 63.9 });
  const box = envelope([req.group, gv.group], anim, 62.95, 65.7);
  const W0 = CAM.pose(box, { zone: "stage", from: [-0.08, 0.55, 1], pull: 1.05 });
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.track(t, [[62.95, W0], [63.9, CAM.move(box, "push", lin(t, 63.4, 65.7), { zone: "stage", from: [-0.05, 1.5, 0.75], pull0: 1.05 }), 0.95]]), t, 64.92, 0.05, 0.3)); };
});

// ============================================================ 17 · vira réu (65.7–68.08)
// "Dois meses depois, ele vira réu." The athlete on the plinth in the courtroom; the plate turns over
// from SÓCIO to RÉU.
function athleteOnPlinth(S, flip = ["SÓCIO", "RÉU"]) {
  const pl = makeNamePlinth("RENATO CARIANI", flip); S.add(pl.group);
  const fig = makeAthleteFigure(); fig.group.position.y = pl.top; S.add(fig.group);
  S.solid(pl.group, "pedestal"); return { pl, fig };
}
addScene("reu", 65.7, 68.08, (S) => {
  const court = makeCourtroomSet({ seed: 7 }); S.backdrop(court.group);
  const { pl, fig } = athleteOnPlinth(S);
  const anim = (t) => { court.lights(0.7); court.update(t); key.intensity = 1.9; fig.setPose({ look: 0.12 * sm(t, 67.2, 67.8), turn: -0.1 }); pl.flip(lin(t, 65.9, 66.4)); };
  S.hero(fig.group, "atleta 3d"); S.hero(pl.group, "pedestal sócio réu");
  const box = envelope([fig.group, pl.group], anim, 65.7, 68.08);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, 65.7, 68.08), { zone: "stage", from: [0.25, 0.25, 1], rise: 0.4, pull: 1.04 })); };
});

// ============================================================ 18 · a pena pedida (68.08–75.28)
// "Em outubro, o Ministério Público pediu a condenação: as penas somadas vão de dezesseis a cinquenta e
// um anos." A column of years rises next to the athlete: 16, then 51.
addScene("pena", 68.08, 75.28, (S) => {
  const court = makeCourtroomSet({ seed: 8 }); S.backdrop(court.group);
  const { pl, fig } = athleteOnPlinth(S, ["RÉU", "RÉU"]); pl.group.position.x = -0.55; fig.group.position.x = -0.55;
  const col = makeHourColumn({ hours: 1, unit: 0.05, w: 0.7, color: RED }); col.group.position.set(0.6, 0, -1.08); S.add(col.group);
  const anim = (t) => {
    court.lights(0.7); court.update(t); key.intensity = 1.9; fig.setPose({ look: 0.1, turn: 0.2 });
    const v = t < 71.4 ? 1 : t < 73.5 ? lerp(1, 16, eOut(lin(t, 71.5, 72.8))) : lerp(16, 51, eOut(lin(t, 73.6, 74.9)));
    col.group.visible = t > 71.35; col.setHours(v, String(Math.round(v)));
  };
  S.hero(fig.group, "atleta 3d"); S.hero(pl.group, "pedestal"); S.hero(col.group, "coluna de anos", { when: (t) => t > 72.0 });
  S.solid(col.group, "coluna");
  const box = envelope([fig.group, pl.group, col.group], anim, 68.08, 75.28);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, 68.08, 75.28), { zone: "stage", from: [0.15, 0.2, 1], rise: 0.3, pull: 1.03 })); };
});

// ============================================================ 19 · a sócia (75.28–81.56)
// "Só que tem um detalhe: pra sócia dele, o MP pediu absolvição. Não viu prova de que ela sabia." A
// second, generic figure on a plinth beside him; her plate turns over to ABSOLVIÇÃO PEDIDA (green).
addScene("socia", 75.28, 81.56, (S) => {
  const court = makeCourtroomSet({ seed: 9 }); S.backdrop(court.group);
  const { pl, fig } = athleteOnPlinth(S, ["RÉU", "RÉU"]); pl.group.position.x = -0.95; fig.group.position.x = -0.95;
  const pl2 = makeNamePlinth("SÓCIA", ["RÉ", "ABSOLVIÇÃO\nPEDIDA"], { flipBg: ["#2a2522", "#1f6b3a"] }); pl2.group.position.x = 0.95; S.add(pl2.group); S.solid(pl2.group, "pedestal 2");
  const she = makeDiner({ suit: "#5a2f45", shirt: "#f2ece4", tie: null, hair: "#4a2a1a", longHair: true, skirt: "#5a2f45" }); she.group.position.set(0.95, pl2.top, 0); S.add(she.group);
  const glow = makeFloorGlow(1.8, 1.4, { color: "#2fae66", opacity: 0 }); glow.position.set(0.95, 0.012, 0.6); S.add(glow);
  const anim = (t) => {
    court.lights(0.7); court.update(t); key.intensity = 1.9; fig.setPose({ look: 0.1, turn: 0.25 }); she.setPose({ turn: -0.25 });
    fig.group.visible = pl.group.visible = t < 79.0;
    pl2.flip(lin(t, 79.3, 79.8)); glow.material.opacity = 0.35 * sm(t, 79.2, 79.8);
  };
  S.hero(fig.group, "atleta 3d", { when: (t) => t < 79.0 }); S.hero(pl.group, "pedestal dele", { when: (t) => t < 79.0 }); S.hero(she.group, "sócia"); S.hero(pl2.group, "pedestal da sócia");
  const both = envelope([fig.group, pl.group, she.group, pl2.group], anim, 75.28, 81.56), her = envelope([she.group, pl2.group], anim, 79.0, 81.56);
  return (t) => { anim(t); CAM.apply(t < 79.0 ? CAM.move(both, "truck", lin(t, 75.28, 79.0), { zone: "stage", from: [0, 0.22, 1], side: 0.25, pull: 1.03 }) : CAM.move(her, "push", lin(t, 79.0, 81.56), { zone: "stage", from: [0.2, 0.2, 1], pull0: 1.04 })); };
});

// ============================================================ 20 · a defesa (81.56–87.95)
// "Cariani diz que é inocente: que a empresa foi vítima de fraude, e que ele só responde porque é dono."
// Back in the gym: the phone on its tripod plays his video ("foi vítima de fraude"); the athlete beside.
addScene("defesa", 81.56, 87.95, (S) => {
  const gym = makeGymSet({ seed: 14 }); S.backdrop(gym.group);
  const pl = makeNamePlinth("RENATO CARIANI", ["DEFESA", "RESPONDE EM\nLIBERDADE"], { h: 0.68, flipBg: ["#2a2522", "#1f4a6b"] }); S.add(pl.group);
  const fig = makeAthleteFigure(); fig.group.position.y = pl.top; S.add(fig.group);
  const tp = makeTripodPhone(); tp.group.position.set(0, 0, 1.0); S.add(tp.group);
  let painted = -1;
  const anim = (t) => {
    gym.update(t); key.intensity = 2.0; key.color.set("#fff0e0"); hemi.intensity = 0.42;
    const B = t >= 85.4; tp.group.visible = !B; fig.group.visible = pl.group.visible = B;
    fig.setPose({ turn: 0.2 + 0.05 * Math.sin(t), look: -0.05 }); pl.flip(lin(t, 85.7, 86.2));
    const fr = Math.floor(t * 12); if (fr !== painted) { painted = fr; tp.paint((x) => paintProfile(x, "video", lin(t, 81.56, 85.4))); }
  };
  S.hero(tp.phone.group, "celular com vídeo", { when: (t) => t < 85.4 });
  S.hero(fig.group, "atleta 3d", { when: (t) => t >= 85.4 }); S.hero(pl.group, "pedestal defesa", { when: (t) => t >= 85.4 });
  const A = envelope([tp.phone.group], anim, 81.56, 85.4), B = envelope([fig.group, pl.group], anim, 85.4, 87.95);
  return (t) => {
    anim(t);
    if (t < 85.4) CAM.apply(CAM.move(A, "truck", lin(t, 81.56, 85.4), { zone: "stage", from: [0, 0.05, 1], side: 0.22, pull: 1.12 }));
    else CAM.apply(CAM.move(B, "drop", lin(t, 85.4, 87.95), { zone: "stage", from: [-0.15, 0.15, 1], rise: 0.3, pull: 1.0 }));
  };
});

// ============================================================ 21 · ainda sem sentença (87.95–89.55)
// "Ainda não há sentença." The gavel at rest on its block, an hourglass draining beside it.
addScene("sentenca", 87.95, 89.55, (S) => {
  const court = makeCourtroomSet({ seed: 10 }); S.backdrop(court.group);
  const desk = benchDesk(S); dressDesk(S, desk.top, { lamp: [-0.95, -0.55], folders: null, books: [[0.85, -0.5, "CÓDIGO PENAL", "#5a1515"]] });
  const gv = makeJudgeGavel(); gv.group.position.set(-0.35, desk.top, 0.1); gv.group.rotation.y = 0.4; S.add(gv.group);
  const hg = makeHourglass({ h: 0.62 }); hg.group.position.set(0.45, desk.top, 0.05); S.add(hg.group);
  const anim = (t) => { court.lights(0.8); court.update(t); key.intensity = 1.9; hg.set(0.35 + 0.3 * lin(t, 87.95, 89.55)); };
  S.hero(gv.group, "martelo parado"); S.hero(hg.group, "ampulheta");
  const box = envelope([gv.group, hg.group], anim, 87.95, 89.55);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, 87.95, 89.55), { zone: "stage", from: [0.1, 0.55, 1], pull0: 1.2 })); };
});

// ============================================================ 22 · e se fosse a sua (89.55–91.25)
// "E se a empresa fosse sua?" An office door with frosted glass, SUA EMPRESA on it; behind the glass a
// shadow is stamping papers.
addScene("sua", 89.55, 91.25, (S) => {
  const office = makeOfficeSet({ ceil: 7.0, wallZ: -2.0, wall: "#4a3a30", seed: 23 }); S.backdrop(office.group);
  const door = makeFrostDoor("SUA EMPRESA"); S.add(door.group); S.backdrop(door.walls);
  const deco = new THREE.Group(), glowM = new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false });
  for (const sx of [-1, 1]) { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.22, 20), glowM); sc.position.set(sx * 1.0, 1.95, 0.08); deco.add(sc); const sh = makeLightShaft([sx * 1.0, 2.05, 0.1], [sx * 1.0, 2.9, 0.1], { w0: 0.15, w1: 0.6, color: "#ffd9a0", opacity: 0.18 }); deco.add(sh.group); }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 24), pmat("#2a2522", { roughness: 0.5 })); pot.position.set(1.35, 0.2, 0.3); deco.add(pot);
  for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), pmat("#2f5a35", { roughness: 0.7 })); lf.scale.set(0.5, 1.6, 0.25); lf.position.set(1.35 + Math.sin(i * 1.7) * 0.12, 0.62 + (i % 3) * 0.12, 0.3 + Math.cos(i * 1.7) * 0.1); lf.rotation.z = Math.sin(i * 2.3) * 0.5; deco.add(lf); }
  asBackdrop(deco); S.backdrop(deco);
  const shadow = makeDiner({ suit: "#0a0a0a", shirt: "#0a0a0a", tie: "#0a0a0a", skin: "#0a0a0a", hair: "#0a0a0a" }); shadow.group.position.set(0.05, 0, -0.7); S.add(shadow.group);
  const anim = (t) => { office.update(t); key.intensity = 1.7; shadow.setPose({ reach: 0.5 + 0.5 * Math.abs(Math.sin((t - 89.55) * 5)), lean: 0.15 }); };
  S.hero(door.group, "porta sua empresa");
  const box = new THREE.Box3(new V3(-0.62, 0, -0.05), new V3(0.62, 2.24, 0.12));
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, 89.55, 91.25), { zone: "stage", from: [0.1, 0.1, 1], rise: 0.25, pull: 1.04 })); };
});

// ============================================================ 23 · a pergunta (91.25–97.9)
// "Dono de empresa responde por tudo o que acontece nela, ou só pelo que sabia?" The scales from the
// teaser, now uncovered: TUDO on the left pan, SÓ O QUE SABIA on the right, rocking without a verdict.
addScene("pergunta", 91.25, 97.9, (S) => {
  const court = makeCourtroomSet({ seed: 5 }); S.backdrop(court.group);
  const { sc } = scaleRig(S);
  const a = makeHangBoard("TUDO", { w: 0.8, h: 0.34, fg: "#ff8a3c" }); sc.fronts[0].add(a);
  const b = makeHangBoard("SÓ O QUE\nSABIA", { w: 0.9, h: 0.46 }); sc.fronts[1].add(b);
  const shaft = makeLightShaft([0, 7.4, 0.2], [0, 0.02, 0.4], { w0: 0.6, w1: 3.2, color: "#ffe2b0", opacity: 0.14 }); asBackdrop(shaft.group); S.backdrop(shaft.group);
  const anim = (t) => { court.lights(0.7); court.update(t); shaft.set(1); key.intensity = 1.8; sc.setTilt(0.14 * Math.sin((t - 91.25) * 1.9) * (1 - 0.3 * lin(t, 91.25, 97.9))); popIn(a, t, 91.35, 0.4); popIn(b, t, 91.6, 0.4); };
  S.hero(sc.group, "balança tudo ou só o que sabia");
  const box = envelope([sc.group], anim, 91.25, 97.9);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, 91.25, 97.9), { zone: "stage", from: [0, 0.22, 1], deg: 30, pull: lerp(1.08, 1.0, eOut(lin(t, 91.25, 97.9))) })); };
});
