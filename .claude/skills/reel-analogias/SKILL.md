---
name: reel-analogias
description: Cria um Reel/TikTok/Short 3D narrado do @analogias.br a partir de um tema — fatos checados, 5 hooks, 3 perguntas finais, roteiro aprovado, voz ElevenLabs, cenas 3D com fotos reais creditadas, QA automático + revisão cega, MP4, capa e legenda do post.
---

# Reel 3D narrado — @analogias.br

Produz um vídeo vertical de ~90 s no estilo do canal: narração (voz Sandro Dutra), cenas 3D com fotos reais onde elas ajudam a entender, legendas palavra a palavra, textos e fontes dentro da área segura. Tudo roda no kit **analogias-studio** (GitHub `samuel-vieira-dev/analogias-studio`); os detalhes de cada etapa estão nos `docs/` do kit.

## Entrada

Só duas coisas vêm do Samuel no pedido:

- **Tema do vídeo** (obrigatório)
- **Referências visuais** (opcional: links, prints, arquivos)

Ele escolhe depois, na etapa 3: o **hook** (5 opções + "Outro") e a **pergunta final** (3 opções + "Outra"). Área segura, estilo, voz, legendas e regras de roteiro **não são perguntados**: são requisitos do kit (`config/layout.json`, `channel.yaml`, `docs/`).

## 0. Preparar o kit

- **No Mac (Claude Code local)**: `cd` para o clone do kit (ex.: `~/analogias-studio`); `git pull`. Se não existir: `git clone https://github.com/samuel-vieira-dev/analogias-studio.git`.
- **Sessão na nuvem**: anexar o repositório (`add_repo`, owner `samuel-vieira-dev`, repo `analogias-studio`, acesso `push`) e clonar como a ferramenta indicar.
- Primeira vez na máquina: `bash tools/setup.sh` (instala dependências e roda o autoteste do QA).
- Ler `CLAUDE.md`, `docs/roteiro.md`, `docs/visual.md`, `docs/fotos.md` e `docs/qa.md` do kit. Criar a lista de tarefas com as etapas abaixo.
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

## 6. Narração (ElevenLabs)

`creative_generate_speech` com `prompt` = `narracao.txt`, `voice_id` `qPfM2laM0pRL4rrZtBGl`, `model_id` `eleven_v4`, takes padrão (2). Acompanhar com `creative_get_flow_run_status` até terminar e baixar os dois takes para `audio/takes/`. Nunca chamar de novo para "tentar outra vez" (cobra de novo); se falhar, avisar o Samuel.

## 7. Take, ritmo e tempos

```bash
python3 tools/transcribe.py videos/<slug>/audio/takes/*.mp3 --ref videos/<slug>/narracao.txt   # nota de cada take → ESCOLHIDO
python3 tools/tighten.py <take escolhido> videos/<slug>/audio/narration.wav --target 88
python3 tools/transcribe.py videos/<slug>/audio/narration.wav --out videos/<slug>/audio/words.json --ref videos/<slug>/narracao.txt
```

Se o take escolhido trocou ou pulou palavras importantes, avisar antes de seguir.

## 8. Cenas

Escrever `video.json` (duração = fala + 2 s; `cuts`; `overlays` por **zona**, nunca por pixel; `sfx`; `captions.fix`) e `scenes.js` usando `engine/` (ver `docs/visual.md` e o exemplo `videos/2026-10-27-circuit-breaker/`). Regras:

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
- `title` (opcional): título da capa, 2–4 palavras em até 2 linhas (`\n`), que repete a tensão do gancho. Sem ele, vale o título que aparece no gancho (ou o primeiro título do vídeo).
- `t` (opcional): segundo do quadro da capa; `media` (opcional): id da foto de pessoa, ou `false` para capa sem foto.

```bash
bash tools/render.sh videos/<slug>            # nuvem: bash tools/render.sh videos/<slug> looks --detach  (~36 min)
python3 tools/finalize.py videos/<slug>       # MP4 (confere tamanho, duração e volume) + capa + legenda do post
```

- `out/<slug>-capa.jpg` (1080×1920): um quadro do gancho, sem a legenda do vídeo, com o título na faixa `headline`; a câmera mantém o ângulo e enquadra os objetos do gancho no palco abaixo do título. Se o vídeo tem cartão de pessoa (overlay `photo` com `name`), a foto entra na capa num cartão com nome e crédito. O título precisa caber no recorte 3:4 do perfil (o `capa.cjs` reprova se não couber).
- `out/<slug>-post.md`: legenda pronta para o TikTok — gancho, `descricao`, pergunta final, o CTA do vídeo, avisos da tela ("Não é recomendação de investimento."), as hashtags, **Fontes** pelo nome (só as linhas do `fatos.md` que entraram na fala: status `OK` sem "fora da fala") e **Fotos** (crédito). No TikTok link não é clicável e comentário vai até 150 caracteres: os links das fontes e fotos ficam abaixo da legenda, no arquivo, para conferir e responder comentários.
- **Olhar a capa** (Read) antes de entregar: título legível, objeto inteiro, quadro que conta o gancho sem som. Não gostou? Ajustar `post.title`/`post.t`/`post.descricao` e refazer só capa e legenda: `python3 tools/finalize.py videos/<slug> --post-only`.
- Mac: o `finalize` copia MP4, capa e post para `~/Movies/reels`; enviar também os três no chat com SendUserFile, para o Samuel ver por ali.
- Nuvem: enviar os três com SendUserFile e, se o computador estiver ligado ao chat, gravar em `~/Movies/reels` (limite de 30 MB por arquivo: recomprimir o MP4 com `ffmpeg -c:v libx264 -crf 23 -preset veryfast -c:a copy` se passar).

## 11. Guardar no kit

Commitar a pasta do vídeo (brief, fatos, roteiro, narracao, video.json, scenes.js, words.json — o resto é ignorado pelo git, inclusive `midia/` e `out/`: o link e o crédito de cada foto e o título e as hashtags do post ficam no `video.json`) e qualquer objeto novo em `engine/props/`; push.

## Regras que não se quebram

1. Nada de voz antes do roteiro aprovado.
2. Nada de render sem `QA ok` (o `render.sh` bloqueia).
3. Texto nunca em cima da animação principal (o plano de fundo pode ficar por baixo); fonte sempre no canto superior direito; legenda na base da área segura, que é centralizada na tela.
4. Nenhum objeto principal cortado; nada atravessando nada.
5. Todo número com fonte em `fatos.md`; tema político contado sem tomar lado; "Não é recomendação de investimento" em tema de dinheiro.
6. Analogia só no ponto difícil — uma boa vale mais que cinco.
7. Foto real sempre com crédito na tela; nunca imagem de IA ou editada de pessoa ou fato real.
8. Nada parado por 2 s; nada de render sem revisão cega.
9. Visual realista e polido: animação principal na área segura, plano de fundo de tela inteira contextualizando o take.
10. Dinâmica: cada plano com movimento de câmera de intenção, sem repetir o anterior; fundo reagindo às batidas da fala.
11. Ilustração que se lê sem som: título nunca sobre fundo claro, texto impresso de pé, nada flutuando nem atravessando.

## Fechamento

Responder curto: os arquivos (MP4, capa e post, com uma linha de contexto), onde ficaram salvos, e um próximo passo se houver. Sem recapitular as etapas.
