// ============================================================================
// props/sanitation.js · saneamento: bandeiras de país, escada do ranking (1 degrau = 1 ponto), privada,
// banheiro (fundo), piscina olímpica, corte do terreno com cano de esgoto e fossa, tapete persa que
// estufa com a sujeira embaixo, vassoura, batente com régua de crescimento.
// Também: globo de mesa (makeDeskGlobe), do vídeo dos homicídios (03/11/2026).
// Primeiro uso: videos/2026-11-02-saneamento-india.
// ============================================================================

// National flag on canvas (600 × 420): "brasil", "india" or "argentina". Cached.
function nationFlagTex(kind) {
  return cachedTex("flag-" + kind, () => {
    const c = makeCanvas(600, 420), x = c.getContext("2d");
    if (kind === "brasil") {
      x.fillStyle = "#009c3b"; x.fillRect(0, 0, 600, 420);
      x.fillStyle = "#ffdf00"; x.beginPath(); x.moveTo(300, 38); x.lineTo(562, 210); x.lineTo(300, 382); x.lineTo(38, 210); x.closePath(); x.fill();
      x.fillStyle = "#002776"; x.beginPath(); x.arc(300, 210, 104, 0, Math.PI * 2); x.fill();
      x.save(); x.beginPath(); x.arc(300, 210, 104, 0, Math.PI * 2); x.clip();
      x.strokeStyle = "#ffffff"; x.lineWidth = 15; x.beginPath(); x.arc(250, 470, 290, Math.PI * 1.16, Math.PI * 1.86); x.stroke();
      const r = mulberry32(5); x.fillStyle = "#ffffff";
      for (let i = 0; i < 27; i++) { const sx = 220 + r() * 160, sy = 205 + r() * 95; if (Math.hypot(sx - 300, sy - 210) < 96) { x.beginPath(); x.arc(sx, sy, 2 + r() * 3, 0, 6.3); x.fill(); } }
      x.restore();
    } else if (kind === "argentina") {
      x.fillStyle = "#74acdf"; x.fillRect(0, 0, 600, 420); x.fillStyle = "#ffffff"; x.fillRect(0, 140, 600, 140);
      x.fillStyle = "#f6b40e"; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; x.beginPath(); x.moveTo(300 + Math.cos(a - 0.12) * 26, 210 + Math.sin(a - 0.12) * 26); x.lineTo(300 + Math.cos(a) * 56, 210 + Math.sin(a) * 56); x.lineTo(300 + Math.cos(a + 0.12) * 26, 210 + Math.sin(a + 0.12) * 26); x.fill(); }
      x.beginPath(); x.arc(300, 210, 28, 0, Math.PI * 2); x.fill(); x.strokeStyle = "#85340a"; x.lineWidth = 2; x.stroke();
    } else {
      x.fillStyle = "#ff9933"; x.fillRect(0, 0, 600, 140);
      x.fillStyle = "#ffffff"; x.fillRect(0, 140, 600, 140);
      x.fillStyle = "#138808"; x.fillRect(0, 280, 600, 140);
      x.strokeStyle = "#000080"; x.lineWidth = 6; x.beginPath(); x.arc(300, 210, 56, 0, Math.PI * 2); x.stroke();
      x.lineWidth = 2.5; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; x.beginPath(); x.moveTo(300, 210); x.lineTo(300 + Math.cos(a) * 54, 210 + Math.sin(a) * 54); x.stroke(); }
      x.fillStyle = "#000080"; x.beginPath(); x.arc(300, 210, 10, 0, Math.PI * 2); x.fill();
    }
    // cloth: faint weave and a soft shading
    const r = mulberry32(9); for (let i = 0; i < 9000; i++) { x.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"; x.fillRect(r() * 600, r() * 420, 1.5, 1.5); }
    return texFrom(c);
  });
}

// Flag on a short pole with a weighted base and, on the pole, a name sign facing +z. The cloth waves
// (vertex wave, fixed at the pole). Origin: floor centre of the base.
// API { group, cloth, sign, update(t), h, baseR }
function makeNationFlag(kind, { poleH = 0.95, fw = 0.6, label = null } = {}) {
  const g = new THREE.Group(), steel = pmat("#c9ccd2", { metalness: 0.9, roughness: 0.28 }), baseR = 0.055;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.85, baseR, 0.035, 28), pmat("#24272c", { metalness: 0.6, roughness: 0.35 })); base.position.y = 0.0175; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, poleH, 14), steel); pole.position.y = 0.035 + poleH / 2; g.add(pole);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 })); knob.position.y = 0.035 + poleH + 0.015; g.add(knob);
  const fh = fw * 0.7, geo = new THREE.PlaneGeometry(fw, fh, 24, 12); geo.translate(fw / 2, 0, 0);
  const cloth = new THREE.Mesh(geo, mat("#ffffff", { map: nationFlagTex(kind), roughness: 0.82, side: THREE.DoubleSide }));
  cloth.position.set(0.012, 0.035 + poleH - fh / 2 - 0.01, 0); cloth.userData.cloth = true; g.add(cloth);
  const P = geo.attributes.position, X0 = Float32Array.from(P.array);
  let sign = null;
  if (label) {
    const sw = 0.36, sh = 0.1;
    sign = makePlate(label, sw, sh, { bg: "#141414", fg: "#ffffff" }); sign.position.set(0, 0.035 + poleH * 0.32, 0.016); g.add(sign);
    const clamp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, sh * 0.8, 12), steel); clamp1.position.set(0, 0.035 + poleH * 0.32, 0); g.add(clamp1);
  }
  g.add(contactShadow(0.3, 0.3));
  const ph = kind === "brasil" ? 0 : 1.7;
  function update(t) {
    for (let i = 0; i < P.count; i++) {
      const x0 = X0[i * 3], y0 = X0[i * 3 + 1], u = x0 / fw;
      P.array[i * 3 + 2] = u * (0.045 * Math.sin(x0 * 9 - t * 5.5 + ph) + 0.02 * Math.sin(y0 * 7 + x0 * 5 - t * 3.7 + ph));
      P.array[i * 3 + 1] = y0 - u * u * 0.02;
    }
    P.needsUpdate = true; geo.computeVertexNormals();
  }
  update(0);
  return { group: g, cloth, sign, update, h: 0.035 + poleH + 0.04, baseR };
}

