// ============================================================================
// props/economy.js · the economy at street scale and as table models (vídeo do PIB, 03/11/2026):
//   hatchback car, standing charcoal grill with skewers, string lights, model container ship, model
//   factory, model tower crane, public building (escola / hospital), measuring ruler with a cursor, gear
//   wheel, coin funnel on its arm, labelled plinth, coffee mug, and a titled monitor that draws a rising line.
// Units: metres. Origin: floor centre unless said otherwise; front = +z. Generic: no logos, no real brands.
// ============================================================================

const econSteel = (c = "#4a4f57") => pmat(c, { metalness: 0.75, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.3 });
const econChrome = () => pmat("#d6d9de", { metalness: 1, roughness: 0.18 });

// ---------------------------------------------------------------- the neighbour's new car
// Small hatchback: lacquered body with rounded ends, a glass cabin (raked windshield, near-vertical hatch)
// under a roof in the body colour, B-pillars, door line and handles, four wheels with alloy rims, head and
// tail lights, grille, mirrors, a blank number plate. Length along x (nose at +x).
// Origin: floor centre. API { group, L, W, H, lights(k) }
function makeHatchbackCar({ color = "#b3202a", L = 1.9, W = 0.84 } = {}) {
  const g = new THREE.Group();
  const paint = pmat(color, { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, metalness: 0.35 });
  const glass = pmat("#16202a", { roughness: 0.05, metalness: 0.25, clearcoat: 1 });
  const rubber = pmat("#121212", { roughness: 0.85 }), chrome = econChrome(), dark = pmat("#1a1a1c", { roughness: 0.5 });
  const clear = 0.13, bodyH = 0.36, wr = 0.17, cy = clear + bodyH, ch = 0.29;
  const body = new THREE.Mesh(rbox(L, bodyH, W, 0.1), paint); body.position.y = clear + bodyH / 2; g.add(body);
  // cabin: the side profile extruded across the car
  const prof = new THREE.Shape();
  prof.moveTo(-L * 0.45, 0); prof.lineTo(L * 0.2, 0); prof.lineTo(-L * 0.03, ch); prof.lineTo(-L * 0.4, ch); prof.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(prof, { depth: W * 0.8, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
  cabGeo.translate(0, 0, -W * 0.4);
  const cab = new THREE.Mesh(cabGeo, glass); cab.position.y = cy - 0.02; g.add(cab);
  const roof = new THREE.Mesh(rbox(L * 0.39, 0.035, W * 0.86, 0.015), paint); roof.position.set(-L * 0.215, cy - 0.02 + ch + 0.03 + 0.012, 0); g.add(roof);
  for (const s of [-1, 1]) {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.06, ch + 0.02, 0.012), paint); pil.position.set(-L * 0.17, cy - 0.01 + ch / 2, s * (W * 0.4 + 0.032)); g.add(pil);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.008, bodyH * 0.78, 0.006), dark); door.position.set(-L * 0.17, clear + bodyH * 0.52, s * (W / 2 + 0.002)); g.add(door);
    const handle = new THREE.Mesh(rbox(0.07, 0.018, 0.012, 0.005), chrome); handle.position.set(-L * 0.08, clear + bodyH * 0.78, s * (W / 2 + 0.004)); g.add(handle);
    const mirror = new THREE.Mesh(rbox(0.06, 0.05, 0.09, 0.015), paint); mirror.position.set(L * 0.16, cy + 0.03, s * (W / 2 + 0.03)); g.add(mirror);
  }
  // wheels
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const w = new THREE.Group(); w.position.set(sx * L * 0.31, wr, sz * (W / 2 - 0.055)); g.add(w);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 0.13, 36), rubber); tire.rotation.x = Math.PI / 2; w.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(wr * 0.64, wr * 0.64, 0.134, 28), chrome); rim.rotation.x = Math.PI / 2; w.add(rim);
    for (let i = 0; i < 5; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.018, wr * 1.1, 0.008), pmat("#9a9da3", { metalness: 1, roughness: 0.3 })); sp.rotation.z = i * Math.PI * 2 / 5; sp.position.z = sz * 0.069; w.add(sp); }
  }
  // lights, grille, plate
  const head = pmat("#fff6e0", { emissive: "#fff2cc", emissiveIntensity: 0.4, roughness: 0.1 }), tail = pmat("#7a0a08", { emissive: "#ff1a10", emissiveIntensity: 0.6, roughness: 0.2 });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(rbox(0.03, 0.07, 0.16, 0.012), head); hl.position.set(L / 2 - 0.01, clear + bodyH * 0.7, s * W * 0.31); g.add(hl);
    const tl = new THREE.Mesh(rbox(0.03, 0.09, 0.12, 0.012), tail); tl.position.set(-L / 2 + 0.01, clear + bodyH * 0.72, s * W * 0.33); g.add(tl);
  }
  const grille = new THREE.Mesh(rbox(0.02, 0.08, W * 0.4, 0.01), dark); grille.position.set(L / 2 - 0.005, clear + bodyH * 0.4, 0); g.add(grille);
  for (const sx of [-1, 1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.22), pmat("#f1efe9", { roughness: 0.5 })); pl.position.set(sx * (L / 2 + 0.002), clear + bodyH * 0.25, 0); g.add(pl); }
  g.add(contactShadow(L + 0.6, W + 0.6));
  return { group: g, L, W, H: cy + ch + 0.05, lights(k) { head.emissiveIntensity = 0.4 + 2.2 * k; } };
}

