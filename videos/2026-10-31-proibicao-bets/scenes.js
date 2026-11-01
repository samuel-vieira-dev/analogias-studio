// ============================================================================
// videos/2026-10-31-proibicao-bets/scenes.js
// A liberação e a proibição das bets. Analogia única (ponto difícil: o que é medida provisória):
// pênalti marcado esperando o VAR; o VAR é o Congresso, e ele nem foi ligado (comissão não começou).
// Narration 0–93.3 s (audio/words.json), video 95.4 s.
//
// Pattern for every scene:
//   anim(t) animates objects only (no camera); CAM.pose / CAM.move on an envelope() frames the subject
//   inside the centred safe zone ("stage" when the headline band has text, "stage-tall" when not).
//   Backdrops (betting shop, skyline, stadium, crowd) fill the frame for context; never framed/checked.
// No real brands: betting apps, sites and ads are generic.
// ============================================================================

const eIn = (x) => x * x * x;
const DESK_TOP = 0.9;

// ---------------------------------------------------------------- shared set pieces
// Wooden counter block (top at DESK_TOP), the surface the documents and books lie on.
function makeDesk(S, { w = 6, d = 3.4, wood = "#3a2214", seed = 22 } = {}) {
  const top = pmat("#ffffff", { map: woodTex({ base: wood, seed }), roughness: 0.4, clearcoat: 0.5 }), side = pmat("#2a1810", { roughness: 0.6 });
  const m = new THREE.Mesh(rbox(w, DESK_TOP, d, 0.03), [side, side, top, side, side, side]); m.position.y = DESK_TOP / 2; S.add(m); return m;
}
// Night match on a TV: mowed pitch, lines, two teams of dots and the ball (no score, no text).
function matchTex() {
  const c = makeCanvas(512, 288), x = c.getContext("2d"), r = mulberry32(5);
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#2e7a36" : "#38893f"; x.fillRect(i * 64, 0, 64, 288); }
  x.strokeStyle = "rgba(240,245,235,0.9)"; x.lineWidth = 3; x.strokeRect(10, 20, 492, 250); x.beginPath(); x.moveTo(256, 20); x.lineTo(256, 270); x.stroke();
  x.beginPath(); x.arc(256, 145, 40, 0, Math.PI * 2); x.stroke(); x.strokeRect(10, 85, 70, 120); x.strokeRect(432, 85, 70, 120);
  for (let i = 0; i < 20; i++) { x.fillStyle = i % 2 ? "#e8e8e8" : "#d0302a"; x.beginPath(); x.arc(40 + r() * 430, 40 + r() * 210, 6, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = "#ffffff"; x.beginPath(); x.arc(300, 150, 4, 0, Math.PI * 2); x.fill();
  const g = x.createLinearGradient(0, 0, 0, 288); g.addColorStop(0, "rgba(0,0,0,0.25)"); g.addColorStop(0.5, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.3)"); x.fillStyle = g; x.fillRect(0, 0, 512, 288);
  const t = texFrom(c); t.wrapS = THREE.RepeatWrapping; return t;
}
// Back wall with TVs showing a match (betting shop / living room). Backdrop.
// API { group, set(k), update(t) } — set(k): 1 = all TVs on, 0 = all off (they go out right to left).
function makeTvWall({ z = -4.2, n = 4, wall = "#2a1d17", neon = true, y = 2.3, size = 2.0 } = {}) {
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), pmat("#ffffff", { map: tileTex(plasterTex(wall), 8, 3), roughness: 0.9 })); w.position.set(0, 4.5, z); g.add(w);
  const base = matchTex(), screens = [];
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * size * 1.18;
    const bez = new THREE.Mesh(rbox(size, size * 0.59, 0.08, 0.02), pmat("#0d0d0f", { roughness: 0.3, metalness: 0.4 })); bez.position.set(x, y, z + 0.06); g.add(bez);
    const t2 = base.clone(); t2.needsUpdate = true; t2.repeat.set(0.6, 1);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.95, size * 0.535), new THREE.MeshBasicMaterial({ map: t2, toneMapped: false })); sc.position.set(x, y, z + 0.105); g.add(sc);
    screens.push({ sc, t2, ph: i * 0.37 });
  }
  let strip = null;
  if (neon) { strip = new THREE.Mesh(new THREE.BoxGeometry(n * size * 1.3, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false })); strip.position.set(0, y + size * 0.45, z + 0.08); g.add(strip); }
  const bk = makeBokeh({ n: 30, center: [0, 2.2, z + 1.2], spread: [14, 3, 1], size: [0.2, 0.7], opacity: 0.35, seed: 61 }); g.add(bk.group);
  asBackdrop(g);
  let lv = 1;
  return {
    group: g, set: (k) => { lv = clamp(k); },
    update: (t) => {
      bk.update(t);
      screens.forEach((s, i) => { const on = clamp(lv * n - (n - 1 - i)); s.sc.material.color.setScalar(0.04 + 0.96 * on); s.t2.offset.x = 0.2 + 0.2 * Math.sin(t * 0.3 + s.ph); });
      if (strip) strip.material.color.set(ORANGE).multiplyScalar(0.3 + 0.7 * lv);
    },
  };
}
// Dims the lit windows of a makeSkyline backdrop (k = 1 lit, 0 dark).
function dimSkyline(sky, k) { sky.group.traverse((n) => { if (n.isMesh && Array.isArray(n.material) && n.material[4]) n.material[4].color.setScalar(0.15 + 0.85 * k); }); }
// Multiplies the opacity of a bokeh group's lights by k (call after its update).
function fadeBokeh(b, k) { b.group.children.forEach((s) => { if (s.material) s.material.opacity *= k; }); }
// Black marble plinth with a printed name on the front. Origin floor centre.
function makeNamedPlinth(label, { w = 1.0, h = 0.36, d = 0.8, plateH = null } = {}) {
  const g = new THREE.Group(), tex = tileTex(noiseTex({ base: "#2a2a2e", amount: 0.12, size: 2, seed: 61 }), 2, 1);
  const m = new THREE.Mesh(rbox(w, h, d, 0.03), pmat("#1b1a1d", { map: tex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 })); m.position.y = h / 2; g.add(m);
  if (label) { const ph = Math.min(h * 0.8, plateH || h * 0.62); const p = makePlate(label, w * 0.94, ph, { bg: "#141414", fg: "#f4f1ea" }); p.position.set(0, Math.max(h / 2, ph / 2 + 0.04), d / 2 + 0.016); g.add(p); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
// Big red X (two crossed bevelled bars) facing +z. Origin centre.
function makeRedX(s = 1) {
  const g = new THREE.Group(), m = pmat(RED, { roughness: 0.32, clearcoat: 0.7, emissive: "#4a0805" });
  [Math.PI / 4, -Math.PI / 4].forEach((a, i) => { const b = new THREE.Mesh(rbox(s, s * 0.17, s * 0.08, s * 0.03), m); b.rotation.z = a; b.position.z = i * 0.004 * s; g.add(b); });
  return g;
}
// Phone leaning back on a desk stand (base, lip, back plate). Returns { phone, stand, group }.
// scale: phone size (1 = the kit phone, 1.64 tall); `at` = floor point of the stand; lean in radians.
function makePhoneOnStand(S, { scale = 0.2, at = new V3(0, 0, 0), lean = 0.28 } = {}) {
  const phone = makePhone(); phone.group.scale.setScalar(scale); phone.body.material = pmat("#0f1013", { metalness: 0.6, roughness: 0.25, clearcoat: 1 });
  const h = 1.64 * scale, th = 0.09 * scale / 2, up = new V3(0, Math.cos(lean), -Math.sin(lean)), nrm = new V3(0, Math.sin(lean), Math.cos(lean));
  const baseT = 0.06 * h, lipH = 0.09 * h;
  const bottom = at.clone().add(new V3(0, baseT, 0));
  phone.group.position.copy(bottom).addScaledVector(up, h / 2).addScaledVector(nrm, th * 0.0); phone.group.position.y += th * Math.sin(lean);
  phone.group.rotation.x = -lean;
  const g = new THREE.Group(), sm2 = pmat("#26272b", { metalness: 0.7, roughness: 0.35 });
  const base = new THREE.Mesh(rbox(h * 0.55, baseT, h * 0.5, baseT * 0.3), sm2); base.position.copy(at).add(new V3(0, baseT / 2, -h * 0.12)); g.add(base);
  const lip = new THREE.Mesh(rbox(h * 0.55, lipH, baseT * 0.6, baseT * 0.25), sm2); lip.position.copy(bottom).addScaledVector(nrm, th + baseT * 0.3); lip.position.y = at.y + baseT + lipH / 2; lip.rotation.x = -lean; g.add(lip);
  const back = new THREE.Mesh(rbox(h * 0.42, h * 0.55, baseT * 0.5, baseT * 0.2), sm2); back.position.copy(bottom).addScaledVector(up, h * 0.3).addScaledVector(nrm, -th - baseT * 0.25); back.rotation.x = -lean; g.add(back);
  g.add(contactShadow(h * 1.2, h)); g.children[g.children.length - 1].position.copy(at).setY(at.y + 0.004);
  S.add(phone.group, g);
  return { phone, stand: g };
}

// ---------------------------------------------------------------- phone screens (720x1500 canvas)
const APP_GREEN = "#1f9d55";
function paintPhoneBg(x) { const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#151821"); g.addColorStop(1, "#0a0b10"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500); x.fillStyle = "#9aa1ad"; x.font = "700 40px Inter"; x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillText("20:45", 50, 80); }
// Generic betting-app icon: green rounded square with a white ball.
function betIcon(x, cx, cy, s, grey = 0) {
  x.fillStyle = grey ? "#3a3d44" : APP_GREEN; roundRect(x, cx - s / 2, cy - s / 2, s, s, s * 0.24); x.fill();
  x.fillStyle = grey ? "#6b6f78" : "#ffffff"; x.beginPath(); x.arc(cx, cy, s * 0.27, 0, Math.PI * 2); x.fill();
  x.fillStyle = grey ? "#3a3d44" : "#14171c"; for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; x.beginPath(); x.arc(cx + Math.cos(a) * s * 0.17, cy + Math.sin(a) * s * 0.17, s * 0.055, 0, Math.PI * 2); x.fill(); }
  x.beginPath(); x.arc(cx, cy, s * 0.07, 0, Math.PI * 2); x.fill();
}
const OTHER_ICONS = ["#3b6fd8", "#e0a12b", "#8a4fd6", "#d84a6b", "#2fb3c4", "#6b7380", "#e46b2b", "#4aa35a"];
// Home screen: a grid of 4 x 4 apps, three of them betting apps (index 5, 6, 10).
// o: { tap: 0..1 ripple on app 5, dead: true = betting apps grey with a red ban sign }
function paintHome(x, o = {}) {
  paintPhoneBg(x);
  for (let i = 0; i < 16; i++) {
    const cx = 120 + (i % 4) * 160, cy = 330 + Math.floor(i / 4) * 200, bet = i === 5 || i === 6 || i === 10;
    if (bet) betIcon(x, cx, cy, 124, o.dead ? 1 : 0);
    else { x.fillStyle = OTHER_ICONS[i % OTHER_ICONS.length]; roundRect(x, cx - 62, cy - 62, 124, 124, 30); x.fill(); x.fillStyle = "rgba(255,255,255,0.85)"; roundRect(x, cx - 26, cy - 26, 52, 52, 12); x.fill(); }
    if (bet && o.dead) { x.strokeStyle = "#ff3b2f"; x.lineWidth = 12; x.beginPath(); x.arc(cx, cy, 52, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(cx - 36, cy - 36); x.lineTo(cx + 36, cy + 36); x.stroke(); }
  }
  if (o.tap > 0 && o.tap < 1) { x.strokeStyle = `rgba(255,255,255,${1 - o.tap})`; x.lineWidth = 8; x.beginPath(); x.arc(280, 530, 40 + 90 * o.tap, 0, Math.PI * 2); x.stroke(); }
}
// The betting app (generic): header, a live match card and odds buttons; spin > 0 draws a loader.
function paintBetApp(x, o = {}) {
  paintPhoneBg(x);
  x.fillStyle = "#0f3b24"; x.fillRect(0, 110, 720, 150); betIcon(x, 110, 185, 96);
  x.fillStyle = "#e9f7ee"; x.font = "900 54px Inter"; x.textAlign = "left"; x.fillText("APOSTAS", 190, 205);
  x.fillStyle = "#ff3b2f"; roundRect(x, 50, 320, 190, 64, 32); x.fill(); x.fillStyle = "#fff"; x.font = "900 36px Inter"; x.fillText("AO VIVO", 78, 365);
  x.fillStyle = "rgba(255,255,255,0.06)"; roundRect(x, 40, 420, 640, 330, 30); x.fill();
  [["#d0302a", 200], ["#e8e8e8", 520]].forEach(([c, cx]) => { x.fillStyle = c; x.beginPath(); x.arc(cx, 530, 62, 0, Math.PI * 2); x.fill(); });
  x.fillStyle = "#fff"; x.font = "900 84px Inter"; x.textAlign = "center"; x.fillText("1 × 0", 360, 560);
  ["1.85", "3.40", "4.20"].forEach((v, i) => { x.fillStyle = APP_GREEN; roundRect(x, 60 + i * 210, 650, 180, 80, 20); x.fill(); x.fillStyle = "#fff"; x.font = "900 44px Inter"; x.fillText(v, 150 + i * 210, 705); });
  for (let i = 0; i < 3; i++) { x.fillStyle = "rgba(255,255,255,0.05)"; roundRect(x, 40, 800 + i * 170, 640, 140, 24); x.fill(); }
  if (o.spin > 0) {
    x.fillStyle = "rgba(8,9,12,0.82)"; x.fillRect(0, 0, 720, 1500);
    x.strokeStyle = "#e9f7ee"; x.lineWidth = 16; x.lineCap = "round"; x.beginPath(); x.arc(360, 750, 80, o.spin * 7, o.spin * 7 + 4.2); x.stroke(); x.lineCap = "butt";
  }
}
// Error page: grey, a broken-link icon and "Página indisponível".
function paintUnavailable(x) {
  x.fillStyle = "#e9e9ec"; x.fillRect(0, 0, 720, 1500); x.fillStyle = "#6b6f78"; x.font = "700 40px Inter"; x.textAlign = "left"; x.fillText("20:46", 50, 80);
  x.strokeStyle = "#8a8f99"; x.lineWidth = 22; x.lineCap = "round";
  x.beginPath(); x.arc(300, 560, 70, 0.6, 5.2); x.stroke(); x.beginPath(); x.arc(420, 560, 70, 3.75, 2.05 + Math.PI * 2); x.stroke();
  x.strokeStyle = "#e0261b"; x.beginPath(); x.moveTo(330, 420); x.lineTo(390, 700); x.stroke(); x.lineCap = "butt";
  x.fillStyle = "#24262b"; x.font = "900 66px Inter"; x.textAlign = "center"; x.fillText("Página", 360, 860); x.fillText("indisponível", 360, 940);
  x.fillStyle = "#6b6f78"; x.font = "700 38px Inter"; x.fillText("Este site saiu do ar.", 360, 1030);
}

// ============================================================ 1 · gancho (0–4.30)
// "O mesmo governo que regulamentou as bets mandou fechar todas elas." A betting licence with the
// green AUTORIZADA mark lies on the counter; a red stamp slams PROIBIDA across it and the TVs of the
// betting shop behind go dark one by one.
const HIT1 = 2.72;
// The licence: title, gold seal, the green AUTORIZADA mark, and the PROIBIDA mark (hidden until stamped).
function licenceWithMarks() {
  const cert = makeCertificate("LICENÇA", { w: 1.5, d: 1.95 });
  const ok = makeInkMark("AUTORIZADA", 1.18, 0.36, { ink: "#1f8a4c", seed: 3 }); ok.rotation.order = "YXZ"; ok.rotation.set(-Math.PI / 2, 0.06, 0); ok.position.set(-0.04, cert.top + 0.002, -0.3); cert.group.add(ok);
  const no = makeInkMark("PROIBIDA", 1.2, 0.4, { seed: 11 }); no.rotation.order = "YXZ"; no.rotation.set(-Math.PI / 2, -0.14, 0); no.position.set(0.0, cert.top + 0.004, 0.07); cert.group.add(no);
  return { cert, ok, no };
}
addScene("gancho", 0, 4.3, (S) => {
  const shop = makeTvWall(); S.backdrop(shop.group);
  makeDesk(S);
  const { cert, no } = licenceWithMarks(); cert.group.position.set(0, DESK_TOP, 0); S.add(cert.group);
  const stamp = makeStamp({ w: 1.1, d: 0.38, ink: "#6e1410" }); stamp.rotation.y = -0.16; S.add(stamp);
  const anim = (t) => {
    shop.set(1 - sm(t, HIT1, HIT1 + 0.7)); shop.update(t);
    const down = eIn(lin(t, HIT1 - 0.4, HIT1)), out = eOut(lin(t, HIT1 + 0.15, HIT1 + 0.75));
    stamp.visible = t > HIT1 - 0.42 && t < HIT1 + 0.75;
    stamp.position.set(2.2 * out, DESK_TOP + cert.top + 0.004 + 0.7 * (1 - down) + 0.5 * out, 0.0);
    no.visible = t >= HIT1; no.scale.setScalar(t >= HIT1 ? 1 + 0.1 * (1 - sm(t, HIT1, HIT1 + 0.14)) : 1);
  };
  S.hero(cert.group, "licença");
  S.hero(stamp, "carimbo", { when: (t) => t > HIT1 - 0.12 && t < HIT1 + 0.18 });
  const box = envelope([cert.group], anim, 0, 4.3);
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.move(box, "push", lin(t, 0, 4.3), { zone: "stage", from: [0.03, 0.74, 1], pull0: 1.18 }), t, HIT1, 0.6, 0.4)); };
});

