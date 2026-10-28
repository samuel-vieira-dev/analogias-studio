// ============================================================================
// props/media.js · real photos in the 3D world: photo print (polaroid), cork evidence board,
//                  red string, photo frame on a pedestal
// Photos come from video.json → media (tools/build.py inlines them as MEDIA[id] = { src, w, h,
// focus }). Every photo mesh is tagged for the QA (credit on screen, not stretched past its pixels).
// ============================================================================

// Decoded images, one THREE texture source per media id (loaded before any scene is built).
const PHOTO = {};
for (const [id, m] of Object.entries(MEDIA)) {
  const img = new Image(); img.src = m.src; await img.decode();
  PHOTO[id] = { img, w: img.naturalWidth, h: img.naturalHeight, focus: m.focus || [0.5, 0.5] };
}

// Crops a photo texture to a window of aspect `aspect` (w/h), "cover" style, zoomed by `zoom`
// around the focus point (fx, fy from the top-left, 0..1): faces stay in the window.
function photoWindow(tex, ph, aspect, zoom = 1, focus = ph.focus) {
  const ia = ph.w / ph.h;
  let rx = 1, ry = 1; if (ia > aspect) rx = aspect / ia; else ry = ia / aspect;
  rx /= zoom; ry /= zoom; tex.repeat.set(rx, ry);
  tex.offset.set(clamp(focus[0] - rx / 2, 0, 1 - rx), clamp(1 - focus[1] - ry / 2, 0, 1 - ry));
}
// The photo itself: an unlit plane (true colours), w x h world units, facing +z.
// API: { mesh, zoom(k) } — zoom(1) is the cover crop, zoom(1.15) a 15% push-in (Ken Burns).
function makePhotoPlane(id, w, h) {
  const ph = PHOTO[id]; if (!ph) throw new Error(`foto "${id}" não está em video.json → media`);
  const tex = new THREE.Texture(ph.img); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false }));
  mesh.userData.photo = { id, imgH: ph.h };
  const zoom = (k) => photoWindow(tex, ph, w / h, Math.max(1, k));
  zoom(1);
  return { mesh, zoom };
}
// Aspect for a photo: "retrato" 3:4, "paisagem" 4:3, "quadrado" 1:1, or from the image itself.
function photoAspect(id, shape) {
  if (shape === "retrato") return 3 / 4; if (shape === "paisagem") return 4 / 3; if (shape === "quadrado") return 1;
  const ph = PHOTO[id]; return ph.w / ph.h > 1.15 ? 4 / 3 : ph.w / ph.h < 0.87 ? 3 / 4 : 1;
}

// Red push pin (head + needle). Origin: the point where the needle enters the surface; +z out.
function makePin(color = RED) {
  const g = new THREE.Group();
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), mat("#c8c8c8", { metalness: 0.8, roughness: 0.3 })); needle.rotation.x = Math.PI / 2; needle.position.z = 0.04; g.add(needle);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.06, 20), mat(color, { roughness: 0.35 })); body.rotation.x = Math.PI / 2; body.position.z = 0.1; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), mat(color, { roughness: 0.3 })); head.position.z = 0.16; head.scale.z = 0.7; g.add(head);
  return g;
}

