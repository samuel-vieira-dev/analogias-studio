#!/usr/bin/env python3
"""Writes dados.json, the data block of scenes.js and video.json for 2026-11-07-moedas-fortes-x-real.
usage: python3 videos/2026-11-07-moedas-fortes-x-real/gerar.py videos/2026-11-07-moedas-fortes-x-real
One source for the series, the time→date map, the counter and the podium, so the 3D and the text never drift.
dados.json comes from audio/ptax-fechamento.json (the daily PTAX closing rates from the Banco Central API,
out of git) when it is there; otherwise the committed dados.json is used as is."""
import json, re, sys
from datetime import date
from pathlib import Path

V = Path(sys.argv[1])
CUR = ["USD", "EUR", "GBP", "CHF"]
# days that must be in the series exactly (records and turning points in fatos.md)
KEY = ["1994-07-01", "1994-10-14", "1998-12-31", "1999-01-12", "1999-03-03", "2002-10-22", "2008-08-01", "2008-12-05",
       "2011-07-26", "2015-09-21", "2015-09-22", "2015-09-23", "2015-09-24", "2020-05-14", "2022-11-04", "2023-03-02", "2024-11-29", "2025-01-02",
       "2025-04-16", "2026-05-11", "2026-11-06"]


def yfrac(d):
    y, m, dd = map(int, d.split("-"))
    a, b = date(y, 1, 1), date(y + 1, 1, 1)
    return round(y + (date(y, m, dd) - a).days / (b - a).days, 5)


raw = V / "audio" / "ptax-fechamento.json"
if raw.exists():
    S = json.loads(raw.read_text())
    dados = {"_doc": "Cotação PTAX de fechamento (venda) do Banco Central, R$ por 1 unidade: o último dia útil de cada semana e os dias de KEY (gerar.py). "
                     "01/07/1994–06/11/2026; euro desde 31/12/1998. Baixado da API PTAX (olinda.bcb.gov.br) em 07/11/2026.", "series": {}}
    for m in CUR:
        days = [d for d in S[m] if d >= "1994-07-01"]
        week = {}
        for d in days:
            iso = date(*map(int, d.split("-"))).isocalendar()
            week[(iso[0], iso[1])] = d
        keep = sorted(set(week.values()) | {d for d in KEY if d in S[m]} | {days[0], days[-1]})
        dados["series"][m] = [[d, round(S[m][d], 4)] for d in keep]
    (V / "dados.json").write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")))
dados = json.loads((V / "dados.json").read_text())
SER = {m: [[yfrac(d), v] for d, v in dados["series"][m]] for m in CUR}
first = {m: dados["series"][m][0] for m in CUR}
last = {m: dados["series"][m][-1] for m in CUR}

# time (s) → date on the front of the chart (fractional year); keyed to the music (audio/music.mp3):
# the beat enters at 20.55 (1999), peaks at 24.83 (2002), 30.41 (2008), 34.27 (2015), 41.0 (2020)
YEARMAP = [[13.75, 1994.5], [20.55, 1999.0], [21.5, 1999.25], [23.1, 2000.0],
           [24.4, 2002.70], [25.3, 2002.83],      # dwell on the record of 2002 (22/10)
           [29.6, 2008.70], [30.9, 2008.97],      # the crisis of 2008 (Sep → peak 05/12)
           [31.6, 2010.55], [32.6, 2010.85],      # the franc passes the dollar (Sep–Nov 2010)
           [33.1, 2011.50], [33.8, 2011.60],      # the strongest real since 1999 (26/07/2011)
           [35.4, 2015.719], [36.5, 2015.7315],   # the dollar past R$ 4 (22–24/09/2015, peak 24/09)
           [40.9, 2020.355], [41.7, 2020.375],    # the pandemic (peak 14/05/2020)
           [44.8, 2024.905], [45.9, 2025.04],     # the dollar past R$ 6 (29/11/2024) and the top PTAX (02/01/2025)
           [46.9, yfrac("2026-11-06")], [48.0, yfrac("2026-11-06")]]
# moments of the story (middle of each dwell): the backdrop turns red/green and the camera shakes on them
EVENTS = {"1999": 20.55, "2002": 24.85, "2008": 30.3, "franco": 32.1, "2011": 33.45, "2015": 35.95, "2020": 41.3, "2024": 45.35, "hoje": 46.9}


def date_time(y):
    for (t0, y0), (t1, y1) in zip(YEARMAP, YEARMAP[1:]):
        if y <= y1 + 1e-9:
            return t0 + (t1 - t0) * (y - y0) / max(1e-9, y1 - y0)
    return YEARMAP[-1][0]


