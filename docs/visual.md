# Visual: área segura, zonas, câmera 3D e estilo — Estilo Analogias v1

A área segura vale para todos os estilos; o resto deste arquivo é do v1 (3D). O 2D do Estilo Explicando Direito está em [`explicando-direito/visual.md`](explicando-direito/visual.md).

## Área segura (requisito do kit, não é input)

Reels, TikTok e Shorts cobrem partes do vídeo com a própria interface (barra de busca em cima; legenda, @, música e botões embaixo; coluna de curtir/comentar à direita). O kit usa **uma área única, centralizada na tela** (pedido do Samuel, 31/10/2026): o pior caso de cima e de baixo, e a maior margem lateral (a coluna de botões, 190 px) dos dois lados (`config/layout.json`):

| Plataforma | Topo | Base | Esquerda | Direita |
| --- | --- | --- | --- | --- |
| Reels | 220 | 420 | 35 | 170 |
| TikTok | 108 | 322 | 40 | 190 |
| Shorts | 120 | 360 | 0 | 96 |
| **Kit (único, centralizado)** | **220** | **420** | **190** | **190** |

Área segura: x 190–890, y 220–1500 (700 × 1280 px num quadro de 1080 × 1920), **centralizada** (centro x = 540): a margem da esquerda espelha a coluna de botões da direita (pedido do Samuel, 31/10/2026); título, palco, legenda e capa ficam alinhados ao meio. O objeto principal e todo texto ficam dentro dela; o **plano de fundo** de contexto ocupa a tela inteira (`S.backdrop`, `asBackdrop`, `makeBokeh`; ver "Plano de fundo" abaixo) e não é checado pelo QA.

```
y=0     ┌──────────────────────────────────┐
        │ plano de fundo (tela inteira)    │
y=220   │    ┌────────[ source ]──┐        │  fontes, avisos: canto superior direito, 1 linha
y=300   │    │ headline           │        │  títulos, números, regras, pergunta (260 px)
y=580   │    │ ┌────────────────┐ │        │
        │    │ │ stage (3D)     │ │        │  animação principal; quando a headline tem texto
        │    │ │                │ │        │  (stage-tall = 300–1330 quando não tem)
y=1330  │    │ └────────────────┘ │        │
y=1346  │    │ [ caption ]        │        │  legenda: 1 linha, base 1476
y=1500  │    └────────────────────┘        │
        │ (interface do app)        botões │
y=1920  └──────────────────────────────────┘
      x=0  x=190                x=890    1080
```

## Texto

- Texto **nunca tem coordenada**: cada overlay do `video.json` nomeia uma zona e o build empilha os itens que coincidem no tempo.
- `headline`: `title` (até 2 linhas, use `\n`), `text`, `stat` (número grande + rótulo), `timer`, `chip` (estilos `orange`, `red`, `green`, `dark`), `question` (+ `sub`). Cabem ~260 px: um `stat` ocupa quase tudo, então números diferentes entram **em sequência**, não empilhados.
- `counter` (headline): dado que muda com o tempo, num quadro só: `steps: [[t, "1884", "120,7%", "chip", "estilo"], ...]` (ano em laranja, valor em branco, chip embaixo que troca de texto e cor por passo; sem chip, vale o `label`). O tamanho é ajustado pelo passo mais largo. Para gráfico que anda no tempo (vídeo da dívida pública, 01/11/2026).
- `source`: `source` (fontes, referências, avisos como "Não é recomendação de investimento."). Uma linha de 28 px alinhada à direita no topo da área segura; se não couber, o QA reprova — encurte o texto.
- `caption`: legendas automáticas (das palavras da narração) e o `cta` no fim, depois que a fala acaba.
- Entradas só com escala/opacidade a partir da borda ancorada da zona: o texto nunca sai da zona, nem por um quadro.
- Legenda: Inter 800, **72 px**, caixa escura, 1 linha (até 4 palavras / 14 caracteres), palavra falada em laranja `#ff5a1f`. Era 58 px: o Samuel achou pequena (31/10/2026). Não diminuir.

## Câmera 3D (a causa raiz dos cortes)

Nunca posicionar câmera "no olho". Para cada plano:

```js
const anim = (t) => { /* só os objetos, sem câmera */ };
const box = envelope([objetoA, objetoB], anim, t0, t1);       // tudo o que se mexe no plano
const P = CAM.pose(box, { zone: "stage", from: [0, 0.4, 1] }); // distância resolvida para caber na zona
```

