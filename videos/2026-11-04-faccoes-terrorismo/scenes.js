// ============================================================================
// videos/2026-11-04-faccoes-terrorismo/scenes.js
// Facções criminosas são terrorismo? Gancho: "Os Estados Unidos puseram o PCC na mesma lista da
// al-Qaeda" → a estante de pastas do escritório americano (AL-QAEDA, HAMAS) recebe PCC e CV, carimbadas
// TERRORISTA → o porta-retrato do Departamento de Estado (desde junho) → pra lei brasileira, não (o livro da
// Lei 13.260 e o carimbo NÃO) → "imagina": a rua fechada, barricada, ônibus pegando fogo; terror ≠ terrorismo
// → analogia: a porta de cofre de duas fechaduras, ATO e MOTIVO. A chave ATO entra e gira; a fechadura
// MOTIVO espera preconceito ou xenofobia; a chave dourada LUCRO não entra → recado × negócio (megafone e
// maleta de dinheiro) → Gakiya (cartão) → a balança: facção pesa mais; colunas de 30 e 40 anos → pra que o
// rótulo? dinheiro: o palete de dinheiro no galpão acorrentado e congelado; quem ajuda vira criminoso →
// asfixia × soberania (cartão do Lula) → RJ e MT querem o rótulo; só o Congresso cria crime → a porta abre.
// Tema político: os dois lados com fonte, sem torcida. Números em fatos.md.
// Times come from audio/words.json (A below). anim(t) animates objects only; CAM.move / facTrack frame the
// subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  pcc: 1.86, lista: 3.1, qaeda: 3.84, comando: 4.56, tambem: 5.32, c1: 5.95,
  desde: 6.08, junho: 6.38, americanos: 7.3, terroristas: 8.84, c2: 9.6,
  lei: 10.36, nao: 11.58, c3: 12.3,
  imagina: 12.42, casa: 13.78, rua: 14.38, fechada: 14.66, barricada: 15.72, onibus: 16.38, fogo: 17.22, c4: 17.75,
  voce: 18.04, terror: 19.08, terrorismo: 20.62, porque: 21.34, c5: 21.75,
  porta: 22.42, fechaduras: 23.42, abre: 24.66, chaves: 25.64, c6: 26.15,
  ato: 27.3, bomba: 27.88, ataque: 28.58, sabotagem: 29.14, c7: 29.65,
  motivo: 30.96, preconceito: 31.7, etnia: 33.56, estrangeiro: 35.62, c8: 36.35,
  primeira: 37.38, segunda: 38.52, outra: 39.84, lucro: 40.56, c9: 41.15,
  medo: 42.46, recado: 43.4, faccao: 44.14, negocio: 45.92, c10: 46.5,
  gakiya: 48.06, anos20: 51.14, c11: 51.7,
  estranho: 52.9, pune: 54.62, terrorismo2: 55.94, c12: 56.7,
  trinta: 57.84, faccao2: 59.16, marco: 61.0, quarenta: 61.88, c13: 62.6,
  rotulo: 63.84, dinheiro: 64.54, c14: 65.15,
  congela: 66.68, bens: 67.44, ajuda: 68.74, criminoso: 69.62, c15: 70.3,
  asfixia: 71.7, crime: 72.64, c16: 73.0,
  lula: 73.64, soberania: 75.0, c17: 75.7,
  rio: 76.14, mato: 76.4, estadual: 78.6, c18: 79.25,
  congresso: 80.92, cria: 81.26, c19: 81.8,
  chamar: 82.52, terrorismo3: 83.62, sufoca: 84.26, dinheiro2: 85.08, abre2: 86.52, porta2: 86.96, interferencia: 87.58, fora: 88.26, comenta: 88.52, end: 91.4,
};

// ---------------------------------------------------------------- shared helpers
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function facTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
// Outdoor shots: keep the far houses, the hill and the sky out of the camera's fog.
function facFar(p, far = 90) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 10); scene.fog.far = Math.max(scene.fog.far, far); }
function facGrad(stops) { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, col]) => g.addColorStop(p, col)); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); }
const FAC_NIGHT = facGrad([[0, "#03050c"], [0.5, "#0b1430"], [0.82, "#1e2440"], [1, "#2a2030"]]);
const FAC_DUSK = facGrad([[0, "#0b1a38"], [0.28, "#24406e"], [0.42, "#b0664a"], [0.5, "#f0a05a"], [0.58, "#8a6250"], [1, "#3a3230"]]);

// Dark wooden desk. Origin floor centre; returns { group, top }.
function makeFacDesk({ w = 2.4, d = 1.1, top = 0.75, wood = "#3a2416" } = {}) {
  const g = new THREE.Group();
  const mt = pmat("#ffffff", { map: woodTex({ base: wood, seed: 31 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; g.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); g.add(l); }
  return { group: g, top };
}

// Case folder standing up (leaning back a little in its rack): card cover with a tab, a black label plate
// near the top. ink(text) prints a stamp mark across the lower half (hidden until mark(k)).
// Origin: bottom centre; faces +z. API { group, mark(k), w, h }
function makeFacFolder(label, { w = 0.7, h = 0.86, color = "#d9b77a", fg = "#ffffff", ink = null } = {}) {
  const g = new THREE.Group(), cm = pmat(color, { roughness: 0.78, map: noiseTex({ base: color, amount: 0.08, size: 1.4, seed: 23 }) });
  const back = new THREE.Mesh(rbox(w, h, 0.03, 0.012), cm); back.position.set(0, h / 2, -0.025); g.add(back);
  const papers = new THREE.Mesh(rbox(w - 0.05, h - 0.06, 0.03, 0.006), pmat("#efe9dc", { roughness: 0.9 })); papers.position.set(0, h / 2 + 0.02, 0); g.add(papers);
  const front = new THREE.Mesh(rbox(w, h * 0.92, 0.02, 0.01), cm); front.position.set(0, h * 0.46, 0.025); g.add(front);
  const tab = new THREE.Mesh(rbox(w * 0.34, 0.09, 0.02, 0.01), cm); tab.position.set(-w * 0.26, h + 0.04, -0.025); g.add(tab);
  const plate = makePlate(label, w * 0.9, h * 0.26, { bg: "#141414", fg, depth: 0.012 }); plate.position.set(0, h * 0.74, 0.042); g.add(plate);
  let mk = null;
  if (ink) { mk = makeInkMark(ink, w * 0.9, h * 0.3, { seed: label.length + 3 }); mk.position.set(0, h * 0.36, 0.037); mk.rotation.z = 0.06; mk.material.opacity = 0; mk.visible = false; g.add(mk); }
  return { group: g, plate, w, h, mark: (k) => { if (!mk) return; mk.visible = k > 0.01; mk.material.opacity = clamp(k); mk.scale.setScalar(1 + 0.25 * (1 - clamp(k))); } };
}
// Low black steel rack for upright folders: a base tray, a back rail, a front rail and slot dividers.
// Origin: floor centre; faces +z. API { group, slot(i) → local x }
// Two tiers: the back tier stands on a riser (rise) so its labels show over the front folders.
// slot(i) → local [x, y, z] of slot i (0, 1 back tier; 2, 3 front tier).
function makeFacFolderRack({ slotW = 0.98, d = 0.3, rise = 0.42 } = {}) {
  const g = new THREE.Group(), steel = pmat("#22252b", { metalness: 0.7, roughness: 0.35 }), W = 2 * slotW + 0.06;
  const tier = (y, z, back) => {
    const base = new THREE.Mesh(rbox(W, 0.03, d, 0.01), steel); base.position.set(0, y + 0.015, z); g.add(base);
    const rl = new THREE.Mesh(rbox(W, 0.1, 0.02, 0.006), steel); rl.position.set(0, y + 0.08, z + d / 2 - 0.015); g.add(rl);
    for (let i = 0; i <= 2; i++) { const dv = new THREE.Mesh(rbox(0.02, 0.22, d - 0.03, 0.006), steel); dv.position.set(-W / 2 + 0.03 + i * slotW, y + 0.14, z); g.add(dv); }
    if (back) { const bk = new THREE.Mesh(rbox(W, 0.34, 0.02, 0.006), steel); bk.position.set(0, y + 0.2, z - d / 2 + 0.015); g.add(bk); }
  };
  const riser = new THREE.Mesh(rbox(W, rise, d, 0.015), steel); riser.position.set(0, rise / 2, -d / 2); g.add(riser);
  tier(rise, -d / 2, true); tier(0, d / 2, false);
  g.add(contactShadow(W + 0.4, 2 * d + 0.4));
  return { group: g, slot: (i) => [-W / 2 + 0.03 + ((i % 2) + 0.5) * slotW, i < 2 ? rise + 0.03 : 0.03, i < 2 ? -d / 2 : d / 2], W };
}

// ============================================================ 1 + 2 · gancho: a lista dos EUA
// An office at night in cool blue-grey; on the desk a black rack with two dark folders, AL-QAEDA and HAMAS.
// The PCC folder drops into the third slot on "PCC" and gets the red TERRORISTA stamp on "al-Qaeda"; the CV
// folder drops on "Comando Vermelho" and is stamped on "também". The city windows flash red on al-Qaeda.
function buildFacUsOffice(S, seed) {
  const office = makeOfficeSet({ wallZ: -1.6, clear: 3.2, seed, wall: "#36404e" }); S.backdrop(office.group);
  const win = makeSetWindow(2.2, 1.3, { seed: seed + 11 }); win.group.position.set(0, 1.85, -1.6 + 0.15); S.backdrop(win.group);
  const lamp = makePendantLamp({ drop: 0.9, r: 0.2 }); lamp.position.set(-1.25, 3.3, -0.9); asBackdrop(lamp); S.backdrop(lamp);
  const desk = makeFacDesk({ w: 3.6, d: 1.1 }); desk.group.position.z = -0.95; S.add(desk.group);
  const rack = makeFacFolderRack({}); rack.group.position.set(0, desk.top, -1.05); S.add(rack.group);
  const F = [
    makeFacFolder("AL-QAEDA", { w: 0.92, h: 0.8, color: "#3b3f46" }), makeFacFolder("HAMAS", { w: 0.92, h: 0.8, color: "#3b3f46" }),
    makeFacFolder("PCC", { w: 0.92, h: 0.8, ink: "TERRORISTA" }), makeFacFolder("CV", { w: 0.92, h: 0.8, ink: "TERRORISTA" }),
  ];
  const at = (i) => { const [x, y, z] = rack.slot(i); return [x, desk.top + y, -1.05 + z]; };
  F.forEach((f, i) => { const [x, y, z] = at(i); f.group.position.set(x, y, z); f.group.rotation.x = -0.1; S.add(f.group); });
  return { office, desk, rack, F, top: desk.top, at, win };
}
function facDropFolder(f, t, at, [x, y, z]) {
  const k = eOut(lin(t, at, at + 0.42)), b = Math.sin(clamp((t - at - 0.42) / 0.25) * Math.PI) * 0.03 * (t > at + 0.42 ? 1 : 0);
  f.group.visible = t >= at; f.group.position.set(x, y + 1.3 * (1 - k) + b, z); f.group.rotation.set(-0.1, 0, 0.25 * (1 - k));
}
function facOfficeLook(set, t, cool = true) {
  floor.visible = false; set.update(t);
  key.intensity = 1.9; key.color.set(cool ? "#e8eeff" : "#ffd6b0"); hemi.intensity = 0.45; hemi.color.set(cool ? "#c9d8ff" : "#ffe1c0"); hemi.groundColor.set("#14110f");
  scene.fog.color.set(cool ? "#0c1018" : "#120e0c");
}
addScene("gancho", 0, A.c1, (S) => {
  const O = buildFacUsOffice(S, 6), [fA, fH, fP, fC] = O.F;
    const anim = (t) => {
    facOfficeLook(O.office, t);
    const red = t > A.qaeda - 0.05;
    O.office.windows(1 + 0.8 * beat(t, A.qaeda - 0.05, 0.8) + 0.5 * beat(t, A.tambem, 0.6), red ? "#ffb0a4" : null); O.win.set(1 + 0.9 * beat(t, A.qaeda - 0.05, 0.8) + 0.5 * beat(t, A.tambem, 0.6), red ? "#ffb0a4" : "#ffffff");
    facDropFolder(fP, t, A.pcc - 0.2, O.at(2)); facDropFolder(fC, t, A.comando - 0.15, O.at(3));
    fP.mark(lin(t, A.qaeda - 0.1, A.qaeda + 0.1)); fC.mark(lin(t, A.tambem - 0.1, A.tambem + 0.1));
    fill.position.set(0.6, O.top + 1.1, 0.4); fill.color.set(red ? "#ff5a3a" : "#ffd9a8"); fill.intensity = 0.8 + 1.8 * beat(t, A.qaeda - 0.05, 0.6) + 1.2 * beat(t, A.tambem, 0.5);
  };
  S.hero(O.rack.group, "estante de pastas");
  O.F.forEach((f, i) => S.hero(f.group, "pasta " + ["al-qaeda", "hamas", "pcc", "cv"][i], { when: i === 2 ? (t) => t > A.pcc + 0.35 : i === 3 ? (t) => t > A.comando + 0.4 : null }));
  const box = envelope([O.rack.group, ...O.F.map((f) => f.group)], anim, A.c1 - 0.2, A.c1);
  return (t) => {
    anim(t);
    let p = facTrack(t, [[0, box, "push", { from: [0.06, 0.32, 1], pull0: 1.3, pull: 1.02 }], [A.comando - 0.2, box, "truck", { from: [0.02, 0.3, 1], side: 0.22, pull: 1.0 }]], A.c1, 0.5);
    p = CAM.shake(p, t, A.qaeda, 0.014, 0.3); p = CAM.shake(p, t, A.tambem, 0.01, 0.25); CAM.apply(p);
  };
});

// The same office: the State Department photo in a frame on the desk turns and lands; behind it the rack
// with the four folders, now both red-stamped. Orbit.
addScene("junho", A.c1, A.c2, (S) => {
  const O = buildFacUsOffice(S, 6);
  O.rack.group.visible = false; O.F.forEach((f) => { f.group.visible = false; });
  const fr = makePhotoFrame("dept-estado", { w: 1.5, name: "DEPTO. DE ESTADO" }); fr.group.position.set(0.1, O.top, -0.62); S.add(fr.group);
  const anim = (t) => {
    facOfficeLook(O.office, t); O.office.windows(1 + 0.5 * beat(t, A.terroristas, 0.6), t > A.terroristas ? "#ffb0a4" : null); O.win.set(1 + 0.6 * beat(t, A.terroristas, 0.6), t > A.terroristas ? "#ffb0a4" : "#ffffff");
    fr.frame.rotation.y = 1.4 * (1 - eOut(lin(t, A.c1, A.c1 + 0.55))); fr.zoom(1 + 0.14 * sm(t, A.c1, A.c2));
    fill.position.set(0.2, O.top + 1.2, 0.6); fill.color.set("#ffe2c0"); fill.intensity = 1.2 + 1.0 * beat(t, A.terroristas, 0.6);
  };
  S.hero(fr.group, "porta-retrato departamento de estado");
  const box = envelope([fr.group], anim, A.c1 + 0.55, A.c2);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c1, A.c2), { zone: "stage", from: [0.1, 0.12, 1], deg: 32, pull: 1.04 })); };
});

