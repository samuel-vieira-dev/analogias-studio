# Visual — Estilo Explicando Direito

2D sobre papel: texto cinético que escreve a fala palavra por palavra, um elemento por vez no palco (foto, cartão, documento, gráfico) e transições de impacto no gancho. Motor: `engine2d/` (`direito.js`, `direito.css`, `icones.js`, fonte Anton). Build, QA, prévia e capa são os mesmos comandos do kit; eles reconhecem `"estilo": "explicando-direito"` no `video.json`. Medidas da referência: [`referencia.md`](referencia.md). Exemplo completo: [`videos/exemplo-explicando-direito/`](../../videos/exemplo-explicando-direito/video.json).

## Tela

Mesma área segura do kit (x 190–890, y 220–1500; `config/layout.json`), com as zonas usadas assim:

| Zona | O que vai |
| --- | --- |
| `source` (y 220–286) | figurinha do tema à esquerda (`video.json → icone`); crédito "Foto: …" à direita enquanto a foto aparece (automático) |
| `headline` (y 300–560) | o texto cinético (é a legenda: não existe outra) |
| `stage` (y 580–1330) | o elemento do plano; a `foto-cheia` vaza na largura toda (é fundo, fica fora do QA de área segura) |
| `caption` (y 1346–1476) | pílula com o @ do canal |

