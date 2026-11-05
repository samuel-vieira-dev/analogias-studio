// ============================================================================
// props/community.js · the neighbourhood under armed control (vídeo das milícias, 04/11/2026):
// the alley at night, the services the group sells (gas cylinder, transit van), a tabletop model of a
// neighbourhood whose houses light up as a group takes them, a big key with its price, an ID badge,
// a newspaper, a press lectern, a dropped press camera, flat case files and a tyre barricade.
// Everything generic: no real brand, crest or livery.
// ============================================================================

// ---------------------------------------------------------------- the alley at night (backdrop)
// Brick and plaster fronts of two- and three-storey houses on both sides of a hero doorway (the gap
// x ∈ [-gap/2, gap/2] is left for a makeHouseDoor), unfinished rooftops with rebar and blue water tanks,
// a concrete pole with a sodium lamp and a tangle of cables (the "gatonet") crossing above the street,
// a wet concrete street with puddles that catch the lights. In 9:16 the upper floors and the cables show
// above the hero and the wet street below it. siren(k, t): red and blue police lights sweep the walls.
// All backdrop. API { group, update(t), siren(k, t), windows(k) }
function makeAlleyNight({ wallZ = -0.25, gap = 3.6, doorH = 3.1, seed = 8 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const plasters = ["#7d6a58", "#8a5f4b", "#6c7466", "#9a8a72", "#5f5a63", "#8c7a5c"];
  const winMats = [], lit = mat("#ffd08a", { emissive: "#ffb45c", emissiveIntensity: 1.0, roughness: 0.4 }), dark = mat("#1a1716", { roughness: 0.3, metalness: 0.2 });
  const brickTex = (() => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"), rr = mulberry32(seed + 3);
    x.fillStyle = "#3d2219"; x.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 16; row++) for (let col = -1; col < 8; col++) {
      const bx = col * 34 + (row % 2) * 17, by = row * 16, v = 0.75 + rr() * 0.35;
      x.fillStyle = `rgb(${Math.round(148 * v)},${Math.round(70 * v)},${Math.round(48 * v)})`; x.fillRect(bx + 1, by + 1, 31, 13);
    }
    speckle(x, 256, 256, seed + 4, 1400, 0.12, 0.05, 2);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  })();
  const FLOOR = 2.9;
  // one house front: w wide, `floors` storeys, starting at x0 (left edge); the hero gap has no ground floor
  const front = (x0, w, floors, skipGround) => {
    const col = plasters[Math.floor(r() * plasters.length)], brick = r() < 0.4;
    const wm = brick ? mat("#ffffff", { map: tileTex(brickTex, w / 1.6, floors * FLOOR / 1.6), roughness: 0.9 }) : mat("#ffffff", { map: tileTex(plasterTex(col), w / 2.2, 1.4), roughness: 0.92 });
    const y0 = skipGround ? doorH : 0, H = floors * FLOOR - y0;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, H, 0.3), wm); wall.position.set(x0 + w / 2, y0 + H / 2, wallZ - 0.15 - (skipGround ? 0 : r() * 0.25)); g.add(wall);
    for (let f = 0; f < floors; f++) {
      if (f === 0 && skipGround) continue;
      const nw = w > 3 ? 2 : 1;
      for (let k = 0; k < nw; k++) {
        const wx = x0 + w * (k + 0.5) / nw, wy = f * FLOOR + (f === 0 ? 1.15 : 1.55), on = r() < 0.55;
        const frame = new THREE.Mesh(rbox(0.95, 1.05, 0.08, 0.02), mat("#2b2522", { roughness: 0.6 })); frame.position.set(wx, wy, wall.position.z + 0.17); g.add(frame);
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), on ? lit.clone() : dark); pane.position.set(wx, wy, wall.position.z + 0.215); g.add(pane); if (on) winMats.push(pane.material);
        // window bars (grade) on the ground floor and a ledge
        const ledge = new THREE.Mesh(rbox(1.1, 0.06, 0.2, 0.01), mat("#9a9288", { roughness: 0.8 })); ledge.position.set(wx, wy - 0.56, wall.position.z + 0.22); g.add(ledge);
        if (f === 0) for (let b = -2; b <= 2; b++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 6), mat("#1e1c1b", { metalness: 0.6, roughness: 0.4 })); bar.position.set(wx + b * 0.16, wy, wall.position.z + 0.25); g.add(bar); }
      }
      // the slab edge of the floor above (laje), a little proud of the wall
      const slab = new THREE.Mesh(rbox(w + 0.06, 0.16, 0.42, 0.02), mat("#8b8681", { map: tileTex(plasterTex("#6f6a66"), w / 2, 0.3), roughness: 0.9 })); slab.position.set(x0 + w / 2, (f + 1) * FLOOR - 0.08, wall.position.z + 0.1); g.add(slab);
    }
    // rooftop: rebar sticking up and, on some, the blue water tank
    const top = floors * FLOOR;
    for (let k = 0; k < 4; k++) { const rb = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 5), mat("#5a3a2a", { metalness: 0.5, roughness: 0.6 })); rb.position.set(x0 + 0.2 + r() * (w - 0.4), top + 0.3, wall.position.z + (r() - 0.5) * 0.2); rb.rotation.z = (r() - 0.5) * 0.25; g.add(rb); }
    if (r() < 0.6) { const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.7, 20), pmat("#2f6fb3", { roughness: 0.5, clearcoat: 0.3 })); tank.position.set(x0 + w * (0.25 + r() * 0.5), top + 0.35, wall.position.z - 0.3); g.add(tank); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 20), pmat("#2a62a0", { roughness: 0.5 })); lid.position.set(tank.position.x, top + 0.73, tank.position.z); g.add(lid); }
  };
  // fronts to the left and right of the gap, and the upper floors over the gap
  let x = -gap / 2; while (x > -16) { const w = 2.4 + r() * 1.6; front(x - w, w, 2 + Math.floor(r() * 2), false); x -= w; }
  x = gap / 2; while (x < 16) { const w = 2.4 + r() * 1.6; front(x, w, 2 + Math.floor(r() * 2), false); x += w; }
  front(-gap / 2, gap, 3, true);
  // the wet street: concrete with puddles
  const street = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), mat("#ffffff", { map: tileTex(plasterTex("#3b3836"), 14, 8), roughness: 0.42, metalness: 0.15 })); street.rotation.x = -Math.PI / 2; street.position.set(0, 0.002, wallZ + 12); g.add(street);
  for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.3 + r() * 0.5, 28), mat("#2a3142", { roughness: 0.06, metalness: 0.35, transparent: true, opacity: 0.55 })); p.rotation.x = -Math.PI / 2; p.scale.set(1.7, 1, 1); p.position.set((r() - 0.5) * 9, 0.006, wallZ + 1.4 + r() * 4.5); g.add(p); }
  // the concrete pole, its sodium lamp and the cable tangle crossing the alley
  const poleX = -gap / 2 - 1.1, poleZ = wallZ + 1.0, poleH = 7.6;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, poleH, 12), mat("#8d8984", { map: tileTex(plasterTex("#77736e"), 1, 3), roughness: 0.85 })); pole.position.set(poleX, poleH / 2, poleZ); g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), mat("#3a3836", { metalness: 0.5 })); arm.position.set(poleX, poleH - 0.4, poleZ); g.add(arm);
  const lampHead = new THREE.Mesh(rbox(0.5, 0.12, 0.24, 0.04), mat("#2a2826", { metalness: 0.5 })); lampHead.position.set(poleX + 0.75, poleH - 0.48, poleZ + 0.1); g.add(lampHead);
  const lampGlass = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.18), new THREE.MeshBasicMaterial({ color: "#ffbf6a", toneMapped: false })); lampGlass.position.set(poleX + 0.75, poleH - 0.55, poleZ + 0.1); g.add(lampGlass);
  const glow = sprite(BOKEH, 2.6); glow.material.color.set("#ffb45c"); glow.material.blending = THREE.AdditiveBlending; glow.position.copy(lampGlass.position); g.add(glow);
  const pool = makeFloorGlow(5, 4, { color: "#ffb45c", opacity: 0.2 }); pool.position.set(poleX + 0.9, 0.012, poleZ + 1.0); g.add(pool);
  const box = new THREE.Mesh(rbox(0.36, 0.5, 0.2, 0.03), mat("#4a4f55", { metalness: 0.4, roughness: 0.5 })); box.position.set(poleX, 4.6, poleZ + 0.14); g.add(box);
  const wireM = mat("#121212", { roughness: 0.7 });
  const wire = (a, b, sag) => { const mid = a.clone().lerp(b, 0.5); mid.y -= sag; const curve = new THREE.QuadraticBezierCurve3(a, mid, b); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.012, 5, false), wireM); g.add(m); return m; };
  for (let k = 0; k < 16; k++) {
    const a = new V3(poleX, 5.3 + r() * 1.8, poleZ + (r() - 0.5) * 0.2), b = new V3(poleX + 4 + r() * 10, 4.4 + r() * 3.6, wallZ - 0.1 + r() * 0.2);
    if (r() < 0.5) b.x = poleX - 3 - r() * 9;
    wire(a, b, 0.4 + r() * 0.9);
  }
  // a loose coil of cable hanging off the box (the clandestine TV and internet hook-up)
  for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.16 + k * 0.012, 0.01, 6, 28), wireM); m.position.set(poleX + 0.05, 4.1 - k * 0.03, poleZ + 0.2); m.rotation.set(0.3 + k * 0.2, 0.6, 0); g.add(m); }
  // the hill behind the rooftops: a dark slope dotted with house lights
  const hill = new THREE.Mesh(new THREE.PlaneGeometry(70, 20), new THREE.MeshBasicMaterial({ color: "#0d1220", fog: false })); hill.position.set(0, 11, -22); g.add(hill);
  const lights = makeBokeh({ n: 120, center: [0, 12, -21], spread: [60, 9, 1], size: [0.2, 0.55], colors: ["#ffc477", "#ffe1ad", "#ffffff", "#ff9d4a"], seed: seed + 9, opacity: 0.8, drift: 0.04 }); g.add(lights.group);
  // the police lights: two coloured lights in the street in front of the houses, out of frame
  const red = new THREE.PointLight("#ff2a2a", 0, 22, 1.2), blue = new THREE.PointLight("#2a5bff", 0, 22, 1.2);
  red.position.set(-4.6, 1.9, wallZ + 6.5); blue.position.set(4.6, 1.9, wallZ + 6.5); g.add(red, blue);
  asBackdrop(g);
  return {
    group: g,
    update(t) { lights.update(t); glow.material.opacity = 0.75 + 0.05 * Math.sin(t * 7.1); },
    siren(k, t) { const ph = (t * 2.2) % 1, a = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2); red.intensity = 34 * k * a; blue.intensity = 34 * k * (1 - a); },
    windows(k) { for (const m of winMats) m.emissiveIntensity = 1.0 * k; },
  };
}

