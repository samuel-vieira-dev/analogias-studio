// ============================================================================
// videos/2026-11-04-milicias-origem/scenes.js
// Milícias: o que são e como começaram. Gancho: "No Rio, tem bairro onde quem cobra taxa de segurança é
// policial." → a porta de casa numa viela à noite, o aviso TAXA DE SEGURANÇA colado nela e o giroflex na
// parede → todo mês um aviso novo, batidas na porta, PAGO → o gás mais caro, a internet e a van "só as dele"
// → o distintivo que vira do dourado para o ferro: é a milícia → a maquete do bairro que acende quando o
// grupo domina → analogia: o porteiro que tranca todas as portas com cadeado e cobra pela chave; o crachá
// SEGURANÇA → o arquivo: esquadrões da morte (anos 1950), grupos de extermínio, Rio das Pedras (anos 1970) e
// a cancela que "expulsa o tráfico" → o jornal de 2005 → o púlpito da "autodefesa comunitária" (2006) → a
// câmera de imprensa no chão (Batan, 2008) → a CPI (foto da Alerj) e a pilha de indiciados → o Código Penal
// (2012) → a maquete da região: a milícia quase quintuplica, e hoje recua enquanto o CV avança → milícia ou
// tráfico? Nenhum político nomeado; números e fontes em fatos.md.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / milTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  rio: 0.24, taxa: 2.38, seguranca: 2.86, policial: 3.7,
  imagina: 4.76, todo: 5.42, mes: 5.6, bate: 6.52, porta: 7.26, cobra: 7.9, taxa2: 8.34, voce: 8.82, pediu: 9.24, mas: 10.68, paga: 11.0, c1: 11.45,
  gas: 11.78, caro: 12.86, internet: 13.54, van: 14.26, dele: 15.12, c2: 15.42,
  traficante: 16.02, milicia: 17.16, c3: 17.86,
  grupo: 17.98, policiais: 19.9, ex: 20.6, domina: 21.82, bairro: 22.38, vende: 23.04, protecao: 23.3, c4: 23.96,
  porteiro: 24.7, contratado: 25.44, barrar: 26.02, trocasse: 26.78, todas: 27.54, fechaduras: 28.16, cobrasse: 29.14, chave: 29.74, c5: 30.24,
  reclama: 31.08, seguranca2: 32.32, c6: 32.86,
  veio: 34.02, anos50: 34.7, matar: 37.22, bandido: 38.52, esquadroes: 39.46, morte: 40.38, depois: 41.04, grupos: 42.06, exterminio: 42.56, c7: 43.2,
  pedras: 43.84, antigas: 45.08, anos70: 46.68, promessa: 47.94, expulsar: 48.7, trafico: 49.44, c8: 49.99,
  a2005: 50.14, jornal: 51.2, nome: 52.0, milicia2: 52.64, c9: 53.12,
  a2006: 53.46, prefeito: 54.96, chamou: 55.78, autodefesa: 56.5, comunitaria: 57.36, mal: 58.48, trafico2: 59.44, c10: 60.04,
  a2008: 60.18, milicianos: 61.22, torturaram: 61.78, jornalistas: 63.28, sete: 64.28, horas: 64.62, c11: 65.3,
  cpi: 66.0, mais: 67.52, c12: 67.5, duzentos: 67.92, indiciados: 68.42, policiais2: 69.6, politicos: 70.6, c13: 71.28,
  a2012: 71.5, crime: 73.34, codigo: 73.86, ate: 74.9, oito: 75.14, prisao: 76.12, c14: 76.6,
  dezesseis: 77.58, area: 78.76, quase: 79.76, quintuplicou: 80.14, hoje: 81.1, primeira: 81.88, recuando: 83.58, comando: 85.04, avanca: 85.94, c15: 86.68,
  pior: 88.06, milicia3: 88.9, proteger: 90.5, ou: 91.36, trafico3: 91.68, declarado: 92.68, comenta: 93.58, end: 95.9,
};
const MIL_ORANGE = "#ff6a00", MIL_CV = "#e0261b";

// ---------------------------------------------------------------- shared helpers
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function milTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
// Outdoor shots: keep the far hill and the rooftops out of the camera's fog.
function milFar(p, far = 90) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 6); scene.fog.far = Math.max(scene.fog.far, far); }
const MIL_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#03050c"); g.addColorStop(0.5, "#0b1328"); g.addColorStop(0.8, "#1a2036"); g.addColorStop(1, "#231d24"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function milAlleyLook(alley, t, siren = 1) {
  floor.visible = false; scene.background = MIL_NIGHT; alley.update(t); alley.siren(siren, t);
  key.intensity = 0.75; key.color.set("#a9bcff"); hemi.intensity = 0.3; hemi.color.set("#7088c4"); hemi.groundColor.set("#120f10");
  scene.environmentIntensity = 0.25; scene.fog.color.set("#0b0f18");
}
function milOfficeLook(set, t, k = 1) {
  floor.visible = false; set.update(t);
  key.intensity = 1.7 * k; key.color.set("#ffd6b0"); hemi.intensity = 0.42; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
// The hero doorway of the alley: the house door with its wall fills the gap the alley leaves for it.
function milStreet(S, seed) {
  const alley = makeAlleyNight({ seed }); S.backdrop(alley.group);
  const door = makeHouseDoor({ number: "27", wall: "#76604e" }); S.add(door.group);
  return { alley, door };
}
// Dark wooden desk. Origin floor centre; returns { group, top }.
function makeMilDesk({ w = 2.4, d = 1.1, top = 0.75 } = {}) {
  const g = new THREE.Group();
  const mt = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 37 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; g.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); g.add(l); }
  return { group: g, top };
}
// Banker's desk lamp: brass base and stem, a green glass shade, the bulb glowing under it and its pool of
// light on the desk. Origin: base on the desk; the shade reaches towards +x. API { group, set(k) }
function makeMilDeskLamp() {
  const g = new THREE.Group(), brass = pmat("#c79a45", { metalness: 1, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 32), brass); base.position.y = 0.015; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), brass); stem.position.y = 0.2; g.add(stem);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 12), brass); arm.rotation.z = Math.PI / 2; arm.position.set(0.1, 0.38, 0); g.add(arm);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.1, 32, 1, true, 0, Math.PI * 2), pmat("#1f5c3a", { roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide })); shade.position.set(0.2, 0.36, 0); g.add(shade);
  const bulbM = new THREE.MeshBasicMaterial({ color: "#ffe2a8", toneMapped: false }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 10), bulbM); bulb.position.set(0.2, 0.33, 0); g.add(bulb);
  const halo = sprite(BOKEH, 0.5); halo.material.color.set("#ffd28a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0.2, 0.3, 0); halo.userData.decor = true; g.add(halo);
  const pl = new THREE.PointLight("#ffcf8a", 2.4, 3.5, 1.6); pl.position.set(0.2, 0.3, 0.05); g.add(pl);
  return { group: g, set(k) { pl.intensity = 2.4 * k; halo.material.opacity = 0.8 * k; bulbM.color.set("#ffe2a8").multiplyScalar(0.3 + 0.7 * k); } };
}
// The investigation room (history act): the office set at night, a desk and its lamp.
function milArchive(S, seed, { desk = true, wall = "#4d3b2f" } = {}) {
  const office = makeOfficeSet({ wallZ: -1.6, clear: 2.6, wall, seed }); S.backdrop(office.group);
  let d = null, lamp = null;
  if (desk) { d = makeMilDesk({ w: 2.2, d: 1.0 }); d.group.position.z = -0.95; S.add(d.group); lamp = makeMilDeskLamp(); lamp.group.position.set(-0.85, d.top, -1.2); S.add(lamp.group); }
  return { office, desk: d, lamp, top: d ? d.top : 0 };
}

