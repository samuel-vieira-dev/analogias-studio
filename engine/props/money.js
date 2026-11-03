// ============================================================================
// props/money.js · dinheiro, câmbio e o caminho do dólar até o seu bolso:
//   cédulas genéricas de real e de dólar (sem desenho de nota de verdade), painel de câmbio com visor
//   que troca, painel de pares de moedas, termômetro da inflação, tela com a linha do ano, balão de fala,
//   móbile de moedas presas a uma moeda grande; padaria (fundo), cesto de pão francês, saco de produto
//   (farinha, adubo, soja), monte de grãos, placa espetada, galpão (fundo), cartela de cápsulas,
//   cesta de mercado, porto à noite (fundo).
// Primeiro uso: videos/2026-11-02-impacto-dolar.
// Units: metres. Origin of standing things: floor (or table top), centre; front = +z.
// ============================================================================

// ---------------------------------------------------------------- banknotes
// Generic banknote face (640 × 280): "real" (blue-green tint, R$ and the value, REAIS) or "dolar"
// (pale green paper, dark green guilloche, an empty oval medallion, US$ and DÓLAR). No real design.
function currencyNoteTex(kind = "real", value = "100", tint = "#3f6f86") {
  return cachedTex(`note-${kind}-${value}-${tint}`, () => {
    const c = makeCanvas(640, 280), x = c.getContext("2d"), dollar = kind === "dolar";
    const gr = x.createLinearGradient(0, 0, 640, 280);
    gr.addColorStop(0, dollar ? "#e4e9d8" : "#e9eee6"); gr.addColorStop(1, dollar ? "#cdd8c0" : "#d5e0da"); x.fillStyle = gr; x.fillRect(0, 0, 640, 280);
    x.fillStyle = dollar ? "#6f8f6a" : tint; x.globalAlpha = dollar ? 0.35 : 0.7; x.fillRect(0, 0, 640, 280); x.globalAlpha = 1;
    const ink = dollar ? "rgba(30,70,45,0.45)" : "rgba(255,255,255,0.35)";
    x.strokeStyle = ink; x.lineWidth = 1.2;
    for (let i = 0; i < 30; i++) { x.beginPath(); x.ellipse(dollar ? 320 : 170, 140, 18 + i * 6, 10 + i * 4, i * 0.1, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = dollar ? "#2f5a3c" : "rgba(0,0,0,0.3)"; x.lineWidth = 8; x.strokeRect(12, 12, 616, 256);
    x.lineWidth = 2; x.strokeRect(26, 26, 588, 228);
    if (dollar) {
      // empty oval medallion with fine hatching (no portrait)
      x.save(); x.beginPath(); x.ellipse(320, 140, 70, 92, 0, 0, Math.PI * 2); x.fillStyle = "#e8eddc"; x.fill(); x.clip();
      x.strokeStyle = "rgba(47,90,60,0.35)"; x.lineWidth = 1.5; for (let i = -200; i < 200; i += 7) { x.beginPath(); x.moveTo(320 + i, 40); x.lineTo(320 + i + 120, 240); x.stroke(); }
      x.restore(); x.strokeStyle = "#2f5a3c"; x.lineWidth = 6; x.beginPath(); x.ellipse(320, 140, 70, 92, 0, 0, Math.PI * 2); x.stroke();
      // the medallion holds a big seal-like "$" (no portrait), with a laurel ring of dots
      x.fillStyle = "#2f5a3c"; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; x.beginPath(); x.arc(320 + Math.cos(a) * 56, 140 + Math.sin(a) * 76, 3, 0, Math.PI * 2); x.fill(); }
      x.font = "900 120px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("$", 320, 146);
      x.fillStyle = "#24472f"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "900 64px Inter"; x.fillText(value, 70, 70); x.fillText(value, 570, 210);
      x.font = "900 96px Inter"; x.fillText("US$", 500, 112);
      x.font = "800 30px Inter"; x.fillText("DÓLAR", 140, 214);
    } else {
      x.fillStyle = "rgba(255,255,255,0.94)"; x.textAlign = "right"; x.textBaseline = "middle";
      x.font = "900 104px Inter"; x.fillText(value, 600, 92);
      x.font = "800 34px Inter"; x.fillText("REAIS", 598, 214);
      x.textAlign = "left"; x.font = "900 60px Inter"; x.fillText("R$", 46, 70);
    }
    return texFrom(c);
  });
}
// A single banknote lying flat (face up, +y; the long side along x). Origin: bottom centre.
// API { group, note } — `note` is the thin box (rotate the group to fly it, stand it, fan it).
function makeCurrencyNote(kind = "real", { w = 0.62, value = kind === "dolar" ? "1" : "100", tint = "#3f6f86" } = {}) {
  const g = new THREE.Group(), h = w * 0.4375, t = 0.003;
  const face = pmat("#ffffff", { map: currencyNoteTex(kind, value, tint), roughness: 0.78 });
  const edge = pmat(kind === "dolar" ? "#c9d4bd" : "#c9d6d3", { roughness: 0.85 });
  const note = new THREE.Mesh(new THREE.BoxGeometry(w, t, h), [edge, edge, face, face, edge, edge]); note.position.y = t / 2; g.add(note);
  return { group: g, note, w, h };
}

// ---------------------------------------------------------------- the exchange-rate display
// Wall-mounted LED panel of a currency exchange ("CÂMBIO" header, a black LED screen). set(value, dir)
// repaints the screen: "DÓLAR" over the price in amber and an arrow (dir 1 red up, -1 green down, 0 none).
// The screen counts as printed text for the QA. Origin: centre of the back (put it on a wall at z);
// faces +z. API { group, screen, set(value, dir), w, h }
function makeExchangeBoard({ w = 1.5, h = 1.1 } = {}) {
  const g = new THREE.Group(), d = 0.12, hh = h * 0.22, sh = h - hh;
  const body = new THREE.Mesh(rbox(w + 0.08, h + 0.08, d, 0.03), pmat("#1a1c20", { metalness: 0.6, roughness: 0.35 })); body.position.set(0, 0, d / 2); g.add(body);
  const head = makePlate("CÂMBIO", w * 0.98, hh * 0.86, { bg: ORANGE, fg: "#ffffff" }); head.position.set(0, h / 2 - hh / 2, d + 0.016); g.add(head);
  const c = makeCanvas(1024, Math.round(1024 * sh / w)), x = c.getContext("2d"), tex = texFrom(c);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, sh * 0.94), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.set(0, -hh / 2, d + 0.004); g.add(screen);
  const big = Math.round(c.height * 0.46);
  screen.userData.plate = { text: "DÓLAR", w: w * 0.98, h: sh * 0.94, depth: 0, frac: 0.2, detail: false };   // the small DÓLAR line (the price is bigger)
  let key = "";
  function set(value, dir = 0) {
    const k = value + "|" + dir; if (k === key) return; key = k;
    x.fillStyle = "#07080a"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "rgba(255,170,60,0.06)"; for (let yy = 4; yy < c.height; yy += 9) for (let xx = 4; xx < c.width; xx += 9) x.fillRect(xx, yy, 4, 4);
    x.textBaseline = "middle"; x.textAlign = "left";
    x.fillStyle = "#ffb347"; x.font = `800 ${Math.round(c.height * 0.2)}px Inter`; x.fillText("DÓLAR", 46, c.height * 0.2);
    let px = big; x.font = `900 ${px}px Inter`; while (x.measureText(value).width > c.width - 46 - 310 && px > 20) { px -= 4; x.font = `900 ${px}px Inter`; }
    x.fillStyle = "#ffc062"; x.fillText(value, 46, c.height * 0.64);
    if (dir) {
      const ax = c.width - 150, ay = c.height * 0.6, s = c.height * 0.2; x.fillStyle = dir > 0 ? "#ff3b2a" : "#33d17a";
      x.beginPath(); if (dir > 0) { x.moveTo(ax, ay - s); x.lineTo(ax + s, ay + s * 0.6); x.lineTo(ax - s, ay + s * 0.6); } else { x.moveTo(ax, ay + s); x.lineTo(ax + s, ay - s * 0.6); x.lineTo(ax - s, ay - s * 0.6); } x.closePath(); x.fill();
    }
    tex.needsUpdate = true;
  }
  set("R$ 5,44", 0);
  for (const s of [-1, 1]) { const br = new THREE.Mesh(rbox(0.06, 0.06, 0.1, 0.01), pmat("#2a2c30", { metalness: 0.8, roughness: 0.3 })); br.position.set(s * w * 0.35, h / 2 + 0.07, 0.05); g.add(br); }
  return { group: g, screen, set, w, h };
}

