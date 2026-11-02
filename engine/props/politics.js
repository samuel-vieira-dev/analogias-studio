// ============================================================================
// props/politics.js · eleição e campanha: urna eletrônica, ônibus urbano, Congresso Nacional, torre
// de rádio e antena de telhado, lupa, cartão de banco, medalha de dois lados, palanque à noite.
// (vídeo do Janones e do "Exército do Lula", 01/11/2026)
// ============================================================================

// Thin cylinder from a to b (struts, braces, chains).
function strutBetween(a, b, r, m) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 8), m);
  c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize()); return c;
}

// Brazilian electronic voting machine (generic: no coat of arms, no printed institution): a beige case
// whose top slopes up towards the back; on the slope, the screen on the left and the keypad on the right
// (0–9 in black, BRANCO white, CORRIGE orange, CONFIRMA green). Front towards +z. Origin: floor centre.
// API { group, ctx, tex, paint(lines), top(s) } — paint(["SEU VOTO", ...]) redraws the screen.
function makeElectronicUrn({ w = 1.0, d = 0.66, hf = 0.12, hb = 0.32 } = {}) {
  const g = new THREE.Group(), shell = pmat("#e6dfcf", { roughness: 0.55, clearcoat: 0.3 }), dark = pmat("#2b2a28", { roughness: 0.5 });
  const prof = new THREE.Shape(); prof.moveTo(d / 2, 0); prof.lineTo(d / 2, hf); prof.lineTo(-d / 2, hb); prof.lineTo(-d / 2, 0); prof.closePath();
  const geo = new THREE.ExtrudeGeometry(prof, { depth: w, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3 });
  geo.rotateY(-Math.PI / 2); geo.translate(w / 2, 0, 0);
  const body = new THREE.Mesh(geo, shell); g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.035, 0.01), dark); band.position.set(0, 0.05, d / 2 + 0.016); g.add(band);
  // the slope: s = 0 front edge → 1 back edge; n is its normal
  const a = Math.atan2(hb - hf, d), n = new V3(0, Math.cos(a), Math.sin(a));
  const top = (x, s, lift = 0.018) => new V3(x, hf + s * (hb - hf), d / 2 - s * d).addScaledVector(n, lift);
  const onSlope = (m, x, s, lift) => { m.position.copy(top(x, s, lift)); m.rotation.x = -(Math.PI / 2 - a); return m; };
  const slopeLen = Math.hypot(d, hb - hf);
  // screen: bezel + LCD
  const c = makeCanvas(640, 480), ctx = c.getContext("2d"), tex = texFrom(c);
  const bez = onSlope(new THREE.Mesh(rbox(w * 0.46, slopeLen * 0.62, 0.02, 0.01), dark), -w * 0.22, 0.52, 0.01); g.add(bez);
  const lcd = onSlope(new THREE.Mesh(new THREE.PlaneGeometry(w * 0.42, slopeLen * 0.56), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })), -w * 0.22, 0.52, 0.021); g.add(lcd);
  function paint(lines = ["SEU VOTO PARA", "PRESIDENTE"], big = "") {
    ctx.fillStyle = "#d9e2cf"; ctx.fillRect(0, 0, 640, 480); ctx.fillStyle = "#1b2418"; ctx.textAlign = "left";
    ctx.font = "800 46px Inter"; lines.forEach((l, i) => ctx.fillText(l, 40, 80 + i * 58));
    if (big) { ctx.textAlign = "center"; ctx.font = "900 150px Inter"; ctx.fillText(big, 320, 380); }
    ctx.fillStyle = "rgba(27,36,24,0.5)"; ctx.fillRect(40, 420, 560, 4); tex.needsUpdate = true;
  }
  paint();
  // keypad: 3 × 4 keys + the three action keys
  const keyM = pmat("#1c1c1e", { roughness: 0.35, clearcoat: 0.6 }), kw = w * 0.085, kh = slopeLen * 0.1;
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];
  digits.forEach((dg, i) => {
    if (!dg) return; const col = i % 3, row = Math.floor(i / 3);
    const k = onSlope(new THREE.Mesh(rbox(kw, kh, 0.022, 0.008), keyM), w * 0.13 + col * kw * 1.25, 0.83 - row * 0.15, 0.011); g.add(k);
    const lab = onSlope(makePlate(dg, kw * 0.7, kh * 0.7, { bg: "#1c1c1e", fg: "#f4f1ea", depth: 0.002, detail: true }), w * 0.13 + col * kw * 1.25, 0.83 - row * 0.15, 0.024); g.add(lab);
  });
  [["#f4f1ea", -1], [ORANGE, 0], ["#2fae66", 1]].forEach(([col, i]) => {
    const k = onSlope(new THREE.Mesh(rbox(kw * 1.15, kh * 0.9, 0.022, 0.008), pmat(col, { roughness: 0.35, clearcoat: 0.6 })), w * 0.255 + i * kw * 1.3, 0.12, 0.011); g.add(k);
  });
  g.add(contactShadow(w + 0.5, d + 0.5));
  return { group: g, ctx, tex, paint, top: (s) => top(0, s, 0), lcd };
}

