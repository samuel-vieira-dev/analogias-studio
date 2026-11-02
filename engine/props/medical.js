// ============================================================================
// props/medical.js · clinic and treatment objects (first used in the chemical castration video,
// 01/11/2026): syringe, injection vial, scalpel tray, wall switch with a mechanical timer, torn
// wiring, the living room at night, the clinic room, an X-ray light box, glucometer, ECG monitor,
// blood tube rack, therapy armchairs, desk planner, patient wristband, two-pan scale and the prison gate.
// Every object is built from computed parts; origins and API are in each comment.
// ============================================================================

const MED_STEEL = () => pmat("#c9ced4", { metalness: 1, roughness: 0.22 });
const MED_GLASS = () => new THREE.MeshPhysicalMaterial({ color: "#eef6ff", roughness: 0.05, transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.35, depthWrite: false, envMapIntensity: 1.4 });

// Syringe lying along x (needle towards +x). Origin: centre of the barrel axis; it rests on a table
// when its origin is `r` above the top. API { group, r, len, plunger(k) } — k 1 = full, 0 = pushed in.
function makeSyringe({ len = 0.9, r = 0.055, liquid = "#f2c66b" } = {}) {
  const g = new THREE.Group(), bl = len * 0.56;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, bl, 32, 1, true), MED_GLASS()); barrel.rotation.z = Math.PI / 2; g.add(barrel);
  const liqM = pmat(liquid, { roughness: 0.15, transparent: true, opacity: 0.8, emissive: liquid, emissiveIntensity: 0.15 });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.88, 1, 28), liqM); liq.rotation.z = Math.PI / 2; g.add(liq);
  // printed scale on the barrel
  const tickM = new THREE.MeshBasicMaterial({ color: "#2a2a2a" });
  for (let i = 0; i <= 10; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.0015, i % 5 ? r * 0.5 : r * 0.9), tickM); tk.position.set(-bl / 2 + 0.03 + i * (bl - 0.06) / 10, r * 0.99, 0); tk.rotation.x = Math.PI / 2; tk.position.z = r * 0.25; tk.position.y = r * 0.97; g.add(tk); }
  const flange = new THREE.Mesh(rbox(0.02, r * 4.2, r * 2.2, 0.008), pmat("#f4f4f2", { roughness: 0.3 })); flange.position.x = -bl / 2; g.add(flange);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.75, len * 0.06, 20), pmat("#f4f4f2", { roughness: 0.3 })); hub.rotation.z = -Math.PI / 2; hub.position.x = bl / 2 + len * 0.03; g.add(hub);
  const nl = len * 0.3, needle = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, nl, 8), MED_STEEL()); needle.rotation.z = Math.PI / 2; needle.position.x = bl / 2 + len * 0.06 + nl / 2; g.add(needle);
  const capHub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.012, 16), pmat("#f28c28", { roughness: 0.4 })); capHub.rotation.z = Math.PI / 2; capHub.position.x = bl / 2 + len * 0.062; g.add(capHub);
  // plunger: rubber stopper, rod with cross section, thumb press
  const pl = new THREE.Group(); g.add(pl);
  const stopper = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.03, 28), pmat("#1b1b1d", { roughness: 0.6 })); stopper.rotation.z = Math.PI / 2; pl.add(stopper);
  const rodL = bl * 0.95;
  for (const rx of [0, Math.PI / 2]) { const rod = new THREE.Mesh(new THREE.BoxGeometry(rodL, r * 1.3, 0.008), pmat("#f4f4f2", { roughness: 0.35 })); rod.rotation.x = rx; rod.position.x = -rodL / 2; pl.add(rod); }
  const thumb = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.4, r * 1.4, 0.016, 28), pmat("#f4f4f2", { roughness: 0.35 })); thumb.rotation.z = Math.PI / 2; thumb.position.x = -rodL; pl.add(thumb);
  const x0 = -bl / 2 + 0.02, x1 = bl / 2 - 0.02;
  const plunger = (k) => { k = clamp(k); const sx = lerp(x1 - 0.02, x0, k); pl.position.x = sx; const l = Math.max(0.001, x1 - sx - 0.015); liq.scale.set(1, l, 1); liq.position.x = sx + 0.015 + l / 2; liq.visible = l > 0.01; };
  plunger(1);
  return { group: g, r: r * 1.4, len, plunger };
}

// Injection vial: glass body, rubber stopper with an aluminium crimp and an orange flip-off top,
// printed label. Origin: bottom centre. API { group, h }
function makeMedVial(label = "INJEÇÃO", { r = 0.075, h = 0.22, liquid = "#f2c66b" } = {}) {
  const g = new THREE.Group(), bh = h * 0.72;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, bh, 36), MED_GLASS()); body.position.y = bh / 2; g.add(body);
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, bh * 0.6, 32), pmat(liquid, { roughness: 0.12, transparent: true, opacity: 0.85, emissive: liquid, emissiveIntensity: 0.12 })); liq.position.y = bh * 0.32; g.add(liq);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.95, h * 0.08, 28), MED_GLASS()); neck.position.y = bh + h * 0.04; g.add(neck);
  const crimp = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, h * 0.12, 28), MED_STEEL()); crimp.position.y = bh + h * 0.08 + h * 0.06; g.add(crimp);
  const flip = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, h * 0.05, 28), pmat("#f28c28", { roughness: 0.35, clearcoat: 0.6 })); flip.position.y = bh + h * 0.2 + h * 0.025; g.add(flip);
  // curved paper label = a thin cylinder band + a flat plate with the text on its front
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, bh * 0.5, 36, 1, true), pmat("#f6f3ec", { roughness: 0.8 })); band.position.y = bh * 0.45; g.add(band);
  const pl = makePlate(label, r * 1.5, bh * 0.3, { bg: "#f6f3ec", fg: "#1c1410", depth: 0.004 }); pl.position.set(0, bh * 0.45, r * 1.01); g.add(pl);
  g.add(contactShadow(r * 4, r * 4));
  return { group: g, h, label: pl };
}