def date_at(t):
    if t <= YEARMAP[0][0]:
        return YEARMAP[0][1]
    for (t0, y0), (t1, y1) in zip(YEARMAP, YEARMAP[1:]):
        if t <= t1:
            return y0 + (y1 - y0) * (t - t0) / (t1 - t0)
    return YEARMAP[-1][1]


# chips under the year (time windows; the rest of the race shows DEFAULT)
DEFAULT = ("PREÇO EM REAIS", "dark")
def usd_at(y):
    p = SER["USD"]
    for (y0, v0), (y1, v1) in zip(p, p[1:]):
        if y0 <= y <= y1:
            return v0 + (v1 - v0) * (y - y0) / (y1 - y0)
    return p[-1][1]


def above(level, t0, t1):
    """The longest stretch of [t0, t1] in which the dollar on the front is at or above `level`: a chip that
    says "passa de R$ X" only shows while the dollar's tag agrees with it."""
    best, cur, t = None, None, t0
    while t <= t1 + 1e-9:
        ok = usd_at(date_at(t)) >= level
        if ok and cur is None: cur = t
        if (not ok or t + 0.01 > t1) and cur is not None:
            end = t if not ok else t1
            if not best or end - cur > best[1] - best[0]: best = (cur, end)
            cur = None
        t = round(t + 0.01, 3)
    return best


R4, R6 = above(4.0, 35.2, 37.0), above(6.0, 44.6, 46.4)
CHIPS = [
    (20.55, 21.85, "CÂMBIO FLUTUANTE", "red"),
    (21.85, date_time(2000) - 0.02, "NASCE O EURO", "orange"),
    (24.3, date_time(2003) - 0.02, "RECORDE DE 2002", "red"),
    (29.6, date_time(2009) - 0.02, "CRISE DE 2008", "red"),
    (31.5, date_time(2011) - 0.02, "FRANCO PASSA O DÓLAR", "orange"),
    (date_time(2011) + 0.02, date_time(2012) - 0.02, "2011: O REAL MAIS FORTE", "green"),
    (R4[0], R4[1], "DÓLAR PASSA DE R$ 4", "red"),
    (40.6, date_time(2021) - 0.02, "PANDEMIA: RECORDE", "red"),
    (date_time(2022) + 0.02, 44.3, "FRANCO PASSA O EURO", "orange"),
    (R6[0], R6[1], "DÓLAR PASSA DE R$ 6", "red"),
    (46.6, 48.0, "HOJE · NOV/2026", "orange"),
]
R0, R1 = 13.75, 47.95
marks = {R0}
for y in range(1995, 2027):
    marks.add(round(date_time(y), 3))
for a, b, *_ in CHIPS:
    marks.add(round(a, 3)); marks.add(round(b, 3))
steps = []
for t in sorted(m for m in marks if R0 <= m < R1):
    chip = next(((txt, st) for a, b, txt, st in CHIPS if a - 0.0011 <= t < b - 0.0011), DEFAULT)   # marks are rounded to 1 ms
    s = [round(t, 3), str(int(date_at(t) + 0.003)), "", chip[0], chip[1]]
    if not steps or steps[-1][1:] != s[1:]:
        steps.append(s)

# podium: how much each one rose against the real (first day of its series → today)
PODIUM = []
for m in ["CHF", "USD", "GBP", "EUR"]:
    k = last[m][1] / first[m][1]
    PODIUM.append([m, round(k, 3), f"+{round((k - 1) * 100)}%"])

# ---- scenes.js data block
sj = V / "scenes.js"
if sj.exists():
    s = sj.read_text()
    block = ("// <dados> (gerado: não editar à mão)\n"
             f"const SERIES = {json.dumps(SER, separators=(',', ':'))}; // [ano fracionário, R$ por 1 unidade] · PTAX de fechamento, Banco Central (dados.json)\n"
             f"const YEARMAP = {json.dumps(YEARMAP)}; // [tempo (s), data na frente do gráfico]\n"
             f"const PODIUM = {json.dumps(PODIUM, ensure_ascii=False)}; // [moeda, quantas vezes subiu, texto]\n"
             f"const EVENTS = {json.dumps(EVENTS)}; // [marco: tempo (s)] fundo vermelho/verde e tremida\n"
             "// </dados>")
    s = re.sub(r"// <dados>.*?// </dados>", lambda _: block, s, flags=re.S)
    sj.write_text(s)