// City bus: long box body on four wheels, tinted window band on both sides with pillars, windscreen,
// an amber LED destination sign, the front door, a coloured stripe and headlights. Length along x,
// front +x. Origin: floor centre. API { group, spin(a), L, W, H }
function makeCityBus({ L = 4.6, W = 1.25, H = 1.5, color = "#ece6da", stripe = ORANGE, dest = "CENTRO" } = {}) {
  const g = new THREE.Group(), clear = 0.32, bh = H - clear;
  const paint = pmat(color, { roughness: 0.4, clearcoat: 0.8 }), glass = pmat("#1a2430", { roughness: 0.08, metalness: 0.2, clearcoat: 1 }), rubber = pmat("#141414", { roughness: 0.85 });
  const body = new THREE.Mesh(rbox(L, bh, W, 0.12), paint); body.position.y = clear + bh / 2; g.add(body);
  const roof = new THREE.Mesh(rbox(L * 0.5, 0.12, W * 0.7, 0.04), pmat("#cfc9be", { roughness: 0.5 })); roof.position.set(-L * 0.1, H + 0.06, 0); g.add(roof);
  for (const s of [-1, 1]) {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(L - 1.05, 0.5), glass); band.position.set(-0.35, clear + bh * 0.66, s * (W / 2 + 0.003)); band.rotation.y = s > 0 ? 0 : Math.PI; g.add(band);
    for (let x = -L / 2 + 0.3; x < L / 2 - 1.1; x += 0.62) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.012), paint); p.position.set(x, clear + bh * 0.66, s * (W / 2 + 0.008)); g.add(p); }
    const st = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.2, 0.09), pmat(stripe, { roughness: 0.4 })); st.position.set(0, clear + 0.22, s * (W / 2 + 0.004)); st.rotation.y = s > 0 ? 0 : Math.PI; g.add(st);
  }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.62, bh * 0.86), glass); door.position.set(L / 2 - 0.55, clear + bh * 0.46, W / 2 + 0.005); g.add(door);
  const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, bh * 0.86, 0.01), rubber); doorLine.position.set(L / 2 - 0.55, clear + bh * 0.46, W / 2 + 0.01); g.add(doorLine);
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.14, bh * 0.52), glass); ws.position.set(L / 2 + 0.004, clear + bh * 0.6, 0); ws.rotation.y = Math.PI / 2; g.add(ws);
  const sign = makePlate(dest, W - 0.2, 0.17, { bg: "#0d0d0d", fg: "#ffb020", detail: true }); sign.position.set(L / 2 + 0.017, clear + bh - 0.14, 0); sign.rotation.y = Math.PI / 2; g.add(sign);
  const side = makePlate(dest, 1.9, 0.27, { bg: "#0d0d0d", fg: "#ffb020" }); side.position.set(L / 2 - 1.95, clear + bh - 0.17, W / 2 + 0.017); g.add(side);
  const bump = new THREE.Mesh(rbox(0.12, 0.2, W + 0.02, 0.04), rubber); bump.position.set(L / 2 + 0.01, clear + 0.08, 0); g.add(bump);
  const lampM = new THREE.MeshBasicMaterial({ color: "#fff3d6", toneMapped: false });
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), lampM); hl.position.set(L / 2 + 0.013, clear + 0.3, s * (W / 2 - 0.18)); hl.rotation.y = Math.PI / 2; g.add(hl); }
  const wheels = [];
  for (const x of [L / 2 - 0.85, -L / 2 + 0.8]) for (const s of [-1, 1]) {
    const wg = new THREE.Group(); wg.position.set(x, 0.27, s * (W / 2 - 0.1)); g.add(wg);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.22, 28), rubber); tire.rotation.x = Math.PI / 2; wg.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.225, 20), pmat("#9a9da2", { metalness: 0.8, roughness: 0.3 })); hub.rotation.x = Math.PI / 2; wg.add(hub);
    for (let i = 0; i < 6; i++) { const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.23, 6), rubber); nut.rotation.x = Math.PI / 2; nut.position.set(Math.cos(i) * 0.1, Math.sin(i) * 0.1, 0); hub.add(nut); }
    wheels.push(wg);
  }
  g.add(contactShadow(L + 0.8, W + 0.9));
  return { group: g, spin: (ang) => wheels.forEach((w) => { w.rotation.z = -ang; }), L, W, H };
}

