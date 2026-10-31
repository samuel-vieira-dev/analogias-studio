#!/usr/bin/env node
/*
 * Quick look without rendering: contact sheets of the video and a blind sheet of every object.
 *
 * usage: node tools/preview.cjs videos/<slug> [t1 t2 ...] [--every 3] [--cols 6] [--safe]
 *   no times     → one frame per shot: every registered hero at the middle of the time it is the
 *                  subject (S.hero `when`), every cut, and fillers so no gap passes 2.5 s.
 *                  A shot that lasts one second still gets its own frame (the Lula house roof
 *                  fell between the old fixed 3 s samples).
 *   --every N    → one frame every N s instead (old behaviour)
 *   --safe       → draws the safe zone and the layout zones on top (for layout review)
 * Writes videos/<slug>/preview/<t>.png, preview/sheet-NN.jpg (24 frames per page, labelled with
 * time and heroes) and, in shot mode, preview/objetos-NN.jpg + objetos.json: each hero cropped
 * from its frame, numbered only — the blind review names what it sees before reading the key.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
if (!args[0]) { console.error("usage: node tools/preview.cjs videos/<slug> [t ...] [--every 3] [--safe]"); process.exit(2); }
const vdir = path.resolve(ROOT, args[0]);
const flag = (n) => args.includes("--" + n);
const opt = (n, d) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : d; };
const video = JSON.parse(fs.readFileSync(path.join(vdir, "video.json"), "utf8"));
const layout = JSON.parse(fs.readFileSync(path.join(ROOT, "config/layout.json"), "utf8"));
const given = args.slice(1).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] || "").startsWith("--every") && !(all[i - 1] || "").startsWith("--cols")).map(Number).filter((x) => !isNaN(x));
const cols = parseInt(opt("cols", 6), 10);
const out = path.join(vdir, "preview");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "obj"), { recursive: true });
const r2 = (x) => Math.round(x * 20) / 20;

// Shot mode: scan the registry, then pick one moment per hero, per cut, and fillers.
async function shotTimes(page) {
  const dur = video.duration, scan = 0.2, runs = new Map();
  for (let t = 0; t <= dur - 0.01; t = +(t + scan).toFixed(3)) {
    const f = await page.evaluate((t) => { window.__seek(t); const f = window.__qa.frame(); return f && { scene: f.scene, heroes: f.heroes.map((h) => h.name), photos: f.photos.map((p) => p.id) }; }, t);
    if (!f) continue;
    for (const name of f.heroes.concat(f.photos.map((p) => "foto:" + p))) {
      const key = f.scene + "|" + name, list = runs.get(key) || [];
      const last = list[list.length - 1];
      if (last && t - last.to <= scan * 1.5) last.to = t; else list.push({ from: t, to: t });
      runs.set(key, list);
    }
  }
  const picks = [];
  for (const [key, list] of runs) {
    const best = list.reduce((a, b) => (b.to - b.from > a.to - a.from ? b : a));
    const [scene, hero] = key.split("|");
    picks.push({ t: r2((best.from + best.to) / 2), heroes: [{ scene, hero }] });
  }
  picks.push({ t: 0.5, heroes: [] });
  for (const c of video.cuts || []) if (c + 0.4 < dur) picks.push({ t: r2(c + 0.4), heroes: [] });
  picks.sort((a, b) => a.t - b.t);
  const merged = [];
  for (const p of picks) { const m = merged[merged.length - 1]; if (m && p.t - m.t < 0.25) m.heroes.push(...p.heroes); else merged.push({ t: p.t, heroes: [...p.heroes] }); }
  const filled = [];
  for (let i = 0; i < merged.length; i++) {
    filled.push(merged[i]);
    const next = i + 1 < merged.length ? merged[i + 1].t : dur;
    const gap = next - merged[i].t, k = Math.floor(gap / 2.5);
    for (let j = 1; j <= k; j++) { const t = r2(merged[i].t + (gap * j) / (k + 1)); if (t < dur - 0.05) filled.push({ t, heroes: [] }); }
  }
  return filled;
}

async function sheet(browser, cells, { w, h, cols, rows, name }) {
  const pages = [];
  for (let p = 0; p * cols * rows < cells.length; p++) {
    const part = cells.slice(p * cols * rows, (p + 1) * cols * rows), nrows = Math.ceil(part.length / cols);
    const pg = await browser.newPage({ viewport: { width: cols * (w + 6), height: nrows * (h + 34) } });
    const html = path.join(out, `${name}-${String(p + 1).padStart(2, "0")}.html`); // a file page, so the file:// images load
    fs.writeFileSync(html, `<html><body style="margin:0;background:#111;line-height:0">${part.map(([f, label]) =>
      `<div style="display:inline-block;margin:0 3px;width:${w}px;text-align:center;font:600 17px/30px sans-serif;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><img src="${path.relative(out, f)}" style="display:block;width:${w}px;height:${h}px;object-fit:contain;background:#000"/>${label}</div>`).join("")}</body></html>`);
    await pg.goto("file://" + html); await pg.waitForLoadState("load");
    const jpg = path.join(out, `${name}-${String(p + 1).padStart(2, "0")}.jpg`);
    await pg.screenshot({ path: jpg, type: "jpeg", quality: 82, fullPage: true }); await pg.close();
    pages.push(path.relative(ROOT, jpg));
  }
  return pages;
}

(async () => {
  // Mac: the GPU through Metal (headless Chromium falls back to SwiftShader on the CPU without these flags,
  // 10x+ slower with shadows and physical materials); Linux/cloud: SwiftShader.
  const launchArgs = process.platform === "darwin" ? ["--use-angle=metal", "--ignore-gpu-blocklist"] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ args: launchArgs });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.join(vdir, "qa/harness.html"));
  await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 180000, polling: 250 });

  let samples;
  if (given.length) samples = given.map((t) => ({ t, heroes: [] }));
  else if (args.includes("--every")) { samples = []; const e = parseFloat(opt("every", 3)); for (let t = 0.5; t < video.duration; t += e) samples.push({ t: +t.toFixed(2), heroes: [] }); }
  else samples = await shotTimes(page);

  if (flag("safe")) {
    await page.evaluate((L) => {
      const add = (r, c, label) => { const d = document.createElement("div"); Object.assign(d.style, { position: "absolute", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px", border: `3px dashed ${c}`, zIndex: 9999, boxSizing: "border-box", font: "600 22px sans-serif", color: c }); d.textContent = label; document.body.appendChild(d); };
      add(L.safe, "#00c8ff", "área segura");
      for (const [k, z] of Object.entries(L.zones)) if (k !== "stage-tall") add(z, "#ffe600", k);
    }, layout);
  }

  const frames = [], objects = [];
  for (const s of samples) {
    const f = await page.evaluate((t) => { window.__seek(t); return window.__qa.frame(); }, s.t);
    const file = path.join(out, `${s.t.toFixed(2).padStart(6, "0")}.png`);
    await page.screenshot({ path: file, timeout: 90000 });
    const names = [...new Set(s.heroes.map((h) => h.hero))];
    frames.push([file, `${s.t.toFixed(1)} s${f ? " · " + f.scene : ""}${names.length ? " · " + names.join(", ") : ""}`]);
    for (const h of s.heroes) {
      if (h.hero.startsWith("foto:")) continue; // a photo is reviewed inside its hero (print, frame)
      const r = (f.heroes.find((x) => x.name === h.hero) || {}).rect;
      if (!r) continue;
      const pad = 40, x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad);
      const clip = { x, y, width: Math.min(1080, r.x + r.w + pad) - x, height: Math.min(1920, r.y + r.h + pad) - y };
      if (clip.width < 8 || clip.height < 8) continue;
      const n = objects.length + 1, crop = path.join(out, "obj", `${String(n).padStart(2, "0")}.png`);
      await page.screenshot({ path: crop, clip, timeout: 90000 });
      objects.push({ n, t: s.t, scene: h.scene, hero: h.hero, file: crop });
    }
  }
  const sheets = await sheet(browser, frames, { w: 270, h: 480, cols, rows: 4, name: "sheet" });
  let objSheets = [];
  if (objects.length) {
    objSheets = await sheet(browser, objects.map((o) => [o.file, `#${o.n}`]), { w: 320, h: 320, cols: 5, rows: 4, name: "objetos" });
    fs.writeFileSync(path.join(out, "objetos.json"), JSON.stringify(objects.map(({ n, t, scene, hero }) => ({ n, t, scene, hero })), null, 2));
  }
  await browser.close();
  console.log(`prévia: ${frames.length} quadros → ${sheets.join(", ")}`);
  if (objSheets.length) console.log(`objetos: ${objects.length} recortes numerados → ${objSheets.join(", ")} (gabarito: ${path.relative(ROOT, path.join(out, "objetos.json"))})`);
})();
