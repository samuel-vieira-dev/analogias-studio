// ============================================================================
// props/finance.js · breaker panel, bulb, chart screen, stairs, timeline rail, V chart
// ============================================================================

// Electrical panel with a main breaker. API: { group, leverPivot, lever, label, setLabel(tex), box }
// leverPivot.rotation.x: -0.55 = ON (up), 0.65 = OFF (down).
function makeBreakerPanel(labelText = "CASA") {
  const g = new THREE.Group();
  const panel = new THREE.Mesh(rbox(2.3, 3.0, 0.36, 0.08), mat("#8b9196", { metalness: 0.55, roughness: 0.38 })); panel.position.set(0, 2.1, 0); g.add(panel);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.65), mat("#3b3f43", { roughness: 0.7 })); inner.position.set(0, 2.1, 0.185); g.add(inner);
  [-0.68, 0.68].forEach((x) => { const b = new THREE.Mesh(rbox(0.42, 0.95, 0.22, 0.04), mat("#ece7de")); b.position.set(x, 2.35, 0.3); g.add(b); const l = new THREE.Mesh(rbox(0.18, 0.28, 0.12, 0.03), mat("#222")); l.position.set(x, 2.5, 0.43); g.add(l); });
  const main = new THREE.Mesh(rbox(0.66, 1.25, 0.26, 0.05), mat("#f4efe6")); main.position.set(0, 2.35, 0.31); g.add(main);
  const leverPivot = new THREE.Group(); leverPivot.position.set(0, 2.35, 0.45); g.add(leverPivot);
  const lever = new THREE.Mesh(rbox(0.28, 0.5, 0.16, 0.05), mat(ORANGE, { emissive: ORANGE, emissiveIntensity: 0.25 })); leverPivot.add(lever);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.31), new THREE.MeshBasicMaterial({ map: plateTex(labelText, { bg: "#141414", fg: "#fff", w: 640, h: 200, font: "900 130px Inter" }), toneMapped: false }));
  label.position.set(0, 3.28, 0.2); g.add(label);
  return { group: g, leverPivot, lever, label, setLabel: (tex) => { label.material.map = tex; }, box: [[-1.2, 0.55, -0.2], [1.2, 3.65, 0.6]] };
}
function makeWire(points, radius = 0.05) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new V3(...p)));
  const m = mat("#2a2a2a", { emissive: "#ff5a1f", emissiveIntensity: 0 });
  return { mesh: new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius, 10, false), m), curve, mat: m };
}
function makeBulb() {
  const g = new THREE.Group();
  const m = mat("#fff2d6", { emissive: "#ffcf7a", emissiveIntensity: 1.2, roughness: 0.2 });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), m));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 20), mat("#9a9a9a", { metalness: 0.6, roughness: 0.3 })); cap.position.y = 0.38; g.add(cap);
  const light = new THREE.PointLight("#ffcf7a", 4, 7, 1.4); g.add(light);
  return { group: g, mat: m, light };
}
// Small monitor showing a price line. paint(fall 0..1, paused bool).
function makeChartScreen(w = 1.3, h = 0.86) {
  const c = makeCanvas(640, 420); const x = c.getContext("2d"); const tex = texFrom(c);
  const mesh = new THREE.Mesh(rbox(w, h, 0.08, 0.05), [mat("#111"), mat("#111"), mat("#111"), mat("#111"), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), mat("#111")]);
  let key = "";
  function paint(fall, paused) {
    const k = Math.round(fall * 80) + "|" + paused; if (k === key) return; key = k;
    x.fillStyle = "#14100e"; x.fillRect(0, 0, 640, 420);
    x.strokeStyle = "rgba(255,255,255,0.08)"; x.lineWidth = 2; for (let y = 60; y < 420; y += 70) { x.beginPath(); x.moveTo(0, y); x.lineTo(640, y); x.stroke(); }
    x.strokeStyle = fall > 0.05 ? "#ff4d3a" : "#38c172"; x.lineWidth = 10; x.lineJoin = "round"; x.beginPath();
    for (let i = 0; i <= 50; i++) { const u = i / 50; const y = 150 + Math.sin(u * 11) * 16 + (u > 0.45 ? Math.pow((u - 0.45) / 0.55, 1.6) * 230 * fall : 0); i ? x.lineTo(30 + u * 580, y) : x.moveTo(30, y); }
    x.stroke();
    if (paused) { x.fillStyle = "rgba(224,38,27,0.9)"; roundRect(x, 150, 150, 340, 120, 20); x.fill(); x.fillStyle = "#fff"; x.font = "900 72px Inter"; x.textAlign = "center"; x.fillText("PAUSA", 320, 237); }
    tex.needsUpdate = true;
  }
  return { mesh, paint };
}

