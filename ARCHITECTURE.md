# Arquitetura Molecular e Camadas de UI - Tessy v3.2.1

Este documento detalha as mudanças estruturais e a padronização estética realizada na fase de modernização do projeto.

## 🏗️ Gestão de Estado Centralizada

Anteriormente, estados de UI como `selectedProjectId` e `selectedLibraryItem` eram distribuídos de forma fragmentada, resultando em "prop drilling" excessivo.

### LayoutContext & useLayout
A infraestrutura de estado foi movida para o `LayoutContext`, permitindo que qualquer componente da aplicação acesse ou modifique o estado global da interface sem passar por múltiplos níveis de props.

**Estados Centralizados:**
- `activeViewer`: Controla qual módulo da sidebar está aberto.
- `selectedFile`: Conteúdo do arquivo vindo do GitHub para o Viewer.
- `selectedProjectId`: ID do projeto/protocolo sendo visualizado.
- `selectedLibraryItem`: Template ou item da biblioteca selecionado.
- `dimensionState`: Larguras e alturas de painéis (persistidos em localStorage).

---

## 🎨 Sistema de Camadas (Atomic Z-Index)

Para eliminar o "Z-Index Warfare", implementamos uma escala semântica no `index.html` (Tailwind Config) e variáveis CSS root.

### Escala Padronizada:
- `z-base` (0): Nível padrão.
- `z-docked` (10): Elementos fixos na tela.
- `z-dropdown` (100): Menus e Tooltips.
- `z-sticky` (200): Headers, Footers e Overlays leves.
- `z-overlay` (300): Sidebar (mobile) e Backdrop.
- `z-modal` (400): Todos os diálogos e janelas de ação central.
- `z-tooltip` (500): Mensagens flutuantes de ajuda.
- `z-max` (999): Notificações críticas de erro.

---

## 🚀 Fluxo de Execução Técnica

### Servidor de Desenvolvimento
O projeto agora utiliza o **Vite** para transpilação on-the-fly de TypeScript e React.

**Comandos:**
- `npm run dev`: Inicia o servidor local na porta 3000.
  
### Gestão de Segredos (Local-First Security)

Para garantir a portabilidade e segurança, implementamos um serviço de criptografia centralizado.

- **CryptoService:** Utiliza a Web Crypto API (`AES-GCM` com `PBKDF2`) para criptografar tokens antes de salvá-los no IndexedDB.
- **Portabilidade:** Chaves de API (Gemini e GitHub) não são mais dependentes de variáveis de ambiente de build. O sistema detecta a ausência de chaves e solicita ao usuário via modal, salvando-as de forma persistente e segura no navegador.

---
*Documento atualizado molecularmente em 02/01/2026 seguindo o Rabelus Codex.*
