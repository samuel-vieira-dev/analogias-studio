// ============================================================================
// videos/2026-10-29-fuga-flavio-bolsonaro/scenes.js
// 3D scenes synced to audio/words.json (narration 0–102.2 s, video 104.2 s).
// Inlined by tools/build.py after engine/core.js and engine/props/*.js.
//
// Pattern for every scene:
//   anim(t)  animates the objects only (no camera)
//   CAM.pose(envelope(objs, anim, t0, t1), { zone })  frames the whole motion of the shot
//   zone "stage" whenever the headline band has text at that moment, "stage-tall" otherwise
//   S.hero / S.label / S.solid register what tools/qa.cjs must check
// Neutral imagery only: no party logos, no real brands. Flávio is a stylised 3D figure (makeFlavio), never a photo edit.
// ============================================================================

// ---------------------------------------------------------------- local props (this video)
const PAPER = "#fbf7ef", INK = "#1d1d1d", NAVY = "#1f2f5c", BORDO = "#7a1f2b", GOLD = "#d8b45a", STEEL = "#8b9196", WOODC = "#6a4a30";

// Canvas texture painted by a function (w x h px). API { tex, ctx, paint(fn) }.
function canvasTex(w, h, fn) {
  const c = makeCanvas(w, h), x = c.getContext("2d"), tex = texFrom(c);
  const paint = (f) => { x.clearRect(0, 0, w, h); f(x, w, h); tex.needsUpdate = true; };
  if (fn) paint(fn);
  return { tex, ctx: x, paint };
}
function centerText(x, text, cx, cy, font, color) { x.font = font; x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, cx, cy); }

// Passport booklet lying flat or standing (cover faces +z). Gold crest ring + printed name.
// Origin: centre. Size 0.9 x 1.25 x 0.1. API { group, stampMark(k) } — stampMark shows a red CANCELADO ink mark.
function makePassport(country, { color = NAVY, sub = "PASSAPORTE" } = {}) {
  const g = new THREE.Group(), W0 = 0.9, H0 = 1.25, D0 = 0.1;
  const body = new THREE.Mesh(rbox(W0, H0, D0, 0.03), mat(color, { roughness: 0.75 })); g.add(body);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(W0 - 0.06, H0 - 0.06, D0 * 0.7), mat(PAPER)); pages.position.x = 0.02; g.add(pages);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 10, 40), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); ring.position.set(0, 0.08, D0 / 2 + 0.01); g.add(ring);
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.1, 5), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); star.position.set(0, 0.08, D0 / 2 + 0.006); g.add(star);
  const top = makePlate(country, 0.84, 0.28, { bg: color, fg: GOLD }); top.position.set(0, 0.43, D0 / 2); g.add(top);
  const bot = makePlate(sub, 0.84, 0.25, { bg: color, fg: GOLD, detail: true }); bot.position.set(0, -0.45, D0 / 2); g.add(bot);
  const markTex = chipTex("CANCELADO", { bg: null, fg: RED, font: "900 120px Inter", h: 180 });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86 * markTex.image.height / markTex.image.width), new THREE.MeshBasicMaterial({ map: markTex, transparent: true, toneMapped: false, depthWrite: false }));
  mark.position.set(0, -0.17, D0 / 2 + 0.03); mark.rotation.z = 0.28; mark.visible = false; mark.userData.decor = true; g.add(mark);
  return { group: g, stampMark: (k) => { mark.visible = k > 0.01; mark.scale.setScalar(Math.max(0.001, lerp(1.6, 1, eOut(k)))); mark.material.opacity = clamp(k * 1.5); } };
}

// Business jet: fuselage along +x (nose at +x), swept wings, T-tail, two rear engines, windows. Origin: centre, wheels up.
function makeJet({ color = "#eef0f2", stripe = ORANGE } = {}) {
  const g = new THREE.Group(), body = mat(color, { roughness: 0.35, metalness: 0.2 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 2.2, 8, 24), body); fus.rotation.z = Math.PI / 2; g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), body); nose.scale.set(1.9, 1, 1); nose.position.x = 1.15; g.add(nose);
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 24), body); tailCone.rotation.z = Math.PI / 2; tailCone.position.x = -1.55; g.add(tailCone);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat("#1d2a36", { roughness: 0.15, metalness: 0.4 })); cockpit.scale.set(1.5, 0.7, 1.2); cockpit.position.set(1.32, 0.1, 0); g.add(cockpit);
  const ln = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.452), mat(stripe, { roughness: 0.5 })); ln.position.set(-0.05, -0.04, 0); g.add(ln);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.045, 14), mat("#1d2a36", { roughness: 0.2 })); w.position.set(0.7 - i * 0.26, 0.07, s * 0.222); w.rotation.y = s > 0 ? 0 : Math.PI; g.add(w); }
  // wings: swept trapezoids, flat in the xz plane
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape(); sh.moveTo(0.35, 0); sh.lineTo(-0.35, 0); sh.lineTo(-0.75, 1.55); sh.lineTo(-0.45, 1.55); sh.lineTo(0.35, 0);
    const wing = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), body);
    wing.rotation.x = s * Math.PI / 2; wing.position.set(0, -0.12, s * 0.15); if (s < 0) wing.position.y += 0.05; g.add(wing);
    const eng = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.38, 6, 16), mat("#c9ccd0", { roughness: 0.4, metalness: 0.4 })); eng.rotation.z = Math.PI / 2; eng.position.set(-1.05, 0.15, s * 0.36); g.add(eng);
    const pyl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.16), body); pyl.position.set(-1.05, 0.12, s * 0.24); g.add(pyl);
  }
  // T-tail: fin + horizontal stabiliser on top
  const fs = new THREE.Shape(); fs.moveTo(-1.25, 0.15); fs.lineTo(-1.85, 0.15); fs.lineTo(-2.05, 0.95); fs.lineTo(-1.8, 0.95); fs.lineTo(-1.25, 0.15);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.05, bevelEnabled: false }), body); fin.position.z = -0.025; g.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 1.1), body); stab.position.set(-1.95, 0.95, 0); g.add(stab);
  return g;
}

