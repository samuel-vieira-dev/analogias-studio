// ============================================================================
// props/access.js · doors, vaults and keys: a bank vault door and the vault room (backdrop), a steel
// service door with a card reader, the master key card, a wall-mounted control cabinet (the store's
// refrigeration controller), a wifi router, a hotel hall with key-card doors.
// First used in 2026-11-02-hackers-geladeiras-bancos (analogia da chave-mestra).
// ============================================================================

// Brushed steel and dark steel used by every piece here.
const ACCESS_STEEL = () => pmat("#a3aab2", { metalness: 0.92, roughness: 0.32 });
const ACCESS_DARK = () => pmat("#3a3f46", { metalness: 0.7, roughness: 0.38 });

// Steel wall panels with seams and rivets (1 texture tile = one 1.2 m panel).
function accessPanelTex(base = "#4a525c") {
  return cachedTex("access-panel" + base, () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d");
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    speckle(x, 256, 256, 71, 2400, 0.08, 0.05, 1.4);
    const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(0,0,0,0.08)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "rgba(0,0,0,0.55)"; x.fillRect(0, 0, 256, 3); x.fillRect(0, 0, 3, 256);
    x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(0, 3, 256, 1); x.fillRect(3, 0, 1, 256);
    for (let i = 14; i < 256; i += 40) for (const [px, py] of [[i, 12], [i, 244], [12, i], [244, i]]) { x.fillStyle = "rgba(0,0,0,0.4)"; x.beginPath(); x.arc(px + 1, py + 1, 3.5, 0, 6.3); x.fill(); x.fillStyle = "rgba(220,225,230,0.5)"; x.beginPath(); x.arc(px, py, 3, 0, 6.3); x.fill(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Dark polished marble (vault room floor): black-green with pale veins.
function accessMarbleTex() {
  return cachedTex("access-marble", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(83);
    x.fillStyle = "#15191b"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14; i++) { x.strokeStyle = `rgba(200,210,205,${0.05 + r() * 0.12})`; x.lineWidth = 0.6 + r() * 1.8; x.beginPath(); let px = r() * 512, py = r() * 512; x.moveTo(px, py); for (let k = 0; k < 9; k++) { px += (r() - 0.3) * 80; py += (r() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); }
    speckle(x, 512, 512, 83, 3000, 0.1, 0.04, 1.4);
    x.fillStyle = "rgba(0,0,0,0.6)"; x.fillRect(0, 0, 512, 2); x.fillRect(0, 0, 2, 512);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// A flat wall (local x right, y up, faces +z) with holes cut out: [{ circle: [x, y, r] }, { rect: [x, y, w, h] }]
// (centres; rect y is its bottom). The uv is in metres, so tileTex(…, 1/u, 1/v) tiles every u × v metres.
function accessWallWithHoles(w, h, holes, material) {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(w / 2, h), new THREE.Vector2(-w / 2, h)]);
  for (const hl of holes) {
    const p = new THREE.Path();
    if (hl.circle) { const [cx, cy, cr] = hl.circle; p.absarc(cx, cy, cr, 0, Math.PI * 2, true); }
    else { const [cx, by, rw, rh] = hl.rect; p.moveTo(cx - rw / 2, by); p.lineTo(cx - rw / 2, by + rh); p.lineTo(cx + rw / 2, by + rh); p.lineTo(cx + rw / 2, by); p.lineTo(cx - rw / 2, by); }
    shape.holes.push(p);
  }
  return new THREE.Mesh(new THREE.ShapeGeometry(shape, 48), material);
}

// Bank vault door: a round steel door (concentric rings, bolt heads, a combination dial, a four-spoke wheel
// on the hub) hung on a big hinge at its right edge, in front of a square steel frame with a round opening
// and a short lit tunnel behind it (gold light inside). Locking bolts stick out of the door's edge and
// retract as it opens. Origin: floor centre of the frame; faces +z; the opening's centre is at (0, cy).
// API { group, pivot, wheel, open(k), spin(a), glow(k), cy, r, top, w }
//   open(0) closed, open(1) swung out towards the camera (≈110°); spin(a) turns the wheel; glow(k) the inside.
function makeVaultDoor({ r = 1.0, depth = 0.34 } = {}) {
  const g = new THREE.Group(), steel = ACCESS_STEEL(), dark = ACCESS_DARK(), fw = 2 * r + 0.6, cy = r + 0.36;
  // frame: a square plate with the round opening, extruded, on a plinth
  const fs = new THREE.Shape([new THREE.Vector2(-fw / 2, -fw / 2), new THREE.Vector2(fw / 2, -fw / 2), new THREE.Vector2(fw / 2, fw / 2), new THREE.Vector2(-fw / 2, fw / 2)]);
  const hole = new THREE.Path(); hole.absarc(0, 0, r + 0.03, 0, Math.PI * 2, true); fs.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.24, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2, curveSegments: 64 }), dark);
  frame.position.set(0, cy, -0.26); g.add(frame);
  const plinth = new THREE.Mesh(rbox(fw + 0.1, cy - fw / 2 + 0.02, 0.4, 0.02), dark); plinth.position.set(0, (cy - fw / 2) / 2, -0.12); g.add(plinth);
  // the tunnel behind the opening and the lit back (gold shelves glow)
  const tun = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 1.3, 48, 1, true), pmat("#7d858e", { metalness: 0.9, roughness: 0.4, side: THREE.BackSide }));
  tun.rotation.x = Math.PI / 2; tun.position.set(0, cy, -0.26 - 0.65); tun.userData.noShadow = true; g.add(tun);
  const gc = makeCanvas(256, 256), gx = gc.getContext("2d"); gx.fillStyle = "#3a2a12"; gx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 4; row++) { gx.fillStyle = "#1c140a"; gx.fillRect(0, 50 + row * 52, 256, 6); for (let k = 0; k < 7; k++) { gx.fillStyle = k % 2 ? "#e2b54a" : "#c99a35"; gx.fillRect(16 + k * 34, 26 + row * 52, 28, 22); } }
  const backM = new THREE.MeshBasicMaterial({ map: texFrom(gc), color: "#000000", toneMapped: false });
  const backP = new THREE.Mesh(new THREE.CircleGeometry(r + 0.02, 48), backM); backP.position.set(0, cy, -1.55); g.add(backP);
  const inLight = new THREE.PointLight("#ffc46a", 0, 4, 1.4); inLight.position.set(0, cy, -0.9); g.add(inLight);
  // hinge barrels on the frame's right side
  for (const s of [-1, 1]) { const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 24), steel); hb.position.set(r + 0.14, cy + s * r * 0.5, 0.08); g.add(hb); }
  // door: a front slab wider than the opening (it rests on the frame's face) and a narrower plug that sits
  // inside the opening, so the door clears the frame as it swings out on the hinge in front
  const pivot = new THREE.Group(); pivot.position.set(r + 0.14, cy, 0.08); g.add(pivot);
  const dg = new THREE.Group(); dg.position.set(-(r + 0.14), 0, 0); pivot.add(dg);
  const R = r + 0.12, slabT = 0.12, plugT = Math.max(0.12, depth - slabT);
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(R, R, slabT, 72), steel); slab.rotation.x = Math.PI / 2; slab.position.z = -0.07 + slabT / 2; dg.add(slab);
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.1, r - 0.1, plugT, 64), dark); plug.rotation.x = Math.PI / 2; plug.position.z = -0.07 - plugT / 2; dg.add(plug);
  const face = -0.07 + slabT + 0.002;
  for (const [rr, tt] of [[R * 0.93, 0.022], [R * 0.62, 0.03], [R * 0.3, 0.02]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, tt, 12, 72), dark); ring.position.z = face; dg.add(ring); }
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), dark); b.rotation.x = Math.PI / 2; b.position.set(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78, face + 0.012); dg.add(b); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.17, r * 0.19, 0.1, 40), dark); hub.rotation.x = Math.PI / 2; hub.position.z = face + 0.05; dg.add(hub);
  const wheel = new THREE.Group(); wheel.position.z = face + 0.14; dg.add(wheel);
  for (let i = 0; i < 4; i++) {
    const sp = new THREE.Group(); sp.rotation.z = (i / 4) * Math.PI * 2 + Math.PI / 4; wheel.add(sp);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, r * 0.5, 16), steel); rod.position.y = r * 0.25; sp.add(rod);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), steel); knob.position.y = r * 0.5; sp.add(knob);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 32), steel); cap.rotation.x = Math.PI / 2; wheel.add(cap);
  const dc = makeCanvas(128, 128), dx = dc.getContext("2d"); dx.fillStyle = "#20242a"; dx.fillRect(0, 0, 128, 128); dx.strokeStyle = "#d9dde2"; dx.lineWidth = 3;
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, l = i % 5 ? 8 : 16; dx.beginPath(); dx.moveTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); dx.lineTo(64 + Math.cos(a) * (58 - l), 64 + Math.sin(a) * (58 - l)); dx.stroke(); }
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.12, R * 0.12, 0.05, 40), [steel, pmat("#ffffff", { map: texFrom(dc), metalness: 0.6, roughness: 0.4 }), steel]);
  dial.rotation.x = Math.PI / 2; dial.position.set(R * 0.46, R * 0.42, face + 0.025); dg.add(dial);
  // locking bolts around the plug: out into the frame when locked, pulled in as the door opens
  const bolts = [], boltZ = -0.07 - plugT * 0.5;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2, b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16), steel); b.rotation.z = a - Math.PI / 2; dg.add(b); bolts.push({ b, a }); }
  const setBolts = (k) => bolts.forEach(({ b, a }) => { const rr = r - 0.1 + 0.02 - 0.1 * clamp(k * 4); b.position.set(Math.cos(a) * rr, Math.sin(a) * rr, boltZ); });
  setBolts(0);
  // hinge arms (move with the door)
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(rbox(0.36, 0.16, 0.1, 0.03), steel); arm.position.set(-0.16, s * r * 0.5, 0.0); pivot.add(arm); }
  g.add(contactShadow(fw + 1, 1.6));
  return {
    group: g, pivot, wheel, cy, r, top: cy + fw / 2 + 0.025, w: fw,
    open: (k) => { const kk = clamp(k); pivot.rotation.y = 1.9 * kk; setBolts(kk); },
    spin: (a) => { wheel.rotation.z = a; },
    glow: (k) => { backM.color.set("#ffffff").multiplyScalar(0.15 + 0.85 * clamp(k)); inLight.intensity = 3 * clamp(k); },
  };
}

