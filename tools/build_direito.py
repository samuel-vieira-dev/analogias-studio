#!/usr/bin/env python3
"""Build do Estilo Explicando Direito (2D: texto cinético sobre papel cinza + fotos, cartões e gráficos).

Chamado por tools/build.py quando video.json → "estilo" é "explicando-direito" (mesma linha de comando).
Lê     video.json (texto, visuais, media, icone, post), audio/words.json, channel.yaml → estilos.explicando-direito,
       config/layout.json (zonas), engine2d/ (motor, ícones, CSS, fontes Anton)
Grava  videos/<slug>/build/          projeto HyperFrames (index.html + compositions/board.html)
       videos/<slug>/qa/harness.html página única para tools/qa.cjs, tools/preview.cjs e tools/capa.cjs

Texto (video.json → "texto"): um item por bloco de tela, linhas separadas por "|", linha que começa com "#"
é a grande. [palavra] = caixa amarela; [palavra|preto|verde|vermelho|circulo|sublinhado|riscado] = outros
destaques. O texto da tela é a fala: cada palavra acende no tempo em que é dita (audio/words.json).
Visuais (video.json → "visuais"): "em": "trecho da fala" (ou "t": segundos) diz quando cada um entra; o
mesmo vale para itens, destaques, carimbos etc. Detalhes: docs/explicando-direito/visual.md.
"""
import base64
import difflib
import json
import re
import sys
from pathlib import Path

import numpy as np
import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build import GSAP, HF_VERSION, prepare_media, write  # noqa: E402
from transcribe import norm  # noqa: E402

ENGINE = ROOT / "engine2d"
KINDS = {"fotos", "foto-cheia", "cartao", "nota", "documento", "barras", "rosca", "pessoas", "hemiciclo", "fluxo",
         "bifurcacao", "balanca", "celular", "conexoes", "palavras", "icone", "numeros"}
TRANSITIONS = {"suave", "corte", "impacto", "chicote"}
HIGHLIGHTS = {"amarelo", "preto", "verde", "vermelho", "circulo", "sublinhado", "riscado"}
FUNCTION_WORDS = {"a", "o", "as", "os", "de", "do", "da", "dos", "das", "e", "em", "no", "na", "nos", "nas", "um", "uma",
                  "que", "se", "por", "pra", "para", "pelo", "pela", "ao", "à", "às", "aos", "com", "é", "ou"}
TIME_KEYS = {"t", "destaque", "riscar", "apagar", "rotuloT"}
LEAD = 0.08   # o visual entra um pouco antes da palavra que ele mostra


def die(msg):
    sys.exit("explicando-direito: " + msg)


# ---------------------------------------------------------------- fala: tokens com tempo
def speech_tokens(words):
    """[(token, start, end)] from words.json, numbers spelled out like tools/transcribe.py does."""
    out = []
    for s, e, w in words:
        toks = norm(w)
        for i, tk in enumerate(toks):
            a = s + (e - s) * i / len(toks)
            out.append((tk, a, s + (e - s) * (i + 1) / len(toks)))
    return out


# ---------------------------------------------------------------- texto da tela
SEG = re.compile(r"\[([^\]|]+)(?:\|([a-z]+))?\]|(\S+)")


def parse_block(src):
    lines = []
    for raw in split_lines(src):
        raw = raw.strip()
        if not raw:
            continue
        big = raw.startswith("#")
        words = []
        for m in SEG.finditer(raw.lstrip("#").strip()):
            if m.group(1):
                style = m.group(2) or "amarelo"
                if style not in HIGHLIGHTS:
                    die(f"destaque '{style}' não existe em [{m.group(1)}|{style}] (use {', '.join(sorted(HIGHLIGHTS))})")
                words += [{"text": w, "hl": style} for w in m.group(1).split()]
            else:
                words.append({"text": m.group(3), "hl": None})
        for w in words:
            w["fn"] = big and not w["hl"] and w["text"].lower().strip(",.:;!?") in FUNCTION_WORDS and len(words) > 1
        lines.append({"big": big, "words": words})
    if not lines:
        die(f"bloco de texto vazio: {src!r}")
    return lines


