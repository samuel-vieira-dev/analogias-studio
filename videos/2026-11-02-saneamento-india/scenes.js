// ============================================================================
// videos/2026-11-02-saneamento-india/scenes.js
// Saneamento básico: a Índia passou o Brasil (OMS/UNICEF, saneamento seguro: Índia 63% × Brasil 55% em
// 2024; em 2000, 9% × 34%; a virada em 2019). Quase metade do esgoto do Brasil não é tratada, 5.442
// piscinas olímpicas por dia, 90 milhões sem coleta, meta de 2033 e, no ritmo atual, 2070.
// Analogia única (escolhida pelo Samuel): varrer a sujeira pra debaixo do tapete — e a casa é a cidade.
// Fio visual dos dados: a escada do ranking (1 degrau = 1 ponto) com as bandeirinhas do Brasil e da Índia.
// Times come from audio/words.json (A below).
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone. Backdrops (the city by the river at night, the
// bathroom, the riverside, the living room, the office) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  india: 1.40, passou: 1.68, acredita: 5.02, c1: 5.74,
  sessenta: 7.16, seguro: 10.18, brasil55: 11.06, c2: 12.76,
  descarga: 14.08, desce: 15.30, praonde: 16.36, c3: 16.98,
  quase: 17.08, tratada: 19.82, vai: 20.46, rio: 21.72, mar: 22.42, c4: 22.92,
  cinco: 23.92, piscinas: 24.58, dia: 26.86, c5: 27.2,
  oms: 27.70, banheiro: 29.42, mede: 30.20, sai: 31.76, c6: 32.42,
  varrer: 34.0, sujeira: 34.56, tapete: 35.80, some: 36.66, vista: 37.20, continua: 38.04, casa: 38.74, so: 39.30, cidade: 40.82, c7: 41.5,
  naoconta: 42.86, fossa: 43.86, guarda: 45.10, conta: 46.20, c8: 46.56,
  correu: 47.78, desde: 48.40, cem: 51.00, c9: 52.92,
  y2000: 53.28, quatro: 55.06, c10: 57.34,
  sobe: 57.86, indiaDois: 60.12, y2019: 62.10, passou2: 63.50, c11: 64.06,
  andou: 64.98, devagar: 66.20, mundo: 67.46, c12: 68.48,
  noventa: 68.72, coleta: 71.28, c13: 72.44,
  a2033: 75.76, ritmo: 77.42, a2070: 78.84, c14: 79.9,
  quem: 80.98, a44: 82.48, c15: 84.86,
  pagaria: 85.22, b2033: 88.42, ou: 89.98, espera: 91.32, end: 94.7,
};
// In-scene cuts (also listed in video.json → cuts).
const B4 = 20.40, B7a = 36.6, B7b = 39.2, B8 = 43.82;

// Safely managed sanitation, % of the population (OMS/UNICEF JMP via Banco Mundial), 2000–2024.
const BR = [33.7, 34.0, 34.3, 34.5, 34.8, 35.1, 35.4, 36.3, 37.2, 38.2, 39.1, 40.5, 42.0, 43.6, 45.1, 46.8, 47.7, 48.7, 49.7, 50.7, 51.5, 52.4, 53.2, 54.1, 55.0];
const IN = [9.0, 10.7, 12.6, 14.9, 17.3, 19.5, 21.7, 23.9, 26.2, 28.5, 30.8, 33.1, 35.4, 37.8, 40.1, 42.5, 44.9, 47.2, 49.6, 51.9, 54.2, 56.4, 58.6, 60.8, 62.8];
const WLD = [31.3, 31.7, 31.7, 32.8, 34.0, 35.1, 36.3, 37.6, 38.9, 40.2, 41.5, 42.8, 44.1, 45.5, 46.9, 48.4, 49.9, 51.3, 52.8, 54.2, 55.2, 56.1, 57.0, 57.8, 58.5];
// The counter in video.json uses the same sweeps: 2000 → 2019 over SWEEP0..SWEEP1, 2019 → 2024 over SWEEP2..SWEEP3.
const SWEEP0 = 57.5, SWEEP1 = 63.4, SWEEP2 = 64.2, SWEEP3 = 65.6;
function seriesAt(S, year) { const y = clamp(year, 2000, 2024) - 2000, i = Math.min(23, Math.floor(y)); return lerp(S[i], S[i + 1], y - i); }
// Whole-step value at rest; while moving, the flag hops (placeOnStairs).
const restP = (v) => Math.round(v);
const LANE_BR = -0.98, LANE_IN = 0.12, FLAG_S = 1.8, SIGN_DX = 0.5;   // cloths fly to +x: Brazil's ends at −0.1, India's at 1.0 (stairs ±1.2)

// ---------------------------------------------------------------- shared looks
// Night sky: deep blue at the top, a warm city glow at the horizon.
const NIGHT_SKY = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#060a18"); g.addColorStop(0.55, "#12213f"); g.addColorStop(0.8, "#3a2a40"); g.addColorStop(1, "#6a3a2a"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function nightLook({ keyI = 1.6, keyC = "#ffd6b0", hemiI = 0.42 } = {}) {
  scene.background = NIGHT_SKY; scene.fog.color.set("#0d1424"); floor.visible = false;
  key.intensity = keyI; key.color.set(keyC); hemi.intensity = hemiI; hemi.color.set("#b9cdf5"); hemi.groundColor.set("#1a1410");
}

// Paving of a riverside plaza (grey stone slabs). Cached.
function plazaTex() {
  return cachedTex("plaza-sane", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(14); x.fillStyle = "#2b2e33"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const tone = 70 + r() * 18; x.fillStyle = `rgb(${tone},${tone + 2},${tone + 6})`; x.fillRect(i * 128 + 2, j * 128 + 2, 124, 124); }
    for (let i = 0; i < 4000; i++) { x.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.06)"; x.fillRect(r() * 512, r() * 512, 1.5, 1.5); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// Outdoor night shots: the camera's fog would swallow the far bank; push it back after CAM.apply.
function applyNight(p, far = 70) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 14); scene.fog.far = Math.max(scene.fog.far, far); }

// The riverside at night behind the ranking stairs: a stone plaza under the stairs, the river beyond it
// with the reflections of the city, the skyline on the far bank, lamp posts along the quay, bokeh.
// update(t, flash): flash (0..1) makes the city's windows and the lamps flare (the crossing).
function makeRiversideSet({ quayZ = -12, seed = 5 } = {}) {
  const g = new THREE.Group();
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), mat("#ffffff", { map: tileTex(plazaTex(), 20, 15), roughness: 0.8 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0, quayZ + 15); g.add(plaza);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(40, 0.25, 0.4), mat("#5a5650", { roughness: 0.8 })); edge.position.set(0, -0.1, quayZ); g.add(edge);
  const sea = makeSea({ size: 60, seg: 60, color: "#0f2633" }); sea.mesh.position.set(0, -0.35, quayZ - 30); g.add(sea.mesh);
  const farBank = new THREE.Mesh(new THREE.BoxGeometry(60, 0.6, 10), mat("#16181d", { roughness: 0.9 })); farBank.position.set(0, -0.1, quayZ - 12); g.add(farBank);
  const sky = makeSkyline({ n: 34, z: quayZ - 9, spread: 56, seed, hMin: 3, hMax: 12 }); g.add(sky.group);
  const glowM = new THREE.MeshBasicMaterial({ map: setGlowTex(), color: "#ffb36a", transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false });
  const refl = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), glowM); refl.rotation.x = -Math.PI / 2; refl.position.set(0, -0.3, quayZ - 3.5); g.add(refl);
  const lamps = [], post = pmat("#2a2c30", { metalness: 0.7, roughness: 0.4 });
  for (let i = 0; i < 7; i++) {
    const lx = -9 + i * 3, lp = new THREE.Group(); lp.position.set(lx, 0, quayZ + 0.6); g.add(lp);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 10), post); pole.position.y = 1.8; lp.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); head.position.y = 3.7; lp.add(head);
    const halo = sprite(BOKEH, 1.4); halo.material.color.set("#ffc27a"); halo.material.blending = THREE.AdditiveBlending; halo.position.y = 3.7; lp.add(halo);
    lamps.push({ head, halo });
  }
  const bokeh = makeBokeh({ n: 50, center: [0, 5, quayZ - 14], spread: [40, 10, 6], size: [0.4, 1.4], colors: ["#ffcf8a", "#9fc3ff", "#ff9a4a", "#fff2dc"], opacity: 0.4, seed: seed + 4 });
  g.add(bokeh.group);
  asBackdrop(g);
  return {
    group: g,
    update(t, flash = 0) {
      sea.update(t); sky.update(t); bokeh.update(t);
      glowM.opacity = 0.3 + 0.4 * flash;
      lamps.forEach((L, i) => { const k = 0.85 + 0.15 * Math.sin(t * 2 + i) + 0.8 * flash; L.halo.material.opacity = 0.6 * k; L.head.material.color.set("#ffd9a0").multiplyScalar(0.8 + 0.6 * flash); });
    },
  };
}