// Vault room behind the hero (backdrop): a wall of riveted steel panels with the openings cut for the
// vault door (and an optional service door), walls of safe-deposit boxes on both sides, a polished dark
// marble floor, a ceiling of spotlights with visible beams, a security camera and a red rotating beacon.
// holes: [{ circle: [x, y, r] }, { rect: [x, bottomY, w, h] }] in wall coordinates (x, y; the wall at wallZ).
// API { group, update(t), beacon(k), lights(k) }
function makeVaultRoom({ wallZ = -0.3, holes = [{ circle: [0, 1.36, 1.03] }], ceil = 5.2, seed = 6 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), W = 24;
  const wall = accessWallWithHoles(W, ceil, holes, mat("#ffffff", { map: tileTex(accessPanelTex("#2f3c4a"), 1 / 1.2, 1 / 1.2), metalness: 0.55, roughness: 0.4 })); wall.position.z = wallZ; g.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 20), pmat("#ffffff", { map: tileTex(accessMarbleTex(), W / 2, 10), roughness: 0.38, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.003, wallZ + 10); g.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, 20), mat("#1d2024", { roughness: 0.9 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, wallZ + 10); g.add(cl);
  // safe-deposit boxes: grids of small steel doors with a brass lock each, both sides of the opening
  const boxes = [], bw = 0.42, bh = 0.3;
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) for (let j = 0; j < 12; j++) boxes.push([s * (2.3 + i * bw), 0.35 + j * bh]);
  const bm = new THREE.InstancedMesh(rbox(bw - 0.03, bh - 0.03, 0.04, 0.01), pmat("#b48a45", { metalness: 0.95, roughness: 0.32 }), boxes.length);
  const lk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), pmat("#2a2118", { metalness: 0.6, roughness: 0.4 }), boxes.length), o = new THREE.Object3D();
  boxes.forEach(([x, y], i) => { o.rotation.set(0, 0, 0); o.position.set(x, y, wallZ + 0.03); o.updateMatrix(); bm.setMatrixAt(i, o.matrix); o.rotation.set(Math.PI / 2, 0, 0); o.position.set(x + bw * 0.3, y, wallZ + 0.06); o.updateMatrix(); lk.setMatrixAt(i, o.matrix); });
  g.add(bm, lk);
  // spotlights in the ceiling with beams down to the floor
  const spotM = new THREE.MeshBasicMaterial({ color: "#fff1dc", toneMapped: false }), beams = [];
  for (const x of [-3.2, 0, 3.2]) for (const z of [1.2, 4.2]) {
    const sp = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), spotM); sp.rotation.x = Math.PI / 2; sp.position.set(x, ceil - 0.01, wallZ + z); g.add(sp);
    const bmS = makeLightShaft([x, ceil - 0.02, wallZ + z], [x, 0.05, wallZ + z + 0.4], { w0: 0.3, w1: 1.6, color: "#ffd9a0", opacity: 0.15 }); g.add(bmS.group); beams.push(bmS);
    const pool = makeFloorGlow(1.8, 1.8, { color: "#ffd9a0", opacity: 0.2 }); pool.position.set(x, 0.008, wallZ + z + 0.4); g.add(pool);
  }
  const cornM = new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false }); const corn = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, 0.05), cornM); corn.position.set(0, ceil - 0.35, wallZ + 0.05); g.add(corn);
  const washG = makeFloorGlow(W, 2.4, { color: "#ffcf8a", opacity: 0.12 }); washG.rotation.x = 0; washG.position.set(0, ceil - 1.4, wallZ + 0.04); g.add(washG);   // the cornice light grazing the wall
  // security camera high on the left, red beacon high on the right
  const camG = new THREE.Group(); camG.position.set(-2.0, ceil - 0.9, wallZ + 0.05); g.add(camG);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), ACCESS_DARK()); arm.rotation.x = Math.PI / 2; arm.position.z = 0.15; camG.add(arm);
  const body = new THREE.Mesh(rbox(0.16, 0.14, 0.42, 0.03), pmat("#e8e8e4", { roughness: 0.4 })); body.position.set(0, -0.04, 0.42); body.rotation.x = 0.35; camG.add(body);
  const camLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false })); camLed.position.set(0.05, -0.0, 0.64); camG.add(camLed);
  const bcn = new THREE.Group(); bcn.position.set(2.0, ceil - 0.7, wallZ + 0.12); g.add(bcn);
  const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.08, 24), ACCESS_DARK()); bcn.add(bBase);
  const domeM = new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false, transparent: true, opacity: 0.9 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeM); dome.position.y = 0.04; bcn.add(dome);
  const halo = sprite(BOKEH, 1.8); halo.material.color.set("#ff2a1a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(2.0, ceil - 0.62, wallZ + 0.3); g.add(halo);
  const red = new THREE.PointLight("#ff2a1a", 0, 9, 1.4); red.position.set(2.0, ceil - 1.0, wallZ + 1.2); g.add(red);
  const sweep = makeLightShaft([2.0, ceil - 0.66, wallZ + 0.2], [0, ceil - 1.4, wallZ + 2.5], { w0: 0.2, w1: 2.2, color: "#ff3a2a", opacity: 0.2 }); g.add(sweep.group);
  const motes = makeSetMotes(160, [[-4, 0.3, wallZ + 0.2], [4, 4.6, wallZ + 5]], { color: "#ffe6c2", seed: seed + 5, opacity: 0.35 }); g.add(motes.points);
  asBackdrop(g);
  let bk = 0, lastT = 0;
  const applyBeacon = () => { const a = lastT * 5.5, f = Math.max(0, Math.cos(a)); domeM.opacity = 0.35 + 0.65 * bk; halo.material.opacity = bk * (0.3 + 0.7 * f); red.intensity = 4 * bk * (0.25 + 0.75 * f); sweep.group.rotation.y = a; sweep.set(bk * (0.3 + 0.7 * f)); };
  return {
    group: g,
    update(t) { lastT = t; motes.update(t); applyBeacon(); camLed.visible = Math.floor(t * 2) % 2 === 0; },
    beacon(k) { bk = clamp(k); applyBeacon(); },
    lights(k) { spotM.color.set("#fff1dc").multiplyScalar(0.1 + 0.9 * clamp(k)); beams.forEach((b) => b.set(clamp(k))); },
  };
}

