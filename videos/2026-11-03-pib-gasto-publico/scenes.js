// ============================================================================
// videos/2026-11-03-pib-gasto-publico/scenes.js
// O PIB e o gasto público. Gancho: "Dá pra fazer o PIB crescer sem o país ficar mais rico." → está na
// própria conta → imagina a manchete "o Brasil cresceu" → a fórmula PIB = C + I + G + (X − M), uma letra
// por pedestal com a sua pilha de moedas (famílias ~63%, investimento ~17%, governo ~19%, X − M ≈ 0) →
// o G mede o gasto, não a entrega (a régua do PIB mede a pilha, a escola fica de fora) → gastou mais, o PIB
// sobe; imposto ou dívida, a conta não pergunta → analogia: o vizinho visto da rua (carro novo, churrasco;
// aumento ou cartão? o PIB vê o churrasco, não vê a fatura) → 12 meses: governo +2,8%, famílias +0,9%,
// investimento −0,2% → a dívida a 82,9% do PIB → gasto público não é vilão (escola, hospital, estrada) →
// motor ou conta pro futuro? Sem nome de governo nem rosto de político. Números em fatos.md.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / shotTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  rico: 3.08, c1: 3.5,
  mentira: 4.0, conta: 5.84, c2: 6.8,
  imagina: 6.92, manchete: 8.2, brasil: 9.06, cresceu: 9.52, mas: 10.4, como: 11.24, c3: 11.72,
  soma: 12.42, produz: 13.72, separado: 14.58, quatro: 16.3, letras: 16.7, c4: 17.4,
  C: 17.58, familias: 18.2, sessenta: 19.6, c5: 20.8,
  I: 20.82, invest: 21.76, maquinas: 22.62, fabricas: 23.34, obras: 24.2, dezessete: 25.0, c6: 26.3,
  G: 26.32, governo: 27.24, quinto: 28.14, c7: 28.65,
  X: 28.94, M: 29.52, X2: 30.12, vende: 31.28, fora: 31.98, M2: 32.4, compra: 33.28, quase: 34.04, cancela: 34.46, c8: 35.4,
  repara: 35.74, G2: 36.4, mede: 37.14, gasta: 38.52, nao: 39.38, entrega: 40.02, c9: 40.52,
  gastou: 40.56, sobe: 41.98, mesmo: 42.7, servico: 43.6, nem: 44.84, pergunta: 45.16, imposto: 46.2, divida: 47.42, c10: 47.8,
  vizinho: 48.34, carro: 49.0, novo: 49.34, churrasco: 49.96, rua: 52.08, parece: 52.96, rico2: 54.06, c11a: 54.6,
  aumento: 55.06, ou: 55.5, cartao: 56.76, c11b: 57.42,
  olha: 57.92, ve: 59.18, churrasco2: 59.52, naove: 60.28, fatura: 60.88, c11: 61.38,
  doze: 62.44, cresceu2: 63.76, um9: 64.26, gasto: 66.48, tres: 67.88, familias2: 69.44, invest2: 70.48, parado: 71.42, c12: 72.05,
  fatura2: 72.46, divida2: 73.28, oitenta: 74.74, pib4: 76.4, c13: 76.95,
  vilao: 78.26, escola: 78.64, hospital: 79.6, estrada: 80.36, produzir: 81.68, depende: 82.88, dinheiro: 84.48, qualquer: 85.3, c14: 86.4,
  eai: 86.6, puxado: 87.28, motor: 89.3, economia: 89.88, ou2: 90.5, conta2: 90.9, futuro: 91.5, end: 94.0,
};

// ---------------------------------------------------------------- shared looks
function pibOfficeLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.8; key.color.set("#ffd6b0"); hemi.intensity = 0.45; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
function pibHallLook(hall, t) {
  floor.visible = false; hall.update(t);
  key.intensity = 2.0; key.color.set("#ffe6cc"); hemi.intensity = 0.5; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#141216");
  scene.fog.color.set("#0a0e16");
}
const PIB_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#040812"); g.addColorStop(0.5, "#0d1a34"); g.addColorStop(0.8, "#25284a"); g.addColorStop(1, "#4a2e2a"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function pibStreetLook() {
  scene.background = PIB_NIGHT; floor.visible = false;
  key.intensity = 1.5; key.color.set("#c9d8ff"); hemi.intensity = 0.42; hemi.color.set("#9fb6e8"); hemi.groundColor.set("#141210");
  scene.fog.color.set("#0b1222");
}
// Outdoor shots: keep the far side of the street out of the camera's fog.
function pibFar(p, far = 70) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 12); scene.fog.far = Math.max(scene.fog.far, far); }

// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...]. Each
// framing runs its own camera move over its own time; the camera eases into the next one over `ease` s.
function shotTrack(t, segs, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : t0 + 4;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
const inside = (t, a, b) => t >= a && t < b;

// ---------------------------------------------------------------- small pieces of this video
// Dark wooden desk (office of act 1). Origin floor; top at y = top. Returns the top height.
function makePibDesk(S, { w = 2.6, d = 1.3, top = 0.75 } = {}) {
  const mt = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 31 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; S.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); S.add(l); }
  return top;
}
// Glossy bar of a chart. Origin floor centre; set(h) sets its height.
function makePibBar(color, { w = 0.5, d = 0.5 } = {}) {
  const m = new THREE.Mesh(rbox(w, 1, d, 0.03), pmat(color, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const g = new THREE.Group(); g.add(m);
  return { group: g, mesh: m, set(h) { const hh = Math.max(0.001, h); m.scale.y = hh; m.position.y = hh / 2; m.visible = h > 0.002; } };
}
// Falling coins (instanced, a pure function of t): from a spout to a landing point, `rate` 0..1 of them on.
function makePibCoinRain(S, n = 14, r = 0.06) {
  const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, 0.014, 24), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 }), n), o = new THREE.Object3D();
  m.frustumCulled = false; m.userData.decor = true; S.add(m);
  return (t, from, to, rate) => {
    for (let i = 0; i < n; i++) {
      const ph = (t * 1.5 + i / n) % 1, on = i / n < rate;
      o.position.set(lerp(from.x, to.x, ph) + Math.sin(i * 2.3) * 0.025, on ? lerp(from.y, to.y, ph * ph) : -50, lerp(from.z, to.z, ph) + Math.cos(i * 1.7) * 0.025);
      o.rotation.set(ph * 8 + i, i, ph * 5); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };
}
// Sheet of paper lying flat with `text` printed big and an orange `badge` next to it (shown with badge(k)).
// Origin: table top, centre. API { group, badge(k) }
function makePibSheet(text, badge, { w = 0.6, d = 0.42 } = {}) {
  const g = new THREE.Group(), paper = "#f4efe4";
  const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.003, d), pmat(paper, { roughness: 0.92 })); s.position.y = 0.0015; g.add(s);
  const p = makePlate(text, w * 0.62, d * 0.3, { bg: paper, fg: "#1c1410", depth: 0.002 }); p.rotation.x = -Math.PI / 2; p.position.set(-w * 0.12, 0.004, 0); g.add(p);
  const b = makePlate(badge, d * 0.3, d * 0.3, { bg: ORANGE, fg: "#ffffff", depth: 0.004 }); b.rotation.x = -Math.PI / 2; b.position.set(w * 0.32, 0.005, 0); g.add(b);
  const pencil = new THREE.Group(); pencil.position.set(w * 0.05, 0.012, d * 0.36); pencil.rotation.y = 0.25; g.add(pencil);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.3, 6), pmat("#e8b730", { roughness: 0.5 })); body.rotation.z = Math.PI / 2; pencil.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.04, 6), pmat("#e9d2a8", { roughness: 0.7 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.17; pencil.add(tip);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.014, 6), pmat("#2a2a2a", { roughness: 0.4 })); lead.rotation.z = -Math.PI / 2; lead.position.x = 0.197; pencil.add(lead);
  const sh = contactShadow(w + 0.2, d + 0.2); sh.position.y = 0.001; g.add(sh);   // inside the paper: above it, it stains the sheet
  return { group: g, badge: (k) => { b.visible = k > 0.01; b.scale.setScalar(Math.max(0.0001, k)); } };
}
// The news app on the phone: "O BRASIL CRESCEU" with a green arrow; `q` 0..1 pops an orange "?" over it.
function pibPaintNews(ph, q) {
  const key0 = Math.round(q * 40); if (ph.userData === key0) return; ph.userData = key0;
  const x = ph.ctx, W2 = 720, H2 = 1500;
  x.fillStyle = "#0f1216"; x.fillRect(0, 0, W2, H2);
  x.fillStyle = "#e9e6df"; x.font = "700 34px Inter"; x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillText("21:47", 48, 62);
  x.fillStyle = "#1b2027"; x.fillRect(0, 96, W2, 124); x.fillStyle = "#ffffff"; x.font = "900 56px Inter"; x.fillText("NOTÍCIAS", 48, 180);
  x.fillStyle = ORANGE; roundRect(x, 48, 262, 262, 66, 14); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 42px Inter"; x.fillText("ECONOMIA", 68, 310);
  x.fillStyle = "#ffffff"; x.font = "900 100px Inter"; x.fillText("O BRASIL", 48, 462); x.fillText("CRESCEU", 48, 580);
  x.fillStyle = "#2fd16a"; x.beginPath(); x.moveTo(652, 380); x.lineTo(702, 462); x.lineTo(672, 462); x.lineTo(672, 584); x.lineTo(632, 584); x.lineTo(632, 462); x.lineTo(602, 462); x.closePath(); x.fill();
  const gr = x.createLinearGradient(0, 650, 0, 1040); gr.addColorStop(0, "#26406a"); gr.addColorStop(0.7, "#c8704a"); gr.addColorStop(1, "#e9a060"); x.fillStyle = gr; roundRect(x, 48, 650, 624, 390, 24); x.fill();
  x.fillStyle = "#1a1d2a"; for (let i = 0; i < 9; i++) { const bw = 50 + (i * 37) % 40, bh = 120 + (i * 53) % 160; x.fillRect(70 + i * 66, 1040 - bh, bw, bh); }
  x.fillStyle = "rgba(233,230,223,0.55)"; for (let i = 0; i < 5; i++) x.fillRect(48, 1100 + i * 58, i === 4 ? 360 : 624, 22);
  if (q > 0.01) { x.fillStyle = ORANGE; x.beginPath(); x.arc(360, 845, 190 * q, 0, Math.PI * 2); x.fill(); x.fillStyle = "#ffffff"; x.font = `900 ${Math.round(300 * q)}px Inter`; x.textAlign = "center"; x.fillText("?", 360, 845 + 105 * q); }
  ph.tex.needsUpdate = true;
}
// The living room's red rug toned down to a dusky blue-grey (the room was all red from above).
function pibToneRug(room) { room.traverse((n) => { const p = n.isMesh && n.geometry.parameters; if (p && p.width === 3.6 && p.height === 2.4) n.material.color.set("#5d6b7a"); }); }
// Low picket fence along x from x0 to x1 at z (a gap from g0 to g1 for the driveway). Backdrop.
function makePibFence(x0, x1, z, gap = null) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#d9d2c4"), roughness: 0.7 });
  const n = Math.round((x1 - x0) / 0.16);
  for (let i = 0; i <= n; i++) { const x = x0 + i * (x1 - x0) / n; if (gap && x > gap[0] && x < gap[1]) continue; const p = new THREE.Mesh(rbox(0.07, 0.62, 0.025, 0.01), wood); p.position.set(x, 0.31, z); g.add(p); }
  for (const y of [0.18, 0.46]) for (const [a, b] of gap ? [[x0, gap[0]], [gap[1], x1]] : [[x0, x1]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.05, 0.02), wood); r.position.set((a + b) / 2, y, z - 0.02); g.add(r); }
  return asBackdrop(g);
}
// A simple street tree (trunk and a rounded crown). Backdrop.
function makePibTree(s = 1, seed = 3) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 1.2 * s, 10), mat("#3a2a1e", { roughness: 0.9 })); trunk.position.y = 0.6 * s; g.add(trunk);
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry((0.45 + r() * 0.2) * s, 1), mat("#1f3a26", { roughness: 0.9, flatShading: true })); c.position.set((r() - 0.5) * 0.5 * s, (1.45 + r() * 0.4) * s, (r() - 0.5) * 0.4 * s); g.add(c); }
  return asBackdrop(g);
}
// Street lamp: pole, arm, a warm head with a glow and its pool of light. API { group, set(k) }
function makePibLamp(h = 3.2) {
  const g = new THREE.Group(), m = pmat("#24262a", { metalness: 0.6, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h, 10), m); pole.position.y = h / 2; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.04), m); arm.position.set(0.28, h, 0); g.add(arm);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.14), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); head.position.set(0.52, h - 0.04, 0); g.add(head);
  const glow = sprite(BOKEH, 1.6); glow.material.color.set("#ffcf8a"); glow.material.blending = THREE.AdditiveBlending; glow.position.copy(head.position); g.add(glow);
  const pool = makeFloorGlow(3, 3, { color: "#ffd59a", opacity: 0.14 }); pool.position.set(0.52, 0.02, 0); g.add(pool);
  asBackdrop(g);
  return { group: g, set(k) { head.material.color.set("#3a2a1a").lerp(new THREE.Color("#ffd9a0"), k); glow.material.opacity = 0.9 * k; pool.material.opacity = 0.14 * k; } };
}

// ============================================================ 1 + 2 · gancho e "está na própria conta"
// The office at night: on the desk, a monitor with the PIB line climbing and, in front, the glass jar BRASIL
// that does not fill (push). Then the camera drops from the screen to a sheet "PIB =" on the desk; on
// "própria conta" the orange "?" lands next to it.
addScene("conta", 0, A.c2, (S) => {
  const office = makeOfficeSet({ wallZ: -2.0, clear: 2.6, seed: 4 }); S.backdrop(office.group);
  const top = makePibDesk(S);
  const mon = makeTrendMonitor({ w: 1.2, h: 0.72, title: "PIB", stand: 0.22 }); mon.group.position.set(0.18, top, -0.3); S.add(mon.group);
  const jar = makeCoinJar({ r: 0.3, h: 0.66, label: "BRASIL", n: 420, seed: 4 }); jar.group.position.set(-0.72, top, 0.22); S.add(jar.group);
  const sheet = makePibSheet("PIB =", "?"); sheet.group.position.set(0.3, top, 0.36); sheet.group.rotation.y = -0.06; S.add(sheet.group);
  const anim = (t) => {
    pibOfficeLook(office, t); office.windows(1 + 0.5 * beat(t, A.rico - 0.4, 0.9), "#bfe8c8");
    mon.draw(sm(t, 0.25, 3.1));
    jar.fill(0.16);
    sheet.badge(pop(t, A.conta - 0.1, 0.4));
    fill.position.set(0.2, top + 0.9, 0.9); fill.color.set(t < A.c1 ? "#9dffc0" : "#ffcf8a"); fill.intensity = 1.0 + 0.6 * beat(t, A.conta, 0.8);
  };
  const DROP = A.c1;
  S.hero(mon.group, "monitor do pib", { when: (t) => t < DROP - 0.3 }); S.hero(jar.group, "pote brasil", { when: (t) => t < DROP - 0.3 });
  S.hero(sheet.group, "folha pib =", { when: (t) => t > DROP + 0.6 });
  const bA = envelope([mon.group, jar.group], anim, 0, DROP), bB = envelope([sheet.group], anim, DROP, A.c2);
  return (t) => {
    anim(t);
    let p = shotTrack(t, [[0, bA, "push", { from: [0.08, 0.16, 1], pull0: 1.12, pull: 1.0 }], [DROP, bB, "drop", { from: [0.05, 1.25, 0.8], rise: 0.3, pull: 1.02 }]], 0.6);
    p = CAM.shake(p, t, A.conta + 0.05, 0.015, 0.3); CAM.apply(p);
  };
});