// ---------------------------------------------------------------- the board of currency pairs
// Departure-board style panel: a header plate and one row per currency pair ("EUR / USD"). light(i, k):
// row i turns green with the "USD" in amber (k 0..1); flash(i, k): row i blinks red (a pair without the
// dollar). Every row is printed text for the QA. Origin: floor centre (on two feet); faces +z.
// API { group, light(i, k), flash(i, k), rows, top }
function makeFxPairBoard(pairs, { w = 1.5, rowH = 0.15, gap = 0.035, title = "TROCAS DE MOEDA", legs = 0.75, cols = 1 } = {}) {
  const g = new THREE.Group(), n = Math.ceil(pairs.length / cols), headH = rowH * 1.25, colW = (w * 0.96 - (cols - 1) * gap * 2) / cols;
  const H = headH + gap + n * (rowH + gap) + gap, y0 = legs;
  const frameM = pmat("#1b1d22", { metalness: 0.6, roughness: 0.35 });
  const body = new THREE.Mesh(rbox(w + 0.12, H + 0.1, 0.12, 0.03), frameM); body.position.set(0, y0 + H / 2, 0); g.add(body);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(rbox(0.07, legs + 0.1, 0.07, 0.02), frameM); leg.position.set(s * w * 0.38, (legs + 0.1) / 2, 0); g.add(leg);
    const foot = new THREE.Mesh(rbox(0.12, 0.05, 0.5, 0.02), frameM); foot.position.set(s * w * 0.38, 0.025, 0); g.add(foot);
  }
  const head = makePlate(title, w * 0.96, headH * 0.84, { bg: ORANGE, fg: "#ffffff" }); head.position.set(0, y0 + H - gap - headH / 2, 0.075); g.add(head);
  const rows = [];
  pairs.forEach((p, i) => {
    const col = Math.floor(i / n), row = i % n;
    const cw = 768, ch = Math.round(cw * rowH / colW), c = makeCanvas(cw, ch), x = c.getContext("2d"), tex = texFrom(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(colW, rowH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    m.position.set(-w * 0.48 + colW / 2 + col * (colW + gap * 2), y0 + H - gap - headH - gap - rowH / 2 - row * (rowH + gap), 0.062); g.add(m);
    const px = Math.round(ch * 0.62);
    m.userData.plate = { text: p, w: colW, h: rowH, depth: 0, frac: px / ch, detail: false };
    const parts = p.split(" / ");
    let key = "";
    const paint = (lit, red) => {
      const k = lit.toFixed(2) + "|" + red.toFixed(2); if (k === key) return; key = k;
      const bg = new THREE.Color("#121418").lerp(new THREE.Color("#14713f"), lit).lerp(new THREE.Color("#a3241a"), red);
      x.fillStyle = "#" + bg.getHexString(); roundRect(x, 0, 0, cw, ch, ch * 0.18); x.fill();
      x.font = `900 ${px}px Inter`; x.textBaseline = "middle"; x.textAlign = "left";
      const sep = " / "; let xx = cw * 0.08;
      parts.forEach((cur, j) => {
        x.fillStyle = cur === "USD" && lit > 0.5 ? "#ffc062" : "#f4f1ea"; x.fillText(cur, xx, ch / 2 + px * 0.04); xx += x.measureText(cur).width;
        if (j === 0) { x.fillStyle = "rgba(244,241,234,0.6)"; x.fillText(sep, xx, ch / 2 + px * 0.04); xx += x.measureText(sep).width; }
      });
      // a status lamp at the right end
      x.fillStyle = red > 0.5 ? "#ff5a4a" : lit > 0.5 ? "#7dffb0" : "#3a3d44"; x.beginPath(); x.arc(cw - ch * 0.55, ch / 2, ch * 0.2, 0, Math.PI * 2); x.fill();
      tex.needsUpdate = true;
    };
    paint(0, 0);
    rows.push({ mesh: m, paint, lit: 0, red: 0 });
  });
  g.add(contactShadow(w * 1.2, 1.0));
  return {
    group: g, rows, top: y0 + H + 0.05,
    light(i, k) { const r = rows[i]; r.lit = clamp(k); r.paint(r.lit, r.red); },
    flash(i, k) { const r = rows[i]; r.red = clamp(k); r.paint(r.lit, r.red); },
  };
}

// ---------------------------------------------------------------- inflation thermometer
// Big wall thermometer on an enamel board: glass tube, red liquid, bulb, a tick every unit (major every
// `major`), a name plate at the foot. set(v): liquid level in units (0..max). Origin: floor centre (the
// board stands on two feet); faces +z. API { group, col, set(v), topAt(v) → local y of the liquid top } —
// `col` holds the plate, bulb, tube and scale (frame it for a close-up).
function makeInflationThermometer(label = "INFLAÇÃO", { h = 1.7, w = 0.5, max = 5, legs = 0.35, color = "#e0261b", plateH = 0.13 } = {}) {
  const g = new THREE.Group(), y0 = legs, boardH = h;
  const board = new THREE.Mesh(rbox(w, boardH, 0.05, 0.04), pmat("#efe9dd", { roughness: 0.4, clearcoat: 0.6 })); board.position.set(0, y0 + boardH / 2, 0); g.add(board);
  const rim = new THREE.Mesh(rbox(w + 0.04, boardH + 0.04, 0.03, 0.05), pmat("#2a2c30", { metalness: 0.7, roughness: 0.3 })); rim.position.set(0, y0 + boardH / 2, -0.012); g.add(rim);
  for (const s of [-1, 1]) { const leg = new THREE.Mesh(rbox(0.05, legs + 0.05, 0.05, 0.015), pmat("#2a2c30", { metalness: 0.7, roughness: 0.3 })); leg.position.set(s * w * 0.32, (legs + 0.05) / 2, -0.02); g.add(leg);
    const ft = new THREE.Mesh(rbox(0.08, 0.04, 0.34, 0.015), pmat("#2a2c30", { metalness: 0.7, roughness: 0.3 })); ft.position.set(s * w * 0.32, 0.02, 0); g.add(ft); }
  const bulbR = 0.075, tubeR = 0.034;
  const col = new THREE.Group(); g.add(col);
  const plate = makePlate(label, w * 0.92, plateH, { bg: "#141414", fg: "#ffffff" }); plate.position.set(0, y0 + 0.04 + plateH / 2, 0.03); col.add(plate);
  const bulbY = y0 + 0.04 + plateH + 0.05 + bulbR, tubeY0 = bulbY + bulbR * 0.6, tubeY1 = y0 + boardH - 0.07, L = tubeY1 - tubeY0;
  const liquidM = pmat(color, { roughness: 0.25, clearcoat: 1, emissive: color, emissiveIntensity: 0.25 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(bulbR, 28, 20), liquidM); bulb.position.set(0, bulbY, 0.065); col.add(bulb);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, L + 0.02, 24, 1, true), glassMat({ opacity: 0.3 })); tube.position.set(0, tubeY0 + L / 2, 0.065); tube.userData.noShadow = true; col.add(tube);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(tubeR, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), glassMat({ opacity: 0.3 })); cap.position.set(0, tubeY1 + 0.01, 0.065); col.add(cap);
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(tubeR * 0.62, tubeR * 0.62, 1, 20), liquidM); liq.position.set(0, tubeY0, 0.065); col.add(liq);
  const unit = L / max;
  for (let i = 0; i <= max * 2; i++) { const major = i % 2 === 0, tk = new THREE.Mesh(new THREE.BoxGeometry(major ? 0.1 : 0.05, 0.008, 0.006), mat("#2a2422")); tk.position.set(-tubeR - 0.03 - (major ? 0.05 : 0.025), tubeY0 + (i / 2) * unit, 0.028); col.add(tk); }
  const set = (v) => { const hh = Math.max(0.002, clamp(v, 0, max) * unit); liq.scale.y = hh; liq.position.y = tubeY0 + hh / 2; };
  set(0);
  g.add(contactShadow(w * 1.6, 0.6));
  return { group: g, col, set, topAt: (v) => tubeY0 + clamp(v, 0, max) * unit, tubeX: 0, tubeZ: 0.065 };
}