// ============================================================ 2 · o app que não abre (4.30–10.05)
// "Imagina: seis de outubro. Você abre o app de apostas... e ele não abre. Nenhum abre."
addScene("app", 4.3, 10.05, (S) => {
  const room = makeTvWall({ z: -3.2, n: 1, wall: "#1d1814", neon: false, y: 1.45, size: 2.2 }); S.backdrop(room.group);
  const tableTop = 0.45;
  const table = new THREE.Mesh(rbox(2.6, 0.06, 1.4, 0.02), pmat("#ffffff", { map: woodTex({ base: "#4a2c1a", seed: 9 }), roughness: 0.35, clearcoat: 0.6 })); table.position.y = tableTop - 0.03; S.add(table);
  for (const [x, z] of [[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, tableTop - 0.06, 12), pmat("#2a1810")); l.position.set(x, (tableTop - 0.06) / 2, z); S.add(l); }
  const { phone, stand } = makePhoneOnStand(S, { scale: 0.2, at: new V3(0, tableTop, 0.1), lean: 0.3 });
  let painted = "";
  const paint = (t) => {
    const mode = t < 6.55 ? "home" : t < 7.05 ? "tap" : t < 8.3 ? "load" : t < 9.15 ? "err" : "dead";
    const key = mode + (mode === "tap" ? Math.round(lin(t, 6.55, 7.05) * 8) : mode === "load" ? Math.round(t * 12) : "");
    if (key === painted) return; painted = key;
    if (mode === "home") paintHome(phone.ctx);
    else if (mode === "tap") paintHome(phone.ctx, { tap: lin(t, 6.55, 7.05) });
    else if (mode === "load") paintBetApp(phone.ctx, { spin: t });
    else if (mode === "err") paintUnavailable(phone.ctx);
    else paintHome(phone.ctx, { dead: true });
    phone.tex.needsUpdate = true;
  };
  const anim = (t) => {
    key.intensity = 1.8; hemi.intensity = 0.35;
    // the match on the TV behind keeps playing; it cuts out when the app fails ("e ele não abre")
    room.set(1 - 0.85 * sm(t, 8.3, 8.8)); room.update(t);
    paint(t);
  };
  S.hero(phone.group, "celular");
  const box = envelope([phone.group, stand], anim, 4.3, 10.05);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, 4.3, 10.05), { zone: "stage", from: [0, 0.22, 1], deg: 34, pull: 1.04 })); };
});

