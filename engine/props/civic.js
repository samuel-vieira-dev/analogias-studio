// ============================================================================
// props/civic.js · week strip, street sign + sub-plate, law book + stamp, hour column,
//                  folder, crowd, offshore platform, sea
// ============================================================================

// A week as 7 day blocks on a rail. Work days are orange, days off green with a FOLGA plate.
// Origin: bottom centre of the rail. API: { group, days:[{ group, x, top, set(k) }], width, size }
//   day.set(k): 0 = work, 1 = day off (colour blends; the FOLGA plate shows from 0.5).
function makeWeekStrip({ days = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"], off = [6], size = 0.86, gap = 0.12 } = {}) {
  const g = new THREE.Group(); const n = days.length, width = n * size + (n - 1) * gap;
  const rail = new THREE.Mesh(rbox(width + 0.3, 0.14, size + 0.3, 0.05), mat("#3a2a20", { roughness: 0.8 })); rail.position.y = 0.07; g.add(rail);
  const work = new THREE.Color(ORANGE), rest = new THREE.Color(GREEN);
  const out = days.map((d, i) => {
    const dg = new THREE.Group(); const x = -width / 2 + size / 2 + i * (size + gap); dg.position.set(x, 0.14, 0); g.add(dg);
    const m = mat(ORANGE, { roughness: 0.5 });
    const block = new THREE.Mesh(rbox(size, size, size, 0.07), m); block.position.y = size / 2; dg.add(block);
    const name = makePlate(d, size * 0.84, size * 0.4, { bg: "#141414", fg: "#ffffff" }); name.position.set(0, size * 0.68, size / 2 + 0.016); dg.add(name);
    const folga = makePlate("FOLGA", size * 0.84, size * 0.26, { bg: "#0f3a22", fg: "#c9f5d9" }); folga.position.set(0, size * 0.26, size / 2 + 0.016); dg.add(folga);
    const set = (k) => { m.color.copy(work).lerp(rest, clamp(k)); folga.visible = k >= 0.5; };
    set(off.includes(i) ? 1 : 0);
    return { group: dg, x, top: 0.14 + size, set, mat: m };
  });
  g.add(contactShadow(width + 1.2, size + 1.2));
  return { group: g, days: out, width, size };
}

// Round sign faces (canvas textures for makeStreetSign).
function noParkingTex() {
  const c = makeCanvas(512, 512); const x = c.getContext("2d");
  x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, 512, 512);
  x.strokeStyle = RED; x.lineWidth = 58; x.beginPath(); x.arc(256, 256, 214, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "#141414"; x.font = "900 300px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("E", 256, 270);
  x.strokeStyle = RED; x.lineWidth = 50; x.beginPath(); x.moveTo(256 - 150, 256 - 150); x.lineTo(256 + 150, 256 + 150); x.stroke();
  return texFrom(c);
}
function ringTextTex(lines, ring = GREEN) {
  const c = makeCanvas(512, 512); const x = c.getContext("2d");
  x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, 512, 512);
  x.strokeStyle = ring; x.lineWidth = 58; x.beginPath(); x.arc(256, 256, 214, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "#141414"; x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = [150, 70, 60]; let y = 256 - (lines.length - 1) * 58;
  lines.forEach((t, i) => {
    let px = sizes[i] || 60; x.font = `900 ${px}px Inter`;
    while (x.measureText(t).width > 330 && px > 20) { px -= 4; x.font = `900 ${px}px Inter`; }
    x.fillText(t, 256, y + (i ? 20 : 0)); y += i ? 66 : 96;
  });
  return texFrom(c);
}

// Street sign: pole, round metal disc with a printed face (setFace swaps it), and an anchor
// (`sub`) under the disc where a makeSubPlate() hangs. Origin: foot of the pole.
// API: { group, head (disc group, spin it with rotation.y), face, setFace(tex), sub }
function makeStreetSign({ r = 0.9, pole = 3.7, face = noParkingTex() } = {}) {
  const g = new THREE.Group();
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.08, 24), mat("#4b4642", { metalness: 0.4, roughness: 0.5 })); foot.position.y = 0.04; g.add(foot);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, pole, 16), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.y = pole / 2; g.add(post);
  const cy = pole - r * 0.55;
  const head = new THREE.Group(); head.position.set(0, cy, 0.15); g.add(head);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 64), mat("#c9c4bc", { metalness: 0.5, roughness: 0.4 })); disc.rotation.x = Math.PI / 2; head.add(disc);
  const fm = new THREE.MeshBasicMaterial({ map: face, toneMapped: false });
  const front = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 64), fm); front.position.z = 0.032; head.add(front);
  const sub = new THREE.Group(); sub.position.set(0, cy - r - 0.12, 0.15); g.add(sub);
  g.add(contactShadow(1.3, 1.3));
  return { group: g, head, face: front, setFace: (tex) => { fm.map = tex; }, sub };
}

