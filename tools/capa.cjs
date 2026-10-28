#!/usr/bin/env node
/*
 * Post cover: one frame of the hook (the video's "thumbnail") with a strong title in the headline
 * band, taken from qa/harness.html — no new render.
 *
 * usage: node tools/capa.cjs videos/<slug> [--t 2.4] [--title "LINHA 1\nLINHA 2"]
 *
 * video.json → post (all optional):
 *   title   cover title (\n for 2 lines). Default: the title shown during the hook scene, else the
 *           first title of the video.
 *   t       time of the frame. Default: inside the first scene (the hook), the stretch where the most
 *           heroes are on screen at their biggest; the middle of it.
 *   media   id in video.json → media for the person photo card, or false for none. Default: the first
 *           photo overlay with a name (the kit's person card).
 * The video's own text is hidden. The camera keeps its angle and moves until the heroes fill the
 * cover stage under the title (config/layout.json → cover.stage; window.__qa.reframe, engine/core.js):
 * a hook shot on stage-tall no longer reaches into the title, a small subject gets big.
 * Checks that the title fits the centre crop the profile grid shows (cover.grid, 3:4).
 * Writes videos/<slug>/out/<slug>-capa.jpg (1080x1920) and prints a JSON summary.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
if (!args[0]) { console.error("usage: node tools/capa.cjs videos/<slug> [--t 2.4] [--title \"...\"]"); process.exit(2); }
const vdir = path.resolve(ROOT, args[0]);
const opt = (n) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : undefined; };
const video = JSON.parse(fs.readFileSync(path.join(vdir, "video.json"), "utf8"));
const layout = JSON.parse(fs.readFileSync(path.join(ROOT, "config/layout.json"), "utf8"));
const channel = fs.readFileSync(path.join(ROOT, "channel.yaml"), "utf8");
const style = (k) => channel.match(new RegExp(`^\\s+${k}:\\s*"([^"]+)"`, "m"))[1];
const post = video.post || {};
const hook = video.scenes[0];
const harness = path.join(vdir, "qa/harness.html");
if (!fs.existsSync(harness)) { console.error(`faltando ${path.relative(ROOT, harness)}: rode python3 tools/build.py ${args[0]}`); process.exit(2); }

const TITLE_KINDS = ["title", "text", "question"];
const overlays = video.overlays || [];
const title = (opt("title") || post.title || (overlays.find((o) => TITLE_KINDS.includes(o.kind) && o.from < hook.to) || overlays.find((o) => o.kind === "title") || {}).text || "").replace(/\\n/g, "\n");
if (!title) { console.error("sem título para a capa: defina video.json → post.title"); process.exit(2); }

// Person photo: explicit id, false, or the first named photo card.
let photo = null;
const card = (id) => overlays.find((o) => o.kind === "photo" && o.media === id && o.name) || {};
const pid = post.media === false ? null : post.media || (overlays.find((o) => o.kind === "photo" && o.name) || {}).media;
if (pid) {
  const m = (video.media || {})[pid];
  if (!m) { console.error(`video.json → post.media: '${pid}' não está em video.json → media`); process.exit(2); }
  const file = path.join(vdir, m.file);
  if (fs.existsSync(file)) photo = { id: pid, src: "file://" + file, credit: m.credit, focus: m.focus || [0.5, 0.5], name: card(pid).name, role: card(pid).role };
  else console.error(`ATENÇÃO: foto '${pid}' não encontrada (${m.file}); capa sem foto. Baixe de ${m.url}`);
}

const area = (r) => Math.max(0, Math.min(1080, r.x + r.w) - Math.max(0, r.x)) * Math.max(0, Math.min(1920, r.y + r.h) - Math.max(0, r.y));
const COVER = layout.cover;

(async () => {
  const launchArgs = process.platform === "darwin" ? [] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ args: launchArgs });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + harness);
  await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 180000, polling: 250 });

  // The hook's best moment: most heroes on screen, at (almost) their biggest; the middle of that stretch.
  let t = opt("t") !== undefined ? parseFloat(opt("t")) : post.t;
  if (t === undefined) {
    const scan = [];
    for (let x = hook.from + 0.3; x <= hook.to - 0.3 + 1e-6; x = +(x + 0.1).toFixed(3)) {
      const f = await page.evaluate((x) => { window.__seek(x); return window.__qa.frame(); }, x);
      const hs = f ? f.heroes.filter((h) => !h.rect.behind) : [];
      scan.push({ t: x, n: hs.length, a: hs.reduce((s, h) => s + area(h.rect), 0) });
    }
    const n = Math.max(...scan.map((s) => s.n)), a = Math.max(...scan.filter((s) => s.n === n).map((s) => s.a));
    const best = scan.filter((s) => s.n === n && s.a >= 0.95 * a);
    t = best.length ? best[Math.floor(best.length / 2)].t : (hook.from + hook.to) / 2;
  }

  await page.evaluate((t) => window.__seek(t), t);
  if (!(await page.evaluate(() => typeof window.__qa.reframe === "function"))) { console.error(`harness anterior à capa (sem __qa.reframe): rode python3 tools/build.py ${args[0]} e repita`); process.exit(2); }
  const f = await page.evaluate((z) => window.__qa.reframe(z) || window.__qa.frame(), COVER.stage);

  const res = await page.evaluate(async ({ L, title, photo, st }) => {
    for (const id of ["ov-root", "cap-root"]) document.getElementById(id).style.display = "none"; // the video's own text
    const H = L.zones.headline, Z = L.cover.stage;
    const el = (tag, css, parent) => { const e = document.createElement(tag); Object.assign(e.style, css); (parent || document.body).appendChild(e); return e; };
    await document.fonts.load("900 100px Inter"); await document.fonts.load("600 100px Inter");
    const root = el("div", { position: "absolute", left: "0", top: "0", width: "1080px", height: "1920px", zIndex: 100, fontFamily: "'Inter', sans-serif" });
    let cardEl = null;
    if (photo) {
      document.getElementById("w-canvas").style.filter = "blur(10px) brightness(0.5)"; // the 3D stays as a soft backdrop
      const img = new Image(); img.src = photo.src; await img.decode();
      const a = img.naturalWidth / img.naturalHeight, shape = a > 1.15 ? 4 / 3 : a < 0.87 ? 3 / 4 : 1;
      const capH = (photo.name || photo.role ? 112 : 0) + 40, w = Math.round(Math.min(Z.w - 120, (Z.h - 40 - capH - 32) * shape)), h = Math.round(w / shape);
      cardEl = el("div", { position: "absolute", left: Z.x + (Z.w - w - 32) / 2 + "px", top: Z.y + (Z.h - h - capH - 32) / 2 + "px", width: w + "px", padding: "16px 16px 0",
        background: "#f4efe6", borderRadius: "20px", boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(0,0,0,0.15)", transform: "rotate(-2.2deg)" }, root);
      const win = el("div", { width: w + "px", height: h + "px", overflow: "hidden", borderRadius: "12px", background: "#000" }, cardEl);
      Object.assign(img.style, { display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: `${photo.focus[0] * 100}% ${photo.focus[1] * 100}%`, transform: "scale(1.08)", transformOrigin: `${photo.focus[0] * 100}% ${photo.focus[1] * 100}%` });
      win.appendChild(img);
      if (photo.name || photo.role) {
        const cap = el("div", { margin: "12px 0 0", padding: "14px 6px 4px 16px", borderLeft: `8px solid ${st.laranja}` }, cardEl);
        if (photo.name) el("div", { fontWeight: 900, fontSize: "46px", lineHeight: 1.05, color: st.fundo, letterSpacing: "-0.02em", whiteSpace: "nowrap", width: "max-content" }, cap).textContent = photo.name;
        if (photo.role) el("div", { fontWeight: 600, fontSize: "28px", lineHeight: 1.3, color: "#6b5a4e", whiteSpace: "nowrap", width: "max-content" }, cap).textContent = photo.role;
        for (const e of cap.children) { let s = parseFloat(e.style.fontSize); while (e.getBoundingClientRect().width > w - 30 && s > 20) { s -= 2; e.style.fontSize = s + "px"; } }
      }
      el("div", { padding: "6px 4px 12px", textAlign: "right", fontWeight: 600, fontSize: "22px", color: "#6b5a4e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, cardEl).textContent = "Foto: " + photo.credit;
    }
    const band = el("div", { position: "absolute", left: H.x + "px", top: H.y + "px", width: H.w + "px", height: H.h + "px", display: "flex", alignItems: "center", justifyContent: "center" }, root);
    const txt = el("div", { fontWeight: 900, lineHeight: 1.0, color: st.laranja, letterSpacing: "-0.03em", textAlign: "center", whiteSpace: "pre", textShadow: "0 10px 40px rgba(0,0,0,0.85), 0 3px 10px rgba(0,0,0,0.6)" }, band);
    txt.textContent = title;
    await document.fonts.ready;
    let s = 160; txt.style.fontSize = s + "px";
    while (s > 60) { const r = txt.getBoundingClientRect(); if (r.width <= H.w && r.height <= H.h) break; s -= 2; txt.style.fontSize = s + "px"; }
    const rect = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    return { title: rect(txt), font: s, card: cardEl && rect(cardEl) };
  }, { L: layout, title, photo, st: { laranja: style("laranja"), fundo: style("fundo") } });

  const problems = [], G = COVER.grid, tol = layout.qa.zone_tol_px;
  const inGrid = (r) => r.x >= G.x && r.x + r.w <= G.x + G.w && r.y >= G.y + 8 && r.y + r.h <= G.y + G.h - 8;
  if (!inGrid(res.title)) problems.push(`título fora do recorte 3:4 do perfil (y ${Math.round(res.title.y)}–${Math.round(res.title.y + res.title.h)}; cabe em ${G.y}–${G.y + G.h})`);
  if (res.card && !inGrid(res.card)) problems.push("cartão da foto fora do recorte 3:4 do perfil");
  if (f && f.heroes.concat(f.labels).some((h) => h.rect.y < COVER.stage.y - tol)) problems.push("o 3D invade a faixa do título: escolha outro post.t");
  for (const h of (f ? f.heroes : [])) if (area(h.rect) < 0.9 * h.rect.w * h.rect.h) problems.push(`'${h.name}' cortado na capa: escolha outro post.t`);

  const out = path.join(vdir, "out", `${video.slug}-capa.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: "jpeg", quality: 90, timeout: 90000 });
  await browser.close();
  console.log(JSON.stringify({ capa: out.startsWith(ROOT + path.sep) ? path.relative(ROOT, out) : out, t, titulo: title, fonte_px: res.font, foto: photo && photo.id, heroes: f ? f.heroes.map((h) => h.name) : [] }));
  if (problems.length) { console.error("ATENÇÃO: " + problems.join("; ")); process.exit(1); }
})();