// A sign standing on a step: a printed value ("63%") on a little concrete stand. Origin: floor centre.
function makeValueSign(text, { w = 0.66, h = 0.27, bg = ORANGE } = {}) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(w * 0.7, 0.03, 0.06, 0.008), pmat("#3a3d42", { roughness: 0.5 })); stand.position.y = 0.015; g.add(stand);
  const p = makePlate(text, w, h, { bg, fg: "#ffffff" }); p.position.set(0, 0.03 + h / 2 + 0.004, 0); p.rotation.x = -0.12; g.add(p);
  return g;
}

// The ranking stairs on the riverside with the two flags. Shared by every stairs scene.
// API { set, stairs, br, ind, place(pBR, pIN) }
function buildRankStairs(S, seed) {
  const set = makeRiversideSet({ quayZ: -17, seed }); S.backdrop(set.group);
  const stairs = makeRankStairs(72, { rise: 0.06, tread: 0.2, w: 2.4 }); S.backdrop(stairs.group);   // the stage the flags climb: context, like a floor
  const br = makeNationFlag("brasil", { fw: 0.5 }); br.group.scale.setScalar(FLAG_S); S.add(br.group);
  const ind = makeNationFlag("india", { fw: 0.5 }); ind.group.scale.setScalar(FLAG_S); S.add(ind.group);
  stairs.group.updateMatrixWorld(true);
  const place = (pB, pI) => { placeOnStairs(br, stairs, pB, LANE_BR); placeOnStairs(ind, stairs, pI, LANE_IN); };
  return { set, stairs, br, ind, place };
}
function stairsLight(t, flash = 0) {
  nightLook({ keyI: 1.7, keyC: "#ffd9b8", hemiI: 0.45 });
  fill.color.set(flash > 0.05 ? "#ffb36a" : "#9fc3ff"); fill.intensity = 1.2 + 2.5 * flash;
}

// ============================================================ 1 · gancho: a Índia passou o Brasil
// The ranking stairs at night by the river: Brazil's flag stands on step 55; India's flag hops up the
// stairs from 45 and passes it on "passou" (camera shake, the city flares); the camera pushes in.
addScene("gancho", 0, A.c1, (S) => {
  const R = buildRankStairs(S, 5);
  const pIN = (t) => lerp(51, 63, sm(t, 0.25, 2.3));
  const anim = (t) => {
    R.set.update(t, beat(t, A.passou, 0.8)); stairsLight(t, beat(t, A.passou, 0.8));
    R.place(55, pIN(t)); R.br.update(t); R.ind.update(t);
    fill.position.copy(R.ind.group.position).add(new V3(0.4, 0.8, 1.2));
  };
  S.hero(R.br.group, "bandeira do brasil"); S.hero(R.ind.group, "bandeira da índia");
  const box = envelope([R.br.group, R.ind.group], anim, 0, A.c1);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.4, 0.24, 1], pull0: 1.15, pull: 1.0 }); p = CAM.shake(p, t, A.passou, 0.03, 0.4); applyNight(p); };
});

// ============================================================ 2 · 63% dos indianos × 55% no Brasil
// Same stairs: on "sessenta e três" an orange 63% sign lands beside India's flag; on "cinquenta e cinco"
// a 55% sign beside Brazil's. The camera orbits the two flags.
addScene("dados", A.c1, A.c2, (S) => {
  const R = buildRankStairs(S, 7);
  const s63 = makeValueSign("63%"), s55 = makeValueSign("55%", { bg: "#2c7a3f" }); S.add(s63, s55);
  const anim = (t) => {
    R.set.update(t); stairsLight(t);
    R.place(55, 63); R.br.update(t); R.ind.update(t);
    s63.position.copy(R.ind.group.position).add(new V3(SIGN_DX, 0, 0.02)); popIn(s63, t, A.sessenta, 0.4);
    s55.position.copy(R.br.group.position).add(new V3(SIGN_DX, 0, 0.02)); popIn(s55, t, A.brasil55 + 0.6, 0.4);
    fill.position.set(0, R.ind.group.position.y + 0.8, R.ind.group.position.z + 1.4);
  };
  S.hero(R.br.group, "bandeira do brasil"); S.hero(R.ind.group, "bandeira da índia");
  S.hero(s63, "placa 63%", { when: (t) => t > A.sessenta + 0.4 }); S.hero(s55, "placa 55%", { when: (t) => t > A.brasil55 + 1.0 });
  const box = envelope([R.br.group, R.ind.group, s63, s55], anim, A.c1, A.c2);
  return (t) => { anim(t); applyNight(CAM.move(box, "orbit", lin(t, A.c1, A.c2), { zone: "stage", from: [0.15, 0.3, 1], deg: 36, pull: 1.02 })); };
});

// ============================================================ 3 · imagina: você dá descarga
// A bathroom at night: the flush button goes down on "descarga", the water swirls and drains; the
// camera drops from above the tank to the level of the bowl's foot ("pra onde vai?").
addScene("descarga", A.c2, A.c3, (S) => {
  const room = makeBathroomSet({ wallZ: -0.5, seed: 4 }); S.backdrop(room.group);
  const wc = makeToiletBowl({ s: 1.0 }); wc.group.position.set(0, 0, 0); S.add(wc.group);
  const anim = (t) => {
    room.update(t); room.lights(0.9); floor.visible = false;
    key.intensity = 1.5; key.color.set("#fff1dc"); hemi.intensity = 0.45; hemi.color.set("#d6e4ff"); scene.fog.color.set("#0e131b");
    const k = sm(t, A.descarga - 0.1, A.descarga + 0.15) * (1 - sm(t, A.descarga + 0.5, A.descarga + 0.8));
    wc.press(k); wc.swirl(t, sm(t, A.descarga, A.descarga + 0.4) * (1 - sm(t, A.praonde, A.c3)));
    fill.position.set(0.4, 1.4, 1.2); fill.color.set("#cfe0ff"); fill.intensity = 1.4;
  };
  S.hero(wc.group, "privada");
  const box = envelope([wc.group], anim, A.c2, A.c3);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.c2, A.c3), { zone: "stage", from: [0.35, 0.5, 1], rise: 0.6, pull: 1.04 })); };
});

