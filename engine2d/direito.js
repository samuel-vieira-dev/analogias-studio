// Estilo Explicando Direito — motor 2D (texto cinético + elementos de palco), gerado por tools/build_direito.py.
// Recebe SPEC (tempos já resolvidos pelas palavras da narração) e devolve a timeline GSAP do quadro.
// Tudo é função do tempo (seek): nada de setTimeout, nada de estado fora da timeline.
// Componentes e opções: docs/explicando-direito/visual.md.
function buildDireito(root, SPEC) {
  const L = SPEC.layout, Z = L.zones, SAFE = L.safe, DUR = SPEC.dur, M = SPEC.media;
  const tl = gsap.timeline({ paused: true });
  const COR = { vermelho: "var(--vermelho)", petroleo: "var(--petroleo)", verde: "var(--verde)", cinza: "#8a9299", preto: "var(--tinta)", amarelo: "var(--amarelo)", azul: "var(--azul)" };
  const cor = (c, d) => COR[c] || c || d;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const arrows = (s) => esc(s).replace(/-&gt;|→/g, '<svg viewBox="0 0 64 40" style="height:0.62em;width:0.9em;vertical-align:0.08em;margin:0 0.06em"><path d="M4 20h50M38 6l16 14-16 14" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const pop = (el, t, o = {}) => t < 0.05 ? tl.set(el, { opacity: 1, scale: 1, rotation: o.r1 ?? 0, y: 0 }, 0) : tl.fromTo(el, { opacity: 0, scale: o.s0 ?? 1.25, rotation: o.r0 ?? 0, y: o.y0 ?? 0 },
    { opacity: 1, scale: 1, rotation: o.r1 ?? 0, y: 0, duration: o.d ?? 0.36, ease: o.ease ?? "back.out(1.5)" }, t);
  const qa = { visuals: [], credits: [] };

  // ---------------------------------------------------------- fundo, flash, moldura do canal
  const bg = h("div", "d-bg"); bg.style.backgroundImage = `url(${SPEC.paper})`; root.appendChild(bg);
  tl.fromTo(bg, { scale: 1 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
  const flash = h("div", "d-flash"); root.appendChild(flash);

  const sticker = h("div", "d-sticker", ICON(SPEC.icone));
  Object.assign(sticker.style, { left: SAFE.x + "px", top: SAFE.y + "px", width: "76px", height: "76px" });
  root.appendChild(sticker);
  pop(sticker, 0.35, { r0: -40, r1: -7, s0: 0.4 });

  const pill = h("div", "d-pill", `<div><span class="av">${esc(SPEC.handle[0].replace("@", "")[0])}</span><b>${esc(SPEC.handle[0])}<em>${esc(SPEC.handle[1])}</em></b></div>`);
  pill.style.top = SPEC.pillY + "px"; root.appendChild(pill);

  // ---------------------------------------------------------- texto cinético
  const HZ = Z.headline;
  for (const b of SPEC.blocks) {
    const el = h("div", "d-block"); el.dataset.qa = "text";
    Object.assign(el.style, { left: HZ.x + "px", width: HZ.w + "px", top: HZ.y + "px" });
    for (const ln of b.lines) {
      const le = h("div", "d-line " + (ln.big ? "big" : "small"));
      ln.words.forEach((w, i) => {
        const we = h("span", "w" + (w.fn ? " fn" : "") + (w.hl ? " h-" + w.hl : ""));
        const tx = arrows(w.text);
        we.innerHTML = (["amarelo", "preto", "verde"].includes(w.hl) ? '<span class="hl"></span>' : "") +
          `<span class="g">${tx}</span><span class="k">${tx}</span>` +
          (w.hl === "sublinhado" ? '<span class="ul"></span>' : "") + (w.hl === "riscado" ? '<span class="st"></span>' : "") +
          (w.hl === "circulo" ? '<svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M8 40 C14 8 86 6 95 38 C102 70 70 96 40 92 C10 88 -2 62 12 34" fill="none" stroke="#16191c" stroke-width="3.2" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>' : "");
        le.appendChild(we);
        if (i < ln.words.length - 1) le.appendChild(document.createTextNode(" "));
        w.el = we;
      });
      el.appendChild(le); ln.el = le;
    }
    root.appendChild(el); b.el = el;
    // cada linha cabe na largura da zona; o bloco inteiro cabe na altura (as fontes já carregaram)
    const width = (le) => { const rg = document.createRange(); rg.selectNodeContents(le); return rg.getBoundingClientRect().width; };
    for (const ln of b.lines) { let s = parseFloat(getComputedStyle(ln.el).fontSize); const min = ln.big ? 56 : 30;
      while (width(ln.el) > HZ.w - 8 && s > min) { s -= 2; ln.el.style.fontSize = s + "px"; } }
    for (let k = 0; k < 12 && el.offsetHeight > HZ.h; k++) for (const ln of b.lines) ln.el.style.fontSize = parseFloat(getComputedStyle(ln.el).fontSize) * 0.94 + "px";
  }

  // ---------------------------------------------------------- componentes
  function photoWin(id, w, hgt, cls) {
    const m = M[id]; if (!m) throw new Error(`foto '${id}' não está em video.json → media`);
    const win = h("div", "win " + (cls || "")); win.style.width = w + "px"; win.style.height = hgt + "px";
    const img = h("img"); img.src = m.src; const [fx, fy] = m.focus.map((x) => Math.round(x * 100));
    img.style.objectPosition = `${fx}% ${fy}%`; img.style.transformOrigin = `${fx}% ${fy}%`;
    win.appendChild(img); win.dataset.qa = "photo"; win.dataset.media = id;
    return { win, img };
  }
  function polaroid(v, it, w, hgt, i) {
    const pol = h("div", "d-pol" + (it.pb ?? v.pb ? " pb" : ""));
    const { win, img } = photoWin(it.media, w, hgt); pol.appendChild(win);
    v.photos.push({ id: it.media, win, from: it.t ?? v.t });
    if (it.nome) pol.appendChild(h("span", "d-tag" + (it.cor ? " " + it.cor : ""), esc(it.nome)));
    const rot = it.rot ?? [-2.5, 2, -1.5, 2.5][i % 4];
    pop(pol, it.t ?? v.t, { r0: rot * 4, r1: rot, s0: 1.3 });
    tl.fromTo(img, { scale: 1 }, { scale: 1.1, duration: Math.max(0.5, v.end - (it.t ?? v.t)), ease: "none" }, it.t ?? v.t);
    if (it.marca) {
      const bd = h("span", "d-badge " + (it.marca.tipo === "no" ? "no" : "ok"), ICON(it.marca.tipo === "no" ? "x" : "check"));
      pol.appendChild(bd); pop(bd, it.marca.t, { s0: 0.2, ease: "back.out(3)" });
    }
    return pol;
  }
  function cardEl(c) {
    const el = h("div", "d-card", `<div class="top">${c.icone ? ICON(c.icone) : ""}<span class="gr">${arrows(c.grande)}</span></div>${c.pequeno ? `<div class="pq">${esc(c.pequeno)}</div>` : ""}`);
    return el;
  }
  function cardInto(v, c, host, corner) {
    const el = cardEl(c);
    if (corner && host) {
      el.classList.add("canto"); host.style.position = "relative";
      if (v.tipo === "foto-cheia") { el.style.right = (SAFE.x + 30) + "px"; el.style.bottom = "150px"; }
      host.appendChild(el); el.style.scale = "0.78";
    } else v.inner.appendChild(el);
    pop(el, c.t, { r0: -12, r1: -2, s0: 1.4, y0: 30 });
  }
  function nota(n) {
    return h("div", "d-nota", `<span class="lab">${esc(n.rotulo || "NOTA")}</span><div class="tx"><b>${esc(n.texto)}</b>${n.sub ? `<small>${esc(n.sub)}</small>` : ""}</div>`);
  }
  function stamp(v, s) {
    const el = h("div", "d-stamp", esc(s.texto));
    const [px, py] = s.pos || [62, 58];
    Object.assign(el.style, { left: px + "%", top: py + "%", transform: "translate(-50%,-50%)" });
    v.inner.appendChild(el);
    tl.fromTo(el, { opacity: 0, scale: 2.4, rotation: -4 }, { opacity: 0.92, scale: 1, rotation: s.rot ?? -12, duration: 0.17, ease: "power4.in" }, s.t);
    tl.fromTo(v.inner, { x: 0 }, { x: 9, duration: 0.04, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, s.t + 0.17);
  }
  function svgEl(w, hgt, inner) {
    const s = h("div", "d-svg"); s.style.width = w + "px"; s.style.height = hgt + "px"; s.style.position = "relative";
    s.innerHTML = `<svg width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">${inner}</svg>`;
    return s;
  }
  let mapSeq = 0;   // id único do recorte de cada mapa
  const draw = (path, t, d = 0.4) => tl.fromTo(path, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: d, ease: "power1.inOut" }, t);

  const KINDS = {
    fotos(v, inner) {
      const its = v.itens, n = its.length, row = h("div", "d-row");
      const size = n === 1 ? (v.formato === "retrato" ? [420, 540] : v.formato === "quadrado" ? [500, 500] : [560, 420]) : n === 2 ? [296, 336] : [262, 262];
      row.style.gap = n === 1 ? "0" : "34px 40px"; row.style.maxWidth = n === 3 || n === 4 ? "640px" : "700px";
      its.forEach((it, i) => row.appendChild(polaroid(v, it, size[0], size[1], i)));
      inner.appendChild(row); return n === 1 ? row.firstChild : row;
    },
    "foto-cheia"(v, inner) {
      const box = h("div", "d-bleed" + (v.pb ? " pb" : "")); box.style.height = (v.altura || 860) + "px";
      const { win, img } = photoWin(v.media, 1080, v.altura || 860); win.className = ""; win.style.width = "100%"; win.style.height = "100%";
      box.appendChild(win); inner.appendChild(box); v.photos.push({ id: v.media, win, from: v.t, bleed: true });
      tl.fromTo(img, { scale: 1.02 }, { scale: 1.1, duration: Math.max(0.5, v.end - v.t), ease: "none" }, v.t);
      return box;
    },
    cartao(v, inner) { const el = cardEl(v); inner.appendChild(el); pop(el, v.t, { r0: -10, r1: -1.5, s0: 1.35, y0: 30 }); return el; },
    nota(v, inner) { const el = nota(v); inner.appendChild(el); pop(el, v.t, { s0: 0.9, y0: 24, ease: "power3.out" }); return el; },
    documento(v, inner) {
      const el = h("div", "d-doc" + (v.cor === "vermelho" ? " vermelho" : ""));
      el.innerHTML = `${v.etiqueta ? `<div class="hd">${esc(v.etiqueta)}</div>` : ""}<div class="bd">${v.titulo ? `<div class="ti">${arrows(v.titulo)}</div>` : ""}${v.texto ? `<div class="tx">${esc(v.texto)}</div>` : ""}</div>`;
      const bd = el.querySelector(".bd");
      (v.linhas || []).forEach((r, i) => {
        const rw = h("div", "rw", `<span class="fill"></span><span class="dot"></span><span>${esc(r.texto)}</span><span class="sp"></span>${r.tag ? `<span class="d-tag">${esc(r.tag)}</span>` : ""}`);
        bd.appendChild(rw); pop(rw, r.t ?? v.t + 0.2 + i * 0.12, { s0: 1, y0: 14, ease: "power2.out", d: 0.25 });
        if (r.destaque != null) tl.fromTo(rw.querySelector(".fill"), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, r.destaque);
      });
      if (!(v.linhas || []).length) bd.insertAdjacentHTML("beforeend", '<div class="ln" style="width:92%;margin-top:22px"></div><div class="ln" style="width:84%"></div><div class="ln" style="width:58%"></div>');
      if (v.clipe) el.insertAdjacentHTML("beforeend", '<svg class="clip" viewBox="0 0 34 86"><path d="M10 30V12a7 7 0 0 1 14 0v52a10 10 0 0 1-20 0V22" fill="none" stroke="#5b636a" stroke-width="4" stroke-linecap="round"/></svg>');
      if (v.selo) el.insertAdjacentHTML("beforeend", `<svg class="seal" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="#2c3338" stroke-width="4"/><circle cx="60" cy="60" r="40" fill="none" stroke="#2c3338" stroke-width="2"/><g transform="translate(36 36) scale(0.75)">${ICONS.balanca}</g></svg>`);
      inner.appendChild(el); pop(el, v.t, { r0: -8, r1: v.rot ?? -1.2, s0: 1.3, y0: 30 }); return el;
    },
    barras(v, inner) {
      const W = 640, H = 540, base = 460, maxH = 330, bw = 92, gap = 12;
      const groups = [...new Set(v.barras.map((b) => b.grupo))], max = Math.max(...v.barras.map((b) => b.valor));
      const gx = (gi) => (W / groups.length) * (gi + 0.5);
      const pos = v.barras.map((b) => { const gi = groups.indexOf(b.grupo), sib = v.barras.filter((x) => x.grupo === b.grupo), k = sib.indexOf(b);
        const x = gx(gi) - (sib.length * bw + (sib.length - 1) * gap) / 2 + k * (bw + gap); return { x, top: base - (b.valor / max) * maxH }; });
      let svg = `<line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="#3a4148" stroke-width="3"/>`;
      groups.forEach((g, gi) => { svg += `<text x="${gx(gi)}" y="${base + 40}" text-anchor="middle" font-size="26" fill="#2b3136">${esc(g)}</text>`; });
      const el = svgEl(W, H, svg); const s = el.querySelector("svg");
      v.barras.forEach((b, i) => {
        const p = pos[i], ns = "http://www.w3.org/2000/svg", g = document.createElementNS(ns, "g");
        g.innerHTML = `<rect x="${p.x}" y="${p.top}" width="${bw}" height="${base - p.top}" fill="${cor(b.cor, COR.vermelho)}"/><text x="${p.x + bw / 2}" y="${base - 12}" text-anchor="middle" font-size="17" fill="#fff">${esc(b.nome || "")}</text>`;
        s.appendChild(g); tl.fromTo(g.querySelector("rect"), { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.5, ease: "power3.out" }, b.t);
        tl.fromTo(g.querySelectorAll("text"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, b.t + 0.25);
        const lab = document.createElementNS(ns, "text"); lab.setAttribute("x", p.x + bw / 2); lab.setAttribute("y", p.top - 14); lab.setAttribute("text-anchor", "middle"); lab.setAttribute("font-size", "40"); lab.setAttribute("fill", "#16191c"); lab.textContent = b.rotulo || b.valor;
        s.appendChild(lab); tl.fromTo(lab, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25 }, b.t + 0.3);
      });
      if (v.delta) {
        const a = pos[v.delta.de], b = pos[v.delta.para], ns = "http://www.w3.org/2000/svg";
        const x1 = a.x + bw / 2, y1 = a.top - 60, x2 = b.x + bw / 2, y2 = b.top - 60;
        const ln = document.createElementNS(ns, "path"); ln.setAttribute("d", `M${x1} ${y1} L${x2} ${y2}`); ln.setAttribute("stroke", "#8e1b1b"); ln.setAttribute("stroke-width", "4"); ln.setAttribute("stroke-dasharray", "10 8"); ln.setAttribute("fill", "none");
        s.appendChild(ln); tl.fromTo(ln, { opacity: 0 }, { opacity: 1, duration: 0.3 }, v.delta.t);
        const tag = h("span", "d-tag vermelho", esc(v.delta.texto)); Object.assign(tag.style, { position: "absolute", left: (x1 + x2) / 2 + "px", top: (y1 + y2) / 2 - 56 + "px", transform: "translateX(-50%)" });
        el.appendChild(tag); pop(tag, v.delta.t + 0.15, { s0: 0.4 });
      }
      inner.appendChild(el); return el;
    },
    rosca(v, inner) {
      const el = svgEl(400, 400, `<circle cx="200" cy="200" r="150" fill="none" stroke="#c6ccd1" stroke-width="44"/><circle class="arc" cx="200" cy="200" r="150" fill="none" stroke="${cor(v.cor, COR.vermelho)}" stroke-width="44" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100" transform="rotate(-90 200 200)"/>`);
      const num = h("div", "", "0%"); Object.assign(num.style, { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", font: "400 120px/1 'Anton'", color: "#16191c" });
      el.appendChild(num); inner.appendChild(el);
      if (v.rotulo) { const r = h("div", "", esc(v.rotulo)); Object.assign(r.style, { font: "400 44px/1 'Anton'", textTransform: "uppercase", marginTop: "-10px" }); inner.appendChild(r); pop(r, v.t + 0.3, { s0: 0.9 }); }
      const p = { x: 0 };
      tl.fromTo(el.querySelector(".arc"), { attr: { "stroke-dashoffset": 100 } }, { attr: { "stroke-dashoffset": 100 - v.valor }, duration: 0.9, ease: "power2.out" }, v.t);
      tl.fromTo(p, { x: 0 }, { x: v.valor, duration: 0.9, ease: "power2.out", onUpdate: () => { num.textContent = Math.round(p.x) + (v.sufixo ?? "%"); } }, v.t);
      pop(el, v.t, { s0: 0.8, d: 0.3 }); return el;
    },
    pessoas(v, inner) {
      const row = h("div", "d-row"), n = v.n || 3, sz = Math.min(220, Math.floor((SZ.w - 20 - (n - 1) * 18) / n));
      row.style.gap = "18px";
      const figs = [];
      for (let i = 0; i < n; i++) { const f = h("div", "", ICON("pessoa").replace(/#3a4148/g, "currentColor")); Object.assign(f.style, { width: sz + "px", height: sz + "px", color: "#3a4148" }); row.appendChild(f); figs.push(f); pop(f, v.t + i * 0.08, { s0: 0.3, y0: 30 }); }
      inner.appendChild(row);
      if (v.destaque) tl.to(figs.slice(0, v.destaque.n ?? n), { color: cor(v.destaque.cor, COR.vermelho), duration: 0.3, stagger: 0.06, immediateRender: false }, v.destaque.t);
      if (v.tag) { const tg = h("span", "d-tag " + (v.tag.cor || ""), esc(v.tag.texto)); inner.appendChild(tg); pop(tg, v.tag.t, { s0: 0.5 }); }
      return row;
    },
    hemiciclo(v, inner) {
      const W = 680, H = 420, cx = W / 2, cy = 330, N = v.total, radii = [130, 165, 200, 235, 270, 305];
      const sum = radii.reduce((a, b) => a + b, 0); let counts = radii.map((r) => Math.round((N * r) / sum)); counts[counts.length - 1] += N - counts.reduce((a, b) => a + b, 0);
      const seats = [];
      radii.forEach((r, ri) => { for (let k = 0; k < counts[ri]; k++) { const a = Math.PI - (Math.PI * k) / Math.max(1, counts[ri] - 1); seats.push({ a, x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }); } });
      seats.sort((p, q) => q.a - p.a);
      let svg = seats.map((s, i) => `<circle class="st st${i}" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="10.5" fill="#e3ded3"/>`).join("");
      if (v.rotulo) svg += `<text x="${cx}" y="${cy + 62}" text-anchor="middle" font-size="28" fill="#16191c">${esc(v.rotulo)}</text>`;
      const el = svgEl(W, H, svg); inner.appendChild(el); pop(el, v.t, { s0: 0.9, d: 0.3 });
      let k0 = 0;
      for (const g of v.grupos) {
        const ids = seats.slice(k0, k0 + g.n).map((_, j) => el.querySelector(".st" + (k0 + j)));
        const mid = seats[Math.min(seats.length - 1, k0 + Math.floor(g.n / 2))]; k0 += g.n;
        tl.to(ids, { attr: { fill: cor(g.cor, COR.vermelho) }, duration: 0.2, stagger: 0.35 / Math.max(1, g.n), immediateRender: false }, g.t);
        const tg = h("span", "d-tag " + (g.tag || "preto"), esc(g.nome)); tg.style.background = cor(g.cor, COR.vermelho); tg.style.color = "#fff";
        Object.assign(tg.style, { position: "absolute", left: clamp(mid.x, 70, W - 70) + "px", top: "-38px", transform: "translateX(-50%)", fontSize: "26px" });
        el.appendChild(tg); pop(tg, g.t, { s0: 0.4 });
      }
      if (v.centro) { const c = h("div", "", `<div style="font:400 84px/1 'Anton'">${esc(v.centro.grande)}</div><div style="font:800 18px/1.2 'Inter';letter-spacing:.05em;text-transform:uppercase">${esc(v.centro.pequeno || "")}</div>`);
        Object.assign(c.style, { position: "absolute", left: cx + "px", top: cy - 112 + "px", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }); el.appendChild(c); pop(c, v.centro.t, { s0: 0.5 }); }
      return el;
    },
    fluxo(v, inner) {
      const W = 640, H = 460, nodes = v.nos.map((n, i) => { const d = h("div", "d-node", `<b>${esc(n.texto)}</b>${n.sub ? `<small>${esc(n.sub)}</small>` : ""}`); d.style.background = cor(n.cor, i ? COR.azul : COR.preto); return d; });
      const el = svgEl(W, H, ""); const s = el.querySelector("svg"), ns = "http://www.w3.org/2000/svg";
      nodes.forEach((d, i) => { Object.assign(d.style, { position: "absolute", top: "120px", left: (i ? W - 210 : 0) + "px" }); el.appendChild(d); pop(d, v.nos[i].t ?? v.t + i * 0.15, { s0: 0.4 }); });
      (v.setas || []).forEach((a, i) => {
        const fwd = a.de === 0, y = i === 0 ? 225 : 380, x1 = fwd ? 225 : W - 225, x2 = fwd ? W - 225 : 225, c = cor(a.cor, i ? COR.vermelho : COR.amarelo);
        const p = document.createElementNS(ns, "path");
        const d = i === 0 ? `M${x1} ${y}L${x2} ${y}` : `M${W - 105} 340 Q${W / 2} ${y + 50} 105 340`;
        p.setAttribute("d", d); p.setAttribute("stroke", c); p.setAttribute("stroke-width", "7"); p.setAttribute("fill", "none"); p.setAttribute("pathLength", "1"); p.setAttribute("stroke-dasharray", "1 1"); p.setAttribute("stroke-dashoffset", "1"); p.setAttribute("stroke-linecap", "round");
        s.appendChild(p); draw(p, a.t, 0.45);
        const head = document.createElementNS(ns, "path"), hx = i === 0 ? x2 : 105, hy = i === 0 ? y : 340, dir = i === 0 ? (fwd ? 1 : -1) : -1;
        head.setAttribute("d", i === 0 ? `M${hx - 18 * dir} ${hy - 13}L${hx} ${hy}L${hx - 18 * dir} ${hy + 13}` : `M${hx + 4} ${hy - 22}L${hx} ${hy}L${hx + 22} ${hy + 6}`);
        head.setAttribute("stroke", c); head.setAttribute("stroke-width", "7"); head.setAttribute("fill", "none"); head.setAttribute("stroke-linecap", "round"); head.setAttribute("stroke-linejoin", "round");
        s.appendChild(head); tl.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.1 }, a.t + 0.4);
        if (a.texto) { const lb = h("div", "", esc(a.texto)); Object.assign(lb.style, { position: "absolute", left: W / 2 + "px", top: (i === 0 ? y - 52 : y + 50) + "px", transform: "translateX(-50%)", font: "400 26px/1 'Anton'", textTransform: "uppercase", whiteSpace: "nowrap", color: "#16191c" }); el.appendChild(lb); pop(lb, a.t + 0.2, { s0: 0.7 }); }
      });
      inner.appendChild(el); return el;
    },
    bifurcacao(v, inner) {
      const W = 660, H = 740;
      const road = `<path d="M330 740 L330 470 C330 380 200 330 130 210 M330 470 C330 380 460 330 530 210" fill="none" stroke="#8b9298" stroke-width="84" stroke-linejoin="round"/>` +
        `<path d="M330 735 L330 470 C330 380 200 330 130 215 M330 470 C330 380 460 330 530 215" fill="none" stroke="#f4f1ea" stroke-width="5" stroke-dasharray="22 20"/>`;
      const el = svgEl(W, H, road); inner.appendChild(el); pop(el, v.t, { s0: 0.92, y0: 30, d: 0.35, ease: "power3.out" });
      const signs = ["esquerda", "direita"].map((lado, i) => {
        const sg = v[lado]; const b = h("div", "", `<div style="font:400 44px/1 'Anton';text-transform:uppercase">${esc(sg.texto)}</div>${sg.sub ? `<div style="margin-top:6px;font:700 15px/1.1 'Inter';text-transform:uppercase">${esc(sg.sub)}</div>` : ""}`);
        Object.assign(b.style, { position: "absolute", top: "60px", left: (i ? W - 270 : 0) + "px", width: "270px", boxSizing: "border-box", padding: "16px 10px", textAlign: "center", background: "#fbfaf6", boxShadow: "0 8px 18px rgba(0,0,0,0.22)", clipPath: i ? "polygon(0 0,88% 0,100% 50%,88% 100%,0 100%)" : "polygon(12% 0,100% 0,100% 100%,12% 100%,0 50%)",
          transformOrigin: i ? "100% 50%" : "0% 50%" });   // a placa em destaque cresce para dentro, nunca para fora da área segura
        const pole = h("div"); Object.assign(pole.style, { position: "absolute", top: "150px", left: (i ? W - 140 : 128) + "px", width: "10px", height: "70px", background: "#4a3a2a" });
        el.appendChild(pole); el.appendChild(b); pop(b, sg.t ?? v.t + 0.2 + i * 0.15, { s0: 0.5, r0: i ? 10 : -10 }); return b;
      });
      (v.destaques || []).forEach((d) => { const b = signs[d.lado === "direita" ? 1 : 0]; tl.to(b, { background: COR.amarelo, scale: 1.08, duration: 0.25, ease: "back.out(2)", immediateRender: false }, d.t); });
      return el;
    },
    balanca(v, inner) {
      const W = 640, H = 520;
      const svg = `<rect x="200" y="470" width="240" height="18" rx="4" fill="#16191c"/><rect x="312" y="150" width="16" height="320" fill="#16191c"/>` +
        `<g class="beam"><rect x="80" y="140" width="480" height="14" rx="6" fill="#16191c"/></g>` +
        `<g class="pl"><path d="M95 150 L45 300 M95 150 L145 300" stroke="#16191c" stroke-width="4"/><ellipse cx="95" cy="305" rx="72" ry="18" fill="${cor(v.corEsquerda, COR.vermelho)}"/><text x="95" y="360" text-anchor="middle" font-size="34" fill="#16191c">${esc(v.esquerda)}</text></g>` +
        `<g class="pr"><path d="M545 150 L495 300 M545 150 L595 300" stroke="#16191c" stroke-width="4"/><ellipse cx="545" cy="305" rx="72" ry="18" fill="${cor(v.corDireita, "#8a9299")}"/><text x="545" y="360" text-anchor="middle" font-size="34" fill="#16191c">${esc(v.direita)}</text></g>`;
      const el = svgEl(W, H, svg); inner.appendChild(el); pop(el, v.t, { s0: 0.9, y0: 30, ease: "power3.out" });
      if (v.pesa) { const a = v.pesa.lado === "esquerda" ? -9 : 9, dy = 225 * Math.sin((Math.abs(a) * Math.PI) / 180) * (a < 0 ? 1 : -1);
        tl.to(el.querySelector(".beam"), { rotation: a, svgOrigin: "320 147", duration: 0.8, ease: "elastic.out(1,0.6)", immediateRender: false }, v.pesa.t);
        tl.to(el.querySelector(".pl"), { y: dy, duration: 0.8, ease: "elastic.out(1,0.6)", immediateRender: false }, v.pesa.t);
        tl.to(el.querySelector(".pr"), { y: -dy, duration: 0.8, ease: "elastic.out(1,0.6)", immediateRender: false }, v.pesa.t); }
      return el;
    },
    celular(v, inner) {
      const el = h("div", "d-phone", `<div class="sc"><div class="bar"><b>${esc(v.titulo || "")}</b>${v.sub ? `<small>${esc(v.sub)}</small>` : ""}</div></div>`);
      const sc = el.querySelector(".sc"); inner.appendChild(el); pop(el, v.t, { s0: 0.85, y0: 40, ease: "power3.out" });
      (v.mensagens || []).forEach((m, i) => { const b = h("div", "msg" + (m.lado === "d" ? " d" : ""), `<i style="width:${70 + (i * 37) % 30}%"></i><i style="width:${40 + (i * 23) % 40}%"></i>`); sc.appendChild(b); pop(b, m.t ?? v.t + 0.3 + i * 0.2, { s0: 0.6, ease: "back.out(2)", d: 0.25 });
        if (v.apagar != null) { tl.to(b.querySelectorAll("i"), { opacity: 0, duration: 0.2, immediateRender: false }, v.apagar + i * 0.08); const em = h("em", "", "mensagem apagada"); b.appendChild(em); tl.fromTo(em, { opacity: 0 }, { opacity: 1, duration: 0.2 }, v.apagar + i * 0.08 + 0.1); em.style.marginTop = "-26px"; } });
      (v.lista || []).forEach((r, i) => { const rw = h("div", "row", `<span class="fill"></span><span class="dot"></span><span>${esc(r.texto || "")}</span>${r.estrela ? '<span style="margin-left:auto;color:#a07a12">★</span>' : ""}`);
        if (!r.texto) rw.querySelector("span:nth-child(3)").outerHTML = '<i style="display:block;height:10px;width:60%;border-radius:5px;background:rgba(0,0,0,0.22)"></i>';
        sc.appendChild(rw); pop(rw, r.t ?? v.t + 0.3 + i * 0.1, { s0: 1, y0: 12, ease: "power2.out", d: 0.25 });
        if (r.destaque != null) tl.fromTo(rw.querySelector(".fill"), { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, r.destaque); });
      return el;
    },
    conexoes(v, inner) {
      const W = 700, H = 700, el = svgEl(W, H, ""), s = el.querySelector("svg"), ns = "http://www.w3.org/2000/svg";
      const spots = [[24, 0, -3], [W - 254, 34, 3]], ends = [];
      v.pessoas.forEach((p, i) => {
        const pol = polaroid(v, { ...p, rot: spots[i][2] }, 206, 216, i); Object.assign(pol.style, { position: "absolute", left: spots[i][0] + "px", top: spots[i][1] + "px" });
        el.appendChild(pol); ends.push([spots[i][0] + 115, spots[i][1] + 290]);
      });
      const box = h("div", "d-box", `<b>${esc(v.centro.texto)}</b>${v.centro.sub ? `<small>${esc(v.centro.sub)}</small>` : ""}`);
      Object.assign(box.style, { position: "absolute", left: W / 2 + "px", top: "520px", transform: "translateX(-50%)", whiteSpace: "nowrap" }); el.appendChild(box);
      pop(box, v.centro.t ?? v.t + 0.3, { s0: 0.5 });
      (v.ligacoes || []).forEach((l) => {
        const [x1, y1] = ends[l.de], x2 = W / 2 + (l.de ? 60 : -60), y2 = 520, c = cor(l.cor, l.estilo === "tracejada" ? COR.vermelho : COR.preto);
        const p = document.createElementNS(ns, "path"); p.setAttribute("d", `M${x1} ${y1}L${x2} ${y2}`); p.setAttribute("stroke", c); p.setAttribute("stroke-width", "5"); p.setAttribute("fill", "none");
        if (l.estilo === "tracejada") { p.setAttribute("stroke-dasharray", "12 9"); s.appendChild(p); tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.3 }, l.t); }
        else { p.setAttribute("pathLength", "1"); p.setAttribute("stroke-dasharray", "1 1"); p.setAttribute("stroke-dashoffset", "1"); s.appendChild(p); draw(p, l.t, 0.35); }
        if (l.texto) { const tg = h("span", "d-tag " + (l.estilo === "tracejada" ? "vermelho" : "preto"), esc(l.texto)); Object.assign(tg.style, { position: "absolute", left: (x1 + x2) / 2 + "px", top: (y1 + y2) / 2 - 22 + "px", transform: "translateX(-50%)", fontSize: "24px" }); el.appendChild(tg); pop(tg, l.t + 0.2, { s0: 0.4 }); }
      });
      inner.appendChild(el); return el;
    },
    palavras(v, inner) {
      const el = h("div", "d-words");
      v.itens.forEach((it, i) => { const w = h("div", "pw", `${esc(it.texto)}<span class="st" style="position:absolute;left:-4%;right:-4%;top:48%;height:14px;background:var(--vermelho);transform:rotate(-3deg);transform-origin:0 50%"></span>`);   // largura pela timeline (ver .w .st no CSS)
        if (it.cor) w.style.color = cor(it.cor);
        w.style.fontSize = Math.max(72, Math.min(132, Math.floor(1150 / Math.max(1, it.texto.length)))) + "px";   // palavra longa encolhe até 72 px para caber nos 700 px; mais longa que isso o QA reprova
        el.appendChild(w); pop(w, it.t ?? v.t + i * 0.25, { s0: 1.4 });
        const st = w.querySelector(".st"); if (it.riscar != null) tl.fromTo(st, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, it.riscar); else st.remove(); });
      inner.appendChild(el); return el;
    },
    icone(v, inner) {
      const el = h("div", "", ICON(v.nome)); Object.assign(el.style, { width: (v.tamanho || 320) + "px", height: (v.tamanho || 320) + "px" });
      inner.appendChild(el); pop(el, v.t, { s0: 0.5, ease: "back.out(2)" });
      if (v.rotulo) { const r = h("span", "d-tag " + (v.corRotulo || ""), esc(v.rotulo)); r.style.fontSize = "44px"; inner.appendChild(r); pop(r, v.rotuloT ?? v.t + 0.3, { s0: 0.5 }); }
      return el;
    },
    mapa(v, inner) {
      // contornos em engine2d/geo.js, projeção equirretangular; `area` [lon0, lon1, lat0, lat1] é o mínimo que aparece
      const W = 660, H = v.altura || 660, F = 10, ns = "http://www.w3.org/2000/svg", clip = "mapclip" + ++mapSeq;
      const [lo0, lo1, la0, la1] = v.area, k = Math.cos((((la0 + la1) / 2) * Math.PI) / 180);
      const iw = W - 2 * F, ih = H - 2 * F, s = Math.max(iw / ((lo1 - lo0) * k), ih / (la1 - la0));
      const ox = F + (iw - (lo1 - lo0) * k * s) / 2, oy = F + (ih - (la1 - la0) * s) / 2;
      const P = (lon, lat) => [ox + (lon - lo0) * k * s, oy + (la1 - lat) * s];
      const poly = (pts) => "M" + pts.map((p) => P(p[0], p[1]).map((x) => x.toFixed(1)).join(" ")).join("L") + "Z";
      let grid = "";
      for (let lon = Math.ceil(lo0 / 10) * 10 - 10; lon <= lo1 + 10; lon += 10) { const [x] = P(lon, 0); grid += `M${x.toFixed(1)} 0V${H}`; }
      for (let lat = Math.ceil(la0 / 10) * 10 - 10; lat <= la1 + 10; lat += 10) { const [, y] = P(0, lat); grid += `M0 ${y.toFixed(1)}H${W}`; }
      const land = ["americas", "cuba", "hispaniola"].map((n) => poly(GEO[n])).join("");
      let svg = `<defs><clipPath id="${clip}"><rect x="${F}" y="${F}" width="${iw}" height="${ih}"/></clipPath></defs>` +
        `<rect x="0" y="0" width="${W}" height="${H}" fill="#f6f4ec"/><g clip-path="url(#${clip})"><rect x="0" y="0" width="${W}" height="${H}" fill="#1d434a"/>` +
        `<path d="${grid}" stroke="rgba(243,236,217,0.13)" stroke-width="2" fill="none"/>` +
        `<path d="${land}" fill="#ece4d0" stroke="#0f2a30" stroke-width="2.5" stroke-linejoin="round"/>` +
        (v.paises || []).map((n) => `<path d="${poly(GEO[n])}" fill="#d8c9a3" stroke="#0f2a30" stroke-width="2.5" stroke-linejoin="round"/>`).join("") +   // vizinho citado, num tom mais escuro
        `<path class="br" d="${poly(GEO.brasil)}" fill="#c99412" stroke="#0f2a30" stroke-width="2.5" stroke-linejoin="round"/>` +
        (v.rotulos || []).map((r) => { const [x, y] = P(r.lon, r.lat); return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${r.tamanho || 34}" letter-spacing="3" fill="rgba(18,23,27,0.5)">${esc(r.texto)}</text>`; }).join("") +
        `<g class="rotas"></g></g>`;
      const el = svgEl(W, H, svg); el.classList.add("d-map"); const rotas = el.querySelector(".rotas");
      inner.appendChild(el); pop(el, v.t, { s0: 0.92, y0: 30, d: 0.35, ease: "power3.out" });
      const pts = Object.fromEntries(v.pontos.map((p) => [p.id, p]));
      const pin = (id) => { const p = pts[id]; if (!p) throw new Error(`mapa: ponto '${id}' não existe em pontos`); return P(p.lon, p.lat); };
      // trechos: curva quadrática; `curva` (fração do comprimento, + = para a esquerda de quem viaja); sem `t` já aparece desenhado; `fraco`: mais claro
      const arrive = {};
      v.trechos.forEach((r, i) => {
        const [ax, ay] = pin(r.de), [bx, by] = pin(r.para), dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), c = r.curva ?? 0.15;
        const cx = (ax + bx) / 2 + (dy / len) * c * len, cy = (ay + by) / 2 - (dx / len) * c * len;
        const d = `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`, drawn = r.t == null, dur = r.dur ?? 1.1;
        const path = (stroke, w) => { const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); p.setAttribute("stroke", stroke); p.setAttribute("stroke-width", w); p.setAttribute("fill", "none"); p.setAttribute("stroke-linecap", "round");
          p.setAttribute("pathLength", "1"); p.setAttribute("stroke-dasharray", "1 1"); p.setAttribute("stroke-dashoffset", drawn ? "0" : "1"); rotas.appendChild(p); return p; };
        const casing = path("#f3ecd9", 12), line = path("#7e1a1d", 6);
        if (r.fraco) { casing.setAttribute("opacity", "0.45"); line.setAttribute("opacity", "0.45"); }   // trecho anterior, já contado
        if (drawn) return;
        tl.fromTo([casing, line], { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: dur, ease: "power1.inOut" }, r.t);
        arrive[r.para] = arrive[r.para] ?? r.t + dur;
        // avião: amostras da curva no mesmo ritmo do traço (power1.inOut), um trecho de tween por amostra (sem onUpdate)
        const plane = h("div", "d-plane", ICON("aviao").replace(`fill="${ICON_INK}"`, `fill="${ICON_INK}" stroke="#f3ecd9" stroke-width="3" paint-order="stroke"`));
        el.appendChild(plane);
        const N = 24, ease = gsap.parseEase("power1.inOut"), at = (u) => { const m = 1 - u;
          return { x: m * m * ax + 2 * m * u * cx + u * u * bx, y: m * m * ay + 2 * m * u * cy + u * u * by,
            rotation: (Math.atan2(2 * m * (cy - ay) + 2 * u * (by - cy), 2 * m * (cx - ax) + 2 * u * (bx - cx)) * 180) / Math.PI }; };
        tl.set(plane, { opacity: 0, ...at(0) }, 0);
        tl.set(plane, { opacity: 1 }, r.t);
        for (let j = 0; j < N; j++) tl.fromTo(plane, at(ease(j / N)), { ...at(ease((j + 1) / N)), duration: dur / N, ease: "none", immediateRender: false }, r.t + (j * dur) / N);
        if (!r.fica) tl.to(plane, { opacity: 0, scale: 0.6, duration: 0.2, immediateRender: false }, r.t + dur);
      });
      // pinos: nome ao lado (`lado`: d, e, c, b) e um destaque opcional embaixo (`tag: {texto, em, cor}`)
      v.pontos.forEach((p) => {
        const [x, y] = P(p.lon, p.lat), t = p.t ?? arrive[p.id] ?? v.t;
        const dot = h("div", "d-pin"); Object.assign(dot.style, { left: x - 13 + "px", top: y - 13 + "px" }); el.appendChild(dot);
        pop(dot, t, { s0: 0.2, ease: "back.out(3)", d: 0.3 });
        const lado = p.lado || "d", off = { d: "translate(24px,-50%)", e: "translate(calc(-100% - 24px),-50%)", c: "translate(-50%,calc(-100% - 22px))", b: "translate(-50%,22px)" }[lado];
        const anc = h("div", "d-pinlab " + lado); Object.assign(anc.style, { left: x + "px", top: y + "px", transform: off }); el.appendChild(anc);
        const nm = h("span", "d-tag preto", esc(p.nome)); anc.appendChild(nm); pop(nm, t + 0.08, { s0: 0.5 });
        if (p.tag) { const tg = h("span", "d-tag " + (p.tag.cor || "vermelho"), esc(p.tag.texto)); anc.appendChild(tg); pop(tg, p.tag.t ?? t + 0.3, { s0: 0.4 }); }
      });
      // Brasil em destaque (rota que desvia do país): o país muda de cor e ganha uma etiqueta
      if (v.brasil) {
        const t = v.brasil.t ?? v.t + 0.35;
        tl.fromTo(el.querySelector(".br"), { attr: { fill: "#c99412" } }, { attr: { fill: v.brasil.cor || "#7e1a1d" }, duration: 0.3, ease: "power2.out", immediateRender: false }, t);
        if (v.brasil.texto) { const [x, y] = P(v.brasil.lon ?? -50, v.brasil.lat ?? -10), anc = h("div", "d-pinlab"); Object.assign(anc.style, { left: x + "px", top: y + "px", transform: "translate(-50%,-50%)" });
          const tg = h("span", "d-tag", esc(v.brasil.texto)); anc.appendChild(tg); el.appendChild(anc); pop(tg, t + 0.1, { s0: 0.4 }); }
      }
      return el;
    },
    numeros(v, inner) {
      const el = h("div", "d-eq");
      v.itens.forEach((it, i) => { const d = it.op ? h("div", "op", esc(it.op)) : h("div", "it", `<div class="n" style="color:${cor(it.cor, "var(--tinta)")}">${esc(it.texto)}</div>${it.rotulo ? `<div class="lb">${esc(it.rotulo)}</div>` : ""}`);
        el.appendChild(d); pop(d, it.t ?? v.t + i * 0.2, { s0: it.op ? 0.4 : 1.4 }); });
      inner.appendChild(el); return el;
    },
  };

  // ---------------------------------------------------------- palco
  const SZ = Z.stage;
  const vis = SPEC.visuals;
  vis.forEach((v, i) => {
    v.end = i + 1 < vis.length ? vis[i + 1].t : DUR;
    const outer = h("div", "d-vis" + (v.tipo === "foto-cheia" ? " bleed" : ""));
    Object.assign(outer.style, { left: SZ.x + "px", top: SZ.y + "px", width: SZ.w + "px", height: SZ.h + "px" });
    const inner = h("div", "d-zoom"); Object.assign(inner.style, { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px", transformOrigin: "50% 50%" });
    outer.appendChild(inner); root.appendChild(outer);
    v.outer = outer; v.inner = inner; v.photos = [];
    const kind = KINDS[v.tipo];
    if (!kind) throw new Error(`visual ${i}: tipo '${v.tipo}' não existe`);
    v.main = kind(v, inner);
    if (v.cartao) cardInto(v, v.cartao, v.main, true);
    if (v.nota) { const n = nota(v.nota); inner.appendChild(n); pop(n, v.nota.t, { s0: 0.9, y0: 24, ease: "power3.out", d: 0.3 }); }
    if (v.carimbo) stamp(v, v.carimbo);
    qa.visuals.push({ i, tipo: v.tipo, t: v.t, end: v.end, outer, inner, photos: v.photos, bleed: v.tipo === "foto-cheia" });
    // crédito das fotos do plano (zona source, canto superior direito)
    const creds = [...new Set(v.photos.map((p) => M[p.id].credit))];
    if (creds.length) {
      // muitos créditos não cabem numa linha de 24 px ao lado da figurinha: quebra em duas linhas de 20 px
      const label = (creds.length > 1 ? "Fotos: " : "Foto: ") + creds.join(" · ");
      let txt = esc(label), two = false;
      if (creds.length > 1 && label.length * 24 * 0.58 > Z.source.w - 90) {
        const cut = Math.ceil(creds.length / 2);
        txt = `${esc("Fotos: " + creds.slice(0, cut).join(" · "))} ·<br>${esc(creds.slice(cut).join(" · "))}`;
        two = true;
      }
      const c = h("div", "d-credit", `<span data-qa="source"${two ? ' style="font-size:20px;line-height:1.1"' : ""}>${txt}</span><i style="width:62%"></i><i style="width:38%"></i>`);
      Object.assign(c.style, { left: Z.source.x + "px", width: Z.source.w + "px", top: Z.source.y + "px" });
      root.appendChild(c); v.credit = c; qa.credits.push(c);
      tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.15 }, Math.max(0, v.t - 0.05));
      if (v.end < DUR) tl.to(c, { opacity: 0, duration: 0.1 }, v.end - 0.08);
    }
  });

  // transições: a entrada de cada plano decide como o anterior sai
  vis.forEach((v, i) => {
    const prev = vis[i - 1], tr = v.transicao || (i === 0 ? "corte" : "suave"), t = v.t;
    tl.fromTo(v.inner, { scale: 1 }, { scale: 1.035, duration: Math.max(0.2, v.end - t), ease: "none" }, t);
    if (i === 0 && t < 0.05) { tl.set(v.outer, { opacity: 1 }, 0); }
    else if (tr === "corte") { tl.set(v.outer, { opacity: 1 }, t); }
    else if (tr === "impacto") {
      tl.fromTo(v.outer, { opacity: 0, scale: 1.22, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.34, ease: "expo.out" }, t);
      tl.fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, t - 0.02);
      tl.fromTo(bg, { filter: "brightness(1.22)" }, { filter: "brightness(1)", duration: 0.6, immediateRender: false }, t);
      const blk = SPEC.blocks.find((b) => b.start <= t + 0.3 && t < b.end) || SPEC.blocks[0];
      const big = (blk.lines.find((l) => l.big) || blk.lines[0]).words.map((w) => w.text).join(" ");
      const echo = h("div", "d-echo", esc(big)); root.appendChild(echo);
      tl.fromTo(echo, { opacity: 0.2, scale: 1 }, { opacity: 0, scale: 1.18, duration: 0.9, ease: "power2.out", immediateRender: false }, t);
    } else if (tr === "chicote") {
      tl.fromTo(v.outer, { opacity: 0, x: 420, scaleX: 1.15, filter: "blur(14px)" }, { opacity: 1, x: 0, scaleX: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, t);
      tl.fromTo(flash, { opacity: 0.55 }, { opacity: 0, duration: 0.22, immediateRender: false }, t - 0.03);
    } else {
      tl.fromTo(v.outer, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, t);
    }
    if (prev) {
      if (tr === "impacto") tl.to(prev.outer, { opacity: 0, scale: 1.3, filter: "blur(10px)", duration: 0.16, ease: "power2.in" }, t - 0.12);
      else if (tr === "chicote") tl.to(prev.outer, { opacity: 0, x: -420, scaleX: 1.15, filter: "blur(14px)", duration: 0.14, ease: "power2.in" }, t - 0.1);
      else if (tr === "corte") tl.set(prev.outer, { opacity: 0 }, t);
      else tl.to(prev.outer, { opacity: 0, scale: 0.97, duration: 0.14, ease: "power1.in" }, t - 0.1);
    }
  });

  // blocos de texto: palavra a palavra, no tempo da fala (fantasma cinza → tinta da esquerda pra direita)
  SPEC.blocks.forEach((b, bi) => {
    tl.set(b.el, { opacity: 1 }, b.start);
    for (const ln of b.lines) for (const w of ln.words) {
      const d = clamp(w.t1 - w.t0, 0.12, 0.42), g = w.el.querySelector(".g"), k = w.el.querySelector(".k");
      tl.fromTo(g, { opacity: 0, y: 10, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out" }, Math.max(0, w.t0 - 0.06));
      tl.fromTo(k, { clipPath: "inset(-10% 100% -10% 0%)" }, { clipPath: "inset(-10% 0% -10% 0%)", duration: d, ease: "none" }, w.t0);
      const hl = w.el.querySelector(".hl"); if (hl) tl.fromTo(hl, { scaleX: 0 }, { scaleX: 1, duration: d * 0.9, ease: "power2.out" }, w.t0);
      const ul = w.el.querySelector(".ul, .st"); if (ul) tl.fromTo(ul, { scaleX: 0 }, { scaleX: 1, duration: 0.24, ease: "power2.out" }, w.t0 + d);
      const ring = w.el.querySelector("svg.ring path"); if (ring) tl.fromTo(ring, { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.36, ease: "power1.inOut" }, w.t0 + d);
    }
    if (b.end < DUR) tl.to(b.el, { opacity: 0, scale: 1.03, filter: "blur(6px)", duration: 0.14, ease: "power1.in" }, b.end - 0.14);
    if (bi > 0) tl.to(sticker, { rotation: bi % 2 ? 5 : -7, duration: 0.3, ease: "back.out(2)" }, b.start);
  });

  // ---------------------------------------------------------- QA: o que está na tela agora
  window.__qa = {
    frame() {
      const vis = (e) => parseFloat(getComputedStyle(e).opacity) > 0.05;
      const R = (r) => ({ x: r.x, y: r.y, w: r.width, h: r.height });
      const texts = [];
      for (const b of SPEC.blocks) if (vis(b.el)) for (const ln of b.lines) { const rg = document.createRange(); rg.selectNodeContents(ln.el); const r = rg.getBoundingClientRect(), lb = ln.el.getBoundingClientRect();
        // largura das letras, altura da linha (a caixa da fonte Anton é bem mais alta que as maiúsculas)
        texts.push({ kind: ln.big ? "big" : "small", text: ln.words.map((w) => w.text).join(" "), px: parseFloat(getComputedStyle(ln.el).fontSize), rect: { x: r.x, y: lb.y, w: r.width, h: lb.height } }); }
      const sources = qa.credits.filter(vis).map((c) => { const s = c.querySelector("span"); return { text: s.textContent, rect: R(s.getBoundingClientRect()) }; });
      const on = qa.visuals.filter((v) => vis(v.outer));
      // o que se vê de cada plano: caixas de layout (linhas, colunas) são abertas até os elementos que aparecem
      const seen = (e, stop) => { let op = 1; for (let x = e; x && x !== stop; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity); return op > 0.05; };
      const leaves = (e, out, stop) => { for (const k of e.children) { if (k.matches(".d-row, .d-words, .d-eq")) leaves(k, out, stop); else if (seen(k, stop)) out.push(k); } return out; };
      const heroes = on.map((v) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const k of leaves(v.inner, [], v.outer)) { const r = k.getBoundingClientRect(); if (r.width < 2) continue; x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
        return { name: `v${v.i}:${v.tipo}`, bleed: v.bleed, rect: x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null }; }).filter((h) => h.rect);
      const photos = [];
      for (const v of on) for (const p of v.photos) { const r = p.win.getBoundingClientRect(); let e = p.win, op = 1; while (e && e !== root) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
        if (op > 0.3 && r.width > 4) { const m = M[p.id], ir = p.win.querySelector("img").getBoundingClientRect();
          photos.push({ id: p.id, bleed: !!p.bleed, rect: R(r), upscale: Math.max(ir.width / m.w, ir.height / m.h) }); } }
      return { scene: on.length ? `v${on[on.length - 1].i}` : "-", texts, sources, heroes, photos };
    },
  };
  return tl;
}
