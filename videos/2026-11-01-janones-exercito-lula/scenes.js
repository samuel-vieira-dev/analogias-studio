// ============================================================================
// videos/2026-11-01-janones-exercito-lula/scenes.js
// André Janones e o "Exército do Lula" — expositivo e neutro: a trajetória (ônibus, greve, Câmara,
// auxílio, 2022), o outro lado (áudio, rachadinha, acordo, medida protetiva), a queda nas urnas, o canal
// (analogia única: rádio — só ele fala, cada ouvinte vira antena), o TSE e a virada. Uma medalha de dois
// lados costura o vídeo (dois lados → o outro lado → ninguém consegue medir).
// Times come from audio/words.json (A below). New objects: engine/props/politics.js.
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops (rally
// at night, office, courtroom, highway, Esplanada, living room at dawn) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  definir: 1.62, eleicoes: 2.2, c1: 2.92,
  janones: 3.96, criador: 6.0, exercito: 6.68, canal: 8.2, milhoes: 9.38, soldados: 10.2, c2: 10.9,
  dois: 12.44, lados: 12.84, c3: 13.45,
  explodiu: 15.4, ano2018: 16.08, greve: 17.86, quinze: 19.34, visualizacoes: 20.62, c4: 21.65,
  defendeu: 22.96, seiscentos: 24.12, largou: 27.02, apoiar: 28.72, c5: 29.78,
  a2023: 30.96, vaza: 31.88, audio: 32.72, salario: 33.96, assessores: 35.14, dividas: 36.32, c6: 37.52,
  rachadinha: 39.1, assessor: 40.24, conta: 41.22, publico: 42.9, c7: 43.48,
  acordo: 45.2, pagou: 45.76, mil: 47.32, reu: 49.18, c8: 49.5,
  companheira: 51.34, protetiva: 52.9, acusa: 53.9, nega: 55.94, c9: 56.4,
  perde: 58.04, tercos: 58.92, votos: 59.6, lula: 60.5, atras: 60.98, turno: 63.06, c10: 63.56,
  exercitoB: 64.7, imagina: 65.46, sete: 66.26, vibra: 67.7, pessoal: 68.28, urgente: 69.06, missao: 69.8, familia: 72.06, c11: 72.56,
  radio: 73.2, so: 73.82, fala: 74.4, ouvem: 75.46, cada: 76.28, antena: 77.44, c12: 77.94,
  cinquenta: 79.44, onze: 81.04, tse: 82.64, tirar: 83.58, ar: 84.16, tecnicos: 84.78, fake: 86.06, c13: 87.6,
  eleicao: 88.48, palco: 89.38, nosso: 91.26, general: 91.64, c14: 92.36,
  mudou: 93.54, ninguem: 94.38, medir: 95.08, c15: 95.74,
  acha: 96.48, essenciais: 98.76, vitoria: 99.94, fim: 100.6, end: 102.6,
};

const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// Fall from `h` to 0 over [at, at + d] with one small bounce at the end.
const dropY = (t, at, h, d = 0.5) => { const k = lin(t, at, at + d); if (k < 0.72) return h * (1 - Math.pow(k / 0.72, 2)); return h * 0.05 * Math.sin(Math.PI * (k - 0.72) / 0.28); };

