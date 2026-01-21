---
name: context-memory-skill
description: Gerenciador de Sincronia Neural e Memória Contextual entre Agentes.
---

# Context Memory Skill: O Elo Neural

Este skill garante que a Tessy e seus sub-agentes mantenham uma consciência compartilhada do projeto, evitando redundâncias e garantindo consistência.

## 🛠️ Funções Principais
1. **Sincronia na Partida**: Assim que spawnado, o agente deve ler o `NEURAL_CACHE.md`.
2. **Atualização de Estado**: Ao concluir marcos ou descobrir informações críticas, o agente deve atualizar a seção `KNOWLEDGE_CACHE`.
3. **Escuta de Sinais**: Verificar a seção `AGENT_SIGNALS` por gatilhos deixados por outros agentes.

## 📜 Instruções de Operação
Sempre que este skill for invocado:
- Leia o arquivo `C:\Users\rabel\.gemini\antigravity\brain\14065600-09a1-4809-b50a-b2b128d8e0f3\NEURAL_CACHE.md`.
- Valide se sua tarefa atual conflita ou complementa o `CURRENT_STATE`.
- Ao final de sua missão, emita um sinal ou atualize o progresso.

## 📁 Referências
- [NEURAL_CACHE.md](file:///C:/Users/rabel/.gemini/antigravity/brain/14065600-09a1-4809-b50a-b2b128d8e0f3/NEURAL_CACHE.md)