// ============================================================ 3 · imagina: a manchete "o Brasil cresceu"
// The living room at night: a phone on the coffee table, next to a mug, shows the news "O BRASIL
// CRESCEU" with a green arrow. On "mas cresceu como?" an orange "?" pops over the screen. Orbit, then push.
addScene("imagina", A.c2, A.c3, (S) => {
  const room = makeNightLivingRoom({ wallZ: -2.2, seed: 6 }); S.backdrop(room.group);
  const wood = pmat("#ffffff", { map: woodTex({ base: "#4a2e1c", seed: 13 }), roughness: 0.35, clearcoat: 0.5 });
  const T = 0.42, tab = new THREE.Mesh(rbox(1.1, 0.04, 0.62, 0.015), wood); tab.position.y = T - 0.02; S.add(tab);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(rbox(0.05, T - 0.04, 0.05, 0.01), wood); l.position.set(sx * 0.48, (T - 0.04) / 2, sz * 0.25); S.add(l); }
  pibToneRug(room.group);
  // the phone leans back on a small desk stand
  const LEAN = -0.35, n = new V3(0, Math.sin(-LEAN), Math.cos(LEAN)), up = new V3(0, Math.cos(LEAN), Math.sin(LEAN));
  const stand = new THREE.Group(); stand.position.set(-0.08, T, 0.06); S.add(stand);
  const sm1 = pmat("#2a2c30", { metalness: 0.6, roughness: 0.35 });
  const sb = new THREE.Mesh(rbox(0.15, 0.012, 0.13, 0.004), sm1); sb.position.y = 0.006; stand.add(sb);
  const lip = new THREE.Mesh(rbox(0.15, 0.022, 0.012, 0.003), sm1); lip.position.set(0, 0.022, 0.05); stand.add(lip);
  const ph = makePhone(); ph.group.scale.setScalar(0.2); ph.group.rotation.x = LEAN; ph.userData = -1;
  const pc = new V3(0, 0.02, 0.035).addScaledVector(up, 0.164).addScaledVector(n, 0.0095); ph.group.position.copy(pc); stand.add(ph.group);
  const back = new THREE.Mesh(rbox(0.12, 0.2, 0.008, 0.003), sm1); back.rotation.x = LEAN; back.position.copy(pc).addScaledVector(n, -0.014).addScaledVector(up, -0.05); stand.add(back);
  const mug = makeCoffeeMug(); mug.group.position.set(0.26, T, -0.06); S.add(mug.group);
  const anim = (t) => {
    floor.visible = false; room.update(t); key.intensity = 1.5; key.color.set("#ffd2a8"); hemi.intensity = 0.42; scene.fog.color.set("#140f0c");
    pibPaintNews(ph, pop(t, A.mas, 0.45));
    fill.position.set(0, T + 0.5, 0.2); fill.color.set(t > A.mas ? "#ffb070" : "#a9c8ff"); fill.intensity = 0.9 + 0.5 * beat(t, A.brasil, 0.8);
  };
  S.hero(stand, "celular com a manchete no suporte"); S.hero(mug.group, "caneca de café", { when: (t) => t < A.mas - 0.6 });
  const box = envelope([stand, mug.group], anim, A.c2, A.c3), bP = envelope([ph.group], anim, A.mas, A.c3);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c2, box, "orbit", { from: [0.1, 0.5, 1], deg: 30, pull: 1.04 }], [A.mas - 0.15, bP, "push", { from: [0, 0.32, 1], pull0: 1.15, pull: 1.0 }]])); };
});

// ============================================================ 4–8 · a fórmula: C + I + G + (X − M)
// A hall of glass at night (the city behind): four black pedestals with C, I, G and X − M on the front and
// the big PIB screen behind. Each letter gets its object and its pile of coins when it is said (one coin =
// 2,5% of the PIB): C a shopping basket (25 coins), I a model factory and a tower crane (7), G the photo
// of the Esplanada (8), X − M two model ships on a tray of water, one leaving and one arriving (a thin coin).
const PIB_PX = [-2.1, -0.7, 0.7, 2.1], PIB_TOP = 0.55;
function buildPibFormula(S, { withScreen = false } = {}) {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 6 }); S.backdrop(hall.group);
  const screen = makeTrendMonitor({ w: 2.6, h: 1.4, title: "PIB", stand: 1.15 }); screen.group.position.set(0, 0, -1.75); screen.draw(1); if (withScreen) S.add(screen.group);
  const peds = ["C", "I", "G", "X − M"].map((L, i) => {
    const p = makeLabelPlinth(L, { w: 1.2, h: PIB_TOP, d: 0.9, plateH: 0.4, fg: "#ffffff" }); p.group.position.x = PIB_PX[i]; S.add(p.group);
    const hot = makePlate(L, 1.08, 0.4, { bg: ORANGE, fg: "#ffffff" }); hot.position.copy(p.plate.position); hot.position.z += 0.002; hot.visible = false; p.group.add(hot);
    return { ...p, hot, x: PIB_PX[i] };
  });
  const cols = [25, 7, 8, 1].map((n, i) => { const c = makeCoinColumn(n, { r: 0.17, t: i === 3 ? 0.014 : 0.045, seed: 3 + i }); c.group.position.set(PIB_PX[i] - (i === 3 ? 0.4 : 0.3), PIB_TOP, 0.06); S.add(c.group); c.set(0); return c; });
  const basket = makeGroceryBasket({ w: 0.44, d: 0.3, h: 0.22 }); basket.group.position.set(PIB_PX[0] + 0.2, PIB_TOP, 0.04); basket.group.rotation.y = -0.15; S.add(basket.group);
  const fac = makeFactoryModel({ w: 0.5, d: 0.34, h: 0.2, drift: -0.16 }); fac.group.position.set(PIB_PX[1] + 0.12, PIB_TOP, 0.12); S.add(fac.group);
  const crane = makeTowerCraneModel({ h: 0.62, jib: 0.45 }); crane.group.position.set(PIB_PX[1] + 0.42, PIB_TOP, -0.28); crane.group.rotation.y = Math.PI; S.add(crane.group);
  const frame = makePhotoFrame("esplanada", { w: 0.9 }); frame.group.position.set(PIB_PX[2] + 0.24, PIB_TOP, -0.06); S.add(frame.group);
  // the tray of water for the ships
  const tray = new THREE.Group(); tray.position.set(PIB_PX[3] + 0.2, PIB_TOP, 0); S.add(tray);
  const steel = pmat("#30343a", { metalness: 0.7, roughness: 0.35 }), TW = 0.82, TD = 0.56;
  const tb = new THREE.Mesh(rbox(TW, 0.012, TD, 0.004), steel); tb.position.y = 0.006; tray.add(tb);
  for (const [w, d, x, z] of [[TW, 0.02, 0, TD / 2 - 0.01], [TW, 0.02, 0, -TD / 2 + 0.01], [0.02, TD, TW / 2 - 0.01, 0], [0.02, TD, -TW / 2 + 0.01, 0]]) { const e = new THREE.Mesh(rbox(w, 0.06, d, 0.005), steel); e.position.set(x, 0.03, z); tray.add(e); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.04, TD - 0.04, 24, 16), pmat("#1d5a7a", { roughness: 0.08, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.88 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.045; water.userData.noShadow = true; tray.add(water);
  const WY = 0.045, ships = [["X", "#24384e", -0.14], ["M", "#4a2a24", 0.14]].map(([L, hull, z], i) => {
    const s = makeCargoShipModel({ L: 0.34, hull, seed: 7 + i }); s.group.position.set(0, WY, z); tray.add(s.group);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 6), steel); mast.position.set(-0.136, 0.15, 0); s.group.add(mast);
    const flag = makePlate(L, 0.13, 0.13, { bg: i ? RED : GREEN, fg: "#ffffff", depth: 0.006 }); flag.position.set(-0.136, 0.255, 0); s.group.add(flag);
    return { ...s, flag, z };
  });
  ships[0].group.rotation.y = Math.PI; ships[0].flag.rotation.y = Math.PI;   // X faces left (it leaves to the left); its flag still faces the camera
  const update = (t) => {
    pibHallLook(hall, t);
    hall.tint(0.18 * beat(t, A.G - 0.1, 1.0), "#ffb070");
    cols.forEach((c, i) => { c.group.visible = t > [A.familias, A.maquinas, A.governo - 0.2, A.quase][i]; });
    peds.forEach((p, i) => { const at = [14.7, 15.0, 15.9, 16.25][i]; if (t < A.c4) popIn(p.plate, t, at, 0.35); else { p.plate.visible = true; p.plate.scale.setScalar(1); } p.hot.visible = i === 2 && t > A.G - 0.05; });
    popIn(basket.group, t, A.C - 0.05, 0.4); cols[0].set(sm(t, A.familias, A.sessenta + 0.9));
    popIn(fac.group, t, A.I + 0.4, 0.4); popIn(crane.group, t, A.obras - 0.1, 0.4); fac.update(t, sm(t, A.maquinas, A.fabricas)); crane.update(t);
    cols[1].set(sm(t, A.maquinas, A.dezessete + 0.6));
    popIn(frame.group, t, A.G - 0.05, 0.4); frame.zoom(1 + 0.12 * lin(t, A.G, A.c8)); cols[2].set(sm(t, A.governo - 0.2, A.quinto + 0.3));
    popIn(tray, t, A.X - 0.05, 0.4);
    const kx = sm(t, A.vende - 0.1, A.fora + 0.3), km = sm(t, A.M2, A.compra + 0.4);
    ships[0].group.position.x = lerp(0.02, -0.21, kx);
    ships[1].group.position.x = lerp(0.22, 0.12, km); ships[1].group.visible = t > A.M2 - 0.25;
    popIn(ships[1].group, t, A.M2 - 0.25, 0.35);
    cols[3].set(t > A.quase ? 1 : 0); cols[3].group.scale.setScalar(Math.max(0.0001, pop(t, A.quase, 0.35)));
    const wp = water.geometry.attributes.position; for (let i = 0; i < wp.count; i++) wp.setZ(i, 0.003 * Math.sin(wp.getX(i) * 30 + t * 3) * Math.cos(wp.getY(i) * 24 - t * 2)); wp.needsUpdate = true;
    fill.position.set(0, 1.6, 1.8); fill.color.set("#ffd9b0"); fill.intensity = 1.1;
  };
  return { hall, screen, peds, cols, basket, fac, crane, frame, tray, ships, update };
}