// Descending steps (left→right). Each step is its own group (block + edge strip + riser plate),
// so it can be registered as a solid. labels: text printed on each riser (e.g. "−10%").
// Returns { group, steps:[{ group, x, top, width, depth, plate }] }.
function makeStairs(levels = 3, { width = 1.45, depth = 1.8, top0 = 2.6, drop = 1.0, labels = [] } = {}) {
  const g = new THREE.Group(); const steps = [];
  for (let k = 0; k < levels; k++) {
    const top = top0 - k * drop, x = -width * (levels - 1) / 2 + k * width;
    const last = k === levels - 1;
    const sg = new THREE.Group(); sg.position.set(x, 0, 0); g.add(sg);
    const block = new THREE.Mesh(rbox(width, top, depth, 0.05), mat(last ? "#6a2a1f" : "#5b4234", { roughness: 0.7 })); block.position.set(0, top / 2, 0); sg.add(block);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: last ? RED : ORANGE, toneMapped: false })); strip.position.set(0, top - 0.015, depth / 2 - 0.035); sg.add(strip);
    let plate = null;
    if (labels[k]) { const ph = Math.min(0.42, top * 0.62); plate = makePlate(labels[k], width * 0.84, ph, { bg: last ? RED : "#2a1c14", fg: "#ffffff" }); plate.position.set(0, top - 0.08 - ph / 2, depth / 2 + 0.016); sg.add(plate); }
    steps.push({ group: sg, x, top, width, depth, plate });
  }
  g.add(contactShadow(width * levels + 2.5, depth + 2));
  return { group: g, steps };
}

// Horizontal rail of years with stacks of red pucks (one per event).
// counts: { year: n }. Returns { group, X(year), stacks: { year: { group, pucks:[{g, m}], label } } }.
function makeTimeline({ from = 1997, to = 2026, step = 1.15, counts = {}, highlight = null, pad = 1.2 } = {}) {
  const g = new THREE.Group(); const X = (y) => (y - from) * step;
  const rail = new THREE.Mesh(rbox(X(to) - X(from) + 2 * pad, 0.1, 0.36, 0.04), mat("#4a382c")); rail.position.set((X(from) + X(to)) / 2, 0.05, 0); g.add(rail);
  for (let y = from; y <= to; y++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.5), mat(y % 5 === 0 ? "#bfa58f" : "#6a5546")); tk.position.set(X(y), 0.06, 0.3); g.add(tk); }
  const puckGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.16, 40), puckTop = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32);
  const stacks = {};
  for (const [ys, n] of Object.entries(counts)) {
    const y = +ys, pucks = [];
    const sg = new THREE.Group(); sg.position.set(X(y), 0, 0); g.add(sg);
    for (let i = 0; i < n; i++) {
      const pg = new THREE.Group(); const m = mat(RED, { emissive: RED, emissiveIntensity: 0.0, roughness: 0.4 });
      pg.add(new THREE.Mesh(puckGeo, m)); const tp = new THREE.Mesh(puckTop, mat("#ffd0c4", { roughness: 0.4 })); tp.position.y = 0.09; pg.add(tp);
      pg.position.set(0, 0.18 + i * 0.19, 0); sg.add(pg); pucks.push({ g: pg, m });
    }
    const label = sprite(chipTex(String(y), { bg: null, fg: y === highlight ? ORANGE : "#e9dccf", font: "900 120px Inter", h: 160 }), y === highlight ? 1.25 : 0.95);
    label.position.set(0, 0.32, 1.05); sg.add(label); // inside the stack group: framing a stack includes its year
    stacks[y] = { group: sg, pucks, label };
  }
  return { group: g, X, stacks };
}

// V-shaped chart: red fall + green recovery as tubes on a grid. setLeft/setRight(0..1) draw progressively.
function makeVChart(L, R, { radius = 0.12 } = {}) {
  const g = new THREE.Group();
  const toV = (a) => a.map(([x, y]) => new V3(x, y, 0));
  const cL = new THREE.CatmullRomCurve3(toV(L), false, "catmullrom", 0.1), cR = new THREE.CatmullRomCurve3(toV(R), false, "catmullrom", 0.1);
  const tL = new THREE.Mesh(new THREE.TubeGeometry(cL, 200, radius, 12, false), mat(RED, { emissive: RED, emissiveIntensity: 0.35 }));
  const rMat = mat(GREEN, { emissive: GREEN, emissiveIntensity: 0.35, transparent: true });
  const tR = new THREE.Mesh(new THREE.TubeGeometry(cR, 200, radius, 12, false), rMat); g.add(tL, tR);
  const nL = tL.geometry.index.count, nR = tR.geometry.index.count;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.3, 40), mat("#3a2a20")); base.position.set(0, 0.15, 0); g.add(base);
  const xs = [...L, ...R].map((p) => p[0]), ys = [...L, ...R].map((p) => p[1]);
  return {
    group: g, cL, cR, rMat,
    setLeft: (k) => tL.geometry.setDrawRange(0, Math.floor(nL * clamp(k) / 6) * 6),
    setRight: (k) => tR.geometry.setDrawRange(0, Math.floor(nR * clamp(k) / 6) * 6),
    box: [[Math.min(...xs) - 0.2, 0, -0.9], [Math.max(...xs) + 0.2, Math.max(...ys) + 0.2, 0.9]],
  };
}
