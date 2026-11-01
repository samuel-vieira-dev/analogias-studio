// ============================================================================
// videos/2026-11-01-historia-divida-publica/scenes.js
// A dívida pública do Brasil ano a ano, 1880–2028 (FMI), sem narração: só música (ElevenLabs Music,
// audio/music.mp3; batidas em 0,5 · 5,5 · 10,5 · 20,6 · 24,4 · 30,6 · 40,6 · pausa 51,3 · 55,5 s).
// Each year is a column of gold coins, one coin = 1 % of GDP, on a floor tag with the year, in a long
// hall that changes era along the timeline (archive → factory → glass city). The camera rides the
// front of the chart; the counter in the headline (video.json, kind "counter") shows year and value.
//
// Pattern for every scene: anim(t) moves objects only; CAM.pose(...) frames the subject in the safe
// zone ("stage": the headline always has text here). During the race the subject is the window of
// the last few years (the hero), the older columns are context (userData.decor, not framed/checked).
// DEBT and YEARMAP are written by gerar.py (this folder) together with the counter steps in video.json:
// edit them there, not here.
// ============================================================================

// <dados> (gerado: não editar à mão)
const DEBT = [[1880, 99.0], [1881, 105.3], [1882, 107.9], [1883, 93.8], [1884, 120.7], [1885, 107.6], [1886, 99.4], [1887, 107.3], [1888, 103.4], [1889, 105], [1890, 101.0], [1891, 69.2], [1892, 86.8], [1893, 64.4], [1894, 63.6], [1895, 75.4], [1896, 72.2], [1897, 68.7], [1898, 60.6], [1899, 62.5], [1900, 54.9], [1901, 66.7], [1902, 62.8], [1903, 66.7], [1904, 59], [1905, 60.7], [1906, 50.3], [1907, 45.7], [1908, 47.8], [1909, 42.9], [1910, 39.9], [1911, 35.8], [1912, 34.2], [1913, 37.7], [1914, null], [1915, null], [1916, null], [1917, null], [1918, null], [1919, null], [1920, null], [1921, null], [1922, null], [1923, 56.5], [1924, 48.1], [1925, 39.4], [1926, 45.6], [1927, 52.1], [1928, 40.1], [1929, 46.2], [1930, 59.2], [1931, 75.6], [1932, 73.8], [1933, 93.7], [1934, 81.0], [1935, 85.3], [1936, 71.9], [1937, 61.0], [1938, 60.2], [1939, 55.7], [1940, 56.7], [1941, 50.0], [1942, 42.4], [1943, 37.5], [1944, 29.1], [1945, 26.5], [1946, 18.8], [1947, 13.9], [1948, 10.7], [1949, 9.8], [1950, 9.0], [1951, 6.9], [1952, 5.5], [1953, 14.0], [1954, 14.7], [1955, 17.0], [1956, 34.6], [1957, 22.1], [1958, 30.6], [1959, 24.0], [1960, 22.3], [1961, 25.7], [1962, 23.7], [1963, 20.4], [1964, 22.2], [1965, 17.6], [1966, 19.6], [1967, 13.8], [1968, 15.8], [1969, 16.5], [1970, 17.0], [1971, 17.9], [1972, 22.5], [1973, 22.4], [1974, 25.7], [1975, 27.7], [1976, 31.8], [1977, 31.0], [1978, 37.0], [1979, 36.6], [1980, 39.7], [1981, 34.6], [1982, 32.8], [1983, 51.5], [1984, 55.8], [1985, 52.6], [1986, 49.4], [1987, 50.3], [1988, 46.9], [1989, 40.2], [1990, 40.6], [1991, 38.1], [1992, 37.1], [1993, 32.6], [1994, 30], [1995, 28], [1996, 30.7], [1997, 31.8], [1998, 38.9], [1999, 44.5], [2000, 62.2], [2001, 67.3], [2002, 76.1], [2003, 71.5], [2004, 68.0], [2005, 67.0], [2006, 64.6], [2007, 63.0], [2008, 61.4], [2009, 64.7], [2010, 62.4], [2011, 60.6], [2012, 61.6], [2013, 59.6], [2014, 61.6], [2015, 71.7], [2016, 77.4], [2017, 82.7], [2018, 84.8], [2019, 87.1], [2020, 96.0], [2021, 88.9], [2022, 83.9], [2023, 84.0], [2024, 87], [2025, 93.3], [2026, 97, 1], [2027, 99.3, 1], [2028, 101.3, 1]]; // [ano, % do PIB (null = sem dado), projeção?] · FMI (dados.json)
const YEARMAP = [[10.5, 1880], [13.1, 1884], [16.0, 1890], [19.8, 1914], [21.3, 1923], [24.35, 1933], [27.6, 1952], [28.6, 1953], [30.6, 1983], [34.3, 1994], [40.6, 2020], [45.0, 2025], [46.9, 2026], [49.8, 2028], [51.3, 2028.6]]; // [tempo (s), ano na frente do gráfico]
// </dados>

