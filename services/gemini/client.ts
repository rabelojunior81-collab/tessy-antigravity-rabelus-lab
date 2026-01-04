
import { GoogleGenAI } from "@google/genai";
import { db } from "../dbService";
import { encryptData, decryptData, EncryptedData } from "../cryptoService";

export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_LITE = 'gemini-flash-lite-latest';

export const getGeminiToken = async (): Promise<string | null> => {
  try {
    const secret = await db.secrets.get('gemini-api-key');
    if (!secret?.value) return null;

    try {
      const encryptedData = JSON.parse(secret.value);
      if (encryptedData.ciphertext && encryptedData.iv) {
        return await decryptData(encryptedData);
      }
    } catch (parseError) {
      // Fallback for non-encrypted token (if any migration needed)
      return secret.value;
    }
    return null;
  } catch (err) {
    console.error('Falha na recuperação do token Gemini:', err);
    return null;
  }
};

export const setGeminiToken = async (token: string): Promise<void> => {
  try {
    const encrypted = await encryptData(token);
    await db.secrets.put({
      id: 'gemini-api-key',
      key: 'token',
      value: JSON.stringify(encrypted)
    });
  } catch (err) {
    console.error('Falha na gravação do token Gemini:', err);
    throw err;
  }
};

export const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};
