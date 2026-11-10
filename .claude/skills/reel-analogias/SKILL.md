---
name: reel-analogias
description: Cria um Reel/TikTok/Short narrado do @analogias.br — pergunta o tema e o estilo de edição (Estilo Analogias v1, 3D com analogia; ou Estilo Explicando Direito, 2D com texto cinético), checa os fatos, propõe 5 hooks, aprova o roteiro, gera a voz no VoiceStudio (local), monta as cenas com fotos reais creditadas, roda QA automático + revisão cega e entrega MP4, capa e legenda do post; no fim pede o feedback do Samuel e melhora a skill sozinho.
---

# Reel narrado — @analogias.br

Produz um vídeo vertical narrado (voz Narrador Analogias) num dos **estilos de edição** do canal ([`docs/estilos.md`](../../../docs/estilos.md)):

- **Estilo Analogias v1** (`analogias-v1`): ~90 s, cenas 3D realistas com fotos reais onde elas ajudam a entender, uma analogia no ponto difícil, legendas palavra a palavra, pergunta final na tela.
- **Estilo Explicando Direito** (`explicando-direito`): 55–75 s, 2D sobre papel cinza, texto cinético que escreve a fala, polaroids, cartões, documentos e gráficos, impacto no gancho, trilha grave constante, fim seco.

Tudo roda no kit **analogias-studio** (GitHub `samuel-vieira-dev/analogias-studio`); os detalhes de cada etapa estão nos `docs/` do kit. As etapas abaixo descrevem o v1; no Explicando Direito, aplicar as trocas da seção **"Estilo Explicando Direito"**.

## Entrada

Três coisas vêm do Samuel, no começo:

- **Tema do vídeo** (obrigatório)
- **Estilo de edição** (obrigatório): Estilo Analogias v1 ou Estilo Explicando Direito
- **Referências visuais** (opcional: links, prints, arquivos)

Ele escolhe depois, na etapa 3: o **hook** (5 opções + "Outro") e a **pergunta final** (3 opções + "Outra"). Área segura, voz, legendas e regras de roteiro **não são perguntados**: são requisitos do kit e do estilo (`config/layout.json`, `channel.yaml`, `docs/`).

## Fluxo com o Samuel

Ele só fala com você em cinco pontos; o resto você faz sozinho:

1. Você pergunta o **tema** e o **estilo de edição** (etapa 0).
2. Ele escolhe o **hook** e a **pergunta final** (etapa 3).
3. Ele **aprova o roteiro** (etapa 5).
4. Ele **vê o vídeo** (etapa 10).
5. Ele diz o que **gostou e não gostou**, e você melhora o kit (etapa 12).

## 0. Tema e estilo — sempre a primeira coisa

Antes de pesquisar qualquer coisa, numa pergunta só:

- **Tema**: se o pedido ("faz um vídeo novo", "bora gravar") não trouxe o tema, perguntar.
- **Estilo de edição**: perguntar sempre, mesmo que o tema já tenha vindo; só não pergunta se o Samuel já disse o estilo no pedido. Opções (no Claude Code, `AskUserQuestion`; no claude.ai, a ferramenta de perguntas se houver, senão uma mensagem curta numerada):
  - **Estilo Analogias v1** — 3D narrado com analogia, ~90 s, pergunta final na tela.
  - **Estilo Explicando Direito** — 2D com texto cinético sobre papel, notícia de política/justiça, ~60 s, fim seco.
  - Com o tema na mão, pôr primeiro (e marcar "Recomendado") o que combina: lei, decisão, prisão, eleição, "o que muda agora" → Explicando Direito; mecanismo que pede uma analogia (bolsa, juros, tecnologia, corpo humano) → v1. A escolha é do Samuel.
- Faltando os dois, tema e estilo vão na mesma pergunta. A resposta vai para `brief.yaml → estilo` (`analogias-v1` ou `explicando-direito`) e, na etapa 8, para `video.json → estilo`.

## 0b. Preparar o kit

