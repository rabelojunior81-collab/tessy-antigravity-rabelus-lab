import { GoogleGenAI } from "@google/genai";
import { getToken, setToken } from "../authProviders";

// JAN 2026 TESSERACT MODEL CONFIGURATION
export const MODEL_FLASH = 'gemini-3-flash-preview'; // Bleeding Edge 2026
export const MODEL_PRO = 'gemini-3-pro-preview'; // Reasoning Heavy
export const MODEL_LITE = 'gemini-flash-lite-latest'; // High Throughput

/**
 * Recupera o token Gemini da Central de Autenticação unificada.
 */
export const getGeminiToken = async (): Promise<string | null> => {
  try {
    return await getToken('gemini');
  } catch (err) {
    console.error('Falha na recuperação do token Gemini:', err);
    return null;
  }
};

/**
 * Grava o token Gemini via Central de Autenticação (Redirecionamento).
 */
export const setGeminiToken = async (token: string): Promise<void> => {
  await setToken('gemini', token);
};

export const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};
