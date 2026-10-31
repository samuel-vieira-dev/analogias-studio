#!/usr/bin/env python3
"""What goes up with the MP4: the caption and the cover.

usage: python3 tools/post.py videos/<slug> [--no-capa]

Writes videos/<slug>/out/<slug>-post.md   TikTok caption ready to paste
       videos/<slug>/out/<slug>-capa.jpg  cover: a hook frame with the title (node tools/capa.cjs)

Caption (TikTok), in order:
  - the hook (brief.yaml), then video.json → post.descricao: 1–2 sentences with the words people
    search for (TikTok search reads the caption)
  - the final question (brief.yaml) and the call to comment (the video's CTA)
  - notices shown on screen that are not sources ("Não é recomendação de investimento.")
  - the first 5 hashtags of video.json → post.hashtags (TikTok: 3–5)
  - Fontes: the names of the sources of the fatos.md rows that made it into the narration
    (status starting with OK and without "fora da fala"); Fotos: the credit of every photo
TikTok links are not clickable and comments stop at 150 characters, so the links of the sources
and photos go below the caption in the file, for checking and for answering comments.
"""
import argparse
import html
import json
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
TT_MAX = 4000   # TikTok caption limit in the app (its posting API stops at 2,200)
TT_TAGS = 5     # TikTok: 3–5 hashtags
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")


def table_rows(md):
    """(fonte, status) cells of every markdown table that has both columns."""
    lines, rows, i = md.splitlines(), [], 0
    cells = lambda l: [c.strip() for c in l.strip().strip("|").split("|")]
    while i < len(lines):
        if lines[i].lstrip().startswith("|") and i + 1 < len(lines) and re.fullmatch(r"\s*\|[\s:|-]+\|\s*", lines[i + 1]):
            head = [c.lower() for c in cells(lines[i])]
            i += 2
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                r = cells(lines[i])
                if "fonte" in head and "status" in head and len(r) == len(head):
                    rows.append((r[head.index("fonte")], r[head.index("status")]))
                i += 1
        else:
            i += 1
    return rows


def fontes(md):
    """[(name, url or None)] of the sources of the facts in the narration, first mention first.
    A source named without a link ("InfoMoney · CUT") takes the link it has elsewhere in the table."""
    rows = table_rows(md)
    known = {}
    for src, _ in rows:
        for n, u in LINK.findall(src):
            known.setdefault(n, u)
    out, seen = [], set()

    def add(name, url):
        key = url or name.lower()
        if key not in seen and (url or name.lower() not in {n.lower() for n, _ in out}):
            seen.add(key)
            out.append((name, url))

    for src, status in rows:
        if not status.upper().startswith("OK") or "fora da fala" in status.lower():
            continue
        for n, u in LINK.findall(src):
            add(n, u)
        for n in re.split(r"[·,;]", re.sub(r"\([^)]*\)", "", LINK.sub("", src))):
            n = n.strip(" .")
            if not n or re.fullmatch(r"fatos? [\d, e]+", n, re.I):  # "fato 1": a row of the same table
                continue
            add(n, known.get(n) or next((u for k, u in known.items() if k.startswith(n + " ")), None))
    return out


def tags(video):
    raw = (video.get("post") or {}).get("hashtags") or []
    out = ["#" + re.sub(r"\s+", "", t).lstrip("#") for t in raw]
    if not 3 <= len(out) <= 8:
        raise ValueError(f"video.json → post.hashtags: {len(out)} hashtags (o post pede 3–5 do tema)")
    return out[:TT_TAGS]


def short_name(n):
    """'TCU — visão CBS 2027', 'O Povo, 28/07/2025', 'Exame dez./2024', 'LC 214/2025 (lei da reforma)'
    → 'TCU', 'O Povo', 'Exame', 'LC 214/2025'."""
    n = re.sub(r"\s*\([^)]*\)", "", n.split(" — ")[0])
    return re.sub(r"[\s,]+(\d{1,2}/\d{1,2}(/\d{2,4})?|[a-zç]{3,4}\.?/\d{2,4}|\d{4})$", "", n).strip()


