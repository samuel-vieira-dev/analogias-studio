#!/usr/bin/env bash
# One-time setup (Mac or cloud). Safe to re-run.
#   needs: node >= 22, python3 >= 3.10, ffmpeg (Mac: brew install node python ffmpeg)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
fail() { echo "✗ $1"; exit 1; }
command -v node >/dev/null || fail "node não encontrado (Mac: brew install node)"
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] || fail "node >= 22 necessário"
command -v ffmpeg >/dev/null || fail "ffmpeg não encontrado (Mac: brew install ffmpeg)"
command -v python3 >/dev/null || fail "python3 não encontrado"

echo "→ pacotes Python (faster-whisper, numpy, soundfile, pyyaml)"
python3 -m pip install --quiet faster-whisper numpy soundfile pyyaml 2>/dev/null \
  || python3 -m pip install --quiet --break-system-packages faster-whisper numpy soundfile pyyaml

echo "→ pacotes Node (hyperframes, playwright)"
npm install --silent

if ! node -e "require('playwright').chromium.executablePath() && require('fs').accessSync(require('playwright').chromium.executablePath())" 2>/dev/null; then
  echo "→ navegador do Playwright (Chromium)"
  npx playwright install chromium
fi

echo "→ teste do QA (vídeo de erros propositais)"
bash tools/selftest.sh
echo "✓ pronto"
