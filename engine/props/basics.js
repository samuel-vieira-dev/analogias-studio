// ============================================================================
// props/basics.js · generic props reused across videos
// Every builder returns plain THREE objects; animation lives in each video's scenes.js.
// ============================================================================

// Big arcade button on a hazard-striped pedestal (panic button, choice buttons).
// Returns a Group with userData { dome, domeMat }. Frame it with envelope()/frameBox(), never by hand.
function makeButton(color, label, labelColor = "#f5c400") {
  const g = new THREE.Group();
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 0.7, 64), mat("#2a2421", { roughness: 0.7 })); ped.position.y = 0.35; g.add(ped);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.53, 1.53, 0.16, 64, 1, true), new THREE.MeshStandardMaterial({ map: stripesTex(), roughness: 0.6 })); ring.position.y = 0.6; g.add(ring);
  const plateTop = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.08, 64), mat("#3a3330", { metalness: 0.35, roughness: 0.4 })); plateTop.position.y = 0.74; g.add(plateTop);
  const domeMat = mat(color, { roughness: 0.32, emissive: color, emissiveIntensity: 0.0 });
  const dome = new THREE.Group(); dome.position.y = 0.78;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.98, 0.28, 64), domeMat); base.position.y = 0.14; dome.add(base);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.95, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); cap.scale.y = 0.36; cap.position.y = 0.28; dome.add(cap);
  g.add(dome);
  if (label) {
    const lbl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.34, 48, 1, true, -0.62, 1.24), new THREE.MeshBasicMaterial({ map: plateTex(label, { fg: labelColor, w: 1200, h: 220, font: "900 118px Inter" }), toneMapped: false }));
    lbl.position.set(0, 0.34, 0); g.add(lbl);
  }
  g.add(contactShadow(4.2, 4.2));
  g.userData = { dome, domeMat };
  return g;
}
// Press curve for a button: 0 → 1 quickly at `at`, then settles back to `rest`.
function pressCurve(t, at, rest = 0) { return t < at ? 0 : t < at + 0.1 ? lin(t, at, at + 0.1) : lerp(1, rest, eOut(lin(t, at + 0.1, at + 0.6))); }

// Hinged glass lid for makeButton (opens backwards). Returns the hinge Group (rotate .rotation.x to open).
function makeGlassLid(button) {
  const hinge = new THREE.Group(); hinge.position.set(0, 0.78, -1.3); button.add(hinge);
  const coverMat = new THREE.MeshStandardMaterial({ color: "#d6ecff", transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false });
  const cover = new THREE.Mesh(rbox(2.6, 0.95, 2.6, 0.1), coverMat); cover.position.set(0, 0.48, 1.3); hinge.add(cover);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 0.95, 2.6)), new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55 }));
  edges.position.copy(cover.position); hinge.add(edges);
  return hinge;
}

// Expanding alarm rings on the floor.
function makeAlarmRings(n = 3, color = "#ff3b1f", radius = 1.6) {
  const rings = [];
  for (let i = 0; i < n; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 96), new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false })); r.rotation.x = -Math.PI / 2; r.position.y = 0.05; r.userData.decor = true; rings.push(r); }
  return rings;
}

// Stylised pawn-like person.
function makePerson(color) {
  const p = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 8, 16), mat(color, { roughness: 0.5 })); b.position.y = 0.32; p.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), mat(color, { roughness: 0.5 })); h.position.y = 0.72; p.add(h);
  p.add(contactShadow(0.8, 0.8)); return p;
}

// Gold coin standing upright, face to +z, centre at the origin (so it rests on y = 0 when
// placed at y = r). API: { group, spin(angle) } — spin rolls it around its own axis.
function makeCoin(r = 0.42, face = "R$") {
  const c = makeCanvas(256, 256); const x = c.getContext("2d");
  const gr = x.createRadialGradient(110, 100, 10, 128, 128, 128); gr.addColorStop(0, "#ffe08a"); gr.addColorStop(1, "#d99a22");
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256); x.strokeStyle = "#b67d12"; x.lineWidth = 14; x.beginPath(); x.arc(128, 128, 100, 0, Math.PI * 2); x.stroke();
  x.fillStyle = "#9a6408"; x.font = "900 96px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(face, 128, 134);
  const faceMat = new THREE.MeshStandardMaterial({ map: texFrom(c), metalness: 0.45, roughness: 0.35 });
  const edge = mat("#e0a83a", { metalness: 0.55, roughness: 0.32, emissive: "#7a4a00", emissiveIntensity: 0.3 });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 48), [edge, faceMat, faceMat]);
  mesh.rotation.x = Math.PI / 2;
  const pivot = new THREE.Group(); pivot.add(mesh);
  const group = new THREE.Group(); group.add(pivot); group.userData.r = r;
  return { group, spin: (a) => { pivot.rotation.z = a; } };
}

