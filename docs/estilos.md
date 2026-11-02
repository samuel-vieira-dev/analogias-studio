# Estilos de edição

Todo vídeo novo começa com duas perguntas ao Samuel: o **tema** e o **estilo de edição** (`SKILL.md` → etapa 0). O estilo escolhido vai para `brief.yaml → estilo` e `video.json → estilo` e decide quais regras de roteiro, visual e áudio valem. Pesquisa e checagem de fatos, fotos com crédito, aprovação antes de gastar crédito, QA antes do render, entrega e feedback são iguais em todos.

| | Estilo Analogias v1 | Estilo Explicando Direito |
| --- | --- | --- |
| id (`estilo`) | `analogias-v1` | `explicando-direito` |
| Cara | cenas 3D realistas (Three.js) com câmera que se mexe, fotos em quadros e porta-retratos, legenda palavra a palavra embaixo | 2D sobre papel cinza: texto cinético grande no alto escrevendo a fala, um elemento por vez no meio (polaroid, cartão, documento, gráfico), impacto no gancho |
| Bom para | explicar um mecanismo com **uma analogia**; história com cenário "imagina" | notícia de política e justiça; lei, decisão, prazo e número; "o que muda agora" |
| Narrador | 2ª pessoa ("você", "imagina") | 3ª pessoa, tom de jornal que explica |
| Duração · ritmo | ~90 s · 2,75 palavras/s | 55–75 s · 3,2 palavras/s, sem pausa |
| Final | pergunta de duas escolhas na tela (CTA) | fim seco no último fato; a pergunta vai só na legenda do post |
| Trilha | nenhuma (o app põe na postagem) | trilha-assinatura grave embaixo da voz, a mesma em todo vídeo |
| Regras | [`roteiro.md`](roteiro.md), [`visual.md`](visual.md), [`fotos.md`](fotos.md), [`qa.md`](qa.md) | [`explicando-direito/roteiro.md`](explicando-direito/roteiro.md), [`explicando-direito/visual.md`](explicando-direito/visual.md), [`fotos.md`](fotos.md) |
| Cenas | `scenes.js` + `video.json` (overlays por zona) | só `video.json` (`texto` + `visuais`), sem código |
| Motor | `engine/` + `tools/build.py` | `engine2d/` + `tools/build_direito.py` (chamado pelo `build.py`) |
| Render (Mac) | 5–15 min | ~1–2 min |
| Modelo | `videos/2026-10-31-banco-master-fgc/` | `videos/exemplo-explicando-direito/` |
| De onde veio | os vídeos de 27–31/10/2026 e os feedbacks em [`feedback.md`](feedback.md) | engenharia reversa do @descomplicaodireito_ ([`explicando-direito/referencia.md`](explicando-direito/referencia.md)) |

## Estilo novo

1. Engenharia reversa da referência (baixar, transcrever com tempo por palavra, quadros, medir ritmo, cores, áudio) em `docs/<id>/referencia.md`; o material baixado fica fora do git, em `~/Documents/Analogias/referencias/<id>/`.
2. Regras em `docs/<id>/roteiro.md` e `docs/<id>/visual.md`; perfil em `channel.yaml → estilos.<id>`.
3. Motor reaproveitando o que der (voz, aperto, mixagem, render, entrega são comuns); build, QA, prévia e capa reconhecem o `estilo` do `video.json`.
4. Um caso de cada regra nova do QA em `tests/` e no `tools/selftest.sh`.
5. Uma linha nesta tabela e uma opção na pergunta da etapa 0 da `SKILL.md`.

Copiar o formato, nunca a marca: nada de logo, figurinha, frase, trilha ou nome da referência.
