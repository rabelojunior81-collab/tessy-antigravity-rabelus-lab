# Research Log Rabelus Lab

## Registro de Experimentos Técnicos

---

### Experimento 01: Chain of Thought & Streaming (Gemini SDK)
- **Data**: 03/01/2026 - 04/01/2026
- **Hipótese**: Implementar streaming real com blocos `<thought>` aumentaria a transparência e a percepção de inteligência.
- **Resultado**: FALHA (Instabilidade).
- **Causas**: Conflitos de SDK (`chunk.text is not a function`), desincronização entre tool calling e streaming, degradação da UI com "saltos" de conteúdo.
- **Ação**: Reversão completa via TSP. O código foi arquivado em `docs/research/`.

### Experimento 02: Cadência Visual Humanizada (Typewriter)
- **Data**: 04/01/2026 (Iniciando)
- **Hipótese**: Simular a digitação no frontend em vez de usar streaming real provê uma experiência mais estável e visualmente agradável (premium).
- **Status**: Pendente de implementação.

---
*Escrito pelo Agente Scribe (via Tessy-DEV)*
