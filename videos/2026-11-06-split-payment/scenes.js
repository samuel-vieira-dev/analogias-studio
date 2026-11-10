// ============================================================================
// videos/2026-11-06-split-payment/scenes.js
// Split payment: o imposto separado no meio do pagamento. Gancho do Samuel: "Daqui a alguns meses, sua
// venda não vai cair inteira na conta." → no balcão, o celular com PIX RECEBIDO e a pilha de moedas: o topo
// da pilha fica vermelho e sai, sobra o buraco → imagina: a maquete da fábrica e da loja, a caixa vai pela
// estrada, as moedas voltam por um cano de vidro e uma parte some numa caixa no meio do caminho → no banco
// (a sala-cofre), o funil BANCO e o separador: uma moeda em quatro cai no pote do GOVERNO, o resto no VOCÊ →
// analogia: o contracheque (INSS e imposto de renda puxam moedas antes do cofrinho) que vira VENDA ENTRE
// EMPRESAS → a nota fiscal junto da pilha, o painel JÁ PAGO / FALTA, a ampulheta dos três dias úteis → a
// padaria: mesmo preço, PIX pago, taxa zero → a linha do tempo em três pedestais (TESTES, 2027, 2028) → os
// dois lados: o CAIXA 2 trancado e o imposto passando por cima do caixa; hoje o imposto fica na bandeja até
// o dia 25, com o split sai na hora → BOM ou RUIM. Números e fontes em fatos.md; nenhum valor inventado.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / splTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  inteira: 2.84, conta1: 3.3, c1: 4.2,
  imagina: 4.34, fabrica: 5.72, vende: 6.84, loja: 7.42, paga: 8.28, pix: 8.76, certinho: 10.56, mas: 11.28, menos: 11.7,
  alguem: 13.64, parte: 14.6, caminho: 15.0, c2: 15.62,
  split: 16.08, dividido: 17.68, banco: 20.36, separa: 20.54, governo: 22.36, voce: 24.28, resto: 25.16, c3: 25.45,
  salario: 26.22, inss: 26.76, renda: 27.84, saem: 28.84, cair: 29.54, agora: 30.92, empresas: 32.62, c4: 33.35,
  nota: 36.06, junto: 37.06, consulta: 38.14, separa2: 39.12, falta: 39.88, demais: 41.12, volta: 41.84, uteis: 43.36, c5: 44.1,
  padaria: 45.62, comeco: 46.66, preco: 48.96, imposto: 49.86, taxa: 51.42, c6: 52.25,
  testando: 53.56, previsao: 56.22, y2027: 58.12, opcional: 59.84, boleto: 61.36, obrigatorio: 63.18, y2028: 65.26, regra: 67.36, c7: 67.85,
  sonegar: 69.24, passa: 71.0, outro: 72.72, caixa: 75.7, seguinte: 76.62, comsplit: 77.9, hora: 79.4, c8: 80.3,
  bom: 82.54, sonega: 83.76, ruim: 84.58, aperta: 85.54, certo: 87.7, end: 90.0,
};
// In-scene cut (also in video.json → cuts).
const B8 = 72.45;
const SPL_NAVY = "#1d3557", SPL_PIX = "#2bb3a3", SPL_INK = "#1b1612";

// ---------------------------------------------------------------- shared helpers
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function splTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
const splIn = (t, a, b) => t >= a && t < b;
// An invisible box standing in for a region (the glass pipe) in framing and in the QA: 8 vertices, no pixels.
function splProxy(min, max) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(max[0] - min[0], max[1] - min[1], max[2] - min[2]), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  b.position.set((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2); b.userData.noShadow = true; return b;
}
// A coin lying flat (gold, reeded edge from the chart coins). Origin: bottom centre.
const splCoinGeo = coinGeometry(0.034, 0.008);
function splCoin(color = "#c9a24e") { const m = new THREE.Mesh(splCoinGeo, coinMetalMat(color)); m.userData.noShadow = true; return m; }
// Glass pipe along `points` with steel collars every so often. API { group, curve, at(u) }
function splPipe(points, { r = 0.05, collars = 5, opacity = 0.2 } = {}) {
  const g = new THREE.Group(), curve = new THREE.CatmullRomCurve3(points.map((p) => new V3(...p)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, r, 20, false), glassMat({ opacity, color: "#d6ecf2" })); tube.renderOrder = 10; tube.userData.noShadow = true; g.add(tube);
  const steel = pmat("#9aa0a8", { metalness: 0.9, roughness: 0.3 }), q = new THREE.Quaternion(), Z = new V3(0, 0, 1);
  for (let i = 0; i <= collars; i++) {
    const u = i / collars, c = new THREE.Mesh(new THREE.TorusGeometry(r + 0.006, 0.01, 8, 28), steel);
    c.position.copy(curve.getPointAt(u)); q.setFromUnitVectors(Z, curve.getTangentAt(u).normalize()); c.quaternion.copy(q); g.add(c);
  }
  return { group: g, curve, at: (u) => curve.getPointAt(clamp(u)) };
}

// ---------------------------------------------------------------- phone on a stand
// Phone screen states: "recebido" (PIX RECEBIDO), "pagar" (PIX · PADARIA, PAGAR), "pago" (PIX PAGO), "taxa"
// (TAXA DO PIX R$ 0,00), "pix" (just the PIX tile).
function splPaintPhone(ph, mode) {
  if (ph.mode === mode) return; ph.mode = mode;
  const x = ph.ctx; x.fillStyle = "#0d1117"; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#8b949e"; x.font = "600 34px Inter"; x.fillText("9:41", 110, 60); x.fillRect(560, 48, 90, 26);
  const check = (cx, cy, rr, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, rr, 0, 6.2832); x.fill(); x.strokeStyle = "#ffffff"; x.lineWidth = rr * 0.18; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath(); x.moveTo(cx - rr * 0.45, cy + rr * 0.02); x.lineTo(cx - rr * 0.1, cy + rr * 0.36); x.lineTo(cx + rr * 0.5, cy - rr * 0.38); x.stroke(); };
  const pixTile = (cy) => { x.fillStyle = SPL_PIX; roundRect(x, 210, cy - 80, 300, 160, 40); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 110px Inter"; x.fillText("PIX", 360, cy + 6); };
  if (mode === "recebido" || mode === "pago") {
    check(360, 520, 190, "#1f9d63");
    x.fillStyle = "#ffffff"; x.font = "900 120px Inter"; x.fillText("PIX", 360, 860);
    x.font = "900 96px Inter"; x.fillText(mode === "recebido" ? "RECEBIDO" : "PAGO", 360, 990);
  } else if (mode === "pagar") {
    pixTile(470); x.fillStyle = "#c9d1d9"; x.font = "800 70px Inter"; x.fillText("PADARIA", 360, 720);
    x.fillStyle = "#1f9d63"; roundRect(x, 120, 1040, 480, 150, 40); x.fill(); x.fillStyle = "#ffffff"; x.font = "900 84px Inter"; x.fillText("PAGAR", 360, 1118);
  } else if (mode === "taxa") {
    pixTile(380); x.fillStyle = "#c9d1d9"; x.font = "800 66px Inter"; x.fillText("TAXA DO PIX", 360, 680);
    x.fillStyle = "#3ddc84"; x.font = "900 130px Inter"; x.fillText("R$ 0,00", 360, 860);
    check(360, 1150, 120, "#1f9d63");
  } else pixTile(700);
  ph.tex.needsUpdate = true;
}
// Phone standing in a black desk stand (base, back rest, front lip). Origin: table top, centre. API { group, phone, set(mode) }
function splPhoneStand(mode = "pix", s = 0.3) {
  const g = new THREE.Group(), dark = pmat("#1a1b1e", { roughness: 0.32, clearcoat: 0.7 });
  const base = new THREE.Mesh(rbox(0.28 * s / 0.3, 0.024, 0.18, 0.008), dark); base.position.y = 0.012; g.add(base);
  const lip = new THREE.Mesh(rbox(0.28 * s / 0.3, 0.03, 0.02, 0.006), dark); lip.position.set(0, 0.039, 0.05); g.add(lip);
  const tilt = 0.18, H = 1.64 * s, holder = new THREE.Group(); holder.position.set(0, 0.026, 0.035); holder.rotation.x = -tilt; g.add(holder);
  const rest = new THREE.Mesh(rbox(0.16 * s / 0.3, H * 0.7, 0.014, 0.006), dark); rest.position.set(0, H * 0.35, -0.022); holder.add(rest);
  const p = makePhone(); p.group.scale.setScalar(s); p.group.position.set(0, H / 2 + 0.004, 0.0); holder.add(p.group);
  g.add(contactShadow(0.42 * s / 0.3, 0.32));
  splPaintPhone(p, mode);
  return { group: g, phone: p.group, set: (m) => splPaintPhone(p, m) };
}

