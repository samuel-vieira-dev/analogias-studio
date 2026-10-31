// ============================================================================
// props/commerce.js · online shopping and the toll-road analogy: blouse, shipping box,
//                     two-lane road, toll gate (first used in 2026-10-30-taxa-blusinhas-2027)
// Realistic finish (docs/visual.md): cardboard and asphalt textures (props/materials.js), bevelled
// edges, the details that say what the object is (tape, label, kerbs, reflective boom stripes).
// ============================================================================

// Polka-dot woven fabric: tiles once per world unit (ExtrudeGeometry caps use the shape's x, y as UVs).
function dotsTex(bg, dot) {
  const c = makeCanvas(256, 256), x = c.getContext("2d"); x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) { x.fillStyle = "rgba(0,0,0,0.07)"; x.fillRect(i, 0, 1, 256); x.fillStyle = "rgba(255,255,255,0.05)"; x.fillRect(0, i, 256, 1); }
  x.fillStyle = dot;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const cx = 32 + 64 * i + (j % 2) * 32, cy = 32 + 64 * j;
    for (const ox of [0, -256]) { x.beginPath(); x.arc(cx + ox, cy, 8, 0, Math.PI * 2); x.fill(); }
  }
  const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// Blouse ("blusinha"): fitted waist, short sleeves, scoop neck, polka-dot woven fabric. The body is
// curved like a torso (not a flat cut-out) and the sleeves come forward a little.
// Origin: bottom centre (hem); faces +z; height 0.84.
function makeBlouse(color = "#e85aa6", { dots = "#ffffff" } = {}) {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-0.27, 0); s.quadraticCurveTo(0, -0.04, 0.27, 0);           // hem, slightly curved
  s.lineTo(0.25, 0.3); s.lineTo(0.29, 0.55);                            // waist → underarm
  s.lineTo(0.5, 0.47); s.lineTo(0.58, 0.6); s.lineTo(0.33, 0.8);        // sleeve → shoulder
  s.lineTo(0.14, 0.82); s.quadraticCurveTo(0, 0.66, -0.14, 0.82);       // scoop neck
  s.lineTo(-0.33, 0.8); s.lineTo(-0.58, 0.6); s.lineTo(-0.5, 0.47); s.lineTo(-0.29, 0.55); s.lineTo(-0.25, 0.3); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.025, bevelSegments: 3, curveSegments: 20 }).translate(0, 0.02, -0.05);
  // torso curve around the vertical axis, sleeve ends forward, a soft ripple near the hem
  const pos = geo.attributes.position, v = new V3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i); const ax = Math.abs(v.x);
    pos.setZ(i, v.z - 0.42 * v.x * v.x + (ax > 0.32 ? 0.14 * (ax - 0.32) : 0) + 0.025 * Math.sin(v.x * 18) * Math.max(0, 0.3 - v.y));
  }
  geo.computeVertexNormals();
  const tex = dotsTex(color, dots); tex.repeat.set(4, 4);
  const body = new THREE.Mesh(geo, [mat("#ffffff", { map: tex, roughness: 0.92 }), mat("#ffffff", { map: fabricTex(color), roughness: 0.92 })]); g.add(body);
  return g;
}

// Shipping label (white sticker, barcode, address lines; optional airmail border). Canvas texture.
function shippingLabelTex(text = "ENCOMENDA", airmail = false) {
  const c = makeCanvas(400, 300), x = c.getContext("2d");
  x.fillStyle = "#fbf7ef"; x.fillRect(0, 0, 400, 300);
  if (airmail) { for (let i = -4; i < 30; i++) { x.fillStyle = i % 2 ? "#2f6fb0" : "#e0261b"; x.beginPath(); x.moveTo(i * 30, 0); x.lineTo(i * 30 + 15, 0); x.lineTo(i * 30 + 15 - 300, 300); x.lineTo(i * 30 - 300, 300); x.fill(); } x.fillStyle = "#fbf7ef"; x.fillRect(18, 18, 364, 264); }
  x.fillStyle = "#1c1410"; x.font = "900 40px Inter"; x.textAlign = "left"; x.textBaseline = "top"; x.fillText(text, 36, 34);
  x.fillStyle = "#b9b0a3"; for (let i = 0; i < 3; i++) x.fillRect(36, 96 + i * 26, 240 - i * 40, 12);
  x.fillStyle = "#1c1410"; const r = mulberry32(3); let bx = 36; while (bx < 364) { const w = 2 + Math.floor(r() * 6); x.fillRect(bx, 190, w, 70); bx += w + 2 + Math.floor(r() * 5); }
  return texFrom(c);
}

