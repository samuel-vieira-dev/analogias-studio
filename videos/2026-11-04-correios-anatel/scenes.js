// ============================================================================
// videos/2026-11-04-correios-anatel/scenes.js
// Correios e Anatel sem dinheiro, por motivos opostos. Gancho: "Os Correios estão perdendo quase um bilhão
// de reais por mês." → a caixa de encomenda furada no galpão, o dinheiro escorrendo, o calendário virando
// → a sala de servidores da Anatel que apaga → os dois porta-retratos (estatal e agência) → a blusinha
// comprada no celular, a campainha, a van da própria loja e a caixa de correio com teia → a agência em
// Marajó e a estrada de terra → nove de cada dez reais acorrentados → o chão que afunda (2024 × 2025) → os
// paletes do empréstimo tapando o buraco → o carimbo GARANTIA DA UNIÃO → a Anatel: a coluna de R$ 3,4 bi
// → analogia: o caixa da loja e o cofre do dono (tubo de vidro; 94 de 100 moedas vão pro cofre, 6 voltam)
// → ANATEL e TESOURO → a tampa com cadeado sobre quase um quinto das 6 → o centro de dados pela metade e
// o cartão do Baigorri → qual problema é pior? Números e fontes em fatos.md; nenhum lado tomado.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / caTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  correios: 0.28, bilhao: 2.4, mes: 3.72, c1: 4.38,
  anatel: 4.64, arrecada: 5.36, naoPagar: 6.94, centro: 8.36, c2: 9.48,
  estatal: 9.8, agencia: 10.92, semDinheiro: 11.88, motivos: 13.22, opostos: 13.66, c3: 14.42,
  imagina: 14.54, compra: 15.58, blusinha: 16.04, aplicativo: 16.62, c4: 17.3,
  quem: 17.4, bate: 17.54, porta: 18.16, cadaVez: 18.72, entregador: 19.9, loja: 21.08, carta: 21.74, ninguem: 22.68, manda: 23.04, c5: 23.52,
  carteiro: 24.14, todo: 25.46, brasil: 26.18, ate: 27.0, prejuizo: 27.98, c6: 28.44,
  nove: 28.84, dez: 29.84, fixos: 31.36, naoCaem: 32.16, encomenda: 33.08, some: 33.42, c7: 34.14,
  oito: 34.92, a2025: 37.32, pior: 38.9, historia: 39.52, c8: 40.06,
  tapar: 40.26, buraco: 40.74, emprestimo: 41.56, doze: 42.36, dezembro: 43.56, sete: 44.54, autorizados: 44.84, c9: 46.08,
  garante: 46.24, uniao: 47.22, pagarem: 48.1, tesouro: 49.12, c10: 49.52,
  anatel2: 49.96, contrario: 50.86, a2024: 51.56, arrecadou: 52.86, tres: 53.96, bilhoes: 54.38, c11: 55.08,
  pensa: 55.18, caixa: 55.66, dia: 56.88, passa: 57.62, dinheiro: 57.96, mao: 58.64, tudo: 59.6, cofre: 60.3, dono: 60.84, c12: 61.3,
  comprar: 61.42, bobina: 62.06, maquininha: 62.58, pedir: 63.64, dono2: 64.58, devolve: 64.82, seis: 65.52, cem: 66.56, c13: 66.88,
  anatel3: 67.28, igual: 67.9, quase: 68.4, tesouro2: 69.66, voltam: 70.38, seisPct: 71.04, contas: 72.44, c14: 72.94,
  esseAno: 73.2, meta: 74.52, bloqueou: 75.84, quinto: 77.2, c15: 78.12,
  faltam: 78.22, trinta: 78.64, centro2: 79.8, c16: 81.28, presidente: 81.56, desbloqueio: 83.4, c17: 84.04,
  qual: 84.14, pior2: 84.86, gastar: 85.08, ganha: 86.5, ou: 86.92, ganhar: 87.3, gastar2: 88.56, end: 91.1,
};
const CA_PINK = "#e85aa6", CA_INK = "#1c1410";

// ---------------------------------------------------------------- shared helpers
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function caTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
function caFar(p, far = 90) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 6); scene.fog.far = Math.max(scene.fog.far, far); }
const CA_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#03050c"); g.addColorStop(0.5, "#0b1328"); g.addColorStop(0.8, "#1a2036"); g.addColorStop(1, "#231d24"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function caWarehouseLook(wh, t, k = 1) {
  floor.visible = false; wh.update(t); scene.background = BACKDROP;
  key.intensity = 1.6 * k; key.color.set("#ffd6b0"); hemi.intensity = 0.45; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#15100c"); scene.fog.color.set("#0e0c0c");
}
function caOfficeLook(set, t, k = 1) {
  floor.visible = false; set.update(t); scene.background = BACKDROP;
  key.intensity = 1.7 * k; key.color.set("#ffd6b0"); hemi.intensity = 0.42; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c"); scene.fog.color.set("#120e0c");
}
function caDataLook(dc, t, power) {
  floor.visible = false; dc.update(t); dc.power(power); scene.background = CA_NIGHT;
  key.intensity = 0.7 + 0.6 * power; key.color.set("#c4dcff"); hemi.intensity = 0.28 + 0.2 * power; hemi.color.set("#9fc4ff"); hemi.groundColor.set("#0c0f14");
  scene.environmentIntensity = 0.4; scene.fog.color.set("#070a10");
}
function caStreetLook(alley, t) {
  floor.visible = false; scene.background = CA_NIGHT; alley.update(t); alley.siren(0, t);
  key.intensity = 0.8; key.color.set("#a9bcff"); hemi.intensity = 0.32; hemi.color.set("#7088c4"); hemi.groundColor.set("#120f10");
  scene.environmentIntensity = 0.3; scene.fog.color.set("#0b0f18");
}
function caShopLook(shop, t, k = 1) {
  floor.visible = false; shop.update(t); scene.background = BACKDROP;
  key.intensity = 1.6 * k; key.color.set("#ffe2c0"); hemi.intensity = 0.5; hemi.color.set("#ffe8cc"); hemi.groundColor.set("#1a120c"); scene.fog.color.set("#140e0a");
}
// Low wooden pallet (deck boards on three stringers). Origin: floor centre. API { group, top }
function caWoodPallet(w = 1.3, d = 1.0) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#9a7448"), roughness: 0.75 });
  for (const z of [-1, 0, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(w, 0.09, 0.1), wood); st.position.set(0, 0.045, z * (d / 2 - 0.05)); g.add(st); }
  for (let i = 0; i < 7; i++) { const bd = new THREE.Mesh(new THREE.BoxGeometry(w / 7 - 0.02, 0.025, d), wood); bd.position.set(-w / 2 + (i + 0.5) * (w / 7), 0.1025, 0); g.add(bd); }
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, top: 0.115 };
}
// Dark wooden desk. Origin floor centre; returns { group, top }.
function caDesk({ w = 2.2, d = 1.1, top = 0.75 } = {}) {
  const g = new THREE.Group();
  const mt = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 37 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; g.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); g.add(l); }
  return { group: g, top };
}

// Banker's desk lamp: brass base and stem, a green glass shade, the bulb glowing under it and its pool of
// light on the desk. Origin: base on the desk; the shade reaches towards +x. API { group, set(k) }
function caDeskLamp() {
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

// ---------------------------------------------------------------- the leaking parcel (hook and question)
// A shipping box on a pallet with a torn hole low on its front: bundles of banknotes slide out of the hole
// one after another and pile up on the floor in front. Origin: floor centre of the pallet.
// API { group, parcel, money (group of the bundles), update(t, t0, rate) }
function caLeakyParcel({ s = 1, n = 24, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const pal = caWoodPallet(1.3 * s, 1.0 * s); g.add(pal.group);
  const P = makeParcel({ w: 1.2 * s, h: 0.8 * s, d: 0.9 * s, label: "ENCOMENDA" }); P.group.position.y = pal.top; g.add(P.group);
  // the torn hole: a dark irregular opening and four torn flaps of cardboard bent outwards
  const hx = -0.26 * s, hy = pal.top + 0.22 * s, hz = 0.45 * s + 0.006, hr = 0.17 * s;
  // the hole: a ragged opening shading from torn cardboard fibres at the rim to black inside (depth)
  const holeTex = cachedTex("caHole", () => { const c = makeCanvas(128, 128), x = c.getContext("2d"), gr = x.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "#000000"); gr.addColorStop(0.55, "#0c0704"); gr.addColorStop(0.85, "#2e1a0c"); gr.addColorStop(1, "#5a3a20"); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return texFrom(c); });
  const ragged = (R, k) => { const sh = new THREE.Shape(); for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI * 2, rr = R * (0.82 + k * r()); const px = Math.cos(a) * rr * 1.25, py = Math.sin(a) * rr; i ? sh.lineTo(px, py) : sh.moveTo(px, py); } const geo = new THREE.ShapeGeometry(sh), pos = geo.attributes.position, uv = []; for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) / (2.9 * R) + 0.5, pos.getY(i) / (2.4 * R) + 0.5); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); return geo; };
  const rim = new THREE.Mesh(ragged(hr * 1.16, 0.3), mat("#d9b58a", { roughness: 0.95 })); rim.position.set(hx, hy, hz - 0.001); g.add(rim);
  const hole = new THREE.Mesh(ragged(hr, 0.25), mat("#ffffff", { map: holeTex, roughness: 1 })); hole.position.set(hx, hy, hz); g.add(hole);
  const stuck = makeCashBundle({ w: 0.36 * s, d: 0.17 * s, h: 0.06 * s }); stuck.position.set(hx + 0.03 * s, hy - 0.07 * s, hz + 0.02 * s); stuck.rotation.set(0.5, 1.35, 0.15); g.add(stuck);
  const flapM = mat("#ffffff", { map: cardboardTex(), roughness: 0.85, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4, fl = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.05 * s, 0), new THREE.Vector2(0.05 * s, 0), new THREE.Vector2(0, 0.09 * s)])), flapM);
    const piv = new THREE.Group(); piv.position.set(hx + Math.cos(a) * hr * 1.2, hy + Math.sin(a) * hr * 0.95, hz + 0.002); piv.rotation.z = a - Math.PI / 2; g.add(piv);
    fl.rotation.x = 0.7; piv.add(fl);
  }
  // the bundles
  const money = new THREE.Group(); g.add(money);
  const items = [];
  for (let i = 0; i < n; i++) {
    const b = makeCashBundle({ w: 0.36 * s, d: 0.17 * s, h: 0.06 * s }); money.add(b);
    const layer = Math.floor(i / 7);
    items.push({ b, x0: hx + (r() - 0.5) * 0.08 * s, rest: new V3(hx + (r() - 0.5) * 0.7 * s, 0.0275 * s + layer * 0.05 * s, 0.45 * s + 0.28 * s + r() * 0.42 * s), ry: (r() - 0.5) * 2.4, rz: (r() - 0.5) * 0.12, spin: (r() - 0.5) * 3 });
  }
  function update(t, t0 = 0.2, rate = 0.17) {
    items.forEach((it, i) => {
      const ts = t0 + i * rate, kOut = lin(t, ts, ts + 0.18), kFall = eOut(lin(t, ts + 0.18, ts + 0.5));
      it.b.visible = t >= ts;
      if (!it.b.visible) return;
      const out = new V3(it.x0, hy - 0.02 * s, hz - 0.06 * s + 0.22 * s * kOut);
      const p = out.clone().lerp(it.rest, kFall); p.y = lerp(out.y, it.rest.y, kFall * kFall) + 0.12 * s * Math.sin(Math.PI * kFall) * (1 - kFall);
      it.b.position.copy(p); it.b.rotation.set(0, lerp(0, it.ry, kFall) + it.spin * Math.sin(Math.PI * kFall) * 0.3, lerp(0.35, it.rz, kFall) * (kOut > 0 ? 1 : 0));
    });
  }
  return { group: g, parcel: P.group, money, update, top: pal.top + P.top };
}

