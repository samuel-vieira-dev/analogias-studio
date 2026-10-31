// ============================================================================
// videos/2026-10-31-banco-master-fgc/scenes.js
// Banco Master e o FGC — a analogia do restaurante (pedido do Samuel): todos os bancos jantam na
// mesma mesa; o pote no meio é o FGC; cada prato é dinheiro de um cliente; o Master sai sem pagar.
// Narration 0–91.3 s (audio/words.json), video 93.3 s.
//
// Pattern for every scene:
//   anim(t) animates objects only (no camera); CAM.pose(envelope(...)) frames the subject inside
//   the centred safe zone ("stage" when the headline band has text, "stage-tall" when it does not).
//   Backdrops (room, skyline, crowd) fill the whole frame for context and are never framed/checked.
// Bank names are printed on name plates only (no logos, no brand colours).
// ============================================================================

// ---------------------------------------------------------------- the dinner set
const TABLE_D = 3.9, TABLE_W = 1.25;
const SEATS = [
  { name: "ITAÚ", side: -1, z: 1.2, suit: "#23262d", tie: "#34466b" },
  { name: "BRADESCO", side: 1, z: 1.2, suit: "#2c2c31", tie: "#6b1d1d" },
  { name: "CAIXA", side: -1, z: 0.0, suit: "#1f2a38", tie: "#7a5a1d" },
  { name: "BB", side: 1, z: 0.0, suit: "#30302c", tie: "#1d4a3b" },
  { name: "SANTANDER", side: -1, z: -1.2, suit: "#272a33", tie: "#5a2d5a" },
  { name: "OUTROS", side: 1, z: -1.2, suit: "#2d2a2a", tie: "#2d4f6b" },
];
const MASTER_Z = -TABLE_D / 2 - 0.42;

// Builds the whole dinner: room backdrop, table, chairs, diners, name plates, dishes, the jar.
// opts.master: "seated" | "empty". Returns handles for the scene's animation.
function buildDinner(S, { master = "seated", jarFill = 1, cards = true, room = true, dishes = true } = {}) {
  const D = { seats: {} };
  if (room) { D.room = makeRestaurantRoom({ wallZ: -6.2, lampsX: [0], lampY: 2.6 }); S.add(D.room.group); D.room.lamps[0].position.set(0, 4.1, -0.2); }
  D.table = makeDiningTable({ w: TABLE_W, d: TABLE_D }); S.add(D.table.group);
  const top = D.table.topY;
  for (const s of SEATS) {
    const x = s.side * 0.98, turn = s.side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const ch = makeChair(); ch.group.position.set(s.side * 1.04, 0, s.z); ch.group.rotation.y = turn; S.add(ch.group);
    const d = makeDiner({ suit: s.suit, tie: s.tie }); d.group.position.set(x, 0, s.z); d.setPose({ sit: 1, table: 1, turn }); S.add(d.group);
    let card = null;
    if (cards) { card = makePlaceCard(s.name, { w: 0.46, h: 0.16 }); card.group.position.set(s.side * 0.36, top, s.z + 0.05); S.add(card.group); }
    let dish = null;
    if (dishes) { dish = makeDish(); dish.position.set(s.side * 0.36, top, s.z - 0.3); S.add(dish); }
    D.seats[s.name] = { diner: d, chair: ch, card, dish, x, z: s.z, side: s.side, turn };
  }
  // the Master, at the head of the table (far end), facing the camera
  D.masterChair = makeChair({ fabric: "#2a1a10" }); D.masterChair.group.position.set(0, 0, MASTER_Z - 0.06); S.add(D.masterChair.group);
  D.master = makeDiner({ suit: "#121212", tie: "#b8913f", shirt: "#f4f2ee" }); D.master.group.position.set(0, 0, MASTER_Z); S.add(D.master.group);
  D.master.setPose({ sit: 1, table: 1 }); D.master.group.visible = master === "seated";
  if (cards) { D.masterCard = makePlaceCard("MASTER", { w: 0.46, h: 0.16, bg: "#1c1410", fg: "#d9b66a" }); D.masterCard.group.position.set(0, top, -TABLE_D / 2 + 0.35); S.add(D.masterCard.group); }
  D.jar = makeJar({ label: "FGC" }); D.jar.group.position.set(0, top, -0.05); D.jar.fill(jarFill); S.add(D.jar.group);
  D.top = top;
  // dinner lighting: a darker room, the table lit warm
  D.light = () => { key.intensity = 1.7; key.color.set("#ffc69a"); hemi.intensity = 0.32; scene.environmentIntensity = 0.3; };
  D.update = (t) => { if (D.room) D.room.update(t); D.light(); };
  return D;
}
// Master's chair pushed back with the napkin on it (he left).
function emptyMaster(S, D) {
  D.master.group.visible = false;
  D.masterChair.group.rotation.y = 0.35; D.masterChair.group.position.x = 0.12;
  const napkin = new THREE.Mesh(rbox(0.32, 0.02, 0.26, 0.008), pmat("#f3efe7", { map: LINEN, roughness: 0.9 })); napkin.position.set(0.12, 0.48, MASTER_Z - 0.06); napkin.rotation.y = 0.5; S.add(napkin);
}
const _hp = new V3();
function handPos(d) { d.group.updateMatrixWorld(true); return d.hand.getWorldPosition(_hp).clone(); }
function arcPos(a, b, k, arc = 0.4) { const p = a.clone().lerp(b, k); p.y += Math.sin(Math.PI * k) * arc; return p; }