// ---------------------------------------------------------------- the year on a screen
// A monitor on a foot that draws a line from left to right through `pts` ([u, v] in 0..1, v up), with a
// dashed reference line at the first point's height (where it started) and a dot at the line's head.
// No numbers. draw(k): 0..1 of the path drawn. Origin: table top, centre; faces +z. API { group, draw(k) }
function makeLineScreen(pts, { w = 1.3, h = 0.8, color = "#ffb347" } = {}) {
  const g = new THREE.Group(), c = makeCanvas(900, Math.round(900 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const frameM = pmat("#151619", { metalness: 0.5, roughness: 0.35 });
  const body = new THREE.Mesh(rbox(w + 0.08, h + 0.08, 0.06, 0.03), frameM); body.position.set(0, 0.32 + h / 2, 0); g.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, 0.32 + h / 2, 0.031); g.add(screen);
  const neck = new THREE.Mesh(rbox(0.08, 0.3, 0.05, 0.015), frameM); neck.position.set(0, 0.17, -0.01); g.add(neck);
  const foot = new THREE.Mesh(rbox(0.42, 0.025, 0.24, 0.01), frameM); foot.position.set(0, 0.0125, 0); g.add(foot);
  const W2 = c.width, H2 = c.height, P = pts.map(([u, v]) => [70 + u * (W2 - 140), H2 - 60 - v * (H2 - 120)]);
  let key = -1;
  function draw(k) {
    const kk = Math.round(clamp(k) * 200); if (kk === key) return; key = kk;
    x.fillStyle = "#0b0c0f"; x.fillRect(0, 0, W2, H2);
    x.strokeStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 2; for (let yy = 60; yy < H2; yy += 80) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W2, yy); x.stroke(); }
    x.setLineDash([22, 16]); x.strokeStyle = "rgba(244,241,234,0.55)"; x.lineWidth = 5; x.beginPath(); x.moveTo(40, P[0][1]); x.lineTo(W2 - 40, P[0][1]); x.stroke(); x.setLineDash([]);
    // path length and the drawn part
    const seg = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; }
    let left = tot * kk / 200; x.strokeStyle = color; x.lineWidth = 12; x.lineJoin = "round"; x.lineCap = "round"; x.beginPath(); x.moveTo(P[0][0], P[0][1]);
    let hx = P[0][0], hy = P[0][1];
    for (let i = 1; i < P.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); hx = lerp(P[i - 1][0], P[i][0], f); hy = lerp(P[i - 1][1], P[i][1], f); x.lineTo(hx, hy); left -= seg[i - 1]; }
    x.stroke();
    x.fillStyle = "rgba(244,241,234,0.55)"; x.font = "800 34px Inter"; x.textAlign = "left"; x.fillText("JAN", 52, H2 - 18); x.textAlign = "right"; x.fillText("OUT", W2 - 52, H2 - 18);
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(hx, hy, 16, 0, Math.PI * 2); x.fill();
    x.fillStyle = color; x.beginPath(); x.arc(hx, hy, 9, 0, Math.PI * 2); x.fill();
    tex.needsUpdate = true;
  }
  draw(0);
  g.add(contactShadow(w * 0.9, 0.5));
  return { group: g, draw };
}

// ---------------------------------------------------------------- speech bubble
// White rounded bubble with a tail pointing down to the speaker (tail: -1 left, 1 right, 0 middle) and
// one of `texts` printed on it. show(i) picks the text. Origin: the tail tip; faces +z.
// API { group, show(i), w, h }
function makeSpeechBubble(texts, { w = 0.62, h = 0.36, tail = -1, fg = "#141414" } = {}) {
  const g = new THREE.Group(), white = pmat("#fbfaf6", { roughness: 0.35, clearcoat: 0.6 });
  const tx = tail * w * 0.28, tailH = h * 0.42;
  const body = new THREE.Mesh(rbox(w, h, 0.07, 0.1), white); body.position.set(-tx, tailH + h / 2, 0); g.add(body);
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-tail * 0.03 - 0.05, tailH + 0.02); sh.lineTo(-tail * 0.03 + 0.07, tailH + 0.02); sh.closePath();
  const tl = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), white); tl.position.z = -0.025; g.add(tl);
  const plates = texts.map((t) => { const p = makePlate(t, w * 0.82, h * 0.62, { bg: "#fbfaf6", fg, depth: 0.004 }); p.position.set(-tx, tailH + h / 2, 0.037); g.add(p); return p; });
  const show = (i) => plates.forEach((p, j) => { p.visible = j === i; });
  show(0);
  return { group: g, show, w, h: tailH + h };
}

// ---------------------------------------------------------------- the coin mobile
// A big gold coin (`face`, e.g. "US$") hanging from a cord that runs up out of frame; under it a brass
// hoop on four spokes; `n` small coins of many metals hang from the hoop on threads, two tiers. One coin
// (`special`) is green and gold. set(k, t): k 0..1 per coin (array or number) lifts each coin from its
// rest spot on the table (rest(i)) up to its hanging spot while its thread grows; t spins slowly.
// Origin: the hoop centre. API { group, big, set(k, t), coin(i), special, n }
function makeCoinMobile({ n = 44, R = 0.95, bigR = 0.36, face = "US$", special = 11, restY = -1.25, restR = [0.3, 1.1], restZ = 0.5, coinR = 0.055, seed = 9 } = {}) {
  const g = new THREE.Group(), rot = new THREE.Group(); g.add(rot);
  const brass = pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 });
  const big = makeCoin(bigR, face); big.group.position.y = bigR + 0.12; rot.add(big.group);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 4, 8), pmat(GOLD_METAL, { metalness: 1, roughness: 0.35 })); cord.position.y = bigR * 2 + 0.12 + 2; cord.userData.decor = true; g.add(cord);   // runs up out of frame: not part of the framed object
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 8, 96), brass); hoop.rotation.x = Math.PI / 2; rot.add(hoop);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4, p1 = new V3(Math.cos(a) * R, 0, Math.sin(a) * R), p0 = new V3(0, 0.1, 0);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, p0.distanceTo(p1), 6), brass); sp.position.copy(p0.clone().add(p1).multiplyScalar(0.5)); sp.quaternion.setFromUnitVectors(new V3(0, 1, 0), p1.clone().sub(p0).normalize()); rot.add(sp); }
  const r = mulberry32(seed), metals = ["#c9ccd1", "#b87333", "#d4af37", "#a9a9a9", "#cd7f32", "#e0d6b0"];
  const coins = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, tier = i % 2, len = 0.35 + tier * 0.32 + r() * 0.06;
    const isS = i === special, cr = isS ? coinR * 1.4 : coinR * (1 + r() * 0.22);
    const cm = isS ? pmat("#1f9a4b", { metalness: 0.6, roughness: 0.3 }) : pmat(metals[i % metals.length], { metalness: 1, roughness: 0.3 + r() * 0.15 });
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(cr, cr, 0.012, 32), cm); coin.rotation.x = Math.PI / 2; rot.add(coin);
    let rimC = null; if (isS) { rimC = new THREE.Mesh(new THREE.TorusGeometry(cr, 0.01, 8, 32), pmat("#f2c400", { metalness: 0.9, roughness: 0.25 })); coin.add(rimC); rimC.rotation.x = Math.PI / 2; }
    const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 1, 4), pmat("#e8e2d6", { roughness: 0.9 })); rot.add(thread);
    const hang = new V3(Math.cos(a) * R, -len, Math.sin(a) * R), top = new V3(Math.cos(a) * R, 0, Math.sin(a) * R);
    const rr = lerp(restR[0], restR[1], r()), ra = r() * Math.PI * 2;
    const rest = new V3(Math.cos(ra) * rr, restY + 0.006, Math.sin(ra) * rr * restZ);
    coins.push({ coin, thread, hang, top, rest, len, a, rimC });
  }
  function set(k, t = 0) {
    rot.rotation.y = t * 0.25;
    coins.forEach((c, i) => {
      const kk = clamp(Array.isArray(k) ? k[i] : k), e = eOut(kk);
      // the rest spot is fixed in world: undo the spin for it
      const rw = c.rest.clone().applyAxisAngle(new V3(0, 1, 0), -rot.rotation.y);
      c.coin.position.copy(rw).lerp(c.hang, e);
      c.coin.rotation.set(lerp(Math.PI / 2 + Math.PI / 2, Math.PI / 2, e), 0, 0); c.coin.rotation.y = lerp(0, c.a + Math.PI / 2, e);
      const vis = kk > 0.02; c.thread.visible = vis;
      if (vis) { const p0 = c.top, p1 = c.coin.position, L = Math.max(0.001, p0.distanceTo(p1)); c.thread.scale.y = L; c.thread.position.copy(p0.clone().add(p1).multiplyScalar(0.5)); c.thread.quaternion.setFromUnitVectors(new V3(0, 1, 0), p1.clone().sub(p0).normalize()); }
    });
    big.spin(Math.sin(t * 0.6) * 0.3);
  }
  set(0);
  return { group: g, big: big.group, set, coin: (i) => coins[i].coin, special, n };
}

