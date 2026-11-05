// ============================================================================
// engine/props/services.js — serviço público e comércio (vídeo Correios × Anatel, 04/11/2026):
// rack de servidores e sala de dados (data center), caixa registradora de loja, caixa de correio de
// parede, palete de dinheiro içado por cabos, estrada de terra até o horizonte (interior do Brasil).
// Units: metres. Origins on the floor unless noted; fronts face +z.
// ============================================================================

// Vented steel face of a 1U/2U server: horizontal slots and two handles. Cached texture.
function serverFaceTex() {
  return cachedTex("serverFace", () => {
    const c = makeCanvas(512, 64), x = c.getContext("2d");
    x.fillStyle = "#2b2e34"; x.fillRect(0, 0, 512, 64);
    x.fillStyle = "#15171b"; for (let i = 0; i < 46; i++) { const px = 70 + i * 8; x.fillRect(px, 14, 4, 36); }
    x.fillStyle = "#3d4149"; x.fillRect(0, 0, 512, 3); x.fillStyle = "#1b1d21"; x.fillRect(0, 61, 512, 3);
    x.fillStyle = "#7c828c"; x.fillRect(12, 18, 10, 28); x.fillRect(490, 18, 10, 28);
    return texFrom(c);
  });
}
// Raised-floor tile of a data center: 60 cm squares, every other one perforated. Cached texture.
function raisedFloorTex() {
  return cachedTex("raisedFloor", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d");
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = (i + j) % 2 ? "#9aa0a8" : "#8d939b"; x.fillRect(i * 128, j * 128, 128, 128);
      if ((i + j) % 2 === 0) { x.fillStyle = "#4d535b"; for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) { x.beginPath(); x.arc(i * 128 + 16 + a * 12, j * 128 + 16 + b * 12, 3, 0, Math.PI * 2); x.fill(); } }
      x.strokeStyle = "#5c626a"; x.lineWidth = 3; x.strokeRect(i * 128 + 1.5, j * 128 + 1.5, 125, 125);
    }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// Server rack: a dark steel cabinet (w × h × d) with side rails, feet and a top cable cut-out; the front
