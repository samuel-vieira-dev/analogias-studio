// ============================================================================
// videos/2026-11-02-cadastro-predadores-sexuais/scenes.js
// Cadastro Nacional de Pedófilos e Predadores Sexuais — neutro: como funcionaria (consulta por CPF, ficha
// pública, vítima em sigilo, tornozeleira, já na 1ª condenação), quem foi contra (veto, instituto no STF,
// o mito dos 85 votos) e por que não funciona (Ministério da Justiça × CNJ, Novo no STF).
// Analogia única: o VAR (o juiz marca, o lance vai pro telão; o VAR anula, mas o estádio já viu).
// Times come from audio/words.json (A below).
//
// Pattern for every scene: anim(t) animates objects only (no camera); CAM.move/CAM.pose(envelope(...))
// frames the subject inside the centred safe zone ("stage": every shot has a headline). Backdrops
// (living room at night, office, courtroom, stadium at night) fill the whole frame.
// ============================================================================

// Word anchors (s) from audio/words.json; c* are the cuts between scenes.
const A = {
  digitar: 0.54, cpf: 1.38, baba: 2.2, aparecer: 3.0, condenacao: 3.68, c1: 4.36,
  lei: 5.36, a2024: 5.94, mas: 7.24, cadastro: 8.6, nao: 9.34, existe: 9.6, c2: 10.3,
  pedofilos: 11.78, predadores: 12.62, camara: 14.3, aprovou: 14.74, nenhum: 15.48, contra: 16.34, c3: 16.7,
  qualquer: 17.92, nome: 19.22, cpfB: 19.94, crime: 20.76, pena: 21.42, sexual: 23.3, vitima: 24.24, sigilo: 25.08, condenado: 25.7, tornozeleira: 26.86, c4: 27.64,
  escola: 29.12, contratar: 30.28, professor: 30.82, consulta: 31.66, c5: 32.28,
  aparece: 32.88, primeira: 33.9, antes: 35.28, recursos: 35.86, c6: 36.64,
  var: 37.14, juiz: 37.66, penalti: 38.3, lance: 39.16, telao: 40.02, anular: 41.06, sai: 41.78, mas2: 42.26, estadio: 42.82, viu: 43.86, c7: 44.22,
  absolvido: 45.12, volta: 46.76, sigiloB: 47.46, juizB: 48.3, esconder: 48.78, justificar: 49.72, c8: 50.6,
  quem: 51.1, contraB: 51.52, c9: 52.1,
  card: 54.45, dez: 54.58, lista: 55.4, pena2: 56.5, disse: 56.74, fere: 57.6, constituicao: 58.02, congresso: 59.24, manteve: 59.54, veto: 60.22, c10: 60.86,
  advogados: 61.52, supremo: 63.08, estigma: 64.68, vida: 65.54, acao: 66.58, arquivada: 67.04, tecnica: 68.16, c11: 68.9,
  o85: 69.18, deputados: 69.88, foi: 71.18, castracao: 71.8, outro: 73.12, naoO: 74.18, cadastroB: 74.64, c12: 75.28,
  funciona: 75.78, ministerio: 76.7, governo: 78.02, cnj: 79.68, conselho: 80.78, tribunais: 81.86, cnjB: 82.86, governoB: 84.34, partido: 85.26, supremoB: 86.48, cobrar: 86.84, c13: 87.6,
  protege: 88.82, condena: 90.28, sempre: 91.5, comenta: 92.16, fim: 94.36, end: 96.4,
};

// Fall from `h` to 0 over [at, at + d] with one small bounce at the end.
const dropY = (t, at, h, d = 0.5) => { const k = lin(t, at, at + d); if (k < 0.72) return h * (1 - Math.pow(k / 0.72, 2)); return h * 0.05 * Math.sin(Math.PI * (k - 0.72) / 0.28); };
// Press curve of a rubber stamp: comes down over 0.3 s, holds, lifts away (0 up, 1 on the paper).
const stampPress = (t, hit) => (t < hit - 0.3 ? 0 : t < hit ? eOut(lin(t, hit - 0.3, hit)) : 1 - sm(t, hit + 0.12, hit + 0.5));

// ---------------------------------------------------------------- local pieces
// Wooden desk with a leather top. Origin: floor centre; top at h. API { group, top }
function makeWorkDesk({ w = 2.6, d = 1.4, h = 0.78, leather = "#22302a" } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#4a2c1a"), roughness: 0.4, clearcoat: 0.6 });
  const top = new THREE.Mesh(rbox(w, 0.06, d, 0.02), wood); top.position.y = h - 0.03; g.add(top);
  const lea = new THREE.Mesh(rbox(w - 0.3, 0.008, d - 0.3, 0.004), pmat(leather, { roughness: 0.7 })); lea.position.y = h + 0.004; g.add(lea);
  for (const sx of [-1, 1]) { const ped = new THREE.Mesh(rbox(0.6, h - 0.06, d - 0.1, 0.02), wood); ped.position.set(sx * (w / 2 - 0.35), (h - 0.06) / 2, 0); g.add(ped); }
  g.add(contactShadow(w + 0.6, d + 0.6));
  return { group: g, top: h + 0.008 };
}

// Consultation app on the phone (720x1500 canvas): title, the CPF field typed in (masked), the CONSULTAR
// button and, sliding up from the bottom, the result card (red: condenação; green: nada consta).
function paintConsult(x, { typed = 0, pressed = false, tap = 0, result = 0, ok = false, t = 0 } = {}) {
  x.clearRect(0, 0, 720, 1500);
  const g = x.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, "#161a22"); g.addColorStop(1, "#0b0c10"); x.fillStyle = g; x.fillRect(0, 0, 720, 1500);
  x.textAlign = "left"; x.textBaseline = "alphabetic";
  x.fillStyle = "#8b93a3"; x.font = "800 52px Inter"; x.fillText("Consulta pública", 50, 140);
  x.fillStyle = "#ffffff"; x.font = "900 84px Inter"; x.fillText("Buscar por CPF", 50, 235);
  x.fillStyle = "#1f2430"; roundRect(x, 40, 290, 640, 150, 30); x.fill();
  x.strokeStyle = typed > 0 && typed < 1 ? ORANGE : "#3a4150"; x.lineWidth = 6; roundRect(x, 40, 290, 640, 150, 30); x.stroke();
  const full = "***.***.***-**", n = Math.round(clamp(typed) * full.length);
  x.font = "800 70px Inter";
  if (n === 0) { x.fillStyle = "#5b6272"; x.fillText("CPF", 80, 390); }
  else { x.fillStyle = "#ffffff"; x.fillText(full.slice(0, n) + (typed < 1 && Math.floor(t * 3) % 2 ? "|" : ""), 80, 390); }
  x.fillStyle = pressed ? "#b0381a" : ORANGE; roundRect(x, 40, 490, 640, 140, 70); x.fill();
  x.fillStyle = "#ffffff"; x.textAlign = "center"; x.font = "900 66px Inter"; x.fillText("CONSULTAR", 360, 584);
  if (tap > 0 && tap < 1) { x.strokeStyle = `rgba(255,255,255,${0.9 * (1 - tap)})`; x.lineWidth = 10; x.beginPath(); x.arc(360, 560, 40 + 200 * tap, 0, Math.PI * 2); x.stroke(); x.fillStyle = `rgba(255,255,255,${0.35 * (1 - tap)})`; x.beginPath(); x.arc(360, 560, 46, 0, Math.PI * 2); x.fill(); }
  if (result > 0) {
    const y = lerp(1500, 690, eOut(clamp(result)));
    x.fillStyle = ok ? "#1f8a4c" : "#c8231a"; roundRect(x, 30, y, 660, 640, 40); x.fill();
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(360, y + 150, 80, 0, Math.PI * 2); x.fill();
    x.fillStyle = ok ? "#1f8a4c" : "#c8231a"; x.font = "900 120px Inter"; x.textBaseline = "middle"; x.fillText(ok ? "✓" : "!", 360, y + 156);
    x.fillStyle = "#ffffff"; x.textBaseline = "alphabetic"; x.font = "900 84px Inter"; x.fillText(ok ? "NADA" : "CONDENAÇÃO", 360, y + 340);
    x.font = "900 70px Inter"; x.fillText(ok ? "CONSTA" : "crime sexual", 360, y + 440);
  }
}

// Small phone stand (a wedge with a lip): the phone leans back on it. Origin: floor centre.
function makePhoneStand({ w = 0.26, d = 0.2 } = {}) {
  const g = new THREE.Group(), m = pmat("#2a2522", { roughness: 0.35, clearcoat: 0.6, metalness: 0.2 });
  const base = new THREE.Mesh(rbox(w, 0.025, d, 0.008), m); base.position.y = 0.0125; g.add(base);
  const back = new THREE.Mesh(rbox(w * 0.5, 0.16, 0.02, 0.006), m); back.position.set(0, 0.09, 0.0); back.rotation.x = -0.32; g.add(back);
  const lip = new THREE.Mesh(rbox(w, 0.025, 0.02, 0.006), m); lip.position.set(0, 0.035, 0.07); g.add(lip);
  g.add(contactShadow(w + 0.2, d + 0.2));
  return { group: g };
}

// The consultation phone on its stand, at real scale (the kit's phone is 1.64 tall: scaled 0.22). The tap on
// CONSULTAR is a ripple on the screen (no loose finger). API { group, body, phone, paint(o) }
function makeConsultPhone() {
  const g = new THREE.Group(), body = new THREE.Group(), st = makePhoneStand(); g.add(body); body.add(st.group);
  const ph = makePhone(), s = 0.22; ph.group.scale.setScalar(s); ph.group.position.set(0, 0.03 + 0.82 * s * Math.cos(0.32), -0.005); ph.group.rotation.x = -0.32; body.add(ph.group);
  return { group: g, body, phone: ph, paint: (o) => { paintConsult(ph.ctx, o); ph.tex.needsUpdate = true; } };
}

