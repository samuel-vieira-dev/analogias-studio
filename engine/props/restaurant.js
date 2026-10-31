// ============================================================================
// props/restaurant.js · dinner-table analogy kit (realistic materials, not cartoon):
//   dining table with linen cloth, upholstered chair, rigged diner in a suit (sits, stands, walks,
//   reaches), tent place card, porcelain dish + silver cloche, banknote bundle, glass jar with
//   coins (fill level), receipt that unrolls, leather bill folder, pendant lamp, padlock,
//   desk calendar, hanging price tag, restaurant room backdrop, night skyline backdrop.
// Every builder returns plain THREE objects; animation lives in each video's scenes.js.
// Units: metres (table top at 0.77). Origin of standing things: floor, centre; front = +z.
// ============================================================================

const LINEN = noiseTex({ base: "#f3efe7", amount: 0.06, size: 1, seed: 31, weave: true });
LINEN.repeat.set(6, 6);
const SUIT_WEAVE = noiseTex({ base: "#9a9a9a", amount: 0.22, size: 1, seed: 33, weave: true });
SUIT_WEAVE.repeat.set(3, 3);
const GOLD = "#c9a24e";
const goldMat = () => pmat(GOLD, { metalness: 1, roughness: 0.28 });
const steelMat = (r = 0.22) => pmat("#c9ccd1", { metalness: 1, roughness: r });

// ---------------------------------------------------------------- table and chair
// Dining table, origin floor centre, long side along x. Linen tablecloth (clothColor) with a short drop.
// API: { group, topY, w, d }
function makeDiningTable({ w = 4.2, d = 1.25, cloth = true, clothColor = "#f3efe7" } = {}) {
  const g = new THREE.Group(), topY = 0.77;
  const wt = woodTex({ base: "#5a3420", seed: 12 }); wt.repeat.set(2, 1);
  const top = new THREE.Mesh(rbox(w, 0.05, d, 0.02), pmat("#ffffff", { map: wt, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.25 }));
  top.position.y = topY - 0.025; g.add(top);
  const legM = pmat("#3a2214", { roughness: 0.5, clearcoat: 0.3 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, topY - 0.05, 16), legM);
    leg.position.set(sx * (w / 2 - 0.18), (topY - 0.05) / 2, sz * (d / 2 - 0.14)); g.add(leg);
  }
  if (cloth) {
    const cm = pmat(clothColor, { map: LINEN, roughness: 0.92, sheen: 0.5, sheenColor: new THREE.Color(clothColor).lerp(new THREE.Color("#ffffff"), 0.35), sheenRoughness: 0.6 });
    const sheet = new THREE.Mesh(rbox(w + 0.06, 0.008, d + 0.06, 0.004), cm); sheet.position.y = topY + 0.004; g.add(sheet);
    const drop = 0.2;
    for (const sz of [-1, 1]) { const f = new THREE.Mesh(rbox(w + 0.07, drop, 0.008, 0.003), cm); f.position.set(0, topY - drop / 2 + 0.008, sz * (d / 2 + 0.034)); g.add(f); }
    for (const sx of [-1, 1]) { const f = new THREE.Mesh(rbox(0.008, drop, d + 0.07, 0.003), cm); f.position.set(sx * (w / 2 + 0.034), topY - drop / 2 + 0.008, 0); g.add(f); }
  }
  g.add(contactShadow(w + 0.8, d + 0.9));
  return { group: g, topY: topY + (cloth ? 0.008 : 0), w, d };
}

// Upholstered dining chair, origin floor centre, the sitter faces +z. Seat top at 0.47.
function makeChair({ fabric = "#5b1f22", wood = "#3a2214" } = {}) {
  const g = new THREE.Group(), seatY = 0.47;
  const wm = pmat(wood, { roughness: 0.45, clearcoat: 0.35 });
  const fm = pmat(fabric, { roughness: 0.85, sheen: 0.8, sheenColor: new THREE.Color("#c45a5a"), sheenRoughness: 0.5 });
  const seat = new THREE.Mesh(rbox(0.46, 0.07, 0.46, 0.03), fm); seat.position.y = seatY - 0.035; g.add(seat);
  const frame = new THREE.Mesh(rbox(0.48, 0.04, 0.48, 0.01), wm); frame.position.y = seatY - 0.085; g.add(frame);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const h = sz < 0 ? 1.0 : seatY - 0.1, leg = new THREE.Mesh(rbox(0.04, h, 0.04, 0.01), wm);
    leg.position.set(sx * 0.21, h / 2, sz * 0.21); g.add(leg);
  }
  const back = new THREE.Mesh(rbox(0.38, 0.4, 0.05, 0.02), fm); back.position.set(0, seatY + 0.33, -0.21); back.rotation.x = -0.06; g.add(back);
  const rail = new THREE.Mesh(rbox(0.46, 0.05, 0.05, 0.015), wm); rail.position.set(0, 1.0, -0.215); g.add(rail);
  g.add(contactShadow(0.8, 0.8));
  return { group: g, seatY };
}