// ---------------------------------------------------------------- the gas cylinder (botijão)
// 13 kg LPG cylinder: a steel body turned from a profile (domed shoulders and base), the foot ring, the
// carrying collar with its two hand holes and the brass valve on top. Origin: floor centre.
function makeGasCylinder({ color = "#2f5d8a" } = {}) {
  const g = new THREE.Group(), steel = pmat(color, { roughness: 0.38, metalness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const R = 0.18, pts = [];
  // profile from the base centre up to the valve boss (x = radius, y = height)
  const prof = [[0.0, 0.07], [0.12, 0.075], [0.165, 0.1], [R, 0.14], [R, 0.43], [0.172, 0.48], [0.14, 0.515], [0.08, 0.54], [0.035, 0.548]];
  for (const [px, py] of prof) pts.push(new THREE.Vector2(px, py));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), steel); g.add(body);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.155, 0.075, 40, 1, true), pmat(color, { roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide })); foot.position.y = 0.0375; g.add(foot);
  // collar: a ring with two openings (handles) above the shoulder
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.12, 0.12, 48, 1, true), pmat(color, { roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide })); collar.position.y = 0.6; g.add(collar);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.117, 0.009, 8, 48), steel); rim.rotation.x = Math.PI / 2; rim.position.y = 0.66; g.add(rim);
  // the two hand holes cut in the collar (left and right), dark ovals on its outside
  const holeM = mat("#0d0f12", { roughness: 0.9 });
  for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), holeM); h.scale.set(1.6, 0.8, 1); h.position.set(sx * 0.1215, 0.61, 0); h.rotation.y = sx * Math.PI / 2; g.add(h); }
  const brass = pmat("#c79a45", { metalness: 1, roughness: 0.3 });
  const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.05, 6), brass); valve.position.y = 0.57; g.add(valve);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16), brass); stem.position.y = 0.61; g.add(stem);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 20), mat("#b8241b", { roughness: 0.5 })); cap.position.y = 0.635; g.add(cap);
  // a pale safety band printed round the body (no brand)
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.05, 48, 1, true), pmat("#d9d4c8", { roughness: 0.6 })); band.position.y = 0.3; g.add(band);
  g.add(contactShadow(0.6, 0.6));
  return { group: g, top: 0.66 };
}

