# QA automático (antes de todo render)

`node tools/qa.cjs videos/<slug>` abre `qa/harness.html` (3D + textos + legendas numa página), avança de 0,2 em 0,2 s e mede, em pixels do quadro, cada texto e cada objeto registrado. Sai com código 0 (limpo), 1 (problemas) ou 2 (erro). Problemas viram `qa/report.json` e prints marcados em `qa/` (rosa = item A, amarelo = item B, azul = área segura).

`tools/render.sh` se recusa a renderizar sem um relatório completo, limpo e mais novo que o build.

## Regras

| Regra | O que pegou | Correção típica |
| --- | --- | --- |
| `objeto_fora_da_area_segura` | herói cortado ou fora da área segura | enquadrar com `CAM.pose(envelope(...))`; incluir no envelope tudo que se mexe |
| `texto_sobre_animacao` | texto/legenda em cima de herói ou cenário | zona `stage` quando a headline tem texto; cenário abaixo da headline |
| `texto_fora_da_area_segura` / `texto_fora_da_zona` | texto vazando a área segura ou a própria zona | texto menor, itens em sequência em vez de empilhados |
| `fonte_fora_do_canto` | fonte fora do canto superior direito | usar `kind: "source"` e texto curto |
| `texto_sobre_texto` | dois textos se cobrindo | ajustar tempos (`from`/`to`) |
| `rotulo3d_fora_da_area_segura` / `rotulo3d_sobre_objeto` / `texto_sobre_rotulo3d` | texto 3D cortado ou em cima de outro objeto | incluir o rótulo no envelope; imprimir no objeto com `makePlate` |
| `objetos_se_atravessando` | dois sólidos se interpenetrando | folga em z; porta atrás ou na frente |
| `objeto_afundou_no_apoio` | objeto afundado no apoio (`restsOn`) | base do objeto = topo do apoio |

## Os quatro problemas do circuit breaker V2 e a causa raiz

| Momento | Sintoma | Causa raiz | O que o kit faz agora |
| --- | --- | --- | --- |
| 0:03 | celular cortado | câmera posicionada por números chutados, sem medir o objeto; centro óptico no meio do quadro, não da área segura | `CAM.pose` resolve a distância para o objeto (e todo o seu movimento) caber na zona; centro óptico no centro da zona |
| 0:46 | moeda cortada depois do "FECHADO" | sem regra de colisão: a moeda afundava no degrau e a persiana descia através dela; o 3D era invisível para qualquer checagem | moeda apoiada no degrau, persiana atrás com folga, "FECHADO" impresso na persiana; `S.solid` + regras de colisão no QA |
| 1:06 | fonte em cima da animação | texto posicionado em pixels, sem mapa comum entre texto e 3D | texto só por zona; fonte sempre no canto superior direito; QA mede texto × objeto |
| 1:08 | número em cima da animação | idem; e a câmera enquadrava a urna sob a faixa dos números | zona `stage` abaixo da headline quando há número; QA bloqueia |

Prova: `bash tools/selftest.sh` monta `tests/qa-pega-erros` (os quatro defeitos feitos de propósito) e falha se o QA não pegar todos.

## Limites (por isso também olhamos)

- Amostra a cada 0,2 s: um problema de 1–5 quadros pode escapar. Para a checagem final: `--step 0.1`.
- Caixas 3D são retângulos (conservadoras): um objeto girado ocupa mais do que o desenho.
- O QA não julga beleza. Sempre gerar `node tools/preview.cjs videos/<slug>` e **olhar a folha de contato** antes do render.
