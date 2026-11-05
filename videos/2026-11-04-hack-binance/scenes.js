// ============================================================================
// videos/2026-11-04-hack-binance/scenes.js
// O hack de US$ 6,3 bilhões na Binance (29/10/2026): uns 20 minutos, o maior roubo de cripto da história
// (4× a Bybit), nenhuma chave vazou. Começou numa entrevista de emprego falsa: o teste de programação tinha
// um vírus; do computador do engenheiro, pelas ferramentas internas de IA, até o sistema que autoriza os
// saques. Em junho, outro engenheiro já tinha instalado uma ferramenta falsa. O FBI aponta a Coreia do
// Norte; saques travados; ~US$ 3 bi congelados; a Binance promete cobrir as perdas.
// Analogia única: o banco — cofre no subsolo (carteira fria), gaveta do caixa (carteira quente) e o
// carimbo do gerente (o sistema que autoriza os saques).
// Times come from audio/words.json (A below).
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops (data
// centre, office at night, vault room, living room) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  vinte: 0.26, hackers: 1.62, levaram: 1.84, seis: 2.48, bilhoes: 2.96, binance: 4.44, c1: 5.1,
  maior: 5.32, mundo: 7.1, roubo: 8.38, historia: 9.48, quatro: 10.24, vezes: 10.64, anterior: 11.74, c2: 12.3,
  estranho: 13.04, segundo: 13.9, nenhuma: 15.28, vazou: 16.02, c3: 16.62,
  entrevista: 17.72, emprego: 18.54, c4: 19.0,
  imagina: 19.12, engenheiro: 20.3, recrutador: 21.96, vaga: 23.4, sonhos: 23.9, c5: 24.5,
  varias: 24.7, entrevistas: 25.12, fim: 26.26, teste: 26.92, abre: 28.62, arquivo: 29.04, pronto: 29.88, c6: 30.35,
  dentro: 30.54, virus: 32.02, escondido: 32.4, computador: 33.54, porta: 34.7, entrada: 35.22, c7: 35.62,
  como: 35.96, bilhoes2: 37.4, c8: 38.2,
  banco: 38.92, quase: 39.5, cofre: 41.1, subsolo: 42.32, so: 43.06, sobe: 43.78, gaveta: 44.44, caixa: 44.9, sacar: 45.78, c9: 46.2,
  igual: 47.1, fria: 49.12, internet: 50.2, gaveta2: 51.08, quente: 52.22, ligada: 52.96, c10: 53.3,
  tocaram: 54.56, cofre3: 55.3, foram: 55.7, carimbo: 56.72, gerente: 57.44, sistema: 58.22, autoriza: 58.94, saques: 59.7, c11: 60.6,
  computador2: 61.16, passaram: 62.1, ferramentas: 62.52, artificial: 64.24, carimbo2: 65.7, carimbaram: 66.64, c12: 68.95,
  meses: 69.9, junho: 70.8, outro: 71.6, instalado: 72.84, falsa: 73.92, c13: 74.4,
  quem: 74.58, fbi: 75.56, coreia: 76.82, c14: 77.8,
  imagina2: 78.18, cliente: 80.28, tenta: 80.96, sacarC: 81.2, travaram: 82.64, c15: 83.65,
  congelou: 84.1, metade: 84.94, parceiros: 86.26, prometeu: 87.26, perdas: 88.76, caixaP: 89.76, c16: 90.45,
  confia: 92.18, pagou: 93.72, foge: 94.8, vez: 95.98, end: 98.2,
};
// In-scene cut (also in video.json → cuts): the vault, then the teller's counter.
const B11 = A.foram - 0.1;
// The four stamp blows of "carimbaram saque atrás de saque".
const SLAMS = [66.68, 67.45, 68.05, 68.6];

// ---------------------------------------------------------------- looks (lights and fog per place)
function hallLook(hall, t, alarm, lights = 0.9) {
  hall.alarm(alarm); hall.update(t); hall.lights(lights); scene.fog.color.set("#070a0e");
  key.intensity = 1.6; key.color.set("#dce8ff"); hemi.intensity = 0.35; hemi.color.set("#bcd2ff"); hemi.groundColor.set("#0d1014");
}
function officeLook(off, t, lights = 0.3) {
  off.update(t); off.lights(lights); off.windows(0.9, "#8fb0ff");
  key.intensity = 1.3; key.color.set("#ffd9b0"); hemi.intensity = 0.32;
}
// The dark office with a window onto the city at night right behind the subject (in 9:16 the set's own
// windows fall outside the frame). API { off, win }
function officeBack(S, seed, wallZ = -2.2) {
  const off = makeOfficeSet({ wallZ, clear: 1.2, seed }); S.backdrop(off.group);
  const win = makeSetWindow(2.4, 1.6, { seed: seed + 2, open: 0.2 }); win.group.position.set(0, 1.9, wallZ + 0.15); S.backdrop(win.group);
  return { off, win };
}
function homeLook(room, t, k = 0.8) { room.update(t); room.light(k); key.intensity = 1.35; key.color.set("#ffd9b0"); hemi.intensity = 0.3; }
function vaultLook(room, t, beacon) { room.update(t); room.beacon(beacon); room.lights(0.9); key.intensity = 1.9; key.color.set("#eaf0ff"); hemi.intensity = 0.4; hemi.color.set("#cfdcff"); scene.fog.color.set("#0b0d10"); }

// ---------------------------------------------------------------- local pieces
// Wooden desk with a leather top. Origin: floor centre; top at h. API { group, top }
function makeWorkDesk({ w = 2.6, d = 1.4, h = 0.78, leather = "#22302a" } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat(leather, { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}

// LED clock board on a stand. Origin: floor centre; faces +z. API { group, paint(fn) }
function makeTimerStand({ w = 1.1, h = 0.5, standH = 1.0 } = {}) {
  const g = new THREE.Group(), black = pmat("#141518", { roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  const base = new THREE.Mesh(rbox(0.6, 0.05, 0.45, 0.02), black); base.position.y = 0.025; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, standH, 16), pmat("#2b2d31", { metalness: 0.8, roughness: 0.3 })); pole.position.y = standH / 2; g.add(pole);
  const cy = standH + h / 2 + 0.04;
  const body = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.1, 0.025), black); body.position.y = cy; g.add(body);
  const c = makeCanvas(640, Math.round(640 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, cy, 0.052); g.add(scr);
  g.add(contactShadow(1.0, 0.9));
  return { group: g, paint: (fn) => { fn(x, c.width, c.height); tex.needsUpdate = true; } };
}
function paintClock(x, W, H, text, col = "#ff3b2a") {
  x.fillStyle = "#07080a"; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.035)"; for (let i = 6; i < W; i += 12) for (let j = 6; j < H; j += 12) x.fillRect(i, j, 4, 4);
  let px = Math.round(H * 0.72); x.font = `900 ${px}px Inter`; while (x.measureText(text).width > W * 0.9 && px > 10) { px -= 4; x.font = `900 ${px}px Inter`; }
  x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = col; x.shadowBlur = 24; x.fillStyle = col; x.fillText(text, W / 2, H * 0.54); x.shadowBlur = 0;
}

// Stream of gold coins flying out of a point towards the camera's left, falling to the floor (y = floorY)
// and vanishing; starts at t0, stops spawning at t1. Instanced, decor. API { mesh, update(t, t0, t1, origin) }
function makeCoinStream(N = 150, seed = 3, { floorY = 0.02, r = 0.07, spread = 1 } = {}) {
  const m = pmat(GOLD_METAL, { metalness: 1, roughness: 0.26, emissive: "#3a2400", emissiveIntensity: 0.5 });
  const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, r * 0.2, 24), m, N); im.frustumCulled = false; im.userData.decor = true;
  const rnd = mulberry32(seed), items = [], o = new THREE.Object3D(), P = 1.3;
  for (let i = 0; i < N; i++) items.push({ ph: rnd(), sx: (rnd() - 0.5) * 0.5 * spread, sy: (rnd() - 0.5) * 0.3, vx: -(0.4 + rnd() * 0.9) * spread, vz: (0.9 + rnd() * 0.9) * spread, vy: 0.6 + rnd() * 1.0, spin: [rnd() * 9, rnd() * 9] });
  return {
    mesh: im,
    update(t, t0, t1, origin) {
      items.forEach((it, i) => {
        const age = t - t0 - it.ph * P, cyc = Math.floor(age / P), a = age - cyc * P, born = t0 + it.ph * P + cyc * P;
        let y = origin.y + it.sy + it.vy * a - 3.2 * a * a;
        if (age < 0 || born > t1 || y < floorY) { o.scale.setScalar(0.0001); y = -5; } else o.scale.setScalar(1);
        o.position.set(origin.x + it.sx + it.vx * a, y, origin.z + it.vz * a); o.rotation.set(it.spin[0] * a + 1.2, it.spin[1] * a, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// The exchange's coins: seven columns of gold coins on a round steel dais ringed with a cyan light.
// set(k): 0..1 of every column (they drain from the top). Origin: floor centre. API { group, set(k), top(k), ring }
function makeCoinTower({ seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.14, 64), pmat("#1b1f25", { metalness: 0.8, roughness: 0.3, clearcoat: 0.5 })); dais.position.y = 0.07; g.add(dais);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.652, 0.01, 8, 96), new THREE.MeshBasicMaterial({ color: "#4fd8ff", toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.1; g.add(ring);
  const spots = [[0, 0], [0.26, 0], [-0.26, 0], [0.13, 0.225], [-0.13, 0.225], [0.13, -0.225], [-0.13, -0.225]], cols = [];
  spots.forEach(([x, z], i) => { const n = i === 0 ? 46 : 30 + Math.floor(r() * 12); const c = makeCoinColumn(n, { r: 0.12, t: 0.04, seed: seed + i }); c.group.position.set(x, 0.14, z); g.add(c.group); cols.push(c); });
  g.add(contactShadow(1.8, 1.8));
  return { group: g, ring: ring.material, set(k) { cols.forEach((c, i) => c.set(clamp(k * (1.04 - i * 0.015)))); }, top: (k) => 0.14 + cols[0].height(k) };
}

// Steel key cabinet on the wall, door swung open: three brass keys hanging on their hooks, all in place,
// a "CHAVES" plate and a green status light on top. Origin: bottom centre of the back; faces +z.
// API { group, led(k) }
function makeKeyCabinet() {
  const g = new THREE.Group(), steel = pmat("#7c848d", { metalness: 0.85, roughness: 0.35 }), dark = pmat("#2b3036", { metalness: 0.7, roughness: 0.4 });
  const W = 0.9, H = 0.8, Dp = 0.14;
  const back = new THREE.Mesh(rbox(W, H, 0.02, 0.01), dark); back.position.set(0, H / 2, 0.01); g.add(back);
  for (const [bw, bh, x, y] of [[W, 0.03, 0, H - 0.015], [W, 0.03, 0, 0.015], [0.03, H, -W / 2 + 0.015, H / 2], [0.03, H, W / 2 - 0.015, H / 2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, Dp), steel); b.position.set(x, y, Dp / 2); g.add(b); }
  const plate = makePlate("CHAVES", 0.5, 0.1, { bg: "#141414", fg: "#e9dcc7" }); plate.position.set(0, H - 0.08, 0.035); g.add(plate);
  const rail = new THREE.Mesh(rbox(W - 0.12, 0.04, 0.03, 0.008), steel); rail.position.set(0, H - 0.16, 0.035); g.add(rail);
  const keys = [];
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.24, hy = H - 0.19;
    const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 10), steel); hook.rotation.x = Math.PI / 2; hook.position.set(x, hy, 0.07); g.add(hook);
    const k = makeBigKey({ s: 0.7 }); k.group.position.set(x, hy + 0.026, 0.09); g.add(k.group); keys.push(k);
  }
  // open door: hinged on the left edge, swung out towards the camera
  const piv = new THREE.Group(); piv.position.set(-W / 2, 0, Dp); piv.rotation.y = -1.7; g.add(piv);
  const leaf = new THREE.Mesh(rbox(W, H, 0.02, 0.01), steel); leaf.position.set(W / 2, H / 2, -0.01); piv.add(leaf);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 14), dark); knob.rotation.x = Math.PI / 2; knob.position.set(W - 0.07, H / 2, -0.04); piv.add(knob);
  const ledM = new THREE.MeshBasicMaterial({ color: "#2fe37a", toneMapped: false }); const led = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.01), ledM); led.position.set(0, H + 0.03, 0.06); g.add(led);
  const halo = sprite(BOKEH, 0.5); halo.userData.decor = true; halo.material.color.set("#2fe37a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0, H + 0.04, 0.09); g.add(halo);
  const lp = new THREE.Mesh(rbox(0.34, 0.04, 0.05, 0.01), dark); lp.position.set(0, H + 0.02, 0.04); g.add(lp);
  return { group: g, sway: (t) => keys.forEach((k, i) => { k.group.rotation.z = 0.06 * Math.sin(t * 2.2 + i * 1.7); }), led: (k) => { ledM.color.set("#2fe37a").multiplyScalar(0.3 + 0.7 * k); halo.material.opacity = 0.8 * k; } };
}

