// ============================================================================
// videos/2026-10-31-divida-publica-juros/scenes.js
// Dívida pública do Brasil: de onde vem, por que não diminui e de quem é a culpa.
// Analogia única (ponto difícil: por que a dívida cresce sozinha): o cartão. Deve mil, o juro é cem;
// sem os cem, eles viram dívida e o próximo juro vem sobre mil e cem. Contado com moedas empilhadas.
// Narration 0–92.8 s (audio/words.json), video 94.8 s. Sem rostos de presidentes (pedido do Samuel).
//
// Pattern for every scene:
//   anim(t) animates objects only (no camera); CAM.pose / CAM.move on an envelope() frames the subject
//   inside the centred safe zone ("stage" when the headline band has text, "stage-tall" when not).
//   Backdrops (vault room, skyline, office, kitchen, gallery) fill the frame; never framed/checked.
// Money is generic (no real banknote design, no logos). Every number on screen is in fatos.md.
// ============================================================================

const eIn = (x) => x * x * x;
const DP_PAPER = "#f2ece0";

// ---------------------------------------------------------------- materials
function dpBrushTex() { return cachedTex("dp-brush", () => noiseTex({ base: "#9a9a9a", amount: 0.16, size: 1, seed: 33 })); }
const dpSteel = (c = "#4a4f57") => pmat(c, { metalness: 0.75, roughness: 0.42, roughnessMap: dpBrushTex(), clearcoat: 0.25, clearcoatRoughness: 0.3 });
const dpChrome = () => pmat("#d6d9de", { metalness: 1, roughness: 0.18 });
const dpGold = () => pmat(GOLD_METAL, { metalness: 1, roughness: 0.3, roughnessMap: dpBrushTex() });

// ---------------------------------------------------------------- cash: bundles stacked into pallets
// Side of a pallet of cash: rows of bundles seen edge-on (note edges + paper band), one tile = 4 x 12 bundles.
function dpCashSideTex() {
  return cachedTex("dp-cash-side", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(77), rows = 12, cols = 4, bh = 512 / rows, bw = 512 / cols;
    x.fillStyle = "#1c2629"; x.fillRect(0, 0, 512, 512);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x0 = i * bw + 2, y0 = j * bh + 2, w = bw - 4, h = bh - 4;
      for (let y = y0; y < y0 + h; y += 2) { const v = r(); x.fillStyle = v < 0.45 ? "#7fa3ae" : v < 0.85 ? "#a9c4c6" : "#e4ece6"; x.fillRect(x0, y, w, 2); }
      x.fillStyle = "rgba(20,40,50,0.18)"; x.fillRect(x0, y0 + h - 3, w, 3);
      const bx = x0 + w * 0.42; x.fillStyle = "#c99a4a"; x.fillRect(bx, y0 - 1, w * 0.16, h + 2); x.fillStyle = "rgba(90,60,20,0.35)"; x.fillRect(bx, y0 - 1, 2, h + 2); x.fillRect(bx + w * 0.16 - 2, y0 - 1, 2, h + 2);
    }
    speckle(x, 512, 512, 78, 2500, 0.08, 0.04, 1.2);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Top of a pallet of cash: the faces of the top bundles, each with its paper band. One tile = 4 x 4 bundles.
function dpCashTopTex() {
  return cachedTex("dp-cash-top", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), cw = 128, ch = 128;
    x.fillStyle = "#1c2629"; x.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      x.drawImage(NOTE100.image, i * cw + 3, j * ch + 3, cw - 6, ch - 6);
      x.fillStyle = "#c99a4a"; x.fillRect(i * cw + cw * 0.42, j * ch + 3, cw * 0.16, ch - 6);
    }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Wooden pallet (deck slats on three runners). Origin floor centre. Height 0.12.
function makeDpPallet(w, d) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#9a7448"), roughness: 0.7 });
  for (const z of [-d / 2 + 0.06, 0, d / 2 - 0.06]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.1), wood); r.position.set(0, 0.04, z); g.add(r); }
  const n = Math.max(3, Math.round(w / 0.16));
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(w / n - 0.025, 0.035, d), wood); s.position.set(-w / 2 + (i + 0.5) * (w / n), 0.1, 0); g.add(s); }
  return g;
}
// A block of cash on a pallet: w x h x d of bundles. Origin floor centre. API { group, h, body }
function makeDpCashCube(w, h, d, { pallet = true } = {}) {
  const g = new THREE.Group(), side = dpCashSideTex(), top = dpCashTopTex();
  const mx = pmat("#ffffff", { map: tileTex(side, d / 0.68, h / 0.42), roughness: 0.8 });
  const mz = pmat("#ffffff", { map: tileTex(side, w / 0.68, h / 0.42), roughness: 0.8 });
  const mt = pmat("#ffffff", { map: tileTex(top, w / 0.68, d / 0.62), roughness: 0.7 });
  const ph = pallet ? 0.12 : 0;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mx, mx, mt, mt, mz, mz]); body.position.y = ph + h / 2; g.add(body);
  if (pallet) g.add(makeDpPallet(w * 1.02, d * 1.02));
  g.add(contactShadow(w * 1.5, d * 1.5));
  return { group: g, h: ph + h, body };
}
// Polished black plinth with a printed name on the front. Origin floor centre. API { group, top, plate }
function makeDpPlinth(label, { w = 1.2, h = 0.4, d = 0.9, fg = "#f4f1ea", bg = "#141414", plateH = null } = {}) {
  const g = new THREE.Group(), tex = tileTex(noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 }), 2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#1b1a1d", { map: tex, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2; g.add(m);
  let plate = null;
  if (label) { const ph = plateH || h * 0.62; plate = makePlate(label, w * 0.94, ph, { bg, fg }); plate.position.set(0, h / 2, d / 2 + 0.016); g.add(plate); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h, plate };
}