// ---------------------------------------------------------------- the transit van (lotação)
// Tall passenger van: the side profile (short bonnet, raked windscreen, high flat roof) extruded across
// its width with rounded edges, a band of tinted side windows, the sliding door seam, four wheels with
// steel rims, headlights, grille, mirrors and a sign behind the windscreen. Length along x, nose at +x.
// Origin: floor centre. API { group, L, W, H, sign }
function makeLotacaoVan({ color = "#ece8e0", sign = "LOTAÇÃO" } = {}) {
  const g = new THREE.Group(), L = 4.4, W = 1.75, H = 2.25, gy = 0.36;
  const sh = new THREE.Shape();
  sh.moveTo(-L / 2, gy); sh.lineTo(L / 2 - 0.05, gy); sh.lineTo(L / 2, gy + 0.45); sh.lineTo(L / 2 - 0.12, gy + 0.95);
  sh.lineTo(L / 2 - 0.75, H - 0.6); sh.lineTo(L / 2 - 1.05, H); sh.lineTo(-L / 2 + 0.05, H); sh.lineTo(-L / 2, H - 0.08); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: W - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 }); geo.translate(0, 0, -(W - 0.12) / 2);
  const paint = pmat(color, { roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, metalness: 0.1 });
  const body = new THREE.Mesh(geo, paint); g.add(body);
  const glass = pmat("#1a2430", { roughness: 0.05, metalness: 0.4, clearcoat: 1 });
  // windscreen on the raked face (profile edge from (L/2 - 0.75, H - 0.6) up to (L/2 - 1.05, H)); a
  // pivot tilts it back about z, the plane inside faces +x
  const wsA = new V3(L / 2 - 0.75, H - 0.6, 0), wsB = new V3(L / 2 - 1.05, H, 0), rake = Math.atan2(wsA.x - wsB.x, wsB.y - wsA.y);
  const wsPiv = new THREE.Group(); wsPiv.position.copy(wsA.clone().lerp(wsB, 0.5)); wsPiv.rotation.z = rake; g.add(wsPiv);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, wsA.distanceTo(wsB) * 0.9), glass); ws.rotation.y = Math.PI / 2; ws.position.x = 0.068; wsPiv.add(ws);
  // side window band and the sliding door seam, both sides
  for (const s of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(L - 1.45, 0.62), glass); band.position.set(-0.45, H - 0.52, s * (W / 2 + 0.005)); if (s < 0) band.rotation.y = Math.PI; g.add(band);
    for (let k = 1; k < 4; k++) { const pil = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.62), paint); pil.position.set(-L / 2 + 0.35 + k * 0.8, H - 0.52, s * (W / 2 + 0.008)); if (s < 0) pil.rotation.y = Math.PI; g.add(pil); }
    const cab = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), glass); cab.position.set(L / 2 - 0.95, H - 0.68, s * (W / 2 + 0.005)); if (s < 0) cab.rotation.y = Math.PI; g.add(cab);
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 1.45), mat("#2a2a2a")); seam.position.set(0.25, gy + 0.85, s * (W / 2 + 0.007)); if (s < 0) seam.rotation.y = Math.PI; g.add(seam);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.02), mat("#2a2a2a", { metalness: 0.5 })); rail.position.set(-0.5, H - 0.86, s * (W / 2 + 0.01)); g.add(rail);
    const mirror = new THREE.Mesh(rbox(0.06, 0.22, 0.14, 0.02), mat("#1c1c1c")); mirror.position.set(L / 2 - 0.85, gy + 1.05, s * (W / 2 + 0.12)); g.add(mirror);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.3, 0.08), mat(ORANGE, { roughness: 0.5 })); stripe.position.set(-0.05, gy + 0.62, s * (W / 2 + 0.006)); if (s < 0) stripe.rotation.y = Math.PI; g.add(stripe);
  }
  // wheels
  const tyre = mat("#141414", { roughness: 0.85 }), rimM = pmat("#9a9da2", { metalness: 0.8, roughness: 0.3 });
  for (const [wx, s] of [[L / 2 - 0.75, 1], [L / 2 - 0.75, -1], [-L / 2 + 0.8, 1], [-L / 2 + 0.8, -1]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 28), tyre); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.34, s * (W / 2 - 0.1)); g.add(w);
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), rimM); rm.rotation.x = Math.PI / 2; rm.position.set(wx, 0.34, s * (W / 2 + 0.02)); g.add(rm);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 20, Math.PI), mat("#1c1c1c")); arch.position.set(wx, 0.36, s * (W / 2 + 0.005)); g.add(arch);
  }
  // front: grille, headlights, bumper; the sign behind the windscreen
  const grille = new THREE.Mesh(rbox(0.04, 0.24, W * 0.6, 0.01), mat("#1b1b1b", { roughness: 0.4 })); grille.position.set(L / 2 + 0.03, gy + 0.55, 0); g.add(grille);
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(rbox(0.04, 0.12, 0.3, 0.02), new THREE.MeshBasicMaterial({ color: "#fff3d6", toneMapped: false })); hl.position.set(L / 2 + 0.01, gy + 0.62, s * (W / 2 - 0.25)); g.add(hl); }
  const bumper = new THREE.Mesh(rbox(0.14, 0.18, W + 0.04, 0.04), mat("#2a2a2a", { roughness: 0.6 })); bumper.position.set(L / 2 + 0.03, gy + 0.08, 0); g.add(bumper);
  // the route sign stuck on the lower windscreen
  const signP = makePlate(sign, 0.9, 0.2, { bg: "#141414", fg: "#ffb000", depth: 0.006 }); signP.rotation.y = Math.PI / 2; signP.position.set(0.076, -0.08, 0); wsPiv.add(signP);
  g.add(contactShadow(L + 0.8, W + 0.8));
  return { group: g, L, W, H, sign: signP };
}

