// ============================================================================
// props/sport.js · football at night: pitch with real markings, ball, goal with net, floodlight
//                  towers, pitch-side VAR monitor (screen, countdown box, name sign, power cable)
// Scale: 1 unit = 1 m (a person is ~1.8). Pitch, goal and floodlights are backdrop (asBackdrop);
// the ball and the monitor are objects to register as heroes.
// ============================================================================

// Mowed grass: four stripes per tile (light/dark), fine blades. One tile = 20 m (tileTex repeats it).
function pitchGrassTex() {
  return cachedTex("pitchGrass", () => {
    const c = makeCanvas(512, 512), x = c.getContext("2d"), r = mulberry32(41);
    for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? "#2c6431" : "#367638"; x.fillRect(0, i * 128, 512, 128); }
    for (let i = 0; i < 12000; i++) { x.fillStyle = r() < 0.55 ? `rgba(14,40,16,${0.12 + r() * 0.2})` : `rgba(130,180,110,${0.06 + r() * 0.1})`; x.fillRect(r() * 512, r() * 512, 1 + r() * 1.4, 2 + r() * 4); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}

// Grass around one penalty area, with the markings at real size (penalty area 40.3 x 16.5 m, goal
// area 18.3 x 5.5 m, the arc 9.15 m from the spot). Origin: the penalty spot; the goal line runs at
// z = -11 (the goal is behind the spot when seen from +z). Backdrop.
// API { group, spot, setSpot(k) } — setSpot(k): opacity of the painted spot (1 = fresh, 0 = gone).
function makePitch({ size = 110 } = {}) {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(size, size), pmat("#ffffff", { map: tileTex(pitchGrassTex(), size / 20, size / 20), roughness: 0.95, envMapIntensity: 0.12 }));
  grass.rotation.x = -Math.PI / 2; grass.position.y = 0.003; g.add(grass);
  const lm = mat("#e8ede4", { roughness: 0.9 }), lw = 0.12;
  const line = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), m = new THREE.Mesh(new THREE.PlaneGeometry(L + lw, lw), lm);
    m.rotation.set(-Math.PI / 2, 0, -Math.atan2(z1 - z0, x1 - x0)); m.position.set((x0 + x1) / 2, 0.007, (z0 + z1) / 2); g.add(m);
  };
  const GL = -11, PA = GL + 16.5, GA = GL + 5.5;
  line(-34, GL, 34, GL);                                        // goal line
  line(-20.16, PA, 20.16, PA); line(-20.16, GL, -20.16, PA); line(20.16, GL, 20.16, PA);   // penalty area
  line(-9.16, GA, 9.16, GA); line(-9.16, GL, -9.16, GA); line(9.16, GL, 9.16, GA);         // goal area
  line(-34, GL, -34, 45); line(34, GL, 34, 45);                 // touchlines
  const a = Math.acos(5.5 / 9.15);                              // the arc outside the area
  const arc = new THREE.Mesh(new THREE.RingGeometry(9.15 - lw / 2, 9.15 + lw / 2, 64, 1, -Math.PI / 2 - a, 2 * a), lm);
  arc.rotation.x = -Math.PI / 2; arc.position.y = 0.007; g.add(arc);
  const spotMat = mat("#dfe5da", { roughness: 0.95, transparent: true });
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), spotMat); spot.rotation.x = -Math.PI / 2; spot.position.y = 0.008; g.add(spot);
  asBackdrop(g);
  return { group: g, spot, setSpot: (k) => { spotMat.opacity = clamp(k); spot.visible = k > 0.01; } };
}