// ============================================================ 3 · pra lei brasileira, não
// A Brasília office in warm light: on the desk the Lei 13.260 book, the Brazilian flag and the PCC folder
// lying flat; on "não" a rubber stamp comes down on the folder and leaves NÃO in red.
function buildFacBrOffice(S, seed) {
  const office = makeOfficeSet({ wallZ: -1.6, clear: 3.2, seed, wall: "#4d3b2e" }); S.backdrop(office.group);
  const win = makeSetWindow(2.2, 1.3, { seed: seed + 11 }); win.group.position.set(-0.2, 1.7, -1.6 + 0.15); S.backdrop(win.group);
  const lamp = makePendantLamp({ drop: 0.9, r: 0.2 }); lamp.position.set(0.0, 3.3, -0.75); asBackdrop(lamp); S.backdrop(lamp);
  const desk = makeFacDesk({ w: 3.0, d: 1.2, wood: "#4a2c1a" }); desk.group.position.z = -0.85; S.add(desk.group);
  const flag = makeNationFlag("brasil", { poleH: 1.1, fw: 0.7 }); flag.group.position.set(1.05, desk.top, -1.25); S.add(flag.group);
  return { office, desk, flag, top: desk.top, win };
}
addScene("lei", A.c2, A.c3, (S) => {
  const O = buildFacBrOffice(S, 8);
  const book = makeLawBook({ w: 1.25, d: 1.3, t: 0.2, color: "#1f3d2e", title: "LEI 13.260", emblem: false }); book.group.position.set(-0.62, O.top, -0.82); book.group.rotation.y = 0.12; S.add(book.group);
  // PCC folder lying flat, label up (a thin card with the plate printed on top)
  const pg = new THREE.Group(); pg.position.set(0.55, O.top, -0.7); pg.rotation.y = -0.1; S.add(pg);
  const card = new THREE.Mesh(rbox(0.72, 0.03, 0.9, 0.01), pmat("#d9b77a", { roughness: 0.78 })); card.position.y = 0.015; pg.add(card);
  const ftab = new THREE.Mesh(rbox(0.26, 0.03, 0.1, 0.01), pmat("#d9b77a", { roughness: 0.78 })); ftab.position.set(-0.2, 0.015, -0.49); pg.add(ftab);
  const pl = makePlate("PCC", 0.6, 0.24, { bg: "#141414", fg: "#ffffff", depth: 0.01 }); pl.rotation.x = -Math.PI / 2; pl.position.set(0, 0.036, -0.25); pg.add(pl);
  const ink = makeInkMark("NÃO", 0.56, 0.3, { seed: 11 }); ink.rotation.x = -Math.PI / 2; ink.position.set(0, 0.033, 0.13); ink.material.opacity = 0; pg.add(ink);
  pg.add(contactShadow(1.0, 1.2));
  const stamp = makeStamp({ w: 0.6, d: 0.34 }); S.add(stamp);
  const anim = (t) => {
    facOfficeLook(O.office, t, false); O.flag.update(t); O.office.windows(1 - 0.5 * beat(t, A.nao, 0.6)); O.win.set(1 - 0.5 * beat(t, A.nao, 0.6), "#ffffff");
    const down = sm(t, A.nao - 0.35, A.nao), up = sm(t, A.nao + 0.18, A.nao + 0.55);
    stamp.visible = t > A.nao - 0.6 && t < A.nao + 0.75;
    stamp.position.set(0.55, O.top + 0.035 + 0.9 * (1 - down) + 0.9 * up, -0.57); stamp.rotation.y = -0.1;
    ink.material.opacity = t > A.nao ? 1 : 0; ink.visible = t > A.nao;
    fill.position.set(0, O.top + 1.2, 0.4); fill.color.set(t > A.nao ? "#ff5a3a" : "#ffd9a8"); fill.intensity = 0.9 + 1.6 * beat(t, A.nao, 0.6);
  };
  S.hero(book.group, "livro da lei 13.260"); S.hero(pg, "pasta pcc deitada");
  const box = envelope([book.group, pg], anim, A.c2, A.c3);
  return (t) => { anim(t); let p = CAM.move(box, "crane", lin(t, A.c2, A.c3), { zone: "stage", from: [0.05, 1.2, 1], rise: 0.35, pull: 1.04 }); p = CAM.shake(p, t, A.nao, 0.016, 0.3); CAM.apply(p); };
});

