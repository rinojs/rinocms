import { dbDir, DB_TIMEOUT } from '../config.js';
import { dbCommandWithTimeout } from './dbProxy.js';

const DB_NAME = 'rinocms';
const TABLE = 'session';

/**
 * Store a session in the session table.
 * @param {string} token - Session token.
 * @param {object} data - Session data (must include userId, createdAt, expiresAt).
 * @returns {Promise<boolean>} True if stored successfully.
 */
export async function createSession(token, data) {
    const result = await dbCommandWithTimeout(
        DB_TIMEOUT,
        'add',
        dbDir,
        DB_NAME,
        TABLE,
        token,
        JSON.stringify(data)
    );
    return !!result;
}

/**
 * Retrieve session data by token.
 * @param {string} token - Session token.
 * @returns {Promise<object | null>} Parsed session data or null.
 */
export async function getSession(token) {
    const result = await dbCommandWithTimeout(
        DB_TIMEOUT,
        'get',
        dbDir,
        DB_NAME,
        TABLE,
        token
    );
    if (!result) return null;
    try {
        return JSON.parse(result);
    } catch {
        return null;
    }
}

/**
 * Delete a session from storage.
 * @param {string} token - Session token.
 * @returns {Promise<boolean>} True if deleted (idempotent).
 */
export async function deleteSession(token) {
    await dbCommandWithTimeout(
        DB_TIMEOUT,
        'remove',
        dbDir,
        DB_NAME,
        TABLE,
        token
    );
    return true;
}
