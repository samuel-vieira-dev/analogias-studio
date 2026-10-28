# Ferramentas, conectores e onde cada etapa roda

## Pipeline

| # | Etapa | Ferramenta | Saída |
| --- | --- | --- | --- |
| 1 | Pesquisa e checagem | busca na web (WebSearch/WebFetch) | `fatos.md` |
| 2 | Hooks, pergunta, roteiro, aprovação | Claude + `docs/roteiro.md` | `brief.yaml`, `roteiro.md`, `narracao.txt` |
| 3 | Narração | conector **ElevenLabs** | `audio/takes/*.mp3` |
| 4 | Escolha do take | `tools/transcribe.py` (faster-whisper, local) | take escolhido |
| 5 | Aperto de pausas e ritmo | `tools/tighten.py` | `audio/narration.wav` |
| 6 | Tempo de cada palavra | `tools/transcribe.py --out` | `audio/words.json` |
| 7 | Fotos e cenas | `midia/` + `video.json → media` ([`fotos.md`](fotos.md)), `scenes.js` + `video.json` (engine Three.js) | — |
| 8 | Projeto HyperFrames | `tools/build.py` | `build/`, `qa/harness.html` |
| 9 | QA + prévia + revisão cega | `tools/qa.cjs`, `tools/preview.cjs` (Playwright), subagente revisor | `qa/report.json`, `preview/sheet-NN.jpg`, `preview/objetos-NN.jpg` + `objetos.json` |
| 10 | Mixagem | `tools/mix.py` (ffmpeg) | `audio/mix.wav` (−14 LUFS) |
| 11 | Render | `tools/render.sh` (HyperFrames 0.8.206) | `out/render.mp4` |
| 12 | Arquivo final e post | `tools/finalize.py` (+ `tools/post.py`, `tools/capa.cjs`) | `out/<slug>.mp4`, `out/<slug>-capa.jpg`, `out/<slug>-post.md` → Filmes/reels |

## ElevenLabs (conector do claude.ai)

- Voz: **Sandro Dutra** — `qPfM2laM0pRL4rrZtBGl` · modelo `eleven_v4` (definidos em `channel.yaml`).
- Chamada: `creative_generate_speech` com `prompt` = conteúdo de `narracao.txt`, `voice_id`, `model_id`, `generations_count` padrão (2 takes). Depois, `creative_get_flow_run_status` com o `flow_id` e os `session_ids` até `all_completed`; baixar o áudio de cada take para `audio/takes/`.
- Custo: ~1.400 créditos por take de 90 s (≈2.800 pelos dois). `estimate_only: true` mostra o preço antes.
- **Nunca** repetir a chamada para "tentar de novo": cada chamada cobra outra geração.
- **Nunca** gerar antes do roteiro aprovado.

## Áudio local (grátis)

- `tools/transcribe.py`: faster-whisper `medium` (int8, CPU). Com `--ref narracao.txt` dá a nota de cada take (0–1) e as palavras que mudaram; escolhe o melhor.
- `tools/tighten.py`: corta pausas longas (mantém 0,22 s entre frases curtas e 0,36 s nas pausas longas) e acelera até ×1,06 se precisar caber no alvo (duração − 2 s de cauda).
- `tools/mix.py`: voz + efeitos do pacote do HyperFrames (`whoosh`, `impact-bass`, `pop`, `click`, `riser`, `ping`…) nos tempos do `video.json`; normaliza em duas passadas para −14 LUFS e pico −1,5 dBTP (padrão de Reels/TikTok/Shorts). Sem música: a trilha entra no app, na hora de postar.

## HyperFrames e 3D

- HyperFrames 0.8.206 (fixado). O 3D é Three.js r184 (CDN jsDelivr) desenhado quadro a quadro a partir do tempo: render determinístico.
- `tools/build.py` gera o projeto (`build/index.html` + `compositions/world|overlays|captions.html`). Não edite `build/`: edite `scenes.js`, `video.json` ou `engine/`.
- Preview interativo: `cd videos/<slug>/build && npx hyperframes preview` (abre o Studio/app do HyperFrames).

## Post: capa e legenda (local, grátis)

