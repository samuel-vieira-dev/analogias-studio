// ============================================================================
// videos/2026-11-04-economias-america-do-sul/scenes.js
// Economias e qualidade de vida na América do Sul. Gancho: "Você sabe qual é o país mais rico da América
// do Sul?" → depende de como você mede → imagina escolher onde nascer (12 países) → régua 1: tamanho da
// economia (o Brasil esmaga: quase metade do PIB do continente) → régua 2: por pessoa (o Brasil cai pra
// 5º, a Guiana dispara) → analogia: a pizza (a maior da festa para 213 milhões × uma pequena para 1 milhão)
// → Guiana: 10ª em 2015, petróleo do mar em 2019, 4,5× em dez anos → calma: régua 3, o IDH (vida, estudo,
// renda): Chile, Argentina, Uruguai; Brasil 6º, Guiana 8ª; 81 × 70 anos; a Venezuela, acima do Brasil em
// 2013, hoje a última → ser rico e viver bem não são a mesma coisa → salário alto ou viver mais?
// Herói: a maquete do mapa (engine/props/maps.js), um prisma por país. Números em fatos.md (FMI WEO
// out/2026, dados de 2025; PNUD RDH 2025, dados de 2023). Times from audio/words.json (A below).
// ============================================================================

const A = {
  rico: 1.96, c1: 3.34,
  depende: 3.44, mede: 4.84, c2: 5.5,
  imagina: 5.6, escolher: 6.54, doze: 7.88, nascer: 9.08, c3: 9.62,
  regua: 10.12, tamanho: 10.9, economia: 11.56, brasil: 12.92, esmaga: 13.3, c4: 14.2,
  sozinho: 14.32, metade: 15.88, produz: 17.98, c5: 18.62,
  divide: 19.16, pessoa: 20.52, brasil2: 21.62, quinto: 22.56, dispara: 23.64, topo: 24.4, guiana: 25.18, c6: 25.7,
  pizza: 26.36, brasil3: 27.16, festa: 28.86, divide2: 29.76, d213: 30.44, pessoas: 32.34, c7: 32.9,
  guiana2: 33.2, pequena: 34.28, milhao: 35.76, cada: 36.4, dobro: 38.34, c8: 39.12,
  e2015: 39.48, decima: 41.22, c9: 42.36,
  e2019: 43.24, comecou: 44.48, petroleo: 45.18, mar: 45.94, c10: 46.3,
  dez: 46.66, quatro: 49.62, maior: 50.38, c11: 50.85,
  entao: 51.0, melhor: 52.32, calma: 53.66, c12: 54.1,
  outra: 54.56, idh: 55.9, vive: 58.22, estuda: 59.0, ganha: 59.58, c13: 60.1,
  lidera: 60.86, chile: 61.8, argentina: 62.48, uruguai: 63.14, c14: 64.45,
  sexto: 65.6, guiana3: 66.46, cai: 66.82, oitava: 67.26, c15: 68.95,
  chile2: 69.36, oitenta: 70.68, guiana4: 72.36, setenta: 73.04, c16: 73.5,
  venezuela: 74.06, e2013: 74.96, nosso: 77.4, hoje: 77.98, ultima: 78.8, c17: 79.25,
  rico2: 79.72, viver: 80.24, coisa: 81.98, c18: 82.2,
  salario: 85.98, viver2: 87.0, fala: 87.76, end: 90.0,
};

// ---------------------------------------------------------------- data (fatos.md) → prism heights
const SA_DATA = {
  // PIB 2025, US$ bilhões (FMI WEO out/2026)
  gdp: { BRA: 2279.9, ARG: 683.6, COL: 457.1, CHL: 357.4, PER: 342.0, ECU: 130.3, VEN: 101.5, URY: 85.6, BOL: 65.2, PRY: 49.3, GUY: 26.8, SUR: 4.7 },
  // PIB por pessoa, US$ (FMI WEO out/2026): 2025 e 2015
  pc: { GUY: 26104, URY: 24549, CHL: 17837, ARG: 14399, BRA: 10683, PER: 9938, COL: 8617, PRY: 7679, SUR: 7212, ECU: 7199, BOL: 5185, VEN: 3559 },
  pc15: { URY: 16765, ARG: 14895, CHL: 13507, SUR: 9036, BRA: 8893, PER: 6453, COL: 6337, PRY: 6125, ECU: 5975, GUY: 5795, BOL: 3635, VEN: 2753 },
  // IDH (PNUD, RDH 2025): 2023 e 2013
  hdi: { CHL: 0.878, ARG: 0.865, URY: 0.862, PER: 0.794, COL: 0.788, BRA: 0.786, ECU: 0.777, GUY: 0.776, PRY: 0.756, BOL: 0.733, SUR: 0.722, VEN: 0.709 },
  hdi13: { CHL: 0.845, ARG: 0.852, URY: 0.812, PER: 0.757, COL: 0.76, BRA: 0.762, ECU: 0.755, GUY: 0.669, PRY: 0.73, BOL: 0.699, SUR: 0.714, VEN: 0.773 },
};
const saHeights = (obj, f) => Object.fromEntries(SA_COUNTRIES.map((c) => [c, f(obj[c])]));
const H_FLAT = saHeights(SA_DATA.gdp, () => 0.035);
const H_GDP = saHeights(SA_DATA.gdp, (v) => 0.05 + 2.2 * v / 2279.9);
const H_PC = saHeights(SA_DATA.pc, (v) => 2.0 * v / 26104);
const H_PC15 = saHeights(SA_DATA.pc15, (v) => 2.0 * v / 26104);
// IDH: the prism starts at 0,6 (every country is above it), so the gaps read; 0,878 → 1,6 m
const H_HDI = saHeights(SA_DATA.hdi, (v) => 1.6 * (v - 0.6) / 0.278);
const H_HDI13 = saHeights(SA_DATA.hdi13, (v) => 1.6 * (v - 0.6) / 0.278);
// the order the towers rise in (north to south), for staggered pops
const SA_STAGGER = { VEN: 0, GUY: 1, SUR: 2, COL: 3, ECU: 4, BRA: 5, PER: 6, BOL: 7, PRY: 8, CHL: 9, URY: 10, ARG: 11 };
const SA_GOLD = "#e8b04a", SA_BLUE = "#4f8fe6";