// ---------------------------------------------------------------- the neighbourhood model
// Tabletop model of a dense neighbourhood on a wooden board: small flat-roofed houses of one to three
// storeys in plaster colours, packed along narrow lanes, blue water tanks on many roofs. Each house can
// glow in a colour (the group that controls it): paint(i, color, k) sets house i (k 0..1); flush() after a
// batch. cells: [{ x, z, h, i, j }], sorted by i then j. Origin: floor under the board centre.
// API { group, board, top, cells, paint, flush, clear }
function makeTerritoryModel({ cols = 9, rows = 7, cell = 0.22, seed = 4, base = 0.08, legH = 0.72, legs = true, skip = () => false } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const BW = cols * cell + 0.24, BD = rows * cell + 0.24, top = legH + base;
  const board = new THREE.Mesh(rbox(BW, base, BD, 0.02), pmat("#ffffff", { map: woodTex({ base: "#4a2e1c", seed: seed + 2 }), roughness: 0.45, clearcoat: 0.4 })); board.position.y = legH + base / 2; g.add(board);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.08, BD - 0.08), mat("#ffffff", { map: tileTex(plasterTex("#4f4a42"), 3, 3), roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = top + 0.001; g.add(ground);
  if (legs) for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, legH, 10), pmat("#2a1c12", { roughness: 0.5 })); l.position.set(lx * (BW / 2 - 0.1), legH / 2, lz * (BD / 2 - 0.1)); g.add(l); }
  const cells = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (r() < 0.08 || skip(i, j)) continue;   // a few empty lots, and the lanes the scene asks for
    const fl = 1 + Math.floor(r() * r() * 3.2);
    cells.push({ i, j, x: (i - (cols - 1) / 2) * cell + (r() - 0.5) * cell * 0.08, z: (j - (rows - 1) / 2) * cell + (r() - 0.5) * cell * 0.08, h: fl * cell * 0.36, w: cell * (0.7 + r() * 0.16), d: cell * (0.68 + r() * 0.16), tank: r() < 0.45 });
  }
  const n = cells.length, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new V3(), P3 = new V3();
  const houseGeo = new THREE.BoxGeometry(1, 1, 1); houseGeo.translate(0, 0.5, 0);
  const houses = new THREE.InstancedMesh(houseGeo, mat("#ffffff", { map: tileTex(plasterTex("#bfb3a2"), 1, 1), roughness: 0.9 }), n);
  const glowM = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const glows = new THREE.InstancedMesh(houseGeo, glowM, n);
  const tankGeo = new THREE.CylinderGeometry(0.5, 0.42, 1, 12); tankGeo.translate(0, 0.5, 0);
  const tanks = new THREE.InstancedMesh(tankGeo, pmat("#2f6fb3", { roughness: 0.5 }), n);
  const winTex = (() => { const c = makeCanvas(64, 64), x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 64, 64); x.fillStyle = "#fff"; for (const [a, b] of [[10, 14], [38, 14], [10, 40], [38, 40]]) x.fillRect(a, b, 16, 14); return texFrom(c); })();
  const winM = new THREE.MeshBasicMaterial({ map: winTex, color: "#ffc477", transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const wins = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), winM, n);
  const tones = ["#c9b9a2", "#b98e74", "#9fa79a", "#d4c7ad", "#a58f80", "#c4a27e", "#8f8b93"], base0 = [];
  cells.forEach((c, k) => {
    P3.set(c.x, top, c.z); S3.set(c.w, c.h, c.d); M.compose(P3, Q, S3); houses.setMatrixAt(k, M);
    const col = new THREE.Color(tones[Math.floor(r() * tones.length)]); houses.setColorAt(k, col); base0.push(col);
    S3.set(c.w * 1.04, c.h * 1.03, c.d * 1.04); M.compose(P3, Q, S3); glows.setMatrixAt(k, M); glows.setColorAt(k, new THREE.Color(0, 0, 0));
    if (c.tank) { P3.set(c.x + c.w * 0.2, top + c.h, c.z - c.d * 0.15); S3.set(cell * 0.2, cell * 0.16, cell * 0.2); } else { S3.set(0.0001, 0.0001, 0.0001); }
    M.compose(P3, Q, S3); tanks.setMatrixAt(k, M);
    P3.set(c.x, top + c.h * 0.55, c.z + c.d / 2 + 0.002); S3.set(c.w * 0.8, Math.min(c.h * 0.7, cell * 0.5), 1); M.compose(P3, Q, S3); wins.setMatrixAt(k, M);
  });
  houses.instanceColor.needsUpdate = true; glows.instanceColor.needsUpdate = true;
  g.add(houses, glows, tanks, wins);
  glows.userData.decor = true; wins.userData.decor = true;
  g.add(contactShadow(BW + 0.6, BD + 0.6));
  const tmp = new THREE.Color();
  const tint = new THREE.Color();
  function paint(k, color, a = 1) { tint.set(color); tmp.copy(tint).multiplyScalar(0.42 * clamp(a)); glows.setColorAt(k, tmp); tmp.copy(base0[k]).lerp(tint, 0.75 * clamp(a)); houses.setColorAt(k, tmp); }
  function flush() { glows.instanceColor.needsUpdate = true; houses.instanceColor.needsUpdate = true; }
  function clear() { for (let k = 0; k < n; k++) paint(k, "#000000", 0); flush(); }
  return { group: g, board, top, cells, paint, flush, clear, BW, BD };
}