// Cardboard shipping box (kraft texture, bevelled panels) with four top flaps that open outward and
// translucent packing tape. Origin: floor centre; front +z. API { group, open(k), w, h, d, top, floorY }
//   open(0) = closed and taped; open(1) = all four flaps folded out, nearly flat (the inside stays in view).
function makeParcel({ w = 1.2, h = 0.8, d = 0.9, label = "ENCOMENDA", airmail = false } = {}) {
  const g = new THREE.Group(), t = 0.03, kraft = cardboardTex();
  const card = mat("#ffffff", { map: tileTex(kraft, w, h), roughness: 0.88 }), flapM = mat("#ffffff", { map: tileTex(kraft, w, d), roughness: 0.88 });
  const inner = mat("#9a6c42", { map: tileTex(kraft, w, d), roughness: 0.95 });
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), inner); bottom.position.y = t / 2; g.add(bottom);
  for (const sz of [-1, 1]) { const wall = new THREE.Mesh(rbox(w, h - t, t, 0.008), card); wall.position.set(0, t + (h - t) / 2, sz * (d / 2 - t / 2)); g.add(wall); }
  for (const sx of [-1, 1]) { const wall = new THREE.Mesh(rbox(t, h - t, d - 2 * t, 0.008), card); wall.position.set(sx * (w / 2 - t / 2), t + (h - t) / 2, 0); g.add(wall); }
  const tape = mat("#d9b779", { roughness: 0.22, metalness: 0.05 });
  // minor flaps (left/right) hinge on the side walls' top edges; major flaps (front/back) sit on them
  const flaps = [];
  for (const sx of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(sx * w / 2, h, 0); g.add(pv);
    const f = new THREE.Mesh(rbox(w / 2 - 0.01, t, d - 0.02, 0.008), flapM); f.position.set(-sx * w / 4, t / 2, 0); pv.add(f);
    flaps.push({ pv, axis: "z", sign: sx > 0 ? -1 : 1, max: 2.75 });
  }
  for (const sz of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(0, h + t, sz * d / 2); g.add(pv);
    const f = new THREE.Mesh(rbox(w - 0.02, t, d / 2 - 0.01, 0.008), flapM); f.position.set(0, t / 2, -sz * d / 4); pv.add(f);
    const tp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, d / 2 - 0.01), tape); tp.position.set(0, t + 0.002, -sz * d / 4); pv.add(tp);
    flaps.push({ pv, axis: "x", sign: sz > 0 ? 1 : -1, max: 2.75 });
  }
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.004), tape); tab.position.set(0, h - 0.1, d / 2 + 0.002); g.add(tab);
  if (label) {
    const lw = Math.min(w * 0.46, 0.6), lh = lw * 0.75;
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: shippingLabelTex(label, airmail), roughness: 0.8 }));
    lb.position.set(w * 0.22, h * 0.42, d / 2 + 0.004); g.add(lb);
  }
  g.add(contactShadow(w + 0.6, d + 0.6));
  const open = (k) => { for (const f of flaps) f.pv.rotation[f.axis] = f.sign * f.max * clamp(k); tab.visible = k < 0.05; };
  open(0);
  return { group: g, open, w, h, d, top: h + 2 * t, floorY: t };
}

// Two-lane road along z (from -back to +front), lanes left (x < 0) and right (x > 0), each `lane`
// wide: textured asphalt, white edge lines, yellow dashed centre line, concrete kerbs; optional coloured
// band on each lane's outer edge. Origin: floor, at the centre line, z = 0. API { group, lane, laneX: [l, r], y }
function makeTwoLaneRoad({ lane = 1.6, back = 6, front = 2.6, tints = null } = {}) {
  const g = new THREE.Group(), len = back + front, zc = (front - back) / 2, y = 0.06, W = 2 * lane + 0.3;
  const asphalt = new THREE.Mesh(new THREE.BoxGeometry(W, y, len), mat("#ffffff", { map: tileTex(asphaltTex(), W / 2, len / 2), roughness: 0.95 })); asphalt.position.set(0, y / 2, zc); g.add(asphalt);
  const white = mat("#e9e4dc", { roughness: 0.55 }), yellow = mat("#f2c200", { roughness: 0.55 }), concrete = mat("#ffffff", { map: tileTex(plasterTex("#8f8a84"), 0.5, len / 2), roughness: 0.85 });
  for (const sx of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.006, len), white); edge.position.set(sx * (lane - 0.05), y + 0.003, zc); g.add(edge);
    const kerb = new THREE.Mesh(rbox(0.16, 0.12, len, 0.03), concrete); kerb.position.set(sx * (lane + 0.23), 0.06, zc); g.add(kerb);
    if (tints) { const band = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.007, len), mat(tints[sx < 0 ? 0 : 1], { roughness: 0.5 })); band.position.set(sx * (lane - 0.17), y + 0.0035, zc); g.add(band); }
  }
  for (let z = -back + 0.3; z < front - 0.2; z += 0.9) { const dash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.5), yellow); dash.position.set(0, y + 0.003, z + 0.25); g.add(dash); }
  return { group: g, lane, laneX: [-lane / 2, lane / 2], y };
}