// ============================================================ 1 · gancho: quase um bilhão por mês
// The sorting warehouse at night: a parcel on a pallet, a torn hole in its front, banknotes pouring out
// onto the floor; beside it, a desk calendar on a smaller box flips JAN → JUN. Push.
addScene("furo", 0, A.c1, (S) => {
  const wh = makeWarehouseSet({ wallZ: -3.6, clear: 6, seed: 11 }); S.backdrop(wh.group);
  const lp = caLeakyParcel(); lp.group.position.set(0.0, 0, 0); S.add(lp.group);
  // the desk calendar stands on the parcel's lid, flipping through the months of the half-year
  const cal = makeFlipCalendar(["JAN", "FEV", "MAR", "ABR", "MAI", "JUN"], { w: 0.66, h: 0.6 }); cal.group.position.set(-0.22, lp.top, -0.05); cal.group.rotation.y = 0.12; S.add(cal.group);
  const anim = (t) => {
    caWarehouseLook(wh, t); wh.lamps(beat(t, A.bilhao - 0.1, 0.9), "#ff6a4a");
    lp.update(t, 0.15, 0.165);
    // each page swings up towards the lens at the end of its month and is gone (it never rises into the title)
    const p = 5 * lin(t, 0.5, 3.9), i = Math.min(5, Math.floor(p)), f = p - i; cal.show(i, i >= 5 ? 0 : 0.62 * clamp((f - 0.6) / 0.4));
    fill.position.set(0.6, 1.8, 2.0); fill.color.set("#ffc890"); fill.intensity = 1.2 + 1.2 * beat(t, A.bilhao, 0.6);
  };
  S.hero(lp.group, "caixa de encomenda furada com dinheiro saindo"); S.hero(cal.group, "calendário de mesa virando os meses");
  S.solid(lp.parcel, "caixa"); S.solid(cal.group, "calendário", { restsOn: ["caixa"] });
  // frame the parcel, the pile and the calendar at rest: a page swinging over the top is a quick motion
  const box = new THREE.Box3(new V3(-0.66, 0.0, -0.45), new V3(0.7, lp.top + 0.7, 0.95));
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.16, 0.2, 1], pull0: 1.2, pull: 1.0 }); p = CAM.shake(p, t, A.bilhao, 0.008, 0.5); CAM.apply(p); };
});

// ============================================================ 2 · e a Anatel pode não pagar o centro de dados
// The data center at night: three server racks in front of the cold aisle, LEDs blinking. On "não pagar"
// the LEDs flicker and die rack by rack, the aisle lights dim and a red alarm turns at the end. Truck → push.
function caDataRoom(S, seed) {
  const dc = makeDataCenterSet({ z0: -1.0, seed }); S.backdrop(dc.group);
  const row = new THREE.Group(); S.add(row);
  const racks = [-0.7, 0, 0.7].map((x, i) => { const rk = makeServerRack({ seed: seed + i * 7 }); rk.group.position.set(x, 0, 0); row.add(rk.group); return rk; });
  return { dc, row, racks };
}
addScene("servidores", A.c1, A.c2, (S) => {
  const D = caDataRoom(S, 5);
  const F0 = A.naoPagar - 0.15;
  const pw = (t, i) => 1 - 0.92 * sm(t, F0 + i * 0.22, F0 + 0.55 + i * 0.22);
  const anim = (t) => {
    const P = 1 - 0.8 * sm(t, F0, F0 + 1.1);
    caDataLook(D.dc, t, P);
    D.racks.forEach((rk, i) => rk.leds(t, pw(t, i)));
    fill.position.set(0, 1.6, 1.8); fill.color.set(P > 0.6 ? "#8fd4ff" : "#ff5a4a"); fill.intensity = 0.8;
  };
  const T2 = A.naoPagar - 0.4;
  S.hero(D.row, "fila de racks de servidores", { when: (t) => t < T2 - 0.45 });
  S.hero(D.racks[1].group, "rack de servidores", { when: (t) => t > T2 + 0.4 });
  const bRow = envelope([D.row], anim, A.c1, A.c2), bMid = envelope([D.racks[1].group], anim, A.c1, A.c2);
  return (t) => {
    anim(t);
    let p = caTrack(t, [[A.c1, bRow, "truck", { from: [0.25, 0.12, 1], side: 0.3, pull: 1.04 }], [T2, bMid, "push", { from: [-0.18, 0.08, 1], pull0: 1.3, pull: 1.04 }]], A.c2, 0.5);
    p = CAM.shake(p, t, A.naoPagar + 0.1, 0.01, 0.5); caFar(p, 40);
  };
});

// ============================================================ 3 · uma estatal e uma agência do governo, por motivos opostos
// The office at night: two photo frames on pedestals, the Correios building (ESTATAL) and the Anatel
// headquarters (AGÊNCIA), each spinning in on its word; on "opostos" they turn away from each other. Orbit.
addScene("fotos", A.c2, A.c3, (S) => {
  const office = makeOfficeSet({ wallZ: -1.7, clear: 2.2, wall: "#5a4636", seed: 6 }); S.backdrop(office.group);
  const fC = makePhotoFrame("correios-predio", { w: 1.35 }); fC.group.position.set(-0.78, 0, 0); S.add(fC.group);
  const fA = makePhotoFrame("anatel-sede", { w: 1.35 }); fA.group.position.set(0.78, 0, 0); S.add(fA.group);
  // name plates bigger than the frame's own (they must read at this size): brass, across the base front
  [[fC, "ESTATAL"], [fA, "AGÊNCIA"]].forEach(([f, name]) => { const p = makePlate(name, 1.35 * 0.7 * 0.97, 0.27, { bg: "#c9a45a", fg: "#1c1410" }); p.position.set(0, 0.16, 0.352); f.group.add(p); });
  const IN_C = A.estatal - 0.35, IN_A = A.agencia - 0.35, OPP = A.opostos - 0.2;
  const anim = (t) => {
    caOfficeLook(office, t, 1.0); office.lights(1); office.windows(1);
    popIn(fC.group, t, IN_C, 0.45); fC.frame.rotation.y = 1.5 * (1 - eOut(lin(t, IN_C, IN_C + 0.6)));
    popIn(fA.group, t, IN_A, 0.45); fA.frame.rotation.y = -1.5 * (1 - eOut(lin(t, IN_A, IN_A + 0.6)));
    const o = 0.42 * eOut(lin(t, OPP, OPP + 0.5));
    fC.group.rotation.y = o; fA.group.rotation.y = -o;
    fC.zoom(1 + 0.14 * lin(t, IN_C, A.c3)); fA.zoom(1 + 0.12 * lin(t, IN_A, A.c3));
    fill.position.set(0, 2.2, 2.0); fill.color.set("#ffd9a8"); fill.intensity = 0.9;
  };
  S.hero(fC.group, "porta-retrato prédio dos correios", { when: (t) => t > IN_C + 0.5 && (t < IN_A - 0.1 || t > IN_A + 0.6) });
  S.hero(fA.group, "porta-retrato sede da anatel", { when: (t) => t > IN_A + 0.5 });
  const bC = envelope([fC.group], anim, IN_C + 0.6, IN_A + 0.3), box = envelope([fC.group, fA.group], anim, IN_A + 0.6, A.c3); box.expandByScalar(0.05);
  return (t) => { anim(t); CAM.apply(caTrack(t, [[A.c2, bC, "push", { from: [0.15, 0.2, 1], pull0: 1.3, pull: 1.04 }], [IN_A + 0.1, box, "orbit", { from: [0.0, 0.2, 1], deg: 28, pull: 1.02 }]], A.c3, 0.5)); };
});

