import { Conversation, Factor, RepositoryItem, Template } from '../types';

/**
 * Generates a standard UUID v4
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const STORAGE_KEYS = {
  CONVERSATIONS: 'tessy_conversations_v2',
  FACTORS: 'tessy_factors_v2',
  LAST_CONV_ID: 'tessy_last_conv_id',
  PROMPTS: 'prompts',
  OLD_HISTORY: 'conversation_history',
  CUSTOM_TEMPLATES: 'tessy_custom_templates'
};

// --- Debounce & Batching Management ---

const pendingWrites = new Map<string, any>();
const writeTimers = new Map<string, number>();

/**
 * Flushes a specific pending write to localStorage immediately.
 */
const flushWrite = (key: string) => {
  if (writeTimers.has(key)) {
    clearTimeout(writeTimers.get(key));
    writeTimers.delete(key);
  }

  if (pendingWrites.has(key)) {
    try {
      const data = pendingWrites.get(key);
      const jsonString = JSON.stringify(data);
      const compressed = compress(jsonString);
      localStorage.setItem(key, compressed);
      pendingWrites.delete(key);
    } catch (error) {
      console.error(`Failed to flush write for key ${key}:`, error);
    }
  }
};

/**
 * Flushes all pending writes to localStorage.
 * Useful for beforeunload events.
 */
const flushAll = () => {
  Array.from(pendingWrites.keys()).forEach(key => flushWrite(key));
};

/**
 * Schedules a debounced write to localStorage.
 */
const scheduleWrite = (key: string, data: any) => {
  pendingWrites.set(key, data);
  
  if (writeTimers.has(key)) {
    clearTimeout(writeTimers.get(key));
  }

  const timerId = window.setTimeout(() => {
    flushWrite(key);
  }, 500); // 500ms debounce as requested

  writeTimers.set(key, timerId);
};

// Handle tab closing to ensure data is saved
window.addEventListener('beforeunload', flushAll);

// --- Optimized Compression (LZW Implementation) ---

const compress = (uncompressed: string): string => {
  if (!uncompressed) return "";
  const dictionary: { [key: string]: number } = {};
  for (let i = 0; i < 256; i++) dictionary[String.fromCharCode(i)] = i;

  let w = "";
  const result: number[] = [];
  let dictSize = 256;

  for (let i = 0; i < uncompressed.length; i++) {
    const c = uncompressed.charAt(i);
    const wc = w + c;
    if (dictionary.hasOwnProperty(wc)) {
      w = wc;
    } else {
      result.push(dictionary[w]);
      if (dictSize < 4096) { // Limit dictionary size to prevent memory bloat
        dictionary[wc] = dictSize++;
      }
      w = c;
    }
  }

  if (w !== "") result.push(dictionary[w]);
  
  // Convert numbers to a more compact string format
  return btoa(result.map(n => String.fromCharCode(n >> 8, n & 0xff)).join(''));
};

const decompress = (compressed: string): string => {
  if (!compressed) return "";
  let binary;
  try {
    binary = atob(compressed);
  } catch (e) {
    // Fallback for non-base64 data (uncompressed legacy)
    return compressed;
  }
  
  const compressedData: number[] = [];
  for (let i = 0; i < binary.length; i += 2) {
    compressedData.push((binary.charCodeAt(i) << 8) | binary.charCodeAt(i + 1));
  }

  const dictionary: { [key: number]: string } = {};
  for (let i = 0; i < 256; i++) dictionary[i] = String.fromCharCode(i);

  let w = String.fromCharCode(compressedData[0]);
  let result = w;
  let dictSize = 256;

  for (let i = 1; i < compressedData.length; i++) {
    const k = compressedData[i];
    let entry = "";
    if (dictionary.hasOwnProperty(k)) {
      entry = dictionary[k];
    } else if (k === dictSize) {
      entry = w + w.charAt(0);
    } else {
      // Recovery for malformed data
      continue;
    }

    result += entry;
    if (dictSize < 4096) {
      dictionary[dictSize++] = w + entry.charAt(0);
    }
    w = entry;
  }
  return result;
};

// --- Repository (Legacy/Static Prompts) ---

