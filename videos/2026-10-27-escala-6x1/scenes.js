// ============================================================================
// videos/2026-10-27-escala-6x1/scenes.js
// 3D scenes synced to audio/words.json (narration 0–93.2 s, video 95.3 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage" whenever the headline band has text at that moment, "stage-tall" otherwise
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// ============================================================================

// ---------------------------------------------------------------- 1. gancho: o sábado de folga volta atrás (0 – 3.1)
// "Governo acaba de recuar na escala seis por um."
addScene("gancho", 0, 3.1, (S) => {
  const wk = makeWeekStrip(); S.add(wk.group);
  const sab = wk.days[5], weekend = [wk.days[4].group, sab.group, wk.days[6].group];
  S.hero(wk.group, "semana", { when: (t) => t < 0.15 });
  weekend.forEach((g, i) => S.hero(g, ["sexta", "sábado", "domingo"][i], { when: (t) => t > 1.0 }));
  S.scenery(wk.group, "resto da semana", { when: (t) => t >= 0.15 });

  // Saturday rises and turns into a day off (0.35–0.9), then is slammed back to work on "recuar" (1.3–1.48)
  const anim = (t) => {
    const back = sm(t, 1.3, 1.48);
    sab.group.position.y = 0.14 + 0.55 * sm(t, 0.35, 0.9) * (1 - back);
    sab.set(sm(t, 0.45, 0.9) * (1 - back));
  };
  const far = CAM.pose(envelope(wk.group, anim, 0, 3.1), { zone: "stage", from: [-0.15, 0.55, 1], pull: 1.1 });
  const near = CAM.pose(envelope(weekend, anim, 0, 3.1), { zone: "stage", from: [0.3, 0.42, 1], pull: 1.08 });

  return (t) => {
    anim(t);
    const hit = t > 1.42 ? 1 - lin(t, 1.42, 2.4) : 0;
    fill.color.set(RED); fill.position.set(sab.x, 1.8, 1.6); fill.intensity = hit * 9;
    key.color.set(t > 1.42 && t < 2.2 ? "#ff8a6a" : "#ffb98a");
    CAM.apply(CAM.shake(CAM.blend(far, near, sm(t, 0.15, 1.0)), t, 1.44, 0.07, 0.5));
  };
});

