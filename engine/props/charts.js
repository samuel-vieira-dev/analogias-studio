// ============================================================================
// props/charts.js · data charts built from real things, not flat bars:
//   coin column (a stack of gold coins, one coin = one unit of the data), a row of coin columns over a
//   timeline (one slot per year, year printed on a floor tag, gaps with no data taped off), a glowing
//   reference line, glass "projection" coins, and the world as a disc cut like a pie (makeShareDisc).
// Data and time drive everything: column(i).set(k) shows k of its coins (0..1), so a scene can grow the
// chart year by year. Units: metres. Origin: floor; the timeline runs along +x; front = +z.
// ============================================================================

// One coin: a short cylinder whose groups take [edge, face, face] materials (coinMetalMat).
function coinGeometry(r, t) { const g = new THREE.CylinderGeometry(r, r, t, 56, 1); g.translate(0, t / 2, 0); return g; }
// Struck-coin relief, as a bump map: raised rim, a ring of beads and a small constellation in the field.
function coinFaceTex() {
  return cachedTex("coin-face", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"), cx = 128;
    x.fillStyle = "#7a7a7a"; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(cx, cx, 127, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#8c8c8c"; x.beginPath(); x.arc(cx, cx, 112, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#d8d8d8"; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; x.beginPath(); x.arc(cx + Math.cos(a) * 100, cx + Math.sin(a) * 100, 4, 0, Math.PI * 2); x.fill(); }
    x.strokeStyle = "#cfcfcf"; x.lineWidth = 3; x.beginPath(); x.arc(cx, cx, 88, 0, Math.PI * 2); x.stroke();
    for (const [dx, dy, rr] of [[0, -42, 9], [0, 46, 10], [-38, 4, 8], [34, -6, 8], [14, 18, 5]]) { x.fillStyle = "#e4e4e4"; x.beginPath(); x.arc(cx + dx, cx + dy, rr, 0, Math.PI * 2); x.fill(); }
    return texFrom(c);
  });
}
// Reeded edge (fine vertical ridges around the rim), as a bump map along the cylinder's u.
function coinEdgeTex() {
  return cachedTex("coin-edge", () => {
    const c = makeCanvas(512, 8), x = c.getContext("2d"); x.fillStyle = "#808080"; x.fillRect(0, 0, 512, 8);
    for (let i = 0; i < 128; i++) { x.fillStyle = "#d0d0d0"; x.fillRect(i * 4, 0, 2, 8); }
    const t = texFrom(c); t.wrapS = THREE.RepeatWrapping; return t;
  });
}
// Gold for the coins: [edge (reeded), face (struck relief), face]. o: extra material options (emissive…).
function coinMetalMat(color = "#c9a24e", o = {}) {
  const brush = cachedTex("coin-brush", () => noiseTex({ base: "#b8b8b8", amount: 0.12, size: 1, seed: 77 }));
  const edge = pmat(color, Object.assign({ metalness: 1, roughness: 0.32, bumpMap: coinEdgeTex(), bumpScale: 1.2, clearcoat: 0.25 }, o));
  const face = pmat(color, Object.assign({ metalness: 1, roughness: 0.28, roughnessMap: brush, bumpMap: coinFaceTex(), bumpScale: 2.5, clearcoat: 0.3, clearcoatRoughness: 0.2 }, o));
  return [edge, face, face];
}
// Long low museum plinth (dark stone, brass nosing on the front edge) for a row of columns.
// Origin: floor; spans x0..x1; top at h. Returns the group (top height in userData.top), marked as backdrop.
function makeChartPlinth(x0, x1, { h = 0.14, z0 = -0.5, z1 = 0.85 } = {}) {
  const g = new THREE.Group(), L = x1 - x0, D = z1 - z0;
  const stone = pmat("#ffffff", { map: tileTex(cachedTex("plinth-stone", () => noiseTex({ base: "#2b2724", amount: 0.14, size: 2, seed: 63 })), L / 2, D / 2), roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const top = new THREE.Mesh(rbox(L, h, D, 0.02), stone); top.position.set(x0 + L / 2, h / 2, z0 + D / 2); g.add(top);
  const brass = new THREE.Mesh(rbox(L, 0.025, 0.03, 0.008), pmat("#b8924a", { metalness: 1, roughness: 0.3 })); brass.position.set(x0 + L / 2, h - 0.012, z1 + 0.005); g.add(brass);
  const sh = contactShadow(L + 0.8, D + 0.8); sh.position.set(x0 + L / 2, 0.002, z0 + D / 2); g.add(sh);
  g.userData.top = h; asBackdrop(g); return g;   // a base, never the subject (QA and framing skip it)
}

// Stack of n coins (instanced), a little uneven like a real pile. Origin: floor centre.
// API { group, mesh, n, set(k), height(k), top(k), material(m) }  set(k): shows round(k·n) coins
function makeCoinColumn(n, { r = 0.19, t = 0.05, seed = 1, material = null, geometry = null } = {}) {
  const g = new THREE.Group(), rnd = mulberry32(seed), N = Math.max(1, n);
  const mesh = new THREE.InstancedMesh(geometry || coinGeometry(r, t), material || coinMetalMat(), N);
  const d = new THREE.Object3D();
  for (let i = 0; i < N; i++) {
    d.position.set((rnd() - 0.5) * r * 0.14, i * t, (rnd() - 0.5) * r * 0.14); d.rotation.set((rnd() - 0.5) * 0.02, rnd() * 6.28, (rnd() - 0.5) * 0.02);
    d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
  }
  mesh.count = n > 0 ? N : 0; mesh.visible = n > 0;
  g.add(mesh);
  const shadow = contactShadow(r * 3.2, r * 3.2); g.add(shadow);
  const shown = (k) => (n > 0 ? Math.round(clamp(k) * n) : 0);
  return {
    group: g, mesh, n,
    set(k) { const c = shown(k); mesh.count = Math.max(1, c); mesh.visible = c > 0; mesh.boundingBox = null; mesh.boundingSphere = null; },
    height: (k) => shown(k) * t,
    top: (k) => new V3(0, shown(k) * t, 0),
    material(m) { mesh.material = m; },
  };
}

// Yellow and black hazard stripes (taped-off floor, barrier rails).
function hazardTex() {
  return cachedTex("hazard", () => {
    const c = makeCanvas(256, 64), x = c.getContext("2d"); x.fillStyle = "#1b1612"; x.fillRect(0, 0, 256, 64); x.fillStyle = "#e0b43a";
    for (let k = -2; k < 10; k++) { x.beginPath(); x.moveTo(k * 32, 64); x.lineTo(k * 32 + 16, 64); x.lineTo(k * 32 + 40, 0); x.lineTo(k * 32 + 24, 0); x.closePath(); x.fill(); }
    return texFrom(c);
  });
}
// Small museum tag on the floor in front of a column, tilted up to the viewer, with the year printed.
// Origin: floor point under the tag. Text is texture (detail): the on-screen counter is what you read.
function makeFloorTag(text, { w = 0.36, h = 0.14, bg = "#1a1411", fg = "#e9dcc7", detail = true } = {}) {
  const g = new THREE.Group();
  const wedge = new THREE.Mesh(rbox(w + 0.04, 0.05, h * 0.7, 0.01), pmat("#2a211b", { roughness: 0.55 })); wedge.position.y = 0.025; g.add(wedge);
  const p = makePlate(text, w, h, { bg, fg, depth: 0.012, detail }); p.rotation.x = -1.0; p.position.set(0, 0.05 + Math.sin(1.0) * h / 2 * 0.2 + 0.02, 0); g.add(p);
  return g;
}

// Row of coin columns over a timeline. data: [{ year, value|null, proj? }], one slot per year.
//   step: metres between years · unit: value per coin (1 → one coin per 1 %) · t: coin thickness
// Slots without a value are taped off and fenced. Projection years are dotted columns of glowing discs.
// The row stands on a plinth `plinth` m high (0: on the floor); column heights are measured from its top (baseY).
// API { group, baseY, slots[{year, value, x, col, tag, proj}], xOf(year), slot(year), line(y) → {group, set(k)},
//       highlight(year, mat), set(year, k) }
function makeCoinTimeline(data, { step = 0.5, unit = 1, r = 0.19, t = 0.05, tags = true, seed = 5, plinth = 0.14 } = {}) {
  const root = new THREE.Group(), g = new THREE.Group(), y0 = data[0].year;
  // the row stands on a museum plinth; everything else is built on its top (g)
  if (plinth) root.add(makeChartPlinth(-step, (data[data.length - 1].year - y0 + 1) * step, { h: plinth }));
  g.position.y = plinth; root.add(g);
  const geo = coinGeometry(r, t), gold = coinMetalMat();
  // projection coins: a dotted column (the chart convention for "not yet"): thin glowing orange discs with
  // gaps between them, at the same one-coin-per-unit spacing
  const glass = new THREE.MeshBasicMaterial({ color: "#ff5a1f", toneMapped: false });
  const dotGeo = coinGeometry(r, t * 0.32);
  const xOf = (year) => (year - y0) * step;
  const slots = data.map((d, i) => {
    const s = { year: d.year, value: d.value, proj: !!d.proj, x: xOf(d.year), group: new THREE.Group() };
    s.group.position.x = s.x; g.add(s.group);
    if (d.value != null) {
      s.col = makeCoinColumn(Math.round(d.value / unit), { r, t, seed: seed + i, geometry: d.proj ? dotGeo : geo, material: d.proj ? glass : gold });
      s.group.add(s.col.group); s.col.set(0);
    } else {
      // no data: the slot is taped off on the floor and fenced with a striped rail on posts
      const hz = pmat("#ffffff", { map: hazardTex(), roughness: 0.6 });
      const tape = new THREE.Mesh(new THREE.PlaneGeometry(step, r * 2.4), hz); tape.rotation.x = -Math.PI / 2; tape.position.y = 0.004; s.group.add(tape); s.tape = tape;
      const rail = new THREE.Mesh(rbox(step, 0.07, 0.05, 0.01), hz); rail.position.set(0, 0.42, r + 0.05); s.group.add(rail);
      const post = () => { const p = new THREE.Group(), m = pmat("#1f1b18", { metalness: 0.6, roughness: 0.35 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.46, 12), m); pole.position.y = 0.23; p.add(pole);
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 20), m); foot.position.y = 0.0125; p.add(foot); return p; };
      const prev = data[i - 1], next = data[i + 1];
      if (!prev || prev.value != null) { const p = post(); p.position.set(-step / 2, 0, r + 0.05); s.group.add(p); }
      const pr = post(); pr.position.set(step / 2, 0, r + 0.05); s.group.add(pr);
    }
    if (tags) { s.tag = makeFloorTag(String(d.year), { fg: d.proj ? "#ffb37a" : "#e9dcc7" }); s.tag.position.set(0, 0, r + 0.22); s.group.add(s.tag); }
    return s;
  });
  const byYear = new Map(slots.map((s) => [s.year, s]));
  // Glowing reference line at height y behind the columns: a laser across the hall from an emitter on a
  // post at its start. No printed text (the video explains it on screen). API { group, set(k) }
  function line(y, { color = RED, z = -r - 0.2, from = -1.2, to = null } = {}) {
    const lg = new THREE.Group(), x1 = to ?? xOf(data[data.length - 1].year) + 1.2, L = x1 - from;
    const beamMat = new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.95 });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, L, 12), beamMat); beam.rotation.z = Math.PI / 2; beam.position.set(from + L / 2, y, z); lg.add(beam);
    const haloMat = new THREE.MeshBasicMaterial({ map: cachedTex("line-halo", () => { const c = makeCanvas(8, 128), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 8, 128); return texFrom(c); }), color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.5), haloMat); halo.position.set(from + L / 2, y, z - 0.01); lg.add(halo);
    const metal = pmat("#2a2522", { metalness: 0.6, roughness: 0.35 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, y - 0.06, 16), metal); post.position.set(from - 0.08, (y - 0.06) / 2, z); lg.add(post);
    const head = new THREE.Mesh(rbox(0.22, 0.12, 0.12, 0.02), metal); head.position.set(from - 0.02, y, z); lg.add(head);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 20), beamMat); lens.rotation.z = Math.PI / 2; lens.position.set(from + 0.095, y, z); lg.add(lens);
    g.add(lg);
    return { group: lg, set(k) { beamMat.opacity = 0.95 * k; haloMat.opacity = 0.6 * k; lg.visible = k > 0.01; } };
  }
  return {
    group: root, slots, xOf, line, baseY: plinth,
    slot: (year) => byYear.get(year),
    set(year, k) { const s = byYear.get(year); if (s && s.col) s.col.set(k); },
    highlight(year, m) { const s = byYear.get(year); if (s && s.col) s.col.material(m || gold); },
    gold, glass,
  };
}

