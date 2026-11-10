# Ferramentas, conectores e onde cada etapa roda

## Pipeline

| # | Etapa | Ferramenta | Saída |
| --- | --- | --- | --- |
| 1 | Pesquisa e checagem | busca na web (WebSearch/WebFetch) | `fatos.md` |
| 2 | Hooks, pergunta, roteiro, aprovação | Claude + `docs/roteiro.md` | `brief.yaml`, `roteiro.md`, `narracao.txt` |
| 3 | Narração (ou trilha, no vídeo sem narração) | **VoiceStudio** local (voz, `tools/voice.py`); conector ElevenLabs Music (trilha) | `audio/takes/take-N.wav` (`audio/music.mp3`) |
| 4 | Escolha do take | `tools/transcribe.py` (faster-whisper, local) | take escolhido |
| 5 | Aperto de pausas e ritmo | `tools/tighten.py` | `audio/narration.wav` |
| 6 | Tempo de cada palavra | `tools/transcribe.py --out` | `audio/words.json` |
| 7 | Fotos e cenas | `midia/` + `video.json → media` ([`fotos.md`](fotos.md)), `scenes.js` + `video.json` (engine Three.js); no Explicando Direito, só `video.json → texto/visuais` (`engine2d/`) | — |
| 8 | Projeto HyperFrames | `tools/build.py` (2D: `tools/build_direito.py`, chamado por ele) | `build/`, `qa/harness.html` |
| 9 | QA + prévia + revisão cega | `tools/qa.cjs`, `tools/preview.cjs` (Playwright), subagente revisor | `qa/report.json`, `preview/sheet-NN.jpg`, `preview/objetos-NN.jpg` + `objetos.json` |
| 10 | Mixagem | `tools/mix.py` (ffmpeg) | `audio/mix.wav` (−14 LUFS) |
| 11 | Render | `tools/render.sh` (HyperFrames 0.8.206) | `out/render.mp4` |
| 12 | Arquivo final e post | `tools/finalize.py` (+ `tools/post.py`, `tools/capa.cjs`) | `out/<slug>.mp4`, `out/<slug>-capa.jpg`, `out/<slug>-post.md` → Filmes/reels |

## Voz: VoiceStudio (app local, grátis)

- Voz: **Narrador Analogias** — perfil `9353e363` do VoiceStudio (motor OmniVoice, clone da voz do Ivan Lima, enviada por ele), desde 10/11/2026. Configuração em `channel.yaml → voz`.
- Chamada: `python3 tools/voice.py videos/<slug>` com o app aberto (API em `http://127.0.0.1:3900`, `POST /generate` com `profile_id` e `seed`). Um take por seed, texto cortado em frases (`max_chunk_chars` 400) para não pular trecho. Saída: `audio/takes/take-N.wav`.
- Custo: nenhum (roda no Mac, GPU Apple). Pode gerar de novo à vontade. Leva ~3 min por take de 100 s; a fala sai a ~2,35 palavras/s antes do `tighten.py` (roteiro de 90 s: ~215 palavras, `docs/roteiro.md`). `--speed` acima de 1,0 cabe mais texto, mas a voz pula e troca frases: não usar.
- Referência do perfil: até 20 s (o OmniVoice usa no máximo 20 s), começando e terminando em frase inteira, com o texto exato. Com o corte de 30 s que terminava no meio da frase ("…por trás da perfuração"), essa palavra vazava no começo de cada bloco ("pração", 10/11/2026). Hoje: 18,4 s, de "Uma equipe perfura…" a "…tão dura que quebra."; o original está em `~/Documents/Analogias/teste-vozes/narrador-analogias-referencia-original-30s.mp3`.
- **Nunca** gerar antes do roteiro aprovado.
- Voz anterior: Sandro Dutra no ElevenLabs (`channel.yaml → voz.elevenlabs`; conector `creative_generate_speech`, ~1.400 créditos por take de 90 s). Só se o Samuel pedir.

## Áudio local (grátis)

