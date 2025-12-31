# Checklist de Funcionalidades - Refatoração Antigravity

Este documento serve como guia de validação para garantir que a refatoração completa do layout para o estilo **Antigravity** preserve todas as funcionalidades críticas do núcleo **Tessy**.

## 🛠️ FUNCIONALIDADES CRÍTICAS
- [ ] **Chat com Tessy**: Enviar mensagens, receber respostas e suporte a streaming/interação em tempo real.
- [ ] **Histórico de Conversas**: Salvar, carregar, buscar e deletar registros via Dexie (IndexedDB).
- [ ] **Biblioteca de Prompts**: Criar, editar, deletar e inserção rápida de templates no chat.
- [ ] **Sistema de Projetos**: Criar, alternar entre protocolos, deletar e visualização clara do projeto ativo.
- [ ] **GitHub Sync**: Conexão com repositórios, autenticação via Personal Access Token (PAT) e desconexão segura.
- [ ] **Painel de Controladores**: Ajustes de Tom Profissional, seleção de Modelo (Flash/Pro), Formatação, Temperatura e Max Tokens.
- [ ] **Gestão de Temas**: Alternância fluida entre temas Claro e Escuro com persistência de estado.
- [ ] **Upload de Arquivos**: Suporte para anexo de múltiplos arquivos (Imagens, PDFs, Código, Áudio, Vídeo) ao contexto da IA.
- [ ] **Contexto Adicional**: Campo de texto para instruções de sistema ou contexto extra persistente.

## 🔗 INTEGRAÇÕES
- [ ] **Google Gemini API**: Garantir que as chamadas aos modelos `gemini-3-flash-preview` e `gemini-3-pro-preview` permaneçam estáveis.
- [ ] **GitHub API**: Operações de leitura de arquivos, busca de código, listagem de diretórios e commits.
- [ ] **Dexie (IndexedDB)**: Integridade e migração de dados locais, garantindo que o banco `TessyDB` não sofra perda de dados.

## 🧠 REGRAS ANTI-ALUCINAÇÃO (NÚCLEO TESSY)
- [ ] **Validação de Contexto**: O sistema deve continuar priorizando os arquivos anexados e o histórico sobre o conhecimento geral.
- [ ] **Grounding Ativo**: A ferramenta `googleSearch` deve ser acionada corretamente quando a busca em tempo real estiver ativada.
- [ ] **Instruções de Sistema**: Preservar a identidade e as regras de restrição da Tessy (não inventar links, admitir desconhecimento).

## 🛠️ FERRAMENTAS GITHUB (7 TOOLS)
As seguintes ferramentas de função (Function Calling) devem permanecer funcionais:
- [ ] `read_github_file`: Leitura de conteúdo de arquivos específicos.
- [ ] `list_github_directory`: Navegação na estrutura de pastas.
- [ ] `search_github_code`: Localização de termos dentro do repositório.
- [ ] `get_github_readme`: Extração rápida da documentação principal.
- [ ] `list_github_branches`: Visualização de ramos de desenvolvimento.
- [ ] `get_commit_details`: Análise técnica de mudanças específicas.
- [ ] `get_repository_structure`: Mapeamento visual da árvore do projeto.

## ✅ STATUS DE VALIDAÇÃO POR FASE
- [x] **Fase 1: Preparação**: Checklist criado, branch de refatoração estabelecida.
- [ ] **Fase 2: Estrutura Base**: Implementação do novo shell Antigravity (Glassmorphism & Brutalism).
- [ ] **Fase 3: Migração de Lógica**: Reconexão dos serviços `geminiService`, `dbService` e `githubService`.
- [ ] **Fase 4: Testes de Regressão**: Validação de cada item desta lista.

---
*Documento gerado pelo Núcleo de Engenharia do Rabelus Lab.*