// ---------------------------------------------------------------- local props
// Bank app painted on a 720x1500 phone canvas. o: { title, lines:[[label, value, color]], banner, bannerColor, locked }
function paintBankApp(ctx, o = {}) {
  const x = ctx; x.clearRect(0, 0, 720, 1500);
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#14161c"); g.addColorStop(1, "#0b0c10"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = "#8f96a3"; x.font = "700 40px Inter"; x.textAlign = "left"; x.fillText("9:41", 50, 80);
  x.fillStyle = "#ffffff"; x.font = "900 64px Inter"; x.fillText(o.title || "Minha conta", 50, 230);
  x.fillStyle = "#8f96a3"; x.font = "700 38px Inter"; x.fillText(o.sub || "Saldo disponível", 50, 330);
  x.fillStyle = o.locked ? "#8f96a3" : "#ffffff"; x.font = "900 96px Inter"; x.fillText(o.balance || "R$ 2.340,00", 50, 450);
  if (o.locked) { x.strokeStyle = RED; x.lineWidth = 10; x.beginPath(); x.moveTo(40, 420); x.lineTo(640, 420); x.stroke(); }
  (o.lines || []).forEach(([a, b, c], i) => {
    const y = 600 + i * 150; x.fillStyle = "rgba(255,255,255,0.06)"; roundRect(x, 40, y - 70, 640, 120, 24); x.fill();
    x.fillStyle = "#e9e4dc"; x.font = "800 46px Inter"; x.textAlign = "left"; x.fillText(a, 76, y + 8);
    x.fillStyle = c || "#ffffff"; x.textAlign = "right"; x.font = "900 52px Inter"; x.fillText(b, 644, y + 10);
  });
  if (o.banner) { x.fillStyle = o.bannerColor || RED; roundRect(x, 40, 1240, 640, 170, 30); x.fill(); x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "900 54px Inter"; x.fillText(o.banner, 360, 1345); }
}
// Phone at a realistic scale relative to the table (0.2 of the kit phone).
function smallPhone(scale = 0.21) { const p = makePhone(); p.group.scale.setScalar(scale); p.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 }); return p; }
// Stack of big gold coins (instanced). Origin bottom centre. set(k) shows k·n coins. API { group, set, topAt(k) }
function makeCoinStack(n, { r = 0.13, t = 0.03, seed = 3 } = {}) {
  const g = new THREE.Group(), rnd = mulberry32(seed);
  const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, t, 40), pmat(GOLD, { metalness: 1, roughness: 0.26 }), n);
  const d = new THREE.Object3D();
  for (let i = 0; i < n; i++) { d.position.set((rnd() - 0.5) * 0.012, t / 2 + i * t * 1.02, (rnd() - 0.5) * 0.012); d.rotation.set(0, rnd() * 6, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
  g.add(m); g.add(contactShadow(r * 3, r * 3));
  const set = (k) => { m.count = Math.max(1, Math.round(clamp(k) * n)); };
  return { group: g, set, height: (k) => Math.max(1, Math.round(clamp(k) * n)) * t * 1.02 };
}
// Black marble plinth. Origin floor centre.
function makePlinth(w, h, d, color = "#1b1a1d") {
  const tex = noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 }); tex.repeat.set(2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat(color, { map: tex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2;
  const g = new THREE.Group(); g.add(m); g.add(contactShadow(w + 0.6, d + 0.6)); return g;
}
// Polished steel shield emblem with a gold rim and a printed plate. Origin centre; faces +z.
function makeShield(label = "FGC", { w = 1.0, h = 1.2 } = {}) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, h / 2); s.lineTo(w / 2, h / 2); s.lineTo(w / 2, 0); s.quadraticCurveTo(w / 2, -h * 0.32, 0, -h / 2); s.quadraticCurveTo(-w / 2, -h * 0.32, -w / 2, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 });
  geo.translate(0, 0, -0.04);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, pmat("#cdd2d8", { metalness: 1, roughness: 0.18, clearcoat: 0.5 })));
  const rimS = new THREE.Shape(s.getPoints(48)); const inner = s.getPoints(48).map((p) => p.clone().multiplyScalar(0.86)); rimS.holes.push(new THREE.Path(inner.reverse()));
  const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(rimS, { depth: 0.03, bevelEnabled: false }), pmat(GOLD, { metalness: 1, roughness: 0.25 })); rim.position.z = 0.07; g.add(rim);
  const p = makePlate(label, w * 0.72, h * 0.3, { bg: "#14171c", fg: "#f4e3b5", depth: 0.01 }); p.position.set(0, h * 0.08, 0.1); g.add(p);
  return g;
}
// Generic bank front (no real brand): stone wall, four columns, pediment, name plate, glass doors,
// and a roll-down shutter in front of the doors. Origin floor centre; faces +z.
function makeBankFront(name) {
  const g = new THREE.Group();
  const stoneT = noiseTex({ base: "#cfc6b8", amount: 0.1, size: 2, seed: 71 }); stoneT.repeat.set(3, 2);
  const stone = pmat("#ffffff", { map: stoneT, roughness: 0.75 });
  const wall = new THREE.Mesh(rbox(3.2, 2.6, 0.3, 0.02), stone); wall.position.set(0, 1.3, -0.15); g.add(wall);
  const steps = new THREE.Mesh(rbox(3.6, 0.16, 0.9, 0.02), stone); steps.position.set(0, 0.08, 0.35); g.add(steps);
  for (const x of [-1.25, -0.7, 0.7, 1.25]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.1, 32), stone); c.position.set(x, 0.16 + 1.05, 0.45); g.add(c); }
  const beam = new THREE.Mesh(rbox(3.4, 0.3, 0.8, 0.02), stone); beam.position.set(0, 2.45, 0.2); g.add(beam);
  const ped = new THREE.Shape(); ped.moveTo(-1.75, 0); ped.lineTo(1.75, 0); ped.lineTo(0, 0.55); ped.closePath();
  const pg = new THREE.ExtrudeGeometry(ped, { depth: 0.7, bevelEnabled: false }); const pm = new THREE.Mesh(pg, stone); pm.position.set(0, 2.6, -0.15); g.add(pm);
  const plate = makePlate(name, 2.2, 0.28, { bg: "#1c1410", fg: "#d9b66a" }); plate.position.set(0, 2.45, 0.61); g.add(plate);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.7), pmat("#20262e", { metalness: 0.2, roughness: 0.1, clearcoat: 1 })); door.position.set(0, 0.16 + 0.85, 0.005); g.add(door);
  const shutter = makeShutter({ w: 1.1, h: 1.8, n: 12, sign: "LIQUIDADO" }); shutter.group.position.set(0, 0.16, 0.08); g.add(shutter.group);
  g.add(contactShadow(4.2, 2));
  return { group: g, shutter, plate };
}
// A row of year blocks (gold-edged plates on wooden bases). Origin floor centre of each.
function makeYearBlock(year) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(rbox(0.36, 0.06, 0.16, 0.02), pmat("#3a2214", { roughness: 0.45, clearcoat: 0.4 })); base.position.y = 0.03; g.add(base);
  const p = makePlate(String(year), 0.34, 0.2, { bg: "#f4ead2", fg: "#1c1410", depth: 0.03 }); p.position.y = 0.06 + 0.1; g.add(p);
  return g;
}

// ============================================================ 1 · gancho (0–3.46)
// "Já imaginou o Itaú pagando a conta que o Master deixou?" The Master's chair is empty; the bill
// slides down the whole table and stops in front of ITAÚ.
addScene("gancho", 0, 3.46, (S) => {
  const D = buildDinner(S, { master: "empty" }); emptyMaster(S, D);
  const it = D.seats["ITAÚ"];
  const bill = makeBillFolder(); S.add(bill.group);
  const from = new V3(0, D.top, -TABLE_D / 2 + 0.3), to = new V3(it.side * 0.3, D.top, it.z - 0.34);
  const anim = (t) => {
    D.update(t);
    const k = eOut(lin(t, 0.2, 2.2));
    bill.group.position.copy(from).lerp(to, k); bill.group.position.x += Math.sin(k * Math.PI) * 0.12; bill.group.rotation.y = lerp(0.2, -0.3, k) + Math.sin(k * 9) * 0.06 * (1 - k);
    it.diner.setPose({ sit: 1, table: 1 - 0.4 * sm(t, 2.1, 2.7), turn: it.turn, look: 0.3 * sm(t, 2.1, 2.8) });
  };
  S.hero(D.table.group, "mesa", { when: (t) => t < 1.0 });
  S.hero(bill.group, "conta");
  S.hero(it.card.group, "placa itaú", { when: (t) => t > 2.45 });
  S.hero(it.diner.group, "itaú", { when: (t) => t > 2.45 });
  const A = CAM.pose(envelope([D.table.group, D.masterChair.group], anim, 0, 0.6), { zone: "stage", from: [0.05, 0.42, 1] });
  const B = CAM.pose(envelope([it.diner.group, it.card.group, bill.group], anim, 2.5, 3.46), { zone: "stage", from: [0.45, 0.38, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[0, A], [2.45, B, 2.0]])); };
});