// ---------------------------------------------------------------- shared pieces
// The map room: the investigation office at night (ceiling lights, windows with the city, beams with
// dust) and the map model on the floor in the middle. Returns { office, M }.
function saRoom(S, { map = true, wallZ = -5.2, clear = 7.6, seed = 6 } = {}) {
  const office = makeOfficeSet({ wallZ, clear, seed }); S.backdrop(office.group);
  const pool = makeFloorGlow(map ? 9 : 6, map ? 11 : 5, { color: "#ffcf9a", opacity: 0.14 }); pool.position.y = 0.012; S.backdrop(pool);
  let M = null;
  if (map) { M = makeSouthAmericaMap(); S.add(M.group); }
  const win = makeSetWindow(map ? 3.4 : 2.4, 2.5, { seed: seed + 5 }); win.group.position.set(0, 3.35, wallZ + 0.03); S.backdrop(asBackdrop(win.group));
  return { office, M, win };
}
function saLook(office, t) {
  floor.visible = false; office.update(t); office.lights(1.25);
  key.intensity = 2.15; key.color.set("#ffe2c4"); hemi.intensity = 0.62; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
// The map is wide and flat with a few tall towers: one axis-aligned box around all of it has empty
// corners high up in front of the camera, and the map comes out small. So the map shots are framed by
// several boxes (the board, each country, each tag, each ruler), each projected by its own corners.
// envelopeEach: one envelope per part across [t0, t1] (anim run once per step).
function envelopeEach(parts, anim, t0, t1, dt = 0.1) {
  const boxes = parts.map(() => new THREE.Box3());
  for (let t = t0; t <= t1 + 1e-6; t += dt) { anim(Math.min(t, t1)); parts.forEach((p, i) => boxes[i].union(boxOf([p], false))); }
  anim(t0); return boxes.filter((b) => !b.isEmpty());
}
// CAM.pose for a list of boxes: the closest camera at which every box fits the zone (minus pad).
function saPoseBoxes(boxes, o = {}) {
  const zone = typeof o.zone === "string" ? ZONES[o.zone] : o.zone, pad = o.pad ?? (LAYOUT.camera ? LAYOUT.camera.pad_px : 28), fov = o.fov ?? (LAYOUT.camera ? LAYOUT.camera.fov : 40);
  const all = new THREE.Box3(); boxes.forEach((b) => all.union(b));
  const look = o.look ? new V3(...o.look) : all.getCenter(new V3()), dir = new V3(...o.from).normalize();
  const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2; CAM.setPrincipal(cx, cy, fov);
  const fits = (d) => {
    camera.position.copy(look).addScaledVector(dir, d); camera.up.set(0, 1, 0); camera.lookAt(look); camera.updateMatrixWorld();
    for (const b of boxes) { const r = CAM.projectBox(b); if (r.behind || r.x < zone.x + pad || r.y < zone.y + pad || r.x + r.w > zone.x + zone.w - pad || r.y + r.h > zone.y + zone.h - pad) return false; }
    return true;
  };
  let lo = 0.05, hi = 800; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  const d = hi * Math.max(1, o.pull || 1);
  return { pos: look.clone().addScaledVector(dir, d), look: look.clone(), cx, cy, fov, dist: d, zone };
}
// CAM.move for a list of boxes (same moves and options).
function saMove(boxes, kind, k, o = {}) {
  const e = sm(clamp(k), 0, 1), f = new V3(...(o.from || [0, 0.35, 1])), pull = o.pull ?? 1, pull0 = o.pull0 ?? 1.35;
  let pl = pull;
  if (kind === "push") pl = lerp(pull0, pull, e);
  else if (kind === "reveal") pl = lerp(pull, pull0, e);
  else if (kind === "orbit") f.applyAxisAngle(new V3(0, 1, 0), THREE.MathUtils.degToRad(o.deg ?? 40) * (e - 0.5));
  else if (kind === "crane" || kind === "drop") { const r = o.rise ?? 0.4; f.y += kind === "crane" ? lerp(-r, r, e) : lerp(r, -r, e); }
  else if (kind === "truck") { const d = o.side ?? 0.4; f.x += lerp(-d, d, e); }
  return saPoseBoxes(boxes, { ...o, from: [f.x, f.y, f.z], pull: pl });
}
// Several framings inside one shot, following the narration: segs = [[t0, box or [boxes], move, opts], ...].
function shotTrack(t, segs, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : t0 + 4;
    const oo = { zone: "stage", ...o };
    return [t0, Array.isArray(box) ? saMove(box, kind, lin(t, t0, t1), oo) : CAM.move(box, kind, lin(t, t0, t1), oo), ease];
  });
  return CAM.track(t, keys, ease);
}
// Framing parts of a map shot: the board, every country, plus `extra` (tags, rulers).
const saMapParts = (M, extra = []) => [M.slab, ...SA_COUNTRIES.map((c) => M.countries[c].grp), ...extra];
// Heroes of a wide map shot: the board and the towers that stand out.
function saHeroMap(S, M, codes = [], when = null) {
  S.hero(M.slab, "maquete do mapa da américa do sul", { when });
  for (const c of codes) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase(), { when });
}
const inside = (t, a, b) => t >= a && t < b;
const yawOf = (from) => Math.atan2(from[0], from[2]);
// Country groups (and their tags) of the map, for framing a region.
const saParts = (M, codes, tags = []) => codes.map((c) => M.countries[c].grp).concat(tags.map((tg) => tg.holder));
// Every country to the heights of `to`, from `from`, by k; the colours of the video's cast.
function saCast(M, { bra = true, guy = true, chl = false, ven = false } = {}) {
  if (bra) M.color("BRA", GREEN); if (guy) M.color("GUY", SA_GOLD); if (chl) M.color("CHL", SA_BLUE); if (ven) M.color("VEN", RED);
}
const saTag = (M, code, text, o = {}) => M.tag(code, text, Object.assign({ w: Math.max(1.05, 0.185 * text.length + 0.32), h: 0.5 }, o));
// Measuring ruler on the map with a big sign over it (the ruler's own label is too small to read on the map).
function saRuler(S, M, label, lon, lat, { h = 2.4, reach = 0.6, side = -1, signW = null, signH = 0.62 } = {}) {
  const r = makeMeasuringRuler({ h, label: "", w: 0.13, reach, side }); r.plate.visible = false; r.plate.userData.plate.detail = true;
  r.group.position.copy(M.pt(lon, lat, 0)).setY(M.top); S.add(r.group);
  const sign = makePlate(label, signW || Math.max(signH * 1.6, 0.27 * signH / 0.46 * label.length + 0.4), signH, { bg: ORANGE, fg: "#ffffff" }); sign.position.set(0, r.top + signH / 2 + 0.04, 0.02); r.group.add(sign);
  return r;
}
// warm light over a country (fill light), k 0..1
function saFillOn(M, code, k, color = "#ffd27a", y = 1.5) { fill.position.copy(M.at(code, y)); fill.color.set(color); fill.intensity = 0.9 * k; }