// ============================================================ 4 · imagina: você compra uma blusinha no aplicativo
// A bedside table at night (wall, window on the city, a lamp): the phone on a dock shows a shop page with
// the polka-dot blouse; a finger taps COMPRAR and the button turns green. Drop.
function caBlousePath(x) {
  x.beginPath(); x.moveTo(-0.27, 0); x.quadraticCurveTo(0, -0.04, 0.27, 0); x.lineTo(0.25, 0.3); x.lineTo(0.29, 0.55); x.lineTo(0.5, 0.47); x.lineTo(0.58, 0.6); x.lineTo(0.33, 0.8);
  x.lineTo(0.14, 0.82); x.quadraticCurveTo(0, 0.66, -0.14, 0.82); x.lineTo(-0.33, 0.8); x.lineTo(-0.58, 0.6); x.lineTo(-0.5, 0.47); x.lineTo(-0.29, 0.55); x.lineTo(-0.25, 0.3); x.closePath();
}
function caCenterText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }
// Shop app page: the blouse, its price and the buy button (bought 0..1 turns it green, PEDIDO FEITO).
function caPaintShop(x, bought) {
  x.fillStyle = "#f6f3ee"; x.fillRect(0, 0, 720, 1500);
  x.fillStyle = ORANGE; x.fillRect(0, 0, 720, 170); caCenterText(x, "LOJA", 360, 96, "900 64px Inter", "#ffffff");
  x.fillStyle = "#fde3ea"; roundRect(x, 40, 200, 640, 520, 30); x.fill();
  x.save(); x.translate(360, 660); x.scale(500, -500); caBlousePath(x); x.fillStyle = CA_PINK; x.fill(); x.clip(); x.fillStyle = "#ffffff";
  for (let i = -7; i <= 7; i++) for (let j = 0; j <= 9; j++) { x.beginPath(); x.arc(i * 0.1 + (j % 2) * 0.05, j * 0.1, 0.02, 0, Math.PI * 2); x.fill(); }
  x.restore();
  x.textAlign = "left"; x.textBaseline = "middle"; x.fillStyle = "#4a4440"; x.font = "700 52px Inter"; x.fillText("Blusinha", 50, 800);
  x.fillStyle = CA_INK; x.font = "900 104px Inter"; x.fillText("R$ 59,90", 46, 900);
  x.fillStyle = "#2a7a4a"; x.font = "700 42px Inter"; x.fillText("Entrega amanhã", 50, 1000);
  const k = clamp(bought);
  x.fillStyle = k > 0.5 ? GREEN : ORANGE; roundRect(x, 40, 1300, 640, 140, 70); x.fill();
  caCenterText(x, k > 0.5 ? "PEDIDO FEITO" : "COMPRAR", 360, 1372, "900 62px Inter", "#ffffff");
}
function caScreenPlate(ph, text, frac) { ph.screen.userData.plate = { text, w: 0.74, h: 1.56, depth: 0.0, frac, detail: false }; }
// Phone on a small dock (dark anodised metal), slightly tilted back. Origin: floor centre. API { group, ph }
function caPhoneOnDock(s = 1.5) {
  const g = new THREE.Group(), ph = makePhone();
  ph.group.scale.setScalar(s); ph.group.rotation.x = -0.08; ph.group.position.set(0, 0.16 + 0.82 * s, -0.02); g.add(ph.group);
  const dock = new THREE.Mesh(rbox(0.62 * s, 0.16, 0.34 * s, 0.05), mat("#2e2f33", { metalness: 0.6, roughness: 0.35 })); dock.position.y = 0.08; g.add(dock);
  g.add(contactShadow(0.9 * s, 0.6 * s));
  return { group: g, ph };
}
addScene("compra", A.c3, A.c4, (S) => {
  const room = new THREE.Group(); S.backdrop(room);
  const bt = makeBedsideTable(); room.add(bt);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), mat("#ffffff", { map: tileTex(plasterTex("#3a2b24"), 5, 3), roughness: 0.95 })); wall.position.set(0, 3.0, -1.95); room.add(wall);
  const win = makeSetWindow(1.8, 1.6, { open: 0.5, seed: 4 }); win.group.position.set(1.5, 1.7, -1.94); room.add(win.group);
  const bok = makeBokeh({ n: 30, center: [0, 2.5, -6], spread: [12, 5, 2], seed: 12, opacity: 0.35 }); room.add(bok.group || bok);
  asBackdrop(room);
  const pd = caPhoneOnDock(1.5); pd.group.position.set(0.05, 0, 0); pd.group.rotation.y = -0.08; S.add(pd.group);
  caScreenPlate(pd.ph, "R$ 59,90", 104 / 1500);
  const finger = makeFinger(); finger.scale.setScalar(1.4); S.add(finger);
  const TAP = A.blusinha + 0.45, dir = new V3(0.45, -0.55, 0.7).normalize(), tip = new V3();
  let painted = -1;
  const anim = (t) => {
    floor.visible = false; scene.background = BACKDROP; if (bok.update) bok.update(t);
    key.intensity = 1.2; key.color.set("#ffd2a8"); hemi.intensity = 0.4; hemi.color.set("#c9d6ff"); hemi.groundColor.set("#140e0a"); scene.fog.color.set("#120c0a");
    const b = t > TAP + 0.05 ? 1 : 0; if (b !== painted) { painted = b; caPaintShop(pd.ph.ctx, b); pd.ph.tex.needsUpdate = true; }
    pd.group.updateMatrixWorld(true); tip.copy(phoneScreenPoint(360, 1372)).applyMatrix4(pd.ph.group.matrixWorld);
    const off = 1.1 * (1 - eOut(lin(t, TAP - 0.55, TAP))) + 1.1 * sm(t, TAP + 0.15, TAP + 0.6);
    finger.visible = t > TAP - 0.6 && t < TAP + 0.62; finger.position.copy(tip).addScaledVector(dir, 0.03 + off); finger.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
    fill.position.set(0.4, 1.8, 1.6); fill.color.set(t > TAP ? "#8affb0" : "#ffcf9a"); fill.intensity = 0.8 + 0.8 * beat(t, TAP, 0.5);
  };
  S.hero(pd.group, "celular com a compra da blusinha");
  const box = envelope([pd.group], anim, A.c3, A.c4);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.c3, A.c4), { zone: "stage-tall", from: [0.12, 0.3, 1], rise: 0.3, pull: 1.04 })); };
});

// ============================================================ 5 · quem bate na sua porta? o entregador da própria loja; carta, quase ninguém
// The street at night: the house door, the doorbell lighting up and ringing; a white van of the shop's
// own delivery parked in front, the parcel on the doormat; the yellow letterbox beside the door, empty,
// a cobweb in its corner. Push on the bell → reveal to the van → truck to the letterbox.
// Doorbell: a dark plate with a round button that lights up; ring(k) glows it. Origin: centre, on the wall.
function caDoorbell() {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(rbox(0.1, 0.15, 0.02, 0.006), pmat("#2a2c30", { metalness: 0.4, roughness: 0.35 })); plate.position.z = 0.01; g.add(plate);
  const btnM = new THREE.MeshBasicMaterial({ color: "#ffcf7a", toneMapped: false });
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 24), btnM); btn.rotation.x = Math.PI / 2; btn.position.set(0, -0.02, 0.024); g.add(btn);
  const grill = new THREE.Mesh(new THREE.CircleGeometry(0.025, 20), mat("#111", { roughness: 0.8 })); grill.position.set(0, 0.04, 0.0205); g.add(grill);
  const glow = sprite(BOKEH, 0.26); glow.material.color.set("#ffc46a"); glow.material.blending = THREE.AdditiveBlending; glow.position.set(0, -0.02, 0.06); glow.userData.decor = true; g.add(glow);
  return { group: g, ring(k) { btnM.color.set("#ffcf7a").multiplyScalar(0.35 + 0.5 * k); glow.material.opacity = 0.1 + 0.45 * k; } };
}
addScene("rua", A.c4, A.c5, (S) => {
  const alley = makeAlleyNight({ seed: 8 }); S.backdrop(alley.group);
  const door = makeHouseDoor({ number: "27", wall: "#76604e" }); S.add(door.group);
  const bell = caDoorbell(); bell.group.position.set(0.82, 1.3, 0); S.add(bell.group);
  const rings = makeAlarmRings(3, "#ffd27a", 0.12); rings.forEach((rg) => { rg.rotation.x = 0; rg.position.set(0.82, 1.28, 0.03); S.add(rg); });
  const van = makeLotacaoVan({ color: "#f1f1ee", sign: "ENTREGAS" }); van.group.position.set(2.75, 0, 1.55); van.group.rotation.y = Math.PI; S.add(van.group);
  const parcel = makeParcel({ w: 0.5, h: 0.36, d: 0.42, label: "ENCOMENDA" }); parcel.group.position.set(-0.05, 0.018, 0.55); S.add(parcel.group);
  const mb = makeMailbox(); mb.group.position.set(-1.12, 1.2, 0); S.add(mb.group);
  const RING = [A.bate, A.porta];
  const DROP = A.entregador - 0.2, VAN0 = A.cadaVez - 0.35, VAN1 = A.entregador - 0.35;
  const anim = (t) => {
    caStreetLook(alley, t);
    const k = Math.max(beat(t, RING[0], 0.5), beat(t, RING[1], 0.5));
    bell.ring(clamp(k * 1.2));
    rings.forEach((rg, i) => { const ph = ((t - RING[0]) * 1.6 + i / 3) % 1, on = t > RING[0] && t < RING[1] + 0.7 ? 1 : 0; rg.scale.setScalar(0.6 + 2.4 * ph); rg.material.opacity = on * 0.8 * (1 - ph); rg.visible = on > 0; });
    // the van drives in on "cada vez mais" and stops by the door; the parcel is set down on the mat
    const kv = eOut(lin(t, VAN0, VAN1)); van.group.visible = t > VAN0; van.group.position.x = lerp(8.0, 2.75, kv);
    const kp = eOut(lin(t, DROP, DROP + 0.35)); parcel.group.visible = t > DROP; parcel.group.position.y = 0.018 + 0.3 * (1 - kp);
    mb.flap(0.15 * Math.sin(t * 1.3) * (t > A.carta - 0.3 ? 1 : 0));
    door.lamp.color.set("#ffd9a0").multiplyScalar(0.8 + 0.2 * Math.sin(t * 9) * beat(t, RING[0], 1.2));
    fill.position.set(0.6, 1.6, 1.6); fill.color.set("#ffcf9a"); fill.intensity = 1.0 + 1.4 * k;
  };
  const T2 = A.cadaVez - 0.25, T3 = A.carta - 0.3;
  S.hero(door.leaf, "porta de casa", { when: (t) => t < T2 - 0.45 }); S.hero(bell.group, "campainha acesa", { when: (t) => t < T2 - 0.45 });
  S.hero(van.group, "van branca de entregas", { when: (t) => t > VAN1 + 0.1 && t < T3 - 0.45 }); S.hero(parcel.group, "encomenda no capacho", { when: (t) => t > DROP + 0.4 && t < T3 - 0.45 });
  S.hero(mb.group, "caixa de correio vazia com teia", { when: (t) => t > T3 + 0.45 });
  S.solid(parcel.group, "encomenda", { when: (t) => t > DROP + 0.4 });
  const bA = new THREE.Box3(new V3(-0.6, 0.0, -0.05), new V3(1.0, 2.3, 0.3));
  const bB = envelope([van.group, parcel.group], anim, DROP + 0.4, T3); bB.expandByPoint(new V3(-0.4, 0, 0.3));
  const bC = envelope([mb.group], anim, T3, A.c5); bC.expandByScalar(0.12);
  return (t) => {
    anim(t);
    let p = caTrack(t, [[A.c4, bA, "push", { from: [0.15, 0.1, 1], pull0: 1.3, pull: 1.02 }], [T2, bB, "reveal", { from: [-0.2, 0.22, 1], pull0: 1.12, pull: 1.0 }], [T3, bC, "truck", { from: [0.1, 0.05, 1], side: 0.25, pull: 1.15 }]], A.c5, 0.5);
    p = CAM.shake(p, t, A.bate, 0.004, 0.4); caFar(p);
  };
});

