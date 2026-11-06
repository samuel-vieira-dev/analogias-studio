// ============================================================================
// videos/2026-11-05-salario-politicos/scenes.js
// Quanto custa um deputado. Gancho: "Um deputado pode custar duzentos e setenta e cinco mil por mês." → a
// impressora do gabinete (vidraça com o Congresso à noite) imprime a conta do mandato, carimbo POR MÊS; a
// linha SALÁRIO acende → o porta-retrato do Congresso ("você foi eleito") → o contracheque de R$ 46.366 e
// 29 maços de um salário mínimo → chegam a chave (apartamento funcional), o cartão da cota e a pasta do
// gabinete → as quatro placas da cota → 25 assessores entram atrás da mesa, crachá INDICADO → analogia: o
// técnico no estádio à noite, o jornal com a manchete, a comissão técnica e o ônibus do HOTEL → na Esplanada
// à noite: o disco do custo em fatias de tamanho real, o salário (16,9%) se afasta → o plenário de 513
// cadeiras acende em onda → Câmara e Senado em porta-retratos, a pilha dos salários sobe → a pilha vira
// chuva e sobram R$ 1, 50 e 5 centavos → o Congresso em miniatura no mapa e as cidades acendendo → a
// balança MENOS × ALTO. Números e fontes em fatos.md; nenhum lado tomado.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / spTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  um: 0.0, custar: 1.08, mil: 3.16, mes: 3.64, salario: 4.64, barata: 5.86, c1: 6.56,
  imagina: 6.56, eleito: 7.72, federal: 8.66, c2: 9.46,
  contracheque: 10.14, valor: 11.18, quase: 14.48, n29: 14.96, minimos: 16.3, c3: 17.06,
  chega: 17.68, resto: 18.0, chave: 18.82, apartamento: 19.52, ou: 21.02, v4200: 21.32, moradia: 23.1, c4: 23.92,
  cartao: 24.22, v58: 25.22, passagem: 27.06, combustivel: 27.86, escritorio: 28.82, divulgacao: 29.5, c5: 30.38,
  fatia: 30.9, v165: 31.86, contratar: 34.2, n25: 34.96, assessores: 35.68, escolhidos: 36.8, voce: 37.46, c6: 37.98,
  tecnico: 38.98, futebol: 39.56, salario2: 40.38, vira: 41.02, manchete: 41.3, c7: 42.02,
  chega2: 42.48, comissao: 43.0, escolhida: 44.68, clube: 45.8, paga: 46.12, todo: 46.52, onibus: 47.6, hotel: 48.34, c8: 48.9,
  tudo: 49.28, v275: 50.16, salario3: 53.1, quinto: 54.46, c9: 55.2,
  multiplica: 55.4, n513: 56.3, deputados: 57.28, estrutura: 58.9, bilhao: 60.74, ano: 61.74, c10: 62.32,
  sozinho: 62.88, n513b: 63.76, n81: 65.7, somam: 67.02, v330: 68.02, c11: 70.44,
  dividido: 70.44, n213: 71.14, brasileiros: 72.76, v155: 73.74, pessoa: 75.28, c12: 75.92,
  congresso: 77.22, brasil: 77.98, n58: 79.54, vereadores: 80.6, cada: 81.84, decide: 82.52, c13: 83.88,
  voce2: 83.98, menos: 85.7, ou2: 86.6, alto: 87.3, cargo: 88.96, end: 91.4,
};
const SP_INK = "#1b1612", SP_NAVY = "#1d3557", SP_TEAL = "#2a7f86";

// ---------------------------------------------------------------- shared helpers
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function spTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
// Apply a pose and push the fog back so a far backdrop (the Congress, the floodlights) stays visible.
function spFar(p, far = 150) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 8); scene.fog.far = Math.max(scene.fog.far, far); }
// An invisible box standing in for a heavy group (a crowd) in framing and in the QA: 8 vertices, no pixels.
function spProxy(min, max) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(max[0] - min[0], max[1] - min[1], max[2] - min[2]), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  b.position.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2); b.userData.noShadow = true; return b;
}
const SP_SKY = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#03050d"); g.addColorStop(0.45, "#0b1430"); g.addColorStop(0.78, "#1d2446"); g.addColorStop(1, "#3a2c40"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function spStoneTex() {
  return cachedTex("spStone", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"); x.fillStyle = "#7a746c"; x.fillRect(0, 0, 512, 512);
    speckle(x, 512, 512, 41, 7000, 0.14, 0.07, 2);
    x.fillStyle = "rgba(24,20,16,0.6)"; for (let i = 0; i <= 2; i++) { x.fillRect(0, i * 256 - 2, 512, 4); x.fillRect(i * 256 - 2, 0, 4, 512); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// ---------------------------------------------------------------- the Esplanada at night (backdrop)
// The lawn of the Esplanada with the Congress far behind (towers lit, the bowl and the dome washed in cold
// light), the reflecting pool in front of it, two rows of lamp posts receding towards it, the city's lights
// on the horizon and a few stars. `plaza` paves the ground where the heroes stand. All backdrop.
// API { group, congress, update(t), lamps(k) }
function spEsplanada({ z = -26, s = 3.0, seed = 5, plaza = true, cx = 2.6, lampX = 5.2, lampZ = -1.5 } = {}) {
  const g = new THREE.Group();
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(260, 220), mat("#ffffff", { map: tileTex(grassTex(), 70, 60), color: "#6b8a5c", roughness: 0.95 }));
  lawn.rotation.x = -Math.PI / 2; lawn.position.set(0, -0.002, z - 60); g.add(lawn);
  if (plaza) { const pz = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), mat("#ffffff", { map: tileTex(spStoneTex(), 9, 5), roughness: 0.7, envMapIntensity: 0.5 })); pz.rotation.x = -Math.PI / 2; pz.position.set(0, 0.004, 1); g.add(pz); }
  const cg = makeCongressBuilding(); cg.group.scale.setScalar(s); cg.group.position.set(cx, 0, z); cg.glow(0.5); g.add(cg.group);
  // the white concrete reads cold-lit at night (the materials of this copy only)
  const seen = new Set();
  cg.group.traverse((n) => { if (!n.isMesh) return; (Array.isArray(n.material) ? n.material : [n.material]).forEach((m) => { if (!m || seen.has(m) || !m.isMeshPhysicalMaterial || m.emissiveMap) return; seen.add(m); m.color.multiplyScalar(0.6); m.emissive.set("#26345a"); m.emissiveIntensity = 0.28; }); });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(9 * s, 1.3 * s), pmat("#0a1322", { roughness: 0.05, metalness: 0.5, clearcoat: 1 })); pool.rotation.x = -Math.PI / 2; pool.position.set(cx, 0.02, z + 4.2 * s); g.add(pool);
  const halos = [], poleM = pmat("#22252a", { metalness: 0.6, roughness: 0.45 }), lampM = new THREE.MeshBasicMaterial({ color: "#ffe2b0", toneMapped: false });
  for (let i = 0; i < 7; i++) for (const sx of [-1, 1]) {
    const x = sx * (lampX + i * 0.2), zz = lampZ - i * 4.4;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.2, 10), poleM); pole.position.set(x, 2.1, zz); g.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), lampM); head.position.set(x, 4.25, zz); g.add(head);
    const h = sprite(BOKEH, 2.2); h.material.color.set("#ffcf8a"); h.material.blending = THREE.AdditiveBlending; h.material.opacity = 0.55; h.position.set(x, 4.25, zz); g.add(h); halos.push(h);
    const pl = makeFloorGlow(3.4, 3.4, { color: "#ffcf8a", opacity: 0.1 }); pl.position.set(x, 0.012, zz); g.add(pl);
  }
  const city = makeBokeh({ n: 80, center: [0, 2.5, z - 30], spread: [140, 5, 16], size: [0.7, 2.2], colors: ["#ffd08a", "#fff1d6", "#9fc4ff", "#ffb35c"], opacity: 0.5, seed: seed + 1 }); g.add(city.group);
  const stars = makeBokeh({ n: 50, center: [0, 34, z - 70], spread: [200, 26, 6], size: [0.2, 0.5], colors: ["#ffffff", "#cfe0ff"], opacity: 0.55, seed: seed + 2, drift: 0.04 }); g.add(stars.group);
  asBackdrop(g);
  return { group: g, congress: cg, update(t) { city.update(t); stars.update(t); }, lamps(k) { halos.forEach((h) => { h.material.opacity = 0.55 * k; }); } };
}
function spOutLook(E, t, k = 1) {
  floor.visible = false; E.update(t); scene.background = SP_SKY;
  key.intensity = 1.6 * k; key.color.set("#ffd6b0"); hemi.intensity = 0.42; hemi.color.set("#9fb2ff"); hemi.groundColor.set("#141210");
  scene.environmentIntensity = 0.36; scene.fog.color.set("#0b1124");
}