// ---------------------------------------------------------------- bakery (backdrop)
// White subway tiles to shoulder height, warm plaster above, wooden wall shelves full of loaves, a brick
// oven with a fire glow on one side, a window on the night street (the cool second colour) on the other,
// pendant lamps over the counter, flour dust in the light. The counter (top at counterY, front at
// z = counterZ + 0.4) is part of the set: heroes stand on its top. All backdrop.
// API { group, counterY, counterZ, update(t), flare(k, color) } — flare tints lamps and oven (a beat).
// Glazed subway tiles in `color` (default a deep bottle green: a dark wall keeps the titles readable and
// the white of a baker's jacket stands out), light grout, a glint on each tile.
function bakeryTileTex(color = "#1f4d3d") {
  return cachedTex("bakery-tile-" + color, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(17), base = new THREE.Color(color);
    x.fillStyle = "#6d6a62"; x.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 16; j++) for (let i = -1; i < 9; i++) { const ox = j % 2 ? 32 : 0; x.fillStyle = "#" + base.clone().multiplyScalar(0.85 + r() * 0.3).getHexString(); roundRect(x, i * 64 + ox + 2, j * 32 + 2, 60, 28, 5); x.fill(); x.fillStyle = "rgba(255,255,255,0.22)"; x.fillRect(i * 64 + ox + 6, j * 32 + 5, 40, 3); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function breadCrustTex() {
  return cachedTex("bread-crust", () => {
    const c = makeCanvas(256, 128), x = c.getContext("2d"), r = mulberry32(23), gr = x.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "#c98a3e"); gr.addColorStop(0.5, "#b8742c"); gr.addColorStop(1, "#d9a35a"); x.fillStyle = gr; x.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 1400; i++) { x.fillStyle = r() < 0.5 ? `rgba(90,45,10,${0.1 + r() * 0.2})` : `rgba(255,220,160,${0.08 + r() * 0.15})`; x.fillRect(r() * 256, r() * 128, 1 + r() * 3, 1 + r() * 2); }
    return texFrom(c);
  });
}
// A French roll (pão francês): an elongated golden loaf with the light "pestana" along its top. Origin:
// bottom centre, long side along x. Returns the group.
function makeFrenchRoll(s = 1) {
  const g = new THREE.Group(), crust = pmat("#ffffff", { map: breadCrustTex(), roughness: 0.7, clearcoat: 0.15 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.038 * s, 0.085 * s, 8, 18), crust); body.rotation.z = Math.PI / 2; body.scale.set(0.85, 1, 0.92); body.position.y = 0.032 * s; g.add(body);
  const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.012 * s, 0.075 * s, 6, 10), pmat("#e8c27a", { roughness: 0.8 })); ear.rotation.z = Math.PI / 2 + 0.12; ear.scale.set(1, 1, 0.55); ear.position.set(0, 0.062 * s, 0.006 * s); g.add(ear);
  return g;
}
function makeBakerySet({ wallZ = -1.0, counterY = 0.95, counterZ = 0, seed = 5, tile = "#1f4d3d", lampsX = [-1.4, 0, 1.4] } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), W = 16;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 10), pmat("#ffffff", { map: tileTex(retailFloorTex(), 10, 6), roughness: 0.3, clearcoat: 0.3 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, wallZ + 5); g.add(fl);
  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(W, 1.7), pmat("#ffffff", { map: tileTex(bakeryTileTex(tile), W / 2, 1.7 / 1), roughness: 0.18, clearcoat: 0.7 })); tiles.position.set(0, 0.85, wallZ); g.add(tiles);
  const upper = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.6), mat("#ffffff", { map: tileTex(plasterTex("#6a4a35"), 3, 0.6), roughness: 0.9 })); upper.position.set(0, 1.7 + 1.3, wallZ); g.add(upper);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.05), pmat("#3a2418", { roughness: 0.5 })); trim.position.set(0, 1.71, wallZ + 0.025); g.add(trim);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, 10), mat("#2a1f18", { roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.3, wallZ + 5); g.add(ceil);
  // counter: a wooden plinth, a glass case of rolls along the front (wood back panel, warm light inside),
  // a marble top
  const wood = pmat("#ffffff", { map: woodTex("#5a3824"), roughness: 0.5, clearcoat: 0.3 }), CW = W * 0.6, caseH = counterY - 0.04 - 0.3;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(CW, 0.3, 0.8), wood); plinth.position.set(0, 0.15, counterZ); g.add(plinth);
  const backP = new THREE.Mesh(new THREE.BoxGeometry(CW, caseH, 0.05), wood); backP.position.set(0, 0.3 + caseH / 2, counterZ - 0.375); g.add(backP);
  const top = new THREE.Mesh(rbox(CW + 0.06, 0.04, 0.86, 0.01), pmat("#d9d3c8", { roughness: 0.25, clearcoat: 0.8, map: noiseTex({ base: "#d9d3c8", amount: 0.12, seed: 71 }) })); top.position.set(0, counterY - 0.02, counterZ); g.add(top);
  const cs = new THREE.Mesh(new THREE.BoxGeometry(CW, caseH, 0.02), glassMat({ opacity: 0.14 })); cs.position.set(0, 0.3 + caseH / 2, counterZ + 0.4); cs.userData.noShadow = true; g.add(cs);
  for (let i = 0; i < 8; i++) { const mu = new THREE.Mesh(new THREE.BoxGeometry(0.03, caseH, 0.03), pmat("#c9ccd1", { metalness: 0.9, roughness: 0.3 })); mu.position.set(-CW / 2 + ((i + 0.5) * CW) / 8, 0.3 + caseH / 2, counterZ + 0.41); g.add(mu); }
  const caseLight = new THREE.Mesh(new THREE.PlaneGeometry(CW, caseH), new THREE.MeshBasicMaterial({ map: setGlowTex(), color: "#ffcf8a", transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); caseLight.position.set(0, 0.3 + caseH / 2, counterZ - 0.34); g.add(caseLight);
  for (let i = 0; i < 44; i++) { const b = makeFrenchRoll(1.1); b.position.set(-4.3 + i * 0.2 + r() * 0.05, 0.3, counterZ + 0.05 + (i % 2) * 0.16); b.rotation.y = (r() - 0.5) * 0.4; g.add(b); }
  const shelfM = pmat("#ffffff", { map: woodTex("#6b4429"), roughness: 0.55 });
  for (const s of [-1, 1]) for (const y of [2.05, 2.6, 3.15]) {
    const sh = new THREE.Mesh(rbox(2.6, 0.05, 0.36, 0.01), shelfM); sh.position.set(s * 2.6, y, wallZ + 0.18); g.add(sh);
    for (let i = 0; i < 9; i++) { const b = makeFrenchRoll(1.6 + r() * 0.4); b.position.set(s * 2.6 - 1.1 + i * 0.27, y + 0.025, wallZ + 0.16 + (r() - 0.5) * 0.08); b.rotation.y = (r() - 0.5) * 0.5; g.add(b); }
    for (let i = 0; i < 3; i++) { const lf = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 8, 16), pmat("#ffffff", { map: breadCrustTex(), roughness: 0.7 })); lf.rotation.z = Math.PI / 2; lf.scale.set(0.8, 1, 0.9); lf.position.set(s * 2.6 - 0.9 + i * 0.9, y + 0.1, wallZ + 0.2); g.add(lf); }
  }
  // brick oven with the fire (right) and a window on the night street (left), both well out to the side
  const oven = new THREE.Group(); oven.position.set(4.6, 0, wallZ + 0.3); g.add(oven);
  const brick = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.6), mat("#ffffff", { map: tileTex(setBrickTex(), 2, 2.2), roughness: 0.9 })); brick.position.y = 1.3; oven.add(brick);
  const mouthM = new THREE.MeshBasicMaterial({ color: "#ff8a2a", toneMapped: false });
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32, 0, Math.PI), mouthM); mouth.position.set(0, 1.05, 0.301); oven.add(mouth);
  const fireGlow = sprite(BOKEH, 2.4); fireGlow.material.color.set("#ff7a1a"); fireGlow.material.blending = THREE.AdditiveBlending; fireGlow.position.set(0, 1.2, 0.5); oven.add(fireGlow);
  const winG = makeSetWindow(1.8, 1.6, { open: 0.3, seed: seed + 2 }); winG.group.position.set(-4.6, 2.4, wallZ); g.add(winG.group);
  const winGlow = makeFloorGlow(2.4, 2.0, { color: "#9db8ff", opacity: 0.1 }); winGlow.position.set(-4.4, 0.01, wallZ + 1.6); g.add(winGlow);
  const lamps = [];
  for (const lx of lampsX) { const lp = makePendantLamp({ drop: 1.1, r: 0.2, light: false }); lp.position.set(lx, 4.3, counterZ - 0.1); g.add(lp); const halo = sprite(BOKEH, 1.2); halo.material.color.set("#ffc27a"); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0.55; halo.position.set(lx, 4.3 - 1.1 - 0.17, counterZ - 0.1); g.add(halo); lamps.push(halo); }
  const pools = []; for (const lx of lampsX) { const p = makeFloorGlow(1.6, 1.0, { color: "#ffd59a", opacity: 0.12 }); p.rotation.x = -Math.PI / 2; p.position.set(lx, counterY + 0.002, counterZ); g.add(p); pools.push(p); }
  const motes = makeSetMotes(160, [[-3, counterY, wallZ + 0.2], [3, 3.6, counterZ + 1.5]], { color: "#ffe9cc", seed: seed + 9, opacity: 0.4 }); g.add(motes.points);
  asBackdrop(g);
  const lampC = new THREE.Color("#ffc27a"); let fk = 0, fc = new THREE.Color("#ff3b1f");
  return {
    group: g, counterY, counterZ,
    update(t) {
      motes.update(t);
      const fl2 = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 13.1);
      mouthM.color.set("#ff8a2a").multiplyScalar(fl2); fireGlow.material.opacity = 0.55 * fl2;
      lamps.forEach((h) => { h.material.color.copy(lampC).lerp(fc, fk); h.material.opacity = 0.55 + 0.35 * fk; });
      pools.forEach((p) => { p.material.color.set("#ffd59a").lerp(fc, fk); p.material.opacity = 0.12 + 0.12 * fk; });
    },
    flare(k, color = "#ff3b1f") { fk = clamp(k); fc.set(color); },
  };
}

