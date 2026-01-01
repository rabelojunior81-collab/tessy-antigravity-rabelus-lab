
import { GoogleGenAI } from "@google/genai";

export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_LITE = 'gemini-flash-lite-latest';

export const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};