// ---------------------------------------------------------------- the diner (rigged mannequin)
// Adult figure in a suit, faceless (mannequin), proportions of a 1.76 m person. Origin: floor under
// the hips; faces +z. setPose({ sit, walk, swing, table, reach, turn, lean }):
//   sit 0 standing → 1 seated (pelvis on a 0.47 seat, thighs forward)
//   walk: gait phase (radians); swing 0..1: gait amplitude (0 = still)
//   table 0..1: forearms resting on a table top in front (seated)
//   reach 0..1: right arm reaching forward/up (to drop a coin, take a plate)
//   turn: yaw of the whole body; lean: torso pitch forward (+)
// API: { group, setPose, hand: right hand Object3D (world position via getWorldPosition), parts }
function makeDiner({ suit = "#22252b", shirt = "#ecebe7", tie = "#5b1b1b", skin = "#c8977a", hair = "#2a1d16", shoes = "#141210" } = {}) {
  const g = new THREE.Group();
  const sm = pmat(suit, { roughness: 0.78, sheen: 0.4, sheenColor: new THREE.Color("#8b8f99"), sheenRoughness: 0.7, bumpMap: SUIT_WEAVE, bumpScale: 0.6 });
  const skm = pmat(skin, { roughness: 0.55, sheen: 0.25, sheenColor: new THREE.Color("#ffd2b8") });
  const shm = pmat(shirt, { roughness: 0.7 });
  const hm = pmat(hair, { roughness: 0.9 });
  const shoeM = pmat(shoes, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
  const tieM = pmat(tie, { roughness: 0.45, sheen: 0.6, sheenColor: new THREE.Color("#ff9a9a") });
  const cap = (r, l, m, seg = 16) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, seg), m);
  const THIGH = 0.44, SHIN = 0.43, UPPER = 0.3, FORE = 0.27;

  const pelvis = new THREE.Group(); g.add(pelvis);
  const hips = cap(0.13, 0.12, sm); hips.rotation.z = Math.PI / 2; hips.scale.set(1, 1, 0.85); hips.position.y = 0.02; pelvis.add(hips);
  // torso pivots at the pelvis
  const torso = new THREE.Group(); pelvis.add(torso);
  const chest = cap(0.16, 0.3, sm, 20); chest.scale.set(1.18, 1, 0.74); chest.position.y = 0.3; torso.add(chest);
  const shirtV = new THREE.Mesh(new THREE.CircleGeometry(0.075, 3), shm); shirtV.rotation.z = -Math.PI / 2; shirtV.scale.set(1.6, 1, 1); shirtV.position.set(0, 0.5, 0.128); shirtV.rotation.x = -0.08; torso.add(shirtV);
  const tieMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.012, 0.22, 4), tieM); tieMesh.rotation.y = Math.PI / 4; tieMesh.scale.set(1, 1, 0.25); tieMesh.position.set(0, 0.42, 0.13); torso.add(tieMesh);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), tieM); knot.position.set(0, 0.535, 0.12); torso.add(knot);
  const shoulders = cap(0.075, 0.27, sm); shoulders.rotation.z = Math.PI / 2; shoulders.position.y = 0.5; shoulders.scale.set(1, 1, 0.85); torso.add(shoulders);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.05, 0.13, 16), skm); neck.position.y = 0.615; torso.add(neck);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.07, 0.05, 20, 1, true), shm); collar.position.y = 0.575; torso.add(collar);
  const head = new THREE.Group(); head.position.y = 0.75; head.scale.setScalar(0.9); torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 24), skm); skull.scale.set(0.92, 1.18, 1.0); head.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), skm); jaw.position.set(0, -0.055, 0.025); jaw.scale.set(1, 0.8, 1); head.add(jaw);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 10), skm); nose.rotation.x = Math.PI / 2; nose.position.set(0, -0.005, 0.1); head.add(nose);
  for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), skm); ear.scale.set(0.5, 1, 0.8); ear.position.set(sx * 0.09, 0, -0.005); head.add(ear); }
  // hair: the skull's top grown 6% (covers it everywhere, nothing pokes through), tilted back so the
  // hairline sits high on the forehead, above the ears at the temples and low at the nape (+ a nape strip).
  const HS = [0.92 * 1.06, 1.18 * 1.06, 1.0 * 1.06];
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), hm); hairCap.scale.set(...HS); hairCap.position.y = 0.006; hairCap.rotation.x = -0.4; head.add(hairCap);
  const nape = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 8, Math.PI * 1.15, Math.PI * 0.7, Math.PI * 0.45, Math.PI * 0.17), hm); nape.scale.set(...HS); nape.position.y = 0.006; head.add(nape);

  // arms: shoulder pivot → upper arm (down -y) → elbow pivot → forearm → hand
  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.2, 0.48, 0); torso.add(sh);
    const up = cap(0.05, UPPER - 0.06, sm); up.position.y = -UPPER / 2; sh.add(up);
    const el = new THREE.Group(); el.position.y = -UPPER; sh.add(el);
    const fo = cap(0.044, FORE - 0.06, sm); fo.position.y = -FORE / 2; el.add(fo);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, 0.03, 14), shm); cuff.position.y = -FORE + 0.02; el.add(cuff);
    const hand = new THREE.Group(); hand.position.y = -FORE - 0.02; el.add(hand);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), skm); palm.scale.set(0.75, 1.15, 0.45); palm.position.y = -0.03; hand.add(palm);
    const thumb = cap(0.012, 0.03, skm, 8); thumb.position.set(-sx * 0.03, -0.02, 0.015); thumb.rotation.z = sx * 0.6; hand.add(thumb);
    arms.push({ sh, el, hand });
  }
  // legs: hip pivot → thigh → knee pivot → shin → shoe
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(sx * 0.095, 0, 0); pelvis.add(hip);
    const th = cap(0.068, THIGH - 0.1, sm); th.position.y = -THIGH / 2; hip.add(th);
    const kn = new THREE.Group(); kn.position.y = -THIGH; hip.add(kn);
    const shn = cap(0.055, SHIN - 0.09, sm); shn.position.y = -SHIN / 2; kn.add(shn);
    const foot = new THREE.Mesh(rbox(0.095, 0.06, 0.26, 0.025), shoeM); foot.position.set(0, -SHIN - 0.02, 0.06); kn.add(foot);
    legs.push({ hip, kn });
  }
  g.add(contactShadow(0.9, 0.9));
  const STAND = THIGH + SHIN + 0.05;

  function setPose({ sit = 0, walk = 0, swing = 0, table = 0, reach = 0, turn = 0, lean = 0, look = 0 } = {}) {
    g.rotation.y = turn;
    pelvis.position.set(0, lerp(STAND, 0.47 + 0.1, sit), lerp(0, -0.02, sit));
    torso.rotation.x = lean + sit * 0.06;
    head.rotation.x = look;
    const s = Math.sin(walk) * swing;
    legs.forEach((L, i) => {
      const side = i === 0 ? 1 : -1, ph = s * side;
      L.hip.rotation.x = lerp(-ph * 0.45, -Math.PI / 2 + 0.05, sit);
      L.kn.rotation.x = lerp(Math.max(0, -Math.sin(walk + (side > 0 ? 0 : Math.PI))) * 0.7 * swing, Math.PI / 2 - 0.05, sit);
    });
    arms.forEach((A, i) => {
      const side = i === 0 ? -1 : 1, ph = s * (i === 0 ? -1 : 1);
      const restX = ph * 0.35, restEl = -0.12 - Math.abs(ph) * 0.15;
      // seated with forearms on the table: upper arm forward-down, forearm level
      let sx = lerp(restX, -0.5, table), elx = lerp(restEl, -1.02, table), tw = -side * 0.55 * table;
      if (i === 1) { sx = lerp(sx, -1.35, reach); elx = lerp(elx, -0.35, reach); tw = lerp(tw, 0, reach); }
      A.sh.rotation.set(sx, tw, side * 0.06 * (1 - table) + side * 0.08 * table);
      A.el.rotation.set(elx, 0, 0);
    });
  }
  setPose({});
  return { group: g, setPose, hand: arms[1].hand, parts: { pelvis, torso, head, arms, legs } };
}

