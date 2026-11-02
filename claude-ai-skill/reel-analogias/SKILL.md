---
name: reel-analogias
description: Cria um Reel/TikTok/Short narrado do @analogias.br — pergunta o tema e o estilo de edição (Estilo Analogias v1, 3D com analogia; ou Estilo Explicando Direito, 2D com texto cinético), checa os fatos, propõe 5 hooks, aprova o roteiro, gera a voz no ElevenLabs, monta as cenas com fotos reais creditadas, roda QA automático + revisão cega e entrega MP4, capa e legenda do post; no fim pede o feedback do Samuel e melhora a skill sozinho.
---

# Reel narrado — @analogias.br (porta de entrada)

Esta skill só abre a porta. As instruções de verdade ficam no kit **analogias-studio** (GitHub `samuel-vieira-dev/analogias-studio`) e mudam a cada feedback do Samuel, por isso nunca copiar regras para cá: sempre ler a versão do repositório, atualizada no momento.

1. **Achar o kit e atualizar.**
   - **No Mac**: o clone fica em `analogias-studio/` dentro da pasta da sessão (normalmente `~/Documents/Analogias/analogias-studio`; procurar também em `~/analogias-studio`). Entrar nele e rodar `git pull --rebase`. Se não existir, `git clone https://github.com/samuel-vieira-dev/analogias-studio.git`.
   - **Na nuvem**: anexar o repositório (`add_repo`, owner `samuel-vieira-dev`, repo `analogias-studio`, acesso `push`) e clonar como a ferramenta indicar.
2. **Ler e seguir** `.claude/skills/reel-analogias/SKILL.md` do kit, do começo ao fim, junto com o `CLAUDE.md` dele. Essa é a skill que vale. Se algo aqui contradizer ela, vale a do kit.
3. Comandos rodam de dentro do kit (`cd` para a pasta dele antes de cada `tools/...`).

Nunca pular a última etapa da skill do kit: depois de entregar o vídeo, perguntar ao Samuel o que ele gostou e o que não gostou e aplicar o que ele disser no kit.