const COIN_R = 0.19, COIN_T = 0.05, STEP = 0.5;
const ERAS = [{ x0: -10, x1: 21.25, kind: "archive" }, { x0: 21.25, x1: 50.75, kind: "industrial" }, { x0: 50.75, x1: 86, kind: "modern" }];
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// time → front year (float): the year whose column is rising now
function frontYear(t) {
  if (t <= YEARMAP[0][0]) return YEARMAP[0][1];
  for (let i = 1; i < YEARMAP.length; i++) if (t <= YEARMAP[i][0]) return lerp(YEARMAP[i - 1][1], YEARMAP[i][1], lin(t, YEARMAP[i - 1][0], YEARMAP[i][0]));
  return YEARMAP[YEARMAP.length - 1][1];
}
// year → the time its column starts to rise
function yearTime(y) {
  for (let i = 1; i < YEARMAP.length; i++) if (y <= YEARMAP[i][1] + 1e-9) return lerp(YEARMAP[i - 1][0], YEARMAP[i][0], (y - YEARMAP[i - 1][1]) / Math.max(1e-9, YEARMAP[i][1] - YEARMAP[i - 1][1]));
  return YEARMAP[YEARMAP.length - 1][0];
}
// growth 0..1 of a year's column at time t (rises over up to 0.9 s, quicker when years fly by)
function growth(y, t) {
  const t0 = yearTime(y), d = clamp((yearTime(y + 1) - t0) * 2.2, 0.35, 0.9);
  return eOut(lin(t, t0, t0 + d));
}

// ---------------------------------------------------------------- shared set
function buildHall(S) {
  const hall = makeEraHall(ERAS, { wallZ: -3.6, ceil: 10, front: 60 }); // deep: wide shots stay over the floor
  S.backdrop(hall.group);
  return hall;
}
function buildChart(S) {
  const chart = makeCoinTimeline(DEBT.map(([year, value, proj]) => ({ year, value, proj: !!proj })), { step: STEP, r: COIN_R, t: COIN_T, unit: 1 });
  S.add(chart.group);
  const line = chart.line(100 * COIN_T, { color: RED }); // 100 % of GDP (explained by the counter's chip)
  asBackdrop(line.group);
  // the record column, lit red at the reveal; the column rising now, lit warmer than the rest
  chart.recordMat = coinMetalMat("#e8553a", { emissive: "#8a1608", emissiveIntensity: 0.9, roughness: 0.25 });
  chart.litMat = coinMetalMat("#f0c45e", { emissive: "#6a4508", emissiveIntensity: 0.55 });
  return { chart, line };
}
// CAM.pose that keeps the lens under the hall's ceiling (10 m): a high shot flattens its angle until the
// camera sits below 8.6 m (above the ceiling the LED strips would cross the frame).
function poseUnderCeiling(box, o, ymax = 8.6) {
  let P = CAM.pose(box, o), f = o.from.slice();
  for (let i = 0; i < 8 && P.pos.y > ymax; i++) { f = [f[0], f[1] * 0.8, f[2]]; P = CAM.pose(box, { ...o, from: f }); }
  return P;
}
// The hall's light for the warm, dark look; the hall's own floor replaces the engine's.
function hallLight() { floor.visible = false; key.intensity = 2.0; key.color.set("#ffc9a0"); hemi.intensity = 0.34; scene.environmentIntensity = 0.55; }

