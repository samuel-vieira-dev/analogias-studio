// ============================================================================
// props/civic.js · week strip, street sign + sub-plate, law book + stamp, hour column,
//                  folder, crowd, offshore platform, sea, house, hourglass, certificate, ink mark
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

// Small house: walls, gable walls in the wall colour, two roof slabs meeting at the ridge (apex up,
// ridge running front to back, so the front shows the classic house outline), chimney, door, lit
// windows. Origin: floor, centre. Optional `label` is printed on the front gable.
function makeHouse({ w = 1.1, h = 0.8, d = 0.9, roofH = 0.5, wall = "#f4e8da", roof = RED, label = null } = {}) {
  const g = new THREE.Group(), wm = mat(wall, { roughness: 0.85 }), rm = mat(roof, { roughness: 0.7 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.03), wm); body.position.y = h / 2; g.add(body);
  const tri = new THREE.Shape(); tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, roofH); tri.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(tri, { depth: d, bevelEnabled: false }); gableGeo.translate(0, 0, -d / 2);
  const gable = new THREE.Mesh(gableGeo, wm); gable.position.y = h; g.add(gable);
  const over = 0.1, th = 0.07, a = Math.atan2(roofH, w / 2), L = Math.hypot(w / 2, roofH);
  for (const s of [-1, 1]) {
    // s = -1 left slab, +1 right slab; dir runs from the eave up to the ridge, n is the outward normal
    const dir = new V3(-s * Math.cos(a), Math.sin(a), 0), n = new V3(s * Math.sin(a), Math.cos(a), 0);
    const slab = new THREE.Mesh(rbox(L + over, th, d + 2 * over, 0.02), rm);
    slab.position.set(s * w / 4, h + roofH / 2, 0).addScaledVector(dir, -over / 2).addScaledVector(n, th / 2);
    slab.rotation.z = -s * a; g.add(slab);
  }
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(th * 0.75, th * 0.75, d + 2 * over, 12), rm);
  ridge.rotation.x = Math.PI / 2; ridge.position.set(0, h + roofH + th * 0.55, 0); g.add(ridge);
  const cx = w * 0.22, roofAt = h + roofH * (1 - cx / (w / 2));
  const chimney = new THREE.Mesh(rbox(0.16, 0.34, 0.16, 0.02), mat("#b5603f", { roughness: 0.8 })); chimney.position.set(cx, roofAt + 0.12, -d * 0.15); g.add(chimney);
  const door = new THREE.Mesh(rbox(0.26, 0.42, 0.04, 0.015), mat("#7a4a2e")); door.position.set(0, 0.21, d / 2 + 0.01); g.add(door);
  const glass = mat("#ffcf8a", { emissive: "#ffb860", emissiveIntensity: 0.55, roughness: 0.3 });
  for (const x of [-0.34, 0.34]) {
    const frame = new THREE.Mesh(rbox(0.24, 0.24, 0.03, 0.01), mat("#5a3a26")); frame.position.set(x * w / 1.1, h * 0.58, d / 2 + 0.008); g.add(frame);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.02), glass); pane.position.set(x * w / 1.1, h * 0.58, d / 2 + 0.018); g.add(pane);
  }
  if (label) { const p = makePlate(label, w * 0.5, roofH * 0.26, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h + roofH * 0.3, d / 2 + 0.016); g.add(p); }
  g.add(contactShadow(w + 0.7, d + 0.7));
  return g;
}

