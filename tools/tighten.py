#!/usr/bin/env python3
"""Tighten a narration take: shorten long pauses, then speed up (gently) to fit the target.

usage: python3 tools/tighten.py <take.mp3|wav> videos/<slug>/audio/narration.wav [--target 88] [--max-tempo 1.06]

1. Pauses are found by energy (10 ms frames). A pause longer than --gap keeps --gap seconds
   (--sentence-gap if it was a long, sentence-like pause), with short crossfades.
2. If the result is still longer than --target, it is sped up with ffmpeg atempo (pitch kept),
   never beyond --max-tempo (channel.yaml voz.ritmo_max). If it still does not fit, the script
   is too long for the target: cut text, or accept a longer video.
Writes 48 kHz mono WAV. Re-run tools/transcribe.py on the output to get the final word timings.
"""
import argparse
import subprocess
import sys

import numpy as np

SR = 48000


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def silent_runs(x, frame=0.01, floor_db=-50.0, below_peak_db=38.0):
    n = int(SR * frame)
    m = len(x) // n
    rms = np.sqrt(np.mean(x[: m * n].reshape(m, n) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    thr = max(floor_db, db.max() - below_peak_db)
    quiet = db < thr
    runs, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        elif not q and start is not None:
            runs.append((start * n, i * n)); start = None
    if start is not None:
        runs.append((start * n, m * n))
    return runs


def tighten(x, gap, sentence_gap, lead=0.06, tail=0.35, fade=0.008):
    runs = silent_runs(x)
    keep_lead, keep_tail, f = int(lead * SR), int(tail * SR), int(fade * SR)
    pieces, pos, removed = [], 0, 0.0
    for a, b in runs:
        length = (b - a) / SR
        if a == 0:
            keep = keep_lead
        elif b >= len(x) - SR // 100:
            keep = keep_tail
        else:
            keep = int((sentence_gap if length >= 0.45 else gap) * SR)
        if b - a <= keep:
            continue
        cut0, cut1 = a + keep // 2, b - (keep - keep // 2)
        seg = x[pos:cut0].copy()
        if len(seg) > 2 * f:
            seg[-f:] *= np.linspace(1, 0, f)
        pieces.append(seg)
        nxt = x[cut1:cut1 + f].copy()
        if len(nxt) == f:
            x[cut1:cut1 + f] = nxt * np.linspace(0, 1, f)
        removed += (cut1 - cut0) / SR
        pos = cut1
    pieces.append(x[pos:])
    return np.concatenate(pieces), removed


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--target", type=float, default=88.0, help="max narration length in s (video duration minus the CTA tail)")
    ap.add_argument("--max-tempo", type=float, default=1.06)
    ap.add_argument("--gap", type=float, default=0.22, help="pause kept between words/phrases (s)")
    ap.add_argument("--sentence-gap", type=float, default=0.36, help="pause kept where a long pause was (s)")
    a = ap.parse_args()

    x = decode(a.src)
    d0 = len(x) / SR
    y, removed = tighten(x, a.gap, a.sentence_gap)
    d1 = len(y) / SR
    tempo = 1.0
    if d1 > a.target:
        tempo = min(a.max_tempo, d1 / a.target)
    tmp = a.out + ".tmp.f32"
    y.astype(np.float32).tofile(tmp)
    af = f"atempo={tempo:.4f}" if tempo > 1.0005 else "anull"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp, "-af", af,
                    "-ar", str(SR), "-c:a", "pcm_s24le", a.out], check=True)
    subprocess.run(["rm", "-f", tmp])
    d2 = d1 / tempo
    print(f"original {d0:.1f}s → pausas -{removed:.1f}s → {d1:.1f}s → ritmo x{tempo:.3f} → {d2:.1f}s  ({a.out})")
    if d2 > a.target + 0.05:
        print(f"ATENÇÃO: ainda {d2 - a.target:.1f}s acima do alvo de {a.target}s com o ritmo máximo x{a.max_tempo}. Corte texto do roteiro ou aceite um vídeo mais longo.")
        sys.exit(3)


if __name__ == "__main__":
    main()
