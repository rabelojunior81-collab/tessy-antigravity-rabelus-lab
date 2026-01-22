
import { Type } from "@google/genai";
import { getAIClient, MODEL_FLASH, MODEL_PRO } from "./client";
import { githubTools } from "./tools";
import { getSystemInstruction, OPTIMIZATION_INSTRUCTION } from "./prompts";
import { Factor, AttachedFile, OptimizationResult, ConversationTurn, GroundingChunk } from "../../types";
import * as githubService from "../githubService";
import { db, generateUUID } from '../dbService';
import { ContextManager } from './contextManager';

interface GenerateResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
}

async function executeFunctionCall(fc: { name: string; args: any }, githubToken: string, repoPath: string): Promise<any> {
  try {
    switch (fc.name) {
      case 'read_github_file': {
        const result = await githubService.fetchFileContent(githubToken, repoPath, fc.args.file_path);
        return { success: true, content: result.content, file_path: fc.args.file_path };
      }
      case 'list_github_directory': {
        const files = await githubService.fetchDirectoryContents(githubToken, repoPath, fc.args.directory_path || '');
        return { success: true, files, directory_path: fc.args.directory_path };
      }
      case 'search_github_code': {
        const items = await githubService.searchCode(githubToken, repoPath, fc.args.query);
        return { success: true, items };
      }
      case 'get_github_readme': {
        const content = await githubService.fetchReadme(githubToken, repoPath);
        return { success: true, content };
      }
      case 'list_github_branches': {
        const branches = await githubService.fetchBranches(githubToken, repoPath);
        return { success: true, branches };
      }
      case 'get_commit_details': {
        const commit = await githubService.fetchCommitDetails(githubToken, repoPath, fc.args.commit_sha);
        return { success: true, commit };
      }
      case 'get_repository_structure': {
        const structure = await githubService.fetchRepositoryStructure(githubToken, repoPath, fc.args.max_depth || 2);
        return { success: true, structure };
      }
      case 'create_branch': {
        const result = await githubService.createBranch(githubToken, repoPath, fc.args.branch_name, fc.args.from_branch);
        return { success: true, result };
      }
      case 'commit_changes': {
        const result = await githubService.commitChanges(githubToken, repoPath, fc.args.files, fc.args.message, fc.args.branch);
        return { success: true, result };
      }
      case 'create_pull_request': {
        const result = await githubService.createPullRequest(githubToken, repoPath, fc.args.title, fc.args.body, fc.args.head_branch, fc.args.base_branch);
        return { success: true, result };
      }
      default:
        return { success: false, error: "Função desconhecida" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Erro na execução da ferramenta GitHub" };
  }
}

const generateWithRetry = async (model: any, params: any, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await model.generateContent(params);
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota'))) {
      console.warn(`[Gemini Service] Rate Limit hit (429). Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateWithRetry(model, params, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const interpretIntent = async (
  geminiToken: string,
  text: string,
  files: AttachedFile[] = [],
  history: ConversationTurn[] = []
): Promise<any> => {
  if (!text.trim() && files.length === 0) return null;

  try {
    const ai = getAIClient(geminiToken);
    let contextStr = history.length > 0 ? "CONTEXTO DA CONVERSA:\n" + history.slice(-3).map(t => `Usuário: ${t.userMessage}\nTessy: ${t.tessyResponse.slice(0, 150)}...`).join("\n\n") + "\n\n" : "";

    const parts: any[] = [{ text: `${contextStr}Analise a seguinte nova entrada do usuário e extraia a intenção estruturada: "${text}"` }];
    files.forEach(file => parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } }));

    const response = await generateWithRetry(ai.models, {
      model: MODEL_FLASH,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            subject: { type: Type.STRING },
            details: { type: Type.STRING },
            language: { type: Type.STRING }
          },
          required: ["task", "subject"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Interpretation Error:", error);
    throw new Error("Erro ao interpretar a intenção.");
  }
};



export const applyFactorsAndGenerate = async (
  geminiToken: string,
  interpretation: any,
  userInput: string,
  factors: Factor[],
  files: AttachedFile[] = [],
  history: ConversationTurn[] = [],
  groundingEnabled: boolean = true,
  repoPath?: string,
  githubTokenParam?: string | null
): Promise<GenerateResponse> => {
  if (!interpretation) return { text: "Interpretação inválida." };

  try {
    const ai = getAIClient(geminiToken);
    const currentDateStr = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const systemInstruction = getSystemInstruction(currentDateStr, repoPath, groundingEnabled, factors);
    const modelChoice = factors.find(f => f.id === 'model')?.value || MODEL_FLASH;

    const contents: any[] = [];
    history.slice(-3).forEach(turn => {
      contents.push({ role: 'user', parts: [{ text: turn.userMessage }] });
      contents.push({ role: 'model', parts: [{ text: turn.tessyResponse }] });
    });

    const parts: any[] = [{ text: userInput }];
    files.forEach(file => parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } }));
    contents.push({ role: 'user', parts });

    const tools: any[] = [];
    if (repoPath) tools.push(githubTools);
    else if (groundingEnabled) tools.push({ googleSearch: {} });

    let response = await generateWithRetry(ai.models, {
      model: modelChoice,
      contents: contents,
      config: { systemInstruction, temperature: 0.7, tools },
    });

    let iteration = 0;
    const githubToken = await githubService.getGitHubToken();

    while (response.functionCalls && response.functionCalls.length > 0 && iteration < 10) {
      iteration++;
      console.log(`[Tessy Core] Interação de Ferramenta #${iteration}:`, response.functionCalls.map(f => f.name).join(', '));

      contents.push(response.candidates[0].content);
      const functionResponses = await Promise.all(response.functionCalls.map(async (fc) => ({
        id: fc.id,
        name: fc.name || '',
        response: (githubToken && repoPath) ? await executeFunctionCall(fc as any, githubToken, repoPath) : { success: false, error: "Configuração ausente." }
      })));

      contents.push({ role: 'function', parts: functionResponses.map(fr => ({ functionResponse: fr })) });

      const nextParams = {
        model: modelChoice,
        contents: contents,
        config: {
          systemInstruction: systemInstruction + "\nIMPORTANTE: Forneça agora uma resposta textual para o usuário baseada nos dados obtidos.",
          temperature: 0.7,
          tools
        },
      };

      response = await generateWithRetry(ai.models, nextParams);
    }

    let finalOutput = response.text || "";
    if (!finalOutput && response.candidates?.[0]?.content?.parts) {
      finalOutput = response.candidates[0].content.parts
        .filter(p => 'text' in p)
        .map(p => (p as any).text)
        .join("\n");
    }

    if (!finalOutput || finalOutput.trim() === '') {
      return {
        text: "Desculpe, não consegui processar sua solicitação completamente.",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };
    }

    return {
      text: finalOutput,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return { text: "Erro ao gerar resposta final." };
  }
};

export const optimizePrompt = async (geminiToken: string, prompt: string): Promise<OptimizationResult> => {
  try {
    const ai = getAIClient(geminiToken);
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Analise este prompt: "${prompt}"`,
      config: {
        systemInstruction: OPTIMIZATION_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.3,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarity_score: { type: Type.NUMBER },
            completeness_score: { type: Type.NUMBER },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ["category", "issue", "recommendation"]
              }
            },
            optimized_prompt: { type: Type.STRING }
          },
          required: ["clarity_score", "completeness_score", "suggestions", "optimized_prompt"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as OptimizationResult;
  } catch (error) {
    console.error("Optimization Error:", error);
    throw new Error("Erro ao otimizar prompt.");
  }
};