// Wicker basket heaped with French rolls. Origin: bottom centre (on a counter). API { group, top, r }
function wickerTex() {
  return cachedTex("wicker", () => {
    const c = makeCanvas(256, 128), x = c.getContext("2d"); x.fillStyle = "#6a4422"; x.fillRect(0, 0, 256, 128);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 16; i++) { const ox = j % 2 ? 8 : 0, gr = x.createLinearGradient(i * 16 + ox, 0, i * 16 + ox + 16, 0); gr.addColorStop(0, "#8a5a2c"); gr.addColorStop(0.5, "#c08a4a"); gr.addColorStop(1, "#7a4c24"); x.fillStyle = gr; roundRect(x, i * 16 + ox + 1, j * 16 + 2, 14, 12, 4); x.fill(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function makeBreadBasket({ r = 0.3, h = 0.16, n = 11, seed = 4 } = {}) {
  const g = new THREE.Group(), wm = pmat("#ffffff", { map: tileTex(wickerTex(), 6, 1), roughness: 0.75, side: THREE.DoubleSide });
  const prof = [[0, 0.004], [r * 0.78, 0], [r * 0.86, h * 0.3], [r * 0.95, h * 0.75], [r, h]].map(([a, b]) => new THREE.Vector2(a, b));
  const basket = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), wm); basket.scale.z = 0.72; g.add(basket);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 10, 48), pmat("#8a5a2c", { roughness: 0.7 })); rim.rotation.x = Math.PI / 2; rim.scale.y = 0.72; rim.position.y = h; g.add(rim);
  const rr = mulberry32(seed), spots = [[0, 0], [-0.12, -0.06], [0.12, -0.06], [-0.12, 0.06], [0.12, 0.06], [0, -0.1], [0, 0.1], [-0.06, 0], [0.06, 0], [-0.04, -0.04], [0.05, 0.05]];
  for (let i = 0; i < n; i++) { const [sx, sz] = spots[i % spots.length], tier = i < 7 ? 0 : 1; const b = makeFrenchRoll(r / 0.3 * 1.25); b.position.set(sx * r / 0.3, h * 0.45 + tier * 0.07 * r / 0.3, sz * r / 0.3 * 0.9); b.rotation.set((rr() - 0.5) * 0.3, (rr() - 0.5) * 1.2, (rr() - 0.5) * 0.25); g.add(b); }
  g.add(contactShadow(r * 2.6, r * 2));
  return { group: g, top: h + 0.12 * r / 0.3, r };
}

// A stand-up shelf card (price-card holder): a dark acrylic sign on a steel clip and base, with `text`
// printed, and an optional red chip under it (`chip`, shown with showChip(k)). Origin: table top, centre.
// API { group, plate, chip, showChip(k) }
function makeShelfCard(text, { w = 0.62, h = 0.2, chip = null, chipW = 0.42 } = {}) {
  const g = new THREE.Group(), steel = pmat("#c9ccd1", { metalness: 1, roughness: 0.25 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 24), steel); base.position.y = 0.01; g.add(base);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), steel); rod.position.y = 0.1; g.add(rod);
  const ch = chip ? 0.13 : 0;
  const p = makePlate(text, w, h, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, 0.18 + ch + h / 2, 0); g.add(p);
  let c = null; if (chip) { c = makePlate(chip, chipW, 0.11, { bg: RED, fg: "#ffffff" }); c.position.set(0, 0.18 + 0.055, 0.005); g.add(c); }
  return { group: g, plate: p, chip: c, showChip: (k) => { if (c) { c.visible = k > 0.01; c.scale.setScalar(Math.max(0.0001, k)); } } };
}

