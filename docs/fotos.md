# Fotos reais

O 3D continua sendo a linguagem do canal. A foto entra onde quem assiste se pergunta **"como é isso?"** — o rosto de quem está sendo citado, o avião, o prédio, o documento. A pergunta que decide cada plano: **qual formato faz a pessoa entender o quadro mais rápido?**

## Foto ou 3D

| Use foto | Use 3D |
| --- | --- |
| Pessoa real citada (na primeira menção: rosto + nome + cargo) | Mecanismo, conceito, regra, número |
| Objeto, lugar ou evento real e específico que dá curiosidade (o avião usado, o prédio, a sala do tribunal) | A analogia do vídeo |
| Prova: documento, mandado, manchete | Cenário hipotético ("imagina: você...") |
| | Passado sem foto boa; foto que seria chocante (violência, ferido, criança identificável) |

Misturar é o melhor dos dois: a foto mostra **o quê**, o 3D explica **como** (a foto do avião no porta-retrato → o 3D do mapa com a rota). Em média, 3 a 6 fotos num vídeo de 90 s.

## Três estilos

| Estilo | Quando | Como (`engine/props/media.js`, overlay `photo`) |
| --- | --- | --- |
| **Quadro de investigação** | várias pessoas ou fatos ligados: quem é quem, quem levou a quem, cronologia | `makeCorkBoard` + `makePhotoPrint` (polaroid com legenda e alfinete) + `dropPrint` + `makeString` (fio vermelho) |
| **Porta-retrato no palco** | uma foto que é o assunto do momento (o avião, um lugar, um documento) | `makePhotoFrame` (moldura sobre um pedestal com plaquinha de nome) |
| **Cartão 2D** | rosto + nome + cargo na primeira menção de uma pessoa; trocas rápidas entre pessoas | overlay `{ "kind": "photo", "media": "<id>", "name": "...", "role": "..." }` na zona `stage` |

Nada fica parado: a polaroid cai girando e é presa, o fio vermelho se desenha, a moldura gira e pousa, o cartão entra inclinado e flutua, e **toda foto aproxima devagar** (zoom de 10–16% no plano inteiro: `zoom(k)` nos objetos 3D, automático no cartão). A câmera nunca para. O QA reprova 2 s sem nada se mexer (`plano_parado`).

## De onde vêm as fotos

Decidido pelo Samuel em 28/10/2026: **fontes livres/oficiais e imprensa, sempre com crédito na tela.**

1. **Primeiro, as oficiais e livres**: Agência Brasil (EBC), Agência Senado, Agência Câmara, Flickr do Planalto e dos ministérios, STF, TSE, Polícia Federal, gov.br, Wikimedia Commons (conferir a licença do arquivo).
2. **Imprensa** (Reuters, AFP, AP, Folha, Estadão, G1, UOL...) com crédito do fotógrafo/veículo, quando não houver foto oficial equivalente. Existe risco de denúncia por direito autoral: na dúvida entre duas fotos parecidas, a oficial ganha.

Nunca:

- imagem gerada por IA de pessoa, lugar ou fato real (nem "ilustrativa");
- foto editada ou montada (trocar rosto, fundo, contexto) — só recorte e zoom;
- foto de banco de imagens com marca d'água (Getty, Shutterstock, Alamy): é licença paga;
- foto de rede social pessoal de quem não é figura pública; criança identificável; violência explícita.

Qualidade: lado menor com **900 px ou mais** para porta-retrato e cartão grande; 500 px dá para uma polaroid no quadro. O build avisa (`photos_small`) e o QA reprova foto esticada além dos próprios pixels (`foto_em_baixa_resolucao`). Preferir o arquivo original da página da agência (maior resolução), nunca o print da tela.

## Fluxo no vídeo

1. **Pesquisa** (etapa 1): anotar as fotos candidatas numa seção **Fotos** do `fatos.md`: id · o que mostra · página de origem (link) · autor/veículo · licença.
2. **Roteiro**: a coluna **visual** diz, plano a plano, `3D: ...` ou `foto: <id> (quadro | porta-retrato | cartão)`.
3. **Aprovação**: a lista de fotos vai junto com o roteiro. Aprovado = pode baixar.
4. **Baixar** para `videos/<slug>/midia/<id>.jpg` e registrar em `video.json`:

   ```json
   "media": {
     "aviao": { "file": "midia/aviao.jpg", "credit": "Polícia Federal", "url": "https://...", "focus": [0.5, 0.45] }
   }
   ```

   - `credit`: como aparece na tela, sem o "Foto:" (ex.: `Marcelo Camargo/Agência Brasil`).
   - `url`: a página de onde a foto veio.
   - `focus`: ponto (x, y de 0 a 1, a partir do canto superior esquerdo) que nunca sai do recorte — o rosto.
5. **Crédito na tela**: um overlay `source` com `Foto: <credit>` (ou `Fonte: G1 · Foto: <credit>`; várias: `Fotos: A; B`) durante todo o tempo em que a foto aparece. O QA reprova foto sem o crédito visível (`foto_sem_credito`).
6. `midia/` fica fora do git (peso e direito autoral); `video.json` guarda link e crédito para baixar de novo.

## Código

```js
// Quadro de investigação: polaroids caem e são presas; fio vermelho de alfinete a alfinete.
const board = makeCorkBoard({ w: 4.6, h: 5.6 }); S.add(board.group);   // fundo: não registrar
const pr = makePhotoPrint("flavio", { w: 1.95, caption: "FLÁVIO" }); board.group.add(pr.group);
const rest = { pos: board.point(-0.36, 0.52).add(new V3(0, 0, 0.01)), rotZ: -0.07 };
S.hero(pr.group, "foto flávio", { when: (t) => t > 12.8 });
// anim(t): dropPrint(pr, t, 12.0, rest); pr.zoom(1 + 0.12 * lin(t, 12.0, 20.0));
// fio: const s = makeString(pontoA, pontoB); board.group.add(s.mesh); ... s.setProgress(lin(t, 14.2, 14.9));

// Porta-retrato no palco: gira e pousa; zoom lento.
const fr = makePhotoFrame("aviao", { w: 2.6, name: "JATO PREFIXO PR-XXX" }); S.add(fr.group);
S.hero(fr.group, "porta-retrato", { when: (t) => t > 30.9 });
// anim(t): fr.frame.rotation.y = 1.5 * (1 - eOut(lin(t, 30.1, 30.8))); popIn(fr.group, t, 30.05, 0.45); fr.zoom(1 + 0.15 * lin(t, 30.3, 34.5));
```

```json
{ "id": "ph-flavio", "kind": "photo", "media": "flavio", "name": "Flávio Bolsonaro", "role": "Senador (PL-RJ)", "from": 12.0, "to": 14.6 },
{ "id": "src-flavio", "kind": "source", "text": "Foto: Waldemir Barreto/Agência Senado", "from": 12.0, "to": 14.6 }
```

- O quadro de cortiça é **fundo** (como uma parede): não registre; registre cada polaroid como `S.hero`.
- Cartão 2D ocupa o palco: no 3D por trás, só fundo (sem herói registrado nesse tempo), senão o QA acusa `texto_sobre_animacao`.
- Legenda da polaroid curta (1–2 palavras); nome completo vai na plaquinha do porta-retrato ou no cartão.