// ---------------------------------------------------------------- local pieces
// Vertical gradient sky on a far plane (backdrop). stops: [[0..1, colour], ...] top to bottom.
function gradSky(stops, { w = 160, h = 60, y = 16, z = -46 } = {}) {
  const c = makeCanvas(8, 512), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 512);
  for (const [k, col] of stops) gr.addColorStop(k, col); x.fillStyle = gr; x.fillRect(0, 0, 8, 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false, fog: false })); m.position.set(0, y, z); return asBackdrop(m);
}
// Far scenery that must not cast or catch the key light's shadow (its shadow map is sized to the hero: at a
// distance it turns into jagged blocks on the ground).
function noShadow(obj) { obj.traverse((n) => { n.userData.noShadow = true; }); return obj; }
// Six R$ 100 notes landing one by one, fanned on a table. Origin: table top. API { group, show(n) }
function makeNoteFan(n = 6) {
  const g = new THREE.Group(), notes = [], edge = pmat("#d9e3dc", { roughness: 0.9 }), face = pmat("#ffffff", { map: NOTE100, roughness: 0.75 });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.003, 0.37), [edge, edge, face, edge, edge, edge]);
    const piv = new THREE.Group(); piv.position.set(-0.05, 0.0025 + i * 0.0035, 0.12); piv.rotation.y = 0.55 - i * 0.2; m.position.x = 0.32; piv.add(m); g.add(piv); notes.push(piv);
  }
  g.add(contactShadow(1.6, 1.0));
  return { group: g, show: (k) => notes.forEach((nt, i) => { const u = clamp(k - i); nt.visible = u > 0.01; nt.position.y = 0.0025 + i * 0.0035 + 0.04 * (1 - eOut(u)); nt.position.z = 0.12 + 0.35 * (1 - eOut(u)); }) };
}
// Election-night wall of screens (backdrop): a dark wall with a 3 x 2 grid of glowing panels showing bars
// and a map-like blob, two floor glows. API { group, update(t), flash(k) }
function makeElectionScreens({ z = -3.2, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), mat("#151a24", { roughness: 0.9 })); wall.position.set(0, 8, z - 0.05); g.add(wall);
  const mats = [];
  for (let row = 0; row < 2; row++) for (let col = -1; col <= 1; col++) {
    const c = makeCanvas(256, 144), x = c.getContext("2d"); x.fillStyle = "#0b1a3a"; x.fillRect(0, 0, 256, 144);
    if ((row + col + 2) % 2) { for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? "#6fa8ff" : "#ff8a3c"; const h = 20 + r() * 100; x.fillRect(20 + i * 38, 130 - h, 24, h); } }
    else { x.fillStyle = "#2a5a9a"; x.beginPath(); x.ellipse(128, 72, 70, 52, 0.3, 0, Math.PI * 2); x.fill(); x.fillStyle = "#ff8a3c"; x.beginPath(); x.ellipse(150, 60, 30, 22, -0.2, 0, Math.PI * 2); x.fill(); }
    const m = new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false }); mats.push(m);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.4), m); sc.position.set(col * 2.75, 1.0 + row * 1.6, z); g.add(sc);
    const bez = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.52, 0.06), mat("#0a0a0c", { roughness: 0.4 })); bez.position.set(col * 2.75, 1.0 + row * 1.6, z - 0.04); g.add(bez);
  }
  for (const x of [-2.4, 2.4]) { const gl = makeFloorGlow(3.2, 2.4, { color: "#6fa8ff", opacity: 0.2 }); gl.position.set(x, 0.01, z + 1.6); g.add(gl); }
  const bk = makeBokeh({ n: 40, center: [0, 4, z - 1], spread: [16, 8, 2], size: [0.2, 0.7], colors: ["#6fa8ff", "#ffcf8a"], opacity: 0.35, seed: seed + 3 }); g.add(bk.group);
  asBackdrop(g); noShadow(g);
  return { group: g, update: (t) => bk.update(t), flash: (k) => mats.forEach((m) => m.color.setScalar(0.5 + 0.5 * k)) };
}
// Black plinth with a glow on the floor and a spotlight beam from above (backdrop), to lift a hero
// out of a busy background. Origin: floor centre; top at h. API { group, top, beam }
function makeHeroPlinth({ w = 1.1, d = 0.7, h = 0.5, color = "#2fae66" } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#141414", { roughness: 0.35, clearcoat: 0.8 })); b.position.y = h / 2; g.add(b);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.02, d + 0.01), new THREE.MeshBasicMaterial({ color, toneMapped: false })); rim.position.y = h - 0.03; g.add(rim);
  const glow = makeFloorGlow(w * 3.2, d * 3.2, { color, opacity: 0.35 }); glow.position.y = 0.01; g.add(glow);
  const beam = makeLightShaft([0, 6, 0.4], [0, 0, 0.2], { w0: 0.3, w1: 2.4, color: "#e9fff4", opacity: 0.16 }); g.add(beam.group);
  return { group: g, top: h, beam };
}
// Banker's desk lamp: brass base and stem, green glass shade, warm light under it (a point light and a
// glow on the desk). Origin: base centre on the desk. API { group }
function makeBankerLamp() {
  const g = new THREE.Group(), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.28 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.03, 32), brass); base.position.y = 0.015; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), brass); stem.position.y = 0.21; g.add(stem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.42, 32, 1, true, 0, Math.PI), pmat("#1f6b3a", { roughness: 0.15, clearcoat: 1, emissive: "#2f8a4a", emissiveIntensity: 0.6, side: THREE.DoubleSide }));
  shade.rotation.z = Math.PI / 2; shade.rotation.x = Math.PI / 2; shade.position.set(0, 0.4, 0.06); g.add(shade);
  const bulb = sprite(BOKEH, 0.6); bulb.material.color.set("#ffd9a0"); bulb.material.blending = THREE.AdditiveBlending; bulb.material.opacity = 0.8; bulb.position.set(0, 0.36, 0.08); bulb.userData.decor = true; g.add(bulb);
  const pool = makeFloorGlow(1.2, 0.9, { color: "#ffd9a0", opacity: 0.3 }); pool.position.set(0, 0.004, 0.3); g.add(pool);
  const light = new THREE.PointLight("#ffd9a0", 2.2, 3, 1.6); light.position.set(0, 0.32, 0.12); g.add(light);
  return { group: g };
}
// Walnut desk with a dark leather top. Origin: floor centre; top at h. API { group, top }
function makeWalnutDesk({ w = 2.6, d = 1.4, h = 0.78, leather = "#22302a" } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat(leather, { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}
// Phone leaning back on a small stand. Origin: floor of the stand (on a desk: put it at desk.top).
// API { group, phone }
function makePhoneOnStand({ lean = 0.16 } = {}) {
  const g = new THREE.Group(), ph = makePhone(), m = pmat("#2b2b2e", { metalness: 0.6, roughness: 0.35 });
  const base = new THREE.Mesh(rbox(0.62, 0.04, 0.5, 0.015), m); base.position.y = 0.02; g.add(base);
  const lip = new THREE.Mesh(rbox(0.62, 0.07, 0.05, 0.01), m); lip.position.set(0, 0.06, 0.12); g.add(lip);
  const back = new THREE.Mesh(rbox(0.5, 0.7, 0.035, 0.01), m); back.position.set(0, 0.36, -0.05); back.rotation.x = -lean; g.add(back);
  ph.group.rotation.x = -lean; ph.group.position.set(0, 0.04 + 0.82 * Math.cos(lean), 0.07 + 0.82 * Math.sin(lean) * -1 + 0.04); g.add(ph.group);
  return { group: g, phone: ph };
}
// Tripod with a phone mounted upright on top (screen +z). Origin: floor. API { group, phone }
function makePhoneTripod({ h = 1.25 } = {}) {
  const g = new THREE.Group(), ph = makePhone(), m = pmat("#1c1c1e", { metalness: 0.5, roughness: 0.4 }), metal = pmat("#9a9da2", { metalness: 0.9, roughness: 0.3 });
  const headY = h;
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 6, foot = new V3(Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48); g.add(strutBetween(new V3(0, headY - 0.05, 0), foot, 0.016, m)); }
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 10), metal); col.position.y = headY + 0.05; g.add(col);
  const clamp_ = new THREE.Mesh(rbox(0.5, 0.07, 0.08, 0.02), m); clamp_.position.y = headY + 0.17; g.add(clamp_);
  ph.group.position.set(0, headY + 0.17 + 0.82, 0.0); g.add(ph.group);
  const top = new THREE.Mesh(rbox(0.5, 0.06, 0.08, 0.02), m); top.position.y = headY + 0.17 + 1.64 + 0.02; g.add(top);
  return { group: g, phone: ph };
}
// Official sheet (makeCertificate) whose title takes two printed lines: big letters for short words.
function makeTwoLineDoc(l1, l2, o = {}) {
  const doc = makeCertificate(l1, o), w = o.w || 1.3, d = o.d || 1.7;
  const p = makePlate(l2, w * 0.8, d * 0.16, { bg: o.paper || "#f2ece0", fg: "#2a1d12", depth: 0.002 }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.013, -d * 0.32 + d * 0.17); doc.group.add(p);
  return doc;
}
// Kraft pay envelope lying flat, a plate printed on it; thick(k) swells it (more money inside).
// Origin: underside centre. API { group, thick(k) }
function makePayEnvelope(label = "SALÁRIO", { w = 0.7, d = 0.42 } = {}) {
  const g = new THREE.Group(), kraft = pmat("#c9a06a", { roughness: 0.85 });
  const body = new THREE.Group(); g.add(body);
  const env = new THREE.Mesh(rbox(w, 0.03, d, 0.008), kraft); env.position.y = 0.015; body.add(env);
  const flap = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.52, w * 0.52, 0.004, 3, 1), pmat("#b88f5c", { roughness: 0.85 })); flap.rotation.y = Math.PI / 2; flap.scale.set(1, 1, 0.42); flap.position.set(0, 0.032, -d * 0.18); body.add(flap);
  const notes = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.02, d * 0.25), pmat("#ffffff", { map: NOTE100, roughness: 0.7 })); notes.position.set(0, 0.022, d * 0.42); body.add(notes);
  const p = makePlate(label, w * 0.82, d * 0.44, { bg: "#c9a06a", fg: "#2a1a0c", depth: 0.002 }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.035, d * 0.12); body.add(p);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, thick: (k) => { env.scale.y = 1 + 1.6 * k; env.position.y = 0.015 * (1 + 1.6 * k); p.position.y = 0.035 + 0.048 * k; flap.position.y = 0.032 + 0.048 * k; notes.position.y = 0.022 + 0.04 * k; notes.position.z = d * (0.42 + 0.12 * k); } };
}
// Stack of loose papers with a plate standing on its front edge. Origin: floor centre.
function makeDebtPile(label, { w = 0.62, d = 0.46, n = 9 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), pmat(i % 2 ? "#f6f3ec" : "#e8e1d2", { roughness: 0.9 })); s.position.y = 0.006 + i * 0.013; s.rotation.y = Math.sin(i * 2.3) * 0.07; g.add(s); }
  const p = makePlate(label, w * 1.15, 0.24, { bg: "#7a1c14", fg: "#ffffff", depth: 0.02 }); p.position.set(0, 0.08, d / 2 + 0.03); p.rotation.x = -0.25; g.add(p);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return g;
}
// Column of ballot papers (slabs) with a name plate on its base and a value plate on top; set(n) shows
// n slabs (the top plate rides on the top). Origin: floor centre. API { group, set(n), top() }
function makeBallotColumn(max, { w = 0.9, d = 0.7, slab = 0.09, base = "", value = "", paper = "#f2eee4" } = {}) {
  const g = new THREE.Group(), slabs = [];
  const PH = 0.32, plinth = new THREE.Mesh(rbox(w + 0.2, PH, d + 0.2, 0.03), pmat("#1e1a17", { roughness: 0.45, clearcoat: 0.5 })); plinth.position.y = PH / 2; g.add(plinth);
  const bp = makePlate(base, w + 0.1, 0.26, { bg: "#1e1a17", fg: "#f4e8da", depth: 0.01 }); bp.position.set(0, PH / 2, (d + 0.2) / 2 + 0.006); g.add(bp);
  for (let i = 0; i < max; i++) {
    const s = new THREE.Mesh(rbox(w, slab * 0.92, d, 0.01), pmat(i % 5 === 4 ? "#d9d2c3" : paper, { roughness: 0.9 })); s.position.y = PH + slab * (i + 0.5); s.rotation.y = Math.sin(i * 1.9) * 0.03; g.add(s); slabs.push(s);
  }
  const vp = makePlate(value, w * 1.05, 0.26, { bg: ORANGE, fg: "#ffffff", depth: 0.03 }); g.add(vp);
  let cur = max;
  const set = (n) => { cur = n; slabs.forEach((s, i) => { const k = clamp(n - i); s.visible = k > 0.02; s.scale.set(1, Math.max(0.02, k), 1); }); vp.position.set(0, PH + slab * n + 0.2, d * 0.15); };
  set(max);
  return { group: g, set, top: () => PH + slab * cur, plates: { bp, vp } };
}

