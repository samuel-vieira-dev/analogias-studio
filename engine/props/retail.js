// ============================================================================
// props/retail.js · supermarket: upright glass-door freezer, the store aisle at night (backdrop),
// a waste bin full of thrown-away food. First used in 2026-11-02-hackers-geladeiras-bancos.
// ============================================================================

// Label of a frozen-food pack: a coloured body, a white band, a soft round "photo" blob (no brand, no words).
function retailPackTex(col, seed) {
  return cachedTex("retail-pack" + col + seed, () => {
    const c = makeCanvas(128, 128), x = c.getContext("2d"), r = mulberry32(seed);
    x.fillStyle = col; x.fillRect(0, 0, 128, 128);
    x.fillStyle = "rgba(255,255,255,0.88)"; x.fillRect(0, 16, 128, 12);
    x.fillStyle = "rgba(255,255,255,0.28)"; x.beginPath(); x.arc(36 + r() * 56, 80, 20 + r() * 12, 0, Math.PI * 2); x.fill();
    x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(0, 112, 128, 16);
    speckle(x, 128, 128, seed, 300, 0.08, 0.05, 1.5);
    return texFrom(c);
  });
}
// Polished store floor: big pale tiles with thin grout and a little wear. One texture tile = 2 × 2 tiles.
function retailFloorTex() {
  return cachedTex("retail-floor", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"), r = mulberry32(61);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const v = 0.92 + r() * 0.08; x.fillStyle = `rgb(${Math.round(196 * v)},${Math.round(192 * v)},${Math.round(184 * v)})`; x.fillRect(i * 128, j * 128, 128, 128); }
    speckle(x, 256, 256, 61, 2600, 0.07, 0.05, 1.6);
    x.fillStyle = "#6d6862"; x.fillRect(0, 0, 256, 2); x.fillRect(0, 128, 256, 2); x.fillRect(0, 0, 2, 256); x.fillRect(128, 0, 2, 256);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
const RETAIL_PACK_COLS = ["#c8312a", "#2f6fb5", "#e5a823", "#7b3fa0", "#2f9a5a", "#e06a2c", "#d9d2c3", "#3a4c8a"];

// Upright supermarket freezer with a glass door (reach-in): dark steel cabinet, white liner, four shelves
// stocked with ice-cream tubs and frozen boxes, LED strips inside the door frame (cold blue → hot red), frost
// on the glass, a digital temperature display on the header. The door hinges on the left edge and swings
// out towards +z. Origin: floor centre; the front is at z = d / 2.
// API { group, door, open(k), heat(k), frost(k), temp(v), melt(k), puddle, top, w, h, d }
//   heat(k) 0 cold (blue light) → 1 hot (red light); temp(v) shows "-18°C" … "50°C"; melt(k) sags the tubs
//   and spreads a puddle on the floor in front.
function makeGlassFreezer({ w = 0.86, h = 2.05, d = 0.82, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), wall = 0.05, base = 0.16, head = 0.26, ih = h - base - head;
  const steel = pmat("#2a2d33", { metalness: 0.6, roughness: 0.34, clearcoat: 0.4 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, wall), steel); back.position.set(0, h / 2, -d / 2 + wall / 2); g.add(back);
  for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(wall, h, d), steel); side.position.set(s * (w / 2 - wall / 2), h / 2, 0); g.add(side); }
  const kick = new THREE.Mesh(rbox(w, base, d, 0.012), steel); kick.position.set(0, base / 2, 0); g.add(kick);
  const gc = makeCanvas(256, 48), gx = gc.getContext("2d"); gx.fillStyle = "#15171b"; gx.fillRect(0, 0, 256, 48); gx.fillStyle = "#3a3e46"; for (let i = 8; i < 248; i += 10) gx.fillRect(i, 10, 5, 28);
  const grille = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, base * 0.6), mat("#ffffff", { map: texFrom(gc), roughness: 0.6, metalness: 0.4 })); grille.position.set(0, base / 2, d / 2 + 0.002); g.add(grille);
  const header = new THREE.Mesh(rbox(w, head, d, 0.014), steel); header.position.set(0, h - head / 2, 0); g.add(header);
  // the inside: a white liner box seen from inside (BackSide), lit by the LED colour
  const linerM = pmat("#dfe6ec", { roughness: 0.45, side: THREE.BackSide, emissive: "#000000" });
  const liner = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * wall, ih, d - wall - 0.04), linerM); liner.position.set(0, base + ih / 2, (wall + 0.04) / 2 - 0.02); liner.userData.noShadow = true; g.add(liner);
  const shelfM = pmat("#b9c0c8", { metalness: 0.8, roughness: 0.3 }), tubs = [];
  for (let i = 0; i < 4; i++) {
    const y = base + 0.06 + i * (ih / 4);
    const sh = new THREE.Mesh(rbox(w - 2 * wall - 0.02, 0.02, d - 0.2, 0.006), shelfM); sh.position.set(0, y, -0.03); g.add(sh);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * wall - 0.02, 0.05, 0.012), pmat("#f4f4f2", { roughness: 0.4 })); lip.position.set(0, y + 0.02, d / 2 - 0.13); g.add(lip);
    for (let k = 0; k < 4; k++) {
      const x0 = -w / 2 + wall + 0.1 + k * ((w - 2 * wall - 0.2) / 3), col = RETAIL_PACK_COLS[Math.floor(r() * RETAIL_PACK_COLS.length)];
      const pm = pmat("#ffffff", { map: retailPackTex(col, seed * 10 + i * 4 + k), roughness: 0.5, clearcoat: 0.3 });
      if ((i + k) % 2 === 0) {   // ice-cream tub with a lid
        const tub = new THREE.Group(); tub.position.set(x0, y + 0.01, -0.02 + (r() - 0.5) * 0.06); g.add(tub);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.13, 24), pm); body.position.y = 0.065; tub.add(body);
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.018, 24), pmat(col, { roughness: 0.35, clearcoat: 0.6 })); lid.position.y = 0.139; tub.add(lid);
        tubs.push(tub);
      } else {                    // frozen-food box standing up
        const bx = new THREE.Mesh(rbox(0.15, 0.2, 0.06, 0.008), [pm, pm, pm, pm, pm, pm]); bx.position.set(x0, y + 0.11, -0.02); bx.rotation.y = (r() - 0.5) * 0.2; g.add(bx);
      }
    }
  }
  // LED strips at both sides of the opening + a light inside
  const ledM = new THREE.MeshBasicMaterial({ color: "#8fdcff", toneMapped: false });
  for (const s of [-1, 1]) { const led = new THREE.Mesh(new THREE.BoxGeometry(0.018, ih - 0.04, 0.018), ledM); led.position.set(s * (w / 2 - wall - 0.012), base + ih / 2, d / 2 - 0.06); g.add(led); }
  const inner = new THREE.PointLight("#8fdcff", 1.2, 2.2, 1.6); inner.position.set(0, base + ih * 0.6, d / 2 - 0.25); g.add(inner);
  // temperature display on the header
  const dc = makeCanvas(256, 96), dx = dc.getContext("2d"), dtex = texFrom(dc);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.13), new THREE.MeshBasicMaterial({ map: dtex, toneMapped: false })); disp.position.set(0, h - head / 2, d / 2 + 0.002); g.add(disp);
  const dframe = new THREE.Mesh(rbox(0.38, 0.17, 0.01, 0.01), pmat("#0d0e10", { roughness: 0.3 })); dframe.position.set(0, h - head / 2, d / 2 - 0.004); g.add(dframe);
  let shownT = null;
  const temp = (v) => {
    const n = Math.round(v); if (n === shownT) return; shownT = n;
    const hot = n > 4; dx.fillStyle = "#07090b"; dx.fillRect(0, 0, 256, 96);
    dx.font = "900 70px Inter"; dx.textAlign = "center"; dx.textBaseline = "middle"; dx.shadowBlur = 16; dx.shadowColor = hot ? "#ff3b1f" : "#4fd2ff"; dx.fillStyle = hot ? "#ff4a2a" : "#7fe0ff";
    dx.fillText(`${n}°C`, 128, 52); dx.shadowBlur = 0; dtex.needsUpdate = true;
  };
  temp(-18);
  // door: aluminium frame, glass pane (frost), long handle on the free edge
  const door = new THREE.Group(); door.position.set(-w / 2 + 0.01, base, d / 2 + 0.018); g.add(door);
  const alu = pmat("#b7bcc3", { metalness: 0.9, roughness: 0.3 }), dw = w - 0.02;
  for (const [bw, bh, x, y] of [[dw, 0.05, dw / 2, ih - 0.025], [dw, 0.05, dw / 2, 0.025], [0.05, ih, 0.025, ih / 2], [0.05, ih, dw - 0.025, ih / 2]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.04, 0.008), alu); b.position.set(x, y, 0); door.add(b); }
  const glassM = glassMat({ color: "#e6f3ff", opacity: 0.2 });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(dw - 0.08, ih - 0.08), glassM); pane.position.set(dw / 2, ih / 2, 0.004); door.add(pane);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, ih * 0.55, 12), alu); handle.position.set(dw - 0.06, ih / 2, 0.06); door.add(handle);
  for (const yy of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.05), alu); st.position.set(dw - 0.06, ih / 2 + yy * ih * 0.25, 0.035); door.add(st); }
  // puddle on the floor in front (decor: it grows, it is not framed)
  const pud = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), pmat("#9fb4c4", { roughness: 0.02, metalness: 0.2, clearcoat: 1, transparent: true, opacity: 0.55 }));
  pud.rotation.x = -Math.PI / 2; pud.position.set(0.05, 0.004, d / 2 + 0.35); pud.scale.set(1.3, 0.7, 1); pud.visible = false; pud.userData.decor = true; g.add(pud);
  g.add(contactShadow(w + 0.5, d + 0.5));
  const cold = new THREE.Color("#8fdcff"), hot = new THREE.Color("#ff3b1f"), cTmp = new THREE.Color();
  return {
    group: g, door, puddle: pud, top: h, w, h, d,
    open: (k) => { door.rotation.y = -1.75 * clamp(k); },
    heat: (k) => { cTmp.copy(cold).lerp(hot, clamp(k)); ledM.color.copy(cTmp); inner.color.copy(cTmp); inner.intensity = 1.2 + 1.6 * clamp(k); linerM.emissive.copy(cTmp).multiplyScalar(0.12 + 0.25 * clamp(k)); },
    frost: (k) => { glassM.color.set("#e6f3ff").lerp(new THREE.Color("#ffffff"), clamp(k)); glassM.opacity = 0.18 + 0.4 * clamp(k); },
    temp,
    melt: (k) => { const m = clamp(k); tubs.forEach((tb, i) => { tb.scale.set(1 + 0.12 * m, 1 - 0.32 * m * (0.6 + 0.4 * ((i * 7) % 3) / 2), 1 + 0.12 * m); }); pud.visible = m > 0.02; pud.scale.set(0.2 + 1.2 * m, 0.15 + 0.6 * m, 1); },
  };
}