// Photo print (polaroid): paper with a thicker bottom border, the photo, an optional caption printed
// on the bottom border and a pin at the top. Origin: centre of the paper's back face; faces +z.
// API: { group, photo, pin, w, h, zoom(k), pinTop } — h = paper height; pinTop = pin point (local).
function makePhotoPrint(id, { w = 1.3, shape, caption = null, pin = true, paper = "#f4efe6" } = {}) {
  const g = new THREE.Group();
  const b = w * 0.06, pw = w - 2 * b, phh = pw / photoAspect(id, shape), bottom = caption ? w * 0.24 : b * 2.2, h = b + phh + bottom;
  const sheet = new THREE.Mesh(rbox(w, h, 0.02, 0.008), mat(paper, { roughness: 0.9 })); sheet.position.z = 0.01; g.add(sheet);
  const p = makePhotoPlane(id, pw, phh); p.mesh.position.set(0, h / 2 - b - phh / 2, 0.0215); g.add(p.mesh);
  if (caption) { const c = makePlate(caption, pw * 0.92, bottom * 0.66, { bg: paper, fg: "#1c1410", font: "900 160px Inter", depth: 0.004 }); c.position.set(0, -h / 2 + bottom / 2, 0.022); g.add(c); }
  let pinObj = null; const pinTop = new V3(0, h / 2 - b * 0.55, 0.02);
  if (pin) { pinObj = makePin(); pinObj.position.copy(pinTop); g.add(pinObj); }
  return { group: g, photo: p.mesh, pin: pinObj, w, h, zoom: p.zoom, pinTop };
}

// Cork board on two feet, dark wooden frame. Origin: floor, centre. The cork face is at z = face.
// API: { group, w, h, face, point(u, v) } — point(u, v) with u, v in -1..1 gives the local position
// on the cork face (u left→right, v bottom→top), where prints and string ends go.
function corkTex() {
  const c = makeCanvas(1024, 1024), x = c.getContext("2d"), r = mulberry32(7);
  x.fillStyle = "#7a5636"; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) { const v = r(); x.fillStyle = v < 0.5 ? `rgba(40,24,12,${0.12 + r() * 0.25})` : `rgba(196,150,100,${0.08 + r() * 0.2})`; const s = 1 + r() * 4; x.fillRect(r() * 1024, r() * 1024, s, s * (0.6 + r())); }
  const t = texFrom(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function makeCorkBoard({ w = 6.4, h = 4.2, lift = 0.5 } = {}) {
  const g = new THREE.Group(), d = 0.12, fr = 0.16, wood = mat("#3a2416", { roughness: 0.7 });
  const tex = corkTex(); tex.repeat.set(w / 3, h / 3);
  const cork = new THREE.Mesh(rbox(w, h, d, 0.02), mat("#ffffff", { map: tex, roughness: 0.95 })); cork.position.set(0, lift + h / 2, 0); g.add(cork);
  for (const [bw, bh, x, y] of [[w + 2 * fr, fr, 0, lift + h + fr / 2], [w + 2 * fr, fr, 0, lift - fr / 2], [fr, h, -w / 2 - fr / 2, lift + h / 2], [fr, h, w / 2 + fr / 2, lift + h / 2]]) {
    const bar = new THREE.Mesh(rbox(bw, bh, d + 0.06, 0.03), wood); bar.position.set(x, y, 0.01); g.add(bar);
  }
  for (const x of [-w * 0.36, w * 0.36]) {
    const leg = new THREE.Mesh(rbox(0.14, lift, 0.14, 0.03), wood); leg.position.set(x, lift / 2 - fr / 2, -0.02); g.add(leg);
    const foot = new THREE.Mesh(rbox(0.16, 0.08, 0.9, 0.03), wood); foot.position.set(x, 0.04, 0); g.add(foot);
  }
  g.add(contactShadow(w + 1.2, 1.6));
  const face = d / 2;
  return { group: g, w, h, face, point: (u, v) => new V3((u * w) / 2, lift + h / 2 + (v * h) / 2, face) };
}

// Red string between two points (local to the same parent), sagging a little, drawn from a to b.
// API: { mesh, setProgress(k) } — k 0..1 draws the string progressively.
function makeString(a, b, { sag = 0.18, color = RED, r = 0.014 } = {}) {
  const mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= sag; mid.z += 0.04;
  const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()), tub = 48, rad = 6;
  const geo = new THREE.TubeGeometry(curve, tub, r, rad, false);
  const mesh = new THREE.Mesh(geo, mat(color, { roughness: 0.6 }));
  const setProgress = (k) => { const n = Math.floor(clamp(k) * tub); mesh.visible = n > 0; geo.setDrawRange(0, n * rad * 6); };
  setProgress(1);
  return { mesh, setProgress };
}