// ============================================================ 4 + 5 · imagina: a rua fechada, o ônibus em chamas
// A street of a working-class neighbourhood at night: two- and three-storey plastered houses with lit
// windows and steel gates, sodium street lamps, sagging power lines, the lights of a hill of houses far
// behind. Across the road a burning bus and, in front of it, a barricade of tyres, pallets and rubble.
// Flame tongue texture (additive): a white-yellow core fading through orange to transparent.
const FAC_FLAME = (() => {
  const c = makeCanvas(128, 256), x = c.getContext("2d");
  const g = x.createRadialGradient(64, 190, 6, 64, 150, 120); g.addColorStop(0, "rgba(255,248,214,1)"); g.addColorStop(0.25, "rgba(255,196,82,0.95)"); g.addColorStop(0.55, "rgba(255,110,26,0.6)"); g.addColorStop(1, "rgba(160,30,0,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(64, 6); x.bezierCurveTo(118, 90, 124, 200, 64, 250); x.bezierCurveTo(4, 200, 10, 90, 64, 6); x.fill();
  return texFrom(c);
})();
const FAC_SMOKE = (() => {
  const c = makeCanvas(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(120,110,104,0.55)"); g.addColorStop(0.6, "rgba(90,82,78,0.25)"); g.addColorStop(1, "rgba(90,82,78,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return texFrom(c);
})();
// Fire over a box (w × d at the origin's height): flickering flame sprites, rising black smoke, embers and an
// orange point light. Decor only (never framed). API { group, update(t, k), light }
function makeFacFire({ w = 1, d = 0.6, h = 0.9, n = 14, smoke = 10, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), fl = [], sm_ = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FAC_FLAME, color: "#ffb36a", blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false }));
    s.userData.base = [(r() - 0.5) * w, (r() - 0.5) * d, 0.5 + r() * 0.7, r() * 10, 0.5 + r() * 0.6]; g.add(s); fl.push(s);
  }
  for (let i = 0; i < smoke; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: FAC_SMOKE, color: "#8a7f78", transparent: true, depthWrite: false, opacity: 0.5 }));
    s.userData.base = [(r() - 0.5) * w * 0.8, (r() - 0.5) * d * 0.6, r()]; g.add(s); sm_.push(s);
  }
  const emb = []; for (let i = 0; i < 40; i++) emb.push(r(), r(), r(), r());
  const eg = new THREE.BufferGeometry(); eg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(120), 3));
  const embers = new THREE.Points(eg, new THREE.PointsMaterial({ color: "#ffb347", size: 0.035, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); embers.frustumCulled = false; g.add(embers);
  const light = new THREE.PointLight("#ff7a2a", 0, 9, 1.5); light.position.y = h * 0.6; g.add(light);
  asBackdrop(g);
  const update = (t, k = 1) => {
    fl.forEach((s) => { const [x, z, sc, ph, sp] = s.userData.base, f = 0.75 + 0.3 * Math.sin(t * (9 + sp * 6) + ph) + 0.12 * Math.sin(t * 23 + ph * 2); const hh = h * sc * f * k; s.visible = k > 0.02; s.scale.set(Math.max(0.001, hh * 0.55), Math.max(0.001, hh), 1); s.position.set(x + 0.04 * Math.sin(t * 5 + ph), hh * 0.45, z); });
    sm_.forEach((s, i) => { const [x, z, ph] = s.userData.base, q = (t * 0.22 + ph) % 1; s.visible = k > 0.02; s.position.set(x + q * 0.9 + 0.15 * Math.sin(t + i), h * 0.9 + q * h * 3.2, z - q * 0.4); s.scale.setScalar(0.5 + q * 2.6 * Math.max(0.6, w)); s.material.opacity = 0.5 * k * Math.sin(Math.PI * q); });
    const P = eg.attributes.position.array;
    for (let i = 0; i < 40; i++) { const q = (t * (0.35 + emb[i * 4 + 3] * 0.4) + emb[i * 4 + 2]) % 1; P[i * 3] = (emb[i * 4] - 0.5) * w + 0.3 * q * Math.sin(t * 2 + i); P[i * 3 + 1] = h * 0.3 + q * h * 2.6; P[i * 3 + 2] = (emb[i * 4 + 1] - 0.5) * d; }
    eg.attributes.position.needsUpdate = true; embers.material.opacity = 0.9 * k; embers.visible = k > 0.02;
    light.intensity = 6 * k * (0.8 + 0.2 * Math.sin(t * 13) + 0.1 * Math.sin(t * 31));
  };
  update(0, 1);
  return { group: g, update, light };
}
// Barricade across the road: a pile of car tyres, two broken wooden pallets on end, a bent steel sheet,
// broken blocks and rubble. Width along x. Origin: floor centre. API { group, w }
function makeFacBarricade({ w = 2.6, seed = 9 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), rubber = pmat("#1a1a1a", { roughness: 0.82 }), tread = pmat("#232323", { roughness: 0.95 });
  const tyre = (x, y, z, rx, ry) => {
    const t = new THREE.Group(); t.position.set(x, y, z); t.rotation.set(rx, ry, 0); g.add(t);
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.11, 16, 36), rubber); t.add(o);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.14, 36, 1, true), tread); b.rotation.x = Math.PI / 2; t.add(b);
  };
  // stacks of tyres lying flat and a few standing
  for (const [x, z, n] of [[-0.95, 0.05, 3], [-0.2, -0.1, 2], [0.75, 0.1, 3]]) for (let i = 0; i < n; i++) tyre(x + (r() - 0.5) * 0.06, 0.11 + i * 0.22, z + (r() - 0.5) * 0.06, Math.PI / 2, 0);
  tyre(0.25, 0.37, 0.28, 0.25, 0.4); tyre(-0.6, 0.37, 0.3, -0.2, -0.3);
  // pallets on end, leaning
  const wood = pmat("#ffffff", { map: woodTex("#7a5a3a"), roughness: 0.8 });
  for (const [x, rz, ry] of [[-0.55, 0.28, 0.2], [0.35, -0.22, -0.15]]) {
    const p = new THREE.Group(); p.position.set(x, 0.55, -0.32); p.rotation.set(-0.22, ry, rz); g.add(p);
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(rbox(0.1, 1.0, 0.025, 0.005), wood); s.position.set(-0.4 + i * 0.2, 0, 0); p.add(s); }
    for (const y of [-0.38, 0, 0.38]) { const s = new THREE.Mesh(rbox(1.0, 0.09, 0.07, 0.01), wood); s.position.set(0, y, -0.045); p.add(s); }
  }
  // rubble
  const conc = pmat("#ffffff", { map: tileTex(plasterTex("#8c8781"), 0.5, 0.5), roughness: 0.9 });
  for (let i = 0; i < 16; i++) { const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + r() * 0.1, 0), conc); b.position.set((r() - 0.5) * w, 0.05, 0.2 + (r() - 0.5) * 0.5); b.rotation.set(r() * 3, r() * 3, r() * 3); g.add(b); }
  for (const [x, z, ry] of [[-1.25, 0.15, 0.3], [1.3, 0.25, -0.4]]) { const blk = new THREE.Mesh(rbox(0.4, 0.2, 0.2, 0.02), conc); blk.position.set(x, 0.1, z); blk.rotation.y = ry; g.add(blk); }
  g.add(contactShadow(w + 0.8, 1.6));
  return { group: g, w };
}
// Plastered house front (backdrop piece): a box with a canvas front of windows (lit or dark), a door, a
// steel gate, and a flat roof slab with a parapet and a water tank. Emissive windows: windows(k).
function makeFacHouse({ w = 4, h = 5, d = 6, color = "#c9b79c", seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), floors = Math.max(1, Math.round(h / 2.6));
  const c = makeCanvas(256, Math.round(256 * h / w)), x = c.getContext("2d"), H = c.height;
  const e = makeCanvas(256, H), ex = e.getContext("2d"); ex.fillStyle = "#000"; ex.fillRect(0, 0, 256, H);
  x.fillStyle = color; x.fillRect(0, 0, 256, H); speckle(x, 256, H, seed, 1600, 0.18, 0.06, 2.5);
  x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(0, H - 14, 256, 14);
  const fh = H / floors;
  for (let f = 0; f < floors; f++) {
    const cols = Math.max(1, Math.round(w / 1.8));
    for (let i = 0; i < cols; i++) {
      if (f === floors - 1 && i === 0) continue;   // ground floor: the door and gate
      const wx = (i + 0.5) * 256 / cols - 22, wy = H - (f + 1) * fh + fh * 0.28, lit = r() < 0.7;
      x.fillStyle = "#1a1714"; x.fillRect(wx - 3, wy - 3, 50, fh * 0.42 + 6);
      x.fillStyle = lit ? "#f7c97a" : "#2a2e38"; x.fillRect(wx, wy, 44, fh * 0.42);
      x.fillStyle = "#2a241d"; x.fillRect(wx + 20, wy, 4, fh * 0.42);
      if (lit) { ex.fillStyle = r() < 0.3 ? "#ffd9b0" : "#ffb860"; ex.fillRect(wx, wy, 44, fh * 0.42); }
    }
  }
  x.fillStyle = "#3a3f46"; x.fillRect(18, H - fh * 0.78, 58, fh * 0.78 - 14);
  x.strokeStyle = "#6a7078"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(22 + i * 7, H - fh * 0.76); x.lineTo(22 + i * 7, H - 16); x.stroke(); }
  const em = texFrom(e), front = pmat("#ffffff", { map: texFrom(c), emissive: "#ffffff", emissiveMap: em, emissiveIntensity: 1, roughness: 0.9 });
  const side = pmat(color, { roughness: 0.92, map: tileTex(plasterTex(color), 0.3, 0.3) });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, front, side]); body.position.set(0, h / 2, -d / 2); g.add(body);
  const par = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.35, 0.15), side); par.position.set(0, h + 0.17, -0.05); g.add(par);
  if (r() < 0.7) { const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.8, 20), pmat("#3a6fb0", { roughness: 0.5 })); tank.position.set((r() - 0.5) * w * 0.5, h + 0.4, -d * 0.4); g.add(tank); }
  return { group: g, windows: (k) => { front.emissiveIntensity = k; } };
}
// The street around the hero (backdrop): asphalt with kerbs and sidewalks, rows of houses on the far side
// (facing the camera) and receding on the left and right, lamp posts with sodium lights, power lines, a
// hill of houses' lights far behind and the night sky. API { group, update(t), windows(k), lamps(k) }
function makeFacStreetSet({ seed = 4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), houses = [];
  const road = new THREE.Mesh(new THREE.PlaneGeometry(90, 9), mat("#ffffff", { map: tileTex(asphaltTex(), 45, 4.5), color: "#77787c", roughness: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.002, 0); g.add(road);
  const walk = mat("#ffffff", { map: tileTex(plasterTex("#4a4642"), 30, 2), roughness: 0.9 });
  for (const z of [-5.5, 5.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(90, 0.16, 2), walk); s.position.set(0, 0.08, z); g.add(s); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#2a2622", { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; g.add(ground);
  const cols = ["#7a6c5a", "#66705f", "#857660", "#5f5d6c", "#7d5646", "#8a8170", "#5b6a74"];
  for (let x = -30; x < 30;) { const w = 3 + r() * 2.5, h = 3.2 + Math.floor(r() * 3) * 2.4; const hs = makeFacHouse({ w, h, color: cols[Math.floor(r() * cols.length)], seed: Math.floor(r() * 999) }); hs.group.position.set(x + w / 2, 0, -6.5); g.add(hs.group); houses.push(hs); x += w + 0.15; }
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffb35a", toneMapped: false }), halos = [], pools = [];
  const pole = pmat("#4a4d52", { metalness: 0.5, roughness: 0.5 });
  const poles = [];
  for (const x of [-16, -6.5, 3, 12.5]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 7, 10), pole); p.position.set(x, 3.5, -4.9); g.add(p); poles.push(new V3(x, 6.6, -4.9));
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8), pole); arm.rotation.x = Math.PI / 2; arm.position.set(x, 6.7, -4.2); g.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.5), lampM); head.position.set(x, 6.62, -3.5); g.add(head);
    const halo = sprite(BOKEH, 2.6); halo.material.color.set("#ffb35a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(x, 6.55, -3.45); g.add(halo); halos.push(halo);
    const pool = makeFloorGlow(6, 5, { color: "#ffb35a", opacity: 0.16 }); pool.position.set(x, 0.01, -2.6); g.add(pool); pools.push(pool);
    const sh = makeLightShaft([x, 6.55, -3.5], [x, 0.05, -2.4], { w0: 0.3, w1: 3.2, color: "#ffb35a", opacity: 0.08 }); g.add(sh.group);
  }
  for (let i = 0; i + 1 < poles.length; i++) for (const dy of [0, -0.35]) { const a = poles[i].clone(), b = poles[i + 1].clone(); a.y += dy; b.y += dy; const s = makeString(a, b, { sag: 0.5, color: "#111214", r: 0.012 }); g.add(s.mesh); s.setProgress(1); }
  const hill = makeBokeh({ n: 260, center: [0, 9, -45], spread: [90, 9, 4], size: [0.25, 0.55], colors: ["#ffcf8a", "#ffe6c2", "#fff4e0", "#9fc4ff"], opacity: 0.75, seed: seed + 7 }); g.add(hill.group);
  const hillM = new THREE.Mesh(new THREE.PlaneGeometry(140, 26), mat("#0c0e14", { roughness: 1 })); hillM.position.set(0, 6, -47); g.add(hillM);
  asBackdrop(g);
  let wk = 1, lk = 1;
  const apply = () => { houses.forEach((h) => h.windows(wk)); lampM.color.set("#ffb35a").multiplyScalar(lk); halos.forEach((h) => { h.material.opacity = 0.8 * lk; }); pools.forEach((p) => { p.material.opacity = 0.16 * lk; }); };
  return { group: g, update(t) { hill.update(t); apply(); }, windows(k) { wk = k; apply(); }, lamps(k) { lk = k; apply(); } };
}
function facStreetLook(set, t) {
  floor.visible = false; scene.background = FAC_NIGHT; set.update(t);
  key.intensity = 0.35; key.color.set("#9fb0ff"); hemi.intensity = 0.22; hemi.color.set("#7d90c8"); hemi.groundColor.set("#120c08"); scene.environmentIntensity = 0.25;
  scene.fog.color.set("#0b1022");
}
function buildFacStreet(S) {
  const set = makeFacStreetSet({ seed: 4 }); S.backdrop(set.group);
  const bus = makeCityBus({ color: "#d8d1c2", stripe: ORANGE, dest: "CENTRO" }); bus.group.position.set(0.5, 0, -1.9); bus.group.rotation.y = 0.32; S.add(bus.group);
  bus.group.traverse((n) => { if (n.userData.plate) n.userData.plate.detail = true; });   // the destination sign is texture, not reading
  // burnt: dark scorch patches over the roof and the side
  const scorch = mat("#151210", { roughness: 1, transparent: true, opacity: 0.85 });
  const sc1 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.05), scorch); sc1.rotation.x = -Math.PI / 2; sc1.position.set(-0.4, 1.565, 0); bus.group.add(sc1);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 1.18), new THREE.MeshBasicMaterial({ color: "#ff7a24", toneMapped: false, transparent: true, opacity: 0.55 })); inner.position.set(-0.45, 1.05, 0); inner.userData.decor = true; inner.userData.noShadow = true; bus.group.add(inner);
  const fire = makeFacFire({ w: 2.8, d: 0.9, h: 1.5, n: 26, smoke: 14, seed: 7 }); fire.group.position.set(-0.3, 1.5, 0); bus.group.add(fire.group);
  const fire2 = makeFacFire({ w: 1.2, d: 0.2, h: 0.5, n: 8, smoke: 0, seed: 11 }); fire2.group.position.set(-1.0, 0.95, 0.66); bus.group.add(fire2.group);
  const bar = makeFacBarricade({}); bar.group.position.set(-0.2, 0, 0.9); S.add(bar.group);
  const fire3 = makeFacFire({ w: 0.7, d: 0.4, h: 0.6, n: 9, smoke: 5, seed: 13 }); fire3.group.position.set(0.75, 0.7, 1.0); S.add(fire3.group);
  S.solid(bus.group, "ônibus"); S.solid(bar.group, "barricada");
  return { set, bus, bar, fires: [fire, fire2, fire3] };
}
addScene("rua", A.c3, A.c4, (S) => {
  const R = buildFacStreet(S);
  const anim = (t) => {
    facStreetLook(R.set, t);
    const k = sm(t, A.barricada - 0.6, A.onibus + 0.3);   // the fire takes as the narration gets to it
    R.fires.forEach((f, i) => f.update(t, i === 2 ? sm(t, A.barricada - 0.3, A.barricada + 0.3) : 0.35 + 0.65 * k));
    fill.position.set(0.3, 2.2, 1.5); fill.color.set("#ff7a2a"); fill.intensity = 1.2 + 2.2 * k * (0.85 + 0.15 * Math.sin(t * 11));
  };
  const B2 = A.barricada - 0.15, B3 = A.onibus - 0.05;
  S.hero(R.bus.group, "ônibus pegando fogo", { when: (t) => t < B2 - 0.4 || t > B3 + 0.45 });
  S.hero(R.bar.group, "barricada de pneus", { when: (t) => t < B3 - 0.3 });
  const bAll = envelope([R.bus.group, R.bar.group], anim, A.c3, A.c4), bBar = envelope([R.bar.group], anim, B2, B3), bBus = envelope([R.bus.group], anim, B3, A.c4);
  return (t) => { anim(t); facFar(facTrack(t, [[A.c3, bAll, "drop", { from: [0.15, 0.36, 1], rise: 0.32, pull: 1.0 }], [B2, bBar, "push", { from: [-0.1, 0.32, 1], pull0: 1.2, pull: 1.0 }], [B3, bBus, "truck", { from: [0.2, 0.3, 1], side: 0.3, pull: 1.02 }]], A.c4, 0.5)); };
});
addScene("terror", A.c4, A.c5, (S) => {
  const R = buildFacStreet(S);
  const anim = (t) => {
    facStreetLook(R.set, t);
    const off = sm(t, A.terrorismo - 0.1, A.terrorismo + 0.5);
    R.set.windows(1 - 0.85 * off); R.set.lamps(1 - 0.5 * off + 0.5 * beat(t, A.porque, 0.4));
    R.fires.forEach((f) => f.update(t, 1));
    fill.position.set(0.3, 2.2, 1.5); fill.color.set("#ff7a2a"); fill.intensity = 3.2 * (0.85 + 0.15 * Math.sin(t * 11));
  };
  S.hero(R.bus.group, "ônibus pegando fogo"); S.hero(R.bar.group, "barricada de pneus");
  const box = envelope([R.bus.group, R.bar.group], anim, A.c4, A.c5);
  return (t) => { anim(t); facFar(facTrack(t, [[A.c4, box, "orbit", { from: [-0.2, 0.22, 1], deg: 36, pull: 1.0 }], [A.porque - 0.2, box, "push", { from: [0.15, 0.3, 1], pull0: 1.12, pull: 1.0 }]], A.c5, 0.5)); };
});

