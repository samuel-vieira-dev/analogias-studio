// ============================================================================
// videos/2026-11-02-impacto-dolar/scenes.js
// O impacto do dólar no Brasil e no mundo. Gancho do Samuel: "Por que ligar pro dólar, se você ganha e
// gasta em real?" → +9% na semana depois do 2º turno (maior alta semanal desde 2008) → a padaria: o pão
// subiu e o padeiro nunca viu um dólar, mas a farinha viu → trigo (mais da metade de fora), adubo (+80%),
// remédios (9 de 10) → analogia: o dólar é o inglês do dinheiro → 89% das trocas de moeda → Bretton Woods
// 1944 → soja (quem exporta ganha) → a conta do BC (+10% no dólar = +1 ponto; na comida, mais que o dobro)
// → no ano, quase zero a zero → bom ou ruim?
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move/CAM.pose
// (envelope(...)) frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  real: 3.32, c1: 3.70,
  porque: 3.90, subiu: 6.60, nove: 7.08, maior: 8.74, y2008: 10.38, c2: 11.40,
  imagina: 11.62, paozinho: 13.88, subiu2: 14.36, padeiro: 15.20, nunca: 15.72, dolar: 16.72, vida: 17.30, mas: 17.86, farinha: 18.36, viu: 19.04, c3: 19.50,
  metade: 20.16, trigo: 20.92, fora: 22.60, argentina: 24.12, preco: 25.98, c4: 26.80,
  adubo: 27.32, oitenta: 29.08, importado: 30.20, materia: 31.16, remedios: 31.96, nove2: 32.88, dez: 33.78, c5: 34.30,
  porque2: 34.66, pensa: 35.64, brasileiro: 36.16, chines: 37.22, negocio: 38.30, naofala: 39.16, entao: 40.82, ingles: 41.88, odolar: 42.96, dinheiro: 44.66, c6: 45.15,
  nove3: 46.08, trocas: 47.26, planeta: 48.36, c7: 48.95,
  isso: 49.14, y1944: 49.94, p44: 52.22, brasil: 53.72, combinaram: 54.84, prender: 55.28, aodolar: 56.70, c8: 57.15,
  mas2: 57.32, ruim: 58.90, exportador: 61.46, soja: 62.40, vende: 63.98, recebe: 64.84, reais: 65.64, c9: 66.25,
  problema: 66.58, contas: 68.40, cada: 69.90, ponto: 72.68, inflacao: 73.50, comida: 75.02, mais: 76.38, dobro: 77.04, c10: 77.45,
  calma: 77.62, noano: 78.22, zero: 80.26, c11: 80.75,
  bom: 82.72, exporta: 84.20, ruim2: 85.78, cara: 87.60, end: 89.8,
};
// In-scene cuts (also in video.json → cuts).
const B3 = 17.75, B5 = 30.85, B8 = 52.0, B9 = 63.6, B10 = 69.85;

// ---------------------------------------------------------------- shared looks
function bakeryLook(set, t, flash = 0) {
  floor.visible = false; set.update(t); set.flare(flash);
  key.intensity = 1.9; key.color.set("#ffd2a8"); hemi.intensity = 0.5; hemi.color.set("#ffe2c4"); hemi.groundColor.set("#2a1a10");
  scene.fog.color.set("#1a120c");
}
function warehouseLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.7; key.color.set("#ffd9b8"); hemi.intensity = 0.45; hemi.color.set("#c9d8ff"); hemi.groundColor.set("#1a1612");
  scene.fog.color.set("#10141c");
}
function officeLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.8; key.color.set("#ffd6b0"); hemi.intensity = 0.45; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
const DOLLAR_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#050914"); g.addColorStop(0.55, "#0f1d38"); g.addColorStop(0.82, "#2e2a3e"); g.addColorStop(1, "#5a3426"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function portLook(set, t) {
  scene.background = DOLLAR_NIGHT; floor.visible = false; set.update(t);
  key.intensity = 1.6; key.color.set("#ffd6b0"); hemi.intensity = 0.42; hemi.color.set("#b9cdf5"); hemi.groundColor.set("#1a1410");
  scene.fog.color.set("#0d1424");
}
// Outdoor shots: keep the far side of the harbour out of the camera's fog.
function applyFar(p, far = 80) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 14); scene.fog.far = Math.max(scene.fog.far, far); }

// The value on the exchange display, from 4,99 to 5,44 (+9%), with a comma.
const brl = (v) => "R$ " + v.toFixed(2).replace(".", ",");

// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...]. Each
// framing runs its own camera move over its own time; the camera eases into the next one over `ease` s
// before it starts (CAM.track), so the frame size changes every 2–4 s (docs/visual.md → Direção).
// Heroes that only fit one framing get a `when` for that framing's time (inside(t, a, b)).
function shotTrack(t, segs, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : t0 + 4;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
const inside = (t, a, b) => t >= a && t < b;

// ============================================================ 1 · gancho: por que ligar pro dólar?
// The bakery counter at night: three real banknotes fanned on the marble; a dollar bill drops in from
// above, spinning, and lands on top of them, covering them. The camera pushes in.
addScene("gancho", 0, A.c1, (S) => {
  const set = makeBakerySet({ seed: 5 }); S.backdrop(set.group);
  const Y = set.counterY;
  const reais = new THREE.Group(); reais.position.set(0, Y, 0.1); S.add(reais);
  [["20", "#b8a23a", -0.3], ["50", "#a8663a", 0], ["100", "#3f6f86", 0.3]].forEach(([v, tint, a], i) => {
    const n = makeCurrencyNote("real", { w: 0.62, value: v, tint }); n.group.position.set(i * 0.1 - 0.1, i * 0.0035, -i * 0.03); n.group.rotation.y = a; reais.add(n.group);
  });
  const usd = makeCurrencyNote("dolar", { w: 0.62 }); S.add(usd.group);
  const LAND = 2.15;
  const anim = (t) => {
    bakeryLook(set, t);
    const k = eOut(lin(t, 0.55, LAND));
    usd.group.position.set(lerp(0.35, 0.02, k), Y + 0.012 + 1.6 * (1 - k), lerp(-0.2, 0.12, k));
    usd.group.rotation.set(-0.9 * (1 - k), 0.12 + 2.4 * (1 - k), 0.5 * (1 - k));
    usd.group.visible = t > 0.55;
    fill.position.set(0.2, Y + 0.9, 0.9); fill.color.set("#ffcf8a"); fill.intensity = 1.2;
  };
  S.hero(reais, "notas de real"); S.hero(usd.group, "nota de dólar", { when: (t) => t > LAND });
  const box = envelope([reais, usd.group], anim, LAND, A.c1);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.05, 1.15, 1], pull0: 1.3, pull: 1.0 }); p = CAM.shake(p, t, LAND, 0.02, 0.3); CAM.apply(p); };
});