addScene("formula", A.c3, A.c4, (S) => {
  const F = buildPibFormula(S, { withScreen: true }), L = A.separado - 0.1, R = 15.75;
  S.hero(F.screen.group, "telão do pib", { when: (t) => t < L - 0.45 });
  F.peds.forEach((p, i) => S.hero(p.group, "pedestal " + ["c", "i", "g", "x − m"][i], { when: (t) => (i < 2 ? inside(t, L + 0.5, R - 0.45) : t > R + 0.5) }));
  const update = (t) => { F.update(t); F.screen.dim(sm(t, L, L + 0.6)); };
  const bS = envelope([F.screen.group], update, A.c3, L), bL = envelope([F.peds[0].group, F.peds[1].group], update, L, R), bR = envelope([F.peds[2].group, F.peds[3].group], update, R, A.c4);
  return (t) => { update(t); CAM.apply(shotTrack(t, [[A.c3, bS, "crane", { from: [0, 0.2, 1], rise: 0.2, pull: 1.04 }], [L, bL, "truck", { from: [0.1, 0.35, 1], side: 0.3, pull: 1.04 }], [R, bR, "push", { from: [-0.1, 0.35, 1], pull0: 1.15, pull: 1.0 }]], 0.55)); };
});
addScene("letraC", A.c4, A.c5, (S) => {
  const F = buildPibFormula(S), p = F.peds[0];
  S.hero(p.group, "pedestal c"); S.hero(F.basket.group, "cesta de compras", { when: (t) => t > A.C + 0.4 }); S.hero(F.cols[0].group, "pilha de moedas c", { when: (t) => t > A.sessenta });
  const box = envelope([p.group, F.basket.group, F.cols[0].group], F.update, A.c4, A.c5);
  return (t) => { F.update(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c4, A.c5), { zone: "stage", from: [0.1, 0.35, 1], side: 0.35, pull: 1.04 })); };
});
addScene("letraI", A.c5, A.c6, (S) => {
  const F = buildPibFormula(S), p = F.peds[1];
  S.hero(p.group, "pedestal i"); S.hero(F.fac.group, "fábrica em miniatura", { when: (t) => t > A.I + 0.8 }); S.hero(F.crane.group, "guindaste em miniatura", { when: (t) => t > A.obras + 0.3 });
  const box = envelope([p.group, F.fac.group, F.crane.group, F.cols[1].group], F.update, A.c5, A.c6);
  return (t) => { F.update(t); CAM.apply(CAM.move(box, "push", lin(t, A.c5, A.c6), { zone: "stage", from: [-0.15, 0.35, 1], pull0: 1.3, pull: 1.0 })); };
});
addScene("letraG", A.c6, A.c7, (S) => {
  const F = buildPibFormula(S), p = F.peds[2];
  S.hero(p.group, "pedestal g"); S.hero(F.frame.group, "porta-retrato esplanada", { when: (t) => t > A.G + 0.4 });
  const box = envelope([p.group, F.frame.group, F.cols[2].group], F.update, A.c6, A.c7);
  return (t) => { F.update(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c6, A.c7), { zone: "stage", from: [0.1, 0.3, 1], deg: 26, pull: 1.0 })); };
});
addScene("letraXM", A.c7, A.c8, (S) => {
  const F = buildPibFormula(S), p = F.peds[3], OPEN = A.cancela - 0.1;
  S.hero(p.group, "pedestal x − m", { when: (t) => t < A.X2 - 0.55 }); S.hero(F.tray, "bandeja com navios", { when: (t) => inside(t, A.X2 + 0.3, OPEN - 0.45) });
  S.hero(p.group, "pedestal x − m com a moeda fina", { when: (t) => t > OPEN + 0.5 }); S.hero(F.tray, "bandeja com navios", { when: (t) => t > OPEN + 0.5 });
  const TR = A.X2 - 0.1;
  const box = envelope([p.group, F.tray], F.update, A.c7, TR), bT = envelope([F.tray, p.plate], F.update, TR, OPEN), bZ = envelope([p.group, F.tray, F.cols[3].group], F.update, OPEN, A.c8);
  return (t) => { F.update(t); CAM.apply(shotTrack(t, [[A.c7, box, "truck", { from: [0.1, 0.45, 1], side: 0.3, pull: 1.04 }], [TR, bT, "push", { from: [0.1, 0.8, 1], pull0: 1.15, pull: 1.0 }], [OPEN, bZ, "reveal", { from: [-0.1, 0.5, 1], pull0: 1.12, pull: 1.0 }]], 0.6)); };
});

