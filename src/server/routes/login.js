import { Router } from "express";
import bcrypt from 'bcrypt';
import { dbDir, DB_TIMEOUT, EMAIL_REGEX, USERNAME_REGEX } from "../config.js";
import { dbCommandWithTimeout } from '../db/dbProxy.js';
import { sendError, badRequest } from '../utility/errorResponse.js';
import { validateRequest } from '../utility/validateRequest.js';
import { validateRequest } from '../utility/validateRequest.js';

const router = Router();

/**
 * Middleware that validates login request: either username+password or email+password.
 * Uses validateRequest middleware for the chosen identifier.
 */
function validateLogin(req, res, next) {
    const { email } = req.body;
    // Choose which validation middleware to run
    const middleware = email ? validateRequest(['email', 'password']) : validateRequest(['username', 'password']);
    // Run the chosen middleware
    middleware(req, res, next);
}

/**
 * Helper to find account by username or email.
 * Returns { key, data } if found, null otherwise.
 */
async function findAccountByUsernameOrEmail(username, email)
{
    // Prefer email if provided
    const keyword = email ? `@@${ email }` : `${ username }@@`;
    const result = await dbCommandWithTimeout(DB_TIMEOUT, "getmultiplebykeyword", dbDir, "rinocms", "account", keyword, 0, 1);
    if (!result?.data || Object.keys(result.data).length === 0)
        return null;

    const key = Object.keys(result.data)[0];
    const data = result.data[key];
    return { key, data: JSON.parse(data) };
}

router.post('/login', validateLogin, async (req, res, next) =>
{
    const username = (req.body?.username || "").trim();
    const email = (req.body?.email || "").trim();
    const password = String(req.body?.password || "").trim();

    // At least one identifier must be provided
    if (!username && !email)
        return badRequest(res, "Username or email required.");
    if (!password)
        return badRequest(res, "Password required.");

    // Validate email format if provided
    if (email && !EMAIL_REGEX.test(email))
        return badRequest(res, "Invalid email format.");

    // Validate username format if provided and no email
    if (username && !email && !USERNAME_REGEX.test(username))
        return badRequest(res, "Invalid username format.");

    const account = await findAccountByUsernameOrEmail(username, email);
    if (!account)
        return sendError(res, 401, "Invalid username/email or password.");

    const { passwordHash } = account.data;
    const passwordValid = await bcrypt.compare(password, passwordHash);
    if (!passwordValid)
        return sendError(res, 401, "Invalid username/email or password.");

    // TODO: Implement proper session token generation and storage
    // For now, set a simple cookie and redirect
    const token = `session_${ Date.now() }_${ Math.random().toString(36).substring(2) }`;
    res.cookie('session', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
    return res.redirect(303, "/");
});

export default router;