// Concrete river wall with the grass bank on top, little houses along it, a sewer pipe sticking out of the
// wall and pouring dark water into the river; foam on the water. Origin: foot of the wall, water level.
// API { group, pipe, stream, update(t, k) }
function makeOutfallBank({ seed = 3 } = {}) {
  const g = new THREE.Group(), conc = pmat("#ffffff", { map: tileTex(noiseTex({ base: "#6e6a62", amount: 0.22, seed: 61 }), 4, 1), roughness: 0.9 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(9, 1.3, 0.5), conc); wall.position.set(0, 0.55, -0.25); g.add(wall);
  const stain = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), new THREE.MeshBasicMaterial({ color: "#1c1a12", transparent: true, opacity: 0.55, depthWrite: false })); stain.position.set(0, 0.35, 0.002); g.add(stain);
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), mat("#ffffff", { map: tileTex(grassTex(), 20, 8), roughness: 1 })); bank.rotation.x = -Math.PI / 2; bank.position.set(0, 1.2, -6.5); g.add(bank);
  const r = mulberry32(seed);
  for (let i = 0; i < 9; i++) { const hs = makeHouse({ w: 1.1, h: 0.85, d: 0.9, wall: ["#d9c6a8", "#c4a07a", "#e2d7c4", "#b88a6a"][i % 4], roof: ["#8e3a2a", "#6e4a3a", "#9a5a3a"][i % 3] }); hs.scale.setScalar(0.62 + r() * 0.2); hs.position.set(-4.2 + i * 1.05, 1.2, -1.2 - r() * 1.4); hs.rotation.y = (r() - 0.5) * 0.3; g.add(hs); }
  const pipeM = pmat("#4e4a44", { roughness: 0.6, metalness: 0.2 }), pipe = new THREE.Group(); pipe.position.set(0, 0.62, 0); g.add(pipe);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.55, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: "#4e4a44", roughness: 0.6, side: THREE.DoubleSide })); tube.rotation.x = Math.PI / 2; tube.position.z = 0.2; pipe.add(tube);
  const lipR = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 10, 28), pipeM); lipR.position.z = 0.47; pipe.add(lipR);
  const inside = new THREE.Mesh(new THREE.CircleGeometry(0.16, 28), mat("#120f0a", { roughness: 1 })); inside.position.z = 0.0; pipe.add(inside);
  // the stream: a curved sheet of dark water from the mouth to the river, its texture running down
  const c = makeCanvas(64, 256), x = c.getContext("2d"); for (let i = 0; i < 256; i += 8) { x.fillStyle = `rgba(${60 + (i % 24)},${48 + (i % 16)},${30},1)`; x.fillRect(0, i, 64, 8); }
  for (let i = 0; i < 60; i++) { x.fillStyle = "rgba(210,200,170,0.35)"; x.fillRect(Math.random() * 64, Math.random() * 256, 2, 10); }
  const st = texFrom(c); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(1, 2);
  const curve = new THREE.QuadraticBezierCurve3(new V3(0, 0.55, 0.45), new V3(0, 0.62, 0.95), new V3(0, 0.0, 1.15));
  const stream = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.085, 14, false), new THREE.MeshPhysicalMaterial({ map: st, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.8, depthWrite: false })); g.add(stream);
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshPhysicalMaterial({ color: "#4a3a22", roughness: 0.1, clearcoat: 1 }), 50), od = new THREE.Object3D(), dr = mulberry32(seed + 5), dd = [];
  for (let i = 0; i < 50; i++) dd.push({ ph: dr(), ox: (dr() - 0.5) * 0.16, oz: (dr() - 0.5) * 0.1, s: 0.5 + dr() });
  drops.userData.decor = true; drops.frustumCulled = false; g.add(drops);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 40), new THREE.MeshBasicMaterial({ color: "#e8e2d2", transparent: true, opacity: 0.5, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.07, 1.15); ring.userData.decor = true; g.add(ring);
  const foam = []; for (let i = 0; i < 26; i++) { const s = sprite(BOKEH, 0.35); s.material.color.set("#e8e2d2"); s.userData.decor = true; s.userData.f = { a: r() * 6.28, d: 0.15 + r() * 0.9, ph: r() }; g.add(s); foam.push(s); }
  return {
    group: g, pipe, stream,
    update(t, k) {
      st.offset.y = -t * 2.2; stream.visible = k > 0.02; stream.material.opacity = 0.8 * clamp(k * 1.5);
      dd.forEach((d, i) => { const u = (t * 1.3 + d.ph) % 1, pt = curve.getPoint(u); od.position.set(pt.x + d.ox * (0.5 + u), pt.y, pt.z + d.oz); od.scale.setScalar(k > 0.02 ? d.s : 0.0001); od.updateMatrix(); drops.setMatrixAt(i, od.matrix); }); drops.instanceMatrix.needsUpdate = true;
      const ru = (t * 1.6) % 1; ring.scale.setScalar(0.6 + 1.6 * ru); ring.material.opacity = 0.55 * (1 - ru) * clamp(k);
      foam.forEach((s) => { const f = s.userData.f, u = (t * 0.25 + f.ph) % 1; s.position.set(Math.cos(f.a) * f.d * (0.6 + u), 0.06, 1.2 + Math.abs(Math.sin(f.a)) * f.d * (0.6 + u)); s.material.opacity = 0.5 * clamp(k) * Math.sin(Math.PI * u); setSpriteScale(s, 0.6 + u); });
    },
  };
}

// ============================================================ 4 · quase metade sem tratamento; pro córrego, pro rio, pro mar
// A (wide → close): the river wall at night, little houses on the bank; a sewer pipe pours dark water into
// the river, foam spreading. B (cut at "Vai"): the photo of the foam on the Tietê in a frame on the quay.
addScene("rio", A.c3, A.c4, (S) => {
  const bank = makeOutfallBank({ seed: 3 }); S.add(bank.group);
  const river = makeSea({ size: 40, seg: 50, color: "#2a2a1c" }); river.mesh.position.set(0, -0.02, 10); S.backdrop(river.mesh);
  const sky = makeSkyline({ n: 24, z: -14, spread: 40, seed: 9, hMin: 4, hMax: 12 }); S.backdrop(sky.group);
  const fr = makePhotoFrame("tiete-espuma", { w: 2.0, name: "RIO TIETÊ · 2007" }); fr.group.position.set(-2.3, 0, 0.9); fr.group.rotation.y = 0.25; S.add(fr.group);
  const quay = new THREE.Mesh(new THREE.BoxGeometry(5, 0.16, 2.0), pmat("#ffffff", { map: tileTex(plazaTex(), 4, 1.6), roughness: 0.8 })); quay.position.set(-3.6, -0.02, 1.0); S.backdrop(quay);   // a concrete ledge along the wall, left of the outfall
  const rail = new THREE.Mesh(new THREE.BoxGeometry(5, 0.04, 0.04), pmat("#2a2c30", { metalness: 0.7, roughness: 0.35 })); rail.position.set(-3.6, 0.95, 1.95); S.backdrop(rail);
  for (let i = 0; i < 6; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8), pmat("#2a2c30", { metalness: 0.7, roughness: 0.35 })); post.position.set(-5.9 + i * 0.92, 0.51, 1.95); S.backdrop(post); }
  const shine = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ map: setGlowTex(), color: "#ffb36a", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })); shine.rotation.x = -Math.PI / 2; shine.position.set(1.5, 0.05, 4); S.backdrop(shine);
  fr.group.position.y = 0.06;
  const anim = (t) => {
    nightLook({ keyI: 1.3, keyC: "#ffd2a8", hemiI: 0.4 }); floor.visible = false;
    river.update(t); sky.update(t); bank.update(t, sm(t, A.c3, A.c3 + 0.5));
    const b = t >= B4; fr.group.visible = b;
    fr.frame.rotation.y = -1.2 * (1 - eOut(lin(t, B4, B4 + 0.7))); if (b) popIn(fr.group, t, B4, 0.45); fr.zoom(1 + 0.18 * lin(t, B4, A.c4));
    fill.position.set(b ? -2.0 : 0.3, 1.2, 2.0); fill.color.set(b ? "#ffd2a0" : "#ffb36a"); fill.intensity = 1.6 + 1.2 * beat(t, A.quase + 0.3, 0.7);
  };
  S.hero(bank.pipe, "cano de esgoto", { when: (t) => t < B4 }); S.hero(bank.stream, "esgoto caindo no rio", { when: (t) => t < B4 });
  S.solid(bank.group, "muro do rio", { when: (t) => t < B4 });
  S.hero(fr.group, "porta-retrato rio tietê", { when: (t) => t > B4 + 0.5 });
  const bA = envelope([bank.pipe, bank.stream], anim, A.c3, B4 - 0.05), bB = envelope([fr.group], anim, B4 + 0.5, A.c4);
  return (t) => {
    anim(t);
    if (t < B4) { let p = CAM.move(bA, "reveal", lin(t, A.c3, B4), { zone: "stage", from: [0.55, 0.3, 1], pull0: 1.6, pull: 1.0 }); p = CAM.shake(p, t, A.quase + 0.3, 0.02, 0.3); applyNight(p); }
    else applyNight(CAM.move(bB, "push", lin(t, B4, A.c4), { zone: "stage", from: [-0.25, 0.2, 1], pull0: 1.35, pull: 1.0 }));
  };
});

// ============================================================ 5 · mais de cinco mil piscinas olímpicas. Por dia.
// A grid of Olympic pools (scale models) on a plaza at dusk: from the front row back, the clean blue water
// turns sewage brown, row after row; the camera slides across the front row.
addScene("piscinas", A.c4, A.c5, (S) => {
  const set = makeRiversideSet({ quayZ: -16, seed: 11 }); S.backdrop(set.group);
  const pools = [];
  for (let row = 0; row < 6; row++) for (let col = -1; col <= 1; col++) {
    const p = makeOlympicPool(); p.group.position.set(col * 2.9, p.base, -row * 1.8); (row === 0 && col === 0 ? S.add(p.group) : S.backdrop(asBackdrop(p.group))); pools.push({ p, row, col });
  }
  const front = pools.find((q) => q.row === 0 && q.col === 0).p.group;
  const anim = (t) => {
    set.update(t); nightLook({ keyI: 1.9, keyC: "#ffe2c4", hemiI: 0.5 });
    pools.forEach(({ p, row, col }) => p.dirty(sm(t, A.cinco - 0.3 + row * 0.32 + (col + 1) * 0.1, A.cinco + 0.5 + row * 0.32 + (col + 1) * 0.1), t));
    fill.position.set(0, 1.4, 1.8); fill.color.set("#ffd9a8"); fill.intensity = 1.2;
  };
  S.hero(front, "piscina olímpica");
  const box = envelope([front], anim, A.c4, A.c5);
  return (t) => { anim(t); let p = CAM.move(box, "truck", lin(t, A.c4, A.c5), { zone: "stage", from: [0.15, 0.3, 1], side: 0.3, pull: 1.0 }); p = CAM.shake(p, t, A.cinco, 0.02, 0.3); applyNight(p); };
});

