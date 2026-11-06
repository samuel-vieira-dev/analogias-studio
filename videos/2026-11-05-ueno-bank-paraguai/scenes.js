// ============================================================================
// videos/2026-11-05-ueno-bank-paraguai/scenes.js
// A quebra do ueno bank no Paraguai (intervenção do Banco Central em 03/11/2026): quase 3 milhões de
// clientes ficaram sem saldo e sem cartão; o capital estava abaixo da metade do mínimo legal depois de
// empréstimos às empresas dos próprios donos; mais de US$ 800 mi públicos lá dentro; Peña foi sócio do
// grupo dono até 2025 e nomeou para o BC o ex-presidente da financeira; 8 executivos presos; Peña anunciou
// a renúncia e a Câmara abriu o impeachment (78 a 0) por causa do senador vitalício; garantia de ~US$ 38 mil.
// Analogia única: o banco é um prédio sobre colunas. Andares = dinheiro dos clientes; colunas = capital dos
// donos que a lei obriga a ter; o fiscal bate e as colunas estão ocas; o Banco Central interdita o prédio.
// Times come from audio/words.json (A below).
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops (the
// city at night, the bedroom, the bakery, the office) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  quase: 0.0, metade: 0.42, paraguai: 1.24, cliente: 1.96, banco: 2.58, quebrar: 3.64, c1: 4.55,
  imagina: 4.76, terca: 5.2, madrugada: 5.78, voce: 6.62, abre: 6.92, app: 7.26, saldo: 8.52, aparece: 9.1, c2: 9.72,
  cartao: 9.98, passa: 10.48, c3: 11.0,
  bug: 11.54, bc: 12.18, assumiu: 12.94, ueno: 14.68, c4: 15.05,
  porque: 15.66, pensa: 16.1, predio: 16.66, andares: 17.34, dinheiro: 18.1, clientes: 18.68, colunas: 19.7, donos: 20.72, lei: 21.38, c5: 22.35,
  prejuizo: 22.98, colunas2: 23.92, aguentam: 24.28, c6: 24.88,
  fiscal: 25.42, bateu: 25.66, ocas: 27.56, menos: 28.46, metade2: 29.06, minimo: 29.7, c7: 30.2,
  concreto: 30.46, emprestimo: 31.3, empresas: 32.22, donos2: 32.86, acima: 33.62, limite: 34.08, sem: 34.84, garantia: 35.08, c8: 36.4,
  interditou: 37.24, predio2: 38.3, todo: 39.72, dentro: 40.24, c9: 40.9,
  publico: 41.6, oitocentos: 42.8, dolares: 44.28, inclusive: 44.98, aposentadoria: 45.58, c10: 46.45,
  presidente: 46.86, pena: 47.8, socio: 48.5, grupo: 49.06, ate: 50.14, c11: 51.7,
  chefe: 52.12, nomeado: 53.42, presidido: 54.62, financeira: 55.56, ueno2: 56.76, bc3: 57.24, afastava: 58.68, casos: 59.46, c12: 60.1,
  oito: 60.26, presos: 61.48, c12b: 62.2, assuncao: 62.26, protesto: 63.2, c13: 64.0,
  quinta: 64.42, renuncia: 65.98, minutos: 66.66, deputados: 67.86, abriram: 68.42, impeachment: 69.1, setenta: 70.08, zero: 71.0, c14: 71.4,
  ex: 71.76, senador: 72.9, vitalicio: 73.32, foro: 74.38, condenado: 75.32, agora: 76.12, senado: 77.2, c15: 77.75,
  imagina2: 78.14, cinquenta: 79.06, fundo: 80.8, devolve: 81.74, trinta: 82.74, resto: 83.86, sobrar: 85.06, c16: 85.65,
  culpa: 86.86, donos3: 87.72, esvaziaram: 88.24, ou: 89.2, bc4: 89.86, fiscalizar: 90.94, end: 93.6,
};

// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...] (same as
// the dollar video): each framing runs its own move; the camera eases into the next over `ease` s.
function shotTrack(t, segs, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : t0 + 4;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
const inside = (t, a, b) => t >= a && t < b;
// Puts an object so that its lowest point sits at y (world units of its parent).
function seatOn(obj, y) { obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj); obj.position.y += y - b.min.y; }

