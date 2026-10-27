#!/usr/bin/env python3
"""Final file: render video + exact mix → videos/<slug>/out/<slug>.mp4, checked, and delivered on a Mac.

usage: python3 tools/finalize.py videos/<slug> [--render videos/<slug>/out/render.mp4] [--no-copy]

- video stream copied from the HyperFrames render, audio = audio/mix.wav as AAC 192k, +faststart
- checks 1080x1920, fps, duration vs video.json and integrated loudness
- on macOS copies to channel.yaml entrega.mac (~/Movies/reels) unless --no-copy
"""
import argparse
import json
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration",
                        "-of", "json", str(path)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video_dir"); ap.add_argument("--render"); ap.add_argument("--no-copy", action="store_true")
    a = ap.parse_args()
    vdir = (ROOT / a.video_dir).resolve()
    video = json.loads((vdir / "video.json").read_text())
    channel = yaml.safe_load((ROOT / "channel.yaml").read_text())
    slug = video["slug"]
    render = Path(a.render) if a.render else vdir / "out/render.mp4"
    mix = vdir / "audio/mix.wav"
    for p in (render, mix):
        if not p.exists():
            sys.exit(f"faltando: {p} (render: tools/render.sh; mix: tools/mix.py)")
    out = vdir / "out" / channel["entrega"]["nome_arquivo"].format(slug=slug)
    out.parent.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(render), "-i", str(mix), "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(out)], check=True)

    info = probe(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    dur = float(info["format"]["duration"])
    num, den = map(int, v["r_frame_rate"].split("/"))
    loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", loud)
    problems = []
    if (v["width"], v["height"]) != (1080, 1920):
        problems.append(f"resolução {v['width']}x{v['height']}")
    if abs(dur - video["duration"]) > 0.2:
        problems.append(f"duração {dur:.2f}s (esperado {video['duration']}s)")
    lufs = float(m[-1]) if m else None
    if lufs is not None and abs(lufs - channel["audio"]["lufs"]) > 1.0:
        problems.append(f"volume {lufs} LUFS")
    print(f"{out.relative_to(ROOT)}: {v['width']}x{v['height']} {num / den:.0f} fps {dur:.2f}s {lufs} LUFS, {out.stat().st_size / 1e6:.1f} MB")
    if problems:
        print("ATENÇÃO: " + "; ".join(problems))

    if platform.system() == "Darwin" and not a.no_copy:
        dest = Path(channel["entrega"]["mac"]).expanduser()
        dest.mkdir(parents=True, exist_ok=True)
        shutil.copy(out, dest / out.name)
        print(f"entregue em {dest / out.name}")


if __name__ == "__main__":
    main()
