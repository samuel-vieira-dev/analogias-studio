// ============================================================================
// props/devices.js · phone, finger, phone crowd, bedside table + lamp
// ============================================================================

// Phone with a live canvas screen (720x1500). Draw on `ctx`, then set `tex.needsUpdate = true`.
// Local frame: screen faces +z, height 1.64, width 0.8.
function makePhone() {
  const group = new THREE.Group();
  const canvas = makeCanvas(720, 1500); const ctx = canvas.getContext("2d"); const tex = texFrom(canvas);
  const body = new THREE.Mesh(rbox(0.8, 1.64, 0.09, 0.09, 6), mat("#121212", { metalness: 0.4, roughness: 0.3 })); group.add(body);
  // brushed metal frame around the edge, side buttons, glass over the screen (env reflections)
  const metal = mat("#8d9096", { metalness: 0.85, roughness: 0.28 });
  const frame = new THREE.Mesh(rbox(0.815, 1.655, 0.06, 0.095, 6), metal); group.add(frame);
  for (const [y, h] of [[0.36, 0.2], [0.1, 0.14]]) { const b = new THREE.Mesh(rbox(0.02, h, 0.035, 0.008), metal); b.position.set(0.414, y, 0); group.add(b); }
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 1.56), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.z = 0.047; group.add(screen);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.58), new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.06, metalness: 0.0, transparent: true, opacity: 0.1, depthWrite: false }));
  glass.position.z = 0.0475; glass.userData.decor = true; group.add(glass);
  return { group, canvas, ctx, tex, body, screen };
}
// Screen pixel (sx, sy) on a 720x1500 phone canvas → local position on the phone.
function phoneScreenPoint(sx, sy) { return new V3((sx / 720 - 0.5) * 0.74, (0.5 - sy / 1500) * 1.56, 0.05); }

// Finger with its TIP at the group origin; the finger extends along +y. Point it with
// finger.quaternion.setFromUnitVectors(new V3(0, 1, 0), dirTowardTheHand).
function makeFinger() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.55, 8, 16), mat("#d89a74", { roughness: 0.7 })); m.position.y = 0.35; g.add(m);
  return g;
}

// Many identical phones standing on the floor (instanced). Returns { bodies, screens, items, tint(fn) }.
function makePhoneCrowd(screenTex, { rows = 32, cols = 12, max = 640, sx = 1.15, sz = 1.25, z0 = -1.4, skip = (x, z, row) => false, seed = 11 } = {}) {
  const r = mulberry32(seed); const items = [];
  for (let row = 0; row < rows && items.length < max; row++) for (let col = -cols; col <= cols && items.length < max; col++) {
    const x = col * sx + (row % 2) * 0.5, z = z0 - row * sz; if (skip(x, z, row)) continue; items.push({ x, z, ph: r() * 6.28 });
  }
  const bodies = new THREE.InstancedMesh(rbox(0.8, 1.64, 0.09, 0.09, 3), mat("#121212", { metalness: 0.4, roughness: 0.3 }), items.length);
  const screens = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.74, 1.56), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), items.length);
  const d = new THREE.Object3D(); const white = new THREE.Color("#ffffff");
  items.forEach((c, i) => { d.position.set(c.x, 0.86, c.z); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix); d.position.z += 0.047; d.updateMatrix(); screens.setMatrixAt(i, d.matrix); screens.setColorAt(i, white); });
  const col = new THREE.Color();
  function tint(fn) { items.forEach((c, i) => { screens.setColorAt(i, col.copy(fn(c, i))); }); screens.instanceColor.needsUpdate = true; }
  return { bodies, screens, items, tint };
}

function makeBedsideTable() {
  const g = new THREE.Group();
  const table = new THREE.Mesh(rbox(5, 0.4, 3.4, 0.08), mat("#6a4330", { roughness: 0.8 })); table.position.set(0, -0.2, -0.2); g.add(table);
  const lamp = new THREE.Group();
  const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.12, 32), mat("#2b2b2b")); lb.position.y = 0.06; lamp.add(lb);
  const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 12), mat("#2b2b2b")); lp.position.y = 0.7; lamp.add(lp);
  const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.55, 0.55, 32, 1, true), mat("#f3d7b0", { emissive: "#ffb766", emissiveIntensity: 0.6, side: THREE.DoubleSide })); ls.position.y = 1.4; lamp.add(ls);
  lamp.position.set(-1.7, 0, -1.1); g.add(lamp);
  const light = new THREE.PointLight("#ffb766", 3, 6, 1.5); light.position.set(-1.7, 1.3, -1.0); g.add(light);
  g.userData = { light }; return g;
}