// ---------------------------------------------------------------- table items
// Conference name plate: a black wedge with the name printed on its sloped front face (makePlate),
// readable from a camera in front and above. Origin: on the table, centre. API: { group, plate }
function makePlaceCard(name, { w = 0.46, h = 0.15, bg = "#121212", fg = "#f4f1ea", tilt = 0.5 } = {}) {
  // cross-section (z forward, y up): low front edge, sloped face rising to the back
  const g = new THREE.Group(), lip = 0.018, back = 0.02;
  const fz = h * Math.sin(tilt), fy = h * Math.cos(tilt); // the face spans fz back and fy up
  const depth = fz + back;
  const sh = new THREE.Shape(); // shape x = z (front at x = depth), shape y = y
  sh.moveTo(0, 0); sh.lineTo(depth, 0); sh.lineTo(depth, lip); sh.lineTo(back, lip + fy); sh.lineTo(0, lip + fy); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 });
  geo.translate(-depth / 2, 0, -w / 2); geo.rotateY(-Math.PI / 2); // shape x → +z, extrusion → x
  const body = new THREE.Mesh(geo, pmat(bg, { roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 })); g.add(body);
  const plate = makePlate(name, w * 0.94, h * 0.8, { bg, fg, depth: 0.002 });
  const face = new THREE.Group(); face.rotation.x = -tilt; // top leans back, face looks forward and up
  face.position.set(0, lip + fy / 2, (depth / 2 - fz / 2)); g.add(face);
  plate.position.z = 0.0045; face.add(plate);
  return { group: g, plate };
}

