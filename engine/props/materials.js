// ============================================================================
// props/materials.js · procedural surface textures for a realistic (not cartoon) finish:
// cardboard, asphalt, grass, wood, plaster, fabric. Seeded canvas textures, cached by key.
// Every function returns a THREE texture that tiles once per `unit` world units; set .repeat
// on a clone (tileTex) when one mesh needs a different tiling.
// ============================================================================

const TEX_CACHE = {};
function cachedTex(key, make) { return TEX_CACHE[key] || (TEX_CACHE[key] = make()); }
// Tiling copy of a cached texture: repeat (u, v) times across the surface.
function tileTex(tex, u, v) { const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(u, v); t.needsUpdate = true; return t; }
// Speckle noise over a base colour: n dots of random size, darker and lighter.
function speckle(x, w, h, seed, n, dark, light, smax = 3) {
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) { const v = r(); x.fillStyle = v < 0.5 ? `rgba(0,0,0,${dark * (0.4 + r() * 0.6)})` : `rgba(255,255,255,${light * (0.4 + r() * 0.6)})`; const s = 0.6 + r() * smax; x.fillRect(r() * w, r() * h, s, s); }
}

// Kraft cardboard: warm brown, faint corrugation ribs, fibres and stains.
function cardboardTex() {
  return cachedTex("cardboard", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(5);
    x.fillStyle = "#c08a52"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 10) { x.fillStyle = `rgba(90,52,20,${0.05 + 0.03 * Math.sin(i)})`; x.fillRect(0, i, 512, 4); }
    for (let i = 0; i < 900; i++) { x.strokeStyle = `rgba(${r() < 0.5 ? "70,40,15" : "235,200,150"},${0.08 + r() * 0.1})`; x.lineWidth = 0.6 + r(); x.beginPath(); const px = r() * 512, py = r() * 512, a = r() * 6.28, l = 3 + r() * 10; x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    for (let i = 0; i < 6; i++) { const g = x.createRadialGradient(r() * 512, r() * 512, 4, r() * 512, r() * 512, 60 + r() * 80); g.addColorStop(0, "rgba(80,45,15,0.10)"); g.addColorStop(1, "rgba(80,45,15,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 512); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Asphalt: dark grey aggregate with lighter stones and a few tar patches.
function asphaltTex() {
  return cachedTex("asphalt", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(9);
    x.fillStyle = "#3a3734"; x.fillRect(0, 0, 512, 512);
    speckle(x, 512, 512, 9, 9000, 0.35, 0.18, 2.5);
    for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(15,14,13,${0.12 + r() * 0.12})`; x.beginPath(); x.ellipse(r() * 512, r() * 512, 20 + r() * 50, 8 + r() * 25, r() * 3, 0, Math.PI * 2); x.fill(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Grass seen from a distance: dark green with lighter blades and dry patches.
function grassTex() {
  return cachedTex("grass", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(13);
    x.fillStyle = "#2c3a1c"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 7000; i++) { x.strokeStyle = r() < 0.75 ? `rgba(${70 + r() * 40},${100 + r() * 50},${40 + r() * 20},0.5)` : `rgba(140,120,60,0.35)`; x.lineWidth = 1; x.beginPath(); const px = r() * 512, py = r() * 512; x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py - 3 - r() * 5); x.stroke(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Wood: long grain along u, warm brown, darker growth lines and a couple of knots. Also reached as
// woodTex("#6a4330") (engine/core.js: a colour string picks this grain, an options object the planks).
function woodGrainTex(base = "#6a4330") {
  return cachedTex("wood" + base, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(17);
    x.fillStyle = base; x.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 2) { const k = Math.sin(y * 0.09 + Math.sin(y * 0.013) * 4) * 0.5 + 0.5; x.fillStyle = `rgba(30,15,5,${0.06 + 0.12 * k})`; x.fillRect(0, y, 512, 1); }
    for (let i = 0; i < 3; i++) { const kx = r() * 512, ky = r() * 512; for (let j = 0; j < 6; j++) { x.strokeStyle = "rgba(30,15,5,0.25)"; x.beginPath(); x.ellipse(kx, ky, 6 + j * 5, 3 + j * 2, 0, 0, Math.PI * 2); x.stroke(); } }
    speckle(x, 512, 512, 17, 1500, 0.08, 0.05, 2);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Painted plaster wall: base colour with soft blotches and fine grain.
function plasterTex(base = "#3a2a22") {
  return cachedTex("plaster" + base, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(23);
    x.fillStyle = base; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) { const g = x.createRadialGradient(r() * 512, r() * 512, 2, r() * 512, r() * 512, 40 + r() * 90); const d = r() < 0.5; g.addColorStop(0, d ? "rgba(0,0,0,0.07)" : "rgba(255,230,210,0.05)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 512); }
    speckle(x, 512, 512, 23, 5000, 0.08, 0.05, 1.5);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Woven fabric: fine warp/weft lines over a base colour (multiply it with a pattern map if needed).
function fabricTex(base) {
  return cachedTex("fabric" + base, () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d");
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 3) { x.fillStyle = "rgba(0,0,0,0.06)"; x.fillRect(i, 0, 1, 256); x.fillStyle = "rgba(255,255,255,0.05)"; x.fillRect(0, i, 256, 1); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
