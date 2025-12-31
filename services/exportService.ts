import { ConversationTurn, Factor } from '../types';
import { jsPDF } from 'jspdf';

/**
 * Exports conversation history to Markdown format.
 */
export const exportToMarkdown = (turns: ConversationTurn[], factors: Factor[], title: string, includeMetadata: boolean = true): string => {
  let content = '';
  
  if (includeMetadata) {
    content += `---\n`;
    content += `title: ${title}\n`;
    content += `date: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `active_factors: ${factors.filter(f => f.enabled).map(f => f.label).join(', ')}\n`;
    content += `---\n\n`;
  }

  content += `# ${title}\n\n`;

  turns.forEach((turn, idx) => {
    content += `## [TURNO ${idx + 1}] USUÁRIO\n\n${turn.userMessage}\n\n`;
    content += `## [TURNO ${idx + 1}] TESSY (ASSISTENTE)\n\n${turn.tessyResponse}\n\n`;
    if (idx < turns.length - 1) content += `---\n\n`;
  });

  return content;
};

/**
 * Exports conversation history to a standalone HTML file.
 */
export const exportToHTML = (turns: ConversationTurn[], factors: Factor[], title: string, includeMetadata: boolean = true): string => {
  const dateStr = new Date().toLocaleString('pt-BR');
  const activeFactorsStr = factors.filter(f => f.enabled).map(f => f.label).join(', ');

  const css = `
    :root {
      --bg: #0f172a;
      --emerald: #10b981;
      --jade: #14b8a6;
      --text: #e2e8f0;
      --border: rgba(16, 185, 129, 0.4);
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border-bottom: 3px solid var(--emerald);
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    h1 {
      color: var(--emerald);
      text-transform: uppercase;
      font-weight: 900;
      letter-spacing: -0.05em;
      margin: 0;
    }
    .metadata {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--jade);
      margin-top: 10px;
      letter-spacing: 0.1em;
    }
    .turn {
      margin-bottom: 60px;
      border: 2px solid var(--border);
      padding: 0;
      background: rgba(15, 23, 42, 0.5);
    }
    .turn-label {
      background: var(--emerald);
      color: white;
      font-size: 10px;
      font-weight: 900;
      padding: 5px 15px;
      text-transform: uppercase;
      display: inline-block;
    }
    .user-block, .tessy-block {
      padding: 30px;
    }
    .user-block {
      border-bottom: 1px solid var(--border);
      background: rgba(16, 185, 129, 0.05);
    }
    .block-header {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-block .block-header { color: var(--emerald); }
    .tessy-block .block-header { color: var(--jade); }
    .content {
      white-space: pre-wrap;
      font-size: 15px;
    }
    footer {
      text-align: center;
      margin-top: 80px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--jade);
      opacity: 0.6;
    }
  `;

  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>${title} - Exportação Tessy</title>
      <style>${css}</style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${title}</h1>
          ${includeMetadata ? `<div class="metadata">DATA: ${dateStr} | FATORES: ${activeFactorsStr}</div>` : ''}
        </header>

        ${turns.map((turn, i) => `
          <div class="turn">
            <div class="turn-label">PROTOCOLO TURNO #${i + 1}</div>
            <div class="user-block">
              <div class="block-header">USUÁRIO</div>
              <div class="content">${turn.userMessage}</div>
            </div>
            <div class="tessy-block">
              <div class="block-header">TESSY (IA)</div>
              <div class="content">${turn.tessyResponse}</div>
            </div>
          </div>
        `).join('')}

        <footer>SISTEMA TESSY BY RABELUS LAB - RELATÓRIO SEGURO</footer>
      </div>
    </body>
    </html>
  `;
};

/**
 * Exports conversation history to a PDF document using jsPDF.
 */
export const exportToPDF = async (turns: ConversationTurn[], factors: Factor[], title: string, includeMetadata: boolean = true): Promise<Blob> => {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(title.toUpperCase(), 20, y);
  y += 10;

  if (includeMetadata) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 184, 166); // jade
    doc.text(`DATA: ${new Date().toLocaleString('pt-BR')}`, 20, y);
    y += 5;
    const factorsText = `FATORES: ${factors.filter(f => f.enabled).map(f => f.label).join(', ')}`;
    doc.text(factorsText, 20, y);
    y += 15;
  }

  turns.forEach((turn, idx) => {
    // Check page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Turn Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`TURNO #${idx + 1}`, 20, y);
    y += 7;

    // User Message
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('USUÁRIO:', 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const userLines = doc.splitTextToSize(turn.userMessage, 170);
    doc.text(userLines, 20, y);
    y += (userLines.length * 5) + 10;

    // Tessy Response
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('TESSY (IA):', 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const tessyLines = doc.splitTextToSize(turn.tessyResponse, 170);
    doc.text(tessyLines, 20, y);
    y += (tessyLines.length * 5) + 15;

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y - 5, 190, y - 5);
  });

  return doc.output('blob');
};

/**
 * Utility to trigger a file download in the browser.
 */
export const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
  const isBlob = content instanceof Blob;
  const url = isBlob ? URL.createObjectURL(content) : `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (isBlob) URL.revokeObjectURL(url);
};
