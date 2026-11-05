// ---------------------------------------------------------------- sets: the place behind the hero
// docs/visual.md → "Plano de fundo": every shot shows a place you recognise in 1 s, in three layers,
// with a light you can see and a second colour (pedido do Samuel, 31/10/2026: "planos de fundo mais
// interessantes"). In 9:16 the background shows mostly ABOVE and BELOW the hero and little to the
// sides, so these sets put their interest there: lit ceiling and high windows up top, a lit floor below.
// Everything here is backdrop (asBackdrop): never framed by CAM.pose, never checked by the QA.

// Soft round spot (dust motes, pools of light).
function setGlowTex() {
  return cachedTex("set-glow", () => {
    const c = makeCanvas(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return texFrom(c);
  });
}
// Beam: bright where the light enters (uv v = 0), fading along the beam, soft at both edges.
function setBeamTex() {
  return cachedTex("set-beam", () => {
    const c = makeCanvas(64, 256), x = c.getContext("2d"), img = x.createImageData(64, 256);
    for (let j = 0; j < 256; j++) for (let i = 0; i < 64; i++) {
      const u = i / 63, v = 1 - j / 255, a = Math.pow(Math.sin(Math.PI * u), 1.6) * Math.pow(1 - v, 1.4) * Math.min(1, v / 0.06), k = (j * 64 + i) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255; img.data[k + 3] = Math.round(255 * a);
    }
    x.putImageData(img, 0, 0); return texFrom(c);
  });
}
// Night city seen through a window: deep blue sky, tower silhouettes, warm and cool lit windows.
function nightCityTex(seed = 3) {
  return cachedTex("set-city" + seed, () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"), r = mulberry32(seed), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#0a1230"); g.addColorStop(0.65, "#22335f"); g.addColorStop(1, "#3b4c7e"); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    for (let px = -6; px < 256;) {
      const bw = 18 + r() * 40, bh = 70 + r() * 150;
      x.fillStyle = `rgb(${9 + r() * 8},${13 + r() * 8},${26 + r() * 12})`; x.fillRect(px, 256 - bh, bw, bh);
      for (let yy = 256 - bh + 6; yy < 250; yy += 9) for (let xx = px + 4; xx < px + bw - 5; xx += 7) if (r() < 0.36) { x.fillStyle = r() < 0.72 ? `rgba(255,${196 + r() * 44},${120 + r() * 70},0.95)` : "rgba(170,205,255,0.9)"; x.fillRect(xx, yy, 4, 5); }
      px += bw + 2 + r() * 6;
    }
    return texFrom(c);
  });
}
// Acoustic ceiling tiles: a light grid on a dark warm board.
function setCeilingTex() {
  return cachedTex("set-ceiling", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"); x.fillStyle = "#3a2f28"; x.fillRect(0, 0, 256, 256);
    speckle(x, 256, 256, 31, 2500, 0.1, 0.05, 1.5);
    x.fillStyle = "#4f433a"; x.fillRect(0, 0, 256, 5); x.fillRect(0, 0, 5, 256);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// Volumetric light beam (through a window, from a lamp): two crossed planes, additive, fading along
// the beam. from/to: world points; w0/w1: width at each end. API { group, set(k, color?) }
function makeLightShaft(from, to, { w0 = 0.8, w1 = 2.4, color = "#9db8ff", opacity = 0.14 } = {}) {
  const a = new V3(...from), b = new V3(...to), L = a.distanceTo(b), geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-w0 / 2, 0, 0, w0 / 2, 0, 0, -w1 / 2, L, 0, w1 / 2, L, 0], 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2)); geo.setIndex([0, 1, 2, 2, 1, 3]);
  const m = new THREE.MeshBasicMaterial({ map: setBeamTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
  const g = new THREE.Group();
  for (const ry of [0, Math.PI / 2]) { const p = new THREE.Mesh(geo, m); p.rotation.y = ry; g.add(p); }
  g.position.copy(a); g.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize());
  const base = new THREE.Color(color); asBackdrop(g);
  return { group: g, set(k, c) { if (c) base.set(c); m.color.copy(base); m.opacity = opacity * k; } };
}
// Soft pool of light lying on the floor (under a lamp, where a beam lands). Returns the mesh.
function makeFloorGlow(w, d, { color = "#ffd9a8", opacity = 0.16 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: setGlowTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.userData.decor = true; return m;
}
// Dust floating in the light. box [[x0, y0, z0], [x1, y1, z1]]. API { points, mtl, update(t) }
function makeSetMotes(n, box, { color = "#ffe2c0", size = 0.05, opacity = 0.55, seed = 3 } = {}) {
  const r = mulberry32(seed), base = [];
  for (let i = 0; i < n; i++) base.push([lerp(box[0][0], box[1][0], r()), lerp(box[0][1], box[1][1], r()), lerp(box[0][2], box[1][2], r()), r() * 6.28]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const mtl = new THREE.PointsMaterial({ color, size, map: setGlowTex(), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mtl); points.userData.decor = true; points.frustumCulled = false;
  const H = box[1][1] - box[0][1];
  const update = (t) => {
    const p = geo.attributes.position.array;
    base.forEach(([x, y, z, ph], i) => { p[i * 3] = x + 0.25 * Math.sin(t * 0.21 + ph); p[i * 3 + 1] = box[0][1] + ((y - box[0][1] + 0.05 * t + 1000 * H) % H); p[i * 3 + 2] = z + 0.2 * Math.cos(t * 0.17 + ph); });
    geo.attributes.position.needsUpdate = true;
  };
  update(0); return { points, mtl, update };
}
// Window with half-open blinds and the city at night behind it. Origin: centre of the opening, on
// the wall plane (the view sits 0.14 behind it). API { group, set(k, color?) } — dims the city or
// tints it (police lights: set(1, "#ff3b3b")).
function makeSetWindow(w = 2.2, h = 2.8, { slats = 13, open = 0.62, seed = 3 } = {}) {
  const g = new THREE.Group(), cityMat = new THREE.MeshBasicMaterial({ map: nightCityTex(seed), toneMapped: false, fog: false });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cityMat); view.position.z = -0.14; g.add(view);
  const reveal = mat("#2b211b", { roughness: 0.85 }), frame = mat("#1c1612", { roughness: 0.45, metalness: 0.25 });
  for (const [bw, bh, x, y] of [[w, 0.02, 0, h / 2], [w, 0.02, 0, -h / 2], [0.02, h, -w / 2, 0], [0.02, h, w / 2, 0]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.14), reveal); p.position.set(x, y, -0.07); g.add(p);
  }
  for (const [bw, bh, x, y] of [[w + 0.14, 0.07, 0, h / 2 + 0.035], [0.07, h, -w / 2 - 0.035, 0], [0.07, h, w / 2 + 0.035, 0], [0.04, h, 0, 0], [w, 0.04, 0, -h * 0.08]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.05), frame); p.position.set(x, y, -0.1 + (bw === 0.04 || bh === 0.04 ? 0 : 0.1)); g.add(p);
  }
  const sill = new THREE.Mesh(rbox(w + 0.3, 0.06, 0.2, 0.01), mat("#3a2a20", { roughness: 0.5 })); sill.position.set(0, -h / 2 - 0.03, 0.06); g.add(sill);
  // blinds: tilted slats over the top part, the city shows between them
  const slatMat = mat("#c9c4bb", { roughness: 0.55, metalness: 0.2 }), step = (h * open) / slats;
  for (let i = 0; i < slats; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, step * 0.62, 0.006), slatMat); s.position.set(0, h / 2 - (i + 0.5) * step, -0.03); s.rotation.x = -0.75; g.add(s); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.05, 0.05), slatMat); rail.position.set(0, h / 2 - h * open - 0.02, -0.03); g.add(rail);
  asBackdrop(g);
  return { group: g, set(k, c = "#ffffff") { cityMat.color.set(c).multiplyScalar(k); } };
}
// Steel shelving with archive boxes (case files). Origin: floor centre, back against the wall.
function makeArchiveShelf({ w = 1.8, h = 2.5, d = 0.45, levels = 5, seed = 4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), steel = mat("#5a646b", { metalness: 0.6, roughness: 0.45 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const u = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, 0.04), steel); u.position.set(sx * (w / 2 - 0.02), h / 2, sz * (d / 2 - 0.02)); g.add(u); }
  const gap = (h - 0.12) / (levels - 1), tones = ["#ffffff", "#e8dccb", "#d9c4a4", "#f2ece2"];
  for (let l = 0; l < levels; l++) {
    const y = 0.1 + l * gap, sh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), steel); sh.position.set(0, y, 0); g.add(sh);
    if (l === levels - 1) break;
    for (let x = -w / 2 + 0.05; x < w / 2 - 0.3;) {
      const bw = 0.26 + r() * 0.12, bh = gap * (0.62 + r() * 0.2), skip = r() < 0.08;
      if (!skip) {
        const box = new THREE.Mesh(rbox(bw - 0.02, bh, d * 0.85, 0.008), mat(tones[Math.floor(r() * tones.length)], { map: cardboardTex(), roughness: 0.85 }));
        box.position.set(x + bw / 2, y + 0.0125 + bh / 2, 0.02); g.add(box);
        const label = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.5, bh * 0.22), mat("#f4efe6", { roughness: 0.9 })); label.position.set(x + bw / 2, y + bh * 0.62, 0.02 + d * 0.425 + 0.001); g.add(label);
      }
      x += bw;
    }
  }
  asBackdrop(g); return g;
}
// Office wall clock; the hands sweep with t (start = the hour on screen at t = 0). Origin: centre, back
// on the wall. API { group, update(t) }
function makeWallClock(rad = 0.32, { start = 22.1 } = {}) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 0.04, 48), mat("#efe7d8", { roughness: 0.6 })); face.rotation.x = Math.PI / 2; face.position.z = 0.02; g.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.03, 12, 48), mat("#1a1a1a", { metalness: 0.5, roughness: 0.35 })); rim.position.z = 0.045; g.add(rim);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, tk = new THREE.Mesh(new THREE.BoxGeometry(i % 3 ? 0.015 : 0.03, 0.06, 0.005), mat("#222")); tk.position.set(Math.sin(a) * rad * 0.82, Math.cos(a) * rad * 0.82, 0.043); tk.rotation.z = -a; g.add(tk); }
  const hand = (len, wd, color, z) => { const p = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.006), mat(color)); m.position.y = len / 2 - 0.03; p.add(m); p.position.z = z; g.add(p); return p; };
  const hh = hand(rad * 0.5, 0.03, "#1d1d1d", 0.046), mh = hand(rad * 0.75, 0.02, "#1d1d1d", 0.05), sh = hand(rad * 0.85, 0.008, "#d02a1e", 0.054);
  asBackdrop(g);
  const update = (t) => { const s = start * 3600 + t; sh.rotation.z = -(s % 60) / 60 * Math.PI * 2; mh.rotation.z = -(s % 3600) / 3600 * Math.PI * 2; hh.rotation.z = -(s % 43200) / 43200 * Math.PI * 2; };
  update(0); return { group: g, update };
}

