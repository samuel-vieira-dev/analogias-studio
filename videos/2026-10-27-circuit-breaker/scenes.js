// ============================================================================
// videos/2026-10-27-circuit-breaker/scenes.js
// 3D scenes synced to audio/words.json (narration 0–89.9 s, video 92 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage" whenever the headline band has text at that moment, "stage-tall" otherwise
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// ============================================================================

// ---------------------------------------------------------------- 1. gancho: o botão do pânico (0 – 3.52)
// "Acabaram de apertar o botão do pânico na bolsa de valores."
addScene("gancho", 0, 3.52, (S) => {
  const btn = S.add(makeButton(RED, "BOTÃO DO PÂNICO"));
  const lid = makeGlassLid(btn);
  const rings = makeAlarmRings(3); S.add(...rings);
  S.hero(btn, "botão");

  const anim = (t) => {
    lid.rotation.x = -1.95 * eOut(lin(t, 0.3, 0.9));
    btn.userData.dome.position.y = 0.78 - 0.16 * pressCurve(t, 1.66, 0.45);
  };
  const box = envelope(btn, anim, 0, 3.52);
  const near = CAM.pose(box, { zone: "stage-tall", from: [0, 0.5, 1] });
  const far = CAM.pose(box, { zone: "stage-tall", from: [0.1, 0.62, 1], pull: 1.3 });

  return (t) => {
    anim(t);
    const pulse = t > 1.7 ? Math.max(0, Math.sin((t - 1.7) * 9)) : 0;
    btn.userData.domeMat.emissiveIntensity = t > 1.7 ? 0.9 + 0.6 * pulse : 0;
    fill.color.set("#ff2a10"); fill.position.set(0, 2.2, 1.4); fill.intensity = t > 1.7 ? 6 + 10 * pulse : 0;
    key.color.set(t > 1.7 ? "#ff8a6a" : "#ffb98a");
    rings.forEach((r, i) => { const k = lin(t, 1.72 + i * 0.3, 2.6 + i * 0.3); r.visible = k > 0 && k < 1; r.scale.setScalar(1 + k * 1.6); r.material.opacity = 1 - k; });
    CAM.apply(CAM.shake(CAM.blend(far, near, eOut(lin(t, 0, 3.4))), t, 1.72, 0.06, 0.6));
  };
});

