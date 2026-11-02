// ============================================================================
// props/justice.js · police and court kit (first used in 2026-11-01-caso-cariani):
//   house front door, chemical drum, invoice (nota fiscal), medicine box (tarja preta), judge's gavel,
//   scales of justice, police car (generic, no crest), box truck, athlete mannequin, courtroom backdrop.
// Realistic finish (docs/visual.md): wood grain, brushed brass, HDPE plastic, paper, and the detail that
// says what each thing is (the bungs on the drum, the panelled door with a lever handle, the light bar).
// Only function declarations in this file: materials.js loads after it, so textures are made inside
// the builders, never at load time.
// ============================================================================

// Front door of a house set in a plaster wall: panelled wooden leaf on a hinge (it opens inwards into
// a dark hall), brass lever handle and lock, wooden frame, stone threshold, doormat, wall sconce and a
// small house number. Origin: floor at the centre of the doorway; front +z.
// API { group, leaf (hinge pivot), open(k), lamp (sconce glass material), w, h, wallW, wallH }
function makeHouseDoor({ w = 1.0, h = 2.15, wallW = 3.6, wallH = 3.1, wall = "#6e5d4f", wood = "#4a2c1a", number = "127" } = {}) {
  const g = new THREE.Group(), T = 0.24, F = 0.1;
  const plaster = mat("#ffffff", { map: tileTex(plasterTex(wall), 2.4, 2.4), roughness: 0.92 });
  const side = (wallW - w) / 2 - F;
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(side, wallH, T), plaster); p.position.set(s * (w / 2 + F + side / 2), wallH / 2, -T / 2); g.add(p); }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(w + 2 * F, wallH - h - F, T), plaster); lintel.position.set(0, h + F + (wallH - h - F) / 2, -T / 2); g.add(lintel);
  // a darker plinth band along the foot of the wall
  const band = mat("#3b302a", { roughness: 0.85 });
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(side, 0.28, 0.03), band); b.position.set(s * (w / 2 + F + side / 2), 0.14, 0.015); g.add(b); }
  // frame: two jambs and a head, proud of the wall
  const frameM = pmat("#ffffff", { map: woodTex("#3a2416"), roughness: 0.5, clearcoat: 0.3 });
  for (const s of [-1, 1]) { const j = new THREE.Mesh(rbox(F, h + F, T + 0.06, 0.015), frameM); j.position.set(s * (w / 2 + F / 2), (h + F) / 2, -T / 2 + 0.01); g.add(j); }
  const head = new THREE.Mesh(rbox(w + 2 * F + 0.08, F + 0.02, T + 0.08, 0.015), frameM); head.position.set(0, h + F / 2, -T / 2 + 0.02); g.add(head);
  // the dark hall behind the doorway (seen when the door opens)
  const hall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.3), mat("#0b0806", { roughness: 1, side: THREE.BackSide })); hall.position.set(0, h / 2, -T - 0.65); g.add(hall);
  // the leaf: hinge on the left, opens inwards (rotation.y > 0)
  const leaf = new THREE.Group(); leaf.position.set(-w / 2 + 0.005, 0, -0.035); g.add(leaf);
  const woodM = pmat("#ffffff", { map: woodTex(wood), roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const slab = new THREE.Mesh(rbox(w - 0.012, h - 0.008, 0.05, 0.008), woodM); slab.position.set(w / 2, h / 2, 0); leaf.add(slab);
  for (const [cy, ph] of [[h * 0.27, h * 0.36], [h * 0.71, h * 0.36]]) for (const cx of [w * 0.29, w * 0.71]) {
    const p = new THREE.Mesh(rbox(w * 0.32, ph, 0.02, 0.008), woodM); p.position.set(cx, cy, 0.028); leaf.add(p);
    const bead = new THREE.Mesh(rbox(w * 0.36, ph + 0.04, 0.008, 0.004), pmat("#2a1810", { roughness: 0.5 })); bead.position.set(cx, cy, 0.026); leaf.add(bead);
  }
  const brass = pmat("#c9a45a", { metalness: 1, roughness: 0.28 });
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24), brass); rose.rotation.x = Math.PI / 2; rose.position.set(w - 0.1, 1.0, 0.032); leaf.add(rose);
  const lever = new THREE.Mesh(rbox(0.13, 0.022, 0.022, 0.008), brass); lever.position.set(w - 0.15, 1.0, 0.055); leaf.add(lever);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 10), brass); neck.rotation.x = Math.PI / 2; neck.position.set(w - 0.1, 1.0, 0.045); leaf.add(neck);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 20), brass); lock.rotation.x = Math.PI / 2; lock.position.set(w - 0.1, 1.16, 0.032); leaf.add(lock);
  const kick = new THREE.Mesh(rbox(w - 0.06, 0.12, 0.006, 0.003), brass); kick.position.set(w / 2, 0.09, 0.029); leaf.add(kick);
  // threshold and doormat
  const sill = new THREE.Mesh(rbox(w + 0.3, 0.035, 0.34, 0.01), pmat("#8a837a", { roughness: 0.6 })); sill.position.set(0, 0.0175, 0.06); g.add(sill);
  const coir = mat("#ffffff", { map: tileTex(fabricTex("#6b4a2a"), 2, 2), roughness: 1 });
  const matt = new THREE.Mesh(rbox(0.86, 0.018, 0.52, 0.006), coir); matt.position.set(0, 0.009, 0.55); g.add(matt);
  // wall sconce (warm glass) and the house number under it
  const lampM = new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false });
  const back = new THREE.Mesh(rbox(0.14, 0.26, 0.04, 0.01), pmat("#1b1b1b", { metalness: 0.6, roughness: 0.4 })); back.position.set(w / 2 + 0.55, 2.05, 0.02); g.add(back);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 24), lampM); glass.position.set(w / 2 + 0.55, 2.05, 0.11); g.add(glass);
  const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.04, 24), pmat("#1b1b1b", { metalness: 0.6, roughness: 0.4 })); capT.position.set(w / 2 + 0.55, 2.17, 0.11); g.add(capT);
  const num = makePlate(number, 0.3, 0.14, { bg: "#141414", fg: "#e9dcc7", detail: true }); num.position.set(w / 2 + 0.55, 1.68, 0.016); g.add(num);
  const open = (k) => { leaf.rotation.y = 1.3 * clamp(k); };
  return { group: g, leaf, open, lamp: lampM, w, h, wallW, wallH };
}

