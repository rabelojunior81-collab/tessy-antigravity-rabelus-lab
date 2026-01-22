
import { GoogleGenAI } from "@google/genai";
import { getToken } from "../authProviders";

export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_LITE = 'gemini-flash-lite-latest';

/**
 * Recupera o token Gemini da Central de Autenticação unificada.
 * Migrado do legado db.secrets para authProviders (tessy_auth).
 */
export const getGeminiToken = async (): Promise<string | null> => {
  try {
    return await getToken('gemini');
  } catch (err) {
    console.error('Falha na recuperação do token Gemini:', err);
    return null;
  }
};

export const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};