// ---------------------------------------------------------------- the barbecue
// Standing charcoal grill (churrasqueira de pé): an open steel firebox on four legs with a lower shelf,
// glowing coals, a grate, three skewers of meat resting across the box, small flames between the bars and
// smoke that rises. update(t, k): k 0..1 is how hard it burns (flames, coal glow, smoke).
// Long side along x. Origin: floor centre. API { group, top, update(t, k) }
function makeBarbecueGrill({ w = 0.8, d = 0.38, h = 0.8, seed = 5 } = {}) {
  const g = new THREE.Group(), steel = econSteel("#2a2c30"), black = pmat("#151515", { roughness: 0.6, metalness: 0.4 }), r = mulberry32(seed);
  const boxH = 0.2, y0 = h - boxH, top = h;
  const bottom = new THREE.Mesh(rbox(w, 0.02, d, 0.005), steel); bottom.position.y = y0 + 0.01; g.add(bottom);
  for (const [bw, bd, x, z] of [[w, 0.02, 0, d / 2 - 0.01], [w, 0.02, 0, -d / 2 + 0.01], [0.02, d, w / 2 - 0.01, 0], [0.02, d, -w / 2 + 0.01, 0]]) {
    const p = new THREE.Mesh(rbox(bw, boxH, bd, 0.006), steel); p.position.set(x, y0 + boxH / 2, z); g.add(p);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, y0, 10), black); l.position.set(sx * (w / 2 - 0.04), y0 / 2, sz * (d / 2 - 0.04)); g.add(l); }
  const shelf = new THREE.Mesh(rbox(w - 0.06, 0.015, d - 0.06, 0.004), pmat("#ffffff", { map: woodTex("#6a4a2e"), roughness: 0.7 })); shelf.position.y = 0.22; g.add(shelf);
  const coalM = pmat("#3a1208", { emissive: "#ff4a10", emissiveIntensity: 1.0, roughness: 0.85 });
  const NC = 70, coals = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.028, 0), coalM, NC), o = new THREE.Object3D();
  for (let i = 0; i < NC; i++) { o.position.set((r() - 0.5) * (w - 0.08), y0 + 0.035 + r() * 0.03, (r() - 0.5) * (d - 0.08)); o.rotation.set(r() * 3, r() * 3, r() * 3); o.scale.setScalar(0.7 + r() * 0.6); o.updateMatrix(); coals.setMatrixAt(i, o.matrix); }
  g.add(coals);
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, w - 0.03, 6), steel); b.rotation.z = Math.PI / 2; b.position.set(0, top - 0.035, -d / 2 + 0.03 + i * (d - 0.06) / 8); g.add(b); }
  // skewers across the box (along x), resting on the short walls, with meat and a wooden handle
  const meat = [pmat("#6a2a18", { roughness: 0.55, clearcoat: 0.4 }), pmat("#8a3a1e", { roughness: 0.55, clearcoat: 0.4 }), pmat("#5a2214", { roughness: 0.55, clearcoat: 0.4 })];
  for (let k = 0; k < 3; k++) {
    const z = (k - 1) * d * 0.28, sk = new THREE.Group(); sk.position.set(0.04, top + 0.012, z); g.add(sk);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, w + 0.16, 8), econChrome()); rod.rotation.z = Math.PI / 2; sk.add(rod);
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 12), pmat("#ffffff", { map: woodTex("#7a5232"), roughness: 0.6 })); hd.rotation.z = Math.PI / 2; hd.position.x = w / 2 + 0.12; sk.add(hd);
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(rbox(0.07, 0.055, 0.055, 0.018), meat[(i + k) % 3]); m.position.set(-w * 0.36 + i * w * 0.13, 0, 0); m.rotation.x = r() * 0.6; sk.add(m); }
  }
  // flames and smoke (decor: they never count in the framing)
  const flames = []; for (let i = 0; i < 6; i++) { const f = makeFlame(); f.scale.setScalar(0.22); f.position.set((i / 5 - 0.5) * (w - 0.16), top - 0.02, (i % 2 ? 0.08 : -0.08)); f.traverse((n) => { n.userData.decor = true; }); g.add(f); flames.push(f); }
  const smokeM = new THREE.MeshBasicMaterial({ color: "#b8b0a8", transparent: true, opacity: 0.3, depthWrite: false });
  const puffs = []; for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), smokeM.clone()); p.userData.decor = true; p.userData.noShadow = true; g.add(p); puffs.push(p); }
  g.add(contactShadow(w + 0.5, d + 0.5));
  const update = (t, k = 1) => {
    coalM.emissiveIntensity = 0.6 + 1.4 * k * (0.85 + 0.15 * Math.sin(t * 9));
    flames.forEach((f, i) => { const s = 0.22 * k * (0.75 + 0.35 * Math.sin(t * 13 + i * 2.1)); f.visible = s > 0.01; f.scale.set(Math.max(0.0001, s), Math.max(0.0001, s * (1.1 + 0.3 * Math.sin(t * 17 + i))), Math.max(0.0001, s)); f.position.y = top - 0.02 + s * 0.2; });
    puffs.forEach((p, i) => {
      const ph = (t * 0.32 + i / puffs.length) % 1;
      p.position.set(Math.sin(i * 2.7 + t * 0.6) * 0.12 + ph * 0.25, top + 0.08 + ph * 1.3, Math.cos(i * 1.9) * 0.08);
      p.scale.setScalar(0.6 + ph * 2.4); p.material.opacity = 0.32 * k * Math.sin(Math.PI * ph); p.visible = k > 0.02;
    });
  };
  update(0, 1);
  return { group: g, top, update };
}