// ---------------------------------------------------------------- looks
function splShopLook(set, t, flash = 0) {
  floor.visible = false; set.update(t); set.flare(flash);
  key.intensity = 1.85; key.color.set("#ffd6b0"); hemi.intensity = 0.48; hemi.color.set("#dfe6ff"); hemi.groundColor.set("#22160e");
  scene.fog.color.set("#14100c");
}
function splHallLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.75; key.color.set("#ffd9b8"); hemi.intensity = 0.45; hemi.color.set("#c9d8ff"); hemi.groundColor.set("#1a1612");
  scene.fog.color.set("#10141c");
}
function splVaultLook(room, t, beacon = 0) {
  floor.visible = false; room.update(t); room.beacon(beacon); room.lights(0.9);
  key.intensity = 1.9; key.color.set("#fff0dc"); hemi.intensity = 0.42; hemi.color.set("#cfdcff"); hemi.groundColor.set("#14110e");
  scene.fog.color.set("#0b0d10");
}
function splOfficeLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.8; key.color.set("#ffd6b0"); hemi.intensity = 0.45; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
function splServerLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.7; key.color.set("#e6eeff"); hemi.intensity = 0.42; hemi.color.set("#a9c4ff"); hemi.groundColor.set("#0e1218");
  scene.fog.color.set("#070b12");
}

// ============================================================ 1 · gancho: a venda não cai inteira
// The shop counter at night: the cash register (back left), the phone on its stand (PIX RECEBIDO, back
// right) and a pile of coins in front. On "inteira" the top of the pile turns red and slides away; a red
// glass ghost marks the missing slice. Seen from above the counter, so the three stack up in the frame.
addScene("gancho", 0, A.c1, (S) => {
  const set = makeBakerySet({ seed: 4, tile: "#23324a", lampsX: [-1.5, 1.5] }); S.backdrop(set.group);
  const Y = set.counterY;
  const reg = makeCashRegister({ display: "PIX" }); reg.group.position.set(-0.24, Y, -0.1); reg.group.rotation.y = 0.2; S.add(reg.group);
  const ph = splPhoneStand("recebido"); ph.group.position.set(0.32, Y, -0.08); ph.group.rotation.y = -0.3; S.add(ph.group);
  const pile = new THREE.Group(); pile.position.set(0.1, Y, 0.2); S.add(pile);
  const low = makeCoinColumn(10, { r: 0.075, t: 0.02, seed: 3 }); pile.add(low.group);
  const top = makeCoinColumn(5, { r: 0.075, t: 0.02, seed: 4 }); top.group.position.y = 0.2; pile.add(top.group);
  const ghost = makeCoinColumn(5, { r: 0.075, t: 0.02, seed: 4, material: glassMat({ color: "#ff6a5a", opacity: 0.28 }) }); ghost.group.position.y = 0.2; pile.add(ghost.group);
  const red = coinMetalMat("#d23a2a"), gold = coinMetalMat();
  const OFF = A.inteira - 0.1;
  const anim = (t) => {
    splShopLook(set, t, 0.5 * beat(t, A.conta1, 0.8));
    popIn(pile, t, 0.12, 0.4);
    top.material(t > OFF ? red : gold);
    const k = eOut(lin(t, OFF + 0.15, OFF + 0.85));
    top.group.position.set(0.55 * k, 0.2 + 0.32 * k, -0.25 * k); top.group.scale.setScalar(Math.max(0.0001, 1 - k)); top.group.visible = k < 0.99;
    ghost.group.visible = t > OFF + 0.2; ghost.group.scale.setScalar(Math.max(0.0001, sm(t, OFF + 0.2, OFF + 0.5)));
    fill.position.set(0.1, Y + 0.9, 1.0); fill.color.set(t > OFF ? "#ffb08a" : "#ffd59a"); fill.intensity = 1.2 + 0.8 * beat(t, A.inteira, 0.6);
  };
  const T2 = 2.45;
  S.hero(reg.group, "caixa registradora", { when: (t) => t > 0.5 && t < T2 - 0.45 });
  S.hero(ph.group, "celular com pix recebido", { when: (t) => t > 0.5 });
  S.hero(low.group, "pilha de moedas", { when: (t) => t > 0.6 });
  S.solid(reg.group, "caixa"); S.solid(ph.group, "celular");
  const bAll = envelope([reg.group, ph.group, pile], anim, 0.5, T2), bPile = envelope([ph.group, low.group, ghost.group], anim, OFF + 0.5, A.c1);
  return (t) => {
    anim(t);
    let p = splTrack(t, [[0, bAll, "push", { from: [0.08, 0.75, 1], pull0: 1.2, pull: 1.02 }], [T2, bPile, "orbit", { from: [0.05, 0.55, 1], deg: 18, pull: 1.02 }]], A.c1, 0.45);
    p = CAM.shake(p, t, A.conta1, 0.012, 0.35); CAM.apply(p);
  };
});

