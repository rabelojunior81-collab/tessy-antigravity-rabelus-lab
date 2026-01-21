import puppeteer from 'puppeteer';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const turndownService = new TurndownService();
const OUTPUT_DIR = path.join(__dirname, '../.agent/docs/ecosystem');

const targets = [
    {
        name: 'Gemini-JS-SDK-Core',
        url: 'https://googleapis.github.io/js-genai/release_docs/index.html',
        waitFor: '.container'
    },
    {
        name: 'MCP-Introduction',
        url: 'https://modelcontextprotocol.io/introduction',
        waitFor: 'main'
    },
    {
        name: 'Z-AI-GLM-4.7',
        url: 'https://aimlapi.com/models/zhipu/glm-4.7', // Pág de specs que costuma ter texto
        waitFor: 'body'
    },
    {
        name: 'Grok-xAI-Docs',
        url: 'https://x.ai/api',
        waitFor: 'body'
    }
];

async function updateDocs() {
    console.log('🚀 [Auto-Doc Engine v2.0] Iniciando captura profunda via Puppeteer...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const indexContent = [
        '# 📚 Ecossistema de Documentação (Rabelus Lab)',
        '',
        'Repositório de conhecimento profundo, capturado com renderização JS completa via Puppeteer.',
        '',
        '## 📑 Documentos Sincronizados',
        ''
    ];

    for (const target of targets) {
        const page = await browser.newPage();
        try {
            console.log(`📥 Capturando (Deep): ${target.name}...`);

            // UA de desktop real para evitar 403 em alguns sites
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            if (target.waitFor) {
                await page.waitForSelector(target.waitFor, { timeout: 10000 }).catch(() => null);
            }

            // Extrai o conteúdo renderizado
            const renderedHtml = await page.content();
            const markdown = turndownService.turndown(renderedHtml);

            const filePath = path.join(OUTPUT_DIR, `${target.name}.md`);
            const fileHeader = `---
title: ${target.name}
url: ${target.url}
updated: ${new Date().toISOString()}
method: Puppeteer Deep Scrape
---

`;

            fs.writeFileSync(filePath, fileHeader + markdown);
            console.log(`✅ Sincronizado com sucesso: ${target.name}`);

            indexContent.push(`- **[${target.name}](file:///${filePath.replace(/\\/g, '/')})**`);
            indexContent.push(`  - *Fonte:* [${target.url}](${target.url})`);
            indexContent.push(`  - *Data:* ${new Date().toLocaleString()}`);
            indexContent.push('');
        } catch (error) {
            console.error(`⚠️ Erro ao capturar ${target.name}:`, error.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();

    indexContent.push('\n---');
    indexContent.push(`*Gerado automaticamente pela Tessy Dev (Deep Engine) em ${new Date().toLocaleString()}*`);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'INDEX.md'), indexContent.join('\n'));
    console.log('🏁 Sincronização Finalizada via Puppeteer. Check results in .agent/docs/ecosystem/INDEX.md');
}

updateDocs();