// Laptop: aluminium base with a dark keyboard and the lid open, its screen a live canvas (1024x640).
// Origin: floor centre of the base; the screen faces +z. API { group, paint(fn), top }
function makeLaptop({ w = 1.0 } = {}) {
  const g = new THREE.Group(), d = w * 0.68, h = w * 0.62, alu = pmat("#b9bcc2", { metalness: 0.9, roughness: 0.32 });
  const base = new THREE.Mesh(rbox(w, 0.028 * w, d, 0.012 * w), alu); base.position.y = 0.014 * w; g.add(base);
  const kc = makeCanvas(512, 340), kx = kc.getContext("2d"); kx.fillStyle = "#26282c"; kx.fillRect(0, 0, 512, 340);
  kx.fillStyle = "#121315"; for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) kx.fillRect(14 + c * 37.5, 14 + r * 40, 32, 34);
  kx.fillRect(140, 222, 232, 34); kx.fillStyle = "#3a3c40"; kx.fillRect(176, 268, 160, 66);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, d * 0.82), mat("#ffffff", { map: texFrom(kc), roughness: 0.6 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.0285 * w + 0.0005, 0.01 * w); g.add(kb);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.028 * w, -d / 2 + 0.01 * w); hinge.rotation.x = -0.26; g.add(hinge);
  const lid = new THREE.Mesh(rbox(w, h, 0.016 * w, 0.012 * w), alu); lid.position.set(0, h / 2, -0.008 * w); hinge.add(lid);
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02 * w, h - 0.02 * w), mat("#0c0c0e", { roughness: 0.3 })); bez.position.set(0, h / 2, 0.0005); hinge.add(bez);
  const c = makeCanvas(1024, 640), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, w * 0.94 * 0.625), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, h / 2 + 0.01 * w, 0.001); hinge.add(scr);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, paint: (fn) => { fn(x, 1024, 640); tex.needsUpdate = true; }, top: 0.028 * w };
}

// Phone on a small stand at real scale (the kit's phone is 1.64 tall: scaled 0.22). API { group, body, paint(fn) }
function makeStandPhone() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const m = pmat("#2a2522", { roughness: 0.35, clearcoat: 0.6, metalness: 0.2 });
  const base = new THREE.Mesh(rbox(0.26, 0.025, 0.2, 0.008), m); base.position.y = 0.0125; body.add(base);
  const back = new THREE.Mesh(rbox(0.13, 0.16, 0.02, 0.006), m); back.position.set(0, 0.09, 0); back.rotation.x = -0.32; body.add(back);
  const lip = new THREE.Mesh(rbox(0.26, 0.025, 0.02, 0.006), m); lip.position.set(0, 0.035, 0.07); body.add(lip);
  body.add(contactShadow(0.46, 0.4));
  const ph = makePhone(), s = 0.22; ph.group.scale.setScalar(s); ph.group.position.set(0, 0.03 + 0.82 * s * Math.cos(0.32), -0.005); ph.group.rotation.x = -0.32; body.add(ph.group);
  let last = "";
  return { group: g, body, paint: (key, fn) => { if (key === last) return; last = key; fn(ph.ctx); ph.tex.needsUpdate = true; } };
}

// The bank as a cut-away model (the analogy): a stone base, the basement (subsolo) with the round vault
// door and piles of coins beside it, a slab with a fascia, the ground floor with the teller's counter
// (glass partition, a drawer that slides out), a little glass lift on the right that carries a bundle of
// cash up, a roof with a BANCO sign; plates CARTEIRA FRIA (on the base) and CARTEIRA QUENTE (on the
// fascia) that pop in; a loose unplugged cable with a blue light below, a plugged cable with an amber
// light at the counter. Origin: floor (table top) centre; the open side faces +z.
// API { group, lower, upper, vault, cold, hot, drawer(k), fill(k), lift(k), coldLed(k), hotLed(k), glow(k) }
function makeBankModel() {
  const g = new THREE.Group(), W = 1.7, D = 0.95, baseH = 0.16, y1 = baseH, slabY = 0.72, slabT = 0.07, y2 = slabY + slabT, roofY = 1.42;
  const stone = pmat("#ffffff", { map: tileTex(cachedTex("bank-stone", () => noiseTex({ base: "#3a3632", amount: 0.12, size: 2, seed: 71 })), 2, 1), roughness: 0.5, clearcoat: 0.3 });
  const concrete = mat("#ffffff", { map: tileTex(plasterTex("#6f6c66"), 1, 1), roughness: 0.9 });
  const cream = mat("#ffffff", { map: tileTex(plasterTex("#c9b59a"), 1, 1), roughness: 0.85 });
  const base = new THREE.Mesh(rbox(W + 0.08, baseH, D + 0.08, 0.015), stone); base.position.y = baseH / 2; g.add(base);
  const fl1 = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.08, D - 0.04), pmat("#ffffff", { map: tileTex(accessMarbleTex(), 2, 1), roughness: 0.35 })); fl1.rotation.x = -Math.PI / 2; fl1.position.set(0, y1 + 0.002, 0.0); g.add(fl1);
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(W, slabY - y1, 0.04), concrete); b1.position.set(0, y1 + (slabY - y1) / 2, -D / 2 + 0.02); g.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(W, roofY - y2, 0.04), cream); b2.position.set(0, y2 + (roofY - y2) / 2, -D / 2 + 0.02); g.add(b2);
  for (const s of [-1, 1]) {
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, slabY - y1, D), concrete); s1.position.set(s * (W / 2 - 0.02), y1 + (slabY - y1) / 2, 0); g.add(s1);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, roofY - slabY, D), cream); s2.position.set(s * (W / 2 - 0.02), slabY + (roofY - slabY) / 2, 0); g.add(s2);
  }
  const slab = new THREE.Mesh(new THREE.BoxGeometry(W - 0.28, slabT, D), stone); slab.position.set(-0.12, slabY + slabT / 2, 0); g.add(slab);   // leaves the lift's shaft open on the right
  const fascia = new THREE.Mesh(rbox(W + 0.02, 0.15, 0.03, 0.008), stone); fascia.position.set(0, slabY + slabT / 2, D / 2 + 0.015); g.add(fascia);
  const fl2 = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.36, D - 0.04), mat("#ffffff", { map: tileTex(woodTex({ base: "#5a3b26", planks: 6, seed: 4 }), 1, 1), roughness: 0.45 })); fl2.rotation.x = -Math.PI / 2; fl2.position.set(-0.12, y2 + 0.002, 0); g.add(fl2);
  const roof = new THREE.Mesh(rbox(W + 0.1, 0.07, D + 0.1, 0.015), stone); roof.position.set(0, roofY + 0.035, 0); g.add(roof);
  const sign = makePlate("BANCO", 0.72, 0.15, { bg: "#141414", fg: "#d8b25a" }); sign.position.set(0, roofY + 0.035, D / 2 + 0.05 + 0.016); g.add(sign);
  // basement: the vault door against the back wall, coins piled beside it
  const lower = new THREE.Group(); g.add(lower);
  const vs = 0.19, vault = makeVaultDoor(); vault.group.scale.setScalar(vs); vault.group.position.set(-0.36, y1, -D / 2 + 0.04 + 0.055); lower.add(vault.group);
  const stacks = [];
  [[0.12, -0.24, 16], [0.3, -0.27, 20], [0.48, -0.22, 14], [0.2, -0.05, 12], [0.38, -0.03, 18], [0.56, -0.07, 10], [0.28, 0.14, 9]].forEach(([x, z, n], i) => {
    const c = makeCoinColumn(n, { r: 0.055, t: 0.018, seed: 20 + i }); c.group.position.set(x, y1 + 0.003, z); lower.add(c.group); stacks.push(c);
  });
  const lowLight = new THREE.PointLight("#8fc4ff", 1.2, 2.2, 1.4); lowLight.position.set(0, slabY - 0.12, 0.25); g.add(lowLight);
  // ground floor: the teller's counter with its drawer
  const upper = new THREE.Group(); upper.position.set(-0.14, y2, -0.1); g.add(upper);
  const wood = pmat("#ffffff", { map: woodTex("#5a3622"), roughness: 0.45, clearcoat: 0.5 });
  const body = new THREE.Mesh(rbox(0.8, 0.24, 0.2, 0.01), wood); body.position.y = 0.12; upper.add(body);
  const ctop = new THREE.Mesh(rbox(0.84, 0.02, 0.24, 0.006), stone); ctop.position.y = 0.25; upper.add(ctop);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.008), glassMat({ opacity: 0.16 })); glass.position.set(0, 0.36, -0.07); glass.userData.decor = true; upper.add(glass);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.2, 0.015), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); post.position.set(s * 0.4, 0.36, -0.07); upper.add(post); }
  const steel = pmat("#9aa1a8", { metalness: 0.9, roughness: 0.3 });
  const drawerG = new THREE.Group(); drawerG.position.set(0.16, 0.16, 0.02); upper.add(drawerG);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.006, 0.16), steel); tray.position.y = -0.025; drawerG.add(tray);
  const dfront = new THREE.Mesh(rbox(0.28, 0.06, 0.012, 0.004), wood); dfront.position.set(0, 0, 0.086); drawerG.add(dfront);
  const dh = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.09, 10), steel); dh.rotation.z = Math.PI / 2; dh.position.set(0, 0, 0.1); drawerG.add(dh);
  const dcoins = [];
  for (let i = 0; i < 3; i++) { const c = makeCoinColumn(4, { r: 0.03, t: 0.011, seed: 40 + i }); c.group.position.set(-0.08 + i * 0.08, -0.022, 0); drawerG.add(c.group); dcoins.push(c); }
  const win = makeGlowWindow(0.5, 0.32, { cols: 3, rows: 2, color: "#ffcf94" }); win.group.position.set(0.12, y2 + 0.36, -D / 2 + 0.045); g.add(win.group);
  const upLight = new THREE.PointLight("#ffcf8a", 1.4, 2.4, 1.4); upLight.position.set(-0.1, roofY - 0.12, 0.25); g.add(upLight);
  // the lift: a glass tube on the right, its car carrying a bundle of cash from the basement up
  const lx = 0.71, lz = 0.12;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, roofY - y1 - 0.02, 28, 1, true), glassMat({ opacity: 0.16 })); tube.position.set(lx, (y1 + roofY) / 2, lz); tube.userData.decor = true; g.add(tube);
  for (const yy of [y1 + 0.01, roofY - 0.02]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.008, 8, 32), steel); ring.rotation.x = Math.PI / 2; ring.position.set(lx, yy, lz); g.add(ring); }
  const car = new THREE.Group(); car.position.set(lx, y1 + 0.01, lz); g.add(car);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.012, 24), steel); plat.position.y = 0.006; car.add(plat);
  const bundle = makeCashBundle({ w: 0.09, d: 0.045, h: 0.03 }); bundle.position.y = 0.012; car.add(bundle);
  // plates and cables of the two wallets
  const cold = makePlate("CARTEIRA FRIA", 1.0, 0.12, { bg: "#16324a", fg: "#d6ecff" }); cold.position.set(-0.36, baseH / 2, D / 2 + 0.04 + 0.016); g.add(cold);
  const hot = makePlate("CARTEIRA QUENTE", 1.15, 0.12, { bg: "#5a2410", fg: "#ffd9b8" }); hot.position.set(-0.14, slabY + slabT / 2, D / 2 + 0.03 + 0.016); g.add(hot);
  const cableM = mat("#2a2a2a", { roughness: 0.6 });
  const loose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-W / 2 + 0.04, y1 + 0.4, -0.25), new V3(-0.72, y1 + 0.2, -0.15), new V3(-0.66, y1 + 0.012, 0.02), new V3(-0.6, y1 + 0.012, 0.2)]), 32, 0.008, 8, false), cableM); g.add(loose);
  const plug = new THREE.Mesh(rbox(0.035, 0.02, 0.05, 0.005), pmat("#d9dde2", { roughness: 0.4 })); plug.position.set(-0.6, y1 + 0.012, 0.225); g.add(plug);
  const net = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0.26, y2 + 0.26, -0.18), new V3(0.3, y2 + 0.45, -0.3), new V3(0.34, roofY - 0.01, -0.36)]), 24, 0.008, 8, false), mat("#e07a1f", { roughness: 0.5 })); g.add(net);
  const ledC = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), new THREE.MeshBasicMaterial({ color: "#4fb3ff", toneMapped: false })); ledC.position.set(-0.08, y1 + 0.42, -D / 2 + 0.1); g.add(ledC);
  const ledH = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffb347", toneMapped: false })); ledH.position.set(0.12, y2 + 0.265, -0.04); g.add(ledH);
  const haloC = sprite(BOKEH, 0.16), haloH = sprite(BOKEH, 0.16);
  for (const [h, l, c] of [[haloC, ledC, "#4fb3ff"], [haloH, ledH, "#ffb347"]]) { h.userData.decor = true; h.material.color.set(c); h.material.blending = THREE.AdditiveBlending; h.position.copy(l.position).add(new V3(0, 0, 0.02)); g.add(h); }
  g.add(contactShadow(W + 0.6, D + 0.6));
  return {
    group: g, lower, upper, vault, cold, hot, w: W,
    drawer: (k) => { drawerG.position.z = 0.02 + 0.2 * clamp(k); },
    fill: (k) => { dcoins.forEach((c) => c.set(k)); },
    lift: (k) => { car.position.y = y1 + 0.01 + (y2 + 0.24 - y1) * clamp(k); },
    coldLed: (k) => { ledC.material.color.set("#4fb3ff").multiplyScalar(0.2 + 0.8 * k); haloC.material.opacity = 0.9 * k; },
    hotLed: (k) => { ledH.material.color.set("#ffb347").multiplyScalar(0.2 + 0.8 * k); haloH.material.opacity = 0.9 * k; },
    glow: (k) => { vault.glow(k); lowLight.intensity = 1.2 + 1.5 * k; },
  };
}

