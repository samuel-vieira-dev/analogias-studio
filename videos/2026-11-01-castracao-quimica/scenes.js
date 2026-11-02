// ============================================================================
// videos/2026-11-01-castracao-quimica/scenes.js
// Castração química — informativo, sem citar político (pedido do Samuel). Uma analogia: a cirúrgica
// arranca a fiação; a química é um interruptor com timer que religa sozinho. O condenado vira paciente
// (agenda de consultas, exames, terapia) e a conta é da saúde pública.
// Times come from audio/words.json (A below). Objects from engine/props/medical.js.
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops
// (clinic, office, living room at night, prison yard at dawn) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json.
const A = {
  f1: 0.0, corta: 1.52, passa: 3.36, f2: 4.53, condenado: 8.46, f3: 10.4, f4: 11.61, recado: 12.96, testiculos: 13.54, testosterona: 15.0, f5: 17.53, cortaR: 18.42, injecao: 19.9, tres: 22.2, f6: 22.96, fiacao: 26.72, interruptor: 28.44, desliga: 29.86, acaba: 31.54, religa: 32.44, f7: 33.38, apertar: 35.4, sempre: 36.82, f8: 37.18, voltaram: 39.38, casos: 41.82, f9: 42.4, agenda: 45.1, terceiro: 46.78, sexto: 47.94, primeiro: 48.7, segundo: 49.68, todo: 50.66, f10: 51.76, osso: 55.04, diabetes: 56.58, coracao: 58.08, depressao: 58.96, f11: 59.76, sangue: 60.88, ossoB: 61.66, psicoterapia: 62.18, f12: 63.46, cinco: 67.2, vida: 70.36, f13: 71.08, paciente: 73.1, saude: 78.4, f14: 79.26, pequenos: 80.04, forte: 84.42, f15: 85.37, camara: 86.48, senado: 90.76, f16: 92.7, fim: 99.08, end: 101.08,
};

const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// Fall from `h` to 0 over [at, at + d] with one small bounce at the end.
const dropY = (t, at, h, d = 0.5) => { const k = lin(t, at, at + d); if (k < 0.72) return h * (1 - Math.pow(k / 0.72, 2)); return h * 0.05 * Math.sin(Math.PI * (k - 0.72) / 0.28); };