// String of party lights hanging between two points (a catenary that sags `sag` m), `n` warm bulbs with a
// soft glow. set(k): 0..1, the bulbs light one after another from a to b. a, b: world positions (arrays).
// Origin: world. API { group, set(k) }
function makeStringLights(a, b, { n = 14, sag = 0.35, color = "#ffd59a" } = {}) {
  const g = new THREE.Group(), A = new V3(...a), B = new V3(...b);
  const at = (u) => A.clone().lerp(B, u).add(new V3(0, -sag * 4 * u * (1 - u), 0));
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(at(i / 24));
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.006, 6), pmat("#141414", { roughness: 0.6 })); g.add(wire);
  const bulbs = [];
  for (let i = 0; i < n; i++) {
    const p = at((i + 0.5) / n), bm = new THREE.MeshBasicMaterial({ color: "#3a2a1a", toneMapped: false });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), bm); bulb.position.copy(p).add(new V3(0, -0.04, 0)); g.add(bulb);
    const halo = sprite(BOKEH, 0.32); halo.material.color.set(color); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0; halo.position.copy(bulb.position); g.add(halo);
    bulbs.push({ bm, halo });
  }
  const on = new THREE.Color(color), off = new THREE.Color("#3a2a1a");
  const set = (k) => bulbs.forEach((b, i) => { const v = clamp(k * n - i); b.bm.color.copy(off).lerp(on, v); b.halo.material.opacity = 0.55 * v; });
  set(0);
  asBackdrop(g);
  return { group: g, set };
}

// ---------------------------------------------------------------- models for a table or a tray of water
// Model container ship: hull with a pointed bow and a red waterline band, deck, white bridge at the stern
// with a dark window band, a funnel, and rows of containers (set(k) loads them: 0 empty, 1 full).
// Optional `label` printed on both sides of the hull. Length along x (bow at +x).
// Origin: the waterline, centre. API { group, set(k), plates, L, B, D }
function makeCargoShipModel({ L = 1.0, hull = "#24384e", label = null, seed = 4 } = {}) {
  const g = new THREE.Group(), B = L * 0.18, D = L * 0.13, draft = D * 0.35, r = mulberry32(seed);
  const outline = (sx = 1) => { const s = new THREE.Shape(); s.moveTo(-L / 2, -B / 2 * sx); s.lineTo(L * 0.3, -B / 2 * sx); s.quadraticCurveTo(L * 0.46, -B * 0.32 * sx, L / 2, 0); s.quadraticCurveTo(L * 0.46, B * 0.32 * sx, L * 0.3, B / 2 * sx); s.lineTo(-L / 2, B / 2 * sx); s.closePath(); return s; };
  const slab = (depth, y, m, grow = 0) => {
    const geo = new THREE.ExtrudeGeometry(outline(), { depth, bevelEnabled: true, bevelSize: 0.006 + grow, bevelThickness: 0.004, bevelSegments: 2 });
    geo.rotateX(-Math.PI / 2); const mesh = new THREE.Mesh(geo, m); mesh.position.y = y; g.add(mesh); return mesh;
  };
  slab(D, -draft, pmat(hull, { roughness: 0.42, clearcoat: 0.6 }));
  slab(D * 0.28, -draft - 0.001, pmat("#8a2018", { roughness: 0.5 }), 0.002);
  slab(0.006, D - draft, pmat("#5a2a20", { roughness: 0.7 }));
  const white = pmat("#ece8e0", { roughness: 0.45 }), deckY = D - draft + 0.006;
  const bridge = new THREE.Mesh(rbox(L * 0.11, D * 1.5, B * 0.86, 0.008), white); bridge.position.set(-L * 0.4, deckY + D * 0.75, 0); g.add(bridge);
  const band = new THREE.Mesh(new THREE.BoxGeometry(L * 0.112, D * 0.22, B * 0.87), pmat("#141a22", { roughness: 0.1, clearcoat: 1 })); band.position.set(-L * 0.4, deckY + D * 1.25, 0); g.add(band);
  const funnel = new THREE.Mesh(rbox(L * 0.05, D * 0.8, B * 0.3, 0.006), pmat("#c9561e", { roughness: 0.45 })); funnel.position.set(-L * 0.46, deckY + D * 1.5 + D * 0.4, 0); g.add(funnel);
  // containers: 6 bays × 3 across × 2 tiers, loaded bay by bay
  const colors = ["#a63a2a", "#2f5f8a", "#c98a2a", "#3f7a4a", "#7a7f86", "#b8b2a6"], cw = L * 0.095, chh = D * 0.55, cd = B * 0.29;
  const slots = []; for (let tier = 0; tier < 2; tier++) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) slots.push([-L * 0.27 + i * (cw + 0.006), deckY + chh / 2 + tier * (chh + 0.003), (j - 1) * (cd + 0.004)]);
  const box = new THREE.InstancedMesh(rbox(cw, chh, cd, 0.003), pmat("#ffffff", { roughness: 0.55, map: cachedTex("container-rib", () => { const c = makeCanvas(64, 32), x = c.getContext("2d"); x.fillStyle = "#d8d8d8"; x.fillRect(0, 0, 64, 32); for (let i = 0; i < 64; i += 6) { x.fillStyle = "#a8a8a8"; x.fillRect(i, 0, 2, 32); } return texFrom(c); }) }), slots.length);
  const o = new THREE.Object3D(), col = new THREE.Color();
  slots.forEach((p, i) => { o.position.set(...p); o.updateMatrix(); box.setMatrixAt(i, o.matrix); box.setColorAt(i, col.set(colors[Math.floor(r() * colors.length)])); });
  g.add(box);
  const plates = [];
  if (label) for (const s of [-1, 1]) { const p = makePlate(label, L * 0.5, D * 0.44, { bg: hull, fg: "#ffffff", depth: 0.004 }); p.position.set(L * 0.02, D * 0.42 - draft, s * (B / 2 + 0.006)); p.rotation.y = s > 0 ? 0 : Math.PI; g.add(p); plates.push(p); }
  const set = (k) => { box.count = Math.max(1, Math.round(clamp(k) * slots.length)); box.visible = k > 0.01; box.boundingBox = null; box.boundingSphere = null; };
  set(1);
  return { group: g, set, plates, L, B, D };
}