// ============================================================ 2 · aconteceu (3.46–8.12)
// "Pois aconteceu. E um pedaço dessa conta pode chegar em você." The bill opens: a long receipt
// rises; a strip tears off and lands on your phone at the near end of the table.
addScene("aconteceu", 3.46, 8.12, (S) => {
  const D = buildDinner(S, { master: "empty" }); emptyMaster(S, D);
  const it = D.seats["ITAÚ"];
  const bill = makeBillFolder(); bill.group.position.set(it.side * 0.3, D.top, it.z - 0.34); bill.group.rotation.y = -0.3; S.add(bill.group);
  const rc = makeReceipt({ w: 0.42, h: 0.95, lines: [["Mesa", "Master"], ["Pratos", "muitos"], ["Pago?", "não"]], total: "R$ 50 BI" });
  rc.group.position.set(it.side * 0.3, D.top + 0.03, it.z - 0.32); rc.group.rotation.y = 0.35; S.add(rc.group);
  const phone = smallPhone(0.2); phone.group.position.set(0.05, D.top + 0.012, TABLE_D / 2 - 0.25); phone.group.rotation.x = -Math.PI / 2 + 0.0; S.add(phone.group);
  const strip = makePlate("SUA PARTE", 0.3, 0.1, { bg: "#fbf8f0", fg: "#b3241a", depth: 0.004 }); S.add(strip);
  const stand = new THREE.Mesh(rbox(0.2, 0.025, 0.1, 0.01), pmat("#222", { roughness: 0.4 })); stand.position.set(0.05, D.top + 0.012, TABLE_D / 2 - 0.12); S.add(stand);
  let painted = -1;
  const paint = (mode) => { if (mode === painted) return; painted = mode; paintBankApp(phone.ctx, mode ? { title: "Minha conta", lines: [["Pix recebido", "+ R$ 50", GREEN], ["Nova cobrança", "R$ ?", RED]], banner: "SUA PARTE DA CONTA" } : { title: "Minha conta", lines: [["Pix recebido", "+ R$ 50", GREEN]] }); phone.tex.needsUpdate = true; };
  const rest = new V3(0.05, D.top + 0.035, TABLE_D / 2 - 0.25);
  const anim = (t) => {
    D.update(t);
    it.diner.setPose({ sit: 1, table: 0.6, turn: it.turn, look: 0.3 });
    const k = eOut(lin(t, 3.5, 4.5)); rc.group.position.y = D.top + 0.03 + rc.h * k; rc.set(k);
    // the strip tears off the bottom and flies to the phone
    const s0 = new V3(it.side * 0.3, D.top + 0.12, it.z - 0.3), f = lin(t, 5.2, 6.4);
    strip.visible = t > 5.15; strip.position.copy(arcPos(s0, rest, eOut(f), 0.45));
    strip.rotation.set(-Math.PI / 2 * eOut(f), Math.sin(f * 6) * 0.4 * (1 - f), 0);
    paint(t > 6.4 ? 1 : 0);
    phone.group.rotation.x = -Math.PI / 2 + 0.55 * sm(t, 6.3, 7.0);
    phone.group.position.y = D.top + 0.012 + 0.075 * sm(t, 6.3, 7.0);
  };
  S.hero(rc.group, "conta comprida", { when: (t) => t < 5.0 });
  S.hero(bill.group, "porta-conta", { when: (t) => t < 5.0 });
  S.hero(phone.group, "celular", { when: (t) => t > 6.6 });
  const A = CAM.pose(envelope([rc.group, bill.group], anim, 4.4, 5.0), { zone: "stage", from: [0.45, 0.3, 1] });
  const B = CAM.pose(envelope([phone.group], anim, 6.9, 8.12), { zone: "stage", from: [0, 0.6, 1] });
  const B2 = CAM.pose(envelope([phone.group], anim, 6.9, 8.12), { zone: "stage", from: [0.1, 0.55, 1], pull: 1.06 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[3.46, A], [6.6, B, 1.3], [8.12, B2, 1.4]])); };
});

// ============================================================ 3 · investimento (8.12–16.58)
// "Imagina: você pôs suas economias no Master, que rendia bem mais que os outros bancos. A promessa:
// se quebrar, o fundo garantidor devolve." Gold stacks: three for the other banks, the Master's
// shooting up; then the FGC shield lands in front of it.
addScene("investimento", 8.12, 16.58, (S) => {
  const sky = makeSkyline({ z: -12 }); S.add(sky.group);
  const pl = makePlinth(3.4, 0.35, 1.3); S.add(pl);
  const stacks = [-1.2, -0.55, 0.1].map((x, i) => { const s = makeCoinStack(16, { seed: 4 + i }); s.group.position.set(x, 0.35, 0); S.add(s.group); return s; });
  const ms = makeCoinStack(46, { seed: 9 }); ms.group.position.set(1.05, 0.35, 0); S.add(ms.group);
  const p1 = makePlate("OUTROS BANCOS", 1.7, 0.2, { bg: "#141414", fg: "#e9e4dc" }); p1.position.set(-0.55, 0.175, 0.655); S.add(p1);
  const p2 = makePlate("MASTER", 0.8, 0.2, { bg: "#1c1410", fg: "#d9b66a" }); p2.position.set(1.05, 0.175, 0.655); S.add(p2);
  const shield = makeShield("FGC", { w: 0.9, h: 1.05 }); S.add(shield);
  const glow = sprite(BOKEH, 2.4); glow.material.color.set("#ffd28a"); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = 0; glow.userData.decor = true; S.add(glow);
  const anim = (t) => {
    sky.update(t); key.intensity = 2.0; scene.environmentIntensity = 0.5;
    stacks.forEach((s, i) => s.set(0.15 + 0.85 * eOut(lin(t, 8.6 + i * 0.15, 10.4))));
    ms.set(0.06 + 0.94 * eOut(lin(t, 9.4, 12.6)));
    const k = eOut(lin(t, 13.4, 14.2)), top = 0.35 + ms.height(1) + 0.75;
    shield.visible = t > 13.35; shield.position.set(1.05, lerp(top + 1.6, 0.35 + ms.height(1) * 0.55, k), 0.45);
    shield.rotation.y = (1 - k) * 2.4 + Math.sin(t * 1.4) * 0.08; shield.scale.setScalar(Math.max(0.001, k));
    glow.position.copy(shield.position); glow.position.z -= 0.2; glow.material.opacity = 0.55 * sm(t, 14.0, 14.6);
  };
  S.hero(pl, "pedestal");
  S.hero(ms.group, "pilha do master");
  S.hero(shield, "escudo fgc", { when: (t) => t > 14.3 });
  for (const s of stacks) S.solid(s.group, "pilha", { restsOn: ["pedestal"] });
  const A = CAM.pose(envelope([pl, ...stacks.map((s) => s.group), ms.group], anim, 8.12, 13.0), { zone: "stage", from: [-0.25, 0.3, 1] });
  const B = CAM.pose(envelope([ms.group, shield, p2], anim, 14.3, 16.58), { zone: "stage", from: [0.15, 0.22, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[8.12, A], [12.4, CAM.blend(A, A, 0)], [14.4, B, 1.6], [16.58, CAM.blend(B, A, 0.08), 2]])); };
});