// The notice taped on the door: TAXA DE SEGURANÇA in large letters, the month in a red tab, a few lines of
// small print and two strips of tape. Origin: centre; faces +z. API { group, plates }
function makeMilNotice(month, { w = 0.5, h = 0.68, seed = 1 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.002), mat("#f1ebdd", { roughness: 0.85 })); g.add(paper);
  const t1 = makePlate("TAXA DE", w * 0.8, h * 0.13, { bg: "#f1ebdd", fg: "#141414", depth: 0.0015 }); t1.position.set(0, h * 0.31, 0.0015); g.add(t1);
  const t2 = makePlate("SEGURANÇA", w * 0.92, h * 0.14, { bg: "#f1ebdd", fg: RED, depth: 0.0015 }); t2.position.set(0, h * 0.16, 0.0015); g.add(t2);
  const mo = makePlate(month, w * 0.42, h * 0.12, { bg: "#141414", fg: "#ffffff", depth: 0.0015 }); mo.position.set(0, -h * 0.02, 0.0015); g.add(mo);
  const ink = mat("#3a3632", { roughness: 0.9 });
  for (let k = 0; k < 5; k++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(w * (0.62 - (k % 3) * 0.08), 0.008, 0.001), ink); ln.position.set(-w * 0.04, -h * (0.15 + k * 0.055), 0.0015); g.add(ln); }
  const tape = mat("#e9dfb8", { roughness: 0.6, transparent: true, opacity: 0.85 });
  for (const s of [-1, 1]) { const tp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.001), tape); tp.position.set(s * w * 0.4, h * 0.48, 0.002); tp.rotation.z = s * 0.5 + (r() - 0.5) * 0.2; g.add(tp); }
  return { group: g, plates: [t1, t2, mo] };
}

// ============================================================ 1–3 · gancho: a taxa colada na porta, todo mês, e você paga
// The alley at night: the door of a house, the notice TAXA DE SEGURANÇA taped on it, red and blue police
// lights sweeping the walls. "Todo mês": a new notice (JAN … MAI) is taped over the last; knocks shake the
// door. "Mas paga": a rubber stamp hits the notice, PAGO. Push → reveal → push.
addScene("porta", 0, A.c1, (S) => {
  const { alley, door } = milStreet(S, 8);
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI"];
  const notices = months.map((m, i) => { const n = makeMilNotice(m, { seed: i + 2 }); n.group.position.set(door.w / 2, 1.5, 0.04 + i * 0.004); n.group.rotation.z = [0.012, -0.01, 0.008, -0.006, 0.01][i]; door.leaf.add(n.group); return n; });
  const STICK = [0, A.mes - 0.1, A.bate + 0.25, A.porta + 0.2, A.taxa2 + 0.05];   // when each month is taped on
  const inkMark = makeInkMark("PAGO", 0.34, 0.16, { ink: "#c8231a", seed: 5 }); inkMark.position.set(door.w / 2, 1.42, 0.07); inkMark.rotation.z = -0.12; door.leaf.add(inkMark);
  const stamp = makeStamp({ w: 0.36, d: 0.16 }); stamp.rotation.x = Math.PI / 2; S.add(stamp);
  const STAMP = A.paga + 0.02;
  const knock = (t) => 0.012 * (beat(t, A.bate, 0.12) + beat(t, A.bate + 0.2, 0.12) + beat(t, A.bate + 0.4, 0.12) + beat(t, A.porta + 0.3, 0.12) + beat(t, A.porta + 0.5, 0.12));
  const anim = (t) => {
    milAlleyLook(alley, t, 0.7 + 0.6 * beat(t, A.policial - 0.2, 1.0));
    notices.forEach((n, i) => { const k = i === 0 ? 1 : eOut(lin(t, STICK[i], STICK[i] + 0.22)); n.group.visible = k > 0.01; n.group.scale.setScalar(Math.max(0.0001, 0.85 + 0.15 * k)); n.group.position.z = 0.04 + i * 0.004 + 0.06 * (1 - k); });
    // only the top notice is read; the ones under it are texture. Wide framing: all of them are.
    const wide = t > A.imagina - 0.5 && t < 8.8;
    const top = notices.reduce((a, n, i) => (t >= STICK[i] ? i : a), 0);
    notices.forEach((n, i) => n.plates.forEach((p) => { p.userData.plate.detail = wide || i !== top; }));
    door.leaf.rotation.y = -knock(t);
    // the stamp comes in from the camera side, hits, leaves the mark and goes back out of frame
    const hit = lin(t, STAMP - 0.25, STAMP) - lin(t, STAMP + 0.08, STAMP + 0.35);
    stamp.visible = t > STAMP - 0.3 && t < STAMP + 0.4;
    door.leaf.updateMatrixWorld(true);
    const ip = new V3(door.w / 2, 1.42, 0.075 + 0.002).applyMatrix4(door.leaf.matrixWorld);
    stamp.position.set(ip.x, ip.y, ip.z + 0.9 * (1 - eOut(clamp(hit))));
    inkMark.visible = t >= STAMP; inkMark.material.opacity = 1;
    fill.position.set(0.9, 2.0, 0.7); fill.color.set("#ffc27a"); fill.intensity = 1.8;
  };
  // each notice is the subject only while it is the one on top
  notices.forEach((n, i) => S.hero(n.group, "aviso " + months[i], { when: (t) => (t < A.imagina - 0.6 || t > 9.3) && t > STICK[i] + 0.25 && (i === notices.length - 1 || t < STICK[i + 1]) }));
  S.hero(door.leaf, "porta da casa", { when: (t) => t > A.imagina - 0.05 && t < 8.6 });
  const bA = new THREE.Box3(new V3(-0.45, 0.95, -0.05), new V3(0.45, 2.05, 0.12));
  const bB = new THREE.Box3(new V3(-1.05, 0.0, -0.1), new V3(1.05, 2.4, 0.85));
  const bC = new THREE.Box3(new V3(-0.36, 1.04, -0.05), new V3(0.36, 1.92, 0.12));
  return (t) => {
    anim(t);
    let p = milTrack(t, [[0, bA, "push", { from: [0.22, 0.08, 1], pull0: 1.3, pull: 1.02 }], [A.imagina - 0.4, bB, "reveal", { from: [-0.28, 0.16, 1], pull0: 1.12, pull: 1.0 }], [8.8, bC, "push", { from: [0.14, 0.04, 1], pull0: 1.25, pull: 1.04 }]], A.c1, 0.55);
    p = CAM.shake(p, t, A.bate, 0.006, 0.6); p = CAM.shake(p, t, STAMP, 0.02, 0.35); milFar(p);
  };
});

