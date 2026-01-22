import { db } from './dbService';

// Security Constants
const PBKDF2_ITERATIONS = 100000;
const HASH_ALGO = 'SHA-256';
const KEY_ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

// In-memory cache for the derived key (Session scope only)
let cachedKey: CryptoKey | null = null;
let masterSalt: Uint8Array | null = null;

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Initializes the security subsystem.
 * Derives the encryption key from the provided master password and a salt.
 * The salt is generated once and stored; the password is NEVER stored.
 */
export async function initializeSecurity(masterPassword: string): Promise<boolean> {
    try {
        // 1. Get or Generate Master Salt
        let saltStored = await db.settings.get('security-salt');

        if (!saltStored) {
            masterSalt = window.crypto.getRandomValues(new Uint8Array(16));
            await db.settings.put({
                key: 'security-salt',
                value: arrayBufferToBase64(masterSalt.buffer as ArrayBuffer)
            });
        } else {
            masterSalt = new Uint8Array(base64ToArrayBuffer(saltStored.value));
        }

        // 2. Derive Key
        const enc = new TextEncoder();
        const material = await window.crypto.subtle.importKey(
            'raw',
            enc.encode(masterPassword),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        cachedKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: masterSalt.buffer as ArrayBuffer,
                iterations: PBKDF2_ITERATIONS,
                hash: HASH_ALGO
            },
            material,
            { name: KEY_ALGO, length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );

        return true;
    } catch (e) {
        console.error("Security Init Failed:", e);
        cachedKey = null;
        return false;
    }
}

export function isSecurityInitialized(): boolean {
    return cachedKey !== null;
}

export interface EncryptedData {
    ciphertext: string;
    iv: string;
}

export async function encryptData(data: string): Promise<EncryptedData> {
    if (!cachedKey) {
        throw new Error("Security not initialized. Call initializeSecurity() first.");
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: KEY_ALGO, iv },
        cachedKey,
        enc.encode(data)
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv.buffer)
    };
}

export async function decryptData(encryptedData: EncryptedData): Promise<string> {
    if (!cachedKey) {
        throw new Error("Security not initialized. Call initializeSecurity() first.");
    }

    // Handle legacy format (if missing) - Fallback or Error
    // For Tesseract v4.6, we assume fresh start or re-auth, so we fail hard on mismatch.
    try {
        const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));

        const decrypted = await window.crypto.subtle.decrypt(
            { name: KEY_ALGO, iv },
            cachedKey,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        throw new Error("Decryption failed. Wrong password or corrupted data.");
    }
}
