import { sendError } from "./errorResponse.js";

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function getRequestOrigin(req)
{
    const origin = req.headers.origin;
    if (origin) return origin;

    const referer = req.headers.referer;
    if (!referer) return null;

    try
    {
        return new URL(referer).origin;
    }
    catch
    {
        return null;
    }
}

export function requireSameOrigin()
{
    return (req, res, next) =>
    {
        if (SAFE_METHODS.has(req.method)) return next();

        const requestOrigin = getRequestOrigin(req);
        const expectedOrigin = `${ req.protocol }://${ req.get('host') }`;

        if (!requestOrigin || requestOrigin !== expectedOrigin)
            return sendError(res, 403, 'CSRF validation failed.');

        return next();
    };
}
