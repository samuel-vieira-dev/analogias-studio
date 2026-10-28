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
| `objeto_pequeno` | os heróis do plano ocupam menos de 45% da zona (largura ou altura) por 0,8 s | enquadrar só o assunto (sem `pull` grande); o resto é cenário |
| `quadro_vazio` | nenhum objeto registrado nem foto na tela por 0,6 s (ex.: o corte chega antes do pop) | objeto já visível no corte, ou pop antes do corte |
| `plano_parado` | nada se mexe por 2 s: menos de 0,2% da imagem 3D muda em 1 s e nenhum cartão de foto aproxima | câmera sempre andando (`CAM.blend`/`track` no plano todo), zoom lento nas fotos, elementos entrando |
| `texto3d_ilegivel` | texto impresso num herói (`makePlate`) ou rótulo 3D com letra menor que 16 px por 0,5 s | placa maior, texto mais curto, câmera mais perto; `detail: true` só para texto que é textura, não leitura |
| `foto_sem_credito` | foto na tela sem `credit` (de `video.json → media`) num `source` visível por 0,4 s | overlay `source` "Foto: ..." no mesmo tempo da foto |
| `foto_em_baixa_resolucao` | foto mostrada maior que 1,6× os próprios pixels (fica borrada) | foto maior da fonte original, ou mostrar menor |

Os limites ficam em `config/layout.json → qa` e o `qa/report.json` traz um traço por quadro (`trace`: movimento, objetos na tela, menor texto 3D) para entender um caso limite.

## Os quatro problemas do circuit breaker V2 e a causa raiz

| Momento | Sintoma | Causa raiz | O que o kit faz agora |
| --- | --- | --- | --- |
| 0:03 | celular cortado | câmera posicionada por números chutados, sem medir o objeto; centro óptico no meio do quadro, não da área segura | `CAM.pose` resolve a distância para o objeto (e todo o seu movimento) caber na zona; centro óptico no centro da zona |
| 0:46 | moeda cortada depois do "FECHADO" | sem regra de colisão: a moeda afundava no degrau e a persiana descia através dela; o 3D era invisível para qualquer checagem | moeda apoiada no degrau, persiana atrás com folga, "FECHADO" impresso na persiana; `S.solid` + regras de colisão no QA |
| 1:06 | fonte em cima da animação | texto posicionado em pixels, sem mapa comum entre texto e 3D | texto só por zona; fonte sempre no canto superior direito; QA mede texto × objeto |
| 1:08 | número em cima da animação | idem; e a câmera enquadrava a urna sob a faixa dos números | zona `stage` abaixo da headline quando há número; QA bloqueia |

## O telhado de lado do vídeo do Lula (28/10/2026) e a causa raiz

Aos 0:47 ("Minha Casa Minha Vida") a casa saiu com o telhado virado de lado, a ponta apontando para a direita e metade enfiada nas paredes. Passou por três motivos:

| Causa | O que o kit faz agora |
| --- | --- |
| O telhado foi montado "no olho": um cilindro de 3 lados girado em dois eixos, sem conferir o resultado | `makeHouse` na biblioteca (`engine/props/civic.js`), com as duas águas calculadas; objeto que já existe não é remontado |
| A casa ficou só 1,4 s na tela (46,5–47,9 s) e a folha de contato tirava um quadro a cada 3 s (45,5 e 48,5): ninguém viu a casa | prévia **por plano**: todo herói aparece no momento em que é o assunto, mais um quadro por corte; nenhum buraco maior que 2,5 s |
| O QA mede relação entre objetos (corte, texto em cima, atravessar), não se um objeto parece o que deveria | **folha de objetos** numerada + **revisão cega** por um subagente que não conhece o roteiro (abaixo) |

O mesmo QA, rodado de novo no vídeo do Lula, encontra 33 problemas que passaram (no circuit breaker, 7; na escala 6x1, 6): textos 3D com 2 a 12 px (os anos nas urnas, "MENSALÃO · 2005"), a mala ocupando 18% do palco, palco vazio por 0,8 s depois de cortes e planos parados (a prensa fica 6 s sem se mexer).

Prova: `bash tools/selftest.sh` monta `tests/qa-pega-erros` (os defeitos do V2 e do Lula feitos de propósito, um por cena) e falha se o QA não pegar todos.

## Revisão cega (obrigatória antes do render)

O QA mede geometria; ele não sabe que um telhado de lado está errado. Quem escreveu a cena também não enxerga: sabe o que quis fazer e vê isso. Por isso a revisão é feita por alguém que **não conhece o roteiro**.

1. `node tools/preview.cjs videos/<slug>` gera `preview/sheet-NN.jpg` (um quadro por plano, com tempo e heróis), `preview/objetos-NN.jpg` (cada herói recortado do próprio quadro, **só com número**) e `preview/objetos.json` (o gabarito: número → herói, cena, tempo).
2. Abrir um subagente novo (ferramenta Agent) **sem** o roteiro nem o gabarito, só com os caminhos das imagens e este pedido:

   > Você revisa um vídeo vertical 3D antes de ir ao ar e não sabe o roteiro. Abra cada imagem: <caminhos de objetos-NN.jpg e sheet-NN.jpg>. Em objetos-NN.jpg, para cada número: diga em até 6 palavras o que o objeto é, e aponte o que estiver fisicamente errado ou feio — peça no lugar errado, de lado ou de cabeça para baixo, flutuando, atravessando outra, proporção estranha, parte faltando, texto ilegível ou cortado, foto distorcida, pixelada ou com rosto cortado. Em sheet-NN.jpg, para cada quadro: objeto cortado, pequeno demais, perdido no escuro, texto em cima de objeto, quadro vazio ou confuso. Responda em lista "#n — o que é — problemas (ou ok)". Seja duro: na dúvida, aponte.

3. Comparar o que o revisor nomeou com `objetos.json`. Nome errado ou vago ("triângulo vermelho em cima de uma caixa" no lugar de "casa") = objeto mal modelado: corrigir. Todo problema apontado é corrigido ou justificado por escrito antes do render.
4. Depois, olhar as folhas com o roteiro do lado: cada plano mostra o que a fala está dizendo naquele instante?

## Limites (por isso também olhamos)

- Amostra a cada 0,2 s: um problema de 1–5 quadros pode escapar. Para a checagem final: `--step 0.1`.
- Caixas 3D são retângulos (conservadoras): um objeto girado ocupa mais do que o desenho.
- O QA não julga se um objeto parece o que deveria (o telhado de lado): para isso existem a folha de objetos e a revisão cega.
- `plano_parado` mede o 3D (e o zoom dos cartões de foto): legenda trocando não conta como movimento.