// ---------------------------------------------------------------- 2+3. o celular, depois um mar de celulares travados (3.52 – 23.75)
// "Imagina: você acorda, pega o celular e abre o app da corretora. Tudo vermelho... Você aperta vender e nada acontece.
//  Não é defeito no app. Por 30 minutos, ninguém no Brasil conseguiu vender uma única ação. Isso aconteceu hoje, e tem nome: circuit breaker."
addScene("celular", 3.52, 23.75, (S) => {
  const room = S.add(makeBedsideTable());
  const ph = makePhone(); S.add(ph.group);
  const finger = makeFinger(); finger.userData.decor = true; S.add(finger); // a hand entering the frame, not a subject

  // locked screen shared by the crowd
  const LC = makeCanvas(360, 750); const lx = LC.getContext("2d");
  lx.fillStyle = "#2a2522"; lx.fillRect(0, 0, 360, 750);
  lx.fillStyle = "#3a3330"; roundRect(lx, 30, 560, 300, 90, 45); lx.fill();
  lx.fillStyle = "#9a918a"; lx.font = "800 40px Inter"; lx.textAlign = "center"; lx.fillText("VENDER", 180, 618);
  lx.strokeStyle = ORANGE; lx.lineWidth = 16; lx.beginPath(); lx.arc(180, 250, 52, Math.PI, 0); lx.stroke();
  lx.fillStyle = ORANGE; roundRect(lx, 108, 250, 144, 120, 18); lx.fill();
  lx.fillStyle = "#cfc6bf"; lx.font = "700 30px Inter"; lx.fillText("SUSPENSO", 180, 450);
  const crowd = makePhoneCrowd(texFrom(LC), { rows: 15, cols: 8, z0: -1.6, skip: (x, z, row) => row < 1 && Math.abs(x) < 1.0 });
  S.add(crowd.bodies, crowd.screens);
  crowd.items.forEach((c) => { c.d = Math.hypot(c.x, c.z + 0.6); });
  const white = new THREE.Color("#ffffff"), orange = new THREE.Color("#ff8a50"), tint = new THREE.Color();

  let lastKey = "";
  function drawScreen(t) {
    const st = t < 4.52 ? "off" : t < 6.26 ? "lock" : "app";
    const fall = sm(t, 7.64, 11.0), pressed = t >= 11.86 && t < 12.25, blocked = t >= 12.3;
    const k = st + "|" + Math.round(fall * 120) + "|" + pressed + "|" + blocked + "|" + Math.floor(t * 4) + "|" + Math.round(lin(t, 4.9, 5.3) * 10);
    if (k === lastKey) return; lastKey = k;
    const x = ph.ctx;
    if (st === "off") { x.fillStyle = "#050505"; x.fillRect(0, 0, 720, 1500); }
    else if (st === "lock") {
      const gr = x.createLinearGradient(0, 0, 0, 1500); gr.addColorStop(0, "#3a2418"); gr.addColorStop(1, "#120b08"); x.fillStyle = gr; x.fillRect(0, 0, 720, 1500);
      x.fillStyle = "#fff"; x.textAlign = "center"; x.font = "600 170px Inter"; x.fillText("10:02", 360, 330);
      x.font = "600 40px Inter"; x.fillStyle = "#e9dccf"; x.fillText("segunda-feira, 26 de outubro", 360, 400);
      const a = eOut(lin(t, 4.9, 5.3)); x.globalAlpha = a; x.fillStyle = "rgba(255,255,255,0.14)"; roundRect(x, 50, 520 + (1 - a) * 40, 620, 150, 34); x.fill();
      x.fillStyle = "#fff"; x.textAlign = "left"; x.font = "800 34px Inter"; x.fillText("Corretora · agora", 90, 580 + (1 - a) * 40);
      x.font = "600 34px Inter"; x.fillText("Sua carteira está em forte queda", 90, 630 + (1 - a) * 40); x.globalAlpha = 1;
    } else paintTradingApp(x, { fall, red: sm(t, 7.64, 8.1), pressed, blocked, spin: t });
    ph.tex.needsUpdate = true;
  }

  // phone lying on the table → picked up (5.3–6.1)
  const lying = { p: new V3(0.1, 0.05, 0.1), r: new THREE.Euler(-Math.PI / 2, 0.35, -0.25) };
  const held = { p: new V3(0, 1.45, 0.5), r: new THREE.Euler(-0.1, 0, 0) };
  const qa = new THREE.Quaternion().setFromEuler(lying.r), qb = new THREE.Quaternion().setFromEuler(held.r);
  function placePhone(t) { const u = sm(t, 5.3, 6.1); ph.group.position.lerpVectors(lying.p, held.p, u); ph.group.quaternion.slerpQuaternions(qa, qb, u); }

  // finger: tip goes to the SELL button (11.25–11.82), presses at 11.86, leaves (12.05–12.6)
  const handDir = new V3(0.5, -0.62, 0.8).normalize();
  finger.quaternion.setFromUnitVectors(new V3(0, 1, 0), handDir);
  const target = new V3(), normal = new V3(), tmp = new V3();
  function placeFinger(t) {
    const fin = sm(t, 11.25, 11.82) * (1 - sm(t, 12.05, 12.6));
    finger.visible = fin > 0.001; if (!finger.visible) return;
    ph.group.updateMatrixWorld(true);
    target.copy(phoneScreenPoint(...SELL_BUTTON_PX)); ph.group.localToWorld(target);
    normal.set(0, 0, 1).applyQuaternion(ph.group.quaternion);
    const press = t > 11.82 && t < 12.05 ? 0.035 : 0;
    tmp.copy(target).addScaledVector(normal, 0.08 - press);           // touching the glass
    finger.position.copy(tmp).addScaledVector(handDir, (1 - fin) * 1.6);  // coming from outside, bottom-right
  }

  const anim = (t) => {
    placePhone(t); placeFinger(t);
    room.visible = t < 6.2; room.userData.light.intensity = t < 6.2 ? 3 : 0;
    crowd.bodies.visible = crowd.screens.visible = t > 13.9;
  };

  S.hero(ph.group, "celular", { when: (t) => t < 14.0 || t > 15.6 });
  // the crowd is a sea that runs past the frame on purpose (scenery), but text may never sit on it
  S.scenery(crowd.bodies, "mar de celulares", { when: (t) => t >= 15.6 });

  // shots: A top-down on the table, B frontal close-up, C wide over the crowd (headline text from 15.6)
  const A = CAM.pose(envelope(ph.group, anim, 3.52, 5.25), { zone: "stage-tall", from: [0, 1, 0.12], pull: 1.12 });
  const boxB = envelope(ph.group, anim, 6.15, 14.0);
  const B0 = CAM.pose(boxB, { zone: "stage-tall", from: [0, 0.12, 1], pull: 1.15 });
  const B1 = CAM.pose(boxB, { zone: "stage-tall", from: [0, 0.12, 1] });
  // C: the far edge of the sea sits on the top of the stage zone; its sides and front run past the frame
  anim(16);
  const farZ = Math.min(...crowd.items.map((c) => c.z)) - 0.06;
  const C = CAM.pose(frameBox([[-2.4, 0, farZ], [2.4, 1.7, 0.6]], ph.group), { zone: "stage", from: [0, 0.48, 1] });
  anim(3.52);

  return (t) => {
    anim(t); drawScreen(t);
    if (t > 13.9) {
      const wave = t - 17.12;
      crowd.tint((c) => { let k = 0; if (wave > 0) k = clamp(1 - Math.abs(c.d - wave * 9) / 3.5) * (1 - lin(t, 21.5, 23.0)); return tint.copy(white).lerp(orange, k * 0.85); });
    }
    let p = A;
    if (t >= 5.3 && t < 6.3) {
      // the phone travels 1.4 units toward the lens: follow it, re-fitting every frame
      const k = sm(t, 5.3, 6.3);
      p = CAM.pose(ph.group, { zone: "stage-tall", from: [0, lerp(1, 0.12, k), lerp(0.12, 1, k)], pull: lerp(1.12, 1.15, k) });
    }
    if (t >= 6.3) p = CAM.blend(B0, B1, lin(t, 6.3, 14.0));
    if (t >= 14.0) p = CAM.blend(B1, C, sm(t, 14.0, 15.6));
    CAM.apply(CAM.shake(p, t, 11.86, 0.1, 0.3));
  };
});