- **No Mac (Claude Code local)**: `cd` para o clone do kit (ex.: `~/analogias-studio`); `git pull`. Se não existir: `git clone https://github.com/samuel-vieira-dev/analogias-studio.git`.
- **Sessão na nuvem**: anexar o repositório (`add_repo`, owner `samuel-vieira-dev`, repo `analogias-studio`, acesso `push`) e clonar como a ferramenta indicar.
- O `git pull` traz as melhorias dos feedbacks anteriores: é por ele que a próxima sessão já começa melhor.
- Primeira vez na máquina: `bash tools/setup.sh` (instala dependências e roda o autoteste do QA).
- Ler `CLAUDE.md`, `docs/estilos.md` e os docs do estilo escolhido (`channel.yaml → estilos.<id>.docs`): no v1, `docs/roteiro.md`, `docs/visual.md`, `docs/fotos.md` e `docs/qa.md`; no Explicando Direito, `docs/explicando-direito/roteiro.md`, `docs/explicando-direito/visual.md` e `docs/fotos.md`. Criar a lista de tarefas com as etapas abaixo.
- Pasta do vídeo: `videos/<AAAA-MM-DD>-<tema-curto>/` (data de hoje).

## 1. Pesquisa e checagem de fatos

Buscar o tema na web (para assunto do dia, notícias de hoje). Cada número que for para a fala ou para a tela precisa de fonte, de preferência primária e confirmada por uma segunda. Salvar `fatos.md` (fato · dado · fonte com link · status). O que não fechar fica fora da narração. Depois do roteiro aprovado, o fato confirmado que não entrou na fala ganha o status `OK — fora da fala` (a lista Fontes do post sai das outras linhas). Na mesma busca, juntar as **fotos candidatas** (seção "Fotos" do `fatos.md`: id · o que mostra · página de origem · autor/veículo · licença): rosto de cada pessoa citada e o que der vontade de ver ("como é esse avião?"). Oficiais e livres primeiro, imprensa com crédito quando não houver equivalente; nunca imagem gerada por IA ou editada de pessoa ou fato real (`docs/fotos.md`). Se houver referências visuais, olhar cada uma agora e anotar o que aproveitar (forma, composição, cor de destaque) — sem copiar personagem, logo ou marca.

## 2. Ângulo da história

Achar o mistério (o que prende), o ponto difícil (onde entra **uma** analogia boa) e a projeção cenográfica ("imagina: você..."). Analogia só onde o assunto exige conhecimento prévio.

## 3. Opções para o Samuel (uma mensagem, e esperar)

- **5 hooks** numerados, cada um de um tipo (notícia urgente + imagem forte · cenário "imagina" · número chocante · contradição · pergunta que cutuca), 8–12 palavras, falados em até 3 s; e **6. Outro (escreva o seu)**.
- **3 perguntas finais** de duas escolhas, objetivas, as duas defensáveis; e **4. Outra (escreva a sua)**.
- Junto, em 2–3 linhas: os fatos principais encontrados e o ângulo proposto.

Se ele escrever o próprio texto, usar como está (só apontar se ferir uma regra).

## 4. Roteiro

Seguir `docs/roteiro.md`: gancho escolhido nos 3 primeiros segundos; história em segunda pessoa que gera curiosidade; projeção cenográfica; clareza de criança; termina na pergunta escolhida. ~240–250 palavras para 90 s. Entregar em tabela **# · narração · visual · texto na tela (zona)** + tabela dos 5 critérios (onde está · atende?) + os fatos usados + a **lista de fotos**. Na coluna visual, para cada plano: `3D: ...` ou `foto: <id> (quadro | porta-retrato | cartão)`. Critério: qual formato faz quem assiste entender o quadro mais rápido? Foto para pessoa citada (primeira menção), objeto/lugar/evento real específico e prova; 3D para mecanismo, analogia, número e cenário "imagina".

## 5. Aprovação — portão obrigatório

Mostrar o roteiro **completo** e esperar "aprovado" (ou ajustes). **Não gerar voz antes disso.** Depois do ok: salvar `brief.yaml`, `roteiro.md` e `narracao.txt` (texto exato para a voz: números por extenso, "pra", sem símbolos). Baixar as fotos aprovadas para `videos/<slug>/midia/<id>.jpg` (arquivo original da página da fonte, maior resolução) e registrar cada uma em `video.json → media` (`file`, `credit`, `url`, `focus`).

## 6. Narração (VoiceStudio)

Com o app **VoiceStudio** aberto no Mac: `python3 tools/voice.py videos/<slug>` gera os takes (2, `channel.yaml → voz.takes`) na voz **Narrador Analogias** e salva em `audio/takes/take-N.wav`. Roda local e não gasta crédito; leva alguns minutos por take. Se o app não responder, o script avisa: pedir ao Samuel para abrir o VoiceStudio. A voz do Sandro Dutra (ElevenLabs) fica em `channel.yaml → voz.elevenlabs`, só se o Samuel pedir.