// Porcelain dinner plate (lathe profile) with a thin gold rim. Origin: table top, centre.
function makeDish({ r = 0.15 } = {}) {
  const g = new THREE.Group();
  const pts = [[0, 0], [r * 0.55, 0], [r * 0.6, 0.006], [r * 0.62, 0.012], [r * 0.95, 0.024], [r, 0.03], [r * 0.99, 0.034], [r * 0.93, 0.03], [r * 0.6, 0.016], [0, 0.014]].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), pmat("#fbfaf6", { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide })); g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.975, 0.0025, 6, 64), goldMat()); rim.rotation.x = Math.PI / 2; rim.position.y = 0.032; g.add(rim);
  return g;
}
// Silver cloche (dome cover) with a knob. Origin: rim centre (sits on a dish).
function makeCloche({ r = 0.15 } = {}) {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), steelMat(0.12)); dome.scale.y = 0.85; g.add(dome);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 20, 12), steelMat(0.12)); knob.position.y = r * 0.88; g.add(knob);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 64), steelMat(0.18)); lip.rotation.x = Math.PI / 2; g.add(lip);
  return g;
}
// Generic banknote face (no real design): tinted paper, guilloche rings, value and "REAIS".
function banknoteTex(value = "100", tint = "#4f7f9a") {
  const c = makeCanvas(512, 240), x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 0, 512, 240); gr.addColorStop(0, "#e9eee6"); gr.addColorStop(1, "#d5e0da"); x.fillStyle = gr; x.fillRect(0, 0, 512, 240);
  x.fillStyle = tint; x.globalAlpha = 0.55; x.fillRect(0, 0, 512, 240); x.globalAlpha = 1;
  x.strokeStyle = "rgba(255,255,255,0.35)"; x.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) { x.beginPath(); x.ellipse(150, 120, 20 + i * 5, 12 + i * 4, i * 0.12, 0, Math.PI * 2); x.stroke(); }
  x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 6; x.strokeRect(10, 10, 492, 220);
  x.fillStyle = "rgba(255,255,255,0.92)"; x.font = "900 92px Inter"; x.textAlign = "right"; x.textBaseline = "middle"; x.fillText(value, 488, 78);
  x.font = "800 30px Inter"; x.fillText("REAIS", 486, 190);
  const t = texFrom(c); return t;
}
const NOTE100 = banknoteTex("100", "#3f6f86");
// Bundle of banknotes with a paper band. Origin: bottom centre (lies flat).
function makeCashBundle({ w = 0.17, d = 0.078, h = 0.035 } = {}) {
  const g = new THREE.Group();
  const edge = noiseTex({ w: 64, h: 64, base: "#dde4dc", amount: 0.4, size: 1, seed: 41 });
  const side = pmat("#dfe6de", { map: edge, roughness: 0.9 }), face = pmat("#ffffff", { map: NOTE100, roughness: 0.75 });
  const stack = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, face, side, side, side]); stack.position.y = h / 2; g.add(stack);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.03, h + 0.003, d + 0.003), pmat("#efe2b8", { roughness: 0.7 })); band.position.y = h / 2; g.add(band);
  return g;
}
// Gold coin lying flat (realistic: metal with a reeded edge). Origin: bottom centre.
function makeGoldCoin(r = 0.03, t = 0.006) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, t, 40), goldMat()); m.position.y = t / 2;
  const g = new THREE.Group(); g.add(m); return g;
}

// Glass jar with a brushed steel lid, coins inside and a paper label printed with `label`.
// Origin: table top, centre. fill(k): 0..1 coin level. API: { group, fill, glass, lid, label, rimY, count }
function makeJar({ r = 0.26, h = 0.62, label = "FGC", n = 420, seed = 17 } = {}) {
  const g = new THREE.Group();
  const prof = [[0.0, 0.004], [r * 0.9, 0.0], [r, 0.04], [r, h * 0.82], [r * 0.9, h * 0.9], [r * 0.82, h * 0.93], [r * 0.82, h]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), glassMat()); glass.renderOrder = 10; glass.userData.noShadow = true; g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, 0.012, 48), glassMat({ opacity: 0.35 })); base.position.y = 0.006; base.renderOrder = 9; g.add(base);
  const lid = new THREE.Group(); lid.position.y = h; g.add(lid);
  // brushed steel, rough enough that the studio reflections do not tint it differently from shot to shot
  const lm = pmat("#9a9da3", { metalness: 0.85, roughness: 0.55 });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.86, 0.05, 48), lm); ring.position.y = 0.025; lid.add(ring);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(r * 0.9, 0.006, 0.03), pmat("#18181a", { roughness: 0.6 })); slot.position.y = 0.0505; lid.add(slot);
  // coins: instanced, packed in layers from the bottom; fill(k) shows the first k·n
  const cr = 0.032, ct = 0.007, rnd = mulberry32(seed);
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(cr, cr, ct, 24), goldMat(), n);
  const d = new THREE.Object3D(); const perLayer = Math.floor((r * r) / (cr * cr) * 0.62);
  for (let i = 0; i < n; i++) {
    const layer = Math.floor(i / perLayer), a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (r - cr - 0.012);
    d.position.set(Math.cos(a) * rr, 0.016 + layer * ct * 1.15 + rnd() * 0.004, Math.sin(a) * rr);
    d.rotation.set((rnd() - 0.5) * 0.5, rnd() * 6.28, (rnd() - 0.5) * 0.5); d.updateMatrix(); coins.setMatrixAt(i, d.matrix);
  }
  coins.count = n; g.add(coins);
  const layers = Math.ceil(n / perLayer), fullY = 0.016 + layers * ct * 1.15;
  const lab = makePlate(label, r * 1.25, r * 0.62, { bg: "#f2e8d2", fg: "#1c1410", depth: 0.004 });
  lab.position.set(0, h * 0.45, r + 0.004); g.add(lab);
  const fill = (k) => { coins.count = Math.max(0, Math.min(n, Math.round(clamp(k) * n))); coins.visible = coins.count > 0; };
  g.add(contactShadow(r * 3.2, r * 3.2));
  return { group: g, fill, glass, lid, label: lab, rimY: h + 0.05, count: n, fullY, coins };
}

