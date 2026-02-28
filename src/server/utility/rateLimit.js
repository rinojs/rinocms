import { sendError } from './errorResponse.js';

/**
 * Simple in‑memory rate‑limiting middleware.
 * @param {Object} options - Configuration options.
 * @param {number} options.max - Maximum requests per window (default: 5).
 * @param {number} options.windowMs - Window size in milliseconds (default: 60000).
 * @returns {Function} Express middleware.
 */
export function createRateLimit({ max = 5, windowMs = 60000 } = {})
{
    const store = new Map(); // ip -> { count, windowStart }

    return (req, res, next) =>
    {
        const ip = req.ip || req.socket.remoteAddress;
        const now = Date.now();
        const entry = store.get(ip);

        if (!entry || now - entry.windowStart >= windowMs)
        {
            // New window or expired
            store.set(ip, { count: 1, windowStart: now });
            return next();
        }

        // Inside current window
        if (entry.count >= max)
        {
            return sendError(res, 429, 'Too many requests');
        }

        entry.count++;
        store.set(ip, entry);
        next();
    };
}

// Default instance: 5 requests per minute
export const rateLimit = createRateLimit();