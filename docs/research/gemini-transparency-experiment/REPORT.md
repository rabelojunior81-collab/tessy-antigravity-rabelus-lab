# Relatório de Experimento: Transparência da IA e Cadeia de Pensamento (CoT)

**Data**: 04 de Janeiro de 2026
**Status**: Depreciado / Arquivado
**Objetivo Original**: Implementar uma interface de "pensamento" estilo Gemini, onde a IA detalha seu raciocínio antes da resposta final, com carregamento progressivo (streaming).

## 1. O que foi tentado
- **Engenharia de Prompt**: Injeção de protocolos rigorosos (`<thought>`) para forçar o modelo Gemini a gerar blocos de raciocínio.
- **Streaming de Resposta**: Implementação de `generateContentStream` do SDK Gemini para exibir o texto conforme era gerado.
- **UI Progressiva**: Criação do componente `ReasoningChain` para mostrar o processo mental com ícones animados e botões de expansão.
- **Parser em Tempo Real**: Lógica no frontend para detectar tags `<thought>` incompletas durante o streaming.

## 2. Erros e Frustrações Encontrados
- **Incompatibilidade de SDK**: O projeto utiliza uma versão/ambiente do SDK (@google/genai) que apresentou comportamentos inconsistentes com o iterador de stream (`TypeError: chunk.text is not a function`).
- **Instabilidade no Tool Calling**: O streaming entrava em conflito com o loop de chamadas de funções (GitHub Tools), causando falhas onde o sistema tentava processar ferramentas antes de consolidar o texto.
- **Perda de Qualidade na Resposta**: A insistência no bloco `<thought>` as vezes tornava a resposta principal mais lenta ou truncada em certos modelos (Flash).
- **Complexidade de Sync**: Sincronizar o estado do React (`ChatContext`) com chunks de texto em tempo real gerou atrasos perceptíveis e "saltos" na interface que degradaram a experiência do usuário.

## 3. Motivo da Desistência
A busca pela "transparência total" acabou sacrificando a **estabilidade central do produto**. O excesso de lógica de parser e a fragilidade do streaming no ambiente atual tornaram o sistema propenso a falhas críticas (`Erro ao gerar resposta final`).

## 4. Aprendizados para o Futuro
- **Cadência vs. Streaming Real**: Para muitos usuários, um efeito "typewriter" controlado no frontend (como o implementado em `TypewriterText.tsx`) oferece uma sensação de interação humanizada superior ao streaming real e instável.
- **Injeção de Sistema**: Instruções de pensamento devem ser tratadas como "System Instructions" puras no nível do modelo, e não injetadas manualmente no prompt do usuário, para evitar quebras de contexto.
- **Consolidação de Resposta**: Sempre garanta um fallback de resposta completa caso o stream falhe.

## 5. Arquivos Arquivados
- `docs/research/gemini-transparency-experiment/ReasoningChain.tsx`: Componente visual original do histórico de raciocínio.
- `docs/research/gemini-transparency-experiment/Streaming_Logic.bak`: Lógica de streaming removida de `service.ts`.

---
*Assinado: Tessy Assistant (Kernel v3.2)*
