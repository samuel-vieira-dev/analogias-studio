// ============================================================================
// videos/2026-11-03-homicidios-brasil-mundo/scenes.js
// Homicídios: o Brasil × a média do mundo. Gancho: "No Brasil, uma pessoa é assassinada a cada treze
// minutos." → o relógio do escritório corre 13 minutos → mais de 100 por dia (calendário) → e o mundo?
// (bandeira e globo) → analogia: um estádio lotado de 100 mil pessoas que vivem juntas por um ano; cada
// pessoa assassinada vira um feixe de luz vermelho que sobe da cadeira: mundo 5, Brasil 19 (3,7×) → o 19 é
// boa notícia: a menor taxa desde 2012 (telão) → 2017, o pior ano: 31 → 2,6% das pessoas e quase 1 em 10
// assassinatos do mundo (colunas de vidro) → SC e SP, os mais seguros: quase 8, ainda acima do mundo → 9 em
// 10 homens, 8 em 10 negros (fileira de cadeiras) → o asterisco do Atlas: mortes de causa indefinida quase
// dobraram (pasta carimbada) → feixes cinza fora da conta → polícia na rua ou escola e emprego?
// Só números, sem governo nem partido. Números em fatos.md.
// Times come from audio/words.json (A below). Pattern: anim(t) animates objects only; CAM.move / homTrack
// frames the subject inside the centred safe zone; backdrops fill the whole frame.
// ============================================================================

const A = {
  assass: 1.76, treze: 2.98, minutos: 3.4, c1: 4.15, cem: 4.98, dia: 5.46, c2: 5.9,
  mas: 5.98, perto: 6.92, mundo: 7.82, c3: 8.25,
  imagina: 8.42, estadio: 9.82, lotado: 11.04, cemmil: 12.0, agora: 13.38, vivem: 15.62, cidade: 17.1, ano: 18.04,
  quantas: 18.72, c4: 20.22,
  media: 21.84, cinco: 22.86, com: 23.44, brasil: 24.28, dezenove: 25.1, c5: 26.0,
  quase: 26.12, vezes: 27.14, isso: 27.96, taxa: 29.44, c6: 31.42,
  agora2: 31.72, estranha: 32.36, esse: 33.14, boa: 34.6, c7: 35.48,
  em2025: 35.68, menor: 37.92, desde: 38.88, a2012: 39.28, comecou: 40.78, c8: 41.35,
  a2017: 41.78, pior: 43.12, trinta: 44.96, c9: 45.85,
  mesmo: 45.98, tres: 48.22, planeta: 49.72, quase2: 50.64, um: 51.0, dez: 51.94, mundo3: 53.3, c10: 53.74,
  muda: 54.54, mora: 56.14, santa: 56.76, sp: 57.7, seguros: 59.44, oito: 60.58, ainda: 61.38, mundo4: 62.44, c11: 62.84,
  sorteio: 63.38, nove: 64.16, homens: 65.98, oito2: 66.8, negros: 68.2, c12: 68.92,
  asterisco: 69.6, atlas: 71.14, escondidos: 73.08, morte: 74.08, causa: 74.74, definida: 75.06, quase4: 75.92, dobraram: 76.26, c13: 77.0,
  queda: 77.62, fora: 79.24, conta: 79.8, c14: 80.12,
  derruba: 81.52, policia: 83.76, rua: 84.4, escola: 85.46, emprego: 86.12, jovens: 86.74, comenta: 87.48, end: 89.7,
};

// ---------------------------------------------------------------- shared helpers
const homIn = (t, a, b) => t >= a && t < b;
// Several framings inside one shot, following the narration: segs = [[t0, box, move, opts], ...], the last
// one runs until `end`. Each framing runs its own camera move; the camera eases into the next over `ease` s.
function homTrack(t, segs, end, ease = 0.45) {
  const keys = segs.map(([t0, box, kind, o], i) => {
    const t1 = i + 1 < segs.length ? segs[i + 1][0] : end;
    return [t0, CAM.move(box, kind, lin(t, t0, t1), { zone: "stage", ...o }), ease];
  });
  return CAM.track(t, keys, ease);
}
// Outdoor and stadium shots: keep the far city and the floodlights out of the camera's fog.
function homFar(p, far = 120) { CAM.apply(p); scene.fog.near = Math.max(scene.fog.near, 8); scene.fog.far = Math.max(scene.fog.far, far); }
const HOM_NIGHT = (() => { const c = makeCanvas(16, 512), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, "#03060f"); g.addColorStop(0.55, "#0b1630"); g.addColorStop(0.85, "#1d2846"); g.addColorStop(1, "#2e2a3a"); x.fillStyle = g; x.fillRect(0, 0, 16, 512); return texFrom(c); })();
function homOfficeLook(set, t) {
  floor.visible = false; set.update(t);
  key.intensity = 1.8; key.color.set("#ffd6b0"); hemi.intensity = 0.45; hemi.color.set("#d6e2ff"); hemi.groundColor.set("#1a120c");
  scene.fog.color.set("#120e0c");
}
function homNightLook() {
  floor.visible = false; scene.background = HOM_NIGHT;
  key.intensity = 1.7; key.color.set("#e2e8ff"); hemi.intensity = 0.55; hemi.color.set("#a9bde8"); hemi.groundColor.set("#121612");
  scene.fog.color.set("#0a1222");
}
function homHallLook(hall, t) {
  floor.visible = false; hall.update(t);
  key.intensity = 2.0; key.color.set("#ffe6cc"); hemi.intensity = 0.5; hemi.color.set("#cfe0ff"); hemi.groundColor.set("#141216");
  scene.fog.color.set("#0a0e16");
}

// Dark wooden desk. Origin floor centre; returns { group, top }.
function makeHomDesk({ w = 2.4, d = 1.1, top = 0.75 } = {}) {
  const g = new THREE.Group();
  const mt = pmat("#ffffff", { map: woodTex({ base: "#3a2416", seed: 31 }), roughness: 0.35, clearcoat: 0.5 }), side = pmat("#24160d", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, 0.06, d, 0.02), [side, side, mt, side, side, side]); m.position.y = top - 0.03; g.add(m);
  for (const [x, z] of [[-w / 2 + 0.15, -d / 2 + 0.15], [w / 2 - 0.15, -d / 2 + 0.15], [-w / 2 + 0.15, d / 2 - 0.15], [w / 2 - 0.15, d / 2 - 0.15]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, top - 0.06, 12), side); l.position.set(x, (top - 0.06) / 2, z); g.add(l); }
  return { group: g, top };
}

