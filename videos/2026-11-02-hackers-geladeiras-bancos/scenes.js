// ============================================================================
// videos/2026-11-02-hackers-geladeiras-bancos/scenes.js
// A temporada de hacks: hackers esquentam os freezers de 700 supermercados na França (out/2026) e de
// novo na Bélgica, Luxemburgo, Suécia e Estônia (02/11); ninguém pediu resgate. Como: a central das
// geladeiras, velha e ligada na internet. E com dinheiro é igual: Binance (US$ 6,3 bi), o acesso ao Pix
// vendido por R$ 15 mil (C&M), o Pix fora do ar no Banco do Nordeste.
// Analogia única: a chave-mestra do hotel (um cartão abre todos os quartos; ninguém arromba porta).
// Times come from audio/words.json (A below).
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops
// (supermarket at night, dark office, city of freezers, hotel corridor, vault room, living room) fill
// the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  c700: 1.14, supers: 1.92, noite: 3.4, c1: 4.45,
  abre: 5.26, freezer: 5.74, sai: 7.14, calor: 7.36, g50: 8.32, graus: 8.9, c2: 9.55,
  filme: 10.04, franca: 10.98, comida: 12.32, lixo: 12.76, freezer2: 13.46, fogo: 14.38, c3: 14.9,
  assustador: 15.56, ninguem: 16.68, resgate: 17.26, ninguem2: 18.28, quem: 18.82, c4: 19.42,
  esquenta: 20.14, f700: 20.56, freezers: 21.34, longe: 22.3, c5: 22.7,
  chave: 23.32, hotel: 24.4, cartao: 25.04, abreT: 25.6, todos: 25.82, quartos: 26.48, ninguemP: 27.22, arrombar: 27.82, c6: 28.9,
  mercado: 29.34, chaveB: 30.32, central: 31.38, comanda: 32.02, geladeiras: 33.06, ligada: 34.0, internet: 34.54, c7: 35.3,
  velhas: 35.98, atualizacao: 36.8, falha: 38.16, descobrir: 38.96, senha: 39.72, data: 40.58, dia: 41.2, c8: 41.55,
  entraram: 42.16, ligaram: 43.2, degelo: 43.7, tiraram: 44.38, limite: 45.12, temperatura: 45.66, c9: 46.25,
  parou: 46.9, nesta: 47.52, madrugada: 48.46, belgica: 49.4, estonia: 51.76, c10: 52.35,
  dinheiro: 52.76, funciona: 53.5, c11: 54.05,
  levaram: 55.7, b63: 56.32, bilhoes: 57.46, binance: 58.84, cripto: 60.06, m20: 61.08, minutos: 61.38, fbi: 62.46, coreia: 63.52, c12: 64.45,
  brasil: 64.8, venderam: 65.68, chaveC: 66.6, c13: 67.42,
  funcionario: 68.84, pix: 71.02, vendeu: 71.32, m15: 72.74, sumiram: 74.24, m500: 75.2, c14: 76.5,
  imagina2: 76.9, app: 78.34, pix2: 79.54, nao: 79.78, janeiro: 80.92, ataque: 82.1, nordeste: 83.72, c15: 84.45,
  pagou: 85.44, empresas: 86.74, padrao: 87.8, arromba: 89.4, cofre: 90.06, pega: 90.54, chaveD: 91.04, c16: 91.85,
  nada: 93.86, entao: 94.5, bagunca: 95.76, teste: 97.46, maior: 98.12, end: 100.6,
};
// In-scene cuts (also listed in video.json → cuts).
const B3 = A.comida - 0.1, B8 = A.falha - 0.45, B14 = A.sumiram - 0.35;

// The store at night behind every supermarket shot: cold light, the far freezers turning red with `heat`.
function storeLook(set, t, heat, lights = 0.55) {
  set.update(t); set.lights(lights); set.heat(heat); scene.fog.color.set("#0c1016");
  key.intensity = 1.7; key.color.set("#e2ecff"); hemi.intensity = 0.38; hemi.color.set("#c4d8ff"); hemi.groundColor.set("#141210");
}

// ---------------------------------------------------------------- local pieces
// Row of n glass-door freezers side by side (4 cm apart). Origin: floor centre. API { group, list }
function makeFreezerRow(n, { gap = 0.04, seed = 3 } = {}) {
  const g = new THREE.Group(), list = [];
  for (let i = 0; i < n; i++) { const f = makeGlassFreezer({ seed: seed + i * 7 }); f.group.position.x = (i - (n - 1) / 2) * (f.w + gap); g.add(f.group); list.push(f); }
  return { group: g, list };
}

// Hot air pouring out of an open freezer: soft white puffs that rise and spread. Decor. API { group, update(t, k) }
function makeSteam(n = 18, seed = 5) {
  const r = mulberry32(seed), g = new THREE.Group(), items = [];
  for (let i = 0; i < n; i++) { const s = sprite(BOKEH, 0.55); s.material.color.set("#f3efe8"); s.material.opacity = 0; s.userData.decor = true; g.add(s); items.push({ s, ox: (r() - 0.5) * 0.6, oy: r() * 1.4, ph: r(), sp: 0.35 + r() * 0.35 }); }
  g.userData.decor = true;
  return { group: g, update(t, k) { items.forEach((it) => { const u = (t * it.sp + it.ph) % 1; it.s.position.set(it.ox * (1 + u), it.oy + u * 0.8, 0.1 + u * 0.7); it.s.material.opacity = clamp(k) * 0.32 * Math.sin(Math.PI * u); setSpriteScale(it.s, 0.6 + 1.3 * u); }); } };
}

// Fire at the foot of a freezer: flame tongues in three layers (red outside, orange, a yellow core), additive so
// they glow, a halo of orange light, thick dark smoke rolling up, an orange point light. Spread across `w`.
// API { group, update(t, k) }
function makeFreezerFire({ w = 0.75, seed = 7 } = {}) {
  const r = mulberry32(seed), g = new THREE.Group(), tongues = [], glows = [];
  const layer = (col, rad, hgt, n, op) => {
    for (let i = 0; i < n; i++) {
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      const hh = hgt * (0.6 + r() * 0.7), c = new THREE.Mesh(new THREE.ConeGeometry(rad * (0.7 + r() * 0.6), hh, 14, 1, true), m);
      c.userData.f = { x: (r() - 0.5) * w, z: (r() - 0.5) * 0.12, h: hh, ph: r() * 6, sp: 9 + r() * 10 }; g.add(c); tongues.push(c);
    }
  };
  layer("#ff3a0a", 0.17, 1.35, 9, 0.55); layer("#ff8a1a", 0.12, 1.0, 9, 0.65); layer("#ffd36b", 0.065, 0.58, 8, 0.85);
  for (let i = 0; i < 6; i++) { const sp = sprite(BOKEH, 0.7 + r() * 0.5); sp.material.color.set("#ff7a2a"); sp.material.blending = THREE.AdditiveBlending; sp.userData.decor = true; sp.userData.f = { x: (r() - 0.5) * w, ph: r() * 6 }; g.add(sp); glows.push(sp); }
  const smoke = []; for (let i = 0; i < 14; i++) { const m = sprite(BOKEH, 0.5); m.material.color.set("#2e2a27"); m.material.opacity = 0; m.userData.decor = true; m.userData.f = { ph: i / 14, x: (r() - 0.5) * w * 0.8 }; g.add(m); smoke.push(m); }
  const light = new THREE.PointLight("#ff7a2a", 0, 5, 1.5); light.position.set(0, 0.5, 0.4); g.add(light);
  return {
    group: g,
    update(t, k) {
      const kk = clamp(k);
      tongues.forEach((c) => { const f = c.userData.f, fl = kk * (0.75 + 0.22 * Math.sin(t * f.sp + f.ph) + 0.1 * Math.sin(t * f.sp * 2.3 + f.ph)); c.visible = fl > 0.03; c.scale.set(Math.max(0.001, kk * (0.9 + 0.1 * Math.sin(t * 13 + f.ph))), Math.max(0.001, fl), Math.max(0.001, kk)); c.position.set(f.x + 0.02 * Math.sin(t * 7 + f.ph), f.h * fl / 2, f.z); });
      glows.forEach((sp) => { sp.position.set(sp.userData.f.x, 0.3, 0.05); sp.material.opacity = 0.55 * kk * (0.8 + 0.2 * Math.sin(t * 11 + sp.userData.f.ph)); });
      smoke.forEach((m) => { const u = (t * 0.4 + m.userData.f.ph) % 1; m.visible = kk > 0.05; m.position.set(m.userData.f.x + 0.25 * Math.sin(u * 4 + m.userData.f.ph * 9), 0.9 + u * 2.0, -0.1 + u * 0.3); setSpriteScale(m, 1 + 3 * u); m.material.opacity = kk * 0.6 * Math.sin(Math.PI * u); });
      light.intensity = 4 * kk * (0.85 + 0.15 * Math.sin(t * 29));
    },
  };
}