// ============================================================ 1 · gancho (0–5.5)
// "Em que ano o Brasil mais deveu? Adivinhe antes de ver." Towers of gold coins in the dark archive,
// with no years on them, and a flip calendar in front that only shows "????" (and the centuries).
addScene("gancho", 0, 5.5, (S) => {
  const hall = buildHall(S);
  const towers = new THREE.Group(); S.add(towers);
  const plinth = makeChartPlinth(-STEP, 11 * STEP); towers.add(plinth);
  for (const [year, value] of DEBT.filter(([y]) => y >= 1880 && y <= 1890)) {
    const c = makeCoinColumn(Math.round(value), { r: COIN_R, t: COIN_T, seed: year }); c.set(1); c.group.position.set((year - DEBT[0][0]) * STEP, plinth.userData.top, 0); towers.add(c.group);
  }
  const cx = (1885 - DEBT[0][0]) * STEP;
  const cal = makeFlipCalendar(["????", "18??", "19??", "20??", "????"], { w: 1.3, h: 1.1 }); cal.group.position.set(cx, 0, 1.45); S.add(cal.group);
  const anim = (t) => {
    hall.update(t);
    const flips = [3.35, 3.85, 4.35, 4.85]; let i = 0, k = 0;
    flips.forEach((f, j) => { if (t >= f + 0.22) i = j + 1; else if (t >= f) { i = j; k = lin(t, f, f + 0.22); } });
    cal.show(Math.min(i, 4), k);
  };
  S.hero(towers, "torres de moedas sem ano"); S.hero(cal.group, "calendário ????");
  S.solid(cal.group, "calendário");
  const box = envelope([towers, cal.group], anim, 0, 5.5);
  return (t) => {
    anim(t); hallLight();
    fill.intensity = 8; fill.color.set("#ffb066"); fill.position.set(cx + 0.5, 6.8, 2.4); fill.distance = 10;
    // crane: from low (the towers loom over the calendar) up to eye level, sliding round a little
    CAM.apply(CAM.move(box, "crane", lin(t, 0, 5.5), { zone: "stage", from: [0.16, 0.12, 1], rise: 0.12, pull: 1.03 }));
  };
});