# ---- video.json
DUR = 60.0
SRC = "Fonte: Banco Central · PTAX"
p = {m: k for m, k, _ in PODIUM}
pt = {m: txt for m, _, txt in PODIUM}
ov = [
    {"id": "ov-hook1", "kind": "title", "from": 0.3, "to": 3.35, "text": "O DÓLAR SUBIU 450%\nCONTRA O REAL."},
    {"id": "ov-hook2", "kind": "title", "from": 3.45, "to": 6.65, "text": "E NEM FOI O QUE\nMAIS SUBIU."},
    {"id": "src-hook", "kind": "source", "from": 0.3, "to": 6.65, "text": SRC + ", 1994–2026"},
    {"id": "ov-1994", "kind": "stat", "from": 6.85, "to": 10.15, "big": "R$ 1 = US$ 1", "label": "PLANO REAL · 1º/7/1994"},
    {"id": "ov-out94", "kind": "stat", "from": 10.25, "to": 13.65, "big": "US$ 1 = R$ 0,83", "label": "OUT/1994: O REAL VALIA MAIS"},
    {"id": "src-1994", "kind": "source", "from": 6.85, "to": 13.65, "text": SRC},
    {"id": "ov-ano", "kind": "counter", "from": R0, "to": R1, "label": DEFAULT[0], "steps": steps},
    {"id": "src-corrida", "kind": "source", "from": R0, "to": R1, "text": SRC},
    {"id": "ov-podio", "kind": "title", "from": 48.1, "to": 51.35, "text": "QUANTO SUBIU\nCONTRA O REAL"},
    {"id": "ov-franco", "kind": "stat", "from": 51.45, "to": 54.9, "big": pt["CHF"], "label": "FRANCO SUÍÇO, DESDE 1994"},
    {"id": "src-podio", "kind": "source", "from": 48.1, "to": 54.9, "text": SRC + " · euro desde 1999"},
    {"id": "ov-pergunta", "kind": "question", "from": 55.05, "to": DUR, "text": "VOCÊ ACERTOU A MOEDA\nQUE MAIS SUBIU?"},
    {"id": "src-aviso", "kind": "source", "from": 55.05, "to": DUR, "text": "Não é recomendação de investimento."},
    {"id": "cta", "kind": "cta", "from": 55.9, "to": DUR, "html": "Comenta: <b>ACERTEI</b> ou <b>ERREI</b>"},
]
cuts = [6.75, 13.75, 48.0, 55.0]
sfx = [[c, "whoosh.mp3", -22] for c in cuts[:3]] + [[0.5, "pop.mp3", -18], [20.55, "pop.mp3", -18]] + [[t, "pop.mp3", -16] for t in (3.5, 3.62, 3.74, 49.25, 49.6, 50.6)] + [[56.0, "click-soft.mp3", -14]]
video = {
    "_doc": "Vídeo sem narração (só música): sem words.json, sem legenda. Tempos em segundos do audio/music.mp3. Overlays só por zona. SERIES/YEARMAP/PODIUM do scenes.js, o contador (ov-ano) e o pódio saem do mesmo gerador (gerar.py).",
    "slug": V.resolve().name, "estilo": "analogias-v1", "duration": DUR,
    "audio": {"music": "audio/music.mp3", "music_db": 0, "music_fade": 1.5},
    "media": {},
    "cuts": cuts, "overlays": ov, "sfx": sfx,
    "scenes": [{"id": "gancho", "from": 0, "to": 6.75}, {"id": "balanca", "from": 6.75, "to": 13.75}, {"id": "corrida", "from": 13.75, "to": 48.0},
               {"id": "podio", "from": 48.0, "to": 55.0}, {"id": "pergunta", "from": 55.0, "to": DUR}],
    "post": {
        "title": "O DÓLAR NEM FOI\nO QUE MAIS SUBIU",
        "descricao": f"Dólar, euro, libra e franco suíço contra o real, do Plano Real (1994) a hoje, com a cotação PTAX do Banco Central: o dólar subiu {pt['USD'][1:]}, a libra {pt['GBP'][1:]}, o euro {pt['EUR'][1:]} (desde 1999) e o franco suíço {pt['CHF'][1:]}.",
        "hashtags": ["#dolar", "#cambio", "#francosuico", "#euro", "#economia"],
        "media": False,
    },
}
(V / "video.json").write_text(json.dumps(video, ensure_ascii=False, indent=1))
print(f"{sum(len(v) for v in SER.values())} pontos; {len(steps)} passos no contador; pódio {PODIUM}")
print("tempos:", {y: round(date_time(y), 2) for y in (1995, 1999, 2002, 2002.807, 2008.7, 2008.93, 2011.565, 2015.725, 2020.367, 2022.5, 2024.91, 2026.85)})