// Cutaway of a house over the ground: a slice of bathroom (tiled floor and wall, the toilet) on top of a
// block of earth cut open; the sewer pipe drops from the toilet and runs along the cut face to the side,
// ending open in the air ("pra onde vai?"). Origin: floor centre of the block. API { group, wc, pipe, top }
function buildBathCutaway({ withWall = true } = {}) {
  const g = new THREE.Group(), top = 0.9;
  const soil = makeSoilCutaway({ w: 1.7, h: top, d: 1.0, top: "tile", seed: 3 }); soil.group.position.y = top; g.add(soil.group);
  if (withWall) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.06), mat("#ffffff", { map: tileTex(bathTileTex("#4f6468", "#2c383b", "slate"), 3.4, 1.9), roughness: 0.25 })); wall.position.set(0, top + 0.475, -0.47); g.add(wall);
  }
  const wc = makeToiletBowl({ s: 0.8 }); wc.group.position.set(-0.3, top, -0.08); g.add(wc.group);
  // from the toilet's foot, out over the front edge of the floor and down the cut face, then along it and out the side
  const pipe = makeSewerPipe([[-0.3, top + 0.03, 0.12], [-0.3, top + 0.03, 0.42], [-0.3, top - 0.08, 0.48], [-0.28, top - 0.38, 0.48], [0.2, top - 0.46, 0.48], [0.8, top - 0.5, 0.48], [1.15, top - 0.52, 0.48]], { r: 0.042 });
  g.add(pipe.group);
  return { group: g, wc, pipe, top };
}

// ============================================================ 6 · a OMS não mede se você tem banheiro; mede pra onde vai
// The cutaway: the toilet on its slice of floor, the earth cut open below; on "Mede" an orange flow runs
// down the pipe along the cut face and out the side. The camera cranes from the toilet down to the pipe.
addScene("corte", A.c5, A.c6, (S) => {
  const set = makeRiversideSet({ quayZ: -10, seed: 21 }); S.backdrop(set.group);
  const C = buildBathCutaway(); S.add(C.group);
  const anim = (t) => {
    set.update(t); nightLook({ keyI: 1.8, keyC: "#fff0dc", hemiI: 0.5 });
    C.wc.swirl(t, 0); C.wc.press(0); C.pipe.flow(t, sm(t, A.mede - 0.1, A.mede + 0.6));
    fill.position.set(0.3, 0.6, 1.6); fill.color.set(t > A.mede ? "#ffb36a" : "#cfe0ff"); fill.intensity = 1.2 + 1.2 * sm(t, A.mede, A.mede + 0.6);
  };
  S.hero(C.group, "corte do banheiro com o cano");
  const box = envelope([C.group], anim, A.c5, A.c6);
  return (t) => { anim(t); applyNight(CAM.move(box, "crane", lin(t, A.c5, A.c6), { zone: "stage", from: [0.4, 0.25, 1], rise: 0.35, pull: 1.02 })); };
});

// A handful of dark dirt: small irregular lumps (instanced). Origin: pile centre on the floor.
// API { mesh, set(center V3, spread, k) } — k shrinks it (swept away under the rug).
function makeDirtPile(n = 70, seed = 4) {
  const im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.022, 0), mat("#5a4632", { roughness: 1 }), n), r = mulberry32(seed), o = new THREE.Object3D(), items = [];
  for (let i = 0; i < n; i++) items.push({ x: (r() - 0.5) * 2, z: (r() - 0.5) * 2, s: 0.6 + r() * 1.2, ry: r() * 6 });
  im.userData.decor = true; im.frustumCulled = false;
  return {
    mesh: im,
    set(c, spread, k) { items.forEach((it, i) => { o.position.set(c.x + it.x * spread, 0.012 * it.s, c.z + it.z * spread * 0.6); o.rotation.set(it.ry, it.ry * 0.7, 0); o.scale.setScalar(Math.max(0.0001, it.s * k)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.instanceMatrix.needsUpdate = true; },
  };
}

// Facade of a tiny tower: dark glass with rows of lit windows (the miniature city on the rug). Cached per height.
function miniTowerTex(h) {
  return cachedTex("minitower-" + h.toFixed(2), () => {
    const c = makeCanvas(64, Math.round(64 * h / 0.08)), x = c.getContext("2d"), r = mulberry32(Math.round(h * 1000));
    x.fillStyle = "#8d939c"; x.fillRect(0, 0, c.width, c.height);
    for (let yy = 6; yy < c.height - 4; yy += 10) for (let xx = 6; xx < 60; xx += 13) { x.fillStyle = r() < 0.6 ? "#ffd08a" : "#3a4452"; x.fillRect(xx, yy, 8, 6); }
    return texFrom(c);
  });
}

// ============================================================ 7 · a analogia: varrer a sujeira pra debaixo do tapete
// A (living room at night): a push broom sweeps a pile of dark dirt under the edge of a Persian rug; the
// rug swells over it ("some da sua vista"). B (from "continua em casa"): the swollen rug; a dark stain seeps
// out from under its edge. C (from "Só que a casa é a sua cidade"): a whole miniature city rises on the rug,
// the swelling running under its streets, and the camera rises over it.
addScene("tapete", A.c6, A.c7, (S) => {
  const room = makeNightLivingRoom({ wallZ: -1.6, seed: 6 }); room.group.position.x = 6.5; S.backdrop(room.group);
  const win = makeSetWindow(1.8, 2.2, { seed: 6, open: 0.4 }); win.group.position.set(0.8, 2.1, -1.6 + 0.15); S.backdrop(win.group);   // the city at night (the room's own window sits behind its wall)
  const RX = 0.3, RZ = 0.2, RW = 1.6, RD = 1.05;
  const rug = makePersianRug({ w: RW, d: RD }); rug.group.position.set(RX, 0, RZ); rug.group.rotation.y = Math.PI / 2; S.add(rug.group);   // long side runs into the depth: in a tall frame it fills the width
  const broom = makeBroom({ len: 0.42, headW: 0.32, lean: 1.15 }); broom.group.rotation.y = Math.PI; S.add(broom.group);   // a hand broom: pushes toward −z, its short handle trails toward the camera (a long one inflates the shot)
  const dirt = makeDirtPile(80, 5); S.add(dirt.mesh);
  const edgeZ = RZ + RW / 2, LUMP = [-RW / 2 + 0.2, -0.05];   // rug-local (local x runs to −z): just inside the near edge, where the dirt went
  const blob = makeCanvas(256, 256), bx = blob.getContext("2d"), br8 = mulberry32(12); bx.fillStyle = "#ffffff"; bx.beginPath();
  for (let a = 0; a <= 6.3; a += 0.15) { const rr = 90 + 30 * Math.sin(a * 3 + 1) + 12 * br8(); a ? bx.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr) : bx.moveTo(128 + rr, 128); } bx.fill();
  const seep = new THREE.Mesh(new THREE.CircleGeometry(0.25, 40), new THREE.MeshPhysicalMaterial({ color: "#5a3e1c", alphaMap: texFrom(blob), roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.92, depthWrite: false })); seep.rotation.x = -Math.PI / 2; seep.position.set(RX + 0.3, 0.004, edgeZ + 0.07); S.add(seep);
  // the miniature city on the rug (rug-local), clear of the swelling's path
  const city = new THREE.Group(); rug.group.add(city);
  const r = mulberry32(8), spots = [], path = [];
  for (let i = 0; i <= 10; i++) { const x = -RW / 2 + 0.2 + i * (RW - 0.4) / 10; path.push([x, 0.15 * Math.cos(x * 3)]); }
  const pathZ = (x) => 0.15 * Math.cos(x * 3);
  for (let i = 0; i < 30; i++) { let x, z, ok = false; for (let k = 0; k < 60 && !ok; k++) { x = (r() - 0.5) * (RW - 0.45); z = (r() - 0.5) * (RD - 0.35); ok = Math.abs(z - pathZ(x)) > 0.15 && Math.hypot(x - LUMP[0], z - LUMP[1]) > 0.36 && spots.every((q) => Math.hypot(q[0] - x, q[1] - z) > 0.13); } if (ok) spots.push([x, z]); }
  const blocks = spots.map(([x, z], i) => {
    let b;
    if (i % 4 === 0) { const hgt = 0.18 + r() * 0.22; b = new THREE.Mesh(rbox(0.08, hgt, 0.08, 0.006), [0, 1, 2, 3, 4, 5].map((f) => f === 2 || f === 3 ? pmat("#6a7078", { roughness: 0.5 }) : pmat("#ffffff", { map: miniTowerTex(hgt), roughness: 0.5, emissive: "#ffffff", emissiveMap: miniTowerTex(hgt), emissiveIntensity: 0.5 }))); b.geometry.translate(0, hgt / 2, 0); }
    else { b = makeHouse({ w: 1.1, h: 0.8, d: 0.9, wall: ["#e8dcc6", "#d4b892", "#c9d2d6", "#e2c4a8"][i % 4], roof: ["#9a3a2a", "#6e4a3a", "#b0603a"][i % 3] }); b.userData.s = 0.075; }
    b.position.set(x, 0.012, z); b.rotation.y = (r() - 0.5) * 0.6; city.add(b); return b;
  });
  const anim = (t) => {
    room.update(t); room.light(0.9 - 0.25 * beat(t, A.cidade, 0.8)); key.intensity = 1.5; key.color.set("#ffd9b0"); hemi.intensity = 0.35;
    const push = sm(t, A.c6 + 0.3, A.tapete + 0.2), away = sm(t, A.some - 0.2, A.vista + 0.6);
    const hz = lerp(edgeZ + 0.38, edgeZ + 0.12, push) + 0.45 * away;   // the head stops short of the near edge
    broom.group.position.set(RX + 0.05, 0, hz); broom.group.visible = away < 0.98;
    const under = sm(t, A.tapete - 0.6, A.tapete + 0.2);
    dirt.set(new V3(RX + 0.05, 0, hz - 0.12 - 0.12 * under), 0.13 * (1 - 0.4 * push), 1 - under);
    const lumps = [[LUMP[0], LUMP[1], 0.1 * under, 0.26]];
    const run = sm(t, A.so - 0.1, A.cidade);
    if (run > 0) path.forEach(([x, z], i) => { const k = clamp(run * 11 - i); if (k > 0) lumps.push([x, z, 0.045 * k, 0.13]); });
    rug.bulge(lumps);
    seep.visible = t > A.continua - 0.2; const sk = sm(t, A.continua - 0.2, A.casa + 0.3) + 0.8 * sm(t, A.cidade - 0.2, A.c7);
    seep.scale.set(0.3 + 0.9 * sk, 0.2 + 0.6 * sk, 1);
    city.visible = t > A.so - 0.15;
    blocks.forEach((b, i) => { const k = sm(t, A.so - 0.1 + i * 0.03, A.so + 0.35 + i * 0.03); b.visible = k > 0.01; const s0 = b.userData.s || 1; b.scale.set(s0, s0 * Math.max(0.001, k), s0); });
    fill.position.set(RX, 1.2, RZ + 1.4); fill.color.set("#ffcf8a"); fill.intensity = 1.5;
  };
  S.hero(broom.group, "vassoura", { when: (t) => t < A.some });
  S.hero(rug.group, "tapete persa", { when: (t) => t < B7b });
  S.hero(rug.group, "cidade em miniatura no tapete", { when: (t) => t > A.so + 0.6 });
  S.solid(rug.group, "tapete persa");
  const bA = envelope([broom.group, rug.group], anim, A.c6, A.some - 0.25), bB = envelope([rug.group, seep], anim, B7a, B7b), bC = envelope([rug.group], anim, B7b + 0.6, A.c7);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c6, B7a), { zone: "stage-tall", from: [-0.15, 0.75, 1], pull0: 1.12, pull: 1.0 });
    const pb = CAM.move(bB, "orbit", lin(t, B7a, B7b), { zone: "stage-tall", from: [-0.15, 0.9, 1], deg: 28, pull: 1.0 });
    const pc = CAM.move(bC, "crane", lin(t, B7b, A.c7), { zone: "stage-tall", from: [0.05, 0.9, 1], rise: 0.3, pull: 1.0 });
    let p = t < (B7a + B7b) / 2 ? CAM.blend(pa, pb, sm(t, B7a - 0.3, B7a + 0.4)) : CAM.blend(pb, pc, sm(t, B7b - 0.2, B7b + 0.6));
    p = CAM.shake(p, t, A.cidade, 0.02, 0.35); CAM.apply(p);
  };
});