// ============================================================ 2 · 1824 (5.5–10.5)
// The first loan: a contract with a seal on an archive desk, a little stack of gold sovereigns, an
// inkwell and a quill. Ends pushing in on the coins (match cut to the first column of coins, 1880).
function makeArchiveDesk({ w = 1.8, d = 1.0, h = 0.78 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.3 });
  const top = new THREE.Mesh(rbox(w, 0.05, d, 0.015), wood); top.position.y = h - 0.025; g.add(top);
  const leather = new THREE.Mesh(rbox(w * 0.62, 0.004, d * 0.66, 0.002), pmat("#2a3a2a", { map: cachedTex("ledger-leather", () => noiseTex({ base: "#bdbdbd", amount: 0.22, size: 1.5, seed: 47 })), roughness: 0.7 }));
  leather.position.set(0, h + 0.002, 0.02); g.add(leather);
  for (const sx of [-1, 1]) {
    const ped = new THREE.Mesh(rbox(0.42, h - 0.05, d - 0.08, 0.012), wood); ped.position.set(sx * (w / 2 - 0.25), (h - 0.05) / 2, 0); g.add(ped);
    for (let k = 0; k < 3; k++) { const kn = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); kn.position.set(sx * (w / 2 - 0.25), 0.16 + k * 0.22, d / 2 - 0.035); g.add(kn); }
  }
  // modesty panel at the back of the kneehole and a drawer under the top
  const back = new THREE.Mesh(rbox(w - 0.9, h - 0.2, 0.03, 0.008), wood); back.position.set(0, (h - 0.2) / 2 + 0.1, -d / 2 + 0.06); g.add(back);
  const drawer = new THREE.Mesh(rbox(w - 0.92, 0.1, 0.02, 0.006), wood); drawer.position.set(0, h - 0.11, d / 2 - 0.04); g.add(drawer);
  const pull = new THREE.Mesh(rbox(0.12, 0.018, 0.02, 0.006), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); pull.position.set(0, h - 0.11, d / 2 - 0.02); g.add(pull);
  g.add(contactShadow(w + 0.5, d + 0.5));
  return { group: g, topY: h + 0.004 };
}
function makeInkwellQuill() {
  const g = new THREE.Group();
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 32), glassMat({ opacity: 0.35, color: "#c9d6dc" })); jar.position.y = 0.035; g.add(jar);
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.045, 32), pmat("#0b0d1a", { roughness: 0.1, clearcoat: 1 })); ink.position.y = 0.024; g.add(ink);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.018, 24), pmat("#b08d4a", { metalness: 1, roughness: 0.3 })); cap.position.y = 0.079; g.add(cap);
  // quill: shaft from inside the jar up and back, a vane on each side of it
  const q = new THREE.Group(); q.position.set(0, 0.06, 0); q.rotation.set(-0.5, 0.4, 0.15); g.add(q);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.34, 8), pmat("#efe6d2", { roughness: 0.5 })); shaft.position.y = 0.17; q.add(shaft);
  const vs = new THREE.Shape(); vs.moveTo(0, 0); vs.quadraticCurveTo(0.045, 0.08, 0.02, 0.24); vs.lineTo(0, 0.25); vs.closePath();
  for (const s of [1, -1]) { const v = new THREE.Mesh(new THREE.ShapeGeometry(vs), pmat("#f4efe4", { roughness: 0.8, side: THREE.DoubleSide })); v.scale.x = s; v.position.y = 0.09; q.add(v); }
  return g;
}
addScene("1824", 5.5, 10.5, (S) => {
  const hall = buildHall(S);
  const desk = makeArchiveDesk(); desk.group.position.set(2.2, 0, -1.2); S.add(desk.group);
  const doc = makeCertificate("1824", { w: 1.3, d: 1.7 }); doc.group.scale.setScalar(0.48); doc.group.position.set(1.95, desk.topY, -1.22); doc.group.rotation.y = 0.1; S.add(doc.group);
  // a little pile of gold sovereigns: a short stack and two loose coins on the felt
  const coins = new THREE.Group(); coins.position.set(2.55, desk.topY, -1.02); S.add(coins);
  const pile = makeCoinColumn(5, { r: 0.04, t: 0.0065, seed: 3 }); pile.set(1); coins.add(pile.group);
  for (const [x, z, a] of [[0.085, 0.04, 0.4], [-0.02, 0.09, 1.3]]) { const c = makeCoinColumn(1, { r: 0.04, t: 0.0065, seed: 7 }); c.set(1); c.group.position.set(x, 0, z); c.group.rotation.y = a; coins.add(c.group); }
  const ink = makeInkwellQuill(); ink.position.set(2.78, desk.topY, -1.52); S.add(ink);
  const anim = (t) => { hall.update(t); };
  S.hero(doc.group, "contrato de 1824", { when: (t) => t < 9.4 }); S.hero(coins, "moedas de ouro", { when: (t) => t >= 9.4 });
  S.solid(desk.group, "mesa"); S.solid(doc.group, "contrato", { restsOn: ["mesa"] }); S.solid(coins, "moedas", { restsOn: ["mesa"] }); S.solid(ink, "tinteiro", { restsOn: ["mesa"] });
  const all = envelope([doc.group, coins], anim, 5.5, 10.5); // the inkwell may run off the frame
  const coinBox = envelope([coins], anim, 9.4, 10.5);
  return (t) => {
    anim(t); hallLight();
    fill.intensity = 3; fill.color.set("#ffc27a"); fill.position.set(2.3, 2.2, -0.4); fill.distance = 4;
    // orbit over the desk, then push down onto the coins
    const O = CAM.move(all, "orbit", lin(t, 5.5, 9.4), { zone: "stage", from: [0.2, 1.0, 0.9], deg: 60, pull: 1.0 });
    const P = CAM.move(coinBox, "push", lin(t, 9.4, 10.5), { zone: "stage", from: [0.3, 0.55, 1], pull: 1.0, pull0: 1.6 });
    CAM.apply(t < 9.4 ? O : CAM.blend(CAM.move(all, "orbit", 1, { zone: "stage", from: [0.2, 1.0, 0.9], deg: 60, pull: 1.0 }), P, sm(t, 9.4, 9.9)));
  };
});