// Model factory: a brick hall with a sawtooth roof (glazed north faces that glow), a row of lit windows, a
// roller door, and a tall chimney with red-and-white bands that smokes (update(t, k), k 0..1); the smoke
// drifts `drift` m sideways (negative: to the left, away from a crane standing on the right).
// Origin: floor centre; front +z. API { group, update(t, k), h }
function makeFactoryModel({ w = 0.72, d = 0.46, h = 0.3, drift = 0.18 } = {}) {
  const g = new THREE.Group(), brick = mat("#ffffff", { map: tileTex(setBrickTex(), w / 0.4, h / 0.2), roughness: 0.85 });
  const hall = new THREE.Mesh(rbox(w, h, d, 0.008), brick); hall.position.y = h / 2; g.add(hall);
  const roofM = pmat("#3a3e44", { metalness: 0.5, roughness: 0.45 }), glow = mat("#ffd9a0", { emissive: "#ffb860", emissiveIntensity: 0.7, roughness: 0.2 });
  const teeth = 3, tw = w / teeth, rh = h * 0.42;
  for (let i = 0; i < teeth; i++) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(tw, 0); s.lineTo(0, rh); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: d * 0.96, bevelEnabled: false }); geo.translate(-w / 2 + i * tw, h, -d * 0.48);
    g.add(new THREE.Mesh(geo, roofM));
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.9, rh * 0.8), glow); pane.rotation.y = -Math.PI / 2; pane.position.set(-w / 2 + i * tw - 0.002, h + rh * 0.45, 0); g.add(pane);
  }
  for (let i = 0; i < 6; i++) { const wn = new THREE.Mesh(new THREE.BoxGeometry(w * 0.09, h * 0.22, 0.01), glow); wn.position.set(-w * 0.4 + i * w * 0.115, h * 0.66, d / 2 + 0.004); g.add(wn); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, h * 0.45, 0.012), pmat("#6c7178", { metalness: 0.6, roughness: 0.4 })); door.position.set(w * 0.3, h * 0.225, d / 2 + 0.004); g.add(door);
  const cx = w * 0.36, cz = -d * 0.28, chH = h * 2.6;
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.042, chH, 20), mat("#ffffff", { map: tileTex(setBrickTex(), 0.4, chH / 0.2), roughness: 0.85 })); chimney.position.set(cx, chH / 2, cz); g.add(chimney);
  for (const f of [0.78, 0.9]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, chH * 0.05, 20), mat(f > 0.8 ? "#f1ece4" : "#b3241a")); b.position.set(cx, chH * f, cz); g.add(b); }
  const smokeM = new THREE.MeshBasicMaterial({ color: "#c9c2ba", transparent: true, opacity: 0.3, depthWrite: false });
  const puffs = []; for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), smokeM.clone()); p.userData.decor = true; p.userData.noShadow = true; g.add(p); puffs.push(p); }
  g.add(contactShadow(w + 0.4, d + 0.4));
  const update = (t, k = 1) => {
    glow.emissiveIntensity = 0.25 + 0.7 * k;
    puffs.forEach((p, i) => { const ph = (t * 0.28 + i / puffs.length) % 1; p.position.set(cx + ph * drift + Math.sin(i * 2.1 + t) * 0.02, chH + 0.03 + ph * 0.55, cz); p.scale.setScalar(0.6 + ph * 2.2); p.material.opacity = 0.35 * k * Math.sin(Math.PI * ph); p.visible = k > 0.02; });
  };
  update(0, 1);
  return { group: g, update, h: chH };
}