// Concrete staircase of n steps climbing away from the camera (−z): step i (0-based) has its tread at
// height (i + 1)·rise, centred at z = −i·tread. 1 step = 1 point of a percentage (the ranking). Every
// 10th step has a steel nosing and, on the right side face, a printed "10%" mark. Origin: floor, front
// edge centre. API { group, at(p, laneX) → V3 (top of the tread for value p), rise, tread, w }
function makeRankStairs(n = 72, { rise = 0.05, tread = 0.14, w = 1.6, marks = 10 } = {}) {
  const g = new THREE.Group();
  const conc = pmat("#ffffff", { map: tileTex(noiseTex({ base: "#8d8781", amount: 0.16, size: 1.6, seed: 31 }), 2, 1), roughness: 0.85 });
  const band = pmat("#b7aea4", { roughness: 0.8, map: tileTex(noiseTex({ base: "#b7aea4", amount: 0.12, seed: 32 }), 2, 1) });
  const steel = pmat("#d0d3d8", { metalness: 0.85, roughness: 0.3 });
  const geo = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < n; i++) {
    const h = (i + 1) * rise, s = new THREE.Mesh(geo, i % marks === marks - 1 ? band : conc);
    s.scale.set(w, h, tread); s.position.set(0, h / 2, -i * tread); g.add(s);
    if ((i + 1) % marks === 0) {
      const nose = new THREE.Mesh(new THREE.BoxGeometry(w + 0.004, 0.012, 0.03), steel); nose.position.set(0, h - 0.006, -i * tread + tread / 2 - 0.014); g.add(nose);
      const lab = makePlate(`${i + 1}%`, 0.3, 0.1, { bg: "#1b1714", fg: "#f4e8da", detail: true }); lab.rotation.y = Math.PI / 2; lab.position.set(w / 2 + 0.095, h - 0.02, -i * tread); g.add(lab);
    }
  }
  // side walls (stringers) a touch higher than the steps: the stair reads as one built object
  for (const sx of [-1, 1]) {
    const shp = new THREE.Shape(); shp.moveTo(0, 0); shp.lineTo(0, rise + 0.06); shp.lineTo(-n * tread, n * rise + 0.06); shp.lineTo(-n * tread, 0); shp.closePath();
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: 0.08, bevelEnabled: false }), conc);
    wall.rotation.y = -Math.PI / 2; wall.position.set(sx * (w / 2 + 0.04) + 0.04, 0, tread / 2); g.add(wall);
  }
  g.add(contactShadow(w + 1, 2));
  const at = (p, laneX = 0) => { const i = Math.max(0, Math.floor(p) - 1); return p < 1 ? new V3(laneX, 0, tread) : new V3(laneX, (i + 1) * rise, -i * tread); };
  return { group: g, at, rise, tread, w, n };
}

// Places a flag on the stairs at value p (continuous): it hops step to step (a small arc between
// steps), resting on whole steps. Pure function of p.
function placeOnStairs(flag, stairs, p, laneX) {
  const i0 = Math.floor(p), f = p - i0, a = stairs.at(i0, laneX), b = stairs.at(i0 + 1, laneX);
  const k = sm(f, 0.15, 0.85);
  flag.group.position.copy(a).lerp(b, k); flag.group.position.y += Math.sin(Math.PI * k) * stairs.rise * 1.6;
  flag.group.position.applyMatrix4(stairs.group.matrixWorld);
}

