# Roteiro aprovado — Lei Rouanet bate recorde e de onde vem o dinheiro (Estilo Explicando Direito, voz Sandro Dutra)

Gancho: opção 5 (consequência) · Pergunta só na legenda: "Lei Rouanet: investimento que volta pra economia, ou imposto que deveria ir pra saúde e educação?" · ~235 palavras, ~73 s depois do aperto · Fatos: `fatos.md` · Aprovado em 06/11/2026.
Virada: "esse dinheiro não sai do orçamento da Cultura, sai do imposto de renda" (Lei 8.313 arts. 18/26; Decreto 11.453 arts. 58, 60, 65) e "o discurso oficial é que vale a pena (FGV, R$ 7,59)" → "Porém, críticos apontam a concentração (72% no Sudeste)".
Direito em uma frase: o MinC aprova = licença pra captar (art. 19); empresa no lucro real manda até 4% do IR devido, pessoa física até 6%; nos segmentos do art. 18 §3º o desconto é de 100% → renúncia fiscal.
Pedido do Samuel: explicar de onde vem o subsídio.

Narração: `narracao.txt` (exata). Texto na tela e visuais: `video.json → texto` e `visuais`.

| # | Narração | Visual |
|---|---|---|
| 1 | Recorde da Rouanet: bilhões em imposto que o governo deixa de receber. | foto-cheia Theatro Municipal (P&B) → impacto: documento Lei 8.313/1991 + carimbo RENÚNCIA FISCAL |
| 2 | Mais de 25 mil propostas, o maior número da história. | cartão 25.650 PROPOSTAS + nota MinC |
| 3 | 1 bilhão e 670 milhões até outubro, recorde pro período. | barras jan–out 2024/2025/2026 + carimbo RECORDE |
| 4 | Ano passado: 3,4 bilhões, terceiro recorde seguido. | cartão R$ 3,4 BILHÕES + carimbo 3º RECORDE |
| 5 | Porém, não sai do orçamento da Cultura: sai do imposto de renda. | impacto: palavras ORÇAMENTO (riscado) → IMPOSTO DE RENDA |
| 6 | O MinC aprova o projeto = licença pra buscar patrocínio. | documento Lei 8.313 art. 19 |
| 7 | Empresa até 4% do imposto direto pra conta do projeto; pessoa física até 6%. | fluxo EMPRESA → PROJETO + nota Decreto 11.453 art. 60 · cartão ATÉ 6% |
| 8 | Teatro, livros, música instrumental e patrimônio: desconto de 100%. | palavras TEATRO · LIVROS · MÚSICA · PATRIMÔNIO → rosca 100% + nota art. 18 |
| 9 | A empresa escolhe e põe a marca; o dinheiro é imposto que o governo deixa de receber: renúncia fiscal. | bifurcação EMPRESA × IMPOSTO → ícone dinheiro + carimbo RENÚNCIA FISCAL |
| 10 | Maior patrocinadora: Petrobras, estatal, 278 milhões até agosto. | polaroid sede da Petrobras + nota ESTATAL → cartão R$ 278 MILHÕES |
| 11 | Discurso oficial: FGV (encomendado pelo ministério), cada real movimentou mais de 7. | documento FGV → números R$ 1 → R$ 7,59 |
| 12 | Porém, críticos: 72% no Sudeste em 2025. | ícone lupa → rosca 72% |
| 13 | O recorde deve crescer: em 2025, mais da metade entrou só em novembro e dezembro. | barras 2025 JAN–OUT × NOV–DEZ + nota da conta (fim seco) |

## Revisão cega (06/11/2026)

Corrigido: gráfico jan–out (2025 = 1,61 bi) brigando com "3,4 bi em 2025" → barras com "JAN–OUT" dentro e nota "só de janeiro a outubro", cartão "no ano inteiro de 2025"; "DESDE 1991" lido como data de criação → "RECORDE de propostas desde 1991"; carimbo "3º RECORDE", rótulo "RENÚNCIA FISCAL" e nota "ESTATAL" só apareciam na transição → entram antes; rosca "100%" parecia placa de proibido e contradizia 4%/6% → cartão "100% do patrocínio sai do imposto" + nota "dentro do teto de 4% ou 6%"; bifurcação EMPRESA × IMPOSTO sugeria escolha → cartões "A MARCA é da empresa" e "O DINHEIRO é imposto que não entra no caixa" + carimbo RENÚNCIA FISCAL; dois círculos sem seta → documento Decreto 11.453 art. 65 (conta do projeto); ícones de prédio e cédula ilegíveis → tirados (figurinha do tema: documento); seta "recorde parcial" confusa → calendário "2026 AINDA NÃO FECHOU"; "R$ 1" quebrando em duas linhas e seta apontando pro vazio → "1 → 7,59" entrando junto; linhas do documento da FGV fora de ordem; nota final da conta reescrita; documento da lei com linhas de verdade no lugar das linhas cinzas. Motor (`engine2d/`): til e circunflexo da linha grande encostavam na linha de cima → margem maior; cedilha do cartão em cima do texto pequeno → mais espaço; número da rosca vazando do anel → letra menor com 3–4 caracteres; bloco de 3 linhas vazando 2 px da zona na saída → altura conferida já crescida (`BLOCK_EXIT_SCALE`). Autoteste ok.
Fica como está, com motivo: "MÚSICA" na lista e "música instrumental" na fala (a lista é o resumo dos segmentos, a fala completa); fim sem conclusão (fim seco é regra do estilo); textos pequenos de nota e rodapé (padrão do motor, são fonte e ressalva, não a informação principal); quadros de transição e de escrita palavra a palavra (cursor, caixa amarela crescendo).