// ============================================================ 2 · +9% em uma semana
// The bakery's exchange display on the wall: the price ticks from R$ 4,99 to R$ 5,44 on "subiu nove por
// cento", a red arrow, the bakery's lamps flash red. The camera comes down from above (drop).
addScene("cambio", A.c1, A.c2, (S) => {
  const set = makeBakerySet({ seed: 6, lampsX: [-1.7, 1.7] }); S.backdrop(set.group);
  const board = makeExchangeBoard({ w: 1.5, h: 1.1 }); board.group.position.set(0, 2.45, -0.99); S.add(board.group);
  const anim = (t) => {
    bakeryLook(set, t, 0.8 * beat(t, A.nove, 1.1));
    const k = sm(t, A.subiu, A.nove + 0.5), v = 4.99 + (5.44 - 4.99) * k;
    board.set(brl(Math.round(v * 100) / 100), t > A.subiu ? 1 : 0);
    fill.position.set(0, 2.4, 0.8); fill.color.set(t > A.subiu ? "#ff8a6a" : "#ffcf8a"); fill.intensity = 1.0 + 1.5 * beat(t, A.nove, 1.0);
  };
  const CLOSE = A.nove - 0.15, BACK = A.maior;
  S.hero(board.group, "painel do câmbio", { when: (t) => t < CLOSE - 0.45 || t >= BACK }); S.hero(board.screen, "visor do câmbio", { when: (t) => inside(t, CLOSE, BACK - 0.45) });
  const box = envelope([board.group], anim, A.c1, A.c2), bS = envelope([board.screen], anim, CLOSE, BACK);
  return (t) => {
    anim(t);
    let p = shotTrack(t, [[A.c1, box, "drop", { from: [0.25, 0.1, 1], rise: 0.35, pull: 1.04 }], [CLOSE, bS, "push", { from: [0.05, 0, 1], pull0: 1.12, pull: 1.0 }], [BACK, box, "truck", { from: [0, 0.05, 1], side: 0.3, pull: 1.04 }]]);
    p = CAM.shake(p, t, A.nove, 0.025, 0.4); CAM.apply(p);
  };
});

// ============================================================ 3 · imagina: o pão subiu; a farinha viu o dólar
// A (wide): the counter with a basket of rolls and a price card; the baker behind it (white jacket and
// cap); the card's red "SUBIU" pops on "subiu"; the baker shakes his head on "nunca viu um dólar". Crane.
// B (cut at "mas"): a sack of wheat flour on the floor in front of the counter; a green US$ tag swings in
// on "farinha". Push.
addScene("padaria", A.c2, A.c3, (S) => {
  const set = makeBakerySet({ seed: 7 }); S.backdrop(set.group);
  const Y = set.counterY;
  const basket = makeBreadBasket({ r: 0.38 }); basket.group.position.set(-0.4, Y, 0.1); S.add(basket.group);
  const card = makeShelfCard("PÃO FRANCÊS", { w: 0.72, h: 0.22, chip: "SUBIU", chipW: 0.46 }); card.group.position.set(0.5, Y, 0.16); S.add(card.group);
  const baker = makeDiner({ suit: "#efebe4", shirt: "#f6f3ee", tie: null, skin: "#b98a6e" }); baker.group.position.set(0.05, 0, -0.62); S.add(baker.group);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.095, 0.16, 28), pmat("#fbfaf6", { roughness: 0.8 })); hat.position.y = 0.14; baker.parts.head.add(hat);
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 14), pmat("#fbfaf6", { roughness: 0.85 })); puff.scale.y = 0.55; puff.position.y = 0.24; baker.parts.head.add(puff);
  const sack = makeProduceSack("FARINHA", { sub: "DE TRIGO", w: 0.52, h: 0.78, d: 0.34 }); sack.group.position.set(0.25, 0, 1.05); sack.group.rotation.y = -0.2; S.add(sack.group);
  const stamp = makeInkMark("US$", 0.4, 0.19, { ink: "#1f7a46", seed: 5 }); stamp.position.set(0, sack.h * 0.24, sack.front + 0.004); sack.group.add(stamp);
  const anim = (t) => {
    bakeryLook(set, t);
    card.showChip(pop(t, A.subiu2, 0.35));
    baker.setPose({ look: 0.12, lean: 0.04 });
    baker.parts.head.rotation.y = 0.4 * Math.sin((t - A.nunca) * 9) * sm(t, A.nunca, A.nunca + 0.3) * (1 - sm(t, A.vida - 0.2, A.vida + 0.2));
    sack.group.visible = t >= B3 - 0.05; basket.group.visible = t < B3; card.group.visible = t < B3;
    const sk = lin(t, A.farinha - 0.05, A.farinha + 0.1); stamp.visible = t > A.farinha - 0.05; stamp.scale.setScalar(lerp(1.5, 1, sk)); stamp.material.opacity = clamp(sk * 1.4);
    fill.position.set(t < B3 ? -0.2 : 0.4, t < B3 ? Y + 0.8 : 1.0, t < B3 ? 0.9 : 1.9); fill.color.set("#ffcf8a"); fill.intensity = 1.3;
  };
  const CARD = A.subiu2 - 0.15, BAKER = A.padeiro - 0.05;
  S.hero(basket.group, "cesto de pão francês", { when: (t) => t < CARD - 0.45 || inside(t, BAKER, B3) }); S.hero(card.group, "placa pão francês", { when: (t) => t < BAKER - 0.45 });
  S.hero(sack.group, "saco de farinha", { when: (t) => t > B3 });
  // the baker's upper body is framed with the basket (his legs stand hidden behind the counter)
  const bakerTop = [[-0.3, 1.05, -0.85], [0.4, 1.95, -0.4]];
  const bA = envelope([basket.group, card.group], anim, A.c2, B3 - 0.05).union(CAM.toBox(bakerTop));
  const bB = envelope([sack.group], anim, B3, A.c3), bCard = envelope([card.group], anim, CARD, BAKER);
  const bBaker = envelope([basket.group], anim, BAKER, B3).union(CAM.toBox(bakerTop));
  return (t) => {
    anim(t);
    if (t < B3) CAM.apply(shotTrack(t, [[A.c2, bA, "crane", { from: [0.2, 0.35, 1], rise: 0.25, pull: 1.02 }], [CARD, bCard, "push", { from: [0.15, 0.15, 1], pull0: 1.12, pull: 1.0 }], [BAKER, bBaker, "orbit", { from: [0, 0.3, 1], deg: 16, pull: 1.0 }]]));
    else CAM.apply(CAM.move(bB, "push", lin(t, B3, A.c3), { zone: "stage", from: [-0.3, 0.2, 1], pull0: 1.3, pull: 1.0 }));
  };
});