// Simple trading-app screen painter (portfolio value, chart, sector rows, SELL button).
// opts: { fall:0..1 (crash progress), red:0..1, pressed, blocked, spin:t }
function paintTradingApp(ctx, o) {
  const x = ctx; x.clearRect(0, 0, 720, 1500);
  const red = o.red || 0, fall = o.fall || 0;
  x.fillStyle = `rgb(${Math.round(lerp(18, 58, red))},${Math.round(lerp(18, 10, red))},${Math.round(lerp(22, 8, red))})`; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "left"; x.fillStyle = "#bfb4aa"; x.font = "700 38px Inter"; x.fillText(o.title || "Minha carteira", 50, 140);
  const v0 = o.value0 || 25430, v1 = o.value1 || 21895; const v = lerp(v0, v1, fall);
  const vs = "R$ " + Math.floor(v).toLocaleString("pt-BR") + "," + String(Math.round((v % 1) * 100)).padStart(2, "0");
  x.fillStyle = "#fff"; x.font = "900 92px Inter"; x.fillText(vs, 50, 250);
  const pct = (v / v0 - 1) * 100;
  x.fillStyle = red > 0.5 ? "#ff4d3a" : "#38c172"; x.font = "800 44px Inter"; x.fillText((pct >= 0 ? "+" : "−") + Math.abs(pct).toFixed(1).replace(".", ",") + "% hoje", 50, 320);
  x.lineWidth = 9; x.strokeStyle = red > 0.5 ? "#ff4d3a" : "#38c172"; x.lineJoin = "round"; x.beginPath();
  for (let i = 0; i <= 60; i++) { const u = i / 60; const base = 520 + Math.sin(u * 9) * 18 + Math.sin(u * 23) * 9; const drop = u > 0.35 ? (u - 0.35) / 0.65 : 0; const y = base + drop * drop * 420 * fall; const xx = 50 + u * 620; i ? x.lineTo(xx, y) : x.moveTo(xx, y); }
  x.stroke();
  (o.rows || [["BANCOS", -12.8], ["ENERGIA", -15.1], ["VAREJO", -21.4]]).forEach((r, i) => {
    const y = 1080 + i * 95; x.fillStyle = "rgba(255,255,255,0.07)"; roundRect(x, 40, y - 60, 640, 80, 18); x.fill();
    x.fillStyle = "#e9dccf"; x.font = "700 38px Inter"; x.textAlign = "left"; x.fillText(r[0], 70, y - 8);
    x.textAlign = "right"; const p = r[1] * fall; x.fillStyle = p < -0.5 ? "#ff4d3a" : "#bfb4aa"; x.fillText((p < 0 ? "−" : "") + Math.abs(p).toFixed(1).replace(".", ",") + "%", 650, y - 8);
  });
  const by = 1360; x.fillStyle = o.blocked ? "#4a4440" : o.pressed ? "#b0381a" : ORANGE; roundRect(x, 40, by - 70, 640, 130, 65); x.fill();
  x.textAlign = "center"; x.fillStyle = o.blocked ? "#a39a93" : "#fff"; x.font = "900 60px Inter"; x.fillText(o.blocked ? "INDISPONÍVEL" : "VENDER", 360, by + 16);
  if (o.blocked) {
    x.fillStyle = "rgba(224,38,27,0.92)"; roundRect(x, 40, 380, 640, 110, 24); x.fill();
    x.fillStyle = "#fff"; x.font = "800 40px Inter"; x.fillText(o.banner || "Negociação suspensa", 360, 448);
    const sp = (o.spin || 0) * 7; x.strokeStyle = "#a39a93"; x.lineWidth = 8; x.beginPath(); x.arc(600, by - 4, 26, sp, sp + 4.4); x.stroke();
  }
}
const SELL_BUTTON_PX = [360, 1360]; // centre of the SELL button on the 720x1500 screen