// ============================================================ 2 · imagina: a fábrica, a loja e o cano
// A model on a low black plinth in a warehouse at night, seen from above: the factory (left) and a little
// shop (right) joined by a road. The box goes to the shop; the coins come back in a glass pipe on two steel
// posts; one coin in three goes into a dark box in the middle of the pipe and never comes out. The jar on the
// plinth SUA CONTA fills only so far.
function splAwningTex() {
  return cachedTex("spl-awning", () => { const c = makeCanvas(256, 64), x = c.getContext("2d"); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#f4e8da" : "#d4472a"; x.fillRect(i * 32, 0, 32, 64); } return texFrom(c); });
}
// Model shop: plastered walls, flat roof, lit shop window and glass door, striped awning, the sign LOJA on
// the roof's front edge. Origin: floor centre; front +z. Returns { group }
function splShopModel({ w = 0.62, h = 0.3, d = 0.42 } = {}) {
  const g = new THREE.Group(), wall = mat("#ffffff", { map: tileTex(plasterTex("#c9b79c"), 1, 1), roughness: 0.9 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.006), wall); body.position.y = h / 2; g.add(body);
  const roof = new THREE.Mesh(rbox(w + 0.03, 0.03, d + 0.03, 0.006), pmat("#3a3632", { roughness: 0.7 })); roof.position.y = h + 0.015; g.add(roof);
  const glow = new THREE.MeshBasicMaterial({ color: "#ffd59a", toneMapped: false });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.5, h * 0.42), glow); win.position.set(-w * 0.16, h * 0.34, d / 2 + 0.002); g.add(win);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.18, h * 0.6), glow); door.position.set(w * 0.28, h * 0.3, d / 2 + 0.002); g.add(door);
  const frame = pmat("#22252a", { metalness: 0.5, roughness: 0.4 });
  for (const [x0, ww, hh, yy] of [[-w * 0.16, w * 0.5, h * 0.42, h * 0.34], [w * 0.28, w * 0.18, h * 0.6, h * 0.3]]) {
    for (const sy of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.012, 0.008, 0.008), frame); b.position.set(x0, yy + sy * hh / 2, d / 2 + 0.004); g.add(b); }
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.008, hh + 0.012, 0.008), frame); b.position.set(x0 + sx * ww / 2, yy, d / 2 + 0.004); g.add(b); }
  }
  const aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.008, 0.1), [mat("#b03a22"), mat("#b03a22"), mat("#ffffff", { map: splAwningTex() }), mat("#b03a22"), mat("#b03a22"), mat("#b03a22")]);
  aw.position.set(0, h * 0.66, d / 2 + 0.045); aw.rotation.x = 0.35; g.add(aw);
  const sign = makePlate("LOJA", w * 1.0, h * 0.76, { bg: SPL_NAVY, fg: "#ffffff", depth: 0.012 }); sign.position.set(0, h + 0.03 + h * 0.38, d / 2 - 0.02); g.add(sign);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g };
}
// Small taped cardboard box. Origin: bottom centre.
function splBox(w = 0.13, h = 0.09, d = 0.11) {
  const g = new THREE.Group(), card = mat("#ffffff", { map: tileTex(cardboardTex(), 1, 1), roughness: 0.88 });
  const b = new THREE.Mesh(rbox(w, h, d, 0.006), card); b.position.y = h / 2; g.add(b);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, 0.002, d + 0.002), mat("#d9c9a0", { transparent: true, opacity: 0.7, roughness: 0.3 })); tape.position.y = h + 0.001; g.add(tape);
  return g;
}
// Thin steel post from a point down to the floor y0, with a foot plate (holds the pipe up: nothing floats).
function splPost(p, y0, r = 0.012) {
  const g = new THREE.Group(), steel = pmat("#8a9098", { metalness: 0.85, roughness: 0.32 }), h = p.y - y0;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), steel); post.position.set(p.x, y0 + h / 2, p.z); g.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 3.2, r * 3.6, 0.01, 20), steel); foot.position.set(p.x, y0 + 0.005, p.z); g.add(foot);
  return g;
}
addScene("caminho", A.c1, A.c2, (S) => {
  const set = makeWarehouseSet({ wallZ: -4.2, ceil: 4.6, seed: 9 }); S.backdrop(set.group);
  const base = makeLabelPlinth(null, { w: 2.5, h: 0.32, d: 1.6 }); S.add(base.group);
  const T = base.top;
  const road = new THREE.Group(); road.position.set(0, T, 0.3); S.add(road);
  const asph = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.008, 0.22), mat("#ffffff", { map: tileTex(asphaltTex(), 4, 1), roughness: 0.9 })); asph.position.y = 0.004; road.add(asph);
  for (let i = 0; i < 6; i++) { const ds = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.012), mat("#e0b21a")); ds.rotation.x = -Math.PI / 2; ds.position.set(-0.42 + i * 0.17, 0.0085, 0); road.add(ds); }
  const fac = makeFactoryModel({ w: 0.72, d: 0.46, h: 0.3, drift: -0.15 }); fac.group.position.set(-0.86, T, -0.12); S.add(fac.group);
  const shop = splShopModel(); shop.group.position.set(0.86, T, -0.12); S.add(shop.group);
  const box = splBox(); S.add(box);
  // the jar on its plinth in front of the factory, where the money lands
  const acc = makeLabelPlinth("SUA CONTA", { w: 0.46, h: 0.12, d: 0.34, bg: GREEN }); acc.group.position.set(-0.86, T, 0.5); S.add(acc.group);
  const jar = makeCoinJar({ r: 0.12, h: 0.26, label: "R$", n: 140, seed: 5 }); jar.group.position.set(-0.86, T + acc.top, 0.5); S.add(jar.group);
  const pipe = splPipe([[0.7, T + 0.36, -0.12], [0.52, T + 0.66, -0.06], [0.12, T + 0.8, 0.06], [-0.3, T + 0.8, 0.2], [-0.72, T + 0.74, 0.4], [-0.86, T + 0.56, 0.5]], { r: 0.045, collars: 6, opacity: 0.32 }); S.add(pipe.group);
  for (const u of [0.22, 0.72]) S.add(splPost(pipe.at(u).add(new V3(0, -0.045, 0)), T));
  // the dark box in the middle of the pipe, on its own post: coins go in, fewer come out
  const U_BOX = 0.45, bp = pipe.at(U_BOX), mystery = new THREE.Group(); mystery.position.copy(bp); S.add(mystery);
  const mbM = pmat("#1c1e22", { roughness: 0.35, metalness: 0.5, emissive: "#ff2a1a", emissiveIntensity: 0 });
  const mb = new THREE.Mesh(rbox(0.2, 0.18, 0.18, 0.012), mbM); mystery.add(mb);
  const q = makePlate("?", 0.13, 0.13, { bg: "#2a2c30", fg: ORANGE, depth: 0.004 }); q.position.set(0, 0, 0.092); mystery.add(q);
  S.add(splPost(bp.clone().add(new V3(0, -0.09, 0)), T, 0.016));
  const pix = makePlate("PIX", 0.2, 0.08, { bg: SPL_PIX, fg: "#ffffff", depth: 0.006 }); pix.position.set(0.7, T + 0.42, -0.04); S.add(pix);
  const N = 12, GAP = 0.32, DUR = 2.3, T0 = A.paga + 0.1, coins = [];
  for (let i = 0; i < N; i++) { const c = splCoin(); S.add(c); coins.push({ c, t0: T0 + i * GAP, lost: i % 3 === 1 }); }
  const arrived = (t) => coins.filter((o) => !o.lost && t > o.t0 + DUR).length;
  const anim = (t) => {
    splHallLook(set, t); fac.update(t, 1);
    // the box leaves the factory's door, runs along the road and goes in the shop's door
    const kb = sm(t, A.fabrica + 0.3, A.loja + 0.1);
    box.position.set(lerp(-0.5, 0.56, kb), T + 0.008, 0.3); box.visible = splIn(t, A.fabrica + 0.2, A.loja + 0.35);
    for (const o of coins) {
      const u = (t - o.t0) / DUR; o.c.visible = u > 0 && u < 1 && !(o.lost && u > U_BOX);
      if (o.c.visible) o.c.position.copy(pipe.at(u)).add(new V3(0, -0.004, 0));
    }
    jar.fill(0.05 + 0.05 * arrived(t));
    const km = sm(t, A.alguem - 0.1, A.alguem + 0.3); mbM.emissiveIntensity = 0.55 * km * (0.75 + 0.25 * Math.sin(t * 9)); q.scale.setScalar(1 + 0.15 * beat(t, A.parte, 0.5));
    fill.position.set(0.2, T + 1.4, 1.6); fill.color.set(t > A.alguem ? "#ff9a7a" : "#ffd59a"); fill.intensity = 1.3 + 0.8 * beat(t, A.parte, 0.6);
  };
  const S2 = A.paga - 0.3, S3 = A.mas - 0.2, S4 = A.alguem - 0.25;
  const pipeHalf = splProxy([-0.05, T + 0.3, -0.16], [0.78, T + 0.84, 0.12]);
  const pipeEnd = splProxy([-1.0, T + 0.4, 0.3], [-0.6, T + 0.86, 0.68]); S.add(pipeHalf); S.add(pipeEnd);
  S.hero(fac.group, "maquete de fábrica", { when: (t) => splIn(t, A.c1 + 0.3, S2 - 0.45) });
  S.hero(shop.group, "maquete de loja", { when: (t) => t > A.c1 + 0.3 && t < S3 - 0.45 });
  S.hero(pipeHalf, "cano de vidro com moedas", { when: (t) => splIn(t, A.c1 + 0.3, S3 - 0.45) });
  S.hero(jar.group, "pote de moedas", { when: (t) => splIn(t, S3 + 0.45, S4 - 0.45) }); S.hero(acc.group, "pedestal sua conta", { when: (t) => splIn(t, S3 + 0.45, S4 - 0.45) }); S.hero(pipeEnd, "ponta do cano", { when: (t) => splIn(t, S3 + 0.45, S4 - 0.45) });
  S.hero(mystery, "caixa escura no meio do cano", { when: (t) => t > S4 + 0.45 });
  S.solid(fac.group, "fábrica", { restsOn: ["base"] }); S.solid(shop.group, "loja", { restsOn: ["base"] }); S.solid(base.group, "base");
  const bAll = envelope([fac.group, shop.group, pipeHalf, pipeEnd], anim, A.c1, S2), bPipe = envelope([shop.group, pipeHalf], anim, S2, S3);
  const bJar = envelope([acc.group, jar.group, pipeEnd], anim, S3, S4), bBox = envelope([mystery], anim, S4, A.c2); bBox.expandByScalar(0.05);
  return (t) => {
    anim(t);
    let p = splTrack(t, [[A.c1, bAll, "crane", { from: [0.0, 0.95, 1], rise: 0.12, pull: 1.03 }], [S2, bPipe, "truck", { from: [0.1, 0.45, 1], side: 0.25, pull: 1.03 }],
      [S3, bJar, "push", { from: [-0.1, 0.4, 1], pull0: 1.2, pull: 1.02 }], [S4, bBox, "drop", { from: [0.05, 0.25, 1], rise: 0.12, pull: 1.05 }]], A.c2, 0.5);
    p = CAM.shake(p, t, A.parte, 0.01, 0.35); CAM.apply(p);
  };
});