// Wrap-around label texture for the drum: name, an orange hazard diamond and a UN number line.
function drumLabelTex(name, hazard = "INFLAMÁVEL") {
  const c = makeCanvas(640, 256), x = c.getContext("2d");
  x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, 640, 256);
  x.fillStyle = "#e0261b"; x.fillRect(0, 0, 640, 18); x.fillRect(0, 238, 640, 18);
  // hazard diamond (flame pictogram on orange)
  x.save(); x.translate(92, 128); x.rotate(Math.PI / 4); x.fillStyle = "#ff8a1f"; x.fillRect(-58, -58, 116, 116); x.strokeStyle = "#141414"; x.lineWidth = 6; x.strokeRect(-50, -50, 100, 100); x.restore();
  x.fillStyle = "#141414"; x.beginPath(); x.moveTo(92, 92); x.bezierCurveTo(70, 120, 76, 150, 92, 158); x.bezierCurveTo(108, 150, 114, 122, 98, 108); x.bezierCurveTo(100, 124, 92, 128, 92, 92); x.fill();
  let px = 104; x.font = `900 ${px}px Inter`; while (x.measureText(name).width > 430 && px > 30) { px -= 4; x.font = `900 ${px}px Inter`; }
  x.textAlign = "left"; x.textBaseline = "middle"; x.fillText(name, 176, 112);
  let hp = 34; x.font = `800 ${hp}px Inter`; while (x.measureText(hazard).width > 430 && hp > 16) { hp -= 2; x.font = `800 ${hp}px Inter`; }
  x.fillStyle = "#8a1a12"; x.fillText(hazard, 178, 188);
  const t = texFrom(c); t.userData.textFrac = px / 256; return t;
}
// 200-litre plastic chemical drum (HDPE, the blue of chemical drums): lathe body with two rolling hoops,
// a domed top with two screw bungs and a printed wrap-around label (name + hazard diamond).
// Origin: floor centre; the label faces +z. API { group, label, r, h }
function makeChemDrum(name = "ACETONA", { r = 0.29, h = 0.9, color = "#1d5ea8", hazard = "INFLAMÁVEL" } = {}) {
  const g = new THREE.Group();
  const plastic = pmat(color, { roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const hoop = (y) => [[r, y - 0.025], [r + 0.014, y - 0.008], [r + 0.014, y + 0.008], [r, y + 0.025]];
  const pts = [[0, 0], [r - 0.035, 0], [r - 0.004, 0.02], [r, 0.05], ...hoop(h * 0.3), ...hoop(h * 0.68), [r, h - 0.05], [r - 0.012, h - 0.018], [r - 0.05, h - 0.004], [0, h]];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 56), plastic); g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.03, 0.012, 8, 48), plastic); rim.rotation.x = Math.PI / 2; rim.position.y = h - 0.004; g.add(rim);
  for (const [bx, br] of [[r * 0.52, 0.045], [-r * 0.55, 0.032]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(br, br, 0.03, 24), plastic); b.position.set(bx, h + 0.012, 0); g.add(b);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(br * 0.8, br * 0.8, 0.012, 6), pmat("#e9e4dc", { roughness: 0.5 })); cap.position.set(bx, h + 0.033, 0); g.add(cap);
  }
  const tex = drumLabelTex(name, hazard), lh = h * 0.34, th = 1.25;
  const lbl = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.004, r + 0.004, lh, 40, 1, true, -th / 2, th), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }));
  lbl.position.y = h * 0.49; g.add(lbl);
  lbl.userData.plate = { text: name, w: 2 * r * Math.sin(th / 2), h: lh, depth: 0, frac: tex.userData.textFrac, detail: false };
  g.add(contactShadow(r * 3.2, r * 3.2));
  return { group: g, label: lbl, r, h };
}

// Laboratory reagent bottle (2.5 L amber glass): shoulders, neck, a white screw cap, and the same printed
// label as the drums (name + hazard diamond). Origin: floor centre; the label faces +z. API { group, label, h }
function makeReagentBottle(name = "ACETONA", { r = 0.085, h = 0.36, hazard = "INFLAMÁVEL" } = {}) {
  const g = new THREE.Group();
  const amber = pmat("#6a3410", { roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 });
  const pts = [[0, 0], [r - 0.012, 0], [r, 0.012], [r, h * 0.66], [r * 0.9, h * 0.74], [r * 0.48, h * 0.82], [r * 0.34, h * 0.86], [r * 0.34, h * 0.9], [0, h * 0.9]];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 48), amber); g.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, h * 0.1, 32), pmat("#efece6", { roughness: 0.45 })); cap.position.y = h * 0.95; g.add(cap);
  for (let i = 0; i < 3; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(r * 0.4, 0.002, 6, 32), pmat("#d9d5ce", { roughness: 0.5 })); rib.rotation.x = Math.PI / 2; rib.position.y = h * (0.915 + i * 0.025); g.add(rib); }
  const tex = drumLabelTex(name, hazard), lh = h * 0.44, th = 1.9;
  const lbl = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.002, r + 0.002, lh, 40, 1, true, -th / 2, th), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
  lbl.position.y = h * 0.36; g.add(lbl);
  lbl.userData.plate = { text: name, w: 2 * r * Math.sin(th / 2), h: lh, depth: 0, frac: tex.userData.textFrac, detail: false };
  g.add(contactShadow(r * 4, r * 4));
  return { group: g, label: lbl, h };
}