// Photo frame standing on a pedestal with a brass name plate. Origin: floor, centre.
// API: { group, frame, photo, plate, zoom(k), top } — `frame` (the tilted picture) can spin in.
function makePhotoFrame(id, { w = 1.8, shape, name = null, wood = "#1d1410", gold = "#c9a45a" } = {}) {
  const g = new THREE.Group(), fr = w * 0.07, ma = w * 0.06;
  const ow = w, iw = ow - 2 * fr - 2 * ma, ih = iw / photoAspect(id, shape), oh = ih + 2 * fr + 2 * ma;
  const baseH = 0.32, baseW = ow * 0.7;
  const base = new THREE.Mesh(rbox(baseW, baseH, 0.7, 0.04), mat("#2a1b12", { roughness: 0.6 })); base.position.y = baseH / 2; g.add(base);
  let plate = null;
  if (name) { plate = makePlate(name, baseW * 0.86, baseH * 0.56, { bg: gold, fg: "#1c1410" }); plate.position.set(0, baseH / 2, 0.351); g.add(plate); }
  const frame = new THREE.Group(); frame.position.set(0, baseH, -0.05); frame.rotation.x = -0.08; g.add(frame);
  const wm = mat(wood, { roughness: 0.45 });
  for (const [bw, bh, x, y] of [[ow, fr, 0, oh - fr / 2], [ow, fr, 0, fr / 2], [fr, oh - 2 * fr, -ow / 2 + fr / 2, oh / 2], [fr, oh - 2 * fr, ow / 2 - fr / 2, oh / 2]]) {
    const bar = new THREE.Mesh(rbox(bw, bh, 0.1, 0.02), wm); bar.position.set(x, y, 0); frame.add(bar);
  }
  const lip = new THREE.Mesh(new THREE.BoxGeometry(ow - 2 * fr + 0.02, oh - 2 * fr + 0.02, 0.02), mat(gold, { metalness: 0.7, roughness: 0.35 })); lip.position.set(0, oh / 2, 0.005); frame.add(lip);
  const passe = new THREE.Mesh(new THREE.BoxGeometry(ow - 2 * fr - 0.03, oh - 2 * fr - 0.03, 0.02), mat("#f1e9dc", { roughness: 0.95 })); passe.position.set(0, oh / 2, 0.012); frame.add(passe);
  const p = makePhotoPlane(id, iw, ih); p.mesh.position.set(0, oh / 2, 0.024); frame.add(p.mesh);
  g.add(contactShadow(ow + 0.8, 1.4));
  return { group: g, frame, photo: p.mesh, plate, zoom: p.zoom, top: baseH + oh };
}

// Pure-time animation for a print landing on a board: it flies in from `from` (offset, local units),
// spinning, lands at its rest pose at `at + d`, then the pin pops in. Hidden before `at`.
// rest = { pos: V3, rotZ } — the print's place on the board.
function dropPrint(pr, t, at, rest, { d = 0.5, from = [0.4, 1.6, 2.2], spin = 0.5 } = {}) {
  const k = eOut(lin(t, at, at + d)), settle = Math.sin(clamp((t - at - d) / 0.35) * Math.PI) * 0.04 * (t > at + d ? 1 : 0);
  pr.group.visible = t >= at;
  pr.group.position.set(rest.pos.x + from[0] * (1 - k), rest.pos.y + from[1] * (1 - k), rest.pos.z + from[2] * (1 - k));
  pr.group.rotation.set(-0.5 * (1 - k), 0.3 * (1 - k), rest.rotZ + spin * (1 - k) + settle);
  if (pr.pin) { const s = pop(t, at + d - 0.05, 0.3); pr.pin.visible = s > 0.01; pr.pin.scale.setScalar(Math.max(0.0001, s)); }
}