// ---------------------------------------------------------------- 1. gancho (0 – 3.34)
// "Você sabe qual é o país mais rico da América do Sul?"
addScene("gancho", 0, A.c1, (S) => {
  const { office, M } = saRoom(S); saCast(M);
  const from = [0.1, 0.78, 1];
  saHeroMap(S, M, ["GUY", "URY", "CHL", "ARG", "BRA"]);
  const anim = (t) => {
    saLook(office, t); office.windows(1 + 0.4 * beat(t, A.rico - 0.2, 0.8), "#bcd4ff");
    for (const c of SA_COUNTRIES) { const st = SA_STAGGER[c] * 0.07; M.set(c, lerp(0.035, H_PC[c], eOut(lin(t, 0.15 + st, 1.5 + st)))); }
    M.glow("GUY", lin(t, 1.3, 2.0) * (0.55 + 0.45 * Math.sin(t * 6)));
    saFillOn(M, "GUY", lin(t, 1.2, 2.0));
  };
  const boxes = envelopeEach(saMapParts(M), anim, 0, A.c1);
  return (t) => { anim(t); CAM.apply(saMove(boxes, "push", lin(t, 0, A.c1), { zone: "stage", from, pull0: 1.22 })); };
});

// ---------------------------------------------------------------- 2. régua (3.34 – 5.5)
// "Depende de como você mede."
addScene("regua", A.c1, A.c2, (S) => {
  const { office, M } = saRoom(S); saCast(M);
  const ruler = saRuler(S, M, "?", -35, -16, { h: 2.4, reach: 0.7 });
  saHeroMap(S, M, ["GUY", "URY", "CHL"]); S.hero(ruler.group, "régua de medir", { when: (t) => t > A.c1 + 0.6 });
  const anim = (t) => {
    saLook(office, t);
    M.heights(H_FLAT, sm(t, A.depende, A.depende + 0.9), H_PC);
    popIn(ruler.group, t, A.c1 + 0.1, 0.45);
    ruler.set(M.top + 0.4 + 1.5 * (0.5 + 0.5 * Math.sin((t - A.c1) * 3.4)));
  };
  const boxes = envelopeEach(saMapParts(M, [ruler.group]), anim, A.c1, A.c2);
  return (t) => { anim(t); CAM.apply(saMove(boxes, "truck", lin(t, A.c1, A.c2), { zone: "stage-tall", from: [0, 1.0, 1], side: 0.3 })); };
});

// ---------------------------------------------------------------- 3. imagina (5.5 – 9.62)
// "Imagina: você pode escolher em qual dos doze países daqui nascer."
addScene("imagina", A.c2, A.c3, (S) => {
  const { office, M } = saRoom(S);
  const order = ["VEN", "COL", "ECU", "PER", "BOL", "BRA", "PRY", "CHL", "ARG", "URY", "GUY", "SUR"];
  const T0 = 5.8, DT = 0.27;

  saHeroMap(S, M);
  const anim = (t) => {
    saLook(office, t); office.lights(0.75);
    order.forEach((c, i) => {
      const k = beat(t, T0 + i * DT, 0.55), end = sm(t, A.nascer - 0.2, A.nascer + 0.3);
      M.lift(c, k); M.glow(c, Math.max(k, 0.35 * end));
    });
    const i = clamp(Math.floor((t - T0) / DT + 0.5), 0, order.length - 1); saFillOn(M, order[i], 1 - 0.6 * sm(t, A.nascer - 0.2, A.nascer + 0.3), "#ffe2b0", 0.9);
  };
  const boxes = envelopeEach(saMapParts(M), anim, A.c2, A.c3);
  return (t) => { anim(t); CAM.apply(saMove(boxes, "drop", lin(t, A.c2, A.c3), { zone: "stage", from: [0, 1.25, 1], rise: 0.35 })); };
});

// ---------------------------------------------------------------- 4. tamanho (9.62 – 14.2)
// "Primeira régua: o tamanho da economia. Aí o Brasil esmaga."
addScene("tamanho", A.c3, A.c4, (S) => {
  const { office, M } = saRoom(S); M.color("BRA", GREEN);
  const ruler = saRuler(S, M, "TAMANHO", -35.5, -12.5, { h: 2.75, reach: 1.25 });
  saHeroMap(S, M, ["BRA", "ARG"]); S.hero(ruler.group, "régua tamanho");
  const rise = (t) => eOut(lin(t, A.brasil - 0.15, A.esmaga + 0.1));
  const anim = (t) => {
    saLook(office, t);
    for (const c of SA_COUNTRIES) if (c !== "BRA") { const st = SA_STAGGER[c] * 0.05; M.set(c, lerp(0.035, H_GDP[c], sm(t, A.tamanho + st, A.economia + 0.6 + st))); }
    M.set("BRA", lerp(0.035, H_GDP.BRA, rise(t)));
    popIn(ruler.group, t, A.c3 + 0.15, 0.45);
    ruler.set(M.top + M.h("BRA"));
    saFillOn(M, "BRA", rise(t), "#c8ffd8", 0.6);
  };
  const boxes = envelopeEach(saMapParts(M, [ruler.group]), anim, A.c3, A.c4);
  return (t) => {
    anim(t);
    let p = saMove(boxes, "push", lin(t, A.c3, A.c4), { zone: "stage", from: [0.18, 0.8, 1], pull0: 1.12 });
    p = CAM.shake(p, t, A.esmaga + 0.05, 0.03, 0.4); CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 5. metade (14.2 – 18.62)
// "Sozinho, ele faz quase metade de tudo que a América do Sul produz."
// Two coin columns, 1 coin ≈ US$ 92 bi: Brasil 25 (US$ 2.280 bi) × os outros 11 juntos 25 (US$ 2.303 bi).
addScene("metade", A.c4, A.c5, (S) => {
  const { office } = saRoom(S, { map: false, wallZ: -3.2, clear: 4.6 });
  const pl1 = makeLabelPlinth("BRASIL", { w: 1.3, h: 0.95, d: 0.9, bg: "#14502f", plateH: 0.5 }), pl2 = makeLabelPlinth("OUTROS 11", { w: 1.3, h: 0.95, d: 0.9, bg: "#4a3626", plateH: 0.5 });
  pl1.group.position.set(-0.8, 0, 0); pl2.group.position.set(0.8, 0, 0); S.add(pl1.group, pl2.group);
  const c1 = makeCoinColumn(25, { r: 0.27, t: 0.06, seed: 3 }), c2 = makeCoinColumn(25, { r: 0.27, t: 0.06, seed: 8 });
  c1.group.position.set(-0.8, pl1.top, 0); c2.group.position.set(0.8, pl2.top, 0); S.add(c1.group, c2.group);
  S.hero(pl1.group, "pedestal brasil"); S.hero(pl2.group, "pedestal os outros 11");
  S.hero(c1.group, "pilha de moedas do brasil", { when: (t) => t > A.sozinho + 0.6 }); S.hero(c2.group, "pilha de moedas dos outros", { when: (t) => t > A.metade + 0.4 });
  S.solid(pl1.group, "pedestal 1"); S.solid(pl2.group, "pedestal 2");
  const anim = (t) => {
    saLook(office, t); office.windows(1 + 0.5 * beat(t, A.metade, 0.9), "#c8f0d4");
    c1.set(sm(t, A.sozinho, A.metade + 0.1)); c2.set(sm(t, A.metade, A.produz));
    fill.position.set(0, 2.6, 1.6); fill.color.set("#ffe0a8"); fill.intensity = 1.2;
  };
  const box = envelope([pl1.group, pl2.group, c1.group, c2.group], anim, A.c4, A.c5);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c4, A.c5), { zone: "stage", from: [0, 0.2, 1], deg: 22, pull: 1.03 })); };
});