// Stainless instrument tray with a scalpel on it. Origin: floor of the tray (bottom centre); the
// scalpel is a child you can animate. API { group, scalpel, top }
function makeScalpelTray({ w = 1.1, d = 0.7 } = {}) {
  const g = new THREE.Group(), steel = MED_STEEL(), H = 0.05;
  const base = new THREE.Mesh(rbox(w, 0.012, d, 0.005), steel); base.position.y = 0.006; g.add(base);
  for (const [bw, bd, x, z] of [[w, 0.012, 0, d / 2], [w, 0.012, 0, -d / 2], [0.012, d, w / 2, 0], [0.012, d, -w / 2, 0]]) { const rim = new THREE.Mesh(rbox(bw, H, bd, 0.005), steel); rim.position.set(x, H / 2, z); g.add(rim); }
  // a folded green surgical cloth under the instruments
  const cloth = new THREE.Mesh(rbox(w * 0.8, 0.01, d * 0.7, 0.004), mat("#ffffff", { map: tileTex(fabricTex("#2f6b5a"), 2, 2), roughness: 0.95 })); cloth.position.y = 0.017; g.add(cloth);
  const sc = new THREE.Group(); sc.position.y = 0.022 + 0.008; g.add(sc);
  const handle = new THREE.Mesh(rbox(0.42, 0.016, 0.05, 0.006), steel); handle.position.x = -0.12; sc.add(handle);
  for (let i = 0; i < 8; i++) { const gr = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.018, 0.052), pmat("#9aa0a6", { metalness: 1, roughness: 0.4 })); gr.position.set(-0.3 + i * 0.022, 0, 0); sc.add(gr); }
  const bs = new THREE.Shape(); bs.moveTo(0, -0.018); bs.lineTo(0.13, -0.018); bs.quadraticCurveTo(0.19, -0.012, 0.21, 0.02); bs.quadraticCurveTo(0.12, 0.024, 0, 0.018); bs.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, { depth: 0.004, bevelEnabled: false }), pmat("#e6eaee", { metalness: 1, roughness: 0.12 }));
  blade.rotation.x = -Math.PI / 2; blade.position.set(0.1, 0, 0.002); sc.add(blade);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, scalpel: sc, top: 0.03 };
}

// Wall plate with a light switch and a mechanical countdown timer dial above it (cream plastic,
// numbered ring, an orange wedge for the time left, a knob with a pointer). Origin: centre of the
// plate on the wall; faces +z. API { group, set(left 0..1), press(k), face }
function makeTimerSwitch({ w = 0.5, h = 0.86 } = {}) {
  const g = new THREE.Group(), cream = pmat("#efe8db", { roughness: 0.35, clearcoat: 0.6 });
  const plate = new THREE.Mesh(rbox(w, h, 0.04, 0.02), cream); plate.position.z = 0.02; g.add(plate);
  // dial face (canvas): ticks, numbers, wedge of remaining time
  const c = makeCanvas(512, 512), x = c.getContext("2d"), tex = texFrom(c);
  const R = 0.19, face = new THREE.Mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.set(0, h * 0.18, 0.045); g.add(face);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(R, 0.012, 12, 64), pmat("#cfc7b8", { roughness: 0.3, metalness: 0.2 })); bezel.position.copy(face.position); g.add(bezel);
  const knob = new THREE.Group(); knob.position.set(0, h * 0.18, 0.05); g.add(knob);
  const kb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.04, 32), pmat("#2a2522", { roughness: 0.4 })); kb.rotation.x = Math.PI / 2; kb.position.z = 0.02; knob.add(kb);
  const ptr = new THREE.Mesh(rbox(0.018, 0.15, 0.03, 0.008), pmat("#2a2522", { roughness: 0.4 })); ptr.position.set(0, 0.075, 0.03); knob.add(ptr);
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.032), new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false })); tip.position.set(0, 0.14, 0.031); knob.add(tip);
  let cur = -1;
  const paint = (left) => {
    const q = Math.round(left * 200); if (q === cur) return; cur = q;
    x.fillStyle = "#f7f3ea"; x.beginPath(); x.arc(256, 256, 256, 0, Math.PI * 2); x.fill();
    if (left > 0.002) { x.fillStyle = "rgba(255,106,43,0.85)"; x.beginPath(); x.moveTo(256, 256); x.arc(256, 256, 236, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2); x.closePath(); x.fill(); }
    x.fillStyle = "#f7f3ea"; x.beginPath(); x.arc(256, 256, 120, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "#2a2522"; for (let i = 0; i < 60; i++) { const a = -Math.PI / 2 + i / 60 * Math.PI * 2, r0 = i % 5 ? 222 : 200; x.lineWidth = i % 5 ? 3 : 7; x.beginPath(); x.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); x.lineTo(256 + Math.cos(a) * 246, 256 + Math.sin(a) * 246); x.stroke(); }
    x.fillStyle = "#2a2522"; x.font = "800 38px Inter"; x.textAlign = "center"; x.textBaseline = "middle";
    for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI * 2; x.fillText(String(i === 0 ? 12 : i), 256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160); }
    tex.needsUpdate = true;
  };
  // rocker switch below the dial
  const bed = new THREE.Mesh(rbox(0.2, 0.26, 0.03, 0.02), pmat("#e2dacb", { roughness: 0.4 })); bed.position.set(0, -h * 0.27, 0.05); g.add(bed);
  const rocker = new THREE.Group(); rocker.position.set(0, -h * 0.27, 0.066); g.add(rocker);
  const rk = new THREE.Mesh(rbox(0.14, 0.2, 0.04, 0.018), cream); rocker.add(rk);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), new THREE.MeshBasicMaterial({ color: "#ff6a2b", toneMapped: false })); led.position.set(0, 0.06, 0.021); rocker.add(led);
  const set = (left) => { paint(clamp(left)); knob.rotation.z = -clamp(left) * Math.PI * 2; led.material.color.set(left > 0.002 ? "#ff6a2b" : "#3a2a20"); };
  const press = (k) => { rocker.rotation.x = 0.28 - 0.56 * clamp(k); };
  set(0); press(0);
  return { group: g, set, press, face };
}