// ---------------------------------------------------------------- phone screens (720 × 1500, generic UI, no logo)
const CH_GREEN = "#0e5a43";
function chHeader(x, sub) {
  x.fillStyle = CH_GREEN; x.fillRect(0, 0, 720, 230);
  x.fillStyle = ORANGE; x.beginPath(); x.arc(110, 140, 60, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#fff"; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 16 : 38; x.lineTo(110 + Math.cos(a) * r, 142 + Math.sin(a) * r); } x.closePath(); x.fill();
  x.textAlign = "left"; x.fillStyle = "#fff"; x.font = "800 50px Inter"; x.fillText("Exército do Lula", 196, 128);
  x.fillStyle = "#bfe6d6"; x.font = "600 32px Inter"; x.fillText(sub, 196, 180);
}
function paintChannel(ctx, { sub = "Canal · seguidores", dim = 0 } = {}) {
  const x = ctx; x.fillStyle = "#0d1311"; x.fillRect(0, 0, 720, 1500); chHeader(x, sub);
  x.fillStyle = "#1d2b26"; roundRect(x, 40, 280, 640, 230, 30); x.fill();
  x.fillStyle = "#fff"; x.font = "900 60px Inter"; x.fillText("Pessoal, urgente!", 80, 370);
  x.fillStyle = "#cfe9de"; x.font = "600 36px Inter"; x.fillText("Missão do dia: compartilhe", 80, 440);
  const gr = x.createLinearGradient(0, 560, 0, 980); gr.addColorStop(0, "#2a3a52"); gr.addColorStop(1, "#141a24");
  x.fillStyle = gr; roundRect(x, 40, 560, 640, 420, 30); x.fill();
  x.fillStyle = "rgba(255,255,255,0.92)"; x.beginPath(); x.arc(360, 770, 70, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#141a24"; x.beginPath(); x.moveTo(340, 730); x.lineTo(340, 810); x.lineTo(405, 770); x.closePath(); x.fill();
  x.fillStyle = "#9fd3bf"; x.font = "700 34px Inter"; x.fillText("♥ 120 mil   ↗ 48 mil", 60, 1040);
  x.fillStyle = "#1d2b26"; roundRect(x, 40, 1100, 640, 170, 30); x.fill();
  x.fillStyle = "#fff"; x.font = "800 44px Inter"; x.fillText("Nova missão no ar", 80, 1200);
  x.fillStyle = "#2fae66"; roundRect(x, 200, 1330, 320, 96, 48); x.fill(); x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "800 40px Inter"; x.fillText("Seguindo", 360, 1392);
  if (dim > 0) { x.fillStyle = `rgba(0,0,0,${dim})`; x.fillRect(0, 0, 720, 1500); }
}
function paintCounter(ctx, { value = "50 mil", k = 0 } = {}) {
  const x = ctx; x.fillStyle = "#0d1311"; x.fillRect(0, 0, 720, 1500); chHeader(x, "Canal · seguidores");
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "900 150px Inter"; x.fillText(value, 360, 560);
  x.fillStyle = "#9fd3bf"; x.font = "700 52px Inter"; x.fillText("seguidores", 360, 650);
  x.strokeStyle = "rgba(255,255,255,0.1)"; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(60, 820 + i * 110); x.lineTo(660, 820 + i * 110); x.stroke(); }
  x.strokeStyle = "#2fae66"; x.lineWidth = 12; x.lineJoin = "round"; x.beginPath();
  const n = Math.max(2, Math.round(60 * k));
  for (let i = 0; i <= n; i++) { const u = i / 60, y = 1260 - 440 * Math.pow(u, 2.2) - Math.sin(u * 20) * 6; i ? x.lineTo(60 + u * 600, y) : x.moveTo(60, y); }
  x.stroke();
}
function paintLock(ctx, { time = "6:59", notif = 0, wake = 1 } = {}) {
  const x = ctx, gr = x.createLinearGradient(0, 0, 0, 1500); gr.addColorStop(0, "#26325a"); gr.addColorStop(1, "#c86a3a");
  x.fillStyle = gr; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "800 190px Inter"; x.fillText(time, 360, 400);
  x.font = "600 40px Inter"; x.fillText("segunda-feira", 360, 470);
  if (notif > 0) {
    const y = 560 - 80 * (1 - eOut(notif)); x.globalAlpha = clamp(notif * 1.5);
    x.fillStyle = "rgba(245,245,245,0.95)"; roundRect(x, 40, y, 640, 300, 40); x.fill();
    x.fillStyle = CH_GREEN; x.beginPath(); x.arc(110, y + 75, 36, 0, Math.PI * 2); x.fill();
    x.textAlign = "left"; x.fillStyle = "#333"; x.font = "700 32px Inter"; x.fillText("Exército do Lula · agora", 170, y + 88);
    x.fillStyle = "#111"; x.font = "900 60px Inter"; x.fillText("Pessoal, urgente!", 80, y + 185);
    x.fillStyle = "#444"; x.font = "600 34px Inter"; x.fillText("Missão do dia: espalhe o vídeo", 80, y + 250);
    x.globalAlpha = 1;
  }
  if (wake < 1) { x.fillStyle = `rgba(0,0,0,${1 - wake})`; x.fillRect(0, 0, 720, 1500); }
}
function paintMission(ctx, { sent = 0 } = {}) {
  const x = ctx; x.fillStyle = "#0d1311"; x.fillRect(0, 0, 720, 1500); chHeader(x, "Canal · agora");
  x.fillStyle = ORANGE; roundRect(x, 40, 280, 640, 300, 30); x.fill();
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "900 74px Inter"; x.fillText("MISSÃO DO DIA", 360, 400);
  x.font = "700 40px Inter"; x.fillText("Mande este vídeo", 360, 480); x.fillText("para 5 grupos", 360, 532);
  const gr = x.createLinearGradient(0, 630, 0, 1010); gr.addColorStop(0, "#2a3a52"); gr.addColorStop(1, "#141a24"); x.fillStyle = gr; roundRect(x, 40, 630, 640, 380, 30); x.fill();
  x.fillStyle = "rgba(255,255,255,0.92)"; x.beginPath(); x.arc(360, 820, 66, 0, Math.PI * 2); x.fill(); x.fillStyle = "#141a24"; x.beginPath(); x.moveTo(342, 782); x.lineTo(342, 858); x.lineTo(402, 820); x.closePath(); x.fill();
  const groups = ["Família", "Tios e primos", "Vizinhos", "Trabalho", "Igreja"];
  groups.forEach((gname, i) => { const y = 1070 + i * 80, on = sent > i; x.fillStyle = on ? "#1f3d32" : "#1a1f1d"; roundRect(x, 40, y, 640, 66, 20); x.fill(); x.textAlign = "left"; x.fillStyle = "#e9f5ef"; x.font = "700 34px Inter"; x.fillText(gname, 80, y + 45); x.textAlign = "right"; x.fillStyle = on ? "#2fae66" : "#6b7a74"; x.fillText(on ? "enviado ✓" : "enviar", 650, y + 45); });
}
function paintAudio(ctx, { prog = 0 } = {}) {
  const x = ctx; x.fillStyle = "#121212"; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "800 52px Inter"; x.fillText("Gravação de áudio", 360, 200);
  x.fillStyle = "#b9b0a6"; x.font = "600 36px Inter"; x.fillText("reunião · fevereiro de 2019", 360, 262);
  const r = mulberry32(19), N = 46, bw = 10;
  for (let i = 0; i < N; i++) { const h = 40 + r() * 300 * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.37))), xx = 60 + i * 13; x.fillStyle = i / N < prog ? ORANGE : "#4a4440"; roundRect(x, xx, 720 - h / 2, bw, h, 5); x.fill(); }
  x.fillStyle = "#fff"; x.fillRect(60 + prog * 600, 520, 4, 400);
  const s = Math.round(134 * prog); x.fillStyle = "#e9dccf"; x.font = "700 40px Inter"; x.textAlign = "left"; x.fillText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, 60, 1010); x.textAlign = "right"; x.fillText("2:14", 660, 1010);
  x.fillStyle = ORANGE; x.beginPath(); x.arc(360, 1220, 110, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#fff"; x.fillRect(325, 1170, 26, 100); x.fillRect(370, 1170, 26, 100);
}
function paintLive(ctx, { label = "2 mil" } = {}) {
  const x = ctx, gr = x.createLinearGradient(0, 0, 0, 1500); gr.addColorStop(0, "#3b3150"); gr.addColorStop(0.5, "#b7623a"); gr.addColorStop(0.62, "#3a3836"); gr.addColorStop(1, "#1e1d1c");
  x.fillStyle = gr; x.fillRect(0, 0, 720, 1500);
  // the trucks the phone is filming, flat silhouettes on the road
  for (const [cx, s] of [[230, 1], [470, 0.75], [610, 0.55]]) { x.fillStyle = "#121212"; x.fillRect(cx - 120 * s, 860 - 200 * s, 240 * s, 190 * s); x.fillRect(cx - 120 * s, 860 - 120 * s, -60 * s, 110 * s); x.fillStyle = "#ffd28a"; x.fillRect(cx - 100 * s, 845 - 20 * s, 30 * s, 12 * s); }
  x.fillStyle = "#e0261b"; roundRect(x, 40, 60, 230, 76, 16); x.fill(); x.fillStyle = "#fff"; x.textAlign = "left"; x.font = "900 40px Inter"; x.fillText("● AO VIVO", 62, 113);
  x.fillStyle = "rgba(0,0,0,0.55)"; roundRect(x, 40, 1180, 640, 240, 30); x.fill();
  x.textAlign = "center"; x.fillStyle = "#fff"; let fs = 120; x.font = `900 ${fs}px Inter`; while (x.measureText(label).width > 600 && fs > 40) { fs -= 4; x.font = `900 ${fs}px Inter`; } x.fillText(label, 360, 1320);
  x.font = "700 40px Inter"; x.fillStyle = "#e9dccf"; x.fillText("visualizações", 360, 1385);
}
function paintFeed(ctx) {
  const x = ctx; x.fillStyle = "#0d1311"; x.fillRect(0, 0, 720, 1500); chHeader(x, "Canal · 10,9 mi seguidores");
  const r = mulberry32(5);
  for (let i = 0; i < 6; i++) { const y = 270 + i * 200; x.fillStyle = "#1d2b26"; roundRect(x, 40, y, 640, 170, 26); x.fill(); x.fillStyle = "#e9f5ef"; for (let l = 0; l < 3; l++) { x.fillRect(80, y + 40 + l * 42, 360 + r() * 200, 18); } }
}
// Phone crowd standing on the floor (backdrop), screens painted with the channel; light(fn) tints them.
function phoneField(S, { rows = 22, cols = 10, z0 = -1.4 } = {}) {
  const c = makeCanvas(720, 1500); paintChannel(c.getContext("2d"), { sub: "Canal · seguindo" }); const tex = texFrom(c);
  const f = makePhoneCrowd(tex, { rows, cols, sx: 1.05, sz: 1.25, z0, max: 460, seed: 23 });
  const g = new THREE.Group(); g.add(f.bodies, f.screens); asBackdrop(g); noShadow(g); S.backdrop(g);
  const sky = gradSky([[0, "#05070f"], [0.45, "#13163a"], [0.75, "#3a1f4a"], [1, "#a0462e"]]); S.backdrop(sky);
  const city = makeSkyline({ n: 26, z: -40, spread: 70, seed: 6, hMin: 3, hMax: 9 }); noShadow(city.group); S.backdrop(city.group);
  for (const x of [-5, 5]) { const sh = makeLightShaft([x, 9, z0 - 6], [x * 0.3, 0, z0 - 2], { w0: 0.4, w1: 5, color: "#9fe0c0", opacity: 0.12 }); S.backdrop(sh.group); }
  const bk = makeBokeh({ n: 50, center: [0, 5, z0 - 18], spread: [40, 12, 10], size: [0.4, 1.4], colors: ["#2fae66", "#9fe0c0", "#ffcf8a"], opacity: 0.4, seed: 8 }); asBackdrop(bk.group); S.backdrop(bk.group);
  const col = new THREE.Color();
  return { f, bk, city, light: (fn) => f.tint((it, i) => col.setScalar(0.55 * clamp(fn(it, i), 0.06, 1))) };
}