// ---------------------------------------------------------------- the vault and its mechanical counter
// Mechanical odometer: digit drums behind a glass window, "R$" and the thousands dots printed.
// Origin: bottom centre of the housing, face +z. set(v) shows the value v (fractions roll the drums).
function dpDigitStripTex() {
  return cachedTex("dp-digits", () => {
    const c = makeCanvas(128, 128 * 11), x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, "#0c0c0e"); g.addColorStop(0.5, "#1b1b1f"); g.addColorStop(1, "#0c0c0e");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128 * 11);
    x.fillStyle = "#f4f1ea"; x.font = "900 104px Inter"; x.textAlign = "center"; x.textBaseline = "middle";
    for (let k = 0; k < 11; k++) { x.fillText(String(k % 10), 64, k * 128 + 70); x.fillStyle = "rgba(0,0,0,0.5)"; x.fillRect(0, k * 128, 128, 3); x.fillStyle = "#f4f1ea"; }
    return texFrom(c);
  });
}
function dpDrumShadeTex() {
  return cachedTex("dp-drum-shade", () => {
    const c = makeCanvas(8, 128), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(0,0,0,0.92)"); g.addColorStop(0.28, "rgba(0,0,0,0)"); g.addColorStop(0.72, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.92)");
    x.fillStyle = g; x.fillRect(0, 0, 8, 128); return texFrom(c);
  });
}
function makeDpCounter({ digits = 7, dw = 0.17, dh = 0.25 } = {}) {
  const g = new THREE.Group(), seps = Math.floor((digits - 1) / 3), sepW = 0.07, rsW = 0.36;
  const winW = digits * dw + seps * sepW, W = winW + rsW + 0.24, H = dh + 0.2, D = 0.32;
  const body = new THREE.Mesh(rbox(W, H, D, 0.05), dpSteel("#2f3338")); body.position.y = H / 2; g.add(body);
  const bezel = new THREE.Mesh(rbox(winW + 0.06, dh + 0.06, 0.04, 0.015), dpChrome()); bezel.position.set(rsW / 2, H / 2, D / 2); g.add(bezel);
  const well = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.02, dh + 0.02, 0.02), mat("#050506")); well.position.set(rsW / 2, H / 2, D / 2 + 0.012); g.add(well);
  const rs = makePlate("R$", rsW - 0.04, dh, { bg: "#2f3338", fg: ORANGE, detail: true }); rs.position.set(-W / 2 + 0.12 + (rsW - 0.04) / 2, H / 2, D / 2 + 0.016); g.add(rs);
  const strip = dpDigitStripTex(), drums = [];
  let x0 = rsW / 2 - winW / 2;
  for (let i = 0; i < digits; i++) {
    const place = digits - 1 - i; // 10^place
    const tex = strip.clone(); tex.needsUpdate = true; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1 / 11);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(dw * 0.92, dh), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); m.position.set(x0 + dw / 2, H / 2, D / 2 + 0.024); g.add(m);
    const shade = new THREE.Mesh(new THREE.PlaneGeometry(dw * 0.92, dh), new THREE.MeshBasicMaterial({ map: dpDrumShadeTex(), transparent: true, depthWrite: false })); shade.position.set(x0 + dw / 2, H / 2, D / 2 + 0.026); g.add(shade);
    drums.push({ tex, place }); x0 += dw;
    if (place > 0 && place % 3 === 0) { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), mat(ORANGE, { emissive: "#7a2a08" })); dot.position.set(x0 + sepW / 2, H / 2 - dh * 0.38, D / 2 + 0.03); g.add(dot); x0 += sepW; }
  }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW + 0.02, dh + 0.02), glassMat({ opacity: 0.16 })); glass.position.set(rsW / 2, H / 2, D / 2 + 0.03); glass.userData.noShadow = true; g.add(glass);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 12), dpChrome()); b.rotation.x = Math.PI / 2; b.position.set(sx * (W / 2 - 0.06), H / 2 + sy * (H / 2 - 0.06), D / 2 + 0.005); g.add(b); }
  const set = (v) => {
    for (const d of drums) {
      const p = Math.pow(10, d.place), base = Math.floor(v / p) % 10, low = v % p;
      const pos = d.place === 0 ? v % 10 : base + clamp(low - (p - 1));
      d.tex.offset.y = 1 - (pos + 1) / 11;
    }
  };
  set(0);
  return { group: g, set, w: W, h: H, d: D };
}
// Bank vault: thick steel box with an open round-wheel door, shelves of cash inside, the counter on top.
// Origin floor centre, opening at +z. API { group, door, wheel, counter, top }
function makeDpVault({ w = 1.8, h = 2.0, d = 1.3, t = 0.14 } = {}) {
  const g = new THREE.Group(), steel = dpSteel(), dark = pmat("#1d2024", { metalness: 0.5, roughness: 0.55 });
  for (const [bw, bh, bd, x, y, z] of [[w, h, t, 0, h / 2, -d / 2 + t / 2], [t, h, d, -w / 2 + t / 2, h / 2, 0], [t, h, d, w / 2 - t / 2, h / 2, 0], [w, t, d, 0, h - t / 2, 0], [w, t, d, 0, t / 2, 0]]) {
    const p = new THREE.Mesh(rbox(bw, bh, bd, 0.03), steel); p.position.set(x, y, z); g.add(p);
  }
  const lining = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * t, h - 2 * t, 0.01), dark); lining.position.set(0, h / 2, -d / 2 + t + 0.006); g.add(lining);
  const lamp = new THREE.PointLight("#ffcf8a", 1.4, 3, 1.5); lamp.position.set(0, h - t - 0.15, 0.1); g.add(lamp);
  // two shelves full of bundles
  const iw = w - 2 * t, bundle = { w: 0.34, d: 0.16, h: 0.07 };
  for (const sy of [0.62, 1.22]) {
    const sh = new THREE.Mesh(new THREE.BoxGeometry(iw, 0.03, d - t - 0.08), dark); sh.position.set(0, sy, 0.0); g.add(sh);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) { const b = makeCashBundle(bundle); b.position.set(-iw / 2 + 0.2 + i * 0.39, sy + 0.015 + k * bundle.h, 0.1); b.rotation.y = (i % 2 ? 0.04 : -0.03); g.add(b); }
  }
  for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) { const b = makeCashBundle(bundle); b.position.set(-iw / 2 + 0.2 + i * 0.39, t + k * bundle.h, 0.15); g.add(b); }
  // door hinged on the right edge, swung open towards the camera
  const hinge = new THREE.Group(); hinge.position.set(w / 2, h / 2, d / 2); g.add(hinge);
  const door = new THREE.Mesh(rbox(w, h, 0.2, 0.04), steel); door.position.set(-w / 2, 0, 0.1); hinge.add(door);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 12, 48), dpChrome()); ring.position.set(-w / 2, 0.05, 0.21); hinge.add(ring);
  const wheel = new THREE.Group(); wheel.position.set(-w / 2, 0.05, 0.25); hinge.add(wheel);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 24), dpChrome()); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI * 2 / 3, sp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 12), dpChrome()); sp.rotation.z = a; wheel.add(sp);
    for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), dpChrome()); k.position.set(-Math.sin(a) * 0.3 * s, Math.cos(a) * 0.3 * s, 0); wheel.add(k); }
  }
  for (const y of [-0.62, -0.2, 0.2, 0.62]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16), dpChrome()); b.rotation.z = Math.PI / 2; b.position.set(-w - 0.05, y, 0.1); hinge.add(b); }
  for (const y of [-0.7, 0.7]) { const hg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16), steel); hg.position.set(0.02, y, 0.04); hinge.add(hg); }
  const counter = makeDpCounter(); counter.group.scale.setScalar(1.25); counter.group.position.set(0, h, 0.12); g.add(counter.group);
  g.add(contactShadow(w * 1.8, d * 2));
  return { group: g, door: hinge, wheel, counter, top: h + counter.h };
}
// Wall of safe-deposit boxes (backdrop): brushed steel doors, keyholes, number tags.
function dpDepositWallTex() {
  return cachedTex("dp-deposit", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(5);
    x.fillStyle = "#15171a"; x.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x0 = i * 128 + 4, y0 = j * 128 + 4, v = 70 + r() * 25; x.fillStyle = `rgb(${v},${v + 4},${v + 10})`; x.fillRect(x0, y0, 120, 120);
      x.fillStyle = "rgba(255,255,255,0.08)"; x.fillRect(x0, y0, 120, 4);
      x.fillStyle = "#1a1a1a"; x.beginPath(); x.arc(x0 + 96, y0 + 60, 7, 0, 7); x.fill(); x.fillRect(x0 + 94, y0 + 60, 4, 12);
      x.fillStyle = "#c9a24e"; x.fillRect(x0 + 18, y0 + 52, 34, 16);
    }
    speckle(x, 512, 512, 6, 3000, 0.1, 0.05, 1.5);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function makeDpVaultRoom({ z = -3.2 } = {}) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), pmat("#ffffff", { map: tileTex(dpDepositWallTex(), 26 / 1.6, 10 / 1.6), metalness: 0.6, roughness: 0.4 })); wall.position.set(0, 5, z); g.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), pmat("#ffffff", { map: tileTex(noiseTex({ base: "#3b3936", amount: 0.12, size: 2, seed: 8 }), 8, 5), roughness: 0.25, clearcoat: 0.6, envMapIntensity: 0.6 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, z + 7); g.add(fl);
  const spots = [];
  for (const x of [-4.5, -1.5, 1.5, 4.5]) {
    const s = makeLightShaft([x, 7.5, z + 0.6], [x * 1.05, 0.05, z + 3.6], { w0: 0.4, w1: 2.2, color: "#ffc98a", opacity: 0.12 }); g.add(s.group); spots.push(s);
    const p = makeFloorGlow(2.4, 2.0, { color: "#ffcf9a", opacity: 0.14 }); p.position.set(x * 1.05, 0.01, z + 3.4); g.add(p);
  }
  const motes = makeSetMotes(140, [[-6, 0.3, z + 0.4], [6, 6, z + 4]], { seed: 12 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t, k = 1) { motes.update(t); spots.forEach((s, i) => s.set(k * (0.85 + 0.15 * Math.sin(t * 0.8 + i)))); } };
}