// Invoice (nota fiscal, DANFE layout) lying flat: paper with header boxes, a barcode, an items table and
// printed plates for the title, the issuer and the buyer (readable on screen). Origin: centre of the
// underside; the face is +y and the top edge is towards -z. API { group, top, w, d, plates }
function makeInvoiceSheet({ w = 0.62, d = 0.86, issuer = "EMITENTE: ANIDROL", to = "PARA: FARMACÊUTICA", title = "NOTA FISCAL", paper = "#f6f3ec" } = {}) {
  const g = new THREE.Group(), T = 0.004, H = Math.round(512 * d / w);
  const c = makeCanvas(512, H), x = c.getContext("2d"), r = mulberry32(H);
  x.fillStyle = paper; x.fillRect(0, 0, 512, H);
  x.strokeStyle = "#3a3a3a"; x.lineWidth = 2;
  x.strokeRect(14, 14, 484, H - 28);
  for (const y of [H * 0.2, H * 0.36, H * 0.5, H * 0.86]) { x.beginPath(); x.moveTo(14, y); x.lineTo(498, y); x.stroke(); }
  x.fillStyle = "#141414"; for (let i = 0, xx = 300; xx < 480; i++) { const bw = 1 + Math.floor(r() * 4); x.fillRect(xx, H * 0.39, bw, H * 0.08); xx += bw + 1 + Math.floor(r() * 3); }
  x.fillStyle = "rgba(40,40,40,0.85)"; for (let y = H * 0.57; y < H * 0.83; y += 46) { x.fillRect(30, y, 140 + ((y * 13) % 70), 8); x.fillRect(286, y, 60, 8); x.fillRect(404, y, 72, 8); }
  x.strokeStyle = "rgba(60,60,60,0.5)"; x.lineWidth = 1; for (const cx of [270, 390]) { x.beginPath(); x.moveTo(cx, H * 0.5); x.lineTo(cx, H * 0.86); x.stroke(); }
  x.fillStyle = "rgba(40,40,40,0.85)"; x.fillRect(28, H * 0.39, 230, 9); x.fillRect(28, H * 0.44, 180, 9);
  x.fillStyle = "rgba(20,20,20,0.75)"; x.fillRect(300, H * 0.89, 180, 10);
  const tex = texFrom(c), pm = pmat(paper, { roughness: 0.92 }), face = pmat("#ffffff", { map: tex, roughness: 0.9 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [pm, pm, face, pm, pm, pm]); sheet.position.y = T / 2; g.add(sheet);
  const plates = {};
  const put = (key, text, pw, ph, z, o = {}) => { const p = makePlate(text, pw, ph, { bg: paper, fg: "#1c1410", depth: 0.002, ...o }); p.rotation.x = -Math.PI / 2; p.position.set(0, T + 0.001, z); g.add(p); plates[key] = p; return p; };
  put("title", title, w * 0.84, d * 0.1, -d * 0.4);
  put("issuer", issuer, w * 0.9, d * 0.075, -d * 0.255, { fg: "#8a1a12" });
  if (to) put("to", to, w * 0.9, d * 0.075, -d * 0.1);
  g.add(contactShadow(w + 0.2, d + 0.2));
  return { group: g, top: T, w, d, plates };
}

// Medicine carton with the black prescription stripe ("tarja preta"): white board, a generic name, the
// black band across the front and a coloured edge. No real brand. Origin: floor centre; front +z.
// API { group, w, h, d }
function makeMedicineBox({ w = 0.62, h = 0.36, d = 0.22, name = "COMPRIMIDOS" } = {}) {
  const g = new THREE.Group();
  const board = pmat("#f4f2ee", { roughness: 0.55, clearcoat: 0.25 });
  const box = new THREE.Mesh(rbox(w, h, d, 0.012), board); box.position.y = h / 2; g.add(box);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.002, h * 0.06, d + 0.002), pmat("#2f6fb0", { roughness: 0.5 })); edge.position.y = h * 0.93; g.add(edge);
  const nm = makePlate(name, w * 0.8, h * 0.2, { bg: "#f4f2ee", fg: "#1f3550", depth: 0.002, detail: true }); nm.position.set(0, h * 0.7, d / 2 + 0.001); g.add(nm);
  const stripe = makePlate("TARJA PRETA", w + 0.004, h * 0.36, { bg: "#0d0d0d", fg: "#ffffff", depth: 0.004 }); stripe.position.set(0, h * 0.26, d / 2 + 0.0004); g.add(stripe);
  g.add(contactShadow(w * 1.6, d * 2.4));
  return { group: g, w, h, d };
}