// Steel service door in a frame, with a card reader on the wall to its right (black box, card slot on top,
// LED). The leaf hinges on the left and swings out towards +z; behind it a short lit passage (warm light)
// and a pool of light spilling on the floor as it opens. Pair it with makeVaultRoom({ holes: [..., { rect }] }).
// Origin: floor centre of the doorway, on the wall plane; faces +z.
// API { group, leaf, open(k), led(color), slot (local V3: the top of the reader), w, h }
function makeServiceDoor({ w = 0.86, h = 2.05 } = {}) {
  const g = new THREE.Group(), dark = ACCESS_DARK();
  for (const [bw, bh, x, y] of [[w + 0.16, 0.08, 0, h + 0.04], [0.08, h, -w / 2 - 0.04, h / 2], [0.08, h, w / 2 + 0.04, h / 2]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.12, 0.015), dark); b.position.set(x, y, 0.02); g.add(b); }
  const pass = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), pmat("#6f6658", { roughness: 0.8, side: THREE.BackSide })); pass.position.set(0, h / 2, -0.62); pass.userData.noShadow = true; g.add(pass);
  const glowM = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }); const end = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glowM); end.position.set(0, h / 2, -1.2); g.add(end);
  const inLight = new THREE.PointLight("#ffcf8a", 0, 3, 1.4); inLight.position.set(0, h * 0.7, -0.5); g.add(inLight);
  const leaf = new THREE.Group(); leaf.position.set(-w / 2, 0, 0.02); g.add(leaf);
  const lm = pmat("#7c848d", { metalness: 0.85, roughness: 0.36 });
  const slab = new THREE.Mesh(rbox(w - 0.01, h - 0.01, 0.05, 0.01), lm); slab.position.set(w / 2, h / 2, 0); leaf.add(slab);
  for (const yy of [0.55, 1.45]) { const p = new THREE.Mesh(rbox(w * 0.75, 0.55, 0.012, 0.01), pmat("#6c737b", { metalness: 0.85, roughness: 0.4 })); p.position.set(w / 2, yy, 0.03); leaf.add(p); }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 12), ACCESS_STEEL()); bar.position.set(w - 0.1, 1.02, 0.07); leaf.add(bar);
  for (const yy of [-0.13, 0.13]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.05), ACCESS_STEEL()); st.position.set(w - 0.1, 1.02 + yy, 0.045); leaf.add(st); }
  // card reader beside the door
  const rd = new THREE.Group(); rd.position.set(w / 2 + 0.28, 1.12, 0.03); g.add(rd);
  const rbody = new THREE.Mesh(rbox(0.14, 0.24, 0.06, 0.012), pmat("#16181b", { roughness: 0.35, clearcoat: 0.6 })); rbody.position.z = 0.03; rd.add(rbody);
  const slotM = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.02), pmat("#050505", { roughness: 0.8 })); slotM.position.set(0, 0.121, 0.03); rd.add(slotM);
  const ledM = new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false }); const led = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.016, 0.004), ledM); led.position.set(0, -0.07, 0.062); rd.add(led);
  const ledH = sprite(BOKEH, 0.22); ledH.material.color.set("#ff2a1a"); ledH.material.blending = THREE.AdditiveBlending; ledH.userData.decor = true; ledH.position.set(0, -0.07, 0.07); rd.add(ledH);
  const spill = makeFloorGlow(1.6, 1.8, { color: "#ffcf8a", opacity: 0 }); spill.position.set(0, 0.009, 0.8); g.add(spill);
  return {
    group: g, leaf, w, h, slot: new V3(w / 2 + 0.28, 1.12 + 0.121, 0.06),
    open: (k) => { const kk = clamp(k); leaf.rotation.y = -1.25 * kk; glowM.color.set("#ffcf8a").multiplyScalar(kk); inLight.intensity = 2.5 * kk; spill.material.opacity = 0.3 * kk; },
    led: (c) => { ledM.color.set(c); ledH.material.color.set(c); },
  };
}