// Wooden desk with a leather top. Origin: floor centre; top at h. API { group, top }
function makeWorkDesk({ w = 2.6, d = 1.4, h = 0.78, leather = "#22302a" } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat(leather, { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}

// Desk monitor on a stand, its screen a live canvas (1024 wide). Origin: base centre on the desk; faces +z.
// API { group, paint(fn) } — fn(ctx, W, H)
function makeDeskMonitor({ w = 1.0 } = {}) {
  const g = new THREE.Group(), h = w * 0.6, blk = pmat("#151619", { roughness: 0.35, clearcoat: 0.5, metalness: 0.3 });
  const base = new THREE.Mesh(rbox(0.34, 0.02, 0.24, 0.008), blk); base.position.y = 0.01; g.add(base);
  const neck = new THREE.Mesh(rbox(0.07, 0.36, 0.04, 0.01), blk); neck.position.set(0, 0.2, -0.05); g.add(neck);
  const panel = new THREE.Mesh(rbox(w + 0.04, h + 0.04, 0.045, 0.012), blk); panel.position.set(0, 0.36 + h / 2, -0.02); g.add(panel);
  const c = makeCanvas(1024, Math.round(1024 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, 0.36 + h / 2, 0.0035); g.add(scr);
  g.add(contactShadow(0.7, 0.5));
  return { group: g, paint: (fn) => { fn(x, c.width, c.height); tex.needsUpdate = true; } };
}

// Empty office chair: five-star base with casters, gas column, fabric seat and back, armrests.
// The swivel (seat, back, arms) turns about y. Origin: floor centre; the seat faces +z. API { group, swivel }
function makeOfficeChair() {
  const g = new THREE.Group(), blk = pmat("#1b1c1f", { roughness: 0.45, metalness: 0.4 }), fab = mat("#ffffff", { map: tileTex(fabricTex("#2b2f36"), 1, 1), roughness: 0.95 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, leg = new THREE.Group(); leg.rotation.y = a; g.add(leg);
    const bar = new THREE.Mesh(rbox(0.05, 0.04, 0.3, 0.01), blk); bar.position.set(0, 0.08, 0.15); leg.add(bar);
    const cst = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), blk); cst.position.set(0, 0.035, 0.29); leg.add(cst);
  }
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.34, 14), pmat("#8d9096", { metalness: 0.9, roughness: 0.3 })); col.position.y = 0.27; g.add(col);
  const sw = new THREE.Group(); sw.position.y = 0.44; g.add(sw);
  const seat = new THREE.Mesh(rbox(0.52, 0.09, 0.5, 0.04), fab); seat.position.y = 0.05; sw.add(seat);
  const back = new THREE.Mesh(rbox(0.48, 0.62, 0.07, 0.04), fab); back.position.set(0, 0.46, -0.24); back.rotation.x = -0.12; sw.add(back);
  const spine = new THREE.Mesh(rbox(0.06, 0.3, 0.03, 0.01), blk); spine.position.set(0, 0.2, -0.27); sw.add(spine);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(rbox(0.03, 0.2, 0.03, 0.008), blk); post.position.set(s * 0.27, 0.18, 0); sw.add(post); const pad = new THREE.Mesh(rbox(0.06, 0.03, 0.26, 0.012), blk); pad.position.set(s * 0.27, 0.29, 0.02); sw.add(pad); }
  g.add(contactShadow(0.9, 0.9));
  return { group: g, swivel: sw };
}

// Outline of mainland France (lon, lat), clockwise from Dunkirk: enough points to read as "the hexagon".
const FRANCE_OUTLINE = [[2.55, 51.08], [4.2, 50.05], [4.82, 50.15], [5.8, 49.55], [6.4, 49.45], [8.2, 49.0], [7.55, 47.6], [6.95, 47.45], [6.0, 46.3], [6.8, 45.9], [7.0, 45.2], [6.6, 44.4], [7.5, 43.8], [6.8, 43.4], [6.0, 43.1], [5.0, 43.4], [4.2, 43.5], [3.1, 43.0], [3.15, 42.45], [1.8, 42.5], [0.0, 42.7], [-1.75, 43.35], [-1.25, 44.6], [-1.2, 46.0], [-2.2, 47.1], [-4.4, 47.9], [-4.75, 48.4], [-3.0, 48.85], [-1.6, 48.65], [-1.9, 49.7], [-1.2, 49.35], [0.1, 49.5], [1.6, 50.2], [1.6, 50.9]];
const FRANCE_CITIES = [[2.35, 48.85, 3], [4.84, 45.76, 1.4], [5.37, 43.3, 1.2], [3.06, 50.63, 1], [-0.58, 44.84, 1], [1.44, 43.6, 1], [-1.55, 47.22, 1], [7.75, 48.58, 0.8], [7.26, 43.7, 0.8], [-1.68, 48.11, 0.8]];
function inFrance(lon, lat) { let ins = false; for (let i = 0, j = FRANCE_OUTLINE.length - 1; i < FRANCE_OUTLINE.length; j = i++) { const [xi, yi] = FRANCE_OUTLINE[i], [xj, yj] = FRANCE_OUTLINE[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) ins = !ins; } return ins; }
// Operations table with a lit map of France and 700 store lights on it (denser around the big cities). The
// map lies on the table top; north is away from the camera. update(t, wave): a red wave spreads from Paris
// over every store. Origin: floor centre. API { group, top, update(t, wave) }
function makeStoreMap({ size = 3.2, n = 700, seed = 9 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), h = 0.82, s = size / 9.2;
  const P = (lon, lat) => [(lon - 1.7) * 0.688 * s, -(lat - 46.75) * s];
  const c = makeCanvas(1024, 1024), x = c.getContext("2d"), toC = ([px, pz]) => [512 + (px / (size + 0.5)) * 1024, 512 + (pz / (size + 0.5)) * 1024];
  x.fillStyle = "#0b1119"; x.fillRect(0, 0, 1024, 1024);
  x.strokeStyle = "rgba(120,170,230,0.12)"; x.lineWidth = 2; for (let i = 0; i <= 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke(); }
  x.beginPath(); FRANCE_OUTLINE.forEach(([lo, la], i) => { const [cx, cy] = toC(P(lo, la)); i ? x.lineTo(cx, cy) : x.moveTo(cx, cy); }); x.closePath();
  x.fillStyle = "#16283d"; x.fill(); x.shadowColor = "#4fb3ff"; x.shadowBlur = 18; x.strokeStyle = "#6cc4ff"; x.lineWidth = 6; x.stroke(); x.shadowBlur = 0;
  const T = 0.08, edge = pmat("#15181d", { metalness: 0.6, roughness: 0.35 });
  const top = new THREE.Mesh(rbox(size + 0.5, T, size + 0.5, 0.03), [edge, edge, new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false }), edge, edge, edge]); top.position.y = h - T / 2; g.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = new THREE.Mesh(rbox(0.12, h - T, 0.12, 0.02), edge); leg.position.set(sx * (size / 2 - 0.1), (h - T) / 2, sz * (size / 2 - 0.1)); g.add(leg); }
  const pts = [];
  while (pts.length < n) {
    let lo, la;
    if (r() < 0.45) { const cw = FRANCE_CITIES.reduce((a, cc) => a + cc[2], 0); let k = r() * cw, cc = FRANCE_CITIES[0]; for (const q of FRANCE_CITIES) { k -= q[2]; if (k <= 0) { cc = q; break; } } lo = cc[0] + (r() + r() + r() - 1.5) * 0.9; la = cc[1] + (r() + r() + r() - 1.5) * 0.65; }
    else { lo = -4.8 + r() * 13; la = 42.4 + r() * 8.8; }
    if (inFrance(lo, la)) { const [px, pz] = P(lo, la); const [ppx, ppz] = P(2.35, 48.85); pts.push({ px, pz, d: Math.hypot(px - ppx, pz - ppz), ph: r() * 6 }); }
  }
  const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), n), o = new THREE.Object3D();
  pts.forEach((p, i) => { o.position.set(p.px, h + 0.025, p.pz); o.updateMatrix(); dots.setMatrixAt(i, o.matrix); });
  g.add(dots);
  const glowM = makeFloorGlow(size * 1.2, size * 1.2, { color: "#4fb3ff", opacity: 0.2 }); glowM.position.y = h + 0.003; g.add(glowM);
  g.add(contactShadow(size + 1.2, size + 1.2));
  const maxD = Math.max(...pts.map((p) => p.d)), cold = new THREE.Color("#7fd0ff"), hot = new THREE.Color("#ff3b1f"), col = new THREE.Color();
  return {
    group: g, top: h,
    update(t, wave) {
      pts.forEach((p, i) => { const k = clamp((wave * 1.25 - p.d / maxD) * 5); dots.setColorAt(i, col.copy(cold).lerp(hot, k).multiplyScalar(0.8 + 0.2 * Math.sin(t * 7 + p.ph))); });
      dots.instanceColor.needsUpdate = true; glowM.material.color.copy(cold).lerp(hot, clamp(wave));
    },
  };
}

// Tiled square store pillar from floor to ceiling. Origin: floor centre. API { group, front }
function makeStorePillar({ s = 0.6, h = 4.4 } = {}) {
  const g = new THREE.Group();
  const col = new THREE.Mesh(new THREE.BoxGeometry(s, h, s), pmat("#6d7a8a", { map: tileTex(retailFloorTex(), s / 1.2, h / 1.2), roughness: 0.25, clearcoat: 0.5 })); col.position.y = h / 2; g.add(col);
  const sk = new THREE.Mesh(new THREE.BoxGeometry(s + 0.02, 0.12, s + 0.02), pmat("#3a3d42", { roughness: 0.5 })); sk.position.y = 0.06; g.add(sk);
  g.add(contactShadow(s + 0.5, s + 0.5));
  return { group: g, front: s / 2 };
}