// holds `units` servers (vented faces) each with a row of status LEDs (instanced). leds(t, power): LEDs blink
// with power 1, flicker and go out as power → 0 (a few stay red: alarm). Origin: floor centre; front +z.
// API { group, leds(t, power), w, h, d }
function makeServerRack({ w = 0.62, h = 2.0, d = 0.9, units = 11, seed = 3 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const steel = pmat("#1d2025", { metalness: 0.55, roughness: 0.45 }), rail = pmat("#3a3e45", { metalness: 0.7, roughness: 0.35 });
  const body = new THREE.Mesh(rbox(w, h - 0.04, d, 0.015), steel); body.position.y = 0.04 + (h - 0.04) / 2; g.add(body);
  for (const s of [-1, 1]) for (const z of [-1, 1]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.04, 12), rail); f.position.set(s * (w / 2 - 0.06), 0.02, z * (d / 2 - 0.08)); g.add(f); }
  // front frame: two vertical rails and a top header with a vent
  for (const s of [-1, 1]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(0.035, h - 0.16, 0.02), rail); rl.position.set(s * (w / 2 - 0.035), 0.04 + (h - 0.04) / 2, d / 2 + 0.008); g.add(rl); }
  const head = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.1, 0.02), rail); head.position.set(0, h - 0.08, d / 2 + 0.008); g.add(head);
  // servers
  const faceM = pmat("#ffffff", { map: serverFaceTex(), metalness: 0.5, roughness: 0.45 });
  const usable = h - 0.34, uh = usable / units, leds = [];
  for (let i = 0; i < units; i++) {
    const y = 0.12 + uh * (i + 0.5);
    const sv = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, uh * 0.86, 0.03), faceM); sv.position.set(0, y, d / 2 + 0.01); g.add(sv);
    const n = 3 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) leds.push({ x: w / 2 - 0.09 - k * 0.035, y, ph: r() * 6.28, f: 2 + r() * 7, c: r() < 0.6 ? "#3cff7a" : r() < 0.8 ? "#3aa8ff" : "#ffb02a", alarm: r() < 0.18 });
  }
  const ledM = new THREE.MeshBasicMaterial({ toneMapped: false }), led = new THREE.InstancedMesh(new THREE.BoxGeometry(0.014, 0.014, 0.006), ledM, leds.length);
  const o = new THREE.Object3D(); leds.forEach((L, i) => { o.position.set(L.x, L.y, d / 2 + 0.028); o.updateMatrix(); led.setMatrixAt(i, o.matrix); led.setColorAt(i, new THREE.Color(L.c)); });
  led.userData.noShadow = true; g.add(led);
  const glow = sprite(BOKEH, w * 1.4); glow.material.color.set("#4fd0ff"); glow.material.blending = THREE.AdditiveBlending; glow.material.opacity = 0.18; glow.position.set(0, h * 0.5, d / 2 + 0.12); glow.userData.decor = true; g.add(glow);
  g.add(contactShadow(w + 0.3, d + 0.3));
  const c = new THREE.Color();
  function setLeds(t, power = 1) {
    leds.forEach((L, i) => {
      const blink = Math.sin(t * L.f + L.ph) > -0.2 ? 1 : 0.25;
      const flick = power > 0.02 && power < 0.98 ? (Math.sin(t * 37 + L.ph * 5) > 0 ? 1 : 0.2) : 1;
      if (L.alarm && power < 0.5) c.set("#ff2a1a").multiplyScalar(Math.sin(t * 6 + L.ph) > 0 ? 1 : 0.3);
      else c.set(L.c).multiplyScalar(clamp(power) * blink * flick);
      led.setColorAt(i, c);
    });
    led.instanceColor.needsUpdate = true; glow.material.opacity = 0.18 * clamp(power);
  }
  setLeds(0, 1);
  return { group: g, leds: setLeds, w, h, d };
}