// Master key card, oversized to read on screen: pearl-white card with a gold stripe, a contactless mark and
// the label printed big ("CHAVE-MESTRA"). Faces +z, upright. Origin: centre. API { group, label, w, h }
function makeKeycard({ label = "CHAVE-MESTRA", w = 0.5, color = "#f1ece2" } = {}) {
  const g = new THREE.Group(), h = w * 0.63, t = 0.014;
  const c = makeCanvas(512, 324), x = c.getContext("2d");
  x.fillStyle = color; x.fillRect(0, 0, 512, 324);
  const gr = x.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, "#b8862e"); gr.addColorStop(0.5, "#f0cf6a"); gr.addColorStop(1, "#b8862e"); x.fillStyle = gr; x.fillRect(0, 22, 512, 44);
  x.strokeStyle = "#8a6a2a"; x.lineWidth = 9; x.lineCap = "round"; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(420, 150, 18 + i * 20, -0.75, 0.75); x.stroke(); }
  x.fillStyle = "#d8b45a"; roundRect(x, 36, 112, 72, 56, 10); x.fill(); x.strokeStyle = "rgba(90,60,20,0.6)"; x.lineWidth = 2; x.strokeRect(54, 112, 36, 56); x.beginPath(); x.moveTo(36, 140); x.lineTo(108, 140); x.stroke();
  const faceM = pmat("#ffffff", { map: texFrom(c), roughness: 0.28, clearcoat: 1 }), edge = pmat(color, { roughness: 0.3 });
  const body = new THREE.Mesh(rbox(w, h, t, 0.008), [edge, edge, edge, edge, faceM, edge]); g.add(body);
  const lb = makePlate(label, w * 0.9, h * 0.26, { bg: "#1b1610", fg: "#f0cf6a", depth: 0.003 }); lb.position.set(0, -h * 0.28, t / 2 + 0.0016); g.add(lb);
  return { group: g, label: lb, w, h };
}