// Sub-plate under a sign ("EXCETO ..."): one line per entry, shown top-down; the metal back
// grows with the visible lines. Origin: top centre (it hangs downwards).
// API: { group, show(k) } — k = lines shown (a fraction grows the next line in).
function makeSubPlate(lines, { w = 1.8, lineH = 0.3, bg = "#f4f1ea", fg = "#141414" } = {}) {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.04), mat("#c9c4bc", { metalness: 0.5, roughness: 0.4 })); g.add(back);
  const ph = lineH * 0.84;
  const items = lines.map((t) => { const p = makePlate(t, w - 0.12, ph, { bg, fg }); p.position.z = 0.035; g.add(p); return p; });
  function show(k) {
    const n = clamp(k, 0, lines.length); const h = 0.1 + lineH * n;
    back.visible = n > 0.001; back.scale.set(w, Math.max(0.001, h), 1); back.position.y = -h / 2;
    items.forEach((p, i) => { const v = clamp(n - i); p.visible = v > 0.01; p.scale.set(1, Math.max(0.001, v), 1); p.position.y = -0.05 - lineH * i - (lineH - ph) / 2 - ph * v / 2; });
  }
  show(lines.length);
  return { group: g, show, lines: items };
}

// Law book lying flat, cover up, spine on the left. Origin: bottom centre.
// print(text, w, h, z, opts) prints a plate on the cover (readable from the front).
// API: { group, top, print, titlePlate }
function makeLawBook({ w = 1.8, d = 2.3, t = 0.42, color = "#1f3d2e", title = "CONSTITUIÇÃO", emblem = true } = {}) {
  const g = new THREE.Group();
  const board = mat(color, { roughness: 0.6 });
  const back = new THREE.Mesh(rbox(w, 0.05, d, 0.02), board); back.position.y = 0.025; g.add(back);
  const pages = new THREE.Mesh(rbox(w - 0.12, t - 0.1, d - 0.1, 0.02), mat("#efe6d2", { roughness: 0.9 })); pages.position.set(0.03, t / 2, 0); g.add(pages);
  const cover = new THREE.Mesh(rbox(w, 0.05, d, 0.02), board); cover.position.y = t - 0.025; g.add(cover);
  const spine = new THREE.Mesh(rbox(0.12, t, d, 0.05), board); spine.position.set(-w / 2 + 0.06, t / 2, 0); g.add(spine);
  function print(text, pw, ph, z, o = {}) {
    const p = makePlate(text, pw, ph, Object.assign({ bg: color, fg: "#f5d36b" }, o));
    p.rotation.x = -Math.PI / 2; if (o.twist) p.rotation.z = o.twist;
    p.position.set(o.x ?? 0.05, t + 0.016, z); g.add(p); return p;
  }
  const titlePlate = print(title, w * 0.8, 0.34, -d * 0.3);
  if (emblem) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 10, 48), mat("#f5d36b", { metalness: 0.7, roughness: 0.3 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(0.05, t + 0.025, -d * 0.06); g.add(ring);
  }
  g.add(contactShadow(w + 1, d + 1));
  return { group: g, top: t, print, titlePlate };
}

// Rubber stamp, handle up. Origin: centre of the stamping face (it touches what it stamps at y = 0).
function makeStamp({ w = 1.25, d = 0.42, ink = RED } = {}) {
  const g = new THREE.Group();
  const pad = new THREE.Mesh(rbox(w, 0.06, d, 0.02), mat(ink, { roughness: 0.6 })); pad.position.y = 0.03; g.add(pad);
  const block = new THREE.Mesh(rbox(w + 0.06, 0.22, d + 0.06, 0.04), mat("#6a4330", { roughness: 0.7 })); block.position.y = 0.17; g.add(block);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.35, 16), mat("#2b2b2b")); neck.position.y = 0.455; g.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), mat("#2b2b2b", { roughness: 0.35 })); knob.position.y = 0.7; g.add(knob);
  return g;
}