// Two-line printed plate ("IMPOSTO\nNOVO"): bigger letters than one long line on the same board.
// Same contract as makePlate (userData.plate, frac = the smaller line's letter size / plate height).
function makePlate2(text, w, h, { bg = "#141414", fg = "#ffffff", depth = 0.03 } = {}) {
  const [l1, l2] = text.split("\n"), ph = 256, pw = Math.max(64, Math.round(ph * w / h));
  const c = makeCanvas(pw, ph), x = c.getContext("2d");
  x.fillStyle = bg; x.fillRect(0, 0, pw, ph);
  const fit = (s, cy) => { let px = Math.round(ph * 0.38); x.font = `900 ${px}px Inter`; while (x.measureText(s).width > pw * 0.86 && px > 8) { px -= 2; x.font = `900 ${px}px Inter`; } x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(s, pw / 2, cy + px * 0.05); return px; };
  const px = Math.min(fit(l1, ph * 0.29), fit(l2, ph * 0.71));
  const face = new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false }), side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [side, side, side, side, face, side]);
  m.userData.plate = { text: l1 + " " + l2, w, h, depth, frac: px / ph, detail: false }; return m;
}

// Red-and-white striped boom texture (blocks of 0.25 world units along the arm).
function boomTex(len) {
  const c = makeCanvas(256, 32), x = c.getContext("2d");
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#f4efe6" : "#d8251b"; x.fillRect(i * 32, 0, 32, 32); }
  const t = texFrom(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(len / 2, 1); return t;
}
// Toll gate: steel cabinet (panel seams, a small window, hazard band, a signal light on top) and a
// striped boom that lifts. The toll's name is printed on a board on its own post on the OUTER side of
// the cabinet, so the lifted boom never crosses it ("A\nB" prints two lines; board: false leaves it out).
// The boom extends toward +x (side = 1) or -x (side = -1).
// Origin: floor, cabinet centre; board faces +z; a coin slot on the front at y 0.6. API { group, cabinet, pivot, board, lamp, set(k), armLen }
//   set(0) = boom down across the lane (its centre at boomY); set(1) = boom up.
function makeTollGate({ arm = 1.9, side = 1, label = "PEDÁGIO", color = "#f5c400", fg = "#141414", boardW = 1.6, boardH = 0.56, boomY = 0.5, board: withBoard = true } = {}) {
  const g = new THREE.Group(), cw = 0.4, ch = 1.0, steel = mat("#c9c6c0", { metalness: 0.55, roughness: 0.4 });
  const cabinet = new THREE.Mesh(rbox(cw, ch, cw, 0.04), steel); cabinet.position.y = ch / 2; g.add(cabinet);
  const seam = mat("#6f6c68", { metalness: 0.4, roughness: 0.5 });
  for (const y of [0.42, 0.72]) { const s = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.004, 0.012, cw + 0.004), seam); s.position.y = y; g.add(s); }
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.01), mat("#2a3a44", { metalness: 0.6, roughness: 0.15 })); win.position.set(0, 0.86, cw / 2 + 0.004); g.add(win);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.01), mat("#141414", { roughness: 0.6 })); slot.position.set(0, 0.6, cw / 2 + 0.004); g.add(slot); // coin slot (y 0.6, front)
  const band = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.01, 0.2, cw + 0.01), new THREE.MeshStandardMaterial({ map: stripesTex(), roughness: 0.6 })); band.position.y = 0.14; g.add(band);
  const cap = new THREE.Mesh(rbox(cw + 0.08, 0.08, cw + 0.08, 0.03), mat("#3a3530", { metalness: 0.3, roughness: 0.5 })); cap.position.y = ch + 0.04; g.add(cap);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 12), mat("#ff3b1f", { emissive: "#ff3b1f", emissiveIntensity: 1.2, roughness: 0.3 })); lamp.position.y = ch + 0.13; g.add(lamp);
  const pivot = new THREE.Group(); pivot.position.set(side * (cw / 2 + 0.02), boomY, 0); g.add(pivot);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 20), mat("#3a3530", { metalness: 0.4 })); hub.rotation.x = Math.PI / 2; pivot.add(hub);
  const boom = new THREE.Mesh(rbox(arm, 0.1, 0.08, 0.03), new THREE.MeshStandardMaterial({ map: boomTex(arm), roughness: 0.35 })); boom.position.x = side * (arm / 2 + 0.04); pivot.add(boom);
  let board = null;
  if (withBoard) {
    const bx = -side * (cw / 2 + 0.12 + boardW / 2), by = 1.2 + boardH / 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 10), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.set(bx, 0.6, -0.04); g.add(post);
    board = (label.includes("\n") ? makePlate2 : makePlate)(label, boardW, boardH, { bg: color, fg, depth: 0.05 }); board.position.set(bx, by, 0); g.add(board);
  }
  g.add(contactShadow(1.2, 1.0));
  const set = (k) => { pivot.rotation.z = side * clamp(k) * Math.PI * 0.49; };
  set(0);
  return { group: g, cabinet, pivot, board, lamp, set, armLen: arm };
}