// ============================================================ 3 · a corrida (10.5–51.3)
// The columns rise year by year; the camera rides the front. Each key: [t, from, N (years in the
// window), cut?]. Between keys the camera eases; a cut jumps (listed in video.json → cuts).
const RACE_CAM = [
  [10.5, [0.62, 0.1, 1], 3.2],
  [12.2, [0.7, 0.16, 1], 4.2],
  [13.6, [0.5, 0.5, 1], 5.2],          // crane up as the 1880s tower out
  [16.0, [0.42, 0.3, 1], 9],           // truck along the Empire
  [19.6, [0.62, 0.22, 1], 11],         // wider: the Republic slides down
  [21.3, [0.3, 0.14, 1], 10],          // low over the taped-off gap
  [24.35, [0.6, 0.32, 1], 7],          // push into 1933
  [27.5, [0.85, 0.06, 0.62], 5.5],     // drop to the floor at 1952, the lowest
  [28.5, [0.8, 0.1, 0.7], 5],          // hold on it while the music holds
  [28.6, [0.35, 0.26, 1], 6, true],    // cut: the years fly (short, low columns: a narrow window)
  [30.5, [0.4, 0.28, 1], 6.5],
  [34.2, [0.75, 0.3, 0.7], 10],        // swing round to the Plano Real
  [34.3, [0.45, 0.2, 1], 9, true],     // cut: low, beside the 1990s
  [40.4, [0.55, 0.28, 1], 13],         // truck through the 2000s
  [41.8, [0.72, 0.24, 0.9], 6],        // push in on 2020
  [45.0, [0.7, 0.3, 0.75], 6],         // three-quarter on 2025
  [47.0, [0.68, 0.34, 0.8], 6.5],
  [51.3, [0.62, 0.5, 1], 11],          // rise and pull out with the projections
];
function raceKey(t) {
  let i = 0; while (i + 1 < RACE_CAM.length && RACE_CAM[i + 1][0] <= t) i++;
  const a = RACE_CAM[i], b = RACE_CAM[i + 1];
  if (!b || b[3]) return { from: a[1], N: a[2] };
  const k = eInOut(lin(t, a[0], b[0]));
  return { from: a[1].map((v, j) => lerp(v, b[1][j], k)), N: lerp(a[2], b[2], k) };
}
function heightAt(chart, y, t) { const s = chart.slot(y); return s && s.col ? s.col.height(growth(y, t)) : 0; }
function windowRange(t, N) { const fy = frontYear(t); return [Math.max(DEBT[0][0], Math.ceil(fy - N)), Math.floor(fy + 0.6)]; }
// Camera box of the window: x from the oldest year in it to just past the front; height = the tallest
// column in it, as a max over ±0.8 s averaged over ±0.5 s (smooth, and never below the real height).
function raceBox(chart, t) {
  const { N } = raceKey(t), fy = frontYear(t);
  const hRaw = (u) => { const [a, b] = windowRange(u, N); let h = 0.4; for (let y = a; y <= b; y++) h = Math.max(h, heightAt(chart, y, u)); return h; };
  let sum = 0, n = 0;
  for (let s = -0.5; s <= 0.5001; s += 0.1) { let m = 0; for (let u = -0.8; u <= 0.8001; u += 0.1) m = Math.max(m, hRaw(t + s + u)); sum += m; n++; }
  const h = Math.max(sum / n, hRaw(t));
  return new THREE.Box3(new V3(chart.xOf(Math.max(fy - N, DEBT[0][0] - 0.6)) - COIN_R - 0.05, 0, -COIN_R - 0.05), new V3(chart.xOf(fy + 0.6) + COIN_R + 0.05, h + chart.baseY, COIN_R + 0.42));
}
addScene("corrida", 10.5, 51.3, (S) => {
  const hall = buildHall(S);
  const { chart, line } = buildChart(S);
  let lastN = 0;
  const anim = (t) => {
    hall.update(t);
    // crises turn the hall red; the lowest year warms it; the pandemic flashes the city
    const red = Math.max(beat(t, 23.6, 1.6), beat(t, 30.4, 1.4) * 0.9, beat(t, 40.4, 1.6));
    hall.tint(red * 0.85, "#ff2a1a");
    const fy = frontYear(t), { N } = raceKey(t), [a, b] = windowRange(t, N), now = Math.floor(fy + 1e-6);
    for (const s of chart.slots) {
      if (s.col) { s.col.set(growth(s.year, t)); if (!s.proj) s.col.material(s.year === now ? chart.litMat : chart.gold); }
      s.group.visible = s.year <= fy + 1.5;              // the future is not built yet
      s.group.userData.decor = !(s.year >= a && s.year <= b); // the window is the subject
    }
    line.set(0.55 + 0.45 * beat(t, 45.8, 3.5));
    lastN = N;
  };
  S.hero(chart.group, "colunas de moedas (janela da frente)");
  return (t) => {
    anim(t); hallLight();
    const fy = frontYear(t), y = Math.round(fy), top = heightAt(chart, y, t);
    // warm light on the rising column (softer over the glossy floor of the modern hall)
    fill.intensity = chart.xOf(fy) > ERAS[2].x0 ? 3 : 5.5; fill.color.set("#ffb066"); fill.position.set(chart.xOf(fy) + 0.4, chart.baseY + top + 1.4, 1.2); fill.distance = 6;
    let P = poseUnderCeiling(raceBox(chart, t), { zone: "stage", from: raceKey(t).from, pull: 1.06 });
    P = CAM.shake(P, t, 30.6, 0.35, 0.7); P = CAM.shake(P, t, 40.6, 0.3, 0.6);
    CAM.apply(P);
  };
});