// Long receipt (thermal paper) that unrolls downward from its top edge. Lines: [left, right].
// Origin: top centre; the paper hangs/lies along -y of its own frame. API: { group, set(k), mesh, h }
function makeReceipt({ w = 0.42, h = 1.4, title = "CONTA", lines = [], total = "" } = {}) {
  const c = makeCanvas(420, Math.round(420 * h / w)), x = c.getContext("2d");
  x.fillStyle = "#fbf8f0"; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
  x.fillStyle = "#1b1612"; x.textBaseline = "middle"; x.textAlign = "center"; x.font = "900 64px Inter"; x.fillText(title, 210, 70);
  x.font = "600 22px Inter"; x.fillText("MESA DOS BANCOS", 210, 118);
  x.setLineDash([8, 8]); x.strokeStyle = "#5a524c"; x.lineWidth = 3; x.beginPath(); x.moveTo(24, 150); x.lineTo(396, 150); x.stroke();
  lines.forEach(([a, b], i) => { const y = 200 + i * 54; x.textAlign = "left"; x.font = "700 28px Inter"; x.fillText(a, 28, y); x.textAlign = "right"; x.fillText(b, 392, y); });
  const ty = 200 + lines.length * 54 + 30; x.beginPath(); x.moveTo(24, ty); x.lineTo(396, ty); x.stroke(); x.setLineDash([]);
  if (total) { x.textAlign = "left"; x.font = "900 40px Inter"; x.fillText("TOTAL", 28, ty + 56); x.textAlign = "right"; x.fillStyle = "#b3241a"; x.fillText(total, 392, ty + 56); }
  const tex = texFrom(c); tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pmat("#ffffff", { map: tex, roughness: 0.85, side: THREE.DoubleSide }));
  const g = new THREE.Group(); g.add(mesh);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, w, 24), pmat("#fbf8f0", { roughness: 0.85 })); roll.rotation.z = Math.PI / 2; g.add(roll);
  function set(k) {
    k = clamp(k); const vis = Math.max(0.001, k);
    mesh.scale.y = vis; mesh.position.y = -h * vis / 2; tex.repeat.set(1, vis); tex.offset.set(0, 1 - vis);
    roll.position.set(0, -h * vis, 0.02); roll.visible = k < 0.999; mesh.visible = k > 0.002;
  }
  set(1);
  return { group: g, set, mesh, h, w };
}
// Leather bill folder (closed), lying flat; "CONTA" stamped in gold. Origin: bottom centre.
function makeBillFolder({ w = 0.2, d = 0.3 } = {}) {
  const g = new THREE.Group();
  const leather = noiseTex({ base: "#3a2117", amount: 0.25, size: 2, seed: 51 });
  const body = new THREE.Mesh(rbox(w, 0.025, d, 0.008), pmat("#ffffff", { map: leather, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4 })); body.position.y = 0.0125; g.add(body);
  const p = makePlate("CONTA", w * 0.7, d * 0.2, { bg: "#3a2117", fg: "#d9b66a", depth: 0.002 }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.026, 0); g.add(p);
  return { group: g, plate: p };
}

// Pendant lamp: cord, black metal shade (gold inside), warm bulb. Origin: the ceiling point.
function makePendantLamp({ drop = 1.1, r = 0.22, light = true } = {}) {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, drop, 8), pmat("#111", { roughness: 0.6 })); cord.position.y = -drop / 2; g.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.8, 48, 1, true), [pmat("#151515", { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide })]);
  shade.position.y = -drop - r * 0.4; g.add(shade);
  const inner = new THREE.Mesh(new THREE.ConeGeometry(r * 0.985, r * 0.79, 48, 1, true), pmat(GOLD, { metalness: 1, roughness: 0.3, side: THREE.BackSide })); inner.position.copy(shade.position); g.add(inner);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.26, 20, 14), new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false })); bulb.position.y = -drop - r * 0.72; g.add(bulb);
  if (light) { const pl = new THREE.PointLight("#ffbf7a", 2.2, 5, 1.8); pl.position.copy(bulb.position); pl.position.y -= 0.05; g.add(pl); g.userData.light = pl; }
  return g;
}