// ============================================================ 3 · é o split payment: o banco separa na hora
// The bank's vault room: the pipe pours into the funnel BANCO; out of its spout every coin hits an orange
// steel splitter: one in four slides left into the jar on the GOVERNO plinth, the rest right into VOCÊ.
// Steel splitter: an orange wedge (triangle prism) on a post. Origin: floor centre. API { group, apex, hw, hh }
function splSplitter(apex = 1.06, hw = 0.21, hh = 0.16) {
  const g = new THREE.Group(), steel = pmat("#d9692e", { metalness: 0.6, roughness: 0.3, clearcoat: 0.4 });
  const sh = new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, hh); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }); geo.translate(0, 0, -0.15);
  const wedge = new THREE.Mesh(geo, steel); wedge.position.y = apex - hh; g.add(wedge);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, apex - hh, 16), pmat("#3c4148", { metalness: 0.7, roughness: 0.35 })); post.position.y = (apex - hh) / 2; g.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 32), pmat("#2a2c30", { metalness: 0.6, roughness: 0.4 })); foot.position.y = 0.015; g.add(foot);
  g.add(contactShadow(0.5, 0.5));
  return { group: g, apex, hw, hh };
}
// The bank's split: funnel, splitter, two plinths with jars. Coins come down the pipe into the funnel.
// Returns { fun, spl, left, right, coins, update(t) } with jars filling as the coins land.
function splBankRig(S, Z, { leftLabel = "GOVERNO", rightLabel = "VOCÊ", leftJar = "R$", rightJar = "R$", leftBg = SPL_NAVY, rightBg = GREEN, t0 = 0, n = 24, gap = 0.32, every = 4, pipe = true } = {}) {
  const fun = makeCoinFunnel("BANCO", { plateBg: SPL_NAVY, arm: "back", drop: 1.45 }); fun.group.position.set(0, 1.45, Z); S.add(fun.group);
  const spl = splSplitter(1.06); spl.group.position.set(0, 0, Z); S.add(spl.group);
  const mk = (x, label, jarLabel, bg) => {
    const pl = makeLabelPlinth(label, { w: 0.62, h: 0.32, d: 0.52, bg }); pl.group.position.set(x, 0, Z); S.add(pl.group);
    const jar = makeCoinJar({ r: 0.2, h: 0.44, label: jarLabel, n: 300, seed: x > 0 ? 7 : 8 }); jar.group.position.set(x, pl.top, Z); S.add(jar.group);
    jar.label.visible = false; // the plinth says whose jar it is
    return { pl, jar, x, landed: 0 };
  };
  const left = mk(-0.47, leftLabel, leftJar, leftBg), right = mk(0.47, rightLabel, rightJar, rightBg);
  let tube = null;
  if (pipe) { tube = splPipe([[-1.9, 2.75, Z - 0.6], [-1.1, 2.55, Z - 0.3], [-0.35, 2.32, Z - 0.05], [0, 2.18, Z]], { r: 0.05, collars: 4, opacity: 0.3 }); S.add(tube.group); }
  const coins = [];
  for (let i = 0; i < n; i++) { const c = splCoin(); S.add(c); coins.push({ c, t0: t0 + i * gap, side: i % every === 1 ? left : right }); }
  // path of one coin (seconds after it enters): 0–0.7 down the pipe, 0.7–0.95 into the funnel (hidden below
  // the lip), 0.95–1.15 out of the spout onto the apex, 1.15–1.35 down the wedge, 1.35–1.65 into the jar.
  const SPOUT = 1.45 - 0.22, APEX = spl.apex, HW = spl.hw, HH = spl.hh, rimY = 0.32 + 0.5;
  const pos = (o, s) => {
    const sx = o.side.x > 0 ? 1 : -1;
    if (s < 0.7) return tube ? tube.at(s / 0.7) : new V3(0, 2.3, Z);
    if (s < 0.95) { const k = (s - 0.7) / 0.25; return new V3(0, lerp(2.18, 1.95, k), Z); }
    if (s < 1.15) { const k = (s - 0.95) / 0.2; return new V3(0, lerp(SPOUT, APEX + 0.01, k * k), Z); }
    if (s < 1.35) { const k = (s - 1.15) / 0.2; return new V3(sx * HW * k, APEX + 0.01 - HH * k, Z); }
    const k = (s - 1.35) / 0.3; return new V3(lerp(sx * HW, o.side.x, k), lerp(APEX - HH + 0.01, rimY, k) + 0.06 * Math.sin(k * Math.PI), Z);
  };
  const update = (t) => {
    left.landed = 0; right.landed = 0;
    for (const o of coins) {
      const s = t - o.t0, hidden = s < (tube ? 0 : 0.95) || s > 1.65 || splIn(s, 0.86, 0.95);
      o.c.visible = !hidden; if (!hidden) o.c.position.copy(pos(o, s));
      if (s > 1.65) o.side.landed++;
    }
    left.jar.fill(0.04 + left.landed * 0.05); right.jar.fill(0.04 + right.landed * 0.035);
  };
  return { fun, spl, left, right, coins, update };
}
addScene("banco", A.c2, A.c3, (S) => {
  const room = makeVaultRoom({ seed: 6 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(0, 0, 0); S.backdrop(vd.group);
  const Z = 2.1, R = splBankRig(S, Z, { t0: A.c2 - 0.6, n: 26, gap: 0.36 });
  const anim = (t) => {
    splVaultLook(room, t); vd.open(0); vd.glow(0); vd.spin(0.05 * Math.sin(t * 0.7));
    R.update(t);
    R.left.pl.plate.scale.setScalar(1 + 0.08 * beat(t, A.governo, 0.5)); R.right.pl.plate.scale.setScalar(1 + 0.08 * beat(t, A.resto, 0.5));
    fill.position.set(0, 2.2, Z + 1.8); fill.color.set("#ffe0b8"); fill.intensity = 1.3 + 0.6 * beat(t, A.governo, 0.6);
  };
  const S2 = A.banco - 0.2, S3 = A.voce - 0.25;
  const F = [R.fun.group, R.spl.group], L = [R.left.pl.group, R.left.jar.group], Rt = [R.right.pl.group, R.right.jar.group];
  S.hero(R.fun.group, "funil banco"); S.hero(R.spl.group, "separador laranja");
  S.hero(R.left.jar.group, "pote do governo", { when: (t) => t < S3 - 0.45 }); S.hero(R.left.pl.group, "pedestal governo", { when: (t) => t < S3 - 0.45 });
  S.hero(R.right.jar.group, "pote você", { when: (t) => t < S2 - 0.45 || t > S3 + 0.45 }); S.hero(R.right.pl.group, "pedestal você", { when: (t) => t < S2 - 0.45 || t > S3 + 0.45 });
  S.solid(R.left.jar.group, "pote governo", { restsOn: ["pedestal governo"] }); S.solid(R.left.pl.group, "pedestal governo");
  S.solid(R.right.jar.group, "pote você", { restsOn: ["pedestal você"] }); S.solid(R.right.pl.group, "pedestal você");
  const bAll = envelope([...F, ...L, ...Rt], anim, A.c2, S2), bGov = envelope([...F, ...L], anim, S2, S3), bYou = envelope([...F, ...Rt], anim, S3, A.c3);
  return (t) => {
    anim(t);
    CAM.apply(splTrack(t, [[A.c2, bAll, "crane", { from: [0.1, 0.12, 1], rise: 0.12, pull: 1.02 }], [S2, bGov, "push", { from: [-0.2, 0.22, 1], pull0: 1.2, pull: 1.02 }], [S3, bYou, "truck", { from: [0.15, 0.22, 1], side: 0.35, pull: 1.03 }]], A.c3, 0.5));
  };
});

// ============================================================ 4 · igual ao salário
// The desk in an office at night: the payslip in an acrylic holder, a pile of coins and the jar SUA CONTA.
// On "INSS" the top coins turn red and fly into the INSS line; on "imposto de renda", the next ones; on "cair
// na conta" the rest hop into the jar. On "agora" the paper turns around into VENDA ENTRE EMPRESAS.
const SPL_SLIP = {
  salario: { head: "CONTRACHEQUE", band: SPL_NAVY, rows: [["SALÁRIO", "BRUTO", "#1b1612"], ["− INSS", "", "#b3241a"], ["− IMPOSTO DE RENDA", "", "#b3241a"], ["= CAI NA CONTA", "", "#1f7a46"]] },
  venda: { head: "VENDA ENTRE EMPRESAS", band: "#c4501e", rows: [["VALOR DA", "VENDA", "#1b1612"], ["− CBS", "", "#b3241a"], ["− IBS", "", "#b3241a"], ["= CAI NA CONTA", "", "#1f7a46"]] },
};
const SPL_ROWS_Y = [190, 300, 400, 520];
function splSlipTex(kind, hi = -1) {
  const P = SPL_SLIP[kind], c = makeCanvas(520, 660), x = c.getContext("2d");
  x.fillStyle = "#f6f3ec"; x.fillRect(0, 0, 520, 660); speckle(x, 520, 660, 12, 2500, 0.03, 0.02, 1.5);
  x.fillStyle = P.band; x.fillRect(0, 0, 520, 104);
  x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle"; let fs = 52; x.font = `900 ${fs}px Inter`;
  while (x.measureText(P.head).width > 480 && fs > 26) { fs -= 2; x.font = `900 ${fs}px Inter`; } x.fillText(P.head, 260, 54);
  P.rows.forEach(([a, b, col], i) => {
    const y = SPL_ROWS_Y[i];
    if (i === hi) { x.fillStyle = "rgba(255,106,43,0.28)"; x.fillRect(12, y - 40, 496, 80); }
    x.strokeStyle = "rgba(40,30,20,0.22)"; x.lineWidth = 2; x.beginPath(); x.moveTo(24, y + 42); x.lineTo(496, y + 42); x.stroke();
    x.fillStyle = col; x.textAlign = "left"; let f2 = 40; x.font = `900 ${f2}px Inter`; const label = b ? a + " " + b : a;
    while (x.measureText(label).width > 470 && f2 > 22) { f2 -= 2; x.font = `900 ${f2}px Inter`; } x.fillText(label, 30, y);
  });
  const t = texFrom(c); t.anisotropy = 8; return t;
}
// Acrylic document holder with the payslip; the paper can show either side. Origin: floor centre of the base.
// API { group, back (the tilted holder), paper, show(kind, hi), rowPoint(i) world-local point of row i }
function splSlipStand() {
  const g = new THREE.Group(), W = 0.5, H = 0.66, tilt = 0.16;
  const base = new THREE.Mesh(rbox(0.6, 0.035, 0.22, 0.01), pmat("#1c1c1e", { roughness: 0.3, clearcoat: 0.8 })); base.position.y = 0.0175; g.add(base);
  const back = new THREE.Group(); back.position.set(0, 0.035, -0.02); back.rotation.x = -tilt; g.add(back);
  const acr = new THREE.Mesh(new THREE.BoxGeometry(W + 0.06, H + 0.04, 0.008), glassMat({ opacity: 0.22 })); acr.position.set(0, (H + 0.04) / 2, -0.008); back.add(acr);
  const texs = {}, key0 = (k, h) => k + h;
  const pm = pmat("#ffffff", { map: splSlipTex("salario"), roughness: 0.85 });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(W, H), pm); paper.position.set(0, H / 2 + 0.02, 0.0); back.add(paper);
  let cur = "";
  const show = (kind, hi = -1) => { const id = key0(kind, hi); if (id === cur) return; cur = id; if (!texs[id]) texs[id] = splSlipTex(kind, hi); pm.map = texs[id]; pm.needsUpdate = true; };
  g.add(contactShadow(0.8, 0.5));
  return { group: g, back, paper, show, rowPoint: (i) => new V3(0.12, H / 2 + 0.02 + H * (0.5 - SPL_ROWS_Y[i] / 660), 0.02) };
}
// Executive desk: veneer top on two drawer pedestals. Origin: floor centre; returns { group, top }.
function splDesk({ w = 2.0, d = 0.95, top = 0.76 } = {}) {
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
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top };
}
addScene("salario", A.c3, A.c4, (S) => {
  const set = makeOfficeSet({ wallZ: -1.6, clear: -1.2, seed: 4 }); S.backdrop(set.group);
  const desk = splDesk(); desk.group.position.z = -0.2; S.add(desk.group);
  const top = desk.top;
  const slip = splSlipStand(); slip.group.position.set(-0.32, top, -0.42); S.add(slip.group);
  const pile = new THREE.Group(); pile.position.set(0.22, top, -0.12); S.add(pile);
  const keep = makeCoinColumn(8, { r: 0.07, t: 0.02, seed: 6 }); pile.add(keep.group);
  const ir = makeCoinColumn(3, { r: 0.07, t: 0.02, seed: 7 }); ir.group.position.y = 0.16; pile.add(ir.group);
  const inss = makeCoinColumn(3, { r: 0.07, t: 0.02, seed: 8 }); inss.group.position.y = 0.22; pile.add(inss.group);
  const acc = makeLabelPlinth("SUA CONTA", { w: 0.54, h: 0.17, d: 0.4, bg: GREEN, plateH: 0.14 }); acc.group.position.set(0.66, top, -0.2); S.add(acc.group);
  const jar = makeCoinJar({ r: 0.17, h: 0.34, label: "R$", n: 200, seed: 9 }); jar.group.position.set(0.66, top + acc.top, -0.2); S.add(jar.group);
  const red = coinMetalMat("#d23a2a"), gold = coinMetalMat();
  const pileW = pile.position.clone(), rowW = (i) => slip.rowPoint(i).applyAxisAngle(new V3(1, 0, 0), -0.16).add(new V3(-0.32, top + 0.035, -0.44));
  const fly = (col, y0, at, row, t) => {
    col.material(t > at - 0.15 ? red : gold);
    const k = eOut(lin(t, at, at + 0.55)), p0 = new V3(0, y0, 0), p1 = rowW(row).sub(pileW);
    col.group.position.copy(p0.lerp(p1, k)); col.group.position.y += 0.12 * Math.sin(k * Math.PI);
    col.group.scale.setScalar(Math.max(0.0001, 1 - 0.85 * k)); col.group.visible = k < 0.98;
  };
  const anim = (t) => {
    splOfficeLook(set, t);
    const hi = t > A.cair - 0.2 && t < A.agora ? 3 : t > A.renda - 0.15 && t < A.saem ? 2 : t > A.inss - 0.15 && t < A.renda - 0.15 ? 1 : -1;
    const flip = sm(t, A.agora - 0.05, A.agora + 0.6);
    slip.back.rotation.y = Math.PI * 2 * flip; slip.show(flip > 0.5 ? "venda" : "salario", flip > 0.5 ? -1 : hi);
    fly(inss, 0.22, A.inss, 1, t); fly(ir, 0.16, A.renda, 2, t);
    // the rest hops into the jar one coin at a time
    const kj = lin(t, A.cair - 0.1, A.cair + 0.7); keep.set(1 - kj); keep.group.visible = kj < 0.99; jar.fill(0.05 + 0.45 * kj);
    fill.position.set(-0.1, top + 1.0, 1.2); fill.color.set(hi > 0 && hi < 3 ? "#ffb08a" : "#ffd9a8"); fill.intensity = 1.1 + 0.7 * beat(t, A.inss, 0.5) + 0.7 * beat(t, A.renda, 0.5);
  };
  const S2 = A.saem - 0.1, S3 = A.agora - 0.3;
  S.hero(slip.group, "contracheque num suporte de acrílico", { when: (t) => t > A.c3 + 0.3 });
  S.hero(keep.group, "pilha de moedas", { when: (t) => t < A.cair - 0.2 });
  S.hero(jar.group, "pote de moedas", { when: (t) => splIn(t, S2 + 0.45, S3 - 0.45) }); S.hero(acc.group, "pedestal sua conta", { when: (t) => splIn(t, S2 + 0.45, S3 - 0.45) });
  S.solid(slip.group, "contracheque", { restsOn: ["mesa"] }); S.solid(jar.group, "pote", { restsOn: ["pedestal"] }); S.solid(acc.group, "pedestal", { restsOn: ["mesa"] }); S.solid(desk.group, "mesa");
  const bA = envelope([slip.group, pile], anim, A.c3, S2), bB = envelope([slip.group, pile, acc.group, jar.group], anim, S2, S3), bC = envelope([slip.group], anim, S3, A.c4);
  bC.expandByScalar(0.03);
  return (t) => {
    anim(t);
    let p = splTrack(t, [[A.c3, bA, "push", { from: [-0.1, 0.32, 1], pull0: 1.25, pull: 1.02 }], [S2, bB, "reveal", { from: [0.1, 0.42, 1], pull0: 1.04, pull: 1.0 }], [S3, bC, "orbit", { from: [0.0, 0.16, 1], deg: 22, pull: 1.04 }]], A.c4, 0.45);
    p = CAM.shake(p, t, A.inss + 0.5, 0.008, 0.3); CAM.apply(p);
  };
});