// Data center aisle at night (backdrop): raised perforated floor with cold blue light coming up, two rows
// of racks receding along -z beyond `z0` on both sides of the aisle (each with a lit LED panel), yellow
// cable trays and white light strips overhead, the cold aisle's glass end door glowing blue, cold mist.
// power(k): strips, LEDs and the door dim; at low power a red alarm beacon turns at the end of the aisle.
// API { group, update(t), power(k) }
function makeDataCenterSet({ z0 = -1.4, n = 12, aisle = 2.4, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), pitch = 0.64, L = n * pitch, zEnd = z0 - L - 0.4;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 24), pmat("#ffffff", { map: tileTex(raisedFloorTex(), 14 / 1.2, 24 / 1.2), roughness: 0.32, clearcoat: 0.5, metalness: 0.2 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, z0 - 8); g.add(fl);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 24), mat("#15181d", { roughness: 0.9 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.6, z0 - 8); g.add(ceil);
  // rack rows: instanced cabinets with an LED panel each (canvas: dots in rows)
  const ledTex = (() => { const c = makeCanvas(64, 256), x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 64, 256); for (let j = 0; j < 22; j++) for (let i = 0; i < 4; i++) { if (r() < 0.55) { x.fillStyle = r() < 0.7 ? "#3cff7a" : r() < 0.85 ? "#3aa8ff" : "#ffb02a"; x.fillRect(40 + i * 5, 12 + j * 11, 3, 3); } } x.fillStyle = "rgba(80,90,110,0.5)"; for (let j = 0; j < 22; j++) x.fillRect(6, 10 + j * 11, 30, 2); return texFrom(c); })();
  const cabM = pmat("#1b1e23", { metalness: 0.5, roughness: 0.5 }), panM = new THREE.MeshBasicMaterial({ map: ledTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const cab = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 2.05, 0.95), cabM, n * 2), pan = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 1.7), panM, n * 2);
  const o = new THREE.Object3D(); let k = 0;
  for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
    const x = s * (aisle / 2 + 0.48), z = z0 - pitch * (i + 0.5);
    o.position.set(x, 1.025, z); o.rotation.set(0, s * Math.PI / 2 * -1, 0); o.updateMatrix(); cab.setMatrixAt(k, o.matrix);
    o.position.set(x - s * 0.48, 1.1, z); o.updateMatrix(); pan.setMatrixAt(k, o.matrix); k++;
  }
  g.add(cab, pan);
  // overhead cable trays (yellow) and light strips across the aisle
  const trayM = pmat("#d8a51c", { metalness: 0.4, roughness: 0.5 });
  for (const s of [-1, 1]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, L + 2), trayM); tr.position.set(s * (aisle / 2 + 0.48), 2.5, z0 - L / 2); g.add(tr); }
  const stripM = new THREE.MeshBasicMaterial({ color: "#e6f2ff", toneMapped: false }), strips = [];
  for (let i = 0; i < Math.ceil(L / 1.3) + 2; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(aisle * 0.7, 0.03, 0.12), stripM); st.position.set(0, 3.55, z0 + 0.6 - i * 1.3); g.add(st); strips.push(st); }
  // cold light coming up through the perforated tiles of the aisle
  const coldM = [];
  for (let i = 0; i < n; i += 2) { const gl = makeFloorGlow(aisle * 0.8, 0.9, { color: "#6fc8ff", opacity: 0.18 }); gl.position.set(0, 0.012, z0 - pitch * (i + 1)); g.add(gl); coldM.push(gl.material); }
  // end door of the cold aisle: glass panels lit blue from behind
  const doorM = new THREE.MeshBasicMaterial({ color: "#3a7fd0", toneMapped: false });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(aisle + 1.6, 2.6), doorM); door.position.set(0, 1.3, zEnd); g.add(door);
  for (let i = -2; i <= 2; i++) { const mu = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.6, 0.05), pmat("#9aa3ad", { metalness: 0.8, roughness: 0.3 })); mu.position.set(i * (aisle + 1.6) / 4, 1.3, zEnd + 0.03); g.add(mu); }
  const doorGlow = sprite(BOKEH, 6); doorGlow.material.color.set("#5aa8ff"); doorGlow.material.blending = THREE.AdditiveBlending; doorGlow.material.opacity = 0.35; doorGlow.position.set(0, 1.4, zEnd + 0.4); g.add(doorGlow);
  // red alarm beacon above the end door
  const beaconM = new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false }), beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10), beaconM); beacon.position.set(0, 2.85, zEnd + 0.1); g.add(beacon);
  const beam = sprite(BOKEH, 3.2); beam.material.color.set("#ff2a1a"); beam.material.blending = THREE.AdditiveBlending; beam.position.copy(beacon.position); g.add(beam);
  const motes = makeSetMotes(120, [[-aisle / 2, 0.1, zEnd], [aisle / 2, 2.6, z0]], { color: "#bfe6ff", seed: seed + 3, opacity: 0.3 }); g.add(motes.points);
  asBackdrop(g);
  let P = 1;
  return {
    group: g,
    update(t) {
      motes.update(t);
      const alarm = clamp((0.6 - P) / 0.4), pulse = 0.5 + 0.5 * Math.sin(t * 7);
      beaconM.color.set("#ff2a1a").multiplyScalar(0.2 + 0.8 * alarm * pulse); beam.material.opacity = 0.7 * alarm * pulse;
    },
    power(k) {
      P = clamp(k);
      stripM.color.set("#e6f2ff").multiplyScalar(0.08 + 0.92 * P); panM.opacity = 0.15 + 0.85 * P;
      doorM.color.set("#3a7fd0").multiplyScalar(0.15 + 0.85 * P); doorGlow.material.opacity = 0.35 * P;
      coldM.forEach((m) => { m.opacity = 0.18 * P; });
    },
  };
}