// Banker's desk lamp: brass base and stem, green glass shade, warm light under it (a point light and a
// glow on the desk). Origin: base centre on the desk. API { group }
function makeBankerLamp() {
  const g = new THREE.Group(), brass = pmat("#c9a24e", { metalness: 1, roughness: 0.28 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.03, 32), brass); base.position.y = 0.015; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), brass); stem.position.y = 0.21; g.add(stem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.42, 32, 1, true, 0, Math.PI), pmat("#1f6b3a", { roughness: 0.15, clearcoat: 1, emissive: "#2f8a4a", emissiveIntensity: 0.6, side: THREE.DoubleSide }));
  shade.rotation.z = Math.PI / 2; shade.rotation.x = Math.PI / 2; shade.position.set(0, 0.4, 0.06); g.add(shade);
  const bulb = sprite(BOKEH, 0.6); bulb.material.color.set("#ffd9a0"); bulb.material.blending = THREE.AdditiveBlending; bulb.material.opacity = 0.8; bulb.position.set(0, 0.36, 0.08); bulb.userData.decor = true; g.add(bulb);
  const pool = makeFloorGlow(1.2, 0.9, { color: "#ffd9a0", opacity: 0.3 }); pool.position.set(0, 0.004, 0.3); g.add(pool);
  const light = new THREE.PointLight("#ffd9a0", 2.2, 3, 1.6); light.position.set(0, 0.32, 0.12); g.add(light);
  return { group: g };
}

// Shop-mannequin lower leg seen in profile (the foot points to +x, flat cut top), on a round base, with the
// ankle monitor strapped at the ankle: the black band around it and the tracker box on the side facing the
// camera with a green LED. Reads as "tornozeleira" at once. Origin: floor centre; the box faces +z.
// API { group, led(k) }
function makeAnkleLeg() {
  const g = new THREE.Group(), skin = pmat("#d3c4b2", { roughness: 0.5, clearcoat: 0.25 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 40), pmat("#2a2522", { roughness: 0.35, clearcoat: 0.6 })); base.position.y = 0.02; g.add(base);
  const sole = 0.04;
  const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.17, 8, 20), skin); foot.rotation.z = Math.PI / 2; foot.scale.set(0.75, 1, 1.15); foot.position.set(0.08, sole + 0.04, 0); g.add(foot);
  const instep = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), skin); instep.scale.set(1.3, 0.8, 0.9); instep.position.set(0.03, sole + 0.075, 0); g.add(instep);
  const heel = new THREE.Mesh(new THREE.SphereGeometry(0.058, 20, 14), skin); heel.position.set(-0.05, sole + 0.06, 0); g.add(heel);
  const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.05, 0.52, 28), skin); shin.position.set(-0.02, sole + 0.09 + 0.26, 0); g.add(shin);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.073, 0.012, 28), pmat("#8a7d70", { roughness: 0.6 })); cap.position.set(-0.02, sole + 0.09 + 0.52 + 0.006, 0); g.add(cap);
  const ay = sole + 0.17;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.08, 36, 1, true), pmat("#1b1c1f", { roughness: 0.55, side: THREE.DoubleSide })); band.position.set(-0.02, ay, 0); g.add(band);
  for (const dy of [-0.04, 0.04]) { const lip = new THREE.Mesh(new THREE.TorusGeometry(0.064, 0.006, 8, 36), pmat("#1b1c1f", { roughness: 0.5 })); lip.rotation.x = Math.PI / 2; lip.position.set(-0.02, ay + dy, 0); g.add(lip); }
  const box = new THREE.Mesh(rbox(0.12, 0.085, 0.05, 0.015), pmat("#25272b", { roughness: 0.4, clearcoat: 0.5 })); box.position.set(-0.02, ay, 0.085); g.add(box);
  const ledM = new THREE.MeshBasicMaterial({ color: "#3cff7a", toneMapped: false }); const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), ledM); led.position.set(0.015, ay + 0.024, 0.111); g.add(led);
  const halo = sprite(BOKEH, 0.09); halo.userData.decor = true; halo.material.color.set("#3cff7a"); halo.material.blending = THREE.AdditiveBlending; halo.position.copy(led.position).add(new V3(0, 0, 0.01)); g.add(halo);
  g.add(contactShadow(0.7, 0.6));
  return { group: g, led: (k) => { ledM.color.set("#3cff7a").multiplyScalar(0.15 + 0.85 * k); halo.material.opacity = 0.9 * k; } };
}

// Laptop: aluminium base with a dark keyboard and a lid open at ~105°, its screen a live canvas
// (1024x640). Origin: floor centre of the base; the screen faces +z. API { group, paint(fn), top }
function makeLaptop({ w = 1.0 } = {}) {
  const g = new THREE.Group(), d = w * 0.68, h = w * 0.62, alu = pmat("#b9bcc2", { metalness: 0.9, roughness: 0.32 });
  const base = new THREE.Mesh(rbox(w, 0.028, d, 0.012), alu); base.position.y = 0.014; g.add(base);
  const kc = makeCanvas(512, 340), kx = kc.getContext("2d"); kx.fillStyle = "#26282c"; kx.fillRect(0, 0, 512, 340);
  kx.fillStyle = "#121315"; for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) kx.fillRect(14 + c * 37.5, 14 + r * 40, 32, 34);
  kx.fillRect(140, 222, 232, 34); kx.fillStyle = "#3a3c40"; kx.fillRect(176, 268, 160, 66);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, d * 0.82), mat("#ffffff", { map: texFrom(kc), roughness: 0.6 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.029, 0.01); g.add(kb);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.028, -d / 2 + 0.01); hinge.rotation.x = -0.26; g.add(hinge);
  const lid = new THREE.Mesh(rbox(w, h, 0.016, 0.012), alu); lid.position.set(0, h / 2, -0.008); hinge.add(lid);
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), mat("#0c0c0e", { roughness: 0.3 })); bez.position.set(0, h / 2, 0.0005); hinge.add(bez);
  const c = makeCanvas(1024, 640), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, (w - 0.06) * 0.625), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, h / 2 + 0.01, 0.001); hinge.add(scr);
  g.add(contactShadow(w + 0.4, d + 0.4));
  return { group: g, paint: (fn) => { fn(x, 1024, 640); tex.needsUpdate = true; }, top: 0.028 };
}
// Browser page on the laptop: the address bar, then either a spinner or the 404 page.
function paintNotFound(x, W, H, { found = 0, t = 0, title = "Cadastro Nacional" } = {}) {
  x.fillStyle = "#f2f2f4"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#d9dbe0"; x.fillRect(0, 0, W, 96); x.fillStyle = "#ffffff"; roundRect(x, 30, 16, W - 60, 64, 32); x.fill();
  x.fillStyle = "#4a4f5a"; x.font = "700 38px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText(title, 64, 49);
  x.textAlign = "center";
  if (found < 0.5) {
    x.strokeStyle = "#8a8f9a"; x.lineWidth = 14; x.lineCap = "round"; const a = t * 6; x.beginPath(); x.arc(W / 2, H / 2 + 20, 70, a, a + 4.2); x.stroke();
    x.fillStyle = "#6a6f7a"; x.font = "700 40px Inter"; x.fillText("Carregando…", W / 2, H / 2 + 150);
  } else {
    x.fillStyle = "#c8231a"; x.font = "900 230px Inter"; x.fillText("404", W / 2, H / 2 - 10);
    x.fillStyle = "#1c1c22"; x.font = "800 56px Inter"; x.fillText("Página não encontrada", W / 2, H / 2 + 150);
  }
}

