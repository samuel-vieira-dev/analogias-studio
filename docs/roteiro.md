# Roteiro: regras do @analogias.br

O roteiro é escrito pela skill a partir do tema. O Samuel escolhe o hook e a pergunta final e aprova o texto inteiro antes de qualquer crédito do ElevenLabs ser gasto.

## As cinco regras

1. **Gancho chamativo nos 3 primeiros segundos.** Uma frase só, de 8 a 12 palavras, que já entrega a tensão. O primeiro quadro também prende sem som (o 3D do gancho é o "thumbnail").
2. **História que gera curiosidade, em segunda pessoa.** "Você" do começo ao fim. Abrir um mistério cedo ("e nada acontece") e só explicar depois.
3. **Projeção cenográfica** (cenário hipotético de empatia / storytelling imersivo). Colocar quem assiste dentro da cena: "Imagina: você acorda, pega o celular...". Pelo menos uma vez; idealmente duas (hoje e no passado).
4. **Clareza que até uma criança entenderia.** Frases curtas, números redondos, nenhum jargão sem explicação. **Analogias só nos pontos difíceis** — os que exigem conhecimento prévio. Uma analogia principal por vídeo, bem escolhida (ex.: circuit breaker = disjuntor de casa, que desliga sozinho para não queimar os aparelhos). Nada de analogia em cada frase.
5. **Termina com uma pergunta de duas escolhas**, objetiva, em que as duas respostas são defensáveis. Ela vira o CTA: "Comenta: A ou B".

Tom: thriller/sensacionalista na forma, rigoroso no conteúdo. Todo número tem fonte. Em temas políticos, contar o que aconteceu sem tomar lado.

## Etapa 1 — pesquisa e checagem (antes de qualquer opção)

- Buscar o tema na web; para assunto do dia, buscar notícias de hoje.
- Cada número que vai para a fala ou para a tela precisa de fonte; preferir fonte primária (B3, BCB, IBGE, documento oficial) e confirmar em uma segunda fonte independente.
- Registrar tudo em `videos/<slug>/fatos.md` (tabela: fato · dado · fonte com link · status). Status `OK` ou `Conferir — fora da fala`. O que não fecha não entra na narração.
- Fontes na tela: "Fonte: <veículo/órgão>, <data>" na zona `source` (canto superior direito), uma linha.

## Etapa 2 — opções para o Samuel escolher (uma única mensagem)

**5 hooks**, cada um de um jeito diferente, numerados, e a opção **6. Outro (escreva o seu)**:

| Tipo | Exemplo (circuit breaker) |
| --- | --- |
| Notícia urgente + imagem forte | "Acabaram de apertar o botão do pânico na bolsa de valores." |
| Cenário "imagina" | "Imagina apertar 'vender' e nada acontecer." |
| Número chocante | "Por trinta minutos, ninguém no Brasil conseguiu vender uma ação." |
| Contradição / quebra de expectativa | "A bolsa caiu tanto que proibiram todo mundo de vender." |
| Pergunta que cutuca | "Você sabia que a bolsa tem um botão que desliga tudo?" |

**3 perguntas finais**, cada uma com duas escolhas claras, e a opção **4. Outra (escreva a sua)**. Exemplo: "O que você faria agora? Vende suas ações com medo de cair mais, ou compra porque acha que o pânico exagerou?"

Se o Samuel escrever o próprio hook ou pergunta, usar o texto dele como está (só ajustar se ferir uma regra, e avisar).

## Etapa 3 — o roteiro

- 90 s ≈ **240–250 palavras** na voz do Sandro Dutra (2,75 palavras/s depois do aperto de pausas; o ritmo máximo permitido é ×1,06).
- Estrutura que funcionou: gancho → cena "imagina" com mistério → revelação do nome → analogia no ponto difícil → regras simples → contexto histórico curto → hoje → projeção no passado (os dois lados) → "mas hoje não é aquele dia" → pergunta de duas escolhas.
- Entregar em tabela: **# · narração · visual · texto na tela (zona)**, mais a tabela dos 5 critérios (onde está · atende?). A coluna **visual** diz `3D: <o que>` ou `foto: <id> (quadro | porta-retrato | cartão)` — foto onde quem assiste se perguntaria "como é isso?" (pessoa citada, o avião, o prédio, o documento), 3D para o resto ([`fotos.md`](fotos.md)).
- Abaixo do roteiro, a **lista de fotos**: id · o que mostra · onde aparece · fonte/autor · link · licença.
- Texto para TTS (`narracao.txt`): números falados por extenso ("dezessete por cento"); anos em dígitos ("2008"); "pra" em vez de "para"; reticências para suspense, dois-pontos para pausa curta; nada de símbolos (%, R$) na narração.

## Etapa 4 — aprovação (portão obrigatório)

Mostrar o roteiro **completo** (narração, visual, texto na tela, critérios, fatos e lista de fotos) e esperar o "aprovado". Só então gerar a narração e baixar as fotos. Gerar voz antes da aprovação gasta créditos à toa — já aconteceu e não pode se repetir.

Depois do "aprovado": salvar `brief.yaml` (hook e pergunta escolhidos, data da aprovação), `roteiro.md` e `narracao.txt` na pasta do vídeo.