// ---------------------------------------------------------------- looks (lights and fog per place)
function cityLook(city, t, { lights = 1, siren = 0 } = {}) {
  city.update(t); scene.fog.color.set("#0b0d14");
  key.intensity = 1.7; key.color.set("#ffd6ae"); hemi.intensity = 0.36; hemi.color.set("#a9bde0"); hemi.groundColor.set("#120c08");
  rim.intensity = 1.3 + 0.8 * siren; rim.color.set(siren > 0 && Math.floor(t * 3) % 2 ? "#ff3b3b" : "#7fa2ff");
  void lights;
}
function officeLook(off, t, lights = 0.35) {
  off.update(t); off.lights(lights); scene.fog.color.set("#0c0a0a");
  key.intensity = 1.35; key.color.set("#ffd9b0"); hemi.intensity = 0.32; hemi.color.set("#ffd9b8"); rim.intensity = 1.1; rim.color.set("#86a8ff");
}
// The dark office with a window onto the city right behind the subject. API { off, win }
function officeBack(S, seed, wallZ = -2.2) {
  const off = makeOfficeSet({ wallZ, clear: 1.2, seed }); S.backdrop(off.group);
  const win = makeSetWindow(2.4, 1.6, { seed: seed + 2, open: 0.2 }); win.group.position.set(0, 1.9, wallZ + 0.15); S.backdrop(win.group);
  return { off, win };
}
// The city at night behind the analogy's bank: towers with lit windows, warm and cold bokeh, a moon.
// API { group, update(t), dim(k) }
function cityBack(S, seed) {
  const sky = makeSkyline({ z: -9.5, seed, spread: 30, hMin: 4.5, hMax: 11 }); S.backdrop(sky.group);
  const mid = makeSkyline({ z: -4.4, n: 12, seed: seed + 5, spread: 15, hMin: 1.6, hMax: 3.6 }); S.backdrop(mid.group);
  const bk = makeBokeh({ n: 46, center: [0, 3.2, -5], spread: [16, 6, 3], size: [0.2, 0.7], colors: ["#ffcf8a", "#9fc3ff", "#ff9a4a", "#fff2dc"], opacity: 0.4, seed: seed + 3 }); S.backdrop(bk.group);
  const moon = sprite(BOKEH, 1.4); moon.material.color.set("#dfe8ff"); moon.material.blending = THREE.AdditiveBlending; moon.material.opacity = 0.75; moon.position.set(2.6, 8.5, -12); asBackdrop(moon); S.backdrop(moon);
  // the street in front of the bank: a curb, wet asphalt with a dashed lane line, and the sodium lamps' pools
  const g = new THREE.Group(); S.backdrop(g);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), pmat("#ffffff", { map: tileTex(asphaltTex(), 16, 2), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.4 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.003, 5.1); g.add(road);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(40, 0.1, 0.18), pmat("#8a857d", { roughness: 0.7 })); curb.position.set(0, 0.05, 2.6); g.add(curb);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(40, 3.6), pmat("#ffffff", { map: tileTex(cachedTex("sidewalk", () => noiseTex({ base: "#55504a", amount: 0.1, size: 2, seed: 81 })), 12, 1), roughness: 0.6 })); side.rotation.x = -Math.PI / 2; side.position.set(0, 0.002, 0.8); g.add(side);
  const dashM = new THREE.MeshBasicMaterial({ color: "#d9d2c2" });
  for (let i = -12; i <= 12; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.08), dashM); d.rotation.x = -Math.PI / 2; d.position.set(i * 1.6, 0.005, 5.0); g.add(d); }
  const poleM = pmat("#2b2e33", { metalness: 0.7, roughness: 0.4 }), headM = new THREE.MeshBasicMaterial({ color: "#ffc276", toneMapped: false });
  for (const [x, z] of [[-3.9, 2.35], [3.9, 2.35], [-2.9, -1.6], [2.9, -1.6]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 3.2, 12), poleM); pole.position.set(x, 1.6, z); g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), poleM); arm.position.set(x - Math.sign(x) * 0.25, 3.18, z); g.add(arm);
    const head = new THREE.Mesh(rbox(0.3, 0.06, 0.14, 0.02), headM); head.position.set(x - Math.sign(x) * 0.48, 3.14, z); g.add(head);
    const halo = sprite(BOKEH, 1.1); halo.material.color.set("#ffb45c"); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0.55; halo.position.set(x - Math.sign(x) * 0.48, 3.1, z + 0.05); g.add(halo);
    const pool = makeFloorGlow(2.6, 2.2, { color: "#ffb45c", opacity: 0.22 }); pool.position.set(x - Math.sign(x) * 0.48, 0.01, z + 0.2); g.add(pool);
  }
  const lamp = new THREE.PointLight("#ffb45c", 3.5, 7, 1.6); lamp.position.set(-2.0, 2.9, 2.4); g.add(lamp);
  const lamp2 = new THREE.PointLight("#ffb45c", 3.5, 7, 1.6); lamp2.position.set(2.0, 2.9, 2.4); g.add(lamp2);
  const motes = makeSetMotes(70, [[-3, 0.2, -1], [3, 3.2, 3]], { color: "#ffe2c0", seed: seed + 8, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  return { update: (t) => { sky.update(t); mid.update(t); bk.update(t); motes.update(t); } };
}

// ---------------------------------------------------------------- the analogy: the bank as a building
// Glass office tower on four concrete stilts. The stilts are the owners' capital: each is a concrete
// shell around a concrete core; the front shell can crack and break off, showing the core reaches only
// part of the way (hollow above). Floors hold the clients' money (cash piles and coin columns).
// Origin: floor centre of the plaza; front +z. API {
//   group, body (floors, glass, roof), cols[4], front (group of the two front stilts), plaza,
//   open(k) (the front glass slides up and fades: the cutaway), lights(k), floorY(i) (top of floor i),
//   top (roof surface y), colTop, sign (the BANCO plate), money (group of the floors' contents) }
// cols[i] API { group, setFill(f), crack(k), breakOff(k), glow(k), x, z }
const SB = { W: 1.6, D: 1.0, PW: 2.7, PD: 3.4, PZ: 0.55, PH: 0.08, CH: 0.95, CS: 0.26, CX: 0.6, CZ: 0.32, TS: 0.09, FH: 0.44, NF: 4, T: 0.035 };
function crackTex() {
  return cachedTex("stilt-crack2", () => {
    const c = makeCanvas(256, 1024), x = c.getContext("2d"), r = mulberry32(17);
    x.clearRect(0, 0, 256, 1024); x.lineCap = "round"; x.lineJoin = "round";
    const paths = [];
    const branch = (px, py, a, len, w) => {
      if (len < 24 || w < 1.2) return;
      const pts = [[px, py]]; let qx = px, qy = py;
      for (let i = 0; i < 6; i++) { qx += Math.cos(a) * len / 6 + (r() - 0.5) * 16; qy += Math.sin(a) * len / 6 + (r() - 0.5) * 10; pts.push([qx, qy]); }
      paths.push({ pts, w }); branch(qx, qy, a + (r() - 0.5) * 1.1, len * 0.68, w * 0.72); if (r() < 0.55) branch(qx, qy, a + (r() < 0.5 ? -1 : 1) * (0.6 + r() * 0.6), len * 0.5, w * 0.6);
    };
    branch(128, 480, -Math.PI / 2, 400, 16); branch(128, 480, Math.PI / 2, 440, 16);
    for (let i = 0; i < 3; i++) branch(128 + (r() - 0.5) * 30, 380 + i * 90, (i % 2 ? 1 : -1) * (0.5 + r() * 0.6) + (i % 2 ? 0 : Math.PI), 200, 10);
    const stroke = (dx, dy, col, k) => { x.strokeStyle = col; for (const p of paths) { x.lineWidth = p.w * k; x.beginPath(); p.pts.forEach(([a, b], i) => (i ? x.lineTo(a + dx, b + dy) : x.moveTo(a + dx, b + dy))); x.stroke(); } };
    stroke(0, 0, "rgba(120,112,100,0.9)", 2.2);    // chipped edge, lighter than the wall
    stroke(2, 2, "rgba(25,20,16,0.95)", 1.0);      // the dark gap
    return texFrom(c);
  });
}
function concreteMat(seed = 3, base = "#8b8780") { return pmat("#ffffff", { map: tileTex(cachedTex("stilt-conc-" + base, () => plasterTex(base)), 0.6, 1.2), roughness: 0.88 }); }
function makeStilt(seed) {
  const { CH, CS, T } = SB, g = new THREE.Group(), h = CH - 0.1;
  const cap = pmat("#ffffff", { map: tileTex(cachedTex("stilt-cap", () => plasterTex("#77736c")), 0.5, 0.5), roughness: 0.85 });
  for (const y of [0.025, CH - 0.025]) { const m = new THREE.Mesh(rbox(CS + 0.06, 0.05, CS + 0.06, 0.012), cap); m.position.y = y; g.add(m); }
  const shell = concreteMat(seed), emis = [];
  shell.emissive = new THREE.Color("#ff7a2a"); shell.emissiveIntensity = 0; emis.push(shell);
  const back = new THREE.Mesh(new THREE.BoxGeometry(CS, h, T), shell); back.position.set(0, CH / 2, -CS / 2 + T / 2); g.add(back);
  for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(T, h, CS - 2 * T), shell); sd.position.set(s * (CS / 2 - T / 2), CH / 2, 0); g.add(sd); }
  // the dark inside of the shell (seen once the front breaks off)
  const liner = new THREE.Mesh(new THREE.BoxGeometry(CS - 2 * T - 0.002, h - 0.002, CS - 2 * T - 0.002), mat("#17120f", { roughness: 1, side: THREE.BackSide })); liner.position.y = CH / 2; liner.userData.noShadow = true; g.add(liner);
  const core = new THREE.Mesh(new THREE.BoxGeometry(CS - 2 * T - 0.008, 1, CS - 2 * T - 0.008), pmat("#ffffff", { map: tileTex(cachedTex("stilt-core", () => plasterTex("#a19a8e")), 0.4, 0.8), roughness: 0.9 })); g.add(core);
  // rebar standing out of the concrete in the corners (a broken column, not an empty frame)
  const rebarM = pmat("#6b3f24", { metalness: 0.6, roughness: 0.6 }), rebars = [];
  for (const [rx, rz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const rb = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8), rebarM); rb.position.set(rx * (CS / 2 - T - 0.022), 0, rz * (CS / 2 - T - 0.022)); g.add(rb); rebars.push(rb); }
  const setFill = (f) => {
    const ch = Math.max(0.004, h * clamp(f)); core.scale.y = ch; core.position.y = 0.05 + ch / 2;
    const rh = h - ch - 0.02; rebars.forEach((rb, i) => { const l = Math.max(0.001, rh * (0.55 + 0.12 * i)); rb.scale.y = l; rb.position.y = 0.05 + ch + l / 2; rb.visible = rh > 0.05; });
  };
  setFill(1);
  // front shell: its own (fading) material, the crack drawn on it, and the chunks it breaks into
  const fm = concreteMat(seed); fm.transparent = true; fm.emissive = new THREE.Color("#ff7a2a"); fm.emissiveIntensity = 0; emis.push(fm);
  const front = new THREE.Group(); front.position.set(0, 0.05, CS / 2); g.add(front);
  const fw = new THREE.Mesh(new THREE.BoxGeometry(CS, h, T), fm); fw.position.set(0, h / 2, -T / 2); front.add(fw);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(CS * 0.96, h * 0.96), new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); decal.position.set(0, h / 2, 0.0015); decal.userData.noShadow = true; front.add(decal);
  const r = mulberry32(seed + 11), chunks = [];
  for (let i = 0; i < 7; i++) {
    const s = 0.035 + r() * 0.035, m = new THREE.Mesh(rbox(s, s * (0.6 + r() * 0.5), s * (0.8 + r() * 0.4), 0.006), concreteMat(seed)); m.visible = false; g.add(m);
    chunks.push({ m, s, x0: (r() - 0.5) * CS * 0.8, y0: 0.15 + r() * (h - 0.2), x1: (r() - 0.5) * CS * 1.6, z1: CS / 2 + 0.08 + r() * 0.32, spin: (r() - 0.5) * 6, d: 0.32 + r() * 0.25 });
  }
  const crack = (k) => { decal.material.opacity = clamp(k); };
  const breakOff = (k) => {
    k = clamp(k); const a = eOut(k);
    front.rotation.x = 0.5 * a; front.position.z = CS / 2 + 0.05 * a; fm.opacity = 1 - sm(k, 0.15, 0.7); fw.visible = fm.opacity > 0.01; decal.visible = fw.visible;
    fm.depthWrite = fm.opacity > 0.98;
    chunks.forEach((c) => {
      const u = lin(k, 0.05, 0.05 + c.d); c.m.visible = k > 0.05;
      const yRest = c.s * 0.3, y = lerp(c.y0, yRest, u * u);
      c.m.position.set(lerp(c.x0, c.x1, u), y, lerp(CS / 2 + 0.01, c.z1, u)); c.m.rotation.set(c.spin * u, c.spin * 0.6 * u, 0);
    });
  };
  breakOff(0);
  const glow = (k) => { emis.forEach((m) => { m.emissiveIntensity = 0.35 * clamp(k); }); };
  g.add(contactShadow(CS + 0.3, CS + 0.3));
  return { group: g, setFill, crack, breakOff, glow, front, chunks };
}
function makeStiltBank({ seed = 3, signDetail = true } = {}) {
  const { W, D, PW, PD, PZ, PH, CH, CS, CX, CZ, TS, FH, NF } = SB, g = new THREE.Group(), r = mulberry32(seed);
  const stone = pmat("#ffffff", { map: tileTex(cachedTex("stilt-plaza", () => noiseTex({ base: "#4a4640", amount: 0.12, size: 2, seed: 71 })), 3, 3), roughness: 0.55, clearcoat: 0.2 });
  const plaza = new THREE.Mesh(rbox(PW, PH, PD, 0.02), stone); plaza.position.set(0, PH / 2, PZ); g.add(plaza);
  // paving joints
  const jm = new THREE.MeshBasicMaterial({ color: "#2a2724" });
  for (let i = 1; i < 6; i++) { const j = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.04, 0.008), jm); j.rotation.x = -Math.PI / 2; j.position.set(0, PH / 2 + 0.001, -PD / 2 + i * PD / 6); j.userData.noShadow = true; plaza.add(j); }
  const cols = [], front = new THREE.Group(); g.add(front);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const c = makeStilt(seed + cols.length * 5); c.group.position.set(sx * CX, PH, sz * CZ); c.x = sx * CX; c.z = sz * CZ;
    (sz > 0 ? front : g).add(c.group); cols.push(c);
  }
  const body = new THREE.Group(); g.add(body);
  const y1 = PH + CH, y0b = y1 + TS, top = y0b + NF * FH;
  const conc = pmat("#ffffff", { map: tileTex(cachedTex("stilt-slab", () => plasterTex("#6f6b65")), 2, 0.4), roughness: 0.8 });
  const tr = new THREE.Mesh(rbox(W + 0.1, TS, D + 0.1, 0.015), conc); tr.position.y = y1 + TS / 2; body.add(tr);
  const floorM = pmat("#ffffff", { map: tileTex(woodTex({ base: "#4d3424", planks: 6, seed: 4 }), 2, 1), roughness: 0.5 });
  const fl0 = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, D - 0.04), floorM); fl0.rotation.x = -Math.PI / 2; fl0.position.y = y0b + 0.001; body.add(fl0);
  const floorY = (i) => y0b + i * FH;
  for (let i = 1; i < NF; i++) {
    const s = new THREE.Mesh(rbox(W + 0.04, 0.04, D + 0.04, 0.01), conc); s.position.y = floorY(i) - 0.02; body.add(s);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, D - 0.04), floorM); f.rotation.x = -Math.PI / 2; f.position.y = floorY(i) + 0.001; body.add(f);
  }
  const roof = new THREE.Mesh(rbox(W + 0.08, 0.06, D + 0.08, 0.015), conc); roof.position.y = top + 0.03; body.add(roof);
  for (const [w, d, x, z] of [[W + 0.08, 0.04, 0, D / 2 + 0.02], [W + 0.08, 0.04, 0, -D / 2 - 0.02], [0.04, D + 0.08, W / 2 + 0.02, 0], [0.04, D + 0.08, -W / 2 - 0.02, 0]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), conc); p.position.set(x, top + 0.095, z); body.add(p); }
  // ceiling light strips under every floor's ceiling
  const lightM = new THREE.MeshBasicMaterial({ color: "#ffe6c0", toneMapped: false });
  for (let i = 0; i < NF; i++) for (const z of [-0.22, 0.18]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.3, 0.05), lightM); l.rotation.x = Math.PI / 2; l.position.set(0, floorY(i + 1) - 0.045, z); l.userData.noShadow = true; body.add(l); }
  // glass: back and sides, with aluminium mullions
  const gl = glassMat({ color: "#9cc2d6", opacity: 0.28 }), alu = pmat("#3b4046", { metalness: 0.8, roughness: 0.35 });
  const bh = NF * FH;
  const gb = new THREE.Mesh(new THREE.BoxGeometry(W, bh, 0.01), gl); gb.position.set(0, y0b + bh / 2, -D / 2); gb.userData.noShadow = true; body.add(gb);
  for (const s of [-1, 1]) { const gs = new THREE.Mesh(new THREE.BoxGeometry(0.01, bh, D), gl); gs.position.set(s * W / 2, y0b + bh / 2, 0); gs.userData.noShadow = true; body.add(gs); }
  for (let i = 0; i <= 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.025, bh, 0.03), alu); m.position.set(-W / 2 + i * W / 4, y0b + bh / 2, -D / 2 - 0.005); body.add(m); }
  for (const s of [-1, 1]) for (let i = 0; i <= 2; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, bh, 0.025), alu); m.position.set(s * (W / 2 + 0.005), y0b + bh / 2, -D / 2 + i * D / 2); body.add(m); }
  // the front facade (slides up and fades for the cutaway)
  const fgrp = new THREE.Group(); body.add(fgrp); fgrp.userData.decor = true;
  const fgl = glassMat({ color: "#7fa9c4", opacity: 0.42 }), falu = pmat("#3b4046", { metalness: 0.8, roughness: 0.35, transparent: true, opacity: 1 });
  const fpane = new THREE.Mesh(new THREE.BoxGeometry(W, bh, 0.01), fgl); fpane.position.set(0, y0b + bh / 2, D / 2 + 0.02); fpane.userData.noShadow = true; fgrp.add(fpane);
  for (let i = 0; i <= 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.025, bh, 0.03), falu); m.position.set(-W / 2 + i * W / 4, y0b + bh / 2, D / 2 + 0.03); m.userData.noShadow = true; fgrp.add(m); }
  for (let i = 1; i < NF; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, 0.05, 0.03), falu); m.position.set(0, floorY(i), D / 2 + 0.03); m.userData.noShadow = true; fgrp.add(m); }
  // roof sign
  const sign = makePlate("BANCO", 0.62, 0.15, { bg: "#141414", fg: "#d8b25a", detail: signDetail });
  sign.position.set(0, top + 0.13 + 0.075 + 0.04, D / 2 - 0.02); body.add(sign);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.02), alu); post.position.set(s * 0.25, top + 0.13 + 0.02, D / 2 - 0.05); body.add(post); }
  // the clients' money on every floor: piles of cash and columns of coins
  const money = new THREE.Group(); body.add(money);
  for (let i = 0; i < NF; i++) {
    const y = floorY(i) + 0.002, xs = [-0.6, -0.33, -0.06, 0.22, 0.5];
    xs.forEach((x, j) => {
      const z = (j % 2 ? -0.2 : 0.06) + (r() - 0.5) * 0.06;
      if ((i + j) % 3 === 2) { const cc = makeCoinColumn(6 + Math.floor(r() * 8), { r: 0.055, t: 0.018, seed: 30 + i * 7 + j }); cc.set(1); cc.group.position.set(x, y, z); money.add(cc.group); return; }
      const n = 2 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) { const b = makeCashBundle({ w: 0.17, d: 0.078, h: 0.035 }); b.position.set(x + (r() - 0.5) * 0.01, y + k * 0.036, z + (r() - 0.5) * 0.01); b.rotation.y = (r() - 0.5) * 0.12; money.add(b); }
    });
  }
  const light = new THREE.PointLight("#ffd3a0", 2.2, 4.5, 1.4); light.position.set(0, y0b + bh * 0.55, 0.15); body.add(light);
  const open = (k) => {
    k = clamp(k); fgrp.position.y = 0.9 * eOut(k); fgl.opacity = 0.42 * (1 - k); falu.opacity = 1 - k; fgrp.visible = k < 0.995;
  };
  const lights = (k) => { lightM.color.set("#ffe6c0").multiplyScalar(0.15 + 0.85 * clamp(k)); light.intensity = 2.2 * clamp(k); };
  open(0); lights(1);
  asBackdrop(fgrp);
  const shadow = contactShadow(PW + 0.6, PD + 0.6); g.add(shadow);
  return { group: g, shadow, body, cols, front, plaza, open, lights, floorY, top: top + 0.06, colTop: y1, bodyY0: y0b, sign, money, w: W, d: D };
}

// Low plinth with the "CAPITAL DOS DONOS" plate, in front of the stilts. API from makeLabelPlinth.
function capitalPlinth() { const p = makeLabelPlinth("CAPITAL DOS DONOS", { w: 1.0, h: 0.2, d: 0.28, plateH: 0.13 }); p.group.position.set(0, SB.PH, SB.CZ + SB.CS / 2 + 0.45); return p; }