- `zone`: `stage` se a headline tiver texto em algum momento do plano; senão `stage-tall`.
- `from`: direção da câmera em relação ao objeto (ângulo). `pull: 1.15` dá respiro (nunca < 1). `pad` (padrão 28 px) é a folga mínima até a borda da zona.
- Movimento: `CAM.move(box, tipo, k, opções)` dá um movimento pronto em volta do assunto (`push`, `reveal`, `orbit`, `crane`, `drop`, `truck`; ver "Direção" abaixo), sempre resolvido pelo `pose` (o assunto cabe na zona do começo ao fim); `CAM.blend(A, B, k)` entre duas poses, `CAM.track(t, [[t0, A], [t1, B, transição]])` para vários planos, `CAM.shake` para impacto.
- Mudança grande de ângulo dentro do plano: passe por um ponto intermediário (`CAM.track` com uma pose no meio) para a câmera não atravessar luminária, pote ou cabeça no caminho; ou corte (adicione o tempo em `cuts`).
- O `pose` enquadra a caixa alinhada aos eixos: um objeto comprido visto na diagonal (a mesa) infla a caixa e fica pequeno. Enquadre o que importa no plano (o pote e os bancos perto dele), não o conjunto todo.
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

## Plano de fundo: a tela inteira

A **animação principal** do plano (os heróis, o que a fala explica naquele instante) fica **dentro da área segura**, no palco. O **plano de fundo** pode ocupar **a tela inteira** (1080 × 1920, até sob a interface do app) para **contextualizar o take**: a estrada que segue até o horizonte com campo dos lados, a mesa e a parede atrás do celular, a parede do escritório atrás do quadro de cortiça, a cidade, o céu, o plenário desfocado.

- Fundo é contexto, não informação: nada de texto, número ou objeto que a fala cite no fundo (isso é herói, vai no palco).
- **Fundo interessante** (pedido do Samuel, 31/10/2026: parede escura e degradê marrom não são fundo). Todo plano mostra um **lugar** que se reconhece em 1 s, ligado à história, com: três camadas (frente, herói, fundo); **uma luz que se vê** no quadro (janela, luminária, letreiro, tela, com feixe ou poeira); **uma segunda cor** além do marrom (azul da noite e das telas, vermelho e azul da viatura, verde do dinheiro); e um lugar por ato, não o vídeo inteiro na mesma sala.
- No 9:16 o fundo aparece **acima e abaixo** do herói, quase nada dos lados: ponha o interesse no teto, no alto da parede e no chão (janela a 7 m do centro fica fora do quadro). Confira na prévia o que está atrás do herói em cada plano.
- Pronto no kit: `makeOfficeSet` (`engine/props/sets.js`: sala da PF com teto de luminárias, janelas com persiana e a cidade à noite, estantes de arquivo, relógio, feixes de luz com poeira; `windows(k, cor)` e `lights(k)` para as batidas), `makeLightShaft`, `makeFloorGlow`, `makeSetMotes`, `makeSetWindow`, `makeArchiveShelf`, `makeWallClock`. Lugar novo que sirva a outros vídeos vai para esse arquivo.
- O herói se separa do fundo por nitidez e luz (luz de recorte, `fillAt`), não apagando o fundo; a faixa `#ov-scrim` garante a leitura do título e da legenda.
- Fundo também se mexe: paralaxe com a câmera, partículas, luz passando, elementos entrando pelas bordas. É o que dá a sensação de tela viva sem tirar o herói do palco.
- Registro: `S.backdrop(obj)` (não entra nas checagens de texto em cima, de corte ou de tamanho; a folha de objetos o ignora). Herói nunca é fundo.

## Movimento: nada parado

O vídeo prende pelo movimento. Em todo plano alguma coisa anda: a câmera (`CAM.blend`/`CAM.track` do começo ao fim do plano, nem que seja um empurrão lento), um objeto entrando, uma foto aproximando. Mais de 2 s sem nada se mexer reprova (`plano_parado`). O assunto do plano ocupa pelo menos 45% da zona (`objeto_pequeno`) e o corte nunca cai num palco vazio (`quadro_vazio`): o objeto do plano seguinte já está na tela no corte, ou entra junto com ele.