// ============================================================ 3 · 188 sites, só um no ar (10.05–14.30)
// A video wall of 188 phone screens (each a legal betting site). They go dark in a wave that spreads
// from the one that stays on; the camera opens from that one to the whole wall.
const WALL = { cols: 14, rows: 14, tw: 0.2, th: 0.34, sx: 0.23, sy: 0.37, y0: 0.45, keep: [6, 7] };
function miniAppTex() {
  const c = makeCanvas(160, 272), x = c.getContext("2d");
  x.fillStyle = "#12151c"; x.fillRect(0, 0, 160, 272); x.fillStyle = "#0f3b24"; x.fillRect(0, 0, 160, 46);
  x.fillStyle = APP_GREEN; x.beginPath(); x.arc(26, 23, 12, 0, 7); x.fill();
  x.fillStyle = "rgba(255,255,255,0.1)"; roundRect(x, 10, 60, 140, 70, 10); x.fill();
  x.fillStyle = "#d0302a"; x.beginPath(); x.arc(44, 95, 14, 0, 7); x.fill(); x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(116, 95, 14, 0, 7); x.fill();
  for (let i = 0; i < 3; i++) { x.fillStyle = APP_GREEN; roundRect(x, 12 + i * 48, 144, 40, 22, 6); x.fill(); }
  for (let i = 0; i < 3; i++) { x.fillStyle = "rgba(255,255,255,0.07)"; roundRect(x, 10, 180 + i * 30, 140, 22, 6); x.fill(); }
  return texFrom(c);
}
addScene("sites", 10.05, 14.3, (S) => {
  const sky = makeSkyline({ z: -12, seed: 23 }); S.backdrop(sky.group);
  const { cols, rows, tw, th, sx, sy, y0, keep } = WALL;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const corner = (r < 1 || r > rows - 2) && (c < 2 || c > cols - 3) && !((r === 0 || r === rows - 1) && (c === 2 || c === cols - 3));
    if (!corner) cells.push([r, c]);
  }
  // 14 x 14 = 196 minus 8 corner slots = 188
  const wallW = cols * sx, wallH = rows * sy, x0 = -wallW / 2 + sx / 2;
  const pos = ([r, c]) => new V3(x0 + c * sx, y0 + sy / 2 + r * sy, 0);
  const frame = new THREE.Mesh(rbox(wallW + 0.16, wallH + 0.16, 0.1, 0.03), pmat("#141519", { metalness: 0.5, roughness: 0.4 })); frame.position.set(0, y0 + wallH / 2, -0.06); S.add(frame);
  for (const x of [-wallW / 2 + 0.3, wallW / 2 - 0.3]) { const f = new THREE.Mesh(rbox(0.12, y0 + 0.1, 0.5, 0.02), pmat("#141519", { metalness: 0.5, roughness: 0.4 })); f.position.set(x, (y0 + 0.1) / 2, -0.06); S.add(f); }
  const others = cells.filter(([r, c]) => !(r === keep[0] && c === keep[1]));
  const bez = new THREE.InstancedMesh(rbox(tw + 0.016, th + 0.016, 0.025, 0.008), pmat("#0b0c0f", { roughness: 0.3, metalness: 0.4 }), others.length);
  const scr = new THREE.InstancedMesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshBasicMaterial({ map: miniAppTex(), toneMapped: false }), others.length);
  const d = new THREE.Object3D(), kp = pos(keep), rnd = mulberry32(8), offAt = [];
  others.forEach((cell, i) => {
    const p = pos(cell); d.position.copy(p); d.updateMatrix(); bez.setMatrixAt(i, d.matrix);
    d.position.z = 0.0135; d.updateMatrix(); scr.setMatrixAt(i, d.matrix); scr.setColorAt(i, new THREE.Color(1, 1, 1));
    offAt.push(10.45 + 1.9 * Math.min(1, p.distanceTo(kp) / 2.4) + rnd() * 0.25);
  });
  const wall = new THREE.Group(); wall.add(bez, scr); S.add(wall);
  // the one that stays on: its own phone tile, with a warm halo once it is the last one
  const lone = new THREE.Group(); lone.position.copy(kp); S.add(lone);
  lone.add(new THREE.Mesh(rbox(tw + 0.03, th + 0.03, 0.025, 0.01), pmat(ORANGE, { roughness: 0.3, metalness: 0.2, emissive: "#7a2a08" })));
  const ls = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshBasicMaterial({ map: miniAppTex(), toneMapped: false })); ls.position.z = 0.0135; lone.add(ls);
  const halo = sprite(BOKEH, 0.95); halo.material.color.set("#ffb35c"); halo.material.blending = THREE.AdditiveBlending; halo.userData.decor = true; halo.position.set(kp.x, kp.y, 0.05); S.add(halo);
  const col = new THREE.Color();
  const anim = (t) => {
    sky.update(t);
    let off = 0;
    offAt.forEach((ta, i) => { const k = t < ta ? 1 : t < ta + 0.08 ? 0.45 : 0.13; if (t >= ta) off++; scr.setColorAt(i, col.setScalar(k)); });
    scr.instanceColor.needsUpdate = true;
    dimSkyline(sky, 1 - 0.85 * off / offAt.length);
    halo.material.opacity = 0.9 * sm(t, 12.6, 13.1) * (0.85 + 0.15 * Math.sin(t * 6));
    // "só um ficou no ar": the last lit one steps out of the wall
    const out = eOut(lin(t, 12.75, 13.15)); lone.position.set(kp.x, kp.y, 0.12 * out); lone.scale.setScalar(1 + 0.3 * out);
  };
  S.hero(lone, "site no ar");
  S.hero(wall, "parede de sites", { when: (t) => t > 12.55 });
  const P0 = CAM.pose(lone, { zone: "stage", from: [0.1, 0.06, 1], pull: 1.06 });
  const P1 = CAM.pose(envelope([wall, frame], anim, 12, 14.3), { zone: "stage", from: [-0.08, 0.1, 1] });
  const P2 = CAM.pose(envelope([wall, frame], anim, 12, 14.3), { zone: "stage", from: [-0.16, 0.14, 1], pull: 1.04 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[10.05, P0], [11.9, CAM.blend(P0, P1, 0.05), 1.8], [12.65, P1, 0.75], [14.3, P2, 1.65]])); };
});

// ============================================================ 4 · volta pra 2018 (14.30–16.10)
addScene("volta", 14.3, 16.1, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.6, -8], spread: [20, 8, 3], seed: 31 }); S.backdrop(bk.group);
  makeDesk(S);
  const cal = makeFlipCalendar(["2026", "2024", "2022", "2020", "2018"], { w: 1.05, h: 0.92 }); cal.group.position.set(0, DESK_TOP, 0); S.add(cal.group);
  const anim = (t) => {
    bk.update(t + beat(t, 15.0, 0.6) * 2);
    // pages fly back through the years, faster and faster, and stop on 2018 (red)
    const at = [14.45, 14.78, 15.05, 15.28];
    let i = 0; while (i < at.length && t > at[i] + 0.22) i++;
    cal.show(i, i < at.length ? sm(t, at[i], at[i] + 0.22) : 0);
  };
  S.hero(cal.group, "calendário");
  const box = envelope([cal.group], anim, 14.3, 16.1);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, 14.3, 16.1), { zone: "stage", from: [0.18, 0.25, 1], rise: 0.45, pull: 1.05 })); };
});

// ============================================================ 5 · Temer (16.10–18.95)
// Photo card (overlay) on the stage; behind it, Brasília at night drifting (no hero).
addScene("temer", 16.1, 18.95, (S) => {
  const sky = makeSkyline({ z: -9, seed: 41 }); S.backdrop(sky.group);
  const bk = makeBokeh({ n: 40, center: [0, 3, -6], spread: [16, 6, 3], seed: 42 }); S.backdrop(bk.group);
  const A = CAM.at([0, 1.2, 6], [0, 2.6, -9], { zone: "stage" }), B = CAM.at([-0.6, 2.6, 5.4], [0.3, 3.6, -9], { zone: "stage" });
  return (t) => { sky.update(t); bk.update(t); dimSkyline(sky, 0.45); CAM.apply(CAM.blend(A, B, sm(t, 16.1, 18.95))); };
});

// ============================================================ 6 · o prazo venceu (18.95–23.10)
// "...com quatro anos pra criar as regras. Venceu o prazo... e nada." The 2018 law book; the calendar
// runs 2019→2022 while the hourglass drains; a stamp prints PRAZO VENCIDO on the cover.
const HIT6 = 21.95;
function lawBook2018() {
  const b = makeLawBook({ w: 1.42, d: 1.6, t: 0.26, color: "#1f3d2e", title: "LEI 13.756", emblem: false });
  b.print("2018", 0.8, 0.3, 0.42);
  const mark = makeInkMark("PRAZO\nVENCIDO", 1.3, 0.68, { seed: 21 }); mark.rotation.order = "YXZ"; mark.rotation.set(-Math.PI / 2, 0.1, 0); mark.position.set(0.02, b.top + 0.02, -0.02); b.group.add(mark);
  return { ...b, mark };
}
addScene("prazo", 18.95, 23.1, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.6, -8], spread: [20, 8, 3], seed: 33 }); S.backdrop(bk.group);
  makeDesk(S);
  const book = lawBook2018(); book.group.position.set(0, DESK_TOP, 0.1); S.add(book.group);
  const cal = makeFlipCalendar(["2019", "2020", "2021", "2022"], { w: 0.9, h: 0.8 }); cal.group.position.set(0.95, DESK_TOP, -1.18); cal.group.rotation.y = -0.3; S.add(cal.group);
  const hg = makeHourglass({ h: 0.85 }); hg.group.position.set(-0.98, DESK_TOP, -0.95); S.add(hg.group);
  const stamp = makeStamp({ w: 1.26, d: 0.64, ink: "#6e1410" }); stamp.rotation.y = 0.1; S.add(stamp);
  const anim = (t) => {
    bk.update(t);
    const at = [19.75, 20.35, 20.95];
    let i = 0; while (i < at.length && t > at[i] + 0.25) i++;
    cal.show(i, i < at.length ? sm(t, at[i], at[i] + 0.25) : 0);
    hg.set(lin(t, 19.2, 21.6));
    const down = eIn(lin(t, HIT6 - 0.35, HIT6)), out = eOut(lin(t, HIT6 + 0.15, HIT6 + 0.7));
    stamp.visible = t > HIT6 - 0.37 && t < HIT6 + 0.7;
    stamp.position.set(0.02 - 2.0 * out, DESK_TOP + book.top + 0.02 + 0.6 * (1 - down) + 0.4 * out, 0.08);
    book.mark.visible = t >= HIT6;
    // "...e nada": the dust settles, the room light dips
    key.intensity = 2.4 - 0.5 * sm(t, 22.3, 22.9);
  };
  S.hero(book.group, "livro da lei 2018"); S.hero(cal.group, "calendário"); S.hero(hg.group, "ampulheta");
  S.hero(stamp, "carimbo", { when: (t) => t > HIT6 - 0.1 && t < HIT6 + 0.16 });
  const box = envelope([book.group, cal.group, hg.group], anim, 18.95, 23.1);
  return (t) => { anim(t); CAM.apply(CAM.shake(CAM.move(box, "truck", lin(t, 18.95, 23.1), { zone: "stage", from: [0, 0.95, 1], side: 0.4 }), t, HIT6, 0.5, 0.35)); };
});