// ---------------------------------------------------------------- 4. o disjuntor: casa, depois a bolsa (23.75 – 38.05)
// "Sabe o disjuntor da sua casa? ... A bolsa tem um igual: ... antes que o pânico queime o dinheiro de todo mundo."
addScene("disjuntor", 23.75, 38.05, (S) => {
  const wall = S.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 11), mat("#2c1d15", { roughness: 0.95 }))); wall.position.set(0, 5, -0.4);
  const panel = makeBreakerPanel("CASA"); S.add(panel.group);
  const lblBolsa = plateTex("BOLSA", { bg: ORANGE, fg: "#fff", w: 640, h: 200, font: "900 130px Inter" }); const lblCasa = panel.label.material.map;
  const wire = makeWire([[0.75, 3.6, 0.1], [0.85, 4.35, 0.15], [1.15, 4.8, 0.2], [1.45, 4.62, 0.25]]); S.add(wire.mesh);
  const pulses = []; for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), new THREE.MeshBasicMaterial({ color: "#ffd36b", toneMapped: false })); p.userData.decor = true; S.add(p); pulses.push(p); }
  const bulb = makeBulb(); bulb.group.position.set(1.45, 4.05, 0.25); S.add(bulb.group);
  const chart = makeChartScreen(); chart.mesh.position.set(1.35, 4.2, 0.3); S.add(chart.mesh);
  // money on a crate, front-left: the flame that the breaker cuts
  const crate = new THREE.Group(); crate.position.set(-1.8, 0, 1.05); S.add(crate);
  const crateBox = new THREE.Mesh(rbox(1.0, 1.0, 0.8, 0.04), mat("#7a5236", { roughness: 0.85 })); crateBox.position.y = 0.5; crate.add(crateBox);
  const money = makeMoneyStack(); money.position.set(-1.8, 1.0, 1.05); S.add(money);
  const flame = makeFlame(); flame.position.set(0.32, 0.5, 0.05); money.add(flame);
  const smoke = makeSmoke(6); smoke.forEach((s) => money.add(s));
  const sparksA = makeSparks(70, 5), sparksB = makeSparks(70, 9); S.add(sparksA, sparksB);
  const origin = new V3(0, 2.35, 0.6);

  S.hero(panel.group, "disjuntor");
  S.hero(bulb.group, "lâmpada", { when: (t) => t < 29.6 });
  S.hero(chart.mesh, "gráfico", { when: (t) => t > 30.4 });
  S.hero(money, "dinheiro", { when: (t) => t > 35.3 });
  S.solid(crate, "caixote"); S.solid(money, "dinheiro", { restsOn: ["caixote"] });

  const anim = (t) => {
    bulb.group.scale.setScalar(Math.max(0.0001, 1 - sm(t, 29.64, 30.0))); bulb.group.visible = t < 30.0;
    popIn(chart.mesh, t, 29.9, 0.45);
    popIn(crate, t, 34.7, 0.35); popIn(money, t, 34.95, 0.4);
    const fl = sm(t, 35.2, 35.9) * (1 - sm(t, 36.15, 36.35)), fl2 = fl * (0.85 + 0.15 * Math.sin(t * 31));
    flame.visible = fl > 0.01; flame.scale.set(fl2, fl2 * (1 + 0.15 * Math.sin(t * 23)), fl2);
  };
  // home: the panel and its bulb/chart; then the shot opens to reveal the money it protects
  const home = envelope([panel.group, wire.mesh, bulb.group, chart.mesh], anim, 23.75, 34.6);
  const P0 = CAM.pose(home, { zone: "stage-tall", from: [0.12, 0.3, 1], pull: 1.12 });
  const P1 = CAM.pose(home, { zone: "stage-tall", from: [0.04, 0.3, 1] });
  const P2 = CAM.pose(envelope([panel.group, wire.mesh, chart.mesh, crate, money], anim, 34.6, 38.05), { zone: "stage-tall", from: [-0.1, 0.3, 1] });

  return (t) => {
    anim(t);
    const market = t >= 29.64;
    const trip1 = sm(t, 27.06, 27.16), reset = sm(t, 29.9, 30.3), trip2 = sm(t, 33.62, 33.72);
    const off = market ? clamp(1 - reset + trip2) : trip1;
    const jitter = (t > 25.6 && t < 27.06) || (t > 31.6 && t < 33.62) ? Math.sin(t * 70) * 0.04 : 0;
    panel.leverPivot.rotation.x = lerp(-0.55, 0.65, off) + jitter;
    panel.lever.material.emissiveIntensity = off > 0.5 ? 0.05 : 0.35;
    const over = !market ? sm(t, 25.52, 26.6) * (1 - trip1) : sm(t, 31.6, 33.0) * (1 - trip2);
    wire.mat.emissiveIntensity = over * 2.4;
    pulses.forEach((p, i) => { p.visible = over > 0.05; if (p.visible) { p.position.copy(wire.curve.getPointAt((t * 0.9 + i / pulses.length) % 1)); p.scale.setScalar(0.6 + over); } });
    const flick = !market && t > 25.9 && t < 27.06 ? 2.2 + Math.abs(Math.sin(t * 43)) * 2.5 : 1.2;
    const dark = !market && t >= 27.06;
    bulb.mat.emissiveIntensity = dark ? 0 : flick; bulb.light.intensity = dark ? 0 : flick * 3;
    chart.paint(sm(t, 31.5, 33.55), t >= 33.62);
    const flip = lin(t, 29.64, 30.0); panel.label.rotation.x = flip * Math.PI * 2; panel.setLabel(flip > 0.25 ? lblBolsa : lblCasa);
    updateSparks(sparksA, t, 27.06, origin); updateSparks(sparksB, t, 33.62, origin);
    smoke.forEach((s, i) => { const dt = t - 36.2 - i * 0.08; s.visible = dt > 0 && dt < 1.3; if (s.visible) { s.position.set(0.32 + Math.sin(i * 2.3) * 0.08 * dt, 0.45 + dt * 0.7, 0.05); s.scale.setScalar(0.6 + dt * 1.4); s.material.opacity = 0.55 * (1 - dt / 1.3); } });
    let p = CAM.blend(CAM.blend(P0, P1, sm(t, 23.75, 34.4)), P2, sm(t, 34.4, 35.3));
    p = CAM.shake(p, t, 27.06, 0.05, 0.4); p = CAM.shake(p, t, 33.62, 0.05, 0.4);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 5. as regras: três degraus (38.05 – 47.1)
// "A regra é simples. Caiu 10% no dia? Para por meia hora. 15? Mais uma hora. 20? A bolsa pode nem voltar naquele dia."
// Fix of the 0:46 cut: the coin rests ON each step (no sinking), the shutter closes BEHIND it on the
// last step (no intersection, no occlusion), the step text is printed on the risers and the rules go
// to the headline band, so no label floats over the animation.
addScene("regras", 38.05, 47.1, (S) => {
  const st = makeStairs(3, { labels: ["−10%", "−15%", "−20%"] }); S.add(st.group);
  const [s1, s2, s3] = st.steps;
  const coin = makeCoin(0.42); S.add(coin.group); const R = coin.group.userData.r;
  const shut = makeShutter({ w: 1.3, h: 1.5, n: 10 }); shut.group.position.set(s3.x, s3.top + 0.04, -0.62); S.add(shut.group);

  S.hero(st.group, "escada");
  S.hero(coin.group, "moeda", { when: (t) => t > 38.6 });
  S.hero(shut.group, "porta", { when: (t) => t > 44.75 });
  st.steps.forEach((s, i) => S.solid(s.group, "degrau" + (i + 1)));
  S.solid(coin.group, "moeda", { restsOn: ["degrau1", "degrau2", "degrau3"] });
  S.solid(shut.group, "porta", { restsOn: ["degrau3"] });

  // coin bottom height above `top` during a hop from step a to step b (clears the edge of a)
  const hop = (u, drop) => 4.6 * u - (4.6 + drop) * u * u;
  const bounce = (dt, h) => (dt < 0 ? 0 : Math.abs(Math.sin(dt * 9)) * h * Math.exp(-dt * 5));
  const z = 0.15;
  const anim = (t) => {
    let x = s1.x, b = s1.top + 0.9, spin = 0;
    if (t >= 39.0) b = s1.top + 0.9 * (1 - lin(t, 39.0, 39.34) ** 2);
    if (t >= 39.34) b = s1.top + bounce(t - 39.34, 0.18);
    const hops = [[42.0, 42.3, s1, s2], [43.75, 44.05, s2, s3]];
    for (const [ta, tb, a, c] of hops) {
      if (t < ta) continue;
      const u = lin(t, ta, tb); x = lerp(a.x, c.x, u); b = a.top + hop(u, a.top - c.top);
      if (t >= tb) { x = c.x; b = c.top + bounce(t - tb, 0.12); }
    }
    coin.group.position.set(x, b + R + 0.004, z);
    spin = -(x - s1.x) / R; coin.spin(spin);
    coin.group.visible = t > 38.35; coin.group.scale.setScalar(Math.max(0.0001, pop(t, 38.35, 0.3)));
    st.steps.forEach((s, i) => { const at = [39.6, 42.24, 43.98][i]; popIn(s.plate, t, at, 0.35); });
    popIn(shut.housing, t, 44.45, 0.3);
    shut.set(eOut(lin(t, 44.7, 45.4)));
    popIn(shut.sign, t, 45.45, 0.3);
  };
  const box = envelope([st.group, coin.group, shut.group], anim, 38.05, 47.1, 0.05);
  const P0 = CAM.pose(box, { zone: "stage", from: [-0.12, 0.42, 1], pull: 1.06 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.1, 0.36, 1] });

  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.blend(P0, P1, sm(t, 38.05, 47.1)), t, 45.35, 0.06, 0.4)); };
});