// ---------------------------------------------------------------- shared pieces for later scenes
// Gold coin lying flat with a raised rim and a reeded edge. Origin bottom centre. thickness t.
function makeDpCoin(r = 0.2, t = 0.05) {
  const g = new THREE.Group(), m = dpGold();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 64), m); body.position.y = t / 2; g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.9, t * 0.12, 8, 48), m); rim.rotation.x = Math.PI / 2; rim.position.y = t; g.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.62, 48), pmat("#b48a3c", { metalness: 1, roughness: 0.45 })); face.rotation.x = -Math.PI / 2; face.position.y = t + 0.001; g.add(face);
  return g;
}
// Stack of paper titles ("títulos do Tesouro"): n sheets, slightly uneven, a paper band every 10.
// Origin floor centre. API { group, set(k), height(k) }
function makeDpTitleStack(n, { w = 0.62, d = 0.46, t = 0.012, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(w, t * 0.9, d), pmat("#ffffff", { roughness: 0.92 }), n), o = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    o.position.set((r() - 0.5) * 0.025, i * t + t / 2, (r() - 0.5) * 0.025); o.rotation.y = (r() - 0.5) * 0.07; o.updateMatrix(); mesh.setMatrixAt(i, o.matrix);
    mesh.setColorAt(i, i % 10 === 9 ? col.set("#3b5f8a") : col.set(DP_PAPER).offsetHSL(0, 0, (r() - 0.5) * 0.08));
  }
  g.add(mesh); g.add(contactShadow(w * 1.6, d * 1.6));
  const set = (k) => { mesh.count = Math.max(1, Math.round(clamp(k) * n)); mesh.visible = k > 0.001; mesh.boundingBox = null; mesh.boundingSphere = null; };
  return { group: g, set, height: (k) => Math.round(clamp(k) * n) * t };
}
// Glossy bar of a chart (green, red or orange lacquer). Origin floor centre; set(h) sets its height.
function makeDpBar(color, { w = 0.38, d = 0.38 } = {}) {
  const m = new THREE.Mesh(rbox(w, 1, d, 0.03), pmat(color, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const g = new THREE.Group(); g.add(m);
  return { group: g, mesh: m, set(h) { const hh = Math.max(0.001, h); m.scale.y = hh; m.position.y = hh / 2; m.visible = h > 0.002; } };
}
// Red 3D arrow pointing down (extruded, bevelled). Origin: the tip.
function makeDpArrow(len = 1.1, { color = RED } = {}) {
  const s = new THREE.Shape(), hw = 0.32, sw = 0.13, hl = 0.42;
  s.moveTo(0, 0); s.lineTo(hw, hl); s.lineTo(sw, hl); s.lineTo(sw, len); s.lineTo(-sw, len); s.lineTo(-sw, hl); s.lineTo(-hw, hl); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 3 }); geo.translate(0, 0, -0.07);
  const m = new THREE.Mesh(geo, pmat(color, { roughness: 0.3, clearcoat: 0.8, emissive: "#3a0603" }));
  const g = new THREE.Group(); g.add(m); return g;
}
// Dark wooden table top (home/office). Origin: floor; top at y = top.
function makeDpTable(S, { w = 3.2, d = 2.0, top = 0.75, wood = "#3a2416" } = {}) {
  const mt = pmat("#ffffff", { map: woodTex({ base: wood, seed: 31 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; S.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); S.add(l); }
  return m;
}
// Night skyline + bokeh, with a dimmer for the lit windows (k = 1 lit, 0 dark).
function makeDpCity(seed = 23) {
  const sky = makeSkyline({ z: -16, seed, hMin: 5, hMax: 15, spread: 40 });
  const dim = (k) => sky.group.traverse((n) => { if (n.isMesh && Array.isArray(n.material) && n.material[4]) n.material[4].color.setScalar(0.18 + 0.82 * k); });
  return { group: sky.group, update: sky.update, dim };
}

// ============================================================ 1 · gancho: o contador dos juros (0–4.65)
// "Enquanto você assiste isso, o Brasil gasta três milhões em juros."
const T1 = 4.65, T2 = 7.95;
addScene("gancho", 0, T1, (S) => {
  const room = makeDpVaultRoom(); S.backdrop(room.group);
  const v = makeDpVault(); S.add(v.group);
  // bundles thrown out of the vault onto a pile in front of it (the money that goes)
  const r = mulberry32(4), flights = [], N = 20, slots = [], pile = new THREE.Group(); S.add(pile);
  for (let L = 0, c = 0; c < N; L++) for (let i = 0; i < 6 - L && c < N; i++, c++) slots.push(new V3(-1.55 + (i % 3) * 0.38 + (L % 2) * 0.12, L * 0.08, 0.9 + Math.floor(i / 3) * 0.2));
  for (let i = 0; i < N; i++) {
    const b = makeCashBundle({ w: 0.34, d: 0.16, h: 0.07 }); pile.add(b);
    flights.push({ b, at: 0.35 + i * 0.16, from: new V3(-0.25 + r() * 0.45, 0.75 + r() * 0.5, 0.82), to: slots[i], ry: (r() - 0.5) * 0.8, spin: (r() - 0.5) * 6 });
  }
  const anim = (t) => {
    room.update(t, 1 + 0.6 * beat(t, 3.6, 0.8));
    v.door.rotation.y = 1.95; v.wheel.rotation.z = t * 0.6;
    v.counter.set(3000000 * eOut(lin(t, 0.15, 4.1)));
    for (const f of flights) {
      const k = lin(t, f.at, f.at + 0.55); f.b.visible = t >= f.at;
      const p = f.from.clone().lerp(f.to, eOut(k)); p.y += Math.sin(Math.PI * k) * 0.7;
      f.b.position.copy(p); f.b.rotation.set(0, f.ry + f.spin * (1 - eOut(k)), (1 - k) * 0.6);
    }
  };
  S.hero(v.group, "cofre com contador", { when: (t) => t < 0.8 });
  S.hero(v.counter.group, "contador", { when: (t) => t > 3.5 });
  const wide = envelope([v.group, pile], anim, 0, T1), close = envelope([v.counter.group], anim, 0, 0.1);
  return (t) => {
    anim(t);
    const A = CAM.pose(wide, { zone: "stage", from: [-0.22, 0.32, 1], pull: 1.0 }), B = CAM.pose(close, { zone: "stage", from: [-0.08, 0.2, 1], pull: 1.1 });
    CAM.apply(CAM.blend(A, B, sm(t, 0.5, 3.5)));
  };
});

// ============================================================ 2 · um trilhão por ano (4.65–7.95)
// "São um trilhão e duzentos bilhões por ano." The counter spins out; pallets of cash pile up behind.
addScene("ano", T1, T2, (S) => {
  const room = makeDpVaultRoom({ z: -6.5 }); S.backdrop(room.group);
  const v = makeDpVault(); S.add(v.group); v.door.rotation.y = 1.95;
  const cubes = [], r = mulberry32(9);
  const rows = [[6, 0], [5, 1], [4, 2], [3, 3], [2, 4], [1, 5]];
  for (const [n, L] of rows) for (let i = 0; i < n; i++) for (const zz of (L < 3 ? [-3.6, -2.4] : [-3.0])) {
    const c = makeDpCashCube(1.3, 0.48, 1.1); S.add(c.group);
    cubes.push({ c, x: (i - (n - 1) / 2) * 1.34, y: L * 0.6, z: zz, at: T1 + 0.15 + L * 0.3 + r() * 0.35 + (i / n) * 0.3 });
  }
  const anim = (t) => {
    room.update(t, 1);
    v.counter.set(3000000 + 38210 * (t - T1) * 1.5);
    for (const q of cubes) { const k = eIn(lin(t, q.at, q.at + 0.28)); q.c.group.visible = t > q.at; q.c.group.position.set(q.x, q.y + (1 - k) * 1.1, q.z); }
  };
  S.hero(v.group, "cofre", { when: (t) => t > T1 + 2.3 });
  S.hero(v.counter.group, "contador", { when: (t) => t < T1 + 0.5 });
  const pile = new THREE.Group(); cubes.forEach((q) => pile.add(q.c.group)); S.add(pile);
  S.hero(pile, "montanha de dinheiro", { when: (t) => t > T1 + 2.3 });
  const near = envelope([v.counter.group], anim, T1, T1 + 0.1), far = envelope([v.group, pile], anim, T2 - 0.2, T2);
  return (t) => {
    anim(t);
    const A = CAM.pose(near, { zone: "stage", from: [-0.12, 0.25, 1], pull: 1.15 }), B = CAM.pose(far, { zone: "stage", from: [-0.2, 0.5, 1], pull: 1.03 });
    CAM.apply(CAM.blend(A, B, sm(t, T1 + 0.15, T1 + 2.4)));
  };
});

// ============================================================ 3 · a dívida de onze trilhões (7.95–12.35)
// "Juros de uma dívida de onze trilhões. Mas de onde ela veio?" A tower of cash rises against the city.
const T3 = 12.35;
addScene("divida", T2, T3, (S) => {
  const city = makeDpCity(23); S.backdrop(city.group);
  const base = makeDpPlinth("DÍVIDA", { w: 2.4, h: 0.72, d: 1.8 }); S.add(base.group);
  const levels = [], LV = 9;
  for (let i = 0; i < LV; i++) { const c = makeDpCashCube(1.6, 0.52, 1.3); S.add(c.group); levels.push(c); }
  const lh = levels[0].h;
  const anim = (t) => {
    city.update(t); city.dim(1 - 0.35 * beat(t, 10.0, 1.0));
    levels.forEach((c, i) => { const at = T2 + 0.1 + i * 0.26, k = eIn(lin(t, at, at + 0.22)); c.group.visible = t > at; c.group.position.set(0, base.top + i * lh + (1 - k) * 0.55, 0); c.group.rotation.y = (i % 2 ? 0.03 : -0.02); });
  };
  const tower = new THREE.Group(); levels.forEach((c) => tower.add(c.group)); S.add(tower);
  S.hero(tower, "torre de dinheiro", { when: (t) => t > T2 + 2.5 }); S.hero(base.group, "base", { when: (t) => t > T2 + 2.5 });
  const box = envelope([tower, base.group], anim, T3 - 0.1, T3);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, T2, T3), { zone: "stage", from: [0.2, 0.22, 1], rise: 0.22, pull: 1.02 })); };
});