// ============================================================ 4 · mais da metade do trigo vem de fora
// A grain warehouse at night: two heaps of wheat with stake signs DE FORA and DO BRASIL; a box truck with
// ARGENTINA on its side rolls in behind and the imported heap grows bigger; on "preço em dólar" a green
// US$ sign is planted on top of it. The camera slides sideways (truck).
addScene("trigo", A.c3, A.c4, (S) => {
  const set = makeWarehouseSet({ wallZ: -5.5, ceil: 4.6, seed: 7 }); S.backdrop(set.group);
  const fora = makeGrainHeap({ r: 1.1, h: 1.0, base: "#d6a94a" }); fora.group.position.set(-1.15, 0, 0); S.add(fora.group);
  const br = makeGrainHeap({ r: 1.0, h: 0.9, base: "#cfa14a" }); br.group.position.set(1.15, 0, 0.05); S.add(br.group);
  const sF = makeStakeSign("DE FORA", { w: 1.15, h: 0.42, stake: 0.45, bg: ORANGE }); sF.group.position.set(-1.15, 0.05, 0.98); sF.group.rotation.x = -0.12; S.add(sF.group);
  const sB = makeStakeSign("DO BRASIL", { w: 1.35, h: 0.44, stake: 0.45, bg: "#2c7a3f" }); sB.group.position.set(1.15, 0.05, 0.92); sB.group.rotation.x = -0.12; S.add(sB.group);
  const flBR = makeNationFlag("brasil", { fw: 0.5, poleH: 0.9 }); flBR.group.scale.setScalar(1.15); S.add(flBR.group);
  const flAR = makeNationFlag("argentina", { fw: 0.5, poleH: 0.9 }); flAR.group.scale.setScalar(1.15); S.add(flAR.group);
  const usd = makeStakeSign("US$", { w: 0.62, h: 0.34, stake: 0.5, bg: "#1f7a46" }); S.add(usd.group);
  const anim = (t) => {
    warehouseLook(set, t); set.lamps(0.6 * beat(t, A.preco, 0.8), "#7dffb0");
    fora.grow(lerp(0.62, 1, sm(t, A.metade, A.fora + 0.2))); br.grow(0.92);
    const hF = 1.0 * Math.max(0.02, lerp(0.62, 1, sm(t, A.metade, A.fora + 0.2)));
    flBR.group.position.set(1.15, 0.9 * 0.92 - 0.04, 0.05); flBR.update(t);
    flAR.group.position.set(-1.15, hF - 0.04, 0); flAR.update(t); popIn(flAR.group, t, A.argentina - 0.1, 0.45, 1.15);
    // the US$ sign is planted on the imported heap's slope, on "preço em dólar"
    const ku = eOut(lin(t, A.preco - 0.15, A.preco + 0.25)); usd.group.visible = t > A.preco - 0.15;
    usd.group.position.set(-0.7, 0.56 + 1.2 * (1 - ku), 0.25); usd.group.rotation.z = -0.08;
    fill.position.set(-0.6, 2.0, 2.2); fill.color.set("#ffd59a"); fill.intensity = 1.4;
  };
  const FORA = A.argentina - 0.2, both = (t) => t < FORA - 0.45;
  S.hero(fora.group, "monte de trigo de fora"); S.hero(br.group, "monte de trigo do brasil", { when: both });
  S.hero(sF.group, "placa de fora"); S.hero(sB.group, "placa do brasil", { when: both });
  S.hero(flBR.group, "bandeira do brasil", { when: both }); S.hero(flAR.group, "bandeira da argentina", { when: (t) => t > A.argentina + 0.4 });
  S.hero(usd.group, "placa us$", { when: (t) => t > A.preco + 0.3 });
  const box = envelope([fora.group, br.group, sF.group, sB.group, flBR.group], anim, A.c3, FORA);
  const bF = envelope([fora.group, sF.group, flAR.group], anim, FORA, A.c4).union(envelope([usd.group], anim, A.preco + 0.3, A.c4));
  return (t) => {
    anim(t);
    let p = shotTrack(t, [[A.c3, box, "truck", { from: [0, 0.3, 1], side: 0.3, pull: 1.0 }], [FORA, bF, "push", { from: [0.15, 0.25, 1], pull0: 1.15, pull: 1.0 }]]);
    p = CAM.shake(p, t, A.preco + 0.25, 0.02, 0.3); CAM.apply(p);
  };
});

