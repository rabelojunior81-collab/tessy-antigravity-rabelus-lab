
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { Conversation, Project, RepositoryItem, Template, Factor, SharedConversation } from '../types';

// Use named import for Dexie to ensure correct type inheritance for subclass methods.
export class TessyDatabase extends Dexie {
  projects!: Table<Project>;
  conversations!: Table<Conversation>;
  library!: Table<RepositoryItem>;
  templates!: Table<Template>;
  settings!: Table<{ key: string; value: any }>;
  files!: Table<{ id: string; projectId: string; name: string; type: string; blob: Blob; createdAt: number }>;
  secrets!: Table<{ id: string; key: string; value: string }>;
  shared_conversations!: Table<SharedConversation>;

  constructor() {
    super('TessyDB');
    
    // Fix: Use version method inherited from Dexie (line 20)
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      conversations: 'id, projectId, title, createdAt, updatedAt',
      library: 'id, projectId, title, createdAt',
      templates: 'id, label, createdAt',
      settings: 'key',
      files: 'id, projectId, name, type, createdAt',
      secrets: 'id, key'
    });

    // Fix: Use version method inherited from Dexie for schema updates (line 30)
    this.version(2).stores({
      shared_conversations: 'code, createdAt, expiresAt'
    });
  }
}

export const db = new TessyDatabase();

export async function migrateToIndexedDB(): Promise<void> {
  try {
    const isMigrated = await db.settings.get('migration-completed');
    if (isMigrated?.value === true) return;

    const defaultProjectId = 'default-project';
    
    // Fix: ensure transaction is recognized as an inherited method of Dexie (line 46)
    await db.transaction('rw', ['projects', 'settings'], async () => {
      const exists = await db.projects.get(defaultProjectId);
      if (!exists) {
        await db.projects.put({
          id: defaultProjectId,
          name: 'Projeto Padrão',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      await db.settings.put({ key: 'migration-completed', value: true });
    });
  } catch (error) {
    console.warn('Migration status:', error);
  }
}

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

export const generateShareCode = (length: number = 6): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let retVal = "";
  for (let i = 0; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return retVal;
};
