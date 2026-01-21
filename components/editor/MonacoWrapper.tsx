import React, { useEffect } from 'react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { defineMonacoTheme } from '../../services/monacoTheme';

interface MonacoWrapperProps extends EditorProps {
    className?: string;
}

const MonacoWrapper: React.FC<MonacoWrapperProps> = ({ className, options, ...props }) => {

    useEffect(() => {
        defineMonacoTheme();
    }, []);

    return (
        <div className={className}>
            <Editor
                theme="liquid-glass"
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    fontLigatures: true,
                    lineHeight: 20,
                    padding: { top: 8, bottom: 8 },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    ...options
                }}
                {...props}
            />
        </div>
    );
};

export default MonacoWrapper;
