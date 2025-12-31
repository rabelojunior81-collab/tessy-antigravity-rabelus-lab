
import { Template } from '../types';

/**
 * System Predefined Templates (Non-editable)
 */
export const PROMPT_TEMPLATES: Template[] = [
  {
    id: 'explain-code',
    category: 'Código',
    label: 'Explicar Código',
    content: 'Explique este código detalhadamente, descrevendo a lógica de cada bloco e o fluxo de execução:\n\n'
  },
  {
    id: 'review-code',
    category: 'Código',
    label: 'Revisar Código',
    content: 'Revise este código identificando possíveis bugs, problemas de performance, vulnerabilidades de segurança e sugerindo melhorias de legibilidade:\n\n'
  },
  {
    id: 'review-text',
    category: 'Escrita',
    label: 'Revisar Texto',
    content: 'Revise este texto corrigindo gramática, pontuação e sugerindo ajustes no tom de voz para torná-lo mais envolvente e profissional:\n\n'
  },
  {
    id: 'summarize',
    category: 'Escrita',
    label: 'Resumir',
    content: 'Resuma o conteúdo a seguir em tópicos concisos, destacando os pontos mais importantes e conclusões principais:\n\n'
  },
  {
    id: 'pros-cons',
    category: 'Análise',
    label: 'Prós e Contras',
    content: 'Realize uma análise crítica de prós e contras sobre o seguinte tópico, considerando diferentes perspectivas:\n\n'
  },
  {
    id: 'explain-concept',
    category: 'Ensino',
    label: 'Explicar Conceito',
    content: 'Explique o conceito de [CONCEITO] de forma simples, usando analogias do cotidiano e fornecendo exemplos práticos de aplicação.'
  },
  {
    id: 'brainstorming',
    category: 'Criativo',
    label: 'Brainstorming',
    content: 'Gere 10 ideias criativas e inovadoras sobre o seguinte tema, focando em soluções fora da caixa:\n\n'
  }
];
