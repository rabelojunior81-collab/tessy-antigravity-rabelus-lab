
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Conversation, ConversationTurn, Factor, RepositoryItem, AttachedFile } from '../types';
import { db, generateUUID, getGitHubToken } from '../services/dbService';
import { interpretIntent, applyFactorsAndGenerate } from '../services/geminiService';

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
    options: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash-lite-latest'] 
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
  
  setInputText: (text: string) => void;
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  updateFactor: (id: string, value?: any) => void;
  resetFactors: () => void;
  sendMessage: (forcedText?: string) => Promise<void>;
  newConversation: () => void;
  loadConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => Promise<void>;
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode; currentProjectId: string }> = ({ children, currentProjectId }) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [factors, setFactors] = useState<Factor[]>(INITIAL_FACTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState('PRONTO');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Initialize
  useEffect(() => {
    const init = async () => {
      const savedFactors = await db.settings.get('tessy-factors');
      if (savedFactors) setFactors(savedFactors.value);

      const lastConvId = await db.settings.get('tessy_last_conv_id');
      if (lastConvId) {
        const conv = await db.conversations.get(lastConvId.value);
        if (conv) {
          setCurrentConversation(conv);
          return;
        }
      }
      
      // If no last conversation, create one
      const newConv: Conversation = {
        id: generateUUID(),
        projectId: currentProjectId,
        title: 'Nova Conversa',
        turns: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setCurrentConversation(newConv);
    };
    init();
  }, [currentProjectId]);

  // Persist Factors
  useEffect(() => {
    db.settings.put({ key: 'tessy-factors', value: factors });
  }, [factors]);

  // Persist Current Conversation
  useEffect(() => {
    if (currentConversation) {
      db.conversations.put(currentConversation);
      db.settings.put({ key: 'tessy_last_conv_id', value: currentConversation.id });
    }
  }, [currentConversation]);

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

  const newConversation = () => {
    const newConv: Conversation = {
      id: generateUUID(),
      projectId: currentProjectId,
      title: 'Nova Conversa',
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCurrentConversation(newConv);
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
    await db.conversations.delete(id);
    if (currentConversation?.id === id) {
      newConversation();
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
    
    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatusMessage('INTERPRETANDO...');

    try {
      const activeProject = await db.projects.get(currentProjectId);
      const repoPath = activeProject?.githubRepo;
      const githubToken = await getGitHubToken();

      const interpretation = await interpretIntent(currentInput, currentFiles, currentConversation.turns);
      
      setStatusMessage('GERANDO RESPOSTA...');
      const groundingEnabled = factors.find(f => f.id === 'grounding')?.enabled ?? true;
      
      const generationResult = await applyFactorsAndGenerate(
        interpretation, 
        factors, 
        currentFiles, 
        currentConversation.turns, 
        groundingEnabled,
        repoPath,
        githubToken
      );

      const newTurn: ConversationTurn = {
        id: generateUUID(),
        userMessage: currentInput,
        tessyResponse: generationResult.text,
        timestamp: Date.now(),
        attachedFiles: currentFiles.length > 0 ? currentFiles : undefined,
        groundingChunks: generationResult.groundingChunks
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
          turns: [...prev.turns, newTurn], 
          updatedAt: Date.now() 
        };
      });

      setStatusMessage('PRONTO');
    } catch (error) {
      console.error(error);
      setStatusMessage('ERRO');
    } finally {
      setIsLoading(false);
    }
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
      removeFile
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
