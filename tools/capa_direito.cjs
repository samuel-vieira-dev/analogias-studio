/*
 * Capa do post no Estilo Explicando Direito. Chamado por tools/capa.cjs quando video.json → estilo é
 * "explicando-direito" (mesma linha: node tools/capa.cjs videos/<slug> [--t 1.2] [--title "..."]).
 * Um quadro do gancho tirado de qa/harness.html, sem o texto cinético, com o título grande em Anton (até
 * cover.title.w × h, config/layout.json) e, logo abaixo, o elemento do palco (até cover.stage.w × h). Título e
 * elemento formam um bloco centralizado na altura (cover.block; pedido do Samuel, 04/11/2026): reprova se o
 * centro do bloco sair mais de block.tol_px do meio. [palavra] no título ganha a caixa amarela, como no vídeo.
 * Título: video.json → post.title, senão a linha grande do primeiro bloco.
 * A letra fica entre cover.title.min_font_px e max_font_px (até max_lines linhas); abaixo do mínimo, reprova.
 * Grava videos/<slug>/out/<slug>-capa.jpg e imprime um resumo em JSON.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

module.exports = async function capaDireito({ vdir, video, layout, opt }) {
  const post = video.post || {}, C = layout.cover;
  const firstBig = () => { const b = (video.texto || [""])[0].split("|").find((l) => l.trim().startsWith("#")) || video.texto[0]; return b.replace(/^\s*#/, "").trim(); };
  const title = (opt("title") || post.title || firstBig()).replace(/\\n/g, "\n");
  const vis = video.visuais || [];
  const t = parseFloat(opt("t") ?? post.t ?? Math.min(1.4, vis[1] && vis[1].t ? vis[1].t - 0.25 : 1.4));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + path.join(vdir, "qa/harness.html"));
  await page.waitForFunction(() => !!(window.__qaReady && window.__qaReady()), null, { timeout: 120000, polling: 200 });
  const res = await page.evaluate(({ t, title, C }) => {
    window.__seek(t);
    const root = document.getElementById("bd-root");
    root.querySelectorAll(".d-block, .d-echo, .d-flash, .d-pill").forEach((e) => (e.style.display = "none"));
    // título: a maior letra que cabe em cover.title (largura × altura máximas), em até max_lines linhas
    const T = C.title, B = C.block, G = C.grid, el = document.createElement("div");
    Object.assign(el.style, { position: "absolute", left: T.x + "px", top: "0px", width: T.w + "px", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 30, textAlign: "center" });
    root.appendChild(el);
    const toks = []; const re = /\[([^\]]+)\]|(\n)|(\S+)/g; let m;
    while ((m = re.exec(title))) { if (m[2]) toks.push({ br: true }); else (m[1] ? m[1].split(/\s+/) : [m[3]]).forEach((w) => toks.push({ w, hl: !!m[1] })); }
    const word = (tk) => `<span style="position:relative;display:inline-block;isolation:isolate">${tk.hl ? '<span style="position:absolute;left:-0.06em;right:-0.06em;top:0.08em;bottom:0;background:var(--amarelo);z-index:-1"></span>' : ""}${tk.w.replace(/</g, "&lt;")}</span>`;
    const lineCss = (px) => `font:400 ${px}px/1.02 'Anton';text-transform:uppercase;white-space:nowrap;color:var(--tinta)`;
    let best = null;
    for (let px = T.max_font_px; px >= 40; px -= 4) {
      const lines = [[]]; el.innerHTML = "";
      const probe = document.createElement("div"); probe.style.cssText = lineCss(px) + ";display:inline-block"; el.appendChild(probe);
      for (const tk of toks) {
        if (tk.br) { if (lines[lines.length - 1].length) lines.push([]); continue; }
        const cur = lines[lines.length - 1];
        probe.innerHTML = cur.concat(tk).map(word).join(" ");
        if (cur.length && probe.getBoundingClientRect().width > T.w) lines.push([tk]); else cur.push(tk);
      }
      const wide = lines.some((l) => { probe.innerHTML = l.map(word).join(" "); return probe.getBoundingClientRect().width > T.w; });
      if (!wide && lines.length <= T.max_lines && lines.length * px * 1.02 <= T.h) { best = { px, lines }; break; }
    }
    el.innerHTML = best ? best.lines.map((l) => `<div style="${lineCss(best.px)}">${l.map(word).join(" ")}</div>`).join("") : "";
    const Ht = el.getBoundingClientRect().height;
    // o elemento do palco (cover.stage = tamanho máximo); a foto que vaza (foto-cheia) encolhe na altura se o bloco não couber
    const f = window.__qa.frame(), h = f.heroes[f.heroes.length - 1];
    const vis = [...root.querySelectorAll(".d-vis")].filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.05).pop();
    const room = G.y + G.h - 16 - Math.max(B.min_top, G.y + 16) - Ht - B.gap;   // altura que sobra para o elemento dentro do recorte 3:4
    let He = 0, place = null;
    if (vis && h) {
      const r = h.rect, S = C.stage;
      if (h.bleed) {
        const box = vis.querySelector(".d-bleed");
        if (box && r.h > room) box.style.height = Math.floor(room) + "px";
        He = Math.min(r.h, room);
        place = (top) => { const wrap = document.createElement("div"); Object.assign(wrap.style, { position: "absolute", inset: "0", zIndex: 10, transform: `translate(0px, ${top - r.y}px)` }); vis.parentNode.insertBefore(wrap, vis); wrap.appendChild(vis); };
      } else {
        const k = Math.min(S.w / r.w, S.h / r.h, room / r.h, 1.25);
        He = r.h * k;
        place = (top) => {
          const dx = S.x + S.w / 2 - (r.x + r.w / 2), dy = top + He / 2 - (r.y + r.h / 2);
          const wrap = document.createElement("div"); Object.assign(wrap.style, { position: "absolute", inset: "0", zIndex: 10, transformOrigin: `${r.x + r.w / 2}px ${r.y + r.h / 2}px`, transform: `translate(${dx}px, ${dy}px) scale(${k})` });
          vis.parentNode.insertBefore(wrap, vis); wrap.appendChild(vis);
        };
      }
    }
    // título + elemento = um bloco centralizado na altura (cover.block), sem subir para a faixa do ícone e do crédito
    const total = Ht + (He ? B.gap + He : 0);
    const top = Math.max(B.min_top, G.y + 16, B.center_y - total / 2);
    el.style.top = top + "px";
    if (place) place(top + Ht + B.gap);
    return { px: best && best.px, lines: best && best.lines.length, scene: f.scene, block: { top, bottom: top + total, title_h: Math.round(Ht), elem_h: Math.round(He) } };
  }, { t, title, C });
  const out = path.join(vdir, "out"); fs.mkdirSync(out, { recursive: true });
  const file = path.join(out, `${video.slug}-capa.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 90 });
  await browser.close();
  const off = Math.round((res.block.top + res.block.bottom) / 2 - C.block.center_y);
  const problems = [];
  if (!(res.px && res.px >= C.title.min_font_px)) problems.push(`título da capa pequeno demais (${res.px || "não coube"} px; mínimo ${C.title.min_font_px}): encurte post.title`);
  if (Math.abs(off) > C.block.tol_px) problems.push(`bloco título + elemento fora do centro da capa (${off} px): encurte post.title ou escolha outro post.t`);
  console.log(JSON.stringify({ capa: path.relative(path.resolve(__dirname, ".."), file), t, title, font_px: res.px, linhas: res.lines, plano: res.scene, bloco: { y: [Math.round(res.block.top), Math.round(res.block.bottom)], centro_off_px: off }, ok: !problems.length }));
  if (problems.length) { console.error(problems.join("; ")); process.exit(1); }
};