// ---------------------------------------------------------------- local pieces
// Vertical gradient sky on a far plane (backdrop). stops: [[0..1, colour], ...] top to bottom.
function gradSky(stops, { w = 120, h = 50, y = 14, z = -40 } = {}) {
  const c = makeCanvas(8, 512), x = c.getContext("2d"), gr = x.createLinearGradient(0, 0, 0, 512);
  for (const [k, col] of stops) gr.addColorStop(k, col); x.fillStyle = gr; x.fillRect(0, 0, 8, 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texFrom(c), toneMapped: false, fog: false })); m.position.set(0, y, z); return asBackdrop(m);
}
// Stainless instrument cart (top with a raised lip, a lower shelf, four legs on casters).
// Origin: floor centre; top at h. API { group, top }
function makeSteelCart({ w = 1.6, d = 0.9, h = 0.9 } = {}) {
  const g = new THREE.Group(), steel = pmat("#b9bfc6", { metalness: 0.95, roughness: 0.28 });
  const top = new THREE.Mesh(rbox(w, 0.04, d, 0.01), steel); top.position.y = h - 0.02; g.add(top);
  const shelf = new THREE.Mesh(rbox(w - 0.06, 0.03, d - 0.06, 0.01), steel); shelf.position.y = 0.28; g.add(shelf);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, h - 0.12, 12), steel); l.position.set(sx * (w / 2 - 0.05), (h - 0.12) / 2 + 0.1, sz * (d / 2 - 0.05)); g.add(l);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), pmat("#1b1b1d", { roughness: 0.6 })); wh.rotation.x = Math.PI / 2; wh.position.set(sx * (w / 2 - 0.05), 0.045, sz * (d / 2 - 0.05)); g.add(wh);
  }
  // folded towels on the lower shelf
  for (let i = 0; i < 3; i++) { const tw = new THREE.Mesh(rbox(0.36, 0.05, 0.28, 0.02), mat("#ffffff", { map: tileTex(fabricTex("#2f6b5a"), 1, 1), roughness: 0.95 })); tw.position.set(-0.4 + i * 0.4, 0.32, 0); g.add(tw); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h };
}
// Wooden desk with a dark leather top. Origin: floor centre; top at h. API { group, top }
function makeOakDesk({ w = 2.6, d = 1.4, h = 0.78, leather = "#1f3a2c" } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat(leather, { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}
// Judge's gavel resting on its round sound block. Origin: floor of the block. API { group, head }
function makeCourtGavel({ s = 1 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a2e18"), roughness: 0.35, clearcoat: 0.8 }), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.3 });
  const block = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.22 * s, 0.07 * s, 40), wood); block.position.y = 0.035 * s; g.add(block);
  const head = new THREE.Group(); head.position.set(0, 0.07 * s + 0.07 * s, 0); g.add(head);
  const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.26 * s, 28), wood); hd.rotation.z = Math.PI / 2; head.add(hd);
  for (const sx of [-1, 1]) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.073 * s, 0.073 * s, 0.02 * s, 28), brass); band.rotation.z = Math.PI / 2; band.position.x = sx * 0.09 * s; head.add(band); }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022 * s, 0.028 * s, 0.5 * s, 16), wood); handle.rotation.x = Math.PI / 2; handle.position.z = 0.28 * s; handle.position.y = -0.02 * s; head.add(handle);
  head.rotation.y = 0.5; head.position.x = 0.3 * s;
  return { group: g, head };
}
// Translucent glass figure of a body (no anatomical detail) standing on a lit disc: head, neck,
// torso, hips, arms and legs as smooth capsules. Two glow points: the brain (hipófise) and the hips.
// Origin: floor centre. API { group, head: V3, hips: V3, glows: { brain, hips }, height }
function makeGlassFigure() {
  const g = new THREE.Group(), gm = new THREE.MeshPhysicalMaterial({ color: "#9fd0ff", roughness: 0.12, metalness: 0, transmission: 0.6, thickness: 0.2, transparent: true, opacity: 0.42, emissive: "#2a6bb0", emissiveIntensity: 0.25, depthWrite: false, side: THREE.DoubleSide });
  const cap = (r, l, x, y, z = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, 20), gm); m.position.set(x, y, z); m.rotation.z = rz; g.add(m); return m; };
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.08, 48), pmat("#1b2230", { metalness: 0.6, roughness: 0.3 })); disc.position.y = 0.04; g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: "#6fc2ff", toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.082; g.add(ring);
  const y0 = 0.08;
  for (const s of [-1, 1]) { cap(0.075, 0.72, s * 0.12, y0 + 0.47); cap(0.058, 0.6, s * 0.28, y0 + 1.3, 0, s * 0.08); const sh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 14), gm); sh.position.set(s * 0.24, y0 + 1.66, 0); g.add(sh); }
  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), gm); hips.scale.set(1.15, 0.8, 0.8); hips.position.set(0, y0 + 0.95, 0); g.add(hips);
  cap(0.2, 0.42, 0, y0 + 1.32);
  cap(0.06, 0.12, 0, y0 + 1.78);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 24), gm); head.scale.set(0.92, 1.08, 1); head.position.set(0, y0 + 1.86, 0); g.add(head);
  const glow = (col, r) => { const s = sprite(BOKEH, r); s.userData.decor = true; s.material.color.set(col); s.material.blending = THREE.AdditiveBlending; s.material.opacity = 0; g.add(s); const core = new THREE.Mesh(new THREE.SphereGeometry(r * 0.08, 16, 12), new THREE.MeshBasicMaterial({ color: col, toneMapped: false, transparent: true, opacity: 0 })); g.add(core); return { s, core }; };
  const hp = new V3(0, y0 + 1.84, 0.02), hi = new V3(0, y0 + 0.9, 0.06);
  const brain = glow("#7fd8ff", 0.5), hipsG = glow("#ff8a3c", 0.7);
  brain.s.position.copy(hp); brain.core.position.copy(hp); hipsG.s.position.copy(hi); hipsG.core.position.copy(hi);
  return { group: g, head: hp, hips: hi, glows: { brain, hips: hipsG }, height: y0 + 2.0, mat: gm };
}
const setGlow = (gl, k) => { gl.s.material.opacity = 0.85 * k; gl.core.material.opacity = k; };
// A glowing pulse that travels from a to b (a bright head and a fading trail of 8 dots).
function makePulse(col = "#7fd8ff") {
  const g = new THREE.Group(), dots = [];
  for (let i = 0; i < 9; i++) { const s = sprite(BOKEH, i ? 0.16 - i * 0.012 : 0.34); s.userData.decor = true; s.material.color.set(col); s.material.blending = THREE.AdditiveBlending; g.add(s); dots.push(s); }
  const set = (a, b, k, on = 1) => dots.forEach((d, i) => { const u = clamp(k - i * 0.035); d.position.copy(a).lerp(b, u); d.material.opacity = on * (k > 0 && k < 1.2 ? (i ? 0.6 * (1 - i / 9) : 1) : 0) * (u > 0 ? 1 : 0); });
  return { group: g, set };
}
// Testosterone molecule as a ball-and-stick of four fused rings (6-6-6-5), flat, orange atoms.
// Origin: centre. API { group }
function makeSteroidModel(s = 0.11) {
  const g = new THREE.Group(), atomM = pmat("#ff8a3c", { roughness: 0.25, clearcoat: 1, emissive: "#ff6a2b", emissiveIntensity: 0.35 }), bondM = pmat("#e9e4dc", { roughness: 0.4 });
  const pts = [], add = (x, y) => { const k = pts.findIndex((p) => p.distanceTo(new V3(x, y, 0)) < 0.01 * s); if (k >= 0) return k; pts.push(new V3(x, y, 0)); return pts.length - 1; };
  const bonds = new Set(), ring = (cx, cy, n) => { const ids = []; for (let i = 0; i < n; i++) { const a = Math.PI / 2 + i * 2 * Math.PI / n; ids.push(add(cx + Math.cos(a) * s, cy + Math.sin(a) * s)); } ids.forEach((id, i) => { const j = ids[(i + 1) % n]; bonds.add(Math.min(id, j) + "-" + Math.max(id, j)); }); };
  const dx = s * Math.sqrt(3), dy = s * 1.5;
  ring(0, 0, 6); ring(dx, 0, 6); ring(dx * 1.5, dy, 6); ring(dx * 1.5 + dx * 0.95, dy + s * 0.15, 5);
  for (const p of pts) { const a = new THREE.Mesh(new THREE.SphereGeometry(s * 0.28, 16, 12), atomM); a.position.copy(p); g.add(a); }
  for (const b of bonds) { const [i, j] = b.split("-").map(Number), p = pts[i], q = pts[j], c = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.08, s * 0.08, p.distanceTo(q), 8), bondM); c.position.copy(p).add(q).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new V3(0, 1, 0), q.clone().sub(p).normalize()); g.add(c); }
  const ox = new THREE.Mesh(new THREE.SphereGeometry(s * 0.32, 16, 12), pmat("#e0261b", { roughness: 0.25, clearcoat: 1 })); ox.position.set(-s * 1.7, -s * 0.55, 0); g.add(ox);
  const ob = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.08, s * 0.08, s * 0.85, 8), bondM); ob.position.set(-s * 1.27, -s * 0.52, 0); ob.rotation.z = Math.PI / 2 - 0.25; g.add(ob);
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new V3()); g.children.forEach((m) => m.position.sub(c));
  return { group: g };
}
// Glass bulb hanging on a cord (bulb + socket), its light set by on(k). Origin: the top of the cord.
function makeHangingBulb(cord = 0.6) {
  const g = new THREE.Group();
  const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, cord, 6), mat("#141414")); cd.position.y = -cord / 2; g.add(cd);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 16), pmat("#2a2522", { metalness: 0.5, roughness: 0.4 })); sock.position.y = -cord - 0.05; g.add(sock);
  const gm = new THREE.MeshPhysicalMaterial({ color: "#fff6e0", roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.7, emissive: "#ffcf7a", emissiveIntensity: 0 });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), gm); glass.scale.set(1, 1.25, 1); glass.position.y = -cord - 0.18; g.add(glass);
  const fil = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.003, 6, 16, Math.PI), new THREE.MeshBasicMaterial({ color: "#ffb347", toneMapped: false })); fil.position.y = -cord - 0.17; g.add(fil);
  const halo = sprite(BOKEH, 0.7); halo.userData.decor = true; halo.material.color.set("#ffcf8a"); halo.material.blending = THREE.AdditiveBlending; halo.position.y = -cord - 0.18; g.add(halo);
  const on = (k) => { gm.emissiveIntensity = 2.2 * k; gm.opacity = 0.55 + 0.4 * k; fil.material.color.set("#ffb347").multiplyScalar(0.25 + 0.75 * k); halo.material.opacity = 0.75 * k; };
  on(0);
  return { group: g, on, bottom: -cord - 0.3 };
}
// Wall-mounted brass sconce with a frosted globe (the room light of the analogy). on(k).
function makeWallSconce() {
  const g = new THREE.Group(), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.3 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 32), brass); plate.rotation.x = Math.PI / 2; plate.position.set(0, 0.06, 0.018); g.add(plate);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 12), brass); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0.03, 0.13); g.add(arm);
  const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12), brass); elbow.position.set(0, 0.04, 0.24); g.add(elbow);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.08, 28), brass); cup.position.set(0, 0.07, 0.24); g.add(cup);
  const gm = new THREE.MeshPhysicalMaterial({ color: "#fff3dc", roughness: 0.6, emissive: "#ffcf7a", emissiveIntensity: 0 });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 20), gm); globe.position.set(0, 0.17, 0.24); g.add(globe);
  const halo = sprite(BOKEH, 0.75); halo.userData.decor = true; halo.material.color.set("#ffcf8a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0, 0.17, 0.3); g.add(halo);
  const lamp = new THREE.PointLight("#ffcf8a", 0, 4, 1.5); lamp.position.set(0, 0.1, 0.5); g.add(lamp);
  const on = (k) => { gm.emissiveIntensity = 1.5 * k; gm.color.set("#fff3dc").multiplyScalar(0.35 + 0.65 * k); halo.material.opacity = 0.45 * k; lamp.intensity = 3 * k; };
  on(1);
  return { group: g, on };
}
// Stack of planners (one per year) with the year printed on the spine; grows with set(n).
// Origin: floor centre. API { group, set(n), top(n) }
function makePlannerStack(n = 12, { w = 0.9, d = 0.66, t = 0.13 } = {}) {
  const g = new THREE.Group(), books = [], cols = ["#3a1d16", "#1f3a5a", "#2a4a2e", "#5a2a1a", "#3a2a4a"];
  for (let i = 0; i < n; i++) {
    const b = new THREE.Group(); b.position.y = i * t; b.rotation.y = (i % 3 - 1) * 0.06; g.add(b);
    const col = cols[i % cols.length];
    const cover = new THREE.Mesh(rbox(w, t * 0.94, d, 0.02), pmat(col, { roughness: 0.55 })); cover.position.y = t * 0.47; b.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, t * 0.7, d - 0.02), pmat("#efe8d8", { roughness: 0.9 })); pages.position.set(0.02, t * 0.47, 0.012); b.add(pages);
    const lab = makePlate(i < n - 1 ? "ANO " + (i + 1) : "ANO ...", w * 0.5, t * 0.62, { bg: "#f4e8da", fg: "#1c1410", depth: 0.006 }); lab.position.set(0, t * 0.47, d / 2 + 0.004); b.add(lab);
    books.push(b);
  }
  g.add(contactShadow(w + 0.6, d + 0.6));
  const set = (k) => books.forEach((b, i) => { const s = clamp((k - i) * 1.6); b.visible = s > 0.01; b.position.y = i * t + 0.2 * (1 - eOut(s)); });
  return { group: g, set, top: (k) => Math.min(Math.ceil(k), n) * t, books };
}
// Paper stack (a few sheets, slightly fanned) with a plate on its front edge. Origin: bottom centre.
function makePaperStack(label, { w = 0.46, d = 0.34, n = 5 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), pmat(i % 2 ? "#f6f3ec" : "#ece6d8", { roughness: 0.9 })); s.position.y = 0.006 + i * 0.013; s.rotation.y = (i - n / 2) * 0.04; g.add(s); }
  return g;
}
// Ink stamp mark printed on a sheet (lying flat), shown by k (0 hidden → 1 printed).
function stampOn(paper, text, w, h, y, ink = RED) { const m = makeInkMark(text, w, h, { ink }); m.rotation.x = -Math.PI / 2; m.position.y = y; m.visible = false; paper.add(m); return m; }