// ============================================================ 9 + 10 · o G mede o gasto, não a entrega
// In the hall, on one long plinth: the pile of coins GASTO, the yellow ruler PIB that measures it with its
// orange cursor, and a model school (ENTREGA) that the ruler never reaches. On "não o que entrega" the
// school goes dark. Then (canos) the pile grows and the PIB cursor rides up with it while the school stays
// as it is; two funnels, IMPOSTO and DÍVIDA, pour into the same pile.
const PIB_GT = 0.3;
function buildPibGasto(S) {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 8 }); S.backdrop(hall.group);
  const plinth = makeLabelPlinth(null, { w: 2.1, h: PIB_GT, d: 1.0 }); S.add(plinth.group);
  const pG = makePlate("GASTO", 0.72, 0.22, { bg: ORANGE, fg: "#ffffff" }); pG.position.set(-0.45, PIB_GT / 2, 0.516); plinth.group.add(pG);
  const pE = makePlate("ENTREGA", 0.82, 0.22, { bg: "#2a2f36", fg: "#ffffff" }); pE.position.set(0.64, PIB_GT / 2, 0.516); plinth.group.add(pE);
  const col = makeCoinColumn(36, { r: 0.24, t: 0.04, seed: 9 }); col.group.position.set(-0.45, PIB_GT, 0.05); S.add(col.group);
  const ruler = makeMeasuringRuler({ h: 1.4, label: "PIB", w: 0.15, reach: 0.23, side: -1 }); ruler.group.position.set(0.0, PIB_GT, 0.05); S.add(ruler.group);
  const school = makeCivicBuilding({ kind: "escola", label: "ESCOLA", w: 0.8, h: 0.44, d: 0.48 }); school.group.position.set(0.64, PIB_GT, 0.0); S.add(school.group); school.sign.userData.plate.detail = true;
  const funnels = [["IMPOSTO", GREEN, -0.8], ["DÍVIDA", RED, -0.1]].map(([L, bg, x]) => { const f = makeCoinFunnel(L, { plateBg: bg, arm: "back", drop: 3.3, plateW: 0.78 }); f.group.scale.setScalar(0.7); f.group.position.set(x, 2.3, 0.05); f.group.visible = false; S.add(f.group); return f; });
  const rains = [makePibCoinRain(S), makePibCoinRain(S)];
  const kCol = (t) => (14 + 10 * sm(t, A.gastou + 0.05, A.sobe + 0.3) + 9 * sm(t, A.pergunta + 0.2, A.c10)) / 36;
  const update = (t) => {
    pibHallLook(hall, t); hall.tint(0.22 * beat(t, A.divida, 0.8), "#ff4a2a");
    const k = kCol(t); col.set(k);
    const h = col.height(k), meas = lerp(1.32, h, sm(t, A.mede, A.gasta - 0.1));   // from the top of the ruler down onto the pile, never into it
    ruler.set(meas);
    const lit = 1 - sm(t, A.nao, A.entrega + 0.2); school.lights(lit); school.dim(1 - lit);
    funnels.forEach((f, i) => popIn(f.group, t, A.nem + i * 0.12, 0.4, 0.7));
    const top = PIB_GT + h + 0.02;
    rains.forEach((r, i) => { const f = funnels[i].group; r(t, new V3(f.position.x, f.position.y - 0.16, 0.05), new V3(-0.45 + (i ? 0.09 : -0.09), top, 0.05), t > A.pergunta + 0.1 ? 1 : 0); });
    fill.position.set(-0.3, 1.8, 1.6); fill.color.set("#ffd9b0"); fill.intensity = 1.2 + 0.8 * beat(t, A.sobe, 0.8);
  };
  return { hall, plinth, col, ruler, school, funnels, pG, pE, update };
}
addScene("gasto", A.c8, A.c9, (S) => {
  const G = buildPibGasto(S), SCH = A.nao - 0.3;
  S.hero(G.plinth.group, "base gasto e entrega", { when: (t) => t < SCH - 0.45 }); S.hero(G.col.group, "pilha gasto", { when: (t) => t < SCH - 0.45 }); S.hero(G.ruler.group, "régua do pib");
  S.hero(G.school.group, "escola em miniatura");
  const box = envelope([G.plinth.group, G.col.group, G.ruler.group, G.school.group], G.update, A.c8, SCH), bS = envelope([G.ruler.group, G.school.group, G.pE], G.update, SCH, A.c9);
  return (t) => { G.update(t); CAM.apply(shotTrack(t, [[A.c8, box, "push", { from: [0.05, 0.3, 1], pull0: 1.1, pull: 1.0 }], [SCH, bS, "truck", { from: [0.15, 0.25, 1], side: 0.25, pull: 1.02 }]])); };
});
addScene("canos", A.c9, A.c10, (S) => {
  const G = buildPibGasto(S), SCH = A.mesmo - 0.1, POUR = A.nem - 0.1;
  S.hero(G.col.group, "pilha gasto", { when: (t) => t < SCH - 0.45 || t > POUR }); S.hero(G.ruler.group, "régua do pib");
  S.hero(G.school.group, "escola em miniatura", { when: (t) => inside(t, SCH, POUR - 0.45) });
  G.funnels.forEach((f, i) => S.hero(f.group, "funil " + (i ? "dívida" : "imposto"), { when: (t) => t > POUR + 0.6 }));
  const bA = envelope([G.col.group, G.ruler.group, G.pG], G.update, A.c9, SCH), bS = envelope([G.ruler.group, G.school.group, G.pE], G.update, SCH, POUR);
  const bF = envelope([G.col.group, G.ruler.group, G.pG, ...G.funnels.map((f) => f.group)], G.update, POUR + 0.6, A.c10);
  return (t) => { G.update(t); CAM.apply(shotTrack(t, [[A.c9, bA, "crane", { from: [-0.1, 0.25, 1], rise: 0.25, pull: 1.04 }], [SCH, bS, "push", { from: [0.2, 0.25, 1], pull0: 1.15, pull: 1.0 }], [POUR, bF, "reveal", { from: [0, 0.2, 1], pull0: 1.08, pull: 1.0 }]], 0.55)); };
});