// Public record sheet lying flat (face +y): a header band and the rows NOME / CPF / CRIME / PENA written in
// one by one, the VÍTIMA row covered by a black bar. paint({ rows, victim, redact }): rows 0..4 (a fraction
// writes the next row in), victim 0..1 (the bar slides in), redact 0..1 (black bars over NOME and CPF).
// Origin: centre of the underside. API { group, paint, top, w, d }
function makeRecordCard({ w = 1.2, d = 1.5 } = {}) {
  const g = new THREE.Group(), T = 0.012, H = Math.round(768 * d / w);
  const c = makeCanvas(768, H), x = c.getContext("2d"), tex = texFrom(c);
  const pm = pmat("#f4efe4", { roughness: 0.9 }), face = pmat("#ffffff", { map: tex, roughness: 0.85 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [pm, pm, face, pm, pm, pm]); sheet.position.y = T / 2; g.add(sheet);
  g.add(contactShadow(w + 0.3, d + 0.3));
  const ROWS = [["NOME", "FULANO DE TAL"], ["CPF", "000.000.000-00"], ["CRIME", "ESTUPRO"], ["PENA", "8 ANOS"]];
  let last = "";
  const paint = ({ rows = 4, victim = 0, redact = 0 } = {}) => {
    const key = [rows, victim, redact].map((v) => v.toFixed(2)).join(); if (key === last) return; last = key;
    x.fillStyle = "#f4efe4"; x.fillRect(0, 0, 768, H);
    x.fillStyle = "#1f2a44"; x.fillRect(0, 0, 768, 130);
    x.fillStyle = "#ffffff"; x.font = "900 60px Inter"; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText("FICHA PÚBLICA", 44, 68);
    const row = (lb, i) => { const y = 190 + i * 150; x.fillStyle = "#6a6258"; x.font = "800 36px Inter"; x.fillText(lb, 44, y); x.strokeStyle = "rgba(40,40,60,0.25)"; x.lineWidth = 3; x.beginPath(); x.moveTo(44, y + 92); x.lineTo(724, y + 92); x.stroke(); return y; };
    ROWS.forEach(([lb, val], i) => {
      const y = row(lb, i), k = clamp(rows - i);
      if (k > 0) { x.save(); x.beginPath(); x.rect(40, y + 20, 690 * eOut(k), 74); x.clip(); x.fillStyle = "#141414"; x.font = "900 64px Inter"; x.fillText(val, 44, y + 56); x.restore(); }
      if (i < 2 && redact > 0) { x.fillStyle = "#0b0b0b"; x.fillRect(40, y + 18, 690 * eOut(clamp(redact * 1.6 - i * 0.5)), 76); }
    });
    const vy = row("VÍTIMA", 4);
    if (victim > 0) { x.fillStyle = "#0b0b0b"; x.fillRect(40, vy + 18, 690 * eOut(clamp(victim)), 76); if (victim > 0.7) { x.fillStyle = "#ffffff"; x.font = "900 54px Inter"; x.textAlign = "center"; x.fillText("SIGILO", 385, vy + 57); x.textAlign = "left"; } }
    tex.needsUpdate = true;
  };
  paint({ rows: 0 });
  return { group: g, paint, top: T, w, d };
}

// Green school chalkboard with a wooden frame, a chalk tray and chalk drawings (no words). Backdrop.
function makeChalkboard({ w = 2.6, h = 1.3 } = {}) {
  const g = new THREE.Group(), c = makeCanvas(1024, Math.round(1024 * h / w)), x = c.getContext("2d"), r = mulberry32(12);
  x.fillStyle = "#24443a"; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(255,255,255,${0.01 + r() * 0.03})`; x.fillRect(r() * c.width, r() * c.height, 2 + r() * 8, 1 + r() * 3); }
  x.strokeStyle = "rgba(240,240,230,0.75)"; x.lineWidth = 6; x.lineCap = "round";
  x.beginPath(); x.arc(150, 120, 50, 0, Math.PI * 2); x.stroke();                          // sun
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(150 + Math.cos(a) * 70, 120 + Math.sin(a) * 70); x.lineTo(150 + Math.cos(a) * 95, 120 + Math.sin(a) * 95); x.stroke(); }
  x.beginPath(); x.moveTo(330, 330); x.lineTo(330, 230); x.lineTo(400, 170); x.lineTo(470, 230); x.lineTo(470, 330); x.closePath(); x.stroke();   // house
  x.strokeRect(385, 270, 30, 60);
  for (let k = 0; k < 4; k++) { x.beginPath(); for (let i = 0; i <= 40; i++) { const xx = 600 + i * 9, yy = 90 + k * 70 + Math.sin(i * 0.9 + k) * 6; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }   // scribbled lines
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat("#ffffff", { map: texFrom(c), roughness: 0.95 })); g.add(board);
  const wood = pmat("#ffffff", { map: woodTex("#6a4628"), roughness: 0.5 });
  for (const [bw, bh, xx, yy] of [[w + 0.16, 0.08, 0, h / 2 + 0.04], [w + 0.16, 0.08, 0, -h / 2 - 0.04], [0.08, h, -w / 2 - 0.04, 0], [0.08, h, w / 2 + 0.04, 0]]) { const b = new THREE.Mesh(rbox(bw, bh, 0.06, 0.01), wood); b.position.set(xx, yy, 0.02); g.add(b); }
  const tray = new THREE.Mesh(rbox(w * 0.8, 0.04, 0.12, 0.01), wood); tray.position.set(0, -h / 2 - 0.1, 0.06); g.add(tray);
  asBackdrop(g);
  return { group: g };
}

// A flight of three wide steps going up and away from the camera (1ª CONDENAÇÃO in front, then RECURSO,
// ÚLTIMO RECURSO). The first riser's plate is centred; the higher ones sit on the right half of their risers,
// leaving the left half of the first tread free for what stands on it. Each step has a lit nosing.
// Origin: floor, front centre of the first step. API { group, steps: [{ group, top, z }], light(i, k, colour) }
function makeCourtSteps({ w = 2.0, d = 0.7, h0 = 0.42, dh = 0.42, labels = ["1ª\nCONDENAÇÃO", "RECURSO", "ÚLTIMO\nRECURSO"] } = {}) {
  const g = new THREE.Group(), steps = [], stone = pmat("#ffffff", { map: tileTex(plasterTex("#9a8f84"), 0.5, 0.5), roughness: 0.55, clearcoat: 0.3 });
  labels.forEach((lb, i) => {
    const h = h0 + i * dh, z = -d / 2 - i * d, sg = new THREE.Group(); sg.position.z = z; g.add(sg);
    const block = new THREE.Mesh(rbox(w, h, d, 0.02), stone); block.position.y = h / 2; sg.add(block);
    const edgeM = new THREE.MeshBasicMaterial({ color: "#3a2a20", toneMapped: false });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.04, 0.05), edgeM); edge.position.set(0, h - 0.015, d / 2 - 0.02); sg.add(edge);
    // the riser shows only above the step in front of it (dh tall): the plate sits in that band
    const pw = i === 0 ? w * 0.85 : w * 0.47, ph = 0.35;
    const plate = lb.includes("\n") ? makePlate2(lb, pw, ph, { bg: "#1c1410", fg: "#f4e8da" }) : makePlate(lb, pw, ph * 0.7, { bg: "#1c1410", fg: "#f4e8da" });
    plate.position.set(i === 0 ? 0 : w * 0.25, h - dh / 2 - 0.01, d / 2 + 0.016); sg.add(plate);
    steps.push({ group: sg, top: h, z, edgeM });
  });
  g.add(contactShadow(w + 1.2, d * labels.length + 1));
  const light = (i, k, col = ORANGE) => steps[i].edgeM.color.set("#3a2a20").lerp(new THREE.Color(col), clamp(k));
  return { group: g, steps, light, w, d };
}

// LED board on a stand (the vote panel). Origin: floor centre; faces +z.
// API { group, paint(fn), cy, top, bottom, w, h } — fn(ctx, W, H) draws the panel.
function makeLedBoard({ w = 1.3, h = 0.82, standH = 0.95 } = {}) {
  const g = new THREE.Group(), black = pmat("#141518", { roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  const base = new THREE.Mesh(rbox(0.7, 0.06, 0.5, 0.02), black); base.position.y = 0.03; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, standH, 16), pmat("#2b2d31", { metalness: 0.8, roughness: 0.3 })); pole.position.y = standH / 2; g.add(pole);
  const cy = standH + h / 2 + 0.05;
  const body = new THREE.Mesh(rbox(w + 0.1, h + 0.1, 0.1, 0.025), black); body.position.y = cy; g.add(body);
  const c = makeCanvas(640, Math.round(640 * h / w)), x = c.getContext("2d"), tex = texFrom(c);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, cy, 0.052); g.add(screen);
  g.add(contactShadow(1.2, 1.0));
  return { group: g, paint: (fn) => { fn(x, c.width, c.height); tex.needsUpdate = true; }, cy, top: cy + h / 2 + 0.05, bottom: cy - h / 2 - 0.05, w, h };
}
// Big LED count with a caption (dot-matrix look).
function paintCount(x, W, H, n, label, col = "#ff3b2a") {
  x.fillStyle = "#07080a"; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.035)"; for (let i = 6; i < W; i += 12) for (let j = 6; j < H; j += 12) x.fillRect(i, j, 4, 4);
  x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = col; x.shadowBlur = 24;
  x.fillStyle = col; x.font = `900 ${Math.round(H * 0.6)}px Inter`; x.fillText(String(n), W / 2, H * 0.43);
  x.shadowBlur = 0; x.fillStyle = "#f4e8da"; x.font = `800 ${Math.round(H * 0.15)}px Inter`; x.fillText(label, W / 2, H * 0.85);
}

// Stadium screen (telão) on two steel legs. Origin: floor centre; faces +z. API { group, paint(fn), cy }
function makeStadiumScreen({ w = 2.4, h = 1.35, legH = 1.15 } = {}) {
  const g = new THREE.Group(), steel = pmat("#2a2d33", { metalness: 0.7, roughness: 0.4 }), black = pmat("#111215", { roughness: 0.4, metalness: 0.3 });
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, legH + 0.1, 0.1), steel); leg.position.set(s * w * 0.35, (legH + 0.1) / 2, -0.06); g.add(leg);
    const ft = new THREE.Mesh(rbox(0.3, 0.05, 0.6, 0.02), steel); ft.position.set(s * w * 0.35, 0.025, -0.06); g.add(ft);
  }
  const cy = legH + h / 2 + 0.07;
  const frame = new THREE.Mesh(rbox(w + 0.14, h + 0.14, 0.14, 0.03), black); frame.position.set(0, cy, -0.02); g.add(frame);
  const c = makeCanvas(960, 540), x = c.getContext("2d"), tex = texFrom(c);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(0, cy, 0.052); g.add(scr);
  g.add(contactShadow(w + 0.8, 1.2));
  let lastMode = null;
  return { group: g, cy, paint: (mode, fn) => { if (mode === lastMode) return; lastMode = mode; fn(x, 960, 540); tex.needsUpdate = true; } };
}
// Full-frame message on a screen: background colour, one big word and an optional small line.
function paintBanner(x, W, H, bg, big, small = "", fg = "#ffffff") {
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.04)"; for (let i = 5; i < W; i += 10) for (let j = 5; j < H; j += 10) x.fillRect(i, j, 3, 3);
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = fg;
  let px = Math.round(H * 0.34); x.font = `900 ${px}px Inter`; while (x.measureText(big).width > W * 0.9 && px > 10) { px -= 4; x.font = `900 ${px}px Inter`; }
  x.fillText(big, W / 2, small ? H * 0.44 : H * 0.5);
  if (small) { x.font = `800 ${Math.round(H * 0.11)}px Inter`; x.fillText(small, W / 2, H * 0.78); }
}

// Concrete terraces behind the goal with a row of fans on each (backdrop). API { group, update(t, jump) }
function makeStandTiers({ z0 = -15, n = 6, depth = 1.3, rise = 0.65, width = 46, seed = 4 } = {}) {
  const g = new THREE.Group(), crowds = [], conc = mat("#ffffff", { map: tileTex(plasterTex("#4a4a50"), 6, 1), roughness: 0.9 });
  for (let i = 0; i < n; i++) {
    const top = rise * (i + 1), z = z0 - i * depth;
    const step = new THREE.Mesh(new THREE.BoxGeometry(width, top, depth), conc); step.position.set(0, top / 2, z); g.add(step);
    const cr = makeCrowdField({ rows: 1, cols: 64, sx: 0.7, sz: 1, z0: z, seed: seed + i, colors: ["#d23b2a", "#f4e8da", "#2b2f3a", "#d23b2a", "#ffd166", "#3d4a5a"] });
    cr.group.position.y = top; g.add(cr.group); crowds.push({ cr, top, ph: i * 0.7 });
  }
  asBackdrop(g);
  return { group: g, update(t, jump = 0) { crowds.forEach((c) => { c.cr.update(t); c.cr.group.position.y = c.top + 0.22 * jump * Math.max(0, Math.sin(t * 14 + c.ph)); }); } };
}

// Sign standing in a wooden desk holder (one or two lines); with `pole` it is raised on a brass post over a
// round foot (a desk name stand), so things on the desk can pass in front of it without hiding it.
// Origin: on the desk, centre. API { group, plate }
function makeDeskSign(text, { w = 0.9, h = 0.42, bg = "#141414", fg = "#ffffff", pole = 0 } = {}) {
  const g = new THREE.Group(), wood = pmat("#ffffff", { map: woodTex("#5a3520"), roughness: 0.4, clearcoat: 0.6 });
  if (pole > 0) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 32), wood); foot.position.y = 0.02; g.add(foot);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, pole, 12), pmat("#c9a45a", { metalness: 1, roughness: 0.3 })); post.position.y = 0.04 + pole / 2; g.add(post);
  }
  const holder = new THREE.Mesh(rbox(w + 0.06, 0.06, 0.18, 0.02), wood); holder.position.y = 0.03 + pole; g.add(holder);
  const p = text.includes("\n") ? makePlate2(text, w, h, { bg, fg, depth: 0.03 }) : makePlate(text, w, h, { bg, fg, depth: 0.03 });
  const tiltG = new THREE.Group(); tiltG.position.y = 0.04 + pole; tiltG.rotation.x = -0.12; g.add(tiltG);
  p.position.y = h / 2; tiltG.add(p);
  g.add(contactShadow(w + 0.3, 0.5));
  return { group: g, plate: p };
}

// Manila folder lying flat with a label on the cover. Origin: on the surface, centre. API { group, top }
function makeFlatFolder(label, { w = 0.66, d = 0.48, color = "#d9b66a" } = {}) {
  const g = new THREE.Group(), m = pmat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, 0.03, d, 0.01), m); body.position.y = 0.015; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.32, 0.028, 0.08, 0.01), m); tab.position.set(-w * 0.22, 0.014, -d / 2 - 0.03); g.add(tab);
  const p = makePlate(label, w * 0.82, d * 0.36, { bg: "#141414", fg: "#ffffff", depth: 0.004 }); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.032, -d * 0.16); g.add(p);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, top: 0.034 };
}

// Manila folder standing on its bottom edge, a big label on its front (bigger than the kit's makeFolder
// label, so it reads in a wide shot). Origin: bottom centre; faces +z.
function makeStandingFolder(label, { w = 0.76, h = 0.56, color = "#e8c27a" } = {}) {
  const g = new THREE.Group(), m = pmat(color, { roughness: 0.75 });
  const body = new THREE.Mesh(rbox(w, h, 0.06, 0.02), m); body.position.y = h / 2; g.add(body);
  const tab = new THREE.Mesh(rbox(w * 0.34, 0.09, 0.045, 0.015), m); tab.position.set(-w * 0.24, h + 0.04, 0); g.add(tab);
  const p = makePlate(label, w * 0.87, h * 0.43, { bg: "#141414", fg: "#ffffff" }); p.position.set(0, h * 0.52, 0.045); g.add(p);
  g.add(contactShadow(w + 0.3, 0.5));
  return g;
}

// Law page lying flat: ruled body text, the law's number on top and one highlighted line (a plate).
// Origin: centre of the underside. API { group, top, line }
function makeLawPage({ w = 1.15, d = 1.45, line = "10 ANOS APÓS A PENA" } = {}) {
  const g = new THREE.Group(), T = 0.01, H = Math.round(512 * d / w), c = makeCanvas(512, H), x = c.getContext("2d");
  x.fillStyle = "#f6f2e8"; x.fillRect(0, 0, 512, H);
  x.fillStyle = "#1c1c22"; x.font = "900 34px Inter"; x.textAlign = "center"; x.fillText("LEI Nº 15.035/2024", 256, 62);
  x.fillStyle = "rgba(40,40,50,0.32)"; for (let y = 110; y < H - 40; y += 24) if (y < H * 0.45 - 30 || y > H * 0.45 + 40) x.fillRect(46, y, 420 - ((y * 13) % 120), 8);
  const pm = pmat("#f6f2e8", { roughness: 0.92 }), face = pmat("#ffffff", { map: texFrom(c), roughness: 0.9 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), [pm, pm, face, pm, pm, pm]); sheet.position.y = T / 2; g.add(sheet);
  const lp = makePlate(line, w * 0.94, 0.215, { bg: "#ffe66b", fg: "#1c1410", depth: 0.002 }); lp.rotation.x = -Math.PI / 2; lp.position.set(0, T + 0.0015, -0.08); g.add(lp);
  g.add(contactShadow(w + 0.3, d + 0.3));
  return { group: g, top: T, line: lp };
}

// Index card pinned to a board with a big printed mark ("?"). Origin: centre of the card's back; faces +z.
function makeIndexCard(mark = "?", { w = 0.62, h = 0.8 } = {}) {
  const g = new THREE.Group();
  const card = new THREE.Mesh(rbox(w, h, 0.012, 0.006), mat("#f4efe6", { roughness: 0.9 })); card.position.z = 0.006; g.add(card);
  const p = makePlate(mark, w * 0.7, h * 0.6, { bg: "#f4efe6", fg: RED, depth: 0.002 }); p.position.set(0, -0.02, 0.013); g.add(p);
  const pin = makePin(); pin.position.set(0, h / 2 - 0.08, 0.012); g.add(pin);
  return { group: g, pin };
}

// ============================================================ 1 · gancho: o CPF da babá
// "Imagina digitar o CPF da babá… e aparecer uma condenação." Kitchen table at night: the phone on its
// stand, the CPF typed in, a finger presses CONSULTAR, the red result slides up; the room light dips.
addScene("gancho", 0, A.c1, (S) => {
  const room = makeNightLivingRoom({ wallZ: -2.2, seed: 6 }); room.group.position.x = 2.3; S.backdrop(room.group);
  const desk = makeWorkDesk({ w: 2.0, d: 1.1, leather: "#2a2622" }); S.add(desk.group);
  const P = makeConsultPhone(); P.group.position.set(0, desk.top, 0.12); S.add(P.group);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.11, 28), pmat("#e9e4dc", { roughness: 0.3, clearcoat: 0.8 })); cup.position.set(-0.32, desk.top + 0.055, -0.05); S.add(cup);
  const hit = A.aparecer - 0.05;
  const anim = (t) => {
    room.update(t); room.light(0.75 - 0.4 * beat(t, A.condenacao - 0.1, 0.9)); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    const res = lin(t, A.condenacao - 0.3, A.condenacao + 0.3);
    P.paint({ typed: lin(t, A.digitar, A.baba + 0.4), pressed: t > hit && t < hit + 0.35, tap: t > hit ? lin(t, hit, hit + 0.55) : 0, result: res, t });
    fill.position.set(0, desk.top + 0.25, 0.6); fill.color.set(res > 0.3 ? "#ff4a3a" : "#9fc4ff"); fill.intensity = res > 0.3 ? 2.2 + 1.2 * beat(t, A.condenacao, 0.6) : 1.4;
  };
  S.hero(P.body, "celular com consulta de cpf");
  S.solid(desk.group, "mesa");
  const box = envelope([P.body], anim, 0, A.c1);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, 0, A.c1), { zone: "stage", from: [0.14, 0.2, 1], pull0: 1.25, pull: 1.0 })); };
});

// ============================================================ 2 · é lei desde 2024… e o cadastro não existe
// A: the law (an official sheet with the seal) drops on an office desk. B (cut at "Mas"): a laptop opens
// the page: loading… 404, página não encontrada. The office lights dip on "não existe".
addScene("lei", A.c1, A.c2, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 0.5, seed: 5 }); S.backdrop(off.group);
  const desk = makeWorkDesk({ w: 2.6, d: 1.4 }); S.add(desk.group);
  const lampL = makeBankerLamp(); lampL.group.position.set(-0.95, desk.top, -0.4); lampL.group.rotation.y = 0.5; S.add(lampL.group);
  const cert = makeCertificate("LEI 15.035/2024", { w: 1.1, d: 1.4 }); cert.group.position.set(0, desk.top, 0.05); cert.group.rotation.y = 0.06; S.add(cert.group);
  const lap = makeLaptop({ w: 1.0 }); lap.group.position.set(0, desk.top, 0.05); S.add(lap.group);
  const B = A.mas - 0.1;
  const anim = (t) => {
    off.update(t); off.lights(1 - 0.6 * beat(t, A.existe - 0.1, 1.0)); off.windows(1); key.intensity = 2.0; key.color.set("#ffe9d2");
    const a = t < B; cert.group.visible = a; lap.group.visible = !a;
    cert.group.position.y = desk.top + dropY(t, A.c1, 0.55, 0.5); cert.group.rotation.y = 0.06 + 0.5 * (1 - eOut(lin(t, A.c1, A.c1 + 0.6)));
    if (!a) { popIn(lap.group, t, B, 0.4); lap.paint((x, W, H) => paintNotFound(x, W, H, { found: t > A.cadastro + 0.2 ? 1 : 0, t })); }
    fill.position.set(0, desk.top + 0.6, 0.9); fill.color.set(t > A.cadastro + 0.2 ? "#ff6a5a" : "#cfe0ff"); fill.intensity = a ? 0 : 1.6;
  };
  S.hero(cert.group, "documento da lei", { when: (t) => t > A.c1 + 0.5 && t < B });
  S.hero(lap.group, "notebook com erro 404", { when: (t) => t > B + 0.4 });
  S.solid(desk.group, "mesa");
  const bA = envelope([cert.group], anim, A.c1 + 0.5, B - 0.05), bB = envelope([lap.group], anim, B + 0.45, A.c2);
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "orbit", lin(t, A.c1, B), { zone: "stage", from: [0, 0.9, 1], deg: 34, pull: 1.0 }));
    else CAM.apply(CAM.move(bB, "drop", lin(t, B, A.c2), { zone: "stage", from: [0.05, 0.35, 1], rise: 0.3, pull: 1.02 }));
  };
});

// ============================================================ 3 · Câmara aprovou sem nenhum voto contra
// The photo of the Chamber floor in a frame on a pedestal turns and lands (slow zoom); on "nenhum voto
// contra" the vote panel beside it lights up with a red 0.
addScene("camara", A.c2, A.c3, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.4, seed: 9 }); S.backdrop(off.group);
  const fr = makePhotoFrame("camara", { w: 2.4, shape: 1.75, name: "CÂMARA DOS DEPUTADOS" }); S.add(fr.group);
  if (fr.plate) fr.plate.userData.plate.detail = true;
  const bd = makeLedBoard({ w: 1.0, h: 0.66, standH: 0.75 }); bd.group.position.set(2.0, 0, 0.35); bd.group.rotation.y = -0.25; S.add(bd.group);
  const B = A.nenhum - 0.45;
  let shown = null;
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, A.c2, A.c2 + 0.7))); popIn(fr.group, t, A.c2, 0.45); fr.zoom(1 + 0.22 * lin(t, A.c2, A.c3));
    popIn(bd.group, t, B, 0.4);
    const n = t < A.nenhum ? "" : "0"; if (n !== shown) { shown = n; bd.paint((x, W, H) => paintCount(x, W, H, n, "VOTOS CONTRA")); }
    off.windows(1 + 0.6 * beat(t, A.nenhum, 0.6));
  };
  S.hero(fr.group, "porta-retrato câmara");
  S.hero(bd.group, "painel de votos", { when: (t) => t > B + 0.4 });
  const bA = envelope([fr.group], anim, A.c2 + 0.8, B), bB = envelope([fr.group, bd.group], anim, B + 0.4, A.c3);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c2, B), { zone: "stage", from: [-0.22, 0.32, 1], pull0: 1.45, pull: 1.0 });
    const pb = CAM.move(bB, "truck", lin(t, B, A.c3), { zone: "stage", from: [0.05, 0.3, 1], side: 0.25, pull: 1.0 });
    CAM.apply(CAM.blend(pa, pb, sm(t, B - 0.2, B + 0.4)));
  };
});

// ============================================================ 4 · como funcionaria: a ficha pública
// A: on a desk the public record writes itself in row by row (nome, CPF, crime, pena); the VÍTIMA row gets
// a black bar (sigilo). B (cut at "E o condenado"): the ankle monitor on its display, LED blinking.
addScene("ficha", A.c3, A.c4, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 0.5, seed: 13 }); S.backdrop(off.group);
  const desk = makeWorkDesk({ w: 2.8, d: 1.6, leather: "#1f2f3a" }); S.add(desk.group);
  const card = makeRecordCard(); card.group.position.set(-0.25, desk.top, 0.05); S.add(card.group);
  const lampF = makeBankerLamp(); lampF.group.position.set(-1.15, desk.top, -0.5); lampF.group.rotation.y = 0.5; S.add(lampF.group);
  const mon = makeAnkleLeg(); mon.group.position.set(0.85, desk.top, 0.25); mon.group.rotation.y = -0.3; S.add(mon.group);
  const B = A.condenado - 0.1, rowAt = [A.nome, A.cpfB, A.crime, A.pena];
  const anim = (t) => {
    off.update(t); off.lights(0.95); key.intensity = 2.0; key.color.set("#fff1e2");
    const rows = rowAt.reduce((s, at) => s + clamp((t - at + 0.1) / 0.45), 0);
    card.paint({ rows, victim: lin(t, A.vitima - 0.1, A.sigilo + 0.2) });
    popIn(card.group, t, A.c3, 0.4);
    mon.group.visible = t > B - 0.1; popIn(mon.group, t, B - 0.1, 0.45); mon.group.rotation.y = -0.15 + 0.25 * sm(t, B, A.c4);
    mon.led(Math.floor(t * 2.4) % 2 ? 1 : 0.2);
  };
  S.hero(card.group, "ficha pública", { when: (t) => t > A.c3 + 0.4 && t < B });
  S.hero(mon.group, "tornozeleira no tornozelo", { when: (t) => t > B + 0.4 });
  S.solid(desk.group, "mesa");
  const bA = envelope([card.group], anim, A.c3 + 0.4, B - 0.05), bB = envelope([mon.group], anim, B + 0.4, A.c4);
  return (t) => {
    anim(t);
    if (t < B) CAM.apply(CAM.move(bA, "crane", lin(t, A.c3, B), { zone: "stage", from: [0, 0.8, 1], rise: 0.2, pull: 1.0 }));
    else CAM.apply(CAM.move(bB, "push", lin(t, B, A.c4), { zone: "stage", from: [-0.1, 0.12, 1], pull0: 1.35, pull: 1.04 }));
  };
});

// ============================================================ 5 · imagina: você tem uma escola
// The principal's office of a school (chalkboard on the wall): a résumé on the desk and the laptop
// consults the CPF; on "consulta" the green NADA CONSTA comes up.
addScene("escola", A.c4, A.c5, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.0, seed: 17, wall: "#5a4a3a" }); S.backdrop(off.group);
  const cb = makeChalkboard(); cb.group.position.set(0, 2.25, -2.37); S.backdrop(cb.group);
  const desk = makeWorkDesk({ w: 2.6, d: 1.4, leather: "#2a3a2a" }); S.add(desk.group);
  // the résumé stands in a tilted acrylic holder, so its title faces the camera
  const cv = new THREE.Group(); cv.position.set(-0.6, desk.top, 0.15); cv.rotation.y = 0.2; S.add(cv);
  const holder = new THREE.Mesh(rbox(0.74, 0.05, 0.22, 0.02), pmat("#2a2522", { roughness: 0.35, clearcoat: 0.6 })); holder.position.y = 0.025; cv.add(holder);
  const sheetG = new THREE.Group(); sheetG.position.set(0, 0.05, 0); sheetG.rotation.x = -0.3; cv.add(sheetG);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.88, 0.006), pmat("#f6f3ec", { roughness: 0.9 })); paper.position.set(0, 0.44, 0); sheetG.add(paper);
  const head = makePlate("CURRÍCULO", 0.6, 0.15, { bg: "#f6f3ec", fg: "#1c1410", depth: 0.002 }); head.position.set(0, 0.78, 0.004); sheetG.add(head);
  const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.21), mat("#9aa3ad", { roughness: 0.9 })); ph.position.set(-0.2, 0.56, 0.004); sheetG.add(ph);
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(i < 3 ? 0.3 : 0.54, 0.026), mat("#8a8a90", { roughness: 0.9 })); l.position.set(i < 3 ? 0.09 : 0, 0.62 - i * 0.075 - (i >= 3 ? 0.06 : 0), 0.004); sheetG.add(l); }
  const lap = makeLaptop({ w: 1.0 }); lap.group.position.set(0.4, desk.top, 0.05); lap.group.rotation.y = -0.22; S.add(lap.group);
  const paintLap = (t) => lap.paint((x, W, H) => {
    x.fillStyle = "#14171d"; x.fillRect(0, 0, W, H); x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#ffffff"; x.font = "900 64px Inter"; x.fillText("CONSULTA POR CPF", W / 2, 120);
    x.fillStyle = "#1f2430"; roundRect(x, 140, 190, W - 280, 110, 24); x.fill(); x.fillStyle = "#ffffff"; x.font = "800 60px Inter"; x.fillText("***.***.***-**".slice(0, Math.round(14 * lin(t, A.c4 + 0.3, A.contratar))), W / 2, 248);
    const ok = lin(t, A.consulta - 0.3, A.consulta + 0.2);
    if (ok > 0) { x.globalAlpha = ok; x.fillStyle = "#2fd27a"; roundRect(x, 80, 340, W - 160, 250, 30); x.fill(); x.fillStyle = "#06240f"; x.font = "900 112px Inter"; x.fillText("✓ NADA CONSTA", W / 2, 467); x.globalAlpha = 1; }
  });
  const anim = (t) => {
    off.update(t); off.lights(1); key.intensity = 2.1; key.color.set("#fff4e6");
    popIn(cv, t, A.c4 + 0.05, 0.4); popIn(lap.group, t, A.c4 + 0.2, 0.4); paintLap(t);
    fill.position.set(0.45, desk.top + 0.5, 0.8); fill.color.set("#7dffb0"); fill.intensity = 2.4 * sm(t, A.consulta - 0.2, A.consulta + 0.3);
  };
  S.hero(cv, "currículo", { when: (t) => t > A.c4 + 0.5 });
  S.hero(lap.group, "notebook consultando cpf", { when: (t) => t > A.c4 + 0.6 });
  S.solid(desk.group, "mesa");
  const box = envelope([cv, lap.group], anim, A.c4 + 0.6, A.c5);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "drop", lin(t, A.c4, A.c5), { zone: "stage", from: [0.05, 0.42, 1], rise: 0.25, pull: 1.0 })); };
});

// ============================================================ 6 · já na primeira condenação, antes dos recursos
// In a courtroom, three steps: 1ª CONDENAÇÃO, RECURSO, RECURSO. On "aparece" the first step lights and the
// card NOME E CPF rises from it into the light; on "recursos" the two higher steps blink, still ahead.
addScene("escada", A.c5, A.c6, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 6, seed: 7 }); S.backdrop(court.group);
  const st = makeCourtSteps(); S.add(st.group);
  const card = makePlate2("NOME E CPF\nNA INTERNET", 0.9, 0.4, { bg: ORANGE, fg: "#ffffff", depth: 0.04 }); S.add(card);
  // the card stands on the left half of the first tread, against the second riser (whose plate is on the right)
  const s0 = st.steps[0], cx = -st.w * 0.25, cz = s0.z - st.d / 2 + 0.09;
  const beam = makeLightShaft([cx, 3.6, cz + 0.3], [cx, s0.top, cz], { w0: 0.5, w1: 1.2, color: "#ffd9a8", opacity: 0.22 }); S.backdrop(beam.group);
  const up = A.aparece - 0.1;
  const anim = (t) => {
    court.update(t); court.lights(0.85); key.intensity = 1.9; key.color.set("#ffe2c4");
    st.light(0, sm(t, up, up + 0.3)); beam.set(sm(t, up, up + 0.4) * (1 - 0.5 * sm(t, up + 1.2, up + 2)));
    const blink = t > A.antes ? 0.5 + 0.5 * Math.sin((t - A.antes) * 9) : 0; st.light(1, blink, CREAM); st.light(2, blink, CREAM);
    card.visible = t > up; const k = pop(t, up, 0.45); card.scale.set(Math.max(0.001, k), Math.max(0.001, k), 1); card.position.set(cx, s0.top + 0.2 * Math.max(0.001, k), cz); card.rotation.y = 0.04 * Math.sin((t - up) * 1.5);
  };
  S.hero(st.group, "escada de três degraus");
  S.hero(card, "placa nome e cpf", { when: (t) => t > up + 0.5 });
  const box = envelope([st.group, card], anim, up + 0.5, A.c6).union(envelope([st.group], anim, A.c5, up));
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c5, A.c6), { zone: "stage", from: [0.18, 0.32, 1], pull: 1.0, pull0: 1.1 })); };
});

// ============================================================ 7 · a analogia: o VAR
// Night stadium: the pitch-side VAR monitor and the stadium screen. "marca pênalti": the ball lands on the
// spot and the screen shows PÊNALTI; "anular": the monitor shows ANULADO and the screen goes red, then dark;
// "o estádio inteiro já viu": the camera opens on the terraces, the fans jump and the flashes go off.
addScene("var", A.c6, A.c7, (S) => {
  const std = makeStadiumNight({ goal: true, seed: 5 }); std.group.position.set(0.25, 0, 1.6); S.backdrop(std.group);
  const tiers = makeStandTiers({ z0: -14 }); S.backdrop(tiers.group);
  const flashes = makeBokeh({ n: 70, center: [0, 3.5, -18], spread: [40, 4, 6], size: [0.25, 0.7], colors: ["#ffffff", "#e8f0ff"], opacity: 0.9, seed: 31 }); S.backdrop(flashes.group);
  const vm = makeVarMonitor({ label: "VAR", w: 1.0, signW: 0.5 }); vm.group.position.set(-0.85, 0, 2.1); vm.group.rotation.y = 0.28; S.add(vm.group);
  const scr = makeStadiumScreen({ w: 2.3, h: 1.3, legH: 1.25 }); scr.group.position.set(0.8, 0, 0.6); scr.group.rotation.y = -0.12; S.add(scr.group);
  const ball = makeSoccerBall(0.11); ball.position.set(0.25, 0.11, 1.6); S.add(ball);
  const B = A.mas2 - 0.2;
  const anim = (t) => {
    std.update(t); key.intensity = 1.8; key.color.set("#eaf2ff"); hemi.intensity = 0.4; hemi.color.set("#cfe0ff");
    const jump = sm(t, A.estadio - 0.2, A.estadio + 0.2);
    tiers.update(t, jump); flashes.update(t);
    const fk = t < A.penalti ? 0 : t < A.estadio ? 0.25 * beat(t, A.penalti, 0.8) + 0.3 * beat(t, A.telao, 0.8) : 0.4 + 0.6 * Math.abs(Math.sin(t * 7));
    flashes.group.children.forEach((s) => { s.material.opacity *= fk; });
    std.lights.set(1 - 0.25 * beat(t, A.anular, 0.6));
    popIn(vm.group, t, A.c6, 0.4); popIn(scr.group, t, A.c6 + 0.15, 0.4);
    ball.visible = t > A.penalti - 0.35; ball.position.y = 0.11 + dropY(t, A.penalti - 0.35, 0.9, 0.5); ball.rotation.x = -4 * lin(t, A.penalti - 0.35, A.penalti + 0.3);
    const mode = t < A.penalti ? "live" : t < A.anular ? "penalti" : "anulado";
    scr.paint(mode, (x, W, H) => mode === "live" ? paintBanner(x, W, H, "#0d1b2a", "AO VIVO") : mode === "penalti" ? paintBanner(x, W, H, "#1f6b3a", "PÊNALTI!") : paintBanner(x, W, H, "#b51f17", "ANULADO"));
    const vmode = t < A.anular - 0.1 ? "rev" : "anu";
    if (vm.mode !== vmode) { vm.mode = vmode; vm.paint((x, W, H) => (vmode === "rev" ? paintBanner(x, W, H, "#10233d", "REVISÃO") : paintBanner(x, W, H, "#b51f17", "ANULADO"))); }
    vm.timer(t < A.anular ? "0:" + String(Math.max(0, Math.floor(A.anular - t))).padStart(2, "0") : "0:00", t < A.anular);
  };
  S.hero(vm.group, "monitor do var");
  S.hero(scr.group, "telão do estádio", { when: (t) => t > A.c6 + 0.6 });
  const bA = envelope([vm.group, scr.group, ball], anim, A.c6 + 0.6, B), bB = envelope([vm.group, scr.group], anim, B, A.c7);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "orbit", lin(t, A.c6, B), { zone: "stage", from: [0.05, 0.22, 1], deg: 30, pull: 1.02 });
    const pb = CAM.move(bB, "reveal", lin(t, B, A.c7), { zone: "stage", from: [0.05, 0.3, 1], pull: 1.0, pull0: 1.3 });
    let p = CAM.blend(pa, pb, sm(t, B - 0.2, B + 0.3)); p = CAM.shake(p, t, A.anular, 0.025, 0.25); CAM.apply(p);
  };
});

// ============================================================ 8 · absolvido no recurso: volta o sigilo
// Courtroom. A: the public record on the bench; black bars slide over NOME and CPF and the stamp prints
// SIGILO. B (at "E o juiz"): the gavel beside it strikes on "esconder".
addScene("sigilo", A.c7, A.c8, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 6, seed: 11 }); S.backdrop(court.group);
  const desk = makeWorkDesk({ w: 2.8, d: 1.6, leather: "#3a1c18" }); S.add(desk.group);
  const card = makeRecordCard(); card.group.position.set(-0.25, desk.top, 0.05); S.add(card.group);
  const ink = makeInkMark("SIGILO", 1.04, 0.42, { ink: RED }); ink.rotation.set(-Math.PI / 2, 0, 0.1); ink.position.set(0, card.top + 0.003, 0.14); card.group.add(ink);
  const stamp = makeStamp({ w: 1.04, d: 0.42, ink: RED }); S.add(stamp);
  const gv = makeJudgeGavel({ s: 1.1 }); gv.group.position.set(0.72, desk.top, 0.35); gv.group.rotation.y = -0.4; S.add(gv.group);
  const hit = A.sigiloB + 0.05, B = A.juizB - 0.15, strikeAt = A.esconder;
  const anim = (t) => {
    court.update(t); court.lights(0.85); key.intensity = 2.0; key.color.set("#ffe6cc");
    card.paint({ rows: 4, victim: 1, redact: lin(t, A.volta - 0.4, A.volta + 0.5) });
    const pr = stampPress(t, hit); stamp.visible = t > hit - 0.55 && t < hit + 0.55; stamp.position.set(-0.25, desk.top + card.top + 0.004 + 0.5 * (1 - pr), 0.19);
    ink.visible = t > hit;
    gv.group.visible = t > B - 0.05; popIn(gv.group, t, B - 0.05, 0.4);
    gv.strike(t < strikeAt - 0.45 ? 1 : t < strikeAt - 0.15 ? 1 - sm(t, strikeAt - 0.45, strikeAt - 0.15) : sm(t, strikeAt - 0.15, strikeAt));
  };
  S.hero(card.group, "ficha com tarja", { when: (t) => t > A.c7 + 0.2 && t < B });
  S.hero(gv.group, "martelo do juiz", { when: (t) => t > B + 0.4 }); S.hero(ink, "carimbo sigilo na ficha", { when: (t) => t > B + 0.4 });
  S.solid(desk.group, "mesa");
  const bA = envelope([card.group], anim, A.c7, B - 0.05), bB = envelope([gv.group, ink], anim, B + 0.4, A.c8);
  return (t) => {
    anim(t);
    if (t < B) { let p = CAM.move(bA, "push", lin(t, A.c7, B), { zone: "stage", from: [0, 0.85, 1], pull0: 1.2, pull: 1.0 }); p = CAM.shake(p, t, hit, 0.02, 0.2); CAM.apply(p); }
    else { let p = CAM.move(bB, "truck", lin(t, B, A.c8), { zone: "stage", from: [0.1, 0.55, 1], side: 0.3, pull: 1.0 }); p = CAM.shake(p, t, strikeAt, 0.03, 0.25); CAM.apply(p); }
  };
});

// ============================================================ 9 · então, quem foi contra?
// A cork board on the office wall: three blank cards with a red "?" drop in and get pinned; a string runs
// between them.
addScene("quem", A.c8, A.c9, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.6, seed: 19 }); S.backdrop(off.group);
  const board = makeCorkBoard({ w: 3.0, h: 1.9, lift: 0.7 }); board.group.position.z = -0.6; S.add(board.group);
  const cards = new THREE.Group(); board.group.add(cards);
  const items = [[-0.62, 0.05, -0.08], [0, -0.08, 0.05], [0.62, 0.06, -0.05]].map(([u, v, rz], i) => { const c = makeIndexCard("?"); c.group.position.copy(board.point(u, v)).add(new V3(0, 0, 0.01)); c.group.rotation.z = rz; cards.add(c.group); return { c, at: A.c8 + 0.05 + i * 0.18, rest: c.group.position.clone(), rz }; });
  const s1 = makeString(items[0].rest.clone().add(new V3(0, 0.32, 0.12)), items[1].rest.clone().add(new V3(0, 0.32, 0.12))); cards.add(s1.mesh);
  const s2 = makeString(items[1].rest.clone().add(new V3(0, 0.32, 0.12)), items[2].rest.clone().add(new V3(0, 0.32, 0.12))); cards.add(s2.mesh);
  const anim = (t) => {
    off.update(t); off.lights(0.85); key.intensity = 2.0; key.color.set("#ffe2c4");
    items.forEach(({ c, at, rest, rz }) => { const k = eOut(lin(t, at, at + 0.4)); c.group.visible = t >= at; c.group.position.set(rest.x + 0.3 * (1 - k), rest.y + 0.9 * (1 - k), rest.z + 1.2 * (1 - k)); c.group.rotation.set(-0.4 * (1 - k), 0.2 * (1 - k), rz + 0.4 * (1 - k)); });
    s1.setProgress(lin(t, A.quem - 0.2, A.quem + 0.2)); s2.setProgress(lin(t, A.quem + 0.1, A.contraB + 0.1));
  };
  S.hero(cards, "cartões com interrogação", { when: (t) => t > A.c8 + 0.5 });
  const box = envelope([cards], anim, A.c8 + 0.6, A.c9);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "push", lin(t, A.c8, A.c9), { zone: "stage", from: [-0.08, 0.1, 1], pull0: 1.3, pull: 1.02 })); };
});

// ============================================================ 10 · o veto
// First the 2D card of the president (video.json overlay; only the office behind it). Then the law page
// drops on the desk with the line 10 ANOS APÓS A PENA highlighted; the stamp prints VETADO over it on
// "Disse"; on "manteve" it prints MANTIDO below.
addScene("veto", A.c9, A.c10, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 0.5, seed: 29 }); S.backdrop(off.group);
  const desk = makeWorkDesk({ w: 2.6, d: 1.5 }); S.add(desk.group);
  const page = makeLawPage(); page.group.position.set(0, desk.top, 0.05); S.add(page.group);
  const lampV = makeBankerLamp(); lampV.group.position.set(-0.95, desk.top, -0.45); lampV.group.rotation.y = 0.5; S.add(lampV.group);
  const veto = makeInkMark("VETADO", 0.9, 0.34, { ink: RED, seed: 3 }); veto.rotation.set(-Math.PI / 2, 0, -0.1); veto.position.set(0, page.top + 0.004, 0.27); page.group.add(veto);
  const mant = makeInkMark("MANTIDO", 0.9, 0.3, { ink: "#1f3d8a", seed: 9 }); mant.rotation.set(-Math.PI / 2, 0, 0.08); mant.position.set(0, page.top + 0.004, 0.55); page.group.add(mant);
  const stamp = makeStamp({ w: 0.9, d: 0.34, ink: RED }); S.add(stamp);
  const h1 = A.disse + 0.3, h2 = A.manteve + 0.15;
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    page.group.visible = t > A.card; page.group.position.y = desk.top + dropY(t, A.card, 0.6, 0.5); page.group.rotation.y = 0.5 * (1 - eOut(lin(t, A.card, A.card + 0.6)));
    const p1 = stampPress(t, h1), p2 = stampPress(t, h2), on1 = t > h1 - 0.55 && t < h1 + 0.55, on2 = t > h2 - 0.55 && t < h2 + 0.55;
    stamp.visible = on1 || on2; stamp.position.set(0, desk.top + page.top + 0.004 + 0.5 * (1 - (on1 ? p1 : p2)), 0.05 + (on1 ? 0.27 : 0.55));
    veto.visible = t > h1; mant.visible = t > h2;
  };
  S.hero(page.group, "página da lei", { when: (t) => t > A.card + 0.5 });
  S.solid(desk.group, "mesa");
  const box = envelope([page.group], anim, A.card + 0.5, A.c10);
  const wide = CAM.pose(new THREE.Box3(new V3(-1.3, 0, -0.7), new V3(1.3, 1.2, 0.8)), { zone: "stage", from: [0, 0.6, 1], pull: 1.1 });
  return (t) => {
    anim(t);
    let p = t < A.card ? CAM.blend(wide, CAM.move(box, "orbit", 0, { zone: "stage", from: [0, 0.95, 1], deg: 26, pull: 1.0 }), sm(t, A.c9, A.card) * 0.4) : CAM.move(box, "orbit", lin(t, A.card, A.c10), { zone: "stage", from: [0, 0.95, 1], deg: 26, pull: 1.0 });
    p = CAM.shake(p, t, h1, 0.025, 0.22); p = CAM.shake(p, t, h2, 0.02, 0.2); CAM.apply(p);
  };
});

// ============================================================ 11 · o instituto no Supremo; arquivada
// Courtroom. A: the photo of the Supreme Court's floor in a frame turns and lands (slow zoom). B (at "A
// ação"): the case folder on the bench gets the ARQUIVADA stamp.
addScene("stf", A.c10, A.c11, (S) => {
  const court = makeCourtroomSet({ wallZ: -4, clear: 6, seed: 13 }); S.backdrop(court.group);
  const fr = makePhotoFrame("stf", { w: 2.2, name: "SUPREMO TRIBUNAL FEDERAL" }); S.add(fr.group);
  if (fr.plate) fr.plate.userData.plate.detail = true;
  const desk = makeWorkDesk({ w: 2.2, d: 1.3, leather: "#3a1c18" }); desk.group.position.x = 30; S.add(desk.group);
  const fold = makeFlatFolder("AÇÃO NO STF", { w: 0.9, d: 0.66 }); S.add(fold.group);
  const ink = makeInkMark("ARQUIVADA", 0.78, 0.26, { ink: RED, seed: 5 }); ink.rotation.set(-Math.PI / 2, 0, -0.1); ink.position.set(0, fold.top + 0.003, 0.14); fold.group.add(ink);
  const stamp = makeStamp({ w: 0.78, d: 0.26, ink: RED }); S.add(stamp);
  const B = A.acao - 0.15, hit = A.arquivada + 0.1;
  const anim = (t) => {
    court.update(t); court.lights(0.9); key.intensity = 2.0; key.color.set("#ffe6cc");
    const a = t < B; fr.group.visible = a; desk.group.position.x = a ? 30 : 0; fold.group.visible = !a;
    fr.frame.rotation.y = 1.2 * (1 - eOut(lin(t, A.c10, A.c10 + 0.7))); popIn(fr.group, t, A.c10, 0.45, 1, B); fr.zoom(1 + 0.3 * lin(t, A.c10, B));
    fold.group.position.set(0, desk.top + dropY(t, B, 0.5, 0.45), 0.05); fold.group.rotation.y = 0.12 + 0.4 * (1 - eOut(lin(t, B, B + 0.6)));
    const pr = stampPress(t, hit); stamp.visible = !a && t > hit - 0.55 && t < hit + 0.55; stamp.position.set(0, desk.top + fold.top + 0.004 + 0.5 * (1 - pr), 0.19);
    ink.visible = t > hit;
  };
  S.hero(fr.group, "porta-retrato stf", { when: (t) => t < B });
  S.hero(fold.group, "pasta da ação", { when: (t) => t > B + 0.4 });
  S.solid(desk.group, "mesa", { when: (t) => t > B });
  const bA = envelope([fr.group], anim, A.c10 + 0.8, B - 0.05), bB = envelope([fold.group], anim, B + 0.45, A.c11);
  return (t) => {
    anim(t);
    if (t < B) { const pa = CAM.move(bA, "push", lin(t, A.c10, A.estigma), { zone: "stage", from: [0.25, 0.3, 1], pull0: 1.35, pull: 1.0 }), pc = CAM.move(bA, "crane", lin(t, A.estigma - 0.4, B), { zone: "stage", from: [-0.15, 0.3, 1], rise: 0.3, pull: 1.0 }); CAM.apply(CAM.blend(pa, pc, sm(t, A.estigma - 0.6, A.estigma + 0.3))); }
    else { let p = CAM.move(bB, "orbit", lin(t, B, A.c11), { zone: "stage", from: [0, 0.8, 1], deg: 30, pull: 1.04 }); p = CAM.shake(p, t, hit, 0.03, 0.25); CAM.apply(p); }
  };
});

// ============================================================ 12 · os 85 votos: castração, não cadastro
// The vote panel counts up to 85 in red; under it hangs a sign that reads CADASTRO? and flips on "Foi contra"
// to CASTRAÇÃO QUÍMICA. The office windows flash red on the count.
addScene("votos", A.c11, A.c12, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.0, seed: 23 }); S.backdrop(off.group);
  const bd = makeLedBoard({ w: 1.5, h: 0.9, standH: 1.35 }); S.add(bd.group);
  const sign = new THREE.Group(); sign.position.set(0, bd.bottom - 0.08, 0.12); S.add(sign);
  const chainM = pmat("#c9a45a", { metalness: 1, roughness: 0.3 });
  for (const sx of [-0.42, 0.42]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), chainM); ch.position.set(sx, 0, 0); sign.add(ch); }
  const flip = new THREE.Group(); flip.position.y = -0.1; sign.add(flip);
  const front = makePlate("CADASTRO?", 1.1, 0.34, { bg: "#141414", fg: "#ffffff" }); front.position.set(0, -0.17, 0.018); flip.add(front);
  const back = makePlate2("CASTRAÇÃO\nQUÍMICA", 1.1, 0.42, { bg: RED, fg: "#ffffff", depth: 0.03 }); back.rotation.y = Math.PI; back.position.set(0, -0.21, -0.018); flip.add(back);
  const flipAt = A.foi - 0.05;
  let shown = -1;
  const anim = (t) => {
    off.update(t); off.lights(0.85); key.intensity = 2.0; key.color.set("#ffe2c4");
    off.windows(1, t > A.o85 && t < A.foi ? "#ff3b2a" : null);
    const n = Math.round(85 * eOut(lin(t, A.o85 - 0.1, A.deputados + 0.3)));
    if (n !== shown) { shown = n; bd.paint((x, W, H) => paintCount(x, W, H, n, "VOTOS CONTRA")); }
    popIn(bd.group, t, A.c11, 0.4);
    sign.visible = t > A.deputados - 0.2; popIn(sign, t, A.deputados - 0.2, 0.35);
    flip.rotation.y = Math.PI * sm(t, flipAt, flipAt + 0.6) + 0.12 * Math.sin((t - A.c11) * 2.2); sign.rotation.z = 0.04 * Math.sin((t - A.c11) * 1.7);
    front.visible = flip.rotation.y < Math.PI / 2; back.visible = !front.visible;
  };
  S.hero(bd.group, "painel com 85 votos contra");
  S.hero(sign, "placa que vira", { when: (t) => t > A.deputados + 0.2 });
  const box = envelope([bd.group, sign], anim, A.deputados + 0.2, A.c12);
  return (t) => { anim(t); CAM.apply(CAM.move(box, "crane", lin(t, A.c11, A.c12), { zone: "stage", from: [0.25, 0.15, 1], rise: 0.45, pull: 1.0 })); };
});

// ============================================================ 13 · por que não funciona: o empurra-empurra
// One long desk: on the left MIN. JUSTIÇA (GOVERNO), on the right CNJ (TRIBUNAIS). The CADASTRO folder
// slides to the CNJ ("é com o CNJ") and back ("é com o governo"); on "Novo foi ao Supremo" the gavel lands in
// the middle and strikes.
addScene("empurra", A.c12, A.c13, (S) => {
  const off = makeOfficeSet({ wallZ: -2.4, clear: 3.6, seed: 31 }); S.backdrop(off.group);
  const desk = makeWorkDesk({ w: 2.6, d: 1.3 }); S.add(desk.group);
  const sL = makeDeskSign("MIN. JUSTIÇA\n(GOVERNO)", { w: 0.95, h: 0.5, bg: "#1f2a44", pole: 0.62 }); sL.group.position.set(-0.72, desk.top, -0.32); sL.group.rotation.y = 0.12; S.add(sL.group);
  const sR = makeDeskSign("CNJ\n(TRIBUNAIS)", { w: 0.95, h: 0.5, bg: "#3a1c18", pole: 0.62 }); sR.group.position.set(0.72, desk.top, -0.32); sR.group.rotation.y = -0.12; S.add(sR.group);
  // the CADASTRO folder stands on its edge (label to the camera) and is pushed from one side to the other
  const fold = new THREE.Group(); S.add(fold); const fb = makeStandingFolder("CADASTRO", { w: 0.84, h: 0.6 }); fold.add(fb);
  const gv = makeJudgeGavel({ s: 0.9 }); gv.group.position.set(0, desk.top, 0.42); S.add(gv.group);
  const go = A.cnj - 0.5, back = A.governoB - 0.5, gAt = A.partido - 0.1, strikeAt = A.supremoB;
  const anim = (t) => {
    off.update(t); off.lights(0.9); key.intensity = 2.0; key.color.set("#ffe9d2");
    popIn(sL.group, t, A.c12 + 0.05, 0.4); popIn(sR.group, t, A.c12 + 0.2, 0.4); popIn(fold, t, A.c12 + 0.35, 0.4);
    const kGo = sm(t, go, go + 0.7), kBack = sm(t, back, back + 0.7), x = -0.62 + 1.24 * kGo - 1.24 * kBack;
    fold.position.set(x, desk.top, 0.12); fold.rotation.z = -0.12 * Math.sin(Math.PI * kGo) + 0.12 * Math.sin(Math.PI * kBack); fold.rotation.y = 0.1 * Math.sin(t * 1.3);
    gv.group.visible = t > gAt; popIn(gv.group, t, gAt, 0.4);
    gv.strike(t < strikeAt - 0.45 ? 1 : t < strikeAt - 0.15 ? 1 - sm(t, strikeAt - 0.45, strikeAt - 0.15) : sm(t, strikeAt - 0.15, strikeAt));
  };
  S.hero(sL.group, "placa ministério da justiça", { when: (t) => t > A.c12 + 0.5 });
  S.hero(sR.group, "placa cnj", { when: (t) => t > A.c12 + 0.6 });
  S.hero(fold, "pasta cadastro", { when: (t) => t > A.c12 + 0.75 });
  S.hero(gv.group, "martelo", { when: (t) => t > gAt + 0.4 });
  S.solid(desk.group, "mesa");
  const box = envelope([sL.group, sR.group, fold, gv.group], anim, A.c12 + 0.75, A.c13);
  return (t) => { anim(t); let p = CAM.move(box, "truck", lin(t, A.c12, A.c13), { zone: "stage", from: [0, 0.32, 1], side: 0.28, pull: 1.0 }); p = CAM.shake(p, t, strikeAt, 0.03, 0.25); CAM.apply(p); };
});

// ============================================================ 14 · a pergunta
// Back to the kitchen table at night: the phone with the result, between PROTEGE (green) and CONDENA (red).
addScene("pergunta", A.c13, A.end, (S) => {
  const room = makeNightLivingRoom({ wallZ: -2.2, seed: 8 }); room.group.position.x = 2.3; S.backdrop(room.group);
  const desk = makeWorkDesk({ w: 2.0, d: 1.1, leather: "#2a2622" }); S.add(desk.group);
  const P = makeConsultPhone(); P.group.position.set(0, desk.top, 0.12); S.add(P.group);
  P.paint({ typed: 1, result: 1 });
  const yes = makeDeskSign("PROTEGE", { w: 0.3, h: 0.11, bg: "#1f6b3a" }); yes.group.position.set(-0.34, desk.top, 0.16); yes.group.rotation.y = 0.3; S.add(yes.group);
  const no = makeDeskSign("CONDENA", { w: 0.3, h: 0.11, bg: "#9b1c1c" }); no.group.position.set(0.34, desk.top, 0.16); no.group.rotation.y = -0.3; S.add(no.group);
  const anim = (t) => {
    room.update(t); room.light(0.6 + 0.15 * Math.sin(t * 1.4)); key.intensity = 1.4; key.color.set("#ffd9b0"); hemi.intensity = 0.3;
    popIn(yes.group, t, A.protege - 0.2, 0.35); popIn(no.group, t, A.condena - 0.2, 0.35);
    fill.position.set(0, desk.top + 0.25, 0.6); fill.color.set("#ff4a3a"); fill.intensity = 1.6;
  };
  S.hero(P.body, "celular com resultado");
  S.hero(yes.group, "placa protege", { when: (t) => t > A.protege + 0.55 }); S.hero(no.group, "placa condena", { when: (t) => t > A.condena + 0.2 });
  S.solid(desk.group, "mesa");
  // first the phone alone (push), then it opens on the two signs as they come in (orbit)
  const bA = envelope([P.body], anim, A.c13, A.protege - 0.3), bB = envelope([P.body, yes.group, no.group], anim, A.condena + 0.2, A.end);
  return (t) => {
    anim(t);
    const pa = CAM.move(bA, "push", lin(t, A.c13, A.protege), { zone: "stage", from: [-0.1, 0.28, 1], pull0: 1.25, pull: 1.05 });
    const pb = CAM.move(bB, "orbit", lin(t, A.protege, A.end), { zone: "stage", from: [0, 0.3, 1], deg: 24, pull: 1.04 });
    CAM.apply(CAM.blend(pa, pb, sm(t, A.protege - 0.35, A.protege + 0.5)));
  };
});