// Clear gauge beside a stilt: an acrylic tube as tall as the stilt, a red band at the top with "MÍNIMO
// DA LEI" (what the law asks), a white mark at half, and the concrete inside that rises to `set(f)`.
// Origin: floor centre. API { group, set(f), mark(k) }
function makeLevelGauge({ h = SB.CH, w = 0.16 } = {}) {
  const g = new THREE.Group(), dark = pmat("#1c1d20", { metalness: 0.5, roughness: 0.35 });
  const base = new THREE.Mesh(rbox(w + 0.08, 0.05, w + 0.08, 0.012), dark); base.position.y = 0.025; g.add(base);
  const tube = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.05, w), glassMat({ opacity: 0.18 })); tube.position.y = 0.05 + (h - 0.05) / 2; tube.userData.noShadow = true; g.add(tube);
  const fillM = pmat("#ffffff", { map: tileTex(cachedTex("stilt-core", () => plasterTex("#a19a8e")), 0.4, 0.8), roughness: 0.9 });
  const fill = new THREE.Mesh(new THREE.BoxGeometry(w - 0.012, 1, w - 0.012), fillM); g.add(fill);
  const capT = new THREE.Mesh(rbox(w + 0.04, 0.03, w + 0.04, 0.008), dark); capT.position.y = h + 0.015; g.add(capT);
  const redM = new THREE.MeshBasicMaterial({ color: "#ff3b2a", toneMapped: false });
  const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.012, w + 0.03), redM); band.position.y = h - 0.02; g.add(band);
  const half = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.008, w + 0.03), new THREE.MeshBasicMaterial({ color: "#f4f1ea", toneMapped: false })); half.position.y = 0.05 + (h - 0.07) / 2; g.add(half);
  const lab = makePlate("MÍNIMO DA LEI", 0.8, 0.17, { bg: RED, fg: "#ffffff" }); lab.position.set(0, h + 0.12, 0); g.add(lab);
  const lh = makePlate("METADE", 0.5, 0.15, { bg: "#141414", fg: "#f4f1ea" }); lh.position.set(-w / 2 - 0.3, 0.05 + (h - 0.07) / 2, 0.0); g.add(lh);
  const brk = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), dark); brk.position.set(-w / 2 - 0.03, 0.05 + (h - 0.07) / 2, 0); g.add(brk);
  g.add(contactShadow(0.5, 0.5));
  const set = (f) => { const fh = Math.max(0.004, (h - 0.07) * clamp(f)); fill.scale.y = fh; fill.position.y = 0.05 + fh / 2; };
  const mark = (k) => { redM.color.set("#ff3b2a").multiplyScalar(0.6 + 0.8 * clamp(k)); lab.scale.setScalar(1 + 0.08 * clamp(k)); };
  set(0); mark(0);
  return { group: g, set, mark, label: lab };
}

// The inspector's arm: a dark sleeve coming in from off frame, the hand, and a hammer. Origin: the hand;
// the handle hangs along -y, the head's striking face points -z at (0, -0.28, -0.075). swing(a): wrist
// angle (0 = striking, -0.8 = raised). API { group, wrist, swing(a) }
function makeInspectorArm({ s = 1.7 } = {}) {
  const g = new THREE.Group(), wrist = new THREE.Group(); wrist.scale.setScalar(s); g.add(wrist);
  const skin = pmat("#c8977a", { roughness: 0.55, sheen: 0.25, sheenColor: new THREE.Color("#ffd2b8") });
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), skin); fist.scale.set(1, 1.15, 0.9); wrist.add(fist);
  for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.03, 6, 10), skin); k.rotation.z = Math.PI / 2; k.position.set(-0.004, 0.022 - i * 0.016, 0.03); wrist.add(k); }
  const wood = pmat("#ffffff", { map: woodTex("#8a5a32"), roughness: 0.55, clearcoat: 0.4 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.34, 14), wood); handle.position.y = -0.13; wrist.add(handle);
  const steel = pmat("#9aa1a8", { metalness: 0.9, roughness: 0.3 });
  const head = new THREE.Mesh(rbox(0.055, 0.055, 0.16, 0.012), steel); head.position.set(0, -0.28, 0); wrist.add(head);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 20), steel); face.rotation.x = Math.PI / 2; face.position.set(0, -0.28, -0.08); wrist.add(face);
  const claw = new THREE.Mesh(rbox(0.04, 0.03, 0.06, 0.008), steel); claw.position.set(0, -0.27, 0.1); claw.rotation.x = 0.4; wrist.add(claw);
  // the forearm in a dark sleeve with a white cuff, from the wrist out of frame (up, right, towards the lens)
  const sleeveM = pmat("#ffffff", { map: tileTex(cachedTex("sleeve-fab", () => fabricTex("#2f3a52")), 1, 2), roughness: 0.85 });
  const p0 = new V3(0.03, 0.06, 0.0).multiplyScalar(s), p1 = new V3(1.3, 1.05, 0.6).multiplyScalar(s);
  const dir = p1.clone().sub(p0).normalize(), len = p0.distanceTo(p1);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.036 * s, 0.05 * s, len, 18), sleeveM); sleeve.position.copy(p0.clone().add(p1).multiplyScalar(0.5)); sleeve.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir); g.add(sleeve);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.038 * s, 0.04 * s, 0.035 * s, 18), pmat("#ecebe7", { roughness: 0.6 })); cuff.position.copy(p0).addScaledVector(dir, 0.02 * s); cuff.quaternion.copy(sleeve.quaternion); g.add(cuff);
  return { group: g, wrist, s, swing: (a) => { wrist.rotation.x = a; } };
}

// The owners' companies: a small office block with lit windows, a parapet and a glass door; the windows
// brighten as the money arrives (fill(k)). Origin: floor centre; front +z. API { group, fill(k), top }
function makeOwnerCo({ w = 0.5, d = 0.42, h = 0.7, seed = 4, tint = "#3a3532" } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const c = makeCanvas(128, 256), x = c.getContext("2d"); x.fillStyle = "#1a1c22"; x.fillRect(0, 0, 128, 256);
  const cells = [];
  for (let yy = 10; yy < 236; yy += 20) for (let xx = 8; xx < 124; xx += 20) cells.push([xx, yy, r()]);
  const tex = texFrom(c);
  const paint = (k) => { x.fillStyle = "#1a1c22"; x.fillRect(0, 0, 128, 256); for (const [xx, yy, v] of cells) { const on = v < 0.18 + 0.75 * k; x.fillStyle = on ? `rgba(255,${200 + Math.round(v * 40)},${120 + Math.round(v * 60)},${0.55 + 0.45 * k})` : "rgba(60,70,90,0.5)"; x.fillRect(xx, yy, 12, 13); } tex.needsUpdate = true; };
  const wallM = pmat(tint, { roughness: 0.7 }), winM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [wallM, wallM, wallM, wallM, winM, wallM]); body.position.y = h / 2; g.add(body);
  const par = new THREE.Mesh(rbox(w + 0.04, 0.05, d + 0.04, 0.01), pmat("#26272b", { roughness: 0.5 })); par.position.y = h + 0.025; g.add(par);
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, 0.14, 0.01), glassMat({ color: "#ffd9a0", opacity: 0.6 })); door.position.set(0, 0.07, d / 2 + 0.006); g.add(door);
  g.add(contactShadow(w + 0.4, d + 0.4));
  paint(0.2);
  let last = -1;
  return { group: g, top: h + 0.05, fill: (k) => { const q = Math.round(clamp(k) * 20) / 20; if (q !== last) { last = q; paint(q); } } };
}

// Glass tube from a to b through a raised middle point, with small cash bundles riding inside.
// run(t, t0, t1): bundles flow from a to b between t0 and t1. API { group, run }
function makeMoneyTube(a, mid, b, { n = 7, seed = 2, over = null } = {}) {
  const g = new THREE.Group(), curve = new THREE.CatmullRomCurve3(over ? [a, mid, over, b] : [a, mid, b]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.035, 12, false), glassMat({ opacity: 0.22 })); tube.userData.noShadow = true; g.add(tube);
  for (const p of [a]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.008, 8, 24), pmat("#9aa1a8", { metalness: 0.9, roughness: 0.3 })); ring.position.copy(p); ring.lookAt(curve.getPoint(p === a ? 0.03 : 0.97)); g.add(ring); }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.03, 20), pmat("#5a5f66", { metalness: 0.8, roughness: 0.35 })); collar.position.set(b.x, b.y + 0.04 + 0.015, b.z); g.add(collar);
  const items = []; const r = mulberry32(seed);
  for (let i = 0; i < n; i++) { const bd = makeCashBundle({ w: 0.05, d: 0.025, h: 0.016 }); bd.visible = false; g.add(bd); items.push({ bd, ph: i / n + r() * 0.03 }); }
  const run = (t, t0, t1) => {
    const P = 0.9;
    items.forEach((it) => {
      const age = t - t0 - it.ph * P; const u = (age % P) / P, cyc = Math.floor(age / P);
      const born = t0 + it.ph * P + cyc * P; const on = age >= 0 && born < t1;
      it.bd.visible = on; if (!on) return;
      const p = curve.getPoint(u), q = curve.getTangent(u); it.bd.position.copy(p); it.bd.lookAt(p.clone().add(q));
    });
  };
  return { group: g, run };
}

// Caution tape on striped posts around a set of points [[x, z], ...] (closed = false). set(k): the posts pop
// in one by one and the tape runs between them. Origin: floor. API { group, set(k), mid(i) }
function makeCautionTape(pts, { h = 0.5, sign = null } = {}) {
  const g = new THREE.Group(), posts = [], tapes = [];
  const sc = makeCanvas(64, 256), sx = sc.getContext("2d"); for (let i = 0; i < 8; i++) { sx.fillStyle = i % 2 ? "#f4f1ea" : "#e0261b"; sx.fillRect(0, i * 32, 64, 32); }
  const poleM = pmat("#ffffff", { map: texFrom(sc), roughness: 0.5 }), baseM = pmat("#1b1b1d", { roughness: 0.7 });
  pts.forEach(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.035, 24), baseM); base.position.y = 0.0175; p.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, h, 12), poleM); pole.position.y = h / 2 + 0.03; p.add(pole);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), baseM); cap.position.y = h + 0.035; p.add(cap);
    p.add(contactShadow(0.3, 0.3)); posts.push(p);
  });
  const tex = hazardTex();
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0);
    const t2 = tex.clone(); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(len / 0.25, 1); t2.needsUpdate = true;
    const piv = new THREE.Group(); piv.position.set(x0, h - 0.03, z0); piv.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(piv);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(len, 0.055, 0.004), pmat("#ffffff", { map: t2, roughness: 0.5 })); tape.position.x = len / 2; piv.add(tape);
    tapes.push({ piv, len });
  }
  let signObj = null;
  if (sign) {
    const [x0, z0] = pts[sign.seg], [x1, z1] = pts[sign.seg + 1];
    signObj = new THREE.Group(); signObj.position.set((x0 + x1) / 2, h - 0.03 - 0.03 - sign.h / 2 - 0.01, (z0 + z1) / 2 + 0.006); g.add(signObj);
    const board = new THREE.Mesh(rbox(sign.w + 0.03, sign.h + 0.03, 0.012, 0.008), pmat("#1a1a1a", { roughness: 0.5 })); signObj.add(board);
    const pl = makePlate(sign.text, sign.w, sign.h, { bg: "#f2c200", fg: "#141414" }); pl.position.z = 0.007; signObj.add(pl);
  }
  const set = (k) => {
    const n = posts.length;
    posts.forEach((p, i) => { const s = pop(k * n * 0.5, i * 0.5, 0.45); p.visible = s > 0.01; p.scale.setScalar(Math.max(0.0001, s)); });
    tapes.forEach((tp, i) => { const u = clamp((k * n * 0.5 - i * 0.5 - 0.25) / 0.5); tp.piv.visible = u > 0.01; tp.piv.scale.x = Math.max(0.0001, u); });
    if (signObj) { const s = pop(k, 0.75, 0.25); signObj.visible = s > 0.01; signObj.scale.setScalar(Math.max(0.0001, s)); }
  };
  set(1);
  return { group: g, set, sign: signObj };
}

// Heavy cast-iron block with a red "PREJUÍZO" plate on its front. Origin: bottom centre. API { group, h }
function makeLossBlock({ w = 1.4, h = 0.46, d = 0.78 } = {}) {
  const g = new THREE.Group();
  const iron = pmat("#ffffff", { map: tileTex(cachedTex("loss-iron", () => noiseTex({ base: "#2e2c2b", amount: 0.2, size: 2, seed: 33 })), 2, 1), metalness: 0.6, roughness: 0.45 });
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), iron); m.position.y = h / 2; g.add(m);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 10, 24), pmat("#6a6d72", { metalness: 0.9, roughness: 0.3 })); ring.position.set(0, h + 0.07, 0); g.add(ring);
  const lug = new THREE.Mesh(rbox(0.12, 0.03, 0.08, 0.01), iron); lug.position.y = h + 0.015; g.add(lug);
  const p = makePlate("PREJUÍZO", w * 0.82, h * 0.6, { bg: RED, fg: "#ffffff" }); p.position.set(0, h / 2, d / 2 + 0.016); g.add(p);
  return { group: g, h };
}

