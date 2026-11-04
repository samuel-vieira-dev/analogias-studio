// ============================================================================
// props/sport.js · football at night: pitch with real markings, ball, goal with net, floodlight
//                  towers, pitch-side VAR monitor (screen, countdown box, name sign, power cable),
//                  the stadium bowl full of fans with beams of light rising from seats (one beam = one
//                  person), a row of stadium seats that light up
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

// ---------------------------------------------------------------- the stadium of 100 thousand (vídeo dos homicídios, 03/11/2026)
// Vertical fade for light beams: bright at the bottom (uv.y 0), gone at the top. Cached.
function beamFadeTex() {
  return cachedTex("beamFade", () => {
    const c = makeCanvas(8, 256), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.55, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,1)");
    x.fillStyle = g; x.fillRect(0, 0, 8, 256); return texFrom(c);
  });
}
// Beam of light rising from a seat: a bright thin core, a soft additive glow around it and a glow on the seat.
// One beam = one person (the stadium analogy). Origin: the seat; it rises along +y to `h`.
// API { group, set(k, color?) } — k 0..1 grows it up from the seat (0 = off).
function makeSeatBeam({ h = 0.6, r = 0.012, color = "#ff2a1a" } = {}) {
  const g = new THREE.Group(), col = new THREE.Group(); g.add(col);
  const coreM = new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.95, depthWrite: false });
  const glowM = new THREE.MeshBasicMaterial({ map: beamFadeTex(), color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  col.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.5, 1, 10, 1, true).translate(0, 0.5, 0), coreM));
  col.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 1.4, r * 2.6, 1, 16, 1, true).translate(0, 0.5, 0), glowM));
  const spot = sprite(BOKEH, r * 10); spot.material.color.set(color); spot.material.blending = THREE.AdditiveBlending; spot.userData.decor = true; g.add(spot);
  let cur = color;
  function set(k, c = cur) {
    k = clamp(k); if (c !== cur) { cur = c; coreM.color.set(c); glowM.color.set(c); spot.material.color.set(c); }
    col.visible = k > 0.005; col.scale.set(1, Math.max(0.001, h * eOut(k)), 1); spot.material.opacity = 0.9 * Math.min(1, k * 3); spot.visible = k > 0.005;
  }
  set(0);
  return { group: g, set };
}
// Top view of a football pitch (stripes and the white markings), 105 x 68 proportions. Cached.
function pitchTopTex() {
  return cachedTex("pitchTop", () => {
    const W2 = 1050, H2 = 680, c = makeCanvas(W2, H2), x = c.getContext("2d");
    for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#2f6b34" : "#3a7d3c"; x.fillRect(i * W2 / 14, 0, W2 / 14 + 1, H2); }
    speckle(x, W2, H2, 17, 9000, 0.12, 0.05, 2);
    x.strokeStyle = "rgba(240,244,236,0.92)"; x.lineWidth = 6; const m = 18;
    x.strokeRect(m, m, W2 - 2 * m, H2 - 2 * m);
    x.beginPath(); x.moveTo(W2 / 2, m); x.lineTo(W2 / 2, H2 - m); x.stroke();
    x.beginPath(); x.arc(W2 / 2, H2 / 2, 92, 0, Math.PI * 2); x.stroke();
    for (const s of [0, 1]) {
      const x0 = s ? W2 - m : m, d = s ? -1 : 1;
      x.strokeRect(Math.min(x0, x0 + d * 165), H2 / 2 - 202, 165, 404);
      x.strokeRect(Math.min(x0, x0 + d * 55), H2 / 2 - 92, 55, 184);
      x.beginPath(); x.arc(x0 + d * 110, H2 / 2, 92, s ? Math.PI - 0.93 : -0.93, s ? Math.PI + 0.93 : 0.93); x.stroke();
    }
    return texFrom(c);
  });
}
// Concrete facade of the stadium: grey panels, dark vertical slits, a lighter cornice. Tiles around the bowl.
function stadiumFacadeTex() {
  return cachedTex("stadiumFacade", () => {
    const c = makeCanvas(512, 256), x = c.getContext("2d");
    x.fillStyle = "#77736e"; x.fillRect(0, 0, 512, 256); speckle(x, 512, 256, 23, 5000, 0.16, 0.08, 2);
    for (let i = 0; i < 8; i++) { x.fillStyle = "rgba(20,18,16,0.85)"; x.fillRect(i * 64 + 26, 60, 12, 170); x.fillStyle = "rgba(255,255,255,0.08)"; x.fillRect(i * 64 + 38, 60, 3, 170); }
    x.fillStyle = "#8e8a84"; x.fillRect(0, 0, 512, 34); x.fillStyle = "rgba(0,0,0,0.3)"; x.fillRect(0, 34, 512, 6);
    const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
}
// Football stadium bowl, model or real (`size` scales it; size 1 = 3.3 x 2.3 units): an oval of stepped
// concrete stands full of seated fans (instanced bodies and heads), a striped pitch with its markings and
// two goals, the outer facade with a lit LED band (`band`), a white roof ring over the top rows and four
// floodlight masts. Beams of light can rise from seats of the lower and middle tiers, under the open sky:
// one beam = one person of the stadium. Camera flashes twinkle in the stands. The near half (z > 0) and
// the far half of the stands are separate groups, to frame a close-up of one side. The near side faces +z.
// beamR: radius of a beam (thicker for a small model seen from far). Origin: floor centre; long axis along x.
// API { group, front, back, beams(n, color?), ghosts(n), lights(k, color?), band(color), update(t), size, top, R1, EZ }
//   beams(n): the first n beams on (a fraction grows the next one); ghosts(n): grey beams (people who may
//   be missing from the count); lights(k, color): the floodlights, 0 off to 1 on, in `color`.
function makeStadiumBowl({ size = 1, tiers = 14, band = "#3a7bd5", seed = 5, maxBeams = 40, ghostsMax = 6, beamH = 0.62, beamR = 0.022 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const R0 = 1.0, R1 = 1.62, EZ = 0.7, HW = 0.035, T = tiers, dr = (R1 - R0) / T, hr = 0.42 / T, TOP = HW + T * hr;
  const ell = (rad, phi) => [rad * Math.sin(phi), rad * EZ * Math.cos(phi)];
  const front = new THREE.Group(), back = new THREE.Group(); g.add(front, back);
  // stands: one stepped profile turned around the bowl, half for each side
  const prof = [new THREE.Vector2(R0, 0), new THREE.Vector2(R0, HW)];
  for (let i = 0; i < T; i++) { const y = HW + i * hr; prof.push(new THREE.Vector2(R0 + (i + 1) * dr, y), new THREE.Vector2(R0 + (i + 1) * dr, y + hr)); }
  const concrete = pmat("#ffffff", { map: tileTex(cachedTex("stadiumConcrete", () => noiseTex({ base: "#8b8883", amount: 0.16, size: 1.5, seed: 71 })), 30, 2), roughness: 0.85, flatShading: true, side: THREE.DoubleSide });
  const facadeM = pmat("#ffffff", { map: tileTex(stadiumFacadeTex(), 18, 1), roughness: 0.8, side: THREE.DoubleSide });
  const roofM = pmat("#e9e7e2", { roughness: 0.5, clearcoat: 0.4, side: THREE.DoubleSide });
  const bandM = new THREE.MeshBasicMaterial({ color: band, toneMapped: false, side: THREE.DoubleSide });
  const ring = (pts, m, phi0, half) => { const ms = new THREE.Mesh(new THREE.LatheGeometry(pts, 96, phi0, Math.PI), m); ms.scale.z = EZ; half.add(ms); return ms; };
  [[front, -Math.PI / 2], [back, Math.PI / 2]].forEach(([half, phi0]) => {
    ring(prof, concrete, phi0, half);
    ring([new THREE.Vector2(R1 + 0.012, 0), new THREE.Vector2(R1 + 0.012, TOP + 0.02)], facadeM, phi0, half);
    ring([new THREE.Vector2(R1 + 0.014, TOP * 0.78), new THREE.Vector2(R1 + 0.014, TOP * 0.84)], bandM, phi0, half);
    ring([new THREE.Vector2(R1 - 0.2, TOP + 0.075), new THREE.Vector2(R1 + 0.03, TOP + 0.03)], roofM, phi0, half);
  });
  for (let i = 0; i < 24; i++) { const [x, z] = ell(R1 + 0.012, i / 24 * Math.PI * 2); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), roofM); p.position.set(x, TOP + 0.03, z); (z > 0 ? front : back).add(p); }
  // fans: one body and one head per seat, facing the pitch; a few empty seats
  const shirts = ["#d8cfc2", "#2b2f3a", "#b8322a", "#e8b923", "#2e6fbd", "#2a8a4a", "#eceae5", "#6a3d8a", "#d9752a", "#3a4a5e", "#1f6f6a"].map((c) => new THREE.Color(c));
  const skins = ["#e0b48a", "#c68c5a", "#8d5a3a", "#5a3a26", "#f1c9a5", "#a8714a"].map((c) => new THREE.Color(c));
  const seats = [[], []];
  for (let i = 0; i < T; i++) {
    const rad = R0 + (i + 0.55) * dr, y = HW + i * hr, a = rad, b = rad * EZ, per = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
    const n = Math.round(per / 0.03);
    for (let j = 0; j < n; j++) { if (r() < 0.05) continue; const phi = (j + (r() - 0.5) * 0.3) / n * Math.PI * 2, [x, z] = ell(rad, phi); seats[z > 0 ? 0 : 1].push({ x, y, z, rot: Math.atan2(-x, -z), c: shirts[Math.floor(r() * shirts.length)], s: skins[Math.floor(r() * skins.length)], k: 0.9 + r() * 0.2 }); }
  }
  const bodyGeo = rbox(0.02, 0.026, 0.016, 0.005, 2), headGeo = new THREE.SphereGeometry(0.0085, 10, 8), o = new THREE.Object3D();
  seats.forEach((list, hi) => {
    const half = hi ? back : front;
    const bodies = new THREE.InstancedMesh(bodyGeo, pmat("#ffffff", { roughness: 0.8 }), list.length), heads = new THREE.InstancedMesh(headGeo, pmat("#ffffff", { roughness: 0.6 }), list.length);
    list.forEach((p, i) => {
      o.position.set(p.x, p.y + 0.013 * p.k, p.z); o.rotation.set(0, p.rot, 0); o.scale.setScalar(p.k); o.updateMatrix(); bodies.setMatrixAt(i, o.matrix); bodies.setColorAt(i, p.c);
      o.position.y = p.y + 0.034 * p.k; o.updateMatrix(); heads.setMatrixAt(i, o.matrix); heads.setColorAt(i, p.s);
    });
    half.add(bodies, heads);
  });
  // ground inside the bowl, the pitch and its goals
  const moat = new THREE.Mesh(new THREE.CircleGeometry(R0, 64), pmat("#24412a", { roughness: 0.9 })); moat.rotation.x = -Math.PI / 2; moat.scale.y = EZ; moat.position.y = 0.002; g.add(moat);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.88), pmat("#ffffff", { map: pitchTopTex(), roughness: 0.9, envMapIntensity: 0.15 })); pitch.rotation.x = -Math.PI / 2; pitch.position.y = 0.004; g.add(pitch);
  const postM = pmat("#f4f4f1", { roughness: 0.3 });
  for (const s of [-1, 1]) {
    for (const zz of [-0.047, 0.047]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.03, 6), postM); p.position.set(s * 0.665, 0.019, zz); g.add(p); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.097, 6), postM); bar.rotation.x = Math.PI / 2; bar.position.set(s * 0.665, 0.034, 0); g.add(bar);
  }
  // floodlight masts on the four corners
  const steel = pmat("#2a2d33", { metalness: 0.6, roughness: 0.45 }), ON = new THREE.Color("#fff3dc"), OFF = new THREE.Color("#2a2724");
  const lampM = new THREE.MeshBasicMaterial({ color: ON.clone(), toneMapped: false }), halos = [];
  for (const phi of [0.85, Math.PI - 0.85, Math.PI + 0.85, -0.85]) {
    const [x, z] = ell(R1 + 0.06, phi), mh = TOP + 0.34;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, mh, 8), steel); mast.position.set(x, mh / 2, z); g.add(mast);
    const bank = new THREE.Group(); bank.position.set(x, mh + 0.02, z); bank.rotation.set(0.75, Math.atan2(-x, -z), 0, "YXZ"); g.add(bank);
    bank.add(new THREE.Mesh(rbox(0.13, 0.075, 0.016, 0.004), steel));
    for (let rr = 0; rr < 2; rr++) for (let cc = 0; cc < 4; cc++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.026, 0.004), lampM); l.position.set((cc - 1.5) * 0.03, (rr - 0.5) * 0.032, 0.009); bank.add(l); }
    const halo = sprite(BOKEH, 0.24); halo.material.color.set("#fff0d0"); halo.material.blending = THREE.AdditiveBlending; halo.userData.decor = true; halo.position.set(x, mh + 0.02, z); g.add(halo); halos.push(halo);   // on the lamp bank itself
  }
  let lvl = 1, lcol = ON.clone();
  const lights = (k, color) => { lvl = clamp(k); if (color) lcol.set(color); else lcol.copy(ON); lampM.color.copy(OFF).lerp(lcol, lvl); halos.forEach((h) => h.material.color.copy(lcol)); };
  // beam seats: spread around the bowl (golden angle), lower and middle tiers only (open sky above)
  const beamAt = (k, tierMin, tierSpan, off) => { const phi = (k * 2.39996 + off) % (Math.PI * 2), tier = tierMin + ((k * 5) % tierSpan), rad = R0 + (tier + 0.55) * dr; const [x, z] = ell(rad, phi); return new V3(x, HW + tier * hr + 0.03, z); };
  const mk = (n, color, tierMin, span, off, rr) => Array.from({ length: n }, (_, k) => { const b = makeSeatBeam({ h: beamH, r: rr, color }); b.group.position.copy(beamAt(k, tierMin, span, off)); g.add(b.group); return b; });
  const BEAMS = mk(maxBeams, "#ff2a1a", 1, 8, 0.3, beamR), GHOSTS = mk(ghostsMax, "#dde6f2", 2, 6, 1.9, beamR);
  const beams = (n, color) => BEAMS.forEach((b, i) => b.set(clamp(n - i), color));
  const ghosts = (n) => GHOSTS.forEach((b, i) => b.set(clamp(n - i)));
  // camera flashes twinkling in the stands
  const flashes = Array.from({ length: 26 }, (_, i) => { const all = seats[i % 2], p = all[Math.floor(r() * all.length)], s = sprite(BOKEH, 0.035); s.material.blending = THREE.AdditiveBlending; s.userData.decor = true; s.position.set(p.x, p.y + 0.04, p.z); g.add(s); return { s, ph: r() * 6.28, sp: 1.3 + r() * 2.2 }; });
  const update = (t) => {
    flashes.forEach((f) => { const v = Math.pow(Math.max(0, Math.sin(t * f.sp + f.ph)), 24); f.s.material.opacity = v; f.s.visible = v > 0.02; });
    halos.forEach((h, i) => { h.material.opacity = lvl * (0.55 + 0.06 * Math.sin(t * 1.7 + i * 2)); h.visible = lvl > 0.01; });
  };
  beams(0); ghosts(0); lights(1); update(0);
  g.scale.setScalar(size);
  return { group: g, front, back, beams, ghosts, lights, band: (c) => bandM.color.set(c), update, size, top: (TOP + 0.075) * size, R1: (R1 + 0.06) * size, EZ };
}