// ---------------------------------------------------------------- 6. por pessoa (18.62 – 25.7)
// "Mas divide esse dinheiro por pessoa... O Brasil cai pra quinto. E quem dispara pro topo é a Guiana."
addScene("porpessoa", A.c5, A.c6, (S) => {
  const { office, M } = saRoom(S); saCast(M);
  const tB = saTag(M, "BRA", "5º BRASIL", { bg: "#14502f" }), tG = saTag(M, "GUY", "1º GUIANA", { fg: SA_GOLD });
  const F1 = A.brasil2 - 0.2, F2 = A.dispara - 0.3;
  saHeroMap(S, M, ["GUY", "URY", "CHL", "ARG", "BRA"], (t) => t < F1 - 0.65);
  S.hero(M.countries.BRA.grp, "torre do brasil", { when: (t) => inside(t, F1 + 0.1, F2 - 0.65) }); S.hero(tB.holder, "placa 5º brasil", { when: (t) => inside(t, A.quinto + 0.3, F2 - 0.65) });
  for (const c of ["GUY", "VEN", "SUR"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase(), { when: (t) => t > F2 + 0.1 });
  S.hero(tG.holder, "placa 1º guiana", { when: (t) => t > A.guiana + 0.3 });
  const anim = (t) => {
    saLook(office, t);
    M.heights(H_PC, sm(t, A.divide, A.pessoa + 0.4), H_GDP);
    tB.set(pop(t, A.quinto - 0.05, 0.4) * (1 - sm(t, F2 - 0.5, F2))); tG.set(pop(t, A.guiana - 0.1, 0.4));
    M.dim(t < F2 - 0.3 ? ["BRA"] : ["GUY", "VEN", "SUR"], sm(t, F1 - 0.5, F1 + 0.2));
    M.glow("GUY", lin(t, A.dispara, A.topo) * (0.6 + 0.4 * Math.sin(t * 6)));
    saFillOn(M, t < F2 ? "BRA" : "GUY", 1, t < F2 ? "#d0ffe0" : "#ffd27a", 0.7);
  };
  const from1 = [0, 1.05, 1], from2 = [0.15, 0.8, 1], from3 = [0.08, 0.62, 1];
  const bWide = envelopeEach(saMapParts(M), anim, A.c5, F1), bBra = envelopeEach(saParts(M, ["BRA"], [tB]), anim, F1, F2), bGuy = envelopeEach(saParts(M, ["GUY", "VEN", "SUR"], [tG]), anim, F2, A.c6);
  return (t) => {
    anim(t); M.faceTags(yawOf(t < F2 ? from2 : from3));
    CAM.apply(shotTrack(t, [[A.c5, bWide, "reveal", { from: from1, pull0: 1.2 }], [F1, bBra, "push", { from: from2, pull0: 1.25, pull: 1.04 }], [F2, bGuy, "crane", { from: from3, rise: 0.25, pull: 1.04 }]], 0.6));
  };
});

// ---------------------------------------------------------------- 7. pizza (25.7 – 32.9)
// "Pensa numa pizza. O Brasil tem a maior pizza da festa, mas divide com duzentos e treze milhões de pessoas."
function saPizzaTable(S, { crowdLeft = true, crowdRight = true } = {}) {
  const room = makeRestaurantRoom({ wallZ: -6.2, lampsX: [-0.6, 0.6], lampY: 2.7, tables: false, seed: 4 }); S.backdrop(room.group);
  const table = makeDiningTable({ w: 2.6, d: 1.7, clothColor: "#2a2321" }); S.add(table.group);
  // the party: people standing behind the table, packed behind the big pizza (skip thins them on the right)
  const crowd = makeCrowdField({ rows: 9, cols: 22, z0: -1.4, sx: 0.5, sz: 0.55, seed: 17, skip: (x, z) => (x > 0.35 ? !crowdRight || Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 > 0.07 : !crowdLeft) });
  S.backdrop(crowd.group);
  const bokeh = makeBokeh({ n: 50, center: [0, 3.2, -5], spread: [16, 6, 3], colors: ["#ffcf8a", "#ff9a4a", "#9fc3ff"], seed: 31, opacity: 0.4 }); S.backdrop(bokeh.group);
  return { room, table, crowd, bokeh, top: table.topY };
}
function saPizzaLook(P, t) {
  floor.visible = true; P.room.update(t); P.crowd.update(t); P.bokeh.update(t);
  key.intensity = 2.0; key.color.set("#ffd8b0"); hemi.intensity = 0.5; hemi.color.set("#ffe0c0"); hemi.groundColor.set("#1a0f0a");
  scene.fog.color.set("#140c08");
}
addScene("pizza", A.c6, A.c7, (S) => {
  const P = saPizzaTable(S, { crowdRight: true });
  const pz = makePizzaPie({ r: 0.62, slices: 40, gap: 0.014 }); pz.group.position.set(0, P.top, -0.12); S.add(pz.group);
  const flag = makeNationFlag("brasil", { poleH: 0.36, fw: 0.26 }); flag.group.position.set(0, P.top + pz.top, -0.12); S.add(flag.group);
  const card = makePlaceCard("213 MILHÕES", { w: 0.7, h: 0.17 }); card.group.position.set(0, P.top, 0.66); S.add(card.group);
  S.hero(pz.group, "pizza gigante do brasil"); S.hero(card.group, "placa 213 milhões", { when: (t) => t > A.d213 + 0.3 }); S.hero(flag.group, "bandeirinha do brasil");
  const anim = (t) => {
    saPizzaLook(P, t);
    pz.spread(sm(t, A.divide2, A.d213 + 0.4));
    popIn(card.group, t, A.d213 - 0.1, 0.4); flag.update && flag.update(t);
    popIn(flag.group, t, A.brasil3 - 0.1, 0.4);
    fill.position.set(0, P.top + 1.4, 0.8); fill.color.set("#ffd7a0"); fill.intensity = 1.1;
  };
  const box = envelope([pz.group, card.group, flag.group], anim, A.c6, A.c7);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c6, A.c7), { zone: "stage-tall", from: [0, 0.75, 1], rise: 0.35, pull: 1.05 })); };
});