// Steel service cart: two trays with raised rims, a push handle, four casters. Origin: floor centre. API { group, top }
function makeServiceCart({ w = 0.75, d = 0.48, h = 0.95 } = {}) {
  const g = new THREE.Group(), st = pmat("#9aa1a8", { metalness: 0.85, roughness: 0.32 }), blk = pmat("#1b1c1f", { roughness: 0.6 });
  for (const y of [h - 0.03, 0.32]) {
    const tray = new THREE.Mesh(rbox(w, 0.02, d, 0.008), st); tray.position.y = y; g.add(tray);
    for (const [bw, bd, x, z] of [[w, 0.015, 0, d / 2], [w, 0.015, 0, -d / 2], [0.015, d, w / 2, 0], [0.015, d, -w / 2, 0]]) { const rim = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.05, bd), st); rim.position.set(x, y + 0.025, z); g.add(rim); }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, h - 0.1, 10), st); post.position.set(sx * (w / 2 - 0.02), 0.08 + (h - 0.1) / 2, sz * (d / 2 - 0.02)); g.add(post);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 16), blk); wheel.rotation.x = Math.PI / 2; wheel.position.set(sx * (w / 2 - 0.02), 0.04, sz * (d / 2 - 0.02)); g.add(wheel);
  }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, d, 10), st); handle.rotation.x = Math.PI / 2; handle.position.set(-w / 2 - 0.08, h + 0.08, 0); g.add(handle);
  for (const sz of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), st); arm.position.set(-w / 2 - 0.04, h + 0.04, sz * (d / 2 - 0.02)); arm.rotation.z = -0.5; g.add(arm); }
  const box = new THREE.Mesh(rbox(0.32, 0.2, 0.26, 0.01), pmat("#ffffff", { map: cardboardTex(), roughness: 0.85 })); box.position.set(0.12, 0.43, 0); g.add(box);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, top: h };
}

// The store's control corner: a pillar with the control cabinet (router on top), three freezers to its right,
// cables from the cabinet's glands down the pillar and along the floor to each freezer; a side table with a
// flip calendar; a padlock hanging on the cabinet's staple. Positions are fixed so scenes 7–9 match.
// API { pillar, cab, router, row, wires, table, cal, lock, cabG }
function buildControlCorner(S, { calendar = false, padlock = false } = {}) {
  const px = -1.05, pz = -0.4, k = 1.2;   // the cabinet at 1.2× (its name reads in the wide shots)
  const pillar = makeStorePillar({ s: 0.8 }); pillar.group.position.set(px, 0, pz); S.add(pillar.group);
  const cab = makeControlCabinet({ name: "CENTRAL" }); cab.group.scale.setScalar(k); cab.group.position.set(px, 1.5, pz + pillar.front); S.add(cab.group);
  cab.group.updateMatrixWorld(true);
  const router = makeWifiRouter({ s: 1.2 }); router.group.position.set(px, 1.5 + k * cab.h / 2, pz + pillar.front + k * cab.d / 2); S.add(router.group);
  const rowX = 0.82, row = makeFreezerRow(3, { seed: 13 }); row.group.position.set(rowX, 0, -0.45); S.add(row.group);
  const wires = [];
  row.list.forEach((f, i) => {
    const gl = cab.group.localToWorld(cab.gland(i)), fx = rowX + f.group.position.x;
    const w = makeWire([[gl.x, gl.y, gl.z], [gl.x + 0.02, 0.5, gl.z + 0.02], [gl.x + 0.15, 0.03, gl.z + 0.25 + i * 0.12], [fx - 0.2, 0.03, 0.2 + i * 0.04], [fx, 0.03, 0.05]], 0.016);
    S.add(w.mesh); wires.push(w);
  });
  let table = null, cal = null, lock = null;
  if (calendar) {
    table = makeServiceCart(); table.group.position.set(px - 1.0, 0, pz + 0.85); S.add(table.group);
    cal = makeFlipCalendar(["01 NOV", "02 NOV"], { w: 0.5, h: 0.42 }); cal.group.position.set(px - 1.0, table.top - 0.02, pz + 0.86); cal.group.rotation.y = 0.35; S.add(cal.group);
  }
  if (padlock) {
    const s = 0.34 * k; lock = makePadlock({ s }); const hp = cab.group.localToWorld(cab.hasp.clone()); lock.group.position.set(hp.x, hp.y - 0.66 * s, hp.z); S.add(lock.group);
  }
  return { pillar, cab, router, row, wires, table, cal, lock };
}

// Cabinet screens. Status page: the header, four freezer rows with their temperature, a version line.
function paintCabStatus(x, W, H, { temps = [-18, -18, -18, -18], old = 0 } = {}) {
  x.fillStyle = "#0d1a24"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#16384e"; x.fillRect(0, 0, W, 70); x.fillStyle = "#cfe8ff"; x.font = "800 40px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("FREEZERS", 24, 36);
  temps.forEach((v, i) => { const y = 112 + i * 62, hot = v > 4; x.fillStyle = "#14293a"; x.fillRect(20, y - 26, W - 40, 52); x.fillStyle = "#9fc3e0"; x.font = "700 34px Inter"; x.textAlign = "left"; x.fillText(`FREEZER ${i + 1}`, 36, y); x.fillStyle = hot ? "#ff5a3a" : "#7fe0ff"; x.font = "900 40px Inter"; x.textAlign = "right"; x.fillText(`${Math.round(v)}°C`, W - 36, y); });
  if (old > 0) { x.globalAlpha = clamp(old); x.fillStyle = "#b51f17"; x.fillRect(0, H - 110, W, 110); x.fillStyle = "#ffffff"; x.font = "900 52px Inter"; x.textAlign = "center"; x.fillText("SEM ATUALIZAÇÃO", W / 2, H - 55); x.globalAlpha = 1; }
}
// Login page: the password field fills with dots; then ACESSO LIBERADO.
function paintCabLogin(x, W, H, { dots = 0, ok = 0, t = 0 } = {}) {
  x.fillStyle = "#0d1a24"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#16384e"; x.fillRect(0, 0, W, 70); x.fillStyle = "#cfe8ff"; x.font = "800 40px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("ACESSO REMOTO", 24, 36);
  x.fillStyle = "#9fc3e0"; x.font = "800 40px Inter"; x.fillText("SENHA", 40, 140);
  x.fillStyle = "#14293a"; roundRect(x, 36, 178, W - 72, 96, 18); x.fill(); x.strokeStyle = ok > 0.5 ? "#2fe37a" : ORANGE; x.lineWidth = 5; roundRect(x, 36, 178, W - 72, 96, 18); x.stroke();
  const n = Math.round(clamp(dots) * 8); x.fillStyle = "#ffffff"; x.font = "900 64px Inter"; x.fillText("●".repeat(n) + (dots < 1 && Math.floor(t * 3) % 2 ? "|" : ""), 64, 230);
  if (ok > 0) { x.globalAlpha = clamp(ok); x.fillStyle = "#1f8a4c"; x.fillRect(0, H - 120, W, 120); x.fillStyle = "#ffffff"; x.font = "900 54px Inter"; x.textAlign = "center"; x.fillText("ACESSO LIBERADO", W / 2, H - 60); x.globalAlpha = 1; }
}
// Settings page: DEGELO switch and the temperature LIMIT switch (on → off, crossed out).
function paintCabDefrost(x, W, H, { defrost = 0, limitOff = 0 } = {}) {
  x.fillStyle = "#0d1a24"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#16384e"; x.fillRect(0, 0, W, 70); x.fillStyle = "#cfe8ff"; x.font = "800 40px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("CONFIGURAÇÃO", 24, 36);
  const row = (y, label, on, col) => {
    x.fillStyle = "#14293a"; x.fillRect(20, y - 60, W - 40, 120); x.fillStyle = "#e6f2ff"; x.font = "900 48px Inter"; x.textAlign = "left"; x.fillText(label, 44, y);
    const sx = W - 190; x.fillStyle = on ? col : "#3a4652"; roundRect(x, sx, y - 34, 140, 68, 34); x.fill(); x.fillStyle = "#ffffff"; x.beginPath(); x.arc(sx + 34 + 72 * (on ? 1 : 0), y, 26, 0, 6.3); x.fill();
  };
  row(160, "DEGELO", defrost > 0.5, ORANGE);
  row(320, "LIMITE", limitOff < 0.5, "#2fae66");
  if (limitOff > 0) { x.strokeStyle = "#ff3b2a"; x.lineWidth = 10; x.beginPath(); x.moveTo(40, 320); x.lineTo(40 + (W - 300) * clamp(limitOff * 1.5), 320); x.stroke(); }
}

// LED clock board on a stand (the 20-minute timer). Origin: floor centre; faces +z. API { group, paint(fn) }
function makeTimerStand({ w = 1.1, h = 0.5, standH = 1.0 } = {}) {
  const g = new THREE.Group(), black = pmat("#141518", { roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  const base = new THREE.Mesh(rbox(0.6, 0.05, 0.45, 0.02), black); base.position.y = 0.025; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, standH, 16), pmat("#2b2d31", { metalness: 0.8, roughness: 0.3 })); pole.position.y = standH / 2; g.add(pole);
  const cy = standH + h / 2 + 0.04;
  const body = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.1, 0.025), black); body.position.y = cy; g.add(body);
  const c = makeCanvas(640, Math.round(640 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, cy, 0.052); g.add(scr);
  g.add(contactShadow(1.0, 0.9));
  return { group: g, paint: (fn) => { fn(x, c.width, c.height); tex.needsUpdate = true; } };
}
function paintClock(x, W, H, text, col = "#ff3b2a") {
  x.fillStyle = "#07080a"; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.035)"; for (let i = 6; i < W; i += 12) for (let j = 6; j < H; j += 12) x.fillRect(i, j, 4, 4);
  let px = Math.round(H * 0.72); x.font = `900 ${px}px Inter`; while (x.measureText(text).width > W * 0.9 && px > 10) { px -= 4; x.font = `900 ${px}px Inter`; }
  x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = col; x.shadowBlur = 24; x.fillStyle = col; x.fillText(text, W / 2, H * 0.54); x.shadowBlur = 0;
}

