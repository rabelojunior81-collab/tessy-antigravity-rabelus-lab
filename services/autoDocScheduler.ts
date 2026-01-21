/**
 * AutoDocScheduler - Tessy Antigravity Core
 * Sprint 1.3: Auto-Documentation Engine
 * 
 * Handles:
 * - Automatic sync on app start/restart (DEFAULT)
 * - User-scheduled syncs with notifications
 * - IndexedDB persistence for targets and sync status
 */

import { openDB, IDBPDatabase } from 'idb';

// Types
export interface DocTarget {
    id: string;
    name: string;
    url: string;
    selector?: string;  // CSS selector for content extraction
    lastSynced?: Date;
    status: 'idle' | 'syncing' | 'success' | 'error';
    autoSync: boolean;  // Include in on-start sync
}

export interface SyncSchedule {
    id: string;
    targetId: string;
    scheduledTime: Date;
    notifyOnComplete: boolean;
}

// Database setup
const DB_NAME = 'tessy-autodoc';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Targets store
            if (!db.objectStoreNames.contains('targets')) {
                const targetStore = db.createObjectStore('targets', { keyPath: 'id' });
                targetStore.createIndex('name', 'name', { unique: true });
            }
            // Schedules store
            if (!db.objectStoreNames.contains('schedules')) {
                db.createObjectStore('schedules', { keyPath: 'id' });
            }
            // Sync history store
            if (!db.objectStoreNames.contains('history')) {
                const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                historyStore.createIndex('targetId', 'targetId');
            }
        }
    });

    return dbInstance;
}

// Default targets (pre-populated)
const DEFAULT_TARGETS: DocTarget[] = [
    {
        id: 'gemini-sdk',
        name: 'Gemini JS SDK',
        url: 'https://github.com/googleapis/js-genai/blob/main/README.md',
        selector: 'article',
        status: 'idle',
        autoSync: true
    },
    {
        id: 'mcp-intro',
        name: 'MCP Protocol',
        url: 'https://modelcontextprotocol.io/docs/getting-started/intro',
        selector: '#content-area',
        status: 'idle',
        autoSync: true
    },
    {
        id: 'google-oauth',
        name: 'Google Identity OAuth',
        url: 'https://developers.google.com/identity/gsi/web/guides/display-button',
        selector: 'article',
        status: 'idle',
        autoSync: true
    }
];

class AutoDocScheduler {
    private initialized = false;
    private syncInProgress = false;
    private onSyncCompleteCallbacks: ((targetId: string, success: boolean) => void)[] = [];

    /**
     * Initialize scheduler - call on app start
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        const db = await getDB();

        // Check if targets exist, if not seed defaults
        const existingTargets = await db.getAll('targets');
        if (existingTargets.length === 0) {
            for (const target of DEFAULT_TARGETS) {
                await db.put('targets', target);
            }
            console.log('[AutoDoc Scheduler] Seeded default targets');
        }

        this.initialized = true;
        console.log('[AutoDoc Scheduler] Initialized');

        // Trigger on-start sync
        this.runOnStartSync();
    }

    /**
     * Run sync for all targets with autoSync=true (on app start)
     */
    async runOnStartSync(): Promise<void> {
        if (this.syncInProgress) {
            console.log('[AutoDoc Scheduler] Sync already in progress, skipping');
            return;
        }

        const targets = await this.getTargets();
        const autoSyncTargets = targets.filter(t => t.autoSync);

        if (autoSyncTargets.length === 0) {
            console.log('[AutoDoc Scheduler] No targets with autoSync enabled');
            return;
        }

        console.log(`[AutoDoc Scheduler] Starting on-start sync for ${autoSyncTargets.length} targets`);
        this.syncInProgress = true;

        for (const target of autoSyncTargets) {
            await this.syncTarget(target.id, false); // no notification for on-start
        }

        this.syncInProgress = false;
        console.log('[AutoDoc Scheduler] On-start sync complete');
    }

    /**
     * Get all targets
     */
    async getTargets(): Promise<DocTarget[]> {
        const db = await getDB();
        return db.getAll('targets');
    }

    /**
     * Add a new target
     */
    async addTarget(target: Omit<DocTarget, 'id' | 'status'>): Promise<DocTarget> {
        const db = await getDB();
        const newTarget: DocTarget = {
            ...target,
            id: `target-${Date.now()}`,
            status: 'idle'
        };
        await db.put('targets', newTarget);
        return newTarget;
    }

    /**
     * Remove a target
     */
    async removeTarget(id: string): Promise<void> {
        const db = await getDB();
        await db.delete('targets', id);
    }

    /**
     * Sync a specific target
     */
    async syncTarget(id: string, notify: boolean = true): Promise<boolean> {
        const db = await getDB();
        const target = await db.get('targets', id);

        if (!target) {
            console.error(`[AutoDoc Scheduler] Target not found: ${id}`);
            return false;
        }

        // Update status to syncing
        target.status = 'syncing';
        await db.put('targets', target);

        try {
            // In browser context, we can't run Puppeteer directly
            // This would trigger a backend/bridge call or use fetch for simple pages
            console.log(`[AutoDoc Scheduler] Syncing: ${target.name}`);

            // Simulate sync (replace with actual implementation)
            await new Promise(r => setTimeout(r, 1000));

            // Update success
            target.status = 'success';
            target.lastSynced = new Date();
            await db.put('targets', target);

            // Record history
            await db.add('history', {
                targetId: id,
                syncedAt: new Date(),
                success: true
            });

            // Notify callbacks
            if (notify) {
                this.onSyncCompleteCallbacks.forEach(cb => cb(id, true));
            }

            return true;
        } catch (error) {
            console.error(`[AutoDoc Scheduler] Sync failed for ${target.name}:`, error);

            target.status = 'error';
            await db.put('targets', target);

            if (notify) {
                this.onSyncCompleteCallbacks.forEach(cb => cb(id, false));
            }

            return false;
        }
    }

    /**
     * Schedule a sync for later (with notification)
     */
    async scheduleSync(targetId: string, scheduledTime: Date): Promise<SyncSchedule> {
        const db = await getDB();
        const schedule: SyncSchedule = {
            id: `schedule-${Date.now()}`,
            targetId,
            scheduledTime,
            notifyOnComplete: true
        };
        await db.put('schedules', schedule);

        // In a real implementation, this would set up a timer or use a service worker
        const delay = scheduledTime.getTime() - Date.now();
        if (delay > 0) {
            setTimeout(() => this.syncTarget(targetId, true), delay);
        }

        return schedule;
    }

    /**
     * Register callback for sync completion
     */
    onSyncComplete(callback: (targetId: string, success: boolean) => void): void {
        this.onSyncCompleteCallbacks.push(callback);
    }

    /**
     * Get sync history for a target
     */
    async getSyncHistory(targetId: string): Promise<any[]> {
        const db = await getDB();
        return db.getAllFromIndex('history', 'targetId', targetId);
    }
}

// Singleton instance
export const autoDocScheduler = new AutoDocScheduler();
