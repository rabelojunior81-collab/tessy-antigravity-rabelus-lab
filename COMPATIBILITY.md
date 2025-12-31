# Matriz de Compatibilidade - Tessy

O sistema Tessy foi testado para garantir funcionamento nos navegadores modernos mais utilizados.

## Navegadores Suportados

| Navegador | Versão Mínima | Status | Notas |
| :--- | :--- | :--- | :--- |
| **Google Chrome** | 90+ | Total | Recomendado para melhor performance. |
| **Microsoft Edge** | 90+ | Total | Baseado em Chromium, performance excelente. |
| **Mozilla Firefox** | 95+ | Estável | Fallbacks aplicados para animações CSS. |
| **Apple Safari** | 15+ | Estável | Requer prefixos `-webkit` para glassmorphism. |

## Recursos Específicos

- **Glassmorphism**: Em navegadores sem suporte a `backdrop-filter`, o sistema aplica fundos sólidos com opacidade reduzida para manter a legibilidade.
- **Clipboard API**: Caso `navigator.clipboard` falhe em contextos não-seguros ou navegadores antigos, o sistema utiliza o fallback `document.execCommand('copy')`.
- **LocalStorage**: Requer cookies de terceiros habilitados se rodando em iframes ou contextos sandbox.

## Dispositivos Móveis
- **iOS**: Recomendado Safari 16+ ou Chrome iOS.
- **Android**: Chrome Mobile recomendado.
- **Resolução Mínima**: 320px de largura.