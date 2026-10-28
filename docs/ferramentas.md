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
| 12 | Arquivo final | `tools/finalize.py` | `out/<slug>.mp4` → Filmes/reels |

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

## Onde rodar

| | Mac (Claude Code no terminal do Mac) | Sessão na nuvem (claude.ai) |
| --- | --- | --- |
| Render de 90 s em 3D | GPU de verdade + captura rápida + 8 workers: estimativa de 3–8 min num MacBook Air M5 (o Air não tem ventoinha e pode desacelerar; medir com `npx hyperframes benchmark`) | 2 CPUs com WebGL por software: **36 min** medidos no circuit breaker V2 (2.760 quadros) |
| QA (460 quadros) | ~1 min | ~3–4 min |
| Arquivos | direto em `~/Movies/reels` | entrega pelo app no Mac (ponte do computador); arquivos acima de 30 MB são recomprimidos para passar |
| Quando usar | produção do dia a dia | quando estiver só no celular |

A ponte com o Mac pelo app (shell do Mac) roda numa máquina virtual Linux sem GPU: para ganhar a velocidade do Mac, o render precisa rodar **nativo** no Mac (Claude Code local ou terminal).

Setup único em qualquer máquina: `bash tools/setup.sh` (Python: faster-whisper, numpy, soundfile, pyyaml · Node: hyperframes, playwright · confere o QA com o autoteste).