// Stream of gold coins pouring out of a point (the open vault) towards the camera's left, falling to the
// floor and vanishing; starts at t0, stops spawning at t1. Instanced, decor. API { mesh, update(t, t0, t1, origin) }
function makeCoinStream(N = 150, seed = 3) {
  const m = pmat(GOLD_METAL, { metalness: 1, roughness: 0.26, emissive: "#3a2400", emissiveIntensity: 0.5 });
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 24), m, N); im.frustumCulled = false; im.userData.decor = true;
  const r = mulberry32(seed), items = [], o = new THREE.Object3D(), P = 1.3;
  for (let i = 0; i < N; i++) items.push({ ph: r(), sx: (r() - 0.5) * 0.7, sy: (r() - 0.5) * 0.6, vx: -(0.5 + r() * 0.9), vz: 1.1 + r() * 0.9, vy: 0.4 + r() * 0.9, spin: [r() * 9, r() * 9] });
  return {
    mesh: im,
    update(t, t0, t1, origin) {
      items.forEach((it, i) => {
        const age = t - t0 - it.ph * P, cyc = Math.floor(age / P), a = age - cyc * P, born = t0 + it.ph * P + cyc * P;
        let y = origin.y + it.sy + it.vy * a - 3.2 * a * a;
        if (age < 0 || born > t1 || y < 0.02) { o.scale.setScalar(0.0001); y = -5; } else o.scale.setScalar(1);
        o.position.set(origin.x + it.sx + it.vx * a, y, origin.z + it.vz * a); o.rotation.set(it.spin[0] * a + 1.2, it.spin[1] * a, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    },
  };
}
// Stream of cash bundles sliding and tumbling out of a doorway across the floor towards the camera. Decor.
function makeCashStream(N = 70, seed = 4) {
  const side = pmat("#ffffff", { map: NOTE_EDGE, roughness: 0.85 }), face = pmat("#ffffff", { map: NOTE100, roughness: 0.75 });
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.07, 0.16), [side, side, face, side, side, side], N); im.frustumCulled = false; im.userData.decor = true;
  const r = mulberry32(seed), items = [], o = new THREE.Object3D(), P = 1.5;
  for (let i = 0; i < N; i++) items.push({ ph: r(), sx: (r() - 0.5) * 0.6, h: 0.3 + r() * 1.4, vx: (r() - 0.5) * 0.8, vz: 1.4 + r() * 1.2, ry: r() * 6, sp: (r() - 0.5) * 6 });
  return {
    mesh: im,
    update(t, t0, t1, origin) {
      items.forEach((it, i) => {
        const age = t - t0 - it.ph * P, cyc = Math.floor(age / P), a = age - cyc * P, born = t0 + it.ph * P + cyc * P;
        if (age < 0 || born > t1) { o.scale.setScalar(0.0001); o.position.set(0, -5, 0); }
        else { o.scale.setScalar(1); const y = origin.y + 0.9 + 0.25 * it.h * a - 4.9 * a * a; o.position.set(origin.x + it.sx + it.vx * a, Math.max(0.035, y), origin.z + it.vz * a * (y > 0.04 ? 1 : 0.8)); o.rotation.set(0.6 * Math.sin(it.sp * a) * (y > 0.04 ? 1 : 0), it.ry + it.sp * a, 0); }
        o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// Phone on a small stand at real scale (the kit's phone is 1.64 tall: scaled 0.22). API { group, body, paint(o) }
function makeStandPhone() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const m = pmat("#2a2522", { roughness: 0.35, clearcoat: 0.6, metalness: 0.2 });
  const base = new THREE.Mesh(rbox(0.26, 0.025, 0.2, 0.008), m); base.position.y = 0.0125; body.add(base);
  const back = new THREE.Mesh(rbox(0.13, 0.16, 0.02, 0.006), m); back.position.set(0, 0.09, 0); back.rotation.x = -0.32; body.add(back);
  const lip = new THREE.Mesh(rbox(0.26, 0.025, 0.02, 0.006), m); lip.position.set(0, 0.035, 0.07); body.add(lip);
  body.add(contactShadow(0.46, 0.4));
  const ph = makePhone(), s = 0.22; ph.group.scale.setScalar(s); ph.group.position.set(0, 0.03 + 0.82 * s * Math.cos(0.32), -0.005); ph.group.rotation.x = -0.32; body.add(ph.group);
  return { group: g, body, paint: (o) => { paintBankApp(ph.ctx, o); ph.tex.needsUpdate = true; } };
}
// A generic bank app (no real brand): greeting, hidden balance, four shortcut tiles (PIX first); tapping PIX
// greys it out and slides up a red "Pix indisponível" warning.
function paintBankApp(x, { tap = 0, fail = 0, t = 0 } = {}) {
  x.clearRect(0, 0, 720, 1500);
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#1b2340"); g.addColorStop(1, "#0b0e18"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillStyle = "#ffffff"; x.font = "900 96px Inter"; x.fillText("Saldo", 50, 190);
  x.fillStyle = "#9aa6c8"; x.font = "900 96px Inter"; x.fillText("R$ •••••", 50, 310);
  const dead = fail > 0.3;
  x.fillStyle = dead ? "#3a3f4c" : ORANGE; roundRect(x, 40, 400, 640, 430, 50); x.fill();
  x.fillStyle = dead ? "#7a808c" : "#ffffff"; x.textAlign = "center"; x.font = "900 210px Inter"; x.fillText("PIX", 360, 690);
  x.fillStyle = "#24304f"; roundRect(x, 40, 870, 640, 220, 40); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 110px Inter"; x.fillText("PAGAR", 360, 1020);
  if (tap > 0 && tap < 1) { x.strokeStyle = `rgba(255,255,255,${0.9 * (1 - tap)})`; x.lineWidth = 14; x.beginPath(); x.arc(360, 615, 50 + 260 * tap, 0, Math.PI * 2); x.stroke(); }
  if (fail > 0) {
    const y = lerp(1500, 900, eOut(clamp(fail)));
    x.fillStyle = "#c8231a"; roundRect(x, 20, y, 680, 560, 44); x.fill();
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "900 150px Inter"; x.fillText("PIX", 360, y + 190); x.font = "900 92px Inter"; x.fillText("FORA DO AR", 360, y + 330);
  }
}

// Museum display: a stepped black marble base, a column and a cap, a glass box over the CHAVE-MESTRA card
// standing in a gold holder. Origin: floor centre. API { group, card, top }
function makeCardPlinth({ h = 0.95 } = {}) {
  const g = new THREE.Group(), stone = pmat("#1c1f24", { metalness: 0.3, roughness: 0.25, clearcoat: 0.8 }), gold = pmat("#c9a24e", { metalness: 1, roughness: 0.3 });
  const base = new THREE.Mesh(rbox(0.62, 0.1, 0.62, 0.02), stone); base.position.y = 0.05; g.add(base);
  const col = new THREE.Mesh(rbox(0.42, h - 0.2, 0.42, 0.02), stone); col.position.y = 0.1 + (h - 0.2) / 2; g.add(col);
  const capS = new THREE.Mesh(rbox(0.58, 0.1, 0.58, 0.02), stone); capS.position.y = h - 0.05; g.add(capS);
  for (const y of [0.11, h - 0.11]) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.44), gold); band.position.y = y; g.add(band); }
  const holder = new THREE.Mesh(rbox(0.3, 0.05, 0.1, 0.01), gold); holder.position.set(0, h + 0.025, 0); g.add(holder);
  const card = makeKeycard({ w: 0.42 }); card.group.position.set(0, h + 0.035 + card.h / 2, 0); g.add(card.group);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.3), glassMat({ opacity: 0.14 })); glass.position.set(0, h + 0.21, 0); glass.userData.decor = true; g.add(glass);
  g.add(contactShadow(1.0, 1.0));
  return { group: g, card, top: h + 0.42 };
}

// Positions shared by the vault-room shots (vault door on the left, service door on the right).
const VX = -0.6, SX = 1.6;
function vaultHoles(vx = VX, sx = SX) { return [{ circle: [vx, 1.36, 1.03] }, { rect: [sx, 0, 0.88, 2.07] }]; }
function vaultLook(room, t, beacon) { room.update(t); room.beacon(beacon); room.lights(0.9); key.intensity = 1.9; key.color.set("#eaf0ff"); hemi.intensity = 0.4; hemi.color.set("#cfdcff"); scene.fog.color.set("#0b0d10"); }

// ============================================================ 1 · gancho: 700 supermercados numa noite
// A row of glass-door freezers in the store at night; one after the other their light turns from cold
// blue to red and the far wall of freezers follows. The camera slides along the row.
addScene("gancho", 0, A.c1, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 4 }); S.backdrop(set.group);
  const row = makeFreezerRow(3, { seed: 3 }); S.add(row.group);
  const hitAt = (i) => 0.7 + i * 0.6;
  const anim = (t) => {
    storeLook(set, t, sm(t, 0.8, 3.8));
    row.list.forEach((f, i) => { const k = sm(t, hitAt(i), hitAt(i) + 0.6); f.heat(k); f.frost(1 - k); f.temp(lerp(-18, 50, k)); });
  };
  S.hero(row.group, "fileira de freezers");
  const box = envelope([row.group], anim, 0, A.c1);
  return (t) => { anim(t); let p = CAM.move(box, "truck", lin(t, 0, A.c1), { zone: "stage", from: [0.3, 0.16, 1], side: 0.4, pull: 1.0 }); p = CAM.shake(p, t, A.c700, 0.02, 0.3); CAM.apply(p); };
});