// ============================================================ 4 · o gás, a internet e a van: só as dele
// The same street: by the door a gas cylinder with a price card MAIS CARO; on a bracket on the wall a wifi
// router with SÓ A DELE; a white transit van parked further along with its own card. Push → truck → reveal.
addScene("servicos", A.c1, A.c2, (S) => {
  const { alley, door } = milStreet(S, 8);
  door.group.traverse((n) => { if (n.userData.plate && n.userData.plate.text === "27") n.visible = false; });
  const gas = makeGasCylinder(); gas.group.position.set(-1.0, 0, 0.42); S.add(gas.group);
  const gasCard = makeShelfCard("MAIS CARO", { w: 0.5, h: 0.17 }); gasCard.group.position.set(-1.0, 0, 0.82); S.add(gasCard.group);
  // a steel bracket shelf on the wall right of the door, the router on it, a cable up to the wires
  const shelf = new THREE.Group(); shelf.position.set(1.2, 1.05, 0); S.add(shelf);
  const board = new THREE.Mesh(rbox(0.9, 0.03, 0.34, 0.008), pmat("#5b5f63", { metalness: 0.6, roughness: 0.4 })); board.position.set(0.05, 0, 0.17); shelf.add(board);
  for (const s of [-1, 1]) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.02), pmat("#5b5f63", { metalness: 0.6 })); br.position.set(0.05 + s * 0.36, -0.1, 0.02); shelf.add(br); }
  const router = makeWifiRouter({ s: 1.1 }); router.group.position.set(-0.17, 0.015, 0.17); shelf.add(router.group);
  const card = makeShelfCard("SÓ A DELE", { w: 0.3, h: 0.11 }); card.group.position.set(0.32, 0.015, 0.2); card.group.rotation.y = -0.12; shelf.add(card.group);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(1.12, 1.08, 0.05), new V3(1.1, 1.9, 0.03), new V3(1.2, 2.8, 0.02), new V3(0.9, 3.6, 0.05)]), 30, 0.008, 6, false), mat("#121212")); S.add(cable);
  const van = makeLotacaoVan(); van.group.position.set(4.3, 0, 1.6); van.group.rotation.y = Math.PI; S.add(van.group);
  const anim = (t) => {
    milAlleyLook(alley, t, 0.55);
    router.blink(t); router.waves(0.6 + 0.4 * beat(t, A.internet, 0.6), t);
    gasCard.group.scale.setScalar(Math.max(0.0001, pop(t, A.caro - 0.3, 0.4)));
    card.group.scale.setScalar(Math.max(0.0001, pop(t, A.internet - 0.1, 0.4)));
    fill.position.set(-0.6, 1.4, 1.6); fill.color.set("#ffcf9a"); fill.intensity = 0.9;
  };
  const R1 = A.internet - 0.3, R2 = A.van - 0.12;
  S.hero(gas.group, "botijão de gás", { when: (t) => t < R1 - 0.5 }); S.hero(gasCard.group, "placa mais caro", { when: (t) => t > A.caro && t < R1 - 0.5 });
  S.hero(router.group, "roteador de internet", { when: (t) => t > R1 + 0.3 && t < R2 - 0.3 }); S.hero(card.group, "placa só a dele", { when: (t) => t > R1 + 0.3 && t < R2 - 0.3 });
  S.hero(van.group, "van de lotação", { when: (t) => t > R2 + 0.35 });
  S.solid(gas.group, "botijão"); S.solid(gasCard.group, "placa do gás");
  const bG = envelope([gas.group, gasCard.group], anim, A.c1, R1), bR = envelope([router.group, card.group], anim, R1, R2), bV = envelope([van.group], anim, R2, A.c2);
  return (t) => {
    anim(t);
    milFar(milTrack(t, [[A.c1, bG, "push", { from: [0.25, 0.42, 1], pull0: 1.25, pull: 1.04 }], [R1, bR, "truck", { from: [-0.3, 0.18, 1], side: 0.25, pull: 1.1 }], [R2, bV, "reveal", { from: [-0.35, 0.22, 1], pull0: 1.12, pull: 1.0 }]], A.c2, 0.42));
  };
});

// ============================================================ 5 · ele não é traficante: é a milícia
// The same street, a black plinth in front of the door, and on it the medal-badge: the gold star of the
// protector turns, on "milícia", to its blackened iron face. Orbit.
addScene("distintivo", A.c2, A.c3, (S) => {
  const { alley, door } = milStreet(S, 8);
  const pl = makeLabelPlinth(null, { w: 0.9, h: 0.6, d: 0.6 }); pl.group.position.set(0, 0, 0.95); S.add(pl.group);
  const medal = makeShieldBadge({ h: 0.86 }); medal.group.position.set(0, pl.top, 0.95); S.add(medal.group);
  const FLIP = A.milicia - 0.55;
  const anim = (t) => {
    milAlleyLook(alley, t, 0.4 + 0.9 * beat(t, A.milicia - 0.1, 0.9));
    medal.spin(-0.35 + 0.25 * lin(t, A.c2, FLIP) + (Math.PI + 0.1) * eOut(lin(t, FLIP, A.milicia + 0.1)));
    fill.position.set(0.5, 1.6, 2.2); fill.color.set(t < A.milicia ? "#ffd28a" : "#ff6a5a"); fill.intensity = 1.6;
  };
  S.hero(medal.group, "distintivo de duas faces");
  medal.plate.userData.plate.detail = false; S.solid(medal.group, "medalha", { restsOn: ["pedestal"] }); S.solid(pl.group, "pedestal");
  const box = envelope([medal.group, pl.group], anim, A.c2, A.c3);
  return (t) => { anim(t); let p = CAM.move(box, "orbit", lin(t, A.c2, A.c3), { zone: "stage", from: [0.1, 0.22, 1], deg: 34, pull: 1.0 }); p = CAM.shake(p, t, A.milicia, 0.016, 0.4); milFar(p); };
});

// ============================================================ 6 · grupo armado que domina o bairro e vende proteção
// The investigation room: a tabletop model of a dense neighbourhood with a boom gate at its entrance. On
// "domina o bairro" the houses light up in orange from the gate outwards. Push on the gate → reveal.
// A boom gate at the entrance of a lane of the model: a post with a counterweight box and a red-and-white
// striped boom across the lane (length L). set(1) up, set(0) down. Origin: foot of the post. API { group, set(k) }
const MIL_STRIPES = (() => { const c = makeCanvas(256, 32), x = c.getContext("2d"); for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? "#f2efe8" : "#d0261b"; x.fillRect(k * 32, 0, 32, 32); } return texFrom(c); })();
function milGateOnModel(model, x, z, L = 0.34) {
  const g = new THREE.Group(); g.position.set(x, model.top, z); model.group.add(g);
  const steel = pmat("#3a3d42", { metalness: 0.6, roughness: 0.4 });
  const post = new THREE.Mesh(rbox(0.035, 0.12, 0.035, 0.006), steel); post.position.y = 0.06; g.add(post);
  const box = new THREE.Mesh(rbox(0.05, 0.05, 0.05, 0.008), pmat("#e8e3d8", { roughness: 0.5 })); box.position.set(0, 0.1, 0); g.add(box);
  const pivot = new THREE.Group(); pivot.position.set(0.02, 0.1, 0.03); g.add(pivot);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(L, 0.016, 0.016), mat("#ffffff", { map: MIL_STRIPES, roughness: 0.5 })); boom.position.x = L / 2; pivot.add(boom);
  const rest = new THREE.Mesh(rbox(0.02, 0.09, 0.02, 0.004), steel); rest.position.set(L + 0.02, 0.045, 0.03); g.add(rest);
  return { group: g, set: (k) => { pivot.rotation.z = 1.35 * clamp(k); } };
}
addScene("bairro", A.c3, A.c4, (S) => {
  const room = milArchive(S, 12, { desk: false, wall: "#43362d" });
  const model = makeTerritoryModel({ cols: 7, rows: 5, cell: 0.3, seed: 4, base: 0.1, skip: (i) => i === 3 }); model.group.position.z = -0.45; S.add(model.group);
  const gx = -0.17, gz = model.BD / 2 - 0.06;
  const gate = milGateOnModel(model, gx, gz);
  const order = model.cells.map((c, k) => ({ k, d: Math.hypot(c.x - gx, c.z - gz) })).sort((a, b) => a.d - b.d);
  const ON = order.slice(0, Math.round(order.length * 0.78));
  const anim = (t) => {
    milOfficeLook(room.office, t, 0.9);
    const k = lin(t, A.domina - 0.1, A.protecao + 0.3);
    model.clear(); ON.forEach((o, i) => { const a = clamp(k * ON.length - i); if (a > 0) model.paint(o.k, MIL_ORANGE, a); }); model.flush();
    gate.set(t < A.domina ? 1 : 1 - eOut(lin(t, A.domina, A.domina + 0.4)));
    room.office.windows(1 - 0.5 * k, k > 0.5 ? "#ffb070" : null);
    fill.position.set(0, 2.0, 1.4); fill.color.set("#ffb36b"); fill.intensity = 0.6 + 1.2 * k;
  };
  S.hero(model.group, "maquete do bairro");
  const bAll = envelope([model.board], anim, A.c3, A.c4); bAll.expandByPoint(new V3(0, model.top + 0.45, -0.45));
  return (t) => { anim(t); CAM.apply(milTrack(t, [[A.c3, bAll, "push", { from: [0.05, 0.55, 1], pull0: 1.25, pull: 1.0 }], [A.domina - 0.3, bAll, "reveal", { from: [-0.25, 0.7, 1], pull0: 1.12, pull: 1.0 }]], A.c4, 0.6)); };
});

