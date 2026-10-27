#!/usr/bin/env python3
"""Mix narration + sound effects and normalise for Reels/TikTok/Shorts.

usage: python3 tools/mix.py videos/<slug>

Reads   videos/<slug>/audio/narration.wav, videos/<slug>/video.json ("sfx": [[t, file, gain_db], ...])
        sound files from the HyperFrames CLI bundle (free; see CREDITS.md next to them)
Writes  videos/<slug>/audio/mix.wav  48 kHz stereo, two-pass loudnorm to channel.yaml audio.lufs
        (default -14 LUFS) and audio.true_peak (default -1.5 dBTP), padded to video.duration.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from build import sfx_dir  # noqa: E402

SR = 48000


def decode(path, filters=None):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    vdir = (ROOT / sys.argv[1]).resolve()
    video = json.loads((vdir / "video.json").read_text())
    audio_cfg = yaml.safe_load((ROOT / "channel.yaml").read_text()).get("audio", {})
    lufs, tp = audio_cfg.get("lufs", -14), audio_cfg.get("true_peak", -1.5)
    dur = float(video["duration"])
    narration = vdir / video["audio"]["narration"]
    sdir = sfx_dir()
    if not sdir:
        sys.exit("sound effects not found: run tools/setup.sh (npm install puts hyperframes in node_modules)")

    # 1) voice: even level, padded to the video length
    mix = decode(narration, f"loudnorm=I={lufs - 1}:TP=-2:LRA=7,apad=whole_dur={dur}")[: int(dur * SR)]
    # 2) sound effects at their times
    cache = {}
    for t, f, db in video.get("sfx", []):
        if f not in cache:
            cache[f] = decode(sdir / f)
        s = cache[f] * (10 ** (db / 20))
        i = int(t * SR)
        if i >= len(mix):
            continue
        n = min(len(s), len(mix) - i)
        mix[i:i + n] += s[:n]
    raw = vdir / "audio/mix_raw.f32"
    mix.astype(np.float32).tofile(raw)

    # 3) final loudness, two-pass
    def run(af, out):
        return subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", str(raw), "-af", af] + out,
                              capture_output=True, text=True)
    m = run(f"loudnorm=I={lufs}:TP={tp}:LRA=8:print_format=json", ["-f", "null", "-"]).stderr
    js = json.loads(m[m.rfind("{"):m.rfind("}") + 1])
    af = (f"loudnorm=I={lufs}:TP={tp}:LRA=8:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
          f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample={SR}")
    out = vdir / "audio/mix.wav"
    r = run(af, ["-c:a", "pcm_s16le", "-y", str(out)])
    raw.unlink(missing_ok=True)
    if r.returncode:
        sys.exit(r.stderr[-800:])
    print(f"mix: {len(video.get('sfx', []))} efeitos, {js['input_i']} LUFS → {lufs} LUFS, pico {tp} dBTP → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