// Wall-mounted control cabinet (the store's refrigeration controller): light-grey steel box with a door
// seam, a live screen (640×432 canvas), a printed name plate, a row of status LEDs, a small keypad, three
// cable glands underneath and a staple near the door's right edge for a padlock. dust(k) lays a grey film
// over the front (an old, forgotten box). Origin: centre of the back face (on the wall); faces +z.
// API { group, paint(fn), led(i, color), dust(k), gland(i) → local V3, hasp → local V3, w, h, d }
//   hasp: the point inside the staple where a padlock's shackle top goes (makePadlock({ s }) hangs with
//   its origin at hasp - (0, 0.66 * s, 0)).
function makeControlCabinet({ w = 0.95, h = 1.2, d = 0.3, name = "CENTRAL" } = {}) {
  const g = new THREE.Group(), grey = pmat("#b4b8bc", { metalness: 0.55, roughness: 0.42 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.03), grey); body.position.z = d / 2; g.add(body);
  const doorP = new THREE.Mesh(rbox(w - 0.05, h - 0.05, 0.02, 0.012), pmat("#c3c7cb", { metalness: 0.5, roughness: 0.4 })); doorP.position.z = d + 0.004; g.add(doorP);
  const sy = h * 0.1;   // screen centre; the name plate sits above it, under the top edge
  const bez = new THREE.Mesh(rbox(0.7, 0.5, 0.02, 0.015), pmat("#14161a", { roughness: 0.3, clearcoat: 0.6 })); bez.position.set(0, sy, d + 0.016); g.add(bez);
  const c = makeCanvas(640, 432), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.432), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, sy, d + 0.027); g.add(scr);
  const np = makePlate(name, Math.min(0.8, w - 0.1), 0.2, { bg: "#22262c", fg: "#ffffff", depth: 0.006 }); np.position.set(0, sy + 0.25 + 0.115, d + 0.017); g.add(np);
  const leds = [];
  for (let i = 0; i < 4; i++) { const m = new THREE.MeshBasicMaterial({ color: "#2fe37a", toneMapped: false }); const l = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), m); l.position.set(-0.27 + i * 0.07, -h * 0.26, d + 0.018); g.add(l); leds.push(m); }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const k = new THREE.Mesh(rbox(0.05, 0.04, 0.012, 0.006), pmat("#2a2e34", { roughness: 0.5 })); k.position.set(0.12 + i * 0.065, -h * 0.2 - j * 0.055, d + 0.02); g.add(k); }
  const glands = [];
  for (let i = 0; i < 3; i++) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16), pmat("#1b1d20", { roughness: 0.6 })); gl.position.set(-0.25 + i * 0.25, -h / 2 - 0.02, d * 0.55); g.add(gl); glands.push(new V3(-0.25 + i * 0.25, -h / 2 - 0.045, d * 0.55)); }
  // staple near the door's right edge: a steel half-ring standing out of the door (+z), for a padlock to hang on
  const hsx = w / 2 - 0.09, hsy = -0.08;
  const hplate = new THREE.Mesh(rbox(0.07, 0.17, 0.012, 0.004), ACCESS_STEEL()); hplate.position.set(hsx, hsy, d + 0.02); g.add(hplate);
  const hp = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 24, Math.PI), ACCESS_STEEL()); hp.rotation.set(0, -Math.PI / 2, -Math.PI / 2); hp.position.set(hsx, hsy, d + 0.026); g.add(hp);
  // dust film over the door: grime, streaks and cobweb corners; the screen and the name plate stay clear
  const dc = makeCanvas(256, 320), dxc = dc.getContext("2d"), rr = mulberry32(91);
  for (let i = 0; i < 3200; i++) { dxc.fillStyle = `rgba(${110 + rr() * 40},${100 + rr() * 30},${85 + rr() * 25},${0.1 + rr() * 0.3})`; const s = 1 + rr() * 4; dxc.fillRect(rr() * 256, rr() * 320, s, s); }
  for (let i = 0; i < 6; i++) { dxc.strokeStyle = "rgba(90,80,70,0.35)"; dxc.lineWidth = 2 + rr() * 3; dxc.beginPath(); const sx = rr() * 256; dxc.moveTo(sx, 0); dxc.lineTo(sx + (rr() - 0.5) * 30, 150 + rr() * 160); dxc.stroke(); }
  dxc.strokeStyle = "rgba(220,215,205,0.5)"; dxc.lineWidth = 1; for (const [cx, cy, a0] of [[0, 0, 0], [256, 0, Math.PI / 2]]) for (let k = 1; k < 5; k++) { dxc.beginPath(); dxc.arc(cx, cy, k * 12, a0, a0 + Math.PI / 2); dxc.stroke(); }
  const toPx = (lx, ly) => [(lx / (w - 0.02) + 0.5) * 256, (0.5 - ly / (h - 0.02)) * 320];
  for (const [cx, cy, hw, hh] of [[0, sy, 0.35, 0.25], [0, sy + 0.365, 0.41, 0.11]]) { const [x0, y0] = toPx(cx - hw, cy + hh), [x1, y1] = toPx(cx + hw, cy - hh); dxc.clearRect(x0, y0, x1 - x0, y1 - y0); }
  const dustM = new THREE.MeshBasicMaterial({ map: texFrom(dc), transparent: true, opacity: 0, depthWrite: false });
  const dust = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), dustM); dust.position.z = d + 0.031; dust.userData.decor = true; g.add(dust);
  return {
    group: g, w, h, d, glands, hasp: new V3(hsx, hsy, d + 0.055),
    paint: (fn) => { fn(x, 640, 432); tex.needsUpdate = true; },
    led: (i, col) => { leds[i].color.set(col); },
    dust: (k) => { dustM.opacity = 0.75 * clamp(k); },
    gland: (i) => glands[i].clone(),
  };
}