// ============================================================ 5 · a nota fiscal vai junto
// A desk in the server hall: the NOTA FISCAL stands in its holder next to the pile of coins; behind them the
// panel JÁ PAGO / FALTA lights up when the bank asks the government; the coins that are missing slide into
// the panel's slot; one too many goes too, and the hourglass runs three working days until it comes back.
function splNotaTex() {
  return cachedTex("spl-nota", () => {
    const c = makeCanvas(420, 600), x = c.getContext("2d"), r = mulberry32(41);
    x.fillStyle = "#f7f4ec"; x.fillRect(0, 0, 420, 600); speckle(x, 420, 600, 14, 1800, 0.03, 0.02, 1.5);
    x.fillStyle = "#2a3f5f"; x.fillRect(0, 0, 420, 96);
    x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 58px Inter"; x.fillText("NOTA FISCAL", 210, 50);
    [["VENDEDOR", "FÁBRICA"], ["COMPRADOR", "LOJA"], ["PAGAMENTO", "PIX"], ["IMPOSTO", "NA NOTA"]].forEach(([a, b], i) => {
      const y = 150 + i * 70; x.fillStyle = "#6a625a"; x.textAlign = "left"; x.font = "800 26px Inter"; x.fillText(a, 26, y);
      x.fillStyle = i === 3 ? "#b3241a" : SPL_INK; x.textAlign = "right"; x.font = "900 32px Inter"; x.fillText(b, 394, y);
      x.strokeStyle = "rgba(40,30,20,0.2)"; x.lineWidth = 2; x.beginPath(); x.moveTo(24, y + 30); x.lineTo(396, y + 30); x.stroke();
    });
    x.fillStyle = "#111"; for (let px = 30; px < 390;) { const w = 2 + Math.floor(r() * 5); if (r() < 0.6) x.fillRect(px, 470, w, 100); px += w + 2; }
    return texFrom(c);
  });
}
// A paper standing in a black slotted base, leaning back a little. Origin: table top. API { group }
function splPaperStand(tex, w = 0.3, h = 0.43) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(w * 0.9, 0.03, 0.12, 0.008), pmat("#1a1b1e", { roughness: 0.3, clearcoat: 0.8 })); base.position.y = 0.015; g.add(base);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pmat("#ffffff", { map: tex, roughness: 0.85, side: THREE.DoubleSide })); paper.position.set(0, 0.025 + h / 2 * Math.cos(0.12), -Math.sin(0.12) * h / 2); paper.rotation.x = -0.12; g.add(paper);
  g.add(contactShadow(w + 0.2, 0.3));
  return { group: g };
}
// Status panel: a dark screen on a stand with two rows, JÁ PAGO ✓ and FALTA, that light up; a slot under them.
// Origin: table top, centre. API { group, set(paid, missing), slot: local point }
function splStatusPanel() {
  const g = new THREE.Group(), dark = pmat("#16181c", { roughness: 0.3, clearcoat: 0.8 });
  const foot = new THREE.Mesh(rbox(0.36, 0.02, 0.2, 0.006), dark); foot.position.y = 0.01; g.add(foot);
  const neck = new THREE.Mesh(rbox(0.05, 0.12, 0.04, 0.006), dark); neck.position.set(0, 0.08, -0.04); g.add(neck);
  const body = new THREE.Mesh(rbox(0.62, 0.46, 0.05, 0.012), dark); body.position.set(0, 0.37, -0.04); g.add(body);
  const row = (text, y, on, off) => {
    const a = makePlate(text, 0.54, 0.13, { bg: off, fg: "#8a8f96", depth: 0.004 }), b = makePlate(text, 0.54, 0.13, { bg: on, fg: "#ffffff", depth: 0.005 });
    a.position.set(0, y, -0.012); b.position.set(0, y, -0.011); g.add(a); g.add(b); b.visible = false; return { a, b };
  };
  const paid = row("JÁ PAGO ✓", 0.5, "#1f7a46", "#24272c"), miss = row("FALTA", 0.35, "#c4501e", "#24272c");
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.014, 0.01), mat("#050505")); slot.position.set(0, 0.19, -0.012); g.add(slot);
  return { group: g, set(p, m) { paid.b.visible = p; paid.a.visible = !p; miss.b.visible = m; miss.a.visible = !m; }, slot: new V3(0, 0.19, 0) };
}
addScene("nota", A.c4, A.c5, (S) => {
  const set = makeServerHall({ wallZ: -2.4, ceil: 3.4, seed: 5 }); S.backdrop(set.group);
  const desk = splDesk({ w: 1.8, d: 0.9 }); desk.group.position.z = -0.1; S.add(desk.group);
  const top = desk.top;
  const nf = splPaperStand(splNotaTex(), 0.34, 0.49); nf.group.position.set(-0.36, top, -0.12); nf.group.rotation.y = 0.15; S.add(nf.group);
  const pile = new THREE.Group(); pile.position.set(0.0, top, 0.12); S.add(pile);
  const keep = makeCoinColumn(8, { r: 0.07, t: 0.02, seed: 11 }); pile.add(keep.group);
  const extra = makeCoinColumn(1, { r: 0.07, t: 0.02, seed: 12 }); extra.group.position.y = 0.16; pile.add(extra.group);
  const tax = makeCoinColumn(3, { r: 0.07, t: 0.02, seed: 13 }); tax.group.position.y = 0.18; pile.add(tax.group);
  const panel = splStatusPanel(); panel.group.position.set(0.36, top, -0.3); S.add(panel.group);
  const glass = makeHourglass({ h: 0.34 }); glass.group.position.set(0.38, top, 0.2); S.add(glass.group);
  const toSlot = panel.slot.clone().add(panel.group.position).sub(pile.position);
  const red = coinMetalMat("#d23a2a"), gold = coinMetalMat();
  const anim = (t) => {
    splServerLook(set, t); set.alarm(0);
    panel.set(t > A.consulta + 0.3, t > A.falta - 0.1);
    // the coins that are missing (3) go into the panel; then one too many (red) on "demais"; it comes back on "volta"
    const k1 = eOut(lin(t, A.separa2 + 0.1, A.separa2 + 0.7)); tax.group.position.copy(new V3(0, 0.18, 0).lerp(toSlot, k1)); tax.group.scale.setScalar(Math.max(0.0001, 1 - 0.8 * k1)); tax.group.visible = k1 < 0.98;
    const k2 = eOut(lin(t, A.demais - 0.1, A.demais + 0.5)), k3 = eOut(lin(t, A.uteis - 0.3, A.uteis + 0.3)), ke = k2 * (1 - k3);
    extra.material(t > A.demais - 0.2 && t < A.uteis + 0.3 ? red : gold);
    extra.group.position.copy(new V3(0, 0.16, 0).lerp(toSlot, ke)); extra.group.position.y += 0.08 * Math.sin(ke * Math.PI); extra.group.scale.setScalar(Math.max(0.0001, 1 - 0.8 * ke));
    popIn(glass.group, t, A.demais + 0.2, 0.4); glass.set(sm(t, A.volta, A.uteis - 0.2));
    fill.position.set(0.1, top + 1.1, 1.3); fill.color.set(t > A.falta ? "#ffc29a" : "#e6eeff"); fill.intensity = 1.2 + 0.6 * beat(t, A.consulta, 0.6) + 0.6 * beat(t, A.falta, 0.5);
  };
  const S2 = A.consulta - 0.25, S3 = A.demais - 0.25;
  S.hero(nf.group, "nota fiscal num suporte", { when: (t) => splIn(t, A.c4 + 0.3, S2 - 0.45) });
  S.hero(keep.group, "pilha de moedas", { when: (t) => t > A.c4 + 0.3 });
  S.hero(panel.group, "painel já pago e falta", { when: (t) => t > A.c4 + 0.3 });
  S.hero(glass.group, "ampulheta", { when: (t) => t > S3 + 0.6 });
  S.solid(panel.group, "painel", { restsOn: ["mesa"] }); S.solid(desk.group, "mesa"); S.solid(nf.group, "nota", { restsOn: ["mesa"] });
  const bA = envelope([nf.group, pile, panel.group], anim, A.c4 + 0.3, S2), bB = envelope([pile, panel.group], anim, S2, S3), bC = envelope([pile, panel.group, glass.group], anim, S3 + 0.5, A.c5);
  return (t) => {
    anim(t);
    let p = splTrack(t, [[A.c4, bA, "push", { from: [-0.1, 0.42, 1], pull0: 1.08, pull: 1.0 }], [S2, bB, "crane", { from: [0.1, 0.35, 1], rise: 0.15, pull: 1.03 }], [S3, bC, "orbit", { from: [0.05, 0.45, 1], deg: 20, pull: 1.02 }]], A.c5, 0.45);
    p = CAM.shake(p, t, A.falta, 0.008, 0.3); CAM.apply(p);
  };
});