// Column whose height is hours × unit on a small base, with a live label on its front ("44 h").
// Origin: bottom centre. API: { group, setHours(h, text?), top(), mat, w } — text overrides the label (e.g. keep "40 h" while it grows).
function makeHourColumn({ hours = 44, unit = 0.06, w = 0.8, color = ORANGE } = {}) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(w + 0.3, 0.12, w + 0.3, 0.04), mat("#3a2a20", { roughness: 0.8 })); base.position.y = 0.06; g.add(base);
  const m = mat(color, { roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 1, w).translate(0, 0.5, 0), m); body.position.y = 0.12; g.add(body);
  const cap = new THREE.Mesh(rbox(w + 0.04, 0.06, w + 0.04, 0.02), m); g.add(cap);
  const c = makeCanvas(512, 256), x = c.getContext("2d"), tex = texFrom(c);
  const side = mat("#141414");
  const label = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, w * 0.43, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), side]);
  label.position.set(0, 0.12 + 0.36, w / 2 + 0.016); g.add(label);
  let cur = "", h = hours;
  function draw(s) {
    if (s === cur) return; cur = s;
    x.clearRect(0, 0, 512, 256); x.fillStyle = "#141414"; roundRect(x, 0, 0, 512, 256, 30); x.fill();
    x.fillStyle = "#ffffff"; x.font = "900 170px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(s, 256, 138); tex.needsUpdate = true;
  }
  function setHours(v, text) {
    h = v; body.scale.y = Math.max(0.001, v * unit); cap.position.y = 0.12 + body.scale.y + 0.03;
    label.visible = body.scale.y > 0.75; draw(text || Math.round(v) + " h");
  }
  setHours(hours);
  g.add(contactShadow(w + 1, w + 1));
  return { group: g, setHours, top: () => 0.12 + h * unit + 0.06, mat: m, w };
}

// Document folder standing on its bottom edge, label printed on the front. Origin: bottom centre.
function makeFolder(label, { w = 1.0, h = 1.2, color = "#e8c27a" } = {}) {
  const g = new THREE.Group();
  const m = mat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, h, 0.07, 0.03), m); body.position.y = h / 2; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.36, 0.12, 0.05, 0.02), m); tab.position.set(-w * 0.24, h + 0.06, 0); g.add(tab);
  const p = makePlate(label, w * 0.88, h * 0.26, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h * 0.55, 0.05); g.add(p);
  return g;
}

// Compact crowd of pawns (instanced), rows × cols around the origin, on the floor.
// API: { group, reveal(k) } — k 0..1 pops pawns in, in a seeded order.
function makeCrowd({ rows = 6, cols = 15, sx = 0.44, sz = 0.5, seed = 3, colors = [CREAM, ORANGE, "#c9b8a6", "#e0a070"] } = {}) {
  const r = mulberry32(seed); const items = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    items.push({ x: (j - (cols - 1) / 2) * sx + (i % 2) * sx * 0.5 + (r() - 0.5) * 0.08, z: (i - (rows - 1) / 2) * sz + (r() - 0.5) * 0.08, at: r(), c: new THREE.Color(colors[Math.floor(r() * colors.length)]), s: 0.9 + r() * 0.25 });
  }
  const g = new THREE.Group();
  const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.11, 0.26, 6, 12), mat("#ffffff", { roughness: 0.5 }), items.length);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 16, 12), mat("#ffffff", { roughness: 0.5 }), items.length);
  items.forEach((it, i) => { bodies.setColorAt(i, it.c); heads.setColorAt(i, it.c); });
  bodies.frustumCulled = heads.frustumCulled = false;
  g.add(bodies, heads);
  const d = new THREE.Object3D();
  function reveal(k) {
    items.forEach((it, i) => {
      const v = eBack(clamp((k - it.at * 0.75) / 0.25)), s = Math.max(0.0001, v * it.s);
      d.scale.setScalar(s); d.position.set(it.x, 0.24 * s, it.z); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
      d.position.set(it.x, 0.56 * s, it.z); d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    });
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
  }
  reveal(1);
  g.add(contactShadow((cols + 1) * sx, (rows + 1) * sz));
  return { group: g, reveal };
}

