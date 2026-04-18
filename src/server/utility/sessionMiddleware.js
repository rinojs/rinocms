import { dbDir, DB_TIMEOUT } from "../config.js";
import { dbCommandWithTimeout } from "../db/dbProxy.js";
import { sendError } from "./errorResponse.js";
import { verifyToken } from "./session.js";
import { getCookieValue } from "./cookies.js";

async function getAccountBySessionUserId(userId)
{
    const account = await dbCommandWithTimeout(
        DB_TIMEOUT,
        'get',
        dbDir,
        'rinocms',
        'account',
        userId
    );

    if (!account) return null;

    try
    {
        return {
            table: 'account',
            data: JSON.parse(account),
        };
    }
    catch
    {
        return null;
    }
}

function isPublicBackofficePath(req)
{
    return req.path.startsWith('/content-api')
        || req.path === '/login'
        || req.path === '/login.html'
        || req.path.startsWith('/styles/')
        || req.path.startsWith('/scripts/')
        || req.path === '/favicon.ico'
        || req.path === '/rino256.png';
}

async function authenticateBackofficeUser(req)
{
    const token = getCookieValue(req.headers.cookie, 'session');
    if (!token) return { ok: false, status: 401, message: 'Authentication required.' };

    const verified = await verifyToken(token);
    if (!verified?.userId) return { ok: false, status: 401, message: 'Authentication required.' };

    const account = await getAccountBySessionUserId(verified.userId);
    if (!account) return { ok: false, status: 401, message: 'Authentication required.' };

    const isAdmin = Array.isArray(account.data.roles) && account.data.roles.includes('admin');
    if (!isAdmin) return { ok: false, status: 403, message: 'Admin access required.' };

    return {
        ok: true,
        user: {
            userId: verified.userId,
        roles: Array.isArray(account.data.roles) ? account.data.roles : [],
        },
    };
}

export async function requireBackofficePageSession(req, res, next)
{
    if (isPublicBackofficePath(req)) return next();

    const auth = await authenticateBackofficeUser(req);
    if (!auth.ok) return res.redirect(303, '/backoffice/login');

    req.user = auth.user;
    return next();
}

export async function requireBackofficeApiSession(req, res, next)
{
    const auth = await authenticateBackofficeUser(req);
    if (!auth.ok) return sendError(res, auth.status, auth.message);

    req.user = auth.user;
    return next();
}