// Wifi router: black box, two antennas, four front LEDs; three orange arcs above it pulse (the signal).
// Origin: bottom centre; faces +z. API { group, blink(t), waves(k, t) }
function makeWifiRouter({ s = 1 } = {}) {
  const g = new THREE.Group(), blk = pmat("#17191c", { roughness: 0.35, clearcoat: 0.6 });
  const body = new THREE.Mesh(rbox(0.4 * s, 0.07 * s, 0.26 * s, 0.02 * s), blk); body.position.y = 0.035 * s; g.add(body);
  for (const sx of [-1, 1]) { const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * s, 0.016 * s, 0.32 * s, 12), blk); ant.position.set(sx * 0.15 * s, 0.2 * s, -0.1 * s); ant.rotation.z = -sx * 0.18; g.add(ant); }
  const leds = [];
  for (let i = 0; i < 4; i++) { const m = new THREE.MeshBasicMaterial({ color: "#3cff7a", toneMapped: false }); const l = new THREE.Mesh(new THREE.BoxGeometry(0.02 * s, 0.008 * s, 0.004), m); l.position.set((-0.09 + i * 0.06) * s, 0.04 * s, 0.131 * s); g.add(l); leds.push(m); }
  const arcs = [];
  for (let i = 0; i < 3; i++) { const m = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false, transparent: true, opacity: 0.9, depthWrite: false }); const a = new THREE.Mesh(new THREE.TorusGeometry((0.1 + i * 0.09) * s, 0.012 * s, 8, 32, Math.PI / 2), m); a.rotation.z = Math.PI / 4; a.position.y = 0.36 * s; a.userData.decor = true; g.add(a); arcs.push(m); }
  return {
    group: g,
    blink: (t) => leds.forEach((m, i) => m.color.set(Math.sin(t * (7 + i * 3) + i) > 0 ? "#3cff7a" : "#0e3a1c")),
    waves: (k, t) => arcs.forEach((m, i) => { m.opacity = clamp(k) * (0.25 + 0.75 * Math.max(0, Math.sin(t * 6 - i * 1.1))); }),
  };
}