def split_lines(src):
    """Split on | outside [ ] (inside, | separates the highlight style)."""
    out, cur, depth = [], "", 0
    for ch in src:
        depth += ch == "["
        depth -= ch == "]"
        if ch == "|" and depth == 0:
            out.append(cur); cur = ""
        else:
            cur += ch
    out.append(cur)
    return out


def align_text(blocks, toks, dur):
    """Give each screen word t0/t1 from the narration (global alignment of normalised tokens)."""
    screen = []   # (token, block, line, word)
    for bi, b in enumerate(blocks):
        for li, ln in enumerate(b["lines"]):
            for wi, w in enumerate(ln["words"]):
                for tk in norm(w["text"]):
                    screen.append((tk, bi, li, wi))
    sm = difflib.SequenceMatcher(None, [s[0] for s in screen], [t[0] for t in toks], autojunk=False)
    hit = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            hit[a + k] = b + k
    times = {}
    for i, (_, bi, li, wi) in enumerate(screen):
        if i in hit:
            _, s, e = toks[hit[i]]
            t = times.setdefault((bi, li, wi), [s, e])
            t[1] = max(t[1], e)
    flat = [(bi, li, wi) for bi, b in enumerate(blocks) for li, ln in enumerate(b["lines"]) for wi, _ in enumerate(ln["words"])]
    known = [k for k in flat if k in times]
    if len(known) < 0.8 * len(flat):
        die(f"só {len(known)} de {len(flat)} palavras da tela batem com a fala (audio/words.json): o 'texto' precisa ser a narração")
    # words with no match (ordinals, symbols) are spread between their neighbours
    for idx, k in enumerate(flat):
        if k in times:
            continue
        prev = next((times[flat[j]][1] for j in range(idx - 1, -1, -1) if flat[j] in times), 0.0)
        nxt_i = next((j for j in range(idx + 1, len(flat)) if flat[j] in times), None)
        nxt = times[flat[nxt_i]][0] if nxt_i is not None else min(dur, prev + 0.4)
        gap = [j for j in range(idx, nxt_i if nxt_i is not None else len(flat)) if flat[j] not in times]
        span = max(0.12, nxt - prev)
        for n, j in enumerate(gap):
            times[flat[j]] = [prev + span * n / len(gap), prev + span * (n + 1) / len(gap)]
    for (bi, li, wi), (s, e) in times.items():
        w = blocks[bi]["lines"][li]["words"][wi]
        w["t0"], w["t1"] = round(s, 3), round(e, 3)
    missing = len(toks) - len(set(hit.values()))
    for bi, b in enumerate(blocks):
        ws = [w for ln in b["lines"] for w in ln["words"]]
        b["start"] = round(max(0.0, min(w["t0"] for w in ws) - 0.1), 3)
    for bi, b in enumerate(blocks):
        b["end"] = round(blocks[bi + 1]["start"] - 0.02, 3) if bi + 1 < len(blocks) else dur
        if b["end"] <= b["start"]:
            die(f"bloco {bi + 1} ({' '.join(w['text'] for ln in b['lines'] for w in ln['words'])!r}) fora de ordem com a fala")
    return len(known), len(flat), missing


# ---------------------------------------------------------------- visuais: âncoras na fala
def find_anchor(phrase, toks, cursor):
    want = norm(phrase)
    if not want:
        die(f"âncora vazia: {phrase!r}")
    seq = [t[0] for t in toks]
    for start in (cursor, 0):
        for i in range(start, len(seq) - len(want) + 1):
            if seq[i:i + len(want)] == want:
                return i
    near = " ".join(seq[cursor:cursor + 14])
    die(f"âncora {phrase!r} não está na fala (a partir de: “{near}…”); use as palavras exatas da narração")


def resolve(obj, toks, cursor, base_t, path):
    """Replace every {"em": "..."} by t and every string time field by its time; fill defaults."""
    if isinstance(obj, list):
        for i, x in enumerate(obj):
            resolve(x, toks, cursor, base_t, f"{path}[{i}]")
        return
    if not isinstance(obj, dict):
        return
    if "em" in obj:
        i = find_anchor(obj.pop("em"), toks, cursor)
        obj["t"] = round(max(0.0, toks[i][1] - LEAD), 3)
    for k in list(obj):
        v = obj[k]
        if k in TIME_KEYS and isinstance(v, str):
            obj[k] = round(max(0.0, toks[find_anchor(v, toks, cursor)][1] - LEAD), 3)
        elif isinstance(v, dict) and k not in ("media",):
            resolve(v, toks, cursor, base_t, f"{path}.{k}")
            if "t" not in v and k in ("cartao", "nota", "carimbo", "delta", "tag", "pesa", "centro", "marca", "destaque"):
                v["t"] = round(base_t + 0.35, 3)
        elif isinstance(v, list):
            resolve(v, toks, cursor, base_t, f"{path}.{k}")
    return obj