// ---------------------------------------------------------------- the hook: the map of Paraguay
// Clients as points of light on Paraguay (denser in the east, where most people live). show(t-based) and
// a wave that switches them off from Asunción. API { mesh, update(on(d) → 0..1) }
function makeClientDots(map, n = 300, seed = 5) {
  const ring = SA_RINGS.PRY[0], r = mulberry32(seed), pts = [];
  const insidePoly = (lo, la) => { let c = false; for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) { const xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]; if ((yi > la) !== (yj > la) && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) c = !c; } return c; };
  let guard = 0;
  while (pts.length < n && guard++ < 20000) {
    const lo = -62.6 + r() * 8.4, la = -27.6 + r() * 8.4;
    if (!insidePoly(lo, la)) continue;
    if (lo < -58.2 && r() > 0.12) continue;   // the Chaco (west) is almost empty
    pts.push([lo, la]);
  }
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0095, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), pts.length);
  m.frustumCulled = false; m.userData.decor = true; m.userData.noShadow = true;
  const asu = map.pt(-57.63, -25.28, 0), o = new THREE.Object3D(), col = new THREE.Color(), on = new THREE.Color("#ffd28a"), off = new THREE.Color("#3a1410");
  const dist = pts.map(([lo, la]) => map.pt(lo, la, 0).distanceTo(asu));
  const update = (show, dark, y) => {
    pts.forEach(([lo, la], i) => {
      const s = dist[i] < 0.09 ? 0 : show(dist[i], i), k = dark(dist[i], i);
      const p = map.pt(lo, la, y); o.position.copy(p); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.copy(on).lerp(off, k).multiplyScalar(1 + 0.6 * (1 - k)));
    });
    m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
  };
  return { mesh: m, update };
}

// ---------------------------------------------------------------- the night: bedroom, phone, card terminal
// Nightstand with a drawer and a small lamp. Origin: floor centre; top at `top`. API { group, top, lamp }
function makeNightstand({ w = 0.62, h = 0.6, d = 0.45 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a3622"), roughness: 0.45, clearcoat: 0.5 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.015), wood); body.position.y = h / 2; g.add(body);
  const dr = new THREE.Mesh(rbox(w - 0.06, h * 0.32, 0.015, 0.006), wood); dr.position.set(0, h * 0.72, d / 2 + 0.006); g.add(dr);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); knob.position.set(0, h * 0.72, d / 2 + 0.02); g.add(knob);
  const lamp = new THREE.Group(); lamp.position.set(-0.17, h, -0.08); g.add(lamp);
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 24), pmat("#2b2b2b", { metalness: 0.5, roughness: 0.4 })); lb.position.y = 0.01; lamp.add(lb);
  const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 10), pmat("#2b2b2b", { metalness: 0.5, roughness: 0.4 })); lp.position.y = 0.14; lamp.add(lp);
  const shadeM = mat("#f3d7b0", { emissive: "#ffb766", emissiveIntensity: 0.5, side: THREE.DoubleSide });
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.1, 28, 1, true), shadeM); ls.position.y = 0.29; lamp.add(ls);
  const pl = new THREE.PointLight("#ffb766", 0.9, 2.5, 1.6); pl.position.set(-0.17, h + 0.3, -0.05); g.add(pl);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, body, top: h, lamp, light: pl, shade: shadeM };
}
// The bank app (generic, no brand): lock screen with the date; then the account with a balance that
// never loads (SALDO INDISPONÍVEL) and a card tile that turns BLOQUEADO. o = { st: "lock"|"app", spin, fail, card }
function paintNightApp(x, o) {
  x.clearRect(0, 0, 720, 1500);
  if (o.st === "lock") {
    const gr = x.createLinearGradient(0, 0, 0, 1500); gr.addColorStop(0, "#1b2340"); gr.addColorStop(1, "#06070c"); x.fillStyle = gr; x.fillRect(0, 0, 720, 1500);
    x.fillStyle = "#e9e6f2"; x.beginPath(); x.arc(360, 300, 90, 0, Math.PI * 2); x.fill(); x.fillStyle = "#1b2340"; x.beginPath(); x.arc(400, 270, 84, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "800 58px Inter"; x.fillText("terça-feira", 360, 520); x.font = "600 46px Inter"; x.fillStyle = "#c9c6d6"; x.fillText("3 de novembro", 360, 590);
    return;
  }
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#14161c"); g.addColorStop(1, "#0b0c10"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = "#ffffff"; x.font = "900 66px Inter"; x.textAlign = "left"; x.fillText("Minha conta", 50, 200);
  x.fillStyle = "#b9c0cc"; x.font = "800 56px Inter"; x.fillText("Saldo disponível", 50, 320);
  if (o.fail > 0) {
    x.fillStyle = "#5d6470"; x.font = "900 110px Inter"; x.fillText("— — —", 50, 460);
    x.globalAlpha = clamp(o.fail); x.fillStyle = RED; roundRect(x, 40, 520, 640, 130, 26); x.fill(); x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "900 50px Inter"; x.fillText("SALDO INDISPONÍVEL", 360, 604); x.globalAlpha = 1; x.textAlign = "left";
  } else {
    x.strokeStyle = "#3a404b"; x.lineWidth = 14; x.beginPath(); x.arc(160, 430, 50, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#cfd6e2"; x.beginPath(); x.arc(160, 430, 50, o.spin, o.spin + 1.6); x.stroke();
    x.fillStyle = "#cfd6e2"; x.font = "800 54px Inter"; x.fillText("carregando…", 240, 450);
  }
  // card tile
  x.fillStyle = "rgba(255,255,255,0.06)"; roundRect(x, 40, 760, 640, 260, 30); x.fill();
  const cg = x.createLinearGradient(80, 800, 340, 980); cg.addColorStop(0, "#2f4a6a"); cg.addColorStop(1, "#16263a"); x.fillStyle = cg; roundRect(x, 80, 800, 260, 170, 18); x.fill();
  x.fillStyle = "#d8b25a"; roundRect(x, 110, 850, 54, 40, 8); x.fill();
  x.fillStyle = "#e9e4dc"; x.font = "800 56px Inter"; x.fillText("Cartão", 380, 870);
  x.fillStyle = o.card > 0 ? RED : "#b9c0cc"; x.font = "900 50px Inter"; x.fillText(o.card > 0 ? "BLOQUEADO" : "•••• 4821", 380, 940);
}
// Card terminal (a "maquininha"): dark body, keypad, a screen and a card in its slot. paint(fn) draws the
// screen (480 x 300). Origin: bottom centre, lying on a counter with the screen tilted up to +z.
// API { group, paint(fn), led(color) }
function makeCardTerminal() {
  const g = new THREE.Group(), body = pmat("#1c1d21", { roughness: 0.35, clearcoat: 0.6 });
  const base = new THREE.Group(); base.rotation.x = -0.18; base.position.set(0, 0.03, 0); g.add(base);
  const shell = new THREE.Mesh(rbox(0.16, 0.05, 0.3, 0.02), body); shell.position.set(0, 0, 0); base.add(shell);
  const c = makeCanvas(480, 300), ctx = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.075), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.rotation.x = -Math.PI / 2; scr.position.set(0, 0.0255, -0.075); base.add(scr);
  const keyM = pmat("#3a3d44", { roughness: 0.5 }), keyHi = [pmat("#2fae66", { roughness: 0.5 }), pmat("#e8c22a", { roughness: 0.5 }), pmat("#d43a2a", { roughness: 0.5 })];
  const kc = makeCanvas(64, 48), kx = kc.getContext("2d");
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].forEach((d, i) => {
    const km = makeCanvas(64, 48), q = km.getContext("2d"); q.fillStyle = "#3a3d44"; q.fillRect(0, 0, 64, 48); q.fillStyle = "#e9e6df"; q.font = "800 34px Inter"; q.textAlign = "center"; q.textBaseline = "middle"; q.fillText(d, 32, 26);
    const top = pmat("#ffffff", { map: texFrom(km), roughness: 0.5 });
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.022), [keyM, keyM, top, keyM, keyM, keyM]); k.position.set((i % 3 - 1) * 0.038, 0.027, 0.02 + Math.floor(i / 3) * 0.028); base.add(k);
  });
  void kx;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.012), pmat("#060607", { roughness: 0.8 })); slot.position.set(0, 0.006, 0.146); base.add(slot);
  [-1, 0, 1].forEach((s, i) => { const k = new THREE.Mesh(rbox(0.03, 0.008, 0.022, 0.004), keyHi[2 - i]); k.position.set(s * 0.038, 0.027, 0.132); base.add(k); });
  const card = new THREE.Mesh(rbox(0.085, 0.003, 0.054, 0.002), pmat("#2f4a6a", { roughness: 0.3, clearcoat: 0.8 })); card.rotation.x = Math.PI / 2; card.position.set(0, 0.006, 0.16); base.add(card);
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.01, 0.004), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 })); chip.position.set(-0.02, 0.016, 0.162); base.add(chip);
  const ledM = new THREE.MeshBasicMaterial({ color: "#2fae66", toneMapped: false });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), ledM); led.position.set(0.055, 0.027, -0.13); base.add(led);
  g.add(contactShadow(0.3, 0.45));
  return { group: g, paint: (fn) => { fn(ctx, 480, 300); tex.needsUpdate = true; }, led: (c) => ledM.color.set(c) };
}
function paintTerminal(x, W, H, k) {
  x.fillStyle = k > 0 ? "#2a0a08" : "#0d1a14"; x.fillRect(0, 0, W, H);
  x.textAlign = "center"; x.textBaseline = "middle";
  if (k > 0) { x.fillStyle = "#ff4a3a"; x.font = "900 76px Inter"; x.fillText("RECUSADO", W / 2, H * 0.44); x.fillStyle = "#ffb3a8"; x.font = "700 34px Inter"; x.fillText("tente outro cartão", W / 2, H * 0.74); }
  else { x.fillStyle = "#9fe8c0"; x.font = "800 48px Inter"; x.fillText("APROXIME OU", W / 2, H * 0.38); x.fillText("INSIRA O CARTÃO", W / 2, H * 0.62); }
}

// ---------------------------------------------------------------- the board and the room
// A paper note pinned to the cork board with a printed line. Origin: centre of the back. API { group, pin }
function makeNoteCard(text, { w = 0.9, h = 0.34, paper = "#f2ead8" } = {}) {
  const g = new THREE.Group();
  const sheet = new THREE.Mesh(rbox(w, h, 0.012, 0.004), mat(paper, { roughness: 0.9 })); sheet.position.z = 0.006; g.add(sheet);
  const p = makePlate(text, w * 0.9, h * 0.62, { bg: paper, fg: "#1c1410", depth: 0.004 }); p.position.set(0, -0.01, 0.013); g.add(p);
  const pin = makePin(); pin.position.set(0, h / 2 - 0.05, 0.012); pin.scale.setScalar(0.7); g.add(pin);
  return { group: g, pin, plate: p };
}
// Steel handcuffs lying on a table: two cuffs and three chain links. Origin: table point under the centre.
function makeHandcuffs({ s = 1 } = {}) {
  const g = new THREE.Group(), steel = pmat("#b9bec4", { metalness: 1, roughness: 0.22 }), dark = pmat("#2a2d31", { metalness: 0.7, roughness: 0.35 });
  for (const sx of [-1, 1]) {
    const cx = sx * 0.13 * s;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.068 * s, 0.011 * s, 12, 40, Math.PI * 1.55), steel); ring.rotation.x = Math.PI / 2; ring.rotation.z = sx > 0 ? Math.PI * 0.72 : -Math.PI * 0.28 + Math.PI; ring.position.set(cx, 0.012 * s, 0); g.add(ring);
    // the lock case: a flat box on the inner side of each cuff, with a keyhole, and the double bar to the chain
    const box = new THREE.Mesh(rbox(0.07 * s, 0.026 * s, 0.05 * s, 0.006 * s), steel); box.position.set(cx - sx * 0.07 * s, 0.013 * s, 0); g.add(box);
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.006 * s, 0.006 * s, 0.003, 12), dark); hole.position.set(cx - sx * 0.07 * s, 0.027 * s, 0.005 * s); g.add(hole);
    const swivel = new THREE.Mesh(new THREE.TorusGeometry(0.011 * s, 0.004 * s, 8, 16), steel); swivel.rotation.y = Math.PI / 2; swivel.position.set(cx - sx * 0.112 * s, 0.013 * s, 0); g.add(swivel);
  }
  for (let i = 0; i < 2; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.012 * s, 0.004 * s, 8, 16), steel); l.position.set((i - 0.5) * 0.02 * s, 0.013 * s, 0); l.rotation.x = i % 2 ? Math.PI / 2 : 0; l.rotation.y = i % 2 ? 0 : Math.PI / 2; g.add(l); }
  return g;
}
// Judge's gavel resting on its sound block. Origin: floor of the block. API { group }
function makeGavel({ s = 1 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a2e18"), roughness: 0.4, clearcoat: 0.7 });
  const blockM = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.12 * s, 0.04 * s, 32), wood); blockM.position.y = 0.02 * s; g.add(blockM);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * s, 0.045 * s, 0.17 * s, 24), wood); head.rotation.x = Math.PI / 2; head.position.set(0, 0.04 * s + 0.045 * s, 0); g.add(head);
  for (const sz of [-1, 1]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.047 * s, 0.047 * s, 0.012 * s, 24), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 })); band.rotation.x = Math.PI / 2; band.position.set(0, 0.085 * s, sz * 0.06 * s); g.add(band); }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.013 * s, 0.017 * s, 0.24 * s, 14), wood); handle.rotation.z = Math.PI / 2 - 0.12; handle.position.set(0.13 * s, 0.07 * s, 0); g.add(handle);
  return { group: g };
}
function paintVote(x, W, H, k, zero) {
  x.fillStyle = "#06070a"; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.04)"; for (let i = 8; i < W; i += 16) for (let j = 8; j < H; j += 16) x.fillRect(i, j, 6, 6);
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#c9c2b8"; x.font = "800 64px Inter"; x.fillText("CÂMARA · IMPEACHMENT", W / 2, 110);
  if (k <= 0) { x.fillStyle = "#ffd28a"; x.font = "900 150px Inter"; x.fillText("VOTAÇÃO…", W / 2, 400); return; }
  x.font = "900 290px Inter"; x.fillStyle = "#2fde7a"; x.fillText(String(Math.round(78 * k)), W * 0.26, 410);
  x.fillStyle = "#f4f1ea"; x.font = "900 130px Inter"; x.fillText("×", W * 0.52, 400);
  x.fillStyle = zero ? "#ff4a3a" : "#8a3a32"; x.font = "900 290px Inter"; x.fillText("0", W * 0.76, 410);
  x.font = "800 70px Inter"; x.fillStyle = "#9ef0bd"; x.fillText("SIM", W * 0.26, 630); x.fillStyle = "#ffb3a8"; x.fillText("NÃO", W * 0.76, 630);
}