O `finalize.py` entrega o MP4 e chama `tools/post.py`, que escreve a legenda e roda `tools/capa.cjs`. Os três vão juntos para Filmes/reels. Para refazer só capa e legenda (sem render, sem tocar no MP4): `python3 tools/finalize.py videos/<slug> --post-only` (ou `python3 tools/post.py videos/<slug>`, que não copia).

Entrada em `video.json → post`: `hashtags` (5–8 do tema, obrigatório), `title` (título da capa, `\n` para 2 linhas), `t` (segundo do quadro) e `media` (id da foto de pessoa, ou `false`); só `hashtags` é obrigatório.

**Capa** — `out/<slug>-capa.jpg`, 1080×1920, tirada do `qa/harness.html` com Playwright (o mesmo da prévia, sem renderizar o vídeo):

- Quadro: dentro da primeira cena (o gancho), o trecho com mais objetos registrados (`S.hero`) na tela no maior tamanho; o meio dele. `post.t` escolhe outro.
- Título: `post.title`; sem ele, o título que aparece no gancho, senão o primeiro `title` do vídeo. Inter 900 laranja, o maior que couber na zona `headline` (até 2 linhas).
- 3D: sem os textos e a legenda do vídeo; a câmera mantém o ângulo do plano e enquadra os objetos no palco da capa abaixo do título (`config/layout.json → cover.stage`, y 580–1500; `window.__qa.reframe` no `engine/core.js`). Gancho filmado em `stage-tall` não fica atrás do título, e objeto pequeno cresce.
- Foto: se o vídeo tem cartão de pessoa (overlay `photo` com `name`) ou `post.media`, a foto entra num cartão com nome, cargo e "Foto: crédito"; o 3D fica desfocado atrás. Recorte e zoom só, como no vídeo ([`fotos.md`](fotos.md)).
- Confere que título e cartão cabem no recorte central 3:4 (1080×1440, `cover.grid`) que o perfil mostra; senão sai com erro.
- Harness gerado antes da capa existir não tem `__qa.reframe` (o `capa.cjs` avisa): rodar `python3 tools/build.py videos/<slug>` uma vez.

**Legenda** — `out/<slug>-post.md`, um bloco pronto para colar:

1. Gancho e pergunta final (`brief.yaml`) e o CTA do vídeo ("Comenta: VENDO ou COMPRO.").
2. Avisos que estão na tela e não são fonte ("Não é recomendação de investimento.").
3. As hashtags.
4. **Fontes**: os links das linhas do `fatos.md` com status `OK` que não dizem "fora da fala" — marque assim o fato confirmado que ficou fora da narração. Fonte citada sem link numa linha ("InfoMoney · CUT") pega o link que ela tem em outra linha.
5. **Fotos**: crédito e link de cada foto de `video.json → media`.

O Instagram corta a legenda em 2.200 caracteres: se a lista com links não couber, a legenda cita as fontes pelo nome e o arquivo traz os links em um ou mais comentários para fixar (cada um até 2.200). Links não são clicáveis em Reels e TikTok; no YouTube Shorts, use a lista com links na descrição.

## Onde rodar

| | Mac (Claude Code no terminal do Mac) | Sessão na nuvem (claude.ai) |
| --- | --- | --- |
| Render de 90 s em 3D | GPU de verdade + captura rápida + 8 workers: estimativa de 3–8 min num MacBook Air M5 (o Air não tem ventoinha e pode desacelerar; medir com `npx hyperframes benchmark`) | 2 CPUs com WebGL por software: **36 min** medidos no circuit breaker V2 (2.760 quadros) |
| QA (460 quadros) | ~1 min | ~3–4 min |
| Arquivos | direto em `~/Movies/reels` | entrega pelo app no Mac (ponte do computador); arquivos acima de 30 MB são recomprimidos para passar |
| Quando usar | produção do dia a dia | quando estiver só no celular |

A ponte com o Mac pelo app (shell do Mac) roda numa máquina virtual Linux sem GPU: para ganhar a velocidade do Mac, o render precisa rodar **nativo** no Mac (Claude Code local ou terminal).

Setup único em qualquer máquina: `bash tools/setup.sh` (Python: faster-whisper, numpy, soundfile, pyyaml · Node: hyperframes, playwright · confere o QA com o autoteste).
