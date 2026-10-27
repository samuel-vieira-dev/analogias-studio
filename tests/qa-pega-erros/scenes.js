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