// ============================================================ 6–9 · a porta de duas fechaduras
// The vault room; the round steel door carries two brass lock plates: ATO (left) and MOTIVO (right), each
// with a keyhole and an LED ring. The ATO key goes in and turns (green). MOTIVO waits for "preconceito ou
// xenofobia". The faction's gold key, LUCRO, tries MOTIVO and does not fit: red, a jolt, the beacon.
// Lock plate (brass, on the door's face): printed label on top, keyhole, LED ring. Origin: back centre;
// faces +z. API { group, led(color, k), hole: local V3 (front of the keyhole) }
function makeFacLock(label, { w = 0.5, h = 0.72 } = {}) {
  const g = new THREE.Group(), brass = pmat("#b8893c", { metalness: 1, roughness: 0.28 }), T = 0.04;
  const plate = new THREE.Mesh(rbox(w, h, T, 0.03), brass); plate.position.z = T / 2; g.add(plate);
  const lab = makePlate(label, w * 0.92, 0.23, { bg: "#141414", fg: "#f4f1ea", depth: 0.012 }); lab.position.set(0, h * 0.3, T + 0.006); g.add(lab);
  const holeY = -h * 0.12, black = pmat("#050505", { roughness: 0.9 });
  const hc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 24), black); hc.rotation.x = Math.PI / 2; hc.position.set(-0.03, holeY, T + 0.002); g.add(hc);
  const hs = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.012), black); hs.position.set(0.02, holeY, T + 0.002); g.add(hs);
  const ledM = new THREE.MeshBasicMaterial({ color: "#3a3a3a", toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.013, 10, 40), ledM); ring.position.set(0, holeY, T + 0.008); g.add(ring);
  const glow = sprite(BOKEH, 0.55); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = 0; glow.position.set(0, holeY, T + 0.03); glow.userData.decor = true; g.add(glow);
  return { group: g, hole: new V3(0, holeY, T), led: (color, k) => { ledM.color.set("#3a3a3a").lerp(new THREE.Color(color), clamp(k)); glow.material.color.set(color); glow.material.opacity = 0.75 * clamp(k); } };
}
// Big key with a tag: the blade lies along -z (the tip at the origin, it goes into a keyhole), the bow (a
// ring) at the back; a printed tag hangs from the bow by a small ring and always faces +z. turn(a) turns
// the key about its blade (the tag keeps hanging). Origin: blade tip. API { group, turn(a), tag }
function makeFacKey(label, { gold = false, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const m = gold ? pmat(GOLD_METAL, { metalness: 1, roughness: 0.22 }) : pmat("#c9ccd1", { metalness: 1, roughness: 0.25 });
  const L = 0.34 * s;
  const blade = new THREE.Mesh(rbox(0.02 * s, 0.05 * s, L, 0.006 * s), m); blade.position.z = L / 2; body.add(blade);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(rbox(0.02 * s, 0.035 * s, 0.035 * s, 0.004 * s), m); b.position.set(0, -0.04 * s, (0.04 + i * 0.06) * s); b.scale.y = 0.6 + 0.4 * ((i * 7) % 3) / 2; body.add(b); }
  const shoulder = new THREE.Mesh(rbox(0.024 * s, 0.09 * s, 0.03 * s, 0.006 * s), m); shoulder.position.z = L + 0.005 * s; body.add(shoulder);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.1 * s, 0.03 * s, 14, 40), m); bow.rotation.y = Math.PI / 2; bow.position.z = L + 0.12 * s; body.add(bow);
  const tagG = new THREE.Group(); tagG.position.z = L + 0.12 * s; g.add(tagG);
  const ringT = new THREE.Mesh(new THREE.TorusGeometry(0.03 * s, 0.006 * s, 8, 20), pmat("#c9ccd1", { metalness: 1, roughness: 0.3 })); ringT.position.set(0, -0.12 * s, 0.05 * s); tagG.add(ringT);
  const tag = makePlate(label, 0.44 * s, 0.17 * s, { bg: gold ? "#141414" : "#f4f1ea", fg: gold ? "#f5c84a" : "#141414", depth: 0.01 }); tag.position.set(0, -0.24 * s, 0.05 * s); tagG.add(tag);
  return { group: g, tag, turn: (a) => { body.rotation.z = a; tagG.rotation.z = 0; } };
}
function buildFacVault(S, seed = 6) {
  const room = makeVaultRoom({ wallZ: -0.3, seed }); S.backdrop(room.group);
  const door = makeVaultDoor({ r: 1.0 }); S.add(door.group);
  door.group.traverse((n) => { if (n.isMesh && n.material && n.material.metalness > 0.5 && !n.material.userData.facDim) { n.material = n.material.clone(); n.material.color.multiplyScalar(0.55); n.material.userData.facDim = true; } });
  const dg = door.pivot.children[0];
  const LA = makeFacLock("ATO"), LM = makeFacLock("MOTIVO");
  LA.group.position.set(-0.69, -0.06, 0.054); LM.group.position.set(0.69, -0.06, 0.054); dg.add(LA.group, LM.group);
  // invisible box over both locks and the hub: what the wide shots frame (the round door runs a little past it)
  const pair = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.95, 0.1), new THREE.MeshBasicMaterial({ visible: false })); pair.position.set(0, -0.08, 0.1); dg.add(pair);
  // world position of each keyhole (door closed): dg origin = (0, cy, 0.08)
  const holeW = (L) => new V3(L.group.position.x, door.cy + L.group.position.y + L.hole.y, 0.08 + L.group.position.z + L.hole.z);
  const kA = makeFacKey("ATO"), kL = makeFacKey("LUCRO", { gold: true });
  S.add(kA.group, kL.group);
  return { room, door, LA, LM, kA, kL, pair, hA: holeW(LA), hM: holeW(LM) };
}
function facVaultLook(V, t) {
  floor.visible = false; V.room.update(t);
  key.intensity = 1.6; key.color.set("#ffe6cc"); hemi.intensity = 0.42; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#141216");
  scene.fog.color.set("#0a0e16"); scene.environmentIntensity = 0.45;
}
// key pose: d = how far out of the keyhole (0 = fully in: the tip 0.2 inside), side offset (approach path)
function facKeyAt(k, hole, d, { x = 0, y = 0, a = 0, show = true } = {}) { k.group.visible = show; k.group.position.set(hole.x + x, hole.y + y, hole.z - 0.2 + d); k.turn(a); }
addScene("porta", A.c5, A.c6, (S) => {
  const V = buildFacVault(S, 6);
  const anim = (t) => {
    facVaultLook(V, t); V.room.beacon(0); V.door.open(0); V.door.spin(0.15 * Math.sin(t * 0.6));
    V.kA.group.visible = false; V.kL.group.visible = false;
    V.LA.led("#ffb347", 0.6 * beat(t, A.fechaduras, 0.5) + 0.6 * beat(t, A.chaves - 0.3, 0.5));
    V.LM.led("#ffb347", 0.6 * beat(t, A.fechaduras + 0.25, 0.5) + 0.6 * beat(t, A.chaves - 0.05, 0.5));
    V.door.glow(0.1);
    fill.position.set(0, 1.6, 2.4); fill.color.set("#ffd9a8"); fill.intensity = 1.0;
  };
  S.hero(V.LA.group, "fechadura ato"); S.hero(V.LM.group, "fechadura motivo");
  const box = envelope([V.pair], anim, A.c5, A.c6);
  return (t) => { anim(t); CAM.apply(facTrack(t, [[A.c5, box, "push", { from: [0.25, 0.12, 1], pull0: 1.3, pull: 1.02 }], [A.abre - 0.3, box, "orbit", { from: [0.1, 0.1, 1], deg: 22, pull: 1.0 }]], A.c6, 0.5)); };
});
addScene("ato", A.c6, A.c7, (S) => {
  const V = buildFacVault(S, 6);
  const IN = A.ato - 0.25, TURN = A.bomba;
  const anim = (t) => {
    facVaultLook(V, t); V.room.beacon(0); V.door.open(0); V.door.glow(0.1); V.kL.group.visible = false;
    const d = 0.9 * (1 - eOut(lin(t, A.c6 + 0.1, IN))) + 0.2 * (1 - sm(t, IN, IN + 0.3));
    facKeyAt(V.kA, V.hA, d, { x: 0.3 * (1 - eOut(lin(t, A.c6 + 0.1, IN))), y: 0.25 * (1 - eOut(lin(t, A.c6 + 0.1, IN))), a: Math.PI / 2 * (1 - sm(t, TURN, TURN + 0.35)) });
    V.LA.led(GREEN, sm(t, TURN + 0.3, TURN + 0.45)); V.LM.led("#ffb347", 0);
    fill.position.set(-0.7, 1.6, 1.8); fill.color.set(t > TURN + 0.3 ? "#5dff96" : "#ffd9a8"); fill.intensity = 1.0 + 1.4 * beat(t, TURN + 0.3, 0.6);
  };
  // the close frame: the ATO lock and the key's whole path (approach, in, turn)
  const tmp = new THREE.Group(); S.add(tmp);
  const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.02), new THREE.MeshBasicMaterial({ visible: false })); anchor.position.set(V.hA.x, V.hA.y + 0.12, V.hA.z); tmp.add(anchor);
  S.hero(V.LA.group, "fechadura ato"); S.hero(V.kA.group, "chave ato", { when: (t) => t > IN - 0.2 });
  const box = envelope([anchor, V.kA.group], anim, A.c6 + 0.6, A.c7);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c6, A.c7), { zone: "stage", from: [0.45, 0.15, 1], pull0: 1.22, pull: 1.0 }); p = CAM.shake(p, t, TURN + 0.3, 0.012, 0.3); CAM.apply(p); };
});
addScene("motivo", A.c7, A.c8, (S) => {
  const V = buildFacVault(S, 6);
  const anim = (t) => {
    facVaultLook(V, t); V.room.beacon(0); V.door.open(0); V.door.glow(0.1); V.kL.group.visible = false;
    facKeyAt(V.kA, V.hA, 0, { a: 0 }); V.LA.led(GREEN, 1);
    V.LM.led("#ffb347", 0.35 + 0.5 * (0.5 + 0.5 * Math.sin((t - A.c7) * 5)) * sm(t, A.motivo - 0.3, A.motivo));
    fill.position.set(0.7, 1.6, 1.8); fill.color.set("#ffc46a"); fill.intensity = 1.0 + 0.6 * beat(t, A.motivo, 0.6);
  };
  const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.02), new THREE.MeshBasicMaterial({ visible: false })); anchor.position.set(V.hM.x, V.hM.y + 0.12, V.hM.z); S.add(anchor);
  const T2 = A.preconceito - 0.1, T3 = A.estrangeiro - 1.0;
  S.hero(V.LA.group, "fechadura ato com a chave", { when: (t) => t < T2 - 0.4 });
  S.hero(V.LM.group, "fechadura motivo");
  const bDoor = envelope([V.pair, V.kA.group], anim, A.c7, T2), bLock = envelope([anchor, V.LM.group], anim, T2, A.c8);
  return (t) => { anim(t); CAM.apply(facTrack(t, [[A.c7, bDoor, "truck", { from: [-0.1, 0.12, 1], side: 0.35, pull: 1.02 }], [T2, bLock, "push", { from: [-0.35, 0.12, 1], pull0: 1.3, pull: 1.04 }], [T3, bLock, "orbit", { from: [-0.2, 0.15, 1], deg: 24, pull: 1.04 }]], A.c8, 0.55)); };
});
addScene("lucro", A.c8, A.c9, (S) => {
  const V = buildFacVault(S, 6);
  const GO = A.segunda - 0.1, TRY = A.lucro - 0.35, HIT = A.lucro - 0.02;
  const anim = (t) => {
    facVaultLook(V, t); V.door.open(0); V.door.glow(0.1);
    facKeyAt(V.kA, V.hA, 0, { a: 0 }); V.LA.led(GREEN, 1);
    // the gold key comes in from the right, tries the MOTIVO keyhole, stops at the plate and bounces back
    const app = eOut(lin(t, GO, TRY)), bounce = Math.sin(clamp((t - HIT) / 0.45) * Math.PI) * (t > HIT ? 1 : 0), stopD = 0.33;
    const d = t < HIT ? lerp(0.95, stopD, app) : stopD + 0.12 * bounce + 0.06 * sm(t, HIT + 0.45, HIT + 0.7);
    facKeyAt(V.kL, V.hM, d, { show: t > GO, x: 0.45 * (1 - app) + (t > HIT ? 0.03 * Math.sin((t - HIT) * 40) * (1 - lin(t, HIT, HIT + 0.4)) : 0), y: 0.18 * (1 - app), a: Math.PI / 2 + 0.5 + 0.18 * Math.sin((t - HIT) * 30) * (t > HIT ? 1 - lin(t, HIT, HIT + 0.5) : 0) });
    const red = t > HIT;
    V.LM.led(red ? RED : "#ffb347", red ? 1 : 0.4); V.room.beacon(sm(t, HIT, HIT + 0.2));
    fill.position.set(0.7, 1.6, 1.8); fill.color.set(red ? "#ff3a2a" : "#ffd9a8"); fill.intensity = 1.0 + 2.2 * beat(t, HIT, 0.6);
  };
  const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.02), new THREE.MeshBasicMaterial({ visible: false })); anchor.position.set(V.hM.x, V.hM.y + 0.12, V.hM.z); S.add(anchor);
  S.hero(V.LA.group, "fechadura ato com a chave", { when: (t) => t < GO - 0.4 }); S.hero(V.kA.group, "chave ato", { when: (t) => t < GO - 0.4 });
  S.hero(V.LM.group, "fechadura motivo"); S.hero(V.kL.group, "chave dourada lucro", { when: (t) => t > TRY - 0.3 });
  const bDoor = envelope([V.pair, V.kA.group], anim, A.c8, GO), bTry = envelope([anchor, V.kL.group], anim, TRY - 0.4, A.c9);
  return (t) => { anim(t); let p = facTrack(t, [[A.c8, bDoor, "reveal", { from: [0.15, 0.15, 1], pull0: 1.18, pull: 1.0 }], [GO, bTry, "push", { from: [0.55, 0.2, 1], pull0: 1.18, pull: 1.0 }]], A.c9, 0.55); p = CAM.shake(p, t, HIT, 0.02, 0.4); CAM.apply(p); };
});