// ============================================================ 1 · gancho
// "Esse homem ajudou a definir as eleições." Rally at night: his portrait on a riser and, beside it, the
// voting machine; on "eleições" the machine shows FIM.
addScene("gancho", 0, A.c1, (S) => {
  const rally = makeRallyNight({ crowdZ: -2.6, seed: 3 }); noShadow(rally.group); S.backdrop(rally.group);
  const riser = new THREE.Mesh(rbox(4.4, 0.3, 2.2, 0.03), pmat("#1b1714", { roughness: 0.5, clearcoat: 0.4 })); riser.position.set(0, 0.15, 0.1); S.add(riser);
  const fr = makePhotoFrame("janones", { w: 1.75 }); fr.group.position.set(-0.2, 0.3, 0); S.add(fr.group);
  const ped = new THREE.Mesh(rbox(1.0, 0.6, 0.76, 0.03), pmat("#2a2522", { roughness: 0.45, clearcoat: 0.5 })); ped.position.set(0.85, 0.6, 0.95); S.add(ped);
  const urn = makeElectronicUrn({ w: 0.98, d: 0.66 }); urn.group.position.set(0.85, 0.9, 0.95); urn.group.rotation.y = -0.4; S.add(urn.group);
  let painted = null;
  const anim = (t) => {
    rally.update(t); rally.lights(1 + 0.6 * beat(t, A.eleicoes, 0.6)); key.intensity = 2.0; key.color.set("#ffd9b8");
    fr.zoom(1 + 0.12 * lin(t, 0, A.c1)); fr.frame.rotation.y = 0.5 * (1 - eOut(lin(t, 0, 0.7)));
    const want = t < A.eleicoes ? "a" : "b"; if (want !== painted) { painted = want; if (want === "a") urn.paint(["SEU VOTO PARA", "PRESIDENTE"]); else urn.paint([""], "FIM"); }
  };
  S.hero(fr.group, "porta-retrato com foto"); S.hero(urn.group, "urna eletrônica");
  const box = envelope([fr.group, urn.group], anim, 0, A.c1);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.12, 0.18, 1], pull0: 1.18, pull: 1.0 })); };
});

// ============================================================ 2 · quem é + o canal
// Card (overlay) with his photo while the camera drifts over a field of phones; at "criador do Exército do
// Lula" a phone with the channel pops in front; on "milhões de soldados" the field lights up row by row.
addScene("quem", A.c1, A.c2, (S) => {
  const P = phoneField(S, { z0: -2.2 });
  const pl = makeHeroPlinth(); pl.group.position.set(0, 0, 1.4); S.backdrop(pl.group);
  const ph = makePhone(); paintChannel(ph.ctx, { sub: "Canal · milhões de seguidores" }); ph.tex.needsUpdate = true;
  ph.group.position.set(0, pl.top + 0.84, 1.4); S.add(ph.group);
  const B = A.criador - 0.1;
  const anim = (t) => {
    P.bk.update(t); P.city.update(t); key.intensity = 1.6; key.color.set("#e6fff3"); hemi.intensity = 0.35;
    popIn(ph.group, t, B, 0.45); popIn(pl.group, t, B - 0.1, 0.45); ph.group.rotation.y = 0.35 * (1 - eOut(lin(t, B, B + 0.8))) - 0.08 * Math.sin((t - B) * 0.8);
    const wave = lin(t, A.milhoes - 0.3, A.soldados + 0.5);
    P.light((it) => 0.4 + 0.6 * clamp((wave * 26 - (-2.2 - it.z) / 1.25) / 3));
  };
  S.hero(ph.group, "celular com canal", { when: (t) => t > B + 0.5 });
  const box = envelope([ph.group], anim, B + 0.5, A.c2);
  const wide = CAM.pose(new THREE.Box3(new V3(-2.5, 0, -7.5), new V3(2.5, 2.2, -1.5)), { zone: "stage", from: [0, 0.45, 1] });
  return (t) => {
    anim(t);
    const pr = CAM.move(box, "reveal", lin(t, B, A.c2), { zone: "stage", from: [0.1, 0.18, 1], pull: 1.0, pull0: 1.22 });
    CAM.apply(t < B ? CAM.blend(wide, CAM.move(box, "reveal", 0, { zone: "stage", from: [0.1, 0.18, 1], pull: 1.0, pull0: 1.45 }), sm(t, A.c1, B) * 0.35) : pr);
  };
});

// ============================================================ 3 · dois lados (a medalha)
// On a desk in an office at night, a medal spins on its edge: gold face on "dois", dark face on "lados".
function medalDesk(S, seed = 4) {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 1.6, seed }); S.backdrop(off.group);
  const desk = makeWalnutDesk({ w: 2.6, d: 1.4 }); S.add(desk.group);
  const md = makeTwoFaceMedal({ r: 0.42 }); md.group.position.set(0, desk.top, 0.05); S.add(md.group);
  const lamp = makeBankerLamp(); lamp.group.position.set(-0.85, desk.top, -0.4); lamp.group.rotation.y = 0.5; S.add(lamp.group);
  md.lite = () => { fill.position.set(0.7, desk.top + 1.0, 1.4); fill.color.set("#ffd9a8"); fill.intensity = 3.2; };
  return { off, desk, md };
}
addScene("lados", A.c2, A.c3, (S) => {
  const { off, md } = medalDesk(S);
  const anim = (t) => {
    off.update(t); off.lights(0.8); key.intensity = 2.0; key.color.set("#ffe2c4"); md.lite();
    const a = t < A.dois ? 4 * Math.PI * eOut(lin(t, A.c2, A.dois)) : 4 * Math.PI + Math.PI * sm(t, A.dois + 0.08, A.lados + 0.2);
    md.spin(a + 0.08 * Math.sin(t * 3));
  };
  S.hero(md.group, "medalha de dois lados");
  const box = envelope([md.group], anim, A.c2, A.c3);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c2, A.c3), { zone: "stage", from: [0, 0.3, 1], deg: 34, pull: 1.12 })); };
});

