#!/usr/bin/env python3
"""Narration takes from the local VoiceStudio app (OmniVoice, free, runs on this Mac).

usage: python3 tools/voice.py videos/<slug> [--takes 2]

Reads   videos/<slug>/narracao.txt and channel.yaml voz (the same voice for every estilo)
Writes  videos/<slug>/audio/takes/take-<n>.wav  (one per seed; pick with tools/transcribe.py)

VoiceStudio must be open (its API listens on channel.yaml voz.url). Each take is a different
seed; long text is split at sentence ends (voz.max_chunk_chars) so no line is skipped.
"""
import argparse
import random
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def post_form(url, fields, timeout):
    """multipart/form-data POST with plain text fields; returns (headers, body)."""
    boundary = uuid.uuid4().hex
    body = b"".join(
        f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        for k, v in fields.items()
    ) + f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.headers, r.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_dir")
    ap.add_argument("--takes", type=int)
    args = ap.parse_args()

    voz = yaml.safe_load((ROOT / "channel.yaml").read_text())["voz"]
    if voz.get("provedor") != "voicestudio":
        sys.exit(f"channel.yaml voz.provedor is {voz.get('provedor')!r}, not voicestudio")

    video = Path(args.video_dir)
    text = (video / "narracao.txt").read_text().strip()
    out_dir = video / "audio" / "takes"
    out_dir.mkdir(parents=True, exist_ok=True)
    url = voz["url"].rstrip("/")

    try:
        urllib.request.urlopen(url + "/health", timeout=5).read()
    except (urllib.error.URLError, OSError):
        sys.exit(f"VoiceStudio is not answering at {url}: open the app and try again")

    for n in range(1, (args.takes or voz.get("takes", 2)) + 1):
        seed = random.randrange(1, 2**31)
        fields = {
            "text": text,
            "profile_id": voz["profile_id"],
            "language": voz["idioma"],
            "seed": seed,
            "max_chunk_chars": voz.get("max_chunk_chars", 400),
            "effect_preset": voz.get("efeito", "broadcast"),
        }
        headers, wav = post_form(url + "/generate", fields, timeout=1800)
        path = out_dir / f"take-{n}.wav"
        path.write_bytes(wav)
        print(f"{path}  {float(headers.get('x-audio-duration', 0)):.1f} s  seed {seed}  "
              f"({float(headers.get('x-gen-time', 0)):.0f} s to generate)")


if __name__ == "__main__":
    main()