// ============================================================ 4 · recorde (51.3–55.5)
// Rewind: the camera runs back along the full chart from the projections to the Empire (the counter in
// video.json runs the years backwards with it), and stops on 1884, which turns red: the record.
const REWIND = [51.3, 54.6, 2028, 1884];
function rewindYear(t) { return lerp(REWIND[2], REWIND[3], eInOut(lin(t, REWIND[0], REWIND[1]))); }
addScene("recorde", 51.3, 55.5, (S) => {
  const hall = buildHall(S);
  const { chart, line } = buildChart(S);
  for (const s of chart.slots) if (s.col) s.col.set(1);
  const rec = chart.slot(1884);
  const N = (t) => lerp(14, 6, sm(t, 54.0, 55.0));
  const shaft = makeLightShaft([rec.x, 9.8, 0.2], [rec.x, chart.baseY, 0.05], { w0: 0.4, w1: 1.1, color: "#ff8a5a", opacity: 0.2 }); S.add(shaft.group);
  const range = (t) => { const c = rewindYear(t), n = N(t); return [Math.ceil(c - n / 2), Math.floor(c + n / 2)]; };
  const hFull = (y) => { const s = chart.slot(y); return s && s.col ? s.col.height(1) : 0; };
  const anim = (t) => {
    hall.update(t); hall.tint(0.3 * beat(t, 54.5, 1.0), "#ff5a2a");
    chart.highlight(1884, t > 54.45 ? chart.recordMat : chart.gold); shaft.set(sm(t, 54.4, 54.9));
    line.set(0.8);
    const [a, b] = range(t);
    for (const s of chart.slots) s.group.userData.decor = !(s.year >= a && s.year <= b);
  };
  S.hero(chart.group, "colunas de moedas (janela)");
  // camera box: the window around the rewind point; height = the tallest column within ±0.8 s
  const boxAt = (t) => {
    const n = N(t), c = rewindYear(t); let h = 0.4;
    for (let u = -0.8; u <= 0.8001; u += 0.1) { const [a, b] = range(t + u); for (let y = a; y <= b; y++) h = Math.max(h, hFull(y)); }
    return new THREE.Box3(new V3(chart.xOf(c - n / 2) - COIN_R - 0.05, 0, -COIN_R - 0.05), new V3(chart.xOf(c + n / 2) + COIN_R + 0.05, h + chart.baseY, COIN_R + 0.42));
  };
  return (t) => {
    anim(t); hallLight();
    fill.intensity = t > 54.45 ? 9 : 4; fill.color.set(t > 54.45 ? "#ff5a2a" : "#ffb066"); fill.position.set(chart.xOf(rewindYear(t)) + 0.6, 6.8, 1.6); fill.distance = 8;
    const k = sm(t, 53.8, 55.3);
    CAM.apply(poseUnderCeiling(boxAt(t), { zone: "stage", from: [lerp(0.3, 0.62, k), lerp(0.36, 0.26, k), 1], pull: 1.05 }));
  };
});