// ---------------------------------------------------------------- 6+7. linha do tempo dos acionamentos, depois hoje (47.1 – 68.5)
// "Esse botão só aparece em dia histórico. Em 2008 ... 6 vezes em menos de um mês. Na pandemia, mais 6 em só 10 dias.
//  Hoje, ele voltou. O mercado esperava outro resultado nas urnas. A bolsa chegou a cair 17% e o dólar subiu 8%."
// Fix of 1:06/1:08: today's numbers and the source live in the headline/source bands; the 2026 shot is
// framed in the "stage" zone below them, so no text sits on the ballot box.
addScene("linha_do_tempo", 47.1, 68.5, (S) => {
  const tl = makeTimeline({ from: 1997, to: 2026, counts: { 1997: 3, 1998: 5, 1999: 2, 2008: 6, 2017: 1, 2020: 6, 2026: 1 }, highlight: 2026 });
  S.add(tl.group); const X = tl.X, st = tl.stacks;
  const six08 = sprite(chipTex("6×", { bg: RED, font: "900 130px Inter", h: 180 }), 0.85); six08.position.set(X(2008), 1.95, 0); S.add(six08);
  const six20 = sprite(chipTex("6×", { bg: RED, font: "900 130px Inter", h: 180 }), 0.85); six20.position.set(X(2020), 1.95, 0); S.add(six20);
  const shock = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, toneMapped: false }));
  shock.rotation.x = -Math.PI / 2; shock.position.set(X(2008), 0.12, 0); shock.userData.decor = true; S.add(shock);
  const glow = new THREE.PointLight(ORANGE, 0, 6, 1.5); glow.position.set(X(2026), 1.2, 0.8); S.add(glow);
  const urn = makeBallotBox(); urn.position.set(X(2026) + 1.9, 0, -0.1); S.add(urn);

  const early = [1997, 1998, 1999];
  const inA = (t) => t < 48.9, in08 = (t) => t > 49.9 && t < 56.6, in20 = (t) => t > 57.8 && t < 60.0, in26 = (t) => t > 60.95;
  early.forEach((y) => { S.hero(st[y].group, "pilha " + y, { when: inA }); S.label(st[y].label, "ano " + y, { on: "pilha " + y, when: inA }); });
  S.hero(st[2008].group, "pilha 2008", { when: in08 }); S.label(st[2008].label, "ano 2008", { on: "pilha 2008", when: in08 }); S.label(six08, "6× 2008", { on: "pilha 2008", when: in08 });
  S.hero(st[2020].group, "pilha 2020", { when: in20 }); S.label(st[2020].label, "ano 2020", { on: "pilha 2020", when: in20 }); S.label(six20, "6× 2020", { on: "pilha 2020", when: in20 });
  S.hero(st[2026].group, "pilha 2026", { when: in26 }); S.label(st[2026].label, "ano 2026", { on: "pilha 2026", when: in26 });
  S.hero(urn, "urna", { when: (t) => t > 62.2 });
  S.solid(urn, "urna"); S.solid(st[2026].group, "pilha 2026");

  const popAt = { 2008: 54.08, 2020: 58.02, 2026: 60.98 };
  const anim = (t) => {
    for (const [y, s] of Object.entries(st)) {
      const big = +y === 2026, sc = big ? 1.35 : 1, h = 0.16 * sc;
      s.pucks.forEach((p, i) => {
        let vis = 1;
        if (popAt[y] !== undefined) { const at = popAt[y] + i * 0.17; vis = lin(t, at, at + 0.22); }
        p.g.visible = vis > 0.001; p.g.scale.setScalar(sc);
        p.g.position.y = 0.1 + h / 2 + 0.003 + i * 0.19 + (1 - eOut(vis)) * 1.6;
        if (popAt[y] !== undefined) { const at = popAt[y] + i * 0.17; p.m.emissiveIntensity = vis > 0 ? 0.9 * (1 - lin(t, at + 0.2, at + 1.4)) + 0.2 : 0; } else p.m.emissiveIntensity = 0.15;
        if (big) p.m.emissiveIntensity = t > 60.98 ? 0.7 + 0.5 * Math.max(0, Math.sin((t - 60.98) * 6)) : 0;
      });
    }
    popSprite(six08, t, 55.3); popSprite(six20, t, 59.3);
    popIn(urn, t, 61.7, 0.45);
    const bp = lin(t, 62.6, 63.6); urn.userData.ballot.position.set(0, lerp(1.55, 0.75, eOut(bp)), 0); urn.userData.ballot.visible = bp < 0.98;
  };
  const shot = (objs, t0, t1, zone, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone, from: [-0.3, 0.5, 1] }, o));
  const A = shot(early.map((y) => st[y].group), 47.1, 48.9, "stage-tall", { pull: 1.1 });
  const P08 = shot([st[2008].group, six08], 49.9, 56.6, "stage-tall", { pull: 1.25 });
  const P20 = shot([st[2020].group, six20], 57.8, 60.0, "stage-tall", { pull: 1.25 });
  const P26 = shot([st[2026].group, urn], 60.95, 68.5, "stage", { from: [-0.22, 0.42, 1], pull: 1.05 });

  return (t) => {
    anim(t);
    const sh = lin(t, 52.34, 53.6); shock.visible = sh > 0 && sh < 1; shock.scale.setScalar(0.4 + sh * 4.5); shock.material.opacity = 1 - sh;
    glow.intensity = t > 60.98 ? 5 + 4 * Math.max(0, Math.sin((t - 60.98) * 6)) : 0;
    const p = CAM.track(t, [[47.1, A], [49.9, P08, 1.0], [57.8, P20, 1.1], [60.95, P26, 0.95]]);
    CAM.apply(CAM.shake(p, t, 60.98, 0.06, 0.5));
  };
});

