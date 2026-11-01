#!/usr/bin/env python3
"""Writes the data block of scenes.js and video.json for 2026-11-01-historia-divida-publica.
usage: python3 videos/2026-11-01-historia-divida-publica/gerar.py videos/2026-11-01-historia-divida-publica
One source for the series, the time→year map and the counter, so the 3D and the text never drift."""
import json, re, sys
from pathlib import Path

V = Path(sys.argv[1])
dados = json.loads((V / "dados.json").read_text())["anos"]
DEBT = [[r["ano"], r["pib"]] + ([1] if r.get("projecao") else []) for r in dados]

# time (s) → front year; keyed to the music (audio/music.mp3)
YEARMAP = [[10.5, 1880], [13.1, 1884], [16.0, 1890], [19.8, 1914], [21.3, 1923], [24.35, 1933], [27.6, 1952], [28.6, 1953],
           [30.6, 1983], [34.3, 1994], [40.6, 2020], [45.0, 2025], [46.9, 2026], [49.8, 2028], [51.3, 2028.6]]

def year_time(y):
    for (t0, y0), (t1, y1) in zip(YEARMAP, YEARMAP[1:]):
        if y <= y1 + 1e-9:
            return t0 + (t1 - t0) * (y - y0) / max(1e-9, y1 - y0)
    return YEARMAP[-1][0]

LABELS = [  # (from year, to year, chip text, style); others: DEFAULT
    (1880, 1882, "CADA MOEDA = 1% DO PIB", "orange"),
    (1883, 1886, "LINHA VERMELHA = 100% DO PIB", "red"),
    (1887, 1889, "IMPÉRIO", "dark"),
    (1890, 1913, "REPÚBLICA", "dark"),
    (1914, 1922, "SEM DADOS: 1ª GUERRA", "dark"),
    (1929, 1934, "CRISE DE 1929", "red"),
    (1952, 1952, "O MENOR DA SÉRIE", "green"),
    (1982, 1986, "CRISE DA DÍVIDA EXTERNA", "red"),
    (1987, 1989, "MORATÓRIA DE 1987", "red"),
    (1994, 2001, "PLANO REAL", "orange"),
    (2020, 2021, "PANDEMIA", "red"),
    (2025, 2025, "HOJE: R$ 11,1 TRILHÕES", "orange"),
    (2026, 2028, "PROJEÇÃO DO FMI", "orange"),
]
DEFAULT = "DÍVIDA PÚBLICA / PIB"
fmt = lambda v: "—" if v is None else f"{v:.1f}%".replace(".", ",")
steps = []
for y, v, *p in DEBT:
    lab = next(((txt, st) for a, b, txt, st in LABELS if a <= y <= b), (DEFAULT, "dark"))
    steps.append([round(year_time(y), 3), str(y), fmt(v), lab[0], lab[1]])

# rewind 2028 → 1884 (scenes.js → REWIND: same easing), the counter runs the years backwards
R0, R1, YA, YB = 51.3, 54.6, 2028, 1884
ein = lambda x: 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2
vals = {y: v for y, v, *p in DEBT}
rewind, seen = [], set()
for i in range(0, 3301):
    t = R0 + (R1 - R0) * i / 3300
    y = round(YA + (YB - YA) * ein(i / 3300))
    if y not in seen:
        seen.add(y); rewind.append([round(max(t, 51.35), 3), str(y), fmt(vals[y]), "O RECORDE" if y == 1884 else "VOLTANDO NO TEMPO", "red" if y == 1884 else "dark"])

# ---- scenes.js data block
sj = V / "scenes.js"; s = sj.read_text()
block = ("// <dados> (gerado: não editar à mão)\n"
         f"const DEBT = {json.dumps(DEBT)}; // [ano, % do PIB (null = sem dado), projeção?] · FMI (dados.json)\n"
         f"const YEARMAP = {json.dumps(YEARMAP)}; // [tempo (s), ano na frente do gráfico]\n"
         "// </dados>")