// ============================================================ 6 · o carteiro vai a todo canto do Brasil, até onde dá prejuízo
// A red-earth road to the horizon at sunset: the photo of the Correios branch in Cachoeira do Arari
// (Marajó) on a pedestal by the road; on "até onde" the camera cranes up the road to a lone parcel with a
// stake sign PREJUÍZO. Push → crane.
addScene("marajo", A.c5, A.c6, (S) => {
  const road = makeDirtRoadSet({ seed: 9 }); S.backdrop(road.group);
  const fr = makePhotoFrame("correios-marajo", { w: 1.9, name: "MARAJÓ (PA)" }); fr.group.position.set(0, 0, 0.3); S.add(fr.group);
  const far = new THREE.Group(); far.position.set(0.35, 0, -4.4); S.add(far);
  const parcel = makeParcel({ w: 0.6, h: 0.42, d: 0.5, label: "ENCOMENDA" }); far.add(parcel.group);
  const sign = makeStakeSign("PREJUÍZO", { w: 0.7, h: 0.24, stake: 0.55, bg: RED }); sign.group.position.set(0.6, 0, 0.1); sign.group.rotation.y = -0.2; far.add(sign.group);
  const T2 = A.ate - 0.35;
  const anim = (t) => {
    floor.visible = false; road.update(t); scene.background = BACKDROP;
    key.intensity = 1.9; key.color.set("#ffc890"); hemi.intensity = 0.55; hemi.color.set("#ffd2b0"); hemi.groundColor.set("#2a1a10"); scene.environmentIntensity = 0.6; scene.fog.color.set("#7a4a3a");
    popIn(fr.group, t, A.c5 - 0.05, 0.45); fr.frame.rotation.y = 1.4 * (1 - eOut(lin(t, A.c5, A.c5 + 0.6))); fr.zoom(1 + 0.14 * lin(t, A.c5 + 0.3, A.c6));
    const ks = pop(t, A.prejuizo - 0.35, 0.4); sign.group.scale.setScalar(Math.max(0.0001, ks)); sign.group.visible = ks > 0.01;
    fill.position.set(0.2, 2.0, 2.2); fill.color.set("#ffc890"); fill.intensity = 0.9;
  };
  S.hero(fr.group, "porta-retrato agência dos correios", { when: (t) => t > A.c5 + 0.5 && t < T2 - 0.45 });
  S.hero(far, "encomenda na estrada com placa prejuízo", { when: (t) => t > A.prejuizo + 0.1 });
  const b1 = envelope([fr.group], anim, A.c5 + 0.5, T2), b2 = envelope([far], anim, A.prejuizo, A.c6); b2.expandByScalar(0.15);
  return (t) => { anim(t); caFar(caTrack(t, [[A.c5, b1, "push", { from: [0.12, 0.18, 1], pull0: 1.3, pull: 1.04 }], [T2, b2, "crane", { from: [-0.1, 0.75, 1], rise: 0.25, pull: 1.1 }]], A.c6, 0.6), 200); };
});

// ============================================================ 7 · nove de cada dez reais de gasto são fixos
// The warehouse: ten coin stacks in a row, nine of them bound by a chain with a padlock; a steel shelf of
// parcels behind. On "não caem quando a encomenda some" the parcels vanish one by one and the free tenth
// stack shrinks; the nine stay put. Truck → push on the locks → reveal.
// A ring of chain links around a coin stack at height y, radius rr. Returns a group.
function caChainRing(rr, n = 16) {
  const g = new THREE.Group(), m = pmat("#9aa0a8", { metalness: 0.95, roughness: 0.28 });
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, l = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 16), m); l.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); l.rotation.y = -a + Math.PI / 2; if (i % 2) l.rotation.x = Math.PI / 2; l.scale.set(1, 0.6, 1); g.add(l); }
  return g;
}
function caParcelShelf(w = 3.6) {
  const g = new THREE.Group(), steel = pmat("#d0601c", { metalness: 0.5, roughness: 0.45 }), up = pmat("#2f5f9a", { metalness: 0.5, roughness: 0.45 });
  for (const x of [-w / 2, 0, w / 2]) for (const z of [-0.25, 0.25]) { const u = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), up); u.position.set(x, 0.95, z); g.add(u); }
  const levels = [0.55, 1.25], boxes = [];
  for (const y of levels) {
    for (const z of [-0.25, 0.25]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, 0.06), steel); b.position.set(0, y, z); g.add(b); }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, 0.56), pmat("#6a6d72", { metalness: 0.4, roughness: 0.6 })); deck.position.set(0, y + 0.045, 0); g.add(deck);
    for (let i = 0; i < 6; i++) { const P = makeParcel({ w: 0.42, h: 0.34, d: 0.4, label: "ENCOMENDA" }); P.group.position.set(-w / 2 + 0.35 + i * (w - 0.7) / 5, y + 0.055, 0); P.group.rotation.y = (i % 3 - 1) * 0.08; g.add(P.group); boxes.push(P.group); }
  }
  g.add(contactShadow(w + 0.4, 1.0));
  return { group: g, boxes };
}
addScene("fixos", A.c6, A.c7, (S) => {
  const wh = makeWarehouseSet({ wallZ: -3.6, clear: 6, seed: 12 }); S.backdrop(wh.group);
  const shelf = caParcelShelf(3.6); shelf.group.position.set(0, 0, -1.05); S.add(shelf.group);
  const row = new THREE.Group(); S.add(row);
  const N = 10, gap = 0.36, R = 0.14, cols = [], locks = [];
  for (let i = 0; i < N; i++) {
    const c = makeCoinColumn(16, { r: R, t: 0.045, seed: 20 + i }); c.group.position.set(-((N - 1) / 2) * gap + i * gap, 0, 0); row.add(c.group); cols.push(c);
    if (i < 9) {
      const ch = caChainRing(R + 0.035); ch.position.y = 0.36; c.group.add(ch);
      const pl = makePadlock({ s: 0.32 }); pl.group.position.set(0, 0.08, R + 0.075); c.group.add(pl.group); locks.push(pl);
    }
  }
  const GONE0 = A.naoCaem - 0.1, GONE1 = A.some + 0.35;
  const anim = (t) => {
    caWarehouseLook(wh, t, 0.95); wh.lamps(0.3 * beat(t, A.fixos, 0.8), "#ffb070");
    const n = shelf.boxes.length;
    shelf.boxes.forEach((b, i) => { const ti = lerp(GONE0, GONE1 - 0.3, i / (n - 1)), k = 1 - sm(t, ti, ti + 0.25); b.visible = k > 0.01; b.scale.setScalar(Math.max(0.0001, k)); });
    cols[9].set(1 - 0.7 * sm(t, GONE0, GONE1));
    locks.forEach((pl, i) => { const k = pop(t, A.nove - 0.1 + i * 0.09, 0.3); pl.group.scale.setScalar(Math.max(0.0001, k)); pl.group.visible = k > 0.01; pl.open(1 - lin(t, A.nove + 0.1 + i * 0.09, A.nove + 0.3 + i * 0.09)); });
    fill.position.set(0, 1.6, 1.6); fill.color.set("#ffc890"); fill.intensity = 1.0;
  };
  const T2 = A.fixos - 0.35, T3 = A.naoCaem - 0.3;
  S.hero(row, "dez pilhas de moedas, nove acorrentadas", { when: (t) => t < T2 - 0.45 || t > T3 + 0.45 });
  S.hero(cols[4].group, "pilha de moedas com corrente e cadeado", { when: (t) => t > T2 + 0.45 && t < T3 - 0.45 });
  S.hero(shelf.group, "prateleira de encomendas", { when: (t) => t > T3 + 0.45 && t < GONE0 + 0.3 });
  const bRow = envelope([row], anim, A.c6, A.c7), bLock = envelope([cols[3].group, cols[4].group, cols[5].group], anim, T2, T3), bAll = envelope([row, shelf.group], anim, T3, A.c7);
  return (t) => {
    anim(t);
    CAM.apply(caTrack(t, [[A.c6, bRow, "truck", { from: [0.15, 0.35, 1], side: 0.3, pull: 1.04 }], [T2, bLock, "push", { from: [-0.1, 0.25, 1], pull0: 1.3, pull: 1.06 }], [T3, bAll, "reveal", { from: [0.2, 0.38, 1], pull0: 1.1, pull: 1.0 }]], A.c7, 0.5));
  };
});