// The PF / investigation office around a board or a desk: polished plank floor, warm plaster wall with
// a wood wainscot, two windows with blinds and the city at night (the cool second colour) on each side
// of the clear middle, beams of window light with dust, archive shelves, a wall clock, and a ceiling of
// lit panels receding towards the camera (up top in a 9:16 frame) with their pools of light on the
// floor (down low). clear = width kept free for the hero against the wall at wallZ.
// API { group, motes, update(t), windows(k, color?), lights(k) } — beats: the windows flash red and
// blue ("alvo da PF"), the lights die ("liquidado").
function makeOfficeSet({ wallZ = -1.3, clear = 10, ceil = 6.4, depth = 40, wall = "#5d4637", seed = 4 } = {}) {
  const g = new THREE.Group(), W = 60, zc = wallZ + depth / 2;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat("#ffffff", { map: tileTex(woodTex("#3e2a1d"), 16, 11), roughness: 0.34, envMapIntensity: 0.7 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.003, zc); g.add(fl);
  // back wall with the two window openings cut out (ShapeGeometry uv = metres: one plaster tile per 5 m)
  const wx = clear / 2 + 1.7, WIN = { w: 2.2, h: 2.8, y: 3.3 };
  const shape = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, ceil), new THREE.Vector2(-W / 2, ceil)]);
  for (const s of [-1, 1]) { const x0 = s * wx - WIN.w / 2, y0 = WIN.y - WIN.h / 2; shape.holes.push(new THREE.Path([new THREE.Vector2(x0, y0), new THREE.Vector2(x0, y0 + WIN.h), new THREE.Vector2(x0 + WIN.w, y0 + WIN.h), new THREE.Vector2(x0 + WIN.w, y0)])); }
  const wl = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat("#ffffff", { map: tileTex(plasterTex(wall), 0.2, 0.2), roughness: 0.92 })); wl.position.z = wallZ; g.add(wl);
  const wain = new THREE.Mesh(new THREE.BoxGeometry(W, 1.05, 0.05), mat("#ffffff", { map: tileTex(woodTex("#4a2f1f"), 18, 1), roughness: 0.5 })); wain.position.set(0, 0.525, wallZ + 0.025); g.add(wain);
  const railMat = mat("#2c1d14", { roughness: 0.45 });
  for (const y of [1.06, 0.06]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.08), railMat); rl.position.set(0, y, wallZ + 0.04); g.add(rl); }
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat("#ffffff", { map: tileTex(setCeilingTex(), W / 1.2, depth / 1.2), roughness: 0.95 }));
  cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, zc); g.add(cl);
  // ceiling panels in rows towards the camera, each with its pool of light on the floor
  const panelMat = new THREE.MeshBasicMaterial({ color: "#ffe6c2", toneMapped: false, fog: true }), pools = [];
  for (let z = wallZ + 1.8; z < wallZ + depth - 2; z += 3.4) for (const x of [-6.6, -2.2, 2.2, 6.6]) {
    const pn = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.62), panelMat); pn.rotation.x = Math.PI / 2; pn.position.set(x, ceil - 0.01, z); g.add(pn);
    const pool = makeFloorGlow(3.2, 2.2, { color: "#ffd7a6", opacity: 0.07 }); pool.position.set(x, 0.008, z); g.add(pool); pools.push(pool);
  }
  // windows, their beams and the dust in them
  const wins = [], beams = [];
  for (const s of [-1, 1]) {
    const wn = makeSetWindow(WIN.w, WIN.h, { seed: seed + (s > 0 ? 1 : 0) }); wn.group.position.set(s * wx, WIN.y, wallZ); g.add(wn.group); wins.push(wn);
    const bm = makeLightShaft([s * wx, 3.4, wallZ + 0.1], [s * (wx + 0.3), 0.05, wallZ + 4.6], { w0: 2.0, w1: 3.0, color: "#9db8ff", opacity: 0.11 }); g.add(bm.group); beams.push(bm);
    const lp = makeFloorGlow(3.0, 2.4, { color: "#9db8ff", opacity: 0.12 }); lp.position.set(s * (wx + 0.3), 0.01, wallZ + 4.2); g.add(lp);
    for (const [k, off] of [[0, 2.15], [1, 4.15]]) { const sh = makeArchiveShelf({ seed: seed + k + (s > 0 ? 3 : 0) }); sh.position.set(s * (wx + off), 0, wallZ + 0.25); g.add(sh); }
  }
  const clock = makeWallClock(0.3); clock.group.position.set(-wx, 5.45, wallZ + 0.01); g.add(clock.group);
  const motes = makeSetMotes(220, [[-wx - 1.6, 0.2, wallZ + 0.2], [wx + 1.6, 4.6, wallZ + 5]], { color: "#cfe0ff", seed: seed + 7 }); g.add(motes.points);
  asBackdrop(g);
  // windows(k, c) and lights(k) apply at once and stay until changed: call them every frame of a beat
  const panelBase = new THREE.Color("#ffe6c2"); let winK = 1, winC = null, lastT = 0;
  const applyWindows = () => { wins.forEach((w) => w.set(winK, winC || "#ffffff")); beams.forEach((b, i) => b.set(winK * (0.85 + 0.15 * Math.sin(lastT * 0.7 + i * 2)), winC || "#9db8ff")); };
  return {
    group: g, motes,
    update(t) { lastT = t; motes.update(t); clock.update(t); applyWindows(); },
    windows(k, c = null) { winK = k; winC = c; applyWindows(); },
    lights(k) { panelMat.color.copy(panelBase).multiplyScalar(k); pools.forEach((p) => { p.material.opacity = 0.07 * k; }); },
  };
}