// Wall clock of the hook: a cream dial with the numbers and minute ticks, a black case under glass, the
// hands, and a red wedge over the minutes that went by. set(min): the time is 21:00 + min and the wedge
// covers those minutes; pulse(k) brightens the wedge. Origin: centre, back on the wall; faces +z.
function makeHomClock(R = 0.42) {
  const g = new THREE.Group();
  const c = makeCanvas(512, 512), x = c.getContext("2d");
  x.fillStyle = "#efe6d4"; x.fillRect(0, 0, 512, 512); speckle(x, 512, 512, 3, 2500, 0.05, 0.04, 1.5);
  x.fillStyle = "#1c1814";
  for (let i = 0; i < 60; i++) { const big = i % 5 === 0; x.save(); x.translate(256, 256); x.rotate(i / 60 * Math.PI * 2); x.fillRect(-(big ? 6 : 2), -246, big ? 12 : 4, big ? 34 : 16); x.restore(); }
  x.font = "800 66px Inter"; x.textAlign = "center"; x.textBaseline = "middle";
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; x.fillText(String(i), 256 + Math.sin(a) * 172, 256 - Math.cos(a) * 172 + 4); }
  const back = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.08, R * 1.1, 0.05, 64), pmat("#18181a", { metalness: 0.5, roughness: 0.3, clearcoat: 0.6 })); back.rotation.x = Math.PI / 2; back.position.z = 0.025; g.add(back);
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 64), mat("#ffffff", { map: texFrom(c), roughness: 0.6 })); face.position.z = 0.052; g.add(face);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * 1.04, R * 0.07, 14, 72), pmat("#141416", { metalness: 0.6, roughness: 0.25, clearcoat: 1 })); rim.position.z = 0.06; g.add(rim);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(R * 1.0, 64), glassMat({ opacity: 0.12 })); glass.position.z = 0.09; g.add(glass);
  const wedgeM = new THREE.MeshBasicMaterial({ color: "#e0261b", transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false });
  const wedge = new THREE.Mesh(new THREE.CircleGeometry(R * 0.8, 4, Math.PI / 2, 0.01), wedgeM); wedge.position.z = 0.054; g.add(wedge);
  const hand = (len, wd, color, z, tail = 0.06) => { const p = new THREE.Group(), m = new THREE.Mesh(rbox(wd, len + tail, 0.008, wd * 0.4), pmat(color, { roughness: 0.4, metalness: 0.3 })); m.position.y = (len - tail) / 2; p.add(m); p.position.z = z; g.add(p); return p; };
  const hh = hand(R * 0.5, R * 0.075, "#1a1a1a", 0.06), mh = hand(R * 0.78, R * 0.05, "#1a1a1a", 0.068), sh = hand(R * 0.86, R * 0.018, "#d02a1e", 0.076, R * 0.2);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.06, R * 0.06, 0.03, 20), pmat("#d02a1e", { roughness: 0.3 })); cap.rotation.x = Math.PI / 2; cap.position.z = 0.078; g.add(cap);
  let lastA = -1;
  const set = (min, tsec = 0) => {
    mh.rotation.z = -min / 60 * Math.PI * 2; hh.rotation.z = -(9 + min / 60) / 12 * Math.PI * 2; sh.rotation.z = -(tsec % 60) / 60 * Math.PI * 2;
    const a = Math.round(min / 60 * Math.PI * 2 * 200) / 200;
    if (a !== lastA) { lastA = a; wedge.geometry.dispose(); wedge.geometry = new THREE.CircleGeometry(R * 0.8, 48, Math.PI / 2 - Math.max(0.01, a), Math.max(0.01, a)); }
  };
  set(0);
  return { group: g, set, pulse: (k) => { wedgeM.opacity = 0.5 + 0.35 * k; } };
}

// Night sky dome over the big stadium: a night and a day gradient that cross-fade (day(k)), stars, the sun on
// its arc and the moon. Backdrop (fog-free, inside the camera's far plane). API { group, set(day, sunA) }
function makeHomSky(R = 170) {
  const g = new THREE.Group();
  const grad = (stops) => { const c = makeCanvas(16, 512), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 512); stops.forEach(([p, col]) => gr.addColorStop(p, col)); x.fillStyle = gr; x.fillRect(0, 0, 16, 512); return texFrom(c); };
  const night = grad([[0, "#02040b"], [0.3, "#08122a"], [0.46, "#18223e"], [0.5, "#111a2c"], [1, "#0f1729"]]);
  const day = grad([[0, "#2c6dc4"], [0.3, "#5a9be0"], [0.46, "#b9d6ee"], [0.5, "#7d8994"], [1, "#7d8994"]]);   // under the horizon: the fog colour (the ground fades into it)
  const dome = (tex, r) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, transparent: true, depthWrite: false, toneMapped: false }));
  const n = dome(night, R), d = dome(day, R * 0.98); d.material.opacity = 0; n.renderOrder = -2; d.renderOrder = -1; g.add(n, d);
  const r = mulberry32(19), sp = [];
  for (let i = 0; i < 500; i++) { const a = r() * Math.PI * 2, e = 0.08 + r() * 1.3; sp.push(Math.cos(a) * Math.cos(e) * R * 0.95, Math.sin(e) * R * 0.95, Math.sin(a) * Math.cos(e) * R * 0.95); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#e8eeff", size: 2.2, sizeAttenuation: false, transparent: true, fog: false, depthWrite: false, toneMapped: false })); g.add(stars);
  const sun = sprite(BOKEH, 34); sun.material.color.set("#fff1c4"); sun.material.blending = THREE.AdditiveBlending; g.add(sun);
  const moon = sprite(BOKEH, 12); moon.material.color.set("#e9eeff"); moon.position.set(-60, 120, -120); g.add(moon);
  asBackdrop(g);
  const set = (k, sunA = 0) => {
    d.material.opacity = k; stars.material.opacity = 1 - k; moon.material.opacity = 0.75 * (1 - k);
    sun.position.set(Math.cos(sunA) * R * 0.8, Math.sin(sunA) * R * 0.55, -R * 0.45); sun.material.opacity = k; sun.visible = k > 0.01;
  };
  set(0);
  return { group: g, set };
}

