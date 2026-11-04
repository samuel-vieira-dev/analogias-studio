# Roteiro aprovado — STF: poderes e acusações de abuso (Estilo Explicando Direito, voz Sandro Dutra)

Gancho: opção 3 (afirmação que o vídeo prova: CF art. 102, I, b) · Pergunta só na legenda: "Ministro do STF deve ficar até os 75 anos, ou ter mandato fixo?" · 239 palavras, ~80 s depois do aperto (o take saiu lento: x1,18) · Fatos: `fatos.md` · Aprovado em 04/11/2026.
Virada: "O discurso oficial é proteger o tribunal de ataques" → "Porém, críticos dizem que o STF virou vítima, investigador e juiz" (defesa: Money Times / Moraes; crítica: Abraji, Marco Aurélio).
Direito em uma frase: crime comum (inclusive abuso de autoridade, Lei 13.869 art. 2º, IV) → julga o próprio STF (CF 102, I, b); crime de responsabilidade (Lei 1.079 art. 39) → Senado, com 2/3 (CF 52, II e parágrafo único).
Pedido do Samuel: pontuar as questões de suposto abuso — sempre atribuídas, com a resposta de quem foi citado.

Narração: `narracao.txt` (exata). Texto na tela e visuais: `video.json → texto` e `visuais`.

| # | Narração | Visual |
|---|---|---|
| 1 | Ministro do STF que comete crime é julgado pelo próprio STF. | foto-cheia plenário do STF (P&B) → impacto: documento CF 102, I, b ("seus próprios ministros") |
| 2 | 11 ministros, indicados pelo presidente, aprovados pelo Senado, até os 75 anos. | cartão 11 MINISTROS · fluxo PRESIDENTE → SENADO · cartão ATÉ 75 ANOS + nota CF 101/40 |
| 3 | Derruba leis do Congresso, julga presidente e parlamentares, última palavra sobre a Constituição. | foto-cheia Congresso + carimbo INCONSTITUCIONAL · documento CF 102 |
| 4 | Em 2025, 80% das decisões de um ministro só. | rosca 80% + nota 116.170 decisões |
| 5 | É aí que entram as acusações de abuso. | ícone alerta "ABUSO DE AUTORIDADE?" |
| 6 | 2019: o STF abriu sozinho o inquérito das fake news; Moraes relator sem sorteio. | chicote: documento Inq 4781 · polaroid Moraes + carimbo SEM SORTEIO |
| 7–8 | Discurso oficial: proteger o tribunal. Porém, críticos: vítima, investigador e juiz. | foto fachada do STF + nota DEFESA · impacto: palavras VÍTIMA / INVESTIGADOR / JUIZ |
| 9 | Plenário validou por 10 a 1. | hemiciclo de 11: 10 × 1 (ADPF 572) |
| 10 | Moraes tirou o X do ar por mais de um mês, por descumprimento de ordens. | celular X + carimbo SUSPENSO · cartão AGO → OUT/2024 + nota MOTIVO |
| 11–12 | Set/2026: PF mostra mensagens de Vorcaro (Banco Master) a "Min Alexandre de Moraes". Moraes nega. | chicote: polaroid Vorcaro + cartão BANCO MASTER · celular "Min Alexandre de Moraes" + nota PF/Mendonça · polaroid Moraes + nota DEFESA |
| 13 | Fachin tira Moraes do inquérito. | polaroids Fachin → Moraes (✗) + nota 09/09/2026 |
| 14–16 | Quem pune? Crime comum → STF; crime de responsabilidade → Senado, 2/3. | ícone martelo · bifurcação + cartão Lei 13.869 · documento Lei 1.079 art. 39 · hemiciclo 54 DE 81 |
| 17–18 | 109 pedidos de impeachment, metade contra Moraes. Nenhum ministro jamais perdeu o cargo. | cartão 109 + nota Alcolumbre · barras 55/15/12/27 · cartão ZERO + carimbo NUNCA (fim seco) |

## Revisão cega (04/11/2026)

Corrigido: hemiciclo de 11 cadeiras ilegível → balança 10 × 1; documento do art. 102 repetido e meio vazio → bonecos PRESIDENTE · DEPUTADOS · SENADORES; seta do fluxo entrando cedo; palco vazio em "porém" → lupa; carimbos ilegíveis ou em cima do texto (INCONSTITUCIONAL, SEM SORTEIO, SUSPENSO, REVOGADA, NUNCA → NA HISTÓRIA); placa "RESPONSABILID…" cortada → STF × SENADO; cartão BANCO MASTER cobrindo o nome → nota; título e unidade nas barras; hemiciclo do Senado pálido; vírgula solta depois do destaque; martelo com a base solta → algemas; linha grande que vazava 3% na saída do bloco → `engine2d/direito.js` (`BLOCK_EXIT_SCALE`, autoteste ok).
Fica como está, com motivo: a 2ª linha nasce à esquerda e centraliza ao terminar (escrita palavra a palavra do motor, igual nos vídeos anteriores do estilo); celulares com balões sem texto (de propósito: não inventar o conteúdo das mensagens); "Min Alexandre de Moraes" sem ponto (é o nome do contato no relatório da PF); foto do Congresso em grande-angular (foto real, só recorte; o P&B tirou o borrão do teto); Moraes em três polaroids (é citado três vezes); crédito "Antonio Cruz/ABr" (assim no Commons); a fachada é a do STF (arquivo "Fachada do Supremo Tribunal Federal").