// ============================================================ 4 · ônibus → greve dos caminhoneiros
// A: a city bus drives up a street at dawn ("ex-cobrador de ônibus"). B (cut at "explodiu"): on a highway
// at dusk, trucks stopped in line; in front, a phone on a tripod films them and the views climb to 15 mi.
addScene("origem", A.c3, A.c4, (S) => {
  const B = A.explodiu - 0.15;
  const bgA = new THREE.Group(); S.backdrop(bgA);
  bgA.add(gradSky([[0, "#1a2244"], [0.6, "#5a5a7a"], [0.82, "#e09a6a"], [1, "#f4c48a"]]));
  const roadA = makeTwoLaneRoad({ lane: 2.0, back: 70, front: 8 }); bgA.add(roadA.group);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#ffffff", { map: tileTex(grassTex(), 50, 50), roughness: 1, color: "#7a8a5a" })); grass.rotation.x = -Math.PI / 2; grass.position.y = -0.003; bgA.add(grass);
  for (let i = 0; i < 10; i++) { const s = i % 2 ? 1 : -1, hs = makeHouse({ w: 3.2, h: 2.3, d: 2.8, roofH: 1.2, wall: ["#e8d9c2", "#d9b48a", "#c9d4c8", "#e4c9a8"][i % 4], roof: i % 3 ? "#9a3a22" : "#6a4a3a" }); hs.position.set(s * (6.2 + (i % 3) * 0.6), 0, -3 - i * 4.2); hs.rotation.y = -s * Math.PI / 2; bgA.add(hs); }
  asBackdrop(bgA); noShadow(bgA);
  const bus = makeCityBus({ dest: "ITUIUTABA", L: 5.8 }); bus.group.rotation.y = -Math.PI / 2; S.add(bus.group);
  const bgB = new THREE.Group(); bgB.position.x = 60; S.backdrop(bgB);
  bgB.add(gradSky([[0, "#151a38"], [0.55, "#4a3a5a"], [0.8, "#c8643a"], [1, "#f0a060"]]));
  const roadB = makeTwoLaneRoad({ lane: 2.4, back: 90, front: 8 }); bgB.add(roadB.group);
  const grassB = grass.clone(); grassB.material = grass.material.clone(); grassB.material.color.set("#5a5a40"); bgB.add(grassB);
  const trucks = [];
  for (let i = 0; i < 6; i++) { const tr = makeCargoTruck({ body: ["#e7e3dc", "#d6c9b0", "#c9d2da"][i % 3], cab: ["#2f3e52", "#7a2a1e", "#2f4a3a"][i % 3] }); tr.group.rotation.y = -Math.PI / 2; tr.group.position.set(i % 2 ? -1.2 : 1.2, 0, -3.5 - Math.floor(i / 2) * 6.5 - (i % 2) * 1.5); bgB.add(tr.group); trucks.push(tr); }
  asBackdrop(bgB); noShadow(bgB);
  const tri = makePhoneTripod({ h: 0.55 }); tri.group.position.set(60, 0, 2.2); S.add(tri.group);
  let lastV = -1;
  const anim = (t) => {
    const a = t < B; bus.group.visible = bgA.visible = a; tri.group.visible = bgB.visible = !a;
    key.intensity = a ? 1.8 : 1.6; key.color.set(a ? "#ffd8b0" : "#ffbe8a"); hemi.intensity = 0.4;
    const z = lerp(-4.2, 0.2, lin(t, A.c3, B)); bus.group.position.set(1.0, 0, z); bus.spin((z + 4.2) / 0.27);
    const v = 15 * sm(t, A.quinze - 0.8, A.quinze + 0.5) + 0.002 + 0.08 * Math.pow(lin(t, B, A.quinze - 0.7), 2);
    const lab = v < 1 ? Math.max(2, Math.round(v * 200) * 5) + " mil" : Math.round(v) + (Math.round(v) === 1 ? " milhão" : " milhões"); if (!a && lab !== lastV) { lastV = lab; paintLive(tri.phone.ctx, { label: lab }); tri.phone.tex.needsUpdate = true; }
  };
  S.hero(bus.group, "ônibus urbano", { when: (t) => t < B - 0.05 });
  S.hero(tri.group, "celular no tripé filmando", { when: (t) => t > B + 0.3 });
  const bA = envelope([bus.group], anim, A.c3, B - 0.05), bB = envelope([tri.group], anim, B + 0.3, A.c4);
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "truck", lin(t, A.c3, B), { zone: "stage", from: [0.75, 0.22, 1], side: 0.35, pull: 1.05 }));
    else CAM.apply(CAM.move(bB, "crane", lin(t, B, A.c4), { zone: "stage", from: [0.18, 0.32, 1], rise: 0.2, pull: 1.0 }));
  };
});

// ============================================================ 5 · deputado, auxílio, 2022
// A: the Congress at dusk over the reflecting pool. B (cut at "defendeu"): on a kitchen table at night, a
// stack of R$ 600. C (cut at "largou"): the 2022 photo with Lula in a frame on the same table.
addScene("deputado", A.c4, A.c5, (S) => {
  const B = A.defendeu - 0.12, C = A.largou - 0.1;
  const bgA = new THREE.Group(); S.backdrop(bgA);
  bgA.add(gradSky([[0, "#0e1636"], [0.55, "#3a3f72"], [0.82, "#d07a4a"], [1, "#f2b27a"]]));
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#ffffff", { map: tileTex(grassTex(), 60, 60), roughness: 1, color: "#4a5a3a" })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -0.003; bgA.add(lawn);
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), pmat("#1c2a44", { roughness: 0.05, metalness: 0.3, clearcoat: 1 })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.004, 3.4); bgA.add(pool);
  asBackdrop(bgA); noShadow(bgA);
  const cong = makeCongressBuilding(); S.add(cong.group);
  const living = makeNightLivingRoom({ wallZ: -1.6, seed: 12, pendant: false }); living.group.position.x = 40; S.backdrop(living.group);
  const table = makeDiningTable({ w: 2.6, d: 1.3, clothColor: "#3a2420" }); table.group.position.set(40, 0, 0); S.add(table.group);
  const tTop = table.topY;
  const fan = makeNoteFan(6), money = fan.group; money.position.set(40, tTop, 0.05); S.add(money);
  const fr = makePhotoFrame("alianca2022", { w: 1.9, name: "AGOSTO DE 2022" }); fr.group.position.set(40, tTop, -0.05); S.add(fr.group);
  const anim = (t) => {
    const a = t < B, b = t >= B && t < C, c = t >= C;
    cong.group.visible = bgA.visible = a; money.visible = b; fr.group.visible = c; living.group.visible = table.group.visible = !a;
    living.update(t); living.light(0.9);
    key.intensity = a ? 1.7 : 1.8; key.color.set(a ? "#ffcfa0" : "#ffdcb8"); hemi.intensity = a ? 0.45 : 0.35;
    cong.glow(sm(t, A.c4, A.c4 + 1.2));
    if (b) fan.show(6 * sm(t, B, A.seiscentos + 0.6));
    if (c) { popIn(fr.group, t, C, 0.45); fr.frame.rotation.y = 0.9 * (1 - eOut(lin(t, C, C + 0.7))); fr.zoom(1 + 0.12 * lin(t, C, A.c5)); }
  };
  S.hero(cong.group, "Congresso Nacional", { when: (t) => t < B - 0.05 });
  S.hero(money, "seis notas de R$ 100", { when: (t) => t > A.seiscentos + 0.8 && t < C - 0.05 });
  S.hero(fr.group, "porta-retrato Lula e Janones", { when: (t) => t > C + 0.5 });
  S.solid(table.group, "mesa", { when: (t) => t >= B });
  const bA = envelope([cong.group], anim, A.c4, B - 0.05), bB = envelope([money], anim, A.seiscentos + 0.8, C - 0.05), bC = envelope([fr.group], anim, C + 0.5, A.c5);
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "crane", lin(t, A.c4, B), { zone: "stage", from: [0.25, 0.32, 1], rise: 0.2, pull: 1.04 }));
    else if (t < C) CAM.apply(CAM.move(bB, "push", lin(t, B, C), { zone: "stage", from: [-0.15, 1.1, 1], pull0: 1.3, pull: 1.04 }));
    else CAM.apply(CAM.move(bC, "orbit", lin(t, C, A.c5), { zone: "stage", from: [0, 0.18, 1], deg: 46, pull: 1.0 }));
  };
});

// ============================================================ 6 · o outro lado: o áudio
// A: the medal turns to its dark face ("o outro lado"). B (cut at "2023"): on the desk, a phone plays the
// recording; the pay envelope swells ("salário maior") and slides onto the pile of campaign debts.
addScene("audio", A.c5, A.c6, (S) => {
  const B = A.a2023 - 0.08;
  const { off, desk, md } = medalDesk(S, 7);
  const st = makePhoneOnStand(); st.group.position.set(-0.78, desk.top, -0.2); st.group.rotation.y = 0.22; S.add(st.group);
  const env = makePayEnvelope("SALÁRIO", { w: 0.85, d: 0.5 }); env.group.position.set(0.02, desk.top, 0.3); env.group.rotation.y = -0.06; S.add(env.group);
  const pile = makeDebtPile("DÍVIDAS", { w: 0.8, d: 0.55 }); pile.position.set(0.72, desk.top, -0.18); S.add(pile);
  let lastP = -1;
  const anim = (t) => {
    off.update(t); off.lights(0.75); key.intensity = 1.9; key.color.set("#ffe2c4"); md.lite();
    const a = t < B; md.group.visible = a; st.group.visible = env.group.visible = pile.visible = !a;
    md.spin(Math.PI * sm(t, A.c5 + 0.05, A.c5 + 0.7) + 0.06 * Math.sin(t * 3));
    if (!a) {
      popIn(st.group, t, B, 0.4); popIn(pile, t, A.salario - 0.4, 0.35); popIn(env.group, t, A.salario - 0.2, 0.35);
      const p = Math.round(lin(t, A.vaza - 0.2, A.c6) * 60) / 60; if (p !== lastP) { lastP = p; paintAudio(st.phone.ctx, { prog: p }); st.phone.tex.needsUpdate = true; }
      env.thick(sm(t, A.salario + 0.1, A.assessores));
      const k = sm(t, A.dividas - 0.3, A.dividas + 0.4); env.group.position.set(lerp(0.02, 0.72, k), desk.top + lerp(0, 0.13, k) + 0.1 * Math.sin(Math.PI * k), lerp(0.3, -0.26, k));
    }
  };
  S.hero(md.group, "medalha lado escuro", { when: (t) => t < B - 0.05 });
  S.hero(st.group, "celular tocando áudio", { when: (t) => t > B + 0.4 });
  S.hero(env.group, "envelope de salário", { when: (t) => t > A.salario + 0.2 });
  S.hero(pile, "pilha de dívidas", { when: (t) => t > A.salario + 0.45 });
  const bA = envelope([md.group], anim, A.c5, B - 0.05), bB = envelope([st.group, env.group, pile], anim, A.salario + 0.2, A.c6), bB0 = envelope([st.group], anim, B + 0.4, A.salario);
  const pB0 = CAM.pose(bB0, { zone: "stage", from: [0.25, 0.25, 1], pull: 1.1 });
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "push", lin(t, A.c5, B), { zone: "stage", from: [-0.1, 0.25, 1], pull0: 1.3, pull: 1.12 }));
    else CAM.apply(CAM.track(t, [[B, pB0], [A.salario + 0.4, CAM.move(bB, "truck", lin(t, A.salario, A.c6), { zone: "stage", from: [0, 0.95, 1], side: 0.25, pull: 1.0 }), 0.9]]));
  };
});