// ============================================================ 4a · Banco Central (16.58–18.9)
addScene("bc", 16.58, 18.9, (S) => {
  const sky = makeSkyline({ z: -11, seed: 11 }); S.add(sky.group);
  const fr = makePhotoFrame("sede-bc", { w: 2.6, name: "BANCO CENTRAL" }); S.add(fr.group);
  const anim = (t) => { sky.update(t); fr.frame.rotation.y = 1.3 * (1 - eOut(lin(t, 16.6, 17.25))); fr.zoom(1 + 0.14 * lin(t, 16.6, 18.9)); };
  S.hero(fr.group, "porta-retrato bc");
  const A = CAM.pose(envelope([fr.group], anim, 16.58, 18.9), { zone: "stage", from: [0.12, 0.15, 1] });
  const B = CAM.pose(envelope([fr.group], anim, 16.58, 18.9), { zone: "stage", from: [-0.08, 0.1, 1] });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 16.58, 18.9))); };
});

// ============================================================ 4b · fecha o Master (18.9–21.0)
addScene("fecha", 18.9, 21.0, (S) => {
  const sky = makeSkyline({ z: -11, seed: 5 }); S.add(sky.group);
  const bank = makeBankFront("BANCO MASTER"); S.add(bank.group);
  const stamp = makeStamp({ w: 1.0, d: 0.36 }); S.add(stamp); stamp.rotation.x = Math.PI / 2;
  const anim = (t) => {
    sky.update(t);
    bank.shutter.set(eOut(lin(t, 19.2, 19.9)));
    bank.shutter.sign.visible = t > 19.95; bank.shutter.sign.scale.setScalar(Math.max(0.001, pop(t, 19.95, 0.3)));
    const k = lin(t, 19.7, 19.95), back = sm(t, 20.15, 20.5);
    stamp.visible = t > 19.65 && t < 20.55; stamp.position.set(0, 1.15, 0.14 + 0.9 * (1 - k) + back * 1.2);
  };
  S.hero(bank.group, "fachada do banco");
  const A = CAM.pose(envelope([bank.group], anim, 18.9, 21.0), { zone: "stage", from: [0.2, 0.12, 1] });
  const B = CAM.pose(envelope([bank.group], anim, 18.9, 21.0), { zone: "stage", from: [0.05, 0.08, 1] });
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.blend(A, B, sm(t, 18.9, 21.0)), t, 19.95, 0.5, 0.35)); };
});

// ============================================================ 4c · Vorcaro (21.0–25.16)
// Photo card on the stage (overlay); behind it only the skyline backdrop drifting.
addScene("vorcaro", 21.0, 25.16, (S) => {
  const sky = makeSkyline({ z: -9, seed: 19 }); S.add(sky.group);
  const anim = (t) => { sky.update(t); };
  const A = CAM.at([0, 2.2, 6], [0, 3.2, -9], { zone: "stage" }), B = CAM.at([1.2, 2.6, 5], [0.4, 3.6, -9], { zone: "stage" });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 21.0, 25.16))); };
});

// ============================================================ 5 · dinheiro travado (25.16–31.5)
// "Seu dinheiro trava por dois meses. Acima de duzentos e cinquenta mil, pode não voltar."
addScene("trava", 25.16, 31.5, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.5, -8], spread: [20, 9, 3], seed: 77 }); S.add(bk.group);
  const desk = new THREE.Mesh(rbox(5, 0.12, 2.4, 0.03), pmat("#ffffff", { map: woodTex({ base: "#4a2c1a", seed: 22 }), roughness: 0.4, clearcoat: 0.5 })); desk.position.y = -0.06; S.add(desk);
  const phone = makePhone(); phone.group.scale.setScalar(0.62); phone.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 }); phone.group.position.set(-0.55, 0.53, 0); phone.group.rotation.x = -0.12; S.add(phone.group);
  paintBankApp(phone.ctx, { title: "Banco Master", sub: "Saldo investido", balance: "R$ 80.000", locked: true, lines: [["Resgate", "bloqueado", RED]], banner: "BANCO EM LIQUIDAÇÃO" }); phone.tex.needsUpdate = true;
  const lock = makePadlock({ s: 0.75 }); S.add(lock.group);
  const cal = makeDeskCalendar(["NOV", "DEZ", "JAN"], { w: 0.85, h: 0.75 }); cal.group.position.set(0.75, 0, 0.1); cal.group.rotation.y = -0.25; S.add(cal.group);
  // cash column with the R$ 250 mil line
  const bundles = [];
  for (let i = 0; i < 16; i++) { const b = makeCashBundle({ w: 0.62, d: 0.3, h: 0.1 }); b.position.set(Math.sin(i * 2.3) * 0.015, 0, Math.cos(i * 1.7) * 0.015); b.rotation.y = Math.sin(i * 1.1) * 0.06; b.userData.y = i * 0.102; S.add(b); bundles.push(b); }
  const LINE_I = 9, lineY = LINE_I * 0.102 + 0.005;
  const laser = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.7), new THREE.MeshBasicMaterial({ color: "#ff3b1f", transparent: true, opacity: 0.85, toneMapped: false })); laser.userData.noShadow = true; S.add(laser);
  const sign = makePlate("R$ 250 MIL", 0.7, 0.18, { bg: RED, fg: "#ffffff" }); S.add(sign);
  const colX = 0;
  const anim = (t) => {
    bk.update(t); key.intensity = 2.0;
    const ph = t < 27.95;
    phone.group.visible = ph; lock.group.visible = ph; cal.group.visible = ph; desk.visible = true;
    const lk = eOut(lin(t, 25.9, 26.35)); lock.group.position.set(-0.55, 0.06 + (1 - lk) * 1.2, 0.42); lock.open(1 - sm(t, 26.35, 26.6)); lock.group.rotation.y = 0.2;
    cal.show(t < 26.8 ? 0 : t < 27.35 ? 1 : 2, t < 26.8 ? sm(t, 26.5, 26.8) : t < 27.35 ? sm(t, 27.05, 27.35) : 0);
    for (let i = 0; i < bundles.length; i++) {
      const b = bundles[i]; b.visible = !ph;
      const drop = i > LINE_I ? eOut(lin(t, 29.6 + (i - LINE_I) * 0.08, 30.6 + (i - LINE_I) * 0.08)) : 0;
      b.position.set(colX + Math.sin(i * 2.3) * 0.015 + drop * (i % 2 ? 1 : -1) * 0.9, b.userData.y * (1 - drop) + (-1.2) * drop * drop, Math.cos(i * 1.7) * 0.015 + drop * 0.6);
      b.rotation.z = drop * (i % 2 ? -1 : 1) * 1.6; b.visible = !ph && drop < 0.98;
    }
    const lv = !ph && t > 28.6; laser.visible = lv; sign.visible = lv;
    laser.position.set(colX, lineY + 0.1, 0); laser.scale.x = Math.max(0.01, eOut(lin(t, 28.6, 29.0)));
    sign.position.set(colX + 0.98, lineY + 0.1, 0.0); sign.scale.setScalar(Math.max(0.001, pop(t, 28.75, 0.3)));
  };
  S.hero(phone.group, "celular travado", { when: (t) => t < 27.95 });
  S.hero(lock.group, "cadeado", { when: (t) => t > 26.4 && t < 27.95 });
  S.hero(cal.group, "calendário", { when: (t) => t < 27.95 });
  const col = new THREE.Group(); bundles.forEach((b) => col.add(b)); S.add(col); col.add(laser); col.add(sign);
  S.hero(col, "pilha de dinheiro", { when: (t) => t >= 28.0 && t < 29.5 });
  const A = CAM.pose(envelope([phone.group, lock.group, cal.group], anim, 25.9, 27.9), { zone: "stage", from: [0.1, 0.25, 1] });
  const B = CAM.pose(envelope([col], anim, 28.0, 29.4), { zone: "stage", from: [0.25, 0.2, 1] });
  const B2 = CAM.pose(envelope([col], anim, 28.0, 31.5), { zone: "stage", from: [0.1, 0.25, 1], pull: 1.05 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[25.16, A], [27.95, B, 0.01], [31.5, B2, 3.4]])); };
});