// ============================================================ 2 · imagina: você abre o freezer… e sai calor
// One freezer, frosted: the door swings open towards the camera, hot air pours out, the light goes red, the
// display jumps to 50°C (camera shake), the ice-cream tubs sag and a puddle spreads on the floor.
addScene("freezer", A.c1, A.c2, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 8 }); S.backdrop(set.group);
  const f = makeGlassFreezer({ seed: 11 }); S.add(f.group);
  const steam = makeSteam(20, 5); steam.group.position.set(0, 0.8, f.d / 2); S.add(steam.group);
  const anim = (t) => {
    const hk = sm(t, A.sai - 0.2, A.g50);
    storeLook(set, t, 0.5 + 0.5 * hk);
    f.open(sm(t, A.abre - 0.1, A.abre + 0.7)); f.heat(hk); f.temp(lerp(-18, 50, sm(t, A.calor, A.g50))); f.frost(1 - sm(t, A.abre, A.abre + 0.6));
    f.melt(sm(t, A.calor, A.c2 + 0.5)); steam.update(t, sm(t, A.sai - 0.3, A.sai + 0.4));
    fill.position.set(0, 1.2, 1.4); fill.color.set("#ff5a2a"); fill.intensity = 2.5 * hk;
  };
  S.hero(f.group, "freezer abrindo");
  const box = envelope([f.group], anim, A.c1, A.c2);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c1, A.c2), { zone: "stage", from: [0.4, 0.12, 1], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, A.g50, 0.035, 0.35); CAM.apply(p); };
});

// ============================================================ 3 · França, outubro: comida no lixo, freezer pegando fogo
// A: the photo of a French supermarket (Intermarché) in a frame on a pedestal turns and lands (slow zoom).
// B (cut at "comida"): a waste bin heaped with thrown-away food beside a red freezer; on "pegando fogo" flames
// rise at the freezer's foot and smoke goes up.
addScene("franca", A.c2, A.c3, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 12 }); S.backdrop(set.group);
  const fr = makePhotoFrame("intermarche", { w: 2.3, name: "INTERMARCHÉ · FRANÇA" }); if (fr.plate) fr.plate.userData.plate.detail = true; S.add(fr.group);
  const bin = makeWasteBin({ seed: 5 }); bin.group.position.set(-0.78, 0, 0.15); bin.group.rotation.y = 0.28; S.add(bin.group);
  const f = makeGlassFreezer({ seed: 21 }); f.group.position.set(0.72, 0, -0.15); f.group.rotation.y = -0.22; S.add(f.group);
  const fire = makeFreezerFire({ w: 0.8, seed: 7 }); fire.group.position.set(0, 0.0, f.d / 2 + 0.32); f.group.add(fire.group);
  const anim = (t) => {
    storeLook(set, t, 1, 0.35);
    const a = t < B3; fr.group.visible = a; bin.group.visible = !a; f.group.visible = !a;
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, A.c2, A.c2 + 0.7))); popIn(fr.group, t, A.c2, 0.45, 1, B3); fr.zoom(1 + 0.22 * lin(t, A.c2, B3));
    f.heat(1); f.temp(50); f.melt(1); f.open(0.18 + 0.05 * Math.sin(t * 2)); fire.update(t, sm(t, A.lixo, A.freezer2 + 0.3));
    fill.position.set(0.7, 0.6, 1.2); fill.color.set("#ff6a2a"); fill.intensity = a ? 0 : 1.2 + 2 * sm(t, A.freezer2, A.fogo);
  };
  S.hero(fr.group, "porta-retrato supermercado", { when: (t) => t < B3 });
  S.hero(bin.group, "lixeira com comida", { when: (t) => t > B3 + 0.1 });
  S.hero(f.group, "freezer pegando fogo", { when: (t) => t > B3 + 0.1 });
  const bA = envelope([fr.group], anim, A.c2 + 0.8, B3 - 0.05), bB = envelope([bin.group, f.group], anim, B3 + 0.05, A.c3);
  return (t) => {
    anim(t);
    if (t < B3) CAM.apply(CAM.move(bA, "push", lin(t, A.c2, B3), { zone: "stage", from: [-0.2, 0.25, 1], pull0: 1.4, pull: 1.0 }));
    else { let p = CAM.move(bB, "orbit", lin(t, B3, A.c3), { zone: "stage", from: [0.05, 0.3, 1], deg: 30, pull: 1.02 }); p = CAM.shake(p, t, A.fogo - 0.1, 0.025, 0.3); CAM.apply(p); }
  };
});

// ============================================================ 4 · ninguém pediu resgate; ninguém sabe quem foi
// A dark office at night: the monitor shows a ransom form with every field blank and a blinking cursor; the
// empty chair in front of it turns slowly by itself. On "ninguém sabe quem foi" a red "?" fills the screen.
addScene("resgate", A.c3, A.c4, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.2, seed: 7 }); S.backdrop(off.group);
  const desk = makeWorkDesk({ w: 2.2, d: 1.1, leather: "#1f2a33" }); S.add(desk.group);
  const mon = makeDeskMonitor({ w: 1.3 }); mon.group.position.set(-0.1, desk.top, -0.15); S.add(mon.group);
  const chair = makeOfficeChair(); chair.group.position.set(0.6, 0, 0.85); S.add(chair.group);
  const paintForm = (t) => mon.paint((x, W, H) => {
    x.fillStyle = "#0b1016"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#b51f17"; x.fillRect(0, 0, W, 110); x.fillStyle = "#ffffff"; x.font = "900 64px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("PEDIDO DE RESGATE", W / 2, 58);
    x.textAlign = "left"; [["VALOR", 200], ["CARTEIRA", 330], ["PRAZO", 460]].forEach(([lb, y], i) => {
      x.fillStyle = "#8fa3b8"; x.font = "800 52px Inter"; x.fillText(lb, 60, y);
      x.fillStyle = "#1d2733"; x.fillRect(360, y - 46, W - 420, 92);
      if (i === 0 && Math.floor(t * 2.5) % 2) { x.fillStyle = "#ffffff"; x.fillRect(380, y - 32, 8, 64); }
    });
    const q = sm(t, A.ninguem2 - 0.1, A.ninguem2 + 0.3);
    if (q > 0) { x.globalAlpha = q; x.fillStyle = "rgba(10,4,4,0.86)"; x.fillRect(0, 0, W, H); x.fillStyle = "#ff3b2a"; x.textAlign = "center"; x.font = `900 ${Math.round(H * 0.72)}px Inter`; x.fillText("?", W / 2, H * 0.56); x.globalAlpha = 1; }
  });
  const anim = (t) => {
    off.update(t); off.lights(0.18 + 0.1 * beat(t, A.ninguem, 0.5)); off.windows(0.9, "#7da2ff"); key.intensity = 0.9; key.color.set("#bcd0ff"); hemi.intensity = 0.25;
    paintForm(t);
    chair.swivel.rotation.y = 0.7 + 0.45 * Math.sin((t - A.c3) * 0.8);
    fill.position.set(-0.1, desk.top + 0.7, 0.35); fill.color.set(t > A.ninguem2 ? "#ff4a3a" : "#9fd0ff"); fill.intensity = 1.8;
  };
  S.hero(mon.group, "monitor com pedido de resgate em branco");
  S.hero(chair.group, "cadeira vazia");
  S.solid(desk.group, "mesa");
  const box = envelope([mon.group, chair.group], anim, A.c3, A.c4);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c3, A.c4), { zone: "stage", from: [-0.25, 0.3, 1], pull0: 1.3, pull: 1.0 })); };
});

// ============================================================ 5 · como alguém esquenta 700 freezers de longe?
// A dark operations room: on the table a lit map of France with 700 store lights. The camera rises over it
// while a red wave spreads from Paris to every store.
addScene("longe", A.c4, A.c5, (S) => {
  const off = makeOfficeSet({ wallZ: -3.2, clear: 4.4, seed: 31 }); S.backdrop(off.group);
  const map = makeStoreMap(); S.add(map.group);
  const anim = (t) => {
    off.update(t); off.lights(0.15); off.windows(0.9, "#7da2ff"); map.update(t, sm(t, A.esquenta - 0.3, A.longe + 0.2));
    key.intensity = 0.9; key.color.set("#c9d8ff"); hemi.intensity = 0.25; hemi.color.set("#9fb8ff");
    fill.position.set(0, map.top + 1.2, 0.5); fill.color.set(t > A.freezers ? "#ff5a3a" : "#6cc4ff"); fill.intensity = 1.6;
  };
  S.hero(map.group, "mapa da frança com lojas");
  const box = envelope([map.group], anim, A.c4, A.c5);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c4, A.c5), { zone: "stage", from: [0.05, 0.85, 1], rise: 0.35, pull: 1.0 })); };
});