// ============================================================ 4 · o caixa do governo (12.35–21.5)
// "O governo arrecada impostos e gasta: aposentadoria, saúde, escola, salário. Quando gasta mais do que
// arrecada, pega emprestado." A glass cash box: coins in from IMPOSTOS, out through four glass pipes;
// it runs dry, a red beacon turns, and a second funnel (EMPRÉSTIMO) pours in.
const T4 = 21.5;
function makeDpFunnel(label, { color = "#3c4148", plateBg = GREEN, arm = "back", drop = 2.41 } = {}) {
  const g = new THREE.Group(), steel = dpSteel(color);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.55, 40, 1, true), Object.assign(steel.clone(), { side: THREE.DoubleSide })); cone.position.y = 0.275; g.add(cone);
  const lipR = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 10, 48), dpChrome()); lipR.rotation.x = Math.PI / 2; lipR.position.y = 0.55; g.add(lipR);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 24, 1, true), Object.assign(steel.clone(), { side: THREE.DoubleSide })); spout.position.y = -0.11; g.add(spout);
  const plate = makePlate(label, 0.84, 0.2, { bg: plateBg, fg: "#ffffff" }); plate.position.set(0, 0.3, 0.36); plate.rotation.x = -0.4; g.add(plate);
  // what holds it (context, never framed): an arm from the rim back to a post on the floor behind the box,
  // or (arm: "right") a boom coming in from the right, like a crane
  const pipe = (len, axis) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 16), steel); if (axis === "z") m.rotation.x = Math.PI / 2; if (axis === "x") m.rotation.z = Math.PI / 2; m.userData.decor = true; g.add(m); return m; };
  const clamp1 = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 10, 48), dpChrome()); clamp1.rotation.x = Math.PI / 2; clamp1.position.y = 0.5; clamp1.userData.decor = true; g.add(clamp1);
  if (arm === "back") { pipe(1.25, "z").position.set(0, 0.5, -0.43 - 0.62); pipe(drop + 0.5, "y").position.set(0, 0.5 - (drop + 0.5) / 2, -1.68); }
  else { pipe(2.6, "x").position.set(0.43 + 1.3, 0.5, 0); }
  return g; // origin: the spout's top
}
addScene("caixa", T3, T4, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -4.5, wall: "#4f3b2f", seed: 6 }); S.backdrop(office.group);
  const jar = makeCoinJar({ r: 0.26, h: 0.62, label: "GOVERNO", n: 520, seed: 5 }); jar.group.scale.setScalar(3); S.add(jar.group);
  jar.lid.visible = false; jar.label.userData.plate.detail = true;
  const J = { r: 0.78, h: 1.86, coinY: (k) => 3 * (0.016 + k * (jar.fullY - 0.016)) };
  const tax = makeDpFunnel("IMPOSTOS"); tax.position.set(0, J.h + 0.55, 0); S.add(tax);
  const loan = makeDpFunnel("EMPRÉSTIMO", { plateBg: RED, arm: "right" }); S.add(loan);
  // falling coins (inflow from each funnel): instanced, phase loops, pure function of t
  const NF = 18, coinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.022, 24), cmat = goldMat();
  const falls = [0, 1].map(() => { const m = new THREE.InstancedMesh(coinGeo, cmat, NF); m.frustumCulled = false; S.add(m); return m; });
  // four glass pipes fanning out at the foot of the box, coins sliding out to the four spends
  const spends = ["APOSENTADORIA", "SAÚDE", "ESCOLA", "SALÁRIO"], angs = [-1.9, -1.25, 1.25, 1.9], words = [15.38, 16.3, 17.12, 17.92];
  const pipes = [], o = new THREE.Object3D(), L = 0.85;
  const outCoins = new THREE.InstancedMesh(coinGeo, cmat, 4 * 6); outCoins.frustumCulled = false; S.add(outCoins);
  spends.forEach((name, i) => {
    const a = angs[i], dir = new V3(Math.sin(a), 0, Math.cos(a));
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, L, 32, 1, true), glassMat({ opacity: 0.28 })); tube.renderOrder = 11; tube.userData.noShadow = true;
    tube.position.copy(dir.clone().multiplyScalar(J.r + L / 2 - 0.1)).setY(0.18); tube.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir); S.add(tube);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 32), dpChrome()); ring.position.copy(dir.clone().multiplyScalar(J.r + L - 0.1)).setY(0.18); ring.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir); S.add(ring);
    const end = makeDpPlinth(null, { w: 1.05, h: 0.26, d: 0.5 }); end.group.position.copy(dir.clone().multiplyScalar(J.r + L + 0.15)); end.group.rotation.y = a - Math.sign(a) * Math.PI / 2 + Math.sign(a) * 0.0; S.add(end.group);
    const pl = makePlate(name, 1.02, 0.22, { bg: "#141414", fg: "#f4f1ea", detail: true }); pl.position.set(0, 0.13, 0.26); end.group.add(pl);
    const heap = makeDpCoin(0.14, 0.03); heap.position.set(0, 0.26, -0.05); end.group.add(heap);
    pipes.push({ dir, end, at: words[i] });
  });
  // alarm: a red light ring round the foot of the box that flashes when it runs dry
  const bulbMat = pmat("#5a0c08", { emissive: "#ff1a0a", emissiveIntensity: 0, roughness: 0.2 });
  const bulb = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.035, 12, 72), bulbMat); bulb.rotation.x = Math.PI / 2; bulb.position.y = 0.06; S.add(bulb);
  // money level in the box: full, drained by the spends, a little refill by the loan
  const level = (t) => 0.88 - 0.28 * sm(t, 15.3, 16.6) - 0.24 * sm(t, 16.4, 18.0) - 0.26 * sm(t, 17.9, 19.6) + 0.22 * sm(t, 20.75, 21.45);
  const anim = (t) => {
    office.update(t); key.intensity = 2.0;
    const alarm = t > 19.6 && t < 21.0 ? 0.5 + 0.5 * Math.sin((t - 19.6) * 14) : 0;
    fill.color.set(RED); fill.position.set(0, 0.6, 1.4); fill.intensity = 3.5 * alarm; bulbMat.emissiveIntensity = 3 * alarm;
    office.lights(1 - 0.35 * sm(t, 19.4, 19.9) + 0.35 * sm(t, 20.9, 21.3));
    const k = level(t); jar.fill(k);
    const lvY = J.coinY(k);
    // loan funnel swings in from the right at "pega emprestado"
    const lk = eOut(lin(t, 20.45, 20.95)); loan.visible = t > 20.4; loan.position.set(0.43 + 1.6 * (1 - lk), J.h + 0.55 + 0.4 * (1 - lk), 0); loan.rotation.z = 0.35 * (1 - lk);
    tax.position.x = -0.43 * eOut(lin(t, 20.3, 20.8));
    [[tax, 1 - 0.85 * sm(t, 18.6, 19.4), 0], [loan, t > 20.85 ? 1 : 0, 1]].forEach(([fn, rate, idx]) => {
      const m = falls[idx], top = fn.position.y - 0.25;
      for (let i = 0; i < NF; i++) {
        const ph = ((t * 1.6 + i / NF) % 1), on = i / NF < rate && fn.visible;
        o.position.set(fn.position.x + Math.sin(i * 2.3) * 0.03, on ? lerp(top, lvY + 0.05, ph * ph) : -50, fn.position.z + Math.cos(i * 1.7) * 0.03);
        o.rotation.set(ph * 8 + i, i, ph * 5); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    });
    pipes.forEach((p, i) => {
      const on = t > p.at - 0.6; p.end.group.scale.setScalar(Math.max(0.0001, pop(t, p.at - 0.25, 0.4)));
      for (let j = 0; j < 6; j++) {
        const ph = (t * 0.9 + j / 6) % 1, d = J.r - 0.05 + ph * L;
        o.position.copy(p.dir.clone().multiplyScalar(d)).setY(on && k > 0.08 ? 0.18 : -50);
        o.rotation.set(Math.PI / 2, 0, ph * 9); o.quaternion.setFromUnitVectors(new V3(0, 1, 0), new V3(-p.dir.z, 0, p.dir.x)); o.updateMatrix(); outCoins.setMatrixAt(i * 6 + j, o.matrix);
      }
    });
    outCoins.instanceMatrix.needsUpdate = true;
  };
  const rig = new THREE.Group(); S.add(rig);
  // three framings: the box and its funnel (IMPOSTOS), the four spends, the box running dry and the loan
  const near = (t) => t < 15.0 || t > 19.7;
  S.hero(jar.group, "caixa do governo", { when: near }); S.hero(tax, "funil impostos", { when: near });
  pipes.forEach((p, i) => S.hero(p.end.group, "gasto " + (i + 1), { when: (t) => t > p.at + 0.2 && t > 17.35 && t < 18.3 }));
  S.hero(loan, "funil empréstimo", { when: (t) => t > 21.0 });
  const bA = envelope([jar.group, tax], anim, T3, 14.9), bB = envelope([jar.group, ...pipes.map((p) => p.end.group)], anim, 18.3, 18.4), bC = envelope([jar.group, tax, loan], anim, 21.0, T4);
  return (t) => {
    anim(t);
    const A = CAM.move(bA, "truck", lin(t, T3, 15.6), { zone: "stage", from: [0.05, 0.3, 1], side: 0.22, pull: 1.02 });
    const B = CAM.move(bB, "crane", lin(t, 15.6, 18.6), { zone: "stage", from: [0, 0.55, 1], rise: 0.12, pull: 1.01 });
    const C = CAM.move(bC, "push", lin(t, 18.9, T4), { zone: "stage", from: [-0.1, 0.25, 1], pull0: 1.15, pull: 1.02 });
    CAM.apply(CAM.track(t, [[T3, A], [16.2, B, 0.9], [19.7, C, 0.9]]));
  };
});

// ============================================================ 5a · o título do Tesouro (21.5–27.1)
// "Imagina: você compra um título do Tesouro. Está emprestando pro governo, que devolve com juros."
const T5 = 27.1;
addScene("titulo", T4, T5, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -3.2, wall: "#5d4637", seed: 9 }); S.backdrop(office.group);
  const TOP = 0.75; makeDpTable(S, { w: 3.0, d: 1.9, top: TOP });
  const cert = makeCertificate("TÍTULO DO TESOURO", { w: 1.3, d: 1.6 }); S.add(cert.group);
  const ink = makeInkMark("DEVOLVE\nCOM JUROS", 0.68, 0.34, { ink: "#1f6b3a" }); ink.rotation.x = -Math.PI / 2; ink.position.set(-0.14, cert.top + 0.003, 0.02); cert.group.add(ink);
  const cash = new THREE.Group(); S.add(cash);
  for (let i = 0; i < 6; i++) { const b = makeCashBundle({ w: 0.34, d: 0.16, h: 0.07 }); b.position.set((i % 2) * 0.02, i * 0.07, (i % 3) * 0.01); b.rotation.y = (i % 2 ? 0.05 : -0.04); cash.add(b); }
  const sign = makePlaceCard("TESOURO NACIONAL", { w: 0.9, h: 0.24 }).group; sign.position.set(0.82, TOP, -1.02); S.add(sign);
  const anim = (t) => {
    office.update(t);
    const kc = eOut(lin(t, 21.7, 22.8)); cert.group.position.set(-0.32, TOP + 0.002, lerp(-0.4, 0.12, kc)); cert.group.rotation.y = 0.05 * (1 - kc);
    const km = eOut(lin(t, 24.4, 25.6)); cash.position.set(lerp(0.66, 0.62, km), TOP, lerp(0.35, -0.5, km));
    ink.visible = t > 26.15; const s = t > 26.15 ? 1 + 0.25 * (1 - sm(t, 26.15, 26.35)) : 1; ink.scale.setScalar(s);
  };
  S.hero(cert.group, "título do tesouro"); S.hero(cash, "dinheiro");
  const box = envelope([cert.group, cash], anim, T4, T5);
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.move(box, "drop", lin(t, T4, T5), { zone: "stage", from: [0.05, 1.7, 1], rise: 0.4, pull: 1.01 }), t, 26.15, 0.4, 0.3)); };
});

