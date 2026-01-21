import { loader } from '@monaco-editor/react';

export const defineMonacoTheme = () => {
    loader.init().then(monaco => {
        monaco.editor.defineTheme('liquid-glass', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'f97316' }, // Accent Orange
                { token: 'string', foreground: '94a3b8' },
                { token: 'number', foreground: 'f97316' },
                { token: 'type', foreground: 'cbd5e1' },
            ],
            colors: {
                'editor.background': '#00000000', // Transparent
                'editor.lineHighlightBackground': '#ffffff05',
                'editorCursor.foreground': '#f97316',
                'editor.selectionBackground': '#f9731630',
                'editorIndentGuide.background': '#ffffff10',
                'editorIndentGuide.activeBackground': '#ffffff30',
            }
        });
    });
};