## Direção: dinâmica, câmera e fundo que conta a história

Pedido do Samuel depois do vídeo do Banco Master (31/10/2026): **mais dinâmica, ilustrações mais bem definidas, jogos de câmera e plano de fundo interativo com a história.**

**Jogos de câmera.** Cada plano tem um movimento com intenção, escolhido pelo que a fala faz naquele instante, e dois planos seguidos não repetem o mesmo movimento:

| Movimento (`CAM.move`) | Quando | Exemplo |
| --- | --- | --- |
| `push` (aproxima) | revelação, número, "olha isso" | a pilha do Master sobe e a câmera chega junto |
| `reveal` (abre) | contexto, consequência, "todo mundo" | do pote para a multidão inteira |
| `orbit` (gira em volta) | objeto que é o assunto e merece ser visto por inteiro | o porta-retrato, o escudo |
| `crane` / `drop` (sobe / desce) | mudar de escala, entrar ou sair de um lugar | de cima da mesa para a cadeira vazia |
| `truck` (desliza de lado) | passar por uma fila de coisas | os bancos à mesa, um por um |
| `CAM.shake` | impacto (porta fechando, carimbo) | "LIQUIDADO" |

- Mude o tamanho do quadro a cada 2–4 s: geral → médio → detalhe. Um vídeo inteiro no mesmo tamanho de plano cansa, mesmo com a câmera andando. Plano que fica mais de 4 s no mesmo assunto ganha viradas dentro dele, no tempo da fala: `shotTrack(t, [[t0, caixa, movimento, opções], ...])` em `videos/2026-11-02-impacto-dolar/scenes.js` (geral → o termômetro da inflação no "um ponto" → o da comida no "na comida"); cada enquadramento registra os seus heróis com `when`. Fechar num objeto alto e fino não aproxima (a altura já limita o quadro): enquadre a parte que importa (a coluna do termômetro, a foto sem a moldura).
- A câmera segue a ação: um objeto que viaja (a conta voando até o ITAÚ) leva a câmera junto, por um caminho que não atravessa nada (ponto intermediário no `CAM.track`).
- Ponto de vista também é jogo de câmera: por trás da cadeira vazia, por cima do pote olhando a conta, de lado contra o salão escuro. Escolha o ângulo que deixa o fundo escuro atrás do título.
- Truque de cinema é permitido: o que fica atrás da câmera num close (o pote, um convidado) pode sair desse plano e voltar no corte. Nunca algo que está no quadro.

**Plano de fundo interativo com a história.** O fundo reage às batidas da fala, não só se mexe sozinho:

- Use `beat(t, at, d)` (0 → 1 → 0) para o fundo responder no tempo da palavra: as janelas da cidade apagam em "liquida", a multidão pula quando o pote derrama, as luzes do salão piscam em "foi embora sem pagar", o bokeh acelera no número grande.
- O fundo muda junto com a história: o salão cheio vira salão vazio quando o Master sai; o pote cheio volta a encher no fundo enquanto a fala explica a recomposição.
- Continua sendo fundo: mais escuro e mais longe que o herói, nada de texto nem do dado da fala (isso é herói e vai no palco).

**Ilustração bem definida** (o que as revisões cegas do Banco Master apontaram):

- Silhueta que se lê sem som: cada objeto tem a peça que diz o que ele é (tampa e fenda no pote, carimbo na conta, cadeado com haste) e contraste com o que está atrás.
- Título e legenda nunca sobre superfície clara: toalha, papel e parede clara atrás do texto somem com o laranja. Use toalha escura (`makeDiningTable({ clothColor })`), ângulo que põe o fundo escuro atrás do título, e a faixa `#ov-scrim` faz o resto.
- Texto impresso sempre de pé para a câmera do plano (a conta, o "R$" da moeda, o celular). Girou o objeto ou a câmera? Gire o texto junto.
- Nada flutua sem motivo: prato é servido (desce pouco e assenta), não cai do teto; tampa que sai, sai de quadro; moeda que pousa não cobre o texto.
- Nada atravessa nada, nem vidro: placa encostada no pote, mão em cima da placa, recibo atravessando o prato são erros, mesmo que o QA não pegue (o QA só vê o que está registrado como sólido).
- Escala de verdade e de destaque: o "pote gigante" tem que ser gigante perto da multidão; o recibo não pode ser maior que a pessoa sentada.

