// ============================================================================
// props/charts.js · data charts built from real things, not flat bars:
//   coin column (a stack of gold coins, one coin = one unit of the data), a row of coin columns over a
//   timeline (one slot per year, year printed on a floor tag, gaps with no data taped off), a glowing
//   reference line, and glass "projection" coins.
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