// Padlock (steel shackle, brass body). Origin: bottom centre. API: { group, open(k) }
function makePadlock({ s = 1 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(rbox(0.5 * s, 0.42 * s, 0.18 * s, 0.05 * s), pmat("#b8863b", { metalness: 1, roughness: 0.3 })); body.position.y = 0.21 * s; g.add(body);
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 0.02, 16), pmat("#1a1208", { roughness: 0.8 })); hole.rotation.x = Math.PI / 2; hole.position.set(0, 0.2 * s, 0.091 * s); g.add(hole);
  const shackle = new THREE.Group(); shackle.position.set(-0.15 * s, 0.42 * s, 0); g.add(shackle);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.15 * s, 0.035 * s, 16, 40, Math.PI), steelMat(0.18)); arc.position.set(0.15 * s, 0.12 * s, 0); shackle.add(arc);
  for (const x of [0, 0.3 * s]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 0.14 * s, 16), steelMat(0.18)); leg.position.set(x, 0.05 * s, 0); shackle.add(leg); }
  return { group: g, open: (k) => { shackle.position.y = 0.42 * s + 0.12 * s * k; shackle.rotation.y = -1.2 * clamp((k - 0.5) * 2); } };
}

// Desk calendar with flip pages (one plate per page). Origin: bottom centre; faces +z.
// API: { group, show(i, k) } — page i fully shown, k 0..1 flips it over the top.
function makeDeskCalendar(pages, { w = 0.9, h = 0.8 } = {}) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(rbox(w, 0.06, 0.5, 0.02), pmat("#2a2522", { roughness: 0.5 })); stand.position.y = 0.03; g.add(stand);
  const easel = new THREE.Mesh(rbox(w * 0.96, h, 0.03, 0.01), pmat("#2a2522", { roughness: 0.5 })); easel.position.set(0, 0.06 + h / 2, -0.12); easel.rotation.x = -0.18; g.add(easel);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.06 + h, -0.12 + Math.sin(0.18) * h / 2 * 0); g.add(hinge);
  const leaves = pages.map((txt, i) => {
    const piv = new THREE.Group(); piv.position.set(0, 0.06 + h * Math.cos(0.18), -0.12 - Math.sin(0.18) * h / 2 + 0.02 + i * 0.002); g.add(piv);
    const page = makePlate(txt, w * 0.9, h * 0.86, { bg: "#f7f2e8", fg: i === pages.length - 1 ? RED : "#1c1410", depth: 0.006 });
    page.position.set(0, -h * 0.45, 0.01 + (pages.length - i) * 0.004); piv.add(page); piv.rotation.x = -0.18;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 20), steelMat()); ring.rotation.y = Math.PI / 2; ring.position.set(w * 0.3, 0, 0.012); piv.add(ring.clone()); ring.position.x = -w * 0.3; piv.add(ring);
    return { piv, page };
  });
  // page i on top: earlier pages flipped up and over
  function show(i, k = 0) {
    leaves.forEach((L, j) => {
      const flip = j < i ? 1 : j === i ? k : 0;
      L.piv.rotation.x = -0.18 - flip * 2.9; L.piv.visible = flip < 0.98;
    });
  }
  show(0);
  return { group: g, show, leaves };
}

// Hanging price tag (paper, metal eyelet, string) with printed text; arrow colour decides meaning.
// Origin: the top of the string. API: { group, plate }
function makePriceTag(text, { w = 0.95, h = 0.42, color = RED, fg = "#ffffff", string = 0.35 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, string, 6), pmat("#d9d0c3", { roughness: 0.9 })); s.position.y = -string / 2; g.add(s);
  const tag = new THREE.Group(); tag.position.y = -string; g.add(tag);
  const shape = new THREE.Shape(); const n = h * 0.32;
  shape.moveTo(-w / 2 + n, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, -h); shape.lineTo(-w / 2 + n, -h); shape.lineTo(-w / 2, -h / 2); shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.004, bevelSegments: 2 });
  const body = new THREE.Mesh(geo, pmat(color, { roughness: 0.6 })); body.position.z = -0.006; body.rotation.z = Math.PI / 2; body.position.x = h / 2; tag.add(body);
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 8, 20), steelMat()); eye.position.set(0, -0.06, 0.012); tag.add(eye);
  const plate = makePlate(text, h * 0.86, w * 0.62, { bg: color, fg, depth: 0.003 }); plate.rotation.z = Math.PI / 2; plate.position.set(0, -w / 2 - 0.04, 0.012); tag.add(plate);
  return { group: g, tag, plate };
}