// ============================================================ 8–9 · o chão que afunda: 2024 × 2025; os paletes do empréstimo tapam o buraco
// A big cut-away block of ground in the investigation room (top: the warehouse's concrete floor; front: the
// layers of earth). Two shafts: the floor in each sinks into the ground, 2024 a little, 2025 almost to the
// bottom (the year printed on the front of each sinking slab). Then two pallets of banknotes, R$ 12 BI and
// R$ 7 BI, are lowered on crane straps into the 2025 hole and plug it up to the surface.
function caStrataTex() {
  return cachedTex("caStrata", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(31);
    const bands = [["#6b6660", 0.06], ["#5a3a24", 0.14], ["#7a4a2a", 0.2], ["#9a5a30", 0.18], ["#6e3e22", 0.2], ["#4a2c1a", 0.22]];
    let y = 0; for (const [col, h] of bands) { x.fillStyle = col; x.fillRect(0, y * 512, 512, h * 512 + 2); y += h; }
    for (let i = 0; i < 1500; i++) { const v = r(); x.fillStyle = v < 0.5 ? "rgba(0,0,0,0.22)" : "rgba(255,220,180,0.16)"; const s = 1 + r() * 4; x.fillRect(r() * 512, 30 + r() * 482, s, s * 0.7); }
    for (let i = 0; i < 40; i++) { x.fillStyle = "rgba(170,160,150,0.5)"; x.beginPath(); x.ellipse(r() * 512, 60 + r() * 450, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, Math.PI * 2); x.fill(); }
    const t = texFrom(c); t.wrapS = THREE.RepeatWrapping; return t;
  });
}
// API { group, top (surface y), shafts: [{x, w, slab, set(depth)}], W, D }
function caSoilBlock({ W = 2.8, H = 1.5, D = 1.0, shaftW = 0.62, xs = [-0.62, 0.62] } = {}) {
  const g = new THREE.Group(), strata = caStrataTex();
  const floorM = mat("#ffffff", { map: tileTex(noiseTex({ base: "#8a8780", amount: 0.18, seed: 64 }), 2, 1), roughness: 0.8 });
  const sideM = (x0, w) => { const tx = strata.clone(); tx.repeat.set(w / W, 1); tx.offset.set((x0 + W / 2) / W, 0); tx.needsUpdate = true; return mat("#ffffff", { map: tx, roughness: 0.95 }); };
  const darkM = mat("#2a1a10", { roughness: 1 }), endM = mat("#ffffff", { map: strata, roughness: 0.95 });
  // solid pieces between the shafts
  const edges = [-W / 2]; xs.forEach((x) => { edges.push(x - shaftW / 2, x + shaftW / 2); }); edges.push(W / 2);
  for (let i = 0; i < edges.length; i += 2) {
    const x0 = edges[i], x1 = edges[i + 1], w = x1 - x0; if (w <= 0.001) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, D), [endM, endM, floorM, darkM, sideM(x0, w), darkM]); m.position.set((x0 + x1) / 2, H / 2, 0); g.add(m);
  }
  // the bottom of each shaft (below the deepest slab) and its back wall
  const shafts = xs.map((x) => {
    const back = new THREE.Mesh(new THREE.BoxGeometry(shaftW, H, 0.02), mat("#3a2414", { roughness: 1 })); back.position.set(x, H / 2, -D / 2 + 0.01); g.add(back);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(shaftW - 0.004, 1, D - 0.03), [endM, endM, floorM, darkM, sideM(x - shaftW / 2, shaftW), darkM]); g.add(slab);
    const cap = new THREE.Group(); g.add(cap);
    const set = (depth) => { const h = Math.max(0.02, H - depth); slab.scale.y = h; slab.position.set(x, h / 2, 0.015); cap.position.set(x, h, 0.015); };
    set(0);
    return { x, w: shaftW, slab, cap, set };
  });
  // a hazard edge around the holes on the surface
  return { group: g, top: H, shafts, W, D, H };
}
const CA_DEEP = 1.22, CA_D24 = CA_DEEP * 2.6 / 8.5;
function caPitRoom(S, seed) {
  const office = makeWarehouseSet({ wallZ: -3.2, clear: 5, seed }); S.backdrop(office.group);
  const blk = caSoilBlock(); blk.group.position.z = -0.35; S.add(blk.group);
  const tags = ["2024", "2025"].map((y, i) => { const p = makePlate(y, 0.6, 0.25, { bg: i ? RED : "#141414", fg: "#ffffff", depth: 0.01 }); p.position.set(0, -0.15, (blk.D - 0.03) / 2 + 0.006); blk.shafts[i].cap.add(p); return p; });
  return { office, blk, tags };
}
addScene("afunda", A.c7, A.c8, (S) => {
  const R = caPitRoom(S, 20);
  const S24 = [A.c7 + 0.1, A.c7 + 0.8], S25 = [A.oito - 0.1, A.a2025 + 0.5];
  const anim = (t) => {
    caWarehouseLook(R.office, t, 1.0); R.office.lamps(beat(t, A.pior - 0.1, 1.0), "#ff5a3a");
    R.blk.shafts[0].set(CA_D24 * sm(t, S24[0], S24[1])); R.blk.shafts[1].set(CA_DEEP * sm(t, S25[0], S25[1]));
    fill.position.set(0.6, 2.2, 1.6); fill.color.set(t > A.pior - 0.1 ? "#ff7a5a" : "#ffc890"); fill.intensity = 1.0 + 1.0 * beat(t, A.pior, 0.6);
  };
  S.hero(R.blk.group, "bloco de terra em corte com dois poços");
  const bAll = envelope([R.blk.group], anim, A.c7, A.c8); bAll.min.y = -0.02;
  const T2 = A.a2025 - 0.3;
  return (t) => {
    anim(t);
    let p = caTrack(t, [[A.c7, bAll, "push", { from: [0.2, 0.42, 1], pull0: 1.15, pull: 1.0 }], [T2, bAll, "orbit", { from: [0.05, 0.5, 1], deg: 22, pull: 1.0 }]], A.c8, 0.5);
    p = CAM.shake(p, t, A.pior, 0.012, 0.45); CAM.apply(p);
  };
});
addScene("buraco", A.c8, A.c9, (S) => {
  const R = caPitRoom(S, 20);
  const p12 = makeMoneyPallet("R$ 12 BI", { w: 0.56, d: 0.86, h: 0.72, seed: 3 }); S.add(p12.group);
  const p7 = makeMoneyPallet("R$ 7 BI", { w: 0.56, d: 0.86, h: 0.42, seed: 5 }); S.add(p7.group);
  const sx = R.blk.shafts[1].x, bz = R.blk.group.position.z, bottom = R.blk.H - CA_DEEP;
  const L12 = [A.doze - 0.5, A.doze + 0.55], L7 = [A.sete - 0.45, A.sete + 0.55];
  const anim = (t) => {
    caWarehouseLook(R.office, t, 1.0);
    R.blk.shafts[0].set(CA_D24); R.blk.shafts[1].set(CA_DEEP);
    const k12 = eOut(lin(t, L12[0], L12[1])), k7 = eOut(lin(t, L7[0], L7[1]));
    p12.group.position.set(sx, bottom + 3.2 * (1 - k12), bz); p12.group.visible = t > L12[0]; p12.rig(t < L12[1] + 0.25);
    p7.group.position.set(sx, bottom + p12.top + 3.2 * (1 - k7), bz); p7.group.visible = t > L7[0];
    fill.position.set(0.6, 2.4, 1.6); fill.color.set("#ffd6a0"); fill.intensity = 1.0 + 0.8 * beat(t, L12[1], 0.4) + 0.8 * beat(t, L7[1], 0.4);
  };
  S.hero(R.blk.group, "bloco de terra com o buraco", { when: (t) => t < A.emprestimo - 0.75 });
  S.hero(R.blk.shafts[1].slab, "fundo do buraco de 2025", { when: (t) => t > A.emprestimo + 0.3 && t < L12[0] + 0.9 });
  S.hero(p12.group, "palete de dinheiro 12 bi", { when: (t) => t > L12[0] + 0.6 });
  S.hero(p7.group, "palete de dinheiro 7 bi", { when: (t) => t > L7[0] + 0.6 });
  S.solid(p12.group, "palete 12", { when: (t) => t > L12[1] }); S.solid(p7.group, "palete 7", { restsOn: ["palete 12"], when: (t) => t > L7[1] });
  const b1 = envelope([R.blk.group], anim, A.c8, L12[0]); b1.min.y = -0.02;
  const b2 = new THREE.Box3(new V3(sx - 0.5, bottom - 0.05, bz - 0.5), new V3(sx + 0.5, R.blk.H + 0.15, bz + 0.5));
  return (t) => {
    anim(t);
    let p = caTrack(t, [[A.c8, b1, "drop", { from: [0.1, 0.62, 1], rise: 0.3, pull: 1.0 }], [A.emprestimo - 0.2, b2, "push", { from: [0.15, 0.4, 1], pull0: 1.2, pull: 1.04 }]], A.c9, 0.5);
    p = CAM.shake(p, t, L12[1], 0.012, 0.35); p = CAM.shake(p, t, L7[1], 0.01, 0.3); CAM.apply(p);
  };
});