// ============================================================ 7 · 2025: as regras valem (23.10–27.55)
// Shot A (to 24.80): the 2023 law lands beside the 2018 one. Shot B (to 26.15): Lula's card (backdrop
// only). Shot C: a green stamp prints AUTORIZADA on the new law.
const HIT7 = 26.8;
addScene("regras", 23.1, 27.55, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.8, -8], spread: [20, 8, 3], seed: 35 }); S.backdrop(bk.group);
  const desk = makeDesk(S);
  const old = lawBook2018(); old.group.position.set(-1.02, DESK_TOP, 0.05); old.group.rotation.y = 0.12; old.mark.visible = true; S.add(old.group);
  const nb = makeLawBook({ w: 1.42, d: 1.6, t: 0.26, color: "#1c2b4a", title: "LEI 14.790", emblem: false }); nb.print("2023", 0.8, 0.3, 0.42); S.add(nb.group);
  const okm = makeInkMark("AUTORIZADA", 1.0, 0.3, { ink: "#1f9a52", seed: 5 }); okm.rotation.order = "YXZ"; okm.rotation.set(-Math.PI / 2, -0.08, 0); okm.position.set(0.02, nb.top + 0.02, -0.02); nb.group.add(okm);
  const stamp = makeStamp({ w: 1.0, d: 0.3, ink: "#155c33" }); stamp.rotation.y = -0.08; S.add(stamp);
  const NB = new V3(0.95, DESK_TOP, 0.1);
  const anim = (t) => {
    bk.update(t);
    const k = eOut(lin(t, 23.35, 23.8)), bounce = Math.sin(Math.PI * lin(t, 23.8, 24.05)) * 0.03;
    nb.group.position.copy(NB).add(new V3(0.15 * (1 - k), 0.7 * (1 - k) + bounce, 0)); nb.group.rotation.set(0, -0.08 + 0.4 * (1 - k), 0.12 * (1 - k));
    nb.group.visible = t > 23.3;
    const card = t >= 24.8 && t < 26.15; desk.visible = old.group.visible = !card; nb.group.visible = nb.group.visible && !card;
    const down = eIn(lin(t, HIT7 - 0.35, HIT7)), out = eOut(lin(t, HIT7 + 0.15, HIT7 + 0.7));
    stamp.visible = t > HIT7 - 0.37 && t < HIT7 + 0.7;
    stamp.position.set(NB.x + 0.02 + 2.0 * out, DESK_TOP + nb.top + 0.02 + 0.6 * (1 - down) + 0.4 * out, NB.z);
    okm.visible = t >= HIT7;
  };
  S.hero(old.group, "lei de 2018", { when: (t) => t < 24.8 });
  S.hero(nb.group, "lei de 2023", { when: (t) => (t > 23.35 && t < 24.8) || t >= 26.15 });
  const A0 = CAM.pose(envelope([old.group, nb.group], anim, 23.9, 24.8), { zone: "stage", from: [0.1, 1.15, 1], pull: 1.0 });
  const A1 = CAM.pose(envelope([old.group, nb.group], anim, 23.9, 24.8), { zone: "stage", from: [0.04, 1.2, 1] });
  const B0 = CAM.at([0, 1.6, 5], [0, 2.6, -8], { zone: "stage" }), B1 = CAM.at([0.8, 1.9, 4.6], [0.2, 2.9, -8], { zone: "stage" });
  const boxC = envelope([nb.group], anim, 26.15, 27.55);   // the stamp lands on the new law: frame it alone
  return (t) => {
    anim(t);
    let p;
    if (t < 24.8) p = CAM.blend(A0, A1, sm(t, 23.1, 24.8));
    else if (t < 26.15) p = CAM.blend(B0, B1, sm(t, 24.8, 26.15));
    else p = CAM.shake(CAM.move(boxC, "crane", lin(t, 26.15, 27.55), { zone: "stage", from: [-0.12, 1.1, 1], rise: 0.2 }), t, HIT7, 0.45, 0.3);
    CAM.apply(p);
  };
});

// ============================================================ 8 · 25 milhões apostaram, R$ 37 bi (27.55–35.60)
// Shot A: a crowd seen from above; their phones light up one by one (the whole field of people behind
// lights up too). Shot B (31.45): a betting-house counter where the cash pile keeps growing.
// Crowd block: instanced people (body, head, forearm) each holding a phone with a screen. Origin floor centre.
function makeBettorBlock({ rows = 7, cols = 8, sx = 0.62, sz = 0.66, seed = 4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), items = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) items.push({ x: (j - (cols - 1) / 2) * sx + (i % 2) * sx * 0.4 + (r() - 0.5) * 0.12, z: (i - (rows - 1) / 2) * sz + (r() - 0.5) * 0.12, yaw: Math.PI + (r() - 0.5) * 0.5, h: 0.94 + r() * 0.12, c: ["#3d4a66", "#6b4a3a", "#8a5a42", "#4a6a8a", "#8a7a66", "#7a3030", "#3f6a50", "#c9b8a6"][Math.floor(r() * 8)], on: 0 });
  const n = items.length;
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.72, 6, 14), pmat("#ffffff", { roughness: 0.85, map: fabricTex("#9a9a9a") }), n);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.115, 18, 12), pmat("#c8977a", { roughness: 0.6 }), n);
  const hair = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 18, 10, 0, Math.PI * 2, 0, 1.2), pmat("#2a1d16", { roughness: 0.8 }), n);
  const arm = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.045, 0.28, 4, 8), pmat("#ffffff", { roughness: 0.85 }), n);
  const ph = new THREE.InstancedMesh(rbox(0.12, 0.23, 0.014, 0.008), pmat("#111216", { roughness: 0.3, metalness: 0.5 }), n);
  const scr = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.108, 0.215), new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }), n);
  const d = new THREE.Object3D(), q = new THREE.Quaternion(), col = new THREE.Color(), glows = [];
  // a phone held up: turned to face its owner (yaw + PI) and tilted back 0.5 rad, screen to the eyes
  const HOLD = new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), 0.5).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), Math.PI));
  items.forEach((it, i) => {
    const Y = new THREE.Matrix4().makeRotationY(it.yaw), at = (x, y, z) => new V3(x, y, z).applyMatrix4(Y).add(new V3(it.x, 0, it.z));
    d.position.set(it.x, 0.53 * it.h, it.z); d.rotation.set(0, it.yaw, 0); d.scale.set(1, it.h, 1); d.updateMatrix(); body.setMatrixAt(i, d.matrix); body.setColorAt(i, col.set(it.c));
    d.scale.set(1, 1, 1); d.position.copy(at(0, 1.2 * it.h, 0.02)); d.rotation.set(-0.35, it.yaw, 0); d.updateMatrix(); head.setMatrixAt(i, d.matrix); hair.setMatrixAt(i, d.matrix);
    // forearm from the side of the chest to the phone held in front of the face, tilted to the eyes
    const a = at(0.12, 0.88 * it.h, 0.1), b = at(0.04, 0.97 * it.h, 0.36), mid = a.clone().add(b).multiplyScalar(0.5);
    q.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize()); d.position.copy(mid); d.quaternion.copy(q); d.updateMatrix(); arm.setMatrixAt(i, d.matrix); arm.setColorAt(i, col.set(it.c));
    d.position.copy(at(0.0, 0.99 * it.h, 0.42)); d.quaternion.setFromAxisAngle(new V3(0, 1, 0), it.yaw).multiply(HOLD); d.updateMatrix(); ph.setMatrixAt(i, d.matrix);
    d.translateZ(0.0085); d.updateMatrix(); scr.setMatrixAt(i, d.matrix); scr.setColorAt(i, col.setScalar(0.04));
    // the screen's glow on the face and hands (a soft additive halo, off until the phone lights up)
    const glow = sprite(BOKEH, 0.55); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = 0; glow.userData.decor = true;
    glow.position.copy(d.position); glows.push(glow); g.add(glow);
  });
  g.add(body, head, hair, arm, ph, scr);
  const order = items.map((_, i) => i).sort(() => r() - 0.5);
  const SCR = [new THREE.Color("#9fe3ff"), new THREE.Color("#b8ffd0"), new THREE.Color("#ffe6b8")];
  return {
    group: g,
    light(k) { const m = Math.round(clamp(k) * n); order.forEach((idx, j) => { const on = j < m; scr.setColorAt(idx, on ? SCR[idx % 3] : col.setScalar(0.04)); glows[idx].material.color.copy(SCR[idx % 3]); glows[idx].material.opacity = on ? 0.55 : 0; }); scr.instanceColor.needsUpdate = true; },
  };
}
addScene("apostadores", 27.55, 35.6, (S) => {
  // A — the crowd
  const field = makeCrowdField({ rows: 40, cols: 46, z0: 4, seed: 15, skip: (x, z) => Math.abs(x) < 3.0 && Math.abs(z) < 2.8, colors: ["#1b1d24", "#2a221d", "#33261f", "#1f2733", "#2e2a26", "#2b1717"] }); S.backdrop(field.group);
  const glows = makeBokeh({ n: 260, center: [0, 1.25, -12], spread: [36, 0.3, 20], size: [0.3, 0.6], colors: ["#9fe3ff", "#b8ffd0", "#ffe6b8"], opacity: 1, drift: 0.02, seed: 17 }); S.backdrop(glows.group);
  const crowd = makeBettorBlock(); S.add(crowd.group);
  // B — the betting house counter and the cash pile behind it
  const B = new THREE.Group(); S.add(B); B.position.set(0, 0, -30);
  const room = makeTvWall({ z: -3.4, n: 0, wall: "#1f1612", neon: false }); room.group.position.z = -30; S.backdrop(room.group);
  const wood = pmat("#ffffff", { map: woodTex({ base: "#3a2214", seed: 12 }), roughness: 0.4, clearcoat: 0.6 }), brass = pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 });
  const counter = new THREE.Group(); B.add(counter);
  const cb = new THREE.Mesh(rbox(2.8, 1.0, 0.86, 0.03), wood); cb.position.set(0, 0.5, 0.6); counter.add(cb);
  const ctop = new THREE.Mesh(rbox(2.9, 0.05, 0.94, 0.02), pmat("#141414", { roughness: 0.15, clearcoat: 1 })); ctop.position.set(0, 1.025, 0.6); counter.add(ctop);
  const trim = new THREE.Mesh(rbox(2.92, 0.03, 0.03, 0.01), brass); trim.position.set(0, 1.0, 1.075); counter.add(trim);
  const sign = makePlate("CASA DE APOSTAS", 2.0, 0.28, { bg: "#141414", fg: "#d9b66a" }); sign.position.set(0, 0.62, 1.046); counter.add(sign);
  const pile = new THREE.Group(); pile.position.set(0, 1.05, 0.6); B.add(pile);
  const bundles = [];
  const LAYERS = [[6, 4], [6, 3], [5, 3], [5, 3], [4, 3], [4, 2], [3, 2], [3, 2], [2, 1], [2, 1], [1, 1]];
  LAYERS.forEach(([nx, nz], L) => { for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const b = makeCashBundle({ w: 0.42, d: 0.19, h: 0.085 }); b.userData.rest = new V3((i - (nx - 1) / 2) * 0.43 + (L % 2) * 0.03, L * 0.086, (j - (nz - 1) / 2) * 0.195); b.userData.L = L; b.rotation.y = Math.sin(L * 3 + i) * 0.04; pile.add(b); bundles.push(b); } });
  const bkB = makeBokeh({ n: 40, center: [0, 2.4, -33], spread: [14, 4, 2], colors: ["#ffb35c", "#ff6a2b", "#ffd08a"], seed: 19 }); S.backdrop(bkB.group);
  const anim = (t) => {
    const a = t < 31.45; field.group.visible = glows.group.visible = crowd.group.visible = a; B.visible = room.group.visible = bkB.group.visible = !a;
    field.update(t); glows.update(t); fadeBokeh(glows, sm(t, 28.6, 31.0)); room.set(0.45); room.update(t); bkB.update(t);
    crowd.light(lin(t, 28.4, 30.9));
    // the pile grows layer by layer while "trinta e sete bilhões de reais" is said, each bundle dropping in
    bundles.forEach((b, i) => { const t0 = 31.8 + b.userData.L * 0.3 + (i % 6) * 0.035, k = eOut(lin(t, t0, t0 + 0.14)); b.visible = t > t0; b.position.copy(b.userData.rest); b.position.y += 0.12 * (1 - k); });
    if (!a) { key.intensity = 2.2; hemi.intensity = 0.4; }
  };
  S.hero(crowd.group, "multidão com celulares", { when: (t) => t < 31.45 });
  S.hero(counter, "balcão da casa de apostas", { when: (t) => t >= 31.45 });
  S.hero(pile, "pilha de dinheiro", { when: (t) => t >= 33.2 });
  const boxA = envelope([crowd.group], anim, 27.6, 31.4);
  const boxB = envelope([counter, pile], anim, 31.5, 35.6);
  return (t) => {
    anim(t);
    if (t < 31.45) CAM.apply(CAM.move(boxA, "drop", lin(t, 27.55, 31.45), { zone: "stage", from: [0, 1.35, 1], rise: 0.45 }));
    else CAM.apply(CAM.move(boxB, "push", lin(t, 31.45, 35.6), { zone: "stage", from: [0.25, 0.3, 1], pull0: 1.15 }));
  };
});

