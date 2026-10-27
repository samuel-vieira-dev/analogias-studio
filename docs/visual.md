# Visual: área segura, zonas, câmera 3D e estilo

## Área segura (requisito do kit, não é input)

Reels, TikTok e Shorts cobrem partes do vídeo com a própria interface (barra de busca em cima; legenda, @, música e botões embaixo; coluna de curtir/comentar à direita). O kit usa **uma área única**, o pior caso de cada lado (`config/layout.json`):

| Plataforma | Topo | Base | Esquerda | Direita |
| --- | --- | --- | --- | --- |
| Reels | 220 | 420 | 35 | 170 |
| TikTok | 108 | 322 | 40 | 190 |
| Shorts | 120 | 360 | 0 | 96 |
| **Kit (único)** | **220** | **420** | **60** | **190** |

Área segura: x 60–890, y 220–1500 (830 × 1280 px num quadro de 1080 × 1920). O centro dela é x = 475, não 540: tudo fica levemente à esquerda, longe da coluna de botões.

```
y=0     ┌──────────────────────────────┐
        │ (interface do app)           │
y=220   │  ┌─────────────[ source ]──┐ │  fontes, avisos: canto superior direito, 1 linha
y=300   │  │ headline                │ │  títulos, números, regras, pergunta (260 px)
y=580   │  │ ┌─────────────────────┐ │ │
        │  │ │ stage (3D)          │ │ │  quando a headline tem texto
        │  │ │                     │ │ │  (stage-tall = 300–1330 quando não tem)
y=1330  │  │ └─────────────────────┘ │ │
y=1366  │  │ [ caption ]  base 1476  │ │  legenda: 1 linha, 24 px acima do fim
y=1500  │  └─────────────────────────┘ │
        │ (interface do app)     botões│
y=1920  └──────────────────────────────┘
       x=60                     x=890  1080
```

## Texto

- Texto **nunca tem coordenada**: cada overlay do `video.json` nomeia uma zona e o build empilha os itens que coincidem no tempo.
- `headline`: `title` (até 2 linhas, use `\n`), `text`, `stat` (número grande + rótulo), `timer`, `chip` (estilos `orange`, `red`, `dark`), `question` (+ `sub`). Cabem ~260 px: um `stat` ocupa quase tudo, então números diferentes entram **em sequência**, não empilhados.
- `source`: `source` (fontes, referências, avisos como "Não é recomendação de investimento."). Uma linha de 28 px alinhada à direita no topo da área segura; se não couber, o QA reprova — encurte o texto.
- `caption`: legendas automáticas (das palavras da narração) e o `cta` no fim, depois que a fala acaba.
- Entradas só com escala/opacidade a partir da borda ancorada da zona: o texto nunca sai da zona, nem por um quadro.
- Legenda: Inter 800, 58 px, caixa escura, 1 linha (até 4 palavras / 20 caracteres), palavra falada em laranja `#ff5a1f`.

## Câmera 3D (a causa raiz dos cortes)

Nunca posicionar câmera "no olho". Para cada plano:

```js
const anim = (t) => { /* só os objetos, sem câmera */ };
const box = envelope([objetoA, objetoB], anim, t0, t1);       // tudo o que se mexe no plano
const P = CAM.pose(box, { zone: "stage", from: [0, 0.4, 1] }); // distância resolvida para caber na zona
```

- `zone`: `stage` se a headline tiver texto em algum momento do plano; senão `stage-tall`.
- `from`: direção da câmera em relação ao objeto (ângulo). `pull: 1.15` dá respiro (nunca < 1). `pad` (padrão 28 px) é a folga mínima até a borda da zona.
- Movimento: `CAM.blend(A, B, k)` entre duas poses, `CAM.track(t, [[t0, A], [t1, B, transição]])` para vários planos, `CAM.shake` para impacto.
- Objeto que viaja em direção à lente (ex.: pegar o celular): refazer `CAM.pose` a cada quadro durante a viagem.
- `CAM.at(pos, look)` (câmera manual) só em último caso — o QA vai medir de qualquer jeito.

## Registro para o QA

| Chamada | Significa | O QA verifica |
| --- | --- | --- |
| `S.hero(obj, nome, {when})` | objeto principal do plano | inteiro dentro da área segura; nenhum texto em cima |
| `S.label(sprite, nome, {on})` | texto 3D solto | dentro da área segura; só pode encostar no herói `on` |
| `S.solid(obj, nome, {restsOn})` | objeto físico | não atravessa outro sólido; pode encostar (sem afundar) no apoio |
| `S.scenery(obj, nome, {when})` | cenário que passa da borda (multidão, horizonte) | nenhum texto em cima |

`when: (t) => ...` limita a checagem aos momentos em que o objeto é o assunto do plano (ex.: depois de surgir).

## Objetos

- Objeto apoiado fica **em cima** do apoio (base no topo do apoio), nunca afundado.
- Porta, persiana, tampa: passam **atrás** ou **na frente** com folga — nunca através do objeto.
- Texto que pertence a um objeto (etiqueta, placa, degrau) é **impresso nele** com `makePlate()`, não um sprite flutuando.
- Um herói por plano. Contato com o chão via `contactShadow`.

## Estilo do canal

- Fundo escuro e quente `#160e0a`; laranja `#ff6a2b`; vermelho `#e0261b`; verde `#2fae66`; creme `#f4e8da`.
- Fonte Inter (600–900). Números grandes em branco ou laranja; rótulos em chip vermelho.
- Luz: chave quente, contraluz fria, neblina adaptada à distância da câmera (`CAM.apply`).
- 3D de verdade (Three.js), sem logos ou marcas reais; prédios e veículos genéricos.
- Cortes com flash laranja curto e whoosh; impactos com grave; pops em contagens.

## Biblioteca de objetos (`engine/props/`)

`basics.js`: makeButton, pressCurve, makeGlassLid, makeAlarmRings, makePerson, makeCoin, makeShutter, makeBallotBox, makeMoneyStack, makeFlame, makeSmoke, makeGridFloor · `devices.js`: makePhone, phoneScreenPoint, makeFinger, makePhoneCrowd, makeBedsideTable, paintTradingApp · `finance.js`: makeBreakerPanel, makeWire, makeBulb, makeChartScreen, makeStairs, makeTimeline, makeVChart. Objeto novo que pode servir a outros vídeos vai para `engine/props/` (e para o git).