// ============================================================ 5b · quem empresta (27.1–31.65)
// "Bancos, fundos e estrangeiros fazem o mesmo, aos trilhões." Stacks of titles, height = share of the
// domestic federal debt each one holds (Tesouro, set/2026): 31%, 23%, 22%, 10%.
const T6 = 31.65;
addScene("credores", T5, T6, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -3.0, wall: "#4a3a30", seed: 11 }); S.backdrop(office.group);
  const who = [["BANCOS 31%", 31, 27.24], ["FUNDOS 23%", 23, 28.1], ["PREVIDÊNCIA 22%", 22, 28.5], ["ESTRANGEIROS 10%", 10, 28.78]];
  const items = who.map(([label, pct, at], i) => {
    const p = makeDpPlinth(label, { w: 1.86, h: 0.44, d: 0.9, plateH: 0.3 }); p.group.position.set((i - 1.5) * 1.98, 0, 0); S.add(p.group);
    const st = makeDpTitleStack(Math.round(pct * 4.2), { seed: 5 + i }); st.group.position.set(0, p.top, 0); p.group.add(st.group);
    const doc = makeCertificate("TÍTULO", { w: 0.6, d: 0.44 }); doc.title.userData.plate.detail = true; doc.group.rotation.y = 0.04 * (i - 1.5); p.group.add(doc.group);
    return { p, st, at, doc };
  });
  const anim = (t) => { office.update(t); items.forEach((it) => { const k = eOut(lin(t, it.at - 0.2, it.at + 0.9)); it.st.set(k); it.doc.group.visible = k > 0.02; it.doc.group.position.set(0, it.p.top + it.st.height(k) + 0.002, 0); }); };
  items.forEach((it, i) => S.hero(it.p.group, "credor " + (i + 1), { when: (t) => (i < 2 ? t < 27.9 : t > 29.4 && t < 30.4) || t > 31.4 }));
  const all = envelope(items.map((it) => it.p.group), anim, T6 - 0.1, T6);
  const first = envelope(items.slice(0, 2).map((it) => it.p.group), anim, T6 - 0.1, T6), last = envelope(items.slice(2).map((it) => it.p.group), anim, T6 - 0.1, T6);
  return (t) => {
    anim(t);
    const A = CAM.pose(first, { zone: "stage", from: [-0.25, 0.34, 1], pull: 1.0 }), B = CAM.pose(last, { zone: "stage", from: [0.25, 0.34, 1], pull: 1.0 }), C = CAM.pose(all, { zone: "stage", from: [0, 0.42, 1], pull: 1.02 });
    CAM.apply(CAM.track(t, [[T5, A], [29.3, B, 1.4], [31.2, C, 1.2]]));
  };
});

// ============================================================ 6 · a dívida ano a ano (31.65–45.95)
// "Até 2013, sobrava dinheiro, e a dívida era metade do PIB. Desde 2014, governos de partidos diferentes
// fecharam no vermelho. Teve recessão, teve pandemia… e hoje está em oitenta e três por cento."
// Dívida bruta do governo geral, % do PIB, dezembro de cada ano (BC, SGS 13762; 2026 = setembro).
// Cor = resultado primário do ano (BC, SGS 5793): verde sobrou, vermelho faltou. Sem rostos nem nomes.
const DP_DEBT = [[2010, 51.8, 1], [2011, 51.3, 1], [2012, 53.7, 1], [2013, 51.5, 1], [2014, 56.3, 0], [2015, 65.5, 0], [2016, 69.8, 0], [2017, 73.7, 0],
  [2018, 75.3, 0], [2019, 74.4, 0], [2020, 86.9, 0], [2021, 77.3, 1], [2022, 71.7, 1], [2023, 73.8, 0], [2024, 76.3, 0], [2025, 78.6, 0], [2026, 82.9, 0]];
const DP_HK = 0.04, DP_STEP = 0.56;
const dpX = (year) => (year - 2018) * DP_STEP;
// Bars over a floor timeline (year tags on the floor), a glowing "metade do PIB" line.
function makeDpDebtChart(S) {
  const g = new THREE.Group(); S.add(g);
  const deck = new THREE.Mesh(rbox(DP_DEBT.length * DP_STEP + 0.8, 0.08, 1.3, 0.02), pmat("#1b1714", { roughness: 0.35, clearcoat: 0.6 })); deck.position.set(dpX(2018), 0.04, 0); g.add(deck);
  const bars = DP_DEBT.map(([year, v, surplus]) => {
    const color = year === 2026 ? ORANGE : surplus ? GREEN : RED;
    const b = makeDpBar(color); b.group.position.set(dpX(year), 0.08, 0); g.add(b.group);
    const tag = makePlate(String(year), 0.44, 0.15, { bg: "#141414", fg: "#e9dcc7", detail: true }); tag.rotation.x = -0.9; tag.position.set(dpX(year), 0.13, 0.46); g.add(tag);
    return { year, v, b, h: v * DP_HK };
  });
  const half = new THREE.Group(); g.add(half);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, DP_DEBT.length * DP_STEP + 0.6, 10), new THREE.MeshBasicMaterial({ color: "#ffe2b0", toneMapped: false, transparent: true }));
  beam.rotation.z = Math.PI / 2; beam.position.set(dpX(2018), 0.08 + 50 * DP_HK, -0.25); half.add(beam);
  const hp = makePlate("METADE DO PIB", 1.3, 0.24, { bg: "#ffe2b0", fg: "#1c1410" }); hp.position.set(dpX(2010) - 0.2, 0.08 + 50 * DP_HK + 0.2, -0.24); half.add(hp);
  return { group: g, bars, half, halfMat: beam.material, halfPlate: hp, of: (y) => bars.find((b) => b.year === y) };
}
const T7 = 45.95;
addScene("historia", T6, T7, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -2.6, wall: "#3e3029", seed: 14, clear: 11 }); S.backdrop(office.group);
  const ch = makeDpDebtChart(S);
  const grow = (y) => (y <= 2013 ? 31.7 + (y - 2010) * 0.22 : y <= 2019 ? 36.6 + (y - 2014) * 0.42 : y === 2020 ? 42.3 : y <= 2025 ? 42.75 + (y - 2021) * 0.17 : 43.6);
  const today = makePlate("HOJE 82,9%", 1.3, 0.34, { bg: ORANGE, fg: "#ffffff" });
  const tb = ch.of(2026); today.position.set(dpX(2026) - 0.3, 0.08 + tb.h + 0.36, 0); S.add(today);
  const anim = (t) => {
    office.update(t);
    office.lights(1 - 0.4 * sm(t, 36.3, 37.0)); office.windows(1 + 0.8 * beat(t, 42.3, 0.9), t > 42.2 && t < 43.2 ? "#ff6a5a" : null);
    for (const b of ch.bars) {
      const at = grow(b.year), k = eOut(lin(t, at, at + 0.6));
      const flash = (b.year === 2015 || b.year === 2016) ? beat(t, 41.3, 0.8) : b.year === 2020 ? beat(t, 42.4, 0.9) : 0;
      b.b.set(b.h * k * (1 + 0.04 * flash)); b.b.mesh.material.emissiveIntensity = 1; b.b.mesh.material.emissive.set(b.year === 2020 || b.year === 2015 || b.year === 2016 ? "#ff3b2f" : "#000000").multiplyScalar(0.6 * flash);
    }
    const hk = sm(t, 32.6, 33.2) * (1 - sm(t, 36.4, 37.0)); ch.halfMat.opacity = hk; ch.half.visible = hk > 0.02;
    today.visible = t > 44.3; today.scale.setScalar(Math.max(0.0001, pop(t, 44.3, 0.4)));
  };
  const win = (y0, y1) => { const bs = ch.bars.filter((b) => b.year >= y0 && b.year <= y1); return new THREE.Box3(new V3(dpX(y0) - 0.35, 0, -0.5), new V3(dpX(y1) + 0.35, 0.08 + Math.max(...bs.map((b) => b.h)) + 0.15, 0.6)); };
  const box13 = win(2010, 2014), box19 = win(2013, 2019), box21 = win(2016, 2022), boxAll = win(2019, 2026); boxAll.expandByPoint(new V3(dpX(2026) + 0.4, 0.08 + 82.9 * DP_HK + 0.58, 0));
  box13.expandByPoint(new V3(dpX(2010) - 0.9, 0.08 + 50 * DP_HK + 0.35, 0));
  // each bar is checked only while the camera window holds it (the window slides along the years)
  const phases = [[32.6, 36.9, 2010, 2014], [38.7, 40.4, 2013, 2019], [42.6, 43.9, 2016, 2022], [45.2, 46, 2019, 2026]];
  ch.bars.forEach((b) => S.hero(b.b.group, "barra " + b.year, { when: (t) => t > grow(b.year) + 0.6 && phases.some(([a, z, y0, y1]) => t > a && t < z && b.year >= y0 && b.year <= y1) }));
  S.hero(today, "placa hoje", { when: (t) => t > 44.7 });
  return (t) => {
    anim(t);
    const A = CAM.move(box13, "push", lin(t, T6, 36.0), { zone: "stage", from: [0.1, 0.3, 1], pull0: 1.25 });
    const B = CAM.pose(box19, { zone: "stage", from: [0.05, 0.3, 1], pull: 1.03 }), C = CAM.pose(box21, { zone: "stage", from: [0, 0.32, 1], pull: 1.03 }), D = CAM.pose(boxAll, { zone: "stage", from: [-0.12, 0.34, 1], pull: 1.02 });
    CAM.apply(CAM.track(t, [[T6, A], [37.8, B, 1.6], [42.0, C, 1.4], [44.8, D, 1.3]]));
  };
});

// ============================================================ 7 · por que não diminui? (45.95–47.8)
const T8 = 47.8;
addScene("naodiminui", T7, T8, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -2.6, wall: "#3e3029", seed: 14, clear: 11 }); S.backdrop(office.group);
  const ch = makeDpDebtChart(S); ch.half.visible = false;
  ch.bars.forEach((b) => b.b.set(b.h));
  const tb = ch.of(2026), topY = 0.08 + tb.h;
  const arrow = makeDpArrow(0.9); S.add(arrow);
  const anim = (t) => {
    office.update(t); office.lights(0.75);
    // the arrow pushes down twice; the bar barely gives and springs back up
    const push = Math.max(0, Math.sin(Math.PI * clamp((t - 46.2) / 0.55))) + Math.max(0, Math.sin(Math.PI * clamp((t - 47.0) / 0.5)));
    tb.b.set(tb.h * (1 - 0.035 * push));
    arrow.position.set(dpX(2026), 0.08 + tb.h * (1 - 0.035 * push) + 0.03 + 0.35 * (1 - push), 0.05);
  };
  S.hero(arrow, "seta para baixo"); S.hero(tb.b.group, "barra de hoje");
  const box = envelope([arrow, tb.b.group, ch.of(2025).b.group, ch.of(2024).b.group], anim, T7, T8);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, T7, T8), { zone: "stage", from: [0.1, 0.28, 1], deg: 28, pull: 1.04 })); };
});