// ============================================================ 5 · adubo e remédio
// A (warehouse): ten sacks of fertilizer in two rows (the back row on a pallet stack); on "oitenta por
// cento" a red US$ stamp lands on eight of them, one after another. Orbit.
// B (cut at "a matéria-prima"): a pharmacy: a big blister card of ten capsules; on "nove de cada dez"
// nine capsules turn dollar green, one by one; the tenth stays orange. Push.
addScene("insumos", A.c4, A.c5, (S) => {
  const wh = makeWarehouseSet({ wallZ: -4.6, ceil: 4.4, seed: 11 }); S.backdrop(wh.group);
  const sacks = new THREE.Group(); S.add(sacks);
  const pallet = new THREE.Mesh(rbox(2.8, 0.62, 0.62, 0.02), pmat("#ffffff", { map: woodTex("#8a6a44"), roughness: 0.7 })); pallet.position.set(0, 0.31, -0.36); sacks.add(pallet);
  const stamps = [], STAMPED = [0, 1, 2, 4, 5, 6, 8, 9];
  for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
    const s = makeProduceSack("ADUBO", { cloth: "woven", band: "#1f7a46", w: 0.52, h: 0.8, d: 0.3, labelH: 0.2, labelW: 0.5, labelY: 0.36 });
    s.group.position.set(-1.08 + i * 0.54, row ? 0.62 : 0, row ? -0.36 : 0.12); sacks.add(s.group);
    const m = makeInkMark("US$", 0.5, 0.26, { seed: 3 + i + row * 5 }); m.position.set(0, s.h * 0.66, s.front + 0.004); s.group.add(m); stamps.push(m);
  }
  const room = makeClinicRoom({ wallZ: -2.0, seed: 8 }); S.backdrop(room.group);
  const counter = new THREE.Mesh(rbox(2.4, 0.9, 0.8, 0.02), pmat("#e9ece8", { roughness: 0.35, clearcoat: 0.5 })); counter.position.set(0, 0.45, 0); S.backdrop(counter);
  const blister = makeCapsuleBlister({ w: 1.15, h: 0.66 }); blister.group.position.set(0, 0.9, 0.05); S.add(blister.group);
  const anim = (t) => {
    const b = t >= B5;
    wh.group.visible = !b; sacks.visible = !b; room.group.visible = b; counter.visible = b; blister.group.visible = b;
    if (!b) { warehouseLook(wh, t); wh.lamps(0.7 * beat(t, A.oitenta, 0.9), "#ff6a4a"); }
    else { floor.visible = false; room.update(t); key.intensity = 1.6; key.color.set("#fff1dc"); hemi.intensity = 0.5; hemi.color.set("#e2f0ea"); scene.fog.color.set("#121816"); }
    STAMPED.forEach((idx, j) => { const at = A.oitenta + j * 0.14, k = lin(t, at, at + 0.12); stamps[idx].visible = t > at; stamps[idx].scale.setScalar(lerp(1.5, 1, k)); stamps[idx].material.opacity = clamp(k * 1.4); });
    [3, 7].forEach((idx) => { stamps[idx].visible = false; });
    for (let i = 0; i < 10; i++) blister.tint(i, i < 9 ? sm(t, A.nove2 + i * 0.1, A.nove2 + i * 0.1 + 0.25) : 0);
    fill.position.set(0, 1.6, 1.6); fill.color.set(b ? "#fff1dc" : "#ffd59a"); fill.intensity = 1.2;
  };
  S.hero(sacks, "sacos de adubo", { when: (t) => t < B5 }); S.hero(blister.group, "cartela de cápsulas", { when: (t) => t > B5 });
  const bA = envelope([sacks], anim, A.c4, B5 - 0.05), bB = envelope([blister.group], anim, B5, A.c5);
  return (t) => {
    anim(t);
    if (t < B5) { let p = CAM.move(bA, "orbit", lin(t, A.c4, B5), { zone: "stage", from: [0, 0.3, 1], deg: 18, pull: 1.0 }); p = CAM.shake(p, t, A.oitenta, 0.015, 0.3); CAM.apply(p); }
    else CAM.apply(CAM.move(bB, "crane", lin(t, B5, A.c5), { zone: "stage", from: [0.2, 0.3, 1], rise: 0.3, pull: 1.0 }));
  };
});

