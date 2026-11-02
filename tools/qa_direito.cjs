/*
 * QA visual do Estilo Explicando Direito (2D). Chamado por tools/qa.cjs quando video.json → estilo é
 * "explicando-direito" (mesma linha de comando: node tools/qa.cjs videos/<slug> [--step 0.2] [--from] [--to]).
 * Mede a página qa/harness.html a cada `step` segundos (window.__qa.frame(), engine2d/direito.js):
 *   texto_fora_da_area_segura   linha de texto fora da área segura
 *   texto_fora_da_zona          bloco de texto fora da faixa headline (texto grande demais: encurte o bloco)
 *   fonte_fora_do_canto         crédito/fonte fora do canto superior direito
 *   visual_fora_da_area_segura  elemento do palco (foto, cartão, gráfico) fora da área segura
 *                               (a foto que vaza na tela inteira, "foto-cheia", é fundo e fica de fora)
 *   texto_sobre_visual          texto em cima de um elemento do palco
 *   quadro_vazio                palco sem nenhum elemento
 *   foto_sem_credito            foto na tela sem "Foto: <crédito>" visível
 *   foto_em_baixa_resolucao     foto esticada além dos pixels que ela tem
 * Os que só valem quando duram (config/layout.json → qa.*_s) ignoram o meio de uma entrada ou de um corte.
 * Grava qa/report.json (mesmo formato do QA 3D: tools/render.sh só renderiza com ele limpo) e um PNG por problema.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

module.exports = async function qaDireito({ vdir, video, layout, step, t0, t1, maxShots, outDir }) {
  const SAFE = layout.safe, Z = layout.zones, QA = layout.qa, TOL = 2, ZTOL = QA.zone_tol_px ?? 4, GAP = QA.text_hero_gap_px;
  const MIN_S = { quadro_vazio: QA.empty_s, foto_sem_credito: QA.photo_credit_s, foto_em_baixa_resolucao: QA.photo_credit_s, visual_fora_da_area_segura: 0.3, texto_sobre_visual: 0.3 };
  const inside = (r, z, tol = TOL) => r.x >= z.x - tol && r.y >= z.y - tol && r.x + r.w <= z.x + z.w + tol && r.y + r.h <= z.y + z.h + tol;
  const overlap = (a, b, g = 0) => a.x < b.x + b.w + g && b.x < a.x + a.w + g && a.y < b.y + b.h + g && b.y < a.y + a.h + g;
  const r1 = (r) => r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) };
  const MEDIA = video.media || {};

  function rules(f) {
    const v = [];
    for (const tx of f.texts) {
      if (!inside(tx.rect, SAFE)) v.push({ rule: "texto_fora_da_area_segura", a: tx.text, ra: tx.rect });
      else if (!inside(tx.rect, Z.headline, ZTOL)) v.push({ rule: "texto_fora_da_zona", a: tx.text, ra: tx.rect, info: `headline, ${Math.round(tx.px)} px` });
      for (const h of f.heroes) if (!h.bleed && overlap(tx.rect, h.rect, GAP)) v.push({ rule: "texto_sobre_visual", a: tx.text, b: h.name, ra: tx.rect, rb: h.rect });
    }
    for (const s of f.sources) if (!inside(s.rect, Z.source, ZTOL) || s.rect.x + s.rect.w < Z.source.x + Z.source.w - 6) v.push({ rule: "fonte_fora_do_canto", a: s.text, ra: s.rect });
    for (const h of f.heroes) if (!h.bleed && !inside(h.rect, SAFE, 4)) v.push({ rule: "visual_fora_da_area_segura", a: h.name, ra: h.rect });
    if (!f.heroes.length) v.push({ rule: "quadro_vazio", a: f.scene });
    const credits = f.sources.map((s) => s.text).join(" ");
    for (const p of f.photos) {
      const c = (MEDIA[p.id] || {}).credit;
      if (!c || !credits.includes(c)) v.push({ rule: "foto_sem_credito", a: p.id, ra: p.rect, info: c ? `falta "Foto: ${c}"` : "foto sem credit no video.json" });
      if (p.upscale > QA.photo_max_upscale) v.push({ rule: "foto_em_baixa_resolucao", a: p.id, ra: p.rect, info: `ampliada ${p.upscale.toFixed(2)}x (máx. ${QA.photo_max_upscale}x): foto maior ou quadro menor` });
    }
    return v;
  }

  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("file://" + path.join(vdir, "qa/harness.html"));
    await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 120000, polling: 200 });
    return page;
  };
  const errors = [];
  let page = await open();
  const groups = new Map(), trace = [];
  const n = Math.floor((t1 - t0) / step + 1e-6);
  for (let i = 0; i <= n; i++) {
    const t = +(t0 + i * step).toFixed(3);
    const f = await page.evaluate((t) => { window.__seek(t); return window.__qa.frame(); }, t);
    trace.push({ t, scene: f.scene, heroes: f.heroes.map((h) => h.name), texts: f.texts.length });
    for (const v of rules(f)) {
      const key = [v.rule, v.a, v.b || ""].join("|"), g = groups.get(key);
      if (g && t - g.to <= step * 1.5 + 1e-6) { g.to = t; g.frames++; }
      else if (!g) groups.set(key, { ...v, ra: r1(v.ra), rb: r1(v.rb), from: t, to: t, frames: 1, scene: f.scene });
      else groups.set(key + "|" + t, { ...v, ra: r1(v.ra), rb: r1(v.rb), from: t, to: t, frames: 1, scene: f.scene });
    }
    if (i % 50 === 0) process.stdout.write(`  qa ${t.toFixed(1)}s / ${t1.toFixed(1)}s\r`);
  }
  process.stdout.write("\n");
  const list = [...groups.values()].filter((g) => !MIN_S[g.rule] || g.to - g.from + step >= MIN_S[g.rule] - 1e-6).sort((a, b) => a.from - b.from);
  let shot = 0;
  for (const g of list) {
    if (shot >= maxShots) break;
    const file = path.join(outDir, `${String(++shot).padStart(2, "0")}-${g.rule}-${g.from.toFixed(1)}s.png`);
    await page.evaluate(({ t, ra, rb, safe, label }) => {
      window.__seek(t);
      const box = (r, c) => { const d = document.createElement("div"); d.className = "__qa_mark"; Object.assign(d.style, { position: "absolute", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px", border: `6px solid ${c}`, zIndex: 9999, boxSizing: "border-box" }); document.body.appendChild(d); };
      box(safe, "rgba(0,200,255,0.8)"); if (ra) box(ra, "#ff2bd6"); if (rb) box(rb, "#ffe600");
      const tag = document.createElement("div"); tag.className = "__qa_mark"; tag.textContent = label;
      Object.assign(tag.style, { position: "absolute", left: "20px", top: "20px", zIndex: 9999, background: "#000", color: "#fff", font: "700 30px sans-serif", padding: "8px 12px" }); document.body.appendChild(tag);
    }, { t: g.from, ra: g.ra, rb: g.rb, safe: SAFE, label: `${g.rule} · ${g.a}${g.b ? " × " + g.b : ""} · ${g.from}s` });
    await page.screenshot({ path: file, timeout: 90000 });
    await page.evaluate(() => document.querySelectorAll(".__qa_mark").forEach((e) => e.remove()));
    g.shot = path.relative(vdir, file);
  }
  await browser.close();
  const report = { video: video.slug, estilo: "explicando-direito", step, from: t0, to: t1, frames: n + 1, problems: list.length + errors.length, errors, items: list, trace };
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  if (errors.length) console.log("erros de página:\n  " + errors.join("\n  "));
  if (!list.length && !errors.length) { console.log(`QA ok: ${n + 1} quadros verificados, nenhum problema.`); process.exit(0); }
  console.log(`QA: ${list.length} problema(s):`);
  for (const g of list) console.log(`  ${g.from.toFixed(1)}–${g.to.toFixed(1)}s  ${g.rule}  ${g.a}${g.b ? " × " + g.b : ""}${g.info ? "  (" + g.info + ")" : ""}${g.shot ? "  → " + g.shot : ""}`);
  process.exit(1);
};
