#!/usr/bin/env bash
# Render the HyperFrames project of a video to videos/<slug>/out/render.mp4.
#
# usage: tools/render.sh videos/<slug> [draft|looks|delivery] [--detach]
#
# Run ONLY after tools/qa.cjs passes. Times for a 90 s 3D video:
#   MacBook (Apple Silicon, GPU WebGL, workers = cores - 2): about 5–15 min (measure: npx hyperframes benchmark)
#   cloud session (2 CPUs, software WebGL ~1.8 fps): about 25–30 min. Use --detach there, so the
#   render survives the session's command timeout; follow it with: tail -f videos/<slug>/out/render.log
set -euo pipefail
HF="hyperframes@0.8.206"
VDIR="${1:?usage: tools/render.sh videos/<slug> [draft|looks|delivery] [--detach]}"
QUALITY="${2:-looks}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/$VDIR"
[ -f build/index.html ] || { echo "rode antes: python3 tools/build.py $VDIR"; exit 2; }
# gate: a full, clean QA report newer than the build
[ -f qa/report.json ] && python3 - <<'EOF' || { echo "QA não passou (ou está desatualizado): rode node tools/qa.cjs $VDIR e corrija antes de renderizar"; exit 2; }
import glob, json, os, sys
rep, dur = json.load(open("qa/report.json")), json.load(open("video.json"))["duration"]
newest = max(os.path.getmtime(f) for f in glob.glob("build/compositions/*.html") + ["qa/harness.html"])
ok = rep["problems"] == 0 and rep["from"] <= 0.01 and rep["to"] >= dur - 0.25 and os.path.getmtime("qa/report.json") >= newest
sys.exit(0 if ok else 1)
EOF
mkdir -p out
if [[ "$(uname)" == "Darwin" ]]; then WORKERS=$(( $(sysctl -n hw.ncpu) - 2 )); else WORKERS=2; fi
# WebGL: the CLI probes the GPU (Mac: hardware) and falls back to software (cloud: SwiftShader)
CMD=(npx --yes "$HF" render "$PWD/build" -o "$PWD/out/render.mp4" -q "$QUALITY" -w "$WORKERS" --quiet)
echo "render: ${CMD[*]}"
START=$(date +%s)
if [[ "${3:-}" == "--detach" ]]; then
  HYPERFRAMES_RENDER_DETACHED=1 nohup "${CMD[@]}" > out/render.log 2>&1 &
  echo "rodando em segundo plano (pid $!). Acompanhe: tail -f $VDIR/out/render.log"
else
  "${CMD[@]}"
  echo "render ok em $(( $(date +%s) - START ))s → $VDIR/out/render.mp4"
fi