// ============================================================ 8 · o cartão: juros sobre juros (47.8–59.1)
// "Pensa no cartão: você deve mil, e o juro é cem. Não tem os cem? Eles viram dívida: agora são mil e cem,
// e o próximo juro vem sobre mil e cem. A dívida cresce sozinha." One coin = R$ 100.
const T9 = 59.1;
function dpCardTex() {
  return cachedTex("dp-card", () => {
    const c = makeCanvas(856, 540), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 856, 540);
    g.addColorStop(0, "#1d2a44"); g.addColorStop(1, "#0b1020"); x.fillStyle = g; roundRect(x, 0, 0, 856, 540, 40); x.fill();
    x.strokeStyle = "rgba(255,255,255,0.06)"; x.lineWidth = 2; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(700, 120, 60 + i * 28, 0, Math.PI * 2); x.stroke(); }
    const cg = x.createLinearGradient(80, 190, 200, 300); cg.addColorStop(0, "#e9cf86"); cg.addColorStop(1, "#b08a3e"); x.fillStyle = cg; roundRect(x, 80, 190, 120, 92, 14); x.fill();
    x.strokeStyle = "rgba(80,60,20,0.6)"; x.lineWidth = 3; x.strokeRect(110, 205, 60, 62); x.beginPath(); x.moveTo(80, 236); x.lineTo(200, 236); x.stroke();
    x.fillStyle = "rgba(244,241,234,0.9)"; x.font = "700 52px Inter"; x.fillText("••••  ••••  ••••  4821", 80, 400);
    x.font = "800 34px Inter"; x.fillStyle = "rgba(244,241,234,0.7)"; x.fillText("CARTÃO", 80, 470);
    return texFrom(c);
  });
}
function makeDpCard(w = 0.86, d = 0.54) {
  const face = pmat("#ffffff", { map: dpCardTex(), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }), edge = pmat("#0c1222", { roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), [edge, edge, face, edge, edge, edge]); m.position.y = 0.006;
  const g = new THREE.Group(); g.add(m); g.add(contactShadow(w * 1.3, d * 1.3)); return g;
}
addScene("cartao", T8, T9, (S) => {
  const TOP = 0.75;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), pmat("#ffffff", { map: tileTex(plasterTex("#3b2a22"), 3, 1.5), roughness: 0.9 })); wall.position.set(0, 3.5, -2.2); S.backdrop(wall);
  const win = makeSetWindow(2.0, 2.4, { seed: 8 }); win.group.position.set(-1.6, 2.6, -2.19); S.backdrop(win.group);
  const lamp = makePendantLamp({ drop: 1.3 }); lamp.position.set(0.3, 3.4, -0.1); asBackdrop(lamp); S.backdrop(lamp);
  const pool = makeFloorGlow(3.0, 2.0, { color: "#ffd9a8", opacity: 0.2 }); pool.position.set(0.3, TOP + 0.002, 0); S.backdrop(pool);
  makeDpTable(S, { w: 3.6, d: 2.0, top: TOP });
  const card = makeDpCard(); card.position.set(-0.86, TOP, 0.32); card.rotation.y = 0.35; S.add(card);
  // the debt: a column of R$ 100 coins on a wooden coaster; the amount printed on the coaster, swapped as it grows
  const R = 0.2, CT = 0.05, col = new THREE.Group(); col.position.set(0.12, TOP, 0); S.add(col);
  const coaster = new THREE.Mesh(rbox(0.92, 0.05, 0.8, 0.02), pmat("#ffffff", { map: woodTex({ base: "#2a1a10", seed: 4 }), roughness: 0.35, clearcoat: 0.6 })); coaster.position.y = 0.025; col.add(coaster);
  const amounts = ["R$ 1.000", "R$ 1.100", "R$ 1.210", "R$ 1.331", "R$ 1.464", "R$ 1.611", "R$ 1.772", "R$ 1.949"];
  const tags = amounts.map((a) => { const p = makePlate(a, 0.9, 0.22, { bg: "#141414", fg: "#f4f1ea" }); p.position.set(0, 0.06, 0.415); p.rotation.x = -0.2; col.add(p); return p; });
  const stack = []; for (let i = 0; i < 10; i++) { const c = makeDpCoin(R, CT); c.position.set(Math.sin(i * 2.1) * 0.006, 0.05 + i * CT, Math.cos(i * 1.7) * 0.006); c.rotation.y = i; col.add(c); stack.push(c); }
  // the interest: one coin each period, a little thicker every time (10% of the column), jumping on top
  const juros = [], steps = [[49.9, 52.4], [55.3, 56.7], [57.15, 57.6], [57.55, 57.95], [57.9, 58.3], [58.25, 58.6], [58.55, 58.9]];
  let h = 0.05 + 10 * CT;
  steps.forEach(([appear, land], i) => { const tk = CT * Math.pow(1.1, i); const c = makeDpCoin(R, tk); S.add(c); juros.push({ c, appear, land, y: h, tk }); h += tk; });
  const label = sprite(chipTex("JURO R$ 100", { bg: ORANGE, fg: "#1c1410", font: "900 110px Inter" }), 0.92); S.add(label);
  const label2 = sprite(chipTex("JURO R$ 110", { bg: ORANGE, fg: "#1c1410", font: "900 110px Inter" }), 0.92); S.add(label2);
  const side = new V3(1.08, TOP, 0.3);
  const anim = (t) => {
    win.set(0.9); lamp.rotation.z = Math.sin(t * 0.6) * 0.01;
    let n = 0;
    juros.forEach((j, i) => {
      const a = j.appear, l = j.land, k = eOut(lin(t, l - (i ? 0.35 : 0.6), l));
      j.c.visible = t > a - 0.05; j.c.scale.setScalar(t < a + 0.3 ? Math.max(0.0001, pop(t, a, 0.35)) : 1);
      // up first (clear of the column), across, then down onto the top
      const lift = j.y + 0.22, up = eOut(clamp(k / 0.4)), drop = sm(k, 0.78, 1), across = sm(k, 0.3, 0.85);
      const p = side.clone().lerp(new V3(col.position.x, TOP, col.position.z), across); p.y = TOP + up * lift - drop * 0.22;
      j.c.position.copy(p); j.c.rotation.set(0, i + t * 0.2 * (1 - k), 0);
      if (t >= l) n = i + 1;
    });
    tags.forEach((p, i) => { p.visible = i === n; });
    const j0 = juros[0], j1 = juros[1];
    label.position.set(side.x + 0.05, TOP + 0.3, side.z + 0.12); popSprite(label, t, j0.appear + 0.1, 0.35, j0.land - 0.45);
    label2.position.set(side.x + 0.05, TOP + 0.3, side.z + 0.12); popSprite(label2, t, j1.appear + 0.1, 0.35, j1.land - 0.3);
  };
  S.hero(col, "pilha de moedas");
  juros.forEach((j, i) => S.hero(j.c, "moeda de juro " + (i + 1), { when: (t) => t > j.appear + 0.3 && t < j.land - 0.4 }));
  S.label(label, "etiqueta juro 100", { on: "moeda de juro 1", when: (t) => t > juros[0].appear + 0.5 && t < juros[0].land - 0.5 });
  S.label(label2, "etiqueta juro 110", { on: "moeda de juro 2", when: (t) => t > juros[1].appear + 0.5 && t < juros[1].land - 0.35 });
  const near = envelope([col, ...juros.slice(0, 2).map((j) => j.c), label, label2], anim, T8, 57.0), colBox = envelope([col], anim, T8, T8 + 0.1);
  const tall = envelope([col, ...juros.map((j) => j.c)], anim, 58.95, T9);
  return (t) => {
    anim(t);
    const A0 = CAM.pose(colBox, { zone: "stage", from: [0.05, 0.4, 1], pull: 1.08 });
    const A = CAM.track(t, [[T8, A0], [50.3, CAM.move(near, "push", lin(t, 49.8, 56.9), { zone: "stage", from: [0.1, 0.4, 1], pull0: 1.15 }), 1.0]]);
    const B = CAM.pose(tall, { zone: "stage", from: [0.2, 0.3, 1], pull: 1.03 });
    CAM.apply(CAM.blend(A, B, sm(t, 56.9, 58.6)));
  };
});