// ---------------------------------------------------------------- the big key
// Old brass key: a ring bow, a long round shaft and a toothed bit. Hung by the bow: origin at the top of
// the bow; the key hangs along -y, the bit facing +x. API { group, len }
function makeBigKey({ s = 1 } = {}) {
  const g = new THREE.Group(), brass = pmat("#c99a42", { metalness: 1, roughness: 0.28, clearcoat: 0.4 });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.11 * s, 0.028 * s, 16, 40), brass); bow.position.y = -0.11 * s; g.add(bow);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 0.05 * s, 16), brass); collar.position.y = -0.25 * s; g.add(collar);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.42 * s, 16), brass); shaft.position.y = -0.47 * s; g.add(shaft);
  const bit = new THREE.Mesh(rbox(0.13 * s, 0.12 * s, 0.03 * s, 0.006 * s), brass); bit.position.set(0.075 * s, -0.6 * s, 0); g.add(bit);
  for (const [tx, ty] of [[0.1, -0.555], [0.06, -0.64]]) { const notch = new THREE.Mesh(new THREE.BoxGeometry(0.03 * s, 0.03 * s, 0.032 * s), mat("#1a1208")); notch.position.set(tx * s, ty * s, 0); g.add(notch); }
  return { group: g, len: 0.68 * s };
}

// ---------------------------------------------------------------- the ID badge
// Clip-on ID badge: a clear plastic holder with a printed card (a coloured band, a blank photo square and
// the role in large letters) on a metal clip. Origin: top of the clip; the card hangs along -y, faces +z.
// API { group, plate }
function makeIdBadge(role = "SEGURANÇA", { w = 0.13, h = 0.17, band = RED } = {}) {
  const g = new THREE.Group();
  const clip = new THREE.Mesh(rbox(0.03, 0.035, 0.012, 0.004), pmat("#b9bcc0", { metalness: 0.9, roughness: 0.25 })); clip.position.y = -0.0175; g.add(clip);
  const holder = new THREE.Mesh(rbox(w + 0.012, h + 0.012, 0.006, 0.006), glassMat({ opacity: 0.3 })); holder.position.y = -0.035 - h / 2; g.add(holder);
  const card = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.002), mat("#f2efe8", { roughness: 0.7 })); card.position.set(0, -0.035 - h / 2, 0.0); g.add(card);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.2, 0.0025), mat(band, { roughness: 0.6 })); top.position.set(0, -0.035 - h * 0.1, 0.0003); g.add(top);
  const pc = makeCanvas(128, 128), px = pc.getContext("2d"); px.fillStyle = "#b9c3cc"; px.fillRect(0, 0, 128, 128); px.fillStyle = "#4a5560"; px.beginPath(); px.arc(64, 50, 24, 0, Math.PI * 2); px.fill(); px.beginPath(); px.ellipse(64, 128, 46, 40, 0, Math.PI, 0); px.fill();
  const photo = new THREE.Mesh(new THREE.BoxGeometry(w * 0.36, h * 0.34, 0.0025), [mat("#6d6a66"), mat("#6d6a66"), mat("#6d6a66"), mat("#6d6a66"), mat("#ffffff", { map: texFrom(pc), roughness: 0.7 }), mat("#6d6a66")]); photo.position.set(0, -0.035 - h * 0.42, 0.0003); g.add(photo);
  const plate = makePlate(role, w * 0.94, h * 0.22, { bg: "#f2efe8", fg: "#141414", depth: 0.002 }); plate.position.set(0, -0.035 - h * 0.77, 0.0015); g.add(plate);
  return { group: g, plate };
}

// ---------------------------------------------------------------- the newspaper
// A broadsheet folded in half, lying flat: the masthead, a big headline (printed plate, readable), a grey
// photo block and the columns of body text. Origin: centre of the underside; the front page faces +y.
// API { group, top, headline }
function makeNewspaper({ masthead = "DIÁRIO DA CIDADE", headline = "MILÍCIAS", sub = "", date = "", w = 0.62, d = 0.8 } = {}) {
  const g = new THREE.Group(), T = 0.012;
  const c = makeCanvas(620, 800), x = c.getContext("2d");
  x.fillStyle = "#ece6d8"; x.fillRect(0, 0, 620, 800); speckle(x, 620, 800, 13, 3500, 0.05, 0.03, 1.5);
  x.fillStyle = "#151311"; x.font = "900 54px Inter"; x.textAlign = "center"; x.fillText(masthead, 310, 72);
  x.fillRect(30, 92, 560, 4); x.font = "600 18px Inter"; if (date) x.fillText(date, 310, 120); x.fillRect(30, 132, 560, 2);
  // photo block and text columns below the headline band (the headline is a plate)
  { const rr = mulberry32(31), gr = x.createLinearGradient(0, 360, 0, 590); gr.addColorStop(0, "#b9b5ae"); gr.addColorStop(1, "#8d8983"); x.fillStyle = gr; x.fillRect(30, 360, 330, 230);
    // a hillside of small houses, darker towards the bottom, windows as dots
    for (let row = 0; row < 7; row++) for (let k = 0; k < 9; k++) { const hx = 30 + k * 38 + (row % 2) * 16 + rr() * 8, hy = 420 + row * 26 - Math.max(0, 3 - Math.abs(k - 4)) * 10, hw = 30 + rr() * 10, hh = 22 + rr() * 14; const v = 70 + Math.floor(rr() * 60) - row * 4; x.fillStyle = `rgb(${v},${v - 4},${v - 8})`; x.fillRect(hx, hy, Math.min(hw, 360 - hx), Math.min(hh, 590 - hy)); x.fillStyle = "rgba(20,18,16,0.6)"; if (hy + 8 < 590) x.fillRect(hx + 6, hy + 6, 5, 5); }
    x.strokeStyle = "#2a2724"; x.lineWidth = 2; x.strokeRect(30, 360, 330, 230); }
  x.fillStyle = "rgba(20,18,16,0.55)";
  for (let col = 0; col < 3; col++) for (let ln = 0; ln < 22; ln++) { const bx = col < 1 ? 380 : 30 + (col - 1) * 290, by = col < 1 ? 360 + ln * 11 : 610 + ln * 8; if (by > 780) continue; x.fillRect(bx, by, col < 1 ? 210 : 270 - (ln % 5 === 4 ? 90 : 0), 4); }
  const paper = mat("#ffffff", { map: texFrom(c), roughness: 0.85 });
  const edge = mat("#e2dccd", { roughness: 0.9 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [edge, edge, paper, edge, edge, edge]); sheet.position.y = T / 2; g.add(sheet);
  // the fold on the left edge: a thin rounded spine
  const fold = new THREE.Mesh(new THREE.CylinderGeometry(T * 0.7, T * 0.7, d, 10), edge); fold.rotation.x = Math.PI / 2; fold.position.set(-w / 2, T / 2, 0); g.add(fold);
  const hp = makePlate(headline, w * 0.9, d * 0.2, { bg: "#ece6d8", fg: "#151311", depth: 0.002 }); hp.rotation.x = -Math.PI / 2; hp.position.set(0, T + 0.001, -d * 0.18); g.add(hp);
  if (sub) { const sp = makePlate(sub, w * 0.88, d * 0.06, { bg: "#ece6d8", fg: "#3a3631", depth: 0.002, detail: true }); sp.rotation.x = -Math.PI / 2; sp.position.set(0, T + 0.001, -d * 0.03); g.add(sp); }
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, top: T, headline: hp };
}