// Hourglass: two blown-glass bulbs between turned wooden caps on three posts; the sand drains from
// the top bulb through the neck into a growing cone below. Origin: bottom centre.
// API { group, set(k), h, r } — k 0 = all the sand on top, 1 = all of it below.
function makeHourglass({ h = 0.7 } = {}) {
  const g = new THREE.Group(), cap = h * 0.075, bh = (h - 2 * cap) / 2, R = h * 0.2, neck = h * 0.016, mid = h / 2;
  const wood = pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.42, clearcoat: 0.5 });
  for (const y of [cap / 2, h - cap / 2]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.28, R * 1.28, cap, 48), wood); c.position.y = y; g.add(c); }
  for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3 + 0.5; const p = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.075, R * 0.075, h - 2 * cap, 14), wood); p.position.set(Math.cos(a) * R * 1.12, mid, Math.sin(a) * R * 1.12); g.add(p); }
  // bulb radius at s (0 = neck, 1 = cap)
  const rad = (s) => neck + (R - neck) * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, s / 0.62)), 0.75) * (s > 0.86 ? lerp(1, 0.82, (s - 0.86) / 0.14) : 1);
  const prof = []; for (let i = 0; i <= 24; i++) { const s = i / 24; prof.push(new THREE.Vector2(rad(s), -bh * s)); }
  const half = new THREE.LatheGeometry(prof, 48);
  const gm = glassMat({ opacity: 0.18 });
  const lower = new THREE.Mesh(half, gm); lower.position.y = mid; g.add(lower);
  const upper = new THREE.Mesh(half, gm); upper.position.y = mid; upper.rotation.x = Math.PI; g.add(upper);
  const sandM = pmat("#d9b26c", { roughness: 0.95, map: noiseTex({ base: "#d9b26c", amount: 0.12, size: 1.2, seed: 19 }) });
  // top sand: a funnel resting on the neck (radius follows the bulb); bottom sand: a cone on the cap
  const topSand = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.04, 1, 40, 1), sandM); g.add(topSand);
  const botSand = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 40, 1), sandM); g.add(botSand);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(neck * 0.5, neck * 0.5, 1, 8), sandM); g.add(stream);
  const set = (k) => {
    k = clamp(k);
    const ft = Math.pow(1 - k, 0.7) * 0.72, fb = Math.pow(k, 0.7) * 0.62;   // fraction of each bulb's height
    topSand.visible = ft > 0.01; topSand.scale.set(rad(ft) * 0.9, bh * ft, rad(ft) * 0.9); topSand.position.y = mid + bh * ft / 2 + 0.004;
    botSand.visible = fb > 0.01; botSand.scale.set(R * 0.76, bh * fb, R * 0.76); botSand.position.y = cap + bh * fb / 2;
    const top = cap + bh * fb, run = k > 0.01 && k < 0.99; stream.visible = run;
    stream.scale.y = Math.max(0.001, mid - top); stream.position.y = (mid + top) / 2;
  };
  set(0);
  g.add(contactShadow(R * 4, R * 4));
  return { group: g, set, h, r: R * 1.28 };
}

// Official sheet lying flat: paper with ruled body text, a double border, a printed title plate and a
// gold seal with two ribbon tails. Origin: centre of the paper's underside; the face is +y.
// API { group, top, title }
function makeCertificate(title = "LICENÇA", { w = 1.3, d = 1.7, paper = "#f2ece0", seal = true } = {}) {
  const g = new THREE.Group(), T = 0.012;
  const c = makeCanvas(512, Math.round(512 * d / w)), x = c.getContext("2d"), H = c.height;
  x.fillStyle = paper; x.fillRect(0, 0, 512, H);
  x.strokeStyle = "#8a6a3a"; x.lineWidth = 6; x.strokeRect(18, 18, 476, H - 36); x.lineWidth = 2; x.strokeRect(30, 30, 452, H - 60);
  x.fillStyle = "rgba(60,50,40,0.28)"; for (let y = H * 0.3; y < H * 0.78; y += 26) x.fillRect(64, y, 384 - ((y * 7) % 90), 7);
  x.strokeStyle = "rgba(30,30,60,0.55)"; x.lineWidth = 3; x.beginPath(); x.moveTo(90, H * 0.88); x.bezierCurveTo(130, H * 0.84, 150, H * 0.92, 190, H * 0.87); x.bezierCurveTo(215, H * 0.84, 230, H * 0.9, 260, H * 0.86); x.stroke();
  const tex = texFrom(c), pm = pmat(paper, { roughness: 0.92 }), face = pmat("#ffffff", { map: tex, roughness: 0.9 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [pm, pm, face, pm, pm, pm]); sheet.position.y = T / 2; g.add(sheet);
  const tp = makePlate(title, w * 0.8, d * 0.16, { bg: paper, fg: "#2a1d12", depth: 0.002 }); tp.rotation.x = -Math.PI / 2; tp.position.set(0, T + 0.001, -d * 0.32); g.add(tp);
  if (seal) {
    const sx = w * 0.27, sz = d * 0.3;
    for (const s of [-1, 1]) { const rb = new THREE.Mesh(rbox(0.07, 0.006, 0.26, 0.003), pmat("#9b1c1c", { roughness: 0.6 })); rb.position.set(sx + s * 0.05, T + 0.004, sz + 0.14); rb.rotation.y = s * 0.3; g.add(rb); }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 40), pmat(GOLD_METAL, { metalness: 1, roughness: 0.28 })); disc.position.set(sx, T + 0.0125, sz); g.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 40), pmat(GOLD_METAL, { metalness: 1, roughness: 0.35 })); rim.rotation.x = -Math.PI / 2; rim.position.set(sx, T + 0.027, sz); g.add(rim);
  }
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, top: T, title: tp };
}