// ============================================================ 1 · gancho: quase metade do Paraguai era cliente
// The map of South America as a floor model in a dark room; Paraguay rises a little, its clients light up
// as points spreading from Asunción, where the bank's glass tower stands. On "quebrar" the tower's lights
// die and the points go dark in a wave; Paraguay glows red. The camera pushes in, with a jolt.
addScene("gancho", 0, A.c1, (S) => {
  const { off, win } = officeBack(S, 3, -4.4);
  const map = makeSouthAmericaMap(); S.add(map.group);
  map.set("PRY", 0.07); map.dim(["PRY"], 0.7); map.color("PRY", "#6b5440");
  const dots = makeClientDots(map, 320, 5); S.add(dots.mesh);
  const tw = makeStiltBank({ seed: 9, signDetail: true }); tw.plaza.visible = false; tw.shadow.visible = false; tw.group.scale.setScalar(0.1); const asu = map.pt(-57.63, -25.28, 0.07); tw.group.position.copy(asu); S.add(tw.group);
  const PRY = map.countries.PRY.grp;
  const anim = (t) => {
    officeLook(off, t, 0.28); win.set(0.9, "#8fb0ff"); key.intensity = 1.0; hemi.intensity = 0.25;
    const dk = sm(t, A.quebrar - 0.05, A.quebrar + 0.6);
    dots.update((d) => pop(t, 0.15 + d * 3.2, 0.35), (d) => sm(t, A.quebrar + d * 0.9, A.quebrar + d * 0.9 + 0.25), 0.07 + 0.008);
    tw.lights(1 - dk); map.glow("PRY", 0.25 * (1 - dk) + 0.9 * dk, dk > 0.3 ? "#ff3b2a" : "#ffd27a");
    fill.position.copy(asu).add(new V3(0, 0.6, 0.5)); fill.color.set(dk > 0.3 ? "#ff5a3a" : "#ffc46a"); fill.intensity = 1.2 + 1.2 * beat(t, A.quebrar, 0.6);
  };
    S.hero(PRY, "paraguai em relevo"); S.hero(tw.group, "prédio do banco em assunção", { when: (t) => t > A.banco - 0.3 });
  const box = envelope([PRY], anim, 0, A.c1);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.06, 1.2, 0.62], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, A.quebrar, 0.025, 0.4); CAM.apply(p); };
});

// ============================================================ 2 · imagina: terça de madrugada, você abre o app
// A dark bedroom: the nightstand with its lamp, the phone lying on it. The camera comes down from the room to
// the phone; the lock screen gives way to the bank app, the balance spins and never loads.
addScene("app", A.c1, A.c2, (S) => {
  const room = makeNightLivingRoom({ wallZ: -1.6, seed: 12, pendant: false }); room.group.position.x = -1.2; S.backdrop(room.group); room.light(0.15);
  const ns = makeNightstand(); S.add(ns.group);
  const ph = makePhone(); ph.group.scale.setScalar(0.13); ph.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 });
  ph.group.rotation.set(-Math.PI / 2, 0, 0.25); ph.group.position.set(0.1, 0, 0.06); S.add(ph.group); seatOn(ph.group, ns.top);
  let last = "";
  const anim = (t) => {
    room.update(t); room.light(0.12); scene.fog.color.set("#07080d");
    key.intensity = 0.7; key.color.set("#9fb4ff"); hemi.intensity = 0.22; hemi.color.set("#8ea6e0"); rim.intensity = 1.0; rim.color.set("#7fa2ff");
    const st = t < A.abre ? "lock" : "app", fail = lin(t, A.saldo, A.saldo + 0.35), spin = t * 7;
    const k = st + (st === "app" ? (fail > 0 ? "f" + fail.toFixed(2) : "s" + Math.floor(t * 12)) : "");
    if (k !== last) { last = k; paintNightApp(ph.ctx, { st, spin, fail, card: 0 }); ph.tex.needsUpdate = true; }
    const glow = t < A.voce - 0.3 ? 0.4 : 1;
    fill.position.set(0.1, ns.top + 0.35, 0.25); fill.color.set(fail > 0.5 ? "#ff6a5a" : "#9fc4ff"); fill.intensity = 0.9 * glow + 0.8 * fail;
  };
  S.hero(ns.group, "criado-mudo com abajur", { when: (t) => t < A.voce - 0.6 });
  S.hero(ph.group, "celular com app do banco", { when: (t) => t > A.voce + 0.1 });
  S.solid(ns.body, "criado-mudo"); S.solid(ph.group, "celular", { restsOn: [ns.body] });
  const bA = envelope([ns.group], anim, A.c1, A.voce), bB = envelope([ph.group], anim, A.voce, A.c2);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c1, bA, "drop", { from: [0.2, 0.5, 1], rise: 0.35, pull: 1.1 }], [A.voce, bB, "push", { from: [0, 1, 0.35], pull0: 1.3, pull: 1.0 }]], 0.6)); };
});

// ============================================================ 3 · o cartão não passa
// A bakery counter at night: the card terminal with the card in its slot; on "não passa" the screen turns
// RECUSADO and the LED goes red. The camera slides past.
addScene("cartao", A.c2, A.c3, (S) => {
  const set = makeBakerySet({ seed: 8 }); S.backdrop(set.group);
  const term = makeCardTerminal(); term.group.scale.setScalar(2.2); term.group.position.set(0, 0.95, 0.15); S.add(term.group);
  let last = -1;
  const anim = (t) => {
    set.update(t); key.intensity = 1.5; key.color.set("#ffe2c0"); hemi.intensity = 0.35; scene.fog.color.set("#0c0a08");
    const k = t > A.passa ? 1 : 0; if (k !== last) { last = k; term.paint((x, W, H) => paintTerminal(x, W, H, k)); term.led(k ? "#ff2a1a" : "#2fae66"); }
    fill.position.set(0, 1.4, 0.8); fill.color.set(k ? "#ff4a3a" : "#ffd59a"); fill.intensity = 1.0 + 1.4 * k;
  };
  S.hero(term.group, "maquininha de cartão");
  const box = envelope([term.group], anim, A.c2, A.c3);
  return (t) => { anim(t); let p = CAM.move(box, "truck", lin(t, A.c2, A.c3), { zone: "stage", from: [0.1, 0.7, 1], side: 0.35, pull: 1.05 }); p = CAM.shake(p, t, A.passa, 0.02, 0.3); CAM.apply(p); };
});

// ============================================================ 4 · não é bug: o Banco Central assumiu o banco
// The real Central Bank of Paraguay in a photo frame on a pedestal, the city at night behind; it spins in
// and the camera swings round.
addScene("bc", A.c3, A.c4, (S) => {
  const sky = makeSkyline({ z: -9, seed: 21 }); S.backdrop(sky.group);
  const fr = makePhotoFrame("bcp", { w: 2.4, name: "BANCO CENTRAL DO PARAGUAI" }); if (fr.plate) fr.plate.userData.plate.detail = true; S.add(fr.group);
  const anim = (t) => {
    sky.update(t); key.intensity = 1.6; key.color.set("#ffd9b0"); hemi.intensity = 0.36; scene.fog.color.set("#0b0d14");
    fr.frame.rotation.y = 1.3 * (1 - eOut(lin(t, A.c3, A.c3 + 0.7))); fr.zoom(1 + 0.15 * lin(t, A.c3, A.c4));
    fill.position.set(0, 1.6, 1.4); fill.color.set("#ffc46a"); fill.intensity = 1.2 + 0.8 * beat(t, A.assumiu, 0.6);
  };
  S.hero(fr.group, "porta-retrato do banco central", { when: (t) => t > A.c3 + 0.75 });
  const box = envelope([fr.group], anim, A.c3 + 0.75, A.c4);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c3, A.c4), { zone: "stage", from: [0, 0.18, 1], deg: 52, pull: 1.0 })); };
});

// ============================================================ 5 · mas por quê? pensa num prédio
// The bank as a building, alone in the city at night ("por quê?"). On "pensa num prédio" its front glass
// slides away: the floors full of the clients' money (crane up the floors), then down to the stilts and the
// plinth CAPITAL DOS DONOS (drop).
addScene("predio", A.c4, A.c5, (S) => {
  const city = cityBack(S, 7);
  const tw = makeStiltBank({ seed: 3 }); S.add(tw.group);
  const pl = capitalPlinth(); S.add(pl.group);
  const T1 = A.predio + 0.1, T2 = A.colunas - 0.25;
  const anim = (t) => {
    cityLook(city, t);
    tw.open(sm(t, A.pensa + 0.2, A.predio + 0.7)); tw.lights(0.55 + 0.45 * sm(t, A.andares - 0.3, A.andares + 0.3));
    tw.cols.forEach((c) => c.glow(0.8 * beat(t, A.colunas, 0.9)));
    popIn(pl.group, t, A.donos - 0.15, 0.4);
    fill.position.set(0, 1.0, 1.6); fill.color.set("#ffc46a"); fill.intensity = 0.8 + 1.0 * sm(t, A.colunas - 0.3, A.colunas + 0.3);
  };
  S.hero(tw.body, "prédio do banco sobre colunas", { when: (t) => t < T1 - 0.6 }); S.hero(tw.front, "colunas do prédio", { when: (t) => t < T1 - 0.6 });
  S.hero(tw.body, "andares com dinheiro", { when: (t) => inside(t, T1, T2 - 0.6) });
  S.hero(tw.front, "colunas da frente", { when: (t) => t > T2 });
  S.hero(pl.group, "placa capital dos donos", { when: (t) => t > A.donos + 0.3 });
  S.solid(tw.plaza, "praça"); S.solid(pl.group, "pedestal", { restsOn: [tw.plaza] });
  const bA = envelope([tw.body, tw.front], anim, A.c4, T1), bB = envelope([tw.body], anim, T1, T2), bC = envelope([tw.front, pl.group], anim, T2, A.c5);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c4, bA, "reveal", { from: [0.25, 0.22, 1], pull0: 1.2, pull: 1.0 }], [T1, bB, "crane", { from: [0.2, 0.1, 1], rise: 0.3, pull: 1.0 }], [T2, bC, "drop", { from: [-0.15, 0.25, 1], rise: 0.25, pull: 1.0 }]], 0.6)); };
});

// ============================================================ 6 · se vem um prejuízo, as colunas aguentam
// An iron block PREJUÍZO comes down on the roof; the building takes it, the stilts glow, nothing shakes on
// the floors. The camera comes down from above the roof.
addScene("prejuizo", A.c5, A.c6, (S) => {
  const city = cityBack(S, 9);
  const tw = makeStiltBank({ seed: 3 }); tw.open(1); S.add(tw.group);
  const pl = capitalPlinth(); S.add(pl.group);
  const blk = makeLossBlock(); S.add(blk.group); tw.sign.visible = false;
  const LAND = A.prejuizo + 0.35;
  const anim = (t) => {
    cityLook(city, t); tw.open(1); tw.lights(1);
    const k = eOut(lin(t, A.c5 + 0.1, LAND)); blk.group.position.set(0, tw.top + 0.9 * (1 - k) * (1 - k) + 0.0, 0); blk.group.visible = t > A.c5 + 0.05;
    blk.group.position.y = lerp(tw.top + 1.6, tw.top, k * k);
    tw.cols.forEach((c) => c.glow(sm(t, A.colunas2 - 0.2, A.aguentam)));
    fill.position.set(0, 0.6, 1.4); fill.color.set("#ffb066"); fill.intensity = 0.8 + 1.4 * sm(t, A.colunas2 - 0.2, A.aguentam);
  };
  S.hero(tw.body, "prédio com o bloco"); S.hero(tw.front, "colunas"); S.hero(blk.group, "bloco prejuízo", { when: (t) => t > LAND - 0.2 });
  S.solid(blk.group, "bloco", { restsOn: [tw.body] }); S.solid(tw.plaza, "praça");
  const box = envelope([tw.body, tw.front, blk.group], anim, LAND, A.c6);
  return (t) => { anim(t); let p = CAM.move(box, "drop", lin(t, A.c5, A.c6), { zone: "stage", from: [0.2, 0.35, 1], rise: 0.35, pull: 1.02 }); p = CAM.shake(p, t, LAND, 0.03, 0.4); CAM.apply(p); };
});