// ============================================================ 1 + 2 · gancho: 13 minutos, mais de 100 por dia
// The office at night: on the wall above the desk the clock runs 13 minutes (the red wedge fills them) and
// locks with an impact on "treze minutos"; the city windows flash. The camera drops to the desk calendar,
// whose page flips from "1 DIA" to "+100" on "cem".
function buildHomOffice(S, seed, w = 2.2) {
  const office = makeOfficeSet({ wallZ: -1.6, clear: 2.6, seed }); S.backdrop(office.group);
  const desk = makeHomDesk({ w, d: 1.0 }); desk.group.position.z = -0.95; S.add(desk.group);
  // a window with the city at night right beside the clock (the set's own windows are out of a close frame)
  const win = makeSetWindow(0.9, 1.3, { seed: seed + 11 }); win.group.position.set(0.58, 1.95, -1.6 + 0.15); S.backdrop(win.group);
  return { office, desk, win, top: desk.top };
}
addScene("gancho", 0, A.c2, (S) => {
  const O = buildHomOffice(S, 4, 2.7);
  const clock = makeHomClock(0.42); clock.group.position.set(-0.45, 1.95, -1.6); S.add(clock.group);
  const cal = makeFlipCalendar(["1 DIA", "+100"], { w: 0.4, h: 0.34 }); cal.group.position.set(1.0, O.top, -0.62); cal.group.rotation.y = -0.22; S.add(cal.group);
  const mug = makeCoffeeMug(); mug.group.position.set(0.7, O.top, -0.56); S.add(mug.group);
  const minutes = (t) => 13 * eOut(lin(t, 0.15, A.treze));
  const anim = (t) => {
    homOfficeLook(O.office, t);
    O.office.windows(1 + 0.9 * beat(t, A.treze, 0.7), t > A.treze ? "#ffb4a8" : null); O.win.set(1 + 0.9 * beat(t, A.treze, 0.7), t > A.treze ? "#ffb4a8" : "#ffffff");
    clock.set(minutes(t), 50 + t); clock.pulse(beat(t, A.treze, 0.6) + 0.6 * beat(t, A.minutos, 0.5));
    cal.show(t > A.cem + 0.25 ? 1 : 0, t > A.cem + 0.25 ? 0 : sm(t, A.cem - 0.2, A.cem + 0.25));
    fill.position.set(0, 1.9, 0.6); fill.color.set(t > A.treze ? "#ff7a5a" : "#ffcf8a"); fill.intensity = 1.0 + 1.2 * beat(t, A.treze, 0.7);
  };
  S.hero(clock.group, "relógio de parede", { when: (t) => t < A.c1 - 0.7 });
  S.hero(cal.group, "calendário de mesa", { when: (t) => t > A.c1 + 0.5 });
  const bA = envelope([clock.group], anim, 0, A.c1), bB = envelope([cal.group, mug.group], anim, A.c1, A.c2);
  return (t) => {
    anim(t);
    let p = homTrack(t, [[0, bA, "push", { from: [0.06, 0.02, 1], pull0: 1.28, pull: 1.0 }], [A.c1, bB, "drop", { from: [-0.55, 1.45, 1], rise: 0.3, pull: 1.04 }]], A.c2, 0.6);
    p = CAM.shake(p, t, A.treze + 0.02, 0.016, 0.35); CAM.apply(p);
  };
});

// ============================================================ 3 · e o resto do mundo?
// The same office: on the desk the Brazilian flag on its pole and a desk globe (Brazil in green and yellow)
// that turns. Orbit.
addScene("mundo", A.c2, A.c3, (S) => {
  const O = buildHomOffice(S, 5);
  const flag = makeNationFlag("brasil", { poleH: 0.72, fw: 0.44, label: "BRASIL" }); flag.group.position.set(-0.46, O.top, -0.85); S.add(flag.group);
  const globe = makeDeskGlobe({ r: 0.2 }); globe.group.position.set(0.34, O.top, -0.85); S.add(globe.group);
  const anim = (t) => {
    homOfficeLook(O.office, t); O.office.windows(1 + 0.4 * beat(t, A.mundo - 0.2, 0.8));
    flag.update(t); globe.spin(0.5 * Math.sin((t - A.c2) * 0.9) - 0.15);
    fill.position.set(0, O.top + 0.9, 0.2); fill.color.set("#ffcf8a"); fill.intensity = 1.0 + 0.5 * beat(t, A.mundo - 0.2, 0.8);
  };
  S.hero(flag.group, "bandeira do brasil"); S.hero(globe.group, "globo de mesa");
  const box = envelope([flag.group, globe.group], anim, A.c2, A.c3);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.c2, A.c3), { zone: "stage", from: [0, 0.28, 1], deg: 34, pull: 1.04 })); };
});

// ============================================================ 4–8 · o estádio de 100 mil pessoas
// A big stadium at night, full (camera flashes in the stands), in the middle of the city; floodlights on.
// "Por um ano": the sky runs from night to day and back twice, the floodlights go out by day. "Quantas?":
// the camera closes in on the near stands. Then (feixes) on "cinco" five red beams rise from five seats
// (the world's average), and on "dezenove" fourteen more (Brazil's): one beam = one person killed.
const HOM_BIG = 7;   // with the camera ~100 m out, the sky (170) and the ground (160) stay inside the camera's far plane (300)
function buildHomBigStadium(S, seed) {
  const sky = makeHomSky(); S.backdrop(sky.group);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 96), mat("#ffffff", { map: tileTex(asphaltTex(), 60, 60), color: "#5a5c60", roughness: 0.9 }));   // inside the sky dome: past it the ground would show against the sky ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; S.backdrop(ground);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mat("#ffffff", { map: tileTex(asphaltTex(), 12, 12), color: "#77797e", roughness: 0.85 })); plaza.rotation.x = -Math.PI / 2; plaza.scale.set(17, 13, 1); plaza.position.y = -0.02; S.backdrop(plaza);
  const city = makeSkyline({ n: 60, z: -30, spread: 140, seed: 13, hMin: 3, hMax: 11 }); city.group.scale.setScalar(1.15); S.backdrop(city.group);
  const lamps = makeBokeh({ n: 70, center: [0, 0.9, 0], spread: [64, 1.0, 50], size: [0.4, 1.0], colors: ["#ffd59a", "#fff2dc"], opacity: 0.5, seed: seed + 3 }); S.backdrop(lamps.group);
  const bowl = makeStadiumBowl({ size: HOM_BIG, band: "#e8b923", seed, beamR: 0.034, beamH: 0.72 }); S.add(bowl.group);
  // a fog-coloured skirt over the far ground: the ground fades into the lower half of the sky, no edge
  const skirtA = (() => { const c = makeCanvas(256, 256), x = c.getContext("2d"), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "#000"); gr.addColorStop(0.3, "#000"); gr.addColorStop(0.8, "#fff"); gr.addColorStop(1, "#fff"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return texFrom(c); })();
  const skirt = new THREE.Mesh(new THREE.CircleGeometry(160, 96), new THREE.MeshBasicMaterial({ color: "#0f1729", alphaMap: skirtA, transparent: true, depthWrite: false, fog: false, toneMapped: false })); skirt.rotation.x = -Math.PI / 2; skirt.position.y = 0.02; S.backdrop(skirt);
  const NIGHT_FOG = new THREE.Color("#0f1729"), DAY_FOG = new THREE.Color("#7d8994");
  const update = (t, day = 0) => {
    homNightLook(); city.update(t); lamps.update(t); bowl.update(t);
    key.intensity = 1.5 + 1.8 * day; key.color.set("#e2e8ff").lerp(new THREE.Color("#fff1dc"), day); hemi.intensity = 0.55 + 0.7 * day; hemi.color.set("#a9bde8").lerp(new THREE.Color("#cfe3ff"), day);
    scene.fog.color.copy(NIGHT_FOG).lerp(DAY_FOG, day); skirt.material.color.copy(scene.fog.color);
    bowl.lights(1 - day);
  };
  return { sky, bowl, update };
}
addScene("estadio", A.c3, A.c4, (S) => {
  const B = buildHomBigStadium(S, 5);
  const day = (t) => (t < A.agora + 0.2 || t > A.ano + 0.6) ? 0 : 0.5 - 0.5 * Math.cos(Math.PI * 2 * (t - A.agora - 0.2) / ((A.ano + 0.6 - A.agora - 0.2) / 2));
  const anim = (t) => {
    const k = day(t); B.update(t, k);
    B.sky.set(k, Math.PI * ((t - A.agora - 0.2) / ((A.ano + 0.6 - A.agora - 0.2) / 2) % 1));
    fill.position.set(0, 8, 14); fill.color.set("#ffe2b0"); fill.intensity = 0;
  };
  const CL = A.quantas - 0.1;
  S.hero(B.bowl.group, "estádio lotado", { when: (t) => t < CL - 0.45 }); S.hero(B.bowl.back, "arquibancada lotada", { when: (t) => t > CL + 0.3 });
  const box = envelope([B.bowl.group], anim, A.c3, CL), bF = envelope([B.bowl.back], anim, CL, A.c4);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c3, box, "drop", { from: [0, 1.0, 1], rise: 0.55, pull: 1.02 }], [A.agora, box, "orbit", { from: [0.15, 0.42, 1], deg: 40, pull: 1.02 }], [CL, bF, "push", { from: [0.05, 0.5, 1], pull0: 1.25, pull: 1.0 }]], A.c4, 0.55), 236); };
});
addScene("feixes", A.c4, A.c5, (S) => {
  const B = buildHomBigStadium(S, 5);
  const nBeams = (t) => 5 * lin(t, A.cinco - 0.55, A.cinco + 0.05) + 14 * lin(t, A.brasil - 0.1, A.dezenove + 0.05);
  const anim = (t) => {
    B.update(t, 0); B.sky.set(0); B.bowl.beams(nBeams(t));
    fill.position.set(0, 6, 12); fill.color.set("#ff3a2a"); fill.intensity = 0.0;
  };
  S.hero(B.bowl.group, "estádio com feixes vermelhos");
  const TR = A.com - 0.05;
  const bA = envelope([B.bowl.group], anim, A.c4, TR), bB = envelope([B.bowl.group], anim, TR, A.c5);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c4, bA, "crane", { from: [0.2, 0.55, 1], rise: 0.2, pull: 1.02 }], [TR, bB, "truck", { from: [-0.1, 0.62, 1], side: 0.35, pull: 1.02 }]], A.c5, 0.5), 236); };
});