// ============================================================ 10 · quem garante é a União
// The desk under a lamp: a contract with its seal; the rubber stamp comes down on "União" and leaves
// GARANTIA DA UNIÃO in red. Push from above, shake on the hit.
addScene("fiadora", A.c9, A.c10, (S) => {
  const office = makeOfficeSet({ wallZ: -1.6, clear: 2.0, wall: "#5a4636", seed: 14 }); S.backdrop(office.group);
  const desk = caDesk({ w: 2.0, d: 1.1 }); desk.group.position.z = -0.5; S.add(desk.group);
  const lamp = caDeskLamp(); lamp.group.position.set(-0.78, desk.top, -0.85); S.add(lamp.group);
  const doc = makeCertificate("CONTRATO", { w: 0.9, d: 1.1 }); doc.group.position.set(-0.05, desk.top, -0.5); doc.group.rotation.y = 0.05; S.add(doc.group);
  const ink = makeInkMark("GARANTIA\nDA UNIÃO", 0.62, 0.3, { seed: 6 }); ink.rotation.set(-Math.PI / 2, 0, 0.06); ink.position.set(0.0, doc.top + 0.002, -0.02); doc.group.add(ink);
  const stamp = makeStamp({ w: 0.6, d: 0.28 }); S.add(stamp);
  const HIT = A.uniao + 0.05, ip = new V3();
  const anim = (t) => {
    caOfficeLook(office, t, 0.9); office.lights(1); office.windows(1); lamp.set(1);
    ink.visible = t >= HIT;
    doc.group.updateMatrixWorld(true); ip.set(0.0, doc.top, -0.02).applyMatrix4(doc.group.matrixWorld);
    const down = 1 - clamp(lin(t, HIT - 0.3, HIT) - lin(t, HIT + 0.08, HIT + 0.4));
    stamp.visible = t > HIT - 0.9 && t < HIT + 0.85; stamp.position.set(ip.x + 0.25 * (1 - lin(t, HIT - 0.9, HIT - 0.3)), ip.y + 0.55 * down, ip.z); stamp.rotation.y = 0.06;
    fill.position.set(0.2, 1.8, 0.8); fill.color.set("#ffd9a0"); fill.intensity = 0.9 + 1.2 * beat(t, HIT, 0.4);
  };
  S.hero(doc.group, "contrato com carimbo garantia da união");
  S.solid(doc.group, "contrato", { restsOn: ["mesa"] }); S.solid(desk.group, "mesa");
  const box = envelope([doc.group], anim, A.c9, A.c10); box.expandByPoint(new V3(0, desk.top + 0.35, -0.5));
  return (t) => { anim(t); let p = CAM.move(box, "push", lin(t, A.c9, A.c10), { zone: "stage", from: [0.05, 1.6, 1], pull0: 1.35, pull: 1.04 }); p = CAM.shake(p, t, HIT, 0.02, 0.4); CAM.apply(p); };
});

// ============================================================ 11 · com a Anatel é o contrário: arrecadou mais de três bilhões
// A field at night with telecom towers blinking and broadcasting: on a black plinth ANATEL a column of
// coins rises tall; the camera cranes up with it.
function caTowerField(seed = 3) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), mat("#ffffff", { map: tileTex(grassTex(), 50, 30), color: "#55603a", roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -50); g.add(ground);
  const towers = [[-3.2, -6, 6.5], [3.6, -9, 8], [-0.8, -15, 9], [7, -18, 9], [-8, -14, 8]].map(([x, z, h]) => { const tw = makeRadioTower({ h }); tw.group.position.set(x, 0, z); g.add(tw.group); return tw; });
  const sky = makeSkyline({ z: -40, spread: 70, seed: seed + 4, hMin: 2, hMax: 7 }); g.add(sky.group || sky);
  const motes = makeSetMotes(60, [[-5, 0.3, -6], [5, 4, 1]], { color: "#cfe0ff", seed: seed + 2, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t) { motes.update(t); towers.forEach((tw, i) => tw.waves(t + i * 0.4, 0.8)); } };
}
addScene("arrecada", A.c10, A.c11, (S) => {
  const field = caTowerField(3); S.backdrop(field.group);
  const pl = makeLabelPlinth("ANATEL", { w: 1.2, h: 0.42, d: 0.9, fg: "#ffffff" }); S.add(pl.group);
  const col = makeCoinColumn(34, { r: 0.22, t: 0.052, seed: 9 }); col.group.position.y = pl.top; S.add(col.group);
  const G0 = A.a2024 - 0.2, G1 = A.bilhoes + 0.35;
  const anim = (t) => {
    floor.visible = false; field.update(t); scene.background = CA_NIGHT;
    key.intensity = 1.3; key.color.set("#ffe0c0"); hemi.intensity = 0.38; hemi.color.set("#8fa8e0"); hemi.groundColor.set("#121010"); scene.environmentIntensity = 0.5; scene.fog.color.set("#0b1020");
    col.set(0.12 + 0.88 * sm(t, G0, G1));
    fill.position.set(0.5, 1.4 + 1.6 * sm(t, G0, G1), 1.8); fill.color.set("#ffd28a"); fill.intensity = 1.2 + 0.8 * beat(t, A.tres, 0.6);
  };
  S.hero(pl.group, "pedestal anatel"); S.hero(col.group, "coluna de moedas subindo");
  S.solid(col.group, "moedas", { restsOn: ["pedestal"] }); S.solid(pl.group, "pedestal");
  return (t) => {
    anim(t);
    const box = frameBox(pl.group, col.group); box.expandByPoint(new V3(0, pl.top + 0.6, 0));
    caFar(CAM.move(box, "crane", lin(t, A.c10, A.c11), { zone: "stage", from: [0.18, 0.12, 1], rise: 0.22, pull: 1.06 }), 80);
  };
});