// ============================================================ 7 · o fiscal bateu: as colunas estavam ocas
// Close on the two front stilts. The inspector's hammer knocks on the right one (a crack spreads); on "ocas"
// the front shells break off: inside, the concrete reaches less than half. Beside them, the gauge fills only
// to below the white HALF mark, far from the red MÍNIMO DA LEI. The camera pushes in.
const OCA_FILL = 0.42;
addScene("ocas", A.c6, A.c7, (S) => {
  const city = cityBack(S, 13);
  const tw = makeStiltBank({ seed: 3 }); tw.open(1); S.add(tw.group);
  const gauge = makeLevelGauge(); gauge.group.position.set(-SB.CX - 0.5, SB.PH, SB.CZ + 0.5); S.add(gauge.group);
  const arm = makeInspectorArm(); S.add(arm.group);
  const hit = new V3(SB.CX + 0.02, SB.PH + 0.45, SB.CZ + SB.CS / 2);
  arm.group.position.set(hit.x, hit.y + 0.28 * arm.s, hit.z + (0.086 + 0.004) * arm.s);
  const HITS = [A.bateu - 0.02, A.bateu + 0.5, A.bateu + 1.0];
  const anim = (t) => {
    cityLook(city, t); tw.open(1); tw.lights(1);
    let a = -0.8; for (const h of HITS) { if (t > h - 0.25 && t < h + 0.25) a = t < h ? lerp(-0.8, 0, eOut(lin(t, h - 0.25, h))) : lerp(0, -0.8, sm(t, h, h + 0.25)); }
    const gone = sm(t, A.ocas - 0.5, A.ocas - 0.1); arm.swing(a); arm.group.position.x = hit.x + 0.8 * gone; arm.group.position.y = hit.y + 0.28 * arm.s + 0.7 * gone; arm.group.visible = gone < 0.99;
    const cr = clamp((t - HITS[0]) / 1.4); tw.cols[1].crack(t > HITS[0] ? 0.35 + 0.65 * cr : 0); tw.cols[0].crack(t > HITS[2] ? 0.5 : 0);
    tw.cols[1].breakOff(lin(t, A.ocas - 0.05, A.ocas + 0.75)); tw.cols[0].breakOff(lin(t, A.ocas + 0.15, A.ocas + 0.95));
    for (const c of tw.cols) c.setFill(OCA_FILL);
    gauge.group.visible = t > A.menos - 0.4; gauge.group.scale.setScalar(Math.max(0.0001, pop(t, A.menos - 0.4, 0.4)));
    gauge.set(OCA_FILL * sm(t, A.menos, A.metade2 + 0.3)); gauge.mark(beat(t, A.minimo - 0.1, 0.6));
    fill.position.set(0.2, 0.8, 1.3); fill.color.set(t > A.ocas ? "#ff8a5a" : "#ffd59a"); fill.intensity = 1.2 + 1.0 * beat(t, A.ocas, 0.7);
  };
  S.hero(tw.front, "colunas da frente rachando"); S.hero(gauge.group, "medidor mínimo da lei", { when: (t) => t > A.menos + 0.1 });
  S.solid(tw.plaza, "praça"); S.solid(gauge.group, "medidor", { restsOn: [tw.plaza] });
  const bA = envelope([tw.front], anim, A.c6, A.menos - 0.5), bB = envelope([tw.front, gauge.group], anim, A.menos, A.c7);
  return (t) => {
    anim(t);
    let p = shotTrack(t, [[A.c6, bA, "push", { from: [0.25, 0.15, 1], pull0: 1.25, pull: 1.02 }], [A.menos - 0.4, bB, "truck", { from: [0.05, 0.2, 1], side: 0.25, pull: 1.0 }]], 0.5);
    for (const h of HITS) p = CAM.shake(p, t, h, 0.012, 0.2);
    p = CAM.shake(p, t, A.ocas, 0.02, 0.35); CAM.apply(p);
  };
});

// ============================================================ 8 · o concreto virou empréstimo pras empresas dos donos
// The bank on the left, three small office blocks of the owners on the right; glass tubes run from the hollow
// stilt to each of them and cash flows through; their windows light up as the money arrives. The plinth
// EMPRESAS DOS DONOS pops in front. The camera slides with the money.
const CO_X = [1.68, 2.24, 2.8], CO_H = [0.62, 0.86, 0.52];
function buildOwners(S, tw, { tubes = true } = {}) {
  const cos = CO_X.map((x, i) => { const c = makeOwnerCo({ h: CO_H[i], seed: 40 + i, tint: ["#3a3532", "#2f3438", "#3b3330"][i] }); c.group.position.set(x, 0, 0.15 + (i === 1 ? -0.12 : 0)); S.add(c.group); return c; });
  const pl = makeLabelPlinth("EMPRESAS DOS DONOS", { w: 1.7, h: 0.3, d: 0.3, plateH: 0.21 }); pl.group.position.set(2.24, 0, 0.75); S.add(pl.group);
  let tbs = [];
  if (tubes) {
    const a = new V3(SB.CX + SB.CS / 2 + 0.01, SB.PH + 0.35, SB.CZ);
    tbs = cos.map((c, i) => { const b = new V3(c.group.position.x, c.top - 0.04, c.group.position.z); const up = new V3(a.x + 0.35, CO_H[1] + 0.55 + i * 0.1, a.z + 0.05), over = new V3(b.x, b.y + 0.32 + i * 0.05, b.z); const tb = makeMoneyTube(a.clone().add(new V3(0, i * 0.05, 0)), up, b, { n: 6, seed: 5 + i, over }); S.add(tb.group); return tb; });
  }
  return { cos, pl, tbs };
}
addScene("emprestimo", A.c7, A.c8, (S) => {
  const city = cityBack(S, 17);
  const tw = makeStiltBank({ seed: 3 }); tw.open(1); S.add(tw.group);
  for (const c of tw.cols) c.setFill(OCA_FILL);
  tw.cols[1].breakOff(1); tw.cols[0].breakOff(1);
  const O = buildOwners(S, tw);
  const T2 = A.empresas - 0.2;
  const anim = (t) => {
    cityLook(city, t); tw.open(1); tw.lights(1);
    O.tbs.forEach((tb, i) => tb.run(t, A.concreto + 0.2 + i * 0.25, A.c8 + 1));
    O.cos.forEach((c, i) => c.fill(sm(t, A.emprestimo + 0.6 + i * 0.4, A.donos2 + 0.8 + i * 0.4)));
    popIn(O.pl.group, t, A.donos2 - 0.4, 0.4);
    fill.position.set(1.5, 1.2, 1.3); fill.color.set(t > A.acima ? "#ff6a4a" : "#ffc46a"); fill.intensity = 1.1 + 0.9 * beat(t, A.acima, 0.6);
  };
  S.hero(tw.front, "colunas ocas", { when: (t) => t < T2 - 0.6 });
  O.cos.forEach((c, i) => S.hero(c.group, "empresa dos donos " + (i + 1), { when: (t) => t > T2 }));
  S.hero(O.pl.group, "placa empresas dos donos", { when: (t) => t > A.donos2 });
  S.solid(tw.plaza, "praça");
  const bA = envelope([tw.front], anim, A.c7, T2), bB = envelope([...O.cos.map((c) => c.group), O.pl.group], anim, T2, A.c8);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c7, bA, "truck", { from: [0.35, 0.3, 1], side: 0.2, pull: 1.15 }], [T2, bB, "truck", { from: [-0.1, 0.35, 1], side: 0.25, pull: 1.02 }]], 0.6)); };
});

// ============================================================ 9 · o Banco Central interditou o prédio
// The whole building: striped posts pop up around it and the hazard tape runs post to post, an INTERDITADO
// sign on the front; the front glass slides back down and the lights stay on with the money inside. The
// camera opens up from the sign to the building.
const TAPE_PTS = [[-1.2, -0.62], [-1.2, 1.55], [1.2, 1.55], [1.2, -0.62]];
addScene("interdita", A.c8, A.c9, (S) => {
  const city = cityBack(S, 23);
  const tw = makeStiltBank({ seed: 3 }); S.add(tw.group);
  for (const c of tw.cols) c.setFill(OCA_FILL);
  tw.cols[1].breakOff(1); tw.cols[0].breakOff(1);
  const tape = makeCautionTape(TAPE_PTS, { h: 0.5, sign: { seg: 1, text: "INTERDITADO", w: 1.5, h: 0.37 } }); tape.group.position.y = SB.PH; S.add(tape.group);
  const anim = (t) => {
    cityLook(city, t, { siren: sm(t, A.interditou, A.interditou + 0.3) });
    tw.open(1 - sm(t, A.predio2 - 0.2, A.predio2 + 0.6)); tw.lights(1);
    tape.set(lin(t, A.c8 + 0.2, A.interditou + 0.5));
    fill.position.set(0, 0.8, 2.2); fill.color.set(Math.floor(t * 3) % 2 ? "#ff4a3a" : "#5a7aff"); fill.intensity = 1.6 * sm(t, A.interditou - 0.2, A.interditou + 0.2);
  };
  S.hero(tw.group, "prédio interditado", { when: (t) => t > A.predio2 - 0.6 });
  S.hero(tape.sign, "placa interditado", { when: (t) => t > A.interditou + 0.3 });
  S.solid(tw.plaza, "praça");
  const bA = envelope([tape.sign, tw.front], anim, A.interditou + 0.4, A.predio2), bB = envelope([tw.group, tape.group], anim, A.predio2, A.c9);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c8, bA, "reveal", { from: [0.1, 0.2, 1], pull0: 1.2, pull: 1.0 }], [A.predio2 - 0.3, bB, "reveal", { from: [-0.15, 0.25, 1], pull0: 1.12, pull: 1.0 }]], 0.6)); };
});

// ============================================================ 10 · até dinheiro público, inclusive da aposentadoria
// Close on the floors behind the tape: sacks PÚBLICO slide onto the second floor, then one APOSENTADORIA onto
// the first. The camera pushes in.
addScene("publico", A.c9, A.c10, (S) => {
  const city = cityBack(S, 29);
  const tw = makeStiltBank({ seed: 3 }); tw.open(1); tw.sign.visible = false; S.add(tw.group);
  for (const c of tw.cols) c.setFill(OCA_FILL);
  tw.cols[1].breakOff(1); tw.cols[0].breakOff(1);
  const tape = makeCautionTape(TAPE_PTS, { h: 0.5, sign: { seg: 1, text: "INTERDITADO", w: 1.5, h: 0.37 } }); tape.group.position.y = SB.PH; S.add(tape.group);
  const sacks = [];
  const add = (label, floor, x, at, { w = 0.36, band = "#2f5d8a" } = {}) => {
    const s = makeProduceSack(label, { w, h: w < 0.4 ? 0.35 : 0.31, d: 0.22, cloth: "burlap", band, labelH: 0.09 }); S.add(s.group);
    sacks.push({ s, floor, x, at }); return s;
  };
  const s1 = add("PÚBLICO", 2, -0.22, A.publico - 0.1, { w: 0.3 }), s2 = add("PÚBLICO", 2, 0.22, A.publico + 0.2, { w: 0.3 });
  const apo = add("APOSENTADORIA", 1, 0.0, A.inclusive - 0.1, { w: 0.64, band: "#2fae66" });
  const T2 = A.publico + 0.4, T3 = A.inclusive - 0.2;
  const anim = (t) => {
    cityLook(city, t); tw.open(1); tw.lights(1); tape.set(1);
    sacks.forEach(({ s, floor, x, at }) => { const k = eOut(lin(t, at, at + 0.45)); s.group.visible = t > at; s.group.position.set(x, tw.floorY(floor) + 0.002, lerp(0.95, 0.12, k)); });
    fill.position.set(0, tw.floorY(2), 1.4); fill.color.set("#ffc46a"); fill.intensity = 1.2 + 0.8 * beat(t, A.aposentadoria, 0.6);
  };
  S.hero(tw.body, "andares do banco", { when: (t) => t < T2 - 0.6 });
  S.hero(s1.group, "saco público 1", { when: (t) => inside(t, A.publico + 0.65, T3 - 0.6) }); S.hero(s2.group, "saco público 2", { when: (t) => inside(t, A.publico + 0.65, T3 - 0.6) });
  S.hero(apo.group, "saco aposentadoria", { when: (t) => t > A.inclusive + 0.4 });
  const bA = envelope([tw.body], anim, A.c9, T2), bB = envelope([s1.group, s2.group], anim, A.publico + 0.65, T3), bC = envelope([apo.group, s1.group, s2.group], anim, A.inclusive + 0.4, A.c10);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c9, bA, "push", { from: [0.15, 0.2, 1], pull0: 1.15, pull: 1.0 }], [T2, bB, "push", { from: [-0.1, 0.12, 1], pull0: 1.2, pull: 1.04 }], [T3, bC, "drop", { from: [0.1, 0.15, 1], rise: 0.12, pull: 1.04 }]], 0.6)); };
});

