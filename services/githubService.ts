
import { GitHubRepo, GitHubCommit, GitHubIssue, GitHubFile } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

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
  'User-Agent': 'Tessy-App'
});

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'Erro na comunicação com o GitHub.';
    if (response.status === 401) message = 'Token inválido ou expirado.';
    if (response.status === 403) message = 'Limite de taxa excedido ou acesso negado.';
    if (response.status === 404) message = 'Recurso não encontrado no GitHub.';
    throw new GitHubError(message, response.status);
  }
  return response.json();
}

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

/**
 * Fetch the content of a specific file in the repository.
 */
export const fetchFileContent = async (token: string, repoPath: string, filePath: string): Promise<GitHubFile> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/contents/${filePath}`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  
  // GitHub API returns content as base64 with newlines
  const decodeContent = (content: string, encoding: string) => {
    if (encoding === 'base64') {
      try {
        // Remove newlines and decode
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

/**
 * Fetch the list of contents in a specific directory.
 */
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

/**
 * Search for code within a specific repository.
 */
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

/**
 * Fetch all branches of the repository.
 */
export const fetchBranches = async (token: string, repoPath: string): Promise<string[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${repoPath}/branches`, {
    headers: getHeaders(token)
  });
  const data = await handleResponse(response);
  return data.map((item: any) => item.name);
};

/**
 * Fetch details of a specific commit including changed files.
 */
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

/**
 * Fetch the README content of the repository.
 */
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

/**
 * Fetch the full repository structure recursively up to a certain depth.
 */
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