// ============================================================ 10 · recado × negócio
// A gallery hall at night (glass wall with the city): two black plinths, RECADO with a loudspeaker
// megaphone that sends out rings on "recado", NEGÓCIO with a leather briefcase full of cash that opens on
// "negócio". Push on the megaphone, truck to the briefcase.
// Megaphone (loud-hailer): white plastic horn with a red band, the black driver at the back, a pistol grip
// with a trigger underneath. Mouth towards +x. Origin: bottom of the grip. API { group, mouth: local V3 }
function makeFacMegaphone({ s = 1 } = {}) {
  const g = new THREE.Group(), white = pmat("#eeeae2", { roughness: 0.35, clearcoat: 0.5 }), black = pmat("#1a1a1c", { roughness: 0.5 }), redM = pmat(RED, { roughness: 0.4, clearcoat: 0.4 });
  const prof = [[0.07, 0], [0.09, 0.08], [0.13, 0.2], [0.2, 0.32], [0.27, 0.4], [0.265, 0.41], [0.19, 0.33], [0.12, 0.21], [0.08, 0.09], [0.06, 0.01]].map(([a, b]) => new THREE.Vector2(a * s, b * s));
  const horn = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), white); horn.rotation.z = -Math.PI / 2; horn.position.set(0.05 * s, 0.3 * s, 0); g.add(horn);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.27 * s, 0.018 * s, 10, 48), redM); band.rotation.y = Math.PI / 2; band.position.set(0.455 * s, 0.3 * s, 0); g.add(band);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(0.24 * s, 40), black); inner.rotation.y = Math.PI / 2; inner.position.set(0.3 * s, 0.3 * s, 0); g.add(inner);
  const drv = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.12 * s, 0.22 * s, 32), black); drv.rotation.z = Math.PI / 2; drv.position.set(-0.07 * s, 0.3 * s, 0); g.add(drv);
  const grip = new THREE.Mesh(rbox(0.07 * s, 0.24 * s, 0.07 * s, 0.025 * s), black); grip.position.set(0.02 * s, 0.12 * s, 0); grip.rotation.z = 0.15; g.add(grip);
  const trig = new THREE.Mesh(rbox(0.03 * s, 0.07 * s, 0.03 * s, 0.01 * s), redM); trig.position.set(0.07 * s, 0.17 * s, 0); g.add(trig);
  g.add(contactShadow(0.7 * s, 0.5 * s));
  return { group: g, mouth: new V3(0.46 * s, 0.3 * s, 0) };
}
// Open leather briefcase full of cash: black case with brass latches, a lid hinged at the back (open(k)),
// rows of banknote bundles. Origin: bottom centre; faces +z. API { group, open(k) }
function makeFacBriefcase({ w = 0.7, d = 0.46, h = 0.14 } = {}) {
  const g = new THREE.Group(), leather = pmat("#1c1714", { roughness: 0.45, clearcoat: 0.6, map: noiseTex({ base: "#1c1714", amount: 0.1, size: 1.2, seed: 5 }) }), lining = pmat("#5a1a1a", { roughness: 0.9 }), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.3 });
  const base = new THREE.Mesh(rbox(w, 0.02, d, 0.01), leather); base.position.y = 0.01; g.add(base);
  for (const [bw, bd, x, z] of [[w, 0.02, 0, d / 2 - 0.01], [w, 0.02, 0, -d / 2 + 0.01], [0.02, d, w / 2 - 0.01, 0], [0.02, d, -w / 2 + 0.01, 0]]) { const p = new THREE.Mesh(rbox(bw, h, bd, 0.006), leather); p.position.set(x, h / 2, z); g.add(p); }
  for (const s of [-1, 1]) { const l = new THREE.Mesh(rbox(0.06, 0.04, 0.012, 0.004), brass); l.position.set(s * w * 0.3, h - 0.03, d / 2 + 0.006); g.add(l); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const b = makeCashBundle({ w: 0.15, d: 0.13, h: 0.09 }); b.position.set(-w / 2 + 0.1 + i * 0.165, 0.02 + (j % 2) * 0.0, -d / 2 + 0.09 + j * 0.14); b.rotation.y = Math.PI / 2; g.add(b); }
  const lidP = new THREE.Group(); lidP.position.set(0, h, -d / 2); g.add(lidP);
  const lid = new THREE.Mesh(rbox(w, 0.05, d, 0.02), leather); lid.position.set(0, 0.025, d / 2); lidP.add(lid);
  const lin_ = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, d - 0.06), lining); lin_.rotation.x = Math.PI / 2; lin_.position.set(0, -0.001, d / 2); lidP.add(lin_);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 20, Math.PI), leather); handle.position.set(0, 0.05, d + 0.0); handle.rotation.x = -Math.PI / 2; lidP.add(handle);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, open: (k) => { lidP.rotation.x = -1.95 * clamp(k); } };
}
addScene("recado", A.c9, A.c10, (S) => {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 9 }); S.backdrop(hall.group);
  const PH = 0.8, XL = -0.85, XR = 0.85;
  const pL = makeLabelPlinth("RECADO", { w: 1.3, h: PH, d: 0.9, plateH: 0.3 }); pL.group.position.x = XL; S.add(pL.group);
  const pR = makeLabelPlinth("NEGÓCIO", { w: 1.3, h: PH, d: 0.9, plateH: 0.3, bg: "#1f6b40" }); pR.group.position.x = XR; S.add(pR.group);
  const mg = makeFacMegaphone({ s: 2.0 }); mg.group.position.set(XL - 0.38, PH, 0.05); mg.group.rotation.y = -0.45; S.add(mg.group);
  const rings = makeAlarmRings(3, ORANGE, 0.5); rings.forEach((r) => { r.userData.decor = true; r.rotation.set(0, Math.PI / 2 - 0.45, 0); S.add(r); });
  const bc = makeFacBriefcase({}); bc.group.scale.setScalar(1.5); bc.group.position.set(XR, PH, 0.05); bc.group.rotation.y = -0.15; S.add(bc.group);
  const mouthW = mg.mouth.clone().applyAxisAngle(new V3(0, 1, 0), -0.45).add(mg.group.position);
  const anim = (t) => {
    floor.visible = false; hall.update(t);
    key.intensity = 2.0; key.color.set("#ffe6cc"); hemi.intensity = 0.5; hemi.color.set("#cfe0ff"); scene.fog.color.set("#0a0e16");
    rings.forEach((r, i) => { const q = ((t - A.medo) * 1.4 + i / 3) % 1, on = t > A.medo - 0.1 && t < A.faccao + 0.2; r.visible = on; r.position.set(mouthW.x + (0.08 + q * 0.6) * Math.cos(0.45), mouthW.y, mouthW.z + (0.08 + q * 0.6) * Math.sin(0.45)); r.scale.setScalar(Math.max(0.001, 0.4 + q * 1.4)); r.material.opacity = 0.8 * (1 - q); });
    bc.open(sm(t, A.negocio - 0.55, A.negocio + 0.1));
    fill.position.set(t < A.faccao ? XL : XR, PH + 1.2, 1.3); fill.color.set(t < A.faccao ? "#ffb070" : "#7dffb0"); fill.intensity = 1.2 + 1.4 * beat(t, A.recado, 0.6) + 1.4 * beat(t, A.negocio, 0.6);
  };
  const T2 = A.faccao - 0.15;
  S.hero(pL.group, "pedestal recado", { when: (t) => t < T2 - 0.4 }); S.hero(mg.group, "megafone", { when: (t) => t < T2 - 0.4 });
  S.hero(pR.group, "pedestal negócio", { when: (t) => t > T2 + 0.45 }); S.hero(bc.group, "maleta de dinheiro", { when: (t) => t > T2 + 0.45 });
  S.solid(mg.group, "megafone", { restsOn: ["pedestal recado"] }); S.solid(pL.group, "pedestal recado"); S.solid(bc.group, "maleta", { restsOn: ["pedestal negócio"] }); S.solid(pR.group, "pedestal negócio");
  const bL = envelope([pL.group, mg.group], anim, A.c9, T2), bR = envelope([pR.group, bc.group], anim, T2, A.c10);
  return (t) => { anim(t); CAM.apply(facTrack(t, [[A.c9, bL, "push", { from: [0.25, 0.3, 1], pull0: 1.14, pull: 1.0 }], [T2, bR, "truck", { from: [-0.1, 0.42, 1], side: 0.3, pull: 1.04 }]], A.c10, 0.55)); };
});