// ============================================================ 11–12 · o quadro: Peña, o grupo, o chefe do BC, a financeira
// A cork board in the dark office. Peña's polaroid drops and is pinned; a note GRUPO DONO DO BANCO, the red
// string between them. Then Carvallo's polaroid, a string from Peña to him (NOMEOU), a note FINANCEIRA UENO
// and the string from him to it.
function buildBoard(S, seed) {
  const { off, win } = officeBack(S, seed, -1.6);
  const board = makeCorkBoard({ w: 4.6, h: 2.8, lift: 0.45 }); board.group.position.z = -0.9; S.add(board.group);
  const pena = makePhotoPrint("pena", { w: 1.18, caption: "PEÑA" }); board.group.add(pena.group);
  const carv = makePhotoPrint("carvallo", { w: 1.18, caption: "CARVALLO" }); board.group.add(carv.group);
  const grupo = makeNoteCard("GRUPO DONO DO BANCO", { w: 1.3, h: 0.4 }); board.group.add(grupo.group);
  const finan = makeNoteCard("FINANCEIRA UENO", { w: 1.2, h: 0.4 }); board.group.add(finan.group);
  const nomeou = makeNoteCard("NOMEOU", { w: 0.76, h: 0.31, paper: "#ffd9a0" }); board.group.add(nomeou.group);
  const P = { pena: { pos: board.point(-0.59, 0.22).add(new V3(0, 0, 0.012)), rotZ: -0.05 }, carv: { pos: board.point(0.54, -0.02).add(new V3(0, 0, 0.012)), rotZ: 0.06 } };
  grupo.group.position.copy(board.point(-0.55, -0.72)).add(new V3(0, 0, 0.012)); grupo.group.rotation.z = 0.03;
  finan.group.position.copy(board.point(0.54, -0.85)).add(new V3(0, 0, 0.012)); finan.group.rotation.z = -0.04;
  nomeou.group.position.copy(board.point(-0.05, 0.8)).add(new V3(0, 0, 0.035)); nomeou.group.rotation.z = 0.05;
  const pinOf = (pr, rest) => rest.pos.clone().add(new V3(0, pr.h / 2 - pr.w * 0.06 * 0.55, 0.13));
  const pPena = pinOf(pena, P.pena), pCarv = pinOf(carv, P.carv);
  const lowPin = (pr, rest) => { const pn = makePin(); pn.scale.setScalar(0.8); pn.position.set(0, -pr.h / 2 - 0.06, -0.01); pr.group.add(pn); return rest.pos.clone().add(new V3(0, -pr.h / 2 - 0.06, 0.12)); };
  const bPena = lowPin(pena, P.pena), bCarv = lowPin(carv, P.carv);
  const pGrupo = grupo.group.position.clone().add(new V3(0, 0.11, 0.1)), pFinan = finan.group.position.clone().add(new V3(0, 0.11, 0.1));
  const s1 = makeString(bPena, pGrupo, { sag: 0.06 }); board.group.add(s1.mesh);
  const s2 = makeString(pPena, pCarv, { sag: 0.2 }); board.group.add(s2.mesh);
  const s3 = makeString(bCarv, pFinan, { sag: 0.06 }); board.group.add(s3.mesh);
  return { off, win, board, pena, carv, grupo, finan, nomeou, P, s1, s2, s3 };
}
function boardPop(obj, t, at) { const s = pop(t, at, 0.4); obj.visible = s > 0.01; obj.scale.setScalar(Math.max(0.0001, s)); }
addScene("pena", A.c10, A.c11, (S) => {
  const B = buildBoard(S, 31);
  const anim = (t) => {
    officeLook(B.off, t, 0.35); B.win.set(0.85, "#8fb0ff");
    dropPrint(B.pena, t, A.c10 + 0.05, B.P.pena); B.pena.zoom(1 + 0.12 * lin(t, A.c10, A.c11));
    B.carv.group.visible = false; B.finan.group.visible = false; B.nomeou.group.visible = false;
    boardPop(B.grupo.group, t, A.grupo - 0.35); B.s1.setProgress(lin(t, A.grupo, A.grupo + 0.7)); B.s2.setProgress(0); B.s3.setProgress(0);
    fill.position.set(-0.5, 1.8, 0.8); fill.color.set("#ffc46a"); fill.intensity = 1.3;
  };
  S.hero(B.pena.group, "polaroid peña", { when: (t) => t > A.c10 + 0.6 });
  S.hero(B.grupo.group, "nota grupo dono do banco", { when: (t) => t > A.grupo + 0.1 });
  const bA = envelope([B.pena.group], anim, A.c10 + 0.6, A.grupo - 0.4), bB = envelope([B.pena.group, B.grupo.group], anim, A.grupo, A.c11);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c10, bA, "push", { from: [0.15, 0.08, 1], pull0: 1.2, pull: 1.05 }], [A.grupo - 0.4, bB, "truck", { from: [0.1, 0.05, 1], side: 0.25, pull: 1.0 }]], 0.6)); };
});
addScene("carvallo", A.c11, A.c12, (S) => {
  const B = buildBoard(S, 31);
  const anim = (t) => {
    officeLook(B.off, t, 0.35); B.win.set(0.85, "#8fb0ff");
    dropPrint(B.pena, t, -10, B.P.pena); B.pena.zoom(1.12);
    dropPrint(B.carv, t, A.c11 + 0.05, B.P.carv); B.carv.zoom(1 + 0.14 * lin(t, A.c11, A.c12));
    B.s1.setProgress(1); B.grupo.group.visible = true; B.grupo.group.scale.setScalar(1);
    boardPop(B.nomeou.group, t, A.nomeado - 0.1); B.s2.setProgress(lin(t, A.nomeado - 0.2, A.nomeado + 0.6));
    boardPop(B.finan.group, t, A.financeira - 0.3); B.s3.setProgress(lin(t, A.financeira, A.financeira + 0.6));
    fill.position.set(0.3, 1.6, 0.9); fill.color.set("#ffc46a"); fill.intensity = 1.3;
  };
  S.hero(B.carv.group, "polaroid carvallo", { when: (t) => t > A.c11 + 0.6 && !inside(t, A.nomeado - 0.9, A.financeira - 0.3) });
  S.hero(B.pena.group, "polaroid peña", { when: (t) => inside(t, A.nomeado - 0.3, A.financeira - 0.9) });
  S.hero(B.nomeou.group, "nota nomeou", { when: (t) => inside(t, A.nomeado + 0.3, A.financeira - 0.9) });
  S.hero(B.finan.group, "nota financeira ueno", { when: (t) => t > A.financeira + 0.1 });
  const bA = envelope([B.pena.group, B.nomeou.group], anim, A.nomeado + 0.3, A.financeira - 0.5);
  const bB = envelope([B.carv.group, B.finan.group], anim, A.financeira, A.c12);
  const bW = envelope([B.carv.group], anim, A.c11 + 0.6, A.nomeado - 0.2);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c11, bW, "push", { from: [0.1, 0.06, 1], pull0: 1.12, pull: 1.02 }], [A.nomeado - 0.3, bA, "truck", { from: [0.1, 0.1, 1], side: -0.25, pull: 1.02 }], [A.financeira - 0.3, bB, "drop", { from: [0.1, 0.12, 1], rise: 0.15, pull: 1.02 }]], 0.6)); };
});

// ============================================================ 13 · oito executivos presos; Assunção virou protesto
// The bank's boardroom: a long table with a dark cloth and eight empty chairs, handcuffs on the table. The
// windows behind flash red and blue on "protesto". The camera opens up.
addScene("presos", A.c12, A.c12b, (S) => {
  const { off, win } = officeBack(S, 37, -2.4);
  const table = makeDiningTable({ w: 2.6, d: 1.0, clothColor: "#1f2a35" }); S.add(table.group);
  const top = table.topY;
  const chairs = [];
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const c = makeDiningChair({ fabric: "#2a2f38" }); c.group.position.set(-0.9 + i * 0.6, 0, s * 0.85); c.group.rotation.y = s > 0 ? Math.PI : 0; S.add(c.group); chairs.push(c); }
  const cuffs = makeHandcuffs({ s: 1.4 }); cuffs.position.set(0, top + 0.001, 0.15); cuffs.rotation.y = 0.3; S.add(cuffs);
  const anim = (t) => {
    const siren = sm(t, A.assuncao - 0.2, A.assuncao + 0.2), col = Math.floor(t * 3) % 2 ? "#ff3b3b" : "#3b6bff";
    officeLook(off, t, 0.3); off.windows(0.9, siren > 0.5 ? col : "#8fb0ff"); win.set(1, siren > 0.5 ? col : "#8fb0ff");
    popIn(cuffs, t, A.presos - 0.25, 0.35);
    fill.position.set(0, top + 0.8, 0.9); fill.color.set(siren > 0.5 ? col : "#ffc46a"); fill.intensity = 1.2 + 0.8 * siren;
  };
  S.hero(cuffs, "algemas", { when: (t) => t > A.presos + 0.15 });
  S.hero(table.group, "mesa com oito cadeiras vazias", { when: (t) => t < A.presos - 0.9 });
  const bA = envelope([table.group, ...chairs.map((c) => c.group)], anim, A.c12, A.presos), bB = envelope([cuffs], anim, A.presos, A.c12b);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c12, bA, "reveal", { from: [0.15, 0.55, 1], pull0: 1.2, pull: 1.0 }], [A.presos - 0.3, bB, "reveal", { from: [0.1, 0.7, 1], pull0: 1.6, pull: 1.15 }]], 0.6)); };
});

// ============================================================ 13b · Assunção virou protesto
// A street at night in the city: a crowd fills it, blank placards bob up and down, police lights sweep the
// walls. The camera pushes in.
addScene("protesto", A.c12b, A.c13, (S) => {
  const al = makeAlleyNight({ wallZ: -2.6, gap: 0.8, seed: 19 }); S.backdrop(al.group);
  const crowd = makeCrowd({ rows: 7, cols: 5, sx: 0.42, sz: 0.36, seed: 7, colors: ["#c9b8a6", "#3d4a5a", "#7a6a5a", "#e0a070", "#5b2a2a", "#2f3a52"] }); crowd.group.position.set(0.6, 0, -0.2); crowd.group.scale.setScalar(2.0); S.add(crowd.group);
  const signs = new THREE.Group(); signs.position.set(0.6, 0, -0.2); signs.scale.setScalar(2.0); S.add(signs);
  const r = mulberry32(23), cols = ["#f4f1ea", "#f2c200", "#e0261b", "#f4f1ea", "#7fb0ff"], items = [];
  for (let i = 0; i < 6; i++) {
    const sg = new THREE.Group(); sg.position.set((i - 2.5) * 0.36 + (r() - 0.5) * 0.1, 0, (r() - 0.5) * 1.8); signs.add(sg);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), pmat("#ffffff", { map: woodTex("#8a5a32"), roughness: 0.6 })); stick.position.y = 0.75; sg.add(stick);
    const board = new THREE.Mesh(rbox(0.46, 0.3, 0.015, 0.006), pmat(cols[i % cols.length], { roughness: 0.7 })); board.position.y = 1.18; sg.add(board);
    items.push({ sg, ph: r() * 6.28, sp: 4 + r() * 3 });
  }
  const anim = (t) => {
    al.update(t); al.siren(1, t); scene.fog.color.set("#0a0b10");
    key.intensity = 1.2; key.color.set("#ffd9b0"); hemi.intensity = 0.32; rim.intensity = 1.4; rim.color.set(Math.floor(t * 3) % 2 ? "#ff3b3b" : "#3b6bff");
    items.forEach((it) => { it.sg.position.y = 0.06 * Math.max(0, Math.sin(t * it.sp + it.ph)); it.sg.rotation.z = 0.08 * Math.sin(t * it.sp * 0.5 + it.ph); });
    fill.position.set(0, 1.6, 1.2); fill.color.set(Math.floor(t * 3) % 2 ? "#ff4a3a" : "#4a6aff"); fill.intensity = 1.8;
  };
  S.hero(crowd.group, "multidão com cartazes"); S.hero(signs, "cartazes");
  const box = envelope([crowd.group, signs], anim, A.c12b, A.c13);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c12b, A.c13), { zone: "stage", from: [0.1, 0.2, 1], pull0: 1.2, pull: 1.0 })); };
});

