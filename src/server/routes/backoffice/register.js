import { Router } from "express";
import path from 'path';
import { sendNotFound } from "../../sender/sendNotFound.js";
import { sendHTML } from '../../sender/sendHTML.js';
import { dbDir, publicClientDir } from "../../config.js";
import bcrypt from 'bcrypt';
import { dbCommandWithTimeout } from '../../db/dbProxy.js'
import { doesAccountExistByUsername } from "../../db/index.js";
import { badRequest, internalServerError } from '../utility/errorResponse.js';
import { validateRequest } from '../utility/validateRequest.js';

const router = Router();

router.post('/backoffice/register', validateRequest(['username', 'password']), async (req, res, next) =>
{
    const username = (req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();

    const accountCheckResult = await doesAccountExistByUsername(username);

    if (accountCheckResult)
        return badRequest(res, "Username already exists.");

    const now = new Date().toISOString();
    const data = JSON.stringify({
        username: username,
        email: null,
        passwordHash: await bcrypt.hash(password, 10),
        roles: ["user"],
        isEmailVerified: false,
        createdAt: now,
        updatedAt: now,
    });

    const result = await dbCommandWithTimeout(10000, "add", dbDir, "rinocms", "account", `${ username }@@`, data);

    if (!result)
    {
        // pass it to user already exist
        return internalServerError(res, "Could not create user.");
    }

    return res.redirect(303, "/");
});

export default router;