// ============================================================ 6 · analogia: o dólar é o inglês do dinheiro
// A meeting table in an office at night: a Brazilian and a Chinese businessman sit facing each other
// (place cards BRASIL and CHINA). On "não fala a língua" a "?" bubble pops over each; on "falam inglês"
// both turn to HELLO; on "o dólar é o inglês do dinheiro" the two bubbles fly to the middle and become
// one big US$ bubble over the table. The camera opens up (reveal).
addScene("ingles", A.c5, A.c6, (S) => {
  const set = makeOfficeSet({ wallZ: -2.2, clear: 1.8, seed: 4 }); S.backdrop(set.group);
  const lamp = makePendantLamp({ drop: 1.6, r: 0.24, light: true }); lamp.position.set(0, 4.2, 0); S.backdrop(lamp); lamp.userData.light.intensity = 3.2; lamp.userData.light.distance = 7;
  const table = makeDiningTable({ w: 1.0, d: 0.85, cloth: false }); S.add(table.group);
  const top = table.topY, seats = [];
  for (const [side, name, suit, tie] of [[-1, "BRASIL", "#26302a", "#1f7a46"], [1, "CHINA", "#2f2626", "#b8312a"]]) {
    const turn = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const ch = makeDiningChair({ fabric: "#5b1f22" }); ch.group.position.set(side * 0.92, 0, 0); ch.group.rotation.y = turn; S.add(ch.group);
    const d = makeDiner({ suit, tie }); d.group.position.set(side * 0.86, 0, 0); d.setPose({ sit: 1, table: 1, turn }); S.add(d.group);
    const card = makePlaceCard(name, { w: 0.5, h: 0.26 }); card.group.position.set(side * 0.27, top, 0.22); S.add(card.group);
    const bub = makeSpeechBubble(["?", "HELLO"], { w: 0.78, h: 0.42, tail: side < 0 ? -1 : 1 }); S.add(bub.group);
    seats.push({ side, d, card, bub, home: new V3(side * 0.72, 1.55, 0.05) });
  }
  const big = makeSpeechBubble(["US$"], { w: 0.95, h: 0.5, tail: 0 }); S.add(big.group);
  const MERGE = A.odolar, BIG = A.odolar + 0.45;
  const anim = (t) => {
    officeLook(set, t); set.windows(1 + 0.6 * beat(t, BIG, 1.0), "#ffe2b0");
    seats.forEach((s, i) => {
      s.d.setPose({ sit: 1, table: 1, turn: s.side < 0 ? Math.PI / 2 : -Math.PI / 2, look: 0.08 * Math.sin(t * 1.3 + i) });
      s.bub.show(t < 41.5 ? 0 : 1);
      const k = sm(t, MERGE, BIG); const p = s.home.clone().lerp(new V3(0, 1.75, 0.05), k);
      s.bub.group.position.copy(p);
      const sc = pop(t, A.naofala + i * 0.12, 0.35) * (1 - k);
      s.bub.group.visible = sc > 0.01; s.bub.group.scale.setScalar(Math.max(0.0001, sc));
    });
    big.group.position.set(0, 1.5, 0.05); popIn(big.group, t, BIG - 0.05, 0.45);
    fill.position.set(0, 2.0, 1.4); fill.color.set("#ffd9b0"); fill.intensity = 1.8; key.intensity = 2.2;
  };
  const L = A.brasileiro - 0.15, Rt = A.chines - 0.15, W = A.naofala - 0.35;
  const wide = (t) => t < L - 0.45 || t >= W;
  seats.forEach((s, i) => {
    const nm = i ? "chinês" : "brasileiro", [a, b] = i ? [Rt, W - 0.45] : [L, Rt - 0.45];
    S.hero(s.d.group, "executivo " + nm, { when: wide }); S.hero(s.d.parts.torso, "tronco do executivo " + nm, { when: (t) => inside(t, a, b) });
    S.hero(s.card.group, "placa " + (i ? "china" : "brasil"), { when: (t) => wide(t) || inside(t, a, b) });
    S.hero(s.bub.group, "balão " + (i ? "china" : "brasil"), { when: (t) => t > A.naofala + 0.4 && t < MERGE });
  });
  S.hero(big.group, "balão us$", { when: (t) => t > BIG + 0.4 });
  const box = envelope([seats[0].d.group, seats[1].d.group, seats[0].bub.group, seats[1].bub.group, big.group, table.group], anim, A.c5, A.c6);
  const bL = envelope([seats[0].d.parts.torso, seats[0].card.group], anim, L, Rt), bR = envelope([seats[1].d.parts.torso, seats[1].card.group], anim, Rt, W);
  return (t) => {
    anim(t);
    CAM.apply(shotTrack(t, [[A.c5, box, "push", { from: [0, 0.3, 1], pull0: 1.12, pull: 1.0 }], [L, bL, "truck", { from: [0.3, 0.15, 1], side: 0.15, pull: 1.05 }], [Rt, bR, "crane", { from: [-0.3, 0.15, 1], rise: 0.12, pull: 1.05 }],
      [W, box, "orbit", { from: [0, 0.28, 1], deg: 16, pull: 1.0 }], [MERGE, box, "reveal", { from: [0, 0.3, 1], pull0: 1.08, pull: 1.0 }]]));
  };
});

// ============================================================ 7 · o dólar em 9 de cada 10 trocas de moeda
// A departure-board of currency pairs in the office; on "nove de cada dez" the rows with USD light up
// green one after another; EUR / GBP blinks red. The camera slides past the board (truck).
addScene("pares", A.c6, A.c7, (S) => {
  const set = makeOfficeSet({ wallZ: -1.6, clear: 1.8, seed: 9 }); S.backdrop(set.group);
  const PAIRS = ["EUR / USD", "USD / JPY", "GBP / USD", "USD / CNY", "USD / BRL", "AUD / USD", "EUR / GBP", "USD / CAD", "USD / CHF", "USD / MXN"], NO = 6;
  const board = makeFxPairBoard(PAIRS, { w: 2.3, rowH: 0.19, legs: 0.3, cols: 2 }); S.add(board.group);
  const anim = (t) => {
    officeLook(set, t); set.windows(1 + 0.4 * beat(t, A.trocas, 0.8), "#c9ffe0");
    PAIRS.forEach((p, i) => { const at = A.nove3 - 0.15 + i * 0.085; if (i === NO) board.flash(i, 0.5 + 0.5 * Math.sin((t - at) * 14) * (t > at ? 1 : 0) * (t > at ? 1 : 0)); else board.light(i, sm(t, at, at + 0.2)); });
    if (t < A.nove3 - 0.15 + NO * 0.085) board.flash(NO, 0);
    fill.position.set(0.4, 1.6, 1.4); fill.color.set("#c9ffe0"); fill.intensity = 0.9 + 0.8 * sm(t, A.nove3, A.trocas);
  };
  S.hero(board.group, "painel de pares de moedas");
  const box = envelope([board.group], anim, A.c6, A.c7);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c6, A.c7), { zone: "stage", from: [0, 0.12, 1], side: 0.38, pull: 1.02 })); };
});