// The National Congress silhouette (generic massing): a long white platform with a ramp, the two
// office towers joined by a bridge, the upturned bowl (Câmara) on the right and the dome (Senado) on
// the left. Origin: floor centre; front +z. API { group, glow(k) } — the tower windows light up.
function makeCongressBuilding() {
  const g = new THREE.Group(), conc = pmat("#ebe7df", { roughness: 0.62 }), shade = pmat("#cfc9bd", { roughness: 0.7 });
  const plat = new THREE.Mesh(rbox(5.8, 0.34, 2.3, 0.03), conc); plat.position.y = 0.17; g.add(plat);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(5.82, 0.05, 2.32), shade); lip.position.y = 0.315; g.add(lip);
  // ramp from the lawn up to the platform, in front of the towers
  const rl = 1.9, ra = Math.atan2(0.34, rl);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, Math.hypot(rl, 0.34)), conc); ramp.position.set(-0.4, 0.17, 1.15 + rl / 2); ramp.rotation.x = ra; g.add(ramp);
  // towers: window rows on a canvas
  const c = makeCanvas(128, 512), x = c.getContext("2d"); x.fillStyle = "#e9e5dc"; x.fillRect(0, 0, 128, 512);
  for (let y = 6; y < 512; y += 18) { x.fillStyle = "#3a4656"; x.fillRect(4, y, 120, 9); }
  const wt = texFrom(c), winM = pmat("#ffffff", { map: wt, roughness: 0.4, emissive: "#ffcf8a", emissiveMap: wt, emissiveIntensity: 0 });
  const TH = 3.7;
  for (const s of [-1, 1]) {
    const tw = new THREE.Mesh(new THREE.BoxGeometry(0.42, TH, 1.2), [conc, conc, conc, conc, winM, winM]); tw.position.set(s * 0.27, 0.34 + TH / 2, -0.45); g.add(tw);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 1.0), conc); bridge.position.set(0, 0.34 + TH * 0.78, -0.45); g.add(bridge);
  // bowl (opens up) and dome
  const pts = [[0.18, 0], [0.42, 0.08], [0.72, 0.24], [0.98, 0.46], [1.04, 0.5]].map(([r, y]) => new THREE.Vector2(r, y));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), pmat("#f1eee7", { roughness: 0.5, side: THREE.DoubleSide })); bowl.position.set(1.75, 0.34 + 0.12, 0.15); g.add(bowl);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.14, 32), conc); stem.position.set(1.75, 0.34 + 0.07, 0.15); g.add(stem);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), pmat("#f1eee7", { roughness: 0.5 })); dome.scale.y = 0.62; dome.position.set(-1.75, 0.34, 0.15); g.add(dome);
  g.add(contactShadow(7, 3.4));
  return { group: g, glow: (k) => { winM.emissiveIntensity = 0.9 * k; } };
}