// ============================================================ 11 · Gakiya (cartão de foto)
// The courtroom behind the photo card: backdrop only (the card is the subject); the camera drifts.
function facCourtLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 2.0; key.color.set("#ffe2c0"); hemi.intensity = 0.5; hemi.color.set("#ffe8cc"); hemi.groundColor.set("#1a120c"); scene.fog.color.set("#140e0a");
}
addScene("gakiya", A.c10, A.c11, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, seed: 5 }); S.backdrop(court.group);
  const box = new THREE.Box3(new V3(-2.2, 0.4, -3.2), new V3(2.2, 2.6, -1.8));
  return (t) => { facCourtLook(court, t); CAM.apply(CAM.move(box, "push", lin(t, A.c10, A.c11), { zone: "stage", from: [0.1, 0.25, 1], pull0: 1.3, pull: 1.05 })); };
});

// ============================================================ 12 + 13 · facção pega mais que terrorismo
// The courtroom: a scale of justice with an hourglass in each pan, TERRORISMO and FACÇÃO on the pans; on
// "pune" FACÇÃO goes down (the heavier sentence). Then two columns of years on plinths: TERRORISMO rises to
// 30 on "trinta", FACÇÃO climbs past the red line at 30 and stops at 40 on "quarenta".
addScene("estranho", A.c11, A.c12, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, seed: 5 }); S.backdrop(court.group);
  const PH = 0.55, pl = makeLabelPlinth(null, { w: 2.9, h: PH, d: 1.2 }); pl.group.position.z = -0.3; S.add(pl.group);
  const sc = makeJusticeScale({ arm: 1.05, height: 1.75, panR: 0.4, chain: 0.75 }); sc.group.position.set(0, PH, -0.3); S.add(sc.group);
  const hgA = makeHourglass({ h: 0.34 }), hgB = makeHourglass({ h: 0.46 }); sc.holders[0].add(hgA.group); sc.holders[1].add(hgB.group);
  const tA = makePlate("TERRORISMO", 1.0, 0.26, { bg: "#141414", fg: "#ffffff" }), tB = makePlate("FACÇÃO", 1.0, 0.26, { bg: RED, fg: "#ffffff" });
  tA.position.z = 0.02; tB.position.z = 0.02; sc.fronts[0].add(tA); sc.fronts[1].add(tB);
  const anim = (t) => {
    facCourtLook(court, t);
    const k = sm(t, A.estranho + 0.75, A.estranho + 1.35);
    sc.setTilt(-0.2 * k + 0.02 * Math.sin(t * 2.2) * (1 - k) + 0.015 * Math.sin((t - A.pune) * 9) * (t > A.pune ? 1 - lin(t, A.pune, A.pune + 1) : 0));
    hgA.set(lin(t, A.c11, A.c12) * 0.4); hgB.set(lin(t, A.c11, A.c12) * 0.4);
    fill.position.set(0.8, 2.4, 1.6); fill.color.set(t > A.pune ? "#ff6a4a" : "#ffd9a8"); fill.intensity = 1.0 + 1.6 * beat(t, A.pune, 0.6);
  };
  S.hero(sc.group, "balança da justiça"); S.solid(pl.group, "pedestal"); S.solid(sc.group, "balança", { restsOn: ["pedestal"] });
  const box = envelope([sc.group], anim, A.c11, A.c12), T2 = A.estranho + 0.6;
  return (t) => { anim(t); let p = facTrack(t, [[A.c11, box, "drop", { from: [0.15, 0.22, 1], rise: 0.3, pull: 1.0 }], [T2, box, "push", { from: [-0.1, 0.18, 1], pull0: 1.15, pull: 1.0 }]], A.c12, 0.5); p = CAM.shake(p, t, A.estranho + 1.3, 0.014, 0.3); CAM.apply(p); };
});
addScene("pena", A.c12, A.c13, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, seed: 5 }); S.backdrop(court.group);
  const PH = 0.45, X = [-0.72, 0.72], U = 0.052;
  const pT = makeLabelPlinth("TERRORISMO", { w: 1.25, h: PH, d: 1.0, plateH: 0.26 }); pT.group.position.x = X[0]; S.add(pT.group);
  const pF = makeLabelPlinth("FACÇÃO", { w: 1.25, h: PH, d: 1.0, plateH: 0.26, bg: RED }); pF.group.position.x = X[1]; S.add(pF.group);
  const cT = makeHourColumn({ hours: 1, unit: U, w: 0.72, color: "#8b919b" }), cF = makeHourColumn({ hours: 1, unit: U, w: 0.72, color: ORANGE });
  cT.group.position.set(X[0], PH, 0); cF.group.position.set(X[1], PH, 0); S.add(cT.group, cF.group);
  const anim = (t) => {
    facCourtLook(court, t);
    const vT = 30 * eOut(lin(t, A.c12 + 0.15, A.trinta)), vF = 40 * sm(t, A.faccao2 - 0.1, A.quarenta - 0.2);
    cT.setHours(Math.max(1, vT), "30"); cF.setHours(Math.max(1, vF), "40");
    fill.position.set(t < A.faccao2 ? X[0] : X[1], 2.6, 1.8); fill.color.set(t > A.quarenta ? "#ff6a2a" : "#ffd9a8"); fill.intensity = 1.0 + 1.6 * beat(t, A.trinta, 0.5) + 2.0 * beat(t, A.quarenta, 0.6);
  };
  const T2 = A.faccao2 - 0.2;
  S.hero(pT.group, "pedestal terrorismo"); S.hero(cT.group, "coluna 30 anos");
  S.hero(pF.group, "pedestal facção", { when: (t) => t > T2 + 0.45 }); S.hero(cF.group, "coluna 40 anos", { when: (t) => t > T2 + 0.45 });
  const bT = envelope([pT.group, cT.group], anim, A.trinta, T2), bAll = envelope([pT.group, cT.group, pF.group, cF.group], anim, T2, A.c13);
  return (t) => { anim(t); let p = facTrack(t, [[A.c12, bT, "crane", { from: [0.2, 0.2, 1], rise: 0.3, pull: 1.04 }], [T2, bAll, "reveal", { from: [-0.1, 0.25, 1], pull0: 1.12, pull: 1.0 }]], A.c13, 0.55); p = CAM.shake(p, t, A.quarenta, 0.014, 0.35); CAM.apply(p); };
});