// Supermarket at night, behind the hero (backdrop): glossy tiled floor that reflects the ceiling, a long
// back wall of glowing freezer doors, rows of fluorescent tubes on the ceiling running towards the
// camera (up top in a 9:16 frame), shelving runs with packs on both sides and a green exit light (no
// hanging banners: they sat right behind the headline). clear = width kept free in front of the back wall.
// API { group, update(t), lights(k), heat(k) } — heat(k) turns the far freezer doors from cold blue to
// red (the attack spreading), lights(k) dims the tubes (the store at night, the power cut).
function makeSupermarketSet({ wallZ = -3.4, clear = 3.6, depth = 30, ceil = 4.4, seed = 4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), W = 40, zc = wallZ + depth / 2;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), pmat("#ffffff", { map: tileTex(retailFloorTex(), W / 1.2, depth / 1.2), roughness: 0.16, clearcoat: 0.6, envMapIntensity: 0.9 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.003, zc); g.add(fl);
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(W, ceil), mat("#ffffff", { map: tileTex(plasterTex("#3c4148"), 4, 0.5), roughness: 0.9 })); wl.position.set(0, ceil / 2, wallZ - 0.9); g.add(wl);
  // the far wall of freezer doors (instanced glowing panes + dark mullions)
  const n = 34, doorW = 0.78, doorH = 1.95, x0 = -(n * doorW) / 2;
  const paneM = new THREE.MeshBasicMaterial({ color: "#7fd0ff", toneMapped: false, transparent: true, opacity: 0.85, fog: true });
  const panes = new THREE.InstancedMesh(new THREE.PlaneGeometry(doorW - 0.08, doorH - 0.1), paneM, n);
  const dm = new THREE.Object3D();
  for (let i = 0; i < n; i++) { dm.position.set(x0 + (i + 0.5) * doorW, 0.2 + doorH / 2, wallZ - 0.85); dm.updateMatrix(); panes.setMatrixAt(i, dm.matrix); panes.setColorAt(i, new THREE.Color("#ffffff")); }
  g.add(panes);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(n * doorW + 0.2, 0.45, 0.9), pmat("#22252b", { metalness: 0.5, roughness: 0.4 })); cab.position.set(0, 0.2 + doorH + 0.22, wallZ - 0.5); g.add(cab);
  const kickB = new THREE.Mesh(new THREE.BoxGeometry(n * doorW + 0.2, 0.2, 0.9), pmat("#22252b", { metalness: 0.5, roughness: 0.4 })); kickB.position.set(0, 0.1, wallZ - 0.5); g.add(kickB);
  for (let i = 0; i <= n; i++) { const mu = new THREE.Mesh(new THREE.BoxGeometry(0.05, doorH, 0.06), pmat("#9aa0a8", { metalness: 0.9, roughness: 0.3 })); mu.position.set(x0 + i * doorW, 0.2 + doorH / 2, wallZ - 0.82); g.add(mu); }
  const glow = makeFloorGlow(W * 0.8, 3.0, { color: "#7fd0ff", opacity: 0.16 }); glow.position.set(0, 0.008, wallZ + 0.6); g.add(glow);
  // ceiling and fluorescent tube rows towards the camera (each with a soft pool on the floor)
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat("#2a2c30", { roughness: 0.95 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, zc); g.add(cl);
  const tubeM = new THREE.MeshBasicMaterial({ color: "#f2f7ff", toneMapped: false }), pools = [];
  for (const x of [-4.8, -1.6, 1.6, 4.8]) for (let z = wallZ + 0.6; z < wallZ + 7; z += 2.6) {   // over the subject only: never next to the camera
    const tb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 1.9), tubeM); tb.position.set(x, ceil - 0.25, z); g.add(tb);
    const hs = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 2.0), mat("#c9ccd1", { metalness: 0.6, roughness: 0.4 })); hs.position.set(x, ceil - 0.21, z); g.add(hs);
    for (const s of [-0.9, 0.9]) { const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), mat("#888")); wire.position.set(x, ceil - 0.1, z + s); g.add(wire); }
    const pool = makeFloorGlow(2.4, 3.0, { color: "#e8f0ff", opacity: 0.06 }); pool.position.set(x, 0.009, z); g.add(pool); pools.push(pool);
  }
  // shelving runs on both sides, stocked with packs (instanced)
  const shelfM = pmat("#e7e7e3", { metalness: 0.4, roughness: 0.4 }), packs = [];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const sx = s * (clear / 2 + 1.3 + k * 2.4), len = 3.2;   // short runs behind the subject: the camera (4–12 m out) never ends up inside one
    const upr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, len), shelfM); upr.position.set(sx, 0.95, wallZ + 1.2 + len / 2); g.add(upr);
    for (let lv = 0; lv < 5; lv++) {
      for (const side of [-1, 1]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, len), shelfM); sh.position.set(sx + side * 0.24, 0.15 + lv * 0.4, wallZ + 1.2 + len / 2); g.add(sh); }
      for (let z = 0; z < len; z += 0.19) for (const side of [-1, 1]) if (r() < 0.88) packs.push([sx + side * 0.24, 0.15 + lv * 0.4 + 0.012, wallZ + 1.3 + z, Math.floor(r() * RETAIL_PACK_COLS.length), 0.12 + r() * 0.12]);
    }
  }
  const pk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 1, 0.15), pmat("#ffffff", { roughness: 0.55 }), packs.length), pm = new THREE.Object3D(), pc = new THREE.Color();
  packs.forEach(([x, y, z, ci, hh], i) => { pm.position.set(x, y + hh / 2, z); pm.scale.set(1, hh, 1); pm.updateMatrix(); pk.setMatrixAt(i, pm.matrix); pk.setColorAt(i, pc.set(RETAIL_PACK_COLS[ci])); });
  g.add(pk);
  // green exit light high on the back wall (a pictogram box, no words)
  const exitM = new THREE.MeshBasicMaterial({ color: "#2fe37a", toneMapped: false }); const ex = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.06), exitM); ex.position.set(-2.2, ceil - 0.5, wallZ - 0.85); g.add(ex);
  const exh = sprite(BOKEH, 1.4); exh.material.color.set("#2fe37a"); exh.material.blending = THREE.AdditiveBlending; exh.material.opacity = 0.5; exh.position.copy(ex.position).add(new V3(0, 0, 0.1)); g.add(exh);
  const motes = makeSetMotes(160, [[-4, 0.3, wallZ], [4, 3.6, wallZ + 6]], { color: "#cfe6ff", seed: seed + 3, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  const cold = new THREE.Color("#7fd0ff"), hotC = new THREE.Color("#ff3b1f"), tmp = new THREE.Color();
  let heatK = 0, lightK = 1, lastT = 0;
  const applyHeat = () => {
    for (let i = 0; i < n; i++) { const kk = clamp(heatK * 1.6 - Math.abs(i - n / 2) / n * 1.2); const fl2 = 0.85 + 0.15 * Math.sin(lastT * 9 + i * 1.7) * kk; panes.setColorAt(i, tmp.copy(cold).lerp(hotC, kk).multiplyScalar(fl2)); }
    panes.instanceColor.needsUpdate = true; glow.material.color.copy(cold).lerp(hotC, clamp(heatK));
  };
  return {
    group: g,
    update(t) { lastT = t; motes.update(t); applyHeat(); },
    heat(k) { heatK = clamp(k); applyHeat(); },
    lights(k) { lightK = clamp(k); tubeM.color.set("#f2f7ff").multiplyScalar(0.1 + 0.9 * lightK); pools.forEach((p) => { p.material.opacity = 0.06 * lightK; }); },
  };
}

// Big wheeled waste bin (green plastic, lid flipped open at the back) heaped with flattened cardboard,
// frozen-food packs and ice-cream tubs: "comida no lixo". Origin: floor centre; faces +z. API { group, top }
function makeWasteBin({ w = 1.3, h = 1.05, d = 0.9, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), plast = pmat("#2f5a3a", { roughness: 0.55, clearcoat: 0.3 });
  const body = new THREE.Mesh(rbox(w, h - 0.12, d, 0.06), plast); body.position.y = 0.12 + (h - 0.12) / 2; g.add(body);
  const rim = new THREE.Mesh(rbox(w + 0.08, 0.06, d + 0.08, 0.02), plast); rim.position.y = h + 0.0; g.add(rim);
  for (let i = 0; i < 3; i++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.04, 0.03), pmat("#274c31", { roughness: 0.6 })); rib.position.set(0, 0.35 + i * 0.22, d / 2 + 0.005); g.add(rib); }
  const lidG = new THREE.Group(); lidG.position.set(0, h + 0.03, -d / 2 - 0.02); lidG.rotation.x = -2.25; g.add(lidG);
  const lid = new THREE.Mesh(rbox(w + 0.06, 0.05, d + 0.04, 0.02), plast); lid.position.set(0, 0, (d + 0.04) / 2); lidG.add(lid);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, w * 0.9, 14), pmat("#1f3a27", { roughness: 0.5 })); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, h + 0.03, -d / 2 - 0.02); g.add(hinge);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20), pmat("#151515", { roughness: 0.8 })); wh.rotation.z = Math.PI / 2; wh.position.set(sx * (w / 2 - 0.12), 0.06, sz * (d / 2 - 0.12)); g.add(wh); }
  // the heap: cardboard sheets and boxes, food packs and tubs piled above the rim
  const cb = pmat("#ffffff", { map: cardboardTex(), roughness: 0.85 });
  // the heap stays inside the rim: a mound of cardboard boxes, then packs and tubs lying on top of it
  const heap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), pmat("#8a6a4a", { roughness: 0.9 })); heap.scale.set((w - 0.12) / 1.0, 0.36, (d - 0.12) / 1.0); heap.position.y = h - 0.1; g.add(heap);   // sunk into the bin: the rim shows around it
  for (let i = 0; i < 6; i++) { const bx = new THREE.Mesh(rbox(0.26 + r() * 0.16, 0.14 + r() * 0.08, 0.22 + r() * 0.12, 0.01), cb); bx.position.set((r() - 0.5) * (w - 0.6), h - 0.04 + r() * 0.05, (r() - 0.5) * (d - 0.45)); bx.rotation.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3); g.add(bx); }
  for (let i = 0; i < 9; i++) {
    const col = RETAIL_PACK_COLS[Math.floor(r() * RETAIL_PACK_COLS.length)], pm = pmat("#ffffff", { map: retailPackTex(col, seed * 20 + i), roughness: 0.5 });
    const tub = i % 3 === 0, p = tub ? new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.072, 0.13, 20), pm) : new THREE.Mesh(rbox(0.16, 0.22, 0.06, 0.008), pm);
    const px = (r() - 0.5) * (w - 0.45), pz = (r() - 0.5) * (d - 0.4), ax = (w - 0.12) / 2, az = (d - 0.12) / 2;
    const surf = h - 0.1 + 0.18 * Math.sqrt(Math.max(0, 1 - (px / ax) ** 2 - (pz / az) ** 2));   // top of the mound under the pack
    if (tub) { p.position.set(px, surf + 0.07, pz); p.rotation.set(Math.PI / 2, 0, r() * 3); }
    else { p.position.set(px, surf + 0.025, pz); p.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.25, 0, r() * 3); }
    g.add(p);
  }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.35 };
}