// ============================================================ 8 · 1944: 44 países, o Brasil junto
// A (archive hall at dusk): the Bretton Woods photo lands on a cork board as a polaroid ("1944"). Push.
// B (cut at "quarenta e quatro"): a mobile: a big US$ gold coin over a brass hoop; 44 coins of many metals
// lie on a green table below; the Brazilian coin (green and gold) lights up on "o Brasil junto"; on
// "combinaram prender" threads pull every coin up to hang from the hoop. Crane.
addScene("bretton", A.c7, A.c8, (S) => {
  const hall = makeEraHall([{ x0: -12, x1: 12, kind: "archive" }], { wallZ: -3.6, ceil: 9, seed: 6 }); S.backdrop(hall.group);
  const boardC = makeCorkBoard({ w: 2.6, h: 2.0, lift: 0.7 }); boardC.group.position.set(0, 0, -0.6); S.backdrop(boardC.group);
  const pr = makePhotoPrint("bretton-woods", { w: 1.7, caption: "BRETTON WOODS" }); boardC.group.add(pr.group);
  const rest = { pos: boardC.point(0, 0.02).add(new V3(0, 0, 0.012)), rotZ: -0.04 };
  const table = makeDiningTable({ w: 2.0, d: 1.3, clothColor: "#22402f" }); S.add(table.group);
  const mob = makeCoinMobile({ n: 44, R: 0.78, bigR: 0.3, restY: -1.25, restR: [0.2, 0.82], restZ: 0.6, coinR: 0.068, special: 11 }); mob.group.position.set(0, table.topY + 1.25, 0); S.add(mob.group);
  const anim = (t) => {
    const b = t >= B8;
    hall.update(t); floor.visible = false; key.intensity = 1.7; key.color.set("#ffd2a8"); hemi.intensity = 0.48; scene.fog.color.set("#16100c");
    boardC.group.visible = !b; table.group.visible = b; mob.group.visible = b;
    dropPrint(pr, t, A.isso + 0.05, rest, { d: 0.5 }); pr.zoom(1 + 0.14 * lin(t, A.isso, B8));
    const ks = []; for (let i = 0; i < mob.n; i++) { const at = A.combinaram + (i % 22) * 0.045 + (i % 2) * 0.12; ks.push(lin(t, at, at + 0.75)); }
    mob.set(ks, t - B8);
    const bk = pop(t, A.brasil, 0.4); mob.coin(mob.special).scale.setScalar(1 + 0.5 * bk * (1 - sm(t, A.combinaram - 0.2, A.combinaram + 0.3)) + 0.3 * sm(t, A.combinaram + 0.6, A.aodolar));
    hall.tint(0.25 * beat(t, A.brasil, 0.7), "#3cff8a");
    fill.position.set(0, b ? 2.4 : 2.2, 1.6); fill.color.set(b ? "#ffe2a0" : "#ffcf8a"); fill.intensity = b ? 1.6 : 1.2;
  };
  S.hero(pr.group, "polaroid bretton woods", { when: (t) => t > A.isso + 0.6 && t < B8 });
  S.hero(mob.group, "móbile de moedas", { when: (t) => t > B8 });
  S.hero(table.group, "mesa verde", { when: (t) => t > B8 });
  const bA = envelope([pr.group], anim, A.isso + 0.6, B8 - 0.05), bB = envelope([mob.group, table.group], anim, B8, A.c8);
  return (t) => {
    anim(t);
    if (t < B8) CAM.apply(CAM.move(bA, "push", lin(t, A.c7, B8), { zone: "stage", from: [0.1, 0.06, 1], pull0: 1.3, pull: 1.0 }));
    else CAM.apply(CAM.move(bB, "crane", lin(t, B8, A.c8), { zone: "stage", from: [0.2, 0.55, 1], rise: 0.25, pull: 1.0 }));
  };
});

