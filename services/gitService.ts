/**
 * Git Service using isomorphic-git
 * Hotfix 001: File System Synchronization
 * 
 * Provides Git operations in the browser using isomorphic-git
 */

import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { FSAAdapter } from './fsaAdapter';

export interface CloneOptions {
    url: string;
    corsProxy?: string;
    ref?: string;
    singleBranch?: boolean;
    depth?: number;
    onProgress?: (progress: GitProgress) => void;
    onAuth?: () => { username: string; password: string };
}

export interface GitProgress {
    phase: string;
    loaded: number;
    total: number;
}

export interface GitLogEntry {
    oid: string;
    message: string;
    author: {
        name: string;
        email: string;
        timestamp: number;
    };
}

export interface GitStatusResult {
    filepath: string;
    status: 'added' | 'modified' | 'deleted' | 'untracked' | 'unchanged';
}

// Default CORS proxy for GitHub
const DEFAULT_CORS_PROXY = 'https://cors.isomorphic-git.org';

/**
 * Clone a Git repository to the workspace
 */
export async function cloneRepository(
    fs: FSAAdapter,
    dir: string,
    options: CloneOptions
): Promise<void> {
    const { url, corsProxy = DEFAULT_CORS_PROXY, ref, singleBranch = true, depth, onProgress, onAuth } = options;

    await git.clone({
        fs,
        http,
        dir,
        url,
        corsProxy,
        ref,
        singleBranch,
        depth,
        onProgress: onProgress ? (event) => {
            onProgress({
                phase: event.phase,
                loaded: event.loaded,
                total: event.total || 0
            });
        } : undefined,
        onAuth: onAuth ? () => onAuth() : undefined
    });
}

/**
 * Pull latest changes from remote
 */
export async function pull(
    fs: FSAAdapter,
    dir: string,
    options?: {
        ref?: string;
        corsProxy?: string;
        onAuth?: () => { username: string; password: string };
    }
): Promise<void> {
    await git.pull({
        fs,
        http,
        dir,
        corsProxy: options?.corsProxy ?? DEFAULT_CORS_PROXY,
        ref: options?.ref,
        singleBranch: true,
        onAuth: options?.onAuth ? () => options.onAuth!() : undefined,
        author: {
            name: 'Tessy User',
            email: 'user@tessy.app'
        }
    });
}

/**
 * Stage files for commit
 */
export async function stageFiles(
    fs: FSAAdapter,
    dir: string,
    filepaths: string[]
): Promise<void> {
    for (const filepath of filepaths) {
        await git.add({ fs, dir, filepath });
    }
}

/**
 * Commit staged changes
 */
export async function commit(
    fs: FSAAdapter,
    dir: string,
    message: string,
    author?: { name: string; email: string }
): Promise<string> {
    const sha = await git.commit({
        fs,
        dir,
        message,
        author: author ?? {
            name: 'Tessy User',
            email: 'user@tessy.app'
        }
    });
    return sha;
}

/**
 * Push commits to remote
 */
export async function push(
    fs: FSAAdapter,
    dir: string,
    options?: {
        remote?: string;
        ref?: string;
        corsProxy?: string;
        onAuth?: () => { username: string; password: string };
    }
): Promise<void> {
    await git.push({
        fs,
        http,
        dir,
        remote: options?.remote ?? 'origin',
        ref: options?.ref,
        corsProxy: options?.corsProxy ?? DEFAULT_CORS_PROXY,
        onAuth: options?.onAuth ? () => options.onAuth!() : undefined
    });
}

/**
 * Get the status of files in the working directory
 */
export async function status(
    fs: FSAAdapter,
    dir: string
): Promise<GitStatusResult[]> {
    const statusMatrix = await git.statusMatrix({ fs, dir });

    return statusMatrix
        .filter(([, head, workdir, stage]) => {
            // Filter out unchanged files
            return !(head === 1 && workdir === 1 && stage === 1);
        })
        .map(([filepath, head, workdir, stage]) => {
            let status: GitStatusResult['status'];

            if (head === 0 && workdir === 2 && stage === 0) {
                status = 'untracked';
            } else if (head === 0 && (stage === 2 || stage === 3)) {
                status = 'added';
            } else if (head === 1 && workdir === 2) {
                status = 'modified';
            } else if (head === 1 && workdir === 0) {
                status = 'deleted';
            } else {
                status = 'unchanged';
            }

            return { filepath, status };
        });
}

/**
 * Get commit log
 */
export async function log(
    fs: FSAAdapter,
    dir: string,
    options?: { depth?: number; ref?: string }
): Promise<GitLogEntry[]> {
    const commits = await git.log({
        fs,
        dir,
        depth: options?.depth ?? 20,
        ref: options?.ref ?? 'HEAD'
    });

    return commits.map(c => ({
        oid: c.oid,
        message: c.commit.message,
        author: {
            name: c.commit.author.name,
            email: c.commit.author.email,
            timestamp: c.commit.author.timestamp
        }
    }));
}

/**
 * Get current branch name
 */
export async function currentBranch(
    fs: FSAAdapter,
    dir: string
): Promise<string | null> {
    try {
        const branch = await git.currentBranch({ fs, dir });
        return branch || null;
    } catch {
        return null;
    }
}

/**
 * List all branches
 */
export async function listBranches(
    fs: FSAAdapter,
    dir: string

): Promise<string[]> {
    return await git.listBranches({ fs, dir });
}

/**
 * Create a new branch
 */
export async function createBranch(
    fs: FSAAdapter,
    dir: string,
    branchName: string,
    checkout: boolean = true
): Promise<void> {
    await git.branch({ fs, dir, ref: branchName, checkout });
}

/**
 * Checkout a branch
 */
export async function checkout(
    fs: FSAAdapter,
    dir: string,
    ref: string
): Promise<void> {
    await git.checkout({ fs, dir, ref });
}

/**
 * Initialize a new Git repository
 */
export async function init(
    fs: FSAAdapter,
    dir: string,
    defaultBranch: string = 'main'
): Promise<void> {
    await git.init({ fs, dir, defaultBranch });
}

/**
 * Add a remote
 */
export async function addRemote(
    fs: FSAAdapter,
    dir: string,
    remote: string,
    url: string
): Promise<void> {
    await git.addRemote({ fs, dir, remote, url });
}

/**
 * Check if directory is a Git repository
 */
export async function isGitRepo(
    fs: FSAAdapter,
    dir: string
): Promise<boolean> {
    try {
        await git.findRoot({ fs, filepath: dir });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get remote URL
 */
export async function getRemoteUrl(
    fs: FSAAdapter,
    dir: string,
    remote: string = 'origin'
): Promise<string | null> {
    try {
        const remotes = await git.listRemotes({ fs, dir });
        const found = remotes.find(r => r.remote === remote);
        return found?.url ?? null;
    } catch {
        return null;
    }
}