// ============================================================ 14–16 · o rótulo e o dinheiro
// A warehouse at night: a pallet stacked with cash bundles, shrink-wrapped, with a red TERRORISTA tag tied
// to it. "Dinheiro": a spotlight. "Congela": two chains wrap the stack and a padlock snaps shut, the cash
// frosts over in blue. "Quem ajuda": a cardboard box AJUDA next to it gets a red CRIME stamp. "Asfixia":
// the chains pull tight and the stack squeezes.
// Cash pallet: a wooden pallet with a block of banknote bundles (instanced), a translucent wrap, a red tag
// on a string tied at the top corner. Origin: floor centre; faces +z.
// API { group, top, frost(k), squeeze(k), tag (swinging group), chains: [{ set(k) }] }
function makeFacCashPallet({ w = 1.3, d = 0.9, rows = 16, seed = 7 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#8a6a44"), roughness: 0.8 }), r = mulberry32(seed);
  const pal = new THREE.Group(); g.add(pal);
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(rbox(w, 0.025, 0.14, 0.006), wood); s.position.set(0, 0.135, -d / 2 + 0.07 + i * (d - 0.14) / 4); pal.add(s); }
  for (const x of [-w / 2 + 0.06, 0, w / 2 - 0.06]) { const b = new THREE.Mesh(rbox(0.12, 0.1, d, 0.01), wood); b.position.set(x, 0.07, 0); pal.add(b); }
  const BW = 0.17, BD = 0.08, BH = 0.036, nx = Math.floor((w - 0.04) / BW), nz = Math.floor((d - 0.04) / BD), n = nx * nz * rows;
  const stackG = new THREE.Group(); stackG.position.y = 0.15; g.add(stackG);
  const side = pmat("#ffffff", { map: NOTE_EDGE, roughness: 0.85 }), face = pmat("#ffffff", { map: NOTE100, roughness: 0.75 });
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(BW - 0.004, BH, BD - 0.004), [side, side, face, side, side, side], n), o = new THREE.Object3D(); let k = 0;
  for (let y = 0; y < rows; y++) for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { o.position.set(-nx * BW / 2 + BW / 2 + i * BW + (r() - 0.5) * 0.004, BH / 2 + y * BH, -nz * BD / 2 + BD / 2 + j * BD); o.rotation.y = (r() - 0.5) * 0.02; o.updateMatrix(); im.setMatrixAt(k++, o.matrix); }
  stackG.add(im);
  const bands = pmat("#c99a4a", { roughness: 0.6 });
  for (let i = 0; i < nx; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, rows * BH + 0.002, nz * BD + 0.002), bands); b.position.set(-nx * BW / 2 + BW / 2 + i * BW, rows * BH / 2, 0); stackG.add(b); }
  const SH = rows * BH, SW = nx * BW, SD = nz * BD;
  const wrap = new THREE.Mesh(rbox(SW + 0.02, SH + 0.02, SD + 0.02, 0.02), new THREE.MeshPhysicalMaterial({ color: "#dfeef7", roughness: 0.15, transparent: true, opacity: 0.12, clearcoat: 1 })); wrap.position.y = SH / 2; wrap.userData.noShadow = true; stackG.add(wrap);
  const frostM = new THREE.MeshBasicMaterial({ color: "#bfe6ff", transparent: true, opacity: 0, depthWrite: false });
  const frostB = new THREE.Mesh(new THREE.BoxGeometry(SW + 0.03, SH + 0.03, SD + 0.03), frostM); frostB.position.y = SH / 2; frostB.userData.noShadow = true; frostB.userData.decor = true; stackG.add(frostB);
  // chains: two horizontal loops around the stack, links drawn in order (set(k) shows the first k of them)
  const steel = pmat("#b9bdc3", { metalness: 1, roughness: 0.3 }), chains = [];
  for (const yy of [SH * 0.3, SH * 0.72]) {
    const links = [], per = Math.round(2 * (SW + SD) / 0.07), cg = new THREE.Group(); stackG.add(cg);
    for (let i = 0; i < per; i++) {
      const u = i / per * 2 * (SW + SD); let x, z, ry;
      if (u < SW) { x = -SW / 2 + u; z = SD / 2 + 0.025; ry = 0; } else if (u < SW + SD) { x = SW / 2 + 0.025; z = SD / 2 - (u - SW); ry = Math.PI / 2; } else if (u < 2 * SW + SD) { x = SW / 2 - (u - SW - SD); z = -SD / 2 - 0.025; ry = 0; } else { x = -SW / 2 - 0.025; z = -SD / 2 + (u - 2 * SW - SD); ry = Math.PI / 2; }
      const l = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 16), steel); l.scale.set(1.3, 0.8, 1); l.position.set(x, yy, z); l.rotation.set(i % 2 ? Math.PI / 2 : 0, ry, 0); cg.add(l); links.push(l);
    }
    // front links first, from the centre outwards
    const order = links.map((l, i) => i).sort((a, b) => Math.abs(links[a].position.z - SD / 2) + Math.abs(links[a].position.x) * 0.4 - (Math.abs(links[b].position.z - SD / 2) + Math.abs(links[b].position.x) * 0.4));
    chains.push({ set: (k) => order.forEach((idx, i) => { links[idx].visible = i < k * links.length; }), group: cg });
  }
  // the tag: a red card on a string tied to the wrap's top front corner, swinging
  const tagP = new THREE.Group(); tagP.position.set(-SW / 2 + 0.08, SH + 0.01, SD / 2 + 0.03); stackG.add(tagP);
  const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.1, 6), pmat("#d9d0c3", { roughness: 0.9 })); str.position.y = -0.05; tagP.add(str);
  const card = new THREE.Mesh(rbox(0.86, 0.3, 0.01, 0.025), pmat(RED, { roughness: 0.6 })); card.position.set(0.36, -0.24, 0.01); tagP.add(card);
  const tp = makePlate("TERRORISTA", 0.78, 0.24, { bg: RED, fg: "#ffffff", depth: 0.004 }); tp.position.set(0.38, -0.24, 0.018); tagP.add(tp);
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 8, 16), steel); eye.position.set(-0.03, -0.11, 0.016); tagP.add(eye);
  g.add(contactShadow(w + 0.5, d + 0.5));
  return {
    group: g, stack: stackG, top: 0.15 + SH, SW, SD, SH, tag: tagP, chains,
    frost: (k) => { frostM.opacity = 0.42 * clamp(k); },
    squeeze: (k) => { stackG.scale.set(1 - 0.08 * k, 1 + 0.04 * k, 1 - 0.1 * k); },
  };
}
// Cardboard box on the floor with a printed label; a red stamp mark appears on its front (mark(k)).
function makeFacAidBox(label, { w = 0.8, h = 0.6, d = 0.55 } = {}) {
  const g = new THREE.Group(), cb = pmat("#ffffff", { map: cardboardTex(), roughness: 0.85 });
  const body = new THREE.Mesh(rbox(w, h, d, 0.015), cb); body.position.y = h / 2; g.add(body);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.004, d + 0.004), pmat("#c9a86a", { roughness: 0.5 })); tape.position.y = h + 0.002; g.add(tape);
  const pl = makePlate(label, w * 0.8, 0.2, { bg: "#141414", fg: "#ffffff", depth: 0.006 }); pl.position.set(0, h * 0.74, d / 2 + 0.004); g.add(pl);
  const mk = makeInkMark("CRIME", w * 0.8, h * 0.36, { seed: 4 }); mk.position.set(0, h * 0.33, d / 2 + 0.004); mk.rotation.z = -0.08; mk.material.opacity = 0; g.add(mk);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, mark: (k) => { mk.visible = k > 0.01; mk.material.opacity = clamp(k); mk.scale.setScalar(1 + 0.3 * (1 - clamp(k))); } };
}
function facWareLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.8; key.color.set("#ffe2c0"); hemi.intensity = 0.45; hemi.color.set("#b9c9ff"); hemi.groundColor.set("#141210"); scene.fog.color.set("#0b0e14");
}
function buildFacWarehouse(S) {
  const set = makeWarehouseSet({ wallZ: -4, clear: 7, seed: 7 }); S.backdrop(set.group);
  const cp = makeFacCashPallet({}); cp.group.position.set(0.25, 0, -0.4); S.add(cp.group);
  const pad = makePadlock({ s: 0.32 }); S.add(pad.group);
  const box = makeFacAidBox("AJUDA"); box.group.position.set(-1.15, 0, -0.1); box.group.rotation.y = 0.25; S.add(box.group);
  S.solid(cp.group, "palete de dinheiro"); S.solid(box.group, "caixa ajuda");
  return { set, cp, pad, box };
}
addScene("rotulo", A.c13, A.c14, (S) => {
  const W = buildFacWarehouse(S);
  W.cp.chains.forEach((c) => c.set(0)); W.pad.group.visible = false; W.box.group.visible = false;
  const anim = (t) => {
    facWareLook(W.set, t);
    W.cp.tag.rotation.z = 0.35 * Math.sin((t - A.c13) * 4.2) * Math.exp(-(t - A.c13) * 0.9) + 0.03 * Math.sin(t * 1.7);
    W.set.lamps(0.6 * sm(t, A.dinheiro - 0.1, A.dinheiro + 0.2), "#9dffb8");
    fill.position.set(0.25, 2.6, 1.2); fill.color.set(t > A.dinheiro ? "#9dffb8" : "#ffd9a8"); fill.intensity = 0.8 + 2.4 * sm(t, A.dinheiro - 0.1, A.dinheiro + 0.15) * (0.85 + 0.15 * beat(t, A.dinheiro, 0.5));
  };
  S.hero(W.cp.group, "palete de dinheiro com etiqueta");
  const box = envelope([W.cp.group], anim, A.c13, A.c14);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c13, A.c14), { zone: "stage", from: [0.3, 0.32, 1], pull0: 1.18, pull: 1.0 }); p = CAM.shake(p, t, A.dinheiro, 0.016, 0.3); CAM.apply(p); };
});
function facPadAt(W) { const p = W.cp.group.position, y = 0.15 + W.cp.SH * 0.3 - 0.07; W.pad.group.position.set(p.x + 0.42, y, p.z + W.cp.SD / 2 + 0.05); }
addScene("congela", A.c14, A.c15, (S) => {
  const W = buildFacWarehouse(S); W.cp.tag.visible = true;
  const anim = (t) => {
    facWareLook(W.set, t);
    const ch = sm(t, A.c14 + 0.2, A.congela - 0.1); W.cp.chains.forEach((c, i) => c.set(clamp(ch * 1.15 - i * 0.15)));
    facPadAt(W); W.pad.group.visible = t > A.congela - 0.5; W.pad.open(1 - sm(t, A.congela - 0.15, A.congela + 0.05));
    W.cp.frost(sm(t, A.bens - 0.2, A.bens + 0.4)); W.cp.tag.rotation.z = 0.03 * Math.sin(t * 1.7);
    const bin = eOut(lin(t, A.ajuda - 0.55, A.ajuda - 0.05)); W.box.group.visible = t > A.ajuda - 0.55; W.box.group.position.x = -1.15 - 1.4 * (1 - bin); W.box.mark(lin(t, A.criminoso - 0.08, A.criminoso + 0.1));
    W.set.lamps(0.7 * sm(t, A.criminoso - 0.05, A.criminoso + 0.2), "#ff6a5a");
    fill.position.set(t < A.ajuda - 0.4 ? 0.25 : -0.9, 1.8, 1.2); fill.color.set(t > A.criminoso ? "#ff3a2a" : t > A.bens ? "#9fdcff" : "#ffd9a8"); fill.intensity = 1.0 + 1.6 * beat(t, A.congela, 0.5) + 1.4 * beat(t, A.bens, 0.6) + 2.0 * beat(t, A.criminoso, 0.6);
  };
  const T2 = A.ajuda - 0.4;
  S.hero(W.cp.group, "palete acorrentado", { when: (t) => t < T2 - 0.4 }); S.hero(W.pad.group, "cadeado", { when: (t) => t > A.congela - 0.3 && t < T2 - 0.4 });
  S.hero(W.box.group, "caixa ajuda", { when: (t) => t > T2 + 0.45 }); S.hero(W.cp.group, "palete congelado", { when: (t) => t > T2 + 0.45 });
  const bA = envelope([W.cp.group], anim, A.c14, T2), bB = envelope([W.cp.group, W.box.group], anim, A.ajuda, A.c15);
  return (t) => { anim(t); let p = facTrack(t, [[A.c14, bA, "push", { from: [-0.1, 0.22, 1], pull0: 1.15, pull: 1.0 }], [T2, bB, "truck", { from: [-0.2, 0.32, 1], side: 0.25, pull: 1.0 }]], A.c15, 0.55); p = CAM.shake(p, t, A.congela, 0.012, 0.25); p = CAM.shake(p, t, A.criminoso, 0.016, 0.3); CAM.apply(p); };
});
addScene("asfixia", A.c15, A.c16, (S) => {
  const W = buildFacWarehouse(S); W.box.group.visible = false;
  const anim = (t) => {
    facWareLook(W.set, t); W.cp.chains.forEach((c) => c.set(1)); W.cp.frost(1);
    const k = sm(t, A.asfixia - 0.3, A.crime); W.cp.squeeze(k);
    facPadAt(W); W.pad.group.position.z -= 0.05 * k; W.pad.open(0); W.cp.tag.rotation.z = 0.03 * Math.sin(t * 1.7);
    fill.position.set(0.25, 2.0, 1.2); fill.color.set("#9fdcff"); fill.intensity = 1.0 + 1.4 * beat(t, A.asfixia, 0.7);
  };
  S.hero(W.cp.group, "palete apertado pelas correntes"); S.hero(W.pad.group, "cadeado");
  const box = envelope([W.cp.group, W.pad.group], anim, A.c15, A.c16);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c15, A.c16), { zone: "stage", from: [0.15, 0.24, 1], deg: 34, pull: 1.0 })); };
});