// ---------------------------------------------------------------- the deputy's office (backdrop)
// A Brasília office at night: polished plank floor and a red rug, a glass wall from a wood sill up to the
// ceiling (dark mullions) with the Esplanada and the Congress outside, ceiling light panels, archive shelves,
// cold beams of the night coming in with dust in them. API { group, E, update(t) }
function spCabinet({ wallZ = -2.0, seed = 3 } = {}) {
  const g = new THREE.Group(), E = spEsplanada({ z: wallZ - 24, s: 3.0, seed, plaza: false, lampX: 2.6, lampZ: wallZ - 3 }); g.add(E.group);
  const CEIL = 3.4;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 26), mat("#ffffff", { map: tileTex(woodTex("#3e2a1d"), 12, 10), roughness: 0.38, envMapIntensity: 0.7 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.006, wallZ + 13); g.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.0), mat("#ffffff", { map: tileTex(noiseTex({ base: "#9a9a9a", amount: 0.25, seed: 12, weave: true }), 4, 3), color: "#7a2a22", roughness: 0.95 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.009, wallZ + 2.6); g.add(rug);
  const sillM = mat("#ffffff", { map: tileTex(woodTex("#4a2f1f"), 12, 1), roughness: 0.5 }), dark = pmat("#1b1d21", { metalness: 0.6, roughness: 0.38 });
  const sill = new THREE.Mesh(new THREE.BoxGeometry(30, 0.8, 0.24), sillM); sill.position.set(0, 0.4, wallZ - 0.12); g.add(sill);
  const sillTop = new THREE.Mesh(new THREE.BoxGeometry(30, 0.05, 0.3), dark); sillTop.position.set(0, 0.825, wallZ - 0.12); g.add(sillTop);
  for (let i = -11; i <= 11; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, CEIL - 0.85, 0.09), dark); m.position.set(i * 1.35 + 0.675, 0.85 + (CEIL - 0.85) / 2, wallZ - 0.16); g.add(m); }
  const tr = new THREE.Mesh(new THREE.BoxGeometry(30, 0.05, 0.09), dark); tr.position.set(0, 2.62, wallZ - 0.16); g.add(tr);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(30, CEIL - 0.85), glassMat({ opacity: 0.06, color: "#c4d6ee" })); glass.position.set(0, 0.85 + (CEIL - 0.85) / 2, wallZ - 0.2); g.add(glass);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 26), mat("#ffffff", { map: tileTex(setCeilingTex(), 25, 22), roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CEIL, wallZ + 13); g.add(ceil);
  const panelM = new THREE.MeshBasicMaterial({ color: "#ffe6c2", toneMapped: false });
  for (let zz = wallZ + 1.4; zz < wallZ + 22; zz += 2.8) for (const x of [-2.8, 0, 2.8]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.5), panelM); p.rotation.x = Math.PI / 2; p.position.set(x, CEIL - 0.01, zz); g.add(p);
    const pool = makeFloorGlow(2.8, 2.0, { color: "#ffd7a6", opacity: 0.06 }); pool.position.set(x, 0.012, zz); g.add(pool);
  }
  for (const sx of [-1, 1]) { const sh = makeArchiveShelf({ w: 1.6, h: 2.3, seed: seed + (sx > 0 ? 2 : 0) }); sh.position.set(sx * 3.4, 0, wallZ + 0.35); g.add(sh); }
  for (const sx of [-1, 1]) { const bm = makeLightShaft([sx * 1.7, 2.9, wallZ - 0.1], [sx * 2.0, 0.05, wallZ + 3.6], { w0: 1.6, w1: 2.6, color: "#9db8ff", opacity: 0.09 }); g.add(bm.group); }
  const motes = makeSetMotes(120, [[-3, 0.9, wallZ + 0.2], [3, 3.0, wallZ + 1.1]], { color: "#cfe0ff", seed: seed + 5 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, E, update(t) { E.update(t); motes.update(t); } };
}
function spInLook(C, t, k = 1) {
  floor.visible = false; C.update(t); scene.background = SP_SKY;
  key.intensity = 1.55 * k; key.color.set("#ffd2a8"); hemi.intensity = 0.45; hemi.color.set("#a9b9ff"); hemi.groundColor.set("#1a120c");
  scene.environmentIntensity = 0.42; scene.fog.color.set("#0d1122");
}

// Executive desk: dark veneer top, two pedestals of drawers with brass pulls, a modesty panel. Origin floor
// centre; returns { group, top }.
function spDesk({ w = 2.2, d = 1.0, top = 0.76 } = {}) {
  const g = new THREE.Group();
  const veneer = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 37 }), roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 }), body = pmat("#ffffff", { map: woodTex("#2e1c12"), roughness: 0.5 });
  const brass = pmat("#c9a24e", { metalness: 1, roughness: 0.3 });
  const slab = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [body, body, veneer, body, body, body]); slab.position.y = top - 0.03; g.add(slab);
  const ph = top - 0.06;
  for (const sx of [-1, 1]) {
    const px = sx * (w / 2 - 0.29);
    const ped = new THREE.Mesh(rbox(0.5, ph, d - 0.08, 0.015), body); ped.position.set(px, ph / 2, 0); g.add(ped);
    for (let i = 0; i < 3; i++) {
      const dr = new THREE.Mesh(rbox(0.44, ph / 3 - 0.03, 0.02, 0.006), veneer); dr.position.set(px, ph * (i + 0.5) / 3, (d - 0.08) / 2 + 0.008); g.add(dr);
      const hd = new THREE.Mesh(rbox(0.14, 0.014, 0.02, 0.005), brass); hd.position.set(px, ph * (i + 0.5) / 3 + 0.03, (d - 0.08) / 2 + 0.024); g.add(hd);
    }
  }
  const modesty = new THREE.Mesh(new THREE.BoxGeometry(w - 1.1, ph * 0.7, 0.03), body); modesty.position.set(0, top - 0.06 - ph * 0.35, -d / 2 + 0.1); g.add(modesty);
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top };
}
// Banker's desk lamp: brass base and stem, green glass shade, the bulb glowing under it. API { group, set(k) }
function spDeskLamp() {
  const g = new THREE.Group(), brass = pmat("#c79a45", { metalness: 1, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 32), brass); base.position.y = 0.015; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), brass); stem.position.y = 0.2; g.add(stem);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 12), brass); arm.rotation.z = Math.PI / 2; arm.position.set(0.1, 0.38, 0); g.add(arm);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.1, 32, 1, true), pmat("#1f5c3a", { roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide })); shade.position.set(0.2, 0.36, 0); g.add(shade);
  const bulbM = new THREE.MeshBasicMaterial({ color: "#ffe2a8", toneMapped: false }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 10), bulbM); bulb.position.set(0.2, 0.33, 0); g.add(bulb);
  const halo = sprite(BOKEH, 0.5); halo.material.color.set("#ffd28a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0.2, 0.3, 0); halo.userData.decor = true; g.add(halo);
  const pl = new THREE.PointLight("#ffcf8a", 2.4, 3.5, 1.6); pl.position.set(0.2, 0.3, 0.05); g.add(pl);
  return { group: g, set(k) { pl.intensity = 2.4 * k; halo.material.opacity = 0.8 * k; bulbM.color.set("#ffe2a8").multiplyScalar(0.3 + 0.7 * k); } };
}
// The office around the desk, shared by the desk shots. Returns { C, desk, lamp }.
function spOffice(S, { deskZ = -0.45, wallZ = -2.0, lampAt = [-0.9, -0.3, 0] } = {}) {
  const C = spCabinet({ wallZ, seed: 3 }); S.backdrop(C.group);
  const desk = spDesk(); desk.group.position.z = deskZ; S.add(desk.group); S.solid(desk.group, "mesa");
  const lamp = spDeskLamp(); lamp.group.position.set(lampAt[0], desk.top, deskZ + lampAt[1]); lamp.group.rotation.y = lampAt[2]; S.add(lamp.group);
  return { C, desk, lamp };
}