// ---------------------------------------------------------------- 8. a pizza da Guiana (32.9 – 39.12)
// "A Guiana tem uma pizza pequena... pra um milhão. Cada fatia lá é mais que o dobro da nossa."
// Slice areas: Brasil π·0,52²/40 ≈ 0,021 m² × Guiana π·0,27²/4 ≈ 0,057 m² (≈ 2,7×; the real ratio is 2,4×).
addScene("pizzaGuiana", A.c7, A.c8, (S) => {
  const P = saPizzaTable(S, { crowdRight: true });
  const big = makePizzaPie({ r: 0.56, slices: 40, gap: 0.012 }); big.group.position.set(-0.58, P.top, -0.12); S.add(big.group);
  const small = makePizzaPie({ r: 0.3, slices: 4, gap: 0.006 }); small.group.position.set(0.7, P.top, -0.08); S.add(small.group);
  big.spread(1); small.spread(1);
  const c1 = makePlaceCard("BRASIL · 213 MI", { w: 1.05, h: 0.26, bg: "#14502f" }), c2 = makePlaceCard("GUIANA · 1 MI", { w: 0.95, h: 0.26, bg: "#2a2008", fg: SA_GOLD });
  c1.group.position.set(-0.6, P.top, 0.66); c2.group.position.set(0.72, P.top, 0.66); S.add(c1.group, c2.group);
  const BI = 30, GI = 3;   // the slices that face the camera
  S.hero(big.group, "pizza grande do brasil"); S.hero(small.group, "pizza pequena da guiana");
  S.hero(c1.group, "placa brasil 213 mi"); S.hero(c2.group, "placa guiana 1 mi", { when: (t) => t > A.milhao + 0.3 });
  const anim = (t) => {
    saPizzaLook(P, t);
    popIn(small.group, t, A.c7 - 0.3, 0.45); popIn(c2.group, t, A.milhao - 0.15, 0.4);
    const k = sm(t, A.cada, A.cada + 0.8); big.lift(BI, k, 0.5); small.lift(GI, k, 0.4);
    fill.position.set(0.1, P.top + 1.3, 0.9); fill.color.set("#ffd7a0"); fill.intensity = 1.1;
  };
  const box = envelope([big.group, small.group, c1.group, c2.group], anim, A.c7, A.c8);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.c7, A.c8), { zone: "stage", from: [0, 1.35, 1], rise: 0.3, pull: 1.0 })); };
});

// ---------------------------------------------------------------- 9. Guiana em 2015 (39.12 – 42.36)
// "Em 2015, ela era a décima de doze."
addScene("rank2015", A.c8, A.c9, (S) => {
  const { office, M } = saRoom(S); saCast(M, { bra: true });
  M.heights(H_PC15);
  const tG = saTag(M, "GUY", "10º GUIANA", { fg: SA_GOLD });
  const parts = saParts(M, ["GUY", "VEN", "SUR", "COL"], [tG]);
  for (const c of ["GUY", "VEN", "SUR", "COL"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(tG.holder, "placa 10º guiana", { when: (t) => t > A.decima + 0.3 });
  const from = [0.05, 0.85, 1];
  const anim = (t) => { saLook(office, t); tG.set(pop(t, A.decima - 0.1, 0.4)); M.glow("GUY", 0.3); M.dim(["GUY", "VEN", "SUR", "COL"], 0.8); saFillOn(M, "GUY", 0.7, "#ffd27a", 0.6); };
  const box = envelopeEach(parts, anim, A.c8, A.c9);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(box, "push", lin(t, A.c8, A.c9), { zone: "stage", from, pull0: 1.3, pull: 1.05 })); };
});