## 7. Take, ritmo e tempos

```bash
python3 tools/transcribe.py videos/<slug>/audio/takes/* --ref videos/<slug>/narracao.txt   # nota de cada take → ESCOLHIDO
python3 tools/tighten.py <take escolhido> videos/<slug>/audio/narration.wav --target 88
python3 tools/transcribe.py videos/<slug>/audio/narration.wav --out videos/<slug>/audio/words.json --ref videos/<slug>/narracao.txt
```

Se o take escolhido trocou ou pulou palavras importantes, avisar antes de seguir.

## 8. Cenas

Escrever `video.json` (duração = fala + 2 s; `cuts`; `overlays` por **zona**, nunca por pixel; `sfx`; `captions.fix`) e `scenes.js` usando `engine/` (ver `docs/visual.md` e, como modelo, o vídeo mais recente que passou no QA atual, hoje `videos/2026-10-31-banco-master-fgc/`; vídeo já entregue não passa por QA de novo, as regras novas valem só para os próximos). Regras:

- Área segura **centralizada** (x 190–890, centro da tela x = 540; `config/layout.json`): título, palco, legenda e capa alinhados ao meio.
- **Animação principal dentro da área segura** (no palco); **plano de fundo na tela inteira** para contextualizar o take (a estrada até o horizonte, a mesa e a parede, o escritório, a cidade): mais escuro e mais longe que o herói, sem texto nem informação da fala, se mexendo (paralaxe, partículas, luz, coisas entrando pelas bordas). Registrar com `S.backdrop` (`docs/visual.md` → "Plano de fundo").
- **Acabamento realista, menos cartoon, e gráfico polido sem falha**: proporções reais, materiais com textura e detalhe (papelão com fita e etiqueta, asfalto com faixa, tecido, metal), bordas chanfradas; o motor dá sombra real e reflexo. Nada atravessando, piscando ou serrilhado.
- Cada cena: `anim(t)` só dos objetos → `CAM.pose(envelope(objs, anim, t0, t1), { zone })`; `stage` quando a headline tem texto, `stage-tall` quando não tem.
- Registrar `S.hero`, `S.label` (com `on`), `S.solid` (com `restsOn`), `S.scenery`, `S.backdrop`.
- Números, títulos e regras na `headline`; fontes e avisos em `source` (canto superior direito); CTA na base, depois da fala.
- Texto de objeto impresso nele (`makePlate`); objetos apoiados sem afundar; portas e tampas nunca atravessam nada.
- Reaproveitar `engine/props/`; objeto novo reutilizável vai para lá. Objeto novo é montado com peças calculadas (nunca uma primitiva girada "até parecer") e conferido no recorte da folha de objetos.
- Fotos: quadro de investigação (várias pessoas/fatos ligados), porta-retrato no palco (uma foto que é o assunto) ou cartão 2D (rosto + nome + cargo); exemplos em `docs/fotos.md`. Crédito "Foto: ..." na zona `source` durante todo o tempo em que a foto aparece.
- Nada parado: câmera andando no plano inteiro, fotos aproximando devagar, assunto ocupando ao menos 45% da zona, corte nunca num palco vazio.
- **Dinâmica e jogos de câmera** (`docs/visual.md` → "Direção"): cada plano com um movimento de intenção (`CAM.move`: `push` na revelação, `reveal` na consequência, `orbit` no objeto-assunto, `crane`/`drop` na mudança de escala, `truck` numa fila, `CAM.shake` no impacto); dois planos seguidos não repetem o movimento; tamanho do quadro muda a cada 2–4 s (geral → médio → detalhe); a câmera segue o que viaja, por um caminho que não atravessa nada.
- **Fundo interativo com a história**: o plano de fundo reage às batidas da fala (`beat(t, at, d)`: a cidade apaga em "liquida", a multidão pula quando o pote derrama, o salão esvazia quando o Master sai), sem virar herói nem ter texto.
- **Ilustração bem definida**: silhueta que se lê sem som (a peça que diz o que o objeto é), título nunca sobre superfície clara (toalha, papel, parede), texto impresso de pé para a câmera, nada flutuando nem atravessando (nem vidro), escala de destaque verdadeira.