// ============================================================ 12–15 · a analogia: o caixa da loja e o cofre do dono
// A bakery at night: the cash register on the counter, a glass tube running from it up and into the wall
// above the round vault door of the owner's safe. Banknotes drop into the drawer, then travel up the
// tube into the safe. The receipt roll runs out; a slip goes up to ask. On a tray, 94 of 100 coins fly
// into the safe and 6 stay. The cards turn: the register is ANATEL, the safe TESOURO. A steel lid with a
// padlock closes over almost a fifth of the six coins.
const CA_COIN_R = 0.03, CA_COIN_T = 0.008, CA_SPACING = 0.07;
function caShop(S, seed = 5) {
  const shop = makeBakerySet({ wallZ: -1.0, counterZ: 0.9, seed }); S.backdrop(shop.group);
  const cy = shop.counterY;
  const reg = makeCashRegister({ s: 1.35, display: "R$ 59,90" }); reg.group.position.set(-0.85, cy, 0.9); reg.group.rotation.y = 0.12; S.add(reg.group);
  const vault = makeVaultDoor({ r: 0.62 }); vault.group.position.set(0.32, 0, -0.95); S.add(vault.group);
  // the glass tube: from the back of the register up and into the wall above the safe
  reg.group.updateMatrixWorld(true);
  const m0 = reg.mouth.clone().applyMatrix4(reg.group.matrixWorld);
  // ...into the top-left corner of the safe's steel frame (outside the swing of the round door)
  const curve = new THREE.CatmullRomCurve3([m0, m0.clone().add(new V3(0, 0.25, -0.12)), new V3(-0.62, 1.95, 0.05), new V3(-0.36, 1.92, -0.55), new V3(-0.24, 1.62, -0.84), new V3(-0.24, 1.54, -0.935)]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.05, 16, false), glassMat({ opacity: 0.26 })); tube.userData.noShadow = true; S.add(tube);
  const brass = pmat("#c9a45a", { metalness: 1, roughness: 0.3 });
  for (const u of [0.0, 1.0]) { const p = curve.getPointAt(u), tg = curve.getTangentAt(u); const col = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.07, 24), brass); col.position.copy(p); col.quaternion.setFromUnitVectors(new V3(0, 1, 0), tg); S.add(col); }
  // rolled notes that travel in the tube
  const rolls = [];
  for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.13, 16), pmat("#6aa27a", { roughness: 0.6 })); g.add(cyl); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 16), pmat("#c99a4a", { roughness: 0.6 })); g.add(band); g.visible = false; S.add(g); rolls.push(g); }
  const along = (g, u) => { const uu = clamp(u); g.position.copy(curve.getPointAt(uu)); g.quaternion.setFromUnitVectors(new V3(0, 1, 0), curve.getTangentAt(uu)); };
  // the coin tray on the counter, in front of the safe
  const tray = new THREE.Group(); tray.position.set(0.42, cy, 0.9); S.add(tray);
  const tw = 10 * CA_SPACING + 0.06;
  const tb = new THREE.Mesh(rbox(tw, 0.02, tw, 0.008), pmat("#2a2c30", { roughness: 0.4, metalness: 0.3 })); tb.position.y = 0.01; tray.add(tb);
  const coins = new THREE.InstancedMesh(coinGeometry(CA_COIN_R, CA_COIN_T), coinMetalMat(), 100); tray.add(coins);
  const keep = [0, 1, 2, 3, 4, 5].map((i) => 90 + i * 2 - (i > 2 ? 1 : 0)); // six coins of the front row
  const keepSet = new Set(keep);
  const home = (i) => new V3(-4.5 * CA_SPACING + (i % 10) * CA_SPACING, 0.02, -4.5 * CA_SPACING + Math.floor(i / 10) * CA_SPACING);
  // the six coins' row in front of the register, and the steel lid that will close over part of it
  const row = (j) => new V3(-0.84 + j * 0.068, 0.022, 0.22);   // tray-local: on the counter right of the register
  const plaque = makePlate("TESOURO", 1.1, 0.28, { bg: "#c9a45a", fg: "#1c1410", depth: 0.02 }); plaque.position.set(0.32, 2.12, -0.985); S.add(plaque);
  const card = makeShelfCard("ANATEL", { w: 0.8, h: 0.27 }); card.group.position.set(-1.7, cy, 1.05); card.group.rotation.y = 0.15; S.add(card.group);
  // the change tray on the counter right of the register, where the six coins come back
  const change = new THREE.Group(); change.position.set(-0.25, cy, 1.12); S.add(change);
  const ct = new THREE.Mesh(rbox(6 * 0.068 + 0.05, 0.02, 0.12, 0.006), pmat("#2a2c30", { roughness: 0.4, metalness: 0.3 })); ct.position.y = 0.01; change.add(ct);
  return { shop, reg, vault, curve, tube, rolls, along, tray, coins, keep, keepSet, home, row, plaque, card, change, cy };
}
// Coin positions for the tray scene: phase 'fly' sends the 94 to the safe; 'row' lines the six up.
const _caO = new THREE.Object3D(), _caW = new V3();
function caCoins(C, t, fly0, fly1, row0 = 1e6, row1 = 1e6 + 1) {
  const target = new V3(0.32 - C.tray.position.x, 0.98 - C.cy, -1.0 - C.tray.position.z);
  let k = 0;
  for (let i = 0; i < 100; i++) {
    const h = C.home(i);
    if (C.keepSet.has(i)) {
      const j = C.keep.indexOf(i), kr = sm(t, row0 + j * 0.06, row1 + j * 0.06);
      const p = h.clone().lerp(C.row(j), kr); p.y += 0.08 * Math.sin(Math.PI * kr);
      _caO.position.copy(p); _caO.scale.setScalar(1);
    } else {
      const ti = lerp(fly0, fly1 - 0.35, (k++) / 93), kf = sm(t, ti, ti + 0.35);
      const p = h.clone().lerp(target, kf); p.y += 0.55 * Math.sin(Math.PI * kf);
      _caO.position.copy(p); _caO.scale.setScalar(Math.max(0.0001, 1 - lin(kf, 0.8, 1)));
    }
    _caO.rotation.set(0, 0, 0); _caO.updateMatrix(); C.coins.setMatrixAt(i, _caO.matrix);
  }
  C.coins.instanceMatrix.needsUpdate = true; C.coins.boundingSphere = null; C.coins.boundingBox = null;
}
addScene("caixa", A.c11, A.c12, (S) => {
  const C = caShop(S, 5);
  C.tray.visible = false; C.plaque.visible = false; C.card.group.visible = false;
  // notes that fall into the open drawer (customers paying)
  const pay = [0, 1, 2].map(() => { const n = makeCurrencyNote("real", { w: 0.24 }); S.add(n.group); return n; });
  const OPEN = A.passa - 0.2, CLOSE = A.tudo - 0.25, UP0 = A.tudo - 0.2, UP1 = A.dono + 0.25;
  const dz = new V3();
  const anim = (t) => {
    caShopLook(C.shop, t, 0.95);
    C.reg.drawer(sm(t, OPEN, OPEN + 0.3) * (1 - sm(t, CLOSE, CLOSE + 0.3)));
    C.reg.group.updateMatrixWorld(true);
    pay.forEach((n, i) => { const ti = A.dinheiro - 0.2 + i * 0.35, k = eOut(lin(t, ti, ti + 0.45)); n.group.visible = t > ti && t < CLOSE + 0.1; dz.set(-0.1 + i * 0.1, 0.06 + 0.7 * (1 - k), 0.62).applyMatrix4(C.reg.group.matrixWorld); n.group.position.copy(dz); n.group.rotation.set(0.3 * (1 - k), C.reg.group.rotation.y + 0.4 * (1 - k) * (i - 1), 0); });
    C.rolls.forEach((g, i) => { const u = lin(t, UP0 + i * 0.22, UP0 + i * 0.22 + 0.95); g.visible = u > 0 && u < 1; C.along(g, u); });
    C.vault.glow(0.25 + 0.75 * beat(t, A.cofre, 0.9)); C.vault.spin(0.2 * sm(t, A.cofre - 0.2, A.dono + 0.4));
    fill.position.set(-0.4, 1.9, 2.0); fill.color.set("#ffd6a0"); fill.intensity = 1.0;
  };
  const T2 = A.tudo - 0.35;
  S.hero(C.reg.group, "caixa registradora", { when: (t) => t < T2 - 0.45 });
  S.hero(C.vault.group, "porta redonda de cofre", { when: (t) => t > T2 + 0.5 });
  S.hero(C.tube, "tubo de vidro do caixa ao cofre", { when: (t) => t > T2 + 0.5 });
  S.solid(C.reg.group, "registradora");
  const b1 = envelope([C.reg.group], anim, A.c11, T2); b1.expandByPoint(new V3(-0.72, C.cy + 0.9, 0.95));
  const b2 = envelope([C.reg.group, C.vault.group, C.tube], anim, T2, A.c12);
  return (t) => {
    anim(t);
    CAM.apply(caTrack(t, [[A.c11, b1, "push", { zone: "stage-tall", from: [0.15, 0.4, 1], pull0: 1.35, pull: 1.04 }], [T2, b2, "reveal", { zone: "stage-tall", from: [0.1, 0.32, 1], pull0: 1.12, pull: 1.0 }]], A.c12, 0.55));
  };
});
addScene("bobina", A.c12, A.c13, (S) => {
  const C = caShop(S, 5);
  C.plaque.visible = false; C.card.group.visible = false;
  // the request: a rolled white slip with a red band goes up the tube to the owner
  const slip = new THREE.Group(); slip.visible = false; S.add(slip);
  slip.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 16), pmat("#fbf8f1", { roughness: 0.6 })));
  slip.add(new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.025, 16), pmat(RED, { roughness: 0.5 })));
  const RUN0 = A.comprar - 0.05, RUN1 = A.maquininha + 0.3, ASK0 = A.pedir - 0.6, ASK1 = A.pedir + 0.5, FLY0 = A.dono2 - 0.1, FLY1 = A.cem;
  const anim = (t) => {
    caShopLook(C.shop, t, 0.95);
    C.reg.paper(1 - sm(t, RUN0, RUN1));
    const u = lin(t, ASK0, ASK1); slip.visible = u > 0 && u < 1; C.along(slip, u);
    caCoins(C, t, FLY0, FLY1);
    const kv = sm(t, FLY0 - 0.3, FLY0 + 0.1) * (1 - sm(t, FLY1, FLY1 + 0.3)); C.vault.open(0.32 * kv); C.vault.glow(0.3 + 0.7 * kv);
    fill.position.set(0.2, 1.9, 2.0); fill.color.set(t > A.seis ? "#ffb36b" : "#ffd6a0"); fill.intensity = 1.0 + 0.6 * beat(t, A.seis, 0.6);
  };
  const T2 = A.pedir - 0.75, T3 = A.dono2 - 0.35;
  S.hero(C.reg.group, "caixa registradora com a bobina", { when: (t) => t < T2 - 0.45 });
  S.hero(C.tube, "tubo de vidro", { when: (t) => t > T2 + 0.45 && t < T3 - 0.45 });
  S.hero(C.tray, "bandeja com cem moedas", { when: (t) => t > T3 + 0.45 });
  S.solid(C.reg.group, "registradora");
  const b1 = envelope([C.reg.group], anim, A.c12, T2), b2 = envelope([C.reg.group, C.tube], anim, T2, T3);
  const b3 = new THREE.Box3(new V3(-0.05, C.cy, -0.75), new V3(0.95, 1.55, 1.32));
  return (t) => {
    anim(t);
    CAM.apply(caTrack(t, [[A.c12, b1, "push", { from: [0.3, 0.45, 1], pull0: 1.3, pull: 1.04 }], [T2, b2, "crane", { from: [0.05, 0.3, 1], rise: 0.2, pull: 1.04 }], [T3, b3, "reveal", { from: [0.05, 0.9, 1], pull0: 1.1, pull: 1.0 }]], A.c13, 0.5));
  };
});
addScene("tesouro", A.c13, A.c14, (S) => {
  const C = caShop(S, 5);
  const CARD = A.anatel3 - 0.15, PLQ = A.tesouro2 - 0.35, ROW0 = A.voltam - 0.1, ROW1 = A.voltam + 0.5;
  const anim = (t) => {
    caShopLook(C.shop, t, 0.95);
    caCoins(C, t, -10, -9, ROW0, ROW1);
    const kc = pop(t, CARD, 0.4); C.card.group.scale.setScalar(Math.max(0.0001, kc)); C.card.group.visible = kc > 0.01;
    const kp = pop(t, PLQ, 0.4); C.plaque.scale.setScalar(Math.max(0.0001, kp)); C.plaque.visible = kp > 0.01;
    C.vault.glow(0.3 + 0.7 * beat(t, A.tesouro2, 0.8));
    fill.position.set(0, 2.0, 2.0); fill.color.set("#ffd6a0"); fill.intensity = 1.0;
  };
  const T2 = PLQ - 0.25, T3 = ROW0 - 0.3;
  S.hero(C.reg.group, "caixa registradora", { when: (t) => t < T2 - 0.45 || t > T3 + 0.45 }); S.hero(C.card.group, "placa anatel", { when: (t) => (t > CARD + 0.4 && t < T2 - 0.45) || t > T3 + 0.45 });
  S.hero(C.vault.group, "cofre", { when: (t) => t > T2 + 0.45 && t < T3 - 0.45 }); S.hero(C.plaque, "placa tesouro", { when: (t) => t > PLQ + 0.4 && t < T3 - 0.45 });
  S.hero(C.change, "bandeja de troco", { when: (t) => t > T3 + 0.45 });
  S.solid(C.reg.group, "registradora");
  const b1 = envelope([C.reg.group, C.card.group], anim, A.c13, T2), b2 = envelope([C.vault.group, C.plaque], anim, T2, T3), b3 = envelope([C.reg.group, C.card.group, C.change], anim, T3, A.c14);
  return (t) => { anim(t); CAM.apply(caTrack(t, [[A.c13, b1, "push", { from: [0.15, 0.35, 1], pull0: 1.25, pull: 1.04 }], [T2, b2, "crane", { from: [-0.1, 0.2, 1], rise: 0.2, pull: 1.04 }], [T3, b3, "orbit", { from: [0.1, 0.45, 1], deg: 24, pull: 1.02 }]], A.c14, 0.5)); };
});
addScene("bloqueio", A.c14, A.c15, (S) => {
  const C = caShop(S, 5);
  // the steel lid: hinged at the back of the row, closing over coin 1 and a bit of coin 2 (18.8 % of 6)
  const lidG = new THREE.Group(); C.tray.add(lidG);
  const L = 0.068 * 1.13 + 0.02, x0 = C.row(0).x - 0.034 - 0.01;
  const posts = pmat("#6b6f76", { metalness: 0.8, roughness: 0.3 });
  for (const dx of [0.004, L - 0.004]) for (const dz of [-0.045, 0.045]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.03, 0.008), posts); p.position.set(x0 + dx, 0.035, C.row(0).z + dz); lidG.add(p); }
  const hinge = new THREE.Group(); hinge.position.set(x0 + L / 2, 0.052, C.row(0).z - 0.05); lidG.add(hinge);
  const lid = new THREE.Mesh(rbox(L, 0.008, 0.1, 0.003), pmat("#aeb3ba", { metalness: 0.95, roughness: 0.25 })); lid.position.set(0, 0, 0.05); hinge.add(lid);
  const pad = makePadlock({ s: 0.09 }); pad.group.position.set(x0 + L / 2, 0.0, C.row(0).z + 0.065); lidG.add(pad.group);
  const SHUT = A.quinto - 0.45;
  const anim = (t) => {
    caShopLook(C.shop, t, 0.92); C.card.group.visible = true; C.plaque.visible = true;
    caCoins(C, t, -10, -9, -8, -7.5);
    hinge.rotation.x = -1.5 * (1 - eOut(lin(t, SHUT - 0.35, SHUT)));
    const kp = pop(t, SHUT + 0.05, 0.3); pad.group.visible = kp > 0.01; pad.group.scale.setScalar(Math.max(0.0001, kp)); pad.open(1 - lin(t, SHUT + 0.25, SHUT + 0.45));
    fill.position.set(-0.5, 1.6, 1.8); fill.color.set(t > SHUT ? "#ff7a5a" : "#ffd6a0"); fill.intensity = 1.0 + 1.0 * beat(t, SHUT, 0.5);
  };
  const T2 = A.bloqueou - 0.4;
  S.hero(C.reg.group, "caixa registradora anatel", { when: (t) => t < T2 - 0.45 }); S.hero(C.card.group, "placa anatel", { when: (t) => t < T2 - 0.45 });
  S.hero(lidG, "tampa com cadeado sobre as moedas", { when: (t) => t > T2 + 0.45 }); S.hero(C.change, "bandeja de troco com seis moedas", { when: (t) => t > T2 + 0.45 });
  const b1 = envelope([C.reg.group, C.card.group], anim, A.c14, T2);
  const b2 = new THREE.Box3(); C.tray.updateMatrixWorld(true);
  for (let j = 0; j < 6; j++) b2.expandByPoint(C.row(j).clone().applyMatrix4(C.tray.matrixWorld));
  b2.expandByScalar(0.09); b2.max.y += 0.08;
  return (t) => {
    anim(t);
    let p = caTrack(t, [[A.c14, b1, "push", { from: [0.2, 0.42, 1], pull0: 1.25, pull: 1.04 }], [T2, b2, "push", { from: [0.1, 0.75, 1], pull0: 1.35, pull: 1.06 }]], A.c15, 0.5);
    p = CAM.shake(p, t, SHUT, 0.012, 0.35); CAM.apply(p);
  };
});