// ---------------------------------------------------------------- 10. petróleo (42.36 – 46.3)
// "Aí, em 2019, começou a tirar petróleo do mar."
const SA_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#03060f"); g.addColorStop(0.55, "#0b1a33"); g.addColorStop(0.82, "#26304f"); g.addColorStop(1, "#5a3a2c"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
addScene("petroleo", A.c9, A.c10, (S) => {
  const sea = makeSea({ size: 90, seg: 90, color: "#164a66" }); Object.assign(sea.mesh.material, { flatShading: false, metalness: 0.25, roughness: 0.28, envMapIntensity: 0.9 }); sea.mesh.material.needsUpdate = true;
  const foam = [[-1.0, -0.75], [1.0, -0.75], [-1.0, 0.75], [1.0, 0.75]].map(([x, z], i) => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: "#dfeef5", roughness: 0.9, transparent: true, opacity: 0.75 })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.06, z); f.userData.decor = true; S.backdrop(f); return f; });
  const moon = makeLightShaft([-6, 14, -40], [1.5, 0.05, 4], { w0: 3, w1: 1.6, color: "#c8d8ff", opacity: 0.08 }); S.backdrop(moon.group); S.backdrop(sea.mesh);
  const rig = makeOilRig(); S.add(rig.group);
  const far = makeBokeh({ n: 26, center: [0, 1.2, -26], spread: [60, 1.5, 8], size: [0.25, 0.7], colors: ["#ffcf8a", "#ff9a4a", "#ff6a2b"], seed: 12, opacity: 0.6, drift: 0.05 }); S.backdrop(far.group);
  const stars = makeBokeh({ n: 70, center: [0, 16, -40], spread: [90, 18, 6], size: [0.1, 0.25], colors: ["#e8f0ff", "#ffffff"], seed: 15, opacity: 0.7, drift: 0.02 }); S.backdrop(stars.group);
  const glow = makeFloorGlow(9, 9, { color: "#ff8a3c", opacity: 0.22 }); glow.position.set(-2.3, 0.08, -0.7); S.backdrop(glow);
  S.hero(rig.group, "plataforma de petróleo no mar");
  const anim = (t) => {
    scene.background = SA_NIGHT; floor.visible = false; sea.update(t); sea.mesh.geometry.computeVertexNormals(); far.update(t); stars.update(t);
    foam.forEach((f, i) => { const k = 1 + 0.12 * Math.sin(t * 2.2 + i * 1.7); f.scale.set(k, k, 1); f.position.y = 0.04 + 0.03 * Math.sin(t * 1.6 + i); });
    const on = pop(t, A.petroleo - 0.1, 0.5), fl = 1.6 * on * (0.85 + 0.15 * Math.sin(t * 29));
    rig.flame.visible = on > 0.02; rig.flame.scale.set(Math.max(0.001, fl), Math.max(0.001, fl * (1 + 0.15 * Math.sin(t * 21))), Math.max(0.001, fl));
    glow.material.opacity = 0.22 * on;
    key.intensity = 1.3; key.color.set("#c9d8ff"); hemi.intensity = 0.35 + 0.2 * on; hemi.color.set("#9fb6e8"); hemi.groundColor.set("#141210");
    fill.position.set(-2.3, 3.4, -0.4); fill.color.set("#ff9a4a"); fill.intensity = 3.2 * on;
    scene.fog.color.set("#0b1222");
  };
  const box = envelope([rig.group], anim, A.c9, A.c10);
  return (t) => {
    anim(t);
    const p = CAM.move(box, "push", lin(t, A.c9, A.c10), { zone: "stage", from: [0.42, 0.2, 1], pull0: 1.14, pull: 1.0 });
    CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 14); scene.fog.far = Math.max(scene.fog.far, 80);
  };
});

// ---------------------------------------------------------------- 11. a torre da Guiana cresce (46.3 – 50.85)
// "Em dez anos, o dinheiro por pessoa ficou mais de quatro vezes maior."
addScene("cresce", A.c10, A.c11, (S) => {
  const { office, M } = saRoom(S); saCast(M);
  const tG = saTag(M, "GUY", "GUIANA", { fg: SA_GOLD });
  const parts = saParts(M, ["GUY", "VEN", "SUR"], [tG]);
  for (const c of ["GUY", "VEN", "SUR"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(tG.holder, "placa guiana");
  const from = [0.06, 0.55, 1];
  const anim = (t) => {
    saLook(office, t); office.windows(1 + 0.5 * beat(t, A.quatro, 0.9), "#ffe2a0");
    const k = sm(t, A.dez, A.maior + 0.2); M.heights(H_PC, k, H_PC15);
    tG.set(1); M.glow("GUY", 0.35 + 0.5 * k); M.dim(["GUY", "VEN", "SUR"], 0.9);
    saFillOn(M, "GUY", 0.6 + 0.4 * k, "#ffd27a", 0.5);
  };
  const box = envelopeEach(parts, anim, A.c10, A.c11);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(box, "crane", lin(t, A.c10, A.c11), { zone: "stage", from, rise: 0.3, pull: 1.04 })); };
});