// Judge's gavel and its round sound block: turned hardwood head with brass bands and a slim handle,
// hung from a pivot at the handle's end so a scene can swing it down onto the block.
// Origin: floor (bottom of the block). API { group, pivot, block, strike(k) } — 0 raised, 1 head on the block.
function makeJudgeGavel({ s = 1 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2 });
  const brass = pmat("#c9a45a", { metalness: 1, roughness: 0.26 });
  const BH = 0.08 * s, BR = 0.3 * s;
  const block = new THREE.Mesh(new THREE.CylinderGeometry(BR, BR * 1.04, BH, 56), wood); block.position.y = BH / 2; g.add(block);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(BR * 0.98, 0.006 * s, 8, 56), brass); ring.rotation.x = Math.PI / 2; ring.position.y = BH * 0.82; g.add(ring);
  const HR = 0.075 * s, HL = 0.32 * s, L = 0.62 * s;
  const pivot = new THREE.Group(); pivot.position.set(L, 0.026 * s, 0); g.add(pivot);
  const lift = BH + HR - 0.026 * s, LL = Math.hypot(L, lift), arm = new THREE.Group(); arm.rotation.z = -Math.atan2(lift, L); pivot.add(arm);
  const headProf = [[0, -HL / 2], [HR * 0.9, -HL / 2], [HR, -HL / 2 + 0.02 * s], [HR, -HL * 0.18], [HR * 0.86, -HL * 0.12], [HR * 0.86, HL * 0.12], [HR, HL * 0.18], [HR, HL / 2 - 0.02 * s], [HR * 0.9, HL / 2], [0, HL / 2]];
  const head = new THREE.Mesh(new THREE.LatheGeometry(headProf.map(([a, b]) => new THREE.Vector2(a, b)), 40), wood); head.rotation.x = Math.PI / 2; head.position.x = -LL; arm.add(head);
  for (const z of [-HL * 0.3, HL * 0.3]) { const b = new THREE.Mesh(new THREE.TorusGeometry(HR * 1.0, 0.007 * s, 8, 40), brass); b.position.set(-LL, 0, z); arm.add(b); }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * s, 0.026 * s, LL - HR, 20), wood); handle.rotation.z = Math.PI / 2; handle.position.x = -(LL - HR) / 2; arm.add(handle);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.026 * s, 16, 12), wood); arm.add(knob);
  g.add(contactShadow(BR * 3, BR * 3));
  const strike = (k) => { pivot.rotation.z = lerp(-0.95, 0, clamp(k)); };
  strike(1);
  return { group: g, pivot, block, strike };
}

// Scales of justice: brass column on a turned wooden base, a beam with a pointer, three chains to each
// pan, shallow brass pans. Whatever sits in holders[i] stays level as the beam tilts.
// Origin: floor centre; pans to the left (holders[0]) and right (holders[1]).
// API { group, beam, holders, hangs, setTilt(a), arm, height, chain, panR }
function makeJusticeScale({ arm = 1.0, height = 1.9, panR = 0.42, chain = 0.8 } = {}) {
  const g = new THREE.Group();
  const brass = pmat("#d0a54e", { metalness: 1, roughness: 0.24 }), dark = pmat("#ffffff", { map: woodTex("#3a2214"), roughness: 0.35, clearcoat: 0.7 });
  const baseProf = [[0, 0], [0.42, 0], [0.44, 0.03], [0.42, 0.07], [0.34, 0.09], [0.3, 0.14], [0.2, 0.17], [0, 0.17]];
  const base = new THREE.Mesh(new THREE.LatheGeometry(baseProf.map(([a, b]) => new THREE.Vector2(a, b)), 56), dark); g.add(base);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, height - 0.17, 24), brass); col.position.y = 0.17 + (height - 0.17) / 2; g.add(col);
  for (const y of [0.22, height * 0.5, height - 0.1]) { const k = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 10, 28), brass); k.rotation.x = Math.PI / 2; k.position.y = y; g.add(k); }
  const fin = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), brass); fin.position.y = height + 0.08; g.add(fin);
  const beam = new THREE.Group(); beam.position.y = height; g.add(beam);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 2 * arm, 16), brass); bar.rotation.z = Math.PI / 2; beam.add(bar);
  for (const s of [-1, 1]) { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 10), brass); tip.position.x = s * arm; beam.add(tip); }
  const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.32, 10), brass); pointer.position.y = -0.2; pointer.rotation.z = Math.PI; beam.add(pointer);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 24), brass); hub.rotation.x = Math.PI / 2; beam.add(hub);
  const panProf = [[0, 0], [panR * 0.6, 0.006], [panR * 0.92, 0.04], [panR, 0.075], [panR - 0.012, 0.08], [panR * 0.9, 0.05], [panR * 0.58, 0.018], [0, 0.014]];
  const holders = [], hangs = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = s * arm; beam.add(hang); hangs.push(hang);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 20), brass); hook.position.y = -0.03; hang.add(hook);
    for (let i = 0; i < 3; i++) {
      const a = i * 2 * Math.PI / 3 + Math.PI / 6, p = new V3(Math.cos(a) * panR * 0.96, -chain, Math.sin(a) * panR * 0.96);
      const len = p.length(), ch = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, len, 6), brass);
      ch.position.copy(p).multiplyScalar(0.5); ch.quaternion.setFromUnitVectors(new V3(0, 1, 0), p.clone().normalize()); hang.add(ch);
    }
    const pan = new THREE.Mesh(new THREE.LatheGeometry(panProf.map(([a, b]) => new THREE.Vector2(a, b)), 56), brass); pan.position.y = -chain; hang.add(pan);
    const holder = new THREE.Group(); holder.position.y = -chain + 0.014; hang.add(holder); holders.push(holder);
    const front = new THREE.Group(); front.position.set(0, -chain + 0.04, panR + 0.012); hang.add(front); hang.userData.front = front;
  }
  g.add(contactShadow(1.2, 1.2));
  const setTilt = (a) => { beam.rotation.z = a; hangs.forEach((h) => { h.rotation.z = -a; }); };
  return { group: g, beam, holders, fronts: hangs.map((h) => h.userData.front), hangs, setTilt, arm, height, chain, panR };
}