// Round sign on a post stuck in the ground: a red ✕ or a green ✓ on a disc. Origin: foot of the post.
function makeVerdictSign(ok, { r = 0.17, post = 0.55 } = {}) {
  const g = new THREE.Group(), c = makeCanvas(256, 256), x = c.getContext("2d");
  x.fillStyle = ok ? "#2fae66" : "#d42a1e"; x.beginPath(); x.arc(128, 128, 124, 0, 6.3); x.fill();
  x.strokeStyle = "#ffffff"; x.lineWidth = 30; x.lineCap = "round"; x.beginPath();
  if (ok) { x.moveTo(70, 132); x.lineTo(112, 176); x.lineTo(188, 86); } else { x.moveTo(80, 80); x.lineTo(176, 176); x.moveTo(176, 80); x.lineTo(80, 176); }
  x.stroke();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, post, 10), pmat("#c9ccd2", { metalness: 0.85, roughness: 0.3 })); stick.position.y = post / 2; g.add(stick);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.025, 40), pmat("#e6e6e6", { roughness: 0.4, metalness: 0.3 }));
  disc.rotation.x = Math.PI / 2; disc.position.set(0, post + r * 0.8, 0.02); g.add(disc);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false })); face.position.set(0, post + r * 0.8, 0.034); g.add(face);
  return g;
}

// ============================================================ 8 · cano no rio não conta; fossa bem feita conta
// Two cut blocks of ground side by side. Left: a little house whose pipe runs along the cut face and out
// into a dark ditch (a red ✕ pops up). Right: a house whose pipe runs into a buried septic tank, shown in
// the cut (a green ✓). The camera slides from one to the other.
addScene("conta", A.c7, A.c8, (S) => {
  const set = makeRiversideSet({ quayZ: -10, seed: 31 }); S.backdrop(set.group);
  const L = new THREE.Group(), Rg = new THREE.Group(); L.position.set(-1.0, 0, 0); Rg.position.set(1.0, 0, 0); S.add(L, Rg);
  const grassM = mat("#ffffff", { map: tileTex(grassTex(), 2, 1), roughness: 1 });
  // a box of earth from (x0, y0, z0) to (x1, y1, z1), grass on top when it reaches the ground line; the soil bands
  // follow world height, so the pieces meet without a seam
  const soilFace = (u0, u1, y0, y1) => { const tx = soilLayersTex(4).clone(); tx.needsUpdate = true; tx.repeat.set((u1 - u0) / 1.7, (y1 - y0) / 0.8); tx.offset.set(u0 / 1.7, y0 / 0.8); return mat("#ffffff", { map: tx, roughness: 0.95 }); };
  const soilPiece = (G, x0, x1, y0, y1, z0, z1) => { const fz = soilFace(x0, x1, y0, y1), fx = soilFace(z0, z1, y0, y1); const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), [fx, fx, y1 >= 0.8 ? grassM : fz, fz, fz, fz]); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); G.add(m); };
  soilPiece(L, -0.55, 0.85, 0, 0.8, -0.5, 0.5);                       // left: the plot
  soilPiece(L, -0.95, -0.55, 0, 0.36, -0.5, 0.5); soilPiece(L, -1.01, -0.95, 0, 0.62, -0.5, 0.5);   // the ditch's bed and far bank
  soilPiece(Rg, -0.85, 0.85, 0, 0.8, -0.5, 0.1);                      // right: behind the tank
  soilPiece(Rg, -0.85, 0.01, 0, 0.8, 0.1, 0.5); soilPiece(Rg, 0.63, 0.85, 0, 0.8, 0.1, 0.5); soilPiece(Rg, 0.01, 0.63, 0, 0.32, 0.1, 0.5); soilPiece(Rg, 0.01, 0.63, 0.78, 0.8, 0.1, 0.5);   // grass over the buried tank
  for (const [G, ok] of [[L, false], [Rg, true]]) {
    G.add(contactShadow(2.2, 1.6));
    const hs = makeHouse({ w: 1.1, h: 0.8, d: 0.9, wall: ok ? "#e6d6bc" : "#d4b892", roof: "#9a3a2a" }); hs.scale.setScalar(0.42); hs.position.set(ok ? -0.35 : 0.35, 0.8, -0.15); G.add(hs);
    const sign = makeVerdictSign(ok); sign.position.set(ok ? 0.45 : -0.45, 0.8, 0.2); G.add(sign); G.userData.sign = sign;
  }
  // left: pipe from the house down the cut face into a ditch of dark water at the block's left end
  const dc = makeCanvas(128, 256), dx = dc.getContext("2d"); dx.fillStyle = "#3b3a24"; dx.fillRect(0, 0, 128, 256); for (let i = 0; i < 60; i++) { dx.fillStyle = `rgba(200,190,150,${0.1 + Math.random() * 0.2})`; dx.fillRect(Math.random() * 128, Math.random() * 256, 2 + Math.random() * 10, 2); }
  const dtex = texFrom(dc); dtex.wrapS = dtex.wrapT = THREE.RepeatWrapping;
  const ditch = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 1.0), new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: dtex, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 })); ditch.position.set(-0.75, 0.39, 0); L.add(ditch);
  const pL = makeSewerPipe([[0.35, 0.86, 0.05], [0.35, 0.83, 0.3], [0.35, 0.74, 0.49], [0.3, 0.58, 0.49], [-0.4, 0.55, 0.49], [-0.62, 0.52, 0.4]], { r: 0.03 }); L.add(pL.group);
  // right: pipe from the house into the septic tank, set into the cut face
  const tank = makeSepticTank({ w: 0.62, h: 0.42, d: 0.4 }); tank.group.position.set(0.32, 0.8 - 0.06, 0.3); Rg.add(tank.group);   // fills the notch x 0.01–0.63, z 0.1–0.5
  const pR = makeSewerPipe([[-0.35, 0.86, 0.05], [-0.35, 0.83, 0.3], [-0.35, 0.74, 0.49], [-0.3, 0.64, 0.49], [-0.1, 0.62, 0.49], [0.06, 0.62, 0.45]], { r: 0.03 }); Rg.add(pR.group);
  const anim = (t) => {
    set.update(t); nightLook({ keyI: 1.9, keyC: "#fff0dc", hemiI: 0.5 });
    pL.flow(t, 1); pR.flow(t, sm(t, B8, B8 + 0.5)); dtex.offset.y = -t * 0.12;
    popIn(L.userData.sign, t, A.naoconta - 0.05, 0.35); popIn(Rg.userData.sign, t, A.conta - 0.15, 0.35);
    fill.position.set(t < B8 ? -1 : 1, 1.4, 1.6); fill.color.set(t < B8 ? "#ff7a5a" : "#8fffb0"); fill.intensity = 1.1;
  };
  S.hero(L, "corte: cano pro rio", { when: (t) => t < B8 - 0.4 }); S.hero(Rg, "corte: fossa", { when: (t) => t > B8 + 0.5 });
  const bA = envelope([L], anim, A.c7, B8), bB = envelope([Rg], anim, B8, A.c8);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "truck", lin(t, A.c7, B8), { zone: "stage", from: [0.25, 0.35, 1], side: 0.25, pull: 1.0 });
    const pb = CAM.move(bB, "truck", lin(t, B8, A.c8), { zone: "stage", from: [-0.1, 0.35, 1], side: 0.25, pull: 1.0 });
    let p = CAM.blend(pa, pb, sm(t, B8 - 0.35, B8 + 0.45)); p = CAM.shake(p, t, A.naoconta, 0.02, 0.3); applyNight(p);
  };
});