def resolve_visuals(video, toks, media):
    vis = video.get("visuais") or die("video.json sem 'visuais'")
    cursor = 0
    for i, v in enumerate(vis):
        if v.get("tipo") not in KINDS:
            die(f"visual {i}: tipo {v.get('tipo')!r} não existe (use {', '.join(sorted(KINDS))})")
        if v.get("transicao", "suave") not in TRANSITIONS:
            die(f"visual {i}: transicao {v['transicao']!r} (use {', '.join(sorted(TRANSITIONS))})")
        if "em" in v:
            cursor = find_anchor(v.pop("em"), toks, cursor)
            v["t"] = round(max(0.0, toks[cursor][1] - LEAD), 3) if i else 0.0
        if "t" not in v:
            die(f"visual {i} ({v['tipo']}) sem 'em' nem 't'")
        v_t = v["t"]
        resolve(v, toks, cursor, v_t, f"visuais[{i}]")   # itens, destaques, carimbos: âncoras a partir da do visual
        for k in ("itens", "barras", "grupos", "setas", "ligacoes", "linhas", "mensagens", "lista", "destaques", "pessoas"):
            for it in v.get(k) or []:
                if isinstance(it, dict) and "t" not in it and k not in ("linhas", "mensagens", "lista", "pessoas", "itens"):
                    it["t"] = v_t
        for mid in [v.get("media")] + [it.get("media") for it in (v.get("itens") or []) + (v.get("pessoas") or []) if isinstance(it, dict)]:
            if mid and mid not in media:
                die(f"visual {i}: foto {mid!r} não está em video.json → media")
    ts = [v["t"] for v in vis]
    if any(b < a for a, b in zip(ts, ts[1:])):
        die("visuais fora de ordem no tempo: " + ", ".join(f"{t:.2f}" for t in ts))
    return vis


# ---------------------------------------------------------------- papel (fundo), determinístico
def paper(path: Path, base):
    if path.exists():
        return path
    from PIL import Image, ImageDraw, ImageFilter
    rng = np.random.default_rng(7)
    W, H = 1160, 2000
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot((xx - W / 2) / W, (yy - H * 0.42) / H)
    lum = 9 - 26 * r ** 1.6                                                    # mais claro no meio
    low = np.asarray(Image.fromarray((rng.random((26, 15)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), dtype=float) / 255
    lum += (low - 0.5) * 9                                                      # manchas largas
    lum += rng.normal(0, 3.2, (H, W))                                           # grão
    rgb = np.clip(np.array(base, dtype=float)[None, None, :] + lum[..., None], 0, 255).astype(np.uint8)
    im = Image.fromarray(rgb)
    over = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(over)
    for _ in range(46):                                                         # rachaduras finas
        x, y, a = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0, 2 * np.pi)
        pts = [(x, y)]
        for _ in range(int(rng.integers(8, 26))):
            a += rng.normal(0, 0.45)
            x += 14 * np.cos(a); y += 14 * np.sin(a); pts.append((x, y))
        d.line(pts, fill=int(rng.integers(30, 60)), width=int(rng.integers(1, 3)))
    for _ in range(2600):                                                       # pontinhos
        x, y, rr = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0.6, 2.0)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=int(rng.integers(40, 120)))
    over = over.filter(ImageFilter.GaussianBlur(0.6))
    dark = Image.new("RGB", (W, H), (88, 98, 106))
    im = Image.composite(dark, im, over)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, quality=86)
    return path