// Model tower crane (obra): a lattice mast on a concrete foot, a jib with a trolley, cable and hook carrying
// a small load of beams, a counter-jib with its weight, the operator's cab. update(t) slews it slowly.
// Origin: floor centre. API { group, update(t), h }
function makeTowerCraneModel({ h = 0.85, jib = 0.62 } = {}) {
  const g = new THREE.Group(), yellow = pmat("#e3b32a", { roughness: 0.45, clearcoat: 0.4 });
  const lattice = cachedTex("crane-lattice", () => { const c = makeCanvas(64, 256), x = c.getContext("2d"); x.clearRect(0, 0, 64, 256); x.strokeStyle = "#ffffff"; x.lineWidth = 6; x.strokeRect(3, 0, 58, 256); for (let y = 0; y < 256; y += 32) { x.beginPath(); x.moveTo(3, y); x.lineTo(61, y + 32); x.stroke(); x.beginPath(); x.moveTo(3, y); x.lineTo(61, y); x.stroke(); } const t = texFrom(c); t.wrapT = THREE.RepeatWrapping; return t; });
  const latM = new THREE.MeshStandardMaterial({ color: "#e3b32a", map: tileTex(lattice, 1, h / 0.12), alphaTest: 0.5, transparent: false, side: THREE.DoubleSide, roughness: 0.5 });
  const foot = new THREE.Mesh(rbox(0.16, 0.05, 0.16, 0.01), mat("#8f8a84", { roughness: 0.9 })); foot.position.y = 0.025; g.add(foot);
  const mast = new THREE.Group(); mast.position.y = 0.05; g.add(mast);
  for (const [x, z, ry] of [[0, 0.025, 0], [0, -0.025, 0], [0.025, 0, Math.PI / 2], [-0.025, 0, Math.PI / 2]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.05, h), latM); p.position.set(x, h / 2, z); p.rotation.y = ry; mast.add(p); }
  const head = new THREE.Group(); head.position.y = 0.05 + h; g.add(head);
  const jibM = new THREE.Mesh(new THREE.BoxGeometry(jib, 0.035, 0.035), yellow); jibM.position.x = jib / 2 - 0.02; head.add(jibM);
  const cj = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.035), yellow); cj.position.x = -0.13; head.add(cj);
  const wt = new THREE.Mesh(rbox(0.07, 0.06, 0.06, 0.008), mat("#8f8a84", { roughness: 0.9 })); wt.position.set(-0.2, -0.04, 0); head.add(wt);
  const cab = new THREE.Mesh(rbox(0.05, 0.05, 0.05, 0.008), pmat("#ece8e0", { roughness: 0.4 })); cab.position.set(0.04, -0.03, 0.045); head.add(cab);
  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), yellow); apex.position.y = 0.075; head.add(apex);
  const trolleyX = jib * 0.7, cableL = h * 0.55;
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, cableL, 6), pmat("#1a1a1a", { roughness: 0.5 })); cable.position.set(trolleyX, -cableL / 2, 0); head.add(cable);
  const trolley = new THREE.Mesh(rbox(0.05, 0.02, 0.045, 0.005), pmat("#2a2c30", { metalness: 0.6, roughness: 0.4 })); trolley.position.set(trolleyX, -0.025, 0); head.add(trolley);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 8, 16, Math.PI * 1.4), pmat("#c9a227", { metalness: 0.6, roughness: 0.4 })); hook.position.set(trolleyX, -cableL - 0.005, 0); head.add(hook);
  const load = new THREE.Group(); load.position.set(trolleyX, -cableL - 0.02, 0); head.add(load);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.016), pmat("#8a3a20", { metalness: 0.4, roughness: 0.5 })); b.position.set(0, -i * 0.013, (i - 1) * 0.018); load.add(b); }
  g.add(contactShadow(0.4, 0.4));
  return { group: g, h: h + 0.17, update(t) { head.rotation.y = 0.35 * Math.sin(t * 0.35); } };
}