// Shop cash register (balcão): beige plastic housing on a steel cash drawer that slides out towards the
// cashier (+z), a slanted keypad with a red and a green key, a display on a short post at the back, and
// the receipt printer on the right with its paper roll (the "bobina") behind a smoked window and a strip
// of receipt coming out of the slot. paper(k): 1 = full roll, 0 = only the cardboard core left.
// Origin: bottom centre; the cashier stands at +z. API { group, drawer(k), paper(k), top, mouth: V3 (local
// point on the back of the housing where a tube can leave), display }
function makeCashRegister({ s = 1, color = "#d9d2c3", display = "R$ 0,00" } = {}) {
  const g = new THREE.Group(), body = pmat(color, { roughness: 0.42, clearcoat: 0.3 }), dark = pmat("#2a2c30", { roughness: 0.4, metalness: 0.3 }), steel = steelMat(0.3);
  const W = 0.46 * s, DH = 0.11 * s, D = 0.46 * s;
  // drawer housing and the sliding drawer
  const dh = new THREE.Mesh(rbox(W, DH, D, 0.012), dark); dh.position.y = DH / 2; g.add(dh);
  const drw = new THREE.Group(); g.add(drw);
  const dfront = new THREE.Mesh(rbox(W - 0.02, DH - 0.02, 0.02, 0.006), steel); dfront.position.set(0, DH / 2, D / 2 + 0.006); drw.add(dfront);
  const handle = new THREE.Mesh(rbox(W * 0.3, 0.012, 0.016, 0.004), dark); handle.position.set(0, DH * 0.7, D / 2 + 0.022); drw.add(handle);
  const key = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * s, 0.008 * s, 0.01, 12), pmat("#c9a45a", { metalness: 1, roughness: 0.3 })); key.rotation.x = Math.PI / 2; key.position.set(W * 0.32, DH * 0.4, D / 2 + 0.018); drw.add(key);
  const tray = new THREE.Mesh(new THREE.BoxGeometry(W - 0.05, 0.012, D * 0.8), dark); tray.position.set(0, 0.02, D / 2 - D * 0.4); drw.add(tray);
  for (let i = 0; i < 4; i++) { const b = makeCashBundle({ w: (W - 0.1) / 4 - 0.01, d: D * 0.32, h: 0.025 * s }); b.position.set(-W / 2 + 0.05 + (i + 0.5) * ((W - 0.1) / 4), 0.026, D / 2 - D * 0.2); drw.add(b); }
  // upper housing: a wedge, higher at the back, with the slanted keypad in front
  const UH = 0.14 * s, up = new THREE.Mesh(rbox(W, UH, D * 0.5, 0.02), body); up.position.set(0, DH + UH / 2, -D * 0.25); g.add(up);
  const slant = new THREE.Group(); slant.position.set(0, DH + 0.01, D * 0.0); slant.rotation.x = -0.42; g.add(slant);
  const kp = new THREE.Mesh(rbox(W, 0.04, D * 0.56, 0.015), body); kp.position.set(0, 0.0, D * 0.27); slant.add(kp);
  const keyM = pmat("#f2efe8", { roughness: 0.35 }), keyD = pmat("#6b6f76", { roughness: 0.4 });
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
    const m = i === 4 && j === 3 ? pmat(GREEN, { roughness: 0.35 }) : i === 4 && j === 0 ? pmat(RED, { roughness: 0.35 }) : j === 3 ? keyD : keyM;
    const kk = new THREE.Mesh(rbox(0.05 * s, 0.018, 0.04 * s, 0.006), m); kk.position.set(-W * 0.3 + i * 0.062 * s - 0.03 * s, 0.026, D * 0.08 + j * 0.052 * s); slant.add(kk);
  }
  // display on a post at the back (faces the cashier)
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.1 * s, 12), dark); post.position.set(-W * 0.18, DH + UH + 0.05 * s, -D * 0.38); g.add(post);
  const box = new THREE.Mesh(rbox(0.26 * s, 0.09 * s, 0.05 * s, 0.01), dark); box.position.set(-W * 0.18, DH + UH + 0.13 * s, -D * 0.38); box.rotation.x = -0.15; g.add(box);
  const disp = makePlate(display, 0.22 * s, 0.06 * s, { bg: "#0d1a12", fg: "#5dff9a", depth: 0.004, detail: true }); disp.position.set(0, 0, 0.027 * s); box.add(disp);
  // receipt printer on the right: smoked window with the paper roll behind, the strip out of the slot
  const pr = new THREE.Group(); pr.position.set(W * 0.3, DH + UH, -D * 0.2); g.add(pr);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.08 * s, 32), pmat("#fbf8f1", { roughness: 0.7 })); roll.rotation.z = Math.PI / 2; roll.position.set(0, 0.055 * s, 0); pr.add(roll);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * s, 0.012 * s, 0.085 * s, 16), pmat("#a07a4a", { roughness: 0.8 })); core.rotation.z = Math.PI / 2; core.position.copy(roll.position); pr.add(core);
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.065 * s, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat({ color: "#3a3f48", opacity: 0.35 })); win.scale.set(0.85, 1.05, 1); win.position.y = 0.0; win.userData.noShadow = true; pr.add(win);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.075 * s, 0.11 * s, 0.002), pmat("#fbf8f1", { roughness: 0.8 })); strip.position.set(0, 0.07 * s + 0.055 * s, 0.05 * s); strip.rotation.x = -0.25; pr.add(strip);
  for (let i = 0; i < 4; i++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.004, 0.001), mat("#6a6a6a")); ln.position.set(0, -0.03 * s + i * 0.018 * s, 0.0015); strip.add(ln); }
  g.add(contactShadow(W + 0.2, D + 0.2));
  const R0 = 0.05 * s, R1 = 0.013 * s;
  function paper(k) { const rr = lerp(R1, R0, clamp(k)); roll.scale.set(rr, 1, rr); strip.visible = k > 0.08; }
  paper(1);
  return { group: g, drawer: (k) => { drw.position.z = 0.26 * s * clamp(k); }, paper, top: DH + UH, mouth: new V3(0, DH + UH * 0.6, -D / 2), display: disp };
}