// ============================================================ 7 · rachadinha
// At the PF desk: the card bill of the "DEPUTADO" on the leather; the bank card "ASSESSOR" lands on it;
// the windows flash red and blue on "rachadinha"; on "público" the stamp prints INDICIADO.
addScene("rachadinha", A.c6, A.c7, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.0, seed: 9, wall: "#4a4f5a", ceil: 10 }); S.backdrop(off.group);
  const desk = makeWalnutDesk({ w: 2.6, d: 1.4, leather: "#1f2a35" }); S.add(desk.group);
  const bill = makeInvoiceSheet({ w: 1.2, d: 1.5, title: "FATURA: DEPUTADO", issuer: "PAGA POR:", to: "" }); bill.group.position.set(-0.15, desk.top, 0.05); bill.group.rotation.y = 0.05; S.add(bill.group);
  const card = makeBankCard({ name: "ASSESSOR", w: 1.05 }); card.group.rotation.x = -Math.PI / 2; S.add(card.group);
  const stamp = makeStamp({ w: 0.62, d: 0.26 }); S.add(stamp);
  const ink = makeInkMark("INDICIADO", 0.62, 0.26); ink.rotation.x = -Math.PI / 2; ink.position.set(-0.15, desk.top + bill.top + 0.004, 0.62); ink.visible = false; S.add(ink);
  const SH = A.publico - 0.3;
  const anim = (t) => {
    off.update(t); off.lights(0.85); off.windows(beat(t, A.rachadinha - 0.1, 1.2), "#ff3b2f"); key.intensity = 1.9; key.color.set("#f3f0ff");
    popIn(bill.group, t, A.c6 + 0.02, 0.35);
    const ck = eOut(lin(t, A.assessor - 0.45, A.assessor + 0.15));
    card.group.visible = t > A.assessor - 0.45; card.group.position.set(lerp(0.9, -0.15, ck), desk.top + bill.top + 0.01 + 0.5 * (1 - ck), lerp(0.6, 0.26, ck)); card.group.rotation.z = 0.6 * (1 - ck) - 0.06;
    const sk = t < SH ? 0 : t < SH + 0.22 ? sm(t, SH, SH + 0.22) : 1 - sm(t, SH + 0.45, SH + 0.8);
    stamp.visible = t > SH - 0.4; stamp.position.set(-0.15, desk.top + bill.top + 0.005 + 0.75 * (1 - sk), 0.62);
    ink.visible = t > SH + 0.2;
  };
  S.hero(bill.group, "fatura do cartão", { when: (t) => t > A.c6 + 0.4 });
  S.hero(card.group, "cartão do assessor", { when: (t) => t > A.assessor + 0.2 });
  S.solid(desk.group, "mesa");
  const box = envelope([bill.group, card.group], anim, A.assessor + 0.2, A.c7);
  return (t) => { anim(t); let p = CAM.move(box, "drop", lin(t, A.c6, A.c7), { zone: "stage", from: [0.05, 1.5, 1], rise: 0.2, pull: 1.0 }); p = CAM.shake(p, t, SH + 0.22, 0.04, 0.3); CAM.apply(p); };
});

// ============================================================ 8 · o acordo
// In a courtroom: the agreement on the desk; bundles of money stack up beside it with the value plate.
addScene("acordo", A.c7, A.c8, (S) => {
  const court = makeCourtroomSet({ wallZ: -4.2, seed: 6, ceil: 14 }); S.backdrop(court.group);
  const desk = makeWalnutDesk({ w: 2.8, d: 1.85, leather: "#2a1f1a" }); S.add(desk.group);
  const doc = makeTwoLineDoc("ACORDO", "COM A PGR", { w: 1.15, d: 1.45 }); doc.group.position.set(-0.5, desk.top, 0.05); doc.group.rotation.y = 0.08; S.add(doc.group);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 12), pmat("#1b1b1d", { roughness: 0.3, clearcoat: 1 })); pen.rotation.z = Math.PI / 2; pen.rotation.y = 1.25; pen.position.set(-1.22, desk.top + 0.026, 0.25); S.add(pen);
  const cash = new THREE.Group(); cash.position.set(0.55, desk.top, 0.0); S.add(cash);
  const bundles = [];
  for (let i = 0; i < 18; i++) { const b = makeCashBundle({ w: 0.36, d: 0.16, h: 0.07 }); const row = Math.floor(i / 6), j = i % 6; b.position.set((j % 2) * 0.38 - 0.19, row * 0.072, Math.floor(j / 2) * 0.18 - 0.18); b.rotation.y = Math.sin(i * 2.7) * 0.05; cash.add(b); bundles.push(b); }
  const val = makePlate("R$ 157,8 MIL", 0.9, 0.24, { bg: ORANGE, fg: "#ffffff", depth: 0.03 }); val.position.set(0, 0.11, 0.33); val.rotation.x = -0.45; cash.add(val);
  const anim = (t) => {
    court.update(t); court.lights(1); key.intensity = 1.9; key.color.set("#ffe2c4");
    popIn(doc.group, t, A.c7 + 0.02, 0.35);
    const fk = sm(t, A.acordo - 0.35, A.acordo + 0.25); doc.group.rotation.z = Math.PI * (1 - fk); doc.group.position.y = desk.top + 0.014 * (1 - fk) + 0.28 * Math.sin(Math.PI * fk);
    const n = 18 * sm(t, A.pagou - 0.2, A.mil + 0.3);
    bundles.forEach((b, i) => { const k = clamp(n - i); b.visible = k > 0.02; b.position.y = Math.floor(i / 6) * 0.072 + 0.25 * (1 - eOut(k)); });
    popIn(val, t, A.mil - 0.1, 0.35);
  };
  S.hero(doc.group, "documento do acordo", { when: (t) => t > A.c7 + 0.4 });
  S.hero(cash, "pilha de dinheiro", { when: (t) => t > A.pagou + 0.5 });
  S.solid(desk.group, "mesa");
  const bDoc = envelope([doc.group], anim, A.c7 + 0.4, A.pagou), box = envelope([doc.group, cash], anim, A.pagou + 0.5, A.c8);
  const p0 = CAM.pose(bDoc, { zone: "stage", from: [-0.1, 1.4, 1], pull: 1.18 }), p1 = CAM.pose(bDoc, { zone: "stage", from: [0, 1.4, 1], pull: 1.02 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[A.c7, p0], [A.acordo, p1, 1.4], [A.pagou + 0.45, CAM.move(box, "push", lin(t, A.pagou, A.c8), { zone: "stage", from: [0.1, 1.1, 1], pull0: 1.12, pull: 1.0 }), 0.75]])); };
});

// ============================================================ 9 · medida protetiva
// The court order on the bench; the gavel strikes on "protetiva".
addScene("medida", A.c8, A.c9, (S) => {
  const court = makeCourtroomSet({ wallZ: -4.2, seed: 11, ceil: 14 }); S.backdrop(court.group);
  const desk = makeWalnutDesk({ w: 2.6, d: 1.85, leather: "#2a1f1a" }); S.add(desk.group);
  const doc = makeTwoLineDoc("MEDIDA", "PROTETIVA", { w: 1.25, d: 1.55, seal: false }); doc.group.position.set(-0.25, desk.top, 0.05); doc.group.rotation.y = -0.06; S.add(doc.group);
  const gv = makeJudgeGavel({ s: 1.0 }); gv.group.position.set(0.82, desk.top, -0.2); gv.group.rotation.y = -0.5; S.add(gv.group);
  const anim = (t) => {
    court.update(t); court.lights(0.9); key.intensity = 1.8; key.color.set("#ffe2c4");
    popIn(doc.group, t, A.c8 + 0.02, 0.35); popIn(gv.group, t, A.c8 + 0.3, 0.35);
    gv.strike(t < A.protetiva - 0.6 ? 1 : t < A.protetiva - 0.25 ? 1 - sm(t, A.protetiva - 0.6, A.protetiva - 0.25) : sm(t, A.protetiva - 0.25, A.protetiva));
  };
  S.hero(doc.group, "documento medida protetiva", { when: (t) => t > A.c8 + 0.4 });
  S.hero(gv.group, "martelo de juiz", { when: (t) => t > A.c8 + 0.7 });
  S.solid(desk.group, "mesa");
  const box = envelope([doc.group, gv.group], anim, A.c8 + 0.7, A.c9);
  return (t) => { anim(t); let p = CAM.move(box, "orbit", lin(t, A.c8, A.c9), { zone: "stage", from: [0, 1.5, 1], deg: 24, pull: 1.02 }); p = CAM.shake(p, t, A.protetiva, 0.03, 0.25); CAM.apply(p); };
});