// ============================================================ 1 · gancho: não corta nada
// "A castração química não corta nada… e o efeito passa sozinho." In the clinic: a steel cart with the
// instrument tray; the scalpel slides off the tray and away; a syringe drops in its place.
addScene("gancho", A.f1, A.f2, (S) => {
  const room = makeClinicRoom({ wallZ: -2.6 }); S.backdrop(room.group);
  const cart = makeSteelCart(); S.add(cart.group);
  const tray = makeScalpelTray(); tray.group.position.set(0, cart.top, 0.05); S.add(tray.group);
  const sy = makeSyringe({ len: 0.86 }); sy.group.position.set(-0.05, cart.top + tray.top + sy.r, 0.06); sy.group.rotation.y = 0.12; S.add(sy.group);
  const anim = (t) => {
    room.update(t); room.lights(1); room.viewers(1 - 0.4 * beat(t, A.passa, 0.8)); key.intensity = 2.1; key.color.set("#f3f7ff");
    const ks = sm(t, A.corta - 0.2, A.corta + 0.5); tray.scalpel.position.x = 0.55 * ks; tray.scalpel.position.y = 0.03 + 0.12 * Math.sin(Math.PI * ks); tray.scalpel.rotation.y = -0.6 * ks; tray.scalpel.scale.setScalar(Math.max(0.001, 1 - ks)); tray.scalpel.visible = ks < 0.98;
    const at = A.corta + 0.55; sy.group.visible = t >= at; sy.group.position.y = cart.top + tray.top + sy.r + dropY(t, at, 0.6, 0.45); sy.group.rotation.y = 0.12 + 0.5 * (1 - eOut(lin(t, at, at + 0.6)));
    sy.plunger(1 - 0.85 * sm(t, A.passa, A.f2 - 0.2));
  };
  S.hero(tray.group, "bandeja com bisturi", { when: (t) => t < A.corta + 0.2 });
  S.hero(sy.group, "seringa", { when: (t) => t > A.corta + 1.1 });
  S.solid(cart.group, "carrinho");
  const box = envelope([tray.group], anim, A.f1, A.corta).union(envelope([tray.group, sy.group], anim, A.corta + 1.0, A.f2));
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.f1, A.f2), { zone: "stage", from: [0.22, 0.6, 1], pull0: 1.3, pull: 1.0 })); };
});

// ============================================================ 2 · voltou ao debate
// "Ela voltou ao debate no Brasil: a ideia é aplicar em quem foi condenado por crime sexual." On a desk in
// an office: the penal code and the gavel; the syringe lands between them.
addScene("debate", A.f2, A.f3, (S) => {
  const off = makeOfficeSet({ wallZ: -2.2, clear: 2.8 }); S.backdrop(off.group);
  const desk = makeOakDesk({ w: 2.8, d: 1.6 }); S.add(desk.group);
  const book = makeLawBook({ w: 1.3, d: 1.1, t: 0.2, color: "#5a1a14", title: " ", emblem: false }); book.group.position.set(-0.55, desk.top, -0.05); book.group.rotation.y = 0.12; S.add(book.group);
  const bookTitle = makePlate2("CÓDIGO\nPENAL", 0.9, 0.5, { bg: "#5a1a14", fg: "#f5d36b", depth: 0.01 }); bookTitle.rotation.x = -Math.PI / 2; bookTitle.position.set(0.05, 0.2 + 0.035, -0.05); book.group.add(bookTitle);
  const gv = makeCourtGavel({ s: 1.1 }); gv.group.position.set(0.75, desk.top, -0.2); S.add(gv.group);
  const sy = makeSyringe({ len: 0.8 }); sy.group.position.set(0.5, desk.top + sy.r, 0.64); S.add(sy.group);
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    popIn(book.group, t, A.f2 + 0.05, 0.35); popIn(gv.group, t, A.f2 + 0.25, 0.35);
    const hit = A.f2 + 1.1; gv.head.rotation.z = -0.5 * beat(t, hit - 0.25, 0.5);
    const at = A.condenado - 0.3; sy.group.visible = t >= at; sy.group.position.y = desk.top + sy.r + dropY(t, at, 0.7, 0.45); sy.group.rotation.y = -0.08 + 0.4 * (1 - eOut(lin(t, at, at + 0.6)));
  };
  S.hero(book.group, "livro código penal", { when: (t) => t > A.f2 + 0.5 });
  S.hero(gv.group, "martelo de juiz", { when: (t) => t > A.f2 + 0.6 });
  S.hero(sy.group, "seringa", { when: (t) => t > A.condenado + 0.3 });
  S.solid(desk.group, "mesa");
  const box = envelope([book.group, gv.group], anim, A.f2 + 0.6, A.f3).union(envelope([sy.group], anim, A.condenado + 0.3, A.f3));
  return (t) => { anim(t); let p = CAM.move(box, "orbit", lin(t, A.f2, A.f3), { zone: "stage", from: [0, 0.85, 1], deg: 30, pull: 1.02 }); p = CAM.shake(p, t, A.f2 + 1.1, 0.03, 0.25); CAM.apply(p); };
});