## Objetos

- Objeto apoiado fica **em cima** do apoio (base no topo do apoio), nunca afundado.
- Porta, persiana, tampa: passam **atrás** ou **na frente** com folga — nunca através do objeto.
- Texto que pertence a um objeto (etiqueta, placa, degrau) é **impresso nele** com `makePlate()`, não um sprite flutuando. Letra de pelo menos 16 px na tela enquanto o objeto é o assunto (`texto3d_ilegivel`): placa larga, texto curto (2–3 palavras). `detail: true` só para texto que é textura (o ano pequeno na porta de um caminhão).
- Um herói por plano. Contato com o chão via `contactShadow`.

## Estilo do canal

- Fundo escuro e quente `#160e0a` (o motor desenha um degradê suave e um chão com textura); laranja `#ff6a2b`; vermelho `#e0261b`; verde `#2fae66`; creme `#f4e8da`.
- **Acabamento realista, menos cartoon** (pedido do Samuel, 31/10/2026): proporções de verdade, materiais com textura (papelão, tecido, asfalto, metal escovado, madeira), bordas chanfradas, os detalhes que dizem o que o objeto é (fita e etiqueta na caixa, faixa e tachão na estrada, serrilha na moeda). O motor faz sombra real (luz principal que acompanha o plano) e reflexo de estúdio; objeto liso de uma cor só, sem textura nem detalhe, parece brinquedo.
- **Gráfico polido, sem falha**: nada atravessando nada (nem por um quadro), nada piscando, sem borda serrilhada (o motor renderiza em 1,5× e reduz), texto 3D nítido, cores que não estouram.
- Fonte Inter (600–900). Números grandes em branco ou laranja; rótulos em chip vermelho.
- Luz: chave quente com sombra suave que acompanha o assunto do plano, contraluz fria, mapa de ambiente de estúdio (reflexo real em metal, vidro, louça e verniz), neblina adaptada à distância da câmera (`CAM.apply`).
- Materiais: `pmat` (físico, com verniz), `glassMat`, `woodTex` (`woodTex({ base, planks })` tábuas; `woodTex("#cor")` veio fino, de `props/materials.js`), `noiseTex`, e em `props/materials.js` papelão, asfalto, grama, reboco e tecido; biblioteca do restaurante em `engine/props/restaurant.js` (mesa com toalha `clothColor`, cadeira estofada, pessoa de terno articulada, placa de nome, louça, cloche, maço de dinheiro, pote de vidro com moedas, conta, cadeado, calendário, etiqueta, salão, cidade à noite, multidão).
- Faixa escura atrás dos textos (`#ov-scrim`, no `tools/build.py`): escurece o alto e a base do quadro para o título e a legenda lerem sobre qualquer fundo.
- 3D de verdade (Three.js), sem logos ou marcas reais; prédios e veículos genéricos.
- Fotos reais (pessoas, o avião, o prédio, o documento) entram num quadro de investigação, num porta-retrato no palco ou num cartão 2D, sempre com crédito e zoom lento: ver [`fotos.md`](fotos.md).
- Cortes com flash laranja curto e whoosh; impactos com grave; pops em contagens.

## Biblioteca de objetos (`engine/props/`)