// ============================================================ 10 · as urnas: 2022 → 2026; 1º turno
// A: two columns of ballots, 2022 and 2026; the 2026 one loses two thirds. B (cut at "e o Lula"): the
// first-round columns, FLÁVIO 47,0% and LULA 45,2%, rise side by side.
addScene("votos", A.c9, A.c10, (S) => {
  const B = A.lula - 0.5;
  const scr = makeElectionScreens({ z: -4.4 }); S.backdrop(scr.group);
  const c22 = makeBallotColumn(24, { base: "2022", value: "239 MIL" }), c26 = makeBallotColumn(24, { base: "2026", value: "79 MIL" });
  c22.group.position.set(-0.75, 0, 0); c26.group.position.set(0.75, 0, 0); S.add(c22.group, c26.group);
  const cf = makeBallotColumn(30, { base: "FLÁVIO", value: "47,0%" }), cl = makeBallotColumn(30, { base: "LULA", value: "45,2%" });
  cf.group.position.set(-0.75, 0, 0); cl.group.position.set(0.75, 0, 0); S.add(cf.group, cl.group);
  const A1 = new THREE.Group(); A1.add(c22.group, c26.group); S.add(A1);
  const B1 = new THREE.Group(); B1.add(cf.group, cl.group); S.add(B1);
  const anim = (t) => {
    scr.update(t); scr.flash(beat(t, A.tercos, 0.6) + beat(t, A.atras, 0.6)); key.intensity = 1.8; key.color.set("#f0f4ff"); hemi.intensity = 0.4;
    const a = t < B; A1.visible = a; B1.visible = !a;
    c22.set(24 * sm(t, A.c9, A.c9 + 0.8)); c26.set(t < A.perde ? 24 * sm(t, A.c9 + 0.2, A.c9 + 1.0) : lerp(24, 8, sm(t, A.perde - 0.1, A.tercos)));
    c22.plates.vp.visible = t > A.c9 + 0.8; c26.plates.vp.visible = t > A.c9 + 1.0;
    cf.set(23.5 * sm(t, B, B + 1.2)); cl.set(22.6 * sm(t, B + 0.1, B + 1.3));
    cf.plates.vp.visible = cl.plates.vp.visible = t > B + 1.0;
  };
  S.hero(A1, "colunas de cédulas 2022 e 2026", { when: (t) => t > A.c9 + 1.0 && t < B - 0.05 });
  S.hero(B1, "colunas do primeiro turno", { when: (t) => t > B + 1.3 });
  const bA = envelope([A1], anim, A.c9 + 1.0, B - 0.05), bB = envelope([B1], anim, B + 1.3, A.c10);
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "drop", lin(t, A.c9, B), { zone: "stage", from: [0.15, 0.35, 1], rise: 0.25, pull: 1.04 }));
    else CAM.apply(CAM.move(bB, "truck", lin(t, B, A.c10), { zone: "stage", from: [0, 0.2, 1], side: 0.3, pull: 1.05 }));
  };
});

// ============================================================ 11 · imagina: 7 da manhã
// The phone face up on the bedside table at dawn: 6:59 → 7:00; it buzzes ("Pessoal, urgente!"), then the
// mission screen: send it to 5 groups, one by one.
addScene("imagina", A.c10, A.c11, (S) => {
  const room = makeNightLivingRoom({ wallZ: -2.2, seed: 18, pendant: false }); S.backdrop(room.group);
  const table = makeBedsideTable(); table.scale.setScalar(0.5); table.position.set(0, 0.62, 0); S.add(table);
  const legs = new THREE.Mesh(rbox(2.3, 0.62, 1.5, 0.04), pmat("#3a2418", { roughness: 0.7 })); legs.position.set(0, 0.31 - 0.1, -0.1); S.add(legs);
  const ph = makePhone(); ph.group.rotation.x = -Math.PI / 2; ph.group.position.set(0.15, 0.62 + 0.045, 0.1); ph.group.rotation.z = -0.12; S.add(ph.group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(0.15, 0.68, 0.1); ring.userData.decor = true; S.add(ring);
  let last = "";
  const anim = (t) => {
    room.update(t); room.light(0.35 + 0.65 * sm(t, A.sete - 0.3, A.sete + 0.8)); key.intensity = 1.2 + 0.8 * sm(t, A.sete - 0.3, A.sete + 0.8); key.color.set("#ffd2a0"); hemi.intensity = 0.32;
    const time = t < A.sete ? "6:59" : "7:00", notif = sm(t, A.vibra - 0.1, A.pessoal), sent = t < A.missao ? 0 : 5 * lin(t, A.missao + 0.8, A.familia + 0.2);
    const key_ = t < A.missao - 0.1 ? `L${time}${notif.toFixed(2)}${sm(t, A.c10, A.exercitoB).toFixed(2)}` : `M${Math.floor(sent)}`;
    if (key_ !== last) { last = key_; if (t < A.missao - 0.1) paintLock(ph.ctx, { time, notif, wake: 0.25 + 0.75 * sm(t, A.c10, A.exercitoB) }); else paintMission(ph.ctx, { sent }); ph.tex.needsUpdate = true; }
    const buzz = Math.max(beat(t, A.vibra - 0.05, 0.6), beat(t, A.urgente - 0.3, 0.6));
    ph.group.position.x = 0.15 + 0.012 * Math.sin(t * 90) * buzz; ph.group.rotation.z = -0.12 + 0.02 * Math.sin(t * 77) * buzz;
    const rk = lin(t, A.vibra - 0.05, A.vibra + 0.7); ring.visible = rk > 0 && rk < 1; ring.scale.setScalar(0.6 + 0.8 * rk); ring.material.opacity = 1 - rk;
  };
  S.hero(ph.group, "celular na mesa de cabeceira");
  S.solid(table, "mesa de cabeceira");
  const box = envelope([ph.group], anim, A.c10, A.c11);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c10, A.c11), { zone: "stage", from: [0.05, 1.4, 0.55], pull0: 1.15, pull: 1.02 })); };
});

// ============================================================ 12 · a analogia: a rádio
// Night town: the radio mast in the middle sends rings ("só ele fala"); the houses around listen and, on
// "cada ouvinte vira antena", the antenna on each roof lights up and sends its own rings.
addScene("radio", A.c11, A.c12, (S) => {
  const bg = new THREE.Group(); S.backdrop(bg);
  bg.add(gradSky([[0, "#04060f"], [0.55, "#101a3a"], [0.85, "#2a2a4a"], [1, "#4a3048"]]));
  const city = makeSkyline({ n: 24, z: -38, spread: 70, seed: 4, hMin: 3, hMax: 8 }); bg.add(city.group);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#ffffff", { map: tileTex(grassTex(), 60, 60), roughness: 1, color: "#3e4a30" })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.003; bg.add(ground);
  for (const [x, z] of [[-2.2, 0.6], [2.2, 0.6], [0, -1.2]]) { const gl = makeFloorGlow(3.4, 2.6, { color: "#ffcf8a", opacity: 0.16 }); gl.position.set(x, 0.01, z); bg.add(gl); }
  const moon = sprite(BOKEH, 5); moon.material.color.set("#dfe8ff"); moon.material.opacity = 0.75; moon.position.set(7, 13, -36); bg.add(moon);
  asBackdrop(bg); noShadow(bg);
  const tower = makeRadioTower({ h: 3.0 }); tower.group.position.set(0, 0, -0.55); S.add(tower.group);
  const town = new THREE.Group(); S.add(town);
  const spots = [-35, 35, -80, 80, -135, 135].map((d) => { const a = d * Math.PI / 180; return [1.85 * Math.sin(a), -0.55 + 1.85 * Math.cos(a), -a * 0.5]; });
  const ants = [];
  spots.forEach(([x, z, ry], i) => {
    const hs = makeHouse({ w: 1.0, h: 0.72, d: 0.9, roofH: 0.48, wall: ["#e8d9c2", "#d9b48a", "#c9d4c8"][i % 3], roof: i % 2 ? "#9a3a22" : "#6a4a3a" }); hs.position.set(x, 0, z); hs.rotation.y = ry; town.add(hs);
    const an = makeRoofAntenna({ h: 0.42 }); an.group.position.set(0.0, 0.72 + 0.48 + 0.04, -0.22); hs.add(an.group); ants.push(an);
  });
  const order = [1, 2, 0, 3, 4, 5];
  const anim = (t) => {
    city.update(t); key.intensity = 1.2; key.color.set("#c8d4ff"); hemi.intensity = 0.3; hemi.color.set("#9fb2ff");
    popIn(tower.group, t, A.c11 + 0.02, 0.4);
    tower.waves(t, sm(t, A.so - 0.3, A.so + 0.3));
    order.forEach((hi, r) => ants[hi].on(sm(t, A.cada + r * 0.22, A.cada + r * 0.22 + 0.25)));
  };
  S.hero(tower.group, "torre de rádio", { when: (t) => t > A.c11 + 0.4 });
  S.hero(town, "casas com antena");
  const box = envelope([tower.group, town], anim, A.c11 + 0.4, A.c12);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c11, A.c12), { zone: "stage", from: [0, 0.34, 1], rise: 0.2, pull: 1.0 })); };
});

