---
description: Tessy Safety Protocol (TSP) - Versionamento e Gestão de Riscos para Desenvolvimento Agêntico
---

Este workflow define rigorosamente como a Tessy (IA) deve gerenciar alterações no código para garantir estabilidade e permitir reversões instantâneas em caso de falhas catastróficas.

## 1. Fase de Preparação (Pre-flight)
// turbo
1. **Verificar Limpeza**: Execute `git status` para garantir que não há alterações pendentes na branch estável (`main`). Caso haja, limpe ou commite antes de avançar.
2. **Criar Branch de Experimento**: Antes de qualquer implementação complexa, crie uma branch isolada:
   `git checkout -b feature/[nome-da-funcionalidade]`

## 2. Fase de Implementação Isolada
1. Realize as modificações na branch de feature.
2. Faça commits atômicos (pequenos e explicativos) para cada sub-etapa concluída:
   `git commit -am "TSP: [Sub-tarefa X] concluída"`

## 3. Fase de Validação e Homologação
1. **Teste Automatizado**: Use o `browser_subagent` para validar a UI.
2. **Teste de Build**: Execute `npm run build` (se existir) para garantir que não há erros de tipagem ou exportação.
3. **Draft de Resposta**: Mostre o resultado para o usuário e peça validação.

## 4. Integração ou Descarte (Commit or Rollback)
### Cenário A: Sucesso e Validação do Usuário
// turbo
1. Volte para a branch estável: `git checkout main`
2. Mescle a feature: `git merge feature/[nome-da-funcionalidade]`
3. Remova a branch temporária: `git branch -d feature/[nome-da-funcionalidade]`

### Cenário B: Falha, Instabilidade ou Rejeição do Usuário
// turbo
1. **Rollback Total**: Volte instantaneamente para a branch estável: `git checkout main`
2. **Higienização**: Descarte a branch problemática: `git branch -D feature/[nome-da-funcionalidade]`
3. **Análise de Erro**: Registre o motivo da falha no `CHANGELOG.md` ou em um relatório de pesquisa antes de tentar novamente.

## 5. Auditoria Holística
Após cada merge, execute uma busca global por "imports" ou "nomes de componentes" que possam ter sobrado do experimento falho para garantir que o projeto está "higienizado".