// Wall-mounted letterbox (home "caixa de correio"): painted steel box with a sloped rain lid, a letter
// slot with a hinged flap, a small door at the bottom with a keyhole and the word CARTAS printed. Option
// web: a cobweb strung from the lid to the wall (abandoned). Origin: back centre (on the wall); front +z.
// API { group, flap(k), plate }
function makeMailbox({ color = "#e0b21c", w = 0.42, h = 0.5, d = 0.18, web = true } = {}) {
  const g = new THREE.Group(), paint = pmat(color, { roughness: 0.38, clearcoat: 0.5, metalness: 0.2 }), dark = pmat("#1c1c1e", { roughness: 0.6 });
  const box = new THREE.Mesh(rbox(w, h, d, 0.015), paint); box.position.set(0, 0, d / 2); g.add(box);
  const lid = new THREE.Mesh(rbox(w + 0.04, 0.025, d + 0.05, 0.008), paint); lid.position.set(0, h / 2 + 0.03, d / 2 + 0.015); lid.rotation.x = 0.22; g.add(lid);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, 0.03, 0.004), dark); slot.position.set(0, h * 0.28, d + 0.002); g.add(slot);
  const fp = new THREE.Group(); fp.position.set(0, h * 0.28 + 0.02, d + 0.006); g.add(fp);
  const flap = new THREE.Mesh(rbox(w * 0.68, 0.05, 0.008, 0.003), paint); flap.position.y = -0.025; fp.add(flap);
  const door = new THREE.Mesh(rbox(w * 0.8, h * 0.4, 0.006, 0.004), pmat(color, { roughness: 0.5, clearcoat: 0.3 })); door.position.set(0, -h * 0.22, d + 0.003); g.add(door);
  const kh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16), pmat("#c9a45a", { metalness: 1, roughness: 0.3 })); kh.rotation.x = Math.PI / 2; kh.position.set(w * 0.28, -h * 0.22, d + 0.008); g.add(kh);
  const plate = makePlate("CARTAS", w * 0.6, h * 0.14, { bg: "#1c1c1e", fg: "#f4efe2", depth: 0.004 }); plate.position.set(0, h * 0.06, d + 0.004); g.add(plate);
  if (web) {
    const pts = [], cx = w / 2 + 0.02, cy = h / 2 + 0.02, cz = d * 0.4;
    for (let i = 0; i < 6; i++) { const a = (i / 5) * Math.PI / 2; pts.push(new V3(cx, cy, cz), new V3(cx + 0.16 * Math.cos(a), cy + 0.16 * Math.sin(a) * 0.9, cz * (1 - i / 6))); }
    for (let ring = 1; ring <= 3; ring++) for (let i = 0; i < 5; i++) { const a0 = (i / 5) * Math.PI / 2, a1 = ((i + 1) / 5) * Math.PI / 2, rr = 0.05 * ring; pts.push(new V3(cx + rr * Math.cos(a0), cy + rr * Math.sin(a0) * 0.9, cz * (1 - i / 6)), new V3(cx + rr * Math.cos(a1), cy + rr * Math.sin(a1) * 0.9, cz * (1 - (i + 1) / 6))); }
    const webL = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#e8e4dc", transparent: true, opacity: 0.55 })); webL.userData.decor = true; g.add(webL);
  }
  return { group: g, flap: (k) => { fp.rotation.x = -1.1 * clamp(k); }, plate };
}