- `tools/transcribe.py`: faster-whisper `medium` (int8, CPU). Com `--ref narracao.txt` dá a nota de cada take (0–1) e as palavras que mudaram; escolhe o melhor. A dica de reconhecimento é só uma lista de nomes (`--prompt "Ibovespa, B3"`; sem ele, os nomes próprios do `--ref`). Nunca o começo do roteiro: o Whisper copia e repete a frase, e um take bom sai com nota 0,45 (vídeo do dólar, 02/11/2026).
- `tools/tighten.py`: corta pausas longas (mantém 0,22 s entre frases curtas e 0,36 s nas pausas longas) e acelera até ×1,06 se precisar caber no alvo (duração − 2 s de cauda).
- `tools/mix.py`: voz + efeitos do pacote do HyperFrames (`whoosh`, `impact-bass`, `pop`, `click`, `riser`, `ping`…) nos tempos do `video.json`; normaliza em duas passadas para −14 LUFS e pico −1,5 dBTP (padrão de Reels/TikTok/Shorts). Vídeo narrado: sem música (a trilha entra no app, na hora de postar). Vídeo sem narração: `audio.music` (trilha do ElevenLabs Music, `music_db`, `music_fade`) no lugar da voz; sem `audio.words`, o `build.py` não faz legenda (SKILL.md → Variante sem narração).

## HyperFrames e 3D

- HyperFrames 0.8.206 (fixado). O 3D é Three.js r184 (CDN jsDelivr) desenhado quadro a quadro a partir do tempo: render determinístico.
- `tools/build.py` gera o projeto (`build/index.html` + `compositions/world|overlays|captions.html`). Não edite `build/`: edite `scenes.js`, `video.json` ou `engine/`.
- Preview interativo: `cd videos/<slug>/build && npx hyperframes preview` (abre o Studio/app do HyperFrames).

## Post: capa e legenda (local, grátis)

O `finalize.py` entrega o MP4 e chama `tools/post.py`, que escreve a legenda e roda `tools/capa.cjs`. Os três vão juntos para Filmes/reels. Para refazer só capa e legenda (sem render, sem tocar no MP4): `python3 tools/finalize.py videos/<slug> --post-only` (ou `python3 tools/post.py videos/<slug>`, que não copia).

Entrada em `video.json → post`: `hashtags` (3–5 do tema, obrigatório; se tiver mais, só as 5 primeiras entram), `descricao` (1–2 frases para a busca do TikTok, obrigatório), `title` (título da capa; `\n` força uma quebra de linha), `t` (segundo do quadro) e `media` (id da foto de pessoa, ou `false`).

**Capa** — `out/<slug>-capa.jpg`, 1080×1920, tirada do `qa/harness.html` com Playwright (o mesmo da prévia, sem renderizar o vídeo):

