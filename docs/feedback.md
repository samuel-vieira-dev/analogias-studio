# Feedback do Samuel

Registro do que o Samuel gostou e não gostou em cada vídeo entregue, e o que mudou no kit por causa disso. Quem segue a skill **não** precisa ler este arquivo para fazer um vídeo: cada aprendizado já está escrito como regra no lugar certo (`docs/`, `SKILL.md`, `channel.yaml`, `engine/`, `tools/`). Aqui fica o histórico, para saber de onde veio cada regra e não desfazer uma sem querer.

Como preencher: `SKILL.md` → etapa 12.

## Formato

```
### AAAA-MM-DD · <slug do vídeo>
- Gostou: ...
- Não gostou: ...
- Mudou no kit: <arquivo> — <regra nova ou ajustada, em uma linha> (ou "nada: <motivo>")
- Neste vídeo: refeito / ficou como está
```

## Antes deste registro

As regras de 27 a 31/10/2026 (área segura centralizada, realismo, fotos com crédito, legenda para o TikTok, "Direção" com câmera e fundo que reagem à fala, QA só no vídeo em produção) vieram de pedidos do Samuel nas sessões desses dias e já estão nos `docs/` e na `SKILL.md`.

## Registro

<!-- entradas novas aqui, a mais recente primeiro -->

### 2026-11-10 · voz nova (sem vídeo)
- Gostou: —
- Não gostou: acabaram os créditos do ElevenLabs; trocou a voz para a Narrador Analogias (VoiceStudio, local). Testou a velocidade 1,15 e 1,08 para caber em 90 s.
- Mudou no kit: `tools/voice.py` e `channel.yaml → voz` (VoiceStudio, `velocidade` 1,0) · `SKILL.md` (etapa 6) e `docs/ferramentas.md` — a voz nova · `docs/roteiro.md` — 90 s ≈ 215 palavras (era 240–250): acima de 1,0 a voz pulou frases inteiras, então o texto encurta em vez de a voz acelerar.
- Neste vídeo: amostras de `2026-11-06-empreender-brasil`, `2026-11-06-split-payment` e `2026-11-07-censura-ditadura-hoje` a 1,0; os três roteiros têm 248–253 palavras (saem com 98–112 s).

### 2026-11-04 · 2026-11-03-impeachments-brasil
- Gostou: — (só comentou a capa)
- Não gostou: "essas capas não estão boas; preciso que as capas de vídeo sejam sempre centralizadas" — confirmado: título + foto/elemento como um bloco centralizado na altura (a capa tinha o título no alto e a foto descendo até o pé).
- Mudou no kit: `config/layout.json → cover.block` (center_y 960, gap 40, tol 40, min_top 300; title/stage viram tamanhos máximos, sem y fixo) · `tools/capa_direito.cjs` — mede o título, encaixa o elemento do palco logo abaixo e centraliza o bloco (foto-cheia encolhe se não couber); reprova fora do centro · `tools/capa.cjs` — o mesmo no v1: título medido primeiro, a câmera enquadra o 3D duas vezes (mede, depois posiciona sob o título), cartão de foto no bloco; reprova fora do centro · `SKILL.md` (etapa 10), `docs/ferramentas.md` → "Capa", `docs/explicando-direito/visual.md` — a regra nova; `?` dentro dos colchetes do título 2D.
- Neste vídeo: capa refeita com a regra nova (`finalize.py --post-only`).

### 2026-11-02 · estilos de edição (pedido do Samuel, sem vídeo)
- Pediu: perguntar o tema e o estilo de edição ao criar cada vídeo; chamar a edição atual de "Estilo Analogias v1"; criar o "Estilo Explicando Direito" a partir de 3 vídeos do @descomplicaodireito_.
- Mudou no kit: `SKILL.md` — etapa 0 pergunta tema e estilo, seção "Estilo Explicando Direito" · `docs/estilos.md` — os dois estilos lado a lado · `docs/explicando-direito/` — engenharia reversa, roteiro e visual · `channel.yaml → estilos` · `engine2d/` + `tools/build_direito.py`, `qa_direito.cjs`, `capa_direito.cjs` (build, QA e capa reconhecem `video.json → estilo`) · `tools/mix.py` — trilha do kit em loop · `tests/qa-pega-erros-direito/` no autoteste · `videos/exemplo-explicando-direito/` (40 s da narração das bets montados no 2D, só para testar).

### 2026-11-01 · 2026-11-01-castracao-quimica
- Gostou: —
- Não gostou: o texto da capa pequeno; difícil de ler na grade do perfil.
- Mudou no kit: `config/layout.json → cover` — faixa do título de 830 × 260 para 1000 × 600 px (y 300–900), palco da capa em y 920–1600, letra de 130 a 220 px · `tools/capa.cjs` — quebra o título em até 4 linhas, fica com a quebra de letra maior e reprova abaixo de 130 px (a capa deste vídeo saiu com ~70 px) · `SKILL.md` (etapa 10) e `docs/ferramentas.md` → "Capa" — a regra nova.
- Neste vídeo: ficou como está (capa pode ser refeita com `--post-only` se o Samuel pedir).

### 2026-10-31 · 2026-10-31-master-lula-bolsonaro
- Gostou: o vídeo no geral ("ficou ótimo").
- Não gostou: planos de fundo pouco interessantes; legendas um pouco pequenas.
- Mudou no kit: `config/layout.json` — legenda de 58 para 72 px, até 14 caracteres, faixa `caption` y 1346–1476 (QA deste vídeo com a legenda nova: ok) · `docs/visual.md` → "Plano de fundo" — todo plano mostra um lugar com luz visível, segunda cor e três camadas, interesse acima e abaixo do herói (a regra antiga "fundo mais escuro e com menos contraste" saiu) · `engine/props/sets.js` — `makeOfficeSet` e peças de cenário · `docs/qa.md` — a revisão cega dá nota ao fundo de cada quadro.
- Neste vídeo: ficou como está (pedido do Samuel).
