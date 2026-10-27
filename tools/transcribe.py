#!/usr/bin/env python3
"""Word timings for narration takes (faster-whisper, local and free).

usage:
  python3 tools/transcribe.py <audio> --out videos/<slug>/audio/words.json [--ref videos/<slug>/narracao.txt]
  python3 tools/transcribe.py take1.mp3 take2.mp3 --ref videos/<slug>/narracao.txt     # compare takes

Writes [[start, end, word], ...] in seconds (one file per input: --out, or <audio>.words.json).
With --ref, scores each take against the approved narration (0–1) and lists the words that
differ, so a skipped or misread line is caught before anything is built on top of it.
The best take is printed last as  ESCOLHIDO: <file>.
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 16000


def decode(path):
    """Any audio → mono float32 at 16 kHz (avoids PyAV metadata quirks)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


UNI = "zero um dois três quatro cinco seis sete oito nove dez onze doze treze quatorze quinze dezesseis dezessete dezoito dezenove".split()
DEZ = "_ _ vinte trinta quarenta cinquenta sessenta setenta oitenta noventa".split()
CEN = "_ cento duzentos trezentos quatrocentos quinhentos seiscentos setecentos oitocentos novecentos".split()
SAME = {"para": "pra", "iorque": "york", "catorze": "quatorze"}


def num_pt(n):
    """Integer 0–999999 in Brazilian Portuguese words (enough for years, prices, percents)."""
    if n < 20:
        return UNI[n]
    if n < 100:
        return DEZ[n // 10] + ("" if n % 10 == 0 else " e " + UNI[n % 10])
    if n < 1000:
        if n == 100:
            return "cem"
        return CEN[n // 100] + ("" if n % 100 == 0 else " e " + num_pt(n % 100))
    k, r = divmod(n, 1000)
    head = "mil" if k == 1 else num_pt(k) + " mil"
    return head if r == 0 else head + (" e " if r < 100 or r % 100 == 0 else " ") + num_pt(r)


def norm(s):
    """Words for comparison: lower case, numbers spelled out, % as 'por cento', common variants unified."""
    s = s.lower().replace("%", " por cento ")
    s = re.sub(r"(\d)\.(\d{3})", r"\1\2", s)                     # 176.608 → 176608
    s = re.sub(r"\d+", lambda m: " " + num_pt(int(m.group())) + " " if len(m.group()) <= 6 else m.group(), s)
    return [SAME.get(w, w) for w in re.findall(r"[a-zà-úç0-9]+", s)]


def pauses(words):
    gaps = [b[0] - a[1] for a, b in zip(words, words[1:])]
    return max(gaps) if gaps else 0.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("audio", nargs="+")
    ap.add_argument("--out", help="output words.json (single input only)")
    ap.add_argument("--ref", help="approved narration text (narracao.txt)")
    ap.add_argument("--prompt", default="", help="names and jargon that help recognition, e.g. 'Ibovespa, B3, circuit breaker'")
    ap.add_argument("--model", default="medium")
    a = ap.parse_args()
    if a.out and len(a.audio) > 1:
        sys.exit("--out only works with one input")

    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    ref = norm(Path(a.ref).read_text()) if a.ref else None
    prompt = a.prompt or (Path(a.ref).read_text()[:400] if a.ref else None)

    results = []
    for path in a.audio:
        audio = decode(path)
        segs, _ = model.transcribe(audio, language="pt", word_timestamps=True, initial_prompt=prompt, vad_filter=False)
        words = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
        out = Path(a.out) if a.out else Path(str(path) + ".words.json")
        out.write_text(json.dumps(words, ensure_ascii=False))
        dur = len(audio) / SR
        row = {"take": path, "dur": dur, "words": len(words), "wps": len(words) / max(dur, 1e-6), "max_pause": pauses(words), "out": str(out)}
        if ref is not None:
            hyp = norm(" ".join(w[2] for w in words))
            sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
            row["match"] = sm.ratio()
            row["diffs"] = [(" ".join(ref[i1:i2]), " ".join(hyp[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
        results.append(row)

    for r in results:
        m = f"  match {r['match']:.3f}" if "match" in r else ""
        print(f"{r['take']}: {r['dur']:.1f}s  {r['words']} palavras  {r['wps']:.2f} pal/s  maior pausa {r['max_pause']:.2f}s{m}  → {r['out']}")
        for want, got in r.get("diffs", [])[:12]:
            print(f"    roteiro: {want!r:40}  áudio: {got!r}")
    if len(results) > 1 and ref is not None:
        best = max(results, key=lambda r: (round(r["match"], 2), -r["max_pause"]))
        print(f"ESCOLHIDO: {best['take']}")


if __name__ == "__main__":
    main()