// Americas map (lon -115..-34, lat -38..37) printed on a slab lying on the floor. x = east, -z = north.
// API { group, pt(lon, lat, y) → V3 on the map, top }
const MAP_S = 0.1, MAP_T = 0.08;
const AMERICAS = [[-115, 37], [-76, 37], [-75.6, 35.2], [-77.5, 34.4], [-79.2, 33.2], [-81.0, 32.0], [-81.4, 30.4], [-80.6, 28.4], [-80.1, 26.8], [-80.1, 25.8], [-80.5, 25.2], [-81.2, 25.2], [-81.8, 26.1], [-82.6, 27.8], [-82.8, 28.9], [-83.6, 29.9], [-85.4, 29.7], [-87.5, 30.3], [-89.0, 30.3], [-89.6, 29.1], [-91.0, 29.4], [-93.8, 29.7], [-95.0, 29.2], [-97.2, 27.8], [-97.4, 25.9], [-97.8, 22.5], [-96.1, 19.1], [-94.5, 18.2], [-91.5, 18.5], [-90.4, 21.0], [-87.0, 21.5], [-87.6, 18.5], [-88.2, 16.0], [-84.0, 15.8], [-83.2, 15.0], [-83.7, 11.0], [-82.0, 9.0], [-79.6, 9.6], [-77.4, 8.7], [-75.5, 10.5], [-71.6, 12.4], [-70.0, 11.5], [-66.0, 10.6], [-62.0, 10.7], [-60.0, 8.5], [-57.0, 6.0], [-52.0, 5.0], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-39.5, -18], [-41, -22], [-45, -23.5], [-48, -25.5], [-48.5, -28], [-53, -33.7], [-55, -35], [-57.5, -34.8], [-57, -36.5], [-57.5, -38], [-73.5, -38], [-73.2, -37], [-71.5, -32], [-71.4, -28], [-70.3, -23], [-70.2, -18.5], [-71.5, -17], [-76, -14], [-79, -8], [-81.2, -6], [-81, -4], [-80, -2.8], [-80.9, -1], [-80, 1], [-78.8, 1.8], [-77.5, 4], [-77.3, 7.5], [-80, 7.3], [-83, 8.3], [-85.7, 10], [-87.5, 13], [-91.5, 14], [-94.5, 16.1], [-96.5, 15.7], [-101, 17.5], [-105.5, 20], [-105.7, 23], [-109, 25], [-112, 29], [-114.5, 31.5]];
const CUBA = [[-84.9, 21.9], [-82.5, 23.1], [-80.5, 23.1], [-77.5, 21.8], [-74.2, 20.2], [-77.7, 19.9], [-80.5, 21.4], [-82.8, 21.5]];
const BR_LONLAT = [[-60, 5], [-51, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-39.5, -18], [-41, -22], [-45, -23.5], [-48, -25.5], [-48.5, -28], [-53, -33.7], [-57.5, -30], [-54, -26], [-55, -23.5], [-58, -20], [-58, -16.5], [-60.5, -14], [-65, -11], [-70, -11], [-73.5, -8], [-73, -4.5], [-70, -4], [-69.5, 1], [-67, 2], [-64, 4]];
function makeMap({ lon0 = -115, lon1 = -34, lat0 = -38, lat1 = 37, px = 14, labels = true } = {}) {
  const w = Math.round((lon1 - lon0) * px), h = Math.round((lat1 - lat0) * px);
  const P = (lon, lat) => [(lon - lon0) * px, (lat1 - lat) * px];
  const poly = (x, pts) => { x.beginPath(); pts.forEach(([lo, la], i) => { const [qx, qy] = P(lo, la); i ? x.lineTo(qx, qy) : x.moveTo(qx, qy); }); x.closePath(); };
  const k = px / 14;
  const ct = canvasTex(w, h, (x) => {
    x.fillStyle = "#173a45"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,0.06)"; x.lineWidth = 2;
    for (let lo = -110; lo <= -40; lo += 10) { const [qx] = P(lo, 0); x.beginPath(); x.moveTo(qx, 0); x.lineTo(qx, h); x.stroke(); }
    for (let la = -30; la <= 30; la += 10) { const [, qy] = P(0, la); x.beginPath(); x.moveTo(0, qy); x.lineTo(w, qy); x.stroke(); }
    x.fillStyle = "#c9b8a6"; poly(x, AMERICAS); x.fill(); poly(x, CUBA); x.fill();
    x.fillStyle = "#e8b04a"; poly(x, BR_LONLAT); x.fill();
    x.strokeStyle = "#6e5a48"; x.lineWidth = 3 * Math.sqrt(k); poly(x, AMERICAS); x.stroke();
    if (labels) for (const [t, lo, la, s, c] of labels === true ? [["BRASIL", -52, -9, 64, "#5a3410"], ["EUA", -88, 34, 56, "#3a2a20"], ["ARGENTINA", -65, -33, 40, "#3a2a20"], ["EQUADOR", -78.5, -0.6, 30, "#3a2a20"]] : labels) {
      const [qx, qy] = P(lo, la); centerText(x, t, qx, qy, `900 ${s}px Inter`, c);
    }
  });
  const g = new THREE.Group();
  const ww = (lon1 - lon0) * MAP_S, hh = (lat1 - lat0) * MAP_S;
  const side = mat("#0f2a33");
  const slab = new THREE.Mesh(new THREE.BoxGeometry(ww, MAP_T, hh), [side, side, new THREE.MeshStandardMaterial({ map: ct.tex, roughness: 0.85 }), side, side, side]);
  const cl = (lon0 + lon1) / 2, ca = (lat0 + lat1) / 2;
  slab.position.set(0, MAP_T / 2, 0); g.add(slab);
  // pt(): map coordinates → local position on the slab top (the map is centred on its own middle)
  const pt = (lon, lat, y = 0) => new V3((lon - cl) * MAP_S, MAP_T + y, -(lat - ca) * MAP_S);
  return { group: g, pt, top: MAP_T, w: ww, h: hh };
}
// Map pin: red ball on a short stem, base at the origin.
function makePin3D(color = RED, s = 1) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.32 * s, 14), mat("#2a2a2a")); stem.rotation.x = Math.PI; stem.position.y = 0.16 * s; g.add(stem);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 20, 14), mat(color, { roughness: 0.35, emissive: color, emissiveIntensity: 0.25 })); ball.position.y = 0.38 * s; g.add(ball);
  return g;
}
// Route along points, drawn progressively (setDraw(k), k 0..1). Dashed = by road.
function makeRoute(points, { color = ORANGE, r = 0.035, dashed = false, segs = 120 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, segs, r, 8, false);
  const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const mesh = new THREE.Mesh(geo, m); mesh.userData.decor = true;
  const per = 8 * 6, total = geo.index.count;
  if (dashed) {
    // keep every other block of tube segments: rebuild index without the gaps
    const idx = geo.index.array, keep = [];
    for (let s = 0; s < segs; s++) if (Math.floor(s / 3) % 2 === 0) for (let k = 0; k < per; k++) keep.push(idx[s * per + k]);
    geo.setIndex(keep);
  }
  const count = geo.index.count;
  const setDraw = (k) => { const n = Math.floor(clamp(k) * count / 3) * 3; geo.setDrawRange(0, n); mesh.visible = n > 0; };
  setDraw(0);
  return { mesh, curve, setDraw };
}

// Stylised Flávio Bolsonaro (3D figure, not a photo): dark short hair with side part, clean-shaven,
// dark suit, light shirt, dark tie, slim build. Origin: floor, centre, facing +z, ~1.85 tall.
// API { group, armR, armL, head, pose(t) }
function makeFlavio() {
  const SKIN = "#e0b08e", g = new THREE.Group();
  const skin = mat(SKIN, { roughness: 0.6 }), hairM = mat("#2a2420", { roughness: 0.85 });
  const coat = mat("#2c3442", { roughness: 0.7 }), pants = mat("#2c3442", { roughness: 0.75 });
  for (const x of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.64, 6, 12), pants); leg.position.set(x, 0.42, 0); g.add(leg);
    const shoe = new THREE.Mesh(rbox(0.15, 0.09, 0.3, 0.04), mat("#141414", { roughness: 0.4 })); shoe.position.set(x, 0.045, 0.05); g.add(shoe);
  }
  const body = new THREE.Group(); body.position.y = 0.82; g.add(body);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.68, 28), coat); trunk.scale.z = 0.72; trunk.position.y = 0.34; body.add(trunk);
  const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.36, 6, 16), coat); sh.rotation.z = Math.PI / 2; sh.scale.z = 0.9; sh.position.y = 0.63; body.add(sh);
  const v = new THREE.Shape(); v.moveTo(-0.1, 0.67); v.lineTo(0.1, 0.67); v.lineTo(0, 0.3); v.lineTo(-0.1, 0.67);
  const shirt = new THREE.Mesh(new THREE.ShapeGeometry(v), mat("#dfe8f5", { roughness: 0.6 })); shirt.position.z = 0.2; body.add(shirt);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.012), mat("#1d2433", { roughness: 0.5 })); tie.position.set(0, 0.5, 0.205); body.add(tie);
  const mkArm = (side) => {
    const a = new THREE.Group(); a.position.set(0.33 * side, 0.61, 0); body.add(a);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.48, 6, 12), coat); up.position.y = -0.3; a.add(up);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), skin); hand.scale.set(0.9, 1.15, 0.7); hand.position.y = -0.62; a.add(hand);
    a.rotation.z = 0.1 * side; return a;
  };
  const armR = mkArm(-1), armL = mkArm(1);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 16), skin); neck.position.y = 1.55; g.add(neck);
  const head = new THREE.Group(); head.position.y = 1.78; g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 24), skin); skull.scale.set(0.95, 1.1, 0.98); head.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), skin); jaw.scale.set(1.05, 0.8, 1); jaw.position.set(0, -0.11, 0.04); head.add(jaw);
  // short dark hair, full on top with a side part (a slightly offset cap and a front sweep)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.218, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), hairM);
  hair.scale.set(1.0, 1.12, 1.02); hair.rotation.x = -0.35; hair.position.set(0, 0.03, -0.01); head.add(hair);
  const sweep = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 6, 12), hairM); sweep.rotation.z = Math.PI / 2 + 0.15; sweep.position.set(0.03, 0.17, 0.15); head.add(sweep);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), hairM); side.scale.set(0.45, 1.0, 1.25); side.position.set(0.195 * s, 0.06, -0.05); head.add(side);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), skin); ear.scale.set(0.45, 1, 0.75); ear.position.set(0.205 * s, -0.01, 0); head.add(ear);
    const brow = new THREE.Mesh(rbox(0.08, 0.022, 0.03, 0.01), hairM); brow.position.set(0.068 * s, 0.08, 0.195); brow.rotation.z = -0.08 * s; head.add(brow);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 10), mat("#1d1410", { roughness: 0.3 })); eye.scale.set(1.2, 0.8, 0.6); eye.position.set(0.066 * s, 0.04, 0.2); head.add(eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), mat("#d29f7e", { roughness: 0.6 })); nose.scale.set(1, 1.2, 1); nose.position.set(0, -0.015, 0.21); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.014, 0.01), mat("#7a3a30", { roughness: 0.5 })); mouth.position.set(0, -0.1, 0.185); head.add(mouth);
  g.add(contactShadow(1.0, 0.9));
  const pose = (t) => { body.scale.y = 1 + 0.01 * Math.sin(t * 2.4); head.rotation.y = 0.1 * Math.sin(t * 0.9); head.rotation.z = 0.025 * Math.sin(t * 1.3); };
  return { group: g, armR, armL, head, pose };
}
function wave(arm, k, t, side = -1) { arm.rotation.z = side * (0.1 + 2.5 * k) + side * 0.18 * k * Math.sin(t * 7); arm.rotation.x = -0.15 * k; }
function point(arm, k, t, side = -1) { arm.rotation.x = -1.35 * k + 0.08 * k * Math.sin(t * 5); arm.rotation.z = side * (0.1 + 0.25 * k); }

// Simple adult / child figures for the family (no faces). Origin: floor.
function makeFigure(color, h = 1.7) {
  const g = new THREE.Group(), k = h / 1.7, m = mat(color, { roughness: 0.6 });
  const legs = new THREE.Mesh(new THREE.CapsuleGeometry(0.1 * k, 0.6 * k, 6, 12), mat("#2a2a30")); legs.scale.x = 1.5; legs.position.y = 0.4 * k; g.add(legs);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17 * k, 0.42 * k, 6, 14), m); torso.position.y = 1.0 * k; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14 * k, 20, 14), mat("#d9a888", { roughness: 0.6 })); head.position.y = 1.5 * k; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.148 * k, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat("#3a2a20", { roughness: 0.9 })); hair.position.y = 1.52 * k; hair.rotation.x = -0.4; g.add(hair);
  g.add(contactShadow(0.8 * k, 0.8 * k)); return g;
}