// Wooden pallet stacked with shrink-wrapped bundles of banknotes, the value printed on a card in front,
// four lifting straps up to a steel ring and the crane cable going up out of frame (nothing floats).
// Origin: bottom centre of the pallet. API { group, top, plate, ring: y of the ring, rig(on) } — the straps,
// ring and cable are decor (thin; the cable leaves the frame); rig(false) unhooks them once it has landed.
function makeMoneyPallet(label, { w = 0.9, d = 0.7, h = 0.55, cable = 8, seed = 4 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const wood = pmat("#ffffff", { map: woodTex("#a07a4e"), roughness: 0.7 }), PH = 0.13;
  for (const z of [-1, 0, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.09), wood); st.position.set(0, 0.04, z * (d / 2 - 0.045)); g.add(st); }
  for (let i = 0; i < 6; i++) { const bd = new THREE.Mesh(new THREE.BoxGeometry(w / 6 - 0.015, 0.025, d), wood); bd.position.set(-w / 2 + (i + 0.5) * (w / 6), 0.08 + 0.0125, 0); g.add(bd); }
  // bundles: instanced, in layers (top note face up), slightly irregular
  const bw = w / 4, bd = d / 3, bh = 0.06, layers = Math.max(1, Math.round((h - PH) / bh)), n = 4 * 3 * layers;
  const proto = makeCashBundle({ w: bw - 0.008, d: bd - 0.008, h: bh - 0.004 });
  const meshes = []; proto.traverse((m) => { if (m.isMesh) meshes.push(m); });
  const o = new THREE.Object3D();
  meshes.forEach((m) => {
    const im = new THREE.InstancedMesh(m.geometry, m.material, n); let k = 0;
    for (let L = 0; L < layers; L++) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      o.position.set(-w / 2 + (i + 0.5) * bw + m.position.x, PH + L * bh + m.position.y, -d / 2 + (j + 0.5) * bd + m.position.z); o.rotation.set(0, (r() - 0.5) * 0.04, 0); o.updateMatrix(); im.setMatrixAt(k++, o.matrix);
    }
    g.add(im);
  });
  const top = PH + layers * bh;
  const wrap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, top - PH + 0.01, d + 0.02), glassMat({ opacity: 0.16, roughness: 0.15 })); wrap.position.y = PH + (top - PH) / 2; wrap.userData.noShadow = true; g.add(wrap);
  const plate = makePlate(label, w * 0.92, Math.min(0.24, (top - PH) * 0.6), { bg: "#141414", fg: "#ffffff", depth: 0.01 }); plate.position.set(0, PH + (top - PH) * 0.5, d / 2 + 0.017); g.add(plate);
  // straps from the four corners to the ring, then the cable
  const ringY = top + 0.55, strapM = pmat("#e0761a", { roughness: 0.7 }), rigG = new THREE.Group(); g.add(rigG);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const a = new V3(sx * (w / 2 - 0.02), PH + 0.02, sz * (d / 2 - 0.02)), b = new V3(0, ringY, 0), dd = b.clone().sub(a);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.035, dd.length(), 0.006), strapM); st.position.copy(a).addScaledVector(dd, 0.5); st.quaternion.setFromUnitVectors(new V3(0, 1, 0), dd.normalize()); rigG.add(st);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 24), steelMat(0.3)); ring.position.y = ringY; rigG.add(ring);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, cable, 8), pmat("#2a2a2c", { metalness: 0.6, roughness: 0.4 })); cab.position.y = ringY + cable / 2; rigG.add(cab);
  asBackdrop(rigG);
  return { group: g, top, plate, ring: ringY, rig: (on) => { rigG.visible = !!on; } };
}