// ============================================================ 6 · a analogia: a chave-mestra do hotel
// Hotel hall at night, the room doors side by side. A (close): the CHAVE-MESTRA card glides in and taps the
// first door's lock; the LED turns green. B (wide, from "abre"): every lock along the hall turns green,
// outwards from that door, and the doors swing open onto warm rooms; the card backs off.
addScene("hotel", A.c5, A.c6, (S) => {
  const hall = makeHotelHall({ n: 8, heroN: 2, seed: 5 }); S.backdrop(hall.group); S.add(hall.heroGroup);
  const hand = makeHoldingHand({ s: 1.5, cardW: 0.16 }); hand.card.label.userData.plate.detail = true; const card = hand; S.add(hand.group);
  hall.heroGroup.updateMatrixWorld(true);
  const d0 = hall.doors[0], lock0 = d0.group.localToWorld(d0.lock.clone()), x0 = d0.group.position.x;
  const order = hall.allDoors.slice().sort((a, b) => Math.abs(a.x - x0) - Math.abs(b.x - x0));
  const tap = A.cartao + 0.1, chain = A.abreT - 0.05, B = A.abreT - 0.15;
  const start = lock0.clone().add(new V3(0.07, 0.03, 0.12)), at = lock0.clone().add(new V3(0, 0, 0.035)), rest = lock0.clone().add(new V3(1.4, -0.4, 2.2));   // the hand withdraws out of the frame
  const anim = (t) => {
    hall.update(t); hall.lights(0.85); key.intensity = 1.5; key.color.set("#ffd9b0"); hemi.intensity = 0.4; hemi.color.set("#ffe2c4");
    const kIn = sm(t, A.c5 + 0.1, tap), kOut = sm(t, tap + 0.2, B + 0.1); hand.group.visible = kOut < 0.99;
    card.group.position.copy(start).lerp(at, kIn).lerp(rest, kOut);
    card.group.position.y += 0.02 * Math.sin((t - A.c5) * 2.2) * (1 - kIn + kOut);
    card.group.rotation.set(0, 0.3 * (1 - kIn) + 0.2 * kOut * Math.sin((t - tap) * 1.5), 0);
    order.forEach(({ d }, i) => { const on = i === 0 ? t > tap : t > chain + 0.12 * i; d.led(on ? "#2fe37a" : "#ff2a1a"); d.open(sm(t, A.todos + 0.14 * i, A.todos + 0.14 * i + 0.8)); });
    fill.position.copy(lock0).add(new V3(0.4, 0.2, 0.8)); fill.color.set("#7dffb0"); fill.intensity = 1.6 * beat(t, tap, 0.6);
  };
  S.hero(hand.card.group, "cartão chave-mestra na mão", { when: (t) => t < tap + 0.2 });
  S.hero(hall.doors[0].group, "porta de hotel 1", { when: (t) => t > B + 0.75 }); S.hero(hall.doors[1].group, "porta de hotel 2", { when: (t) => t > B + 0.75 });
  const bA = envelope([hand.card.group], anim, A.c5, tap + 0.2), bB = envelope([hall.doors[0].group, hall.doors[1].group], anim, B, A.c6);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c5, B), { zone: "stage", from: [0.25, 0.1, 1], pull0: 1.2, pull: 1.0 });
    const pb = CAM.move(bB, "truck", lin(t, B, A.c6), { zone: "stage", from: [0.1, 0.12, 1], side: 0.35, pull: 1.0 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.2, B + 0.7)));
  };
});

// ============================================================ 7 · no mercado, a chave-mestra é a central
// The store's control corner: the CENTRAL cabinet on a pillar lists every freezer; on "comanda" pulses run
// along the cables to the three freezers; on "internet" the router on top sends its signal out.
addScene("central", A.c6, A.c7, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 16 }); S.backdrop(set.group);
  const C = buildControlCorner(S, { calendar: true, padlock: true });
  const B = A.comanda - 0.2;
  const anim = (t) => {
    storeLook(set, t, 0, 0.6);
    C.cab.paint((x, W, H) => paintCabStatus(x, W, H, {})); C.cab.dust(0.85); C.lock.open(0); C.cal.show(0, 0);
    C.cab.led(0, "#2fe37a"); C.cab.led(1, Math.floor(t * 2) % 2 ? "#2fe37a" : "#0e3a1c"); C.cab.led(2, "#2fe37a"); C.cab.led(3, ORANGE);
    C.router.blink(t); C.router.waves(sm(t, A.ligada - 0.2, A.internet), t);
    C.wires.forEach((w, i) => { w.mat.emissiveIntensity = 1.4 * beat(t, A.comanda + i * 0.18, 0.7) + 0.9 * beat(t, A.geladeiras + i * 0.12, 0.6); });
    C.row.list.forEach((f) => { f.heat(0); f.frost(0.8); f.temp(-18); });
  };
  S.hero(C.cab.group, "central de controle"); S.hero(C.router.group, "roteador");
  S.hero(C.row.group, "três freezers", { when: (t) => t > B + 0.4 });
  const bA = envelope([C.cab.group, C.router.group], anim, A.c6, B), bB = envelope([C.cab.group, C.router.group, C.row.group], anim, B, A.c7);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c6, B), { zone: "stage", from: [0.25, 0.08, 1], pull0: 1.3, pull: 1.05 });
    const pb = CAM.move(bB, "reveal", lin(t, B, A.c7), { zone: "stage", from: [0.1, 0.2, 1], pull: 1.0, pull0: 1.06 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.3, B + 0.6)));
  };
});

// ============================================================ 8 · velhas, sem atualização; a senha pela data do dia
// A: close on the old cabinet, covered in dust; its screen flags SEM ATUALIZAÇÃO. B (cut at "falha"): the flip
// calendar on the side table turns to 02 NOV, the password fills with dots, ACESSO LIBERADO, the padlock on the
// cabinet's staple springs open.
addScene("senha", A.c7, A.c8, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 16 }); S.backdrop(set.group);
  const C = buildControlCorner(S, { calendar: true, padlock: true });
  const anim = (t) => {
    storeLook(set, t, 0, 0.5);
    C.cab.dust(0.85); C.router.blink(t); C.router.waves(0.4, t); C.row.list.forEach((f) => { f.heat(0); f.frost(0.8); f.temp(-18); });
    if (t < B8) C.cab.paint((x, W, H) => paintCabStatus(x, W, H, { old: sm(t, A.velhas - 0.2, A.atualizacao) }));
    else C.cab.paint((x, W, H) => paintCabLogin(x, W, H, { dots: lin(t, A.descobrir - 0.2, A.data + 0.3), ok: sm(t, A.dia - 0.15, A.dia + 0.2), t }));
    C.cal.show(0, sm(t, A.data - 0.35, A.data + 0.15));
    C.lock.open(sm(t, A.dia - 0.05, A.dia + 0.35));
    C.cab.led(3, t > A.dia ? "#2fe37a" : "#ff2a1a");
  };
  S.hero(C.cab.group, "central empoeirada", { when: (t) => t < B8 });
  S.hero(C.cal.group, "calendário 02 nov", { when: (t) => t > B8 + 0.2 }); S.hero(C.cab.group, "central com senha", { when: (t) => t > B8 + 0.2 }); S.hero(C.lock.group, "cadeado", { when: (t) => t > B8 + 0.2 });
  const bA = envelope([C.cab.group], anim, A.c7, B8), bB = envelope([C.cab.group, C.cal.group, C.lock.group], anim, B8, A.c8);
  return (t) => {
    anim(t);
    if (t < B8) CAM.apply(CAM.move(bA, "push", lin(t, A.c7, B8), { zone: "stage", from: [0.12, 0.06, 1], pull0: 1.3, pull: 1.04 }));
    else { let p = CAM.move(bB, "truck", lin(t, B8, A.c8), { zone: "stage", from: [-0.1, 0.12, 1], side: 0.3, pull: 1.0 }); p = CAM.shake(p, t, A.dia, 0.02, 0.25); CAM.apply(p); }
  };
});

// ============================================================ 9 · ligaram o degelo e tiraram o limite
// The cabinet's settings page: DEGELO flips on (shake), the temperature LIMITE switch is crossed out; the three
// freezers go red one after the other and the far wall of freezers follows.
addScene("degelo", A.c8, A.c9, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 16 }); S.backdrop(set.group);
  const C = buildControlCorner(S, { calendar: true, padlock: true });
  const B = A.tiraram - 0.3;
  const anim = (t) => {
    const hk = sm(t, A.degelo, A.temperatura + 0.4);
    storeLook(set, t, hk, 0.45);
    C.cab.paint((x, W, H) => paintCabDefrost(x, W, H, { defrost: t > A.degelo ? 1 : 0, limitOff: lin(t, A.limite - 0.1, A.limite + 0.4) }));
    C.router.blink(t); C.router.waves(0.6, t); C.cab.dust(0.85); C.lock.open(1); C.cal.show(0, 1);
    C.wires.forEach((w, i) => { w.mat.emissiveIntensity = 1.6 * beat(t, A.degelo + i * 0.15, 0.6) + 1.2 * beat(t, A.limite + i * 0.15, 0.6); });
    C.row.list.forEach((f, i) => { const k = sm(t, A.degelo + 0.3 + i * 0.35, A.temperatura + i * 0.2); f.heat(k); f.frost(0.8 * (1 - k)); f.temp(lerp(-18, 50, k)); });
    C.cab.led(0, t > A.degelo ? ORANGE : "#2fe37a"); C.cab.led(1, t > A.limite ? "#ff2a1a" : "#2fe37a");
  };
  S.hero(C.cab.group, "central com degelo ligado");
  S.hero(C.row.group, "freezers esquentando", { when: (t) => t > B + 0.4 });
  const bA = envelope([C.cab.group], anim, A.c8, B), bB = envelope([C.cab.group, C.row.group], anim, B, A.c9);
  return (t) => {
    anim(t);
    let p = CAM.blend(CAM.move(bA, "push", lin(t, A.c8, B), { zone: "stage", from: [-0.12, 0.05, 1], pull0: 1.25, pull: 1.0 }), CAM.move(bB, "reveal", lin(t, B, A.c9), { zone: "stage", from: [-0.2, 0.18, 1], pull: 1.0, pull0: 1.05 }), sm(t, B - 0.3, B + 0.5));
    p = CAM.shake(p, t, A.degelo, 0.03, 0.3); p = CAM.shake(p, t, A.limite, 0.025, 0.3); CAM.apply(p);
  };
});