// ============================================================ 3 · e depois que ele sai?
// The barred gate of a prison slides open on a road at dawn.
addScene("portao", A.f3, A.f4, (S) => {
  const bg = new THREE.Group(); S.backdrop(bg);
  bg.add(gradSky([[0, "#0a1230"], [0.55, "#2a3560"], [0.8, "#9a5a42"], [1, "#f0a060"]]));
  const road = makeTwoLaneRoad({ lane: 2.2, back: 70, front: 6 }); road.group.position.z = -1; bg.add(road.group);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat("#ffffff", { map: tileTex(grassTex(), 50, 50), roughness: 1, color: "#4a5a42" })); field.rotation.x = -Math.PI / 2; field.position.y = -0.002; bg.add(field);
  const wire = new THREE.Group(); bg.add(wire);
  for (let x = -14; x <= 14; x += 0.5) if (Math.abs(x) > 3.6) { const coil = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.008, 6, 20), pmat("#9aa0a6", { metalness: 0.9, roughness: 0.4 })); coil.position.set(x, 3.6, -0.25); coil.rotation.y = Math.PI / 2; wire.add(coil); }
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffcf8a", toneMapped: false });
  for (const x of [-3.2, 3.2]) { const l = new THREE.Mesh(rbox(0.3, 0.12, 0.16, 0.03), lampM); l.position.set(x, 3.15, 0.1); bg.add(l); const pool = makeFloorGlow(2.4, 2, { color: "#ffcf8a", opacity: 0.18 }); pool.position.set(x * 0.8, 0.01, 1.2); bg.add(pool); }
  const sun = sprite(BOKEH, 9); sun.material.color.set("#ffb36b"); sun.material.blending = THREE.AdditiveBlending; sun.material.opacity = 0; sun.position.set(0, 2.4, -36); bg.add(sun);
  asBackdrop(bg);
  const gate = makePrisonGate(); S.add(gate.group);
  const shaft = makeLightShaft([0, 2.4, -1], [0, 0.02, 3.2], { w0: 1.4, w1: 3.2, color: "#ffd9a8", opacity: 0 }); asBackdrop(shaft.group); S.backdrop(shaft.group);
  const anim = (t) => { const k = sm(t, A.f3 + 0.1, A.f4 - 0.2); gate.open(k); sun.material.opacity = 0.2 + 0.6 * k; shaft.set(k); key.intensity = 1.6; key.color.set("#ffd2a8"); hemi.intensity = 0.35; hemi.color.set("#9fb2ff"); };
  S.hero(gate.group, "portão de presídio");
  const box = envelope([gate.door], anim, A.f3, A.f4).union(new THREE.Box3(new V3(-0.9, 0, -0.3), new V3(0.9, 2.6, 0.2)));
  return (t) => { anim(t); CAM.apply(CAM.move(box, "reveal", lin(t, A.f3, A.f4), { zone: "stage", from: [0.12, 0.12, 1], pull: 1.0, pull0: 1.2 })); };
});

// ============================================================ 4 · o recado (cérebro → testículos)
// The glass figure in the dim clinic; a pulse travels from the head down to the hips; the hips glow
// orange and the testosterone molecule rises beside them.
function figureScene(S) {
  const room = makeClinicRoom({ wallZ: -2.8, seed: 12 }); S.backdrop(room.group);
  const fig = makeGlassFigure(); S.add(fig.group);
  const pulse = makePulse(); S.add(pulse.group);
  return { room, fig, pulse };
}
addScene("recado", A.f4, A.f5, (S) => {
  const { room, fig, pulse } = figureScene(S);
  const mol = makeSteroidModel(0.1); mol.group.position.set(0.78, fig.hips.y + 0.15, 0.1); S.add(mol.group);
  const anim = (t) => {
    room.update(t); room.lights(0.35); room.viewers(0.8, "#9fd0ff"); key.intensity = 1.2; key.color.set("#cfe6ff"); hemi.intensity = 0.3;
    setGlow(fig.glows.brain, 0.4 + 0.6 * sm(t, A.f4, A.recado));
    const k = lin(t, A.recado, A.testiculos); pulse.set(fig.head, fig.hips, k * 1.2, t > A.recado ? 1 - sm(t, A.testiculos + 0.4, A.testiculos + 0.8) : 0);
    setGlow(fig.glows.hips, sm(t, A.testiculos - 0.1, A.testiculos + 0.4));
    popIn(mol.group, t, A.testosterona - 0.2, 0.45); mol.group.rotation.y = 0.6 * Math.sin((t - A.f4) * 1.3); mol.group.rotation.x = 0.2;
  };
  S.hero(fig.group, "figura de vidro");
  S.hero(mol.group, "molécula", { when: (t) => t > A.testosterona + 0.3 });
  const box = envelope([fig.group, mol.group], anim, A.testosterona + 0.3, A.f5);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.f4, A.f5), { zone: "stage", from: [0.25, 0.1, 1], rise: 0.35, pull: 1.0 })); };
});

// ============================================================ 5 · o remédio corta o recado; a injeção
// A: the pulse hits an orange shield at the neck and goes out, the hips dim. B (cut at "injeção"): on the
// cart, the vial and the syringe; a flip calendar turns from 1 MÊS to 3 MESES.
addScene("injecao", A.f5, A.f6, (S) => {
  const { room, fig, pulse } = figureScene(S);
  const shield = new THREE.Group(); shield.position.set(0, fig.head.y - 0.1, 0); S.add(shield);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 48), new THREE.MeshPhysicalMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, roughness: 0.2, depthWrite: false })); shield.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.014, 8, 48), new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false })); rim.rotation.x = Math.PI / 2; shield.add(rim);
  const cart = makeSteelCart({ w: 1.8 }); cart.group.position.set(0, 0, 0); S.add(cart.group);
  const vial = makeMedVial("INJEÇÃO", { r: 0.085, h: 0.26 }); vial.label.userData.plate.detail = true; vial.group.position.set(-0.55, cart.top, 0.05); cart.group.position.x = 20; S.add(vial.group);
  const sy = makeSyringe({ len: 0.8 }); sy.group.position.set(-0.12, cart.top + sy.r, 0.36); sy.group.rotation.y = Math.PI - 0.12; S.add(sy.group);
  const cal = makeFlipCalendar(["1 MÊS", "3 MESES"], { w: 0.62, h: 0.56 }); cal.group.position.set(0.6, cart.top, -0.12); cal.group.rotation.y = -0.2; S.add(cal.group);
  const B = A.injecao - 0.15;
  const anim = (t) => {
    room.update(t); key.intensity = t < B ? 1.2 : 2.1; key.color.set(t < B ? "#cfe6ff" : "#f3f7ff"); room.lights(t < B ? 0.35 : 1); room.viewers(t < B ? 0.8 : 1, t < B ? "#9fd0ff" : "#ffffff");
    const a = t < B; fig.group.visible = a; shield.visible = a; pulse.group.visible = a; cart.group.position.x = a ? 20 : 0; vial.group.visible = sy.group.visible = cal.group.visible = !a;
    setGlow(fig.glows.brain, 1); const hitAt = A.cortaR;
    const k = lin(t, A.f5 + 0.1, hitAt); pulse.set(fig.head, fig.hips, Math.min(k * 0.33, 0.33) * (k < 1 ? 1 : 1), t < hitAt + 0.15 ? 1 : 0);
    popIn(shield, t, hitAt - 0.15, 0.35); shield.scale.multiplyScalar(1 + 0.15 * beat(t, hitAt, 0.4)); if (!a) shield.visible = false;
    setGlow(fig.glows.hips, 1 - sm(t, hitAt + 0.1, hitAt + 0.9));
    if (!a) { popIn(vial.group, t, B, 0.35); popIn(sy.group, t, B + 0.2, 0.35); popIn(cal.group, t, B + 0.4, 0.35); cal.show(0, sm(t, A.tres - 0.25, A.tres + 0.25)); }
  };
  S.hero(fig.group, "figura de vidro", { when: (t) => t < B }); S.hero(shield, "escudo laranja", { when: (t) => t > A.cortaR && t < B });
  S.hero(vial.group, "frasco de injeção", { when: (t) => t > B + 0.4 }); S.hero(sy.group, "seringa", { when: (t) => t > B + 0.6 }); S.hero(cal.group, "calendário", { when: (t) => t > B + 0.8 });
  S.solid(cart.group, "carrinho", { when: (t) => t > B });
  const boxA = envelope([fig.group], anim, A.f5, B - 0.05), boxB = envelope([vial.group, sy.group, cal.group], anim, B + 0.5, A.f6);
  return (t) => { anim(t); if (t < B) CAM.apply(CAM.move(boxA, "push", lin(t, A.f5, B), { zone: "stage", from: [-0.2, 0.15, 1], pull0: 1.2, pull: 1.0 })); else CAM.apply(CAM.move(boxB, "truck", lin(t, B, A.f6), { zone: "stage", from: [0, 0.55, 1], side: 0.35, pull: 1.04 })); };
});