// ---------------------------------------------------------------- sacks, grain, signs
function burlapTex(base = "#c8ad7f") { return cachedTex("burlap-" + base, () => { const t = noiseTex({ base, amount: 0.22, size: 1.5, seed: 44, weave: true }); t.repeat.set(3, 4); return t; }); }
function wovenTex(base = "#ecebe6") { return cachedTex("woven-" + base, () => { const t = noiseTex({ base, amount: 0.12, size: 1, seed: 45, weave: true }); t.repeat.set(5, 6); return t; }); }
// Standing sack (flour, fertilizer, soybeans): a pillow-shaped body sewn across the top, a big
// printed label on the front (`label`, optional `sub` under it) and a coloured band. cloth: "burlap" |
// "woven". Origin: floor centre; front +z (the label face is at z = front). API { group, front, w, h }
function makeProduceSack(label, { w = 0.5, h = 0.72, d = 0.32, cloth = "burlap", band = null, sub = null, base = null, labelH = null, labelW = null, labelY = null, detail = false } = {}) {
  const g = new THREE.Group(), tex = cloth === "burlap" ? burlapTex(base || "#c8ad7f") : wovenTex(base || "#ecebe6");
  const cm = pmat("#ffffff", { map: tex, roughness: 0.92, sheen: 0.3, sheenColor: new THREE.Color("#fff2dc") });
  // a pillow: full in the middle, sewn flat across the top (the seam with its stitches), rounded at the
  // bottom and the sides — reads as a sack, not a jug
  const geo = new THREE.BoxGeometry(w, h, d, 18, 24, 8), P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ny = y / (h / 2), nx = x / (w / 2);
    const top = Math.pow(Math.max(0, ny), 6), bot = Math.pow(Math.max(0, -ny), 8);
    P.setXYZ(i, x * (1 + 0.05 * (1 - ny * ny) - 0.03 * top), y, z * (1 - 0.86 * top - 0.3 * bot) * (1 - 0.08 * nx * nx));
  }
  geo.translate(0, h / 2, 0); geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, cm); g.add(body);
  const seamT = makeCanvas(256, 16), sx = seamT.getContext("2d"); sx.fillStyle = cloth === "burlap" ? "#a88c5c" : "#d9d6cc"; sx.fillRect(0, 0, 256, 16); sx.fillStyle = "#6a5a40"; for (let i = 0; i < 256; i += 12) sx.fillRect(i, 6, 7, 3);
  const seam = new THREE.Mesh(rbox(w * 1.02, 0.035, d * 0.16, 0.01), pmat("#ffffff", { map: texFrom(seamT), roughness: 0.9 })); seam.position.y = h - 0.012; g.add(seam);
  const front = d / 2 + 0.002;
  if (band) { const b = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, h * 0.07, 0.004), pmat(band, { roughness: 0.6 })); b.position.set(0, h * 0.2, front); g.add(b); }
  const lh = labelH || (sub ? h * 0.14 : h * 0.17);
  const p = makePlate(label, labelW || w * 0.86, lh, { bg: cloth === "burlap" ? "#efe3c8" : "#ffffff", fg: "#1c2a1c", detail }); p.position.set(0, h * (labelY || (sub ? 0.58 : 0.5)), front); g.add(p);
  if (sub) { const s2 = makePlate(sub, w * 0.7, h * 0.09, { bg: cloth === "burlap" ? "#efe3c8" : "#ffffff", fg: "#3a3a2a", detail: true }); s2.position.set(0, h * 0.44, front); g.add(s2); }
  g.add(contactShadow(w * 1.6, d * 2));
  return { group: g, front, w, h };
}
// Heap of grain on the floor (wheat, soybeans): a rounded cone with a grain texture. grow(k) scales it
// (0 → flat, 1 → full). Origin: floor centre. API { group, grow(k), r, h }
function grainTex(base = "#d4a94e") {
  return cachedTex("grain-" + base, () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(31), col = new THREE.Color(base);
    x.fillStyle = base; x.fillRect(0, 0, 512, 512);
    x.fillStyle = "#" + col.clone().multiplyScalar(0.55).getHexString(); x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4200; i++) { const k = 0.75 + r() * 0.55, cc = col.clone().multiplyScalar(k), px = r() * 512, py = r() * 512, a = r() * 3.14; x.fillStyle = "#" + cc.getHexString(); x.beginPath(); x.ellipse(px, py, 5 + r() * 2.5, 2.6 + r() * 1.2, a, 0, Math.PI * 2); x.fill(); x.fillStyle = "rgba(60,30,5,0.35)"; x.beginPath(); x.ellipse(px, py, 4, 0.6, a, 0, Math.PI * 2); x.fill(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
  });
}
function makeGrainHeap({ r = 1.2, h = 0.8, base = "#d4a94e" } = {}) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new THREE.Vector2(r * (1 - u), h * (1 - Math.pow(1 - u, 1.6)) * (u < 0.98 ? 1 : 1))); }
  pts.push(new THREE.Vector2(0, h));
  const heap = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), pmat("#ffffff", { map: grainTex(base), roughness: 0.85, bumpMap: grainTex(base), bumpScale: 1.2, side: THREE.DoubleSide })); inner.add(heap);
  const sh = contactShadow(r * 2.6, r * 2.6); g.add(sh);
  const grow = (k) => { const kk = Math.max(0.02, clamp(k)); inner.scale.set(Math.pow(kk, 0.4), kk, Math.pow(kk, 0.4)); };
  grow(1);
  return { group: g, grow, r, h, heap };
}
// A sign on a wooden stake: `text` printed on a plate, the stake's tip at the origin (push it into a
// heap or the ground). API { group, plate, w, h, stake }
function makeStakeSign(text, { w = 0.7, h = 0.3, stake = 0.6, bg = "#141414", fg = "#ffffff" } = {}) {
  const g = new THREE.Group();
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, stake, 8), pmat("#ffffff", { map: woodTex("#7a5232"), roughness: 0.7 })); st.position.y = stake / 2; g.add(st);
  const board = new THREE.Mesh(rbox(w + 0.04, h + 0.04, 0.03, 0.015), pmat("#2a1c12", { roughness: 0.6 })); board.position.set(0, stake + h / 2, -0.005); g.add(board);
  const p = makePlate(text, w, h, { bg, fg }); p.position.set(0, stake + h / 2, 0.012); g.add(p);
  return { group: g, plate: p, w, h: stake + h + 0.02, stake };
}