// A village lane at dusk behind the India photo: a brick wall, a strip of warm sky, string lights.
function makeVillageDusk({ wallZ = -1.6, seed = 7 } = {}) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), mat("#ffffff", { map: tileTex(setBrickTex(), 8, 1.6), roughness: 0.9 })); wall.position.set(0, 1.6, wallZ); g.add(wall);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 0.3), mat("#8a6a50", { roughness: 0.8 })); cap.position.set(0, 3.22, wallZ + 0.1); g.add(cap);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), mat("#ffffff", { map: tileTex(noiseTex({ base: "#8a6a4a", amount: 0.2, seed: 71 }), 8, 5), roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.001, wallZ + 5); g.add(ground);
  const r = mulberry32(seed), bulbs = [];
  for (let i = 0; i < 26; i++) { const x = -6 + i * 0.48, y = 2.9 - 0.25 * Math.sin(((i % 9) / 8) * Math.PI); const s = sprite(BOKEH, 0.32); s.material.color.set(["#ffcf8a", "#ff9a4a", "#fff2dc"][i % 3]); s.material.blending = THREE.AdditiveBlending; s.position.set(x, y, wallZ + 0.3); g.add(s); bulbs.push({ s, ph: r() * 6 }); }
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), new THREE.MeshBasicMaterial({ map: NIGHT_SKY, toneMapped: false, fog: false })); sky.position.set(0, 7, wallZ - 6); g.add(sky);
  const shaft = makeLightShaft([2.5, 4, wallZ + 0.5], [0.3, 0, wallZ + 3], { color: "#ffcf8a", opacity: 0.1 }); g.add(shaft.group);
  asBackdrop(g);
  return { group: g, update(t) { bulbs.forEach((b) => { b.s.material.opacity = 0.55 + 0.25 * Math.sin(t * 2.5 + b.ph); }); } };
}

// ============================================================ 9 · foi aí que a Índia correu: mais de cem milhões de banheiros
// The photo of India's prime minister helping build a twin-pit toilet, in a frame on a pedestal in a village
// lane at dusk; it turns and lands, slow zoom; the camera orbits.
addScene("india", A.c8, A.c9, (S) => {
  const set = makeVillageDusk({ wallZ: -1.6, seed: 7 }); S.backdrop(set.group);
  const fr = makePhotoFrame("modi-banheiro", { w: 2.1, shape: 1298 / 1062, name: "MODI E UMA FOSSA · 2017" }); S.add(fr.group);
  const anim = (t) => {
    set.update(t); scene.background = NIGHT_SKY; key.intensity = 1.7; key.color.set("#ffd2a0"); hemi.intensity = 0.45; floor.visible = false;
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, A.c8, A.c8 + 0.7))); popIn(fr.group, t, A.c8, 0.45); fr.zoom(1 + 0.16 * lin(t, A.c8, A.c9));
    fill.position.set(0.5, 1.6, 1.8); fill.color.set("#ffcf8a"); fill.intensity = 1.2 + 1.2 * beat(t, A.desde, 0.6);
  };
  S.hero(fr.group, "porta-retrato índia");
  const box = envelope([fr.group], anim, A.c8 + 0.8, A.c9);
  return (t) => { anim(t); let p = CAM.move(box, "orbit", lin(t, A.c8, A.c9), { zone: "stage", from: [0, 0.22, 1], deg: 30, pull: 1.0 }); p = CAM.shake(p, t, A.desde, 0.018, 0.3); CAM.apply(p); };
});

// ============================================================ 10 · em 2000, o Brasil tinha quase quatro vezes
// Back on the stairs: the flags rewind from 2024 to 2000 — Brazil slides down to 34, India all the way to
// 9 near the bottom. The camera drops from above to the flags' level.
addScene("ano2000", A.c9, A.c10, (S) => {
  const R = buildRankStairs(S, 13);
  const s34 = makeValueSign("34%", { bg: "#2c7a3f" }), s9 = makeValueSign("9%"); S.add(s34, s9);
  const back = (t) => 2024 - 24 * sm(t, A.c9 + 0.1, A.y2000 + 0.5);
  const anim = (t) => {
    R.set.update(t, 0.3 * beat(t, A.y2000, 0.6)); stairsLight(t);
    const y = back(t), done = t > A.y2000 + 0.5;
    R.place(done ? restP(BR[0]) : seriesAt(BR, y), done ? restP(IN[0]) : seriesAt(IN, y)); R.br.update(t); R.ind.update(t);
    s34.position.copy(R.br.group.position).add(new V3(SIGN_DX, 0, 0.02)); popIn(s34, t, 53.6, 0.4);
    s9.position.copy(R.ind.group.position).add(new V3(SIGN_DX, 0, 0.02)); popIn(s9, t, 55.6, 0.4);
    fill.position.set(0, 1.2, 1.8);
  };
  const R1 = A.y2000 + 0.5, TB = 55.45, TI = 56.05;   // rewind done · leave Brazil · arrive at India
  S.hero(R.br.group, "bandeira do brasil", { when: (t) => t < TB }); S.hero(R.ind.group, "bandeira da índia", { when: (t) => t > TI });
  S.hero(s34, "placa 34%", { when: (t) => t > 54.0 && t < TB }); S.hero(s9, "placa 9%", { when: (t) => t > TI });
  const o = { zone: "stage", from: [-0.3, 0.45, 1], pull: 1.08 };
  const bBR = envelope([R.br.group, s34], anim, R1, TB), bIN = envelope([R.ind.group, s9], anim, TI, A.c10);
  return (t) => {
    let p;
    if (t < R1) { p = CAM.pose(envelope([R.br.group, s34], anim, Math.max(A.c9, t - 0.3), Math.min(R1, t + 0.3), 0.1), { ...o, pull: 1.25 }); anim(t); }
    else {
      anim(t);
      const pa = CAM.move(bBR, "push", lin(t, R1, TB), { ...o, pull0: 1.25, pull: 1.05 }), pb = CAM.move(bIN, "drop", lin(t, TI, A.c10), { ...o, rise: 0.25, pull: 1.05 });
      p = CAM.blend(pa, pb, sm(t, TB, TI));
    }
    applyNight(p);
  };
});