// ============================================================ 9 · com o Brasil é igual (59.1–69.5)
// "Não sobra dinheiro pros juros, e eles viram dívida. Pior: sem contar os juros, o governo ainda gasta
// setenta bilhões a mais do que arrecada." Volumes to scale: R$ 1,2 tri of interest vs R$ 70 bi (17 x).
const T10 = 69.5;
addScene("brasil", T9, T10, (S) => {
  const city = makeDpCity(31); S.backdrop(city.group);
  const base = makeDpPlinth("BRASIL", { w: 2.4, h: 0.62, d: 2.0 }); S.add(base.group);
  const levels = []; for (let i = 0; i < 5; i++) { const c = makeDpCashCube(1.8, 0.5, 1.5); c.group.position.set(0, base.top + i * (c.h), 0); c.group.rotation.y = i % 2 ? 0.03 : -0.02; S.add(c.group); levels.push(c); }
  const towerTop = base.top + 5 * levels[0].h;
  // big block: the interest of 12 months; small red block: the spending above revenue (same units)
  const big = makeDpCashCube(1.9, 0.95, 1.6, { pallet: false }); S.add(big.group);
  const bigTag = makePlate("JUROS R$ 1,2 TRI", 1.84, 0.36, { bg: ORANGE, fg: "#1c1410" }); bigTag.position.set(0, big.h / 2, 0.81); big.group.add(bigTag);
  const small = new THREE.Group(); S.add(small);
  const sm1 = new THREE.Mesh(rbox(0.6, 0.33, 0.48, 0.02), pmat(RED, { roughness: 0.35, clearcoat: 0.8 })); sm1.position.y = 0.165; small.add(sm1);
  const smTag = makePlate("R$ 70 BI", 0.56, 0.16, { bg: "#141414", fg: "#ffffff" }); smTag.position.set(0, 0.165, 0.245); small.add(smTag);
  const drop = (t, at, from) => eIn(lin(t, at - 0.45, at)) ;
  const anim = (t) => {
    city.update(t); city.dim(1 - 0.45 * beat(t, 62.8, 1.1));
    const kb = drop(t, 62.8); big.group.visible = t > 62.3; big.group.position.set(0, towerTop + (1 - kb) * 2.6, 0);
    const ks = drop(t, 67.5); small.visible = t > 67.0; small.position.set(0.35, towerTop + big.h + (1 - ks) * 1.6, 0.25);
  };
  const tower = new THREE.Group(); levels.forEach((c) => tower.add(c.group)); S.add(tower);
  const wideOk = (t) => t < 61.3 || (t > 66.6 && t < 67.7);
  S.hero(tower, "torre brasil", { when: wideOk }); S.hero(base.group, "base brasil", { when: wideOk });
  S.hero(levels[4].group, "topo da torre", { when: (t) => t > 62.2 && t < 63.6 });
  S.hero(big.group, "bloco juros", { when: (t) => t > 62.8 && (t < 63.6 || t > 66.6) });
  S.hero(levels[4].group, "topo da torre no fim", { when: (t) => t > 69.0 });
  S.hero(small, "bloco 70 bi", { when: (t) => t > 68.8 });
  const blocks = envelope([big.group, small, levels[4].group], anim, 68.0, T10), top = envelope([big.group, levels[4].group, levels[3].group], anim, 62.8, 63.0), all = envelope([tower, base.group, big.group, small], anim, T10 - 0.1, T10);
  return (t) => {
    anim(t);
    const A = CAM.pose(top, { zone: "stage", from: [0.25, 0.25, 1], pull: 1.1 }), B = CAM.pose(all, { zone: "stage", from: [0.3, 0.35, 1], pull: 1.03 });
    const B0 = CAM.pose(all, { zone: "stage", from: [-0.15, 0.3, 1], pull: 1.08 });
    const Bt = CAM.pose(blocks, { zone: "stage", from: [0.3, 0.3, 1], pull: 1.06 });
    const p = CAM.track(t, [[T9, B0], [62.3, A, 1.0], [66.6, B, 3.0], [69.0, Bt, 1.3]]);
    CAM.apply(CAM.shake(CAM.shake(p, t, 62.8, 0.5, 0.45), t, 67.5, 0.25, 0.3));
  };
});

// ============================================================ 10 · este ano, os juros (69.5–73.0)
// "Este ano, foram os juros que mais fizeram a dívida crescer." What pushed gross debt up in 2026
// (BC, set/2026): interest +7,2 points of GDP, net issuance +1,1.
const T11 = 73.0;
addScene("juros2026", T10, T11, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -3.0, wall: "#4f3b2f", seed: 17 }); S.backdrop(office.group);
  const P = 0.42;
  const cols = [["JUROS +7,2", 7.2, -0.75, ORANGE, 69.55], ["OUTROS +1,1", 1.1, 0.75, "#3a3d44", 69.7]].map(([label, v, x, c, at]) => {
    const p = makeDpPlinth(label, { w: 1.3, h: 0.36, d: 1.0, plateH: 0.24, bg: c, fg: c === ORANGE ? "#1c1410" : "#ffffff" }); p.group.position.set(x, 0, 0); S.add(p.group);
    const n = Math.max(1, Math.round(v)), cubes = [];
    for (let i = 0; i < n; i++) { const cc = makeDpCashCube(1.0, P * 0.8 - 0.12, 0.8); cc.group.position.set(0, p.top + i * P * 0.8, 0); p.group.add(cc.group); cubes.push(cc); }
    return { p, cubes, at };
  });
  const anim = (t) => { office.update(t); cols.forEach((c) => c.cubes.forEach((cc, i) => { const a = c.at + i * 0.13, k = eIn(lin(t, a, a + 0.18)); cc.group.visible = t > a; cc.group.position.y = cols[0].p.top + i * P * 0.8 + (1 - k) * 0.35; })); };
  cols.forEach((c, i) => S.hero(c.p.group, "coluna " + (i + 1)));
  const box = envelope(cols.map((c) => c.p.group), anim, T11 - 0.1, T11);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, T10, T11), { zone: "stage", from: [0, 0.3, 1], deg: 36, pull: 1.04 })); };
});

// ============================================================ 11 · de quem é a culpa? (73.0–81.7)
// "Não é de um governo só. Quem gasta é o governo, quem aprova é o Congresso, e quem define o juro é o
// Banco Central." Three frames with their backs to us; each turns round when it is named (only one photo
// in view at a time, so its credit is always on screen).
const T12 = 81.7;
addScene("culpa", T11, T12, (S) => {
  const g0 = new THREE.Group(); S.backdrop(g0);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), pmat("#ffffff", { map: tileTex(plasterTex("#2e2420"), 6, 2), roughness: 0.9 })); wall.position.set(0, 4.5, -2.6); g0.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), pmat("#ffffff", { map: tileTex(woodTex("#2c1d14"), 10, 5), roughness: 0.3, clearcoat: 0.4 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.003, 2); g0.add(fl);
  const SP = 2.55, who = [["planalto", "GOVERNO", 76.15], ["congresso", "CONGRESSO", 77.78], ["sede-bc", "BANCO CENTRAL", 79.58]];
  const shafts = [];
  const frames = who.map(([id, name, at], i) => {
    const f = makePhotoFrame(id, { w: 1.7, shape: 4 / 3, name }); f.group.position.set((i - 1) * SP, 0, 0); S.add(f.group);
    // a dark card with a big "?" covers the photo until the place is named; it then tips forward and falls
    const iw = 1.7 - 2 * 0.119 - 2 * 0.102, ih = iw / (4 / 3), oh = ih + 2 * 0.119 + 2 * 0.102;
    const hinge = new THREE.Group(); hinge.position.set(0, oh / 2 - ih / 2, 0.045); f.frame.add(hinge);
    const q = makePlate("?", iw, ih, { bg: "#1c1410", fg: ORANGE, depth: 0.012 }); q.position.y = ih / 2; hinge.add(q);
    const sh = makeLightShaft([(i - 1) * SP, 6.5, 0.6], [(i - 1) * SP, 0.05, 0.4], { w0: 0.3, w1: 2.0, color: "#ffd9a8", opacity: 0.1 }); g0.add(sh.group); shafts.push(sh);
    const pool = makeFloorGlow(2.4, 1.8, { color: "#ffd9a8", opacity: 0.16 }); pool.position.set((i - 1) * SP, 0.01, 0.3); g0.add(pool);
    return { f, at, id, hinge };
  });
  asBackdrop(g0);
  const anim = (t) => {
    frames.forEach((fr, i) => {
      const k = eIn(lin(t, fr.at - 0.05, fr.at + 0.4));
      fr.hinge.rotation.x = 1.5 * k; fr.hinge.visible = k < 0.98; fr.f.photo.visible = k > 0.08;
      fr.f.frame.rotation.y = 0.05 * Math.sin(t * 0.8 + i); fr.f.zoom((fr.id === "congresso" ? 1.3 : fr.id === "sede-bc" ? 1.12 : 1) + 0.12 * lin(t, fr.at, fr.at + 1.8));
      shafts[i].set(0.4 + 0.6 * sm(t, fr.at - 0.1, fr.at + 0.3));
    });
  };
  frames.forEach((fr, i) => S.hero(fr.f.group, "porta-retrato " + (i + 1), { when: (t) => (i === 0 ? t > fr.at : t > fr.at + 0.1) && (i === 2 || t < frames[i + 1].at - 0.25) }));
  const wide = envelope(frames.map((fr) => fr.f.group), anim, T11, T11 + 0.1);
  const one = (i) => envelope([frames[i].f.group], anim, frames[i].at + 0.6, frames[i].at + 0.7);
  const P0 = one(0), P1 = one(1), P2 = one(2);
  return (t) => {
    anim(t);
    const A = CAM.move(wide, "truck", lin(t, T11, 76.0), { zone: "stage", from: [0, 0.3, 1], side: 0.25, pull: 1.04 });
    const F = (b, k) => CAM.pose(b, { zone: "stage", from: [0.08 - 0.16 * k, 0.26, 1], pull: 1.08 });
    // quick whip pans between frames (0.35 s): only one photo in view at a time
    CAM.apply(CAM.track(t, [[T11, A], [76.15, F(P0, 0), 0.35], [77.78, F(P1, 0.5), 0.35], [79.58, F(P2, 1), 0.35]]));
  };
});