// ============================================================ 9 · a MP proíbe tudo (35.60–43.55)
// Shot A: the photo of the announcement in a frame. Shot B (40.30): sports betting, online casino and
// advertising, each on a plinth, each gets a red X on its word.
function makeRoulette(r = 0.42) {
  const g = new THREE.Group();
  const c = makeCanvas(512, 512), x = c.getContext("2d");
  x.fillStyle = "#5a3520"; x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill();
  for (let i = 0; i < 37; i++) { const a0 = i / 37 * Math.PI * 2, a1 = (i + 1) / 37 * Math.PI * 2; x.fillStyle = i === 0 ? "#1f7a3a" : i % 2 ? "#b3181a" : "#141414"; x.beginPath(); x.moveTo(256, 256); x.arc(256, 256, 250, a0, a1); x.closePath(); x.fill(); }
  x.strokeStyle = "#d9b66a"; x.lineWidth = 2; for (let i = 0; i < 37; i++) { const a = i / 37 * Math.PI * 2; x.beginPath(); x.moveTo(256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160); x.lineTo(256 + Math.cos(a) * 250, 256 + Math.sin(a) * 250); x.stroke(); }
  const gr = x.createRadialGradient(256, 256, 20, 256, 256, 160); gr.addColorStop(0, "#8a5a3a"); gr.addColorStop(1, "#4a2a18"); x.fillStyle = gr; x.beginPath(); x.arc(256, 256, 160, 0, 7); x.fill();
  x.strokeStyle = "#d9b66a"; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 160, 0, 7); x.stroke();
  const prof = [[r * 1.24, 0], [r * 1.28, 0.05], [r * 1.26, 0.14], [r * 1.1, 0.16], [r * 1.04, 0.12], [r * 1.0, 0.1]].map(([a, b]) => new THREE.Vector2(a, b));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.35, clearcoat: 0.8 })); g.add(bowl);
  const floorM = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.25, 0.02, 64), pmat("#3a2214", { roughness: 0.5 })); floorM.position.y = 0.01; g.add(floorM);
  const wheel = new THREE.Group(); wheel.position.y = 0.1; g.add(wheel);
  const top = pmat("#ffffff", { map: texFrom(c), roughness: 0.3, clearcoat: 0.8 }), side = pmat("#3a2214");
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.03, 64), [side, top, side]));
  const turret = new THREE.Mesh(new THREE.ConeGeometry(r * 0.12, r * 0.3, 24), pmat(GOLD_METAL, { metalness: 1, roughness: 0.25 })); turret.position.y = r * 0.15 + 0.015; wheel.add(turret);
  for (let i = 0; i < 4; i++) { const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, r * 0.5, 8), pmat(GOLD_METAL, { metalness: 1, roughness: 0.25 })); arm.rotation.z = Math.PI / 2; arm.rotation.y = i * Math.PI / 2; arm.position.y = r * 0.2; wheel.add(arm); }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), pmat("#f6f6f2", { roughness: 0.2, clearcoat: 1 })); g.add(ball);
  g.add(contactShadow(r * 3, r * 3));
  return { group: g, update: (t) => { wheel.rotation.y = t * 1.3; const a = -t * 3.1; ball.position.set(Math.cos(a) * r * 1.06, 0.14, Math.sin(a) * r * 1.06); } };
}
function makeBillboardSmall() {
  const g = new THREE.Group(), steel = pmat("#3a3d42", { metalness: 0.7, roughness: 0.35 });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12), steel); p.position.set(s * 0.32, 0.25, 0); g.add(p); }
  const c = makeCanvas(640, 400), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 640, 400); gr.addColorStop(0, "#6a1fd6"); gr.addColorStop(1, "#ff6a2b"); x.fillStyle = gr; x.fillRect(0, 0, 640, 400);
  x.fillStyle = "#ffffff"; x.beginPath(); x.arc(150, 200, 90, 0, 7); x.fill(); x.fillStyle = "#14171c"; for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; x.beginPath(); x.arc(150 + Math.cos(a) * 56, 200 + Math.sin(a) * 56, 18, 0, 7); x.fill(); }
  x.fillStyle = "#fff"; x.font = "900 92px Inter"; x.textAlign = "left"; x.fillText("APOSTE", 270, 180); x.fillText("JÁ!", 270, 280);
  const panel = new THREE.Mesh(rbox(0.96, 0.62, 0.05, 0.015), pmat("#1b1c20", { roughness: 0.4 })); panel.position.y = 0.78; g.add(panel);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false })); face.position.set(0, 0.78, 0.0255); g.add(face);
  return g;
}
const XAT = [40.62, 41.78, 42.92];
addScene("mp", 35.6, 43.55, (S) => {
  const bk = makeBokeh({ n: 60, center: [0, 3, -7], spread: [18, 8, 3], colors: ["#cfe0ff", "#ffffff", "#ffd08a"], seed: 51 }); S.backdrop(bk.group);
  // A — the frame
  const fr = makePhotoFrame("lula-mp", { w: 2.6, shape: 1.9, name: "ANÚNCIO · 25/09" }); S.add(fr.group);
  // B — three plinths, far to the side of the frame (never in the same shot)
  const row = new THREE.Group(); row.position.set(30, 0, 0); S.add(row);
  const wheel = makeRoulette(0.4);
  const items = [["ESPORTIVA", makeSoccerBall(0.3)], ["CASSINO", wheel.group], ["PROPAGANDA", makeBillboardSmall()]];
  const SLOTS = [{ x: -2.6, z: 0, h: 0.62 }, { x: 0, z: 0, h: 0.48 }, { x: 2.6, z: 0, h: 0.5 }];
  const plinths = items.map(([label, obj], i) => {
    const sl = SLOTS[i], p = makeNamedPlinth(label, { w: 1.2, h: sl.h, d: 0.85, plateH: 0.32 }); p.group.position.set(sl.x, 0, sl.z); row.add(p.group);
    if (i === 0) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 10, 32), pmat(GOLD_METAL, { metalness: 1, roughness: 0.3 })); ring.rotation.x = Math.PI / 2; ring.position.y = sl.h + 0.022; p.group.add(ring); obj.position.set(0, sl.h + 0.022 + 0.28, 0); }
    else obj.position.set(0, sl.h, 0);
    if (i === 2) obj.scale.setScalar(1.25);
    p.group.add(obj);
    const x = makeRedX(0.9); x.position.set(0, sl.h + (i === 2 ? 0.95 : i === 1 ? 0.35 : 0.32), 0.5); p.group.add(x);
    return { p, obj, x };
  });
  const anim = (t) => {
    bk.update(t);
    const a = t < 40.3; fr.group.visible = a; row.visible = !a;
    fr.frame.rotation.y = 0.8 * (1 - eOut(lin(t, 35.62, 36.2))); fr.zoom(1 + 0.1 * lin(t, 35.6, 40.3));
    items[0][1].rotation.y = t * 0.8; wheel.update(t);
    plinths.forEach(({ x }, i) => { popIn(x, t, XAT[i], 0.3, 1); });
  };
  S.hero(fr.group, "porta-retrato do anúncio", { when: (t) => t > 36.2 && t < 40.3 });
  const WIN = [[40.3, 41.1], [41.6, 42.25], [42.75, 43.55]];
  plinths.forEach(({ p }, i) => S.hero(p.group, ["bola", "roleta", "anúncio"][i], { when: (t) => t >= WIN[i][0] && t < WIN[i][1] }));
  const boxA = envelope([fr.group], anim, 36.2, 40.3);
  const PB = plinths.map((q, i) => CAM.pose(envelope([q.p.group], anim, 43.4, 43.5), { zone: "stage", from: [0.05, i === 1 ? 0.55 : 0.32, 1], pull: 1.12 }));
  return (t) => {
    anim(t);
    if (t < 40.3) CAM.apply(CAM.move(boxA, "orbit", lin(t, 35.6, 40.3), { zone: "stage", from: [0, 0.14, 1], deg: 28 }));
    else CAM.apply(CAM.track(t, [[40.3, PB[0]], [41.1, CAM.blend(PB[0], PB[1], 0.04), 0.8], [41.6, PB[1], 0.45], [42.4, CAM.blend(PB[1], PB[2], 0.04), 0.8], [42.75, PB[2], 0.4], [43.55, CAM.blend(PB[2], PB[1], 0.1), 0.8]]));
  };
});