// ============================================================ 13 · 50 mil → 11 milhões; o TSE; a lupa
// A: the phone's follower count climbs while the field of phones lights up behind it. B (cut at "O TSE"): a
// red band SUSPENSO crosses the phone and the field goes dark; it slides away. C (cut at "Os técnicos"): a
// magnifier sweeps over the channel's posts.
addScene("crescimento", A.c12, A.c13, (S) => {
  const B = A.tse - 0.25, C = A.tecnicos - 0.12;
  const P = phoneField(S, { z0: -2.2 });
  const pl = makeHeroPlinth(); pl.group.position.set(0, 0, 1.4); S.backdrop(pl.group);
  const ph = makePhone(); ph.group.position.set(0, pl.top + 0.84, 1.4); S.add(ph.group);
  const band = makePlate("SUSPENSO", 1.15, 0.22, { bg: "#c8231a", fg: "#ffffff", depth: 0.02 }); band.position.set(0, pl.top + 0.87, 1.5); band.rotation.z = 0.32; S.add(band);
  const mag = makeMagnifier({ r: 0.26 }); S.add(mag.group);
  let last = "";
  const growth = (t) => sm(t, A.cinquenta - 0.2, A.onze + 0.5);
  const anim = (t) => {
    P.bk.update(t); P.city.update(t); key.intensity = 1.6; key.color.set("#e6fff3"); hemi.intensity = 0.35; pl.beam.set(t > B + 0.3 && t < A.ar + 0.25 ? 0.2 : 1);
    const g = growth(t), v = 0.05 + 10.85 * Math.pow(g, 1.6), value = v < 1 ? Math.round(v * 1000) + " mil" : v.toFixed(1).replace(".", ",") + " mi";
    const off = t > B + 0.3 && t < A.ar + 0.25;
    const key_ = t < C ? `C${value}${off ? "x" : ""}` : "F";
    if (key_ !== last) { last = key_; if (t < C) { paintCounter(ph.ctx, { value, k: g }); if (off) { ph.ctx.fillStyle = "rgba(0,0,0,0.45)"; ph.ctx.fillRect(0, 0, 720, 1500); } } else paintFeed(ph.ctx); ph.tex.needsUpdate = true; }
    const lit = t < B ? g : off ? 0.04 : t < C ? sm(t, A.ar + 0.2, A.ar + 0.6) : 1;
    P.light((it) => 0.08 + 0.92 * clamp(lit * 28 - (-2.2 - it.z) / 1.25) * (0.75 + 0.25 * Math.sin(it.ph + t * 2)));
    const bk = t < A.tirar - 0.2 ? 0 : t < A.ar + 0.25 ? eOut(lin(t, A.tirar - 0.2, A.tirar + 0.15)) : 1 - eOut(lin(t, A.ar + 0.25, A.ar + 0.55));
    band.visible = bk > 0.01; band.scale.setScalar(Math.max(0.001, bk)); band.position.x = (t > A.ar + 0.25 ? 1.4 * (1 - bk) : 0);
    mag.group.visible = t > C; const mk = lin(t, C, A.c13); mag.group.position.set(0.2 * Math.sin(mk * 7), pl.top + 1.15 - 0.6 * mk, 1.68); mag.group.rotation.z = 0.5;
  };
  S.hero(ph.group, "celular com contador");
  S.hero(band, "faixa SUSPENSO", { when: (t) => t > A.tirar + 0.2 && t < A.ar + 0.2 });
  S.hero(mag.group, "lupa", { when: (t) => t > C + 0.2 });
  const box = envelope([ph.group, mag.group], anim, A.c12, A.c13);
  return (t) => {
    anim(t);
    let p;
    if (t < B) p = CAM.move(box, "push", lin(t, A.c12, B), { zone: "stage", from: [0.15, 0.2, 1], pull0: 1.18, pull: 1.0 });
    else if (t < C) p = CAM.move(box, "orbit", lin(t, B, C), { zone: "stage", from: [0, 0.12, 1], deg: 18, pull: 1.0 });
    else p = CAM.move(box, "truck", lin(t, C, A.c13), { zone: "stage", from: [0, 0.25, 1], side: 0.25, pull: 1.0 });
    CAM.apply(CAM.shake(p, t, A.tirar, 0.04, 0.3));
  };
});

// ============================================================ 14 · nosso general
// Rally at night: the photo of the two saluting in a frame on the riser; the crowd lights flare on "general".
addScene("general", A.c13, A.c14, (S) => {
  const rally = makeRallyNight({ crowdZ: -2.2, seed: 9 }); noShadow(rally.group); S.backdrop(rally.group);
  const riser = new THREE.Mesh(rbox(4.4, 0.3, 2.2, 0.03), pmat("#1b1714", { roughness: 0.5, clearcoat: 0.4 })); riser.position.set(0, 0.15, 0.1); S.add(riser);
  const fr = makePhotoFrame("continencia", { w: 2.7, name: "LIVE DE 22/10/2026" }); fr.group.position.set(0, 0.3, 0); S.add(fr.group);
  const anim = (t) => {
    rally.update(t); rally.lights(1 + 0.8 * beat(t, A.general - 0.1, 0.9)); key.intensity = 1.9; key.color.set("#ffd9b8");
    popIn(fr.group, t, A.c13, 0.45); fr.frame.rotation.y = -0.8 * (1 - eOut(lin(t, A.c13, A.c13 + 0.8))); fr.zoom(1 + 0.14 * lin(t, A.c13, A.c14));
  };
  S.hero(fr.group, "porta-retrato continência", { when: (t) => t > A.c13 + 0.5 });
  const box = envelope([fr.group], anim, A.c13 + 0.5, A.c14);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c13, A.c14), { zone: "stage", from: [0, 0.15, 1], deg: 48, pull: 1.0 })); };
});

// ============================================================ 15 · ninguém consegue medir
// The medal again, spinning on the desk and never settling.
addScene("medir", A.c14, A.c15, (S) => {
  const { off, md } = medalDesk(S, 15);
  const anim = (t) => { off.update(t); off.lights(0.7); key.intensity = 1.9; key.color.set("#ffe2c4"); md.lite(); md.spin((t - A.c14) * 7.5); };
  S.hero(md.group, "medalha girando");
  const box = envelope([md.group], anim, A.c14, A.c15);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c14, A.c15), { zone: "stage", from: [0.2, 0.2, 1], pull0: 1.35, pull: 1.1 })); };
});

// ============================================================ 16 · a pergunta
// Rally at night: a two-pan scale with SIM and NÃO on the pans, swinging without deciding.
addScene("pergunta", A.c15, A.end + 1, (S) => {
  const rally = makeRallyNight({ crowdZ: -4.2, seed: 14 }); noShadow(rally.group); S.backdrop(rally.group);
  const riser = new THREE.Mesh(rbox(3.6, 0.3, 2.0, 0.03), pmat("#1b1714", { roughness: 0.5, clearcoat: 0.4 })); riser.position.set(0, 0.15, 0.1); S.add(riser);
  const sc = makeTwoPanScale({ arm: 1.2, height: 1.9, panR: 0.52, chain: 0.72 }); sc.group.position.set(0, 0.3, 0); S.add(sc.group);
  ["SIM", "NÃO"].forEach((txt, i) => { const p = makePlate(txt, 0.86, 0.46, { bg: "#141414", fg: "#ffffff", depth: 0.06 }); p.position.set(0, 0.25, 0); sc.holders[i].add(p); });
  const anim = (t) => { rally.update(t); rally.lights(1); key.intensity = 1.9; key.color.set("#ffd9b8"); popIn(sc.group, t, A.c15, 0.45); sc.tilt(0.24 * Math.sin((t - A.c15) * 1.5)); rally.lights(1 + 0.7 * beat(t, A.essenciais, 0.8)); };
  S.hero(sc.group, "balança SIM NÃO", { when: (t) => t > A.c15 + 0.5 });
  const box = envelope([sc.group], anim, A.c15 + 0.5, A.end);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c15, A.end), { zone: "stage", from: [0, 0.3, 1], deg: 56, pull: 1.0 })); };
});
