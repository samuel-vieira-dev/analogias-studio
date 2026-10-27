# analogias-studio — instruções para o Claude

Kit de produção dos Reels 3D narrados do @analogias.br (Samuel Vieira). Para criar um vídeo, siga a skill `.claude/skills/reel-analogias/SKILL.md`.

## Mapa

- `channel.yaml` — perfil fixo do canal (voz, estilo, áudio, entrega). Não muda por vídeo.
- `config/layout.json` — área segura única e zonas (fonte da verdade para build, câmera e QA).
- `engine/core.js` — renderer, câmera por zona (`CAM.pose`, `envelope`), registro do QA (`S.hero/label/solid/scenery`).
- `engine/props/*.js` — objetos 3D reutilizáveis.
- `tools/` — build, QA, prévia, áudio, render, entrega, setup, autoteste.
- `videos/<slug>/` — um vídeo: `brief.yaml`, `fatos.md`, `roteiro.md`, `narracao.txt`, `video.json`, `scenes.js`, `audio/words.json` (o resto é gerado).
- `tests/qa-pega-erros/` — os defeitos do V2 feitos de propósito; `tools/selftest.sh` prova que o QA pega todos.
- `docs/` — roteiro, visual, ferramentas, QA.

## Regras de trabalho

- Nunca gerar narração no ElevenLabs antes do roteiro aprovado pelo Samuel.
- Nunca renderizar sem `node tools/qa.cjs` limpo e atual (`tools/render.sh` confere).
- Não editar `videos/*/build/` (é gerado): editar `scenes.js`, `video.json`, `engine/` ou `tools/build.py`.
- Texto só por zona (`headline`, `source`, `caption`); nunca coordenadas em pixel.
- Câmera só por `CAM.pose(envelope(...))`; registrar todo objeto que importa.
- Mudou `engine/` ou `tools/`? Rodar `bash tools/selftest.sh` e o QA do vídeo de exemplo antes do commit.
- Commits terminam com as linhas de atribuição pedidas na sessão.
