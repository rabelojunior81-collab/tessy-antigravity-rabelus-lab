
import { GitHubRepo, GitHubCommit, GitHubIssue, GitHubFile, PendingAction, GitHubErrorCode, GitHubErrorDetail } from '../types';
import { db, generateUUID } from './dbService';
import { encryptData, decryptData, EncryptedData } from './cryptoService';

const GITHUB_API_BASE = 'https://api.github.com';

// Listener for pending actions queue
let queueListener: ((action: PendingAction) => void) | null = null;

export const setGitHubQueueListener = (listener: (action: PendingAction) => void) => {
  queueListener = listener;
};

export class GitHubError extends Error {
  status: number;
  code: GitHubErrorCode;
  suggestedAction?: string;

  constructor(detail: GitHubErrorDetail) {
    super(detail.message);
    this.name = 'GitHubError';
    this.status = detail.status;
    this.code = detail.code;
    this.suggestedAction = detail.suggestedAction;
  }
}

// --- Validation Helpers ---

function validateCommitMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length < 3) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'A mensagem do commit deve ter no mínimo 3 caracteres.',
      status: 400,
      suggestedAction: 'Forneça uma descrição mais detalhada da alteração.'
    });
  }
  if (trimmed.length > 500) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'A mensagem do commit é muito longa (máximo 500 caracteres).',
      status: 400,
      suggestedAction: 'Resuma a mensagem para caber no limite de 500 caracteres.'
    });
  }
  // Remove multiple newlines (3 or more) to prevent abuse or malformed log displays
  return trimmed.replace(/\n{3,}/g, '\n\n');
}

function validateBranchName(branch: string): string {
  const trimmed = branch.trim();
  if (!trimmed) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O nome da branch não pode estar vazio.',
      status: 400,
      suggestedAction: 'Insira um nome válido para a branch.'
    });
  }

  const protectedBranches = ['HEAD', 'main', 'master'];
  if (protectedBranches.includes(trimmed)) {
    throw new GitHubError({
      code: 'PERMISSION_DENIED',
      message: `A branch '${trimmed}' é protegida e não pode ser usada como destino de escrita direta.`,
      status: 403,
      suggestedAction: 'Crie uma nova branch para suas alterações e faça um Pull Request.'
    });
  }

  // Regex rules: alphanumeric, -, _, /; no leading/trailing /; no double //
  const branchRegex = /^(?!.*[\/]{2})[a-zA-Z0-9\-_]+(?:\/[a-zA-Z0-9\-_]+)*$/;
  if (!branchRegex.test(trimmed)) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'Nome de branch inválido.',
      status: 400,
      suggestedAction: 'Use apenas letras, números, "-", "_" e "/". Não comece ou termine com "/".'
    });
  }

  return trimmed;
}

function validateFilePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O caminho do arquivo não pode estar vazio.',
      status: 400,
      suggestedAction: 'Especifique o caminho relativo do arquivo.'
    });
  }
  if (trimmed.startsWith('/')) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O caminho do arquivo deve ser relativo.',
      status: 400,
      suggestedAction: 'Remova a "/" inicial do caminho.'
    });
  }
  if (trimmed.includes('..')) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'Caminho de arquivo inválido.',
      status: 400,
      suggestedAction: 'Não utilize ".." para navegação de diretórios por segurança.'
    });
  }
  if (trimmed.length > 255) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'Caminho de arquivo muito longo.',
      status: 400,
      suggestedAction: 'Reduza o nome do arquivo ou diretórios para menos de 255 caracteres.'
    });
  }
  // Check for dangerous characters in file paths (cross-platform safety)
  const dangerousChars = /[<>:"\\|?*]/;
  if (dangerousChars.test(trimmed)) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'Caminho de arquivo contém caracteres inválidos.',
      status: 400,
      suggestedAction: 'Remova caracteres especiais como < > : " \\ | ? * do nome do arquivo.'
    });
  }
  return trimmed;
}

function validateFileContent(content: string): string {
  if (typeof content !== 'string') {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O conteúdo do arquivo deve ser uma string válida.',
      status: 400,
      suggestedAction: 'Certifique-se de que o conteúdo enviado é texto.'
    });
  }
  // Check size: Max 1MB (1048576 bytes)
  const size = new TextEncoder().encode(content).length;
  if (size > 1048576) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O conteúdo do arquivo excede o limite de 1MB.',
      status: 400,
      suggestedAction: 'Divida o conteúdo em múltiplos arquivos ou reduza o tamanho.'
    });
  }
  return content;
}

function validateTitle(title: string, type: 'Issue' | 'Pull Request'): string {
  const trimmed = title.trim();
  if (!trimmed || trimmed.length < 5) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: `O título da ${type} deve ter no mínimo 5 caracteres.`,
      status: 400,
      suggestedAction: 'Seja mais descritivo no título.'
    });
  }
  if (trimmed.length > 255) {
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: `O título da ${type} é muito longo.`,
      status: 400,
      suggestedAction: 'Resuma o título para menos de 255 caracteres.'
    });
  }
  return trimmed;
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
    let code: GitHubErrorCode = 'UNKNOWN';
    let suggestedAction: string | undefined;
    const status = response.status;

    const errorData = await response.json().catch(() => ({}));

    switch (status) {
      case 401:
        message = 'Token inválido ou expirado.';
        code = 'INVALID_TOKEN';
        suggestedAction = 'Verifique se o token está correto ou renove-o no GitHub.';
        break;
      case 403:
        if (response.headers.get('x-ratelimit-remaining') === '0') {
          message = 'Limite de taxa da API atingido.';
          code = 'RATE_LIMIT';
          suggestedAction = 'Aguarde alguns minutos para que o limite seja restaurado.';
        } else {
          message = 'Acesso negado ao repositório.';
          code = 'PERMISSION_DENIED';
          suggestedAction = 'Verifique se seu token tem o escopo "repo" ativado.';
        }
        break;
      case 404:
        message = 'Recurso não encontrado.';
        code = 'NOT_FOUND';
        suggestedAction = 'Verifique se o repositório ou caminho do arquivo está correto.';
        break;
      case 400:
        message = 'Requisição inválida.';
        code = 'VALIDATION_ERROR';
        suggestedAction = 'Verifique os dados enviados e tente novamente.';
        break;
      default:
        code = 'NETWORK_ERROR';
        suggestedAction = 'Verifique sua conexão ou tente novamente mais tarde.';
    }

    if (errorData.message) message += ` Detalhes: ${errorData.message}`;

    throw new GitHubError({
      code,
      message,
      status,
      suggestedAction
    });
  }
  return response.json();
}