// ============================================================ 6 · a analogia
// Living room wall at night: on the left, the switch ripped out (wires hanging) = CIRÚRGICA; on the right,
// the switch with the timer = QUÍMICA; the sconce between them is the light. "desliga": the rocker goes
// down, the timer is wound, the light goes out; the dial runs down; at zero the light comes back.
function analogyWall(S, { labels = true } = {}) {
  const room = makeNightLivingRoom({ wallZ: 0, pendant: false }); S.backdrop(room.group);
  const wall = new THREE.Group(); wall.position.set(0, 0, 0.001); S.add(wall);
  const sc = makeWallSconce(); sc.group.position.set(0, 2.02, 0); wall.add(sc.group);
  const torn = makeTornWires(); torn.group.position.set(-0.62, 1.32, 0); wall.add(torn.group);
  const sw = makeTimerSwitch(); sw.group.position.set(0.62, 1.32, 0); wall.add(sw.group);
  const plates = [];
  if (labels) for (const [txt, x, bg] of [["CIRÚRGICA", -0.62, "#7a1c14"], ["QUÍMICA", 0.62, "#a8471c"]]) { const p = makePlate(txt, 0.72, 0.2, { bg, fg: "#ffffff" }); p.position.set(x, 0.7, 0.02); wall.add(p); plates.push(p); }
  return { room, wall, sc, torn, sw, plates };
}
addScene("analogia", A.f6, A.f7, (S) => {
  const W = analogyWall(S);
  const T0 = A.desliga, T1 = A.religa;
  const anim = (t) => {
    W.room.update(t); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    W.torn.group.visible = t > A.fiacao - 0.3; W.torn.group.scale.setScalar(t > A.fiacao - 0.3 ? 1 : 0.001);
    popIn(W.plates[0], t, A.fiacao - 0.2, 0.35); popIn(W.plates[1], t, A.interruptor - 0.2, 0.35);
    W.sw.group.visible = t > A.interruptor - 0.35;
    W.sw.press(t > T0 && t < T1 ? 1 : 0);
    const left = t < T0 ? 0 : t < T1 ? 1 - lin(t, T0 + 0.2, T1) : 0; W.sw.set(left);
    const on = t < T0 ? 1 : t < T1 ? 0 : sm(t, T1, T1 + 0.25); W.sc.on(on); W.room.light(on);
  };
  S.hero(W.wall, "parede com interruptores", { when: (t) => t > A.interruptor });
  S.hero(W.sc.group, "arandela", { when: (t) => t < A.fiacao - 0.6 });
  const box = envelope([W.wall], anim, A.interruptor, A.f7), lampBox = envelope([W.sc.group], anim, A.f6, A.fiacao - 0.6);
  return (t) => {
    anim(t);
    const pl = CAM.move(lampBox, "push", lin(t, A.f6, A.fiacao - 0.5), { zone: "stage", from: [-0.25, -0.05, 1], pull0: 1.6, pull: 1.3 });
    const pw = CAM.move(box, "orbit", lin(t, A.fiacao - 0.5, A.f7), { zone: "stage", from: [0, 0.05, 1], deg: 26, pull: 1.04 });
    let p = CAM.blend(pl, pw, sm(t, A.fiacao - 0.55, A.fiacao + 0.1)); p = CAM.shake(p, t, A.fiacao, 0.03, 0.25); CAM.apply(p);
  };
});

// ============================================================ 7 · alguém tem que voltar e apertar de novo
// Close on the timer switch: a finger presses it, the dial is wound to full and runs down; again.
addScene("apertar", A.f7, A.f8, (S) => {
  const W = analogyWall(S, { labels: false });
  W.torn.group.visible = false;
  W.sc.group.visible = false;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 8, 48), new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false, transparent: true })); ring.position.set(0.62, 1.32 - 0.232, 0.09); S.add(ring);
  const presses = [A.apertar - 0.1, A.sempre - 0.15, A.sempre + 0.55];
  const anim = (t) => {
    W.room.update(t); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    let last = -1; for (const p of presses) if (t >= p) last = p;
    const left = last < 0 ? 0.08 * (1 - lin(t, A.f7, presses[0])) : 1 - lin(t, last + 0.15, last + 1.6);
    W.sw.set(Math.max(0, left)); const on = left > 0.002 ? 0 : 1; W.room.light(last < 0 ? 0 : on);
    let push = 0; for (const p of presses) push = Math.max(push, beat(t, p - 0.15, 0.4));
    W.sw.press(push);
    let rk = -1; for (const p of presses) if (t >= p - 0.05 && t < p + 0.55) rk = lin(t, p - 0.05, p + 0.55);
    ring.visible = rk >= 0; ring.scale.setScalar(1 + 2.2 * Math.max(0, rk)); ring.material.opacity = 1 - Math.max(0, rk);
  };
  S.hero(W.sw.group, "interruptor com timer");
  const box = envelope([W.sw.group], anim, A.f7, A.f8);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.f7, A.f8), { zone: "stage", from: [-0.18, 0.08, 1], pull0: 1.5, pull: 1.08 })); };
});