// ============================================================ 16 · faltam trinta milhões pro centro de dados; o presidente pediu o desbloqueio
// The data center again, half of it dark: the first rack lit, the second flickering, the third out.
// Then the photo card of Carlos Baigorri over the dim aisle (backdrop only). Push → drift.
addScene("metade", A.c15, A.c16, (S) => {
  const D = caDataRoom(S, 5);
  const anim = (t) => {
    caDataLook(D.dc, t, 0.45);
    D.racks[0].leds(t, 1); D.racks[1].leds(t, 0.5 + 0.4 * Math.sin(t * 13) * (Math.sin(t * 3.1) > 0 ? 1 : 0)); D.racks[2].leds(t, 0.05);
    fill.position.set(0, 1.6, 1.8); fill.color.set("#ff6a5a"); fill.intensity = 0.6 + 0.4 * beat(t, A.trinta, 0.6);
  };
  S.hero(D.row, "racks de servidores meio apagados");
  const box = envelope([D.row], anim, A.c15, A.c16);
  return (t) => { anim(t); caFar(CAM.move(box, "push", lin(t, A.c15, A.c16), { zone: "stage", from: [-0.25, 0.15, 1], pull0: 1.3, pull: 1.03 }), 40); };
});
addScene("baigorri", A.c16, A.c17, (S) => {
  const dc = makeDataCenterSet({ z0: -1.0, seed: 5 }); S.backdrop(dc.group);
  const box = new THREE.Box3(new V3(-1.6, 0.3, -5), new V3(1.6, 2.6, -2.5));
  return (t) => { caDataLook(dc, t, 0.4); CAM.apply(CAM.move(box, "push", lin(t, A.c16, A.c17), { zone: "stage", from: [0.1, 0.1, 1], pull0: 1.3, pull: 1.05 })); };
});

// ============================================================ 17 · qual problema é pior?
// The office at night, two black plinths: A with the leaking parcel, B with the cash register locked by a
// chain and padlock. Reveal → push on A ("gastar mais do que ganha") → truck to B ("ganhar e não poder
// gastar") → orbit on both.
addScene("pergunta", A.c17, A.end, (S) => {
  const office = makeWarehouseSet({ wallZ: -3.2, clear: 5, seed: 22 }); S.backdrop(office.group);
  const pA = makeLabelPlinth("A", { w: 1.25, h: 0.45, d: 1.1, fg: ORANGE }); pA.group.position.set(-0.78, 0, 0); S.add(pA.group);
  const pB = makeLabelPlinth("B", { w: 1.25, h: 0.45, d: 1.1, fg: ORANGE }); pB.group.position.set(0.78, 0, 0); S.add(pB.group);
  const lp = caLeakyParcel({ s: 0.72, n: 14, seed: 7 }); lp.group.position.set(-0.85, pA.top, -0.2); S.add(lp.group);
  const reg = makeCashRegister({ s: 2.0, display: "R$ 3,4 BI" }); reg.group.position.set(0.78, pB.top, -0.05); S.add(reg.group);
  const chain = new THREE.Group(); reg.group.add(chain);
  const cm = pmat("#9aa0a8", { metalness: 0.95, roughness: 0.28 });
  for (let i = 0; i < 24; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 8, 16), cm); l.position.set(-0.47 + i * 0.041, 0.12, 0.475); if (i % 2) l.rotation.y = Math.PI / 2; l.scale.set(1, 0.6, 1); chain.add(l); }
  const pad = makePadlock({ s: 0.42 }); pad.group.position.set(0, -0.03, 0.5); reg.group.add(pad.group);
  const anim = (t) => {
    caWarehouseLook(office, t, 1.0);
    lp.update(t, A.c17 - 1.5, 0.2);
    fill.position.set(0, 1.8, 2.2); fill.color.set("#ffd2a0"); fill.intensity = 1.1;
  };
  const T2 = A.gastar - 0.3, T3 = A.ganhar - 0.3, T4 = A.gastar2 + 0.2;
  const both = (t) => t < T2 - 0.45 || t > T4 + 0.45;
  S.hero(lp.group, "caixa furada perdendo dinheiro", { when: (t) => both(t) || (t > T2 + 0.4 && t < T3 - 0.45) }); S.hero(pA.group, "pedestal a", { when: (t) => both(t) || (t > T2 + 0.4 && t < T3 - 0.45) });
  S.hero(reg.group, "caixa registradora acorrentada", { when: (t) => both(t) || t > T3 + 0.4 }); S.hero(pB.group, "pedestal b", { when: (t) => both(t) || t > T3 + 0.4 });
  S.solid(reg.group, "registradora", { restsOn: ["pedestal b"] }); S.solid(pB.group, "pedestal b"); S.solid(pA.group, "pedestal a");
  const bAll = envelope([pA.group, pB.group, lp.group, reg.group], anim, A.c17, A.end), bA = envelope([pA.group, lp.group], anim, T2, T3), bB = envelope([pB.group, reg.group], anim, T3, T4);
  return (t) => { anim(t); CAM.apply(caTrack(t, [[A.c17, bAll, "reveal", { from: [0.0, 0.3, 1], pull0: 1.12, pull: 1.0 }], [T2, bA, "push", { from: [0.12, 0.3, 1], pull0: 1.3, pull: 1.08 }], [T3, bB, "truck", { from: [0.0, 0.32, 1], side: 0.25, pull: 1.08 }], [T4, bAll, "orbit", { from: [0.0, 0.35, 1], deg: 22, pull: 1.04 }]], A.end, 0.55)); };
});
