
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Conversation, ConversationTurn, Factor, AttachedFile } from '../types';
// Fix: Split imports between dbService and githubService
import { db, generateUUID } from '../services/dbService';
import { getGitHubToken } from '../services/githubService';
import { getGeminiToken } from '../services/gemini/client';
import { interpretIntent, applyFactorsAndGenerate } from '../services/gemini/service';
import { useLayoutContext } from './LayoutContext';

const INITIAL_FACTORS: Factor[] = [
  {
    id: 'tone',
    type: 'dropdown',
    label: 'Tom da Resposta',
    enabled: true,
    value: 'profissional',
    options: ['profissional', 'casual', 'técnico', 'criativo', 'formal']
  },
  {
    id: 'model',
    type: 'dropdown',
    label: 'Modelo de Linguagem',
    enabled: true,
    value: 'gemini-3-flash-preview',
    options: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-flash-lite-latest']
  },
  {
    id: 'format',
    type: 'dropdown',
    label: 'Formato de Saída',
    enabled: true,
    value: 'markdown',
    options: ['markdown', 'texto plano', 'html', 'json']
  },
  { id: 'grounding', type: 'toggle', label: 'Busca em Tempo Real', enabled: true },
  { id: 'detail_level', type: 'slider', label: 'Nível de Detalhe', enabled: true, value: 3, min: 1, max: 5 },
  { id: 'audience', type: 'dropdown', label: 'Público-Alvo', enabled: true, value: 'intermediario', options: ['iniciante', 'intermediario', 'avancado', 'especialista', 'executivo'] },
  { id: 'context', type: 'text', label: 'Contexto Adicional', enabled: true, value: '' },
];

interface ChatContextType {
  currentConversation: Conversation | null;
  factors: Factor[];
  isLoading: boolean;
  inputText: string;
  attachedFiles: AttachedFile[];
  statusMessage: string;
  isUploadingFiles: boolean;
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;