// Generic police car (no crest, no real livery): black sedan body, glass cabin, alloy wheels, a light
// bar on the roof (red and blue), white band and "POLÍCIA FEDERAL" printed on both sides.
// Length along x, front +x. Origin: floor centre. API { group, flash(t), L, W }
function makePoliceCar({ label = "POLÍCIA FEDERAL" } = {}) {
  const g = new THREE.Group(), L = 4.5, W = 1.82;
  const paint = pmat("#14161a", { metalness: 0.5, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glassM = pmat("#0d1218", { metalness: 0.2, roughness: 0.05, clearcoat: 1 });
  const lower = new THREE.Mesh(rbox(L, 0.54, W, 0.16), paint); lower.position.y = 0.6; g.add(lower);
  const hood = new THREE.Mesh(rbox(1.25, 0.16, W - 0.08, 0.07), paint); hood.position.set(L / 2 - 0.68, 0.94, 0); hood.rotation.z = -0.07; g.add(hood);
  const cabin = new THREE.Mesh(rbox(2.25, 0.44, W - 0.2, 0.18), glassM); cabin.position.set(-0.25, 1.08, 0); g.add(cabin);
  const roof = new THREE.Mesh(rbox(1.7, 0.08, W - 0.26, 0.04), paint); roof.position.set(-0.3, 1.31, 0); g.add(roof);
  for (const x of [0.62, -0.3, -1.22]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, W - 0.18), paint); p.position.set(x, 1.08, 0); g.add(p); }
  const white = pmat("#eceae5", { roughness: 0.4, clearcoat: 0.6 });
  for (const s of [-1, 1]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(L - 0.5, 0.2, 0.01), white); stripe.position.set(-0.05, 0.62, s * (W / 2 + 0.002)); g.add(stripe);
    const plate = makePlate(label, 1.9, 0.17, { bg: "#eceae5", fg: "#141414", depth: 0.006 }); plate.position.set(-0.15, 0.62, s * (W / 2 + 0.006)); if (s < 0) plate.rotation.y = Math.PI; g.add(plate);
  }
  const tyre = mat("#141414", { roughness: 0.85 }), alloy = pmat("#b9bcc2", { metalness: 1, roughness: 0.3 });
  for (const x of [1.42, -1.42]) for (const s of [-1, 1]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32), tyre); t.rotation.x = Math.PI / 2; t.position.set(x, 0.34, s * (W / 2 - 0.08)); g.add(t);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.02, 24), alloy); r.rotation.x = Math.PI / 2; r.position.set(x, 0.34, s * (W / 2 + 0.045)); g.add(r);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24, Math.PI), paint); arch.position.set(x, 0.38, s * (W / 2 + 0.01)); g.add(arch);
  }
  const headM = new THREE.MeshBasicMaterial({ color: "#fff6e0", toneMapped: false }), tailM = new THREE.MeshBasicMaterial({ color: "#c0150f", toneMapped: false });
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(rbox(0.04, 0.12, 0.34, 0.02), headM); hl.position.set(L / 2 + 0.005, 0.74, s * 0.6); g.add(hl);
    const tl = new THREE.Mesh(rbox(0.04, 0.12, 0.3, 0.02), tailM); tl.position.set(-L / 2 - 0.005, 0.76, s * 0.62); g.add(tl);
  }
  const grille = new THREE.Mesh(rbox(0.03, 0.14, 0.7, 0.02), pmat("#08090a", { metalness: 0.6, roughness: 0.4 })); grille.position.set(L / 2 + 0.004, 0.66, 0); g.add(grille);
  const bumper = new THREE.Mesh(rbox(0.12, 0.16, W - 0.04, 0.05), pmat("#0a0b0c", { roughness: 0.6 })); bumper.position.set(L / 2 - 0.02, 0.42, 0); g.add(bumper);
  // light bar: red half, blue half, under a clear dome
  const bar = new THREE.Group(); bar.position.set(-0.25, 1.4, 0); g.add(bar);
  const baseBar = new THREE.Mesh(rbox(0.32, 0.05, 1.2, 0.02), pmat("#1b1b1b", { roughness: 0.4 })); bar.add(baseBar);
  const red = new THREE.MeshBasicMaterial({ color: "#ff2a1a", toneMapped: false }), blue = new THREE.MeshBasicMaterial({ color: "#2a6bff", toneMapped: false });
  const rl = new THREE.Mesh(rbox(0.26, 0.09, 0.52, 0.03), red); rl.position.set(0, 0.07, 0.3); bar.add(rl);
  const bl = new THREE.Mesh(rbox(0.26, 0.09, 0.52, 0.03), blue); bl.position.set(0, 0.07, -0.3); bar.add(bl);
  g.add(contactShadow(L + 0.8, W + 0.8));
  const R0 = new THREE.Color("#ff2a1a"), B0 = new THREE.Color("#2a6bff");
  const flash = (t) => { const a = 0.5 + 0.5 * Math.sin(t * 14), b = 0.5 + 0.5 * Math.sin(t * 14 + Math.PI); red.color.copy(R0).multiplyScalar(0.25 + 0.75 * a); blue.color.copy(B0).multiplyScalar(0.25 + 0.75 * b); return { red: a, blue: b }; };
  return { group: g, flash, L, W };
}