// Hole in the wall where a switch was ripped out: a dark box, a broken plate edge, three wires
// hanging out with frayed copper ends. Origin: centre of the hole on the wall; faces +z. API { group }
function makeTornWires() {
  const g = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.02), mat("#0d0a08", { roughness: 1 })); hole.position.z = 0.002; g.add(hole);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.01), pmat("#4a4f55", { metalness: 0.5, roughness: 0.6 })); box.position.z = 0.013; g.add(box);
  // plaster crumbs around the edge
  const r = mulberry32(5), crumbM = mat("#bcae9c", { roughness: 1 });
  for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, cr = new THREE.Mesh(new THREE.BoxGeometry(0.02 + r() * 0.03, 0.02 + r() * 0.03, 0.02), crumbM); cr.position.set(Math.cos(a) * (0.17 + r() * 0.04), Math.sin(a) * (0.23 + r() * 0.04), 0.01); cr.rotation.z = r() * 3; g.add(cr); }
  const cols = ["#b5261e", "#1f4f8a", "#2fae66"];
  cols.forEach((col, i) => {
    const x0 = (i - 1) * 0.06, pts = [new V3(x0, 0.08, 0.015), new V3(x0 + 0.02 * (i - 1), 0.02, 0.12), new V3(x0 + 0.05 * (i - 1), -0.2, 0.16), new V3(x0 + 0.08 * (i - 1), -0.42 - i * 0.05, 0.1)];
    const curve = new THREE.CatmullRomCurve3(pts), tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.014, 10), pmat(col, { roughness: 0.45, clearcoat: 0.5 })); g.add(tube);
    const end = curve.getPoint(1), dir = curve.getTangent(1);
    for (let s = 0; s < 4; s++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6), pmat("#d9893f", { metalness: 1, roughness: 0.3 })); f.position.copy(end).addScaledVector(dir, 0.02); f.position.x += (s - 1.5) * 0.006; f.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.clone().add(new V3((s - 1.5) * 0.3, 0, 0)).normalize()); g.add(f); }
  });
  return { group: g };
}

// Living room at night behind the analogy: warm plaster wall with a skirting board, a window with
// the city, a sofa against the wall, a framed picture, a ceiling with a pendant bulb (the light the
// switch controls: light(k); pendant: false leaves only its light), wooden floor and a rug. The wall sits at wallZ; switches mount on it.
// API { group, update(t), light(k) }
function makeNightLivingRoom({ wallZ = 0, seed = 6, pendant = true } = {}) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), mat("#ffffff", { map: tileTex(plasterTex("#6a5444"), 3, 0.7), roughness: 0.92 })); wall.position.set(0, 3.5, wallZ); g.add(wall);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(30, 0.14, 0.03), mat("#e9e1d3", { roughness: 0.5 })); skirt.position.set(0, 0.07, wallZ + 0.015); g.add(skirt);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), mat("#ffffff", { map: tileTex(woodTex({ base: "#5a3b26", planks: true }), 10, 6), roughness: 0.4 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, wallZ + 8); g.add(fl);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), mat("#ffffff", { map: tileTex(fabricTex("#6b2a24"), 3, 2), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0.4, 0.006, wallZ + 2.2); g.add(rug);
  const win = makeSetWindow(1.8, 2.2, { seed }); win.group.position.set(-2.6, 2.1, wallZ); g.add(win.group);
  // sofa (seat, back, arms, cushions)
  const fab = mat("#ffffff", { map: tileTex(fabricTex("#34485a"), 2, 1), roughness: 0.95 }), sofa = new THREE.Group(); sofa.position.set(2.6, 0, wallZ + 0.5); g.add(sofa);
  const seat = new THREE.Mesh(rbox(2.2, 0.42, 0.9, 0.08), fab); seat.position.set(0, 0.32, 0); sofa.add(seat);
  const back = new THREE.Mesh(rbox(2.2, 0.62, 0.22, 0.08), fab); back.position.set(0, 0.74, -0.34); sofa.add(back);
  for (const s of [-1, 1]) { const arm = new THREE.Mesh(rbox(0.22, 0.6, 0.9, 0.08), fab); arm.position.set(s * 1.1, 0.42, 0); sofa.add(arm); }
  for (const s of [-1, 1]) { const cu = new THREE.Mesh(rbox(0.5, 0.42, 0.14, 0.1), mat("#c98a4a", { roughness: 0.9 })); cu.position.set(s * 0.62, 0.72, -0.18); cu.rotation.x = -0.25; sofa.add(cu); }
  const frame = new THREE.Mesh(rbox(1.1, 0.75, 0.04, 0.01), pmat("#1d1410", { roughness: 0.4 })); frame.position.set(2.6, 2.2, wallZ + 0.02); g.add(frame);
  const ac = makeCanvas(320, 200), ax = ac.getContext("2d"), sky = ax.createLinearGradient(0, 0, 0, 200); sky.addColorStop(0, "#2a3a6a"); sky.addColorStop(0.6, "#c8704a"); sky.addColorStop(1, "#f0b070"); ax.fillStyle = sky; ax.fillRect(0, 0, 320, 200);
  ax.fillStyle = "#ffd9a0"; ax.beginPath(); ax.arc(220, 120, 22, 0, 6.3); ax.fill();
  ax.fillStyle = "#3a2a3a"; ax.beginPath(); ax.moveTo(0, 150); ax.quadraticCurveTo(90, 100, 170, 140); ax.quadraticCurveTo(250, 170, 320, 120); ax.lineTo(320, 200); ax.lineTo(0, 200); ax.fill();
  ax.fillStyle = "#1e1820"; ax.beginPath(); ax.moveTo(0, 175); ax.quadraticCurveTo(120, 150, 320, 180); ax.lineTo(320, 200); ax.lineTo(0, 200); ax.fill();
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.61), mat("#ffffff", { map: texFrom(ac), roughness: 0.6 })); art.position.set(2.6, 2.2, wallZ + 0.042); g.add(art);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), mat("#2a211b", { roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.6, wallZ + 8); g.add(ceil);
  // pendant: cord, socket, glass bulb with a filament; it lights the room
  const pend = new THREE.Group(); pend.position.set(0.2, 3.6, wallZ + 1.6); if (pendant) g.add(pend);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 6), mat("#141414")); cord.position.y = -0.45; pend.add(cord);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 16), pmat("#1c1c1c", { metalness: 0.5, roughness: 0.4 })); sock.position.y = -0.96; pend.add(sock);
  const bulbM = new THREE.MeshBasicMaterial({ color: "#fff1c9", toneMapped: false, transparent: true, opacity: 0.95 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), bulbM); bulb.position.y = -1.1; bulb.scale.set(1, 1.2, 1); pend.add(bulb);
  const lamp = new THREE.PointLight("#ffcf8a", 0, 9, 1.3); lamp.position.set(0.2, 2.45, wallZ + 1.6); g.add(lamp);
  const pool = makeFloorGlow(4.2, 3.4, { color: "#ffcf8a", opacity: 0.2 }); pool.position.set(0.2, 0.01, wallZ + 1.8); g.add(pool);
  const halo = sprite(BOKEH, 1.6); halo.material.color.set("#ffcf8a"); halo.material.blending = THREE.AdditiveBlending; halo.position.set(0.2, 2.5, wallZ + 1.6); if (pendant) g.add(halo);
  const motes = makeSetMotes(90, [[-3, 0.3, wallZ + 0.3], [3, 3.3, wallZ + 3]], { color: "#ffe2c0", seed: seed + 1, opacity: 0.35 }); g.add(motes.points);
  asBackdrop(g);
  let lk = 1;
  const light = (k) => { lk = clamp(k); bulbM.color.set("#fff1c9").multiplyScalar(0.12 + 0.88 * lk); lamp.intensity = 7 * lk; pool.material.opacity = 0.2 * lk; halo.material.opacity = 0.55 * lk; win.set(0.55 + 0.45 * (1 - lk)); };
  light(1);
  return { group: g, update(t) { motes.update(t); }, light, bulb, wallZ };
}