// ---------------------------------------------------------------- 12. calma (50.85 – 54.1)
// "Então a Guiana é o melhor lugar pra nascer? Calma."
addScene("calma", A.c11, A.c12, (S) => {
  const { office, M } = saRoom(S); saCast(M);
  M.heights(H_PC);
  const tG = saTag(M, "GUY", "1º GUIANA", { fg: SA_GOLD }); tG.set(1);
  const parts = saParts(M, ["GUY", "VEN", "SUR"], [tG]);
  for (const c of ["GUY", "VEN", "SUR"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(tG.holder, "placa 1º guiana");
  const anim = (t) => {
    saLook(office, t);
    const dim = sm(t, A.calma - 0.1, A.calma + 0.25), flick = t > A.calma - 0.1 && t < A.calma + 0.3 ? (Math.sin(t * 70) > 0 ? 0.4 : 1) : 1;
    office.lights(lerp(1, 0.35, dim) * flick); office.windows(lerp(1, 0.5, dim));
    M.glow("GUY", lerp(0.8, 0.0, dim)); M.dim(["GUY", "VEN", "SUR"], 0.8); saFillOn(M, "GUY", lerp(1, 0.25, dim), "#ffd27a", 0.6);
  };
  const box = envelopeEach(parts, anim, A.c11, A.c12);
  return (t) => {
    anim(t); const k = lin(t, A.c11, A.c12), from = [0.12, 0.7, 1];
    const p = saMove(box, "orbit", k, { zone: "stage-tall", from, deg: 26, pull: 1.04 });
    M.faceTags(Math.atan2(p.pos.x - p.look.x, p.pos.z - p.look.z)); CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 13. IDH (54.1 – 60.1)
// "Tem outra régua: o IDH, que mede quanto você vive, estuda e ganha."
addScene("idh", A.c12, A.c13, (S) => {
  const { office } = saRoom(S, { map: false, wallZ: -3.2, clear: 5.2, seed: 9 });
  const xs = [-1.02, 0, 1.02], labels = ["VIDA", "ESTUDO", "RENDA"];
  const pls = labels.map((l, i) => { const p = makeLabelPlinth(l, { w: 0.9, h: 0.95, d: 0.75, plateH: 0.36 }); p.group.position.set(xs[i], 0, 0); S.add(p.group); return p; });
  const hg = makeHourglass({ h: 1.25 }); hg.group.position.set(xs[0], pls[0].top, 0); S.add(hg.group);
  const cap = makeGraduationCap({ s: 0.82 }); cap.group.position.set(xs[1], pls[1].top, 0); cap.group.rotation.y = 0.15; S.add(cap.group);
  const coins = makeCoinColumn(20, { r: 0.33, t: 0.058, seed: 5 }); coins.group.position.set(xs[2], pls[2].top, 0); S.add(coins.group);
  pls.forEach((p, i) => { S.hero(p.group, "pedestal " + labels[i]); S.solid(p.group, "pedestal " + i); });
  S.hero(hg.group, "ampulheta", { when: (t) => t > A.vive + 0.4 }); S.hero(cap.group, "capelo de formatura", { when: (t) => t > A.estuda + 0.4 }); S.hero(coins.group, "pilha de moedas", { when: (t) => t > A.ganha + 0.4 });
  const anim = (t) => {
    saLook(office, t);
    popIn(hg.group, t, A.vive - 0.1, 0.4); hg.set(lin(t, A.vive, A.c13 + 2));
    popIn(cap.group, t, A.estuda - 0.1, 0.4);
    popIn(coins.group, t, A.ganha - 0.15, 0.35); coins.set(sm(t, A.ganha - 0.1, A.ganha + 0.4));
    fill.position.set(0, 2.4, 1.6); fill.color.set("#ffe0b0"); fill.intensity = 1.1;
  };
  const box = envelope([...pls.map((p) => p.group), hg.group, cap.group, coins.group], anim, A.c12, A.c13);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c12, A.c13), { zone: "stage", from: [0, 0.22, 1], side: 0.35, pull: 1.03 })); };
});

// ---------------------------------------------------------------- 14. Cone Sul (60.1 – 64.45)
// "Nela, quem lidera é o Chile, com Argentina e Uruguai logo atrás."
addScene("cone", A.c13, A.c14, (S) => {
  const { office, M } = saRoom(S); saCast(M, { chl: true });
  const t1 = saTag(M, "CHL", "1º CHILE", { bg: "#1d4a8a", at: [-70.5, -22], dy: 1.1 });
  const t2 = saTag(M, "ARG", "2º ARGENTINA", { at: [-67.5, -45] });
  const t3 = saTag(M, "URY", "3º URUGUAI", { at: [-55.9, -32.6] });
  const parts = saParts(M, ["CHL", "ARG", "URY"], [t1, t2, t3]);
  for (const c of ["CHL", "ARG", "URY"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(t1.holder, "placa 1º chile", { when: (t) => t > A.chile + 0.3 }); S.hero(t2.holder, "placa 2º argentina", { when: (t) => t > A.argentina + 0.3 }); S.hero(t3.holder, "placa 3º uruguai", { when: (t) => t > A.uruguai + 0.3 });
  const from = [-0.1, 0.8, 1];
  const toHDI = Object.assign({}, H_HDI, { GUY: H_PC.GUY });
  const anim = (t) => {
    saLook(office, t);
    M.heights(toHDI, sm(t, A.c13 + 0.1, A.lidera + 0.4), H_PC);
    t1.set(pop(t, A.chile - 0.1, 0.4)); t2.set(pop(t, A.argentina - 0.1, 0.4)); t3.set(pop(t, A.uruguai - 0.1, 0.4));
    M.glow("CHL", 0.5 * lin(t, A.chile, A.chile + 0.5), "#9cc4ff"); M.dim(["CHL", "ARG", "URY"], 0.75 * sm(t, A.c13, A.lidera)); saFillOn(M, "CHL", 1, "#cfe0ff", 0.8);
  };
  const box = envelopeEach(parts, anim, A.c13, A.c14);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(box, "drop", lin(t, A.c13, A.c14), { zone: "stage", from, rise: 0.3, pull: 1.04 })); };
});

// ---------------------------------------------------------------- 15. norte: Brasil 6º, Guiana 8ª (64.45 – 68.95)
// "O Brasil fica em sexto. E a Guiana cai pra oitava, atrás do Brasil."
addScene("norte", A.c14, A.c15, (S) => {
  const { office, M } = saRoom(S); saCast(M, { chl: true });
  M.heights(Object.assign({}, H_HDI, { GUY: H_PC.GUY }));
  const tB = saTag(M, "BRA", "6º BRASIL", { bg: "#14502f", at: [-51, -11] }), tG = saTag(M, "GUY", "8º GUIANA", { fg: SA_GOLD, at: [-58.9, 6.2], dy: 0.85 });
  const parts = saParts(M, ["GUY", "VEN", "SUR", "COL", "BRA"], [tB, tG]);
  for (const c of ["GUY", "VEN", "SUR", "COL", "BRA"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(tB.holder, "placa 6º brasil", { when: (t) => t > A.sexto + 0.3 }); S.hero(tG.holder, "placa 8º guiana", { when: (t) => t > A.oitava + 0.3 });
  const from = [0.05, 0.85, 1];
  const anim = (t) => {
    saLook(office, t);
    M.set("GUY", lerp(H_PC.GUY, H_HDI.GUY, sm(t, A.cai, A.oitava + 0.3)));
    tB.set(pop(t, A.sexto - 0.1, 0.4)); tG.set(pop(t, A.oitava - 0.1, 0.4));
    M.glow("GUY", 0.6 * (1 - lin(t, A.cai, A.oitava))); M.dim(["GUY", "BRA", "VEN", "SUR", "COL"], 0.75); saFillOn(M, "GUY", 0.8, "#ffd27a", 0.6);
  };
  const box = envelopeEach(parts, anim, A.c14, A.c15);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(box, "reveal", lin(t, A.c14, A.c15), { zone: "stage", from, pull0: 1.25 })); };
});

// ---------------------------------------------------------------- 16. 81 × 70 anos (68.95 – 73.5)
// "No Chile, se vive em média oitenta e um anos. Na Guiana, setenta."
// Same sand rate in both: the Guiana glass (70) runs out when the Chile glass (81) still has 14% left.
addScene("anos", A.c15, A.c16, (S) => {
  const { office } = saRoom(S, { map: false, wallZ: -3.2, clear: 4.6, seed: 11 });
  const p1 = makeLabelPlinth("CHILE", { w: 1.1, h: 0.9, d: 0.8, bg: "#1d4a8a" }), p2 = makeLabelPlinth("GUIANA", { w: 1.1, h: 0.9, d: 0.8, bg: "#2a2008", fg: SA_GOLD });
  p1.group.position.set(-0.72, 0, 0); p2.group.position.set(0.72, 0, 0); S.add(p1.group, p2.group);
  const h1 = makeHourglass({ h: 1.15 }), h2 = makeHourglass({ h: 1.15 * 70 / 81 }); h1.group.position.set(-0.72, p1.top, 0); h2.group.position.set(0.72, p2.top, 0); S.add(h1.group, h2.group);
  S.hero(p1.group, "pedestal chile"); S.hero(p2.group, "pedestal guiana"); S.hero(h1.group, "ampulheta do chile"); S.hero(h2.group, "ampulheta da guiana");
  S.solid(p1.group, "pedestal 1"); S.solid(p2.group, "pedestal 2");
  const T0 = A.chile2, RATE = 70 / (A.setenta - T0);
  const anim = (t) => {
    saLook(office, t);
    const used = Math.max(0, t - T0) * RATE; h1.set(used / 81); h2.set(used / 70);
    p2.plate.material[4].color.setScalar(1 + 0.6 * beat(t, A.setenta - 0.1, 0.6));
    fill.position.set(0, 2.2, 1.5); fill.color.set("#ffe0b0"); fill.intensity = 1.0;
  };
  const box = envelope([p1.group, p2.group, h1.group, h2.group], anim, A.c15, A.c16);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c15, A.c16), { zone: "stage", from: [0.08, 0.22, 1], pull0: 1.3, pull: 1.04 })); };
});

