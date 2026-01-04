
const ENCRYPTION_PWD = 'tessy-nucleus-lab-internal-v1';
const PBKDF2_SALT = new Uint8Array([12, 45, 78, 90, 123, 156, 189, 210, 15, 67, 98, 111, 234, 54, 87, 12]);

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

export interface EncryptedData {
    ciphertext: string;
    iv: string;
    salt: string;
}

export async function encryptData(data: string): Promise<EncryptedData> {
    const key = await generateEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(data)
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv.buffer),
        salt: arrayBufferToBase64(PBKDF2_SALT.buffer)
    };
}

export async function decryptData(encryptedData: EncryptedData): Promise<string> {
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