## 9. Mixagem, build, QA e prévia (antes de renderizar)

```bash
python3 tools/mix.py videos/<slug>       # voz + efeitos do video.json, −14 LUFS
python3 tools/build.py videos/<slug>
node tools/qa.cjs videos/<slug>          # precisa terminar em "QA ok"
node tools/preview.cjs videos/<slug>     # um quadro por plano + folha de objetos numerada
```

1. **QA automático**: além de cortes e sobreposições, reprova objeto pequeno, palco vazio, plano parado por 2 s, texto 3D ilegível, foto sem crédito e foto esticada (`docs/qa.md`). Corrigir na origem (`scenes.js`, `video.json`, `engine/`) até "QA ok". Nunca afrouxar um limite do `config/layout.json` ou encurtar um `when` para passar.
2. **Revisão cega** (obrigatória): copiar `preview/*.jpg` para uma pasta à parte e abrir um subagente novo (ferramenta Agent) sem o roteiro nem o gabarito, só com os caminhos dessas cópias de `objetos-NN.jpg` e `sheet-NN.jpg` e o pedido de `docs/qa.md` → "Revisão cega". Comparar o que ele nomeou com `preview/objetos.json`: nome errado ou vago = objeto mal feito. Corrigir tudo o que ele apontar (ou justificar por escrito) e repetir QA + prévia.
3. **Sua leitura**: olhar cada folha com o roteiro do lado — o plano mostra o que a fala diz naquele instante? Composição, tamanho, leitura dos textos, movimento de câmera variado, fundo reagindo à fala. Para conferir uma correção, `node tools/preview.cjs videos/<slug> 12.4 42.0` (só esses tempos) e `node tools/qa.cjs videos/<slug> --from 40 --to 52`; antes do render, QA do vídeo inteiro.

Mudou só efeito sonoro? `mix.py` + `build.py` bastam (o QA continua valendo).

## 10. Render, capa, legenda e entrega

Antes do `finalize`, completar `video.json → post`:

```json
"post": { "title": "APERTARAM O\nBOTÃO DO PÂNICO", "descricao": "Circuit breaker na B3: quando o Ibovespa cai 10%, a bolsa para por 30 minutos. Entenda por que existe o botão do pânico e quantas vezes ele já foi apertado.", "hashtags": ["#circuitbreaker", "#bolsadevalores", "#ibovespa", "#b3", "#investimentos"] }
```

- A legenda é sempre para o **TikTok**.
- `descricao` (obrigatório): 1–2 frases logo abaixo do gancho, com as palavras que alguém digitaria na busca do TikTok (o tema pelo nome, os números e os termos da fala). Só fatos que estão na fala, com as mesmas ressalvas ("falta o Senado confirmar", "é estimativa"); em tema político, neutro.
- `hashtags` (obrigatório): 3–5 do tema, que alguém buscaria, a mais importante primeiro (se tiver mais, só as 5 primeiras entram); em tema político, só nomes e assuntos (nada de hashtag de torcida).
- `title` (opcional): título da capa, 2–5 palavras curtas, que repete a tensão do gancho. A letra precisa ser grande para ler na grade do perfil (pedido do Samuel, 02/11/2026): o `capa.cjs` quebra o título em até 4 linhas, escolhe a quebra de letra maior (`\n` força uma quebra) e reprova abaixo de 130 px; nesse caso, encurtar. Sem ele, vale o título que aparece no gancho (ou o primeiro título do vídeo).
- `t` (opcional): segundo do quadro da capa; `media` (opcional): id da foto de pessoa, ou `false` para capa sem foto.

```bash
bash tools/render.sh videos/<slug>            # nuvem: bash tools/render.sh videos/<slug> looks --detach  (~36 min)
python3 tools/finalize.py videos/<slug>       # MP4 (confere tamanho, duração e volume) + capa + legenda do post
```