// Two-piece toilet in glossy porcelain: bowl (lathe), pedestal, seat and open lid, tank with lid and a
// dual flush button on top. Water in the bowl swirls on flush. Origin: floor centre; faces +z.
// API { group, press(k), swirl(t, k), button (world point via localToWorld of buttonPos) }
function makeToiletBowl({ s = 1 } = {}) {
  const g = new THREE.Group(), por = pmat("#f4f2ee", { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const bowlProf = [[0.0, 0.0], [0.13, 0.0], [0.14, 0.04], [0.12, 0.2], [0.15, 0.3], [0.19, 0.38], [0.2, 0.41], [0.19, 0.42], [0.17, 0.41]].map(([r, y]) => new THREE.Vector2(r, y));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProf, 48), por); bowl.scale.set(1, 1, 1.28); bowl.position.z = 0.04; g.add(bowl);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.15, 40), mat("#e9eef0", { roughness: 0.1 })); inner.rotation.x = -Math.PI / 2; inner.scale.set(1, 1.28, 1); inner.position.set(0, 0.3, 0.04); g.add(inner);
  const c = makeCanvas(256, 256), x = c.getContext("2d"), wt = texFrom(c);
  const grd = x.createRadialGradient(128, 128, 10, 128, 128, 128); grd.addColorStop(0, "#5f8fa0"); grd.addColorStop(1, "#c9e2ea"); x.fillStyle = grd; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = "rgba(255,255,255,0.7)"; x.lineWidth = 6; for (let i = 0; i < 7; i++) { x.beginPath(); for (let a = 0; a < 6.28 * 1.4; a += 0.08) { const r = 18 + a * 14 + i * 3; const px = 128 + Math.cos(a + i * 0.9) * r, py = 128 + Math.sin(a + i * 0.9) * r; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  wt.needsUpdate = true; wt.center.set(0.5, 0.5);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.13, 40), new THREE.MeshPhysicalMaterial({ map: wt, roughness: 0.05, transparent: true, opacity: 0.85, clearcoat: 1 })); water.rotation.x = -Math.PI / 2; water.scale.set(1, 1.28, 1); water.position.set(0, 0.31, 0.04); g.add(water);
  const seatShape = new THREE.Shape(); seatShape.absellipse(0, 0, 0.2, 0.25, 0, Math.PI * 2); const hole = new THREE.Path(); hole.absellipse(0, 0.01, 0.13, 0.17, 0, Math.PI * 2); seatShape.holes.push(hole);
  const seat = new THREE.Mesh(new THREE.ExtrudeGeometry(seatShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 3 }), por);
  seat.rotation.x = -Math.PI / 2; seat.position.set(0, 0.432, 0.05); g.add(seat);
  const lid = new THREE.Mesh(new THREE.ExtrudeGeometry((() => { const sh = new THREE.Shape(); sh.absellipse(0, 0, 0.2, 0.25, 0, Math.PI * 2); return sh; })(), { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }), por);
  lid.scale.set(0.9, 0.86, 1); lid.rotation.x = -0.12; lid.position.set(0, 0.69, -0.15); g.add(lid);
  const tank = new THREE.Mesh(rbox(0.46, 0.5, 0.17, 0.04), por); tank.position.set(0, 0.67, -0.27); g.add(tank);
  const tankLid = new THREE.Mesh(rbox(0.49, 0.04, 0.2, 0.015), por); tankLid.position.set(0, 0.94, -0.27); g.add(tankLid);
  const btnRing = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 32), pmat("#c9ccd2", { metalness: 0.95, roughness: 0.2 })); btnRing.position.set(0, 0.966, -0.27); g.add(btnRing);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.014, 32), pmat("#e6e8ec", { metalness: 0.9, roughness: 0.18 })); btn.position.set(0, 0.974, -0.27); g.add(btn);
  const neckP = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 32), por); neckP.scale.set(1.3, 1, 1); neckP.position.set(0, 0.36, -0.18); g.add(neckP);
  g.scale.setScalar(s); g.add(contactShadow(0.8, 1.0));
  return {
    group: g, buttonPos: new V3(0, 0.98, -0.27),
    press(k) { btn.position.y = 0.974 - 0.008 * clamp(k); },
    swirl(t, k) { wt.rotation = -t * (1 + 7 * k); water.material.opacity = 0.75 + 0.2 * k; water.position.y = 0.31 - 0.04 * Math.sin(Math.PI * clamp(k)); },
  };
}

// Bathroom tiles: white glazed squares with grey grout, slight tone variation. Cached.
function bathTileTex(base = "#e9ecef", grout = "#9aa3ab", key = "a") {
  return cachedTex("bathtile-" + key, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(7); x.fillStyle = grout; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const tone = (r() - 0.5) * 14; const col = new THREE.Color(base).offsetHSL(0, 0, tone / 255); x.fillStyle = "#" + col.getHexString(); x.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); x.fillStyle = "rgba(255,255,255,0.18)"; x.fillRect(i * 128 + 8, j * 128 + 8, 50, 6); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// Bathroom at night (backdrop): tiled back wall and floor, a frosted window with cold blue night light
// and a shaft of it, a towel bar with a towel, a ceiling lamp. API { group, update(t), lights(k) }
function makeBathroomSet({ wallZ = -0.45, seed = 4 } = {}) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), mat("#ffffff", { map: tileTex(bathTileTex("#4f6468", "#2c383b", "slate"), 28, 12), roughness: 0.25 })); wall.position.set(0, 3, wallZ); g.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat("#ffffff", { map: tileTex(bathTileTex("#3c4650", "#20262c", "f"), 16, 12), roughness: 0.35 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.001, wallZ + 5); g.add(floor);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), mat("#ffffff", { map: tileTex(bathTileTex("#4f6468", "#2c383b", "slate"), 20, 12), roughness: 0.25 })); side.rotation.y = Math.PI / 2; side.position.set(-2.2, 3, wallZ + 5); g.add(side);
  const winGlow = new THREE.MeshBasicMaterial({ color: "#7fa8ff", toneMapped: false, fog: false });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), winGlow); win.position.set(0.95, 1.85, wallZ + 0.004); g.add(win);
  const wf = mat("#f2f2f0", { roughness: 0.4 });
  for (const [bw, bh, x, y] of [[0.88, 0.05, 0, 0.3], [0.88, 0.05, 0, -0.3], [0.05, 0.6, -0.42, 0], [0.05, 0.6, 0.42, 0], [0.03, 0.6, 0, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.05), wf); b.position.set(0.95 + x, 1.85 + y, wallZ + 0.02); g.add(b); }
  const shaft = makeLightShaft([0.95, 1.85, wallZ + 0.05], [0.4, 0, wallZ + 2.4], { w0: 0.7, w1: 1.6, color: "#8fb4ff", opacity: 0.12 }); g.add(shaft.group);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 12), pmat("#c9ccd2", { metalness: 0.95, roughness: 0.2 })); bar.rotation.z = Math.PI / 2; bar.position.set(-0.95, 1.15, wallZ + 0.07); g.add(bar);
  const tc = makeCanvas(128, 256), tx = tc.getContext("2d"); tx.fillStyle = "#e9e4da"; tx.fillRect(0, 0, 128, 256); tx.fillStyle = "#5d7f86"; for (const y of [196, 214]) tx.fillRect(0, y, 128, 8);
  const towelM = mat("#ffffff", { map: texFrom(tc), roughness: 1 });
  const towel = new THREE.Mesh(rbox(0.46, 0.62, 0.035, 0.015), towelM); towel.position.set(-0.95, 0.85, wallZ + 0.1); g.add(towel);
  const fold = new THREE.Mesh(rbox(0.46, 0.2, 0.035, 0.015), towelM); fold.position.set(-0.95, 1.06, wallZ + 0.045); g.add(fold);
  const lampM = new THREE.MeshBasicMaterial({ color: "#fff1d6", toneMapped: false });
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32), lampM); lamp.position.set(0, 2.9, wallZ + 1.0); g.add(lamp);
  const pl = new THREE.PointLight("#ffe2c0", 3, 6, 1.4); pl.position.set(0, 2.6, wallZ + 1.0); g.add(pl);
  const motes = makeSetMotes(50, [[-1, 0.3, wallZ + 0.2], [1.6, 2.4, wallZ + 2]], { color: "#cfe0ff", seed: seed + 3, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t) { motes.update(t); }, lights(k) { lampM.color.set("#fff1d6").multiplyScalar(0.2 + 0.8 * k); pl.intensity = 3 * k; } };
}