// ============================================================ 6 · e você, no Pix da padaria?
// The bakery counter: the basket of rolls, the place card PÃO FRANCÊS (a green MESMO PREÇO card lands in
// front of it on "mesmo preço") and the phone on its stand: PIX · PADARIA → PAGO → TAXA DO PIX R$ 0,00.
addScene("padaria", A.c5, A.c6, (S) => {
  const set = makeBakerySet({ seed: 7 }); S.backdrop(set.group);
  const Y = set.counterY;
  const basket = makeBreadBasket({ r: 0.26 }); basket.group.position.set(-0.3, Y, -0.08); S.add(basket.group);
  const card = makePlaceCard("PÃO FRANCÊS", { w: 0.5, h: 0.15 }); card.group.position.set(0.02, Y, 0.08); S.add(card.group);
  const same = makePlaceCard("MESMO PREÇO", { w: 0.5, h: 0.15, bg: "#1f7a46", fg: "#ffffff" }); same.group.position.set(-0.28, Y, 0.3); S.add(same.group);
  const ph = splPhoneStand("pagar", 0.32); ph.group.position.set(0.34, Y, -0.1); ph.group.rotation.y = -0.22; S.add(ph.group);
  const SAME = A.preco - 0.45;
  const anim = (t) => {
    splShopLook(set, t, 0.35 * beat(t, A.preco, 0.7));
    const k = eOut(lin(t, SAME, SAME + 0.35)); same.group.visible = t >= SAME; same.group.position.y = Y + 0.18 * (1 - k);
    ph.set(t < A.padaria + 0.3 ? "pagar" : t < A.taxa - 0.2 ? "pago" : "taxa");
    fill.position.set(0.1, Y + 0.9, 1.0); fill.color.set("#ffd59a"); fill.intensity = 1.25 + 0.6 * beat(t, A.taxa, 0.6);
  };
  const S2 = A.preco - 0.75, S3 = A.taxa - 0.55;
  S.hero(basket.group, "cesto de pão francês", { when: (t) => t < S3 - 0.45 });
  S.hero(card.group, "placa pão francês", { when: (t) => t < S3 - 0.45 });
  S.hero(same.group, "placa mesmo preço", { when: (t) => splIn(t, SAME + 0.4, S3 - 0.45) });
  S.hero(ph.group, "celular com pix", { when: (t) => t < S2 - 0.45 || t > S3 + 0.45 });
  S.solid(ph.group, "celular"); S.solid(card.group, "placa"); S.solid(same.group, "placa verde", { when: (t) => t > SAME + 0.4 });
  const bAll = envelope([basket.group, card.group, ph.group], anim, A.c5, S2), bCard = envelope([basket.group, card.group, same.group], anim, SAME + 0.4, S3), bPh = envelope([ph.group], anim, S3, A.c6);
  bPh.expandByScalar(0.03);
  return (t) => {
    anim(t);
    CAM.apply(splTrack(t, [[A.c5, bAll, "crane", { from: [0.08, 0.6, 1], rise: 0.15, pull: 1.03 }], [S2, bCard, "push", { from: [-0.05, 0.6, 1], pull0: 1.15, pull: 1.0 }], [S3, bPh, "orbit", { from: [0.1, 0.25, 1], deg: 22, pull: 1.04 }]], A.c6, 0.45));
  };
});