// Rubber stamp of the bank: red rubber, wooden block with AUTORIZADO printed on its front, a black neck
// and knob. Origin: the centre of the rubber face (it touches what it stamps at y = 0). API { group, plate }
function makeAuthStamp({ s = 1 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#6a4330"), roughness: 0.5, clearcoat: 0.4 }), blk = pmat("#1e1e1e", { roughness: 0.3, clearcoat: 0.8 });
  const rubber = new THREE.Mesh(rbox(0.26 * s, 0.02 * s, 0.12 * s, 0.005 * s), pmat("#a3221a", { roughness: 0.7 })); rubber.position.y = 0.01 * s; g.add(rubber);
  const block = new THREE.Mesh(rbox(0.28 * s, 0.07 * s, 0.14 * s, 0.012 * s), wood); block.position.y = 0.055 * s; g.add(block);
  const plate = makePlate("AUTORIZADO", 0.25 * s, 0.05 * s, { bg: "#16120e", fg: "#ffd36b", depth: 0.006 * s }); plate.position.set(0, 0.055 * s, 0.07 * s + 0.003 * s); g.add(plate);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.022 * s, 0.03 * s, 0.11 * s, 18), blk); neck.position.y = 0.145 * s; g.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055 * s, 28, 18), blk); knob.position.y = 0.235 * s; knob.scale.y = 0.85; g.add(knob);
  return { group: g, plate };
}

// Teller's counter (life size): panelled dark wood, a marble top, CAIXA printed on the front, a steel
// drawer (coins inside) that slides out towards the camera, a stack of SAQUE slips. Origin: floor centre;
// the teller's side (drawer) faces +z. API { group, topY, drawer(k), fill(k), drawerPoint() → world V3 }
function makeTellerCounter({ w = 2.0, h = 1.05, d = 0.7 } = {}) {
  const g = new THREE.Group();
  const wood = pmat("#ffffff", { map: woodTex({ base: "#4a2c1a", light: "#6b4128", planks: 1, seed: 12 }), roughness: 0.42, clearcoat: 0.6 });
  const marble = pmat("#ffffff", { map: tileTex(cachedTex("teller-marble", () => noiseTex({ base: "#d9d2c6", amount: 0.1, size: 2, seed: 81 })), 2, 1), roughness: 0.18, clearcoat: 0.8 });
  const body = new THREE.Mesh(rbox(w, h - 0.12, d, 0.02), wood); body.position.y = 0.08 + (h - 0.12) / 2; g.add(body);
  const kick = new THREE.Mesh(rbox(w - 0.04, 0.08, d - 0.06, 0.01), pmat("#1b1410", { roughness: 0.6 })); kick.position.y = 0.04; g.add(kick);
  const top = new THREE.Mesh(rbox(w + 0.08, 0.05, d + 0.1, 0.012), marble); top.position.y = h - 0.04 + 0.025; g.add(top);
  const pw = (w - 0.24) / 3;
  for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(rbox(pw - 0.06, 0.48, 0.02, 0.01), wood); p.position.set(-w / 2 + 0.12 + pw / 2 + i * pw, 0.44, d / 2 + 0.01); g.add(p); }
  const plate = makePlate("CAIXA", 0.7, 0.18, { bg: "#16120e", fg: "#d8b25a" }); plate.position.set(-0.5, h - 0.2, d / 2 + 0.016); g.add(plate);
  const steel = pmat("#9aa1a8", { metalness: 0.9, roughness: 0.3 }), dw = 0.62, dh = 0.13, dd = 0.5;
  const drawer = new THREE.Group(), z0 = d / 2 - dd / 2; drawer.position.set(0.45, h - 0.2, z0); g.add(drawer);
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.02, 0.008, dd), steel); bottom.position.y = -dh / 2 + 0.004; drawer.add(bottom);
  for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.008, dh - 0.02, dd), steel); sd.position.set(s * (dw / 2 - 0.014), -0.01, 0); drawer.add(sd); }
  const bk = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.02, dh - 0.02, 0.008), steel); bk.position.set(0, -0.01, -dd / 2); drawer.add(bk);
  const front = new THREE.Mesh(rbox(dw, dh, 0.025, 0.006), wood); front.position.set(0, 0, dd / 2 + 0.0125); drawer.add(front);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 12), steel); handle.rotation.z = Math.PI / 2; handle.position.set(0, 0, dd / 2 + 0.05); drawer.add(handle);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.03), steel); post.position.set(s * 0.09, 0, dd / 2 + 0.035); drawer.add(post); }
  const coins = [];
  for (let i = 0; i < 6; i++) { const c = makeCoinColumn(6, { r: 0.055, t: 0.016, seed: 60 + i }); c.group.position.set(-0.2 + (i % 3) * 0.2, -dh / 2 + 0.008, i < 3 ? -0.1 : 0.1); drawer.add(c.group); coins.push(c); }
  const topY = h + 0.01;
  for (let i = 0; i < 6; i++) { const sl = makePlate("SAQUE", 0.3, 0.2, { bg: "#f4efe4", fg: "#1c1410", depth: 0.004, detail: true }); sl.rotation.x = -Math.PI / 2; sl.rotation.z = (i % 2 ? 0.05 : -0.04); sl.position.set(-0.62, topY + 0.002 + i * 0.004, 0.2); g.add(sl); }
  g.add(contactShadow(w + 0.6, d + 0.8));
  return {
    group: g, topY, w, d, drawerGroup: drawer,
    drawer: (k) => { drawer.position.z = z0 + 0.4 * clamp(k); },
    fill: (k) => coins.forEach((c) => c.set(k)),
    drawerPoint: () => drawer.localToWorld(new V3(0, 0.05, 0.1)),
  };
}

// Withdrawal slip: thin paper with SAQUE printed, and an AUTORIZADO ink mark that shows when stamped.
// Lies flat. Origin: centre of the underside. API { group, mark }
function makeSlip() {
  const g = new THREE.Group();
  const p = makePlate("SAQUE", 0.3, 0.2, { bg: "#f4efe4", fg: "#1c1410", depth: 0.004, detail: true }); p.rotation.x = -Math.PI / 2; p.position.y = 0.002; g.add(p);
  const mark = makeInkMark("AUTORIZADO", 0.26, 0.08, { seed: 9 }); mark.userData.plate.detail = true; mark.rotation.x = -Math.PI / 2; mark.position.set(0, 0.0045, 0.035); mark.material.opacity = 0; g.add(mark);
  return { group: g, mark };
}