// ---------------------------------------------------------------- warehouse (backdrop)
// Grain and fertilizer warehouse at night: concrete floor with yellow lane lines, a corrugated steel back
// wall, a row of high windows with blue night light falling in beams, steel trusses and warm industrial
// lamps, pallet racks of sacks on both sides, dust in the beams. All backdrop.
// API { group, update(t), lamps(k, color) }
function corrugatedTex() {
  return cachedTex("corrugated", () => {
    const c = makeCanvas(256, 64), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 32, 0);
    gr.addColorStop(0, "#4d5560"); gr.addColorStop(0.5, "#7a838e"); gr.addColorStop(1, "#4d5560"); x.fillStyle = gr;
    for (let i = 0; i < 8; i++) { x.save(); x.translate(i * 32, 0); x.fillRect(0, 0, 32, 64); x.restore(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function makeWarehouseSet({ wallZ = -4, clear = 7, ceil = 7, seed = 7 } = {}) {
  const g = new THREE.Group(), W = 40, r = mulberry32(seed);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, 24), mat("#ffffff", { map: tileTex(noiseTex({ base: "#5a5852", amount: 0.2, seed: 62 }), 10, 6), roughness: 0.85 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, wallZ + 12); g.add(fl);
  for (const x of [-clear / 2 - 0.4, clear / 2 + 0.4]) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 20), mat("#e0b21a", { roughness: 0.7 })); ln.rotation.x = -Math.PI / 2; ln.position.set(x, 0.004, wallZ + 10); g.add(ln); }
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(W, ceil), mat("#ffffff", { map: tileTex(corrugatedTex(), 30, 1), roughness: 0.55, metalness: 0.4 })); wl.position.set(0, ceil / 2, wallZ); g.add(wl);
  const wins = [];
  for (let i = -3; i <= 3; i++) { const wn = makeGlowWindow(1.8, 1.1, { cols: 4, rows: 2, color: "#7fa8ff" }); wn.group.position.set(i * 2.6, ceil - 1.1, wallZ + 0.02); g.add(wn.group); wins.push(wn);
    const bm = makeLightShaft([i * 2.6, ceil - 1.2, wallZ + 0.1], [i * 2.6 + 0.6, 0.05, wallZ + 4.5], { w0: 1.6, w1: 2.6, color: "#9db8ff", opacity: 0.09 }); g.add(bm.group); }
  const steel = pmat("#3a3f46", { metalness: 0.7, roughness: 0.4 });
  for (let z = wallZ + 1; z < wallZ + 14; z += 3) { const tr = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, 0.18), steel); tr.position.set(0, ceil - 0.3, z); g.add(tr); }
  const lampH = []; const lampM = new THREE.MeshBasicMaterial({ color: "#ffd59a", toneMapped: false });
  for (const x of [-4.5, -1.5, 1.5, 4.5]) for (const z of [wallZ + 2.5, wallZ + 5.5]) {
    const sh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 24, 1, true), pmat("#2f3a36", { metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide })); sh.position.set(x, ceil - 1.1, z); g.add(sh);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.8, 6), steel); cord.position.set(x, ceil - 0.65, z); g.add(cord);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), lampM); bulb.position.set(x, ceil - 1.22, z); g.add(bulb);
    const halo = sprite(BOKEH, 1.4); halo.material.color.set("#ffc27a"); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0.5; halo.position.copy(bulb.position); g.add(halo); lampH.push(halo);
    const pool = makeFloorGlow(3.0, 3.0, { color: "#ffd59a", opacity: 0.08 }); pool.position.set(x, 0.006, z); g.add(pool);
  }
  // pallet racks with sacks on both sides (instanced sacks)
  const sackG = rbox(0.9, 0.22, 0.5, 0.08, 3), sackM = pmat("#e6e2d6", { roughness: 0.9 }), spots = [];
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const x = s * (clear / 2 + 1.4 + k * 2.6);
    for (const y of [0.15, 1.6, 3.05]) { const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 6), pmat("#d2611c", { roughness: 0.5 })); beam.position.set(x - s * 0.55, y, wallZ + 3.5); g.add(beam);
      for (let z = 0; z < 5.5; z += 0.55) for (let l = 0; l < 3; l++) if (r() < 0.85) spots.push([x, y + 0.11 + 0.06 + l * 0.22, wallZ + 0.9 + z]); }
    for (const zz of [wallZ + 0.6, wallZ + 6.4]) { const up = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.4, 0.08), pmat("#2b5aa0", { roughness: 0.5 })); up.position.set(x - s * 0.55, 2.2, zz); g.add(up); }
  }
  const sk = new THREE.InstancedMesh(sackG, sackM, spots.length), o = new THREE.Object3D();
  spots.forEach(([x, y, z], i) => { o.position.set(x, y, z); o.rotation.y = (r() - 0.5) * 0.1; o.updateMatrix(); sk.setMatrixAt(i, o.matrix); }); g.add(sk);
  const motes = makeSetMotes(200, [[-6, 0.2, wallZ + 0.3], [6, ceil - 1, wallZ + 6]], { color: "#cfe0ff", seed: seed + 3, opacity: 0.35 }); g.add(motes.points);
  asBackdrop(g);
  const base = new THREE.Color("#ffc27a");
  return {
    group: g,
    update(t) { motes.update(t); },
    lamps(k, color = "#ffc27a") { lampH.forEach((h) => { h.material.color.copy(base).lerp(new THREE.Color(color), clamp(k)); }); },
  };
}

// ---------------------------------------------------------------- capsule blister card
// A big blister card standing on a little easel: silver foil card with `title` printed across the top,
// rows × cols clear bubbles each holding a two-tone capsule. tint(i, k): capsule i goes from its colours
// to `to` colours. Origin: table top, centre; faces +z. API { group, tint(i, k), n }
function makeCapsuleBlister({ cols = 5, rows = 2, w = 1.2, h = 0.66, title = "MATÉRIA-PRIMA", from = ["#f3efe6", "#e0782a"], to = ["#e9f6ee", "#1f9a4b"] } = {}) {
  const g = new THREE.Group(), card = new THREE.Group(); g.add(card);
  card.position.y = 0.06; card.rotation.x = -0.18;
  const foil = new THREE.Mesh(rbox(w, h, 0.012, 0.03), pmat("#c9ccd1", { metalness: 0.9, roughness: 0.32, map: noiseTex({ base: "#cfd2d6", amount: 0.1, seed: 81 }) })); foil.position.y = h / 2; card.add(foil);
  const th = h * 0.17;
  const tp = makePlate(title, w * 0.9, th * 0.9, { bg: "#1f3550", fg: "#ffffff", depth: 0.004 }); tp.position.set(0, h - th * 0.62, 0.008); card.add(tp);
  const area = { w: w * 0.9, h: h - th - 0.06 }, cw = area.w / cols, rh = area.h / rows, caps = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = -area.w / 2 + cw * (i + 0.5), cy = 0.04 + rh * (rows - j - 0.5);
    const bub = new THREE.Mesh(new THREE.CapsuleGeometry(Math.min(cw, rh) * 0.24, rh * 0.36, 8, 16), glassMat({ opacity: 0.25 })); bub.scale.z = 0.55; bub.position.set(cx, cy, 0.02); bub.userData.noShadow = true; card.add(bub);
    const cr = Math.min(cw, rh) * 0.17, cl = rh * 0.2;
    const a = pmat(from[0], { roughness: 0.25, clearcoat: 1 }), b = pmat(from[1], { roughness: 0.25, clearcoat: 1 });
    const top = new THREE.Mesh(new THREE.CapsuleGeometry(cr, cl * 0.5, 6, 14), a); top.position.set(cx, cy + cl * 0.3, 0.03); card.add(top);
    const bot = new THREE.Mesh(new THREE.CapsuleGeometry(cr * 1.02, cl * 0.5, 6, 14), b); bot.position.set(cx, cy - cl * 0.3, 0.03); card.add(bot);
    caps.push({ a, b });
  }
  const easel = new THREE.Mesh(rbox(0.06, h * 0.8, 0.04, 0.01), pmat("#2a2c30", { metalness: 0.6, roughness: 0.3 })); easel.position.set(0, 0.06 + h * 0.36, -0.2); easel.rotation.x = 0.35; g.add(easel);
  const lip = new THREE.Mesh(rbox(w * 0.9, 0.05, 0.08, 0.01), pmat("#2a2c30", { metalness: 0.6, roughness: 0.3 })); lip.position.set(0, 0.025, 0.02); g.add(lip);
  g.add(contactShadow(w * 1.3, 0.8));
  const fa = from.map((c) => new THREE.Color(c)), ta = to.map((c) => new THREE.Color(c));
  return { group: g, n: caps.length, tint(i, k) { const c = caps[i], kk = clamp(k); c.a.color.copy(fa[0]).lerp(ta[0], kk); c.b.color.copy(fa[1]).lerp(ta[1], kk); c.b.emissive.copy(ta[1]).multiplyScalar(0.25 * kk); } };
}