// Generic offshore oil platform (no brand): legs into the sea, deck, modules, derrick, helipad,
// flare boom. Origin: sea level under its centre. API: { group, flame, deckTop }
function makeOilRig() {
  const g = new THREE.Group();
  const steel = mat("#8b9196", { metalness: 0.55, roughness: 0.4 }), rust = mat("#c9541f", { roughness: 0.55 }), dark = mat("#3b3f43", { roughness: 0.6 });
  const rod = (a, b, rad = 0.04, m = rust) => {
    const va = new V3(...a), vb = new V3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, va.distanceTo(vb), 8), m);
    mesh.position.copy(va).add(vb).multiplyScalar(0.5); mesh.quaternion.setFromUnitVectors(new V3(0, 1, 0), vb.clone().sub(va).normalize()); g.add(mesh); return mesh;
  };
  const deck0 = 1.9, deckTop = deck0 + 0.22;
  for (const [x, z] of [[-1.0, -0.75], [1.0, -0.75], [-1.0, 0.75], [1.0, 0.75]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, deck0 + 0.3, 20), rust); leg.position.set(x, (deck0 - 0.3) / 2, z); g.add(leg);
  }
  for (const z of [-0.75, 0.75]) { rod([-1.0, 0.25, z], [1.0, 1.55, z]); rod([1.0, 0.25, z], [-1.0, 1.55, z]); }
  for (const x of [-1.0, 1.0]) { rod([x, 0.25, -0.75], [x, 1.55, 0.75]); rod([x, 0.25, 0.75], [x, 1.55, -0.75]); }
  const deck = new THREE.Mesh(rbox(2.9, 0.22, 2.2, 0.04), steel); deck.position.y = deck0 + 0.11; g.add(deck);
  const m1 = new THREE.Mesh(rbox(1.0, 0.55, 0.9, 0.04), mat("#ece7de", { roughness: 0.6 })); m1.position.set(-0.8, deckTop + 0.275, 0.45); g.add(m1);
  const m2 = new THREE.Mesh(rbox(0.8, 0.4, 0.7, 0.04), mat(ORANGE, { roughness: 0.5 })); m2.position.set(-0.85, deckTop + 0.2, -0.55); g.add(m2);
  const dx = 0.55, dz = -0.35, dh = 2.1, b = 0.36, tp = 0.1;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rod([dx + sx * b, deckTop, dz + sz * b], [dx + sx * tp, deckTop + dh, dz + sz * tp], 0.035);
  for (let i = 1; i <= 4; i++) {
    const k = i / 5, s = lerp(b, tp, k), y = deckTop + dh * k;
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    corners.forEach((p, j) => { const q = corners[(j + 1) % 4]; rod([dx + p[0] * s, y, dz + p[1] * s], [dx + q[0] * s, y, dz + q[1] * s], 0.025); });
  }
  const crown = new THREE.Mesh(rbox(0.32, 0.18, 0.32, 0.03), rust); crown.position.set(dx, deckTop + dh + 0.09, dz); g.add(crown);
  const padY = deckTop + 0.55;
  rod([1.0, deckTop, 0.75], [1.0, padY - 0.03, 0.75], 0.06, steel);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 40), dark); pad.position.set(1.0, padY, 0.75); g.add(pad);
  const H = makePlate("H", 0.46, 0.46, { bg: "#3b3f43", fg: "#f5c400" }); H.rotation.x = -Math.PI / 2; H.position.set(1.0, padY + 0.046, 0.75); g.add(H);
  rod([-1.4, deckTop - 0.05, -0.7], [-2.3, deckTop + 0.85, -0.7], 0.05);
  const flame = makeFlame(); flame.position.set(-2.3, deckTop + 1.1, -0.7); flame.scale.setScalar(1.6); g.add(flame);
  return { group: g, flame, deckTop };
}

// Animated sea surface (decoration: it runs past the frame and never blocks text checks).
// API: { mesh, update(t) }
function makeSea({ size = 70, seg = 80, color = "#173a45" } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.15, flatShading: true }));
  mesh.position.y = 0.03; mesh.userData.decor = true;
  const pos = geo.attributes.position, base = Float32Array.from(pos.array);
  function update(t) {
    for (let i = 0; i < pos.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pos.array[i * 3 + 1] = Math.sin(x * 0.9 + t * 1.6) * 0.06 + Math.sin(z * 1.3 - t * 1.1) * 0.05; }
    pos.needsUpdate = true;
  }
  update(0);
  return { mesh, update };
}
