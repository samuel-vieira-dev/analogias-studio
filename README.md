# analogias-studio

Kit de produção dos Reels/TikToks/Shorts 3D narrados do **@analogias.br**: do tema ao MP4, com as regras do canal embutidas. Você entra com o **tema** (e, se quiser, referências visuais), escolhe o **hook** e a **pergunta final** entre as opções propostas e aprova o roteiro. O resto é do kit.

```
tema ─► pesquisa + fatos ─► 5 hooks / 3 perguntas ─► roteiro ─► APROVAÇÃO ─► voz (ElevenLabs, 2 takes)
     ─► melhor take + aperto ─► tempos das palavras ─► cenas 3D + textos por zona
     ─► mix ─► build ─► QA (bloqueia) + prévia ─► render ─► MP4 em Filmes/reels
```

## Como usar

Peça ao Claude (com a skill **reel-analogias**): *"Faz um vídeo sobre &lt;tema&gt;"*. A skill está em [`.claude/skills/reel-analogias/SKILL.md`](.claude/skills/reel-analogias/SKILL.md).

Primeira vez numa máquina: `bash tools/setup.sh`.

## O que já vem resolvido

- **Área segura única** para Reels, TikTok e Shorts (x 60–890, y 220–1500) com zonas fixas: fontes no canto superior direito, títulos e números na faixa de cima, 3D no palco, legenda na base da área segura. Detalhes: [`docs/visual.md`](docs/visual.md).
- **Câmera 3D que se mede sozinha**: `CAM.pose(envelope(...))` enquadra o objeto e todo o movimento dele dentro da zona — acabou o objeto cortado.
- **QA automático antes do render** ([`docs/qa.md`](docs/qa.md)): mede texto × objeto, objeto × área segura, objeto × objeto, tamanho do assunto, palco vazio, plano parado, texto 3D ilegível e crédito/resolução das fotos, quadro a quadro; o render se recusa a rodar sem QA limpo. O autoteste (`bash tools/selftest.sh`) recria de propósito os defeitos do circuit breaker V2 e do vídeo do Lula e confirma que o QA pega todos.
- **Revisão cega**: a prévia tira um quadro por plano e recorta cada objeto numa folha numerada; um subagente que não conhece o roteiro diz o que vê (foi assim que o telhado de lado do Lula teria sido pego).
- **Fotos reais** ([`docs/fotos.md`](docs/fotos.md)): quadro de investigação, porta-retrato no palco e cartão 2D, com zoom lento e crédito obrigatório na tela.
- **Regras de roteiro** do canal ([`docs/roteiro.md`](docs/roteiro.md)) e **ferramentas** ([`docs/ferramentas.md`](docs/ferramentas.md)): ElevenLabs (Sandro Dutra), faster-whisper, HyperFrames 0.8.206, ffmpeg.

## Estrutura

```
channel.yaml            perfil fixo do canal (voz, cores, áudio, entrega)
config/layout.json      área segura, zonas, câmera, limites do QA
engine/core.js          renderer Three.js, CAM (pose/envelope/track), registro do QA
engine/props/*.js       objetos 3D reutilizáveis
tools/                  build · qa · preview · transcribe · tighten · mix · render · finalize · setup · selftest
videos/<slug>/          um vídeo: brief.yaml, fatos.md, roteiro.md, narracao.txt, video.json, scenes.js, audio/words.json, midia/ (fotos, fora do git)
tests/qa-pega-erros/    os defeitos do V2 feitos de propósito
docs/                   roteiro, visual, fotos, ferramentas, QA
```

Exemplo completo: [`videos/2026-10-27-circuit-breaker/`](videos/2026-10-27-circuit-breaker/) (o vídeo do circuit breaker refeito no kit; QA limpo pelas regras de 27/10 — as regras novas de 28/10, de movimento, tamanho e texto 3D, apontam 7 pendências nele).

## Comandos

```bash
python3 tools/transcribe.py videos/<slug>/audio/takes/*.mp3 --ref videos/<slug>/narracao.txt
python3 tools/tighten.py <take> videos/<slug>/audio/narration.wav --target 88
python3 tools/transcribe.py videos/<slug>/audio/narration.wav --out videos/<slug>/audio/words.json
python3 tools/mix.py videos/<slug>
python3 tools/build.py videos/<slug>
node tools/qa.cjs videos/<slug>
node tools/preview.cjs videos/<slug> [tempos...] [--safe]
bash tools/render.sh videos/<slug> [draft|looks|delivery] [--detach]
python3 tools/finalize.py videos/<slug>
```

Render de 90 s em 3D: ~36 min na nuvem (medido); no Mac com GPU, estimativa de 3–8 min.