// ============================================================ 8 · seis a nove de cada dez
// Ten bulbs hanging in a row in the dark room; when "voltaram", six then up to nine light up again.
addScene("lampadas", A.f8, A.f9, (S) => {
  const room = makeNightLivingRoom({ wallZ: -1.6, seed: 9, pendant: false }); S.backdrop(room.group);
  const row = new THREE.Group(); row.position.set(0, 2.4, 0); S.add(row);
  const bulbs = [];
  for (const z of [-0.35, 0.35]) { const beam = new THREE.Mesh(rbox(2.9, 0.08, 0.1, 0.02), pmat("#2a1d14", { roughness: 0.6 })); beam.position.z = z; row.add(beam); }
  for (let i = 0; i < 10; i++) { const back = i < 5, b = makeHangingBulb(back ? 0.2 + (i % 2) * 0.06 : 0.62 + (i % 2) * 0.06); b.group.scale.setScalar(1.9); b.group.position.set(-1.12 + (i % 5) * 0.56 + (back ? 0 : 0.28) - 0.14, -0.04, back ? -0.35 : 0.35); row.add(b.group); bulbs.push(b); }
  const order = [3, 7, 0, 5, 9, 1, 6, 2, 4, 8];   // bulb i lights as the count reaches it; 8 stays off
  const anim = (t) => {
    room.update(t); room.light(0.4); key.intensity = 1.1; key.color.set("#ffd9b0"); hemi.intensity = 0.25;
    const n = t < A.voltaram ? 0 : 6 + 3 * sm(t, A.voltaram + 0.6, A.casos);
    order.forEach((bi, rank) => { const k = clamp((t < A.voltaram ? 0 : (A.voltaram < t ? n - rank : 0))) * (rank < 6 ? sm(t, A.voltaram + rank * 0.08, A.voltaram + rank * 0.08 + 0.2) : 1); bulbs[bi].on(rank < 9 ? k : 0); });
  };
  S.hero(row, "fileira de lâmpadas");
  const box = envelope([row], anim, A.f8, A.f9);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "truck", lin(t, A.f8, A.f9), { zone: "stage", from: [0, 0.05, 1], side: 0.3, pull: 1.02 })); };
});

// ============================================================ 9 · a agenda médica
// "Imagina: você sai da prisão… com uma agenda médica." The planner on the doctor's desk; the pages
// turn with the dates circled in red.
addScene("agenda", A.f9, A.f10, (S) => {
  const room = makeClinicRoom({ wallZ: -2.4, seed: 21 }); S.backdrop(room.group);
  const desk = makeOakDesk({ w: 2.6, d: 1.4, leather: "#1f2f3a" }); S.add(desk.group);
  const pl = makeDeskPlanner(["3º MÊS", "6º MÊS", "1 ANO", "2 ANOS", "TODO ANO"]); pl.group.position.set(0, desk.top, 0.1); S.add(pl.group);
  const steth = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 40, Math.PI * 1.6), pmat("#1b1b1d", { roughness: 0.4 })); steth.rotation.x = -Math.PI / 2; steth.position.set(-0.95, desk.top + 0.012, -0.35); S.add(steth);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.18, 12), pmat("#b5261e", { roughness: 0.3 })); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; pen.position.set(0.85, desk.top + 0.01, 0.42); S.add(pen);
  const flips = [A.sexto, A.primeiro, A.segundo, A.todo];
  const anim = (t) => {
    room.update(t); room.lights(1); key.intensity = 2.0; key.color.set("#fff4ea");
    popIn(pl.group, t, A.f9 + 0.05, 0.4);
    let i = 0, k = 0; flips.forEach((ft, j) => { if (t >= ft - 0.35) { i = j; k = lin(t, ft - 0.35, ft); } }); if (t < flips[0] - 0.35) { i = 0; k = 0; }
    pl.show(i, k);
  };
  S.hero(pl.group, "agenda aberta", { when: (t) => t > A.f9 + 0.5 });
  S.solid(desk.group, "mesa");
  const box = envelope([pl.group], anim, A.f9 + 0.5, A.f10);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.f9, A.f10), { zone: "stage", from: [0, 0.95, 1], rise: 0.3, pull: 1.0 })); };
});

// ============================================================ 10 · o preço: osso, diabetes, coração, depressão
// On a clinic counter, left to right: the X-ray (the femur fades), the glucometer (the number climbs), the
// ECG monitor (alarm); on "depressão" the room goes dark blue.
addScene("preco", A.f10, A.f11, (S) => {
  const room = makeClinicRoom({ wallZ: -2.4, seed: 31 }); S.backdrop(room.group);
  const counter = makeOakDesk({ w: 3.4, d: 1.2, leather: "#2a2f33" }); S.add(counter.group);
  const xr = makeXrayBox({ w: 0.62, h: 0.9 }); const stand = new THREE.Group(); stand.add(xr.group); xr.group.position.y = 0.55; stand.position.set(-1.05, counter.top, -0.15);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), pmat("#8d9096", { metalness: 0.8, roughness: 0.3 })); leg.position.y = 0.06; stand.add(leg);
  const foot = new THREE.Mesh(rbox(0.4, 0.03, 0.26, 0.01), pmat("#2a2522", { roughness: 0.4 })); foot.position.y = 0.015; stand.add(foot); S.add(stand);
  const glu = makeGlucometer(); glu.group.position.set(0, counter.top, 0.1); glu.group.scale.setScalar(1.1); S.add(glu.group);
  const ecg = makeEcgMonitor({ w: 0.8, h: 0.56 }); ecg.group.position.set(1.05, counter.top, -0.1); ecg.group.rotation.y = -0.15; S.add(ecg.group);
  const items = [[stand, A.f10 + 0.05], [glu.group, A.diabetes - 0.35], [ecg.group, A.coracao - 0.35]];
  const anim = (t) => {
    room.update(t); const dep = sm(t, A.depressao - 0.1, A.depressao + 0.6); room.lights(1 - 0.75 * dep); room.viewers(1 - 0.6 * dep, "#9fb2ff");
    key.intensity = 2.0 - 1.0 * dep; key.color.set(dep > 0.5 ? "#9fb2ff" : "#fff4ea"); hemi.intensity = 0.4 - 0.15 * dep;
    for (const [o, at] of items) popIn(o, t, at, 0.4);
    xr.paint(sm(t, A.osso - 0.3, A.diabetes - 0.3));
    glu.set(lerp(95, 182, sm(t, A.diabetes - 0.2, A.coracao - 0.3)));
    const alarm = t > A.coracao - 0.1 ? 1 : 0; ecg.update(t, lerp(72, 128, sm(t, A.coracao - 0.2, A.coracao + 0.6)), alarm);
  };
  S.hero(stand, "raio-x do fêmur", { when: (t) => t > A.f10 + 0.5 && t < A.diabetes - 0.6 }); S.hero(glu.group, "medidor de glicose", { when: (t) => t > A.diabetes && t < A.coracao - 0.6 }); S.hero(ecg.group, "monitor cardíaco", { when: (t) => t > A.coracao });
  S.solid(counter.group, "bancada");
  const bA = envelope([stand], anim, A.f10, A.diabetes), bB = envelope([glu.group], anim, A.diabetes, A.coracao), bC = envelope([ecg.group, glu.group], anim, A.coracao, A.f11);
  const pA = CAM.pose(bA, { zone: "stage", from: [0.35, 0.18, 1], pull: 1.05 }), pB = CAM.pose(bB, { zone: "stage", from: [0.1, 0.3, 1], pull: 1.1 }), pC = CAM.pose(bC, { zone: "stage", from: [-0.25, 0.28, 1], pull: 1.0 });
  const pA0 = CAM.pose(bA, { zone: "stage", from: [0.45, 0.12, 1], pull: 1.25 });
  return (t) => { anim(t); CAM.apply(CAM.track(t, [[A.f10, pA0], [A.osso, pA, 1.2], [A.diabetes, pB, 0.55], [A.coracao, pC, 0.6]])); };
});