// Olympic pool as a scale model (50 × 25 m at 1:20 by default): concrete deck, tiled basin with the
// black lane lines on the floor, 8 lanes of float ropes, starting blocks. Water colour goes from clean
// blue to sewage brown. Origin: deck surface centre; the model stands on y = −(depth + 0.03) (set
// group.position.y = base). API { group, dirty(k), water, L, W, base }
function makeOlympicPool({ L = 2.5, W = 1.25, deck = 0.12, depth = 0.1 } = {}) {
  const g = new THREE.Group();
  const deckM = pmat("#ffffff", { map: tileTex(noiseTex({ base: "#cfcac2", amount: 0.1, seed: 41 }), 2, 1), roughness: 0.7 });
  const tileM = mat("#ffffff", { map: tileTex(bathTileTex("#5fa8d3", "#3f86b0", "pool"), L * 6, W * 6), roughness: 0.3 });
  // deck as four slabs around the basin
  const hs = depth + 0.03;
  for (const [w, d, x, z] of [[L + 2 * deck, deck, 0, -(W / 2 + deck / 2)], [L + 2 * deck, deck, 0, W / 2 + deck / 2], [deck, W, -(L / 2 + deck / 2), 0], [deck, W, L / 2 + deck / 2, 0]]) {
    const s = new THREE.Mesh(rbox(w, hs, d, 0.008), deckM); s.position.set(x, -hs / 2, z); g.add(s);
  }
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(L, 0.03, W), deckM); bottom.position.y = -depth - 0.015; g.add(bottom);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(L, W), tileM); floor.rotation.x = -Math.PI / 2; floor.position.y = -depth; g.add(floor);
  for (const [w, h, x, z, ry] of [[L, depth, 0, -W / 2, 0], [L, depth, 0, W / 2, Math.PI], [W, depth, -L / 2, 0, Math.PI / 2], [W, depth, L / 2, 0, -Math.PI / 2]]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tileM); p.rotation.y = ry; p.position.set(x, -depth / 2, z); g.add(p);
  }
  const lineM = mat("#14202c", { roughness: 0.5 });
  for (let i = 0; i < 8; i++) { const z = -W / 2 + (i + 0.5) * (W / 8), ln = new THREE.Mesh(new THREE.PlaneGeometry(L * 0.9, 0.012), lineM); ln.rotation.x = -Math.PI / 2; ln.position.set(0, -depth + 0.002, z); g.add(ln); }
  // float ropes: beads alternating red/white near the ends, blue/yellow in the middle
  const nB = 90, beads = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.006, 0.006, L / nB * 0.92, 10), pmat("#ffffff", { roughness: 0.35, clearcoat: 0.6 }), 7 * nB), o = new THREE.Object3D(), col = new THREE.Color();
  for (let r = 0; r < 7; r++) for (let i = 0; i < nB; i++) {
    const z = -W / 2 + (r + 1) * (W / 8), x = -L / 2 + (i + 0.5) * (L / nB), end = i < 9 || i >= nB - 9;
    o.position.set(x, -0.012, z); o.rotation.set(0, 0, Math.PI / 2); o.updateMatrix(); beads.setMatrixAt(r * nB + i, o.matrix);
    beads.setColorAt(r * nB + i, col.set(end ? (i % 2 ? "#d8282a" : "#f4f4f4") : (i % 2 ? "#1f5fbf" : "#f2c230")));
  }
  g.add(beads);
  for (let i = 0; i < 8; i++) { const z = -W / 2 + (i + 0.5) * (W / 8), b = new THREE.Mesh(rbox(0.04, 0.035, 0.05, 0.006), pmat("#f2f2f0", { roughness: 0.4 })); b.position.set(-L / 2 - deck / 2, 0.0175, z); g.add(b); }
  // pool ladders: two chrome rails bent over the edge at two corners
  const chrome = pmat("#e6e9ee", { metalness: 1, roughness: 0.15 });
  for (const [lx, lz] of [[L / 2 - 0.2, -W / 2], [-L / 2 + 0.2, W / 2]]) for (const dx of [-0.035, 0.035]) {
    const sg = Math.sign(lz), c = new THREE.CatmullRomCurve3([new V3(lx + dx, -depth * 0.8, lz - sg * 0.02), new V3(lx + dx, 0.03, lz - sg * 0.02), new V3(lx + dx, 0.06, lz + sg * 0.03), new V3(lx + dx, 0.0, lz + sg * 0.07)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.006, 8, false), chrome));
  }
  const wc = makeCanvas(512, 256), wx = wc.getContext("2d"), wr = mulberry32(17);
  wx.fillStyle = "#ffffff"; wx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 140; i++) { wx.strokeStyle = `rgba(120,150,170,${0.12 + wr() * 0.18})`; wx.lineWidth = 1 + wr() * 2.5; wx.beginPath(); wx.ellipse(wr() * 512, wr() * 256, 10 + wr() * 30, 4 + wr() * 10, wr() * 3, 0, Math.PI * (1 + wr())); wx.stroke(); }
  const wtex = texFrom(wc); wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping; wtex.repeat.set(2, 1);
  const wm = new THREE.MeshPhysicalMaterial({ color: "#3fa0d8", map: wtex, roughness: 0.04, transparent: true, opacity: 0.6, clearcoat: 1, depthWrite: false });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(L, W), wm); water.rotation.x = -Math.PI / 2; water.position.y = -0.014; water.userData.noShadow = true; g.add(water);
  const clean = new THREE.Color("#3fa0d8"), brown = new THREE.Color("#4a3a22");
  const sh = contactShadow(L + 0.8, W + 0.8); sh.position.y = -depth - 0.028; g.add(sh);
  return { group: g, water, L, W, base: depth + 0.03, dirty(k, t = 0) { wm.color.copy(clean).lerp(brown, clamp(k)); wm.opacity = 0.6 + 0.38 * clamp(k); wtex.offset.set(t * 0.03, t * 0.017); } };
}