// ============================================================ 11 · analogia: o vizinho visto da rua
// A street at night seen from the other kerb: the neighbour's house behind a picket fence, a new red car in
// the drive (it shines on "carro novo"), a grill smoking in the yard (it flares on "churrasco"), party lights
// that come on one by one on "parece cada vez mais rico". Cut inside on "pode ser aumento": the dining table
// with a pay slip (SALÁRIO) and, on "cartão", the card and its bill (FATURA). Cut back out on "o PIB olha da
// rua": a magnifying glass on a stand on the pavement (PIB) looks at the grill; the house windows go dark.
function buildPibStreet(S) {
  const g = new THREE.Group(); S.backdrop(g);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), mat("#ffffff", { map: tileTex(grassTex(), 20, 14), roughness: 0.95 })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.001, -6); g.add(grass);
  const road = makeTwoLaneRoad({ lane: 1.4, back: 16, front: 16 }); road.group.rotation.y = Math.PI / 2; road.group.position.z = 1.4; g.add(road.group);
  const walk = new THREE.Mesh(rbox(40, 0.1, 0.9, 0.02), mat("#ffffff", { map: tileTex(plasterTex("#8f8a84"), 12, 0.4), roughness: 0.85 })); walk.position.set(0, 0.05, -0.45); g.add(walk);
  const drive = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 2.2), mat("#ffffff", { map: tileTex(plasterTex("#7c7772"), 1, 1.5), roughness: 0.85 })); drive.position.set(2.0, 0.015, -2.0); g.add(drive);
  g.add(makePibFence(-4.2, 3.6, -1.05, [1.25, 2.75]));
  for (const [x, s] of [[-6.2, 2.0], [6.6, 2.1]]) { const h = makeHouse({ wall: x < 0 ? "#cfc2ae" : "#b9c4c8", roof: "#5a2a22" }); h.scale.setScalar(s); h.position.set(x, 0, -4.4); g.add(h); }
  for (const [x, z, s, sd] of [[-4.6, -2.0, 1.2, 3], [4.4, -2.4, 1.3, 7], [-8.5, -3.5, 1.4, 11], [8.8, -3.2, 1.2, 5]]) { const tr = makePibTree(s, sd); tr.position.set(x, 0, z); g.add(tr); }
  const lamps = [-3.4, 4.0].map((x) => { const l = makePibLamp(3.2); l.group.position.set(x, 0, -0.75); g.add(l.group); l.set(1); return l; });
  const sky = makeSkyline({ z: -20, seed: 13, hMin: 4, hMax: 14, spread: 50 }); g.add(sky.group);
  const moon = sprite(BOKEH, 3.2); moon.material.color.set("#e9eeff"); moon.material.opacity = 0.7; moon.position.set(-5, 12, -24); g.add(moon);
  asBackdrop(g);
  const house = makeHouse({ wall: "#e9dcc6", roof: "#8a2e22" }); house.scale.setScalar(2.3); house.position.set(-0.3, 0, -3.7); S.add(house);
  // the window where the bill lies: a curtain that comes down on "não vê a fatura"
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat("#2a1a14", { roughness: 0.9 })); curtain.position.set(-0.3 + 0.34 * 2.3, 0.8 * 0.58 * 2.3, -3.7 + 0.9 / 2 * 2.3 + 0.06); S.add(curtain);
  const car = makeHatchbackCar({ color: "#c0182a" }); car.group.position.set(2.0, 0.03, -2.55); car.group.rotation.y = -1.2; S.add(car.group);
  const grill = makeBarbecueGrill(); grill.group.position.set(-2.3, 0, -2.0); grill.group.rotation.y = 0.15; S.add(grill.group);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.2, 10), pmat("#2a2c30", { metalness: 0.6, roughness: 0.4 })); pole.position.set(-3.4, 1.1, -1.6); S.add(pole);
  const lights = makeStringLights([-1.4, 2.0, -2.62], [-3.38, 2.15, -1.6], { n: 12, sag: 0.3 }); S.add(lights.group);
  const lights2 = makeStringLights([0.8, 2.0, -2.62], [2.9, 1.6, -1.2], { n: 10, sag: 0.25 }); S.add(lights2.group);
  const sparks = makeSparks(40, 7); S.add(sparks);
  // the magnifying glass on its stand (pavement in front of the fence) and the PIB sign
  const lupa = new THREE.Group(); lupa.position.set(-1.5, 0.1, -0.35); S.add(lupa);
  const sm2 = pmat("#24262a", { metalness: 0.6, roughness: 0.4 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 24), sm2); base.position.y = 0.025; lupa.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.9, 12), sm2); stem.position.y = 0.5; lupa.add(stem);
  const clampM = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 14), sm2); clampM.position.y = 0.95; lupa.add(clampM);
  const mg = makeMagnifier({ r: 0.42 }); mg.group.position.set(0, 0.95 + 0.42 * 2.85, 0); lupa.add(mg.group);
  const sign = makeStakeSign("PIB", { w: 0.62, h: 0.32, stake: 0.55, bg: ORANGE }); sign.group.position.set(-0.95, 0.16, -0.2); sign.group.rotation.y = 0.2; S.add(sign.group);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 20), pmat("#3a3c40", { roughness: 0.7 })); foot.position.y = -0.03; sign.group.add(foot);   // a weighted base on the pavement
  const update = (t) => {
    pibStreetLook(); sky.update(t);
    const burn = 0.45 + 0.55 * sm(t, A.churrasco - 0.2, A.churrasco + 0.6) + 0.4 * beat(t, A.ve, 0.9);
    grill.update(t, Math.min(1.2, burn));
    car.lights(beat(t, A.novo, 0.7)); updateSparks(sparks, t, A.novo, new V3(2.0, 1.0, -2.55));
    lights.set(sm(t, A.parece, A.rico2 + 0.3)); lights2.set(sm(t, A.parece + 0.3, A.rico2 + 0.5));
    const down = sm(t, A.naove, A.fatura + 0.2); curtain.visible = down > 0.01; curtain.scale.set(1, Math.max(0.001, down), 1); curtain.position.y = 0.8 * 0.58 * 2.3 + 0.25 * (1 - down);
    lupa.visible = t > A.c11b - 0.05; sign.group.visible = lupa.visible; popIn(lupa, t, A.c11b - 0.05, 0.4); popIn(sign.group, t, A.olha - 0.1, 0.4);
    mg.group.rotation.set(-0.12, -0.25 + 0.12 * Math.sin(t * 0.8), 0);
    fill.position.set(-2.0, 1.4, -0.8); fill.color.set("#ff9a4a"); fill.intensity = 1.2 + 1.0 * burn;
  };
  return { house, car, grill, lights, lupa, sign, update };
}
addScene("vizinho", A.c10, A.c11a, (S) => {
  const V = buildPibStreet(S), CAR = A.carro - 0.15, GR = A.churrasco - 0.15, WIDE = A.rua - 0.2;
  S.hero(V.house, "casa do vizinho", { when: (t) => t < CAR - 0.45 || t >= WIDE });
  S.hero(V.car.group, "carro novo", { when: (t) => t < GR - 0.45 || t >= WIDE });
  S.hero(V.grill.group, "churrasqueira", { when: (t) => t >= GR });
  const box = envelope([V.house, V.car.group, V.grill.group], V.update, A.c10, A.c11a);
  const bC = envelope([V.car.group], V.update, CAR, GR), bG = envelope([V.grill.group], V.update, GR, WIDE);
  return (t) => { V.update(t); pibFar(shotTrack(t, [[A.c10, box, "truck", { from: [0.4, 0.3, 1], side: 0.25, pull: 1.0 }], [CAR, bC, "push", { from: [0.25, 0.35, 1], pull0: 1.2, pull: 1.0 }], [GR, bG, "orbit", { from: [0.1, 0.8, 1], deg: 20, pull: 1.0 }], [WIDE, box, "crane", { from: [0.45, 0.25, 1], rise: 0.2, pull: 1.0 }]], 0.5)); };
});
addScene("dentro", A.c11a, A.c11b, (S) => {
  const room = makeNightLivingRoom({ wallZ: -1.9, seed: 9 }); S.backdrop(room.group); pibToneRug(room.group);
  const table = makeDiningTable({ w: 1.5, d: 0.95, clothColor: "#22343e" }); S.add(table.group);
  const lamp = makePendantLamp({ drop: 1.2, r: 0.22, light: true }); lamp.position.set(0, 5.2, -0.3); S.backdrop(lamp); lamp.userData.light.intensity = 2.6;
  const Y = table.topY;
  const pay = makeInvoiceSheet({ w: 0.56, d: 0.74, title: "AUMENTO?", issuer: "HOLERITE · SALÁRIO", to: null }); pay.group.position.set(-0.38, Y, 0.06); pay.plates.issuer.userData.plate.detail = true; pay.group.rotation.y = 0.12; S.add(pay.group);
  const bill = makeInvoiceSheet({ w: 0.56, d: 0.74, title: "FATURA", issuer: "CARTÃO DE CRÉDITO", to: null }); bill.group.position.set(0.36, Y, 0.04); bill.plates.issuer.userData.plate.detail = true; bill.group.rotation.y = -0.1; S.add(bill.group);
  const card = makeBankCard({ name: "CARTÃO", color: "#1d3557", w: 0.3 }); card.group.rotation.x = -Math.PI / 2; card.group.position.set(0.5, Y + 0.012, 0.3); card.group.rotation.z = 0.3; S.add(card.group);
  const anim = (t) => {
    floor.visible = false; room.update(t); key.intensity = 1.5; key.color.set("#ffd2a8"); hemi.intensity = 0.42; scene.fog.color.set("#140f0c");
    const kp = eOut(lin(t, A.c11a, A.aumento + 0.1)); pay.group.position.z = 0.06 + 0.2 * (1 - kp);
    const kb = eOut(lin(t, A.cartao - 0.4, A.cartao + 0.05)); bill.group.position.z = 0.04 + 0.5 * (1 - kb); bill.group.visible = t > A.cartao - 0.4;
    popIn(card.group, t, A.cartao - 0.1, 0.35);
    fill.position.set(0, Y + 0.8, 0.6); fill.color.set(t > A.cartao - 0.2 ? "#ff6a4a" : "#9dffc0"); fill.intensity = 1.0 + 1.0 * beat(t, A.aumento, 0.6) + 1.4 * beat(t, A.cartao, 0.7);
  };
  const B = A.ou;
  S.hero(pay.group, "holerite aumento", { when: (t) => t < B + 0.3 - 0.45 });
  S.hero(bill.group, "fatura do cartão", { when: (t) => t > A.cartao + 0.15 }); S.hero(card.group, "cartão de crédito", { when: (t) => t > A.cartao + 0.3 });
  const bT = envelope([bill.group, card.group], anim, A.cartao + 0.2, A.c11b), bP = envelope([pay.group], anim, A.c11a, B);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c11a, bP, "drop", { from: [-0.15, 1.7, 0.75], rise: 0.25, pull: 1.04 }], [B + 0.3, bT, "push", { from: [0.1, 1.5, 0.75], pull0: 1.2, pull: 1.0 }]])); };
});
addScene("lupa", A.c11b, A.c11, (S) => {
  const V = buildPibStreet(S), WIDE = A.naove - 0.25;
  S.hero(V.lupa, "lupa do pib"); S.hero(V.sign.group, "placa pib", { when: (t) => t > A.olha + 0.4 && t < WIDE }); S.hero(V.grill.group, "churrasqueira", { when: (t) => t < WIDE });
  S.hero(V.house, "casa do vizinho", { when: (t) => t >= WIDE });
  const bA = envelope([V.lupa, V.sign.group, V.grill.group], V.update, A.c11b, WIDE), bW = envelope([V.lupa, V.house, V.grill.group], V.update, WIDE, A.c11);
  return (t) => { V.update(t); pibFar(shotTrack(t, [[A.c11b, bA, "orbit", { from: [0.35, 0.3, 1], deg: 22, pull: 1.0 }], [WIDE, bW, "reveal", { from: [0.2, 0.3, 1], pull0: 1.1, pull: 1.0 }]], 0.55)); };
});