Fundo: papel cinza-azulado com rachaduras e pontinhos (gerado em `engine2d/.cache/papel.jpg`), aproximando devagar. Cores em `channel.yaml → estilos.explicando-direito.cores` (tinta #12171b, mostarda #c99412, vermelho #7e1a1d, petróleo #1d434a).

## Texto (`video.json → texto`)

Um item por bloco de tela, **a própria fala** em ordem (o build casa cada palavra com `audio/words.json` e reprova se menos de 80% bater):

```json
"texto": [
  "a vitória de | # [lula] contra flávio | bolsonaro no 2º turno",
  "foi uma | # [aberração|preto] | política."
]
```

- `|` separa linhas (2–3 por bloco); a que começa com `#` é a **grande** (120 px, encolhe para caber em 700 px); as outras são pequenas (54 px). Todo bloco tem uma grande.
- Destaque da palavra-chave, desenhado junto com ela: `[palavra]` caixa mostarda (o padrão; 1 por bloco), `[x|preto]` caixa preta com letra creme, `[x|verde]` caixa petróleo, `[x|vermelho]` letra vermelha, `[x|circulo]` círculo à mão, `[x|sublinhado]`, `[x|riscado]`. Dois destaques no mesmo bloco só quando a frase compara duas coisas.
- Números em algarismo ("54 milhões", "2027", "77%"); dinheiro como a fala diz ("37 bilhões de reais", não "R$ 37 bi": o "R$" vem antes do número e não casa com a fala). "→" vira seta. Artigos e preposições da linha grande saem menores sozinhos.
- Bloco de 5 a 9 palavras, trocando a cada 2–3 s (o build avisa acima de 4 s). Quebra natural da fala: o bloco termina onde a frase respira.

## Visuais (`video.json → visuais`)

Um por plano, em ordem. `"em": "trecho exato da fala"` diz quando entra (o build acha o trecho em `words.json` a partir do visual anterior); `"t": 1.2` também vale. Itens, destaques e carimbos também aceitam `"em"`. O primeiro visual está na tela no quadro 0 (é a miniatura). Trocar a cada ~2 s; acima de 4,5 s o build avisa: troque ou faça entrar mais um elemento (cartão no canto, carimbo, destaque).

| tipo | Para quê | Campos |
| --- | --- | --- |
| `fotos` | pessoa citada (1ª menção), 1–4 polaroids com nome | `itens: [{media, nome, em?, pb?, marca?: {tipo: "ok"\|"no", em}}]`, `formato` (1 foto: `paisagem`\|`retrato`\|`quadrado`), `pb` |
| `foto-cheia` | momento tenso, foto que vaza na largura | `media`, `pb`, `altura` (860) |
| `cartao` | um número com contexto | `icone`, `grande` ("21 DIAS", "33 → 30 MI"), `pequeno` |
| `nota` | ressalva com fonte | `texto`, `sub`, `rotulo` ("NOTA") |
| `documento` | lei, artigo, decisão, inquérito, extrato | `etiqueta`, `titulo`, `texto`, `cor: "vermelho"`, `linhas: [{texto, tag?, destaque?: "trecho"}]`, `clipe`, `selo` |
| `barras` | comparação de valores | `barras: [{grupo, nome, valor, rotulo, cor, em}]`, `delta: {de, para, texto, em}` |
| `rosca` | porcentagem | `valor`, `rotulo`, `cor`, `sufixo` |
| `pessoas` | gente, eleitores, vítimas (3–4 bonecos) | `n`, `destaque: {em, cor, n}`, `tag: {texto, em}` |
| `hemiciclo` | votação no Senado/Câmara | `total`, `grupos: [{nome, n, cor, em}]`, `centro: {grande, pequeno, em}`, `rotulo` |
| `fluxo` | troca entre dois lados | `nos: [{texto, sub, cor}, {…}]`, `setas: [{de, para, texto, cor, em}]` |
| `bifurcacao` | dois caminhos (indulto × anistia) | `esquerda: {texto, sub}`, `direita`, `destaques: [{lado, em}]` |
| `balanca` | qual pesa mais | `esquerda`, `direita`, `pesa: {lado, em}` |
| `celular` | conversa, app, lista | `titulo`, `sub`, `mensagens: [{lado: "e"\|"d", em}]`, `apagar: "trecho"`, `lista: [{texto, destaque, estrela}]` |
| `conexoes` | ligação entre duas pessoas e uma empresa/caso | `pessoas: [{media, nome}, {…}]`, `centro: {texto, sub}`, `ligacoes: [{de: 0\|1, texto, estilo: "tracejada", em}]` |
| `palavras` | conceitos lado a lado (PENA × CRIME) | `itens: [{texto, cor, em, riscar: "trecho"}]` |
| `numeros` | conta (10 − 3 = 7) | `itens: [{texto, rotulo, cor, em} \| {op: "−"}]` |
| `icone` | um objeto simples | `nome`, `rotulo`, `tamanho` |
| `mapa` | rota entre cidades/países (voo, fuga, viagem) | `area: [lon0, lon1, lat0, lat1]` (o mínimo que aparece), `altura` (660; 560 se tiver `nota`), `pontos: [{id, nome, lon, lat, lado: "d"\|"e"\|"c"\|"b", em?, tag?: {texto, em, cor}}]`, `trechos: [{de, para, em?, dur, curva, fica, fraco}]` (sem `em` já aparece desenhado; o avião anda na linha e some ao chegar, ou `fica`), `brasil: {em, texto, lon, lat}` (o Brasil muda de cor e ganha etiqueta), `rotulos: [{texto, lon, lat}]`, `paises: ["argentina"]` (país vizinho com fronteira, num tom mais escuro; contornos em `engine2d/geo.js`) |

Em qualquer visual: `cartao: {…}` (no canto do elemento; na `foto-cheia`, no canto de baixo dentro da área segura), `nota: {…}` (embaixo) e `carimbo: {texto, em, pos: [x%, y%]}` (carimbo vermelho batendo, com tremida). Cores: `vermelho`, `petroleo`, `verde`, `azul`, `cinza`, `preto`, `amarelo`. Ícones (`engine2d/icones.js`): calendario, ampulheta, relogio, seta-baixo, seta-cima, seta-direita, cadeado, urna, martelo, balanca, documento, passaporte, celular, predio, predio_stf, pessoa, dinheiro, grade, alerta, lupa, algemas, microfone, van, aviao, caminhao, combustivel (bomba de combustível). Ícone novo: formas simples que dizem o que são, conferido na folha da prévia.

**Foto ou elemento?** Foto para pessoa citada, lugar e prova (sempre com crédito, [`../fotos.md`](../fotos.md)); documento para lei/decisão; cartão para número; gráfico para comparação. Nunca imagem de IA de pessoa ou fato real.

## Transições (`transicao` no visual)

- `suave` (padrão): o anterior some rápido, o novo entra com "pop".
- `corte`: troca seca.
- `impacto`: flash branco + o anterior explode em zoom com desfoque + o novo entra grande e assenta + eco gigante da linha grande do bloco ao fundo. **Pelo menos um no gancho (até 3,5 s)**, de preferência com `foto-cheia` `pb: true`; depois, só na revelação (regra 3 do roteiro).
- `chicote`: deslize horizontal desfocado com flash. Para mudança de tempo/lugar ("volta pra 2018").

## Áudio

- Voz do canal, rápida: `tools/tighten.py <take> audio/narration.wav --target <s> --gap 0.06 --sentence-gap 0.14 --max-tempo 1.12` (alvo: 3,2 palavras/s).
- **Trilha-assinatura** grave e constante embaixo da voz, a mesma em todo vídeo do estilo: `assets/trilhas/explicando-direito.mp3` (`channel.yaml → estilos.explicando-direito.musica`). No `video.json`: `"audio": {"narration": "audio/narration.wav", "words": "audio/words.json", "music": "assets/trilhas/explicando-direito.mp3", "music_db": -15, "music_loop": true, "music_fade": 0.4}`. Se o arquivo ainda não existe, ver `SKILL.md` → "Trilha-assinatura".
- Efeitos (`sfx`, sons do HyperFrames): `whoosh-cinematic.mp3` (−8 dB) no impacto, `whoosh-short.mp3` (−10) no chicote, `impact-bass-1.mp3` (−6) no carimbo. O build imprime `sfx_sugerido` com os tempos já resolvidos: copiar para `video.json → sfx`, rodar `tools/mix.py` e o build de novo.
- Duração do vídeo = fim da última palavra + 0,3 s (fim seco).

## QA, prévia e capa

- `node tools/qa.cjs videos/<slug>` roda `tools/qa_direito.cjs`: texto fora da área segura/zona, texto em cima do elemento, elemento fora da área segura, palco vazio, foto sem crédito, foto esticada. `bash tools/selftest.sh` prova que ele pega cada um (`tests/qa-pega-erros-direito/`).
- `node tools/preview.cjs videos/<slug>` tira um quadro por plano e recorta cada elemento (`objetos-NN.jpg`) para a revisão cega, como no v1.
- Capa (`node tools/capa.cjs`, chamado pelo `finalize`): um quadro do gancho sem o texto cinético, com `post.title` em Anton gigante na faixa de cima e `[palavra]` na caixa mostarda; o elemento do palco desce para baixo do título. Mesmas regras de tamanho do v1 (130–220 px, até 4 linhas).
- Render 2D é rápido: ~1 min para 40 s no Mac (rascunho).