// ---------------------------------------------------------------- the press lectern
// Wooden lectern on a short dais: a tapered front panel with a dark inset, a sloping reading top, and a
// cluster of microphones on short stands with foam windscreens in plain colours (no logos). Origin: floor
// centre; faces +z. API { group, top }
function makePressLectern({ mics = 5 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex({ base: "#3b2414", seed: 17 }), roughness: 0.4, clearcoat: 0.5 });
  const dais = new THREE.Mesh(rbox(1.4, 0.12, 1.0, 0.03), mat("#1d1b1a", { roughness: 0.8 })); dais.position.y = 0.06; g.add(dais);
  const sh = new THREE.Shape(); sh.moveTo(-0.33, 0); sh.lineTo(0.33, 0); sh.lineTo(0.36, 1.05); sh.lineTo(-0.36, 1.05); sh.closePath();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.42, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), wood); body.position.set(0, 0.12, -0.21); g.add(body);
  const inset = new THREE.Mesh(rbox(0.5, 0.62, 0.02, 0.02), pmat("#1b1410", { roughness: 0.5, clearcoat: 0.6 })); inset.position.set(0, 0.62, 0.23); g.add(inset);
  const topB = new THREE.Mesh(rbox(0.86, 0.05, 0.56, 0.015), wood); topB.position.set(0, 1.2, 0.0); topB.rotation.x = 0.2; g.add(topB);
  const lip = new THREE.Mesh(rbox(0.82, 0.04, 0.03, 0.01), wood); lip.position.set(0, 1.17, 0.28); g.add(lip);
  const foam = ["#c8231a", "#1d4fb3", "#e8e2d6", "#2a2a2a", "#e1a21b", "#2f8a4c"], metal = pmat("#2b2b2e", { metalness: 0.8, roughness: 0.3 });
  // handheld microphones on short goosenecks, all leaning towards the speaker's place (-z), windscreens in plain colours
  for (let k = 0; k < mics; k++) {
    const a = (k - (mics - 1) / 2) * 0.11, mic = new THREE.Group(); mic.position.set(a, 1.25, 0.16 - Math.abs(a) * 0.25); mic.rotation.set(-0.75 + (k % 2) * 0.12, a * 1.2, 0); g.add(mic);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.2, 14), metal); handle.position.y = 0.1; mic.add(handle);
    const grille = new THREE.Mesh(new THREE.SphereGeometry(0.038, 18, 14), pmat("#3a3a3e", { metalness: 0.7, roughness: 0.4 })); grille.position.y = 0.22; mic.add(grille);
    const foamM = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 18), pmat(foam[k % foam.length], { roughness: 0.95 })); foamM.position.y = 0.17; mic.add(foamM);
  }
  const seal = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 10, 48), pmat("#c9a45a", { metalness: 0.9, roughness: 0.3 })); seal.position.set(0, 0.72, 0.245); g.add(seal);
  const sealIn = new THREE.Mesh(new THREE.CircleGeometry(0.1, 40), pmat("#1c2a4a", { roughness: 0.5, clearcoat: 0.5 })); sealIn.position.set(0, 0.72, 0.242); g.add(sealIn);
  g.add(contactShadow(1.8, 1.4));
  return { group: g, top: 1.24 };
}

// ---------------------------------------------------------------- the dropped press camera
// Reflex camera with a long lens, lying where it fell: black body with grip and prism hump, a zoom lens
// with ribbed rings, the front glass cracked, the neck strap trailing on the floor (strap: false leaves it
// out). Origin: floor under the body; the lens points +z. API { group }
function makePressCamera({ s = 1, strap: withStrap = true } = {}) {
  const g = new THREE.Group(), body = pmat("#1a1a1b", { roughness: 0.55, clearcoat: 0.3 }), rub = mat("#0e0e0e", { roughness: 0.95 });
  const cam = new THREE.Group(); cam.scale.setScalar(s); g.add(cam);
  const box = new THREE.Mesh(rbox(0.15, 0.1, 0.08, 0.015), body); box.position.y = 0.05; cam.add(box);
  const grip = new THREE.Mesh(rbox(0.04, 0.095, 0.09, 0.015), rub); grip.position.set(-0.065, 0.05, 0.01); cam.add(grip);
  const prism = new THREE.Mesh(rbox(0.07, 0.04, 0.06, 0.01), body); prism.position.set(0, 0.115, -0.005); cam.add(prism);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.14, 32), body); lens.rotation.x = Math.PI / 2; lens.position.set(0.01, 0.05, 0.11); cam.add(lens);
  for (const z of [0.08, 0.13]) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 32), rub); ring.rotation.x = Math.PI / 2; ring.position.set(0.01, 0.05, z); cam.add(ring); }
  // the cracked front glass
  const c = makeCanvas(256, 256), x = c.getContext("2d"), r = mulberry32(5);
  const gr = x.createRadialGradient(110, 100, 10, 128, 128, 128); gr.addColorStop(0, "#3a4d6a"); gr.addColorStop(1, "#05070b"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = "rgba(235,240,255,0.85)"; x.lineWidth = 2;
  for (let k = 0; k < 9; k++) { let px = 150, py = 110; x.beginPath(); x.moveTo(px, py); const a = r() * Math.PI * 2; for (let st = 0; st < 5; st++) { px += Math.cos(a + (r() - 0.5) * 0.8) * 26; py += Math.sin(a + (r() - 0.5) * 0.8) * 26; x.lineTo(px, py); } x.stroke(); }
  x.beginPath(); x.arc(150, 110, 16, 0, Math.PI * 2); x.stroke();
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.033, 32), pmat("#ffffff", { map: texFrom(c), roughness: 0.08, metalness: 0.3, clearcoat: 1 })); glass.position.set(0.01, 0.05, 0.181); cam.add(glass);
  // strap trailing off the lugs
  const pts = [new V3(0.075, 0.085, -0.01), new V3(0.13, 0.03, 0.0), new V3(0.2, 0.01, 0.06), new V3(0.3, 0.01, 0.02), new V3(0.38, 0.01, 0.1), new V3(0.46, 0.01, 0.05)];
  if (withStrap) { const strap = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.009, 6, false), mat("#141414", { roughness: 0.9 })); strap.scale.set(s, s * 0.35, s); g.add(strap); }
  g.add(contactShadow(0.6 * s, 0.6 * s));
  return { group: g };
}