// ============================================================ 12 · as três saídas (81.7–86.6)
// "As saídas são três: gastar menos, crescer mais… ou o juro cair." A control desk with three levers.
const T13 = 86.6;
// Plate with two lines of printed text ("GASTAR\nMENOS"), same contract as makePlate (QA reads userData.plate).
function makeDpPlate2(text, w, h, { bg = "#141414", fg = "#f4f1ea", depth = 0.03 } = {}) {
  const ph = 256, pw = Math.max(64, Math.round(ph * w / h)), c = makeCanvas(pw, ph), x = c.getContext("2d"), lines = text.split("\n");
  x.fillStyle = bg; roundRect(x, 0, 0, pw, ph, ph * 0.1); x.fill();
  let px = Math.round(ph * 0.42); x.font = `900 ${px}px Inter`;
  while ((Math.max(...lines.map((l) => x.measureText(l).width)) > pw * 0.88 || px * 1.08 * lines.length > ph * 0.86) && px > 8) { px -= 2; x.font = `900 ${px}px Inter`; }
  x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
  lines.forEach((l, i) => x.fillText(l, pw / 2, ph / 2 + px * 0.05 + (i - (lines.length - 1) / 2) * px * 1.08));
  const face = new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false, alphaTest: 0.5 }), side = mat(bg);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), [side, side, side, side, face, side]);
  m.userData.plate = { text, w, h, depth, frac: px / ph, detail: false }; return m;
}
// Round gauge (debt meter): green → red arc, ticks, a needle; set(k) 0 = green end, 1 = red end.
function makeDpGauge(r = 0.55) {
  const g = new THREE.Group(), c = makeCanvas(512, 512), x = c.getContext("2d");
  x.fillStyle = "#f2ece0"; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill();
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  for (let i = 0; i < 60; i++) { const k = i / 60, a = a0 + (a1 - a0) * k; x.strokeStyle = `hsl(${120 - 120 * k}, 70%, 42%)`; x.lineWidth = 34; x.beginPath(); x.arc(256, 256, 200, a, a + (a1 - a0) / 60 + 0.01); x.stroke(); }
  x.strokeStyle = "#1c1410"; for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; x.lineWidth = i % 5 ? 4 : 8; x.beginPath(); x.moveTo(256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160); x.lineTo(256 + Math.cos(a) * 130, 256 + Math.sin(a) * 130); x.stroke(); }
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 64), pmat("#ffffff", { map: texFrom(c), roughness: 0.5 })); g.add(face);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.12, 64), dpSteel("#2a2d32")); body.rotation.x = Math.PI / 2; body.position.z = -0.065; g.add(body);
  const bez = new THREE.Mesh(new THREE.TorusGeometry(r * 1.03, 0.03, 12, 64), dpChrome()); bez.position.z = 0.01; g.add(bez);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(r, 48), glassMat({ opacity: 0.12 })); glass.position.z = 0.035; glass.userData.noShadow = true; g.add(glass);
  const pivot = new THREE.Group(); pivot.position.z = 0.02; g.add(pivot);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(r * 0.78, 0.035, 0.012), pmat(RED, { roughness: 0.3, emissive: "#3a0603" })); needle.position.x = r * 0.36; pivot.add(needle);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 20), dpChrome()); hub.rotation.x = Math.PI / 2; hub.position.z = 0.025; g.add(hub);
  // canvas angle a (clockwise from +x, y down) → needle rotation.z = -a
  return { group: g, set: (k) => { pivot.rotation.z = -(a0 + (a1 - a0) * clamp(k)); } };
}
function makeDpLever() {
  const g = new THREE.Group(), steel = dpSteel("#2a2d32");
  const base = new THREE.Mesh(rbox(0.36, 0.08, 0.5, 0.02), steel); base.position.y = 0.04; g.add(base);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.38), mat("#0a0a0a")); slot.position.y = 0.081; g.add(slot);
  const pivot = new THREE.Group(); pivot.position.y = 0.08; g.add(pivot);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 16), dpChrome()); rod.position.y = 0.275; pivot.add(rod);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), pmat(RED, { roughness: 0.25, clearcoat: 1 })); knob.position.y = 0.56; pivot.add(knob);
  const lampMat = pmat("#2b3a2f", { emissive: GREEN, emissiveIntensity: 0, roughness: 0.2 });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 12), lampMat); lamp.position.set(0.12, 0.1, -0.18); g.add(lamp);
  return { group: g, pivot, lampMat, knob };
}
addScene("saidas", T12, T13, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -3.2, wall: "#3f342c", seed: 21 }); S.backdrop(office.group);
  const desk = new THREE.Mesh(rbox(3.25, 0.9, 1.0, 0.04), dpSteel("#33373d")); desk.position.y = 0.45; S.add(desk);
  const panel = new THREE.Mesh(rbox(3.15, 0.06, 0.82, 0.02), pmat("#1c1f23", { roughness: 0.4, clearcoat: 0.6 })); panel.position.set(0, 0.93, 0.05); S.add(panel);
  
  const names = [["GASTAR MENOS", 83.4], ["CRESCER MAIS", 84.7], ["JURO CAIR", 85.9]];
  const levers = names.map(([n, at], i) => {
    const x = (i - 1) * 1.06, l = makeDpLever(); l.group.scale.setScalar(1.3); l.group.position.set(x, 0.96, 0.12); S.add(l.group);
    const p = makeDpPlate2(n.replace(" ", "\n"), 0.98, 0.5); p.position.set(x, 0.48, 0.516); S.add(p);
    return { l, at, p };
  });
  const gauge = makeDpGauge(0.5); gauge.group.position.set(0, 2.62, -0.35); S.add(gauge.group);
  const gp = makeDpPlate2("DÍVIDA", 1.0, 0.34); gp.position.set(0, 1.96, -0.22); S.add(gp);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.25, 16), dpSteel("#2a2d32")); stem.position.set(0, 0.93 + 0.62, -0.32); S.add(stem);
  const rig = new THREE.Group(); [desk, panel, gauge.group, gp, stem, ...levers.map((v) => v.l.group), ...levers.map((v) => v.p)].forEach((o) => rig.attach(o)); S.add(rig);
  const anim = (t) => {
    office.update(t); let on = 0;
    let down = 0; levers.forEach((v) => { const k = eOut(lin(t, v.at - 0.15, v.at + 0.25)); v.l.pivot.rotation.x = lerp(-0.5, 0.55, k); v.l.lampMat.emissiveIntensity = 2.2 * k; down += k; if (t > v.at) on++; });
    gauge.set(0.9 - 0.2 * down + 0.012 * Math.sin(t * 9));
    office.lights(0.8 + 0.1 * on);
  };
  S.hero(rig, "painel de alavancas");
  const box = envelope([rig], anim, T12, T13);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, T12, T13), { zone: "stage", from: [0, 0.22, 1], rise: 0.2, pull: 1.0 })); };
});

// ============================================================ 13 · a pergunta (86.6–94.8)
// "E você: prefere juro alto rendendo seu dinheiro, ou juro baixo deixando o crédito mais barato?"
// A balance: JURO ALTO (a jar of coins that keeps filling) against JURO BAIXO (a house key on a card).
const T14 = 94.8;
function makeDpKey(s = 1) {
  const g = new THREE.Group(), m = pmat("#c9a24e", { metalness: 1, roughness: 0.25 });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.11 * s, 0.035 * s, 16, 40), m); bow.position.x = -0.24 * s; g.add(bow);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.42 * s, 0.05 * s, 0.03 * s), m); shaft.position.x = 0.06 * s; g.add(shaft);
  for (const [x, h] of [[0.12, 0.08], [0.19, 0.12], [0.25, 0.07]]) { const tth = new THREE.Mesh(new THREE.BoxGeometry(0.04 * s, h * s, 0.03 * s), m); tth.position.set(x * s, -(0.025 + h / 2) * s, 0); g.add(tth); }
  g.rotation.x = -Math.PI / 2; const w = new THREE.Group(); w.add(g); return w;
}
addScene("pergunta", T13, T14, (S) => {
  const office = makeOfficeSet({ ceil: 9.5, wallZ: -3.0, wall: "#5d4637", seed: 25 }); S.backdrop(office.group);
  const steel = dpSteel("#2b2e33"), brass = dpGold();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 2.1, 24), brass); post.position.y = 1.05 + 0.12; S.add(post);
  const foot = new THREE.Mesh(rbox(1.0, 0.12, 0.7, 0.03), pmat("#1b1a1d", { roughness: 0.2, clearcoat: 1 })); foot.position.y = 0.06; S.add(foot);
  const beam = new THREE.Group(); beam.position.y = 2.25; S.add(beam);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 16), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), brass); beam.add(pivot);
  const pans = [-0.92, 0.92].map((x, i) => {
    const hang = new THREE.Group(); S.add(hang);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.07, 48), brass); pan.position.y = -1.25; hang.add(pan);
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + 0.5, lo = new V3(Math.cos(a) * 0.44, -1.22, Math.sin(a) * 0.44), dir = lo.clone().negate(), len = dir.length(); const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, len, 6), steel); ch.position.copy(lo).multiplyScalar(0.5); ch.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize()); hang.add(ch); }
    const tag = makePlate(i ? "JURO BAIXO" : "JURO ALTO", 0.86, 0.22, { bg: i ? GREEN : ORANGE, fg: "#ffffff" }); tag.position.set(0, -1.255, 0.475); tag.rotation.x = -0.1; hang.add(tag);
    return { hang, x, pan };
  });
  const jar = makeCoinJar({ r: 0.25, h: 0.42, label: "RENDE", n: 300, seed: 9 }); jar.label.userData.plate.detail = true; jar.group.position.set(0, -1.215, 0); pans[0].hang.add(jar.group);
  const card = makeDpCard(0.56, 0.35); card.position.set(0.02, -1.215, 0.02); card.rotation.y = 0.3; pans[1].hang.add(card);
  const house = makeHouse({ w: 0.42, h: 0.28, d: 0.36, roofH: 0.2 }); house.position.set(-0.05, -1.215 + 0.013, -0.08); house.rotation.y = 0.3; pans[1].hang.add(house);
  const keyO = makeDpKey(1.0); keyO.position.set(0.18, -1.215 + 0.03, 0.2); pans[1].hang.add(keyO);
  const anim = (t) => {
    office.update(t);
    const a = 0.13 * Math.sin((t - T13) * 1.25) * (0.6 + 0.4 * Math.sin(t * 0.37));
    beam.rotation.z = a;
    pans.forEach((p) => { const end = new V3(p.x, 0, 0).applyAxisAngle(new V3(0, 0, 1), a); p.hang.position.set(end.x, 2.25 + end.y, 0); });
    jar.fill(0.45 + 0.4 * lin(t, T13, T14));
  };
  const rig = new THREE.Group(); [post, foot, beam, ...pans.map((p) => p.hang)].forEach((o) => rig.attach(o)); S.add(rig);
  S.hero(rig, "balança");
  const box = envelope([rig], anim, T13, T14);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, T13, T14), { zone: "stage", from: [0, 0.18, 1], deg: 24, pull: 1.02 })); };
});