// ---------------------------------------------------------------- 8. 2008 em V: quem vendeu × quem segurou (68.5 – 82.35)
// "Agora se coloca no lugar de quem estava lá em 2008. Quem vendeu no desespero, vendeu perto do fundo.
//  Quem segurou, viu a bolsa subir 82% no ano seguinte. Mas 2026 não é 2008."
addScene("v_2008", 68.5, 82.35, (S) => {
  const grid = S.add(makeGridFloor()); grid.userData.decor = true;
  const L = [[-2.9, 6.0], [-2.45, 5.1], [-2.15, 5.5], [-1.7, 4.0], [-1.4, 4.3], [-0.9, 2.4], [-0.6, 2.7], [-0.2, 0.7], [0, 0.45]];
  const Rr = [[0, 0.45], [0.33, 1.3], [0.6, 1.05], [1.0, 2.5], [1.3, 2.2], [1.7, 3.8], [2.05, 3.5], [2.5, 5.6], [2.95, 6.6]];
  const v = makeVChart(L, Rr); S.add(v.group);
  const seller = makePerson("#9aa3b2"), holder = makePerson(ORANGE); S.add(seller, holder);
  const sign = new THREE.Group(); sign.position.set(-1.3, 0, 0.6); S.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 10), mat("#5a4636")); post.position.y = 0.8; sign.add(post);
  const t2008 = plateTex("2008", { bg: "#f4e8da", fg: "#141414", w: 600, h: 260, font: "900 190px Inter" });
  const t2026 = plateTex("2026", { bg: ORANGE, fg: "#ffffff", w: 600, h: 260, font: "900 190px Inter" });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.48), new THREE.MeshBasicMaterial({ map: t2008, toneMapped: false, side: THREE.DoubleSide, fog: false })); board.position.set(0, 1.75, 0.02); sign.add(board);

  S.hero(v.group, "gráfico em V", { when: (t) => t < 70.7 || t > 75.7 });
  S.hero(seller, "quem vendeu", { when: (t) => t < 74.2 });
  S.hero(holder, "quem segurou");
  S.hero(sign, "placa");

  const stand = { s: new V3(-0.55, 0, 0.95), h: new V3(0.55, 0, 0.95) }, pR = new V3(), runTo = new V3(-2.35, 0, 1.3);
  const anim = (t) => {
    v.setLeft(sm(t, 68.55, 70.3));
    const up = sm(t, 75.86, 78.7); v.setRight(up);
    v.rMat.opacity = 1 - 0.75 * sm(t, 79.6, 80.4);
    const run = sm(t, 71.96, 74.0);
    seller.position.lerpVectors(stand.s, runTo, run); seller.position.y = run > 0 && run < 1 ? Math.abs(Math.sin(run * 22)) * 0.1 : 0;
    seller.rotation.y = run > 0 ? -1.2 : 0.3;
    const gone = lin(t, 74.0, 74.4); seller.visible = gone < 1; seller.scale.setScalar(Math.max(0.0001, 1 - gone));
    v.cR.getPointAt(Math.max(0.0001, up * 0.9), pR); pR.y += 0.12;
    holder.position.lerpVectors(stand.h, pR, sm(t, 75.3, 75.9));
    holder.scale.setScalar(1 + (t > 75.0 && t < 75.8 ? 0.12 * Math.max(0, Math.sin((t - 75.0) * 10)) : 0));
    const fl = lin(t, 79.86, 80.26); board.rotation.y = fl * Math.PI * 2; board.material.map = fl > 0.25 ? t2026 : t2008;
  };
  const all = [v.group, seller, holder, sign];
  const A = CAM.pose(envelope(all, anim, 68.5, 71.3), { zone: "stage-tall", from: [0, 0.45, 1] });
  const B = CAM.pose(envelope([seller, holder, sign], anim, 71.3, 75.2), { zone: "stage-tall", from: [0, 0.25, 1], pull: 1.1 });
  const boxC = envelope(all, anim, 75.6, 82.35);
  const C0 = CAM.pose(boxC, { zone: "stage", from: [0.05, 0.3, 1], pull: 1.08 });
  const C1 = CAM.pose(boxC, { zone: "stage", from: [0.05, 0.3, 1] });

  return (t) => {
    anim(t);
    const p = CAM.track(t, [[68.5, A], [71.6, B, 0.9], [75.7, C0, 0.9], [82.35, C1, 2.9]]);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 9. a escolha: vende ou compra (82.35 – 92)
// "Então me diz: o que você faria agora? Vende suas ações com medo de cair mais? Ou compra porque acha que o pânico exagerou?"
addScene("escolha", 82.35, 92.0, (S) => {
  const sell = makeButton(RED, "VENDO", "#ffffff"), buy = makeButton(GREEN, "COMPRO", "#ffffff");
  sell.position.set(-1.55, 0, 0); buy.position.set(1.55, 0, 0); sell.scale.setScalar(0.75); buy.scale.setScalar(0.75); S.add(sell, buy);
  const sTop = sprite(chipTex("VENDO", { bg: RED, font: "900 120px Inter", h: 180 }), 1.5); sTop.position.set(-1.55, 2.1, 0); S.add(sTop);
  const bTop = sprite(chipTex("COMPRO", { bg: GREEN, font: "900 120px Inter", h: 180 }), 1.7); bTop.position.set(1.55, 2.1, 0); S.add(bTop);
  const lS = new THREE.PointLight(RED, 0, 6, 1.5); lS.position.set(-1.75, 1.6, 1.2); S.add(lS);
  const lB = new THREE.PointLight(GREEN, 0, 6, 1.5); lB.position.set(1.75, 1.6, 1.2); S.add(lB);

  S.hero(sell, "botão vender"); S.hero(buy, "botão comprar");
  S.label(sTop, "VENDO", { on: "botão vender" }); S.label(bTop, "COMPRO", { on: "botão comprar" });
  S.solid(sell, "botão vender"); S.solid(buy, "botão comprar");

  const anim = (t) => {
    const ps = pressCurve(t, 84.96), pb = pressCurve(t, 87.6);
    sell.userData.dome.position.y = 0.78 - 0.16 * ps; buy.userData.dome.position.y = 0.78 - 0.16 * pb;
    const a = pop(t, 82.6, 0.4), b = pop(t, 82.8, 0.4);
    setSpriteScale(sTop, Math.max(0.0001, a) * (1 + 0.15 * ps)); setSpriteScale(bTop, Math.max(0.0001, b) * (1 + 0.15 * pb));
  };
  const box = envelope([sell, buy, sTop, bTop], anim, 82.35, 92);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.45, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.04, 0.4, 1] });

  return (t) => {
    anim(t);
    const ps = pressCurve(t, 84.96), pb = pressCurve(t, 87.6);
    const late = t > 89.4 ? 0.5 + 0.5 * Math.sin((t - 89.4) * 4) : 0;
    const es = Math.max(ps, t > 84.96 && t < 87.4 ? 0.5 : 0, late), eb = Math.max(pb, t > 87.6 ? 0.5 : 0, t > 89.4 ? 1 - late : 0);
    sell.userData.domeMat.emissiveIntensity = es * 1.2; buy.userData.domeMat.emissiveIntensity = eb * 1.2; lS.intensity = es * 7; lB.intensity = eb * 7;
    CAM.apply(CAM.blend(P0, P1, sm(t, 82.35, 92)));
  };
});