// ---------------------------------------------------------------- 2. o feed, depois a Constituição carimbada (3.1 – 12.15)
// "Pelo menos é o que está no seu feed. Só que o fim da seis por um já está na Constituição.
//  Ninguém revogou nada. Então... que recuo é esse?"
addScene("feed_constituicao", 3.1, 12.15, (S) => {
  const ph = makePhone(); S.add(ph.group);
  ph.group.rotation.x = -Math.PI / 2; ph.group.position.set(-3.8, 0.046, 0.25);
  const book = makeLawBook(); book.group.position.set(0.75, 0, 0); S.add(book.group);
  const T = book.top;
  book.print("ART. 7º · 2 DIAS DE REPOUSO", 1.5, 0.24, 0.32, { bg: "#f4e8da", fg: "#141414" });
  const imprint = book.print("PROMULGADA · 16/10/2026", 1.3, 0.3, 0.8, { bg: RED, fg: "#ffffff", twist: -0.1 });
  const stamp = makeStamp(); stamp.rotation.y = -0.1; S.add(stamp);

  S.hero(ph.group, "celular", { when: (t) => t < 4.95 });
  S.hero(book.group, "constituição", { when: (t) => t > 6.0 });
  S.solid(book.group, "constituição"); S.solid(stamp, "carimbo", { restsOn: ["constituição"] });

  // generic news feed (no brands), scrolling up
  const CARDS = [["GOVERNO RECUA NA 6x1?", RED], ["FIM DA 6x1: E AGORA?", ORANGE], ["EXCEÇÕES À VISTA", "#8a6a3a"], ["6x1: O QUE MUDA EM DEZEMBRO", "#3a5a8a"], ["GOVERNO RECUA NA 6x1?", RED]];
  function wrap(x, text, maxW) {
    const out = []; let line = "";
    for (const w of text.split(" ")) { const tryL = line ? line + " " + w : w; if (x.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; }
    out.push(line); return out;
  }
  let lastKey = "";
  function drawFeed(t) {
    const scroll = Math.min(900, Math.round(Math.max(0, t - 3.4) * 260));
    const k = String(scroll); if (k === lastKey) return; lastKey = k;
    const x = ph.ctx;
    x.fillStyle = "#0f0b09"; x.fillRect(0, 0, 720, 1500);
    CARDS.forEach(([txt, col], i) => {
      const y = 170 + i * 440 - scroll; if (y > 1500 || y < -420) return;
      x.fillStyle = "#211915"; roundRect(x, 30, y, 660, 410, 30); x.fill();
      x.fillStyle = col; roundRect(x, 50, y + 20, 620, 250, 22); x.fill();
      x.fillStyle = "#ffffff"; x.font = "900 62px Inter"; x.textAlign = "left";
      wrap(x, txt, 570).forEach((l, j) => x.fillText(l, 80, y + 110 + j * 70));
      x.fillStyle = "#9a8f86"; x.font = "700 34px Inter"; x.fillText("12 mil curtidas · 3 mil comentários", 60, y + 340);
    });
    x.fillStyle = "#1c1512"; x.fillRect(0, 0, 720, 130);
    x.fillStyle = "#e9dccf"; x.font = "800 48px Inter"; x.textAlign = "left"; x.fillText("Para você", 40, 88);
    ph.tex.needsUpdate = true;
  }

  // the stamp comes down at 7.45–7.86 (on "Constituição"), lifts and leaves before the headline text appears
  const sx = 0.75 + 0.05, sz = 0.8;
  const anim = (t) => {
    const down = eOut(lin(t, 7.45, 7.86)), up = sm(t, 8.1, 8.7);
    stamp.visible = t > 7.3 && t < 8.75;
    stamp.position.set(sx, T + 0.032 + 2.6 * (1 - down) + 2.6 * up, sz);
    imprint.visible = t >= 7.86;
  };
  const A = CAM.pose(envelope(ph.group, anim, 3.1, 4.9), { zone: "stage-tall", from: [0, 1, 0.16], pull: 1.1 });
  const boxB = envelope(book.group, anim, 5.0, 12.15); // the stamp drops in from above the frame
  const B0 = CAM.pose(boxB, { zone: "stage", from: [-0.08, 1.0, 0.62], pull: 1.06 });
  const B1 = CAM.pose(boxB, { zone: "stage", from: [0.06, 0.95, 0.66] });

  return (t) => {
    anim(t); drawFeed(t);
    const hit = t > 7.86 ? 1 - lin(t, 7.86, 8.8) : 0;
    fill.color.set(RED); fill.position.set(sx, T + 1.2, sz + 0.6); fill.intensity = hit * 6;
    let p = A;
    if (t >= 4.9) p = CAM.blend(A, B0, sm(t, 4.9, 6.0));
    if (t >= 6.0) p = CAM.blend(B0, B1, sm(t, 6.0, 12.15));
    CAM.apply(CAM.shake(p, t, 7.86, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 3. a regra: segunda folga, horas caindo, salário igual, 15 milhões (12.15 – 25.1)
// "A regra é simples. Em dezembro, duas folgas por semana e no máximo quarenta e duas horas.
//  Um ano depois, quarenta. Sem cortar salário. Quase quinze milhões de pessoas saem da seis por um."
addScene("regras", 12.15, 25.1, (S) => {
  const wk = makeWeekStrip(); S.add(wk.group); const sab = wk.days[5], weekend = [wk.days[4].group, sab.group, wk.days[6].group];
  const col = makeHourColumn({ hours: 44 }); col.group.position.set(7, 0, 0); S.add(col.group);
  const money = makeMoneyStack("SALÁRIO"); S.add(money);
  const crowd = makeCrowd(); crowd.group.position.set(14, 0, 0); S.add(crowd.group);
  const glow = new THREE.PointLight(GREEN, 0, 5, 1.5); glow.position.set(7, 3.6, 1.2); S.add(glow);

  weekend.forEach((g, i) => S.hero(g, ["sexta", "sábado", "domingo"][i], { when: (t) => t < 15.6 }));
  S.scenery(wk.group, "resto da semana", { when: (t) => t < 15.6 });
  S.hero(col.group, "coluna de horas", { when: (t) => t > 16.4 && t < 21.3 });
  S.hero(money, "salário", { when: (t) => t > 16.4 && t < 21.3 });
  S.hero(crowd.group, "multidão", { when: (t) => t > 22.0 });
  S.solid(col.group, "coluna"); S.solid(money, "salário", { restsOn: ["coluna"] });

  const anim = (t) => {
    sab.set(sm(t, 14.84, 15.1)); sab.group.position.y = 0.14 + 0.35 * Math.sin(Math.PI * lin(t, 14.84, 15.3));
    let h = 44;
    if (t >= 17.1) h = lerp(44, 42, sm(t, 17.1, 17.5));
    if (t >= 19.5) h = lerp(42, 40, sm(t, 19.5, 19.9));
    col.setHours(h);
    const dt = t - 20.66, hop = dt > 0 ? Math.abs(Math.sin(dt * 9)) * 0.25 * Math.exp(-dt * 4) : 0;
    money.position.set(7, col.top() + hop, 0);
    crowd.reveal(lin(t, 21.8, 23.6));
  };
  const shot = (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0, 0.42, 1] }, o));
  const A = shot(weekend, 12.15, 15.6, { from: [0.3, 0.42, 1], pull: 1.08 });
  const B = shot([col.group, money], 15.9, 21.3, { from: [0.3, 0.3, 1], pull: 1.15 });
  const C = shot([crowd.group], 21.3, 25.1, { from: [0, 0.65, 1], pull: 1.08 });

  return (t) => {
    anim(t);
    glow.intensity = t > 20.6 ? 6 * (1 - lin(t, 20.6, 21.6)) : 0;
    CAM.apply(CAM.track(t, [[12.15, A], [16.2, B, 0.6], [21.9, C, 0.6]]));
  };
});

// ---------------------------------------------------------------- 4. a porta no próprio texto (25.1 – 30.3)
// "Mas o próprio texto deixou uma porta: uma lei pode criar regras diferentes."
addScene("porta", 25.1, 30.3, (S) => {
  const book = makeLawBook({ emblem: false }); S.add(book.group);
  const T = book.top;
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), new THREE.MeshBasicMaterial({ color: "#ffb35a", toneMapped: false }));
  hole.rotation.x = -Math.PI / 2; hole.position.set(0.05, T + 0.003, 0.58); hole.userData.decor = true; S.add(hole);
  // door hinged on its far edge; it opens up and slightly back, its inside facing the camera
  const hinge = new THREE.Group(); hinge.position.set(0.05, T, 0.07); S.add(hinge);
  const doorMat = mat("#2a5440", { roughness: 0.55 });
  const door = new THREE.Mesh(rbox(1.24, 0.04, 1.04, 0.015), doorMat); door.position.set(0, 0.02, 0.52); hinge.add(door);
  const outer = makePlate("§ 3º", 0.7, 0.34, { bg: "#2a5440", fg: "#f5d36b" }); outer.rotation.x = -Math.PI / 2; outer.position.set(0, 0.056, 0.52); hinge.add(outer);
  const in1 = makePlate("UMA LEI PODE CRIAR", 1.12, 0.26, { bg: "#f4e8da", fg: "#141414" }); in1.rotation.x = Math.PI / 2; in1.position.set(0, -0.016, 0.74); hinge.add(in1);
  const in2 = makePlate("REGRAS DIFERENTES", 1.12, 0.26, { bg: ORANGE, fg: "#ffffff" }); in2.rotation.x = Math.PI / 2; in2.position.set(0, -0.016, 0.36); hinge.add(in2);
  const sparks = makeSparks(60, 21); S.add(sparks);
  const beam = new THREE.PointLight("#ffb35a", 0, 6, 1.4); beam.position.set(0.05, T + 0.6, 0.6); S.add(beam);

  S.hero(book.group, "constituição");
  S.hero(hinge, "porta", { when: (t) => t > 27.0 });

  const anim = (t) => { hinge.rotation.x = -1.9 * eOut(lin(t, 26.35, 27.0)); };
  const box = envelope([book.group, hinge], anim, 25.1, 30.3);
  const P0 = CAM.pose(box, { zone: "stage-tall", from: [-0.12, 0.85, 1], pull: 1.12 });
  const P1 = CAM.pose(box, { zone: "stage-tall", from: [0.1, 0.62, 1] });

  return (t) => {
    anim(t);
    const open = lin(t, 26.35, 27.0);
    beam.intensity = open * (7 + 1.5 * Math.sin(t * 5));
    updateSparks(sparks, t, 26.45, new V3(0.05, T + 0.1, 0.58));
    CAM.apply(CAM.blend(P0, P1, sm(t, 25.1, 30.3)));
  };
});

// ---------------------------------------------------------------- 5. a placa e a plaquinha; quem escreve a plaquinha (30.3 – 60.75)
// "Sabe placa de proibido estacionar? Às vezes vem uma plaquinha embaixo: exceto carga e descarga.
//  A placa grande continua lá. Mas quanto maior a plaquinha, pra menos gente ela vale.
//  E quem escreve a plaquinha? Segundo o Estadão, aliados do governo guardaram pra depois da eleição
//  uma nova emenda com exceções. Segundo O Globo, a regulamentação também ficou pra depois.
//  Os nomes que circulam: petroleiros embarcados, pilotos e aeronautas. Lista oficial? Ainda não existe."
addScene("placa", 30.3, 60.75, (S) => {
  const sign = makeStreetSign(); S.add(sign.group);
  const noPark = sign.face.material.map, folgas = ringTextTex(["2", "FOLGAS", "POR SEMANA"], GREEN);
  const subA = makeSubPlate(["EXCETO", "CARGA E DESCARGA", "TÁXI", "MOTO", "AMBULÂNCIA", "VAN ESCOLAR"]); sign.sub.add(subA.group);
  const subB = makeSubPlate(["EXCETO:", "PETROLEIROS EMBARCADOS?", "PILOTOS?", "AERONAUTAS?"], { w: 2.1 }); sign.sub.add(subB.group);
  const urn = makeBallotBox(); urn.position.set(2.15, 0, 0.1); S.add(urn);
  const f1 = makeFolder("NOVA EMENDA"); S.add(f1);
  const f2 = makeFolder("REGULAMENTAÇÃO", { w: 1.15, color: "#d9b56a" }); S.add(f2);
  const white = new THREE.Color("#ffffff"), dim = new THREE.Color("#8d8780");

  const wide = (t) => t < 53.0, close = (t) => t > 53.9;
  S.hero(sign.group, "placa", { when: wide });
  S.hero(sign.head, "disco", { when: close }); S.hero(subB.group, "plaquinha", { when: close });
  S.hero(urn, "urna", { when: (t) => t > 43.5 && wide(t) });
  S.hero(f1, "pasta emenda", { when: (t) => t > 48.95 && wide(t) });
  S.hero(f2, "pasta regulamentação", { when: (t) => t > 52.96 && wide(t) });
  S.solid(sign.group, "placa"); S.solid(urn, "urna"); S.solid(f1, "pasta emenda");
  S.solid(f2, "pasta regulamentação", { restsOn: ["urna"] });

  const steps = (t, times, d = 0.3) => times.reduce((k, at) => k + sm(t, at, at + d), 0);
  const anim = (t) => {
    popIn(sign.group, t, 30.4, 0.45);
    // plaquinha A: EXCETO, CARGA E DESCARGA, then it keeps growing; it leaves at the flip
    subA.show(steps(t, [33.65, 34.86, 38.7, 39.4, 40.1, 40.8]) * (1 - sm(t, 42.1, 42.35)));
    // the sign spins and becomes the new rule; plaquinha B prints the names that circulate
    const flip = lin(t, 42.1, 42.7);
    sign.head.rotation.y = Math.PI * 2 * eOut(flip);
    sign.setFace(flip > 0.25 ? folgas : noPark);
    subB.show(steps(t, [42.6, 54.98, 56.68, 57.38]));
    const out = 1 - sm(t, 53.3, 53.65);  // urn and folders leave for the close-up on the sign
    popIn(urn, t, 43.0, 0.45, out);
    const b = urn.userData.ballot, bp = lin(t, 46.95, 47.55);
    b.visible = bp > 0 && bp < 0.98; b.position.set(0, lerp(1.6, 0.7, eOut(bp)), 0);
    // folder 1 waits behind the urn, then comes out after the vote (right first, then forward)
    popIn(f1, t, 45.8, 0.4, out);
    f1.position.set(lerp(2.15, 3.45, sm(t, 48.0, 48.45)), 0, lerp(-0.75, 0.2, sm(t, 48.45, 48.9)));
    // folder 2 rises behind the urn and lands on top of it
    popIn(f2, t, 51.9, 0.35, out);
    f2.position.set(2.15, (lerp(0, 1.08, sm(t, 52.0, 52.4)) - 0.064 * sm(t, 52.8, 52.95)) * (t > 53.3 ? out : 1), lerp(-0.75, -0.05, sm(t, 52.4, 52.8)));
    urn.visible = urn.visible && out > 0.01; f1.visible = f1.visible && out > 0.01; f2.visible = f2.visible && out > 0.01;
  };
  const A = CAM.pose(envelope([sign.group], anim, 30.3, 42.0), { zone: "stage-tall", from: [0.22, 0.22, 1], pull: 1.08 });
  const B = CAM.pose(envelope([sign.group, urn, f1, f2], anim, 42.0, 53.3), { zone: "stage", from: [0.1, 0.3, 1], pull: 1.04 });
  const C = CAM.pose(envelope([sign.head, subB.group], anim, 53.3, 60.75), { zone: "stage", from: [0.12, 0.12, 1], pull: 1.06 });

  return (t) => {
    anim(t);
    const pulse = t > 36.7 && t < 38.2 ? Math.sin(Math.PI * lin(t, 36.7, 38.2)) : 0;
    sign.head.scale.setScalar(1 + 0.06 * pulse);
    sign.face.material.color.copy(white).lerp(dim, sm(t, 38.6, 41.3) * (1 - sm(t, 42.1, 42.4)));
    fill.color.set(t < 42.4 ? ORANGE : GREEN); fill.position.set(0, 3.4, 2.2);
    fill.intensity = t < 42.4 ? 4 * pulse : 3 * (1 - lin(t, 42.4, 44.0));
    if (t > 58.42) { fill.color.set(RED); fill.position.set(0, 1.6, 2.0); fill.intensity = 5 * (1 - lin(t, 58.42, 59.6)); }
    CAM.apply(CAM.shake(CAM.track(t, [[30.3, A], [43.0, B, 0.9], [53.9, C, 0.6]]), t, 58.44, 0.04, 0.4));
  };
});

// ---------------------------------------------------------------- 6. 1988: as 40 horas caem, fica o meio-termo (60.75 – 69.6)
// "Não é a primeira vez. Na Constituinte de 1988, as quarenta horas caíram no voto, e ficou o meio-termo: quarenta e quatro."
addScene("1988", 60.75, 69.6, (S) => {
  const c48 = makeHourColumn({ hours: 48, color: CREAM }); c48.group.position.set(-1.3, 0, 0); S.add(c48.group);
  const c44 = makeHourColumn({ hours: 44, color: ORANGE }); S.add(c44.group);
  // the 40 h column rises, then collapses into its base ("caíram no voto")
  const c40 = makeHourColumn({ hours: 40, color: GREEN }); c40.group.position.set(1.3, 0, 0); S.add(c40.group);

  S.hero(c48.group, "48 h", { when: (t) => t > 61.3 });
  S.hero(c40.group, "40 h", { when: (t) => t > 65.5 && t < 66.0 });
  S.hero(c44.group, "44 h", { when: (t) => t > 68.0 });
  S.solid(c48.group, "48 h"); S.solid(c44.group, "44 h"); S.solid(c40.group, "40 h");

  const anim = (t) => {
    popIn(c48.group, t, 60.9, 0.4);
    const f = lin(t, 66.0, 66.45);
    c40.group.visible = t > 65.05; c40.setHours(40 * eOut(lin(t, 65.05, 65.55)) * (1 - f * f), "40 h");
    c40.mat.color.set(f > 0 ? RED : GREEN);
    c44.group.visible = t > 67.45; c44.setHours(44 * eOut(lin(t, 67.45, 67.95)), "44 h");
  };
  const box = envelope([c48.group, c44.group, c40.group], anim, 60.75, 69.6);
  const P0 = CAM.pose(box, { zone: "stage", from: [-0.2, 0.42, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.08, 0.38, 1], pull: 1.02 });

  return (t) => {
    anim(t);
    const hit = t > 66.5 ? 1 - lin(t, 66.5, 67.3) : 0, mid = t > 67.6 ? 1 - lin(t, 67.6, 69.0) : 0;
    fill.color.set(hit > 0 ? RED : ORANGE); fill.position.set(hit > 0 ? 1.3 : 0, 2.6, 1.6); fill.intensity = hit * 6 + mid * 5;
    CAM.apply(CAM.shake(CAM.blend(P0, P1, sm(t, 60.75, 69.6)), t, 66.5, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 7a. lado A: a plataforma no meio do mar (69.6 – 77.95)
// "Agora imagina: você trabalha numa plataforma no meio do mar, semanas embarcado.
//  Como se cumpre duas folgas por semana no oceano?"
addScene("mar", 69.6, 77.95, (S) => {
  const sea = makeSea(); sea.mesh.position.y = 0.15; S.add(sea.mesh);
  const rig = makeOilRig(); S.add(rig.group);
  const wk = makeWeekStrip({ off: [5, 6] }); wk.group.scale.setScalar(0.5); wk.group.position.set(0.2, 5.0, 0); S.add(wk.group);
  const q = sprite(chipTex("?", { bg: RED, font: "900 150px Inter", h: 200 }), 0.55); q.position.set(0.2, 6.05, 0.2); S.add(q);

  S.hero(rig.group, "plataforma");
  S.hero(wk.group, "semana", { when: (t) => t > 75.3 });
  S.label(q, "?", { on: "semana", when: (t) => t > 77.6 });

  const anim = (t) => {
    popIn(wk.group, t, 74.88, 0.4, 0.5);
    popSprite(q, t, 77.28, 0.35);
  };
  const A = CAM.pose(envelope(rig.group, anim, 69.6, 74.8), { zone: "stage-tall", from: [0.5, 0.26, 1], pull: 1.14 });
  const B = CAM.pose(envelope([rig.group, wk.group, q], anim, 74.8, 77.95), { zone: "stage-tall", from: [0.35, 0.3, 1], pull: 1.04 });

  return (t) => {
    anim(t); sea.update(t);
    const fl = 1.6 * (0.85 + 0.15 * Math.sin(t * 29)); rig.flame.scale.set(fl, fl * (1 + 0.15 * Math.sin(t * 21)), fl);
    const pulse = t > 75.74 ? 0.5 + 0.5 * Math.sin((t - 75.74) * 8) : 0;
    [wk.days[5], wk.days[6]].forEach((d) => { d.mat.emissive.set(GREEN); d.mat.emissiveIntensity = pulse * 0.6; });
    key.color.set("#ffc9a0"); hemi.intensity = 0.9;
    CAM.apply(CAM.track(t, [[69.6, A], [75.4, B, 0.7]]));
  };
});

// ---------------------------------------------------------------- 7b. lado B: o voto e a palavra "exceção" (77.95 – 85.5)
// "Agora o outro lado: você votou contando com a segunda folga... e logo depois da eleição aparece a palavra exceção."
addScene("voto", 77.95, 85.5, (S) => {
  const urn = makeBallotBox(); S.add(urn);
  const me = makePerson(ORANGE); me.scale.setScalar(1.7); me.position.set(-1.3, 0, 0.3); S.add(me);
  const ballot = urn.userData.ballot;
  ballot.material = new THREE.MeshBasicMaterial({ map: plateTex("2ª FOLGA", { bg: "#ffffff", fg: "#0f3a22", w: 420, h: 560, font: "900 110px Inter" }), toneMapped: false });
  // "EXCETO" plate on a post behind the urn
  const ex = new THREE.Group(); ex.position.set(0.25, 0, -0.8); S.add(ex);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.4, 12), mat("#8b9196", { metalness: 0.6, roughness: 0.35 })); post.position.y = 1.2; ex.add(post);
  const plate = makeSubPlate(["EXCETO..."], { w: 1.5, lineH: 0.42, bg: RED, fg: "#ffffff" }); plate.group.position.set(0, 2.3, 0.07); ex.add(plate.group);
  ex.add(contactShadow(0.8, 0.8));

  S.hero(urn, "urna"); S.hero(me, "você"); S.hero(ex, "exceto", { when: (t) => t > 84.6 });
  S.solid(urn, "urna"); S.solid(me, "você"); S.solid(ex, "exceto");

  const anim = (t) => {
    const bp = lin(t, 79.66, 80.3);
    ballot.visible = t > 78.3 && bp < 0.98;
    ballot.position.set(0, lerp(1.75, 0.7, eOut(bp)) + 0.04 * Math.sin(t * 3) * (1 - bp), 0);
    ballot.scale.setScalar(Math.max(0.0001, pop(t, 78.3, 0.35)));
    popIn(ex, t, 84.12, 0.45);
  };
  const box = envelope([urn, me, ex], anim, 77.95, 85.5);
  const P0 = CAM.pose(box, { zone: "stage-tall", from: [0.2, 0.35, 1], pull: 1.12 });
  const P1 = CAM.pose(box, { zone: "stage-tall", from: [-0.05, 0.3, 1], pull: 1.02 });

  return (t) => {
    anim(t);
    const hit = t > 84.12 ? 1 - lin(t, 84.12, 85.2) : 0;
    fill.color.set(t < 84 ? GREEN : RED); fill.position.set(0.2, 2.4, 1.6);
    fill.intensity = t < 84 ? 4 * sm(t, 79.9, 80.4) * (1 - sm(t, 81.5, 82.5)) : hit * 7;
    CAM.apply(CAM.shake(CAM.blend(P0, P1, sm(t, 77.95, 85.5)), t, 84.14, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 8. a escolha: Congresso ou acordo (85.5 – 95.3)
// "Então me diz: quem deve decidir as exceções? O Congresso, numa lei igual pra todos, ou cada categoria, no acordo com o patrão?"
addScene("escolha", 85.5, 95.3, (S) => {
  const a = makeButton(ORANGE, "CONGRESSO", "#ffffff"), b = makeButton(CREAM, "ACORDO", "#ffffff");
  a.position.set(-1.35, 0, 0); b.position.set(1.35, 0, 0); a.scale.setScalar(0.75); b.scale.setScalar(0.75); S.add(a, b);
  const aTop = sprite(chipTex("CONGRESSO", { bg: ORANGE, font: "900 120px Inter", h: 180 }), 2.0); aTop.position.set(-1.35, 2.1, 0); S.add(aTop);
  const bTop = sprite(chipTex("ACORDO", { bg: "#f4e8da", fg: "#141414", font: "900 120px Inter", h: 180 }), 1.6); bTop.position.set(1.35, 2.1, 0); S.add(bTop);
  const lA = new THREE.PointLight(ORANGE, 0, 6, 1.5); lA.position.set(-1.75, 1.6, 1.2); S.add(lA);
  const lB = new THREE.PointLight("#fff1dc", 0, 6, 1.5); lB.position.set(1.75, 1.6, 1.2); S.add(lB);

  S.hero(a, "botão congresso"); S.hero(b, "botão acordo");
  S.label(aTop, "CONGRESSO", { on: "botão congresso" }); S.label(bTop, "ACORDO", { on: "botão acordo" });
  S.solid(a, "botão congresso"); S.solid(b, "botão acordo");

  const anim = (t) => {
    const pa = pressCurve(t, 88.92), pb = pressCurve(t, 92.34);
    a.userData.dome.position.y = 0.78 - 0.16 * pa; b.userData.dome.position.y = 0.78 - 0.16 * pb;
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 85.75, 0.4)) * (1 + 0.15 * pa));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 85.95, 0.4)) * (1 + 0.15 * pb));
  };
  const box = envelope([a, b, aTop, bTop], anim, 85.5, 95.3);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.45, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.04, 0.4, 1] });

  return (t) => {
    anim(t);
    const pa = pressCurve(t, 88.92), pb = pressCurve(t, 92.34);
    const late = t > 93.4 ? 0.5 + 0.5 * Math.sin((t - 93.4) * 4) : 0;
    const ea = Math.max(pa, t > 88.92 && t < 92.2 ? 0.5 : 0, late), eb = Math.max(pb, t > 92.34 ? 0.5 : 0, t > 93.4 ? 1 - late : 0);
    a.userData.domeMat.emissiveIntensity = ea * 1.2; b.userData.domeMat.emissiveIntensity = eb * 0.8; lA.intensity = ea * 7; lB.intensity = eb * 6;
    CAM.apply(CAM.blend(P0, P1, sm(t, 85.5, 95.3)));
  };
});