// ============================================================ 9 · quem exporta recebe mais reais
// A (harbour at night): the photo of the soybean harvest in a frame on the quay (push). B (cut on "vende
// lá fora"): sacks of soybeans on a pallet; a green US$ tag swings on the middle sack; next to it a stack
// of real bundles grows on "recebe mais reais". Orbit.
addScene("soja", A.c8, A.c9, (S) => {
  const port = makePortNightSet({ quayZ: -3.2, seed: 6 }); S.backdrop(port.group);
  const fr = makePhotoFrame("soja-colheita", { w: 2.4 }); fr.group.position.set(0, 0, 0); S.add(fr.group);
  const soy = new THREE.Group(); soy.position.set(-0.5, 0, 0); S.add(soy);
  const pal = new THREE.Mesh(rbox(1.3, 0.14, 0.9, 0.02), pmat("#ffffff", { map: woodTex("#8a6a44"), roughness: 0.7 })); pal.position.y = 0.07; soy.add(pal);
  const sk = [];
  for (let i = 0; i < 3; i++) { const s = makeProduceSack("SOJA", { cloth: "woven", band: "#2e7d32", w: 0.4, h: 0.62, d: 0.3, base: "#efe7d2", labelH: 0.16, labelY: 0.37 }); s.group.position.set(-0.42 + i * 0.42, 0.14, i === 1 ? 0.12 : -0.05); soy.add(s.group); sk.push(s); }
  const stamp = makeInkMark("US$", 0.38, 0.2, { ink: "#1f7a46", seed: 8 }); stamp.position.set(0, sk[1].h * 0.68, sk[1].front + 0.004); sk[1].group.add(stamp);
  const cash = new THREE.Group(); cash.position.set(0.62, 0, 0.1); S.add(cash);
  const plinth = new THREE.Mesh(rbox(0.7, 0.14, 0.5, 0.02), pmat("#2a2c30", { metalness: 0.5, roughness: 0.4 })); plinth.position.y = 0.07; cash.add(plinth);
  const bundles = []; for (let i = 0; i < 9; i++) { const b = makeCashBundle(); b.scale.setScalar(3.4); b.position.set((i % 2 ? 0.01 : -0.01), 0.14 + i * 0.035 * 3.4, (i % 3 - 1) * 0.008); b.rotation.y = (i % 2 ? 0.04 : -0.03); cash.add(b); bundles.push(b); }
  const anim = (t) => {
    const b = t >= B9;
    portLook(port, t);
    fr.group.visible = !b; soy.visible = b; cash.visible = b;
    fr.frame.rotation.y = -1.1 * (1 - eOut(lin(t, A.c8, A.c8 + 0.7))); popIn(fr.group, t, A.c8 - 0.15, 0.4); fr.group.visible = fr.group.visible && !b; fr.zoom(1 + 0.16 * lin(t, A.c8, B9));
    const sk2 = lin(t, A.vende, A.vende + 0.15); stamp.visible = t > A.vende; stamp.scale.setScalar(lerp(1.5, 1, sk2)); stamp.material.opacity = clamp(sk2 * 1.4);
    bundles.forEach((bd, i) => { const at = A.recebe + (i - 4) * 0.13; const k = i < 4 ? 1 : pop(t, at, 0.3); bd.visible = k > 0.01; bd.scale.setScalar(Math.max(0.0001, k) * 3.4); });
    fill.position.set(b ? 0.3 : 0, 1.6, 1.8); fill.color.set("#ffd59a"); fill.intensity = 1.3 + 0.8 * beat(t, A.reais, 0.8);
  };
  const PH = A.exportador - 1.25;
  S.hero(fr.group, "porta-retrato colheita de soja", { when: (t) => t > A.c8 + 0.5 && t < PH - 0.45 }); S.hero(fr.photo, "foto colheita de soja", { when: (t) => inside(t, PH, B9) });
  S.hero(soy, "sacos de soja", { when: (t) => t > B9 }); S.hero(cash, "pilha de reais", { when: (t) => t > B9 });
  const bA = envelope([fr.group], anim, A.c8 + 0.5, PH), bB = envelope([soy, cash], anim, B9, A.c9), bP = envelope([fr.photo], anim, PH, B9 - 0.05);
  return (t) => {
    anim(t);
    if (t < B9) applyFar(shotTrack(t, [[A.c8, bA, "push", { from: [0.15, 0.18, 1], pull0: 1.2, pull: 1.0 }], [PH, bP, "crane", { from: [0.05, 0.04, 1], rise: 0.1, pull: 1.04 }]]));
    else applyFar(CAM.move(bB, "orbit", lin(t, B9, A.c9), { zone: "stage", from: [0, 0.35, 1], deg: 34, pull: 1.0 }));
  };
});

// ============================================================ 10 · a conta do Banco Central
// A (office): the photo of the Central Bank's headquarters in a frame (push). B (cut at "cada dez por
// cento"): a supermarket at night; two big thermometers, INFLAÇÃO and COMIDA, start level; on "um ponto a
// mais na inflação" the first rises one mark; on "na comida… mais que o dobro" the second rises 2.6 marks
// and the freezer wall behind turns red. The camera opens up (reveal).
addScene("bc", A.c9, A.c10, (S) => {
  const office = makeOfficeSet({ wallZ: -1.4, clear: 1.8, seed: 12 }); S.backdrop(office.group);
  const fr = makePhotoFrame("sede-bc", { w: 1.5, shape: "retrato", name: "BANCO CENTRAL" }); S.add(fr.group);
  const mk = makeSupermarketSet({ wallZ: -3.0, clear: 3.6, seed: 4 }); S.backdrop(mk.group);
  const th = new THREE.Group(); S.add(th);
  const geral = makeInflationThermometer("INFLAÇÃO", { h: 1.75, w: 0.56, max: 5, plateH: 0.16 }); geral.group.position.set(-0.44, 0, 0); th.add(geral.group);
  const comida = makeInflationThermometer("COMIDA", { h: 1.75, w: 0.56, max: 5, color: "#ff5a1f", plateH: 0.16 }); comida.group.position.set(0.44, 0, 0); th.add(comida.group);
  const BASE = 1.2;
  const anim = (t) => {
    const b = t >= B10;
    office.group.visible = !b; fr.group.visible = !b; mk.group.visible = b; th.visible = b;
    if (!b) officeLook(office, t);
    else { floor.visible = false; mk.update(t); mk.lights(1); mk.heat(0.8 * sm(t, A.comida, A.dobro)); key.intensity = 1.6; key.color.set("#f2f7ff"); hemi.intensity = 0.5; hemi.color.set("#dfeaff"); scene.fog.color.set("#0e131b"); }
    fr.frame.rotation.y = 1.0 * (1 - eOut(lin(t, A.c9, A.c9 + 0.7))); popIn(fr.group, t, A.c9 - 0.15, 0.4); fr.group.visible = fr.group.visible && !b; fr.zoom(1 + 0.14 * lin(t, A.c9, B10));
    geral.set(BASE + 1.0 * sm(t, A.ponto - 0.2, A.inflacao + 0.3));
    comida.set(BASE + 2.6 * sm(t, A.comida - 0.1, A.mais + 0.2));
    fill.position.set(0, 1.7, 1.5); fill.color.set(b ? "#ffb08a" : "#ffd6b0"); fill.intensity = 1.1 + 1.2 * beat(t, A.dobro - 0.3, 0.9);
  };
  S.hero(fr.group, "porta-retrato banco central", { when: (t) => t > A.c9 + 0.5 && t < B10 });
  const G = A.ponto - 0.4, C = A.comida - 0.2;
  S.hero(geral.group, "termômetro inflação", { when: (t) => inside(t, B10, G - 0.45) }); S.hero(geral.col, "coluna do termômetro inflação", { when: (t) => inside(t, G, C - 0.45) });
  S.hero(comida.group, "termômetro comida", { when: (t) => inside(t, B10, G - 0.45) }); S.hero(comida.col, "coluna do termômetro comida", { when: (t) => t >= C });
  const bA = envelope([fr.group], anim, A.c9 + 0.5, B10 - 0.05), bB = envelope([th], anim, B10, G);
  const bG = envelope([geral.col], anim, G, C), bC = envelope([comida.col], anim, C, A.c10);
  return (t) => {
    anim(t);
    if (t < B10) CAM.apply(CAM.move(bA, "push", lin(t, A.c9, B10), { zone: "stage", from: [-0.15, 0.12, 1], pull0: 1.15, pull: 1.0 }));
    else CAM.apply(shotTrack(t, [[B10, bB, "reveal", { from: [0.1, 0.2, 1], pull: 1.0, pull0: 1.12 }], [G, bG, "push", { from: [0.15, 0.12, 1], pull0: 1.12, pull: 1.0 }], [C, bC, "crane", { from: [-0.15, 0.15, 1], rise: 0.18, pull: 1.0 }]]));
  };
});