// Internal AI server box: a black 1U-style unit with vents, a cyan status bar and IA INTERNA printed on
// the front. Origin: bottom centre; faces +z. API { group, led(color, k) }
function makeAiBox() {
  const g = new THREE.Group(), blk = pmat("#17191d", { metalness: 0.6, roughness: 0.35, clearcoat: 0.4 });
  const body = new THREE.Mesh(rbox(0.5, 0.14, 0.34, 0.012), blk); body.position.y = 0.07; g.add(body);
  const vc = makeCanvas(256, 64), vx = vc.getContext("2d"); vx.fillStyle = "#17191d"; vx.fillRect(0, 0, 256, 64); vx.fillStyle = "#050607"; for (let i = 0; i < 22; i++) vx.fillRect(140 + (i % 11) * 10, 14 + Math.floor(i / 11) * 22, 6, 14);
  const vent = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), mat("#ffffff", { map: texFrom(vc), roughness: 0.5 })); vent.position.set(0, 0.07, 0.171); g.add(vent);
  const plate = makePlate("IA INTERNA", 0.34, 0.1, { bg: "#0d2a33", fg: "#9ff0ff", depth: 0.004 }); plate.position.set(-0.07, 0.07, 0.174); g.add(plate);
  const ledM = new THREE.MeshBasicMaterial({ color: "#4fd8ff", toneMapped: false }); const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.004), ledM); led.position.set(0.18, 0.03, 0.173); g.add(led);
  const halo = sprite(BOKEH, 0.3); halo.userData.decor = true; halo.material.color.set("#4fd8ff"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0.15, 0.03, 0.2); g.add(halo);
  g.add(contactShadow(0.7, 0.5));
  return { group: g, led: (c, k) => { ledM.color.set(c).multiplyScalar(0.3 + 0.7 * k); halo.material.color.set(c); halo.material.opacity = 0.8 * k; } };
}

// A glowing cable that draws itself along `pts` (world points): grow(k) 0..1 of its length; glow(k) its
// red light. Decor (never framed). API { mesh, grow(k), glow(k) }
function makeHackWire(pts, { radius = 0.012, color = "#ff2a1a" } = {}) {
  const m = mat("#2a0c0a", { emissive: color, emissiveIntensity: 0 });
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new V3(...p))), 96, radius, 8, false), n = geo.index.count;
  const mesh = new THREE.Mesh(geo, m); mesh.userData.decor = true; mesh.userData.noShadow = true;
  return { mesh, grow: (k) => { const c = Math.floor(n * clamp(k) / 6) * 6; mesh.visible = c > 0; geo.setDrawRange(0, c); }, glow: (k) => { m.emissiveIntensity = 2.4 * k; } };
}

// Block of ice frozen around half of the flying coins: a frosted glass block with the coins held inside
// mid-air. form(k): the coins appear, then the ice clouds over them. Origin: floor centre. API { group, form(k) }
function makeIceBlock({ w = 1.1, h = 0.85, d = 0.75, n = 60, seed = 8 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const iceM = glassMat({ color: "#cfefff", opacity: 0.0, roughness: 0.25, envMapIntensity: 1.6 });
  const block = new THREE.Mesh(rbox(w, h, d, 0.06), iceM); block.position.y = h / 2; g.add(block);
  const frost = cachedTex("ice-frost", () => noiseTex({ base: "#e8f6ff", amount: 0.35, size: 2, seed: 91 }));
  const skin = new THREE.Mesh(rbox(w + 0.01, h + 0.01, d + 0.01, 0.06), new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: frost, transparent: true, opacity: 0, roughness: 0.6, depthWrite: false, side: THREE.DoubleSide })); skin.position.y = h / 2; skin.userData.decor = true; g.add(skin);
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.014, 24), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3, emissive: "#3a2400", emissiveIntensity: 0.4 }), n), o = new THREE.Object3D();
  for (let i = 0; i < n; i++) { o.position.set((r() - 0.5) * (w - 0.18), 0.1 + r() * (h - 0.2), (r() - 0.5) * (d - 0.16)); o.rotation.set(r() * 6, r() * 6, r() * 6); o.updateMatrix(); coins.setMatrixAt(i, o.matrix); }
  g.add(coins);
  const glow = makeFloorGlow(w * 1.8, d * 2.2, { color: "#9fdcff", opacity: 0 }); glow.position.y = 0.01; g.add(glow);
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(w * 0.85, 48), pmat("#bfe6ff", { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0, clearcoat: 1 })); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1, 0.75, 1); puddle.position.y = 0.012; puddle.userData.decor = true; g.add(puddle);
  g.add(contactShadow(w + 0.5, d + 0.5));
  return { group: g, form: (k) => { const kc = clamp(k * 2), ki = clamp(k * 1.6 - 0.4); coins.visible = kc > 0.02; puddle.material.opacity = 0.5 * ki; iceM.opacity = 0.55 * ki; skin.material.opacity = 0.35 * ki; block.visible = ki > 0.01; glow.material.opacity = 0.25 * ki; } };
}

// Hardware wallet (a generic one: no brand): a small black device with a screen and two buttons, on a
// tilted stand. Origin: table top, centre; faces +z. API { group }
function makeColdWallet({ s = 1.6 } = {}) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(0.2 * s, 0.02 * s, 0.12 * s, 0.006 * s), pmat("#2a2522", { roughness: 0.4, clearcoat: 0.6 })); stand.position.y = 0.01 * s; g.add(stand);
  const body = new THREE.Group(); body.position.set(0, 0.02 * s + 0.045 * s, -0.01 * s); body.rotation.x = -0.35; g.add(body);
  const shell = new THREE.Mesh(rbox(0.18 * s, 0.09 * s, 0.022 * s, 0.012 * s), pmat("#141518", { metalness: 0.4, roughness: 0.3, clearcoat: 0.8 })); body.add(shell);
  const c = makeCanvas(256, 112), x = c.getContext("2d"); x.fillStyle = "#050607"; x.fillRect(0, 0, 256, 112);
  x.strokeStyle = "#e9f1ff"; x.lineWidth = 6; x.strokeRect(24, 40, 30, 26); x.beginPath(); x.arc(39, 40, 11, Math.PI, 0); x.stroke();
  x.fillStyle = "#e9f1ff"; x.font = "800 34px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("OFFLINE", 74, 56);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.12 * s, 0.0525 * s), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false })); scr.position.set(-0.012 * s, 0, 0.0115 * s); body.add(scr);
  for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.006 * s, 16), pmat("#3a3f46", { metalness: 0.8, roughness: 0.3 })); b.rotation.x = Math.PI / 2; b.position.set(0.07 * s, sx * 0.022 * s, 0.012 * s); body.add(b); }
  g.add(contactShadow(0.36 * s, 0.26 * s));
  return { group: g };
}