// Rows of stadium seats (moulded plastic bucket seat and backrest on a steel bracket, each with its number),
// `n` per row, each row on its own concrete step and one more step rising behind the last row (a block of
// the stands). light(i, k, color): seat i (row by row, front row first) glows and a beam of light rises
// from it (makeSeatBeam), the same beam as in the stadium. Origin: floor centre of the first step's front
// edge; the seats face +z. API { group, light(i, k, color?), seats, gap, stepH, stepD, levels }
function makeStadiumSeatRow({ n = 10, rows = 1, gap = 0.52, color = "#2a4466", beamH = 1.5 } = {}) {
  const g = new THREE.Group(), W2 = n * gap + 0.4, SH = 0.42, SD = 0.85;
  const concrete = pmat("#ffffff", { map: tileTex(cachedTex("stadiumConcrete2", () => noiseTex({ base: "#7f7c78", amount: 0.18, size: 2, seed: 73 })), 6, 1), roughness: 0.85 });
  for (let r = 0; r <= rows; r++) {
    const top = (r + 1) * SH, d = r < rows ? SD : 0.6, z1 = -r * SD;
    const step = new THREE.Mesh(rbox(W2, top, d, 0.02), concrete); step.position.set(0, top / 2, z1 - d / 2); g.add(step);
    if (r < rows) { const edge = new THREE.Mesh(new THREE.BoxGeometry(W2, 0.03, 0.04), pmat("#e8b923", { roughness: 0.5 })); edge.position.set(0, top - 0.014, z1); g.add(edge); }
  }
  const steel = pmat("#3a3d42", { metalness: 0.7, roughness: 0.35 });
  const seats = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
    const s = new THREE.Group(); s.position.set((i - (n - 1) / 2) * gap, (r + 1) * SH, -0.42 - r * SD); g.add(s);
    const m = pmat(color, { roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15, emissive: "#000000" });
    const post = new THREE.Mesh(rbox(0.05, 0.3, 0.05, 0.01), steel); post.position.set(0, 0.15, -0.12); s.add(post);
    const foot = new THREE.Mesh(rbox(0.16, 0.012, 0.12, 0.004), steel); foot.position.set(0, 0.006, -0.12); s.add(foot);
    const pan = new THREE.Mesh(rbox(0.42, 0.05, 0.38, 0.025), m); pan.position.set(0, 0.32, 0.02); s.add(pan);
    const lip = new THREE.Mesh(rbox(0.42, 0.04, 0.05, 0.02), m); lip.position.set(0, 0.35, 0.19); s.add(lip);
    const backrest = new THREE.Mesh(rbox(0.42, 0.4, 0.045, 0.03), m); backrest.position.set(0, 0.56, -0.17); backrest.rotation.x = -0.12; s.add(backrest);
    const num = makePlate(String(r * n + i + 1), 0.1, 0.07, { bg: "#eceae5", fg: "#141414", depth: 0.004, detail: true }); num.position.set(0, 0.67, -0.142); num.rotation.x = -0.12; s.add(num);
    const beam = makeSeatBeam({ h: beamH, r: 0.06 }); beam.group.position.set(0, 0.36, 0.02); s.add(beam.group);
    seats.push({ group: s, m, beam });
  }
  g.add(contactShadow(W2 + 0.6, 1.4));
  const light = (i, k, color = "#ff2a1a") => { const s = seats[i]; s.m.emissive.set(color).multiplyScalar(0.55 * clamp(k)); s.beam.set(k, color); };
  return { group: g, light, seats, gap, stepH: SH, stepD: SD, levels: rows + 1 };
}