// The world as a round slab cut like a pie: a polished disc with the world map printed on top (seen from
// above the North Pole) and, in `color`, the slice of one share, as a solid wedge standing proud of the disc. set(frac, lift): frac 0..1 of the circle; lift 0..1 slides the slice
// out towards the viewer. Origin: floor (or plinth top) centre; the slice opens towards +z.
// API { group, set(frac, lift), r, h }
function shareDiscTex() {
  return cachedTex("shareDisc", () => {
    // the world map seen from above the North Pole (azimuthal: the pole in the centre, the far south on the rim),
    // from the same simplified outlines as the desk globe (props/sanitation.js → GLOBE_LANDS)
    const c = makeCanvas(1024, 1024), x = c.getContext("2d"), R = 500, P = ([lo, la]) => { const rr = (90 - la) / 180 * R, a = lo * Math.PI / 180; return [512 + Math.cos(a) * rr, 512 + Math.sin(a) * rr]; };
    const sea = x.createRadialGradient(512, 512, 40, 512, 512, R); sea.addColorStop(0, "#2f6a94"); sea.addColorStop(1, "#1d4e74"); x.fillStyle = sea; x.fillRect(0, 0, 1024, 1024);
    x.strokeStyle = "rgba(230,240,250,0.2)"; x.lineWidth = 2;
    for (let k = 1; k <= 5; k++) { x.beginPath(); x.arc(512, 512, k * R / 6, 0, Math.PI * 2); x.stroke(); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; x.beginPath(); x.moveTo(512, 512); x.lineTo(512 + Math.cos(a) * R, 512 + Math.sin(a) * R); x.stroke(); }
    const fill = (pts) => { x.beginPath(); pts.forEach((p, i) => { const [px, py] = P(p); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); x.fillStyle = "#d3c294"; x.fill(); x.strokeStyle = "rgba(90,70,40,0.6)"; x.lineWidth = 3; x.stroke(); };
    GLOBE_LANDS.forEach(fill);
    x.strokeStyle = "#e9eef2"; x.lineWidth = R * 0.12; x.beginPath(); x.arc(512, 512, R * 0.94, 0, Math.PI * 2); x.stroke();   // Antarctica on the rim
    return texFrom(c);
  });
}
function makeShareDisc({ r = 0.5, h = 0.08, color = RED } = {}) {
  const g = new THREE.Group(), side = pmat("#1b1e25", { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 96), [side, pmat("#ffffff", { map: shareDiscTex(), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }), side]); disc.position.y = h / 2; g.add(disc);
  const sliceM = pmat(color, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06, emissive: color, emissiveIntensity: 0.18, side: THREE.DoubleSide });   // the extruded caps of a sector can come out wound inwards
  const slice = new THREE.Mesh(new THREE.BufferGeometry(), sliceM); g.add(slice);
  g.add(contactShadow(r * 2.6, r * 2.6));
  let last = -1;
  const set = (frac, lift = 0) => {
    const q = Math.round(clamp(frac) * 400) / 400;
    if (q !== last) {
      last = q; slice.geometry.dispose(); slice.visible = q > 0.002;
      const th = Math.max(0.004, q) * Math.PI * 2, sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, r * 1.012, Math.PI / 2 - th / 2, Math.PI / 2 + th / 2, false); sh.lineTo(0, 0);   // a pie slice from the centre; shape +y becomes world +z below
      slice.geometry = new THREE.ExtrudeGeometry(sh, { depth: h * 1.12, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 64 });
      slice.geometry.rotateX(Math.PI / 2); slice.geometry.translate(0, h * 1.12 + 0.004, 0);   // just proud of the disc: a slice, not a standing wedge
    }
    const k = clamp(lift); slice.position.set(0, 0, r * 0.16 * k);
  };
  set(0);
  return { group: g, set, r, h };
}

