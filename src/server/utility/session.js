import { randomBytes } from 'crypto';
import { createSession, getSession, deleteSession } from '../db/session.js';

/**
 * Generate a cryptographically secure session token.
 * @returns {string} 64‑character hex token.
 */
export function generateToken() {
    return randomBytes(32).toString('hex');
}

/**
 * Store a session in the database.
 * @param {string} token - Session token.
 * @param {string} userId - User identifier (account key).
 * @param {number} ttlMs - Time‑to‑live in milliseconds (default 24h).
 * @returns {Promise<boolean>} True if stored successfully.
 */
export async function storeSession(token, userId, ttlMs = 24 * 60 * 60 * 1000) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    const data = {
        userId,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };
    return await createSession(token, data);
}

/**
 * Retrieve session data by token.
 * @param {string} token - Session token.
 * @returns {Promise<{userId: string, createdAt: string, expiresAt: string} | null>}
 */
export { getSession };

/**
 * Delete a session from storage.
 * @param {string} token - Session token.
 * @returns {Promise<boolean>} True if deleted (or never existed).
 */
export { deleteSession };

/**
 * Verify a session token and return userId if valid.
 * @param {string} token - Session token.
 * @returns {Promise<{userId: string} | null>}
 */
export async function verifyToken(token) {
    const session = await getSession(token);
    if (!session) return null;
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < now) {
        // Expired – delete it
        await deleteSession(token);
        return null;
    }
    return { userId: session.userId };
}