// Block of earth cut open (a diorama): layered soil on the front and sides, a band of grass or floor on
// top. Origin: top surface centre (y = 0 is the ground line). API { group, w, h, d }
function soilLayersTex(seed = 3) {
  return cachedTex("soil-" + seed, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(seed);
    const bands = [["#5a3d26", 0.0], ["#6b4a2e", 0.22], ["#7a5634", 0.46], ["#5c4632", 0.7], ["#4a3a2c", 0.86]];
    bands.forEach(([col, y0], i) => { x.fillStyle = col; const y1 = i + 1 < bands.length ? bands[i + 1][1] : 1; x.beginPath(); x.moveTo(0, y0 * 512); for (let xx = 0; xx <= 512; xx += 32) x.lineTo(xx, y0 * 512 + Math.sin(xx * 0.02 + i) * 6); x.lineTo(512, 512); x.lineTo(0, 512); x.fill(); });
    for (let i = 0; i < 900; i++) { const v = r(); x.fillStyle = v < 0.5 ? `rgba(0,0,0,${0.25 * r()})` : `rgba(255,230,190,${0.15 * r()})`; const s = 1 + r() * 4; x.beginPath(); x.ellipse(r() * 512, r() * 512, s, s * 0.7, r() * 3, 0, 6.3); x.fill(); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(150,140,130,${0.4 + r() * 0.4})`; const s = 4 + r() * 9; x.beginPath(); x.ellipse(r() * 512, 100 + r() * 412, s, s * 0.7, r() * 3, 0, 6.3); x.fill(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function makeSoilCutaway({ w = 1.6, h = 0.9, d = 1.0, top = "grass", seed = 3 } = {}) {
  const g = new THREE.Group();
  const soil = mat("#ffffff", { map: soilLayersTex(seed), roughness: 0.95 });
  const topM = top === "grass" ? mat("#ffffff", { map: tileTex(grassTex(), w * 2, d * 2), roughness: 0.95 }) : mat("#ffffff", { map: tileTex(bathTileTex("#c9c1b2", "#8f877a", "beige"), w * 4, d * 4), roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [soil, soil, topM, soil, soil, soil]); body.position.y = -h / 2; g.add(body);
  g.add(contactShadow(w + 0.8, d + 0.8)); g.children[g.children.length - 1].position.y = -h + 0.002;
  return { group: g, w, h, d };
}

// Sewer pipe (ochre PVC) along a path, with a glowing flow inside that runs along it (dashes of dark
// water seen through a translucent window band). API { group, flow(t, k), curve }
function makeSewerPipe(points, { r = 0.045, color = "#9aa1a6" } = {}) {
  const g = new THREE.Group(), curve = new THREE.CatmullRomCurve3(points.map((p) => new V3(...p)), false, "catmullrom", 0.1);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, r, 16, false), pmat(color, { roughness: 0.45, clearcoat: 0.4 })); g.add(pipe);
  const c = makeCanvas(256, 16), x = c.getContext("2d"); x.fillStyle = "rgba(0,0,0,0)"; x.clearRect(0, 0, 256, 16);
  for (let i = 0; i < 4; i++) { const gr = x.createLinearGradient(i * 64, 0, i * 64 + 40, 0); gr.addColorStop(0, "rgba(255,150,60,0)"); gr.addColorStop(0.6, "rgba(255,150,60,1)"); gr.addColorStop(1, "rgba(255,150,60,0)"); x.fillStyle = gr; x.fillRect(i * 64, 0, 40, 16); }
  const ft = texFrom(c); ft.wrapS = THREE.RepeatWrapping; ft.repeat.set(curve.getLength() / 0.35, 1);
  const flowM = new THREE.MeshBasicMaterial({ map: ft, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, r * 1.08, 16, false), flowM); glow.userData.decor = true; g.add(glow);
  for (const p of [points[0], points[points.length - 1]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.05, r * 0.18, 10, 24), pmat(color, { roughness: 0.5 })); const tng = curve.getTangent(p === points[0] ? 0 : 1); ring.position.set(...p); ring.quaternion.setFromUnitVectors(new V3(0, 0, 1), tng); g.add(ring); }
  return { group: g, curve, flow(t, k) { ft.offset.x = -t * 1.6; flowM.opacity = 0.9 * clamp(k); } };
}

// Septic tank cut open: concrete box (thick walls) with a lid on top, a baffle inside, dark settled
// sludge at the bottom and liquid above it. Sized to sit in a soil cutaway. Origin: top centre (the lid).
// API { group, w, h, d }
function makeSepticTank({ w = 0.6, h = 0.42, d = 0.4, th = 0.035 } = {}) {
  const g = new THREE.Group(), conc = pmat("#ffffff", { map: tileTex(noiseTex({ base: "#6a655e", amount: 0.2, seed: 51 }), 1, 1), roughness: 0.85 });
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, th, d), conc); bottom.position.y = -h + th / 2; g.add(bottom);
  for (const [bw, bd, x, z] of [[th, d, -w / 2 + th / 2, 0], [th, d, w / 2 - th / 2, 0], [w, th, 0, -d / 2 + th / 2]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(bw, h, bd), conc); p.position.set(x, -h / 2, z); g.add(p); }
  const baffle = new THREE.Mesh(new THREE.BoxGeometry(th * 0.7, h * 0.7, d - 2 * th), conc); baffle.position.set(w * 0.12, -h * 0.4, 0); g.add(baffle);
  const lid = new THREE.Mesh(rbox(w + 0.04, th, d + 0.04, 0.008), conc); lid.position.y = th / 2; g.add(lid);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 20, Math.PI), pmat("#5a5f66", { metalness: 0.8, roughness: 0.4 })); handle.position.set(0, th + 0.002, 0); g.add(handle);
  const sludge = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * th, h * 0.2, d - 2 * th), mat("#3a2a1a", { roughness: 0.9 })); sludge.position.y = -h + th + h * 0.1; g.add(sludge);
  const liquid = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * th - 0.002, h * 0.42, d - 2 * th - 0.002), new THREE.MeshPhysicalMaterial({ color: "#3e3220", roughness: 0.1, transparent: true, opacity: 0.85, depthWrite: false })); liquid.position.y = -h + th + h * 0.2 + h * 0.21; g.add(liquid);
  return { group: g, w, h, d };
}

// Persian rug: deep red field, navy and gold borders, a central medallion, fringe on the short ends.
// Subdivided so it can bulge over what is swept under it. Origin: floor centre.
// API { group, bulge(list) } — list of [x, z, height, radius] (local); bulge([]) flattens it.
function persianRugTex() {
  return cachedTex("persian-rug", () => {
    const c = makeCanvas(1024, 680), x = c.getContext("2d"), r = mulberry32(11), W = 1024, H = 680;
    x.fillStyle = "#1f2a4a"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#c9a24e"; x.fillRect(22, 22, W - 44, H - 44);
    x.fillStyle = "#1f2a4a"; x.fillRect(34, 34, W - 68, H - 68);
    for (let i = 0; i < 40; i++) { x.fillStyle = i % 2 ? "#c9a24e" : "#8a2a22"; x.beginPath(); x.arc(60 + i * 23.5, 52, 6, 0, 6.3); x.fill(); x.beginPath(); x.arc(60 + i * 23.5, H - 52, 6, 0, 6.3); x.fill(); }
    x.fillStyle = "#8e1f1c"; x.fillRect(74, 74, W - 148, H - 148);
    x.strokeStyle = "rgba(201,162,78,0.55)"; x.lineWidth = 3;
    for (let i = 0; i < 14; i++) for (let j = 0; j < 9; j++) { const cx = 110 + i * 62, cy = 110 + j * 58; x.beginPath(); x.moveTo(cx, cy - 12); x.lineTo(cx + 10, cy); x.lineTo(cx, cy + 12); x.lineTo(cx - 10, cy); x.closePath(); x.stroke(); }
    x.save(); x.translate(W / 2, H / 2);
    for (const [rx, ry, col] of [[230, 160, "#1f2a4a"], [200, 136, "#c9a24e"], [180, 120, "#7a1816"], [110, 74, "#1f2a4a"], [80, 54, "#c9a24e"], [50, 34, "#8e1f1c"]]) { x.fillStyle = col; x.beginPath(); for (let a = 0; a < 6.3; a += 0.05) { const k = 1 + 0.06 * Math.sin(a * 8); const px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.fill(); }
    x.restore();
    for (let i = 0; i < 20000; i++) { x.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,240,220,0.05)"; x.fillRect(r() * W, r() * H, 1.5, 1.5); }
    return texFrom(c);
  });
}
function makePersianRug({ w = 2.4, d = 1.6, seg = 64 } = {}) {
  const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, d, seg, Math.round(seg * d / w)); geo.rotateX(-Math.PI / 2);
  const rug = new THREE.Mesh(geo, mat("#ffffff", { map: persianRugTex(), roughness: 0.95 })); rug.position.y = 0.012; rug.userData.cloth = true; g.add(rug);
  const under = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, d), mat("#3a2418", { roughness: 1 })); under.position.y = 0.005; g.add(under);
  const fr = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.07, 5), mat("#efe4cf", { roughness: 1 }), 2 * 60), o = new THREE.Object3D();
  for (let s = 0; s < 2; s++) for (let i = 0; i < 60; i++) { o.position.set((s ? 1 : -1) * (w / 2 + 0.03), 0.01, -d / 2 + (i + 0.5) * d / 60); o.rotation.set(0, 0, Math.PI / 2); o.updateMatrix(); fr.setMatrixAt(s * 60 + i, o.matrix); }
  g.add(fr);
  const P = geo.attributes.position, Y0 = Float32Array.from(P.array);
  function bulge(list) {
    for (let i = 0; i < P.count; i++) {
      const x = Y0[i * 3], z = Y0[i * 3 + 2]; let y = 0;
      for (const [bx, bz, bh, br] of list) { const dd = ((x - bx) ** 2 + (z - bz) ** 2) / (br * br); y = Math.max(y, bh * Math.exp(-dd * 2.2)); }
      P.array[i * 3 + 1] = y;
    }
    P.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere();
  }
  bulge([]);
  return { group: g, rug, bulge, w, d };
}

// Push broom seen side-on: varnished wooden handle, steel ferrule, wooden head with dense bristles.
// Origin: the bristle tips' centre on the floor; the handle leans back along −z.
// API { group, head }
function makeBroom({ len = 1.35, headW = 0.42, lean = 0.95 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#8a5a32"), roughness: 0.4, clearcoat: 0.5 });
  const head = new THREE.Group(); g.add(head);
  const block = new THREE.Mesh(rbox(headW, 0.05, 0.075, 0.012), wood); block.position.y = 0.105; head.add(block);
  const bristles = new THREE.Mesh(rbox(headW - 0.02, 0.085, 0.065, 0.01), mat("#ffffff", { map: tileTex(fabricTex("#2a2622"), 4, 1), roughness: 1 })); bristles.position.y = 0.042; head.add(bristles);
  const a = lean, hand = new THREE.Group(); hand.position.set(0, 0.13, 0); hand.rotation.x = -a; g.add(hand);
  const fer = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.08, 14), pmat("#c9ccd2", { metalness: 0.9, roughness: 0.3 })); fer.position.y = 0.04; hand.add(fer);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, len, 14), wood); stick.position.y = 0.08 + len / 2; hand.add(stick);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 14), pmat("#24262a", { roughness: 0.6 })); cap.position.y = 0.08 + len - 0.06; hand.add(cap);
  return { group: g, head };
}

// Door casing on a wall with a growth ruler on the jamb: tick marks every 10 cm and pencil marks with
// little printed tags (one per entry of `marks`: [height m, text]). Origin: floor, centre of the door
// opening on the wall plane; faces +z. API { group, tags: [{ group, y }], show(i, k) }
function makeGrowthDoor({ w = 0.9, h = 2.1, marks = [], ruler = 2.0, tagW = 0.34, tagH = 0.085 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#e9e0d0"), roughness: 0.5, clearcoat: 0.3 });
  const leafM = pmat("#ffffff", { map: woodTex("#6a4a32"), roughness: 0.45, clearcoat: 0.4 });
  const leaf = new THREE.Mesh(rbox(w - 0.02, h - 0.01, 0.04, 0.008), leafM); leaf.position.set(0, h / 2, -0.03); g.add(leaf);
  for (const [py, ph] of [[h * 0.72, h * 0.4], [h * 0.27, h * 0.36]]) { const pnl = new THREE.Mesh(rbox(w * 0.66, ph, 0.012, 0.006), pmat("#ffffff", { map: woodTex("#5a3c28"), roughness: 0.5 })); pnl.position.set(0, py, -0.004); g.add(pnl); }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), pmat(GOLD_METAL, { metalness: 1, roughness: 0.25 })); knob.position.set(-w / 2 + 0.1, h * 0.47, 0.02); g.add(knob);
  for (const [bw, bh, x, y] of [[0.1, h + 0.1, -w / 2 - 0.05, h / 2 + 0.05], [0.1, h + 0.1, w / 2 + 0.05, h / 2 + 0.05], [w + 0.2, 0.1, 0, h + 0.05]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.05, 0.01), wood); b.position.set(x, y, 0.02); g.add(b); }
  const rx = w / 2 + 0.05, rc = makeCanvas(64, 1024), rx2 = rc.getContext("2d");
  rx2.fillStyle = "#f6f1e6"; rx2.fillRect(0, 0, 64, 1024); rx2.fillStyle = "#2a2018";
  for (let i = 0; i <= 200; i++) { const y = 1024 - (i / 200) * 1024, long = i % 10 === 0; rx2.fillRect(0, y - 1, long ? 40 : i % 5 === 0 ? 26 : 14, long ? 3 : 1.5); }
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.06, ruler), mat("#ffffff", { map: texFrom(rc), roughness: 0.6 })); strip.position.set(rx, ruler / 2, 0.046); g.add(strip);
  const tags = marks.map(([y, text], i) => {
    const tg = new THREE.Group(); tg.position.set(rx, y, 0.05); g.add(tg);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.008), mat("#3a2a1e", { roughness: 0.8 })); line.position.set(-0.04, 0, 0.001); tg.add(line);
    const last = i === marks.length - 1, pw = tagW * (last ? 1.2 : 1), p = makePlate(text, pw, tagH * (last ? 1.2 : 1), { bg: last ? ORANGE : "#1b1714", fg: "#ffffff", depth: 0.01 }); p.position.set(0.06 + pw / 2, 0, 0.006); tg.add(p);
    return { group: tg, y, x: rx };
  });
  // tag i slides in from the right at full size (k 0..1); earlier tags stay
  function show(i, k) { tags.forEach((T, j) => { const v = j < i ? 1 : j === i ? clamp(k) : 0; T.group.visible = v > 0.01; T.group.position.x = T.x + 0.25 * (1 - eOut(v)); }); }
  show(-1, 0);
  return { group: g, tags, show, w, h };
}

// ---------------------------------------------------------------- the desk globe (vídeo dos homicídios)
// Simplified continent outlines [lon, lat] for a generic globe (no real map data: a few points each).
const GLOBE_LANDS = [
  [[-168, 66], [-140, 70], [-95, 72], [-80, 63], [-60, 55], [-66, 45], [-75, 35], [-81, 25], [-97, 26], [-97, 20], [-87, 15], [-80, 8], [-90, 14], [-105, 20], [-112, 30], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  [[-55, 60], [-42, 60], [-20, 70], [-25, 82], [-60, 82], [-70, 76]],
  [[-80, 8], [-62, 10], [-50, 0], [-35, -6], [-39, -15], [-48, -25], [-58, -38], [-65, -55], [-72, -50], [-71, -30], [-76, -15], [-81, -5]],
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 12], [40, -2], [40, -15], [33, -27], [20, -35], [12, -18], [9, -2], [5, 5], [-8, 5], [-17, 14]],
  [[-10, 36], [-9, 44], [-2, 48], [5, 52], [10, 58], [5, 62], [15, 69], [30, 71], [60, 70], [80, 73], [110, 76], [140, 72], [170, 68], [180, 66], [160, 60], [140, 55], [135, 43], [122, 40], [121, 30], [110, 20], [106, 10], [100, 13], [98, 8], [92, 22], [80, 15], [77, 8], [72, 20], [60, 25], [57, 25], [50, 30], [48, 29], [55, 17], [44, 12], [35, 30], [28, 37], [26, 40], [20, 40], [15, 38], [12, 44], [5, 43], [-2, 37]],
  [[114, -22], [122, -17], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [141, -38], [131, -31], [116, -35], [113, -26]],
  [[-8, 50], [-5, 58], [0, 57], [1, 51]], [[44, -16], [50, -14], [48, -25], [44, -22]], [[130, 31], [140, 35], [142, 43], [136, 37]],
  [[95, 5], [105, -6], [115, -8], [118, 2], [108, 3]], [[131, -2], [141, -3], [150, -10], [140, -8]],
];
const GLOBE_BRAZIL = [[-73, -8], [-70, 2], [-60, 5], [-51, 4], [-35, -5], [-39, -14], [-41, -22], [-48, -26], [-53, -33], [-57, -30], [-58, -20], [-62, -12], [-70, -10]];
// Equirectangular painting of the globe: ocean, a faint grid, beige land and (brazil) Brazil in green with a yellow rim.
function globeTex(brazil) {
  return cachedTex("globe-" + brazil, () => {
    const W2 = 2048, H2 = 1024, c = makeCanvas(W2, H2), x = c.getContext("2d"), P = ([lo, la]) => [(lo + 180) / 360 * W2, (90 - la) / 180 * H2];
    const sea = x.createLinearGradient(0, 0, 0, H2); sea.addColorStop(0, "#2a5f86"); sea.addColorStop(0.5, "#1f557e"); sea.addColorStop(1, "#2a5f86"); x.fillStyle = sea; x.fillRect(0, 0, W2, H2);
    speckle(x, W2, H2, 31, 14000, 0.08, 0.05, 2);
    x.strokeStyle = "rgba(230,240,250,0.18)"; x.lineWidth = 2;
    for (let lo = -180; lo <= 180; lo += 30) { const [px] = P([lo, 0]); x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H2); x.stroke(); }
    for (let la = -60; la <= 60; la += 30) { const [, py] = P([0, la]); x.beginPath(); x.moveTo(0, py); x.lineTo(W2, py); x.stroke(); }
    const poly = (pts, fill, stroke, lw) => { x.beginPath(); pts.forEach((p, i) => { const [px, py] = P(p); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); x.fillStyle = fill; x.fill(); if (stroke) { x.strokeStyle = stroke; x.lineWidth = lw; x.stroke(); } };
    GLOBE_LANDS.forEach((pts) => poly(pts, "#cdbb8c", "rgba(90,70,40,0.6)", 3));
    x.fillStyle = "#e9eef2"; x.fillRect(0, P([0, -70])[1], W2, H2);
    if (brazil) poly(GLOBE_BRAZIL, "#2fae66", "#f2c418", 8);
    return texFrom(c);
  });
}
// Desk globe: the sphere (oceans, simplified continents, Brazil in green and yellow when `brazil`) tilted
// 23.5° inside a full brass meridian ring, on a stem and a turned wooden foot. spin(a) turns the sphere
// about its axis (a = 0: Brazil faces +z). Origin: table top, centre. API { group, ball, spin(a), h, cy }
function makeDeskGlobe({ r = 0.22, brazil = true } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.35, clearcoat: 0.7 }), brass = pmat(GOLD_METAL, { metalness: 1, roughness: 0.28 });
  const prof = [[0, 0], [r * 0.75, 0], [r * 0.78, 0.02], [r * 0.6, 0.045], [r * 0.18, 0.07], [r * 0.12, 0.09], [0, 0.09]].map(([a, b]) => new THREE.Vector2(a, b));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), wood));
  const R2 = r * 1.08, cy = 0.09 + r * 0.45 + R2;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.04, r * 0.06, cy - R2 - 0.09 + 0.01, 14), brass); stem.position.y = 0.09 + (cy - R2 - 0.09) / 2; g.add(stem);
  const tilt = new THREE.Group(); tilt.position.y = cy; tilt.rotation.z = 0.41; g.add(tilt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R2, r * 0.028, 10, 72), brass); tilt.add(ring);
  for (const s of [-1, 1]) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.02, r * 0.02, R2 - r + 0.01, 8), brass); pin.position.y = s * (r + (R2 - r) / 2); tilt.add(pin); }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), pmat("#ffffff", { map: globeTex(brazil), roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.12 })); tilt.add(ball);
  // the stem meets the ring at its lowest point (straight under the centre)
  const knob = new THREE.Mesh(new THREE.SphereGeometry(r * 0.06, 12, 8), brass); knob.position.y = cy - R2; g.add(knob);
  g.add(contactShadow(r * 2.2, r * 2.2));
  const spin = (a) => { ball.rotation.y = -0.664 + a; };
  spin(0);
  return { group: g, ball, spin, h: cy + R2 + r * 0.03, cy };
}