// ---------------------------------------------------------------- line chart on a glass wall
// Tube along a polyline lying in a plane of constant z (a chart line): rings of `seg` vertices, one ring per point,
// so ring i is data point i and setDrawRange(0, i·seg·6) draws the line up to point i.
function chartTubeGeometry(P, rad, seg = 10) {
  const n = P.length, pos = new Float32Array(n * seg * 3), idx = [], T = new V3(), N = new V3();
  for (let i = 0; i < n; i++) {
    T.copy(P[Math.min(n - 1, i + 1)]).sub(P[Math.max(0, i - 1)]).normalize(); N.set(-T.y, T.x, 0).normalize();
    for (let j = 0; j < seg; j++) { const a = (j / seg) * Math.PI * 2, c = Math.cos(a) * rad, k = (i * seg + j) * 3; pos[k] = P[i].x + N.x * c; pos[k + 1] = P[i].y + N.y * c; pos[k + 2] = P[i].z + Math.sin(a) * rad; }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) { const a = i * seg + j, b = i * seg + ((j + 1) % seg); idx.push(a, a + seg, b, b, a + seg, b + seg); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
}
// A line chart built as an installation: a wall of smoked glass standing on a dark plinth, etched grid lines for each
// unit of value (its label printed at the left of every 5th year) and each year, steel fins behind the glass every
// 5 years, an orange reference line, and one lit tube per series (a bright core in a soft glow) held off the glass
// by steel standoffs, one per year. The years are printed on the plinth. Nothing floats: the tubes ride the
// standoffs, the glass sits in a steel channel on the plinth. First used in 2026-11-07-moedas-fortes-x-real.
//   series: [{ key, pts: [[year, value], …] sorted, color, z (the tube's distance in front of the glass) }]
//   o: from/to (years), xs (m per year), ys (m per unit of value), vmax (top of the grid), ref (value of the
//      orange line, or null), unit (prefix of the axis labels, "R$ "), r (tube radius)
// Origin: the glass at z = 0; x = xs·(year − from); y = base + ys·value; front = +z.
// API { group, xOf(year), yOf(value), at(key, year) → value|null, tip(key, year) → V3|null, reveal(year), glow(k),
//       base, top, x0, x1 } — reveal(year) draws every tube and its standoffs up to that (fractional) year.
function makeLineChartWall(series, { from, to, xs = 0.55, ys = 0.6, vmax = 8.6, ref = 1, unit = "", r = 0.035, plinthH = 0.16 } = {}) {
  const g = new THREE.Group(), deco = new THREE.Group(), base = plinthH + 0.12, top = base + vmax * ys + 0.15;
  const xOf = (y) => (y - from) * xs, yOf = (v) => base + v * ys, x0 = xOf(from) - 0.8, x1 = xOf(to) + 1.8, L = x1 - x0, cx = (x0 + x1) / 2;
  g.add(deco);
  deco.add(makeChartPlinth(x0, x1, { h: plinthH, z0: -0.2, z1: 0.95 }));
  for (let y = Math.ceil(from); y <= Math.floor(to); y++) { const tg = makeFloorTag(String(y), { w: 0.34, h: 0.13 }); tg.position.set(xOf(y), plinthH, 0.72); deco.add(tg); }
  // smoked glass in a steel channel, a top rail, fins behind the glass every 5 years
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(L, top - plinthH), new THREE.MeshPhysicalMaterial({ color: "#0b1626", roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.5, envMapIntensity: 1.3, depthWrite: false }));
  glass.position.set(cx, plinthH + (top - plinthH) / 2, 0); deco.add(glass);
  const steel = pmat("#2a2e34", { metalness: 0.85, roughness: 0.3 });
  for (const [y, h] of [[plinthH + 0.05, 0.1], [top, 0.07]]) { const b = new THREE.Mesh(rbox(L, h, 0.09, 0.01), steel); b.position.set(cx, y, 0); deco.add(b); }
  for (let y = Math.ceil(from / 5) * 5; y <= to; y += 5) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, top - plinthH, 0.16), steel); f.position.set(xOf(y), plinthH + (top - plinthH) / 2, -0.09); deco.add(f); }
  // etched grid: a line per unit of value, a fainter one per year (stronger every 5 years)
  const etch = (o) => new THREE.MeshBasicMaterial({ color: "#d9e4f2", transparent: true, opacity: o, depthWrite: false, toneMapped: false });
  for (let v = 1; v <= Math.floor(vmax); v++) if (v !== ref) { const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.009, 0.002), etch(0.2)); m.position.set(cx, yOf(v), 0.004); deco.add(m); }
  for (let y = Math.ceil(from); y <= to; y++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.006, top - base, 0.002), etch(y % 5 ? 0.07 : 0.16)); m.position.set(xOf(y), base + (top - base) / 2, 0.004); deco.add(m); }
  for (let y = Math.ceil(from / 5) * 5; y <= to; y += 5) for (let v = 1; v <= Math.floor(vmax); v++) {
    const p = makePlate(unit + v, 0.34, 0.12, { bg: null, fg: "#cfd9e6", depth: 0.002, detail: true }); p.position.set(xOf(y) + 0.24, yOf(v) + 0.085, 0.005); deco.add(p);
  }
  let refMat = null;
  if (ref != null) { refMat = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false }); const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.022, 0.006), refMat); m.position.set(cx, yOf(ref), 0.006); deco.add(m); }
  asBackdrop(deco);
  // the tubes and their standoffs
  const S = {}, pin = new THREE.CylinderGeometry(0.009, 0.009, 1, 8); pin.rotateX(Math.PI / 2); pin.translate(0, 0, 0.5);
  const pinM = pmat("#9aa2ab", { metalness: 0.95, roughness: 0.25 }), seg = 10;
  for (const s of series) {
    const P = s.pts.map(([y, v]) => new V3(xOf(y), yOf(v), s.z));
    const col = new THREE.Color(s.color), hot = col.clone().lerp(new THREE.Color("#ffffff"), 0.35);
    const core = new THREE.Mesh(chartTubeGeometry(P, r, seg), new THREE.MeshBasicMaterial({ color: hot, toneMapped: false }));
    const halo = new THREE.Mesh(chartTubeGeometry(P, r * 2.6, seg), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    core.userData.noShadow = halo.userData.noShadow = true; core.frustumCulled = halo.frustumCulled = false;
    const years = []; for (let y = Math.ceil(s.pts[0][0]); y <= s.pts[s.pts.length - 1][0]; y++) years.push(y);
    const pins = new THREE.InstancedMesh(pin, pinM, Math.max(1, years.length)), d = new THREE.Object3D();
    g.add(core, halo, pins);
    S[s.key] = { s, core, halo, pins, years, d };
  }
  const at = (key, y) => {
    const p = S[key].s.pts; if (y < p[0][0]) return null;
    let lo = 0, hi = p.length - 1; if (y >= p[hi][0]) return p[hi][1];
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (p[m][0] <= y) lo = m; else hi = m; }
    return lerp(p[lo][1], p[hi][1], (y - p[lo][0]) / (p[hi][0] - p[lo][0]));
  };
  for (const k in S) { const o = S[k]; o.years.forEach((y, i) => { o.d.position.set(xOf(y), yOf(at(k, y)), 0); o.d.scale.set(1, 1, o.s.z); o.d.updateMatrix(); o.pins.setMatrixAt(i, o.d.matrix); }); }
  function reveal(y) {
    for (const k in S) {
      const o = S[k], p = o.s.pts; let i = -1; while (i + 1 < p.length && p[i + 1][0] <= y) i++;
      const n = Math.max(0, i) * seg * 6; o.core.geometry.setDrawRange(0, n); o.halo.geometry.setDrawRange(0, n); o.core.visible = o.halo.visible = i > 0;
      const c = o.years.filter((yy) => yy <= y).length; o.pins.count = Math.max(1, c); o.pins.visible = c > 0;
    }
  }
  reveal(from);
  return {
    group: g, xOf, yOf, at, base, top, x0, x1,
    tip: (key, y) => { const v = at(key, y); return v == null ? null : new V3(xOf(Math.min(y, S[key].s.pts[S[key].s.pts.length - 1][0])), yOf(v), S[key].s.z); },
    reveal,
    glow(k) { for (const key in S) S[key].halo.material.opacity = 0.28 * k; if (refMat) refMat.color.set(ORANGE).multiplyScalar(0.6 + 0.4 * k); },
  };
}
