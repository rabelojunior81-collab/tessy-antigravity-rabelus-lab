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
        name: 'Gemini-JS-SDK',
        url: 'https://github.com/googleapis/js-genai/blob/main/README.md',
        waitFor: 'article'
    },
    {
        name: 'MCP-Intro',
        url: 'https://modelcontextprotocol.io/docs/getting-started/intro',
        waitFor: 'main'
    },
    {
        name: 'Google-Identity-OAuth',
        url: 'https://developers.google.com/identity/gsi/web/guides/display-button',
        waitFor: 'article'
    }
];

async function updateDocs() {
    console.log('🚀 [Auto-Doc Engine v3.2] Iniciando captura robusta via Puppeteer...');

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
        'Repositório de conhecimento profundo, capturado com renderização JS completa e limpeza cirúrgica.',
        '',
        '## 📑 Documentos Sincronizados',
        ''
    ];

    for (const target of targets) {
        const page = await browser.newPage();
        try {
            console.log(`📥 Capturando: ${target.name}...`);

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            if (target.waitFor) {
                await page.waitForSelector(target.waitFor, { timeout: 15000 }).catch(() => null);
                // Aguarda um pouco mais para garantir hidratação completa
                await new Promise(r => setTimeout(r, 2000));
            }

            // Extração Cirúrgica: Remove o que atrapalha, mantém o que informa
            const content = await page.evaluate((selector) => {
                const root = (selector ? document.querySelector(selector) : null) || document.body;
                const clone = root.cloneNode(true);

                // 1. Remove tags indesejadas
                const blacklist = [
                    'script', 'style', 'nav', 'footer', 'header', 'aside',
                    'noscript', 'template', 'svg', 'iframe', 'button', 'input',
                    '.ad', '.ads', '.sidebar', '#sidebar', '.menu', '.navbar',
                    '.cookie-banner', '.social-share', '.newsletter-signup',
                    '[aria-hidden="true"]', '[style*="display: none"]'
                ];

                blacklist.forEach(sel => {
                    clone.querySelectorAll(sel).forEach(el => el.remove());
                });

                // 2. Limpa atributos de todos os elementos restantes
                const allowedAttrs = ['href', 'src', 'alt', 'title', 'id'];
                clone.querySelectorAll('*').forEach(el => {
                    const attrs = el.attributes;
                    if (attrs) {
                        for (let i = attrs.length - 1; i >= 0; i--) {
                            const attrName = attrs[i].name;
                            if (!allowedAttrs.includes(attrName)) {
                                el.removeAttribute(attrName);
                            }
                        }
                    }

                    // 3. Remove blocos que parecem ser apenas JS/CSS vazado (heurística)
                    const text = el.innerText || "";
                    if (text.length > 50 && (text.includes('function(') || text.includes('var ') || text.includes('{--') || text.includes('self.__next'))) {
                        el.remove();
                    }
                });

                return clone.innerHTML;
            }, target.waitFor);

            const markdown = turndownService.turndown(content);

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