// ============================================================ 7–8 · a analogia: o porteiro que tranca as portas e cobra pela chave
// A building corridor at night: the doorman in his dark uniform, the doors of the flats behind him. On
// "trocasse todas as fechaduras" a padlock snaps onto every door and the lock lights turn red; on "cobrasse
// pela chave" he holds out a brass key with its price tag; on "ele é a segurança" the camera goes to the ID
// badge on his chest. Push → truck → orbit → push.
addScene("porteiro", A.c4, A.c6, (S) => {
  const hall = makeHotelHall({ n: 8, heroN: 3, wallZ: -0.4, seed: 7 }); S.backdrop(hall.group); S.add(hall.heroGroup);
  const man = makeDiner({ suit: "#1d2738", shirt: "#d9dde3", tie: "#1d2738" }); man.group.position.set(0.0, 0, 0.55); S.add(man.group);
  const badge = makeIdBadge("SEGURANÇA"); badge.group.position.set(0.085, 0.47, 0.128); badge.group.rotation.x = -0.12; man.parts.torso.add(badge.group);
  // a hasp across the leaf edge and the frame, above the card lock, and a padlock hanging from it
  const locks = hall.allDoors.map(({ d, x }, i) => {
    const g = new THREE.Group(); g.position.set(x + 0.5, 1.62, -0.4 + 0.07);
    const hasp = new THREE.Mesh(rbox(0.16, 0.05, 0.02, 0.006), pmat("#8e9297", { metalness: 0.9, roughness: 0.3 })); g.add(hasp);
    const pl = makePadlock({ s: 0.5 }); pl.group.position.set(-0.075, -0.25, 0.012); g.add(pl.group);
    (i >= 2 && i < 5 ? hall.heroGroup : hall.group).add(g);
    return { g, pl, d, x };
  });
  // lock order: from left to right along the corridor
  const LOCK0 = A.trocasse - 0.1, LOCK1 = A.fechaduras + 0.45;
  const lockT = (i) => lerp(LOCK0, LOCK1, i / (locks.length - 1));
  const keyG = makeBigKey({ s: 0.4 }); S.add(keyG.group);
  // the key hangs on a brass hook on the wall beside the last door, its price tag beside it
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 8, 16, Math.PI * 1.3), pmat("#c9a24e", { metalness: 1, roughness: 0.3 })); S.add(hook);
  // a red card tag tied to the bow, hanging beside the key, the price printed across it
  const tag = new THREE.Group(); tag.position.set(0.12, -0.08, 0.02); keyG.group.add(tag);
  const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), pmat("#d9d0c3", { roughness: 0.9 })); str.position.set(-0.05, 0.0, 0); str.rotation.z = 0.9; tag.add(str);
  const card = new THREE.Mesh(rbox(0.42, 0.17, 0.012, 0.02), pmat(RED, { roughness: 0.6 })); card.position.set(0.17, -0.1, 0); tag.add(card);
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 8, 16), steelMat()); eye.position.set(-0.01, -0.06, 0.008); tag.add(eye);
  const price = makePlate("R$ POR MÊS", 0.34, 0.11, { bg: RED, fg: "#ffffff", depth: 0.004 }); price.position.set(0.19, -0.1, 0.008); tag.add(price);
  const KEY = A.cobrasse - 0.05, KEYAT = new V3(locks[4].x + 0.86, 1.55, -0.4 + 0.035);
  hook.position.set(KEYAT.x, KEYAT.y + 0.01, KEYAT.z); hook.rotation.z = -0.6;
  const anim = (t) => {
    floor.visible = false; hall.update(t); hall.lights(1 - 0.3 * lin(t, LOCK0, LOCK1));
    key.intensity = 1.8; key.color.set("#ffe6cc"); hemi.intensity = 0.5; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#141216"); scene.fog.color.set("#0a0e16");
    locks.forEach((L, i) => { const k = pop(t, lockT(i), 0.3); L.g.visible = k > 0.01; L.g.scale.setScalar(Math.max(0.0001, k)); L.pl.open(1 - lin(t, lockT(i) + 0.15, lockT(i) + 0.35)); L.d.led(t > lockT(i) + 0.3 ? "#ff2a1a" : "#2aff6a"); });
    badge.plate.userData.plate.detail = t < A.c5;
    man.setPose({ turn: -0.08, swing: 0 });
    keyG.group.position.copy(KEYAT); keyG.group.rotation.z = 0.06 * Math.sin(t * 2.4) * (1 - lin(t, KEY, KEY + 1.2)); keyG.group.visible = t > KEY - 0.2; keyG.group.scale.setScalar(Math.max(0.0001, pop(t, KEY - 0.2, 0.35)));
    fill.position.set(0.3, 1.7, 1.8); fill.color.set("#ffcf9a"); fill.intensity = 0.8;
  };
  const T2 = A.trocasse - 0.25, T3 = A.cobrasse - 0.3, T4 = A.c5 + 0.05;
  S.hero(man.group, "porteiro de uniforme", { when: (t) => t < T2 - 0.45 });
  S.hero(locks[4].g, "cadeado na porta", { when: (t) => t > lockT(4) + 0.3 && t < T3 - 0.45 });
  S.hero(keyG.group, "chave com etiqueta de preço", { when: (t) => t > KEY + 0.3 && t < T4 - 0.4 });
  S.hero(badge.group, "crachá segurança", { when: (t) => t > T4 + 0.5 });
  const bMan = envelope([man.group], anim, A.c4, T2);
  const xb = locks[4].x;
  const bDoors = new THREE.Box3(new V3(xb - 0.55, 0.75, -0.45), new V3(xb + 0.7, 2.22, -0.2));
  const bKey = envelope([keyG.group], anim, KEY + 0.4, T4); bKey.expandByScalar(0.04);
  const bBadge = envelope([badge.group], anim, T4, A.c6); bBadge.expandByScalar(0.03);
  return (t) => {
    anim(t);
    CAM.apply(milTrack(t, [[A.c4, bMan, "push", { from: [0.12, 0.12, 1], pull0: 1.3, pull: 1.04 }], [T2, bDoors, "truck", { from: [0.0, 0.1, 1], side: 0.25, pull: 1.04 }], [T3, bKey, "orbit", { from: [-0.1, 0.05, 1], deg: 24, pull: 1.12 }], [T4, bBadge, "push", { from: [0.1, 0.02, 1], pull0: 1.7, pull: 1.22 }]], A.c6, 0.5));
  };
});