// ============================================================ 11 · o Brasil sobe menos de um ponto por ano; a Índia, mais de dois
// The years run 2000 → 2019 (the counter on the headline): Brazil hops up one step at a time, India
// bounds up two or three; in 2019 India passes Brazil (camera shake, the city flares). The camera follows
// the flags up the stairs.
addScene("ritmo", A.c10, A.c11, (S) => {
  const R = buildRankStairs(S, 17);
  const year = (t) => 2000 + 19 * lin(t, SWEEP0, SWEEP1);
  const anim = (t) => {
    const fl = beat(t, A.passou2, 0.9);
    R.set.update(t, fl); stairsLight(t, fl);
    const y = year(t), rest = t < SWEEP0 || t > SWEEP1;
    R.place(rest ? restP(seriesAt(BR, y)) : seriesAt(BR, y), rest ? restP(seriesAt(IN, y)) : seriesAt(IN, y)); R.br.update(t); R.ind.update(t);
    fill.position.copy(R.ind.group.position).add(new V3(0.3, 0.9, 1.2));
  };
  const T1 = A.indiaDois - 0.4, T2 = A.y2019 - 0.6;   // Brazil alone · India alone · both
  S.hero(R.br.group, "bandeira do brasil", { when: (t) => t < T1 || t > T2 + 0.8 }); S.hero(R.ind.group, "bandeira da índia", { when: (t) => t > T1 + 0.6 });
  const follow = (objs, t, o) => CAM.pose(envelope(objs, anim, Math.max(A.c10, t - 0.5), Math.min(A.c11, t + 0.5), 0.1), o);
  return (t) => {
    const oB = { zone: "stage", from: [-0.3, 0.3, 1], pull: 1.2 }, oI = { zone: "stage", from: [0.35, 0.3, 1], pull: 1.2 }, o2 = { zone: "stage", from: [0.2, 0.4, 1], pull: 1.06 };
    let p;
    if (t < T1 + 0.6) { const a = follow([R.br.group], t, oB); p = t < T1 ? a : CAM.blend(a, follow([R.ind.group], t, oI), sm(t, T1, T1 + 0.6)); }
    else if (t < T2) p = follow([R.ind.group], t, oI);
    else p = CAM.blend(follow([R.ind.group], t, oI), follow([R.br.group, R.ind.group], t, o2), sm(t, T2, T2 + 0.8));
    anim(t); p = CAM.shake(p, t, A.passou2, 0.03, 0.45); applyNight(p);
  };
});

// ============================================================ 12 · não andou pra trás; andou devagar, enquanto o mundo correu
// 2019 → 2024: the flags take their last hops (Brazil 55, India 63). Then an orange laser — the world
// average — rises up the stairs from Brazil's step and stops above it, at 58.5%. The camera opens up.
addScene("mundo", A.c11, A.c12, (S) => {
  const R = buildRankStairs(S, 19);
  const laser = new THREE.Group(); S.add(laser);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false })); laser.add(beam);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.32), new THREE.MeshBasicMaterial({ map: setGlowTex(), color: ORANGE, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.userData.decor = true; laser.add(glow);
  for (const sx of [-1, 1]) { const emit = new THREE.Mesh(rbox(0.07, 0.06, 0.07, 0.01), pmat("#2a2c30", { metalness: 0.7, roughness: 0.35 })); emit.position.set(sx * 1.28, 0, 0); laser.add(emit); }
  const year = (t) => 2019 + 5 * lin(t, SWEEP2, SWEEP3);
  const wl = (t) => lerp(restP(BR[24]), WLD[24], sm(t, A.mundo - 0.6, A.mundo + 0.6));
  const anim = (t) => {
    R.set.update(t, 0.4 * beat(t, A.mundo + 0.3, 0.7)); stairsLight(t);
    const y = year(t), rest = t < SWEEP2 || t > SWEEP3;
    R.place(rest ? restP(seriesAt(BR, y)) : seriesAt(BR, y), rest ? restP(seriesAt(IN, y)) : seriesAt(IN, y)); R.br.update(t); R.ind.update(t);
    const v = wl(t), ly = v * R.stairs.rise + 0.06 + R.stairs.rise * 0.5 + 0.03, lz = -(v - 1) * R.stairs.tread;   // on the side walls' top
    laser.position.set(0, ly, lz); laser.visible = t > A.mundo - 0.7; glow.material.opacity = 0.5 + 0.2 * Math.sin(t * 9);
    fill.position.set(0, ly + 1, lz + 1.5); fill.color.set(ORANGE); fill.intensity = laser.visible ? 1.6 : 0.8;
  };
  S.hero(R.br.group, "bandeira do brasil"); S.hero(R.ind.group, "bandeira da índia");
  S.hero(laser, "laser da média do mundo", { when: (t) => t > A.mundo + 0.6 });
  const box = envelope([R.br.group, R.ind.group, laser], anim, A.mundo, A.c12), b0 = envelope([R.br.group, R.ind.group], anim, A.c11, A.devagar);
  return (t) => {
    anim(t);
    const pa = CAM.move(b0, "push", lin(t, A.c11, A.devagar), { zone: "stage", from: [-0.35, 0.4, 1], pull0: 1.2, pull: 1.0 });
    const pb = CAM.move(box, "reveal", lin(t, A.devagar, A.c12), { zone: "stage", from: [-0.25, 0.45, 1], pull: 1.0, pull0: 1.2 });
    applyNight(CAM.blend(pa, pb, sm(t, A.devagar - 0.6, A.devagar + 0.6)));
  };
});

// A block of people (instanced figures: body + head), 14 × 10; the hero of the crowd shot. dim(k):
// 43% of them (a seeded set, spread through the block) go dark. Origin: floor centre.
function makePeopleBlock({ cols = 14, rows = 10, sx = 0.36, sz = 0.42, seed = 9 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), items = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) items.push({ x: (col - (cols - 1) / 2) * sx + (row % 2) * sx * 0.3 + (r() - 0.5) * 0.06, z: -row * sz + (r() - 0.5) * 0.08, h: 0.92 + r() * 0.16, c: ["#c9b8a6", "#e0a070", "#7a8aa0", "#b06a4a", "#d9cdb8", "#5b7a6a"][Math.floor(r() * 6)], ph: r() * 6.28, off: r() < 0.433 });
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.11, 0.5, 6, 12), pmat("#ffffff", { roughness: 0.7 }), items.length);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 16, 12), pmat("#ffffff", { roughness: 0.6 }), items.length);
  const d = new THREE.Object3D(), col = new THREE.Color(), dark = new THREE.Color("#1c1a1c"), skin = new THREE.Color("#c8977a");
  g.add(body, head);
  return {
    group: g,
    update(t, k) {
      items.forEach((it, i) => {
        const sway = Math.sin(t * 1.4 + it.ph) * 0.02;
        d.position.set(it.x + sway, 0.36 * it.h, it.z); d.scale.set(1, it.h, 1); d.rotation.set(0, 0, sway); d.updateMatrix(); body.setMatrixAt(i, d.matrix);
        d.position.set(it.x + sway * 2, 0.82 * it.h, it.z); d.scale.setScalar(1); d.updateMatrix(); head.setMatrixAt(i, d.matrix);
        const kk = it.off ? clamp(k * 1.6 - (i % 7) * 0.08) : 0;
        body.setColorAt(i, col.set(it.c).lerp(dark, kk)); head.setColorAt(i, col.copy(skin).lerp(dark, kk));
      });
      body.instanceMatrix.needsUpdate = head.instanceMatrix.needsUpdate = true; body.instanceColor.needsUpdate = head.instanceColor.needsUpdate = true;
    },
  };
}

// ============================================================ 13 · noventa milhões sem coleta de esgoto
// A crowd on the riverside plaza at night; on "nem têm coleta" 43% of the front block goes dark. The
// camera cranes up over it.
addScene("multidao", A.c12, A.c13, (S) => {
  const set = makeRiversideSet({ quayZ: -14, seed: 23 }); S.backdrop(set.group);
  const field = makeCrowdField({ rows: 14, cols: 34, sx: 0.5, sz: 0.55, z0: -4.6, seed: 13 }); S.backdrop(field.group);
  const blk = makePeopleBlock(); S.add(blk.group);
  const anim = (t) => {
    set.update(t, 0); nightLook({ keyI: 1.8, keyC: "#ffe2c4", hemiI: 0.55 }); field.update(t);
    blk.update(t, sm(t, A.coleta - 0.9, A.coleta + 0.3));
    fill.position.set(0, 2, 2); fill.color.set("#ffd9a8"); fill.intensity = 1.2;
  };
  S.hero(blk.group, "multidão");
  const box = envelope([blk.group], anim, A.c12, A.c13);
  return (t) => { anim(t); let p = CAM.move(box, "crane", lin(t, A.c12, A.c13), { zone: "stage", from: [0.15, 0.5, 1], rise: 0.35, pull: 1.0 }); p = CAM.shake(p, t, A.noventa, 0.02, 0.3); applyNight(p); };
});