// ============================================================ 6 · o restaurante (31.5–43.54)
// "Pensa num restaurante: todos os bancos jantam na mesma mesa. Todo mês, cada um põe um pouco num
// pote no meio: esse pote é o FGC. Se um banco não pagar a conta do jantar, o pote paga."
addScene("restaurante", 31.5, 43.54, (S) => {
  const D = buildDinner(S, { master: "seated", jarFill: 0.35 });
  const order = ["ITAÚ", "BRADESCO", "CAIXA", "BB", "SANTANDER", "OUTROS"];
  const coins = order.map(() => { const c = makeGoldCoin(0.034, 0.008); c.visible = false; S.add(c); return c; });
  const slot = new V3(0, D.top + D.jar.rimY + 0.04, -0.05);
  // the unpaid bill next to the jar; coins hop from the jar into it; PAGO pops
  const bill = makeBillFolder(); bill.group.position.set(0.32, D.top, 0.3); bill.group.rotation.y = -0.4; S.add(bill.group);
  const pago = makePlate("PAGO", 0.3, 0.1, { bg: GREEN, fg: "#ffffff", depth: 0.006 }); pago.rotation.x = -Math.PI / 2 + 0.6; S.add(pago);
  const hop = [0, 1, 2, 3, 4].map(() => { const c = makeGoldCoin(0.034, 0.008); S.add(c); return c; });
  const anim = (t) => {
    D.update(t);
    order.forEach((n, i) => {
      const s = D.seats[n], t0 = 35.2 + i * 0.42;
      const r = sm(t, t0, t0 + 0.35) * (1 - sm(t, t0 + 0.75, t0 + 1.1));
      s.diner.setPose({ sit: 1, table: 1 - r, reach: r, turn: s.turn, lean: 0.12 * r });
      const c = coins[i], k = lin(t, t0 + 0.3, t0 + 0.9);
      c.visible = k > 0 && k < 1;
      if (c.visible) { const a = handPos(s.diner); c.position.copy(arcPos(a, slot, eOut(k), 0.35)); c.rotation.set(t * 9 + i, 0, t * 5); }
    });
    D.jar.fill(0.35 + 0.65 * sm(t, 35.4, 38.0) - 0.08 * sm(t, 41.6, 42.6));
    D.master.setPose({ sit: 1, table: 1 });
    const bk = eOut(lin(t, 40.2, 40.9)); bill.group.visible = t > 40.15; bill.group.position.set(0.32 + 0.6 * (1 - bk), D.top, 0.3 + 0.5 * (1 - bk));
    hop.forEach((c, i) => { const k = lin(t, 41.5 + i * 0.16, 41.95 + i * 0.16); c.visible = k > 0 && k < 1; c.position.copy(arcPos(slot, new V3(0.32, D.top + 0.03, 0.3), k, 0.3)); c.rotation.set(t * 8, 0, i); });
    pago.visible = t > 42.55; pago.scale.setScalar(Math.max(0.001, pop(t, 42.55, 0.3))); pago.position.set(0.32, D.top + 0.09, 0.32);
  };
  S.hero(D.table.group, "mesa", { when: (t) => t < 37.9 });
  S.hero(D.jar.group, "pote", { when: (t) => t >= 38.3 });
  S.hero(bill.group, "porta-conta", { when: (t) => t >= 40.9 });
  const A = CAM.pose(envelope([D.table.group, D.master.group], anim, 31.5, 33), { zone: "stage", from: [0, 0.9, 1] });
  const B = CAM.pose(envelope([D.table.group, D.master.group], anim, 34, 37.6), { zone: "stage", from: [0.3, 0.42, 1] });
  const C = CAM.pose(envelope([D.jar.group], anim, 38.2, 40.0), { zone: "stage", from: [0.1, 0.3, 1] });
  const E = CAM.pose(envelope([D.jar.group, bill.group, pago], anim, 41.0, 43.54), { zone: "stage", from: [0.25, 0.42, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[31.5, A], [34.6, B, 2.6], [38.4, C, 0.9], [41.0, E, 0.9], [43.54, CAM.blend(E, C, 0.1), 2.5]])); };
});