// Radio mast: three-legged lattice tower (red/white sections), cross-bracing every section, beacons,
// a top antenna, and broadcast rings that expand from the top (decor, not framed).
// Origin: floor centre. API { group, top: V3, waves(t, on) }
function makeRadioTower({ h = 4.2, base = 0.5, tip = 0.1, n = 9 } = {}) {
  const g = new THREE.Group(), red = pmat("#c8321f", { roughness: 0.5, metalness: 0.3 }), white = pmat("#ece8e0", { roughness: 0.5, metalness: 0.3 }), brace = pmat("#9aa0a6", { metalness: 0.8, roughness: 0.35 });
  const leg = (i, y) => { const r = lerp(base, tip, y / h), a = i * Math.PI * 2 / 3 + Math.PI / 2; return new V3(Math.cos(a) * r, y, Math.sin(a) * r); };
  for (let k = 0; k < n; k++) {
    const y0 = k * h / n, y1 = (k + 1) * h / n, m = k % 2 ? white : red;
    for (let i = 0; i < 3; i++) {
      g.add(strutBetween(leg(i, y0), leg(i, y1), 0.022, m));
      g.add(strutBetween(leg(i, y1), leg((i + 1) % 3, y1), 0.008, brace));
      g.add(strutBetween(leg(i, y0), leg((i + 1) % 3, y1), 0.007, brace));
    }
  }
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(base + 0.25, base + 0.3, 0.12, 6), pmat("#8c8780", { roughness: 0.9 })); pad.position.y = 0.06; g.add(pad);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.7, 10), brace); mast.position.y = h + 0.35; g.add(mast);
  const beaconM = new THREE.MeshBasicMaterial({ color: "#ff3b1f", toneMapped: false });
  for (const y of [h + 0.72, h * 0.55]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), beaconM); b.position.y = y; g.add(b); const halo = sprite(BOKEH, 0.4); halo.material.color.set("#ff5a3a"); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0.7; halo.position.y = y; halo.userData.decor = true; g.add(halo); }
  const top = new V3(0, h + 0.5, 0), rings = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.018, 8, 64), new THREE.MeshBasicMaterial({ color: "#ffb35c", transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    r.rotation.x = Math.PI / 2; r.position.copy(top); r.userData.decor = true; g.add(r); rings.push(r);
  }
  g.add(contactShadow(2.2, 2.2));
  function waves(t, on = 1) { rings.forEach((r, i) => { const k = ((t * 0.55 + i / rings.length) % 1); r.scale.setScalar(0.3 + 3.2 * k); r.material.opacity = on * 0.8 * (1 - k); r.position.y = top.y - 0.6 * k; }); }
  return { group: g, top, waves };
}

// Rooftop TV antenna: a mast, three crossbars of decreasing width and a small lamp at the top (on(k)).
// Origin: foot of the mast. API { group, on(k), tip: V3 }
function makeRoofAntenna({ h = 0.55 } = {}) {
  const g = new THREE.Group(), m = pmat("#a9adb2", { metalness: 0.85, roughness: 0.3 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, h, 8), m); mast.position.y = h / 2; g.add(mast);
  [0.36, 0.28, 0.2].forEach((w, i) => { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, w, 6), m); bar.rotation.z = Math.PI / 2; bar.position.y = h * (0.62 + i * 0.13); g.add(bar); });
  const lm = new THREE.MeshBasicMaterial({ color: "#ffb35c", toneMapped: false, transparent: true });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), lm); lamp.position.y = h + 0.03; g.add(lamp);
  const halo = sprite(BOKEH, 0.5); halo.material.color.set("#ffb35c"); halo.material.blending = THREE.AdditiveBlending; halo.position.y = h + 0.03; halo.userData.decor = true; g.add(halo);
  const on = (k) => { lm.color.set("#ffb35c").multiplyScalar(0.25 + 0.75 * k); halo.material.opacity = 0.85 * k; };
  on(0);
  return { group: g, on, tip: new V3(0, h + 0.03, 0) };
}