// ---------------------------------------------------------------- backdrops (context, full frame)
// Restaurant room around a table at the origin: plank floor, wood wainscot and warm plaster walls,
// arched windows with city bokeh, wall sconces, other set tables fading in the fog, pendant lamps
// over the main table. All backdrop (asBackdrop): never framed, never checked.
// API: { group, update(t) }
function makeRestaurantRoom({ wallZ = -5.5, sideX = 7, lampsX = [-1.2, 1.2], lampY = 2.75, tables = true, seed = 3 } = {}) {
  const g = new THREE.Group();
  const ft = woodTex({ base: "#4a2c1a", planks: 8, seed: 4, w: 1024, h: 1024 }); ft.repeat.set(5, 5);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), pmat("#ffffff", { map: ft, roughness: 0.72, envMapIntensity: 0.25 })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.002; fl.receiveShadow = true; g.add(fl);
  const plaster = noiseTex({ base: "#26302b", amount: 0.05, size: 1, seed: 8 }); plaster.repeat.set(6, 3);
  const wall = pmat("#ffffff", { map: plaster, roughness: 0.85 });
  const panelT = woodTex({ base: "#3b2216", seed: 6 }); panelT.repeat.set(6, 1);
  const panel = pmat("#ffffff", { map: panelT, roughness: 0.5, clearcoat: 0.3 });
  const W2 = sideX * 2 + 4;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W2, 9), wall); back.position.set(0, 4.5, wallZ); g.add(back);
  const wain = new THREE.Mesh(rbox(W2, 1.2, 0.08, 0.02), panel); wain.position.set(0, 0.6, wallZ + 0.04); g.add(wain);
  const capRail = new THREE.Mesh(rbox(W2, 0.06, 0.14, 0.02), panel); capRail.position.set(0, 1.22, wallZ + 0.07); g.add(capRail);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), wall); side.rotation.y = -sx * Math.PI / 2; side.position.set(sx * sideX, 4.5, wallZ + 15); g.add(side);
    const sw = new THREE.Mesh(rbox(0.08, 1.2, 30, 0.02), panel); sw.position.set(sx * (sideX - 0.04), 0.6, wallZ + 15); g.add(sw);
  }
  // windows with the night city outside (emissive gradient + bokeh behind)
  const winC = makeCanvas(256, 512), wx = winC.getContext("2d"), wg = wx.createLinearGradient(0, 0, 0, 512);
  wg.addColorStop(0, "#0d1426"); wg.addColorStop(0.7, "#1f2a44"); wg.addColorStop(1, "#4a3a3a"); wx.fillStyle = wg; wx.fillRect(0, 0, 256, 512);
  const r = mulberry32(seed);
  for (let i = 0; i < 140; i++) { wx.fillStyle = `rgba(255,${180 + r() * 60},${100 + r() * 80},${0.25 + r() * 0.6})`; const s = 2 + r() * 5; wx.fillRect(r() * 256, 220 + r() * 280, s, s * 1.4); }
  const winTex = texFrom(winC);
  for (const x of [-4.6, -1.55, 1.55, 4.6]) {
    const fr = new THREE.Group(); fr.position.set(x, 2.95, wallZ + 0.02); g.add(fr);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), new THREE.MeshBasicMaterial({ map: winTex, toneMapped: false })); fr.add(pane);
    const fm = pmat("#2a1810", { roughness: 0.5, clearcoat: 0.4 });
    for (const [bw, bh, px, py] of [[1.66, 0.08, 0, 1.34], [1.66, 0.08, 0, -1.34], [0.08, 2.76, -0.79, 0], [0.08, 2.76, 0.79, 0], [0.05, 2.6, 0, 0], [1.5, 0.05, 0, 0.35]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.08, 0.01), fm); b.position.set(px, py, 0.04); fr.add(b); }
    const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffd59a", toneMapped: false })); sconce.position.set(x + (x < 0 ? 1.05 : -1.05), 2.2, wallZ + 0.16); g.add(sconce);
    const glow = sprite(BOKEH, 0.9); glow.material.color.set("#ffb060"); glow.material.opacity = 0.6; glow.material.blending = THREE.AdditiveBlending; glow.position.copy(sconce.position); glow.position.z += 0.05; g.add(glow);
  }
  // other set tables, empty, fading into the room
  if (tables) for (const [x, z] of [[-4.2, -3.4], [4.3, -3.2], [-5.6, -0.4], [5.6, 0.2], [0, -4.2]]) {
    const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 40), pmat("#f1ece2", { map: LINEN, roughness: 0.9 })); top.position.y = 0.76; t.add(top);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.3, 40, 1, true), pmat("#f1ece2", { map: LINEN, roughness: 0.9, side: THREE.DoubleSide })); skirt.position.y = 0.62; t.add(skirt);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.22, 0.47, 16), pmat("#2a1810", { roughness: 0.5 })); ped.position.y = 0.235; t.add(ped);
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), pmat("#f5efe2", { roughness: 0.7 })); candle.position.y = 0.83; t.add(candle);
    const flame = sprite(BOKEH, 0.22); flame.material.color.set("#ffb04a"); flame.material.blending = THREE.AdditiveBlending; flame.position.y = 0.93; t.add(flame);
    for (const a of [0.6, 2.2, 3.8, 5.3]) { const ch = makeChair({ fabric: "#4a1a1c" }); ch.group.position.set(Math.sin(a) * 0.85, 0, Math.cos(a) * 0.85); ch.group.rotation.y = a + Math.PI; t.add(ch.group); }
  }
  // pendant lamps over the main table
  const lamps = lampsX.map((x) => { const l = makePendantLamp({ drop: 0.9 }); l.position.set(x, lampY + 0.9, 0); g.add(l); return l; });
  const bokeh = makeBokeh({ n: 46, center: [0, 3.0, wallZ - 2], spread: [W2, 5, 2], size: [0.25, 0.9], opacity: 0.5, seed: seed + 40 });
  g.add(bokeh.group);
  asBackdrop(g);
  return { group: g, lamps, update: (t) => { bokeh.update(t); lamps.forEach((l, i) => { l.rotation.z = Math.sin(t * 0.7 + i) * 0.015; }); } };
}