// ============================================================ 9–13 · as maquetes no gramado à noite
// Model stadiums on black plinths on the pitch of a stadium at night (floodlights and the stands far
// behind). The beams are the same as in the big stadium: MUNDO 5, BRASIL 19.
function makeHomModel(S, label, { x = 0, z = 0, size = 1, band = "#3a7bd5", seed = 5, PH = 0.58, plateH = 0.47 } = {}) {
  const pl = makeLabelPlinth(label, { w: 3.7 * size, h: PH, d: 2.7 * size, plateH }); pl.group.position.set(x, 0, z); S.add(pl.group);
  const bowl = makeStadiumBowl({ size, band, seed, beamR: 0.028, beamH: 0.72 }); bowl.group.position.set(x, PH, z); S.add(bowl.group);
  S.solid(pl.group, "base " + label); S.solid(bowl.group, "maquete " + label, { restsOn: ["base " + label] });
  return { pl, bowl, group: bowl.group, plinth: pl.group };
}
function homModelLook(night, t) { homNightLook(); night.update(t); }
// The pitch of the backdrop a shade darker: at night the grass should not outshine the models.
function homNight(S, seed) { const n = makeStadiumNight({ goal: false, seed }); n.pitch.group.children[0].material.color.set("#7f8c80"); n.pitch.setSpot(0); S.backdrop(n.group); return n; }
addScene("comparar", A.c5, A.c6, (S) => {
  const night = homNight(S, 7);
  const M = makeHomModel(S, "MUNDO", { x: -0.95, z: -1.5, size: 0.8, band: "#3a7bd5", seed: 3 }), B = makeHomModel(S, "BRASIL", { x: 0.95, z: 1.5, size: 0.8, band: "#2fae66", seed: 5 });
  const anim = (t) => {
    homModelLook(night, t); M.bowl.update(t); B.bowl.update(t); M.bowl.beams(5); B.bowl.beams(19);
    fill.position.set(0, 2.5, 3); fill.color.set("#ff5a3a"); fill.intensity = 0.6 + 1.2 * beat(t, A.vezes - 0.1, 0.8);
  };
  const ORB = A.isso - 0.1;
  S.hero(M.group, "maquete mundo", { when: (t) => t < ORB - 0.45 }); S.hero(M.plinth, "base mundo", { when: (t) => t < ORB - 0.45 });
  S.hero(B.group, "maquete brasil"); S.hero(B.plinth, "base brasil");
  const bA = envelope([M.group, M.plinth, B.group, B.plinth], anim, A.c5, ORB), bB = envelope([B.group, B.plinth], anim, ORB, A.c6);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c5, bA, "reveal", { from: [0.1, 0.85, 1], pull0: 1.06, pull: 1.0 }], [ORB, bB, "orbit", { from: [0.1, 0.55, 1], deg: 38, pull: 1.02 }]], A.c6, 0.55), 90); };
});
addScene("boanoticia", A.c6, A.c7, (S) => {
  const night = homNight(S, 9);
  const B = makeHomModel(S, "BRASIL", { band: "#2fae66", seed: 5 });
  const anim = (t) => {
    homModelLook(night, t); B.bowl.update(t); B.bowl.beams(19);
    const red = homIn(t, A.estranha - 0.2, A.boa - 0.1), green = t >= A.boa - 0.1;
    B.bowl.lights(1, green ? "#5dff96" : red ? "#ff4a3a" : null); B.bowl.band(green ? "#3dff7a" : "#2fae66");
    fill.position.set(0, 2.2, 2.4); fill.color.set(green ? "#3dff7a" : red ? "#ff3a2a" : "#ffd9b0"); fill.intensity = green ? 2.0 + 1.5 * beat(t, A.boa, 0.8) : red ? 1.4 : 0.6;
    hemi.color.set(green ? "#9dffc0" : red ? "#ff9a8a" : "#a9bde8");
  };
  S.hero(B.group, "maquete brasil"); S.hero(B.plinth, "base brasil");
  const box = envelope([B.group, B.plinth], anim, A.c6, A.c7);
  return (t) => { anim(t); homFar(CAM.move(box, "crane", lin(t, A.c6, A.c7), { zone: "stage", from: [-0.15, 0.45, 1], rise: 0.3, pull: 1.02 }), 90); };
});

