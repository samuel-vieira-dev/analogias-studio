# analogias-studio — instruções para o Claude

Kit de produção dos Reels narrados do @analogias.br (Samuel Vieira). Para criar um vídeo, siga a skill `.claude/skills/reel-analogias/SKILL.md`: ela começa perguntando o tema e o **estilo de edição** (`docs/estilos.md`: Estilo Analogias v1, 3D; Estilo Explicando Direito, 2D).

## Mapa

- `channel.yaml` — perfil fixo do canal (voz, estilo, áudio, entrega) e, em `estilos`, o perfil de cada estilo de edição. Não muda por vídeo.
- `config/layout.json` — área segura única e zonas (fonte da verdade para build, câmera e QA).
- `engine/core.js` — renderer, câmera por zona (`CAM.pose`, `envelope`), registro do QA (`S.hero/label/solid/scenery`).
- `engine/props/*.js` — objetos 3D reutilizáveis (`media.js`: fotos reais em quadro, polaroid e porta-retrato).
- `engine2d/` — motor do Estilo Explicando Direito (texto cinético, polaroids, cartões, documentos, gráficos; fonte Anton). Build/QA/capa próprios em `tools/*_direito.*`, chamados pelos comandos de sempre quando `video.json → estilo` é `explicando-direito`.
- `tools/` — build, QA, prévia, áudio, render, entrega, setup, autoteste.
- `videos/<slug>/` — um vídeo: `brief.yaml`, `fatos.md`, `roteiro.md`, `narracao.txt`, `video.json`, `scenes.js`, `audio/words.json`, `midia/` (fotos baixadas, fora do git; link e crédito em `video.json → media`). O resto é gerado.
- `tests/qa-pega-erros/` — os defeitos do V2 e do vídeo do Lula feitos de propósito; `tests/qa-pega-erros-direito/`, os do 2D; `tools/selftest.sh` prova que o QA pega todos.
- `docs/` — `estilos.md` (os estilos de edição), roteiro, visual, fotos, ferramentas, QA (do v1), `explicando-direito/` (referência, roteiro e visual do 2D) e `feedback.md` (histórico do que o Samuel gostou e não gostou, e o que mudou por isso).

## Regras de trabalho

- Todo vídeo novo começa perguntando ao Samuel o tema e o estilo de edição (`SKILL.md` → etapa 0); as regras de cada estilo valem só para ele.
- Nunca gerar narração no ElevenLabs antes do roteiro aprovado pelo Samuel.
- Nunca renderizar sem `node tools/qa.cjs` limpo e atual (`tools/render.sh` confere) e sem a revisão cega da prévia (`docs/qa.md`).
- Foto real só com crédito na tela; nunca imagem de IA ou editada de pessoa ou fato real (`docs/fotos.md`).
- Não editar `videos/*/build/` (é gerado): editar `scenes.js`, `video.json`, `engine/` ou `tools/build.py`.
- Texto só por zona (`headline`, `source`, `caption`); nunca coordenadas em pixel. No 2D, nem posição: só `texto` e `visuais` no `video.json`.
- Área segura centralizada (x 190–890); animação principal dentro dela; plano de fundo pode ocupar a tela inteira (`S.backdrop`). Acabamento realista e polido, não cartoon (`docs/visual.md`).
- Câmera só por `CAM.pose(envelope(...))` ou `CAM.move(...)` (movimentos prontos); registrar todo objeto que importa.
- Dinâmica, jogos de câmera, fundo que reage à história e ilustração bem definida: `docs/visual.md` → "Direção" (pedido do Samuel, 31/10/2026).
- Motor, objetos e cena são um só módulo: nome de objeto do kit específico (`makeCoinJar`, `GOLD_METAL`); o `build.py` recusa nome repetido.
- Mudou `engine/` ou `tools/`? Rodar `bash tools/selftest.sh` e o QA do vídeo em produção (se houver) antes do commit.
- QA só nos vídeos em produção. Vídeo já entregue fica como está: não rodar QA nem corrigir por causa de regra nova (pedido do Samuel, 31/10/2026).
- Depois de entregar um vídeo, sempre perguntar ao Samuel o que ele gostou e não gostou e aplicar no kit sozinho (`SKILL.md` → etapa 12, registro em `docs/feedback.md`), com commit e push no `main` sem pedir licença.
- `claude-ai-skill/` é só a porta de entrada da skill no claude.ai (manda ler a skill do kit). Não copiar regras para lá.
- Commits terminam com as linhas de atribuição pedidas na sessão.
