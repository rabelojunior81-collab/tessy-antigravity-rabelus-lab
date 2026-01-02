
import { GitHubRepo, GitHubCommit, GitHubIssue, GitHubFile } from '../types';
import { db } from './dbService';

const GITHUB_API_BASE = 'https://api.github.com';
const ENCRYPTION_PWD = 'tessy-nucleus-lab-internal-v1';
const PBKDF2_SALT = new Uint8Array([12, 45, 78, 90, 123, 156, 189, 210, 15, 67, 98, 111, 234, 54, 87, 12]);

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Tessy-App',
  'Content-Type': 'application/json'
});

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Erro na comunicação com o GitHub.';
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) message = 'Token inválido ou expirado.';
    if (response.status === 403) message = 'Limite de taxa excedido ou acesso negado.';
    if (response.status === 404) message = 'Recurso não encontrado no GitHub.';
    if (errorData.message) message += ` Detalhes: ${errorData.message}`;
    throw new GitHubError(message, response.status);
  }
  return response.json();
}

// --- Encryption Helpers ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(ENCRYPTION_PWD),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: PBKDF2_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptToken(token: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const key = await generateEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(token)
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(PBKDF2_SALT.buffer)
  };
}

async function decryptToken(encryptedData: { ciphertext: string; iv: string; salt: string }): Promise<string> {
  const key = await generateEncryptionKey();
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
  const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

// --- Public Token Management ---

export const getGitHubToken = async (): Promise<string | null> => {
  try {
    const secret = await db.secrets.get('github-token');
    if (!secret?.value) return null;

    // Detection for legacy plain text tokens
    if (secret.value.startsWith('ghp_')) {
      // Automatic migration to encrypted format
      await setGitHubToken(secret.value);
      return secret.value;
    }

    try {
      const encryptedData = JSON.parse(secret.value);
      if (encryptedData.ciphertext && encryptedData.iv) {
        return await decryptToken(encryptedData);
      }
    } catch (parseError) {
      // Fallback if it's not JSON but was saved somehow
      if (secret.value.startsWith('ghp_')) return secret.value;
      return null;
    }
    
    return null;
  } catch (err) {
    console.error('Falha na recuperação/descriptografia do token:', err);
    return null;
  }
};

export const setGitHubToken = async (token: string): Promise<void> => {
  try {
    const encrypted = await encryptToken(token);
    await db.secrets.put({ 
      id: 'github-token', 
      key: 'token', 
      value: JSON.stringify(encrypted) 
    });
  } catch (err) {
    console.error('Falha na criptografia do token:', err);
    throw err;
  }
};

// --- API Functions ---

export const fetchRepo = async (token: string, repoPath: string): Promise<GitHubRepo> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}`, {
    headers: getHeaders(token)
  });
  return handleResponse(response);
};

export const fetchCommits = async (token: string, repoPath: string, perPage = 5): Promise<GitHubCommit[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/commits?per_page=${perPage}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  return data.map((item: any) => ({
    sha: item.sha,
    message: item.commit.message,
    author: item.commit.author.name,
    date: item.commit.author.date,
    url: item.html_url
  }));
};

export const createIssue = async (token: string, repoPath: string, title: string, body: string): Promise<GitHubIssue> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/issues`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ title, body })
  });
  const data = await handleResponse(response);
  return {
    number: data.number,
    title: data.title,
    body: data.body,
    state: data.state,
    url: data.html_url
  };
};

export const fetchFileContent = async (token: string, repoPath: string, filePath: string): Promise<GitHubFile> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/contents/${filePath}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  const decodeContent = (content: string, encoding: string) => {
    if (encoding === 'base64') {
      try {
        return atob(content.replace(/\s/g, ''));
      } catch (e) {
        console.error("Failed to decode base64 content", e);
        return content;
      }
    }
    return content;
  };

  return {
    path: data.path,
    name: data.name,
    sha: data.sha,
    size: data.size,
    type: data.type,
    url: data.html_url,
    content: decodeContent(data.content || '', data.encoding || '')
  };
};