// ============================================================ 12 · o telão: a menor taxa desde 2012
// The stadium scoreboard on the pitch draws Brazil's rate year by year (ONU/UNODC 2012–2023, FBSP 2025): it
// climbs to the 2017 peak and comes down to the lowest point, under the dashed line where it started (2012).
const HOM_SERIES = [[2012, 28.64], [2013, 28.64], [2014, 29.85], [2015, 28.85], [2016, 30.12], [2017, 31.16], [2018, 27.16], [2019, 21.24], [2020, 21.81], [2021, 20.5], [2022, 20.08], [2023, 19.28], [2025, 19.1]];
function homPaintChart(board, k, low) {
  const key0 = Math.round(k * 160) + "|" + Math.round(low * 20); if (board.userData === key0) return; board.userData = key0;
  board.paint((x, W2, H2) => {
    const bg = x.createLinearGradient(0, 0, 0, H2); bg.addColorStop(0, "#10141c"); bg.addColorStop(1, "#06080c"); x.fillStyle = bg; x.fillRect(0, 0, W2, H2);
    x.fillStyle = "rgba(255,255,255,0.05)"; for (let yy = 0; yy < H2; yy += 6) x.fillRect(0, yy, W2, 2);   // LED rows
    x.fillStyle = "#ffffff"; x.font = "900 86px Inter"; x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillText("HOMICÍDIOS · BRASIL", 60, 118);
    const X = (y) => 110 + (y - 2012) / 13 * (W2 - 260), Y = (v) => H2 - 110 - (v - 16) / (33 - 16) * (H2 - 300);
    x.setLineDash([24, 18]); x.strokeStyle = "rgba(244,241,234,0.55)"; x.lineWidth = 5; x.beginPath(); x.moveTo(80, Y(28.64)); x.lineTo(W2 - 80, Y(28.64)); x.stroke(); x.setLineDash([]);
    x.fillStyle = "rgba(244,241,234,0.85)"; x.font = "800 60px Inter"; x.textAlign = "left"; x.fillText("2012", 80, H2 - 40); x.textAlign = "right"; x.fillText("2025", W2 - 80, H2 - 40);
    const P = HOM_SERIES.map(([y, v]) => [X(y), Y(v)]), seg = []; let tot = 0;
    for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; }
    let left = tot * k, hx = P[0][0], hy = P[0][1];
    x.strokeStyle = "#ff4a3a"; x.lineWidth = 16; x.lineJoin = "round"; x.lineCap = "round"; x.beginPath(); x.moveTo(hx, hy);
    for (let i = 1; i < P.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); hx = lerp(P[i - 1][0], P[i][0], f); hy = lerp(P[i - 1][1], P[i][1], f); x.lineTo(hx, hy); left -= seg[i - 1]; }
    x.stroke();
    if (low > 0.01) { x.fillStyle = `rgba(61,220,132,${0.35 * low})`; x.beginPath(); x.arc(hx, hy, 34 + 26 * low, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(hx, hy, 20, 0, Math.PI * 2); x.fill(); x.fillStyle = low > 0.5 ? "#3ddc84" : "#ff4a3a"; x.beginPath(); x.arc(hx, hy, 11, 0, Math.PI * 2); x.fill();
  });
}
addScene("telao", A.c7, A.c8, (S) => {
  const night = homNight(S, 11);
  const board = makeScoreboard({ w: 3.4, h: 1.9, legH: 1.5 }); board.group.position.set(0, 0, -0.5); S.add(board.group); board.userData = "";
  const anim = (t) => {
    homModelLook(night, t);
    homPaintChart(board, sm(t, A.c7 + 0.1, A.menor - 0.1), sm(t, A.menor - 0.1, A.menor + 0.4));
    fill.position.set(0, 2.2, 2.5); fill.color.set(t > A.menor ? "#5dff96" : "#ff6a4a"); fill.intensity = 0.8 + 0.8 * beat(t, A.menor, 0.8);
  };
  S.hero(board.group, "telão do estádio");
  const OR = A.desde - 0.2, box = envelope([board.group], anim, A.c7, A.c8);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c7, box, "push", { from: [0.08, 0.15, 1], pull0: 1.25, pull: 1.0 }], [OR, box, "orbit", { from: [0.1, 0.2, 1], deg: 26, pull: 1.0 }]], A.c8, 0.6), 90); };
});

// ============================================================ 13 · 2017, o pior ano: 31
addScene("pior", A.c8, A.c9, (S) => {
  const night = homNight(S, 13);
  const B = makeHomModel(S, "BRASIL", { band: "#2fae66", seed: 5 });
  const n = (t) => 19 + 12 * lin(t, A.a2017, A.trinta + 0.05);
  const anim = (t) => {
    homModelLook(night, t); B.bowl.update(t); B.bowl.beams(n(t));
    fill.position.set(0, 2.4, 2.4); fill.color.set("#ff3a2a"); fill.intensity = 0.8 + 1.6 * beat(t, A.trinta, 0.8);
  };
  S.hero(B.group, "maquete brasil com 31 feixes"); S.hero(B.plinth, "base brasil");
  const box = envelope([B.group, B.plinth], anim, A.c8, A.c9);
  return (t) => { anim(t); let p = CAM.move(box, "drop", lin(t, A.c8, A.c9), { zone: "stage", from: [0.12, 0.85, 1], rise: 0.35, pull: 1.02 }); p = CAM.shake(p, t, A.trinta, 0.012, 0.3); homFar(p, 90); };
});

// ============================================================ 14 · 2,6% das pessoas, quase 1 em 10 assassinatos
// A glass hall with the city at night: on one black plinth two discs of the world cut like a pie, at their
// true scale. PESSOAS: Brazil's slice, 2,6%, rises on "três por cento"; ASSASSINATOS: Brazil's slice, 9,7%
// (almost one in ten), on "um em cada dez". Truck along the plinth, then crane over the red slice.
addScene("planeta", A.c9, A.c10, (S) => {
  const hall = makeEraHall([{ x0: -10, x1: 10, kind: "modern" }], { wallZ: -3.4, ceil: 8, seed: 6 }); S.backdrop(hall.group);
  const PT = 0.5, plinth = makeLabelPlinth(null, { w: 2.8, h: PT, d: 1.3 }); S.add(plinth.group);
  const XS = [-0.68, 0.68];
  const dP = makeShareDisc({ r: 0.58, h: 0.08, color: "#e8b923" }); dP.group.position.set(XS[0], PT, -0.02); S.add(dP.group);
  const dA = makeShareDisc({ r: 0.58, h: 0.08, color: RED }); dA.group.position.set(XS[1], PT, -0.02); S.add(dA.group);
  const pP = makePlate("PESSOAS", 1.32, 0.36, { bg: "#141414", fg: "#ffffff" }); pP.position.set(XS[0], PT / 2, 0.666); plinth.group.add(pP);
  const pA = makePlate("ASSASSINATOS", 1.32, 0.36, { bg: RED, fg: "#ffffff" }); pA.position.set(XS[1], PT / 2, 0.666); plinth.group.add(pA);
  const anim = (t) => {
    homHallLook(hall, t); hall.tint(0.22 * beat(t, A.dez, 1.0), "#ff3a2a");
    dP.set(0.026 * sm(t, A.tres - 0.3, A.tres + 0.5), sm(t, A.tres + 0.2, A.tres + 0.8)); dA.set(0.097 * sm(t, A.quase2 - 0.1, A.dez + 0.2), sm(t, A.dez, A.dez + 0.6));
    fill.position.set(0.3, 1.8, 1.6); fill.color.set(t > A.quase2 ? "#ff7a5a" : "#ffd9b0"); fill.intensity = 1.1 + 0.8 * beat(t, A.dez, 0.8);
  };
  const UP = A.quase2 - 0.35;
  S.hero(plinth.group, "base pessoas e assassinatos", { when: (t) => t < UP - 0.45 }); S.hero(dP.group, "disco pessoas"); S.hero(dA.group, "disco assassinatos");
  const bA = envelope([plinth.group, dP.group, dA.group], anim, A.c9, UP), bB = envelope([dP.group, dA.group, pP, pA], anim, UP, A.c10);
  return (t) => { anim(t); CAM.apply(homTrack(t, [[A.c9, bA, "truck", { from: [0.1, 0.68, 1], side: 0.3, pull: 1.0 }], [UP, bB, "crane", { from: [0.15, 0.85, 1], rise: 0.25, pull: 1.02 }]], A.c10, 0.55)); };
});