// Football: white leather sphere with the 12 black pentagons (on the icosahedron's vertices), as
// slightly raised caps so no edge dips under the leather. Origin: centre.
function makeSoccerBall(r = 0.11) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), pmat("#f5f4ef", { roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.2 })));
  const ico = new THREE.IcosahedronGeometry(1, 0), pos = ico.attributes.position, seen = [], pm = pmat("#151515", { roughness: 0.42, clearcoat: 0.7 });
  const capGeo = new THREE.SphereGeometry(r * 1.018, 5, 3, 0, Math.PI * 2, 0, 0.36);
  for (let i = 0; i < pos.count; i++) { const v = new V3().fromBufferAttribute(pos, i).normalize(); if (!seen.some((s) => s.distanceTo(v) < 1e-3)) seen.push(v); }
  for (const v of seen) {
    const cap = new THREE.Mesh(capGeo, pm); cap.quaternion.setFromUnitVectors(new V3(0, 1, 0), v);
    // a corner of the cap (local -x) turned toward the nearest pentagon, like the truncated icosahedron
    const n = seen.filter((s) => s !== v).sort((a, b) => a.distanceTo(v) - b.distanceTo(v))[0];
    const want = n.clone().addScaledVector(v, -v.dot(n)).normalize(), have = new V3(-1, 0, 0).applyQuaternion(cap.quaternion);
    const ang = Math.atan2(have.clone().cross(want).dot(v), have.dot(want));
    cap.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(v, ang)); g.add(cap);
  }
  return g;
}

// Net texture: white cords on transparent (one tile = 16 x 16 meshes).
function netTex() {
  return cachedTex("goalNet", () => {
    const c = makeCanvas(256, 256), x = c.getContext("2d"); x.strokeStyle = "rgba(240,240,236,0.85)"; x.lineWidth = 2.2;
    for (let i = 0; i <= 256; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Goal, 7.32 x 2.44 m: round white posts and crossbar, a net box 2 m deep. Origin: centre of the goal
// line; the mouth faces +z.
function makeSoccerGoal() {
  const g = new THREE.Group(), pm = pmat("#f4f4f1", { roughness: 0.3, clearcoat: 0.8 }), r = 0.06, hw = 7.32 / 2, H = 2.44, D = 2.0;
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, H + r, 20), pm); p.position.set(s * (hw + r), (H + r) / 2, 0); g.add(p); }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2 * hw + 4 * r, 20), pm); bar.rotation.z = Math.PI / 2; bar.position.set(0, H + r, 0); g.add(bar);
  const net = (w, h) => { const t = tileTex(netTex(), w / 1.9, h / 1.9); return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, roughness: 0.9 })); };
  const back = net(2 * hw, H); back.position.set(0, H / 2, -D); g.add(back);
  const roof = net(2 * hw, D); roof.rotation.x = -Math.PI / 2; roof.position.set(0, H, -D / 2); g.add(roof);
  for (const s of [-1, 1]) { const side = net(D, H); side.rotation.y = Math.PI / 2; side.position.set(s * hw, H / 2, -D / 2); g.add(side); }
  asBackdrop(g);
  return g;
}

// Floodlight towers far behind the subject: a steel mast and a tilted bank of 12 lamps with a wide
// soft halo (lamps and halos ignore the fog: in the dark they read as stadium lights). Backdrop.
// API { group, set(k), update(t) } — set(k): 0 = off, 1 = full.
function makeFloodlights({ n = 4, z = -46, spread = 80, h = 30, seed = 5 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), halos = [];
  const ON = new THREE.Color("#fff3dc"), OFF = new THREE.Color("#2a2724");
  const lampMat = new THREE.MeshBasicMaterial({ color: ON.clone(), toneMapped: false, fog: false });
  const steel = pmat("#2a2d33", { metalness: 0.6, roughness: 0.5 });
  for (let i = 0; i < n; i++) {
    const x = lerp(-spread / 2, spread / 2, n === 1 ? 0.5 : i / (n - 1)) + (r() - 0.5) * 6, zz = z - r() * 8;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.65, h, 10), steel); mast.position.set(x, h / 2, zz); g.add(mast);
    const bank = new THREE.Group(); bank.position.set(x, h + 2, zz + 0.6); bank.rotation.set(0.3, -x * 0.006, 0); g.add(bank);
    bank.add(new THREE.Mesh(rbox(8, 4.6, 0.5, 0.1), steel));
    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
      const l = new THREE.Mesh(rbox(1.6, 1.1, 0.12, 0.05), lampMat); l.position.set((col - 1.5) * 1.85, (row - 1) * 1.35, 0.3); bank.add(l);
    }
    const halo = sprite(BOKEH, 30); halo.material.color.set("#fff0d0"); halo.material.blending = THREE.AdditiveBlending; halo.material.opacity = 0.7;
    halo.position.set(x, h + 2, zz + 2); g.add(halo); halos.push(halo);
  }
  asBackdrop(g);
  let level = 1;
  const set = (k) => { level = clamp(k); lampMat.color.copy(OFF).lerp(ON, level); };
  const update = (t) => { halos.forEach((s, i) => { s.material.opacity = level * (0.62 + 0.06 * Math.sin(t * 1.7 + i * 2)); }); };
  return { group: g, set, update };
}

