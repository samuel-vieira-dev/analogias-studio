# Roteiro — Estilo Explicando Direito

Vale para os vídeos com `estilo: explicando-direito`. De onde veio cada número: [`referencia.md`](referencia.md). O que não muda em relação ao Estilo Analogias v1: pesquisa e checagem de fatos (`docs/roteiro.md` → "Etapa 1"), fotos com crédito ([`../fotos.md`](../fotos.md)), aprovação antes de gastar crédito, tema político contado sem tomar lado.

## As regras

1. **Gancho = a notícia, curta e forte, nos 3 primeiros segundos.** Uma frase de 6 a 12 palavras com **nome conhecido + ação forte + prazo ou escala** ("Jair Bolsonaro pode ser solto já em 2027."). Pode ser uma afirmação que o resto do vídeo prova com dados ("…foi uma aberração política"), desde que os dados provem mesmo; em tema político, a afirmação é sobre o fato (número, prazo, regra), nunca uma opinião sobre a pessoa.
2. **Narrador em 3ª pessoa, tom de jornal que explica.** Sem "você", sem "imagina", sem analogia. Quem fez o quê, por quê, com base em qual lei, e o que acontece agora.
3. **A revelação no meio.** O formato cresce com uma virada: "O discurso oficial é X. Porém, o verdadeiro motivo é Y." / "Embora muita gente ache que foi X, …". Só quando houver fonte para os dois lados da frase; senão, a virada é um número que surpreende.
4. **Direito explicado em uma frase cada.** Todo instituto jurídico que aparecer (indulto, anistia, medida cautelar, MP, inelegibilidade) ganha uma frase simples na fala ("A anistia apaga o próprio crime; o indulto perdoa a pena, mas o crime continua") e a lei/artigo **na tela** (documento ou cartão: "CPP · ART. 320").
5. **Frases curtas ligadas por conectivos**: porém, ou seja, na prática, por isso, então, embora, além disso, é aí que entra, enquanto. Eles são o ritmo do formato: um a cada duas ou três frases.
6. **Números sempre com contexto**: de quanto para quanto, em quanto tempo ("de 54 milhões para 64 milhões em 21 dias"). Um número por frase.
7. **Fim seco, sem CTA nem pergunta no vídeo.** A última frase é o fato mais forte ou a consequência ("…sem poder se candidatar em 2030."). O vídeo recomeça no gancho sozinho. A pergunta de duas escolhas vai **só na legenda do post** (`brief.yaml → pergunta_final`, `tools/post.py`).

Tom: urgente na forma, rigoroso no conteúdo. Todo número com fonte em `fatos.md`.

## Tamanho e ritmo

- **55 a 75 s**, ~**180–230 palavras** (3,2 palavras/s depois do aperto; referência 3,11–3,26).
- Estrutura que funciona: gancho → quem/o quê (nomes e cargos) → contexto em números → a revelação → o mecanismo jurídico (1–2 institutos, comparados) → o que acontece agora → fim seco.
- `narracao.txt` como no v1: números por extenso, "pra", sem símbolos; frases curtas, quase sem reticências (pausa longa vira aperto).

## Etapa 3 — opções para o Samuel (uma mensagem)

- **5 hooks** numerados, cada um de um tipo, todos com a notícia dentro: notícia direta (nome + ação + prazo) · número chocante · afirmação forte que o vídeo prova · contradição ("o mesmo governo que… agora…") · consequência ("pode ficar inelegível até 2030"); e **6. Outro (escreva o seu)**.
- **3 perguntas para a legenda do post** (duas escolhas, as duas defensáveis) e **4. Outra (escreva a sua)**. Avisar que elas não entram no vídeo.
- Em 2–3 linhas: os fatos principais e a virada proposta (regra 3).

## Etapa 4 — o roteiro

Entregar em tabela **# · narração · texto na tela · visual**, onde:

- **texto na tela** = a própria narração quebrada em blocos de 5–9 palavras (2–3 linhas; a linha grande marcada com `#` e a palavra-chave entre colchetes, ver [`visual.md`](visual.md) → "Texto"). Um bloco por linha da tabela.
- **visual** = o elemento do palco e quando ele entra, pelo trecho da fala ("documento CPP art. 320 · em 'medida cautelar'"); foto para pessoa citada (primeira menção), lugar e prova; cartão, documento ou gráfico para número, lei e mecanismo.

Depois da tabela: a checagem das 7 regras (onde está · atende?), os fatos usados e a lista de fotos (como no v1).