// ---------------------------------------------------------------- screens
function drawCode(x, W, y0, y1, seed, hl = -1, hk = 0) {
  const r = mulberry32(seed), cols = ["#7fd0ff", "#ffb86b", "#c3e88d", "#c792ea", "#8a93a8"];
  let i = 0;
  for (let y = y0; y < y1; y += 34, i++) {
    if (i === hl && hk > 0) { x.fillStyle = `rgba(255,42,26,${0.35 * hk})`; x.fillRect(0, y - 6, W, 34); }
    let xx = 60 + Math.floor(r() * 3) * 34;
    x.fillStyle = "#4b5263"; x.font = "600 20px Inter"; x.textAlign = "right"; x.fillText(String(i + 1), 40, y + 14);
    const segs = 1 + Math.floor(r() * 4);
    for (let s = 0; s < segs; s++) { const w = 40 + r() * 170; x.fillStyle = i === hl && hk > 0.3 ? "#ff6a5a" : cols[Math.floor(r() * cols.length)]; roundRect(x, xx, y, w, 16, 6); x.fill(); xx += w + 14; if (xx > W - 80) break; }
  }
}
// Video call: n tiles (a fraction fades the next one in), generic avatars, name tags, the call bar.
function paintCall(x, W, H, { n = 1 } = {}) {
  x.fillStyle = "#0f131b"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#1b2230"; x.fillRect(0, 0, W, 64); x.fillStyle = "#e6ecf5"; x.font = "800 32px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("ENTREVISTA · VAGA: ENGENHEIRO", 24, 33);
  x.fillStyle = "#ff3b3b"; x.beginPath(); x.arc(W - 40, 32, 9, 0, 6.3); x.fill();
  const names = ["RECRUTADOR", "GERENTE", "DIRETOR"], cnt = Math.min(3, Math.ceil(n - 1e-6)), gap = 18, tw = (W - gap * (cnt + 1)) / cnt, th = H - 64 - 110;
  for (let i = 0; i < cnt; i++) {
    const a = i < Math.floor(n) ? 1 : n - Math.floor(n); x.globalAlpha = a;
    const tx = gap + i * (tw + gap), ty = 80, gr = x.createLinearGradient(0, ty, 0, ty + th); gr.addColorStop(0, "#2a3c58"); gr.addColorStop(1, "#141c2a");
    x.fillStyle = gr; roundRect(x, tx, ty, tw, th, 16); x.fill();
    const cx = tx + tw / 2, hr = Math.min(tw, th) * 0.17;
    x.fillStyle = "#7d8aa0"; x.beginPath(); x.arc(cx, ty + th * 0.42, hr, 0, 6.3); x.fill();
    x.beginPath(); x.ellipse(cx, ty + th * 0.42 + hr * 2.6, hr * 1.9, hr * 1.3, 0, Math.PI, 0); x.fill();
    x.fillStyle = "rgba(0,0,0,0.55)"; roundRect(x, tx + 12, ty + th - 50, Math.min(tw - 24, 230), 38, 8); x.fill();
    x.fillStyle = "#ffffff"; x.font = "800 24px Inter"; x.textAlign = "left"; x.fillText(names[i], tx + 24, ty + th - 31);
  }
  x.globalAlpha = 1;
  x.fillStyle = "#3a4252"; for (const cx of [W / 2 - 110, W / 2 - 30]) { x.beginPath(); x.arc(cx, H - 50, 26, 0, 6.3); x.fill(); }
  x.fillStyle = "#e0261b"; roundRect(x, W / 2 + 20, H - 76, 110, 52, 26); x.fill();
}
// The test page: a file card (teste.zip) with an ABRIR button, the cursor moving to it, the click, and the
// code editor sliding up when it opens.
function paintTest(x, W, H, { cursor = 0, click = 0, open = 0 } = {}) {
  x.fillStyle = "#eef1f5"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#1c2230"; x.fillRect(0, 0, W, 90); x.fillStyle = "#ffffff"; x.font = "900 44px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("TESTE DE PROGRAMAÇÃO", 32, 46);
  x.fillStyle = "#5a6272"; x.font = "700 30px Inter"; x.fillText("Etapa final · baixe e abra o arquivo", 40, 140);
  x.fillStyle = "#ffffff"; roundRect(x, 70, 190, W - 140, 250, 24); x.fill(); x.strokeStyle = "#d3d8e0"; x.lineWidth = 3; roundRect(x, 70, 190, W - 140, 250, 24); x.stroke();
  x.fillStyle = "#e8b53a"; roundRect(x, 110, 235, 130, 160, 14); x.fill(); x.fillStyle = "#b9851a"; for (let i = 0; i < 6; i++) x.fillRect(166, 245 + i * 22, 18, 11);
  x.fillStyle = "#1c2230"; x.font = "900 64px Inter"; x.fillText("teste.zip", 280, 290);
  const bx = 600, by = 340, bw = 260, bh = 72;
  x.fillStyle = click > 0 && click < 1 ? "#d5531a" : ORANGE; roundRect(x, bx, by, bw, bh, 16); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 40px Inter"; x.textAlign = "center"; x.fillText("ABRIR", bx + bw / 2, by + bh / 2 + 2);
  if (click > 0 && click < 1) { x.strokeStyle = `rgba(255,106,43,${1 - click})`; x.lineWidth = 8; x.beginPath(); x.arc(bx + bw / 2, by + bh / 2, 30 + 120 * click, 0, 6.3); x.stroke(); }
  const k = eOut(clamp(cursor)), cx = lerp(W * 0.25, bx + bw / 2 + 10, k), cy = lerp(H * 0.92, by + bh / 2 + 8, k);
  x.fillStyle = "#111111"; x.strokeStyle = "#ffffff"; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx, cy + 46); x.lineTo(cx + 12, cy + 34); x.lineTo(cx + 22, cy + 56); x.lineTo(cx + 30, cy + 52); x.lineTo(cx + 20, cy + 31); x.lineTo(cx + 36, cy + 30); x.closePath(); x.fill(); x.stroke();
  if (open > 0) { const y = lerp(H, 60, eOut(clamp(open))); x.fillStyle = "#0d1117"; x.fillRect(0, y, W, H - y); x.fillStyle = "#1b2230"; x.fillRect(0, y, W, 44); x.fillStyle = "#c9d1d9"; x.font = "700 24px Inter"; x.textAlign = "left"; x.fillText("teste / main.js", 20, y + 23); drawCode(x, W, y + 64, H - 10, 12); }
}
// The code with one hidden line glowing red; then the whole screen goes red with a warning.
function paintVirus(x, W, H, { hl = 0, red = 0, t = 0 } = {}) {
  x.fillStyle = "#0d1117"; x.fillRect(0, 0, W, H); x.fillStyle = "#1b2230"; x.fillRect(0, 0, W, 44); x.fillStyle = "#c9d1d9"; x.font = "700 24px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("teste / main.js", 20, 23);
  drawCode(x, W, 64, H - 10, 12, 9, hl);
  if (red > 0) {
    x.globalAlpha = clamp(red); x.fillStyle = "rgba(150,10,6,0.9)"; x.fillRect(0, 0, W, H);
    const cy = H * 0.42, s = 130 + 10 * Math.sin(t * 9);
    x.fillStyle = "#ffd36b"; x.beginPath(); x.moveTo(W / 2, cy - s); x.lineTo(W / 2 + s * 1.1, cy + s * 0.75); x.lineTo(W / 2 - s * 1.1, cy + s * 0.75); x.closePath(); x.fill();
    x.fillStyle = "#7a0a06"; x.font = "900 170px Inter"; x.textAlign = "center"; x.fillText("!", W / 2, cy + s * 0.12);
    x.fillStyle = "#ffffff"; x.font = "900 60px Inter"; x.fillText("ARQUIVO MALICIOSO", W / 2, H * 0.86); x.globalAlpha = 1;
  }
}
// The fake developer tool installing: a window with a progress bar, then INSTALADO.
function paintInstaller(x, W, H, { k = 0, show = 1 } = {}) {
  x.fillStyle = "#1d2129"; x.fillRect(0, 0, W, H);
  x.globalAlpha = clamp(show);
  x.fillStyle = "#f2f4f7"; roundRect(x, 80, 80, W - 160, H - 160, 22); x.fill();
  x.fillStyle = "#d9dde4"; roundRect(x, 80, 80, W - 160, 64, 22); x.fill(); x.fillRect(80, 120, W - 160, 24);
  for (const [i, c] of [[0, "#ff5f56"], [1, "#ffbd2e"], [2, "#27c93f"]]) { x.fillStyle = c; x.beginPath(); x.arc(118 + i * 34, 112, 10, 0, 6.3); x.fill(); }
  x.fillStyle = "#1c2230"; x.font = "900 50px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("instalar.pkg", 140, 220);
  x.fillStyle = "#5a6272"; x.font = "700 30px Inter"; x.fillText("Ferramenta de programador", 140, 280);
  x.fillStyle = "#d3d8e0"; roundRect(x, 140, 360, W - 280, 40, 20); x.fill();
  x.fillStyle = k >= 1 ? "#e0261b" : "#2f7ff0"; roundRect(x, 140, 360, Math.max(40, (W - 280) * clamp(k)), 40, 20); x.fill();
  x.fillStyle = k >= 1 ? "#e0261b" : "#1c2230"; x.font = "900 40px Inter"; x.fillText(k >= 1 ? "INSTALADO" : `${Math.round(clamp(k) * 100)}%`, 140, 450);
  x.globalAlpha = 1;
}
// Generic exchange app (no real brand): balance, three coins, the SACAR button; tapping it greys it out
// with a padlock and slides up a red SAQUES SUSPENSOS; ok shows a green SAQUES LIBERADOS chip.
function paintExchange(x, { tap = 0, lock = 0, ok = 0 } = {}) {
  x.clearRect(0, 0, 720, 1500);
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#141a2c"); g.addColorStop(1, "#07090f"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillStyle = "#ffffff"; x.font = "900 88px Inter"; x.fillText("CORRETORA", 50, 170);
  x.fillStyle = "#1f2840"; roundRect(x, 40, 220, 640, 300, 40); x.fill();
  x.fillStyle = "#9aa6c8"; x.font = "800 60px Inter"; x.fillText("Saldo", 80, 310); x.fillStyle = "#ffffff"; x.font = "900 104px Inter"; x.fillText("US$ ••••", 80, 450);
  ["BTC", "ETH", "USDT"].forEach((c, i) => { const y = 570 + i * 130; x.fillStyle = "#171e33"; roundRect(x, 40, y, 640, 110, 28); x.fill(); x.fillStyle = "#e8b53a"; x.beginPath(); x.arc(110, y + 55, 34, 0, 6.3); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 60px Inter"; x.fillText(c, 170, y + 76); });
  const dead = lock > 0.3;
  x.fillStyle = dead ? "#3a3f4c" : ORANGE; roundRect(x, 40, 1010, 640, 200, 50); x.fill();
  x.fillStyle = dead ? "#7a808c" : "#ffffff"; x.textAlign = "center"; x.font = "900 120px Inter"; x.fillText("SACAR", 360, 1152);
  if (dead) { x.strokeStyle = "#c5cad4"; x.lineWidth = 12; x.strokeRect(570, 1080, 70, 60); x.beginPath(); x.arc(605, 1080, 24, Math.PI, 0); x.stroke(); }
  if (tap > 0 && tap < 1) { x.strokeStyle = `rgba(255,255,255,${0.9 * (1 - tap)})`; x.lineWidth = 14; x.beginPath(); x.arc(360, 1110, 50 + 260 * tap, 0, Math.PI * 2); x.stroke(); }
  if (lock > 0) { const y = lerp(1500, 1000, eOut(clamp(lock))); x.fillStyle = "#c8231a"; roundRect(x, 20, y, 680, 520, 44); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 120px Inter"; x.fillText("SAQUES", 360, y + 190); x.font = "900 96px Inter"; x.fillText("SUSPENSOS", 360, y + 320); }
  if (ok > 0) { x.globalAlpha = clamp(ok); x.fillStyle = "#1f8a4c"; roundRect(x, 40, 1250, 640, 150, 40); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 66px Inter"; x.fillText("SAQUES LIBERADOS", 360, 1350); x.globalAlpha = 1; }
}

// ---------------------------------------------------------------- shared sets
// The home office: the living room at night (window with the city right behind the desk), a desk, the
// laptop, the phone on its stand and a mug. API { room, desk, lap, phone, mug }
function buildHomeDesk(S, seed, { phone = true } = {}) {
  const room = makeNightLivingRoom({ wallZ: -1.5, seed }); room.group.position.x = 2.6; S.backdrop(room.group);
  const win = makeSetWindow(1.9, 1.5, { seed: seed + 3, open: 0.12 }); win.group.position.set(0, 1.5, -1.5 + 0.15); S.backdrop(win.group);
  const desk = makeWorkDesk({ w: 1.8, d: 0.9, leather: "#2a2622" }); S.add(desk.group);
  const lap = makeLaptop({ w: 0.42 }); lap.group.position.set(-0.05, desk.top, 0.0); S.add(lap.group);
  let ph = null; if (phone) { ph = makeStandPhone(); ph.group.position.set(0.42, desk.top, 0.12); ph.group.rotation.y = -0.35; S.add(ph.group); }
  const mug = makeCoffeeMug(); mug.group.position.set(-0.46, desk.top, 0.14); S.add(mug.group);
  return { room, desk, lap, phone: ph, mug };
}
function paintNotify(x, k) {
  x.clearRect(0, 0, 720, 1500);
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#2a2140"); g.addColorStop(1, "#0b0a14"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "alphabetic"; x.font = "700 180px Inter"; x.fillText("21:47", 360, 360);
  if (k > 0) {
    const y = lerp(-420, 480, eOut(clamp(k)));
    x.fillStyle = "rgba(245,245,250,0.96)"; roundRect(x, 30, y, 660, 420, 50); x.fill();
    x.fillStyle = ORANGE; roundRect(x, 70, y + 50, 90, 90, 22); x.fill();
    x.textAlign = "left"; x.fillStyle = "#1c1c22"; x.font = "900 64px Inter"; x.fillText("Recrutador", 190, y + 115);
    x.font = "800 64px Inter"; x.fillStyle = "#33333a"; x.fillText("Vaga de", 70, y + 240); x.fillText("Engenheiro Sênior", 70, y + 330);
  }
}

// ============================================================ 1 · gancho: 20 minutos, 6 bilhões
// The data centre at night: the exchange's coins, seven gold columns on a lit dais, drain from the top and
// pour out in a stream; the LED clock beside them races from 00:00 to 20:00; every rack LED turns red.
addScene("gancho", 0, A.c1, (S) => {
  const hall = makeServerHall({ wallZ: -2.4, seed: 5 }); S.backdrop(hall.group);
  const tower = makeCoinTower({ seed: 3 }); tower.group.position.set(-0.4, 0, 0); S.add(tower.group);
  const clock = makeTimerStand({ w: 0.95, h: 0.42, standH: 1.0 }); clock.group.position.set(0.75, 0, 0.45); clock.group.rotation.y = -0.3; S.add(clock.group);
  const stream = makeCoinStream(160, 3); S.add(stream.mesh);
  let shown = null;
  const anim = (t) => {
    hallLook(hall, t, sm(t, A.levaram - 0.2, A.bilhoes + 0.4));
    const drain = sm(t, A.levaram, A.c1 + 0.2); tower.set(1 - 0.8 * drain);
    stream.update(t, A.levaram, A.c1 + 1, new V3(-0.4, tower.top(1 - 0.8 * drain) + 0.05, 0.1));
    const m = 20 * lin(t, 0.15, 4.2), txt = `${String(Math.floor(m)).padStart(2, "0")}:${String(Math.floor((m % 1) * 60)).padStart(2, "0")}`;
    if (txt !== shown) { shown = txt; clock.paint((x, W, H) => paintClock(x, W, H, txt, m >= 20 ? "#ff3b2a" : "#ffb347")); }
    tower.ring.color.set("#4fd8ff").lerp(new THREE.Color("#ff2a1a"), drain);
    fill.position.set(-0.4, 1.6, 1.4); fill.color.set("#ffc46a"); fill.intensity = 1.8;
  };
  S.hero(tower.group, "torre de moedas"); S.hero(clock.group, "relógio 20 minutos");
  const box = envelope([tower.group, clock.group], anim, 0, A.c1);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.25, 0.15, 1], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, A.seis, 0.03, 0.35); CAM.apply(p); };
});

// ============================================================ 2 · o maior roubo da história: 4× o recorde
// On a stone plinth in a dark office: the 2025 record (Bybit) as a short column of coins; on "maior roubo"
// the 2026 column (Binance) grows beside it to four times its height. The camera rises with it.
addScene("recorde", A.c1, A.c2, (S) => {
  const { off, win } = officeBack(S, 9, -2.6);
  const pl = makeChartPlinth(-1.0, 1.0, { h: 0.14, z0: -0.45, z1: 0.6 }); S.add(pl);
  const c25 = makeCoinColumn(15, { r: 0.3, t: 0.05, seed: 4 }); c25.group.position.set(-0.45, 0.14, 0); S.add(c25.group);
  const c26 = makeCoinColumn(63, { r: 0.3, t: 0.05, seed: 7 }); c26.group.position.set(0.45, 0.14, 0); S.add(c26.group);
  const t25 = makeFloorTag("BYBIT · 2025", { w: 0.52, h: 0.12 }); t25.position.set(-0.45, 0.14, 0.46); S.add(t25);
  const t26 = makeFloorTag("BINANCE · 2026", { w: 0.52, h: 0.12 }); t26.position.set(0.45, 0.14, 0.46); S.add(t26);
  const G0 = A.roubo - 0.3, G1 = A.vezes + 0.4;
  const anim = (t) => {
    officeLook(off, t, 0.35 + 0.25 * beat(t, A.quatro, 0.6)); win.set(0.9 + 0.1 * beat(t, A.quatro, 0.6));
    c25.set(1); c26.set(eOut(lin(t, G0, G1))); popIn(t26, t, G0 - 0.2, 0.4);
    fill.position.set(0.4, 2.4, 1.6); fill.color.set("#ffc46a"); fill.intensity = 1.4 + 1.2 * sm(t, G0, G1);
  };
  S.hero(c25.group, "coluna bybit 2025"); S.hero(c26.group, "coluna binance 2026", { when: (t) => t > G0 + 0.75 });
  const bA = envelope([c25.group, t25], anim, A.c1, G0), bB = envelope([c25.group, c26.group], anim, G0, A.c2);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c1, G0), { zone: "stage", from: [0.1, 0.3, 1], pull0: 1.25, pull: 1.05 });
    const pb = CAM.move(bB, "crane", lin(t, G0, A.c2), { zone: "stage", from: [0.15, 0.2, 1], rise: 0.3, pull: 1.0 });
    let p = CAM.blend(pa, pb, sm(t, G0 - 0.2, G0 + 1.0)); p = CAM.shake(p, t, A.quatro, 0.02, 0.3); CAM.apply(p);
  };
});