// ---------------------------------------------------------------- case files (flat)
// Manila case file lying flat, closed: the cover with a tab, the edges of the papers inside, a steel clip
// and a printed label plate on the cover. Origin: centre of the underside; the cover faces +y.
// API { group, top, label }
function makeCaseFile(label, { w = 0.62, d = 0.82, color = "#c9a66b", fg = "#2a1a0e" } = {}) {
  const g = new THREE.Group(), T = 0.04;
  const paper = mat("#ece5d6", { roughness: 0.9 }), cover = mat("#ffffff", { map: tileTex(cardboardTex(), 1, 1), color, roughness: 0.85 });
  const papers = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, T - 0.012, d - 0.03), paper); papers.position.y = T / 2; g.add(papers);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, d), cover); back.position.y = 0.0025; g.add(back);
  const front = new THREE.Mesh(new THREE.BoxGeometry(w, 0.005, d), cover); front.position.y = T - 0.0025; g.add(front);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.32, 0.005, 0.06), cover); tab.position.set(w * 0.2, T - 0.0025, -d / 2 - 0.03); g.add(tab);
  const clip = new THREE.Mesh(rbox(0.12, 0.012, 0.05, 0.004), pmat("#b9bcc0", { metalness: 0.9, roughness: 0.25 })); clip.position.set(-w * 0.3, T + 0.004, -d / 2 + 0.03); g.add(clip);
  const lp = makePlate(label, w * 0.86, d * 0.2, { bg: "#efe6d2", fg, depth: 0.002 }); lp.rotation.x = -Math.PI / 2; lp.position.set(0, T + 0.0012, -d * 0.24); g.add(lp);
  g.add(contactShadow(w + 0.25, d + 0.25));
  return { group: g, top: T, label: lp };
}

// ---------------------------------------------------------------- a growing pile of case files
// n flat files stacked a little askew; set(k) shows the first ceil(k * n) (the pile grows from the
// bottom). The top file carries the printed label. Origin: floor centre. API { group, set(k), topAt(k) }
function makeCaseFilePile(n, label, { w = 0.5, d = 0.66, t = 0.032, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), cols = ["#c9a66b", "#b9925a", "#d3b47b", "#a87f4d"], files = [];
  for (let k = 0; k < n; k++) {
    const f = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(w, t * 0.9, d), [mat("#e8e0cf"), mat("#e8e0cf"), mat(cols[k % 4], { roughness: 0.85 }), mat(cols[k % 4]), mat("#e8e0cf"), mat("#e8e0cf")]);
    m.position.y = t * 0.45; f.add(m); f.position.set((r() - 0.5) * 0.05, k * t, (r() - 0.5) * 0.05); f.rotation.y = (r() - 0.5) * 0.16; g.add(f); files.push(f);
  }
  const lp = makePlate(label, w * 0.82, d * 0.18, { bg: "#efe6d2", fg: "#2a1a0e", depth: 0.002 }); lp.rotation.x = -Math.PI / 2; g.add(lp);
  g.add(contactShadow(w + 0.4, d + 0.4));
  const count = (k) => Math.max(1, Math.ceil(clamp(k) * n));
  function set(k) { const c = count(k); files.forEach((f, i) => { f.visible = i < c; }); const topF = files[c - 1]; lp.position.set(topF.position.x, topF.position.y + t * 0.9 + 0.0012, topF.position.z - d * 0.18); lp.rotation.z = -topF.rotation.y; }
  set(1);
  return { group: g, set, topAt: (k) => count(k) * t };
}