def caption(vdir, video):
    """(caption, links of sources and photos, sources, photos)."""
    brief = yaml.safe_load((vdir / "brief.yaml").read_text())
    ov = video.get("overlays", [])
    cta = next((re.sub(r"<[^>]+>", "", html.unescape(o["html"])).strip() for o in ov if o["kind"] == "cta"), "Comenta aqui embaixo")
    desc = ((video.get("post") or {}).get("descricao") or "").strip()
    head = [brief["hook"]["texto"].strip()] + ([desc] if desc else [])
    ask = [brief["pergunta_final"]["texto"].strip(), cta + ("" if cta[-1] in ".!?" else ".")]
    notes = list(dict.fromkeys(o["text"] for o in ov if o["kind"] == "source" and not re.match(r"(fontes?|fotos?)\b", o["text"], re.I)))
    src = fontes((vdir / "fatos.md").read_text())
    photos = [(m["credit"], m.get("url")) for m in (video.get("media") or {}).values()]
    names = [n for n in dict.fromkeys(short_name(n) for n, _ in src)  # a bare date or "idem" is not a name
             if not re.fullmatch(r"[\d/.\s]*|[a-zç]{3,4}\.?/\d{2,4}|idem", n, re.I)]
    text = "\n\n".join(["\n\n".join(head), "\n".join(ask)] + (["\n".join(notes)] if notes else []) + [" ".join(tags(video))])
    text += ("\n\nFontes: " + " · ".join(names) if names else "") + ("\nFotos: " + " · ".join(n for n, _ in photos) if photos else "")
    bullet = lambda n, u: f"• {n}: {u}" if u else f"• {n}"
    links = "\n".join(["Fontes:"] + [bullet(n, u) for n, u in src] + (["", "Fotos:"] + [bullet(n, u) for n, u in photos] if photos else []))
    return text, links, src, photos


def make(vdir, capa=True):
    """Writes out/<slug>-post.md and, with capa, out/<slug>-capa.jpg. Returns (files, problems)."""
    video = json.loads((vdir / "video.json").read_text())
    slug, out = video["slug"], vdir / "out"
    out.mkdir(exist_ok=True)
    files, problems = [], []
    try:
        text, links, src, photos = caption(vdir, video)
        md = [f"# Post TikTok · {slug}", "",
              f"- Vídeo: `{slug}.mp4` · capa: `{slug}-capa.jpg` (escolher como capa no TikTok; o perfil mostra o recorte 3:4 do meio)",
              f"- Legenda: {len(text)} de {TT_MAX} caracteres (limite do TikTok) · {len(src)} fontes · {len(photos)} fotos",
              "", "## Legenda", "", "```text", text, "```", "",
              "## Links das fontes e fotos (fora da legenda)", "",
              "No TikTok link não é clicável e comentário vai até 150 caracteres: os links ficam aqui para conferir e responder comentários.",
              "", "```text", links, "```", ""]
        if len(text) > TT_MAX:
            problems.append(f"legenda com {len(text)} caracteres (TikTok corta em {TT_MAX})")
        if not src:
            problems.append("nenhuma fonte com status OK em fatos.md")
        if "descricao" not in (video.get("post") or {}):
            problems.append("video.json → post.descricao vazio (1–2 frases com as palavras que o público busca no TikTok)")
        f = out / f"{slug}-post.md"
        f.write_text("\n".join(md))
        files.append(f)
        print(f"{f.relative_to(ROOT) if f.is_relative_to(ROOT) else f}: legenda {len(text)} caracteres, {len(src)} fontes, {len(photos)} fotos" )
    except (ValueError, KeyError, FileNotFoundError) as e:
        problems.append(f"post: {e}")
    if capa:
        r = subprocess.run(["node", str(ROOT / "tools/capa.cjs"), str(vdir)], capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        c = out / f"{slug}-capa.jpg"
        if r.returncode == 0 or (r.returncode == 1 and c.exists()):
            files.append(c)
        if r.returncode:
            problems.append("capa: " + (r.stderr.strip() or f"tools/capa.cjs saiu com {r.returncode}"))
    return files, problems


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video_dir"); ap.add_argument("--no-capa", action="store_true")
    a = ap.parse_args()
    files, problems = make((ROOT / a.video_dir).resolve(), capa=not a.no_capa)
    if problems:
        print("ATENÇÃO: " + "; ".join(problems))
        sys.exit(1)


if __name__ == "__main__":
    main()