// ============================================================ 3 · e o mais estranho: nenhuma chave vazou
// The vault room: on the wall, the key cabinet stands open with every key on its hook; on "vazou" its status
// light flares green.
addScene("chaves", A.c2, A.c3, (S) => {
  const room = makeVaultRoom({ holes: [{ circle: [-2.1, 1.36, 1.03] }], seed: 7 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(-2.1, 0, 0); S.backdrop(vd.group);
  const cab = makeKeyCabinet(); cab.group.position.set(0, 1.0, -0.3); S.add(cab.group);
  const anim = (t) => {
    vaultLook(room, t, 0.15); vd.open(0); vd.glow(0); vd.spin(0);
    cab.led(0.6 + 0.4 * beat(t, A.vazou - 0.1, 0.6)); cab.sway(t);
    fill.position.set(0, 1.5, 1.0); fill.color.set("#7dffb0"); fill.intensity = 0.6 + 1.6 * beat(t, A.vazou - 0.1, 0.7);
  };
  S.hero(cab.group, "armário de chaves");
  const box = envelope([cab.group], anim, A.c2, A.c3);
  return (t) => { anim(t); const k = lin(t, A.c2, A.c3); CAM.apply(CAM.blend(CAM.move(box, "orbit", k, { zone: "stage", from: [0.15, 0.05, 1], deg: 44, pull: 1.3 }), CAM.move(box, "orbit", k, { zone: "stage", from: [0.15, 0.05, 1], deg: 44, pull: 1.0 }), sm(t, A.c2, A.vazou))); };
});

// ============================================================ 4 · tudo começou numa entrevista de emprego
// The home office at night: the laptop on the desk shows a video call with a recruiter; the camera opens up.
addScene("entrevista", A.c3, A.c4, (S) => {
  const H = buildHomeDesk(S, 6);
  const anim = (t) => {
    homeLook(H.room, t, 0.75);
    H.lap.paint((x, W, Hh) => paintCall(x, W, Hh, { n: 1 })); H.phone.paint("off", (x) => paintNotify(x, 0));
    fill.position.set(0, H.desk.top + 0.4, 0.6); fill.color.set("#9fc4ff"); fill.intensity = 1.3;
  };
  S.hero(H.lap.group, "notebook com chamada de vídeo"); S.solid(H.desk.group, "mesa");
  const box = envelope([H.lap.group], anim, A.c3, A.c4);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "reveal", lin(t, A.c3, A.c4), { zone: "stage", from: [0.08, 0.28, 1], pull: 1.0, pull0: 1.3 })); };
});

// ============================================================ 5 · imagina: você é o engenheiro; a vaga dos sonhos
// The same desk, wider: the laptop and, on "recrutador", the phone lights up with the recruiter's message.
addScene("imagina", A.c4, A.c5, (S) => {
  const H = buildHomeDesk(S, 6);
  const anim = (t) => {
    homeLook(H.room, t, 0.8);
    H.lap.paint((x, W, Hh) => paintCall(x, W, Hh, { n: 1 }));
    const k = lin(t, A.recrutador - 0.1, A.recrutador + 0.5); H.phone.paint(k.toFixed(2), (x) => paintNotify(x, k));
    fill.position.set(0.3, H.desk.top + 0.4, 0.6); fill.color.set("#ffcf8a"); fill.intensity = 1.0 + 0.8 * beat(t, A.recrutador, 0.6);
  };
  S.hero(H.lap.group, "notebook"); S.hero(H.phone.body, "celular com mensagem do recrutador");
  S.solid(H.desk.group, "mesa");
  const box = envelope([H.lap.group, H.phone.body], anim, A.c4, A.c5);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c4, A.c5), { zone: "stage", from: [0.0, 0.32, 1], side: 0.35, pull: 1.0 })); };
});

// ============================================================ 6 · várias entrevistas; o teste de programação
// Close on the laptop: the call fills with three interviewers; then the test page, the cursor goes to ABRIR,
// the click (on "abre"), and the code editor slides up.
addScene("teste", A.c5, A.c6, (S) => {
  const H = buildHomeDesk(S, 6);
  const P = A.fim - 0.1;
  const anim = (t) => {
    homeLook(H.room, t, 0.7);
    if (t < P) H.lap.paint((x, W, Hh) => paintCall(x, W, Hh, { n: 1 + 2 * lin(t, A.varias - 0.1, A.entrevistas + 0.5) }));
    else H.lap.paint((x, W, Hh) => paintTest(x, W, Hh, { cursor: lin(t, A.teste, A.abre - 0.1), click: lin(t, A.abre, A.abre + 0.45), open: lin(t, A.arquivo, A.pronto) }));
    H.phone.paint("off", (x) => paintNotify(x, 0));
    fill.position.set(0, H.desk.top + 0.3, 0.5); fill.color.set(t < P ? "#9fc4ff" : "#e9f0ff"); fill.intensity = 1.4;
  };
  S.hero(H.lap.group, "notebook com teste de programação"); S.solid(H.desk.group, "mesa");
  const box = envelope([H.lap.group], anim, A.c5, A.c6);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c5, A.c6), { zone: "stage", from: [0.0, 0.14, 1], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, A.pronto, 0.015, 0.25); CAM.apply(p); };
});

// ============================================================ 7 · o vírus escondido; a porta de entrada
// The code shows a hidden line in red, then the screen goes red (ARQUIVO MALICIOSO, shake on "vírus"); a red
// glowing cable draws itself out of the back of the laptop, down the desk and across the floor to the wall.
addScene("virus", A.c6, A.c7, (S) => {
  const H = buildHomeDesk(S, 6);
  const top = H.desk.top;
  const wire = makeHackWire([[-0.05, top + 0.012, -0.12], [0.0, top + 0.012, -0.42], [0.04, top - 0.25, -0.5], [0.1, 0.03, -0.72], [0.3, 0.03, -1.2], [0.45, 0.32, -1.47]], { radius: 0.012 }); S.add(wire.mesh);
  const sock = new THREE.Mesh(rbox(0.12, 0.12, 0.02, 0.01), pmat("#e9e3d8", { roughness: 0.5 })); sock.position.set(0.45, 0.32, -1.49); S.add(sock);
  const anim = (t) => {
    const red = sm(t, A.virus - 0.15, A.virus + 0.25);
    homeLook(H.room, t, 0.75 - 0.4 * red);
    H.lap.paint((x, W, Hh) => paintVirus(x, W, Hh, { hl: lin(t, A.dentro, A.virus - 0.2), red, t }));
    H.phone.paint("off", (x) => paintNotify(x, 0));
    wire.grow(lin(t, A.computador - 0.2, A.entrada)); wire.glow(0.6 + 0.4 * Math.sin(t * 8));
    fill.position.set(0, top + 0.35, 0.5); fill.color.set(red > 0.3 ? "#ff3a2a" : "#9fc4ff"); fill.intensity = 1.2 + 1.6 * red;
  };
  S.hero(H.lap.group, "notebook com vírus"); S.solid(H.desk.group, "mesa");
  const box = envelope([H.lap.group, H.mug.group], anim, A.c6, A.c7);
  return (t) => { anim(t); let p = CAM.move(box, "drop", lin(t, A.c6, A.c7), { zone: "stage", from: [-0.15, 0.55, 1], rise: 0.25, pull: 1.0 }); p = CAM.shake(p, t, A.virus, 0.03, 0.35); CAM.apply(p); };
});

// The bank model on a table in a dark office (scenes 8–10). API { off, desk, bank }
function buildBankTable(S, seed) {
  const { off } = officeBack(S, seed, -2.0);
  const desk = makeWorkDesk({ w: 2.3, d: 1.3, leather: "#1f2a33" }); S.add(desk.group);
  const bank = makeBankModel(); bank.group.position.set(0, desk.top, 0.0); S.add(bank.group);
  return { off, desk, bank };
}