  setInputText: (text: string) => void;
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  updateFactor: (id: string, value?: any) => void;
  resetFactors: () => void;
  sendMessage: (forcedText?: string) => Promise<void>;
  newConversation: (deleteOld?: boolean) => Promise<void>;
  loadConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => Promise<void>;
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
  sendFeedback: (turnId: string, type: 'positive' | 'negative') => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode; currentProjectId: string }> = ({ children, currentProjectId }) => {
  const { setIsAuthPanelOpen } = useLayoutContext();
  // ... (linhas 70-272 permanecem iguais)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [factors, setFactors] = useState<Factor[]>(INITIAL_FACTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState('PRONTO');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refreshConversations = useCallback(async () => {
    if (!currentProjectId) {
      setConversations([]);
      return;
    }
    try {
      const all = await db.conversations
        .where('projectId')
        .equals(currentProjectId)
        .toArray();

      // Sort in memory to be 100% sure and avoid collection issues
      const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt);
      setConversations(sorted);
    } catch (err) {
      console.error('[refreshConversations] Error:', err);
    }
  }, [currentProjectId]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const savedFactors = await db.settings.get('tessy-factors');
      if (savedFactors) setFactors(savedFactors.value);

      const lastConvId = await db.settings.get('tessy_last_conv_id');
      if (lastConvId) {
        const conv = await db.conversations.get(lastConvId.value);
        if (conv && conv.projectId === currentProjectId) {
          setCurrentConversation(conv);
          await refreshConversations();
          return;
        }
      }

      // If no last conversation or different project, create one
      await newConversation();
    };
    init();
  }, [currentProjectId, refreshConversations]);

  // Persist Factors
  useEffect(() => {
    db.settings.put({ key: 'tessy-factors', value: factors });
  }, [factors]);

  useEffect(() => {
    if (currentConversation) {
      db.conversations.put(currentConversation).then(() => {
        refreshConversations();
      });
      db.settings.put({ key: 'tessy_last_conv_id', value: currentConversation.id });
    }
  }, [currentConversation, refreshConversations]);

  const updateFactor = (id: string, value?: any) => {
    setFactors(prev => prev.map(f =>
      f.id === id
        ? { ...f, enabled: value !== undefined ? true : !f.enabled, value: value !== undefined ? value : f.value }
        : f
    ));
  };

  const resetFactors = () => {
    setFactors(INITIAL_FACTORS);
  };

  const newConversation = async (deleteOld: boolean = false) => {
    if (deleteOld && currentConversation?.id) {
      const exists = await db.conversations.get(currentConversation.id);
      if (exists) {
        await db.conversations.delete(currentConversation.id);
      }
    }

    const id = generateUUID();
    const newConv: Conversation = {
      id,
      projectId: currentProjectId,
      title: 'Nova Conversa',
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.conversations.put(newConv);
    setCurrentConversation(newConv);
    // refreshConversations will be triggered by currentConversation useEffect
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
  };

  const loadConversation = (conv: Conversation) => {
    setCurrentConversation(conv);
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);

      // Get updated list
      const remaining = await db.conversations
        .where('projectId')
        .equals(currentProjectId)
        .toArray();

      const sorted = remaining.sort((a, b) => b.updatedAt - a.updatedAt);

      // If we deleted the active conversation, switch to another or create new
      if (currentConversation?.id === id) {
        if (sorted.length > 0) {
          loadConversation(sorted[0]);
        } else {
          await newConversation();
        }
      } else {
        // Just update the list if background conversation was deleted
        setConversations(sorted);
      }
    } catch (err) {
      console.error('[deleteConversation] Error:', err);
    }
  };

  const addFile = (file: File) => {
    setIsUploadingFiles(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setAttachedFiles(prev => [...prev, {
        id: generateUUID(),
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        size: file.size
      }]);
      setIsUploadingFiles(false);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const sendMessage = async (forcedText?: string) => {
    if (!currentConversation) return;
    const text = forcedText ?? inputText;
    if (!text.trim() && attachedFiles.length === 0) return;

    const currentInput = text;
    const currentFiles = [...attachedFiles];

    // Optimistic Update: Create Turn immediately
    const tempTurnId = generateUUID();
    const tempTurn: ConversationTurn = {
      id: tempTurnId,
      userMessage: currentInput,
      tessyResponse: '', // Placeholder while loading
      timestamp: Date.now(),
      attachedFiles: currentFiles.length > 0 ? currentFiles : undefined
    };

    setCurrentConversation(prev => {
      if (!prev) return null;
      const isFirstMessage = prev.turns.length === 0;
      let newTitle = prev.title;
      if (isFirstMessage) {
        const rawTitle = currentInput.trim();
        newTitle = rawTitle.substring(0, 40) + (rawTitle.length > 40 ? '...' : '');
      }
      return {
        ...prev,
        title: newTitle,
        turns: [...prev.turns, tempTurn],
        updatedAt: Date.now()
      };
    });

    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatusMessage('INTERPRETANDO...');

    try {
      const activeProject = await db.projects.get(currentProjectId);
      const repoPath = activeProject?.githubRepo;
      const githubToken = await getGitHubToken();
      const geminiToken = await getGeminiToken();

      if (!geminiToken) {
        // Redireciona para Central de Autenticação (AuthPanel) via estado global
        setIsAuthPanelOpen(true);
        setStatusMessage('CHAVE GEMINI AUSENTE');
        setIsLoading(false);
        return;
      }

      const interpretation = await interpretIntent(geminiToken, currentInput, currentFiles, currentConversation.turns);

      const groundingEnabled = factors.find(f => f.id === 'grounding')?.enabled ?? true;

      const generationResult = await applyFactorsAndGenerate(
        geminiToken,
        interpretation,
        currentInput,
        factors,
        currentFiles,
        currentConversation.turns.filter(t => t.id !== tempTurnId),
        groundingEnabled,
        repoPath,
        githubToken
      );

      // Atualiza com resposta final
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          turns: prev.turns.map(t => t.id === tempTurnId ? {
            ...t,
            tessyResponse: generationResult.text,
            groundingChunks: generationResult.groundingChunks
          } : t),
          updatedAt: Date.now()
        };
      });

      setStatusMessage('PRONTO');
    } catch (error) {
      console.error(error);
      setStatusMessage('ERRO');
      // Update turn with error message
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          turns: prev.turns.map(t => t.id === tempTurnId ? {
            ...t,
            tessyResponse: "Desculpe, ocorreu um erro ao processar sua solicitação."
          } : t),
          updatedAt: Date.now()
        };
      });

    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = async (turnId: string, type: 'positive' | 'negative') => {
    if (!currentConversation) return;

    const updatedTurns = currentConversation.turns.map(turn =>
      turn.id === turnId ? { ...turn, feedback: type } : turn
    );

    const updatedConversation = {
      ...currentConversation,
      turns: updatedTurns,
      updatedAt: Date.now()
    };

    setCurrentConversation(updatedConversation);
    await db.conversations.put(updatedConversation);

    // Log RLHF (Simulado para JSON por enquanto)
    console.log(`[RLHF] Feedback ${type} recebido para Turno ${turnId}`);
    // Futuro: Enviar para tabela de Logs de Aprendizagem
  };

  return (
    <ChatContext.Provider value={{
      currentConversation,
      factors,
      isLoading,
      inputText,
      attachedFiles,
      statusMessage,
      isUploadingFiles,
      setInputText,
      setAttachedFiles,
      updateFactor,
      resetFactors,
      sendMessage,
      newConversation,
      loadConversation,
      deleteConversation,
      addFile,
      removeFile,
      conversations,
      refreshConversations,
      sendFeedback
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