- `out/<slug>-capa.jpg` (1080×1920): um quadro do gancho, sem a legenda do vídeo, com o título grande (até 1000 × 600 px, até 4 linhas, 130–220 px) e, logo abaixo, os objetos do gancho (a câmera mantém o ângulo) ou o elemento do palco no 2D. **Título + elemento formam um bloco centralizado na largura e na altura da capa** (pedido do Samuel, 04/11/2026; `cover.block`): o `capa.cjs` reprova se o bloco sair mais de 40 px do meio. Se o vídeo tem cartão de pessoa (overlay `photo` com `name`), a foto entra na capa num cartão com nome e crédito. O título precisa caber no recorte 3:4 do perfil (o `capa.cjs` reprova se não couber).
- `out/<slug>-post.md`: legenda pronta para o TikTok — gancho, `descricao`, pergunta final, o CTA do vídeo, avisos da tela ("Não é recomendação de investimento."), as hashtags, **Fontes** pelo nome (só as linhas do `fatos.md` que entraram na fala: status `OK` sem "fora da fala") e **Fotos** (crédito). No TikTok link não é clicável e comentário vai até 150 caracteres: os links das fontes e fotos ficam abaixo da legenda, no arquivo, para conferir e responder comentários.
- **Olhar a capa** (Read) antes de entregar: bloco título + elemento no meio da capa (mesmo espaço em cima e embaixo), título grande e legível mesmo em miniatura, objeto inteiro, quadro que conta o gancho sem som. Não gostou? Ajustar `post.title`/`post.t`/`post.descricao` e refazer só capa e legenda: `python3 tools/finalize.py videos/<slug> --post-only`.
- Mac: o `finalize` copia MP4, capa e post para `~/Movies/reels`; enviar também os três no chat com SendUserFile, para o Samuel ver por ali.
- Nuvem: enviar os três com SendUserFile e, se o computador estiver ligado ao chat, gravar em `~/Movies/reels` (limite de 30 MB por arquivo: recomprimir o MP4 com `ffmpeg -c:v libx264 -crf 23 -preset veryfast -c:a copy` se passar).

## 11. Guardar no kit

Commitar a pasta do vídeo (brief, fatos, roteiro, narracao, video.json, scenes.js, words.json — o resto é ignorado pelo git, inclusive `midia/` e `out/`: o link e o crédito de cada foto e o título e as hashtags do post ficam no `video.json`) e qualquer objeto novo em `engine/props/`; push.

## 12. Feedback e melhoria da skill — sempre, depois de entregar

Logo depois de mandar MP4, capa e post, perguntar numa mensagem curta (e esperar):

> **O que você gostou e o que não gostou neste vídeo?** Pode ser qualquer coisa: hook, roteiro, voz, ritmo, visual, câmera, fotos, legenda, capa, post.

Com a resposta:

1. **Separar** cada ponto em: *gostou* (manter) e *não gostou* (mudar). Se um ponto estiver vago ("ficou estranho"), perguntar uma vez onde (segundo do vídeo ou plano) antes de mexer.
2. **Generalizar**: transformar cada ponto numa regra que vale para os próximos vídeos, não só para este ("a câmera girou rápido demais aos 32 s" → "órbita no máximo 30° por plano"). Ponto que só vale para este tema fica só no registro.
3. **Escrever a regra no lugar onde ela é lida**, integrada ao texto que já existe (ajustar a regra antiga em vez de empilhar outra parecida; se a nova contradiz uma antiga, a nova vale e a antiga sai):
   - roteiro, hook, pergunta, tom, analogia → `docs/roteiro.md` (Explicando Direito: `docs/explicando-direito/roteiro.md`)
   - visual, câmera, fundo, objetos, cores → `docs/visual.md` (e `engine/` se der para virar padrão no código; Explicando Direito: `docs/explicando-direito/visual.md` e `engine2d/`)
   - fotos → `docs/fotos.md`; voz, áudio, música → `channel.yaml` e `tools/mix.py`
   - capa, legenda, hashtags, post → etapa 10 desta skill e `tools/finalize.py`
   - etapas e ordem do trabalho → esta `SKILL.md`; erro que o QA devia ter pegado → `tools/qa.cjs` + um caso em `tests/qa-pega-erros/`
   - O que ele **gostou** também vira regra ("manter: ..."), para não se perder numa mudança futura.
4. **Registrar** em `docs/feedback.md` (formato lá): o que ele disse e o que mudou em qual arquivo.
5. **Testar** se mexeu em `engine/` ou `tools/`: `bash tools/selftest.sh` e QA deste vídeo.
6. **Commitar e enviar sem pedir licença** (o Samuel já autorizou): `git pull --rebase` e `git push` no `main`, mensagem "Feedback <slug>: ...". Assim a próxima sessão já começa com a melhoria.
7. **Este vídeo**: perguntar se ele quer o vídeo refeito com as mudanças ou se fica como está. Só refazer se ele pedir.
8. Responder em poucas linhas: o que mudou e onde, e o que **não** mudou e por quê.