// ============================================================ 11 · exames e psicoterapia
// A: the rack of blood tubes fills, next to an X-ray film; B (cut at "psicoterapia"): two armchairs face
// each other in a warm room.
addScene("exames", A.f11, A.f12, (S) => {
  const room = makeClinicRoom({ wallZ: -2.4, seed: 41 }); S.backdrop(room.group);
  const counter = makeOakDesk({ w: 2.6, d: 1.2, leather: "#2a2f33" }); S.add(counter.group);
  const rack = makeTubeRack(); rack.group.position.set(-0.35, counter.top, 0.1); S.add(rack.group);
  const xr = makeXrayBox({ w: 0.5, h: 0.72 }); xr.group.position.set(0.62, counter.top + 0.47, -0.2); xr.paint(0); S.add(xr.group);
  const xfoot = new THREE.Mesh(rbox(0.36, 0.06, 0.2, 0.01), pmat("#2a2522", { roughness: 0.4 })); xfoot.position.set(0.62, counter.top + 0.03, -0.2); S.add(xfoot);
  const chairs = makeTherapyChairs(); chairs.group.position.set(30, 0, 0); S.add(chairs.group);
  const living = makeNightLivingRoom({ wallZ: -1.8, seed: 14, pendant: false }); living.group.position.x = 30; S.backdrop(living.group);
  const B = A.psicoterapia - 0.15;
  const anim = (t) => {
    const a = t < B; room.update(t); living.update(t); living.light(1);
    key.intensity = a ? 2.0 : 1.6; key.color.set(a ? "#fff4ea" : "#ffd9b0"); hemi.intensity = 0.38;
    rack.show(lin(t, A.f11 + 0.1, A.sangue + 0.3)); popIn(xr.group, t, A.ossoB - 0.3, 0.4); xfoot.visible = xr.group.visible;
    popIn(chairs.group, t, B, 0.45);
  };
  S.hero(rack.group, "tubos de sangue", { when: (t) => t > A.sangue + 0.4 && t < B });
  S.hero(xr.group, "raio-x", { when: (t) => t > A.ossoB + 0.2 && t < B });
  S.hero(chairs.group, "poltronas de terapia", { when: (t) => t > B + 0.5 });
  S.solid(counter.group, "bancada");
  const bA = envelope([rack.group, xr.group], anim, A.ossoB + 0.2, B - 0.05), bB = envelope([chairs.group], anim, B + 0.5, A.f12);
  return (t) => { anim(t); if (t < B) CAM.apply(CAM.move(bA, "push", lin(t, A.f11, B), { zone: "stage", from: [0.2, 0.42, 1], pull0: 1.25, pull: 1.0 })); else CAM.apply(CAM.move(bB, "orbit", lin(t, B, A.f12), { zone: "stage", from: [0, 0.55, 1], deg: 24, pull: 1.02 })); };
});

// ============================================================ 12 · por quanto tempo?
// The planners pile up year after year into a tower; the camera rises with it.
addScene("anos", A.f12, A.f13, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, seed: 7, clear: 2.8 }); S.backdrop(off.group);
  const st = makePlannerStack(9); S.add(st.group);
  const n = (t) => t < A.cinco - 0.3 ? 5 * lin(t, A.f12 + 0.2, A.cinco - 0.3) : 5 + 4 * lin(t, A.vida - 0.4, A.f13 - 0.2);
  const anim = (t) => { off.update(t); off.lights(0.95); key.intensity = 2.0; key.color.set("#ffe9d2"); st.set(n(t) + 0.999); };
  S.hero(st.group, "pilha de agendas");
  return (t) => {
    anim(t); const k = n(t) + 1;
    const box = new THREE.Box3(new V3(-0.55, 0, -0.45), new V3(0.55, Math.max(0.6, st.top(k) + 0.1), 0.45));
    CAM.apply(CAM.pose(box, { zone: "stage", from: [0.35, lerp(0.35, 0.15, lin(t, A.f12, A.f13)), 1], pull: 1.0 }));
  };
});

// ============================================================ 13 · paciente do Estado; a conta é da saúde pública
// A: the patient wristband on the desk. B (at "E injeção…"): the medical file gets stamped SAÚDE
// PÚBLICA while vials, tubes and appointment cards pile up beside it.
addScene("paciente", A.f13, A.f14, (S) => {
  const room = makeClinicRoom({ wallZ: -2.4, seed: 51 }); S.backdrop(room.group);
  const desk = makeOakDesk({ w: 2.8, d: 1.5, leather: "#1f2f3a" }); S.add(desk.group);
  const band = makePatientBand("PACIENTE", { len: 1.6, w: 0.3 }); band.group.position.set(0, desk.top, 0.05); band.group.rotation.y = 0.18; S.add(band.group);
  const B = A.paciente + 1.3;
  const file = new THREE.Group(); file.position.set(-0.35, desk.top, 0.05); S.add(file);
  const folderM = pmat("#d9b66a", { roughness: 0.75 });
  const fb = new THREE.Mesh(rbox(1.1, 0.02, 1.4, 0.01), folderM); fb.position.y = 0.01; file.add(fb);
  const fc = makeCanvas(400, 520), fx = fc.getContext("2d"); fx.fillStyle = "#f6f3ec"; fx.fillRect(0, 0, 400, 520); fx.fillStyle = "#2a2a2a"; fx.font = "700 22px Inter";
  ["NOME", "DATA", "EXAMES", "MEDICAÇÃO", "RETORNO"].forEach((lb, i) => { const y = 120 + i * 62; fx.fillText(lb + ":", 30, y); fx.fillStyle = "rgba(40,60,100,0.35)"; fx.fillRect(30 + fx.measureText(lb + ":").width + 10, y + 4, 300, 2); fx.fillStyle = "#2a2a2a"; });
  const pmF = pmat("#f6f3ec", { roughness: 0.9 }), sheet = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.004, 1.3), [pmF, pmF, pmat("#ffffff", { map: texFrom(fc), roughness: 0.9 }), pmF, pmF, pmF]); sheet.position.y = 0.022; file.add(sheet);
  const head = makePlate("FICHA MÉDICA", 0.98, 0.3, { bg: "#1f4f8a", fg: "#ffffff", depth: 0.003 }); head.rotation.x = -Math.PI / 2; head.position.set(0, 0.026, -0.48); file.add(head);
  const ink = stampOn(file, "SAÚDE\nPÚBLICA", 0.78, 0.44, 0.026, RED); ink.position.z = 0.14;
  const stamp = makeStamp({ w: 0.76, d: 0.4, ink: RED }); stamp.visible = false; S.add(stamp);
  const pile = new THREE.Group(); pile.position.set(0.78, desk.top, 0.05); S.add(pile);
  const vials = [];
  for (let i = 0; i < 12; i++) { const v = makeMedVial("", { r: 0.075, h: 0.24 }); v.label.visible = false; v.group.position.set((i % 3 - 1) * 0.22, 0, Math.floor(i / 3) * 0.22 - 0.33); pile.add(v.group); vials.push(v.group); }
  const anim = (t) => {
    room.update(t); room.lights(1); key.intensity = 2.0; key.color.set("#fff4ea");
    const a = t < B; band.group.visible = a; file.visible = pile.visible = !a;
    popIn(band.group, t, A.f13 + 0.05, 0.4, 1, B);
    const hit = A.saude - 0.1, press = t < hit - 0.35 ? 0 : t < hit ? lin(t, hit - 0.35, hit) : 1 - sm(t, hit + 0.1, hit + 0.5);
    stamp.visible = !a && t > hit - 0.7 && t < hit + 0.55; stamp.position.set(-0.35, desk.top + 0.026 + 0.45 * (1 - press), 0.19);
    ink.visible = t > hit;
    vials.forEach((v, i) => { const at = B + 0.2 + i * ((hit - B - 0.4) / 12); v.visible = t > at; v.position.y = 0.4 * (1 - eOut(lin(t, at, at + 0.3))); });
  };
  S.hero(band.group, "pulseira de paciente", { when: (t) => t > A.f13 + 0.5 && t < B });
  S.hero(file, "ficha médica", { when: (t) => t > B + 0.2 }); S.hero(pile, "frascos", { when: (t) => t > A.saude });
  S.solid(desk.group, "mesa");
  const bA = envelope([band.group], anim, A.f13 + 0.5, B - 0.05), bB = envelope([file, pile], anim, A.saude + 0.3, A.f14);
  return (t) => { anim(t); if (t < B) CAM.apply(CAM.move(bA, "push", lin(t, A.f13, B), { zone: "stage", from: [0, 1.05, 1], pull0: 1.12, pull: 1.0 })); else { let p = CAM.move(bB, "push", lin(t, B, A.f14), { zone: "stage", from: [0.1, 1.25, 1], pull: 1.0, pull0: 1.06 }); p = CAM.shake(p, t, A.saude - 0.1, 0.03, 0.25); CAM.apply(p); } };
});