// ---------------------------------------------------------------- public buildings
// Two-storey public building (model scale): plaster walls, a flat roof with parapet, two rows of windows
// that light up (lights(k)), an entrance with a canopy and a glass door, and its nameplate over the door
// (`label`). kind "hospital": white with a red cross on the parapet; "escola": ochre with a red parapet.
// dim(k) greys the walls (a building that the count leaves out). Origin: floor centre; front +z.
// API { group, lights(k), dim(k), sign, w, h }
function makeCivicBuilding({ kind = "escola", label = null, w = 1.1, h = 0.56, d = 0.55 } = {}) {
  const g = new THREE.Group(), grey = new THREE.Color("#6a6762");
  const wallM = mat("#ffffff", { map: tileTex(plasterTex(kind === "hospital" ? "#e9ebe8" : "#d6b066"), w / 2, h / 2), roughness: 0.85 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.01), wallM); body.position.y = h / 2; g.add(body);
  const par = new THREE.Mesh(rbox(w + 0.02, 0.05, d + 0.02, 0.008), mat(kind === "hospital" ? "#c9cdd1" : "#a8452e", { roughness: 0.7 })); par.position.y = h + 0.025; g.add(par);
  const glass = mat("#ffd9a0", { emissive: "#ffb860", emissiveIntensity: 0.1, roughness: 0.25 }), frame = mat("#3a3632", { roughness: 0.6 });
  const cols = 6;
  for (let row = 0; row < 2; row++) for (let i = 0; i < cols; i++) {
    if (row === 0 && (i === 2 || i === 3)) continue;   // the entrance
    const x = -w / 2 + (i + 0.5) * (w / cols), y = h * (row ? 0.72 : 0.32);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(w / cols * 0.62, h * 0.22, 0.01), frame); fr.position.set(x, y, d / 2 + 0.004); g.add(fr);
    const pn = new THREE.Mesh(new THREE.BoxGeometry(w / cols * 0.52, h * 0.18, 0.01), glass); pn.position.set(x, y, d / 2 + 0.008); g.add(pn);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.2, h * 0.36, 0.01), pmat("#1c2a33", { roughness: 0.08, clearcoat: 1 })); door.position.set(0, h * 0.18, d / 2 + 0.005); g.add(door);
  const canopy = new THREE.Mesh(rbox(w * 0.3, 0.02, 0.12, 0.006), mat("#3a3632", { roughness: 0.5 })); canopy.position.set(0, h * 0.4, d / 2 + 0.06); g.add(canopy);
  let sign = null;
  if (label) { sign = makePlate(label, w * 0.5, h * 0.17, { bg: kind === "hospital" ? "#1d4f8a" : "#1d3a2a", fg: "#ffffff", depth: 0.01 }); sign.position.set(0, h * 0.52, d / 2 + 0.012); g.add(sign); }
  if (kind === "hospital") {
    const red = mat("#d01e1e", { emissive: "#a00808", emissiveIntensity: 0.4, roughness: 0.4 });
    const back = new THREE.Mesh(rbox(0.16, 0.16, 0.02, 0.01), mat("#ffffff", { roughness: 0.4 })); back.position.set(0, h + 0.13, d / 2 - 0.02); g.add(back);
    for (const [bw, bh] of [[0.12, 0.04], [0.04, 0.12]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.012), red); c.position.set(0, h + 0.13, d / 2 - 0.004); g.add(c); }
  }
  g.add(contactShadow(w + 0.5, d + 0.5));
  return {
    group: g, sign, w, h,
    lights(k) { glass.emissiveIntensity = 0.06 + 1.1 * clamp(k); },
    dim(k) { wallM.color.copy(new THREE.Color("#ffffff").lerp(grey, 0.7 * clamp(k))); },
  };
}