// Box truck: cab with windscreen, grille and headlights, chassis, a box body with a roll-up rear door
// (open(k)), dual rear wheels. Length along x, front +x. Origin: floor centre.
// API { group, open(k), cargo: { x0, x1, y, w } } — the box floor, for loading drums.
function makeCargoTruck({ body = "#e7e3dc", cab = "#2f3e52" } = {}) {
  const g = new THREE.Group();
  const cabM = pmat(cab, { metalness: 0.4, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
  const glassM = pmat("#0e141b", { roughness: 0.05, clearcoat: 1 });
  const c1 = new THREE.Mesh(rbox(1.3, 1.5, 2.1, 0.14), cabM); c1.position.set(2.05, 1.2, 0); g.add(c1);
  const ws = new THREE.Mesh(rbox(0.05, 0.62, 1.8, 0.03), glassM); ws.position.set(2.7, 1.55, 0); ws.rotation.z = -0.1; g.add(ws);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(rbox(0.6, 0.5, 0.03, 0.03), glassM); sw.position.set(2.1, 1.6, s * 1.05); g.add(sw); }
  const grille = new THREE.Mesh(rbox(0.04, 0.4, 1.3, 0.02), pmat("#141516", { metalness: 0.7, roughness: 0.35 })); grille.position.set(2.71, 0.85, 0); g.add(grille);
  const headM = new THREE.MeshBasicMaterial({ color: "#fff3d6", toneMapped: false });
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(rbox(0.04, 0.16, 0.3, 0.03), headM); hl.position.set(2.715, 0.82, s * 0.8); g.add(hl); }
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 1.2), pmat("#202224", { metalness: 0.5, roughness: 0.5 })); chassis.position.set(0.1, 0.5, 0); g.add(chassis);
  // box body: walls around an open rear end, ribbed sides
  const BX0 = -2.75, BX1 = 1.3, BY = 0.62, BH = 2.1, BW = 2.2, len = BX1 - BX0;
  const bm = pmat(body, { roughness: 0.5, clearcoat: 0.4 });
  const fl = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, BW), pmat("#3a3632", { roughness: 0.8 })); fl.position.set((BX0 + BX1) / 2, BY + 0.03, 0); g.add(fl);
  const roofB = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, BW), bm); roofB.position.set((BX0 + BX1) / 2, BY + BH, 0); g.add(roofB);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(len, BH, 0.05), bm); w.position.set((BX0 + BX1) / 2, BY + BH / 2, s * (BW / 2)); g.add(w);
    for (let x = BX0 + 0.3; x < BX1; x += 0.45) { const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, BH - 0.1, 0.02), bm); rib.position.set(x, BY + BH / 2, s * (BW / 2 + 0.03)); g.add(rib); } }
  const front = new THREE.Mesh(new THREE.BoxGeometry(0.06, BH, BW), bm); front.position.set(BX1, BY + BH / 2, 0); g.add(front);
  const inside = new THREE.Mesh(new THREE.BoxGeometry(len - 0.1, BH - 0.1, BW - 0.1), mat("#2a2622", { roughness: 0.9, side: THREE.BackSide })); inside.position.set((BX0 + BX1) / 2 + 0.05, BY + BH / 2, 0); g.add(inside);
  // roll-up door: slats that slide up into the roof
  const doorG = new THREE.Group(); doorG.position.set(BX0, BY, 0); g.add(doorG);
  const slats = [], n = 10, sh = BH / n;
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(rbox(0.05, sh * 0.94, BW - 0.04, 0.012), pmat(i % 2 ? "#d9d4cc" : "#cfcac2", { roughness: 0.45, metalness: 0.3 })); s.userData.y = sh * (i + 0.5); doorG.add(s); slats.push(s); }
  const tyre = mat("#141414", { roughness: 0.85 }), hub = pmat("#9a9da3", { metalness: 1, roughness: 0.35 });
  for (const x of [2.0, -1.4, -2.0]) for (const s of [-1, 1]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.32, 32), tyre); t.rotation.x = Math.PI / 2; t.position.set(x, 0.42, s * 0.88); g.add(t);
    const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), hub); hb.rotation.x = Math.PI / 2; hb.position.set(x, 0.42, s * 1.05); g.add(hb);
  }
  const tailM = new THREE.MeshBasicMaterial({ color: "#c0150f", toneMapped: false });
  for (const s of [-1, 1]) { const tl = new THREE.Mesh(rbox(0.04, 0.2, 0.12, 0.02), tailM); tl.position.set(BX0 - 0.03, BY + 0.2, s * 0.95); g.add(tl); }
  g.add(contactShadow(6.4, 3));
  const open = (k) => { const off = clamp(k) * BH; for (const s of slats) { const y = s.userData.y + off; s.position.set(0, y, 0); s.visible = y <= BH - sh * 0.5 + 1e-4; } };
  open(0);
  return { group: g, open, cargo: { x0: BX0 + 0.1, x1: BX1 - 0.1, y: BY + 0.06, w: BW - 0.2 } };
}

