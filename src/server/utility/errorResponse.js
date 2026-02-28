/**
 * Standard error response utility.
 * @param {import('express').Response} res - Express response object.
 * @param {number} status - HTTP status code.
 * @param {string} message - Error message.
 * @param {string} [code] - Optional error code.
 */
export function sendError(res, status, message, code = null)
{
    const response = { ok: false, error: message };
    if (code) response.code = code;
    return res.status(status).json(response);
}

/**
 * Convenience function for 400 Bad Request.
 */
export function badRequest(res, message = "Bad request", code = null)
{
    return sendError(res, 400, message, code);
}

/**
 * Convenience function for 500 Internal Server Error.
 */
export function internalServerError(res, message = "Internal server error", code = null)
{
    return sendError(res, 500, message, code);
}

/**
 * Standard success response utility.
 * @param {import('express').Response} res - Express response object.
 * @param {any} [data] - Optional data to include in response.
 * @param {number} [status=200] - HTTP status code.
 */
export function sendSuccess(res, data = null, status = 200)
{
    const response = { ok: true };
    if (data !== null) response.data = data;
    return res.status(status).json(response);
}