export const getDocs = (collectionName: string): any[] => {
  try {
    // Check pending memory first
    if (pendingWrites.has(collectionName)) {
      return pendingWrites.get(collectionName);
    }

    const raw = localStorage.getItem(collectionName);
    if (!raw) return [];
    
    let decompressed;
    try {
      decompressed = decompress(raw);
      return JSON.parse(decompressed);
    } catch (e) {
      // Fallback for legacy plain JSON
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error(`Error retrieving from ${collectionName}:`, error);
    return [];
  }
};

export const addDoc = (collectionName: string, doc: any): void => {
  try {
    const existing = getDocs(collectionName);
    const newDoc = {
      ...doc,
      id: doc.id || generateUUID(),
      timestamp: Date.now()
    };
    const updated = [newDoc, ...existing];
    scheduleWrite(collectionName, updated);
  } catch (error) {
    console.error(`Error saving to ${collectionName}:`, error);
  }
};

export const deleteDoc = (collectionName: string, docId: string): void => {
  try {
    const existing = getDocs(collectionName);
    const updated = existing.filter(doc => doc.id !== docId);
    scheduleWrite(collectionName, updated);
  } catch (error) {
    console.error(`Error deleting from ${collectionName}:`, error);
  }
};

export const getAllTags = (): string[] => {
  const items = getDocs(STORAGE_KEYS.PROMPTS) as RepositoryItem[];
  const tagSet = new Set<string>();
  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tagSet.add(tag.toLowerCase()));
    }
  });
  return Array.from(tagSet).sort();
};

// --- Centralized Persistence (Conversations) ---

export const saveConversation = (conv: Conversation): void => {
  try {
    const conversations = getAllConversations();
    const index = conversations.findIndex(c => c.id === conv.id);
    
    if (index >= 0) {
      conversations[index] = conv;
    } else {
      conversations.unshift(conv);
    }
    
    scheduleWrite(STORAGE_KEYS.CONVERSATIONS, conversations);
    localStorage.setItem(STORAGE_KEYS.LAST_CONV_ID, conv.id);
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

export const getAllConversations = (): Conversation[] => {
  return getDocs(STORAGE_KEYS.CONVERSATIONS) as Conversation[];
};

export const loadConversation = (conversationId: string): Conversation | null => {
  const convs = getAllConversations();
  return convs.find(c => c.id === conversationId) || null;
};

export const loadLastConversation = (): Conversation | null => {
  const lastId = localStorage.getItem(STORAGE_KEYS.LAST_CONV_ID);
  if (!lastId) return null;
  return loadConversation(lastId);
};

export const deleteConversation = (id: string): void => {
  const convs = getAllConversations();
  const updated = convs.filter(c => c.id !== id);
  scheduleWrite(STORAGE_KEYS.CONVERSATIONS, updated);
  
  if (localStorage.getItem(STORAGE_KEYS.LAST_CONV_ID) === id) {
    localStorage.removeItem(STORAGE_KEYS.LAST_CONV_ID);
  }
};

// --- Factors Persistence ---

export const saveFactors = (factors: Factor[]): void => {
  scheduleWrite(STORAGE_KEYS.FACTORS, factors);
};

export const loadFactors = (): Factor[] | null => {
  const docs = getDocs(STORAGE_KEYS.FACTORS);
  return Array.isArray(docs) && docs.length > 0 ? docs : null;
};

// --- Custom Templates Persistence ---

export const getCustomTemplates = (): Template[] => {
  return getDocs(STORAGE_KEYS.CUSTOM_TEMPLATES) as Template[];
};

export const saveCustomTemplate = (template: Template): void => {
  try {
    const templates = getCustomTemplates();
    const newTemplate = {
      ...template,
      id: template.id || generateUUID(),
      isCustom: true,
      createdAt: template.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    templates.push(newTemplate);
    scheduleWrite(STORAGE_KEYS.CUSTOM_TEMPLATES, templates);
  } catch (error) {
    console.error('Error saving custom template:', error);
  }
};

export const updateCustomTemplate = (id: string, updatedTemplate: Template): void => {
  try {
    const templates = getCustomTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      templates[index] = {
        ...updatedTemplate,
        id,
        isCustom: true,
        updatedAt: Date.now()
      };
      scheduleWrite(STORAGE_KEYS.CUSTOM_TEMPLATES, templates);
    }
  } catch (error) {
    console.error('Error updating custom template:', error);
  }
};

export const deleteCustomTemplate = (id: string): void => {
  try {
    const templates = getCustomTemplates();
    const filtered = templates.filter(t => t.id !== id);
    scheduleWrite(STORAGE_KEYS.CUSTOM_TEMPLATES, filtered);
  } catch (error) {
    console.error('Error deleting custom template:', error);
  }
};
