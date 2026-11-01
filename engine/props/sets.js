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