// Night skyline of office towers with lit windows (backdrop), on a ring behind the subject.
// API: { group, update(t) }
function makeSkyline({ n = 26, z = -14, spread = 34, seed = 7, hMin = 3, hMax = 11 } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed);
  const c = makeCanvas(128, 256), x = c.getContext("2d"); x.fillStyle = "#11131a"; x.fillRect(0, 0, 128, 256);
  for (let yy = 8; yy < 256; yy += 14) for (let xx = 8; xx < 128; xx += 14) { const on = r() < 0.42; x.fillStyle = on ? `rgba(255,${190 + r() * 50},${110 + r() * 60},${0.5 + r() * 0.5})` : "rgba(60,70,90,0.35)"; x.fillRect(xx, yy, 8, 9); }
  const tex = texFrom(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  for (let i = 0; i < n; i++) {
    const w = 1.4 + r() * 2.2, h = hMin + r() * (hMax - hMin), d = 1.5 + r() * 2;
    const t2 = tex.clone(); t2.needsUpdate = true; t2.repeat.set(w / 1.6, h / 3.2);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [pmat("#151821", { roughness: 0.6 }), pmat("#151821", { roughness: 0.6 }), pmat("#151821"), pmat("#151821"), new THREE.MeshBasicMaterial({ map: t2, toneMapped: false, fog: true }), pmat("#151821")]);
    m.position.set((r() - 0.5) * spread, h / 2, z - r() * 8); g.add(m);
  }
  const bokeh = makeBokeh({ n: 40, center: [0, 4, z + 4], spread: [spread, 8, 4], size: [0.3, 1.1], colors: ["#ffcf8a", "#ff9a4a", "#9fc3ff", "#fff2dc"], opacity: 0.45, seed: seed + 9 });
  g.add(bokeh.group);
  asBackdrop(g);
  return { group: g, update: (t) => bokeh.update(t) };
}

// Crowd of people (instanced simplified figures: body + head) spreading to the horizon — a
// backdrop that fills the frame. API: { group, update(t) } — figures sway a little.
function makeCrowdField({ rows = 40, cols = 40, sx = 0.62, sz = 0.7, z0 = 0, seed = 13, skip = () => false, colors = ["#2b2f3a", "#4a3b33", "#6d4c3d", "#3d4a5a", "#7a6a5a", "#5b2a2a", "#c9b8a6"] } = {}) {
  const g = new THREE.Group(), r = mulberry32(seed), items = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const x = (col - cols / 2) * sx + (row % 2) * sx * 0.5 + (r() - 0.5) * 0.2, z = z0 - row * sz + (r() - 0.5) * 0.2;
    const h = 0.92 + r() * 0.16, c = colors[Math.floor(r() * colors.length)], ph = r() * 6.28;
    if (!skip(x, z)) items.push({ x, z, h, c, ph });
  }
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.16, 0.7, 6, 12), pmat("#ffffff", { roughness: 0.8 }), items.length);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 16, 12), pmat("#c8977a", { roughness: 0.6 }), items.length);
  const d = new THREE.Object3D(), col = new THREE.Color();
  function place(t) {
    items.forEach((it, i) => {
      const sway = Math.sin(t * 1.3 + it.ph) * 0.03;
      d.position.set(it.x + sway, 0.51 * it.h, it.z); d.scale.set(1, it.h, 1); d.rotation.set(0, 0, sway); d.updateMatrix(); body.setMatrixAt(i, d.matrix);
      d.position.set(it.x + sway * 2, 1.16 * it.h, it.z); d.scale.set(1, 1.1, 1); d.updateMatrix(); head.setMatrixAt(i, d.matrix);
    });
    body.instanceMatrix.needsUpdate = true; head.instanceMatrix.needsUpdate = true;
  }
  items.forEach((it, i) => body.setColorAt(i, col.set(it.c)));
  place(0); g.add(body, head); asBackdrop(g);
  return { group: g, update: place, items };
}