// ============================================================ 10 · e não parou: Bélgica, Luxemburgo, Suécia, Estônia
// The photo of a Belgian supermarket (Delhaize) in a frame turns and lands in the store at night, every far
// freezer already red; the camera orbits as the countries come up on the headline.
addScene("segunda", A.c9, A.c10, (S) => {
  const set = makeSupermarketSet({ wallZ: -3.6, seed: 20 }); S.backdrop(set.group);
  const fr = makePhotoFrame("delhaize", { w: 2.3, name: "DELHAIZE · BÉLGICA" }); if (fr.plate) fr.plate.userData.plate.detail = true; S.add(fr.group);
  const anim = (t) => {
    storeLook(set, t, 1, 0.4 + 0.25 * beat(t, A.parou, 0.5));
    fr.frame.rotation.y = -1.2 * (1 - eOut(lin(t, A.c9, A.c9 + 0.7))); popIn(fr.group, t, A.c9, 0.45); fr.zoom(1 + 0.25 * lin(t, A.c9, A.c10));
  };
  S.hero(fr.group, "porta-retrato supermercado belga");
  const box = envelope([fr.group], anim, A.c9 + 0.8, A.c10);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c9, A.c10), { zone: "stage", from: [0, 0.25, 1], deg: 34, pull: 1.0 })); };
});

// ============================================================ 11 · e com dinheiro, funciona igual
// The vault room: the round vault door, shut; on "dinheiro" the red beacon starts turning.
addScene("cofre", A.c10, A.c11, (S) => {
  const room = makeVaultRoom({ holes: vaultHoles(), seed: 6 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(VX, 0, 0); S.add(vd.group);
  const sd = makeServiceDoor(); sd.group.position.set(SX, 0, -0.3); S.add(sd.group);
  const anim = (t) => { vaultLook(room, t, sm(t, A.dinheiro - 0.1, A.dinheiro + 0.3)); vd.open(0); vd.glow(0); vd.spin(0.1 * Math.sin(t)); sd.open(0); sd.led("#ff2a1a"); };
  S.hero(vd.group, "porta de cofre");
  const box = envelope([vd.group], anim, A.c10, A.c11);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c10, A.c11), { zone: "stage", from: [0.2, 0.15, 1], pull0: 1.3, pull: 1.0 })); };
});

// ============================================================ 12 · Binance: US$ 6,3 bi em uns 20 minutos
// The wheel spins, the vault door swings open, gold light inside, and a river of coins pours out; on "vinte
// minutos" the LED clock beside it reads 20:00; on "FBI" the beacon flashes faster.
addScene("binance", A.c11, A.c12, (S) => {
  const room = makeVaultRoom({ holes: vaultHoles(), seed: 9 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(VX, 0, 0); S.add(vd.group);
  const sd = makeServiceDoor(); sd.group.position.set(SX, 0, -0.3); S.add(sd.group);
  const clock = makeTimerStand({ w: 1.4, h: 0.62, standH: 0.9 }); clock.group.position.set(2.35, 0, 1.1); clock.group.rotation.y = -0.35; S.add(clock.group);
  const coins = makeCoinStream(170, 3); S.add(coins.mesh);
  const origin = new V3(VX, 1.3, -0.2), B = A.cripto + 0.4;
  let shownClock = null;
  const anim = (t) => {
    vaultLook(room, t, 1); if (t > A.fbi) room.beacon(1);
    vd.spin(3 * sm(t, A.c11, A.levaram)); vd.open(sm(t, A.levaram - 0.2, A.b63 + 0.4)); vd.glow(sm(t, A.levaram, A.b63 + 0.3));
    coins.update(t, A.b63 - 0.2, A.c12, origin); sd.open(0); sd.led("#ff2a1a");
    const txt = "20 MIN";
    if (txt !== shownClock) { shownClock = txt; clock.paint((x, W, H) => paintClock(x, W, H, txt)); }
    clock.group.visible = t > B - 0.2; popIn(clock.group, t, B - 0.2, 0.4);
    fill.position.set(VX, 1.4, 1.5); fill.color.set("#ffc46a"); fill.intensity = 2.5 * sm(t, A.levaram, A.b63 + 0.3);
  };
  S.hero(vd.group, "cofre abrindo");
  S.hero(clock.group, "relógio 20 minutos", { when: (t) => t > B + 0.3 });
  const bA = envelope([vd.group], anim, A.c11, B), bB = envelope([vd.group, clock.group], anim, B + 0.3, A.c12);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "orbit", lin(t, A.c11, B), { zone: "stage", from: [0.25, 0.15, 1], deg: 30, pull: 1.0 });
    const pb = CAM.move(bB, "truck", lin(t, B, A.c12), { zone: "stage", from: [0.1, 0.2, 1], side: 0.3, pull: 1.0 });
    let p = CAM.blend(pa, pb, sm(t, B - 0.3, B + 0.5)); p = CAM.shake(p, t, A.b63, 0.025, 0.3); CAM.apply(p);
  };
});

// A desk in a dark office under a pendant lamp: the CHAVE-MESTRA card and a pile of cash lie side by side.
// Shared by scenes 13 and 14 (A). API { desk, card, cash }
function buildDealTable(S, seed) {
  const off = makeOfficeSet({ wallZ: -1.8, clear: 0.6, seed }); S.backdrop(off.group);
  const win = makeSetWindow(2.2, 1.1, { seed: seed + 2, open: 0.15 }); win.group.position.set(0, 1.55, -1.8 + 0.15); S.backdrop(win.group);
  const desk = makeWorkDesk({ w: 2.2, d: 1.2, leather: "#2a1e18" }); S.add(desk.group);
  const card = makeKeycard({ w: 0.8 }); card.group.rotation.x = -Math.PI / 2; S.add(card.group);
  const cash = new THREE.Group(); S.add(cash);
  for (let i = 0; i < 4; i++) { const b = makeCashBundle({ w: 0.4, d: 0.19, h: 0.075 }); b.position.set((i % 2) * 0.05 - 0.02, i * 0.075, (i % 2 ? 0.03 : -0.02)); b.rotation.y = (i % 3) * 0.08; cash.add(b); }
  return { off, desk, card, cash };
}

// ============================================================ 13 · e no Brasil? já venderam uma chave-mestra
// A desk under a lamp in a dark office: the CHAVE-MESTRA card lies alone (close); on "venderam" a pile of cash
// lands beside it and the camera opens up.
addScene("brasil", A.c12, A.c13, (S) => {
  const T = buildDealTable(S, 23), B = A.venderam - 0.15;
  const anim = (t) => {
    T.off.update(t); T.off.lights(0.25); T.off.windows(0.8, "#8fb0ff"); key.intensity = 1.2; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    T.card.group.position.set(-0.1, T.desk.top + 0.008, 0.2); T.card.group.rotation.set(-Math.PI / 2, 0, 0.08);
    T.cash.position.set(0.3, T.desk.top, -0.14); T.cash.rotation.y = -0.2;
    popIn(T.cash, t, B, 0.4);
    fill.position.set(0, T.desk.top + 0.8, 0.6); fill.color.set("#ffcf8a"); fill.intensity = 1.2;
  };
  S.hero(T.card.group, "cartão chave-mestra na mesa"); S.hero(T.cash, "dinheiro", { when: (t) => t > B + 0.4 });
  S.solid(T.desk.group, "mesa");
  const bA = envelope([T.card.group], anim, A.c12, B), bB = envelope([T.card.group, T.cash], anim, B + 0.4, A.c13);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c12, B), { zone: "stage", from: [0.05, 0.85, 1], pull0: 1.3, pull: 1.08 });
    const pb = CAM.move(bB, "drop", lin(t, B, A.c13), { zone: "stage", from: [0.05, 0.8, 1], rise: 0.15, pull: 1.0 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.1, B + 0.6)));
  };
});