// Roller shutter that unrolls from a housing. Origin = bottom centre of the closed shutter.
// API: { group, housing, sign, set(k) } — k: 0 = rolled up (hidden in the housing), 1 = closed.
// The sign is printed on a plate (part of the shutter); pop it in once the shutter is closed.
function makeShutter({ w = 1.4, h = 1.6, n = 10, sign = "FECHADO" } = {}) {
  const g = new THREE.Group(); const sh = h / n;
  const housing = new THREE.Mesh(rbox(w + 0.14, 0.24, 0.34, 0.05), mat("#4b4642", { metalness: 0.5, roughness: 0.45 }));
  housing.position.set(0, h + 0.12, 0); g.add(housing);
  const slats = [];
  for (let j = 0; j < n; j++) { // j = 0 is the bottom slat
    const sl = new THREE.Mesh(rbox(w, sh * 0.94, 0.06, 0.02), mat(j % 2 ? "#6b6560" : "#7d7670", { metalness: 0.5, roughness: 0.4 }));
    sl.userData.y = sh * (j + 0.5); sl.position.y = sl.userData.y; g.add(sl); slats.push(sl);
  }
  let plate = null;
  if (sign) { plate = makePlate(sign, w * 0.82, h * 0.24, { bg: RED, fg: "#ffffff" }); plate.position.set(0, h * 0.66, 0.05); g.add(plate); }
  function set(k) {
    const off = (1 - clamp(k)) * h; // slats shift up together; the ones inside the housing are hidden
    for (const sl of slats) { const y = sl.userData.y + off; sl.position.y = y; sl.visible = y <= h - sh * 0.5 + 1e-4; }
  }
  set(1);
  return { group: g, housing, sign: plate, set };
}

// Generic ballot box.
function makeBallotBox() {
  const urn = new THREE.Group();
  const ub = new THREE.Mesh(rbox(1.2, 1.0, 0.9, 0.06), mat("#e9e3d8")); ub.position.y = 0.5; urn.add(ub);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.08), mat("#222")); slot.position.set(0, 1.005, 0); urn.add(slot);
  const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), new THREE.MeshBasicMaterial({ map: plateTex("URNA", { bg: "#e9e3d8", fg: "#3a3330", w: 600, h: 200, font: "900 120px Inter" }), toneMapped: false })); lbl.position.set(0, 0.5, 0.455); urn.add(lbl);
  const ballot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.01), mat("#ffffff")); urn.add(ballot);
  urn.add(contactShadow(2, 1.6));
  urn.userData = { ballot }; return urn;
}

// Stack of banknotes + a small flame (use flame.scale to grow/cut it).
function makeMoneyStack(label = "R$ 100") {
  const g = new THREE.Group();
  const billTex = plateTex(label, { bg: "#2f8a57", fg: "#e6f5ea", w: 512, h: 256, font: "900 90px Inter" });
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.035, 0.55), [mat("#2a7a4c"), mat("#2a7a4c"), new THREE.MeshStandardMaterial({ map: billTex, roughness: 0.8 }), mat("#2a7a4c"), mat("#2a7a4c"), mat("#2a7a4c")]); b.position.set(Math.sin(i * 1.7) * 0.03, 0.02 + i * 0.04, Math.cos(i * 2.1) * 0.03); b.rotation.y = Math.sin(i * 3.1) * 0.08; g.add(b); }
  return g;
}
function makeFlame() {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 16), new THREE.MeshBasicMaterial({ color: "#ff7a1a", transparent: true, toneMapped: false }));
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 12), new THREE.MeshBasicMaterial({ color: "#ffd36b", transparent: true, toneMapped: false })); inner.position.set(0, -0.07, 0.02);
  g.add(outer, inner); return g;
}
function makeSmoke(n = 6) {
  const out = []; for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: "#8a7f78", transparent: true })); s.userData.decor = true; out.push(s); }
  return out;
}

// Floor grid texture plane (for charts).
function makeGridFloor(size = 60, repeat = 12) {
  const c = makeCanvas(512, 512); const x = c.getContext("2d"); x.fillStyle = "#23160f"; x.fillRect(0, 0, 512, 512); x.strokeStyle = "rgba(255,170,120,0.12)"; x.lineWidth = 3;
  for (let i = 0; i <= 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
  const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; return m;
}