// ============================================================ 5 · pergunta (55.5–60)
// Back at the tower of the hook: the calendar now shows 1884. Orbit round the tower.
addScene("pergunta", 55.5, 60, (S) => {
  const hall = buildHall(S);
  const { chart } = buildChart(S);
  for (const s of chart.slots) { if (s.col) s.col.set(1); s.group.userData.decor = s.year !== 1884; }
  chart.highlight(1884, chart.recordMat);
  const rec = chart.slot(1884);
  const cal = makeFlipCalendar(["????", "1884"], { w: 1.1, h: 0.95 }); cal.group.position.set(rec.x, 0, 1.4); S.add(cal.group);
  const shaft = makeLightShaft([rec.x, 9.8, 0.2], [rec.x, chart.baseY, 0.05], { w0: 0.4, w1: 1.1, color: "#ff8a5a", opacity: 0.2 }); S.add(shaft.group);
  const anim = (t) => { hall.update(t); cal.show(t < 55.9 ? 0 : 1, t < 55.9 ? lin(t, 55.6, 55.9) : 0); };
  S.hero(rec.group, "torre de 1884"); S.hero(cal.group, "calendário 1884");
  S.solid(cal.group, "calendário");
  const box = envelope([rec.group, cal.group], anim, 55.5, 60);
  return (t) => {
    anim(t); hallLight();
    fill.intensity = 7; fill.color.set("#ff7a3a"); fill.position.set(rec.x + 0.6, 6.6, 1.6); fill.distance = 9;
    CAM.apply(CAM.move(box, "orbit", lin(t, 55.5, 60), { zone: "stage", from: [0.3, 0.32, 1], deg: 40, pull: 1.04 }));
  };
});
