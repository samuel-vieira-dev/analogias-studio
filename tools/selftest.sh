#!/usr/bin/env bash
# QA self-test: builds tests/qa-pega-erros (the defects of the circuit breaker V2 and of the Lula
# video, made on purpose) and fails unless tools/qa.cjs catches every one of them.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 tools/build.py tests/qa-pega-erros >/dev/null
set +e; node tools/qa.cjs tests/qa-pega-erros --shots 4 >/dev/null; code=$?; set -e
[ "$code" = 1 ] || { echo "✗ QA deveria ter reprovado o teste (código $code)"; exit 1; }
python3 - <<'PY'
import json, sys
rep = json.load(open("tests/qa-pega-erros/qa/report.json"))
found = {(i["rule"], i["a"], i.get("b") or "") for i in rep["items"]}
expected = {
    "0:03 celular cortado": ("objeto_fora_da_area_segura", "celular", ""),
    "0:46 moeda atravessando a porta": ("objetos_se_atravessando", "moeda", "porta"),
    "0:46 moeda afundada no degrau": ("objeto_afundou_no_apoio", "degrau", "moeda"),
    "1:06 fonte em cima da animação": ("texto_sobre_animacao", "ov-src", "urna"),
    "1:08 número em cima da animação": ("texto_sobre_animacao", "ov-17", "urna"),
    "Lula 1:08 objeto pequeno no palco": ("objeto_pequeno", "urna", ""),
    "Lula 0:45 palco vazio depois do corte": ("quadro_vazio", "vazio", ""),
    "Lula 0:05 plano parado": ("plano_parado", "parado", ""),
    "Lula 1:40 texto 3D ilegível": ("texto3d_ilegivel", "caixa", ""),
    "foto sem crédito na tela": ("foto_sem_credito", "teste", ""),
    "foto esticada além da resolução": ("foto_em_baixa_resolucao", "teste", ""),
}
miss = []
for name, (rule, a, b) in expected.items():
    ok = any(r == rule and {a, b} - {""} <= {fa, fb} for r, fa, fb in found)
    print(("✓ " if ok else "✗ ") + name)
    if not ok: miss.append(name)
sys.exit(1 if miss else 0)
PY