// ============================================================ 14 · e funciona?
// The scale: on one pan a short stack of papers (ESTUDOS PEQUENOS); the other pan empty, a card hanging
// from it: ESTUDO FORTE? The beam rocks and never settles.
addScene("funciona", A.f14, A.f15, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, seed: 17, clear: 2.8 }); S.backdrop(off.group);
  const desk = makeOakDesk({ w: 2.6, d: 1.3 }); S.add(desk.group);
  const sc = makeTwoPanScale({ arm: 0.72, height: 1.0, panR: 0.3, chain: 0.42 }); sc.group.position.set(0, desk.top, 0); S.add(sc.group);
  const papers = makePaperStack("", { w: 0.3, d: 0.24, n: 4 }); sc.holders[0].add(papers);
  const pA = makePlate2("ESTUDOS\nPEQUENOS", 0.8, 0.36, { bg: "#141414", fg: "#ffffff", depth: 0.02 });
  const pB = makePlate2("ESTUDO\nFORTE?", 0.8, 0.36, { bg: RED, fg: "#ffffff", depth: 0.02 });
  const hook = (tag) => { const brass = pmat("#d0a54e", { metalness: 1, roughness: 0.24 }); for (const sx of [-0.25, 0.25]) { const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), brass); wire.position.set(sx, 0.26, -0.005); tag.add(wire); const hk = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 16, Math.PI), brass); hk.rotation.y = Math.PI / 2; hk.position.set(sx, 0.36, -0.02); tag.add(hk); } };
  const tagA = new THREE.Group(); tagA.position.set(0, -0.24, 0.31); sc.holders[0].add(tagA); tagA.add(pA); hook(tagA);
  const tagB = new THREE.Group(); tagB.position.set(0, -0.24, 0.31); sc.holders[1].add(tagB); tagB.add(pB); hook(tagB);
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    sc.tilt(0.1 + 0.06 * Math.sin((t - A.f14) * 2.1));
    popIn(tagA, t, A.pequenos - 0.2, 0.35); popIn(tagB, t, A.forte - 0.4, 0.35);
    papers.visible = t > A.pequenos - 0.3;
  };
  S.hero(sc.group, "balança");
  S.hero(tagA, "placa estudos pequenos", { when: (t) => t > A.pequenos + 0.2 }); S.hero(tagB, "placa estudo forte", { when: (t) => t > A.forte });
  S.solid(desk.group, "mesa");
  const box = envelope([sc.group], anim, A.forte, A.f15);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.f14, A.f15), { zone: "stage", from: [0.1, 0.25, 1], rise: 0.25, pull: 1.0 })); };
});

// ============================================================ 15 · Câmara aprovou; parado no Senado
// The photo of the empty Senate floor in a frame on a pedestal; it turns and lands, slow zoom; at "parado" an
// hourglass appears beside it and starts to run while the camera swings round both.
addScene("senado", A.f15, A.f16, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, seed: 23, clear: 2.8 }); S.backdrop(off.group);
  const fr = makePhotoFrame("senado", { w: 2.2, name: "SENADO FEDERAL" }); S.add(fr.group);
  if (fr.plate) fr.plate.userData.plate.detail = true;
  const hg = makeHourglass({ h: 1.0 }); hg.group.position.set(1.4, 0, 0.3); S.add(hg.group);
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, A.f15, A.f15 + 0.7))); popIn(fr.group, t, A.f15, 0.45); fr.zoom(1 + 0.14 * lin(t, A.f15, A.f16));
    popIn(hg.group, t, A.senado - 0.3, 0.4); hg.set(lin(t, A.senado, A.f16 + 2));
  };
  S.hero(fr.group, "porta-retrato senado"); S.hero(hg.group, "ampulheta", { when: (t) => t > A.senado + 0.2 });
  const bA = envelope([fr.group], anim, A.f15 + 0.8, A.senado - 0.5), bB = envelope([fr.group, hg.group], anim, A.senado + 0.2, A.f16);
  return (t) => { anim(t); const pa = CAM.move(bA, "push", lin(t, A.f15, A.senado - 0.4), { zone: "stage", from: [-0.15, 0.4, 1], pull0: 1.25, pull: 1.0 }); const pb = CAM.move(bB, "orbit", lin(t, A.senado - 0.4, A.f16), { zone: "stage", from: [0.1, 0.35, 1], deg: 22, pull: 1.0 }); let p = CAM.blend(pa, pb, sm(t, A.senado - 0.5, A.senado + 0.2)); p = CAM.shake(p, t, A.senado - 0.2, 0.025, 0.25); CAM.apply(p); };
});

// ============================================================ 16 · a pergunta
// Back to the timer switch, now between a green SIM and a red NÃO; the dial runs down and the light
// pulses with it.
addScene("pergunta", A.f16, A.end, (S) => {
  const W = analogyWall(S, { labels: false }); W.torn.group.visible = false;
  W.sw.group.position.x = 0;
  const yes = makePlate("SIM", 0.56, 0.26, { bg: "#1f6b3a", fg: "#ffffff" }); yes.position.set(-0.58, 1.32, 0.02); W.wall.add(yes);
  const no = makePlate("NÃO", 0.56, 0.26, { bg: "#9b1c1c", fg: "#ffffff" }); no.position.set(0.58, 1.32, 0.02); W.wall.add(no);
  const anim = (t) => {
    W.room.update(t); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    const cyc = ((t - A.f16) / 3.2) % 1; W.sw.set(1 - cyc); W.sw.press(0);
    const on = 0.35 + 0.65 * (cyc > 0.9 ? 1 : 0.15); W.sc.on(on); W.room.light(on * 0.6);
    popIn(yes, t, A.f16 + 0.3, 0.35); popIn(no, t, A.f16 + 0.5, 0.35);
  };
  S.hero(W.wall, "interruptor entre sim e não");
  const box = envelope([W.sw.group, yes, no, W.sc.group], anim, A.f16 + 0.6, A.end);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "orbit", lin(t, A.f16, A.end), { zone: "stage", from: [0, 0.08, 1], deg: 22, pull: 1.05 })); };
});