// ============================================================ 9–11 · de onde veio: esquadrões da morte, grupos de extermínio
// The investigation room at night, the green desk lamp on: a 1950s case file on the desk. The camera drops
// from above ("de onde isso veio?"), pushes in, and on "esquadrões da morte" a rubber stamp marks the file.
// "Depois vieram os grupos de extermínio": a second file lands beside it and gets its own stamp. Orbit.
addScene("arquivo", A.c6, A.c7, (S) => {
  const room = milArchive(S, 14);
  const f1 = makeCaseFile("RIO · ANOS 50", { color: "#c4a067" }); f1.group.position.set(-0.32, room.top, -0.82); f1.group.rotation.y = 0.05; S.add(f1.group);
  const f2 = makeCaseFile("BAIXADA", { color: "#b38a55" }); S.add(f2.group);
  const F2 = { x: 0.42, z: -0.8, ry: -0.08 };
  const ink1 = makeInkMark("ESQUADRÃO\nDA MORTE", 0.5, 0.26, { seed: 3 }); ink1.rotation.set(-Math.PI / 2, 0, 0.07); ink1.position.set(0, f1.top + 0.002, 0.12); f1.group.add(ink1);
  const ink2 = makeInkMark("GRUPOS DE\nEXTERMÍNIO", 0.52, 0.26, { seed: 4 }); ink2.rotation.set(-Math.PI / 2, 0, -0.06); ink2.position.set(0, f2.top + 0.002, 0.12); f2.group.add(ink2);
  const stamp = makeStamp({ w: 0.42, d: 0.18 }); S.add(stamp);
  const HIT1 = A.esquadroes + 0.3, LAND2 = A.depois + 0.45, HIT2 = A.exterminio + 0.12;
  const p1 = new V3(), p2 = new V3();
  const anim = (t) => {
    milOfficeLook(room.office, t, 0.75); room.lamp.set(1); room.office.lights(0.55);
    // file 2 lands from above, turning
    const k2 = eOut(lin(t, A.depois, LAND2));
    f2.group.visible = t >= A.depois; f2.group.position.set(F2.x + 0.2 * (1 - k2), room.top + 0.6 * (1 - k2), F2.z + 0.3 * (1 - k2)); f2.group.rotation.set(-0.4 * (1 - k2), F2.ry + 0.5 * (1 - k2), 0.2 * (1 - k2));
    ink1.visible = t >= HIT1; ink2.visible = t >= HIT2;
    // the stamp: comes down on file 1, lifts, travels to file 2, comes down again, lifts out
    f1.group.updateMatrixWorld(true); p1.set(0, f1.top, 0.12).applyMatrix4(f1.group.matrixWorld); p2.set(F2.x, room.top + f2.top, F2.z + 0.12);
    const down = (h, d = 0.22) => 1 - clamp(lin(t, h - d, h) - lin(t, h + 0.06, h + 0.3));
    const at = t < (HIT1 + HIT2) / 2 ? p1 : p2, hh = t < (HIT1 + HIT2) / 2 ? HIT1 : HIT2;
    const travel = sm(t, HIT1 + 0.3, HIT2 - 0.3);
    stamp.visible = (t > HIT1 - 0.9 && t < HIT1 + 0.9) || (t > HIT2 - 0.9);
    stamp.position.set(lerp(p1.x, p2.x, travel), at.y + 0.42 * down(hh), lerp(p1.z, p2.z, travel));
    fill.position.set(-0.2, 1.6, 0.6); fill.color.set("#ffcf8a"); fill.intensity = 0.9;
  };
  const T2 = A.anos50 - 0.25, T3 = A.depois - 0.15;
  S.hero(f1.group, "pasta de arquivo anos 50", { when: (t) => t < T3 + 0.2 || t > LAND2 });
  S.hero(f2.group, "pasta de arquivo baixada", { when: (t) => t > LAND2 + 0.1 });
  S.solid(f1.group, "pasta 1"); S.solid(f2.group, "pasta 2", { when: (t) => t > LAND2 });
  const b1 = envelope([f1.group, room.lamp.group], anim, A.c6, T2), b2 = envelope([f1.group], anim, T2, T3); b2.expandByPoint(new V3(-0.32, room.top + 0.22, -0.82));
  const b3 = envelope([f1.group, f2.group], anim, LAND2, A.c7);
  return (t) => {
    anim(t);
    let p = milTrack(t, [[A.c6, b1, "drop", { from: [0.05, 1.7, 1], rise: 0.35, pull: 1.06 }], [T2, b2, "push", { from: [0.1, 1.5, 1], pull0: 1.3, pull: 1.0 }], [T3, b3, "orbit", { from: [0, 1.35, 1], deg: 22, pull: 1.02 }]], A.c7, 0.55);
    p = CAM.shake(p, t, HIT1, 0.016, 0.35); p = CAM.shake(p, t, HIT2, 0.014, 0.3); CAM.apply(p);
  };
});

// ============================================================ 12–13 · Rio das Pedras, desde os anos 1970: a promessa de expulsar o tráfico
// The model of a community on the investigation table, the entrance sign RIO DAS PEDRAS and the boom gate.
// The houses light up in orange ("uma das mais antigas"); on "expulsar o tráfico" the boom comes down hard.
// Drop → push on the gate.
addScene("riodaspedras", A.c7, A.c8, (S) => {
  const room = milArchive(S, 16, { desk: false, wall: "#463629" });
  const model = makeTerritoryModel({ cols: 6, rows: 5, cell: 0.3, seed: 9, base: 0.1, skip: (i) => i === 3 }); model.group.position.z = -0.5; S.add(model.group);
  const gz = model.BD / 2 - 0.06, gx = 0.15 - 0.17;
  const gate = milGateOnModel(model, gx, gz);
  const sign = new THREE.Group(); sign.position.set(-0.56, model.top, gz); model.group.add(sign);
  const post = pmat("#2b2b2e", { metalness: 0.6, roughness: 0.4 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.44, 10), post); p.position.set(s * 0.46, 0.22, -0.012); sign.add(p); }
  const plate = makePlate("RIO DAS PEDRAS", 1.04, 0.24, { bg: "#1c3a2a", fg: "#f4efe2" }); plate.position.set(0, 0.42, 0.0); sign.add(plate);
  const order = model.cells.map((c, k) => ({ k, d: Math.hypot(c.x - 0.15, c.z - gz) })).sort((a, b) => a.d - b.d);
  const DROP = A.expulsar + 0.15;
  const anim = (t) => {
    milOfficeLook(room.office, t, 0.85); room.office.lights(0.6);
    const k = lin(t, A.antigas - 0.2, A.anos70 + 0.6);
    model.clear(); order.forEach((o, i) => { const a = clamp(k * order.length - i); if (a > 0) model.paint(o.k, MIL_ORANGE, 0.85 * a); }); model.flush();
    gate.set(1 - eOut(lin(t, DROP - 0.12, DROP + 0.12)));
    fill.position.set(0, 1.9, 1.2); fill.color.set("#ffb36b"); fill.intensity = 0.7 + 0.9 * k;
  };
  const T2 = A.promessa - 0.2;
  S.hero(model.group, "maquete da comunidade", { when: (t) => t < T2 - 0.45 });
  S.hero(sign, "placa rio das pedras", { when: (t) => t > T2 + 0.4 }); S.hero(gate.group, "cancela da entrada", { when: (t) => t > T2 + 0.4 });
  const b1 = envelope([model.board, sign], anim, A.c7, T2); b1.expandByPoint(new V3(0, model.top + 0.4, -0.5)); b1.min.z = -0.5 - 0.15;
  const b2 = envelope([sign, gate.group], anim, T2, A.c8); b2.expandByPoint(new V3(0.35, model.top + 0.02, -0.5 + gz - 0.2));
  return (t) => {
    anim(t);
    let p = milTrack(t, [[A.c7, b1, "drop", { from: [0.1, 0.6, 1], rise: 0.14, pull: 1.0 }], [T2, b2, "push", { from: [0.12, 0.42, 1], pull0: 1.3, pull: 1.04 }]], A.c8, 0.55);
    p = CAM.shake(p, t, DROP, 0.018, 0.4); CAM.apply(p);
  };
});