// Magnifying glass: brass rim, glass lens, turned wooden handle (towards -y). Origin: lens centre; the
// lens faces +z. API { group }
function makeMagnifier({ r = 0.32 } = {}) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.09, 14, 64), pmat("#c9a24e", { metalness: 1, roughness: 0.25 })); g.add(rim);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 48), glassMat({ opacity: 0.16, color: "#e8f4ff" })); g.add(lens);
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.1, r * 0.12, r * 0.3, 16), pmat("#c9a24e", { metalness: 1, roughness: 0.25 })); ferrule.position.y = -r - r * 0.2; g.add(ferrule);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.15, r * 1.5, 20), pmat("#ffffff", { map: woodTex("#3a2214"), roughness: 0.4, clearcoat: 0.6 })); handle.position.y = -r - r * 1.1; g.add(handle);
  return { group: g };
}

// Bank card (a generic one: no network logo): rounded slab with a gold chip, the holder's name printed
// big, and dotted digits (texture). Faces +z, upright; lay it flat with rotation.x = -PI/2.
// Origin: centre. API { group, name }
function makeBankCard({ name = "ASSESSOR", color = "#1d3557", w = 0.86 } = {}) {
  const g = new THREE.Group(), h = w * 0.63, t = 0.014;
  const body = new THREE.Mesh(rbox(w, h, t, 0.006), pmat(color, { roughness: 0.3, clearcoat: 1, metalness: 0.2 })); g.add(body);
  const chip = new THREE.Mesh(rbox(w * 0.14, h * 0.18, 0.004, 0.003), pmat("#d8b45a", { metalness: 1, roughness: 0.25 })); chip.position.set(-w * 0.3, h * 0.12, t / 2 + 0.002); g.add(chip);
  const dots = makePlate("•••• •••• 4821", w * 0.6, h * 0.12, { bg: color, fg: "#d7deea", depth: 0.002, detail: true }); dots.position.set(-w * 0.05, -h * 0.12, t / 2 + 0.001); g.add(dots);
  const nm = makePlate(name, w * 0.8, h * 0.2, { bg: color, fg: "#ffffff", depth: 0.002 }); nm.position.set(0, -h * 0.33, t / 2 + 0.001); g.add(nm);
  return { group: g, name: nm, w, h };
}