// ============================================================ 8 · mas como um computador abre bilhões?
// The red cable arrives across the table at the model of a bank; the camera rises over it; on "bilhões"
// the vault in the basement glows.
addScene("como", A.c7, A.c8, (S) => {
  const T = buildBankTable(S, 11), top = T.desk.top;
  const wire = makeHackWire([[-2.6, top + 0.01, 0.45], [-1.5, top + 0.01, 0.42], [-1.0, top + 0.01, 0.3], [-0.89, top + 0.3, 0.05]], { radius: 0.014 }); S.add(wire.mesh);
  const anim = (t) => {
    officeLook(T.off, t, 0.28);
    T.bank.drawer(0); T.bank.fill(1); T.bank.lift(0); T.bank.coldLed(0.8); T.bank.hotLed(0.8); T.bank.glow(sm(t, A.bilhoes2 - 0.2, A.bilhoes2 + 0.4) * 0.8);
    T.bank.vault.open(0.15 * sm(t, A.bilhoes2 - 0.2, A.bilhoes2 + 0.4));
    popIn(T.bank.cold, t, 999, 0.1); popIn(T.bank.hot, t, 999, 0.1);
    wire.grow(lin(t, A.c7, A.como + 0.8)); wire.glow(0.7 + 0.3 * Math.sin(t * 7));
    fill.position.set(0, top + 1.4, 1.2); fill.color.set("#ffcf8a"); fill.intensity = 1.0;
  };
  S.hero(T.bank.group, "maquete do banco"); S.solid(T.desk.group, "mesa");
  const box = envelope([T.bank.group], anim, A.c7, A.c8);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c7, A.c8), { zone: "stage", from: [0.25, 0.25, 1], rise: 0.3, pull: 1.0 })); };
});

// ============================================================ 9 · a analogia: o cofre no subsolo, a gaveta do caixa
// Close on the basement: the vault door swings open, gold light, coins piled beside it. On "sobe" the
// little lift carries a bundle of cash up; on "gaveta" the counter's drawer slides out (the camera rises).
addScene("banco", A.c8, A.c9, (S) => {
  const T = buildBankTable(S, 11), B = A.so - 0.2;
  const anim = (t) => {
    officeLook(T.off, t, 0.25);
    T.bank.vault.open(0.15 + 0.6 * sm(t, A.quase, A.cofre + 0.3)); T.bank.glow(0.5 + 0.5 * sm(t, A.quase, A.cofre)); T.bank.vault.spin(2 * sm(t, A.c8, A.quase));
    T.bank.lift(sm(t, A.sobe - 0.3, A.gaveta)); T.bank.drawer(sm(t, A.gaveta - 0.1, A.caixa + 0.3)); T.bank.fill(1);
    T.bank.coldLed(0.8); T.bank.hotLed(0.8); popIn(T.bank.cold, t, 999, 0.1); popIn(T.bank.hot, t, 999, 0.1);
    fill.position.set(-0.3, T.desk.top + 0.5, 1.0); fill.color.set("#ffc46a"); fill.intensity = 1.2;
  };
  S.hero(T.bank.group, "maquete do banco com cofre aberto", { when: (t) => t < B });
  S.hero(T.bank.upper, "balcão do caixa com gaveta", { when: (t) => t > B + 0.6 });
  S.solid(T.desk.group, "mesa");
  const bA = envelope([T.bank.group], anim, A.c8, B), bB = envelope([T.bank.upper], anim, B, A.c9);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c8, B), { zone: "stage", from: [0.2, 0.08, 1], pull0: 1.2, pull: 1.0 });
    const pb = CAM.move(bB, "crane", lin(t, B, A.c9), { zone: "stage", from: [-0.1, 0.25, 1], rise: 0.2, pull: 1.05 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.3, B + 0.8)));
  };
});

// ============================================================ 10 · na cripto é igual: carteira fria, carteira quente
// The whole model: CARTEIRA FRIA pops onto the basement (the loose cable, a steady blue light), CARTEIRA
// QUENTE onto the ground floor (the plugged cable, the amber light blinking). The camera slides along.
addScene("carteiras", A.c9, A.c10, (S) => {
  const T = buildBankTable(S, 11);
  const anim = (t) => {
    officeLook(T.off, t, 0.25);
    T.bank.vault.open(0.05); T.bank.glow(0.4); T.bank.lift(1); T.bank.drawer(0.4); T.bank.fill(1);
    popIn(T.bank.cold, t, A.fria - 0.25, 0.4); popIn(T.bank.hot, t, A.quente - 0.25, 0.4);
    T.bank.coldLed(0.3 + 0.7 * sm(t, A.fria, A.internet)); T.bank.hotLed(t > A.quente ? (Math.floor(t * 4) % 2 ? 1 : 0.25) : 0.4);
    fill.position.set(0, T.desk.top + 1.0, 1.3); fill.color.set(t > A.quente ? "#ffb347" : "#8fc4ff"); fill.intensity = 1.0;
  };
  S.hero(T.bank.group, "maquete do banco com placas"); S.solid(T.desk.group, "mesa");
  const box = envelope([T.bank.group], anim, A.c9, A.c10);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c9, A.c10), { zone: "stage", from: [0.0, 0.18, 1], side: 0.3, pull: 1.0 })); };
});

// The teller's counter in the vault room (scenes 11, 12, 16): the vault door in the back wall on the left,
// the counter in front on the right, the stamp on the counter. API { room, vd, ctr, stamp, cx }
const CX = 1.6, CZ = 2.2;
function buildCounter(S, seed) {
  const room = makeVaultRoom({ holes: [{ circle: [0, 1.36, 1.03] }], seed }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(0, 0, 0); S.add(vd.group);
  const ctr = makeTellerCounter(); ctr.group.position.set(CX, 0, CZ); S.add(ctr.group);
  const stamp = makeAuthStamp({ s: 1.5 }); S.add(stamp.group);
  return { room, vd, ctr, stamp };
}
const STAMP_AT = () => new V3(CX + 0.0, 0, CZ + 0.06);

// ============================================================ 11 · nem tocaram no cofre; o carimbo do gerente
// A: the vault door, shut and untouched (the camera turns around it). B (cut at "Foram"): the counter;
// the camera pushes in to the stamp AUTORIZADO; on "autoriza" it lifts, ready.
addScene("carimbo", A.c10, A.c11, (S) => {
  const C = buildCounter(S, 6), sp = STAMP_AT();
  const anim = (t) => {
    vaultLook(C.room, t, 0.2); C.vd.open(0); C.vd.glow(0); C.vd.spin(0);
    C.ctr.drawer(0.25); C.ctr.fill(1);
    C.stamp.group.position.set(sp.x, C.ctr.topY + 0.004 + 0.12 * sm(t, A.autoriza - 0.2, A.autoriza + 0.3), sp.z);
    fill.position.set(CX, C.ctr.topY + 0.6, CZ + 0.9); fill.color.set("#ffd9a0"); fill.intensity = t > B11 ? 1.6 : 0;
  };
  S.hero(C.vd.group, "cofre fechado", { when: (t) => t < B11 });
  S.hero(C.stamp.group, "carimbo autorizado", { when: (t) => t > B11 + 0.1 }); S.hero(C.ctr.drawerGroup, "gaveta do caixa", { when: (t) => t > B11 + 0.1 && t < A.gerente - 0.35 });
  S.solid(C.ctr.group, "balcão"); S.solid(C.stamp.group, "carimbo", { restsOn: ["balcão"] });
  const bA = envelope([C.vd.group], anim, A.c10, B11), bB = envelope([C.ctr.drawerGroup, C.stamp.group], anim, B11, A.gerente), bC = envelope([C.stamp.group], anim, A.gerente, A.c11);
  return (t) => {
    anim(t);
    if (t < B11) { let p = CAM.move(bA, "orbit", lin(t, A.c10, B11), { zone: "stage", from: [0.1, 0.12, 1], deg: 34, pull: 1.0 }); p = CAM.shake(p, t, A.cofre3, 0.02, 0.25); CAM.apply(p); return; }
    const pb = CAM.move(bB, "push", lin(t, B11, A.gerente), { zone: "stage", from: [-0.12, 0.32, 1], pull0: 1.2, pull: 1.0 });
    const pc = CAM.move(bC, "push", lin(t, A.gerente, A.c11), { zone: "stage", from: [-0.05, 0.75, 1], pull0: 1.2, pull: 1.1 });
    CAM.apply(CAM.blend(pb, pc, sm(t, A.gerente - 0.3, A.gerente + 0.7)));
  };
});

// ============================================================ 12 · pela IA interna até o carimbo: saque atrás de saque
// The counter: a red cable draws itself across the floor and up to the IA INTERNA box (its light turns red),
// then on to the stamp; on "carimbaram" the stamp slams slip after slip (AUTORIZADO), the drawer slides out
// and coins burst from it. The camera turns around the counter, shaking on every blow.
addScene("saques", A.c11, A.c12, (S) => {
  const C = buildCounter(S, 9), sp = STAMP_AT(), top = C.ctr.topY;
  const ai = makeAiBox(); ai.group.position.set(CX - 0.62, top, CZ - 0.2); S.add(ai.group);
  const w1 = makeHackWire([[CX - 3.2, 0.02, CZ + 0.7], [CX - 1.6, 0.02, CZ + 0.55], [CX - 1.06, 0.4, CZ + 0.3], [CX - 1.02, top + 0.012, CZ - 0.05], [CX - 0.87, top + 0.06, CZ - 0.2]], { radius: 0.014 }); S.add(w1.mesh);
  const w2 = makeHackWire([[CX - 0.37, top + 0.06, CZ - 0.2], [CX - 0.2, top + 0.012, CZ - 0.16], [CX - 0.06, top + 0.012, CZ - 0.12]], { radius: 0.012 }); S.add(w2.mesh);
  const slips = SLAMS.map(() => { const s = makeSlip(); S.add(s.group); return s; });
  const coins = makeCoinStream(120, 5, { r: 0.05, spread: 0.8 }); S.add(coins.mesh);
  const press = (t) => Math.max(0, ...SLAMS.map((at) => { const d = t - at; return d < -0.12 ? 0 : d < 0 ? 1 + d / 0.12 : d < 0.06 ? 1 : Math.max(0, 1 - (d - 0.06) / 0.22); }));
  const anim = (t) => {
    vaultLook(C.room, t, sm(t, A.carimbaram - 0.3, A.carimbaram + 0.2)); C.vd.open(0); C.vd.glow(0); C.vd.spin(0);
    w1.grow(lin(t, A.c11 + 0.1, A.ferramentas + 0.5)); w1.glow(0.7 + 0.3 * Math.sin(t * 7));
    const aiHit = sm(t, A.ferramentas + 0.3, A.artificial); ai.led(aiHit > 0.5 ? "#ff2a1a" : "#4fd8ff", 0.6 + 0.4 * Math.sin(t * 10));
    w2.grow(lin(t, A.artificial + 0.3, A.carimbo2 + 0.2)); w2.glow(0.7 + 0.3 * Math.sin(t * 7 + 1));
    // the stamp hovers, then slams down at each SLAMS time
    const lift = t < SLAMS[0] - 0.3 ? 0.12 : 0.12 * (1 - press(t));
    C.stamp.group.position.set(sp.x, top + 0.004 + 0.002 + lift, sp.z);
    slips.forEach((s, i) => {
      const at = SLAMS[i], kIn = sm(t, at - 0.45, at - 0.12), kOut = sm(t, at + 0.12, at + 0.4);
      const x = lerp(lerp(CX - 0.62, sp.x, kIn), CX + 0.5, kOut), z = lerp(CZ + 0.2, sp.z, kIn) + 0.06 * kOut;
      s.group.visible = t > at - 0.45; s.group.position.set(x, top + 0.002 + i * 0.0045 * kOut, z); s.group.rotation.y = 0.15 * kOut;
      s.mark.material.opacity = t > at ? 1 : 0;
    });
    C.ctr.drawer(sm(t, A.carimbaram - 0.2, A.carimbaram + 0.4)); C.ctr.fill(1 - sm(t, SLAMS[0], SLAMS[3] + 0.2));
    coins.update(t, SLAMS[0], A.c12 + 1, C.ctr.drawerPoint());
    fill.position.set(CX, top + 0.6, CZ + 0.9); fill.color.set("#ff5a3a"); fill.intensity = 1.2 + 1.4 * press(t);
  };
  const T1 = A.passaram - 0.1, T2 = A.carimbo2 - 0.3;
  S.hero(C.ctr.group, "balcão com fio vermelho", { when: (t) => t < T1 - 0.4 });
  S.hero(ai.group, "caixa ia interna", { when: (t) => t > T1 + 0.5 && t < T2 - 0.4 });
  S.hero(C.stamp.group, "carimbo batendo", { when: (t) => t > T2 + 0.5 });
  S.solid(C.ctr.group, "balcão"); S.solid(ai.group, "caixa ia", { restsOn: ["balcão"] });
  const bA = envelope([C.ctr.group, ai.group], anim, A.c11, T1), bI = envelope([ai.group], anim, T1, T2), bB = envelope([C.stamp.group], anim, T2, A.c12);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "orbit", lin(t, A.c11, T1), { zone: "stage", from: [-0.2, 0.3, 1], deg: 24, pull: 1.0 });
    const pi = CAM.move(bI, "truck", lin(t, T1, T2), { zone: "stage", from: [0.1, 0.75, 1], side: 0.3, pull: 1.05 });
    const pb = CAM.move(bB, "push", lin(t, T2, A.c12), { zone: "stage", from: [0.05, 0.7, 1], pull0: 1.2, pull: 1.0 });
    let p = t < (T1 + T2) / 2 ? CAM.blend(pa, pi, sm(t, T1 - 0.3, T1 + 0.5)) : CAM.blend(pi, pb, sm(t, T2 - 0.3, T2 + 0.5));
    SLAMS.forEach((at) => { p = CAM.shake(p, t, at, 0.025, 0.25); });
    CAM.apply(p);
  };
});