// Red-earth dirt road running to the horizon (Brazil's interior at sunset), backdrop: the road with two
// wheel ruts and puddles that catch the sky, grass verges, clumps of bush, buriti palms, wooden power
// poles with sagging wires, a far tree line and a sunset sky dome with the sun's glow on the horizon.
// API { group, update(t) }
function dirtRoadTex() {
  return cachedTex("dirtRoad", () => {
    const c = makeCanvas(256, 512), x = c.getContext("2d"), r = mulberry32(17);
    x.fillStyle = "#9a4e2a"; x.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 2600; i++) { const v = r(); x.fillStyle = v < 0.5 ? "rgba(70,30,14,0.35)" : v < 0.85 ? "rgba(190,110,70,0.3)" : "rgba(230,190,150,0.35)"; x.fillRect(r() * 256, r() * 512, 1 + r() * 3, 1 + r() * 3); }
    for (const cx of [72, 184]) { const gr = x.createLinearGradient(cx - 26, 0, cx + 26, 0); gr.addColorStop(0, "rgba(60,24,10,0)"); gr.addColorStop(0.5, "rgba(60,24,10,0.45)"); gr.addColorStop(1, "rgba(60,24,10,0)"); x.fillStyle = gr; x.fillRect(cx - 26, 0, 52, 512); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
function makeDirtRoadSet({ seed = 9, roadW = 3.2 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  // sky dome: warm horizon, violet, deep blue overhead
  const R = 160, geo = new THREE.SphereGeometry(R, 48, 32), pos = geo.attributes.position, col = [];
  const stops = [[-1, "#1a0f0a"], [-0.01, "#4a2618"], [0.0, "#e0773a"], [0.05, "#f0a052"], [0.12, "#b65a4a"], [0.26, "#4a2c52"], [0.55, "#1b1a35"], [1, "#0d0e1c"]];
  const c = new THREE.Color(), a = new THREE.Color(), b = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const e = pos.getY(i) / R; let k = 0; while (k < stops.length - 2 && e > stops[k + 1][0]) k++; a.set(stops[k][1]); b.set(stops[k + 1][1]); c.copy(a).lerp(b, clamp((e - stops[k][0]) / (stops[k + 1][0] - stops[k][0]))); col.push(c.r, c.g, c.b); }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false })); sky.renderOrder = -1; g.add(sky);
  const sun = sprite(BOKEH, 34); sun.material.color.set("#ffc27a"); sun.material.blending = THREE.AdditiveBlending; sun.material.opacity = 0.75; sun.material.fog = false; sun.position.set(8, 3, -120); g.add(sun);
  // ground: grass both sides, the road down the middle
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(240, 200), mat("#ffffff", { map: tileTex(grassTex(), 60, 50), color: "#7f8a4a", roughness: 0.95 })); grass.rotation.x = -Math.PI / 2; grass.position.set(0, 0.0, -90); g.add(grass);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(roadW, 200), mat("#ffffff", { map: tileTex(dirtRoadTex(), 1, 40), roughness: 0.92 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.004, -90); g.add(road);
  const puddleM = pmat("#c98a6a", { roughness: 0.05, metalness: 0.3, clearcoat: 1 });
  for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.3 + r() * 0.4, 20), puddleM); p.rotation.x = -Math.PI / 2; p.scale.set(1, 0.5 + r() * 0.3, 1); p.position.set((r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.5), 0.008, -3 - i * 6 - r() * 4); g.add(p); }
  // bushes: instanced spheres in clumps along the verges
  const bushM = mat("#3d5a2a", { roughness: 0.9 }), bushes = [];
  for (let i = 0; i < 70; i++) { const s = r() < 0.5 ? -1 : 1, z = -2 - r() * 70; bushes.push([s * (roadW / 2 + 0.8 + r() * 6), z, 0.4 + r() * 0.9]); }
  const bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), bushM, bushes.length); const o = new THREE.Object3D();
  bushes.forEach(([x, z, s], i) => { o.position.set(x, s * 0.55, z); o.scale.set(s * 1.3, s, s * 1.1); o.rotation.y = r() * 6; o.updateMatrix(); bush.setMatrixAt(i, o.matrix); }); g.add(bush);
  // buriti palms: a slim trunk and a crown of fan fronds
  const trunkM = mat("#5a4a3a", { roughness: 0.9 }), frondM = mat("#4f6a2e", { roughness: 0.8, side: THREE.DoubleSide });
  for (let i = 0; i < 16; i++) {
    const s = i % 2 ? 1 : -1, x = s * (roadW / 2 + 2 + r() * 9), z = -6 - i * 4.5 - r() * 3, hh = 5 + r() * 4;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, hh, 8), trunkM); tr.position.set(x, hh / 2, z); g.add(tr);
    for (let k = 0; k < 9; k++) { const fr = new THREE.Mesh(new THREE.CircleGeometry(1.3, 10, 0, Math.PI * 0.7), frondM); const ang = (k / 9) * Math.PI * 2; fr.position.set(x + Math.cos(ang) * 0.5, hh + 0.2, z + Math.sin(ang) * 0.5); fr.rotation.set(-0.5, ang, 0); g.add(fr); }
  }
  // far tree line (dark silhouettes) and power poles with sagging wires
  const lineM = mat("#2a2f22", { roughness: 1 });
  for (let i = 0; i < 40; i++) { const tl = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), lineM); const x = -60 + i * 3 + r() * 2; tl.position.set(x, 1.5 + r() * 1.5, -75 - r() * 10); tl.scale.set(2 + r() * 2, 2 + r() * 2, 2); g.add(tl); }
  const poleM = mat("#4a3828", { roughness: 0.9 }), wireM = new THREE.LineBasicMaterial({ color: "#151515" }), tops = [];
  for (let i = 0; i < 9; i++) { const z = -4 - i * 8, x = -(roadW / 2 + 1.4); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 7, 8), poleM); p.position.set(x, 3.5, z); g.add(p); const cb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), poleM); cb.position.set(x, 6.6, z); g.add(cb); tops.push(new V3(x, 6.65, z)); }
  for (let i = 0; i + 1 < tops.length; i++) for (const dx of [-0.5, 0.5]) { const a0 = tops[i].clone().setX(tops[i].x + dx), a1 = tops[i + 1].clone().setX(tops[i + 1].x + dx); const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(a0.clone().lerp(a1, u).add(new V3(0, -0.6 * Math.sin(Math.PI * u), 0))); } g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireM)); }
  const motes = makeSetMotes(80, [[-4, 0.3, -12], [4, 3, 1]], { color: "#ffd9a0", seed: seed + 5, opacity: 0.4 }); g.add(motes.points);
  asBackdrop(g);
  return { group: g, update(t) { motes.update(t); sun.material.opacity = 0.7 + 0.05 * Math.sin(t * 0.7); } };
}
