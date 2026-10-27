---
name: reel-analogias
description: Cria um Reel/TikTok/Short 3D narrado do @analogias.br a partir de um tema — fatos checados, 5 hooks, 3 perguntas finais, roteiro aprovado, voz ElevenLabs, cenas 3D com QA de área segura e MP4.
---

# Reel 3D narrado — @analogias.br

Produz um vídeo vertical de ~90 s no estilo do canal: narração (voz Sandro Dutra), cenas 3D, legendas palavra a palavra, textos e fontes dentro da área segura. Tudo roda no kit **analogias-studio** (GitHub `samuel-vieira-dev/analogias-studio`); os detalhes de cada etapa estão nos `docs/` do kit.

## Entrada

Só duas coisas vêm do Samuel no pedido:

- **Tema do vídeo** (obrigatório)
- **Referências visuais** (opcional: links, prints, arquivos)

Ele escolhe depois, na etapa 3: o **hook** (5 opções + "Outro") e a **pergunta final** (3 opções + "Outra"). Área segura, estilo, voz, legendas e regras de roteiro **não são perguntados**: são requisitos do kit (`config/layout.json`, `channel.yaml`, `docs/`).

## 0. Preparar o kit

- **No Mac (Claude Code local)**: `cd` para o clone do kit (ex.: `~/analogias-studio`); `git pull`. Se não existir: `git clone https://github.com/samuel-vieira-dev/analogias-studio.git`.
- **Sessão na nuvem**: anexar o repositório (`add_repo`, owner `samuel-vieira-dev`, repo `analogias-studio`, acesso `push`) e clonar como a ferramenta indicar.
- Primeira vez na máquina: `bash tools/setup.sh` (instala dependências e roda o autoteste do QA).
- Ler `CLAUDE.md`, `docs/roteiro.md` e `docs/visual.md` do kit. Criar a lista de tarefas com as etapas abaixo.
- Pasta do vídeo: `videos/<AAAA-MM-DD>-<tema-curto>/` (data de hoje).

## 1. Pesquisa e checagem de fatos

Buscar o tema na web (para assunto do dia, notícias de hoje). Cada número que for para a fala ou para a tela precisa de fonte, de preferência primária e confirmada por uma segunda. Salvar `fatos.md` (fato · dado · fonte com link · status). O que não fechar fica fora da narração. Se houver referências visuais, olhar cada uma agora e anotar o que aproveitar (forma, composição, cor de destaque) — sem copiar personagem, logo ou marca.

## 2. Ângulo da história

Achar o mistério (o que prende), o ponto difícil (onde entra **uma** analogia boa) e a projeção cenográfica ("imagina: você..."). Analogia só onde o assunto exige conhecimento prévio.

## 3. Opções para o Samuel (uma mensagem, e esperar)

- **5 hooks** numerados, cada um de um tipo (notícia urgente + imagem forte · cenário "imagina" · número chocante · contradição · pergunta que cutuca), 8–12 palavras, falados em até 3 s; e **6. Outro (escreva o seu)**.
- **3 perguntas finais** de duas escolhas, objetivas, as duas defensáveis; e **4. Outra (escreva a sua)**.
- Junto, em 2–3 linhas: os fatos principais encontrados e o ângulo proposto.

Se ele escrever o próprio texto, usar como está (só apontar se ferir uma regra).

## 4. Roteiro

Seguir `docs/roteiro.md`: gancho escolhido nos 3 primeiros segundos; história em segunda pessoa que gera curiosidade; projeção cenográfica; clareza de criança; termina na pergunta escolhida. ~240–250 palavras para 90 s. Entregar em tabela **# · narração · cena 3D · texto na tela (zona)** + tabela dos 5 critérios (onde está · atende?) + os fatos usados.

## 5. Aprovação — portão obrigatório

Mostrar o roteiro **completo** e esperar "aprovado" (ou ajustes). **Não gerar voz antes disso.** Depois do ok: salvar `brief.yaml`, `roteiro.md` e `narracao.txt` (texto exato para a voz: números por extenso, "pra", sem símbolos).

## 6. Narração (ElevenLabs)