// ---------------------------------------------------------------- grocery basket
// Red plastic shopping basket with two handles, holding a milk carton, a pack of rice, a can and a loaf.
// Origin: bottom centre. API { group, h }
function makeGroceryBasket({ w = 0.5, d = 0.34, h = 0.24 } = {}) {
  const g = new THREE.Group(), red = pmat("#c9231b", { roughness: 0.4, clearcoat: 0.5 });
  const c = makeCanvas(128, 64), x = c.getContext("2d"); x.fillStyle = "#c9231b"; x.fillRect(0, 0, 128, 64); x.fillStyle = "#000"; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) x.fillRect(6 + i * 15, 10 + j * 17, 9, 9);
  const holes = texFrom(c); holes.wrapS = THREE.RepeatWrapping;
  const side = pmat("#ffffff", { map: holes, alphaMap: (() => { const a = makeCanvas(128, 64), y = a.getContext("2d"); y.fillStyle = "#fff"; y.fillRect(0, 0, 128, 64); y.fillStyle = "#000"; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) y.fillRect(6 + i * 15, 10 + j * 17, 9, 9); return texFrom(a); })(), transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.4 });
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), red); bottom.position.y = 0.01; g.add(bottom);
  for (const [pw, px, pz, ry] of [[w, 0, d / 2, 0], [w, 0, -d / 2, 0], [d, w / 2, 0, Math.PI / 2], [d, -w / 2, 0, Math.PI / 2]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, h), side); p.position.set(px, h / 2, pz); p.rotation.y = ry; g.add(p); }
  const rimM = red; for (const [rw, rx, rz, ry] of [[w, 0, d / 2, 0], [w, 0, -d / 2, 0], [d, w / 2, 0, Math.PI / 2], [d, -w / 2, 0, Math.PI / 2]]) { const rb = new THREE.Mesh(rbox(rw + 0.02, 0.025, 0.02, 0.008), rimM); rb.position.set(rx, h, rz); rb.rotation.y = ry; g.add(rb); }
  // two handles: half rings standing over the long sides, leaning outwards
  for (const s of [-1, 1]) { const hd = new THREE.Mesh(new THREE.TorusGeometry(w * 0.3, 0.012, 8, 24, Math.PI), pmat("#2a2c30", { roughness: 0.4 })); hd.position.set(0, h, s * d * 0.42); hd.rotation.x = -s * 0.5; g.add(hd); }
  const milk = new THREE.Mesh(rbox(0.09, 0.2, 0.09, 0.01), pmat("#f4f2ee", { roughness: 0.5 })); milk.position.set(-w * 0.28, 0.12, -0.04); g.add(milk);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12), pmat("#2f6fb0")); cap.position.set(-w * 0.28 + 0.02, 0.23, -0.04); g.add(cap);
  const rice = new THREE.Mesh(rbox(0.16, 0.24, 0.07, 0.015), pmat("#e8c84a", { roughness: 0.6 })); rice.position.set(-w * 0.04, 0.14, 0.05); rice.rotation.z = 0.1; g.add(rice);
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.11, 20), pmat("#b8bcc2", { metalness: 0.9, roughness: 0.3 })); can.position.set(w * 0.18, 0.075, -0.06); g.add(can);
  const loaf = makeFrenchRoll(1.6); loaf.position.set(w * 0.2, 0.13, 0.07); loaf.rotation.z = -0.2; g.add(loaf);
  return { group: g, h };
}

// ---------------------------------------------------------------- port at night (backdrop)
// A concrete quay with bollards and lamp posts, the dark sea, a ship's hull moored along the quay behind,
// two container cranes with blinking red lights, a far skyline with lights, bokeh. update(t). All backdrop.
function makePortNightSet({ quayZ = -3, seed = 6 } = {}) {
  const g = new THREE.Group();
  const quay = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), mat("#ffffff", { map: tileTex(noiseTex({ base: "#4a4c50", amount: 0.22, seed: 66 }), 10, 4), roughness: 0.85 })); quay.rotation.x = -Math.PI / 2; quay.position.set(0, 0.002, quayZ + 7); g.add(quay);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.3), pmat("#d9b21a", { roughness: 0.6 })); edge.position.set(0, -0.1, quayZ); g.add(edge);
  const sea = makeSea({ size: 70, seg: 60, color: "#0d2230" }); sea.mesh.position.set(0, -0.6, quayZ - 35); g.add(sea.mesh);
  const hull = new THREE.Mesh(rbox(16, 3.2, 3.2, 0.3), pmat("#1d2a3a", { metalness: 0.3, roughness: 0.6 })); hull.position.set(-2, 0.4, quayZ - 4.4); g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.1, 3.0), pmat("#5a2a20", { roughness: 0.7 })); deck.position.set(-2, 2.05, quayZ - 4.4); g.add(deck);
  const r = mulberry32(seed), cont = ["#5a2a26", "#24384e", "#5e4a2c", "#2c3e30", "#3e3e40"];
  for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(rbox(1.2, 0.5, 0.5, 0.02), pmat(cont[i % 5], { roughness: 0.6 })); c.position.set(-9 + (i % 9) * 1.3, 2.35 + Math.floor(i / 9) * 0.52, quayZ - 4.4 + (r() - 0.5) * 0.6); g.add(c); }
  const craneM = pmat("#c9a227", { metalness: 0.5, roughness: 0.45 }), blinks = [];
  for (const cx of [-6, 5]) {
    for (const lz of [-0.6, 0.6]) for (const lx of [-1.2, 1.2]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7, 0.22), craneM); leg.position.set(cx + lx, 3.5, quayZ - 0.4 + lz); g.add(leg); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 14), craneM); beam.position.set(cx, 7.2, quayZ - 3); g.add(beam);
    const cab = new THREE.Mesh(rbox(1.2, 0.8, 1.2, 0.05), pmat("#e8e3d8", { roughness: 0.5 })); cab.position.set(cx, 6.6, quayZ - 2); g.add(cab);
    const bl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false })); bl.position.set(cx, 7.5, quayZ - 3); g.add(bl);
    const bh = sprite(BOKEH, 1.0); bh.material.color.set("#ff3b2a"); bh.material.blending = THREE.AdditiveBlending; bh.position.copy(bl.position); g.add(bh); blinks.push(bh);
  }
  const sky = makeSkyline({ n: 30, z: quayZ - 26, spread: 60, seed: seed + 2, hMin: 3, hMax: 12 }); g.add(sky.group);
  const lamps = []; for (const lx of [-9.5, -6.5, 6.5, 9.5]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4, 10), pmat("#2a2c30", { metalness: 0.7, roughness: 0.4 })); pole.position.set(lx, 2, quayZ + 0.6); g.add(pole); const hd = sprite(BOKEH, 1.5); hd.material.color.set("#ffcf8a"); hd.material.blending = THREE.AdditiveBlending; hd.position.set(lx, 4.1, quayZ + 0.6); g.add(hd); lamps.push(hd); const pool = makeFloorGlow(3, 3, { color: "#ffd59a", opacity: 0.1 }); pool.position.set(lx, 0.006, quayZ + 1.5); g.add(pool); }
  for (const bx of [-8, -4.5, 4.5, 8]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.35, 14), pmat("#1c1e22", { metalness: 0.5, roughness: 0.4 })); b.position.set(bx, 0.175, quayZ + 0.35); g.add(b); }
  const bokeh = makeBokeh({ n: 40, center: [0, 4, quayZ - 22], spread: [50, 8, 6], size: [0.4, 1.4], colors: ["#ffcf8a", "#9fc3ff", "#ff9a4a", "#fff2dc"], opacity: 0.4, seed: seed + 4 }); g.add(bokeh.group);
  asBackdrop(g);
  return { group: g, update(t) { sea.update(t); sky.update(t); bokeh.update(t); blinks.forEach((b, i) => { b.material.opacity = 0.2 + 0.8 * (Math.sin(t * 3 + i * 1.7) > 0.3 ? 1 : 0); }); } };
}