// Hourglass with draining sand (setK(k): 0 full top → 1 all sand below). Origin: floor. Height ~1.5.
function makeHourglass() {
  const g = new THREE.Group(), wood = mat("#5a3a26", { roughness: 0.6 });
  for (const y of [0.05, 1.45]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32), wood); p.position.y = y; g.add(p); }
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 10), wood); r.position.set(Math.cos(a) * 0.42, 0.75, Math.sin(a) * 0.42); g.add(r); }
  const glassM = new THREE.MeshStandardMaterial({ color: "#d8ecff", emissive: "#5a7a9a", emissiveIntensity: 0.35, transparent: true, opacity: 0.42, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 32, 1, true), glassM); top.rotation.x = Math.PI; top.position.y = 1.1; g.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 32, 1, true), glassM); bot.position.y = 0.4; g.add(bot);
  const edgeM = new THREE.LineBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.55 });
  for (const c of [top, bot]) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ConeGeometry(0.34, 0.6, 12, 1, true), 1), edgeM); e.position.copy(c.position); e.rotation.copy(c.rotation); e.userData.decor = true; g.add(e); }
  const sandM = mat("#e8b04a", { roughness: 0.9 });
  const sTop = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 32), sandM); sTop.rotation.x = Math.PI; g.add(sTop);
  const sBot = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 32), sandM); g.add(sBot);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 8), sandM); stream.position.y = 0.67; g.add(stream);
  const setK = (k) => {
    k = clamp(k); const a = Math.max(0.001, 1 - k), b = Math.max(0.001, k);
    sTop.scale.set(a ** 0.5, a, a ** 0.5); sTop.position.y = 0.8 + 0.25 * a + 0.0;
    sBot.scale.set(b ** 0.5, b, b ** 0.5); sBot.position.y = 0.1 + 0.25 * b;
    stream.visible = k > 0.01 && k < 0.99;
  };
  setK(0); g.add(contactShadow(1.4, 1.4));
  return { group: g, setK };
}
// Magnifying glass: ring + glass + handle, lens facing +z. Origin: lens centre.
function makeMagnifier() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 48), mat("#2a2a2a", { roughness: 0.4 })); g.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.4, 40), new THREE.MeshStandardMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false })); g.add(glass);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.7, 16), mat("#6a4330")); handle.position.set(0.58, -0.58, 0); handle.rotation.z = Math.PI / 4; g.add(handle);
  return g;
}
// Judge's gavel and its strike block. Origin: head centre.
function makeGavel() {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.62, 24), mat("#5a3a26", { roughness: 0.5 })); head.rotation.x = Math.PI / 2; g.add(head);
  for (const z of [-0.26, 0.26]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24), mat("#c9a45a", { metalness: 0.6, roughness: 0.3 })); b.rotation.x = Math.PI / 2; b.position.z = z; g.add(b); }
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 14), mat("#6a4330")); h.rotation.z = Math.PI / 2; h.position.x = 0.7; g.add(h);
  return g;
}
function makeStrikeBlock(label = true) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.2, 40), mat("#5a3a26", { roughness: 0.5 })); b.position.y = 0.1; g.add(b);
  if (label) { const p = makePlate("STF", 0.62, 0.2, { bg: GOLD, fg: "#3a2416" }); p.position.set(0, 0.1, 0.56); g.add(p); }
  g.add(contactShadow(1.5, 1.5)); return g;
}
// Analog clock face standing on a small foot (face +z). setTime(h, m). Origin: floor.
function makeClockStand(r = 0.7) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.06, r + 0.06, 0.14, 48), mat("#2a2a2a", { roughness: 0.4, metalness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.y = r + 0.12; g.add(rim);
  const ct = canvasTex(256, 256, (x) => {
    x.fillStyle = "#f4e8da"; x.beginPath(); x.arc(128, 128, 126, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#3a2a20"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.fillRect(128 + Math.sin(a) * 104 - 5, 128 - Math.cos(a) * 104 - 5, 10, 10); }
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false })); face.position.set(0, r + 0.12, 0.072); g.add(face);
  const hm = mat("#1d1410");
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.06, r * 0.55, 0.02).translate(0, r * 0.27, 0), hm); hh.position.set(0, r + 0.12, 0.085); g.add(hh);
  const mh = new THREE.Mesh(new THREE.BoxGeometry(0.04, r * 0.8, 0.02).translate(0, r * 0.4, 0), mat(RED)); mh.position.set(0, r + 0.12, 0.095); g.add(mh);
  const foot = new THREE.Mesh(rbox(0.5, 0.12, 0.3, 0.03), mat("#2a2a2a")); foot.position.y = 0.06; g.add(foot);
  g.add(contactShadow(1.2, 0.8));
  const setTime = (h, m) => { mh.rotation.z = -m / 60 * Math.PI * 2; hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  setTime(10, 0); return { group: g, setTime };
}
// Tancredo Neves bridge (stylised): deck over a river, concrete arch under it, lamp posts, end signs.
// Deck along x from -L/2 to L/2, deck top at y = DECK. API { group, deckY, lamps[] }
function makeBridge(L = 9) {
  const g = new THREE.Group(), conc = mat("#9a948c", { roughness: 0.9 }), DECK = 1.6;
  const deck = new THREE.Mesh(rbox(L, 0.22, 1.6, 0.03), conc); deck.position.y = DECK - 0.11; g.add(deck);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(L, 1.1), mat("#3a3634", { roughness: 0.95 })); road.rotation.x = -Math.PI / 2; road.position.y = DECK + 0.002; g.add(road);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.04), new THREE.MeshBasicMaterial({ color: "#f5c400", toneMapped: false })); stripe.rotation.x = -Math.PI / 2; stripe.position.y = DECK + 0.004; g.add(stripe);
  for (const z of [-0.74, 0.74]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, 0.06), mat("#c9c3ba")); rail.position.set(0, DECK + 0.42, z); g.add(rail);
    for (let i = 0; i <= 18; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), mat("#c9c3ba")); p.position.set(-L / 2 + i * L / 18, DECK + 0.2, z); g.add(p); } }
  // arch: half torus under the deck
  const arch = new THREE.Mesh(new THREE.TorusGeometry(L * 0.36, 0.14, 10, 48, Math.PI), conc); arch.scale.y = 0.42; arch.position.y = DECK - 0.22 - L * 0.36 * 0.42 + 0.02; g.add(arch);
  for (let i = -3; i <= 3; i++) { const x = i * L * 0.36 / 3.6, yA = (DECK - 0.22 - L * 0.36 * 0.42) + Math.sqrt(Math.max(0, (L * 0.36) ** 2 - x * x)) * 0.42; const hgt = DECK - 0.22 - yA; if (hgt > 0.05) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, hgt, 0.5), conc); c.position.set(x, yA + hgt / 2, 0); g.add(c); } }
  const lamps = [];
  for (const x of [-L * 0.33, 0, L * 0.33]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.4, 10), mat("#2a2a2a")); pole.position.set(x, DECK + 0.7, -0.68); g.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), new THREE.MeshBasicMaterial({ color: "#ffd98a", toneMapped: false })); bulb.position.set(x, DECK + 1.42, -0.62); g.add(bulb); lamps.push(bulb);
  }
  for (const [x, t] of [[-L / 2 + 1.1, "BRASIL"], [L / 2 - 1.1, "ARGENTINA"]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 10), mat("#2a2a2a")); pole.position.set(x, DECK + 0.5, 0.68); g.add(pole);
    const p = makePlate(t, 2.4, 0.62, { bg: x < 0 ? "#2f8a4a" : "#3a7fc4", fg: "#ffffff" }); p.position.set(x, DECK + 1.25, 0.72); g.add(p);
  }
  return { group: g, deckY: DECK };
}
// Card payment terminal with a live screen (accept/deny). Origin: floor. API { group, setState(s) } s: "wait" | "ok" | "no"
function makeCardMachine() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.9, 1.5, 0.3, 0.1), mat("#2a2a2e", { roughness: 0.5 })); body.position.y = 0.75; body.rotation.x = -0.3; g.add(body);
  const ct = canvasTex(256, 200, null);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.56), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }));
  body.add(scr); scr.position.set(0, 0.36, 0.152);
  for (let i = 0; i < 12; i++) { const k = new THREE.Mesh(rbox(0.16, 0.1, 0.03, 0.02), mat("#4a4a52")); k.position.set(-0.22 + (i % 3) * 0.22, -0.08 - Math.floor(i / 3) * 0.14, 0.16); body.add(k); }
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.1), mat("#111")); slot.position.set(0, 0.75, 0.0); body.add(slot);
  let cur = "";
  const setState = (s) => {
    if (s === cur) return; cur = s;
    ct.paint((x, w, h) => {
      x.fillStyle = s === "ok" ? "#2fae66" : s === "no" ? "#e0261b" : "#24313c"; x.fillRect(0, 0, w, h);
      centerText(x, s === "ok" ? "✓" : s === "no" ? "✕" : "...", w / 2, h / 2 - 10, "900 120px Inter", "#ffffff");
      centerText(x, s === "ok" ? "APROVADO" : s === "no" ? "RECUSADO" : "INSIRA", w / 2, h - 30, "900 34px Inter", "#ffffff");
    });
  };
  setState("wait"); g.add(contactShadow(1.4, 1)); return { group: g, setState, body };
}
// Bank card (flat, face +z). Origin: centre.
function makeBankCard(color, label) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(rbox(1.0, 0.63, 0.03, 0.05), mat(color, { roughness: 0.4, metalness: 0.2 })); g.add(c);
  const chip = new THREE.Mesh(rbox(0.16, 0.12, 0.01, 0.02), mat(GOLD, { metalness: 0.7, roughness: 0.3 })); chip.position.set(-0.3, 0.06, 0.02); g.add(chip);
  const p = makePlate(label, 0.6, 0.15, { bg: color, fg: "#ffffff" }); p.position.set(0.12, -0.18, 0.016); g.add(p);
  return g;
}
// Letter on a stand (face +z): crest at the top, title line and text lines. paint(variant) swaps crest/title.
// Origin: floor. API { group, sheet, setVariant(v) } v: "antigo" | "novo"
function makeLetter() {
  const g = new THREE.Group();
  const easel = new THREE.Mesh(rbox(1.9, 0.12, 0.6, 0.03), mat(WOODC)); easel.position.y = 0.06; g.add(easel);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.08), mat(WOODC)); back.position.set(0, 1.1, -0.25); back.rotation.x = -0.18; g.add(back);
  const ct = canvasTex(600, 820, null);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.02), [mat(PAPER), mat(PAPER), mat(PAPER), mat(PAPER), new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false }), mat(PAPER)]);
  sheet.position.set(0, 1.22, -0.12); sheet.rotation.x = -0.18; g.add(sheet);
  let cur = "";
  const crest = (x, cx, cy, old) => {
    x.save(); x.translate(cx, cy);
    // branches (two arcs of leaves) behind a five-point star with a blue disc and white stars, like the national arms
    x.fillStyle = "#3a7a3a";
    for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) { const a = Math.PI / 2 + sd * (0.35 + i * 0.3); x.beginPath(); x.ellipse(Math.cos(a) * 82, Math.sin(a) * 70 + 8, 9, 18, a, 0, Math.PI * 2); x.fill(); }
    const star = (r1, r2) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); };
    star(78, 34); x.fillStyle = old ? "#2a7a3a" : "#2f8a4a"; x.fill(); x.strokeStyle = GOLD; x.lineWidth = 6; x.stroke();
    x.fillStyle = "#24479a"; x.beginPath(); x.arc(0, 2, 30, 0, Math.PI * 2); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 4; x.stroke();
    x.fillStyle = "#ffffff"; for (const [dx, dy] of [[0, -14], [-12, 4], [12, 4], [0, 16], [5, -2]]) { x.beginPath(); x.arc(dx, dy + 2, 3.5, 0, Math.PI * 2); x.fill(); }
    x.restore();
  };
  const setVariant = (v, hl = false) => {
    const key = v + (hl ? "+" : ""); if (key === cur) return; cur = key;
    ct.paint((x, w, h) => {
      x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
      crest(x, w / 2, 110, v === "antigo");
      const title = v === "antigo" ? "ESTADOS UNIDOS DO BRAZIL" : "REPÚBLICA FEDERATIVA DO BRASIL";
      x.fillStyle = "#2a2420"; x.font = "900 40px Inter"; x.textAlign = "center"; x.textBaseline = "middle";
      const fs = Math.min(40, 40 * (w - 60) / x.measureText(title).width); x.font = `900 ${fs}px Inter`;
      x.fillText(title, w / 2, 215);
      if (hl) { x.strokeStyle = ORANGE; x.lineWidth = 10; x.strokeRect(22, 18, w - 44, 230); }
      x.fillStyle = "#8a7a6a"; for (let i = 0; i < 9; i++) x.fillRect(70, 280 + i * 52, i % 3 === 2 ? 300 : 460, 14);
    });
  };
  setVariant("antigo"); g.add(contactShadow(2.4, 1.2));
  return { group: g, sheet, setVariant };
}
// Speech balloon (plate + tail) facing +z. Origin: centre.
function makeBalloon(text, { w = 2.2, h = 0.7, bg = CREAM, fg = INK } = {}) {
  const g = new THREE.Group();
  const p = makePlate(text, w, h, { bg, fg }); g.add(p);
  const sh = new THREE.Shape(); sh.moveTo(-0.15, 0); sh.lineTo(0.15, 0); sh.lineTo(-0.25, -0.35); sh.lineTo(-0.15, 0);
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), mat(bg)); tail.position.set(-w * 0.25, -h / 2 + 0.01, -0.015); g.add(tail);
  return g;
}
// Balance scale: post, beam (tilt with beam.rotation.z), two pans with what you put on them. Origin: floor.
function makeScale() {
  const g = new THREE.Group(), brass = mat(GOLD, { metalness: 0.6, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 32), mat("#3a2a20")); base.position.y = 0.075; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 16), brass); post.position.y = 1.15; g.add(post);
  const beam = new THREE.Group(); beam.position.y = 2.15; g.add(beam);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  const pans = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = 1.25 * s; beam.add(hang);
    for (const a of [0, 2.1, 4.2]) { const str = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.98, 6), brass); str.position.set(Math.cos(a) * 0.22, -0.44, Math.sin(a) * 0.22); str.rotation.set(-Math.sin(a) * 0.42, 0, Math.cos(a) * 0.42); hang.add(str); }
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.08, 32), brass); pan.position.y = -0.92; hang.add(pan);
    pans.push(hang);
  }
  g.add(contactShadow(1.6, 1.6));
  const setTilt = (a) => { beam.rotation.z = a; for (const p of pans) p.rotation.z = -a; };
  return { group: g, pans, setTilt };
}
// Megaphone (cone + handle), mouth toward +x. Origin: centre.
function makeMegaphone(color = ORANGE) {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.9, 32, 1, true), mat(color, { side: THREE.DoubleSide, roughness: 0.5 })); cone.rotation.z = -Math.PI / 2; g.add(cone);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 32), mat("#f4e8da")); rim.rotation.y = Math.PI / 2; rim.position.x = 0.45; g.add(rim);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 20), mat("#2a2a2a")); back.rotation.z = Math.PI / 2; back.position.x = -0.55; g.add(back);
  const handle = new THREE.Mesh(rbox(0.1, 0.4, 0.1, 0.03), mat("#2a2a2a")); handle.position.set(-0.35, -0.3, 0); g.add(handle);
  return g;
}
// Entry permit card standing on a foot (face +z): "EUA · ENTRADA" header and big "1 ANO". Origin: floor.
function makePermit() {
  const g = new THREE.Group();
  const card = new THREE.Mesh(rbox(1.6, 1.1, 0.05, 0.04), mat(PAPER)); card.position.y = 0.75; g.add(card);
  const hd = makePlate("AUTORIZAÇÃO · EUA", 1.4, 0.22, { bg: NAVY, fg: "#ffffff" }); hd.position.set(0, 1.12, 0.03); g.add(hd);
  const big = makePlate("1 ANO", 1.0, 0.42, { bg: PAPER, fg: NAVY }); big.position.set(0, 0.72, 0.03); g.add(big);
  const ln = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.01), mat("#8a7a6a")); ln.position.set(0, 0.4, 0.03); g.add(ln);
  const foot = new THREE.Mesh(rbox(1.0, 0.12, 0.4, 0.03), mat("#3a2a20")); foot.position.y = 0.06; g.add(foot);
  g.add(contactShadow(2, 1)); return g;
}
// Document folder standing on its bottom edge with printed label (from civic.js style), plus a "?" plate option.
function makeLabelFolder(label, { w = 1.1, h = 1.3, color = "#e8c27a" } = {}) {
  const g = new THREE.Group(), m = mat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, h, 0.07, 0.03), m); body.position.y = h / 2 + 0.12; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.36, 0.12, 0.05, 0.02), m); tab.position.set(-w * 0.24, h + 0.18, 0); g.add(tab);
  const p = makePlate(label, w * 0.88, h * 0.26, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h * 0.55 + 0.12, 0.05); g.add(p);
  const foot = new THREE.Mesh(rbox(w * 0.9, 0.12, 0.4, 0.03), mat("#3a2a20")); foot.position.y = 0.06; g.add(foot);
  g.add(contactShadow(w + 0.6, 1)); return g;
}
// Ballot scoreboard: two columns with percentages (setK grows them). Origin: floor.
function makeScoreboard() {
  const g = new THREE.Group();
  const panel = new THREE.Mesh(rbox(2.8, 2.0, 0.2, 0.06), mat("#1d1d22", { roughness: 0.6 })); panel.position.y = 1.2; g.add(panel);
  const legs = [-1.1, 1.1].map((x) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.12), mat("#2a2a2a")); l.position.set(x, 0.15, 0); g.add(l); return l; });
  const bars = [];
  for (const [x, c, lab, pct] of [[-0.6, RED, "LULA", "51,8%"], [0.6, "#2f6bbf", "FLÁVIO", "48,2%"]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.1).translate(0, 0.5, 0), mat(c, { emissive: c, emissiveIntensity: 0.2 })); b.position.set(x, 0.55, 0.12); g.add(b); bars.push(b);
    const n = makePlate(lab, 0.9, 0.2, { bg: "#1d1d22", fg: "#ffffff" }); n.position.set(x, 0.4, 0.11); g.add(n);
    const p = makePlate(pct, 0.9, 0.26, { bg: "#1d1d22", fg: c === RED ? "#ff8a7a" : "#9cc2ff" }); p.position.set(x, 1.95, 0.11); g.add(p);
  }
  const setK = (k) => { bars[0].scale.y = Math.max(0.001, 1.25 * k); bars[1].scale.y = Math.max(0.001, 1.16 * k); };
  setK(0); g.add(contactShadow(3.4, 1.2)); return { group: g, setK };
}

