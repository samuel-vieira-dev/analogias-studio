#!/usr/bin/env node
/*
 * Quick look without rendering: screenshots of chosen moments + one contact sheet.
 *
 * usage: node tools/preview.cjs videos/<slug> [t1 t2 ...] [--every 3] [--cols 6] [--safe]
 *   no times  → one frame every 3 s (or --every N)
 *   --safe    → draws the safe zone and the layout zones on top (for layout review)
 * Writes videos/<slug>/preview/<t>.png and preview/sheet.jpg.
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
let times = args.slice(1).filter((a, i, all) => !a.startsWith("--") && !(all[i - 1] || "").startsWith("--every") && !(all[i - 1] || "").startsWith("--cols")).map(Number).filter((x) => !isNaN(x));
if (!times.length) { const e = parseFloat(opt("every", 3)); for (let t = 0.5; t < video.duration; t += e) times.push(+t.toFixed(2)); }
const cols = parseInt(opt("cols", 6), 10);
const out = path.join(vdir, "preview");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

(async () => {
  const launchArgs = process.platform === "darwin" ? [] : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
  const browser = await chromium.launch({ args: launchArgs });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.join(vdir, "qa/harness.html"));
  await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 180000, polling: 250 });
  if (flag("safe")) {
    await page.evaluate((L) => {
      const add = (r, c, label) => { const d = document.createElement("div"); Object.assign(d.style, { position: "absolute", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px", border: `3px dashed ${c}`, zIndex: 9999, boxSizing: "border-box", font: "600 22px sans-serif", color: c }); d.textContent = label; document.body.appendChild(d); };
      add(L.safe, "#00c8ff", "área segura");
      for (const [k, z] of Object.entries(L.zones)) if (k !== "stage-tall") add(z, "#ffe600", k);
    }, layout);
  }
  const files = [];
  for (const t of times) {
    await page.evaluate((t) => window.__seek(t), t);
    const f = path.join(out, `${t.toFixed(2).padStart(6, "0")}.png`);
    await page.screenshot({ path: f, timeout: 90000 }); files.push([t, f]);
  }
  const W = 270, H = 480, rows = Math.ceil(files.length / cols);
  const sheet = await browser.newPage({ viewport: { width: cols * (W + 6), height: rows * (H + 30) } });
  const cells = files.map(([t, f]) => `<div style="display:inline-block;margin:0 3px;text-align:center;font:600 18px/26px sans-serif;color:#fff"><img src="${path.basename(f)}" width="${W}" height="${H}" style="display:block"/>${t.toFixed(1)} s</div>`).join("");
  const html = path.join(out, "sheet.html"); // a file page, so the file:// images are allowed to load
  fs.writeFileSync(html, `<html><body style="margin:0;background:#111;line-height:0">${cells}</body></html>`);
  await sheet.goto("file://" + html); await sheet.waitForLoadState("load");
  await sheet.screenshot({ path: path.join(out, "sheet.jpg"), type: "jpeg", quality: 82, fullPage: true });
  await browser.close();
  console.log(`prévia: ${files.length} quadros → ${path.relative(ROOT, path.join(out, "sheet.jpg"))}`);
})();