// Hotel carpet (burgundy with gold diamonds) and wallpaper (warm stripes) for makeHotelHall.
function hotelCarpetTex() {
  return cachedTex("hotel-carpet", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"); x.fillStyle = "#5a1a1e"; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(214,170,90,0.55)"; x.lineWidth = 3;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const cx = 64 + i * 128, cy = 64 + j * 128; x.beginPath(); x.moveTo(cx, cy - 46); x.lineTo(cx + 46, cy); x.lineTo(cx, cy + 46); x.lineTo(cx - 46, cy); x.closePath(); x.stroke(); x.fillStyle = "rgba(214,170,90,0.4)"; x.beginPath(); x.arc(cx, cy, 8, 0, 6.3); x.fill(); }
    speckle(x, 256, 256, 51, 4000, 0.12, 0.04, 1.4);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function hotelWallpaperTex() {
  return cachedTex("hotel-wallpaper", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"); x.fillStyle = "#b9a47e"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 32) { x.fillStyle = "rgba(255,240,210,0.16)"; x.fillRect(i, 0, 12, 256); x.fillStyle = "rgba(90,60,30,0.08)"; x.fillRect(i + 14, 0, 2, 256); }
    speckle(x, 256, 256, 53, 2000, 0.05, 0.04, 1.2);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Hotel room door: wood casing, a panelled leaf (hinged on the left, opening into the room, -z), a lever
// handle and a black card lock with an LED strip above it; the room behind glows warm when it opens.
// Origin: floor centre on the wall plane; faces +z. API { group, leaf, open(k), led(color), lock (local V3) }
function makeHotelDoor({ w = 0.95, h = 2.1 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#3d2516"), roughness: 0.38, clearcoat: 0.5 });
  for (const [bw, bh, x, y] of [[w + 0.24, 0.1, 0, h + 0.05], [0.1, h, -w / 2 - 0.05, h / 2], [0.1, h, w / 2 + 0.05, h / 2]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.06, 0.012), wood); b.position.set(x, y, 0.03); g.add(b); }
  // the room behind is deeper than the leaf is wide, so the opened leaf never reaches its lit back wall
  const room = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, h, 1.3), pmat("#5a4636", { roughness: 0.9, side: THREE.BackSide })); room.position.set(0.3, h / 2, -0.67); room.userData.noShadow = true; g.add(room);
  const rgM = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }); const rg = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.6, h), rgM); rg.position.set(0.3, h / 2, -1.31); g.add(rg);
  const bed = new THREE.Group(); bed.position.set(0.45, 0, -0.85); g.add(bed);
  const frameB = new THREE.Mesh(rbox(0.9, 0.3, 0.75, 0.03), pmat("#3d2516", { roughness: 0.5 })); frameB.position.y = 0.15; bed.add(frameB);
  const duvet = new THREE.Mesh(rbox(0.92, 0.16, 0.72, 0.06), pmat("#f1ede6", { roughness: 0.9 })); duvet.position.y = 0.36; bed.add(duvet);
  const head = new THREE.Mesh(rbox(1.0, 0.7, 0.06, 0.03), pmat("#6a3b2a", { roughness: 0.7 })); head.position.set(0, 0.5, -0.38); bed.add(head);
  const lampM = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }); const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.16, 16), lampM); lamp.position.set(-0.5, 0.75, -0.3); bed.add(lamp);
  const leaf = new THREE.Group(); leaf.position.set(-w / 2, 0, 0); g.add(leaf);
  const slab = new THREE.Mesh(rbox(w - 0.01, h - 0.01, 0.045, 0.008), wood); slab.position.set(w / 2, h / 2, 0); leaf.add(slab);
  for (const yy of [0.5, 1.5]) { const p = new THREE.Mesh(rbox(w * 0.66, 0.66, 0.012, 0.01), wood); p.position.set(w / 2, yy, 0.026); leaf.add(p); }
  const brass = pmat("#c9a24e", { metalness: 1, roughness: 0.28 });
  const lever = new THREE.Mesh(rbox(0.14, 0.025, 0.025, 0.01), brass); lever.position.set(w - 0.15, 1.0, 0.06); leaf.add(lever);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), brass); rose.rotation.x = Math.PI / 2; rose.position.set(w - 0.09, 1.0, 0.032); leaf.add(rose);
  const lockB = new THREE.Mesh(rbox(0.075, 0.2, 0.035, 0.01), pmat("#141518", { roughness: 0.3, clearcoat: 0.7 })); lockB.position.set(w - 0.09, 1.2, 0.04); leaf.add(lockB);
  const ledM = new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false }); const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.004), ledM); led.position.set(w - 0.09, 1.27, 0.059); leaf.add(led);
  const ledH = sprite(BOKEH, 0.16); ledH.material.color.set("#ff2a1a"); ledH.material.blending = THREE.AdditiveBlending; ledH.userData.decor = true; ledH.position.set(w - 0.09, 1.27, 0.066); leaf.add(ledH);
  const plaque = new THREE.Mesh(rbox(0.16, 0.08, 0.01, 0.006), brass); plaque.position.set(w / 2, 1.62, 0.03); leaf.add(plaque);
  return {
    group: g, leaf, lock: new V3(w / 2 - 0.09, 1.2, 0.06),
    open: (k) => { const kk = clamp(k); leaf.rotation.y = 1.15 * kk; rgM.color.set("#ffc27a").multiplyScalar(0.7 * kk); lampM.color.set("#ffe2a8").multiplyScalar(kk); },
    led: (c) => { ledM.color.set(c); ledH.material.color.set(c); },
  };
}
// Hotel hall seen from across: the doors stand side by side on the back wall (facing +z), brass sconces
// between them, a patterned carpet with a runner, a ceiling of recessed downlights with pools of light on
// the carpet, and a window with the city at night at each far end. The `heroN` doors in the middle are built
// apart (not backdrop) and returned in `doors` so the scene can register them; `allDoors` lists every door
// with its x. Each door: makeHotelDoor. API { group, heroGroup, doors, allDoors: [{ d, x }], update(t), lights(k) }
function makeHotelHall({ n = 8, spacing = 1.65, wallZ = -0.4, ceil = 3.0, heroN = 2, seed = 5 } = {}) {
  const g = new THREE.Group(), heroGroup = new THREE.Group(), W = n * spacing + 6, D = 16;
  const doorW = 0.95, doorH = 2.1, xs = [...Array(n)].map((_, i) => (i - (n - 1) / 2) * spacing);
  const h0 = Math.floor((n - heroN) / 2);
  const wall = accessWallWithHoles(W, ceil, xs.map((x) => ({ rect: [x, 0, doorW + 0.02, doorH + 0.02] })), mat("#ffffff", { map: tileTex(hotelWallpaperTex(), 1 / 1.4, 1 / 1.4), roughness: 0.85 }));
  wall.position.z = wallZ; g.add(wall);
  const wood = pmat("#ffffff", { map: woodTex("#3a2416"), roughness: 0.45, clearcoat: 0.4 });
  // wainscot and chair rail in pieces between the door casings (never across a doorway)
  const edges = [-W / 2].concat(...xs.map((x) => [x - doorW / 2 - 0.12, x + doorW / 2 + 0.12]), [W / 2]);
  for (let i = 0; i < edges.length; i += 2) {
    const a = edges[i], b = edges[i + 1], seg = b - a, mid = (a + b) / 2; if (seg < 0.02) continue;
    const wain = new THREE.Mesh(new THREE.BoxGeometry(seg, 0.9, 0.03), wood); wain.position.set(mid, 0.45, wallZ + 0.015); g.add(wain);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(seg, 0.05, 0.05), wood); rail.position.set(mid, 0.92, wallZ + 0.025); g.add(rail);
  }
  const allDoors = [], doors = [];
  xs.forEach((x, i) => {
    const dr = makeHotelDoor({ w: doorW, h: doorH }); dr.group.position.set(x, 0, wallZ);
    if (i >= h0 && i < h0 + heroN) { heroGroup.add(dr.group); doors.push(dr); } else g.add(dr.group);
    allDoors.push({ d: dr, x });
  });
  // sconces between the doors: brass back plate, a glowing shade, a halo on the wallpaper
  for (let i = 0; i <= n; i++) {
    const x = (i - n / 2) * spacing, sc = new THREE.Group(); sc.position.set(x, 1.8, wallZ + 0.02); g.add(sc);
    const bp = new THREE.Mesh(rbox(0.1, 0.2, 0.04, 0.01), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); sc.add(bp);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.16, 20, 1, true), new THREE.MeshBasicMaterial({ color: "#ffd59a", toneMapped: false, side: THREE.DoubleSide })); shade.position.set(0, 0.05, 0.12); sc.add(shade);
    const hl = sprite(BOKEH, 0.9); hl.material.color.set("#ffc27a"); hl.material.blending = THREE.AdditiveBlending; hl.material.opacity = 0.55; hl.position.set(0, 0.1, 0.1); sc.add(hl);
    const wash = makeLightShaft([x, 1.95, wallZ + 0.05], [x, ceil - 0.02, wallZ + 0.05], { w0: 0.25, w1: 0.9, color: "#ffc27a", opacity: 0.12 }); g.add(wash.group);
  }
  const cp = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat("#ffffff", { map: tileTex(hotelCarpetTex(), W / 1.1, D / 1.1), roughness: 1 })); cp.rotation.x = -Math.PI / 2; cp.position.set(0, 0.003, wallZ + D / 2); g.add(cp);
  const run = new THREE.Mesh(new THREE.PlaneGeometry(W, 1.3), mat("#3a1013", { roughness: 1 })); run.rotation.x = -Math.PI / 2; run.position.set(0, 0.006, wallZ + 2.4); g.add(run);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.06), mat("#c9a24e", { roughness: 0.6 })); st.rotation.x = -Math.PI / 2; st.position.set(0, 0.007, wallZ + 2.4 + s * 0.6); g.add(st); }
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat("#d9cdb8", { roughness: 0.9 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, wallZ + D / 2); g.add(cl);
  const downM = new THREE.MeshBasicMaterial({ color: "#fff0d6", toneMapped: false }), pools = [];
  for (let x = -W / 2 + 1; x < W / 2; x += 1.65) for (const z of [1.2, 3.6, 6.0]) { const dl = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), downM); dl.rotation.x = Math.PI / 2; dl.position.set(x, ceil - 0.01, wallZ + z); g.add(dl); const pool = makeFloorGlow(1.5, 1.3, { color: "#ffd9a8", opacity: 0.14 }); pool.position.set(x, 0.01, wallZ + z); g.add(pool); pools.push(pool); }
  const wins = [];
  for (const s of [-1, 1]) { const win = makeSetWindow(1.3, 1.7, { seed: seed + (s > 0 ? 1 : 0) }); win.group.position.set(s * (W / 2 - 1.2), 1.6, wallZ); g.add(win.group); wins.push(win); }
  const motes = makeSetMotes(140, [[-W / 3, 0.3, wallZ + 0.2], [W / 3, ceil - 0.2, wallZ + 4]], { color: "#ffe2c0", seed: seed + 2, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  return {
    group: g, heroGroup, doors, allDoors,
    update(t) { motes.update(t); },
    lights(k) { downM.color.set("#fff0d6").multiplyScalar(0.15 + 0.85 * clamp(k)); pools.forEach((p) => { p.material.opacity = 0.14 * clamp(k); }); wins.forEach((w) => w.set(0.6 + 0.4 * clamp(k))); },
  };
}

// A hand holding a key card between thumb and fingers (a pinch grip), the forearm in a dark jacket sleeve
// with a white cuff going off to the right and towards the camera. The card is part of it: it never floats.
// Real hand size at s = 1 (palm ~9 cm). Origin: the card's centre; the card faces +z.
// API { group, card (makeKeycard), w }
function makeHoldingHand({ s = 1.5, cardW = 0.16, skin = "#c8977a", sleeve = "#34405a" } = {}) {
  const g = new THREE.Group(), card = makeKeycard({ w: cardW }); g.add(card.group);
  const skm = pmat(skin, { roughness: 0.55, sheen: 0.25, sheenColor: new THREE.Color("#ffd2b8") });
  const cap = (r, l) => new THREE.Mesh(new THREE.CapsuleGeometry(r * s, l * s, 8, 14), skm);
  const hand = new THREE.Group(); hand.position.set(cardW / 2 - 0.012 * s, -card.h * 0.05, 0); hand.rotation.z = -0.12; g.add(hand);
  const palm = new THREE.Mesh(rbox(0.085 * s, 0.092 * s, 0.032 * s, 0.014 * s), skm); palm.position.set(0.052 * s, -0.004 * s, -0.012 * s); palm.rotation.y = -0.35; hand.add(palm);
  // fingers behind the card, their tips curling round its back; the thumb on its face
  [0.03, 0.01, -0.01, -0.029].forEach((y, i) => {
    const f = cap(0.0085, 0.038 - Math.abs(i - 1.5) * 0.004); f.rotation.z = Math.PI / 2; f.rotation.y = 0.18; f.position.set(-0.008 * s, y * s, -0.016 * s); hand.add(f);
    const k = new THREE.Mesh(new THREE.SphereGeometry(0.0095 * s, 12, 10), skm); k.position.set(0.018 * s, y * s, -0.02 * s); hand.add(k);
  });
  const thumb = cap(0.0105, 0.034); thumb.rotation.z = Math.PI / 2 + 0.35; thumb.position.set(0.004 * s, 0.006 * s, 0.017 * s); hand.add(thumb);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.02 * s, 14, 10), skm); ball.scale.set(1.3, 1, 0.8); ball.position.set(0.04 * s, 0.012 * s, 0.01 * s); hand.add(ball);
  const arm = new THREE.Group(); arm.position.set(0.095 * s, -0.004 * s, -0.012 * s); arm.rotation.set(0, -0.85, -0.38); hand.add(arm);   // down and towards the camera, like a person standing there
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.027 * s, 0.03 * s, 0.05 * s, 16), skm); wrist.rotation.z = Math.PI / 2; wrist.position.x = 0.02 * s; arm.add(wrist);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036 * s, 0.036 * s, 0.025 * s, 20), pmat("#f1efe9", { roughness: 0.7 })); cuff.rotation.z = Math.PI / 2; cuff.position.x = 0.05 * s; arm.add(cuff);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 1.6 * s, 24), pmat("#ffffff", { map: tileTex(fabricTex(sleeve), 2, 2), roughness: 0.85, sheen: 0.4, sheenColor: new THREE.Color("#8a96b0") })); sl.rotation.z = Math.PI / 2; sl.position.x = 0.86 * s; arm.add(sl);   // long: it leaves the frame
  for (const x of [0.12, 0.3]) { const fold = new THREE.Mesh(new THREE.TorusGeometry(0.053 * s, 0.006 * s, 8, 24), pmat(sleeve, { roughness: 0.9 })); fold.rotation.y = Math.PI / 2; fold.position.x = x * s; arm.add(fold); }
  return { group: g, card, w: cardW };
}