// ============================================================ 11 · calma: no ano, quase zero a zero
// Back at the bakery counter: a screen draws the dollar's year (no numbers): a slow slide down, the jump
// at the end, finishing near the dashed line where it started. The camera slides sideways (truck).
addScene("ano", A.c10, A.c11, (S) => {
  const set = makeBakerySet({ seed: 8 }); S.backdrop(set.group);
  const scr = makeLineScreen([[0, 0.6], [0.1, 0.62], [0.22, 0.52], [0.36, 0.46], [0.5, 0.4], [0.64, 0.34], [0.78, 0.28], [0.88, 0.2], [0.93, 0.24], [1, 0.57]], { w: 1.3, h: 0.78 });
  scr.group.position.set(0, set.counterY, 0.05); S.add(scr.group);
  const anim = (t) => { bakeryLook(set, t); scr.draw(sm(t, A.c10 - 0.1, A.noano + 1.0)); fill.position.set(0, set.counterY + 1, 1.2); fill.color.set("#ffcf8a"); fill.intensity = 1.1; };
  S.hero(scr.group, "tela com a linha do ano");
  const box = envelope([scr.group], anim, A.c10, A.c11);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c10, A.c11), { zone: "stage", from: [0, 0.15, 1], side: 0.35, pull: 1.04 })); };
});

// ============================================================ 12 · pergunta: bom ou ruim?
// The bakery counter: a brass two-pan scale; on the left pan a sack of soybeans and the card EXPORTA, on the
// right a shopping basket and the card COMIDA. It dips to the left on "bom", to the right on "ruim", and
// keeps rocking. Slow orbit.
addScene("pergunta", A.c11, A.end, (S) => {
  const set = makeBakerySet({ seed: 9 }); S.backdrop(set.group);
  const sc = makeTwoPanScale({ arm: 0.7, height: 1.35, panR: 0.36, chain: 0.66 }); sc.group.position.set(0, set.counterY, 0.05); S.add(sc.group);
  // the sack and the basket ride on the pans; the two cards stand on the counter in front of each pan
  const soy = makeProduceSack("SOJA", { cloth: "woven", band: "#2e7d32", w: 0.24, h: 0.3, d: 0.18, base: "#efe7d2", detail: true }); sc.holders[0].add(soy.group);
  const bask = makeGroceryBasket({ w: 0.3, d: 0.22, h: 0.14 }); sc.holders[1].add(bask.group);
  const exp = makeShelfCard("EXPORTA", { w: 0.5, h: 0.17 }); exp.group.position.set(-0.7, set.counterY, 0.42); S.add(exp.group);
  const com = makeShelfCard("COMIDA", { w: 0.5, h: 0.17 }); com.group.position.set(0.7, set.counterY, 0.42); S.add(com.group);
  const tiltAt = (t) => 0.2 * sm(t, A.bom - 0.15, A.bom + 0.45) - 0.4 * sm(t, A.ruim2 - 0.15, A.ruim2 + 0.5) + 0.2 * sm(t, A.cara, A.cara + 0.8) + 0.05 * Math.sin(t * 2.2) * sm(t, A.cara, A.cara + 1.0);
  const anim = (t) => { bakeryLook(set, t); sc.tilt(tiltAt(t)); fill.position.set(0, set.counterY + 1.3, 1.3); fill.color.set("#ffcf8a"); fill.intensity = 1.2; };
  const BOM = A.bom - 0.2, RUIM = A.ruim2 - 0.2, ALL = A.cara;
  const all = (t) => t < BOM - 0.45 || t >= ALL;
  S.hero(sc.group, "balança de dois pratos", { when: all });
  S.hero(soy.group, "saco de soja no prato", { when: (t) => inside(t, BOM, RUIM - 0.45) }); S.hero(exp.group, "placa exporta", { when: (t) => all(t) || inside(t, BOM, RUIM - 0.45) });
  S.hero(bask.group, "cesta de mercado no prato", { when: (t) => inside(t, RUIM, ALL - 0.45) }); S.hero(com.group, "placa comida", { when: (t) => all(t) || inside(t, RUIM, ALL - 0.45) });
  const box = envelope([sc.group, exp.group, com.group], anim, A.c11, A.end);
  const bL = envelope([soy.group, exp.group], anim, BOM, RUIM), bR = envelope([bask.group, com.group], anim, RUIM, ALL);
  return (t) => {
    anim(t);
    CAM.apply(shotTrack(t, [[A.c11, box, "orbit", { from: [0, 0.22, 1], deg: 16, pull: 1.02 }], [BOM, bL, "push", { from: [0.12, 0.2, 1], pull0: 1.12, pull: 1.0 }], [RUIM, bR, "crane", { from: [-0.12, 0.2, 1], rise: 0.15, pull: 1.0 }], [ALL, box, "reveal", { from: [0, 0.22, 1], pull0: 1.08, pull: 1.0 }]]));
  };
});