// ============================================================ 7 · o Master (43.54–52.64)
// "O Master pediu prato atrás de prato: cada prato, dinheiro de um cliente que ele prometeu devolver
// com juros altos. E foi embora sem pagar."
addScene("master", 43.54, 52.64, (S) => {
  const D = buildDinner(S, { master: "seated" });
  const M = D.master;
  // dishes arrive and pile up around the head of the table
  for (const n of ["SANTANDER", "OUTROS"]) { D.seats[n].card.group.visible = false; }
  for (const s of SEATS) if (D.seats[s.name].dish) D.seats[s.name].dish.visible = false;
  const spots = [[-0.42, -1.32], [0.42, -1.32], [-0.14, -1.32], [0.14, -1.32], [-0.42, -1.02], [0.42, -1.02], [-0.14, -1.02], [0.14, -1.02]];
  const dishes = spots.map(([x, z], i) => {
    const g = new THREE.Group(); const d = makeDish({ r: 0.13 }); g.add(d);
    const cash = makeCashBundle(); cash.position.y = 0.015; cash.rotation.y = 0.3 * (i % 2 ? 1 : -1); g.add(cash);
    const cl = makeCloche({ r: 0.12 }); cl.position.y = 0.01; g.add(cl); g.userData = { x, z, lvl: 0, cl };
    S.add(g); return g;
  });
  const anim = (t) => {
    D.update(t);
    dishes.forEach((g, i) => {
      const t0 = 43.75 + i * 0.27, k = eOut(lin(t, t0, t0 + 0.35)), { x, z, lvl, cl } = g.userData;
      g.visible = t > t0; g.position.set(x + (x < 0 ? -1 : 1) * 1.4 * (1 - k), D.top + lvl * 0.2 + 0.25 * Math.sin(Math.PI * k) * (1 - k), z);
      // the dish nearest the camera opens: cloche lifts, cash shows
      const open = i === 7 ? sm(t, 46.2, 46.8) : 0; cl.position.y = 0.01 + open * 0.35; cl.rotation.x = -open * 0.5; cl.visible = open < 0.99 || t < 50.6;
    });
    const up = sm(t, 50.8, 51.3), walk = lin(t, 51.25, 52.64);
    const turn = Math.PI * sm(t, 51.15, 51.6);
    M.setPose({ sit: 1 - up, table: 1 - up, turn, walk: walk * 14, swing: walk > 0 ? 0.8 : 0 });
    M.group.position.set(0.0 + 0.9 * sm(t, 51.0, 51.4), 0, MASTER_Z - walk * 1.9);
    D.masterChair.group.position.z = MASTER_Z - 0.06 - 0.25 * up; D.masterChair.group.rotation.y = 0.3 * up;
  };
  const open = dishes[7];
  S.hero(M.group, "master sentado", { when: (t) => t < 46.0 });
  dishes.slice(0, 4).forEach((g, i) => S.hero(g, "prato " + (i + 1), { when: (t) => t > 45.0 && t < 46.0 }));
  S.hero(open, "prato aberto", { when: (t) => t > 46.9 && t < 50.4 });
  S.hero(D.masterChair.group, "cadeira vazia", { when: (t) => t > 51.5 });
  S.hero(M.group, "master saindo", { when: (t) => t > 51.5 });
  const A = CAM.pose(envelope([M.group, ...dishes], anim, 44.5, 46.0), { zone: "stage", from: [0.0, 0.35, 1] });
  const B = CAM.pose(envelope([open], anim, 46.9, 50.4), { zone: "stage", from: [0.2, 0.55, 1], pull: 1.02 });
  const C = CAM.pose(envelope([M.group, D.masterChair.group, ...dishes], anim, 50.6, 52.64), { zone: "stage", from: [0.1, 0.32, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[43.54, A], [46.9, B, 0.9], [50.6, C, 0.6]])); };
});

// ============================================================ 8 · o pote pagou (52.64–62.06)
// "Quem pagou foi o pote: mais de cinquenta bilhões, devolvidos a quase dois milhões e meio de
// pessoas. A maior conta que ele já pagou." A giant jar on a monument pours coins over a crowd.
addScene("pote-paga", 52.64, 62.06, (S) => {
  const crowd = makeCrowdField({ rows: 46, cols: 46, z0: 9, sx: 0.62, sz: 0.62, skip: (x, z) => Math.abs(x) < 1.8 && Math.abs(z + 2) < 1.8 }); crowd.group.position.y = 0; S.add(crowd.group);
  const bk = makeBokeh({ n: 40, center: [0, 9, -22], spread: [40, 10, 4], seed: 93 }); S.add(bk.group);
  const ped = makePlinth(2.6, 2.6, 2.6); ped.position.set(0, 0, -2); S.add(ped);
  const jar = makeJar({ r: 0.26, h: 0.62, label: "FGC" }); jar.group.scale.setScalar(3); S.add(jar.group);
  const pivot = new THREE.Group(); pivot.position.set(0, 2.6, -2 + 0.78); S.add(pivot); pivot.add(jar.group); jar.group.position.set(0, 0, -0.78);
  const N = 160, stream = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.1, 0.022, 20), pmat(GOLD, { metalness: 1, roughness: 0.3 }), N); stream.userData.decor = true; S.add(stream);
  const rnd = mulberry32(5), seeds = Array.from({ length: N }, () => [rnd(), rnd(), rnd(), rnd()]); const d = new THREE.Object3D();
  const anim = (t) => {
    crowd.update(t); bk.update(t); key.intensity = 2.0; scene.environmentIntensity = 0.45;
    const tilt = sm(t, 52.8, 53.7); pivot.rotation.x = tilt * 1.05;
    jar.fill(1 - 0.45 * lin(t, 53.6, 61.5));
    pivot.updateMatrixWorld(true); const mouth = new V3(0, 0.62, 0).applyMatrix4(jar.group.matrixWorld);
    let n = 0;
    for (let i = 0; i < N; i++) {
      const [a, b, c, e] = seeds[i], period = 1.6, tt = (t - 53.5 + a * period) % period;
      if (t < 53.5 + (1 - a) * 0.01 || tt < 0) continue;
      const vx = (b - 0.5) * 1.6, vz = 1.2 + c * 1.4;
      d.position.set(mouth.x + vx * tt, mouth.y + 0.6 * tt - 4.9 * tt * tt, mouth.z + vz * tt);
      if (d.position.y < 0.6) continue;
      d.rotation.set(tt * 8 + e * 6, e * 6, tt * 5); d.updateMatrix(); stream.setMatrixAt(n++, d.matrix);
    }
    stream.count = n; stream.instanceMatrix.needsUpdate = true;
  };
  S.hero(jar.group, "pote gigante");
  S.hero(ped, "monumento");
  const A = CAM.pose(envelope([jar.group, ped], anim, 52.64, 62.06), { zone: "stage", from: [0.35, 0.28, 1], pull: 1.05 });
  const B = CAM.pose(envelope([jar.group, ped], anim, 52.64, 62.06), { zone: "stage", from: [-0.3, 0.38, 1], pull: 1.05 });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 52.64, 62.06))); };
});

// ============================================================ 9a · o pote perdeu (62.06–65.0)
// "O pote perdeu quatro de cada dez reais." Ten gold coins stand in front of the jar; four fall.
addScene("perdeu", 62.06, 65.0, (S) => {
  const D = buildDinner(S, { master: "empty", jarFill: 1 }); emptyMaster(S, D);
  const row = new THREE.Group(); row.position.set(0, D.top, 0.42); S.add(row);
  const coins = Array.from({ length: 10 }, (_, i) => { const c = makeCoin(0.06, "R$"); c.group.position.set((i - 4.5) * 0.125, 0.06, 0); row.add(c.group); return c; });
  const anim = (t) => {
    D.update(t);
    coins.forEach((c, i) => {
      const lost = i >= 6, k = lost ? eOut(lin(t, 63.1 + (i - 6) * 0.18, 63.7 + (i - 6) * 0.18)) : 0;
      c.group.rotation.x = -k * Math.PI / 2; c.group.position.set((i - 4.5) * 0.125 + k * 0.15, 0.06 - k * 0.05 - k * k * 0.0, k * 0.35);
      c.group.visible = k < 0.999; c.spin(Math.sin(t * 2 + i) * 0.1);
      c.group.traverse((m) => { if (m.material && m.material.color && lost) { m.material.transparent = true; m.material.opacity = 1 - sm(t, 63.9 + (i - 6) * 0.18, 64.4 + (i - 6) * 0.18); } });
    });
    D.jar.fill(1 - 0.4 * sm(t, 63.1, 64.4));
  };
  S.hero(D.jar.group, "pote");
  S.hero(row, "dez moedas", { when: (t) => t < 63.0 });
  const A = CAM.pose(envelope([D.jar.group, row], anim, 62.06, 63.0), { zone: "stage", from: [0.05, 0.3, 1] });
  const B = CAM.pose(envelope([D.jar.group, row], anim, 62.06, 63.0), { zone: "stage", from: [-0.12, 0.26, 1], pull: 1.03 });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 62.06, 65.0))); };
});