// ---------------------------------------------------------------- the tyre barricade
// Worn tyres stood upright in a pyramid (three below, two above), their holes facing the front so they read
// as tyres, the tread on the outer face, and two broken planks leaning across them: the barricade that
// closes a street. Origin: floor centre; faces +z. API { group }
function makeTyreBarricade() {
  const g = new THREE.Group(), r = mulberry32(12);
  const treadC = makeCanvas(512, 64), tx = treadC.getContext("2d"); tx.fillStyle = "#1b1b1b"; tx.fillRect(0, 0, 512, 64); tx.fillStyle = "#0a0a0a"; for (let k = 0; k < 64; k++) { tx.fillRect(k * 8, 0, 4, 64); } tx.fillStyle = "#262626"; tx.fillRect(0, 28, 512, 8);
  const treadT = texFrom(treadC); treadT.wrapS = THREE.RepeatWrapping; treadT.repeat.set(4, 1);
  const rubber = mat("#ffffff", { map: treadT, roughness: 0.9 });
  const side = mat("#202020", { roughness: 0.75 });
  const R = 0.32, T = 0.12, W = 0.22;
  // a tyre: the tread band (open cylinder) and the two sidewalls (rings), axis along z
  const tyre = () => {
    const t = new THREE.Group();
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W, 40, 1, true), rubber); band.rotation.x = Math.PI / 2; t.add(band);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(R - T, R - T, W, 40, 1, true), mat("#0c0c0c", { roughness: 0.9, side: THREE.BackSide })); inner.rotation.x = Math.PI / 2; t.add(inner);
    for (const sz of [-1, 1]) { const wall = new THREE.Mesh(new THREE.RingGeometry(R - T, R, 40, 1), side); wall.position.z = sz * W / 2; if (sz < 0) wall.rotation.y = Math.PI; t.add(wall); const lip = new THREE.Mesh(new THREE.TorusGeometry(R - T, 0.012, 8, 40), side); lip.position.z = sz * W / 2; t.add(lip); }
    return t;
  };
  [[-0.66, R, 0], [0, R, 0.02], [0.66, R, -0.01], [-0.33, 3 * R - 0.06, 0.0], [0.33, 3 * R - 0.06, 0.01]].forEach(([x, y, z], i) => { const t = tyre(); t.position.set(x, y, z); t.rotation.set((r() - 0.5) * 0.06, (r() - 0.5) * 0.2, r() * 3); g.add(t); });
  const wood = pmat("#ffffff", { map: woodTex({ base: "#6a5038", seed: 9 }), roughness: 0.8 });
  const p1 = new THREE.Mesh(rbox(1.5, 0.05, 0.14, 0.01), wood); p1.position.set(0.05, 0.42, W / 2 + 0.12); p1.rotation.z = 0.32; g.add(p1);
  const p2 = new THREE.Mesh(rbox(1.2, 0.05, 0.12, 0.01), wood); p2.position.set(-0.1, 0.22, W / 2 + 0.21); p2.rotation.z = -0.18; g.add(p2);
  g.add(contactShadow(2.4, 1.0));
  return { group: g };
}

// ---------------------------------------------------------------- the two-faced badge
// A security badge in the shape of a shield, standing in a small wooden display stand: one face polished
// gold (a star in a ring, SEGURANÇA on a banner), the other blackened iron with the same star, chipped.
// The pivot turns about the vertical axis: spin(0) shows the gold face (+z), spin(PI) the dark one.
// Origin: floor under the stand. API { group, pivot, spin(a), plate, h }
function makeShieldBadge({ h = 0.62 } = {}) {
  const g = new THREE.Group(), w = h * 0.82, T = 0.045;
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, h * 0.38); sh.quadraticCurveTo(-w * 0.25, h * 0.5, 0, h * 0.44); sh.quadraticCurveTo(w * 0.25, h * 0.5, w / 2, h * 0.38);
  sh.lineTo(w * 0.47, -h * 0.05); sh.quadraticCurveTo(w * 0.4, -h * 0.34, 0, -h * 0.5); sh.quadraticCurveTo(-w * 0.4, -h * 0.34, -w * 0.47, -h * 0.05); sh.closePath();
  const face = (bg0, bg1, ink, seed, chipped) => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), gr = x.createRadialGradient(200, 170, 20, 256, 256, 300);
    gr.addColorStop(0, bg0); gr.addColorStop(1, bg1); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = ink; x.lineWidth = 12; x.beginPath(); x.arc(256, 236, 150, 0, Math.PI * 2); x.stroke();
    x.fillStyle = ink; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 50 : 120; x.lineTo(256 + Math.cos(a) * rr, 242 + Math.sin(a) * rr); } x.closePath(); x.fill();
    const rnd = mulberry32(seed); for (let i = 0; i < 2400; i++) { x.fillStyle = `rgba(0,0,0,${rnd() * 0.09})`; x.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    if (chipped) { x.strokeStyle = "rgba(120,110,100,0.7)"; x.lineWidth = 2; for (let k = 0; k < 14; k++) { x.beginPath(); let px = rnd() * 512, py = rnd() * 512; x.moveTo(px, py); for (let st = 0; st < 4; st++) { px += (rnd() - 0.5) * 60; py += (rnd() - 0.5) * 60; x.lineTo(px, py); } x.stroke(); } }
    const t = texFrom(c); t.repeat.set(1 / w, 1 / h); t.offset.set(0.5, 0.5); return t;
  };
  const gold = pmat("#ffffff", { map: face("#ffe7a8", "#c48a1c", "#8e5c06", 3, false), metalness: 0.9, roughness: 0.26 });
  const iron = pmat("#ffffff", { map: face("#3a3533", "#141211", "#8d837b", 9, true), metalness: 0.6, roughness: 0.55 });
  const edge = pmat("#b8862a", { metalness: 0.9, roughness: 0.3 });
  const geo = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 }); geo.translate(0, 0, -T / 2);
  // ExtrudeGeometry groups: 0 = the two caps, 1 = the sides; the back cap is split off by its normal
  const front = new THREE.Mesh(new THREE.ShapeGeometry(sh), gold); front.position.z = T / 2 + 0.0085;
  const back = new THREE.Mesh(new THREE.ShapeGeometry(sh), iron); back.position.z = -T / 2 - 0.0085; back.rotation.y = Math.PI;
  const body = new THREE.Mesh(geo, [edge, edge]);
  const pivot = new THREE.Group(); pivot.position.y = 0.09 + h / 2; g.add(pivot);
  pivot.add(body, front, back);
  const plate = makePlate("SEGURANÇA", w * 0.74, h * 0.14, { bg: "#7a4a08", fg: "#ffe7a8", depth: 0.004 }); plate.position.set(0, -h * 0.29, T / 2 + 0.011); pivot.add(plate);
  // the stand: a wooden block with a slot, two brass pegs holding the badge
  const wood = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 23 }), roughness: 0.4, clearcoat: 0.5 });
  const base = new THREE.Mesh(rbox(w * 0.7, 0.07, 0.22, 0.02), wood); base.position.y = 0.035; g.add(base);
  const brass = pmat("#c99a42", { metalness: 1, roughness: 0.3 });
  for (const sx of [-1, 1]) { const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), brass); peg.position.set(sx * w * 0.16, 0.1, 0); g.add(peg); }
  g.add(contactShadow(w + 0.3, 0.6));
  return { group: g, pivot, spin: (a) => { pivot.rotation.y = a; }, plate, h: 0.09 + h };
}
