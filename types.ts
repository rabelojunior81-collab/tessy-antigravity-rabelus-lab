
export type FactorType = 'toggle' | 'slider' | 'dropdown' | 'text';

export interface Factor {
  id: string;
  type: FactorType;
  label: string;
  enabled: boolean;
  value?: any;
  options?: string[];
  min?: number;
  max?: number;
  description?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ConversationTurn {
  id: string;
  userMessage: string;
  tessyResponse: string;
  timestamp: number;
  attachedFiles?: AttachedFile[];
  groundingChunks?: GroundingChunk[];
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  turns: ConversationTurn[];
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  githubRepo?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RepositoryItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  content?: string;
  factors?: Factor[];
  timestamp: number;
  tags?: string[];
}

export interface AttachedFile {
  id: string;
  projectId?: string;
  name: string;
  mimeType: string;
  data: string; // base64 encoded data
  size: number;
  blob?: Blob;
}

export interface FileUploadError {
  fileName: string;
  error: string;
  timestamp: number;
}

export interface OptimizationSuggestion {
  category: string;
  issue: string;
  recommendation: string;
}

export interface OptimizationResult {
  clarity_score: number;
  completeness_score: number;
  suggestions: OptimizationSuggestion[];
  optimized_prompt: string;
}

export interface Template {
  id: string;
  category: 'Código' | 'Escrita' | 'Análise' | 'Ensino' | 'Criativo' | 'Personalizado';
  label: string;
  content: string;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface AppPersistedState {
  lastConversationId: string | null;
  factors: Factor[];
}

// GitHub Types
export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  files?: Array<{
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export interface GitHubFile {
  path: string;
  name: string;
  type: string;
  size: number;
  url: string;
  sha?: string;
  content?: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  url: string;
  default_branch: string;
}