// ============================================================ 15–16 · Santa Catarina e São Paulo: quase 8, ainda acima do mundo
// Three model stadiums in a row on the pitch at night: SC, SP and MUNDO. Truck along the row; on "Santa
// Catarina" and "São Paulo" eight beams rise from each; on "ainda acima do mundo" the five of MUNDO.
addScene("estados", A.c10, A.c11, (S) => {
  const night = homNight(S, 15);
  const SZ = 0.75, TALL = { PH: 0.72, plateH: 0.6 };
  const sc = makeHomModel(S, "SC", { x: -1.6, z: -2.1, size: SZ, band: "#2fae66", seed: 21, ...TALL }), sp = makeHomModel(S, "SP", { x: 0, z: 1.1, size: SZ, band: "#2fae66", seed: 23, ...TALL }), mu = makeHomModel(S, "MUNDO", { x: 1.6, z: -2.1, size: SZ, band: "#3a7bd5", seed: 3, ...TALL });
  const anim = (t) => {
    homModelLook(night, t); [sc, sp, mu].forEach((m) => m.bowl.update(t));
    sc.bowl.beams(8 * lin(t, A.santa - 0.1, A.santa + 1.0)); sp.bowl.beams(8 * lin(t, A.sp - 0.1, A.sp + 1.0)); mu.bowl.beams(5 * lin(t, A.ainda - 0.1, A.ainda + 0.5));
    fill.position.set(0, 2.4, 3); fill.color.set("#ff6a4a"); fill.intensity = 0.7 + 0.8 * beat(t, A.oito, 0.8);
  };
  const PU = A.santa - 0.3, RV = A.ainda - 0.25;
  const first = (t) => t < RV - 0.45, last = (t) => t > RV + 0.3;
  S.hero(sc.group, "maquete sc", { when: first }); S.hero(sc.plinth, "base sc", { when: first }); S.hero(sp.group, "maquete sp"); S.hero(sp.plinth, "base sp");
  S.hero(mu.group, "maquete mundo", { when: last }); S.hero(mu.plinth, "base mundo", { when: last });
  const bA = envelope([sc.group, sc.plinth, sp.group, sp.plinth], anim, A.c10, PU), bB = bA;
  const bC = envelope([sp.group, sp.plinth, mu.group, mu.plinth], anim, RV, A.c11);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c10, bA, "truck", { from: [-0.1, 1.05, 1], side: 0.3, pull: 1.0 }], [PU, bB, "push", { from: [-0.15, 1.0, 1], pull0: 1.08, pull: 1.0 }], [RV, bC, "reveal", { from: [0.15, 1.05, 1], pull0: 1.06, pull: 1.0 }]], A.c11, 0.55), 90); };
});

// ============================================================ 17 · 9 em 10 homens, 8 em 10 negros
// A row of ten stadium seats in the stands at night (the stands full of fans rising behind it): nine light
// up red with their beams on "homens"; on "negros" one goes out: eight. Truck along the row, then push.
function makeHomStands(rowW, seed, levels = 2) {
  const g = new THREE.Group(), r = mulberry32(seed), SH = 0.42;
  const concrete = pmat("#ffffff", { map: tileTex(cachedTex("stadiumConcrete2", () => noiseTex({ base: "#7f7c78", amount: 0.18, size: 2, seed: 73 })), 60, 1), roughness: 0.85 });
  const fans = [];
  const step = (x0, x1, top, z0, z1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, top, z1 - z0), concrete); m.position.set((x0 + x1) / 2, top / 2, (z0 + z1) / 2); g.add(m); for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.55) if (r() > 0.18) fans.push([x + (r() - 0.5) * 0.1, top, (z0 + z1) / 2 - 0.05]); };
  // the hero row's own two levels continue to the sides; above them, the stands rise to the roof
  const back = -(levels - 1) * 0.85 - 0.6;
  for (let l = 1; l <= levels; l++) { const z1 = -(l - 1) * 0.85, z0 = l < levels ? z1 - 0.85 : back; step(-30, -rowW / 2, l * SH, z0, z1); step(rowW / 2, 30, l * SH, z0, z1); }
  for (let i = 0; i < 12; i++) step(-30, 30, (i + levels + 1) * SH, back - (i + 1) * 0.85, back - i * 0.85);
  const shirts = ["#3a3f4a", "#5a2a2a", "#2e4a6a", "#b9b1a6", "#6a5e50", "#2f5a3a", "#8a7434", "#4a3a5a", "#1f2226", "#7a2e22"].map((c) => new THREE.Color(c));
  const skins = ["#c99a70", "#a8714a", "#8d5a3a", "#5a3a26", "#dcb08a", "#7a4e32"].map((c) => new THREE.Color(c));
  const bodies = new THREE.InstancedMesh(rbox(0.38, 0.5, 0.26, 0.12, 3), pmat("#9a9a9a", { roughness: 0.9 }), fans.length), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.095, 14, 10), pmat("#a8a8a8", { roughness: 0.6 }), fans.length), o = new THREE.Object3D();
  fans.forEach(([x, y, z], i) => { const s = 0.9 + r() * 0.2; o.position.set(x, y + 0.3 * s, z); o.rotation.set(0, (r() - 0.5) * 0.4, 0); o.scale.setScalar(s); o.updateMatrix(); bodies.setMatrixAt(i, o.matrix); bodies.setColorAt(i, shirts[Math.floor(r() * shirts.length)]); o.position.y = y + 0.66 * s; o.updateMatrix(); heads.setMatrixAt(i, o.matrix); heads.setColorAt(i, skins[Math.floor(r() * skins.length)]); });
  g.add(bodies, heads);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 8), pmat("#1c1e22", { roughness: 0.7 })); roof.position.set(0, (13 + levels) * SH + 2.2, back - 8); g.add(roof);
  const lampM = new THREE.MeshBasicMaterial({ color: "#fff3dc", toneMapped: false });
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.3), lampM); l.position.set((i - 4) * 3.2, (13 + levels) * SH + 2.02, back - 4.4); g.add(l); }
  const flashes = makeBokeh({ n: 40, center: [0, 3.2, -6], spread: [26, 4, 6], size: [0.08, 0.2], colors: ["#ffffff", "#fff2dc"], opacity: 0.6, seed: seed + 5 }); g.add(flashes.group);
  asBackdrop(g);
  return { group: g, update: (t) => flashes.update(t) };
}
addScene("quem", A.c11, A.c12, (S) => {
  const row = makeStadiumSeatRow({ n: 5, rows: 2, gap: 0.56, color: "#6a707a", beamH: 1.15 }); S.add(row.group);
  const stands = makeHomStands(5 * 0.54 + 0.4, 9, row.levels); S.backdrop(stands.group);
  const pitch = makePitch(); pitch.group.position.set(0, 0, 14); S.backdrop(pitch.group);
  const order = [0, 4, 7, 2, 9, 5, 1, 8, 3, 6];   // the seat that stays dark: 6 for "homens", then 3 also goes out for "negros"
  const anim = (t) => {
    homNightLook(); stands.update(t);
    order.slice(0, 9).forEach((i, j) => row.light(i, sm(t, A.nove - 0.1 + j * 0.16, A.nove + 0.25 + j * 0.16) * (j === 8 ? 1 - sm(t, A.oito2 - 0.1, A.oito2 + 0.35) : 1)));
    fill.position.set(0, 1.6, 2.2); fill.color.set("#ff4a3a"); fill.intensity = 0.4 + 1.2 * sm(t, A.nove, A.homens);
  };
  S.hero(row.group, "fileira de cadeiras de estádio");
  const PU = A.oito2 - 0.3, box = envelope([row.group], anim, A.c11, A.c12);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c11, box, "truck", { from: [0.2, 0.62, 1], side: 0.35, pull: 1.02 }], [PU, box, "push", { from: [-0.1, 0.7, 1], pull0: 1.15, pull: 1.0 }]], A.c12, 0.5), 60); };
});