// Athlete mannequin: faceless (a smooth head with short hair, no likeness of anyone), heavy gym build —
// wide shoulders, big arms, a V-taper — in a tank top, shorts and trainers. A 1.8 m person.
// Origin: floor between the feet; faces +z. API { group, setPose({ flex, turn, look }), parts }
//   flex 0..1: double-biceps pose (upper arms out level, forearms up); turn: yaw; look: head pitch.
function makeAthleteFigure({ top = "#24406a", shorts = "#3a3d44", skin = "#b98a6e", hair = "#2a1d16", shoes = "#e9e6e0" } = {}) {
  const g = new THREE.Group();
  const skm = pmat(skin, { roughness: 0.5, sheen: 0.3, sheenColor: new THREE.Color("#ffd2b8") });
  const topM = pmat(top, { roughness: 0.8, sheen: 0.4, sheenColor: new THREE.Color("#6a6e78"), map: tileTex(fabricTex(top), 2, 2) });
  const shortM = pmat(shorts, { roughness: 0.85, map: tileTex(fabricTex(shorts), 2, 2) });
  const hm = pmat(hair, { roughness: 0.9 }), shoeM = pmat(shoes, { roughness: 0.45, clearcoat: 0.4 }), soleM = mat("#2a2a2a", { roughness: 0.7 });
  const cap = (r, l, m, seg = 18) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, seg), m);
  const THIGH = 0.45, SHIN = 0.44, LEG = THIGH + SHIN + 0.06;
  const pelvis = new THREE.Group(); pelvis.position.y = LEG; g.add(pelvis);
  const hips = cap(0.15, 0.16, shortM); hips.rotation.z = Math.PI / 2; hips.scale.set(1, 1, 0.82); pelvis.add(hips);
  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(sx * 0.11, -0.02, 0); pelvis.add(hip);
    const th = cap(0.122, THIGH - 0.16, skm); th.position.y = -THIGH / 2; th.scale.set(1, 1, 1.05); hip.add(th);
    const leg = cap(0.132, 0.14, shortM); leg.position.y = -0.1; hip.add(leg);
    const kn = new THREE.Group(); kn.position.y = -THIGH; hip.add(kn);
    const calf = cap(0.082, SHIN - 0.14, skm); calf.position.y = -SHIN / 2; kn.add(calf);
    const calfB = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), skm); calfB.scale.set(0.95, 1.4, 0.9); calfB.position.set(0, -SHIN * 0.32, -0.025); kn.add(calfB);
    const shoe = new THREE.Mesh(rbox(0.11, 0.08, 0.28, 0.035), shoeM); shoe.position.set(0, -SHIN - 0.025, 0.06); kn.add(shoe);
    const sole = new THREE.Mesh(rbox(0.115, 0.025, 0.29, 0.01), soleM); sole.position.set(0, -SHIN - 0.06, 0.06); kn.add(sole);
    legs.push({ hip, kn });
  }
  const torso = new THREE.Group(); torso.position.y = 0.06; pelvis.add(torso);
  const abs = cap(0.15, 0.14, topM, 22); abs.scale.set(1.15, 1, 0.8); abs.position.y = 0.14; torso.add(abs);
  const chest = cap(0.19, 0.2, topM, 24); chest.scale.set(1.45, 1, 0.8); chest.position.y = 0.4; torso.add(chest);
  for (const sx of [-1, 1]) { const lat = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), topM); lat.scale.set(0.9, 1.6, 0.9); lat.position.set(sx * 0.2, 0.33, -0.02); torso.add(lat); }
  const traps = cap(0.07, 0.22, skm); traps.rotation.z = Math.PI / 2; traps.position.y = 0.6; traps.scale.set(1, 1, 0.8); torso.add(traps);
  for (const sx of [-1, 1]) { const strap = new THREE.Mesh(rbox(0.07, 0.08, 0.2, 0.02), topM); strap.position.set(sx * 0.13, 0.6, 0); torso.add(strap); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.075, 0.14, 18), skm); neck.position.y = 0.66; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.83; head.scale.setScalar(1.12); torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), skm); skull.scale.set(0.9, 1.16, 1.0); head.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), skm); jaw.position.set(0, -0.06, 0.02); jaw.scale.set(1.05, 0.8, 1); head.add(jaw);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), hm); hairCap.scale.set(0.9 * 1.07, 1.16 * 1.07, 1.07); hairCap.position.y = 0.008; hairCap.rotation.x = -0.35; head.add(hairCap);
  const arms = [];
  for (const sx of [-1, 1]) {
    const delt = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), skm); delt.scale.set(1.0, 0.92, 1.05); delt.position.set(sx * 0.3, 0.55, 0); torso.add(delt);
    const sh = new THREE.Group(); sh.position.set(sx * 0.31, 0.53, 0); torso.add(sh);
    const up = cap(0.086, 0.2, skm); up.position.y = -0.17; sh.add(up);
    const bi = new THREE.Mesh(new THREE.SphereGeometry(0.084, 18, 14), skm); bi.scale.set(1, 1.35, 1); bi.position.set(0, -0.16, 0.035); sh.add(bi);
    const el = new THREE.Group(); el.position.y = -0.32; sh.add(el);
    const fo = cap(0.072, 0.2, skm); fo.position.y = -0.14; el.add(fo);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), skm); hand.scale.set(0.85, 1.2, 0.7); hand.position.y = -0.3; el.add(hand);
    arms.push({ sh, el, sx });
  }
  g.add(contactShadow(1.0, 1.0));
  function setPose({ flex = 0, turn = 0, look = 0 } = {}) {
    g.rotation.y = turn; head.rotation.x = look;
    for (const A of arms) {
      A.sh.rotation.set(0, 0, A.sx * lerp(0.2, 1.5, flex));
      A.el.rotation.set(lerp(-0.12, 0, flex), 0, A.sx * lerp(0.08, 1.75, flex));
    }
    for (const L of legs) { L.hip.rotation.set(0, 0, 0); L.kn.rotation.set(0, 0, 0); }
  }
  setPose({});
  return { group: g, setPose, parts: { pelvis, torso, head, arms, legs } };
}