// ============================================================ 12 · os últimos 12 meses
// The hall: under the screen "PIB · 12 MESES" (+1,9% on "um vírgula nove"), three glossy bars on a plinth:
// GOVERNO grows to +2,8%, FAMÍLIAS to +0,9% (a third of it), INVESTIMENTO stays a flat red slab (−0,2%).
addScene("brasil", A.c11, A.c12, (S) => {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 10 }); S.backdrop(hall.group);
  const PT = 0.35, plinth = makeLabelPlinth(null, { w: 2.7, h: PT, d: 1.0 }); S.add(plinth.group);
  const names = ["GOVERNO", "FAMÍLIAS", "INVESTIMENTO"], xs = [-0.88, 0, 0.88];
  const labels = names.map((n, i) => { const p = makePlate(n, 0.84, 0.2, { bg: "#141414", fg: "#ffffff" }); p.position.set(xs[i], PT / 2, 0.516); plinth.group.add(p); return p; });   // they come in with the bars (under the caption in the screen shot)
  const bars = [makePibBar(ORANGE), makePibBar("#e9dcc7"), makePibBar(RED)]; bars.forEach((b, i) => { b.group.position.set(xs[i], PT, -0.08); S.add(b.group); b.set(0); });
  const cards = ["+2,8%", "+0,9%", "−0,2%"].map((v, i) => { const c = makeShelfCard(v, { w: 0.5, h: 0.16 }); c.group.position.set(xs[i], PT, 0.36); S.add(c.group); return c; });
  const scr = makeTrendMonitor({ w: 2.6, h: 1.3, title: "PIB · 12 MESES", stand: 1.3 }); scr.group.position.set(0, 0, -1.75); S.add(scr.group);
  const anim = (t) => {
    pibHallLook(hall, t); hall.tint(0.25 * beat(t, A.invest2 + 0.2, 0.9), "#ff3a2a");
    scr.draw(sm(t, A.c11 + 0.1, A.um9 + 0.3), t > A.um9 ? "+1,9%" : ""); scr.dim(sm(t, A.gasto - 0.3, A.gasto + 0.3));
    bars[0].set(1.4 * sm(t, A.gasto - 0.1, A.tres + 0.2)); bars[1].set(0.45 * sm(t, A.familias2 - 0.5, A.familias2 + 0.3)); bars[2].set(0.03 * sm(t, A.invest2, A.invest2 + 0.2));
    labels.forEach((l) => popIn(l, t, A.gasto - 0.3, 0.35)); popIn(cards[0].group, t, A.gasto + 0.4, 0.35); popIn(cards[1].group, t, A.familias2 - 0.2, 0.35); popIn(cards[2].group, t, A.invest2 + 0.1, 0.35);
    fill.position.set(0, 1.6, 1.8); fill.color.set(t > A.invest2 ? "#ff6a4a" : "#ffd9b0"); fill.intensity = 1.2;
  };
  const BARS = A.gasto - 0.3, INV = A.invest2 - 0.3;
  S.hero(scr.group, "telão pib 12 meses", { when: (t) => t < BARS - 0.45 });
  S.hero(bars[0].group, "barra governo", { when: (t) => inside(t, A.tres, INV - 0.45) }); S.hero(cards[0].group, "placa +2,8%", { when: (t) => inside(t, A.tres, INV - 0.45) }); S.hero(cards[1].group, "placa +0,9%", { when: (t) => inside(t, A.familias2 + 0.3, INV - 0.45) });
  S.hero(cards[2].group, "placa −0,2%", { when: (t) => t > A.invest2 + 0.5 }); S.hero(labels[2], "rótulo investimento", { when: (t) => t > A.invest2 + 0.5 });
  S.hero(bars[1].group, "barra famílias", { when: (t) => t > A.invest2 + 0.5 }); S.hero(cards[1].group, "placa +0,9%", { when: (t) => t > A.invest2 + 0.5 });
  const bA = envelope([scr.group], anim, A.c11, BARS), bB = envelope([bars[0].group, bars[1].group, cards[0].group, cards[1].group, labels[0], labels[1]], anim, A.tres, INV);
  const bI = envelope([cards[1].group, bars[1].group, labels[1], cards[2].group, bars[2].group, labels[2]], anim, A.invest2 + 0.3, A.c12);
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c11, bA, "orbit", { from: [0, 0.3, 1], deg: 20, pull: 1.02 }], [BARS, bB, "push", { from: [-0.15, 0.3, 1], pull0: 1.08, pull: 1.0 }], [INV, bI, "truck", { from: [0.2, 0.75, 1], side: 0.25, pull: 1.04 }]])); };
});

// ============================================================ 13 · e a fatura? a dívida a 82,9% do PIB
// The hall: the pile of gold coins PIB (40 coins = 100%) and, next to it, the red tower DÍVIDA that rises
// block by block to 33 of 40 (82,9%). Crane up with it.
addScene("divida", A.c12, A.c13, (S) => {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 12 }); S.backdrop(hall.group);
  const PT = 0.35, plinth = makeLabelPlinth(null, { w: 2.2, h: PT, d: 1.0 }); S.add(plinth.group);
  const pP = makePlate("PIB", 0.6, 0.17, { bg: "#141414", fg: "#ffffff" }); pP.position.set(-0.5, PT / 2, 0.516); plinth.group.add(pP);
  const pD = makePlate("DÍVIDA", 0.8, 0.17, { bg: RED, fg: "#ffffff" }); pD.position.set(0.5, PT / 2, 0.516); plinth.group.add(pD);
  const pib = makeCoinColumn(40, { r: 0.3, t: 0.05, seed: 21 }); pib.group.position.set(-0.5, PT, 0.0); S.add(pib.group); pib.set(1);
  const N = 40, bh = 0.05, blocks = new THREE.InstancedMesh(rbox(0.56, bh * 0.92, 0.56, 0.012), pmat("#b3241a", { roughness: 0.3, clearcoat: 0.8, emissive: "#2a0402" }), N), o = new THREE.Object3D();
  for (let i = 0; i < N; i++) { o.position.set(Math.sin(i * 2.1) * 0.01, PT + i * bh + bh / 2, Math.cos(i * 1.3) * 0.01); o.rotation.y = Math.sin(i * 3.7) * 0.04; o.updateMatrix(); blocks.setMatrixAt(i, o.matrix); }
  const tower = new THREE.Group(); tower.position.x = 0.5; tower.add(blocks); S.add(tower);
  const shadow = contactShadow(1.0, 1.0); shadow.position.set(0.5, PT + 0.002, 0); S.add(shadow);
  const anim = (t) => {
    pibHallLook(hall, t); hall.tint(0.3 * beat(t, A.oitenta + 0.4, 1.0), "#ff3a2a");
    const n = Math.round(33 * sm(t, A.divida2 - 0.1, A.pib4 - 0.3)); blocks.count = Math.max(1, n); blocks.visible = n > 0; blocks.boundingBox = null; blocks.boundingSphere = null;
    fill.position.set(0.3, 1.8, 1.6); fill.color.set("#ffb08a"); fill.intensity = 0.9 + 0.8 * beat(t, A.oitenta + 0.4, 0.9);
  };
  S.hero(pib.group, "pilha pib"); S.hero(tower, "torre da dívida", { when: (t) => t > A.divida2 + 0.6 }); S.hero(plinth.group, "base pib e dívida");
  const box = envelope([pib.group, tower, plinth.group], anim, A.c12, A.c13);
  return (t) => { anim(t); let p = CAM.move(box, "crane", lin(t, A.c12, A.c13), { zone: "stage", from: [0.15, 0.2, 1], rise: 0.25, pull: 1.04 }); p = CAM.shake(p, t, A.pib4 - 0.3, 0.015, 0.3); CAM.apply(p); };
});