// Shared shot helper per scene.
const shotOf = (anim) => (objs, t0, t1, o = {}) => CAM.pose(envelope(objs, anim, t0, t1), Object.assign({ zone: "stage", from: [0.15, 0.4, 1], pull: 1.08 }, o));
const NIGHT = () => { key.color.set("#8fa6d8"); key.intensity = 1.2; hemi.intensity = 0.35; };
// Pop an object in while keeping its bottom on the support (halfH = half height at scale 1).
function popOn(obj, t, at, d, base, topY, halfH, until = Infinity) { popIn(obj, t, at, d, base, until); obj.position.y = topY + halfH * obj.scale.y; }
// Small upright check / cross plate (on a short post) to put over an object.
function makeMark(ok) { const p = makePlate(ok ? "✓" : "✕", 0.5, 0.5, { bg: ok ? GREEN : RED, fg: "#ffffff" }); return p; }

// ---------------------------------------------------------------- 1. gancho (0 – 5.15)
// "Proibido de sair do Brasil, como Flávio Bolsonaro chegou aos Estados Unidos?"
addScene("gancho", 0, 5.15, (S) => {
  const jet = makeJet(); jet.scale.setScalar(0.75); S.add(jet);
  const stand = new THREE.Mesh(rbox(1.2, 0.24, 0.6, 0.04), mat("#3a2a20")); stand.position.set(0, 0.12, 0.9); S.add(stand);
  const pp = makePassport("BRASIL"); pp.group.scale.setScalar(1.7); pp.group.position.set(0, 0.24 + 0.625 * 1.7, 0.9); S.add(pp.group);
  S.hero(pp.group, "passaporte brasileiro"); S.hero(jet, "jato executivo", { when: (t) => t > 2.8 });
  S.solid(stand, "suporte"); S.solid(pp.group, "passaporte", { restsOn: ["suporte"] });
  const anim = (t) => {
    pp.stampMark(lin(t, 0.8, 1.05));
    // the jet climbs across the sky above the passport (never behind it)
    const k = lin(t, 2.4, 5.15);
    jet.position.set(lerp(-1.0, 1.1, k), 2.8 + 0.4 * k, -1.2);
    jet.rotation.z = 0.18; popIn(jet, t, 2.4, 0.35, 0.75);
  };
  const shot = shotOf(anim);
  const A0 = shot([pp.group, stand], 0, 2.2, { from: [-0.2, 0.25, 1], pull: 1.08 }), A1 = shot([pp.group, stand], 0, 2.2, { from: [0.05, 0.2, 1], pull: 1.02 });
  const B0 = shot([pp.group, jet], 2.2, 5.15, { from: [0.05, 0.3, 1], pull: 1.0 }), B1 = shot([pp.group, jet], 2.2, 5.15, { from: [0.2, 0.26, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const hit = t > 1.05 ? 1 - lin(t, 1.05, 2.0) : 0;
    fill.color.set(RED); fill.position.set(0, 1.8, 2.4); fill.intensity = 2 + 6 * hit;
    CAM.apply(CAM.shake(CAM.track(t, [[0, A0], [2.0, A1, 2.0], [2.8, B0, 0.8], [5.15, B1, 2.3]]), t, 1.05, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 2. eleição (5.15 – 9.45)
// "Domingo, vinte e cinco de outubro: Lula vence o segundo turno."
addScene("eleicao", 5.15, 9.45, (S) => {
  const sb = makeScoreboard(); S.add(sb.group);
  S.hero(sb.group, "placar do segundo turno"); S.solid(sb.group, "placar");
  const anim = (t) => { popIn(sb.group, t, 5.15, 0.4); sb.setK(eOut(lin(t, 5.6, 7.4))); };
  const shot = shotOf(anim);
  const A0 = shot([sb.group], 5.6, 9.45, { from: [-0.3, 0.2, 1], pull: 1.12 });
  const A1 = shot([sb.group], 5.6, 9.45, { from: [0.15, 0.15, 1], pull: 1.03 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 1.6, 2.2); fill.intensity = 3 * sm(t, 5.6, 7.4);
    CAM.apply(CAM.blend(A0, A1, sm(t, 5.15, 9.45)));
  };
});

// ---------------------------------------------------------------- 3. ordem do STF (9.45 – 20.25)
// "Logo depois, o ministro Alexandre de Moraes manda Flávio entregar os passaportes em vinte e quatro horas,
//  num inquérito sobre suposta lavagem de dinheiro. Ele nega irregularidades."
addScene("ordem", 9.45, 20.25, (S) => {
  const block = makeStrikeBlock(); block.position.set(-1.6, 0, 0.2); S.add(block);
  const gavel = makeGavel(); S.add(gavel);
  const hg = makeHourglass(); hg.group.position.set(0.55, 0, 0); S.add(hg.group);
  const p1 = makePassport("BRASIL"), p2 = makePassport("BRASIL", { color: "#8a1c22" });
  const base = new THREE.Mesh(rbox(2.6, 0.42, 0.55, 0.03), mat("#3a2a20")); base.position.set(2.5, 0.21, 0.1); S.add(base);
  const tags3 = [["COMUM", 1.9], ["DIPLOMÁTICO", 3.1]].map(([t, x]) => { const p = makePlate(t, 1.15, 0.38, { bg: CREAM, fg: INK }); p.position.set(x - 2.5, 0, 0.29); base.add(p); return p; });
  p1.group.scale.setScalar(1.25); p2.group.scale.setScalar(1.25); p1.group.position.set(1.9, 0.42 + 0.78, 0.1); p2.group.position.set(3.1, 0.42 + 0.78, 0.1); S.add(p1.group, p2.group);
  S.hero(block, "base do martelo do STF", { when: (t) => t < 13.2 }); S.hero(gavel, "martelo", { when: (t) => t < 13.2 });
  S.hero(hg.group, "ampulheta de 24 horas", { when: (t) => t > 14.0 });
  S.hero(p1.group, "passaporte comum", { when: (t) => t > 13.9 }); S.hero(base, "suporte COMUM / DIPLOMÁTICO", { when: (t) => t > 13.9 }); S.hero(p2.group, "passaporte diplomático", { when: (t) => t > 13.9 });
  S.solid(block, "base"); S.solid(hg.group, "ampulheta"); S.solid(base, "suporte"); S.solid(p1.group, "passaporte 1", { restsOn: ["suporte"] }); S.solid(p2.group, "passaporte 2", { restsOn: ["suporte"] });
  const HIT = [10.5, 12.19];
  const anim = (t) => {
    let lift = 0;
    for (const h of HIT) if (t > h - 0.7 && t <= h) lift = Math.max(lift, t < h - 0.2 ? sm(t, h - 0.7, h - 0.3) : 1 - eOut(lin(t, h - 0.2, h)));
    gavel.position.set(-1.6 + 0.15, 0.2 + 0.17 + 0.6 * lift, 0.2); gavel.rotation.set(0, -Math.PI / 2 + 0.35, 0.5 * lift);
    popIn(base, t, 13.3, 0.35); popOn(p1.group, t, 13.4, 0.4, 1.25, 0.42, 0.625); popOn(p2.group, t, 13.55, 0.4, 1.25, 0.42, 0.625);
    popIn(hg.group, t, 14.3, 0.4); hg.setK(0.04 + 0.5 * lin(t, 14.7, 20.25));
  };
  const shot = shotOf(anim);
  const A0 = shot([block, gavel], 9.45, 13.2, { from: [-0.2, 0.4, 1], pull: 1.03 }), A1 = shot([block, gavel], 9.45, 13.2, { from: [0.15, 0.36, 1], pull: 1.0 });
  const B0 = shot([hg.group, base, p1.group, p2.group], 13.2, 20.25, { from: [0.1, 0.32, 1], pull: 1.06 }), B1 = shot([hg.group, base, p1.group, p2.group], 13.2, 20.25, { from: [0.28, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    let hit = 0; for (const h of HIT) if (t > h) hit = Math.max(hit, 1 - lin(t, h, h + 0.8));
    fill.color.set(ORANGE); fill.position.set(-1.4, 2.0, 1.4); fill.intensity = 2 + 6 * hit;
    let p = CAM.track(t, [[9.45, A0], [13.25, A1, 3.7], [13.5, B0, 0.2], [20.25, B1, 6.7]]);
    for (const h of HIT) p = CAM.shake(p, t, h, 0.05, 0.35);
    CAM.apply(p);
  };
});

// ---------------------------------------------------------------- 4. o vídeo e o prazo (20.25 – 29.8)
// "Segunda, ele grava um vídeo: 'Vou entregar os meus passaportes.' Terça, onze da manhã, o prazo vence,
//  e a Polícia Federal cancela os documentos."
addScene("video", 20.25, 29.8, (S) => {
  const fl = makeFlavio(); fl.group.position.set(-0.7, 0, 0); S.add(fl.group);
  const ph = makePhone(); S.add(ph.group);
  const tri = new THREE.Group(); tri.position.set(0.9, 0, 0.6); S.add(tri);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.25, 8), mat("#2a2a2a")); l.position.set(Math.cos(a) * 0.18, 0.6, Math.sin(a) * 0.18); l.rotation.set(Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15); tri.add(l); }
  ph.group.position.set(0.9, 1.25 + 0.82, 0.6); ph.group.rotation.y = -0.55;
  const drawPhone = (rec) => { const x = ph.ctx; x.fillStyle = "#1b2a33"; x.fillRect(0, 0, 720, 1500);
    x.fillStyle = "#2c3442"; x.beginPath(); x.ellipse(360, 900, 210, 330, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = "#e0b08e"; x.beginPath(); x.arc(360, 520, 120, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#2a2420"; x.beginPath(); x.arc(360, 480, 124, Math.PI, 0); x.fill();
    x.fillStyle = "#1d1410"; for (const ex of [315, 405]) { x.beginPath(); x.ellipse(ex, 520, 14, 10, 0, 0, Math.PI * 2); x.fill(); }
    x.fillRect(325, 588, 70, 10); x.fillStyle = "#dfe8f5"; x.beginPath(); x.moveTo(320, 640); x.lineTo(400, 640); x.lineTo(360, 760); x.fill();
    if (rec) { x.fillStyle = "#e0261b"; x.beginPath(); x.arc(110, 120, 34, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = "#ffffff"; x.font = "900 72px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("REC", 170, 124); ph.tex.needsUpdate = true; };
  let lastRec = null;
  // second set: clock 11:00, hourglass running out, the two passports
  const clock = makeClockStand(0.75); clock.group.position.set(-1.8, 0, 0); clock.setTime(11, 0); S.add(clock.group);
  const hg = makeHourglass(); hg.group.position.set(0, 0, 0); S.add(hg.group);
  const base = new THREE.Mesh(rbox(2.6, 0.42, 0.55, 0.03), mat("#3a2a20")); base.position.set(2.0, 0.21, 0.1); S.add(base);
  const p1 = makePassport("BRASIL"), p2 = makePassport("BRASIL", { color: "#8a1c22" });
  p1.group.scale.setScalar(1.25); p2.group.scale.setScalar(1.25); p1.group.position.set(1.4, 0.42 + 0.78, 0.1); p2.group.position.set(2.6, 0.42 + 0.78, 0.1); S.add(p1.group, p2.group);
  const setB = new THREE.Group(); setB.add(clock.group, hg.group, base, p1.group, p2.group); S.add(setB);
  const T2 = 24.4;
  S.hero(fl.group, "Flávio (figura 3D)", { when: (t) => t < T2 }); S.hero(ph.group, "celular gravando", { when: (t) => t < T2 });
  S.hero(clock.group, "relógio 11h", { when: (t) => t > T2 + 0.3 }); S.hero(hg.group, "ampulheta vazia", { when: (t) => t > T2 + 0.3 });
  S.hero(p1.group, "passaporte comum cancelado", { when: (t) => t > 28.6 }); S.hero(p2.group, "passaporte diplomático cancelado", { when: (t) => t > 28.6 });
  S.solid(fl.group, "Flávio"); S.solid(tri, "tripé");
  S.solid(clock.group, "relógio"); S.solid(hg.group, "ampulheta"); S.solid(base, "suporte"); S.solid(p1.group, "passaporte 1", { restsOn: ["suporte"] }); S.solid(p2.group, "passaporte 2", { restsOn: ["suporte"] });
  const anim = (t) => {
    fl.pose(t); point(fl.armL, sm(t, 22.2, 22.6) * (1 - sm(t, 23.9, 24.3)), t, 1);
    const rec = Math.floor(t * 2) % 2 === 0; if (rec !== lastRec) { drawPhone(rec); lastRec = rec; }
    const showA = t < T2; fl.group.visible = showA; ph.group.visible = showA; tri.visible = showA;
    setB.visible = !showA;
    clock.setTime(10, 52 + 8 * eOut(lin(t, T2 + 0.4, 25.6)));
    hg.setK(0.75 + 0.25 * lin(t, T2, 26.7));
    p1.stampMark(lin(t, 28.38, 28.6)); p2.stampMark(lin(t, 28.5, 28.72));
  };
  const shot = shotOf(anim);
  const A0 = shot([fl.group, ph.group, tri], 20.25, T2 - 0.05, { from: [0.35, 0.25, 1], pull: 1.1 }), A1 = shot([fl.group, ph.group, tri], 20.25, T2 - 0.05, { from: [0.1, 0.2, 1], pull: 1.03 });
  const B0 = shot([clock.group, hg.group, base, p1.group, p2.group], T2, 29.8, { from: [-0.2, 0.3, 1], pull: 1.08 }), B1 = shot([clock.group, hg.group, base, p1.group, p2.group], T2, 29.8, { from: [0.15, 0.28, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    const hit = t > 28.4 ? 1 - lin(t, 28.4, 29.3) : 0;
    fill.color.set(t > 28.3 ? RED : ORANGE); fill.position.set(1.6, 1.8, 1.8); fill.intensity = t < T2 ? 2.5 : 1.5 + 6 * hit;
    CAM.apply(CAM.shake(t < T2 ? CAM.blend(A0, A1, sm(t, 20.25, T2)) : CAM.blend(B0, B1, sm(t, T2, 29.8)), t, 28.4, 0.05, 0.4));
  };
});

// ---------------------------------------------------------------- 5. a ponte, 22h50 (29.8 – 40.25)
// "Imagina: você está na ponte entre Foz do Iguaçu e a Argentina. Vinte e duas e cinquenta:
//  atravessam um senador, a esposa e as duas filhas, segundo a imigração argentina."
addScene("ponte", 29.8, 40.25, (S) => {
  const br = makeBridge(9); S.add(br.group);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 3.2), mat("#10262e", { roughness: 0.3, metalness: 0.2 })); river.rotation.x = -Math.PI / 2; river.position.y = 0.01; river.userData.decor = true; S.add(river);
  for (const sd of [-1, 1]) { const bank = new THREE.Mesh(rbox(2.2, 1.5, 3.4, 0.06), mat(sd < 0 ? "#2f5a34" : "#35603a", { roughness: 0.95 })); bank.position.set(sd * 5.4, 0.75, 0); bank.userData.decor = true; S.add(bank); }
  const fam = [makeFigure("#3f5a8a", 1.75), makeFigure("#b0566e", 1.62), makeFigure("#3a9faa", 1.25), makeFigure("#e0a040", 1.1)];
  const famG = new THREE.Group(); fam.forEach((f) => famG.add(f)); S.add(famG);
  S.hero(br.group, "ponte entre Foz e Puerto Iguazú", { when: (t) => t < 35.2 }); S.hero(famG, "família na ponte", { when: (t) => t > 35.6 });
  S.solid(br.group, "ponte");
  const T0 = 35.29, T1 = 40.25;
  const anim = (t) => {
    const k = lin(t, T0, T1 + 1.5);
    fam.forEach((f, i) => {
      popIn(f, t, T0 - 0.3 + i * 0.12, 0.35);
      f.position.set(lerp(-3.4, 1.4, k) - i * 0.55, br.deckY, i % 2 ? 0.22 : -0.18);
      f.position.y += 0.03 * Math.abs(Math.sin((t + i) * 6));
    });
  };
  const shot = shotOf(anim);
  const A0 = shot([br.group], 29.8, 35.2, { from: [-0.55, 0.32, 1], pull: 1.12 }), A1 = shot([br.group], 29.8, 35.2, { from: [-0.15, 0.28, 1], pull: 1.03 });
  const B0 = shot([famG], 35.25, 37.8, { from: [0.35, 0.3, 1], pull: 1.0 }), B1 = shot([famG], 37.6, 40.25, { from: [0.2, 0.28, 1], pull: 1.0 });
  return (t) => {
    anim(t); NIGHT(); key.intensity = 1.9; hemi.intensity = 0.6;
    fill.color.set("#ffd98a"); fill.position.set(famG.children[0].position.x, 3.0, 1.2); fill.intensity = 5;
    CAM.apply(CAM.track(t, [[29.8, A0], [35.0, A1, 5.2], [35.4, B0, 0.3], [40.25, B1, 4.0]]));
  };
});

// ---------------------------------------------------------------- 6. passaporte italiano = cartão de outro banco (40.25 – 51.5)
// "Mas os passaportes não estavam cancelados? Flávio também é italiano, e segundo a CNN usou o passaporte da Itália.
//  É como um cartão bloqueado: o de outro banco continua passando."
addScene("passaporte", 40.25, 51.5, (S) => {
  const base = new THREE.Mesh(rbox(2.6, 0.18, 0.7, 0.04), mat("#3a2a20")); base.position.y = 0.09; S.add(base);
  const br = makePassport("BRASIL"); br.group.scale.setScalar(1.2); br.group.position.set(-0.7, 0.18 + 0.75, 0); S.add(br.group);
  const it = makePassport("ITALIA", { color: BORDO, sub: "PASSAPORTO" }); it.group.scale.setScalar(1.2); it.group.position.set(0.7, 0.18 + 0.75, 0); S.add(it.group);
  const mx = makeMark(false); mx.position.set(-0.7, 2.05, 0.1); S.add(mx);
  const mo = makeMark(true); mo.position.set(0.7, 2.05, 0.1); S.add(mo);
  const setA = new THREE.Group(); setA.add(base, br.group, it.group, mx, mo); S.add(setA);
  const cm = makeCardMachine(); cm.group.scale.setScalar(1.25); S.add(cm.group);
  const cBR = makeBankCard(NAVY, "BRASIL"), cIT = makeBankCard(BORDO, "ITÁLIA"); S.add(cBR, cIT);
  const T2 = 47.75;
  S.hero(br.group, "passaporte brasileiro cancelado", { when: (t) => t < T2 }); S.hero(it.group, "passaporte italiano", { when: (t) => t > 43.4 && t < T2 });
  S.hero(cm.body, "maquininha de cartão", { when: (t) => t > T2 + 0.2 });
  S.solid(base, "suporte"); S.solid(br.group, "passaporte BR", { restsOn: ["suporte"] }); S.solid(it.group, "passaporte IT", { restsOn: ["suporte"] }); S.solid(cm.group, "maquininha");
  const anim = (t) => {
    const showA = t < T2; setA.visible = showA; cm.group.visible = !showA;
    br.stampMark(1); popIn(mx, t, 41.5, 0.35); popOn(it.group, t, 42.95, 0.45, 1.2, 0.18, 0.625); popIn(mo, t, 46.5, 0.35);
    // cards: the Brazilian card goes in and is refused, then the Italian card goes in and is approved
    const slot = new V3(0, 1.47 * 1.25, -0.22 * 1.25);
    const inA = sm(t, 48.0, 48.5), outA = sm(t, 49.0, 49.4), inB = sm(t, 49.6, 50.2);
    cBR.visible = !showA && t < 49.45; cIT.visible = !showA && t > 49.3;
    const cardAt = (c, side, k, out) => { const dn = sm(k, 0.6, 1); c.position.set(side * 0.55 * (1 - Math.min(1, k / 0.6)), slot.y + 0.6 - 0.45 * dn + 0.45 * out, slot.z); c.rotation.set(0, 0, Math.PI / 2); };
    cardAt(cBR, -1, inA, outA); cardAt(cIT, 1, inB, 0);
    cm.setState(t > 50.4 ? "ok" : t > 48.6 && t < 49.5 ? "no" : "wait");
  };
  const shot = shotOf(anim);
  const A0 = shot([base, br.group, it.group, mx, mo], 40.25, T2 - 0.05, { from: [-0.25, 0.25, 1], pull: 1.1 }), A1 = shot([base, br.group, it.group, mx, mo], 40.25, T2 - 0.05, { from: [0.15, 0.22, 1], pull: 1.03 });
  const B0 = shot([cm.group, cBR, cIT], T2, 51.5, { from: [-0.15, 0.45, 1], pull: 1.03 }), B1 = shot([cm.group, cBR, cIT], T2, 51.5, { from: [0.12, 0.42, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const ok = t > 50.4, no = t > 48.6 && t < 49.5;
    fill.color.set(t < T2 ? (t > 46.5 ? GREEN : RED) : ok ? GREEN : no ? RED : ORANGE); fill.position.set(0, 1.8, 2.0); fill.intensity = 3;
    CAM.apply(t < T2 ? CAM.blend(A0, A1, sm(t, 40.25, T2)) : CAM.blend(B0, B1, sm(t, T2, 51.5)));
  };
});

// ---------------------------------------------------------------- 7. a PF investiga a rota (51.5 – 58.4)
// "Como ele passou pelo lado brasileiro sem ser barrado, ninguém explicou. A Polícia Federal investiga quem ajudou."
addScene("investiga", 51.5, 58.4, (S) => {
  const m = makeMap({ lon0: -63, lon1: -41, lat0: -30, lat1: -10, px: 40, labels: [["BRASÍLIA", -47.9, -14.2, 44, "#3a2a20"], ["FOZ DO IGUAÇU", -53.2, -27.0, 40, "#3a2a20"], ["PARAGUAI", -58.6, -22.8, 40, "#3a2a20"], ["ARGENTINA", -58.8, -29.0, 40, "#3a2a20"]] });
  S.add(m.group);
  const bsb = makePin3D(RED, 1.3); bsb.position.copy(m.pt(-47.9, -15.8)); S.add(bsb);
  const foz = makePin3D(RED, 1.3); foz.position.copy(m.pt(-54.6, -25.5)); S.add(foz);
  const road = makeRoute([m.pt(-47.9, -15.8, 0.03), m.pt(-50.5, -19.5, 0.03), m.pt(-52.0, -23.0, 0.03), m.pt(-54.6, -25.5, 0.03)], { color: ORANGE, r: 0.06, dashed: true }); S.add(road.mesh);
  const qs = [0.3, 0.55, 0.8].map((u) => { const q = makePlate("?", 0.36, 0.42, { bg: RED, fg: "#ffffff" }); const p = road.curve.getPoint(u); q.position.set(p.x + 0.45, 0.5, p.z); q.rotation.x = -0.4; S.add(q); return q; });
  const mag = makeMagnifier(); mag.scale.setScalar(1.6); mag.rotation.x = -1.1; S.add(mag);
  S.hero(m.group, "mapa Brasília–Foz do Iguaçu");
  S.solid(m.group, "mapa");
  const anim = (t) => {
    road.setDraw(lin(t, 51.7, 53.6));
    qs.forEach((q, i) => popIn(q, t, 54.0 + i * 0.25, 0.35));
    const u = lin(t, 55.8, 58.4); const p = road.curve.getPoint(clamp(0.15 + 0.75 * u));
    mag.visible = t > 55.6; mag.position.set(p.x - 0.4, 0.9, p.z + 0.4);
  };
  const shot = shotOf(anim);
  const A0 = shot([m.group, bsb, foz], 51.5, 58.4, { from: [-0.1, 1.2, 0.85], pull: 1.08 }), A1 = shot([m.group, bsb, foz], 51.5, 58.4, { from: [0.1, 1.15, 0.9], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.5, 1.0); fill.intensity = 2;
    CAM.apply(CAM.blend(A0, A1, sm(t, 51.5, 58.4)));
  };
});

// ---------------------------------------------------------------- 8. o voo (58.4 – 67.25)
// "Quarenta minutos depois, um jato decola. Parada pra abastecer no Equador... e, às dez e vinte da manhã de quarta, pouso perto de Miami."
addScene("voo", 58.4, 67.25, (S) => {
  const m = makeMap(); S.add(m.group);
  const P_IGU = [-54.6, -25.6], P_GYE = [-79.9, -2.2], P_MIA = [-80.3, 25.9], P_BSB = [-47.9, -15.8];
  const pins = [P_BSB, P_IGU, P_GYE, P_MIA].map(([lo, la], i) => { const p = makePin3D(i === 3 ? GREEN : RED, 1.4); p.position.copy(m.pt(lo, la)); S.add(p); return p; });
  const road = makeRoute([m.pt(...P_BSB, 0.02), m.pt(-51, -21, 0.02), m.pt(...P_IGU, 0.02)], { color: ORANGE, r: 0.035, dashed: true, segs: 60 }); road.setDraw(1); S.add(road.mesh);
  const arc = (a, b, hgt) => { const A = m.pt(...a, 0.05), B = m.pt(...b, 0.05), M = A.clone().lerp(B, 0.5); M.y += hgt; return [A, A.clone().lerp(M, 0.5).setY(A.y + hgt * 0.75), M, M.clone().lerp(B, 0.5).setY(B.y + hgt * 0.75), B]; };
  const leg1 = makeRoute(arc(P_IGU, P_GYE, 0.9), { color: "#ffd36b", r: 0.04 }), leg2 = makeRoute(arc(P_GYE, P_MIA, 1.0), { color: "#ffd36b", r: 0.04 });
  S.add(leg1.mesh, leg2.mesh);
  const jet = makeJet(); jet.scale.setScalar(0.32); S.add(jet);
  const fuel = makePlate("ABASTECE", 1.6, 0.46, { bg: ORANGE, fg: "#ffffff" }); const gq = m.pt(...P_GYE); fuel.position.set(gq.x - 1.35, 0.6, gq.z + 0.3); fuel.rotation.x = -0.5; S.add(fuel);
  S.hero(m.group, "mapa das Américas com a rota");
  S.solid(m.group, "mapa");
  const tan = new V3(), X = new V3(1, 0, 0);
  const place = (curve, u) => { curve.getPoint(u, jet.position); curve.getTangent(Math.min(0.999, Math.max(0.001, u)), tan); jet.quaternion.setFromUnitVectors(X, tan.normalize()); };
  const anim = (t) => {
    const u1 = sm(t, 60.3, 62.4), u2 = sm(t, 63.3, 66.7);
    leg1.setDraw(u1); leg2.setDraw(u2);
    if (t < 63.3) place(leg1.curve, u1); else place(leg2.curve, u2);
    jet.visible = t > 59.9;
    popIn(fuel, t, 61.7, 0.35, 1, 63.6);
    pins.forEach((p, i) => { p.scale.setScalar(1 + 0.25 * (i === 2 && t > 62.4 && t < 63.3 ? Math.sin(t * 12) * 0.5 + 0.5 : 0) + 0.3 * (i === 3 && t > 66.7 ? 1 - lin(t, 66.7, 67.2) : 0)); });
  };
  const shot = shotOf(anim);
  const A0 = shot([m.group, jet], 58.4, 67.25, { from: [0.05, 1.3, 0.8], pull: 1.08 }), A1 = shot([m.group, jet], 58.4, 67.25, { from: [-0.08, 1.2, 0.95], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set("#ffd36b"); fill.position.copy(jet.position).add(new V3(0, 1.2, 0.6)); fill.intensity = 2.5;
    CAM.apply(CAM.blend(A0, A1, sm(t, 58.4, 67.25)));
  };
});

// ---------------------------------------------------------------- 9. autorização de um ano; asilo não confirmado (67.25 – 72.55)
// "Os Estados Unidos deram à família uma autorização de um ano. Asilo? Não confirmado."
addScene("autorizacao", 67.25, 72.55, (S) => {
  const pm = makePermit(); pm.position.set(-0.9, 0, 0); pm.scale.setScalar(1.15); S.add(pm);
  const fd = makeLabelFolder("ASILO", { color: "#e8c27a" }); fd.position.set(1.0, 0, 0); S.add(fd);
  const q = makePlate("?", 0.5, 0.6, { bg: RED, fg: "#ffffff" }); q.position.set(1.0, 1.95, 0.1); S.add(q);
  S.hero(pm, "autorização de 1 ano"); S.hero(fd, "pasta ASILO", { when: (t) => t > 71.2 });
  S.solid(pm, "autorização"); S.solid(fd, "pasta");
  const anim = (t) => { popIn(pm, t, 67.4, 0.45, 1.15); popIn(fd, t, 70.87, 0.4); popIn(q, t, 71.72, 0.35); };
  const shot = shotOf(anim);
  const A0 = shot([pm, fd, q], 67.25, 72.55, { from: [-0.2, 0.28, 1], pull: 1.04 }), A1 = shot([pm, fd, q], 67.25, 72.55, { from: [0.12, 0.25, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    fill.color.set(t > 71.7 ? RED : "#9cc2ff"); fill.position.set(0, 1.8, 2.0); fill.intensity = 3;
    CAM.apply(CAM.blend(A0, A1, sm(t, 67.25, 72.55)));
  };
});

// ---------------------------------------------------------------- 10. a carta (72.55 – 88.65)
// "No mesmo dia, uma carta. A primeira versão o chamava de 'verdadeiro presidente eleito do Brasil', falava em fraude
//  sem provas e trazia o brasão antigo: 'Estados Unidos do Brazil'. Minutos depois, foi trocada por outra, em que ele se diz 'líder'."
addScene("carta", 72.55, 88.65, (S) => {
  const lt = makeLetter(); S.add(lt.group);
  S.hero(lt.group, "carta com brasão");
  S.solid(lt.group, "carta");
  const FLIP = 85.6;
  const anim = (t) => {
    popIn(lt.group, t, 72.7, 0.45);
    const f = sm(t, FLIP, FLIP + 0.6);
    lt.sheet.rotation.y = Math.PI * 2 * f;
    lt.setVariant(f > 0.25 ? "novo" : "antigo", f <= 0.25 && t > 81.65 && t < 85.5);
  };
  const shot = shotOf(anim);
  const A0 = shot([lt.group], 72.55, 88.65, { from: [-0.3, 0.25, 1], pull: 1.08 }), A1 = shot([lt.group], 72.55, 88.65, { from: [0.0, 0.2, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(t > 81.6 && t < 85.5 ? "#7fd18f" : ORANGE); fill.position.set(0, 2.2, 2.0); fill.intensity = 2.5;
    CAM.apply(CAM.track(t, [[72.55, A0], [85.6, A1, 13.0], [88.65, A0, 3.0]]));
  };
});

// ---------------------------------------------------------------- 11. a frase e a PF (88.65 – 97.25)
// "Ele escreveu: 'Saí do Brasil, mas não abandonei os brasileiros.' A Polícia Federal diz que, por enquanto, a viagem não caracteriza fuga."
addScene("frase", 88.65, 97.25, (S) => {
  const fl = makeFlavio(); fl.group.position.set(-1.05, 0, 0.3); fl.group.scale.setScalar(1.15); S.add(fl.group);
  const sc = makeScale(); sc.group.position.set(0.95, 0, -0.1); sc.group.scale.setScalar(0.8); S.add(sc.group);
  const tagL = makePlate("CARTA", 0.95, 0.4, { bg: CREAM, fg: INK }); tagL.position.set(0, -0.76, 0.0); sc.pans[0].add(tagL);
  const tagR = makePlate("PF", 0.95, 0.4, { bg: "#2a3a5a", fg: "#ffffff" }); tagR.position.set(0, -0.76, 0.0); sc.pans[1].add(tagR);
  S.hero(fl.group, "Flávio (figura 3D)"); S.hero(sc.group, "balança");
  S.solid(fl.group, "Flávio"); S.solid(sc.group, "balança");
  const anim = (t) => {
    fl.pose(t); wave(fl.armR, sm(t, 89.7, 90.1) * (1 - sm(t, 92.2, 92.7)), t);
    popIn(sc.group, t, 88.4, 0.4, 0.8); popIn(tagL, t, 89.7, 0.3); popIn(tagR, t, 93.1, 0.3);
    sc.setTilt(0.12 * Math.sin((t - 88.65) * 1.6) * (1 - 0.6 * sm(t, 93.0, 97.0)));
  };
  const shot = shotOf(anim);
  const A0 = shot([fl.group, sc.group], 88.65, 97.25, { from: [-0.3, 0.25, 1], pull: 1.08 }), A1 = shot([fl.group, sc.group], 88.65, 97.25, { from: [0.15, 0.2, 1], pull: 1.02 });
  return (t) => {
    anim(t);
    fill.color.set(ORANGE); fill.position.set(0, 2.4, 2.0); fill.intensity = 2.5;
    CAM.apply(CAM.blend(A0, A1, sm(t, 88.65, 97.25)));
  };
});

// ---------------------------------------------------------------- 12. a escolha (97.25 – 104.2)
// "Então me diz: pra você, foi perseguição política... ou fuga da Justiça?"
addScene("escolha", 97.25, 104.2, (S) => {
  const standA = new THREE.Mesh(rbox(1.2, 0.5, 0.8, 0.04), mat("#3a2a20")); standA.position.set(-1.25, 0.25, 0); S.add(standA);
  const mg = makeMegaphone(); mg.position.set(-1.25, 0.5 + 0.52, 0); mg.rotation.y = -0.5; S.add(mg);
  const block = makeStrikeBlock(false); block.position.set(1.25, 0, 0); S.add(block);
  const gv = makeGavel(); gv.position.set(1.15, 0.2 + 0.17, 0.0); gv.rotation.set(0, -Math.PI / 2 + 0.35, 0); S.add(gv);
  const aTop = sprite(chipTex("PERSEGUIÇÃO", { bg: ORANGE, font: "900 120px Inter", h: 180 }), 2.1); aTop.position.set(-1.25, 1.95, 0); S.add(aTop);
  const bTop = sprite(chipTex("FUGA", { bg: RED, font: "900 120px Inter", h: 180 }), 1.1); bTop.position.set(1.25, 1.45, 0); S.add(bTop);
  const lA = new THREE.PointLight(ORANGE, 0, 6, 1.5); lA.position.set(-1.3, 1.6, 1.2); S.add(lA);
  const lB = new THREE.PointLight(RED, 0, 6, 1.5); lB.position.set(1.4, 1.6, 1.2); S.add(lB);
  const grpA = new THREE.Group(); grpA.add(standA, mg); S.add(grpA);
  const grpB = new THREE.Group(); grpB.add(block, gv); S.add(grpB);
  S.hero(grpA, "megafone (perseguição)"); S.hero(grpB, "martelo da Justiça");
  S.label(aTop, "PERSEGUIÇÃO", { on: "megafone (perseguição)" }); S.label(bTop, "FUGA", { on: "martelo da Justiça" });
  S.solid(standA, "suporte"); S.solid(mg, "megafone", { restsOn: ["suporte"] }); S.solid(block, "base");
  const TA = 99.35, TB = 101.09;
  const anim = (t) => {
    setSpriteScale(aTop, Math.max(0.0001, pop(t, 97.45, 0.4)) * (1 + 0.12 * (t > TA && t < TA + 0.5 ? 1 : 0)));
    setSpriteScale(bTop, Math.max(0.0001, pop(t, 97.65, 0.4)) * (1 + 0.12 * (t > TB && t < TB + 0.5 ? 1 : 0)));
    const up = sm(t, TB - 0.7, TB - 0.25) * (1 - eOut(lin(t, TB - 0.12, TB))); gv.rotation.z = 0.5 * up; gv.position.y = 0.2 + 0.17 + 0.35 * up;
  };
  const box = envelope([grpA, grpB, aTop, bTop], anim, 97.25, 104.2);
  const P0 = CAM.pose(box, { zone: "stage", from: [0, 0.4, 1], pull: 1.08 });
  const P1 = CAM.pose(box, { zone: "stage", from: [0.06, 0.36, 1], pull: 1.0 });
  return (t) => {
    anim(t);
    const late = t > 102.3 ? 0.5 + 0.5 * Math.sin((t - 102.3) * 4) : 0;
    const ea = Math.max(t > TA && t < TB ? 1 : 0, late), eb = Math.max(t > TB ? 1 - (t > 102.3 ? late : 0) : 0, 0);
    lA.intensity = ea * 7; lB.intensity = eb * 7;
    CAM.apply(CAM.blend(P0, P1, sm(t, 97.25, 104.2)));
  };
});