// ============================================================ 14 · 2005: o jornal deu o nome
// The desk under the lamp: a folded newspaper lands on it, the headline MILÍCIAS facing up. Push.
addScene("jornal", A.c8, A.c9, (S) => {
  const room = milArchive(S, 18);
  const np = makeNewspaper({ masthead: "DIÁRIO DA CIDADE", headline: "MILÍCIAS", sub: "GRUPOS DE POLICIAIS DOMINAM BAIRROS", date: "DOMINGO, 20 DE MARÇO DE 2005" }); S.add(np.group);
  const LAND = A.a2005 + 0.35;
  const anim = (t) => {
    milOfficeLook(room.office, t, 0.8); room.lamp.set(1); room.office.lights(0.6);
    const k = eOut(lin(t, A.c8, LAND));
    np.group.position.set(0.05 + 0.15 * (1 - k), room.top + 0.55 * (1 - k), -0.85 + 0.2 * (1 - k)); np.group.rotation.set(-0.6 * (1 - k), 0.06 + 0.4 * (1 - k), 0.25 * (1 - k));
    fill.position.set(0.1, 1.6, 0.4); fill.color.set("#ffd9a0"); fill.intensity = 0.8 + 0.6 * beat(t, A.milicia2, 0.6);
  };
  S.hero(np.group, "jornal com a manchete milícias", { when: (t) => t > LAND });
  const box = envelope([np.group], anim, LAND, A.c9);
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c8, A.c9), { zone: "stage", from: [0.06, 1.7, 1], pull0: 1.35, pull: 1.04 }); p = CAM.shake(p, t, LAND, 0.012, 0.3); CAM.apply(p); };
});

// ============================================================ 15 · 2006: "autodefesa comunitária", "um mal menor"
// A press room: a wooden lectern with a cluster of microphones (no one at it), a dark blue curtain behind,
// and the flashes of the cameras going off on the quote. Orbit → push on the microphones.
function makeMilPressRoom({ seed = 6 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), mat("#ffffff", { map: tileTex(fabricTex("#18233d"), 10, 4), roughness: 0.95 })); cur.position.set(0, 3, -2.2); g.add(cur);
  for (let k = 0; k < 28; k++) { const fold = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 6, 10, 1, true, 0, Math.PI), mat("#1c2846", { roughness: 0.95, side: THREE.DoubleSide })); fold.position.set(-7 + k * 0.5 + 0.25, 3, -2.2); fold.rotation.y = Math.PI / 2 + Math.PI / 2; g.add(fold); }
  const panel = new THREE.Mesh(rbox(3.2, 2.1, 0.06, 0.02), mat("#0f1a33", { roughness: 0.6 })); panel.position.set(0, 1.95, -2.05); g.add(panel);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 0.065), mat("#c9a45a", { metalness: 0.8, roughness: 0.3 })); trim.position.set(0, 0.92, -2.04); g.add(trim);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat("#ffffff", { map: tileTex(fabricTex("#2a1e1c"), 8, 6), roughness: 1 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.002, 2.5); g.add(carpet);
  for (const s of [-1, 1]) { const spot = makeLightShaft([s * 2.6, 5.5, 1.5], [s * 0.5, 0.2, -0.6], { w0: 0.3, w1: 1.6, color: "#fff0d6", opacity: 0.1 }); g.add(spot.group); }
  const pool = makeFloorGlow(2.6, 1.8, { color: "#ffe6c0", opacity: 0.16 }); pool.position.set(0, 0.01, 0); g.add(pool);
  // camera flashes: white bursts at the edges of the frame, behind and in front of the lectern
  const flashes = [];
  for (let k = 0; k < 10; k++) { const s = sprite(BOKEH, 0.8 + r() * 0.8); s.material.color.set("#ffffff"); s.material.blending = THREE.AdditiveBlending; s.material.opacity = 0; s.position.set((r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.9), 0.3 + r() * 0.9, -1.2 + r() * 2.2); g.add(s); flashes.push(s); }
  asBackdrop(g);
  return { group: g, flash(i, k) { const f = flashes[i % flashes.length]; f.material.opacity = Math.max(f.material.opacity, k); }, resetFlashes() { flashes.forEach((f) => { f.material.opacity = 0; }); } };
}
addScene("prefeito", A.c9, A.c10, (S) => {
  const room = makeMilPressRoom(); S.backdrop(room.group);
  const lec = makePressLectern({ mics: 5 }); S.add(lec.group);
  const FL = [A.autodefesa, A.autodefesa + 0.3, A.comunitaria, A.comunitaria + 0.45, A.mal, A.mal + 0.35, A.trafico2, A.trafico2 + 0.25];
  const anim = (t) => {
    floor.visible = false; key.intensity = 1.6; key.color.set("#fff0dc"); hemi.intensity = 0.45; hemi.color.set("#b9c8ff"); hemi.groundColor.set("#151012"); scene.fog.color.set("#0b0f1a");
    room.resetFlashes(); let f = 0; FL.forEach((ft, i) => { const k = beat(t, ft, 0.18); room.flash(i, k); f = Math.max(f, k); });
    fill.position.set(0.4, 1.8, 2.2); fill.color.set("#ffffff"); fill.intensity = 0.6 + 22 * f;
  };
  S.hero(lec.group, "púlpito com microfones");
  const T2 = A.mal - 0.35;
  const b1 = envelope([lec.group], anim, A.c9, T2); const b2 = b1.clone();
  return (t) => { anim(t); CAM.apply(milTrack(t, [[A.c9, b1, "orbit", { from: [0.15, 0.3, 1], deg: 36, pull: 1.04 }], [T2, b2, "push", { from: [-0.12, 0.15, 1], pull0: 1.25, pull: 1.02 }]], A.c10, 0.55)); };
});

