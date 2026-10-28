#!/usr/bin/env python3
"""What goes up with the MP4: the caption and the cover.

usage: python3 tools/post.py videos/<slug> [--no-capa]

Writes videos/<slug>/out/<slug>-post.md   caption ready to paste (Reels, TikTok, Shorts)
       videos/<slug>/out/<slug>-capa.jpg  cover: a hook frame with the title (node tools/capa.cjs)

Caption, in order:
  - the hook and the final question (brief.yaml) and the call to comment (the video's CTA)
  - notices shown on screen that are not sources ("Não é recomendação de investimento.")
  - 5–8 hashtags of the theme (video.json → post.hashtags)
  - Fontes: the sources of the fatos.md rows that made it into the narration
    (status starting with OK and without "fora da fala")
  - Fotos: credit and link of every photo (video.json → media)
Instagram cuts captions at 2,200 characters: when the sources with links do not fit, the caption
lists them by name and the file adds the links as a comment to pin.
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
IG_MAX = 2200
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
    if not 5 <= len(out) <= 8:
        raise ValueError(f"video.json → post.hashtags: {len(out)} hashtags (o post pede 5–8 do tema)")
    return out


def parts(title, lines):
    """Split a list into comments that fit Instagram: "Fontes (1/2):" ..."""
    out, cur = [], []
    for l in lines:
        if cur and len("\n".join(cur + [l])) + 20 > IG_MAX:
            out.append(cur); cur = []
        cur.append(l)
    out.append(cur)
    return [(f"{title} ({i + 1}/{len(out)}):" if len(out) > 1 else f"{title}:") + "\n" + "\n".join(p) for i, p in enumerate(out)]


def caption(vdir, video):
    """(caption, comments to pin, sources, photos)."""
    brief = yaml.safe_load((vdir / "brief.yaml").read_text())
    ov = video.get("overlays", [])
    cta = next((re.sub(r"<[^>]+>", "", html.unescape(o["html"])).strip() for o in ov if o["kind"] == "cta"), "Comenta aqui embaixo")
    head = [brief["hook"]["texto"].strip(), brief["pergunta_final"]["texto"].strip(), cta + ("" if cta[-1] in ".!?" else ".")]
    notes = list(dict.fromkeys(o["text"] for o in ov if o["kind"] == "source" and not re.match(r"(fontes?|fotos?)\b", o["text"], re.I)))
    src = fontes((vdir / "fatos.md").read_text())
    photos = [(m["credit"], m.get("url")) for m in (video.get("media") or {}).values()]
    bullet = lambda n, u: f"• {n}: {u}" if u else f"• {n}"
    top = "\n".join(head) + ("\n\n" + "\n".join(notes) if notes else "") + "\n\n" + " ".join(tags(video))
    tail = "\n\nFotos:\n" + "\n".join(bullet(n, u) for n, u in photos) if photos else ""
    full = top + ("\n\nFontes:\n" + "\n".join(bullet(n, u) for n, u in src) if src else "") + tail
    if len(full) <= IG_MAX:
        return full, [], src, photos
    # "Planalto — biografia", "O Povo, 28/07/2025" → "Planalto", "O Povo"
    names = ", ".join(dict.fromkeys(re.sub(r",\s*\d{1,2}/\d{1,2}/\d{4}$", "", n.split(" — ")[0]) for n, _ in src))
    short = top + f"\n\nFontes: {names}. Links no comentário fixado." + tail
    return short, parts("Fontes", [bullet(n, u) for n, u in src]), src, photos


def make(vdir, capa=True):
    """Writes out/<slug>-post.md and, with capa, out/<slug>-capa.jpg. Returns (files, problems)."""
    video = json.loads((vdir / "video.json").read_text())
    slug, out = video["slug"], vdir / "out"
    out.mkdir(exist_ok=True)
    files, problems = [], []
    try:
        text, pins, src, photos = caption(vdir, video)
        md = [f"# Post · {slug}", "",
              f"- Vídeo: `{slug}.mp4` · capa: `{slug}-capa.jpg` (subir como capa do Reels; o perfil mostra o recorte 3:4 do meio)",
              f"- Legenda: {len(text)} de {IG_MAX} caracteres (limite do Instagram) · {len(src)} fontes · {len(photos)} fotos",
              "", "## Legenda", "", "```text", text, "```", ""]
        for i, pin in enumerate(pins):
            md += [f"## Comentário fixado{f' {i + 1}' if len(pins) > 1 else ''} (fontes com link)", "", "```text", pin, "```", ""]
        if len(text) > IG_MAX:
            problems.append(f"legenda com {len(text)} caracteres (Instagram corta em {IG_MAX})")
        if not src:
            problems.append("nenhuma fonte com status OK em fatos.md")
        f = out / f"{slug}-post.md"
        f.write_text("\n".join(md))
        files.append(f)
        print(f"{f.relative_to(ROOT) if f.is_relative_to(ROOT) else f}: legenda {len(text)} caracteres, {len(src)} fontes, {len(photos)} fotos" + (f", links das fontes em {len(pins)} comentário(s) fixado(s)" if pins else ""))
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
