// ============================================================================
// tests/qa-pega-erros — each scene reproduces, on purpose, one defect of the circuit breaker
// V2 render. tools/selftest.sh builds this and fails unless tools/qa.cjs flags every one.
// ============================================================================
const FULL = { x: 0, y: 0, w: 1080, h: 1920 }; // old cameras: optical centre at the canvas centre

// 1) 0:03 celular cortado — camera placed by hand, too close, nobody measured the phone
addScene("celular_cortado", 0, 2, (S) => {
  S.add(makeBedsideTable());
  const ph = makePhone(); ph.group.position.set(0.1, 0.05, 0.1); ph.group.rotation.set(-Math.PI / 2, 0.35, -0.25); S.add(ph.group);
  S.hero(ph.group, "celular");
  const P = CAM.at([0.0, 1.9, 0.35], [0, 0, 0], { zone: FULL, fov: 38 });
  return () => CAM.apply(P);
});

// 2) 0:46 moeda cortada — coin sunk into the step and the shutter slats passing through it
addScene("moeda_atravessada", 2, 4, (S) => {
  const st = makeStairs(1, { top0: 0.6 }); S.add(st.group);
  const coin = makeCoin(0.46); coin.group.position.set(0, 0.6 + 0.27, 0.55); S.add(coin.group);
  const sh = makeShutter({ w: 1.6, h: 0.96, n: 6, sign: null }); sh.group.position.set(0, 0.58, 0.6); S.add(sh.group);
  S.hero(st.group, "escada");
  S.solid(st.steps[0].group, "degrau"); S.solid(coin.group, "moeda", { restsOn: ["degrau"] }); S.solid(sh.group, "porta");
  const P = CAM.pose(frameBox(st.group, coin.group, sh.group), { zone: "stage-tall" });
  return () => CAM.apply(P);
});

// 3) 1:06 fonte em cima da urna — the urn framed up into the source band
addScene("fonte_sobre_urna", 4, 6, (S) => {
  const urn = makeBallotBox(); S.add(urn); S.hero(urn, "urna");
  const P = CAM.pose(urn, { zone: { x: 500, y: 150, w: 400, h: 400 }, pad: 0 });
  return () => CAM.apply(P);
});

// 4) 1:08 número em cima da animação — the urn framed into the headline band under a stat
addScene("numero_sobre_urna", 6, 8, (S) => {
  const urn = makeBallotBox(); S.add(urn); S.hero(urn, "urna");
  const P = CAM.pose(urn, { zone: "headline", pad: 0 });
  return () => CAM.apply(P);
});

// ---------------------------------------------------------------- defeitos achados nos vídeos de 27–28/10
// 5) objeto pequeno — the hero lost in the dark (Lula 1:08, a mala a 18% do palco)
addScene("objeto_pequeno", 8, 10, (S) => {
  const urn = makeBallotBox(); S.add(urn); S.hero(urn, "urna");
  const P = CAM.pose(urn, { zone: "stage", pull: 3.2 });
  return (t) => CAM.apply(CAM.blend(P, CAM.pose(urn, { zone: "stage", pull: 3.4 }), lin(t, 8, 10)));
});

// 6) quadro vazio — the cut lands before anything pops in (Lula 0:45, palco vazio por 0,8 s)
addScene("vazio", 10, 12, (S) => {
  const urn = makeBallotBox(); urn.position.x = 40; S.add(urn); S.hero(urn, "urna longe", { when: () => false });
  return (t) => CAM.apply(CAM.at([Math.sin(t) * 2, 2.5, 6], [0, 0.5, 0], { zone: "stage-tall" }));
});

// 7) plano parado — nothing moves for 3 s (Lula 0:05–0:11, a prensa)
addScene("parado", 12, 15, (S) => {
  const urn = makeBallotBox(); S.add(urn); S.hero(urn, "urna parada");
  const P = CAM.pose(urn, { zone: "stage-tall" });
  return () => CAM.apply(P);
});

// 8) texto 3D ilegível — a label printed too small to read (Lula 1:40, os anos nas urnas)
addScene("texto_miudo", 15, 17, (S) => {
  const box = new THREE.Mesh(rbox(2.4, 1.4, 1, 0.05), mat(ORANGE)); box.position.y = 0.7; S.add(box);
  const p = makePlate("TEXTO MIÚDO DEMAIS PRA LER", 0.6, 0.06); p.position.set(0, 0.7, 0.516); box.add(p);
  S.hero(box, "caixa");
  return (t) => CAM.apply(CAM.pose(box, { zone: "stage-tall", from: [Math.sin(t) * 0.3, 0.3, 1] }));
});

// 9) foto sem crédito e esticada — a 160 px photo blown up to fill the stage, no "Foto:" on screen
addScene("foto_ruim", 17, 19, (S) => {
  const pr = makePhotoPrint("teste", { w: 2, pin: false }); pr.group.position.y = 0.2; S.add(pr.group); S.hero(pr.group, "foto");
  return (t) => { pr.zoom(1 + 0.1 * lin(t, 17, 19)); CAM.apply(CAM.pose(pr.group, { zone: "stage-tall", from: [0, 0, 1] })); };
});
