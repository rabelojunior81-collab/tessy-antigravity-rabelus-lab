/**
 * Terminal Server - Real PTY Backend
 * 
 * Servidor Express + WebSocket para fornecer terminal real
 * usando node-pty para integração com PowerShell/Bash.
 * 
 * @author Tessy Dev Team
 * @version 1.0.0
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import { platform } from 'os';

const PORT = 3002;
const app = express();

// Enable CORS for development
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', shell: getShellPath() });
});

const server = createServer(app);

// WebSocket server on /terminal path
const wss = new WebSocketServer({ server, path: '/terminal' });

/**
 * Get the appropriate shell for the current platform
 */
function getShellPath(): string {
    if (platform() === 'win32') {
        return 'powershell.exe';
    }
    return process.env.SHELL || 'bash';
}

/**
 * Handle new WebSocket connections
 */
wss.on('connection', (ws: WebSocket) => {
    console.log('[Terminal] New connection');

    const shell = getShellPath();

    // Spawn the PTY process
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || process.env.USERPROFILE || process.cwd(),
        env: process.env as { [key: string]: string }
    });

    console.log(`[Terminal] Spawned ${shell} with PID ${ptyProcess.pid}`);

    // PTY -> WebSocket (output)
    ptyProcess.onData((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });

    // WebSocket -> PTY (input)
    ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
        const message = data.toString();

        // Handle resize messages (JSON format)
        if (message.startsWith('{')) {
            try {
                const parsed = JSON.parse(message);
                if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
                    ptyProcess.resize(parsed.cols, parsed.rows);
                    console.log(`[Terminal] Resized to ${parsed.cols}x${parsed.rows}`);
                }
            } catch {
                // Not JSON, treat as regular input
                ptyProcess.write(message);
            }
        } else {
            ptyProcess.write(message);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('[Terminal] Connection closed');
        ptyProcess.kill();
    });

    // Handle PTY exit
    ptyProcess.onExit(({ exitCode }) => {
        console.log(`[Terminal] Process exited with code ${exitCode}`);
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`\n🖥️  Terminal Server running on http://localhost:${PORT}`);
    console.log(`   WebSocket endpoint: ws://localhost:${PORT}/terminal`);
    console.log(`   Shell: ${getShellPath()}\n`);
});