`basics.js`: makeButton, pressCurve, makeGlassLid, makeAlarmRings, makePerson, makeCoin, makeShutter, makeBallotBox, makeMoneyStack, makeFlame, makeSmoke, makeGridFloor · `devices.js`: makePhone, phoneScreenPoint, makeFinger, makePhoneCrowd, makeBedsideTable, paintTradingApp · `finance.js`: makeBreakerPanel, makeWire, makeBulb, makeChartScreen, makeStairs, makeTimeline, makeVChart · `civic.js`: makeWeekStrip, makeStreetSign (+ noParkingTex, ringTextTex), makeSubPlate, makeLawBook, makeStamp, makeHourColumn, makeFolder, makeCrowd, makeOilRig, makeSea, makeHouse, makeHourglass (areia que escorre), makeCertificate (documento oficial com selo), makeInkMark (marca de carimbo, 1 ou 2 linhas) · `media.js` (fotos reais): makePhotoPrint, makeCorkBoard, makeString, makePin, makePhotoFrame, makePhotoPlane, dropPrint · `restaurant.js` (mesa da analogia do Banco Master): makeDiningTable (`clothColor`), makeDiningChair, makeDiner (pessoa de terno articulada: senta, anda, alcança), makePlaceCard, makeDish, makeCloche, makeCashBundle, makeGoldCoin, makeCoinJar (pote com moedas, `fill`, `lid`), makeBillReceipt, makeBillFolder, makePendantLamp, makePadlock, makeFlipCalendar, makePriceTag, makeRestaurantRoom, makeSkyline, makeCrowdField · `materials.js`: cardboardTex, asphaltTex, grassTex, woodGrainTex (= `woodTex("#cor")`), plasterTex, fabricTex, tileTex · `commerce.js`: makeBlouse, makeParcel, makeTwoLaneRoad, makePlate2, makeTollGate · `charts.js` (gráficos de coisas reais): coinGeometry, coinMetalMat, makeCoinColumn (pilha de moedas, 1 moeda = 1 unidade, `set(k)` cresce), hazardTex, makeFloorTag (etiqueta de ano no chão), makeCoinTimeline (uma coluna por ano, ano sem dado isolado com fita e cerca, projeção em moedas de vidro laranja, `line(y)` laser de referência) · `sets.js` também: makeEraHall (salão comprido que muda de época ao longo do x: arquivo com estantes de livros-razão, galpão de tijolo com janelas de fábrica, parede de vidro com a cidade; `tint(k, cor)` para as crises), makeLedgerShelf, makeGlowWindow, setBrickTex · `retail.js` (supermercado): makeGlassFreezer (freezer de porta de vidro: `open`, `heat` azul→vermelho, `frost`, `temp`, `melt` com poça), makeSupermarketSet (mercado à noite, fundo: parede de freezers que fica vermelha com `heat`, tubos de luz, gôndolas curtas atrás do assunto), makeWasteBin (caçamba com comida jogada fora) · `access.js` (portas, cofres e chaves): makeVaultDoor (porta redonda de cofre: `open`, `spin`, `glow`), makeVaultRoom (sala-cofre, fundo: painéis de aço, cofres de aluguel dourados, giroflex `beacon`; `holes` para o vão do cofre e da porta de serviço), makeServiceDoor (porta de aço com leitor de cartão), makeKeycard (cartão CHAVE-MESTRA), makeHoldingHand (mão segurando o cartão; o braço sai do quadro: nada flutua), makeControlCabinet (central de parede com tela, `dust`, fecho para cadeado), makeWifiRouter, makeHotelDoor + makeHotelHall (corredor de hotel visto de frente) · `sport.js` (futebol à noite): makePitch (gramado com as marcações reais e a marca do pênalti que apaga), makeSoccerBall, makeSoccerGoal, makeFloodlights, makeStadiumNight (fundo), makeVarMonitor (monitor do VAR com cronômetro, placa e cabo que desliga). Também (vídeo dos homicídios, 03/11/2026): makeStadiumBowl (estádio oval lotado, maquete ou real com `size`: arquibancada em degraus com torcida, gramado, cobertura, refletores `lights(k, cor)`, faixa de LED `band`; `beams(n)` acende um feixe de luz vermelho por pessoa — a analogia "estádio de 100 mil" —, `ghosts(n)` feixes cinza; `front`/`back` para enquadrar uma arquibancada), makeSeatBeam (o feixe), makeStadiumSeatRow (fileiras de cadeiras de estádio em degraus, `light(i, k)`), makeScoreboard (telão de estádio com pernas, `paint(fn)`). · `money.js` (dinheiro e câmbio, vídeo do dólar): makeCurrencyNote (cédula genérica de real ou dólar, sem desenho de nota real), makeExchangeBoard (painel CÂMBIO de parede com visor que troca o preço e seta), makeFxPairBoard (painel de pares de moedas, `cols`, `light(i)`, `flash(i)`), makeInflationThermometer (termômetro de parede, `set(v)`, `col` para o close), makeLineScreen (monitor que desenha uma linha sem números), makeSpeechBubble, makeCoinMobile (moeda grande e 44 moedas que sobem presas por fios), makeBakerySet (padaria à noite, fundo: azulejo verde-escuro, forno, prateleiras de pão, vitrine; `flare`), makeFrenchRoll, makeBreadBasket, makeShelfCard (placa de preço com tarja), makeProduceSack (saco costurado de farinha, adubo ou soja, rótulo e faixa), makeGrainHeap (monte de grãos, `grow`), makeStakeSign (placa espetada), makeWarehouseSet (galpão à noite, fundo), makeCapsuleBlister, makeGroceryBasket, makePortNightSet (porto à noite com guindastes, fundo) · `sanitation.js` → makeNationFlag também faz "argentina"; makeDeskGlobe (globo de mesa com meridiano de latão, continentes simplificados e o Brasil em verde e amarelo, `spin(a)`) · `charts.js` → makeShareDisc (o mundo como um disco cortado em fatias: a fatia de uma parte, em escala verdadeira, `set(fração, destaque)`) · `economy.js` (economia na rua e em maquete, vídeo do PIB): makeHatchbackCar (carro hatch genérico, `lights(k)`), makeBarbecueGrill (churrasqueira de pé com espetos, chama e fumaça: `update(t, k)`), makeStringLights (varal de luzes que acendem uma a uma), makeCargoShipModel (navio porta-contêiner de maquete, `set(k)` carrega), makeFactoryModel (fábrica de tijolo com shed e chaminé que solta fumaça, `drift`), makeTowerCraneModel (guindaste de obra com carga), makeCivicBuilding (escola ou hospital: janelas que acendem `lights(k)`, `dim(k)`), makeMeasuringRuler (régua com cursor que mede o topo de uma pilha), makeGearWheel, makeCoinFunnel (funil com placa, preso por um braço), makeLabelPlinth (pedestal preto com placa), makeCoffeeMug, makeTrendMonitor (monitor com título e linha que sobe; `dim(k)` apaga a tela quando ela fica atrás de um título). · `maps.js` (mapas de verdade, contornos do Natural Earth 1:50m, vídeo das economias da América do Sul, 04/11/2026): makeSouthAmericaMap (maquete da América do Sul num tabuleiro de oceano com grade; cada país um prisma com a borda real que sobe com `set`/`heights` — gráfico em cima do mapa —, `color`, `dim(manter, k)` apaga os outros no close, `glow`, `tag` placa de ranking numa haste sobre o prisma, `faceTags`; `slab` é o herói do plano geral; Guiana Francesa e Malvinas em cinza, sem nome) · `restaurant.js` também: makePizzaPie (pizza em tábua cortada em `slices` fatias que se afastam com `spread` e saem com `lift`) · `civic.js` também: makeGraduationCap (capelo de formatura: estudo, escola). · `community.js` (bairro sob controle armado, vídeo das milícias, 04/11/2026): makeAlleyNight (viela à noite, fundo: fachadas de reboco e tijolo, lajes com vergalhão e caixa-d'água, poste com fiação do "gatonet", rua molhada, morro com luzes; `siren(k, t)` giroflex vermelho e azul nas paredes; deixa o vão `gap` para um makeHouseDoor), makeGasCylinder (botijão), makeLotacaoVan (van de lotação genérica), makeTerritoryModel (maquete de bairro em mesa: casas instanciadas que acendem na cor de quem domina, `paint(i, cor, k)` + `flush()`, `skip(i, j)` abre ruas), makeBigKey, makeIdBadge (crachá com foto genérica), makeNewspaper (jornal dobrado com manchete legível), makePressLectern (púlpito com microfones), makePressCamera (câmera de imprensa caída, lente trincada), makeCaseFile e makeCaseFilePile (pastas de processo; a pilha cresce com `set(k)`), makeTyreBarricade (barricada de pneus em pé), makeShieldBadge (distintivo em escudo de duas faces num suporte: dourado com SEGURANÇA → ferro escurecido, `spin(a)`). Objeto novo que pode servir a outros vídeos vai para `engine/props/` (e para o git).

Motor, objetos e `scenes.js` viram **um só módulo**: um nome declarado duas vezes quebra a página. O `tools/build.py` recusa o build e diz qual nome e onde. Objeto do kit leva nome específico (`makeCoinJar`, não `makeJar`; `GOLD_METAL`, não `GOLD`) para não colidir com o que um vídeo antigo já declarou.

Objeto novo: montar com formas que já dizem o que são (a casa tem duas águas e a ponta para cima; um avião tem asa e cauda), conferir o recorte dele na folha de objetos (`preview/objetos-NN.jpg`) antes de seguir, e nunca girar uma primitiva em dois eixos "até parecer": calcular a posição de cada peça.