// ============================================================ 18 · o asterisco: assassinatos escondidos quase dobraram
// The office desk under a pendant lamp: the report ATLAS DA VIOLÊNCIA and a pile of case folders MORTE
// VIOLENTA. On "causa definida" the stamp comes down on the top folder: CAUSA INDEFINIDA (impact). On
// "quase dobraram" the pile goes from 8 to 15 stamped folders, one dropping on top of the other.
addScene("asterisco", A.c12, A.c13, (S) => {
  const O = buildHomOffice(S, 6);
  const book = makeLawBook({ w: 1.8, d: 2.3, t: 0.3, color: "#3a1a14", title: "ATLAS DA", emblem: false }); book.print("VIOLÊNCIA", 1.44, 0.34, -2.3 * 0.12); book.group.scale.setScalar(0.42); book.group.position.set(-0.46, O.top, -0.92); book.group.rotation.y = 0.14; S.add(book.group);
  const pile = new THREE.Group(); pile.position.set(0.22, O.top, -0.82); S.add(pile);
  const FT = 0.034, N0 = 8, N1 = 15, r = mulberry32(5);
  const folders = Array.from({ length: N1 }, (_, i) => {
    const f = makeFolder("ÓBITO", { w: 0.56, h: 0.7, color: i % 3 ? "#e3bf78" : "#d9b06a" });
    f.scale.set(1, 1, FT / 0.07); f.rotation.set(-Math.PI / 2, 0, (r() - 0.5) * 0.12); f.position.set((r() - 0.5) * 0.03, FT / 2 + i * FT, 0.35 + (r() - 0.5) * 0.03);
    f.traverse((n) => { if (n.userData.plate) n.position.y = 0.7 * 0.26; });   // the label on the near half: the stamp lands on the far half and never covers it
    const ink = makeInkMark("SEM CAUSA", 0.5, 0.19, { seed: 7 + i }); ink.position.set(0, 0.7 * 0.66, 0.0352); ink.material.opacity = 0; ink.visible = false; f.add(ink);
    pile.add(f); return { f, ink, y: FT / 2 + i * FT };
  });
  const stamp = makeStamp({ w: 1.25, d: 0.62 }); stamp.scale.setScalar(0.38); S.add(stamp);
  const STAMP = A.definida - 0.05, n = (t) => N0 + (N1 - N0) * lin(t, A.quase4 - 0.05, A.dobraram + 0.55);
  const anim = (t) => {
    homOfficeLook(O.office, t); O.office.lights(0.55); O.office.windows(0.8 + 0.5 * beat(t, STAMP, 0.6), t > STAMP ? "#ffb4a8" : null);
    const k = n(t), topI = k > N0 ? Math.min(N1 - 1, Math.ceil(k - 0.001) - 1) : N0 - 1;
    folders.forEach((F, i) => {
      const fall = clamp(k - i); F.f.visible = i < N0 || fall > 0.01;
      F.f.position.y = F.y + (i < N0 ? 0 : 0.18 * (1 - eOut(fall)));
      F.ink.material.opacity = i === N0 - 1 ? sm(t, STAMP, STAMP + 0.05) : i >= N0 ? 1 : 0; F.ink.visible = F.ink.material.opacity > 0.02 && i === topI;   // only the top folder's mark shows: the others are under it
    });
    // the stamp: comes in over the pile, presses on STAMP, goes back up and out
    const topY = O.top + N0 * FT, down = sm(t, STAMP - 0.35, STAMP) * (1 - sm(t, STAMP + 0.3, STAMP + 0.75));
    stamp.visible = homIn(t, A.morte - 0.3, A.quase4 - 0.1);
    stamp.position.set(0.22, topY + 0.004 + 0.2 * (1 - down) + 0.18 * (1 - sm(t, A.morte - 0.3, A.morte + 0.3)), -0.82 + 0.35 - 0.7 * 0.66);
    fill.position.set(0.2, O.top + 0.9, -0.2); fill.color.set(t > STAMP ? "#ff6a4a" : "#ffcf8a"); fill.intensity = 0.9 + 1.4 * beat(t, STAMP, 0.6);
  };
  const DR = A.morte - 0.35;
  S.hero(book.group, "relatório atlas da violência", { when: (t) => t < DR - 0.45 }); S.hero(pile, "pilha de pastas");
  S.hero(stamp, "carimbo", { when: (t) => homIn(t, STAMP - 0.3, STAMP + 0.3) });
  const bA = envelope([book.group, pile], anim, A.c12, DR), bB = envelope([pile, stamp], anim, DR, A.c13);
  return (t) => {
    anim(t);
    let p = homTrack(t, [[A.c12, bA, "push", { from: [0.1, 1.15, 1], pull0: 1.05, pull: 1.0 }], [DR, bB, "drop", { from: [-0.05, 1.15, 1], rise: 0.15, pull: 1.0 }]], A.c13, 0.55);
    p = CAM.shake(p, t, STAMP, 0.02, 0.35); CAM.apply(p);
  };
});