// ============================================================ 13 · coisa de meses: em junho, a ferramenta falsa
// A desk in a dark office: the flip calendar turns back OUT → SET → AGO → JUL → JUN; beside it a second
// laptop installs instalar.pkg (the fake developer tool), the bar fills and turns red: INSTALADO.
addScene("meses", A.c12, A.c13, (S) => {
  const off = makeOfficeSet({ wallZ: -1.8, clear: 1.0, seed: 23 }); S.backdrop(off.group);
  const win = makeSetWindow(2.2, 1.1, { seed: 25, open: 0.15 }); win.group.position.set(0, 1.55, -1.8 + 0.15); S.backdrop(win.group);
  const desk = makeWorkDesk({ w: 1.9, d: 1.0, leather: "#2a1e18" }); S.add(desk.group);
  const cal = makeFlipCalendar(["OUT", "SET", "AGO", "JUL", "JUN"], { w: 0.5, h: 0.42 }); cal.group.position.set(-0.27, desk.top, 0.05); cal.group.rotation.y = 0.25; S.add(cal.group);
  const lap = makeLaptop({ w: 0.42 }); lap.group.position.set(0.22, desk.top, 0.0); lap.group.rotation.y = -0.2; S.add(lap.group);
  const anim = (t) => {
    officeLook(off, t, 0.25);
    const p = 4 * sm(t, A.c12 + 0.3, A.junho), i = Math.min(4, Math.floor(p)); cal.show(i, i < 4 ? p - i : 0);
    lap.paint((x, W, H) => paintInstaller(x, W, H, { k: lin(t, A.outro, A.falsa - 0.1), show: lin(t, A.junho, A.outro) }));
    fill.position.set(0, desk.top + 0.6, 0.8); fill.color.set(t > A.falsa - 0.1 ? "#ff5a3a" : "#ffcf8a"); fill.intensity = 1.3;
  };
  S.hero(cal.group, "calendário de mesa"); S.hero(lap.group, "notebook instalando programa", { when: (t) => t > A.junho });
  S.solid(desk.group, "mesa");
  const box = envelope([cal.group, lap.group], anim, A.c12, A.c13);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "reveal", lin(t, A.c12, A.c13), { zone: "stage", from: [0.05, 0.3, 1], pull: 1.0, pull0: 1.25 })); };
});

// ============================================================ 14 · quem foi? o FBI aponta a Coreia do Norte
// The photo of the FBI headquarters in a frame on a pedestal, in the dark office; it turns and lands, zooms slowly.
addScene("fbi", A.c13, A.c14, (S) => {
  const { off, win } = officeBack(S, 31, -2.0);
  const fr = makePhotoFrame("fbi", { w: 2.3, name: "FBI · WASHINGTON" }); if (fr.plate) fr.plate.userData.plate.detail = true; S.add(fr.group);
  const anim = (t) => {
    const siren = t > A.fbi ? (Math.floor(t * 3) % 2 ? "#ff3b3b" : "#3b6bff") : "#8fb0ff";
    officeLook(off, t, 0.3); off.windows(0.9, siren); win.set(1, siren);
    fr.frame.rotation.y = -1.2 * (1 - eOut(lin(t, A.c13, A.c13 + 0.7))); popIn(fr.group, t, A.c13, 0.45); fr.zoom(1 + 0.2 * lin(t, A.c13, A.c14));
  };
  S.hero(fr.group, "porta-retrato do prédio do fbi");
  const box = envelope([fr.group], anim, A.c13 + 0.8, A.c14);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c13, A.c14), { zone: "stage", from: [0, 0.22, 1], deg: 30, pull: 1.0 })); };
});

// ============================================================ 15 · agora imagina: você é cliente; os saques travaram
// The living room at night: the phone on its stand shows the exchange; SACAR is tapped, greys out with a
// padlock and a red SAQUES SUSPENSOS slides up; the room light dips.
addScene("cliente", A.c14, A.c15, (S) => {
  const H = buildHomeDesk(S, 14, { phone: true });
  H.lap.group.visible = false;
  const hit = A.sacarC - 0.05;
  const anim = (t) => {
    const lock = lin(t, A.travaram - 0.2, A.travaram + 0.4);
    homeLook(H.room, t, 0.8 - 0.45 * beat(t, A.travaram - 0.1, 0.9));
    const tap = t > hit ? lin(t, hit, hit + 0.55) : 0;
    H.phone.paint(`${tap.toFixed(2)}|${lock.toFixed(2)}`, (x) => paintExchange(x, { tap, lock }));
    fill.position.set(0.42, H.desk.top + 0.25, 0.7); fill.color.set(lock > 0.3 ? "#ff4a3a" : "#9fc4ff"); fill.intensity = lock > 0.3 ? 2.2 : 1.4;
  };
  S.hero(H.phone.body, "celular com app da corretora"); S.solid(H.desk.group, "mesa");
  const box = envelope([H.phone.body], anim, A.c14, A.c15);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c14, A.c15), { zone: "stage", from: [-0.2, 0.18, 1], pull0: 1.3, pull: 1.0 })); };
});

// ============================================================ 16 · congelou quase metade; prometeu cobrir as perdas
// The counter: beside it a block of ice forms around half of the flying coins (frozen mid-air); then on
// "prometeu" the empty drawer fills back up with coins, in warm light. The camera comes down.
addScene("congelou", A.c15, A.c16, (S) => {
  const C = buildCounter(S, 12), sp = STAMP_AT();
  const ice = makeIceBlock(); ice.group.position.set(CX + 1.7, 0, CZ + 0.35); ice.group.rotation.y = -0.25; S.add(ice.group);
  const anim = (t) => {
    vaultLook(C.room, t, 0.3 * (1 - sm(t, A.prometeu, A.perdas))); C.vd.open(0); C.vd.glow(0); C.vd.spin(0);
    C.stamp.group.position.set(sp.x, C.ctr.topY + 0.006, sp.z);
    ice.form(sm(t, A.c15, A.parceiros));
    C.ctr.drawer(1); C.ctr.fill(sm(t, A.prometeu + 0.2, A.caixaP));
    fill.position.set(CX + 0.4, C.ctr.topY + 0.7, CZ + 1.0); fill.color.set(t > A.prometeu ? "#ffc46a" : "#9fdcff"); fill.intensity = 1.6;
  };
  S.hero(ice.group, "bloco de gelo com moedas", { when: (t) => t > A.c15 + 0.15 });
  S.hero(C.ctr.drawerGroup, "gaveta do caixa enchendo");
  S.solid(C.ctr.group, "balcão"); S.solid(ice.group, "gelo");
  const box = envelope([C.ctr.drawerGroup, ice.group], anim, A.c15, A.c16);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.c15, A.c16), { zone: "stage", from: [0.1, 0.35, 1], rise: 0.25, pull: 1.0 })); };
});

// ============================================================ 17 · a pergunta: confia na Binance ou foge de corretora?
// The living-room desk: on the left the phone with the exchange (SAQUES LIBERADOS), on the right a hardware
// wallet on its stand; a name card in front of each (CORRETORA · CARTEIRA PRÓPRIA). The camera swings between.
addScene("pergunta", A.c16, A.end, (S) => {
  const H = buildHomeDesk(S, 18, { phone: true });
  H.lap.group.visible = false; H.mug.group.visible = false;
  H.phone.group.position.set(-0.27, H.desk.top, 0.0); H.phone.group.rotation.y = 0.15; H.phone.group.scale.setScalar(1.5);
  const cw = makeColdWallet({ s: 2.6 }); cw.group.position.set(0.3, H.desk.top, 0.0); cw.group.rotation.y = -0.15; S.add(cw.group);
  const pa = makePlaceCard("CORRETORA", { w: 0.44, h: 0.13 }); pa.group.position.set(-0.27, H.desk.top, 0.42); S.add(pa.group);
  const pb = makePlaceCard("CARTEIRA PRÓPRIA", { w: 0.54, h: 0.15 }); pb.group.position.set(0.3, H.desk.top, 0.42); S.add(pb.group);
  const anim = (t) => {
    homeLook(H.room, t, 0.8);
    const ok = lin(t, A.c16, A.c16 + 0.6); H.phone.paint(`ok${ok.toFixed(2)}`, (x) => paintExchange(x, { ok }));
    popIn(pa.group, t, A.confia - 0.3, 0.4); popIn(pb.group, t, A.foge - 0.3, 0.4);
    fill.position.set(0, H.desk.top + 0.4, 0.8); fill.color.set("#ffcf8a"); fill.intensity = 1.3;
  };
  S.hero(H.phone.body, "celular com corretora"); S.hero(cw.group, "carteira física de cripto");
  S.hero(pa.group, "placa corretora", { when: (t) => t > A.confia + 0.2 }); S.hero(pb.group, "placa carteira própria", { when: (t) => t > A.foge + 0.2 });
  S.solid(H.desk.group, "mesa");
  const box = envelope([H.phone.body, cw.group, pa.group, pb.group], anim, A.c16, A.end);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c16, A.end), { zone: "stage", from: [0, 0.32, 1], deg: 26, pull: 1.0 })); };
});
