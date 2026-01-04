
import { GoogleGenAI } from "@google/genai";
import { db } from "../dbService";
import { getGeminiToken } from "./client";

// Tipos para o ContextManager
interface FileContext {
    path: string;
    hash: string;
    content: string;
    mimeType: string;
}

interface CacheMetadata {
    key: string; // Resource name no Gemini (cachedContents/...)
    hash: string;
    updatedAt: number;
}

export class ContextManager {
    private static CACHE_DB_KEY = "gemini_context_cache_meta";

    /**
     * Calcula um hash SHA-256 simples do conteúdo para detecção de mudanças.
     */
    private static async computeHash(content: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Sincroniza o contexto atual (arquivos locais ou DB) com o Cache do Gemini.
     * Retorna o cachedContent resource name ou null se falhar/não necessário.
     */
    static async syncContext(files: { path: string; content: string; mimeType: string }[]): Promise<string | null> {
        const token = await getGeminiToken();
        if (!token) throw new Error("Token Gemini ausente.");

        // 1. Calcular Hash Global do Contexto Atual
        // Ordena por path para garantir consistência
        const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
        const globalContent = sortedFiles.map(f => `${f.path}:${f.content}`).join("|||");
        const currentHash = await this.computeHash(globalContent);

        // 2. Verificar se já existe cache válido e atualizado
        const cachedMetaRaw = await db.settings.get(this.CACHE_DB_KEY);
        const cachedMeta = cachedMetaRaw?.value as CacheMetadata | undefined;

        if (cachedMeta && cachedMeta.hash === currentHash) {
            console.log("[ContextManager] Cache válido encontrado:", cachedMeta.key);
            // Opcional: Verificar se o TTL do cache ainda é válido na API (requer chamada extra)
            return cachedMeta.key;
        }

        console.log("[ContextManager] Cache obsoleto ou inexistente. Gerando novo...");

        // 3. Criar Novo Cache no Gemini
        // Nota: O SDK @google/genai pode ter métodos específicos para Caching.
        // Como estamos na versão "preview", vamos usar a interface genérica ou REST se necessário.
        // Assumindo suporte via REST style ou helper method por enquanto.

        // TODO: Implementar upload real quando o SDK do browser suportar CacheManager completo.
        // Por enquanto, simulamos para estruturar a arquitetura conforme o plano "Gênesis".
        // A implementação real depende do suporte exato do SDK no ambiente Browser.

        // Se não for possível cachear (falta de suporte ou arquivos pequenos), retornamos null
        // para que o GeminiService use o método padrão (inline tokens).

        // Em produção real com Node/Server-side:
        // const cache = await fileManager.createCachedContent(...)

        // Retornamos null para forçar o fallback (safe fail) até a implementação do File API.
        return null;
    }
}