// Rubber-stamp mark printed on a surface: worn ink inside a double border; one line or two (\n). The plane faces +z (lay it
// flat with rotation.x = -PI/2). Registered as printed text for the QA (userData.plate).
// API: the mesh; fade it with mesh.material.opacity.
function makeInkMark(text, w, h, { ink = "#c8231a", seed = 7 } = {}) {
  const ph = 256, pw = Math.max(64, Math.round(ph * w / h)), c = makeCanvas(pw, ph), x = c.getContext("2d");
  x.strokeStyle = ink; x.fillStyle = ink;
  x.lineWidth = ph * 0.07; roundRect(x, ph * 0.05, ph * 0.05, pw - ph * 0.1, ph * 0.9, ph * 0.1); x.stroke();
  x.lineWidth = ph * 0.025; roundRect(x, ph * 0.15, ph * 0.15, pw - ph * 0.3, ph * 0.7, ph * 0.06); x.stroke();
  // one or two lines ("PRAZO\nVENCIDO"): the font shrinks until every line fits the inner border
  const lines = text.split("\n"), lh = 1.08;
  let px = Math.round(ph * (lines.length > 1 ? 0.3 : 0.46)); x.font = `900 ${px}px Inter`;
  while ((Math.max(...lines.map((l) => x.measureText(l).width)) > pw - ph * 0.5 || px * lh * lines.length > ph * 0.62) && px > 8) { px -= 2; x.font = `900 ${px}px Inter`; }
  x.textAlign = "center"; x.textBaseline = "middle";
  lines.forEach((l, i) => x.fillText(l, pw / 2, ph / 2 + px * 0.05 + (i - (lines.length - 1) / 2) * px * lh));
  // worn ink: specks and streaks lifted out of the print
  x.globalCompositeOperation = "destination-out"; const r = mulberry32(seed);
  for (let i = 0; i < pw * 3; i++) { x.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.65})`; x.fillRect(r() * pw, r() * ph, 1 + r() * 4, 1 + r() * 3); }
  for (let i = 0; i < 6; i++) { x.fillStyle = "rgba(0,0,0,0.25)"; x.fillRect(r() * pw, 0, 3 + r() * 10, ph); }
  const tex = texFrom(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.userData.plate = { text, w, h, depth: 0, frac: px / ph, detail: false };
  return m;
}

// Graduation cap (capelo): skull cap, square board on top, button and a gold tassel hanging over the edge.
// Origin: bottom centre (rests on a plinth). API { group, h }
function makeGraduationCap({ s = 0.6, color = "#16181d" } = {}) {
  const g = new THREE.Group(), cloth = pmat(color, { roughness: 0.75, sheen: 0.4, sheenColor: new THREE.Color("#3a3f4a") }), gold = pmat(GOLD_METAL, { metalness: 0.9, roughness: 0.32 });
  const skullH = s * 0.32, skull = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.34, s * 0.37, skullH, 40), cloth); skull.position.y = skullH / 2; g.add(skull);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.372, s * 0.372, s * 0.05, 40, 1, true), pmat("#0d0e11", { roughness: 0.6, side: THREE.DoubleSide })); band.position.y = s * 0.03; g.add(band);
  const bt = s * 0.035, board = new THREE.Mesh(rbox(s, bt, s, s * 0.01), cloth); board.position.y = skullH + bt / 2; board.rotation.y = Math.PI / 4; g.add(board);
  const top = skullH + bt;
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.035, s * 0.035, s * 0.02, 16), gold); btn.position.y = top + s * 0.01; g.add(btn);
  // cord from the button to the front corner, then the tassel hanging down outside the skull
  const corner = new V3(0, top + bt * 0.2, s * 0.707), cordLen = corner.clone().setY(top).length();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.008, s * 0.008, cordLen, 6), gold); cord.position.set(0, top + s * 0.012, corner.z / 2); cord.rotation.x = Math.PI / 2; g.add(cord);
  const hang = s * 0.26, drop = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.008, s * 0.008, hang, 6), gold); drop.position.set(0, top - hang / 2, corner.z + s * 0.01); g.add(drop);
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.02, s * 0.045, s * 0.16, 12), gold); tassel.position.set(0, top - hang - s * 0.08, corner.z + s * 0.01); g.add(tassel);
  g.add(contactShadow(s * 1.2, s * 1.2));
  return { group: g, h: top + s * 0.02 };
}
