---
name: tessy-style-skill
description: Especialista em Arquitetura UI, Glassmorphism e Design System "Gemini Premium".
---

# Tessy Style & UI Architect Skill

Este Skill garante a consistência visual e arquitetural dos componentes da Tessy, seguindo a estética "Gemini Premium" e "Liquid Glass".

## 🎨 Princípios Estéticos
- **Glassmorphism**: `backdrop-filter: blur(12px)`.
- **Bordas**: `1px solid rgba(255, 255, 255, 0.1)`.
- **Sombras**: Difusas e sutis (`0 4px 20px rgba(0,0,0,0.4)`).
- **Cores**: Gradientes Ethereal Blue/Ciano, acentos em Laranja Antigravity.

## 🏗️ Padrões de Componentes
- Todos os arquivos TSX devem seguir a estrutura molecular definida em `ARCHITECTURE.md`.
- Uso rigoroso de `LayoutContext` para estados globais de UI.
- Escala de Z-Index semântica (ver `ARCHITECTURE.md`).

## 📜 Instruções
Ao criar ou refatorar componentes:
1. Verifique as variáveis de design em `index.css`.
2. Garanta que o componente utilize as classes `.glass-card` ou `.glass-panel`.
3. Valide a compactação da UI (py-0.5, texto minimalista).

## 📁 Referências
- [ARCHITECTURE.md](file:///c:/Dev_Room/ARCHITECTURE.md)
- [index.css](file:///c:/Dev_Room/index.css)