// Clinic room behind the medical shots: pale green tiles to 1.4 m, painted wall above, two X-ray
// viewers glowing cold white, a glass-front cabinet with boxes, a window with the city, a ceiling of
// light panels, a speckled vinyl floor. API { group, update(t), lights(k), viewers(k) }
function makeClinicRoom({ wallZ = -2.4, seed = 8 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const tc = makeCanvas(256, 256), tx = tc.getContext("2d"); tx.fillStyle = "#9fb5aa"; tx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { tx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`; tx.fillRect(x + 2, y + 2, 60, 60); }
  tx.fillStyle = "#6f8279"; for (let i = 0; i <= 256; i += 64) { tx.fillRect(i - 1, 0, 2, 256); tx.fillRect(0, i - 1, 256, 2); }
  const tileT = texFrom(tc); tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(30 / 0.8, 1.4 / 0.8);
  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.4), mat("#ffffff", { map: tileT, roughness: 0.25, envMapIntensity: 0.8 })); tiles.position.set(0, 0.7, wallZ + 0.005); g.add(tiles);
  const upper = new THREE.Mesh(new THREE.PlaneGeometry(30, 5), mat("#ffffff", { map: tileTex(plasterTex("#4c5f63"), 3, 0.5), roughness: 0.9 })); upper.position.set(0, 3.9, wallZ); g.add(upper);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(30, 0.06, 0.04), pmat("#d9dfdc", { roughness: 0.4 })); trim.position.set(0, 1.42, wallZ + 0.02); g.add(trim);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), mat("#ffffff", { map: tileTex(noiseTex({ base: "#7d8a86", amount: 0.18, size: 2, seed }), 14, 9), roughness: 0.32 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.003, wallZ + 9); g.add(fl);
  // X-ray viewers: a bright panel with a ribcage-free bone film (femur pair)
  const vc = makeCanvas(256, 320), vx = vc.getContext("2d"); vx.fillStyle = "#cfe6ff"; vx.fillRect(0, 0, 256, 320);
  vx.fillStyle = "#1a2430"; vx.fillRect(18, 18, 220, 284); vx.fillStyle = "rgba(220,235,255,0.75)";
  for (const bx of [92, 164]) { vx.beginPath(); vx.ellipse(bx, 60, 18, 16, 0, 0, 6.3); vx.fill(); vx.fillRect(bx - 9, 60, 18, 200); vx.beginPath(); vx.ellipse(bx - 8, 266, 16, 12, 0, 0, 6.3); vx.fill(); vx.beginPath(); vx.ellipse(bx + 8, 266, 16, 12, 0, 0, 6.3); vx.fill(); }
  const vt = texFrom(vc), viewM = new THREE.MeshBasicMaterial({ map: vt, toneMapped: false });
  const views = [];
  for (const x of [-3.1, -2.0]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.12), viewM); v.position.set(x, 2.5, wallZ + 0.03); g.add(v); const fr = new THREE.Mesh(rbox(1.0, 1.22, 0.05, 0.01), pmat("#e2e6e8", { roughness: 0.4 })); fr.position.set(x, 2.5, wallZ + 0.01); g.add(fr); views.push(v); }
  const vGlow = makeFloorGlow(3.4, 2.4, { color: "#cfe6ff", opacity: 0.1 }); vGlow.position.set(-2.5, 0.008, wallZ + 1.4); g.add(vGlow);
  // glass cabinet with boxes on shelves
  const cab = new THREE.Group(); cab.position.set(3.0, 0, wallZ + 0.3); g.add(cab);
  const cabM = pmat("#e7ebe9", { roughness: 0.35 });
  const carc = new THREE.Mesh(rbox(1.6, 2.2, 0.5, 0.02), cabM); carc.position.y = 1.1; cab.add(carc);
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 1.3), mat("#2a3236", { roughness: 0.8 })); inner.position.set(0, 1.45, 0.255); cab.add(inner);
  const cols = ["#2f6fb0", "#e9ece8", "#2fae66", "#c9ccd1", "#f2c66b"];
  for (const y of [1.0, 1.42, 1.84]) { const sh = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.02, 0.1), MED_STEEL()); sh.position.set(0, y, 0.27); cab.add(sh); for (let bx = -0.68; bx < 0.66;) { const w = 0.1 + r() * 0.1, h = 0.14 + r() * 0.18, b = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, h, 0.08), pmat(cols[Math.floor(r() * cols.length)], { roughness: 0.5 })); b.position.set(bx + w / 2, y + 0.01 + h / 2, 0.29); cab.add(b); bx += w; } }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 1.32), new THREE.MeshPhysicalMaterial({ color: "#dfe9ee", roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false })); glass.position.set(0, 1.45, 0.34); cab.add(glass);
  const win = makeSetWindow(1.6, 2.0, { seed }); win.group.position.set(0.2, 2.7, wallZ); g.add(win.group);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), mat("#ffffff", { map: tileTex(setCeilingTex(), 25, 15), roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 4.2, wallZ + 9); g.add(ceil);
  const panelM = new THREE.MeshBasicMaterial({ color: "#eef8ff", toneMapped: false }), pools = [];
  for (let z = wallZ + 1.4; z < wallZ + 16; z += 2.8) for (const x of [-2.4, 2.4]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), panelM); p.rotation.x = Math.PI / 2; p.position.set(x, 4.19, z); g.add(p); const pool = makeFloorGlow(2.8, 2, { color: "#eef8ff", opacity: 0.06 }); pool.position.set(x, 0.008, z); g.add(pool); pools.push(pool); }
  const motes = makeSetMotes(110, [[-4, 0.3, wallZ + 0.3], [4, 3.8, wallZ + 4]], { color: "#dff0ff", seed: seed + 3, opacity: 0.35 }); g.add(motes.points);
  asBackdrop(g);
  return {
    group: g, update(t) { motes.update(t); },
    lights(k) { panelM.color.set("#eef8ff").multiplyScalar(k); pools.forEach((p) => { p.material.opacity = 0.06 * k; }); },
    viewers(k, c = "#ffffff") { viewM.color.set(c).multiplyScalar(k); vGlow.material.opacity = 0.1 * k; },
  };
}

// Wall-mounted X-ray light box showing one femur whose density fades (bone loss): paint(loss 0..1).
// Origin: centre of the box; faces +z. API { group, paint(k) }
function makeXrayBox({ w = 0.9, h = 1.3 } = {}) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(rbox(w + 0.1, h + 0.1, 0.08, 0.015), pmat("#e2e6e8", { roughness: 0.35 })); frame.position.z = 0.04; g.add(frame);
  const c = makeCanvas(360, 520), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = 0.081; g.add(scr);
  let cur = -1;
  const paint = (k) => {
    const q = Math.round(clamp(k) * 60); if (q === cur) return; cur = q; k = q / 60;
    x.fillStyle = "#0e1622"; x.fillRect(0, 0, 360, 520);
    const r = mulberry32(3), dens = 0.92 - 0.55 * k;
    // femur: head + neck + shaft + condyles, cortical edge brighter than the marrow
    const bone = (a) => {
      x.fillStyle = x.strokeStyle = `rgba(225,238,255,${a})`;
      x.beginPath(); x.arc(222, 78, 40, 0, 6.3); x.fill();                                    // head
      x.lineCap = "round"; x.lineWidth = 46; x.beginPath(); x.moveTo(214, 88); x.lineTo(172, 142); x.stroke();   // neck into the shaft
      x.beginPath(); x.ellipse(140, 132, 22, 30, 0.3, 0, 6.3); x.fill();                      // greater trochanter
      x.beginPath(); x.moveTo(146, 126); x.quadraticCurveTo(196, 120, 198, 160); x.lineTo(194, 400); x.quadraticCurveTo(196, 430, 230, 440); x.lineTo(128, 440); x.quadraticCurveTo(160, 430, 160, 400); x.lineTo(150, 160); x.closePath(); x.fill();   // shaft, flaring to the knee
      x.beginPath(); x.ellipse(148, 452, 34, 28, 0, 0, 6.3); x.fill(); x.beginPath(); x.ellipse(212, 452, 34, 28, 0, 0, 6.3); x.fill();   // condyles
    };
    bone(dens);
    x.fillStyle = `rgba(14,22,34,${0.25 + 0.5 * k})`; x.fillRect(166, 170, 16, 220);
    // porous spots spread as density drops
    for (let i = 0; i < 260 * k; i++) { x.fillStyle = `rgba(14,22,34,${0.5 + r() * 0.4})`; const px = 150 + r() * 60, py = 60 + r() * 400; x.fillRect(px, py, 2 + r() * 4, 2 + r() * 4); }
    x.fillStyle = "rgba(200,225,255,0.12)"; x.fillRect(0, 0, 360, 520);
    tex.needsUpdate = true;
  };
  paint(0);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.02), MED_STEEL()); clip.position.set(0, h / 2 - 0.02, 0.09); g.add(clip);
  return { group: g, paint };
}

// Hand-held glucometer with a test strip and an LCD (value + "mg/dL"). Origin: bottom centre
// (standing on its base, leaning back a little); screen faces +z. API { group, set(value) }
function makeGlucometer() {
  const g = new THREE.Group(), body = new THREE.Group(); body.rotation.x = -0.18; g.add(body);
  const shell = new THREE.Mesh(rbox(0.34, 0.56, 0.1, 0.06), pmat("#2a6bb0", { roughness: 0.3, clearcoat: 0.7 })); shell.position.y = 0.28; body.add(shell);
  const bezel = new THREE.Mesh(rbox(0.27, 0.24, 0.02, 0.02), pmat("#1b1d20", { roughness: 0.4 })); bezel.position.set(0, 0.38, 0.05); body.add(bezel);
  const c = makeCanvas(256, 224), x = c.getContext("2d"), tex = texFrom(c);
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.21), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); lcd.position.set(0, 0.38, 0.061); body.add(lcd);
  for (const bx of [-0.07, 0.07]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 20), pmat("#e9ece8", { roughness: 0.4 })); b.rotation.x = Math.PI / 2; b.position.set(bx, 0.15, 0.05); body.add(b); }
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.004), pmat("#f4f1ea", { roughness: 0.6 })); strip.position.set(0, 0.62, 0); body.add(strip);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), pmat("#9b1010", { roughness: 0.1 })); drop.position.set(0, 0.71, 0.004); body.add(drop);
  let cur = null;
  const set = (v) => { const s = String(Math.round(v)); if (s === cur) return; cur = s; x.fillStyle = "#b9c7a8"; x.fillRect(0, 0, 256, 224); x.fillStyle = "#1a2214"; x.font = "800 120px Inter"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(s, 128, 100); x.font = "700 34px Inter"; x.fillText("mg/dL", 128, 186); tex.needsUpdate = true; };
  set(90); g.add(contactShadow(0.6, 0.4));
  return { group: g, set };
}

// Patient monitor on a short stand with a scrolling ECG trace and a heart-rate number. Origin: floor
// of the base; screen faces +z. API { group, update(t, bpm, alarm) }
function makeEcgMonitor({ w = 0.9, h = 0.62 } = {}) {
  const g = new THREE.Group(), dark = pmat("#22262b", { roughness: 0.45 });
  const base = new THREE.Mesh(rbox(0.5, 0.05, 0.36, 0.02), dark); base.position.y = 0.025; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), MED_STEEL()); post.position.y = 0.25; g.add(post);
  const side = dark, c = makeCanvas(640, 440), x = c.getContext("2d"), tex = texFrom(c);
  const box = new THREE.Mesh(rbox(w, h, 0.12, 0.03), [side, side, side, side, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), side]); box.position.y = 0.45 + h / 2; g.add(box);
  const ecg = (u) => { const p = u % 1; if (p < 0.08) return 0.08 * Math.sin(p / 0.08 * Math.PI); if (p > 0.2 && p < 0.23) return -0.15; if (p >= 0.23 && p < 0.27) return 1.0 - Math.abs(p - 0.25) * 40; if (p >= 0.27 && p < 0.31) return -0.3; if (p > 0.45 && p < 0.6) return 0.2 * Math.sin((p - 0.45) / 0.15 * Math.PI); return 0; };
  let lastF = -1;
  const update = (t, bpm = 72, alarm = 0) => {
    const f = Math.floor(t * 24); if (f === lastF) return; lastF = f;
    x.fillStyle = alarm > 0.5 ? "#2a0c0a" : "#071410"; x.fillRect(0, 0, 640, 440);
    x.strokeStyle = "rgba(80,160,120,0.15)"; x.lineWidth = 1; for (let i = 0; i < 640; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 440); x.stroke(); } for (let i = 0; i < 440; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(640, i); x.stroke(); }
    const col = alarm > 0.5 ? "#ff4d3a" : "#3dff9a"; x.strokeStyle = col; x.lineWidth = 6; x.lineJoin = "round"; x.beginPath();
    const beats = bpm / 60, span = 3;
    for (let i = 0; i <= 200; i++) { const u = i / 200, tt = t - span * (1 - u), y = 250 - 160 * ecg(tt * beats); i ? x.lineTo(20 + u * 420, y) : x.moveTo(20, y); }
    x.stroke();
    x.fillStyle = col; x.font = "900 110px Inter"; x.textAlign = "right"; x.fillText(String(Math.round(bpm)), 620, 230); x.font = "800 34px Inter"; x.fillText("BPM", 620, 280);
    x.fillStyle = "#ff3b5c"; x.font = "900 60px Inter"; x.fillText("♥", 610, 120);
    tex.needsUpdate = true;
  };
  update(0); g.add(contactShadow(0.8, 0.6));
  return { group: g, update };
}

// Rack of blood collection tubes (glass, dark red blood, coloured caps, paper labels). Origin: floor
// of the rack; front +z. API { group, show(k) } — k pops the tubes in one by one.
function makeTubeRack({ n = 6 } = {}) {
  const g = new THREE.Group(), white = pmat("#eef0ee", { roughness: 0.35 }), step = 0.13, W = n * step + 0.08;
  for (const y of [0.03, 0.22]) { const p = new THREE.Mesh(rbox(W, 0.025, 0.16, 0.01), white); p.position.y = y; g.add(p); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(rbox(0.025, 0.24, 0.16, 0.01), white); e.position.set(s * (W / 2 - 0.012), 0.12, 0); g.add(e); }
  const caps = ["#7a2a8a", "#e0261b", "#2f6fb0", "#f2c200", "#2fae66", "#7a2a8a"], tubes = [];
  for (let i = 0; i < n; i++) {
    const tg = new THREE.Group(); tg.position.set(-W / 2 + 0.04 + step * (i + 0.5), 0.045, 0); g.add(tg);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 24), MED_GLASS()); glass.position.y = 0.21; tg.add(glass);
    const blood = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.28, 24), pmat("#6e0b0b", { roughness: 0.12, clearcoat: 1 })); blood.position.y = 0.15; tg.add(blood);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 24), pmat(caps[i % caps.length], { roughness: 0.4 })); cap.position.y = 0.455; tg.add(cap);
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, 0.16, 24, 1, true, -1.2, 2.4), pmat("#f6f3ec", { roughness: 0.8 })); lab.position.y = 0.24; tg.add(lab);
    tubes.push(tg);
  }
  g.add(contactShadow(W + 0.3, 0.5));
  const show = (k) => tubes.forEach((tb, i) => { const s = clamp(k * n - i); tb.visible = s > 0.01; tb.position.y = 0.045 + 0.35 * (1 - eOut(s)); });
  return { group: g, show };
}

// Two upholstered armchairs facing each other at an angle, a small round table with a box of
// tissues and a glass of water between them (psychotherapy). Origin: floor centre. API { group }
function makeTherapyChairs() {
  const g = new THREE.Group();
  const chair = (fabCol) => {
    const c = new THREE.Group(), fab = mat("#ffffff", { map: tileTex(fabricTex(fabCol), 1, 1), roughness: 0.95 }), wood = pmat("#ffffff", { map: woodTex("#3a2214"), roughness: 0.45 });
    const seat = new THREE.Mesh(rbox(0.8, 0.2, 0.76, 0.07), fab); seat.position.y = 0.42; c.add(seat);
    const back = new THREE.Mesh(rbox(0.8, 0.66, 0.18, 0.08), fab); back.position.set(0, 0.84, -0.3); back.rotation.x = -0.12; c.add(back);
    for (const s of [-1, 1]) { const arm = new THREE.Mesh(rbox(0.14, 0.28, 0.7, 0.05), fab); arm.position.set(s * 0.42, 0.6, 0); c.add(arm); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.32, 10), wood); l.position.set(sx * 0.34, 0.16, sz * 0.3); c.add(l); }
    return c;
  };
  const a = chair("#7a4a2a"); a.position.set(-0.8, 0, 0); a.rotation.y = 1.25; g.add(a);
  const b = chair("#4a5a6a"); b.position.set(0.8, 0, 0); b.rotation.y = -1.25; g.add(b);
  const tb = new THREE.Group(); tb.position.set(0, 0, -0.45); g.add(tb);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32), pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.4, clearcoat: 0.6 })); top.position.y = 0.55; tb.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.54, 12), pmat("#2a2522", { roughness: 0.4 })); leg.position.y = 0.27; tb.add(leg);
  const tissue = new THREE.Mesh(rbox(0.2, 0.1, 0.12, 0.01), pmat("#cfe0e8", { roughness: 0.6 })); tissue.position.set(-0.06, 0.615, 0); tb.add(tissue);
  const glassW = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 20), MED_GLASS()); glassW.position.set(0.1, 0.625, 0.04); tb.add(glassW);
  g.add(contactShadow(2.6, 1.6));
  return { group: g };
}

// Open desk planner: two pages on a spiral, one loose leaf that flips over the spine. Each spread
// shows a big date heading with a red hand-drawn circle around it. Origin: centre of the spine on
// the desk; pages face +y. API { group, show(i, k) } — page i on top, k = flip progress to i + 1.
function makeDeskPlanner(pages, { w = 0.62, d = 0.86 } = {}) {
  const g = new THREE.Group(), T = 0.012;
  const cover = new THREE.Mesh(rbox(w * 2 + 0.06, 0.012, d + 0.05, 0.01), pmat("#3a1d16", { roughness: 0.6 })); cover.position.y = 0.006; g.add(cover);
  const pageTex = (txt) => {
    const c = makeCanvas(512, Math.round(512 * d / w)), x = c.getContext("2d"), H = c.height;
    x.fillStyle = "#f8f4ea"; x.fillRect(0, 0, 512, H); x.strokeStyle = "rgba(60,90,140,0.25)"; x.lineWidth = 2; for (let y = 140; y < H - 20; y += 44) { x.beginPath(); x.moveTo(30, y); x.lineTo(482, y); x.stroke(); }
    if (txt) {
      x.fillStyle = "#1c1410"; let px = 150; x.font = `900 ${px}px Inter`; while (x.measureText(txt).width > 400 && px > 30) { px -= 4; x.font = `900 ${px}px Inter`; }
      x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 256, H * 0.42);
      x.strokeStyle = "#d42a1e"; x.lineWidth = 12; x.beginPath(); x.ellipse(256, H * 0.42, x.measureText(txt).width / 2 + 40, px * 0.85, -0.06, 0.2, Math.PI * 2 + 0.5); x.stroke();
      x.fillStyle = "rgba(30,40,70,0.65)"; for (let y = H * 0.62; y < H * 0.9; y += 44) x.fillRect(60, y - 8, 200 + ((y * 13) % 180), 7);
    }
    return texFrom(c);
  };
  const sheet = (tex) => { const pm = pmat("#f8f4ea", { roughness: 0.9 }); return new THREE.Mesh(new THREE.BoxGeometry(w, 0.002, d), [pm, pm, pmat("#ffffff", { map: tex, roughness: 0.88 }), pm, pm, pm]); };
  // left page: lined, blank; right stack: the pages, one leaf per entry
  const left = sheet(pageTex(null)); left.position.set(-w / 2 - 0.015, 0.012 + T, 0); g.add(left);
  const block = new THREE.Mesh(rbox(w, T, d, 0.004), pmat("#efe8d8", { roughness: 0.9 })); block.position.set(w / 2 + 0.015, 0.012 + T / 2, 0); g.add(block);
  const lblock = block.clone(); lblock.position.x = -w / 2 - 0.015; g.add(lblock);
  const leaves = pages.map((txt, i) => {
    const piv = new THREE.Group(); piv.position.set(0, 0.012 + T + 0.002 + (pages.length - i) * 0.0015, 0); g.add(piv);
    const s = sheet(pageTex(txt)); s.position.x = w / 2 + 0.015; piv.add(s);
    const back = sheet(pageTex(null)); back.rotation.z = Math.PI; back.position.set(w / 2 + 0.015, -0.0021, 0); piv.add(back);
    return piv;
  });
  const ringM = MED_STEEL();
  for (let z = -d / 2 + 0.06; z < d / 2 - 0.03; z += 0.07) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 20), ringM); ring.rotation.x = Math.PI / 2; ring.rotation.y = Math.PI / 2; ring.position.set(0, 0.03, z); g.add(ring); }
  const show = (i, k = 0) => leaves.forEach((L, j) => { const f = j < i ? 1 : j === i ? eOut(clamp(k)) : 0; L.rotation.z = f * Math.PI * 0.985; L.position.y = 0.012 + T + 0.002 + (f > 0.5 ? (j + 1) * 0.0015 : (pages.length - j) * 0.0015); });
  show(0);
  g.add(contactShadow(w * 2 + 0.4, d + 0.4));
  return { group: g, show, top: 0.012 + T + 0.004 };
}

// Hospital wristband lying open on the table: a long flat vinyl strap with rounded ends, a row of snap
// holes at one end, the white insert with the printed name and a barcode, a blue snap at the other end.
// Origin: centre on the table; the label faces +y. API { group, label }
function makePatientBand(text = "PACIENTE", { len = 1.4, w = 0.24 } = {}) {
  const g = new THREE.Group(), vinyl = pmat("#f1f3f4", { roughness: 0.45, clearcoat: 0.4 });
  const strap = new THREE.Mesh(rbox(len, 0.012, w, 0.006), vinyl); strap.position.y = 0.006; g.add(strap);
  for (const s of [-1, 1]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, 0.012, 32, 1, false, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI), vinyl); cap.position.set(s * len / 2, 0.006, 0); g.add(cap); }
  const win = new THREE.Mesh(rbox(len * 0.5, 0.004, w * 0.86, 0.004), pmat("#ffffff", { roughness: 0.3, clearcoat: 1 })); win.position.set(-len * 0.06, 0.014, 0); g.add(win);
  const label = makePlate(text, len * 0.44, w * 0.6, { bg: "#ffffff", fg: "#1c1410", depth: 0.004 }); label.rotation.x = -Math.PI / 2; label.position.set(-len * 0.12, 0.018, -w * 0.08); g.add(label);
  const bc = makeCanvas(256, 32), bx = bc.getContext("2d"); bx.fillStyle = "#fff"; bx.fillRect(0, 0, 256, 32); bx.fillStyle = "#111"; const rr = mulberry32(9); for (let i = 4; i < 252; i += 3) if (rr() < 0.6) bx.fillRect(i, 0, 1 + Math.floor(rr() * 2), 32);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(len * 0.1, 0.002, w * 0.6), new THREE.MeshBasicMaterial({ map: texFrom(bc) })); bar.position.set(len * 0.16, 0.017, 0); g.add(bar);
  for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 12), mat("#9aa3a8", { roughness: 0.6 })); h.position.set(len * 0.27 + i * 0.045, 0.007, 0); g.add(h); }
  const snap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 20), pmat("#2f6fb0", { roughness: 0.4 })); snap.position.set(-len * 0.43, 0.017, 0); g.add(snap);
  g.add(contactShadow(len + 0.4, w + 0.4));
  return { group: g, label };
}

// Two-pan scale (brass beam on a turned post, pans on three chains). Origin: floor of the base.
// API { group, tilt(a), holders: [left, right] } — add objects to a holder: they ride on the pan.
function makeTwoPanScale({ arm = 0.95, height = 1.55, panR = 0.4, chain = 0.62 } = {}) {
  const g = new THREE.Group(), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.25 }), dark = pmat("#2a2522", { roughness: 0.4, clearcoat: 0.6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.1, 40), dark); base.position.y = 0.05; g.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, height, 20), brass); post.position.y = 0.1 + height / 2; g.add(post);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), brass); finial.position.y = 0.1 + height + 0.1; g.add(finial);
  const beam = new THREE.Group(); beam.position.y = 0.1 + height; g.add(beam);
  const bar = new THREE.Mesh(rbox(arm * 2 + 0.1, 0.05, 0.05, 0.02), brass); beam.add(bar);
  const holders = [], hangs = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = s * arm; beam.add(hang); hangs.push(hang);
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, p0 = new V3(0, 0, 0), p1 = new V3(Math.cos(a) * panR * 0.9, -chain, Math.sin(a) * panR * 0.9);
      const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, p0.distanceTo(p1), 6), brass); ch.position.copy(p0.clone().add(p1).multiplyScalar(0.5)); ch.quaternion.setFromUnitVectors(new V3(0, 1, 0), p1.clone().sub(p0).normalize()); hang.add(ch); }
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(panR, panR * 0.8, 0.06, 40, 1, true), brass); pan.position.y = -chain - 0.03; hang.add(pan);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(panR * 0.8, 40), brass); bottom.rotation.x = -Math.PI / 2; bottom.position.y = -chain - 0.059; hang.add(bottom);
    const holder = new THREE.Group(); holder.position.y = -chain - 0.058; hang.add(holder); holders.push(holder);
  }
  g.add(contactShadow(1.2, 1.2));
  // pans stay level while the beam tilts
  const tilt = (a) => { beam.rotation.z = a; hangs.forEach((h) => { h.rotation.z = -a; }); };
  return { group: g, tilt, holders, panTop: 0.1 + height - chain - 0.058 };
}

// Prison gate: a steel frame in a concrete wall with a barred door that slides to the side.
// Origin: floor centre of the opening; front +z. API { group, open(k) }
function makePrisonGate({ w = 1.6, h = 2.5 } = {}) {
  const g = new THREE.Group(), steel = pmat("#3c4248", { metalness: 0.75, roughness: 0.42 }), conc = mat("#9a948c", { map: tileTex(setBrickTex(), 2.2, 5), roughness: 0.92 });
  const wall = new THREE.Group(); g.add(wall);
  for (const s of [-1, 1]) { const wl = new THREE.Mesh(new THREE.BoxGeometry(2.6, h + 0.9, 0.5), conc); wl.position.set(s * (w / 2 + 1.3), (h + 0.9) / 2, -0.25); wall.add(wl); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.9, 0.5), conc); lintel.position.set(0, h + 0.45, -0.25); wall.add(lintel);
  asBackdrop(wall);
  for (const s of [-1, 1]) { const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.56), steel); jamb.position.set(s * (w / 2 + 0.05), h / 2, -0.25); g.add(jamb); }
  const track = new THREE.Mesh(new THREE.BoxGeometry(w * 2.2, 0.08, 0.1), steel); track.position.set(w * 0.55, h + 0.06, 0.08); wall.add(track);
  const door = new THREE.Group(); door.position.z = 0.08; g.add(door);
  for (const y of [0.08, h / 2, h - 0.06]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.06), steel); rail.position.y = y; door.add(rail); }
  for (let i = 0; i <= 9; i++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, h - 0.06, 12), steel); bar.position.set(-w / 2 + 0.04 + i * (w - 0.08) / 9, h / 2, 0); door.add(bar); }
  const lock = new THREE.Mesh(rbox(0.16, 0.24, 0.1, 0.02), pmat("#202326", { metalness: 0.7, roughness: 0.35 })); lock.position.set(-w / 2 + 0.12, h / 2, 0.05); door.add(lock);
  const open = (k) => { door.position.x = w * 0.98 * eOut(clamp(k)); };
  open(0);
  return { group: g, door, wall, open };
}