// ============================================================ 14 · gasto público não é vilão
// A town street at dusk: a school and a hospital light up their windows when they are said; on "estrada"
// the street lamps come on and a bus drives through; on "produzir" the factory behind smokes. Then the camera
// opens up over the whole street ("depende de pra onde vai o dinheiro").
addScene("vilao", A.c13, A.c14, (S) => {
  const g = new THREE.Group(); S.backdrop(g);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(70, 40), mat("#ffffff", { map: tileTex(grassTex(), 24, 14), roughness: 0.95 })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.001, -6); g.add(grass);
  const road = makeTwoLaneRoad({ lane: 1.3, back: 18, front: 18 }); road.group.rotation.y = Math.PI / 2; road.group.position.z = 1.1; g.add(road.group);
  const walk = new THREE.Mesh(rbox(40, 0.1, 0.8, 0.02), mat("#ffffff", { map: tileTex(plasterTex("#8f8a84"), 12, 0.4), roughness: 0.85 })); walk.position.set(0, 0.05, -0.55); g.add(walk);
  const sky = makeSkyline({ z: -22, seed: 17, hMin: 4, hMax: 13, spread: 54 }); g.add(sky.group);
  for (const [x, z, s, sd] of [[-4.6, -2.2, 1.2, 4], [4.7, -2.4, 1.3, 8], [-7.5, -3.6, 1.4, 12], [8.0, -3.3, 1.2, 6]]) { const tr = makePibTree(s, sd); tr.position.set(x, 0, z); g.add(tr); }
  const lamps = [-5.5, -2.6, 0.1, 2.8, 5.6].map((x) => { const l = makePibLamp(2.6); l.group.position.set(x, 0, -0.45); g.add(l.group); return l; });
  asBackdrop(g);
  const school = makeCivicBuilding({ kind: "escola", label: "ESCOLA", w: 2.0, h: 1.0, d: 1.0 }); school.group.position.set(-1.45, 0, -1.9); S.add(school.group);
  const hosp = makeCivicBuilding({ kind: "hospital", label: "HOSPITAL", w: 2.0, h: 1.0, d: 1.0 }); hosp.group.position.set(1.45, 0, -1.9); S.add(hosp.group);
  const fac = makeFactoryModel(); fac.group.scale.setScalar(2.4); fac.group.position.set(0, 0, -4.6); S.backdrop(fac.group);
  const bus = makeCityBus({ dest: "CENTRO" }), busG = bus.group; busG.scale.setScalar(0.55); busG.traverse((n) => { if (n.userData.plate) n.userData.plate.detail = true; }); busG.position.set(-8, 0.06, 1.75); S.add(busG);
  const anim = (t) => {
    pibStreetLook(); sky.update(t);
    school.lights(sm(t, A.escola - 0.1, A.escola + 0.4)); hosp.lights(sm(t, A.hospital - 0.1, A.hospital + 0.4));
    lamps.forEach((l, i) => l.set(0.15 + 0.85 * sm(t, A.estrada - 0.1 + i * 0.08, A.estrada + 0.25 + i * 0.08)));
    busG.position.x = lerp(-4.2, 4.2, lin(t, A.estrada - 0.2, A.estrada + 2.8)); bus.spin(busG.position.x / 0.2);
    fac.update(t, sm(t, A.produzir - 0.1, A.produzir + 0.6));
    const wide = t > A.depende - 0.3; [school, hosp].forEach((b) => { if (b.sign) b.sign.userData.plate.detail = wide; });
    fill.position.set(0, 1.6, 0.6); fill.color.set("#ffcf8a"); fill.intensity = 1.0 + 0.8 * beat(t, A.estrada, 0.9);
  };
  const SC = A.c13, HO = A.hospital - 0.25, RD = A.estrada - 0.15, WIDE = A.depende - 0.3;
  S.hero(school.group, "escola", { when: (t) => t < HO - 0.45 || t >= WIDE }); S.hero(hosp.group, "hospital", { when: (t) => inside(t, HO, RD - 0.45) || t >= WIDE });
  S.hero(busG, "ônibus", { when: (t) => inside(t, A.estrada + 1.05, A.estrada + 1.7) });
  const bS = envelope([school.group], anim, SC, HO), bH = envelope([hosp.group], anim, HO, RD);
  const bR = envelope([hosp.group, school.group], anim, RD, WIDE), bW = envelope([school.group, hosp.group], anim, WIDE, A.c14);
  return (t) => { anim(t); pibFar(shotTrack(t, [[SC, bS, "push", { from: [0.2, 0.3, 1], pull0: 1.12, pull: 1.0 }], [HO, bH, "truck", { from: [-0.1, 0.3, 1], side: 0.25, pull: 1.0 }], [RD, bR, "crane", { from: [0, 0.2, 1], rise: 0.2, pull: 1.15 }], [WIDE, bW, "reveal", { from: [0, 0.3, 1], pull0: 1.2, pull: 1.0 }]], 0.55)); };
});

// ============================================================ 15 · motor ou conta pro futuro?
// The office again: on a black plinth a brass two-pan scale; on the left pan a steel gear that turns (MOTOR),
// on the right the bill FATURA (CONTA). It dips to the left on "motor", to the right on "conta", and keeps
// rocking. Orbit → push on each side → reveal.
addScene("pergunta", A.c14, A.end, (S) => {
  const office = makeOfficeSet({ wallZ: -2.0, clear: 2.6, seed: 25 }); S.backdrop(office.group);
  const PT = 0.5, plinth = makeLabelPlinth(null, { w: 2.0, h: PT, d: 1.0 }); S.add(plinth.group);
  const sc = makeTwoPanScale({ arm: 0.72, height: 1.3, panR: 0.34, chain: 0.6 }); sc.group.position.set(0, PT, -0.05); S.add(sc.group);
  const gear = makeGearWheel({ r: 0.2, teeth: 12, t: 0.06 }); gear.group.rotation.x = -Math.PI / 2; gear.group.position.y = 0.04; sc.holders[0].add(gear.group);
  const bill = makeInvoiceSheet({ w: 0.3, d: 0.36, title: "FATURA", issuer: "PRO FUTURO", to: null }); bill.group.rotation.y = 0.1; bill.group.position.y = 0.002; sc.holders[1].add(bill.group);
  Object.values(bill.plates).forEach((p) => { p.userData.plate.detail = true; });   // on the pan it is read as a bill; the card CONTA names it
  const mot = makeShelfCard("MOTOR", { w: 0.5, h: 0.16 }); mot.group.position.set(-0.72, PT, 0.38); S.add(mot.group);
  const con = makeShelfCard("CONTA", { w: 0.5, h: 0.16 }); con.group.position.set(0.72, PT, 0.38); S.add(con.group);
  const tiltAt = (t) => 0.2 * sm(t, A.motor - 0.15, A.motor + 0.45) - 0.4 * sm(t, A.conta2 - 0.15, A.conta2 + 0.5) + 0.2 * sm(t, A.futuro + 0.3, A.futuro + 1.1) + 0.05 * Math.sin(t * 2.2) * sm(t, A.futuro + 0.3, A.futuro + 1.3);
  const anim = (t) => {
    pibOfficeLook(office, t); office.windows(1 + 0.4 * beat(t, A.motor, 0.8) + 0.4 * beat(t, A.conta2, 0.8), t > A.conta2 ? "#ffb0a0" : "#c9ffe0");
    sc.tilt(tiltAt(t)); gear.group.rotation.z = t * 0.9;
    fill.position.set(0, PT + 1.4, 1.3); fill.color.set("#ffcf8a"); fill.intensity = 1.2;
  };
  const L = A.motor - 0.25, R = A.conta2 - 0.25, ALL = A.futuro + 0.25, all = (t) => t < L - 0.45 || t >= ALL;
  S.hero(sc.group, "balança de dois pratos", { when: all });
  S.hero(gear.group, "engrenagem no prato", { when: (t) => inside(t, L, R - 0.45) }); S.hero(mot.group, "placa motor", { when: (t) => all(t) || inside(t, L, R - 0.45) });
  S.hero(bill.group, "fatura no prato", { when: (t) => inside(t, R, ALL - 0.45) }); S.hero(con.group, "placa conta", { when: (t) => all(t) || inside(t, R, ALL - 0.45) });
  const box = envelope([sc.group, mot.group, con.group], anim, A.c14, A.end);
  const beamY = PT + 0.1 + 1.3, arm = (s) => CAM.toBox([[s * 0.72 - 0.25, beamY - 0.05, -0.15], [s * 0.72 + 0.25, beamY + 0.08, 0.05]]);
  const bL = envelope([gear.group, mot.group], anim, L, R).union(arm(-1)), bR = envelope([bill.group, con.group], anim, R, ALL).union(arm(1));
  return (t) => { anim(t); CAM.apply(shotTrack(t, [[A.c14, box, "orbit", { from: [0, 0.22, 1], deg: 18, pull: 1.02 }], [L, bL, "push", { from: [0.12, 0.25, 1], pull0: 1.12, pull: 1.0 }], [R, bR, "crane", { from: [-0.12, 0.6, 1], rise: 0.15, pull: 1.0 }], [ALL, box, "reveal", { from: [0, 0.22, 1], pull0: 1.08, pull: 1.0 }]])); };
});