`creative_generate_speech` com `prompt` = `narracao.txt`, `voice_id` `qPfM2laM0pRL4rrZtBGl`, `model_id` `eleven_v4`, takes padrão (2). Acompanhar com `creative_get_flow_run_status` até terminar e baixar os dois takes para `audio/takes/`. Nunca chamar de novo para "tentar outra vez" (cobra de novo); se falhar, avisar o Samuel.

## 7. Take, ritmo e tempos

```bash
python3 tools/transcribe.py videos/<slug>/audio/takes/*.mp3 --ref videos/<slug>/narracao.txt   # nota de cada take → ESCOLHIDO
python3 tools/tighten.py <take escolhido> videos/<slug>/audio/narration.wav --target 88
python3 tools/transcribe.py videos/<slug>/audio/narration.wav --out videos/<slug>/audio/words.json --ref videos/<slug>/narracao.txt
```

Se o take escolhido trocou ou pulou palavras importantes, avisar antes de seguir.

## 8. Cenas

Escrever `video.json` (duração = fala + 2 s; `cuts`; `overlays` por **zona**, nunca por pixel; `sfx`; `captions.fix`) e `scenes.js` usando `engine/` (ver `docs/visual.md` e o exemplo `videos/2026-10-27-circuit-breaker/`). Regras:

- Cada cena: `anim(t)` só dos objetos → `CAM.pose(envelope(objs, anim, t0, t1), { zone })`; `stage` quando a headline tem texto, `stage-tall` quando não tem.
- Registrar `S.hero`, `S.label` (com `on`), `S.solid` (com `restsOn`), `S.scenery`.
- Números, títulos e regras na `headline`; fontes e avisos em `source` (canto superior direito); CTA na base, depois da fala.
- Texto de objeto impresso nele (`makePlate`); objetos apoiados sem afundar; portas e tampas nunca atravessam nada.
- Reaproveitar `engine/props/`; objeto novo reutilizável vai para lá.

## 9. Mixagem, build, QA e prévia (antes de renderizar)

```bash
python3 tools/mix.py videos/<slug>       # voz + efeitos do video.json, −14 LUFS
python3 tools/build.py videos/<slug>
node tools/qa.cjs videos/<slug>          # precisa terminar em "QA ok"
node tools/preview.cjs videos/<slug>     # folha de contato: OLHAR antes de seguir
```

Corrigir na origem (`scenes.js`, `video.json`, `engine/`) e repetir até o QA passar e a folha de contato estar bonita. O QA não julga estética: olhar composição, tamanho dos objetos, leitura dos textos. Mudou só efeito sonoro? `mix.py` + `build.py` bastam (o QA continua valendo).

## 10. Render e entrega

```bash
bash tools/render.sh videos/<slug>            # nuvem: bash tools/render.sh videos/<slug> looks --detach  (~36 min)
python3 tools/finalize.py videos/<slug>       # out/<slug>.mp4, confere tamanho, duração e volume
```

- Mac: o `finalize` já copia para `~/Movies/reels`.
- Nuvem: enviar o arquivo com SendUserFile e, se o computador estiver ligado ao chat, gravar em `~/Movies/reels` (limite de 30 MB por arquivo: recomprimir com `ffmpeg -c:v libx264 -crf 23 -preset veryfast -c:a copy` se passar).

## 11. Guardar no kit

Commitar a pasta do vídeo (brief, fatos, roteiro, narracao, video.json, scenes.js, words.json — o resto é ignorado pelo git) e qualquer objeto novo em `engine/props/`; push.

## Regras que não se quebram

1. Nada de voz antes do roteiro aprovado.
2. Nada de render sem `QA ok` (o `render.sh` bloqueia).
3. Texto nunca em cima da animação; fonte sempre no canto superior direito; legenda na base da área segura.
4. Nenhum objeto principal cortado; nada atravessando nada.
5. Todo número com fonte em `fatos.md`; tema político contado sem tomar lado; "Não é recomendação de investimento" em tema de dinheiro.
6. Analogia só no ponto difícil — uma boa vale mais que cinco.

## Fechamento

Responder curto: o arquivo (com uma linha de contexto), onde ficou salvo, e um próximo passo se houver. Sem recapitular as etapas.