export const fetchDirectoryContents = async (token: string, repoPath: string, dirPath: string = ''): Promise<GitHubFile[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/contents/${dirPath}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  if (!Array.isArray(data)) {
    throw new GitHubError('O caminho fornecido não é um diretório.', 400);
  }

  return data.map((item: any) => ({
    path: item.path,
    name: item.name,
    sha: item.sha,
    size: item.size,
    type: item.type,
    url: item.html_url
  }));
};

export const searchCode = async (token: string, repoPath: string, query: string): Promise<GitHubFile[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/search/code?q=${encodeURIComponent(query)}+repo:${repoPath}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  return data.items.map((item: any) => ({
    path: item.path,
    name: item.name,
    sha: item.sha || '',
    size: 0,
    type: 'file',
    url: item.html_url
  }));
};

export const fetchBranches = async (token: string, repoPath: string): Promise<string[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/branches`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  return data.map((item: any) => item.name);
};

export const fetchCommitDetails = async (token: string, repoPath: string, sha: string): Promise<GitHubCommit> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/commits/${sha}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  return {
    sha: data.sha,
    message: data.commit.message,
    author: data.commit.author.name,
    date: data.commit.author.date,
    url: data.html_url,
    files: data.files.map((file: any) => ({
      filename: file.filename,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes
    }))
  };
};

export const fetchReadme = async (token: string, repoPath: string): Promise<string> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/readme`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\s/g, ''));
  }
  return data.content;
};

export const fetchRepositoryStructure = async (token: string, repoPath: string, maxDepth = 2): Promise<any> => {
  const getStructure = async (path = '', depth = 0): Promise<any> => {
    if (depth > maxDepth) return { type: 'dir', path, items: [] };

    const contents = await fetchDirectoryContents(token, repoPath, path);
    const result: any[] = [];

    for (const item of contents) {
      if (item.type === 'dir') {
        const subItems = await getStructure(item.path, depth + 1);
        result.push({ ...item, items: subItems.items });
      } else {
        result.push(item);
      }
    }

    return { type: 'dir', path, items: result };
  };

  return getStructure();
};

export const createBranch = async (token: string, repoPath: string, branchName: string, fromBranch: string): Promise<any> => {
  const refResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/refs/heads/${fromBranch}`, {
    headers: getHeaders(token)
  });
  const refData = await handleResponse(refResponse);
  const sha = refData.object.sha;

  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/refs`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: sha
    })
  });
  return handleResponse(response);
};

export const commitChanges = async (token: string, repoPath: string, files: Array<{ path: string; content: string }>, message: string, branch: string): Promise<any> => {
  const refResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/refs/heads/${branch}`, {
    headers: getHeaders(token)
  });
  const refData = await handleResponse(refResponse);
  const lastCommitSha = refData.object.sha;

  const commitResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/commits/${lastCommitSha}`, {
    headers: getHeaders(token)
  });
  const commitData = await handleResponse(commitResponse);
  const baseTreeSha = commitData.tree.sha;

  const treeItems = files.map(file => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    content: file.content
  }));

  const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/trees`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems
    })
  });
  const treeData = await handleResponse(treeResponse);
  const newTreeSha = treeData.sha;

  const newCommitResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/commits`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      message: message,
      tree: newTreeSha,
      parents: [lastCommitSha]
    })
  });
  const newCommitData = await handleResponse(newCommitResponse);
  const newCommitSha = newCommitData.sha;

  const updateRefResponse = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({
      sha: newCommitSha
    })
  });
  return handleResponse(updateRefResponse);
};

export const createPullRequest = async (token: string, repoPath: string, title: string, body: string, head: string, base: string): Promise<any> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/pulls`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      title,
      body,
      head,
      base
    })
  });
  return handleResponse(response);
};

export const formatRelativeDate = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `há ${diffInSeconds} segundos`;
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  
  return date.toLocaleDateString('pt-BR');
};