// Brasília around the Congress (backdrop): lawn, the reflecting pool in front, ministry blocks with lit
// windows lining the axis on both sides, the city lights far behind. API { group, update(t), lights(k) }
function makeFacEsplanadaSet({ night = false, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), mat("#ffffff", { map: tileTex(grassTex(), 80, 80), color: night ? "#3a4a34" : "#6f8a5a", roughness: 0.95 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -0.01; g.add(lawn);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.05, 9.2), pmat("#4a4640", { roughness: 0.8 })); rim.position.set(0, 0.025, 6.4); g.add(rim);
  const wc = makeCanvas(16, 256), wx = wc.getContext("2d"), wg = wx.createLinearGradient(0, 0, 0, 256);
  (night ? [[0, "#0a1426"], [0.6, "#16264a"], [1, "#2a3a5e"]] : [[0, "#4a3a3a"], [0.5, "#c07a4a"], [1, "#f0a05a"]]).forEach(([q, col]) => wg.addColorStop(q, col)); wx.fillStyle = wg; wx.fillRect(0, 0, 16, 256);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 9.0), new THREE.MeshBasicMaterial({ map: texFrom(wc), toneMapped: false, fog: true })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.055, 6.4); g.add(water);
  const c = makeCanvas(256, 128), x = c.getContext("2d"), e = makeCanvas(256, 128), ex = e.getContext("2d");
  x.fillStyle = "#d8d2c6"; x.fillRect(0, 0, 256, 128); ex.fillStyle = "#000"; ex.fillRect(0, 0, 256, 128);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 24; col++) { const lit = r() < 0.55; x.fillStyle = "#3a4656"; x.fillRect(4 + col * 10.5, 6 + row * 15, 7, 9); if (lit) { ex.fillStyle = "#ffcf8a"; ex.fillRect(4 + col * 10.5, 6 + row * 15, 7, 9); } }
  const winM = pmat("#ffffff", { map: texFrom(c), emissive: "#ffffff", emissiveMap: texFrom(e), emissiveIntensity: night ? 1 : 0.35, roughness: 0.6 }), side = pmat("#cfc9bd", { roughness: 0.7 });
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.8), [side, side, side, side, winM, winM]); b.position.set(sx * 5.6, 1.2, 3.0 + i * 2.8); b.rotation.y = sx * Math.PI / 2; g.add(b);
  }
  const city = makeBokeh({ n: 140, center: [0, 0.9, -45], spread: [110, 1.8, 12], size: [0.3, 0.8], colors: ["#ffcf8a", "#fff1d6", "#9fc4ff"], opacity: night ? 0.7 : 0.45, seed: seed + 9 }); g.add(city.group);
  const lamps = makeBokeh({ n: 40, center: [0, 0.6, 10], spread: [14, 0.3, 16], size: [0.15, 0.3], colors: ["#ffd59a"], opacity: night ? 0.8 : 0.3, seed: seed + 3 }); g.add(lamps.group);
  asBackdrop(g);
  return { group: g, update(t) { city.update(t); lamps.update(t); }, lights(k) { winM.emissiveIntensity = k; } };
}
// ============================================================ 17 · soberania (cartão do Lula)
// Behind the card, Brasília at night: the Congress with lit towers over the reflecting pool (backdrop).
addScene("soberania", A.c16, A.c17, (S) => {
  const esp = makeFacEsplanadaSet({ night: true, seed: 7 }); S.backdrop(esp.group);
  const cg = makeCongressBuilding(); asBackdrop(cg.group); S.backdrop(cg.group);
  const box = new THREE.Box3(new V3(-3, 0, -1.2), new V3(3, 4.2, 1.2));
  return (t) => {
    floor.visible = false; scene.background = FAC_NIGHT; esp.update(t); cg.glow(1);
    key.intensity = 1.2; key.color.set("#c9d6ff"); hemi.intensity = 0.4; hemi.color.set("#9fb3e0"); scene.fog.color.set("#0b1022");
    facFar(CAM.move(box, "push", lin(t, A.c16, A.c17), { zone: "stage", from: [0.1, 0.1, 1], pull0: 1.2, pull: 1.0 }), 120);
  };
});

// ============================================================ 18 · RJ e MT querem o rótulo
// The Brasília office desk: two state folders pop up, RIO DE JANEIRO and MATO GROSSO, each with a red
// TERRORISTA? tag clipped on. Truck across.
addScene("estados", A.c17, A.c18, (S) => {
  const O = buildFacBrOffice(S, 12); O.flag.group.position.set(1.35, O.top, -1.3);
  const fR = makeFacFolder("RIO DE JANEIRO", { w: 0.95, h: 0.95, ink: "PROJETO" }), fM = makeFacFolder("MATO GROSSO", { w: 0.95, h: 0.95, ink: "PROJETO" });
  fR.group.position.set(-0.55, O.top, -0.85); fM.group.position.set(0.55, O.top, -0.85); fR.group.rotation.x = -0.08; fM.group.rotation.x = -0.08; S.add(fR.group, fM.group);
  const anim = (t) => {
    facOfficeLook(O.office, t, false); O.flag.update(t); O.win.set(1 + 0.5 * beat(t, A.estadual, 0.6), "#ffffff");
    popIn(fR.group, t, A.rio - 0.25, 0.4); popIn(fM.group, t, A.mato - 0.05, 0.4);
    fR.mark(lin(t, A.estadual - 0.1, A.estadual + 0.1)); fM.mark(lin(t, A.estadual + 0.05, A.estadual + 0.25));
    fill.position.set(0, O.top + 1.2, 0.6); fill.color.set("#ffd9a8"); fill.intensity = 1.0 + 1.2 * beat(t, A.estadual, 0.6);
  };
  S.hero(fR.group, "pasta rio de janeiro", { when: (t) => t > A.rio + 0.25 }); S.hero(fM.group, "pasta mato grosso", { when: (t) => t > A.mato + 0.4 });
  const box = envelope([fR.group, fM.group], anim, A.mato + 0.4, A.c18);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.c17, A.c18), { zone: "stage", from: [0, 0.25, 1], side: 0.35, pull: 1.04 })); };
});

// ============================================================ 19 · só o Congresso cria crime
// The National Congress at dusk on its lawn; the tower windows light up on "Congresso". Crane up.
addScene("congresso", A.c18, A.c19, (S) => {
  const cg = makeCongressBuilding(); S.add(cg.group);
  const esp = makeFacEsplanadaSet({ night: false, seed: 5 }); S.backdrop(esp.group);
  const anim = (t) => {
    floor.visible = false; scene.background = FAC_DUSK; esp.update(t); esp.lights(0.35 + 0.65 * sm(t, A.congresso - 0.2, A.congresso + 0.2));
    key.intensity = 2.6; key.color.set("#ffb98a"); hemi.intensity = 0.75; hemi.color.set("#c9d6ff"); hemi.groundColor.set("#2a2418"); scene.fog.color.set("#8a6656");
    cg.glow(0.3 + 0.7 * sm(t, A.congresso - 0.2, A.congresso + 0.2));
    fill.intensity = 0;
  };
  S.hero(cg.group, "congresso nacional");
  const box = envelope([cg.group], anim, A.c18, A.c19);
  return (t) => { anim(t); facFar(CAM.move(box, "crane", lin(t, A.c18, A.c19), { zone: "stage", from: [0.0, 0.16, 1], rise: 0.12, pull: 1.0 }), 140); };
});

// ============================================================ 20 · a pergunta: a porta abre
// Back to the vault door: on "terrorismo" the MOTIVO lock goes green too, the wheel spins, the gold inside
// glows ("o dinheiro do crime"); on "abre a porta" the door swings open and a cold blue light floods in
// from outside ("interferência de fora"). Orbit, then reveal.
addScene("pergunta", A.c19, A.end, (S) => {
  const V = buildFacVault(S, 6); V.kL.group.visible = false;
  // the ATO key stays in its lock and swings out with the door: parent it to the lock plate
  V.LA.group.add(V.kA.group); V.kA.group.position.set(V.LA.hole.x, V.LA.hole.y, V.LA.hole.z - 0.2); V.kA.turn(0);
  const pool = makeFloorGlow(4, 3, { color: "#9fc0ff", opacity: 0 }); pool.position.set(0, 0.01, 1.4); asBackdrop(pool); S.backdrop(pool);
  const shaft = makeLightShaft([-0.3, V.door.cy + 1.2, 3.2], [-0.4, 0.05, 0.4], { w0: 0.8, w1: 2.6, color: "#a9c8ff", opacity: 0.3 }); asBackdrop(shaft.group); S.backdrop(shaft.group);
  const anim = (t) => {
    facVaultLook(V, t);
    V.kL.group.visible = false;
    V.LA.led(GREEN, 1); V.LM.led(t > A.terrorismo3 ? GREEN : RED, 1);
    V.door.spin(-3 * sm(t, A.terrorismo3, A.sufoca + 0.6));
    const op = sm(t, A.abre2 - 0.3, A.porta2 + 0.5); V.door.open(0.42 * op); pool.material.opacity = 0.5 * sm(t, A.interferencia - 0.3, A.fora + 0.2); shaft.set(0.9 * sm(t, A.interferencia - 0.3, A.fora + 0.2));
    V.door.glow(0.1 + 0.9 * sm(t, A.sufoca - 0.2, A.dinheiro2 + 0.3));
    V.room.beacon(sm(t, A.interferencia - 0.2, A.interferencia + 0.3));
    const blue = sm(t, A.interferencia - 0.3, A.fora);
    fill.position.set(0.4, 1.8, 2.6); fill.color.set("#ffd9a8").lerp(new THREE.Color("#8fb8ff"), blue); fill.intensity = 1.0 + 4.0 * blue;
    hemi.color.set("#cfe0ff").lerp(new THREE.Color("#7fa8ff"), blue); hemi.intensity = 0.5 + 0.5 * blue;
    key.color.set("#ffe6cc").lerp(new THREE.Color("#b8d0ff"), blue);
  };
  const T2 = A.abre2 - 0.5;
  // the money inside the vault: a pallet of cash in the lit tunnel, seen once the door swings open
  const cash = makeFacCashPallet({ rows: 12 }); cash.tag.visible = false; cash.group.scale.setScalar(0.62); cash.group.position.set(0, 0.47, -0.95); S.add(cash.group);
  const SEEN = A.porta2 + 0.1;
  S.hero(V.LA.group, "fechadura ato", { when: (t) => t < T2 - 0.4 }); S.hero(V.kA.group, "chave ato", { when: (t) => t < T2 - 0.4 }); S.hero(V.LM.group, "fechadura motivo", { when: (t) => t < T2 - 0.4 });
  S.hero(cash.group, "dinheiro dentro do cofre", { when: (t) => t > SEEN });
  const bA = envelope([V.pair], anim, A.c19, T2), bB = envelope([cash.group], anim, T2, A.end);
  return (t) => { anim(t); CAM.apply(facTrack(t, [[A.c19, bA, "orbit", { from: [-0.12, 0.1, 1], deg: 24, pull: 1.0 }], [T2, bB, "push", { from: [-0.42, 0.16, 1], pull0: 1.6, pull: 1.15 }]], A.end, 0.6)); };
});