s = re.sub(r"// <dados>.*?// </dados>", block, s, flags=re.S); sj.write_text(s)

# ---- video.json
DUR = 60.0
ov = [
    {"id": "ov-hook1", "kind": "title", "from": 0.4, "to": 3.15, "text": "EM QUE ANO O BRASIL\nMAIS DEVEU?"},
    {"id": "ov-hook2", "kind": "title", "from": 3.25, "to": 5.45, "text": "ADIVINHE\nANTES DE VER."},
    {"id": "ov-1824", "kind": "stat", "from": 5.6, "to": 10.4, "big": "£ 3 MILHÕES", "label": "1º EMPRÉSTIMO · LONDRES, 1824"},
    {"id": "src-1824", "kind": "source", "from": 5.6, "to": 10.4, "text": "Fonte: Tesouro Nacional"},
    {"id": "ov-ano", "kind": "counter", "from": 10.5, "to": 51.25, "label": DEFAULT, "steps": steps},
    {"id": "src-fmi", "kind": "source", "from": 10.5, "to": 44.95, "text": "Fonte: FMI · dívida bruta em % do PIB"},
    {"id": "src-hoje", "kind": "source", "from": 45.0, "to": 46.85, "text": "Fonte: FMI · R$: Banco Central, set/2026"},
    {"id": "src-proj", "kind": "source", "from": 46.9, "to": 51.25, "text": "Fonte: FMI, projeção de out/2026"},
    {"id": "ov-volta", "kind": "counter", "from": 51.35, "to": 55.4, "label": "VOLTANDO NO TEMPO", "steps": rewind},
    {"id": "src-fim", "kind": "source", "from": 51.35, "to": 60.0, "text": "Fonte: FMI"},
    {"id": "ov-pergunta", "kind": "question", "from": 55.55, "to": 60.0, "text": "VOCÊ ACERTOU O\nANO DO RECORDE?"},
    {"id": "cta", "kind": "cta", "from": 56.6, "to": 60.0, "html": "Comenta: <b>ACERTEI</b> ou <b>ERREI</b>"},
]
cuts = [5.5, 10.5, 28.6, 34.3, 51.3, 55.5]
sfx = [[c, "whoosh.mp3", -24] for c in cuts] + [[f, "click-soft.mp3", -16] for f in (3.35, 3.85, 4.35, 4.85)] + [[55.9, "click-soft.mp3", -14]]
video = {
    "_doc": "Vídeo sem narração (só música): sem words.json, sem legenda. Tempos em segundos do audio/music.mp3. Overlays só por zona. DEBT/YEARMAP do scenes.js e os passos do contador (ov-ano) saem do mesmo gerador.",
    "slug": V.name, "duration": DUR,
    "audio": {"music": "audio/music.mp3", "music_db": 0, "music_fade": 2.0},
    "media": {},
    "cuts": cuts, "overlays": ov, "sfx": sfx,
    "scenes": [{"id": "gancho", "from": 0, "to": 5.5}, {"id": "1824", "from": 5.5, "to": 10.5}, {"id": "corrida", "from": 10.5, "to": 51.3},
               {"id": "recorde", "from": 51.3, "to": 55.5}, {"id": "pergunta", "from": 55.5, "to": 60.0}],
    "post": {
        "title": "EM QUE ANO O BRASIL\nMAIS DEVEU?",
        "descricao": "A dívida pública do Brasil ano a ano, de 1880 a 2025, em % do PIB (dados do FMI): do Império à pandemia, do primeiro empréstimo de 1824 à projeção do FMI para 2028.",
        "hashtags": ["#dividapublica", "#economia", "#historiadobrasil", "#fmi", "#educacaofinanceira"],
        "media": False,
    },
}
(V / "video.json").write_text(json.dumps(video, ensure_ascii=False, indent=1))
print(f"{len(DEBT)} anos, {len(steps)} passos; 1884 em {year_time(1884)}s, 1952 em {year_time(1952)}s, 2020 em {year_time(2020)}s")
