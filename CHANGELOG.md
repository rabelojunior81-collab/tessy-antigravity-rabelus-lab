
# Changelog - Tessy Alpha

## [v3.1.0-STABLE] - 2024-05-25
### Final Polish & Cleanup
- **Responsiveness**: Full support for Mobile and Tablet. Sidebar becomes a drawer, viewers are full-screen overlays on small screens.
- **Cleanup**: Deleted legacy components (`HistorySidebar.tsx`, `TemplateLibraryModal.tsx`, `ProjectSwitcher.tsx`, `GitHubPanel.tsx`, `Canvas.tsx`, `FactorPanel.tsx`).
- **Optimization**: Integrated `React.memo` across core components to reduce re-renders.
- **UI/UX**: Added collapsible animation to Controllers, improved terminal scroll, and refined the CoPilot messaging interface.
- **Refinement**: Consolidated `generateUUID` into `dbService.ts`.

## [v3.0.0-ANTIGRAVITY] - 2024-05-20
### Architectural Reboot
- **New Layout**: Three-pane modern terminal-style layout (Sidebar, Canvas, CoPilot).
- **GitHub Viewer**: Native file tree explorer for synced repositories.
- **Enhanced Terminal**: Functional terminal component for system status.
- **Contextual Viewers**: Integrated history, library, and project management into the sidebar drawer.

## [v2.5.0] - 2024-04-10
- Initial Gemini 3 implementation.
- Introduced Grounding via Google Search.
