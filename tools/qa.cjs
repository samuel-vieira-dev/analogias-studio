#!/usr/bin/env node
/*
 * Automatic visual QA — run after tools/build.py and BEFORE rendering.
 *
 * usage: node tools/qa.cjs videos/<slug> [--step 0.2] [--from 0] [--to <dur>] [--shots 12]
 *
 * Opens qa/harness.html (world + overlays + captions in one page), seeks every
 * `step` seconds and measures, in canvas pixels:
 *   - every visible text element tagged data-qa (overlays, sources, captions)
 *   - every registered 3D hero / 3D label (window.__qa.frame(), engine/core.js)
 * Rules (config/layout.json):
 *   texto_fora_da_area_segura   text outside the unified safe zone
 *   texto_fora_da_zona          an overlay or caption overflowing its layout zone
 *   fonte_fora_do_canto         a source/reference not in the top-right source band
 *   objeto_fora_da_area_segura  a 3D hero cut by the safe zone or behind the camera
 *   rotulo3d_fora_da_area_segura
 *   texto_sobre_animacao        HTML text or caption over a 3D hero or over registered scenery
 *   texto_sobre_rotulo3d        HTML text over a 3D label
 *   rotulo3d_sobre_objeto       a 3D label over a hero it is not attached to
 *   texto_sobre_texto           two HTML texts overlapping
 *   objetos_se_atravessando     two registered solids intersecting in 3D
 *   objeto_afundou_no_apoio     a solid sinking into the solid it rests on (restsOn)
 * Writes qa/report.json and one annotated PNG per problem group (old PNGs are removed first).
 * Exit code 0 = clean, 1 = violations, 2 = harness error.
 */
const fs = require("fs");
const path = require("path");

let chromium;
try { ({ chromium } = require("playwright")); } catch (e) {
  console.error("playwright não encontrado: rode `npm install` na raiz do repositório (ou tools/setup.sh)."); process.exit(2);
}

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
if (!args[0]) { console.error("usage: node tools/qa.cjs videos/<slug> [--step 0.2]"); process.exit(2); }
const vdir = path.resolve(ROOT, args[0]);
const opt = (name, def) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : def; };
const layout = JSON.parse(fs.readFileSync(path.join(ROOT, "config/layout.json"), "utf8"));
const video = JSON.parse(fs.readFileSync(path.join(vdir, "video.json"), "utf8"));
const step = parseFloat(opt("step", layout.qa.step_s));
const t0 = parseFloat(opt("from", 0)), t1 = parseFloat(opt("to", video.duration - 0.01));
const maxShots = parseInt(opt("shots", 12), 10);
const harness = path.join(vdir, "qa/harness.html");
const outDir = path.join(vdir, "qa");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".png")) fs.unlinkSync(path.join(outDir, f));
if (!fs.existsSync(harness)) { console.error("rode antes: python3 tools/build.py " + args[0]); process.exit(2); }

const SAFE = layout.safe, Z = layout.zones, GAP = layout.qa.text_hero_gap_px, TOL = 2, ZTOL = layout.qa.zone_tol_px ?? 4;
const inside = (r, z, tol = TOL) => r.x >= z.x - tol && r.y >= z.y - tol && r.x + r.w <= z.x + z.w + tol && r.y + r.h <= z.y + z.h + tol;
const overlap = (a, b, g = 0) => a.x < b.x + b.w + g && b.x < a.x + a.w + g && a.y < b.y + b.h + g && b.y < a.y + a.h + g;
const r1 = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) });

function rules(frame, texts) {
  const v = [];
  const heroes = (frame && frame.heroes) || [], labels = (frame && frame.labels) || [], scenery = (frame && frame.scenery) || [];
  for (const tx of texts) {
    if (!inside(tx.rect, SAFE)) v.push({ rule: "texto_fora_da_area_segura", a: tx.id, ra: tx.rect, info: tx.text });
    else if (tx.zone && Z[tx.zone] && !inside(tx.rect, Z[tx.zone], ZTOL)) v.push({ rule: "texto_fora_da_zona", a: tx.id, ra: tx.rect, info: `${tx.zone}: ${tx.text}` });
    if (tx.kind === "source") {
      const right = tx.rect.x + tx.rect.w;
      if (!inside(tx.rect, Z.source, ZTOL) || right < Z.source.x + Z.source.w - 6) v.push({ rule: "fonte_fora_do_canto", a: tx.id, ra: tx.rect, info: tx.text });
    }
    for (const h of heroes.concat(scenery)) if (overlap(tx.rect, h.rect, GAP)) v.push({ rule: "texto_sobre_animacao", a: tx.id, b: h.name, ra: tx.rect, rb: h.rect, info: tx.text });
    for (const l of labels) if (overlap(tx.rect, l.rect, 4)) v.push({ rule: "texto_sobre_rotulo3d", a: tx.id, b: l.name, ra: tx.rect, rb: l.rect, info: tx.text });
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j];
    if (a.group && a.group === b.group) continue;
    if (overlap(a.rect, b.rect, 0)) v.push({ rule: "texto_sobre_texto", a: a.id, b: b.id, ra: a.rect, rb: b.rect });
  }
  for (const h of heroes) if (h.rect.behind || !inside(h.rect, SAFE)) v.push({ rule: "objeto_fora_da_area_segura", a: h.name, ra: h.rect });
  for (const l of labels) {
    if (!inside(l.rect, SAFE)) v.push({ rule: "rotulo3d_fora_da_area_segura", a: l.name, ra: l.rect });
    for (const h of heroes) if (h.name !== l.on && overlap(l.rect, h.rect, 0)) v.push({ rule: "rotulo3d_sobre_objeto", a: l.name, b: h.name, ra: l.rect, rb: h.rect });
  }
  for (const s of (frame && frame.solids) || []) {
    if (s.kind === "afundou") v.push({ rule: "objeto_afundou_no_apoio", a: s.a, b: s.b, info: "afundou " + s.ratio + " unidades" });
    else v.push({ rule: "objetos_se_atravessando", a: s.a, b: s.b, info: "sobreposição 3D " + Math.round(s.ratio * 100) + "%" });
  }
  return v;
}