// Brick wall texture (warm red-brown bricks, dark mortar, a little soot). Repeat 1 tile ≈ 1.2 × 0.6 m.
function setBrickTex() {
  return cachedTex("set-brick", () => {
    const c = makeCanvas(256, 128), x = c.getContext("2d"), r = mulberry32(41); x.fillStyle = "#2a1c16"; x.fillRect(0, 0, 256, 128);
    for (let row = 0; row < 8; row++) for (let col = -1; col < 5; col++) {
      const bx = col * 64 + (row % 2) * 32 + 2, by = row * 16 + 2, v = 0.75 + r() * 0.35;
      x.fillStyle = `rgb(${Math.round(120 * v)},${Math.round(62 * v)},${Math.round(44 * v)})`; x.fillRect(bx, by, 60, 12);
    }
    speckle(x, 256, 128, 43, 1800, 0.12, 0.05, 1.5);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Tall wooden bookcase full of leather-bound ledgers with gold bands on the spines (the "Grande Livro"
// of an old treasury archive). Origin: floor centre, back against the wall; faces +z. Instanced books.
function makeLedgerShelf({ w = 2.2, h = 4.4, d = 0.5, levels = 6, seed = 8 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const wood = pmat("#ffffff", { map: woodTex("#3a2416"), roughness: 0.5, clearcoat: 0.25 });
  for (const sx of [-1, 1]) { const s = new THREE.Mesh(rbox(0.07, h, d, 0.012), wood); s.position.set(sx * (w / 2 - 0.035), h / 2, 0); g.add(s); }
  const top = new THREE.Mesh(rbox(w + 0.14, 0.12, d + 0.08, 0.02), wood); top.position.set(0, h + 0.06, 0.01); g.add(top);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, h), mat("#1f140d", { roughness: 0.85 })); back.position.set(0, h / 2, -d / 2 + 0.01); g.add(back);
  const gap = (h - 0.1) / levels, leathers = ["#5a1d18", "#2c3a26", "#3b2414", "#6b4a22", "#22283a", "#4a1f2c", "#5b3a1a"];
  const books = [], bands = [];
  for (let l = 0; l < levels; l++) {
    const y = 0.05 + l * gap, sh = new THREE.Mesh(rbox(w - 0.1, 0.035, d - 0.04, 0.008), wood); sh.position.set(0, y, 0.01); g.add(sh);
    for (let x = -w / 2 + 0.09; x < w / 2 - 0.16;) {
      const bw = 0.07 + r() * 0.05, bh = gap * (0.68 + r() * 0.22);
      if (r() > 0.05) { books.push([x + bw / 2, y + 0.0175 + bh / 2, bw - 0.008, bh, leathers[Math.floor(r() * leathers.length)]]); for (const f of [0.18, 0.78]) bands.push([x + bw / 2, y + 0.0175 + bh * f, bw - 0.006]); }
      x += bw;
    }
  }
  const leatherT = cachedTex("ledger-leather", () => noiseTex({ base: "#bdbdbd", amount: 0.22, size: 1.5, seed: 47 }));
  const bm = new THREE.InstancedMesh(rbox(1, 1, 1, 0.08), pmat("#ffffff", { map: leatherT, roughness: 0.62, clearcoat: 0.15 }), books.length);
  const o = new THREE.Object3D(), col = new THREE.Color();
  books.forEach(([x, y, bw, bh, c], i) => { o.position.set(x, y, 0.02); o.scale.set(bw, bh, d * 0.74); o.updateMatrix(); bm.setMatrixAt(i, o.matrix); bm.setColorAt(i, col.set(c)); });
  g.add(bm);
  const gm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.012, 0.01), pmat("#c9a24e", { metalness: 1, roughness: 0.3 }), bands.length);
  bands.forEach(([x, y, bw], i) => { o.position.set(x, y, 0.02 + d * 0.37 + 0.004); o.scale.set(bw, 1, 1); o.updateMatrix(); gm.setMatrixAt(i, o.matrix); });
  g.add(gm);
  asBackdrop(g); return g;
}
// High window pane that glows (dusk sky, or the blue of a factory yard at night) with mullions.
// Origin: centre; faces +z. API { group, mat } (tint mat.color for beats)
function makeGlowWindow(w, h, { cols = 3, rows = 4, color = "#ffcf94", frame = "#1b1511", arch = false } = {}) {
  const g = new THREE.Group();
  const c = makeCanvas(64, 256), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#8a8a8a"); x.fillStyle = gr; x.fillRect(0, 0, 64, 256);
  const m = new THREE.MeshBasicMaterial({ map: texFrom(c), color, toneMapped: false, fog: true });
  const pane = new THREE.Mesh(arch ? new THREE.ShapeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - w / 2); s.absarc(0, h / 2 - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, -h / 2); return s; })()) : new THREE.PlaneGeometry(w, h), m);
  if (arch) { const uv = pane.geometry.attributes.uv, pos = pane.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5); }
  g.add(pane);
  const fm = mat(frame, { roughness: 0.45, metalness: 0.4 }), top = arch ? h / 2 - w / 2 : h / 2;
  for (let i = 0; i <= cols; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, top + h / 2, 0.06), fm); b.position.set(-w / 2 + i * w / cols, (top - h / 2) / 2, 0.03); g.add(b); }
  for (let j = 0; j <= rows; j++) { const yy = -h / 2 + j * (top + h / 2) / rows, b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.06), fm); b.position.set(0, yy, 0.03); g.add(b); }
  asBackdrop(g); return { group: g, mat: m };
}
// A long hall that changes era along x, behind a timeline (charts.js → makeCoinTimeline):
//   archive    plaster and wainscot, tall bookcases of ledgers, high arched windows of dusk light,
//              pendant lamps (warm)
//   industrial brick, tall steel factory windows of blue night light with beams and dust, iron
//              columns, big enamel lamps
//   modern     a glass curtain wall with the city at night behind it, blue LED lines on the ceiling,
//              a polished black floor
// eras: [{ x0, x1, kind }]. In 9:16 the wall shows above the subject and the floor below it.
// API { group, update(t), tint(k, color) } — tint: every light of the hall (lamps, windows, LEDs) goes
// towards `color` by k (a crisis turns the hall red; call it every frame of the beat).
function makeEraHall(eras, { wallZ = -3.6, ceil = 10, front = 16, seed = 6 } = {}) {
  const g = new THREE.Group(), lights = [], motes = [], extra = [];
  const addLight = (m, base) => { lights.push({ m, base: new THREE.Color(base || m.color) }); return m; };
  const span = (e) => e.x1 - e.x0, mid = (e) => (e.x0 + e.x1) / 2, depth = front - wallZ;
  for (const e of eras) {
    const L = span(e), cx = mid(e);
    // floor
    const floorMat = e.kind === "archive" ? mat("#ffffff", { map: tileTex(cachedTex("hall-planks", () => woodTex({ base: "#3a2618", planks: 6, w: 512, h: 512 })), L / 3, depth / 3), roughness: 0.38, envMapIntensity: 0.7 })
      : e.kind === "industrial" ? mat("#ffffff", { map: tileTex(cachedTex("concrete", () => noiseTex({ base: "#4a4440", amount: 0.16, size: 2.5, seed: 52 })), L / 4, depth / 4), roughness: 0.7, envMapIntensity: 0.5 })
      : pmat("#0d0e12", { roughness: 0.32, metalness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.28, envMapIntensity: 0.9 });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(L, depth), floorMat); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.001, wallZ + depth / 2); g.add(fl);
    // ceiling (seen from low shots)
    const cl = new THREE.Mesh(new THREE.PlaneGeometry(L, depth), mat(e.kind === "modern" ? "#0d1016" : "#1c1410", { roughness: 0.95 })); cl.rotation.x = Math.PI / 2; cl.position.set(cx, ceil, wallZ + depth / 2); g.add(cl);
    if (e.kind === "archive") {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(L, ceil), mat("#ffffff", { map: tileTex(plasterTex("#5d4637"), L / 5, ceil / 5), roughness: 0.92 })); wall.position.set(cx, ceil / 2, wallZ); g.add(wall);
      const wain = new THREE.Mesh(new THREE.BoxGeometry(L, 1.1, 0.06), mat("#ffffff", { map: tileTex(woodTex("#4a2f1f"), L / 3, 1), roughness: 0.5 })); wain.position.set(cx, 0.55, wallZ + 0.03); g.add(wain);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(L, 0.25, 0.3), mat("#3a2a20", { roughness: 0.6 })); cornice.position.set(cx, ceil - 0.6, wallZ + 0.15); g.add(cornice);
      const beamMat = mat("#ffffff", { map: woodTex("#3a2416"), roughness: 0.6 });
      // beams over the back of the room only: near the lens they would cross the frame
      for (let x = e.x0 + 1.3; x < e.x1; x += 2.6) { const bm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 7), beamMat); bm.position.set(x, ceil - 0.21, wallZ + 3.5); g.add(bm); }
      for (let x = e.x0 + 1.3, k = 0; x < e.x1 - 1.0; x += 2.6, k++) {
        const sh = makeLedgerShelf({ seed: seed + k }); sh.position.set(x, 0, wallZ + 0.27); g.add(sh);
        if (k % 2 === 0) {
          const wn = makeGlowWindow(1.5, 2.6, { cols: 3, rows: 4, color: "#ffc98a", arch: true }); wn.group.position.set(x + 1.3, 6.7, wallZ + 0.01); g.add(wn.group); addLight(wn.mat);
          const bm = makeLightShaft([x + 1.3, 6.4, wallZ + 0.1], [x + 2.2, 0.05, wallZ + 5.5], { w0: 1.4, w1: 2.6, color: "#ffcf94", opacity: 0.09 }); g.add(bm.group); extra.push(bm);
        }
        const lamp = makePendantLamp({ drop: 2.4, r: 0.26, light: false }); lamp.position.set(x, ceil, wallZ + 1.8); g.add(lamp);
        lamp.traverse((n) => { if (n.isMesh && n.material.isMeshBasicMaterial) addLight(n.material); });
        const pool = makeFloorGlow(3.4, 2.6, { color: "#ffcc8a", opacity: 0.1 }); pool.position.set(x, 0.006, wallZ + 2.2); g.add(pool);
      }
      const m = makeSetMotes(160, [[e.x0, 0.3, wallZ + 0.4], [e.x1, 6.5, wallZ + 6]], { color: "#ffe2c0", seed: seed + 3 }); g.add(m.points); motes.push(m);
    } else if (e.kind === "industrial") {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(L, ceil), mat("#ffffff", { map: tileTex(setBrickTex(), L / 1.2, ceil / 0.6), roughness: 0.88 })); wall.position.set(cx, ceil / 2, wallZ); g.add(wall);
      const iron = pmat("#23262a", { metalness: 0.7, roughness: 0.45 });
      for (let x = e.x0 + 2, k = 0; x < e.x1 - 1; x += 4, k++) {
        const colm = new THREE.Mesh(new THREE.BoxGeometry(0.3, ceil, 0.3), iron); colm.position.set(x, ceil / 2, wallZ + 0.16); g.add(colm);
        const wn = makeGlowWindow(2.6, 4.6, { cols: 4, rows: 6, color: "#7fb3e0", frame: "#16191c" }); wn.group.position.set(x + 2, 5.2, wallZ + 0.01); g.add(wn.group); addLight(wn.mat);
        const bm = makeLightShaft([x + 2, 5.0, wallZ + 0.1], [x + 3.4, 0.05, wallZ + 6.5], { w0: 2.4, w1: 3.6, color: "#8fbbe8", opacity: 0.1 }); g.add(bm.group); extra.push(bm);
        const lamp = makePendantLamp({ drop: 3.2, r: 0.45, light: false }); lamp.position.set(x + 2, ceil, wallZ + 2.6); g.add(lamp);
        lamp.traverse((n) => { if (n.isMesh && n.material.isMeshBasicMaterial) addLight(n.material); });
        const pool = makeFloorGlow(4, 3, { color: "#ffd08f", opacity: 0.09 }); pool.position.set(x + 2, 0.006, wallZ + 3); g.add(pool);
      }
      const truss = new THREE.Mesh(new THREE.BoxGeometry(L, 0.35, 0.35), iron); truss.position.set(cx, ceil - 0.8, wallZ + 2.6); g.add(truss);
      const m = makeSetMotes(180, [[e.x0, 0.3, wallZ + 0.4], [e.x1, 6, wallZ + 7]], { color: "#cfe0ff", seed: seed + 5 }); g.add(m.points); motes.push(m);
    } else {
      // glass curtain wall and the city behind it
      const city = makeSkyline({ n: Math.round(L / 2.2), z: wallZ - 10, spread: L + 10, seed: seed + 11, hMin: 6, hMax: 22 }); city.group.position.x = cx; g.add(city.group); extra.push(city);
      const sky = new THREE.Mesh(new THREE.PlaneGeometry(L + 30, 40), new THREE.MeshBasicMaterial({ map: nightCityTex(seed + 2), toneMapped: false, fog: false })); sky.position.set(cx, 14, wallZ - 22); g.add(sky); addLight(sky.material, "#ffffff");
      const glassP = new THREE.Mesh(new THREE.PlaneGeometry(L, ceil), new THREE.MeshPhysicalMaterial({ color: "#3a5a7a", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.16, envMapIntensity: 1.5, depthWrite: false })); glassP.position.set(cx, ceil / 2, wallZ); g.add(glassP);
      const mull = pmat("#1a1d22", { metalness: 0.8, roughness: 0.3 });
      for (let x = e.x0; x <= e.x1 + 0.01; x += 1.8) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, ceil, 0.12), mull); b.position.set(x, ceil / 2, wallZ); g.add(b); }
      for (const y of [0.05, 3.3, 6.6, ceil - 0.05]) { const b = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, 0.12), mull); b.position.set(cx, y, wallZ); g.add(b); }
      const led = new THREE.MeshBasicMaterial({ color: "#6fa8ff", toneMapped: false }); addLight(led);
      for (let z = wallZ + 1.2; z < front - 2; z += 2.4) { const s = new THREE.Mesh(new THREE.BoxGeometry(L, 0.04, 0.08), led); s.position.set(cx, ceil - 0.05, z); g.add(s); }
      for (let x = e.x0 + 1.5; x < e.x1; x += 4.5) { const pool = makeFloorGlow(3, 5, { color: "#6fa8ff", opacity: 0.08 }); pool.position.set(x, 0.006, wallZ + 3); g.add(pool); }
      const m = makeSetMotes(120, [[e.x0, 0.3, wallZ + 0.4], [e.x1, 6, wallZ + 6]], { color: "#b9d4ff", seed: seed + 9, opacity: 0.4 }); g.add(m.points); motes.push(m);
    }
  }
  // where one era meets the next: a pilaster on the wall and a stone threshold across the floor
  for (let i = 1; i < eras.length; i++) {
    const p = new THREE.Mesh(rbox(0.7, ceil, 0.6, 0.04), mat("#2b211b", { roughness: 0.7 })); p.position.set(eras[i].x0, ceil / 2, wallZ + 0.3); g.add(p);
    const th = new THREE.Mesh(rbox(0.9, 0.03, depth, 0.01), pmat("#3a332d", { roughness: 0.4, clearcoat: 0.4 })); th.position.set(eras[i].x0, 0.012, wallZ + depth / 2); g.add(th);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.032, depth), pmat("#b8924a", { metalness: 1, roughness: 0.3 })); b.position.set(eras[i].x0 + s * 0.45, 0.014, wallZ + depth / 2); g.add(b); }
  }
  asBackdrop(g);
  return {
    group: g,
    update(t) { motes.forEach((m) => m.update(t)); extra.forEach((x) => x.update && x.update(t)); },
    tint(k, color = "#ff2a1a") { const c = new THREE.Color(color); lights.forEach(({ m, base }) => m.color.copy(base).lerp(c, clamp(k))); },
  };
}