// ============================================================ 7 · os testes, 2027 e 2028
// Three black plinths far apart in the office at night (the city in the windows behind), lit one after the
// other: TESTES (piles of silver tokens: money that is not real), 2027 (the Pix phone and a boleto),
// 2028 (a REGULAMENTO with empty lines, stamped A DEFINIR). The camera slides from one to the next.
function splBoletoTex() {
  return cachedTex("spl-boleto", () => {
    const c = makeCanvas(420, 600), x = c.getContext("2d"), r = mulberry32(31);
    x.fillStyle = "#f7f4ec"; x.fillRect(0, 0, 420, 600);
    x.fillStyle = SPL_INK; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 64px Inter"; x.fillText("BOLETO", 210, 70);
    x.strokeStyle = "rgba(30,20,10,0.35)"; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.strokeRect(24, 130 + i * 62, 372, 52); x.fillStyle = "rgba(30,20,10,0.25)"; x.fillRect(36, 150 + i * 62, 120 + r() * 120, 12); }
    x.fillStyle = "#111"; for (let px = 30; px < 390;) { const w = 2 + Math.floor(r() * 5); if (r() < 0.6) x.fillRect(px, 460, w, 110); px += w + 2; }
    return texFrom(c);
  });
}
function splRuleTex() {
  return cachedTex("spl-regra", () => {
    const c = makeCanvas(420, 600), x = c.getContext("2d");
    x.fillStyle = "#f7f4ec"; x.fillRect(0, 0, 420, 600); speckle(x, 420, 600, 21, 1600, 0.03, 0.02, 1.5);
    x.fillStyle = SPL_INK; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 50px Inter"; x.fillText("REGULAMENTO", 210, 64);
    x.font = "800 26px Inter"; x.fillStyle = "#6a625a"; x.fillText("SPLIT OBRIGATÓRIO", 210, 108);
    x.setLineDash([10, 10]); x.strokeStyle = "rgba(40,30,20,0.35)"; x.lineWidth = 3;
    for (let i = 0; i < 7; i++) { const y = 170 + i * 52; x.beginPath(); x.moveTo(30, y); x.lineTo(390, y); x.stroke(); }
    x.setLineDash([]); x.save(); x.translate(210, 330); x.rotate(-0.18);
    x.strokeStyle = "#c8231a"; x.lineWidth = 8; x.strokeRect(-160, -52, 320, 104); x.lineWidth = 3; x.strokeRect(-150, -42, 300, 84);
    x.fillStyle = "#c8231a"; x.font = "900 62px Inter"; x.fillText("A DEFINIR", 0, 4); x.restore();
    return texFrom(c);
  });
}
addScene("datas", A.c6, A.c7, (S) => {
  const set = makeOfficeSet({ wallZ: -2.2, clear: -1.2, seed: 6 }); S.backdrop(set.group);
  const X = [-1.55, 0, 1.55], bgs = ["#24272c", "#c4501e", "#7e1a1d"], labels = ["TESTES", "2027", "2028"];
  const pls = labels.map((l, i) => { const p = makeLabelPlinth(l, { w: 0.86, h: 0.55, d: 0.6, bg: bgs[i] }); p.group.position.set(X[i], 0, 0); S.add(p.group); return p; });
  const T = pls[0].top;
  const FAKE = coinMetalMat("#aab2bb");
  const fake = makeCoinColumn(9, { r: 0.1, t: 0.026, seed: 21, material: FAKE }); fake.group.position.set(X[0] - 0.12, T, 0.02); S.add(fake.group);
  const fake2 = makeCoinColumn(6, { r: 0.1, t: 0.026, seed: 22, material: FAKE }); fake2.group.position.set(X[0] + 0.14, T, -0.08); S.add(fake2.group);
  const ph = splPhoneStand("pix", 0.28); ph.group.position.set(X[1] - 0.16, T, 0.02); S.add(ph.group);
  const bol = splPaperStand(splBoletoTex()); bol.group.position.set(X[1] + 0.2, T, 0.0); bol.group.rotation.y = -0.18; S.add(bol.group);
  const rule = splPaperStand(splRuleTex(), 0.36, 0.5); rule.group.position.set(X[2], T, 0.0); S.add(rule.group);
  const glows = X.map((x) => { const gl = makeFloorGlow(1.2, 1.0, { color: "#ffd9a8", opacity: 0 }); gl.position.set(x, 0.012, 0.6); S.backdrop(gl); return gl; });
  const LIT = [A.c6 + 0.1, A.previsao - 0.3, A.obrigatorio - 0.3];
  const groups = [[fake.group, fake2.group], [ph.group, bol.group], [rule.group]];
  const anim = (t) => {
    splOfficeLook(set, t);
    groups.forEach((gs, i) => gs.forEach((o) => popIn(o, t, LIT[i], 0.45)));
    glows.forEach((gl, i) => { gl.material.opacity = 0.22 * sm(t, LIT[i], LIT[i] + 0.4); });
    pls.forEach((p, i) => p.plate.scale.setScalar(1 + 0.08 * beat(t, LIT[i] + 0.2, 0.6)));
    fill.position.set(t < LIT[1] ? X[0] : t < LIT[2] ? X[1] : X[2], 1.6, 1.4); fill.color.set("#ffd9a8"); fill.intensity = 1.2;
  };
  const S2 = LIT[1] - 0.2, S3 = LIT[2] - 0.2, S4 = A.regra - 0.6;
  S.hero(pls[0].group, "pedestal testes", { when: (t) => t < S2 - 0.45 }); S.hero(fake.group, "fichas prateadas", { when: (t) => splIn(t, LIT[0] + 0.5, S2 - 0.45) });
  S.hero(pls[1].group, "pedestal 2027", { when: (t) => splIn(t, S2 + 0.45, S3 - 0.45) }); S.hero(ph.group, "celular com pix", { when: (t) => splIn(t, S2 + 0.6, S3 - 0.45) }); S.hero(bol.group, "boleto num suporte", { when: (t) => splIn(t, S2 + 0.6, S3 - 0.45) });
  S.hero(pls[2].group, "pedestal 2028", { when: (t) => t > S3 + 0.45 }); S.hero(rule.group, "regulamento a definir num suporte", { when: (t) => t > S3 + 0.6 });
  pls.forEach((p, i) => S.solid(p.group, "pedestal " + i));
  S.solid(rule.group, "regulamento", { restsOn: ["pedestal 2"] }); S.solid(ph.group, "celular", { restsOn: ["pedestal 1"] }); S.solid(bol.group, "boleto", { restsOn: ["pedestal 1"] });
  const b0 = envelope([pls[0].group, fake.group, fake2.group], anim, LIT[0] + 0.5, S2), b1 = envelope([pls[1].group, ph.group, bol.group], anim, S2 + 0.5, S3);
  const b2 = envelope([pls[2].group, rule.group], anim, S3 + 0.5, A.c7);
  return (t) => {
    anim(t);
    CAM.apply(splTrack(t, [[A.c6, b0, "push", { from: [0.1, 0.45, 1], pull0: 1.2, pull: 1.02 }], [S2, b1, "truck", { from: [0.0, 0.42, 1], side: 0.22, pull: 1.03 }], [S3, b2, "push", { from: [-0.1, 0.42, 1], pull0: 1.15, pull: 1.02 }], [S4, b2, "reveal", { from: [0.1, 0.42, 1], pull0: 1.12, pull: 1.0 }]], A.c7, 0.45));
  };
});