const errors = [];
async function openHarness(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("file://" + harness);
  try {
    await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 180000, polling: 250 });
    await page.evaluate(() => window.__hf.buildReady.world);
  } catch (e) {
    console.error("harness não carregou:", errors.join("\n") || e.message); await browser.close(); process.exit(2);
  }
  return page;
}

(async () => {
  const launchArgs = process.platform === "darwin" ? [] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ args: launchArgs });
  let page = await openHarness(browser);
  await page.evaluate(() => {
    window.__collectTexts = function () {
      const vis = (el) => { let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= parseFloat(cs.opacity); } return o; };
      return Array.from(document.querySelectorAll("[data-qa]")).map((el) => {
        if (vis(el) < 0.05) return null; const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null;
        const grp = el.closest(".ov, .cg"); const zone = grp ? (grp.dataset.zone || (grp.classList.contains("cg") ? "caption" : null)) : null;
        return { id: (grp && grp.id) || el.id || "?", group: grp ? grp.id : null, zone, kind: el.dataset.qa, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, text: el.textContent.trim().slice(0, 48) };
      }).filter(Boolean);
    };
  });

  const groups = new Map();
  const n = Math.floor((t1 - t0) / step + 1e-6);
  for (let i = 0; i <= n; i++) {
    const t = +(t0 + i * step).toFixed(3);
    const { frame, texts } = await page.evaluate((t) => { window.__seek(t); return { frame: window.__qa.frame(), texts: window.__collectTexts() }; }, t);
    for (const v of rules(frame, texts)) {
      const key = [v.rule, v.a, v.b || ""].join("|");
      const g = groups.get(key);
      if (g && t - g.to <= step * 1.5 + 1e-6) { g.to = t; g.frames++; }
      else if (!g) groups.set(key, { ...v, ra: v.ra && r1(v.ra), rb: v.rb && r1(v.rb), from: t, to: t, frames: 1, scene: frame && frame.scene });
      else { groups.set(key + "|" + t, { ...v, ra: v.ra && r1(v.ra), rb: v.rb && r1(v.rb), from: t, to: t, frames: 1, scene: frame && frame.scene }); }
    }
    if (i % 50 === 0) process.stdout.write(`  qa ${t.toFixed(1)}s / ${t1.toFixed(1)}s\r`);
  }
  process.stdout.write("\n");

  const list = [...groups.values()].sort((a, b) => a.from - b.from);
  // screenshots from a fresh page: after hundreds of seeks the GPU queue can stall page.screenshot
  if (list.length) { await page.close(); page = await openHarness(browser); }
  let shot = 0;
  for (const g of list) {
    if (shot >= maxShots) break;
    const file = path.join(outDir, `${String(++shot).padStart(2, "0")}-${g.rule}-${g.from.toFixed(1)}s.png`);
    await page.evaluate(({ t, ra, rb, safe, label }) => {
      window.__seek(t);
      const box = (r, c) => { const d = document.createElement("div"); d.className = "__qa_mark"; Object.assign(d.style, { position: "absolute", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px", border: `6px solid ${c}`, zIndex: 9999, boxSizing: "border-box" }); document.body.appendChild(d); };
      box({ x: safe.x, y: safe.y, w: safe.w, h: safe.h }, "rgba(0,200,255,0.8)");
      if (ra) box(ra, "#ff2bd6"); if (rb) box(rb, "#ffe600");
      const tag = document.createElement("div"); tag.className = "__qa_mark"; tag.textContent = label;
      Object.assign(tag.style, { position: "absolute", left: "20px", top: "20px", zIndex: 9999, background: "#000", color: "#fff", font: "700 30px sans-serif", padding: "8px 12px" }); document.body.appendChild(tag);
    }, { t: g.from, ra: g.ra, rb: g.rb, safe: SAFE, label: `${g.rule} · ${g.a}${g.b ? " × " + g.b : ""} · ${g.from}s` });
    await page.screenshot({ path: file, timeout: 90000 });
    await page.evaluate(() => document.querySelectorAll(".__qa_mark").forEach((e) => e.remove()));
    g.shot = path.relative(vdir, file);
  }
  await browser.close();

  const report = { video: video.slug, step, from: t0, to: t1, frames: n + 1, problems: list.length, errors, items: list };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  if (errors.length) console.log("erros de página:\n  " + errors.join("\n  "));
  if (!list.length) { console.log(`QA ok: ${n + 1} quadros verificados, nenhum problema.`); process.exit(0); }
  console.log(`QA: ${list.length} problema(s):`);
  for (const g of list) console.log(`  ${g.from.toFixed(1)}–${g.to.toFixed(1)}s  ${g.rule}  ${g.a}${g.b ? " × " + g.b : ""}${g.info ? "  (" + g.info + ")" : ""}${g.shot ? "  → " + g.shot : ""}`);
  process.exit(1);
})();
