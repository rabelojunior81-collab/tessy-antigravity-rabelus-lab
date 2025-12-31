# Changelog - Tessy Alpha

## [v3.1.5-POLISH] - 2024-05-30
### Refinement & Production Prep
- **Visual Overhaul**: Standardized "Brutalist Antigravity" design with sharper borders, flat shadows, and consistent spacing.
- **Enhanced Typography**: Improved Markdown rendering with specialized prose styles for better code and header readability.
- **UI Micro-interactions**: Added subtle scale animations to buttons, polished terminal response times, and refined modal transitions.
- **Responsive Core**: Completely audited mobile views. Sidebars now behave as drawers with professional backdrops.
- **Loading Sequence**: Added a branded boot sequence with the tessy logo and system status indicators.
- **Performance**: Optimized rendering cycles using `React.memo` on all static and large layout components.
- **Bug Fixes**: Corrected z-index conflicts between resize handles and modal overlays.

## [v3.1.0-STABLE] - 2024-05-25
### Final Layout Polish
- **Responsiveness**: Full support for Mobile and Tablet. Sidebar becomes a drawer, viewers are full-screen overlays on small screens.
- **Cleanup**: Deleted legacy components (`HistorySidebar.tsx`, `TemplateLibraryModal.tsx`, etc.).
- **Optimization**: Integrated `React.memo` across core components to reduce re-renders.

## [v3.0.0-ANTIGRAVITY] - 2024-05-20
### Architectural Reboot
- **New Layout**: Three-pane modern terminal-style layout (Sidebar, Canvas, CoPilot).
- **GitHub Viewer**: Native file tree explorer for synced repositories.
- **Enhanced Terminal**: Functional terminal component for system status.

---
*Protocolo Finalizado por Rabelus Lab Core.*