// ============================================================ 16 · 2008: jornalistas torturados por sete horas
// A bare concrete room at night: a single bulb on its cord swaying, a barred window high in the wall, and on
// the floor a press camera that fell there, its lens cracked. Nothing else: no violence on screen.
// Drop → push on the cracked lens.
function makeMilBareRoom({ seed = 3 } = {}) {
  const g = new THREE.Group();
  const conc = (u, v) => mat("#ffffff", { map: tileTex(plasterTex("#5b5753"), u, v), roughness: 0.95 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), conc(5, 4)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, 1.5); g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), mat("#ffffff", { map: tileTex(setBrickTex(), 8, 6), roughness: 0.9 })); wall.position.set(0, 2.5, -1.3); g.add(wall);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), conc(4, 2)); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * 3.2, 2.5, 1.5); g.add(sw); }
  // the barred window and the cold light falling from it
  const winM = new THREE.MeshBasicMaterial({ color: "#5d7bb0", toneMapped: false }); const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), winM); win.position.set(0.6, 1.25, -1.29); g.add(win);
  for (let k = -2; k <= 2; k++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), mat("#1a1a1a", { metalness: 0.5 })); bar.position.set(0.6 + k * 0.17, 1.25, -1.27); g.add(bar); }
  const shaft = makeLightShaft([0.6, 1.25, -1.2], [0.2, 0.02, 0.4], { w0: 0.7, w1: 1.4, color: "#7d9ad0", opacity: 0.14 }); g.add(shaft.group);
  const motes = makeSetMotes(90, [[-1, 0.2, -2], [2, 3, 0.5]], { color: "#cfe0ff", seed: seed + 4, opacity: 0.35 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t) { motes.update(t); } };
}
addScene("batan", A.c10, A.c11, (S) => {
  const room = makeMilBareRoom(); S.backdrop(room.group);
  const cam = makePressCamera({ s: 2.6, strap: false }); cam.group.position.set(0.05, 0, -0.1); cam.group.rotation.y = 0.55; S.add(cam.group);
  // the bare bulb on its cord, swaying (backdrop): it is the light of the room
  const bulbG = new THREE.Group(); bulbG.position.set(0.15, 3.2, -0.4); S.backdrop(bulbG);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.6, 6), mat("#111")); cord.position.y = -0.8; bulbG.add(cord);
  const bulbM = new THREE.MeshBasicMaterial({ color: "#ffe2a8", toneMapped: false }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), bulbM); bulb.position.y = -1.65; bulbG.add(bulb);
  const halo = sprite(BOKEH, 0.9); halo.material.color.set("#ffcf8a"); halo.material.blending = THREE.AdditiveBlending; halo.position.y = -1.65; bulbG.add(halo);
  asBackdrop(bulbG);
  const bp = new V3();
  const anim = (t) => {
    floor.visible = false; room.update(t); key.intensity = 0.7; key.color.set("#b8c8ff"); hemi.intensity = 0.28; hemi.color.set("#9fb2d8"); hemi.groundColor.set("#120f0e"); scene.fog.color.set("#08090d");
    bulbG.rotation.z = 0.12 * Math.sin(t * 1.6); bulbG.rotation.x = 0.05 * Math.sin(t * 1.1);
    bulbG.updateMatrixWorld(true); bulb.getWorldPosition(bp);
    const flick = 1 - 0.5 * beat(t, A.torturaram, 0.25) - 0.4 * beat(t, A.sete + 0.1, 0.2);
    bulbM.color.set("#ffe2a8").multiplyScalar(flick); halo.material.opacity = 0.8 * flick;
    fill.position.copy(bp); fill.color.set("#ffcf8a"); fill.intensity = 3.2 * flick;
  };
  S.hero(cam.group, "câmera fotográfica caída");
  const T2 = A.sete - 0.45;
  const b1 = envelope([cam.group], anim, A.c10, T2); b1.expandByScalar(0.05);
  const b2 = envelope([cam.group], anim, T2, A.c11);
  return (t) => { anim(t); CAM.apply(milTrack(t, [[A.c10, b1, "drop", { from: [0.35, 0.75, 1], rise: 0.25, pull: 1.06 }], [T2, b2, "push", { from: [0.5, 0.45, 1], pull0: 1.25, pull: 1.04 }]], A.c11, 0.5)); };
});

// ============================================================ 17 · a CPI das Milícias (foto da Alerj)
// A courtroom: the photo of the Palácio Tiradentes (seat of the Rio state assembly, where the inquiry
// ran) spins in on its frame. Orbit with a slow zoom on the photo.
addScene("cpi", A.c11, A.c12, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 7, seed: 5 }); S.backdrop(court.group);
  const fr = makePhotoFrame("palacio", { w: 2.4, name: "ALERJ · CPI 2008" }); S.add(fr.group);
  const anim = (t) => {
    floor.visible = false; court.update(t); key.intensity = 1.9; key.color.set("#ffe2c0"); hemi.intensity = 0.5; scene.fog.color.set("#120d0a");
    fr.frame.rotation.y = 1.5 * (1 - eOut(lin(t, A.c11, A.c11 + 0.6))); popIn(fr.group, t, A.c11 - 0.05, 0.45); fr.zoom(1 + 0.14 * lin(t, A.c11 + 0.4, A.c12));
    fill.position.set(0, 2.2, 2.0); fill.color.set("#ffd9a8"); fill.intensity = 0.8;
  };
  S.hero(fr.group, "porta-retrato alerj", { when: (t) => t > A.c11 + 0.5 });
  const box = envelope([fr.group], anim, A.c11 + 0.5, A.c12);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c11, A.c12), { zone: "stage", from: [0.1, 0.18, 1], deg: 26, pull: 1.04 })); };
});

// ============================================================ 18 · mais de duzentos indiciados, entre policiais e políticos
// The same courtroom: on a table, a pile of case files marked INDICIADO grows file by file. Crane → push.
addScene("indiciados", A.c12, A.c13, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 7, seed: 5 }); S.backdrop(court.group);
  const desk = makeMilDesk({ w: 1.6, d: 1.0 }); desk.group.position.z = -0.3; S.add(desk.group);
  const pile = makeCaseFilePile(18, "INDICIADO", { w: 0.5, d: 0.66, t: 0.034 }); pile.group.position.set(0, desk.top, -0.3); S.add(pile.group);
  const anim = (t) => {
    floor.visible = false; court.update(t); key.intensity = 1.9; key.color.set("#ffe2c0"); hemi.intensity = 0.5; scene.fog.color.set("#120d0a");
    pile.set(0.12 + 0.88 * sm(t, A.duzentos - 0.3, A.politicos + 0.2));
    fill.position.set(0, 2.0, 1.4); fill.color.set("#ffd9a8"); fill.intensity = 0.9;
  };
  S.hero(pile.group, "pilha de processos indiciado"); S.solid(pile.group, "pilha", { restsOn: ["mesa"] }); S.solid(desk.group, "mesa");
  const T2 = A.policiais2 - 0.3;
  const b1 = envelope([pile.group], anim, A.c12, T2), b2 = envelope([pile.group], anim, T2, A.c13);
  return (t) => { anim(t); CAM.apply(milTrack(t, [[A.c12, b1, "crane", { from: [0.15, 0.9, 1], rise: 0.3, pull: 1.12 }], [T2, b2, "push", { from: [-0.1, 1.2, 1], pull0: 1.2, pull: 1.04 }]], A.c13, 0.5)); };
});

// ============================================================ 19 · 2012: milícia vira crime no Código Penal, até oito anos
// The courtroom: the Penal Code lies on the bench; "ART. 288-A" is printed on its cover on "virou crime"; on
// "prisão" the gavel comes down. Push → reveal.
addScene("lei", A.c13, A.c14, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 7, seed: 6 }); S.backdrop(court.group);
  const desk = makeMilDesk({ w: 2.0, d: 1.1 }); desk.group.position.z = -0.4; S.add(desk.group);
  const book = makeLawBook({ w: 1.0, d: 1.2, t: 0.16, color: "#5c1b1b", title: "CÓDIGO PENAL", emblem: false }); book.group.position.set(-0.25, desk.top, -0.42); book.group.rotation.y = 0.06; S.add(book.group);
  const art = book.print("ART. 288-A", 0.66, 0.16, 0.08, { bg: "#f2e7c9", fg: "#5c1b1b" });
  const gavel = makeJudgeGavel({ s: 0.62 }); gavel.group.position.set(0.48, desk.top, -0.3); gavel.group.rotation.y = -0.5; S.add(gavel.group);
  const ART = A.crime - 0.1, HIT = A.prisao + 0.06;
  const anim = (t) => {
    floor.visible = false; court.update(t); key.intensity = 1.9; key.color.set("#ffe2c0"); hemi.intensity = 0.5; scene.fog.color.set("#120d0a");
    const k = pop(t, ART, 0.35); art.visible = k > 0.01; art.scale.setScalar(Math.max(0.0001, k));
    gavel.strike(eOut(lin(t, HIT - 0.18, HIT)));
    fill.position.set(0, 1.8, 1.0); fill.color.set("#ffd9a8"); fill.intensity = 0.9 + 1.2 * beat(t, HIT, 0.4);
  };
  const T2 = A.ate - 0.3;
  S.hero(book.group, "código penal"); S.hero(gavel.group, "martelo do juiz");
  const b1 = envelope([book.group, gavel.group], anim, A.c13, T2), b2 = envelope([book.group, gavel.group], anim, T2, A.c14);
  return (t) => {
    anim(t);
    let p = milTrack(t, [[A.c13, b1, "push", { from: [0.05, 1.55, 1], pull0: 1.12, pull: 1.0 }], [T2, b2, "orbit", { from: [0.1, 1.1, 1], deg: 26, pull: 1.0 }]], A.c14, 0.5);
    p = CAM.shake(p, t, HIT, 0.02, 0.4); CAM.apply(p);
  };
});

