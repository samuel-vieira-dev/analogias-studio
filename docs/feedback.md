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

### 2026-10-31 · 2026-10-31-master-lula-bolsonaro
- Gostou: o vídeo no geral ("ficou ótimo").
- Não gostou: planos de fundo pouco interessantes; legendas um pouco pequenas.
- Mudou no kit: `config/layout.json` — legenda de 58 para 72 px, até 14 caracteres, faixa `caption` y 1346–1476 (QA deste vídeo com a legenda nova: ok) · `docs/visual.md` → "Plano de fundo" — todo plano mostra um lugar com luz visível, segunda cor e três camadas, interesse acima e abaixo do herói (a regra antiga "fundo mais escuro e com menos contraste" saiu) · `engine/props/sets.js` — `makeOfficeSet` e peças de cenário · `docs/qa.md` — a revisão cega dá nota ao fundo de cada quadro.
- Neste vídeo: ficou como está (pedido do Samuel).
