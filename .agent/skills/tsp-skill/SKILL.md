---
name: tsp-skill
description: Tessy Safety Protocol (TSP) - Versionamento e Gestão de Riscos para Desenvolvimento Agêntico.
---

# Tessy Safety Protocol (TSP) Skill

Este "Skill" formaliza o protocolo de segurança do Rabelus Lab para garantir que toda alteração de código seja rastreável, segura e passível de rollback instantâneo.

## 🛠️ Capacidades
- **Pre-flight Check**: Verifica a limpeza do ambiente antes de iniciar.
- **Experiment Branching**: Cria branches isoladas para novas features.
- **Atomic Commits**: Realiza commits granulares e explicativos.
- **Rollback Seguro**: Descarte de branches instáveis sem afetar a `main`.

## 📜 Instruções de Uso
Sempre que for realizar uma alteração no código do projeto Tessy, este protocolo deve ser invocado:

### 1. Preparação
Execute `git status` para garantir que a branch `main` está limpa.

### 2. Isolamento
Crie uma branch: `git checkout -b feature/[funcionalidade]`.

### 3. Implementação e Commit
Para cada sub-tarefa concluída, faça um commit:
`git commit -am "TSP: [Sub-tarefa] concluída"`

### 4. Finalização
Se validado:
`git checkout main && git merge feature/[funcionalidade] && git branch -d feature/[funcionalidade]`

Se rejeitado:
`git checkout main && git branch -D feature/[funcionalidade]`

## 📁 Recursos Relacionados
- [safe-development.md](file:///c:/Dev_Room/.agent/workflows/safe-development.md)