// ============================================================ 9b · os bancos enchem de novo (65.0–71.3)
// "Quem encheu de novo? Os outros bancos da mesa: adiantaram cinco anos de contribuição de uma vez."
addScene("enchem", 65.0, 71.3, (S) => {
  const D = buildDinner(S, { master: "empty", jarFill: 0.6 }); emptyMaster(S, D);
  const order = ["ITAÚ", "BRADESCO", "CAIXA", "BB", "SANTANDER", "OUTROS"];
  const piles = order.map((n, i) => { const s = D.seats[n]; const b = makeCashBundle({ w: 0.2, d: 0.09, h: 0.06 }); b.position.set(s.side * 0.42, D.top, s.z + 0.32); S.add(b); return b; });
  const years = [2026, 2027, 2028, 2029, 2030].map((y) => { const b = makeYearBlock(y); S.add(b); return b; });
  const slot = new V3(0, D.top + D.jar.rimY + 0.05, -0.05);
  const anim = (t) => {
    D.update(t);
    order.forEach((n, i) => {
      const s = D.seats[n], t0 = 66.2 + i * 0.22, r = sm(t, t0, t0 + 0.3) * (1 - sm(t, t0 + 0.7, t0 + 1.0));
      s.diner.setPose({ sit: 1, table: 1 - r, reach: r, turn: s.turn, lean: 0.15 * r });
      const k = eOut(lin(t, t0 + 0.25, t0 + 0.85)), p = piles[i];
      p.visible = k < 0.98; p.position.copy(arcPos(new V3(s.side * 0.42, D.top, s.z + 0.32), slot, k, 0.3)); p.rotation.y = k * 3;
    });
    years.forEach((b, i) => {
      const t0 = 68.1 + i * 0.4, up = eOut(lin(t, t0 - 0.3, t0)), k = lin(t, t0 + 0.2, t0 + 0.7);
      b.visible = t > t0 - 0.3 && k < 0.98;
      const start = new V3((i - 2) * 0.42, D.top + 0.55, 0.85);
      b.position.copy(k > 0 ? arcPos(start, slot, eOut(k), 0.25) : start.clone().setY(D.top + 0.55 * up)); b.scale.setScalar(Math.max(0.001, up * (1 - 0.6 * k)));
    });
    D.jar.fill(0.6 + 0.4 * sm(t, 66.4, 70.6));
  };
  S.hero(D.table.group, "mesa", { when: (t) => t < 67.9 });
  S.hero(D.jar.group, "pote", { when: (t) => t > 68.3 });
  years.forEach((b, i) => S.hero(b, "ano " + (2026 + i), { when: (t) => t > 68.1 + i * 0.4 && t < 68.3 + i * 0.4 }));
  const A = CAM.pose(envelope([D.table.group, D.masterChair.group], anim, 65.0, 67.6), { zone: "stage", from: [0.25, 0.5, 1] });
  const B = CAM.pose(envelope([D.jar.group, ...years], anim, 67.9, 71.3), { zone: "stage", from: [0.05, 0.32, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[65.0, A], [68.0, B, 0.9], [71.3, CAM.blend(B, A, 0.06), 3]])); };
});

// ============================================================ 9c · o Itaú (71.3–75.16)
// "Só o Itaú pôs mais de oito bilhões, estima o Citi."
addScene("itau", 71.3, 75.16, (S) => {
  const D = buildDinner(S, { master: "empty", jarFill: 0.8 }); emptyMaster(S, D);
  const it = D.seats["ITAÚ"];
  const pile = new THREE.Group(); S.add(pile);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < 2; z++) { const b = makeCashBundle({ w: 0.17, d: 0.08, h: 0.04 }); b.position.set((x - 1) * 0.175 + (y % 2) * 0.02, y * 0.041, (z - 0.5) * 0.085); pile.add(b); }
  const anim = (t) => {
    D.update(t);
    const push = eOut(lin(t, 71.8, 73.0));
    it.diner.setPose({ sit: 1, table: 1 - 0.8 * push, reach: 0.6 * push * (1 - sm(t, 73.6, 74.4)), turn: it.turn, lean: 0.2 * push * (1 - sm(t, 73.6, 74.4)) });
    pile.position.set(it.side * 0.36 + 0.24 * push, D.top, it.z - 0.32 - 0.25 * push); pile.rotation.y = -0.2;
    D.jar.fill(0.8 + 0.2 * sm(t, 72.4, 73.6));
  };
  S.hero(pile, "pilha do itaú");
  S.hero(it.diner.group, "itaú");
  S.hero(it.card.group, "placa itaú");
  const A = CAM.pose(envelope([pile, it.diner.group, it.card.group], anim, 71.3, 75.16), { zone: "stage", from: [0.55, 0.42, 1] });
  const B = CAM.pose(envelope([pile, it.diner.group, it.card.group], anim, 71.3, 75.16), { zone: "stage", from: [0.35, 0.36, 1] });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 71.3, 75.16))); };
});