// ============================================================ 10 · o motivo: saúde (43.55–49.05)
// A bedside heart monitor (the trace jumps on "saúde"); beside it, the social cost piles up in cash.
function makeHeartMonitor() {
  const g = new THREE.Group(), steel = pmat("#c9ccd1", { metalness: 1, roughness: 0.25 }), white = pmat("#e9e7e2", { roughness: 0.45, clearcoat: 0.5 });
  for (let i = 0; i < 5; i++) { const a = i * 1.2566; const leg = new THREE.Mesh(rbox(0.34, 0.035, 0.05, 0.012), steel); leg.position.set(Math.cos(a) * 0.17, 0.07, Math.sin(a) * 0.17); leg.rotation.y = -a; g.add(leg); const w = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), pmat("#222")); w.position.set(Math.cos(a) * 0.33, 0.035, Math.sin(a) * 0.33); g.add(w); }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 16), steel); pole.position.y = 0.62; g.add(pole);
  const box = new THREE.Mesh(rbox(1.0, 0.72, 0.16, 0.04), white); box.position.set(0, 1.45, 0); g.add(box);
  const bezel = new THREE.Mesh(rbox(0.84, 0.54, 0.02, 0.02), pmat("#111", { roughness: 0.3 })); bezel.position.set(0, 1.47, 0.08); g.add(bezel);
  const c = makeCanvas(640, 400), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, 1.47, 0.091); g.add(scr);
  for (let i = 0; i < 3; i++) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), pmat("#2a2b2f")); k.rotation.x = Math.PI / 2; k.position.set(-0.3 + i * 0.12, 1.15, 0.085); g.add(k); }
  g.add(contactShadow(1, 1));
  let last = -1;
  const ecg = (u) => { const p = ((u % 1) + 1) % 1; if (p < 0.08) return Math.sin(p / 0.08 * Math.PI) * 0.12; if (p > 0.18 && p < 0.21) return -0.15; if (p >= 0.21 && p < 0.25) return 1; if (p >= 0.25 && p < 0.29) return -0.35; if (p > 0.45 && p < 0.6) return Math.sin((p - 0.45) / 0.15 * Math.PI) * 0.22; return 0; };
  return {
    group: g,
    paint(t, alarm) {
      const q = Math.round(t * 30); if (q === last) return; last = q;
      x.fillStyle = "#04120b"; x.fillRect(0, 0, 640, 400);
      x.strokeStyle = "rgba(60,255,140,0.08)"; x.lineWidth = 1; for (let i = 0; i < 640; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 400); x.stroke(); } for (let j = 0; j < 400; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(640, j); x.stroke(); }
      const colr = alarm ? "#ff3b2f" : "#3cff8c"; x.strokeStyle = colr; x.lineWidth = 6; x.shadowColor = colr; x.shadowBlur = 12; x.beginPath();
      for (let i = 0; i <= 600; i += 4) { const u = (i / 600) * 2.2 + t * 1.25 * (alarm ? 1.6 : 1); const y = 230 - ecg(u) * 140; i ? x.lineTo(20 + i, y) : x.moveTo(20, y); }
      x.stroke(); x.shadowBlur = 0;
      x.fillStyle = colr; x.font = "900 64px Inter"; x.textAlign = "right"; x.fillText(alarm ? "♥ 132" : "♥ 78", 620, 70);
      tex.needsUpdate = true;
    },
  };
}
addScene("saude", 43.55, 49.05, (S) => {
  const bk = makeBokeh({ n: 50, center: [0, 2.6, -8], spread: [20, 8, 3], colors: ["#cfe8ff", "#ffffff", "#9fd0ff"], seed: 53 }); S.backdrop(bk.group);
  const floorT = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), pmat("#ffffff", { map: tileTex(noiseTex({ base: "#15181c", amount: 0.08, size: 2, seed: 7 }), 30, 30), roughness: 0.7 })); floorT.rotation.x = -Math.PI / 2; floorT.position.y = 0.002; S.backdrop(asBackdrop(floorT));
  const mon = makeHeartMonitor(); mon.group.position.set(-0.52, 0, 0); mon.group.rotation.y = 0.18; S.add(mon.group);
  const base = makeNamedPlinth("CUSTO SOCIAL", { w: 1.05, h: 0.34, d: 0.7 }); base.group.position.set(0.62, 0, 0.15); S.add(base.group);
  const stack = new THREE.Group(); stack.position.set(0.62, 0.34, 0.15); S.add(stack);
  const bundles = [];
  for (let L = 0; L < 18; L++) for (let i = 0; i < 2; i++) { const b = makeCashBundle({ w: 0.44, d: 0.2, h: 0.075 }); b.position.set((i - 0.5) * 0.45, L * 0.076, Math.sin(L * 2.1) * 0.01); b.rotation.y = Math.sin(L * 1.3 + i) * 0.05; b.userData.L = L; stack.add(b); bundles.push(b); }
  const anim = (t) => {
    bk.update(t + beat(t, 45.6, 0.8) * 1.5); key.intensity = 2.2; key.color.set("#ffe2c8");
    mon.paint(t, t > 45.55);
    bundles.forEach((b) => { const t0 = 45.9 + b.userData.L * 0.16; b.visible = t > t0; b.position.y = b.userData.L * 0.076 + 0.25 * (1 - eOut(lin(t, t0, t0 + 0.18))); });
  };
  S.hero(mon.group, "monitor cardíaco");
  S.hero(base.group, "base custo social"); S.hero(stack, "pilha de dinheiro", { when: (t) => t > 47.0 });
  const box = envelope([mon.group, base.group, stack], anim, 43.55, 49.05);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, 43.55, 49.05), { zone: "stage", from: [0.15, 0.2, 1], pull0: 1.2 })); };
});

// ============================================================ 11 · pode cair sozinha (49.05–51.65)
// The licence from the hook (PROIBIDA) beside an hourglass; as the sand runs, the red ink fades.
addScene("podecair", 49.05, 51.65, (S) => {
  const shop = makeTvWall(); shop.set(0); S.backdrop(shop.group);
  makeDesk(S);
  const { cert, no } = licenceWithMarks(); cert.group.position.set(0.3, DESK_TOP, 0); S.add(cert.group);
  const hg = makeHourglass({ h: 0.9 }); hg.group.position.set(-0.85, DESK_TOP, -0.35); S.add(hg.group);
  const anim = (t) => {
    shop.update(t);
    hg.set(0.15 + 0.8 * lin(t, 49.2, 51.6));
    no.material.opacity = 1 - 0.6 * sm(t, 49.8, 51.5);
  };
  S.hero(cert.group, "licença proibida"); S.hero(hg.group, "ampulheta");
  const box = envelope([cert.group, hg.group], anim, 49.05, 51.65);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, 49.05, 51.65), { zone: "stage", from: [0.1, 1.0, 1], rise: 0.2 })); };
});