// ---------------------------------------------------------------- measuring
// Tall measuring ruler on a heavy foot: a lacquered yellow strip with ticks every 5 cm (texture), a board
// with `label` printed on top, and a sliding cursor: an orange collar with an arm that reaches `reach` m to
// the side (`side` -1 left, 1 right) to touch the top of what it measures. set(y): cursor height above the
// floor. Origin: floor centre; face +z. API { group, set(y), cursor, plate, top }
function makeMeasuringRuler({ h = 1.8, label = "PIB", w = 0.11, reach = 0.4, side = -1 } = {}) {
  const g = new THREE.Group(), H2 = Math.round(1024 * h / 1.8);
  const c = makeCanvas(64, H2), x = c.getContext("2d"); x.fillStyle = "#e9c23a"; x.fillRect(0, 0, 64, H2);
  const per = H2 / (h / 0.05); for (let i = 0; i * per < H2; i++) { const major = i % 5 === 0; x.fillStyle = "#1c1610"; x.fillRect(0, H2 - i * per - 2, major ? 40 : 20, 3); }
  const strip = new THREE.Mesh(rbox(w, h, 0.03, 0.01), [mat("#c9a22e"), mat("#c9a22e"), mat("#c9a22e"), mat("#c9a22e"), pmat("#ffffff", { map: texFrom(c), roughness: 0.3, clearcoat: 0.6 }), mat("#c9a22e")]);
  strip.position.y = 0.06 + h / 2; g.add(strip);
  const foot = new THREE.Mesh(rbox(0.36, 0.06, 0.3, 0.015), pmat("#1b1a1d", { roughness: 0.25, clearcoat: 1 })); foot.position.y = 0.03; g.add(foot);
  const board = new THREE.Mesh(rbox(w * 3.4, w * 1.5, 0.04, 0.012), pmat("#1b1a1d", { roughness: 0.3, clearcoat: 1 })); board.position.y = 0.06 + h + w * 0.75; g.add(board);
  const plate = makePlate(label, w * 3.0, w * 1.15, { bg: ORANGE, fg: "#ffffff", depth: 0.01 }); plate.position.set(0, 0.06 + h + w * 0.75, 0.021); g.add(plate);
  const cursor = new THREE.Group(); g.add(cursor);
  const orange = pmat(ORANGE, { roughness: 0.3, clearcoat: 0.8, emissive: "#5a1a04" });
  const collar = new THREE.Mesh(rbox(w + 0.05, 0.06, 0.07, 0.012), orange); cursor.add(collar);
  const arm = new THREE.Mesh(rbox(reach, 0.025, 0.03, 0.008), orange); arm.position.x = side * (w / 2 + reach / 2); cursor.add(arm);
  const tip = new THREE.Mesh(rbox(0.05, 0.012, 0.08, 0.004), orange); tip.position.set(side * (w / 2 + reach - 0.02), -0.01, 0); cursor.add(tip);
  g.add(contactShadow(0.7, 0.6));
  const set = (y) => { cursor.position.y = Math.max(0.09, y) + 0.018; };
  set(0.1);
  return { group: g, set, cursor, plate, top: 0.06 + h + w * 1.5 };
}

// Gear wheel (engrenagem): steel disc with `teeth` square teeth, a bored hub and four round lightening holes.
// Faces +z; turn it with group.rotation.z. Origin: centre. API { group, r }
function makeGearWheel({ r = 0.3, teeth = 12, t = 0.08 } = {}) {
  const s = new THREE.Shape(), root = r * 0.82, n = teeth * 4;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, q = i % 4, rr = q === 1 || q === 2 ? r : root; const p = [Math.cos(a) * rr, Math.sin(a) * rr]; i ? s.lineTo(...p) : s.moveTo(...p); }
  const hole = (cx, cy, hr) => { const p = new THREE.Path(); p.absarc(cx, cy, hr, 0, Math.PI * 2, true); return p; };
  s.holes.push(hole(0, 0, r * 0.14));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; s.holes.push(hole(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.13)); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelSize: t * 0.12, bevelThickness: t * 0.12, bevelSegments: 2, curveSegments: 18 }); geo.translate(0, 0, -t / 2);
  const g = new THREE.Group(), m = new THREE.Mesh(geo, pmat("#9aa0a8", { metalness: 0.9, roughness: 0.3, clearcoat: 0.3 })); g.add(m);
  const hub = new THREE.Mesh(new THREE.TorusGeometry(r * 0.18, r * 0.05, 10, 32), pmat("#c9a24e", { metalness: 1, roughness: 0.25 })); hub.position.z = t / 2 + 0.005; g.add(hub);
  return { group: g, r };
}

// ---------------------------------------------------------------- money that pours
// Steel funnel with a printed `label` (bg `plateBg`, `plateW` wide), held by an arm: "back" runs from the rim to a post that
// stands `drop` m below on the floor behind it; "right" is a boom coming in from the right. The arm is decor
// (never framed). Origin: the top of the spout (coins fall from there).
function makeCoinFunnel(label, { color = "#3c4148", plateBg = GREEN, arm = "back", drop = 2.4, plateW = 0.84 } = {}) {
  const g = new THREE.Group(), steel = econSteel(color), ds = Object.assign(steel.clone(), { side: THREE.DoubleSide });
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.55, 40, 1, true), ds); cone.position.y = 0.275; g.add(cone);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.028, 10, 48), econChrome()); lip.rotation.x = Math.PI / 2; lip.position.y = 0.55; g.add(lip);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 24, 1, true), ds); spout.position.y = -0.11; g.add(spout);
  const plate = makePlate(label, plateW, 0.24, { bg: plateBg, fg: "#ffffff" }); plate.position.set(0, 0.3, 0.36); plate.rotation.x = -0.4; g.add(plate);
  const pipe = (len, axis) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 16), steel); if (axis === "z") m.rotation.x = Math.PI / 2; if (axis === "x") m.rotation.z = Math.PI / 2; m.userData.decor = true; g.add(m); return m; };
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 10, 48), econChrome()); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; ring.userData.decor = true; g.add(ring);
  if (arm === "back") { pipe(1.25, "z").position.set(0, 0.5, -0.43 - 0.62); pipe(drop + 0.5, "y").position.set(0, 0.5 - (drop + 0.5) / 2, -1.68); }
  else pipe(2.6, "x").position.set(0.43 + 1.3, 0.5, 0);
  return { group: g, plate };
}