Não vira regra (explicar ao Samuel em vez de aplicar): pedido que quebra uma das "Regras que não se quebram" abaixo (crédito de foto, imagem de IA de pessoa real, fato sem fonte, tomar lado em política). Nesse caso, propor um jeito de chegar no que ele quer sem quebrar a regra.

## Estilo Explicando Direito

Quando o estilo é `explicando-direito`, o fluxo é o mesmo (pesquisa, opções, aprovação, voz, QA, revisão cega, render, entrega, feedback), com estas trocas. Regras: `docs/explicando-direito/roteiro.md` e `docs/explicando-direito/visual.md`; modelo: `videos/exemplo-explicando-direito/`.

- **Etapa 1**: além do rosto de cada pessoa citada (vira polaroid), anotar no `fatos.md` o número de cada lei, artigo, decisão ou processo que entra na fala: ele vai para a tela num documento ou cartão.
- **Etapa 2**: o ângulo é a notícia + a virada ("o discurso oficial é X, porém o motivo é Y", ou o número que surpreende) + o instituto jurídico explicado numa frase. Sem analogia, sem "imagina".
- **Etapa 3**: 5 hooks dos tipos do `docs/explicando-direito/roteiro.md` (notícia direta, número, afirmação que o vídeo prova, contradição, consequência) + "Outro"; as **3 perguntas são para a legenda do post** (o vídeo termina seco) + "Outra".
- **Etapa 4**: 180–230 palavras (55–75 s a 3,2 palavras/s), 3ª pessoa. Tabela **# · narração · texto na tela · visual**: o texto na tela é a própria fala em blocos de 5–9 palavras com a linha grande (`#`) e a palavra-chave (`[ ]`); o visual diz o elemento e em que trecho da fala ele entra.
- **Etapa 5**: `brief.yaml` com `estilo: explicando-direito`.
- **Etapa 6**: a voz é a mesma. **Trilha-assinatura**: se `assets/trilhas/explicando-direito.mp3` ainda não existe no kit, ela é feita uma vez só, no primeiro vídeo do estilo, depois do roteiro aprovado e com o ok do Samuel para o gasto (ElevenLabs Music, ~1.000 créditos por versão de 75 s): `creative_add_flow_node` (`node_type` `music`, `model_id` `eleven_music_v2_5`, `model_parameters` `{duration_seconds: 75, instrumental: true, lyrics_type: "instrumental"}`), prompt: *"Dark, tense instrumental bed for a fast political news explainer. Minimal trap beat, half-time feel around 77 BPM (154 double-time hi-hats), heavy sub-bass and 808, sparse ticking hi-hats, low muted synth pulse, no melody in the vocal range, no drops, no intro: full energy from the first second to the last, constant level, seamless loop."*; `estimate_only` antes, 2 versões, escolher a de energia constante desde 0 s (RMS por 0,25 s), salvar em `assets/trilhas/explicando-direito.mp3` e commitar. Daí em diante todo vídeo do estilo usa a mesma.
- **Etapa 7**: `python3 tools/tighten.py <take> videos/<slug>/audio/narration.wav --target <s> --gap 0.06 --sentence-gap 0.14 --max-tempo 1.12`; conferir 3,0–3,3 palavras/s em `words.json`.
- **Etapa 8**: sem `scenes.js`. O `video.json` tem `estilo`, `duration` (fim da última palavra + 0,3 s), `audio` (voz + trilha: `docs/explicando-direito/visual.md` → "Áudio"), `media`, `icone`, `texto` (os blocos aprovados), `visuais` (com `"em": "trecho da fala"`), `sfx` e `post`. O `tools/build.py` imprime avisos de ritmo (visual parado > 4,5 s, bloco > 4 s, gancho sem impacto) e o `sfx_sugerido`: copiar para `sfx`, `tools/mix.py`, build de novo.
- **Etapa 9**: mesmos comandos; o QA é o do 2D (`tools/qa_direito.cjs`). A revisão cega usa as mesmas folhas (`preview/objetos-NN.jpg` = cada elemento do palco recortado).
- **Etapa 10**: igual. `post.title` aceita `[palavra]` para a caixa mostarda da capa. A legenda do post leva a pergunta escolhida na etapa 3; se o Samuel pediu "sem pergunta final", o `brief.yaml` fica sem `pergunta_final` e a legenda sai sem pergunta e sem CTA (`tools/post.py`).
- **Etapa 12**: feedback deste estilo vai para `docs/explicando-direito/*.md`, `channel.yaml → estilos.explicando-direito` e `engine2d/`; o que valer para os dois estilos, nos docs comuns.