// ============================================================ 14 · Peña anunciou a renúncia; os deputados abriram o impeachment, 78 a 0
// The letter RENÚNCIA lands on a desk in the office; then the Congress of Paraguay in a photo frame and,
// beside it, a vote board that counts up to 78 × 0. The camera pushes in; a jolt on the zero.
addScene("renuncia", A.c13, A.c14, (S) => {
  const { off, win } = officeBack(S, 41, -2.4);
  const desk = new THREE.Mesh(rbox(2.2, 0.06, 1.1, 0.02), pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 })); desk.position.set(-3.2, 0.75, 0); S.add(desk);
  const letter = makeCertificate("RENÚNCIA", { w: 0.62, d: 0.82 }); letter.group.position.set(-3.2, 0.78, 0.02); letter.group.rotation.y = -0.1; S.add(letter.group);
  const fr = makePhotoFrame("congresso", { w: 1.7, name: "CONGRESSO DO PARAGUAI" }); if (fr.plate) fr.plate.userData.plate.detail = true; fr.group.position.set(-0.55, 0, 0); S.add(fr.group);
  const sb = makeScoreboard({ w: 1.5, h: 0.86, legH: 0.6 }); sb.group.position.set(1.3, 0, 0.1); sb.group.rotation.y = -0.2; S.add(sb.group);
  let last = "";
  const CUT = A.minutos - 0.1;
  const anim = (t) => {
    officeLook(off, t, 0.32); win.set(0.85, "#8fb0ff");
    const k = eOut(lin(t, A.c13 + 0.05, A.c13 + 0.6)); letter.group.position.y = lerp(1.4, 0.78, k); letter.group.rotation.z = 0.3 * (1 - k); letter.group.visible = t > A.c13;
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, CUT, CUT + 0.7))); fr.zoom(1 + 0.12 * lin(t, CUT, A.c14));
    const cnt = sm(t, A.setenta - 0.9, A.setenta - 0.15), z = t > A.zero - 0.05, key2 = cnt.toFixed(2) + z;
    if (key2 !== last) { last = key2; sb.paint((x, W, H) => paintVote(x, W, H, cnt, z)); }
    fill.position.set(t < CUT ? -3.2 : 0.2, 1.6, 1.2); fill.color.set(z ? "#ff6a4a" : "#ffc46a"); fill.intensity = (t < CUT ? 2.4 : 1.3) + 0.8 * beat(t, A.zero, 0.5);
  };
  S.hero(letter.group, "carta de renúncia", { when: (t) => inside(t, A.c13 + 0.65, CUT) });
  const SC = A.setenta - 0.5;
  S.hero(fr.group, "porta-retrato do congresso", { when: (t) => inside(t, CUT + 0.75, SC - 0.5) });
  S.hero(sb.group, "placar 78 a 0", { when: (t) => t > SC });
  S.solid(letter.group, "carta", { restsOn: [desk] }); S.solid(desk, "mesa");
  const bA = envelope([letter.group], anim, A.c13 + 0.65, CUT), bB = envelope([fr.group], anim, CUT + 0.75, A.c14), bC = envelope([sb.group], anim, CUT, A.c14);
  return (t) => {
    anim(t);
    let p = t < CUT ? CAM.move(bA, "push", lin(t, A.c13, CUT), { zone: "stage", from: [0.1, 1, 0.75], pull0: 1.3, pull: 1.05 }) : shotTrack(t, [[CUT, bB, "orbit", { from: [0.05, 0.12, 1], deg: 24, pull: 1.05 }], [SC, bC, "push", { from: [-0.15, 0.1, 1], pull0: 1.15, pull: 1.0 }]], 0.5);
    p = CAM.shake(p, t, A.zero, 0.025, 0.35); CAM.apply(p);
  };
});

// ============================================================ 15 · ex-presidente vira senador vitalício, se não for condenado
// A two-pan scale in the office: on one pan a little senator's chair with VITALÍCIO, on the other the stamp
// CONDENADO? It rocks, undecided; on "agora é com o Senado" it stops level. The camera swings round.
addScene("vitalicio", A.c14, A.c15, (S) => {
  const { off, win } = officeBack(S, 47, -2.0);
  const sc = makeTwoPanScale({ arm: 0.52, height: 1.0, panR: 0.32, chain: 0.62 }); S.add(sc.group);
  const chair = makeDiningChair({ fabric: "#1f3d5a" }); chair.group.scale.setScalar(0.36); chair.group.rotation.y = 0.35; sc.holders[0].add(chair.group);
  const gavel = makeGavel({ s: 1.2 }); gavel.group.rotation.y = -0.5; sc.holders[1].add(gavel.group);
  const cardL = makePlaceCard("VITALÍCIO", { w: 0.58, h: 0.17 }); cardL.group.position.set(-0.5, 0, 0.55); S.add(cardL.group);
  const cardR = makePlaceCard("CONDENADO?", { w: 0.68, h: 0.17, bg: "#5a1410" }); cardR.group.position.set(0.56, 0, 0.55); S.add(cardR.group);
  const anim = (t) => {
    officeLook(off, t, 0.35); win.set(0.85, "#8fb0ff");
    const settle = sm(t, A.agora - 0.2, A.senado);
    sc.tilt((0.16 * Math.sin((t - A.c14) * 2.6) + 0.1 * beat(t, A.condenado - 0.1, 0.8)) * (1 - settle));
    popIn(cardL.group, t, A.vitalicio - 0.3, 0.35); popIn(cardR.group, t, A.condenado - 0.3, 0.35);
    fill.position.set(0, 1.4, 1.2); fill.color.set("#ffc46a"); fill.intensity = 1.2 + 0.6 * beat(t, A.condenado, 0.6);
  };
  S.hero(sc.group, "balança com cadeira e martelo de juiz");
  S.hero(cardL.group, "placa vitalício", { when: (t) => t > A.vitalicio + 0.1 }); S.hero(cardR.group, "placa condenado", { when: (t) => t > A.condenado + 0.1 });
  const box = envelope([sc.group, cardL.group, cardR.group], anim, A.condenado, A.c15);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c14, A.c15), { zone: "stage", from: [0, 0.18, 1], deg: 26, pull: 1.0 })); };
});

// ============================================================ 16 · imagina você com 50 mil lá: a garantia devolve até uns 38 mil
// In front of the taped-off bank: your stack of 25 bundles (2 mil each) on a plinth VOCÊ. A red laser line at
// 19 bundles (38 mil) with a plate US$ 38 MIL; the six bundles above it hop back over the tape into the bank
// (the rest depends on what is left) and a padlock drops on them. The camera rises.
addScene("garantia", A.c15, A.c16, (S) => {
  const city = cityBack(S, 53);
  const tw = makeStiltBank({ seed: 3 }); S.add(tw.group);
  for (const c of tw.cols) c.setFill(OCA_FILL);
  tw.cols[1].breakOff(1); tw.cols[0].breakOff(1);
  const tape = makeCautionTape(TAPE_PTS, { h: 0.5, sign: { seg: 1, text: "INTERDITADO", w: 1.5, h: 0.37 } }); tape.group.position.y = SB.PH; S.add(tape.group);
  const pl = makeLabelPlinth("VOCÊ", { w: 0.7, h: 0.32, d: 0.5, plateH: 0.18 }); pl.group.position.set(1.0, SB.PH, 2.0); S.add(pl.group);
  const N = 25, LINE = 19, BH = 0.036, bundles = [];
  for (let i = 0; i < N; i++) { const b = makeCashBundle({ w: 0.36, d: 0.17, h: BH }); S.add(b); bundles.push(b); }
  const greyMats = []; for (let i = LINE; i < N; i++) bundles[i].traverse((n) => { if (n.isMesh) (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => greyMats.push(m)); });
  const laser = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.008, 0.36), new THREE.MeshBasicMaterial({ color: "#ff3b1f", transparent: true, opacity: 0.85, toneMapped: false })); laser.userData.noShadow = true; S.add(laser);
  const tag = makePlate("US$ 38 MIL", 0.6, 0.16, { bg: RED, fg: "#ffffff" }); S.add(tag);
  const rest = makePlate("O RESTO", 0.48, 0.14, { bg: "#2a2d31", fg: "#ffffff" }); S.add(rest);
  const lock = makePadlock({ s: 0.62 }); S.add(lock.group);
  const base = SB.PH + pl.top, cx = 1.0, cz = 2.0, topY = base + N * BH;
  const white = new THREE.Color("#ffffff"), grey = new THREE.Color("#5c5f66");
  const anim = (t) => {
    cityLook(city, t, { siren: 0.4 }); tw.open(0); tw.lights(1); tape.set(1);
    bundles.forEach((b, i) => {
      const at = A.imagina2 + i * 0.045, k = eOut(lin(t, at, at + 0.3)); b.visible = t > at;
      b.position.set(cx + Math.sin(i * 2.3) * 0.006, base + i * BH + 0.5 * (1 - k), cz + Math.cos(i * 1.7) * 0.006); b.rotation.y = Math.sin(i * 1.1) * 0.05;
    });
    const gk = sm(t, A.resto - 0.1, A.resto + 0.4); greyMats.forEach((m) => m.color.copy(white).lerp(grey, gk));
    const lv = t > A.trinta - 0.6; laser.visible = lv; tag.visible = lv;
    laser.position.set(cx, base + LINE * BH + 0.004, cz); laser.scale.x = Math.max(0.01, eOut(lin(t, A.trinta - 0.6, A.trinta - 0.2)));
    tag.position.set(cx - 0.56, base + LINE * BH + 0.004, cz); tag.scale.setScalar(Math.max(0.001, pop(t, A.trinta - 0.45, 0.3)));
    rest.position.set(cx - 0.5, base + (LINE + 3) * BH, cz); rest.visible = t > A.resto; rest.scale.setScalar(Math.max(0.001, pop(t, A.resto, 0.3)));
    const lk = eOut(lin(t, A.sobrar - 0.5, A.sobrar)); lock.group.visible = t > A.sobrar - 0.5; lock.group.position.set(cx, topY + 0.6 * (1 - lk), cz); lock.open(0);
    fill.position.set(cx, 1.4, 2.8); fill.color.set("#ffd59a"); fill.intensity = 1.4;
  };
  S.hero(pl.group, "pedestal você"); S.hero(tag, "placa 38 mil", { when: (t) => t > A.trinta });
  S.hero(rest, "placa o resto", { when: (t) => t > A.resto + 0.3 }); S.hero(lock.group, "cadeado no resto", { when: (t) => t > A.sobrar + 0.1 });
  S.solid(tw.plaza, "praça");
  const bA = envelope([pl.group, ...bundles, tag], anim, A.imagina2 + 1.4, A.resto - 0.2), bB = envelope([pl.group, ...bundles, tag, rest, lock.group], anim, A.resto, A.c16);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c15, bA, "crane", { from: [-0.2, 0.28, 1], rise: 0.2, pull: 1.02 }], [A.resto - 0.2, bB, "push", { from: [-0.25, 0.2, 1], pull0: 1.15, pull: 1.0 }]], 0.6)); };
});

// ============================================================ 17 · a pergunta: os donos ou o Banco Central?
// The hollow bank in the middle; on its right the owners' three office blocks with DONOS; on its left a plinth
// BANCO CENTRAL with the inspector's hammer lying on it. The camera swings from one side to the other.
addScene("pergunta", A.c16, A.end, (S) => {
  const city = cityBack(S, 61);
  const tw = makeStiltBank({ seed: 3 }); S.add(tw.group);
  for (const c of tw.cols) c.setFill(OCA_FILL);
  tw.cols[1].breakOff(1); tw.cols[0].breakOff(1);
  const O = buildOwners(S, tw, { tubes: false });
  O.pl.group.visible = false;
  const dp = makeLabelPlinth("DONOS", { w: 0.78, h: 0.5, d: 0.4, plateH: 0.4 }); dp.group.position.set(0.96, SB.PH, 1.3); S.add(dp.group);
  const bc = makeLabelPlinth("BANCO CENTRAL", { w: 1.9, h: 0.46, d: 0.4, plateH: 0.34 }); bc.group.position.set(-0.4, SB.PH, 1.3); S.add(bc.group);
  const hm = makeInspectorArm(); const hammer = hm.wrist; hm.group.remove(hammer);
  hammer.children.slice(0, 5).forEach((c) => { c.visible = false; }); hammer.rotation.set(0, 0, Math.PI / 2); hammer.position.set(-0.4 - 0.13 * hm.s, SB.PH + bc.top + 0.028 * hm.s, 1.25); S.add(hammer);
  const anim = (t) => {
    cityLook(city, t); tw.open(1); tw.lights(1);
    O.cos.forEach((c) => c.fill(1)); popIn(dp.group, t, A.donos3 - 0.35, 0.35); popIn(bc.group, t, A.bc4 - 0.35, 0.35); hammer.visible = t > A.bc4 - 0.1;
    fill.position.set(t < A.ou ? 1.6 : -1.4, 1.0, 1.5); fill.color.set("#ffc46a"); fill.intensity = 1.4;
  };
  S.hero(tw.front, "colunas ocas"); S.hero(dp.group, "placa donos", { when: (t) => t > A.donos3 });
  S.hero(bc.group, "pedestal banco central", { when: (t) => t > A.bc4 });
  const box = envelope([tw.front, bc.group, dp.group], anim, A.bc4, A.end);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c16, A.end), { zone: "stage", from: [0, 0.3, 1], deg: 20, pull: 1.0 })); };
});