// ---------------------------------------------------------------- 1 · gancho: a conta do mandato
// Receipt printer: a dark rounded body, the lid, the paper slot on top, a green LED. Origin: bottom centre.
function spReceiptPrinter() {
  const g = new THREE.Group(), body = pmat("#2a2c30", { roughness: 0.35, clearcoat: 0.5 }), dark = mat("#0e0f11", { roughness: 0.6 });
  const b = new THREE.Mesh(rbox(0.52, 0.18, 0.36, 0.04), body); b.position.y = 0.09; g.add(b);
  const lid = new THREE.Mesh(rbox(0.5, 0.03, 0.22, 0.012), pmat("#3a3d42", { roughness: 0.3, clearcoat: 0.6 })); lid.position.set(0, 0.185, 0.05); g.add(lid);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.012, 0.02), dark); slot.position.set(0, 0.196, -0.07); g.add(slot);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), new THREE.MeshBasicMaterial({ color: "#35ff7a", toneMapped: false })); led.position.set(0.2, 0.1, 0.181); g.add(led);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 20), pmat(ORANGE, { roughness: 0.4 })); btn.rotation.x = Math.PI / 2; btn.position.set(0.14, 0.1, 0.182); g.add(btn);
  g.add(contactShadow(0.8, 0.6));
  return { group: g, slot: new V3(0, 0.196, -0.07) };
}
const SP_LINES = [["SALÁRIO", "46.366"], ["GABINETE", "165.806"], ["COTA PARLAMENTAR", "58.475"], ["AUXÍLIO-MORADIA", "4.253"]];
// The bill of one term, month by month (values in R$, the ceiling in Roraima). hi: the SALÁRIO row lit in
// orange, every other line faded.
function spReceiptTex(hi) {
  const c = makeCanvas(560, 900), x = c.getContext("2d"), r = mulberry32(5);
  x.fillStyle = "#fbf8f0"; x.fillRect(0, 0, 560, 900);
  for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.03})`; x.fillRect(r() * 560, r() * 900, 2, 2); }
  const dim = hi ? "#a0968a" : SP_INK, rule = hi ? "#cfc7bd" : "#5a524c";
  x.textBaseline = "middle"; x.textAlign = "center"; x.fillStyle = dim; x.font = "900 50px Inter"; x.fillText("CUSTO DO MANDATO", 280, 70);
  x.font = "700 26px Inter"; x.fillText("DEPUTADO FEDERAL · POR MÊS", 280, 118);
  x.setLineDash([10, 9]); x.strokeStyle = rule; x.lineWidth = 3; x.beginPath(); x.moveTo(24, 152); x.lineTo(536, 152); x.stroke();
  SP_LINES.forEach(([a, b], i) => {
    const y = 220 + i * 92, on = hi && i === 0;
    if (on) { x.fillStyle = ORANGE; roundRect(x, 14, y - 40, 532, 80, 14); x.fill(); }
    x.fillStyle = on ? SP_INK : dim; x.textAlign = "right"; x.font = `900 ${on ? 46 : 38}px Inter`; x.fillText(b, 528, y);
    const room = 496 - x.measureText(b).width - 28; let fs = on ? 44 : 36; x.font = `${on ? 900 : 800} ${fs}px Inter`;
    while (x.measureText(a).width > room && fs > 18) { fs -= 2; x.font = `${on ? 900 : 800} ${fs}px Inter`; }
    x.textAlign = "left"; x.fillText(a, 32, y);
  });
  const ty = 578; x.beginPath(); x.moveTo(24, ty); x.lineTo(536, ty); x.stroke(); x.setLineDash([]);
  x.textAlign = "left"; x.fillStyle = dim; x.font = "900 50px Inter"; x.fillText("TOTAL", 32, ty + 70);
  x.textAlign = "right"; x.fillStyle = hi ? "#dcb0a8" : "#b3241a"; x.fillText("274.900", 528, ty + 70);
  x.textAlign = "center"; x.fillStyle = hi ? "#d8d1c8" : "#6a625a"; x.font = "600 22px Inter"; x.fillText("VALORES EM R$ · TETO EM RORAIMA", 280, ty + 130);
  x.fillStyle = hi ? "#d8d1c8" : "#2a2420"; for (let i = 0; i < 90; i++) if (r() < 0.62) x.fillRect(80 + i * 4.4, ty + 170, 1 + Math.floor(r() * 3), 60);
  const t = texFrom(c); t.anisotropy = 8; return t;
}
// The receipt rising out of the printer slot: set(k) shows the top k of the paper (it comes out top first).
// Origin: the slot (bottom of the paper). API { group, mesh, set(k), hi(on), rowY(i), w, h }
function spReceipt({ w = 0.56, h = 0.9 } = {}) {
  const tN = spReceiptTex(false), tH = spReceiptTex(true);
  const m = pmat("#ffffff", { map: tN, roughness: 0.85, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  const g = new THREE.Group(); g.add(mesh);
  let lit = false;
  const set = (k) => { k = clamp(k); const v = Math.max(0.001, k); mesh.scale.y = v; mesh.position.y = h * v / 2; for (const tx of [tN, tH]) { tx.repeat.set(1, v); tx.offset.set(0, 1 - v); } mesh.visible = k > 0.002; };
  const hi = (on) => { if (on !== lit) { lit = on; m.map = on ? tH : tN; m.needsUpdate = true; } };
  set(1);
  return { group: g, mesh, set, hi, w, h, rowY: (px) => h * (1 - px / 900) };
}
addScene("conta", 0, A.c1, (S) => {
  const O = spOffice(S);
  const pr = spReceiptPrinter(); pr.group.position.set(0.05, O.desk.top, -0.4); S.add(pr.group);
  const rc = spReceipt(); rc.group.position.set(0.05, O.desk.top + pr.slot.y, -0.4 + pr.slot.z); rc.group.rotation.x = -0.1; S.add(rc.group);
  const ink = makeInkMark("POR MÊS", 0.3, 0.12, { seed: 4 }); ink.position.set(0.11, rc.rowY(735), 0.004); ink.rotation.z = 0.1; rc.group.add(ink);
  // the rows around SALÁRIO, for the close-up (no pixels: a framing target)
  const rows = spProxy([-0.28, rc.rowY(360), -0.01], [0.28, rc.rowY(95), 0.01]); rc.group.add(rows);
  const STAMP = A.mil + 0.12, HI = A.salario - 0.15;
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1);
    rc.set(sm(t, 0.12, A.mil - 0.08)); rc.hi(t >= HI);
    const ks = t >= STAMP ? 1 + 0.35 * (1 - eOut(lin(t, STAMP, STAMP + 0.18))) : 0; ink.visible = ks > 0; ink.scale.setScalar(Math.max(0.0001, ks));
    fill.position.set(0.4, 1.7, 1.2); fill.color.set(t >= HI ? "#ffb070" : "#ffd2a0"); fill.intensity = 1.0 + 1.2 * beat(t, STAMP, 0.5) + 0.8 * beat(t, HI, 0.6);
  };
  S.hero(pr.group, "impressora de cupom", { when: (t) => t > 0.9 && t < HI - 0.5 });
  S.hero(rc.group, "conta comprida saindo da impressora", { when: (t) => t > 0.9 && t < HI - 0.5 });
  S.hero(rows, "linha salário acesa na conta", { when: (t) => t > HI + 0.45 });
  S.solid(pr.group, "impressora", { restsOn: ["mesa"] });
  const bAll = envelope([pr.group, rc.group], anim, 0, HI); bAll.expandByScalar(0.03);
  const bRow = envelope([rows], anim, HI, A.c1);
  return (t) => {
    anim(t);
    let p = spTrack(t, [[0, bAll, "push", { from: [0.1, 0.2, 1], pull0: 1.25, pull: 1.02 }], [HI - 0.1, bRow, "drop", { from: [0.04, 0.1, 1], rise: 0.22, pull: 1.04 }]], A.c1, 0.5);
    p = CAM.shake(p, t, STAMP, 0.01, 0.45); spFar(p);
  };
});

// ============================================================ 2 · imagina: você foi eleito deputado federal
// The office: the photo of the Congress in a frame on the desk spins in and lands (DEPUTADO FEDERAL on its
// brass plate), slow push-in on the photo. Orbit.
addScene("eleito", A.c1, A.c2, (S) => {
  const O = spOffice(S);
  const fr = makePhotoFrame("congresso", { w: 0.9, name: "DEPUTADO FEDERAL" }); fr.group.position.set(0.1, O.desk.top, -0.45); S.add(fr.group);
  const IN = A.c1 - 0.05;
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1);
    popIn(fr.group, t, IN, 0.45); fr.frame.rotation.y = 1.5 * (1 - eOut(lin(t, IN, IN + 0.6)));
    fr.zoom(1 + 0.16 * lin(t, IN + 0.3, A.c2));
    fill.position.set(0.3, 1.9, 1.4); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 0.8 * beat(t, A.eleito, 0.6);
  };
  S.hero(fr.group, "porta-retrato do congresso nacional", { when: (t) => t > IN + 0.5 });
  S.solid(fr.group, "porta-retrato", { restsOn: ["mesa"], when: (t) => t > IN + 0.5 });
  const box = envelope([fr.group], anim, IN + 0.6, A.c2);
  return (t) => { anim(t); spFar(CAM.move(box, "orbit", lin(t, A.c1, A.c2), { zone: "stage", from: [0.12, 0.16, 1], deg: 28, pull: 1.03 })); };
});

// ============================================================ 3 · o contracheque e os 29 salários mínimos
// The payslip stands in an acrylic holder on the desk (CONTRACHEQUE, R$ 46.366,19); on "quase vinte e nove"
// 29 bundles of banknotes pop onto the desk, one per minimum wage. Push → reveal.
function spPayslipTex() {
  const c = makeCanvas(500, 660), x = c.getContext("2d"), r = mulberry32(8);
  x.fillStyle = "#f6f3ec"; x.fillRect(0, 0, 500, 660); speckle(x, 500, 660, 12, 2500, 0.03, 0.02, 1.5);
  x.fillStyle = "#1f3a5a"; x.fillRect(0, 0, 500, 96);
  x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 46px Inter"; x.fillText("CONTRACHEQUE", 250, 50);
  x.fillStyle = "#2a2420"; x.font = "700 24px Inter"; x.fillText("DEPUTADO FEDERAL · MENSAL", 250, 132);
  x.fillStyle = "#6a625a"; x.font = "800 24px Inter"; x.textAlign = "left"; x.fillText("SUBSÍDIO BRUTO", 36, 186);
  x.strokeStyle = "rgba(40,30,20,0.25)"; x.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const y = 380 + i * 44; x.beginPath(); x.moveTo(30, y); x.lineTo(470, y); x.stroke(); x.fillStyle = "rgba(40,30,20,0.3)"; x.fillRect(36, y + 16, 140 + r() * 90, 12); x.fillRect(380, y + 16, 60 + r() * 30, 12); }
  return texFrom(c);
}
// Acrylic document holder with the payslip. Origin: floor centre of the base. API { group }
function spPayslipStand() {
  const g = new THREE.Group(), W = 0.5, H = 0.66, tilt = 0.16;
  const base = new THREE.Mesh(rbox(0.6, 0.035, 0.22, 0.01), pmat("#1c1c1e", { roughness: 0.3, clearcoat: 0.8 })); base.position.y = 0.0175; g.add(base);
  const back = new THREE.Group(); back.position.set(0, 0.035, -0.02); back.rotation.x = -tilt; g.add(back);
  const acr = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, H + 0.04, 0.008), glassMat({ opacity: 0.25 })); acr.position.set(0, (H + 0.04) / 2, -0.006); back.add(acr);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(W, H), pmat("#ffffff", { map: spPayslipTex(), roughness: 0.85 })); paper.position.set(0, H / 2 + 0.02, 0.0); back.add(paper);
  const val = makePlate("R$ 46.366,19", W * 0.94, H * 0.18, { bg: "#f6f3ec", fg: "#b3241a", depth: 0.002 }); val.position.set(0, 0.02 + H * (1 - 255 / 660), 0.002); back.add(val);
  g.add(contactShadow(0.8, 0.5));
  return { group: g };
}
addScene("contracheque", A.c2, A.c3, (S) => {
  const O = spOffice(S);
  const slip = spPayslipStand(); slip.group.position.set(0.0, O.desk.top, -0.78); S.add(slip.group);
  const grid = new THREE.Group(); grid.position.y = O.desk.top; S.add(grid);
  const rr = mulberry32(19), bundles = [];
  for (let i = 0; i < 29; i++) {
    const col = i % 6, row = Math.floor(i / 6), b = makeCashBundle({ w: 0.18, d: 0.085, h: 0.055 });
    b.position.set(-0.51 + col * 0.205, 0, -0.5 + row * 0.12); b.rotation.y = (rr() - 0.5) * 0.35; grid.add(b); bundles.push(b);
  }
  const DROP = A.c2 + 0.05, B0 = A.quase + 0.05;
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1);
    const k = eOut(lin(t, DROP, DROP + 0.45)); slip.group.position.y = O.desk.top + 0.22 * (1 - k); slip.group.visible = t >= DROP;
    bundles.forEach((b, i) => popIn(b, t, B0 + i * 0.055, 0.25));
    fill.position.set(0.2, 1.8, 1.4); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 0.8 * beat(t, A.valor, 0.6) + 0.6 * beat(t, A.n29, 0.6);
  };
  const T2 = A.quase - 0.35;
  S.hero(slip.group, "contracheque num suporte de acrílico", { when: (t) => (t > DROP + 0.5 && t < T2 - 0.45) || t > B0 + 1.4 });
  S.hero(grid, "29 maços de dinheiro na mesa", { when: (t) => t > B0 + 1.4 });
  S.solid(slip.group, "contracheque", { restsOn: ["mesa"], when: (t) => t > DROP + 0.5 });
  const bSlip = envelope([slip.group], anim, DROP + 0.5, T2), bAll = envelope([slip.group, grid], anim, B0 + 1.7, A.c3);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c2, bSlip, "push", { from: [-0.15, 0.12, 1], pull0: 1.3, pull: 1.03 }], [T2, bAll, "reveal", { from: [0.08, 0.55, 1], pull0: 1.06, pull: 1.0 }]], A.c3, 0.5));
  };
});

// ============================================================ 4–5 · mas aí chega o resto: a chave, o cartão, a pasta
// Key on a stand: a wooden base, a brass post and an arm the key's bow hangs from. Origin: floor centre.
// API { group, key, swing(a) }
function spKeyStand() {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex({ base: "#4a2c18", seed: 23 }), roughness: 0.35, clearcoat: 0.5 }), brass = pmat("#c99a42", { metalness: 1, roughness: 0.28 });
  const base = new THREE.Mesh(rbox(0.36, 0.05, 0.22, 0.012), wood); base.position.y = 0.025; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.64, 16), brass); post.position.set(-0.15, 0.05 + 0.32, -0.07); g.add(post);
  const armX = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 12), brass); armX.rotation.z = Math.PI / 2; armX.position.set(-0.075, 0.66, -0.07); g.add(armX);
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), brass); elbow.position.set(0, 0.66, -0.07); g.add(elbow);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.13, 12), brass); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0.66, -0.005); g.add(arm);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 10), brass); knob.position.set(0, 0.66, 0.06); g.add(knob);
  const k = makeBigKey({ s: 0.6 }); k.group.position.set(0, 0.66 + 0.027, 0.03); g.add(k.group);
  g.add(contactShadow(0.6, 0.45));
  return { group: g, key: k.group, swing(a) { k.group.rotation.z = a; } };
}
// A bank card standing in a black slotted stand. Origin: floor centre. API { group }
function spCardStand(card) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(card.w * 0.9, 0.045, 0.16, 0.012), pmat("#1a1a1c", { roughness: 0.3, clearcoat: 0.8 })); base.position.y = 0.0225; g.add(base);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(card.w * 0.86, 0.004, 0.022), mat("#050505")); slot.position.set(0, 0.0452, 0); g.add(slot);
  card.group.position.set(0, 0.045 + card.h / 2 - 0.015, 0); card.group.rotation.x = -0.08; g.add(card.group);
  g.add(contactShadow(card.w + 0.3, 0.45));
  return { group: g };
}
// The three things that arrive with the job, on the desk: the key (left), the card (middle), the file (right).
function spPerks(S, desk) {
  const ks = spKeyStand(); ks.group.position.set(-0.82, desk.top, -0.72); S.add(ks.group);
  const kc = makePlaceCard("APTO. FUNCIONAL", { w: 0.46, h: 0.13 }); kc.group.position.set(-0.82, desk.top, -0.44); S.add(kc.group);
  // the card stands on a black riser, above the place cards that land in front of it
  const card = makeBankCard({ name: "COTA PARLAMENTAR", color: SP_NAVY, w: 0.74 });
  card.name.visible = false; const nm = makePlate("COTA PARLAMENTAR", card.w * 0.86, card.h * 0.26, { bg: SP_NAVY, fg: "#ffffff", depth: 0.002 }); nm.position.set(0, -card.h * 0.33, 0.0085); card.group.add(nm);
  const cs = spCardStand(card), cardG = new THREE.Group(); cardG.position.set(0.0, desk.top, -0.72); S.add(cardG);
  const riser = new THREE.Mesh(rbox(0.72, 0.22, 0.25, 0.02), pmat("#1a1a1c", { roughness: 0.3, clearcoat: 0.8 })); riser.position.y = 0.11; cardG.add(riser);
  cs.group.position.y = 0.22; cardG.add(cs.group);
  const file = makeCaseFile("GABINETE", { w: 0.46, d: 0.6 }); file.group.position.set(0.78, desk.top, -0.4); file.group.rotation.y = -0.1; S.add(file.group);
  return { ks, kc, cs: { group: cardG }, card, file };
}
addScene("chave", A.c3, A.c4, (S) => {
  const O = spOffice(S, { lampAt: [0.98, -0.41, Math.PI] }), P = spPerks(S, O.desk), top = O.desk.top;
  const IN = [A.c3 + 0.12, A.c3 + 0.37, A.c3 + 0.62];
  const lands = [[P.ks.group, P.kc.group], [P.cs.group], [P.file.group]];
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1);
    lands.forEach((objs, i) => { const k = eOut(lin(t, IN[i], IN[i] + 0.35)); objs.forEach((o) => { o.visible = t >= IN[i]; o.position.y = top + 0.3 * (1 - k); }); });
    P.ks.swing(0.14 * Math.sin((t - IN[0]) * 3.1) * Math.exp(-0.35 * Math.max(0, t - IN[0])));
    fill.position.set(-0.4, 1.7, 1.2); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 0.7 * beat(t, A.chave, 0.6);
  };
  const T2 = A.chave - 0.4, ALL = IN[2] + 0.4;
  S.hero(P.ks.group, "chave pendurada num suporte", { when: (t) => t > ALL && (t < T2 - 0.45 || t > T2 + 0.45) });
  S.hero(P.cs.group, "cartão num suporte", { when: (t) => t > ALL && t < T2 - 0.45 });
  S.hero(P.file.group, "pasta de arquivo gabinete", { when: (t) => t > ALL && t < T2 - 0.45 });
  S.hero(P.kc.group, "placa apto. funcional", { when: (t) => t > T2 + 0.45 });
  S.solid(P.ks.group, "suporte da chave", { restsOn: ["mesa"], when: (t) => t > ALL }); S.solid(P.cs.group, "suporte do cartão", { restsOn: ["mesa"], when: (t) => t > ALL }); S.solid(P.kc.group, "placa", { restsOn: ["mesa"], when: (t) => t > ALL });
  const bThree = envelope([P.ks.group, P.kc.group, P.cs.group, P.file.group], anim, ALL, T2), bKey = envelope([P.ks.group, P.kc.group], anim, T2, A.c4);
  bKey.expandByScalar(0.04);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c3, bThree, "crane", { from: [0.0, 0.42, 1], rise: 0.25, pull: 1.04 }], [T2, bKey, "orbit", { from: [0.12, 0.16, 1], deg: 30, pull: 1.04 }]], A.c4, 0.55));
  };
});
// The card "COTA PARLAMENTAR"; the four things it pays for land as place cards in front of it, one per word.
addScene("cartao", A.c4, A.c5, (S) => {
  const O = spOffice(S, { lampAt: [0.98, -0.41, Math.PI] }), P = spPerks(S, O.desk), top = O.desk.top;
  const names = [["PASSAGEM", -0.27, -0.48, A.passagem], ["COMBUSTÍVEL", 0.27, -0.48, A.combustivel], ["ESCRITÓRIO", -0.27, -0.13, A.escritorio], ["DIVULGAÇÃO", 0.27, -0.13, A.divulgacao]];
  const cards = names.map(([n, x, z]) => { const c = makePlaceCard(n, { w: 0.5, h: 0.16, bg: "#1c1c1e" }); c.group.position.set(x, top, z); S.add(c.group); return c; });
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1); P.ks.swing(0);
    cards.forEach((c, i) => { const at = names[i][3] - 0.2, k = eOut(lin(t, at, at + 0.3)); c.group.visible = t >= at; c.group.position.y = top + 0.2 * (1 - k); });
    fill.position.set(0.2, 1.6, 1.0); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 0.6 * beat(t, A.v58, 0.6);
  };
  const T2 = A.passagem - 0.55;
  S.hero(P.cs.group, "cartão cota parlamentar no suporte");
  cards.forEach((c, i) => S.hero(c.group, "placa " + names[i][0].toLowerCase(), { when: (t) => t > names[i][3] + 0.15 }));
  cards.forEach((c, i) => S.solid(c.group, "placa " + i, { restsOn: ["mesa"], when: (t) => t > names[i][3] + 0.15 }));
  S.solid(P.cs.group, "suporte do cartão", { restsOn: ["mesa"] });
  const bCard = envelope([P.cs.group], anim, A.c4, T2), bAll = envelope([P.cs.group, ...cards.map((c) => c.group)], anim, A.divulgacao + 0.2, A.c5);
  bCard.expandByScalar(0.05);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c4, bCard, "push", { from: [-0.1, 0.16, 1], pull0: 1.3, pull: 1.04 }], [T2, bAll, "crane", { from: [0.04, 0.55, 1], rise: 0.1, pull: 1.0 }]], A.c5, 0.55));
  };
});

// ============================================================ 6 · a maior fatia: 25 assessores escolhidos por você
// Behind the desk, 25 people in suits walk in row by row from the left and turn to the camera (5 × 5); on
// "escolhidos por você" each one gets an INDICADO badge and the camera pushes onto the badge of the front one.
const SP_SUITS = ["#22252b", "#2b3442", "#3a3f47", "#1f2a3a", "#4a3a30", "#2e2e33", "#384250"];
const SP_SKINS = ["#c8977a", "#8d5a3b", "#e0b296", "#a8714f", "#6b4430", "#d6a585", "#b98364"];
const SP_HAIRS = ["#2a1d16", "#14100c", "#4a3424", "#6b5a4a", "#1a1410"];
addScene("assessores", A.c5, A.c6, (S) => {
  const O = spOffice(S, { deskZ: 0.35, wallZ: -4.2, lampAt: [0.92, -0.3, Math.PI] });
  const file = makeCaseFile("GABINETE", { w: 0.46, d: 0.6 }); file.group.position.set(0.15, O.desk.top, 0.35); file.group.rotation.y = -0.08; S.add(file.group);
  const r = mulberry32(27), people = [];
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    const woman = r() < 0.36, skin = SP_SKINS[Math.floor(r() * SP_SKINS.length)];
    const p = makeDiner({ suit: SP_SUITS[Math.floor(r() * SP_SUITS.length)], skin, hair: SP_HAIRS[Math.floor(r() * SP_HAIRS.length)], tie: woman ? null : ["#5b1b1b", "#1d3557", "#3a3a3a", "#6a4a1a"][Math.floor(r() * 4)], longHair: woman, skirt: woman ? SP_SUITS[Math.floor(r() * 3)] : null });
    const badge = makeIdBadge("INDICADO", { w: 0.18, h: 0.24, band: ORANGE }); badge.group.position.set(0.1, 1.37, 0.13); p.group.add(badge.group);
    const x = (col - 2) * 0.56 + (row % 2 ? 0.14 : 0), z = -0.62 - row * 0.62;
    S.add(p.group); people.push({ p, badge, x, z, row, ph: r() * 6.28, t0: A.c5 + 0.15 + row * 0.42 });
  }
  const crowd = spProxy([-1.5, 0, -3.3], [1.62, 1.86, -0.38]); S.add(crowd);
  const front = people.find((q) => q.row === 0 && Math.abs(q.x) < 0.01);
  const bust = spProxy([-0.3, 1.02, -0.2], [0.3, 1.86, 0.2]); front.p.group.add(bust);
  const WALK = 1.05, BADGE = A.escolhidos - 0.1;
  const anim = (t) => {
    spInLook(O.C, t); O.lamp.set(1);
    for (const q of people) {
      const k = lin(t, q.t0, q.t0 + WALK), ke = sm(t, q.t0, q.t0 + WALK);
      q.p.group.visible = t >= q.t0; q.p.group.position.set(q.x - 3.6 * (1 - ke), 0, q.z);
      const turn = lerp(Math.PI / 2, 0, sm(t, q.t0 + WALK - 0.3, q.t0 + WALK + 0.1));
      q.p.setPose({ walk: (t - q.t0) * 9 + q.ph, swing: k < 1 ? 1 - Math.pow(k, 6) : 0, turn });
      const kb = pop(t, BADGE + (q.row * 5 + (q.x + 1.2) * 2) * 0.012, 0.25); q.badge.group.visible = kb > 0.01; q.badge.group.scale.setScalar(Math.max(0.0001, kb));
    }
    fill.position.set(0, 2.0, 1.4); fill.color.set(t > BADGE ? "#ffb070" : "#ffd9a8"); fill.intensity = 0.9 + 0.9 * beat(t, BADGE, 0.6);
  };
  const ARR = people[people.length - 1].t0 + WALK + 0.2, T2 = A.escolhidos - 0.4;
  S.hero(O.desk.group, "mesa do gabinete", { when: (t) => t < ARR - 1.2 });
  S.hero(crowd, "25 pessoas de terno atrás da mesa", { when: (t) => t > ARR && t < T2 - 0.45 });
  S.hero(bust, "assessor com crachá indicado no peito", { when: (t) => t > BADGE + 0.5 });
  const bCrowd = envelope([crowd, O.desk.group], anim, A.c5, T2), bBadge = envelope([bust], anim, BADGE + 0.3, A.c6);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c5, bCrowd, "truck", { from: [0.15, 0.3, 1], side: 0.32, pull: 1.02 }], [T2, bBadge, "push", { from: [0.06, 0.04, 1], pull0: 1.4, pull: 1.0 }]], A.c6, 0.5));
  };
});

// ============================================================ 7–8 · a analogia: o técnico de futebol
// Team-colour bench with an aluminium frame. Origin: floor centre; faces +z. API { group, top }
function spBench(L = 1.5) {
  const g = new THREE.Group(), alu = pmat("#b9bec4", { metalness: 0.85, roughness: 0.3 }), seatM = pmat("#1f4e8c", { roughness: 0.35, clearcoat: 0.6 });
  const seat = new THREE.Mesh(rbox(L, 0.05, 0.42, 0.02), seatM); seat.position.y = 0.445; g.add(seat);
  const back = new THREE.Mesh(rbox(L, 0.36, 0.04, 0.015), seatM); back.position.set(0, 0.68, -0.23); back.rotation.x = -0.12; g.add(back);
  for (const x of [-L / 2 + 0.12, L / 2 - 0.12]) {
    for (const z of [-0.16, 0.16]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 10), alu); leg.position.set(x, 0.21, z); g.add(leg); }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.36), alu); rail.position.set(x, 0.405, 0); g.add(rail);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 10), alu); up.position.set(x, 0.66, -0.25); g.add(up);
  }
  g.add(contactShadow(L + 0.5, 0.9));
  return { group: g, top: 0.47 };
}
function spStadiumLook(st, t, k = 1) {
  floor.visible = false; st.update(t); st.pitch.setSpot(0); scene.background = SP_SKY;
  key.intensity = 1.7 * k; key.color.set("#eef3ff"); hemi.intensity = 0.5; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#0e1a0e");
  scene.environmentIntensity = 0.45; scene.fog.color.set("#0a1020");
}
const spCoach = () => { const c = makeDiner({ suit: "#1c1f26", tie: "#7a1d1d", skin: "#c8977a", hair: "#3a2a1e" }); return c; };
addScene("tecnico", A.c6, A.c7, (S) => {
  const st = makeStadiumNight({ goal: true, seed: 5 }); S.backdrop(st.group);
  const coach = spCoach(); coach.group.position.set(-0.25, 0, 0); S.add(coach.group);
  const bench = spBench(); bench.group.position.set(1.15, 0, -0.45); bench.group.rotation.y = -0.4; S.add(bench.group);
  const news = makeNewspaper({ masthead: "DIÁRIO DO ESPORTE", headline: "SALÁRIO DO TÉCNICO", w: 0.7, d: 0.88 });
  const GROUND = 0.009; news.group.position.set(1.05, GROUND, 1.35); news.group.rotation.y = -0.12; S.add(news.group);
  const NEWS = A.salario2 - 0.45;
  const anim = (t) => {
    spStadiumLook(st, t);
    coach.setPose({ turn: 0.35 + 0.1 * Math.sin(t * 0.6), look: -0.05 });
    const k = eOut(lin(t, NEWS, NEWS + 0.35)); news.group.visible = t >= NEWS; news.group.position.y = GROUND + 0.35 * (1 - k); news.group.rotation.z = 0.25 * (1 - k);
    fill.position.set(0.3, 1.9, 1.6); fill.color.set("#dfe8ff"); fill.intensity = 0.8 + 0.9 * beat(t, A.manchete, 0.5);
  };
  const T2 = NEWS + 0.15;
  S.hero(coach.group, "técnico de terno no gramado", { when: (t) => t < T2 - 0.45 });
  S.hero(news.group, "jornal salário do técnico no gramado", { when: (t) => t > NEWS + 0.45 });
  S.solid(coach.group, "técnico"); S.solid(bench.group, "banco"); S.solid(news.group, "jornal", { when: (t) => t > NEWS + 0.4 });
  const bCoach = envelope([coach.group], anim, A.c6, T2), bNews = envelope([news.group], anim, NEWS + 0.4, A.c7);
  bNews.expandByScalar(0.06); bCoach.expandByScalar(0.1);
  return (t) => { anim(t); spFar(spTrack(t, [[A.c6, bCoach, "reveal", { from: [-0.18, 0.14, 1], pull0: 1.2, pull: 1.0 }], [T2, bNews, "drop", { from: [0.1, 1.5, 0.6], rise: 0.2, pull: 1.0 }]], A.c7, 0.35), 170); };
});
addScene("comissao", A.c7, A.c8, (S) => {
  const st = makeStadiumNight({ goal: true, seed: 5 }); S.backdrop(st.group);
  const coach = spCoach(); coach.group.position.set(0, 0, 0.45); S.add(coach.group);
  const r = mulberry32(41), xs = [-1.55, -1.0, -0.45, 0.45, 1.0, 1.55];
  const staff = xs.map((x, i) => ({ p: makeDiner({ suit: "#1f4e8c", shirt: "#e9eef6", tie: null, skin: SP_SKINS[(i * 3) % SP_SKINS.length], hair: SP_HAIRS[i % SP_HAIRS.length] }), x, t0: A.comissao - 0.2 + i * 0.2, ph: r() * 6.28 }));
  staff.forEach((s) => S.add(s.p.group));
  const team = spProxy([-1.85, 0, -0.82], [1.85, 1.86, 0.72]); S.add(team);
  // a full-size coach bus (8 m) parked at an angle behind the team, a HOTEL board on its roof
  const bus = makeCityBus({ L: 6.2, W: 2.2, H: 2.6, dest: "HOTEL", color: "#f1ede4", stripe: "#1f4e8c" }); bus.group.rotation.y = -0.4; S.add(bus.group);
  bus.group.traverse((m) => { if (m.userData.plate && m.userData.plate.w === 1.9) m.visible = false; });
  const BUS_AT = new V3(0.5, 0, -3.9), BUS_DIR = new V3(Math.cos(0.4), 0, Math.sin(0.4));
  const busSign = makePlate("HOTEL", 2.6, 0.62, { bg: "#1f4e8c", fg: "#ffffff", depth: 0.06 }); busSign.position.set(-0.5, bus.H + 0.57, 0); bus.group.add(busSign);
  for (const x of [-1.5, 0.5]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), pmat("#2a2d33", { metalness: 0.6, roughness: 0.4 })); leg.position.set(x, bus.H + 0.2, 0); bus.group.add(leg); }
  const B0 = A.onibus - 0.95, B1 = A.onibus + 0.05, WALK = 1.15;
  const anim = (t) => {
    spStadiumLook(st, t);
    st.lights.set(1 - 0.75 * Math.max(beat(t, A.paga - 0.05, 0.3), beat(t, A.todo, 0.3)));
    coach.setPose({ turn: 0.08 * Math.sin(t * 0.7) });
    for (const s of staff) {
      const k = lin(t, s.t0, s.t0 + WALK), ke = sm(t, s.t0, s.t0 + WALK);
      s.p.group.visible = t >= s.t0; s.p.group.position.set(s.x - 4.2 * (1 - ke), 0, -0.55);
      s.p.setPose({ walk: (t - s.t0) * 10 + s.ph, swing: k < 1 ? 1 - Math.pow(k, 6) : 0, turn: lerp(Math.PI / 2, 0, sm(t, s.t0 + WALK - 0.3, s.t0 + WALK + 0.1)) });
    }
    const kb = eOut(lin(t, B0, B1)); bus.group.visible = t >= B0; bus.group.position.copy(BUS_AT).addScaledVector(BUS_DIR, -16 * (1 - kb)); bus.spin(-kb * 30);
    fill.position.set(0, 2.0, 1.8); fill.color.set("#e6eeff"); fill.intensity = 0.8 + 1.2 * beat(t, A.paga, 0.5);
  };
  const ARR = staff[staff.length - 1].t0 + WALK + 0.15, T2 = A.comissao + 0.15, T3 = B0 + 0.1;
  S.hero(coach.group, "técnico de terno", { when: (t) => t < T2 - 0.45 });
  S.hero(team, "comissão técnica atrás do técnico", { when: (t) => t > ARR && t < T3 - 0.45 });
  S.hero(bus.group, "ônibus do time escrito hotel", { when: (t) => t > B1 + 0.1 }); S.hero(team, "comissão técnica na frente do ônibus", { when: (t) => t > B1 + 0.1 });
  S.solid(coach.group, "técnico"); staff.forEach((s, i) => S.solid(s.p.group, "auxiliar " + i, { when: (t) => t > s.t0 + WALK }));
  const bCoach = envelope([coach.group], anim, A.c7, T2), bTeam = envelope([team], anim, T2, T3), bBus = envelope([bus.group, team], anim, B1, A.c8);
  bCoach.expandByScalar(0.08);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c7, bCoach, "reveal", { from: [0.15, 0.12, 1], pull0: 1.25, pull: 1.0 }], [T2, bTeam, "truck", { from: [0.0, 0.2, 1], side: 0.3, pull: 1.04 }], [T3, bBus, "push", { from: [0.12, 0.26, 1], pull0: 1.15, pull: 1.0 }]], A.c8, 0.5), 170);
  };
});

// ============================================================ 9 · somando tudo: o salário é menos de um quinto
// A disc cut in slices of their real share of R$ 274.900 (gabinete 60,3%, cota 21,3%, salário 16,9%, moradia
// 1,5%), on a granite plinth on the Esplanada at night. The slices part on "tudo"; the orange salary slice
// slides out towards the camera on "o salário". Orbit → push.
// API { group, set(spread, liftIdx, lift) } — slice i moves out along its middle by spread (+ lift for liftIdx).
function spCostDisc({ r = 0.66, h = 0.12, parts, shadow = true }) {
  const g = new THREE.Group(), slices = [];
  let a = Math.PI / 2 - parts[0].f * Math.PI; // the first slice is centred towards +z (the camera)
  for (const p of parts) {
    const th = p.f * Math.PI * 2, a0 = a, a1 = a + th, mid = (a0 + a1) / 2; a = a1;
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, r, a0, a1, false); sh.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: Math.max(4, Math.round(72 * p.f)) });
    geo.rotateX(Math.PI / 2); geo.translate(0, h + 0.006, 0);   // shape +y → world +z; extrusion → up
    const sg = new THREE.Group(); g.add(sg);
    sg.add(new THREE.Mesh(geo, pmat(p.color, { roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15, side: THREE.DoubleSide })));
    if (p.label) { const pl = makePlate(p.label, p.lw, p.lh, { bg: p.color, fg: p.fg || "#ffffff", depth: 0.004 }); pl.rotation.x = -Math.PI / 2; pl.position.set(Math.cos(mid) * r * p.lr, h + 0.016, Math.sin(mid) * r * p.lr); sg.add(pl); }
    slices.push({ sg, dir: new V3(Math.cos(mid), 0, Math.sin(mid)) });
  }
  if (shadow) g.add(contactShadow(r * 2.8, r * 2.8));
  return { group: g, slices, set(spread, liftIdx = -1, lift = 0) { slices.forEach((s, i) => s.sg.position.copy(s.dir).multiplyScalar(spread + (i === liftIdx ? lift : 0))); } };
}
const SP_PARTS = [
  { f: 46366.19 / 274899.96, color: ORANGE, fg: SP_INK, label: "SALÁRIO", lw: 0.4, lh: 0.17, lr: 0.74 },
  { f: 4253 / 274899.96, color: "#b89a6a" },
  { f: 165806.07 / 274899.96, color: SP_NAVY, label: "GABINETE", lw: 0.56, lh: 0.17, lr: 0.52 },
  { f: 58474.7 / 274899.96, color: SP_TEAL, label: "COTA", lw: 0.3, lh: 0.14, lr: 0.62 },
];
// The disc stands on a post like a display: granite foot, black steel post up to its hub, the disc facing +z.
function spDiscStand(hubY = 1.2) {
  const g = new THREE.Group(), stone = pmat("#ffffff", { map: tileTex(spStoneTex(), 1, 1), color: "#4a4744", roughness: 0.35, clearcoat: 0.6 }), steel = pmat("#1b1d21", { metalness: 0.7, roughness: 0.35 });
  const base = new THREE.Mesh(rbox(0.9, 0.08, 0.6, 0.02), stone); base.position.set(0, 0.04, -0.1); g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, hubY - 0.08, 16), steel); post.position.set(0, 0.08 + (hubY - 0.08) / 2, -0.1); g.add(post);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 20), steel); hub.rotation.x = Math.PI / 2; hub.position.set(0, hubY, -0.08); g.add(hub);
  g.add(contactShadow(1.3, 1.0));
  return { group: g, hubY };
}
addScene("soma", A.c8, A.c9, (S) => {
  const E = spEsplanada({ seed: 7 }); S.backdrop(E.group);
  const pl = spDiscStand(1.2); S.add(pl.group);
  const disc = spCostDisc({ parts: SP_PARTS, shadow: false }); disc.group.position.set(0, pl.hubY, -0.05); disc.group.rotation.x = Math.PI / 2; S.add(disc.group);
  const OUT = A.salario3 - 0.25;
  const anim = (t) => {
    spOutLook(E, t); E.lamps(1);
    disc.set(0.035 * sm(t, A.tudo - 0.1, A.tudo + 0.5), 0, 0.2 * eOut(lin(t, OUT, OUT + 0.5)));
    disc.slices[0].sg.position.y = 0.1 * eOut(lin(t, OUT, OUT + 0.5));
    fill.position.set(0, pl.hubY + 0.6, 1.6); fill.color.set(t > OUT ? "#ffb070" : "#ffd9a8"); fill.intensity = 1.0 + 1.0 * beat(t, OUT + 0.2, 0.6);
  };
  const T2 = OUT - 0.3;
  S.hero(disc.group, "disco cortado em fatias com rótulos", { when: (t) => t < T2 - 0.45 || t > OUT + 0.55 });
  S.hero(disc.slices[0].sg, "fatia laranja do salário", { when: (t) => t > OUT + 0.55 });
  const bDisc = envelope([disc.group], anim, A.c8, T2), bSal = envelope([disc.group], anim, OUT + 0.5, A.c9);
  bDisc.expandByScalar(0.04); bSal.expandByScalar(0.03);
  return (t) => { anim(t); spFar(spTrack(t, [[A.c8, bDisc, "orbit", { from: [0.0, 0.12, 1], deg: 26, pull: 1.02 }], [T2, bSal, "push", { from: [0.08, 0.1, 1], pull0: 1.2, pull: 1.0 }]], A.c9, 0.55)); };
});

// ============================================================ 10 · vezes 513 deputados: mais de um bilhão e meio por ano
// A model of the Câmara's plenary on a low plinth: green carpet tiers in a half circle, curved wood desks
// and 513 chairs facing the presiding table. On "513" a light comes on at every chair in a wave from left to
// right; on "bilhão" they all pulse. Crane → push.
// API { group, n, light(k, pulse) }
function spHemicycle({ seats = 513, rows = 9, r0 = 0.5, dr = 0.11, step = 0.035, seed = 2 } = {}) {
  const g = new THREE.Group(), R1 = r0 + (rows - 1) * dr, Ro = R1 + 0.08;
  const carpet = pmat("#ffffff", { map: noiseTex({ base: "#cfcfcf", amount: 0.2, seed: 33 }), color: "#3f7a52", roughness: 0.92 }), wood = pmat("#ffffff", { map: woodTex("#6b4a30"), roughness: 0.45, clearcoat: 0.3 });
  const half = (ri, ro, depth, m) => {
    const sh = new THREE.Shape(); sh.absarc(0, 0, ro, 0, Math.PI, false); sh.absarc(0, 0, ri, Math.PI, 0, true); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 64 }); geo.rotateX(-Math.PI / 2);   // shape +y → world -z; extrusion → up
    return new THREE.Mesh(geo, m);
  };
  const pit = half(0.001, r0 - 0.5 * dr, 0.012, [carpet, wood]); g.add(pit);
  for (let i = 0; i < rows; i++) {
    const tier = half(r0 + (i - 0.5) * dr, Ro, step, [carpet, wood]); tier.position.y = i * step; g.add(tier);
    const bench = half(r0 + i * dr - 0.06, r0 + i * dr - 0.038, 0.06, [wood, wood]); bench.position.y = (i + 1) * step; g.add(bench);
  }
  // the presiding table on its dais, facing the seats (towards -z)
  const dais = new THREE.Mesh(rbox(0.9, 0.08, 0.34, 0.02), wood); dais.position.set(0, 0.04, 0.17); g.add(dais);
  const mesa = new THREE.Mesh(rbox(0.8, 0.1, 0.12, 0.02), pmat("#3a2416", { roughness: 0.35, clearcoat: 0.6 })); mesa.position.set(0, 0.13, 0.12); g.add(mesa);
  // seats per row proportional to the row length
  const radii = [...Array(rows).keys()].map((i) => r0 + i * dr), sum = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((rr) => Math.round(seats * rr / sum)); counts[rows - 1] += seats - counts.reduce((a, b) => a + b, 0);
  const chairM = pmat("#2c5a40", { roughness: 0.5, clearcoat: 0.4 });
  const seatI = new THREE.InstancedMesh(rbox(0.036, 0.02, 0.034, 0.006), chairM, seats), backI = new THREE.InstancedMesh(rbox(0.036, 0.05, 0.01, 0.004), chairM, seats);
  const lightI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.017, 10, 8), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), seats);
  const d = new THREE.Object3D(), info = [];
  let j = 0;
  radii.forEach((rr, i) => {
    const n = counts[i], y = (i + 1) * step;
    for (let k = 0; k < n; k++) {
      const a = lerp(0.1, Math.PI - 0.1, n === 1 ? 0.5 : k / (n - 1)), x = rr * Math.cos(a), z = -rr * Math.sin(a), yaw = Math.atan2(-x, -z);
      d.position.set(x, y + 0.025, z); d.rotation.set(0, yaw, 0); d.scale.setScalar(1); d.updateMatrix(); seatI.setMatrixAt(j, d.matrix);
      d.position.set(x - Math.sin(yaw) * 0.018, y + 0.055, z - Math.cos(yaw) * 0.018); d.updateMatrix(); backI.setMatrixAt(j, d.matrix);
      info.push({ p: new V3(x - Math.sin(yaw) * 0.018, y + 0.095, z - Math.cos(yaw) * 0.018), u: a / Math.PI });
      j++;
    }
  });
  seatI.instanceMatrix.needsUpdate = true; backI.instanceMatrix.needsUpdate = true;
  const ON = new THREE.Color(ORANGE), HOT = new THREE.Color("#ffe08a");
  info.forEach((s, i) => lightI.setColorAt(i, ON));
  g.add(seatI, backI, lightI);
  // behind the presiding table: the wood wall with the two vote panels (rows of names lit), facing the seats
  const wall = new THREE.Mesh(rbox(2.4, 0.8, 0.06, 0.015), pmat("#ffffff", { map: woodTex("#4a3020"), roughness: 0.45, clearcoat: 0.4 })); wall.position.set(0, 0.4, 0.6); g.add(wall);
  const pc = makeCanvas(256, 160), px = pc.getContext("2d"), pr = mulberry32(seed + 9);
  px.fillStyle = "#06122a"; px.fillRect(0, 0, 256, 160); px.fillStyle = "#1d4fa0"; px.fillRect(0, 0, 256, 18);
  for (let c = 0; c < 3; c++) for (let rI = 0; rI < 12; rI++) { px.fillStyle = pr() < 0.5 ? "#7fe08a" : "#e8f0ff"; px.fillRect(8 + c * 84, 26 + rI * 11, 40 + pr() * 30, 5); }
  const panelM = new THREE.MeshBasicMaterial({ map: texFrom(pc), toneMapped: false });
  for (const sx of [-1, 1]) { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.48), panelM); sc.rotation.y = Math.PI; sc.position.set(sx * 0.6, 0.45, 0.569); g.add(sc); }
  g.add(contactShadow(Ro * 2.4, Ro * 1.6));
  const col = new THREE.Color();
  function light(k, pulse = 0) {
    info.forEach((s, i) => {
      const on = s.u <= k * 1.02 && k > 0;
      d.position.copy(s.p); d.rotation.set(0, 0, 0); d.scale.setScalar(on ? 1 + 0.7 * pulse : 0.0001); d.updateMatrix(); lightI.setMatrixAt(i, d.matrix);
      lightI.setColorAt(i, col.copy(ON).lerp(HOT, pulse));
    });
    lightI.instanceMatrix.needsUpdate = true; lightI.instanceColor.needsUpdate = true; lightI.visible = k > 0;
  }
  light(0);
  return { group: g, n: seats, light, R: Ro };
}
addScene("plenario", A.c9, A.c10, (S) => {
  const E = spEsplanada({ seed: 9 }); S.backdrop(E.group);
  const pl = makeLabelPlinth(null, { w: 3.5, h: 0.22, d: 2.4 }); S.add(pl.group);
  const hc = spHemicycle(); hc.group.position.set(0, pl.top, -0.45); hc.group.rotation.y = Math.PI; S.add(hc.group);   // seats towards the camera, the presiding table and the panels behind
  const W0 = A.n513 - 0.15, W1 = A.deputados + 0.35;
  const anim = (t) => {
    spOutLook(E, t); E.lamps(1 - 0.5 * beat(t, A.bilhao, 0.8));
    hc.light(sm(t, W0, W1), beat(t, A.bilhao - 0.1, 0.9));
    fill.position.set(0, 1.6, 2.0); fill.color.set("#ffb070"); fill.intensity = 0.6 + 0.8 * sm(t, W0, W1) + 1.0 * beat(t, A.bilhao, 0.8);
  };
  S.hero(hc.group, "maquete do plenário com cadeiras acesas");
  const box = envelope([hc.group], anim, A.c9, A.c10); box.expandByScalar(0.03);
  const T2 = A.estrutura - 0.6;
  return (t) => { anim(t); spFar(spTrack(t, [[A.c9, box, "crane", { from: [0.0, 0.42, 1], rise: 0.12, pull: 1.04 }], [T2, box, "push", { from: [0.22, 0.52, 1], pull0: 1.2, pull: 1.0 }]], A.c10, 0.6)); };
});

// ============================================================ 11 · só os salários: 513 deputados e 81 senadores
// The Esplanada: the plenary of the Câmara and the Senate's in two frames (CÂMARA · 513, SENADO · 81) and,
// between them in front, a column of gold coins that rises on "somam" to "trezentos e trinta milhões".
// Orbit on the column → reveal to the frames → crane up with the column.
// Light granite plinth with a dark band at the top edge. Origin: floor centre. API { group, top }
function spPlinth(w, h, d) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(rbox(w, h, d, 0.025), pmat("#ffffff", { map: tileTex(spStoneTex(), w / 2, h / 2 + 0.2), color: "#a09a92", roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.2 })); b.position.y = h / 2; g.add(b);
  const band = new THREE.Mesh(rbox(w + 0.03, 0.04, d + 0.03, 0.012), pmat("#2a2724", { roughness: 0.4, clearcoat: 0.6 })); band.position.y = h - 0.02; g.add(band);
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
addScene("salarios", A.c10, A.c11, (S) => {
  const E = spEsplanada({ seed: 11 }); S.backdrop(E.group);
  const deck = spPlinth(3.9, 0.45, 1.6); deck.group.position.z = 0.1; S.add(deck.group);
  const fC = makePhotoFrame("plenario", { w: 1.3, name: "CÂMARA · 513" }); fC.group.position.set(-0.69, deck.top, -0.1); fC.group.rotation.y = 0.18; S.add(fC.group);
  const fS = makePhotoFrame("senado", { w: 1.3, name: "SENADO · 81" }); fS.group.position.set(0.69, deck.top, -0.1); fS.group.rotation.y = -0.18; S.add(fS.group);
  const col = makeCoinColumn(44, { r: 0.15, t: 0.03, seed: 4 }); col.group.position.set(0, deck.top, 0.64); S.add(col.group);
  const IN_C = A.n513b - 0.3, IN_S = A.n81 - 0.35, UP0 = A.somam - 0.1, UP1 = A.v330 + 0.6;
  const anim = (t) => {
    spOutLook(E, t); E.lamps(1);
    popIn(fC.group, t, IN_C, 0.45); fC.frame.rotation.y = 1.4 * (1 - eOut(lin(t, IN_C, IN_C + 0.6))); fC.zoom(1 + 0.12 * lin(t, IN_C, A.c11));
    popIn(fS.group, t, IN_S, 0.45); fS.frame.rotation.y = -1.4 * (1 - eOut(lin(t, IN_S, IN_S + 0.6))); fS.zoom(1.22 + 0.12 * lin(t, IN_S, A.c11));
    const part = sm(t, UP0 - 0.3, UP0 + 0.5); fC.group.position.x = -lerp(0.69, 1.15, part); fS.group.position.x = lerp(0.69, 1.15, part);
    col.set(lerp(0.12, 1, sm(t, UP0, UP1)));
    fill.position.set(0, 1.6, 1.8); fill.color.set("#ffd28a"); fill.intensity = 0.8 + 1.0 * beat(t, A.v330, 0.7);
  };
  const T2 = IN_C - 0.15, T25 = IN_S - 0.2, T3 = UP0 - 0.35;
  S.hero(col.group, "pilha de moedas douradas", { when: (t) => t < T2 - 0.45 || t > UP0 + 1.2 });
  S.hero(fC.group, "porta-retrato plenário da câmara", { when: (t) => t > IN_C + 0.55 && t < T3 - 0.45 && (t < T25 - 0.45 || t > T25 + 0.45) });
  S.hero(fS.group, "porta-retrato plenário do senado", { when: (t) => t > IN_S + 0.55 && t < T3 - 0.45 });
  S.solid(deck.group, "plataforma"); S.solid(col.group, "pilha", { restsOn: ["plataforma"] }); S.solid(fC.group, "quadro câmara", { restsOn: ["plataforma"], when: (t) => t > IN_C + 0.5 }); S.solid(fS.group, "quadro senado", { restsOn: ["plataforma"], when: (t) => t > IN_S + 0.5 });
  const bCol0 = envelope([col.group], anim, A.c10, T2), bCam = envelope([fC.group], anim, IN_C + 0.6, T25), bFrames = envelope([fC.group, fS.group], anim, IN_S + 0.6, T3), bUp = envelope([col.group], anim, UP1, A.c11);
  bCol0.expandByScalar(0.12); bUp.expandByScalar(0.2);
  return (t) => {
    anim(t);
    spFar(spTrack(t, [[A.c10, bCol0, "orbit", { from: [0.1, 0.3, 1], deg: 30, pull: 1.0 }], [T2, bCam, "push", { from: [0.12, 0.18, 1], pull0: 1.25, pull: 1.04 }], [T25, bFrames, "truck", { from: [0.0, 0.2, 1], side: 0.25, pull: 1.0 }], [T3, bUp, "crane", { from: [0.05, 0.3, 1], rise: 0.25, pull: 1.04 }]], A.c11, 0.55));
  };
});

// ============================================================ 12 · dividido por 213 milhões: R$ 1,55 por pessoa
// The column of coins comes apart: it sinks into the plinth top coin by coin while coins rain down onto the
// paving behind and around it; then three Brazilian coins land standing on the plinth: one real
// (bimetallic), fifty centavos and five centavos. Drop → push.
function spCoinFaceTex(big, small, inner, outer) {
  const c = makeCanvas(256, 256), x = c.getContext("2d");
  x.fillStyle = outer; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
  x.fillStyle = inner; x.beginPath(); x.arc(128, 128, 88, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "rgba(40,28,10,0.45)"; x.lineWidth = 5; x.beginPath(); x.arc(128, 128, 118, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "rgba(40,28,10,0.8)"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 104px Inter"; x.fillText(big, 128, 116);
  x.font = "800 24px Inter"; x.fillText(small, 128, 184);
  return texFrom(c);
}
// Coin standing on its edge, face +z. Origin: the contact point on the floor. API { group, r }
function spBrCoin({ r, t = 0.02, big, small, inner, outer }) {
  const g = new THREE.Group(), body = new THREE.Group(); body.position.y = r; g.add(body);
  const edge = pmat(outer, { metalness: 0.9, roughness: 0.32 });
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 56), edge); cyl.rotation.x = Math.PI / 2; body.add(cyl);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.995, 56), new THREE.MeshStandardMaterial({ map: spCoinFaceTex(big, small, inner, outer), metalness: 0.65, roughness: 0.33 })); face.position.z = t / 2 + 0.0008; body.add(face);
  const backF = new THREE.Mesh(new THREE.CircleGeometry(r * 0.995, 56), new THREE.MeshStandardMaterial({ map: spCoinFaceTex("", "BRASIL", inner, outer), metalness: 0.65, roughness: 0.33 })); backF.rotation.y = Math.PI; backF.position.z = -t / 2 - 0.0008; body.add(backF);
  return { group: g, r };
}
// Coins falling all around (backdrop): from high up onto the paving, where they come to rest flat.
function spCoinRain({ n = 150, t0, seed = 6, top = 0 }) {
  const r = mulberry32(seed), m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 24), pmat("#d4a640", { metalness: 1, roughness: 0.3 }), n), d = new THREE.Object3D(), items = [];
  for (let i = 0; i < n; i++) {
    let x = (r() - 0.5) * 6, z = -0.8 - r() * 3.2; if (r() < 0.35) { x = (r() < 0.5 ? -1 : 1) * (1.05 + r() * 1.8); z = (r() - 0.5) * 2.4; }
    items.push({ x, z, s: t0 + r() * 1.5, h: 3.5 + r() * 2.5, rx: r() * 6, rz: r() * 6, spin: 4 + r() * 8, yaw: r() * 6.28 });
  }
  m.userData.decor = true; m.frustumCulled = false;
  function update(t) {
    items.forEach((it, i) => {
      const dt = t - it.s;
      if (dt < 0) { d.scale.setScalar(0.0001); d.position.set(it.x, -1, it.z); }
      else {
        const y = it.h - 0.5 * 9.8 * dt * dt, landed = y <= 0.004;
        d.scale.setScalar(1); d.position.set(it.x, landed ? 0.0035 + top : y, it.z);
        d.rotation.set(landed ? 0 : it.rx + dt * it.spin, it.yaw, landed ? 0 : it.rz + dt * it.spin * 0.6);
      }
      d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh: m, update };
}
addScene("porpessoa", A.c11, A.c12, (S) => {
  const E = spEsplanada({ seed: 11 }); S.backdrop(E.group);
  const pl = spPlinth(1.5, 0.6, 1.0); S.add(pl.group);
  const col = makeCoinColumn(44, { r: 0.15, t: 0.03, seed: 4 }); col.group.position.set(0, pl.top, -0.05); S.add(col.group);
  const rain = spCoinRain({ t0: A.dividido + 0.05 }); S.backdrop(rain.mesh);
  const coins = [
    spBrCoin({ r: 0.122, big: "1", small: "REAL", inner: "#d8dadc", outer: "#d4a640" }),
    spBrCoin({ r: 0.104, big: "50", small: "CENTAVOS", inner: "#cfd2d6", outer: "#c2c6cb" }),
    spBrCoin({ r: 0.098, big: "5", small: "CENTAVOS", inner: "#c8784a", outer: "#b8693e" }),
  ];
  const xs = [-0.32, 0.0, 0.3], LAND = [A.v155 - 0.25, A.v155 + 0.05, A.v155 + 0.35];
  // each coin lands into a slotted wooden display base
  const SLOT = 0.03, bases = coins.map((c, i) => {
    const b = new THREE.Group(); b.position.set(xs[i], pl.top, 0.3); S.add(b);
    const blk = new THREE.Mesh(rbox(c.r * 1.7, SLOT, 0.08, 0.008), pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 41 + i }), roughness: 0.35, clearcoat: 0.6 })); blk.position.y = SLOT / 2; b.add(blk);
    const groove = new THREE.Mesh(new THREE.BoxGeometry(c.r * 1.2, 0.002, 0.026), mat("#0c0806")); groove.position.y = SLOT + 0.001; b.add(groove);
    c.group.position.set(0, SLOT - 0.012, 0); b.add(c.group); return b;
  });
  const anim = (t) => {
    spOutLook(E, t); E.lamps(1); rain.update(t);
    const kc = 1 - sm(t, A.dividido + 0.05, A.n213 + 0.9); col.set(kc); col.group.visible = kc > 0.02;
    coins.forEach((c, i) => { const k = lin(t, LAND[i], LAND[i] + 0.4); c.group.visible = t >= LAND[i]; c.group.position.y = SLOT - 0.012 + 0.6 * (1 - eOut(k)) + 0.03 * Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k); bases[i].rotation.y = (i - 1) * 0.08; c.group.rotation.y = 0.25 * (1 - k) * (i - 1); });
    fill.position.set(0, pl.top + 1.2, 1.5); fill.color.set("#ffd28a"); fill.intensity = 0.8 + 1.0 * beat(t, A.v155, 0.7);
  };
  const T2 = LAND[0] - 0.25;
  S.hero(col.group, "pilha de moedas no pedestal", { when: (t) => t < A.dividido + 0.5 });
  S.hero(pl.group, "pedestal de granito", { when: (t) => t > A.dividido + 0.5 && t < T2 - 0.45 });
  coins.forEach((c, i) => S.hero(c.group, ["moeda de um real", "moeda de cinquenta centavos", "moeda de cinco centavos"][i], { when: (t) => t > LAND[i] + 0.45 }));
  S.solid(pl.group, "pedestal"); bases.forEach((b, i) => S.solid(b, "base " + i, { restsOn: ["pedestal"] }));
  const bTop = envelope([pl.group, col.group], anim, A.c11, T2), bCoins = envelope(bases, anim, LAND[2] + 0.45, A.c12);
  bCoins.expandByScalar(0.05);
  return (t) => { anim(t); spFar(spTrack(t, [[A.c11, bTop, "drop", { from: [0.0, 0.3, 1], rise: 0.15, pull: 1.04 }], [T2, bCoins, "push", { from: [0.05, 0.14, 1], pull0: 1.25, pull: 1.0 }]], A.c12, 0.55)); };
});

// ============================================================ 13 · isso é só o Congresso: 58 mil vereadores
// The map room: a model of South America on the floor with Brazil raised and the rest dimmed; the Congress
// in miniature stands on Brasília. Then the camera rises over the whole country while lights come on in its
// cities (denser in the east and south, as the towns are), and they twinkle: each city sets its own pay.
// Orbit on the miniature → crane over Brazil.
function spInBrazil(lo, la) {
  let inside = false;
  for (const rg of SA_RINGS.BRA) for (let i = 0, j = rg.length - 2; i < rg.length; j = i, i += 2) {
    const xi = rg[i], yi = rg[i + 1], xj = rg[j], yj = rg[j + 1];
    if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
addScene("vereadores", A.c12, A.c13, (S) => {
  const off = makeOfficeSet({ wallZ: -4.6, clear: 2.4, wall: "#4e3e33", seed: 8 }); S.backdrop(off.group);
  const map = makeSouthAmericaMap(); S.add(map.group);
  const BH = 0.08; map.set("BRA", BH); map.color("BRA", "#3f7a4f"); map.dim(["BRA"], 0.72);
  const mini = makeCongressBuilding(); mini.group.scale.setScalar(0.055); mini.glow(1);
  mini.group.position.copy(map.pt(-47.93, -15.78, BH)); map.group.add(mini.group);
  // the cities: random points inside Brazil, kept with a lower chance west of 55°W (the Amazon is sparse)
  const r = mulberry32(58), N = 1700, dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), N), dd = new THREE.Object3D(), ph = [];
  let n = 0;
  while (n < N) {
    const lo = -74 + r() * 40, la = -33.8 + r() * 39;
    if (!spInBrazil(lo, la) || (lo < -55 && r() > 0.22) || Math.hypot(lo + 47.93, la + 15.78) < 1.6) continue;
    dd.position.copy(map.pt(lo, la, BH + 0.004)); dd.updateMatrix(); dots.setMatrixAt(n, dd.matrix); dots.setColorAt(n, new THREE.Color(ORANGE)); ph.push([r() * 6.28, 1.5 + r() * 3]); n++;
  }
  dots.count = 0; dots.userData.decor = true; map.group.add(dots);
  const TONES = [new THREE.Color("#ffd08a"), new THREE.Color(ORANGE), new THREE.Color("#fff1d6")], cc = new THREE.Color();
  const D0 = A.n58 - 0.2, D1 = A.vereadores + 0.6, TW = A.cada - 0.1;
  const anim = (t) => {
    floor.visible = false; off.update(t); off.lights(1); off.windows(1); scene.background = BACKDROP;
    key.intensity = 1.5; key.color.set("#ffd6b0"); hemi.intensity = 0.42; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c"); scene.fog.color.set("#120e0c");
    map.glow("BRA", 0.35 * sm(t, D0, D1), "#ffcf8a");
    const km = 1 - sm(t, A.brasil - 0.2, A.brasil + 0.5); mini.group.scale.setScalar(Math.max(0.0001, 0.055 * km)); mini.group.visible = km > 0.01;
    dots.count = Math.round(N * sm(t, D0, D1)); dots.visible = dots.count > 0;
    const tw = sm(t, TW, TW + 0.4);
    for (let i = 0; i < dots.count; i++) { const [p0, f] = ph[i], v = 0.5 + 0.5 * Math.sin(t * f + p0); cc.copy(TONES[1]).lerp(TONES[i % 3 === 0 ? 0 : 2], tw * v).multiplyScalar(1 - 0.45 * tw * (1 - v)); dots.setColorAt(i, cc); }
    if (dots.instanceColor) dots.instanceColor.needsUpdate = true;
    fill.position.set(0, 2.0, 1.6); fill.color.set("#ffd9a8"); fill.intensity = 0.7 + 0.6 * beat(t, A.congresso, 0.6);
  };
  const T2 = A.brasil - 0.45;
  S.hero(mini.group, "congresso em miniatura no mapa", { when: (t) => t < T2 - 0.45 });
  S.hero(map.countries.BRA.grp, "mapa do brasil em relevo", { when: (t) => t > T2 + 0.6 });
  const bMini = envelope([mini.group], anim, A.c12, T2); bMini.expandByScalar(0.08);
  const bBra = envelope([map.countries.BRA.grp], anim, T2, A.c13);
  return (t) => { anim(t); CAM.apply(spTrack(t, [[A.c12, bMini, "orbit", { from: [0.15, 0.45, 1], deg: 34, pull: 1.06 }], [T2, bBra, "crane", { from: [0.0, 0.8, 1], rise: 0.15, pull: 1.02 }]], A.c13, 0.8)); };
});

// ============================================================ 14 · político deveria ganhar menos, ou salário alto atrai gente melhor?
// The office at night, a brass two-pan scale in front of the glass wall: MENOS with a short stack of coins on
// the left pan, ALTO with a tall one on the right; it dips left on "menos", right on "alto", and keeps
// swinging. Reveal → orbit.
addScene("pergunta", A.c13, A.end, (S) => {
  const C = spCabinet({ wallZ: -2.0, seed: 3 }); S.backdrop(C.group);
  const sc = makeTwoPanScale({ arm: 0.72, height: 1.2, panR: 0.44, chain: 0.55 }); sc.group.position.set(0, 0, -0.35); S.add(sc.group);
  const pans = [["MENOS", 4], ["ALTO", 11]].map(([label, n], i) => {
    const c = makeCoinColumn(n, { r: 0.1, t: 0.03, seed: 7 + i }); sc.holders[i].add(c.group); c.set(1);
    const pc = makePlaceCard(label, { w: 0.56, h: 0.26, bg: i ? SP_NAVY : "#1c1c1e" }); pc.group.position.set((i ? 1 : -1) * 0.72, 0, 0.45); sc.group.add(pc.group);
    return { c, pc };
  });
  const anim = (t) => {
    spInLook(C, t);
    sc.tilt(0.13 * Math.sin((t - A.menos + 0.8) * 1.96) * sm(t, A.c13, A.c13 + 0.6));
    fill.position.set(0, 1.9, 1.6); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 0.6 * Math.max(beat(t, A.menos, 0.6), beat(t, A.alto, 0.6));
  };
  S.hero(sc.group, "balança de dois pratos menos e alto");
  const box = envelope([sc.group], anim, A.c13, A.end); box.expandByScalar(0.03);
  const T2 = A.ou2 - 0.2;
  return (t) => { anim(t); spFar(spTrack(t, [[A.c13, box, "reveal", { from: [0.0, 0.22, 1], pull0: 1.08, pull: 1.0 }], [T2, box, "orbit", { from: [0.0, 0.25, 1], deg: 24, pull: 1.0 }]], A.end, 0.6)); };
});