// Polished black plinth with an optional printed `label` on the front. Origin: floor centre. API { group, top, plate }
function makeLabelPlinth(label, { w = 1.2, h = 0.4, d = 0.9, fg = "#f4f1ea", bg = "#141414", plateH = null } = {}) {
  const g = new THREE.Group(), tex = tileTex(cachedTex("label-plinth", () => noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 })), 2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#1b1a1d", { map: tex, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2; g.add(m);
  let plate = null;
  if (label) { const ph = plateH || h * 0.62; plate = makePlate(label, w * 0.9, ph, { bg, fg }); plate.position.set(0, h / 2, d / 2 + 0.016); g.add(plate); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h, plate };
}

// Coffee mug (ceramic, coffee inside, handle). Origin: table top, centre. API { group }
function makeCoffeeMug({ r = 0.05, h = 0.1, color = "#e9e3d8" } = {}) {
  const g = new THREE.Group(), m = pmat(color, { roughness: 0.25, clearcoat: 0.8 });
  const prof = [[0, 0], [r * 0.92, 0], [r, 0.01], [r, h], [r * 0.9, h], [r * 0.9, 0.012], [0, 0.012]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), m));
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 32), pmat("#2a160c", { roughness: 0.15, clearcoat: 1 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = h * 0.85; g.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(h * 0.28, r * 0.16, 10, 24, Math.PI), m); handle.rotation.z = -Math.PI / 2; handle.position.set(r + 0.002, h * 0.52, 0); g.add(handle);
  g.add(contactShadow(r * 4, r * 4));
  return { group: g };
}

// ---------------------------------------------------------------- the growth screen
// Big monitor on a foot (stand: height of the neck) showing `title` in the top-left corner and a line that
// climbs from left to right through `pts` ([u, v] in 0..1). draw(k, value): k 0..1 of the line drawn, and
// `value` (text such as "+1,9%") printed by the line's head. Origin: floor or table top, centre; faces +z.
// dim(k): the screen goes dark (0 lit, 1 nearly off), when the monitor is only background behind a title.
// API { group, draw(k, value), dim(k), screen, w, h, top }
function makeTrendMonitor({ w = 1.6, h = 0.95, title = "PIB", color = "#3ddc84", stand = 0.32, pts = [[0, 0.12], [0.12, 0.2], [0.24, 0.17], [0.38, 0.3], [0.5, 0.36], [0.62, 0.34], [0.76, 0.5], [0.88, 0.6], [1, 0.74]] } = {}) {
  const g = new THREE.Group(), c = makeCanvas(1000, Math.round(1000 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const frameM = pmat("#151619", { metalness: 0.5, roughness: 0.35 });
  const body = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.07, 0.03), frameM); body.position.set(0, stand + h / 2, 0); g.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, stand + h / 2, 0.036); g.add(screen);
  const neck = new THREE.Mesh(rbox(0.1, stand, 0.06, 0.02), frameM); neck.position.set(0, stand / 2, -0.01); g.add(neck);
  const foot = new THREE.Mesh(rbox(w * 0.36, 0.03, 0.3, 0.012), frameM); foot.position.set(0, 0.015, 0); g.add(foot);
  const W2 = c.width, H2 = c.height, P = pts.map(([u, v]) => [80 + u * (W2 - 200), H2 - 50 - v * (H2 - 210)]);
  let key = "";
  function draw(k, value = "") {
    const kk = Math.round(clamp(k) * 240), id = kk + "|" + value; if (id === key) return; key = id;
    const bg = x.createLinearGradient(0, 0, 0, H2); bg.addColorStop(0, "#0e1a14"); bg.addColorStop(1, "#070b09"); x.fillStyle = bg; x.fillRect(0, 0, W2, H2);
    x.strokeStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 2; for (let yy = 150; yy < H2; yy += 70) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W2, yy); x.stroke(); }
    x.fillStyle = "#ffffff"; x.font = "900 120px Inter"; x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillText(title, 50, 130);
    const seg = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; }
    let left = tot * kk / 240, hx = P[0][0], hy = P[0][1];
    x.strokeStyle = color; x.lineWidth = 14; x.lineJoin = "round"; x.lineCap = "round"; x.beginPath(); x.moveTo(hx, hy);
    for (let i = 1; i < P.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); hx = lerp(P[i - 1][0], P[i][0], f); hy = lerp(P[i - 1][1], P[i][1], f); x.lineTo(hx, hy); left -= seg[i - 1]; }
    x.stroke();
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(hx, hy, 18, 0, Math.PI * 2); x.fill(); x.fillStyle = color; x.beginPath(); x.arc(hx, hy, 10, 0, Math.PI * 2); x.fill();
    if (value) { x.fillStyle = color; x.font = "900 110px Inter"; x.textAlign = "right"; x.fillText(value, W2 - 50, 250); }
    tex.needsUpdate = true;
  }
  draw(0);
  g.add(contactShadow(w * 0.8, 0.6));
  return { group: g, draw, dim(k) { screen.material.color.setScalar(1 - 0.9 * clamp(k)); screen.visible = k < 0.99; }, screen, w, h, top: stand + h + 0.04 };
}