def data_url(path: Path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


# ---------------------------------------------------------------- páginas
def board_parts(spec, cfg, root_id):
    cores = cfg["cores"]
    fonts = "".join(f"@font-face {{ font-family:'Anton'; font-weight:400; font-display:block; src:url({data_url(ENGINE / 'fonts' / f, 'font/woff2')}) format('woff2'); }}\n"
                    for f in ("Anton-latin.woff2", "Anton-latin-ext.woff2"))
    css = (ENGINE / "direito.css").read_text().replace("#ROOT", "#" + root_id)
    vars_ = "#%s { %s --big-px:%dpx; --small-px:%dpx; }" % (root_id, " ".join(f"--{k}:{v};" for k, v in cores.items()), cfg["texto"]["grande_px"], cfg["texto"]["pequeno_px"])
    js = (ENGINE / "icones.js").read_text() + "\n" + (ENGINE / "direito.js").read_text()
    script = f"""(function () {{
{js}
      const SPEC = {json.dumps(spec, ensure_ascii=False)};
      Promise.all([document.fonts.load("400 100px Anton"), document.fonts.load("700 30px Inter"), document.fonts.load("600 24px Inter")]).then(() => document.fonts.ready).then(() => {{
        const tl = buildDireito(document.getElementById("{root_id}"), SPEC);
        window.__timelines = window.__timelines || {{}};
        window.__timelines["board"] = tl;
      }});
    }})();"""
    return fonts + vars_ + "\n" + css, script


def main(vdir: Path):
    layout = json.loads((ROOT / "config/layout.json").read_text())
    channel = yaml.safe_load((ROOT / "channel.yaml").read_text())
    cfg = channel["estilos"]["explicando-direito"]
    video = json.loads((vdir / "video.json").read_text())
    dur = float(video["duration"])
    words = json.loads((vdir / video["audio"]["words"]).read_text())
    toks = speech_tokens(words)
    out = vdir / "build"
    (out / "compositions").mkdir(parents=True, exist_ok=True)
    media, small = prepare_media(vdir, video, out)
    for mid, m in media.items():
        m["credit"] = video["media"][mid]["credit"]

    blocks = [{"lines": parse_block(s)} for s in video.get("texto") or die("video.json sem 'texto'")]
    matched, total, spoken_off = align_text(blocks, toks, dur)
    visuals = resolve_visuals(video, toks, media)
    icone = video.get("icone", cfg.get("icone_padrao", "balanca"))
    handle = channel["canal"]["handle"].upper()
    cut = handle.rfind(".")
    spec = {"dur": dur, "layout": {"safe": layout["safe"], "zones": layout["zones"]}, "media": media, "icone": icone,
            "handle": [handle[:cut], handle[cut:]] if cut > 0 else [handle, ""],
            "pillY": layout["zones"]["caption"]["y"] + 58, "paper": data_url(paper(ROOT / "engine2d/.cache/papel.jpg", cfg["papel_rgb"]), "image/jpeg"),
            "blocks": blocks, "visuals": visuals}

    style, script = board_parts(spec, cfg, "root")
    board = f"""<template>
  <style>
{style}
  </style>
  <div id="root" data-composition-id="board" data-width="1080" data-height="1920"></div>
  <script>
    {script}
  </script>
</template>
"""
    mix = vdir / "audio/mix.wav"
    audio = ""
    if mix.exists():
        (out / "assets").mkdir(parents=True, exist_ok=True)
        dst = out / "assets/mix.wav"
        if not dst.exists() or dst.read_bytes() != mix.read_bytes():
            dst.write_bytes(mix.read_bytes())
        audio = f'\n      <audio id="mix" class="clip" src="assets/mix.wav" data-start="0" data-duration="{dur}" data-track-index="4" data-volume="1"></audio>'
    index = f"""<!doctype html>
<!-- generated by tools/build_direito.py — edit video.json or engine2d/, not this file -->
<html lang="pt-BR" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="{GSAP}"></script>
    <style>
      * {{ margin:0; padding:0; box-sizing:border-box; }}
      html, body {{ margin:0; width:1080px; height:1920px; overflow:hidden; background:{cfg['cores']['papel']}; }}
      #main {{ width:100%; height:100%; position:relative; }}
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920">
      <div id="board" data-composition-id="board" data-composition-src="compositions/board.html" data-start="0" data-duration="{dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>{audio}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""
    h_style, h_script = board_parts(spec, cfg, "bd-root")
    harness = f"""<!doctype html>
<html><head><meta charset="UTF-8" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=block" />
<script src="{GSAP}"></script>
<script>window.__timelines = {{}};</script>
<style>
html, body {{ margin:0; width:1080px; height:1920px; overflow:hidden; background:#000; }}
#bd-root {{ position:absolute; left:0; top:0; width:1080px; height:1920px; }}
{h_style}
</style></head><body>
<div id="bd-root" data-qa-composition="board"></div>
<script>{h_script}</script>
<script>
window.__seek = function (t) {{ for (const k of Object.keys(window.__timelines)) window.__timelines[k].seek(t, false); }};
window.__qaReady = () => !!(window.__timelines.board && window.__qa);
</script>
</body></html>
"""
    write(out / "compositions/board.html", board)
    for stale in ("world.html", "overlays.html", "captions.html"):
        (out / "compositions" / stale).unlink(missing_ok=True)
    write(out / "index.html", index)
    (vdir / "qa").mkdir(exist_ok=True)
    write(vdir / "qa/harness.html", harness)
    write(out / "hyperframes.json", json.dumps({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"blocks": "compositions", "assets": "assets"}, "media": {"autoProxy": True}}, indent=2))
    write(out / "meta.json", json.dumps({"id": video["slug"], "name": video["slug"]}, indent=2))
    write(out / "package.json", json.dumps({"name": video["slug"], "private": True, "type": "module", "scripts": {
        "check": f"npx --yes hyperframes@{HF_VERSION} check", "render": f"npx --yes hyperframes@{HF_VERSION} render"}}, indent=2))

    # avisos de ritmo (referência: visual novo a cada ~2 s, bloco de texto a cada ~2,6 s)
    warn = []
    ends = [v["t"] for v in visuals[1:]] + [dur]
    for v, e in zip(visuals, ends):
        if e - v["t"] > cfg["ritmo"]["visual_max_s"]:
            warn.append(f"visual {v['tipo']} em {v['t']:.1f}s dura {e - v['t']:.1f}s (máx. {cfg['ritmo']['visual_max_s']} s: troque ou acrescente um elemento)")
    if visuals[0]["t"] > 0.05:
        warn.append("o primeiro visual precisa estar na tela no quadro 0 (é a miniatura do vídeo)")
    hook_tr = [v for v in visuals if 0 < v["t"] <= 3.5 and v.get("transicao") in ("impacto", "chicote")]
    if not hook_tr:
        warn.append("nenhuma transição de impacto/chicote nos primeiros 3,5 s (o gancho da referência tem uma)")
    for b in blocks:
        if b["end"] - b["start"] > cfg["ritmo"]["bloco_max_s"]:
            warn.append(f"bloco {' '.join(w['text'] for ln in b['lines'] for w in ln['words'])!r} fica {b['end'] - b['start']:.1f}s (máx. {cfg['ritmo']['bloco_max_s']} s: quebre em dois)")
        if not any(ln["big"] for ln in b["lines"]):
            warn.append(f"bloco sem linha grande (#): {' '.join(w['text'] for ln in b['lines'] for w in ln['words'])!r}")
    # efeitos sugeridos nos tempos resolvidos (docs/explicando-direito/visual.md → Áudio)
    sfx = []
    for v in visuals:
        if v.get("transicao") == "impacto":
            sfx.append([round(max(0, v["t"] - 0.05), 2), "whoosh-cinematic.mp3", -8])
        elif v.get("transicao") == "chicote":
            sfx.append([round(max(0, v["t"] - 0.05), 2), "whoosh-short.mp3", -10])
        if isinstance(v.get("carimbo"), dict):
            sfx.append([round(v["carimbo"]["t"] + 0.15, 2), "impact-bass-1.mp3", -6])
    print(json.dumps({"build": str(out.relative_to(ROOT) if out.is_relative_to(ROOT) else out), "estilo": "explicando-direito", "duration": dur,
                      "blocos": len(blocks), "palavras_na_tela_com_tempo": f"{matched}/{total}", "falas_fora_da_tela": spoken_off,
                      "visuais": len(visuals), "tempos": [[v["tipo"], v["t"], v.get("transicao", "suave")] for v in visuals], "sfx_sugerido": sfx, "fotos": len(media), "photos_small": small, "audio_in_preview": mix.exists(),
                      "avisos": warn}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main((ROOT / sys.argv[1]).resolve())