// Plain office desk: varnished top and two pedestals. Origin: floor centre; top at h. API { group, top }
function makeSaneDesk({ w = 2.2, d = 1.25, h = 0.78 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.55, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.32), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}

// ============================================================ 14 · a lei promete 2033; no ritmo atual, 2070
// An office at night: on the desk the law book (LEI 14.026) and a flip calendar at 2033; on "No ritmo
// atual" the pages flip, faster and faster, to 2070 (red). The camera pushes in.
addScene("lei", A.c13, A.c14, (S) => {
  const off = makeOfficeSet({ wallZ: -2.2, clear: 3.4, seed: 27 }); S.backdrop(off.group);
  const desk = makeSaneDesk(); S.add(desk.group);
  const book = makeLawBook({ title: "LEI 14.026", color: "#1f3a5a", emblem: false }); book.group.scale.setScalar(0.42); book.group.position.set(-0.45, desk.top, 0.05);
  book.group.rotation.y = 0.2; S.add(book.group);
  book.titlePlate.visible = false; book.print("LEI 14.026", 1.6, 0.56, -0.5);   // a bigger title: it reads on a phone
  const years = ["2033", "2035", "2040", "2045", "2050", "2055", "2060", "2065", "2070"];
  const cal = makeFlipCalendar(years, { w: 0.7, h: 0.62 }); cal.group.position.set(0.48, desk.top, -0.05); cal.group.rotation.y = -0.2; S.add(cal.group);
  const anim = (t) => {
    off.update(t); off.lights(0.3); off.windows(0.8, "#8fb0ff"); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.32;
    const f = Math.pow(lin(t, A.ritmo - 0.1, A.a2070), 1.6) * (years.length - 1), i = Math.floor(f);
    cal.show(Math.min(i, years.length - 1), i < years.length - 1 ? f - i : 0);
    fill.position.set(0.4, desk.top + 0.9, 0.9); fill.color.set(t > A.a2070 ? "#ff4a3a" : "#ffcf8a"); fill.intensity = 1.4 + 1.5 * beat(t, A.a2070, 0.7);
  };
  S.hero(book.group, "livro da lei 14.026"); S.hero(cal.group, "calendário 2033 a 2070");
  S.solid(desk.group, "mesa");
  const box = new THREE.Box3(new V3(-0.9, desk.top, -0.5), new V3(0.86, desk.top + 0.72, 0.55));   // the book flat on the desk and the calendar (pages flip inside its height)
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c13, A.c14), { zone: "stage", from: [0.06, 0.95, 1], pull0: 1.1, pull: 1.0 }); p = CAM.shake(p, t, A.a2070, 0.025, 0.35); CAM.apply(p); };
});

// ============================================================ 15 · imagina: quem nasce hoje vai ter 44 anos
// A door casing in the living room at night with a time ruler on the jamb: tags pop up one after the
// other — 2026 · 0, 2036 · 10 … — up to 2070 · 44 ANOS (orange). The camera rises with them.
addScene("regua", A.c14, A.c15, (S) => {
  const room = makeNightLivingRoom({ wallZ: -0.08, seed: 9, pendant: false }); room.group.position.x = -0.4; S.backdrop(room.group);
  const win = makeSetWindow(1.6, 2.0, { seed: 9, open: 0.45 }); win.group.position.set(-3.0, 1.8, -0.08 + 0.15); S.backdrop(win.group);
  const marks = [[0.2, "HOJE · 0"], [0.62, "10 ANOS"], [1.04, "20 ANOS"], [1.46, "30 ANOS"], [1.82, "40 ANOS"], [2.1, "44 ANOS · 2070"]];
  const door = makeGrowthDoor({ w: 0.9, h: 2.1, marks, ruler: 2.1, tagW: 0.62, tagH: 0.2 }); door.group.position.set(-1.0, 0, 0); S.add(door.group);
  const tAt = (i) => lerp(A.quem - 0.2, A.a44 - 0.1, i / (marks.length - 1));
  const anim = (t) => {
    room.update(t); room.light(0.85); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.35;
    let i = -1, k = 0; marks.forEach((_, j) => { if (t > tAt(j)) { i = j; k = lin(t, tAt(j), tAt(j) + 0.35); } });
    door.show(i, k);
    fill.position.set(0.4, 1.6, 1.4); fill.color.set(t > A.a44 ? ORANGE : "#ffcf8a"); fill.intensity = 1.3 + 1.2 * beat(t, A.a44, 0.6);
  };
  S.hero(door.group, "batente com régua");
  const box = envelope([door.group], anim, A.c14, A.c15);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c14, A.c15), { zone: "stage", from: [0.2, 0.2, 1], rise: 0.3, pull: 1.0 })); };
});

// Stone plinth with a printed name on the front. Origin: floor centre; top at h. API { group, top }
function makeNamePlinth(text, { w = 0.72, h = 0.62, color = "#1b1714" } = {}) {
  const g = new THREE.Group(), stone = pmat("#2a2c30", { roughness: 0.3, clearcoat: 0.7 });
  const body = new THREE.Mesh(rbox(w, h, w, 0.02), stone); body.position.y = h / 2; g.add(body);
  const p = makePlate(text, w * 0.96, 0.24, { bg: color, fg: "#ffffff" }); p.position.set(0, h * 0.55, w / 2 + 0.016); g.add(p);
  g.add(contactShadow(w + 0.6, w + 0.6));
  return { group: g, top: h };
}

// ============================================================ 16 · a pergunta: conta mais cara já, ou esperar até 2070?
// On the riverside plaza, Brazil's flag between two plinths: PAGAR MAIS (a stack of coins that grows on
// "pagaria") and ESPERAR (an hourglass that turns and runs on "espera"). The camera pushes, then orbits.
addScene("pergunta", A.c15, A.end, (S) => {
  const set = makeRiversideSet({ quayZ: -9, seed: 29 }); S.backdrop(set.group);
  const br = makeNationFlag("brasil", { poleH: 1.75, fw: 0.62 }); br.group.position.set(-0.05, 0, -0.35); S.add(br.group);   // the cloth flies above the hourglass
  const pL = makeNamePlinth("PAGAR MAIS", { color: "#2c7a3f" }), pR = makeNamePlinth("ESPERAR", { color: "#b51f17" });
  pL.group.position.set(-0.66, 0, 0.3); pR.group.position.set(0.66, 0, 0.3); S.add(pL.group, pR.group);
  const coins = makeCoinColumn(16, { r: 0.17, t: 0.04 }); coins.group.position.set(-0.66, pL.top, 0.3); S.add(coins.group);
  const hg = makeHourglass({ h: 0.66 }); hg.group.position.set(0.66, pR.top, 0.3); S.add(hg.group);
  const anim = (t) => {
    set.update(t); nightLook({ keyI: 1.8, keyC: "#ffe0c0", hemiI: 0.5 }); br.update(t);
    coins.set(0.15 + 0.85 * sm(t, A.pagaria, A.b2033));
    hg.set(0.12 + 0.6 * lin(t, A.c15, A.end) + 0.2 * sm(t, A.espera - 0.2, A.end)); hg.group.rotation.y = 0.3 * Math.sin((t - A.c15) * 0.6);
    fill.position.set(0, 1.4, 1.6); fill.color.set("#ffd9a8"); fill.intensity = 1.3;
  };
  S.hero(br.group, "bandeira do brasil"); S.hero(pL.group, "pedestal pagar mais"); S.hero(pR.group, "pedestal esperar");
  S.hero(coins.group, "pilha de moedas"); S.hero(hg.group, "ampulheta");
  const B = A.ou - 0.3;
  const bA = envelope([br.group, pL.group, pR.group, coins.group, hg.group], anim, A.c15, A.end);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c15, B), { zone: "stage", from: [0, 0.2, 1], pull0: 1.12, pull: 1.0 });
    const pb = CAM.move(bA, "orbit", lin(t, B, A.end), { zone: "stage", from: [0, 0.2, 1], deg: 24, pull: 1.0 });
    applyNight(CAM.blend(pa, pb, sm(t, B - 0.4, B + 0.6)));
  };
});