// ============================================================ 12 · a analogia: pênalti esperando o VAR (51.65–62.80)
// Night stadium. The referee points at the spot; the ball waits on it; the pitch-side VAR monitor
// reviews (confirm ✓ or annul ✗). Shot B (58.30): the monitor's sign is CONGRESSO; its countdown runs
// out ("se não decidir a tempo") and the penalty mark fades as the ball rolls off it.
function paintVarScreen(x, W, H, o = {}) {
  x.fillStyle = "#0b0f14"; x.fillRect(0, 0, W, H);
  // replay frame: the box from above with the spot, the ball and two players
  x.fillStyle = "#2e7a36"; x.fillRect(20, 20, W - 40, H - 40);
  x.strokeStyle = "rgba(240,245,235,0.9)"; x.lineWidth = 4; x.strokeRect(80, 40, W - 160, 230); x.beginPath(); x.arc(W / 2, 200, 5, 0, 7); x.stroke();
  x.fillStyle = "#fff"; x.beginPath(); x.arc(W / 2, 200, 9, 0, 7); x.fill();
  x.fillStyle = "#d0302a"; x.beginPath(); x.arc(W / 2 - 60, 170, 14, 0, 7); x.fill(); x.fillStyle = "#e8e8e8"; x.beginPath(); x.arc(W / 2 - 30, 180, 14, 0, 7); x.fill();
  x.fillStyle = "rgba(0,0,0,0.55)"; roundRect(x, 30, 30, 150, 64, 14); x.fill(); x.fillStyle = "#fff"; x.font = "900 46px Inter"; x.textAlign = "left"; x.fillText("VAR", 52, 78);
  if (o.scan !== undefined) { x.fillStyle = "rgba(255,255,255,0.25)"; x.fillRect(20 + (W - 40) * o.scan, 20, 6, H - 40); }
  // the two possible calls: ✓ confirm (green) and ✗ annul (red); `pick` lights one
  const btn = (cx, c, on, draw) => { x.fillStyle = on ? c : "rgba(20,20,24,0.85)"; roundRect(x, cx - 90, H - 120, 180, 92, 20); x.fill(); x.strokeStyle = on ? "#fff" : c; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); draw(); x.stroke(); x.lineCap = "butt"; };
  if (o.buttons) {
    btn(W / 2 - 120, "#1f9a52", o.pick === 1, () => { x.moveTo(W / 2 - 150, H - 74); x.lineTo(W / 2 - 128, H - 52); x.lineTo(W / 2 - 88, H - 98); });
    btn(W / 2 + 120, "#e0261b", o.pick === 2, () => { x.moveTo(W / 2 + 96, H - 98); x.lineTo(W / 2 + 144, H - 50); x.moveTo(W / 2 + 144, H - 98); x.lineTo(W / 2 + 96, H - 50); });
  }
}
function makeReferee() {
  const d = makeDiner({ suit: "#151517", shirt: "#1b1b1e", tie: "#151517", skin: "#b9876a", hair: "#1c1410", shoes: "#0d0d0d" });
  return d;
}
const fmtClock = (s) => { s = Math.max(0, Math.ceil(s)); return `0:${String(s).padStart(2, "0")}`; };
addScene("var", 51.65, 62.8, (S) => {
  const st = makeStadiumNight({ seed: 7 }); S.backdrop(st.group);
  const ball = makeSoccerBall(0.13); ball.position.set(0, 0.13, 0); S.add(ball);
  const ref = makeReferee(); ref.group.position.set(1.4, 0, -0.3); S.add(ref.group);
  const turnRef = Math.atan2(-1.4, 0.3);
  const mon = makeVarMonitor({ label: "CONGRESSO" }); mon.group.position.set(-1.3, 0, -0.7); mon.group.rotation.y = 0.12; S.add(mon.group);
  mon.sign.visible = false;
  let lastPaint = "";
  const anim = (t) => {
    st.update(t); hemi.intensity = 0.42; key.intensity = 2.6; key.color.set("#fff1dc");
    // the referee points at the spot (from "pênalti marcado") and drops his arm when the call is gone
    const pt = sm(t, 52.9, 53.5) * (1 - sm(t, 62.0, 62.6));
    ref.setPose({ turn: turnRef, reach: 0.85 * pt, look: 0.3 * pt, lean: 0.08 * pt });
    // screen: reviewing (scan line) → the two calls; "confirmar" lights ✓, "anular" lights ✗
    const pick = t > 57.6 ? 2 : t > 56.55 ? 1 : 0;
    const key2 = `${t < 54.8 ? "scan" + Math.round(t * 10) : "b" + pick}`;
    if (key2 !== lastPaint) { lastPaint = key2; mon.paint((x, W, H) => paintVarScreen(x, W, H, t < 54.8 ? { scan: (t * 0.6) % 1 } : { buttons: true, pick })); }
    // countdown: ten seconds of real time, then fast-forwarded to 0:00 on "se não decidir a tempo"
    const left = t < 60.3 ? 30 - (t - 51.65) : lerp(30 - (60.3 - 51.65), 0, sm(t, 60.3, 61.7));
    const blink = t > 61.7 && Math.floor(t * 4) % 2 === 0;
    mon.timer(fmtClock(left), !blink);
    // the sign flips up on "o Congresso"
    mon.sign.visible = t > 59.45; mon.sign.scale.setScalar(Math.max(0.001, pop(t, 59.45, 0.35)));
    // "...a proibição cai": the mark fades and the ball rolls off it
    st.pitch.setSpot(1 - sm(t, 61.75, 62.4));
    const roll = eOut(lin(t, 61.9, 62.8)); ball.position.set(0.24 * roll, 0.13, 0.1 * roll); ball.rotation.set(roll * 1.5, 0, -roll * 2);
    st.lights.set(1 - 0.35 * beat(t, 61.8, 0.8));
  };
  S.hero(ref.group, "árbitro", { when: (t) => t < 58.3 });
  S.hero(ball, "bola na marca", { when: (t) => t < 58.3 || t > 61.85 });
  S.hero(mon.group, "monitor do var", { when: (t) => t < 61.45 });
  const boxA = envelope([ref.group, ball, mon.group], anim, 51.65, 58.3);
  const boxB = envelope([mon.group], anim, 58.3, 61.6);
  const spotBox = envelope([ball], anim, 61.6, 62.8);
  const SPOT = CAM.pose(spotBox, { zone: "stage", from: [0.1, 0.9, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    if (t < 58.3) CAM.apply(CAM.move(boxA, "truck", lin(t, 51.65, 58.3), { zone: "stage", from: [0.05, 0.2, 1], side: 0.35 }));
    else { const P = CAM.move(boxB, "push", lin(t, 58.3, 61.5), { zone: "stage", from: [-0.4, 0.12, 1], pull0: 1.12 }); CAM.apply(CAM.blend(P, SPOT, sm(t, 61.45, 61.85))); }
  };
});

// ============================================================ 13 · o VAR nem foi ligado (62.80–68.10)
// The same monitor, now COMISSÃO MISTA: black screen, the plug pulled out on the grass; its countdown
// keeps running.
addScene("comissao", 62.8, 68.1, (S) => {
  const st = makeStadiumNight({ seed: 9 }); S.backdrop(st.group);
  const mon = makeVarMonitor({ label: "COMISSÃO MISTA", signW: 1.3 }); mon.group.rotation.y = 0.2; S.add(mon.group);
  mon.paint((x, W, H) => { const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0d0f12"); g.addColorStop(0.5, "#05060a"); g.addColorStop(1, "#0b0c10"); x.fillStyle = g; x.fillRect(0, 0, W, H); x.fillStyle = "rgba(255,255,255,0.05)"; x.beginPath(); x.moveTo(0, 0); x.lineTo(W * 0.45, 0); x.lineTo(W * 0.15, H); x.lineTo(0, H); x.fill(); });
  const anim = (t) => {
    st.update(t); hemi.intensity = 0.42; key.intensity = 2.6; key.color.set("#fff1dc");
    mon.timer(fmtClock(24 - (t - 62.8)), true);
    // "nem foi ligado": the plug slips out of the floor box and lands on the grass
    mon.cable(sm(t, 64.3, 65.1));
    st.lights.set(1 - 0.25 * beat(t, 64.5, 0.8));
  };
  S.hero(mon.group, "monitor desligado");
  const box = envelope([mon.group], anim, 62.8, 68.1);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "reveal", lin(t, 62.8, 68.1), { zone: "stage", from: [0.3, 0.32, 1], pull0: 1.32 })); };
});

// ============================================================ 14 · o Supremo (68.10–73.10)
// Photo card (overlay); behind it, the stadium at night drifting (no hero).
addScene("fux", 68.1, 73.1, (S) => {
  const st = makeStadiumNight({ seed: 11 }); S.backdrop(st.group);
  const A = CAM.at([2, 1.2, 9], [0, 1.6, -11], { zone: "stage" }), B = CAM.at([-1.5, 2.6, 8], [0, 2.4, -11], { zone: "stage" });
  return (t) => { st.update(t); CAM.apply(CAM.blend(A, B, sm(t, 68.1, 73.1))); };
});

// ============================================================ 15 · os dois lados (73.10–87.75)
// One stage split down the middle: green on the left (what the government hopes: a home whose savings
// jar fills), red on the right (the risk: the phone where illegal sites keep popping up). On "em doze
// dias" each popup gets a red X and a wall of blocked sites rises behind.
const POPS = [["BÔNUS 500%", "#ff3b9a"], ["SAQUE NA HORA", "#d9620b"], ["SEM CADASTRO", "#7a3cff"], ["APOSTE AQUI", "#00b3ff"], ["CASSINO 24H", "#ff5a1f"], ["ODDS TURBO", "#23c26b"]];
function popupTex(text, color) {
  const c = makeCanvas(420, 270), x = c.getContext("2d");
  x.fillStyle = "#f2f2f4"; roundRect(x, 0, 0, 420, 270, 18); x.fill(); x.fillStyle = "#c9cbd1"; x.fillRect(0, 0, 420, 44);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((cc, i) => { x.fillStyle = cc; x.beginPath(); x.arc(24 + i * 26, 22, 8, 0, 7); x.fill(); });
  x.fillStyle = color; x.fillRect(16, 60, 388, 190); x.fillStyle = "#fff"; x.font = "900 54px Inter"; x.textAlign = "center"; x.textBaseline = "middle";
  let px = 54; while (x.measureText(text).width > 360 && px > 20) { px -= 2; x.font = `900 ${px}px Inter`; } x.fillText(text, 210, 155);
  return texFrom(c);
}
function blockedTileTex() {
  const c = makeCanvas(128, 96), x = c.getContext("2d"); x.fillStyle = "#1a1b20"; roundRect(x, 0, 0, 128, 96, 10); x.fill(); x.fillStyle = "#2a2c33"; x.fillRect(0, 0, 128, 16);
  x.strokeStyle = "#e0261b"; x.lineWidth = 11; x.lineCap = "round"; x.beginPath(); x.moveTo(40, 32); x.lineTo(88, 82); x.moveTo(88, 32); x.lineTo(40, 82); x.stroke();
  return texFrom(c);
}
addScene("lados", 73.1, 87.75, (S) => {
  const bkL = makeBokeh({ n: 40, center: [-5, 2.5, -8], spread: [10, 7, 3], colors: ["#7dffb0", "#c8ffd9", "#2fae66"], opacity: 0.45, seed: 61 }); S.backdrop(bkL.group);
  const bkR = makeBokeh({ n: 40, center: [5, 2.5, -8], spread: [10, 7, 3], colors: ["#ff6a5a", "#ffb0a0", "#e0261b"], opacity: 0.45, seed: 62 }); S.backdrop(bkR.group);
  // the split floor: two tinted halves and a glowing seam
  const half = (c, x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), pmat(c, { roughness: 0.35, clearcoat: 0.5 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.003, -1.5); return asBackdrop(m); };
  S.backdrop(half("#16281e", -4.5), half("#2a1614", 4.5));
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 9), new THREE.MeshBasicMaterial({ color: "#f4e8da", toneMapped: false })); seam.position.set(0, 0.006, -1.5); S.backdrop(asBackdrop(seam));
  const gl = new THREE.PointLight("#3cff8c", 0, 8, 1.6); gl.position.set(-2.4, 2.2, 1.4); S.add(gl);
  const rl = new THREE.PointLight("#ff3b2f", 0, 8, 1.6); rl.position.set(1.8, 2.2, 1.4); S.add(rl);
  // left: a home and its savings
  const home = new THREE.Group(); home.position.set(-2.3, 0, 0); S.add(home);
  const house = makeHouse({ w: 1.3, h: 0.95, d: 1.0, roofH: 0.6, roof: "#6b4a36" }); house.position.set(0, 0, -0.35); home.add(house);
  const jar = makeCoinJar({ label: "FAMÍLIA", r: 0.24, h: 0.58, n: 420 }); jar.group.scale.setScalar(1.7); jar.group.position.set(1.28, 0, 0.32); jar.fill(0.15); home.add(jar.group);
  // right: the phone and the illegal sites popping up around it
  const right = new THREE.Group(); right.position.set(1.5, 0, 0); S.add(right);
  const { phone, stand } = makePhoneOnStand({ add: (...o) => right.add(...o) }, { scale: 0.62, at: new V3(0, 0, 0), lean: 0.12 });
  paintHome(phone.ctx, { dead: true }); phone.tex.needsUpdate = true;
  const pops = POPS.map(([txt, c], i) => {
    const g = new THREE.Group(); right.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.4), new THREE.MeshBasicMaterial({ map: popupTex(txt, c), toneMapped: false, transparent: true, alphaTest: 0.4 })); g.add(m);
    const back = new THREE.Mesh(rbox(0.63, 0.41, 0.012, 0.01), pmat("#d9dadf", { roughness: 0.4 })); back.position.z = -0.008; g.add(back);
    const x = makeRedX(0.36); x.position.z = 0.03; g.add(x);
    const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
    g.userData = { rest: new V3(side * 0.62, 0.5 + row * 0.42, 0.25 + 0.05 * (i % 3)), rz: side * 0.1 * (row - 1), at: 80.5 + i * 0.45, xAt: 84.35 + i * 0.22, x };
    return g;
  });
  // the wall of blocked sites behind the phone
  const wallTex = blockedTileTex(), WC = 9, WR = 13, N = WC * WR;
  const tiles = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.3, 0.225), new THREE.MeshBasicMaterial({ map: wallTex, toneMapped: false }), N);
  const tileAt = [], d = new THREE.Object3D(), rnd = mulberry32(12);
  for (let i = 0; i < N; i++) { const c = i % WC, r = Math.floor(i / WC); tileAt.push({ p: new V3((c - (WC - 1) / 2) * 0.33, 0.25 + r * 0.255, -1.3), t0: 85.0 + Math.hypot(c - WC / 2, r) * 0.08 + rnd() * 0.2 }); }
  const wallG = new THREE.Group(); wallG.add(tiles); right.add(wallG);
  const anim = (t) => {
    bkL.update(t); bkR.update(t);
    fadeBokeh(bkL, 0.5 + 0.5 * sm(t, 74.6, 75.6)); fadeBokeh(bkR, 0.5 + 0.5 * sm(t, 79.4, 80.4));
    gl.intensity = 3.0 + 2.0 * beat(t, 75.1, 0.9); rl.intensity = 3.0 + 2.5 * beat(t, 79.7, 0.9);
    jar.fill(0.15 + 0.85 * sm(t, 76.4, 79.4));
    pops.forEach((g) => {
      const u = g.userData, k = pop(t, u.at, 0.35); g.visible = t > u.at; g.scale.setScalar(Math.max(0.001, k));
      g.position.copy(u.rest); g.position.y += 0.03 * Math.sin(t * 2 + u.at); g.rotation.z = u.rz;
      popIn(u.x, t, u.xAt, 0.25, 1);
    });
    tileAt.forEach((ti, i) => { const k = eOut(lin(t, ti.t0, ti.t0 + 0.25)); d.position.copy(ti.p); d.scale.setScalar(Math.max(0.0001, k)); d.updateMatrix(); tiles.setMatrixAt(i, d.matrix); });
    tiles.instanceMatrix.needsUpdate = true; wallG.visible = t > 84.9;
  };
  S.hero(house, "casa", { when: (t) => t < 79.6 }); S.hero(jar.group, "pote da família", { when: (t) => t > 75.6 && t < 79.6 });
  S.hero(phone.group, "celular", { when: (t) => t < 75.0 || t > 80.6 });
  pops.forEach((g, i) => S.hero(g, "site ilegal " + (i + 1), { when: (t) => t > g.userData.at + 0.4 && t < 84.9 }));
  S.hero(wallG, "parede de sites bloqueados", { when: (t) => t > 86.2 });
  const both = envelope([house, jar.group, phone.group, stand], anim, 73.1, 75.0);
  const left = envelope([house, jar.group], anim, 75.0, 79.6);
  const rightB = envelope([phone.group, stand, ...pops], anim, 81.0, 84.9);
  const wallB = envelope([phone.group, wallG, ...pops], anim, 86.4, 87.75);
  const W0 = CAM.pose(both, { zone: "stage", from: [0, 0.3, 1], pull: 1.0 });
  const W1 = CAM.pose(both, { zone: "stage", from: [0, 0.36, 1], pull: 1.06 });
  const L0 = CAM.pose(left, { zone: "stage", from: [0.1, 0.28, 1], pull: 1.04 });
  const L1 = CAM.pose(left, { zone: "stage", from: [-0.04, 0.24, 1] });
  const R0 = CAM.pose(rightB, { zone: "stage", from: [0.12, 0.2, 1], pull: 1.05 });
  const R1 = CAM.pose(rightB, { zone: "stage", from: [0.02, 0.18, 1] });
  const V0 = CAM.pose(wallB, { zone: "stage", from: [0.04, 0.16, 1] });
  return (t) => {
    anim(t);
    CAM.apply(CAM.track(t, [[73.1, W0], [74.9, W1, 1.8], [75.6, L0, 0.6], [79.4, L1, 3.7], [80.6, R0, 1.1], [84.6, R1, 3.9], [86.3, V0, 1.6], [87.75, CAM.blend(V0, V0, 0), 1.4]]));
  };
});