// Stadium LED scoreboard on two steel legs: a black cabinet with a row of lamps on top and the screen in
// front (paint(fn): fn(ctx, 1280, 720) draws it). Origin: floor centre; faces +z.
// API { group, paint(fn), screenY, w, h, top }
function makeScoreboard({ w = 3.2, h = 1.8, legH = 1.6 } = {}) {
  const g = new THREE.Group(), steel = pmat("#2a2d33", { metalness: 0.6, roughness: 0.4 }), black = pmat("#121316", { roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  const cy = legH + h / 2 + 0.08;
  const cab = new THREE.Mesh(rbox(w + 0.24, h + 0.24, 0.3, 0.04), black); cab.position.set(0, cy, -0.1); g.add(cab);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(rbox(0.16, legH + 0.2, 0.16, 0.02), steel); leg.position.set(s * w * 0.32, (legH + 0.2) / 2, -0.12); g.add(leg);
    const pad = new THREE.Mesh(rbox(0.42, 0.06, 0.42, 0.02), steel); pad.position.set(s * w * 0.32, 0.03, -0.12); g.add(pad);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.6), steel); brace.position.set(s * w * 0.32, legH * 0.45, -0.35); brace.rotation.x = 0.6; g.add(brace);
  }
  const c = makeCanvas(1280, 720), ctx = c.getContext("2d"), tex = texFrom(c);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, cy, 0.052); g.add(screen);
  const lampM = new THREE.MeshBasicMaterial({ color: "#fff3dc", toneMapped: false });
  const bar = new THREE.Mesh(rbox(w * 0.9, 0.08, 0.12, 0.02), black); bar.position.set(0, cy + h / 2 + 0.2, -0.05); g.add(bar);
  for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(rbox(w * 0.08, 0.06, 0.02, 0.01), lampM); l.position.set((i - 3.5) * w * 0.11, cy + h / 2 + 0.2, 0.02); g.add(l); }
  g.add(contactShadow(w * 0.9, 1.0));
  return { group: g, paint: (fn) => { fn(ctx, 1280, 720); tex.needsUpdate = true; }, screenY: cy, w, h, top: cy + h / 2 + 0.24 };
}