// ---------------------------------------------------------------- 17. Venezuela (73.5 – 79.25)
// "E a Venezuela, que em 2013 tinha IDH maior que o nosso, hoje é a última."
addScene("venezuela", A.c16, A.c17, (S) => {
  const { office, M } = saRoom(S); saCast(M, { guy: false, ven: true });
  const tV = saTag(M, "VEN", "VENEZUELA", { bg: "#8a1c14", at: [-66, 8.2], dy: 0.7 }), tB = saTag(M, "BRA", "BRASIL", { bg: "#14502f", at: [-51, -11] });
  const parts = saParts(M, ["VEN", "COL", "GUY", "SUR", "BRA"], [tV, tB]);
  for (const c of ["VEN", "COL", "GUY", "SUR", "BRA"]) S.hero(M.countries[c].grp, "torre " + SA_NAMES[c].toLowerCase());
  S.hero(tV.holder, "placa venezuela", { when: (t) => t > A.venezuela + 0.3 }); S.hero(tB.holder, "placa brasil", { when: (t) => t > A.nosso + 0.3 });
  const from = [-0.05, 0.6, 1];
  const anim = (t) => {
    saLook(office, t);
    M.heights(H_HDI, sm(t, A.hoje, A.ultima + 0.2), H_HDI13);
    tV.set(pop(t, A.venezuela - 0.1, 0.4)); tB.set(pop(t, A.nosso - 0.15, 0.4));
    M.glow("VEN", 0.6 * beat(t, A.ultima - 0.1, 0.9), "#ff6a50"); M.dim(["VEN", "BRA"], 0.7); saFillOn(M, "VEN", 0.9, "#ffb0a0", 0.6);
    office.windows(1 - 0.5 * beat(t, A.ultima - 0.1, 1.0));
  };
  const box = envelopeEach(parts, anim, A.c16, A.c17);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(box, "crane", lin(t, A.c16, A.c17), { zone: "stage", from, rise: 0.3, pull: 1.04 })); };
});

// ---------------------------------------------------------------- 18. duas réguas (79.25 – 82.2)
// "Ser rico e viver bem não são a mesma coisa."
addScene("reguas", A.c17, A.c18, (S) => {
  const { office, M } = saRoom(S); saCast(M, { bra: false, chl: true });
  M.heights(Object.assign({}, H_HDI, { GUY: H_PC.GUY }));
  const r1 = saRuler(S, M, "DINHEIRO", -53, 9.5, { h: 2.4, reach: 0.55 });
  const r2 = saRuler(S, M, "IDH", -77, -25, { h: 2.0, reach: 0.55, side: 1 });
  saHeroMap(S, M, ["GUY", "CHL", "ARG", "URY"]); S.hero(r1.group, "régua dinheiro", { when: (t) => t > A.c17 + 0.5 }); S.hero(r2.group, "régua idh", { when: (t) => t > A.viver + 0.4 });
  const anim = (t) => {
    saLook(office, t);
    popIn(r1.group, t, A.c17 + 0.05, 0.4); popIn(r2.group, t, A.viver - 0.1, 0.4);
    r1.set(M.top + M.h("GUY")); r2.set(M.top + M.h("CHL"));
    M.glow("GUY", 0.6 * lin(t, A.rico2 - 0.2, A.rico2 + 0.3)); M.glow("CHL", 0.6 * lin(t, A.viver - 0.2, A.viver + 0.3), "#9cc4ff");
  };
  const boxes = envelopeEach(saMapParts(M, [r1.group, r2.group]), anim, A.c17, A.c18);
  return (t) => { anim(t); CAM.apply(saMove(boxes, "orbit", lin(t, A.c17, A.c18), { zone: "stage-tall", from: [0, 1.0, 1], deg: 28, pull: 1.03 })); };
});

// ---------------------------------------------------------------- 19. pergunta (82.2 – 90)
// "E aí, se você pudesse escolher: o que pesa mais, salário alto ou viver mais?"
addScene("pergunta", A.c18, A.end, (S) => {
  const { office, M } = saRoom(S); saCast(M, { bra: false, chl: true });
  M.heights(Object.assign({}, H_HDI, { GUY: H_PC.GUY }));
  const tG = saTag(M, "GUY", "GUIANA", { fg: SA_GOLD, h: 0.72, w: 2.0 }), tC = saTag(M, "CHL", "CHILE", { bg: "#1d4a8a", h: 0.72, w: 1.8, at: [-71, -21] });
  saHeroMap(S, M, ["GUY", "CHL", "ARG", "URY"]); S.hero(tG.holder, "placa guiana", { when: (t) => t > A.salario + 0.3 }); S.hero(tC.holder, "placa chile", { when: (t) => t > A.viver2 + 0.3 });
  const from = [0.05, 0.72, 1];
  const anim = (t) => {
    saLook(office, t);
    tG.set(pop(t, A.salario - 0.15, 0.4)); tC.set(pop(t, A.viver2 - 0.15, 0.4));
    M.glow("GUY", 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(t * 4)) * lin(t, A.salario, A.salario + 0.4));
    M.glow("CHL", (0.4 + 0.4 * (0.5 + 0.5 * Math.sin(t * 4 + 2))) * lin(t, A.viver2, A.viver2 + 0.4), "#9cc4ff");
    office.windows(1 + 0.3 * Math.sin(t * 1.5));
  };
  const boxes = envelopeEach(saMapParts(M, [tG.holder, tC.holder]), anim, A.c18, A.end);
  return (t) => { anim(t); M.faceTags(yawOf(from)); CAM.apply(saMove(boxes, "reveal", lin(t, A.c18, A.end), { zone: "stage", from, pull0: 1.12 })); };
});