// ============================================================ 20–21 · em 16 anos, quase cinco vezes; hoje a milícia recua e o CV avança
// The map room: a big model of the region. A small orange patch (the militias) and a red one (the CV). On
// "dezesseis anos" the orange spreads into the empty areas until it is almost five times bigger; on
// "recuando" its edge by the red goes dark, and on "avança" the red takes those houses and spreads. Reveal → orbit.
addScene("mapa", A.c14, A.c15, (S) => {
  const room = milArchive(S, 20, { desk: false, wall: "#3e3128" });
  const model = makeTerritoryModel({ cols: 14, rows: 10, cell: 0.17, seed: 21, base: 0.1 }); model.group.position.z = -0.45; S.add(model.group);
  const C = model.cells;
  const dist = (c, i, j) => Math.hypot(c.i - i, c.j - j);
  const cvCells = C.map((c, k) => ({ k, d: dist(c, 12.5, 1) })).sort((a, b) => a.d - b.d);
  const CV0 = cvCells.slice(0, 10).map((o) => o.k);
  const cvSet = new Set(CV0);
  const milOrder = C.map((c, k) => ({ k, d: dist(c, 2.5, 7.5) })).filter((o) => !cvSet.has(o.k)).sort((a, b) => a.d - b.d);
  const M0 = 6, M1 = 29;
  const MIL = milOrder.slice(0, M1).map((o) => o.k);
  // the militia houses nearest the CV are the ones it loses (2 of 29, about 7 %)
  const lost = MIL.slice().sort((a, b) => dist(C[a], 12.5, 1) - dist(C[b], 12.5, 1)).slice(0, 2);
  const cvGrow = cvCells.filter((o) => !CV0.includes(o.k) && !MIL.includes(o.k)).slice(0, 8).map((o) => o.k);
  const CVNEXT = lost.concat(cvGrow);
  const GROW0 = A.dezesseis - 0.1, GROW1 = A.quintuplicou + 0.4, LOSE0 = A.recuando - 0.2, LOSE1 = A.recuando + 0.6, CV1 = A.comando - 0.1, CV2 = A.avanca + 0.4;
  const anim = (t) => {
    milOfficeLook(room.office, t, 0.85); room.office.lights(0.5); room.office.windows(0.9);
    model.clear();
    const nM = lerp(M0, M1, sm(t, GROW0, GROW1));
    MIL.forEach((k, i) => { let a = clamp(nM - i); if (lost.includes(k)) a *= 1 - lin(t, LOSE0, LOSE1); if (a > 0) model.paint(k, MIL_ORANGE, 0.9 * a); });
    CV0.forEach((k) => model.paint(k, MIL_CV, 0.9));
    const nC = CVNEXT.length * lin(t, CV1, CV2); CVNEXT.forEach((k, i) => { const a = clamp(nC - i); if (a > 0) model.paint(k, MIL_CV, 0.9 * a); });
    model.flush();
    fill.position.set(0, 2.2, 1.4); fill.color.set(t < LOSE0 ? "#ffb36b" : "#ff7a6a"); fill.intensity = 0.6 + 0.8 * sm(t, GROW0, GROW1);
  };
  S.hero(model.group, "maquete da região");
  const box = envelope([model.board], anim, A.c14, A.c15); box.expandByPoint(new V3(0, model.top + 0.2, -0.45));
  return (t) => { anim(t); CAM.apply(milTrack(t, [[A.c14, box, "reveal", { from: [0.0, 2.1, 1], pull0: 1.15, pull: 1.0 }], [A.hoje - 0.2, box, "orbit", { from: [0.0, 1.8, 1], deg: 24, pull: 1.0 }]], A.c15, 0.6)); };
});

// ============================================================ 22 · o que é pior: a milícia ou o tráfico?
// Back in the alley at night: two black plinths, MILÍCIA with the two-faced badge and TRÁFICO with a tyre
// barricade. Reveal → push on the badge (it turns to its gold face on "devia proteger") → truck to the
// barricade → orbit on both.
addScene("pergunta", A.c15, A.end, (S) => {
  const { alley } = milStreet(S, 8);
  const L = makeLabelPlinth("MILÍCIA", { w: 1.1, h: 0.5, d: 0.8, fg: MIL_ORANGE }); L.group.position.set(-0.72, 0, 1.0); S.add(L.group);
  const R = makeLabelPlinth("TRÁFICO", { w: 1.1, h: 0.5, d: 0.8, fg: "#ff4b3e" }); R.group.position.set(0.72, 0, 1.0); S.add(R.group);
  const medal = makeShieldBadge({ h: 0.56 }); medal.group.position.set(-0.72, L.top, 1.0); S.add(medal.group); medal.plate.userData.plate.detail = true;
  const bar = makeTyreBarricade(); bar.group.scale.setScalar(0.52); bar.group.position.set(0.72, R.top, 0.98); S.add(bar.group);
  const anim = (t) => {
    milAlleyLook(alley, t, 0.75);
    medal.spin(Math.PI - Math.PI * sm(t, A.proteger - 0.5, A.proteger + 0.3) + (t > A.comenta - 0.4 ? 0.8 * (t - A.comenta + 0.4) : 0) - 0.3);
    fill.position.set(0, 1.5, 2.4); fill.color.set("#ffd2a0"); fill.intensity = 1.2;
  };
  const T2 = A.milicia3 - 0.3, T3 = A.ou - 0.25, T4 = A.comenta - 0.4;
  const both = (t) => t < T2 - 0.45 || t > T4 + 0.45;
  S.hero(L.group, "pedestal milícia", { when: (t) => both(t) || (t > T2 + 0.4 && t < T3 - 0.45) }); S.hero(medal.group, "distintivo", { when: (t) => both(t) || (t > T2 + 0.4 && t < T3 - 0.45) });
  S.hero(R.group, "pedestal tráfico", { when: (t) => both(t) || t > T3 + 0.4 }); S.hero(bar.group, "barricada de pneus", { when: (t) => both(t) || t > T3 + 0.4 });
  S.solid(medal.group, "medalha", { restsOn: ["pedestal m"] }); S.solid(L.group, "pedestal m"); S.solid(bar.group, "barricada", { restsOn: ["pedestal t"] }); S.solid(R.group, "pedestal t");
  const bAll = envelope([L.group, R.group, medal.group, bar.group], anim, A.c15, A.end), bL = envelope([L.group, medal.group], anim, T2, T3), bR = envelope([R.group, bar.group], anim, T3, T4);
  return (t) => { anim(t); milFar(milTrack(t, [[A.c15, bAll, "reveal", { from: [0.0, 0.35, 1], pull0: 1.15, pull: 1.02 }], [T2, bL, "push", { from: [0.12, 0.3, 1], pull0: 1.3, pull: 1.1 }], [T3, bR, "truck", { from: [0.0, 0.32, 1], side: 0.25, pull: 1.1 }], [T4, bAll, "orbit", { from: [0.0, 0.35, 1], deg: 22, pull: 1.04 }]], A.end, 0.55)); };
});