async function encryptToken(token: string): Promise<EncryptedData> {
  return encryptData(token);
}

async function decryptToken(encryptedData: EncryptedData): Promise<string> {
  return decryptData(encryptedData);
}

// --- Public Token Management ---

export const getGitHubToken = async (): Promise<string | null> => {
  try {
    const secret = await db.secrets.get('github-token');
    if (!secret?.value) return null;

    if (secret.value.startsWith('ghp_')) {
      await setGitHubToken(secret.value);
      return secret.value;
    }

    try {
      const encryptedData = JSON.parse(secret.value);
      if (encryptedData.ciphertext && encryptedData.iv) {
        return await decryptToken(encryptedData);
      }
    } catch (parseError) {
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
  const validatedTitle = validateTitle(title, 'Issue');
  const sanitizedBody = body.trim();

  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/issues`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ title: validatedTitle, body: sanitizedBody })
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
    throw new GitHubError({
      code: 'VALIDATION_ERROR',
      message: 'O caminho fornecido não é um diretório.',
      status: 400,
      suggestedAction: 'Verifique se o caminho especificado existe e é uma pasta.'
    });
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

// --- CRITICAL OPERATIONS (Require Approval) ---

export const performCreateBranch = async (token: string, repoPath: string, branchName: string, fromBranch: string): Promise<any> => {
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

export const createBranch = async (token: string, repoPath: string, branchName: string, fromBranch: string): Promise<any> => {
  const validatedBranch = validateBranchName(branchName);

  const action: PendingAction = {
    id: generateUUID(),
    type: 'branch',
    description: `Criar branch '${validatedBranch}' a partir de '${fromBranch}'`,
    params: { token, repoPath, branchName: validatedBranch, fromBranch },
    timestamp: Date.now(),
    status: 'pending'
  };
  if (queueListener) queueListener(action);
  return { success: true, status: 'pending_approval', message: 'Criação de branch aguardando aprovação.' };
};

export const performCommitChanges = async (token: string, repoPath: string, files: Array<{ path: string; content: string }>, message: string, branch: string): Promise<any> => {
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

export const commitChanges = async (token: string, repoPath: string, files: Array<{ path: string; content: string }>, message: string, branch: string): Promise<any> => {
  const validatedMessage = validateCommitMessage(message);
  const validatedBranch = validateBranchName(branch);
  const validatedFiles = files.map(f => ({
    path: validateFilePath(f.path),
    content: validateFileContent(f.content)
  }));

  const action: PendingAction = {
    id: generateUUID(),
    type: 'commit',
    description: `Commit de ${validatedFiles.length} arquivos na branch '${validatedBranch}': "${validatedMessage}"`,
    params: { token, repoPath, files: validatedFiles, message: validatedMessage, branch: validatedBranch },
    timestamp: Date.now(),
    status: 'pending'
  };
  if (queueListener) queueListener(action);
  return { success: true, status: 'pending_approval', message: 'Commit aguardando aprovação.' };
};

export const performCreatePullRequest = async (token: string, repoPath: string, title: string, body: string, head: string, base: string): Promise<any> => {
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

export const createPullRequest = async (token: string, repoPath: string, title: string, body: string, head: string, base: string): Promise<any> => {
  const validatedTitle = validateTitle(title, 'Pull Request');
  const validatedHead = validateBranchName(head);
  const validatedBase = validateBranchName(base);
  const sanitizedBody = body.trim();

  const action: PendingAction = {
    id: generateUUID(),
    type: 'pr',
    description: `Criar Pull Request de '${validatedHead}' para '${validatedBase}': "${validatedTitle}"`,
    params: { token, repoPath, title: validatedTitle, body: sanitizedBody, head: validatedHead, base: validatedBase },
    timestamp: Date.now(),
    status: 'pending'
  };
  if (queueListener) queueListener(action);
  return { success: true, status: 'pending_approval', message: 'Pull Request aguardando aprovação.' };
};

export const pushChanges = async (token: string, repoPath: string, files: Array<{ path: string; content: string }>, message: string, branch: string): Promise<any> => {
  const validatedMessage = validateCommitMessage(message);
  const validatedBranch = validateBranchName(branch);
  const validatedFiles = files.map(f => ({
    path: validateFilePath(f.path),
    content: validateFileContent(f.content)
  }));

  const action: PendingAction = {
    id: generateUUID(),
    type: 'push',
    description: `Push de alterações diretas na branch '${validatedBranch}': "${validatedMessage}"`,
    params: { token, repoPath, files: validatedFiles, message: validatedMessage, branch: validatedBranch },
    timestamp: Date.now(),
    status: 'pending'
  };
  if (queueListener) queueListener(action);
  return { success: true, status: 'pending_approval', message: 'Push aguardando aprovação.' };
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
