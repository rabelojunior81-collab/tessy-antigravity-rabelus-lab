# Tessy Stable v3.2 🧪 by Rabelus Lab

Tessy is an advanced intent-driven AI assistant powered by **Google Gemini**, designed specifically for complex project workflows, GitHub synchronization, and precision prompt engineering.

![Tessy Interface](https://via.placeholder.com/1200x600/0a0a0a/10b981?text=Tessy+Antigravity+v3.2)

## 🚀 Key Features

- **Multimodal Context**: Seamlessly attach images, documents, audio, and video to your AI conversations.
- **GitHub Sync**: Direct repository integration. Explore files, search code, and get AI insights directly on your source code.
- **Dynamic Controllers**: Precision-tune AI responses with Professional Toggles, Detail Sliders, and System Instructions.
- **Active Grounding**: Real-time web searching via Google Search to prevent hallucination and provide up-to-date facts.
- **Project-Centric**: Organize work into isolated "Protocols" (Projects) with persistent local storage via Dexie (IndexedDB).
- **Embedded Terminal**: Lightweight terminal for quick system checks and future automation.
- **Brutalist Antigravity Design**: A modern, dark-themed UI focused on productivity and technical aesthetics.

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript
- **Bundler**: Vite 7
- **Intelligence**: Google Gemini 2.5/3 (Flash & Pro)
- **Database**: Dexie.js (IndexedDB)
- **Styling**: Tailwind CSS + Glassmorphism
- **Icons**: Lucide React
- **Export**: jsPDF, Markdown, HTML

## 📂 Project Structure

- `src/components/layout`: Core layout components (Sidebar, CentralCanvas, CoPilot, etc.)
- `src/components/viewers`: Sidebar modules (History, Library, Projects, GitHub)
- `src/services`: API connectors (Gemini, GitHub) and Database logic
- `src/contexts`: Global state management for Chat and Layout

Ver detalhamento em [ARCHITECTURE.md](./ARCHITECTURE.md).

## ⌨️ Shortcuts

- `Enter`: Send message (in CoPilot)
- `Shift + Enter`: New line
- `Cmd/Ctrl + K`: Focus terminal (upcoming)

## 🛠️ Setup

1. Configure sua `GEMINI_API_KEY` em um arquivo `.env` na raiz do projeto.
2. Execute `npm install` e `npm run dev`.
3. Para integração com GitHub, forneça um Personal Access Token (PAT) com escopo `repo` dentro da interface do aplicativo.

---
*Developed with precision by **Rabelus Lab**.*