// Medal with two faces, standing on its edge: one face bright gold (a star in a ring), the other blackened
// iron. The pivot spins about the vertical axis: spin(0) shows the gold face (+z), spin(PI) the dark one.
// Origin: floor (the edge touches y = 0). API { group, pivot, spin(a), r }
function makeTwoFaceMedal({ r = 0.55, t = 0.1 } = {}) {
  const face = (bg0, bg1, ink, seed) => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), gr = x.createRadialGradient(200, 180, 20, 256, 256, 260);
    gr.addColorStop(0, bg0); gr.addColorStop(1, bg1); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = ink; x.lineWidth = 16; x.beginPath(); x.arc(256, 256, 214, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 5; x.beginPath(); x.arc(256, 256, 190, 0, Math.PI * 2); x.stroke();
    x.fillStyle = ink; x.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 58 : 140; x.lineTo(256 + Math.cos(a) * rr, 262 + Math.sin(a) * rr); }
    x.closePath(); x.fill();
    const rnd = mulberry32(seed); for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(0,0,0,${rnd() * 0.08})`; x.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    return texFrom(c);
  };
  const edgeC = makeCanvas(256, 32), ex = edgeC.getContext("2d"); ex.fillStyle = "#b8862a"; ex.fillRect(0, 0, 256, 32);
  for (let i = 0; i < 256; i += 6) { ex.fillStyle = "rgba(70,40,0,0.55)"; ex.fillRect(i, 0, 2, 32); }
  const et = texFrom(edgeC); et.wrapS = THREE.RepeatWrapping; et.repeat.set(10, 1);
  const gold = pmat("#ffffff", { map: face("#ffe3a0", "#c98f22", "#9a6408", 3), metalness: 0.85, roughness: 0.28 });
  const iron = pmat("#ffffff", { map: face("#3a3634", "#151312", "#9a918a", 9), metalness: 0.6, roughness: 0.5 });
  const edge = pmat("#ffffff", { map: et, metalness: 0.85, roughness: 0.3 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 72), [edge, gold, iron]); disc.rotation.x = Math.PI / 2;
  const g = new THREE.Group(), pivot = new THREE.Group(); pivot.position.y = r; pivot.add(disc); g.add(pivot);
  g.add(contactShadow(r * 2.2, r * 1.2));
  return { group: g, pivot, spin: (a) => { pivot.rotation.y = a; }, r };
}

// Rally at night behind the subject: a dusk-to-night sky, a far skyline, a crowd that fills the ground to
// the horizon, two truss towers with spotlights sweeping beams, and floating confetti lights.
// All backdrop. API { group, update(t), lights(k), crowdZ }
function makeRallyNight({ crowdZ = -2.4, seed = 5 } = {}) {
  const g = new THREE.Group();
  const c = makeCanvas(8, 512), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#070a1c"); gr.addColorStop(0.55, "#1b2150"); gr.addColorStop(0.85, "#5a2a4a"); gr.addColorStop(1, "#b2523a");
  x.fillStyle = gr; x.fillRect(0, 0, 8, 512);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false, fog: false })); sky.position.set(0, 18, -48); g.add(sky);
  const city = makeSkyline({ n: 30, z: -34, spread: 70, seed: seed + 2, hMin: 2, hMax: 7 }); g.add(city.group);
  const crowd = makeCrowdField({ rows: 34, cols: 46, sx: 0.6, sz: 0.62, z0: crowdZ, seed: seed + 4 }); g.add(crowd.group);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), mat("#1a1512", { roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.001, -40); g.add(ground);
  const beams = [], trussM = pmat("#3a3d42", { metalness: 0.8, roughness: 0.35 });
  for (const s of [-1, 1]) {
    const tx = s * 6.5, tz = crowdZ - 6;
    for (const dx of [-0.25, 0.25]) for (const dz of [-0.25, 0.25]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 9, 8), trussM); p.position.set(tx + dx, 4.5, tz + dz); g.add(p); }
    for (let y = 0.6; y < 9; y += 0.6) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 0.55), trussM); b.position.set(tx, y, tz); g.add(b); }
    for (const [col, k] of [["#ffb35c", 0], ["#7fb2ff", 1]]) {
      const head = new V3(tx, 8.6 - k * 0.5, tz), sh = makeLightShaft(head.toArray(), [tx * 0.2 + (k - 0.5) * 3, 0, crowdZ + 2], { w0: 0.4, w1: 4.5, color: col, opacity: 0.16 });
      g.add(sh.group); beams.push({ sh, head, s, k });
      const lamp = sprite(BOKEH, 1.4); lamp.material.color.set(col); lamp.material.blending = THREE.AdditiveBlending; lamp.position.copy(head); g.add(lamp);
    }
  }
  const confetti = makeBokeh({ n: 70, center: [0, 5, crowdZ - 4], spread: [26, 10, 10], size: [0.18, 0.5], colors: ["#ffcf8a", "#ff6a2b", "#9fc3ff", "#ffffff"], opacity: 0.6, seed: seed + 7, drift: 0.4 });
  g.add(confetti.group);
  asBackdrop(g);
  let lk = 1;
  return {
    group: g, crowdZ,
    update(t) {
      city.update(t); crowd.update(t); confetti.update(t);
      beams.forEach((b, i) => { b.sh.set(lk * (0.6 + 0.4 * Math.sin(t * 2.2 + i * 1.7))); });
    },
    lights(k) { lk = k; },
  };
}