// Night stadium around the spot: pitch, goal, floodlights and a ring of camera-flash bokeh from the
// stands. Backdrop only. API { group, pitch, lights, update(t) }
function makeStadiumNight({ goal = true, seed = 5 } = {}) {
  const g = new THREE.Group();
  const pitch = makePitch(); g.add(pitch.group);
  if (goal) { const gl = makeSoccerGoal(); gl.position.set(0, 0, -11); g.add(gl); }
  const lights = makeFloodlights({ seed }); g.add(lights.group);
  const stands = makeBokeh({ n: 90, center: [0, 7, -38], spread: [90, 10, 6], size: [0.4, 1.3], colors: ["#fff4e0", "#cfe0ff", "#ffd59a"], opacity: 0.4, seed: seed + 3 });
  g.add(stands.group); asBackdrop(g);
  return { group: g, pitch, lights, update: (t) => { lights.update(t); stands.update(t); } };
}

// Pitch-side VAR monitor: weighted base, black pole, a 16:10 screen under a hood, a red LED countdown
// box on the hood, a sign on the pole (label), and the power cable from the back down to a floor box.
// Origin: floor centre; the screen faces +z.
// API { group, ctx, tex, paint(fn), timer(text, on), sign, cable(k), screenY }
//   paint(fn): fn(ctx, 640, 400) draws the screen; timer("0:42", true) the LED box (on = lit red)
//   cable(k): 0 = plugged into the floor box, 1 = unplugged (the plug lies on the grass, the box LED off)
function makeVarMonitor({ label = "CONGRESSO", w = 1.1, signW = 1.0 } = {}) {
  const g = new THREE.Group(), h = w * 0.625, cy = 1.5;
  const black = pmat("#16171a", { roughness: 0.35, metalness: 0.4, clearcoat: 0.6 });
  const base = new THREE.Mesh(rbox(0.75, 0.08, 0.55, 0.03), black); base.position.y = 0.04; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, cy - 0.08, 20), pmat("#2b2d31", { metalness: 0.8, roughness: 0.3 })); pole.position.set(0, 0.08 + (cy - 0.08) / 2, -0.02); g.add(pole);
  const body = new THREE.Mesh(rbox(w + 0.1, h + 0.1, 0.09, 0.025), black); body.position.set(0, cy, 0); g.add(body);
  const canvas = makeCanvas(640, 400), ctx = canvas.getContext("2d"), tex = texFrom(canvas);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, cy, 0.047); g.add(screen);
  // hood: roof and two cheeks reaching forward over the screen
  const hood = pmat("#1d1e22", { roughness: 0.6 }), HD = 0.26;
  const roof = new THREE.Mesh(rbox(w + 0.16, 0.025, HD + 0.09, 0.01), hood); roof.position.set(0, cy + h / 2 + 0.065, HD / 2 - 0.02); g.add(roof);
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(rbox(0.025, h + 0.12, HD + 0.09, 0.01), hood); ch.position.set(s * (w / 2 + 0.07), cy, HD / 2 - 0.02); g.add(ch); }
  // LED countdown box on the hood
  const lc = makeCanvas(400, 140), lx = lc.getContext("2d"), ltex = texFrom(lc);
  const box = new THREE.Mesh(rbox(0.66, 0.24, 0.14, 0.02), black); box.position.set(0, cy + h / 2 + 0.2, 0.02); g.add(box);
  const led = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), new THREE.MeshBasicMaterial({ map: ltex, toneMapped: false })); led.position.set(0, cy + h / 2 + 0.2, 0.0905); g.add(led);
  let lastT = null;
  const timer = (text, on = true) => {
    const key = text + on; if (key === lastT) return; lastT = key;
    lx.fillStyle = "#0b0505"; lx.fillRect(0, 0, 400, 140);
    lx.font = "800 104px Inter"; lx.textAlign = "center"; lx.textBaseline = "middle";
    lx.fillStyle = on ? "#ff2a1a" : "#2a1210"; if (on) { lx.shadowColor = "#ff3b1f"; lx.shadowBlur = 18; } lx.fillText(text, 200, 76); lx.shadowBlur = 0;
    ltex.needsUpdate = true;
  };
  timer("0:00", false);
  // sign on the pole
  const sign = makePlate(label, signW, 0.3, { bg: "#141414", fg: "#f4f1ea" }); sign.position.set(0, 0.82, 0.04); g.add(sign);
  const clamp2 = new THREE.Mesh(rbox(0.16, 0.12, 0.08, 0.02), black); clamp2.position.set(0, 0.82, -0.005); g.add(clamp2);
  // floor power box beside the base, and the cable
  const pbox = new THREE.Mesh(rbox(0.26, 0.14, 0.2, 0.02), pmat("#3a3d42", { roughness: 0.5, metalness: 0.3 })); pbox.position.set(0.72, 0.07, -0.18); g.add(pbox);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), new THREE.MeshBasicMaterial({ color: "#3cff7a", toneMapped: false })); lamp.position.set(0.66, 0.15, -0.09); g.add(lamp);
  const plug = new THREE.Mesh(rbox(0.07, 0.05, 0.1, 0.012), pmat("#202124", { roughness: 0.4 })); g.add(plug);
  const prong = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.04), pmat("#c9ccd1", { metalness: 1, roughness: 0.3 })); plug.add(prong); prong.position.z = -0.065;   // the prongs point into the box
  const cableMat = pmat("#111214", { roughness: 0.5 });
  let cableMesh = null, lastK = -1;
  const SOCK = new V3(0.72, 0.07, -0.03), REST = new V3(1.15, 0.03, 0.32);
  const cable = (k) => {
    const q = Math.round(clamp(k) * 24) / 24; if (q === lastK) return; lastK = q;
    const end = SOCK.clone().lerp(REST, eOut(q)); end.y += Math.sin(Math.PI * q) * 0.25;
    plug.position.copy(end); plug.rotation.set(0, lerp(0, 1.1, q), lerp(0, 0.2, q));
    lamp.material.color.set(q < 0.5 ? "#3cff7a" : "#3a1010");
    // down the back of the pole, behind the base, between the base and the box, into the plug's back
    const pts = [new V3(0.1, cy - 0.1, -0.06), new V3(0.06, cy - 0.5, -0.09), new V3(0.08, 0.3, -0.12), new V3(0.2, 0.08, -0.32), new V3(0.47, 0.02, -0.34), new V3(0.49, 0.02, 0.06), end.clone().add(new V3(0, 0, 0.05))];
    if (cableMesh) { g.remove(cableMesh); cableMesh.geometry.dispose(); }
    cableMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.014, 8, false), cableMat); g.add(cableMesh);
  };
  cable(0);
  g.add(contactShadow(1.4, 1.1));
  return { group: g, ctx, tex, paint: (fn) => { fn(ctx, 640, 400); tex.needsUpdate = true; }, timer, sign, cable, screenY: cy, screenW: w, screenH: h };
}