// ============================================================ 10 · você (75.16–82.3)
// "E aqui entra você: especialistas avaliam que essa conta tende a voltar no seu juro, na tarifa e
// no rendimento." Your phone on a café counter; the dinner glows far behind; three tags drop in.
addScene("voce", 75.16, 82.3, (S) => {
  const D = buildDinner(S, { master: "empty", jarFill: 1 }); emptyMaster(S, D);
  const far = new THREE.Group(); S.add(far);
  // the whole dinner moves far back and becomes backdrop
  for (const c of [...S.group.children]) if (c !== far) far.add(c);
  far.position.set(0.6, -0.2, -7.5); far.rotation.y = 0.5; asBackdrop(far);
  const counter = new THREE.Mesh(rbox(3.2, 0.1, 1.6, 0.03), pmat("#ffffff", { map: woodTex({ base: "#3a2214", seed: 31 }), roughness: 0.3, clearcoat: 0.7 })); counter.position.set(0, 0.95, 0); S.add(counter);
  const phone = makePhone(); phone.group.scale.setScalar(0.42); phone.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 });
  phone.group.position.set(0, 1.0 + 0.36, 0.1); phone.group.rotation.x = -0.18; S.add(phone.group);
  const standM = new THREE.Mesh(rbox(0.4, 0.04, 0.3, 0.01), pmat("#222", { roughness: 0.3, metalness: 0.5 })); standM.position.set(0, 1.02, 0.18); S.add(standM);
  paintBankApp(phone.ctx, { title: "Minha conta", lines: [["Juros do cartão", "▲", RED], ["Tarifa", "▲", RED], ["Rendimento", "▼", RED]], banner: "CONTA DO MASTER?" }); phone.tex.needsUpdate = true;
  const tags = [["JURO ↑", -0.62, 2.05], ["TARIFA ↑", 0.66, 2.0], ["RENDIMENTO ↓", 0.0, 2.35]].map(([txt, x, y], i) => { const tg = makePriceTag(txt, { w: i === 2 ? 1.12 : 0.86, h: 0.36, string: 0.3 }); tg.group.position.set(x, y, 0.35); S.add(tg.group); return tg; });
  const at = [79.9, 80.6, 81.4];
  const anim = (t) => {
    D.update(t); key.intensity = 2.1; hemi.intensity = 0.4;
    tags.forEach((tg, i) => { const k = eOut(lin(t, at[i] - 0.25, at[i] + 0.15)); tg.group.visible = t > at[i] - 0.25; tg.group.position.y = [2.05, 2.0, 2.35][i] + (1 - k) * 1.5; tg.tag.rotation.z = Math.sin((t - at[i]) * 5) * 0.18 * Math.exp(-Math.max(0, t - at[i]) * 1.6); });
  };
  S.hero(phone.group, "celular");
  tags.forEach((tg, i) => S.hero(tg.group, "etiqueta " + (i + 1), { when: (t) => t > at[i] + 0.2 }));
  const A = CAM.pose(envelope([phone.group, standM], anim, 75.16, 79.5), { zone: "stage", from: [0.1, 0.12, 1], pull: 1.08 });
  const B = CAM.pose(envelope([phone.group, ...tags.map((x) => x.group)], anim, 81.7, 82.3), { zone: "stage", from: [0, 0.1, 1] });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[75.16, A], [80.0, CAM.blend(A, B, 0.6), 2.5], [81.8, B, 1.2]])); };
});

// ============================================================ 11 · ninguém ileso (82.3–85.78)
addScene("ileso", 82.3, 85.78, (S) => {
  const D = buildDinner(S, { master: "empty", jarFill: 1 }); emptyMaster(S, D);
  const strips = SEATS.map((s) => { const r = makePlate("CONTA", 0.2, 0.07, { bg: "#fbf8f0", fg: "#b3241a", depth: 0.004 }); r.rotation.x = -Math.PI / 2 + 0.35; r.position.set(s.side * 0.2, D.top + 0.03, s.z + 0.15); S.add(r); return r; });
  const anim = (t) => {
    D.update(t);
    strips.forEach((r, i) => { r.visible = t > 83.75 + i * 0.08; r.scale.setScalar(Math.max(0.001, pop(t, 83.75 + i * 0.08, 0.3))); });
    SEATS.forEach((s, i) => D.seats[s.name].diner.setPose({ sit: 1, table: 1, turn: D.seats[s.name].turn, look: 0.3 * sm(t, 83.8, 84.3) }));
  };
  S.hero(D.table.group, "mesa");
  S.hero(D.masterChair.group, "cadeira vazia");
  const A = CAM.pose(envelope([D.table.group, D.masterChair.group], anim, 82.3, 85.78), { zone: "stage", from: [-0.3, 0.55, 1] });
  const B = CAM.pose(envelope([D.table.group, D.masterChair.group], anim, 82.3, 85.78), { zone: "stage", from: [0.3, 0.45, 1] });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 82.3, 85.78))); };
});

// ============================================================ 12 · a pergunta (85.78–93.3)
// "Quem deveria pagar a conta: todos os bancos, como hoje… ou só quem investiu no Master?"
addScene("pergunta", 85.78, 93.3, (S) => {
  const room = makeRestaurantRoom({ wallZ: -6.2, lampsX: [], tables: true, seed: 9 }); S.add(room.group);
  const left = makePlinth(1.5, 0.3, 1.2), right = makePlinth(1.5, 0.3, 1.2); left.position.set(-1.05, 0, 0); right.position.set(1.05, 0, 0); S.add(left, right);
  const pl = makePlate("BANCOS", 1.1, 0.2, { bg: "#141414", fg: "#e9e4dc" }); pl.position.set(-1.05, 0.15, 0.605); S.add(pl);
  const pr = makePlate("INVESTIDORES", 1.3, 0.2, { bg: "#141414", fg: "#e9e4dc" }); pr.position.set(1.05, 0.15, 0.605); S.add(pr);
  const bankers = [[-1.45, -0.1], [-1.05, 0.15], [-0.65, -0.1]].map(([x, z], i) => { const d = makeDiner({ suit: SEATS[i].suit, tie: SEATS[i].tie }); d.group.position.set(x, 0.3, z); S.add(d.group); return d; });
  const people = [[0.65, -0.1, "#5b6b7a", "#3a4a3a"], [1.05, 0.15, "#7a5a3a", "#4a2a2a"], [1.45, -0.1, "#3d5a4a", "#2a3a5a"]].map(([x, z, c1, c2]) => { const d = makeDiner({ suit: c1, shirt: "#e6e1d8", tie: c2 }); d.group.position.set(x, 0.3, z); S.add(d.group); return d; });
  const pivot = new THREE.Group(); pivot.position.set(0, 3.0, 0.1); S.add(pivot);
  const rc = makeReceipt({ w: 0.5, h: 1.0, lines: [["Mesa", "Master"], ["Pago por", "?"]], total: "R$ 50 BI" }); pivot.add(rc.group); rc.group.position.set(0, -0.35, 0);
  const anim = (t) => {
    room.update(t); key.intensity = 1.9; hemi.intensity = 0.35;
    const sw = Math.sin((t - 86) * 2.2) * 0.42 * (0.7 + 0.3 * Math.sin(t)); pivot.rotation.z = sw;
    rc.set(eOut(lin(t, 85.8, 86.6)));
    bankers.forEach((d, i) => d.setPose({ look: 0.15 + 0.15 * Math.sin(t + i), turn: Math.sin(t * 0.8 + i) * 0.15 }));
    people.forEach((d, i) => d.setPose({ look: 0.15 + 0.15 * Math.sin(t * 1.1 + i), turn: Math.sin(t * 0.7 + i) * 0.15 }));
  };
  S.hero(left, "lado bancos"); S.hero(right, "lado investidores"); S.hero(rc.group, "conta balançando");
  bankers.forEach((d) => S.solid(d.group, "banqueiro", { restsOn: ["lado bancos"] }));
  const A = CAM.pose(envelope([left, right, rc.group, ...bankers.map((d) => d.group), ...people.map((d) => d.group)], anim, 85.78, 93.3), { zone: "stage", from: [0.0, 0.18, 1] });
  const B = CAM.pose(envelope([left, right, rc.group, ...bankers.map((d) => d.group), ...people.map((d) => d.group)], anim, 85.78, 93.3), { zone: "stage", from: [0.0, 0.26, 1], pull: 1.04 });
  return (t) => { anim(t); CAM.apply(CAM.blend(A, B, sm(t, 85.78, 93.3))); };
});