// Data centre at night behind the hero (backdrop; first in the Binance hack video, 04/11/2026): a back row of
// server racks (perforated black doors, hundreds of status LEDs that blink green, blue and amber), two side
// rows facing the aisle, a yellow cable tray above the racks, a raised floor of perforated tiles that
// reflects the LEDs, cold light strips in the ceiling running towards the camera with their beams and pools.
// In 9:16 the tray and the ceiling show above the hero and the shiny floor below it.
// API { group, update(t), alarm(k), lights(k) } — alarm(k): every LED goes red (the attack); lights dims the strips.
function makeServerHall({ wallZ = -2.2, ceil = 3.4, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), W = 30;
  const tile = cachedTex("server-tile", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"); x.fillStyle = "#3a424c"; x.fillRect(0, 0, 256, 256);
    x.fillStyle = "#232931"; x.fillRect(0, 0, 256, 5); x.fillRect(0, 0, 5, 256);
    x.fillStyle = "#262c34"; for (let i = 30; i < 236; i += 16) for (let j = 30; j < 236; j += 16) { x.beginPath(); x.arc(i, j, 3.2, 0, 6.3); x.fill(); }
    speckle(x, 256, 256, 57, 900, 0.1, 0.04, 1.5);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 20), pmat("#ffffff", { map: tileTex(tile, W / 0.6, 20 / 0.6), roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.9 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.004, wallZ + 9); g.add(fl);
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, 20), mat("#14181d", { roughness: 0.9 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, wallZ + 9); g.add(cl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, ceil), mat("#101317", { roughness: 0.9 })); back.position.set(0, ceil / 2, wallZ - 1.0); g.add(back);
  // racks: perforated door on the front (+z) face, plain black body
  const door = cachedTex("server-door", () => {
    const c = makeCanvas(128, 512), x = c.getContext("2d"); x.fillStyle = "#171a1f"; x.fillRect(0, 0, 128, 512);
    x.fillStyle = "#07080a"; for (let yy = 22; yy < 490; yy += 7) for (let xx = 12; xx < 112; xx += 7) x.fillRect(xx, yy, 3.4, 3.4);
    x.strokeStyle = "#30363e"; x.lineWidth = 7; x.strokeRect(4, 4, 120, 504);
    x.fillStyle = "#a9b0b8"; x.fillRect(110, 210, 6, 80);
    return texFrom(c);
  });
  const rackW = 0.6, rackH = 2.2, rackD = 0.9, body = pmat("#1a1d22", { metalness: 0.6, roughness: 0.42 }), face = pmat("#ffffff", { map: door, metalness: 0.5, roughness: 0.5 });
  const racks = [];
  for (let i = -12; i <= 12; i++) racks.push([i * (rackW + 0.03), wallZ - rackD / 2, 0]);
  for (const s of [-1, 1]) for (let j = 0; j < 8; j++) racks.push([s * 3.4, wallZ + 0.8 + j * (rackW + 0.03), -s * Math.PI / 2]);
  const rm = new THREE.InstancedMesh(new THREE.BoxGeometry(rackW, rackH, rackD), [body, body, body, body, face, body], racks.length), o = new THREE.Object3D(), leds = [];
  racks.forEach(([x, z, ry], i) => {
    o.position.set(x, rackH / 2, z); o.rotation.set(0, ry, 0); o.updateMatrix(); rm.setMatrixAt(i, o.matrix);
    for (let k = 0; k < 18; k++) {
      const p = new V3(-0.2 + (k % 3) * 0.05, 0.3 + Math.floor(k / 3) * 0.3 + r() * 0.06 - rackH / 2, rackD / 2 + 0.006).applyMatrix4(o.matrix);
      leds.push({ p, ry, ph: r() * 6.28, sp: 0.6 + r() * 4, c: r() < 0.62 ? 0 : r() < 0.6 ? 1 : 2 });
    }
  });
  g.add(rm);
  const lm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.022, 0.012), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), leds.length);
  leds.forEach((L, i) => { o.position.copy(L.p); o.rotation.set(0, L.ry, 0); o.updateMatrix(); lm.setMatrixAt(i, o.matrix); lm.setColorAt(i, new THREE.Color("#38e08a")); });
  g.add(lm);
  // cable tray above the back row, with bundles of cable in it
  const yellow = pmat("#c9a227", { metalness: 0.6, roughness: 0.4 }), ty = rackH + 0.3, tz = wallZ - 0.35;
  for (const dz of [-0.2, 0.2]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, 0.03), yellow); rail.position.set(0, ty, tz + dz); g.add(rail); }
  const rung = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.02, 0.4), yellow, 60);
  for (let i = 0; i < 60; i++) { o.position.set(-W / 2 + i * (W / 60), ty - 0.02, tz); o.rotation.set(0, 0, 0); o.updateMatrix(); rung.setMatrixAt(i, o.matrix); }
  g.add(rung);
  for (const [dz, col] of [[-0.1, "#2a5a9a"], [0.0, "#1d1f24"], [0.1, "#3a7a4a"]]) { const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, W, 12), mat(col, { roughness: 0.6 })); cab.rotation.z = Math.PI / 2; cab.position.set(0, ty + 0.04, tz + dz); g.add(cab); }
  // cold light strips in the ceiling, towards the camera, with beams and pools on the floor
  const stripM = new THREE.MeshBasicMaterial({ color: "#dbe8ff", toneMapped: false }), beams = [], pools = [];
  for (const x of [-1.3, 1.3]) for (let z = wallZ + 0.6; z < wallZ + 14; z += 1.7) {
    const st = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1.3), stripM); st.rotation.x = Math.PI / 2; st.position.set(x, ceil - 0.01, z); g.add(st);
    const pool = makeFloorGlow(1.6, 1.9, { color: "#9fc4ff", opacity: 0.12 }); pool.position.set(x, 0.009, z); g.add(pool); pools.push(pool);
  }
  for (const x of [-1.3, 1.3]) { const b = makeLightShaft([x, ceil - 0.02, wallZ + 1.2], [x, 0.05, wallZ + 1.6], { w0: 0.25, w1: 1.4, color: "#9fc4ff", opacity: 0.1 }); g.add(b.group); beams.push(b); }
  const bok = makeBokeh({ n: 40, center: [0, 1.4, wallZ + 0.2], spread: [12, 2.2, 0.4], size: [0.12, 0.35], colors: ["#38e08a", "#4fb3ff", "#9fd0ff"], seed: seed + 3, opacity: 0.35, drift: 0.05 }); g.add(bok.group);
  const motes = makeSetMotes(140, [[-3, 0.2, wallZ + 0.2], [3, 3.0, wallZ + 5]], { color: "#cfe0ff", seed: seed + 7, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  const LC = [new THREE.Color("#38e08a"), new THREE.Color("#4fb3ff"), new THREE.Color("#ffb347")], ALERT = new THREE.Color("#ff2a1a"), c = new THREE.Color();
  let ak = 0;
  return {
    group: g,
    update(t) {
      leds.forEach((L, i) => { const on = Math.sin(t * L.sp + L.ph) > -0.35 ? 1 : 0.12; c.copy(LC[L.c]).lerp(ALERT, ak).multiplyScalar(on * (1 + 0.6 * ak)); lm.setColorAt(i, c); });
      lm.instanceColor.needsUpdate = true; bok.update(t); motes.update(t);
    },
    alarm(k) { ak = clamp(k); },
    lights(k) { stripM.color.set("#dbe8ff").multiplyScalar(0.1 + 0.9 * clamp(k)); beams.forEach((b) => b.set(clamp(k))); pools.forEach((p) => { p.material.opacity = 0.12 * clamp(k); }); },
  };
}
