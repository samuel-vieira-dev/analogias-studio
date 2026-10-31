# Visual: área segura, zonas, câmera 3D e estilo

## Área segura (requisito do kit, não é input)

Reels, TikTok e Shorts cobrem partes do vídeo com a própria interface (barra de busca em cima; legenda, @, música e botões embaixo; coluna de curtir/comentar à direita). O kit usa **uma área única**, o pior caso de cada lado (`config/layout.json`):

| Plataforma | Topo | Base | Esquerda | Direita |
| --- | --- | --- | --- | --- |
| Reels | 220 | 420 | 35 | 170 |
| TikTok | 108 | 322 | 40 | 190 |
| Shorts | 120 | 360 | 0 | 96 |
| **Kit (único, centralizado)** | **220** | **420** | **190** | **190** |

Área segura: x 190–890, y 220–1500 (700 × 1280 px num quadro de 1080 × 1920), **centralizada** (centro x = 540): a margem da esquerda espelha a coluna de botões da direita (pedido do Samuel, 31/10/2026). O objeto principal e todo texto ficam dentro dela; **planos de fundo** de contexto (salão, cidade, multidão) ocupam a tela inteira (`asBackdrop`, `makeBokeh` no `engine/core.js`) e não são checados pelo QA.

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
       x=190                    x=890  1080
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

`when: (t) => ...` limita a checagem aos momentos em que o objeto é o assunto do plano (ex.: depois de surgir). Use o tempo **inteiro** em que ele é o assunto: a prévia escolhe o quadro de cada herói pelo `when`, e o QA confere tamanho e legibilidade nesse intervalo.

## Movimento: nada parado

O vídeo prende pelo movimento. Em todo plano alguma coisa anda: a câmera (`CAM.blend`/`CAM.track` do começo ao fim do plano, nem que seja um empurrão lento), um objeto entrando, uma foto aproximando. Mais de 2 s sem nada se mexer reprova (`plano_parado`). O assunto do plano ocupa pelo menos 45% da zona (`objeto_pequeno`) e o corte nunca cai num palco vazio (`quadro_vazio`): o objeto do plano seguinte já está na tela no corte, ou entra junto com ele.

## Objetos

- Objeto apoiado fica **em cima** do apoio (base no topo do apoio), nunca afundado.
- Porta, persiana, tampa: passam **atrás** ou **na frente** com folga — nunca através do objeto.
- Texto que pertence a um objeto (etiqueta, placa, degrau) é **impresso nele** com `makePlate()`, não um sprite flutuando. Letra de pelo menos 16 px na tela enquanto o objeto é o assunto (`texto3d_ilegivel`): placa larga, texto curto (2–3 palavras). `detail: true` só para texto que é textura (o ano pequeno na porta de um caminhão).
- Um herói por plano. Contato com o chão via `contactShadow`.

## Estilo do canal

- Fundo escuro e quente `#160e0a`; laranja `#ff6a2b`; vermelho `#e0261b`; verde `#2fae66`; creme `#f4e8da`.
- Fonte Inter (600–900). Números grandes em branco ou laranja; rótulos em chip vermelho.
- Luz: chave quente com sombra suave (acompanha o plano), contraluz fria, mapa de ambiente de estúdio (reflexo real em metal, vidro, louça e verniz), neblina adaptada à distância da câmera (`CAM.apply`).
- Materiais realistas, não cartoon: `pmat` (físico, com verniz), `glassMat`, `woodTex`, `noiseTex` (tecido, papel, reboco); biblioteca do restaurante em `engine/props/restaurant.js` (mesa com toalha, cadeira estofada, pessoa de terno articulada, placa de nome, louça, cloche, maço de dinheiro, pote de vidro com moedas, conta, cadeado, calendário, etiqueta de preço, salão, cidade à noite, multidão).
- 3D de verdade (Three.js), sem logos ou marcas reais; prédios e veículos genéricos.
- Fotos reais (pessoas, o avião, o prédio, o documento) entram num quadro de investigação, num porta-retrato no palco ou num cartão 2D, sempre com crédito e zoom lento: ver [`fotos.md`](fotos.md).
- Cortes com flash laranja curto e whoosh; impactos com grave; pops em contagens.

## Biblioteca de objetos (`engine/props/`)

`basics.js`: makeButton, pressCurve, makeGlassLid, makeAlarmRings, makePerson, makeCoin, makeShutter, makeBallotBox, makeMoneyStack, makeFlame, makeSmoke, makeGridFloor · `devices.js`: makePhone, phoneScreenPoint, makeFinger, makePhoneCrowd, makeBedsideTable, paintTradingApp · `finance.js`: makeBreakerPanel, makeWire, makeBulb, makeChartScreen, makeStairs, makeTimeline, makeVChart · `civic.js`: makeWeekStrip, makeStreetSign (+ noParkingTex, ringTextTex), makeSubPlate, makeLawBook, makeStamp, makeHourColumn, makeFolder, makeCrowd, makeOilRig, makeSea, makeHouse · `media.js` (fotos reais): makePhotoPrint, makeCorkBoard, makeString, makePin, makePhotoFrame, makePhotoPlane, dropPrint. Objeto novo que pode servir a outros vídeos vai para `engine/props/` (e para o git).

Objeto novo: montar com formas que já dizem o que são (a casa tem duas águas e a ponta para cima; um avião tem asa e cauda), conferir o recorte dele na folha de objetos (`preview/objetos-NN.jpg`) antes de seguir, e nunca girar uma primitiva em dois eixos "até parecer": calcular a posição de cada peça.
