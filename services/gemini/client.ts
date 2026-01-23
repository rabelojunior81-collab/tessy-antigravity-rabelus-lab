import { GoogleGenAI } from "@google/genai";
import { getToken, setToken } from "../authProviders";

// JAN 2026 TESSERACT MODEL CONFIGURATION
export const MODEL_FLASH = 'gemini-2.0-flash-exp'; // Using Experimental for "Model Agnostic" bleeding edge
export const MODEL_PRO = 'gemini-1.5-pro'; // Stable Gold Standard
export const MODEL_LITE = 'gemini-1.5-flash'; // High Throughput

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