- Quadro: dentro da primeira cena (o gancho), o trecho com mais objetos registrados (`S.hero`) na tela no maior tamanho; o meio dele. `post.t` escolhe outro.
- Título: `post.title`; sem ele, o título que aparece no gancho, senão o primeiro `title` do vídeo. Inter 900 laranja, **grande para ler na grade do perfil** (pedido do Samuel, 02/11/2026): até 1000 × 600 px (`config/layout.json → cover.title`, x 40–1040). Cada linha do `post.title` pode quebrar de novo nos espaços, até 4 linhas no total; fica a quebra com a maior letra (até 220 px; entre as que ficam a 5% dela, a de menos linhas e mais equilibrada). Abaixo de 130 px (`min_font_px`) o `capa.cjs` sai com erro: encurtar o `post.title`.
- **Centralizado na largura e na altura**: título e elemento (o 3D, ou o cartão da foto) formam **um bloco** no meio da capa (pedidos do Samuel: largura, 30/10/2026; altura, 04/11/2026). Na largura, `cover.title` x 40–1040 e `cover.stage` x 125–955 (a capa não tem os botões do app); se o 3D sair mais de 30 px do centro, o `capa.cjs` sai com erro. Na altura, o elemento fica `cover.block.gap` (40 px) abaixo do título e o centro do bloco fica em `cover.block.center_y` (960, o meio da tela e do recorte do perfil), nunca acima de `block.min_top` (300); se o bloco sair mais de `block.tol_px` (40 px) do centro, sai com erro: encurte o `post.title` ou escolha outro `post.t`. Nada de título colado no alto e foto até o pé da capa.
- 3D: sem os textos e a legenda do vídeo; a câmera mantém o ângulo do plano e enquadra os objetos logo abaixo do título, no máximo 830 × 680 px (`config/layout.json → cover.stage`; `window.__qa.reframe` no `engine/core.js`): enquadra uma vez para medir a altura dos objetos e de novo já na posição do bloco. Gancho filmado em `stage-tall` não fica atrás do título, e objeto pequeno cresce.
- Foto: se o vídeo tem cartão de pessoa (overlay `photo` com `name`) ou `post.media`, a foto entra num cartão com nome, cargo e "Foto: crédito"; o 3D fica desfocado atrás. Recorte e zoom só, como no vídeo ([`fotos.md`](fotos.md)).
- Confere que título e cartão cabem no recorte central 3:4 (1080×1440, `cover.grid`) que o perfil mostra; senão sai com erro.
- Harness gerado antes da capa existir não tem `__qa.reframe` (o `capa.cjs` avisa): rodar `python3 tools/build.py videos/<slug>` uma vez.

**Legenda** — `out/<slug>-post.md`, sempre escrita para o **TikTok**, um bloco pronto para colar:

1. O gancho (`brief.yaml`) e, logo abaixo, `post.descricao`: 1–2 frases com as palavras que o público busca (a busca do TikTok lê a legenda). Só fatos da fala, com as mesmas ressalvas ("falta o Senado confirmar", "é estimativa").
2. A pergunta final (`brief.yaml`) e o CTA do vídeo ("Comenta: VENDO ou COMPRO.").
3. Avisos que estão na tela e não são fonte ("Não é recomendação de investimento.").
4. As 5 primeiras hashtags.
5. **Fontes** em uma linha, só os nomes ("TCU · Agência Senado · LC 214/2025"): as linhas do `fatos.md` com status `OK` que não dizem "fora da fala" — marque assim o fato confirmado que ficou fora da narração. **Fotos**: o crédito de cada foto de `video.json → media`.

No TikTok link não é clicável, a legenda vai até 4.000 caracteres (2.200 pela API de postagem) e comentário até 150. Por isso os links das fontes e das fotos ficam abaixo da legenda, no mesmo arquivo, para conferir e responder comentários. Fonte citada sem link numa linha ("InfoMoney · CUT") pega o link que ela tem em outra linha.

## Onde rodar

| | Mac (Claude Code no terminal do Mac) | Sessão na nuvem (claude.ai) |
| --- | --- | --- |
| Render de 90 s em 3D | GPU de verdade + captura rápida + 8 workers: estimativa de 3–8 min num MacBook Air M5 (o Air não tem ventoinha e pode desacelerar; medir com `npx hyperframes benchmark`) | 2 CPUs com WebGL por software: **36 min** medidos no circuit breaker V2 (2.760 quadros) |
| QA (460 quadros) | ~1 min | ~3–4 min |
| Arquivos | direto em `~/Movies/reels` | entrega pelo app no Mac (ponte do computador); arquivos acima de 30 MB são recomprimidos para passar |
| Quando usar | produção do dia a dia | quando estiver só no celular |

A ponte com o Mac pelo app (shell do Mac) roda numa máquina virtual Linux sem GPU: para ganhar a velocidade do Mac, o render precisa rodar **nativo** no Mac (Claude Code local ou terminal).

Setup único em qualquer máquina: `bash tools/setup.sh` (Python: faster-whisper, numpy, soundfile, pyyaml · Node: hyperframes, playwright · confere o QA com o autoteste).