// ============================================================ 16 · a pergunta (87.75–95.40)
// "Proibir as bets protege as famílias... ou só empurra o apostador pro site ilegal?" A phone whose
// screen is split: a green home on the left, a red warning on the right.
function paintSplit(x, kL = 0, kR = 0) {
  x.fillStyle = `rgb(${18 + 20 * kL},${58 + 70 * kL},${36 + 30 * kL})`; x.fillRect(0, 0, 360, 1500); x.fillStyle = `rgb(${74 + 90 * kR},${19 + 20 * kR},${16 + 14 * kR})`; x.fillRect(360, 0, 360, 1500);
  x.fillStyle = "#f4e8da"; x.fillRect(356, 0, 8, 1500);
  // left: a house
  x.fillStyle = "#3cff8c"; x.beginPath(); x.moveTo(40, 760); x.lineTo(180, 590); x.lineTo(320, 760); x.closePath(); x.fill(); x.fillRect(75, 760, 210, 190);
  x.fillStyle = "#123a24"; x.fillRect(150, 830, 60, 120);
  // right: a warning sign
  x.fillStyle = "#ff3b2f"; x.beginPath(); x.moveTo(540, 580); x.lineTo(700, 940); x.lineTo(380, 940); x.closePath(); x.fill();
  x.fillStyle = "#4a1310"; x.fillRect(525, 690, 30, 150); x.beginPath(); x.arc(540, 885, 20, 0, 7); x.fill();
}
addScene("pergunta", 87.75, 95.4, (S) => {
  const bkL = makeBokeh({ n: 40, center: [-5, 2.5, -8], spread: [10, 7, 3], colors: ["#7dffb0", "#c8ffd9", "#2fae66"], opacity: 0.5, seed: 71 }); S.backdrop(bkL.group);
  const bkR = makeBokeh({ n: 40, center: [5, 2.5, -8], spread: [10, 7, 3], colors: ["#ff6a5a", "#ffb0a0", "#e0261b"], opacity: 0.5, seed: 72 }); S.backdrop(bkR.group);
  const { phone, stand } = makePhoneOnStand(S, { scale: 0.62, at: new V3(0, 0, 0), lean: 0.12 });
  let lastQ = -1;
  const gl = new THREE.PointLight("#3cff8c", 4, 6, 1.6); gl.position.set(-1.4, 1.6, 1.2); S.add(gl);
  const rl = new THREE.PointLight("#ff3b2f", 4, 6, 1.6); rl.position.set(1.4, 1.6, 1.2); S.add(rl);
  const anim = (t) => {
    bkL.update(t); bkR.update(t);
    gl.intensity = 3.5 + 2.5 * beat(t, 89.5, 1.0); rl.intensity = 3.5 + 2.5 * beat(t, 91.4, 1.0);
    phone.group.rotation.y = 0.05 * Math.sin((t - 87.75) * 0.8);
    const kL = beat(t, 89.5, 1.1), kR = beat(t, 91.35, 1.3), q = Math.round(kL * 10) * 11 + Math.round(kR * 10);
    if (q !== lastQ) { lastQ = q; paintSplit(phone.ctx, kL, kR); phone.tex.needsUpdate = true; }
  };
  S.hero(phone.group, "celular dividido");
  const box = envelope([phone.group, stand], anim, 87.75, 95.4);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, 87.75, 95.4), { zone: "stage", from: [0, 0.16, 1], pull0: 1.12 })); };
});