// ============================================================ 14 · vendeu o acesso por 15 mil; sumiram mais de 500 milhões
// A: on the desk the card slides to one side and the cash to the other (the sale). B (cut at "Sumiram"): in the
// vault room the vault stays shut, but the service door beside it opens and bundles of cash pour out.
addScene("venda", A.c13, A.c14, (S) => {
  const T = buildDealTable(S, 23);
  const room = makeVaultRoom({ holes: vaultHoles(), seed: 12 }); room.group.position.x = 60; S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(60 + VX, 0, 0); S.add(vd.group);
  const sd = makeServiceDoor(); sd.group.position.set(60 + SX, 0, -0.3); S.add(sd.group);
  const flow = makeCashStream(70, 4); S.add(flow.mesh);
  const swap = A.vendeu - 0.1;
  const anim = (t) => {
    const a = t < B14;
    if (a) { T.off.update(t); T.off.lights(0.25); T.off.windows(0.8, "#8fb0ff"); key.intensity = 1.2; key.color.set("#ffd9b0"); hemi.intensity = 0.3; }
    else vaultLook(room, t, 1);
    T.off.group.visible = a; T.desk.group.visible = a; T.card.group.visible = a; T.cash.visible = a; room.group.visible = !a; vd.group.visible = !a; sd.group.visible = !a;
    const k = sm(t, swap, swap + 0.8);
    T.card.group.position.set(lerp(-0.1, 0.34, k), T.desk.top + 0.008 + 0.12 * Math.sin(Math.PI * k), lerp(0.2, 0.06, k)); T.card.group.rotation.set(-Math.PI / 2, 0, lerp(0.08, -0.25, k));
    T.cash.position.set(lerp(0.3, -0.16, k), T.desk.top, lerp(-0.14, -0.12, k)); T.cash.rotation.y = lerp(-0.2, 0.3, k);
    vd.open(0); vd.glow(0); sd.open(sm(t, B14 + 0.05, A.sumiram + 0.6)); sd.led(t > B14 + 0.05 ? "#2fe37a" : "#ff2a1a");
    flow.update(t, A.sumiram, A.c14 + 1, new V3(60 + SX, 0.2, -0.2));
  };
  S.hero(T.card.group, "cartão sendo vendido", { when: (t) => t < B14 }); S.hero(T.cash, "dinheiro trocando de lado", { when: (t) => t < B14 });
  S.solid(T.desk.group, "mesa", { when: (t) => t < B14 });
  S.hero(sd.group, "porta de serviço abrindo", { when: (t) => t > B14 + 0.2 }); S.hero(vd.group, "cofre fechado", { when: (t) => t > B14 + 0.2 });
  const bA = envelope([T.card.group, T.cash], anim, A.c13, B14 - 0.05), bB = envelope([vd.group, sd.group], anim, B14 + 0.05, A.c14);
  return (t) => {
    anim(t);
    if (t < B14) CAM.apply(CAM.move(bA, "orbit", lin(t, A.c13, B14), { zone: "stage", from: [0, 0.82, 1], deg: 32, pull: 1.0 }));
    else { let p = CAM.move(bB, "push", lin(t, B14, A.c14), { zone: "stage", from: [-0.15, 0.18, 1], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, A.sumiram, 0.025, 0.3); CAM.apply(p); }
  };
});

// ============================================================ 15 · agora imagina: você abre o app e o Pix não funciona
// Living room at night: the phone on its stand shows a generic bank app; the PIX tile is tapped, greys out and
// a red PIX INDISPONÍVEL slides up; the room light dips on "ataque".
addScene("pix", A.c14, A.c15, (S) => {
  const room = makeNightLivingRoom({ wallZ: -2.2, seed: 6 }); room.group.position.x = 2.6; S.backdrop(room.group);
  const win = makeSetWindow(1.9, 1.5, { seed: 9, open: 0.12 }); win.group.position.set(0, 1.45, -2.2 + 0.15); S.backdrop(win.group);   // the city at night right behind the phone
  const desk = makeWorkDesk({ w: 2.0, d: 1.1, leather: "#2a2622" }); S.add(desk.group);
  const P = makeStandPhone(); P.group.position.set(0, desk.top, 0.12); S.add(P.group);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.11, 28), pmat("#e9e4dc", { roughness: 0.3, clearcoat: 0.8 })); cup.position.set(-0.32, desk.top + 0.055, -0.05); S.add(cup);
  const hit = A.pix2 - 0.05;
  const anim = (t) => {
    room.update(t); room.light(0.75 - 0.45 * beat(t, A.ataque - 0.1, 0.9)); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    const fail = lin(t, A.nao - 0.1, A.nao + 0.5);
    P.paint({ tap: t > hit ? lin(t, hit, hit + 0.55) : 0, fail, t });
    fill.position.set(0, desk.top + 0.25, 0.6); fill.color.set(fail > 0.3 ? "#ff4a3a" : "#9fc4ff"); fill.intensity = fail > 0.3 ? 2.2 : 1.4;
  };
  S.hero(P.body, "celular com app do banco");
  S.solid(desk.group, "mesa");
  const B = A.janeiro - 0.2;
  const bA = envelope([P.body], anim, A.c14, B), bB = envelope([P.body, cup], anim, B, A.c15);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c14, B), { zone: "stage", from: [0.12, 0.2, 1], pull0: 1.3, pull: 1.0 });
    const pb = CAM.move(bB, "orbit", lin(t, B, A.c15), { zone: "stage", from: [0, 0.3, 1], deg: 28, pull: 1.05 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.3, B + 0.5)));
  };
});

// ============================================================ 16 · ninguém arromba o cofre… pega a chave-mestra
// A (wide): the vault room, the big vault door shut and untouched, the small service door beside it. B (close,
// from "padrão"): a hand brings the CHAVE-MESTRA card to the reader, the LED turns green. C (from "pega"): the
// hand is gone and the service door swings open onto a lit passage, the vault still shut beside it.
addScene("padrao", A.c15, A.c16, (S) => {
  const room = makeVaultRoom({ holes: vaultHoles(), seed: 14 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(VX, 0, 0); S.add(vd.group);
  const sd = makeServiceDoor(); sd.group.position.set(SX, 0, -0.3); S.add(sd.group);
  const hand = makeHoldingHand({ s: 1.5, cardW: 0.16 }); hand.card.label.userData.plate.detail = true; S.add(hand.group);
  const reader = sd.group.position.clone().add(new V3(sd.w / 2 + 0.28, 1.12, 0.12));
  const B = A.padrao - 0.4, C = A.pega - 0.25, tapAt = A.padrao + 0.45;
  const start = reader.clone().add(new V3(0.08, 0.04, 0.14)), away = reader.clone().add(new V3(1.4, -0.4, 2.2));
  const anim = (t) => {
    vaultLook(room, t, 0.6);
    vd.open(0); vd.glow(0); vd.spin(0);
    const k = sm(t, B, tapAt), back = sm(t, tapAt + 0.5, C);
    hand.group.visible = t > B && back < 0.99;
    hand.group.position.copy(start).lerp(reader, k).lerp(away, back);
    sd.led(t > tapAt ? "#2fe37a" : "#ff2a1a"); sd.open(sm(t, A.pega - 0.1, A.chaveD + 0.5));
    fill.position.copy(reader).add(new V3(0, 0, 0.6)); fill.color.set("#7dffb0"); fill.intensity = 1.8 * beat(t, tapAt, 0.6);
  };
  S.hero(vd.group, "cofre intacto", { when: (t) => t < B || t > C + 0.6 }); S.hero(sd.group, "porta de serviço", { when: (t) => t < B || t > C + 0.6 });
  S.hero(hand.card.group, "cartão no leitor", { when: (t) => t > B + 0.6 && t < tapAt + 0.5 });
  const bA = envelope([vd.group, sd.group], anim, A.c15, B), bB = envelope([hand.card.group], anim, B + 0.4, tapAt + 0.5), bC = envelope([vd.group, sd.group], anim, C, A.c16);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "orbit", lin(t, A.c15, B), { zone: "stage", from: [0.05, 0.2, 1], deg: 24, pull: 1.0 });
    const pb = CAM.move(bB, "push", lin(t, B, C), { zone: "stage", from: [-0.25, 0.1, 1], pull0: 1.25, pull: 1.05 });
    const pc = CAM.move(bC, "reveal", lin(t, C, A.c16), { zone: "stage", from: [-0.15, 0.18, 1], pull: 1.0, pull0: 1.12 });
    let p = t < (B + C) / 2 ? CAM.blend(pa, pb, sm(t, B - 0.1, B + 0.6)) : CAM.blend(pb, pc, sm(t, C - 0.1, C + 0.6));
    p = CAM.shake(p, t, A.cofre, 0.02, 0.25); CAM.apply(p);
  };
});

// ============================================================ 17 · a pergunta: bagunça ou teste pra algo maior?
// The two targets side by side in the vault room: the red-hot freezer on the left, the vault door on the right,
// and between them, on a plinth, the CHAVE-MESTRA card.
addScene("pergunta", A.c16, A.end, (S) => {
  const vx = 0.6, room = makeVaultRoom({ holes: [{ circle: [vx, 1.36, 1.03] }], seed: 18 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(vx, 0, 0); S.add(vd.group);
  const f = makeGlassFreezer({ seed: 41 }); f.group.position.set(-1.35, 0, 0.05); f.group.rotation.y = 0.22; S.add(f.group);
  const pl = makeCardPlinth(); pl.card.label.userData.plate.detail = true; pl.group.position.set(-0.4, 0, 0.95); S.add(pl.group);
  const anim = (t) => {
    vaultLook(room, t, 0.8); vd.open(0.04 + 0.02 * Math.sin(t * 1.3)); vd.glow(0.3); vd.spin(0.2 * Math.sin(t * 0.7));
    f.heat(1); f.frost(0); f.temp(50);
    popIn(pl.group, t, A.c16, 0.4); pl.card.group.rotation.y = 0.25 * Math.sin((t - A.c16) * 0.9);
    fill.position.set(-1.2, 1.2, 1.4); fill.color.set("#ff5a2a"); fill.intensity = 1.6;
  };
  S.hero(f.group, "freezer vermelho"); S.hero(vd.group, "porta de cofre", { when: (t) => t < A.entao - 0.5 }); S.hero(pl.group, "cartão chave-mestra no pedestal", { when: (t) => t > A.c16 + 0.5 });
  const B = A.entao - 0.2;
  const bA = envelope([f.group, vd.group, pl.group], anim, A.c16 + 0.5, B), bB = envelope([pl.group, f.group], anim, B, A.end);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c16, B), { zone: "stage", from: [0, 0.25, 1], pull0: 1.2, pull: 1.0 });
    const pb = CAM.move(bB, "orbit", lin(t, B, A.end), { zone: "stage", from: [0.1, 0.25, 1], deg: 22, pull: 1.0 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.3, B + 0.9)));
  };
});
