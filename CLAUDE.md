# analogias-studio — instruções para o Claude

Kit de produção dos Reels 3D narrados do @analogias.br (Samuel Vieira). Para criar um vídeo, siga a skill `.claude/skills/reel-analogias/SKILL.md`.

## Mapa

- `channel.yaml` — perfil fixo do canal (voz, estilo, áudio, entrega). Não muda por vídeo.
- `config/layout.json` — área segura única e zonas (fonte da verdade para build, câmera e QA).
- `engine/core.js` — renderer, câmera por zona (`CAM.pose`, `envelope`), registro do QA (`S.hero/label/solid/scenery`).
- `engine/props/*.js` — objetos 3D reutilizáveis (`media.js`: fotos reais em quadro, polaroid e porta-retrato).
- `tools/` — build, QA, prévia, áudio, render, entrega, setup, autoteste.
- `videos/<slug>/` — um vídeo: `brief.yaml`, `fatos.md`, `roteiro.md`, `narracao.txt`, `video.json`, `scenes.js`, `audio/words.json`, `midia/` (fotos baixadas, fora do git; link e crédito em `video.json → media`). O resto é gerado.
- `tests/qa-pega-erros/` — os defeitos do V2 e do vídeo do Lula feitos de propósito; `tools/selftest.sh` prova que o QA pega todos.
- `docs/` — roteiro, visual, fotos, ferramentas, QA.

## Regras de trabalho

- Nunca gerar narração no ElevenLabs antes do roteiro aprovado pelo Samuel.
- Nunca renderizar sem `node tools/qa.cjs` limpo e atual (`tools/render.sh` confere) e sem a revisão cega da prévia (`docs/qa.md`).
- Foto real só com crédito na tela; nunca imagem de IA ou editada de pessoa ou fato real (`docs/fotos.md`).
- Não editar `videos/*/build/` (é gerado): editar `scenes.js`, `video.json`, `engine/` ou `tools/build.py`.
- Texto só por zona (`headline`, `source`, `caption`); nunca coordenadas em pixel.
- Área segura centralizada (x 190–890); animação principal dentro dela; plano de fundo pode ocupar a tela inteira (`S.backdrop`). Acabamento realista e polido, não cartoon (`docs/visual.md`).
- Câmera só por `CAM.pose(envelope(...))` ou `CAM.move(...)` (movimentos prontos); registrar todo objeto que importa.
- Dinâmica, jogos de câmera, fundo que reage à história e ilustração bem definida: `docs/visual.md` → "Direção" (pedido do Samuel, 31/10/2026).
- Motor, objetos e cena são um só módulo: nome de objeto do kit específico (`makeCoinJar`, `GOLD_METAL`); o `build.py` recusa nome repetido.
- Mudou `engine/` ou `tools/`? Rodar `bash tools/selftest.sh` e o QA do vídeo de exemplo antes do commit.
- Commits terminam com as linhas de atribuição pedidas na sessão.