// ============================================================ 8 · os dois lados
// A (mais difícil sonegar): the seller's counter in the warehouse, seen from above: the cash register, the
// little wooden drawer CAIXA 2 in front of it that slides open; on "sonegar" it snaps shut and a padlock drops
// on it. Then the tax goes over the counter in a glass pipe (on posts) straight into the jar on GOVERNO: it
// never passes through the seller.
// B (o caixa): a tray of coins IMPOSTO in front of the register and the flip calendar HOJE → DIA 25; with the
// split the tray empties at once and the calendar is back on HOJE.
// Small wooden drawer unit with a printed front. Origin: table top, centre; front +z. API { group, drawer, open(k), hasp }
function splDrawerBox(label = "CAIXA 2") {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a3a22"), roughness: 0.55 }), dark = pmat("#1a120c", { roughness: 0.8 });
  const W = 0.56, H = 0.22, D = 0.34, LIFT = 0.07;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const f = new THREE.Mesh(rbox(0.04, LIFT, 0.04, 0.008), dark); f.position.set(sx * (W / 2 - 0.04), LIFT / 2, sz * (D / 2 - 0.04)); g.add(f); }
  const body = new THREE.Group(); body.position.y = LIFT; g.add(body);
  const shell = new THREE.Mesh(rbox(W, H, D, 0.01), wood); shell.position.y = H / 2; body.add(shell);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.05, H - 0.05), dark); hole.position.set(0, H / 2, D / 2 + 0.001); body.add(hole);
  const drawer = new THREE.Group(); body.add(drawer);
  const front = new THREE.Mesh(rbox(W - 0.04, H - 0.04, 0.02, 0.006), wood); front.position.set(0, H / 2, D / 2 + 0.008); drawer.add(front);
  const pl = makePlate(label, W - 0.05, 0.12, { bg: "#141414", fg: ORANGE, depth: 0.004 }); pl.position.set(0, H / 2 + 0.03, D / 2 + 0.02); drawer.add(pl);
  const staple = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 8, 16, Math.PI), pmat("#b8bcc2", { metalness: 0.9, roughness: 0.3 })); staple.position.set(0, H / 2 - 0.055, D / 2 + 0.02); drawer.add(staple);
  g.add(contactShadow(W + 0.2, D + 0.2));
  return { group: g, drawer, open(k) { drawer.position.z = 0.1 * clamp(k); }, hasp: new V3(0, LIFT + H / 2 - 0.055, D / 2 + 0.02) };
}
addScene("lados", A.c7, A.c8, (S) => {
  const set = makeBakerySet({ seed: 13, tile: "#23324a", lampsX: [-1.5, 1.5] }); S.backdrop(set.group);
  const top = set.counterY;
  const reg = makeCashRegister({ display: "R$" }); reg.group.position.set(-0.32, top, -0.06); S.add(reg.group);
  // A
  const box = splDrawerBox(); box.group.position.set(0.24, top, 0.16); S.add(box.group);
  const lock = makePadlock({ s: 0.15 }); S.add(lock.group);
  const gov = makeLabelPlinth("GOVERNO", { w: 0.62, h: 0.2, d: 0.3, bg: SPL_NAVY, plateH: 0.16 }); gov.group.position.set(0.8, top, -0.26); S.add(gov.group);
  const jar = makeCoinJar({ r: 0.18, h: 0.34, label: "R$", n: 200, seed: 15 }); jar.group.position.set(0.8, top + gov.top, -0.26); S.add(jar.group);
  jar.label.visible = false; // the plinth says whose jar it is
  const pipe = splPipe([[-1.3, top + 1.0, -0.3], [-0.6, top + 0.92, -0.3], [0.1, top + 0.9, -0.29], [0.62, top + 0.87, -0.27], [0.8, top + 0.72, -0.26]], { r: 0.045, collars: 5, opacity: 0.32 }); S.add(pipe.group);
  const posts = new THREE.Group(); S.add(posts);
  for (const u of [0.3, 0.62]) posts.add(splPost(pipe.at(u).add(new V3(0, -0.045, 0)), top));
  const N = 10, coinsA = []; for (let i = 0; i < N; i++) { const c = splCoin(); S.add(c); coinsA.push({ c, t0: A.passa - 0.9 + i * 0.22 }); }
  // B
  const tray = new THREE.Group(); tray.position.set(0.27, top, 0.22); S.add(tray);
  const trayM = pmat("#ffffff", { map: woodTex("#4a2e1a"), roughness: 0.5 });
  const tb = new THREE.Mesh(rbox(0.66, 0.025, 0.26, 0.006), trayM); tb.position.y = 0.0125; tray.add(tb);
  for (const sx of [-1, 1]) { const rim = new THREE.Mesh(rbox(0.02, 0.045, 0.26, 0.005), trayM); rim.position.set(sx * 0.32, 0.0225, 0); tray.add(rim); }
  const lip = new THREE.Mesh(rbox(0.66, 0.15, 0.02, 0.005), trayM); lip.position.set(0, 0.075, 0.12); tray.add(lip);
  const tl = makePlate("IMPOSTO", 0.62, 0.135, { bg: "#141414", fg: ORANGE, depth: 0.004 }); tl.position.set(0, 0.075, 0.132); tray.add(tl);
  const stacks = [-0.15, 0, 0.15].map((x, i) => { const c = makeCoinColumn(6 + i, { r: 0.055, t: 0.018, seed: 30 + i }); c.group.position.set(x, 0.025, -0.03); tray.add(c.group); return c; });
  const cal = makeFlipCalendar(["HOJE", "DIA 25"], { w: 0.46, h: 0.4 }); cal.group.position.set(0.66, top, -0.18); cal.group.rotation.y = -0.2; S.add(cal.group);
  const isA = (t) => t < B8;
  const anim = (t) => {
    splShopLook(set, t, 0.4 * beat(t, A.sonegar, 0.6));
    const a = isA(t);
    box.group.visible = a; lock.group.visible = a; jar.group.visible = a; gov.group.visible = a; pipe.group.visible = a; posts.visible = a; tray.visible = !a; cal.group.visible = !a;
    // drawer slides out; on "sonegar" it snaps shut and the padlock drops onto the staple
    const LOCK = A.sonegar - 0.15;
    box.open(sm(t, A.c7 + 0.2, A.c7 + 0.8) * (1 - eOut(lin(t, LOCK - 0.25, LOCK))));
    const kl = eOut(lin(t, LOCK - 0.2, LOCK + 0.1)), hw = box.hasp.clone().add(box.group.position);
    lock.group.position.set(hw.x - 0.0225, hw.y - 0.1 + 0.35 * (1 - kl), hw.z + 0.016); lock.open(1 - sm(t, LOCK + 0.05, LOCK + 0.25)); lock.group.visible = a && t > LOCK - 0.2;
    for (const o of coinsA) { const u = (t - o.t0) / 1.4; o.c.visible = a && u > 0 && u < 1; if (o.c.visible) o.c.position.copy(pipe.at(u)); }
    jar.fill(0.05 + 0.06 * coinsA.filter((o) => t > o.t0 + 1.4).length);
    // B: the calendar goes to DIA 25 on "mês seguinte", back to HOJE with the split; the tray empties on "na hora"
    const kc = sm(t, A.seguinte - 0.45, A.seguinte + 0.1) * (1 - sm(t, A.comsplit + 0.2, A.comsplit + 0.7)); cal.show(0, kc);
    const ke = eOut(lin(t, A.hora - 0.2, A.hora + 0.35));
    stacks.forEach((s, i) => { s.group.position.set([-0.15, 0, 0.15][i] + 0.9 * ke, 0.025 + 0.4 * ke, -0.03 - 0.3 * ke); s.group.scale.setScalar(Math.max(0.0001, 1 - ke)); s.group.visible = ke < 0.98; });
    reg.drawer(a ? 0 : sm(t, B8 + 0.1, B8 + 0.6));
    fill.position.set(0.3, top + 1.0, 1.2); fill.color.set(t > LOCK && a ? "#ffb08a" : "#ffd59a"); fill.intensity = 1.2 + 0.8 * beat(t, LOCK, 0.5) + 0.6 * beat(t, A.hora, 0.5);
  };
  const S2 = A.passa - 0.75, S4 = A.comsplit - 0.2;
  S.hero(box.group, "gaveta caixa 2", { when: (t) => splIn(t, A.c7 + 0.3, B8) });
  S.hero(reg.group, "caixa registradora", { when: (t) => splIn(t, A.c7 + 0.3, B8) || splIn(t, B8 + 0.3, S4 - 0.45) });
  S.hero(jar.group, "pote no pedestal governo", { when: (t) => splIn(t, S2 + 0.45, B8) }); S.hero(gov.group, "pedestal governo", { when: (t) => splIn(t, S2 + 0.45, B8) });
  S.hero(tray, "bandeja de moedas imposto", { when: (t) => t > B8 + 0.3 });
  S.hero(cal.group, "calendário de mesa", { when: (t) => t > B8 + 0.3 });
  S.solid(reg.group, "caixa"); S.solid(box.group, "gaveta", { when: (t) => t < B8 }); S.solid(gov.group, "pedestal governo", { when: (t) => t < B8 });
  const bA1 = envelope([reg.group, box.group], anim, A.c7, S2), bA2 = envelope([reg.group, box.group, gov.group, jar.group], anim, S2, B8 - 0.01);
  const bB1 = envelope([reg.group, tray, cal.group], anim, B8, S4), bB2 = envelope([tray, cal.group], anim, S4, A.c8);
  return (t) => {
    anim(t);
    let p;
    if (isA(t)) p = splTrack(t, [[A.c7, bA1, "drop", { from: [0.1, 0.7, 1], rise: 0.2, pull: 1.03 }], [S2, bA2, "truck", { from: [0.05, 0.6, 1], side: 0.2, pull: 1.03 }]], B8, 0.45);
    else p = splTrack(t, [[B8, bB1, "orbit", { from: [0.05, 0.55, 1], deg: 22, pull: 1.03 }], [S4, bB2, "push", { from: [0.1, 0.6, 1], pull0: 1.15, pull: 1.02 }]], A.c8, 0.45);
    p = CAM.shake(p, t, A.sonegar - 0.1, 0.012, 0.35); CAM.apply(p);
  };
});

// ============================================================ 9 · bom ou ruim?
// Back in the bank's vault room: the funnel and the splitter between the plinths BOM and RUIM; the coins keep
// coming and the light swings from one side to the other. Slow orbit.
addScene("pergunta", A.c8, A.end, (S) => {
  const room = makeVaultRoom({ seed: 8 }); S.backdrop(room.group);
  const vd = makeVaultDoor(); vd.group.position.set(0, 0, 0); S.backdrop(vd.group);
  const Z = 2.1, R = splBankRig(S, Z, { leftLabel: "BOM", rightLabel: "RUIM", leftJar: "R$", rightJar: "R$", leftBg: GREEN, rightBg: "#b3241a", t0: A.c8 - 1.0, n: 22, gap: 0.42, every: 2, pipe: false });
  const anim = (t) => {
    splVaultLook(room, t); vd.open(0); vd.glow(0); vd.spin(0.04 * Math.sin(t * 0.6));
    R.update(t);
    const side = Math.sin((t - A.c8) * 1.1);
    R.left.pl.plate.scale.setScalar(1 + 0.08 * beat(t, A.bom, 0.6)); R.right.pl.plate.scale.setScalar(1 + 0.08 * beat(t, A.ruim, 0.6));
    fill.position.set(t > A.ruim - 0.1 && t < A.certo ? 0.8 : t > A.bom - 0.1 && t < A.ruim - 0.1 ? -0.8 : 0.6 * side, 2.0, Z + 1.6);
    fill.color.set(t > A.ruim - 0.1 && t < A.certo ? "#ff9a8a" : t > A.bom - 0.1 && t < A.ruim - 0.1 ? "#a8ffc8" : "#ffe0b8"); fill.intensity = 1.4;
  };
  S.hero(R.fun.group, "funil banco"); S.hero(R.spl.group, "separador de aço"); S.hero(R.left.pl.group, "pedestal bom"); S.hero(R.right.pl.group, "pedestal ruim");
  S.hero(R.left.jar.group, "pote no pedestal bom"); S.hero(R.right.jar.group, "pote no pedestal ruim");
  S.solid(R.left.jar.group, "pote bom", { restsOn: ["pedestal bom"] }); S.solid(R.left.pl.group, "pedestal bom");
  S.solid(R.right.jar.group, "pote ruim", { restsOn: ["pedestal ruim"] }); S.solid(R.right.pl.group, "pedestal ruim");
  const box = envelope([R.fun.group, R.spl.group, R.left.pl.group, R.left.jar.group, R.right.pl.group, R.right.jar.group], anim, A.c8, A.end);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c8, A.end), { zone: "stage", from: [0.0, 0.25, 1], deg: 40, pull: 1.03 })); };
});