## Variante sem narração (só música)

Quando o Samuel pede um vídeo **sem narração** (ex.: "só música de fundo e o gráfico evoluindo"), o fluxo é o mesmo, com estas trocas (primeiro: `videos/2026-11-01-historia-divida-publica/`):

- **Etapa 3**: os 5 hooks e as 3 perguntas viram **texto na tela** (curtos, lidos em 3 s). Junto vai o **storyboard** (# · tempo · visual e câmera · texto na tela) no lugar do roteiro; a escolha + "ok" é a aprovação da etapa 5. O gancho não pode entregar a resposta que ele pergunta (ex.: "em que ano?" → nada de ano no gancho).
- **Etapa 6 → trilha**: ElevenLabs Music pelo conector, só depois do ok (cobra créditos, ~900 por 60 s): `creative_add_flow_node` (`node_type` `music`, `model_id` `eleven_music_v2_5`, `model_parameters` `{duration_seconds, instrumental: true, lyrics_type: "instrumental"}`, prompt descrevendo o som e a energia por trecho, com os segundos), `creative_run_flow_nodes` com `estimate_only` antes e depois 2 versões; baixar para `audio/takes/`. Escolher pela curva de energia e pelas batidas (`ffmpeg` + numpy: RMS por 0,25 s e picos de fluxo espectral): versão com silêncio no começo sai. A escolhida vira `audio/music.mp3`. Música gerada não cai em bloqueio de direitos autorais no TikTok.
- **Etapa 7**: não existe. Os tempos do vídeo seguem as **batidas da música** (cortes, marcos, revelação nas batidas fortes; a pausa da música é a hora da virada).
- **Etapa 8**: `video.json → audio` = `{ "music": "audio/music.mp3", "music_db": 0, "music_fade": 2 }`, sem `narration` nem `words` (sem legenda). Dado que muda com o tempo (ano, valor) vai num overlay `counter` na `headline` (`docs/visual.md` → Texto). Dados e tempos do 3D e do contador saem do **mesmo** gerador, para não descolarem.
- **Etapa 9**: `tools/mix.py` mistura música + efeitos e normaliza (−14 LUFS). O resto (QA, prévia, revisão cega, render, capa, post) é igual. No `fatos.md`, fato confirmado que não aparece na tela leva `OK — fora da tela`.

## Regras que não se quebram

1. Nada de voz antes do roteiro aprovado.
2. Nada de render sem `QA ok` (o `render.sh` bloqueia).
3. Texto nunca em cima da animação principal (o plano de fundo pode ficar por baixo); fonte sempre no canto superior direito; legenda na base da área segura, que é centralizada na tela (no Explicando Direito o texto cinético no alto é a legenda).
4. Nenhum objeto principal cortado; nada atravessando nada.
5. Todo número com fonte em `fatos.md`; tema político contado sem tomar lado; "Não é recomendação de investimento" em tema de dinheiro.
6. Analogia só no ponto difícil — uma boa vale mais que cinco.
7. Foto real sempre com crédito na tela; nunca imagem de IA ou editada de pessoa ou fato real.
8. Nada parado por 2 s; nada de render sem revisão cega.
9. (v1) Visual realista e polido: animação principal na área segura, plano de fundo de tela inteira contextualizando o take.
10. (v1) Dinâmica: cada plano com movimento de câmera de intenção, sem repetir o anterior; fundo reagindo às batidas da fala.
11. (v1) Ilustração que se lê sem som: título nunca sobre fundo claro, texto impresso de pé, nada flutuando nem atravessando.
12. O estilo é escolhido pelo Samuel no começo de cada vídeo; nunca misturar dois estilos no mesmo vídeo. (Explicando Direito) Visual novo a cada ~2 s e impacto no gancho.

## Fechamento

Responder curto: os arquivos (MP4, capa e post, com uma linha de contexto), onde ficaram salvos e, em seguida, a pergunta de feedback da etapa 12. Sem recapitular as etapas. A sessão só termina depois do feedback aplicado e enviado ao GitHub (ou de o Samuel dizer que não tem nada a comentar).