// Courtroom behind the subject: wood-panelled back wall with pilasters, the judges' bench on a dais
// (three high-backed chairs), two tall windows of daylight with beams and dust, brass globe lamps on
// long rods, a dark coffered ceiling and a polished floor with a red runner towards the camera.
// All backdrop: never framed, never checked. API { group, update(t), lights(k) }
function makeCourtroomSet({ wallZ = -4, ceil = 7.5, clear = 7, seed = 5 } = {}) {
  const g = new THREE.Group(), W = 40, depth = 30, zc = wallZ + depth / 2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat("#ffffff", { map: tileTex(woodTex({ base: "#3a2416", planks: 8, w: 512, h: 512 }), W / 4, depth / 4), roughness: 0.32, envMapIntensity: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.003, zc); g.add(floor);
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, depth), mat("#ffffff", { map: tileTex(fabricTex("#6b1a1a"), 2, 14), roughness: 0.95 })); runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.006, zc); g.add(runner);
  const panelTex = tileTex(woodTex({ base: "#4a2c1a", planks: 1, w: 512, h: 1024, seed }), W / 1.6, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(W, ceil), mat("#ffffff", { map: panelTex, roughness: 0.55 })); wall.position.set(0, ceil / 2, wallZ); g.add(wall);
  const trim = pmat("#2a1810", { roughness: 0.45, clearcoat: 0.4 });
  for (let x = -W / 2 + 0.8; x < W / 2; x += 1.6) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, ceil, 0.12), trim); p.position.set(x, ceil / 2, wallZ + 0.06); g.add(p); }
  for (const y of [1.0, 4.6, ceil - 0.3]) { const r = new THREE.Mesh(new THREE.BoxGeometry(W, 0.14, 0.16), trim); r.position.set(0, y, wallZ + 0.08); g.add(r); }
  // the bench: a dais, a panelled front, three high-backed chairs behind it
  const benchW = Math.min(clear + 1, 7.5), dais = new THREE.Mesh(rbox(benchW + 1, 0.45, 2.2, 0.03), trim); dais.position.set(0, 0.225, wallZ + 1.1); g.add(dais);
  const front = new THREE.Mesh(rbox(benchW, 1.15, 0.5, 0.04), mat("#ffffff", { map: tileTex(woodTex("#5a3520"), 3, 1), roughness: 0.4 })); front.position.set(0, 0.45 + 0.575, wallZ + 1.9); g.add(front);
  const topB = new THREE.Mesh(rbox(benchW + 0.2, 0.08, 0.7, 0.03), trim); topB.position.set(0, 1.64, wallZ + 1.85); g.add(topB);
  const leather = pmat("#5a1515", { roughness: 0.5, clearcoat: 0.5 });
  for (const x of [-1.6, 0, 1.6]) { const b = new THREE.Mesh(rbox(0.8, x === 0 ? 2.0 : 1.7, 0.14, 0.06), leather); b.position.set(x, 0.45 + (x === 0 ? 1.0 : 0.85), wallZ + 0.7); g.add(b); }
  // windows of daylight, beams and dust
  const lights = [], beams = [];
  for (const s of [-1, 1]) {
    const wn = makeGlowWindow(1.7, 3.6, { cols: 3, rows: 5, color: "#ffe2b0", frame: "#1c130d", arch: true }); wn.group.position.set(s * (clear / 2 + 1.6), 3.9, wallZ + 0.02); g.add(wn.group); lights.push({ m: wn.mat, base: new THREE.Color("#ffe2b0") });
    const bm = makeLightShaft([s * (clear / 2 + 1.6), 3.6, wallZ + 0.1], [s * (clear / 2 + 0.6), 0.05, wallZ + 5.5], { w0: 1.6, w1: 2.8, color: "#ffe2b0", opacity: 0.1 }); g.add(bm.group); beams.push(bm);
  }
  // coffered ceiling with globe lamps on rods, rows towards the camera
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat("#1c130d", { roughness: 0.9 })); cl.rotation.x = Math.PI / 2; cl.position.set(0, ceil, zc); g.add(cl);
  for (let z = wallZ + 1.5; z < wallZ + depth - 2; z += 2.6) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, 0.22), trim); b.position.set(0, ceil - 0.15, z); g.add(b); }
  const globeM = new THREE.MeshBasicMaterial({ color: "#ffe6bf", toneMapped: false }); lights.push({ m: globeM, base: new THREE.Color("#ffe6bf") });
  const brass = pmat("#c9a45a", { metalness: 1, roughness: 0.3 });
  for (let z = wallZ + 2.2; z < wallZ + depth - 3; z += 3.4) for (const x of [-3.2, 3.2]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8), brass); rod.position.set(x, ceil - 0.8, z); g.add(rod);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), globeM); gl.position.set(x, ceil - 1.75, z); g.add(gl);
    const pool = makeFloorGlow(3, 2.4, { color: "#ffd9a8", opacity: 0.08 }); pool.position.set(x, 0.008, z); g.add(pool);
  }
  const motes = makeSetMotes(160, [[-clear / 2 - 2.5, 0.3, wallZ + 0.4], [clear / 2 + 2.5, 5, wallZ + 6]], { color: "#ffe9c8", seed: seed + 3 }); g.add(motes.points);
  asBackdrop(g);
  let lk = 1;
  const apply = (t) => { lights.forEach(({ m, base }) => m.color.copy(base).multiplyScalar(lk)); beams.forEach((b, i) => b.set(lk * (0.85 + 0.15 * Math.sin(t * 0.6 + i * 2)))); };
  return { group: g, update(t) { motes.update(t); apply(t); }, lights(k) { lk = k; } };
}