// ============================================================ 19 · parte da queda pode ser assassinato fora da conta
// The BRASIL model again with its 19 red beams; on "fora da conta" three grey beams rise (the Atlas estimate:
// with the hidden cases the count would be ~16,6% higher, ≈ 3 more per 100 mil). Reveal.
addScene("fora", A.c13, A.c14, (S) => {
  const night = homNight(S, 17);
  const B = makeHomModel(S, "BRASIL", { band: "#2fae66", seed: 5 });
  const anim = (t) => {
    homModelLook(night, t); B.bowl.update(t); B.bowl.beams(19); B.bowl.ghosts(3 * lin(t, A.fora - 0.3, A.conta + 0.1));
    fill.position.set(0, 2.4, 2.4); fill.color.set("#c9d4e0"); fill.intensity = 0.6 + 1.0 * beat(t, A.fora, 0.8);
  };
  S.hero(B.group, "maquete brasil com feixes cinza"); S.hero(B.plinth, "base brasil");
  const box = envelope([B.group, B.plinth], anim, A.c13, A.c14);
  return (t) => { anim(t); homFar(CAM.move(box, "reveal", lin(t, A.c13, A.c14), { zone: "stage", from: [-0.2, 0.5, 1], pull0: 1.2, pull: 1.0 }), 90); };
});

// ============================================================ 20 · mais polícia na rua ou mais escola e emprego?
// A street at night: a generic police car with its lights flashing on the left, a school with its windows
// lit on the right, street lamps and the city behind. Orbit → push on the car ("polícia na rua") → truck to
// the school ("escola e emprego") → reveal both.
function makeHomLamp(h = 4.2) {
  const g = new THREE.Group(), m = pmat("#24262a", { metalness: 0.6, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, h, 10), m); pole.position.y = h / 2; g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.05), m); arm.position.set(0.38, h, 0); g.add(arm);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.18), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); head.position.set(0.7, h - 0.05, 0); g.add(head);
  const glow = sprite(BOKEH, 2.0); glow.material.color.set("#ffcf8a"); glow.material.blending = THREE.AdditiveBlending; glow.position.copy(head.position); g.add(glow);
  const pool = makeFloorGlow(4, 4, { color: "#ffd59a", opacity: 0.16 }); pool.position.set(0.7, 0.02, 0); g.add(pool);
  return asBackdrop(g);
}
addScene("pergunta", A.c14, A.end, (S) => {
  const g = new THREE.Group(); S.backdrop(g);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), mat("#ffffff", { map: tileTex(grassTex(), 30, 16), roughness: 0.95 })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.001, -8); g.add(grass);
  const road = makeTwoLaneRoad({ lane: 2.0, back: 30, front: 30 }); road.group.rotation.y = Math.PI / 2; road.group.position.z = 1.6; g.add(road.group);
  const walk = new THREE.Mesh(rbox(60, 0.12, 1.4, 0.02), mat("#ffffff", { map: tileTex(plasterTex("#8f8a84"), 20, 0.6), roughness: 0.85 })); walk.position.set(0, 0.06, -1.15); g.add(walk);
  const sky = makeSkyline({ z: -26, seed: 23, hMin: 5, hMax: 16, spread: 70 }); g.add(sky.group);
  [-8.6, -4.6, 5.0, 9.0].forEach((x) => { const l = makeHomLamp(); l.position.set(x, 0.12, -0.8); g.add(l); });
  asBackdrop(g);
  const car = makePoliceCar({ label: "POLÍCIA" }); car.group.position.set(-2.4, 0.02, 0.62); car.group.rotation.y = Math.PI + 0.08; S.add(car.group);
  car.group.traverse((n) => { if (n.userData.plate) n.visible = false; });   // the thin side band text: replaced by a door decal you can read
  const decals = [1, -1].map((sd) => { const d = makePlate("POLÍCIA", 1.9, 0.4, { bg: "#eceae5", fg: "#141414", depth: 0.006 }); d.position.set(-0.15, 0.64, sd * (car.W / 2 + 0.008)); if (sd < 0) d.rotation.y = Math.PI; car.group.add(d); return d; });
  const school = makeCivicBuilding({ kind: "escola", label: "ESCOLA", w: 4.0, h: 2.3, d: 2.1 }); school.group.position.set(1.6, 0.12, -2.6); S.add(school.group);
  const CAR = A.policia - 0.35, SCH = A.escola - 0.35, ALL = A.jovens + 0.1, BACK = ALL + 1.0;
  // the patrol drives off along its lane while the camera is on the school, and comes round again for the last shot
  const carX = (t) => t < SCH ? -2.4 : t < ALL - 0.2 ? lerp(-2.4, -11, Math.pow(lin(t, SCH, SCH + 1.1), 2)) : lerp(10, -2.4, eOut(lin(t, ALL - 0.2, BACK)));
  const anim = (t) => {
    homNightLook(); sky.update(t);
    car.group.position.x = carX(t);
    car.flash(t); school.lights(0.6 + 0.4 * sm(t, A.escola - 0.2, A.escola + 0.4));
    const wide = t < A.policia - 0.35 - 0.3 || t >= A.jovens + 1.1 - 0.3; decals.forEach((d) => { d.userData.plate.detail = wide; }); if (school.sign) school.sign.userData.plate.detail = wide;
    const pol = Math.sin(t * 9) > 0;
    fill.position.set(-3.0, 2.4, 2.0); fill.color.set(pol ? "#ff3a3a" : "#3a6aff"); fill.intensity = t < A.escola - 0.3 ? 2.2 : 0.9;
  };
  S.hero(car.group, "viatura de polícia", { when: (t) => t < SCH - 0.65 || t >= BACK + 0.3 }); S.hero(school.group, "escola", { when: (t) => t < CAR - 0.45 || t >= SCH });
  const box = envelope([car.group, school.group], anim, A.c14, CAR), bC = envelope([car.group], anim, CAR, SCH), bS = envelope([school.group], anim, SCH, ALL);
  return (t) => { anim(t); homFar(homTrack(t, [[A.c14, box, "orbit", { from: [0.1, 0.62, 1], deg: 22, pull: 1.02 }], [CAR, bC, "push", { from: [0.12, 0.28, 1], pull0: 1.1, pull: 1.0 }], [SCH, bS, "crane", { from: [0.4, 0.75, 1], rise: 0.2, pull: 1.0 }], [BACK, box, "reveal", { from: [0, 0.62, 1], pull0: 1.12, pull: 1.0 }]], A.end, 0.6), 80); };
});
