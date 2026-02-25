import { Router } from "express";
import path from 'path';
import { sendNotFound } from "../../sender/sendNotFound.js";
import { sendHTML } from '../../sender/sendHTML.js';
import { dbDir, USERNAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX, publicClientDir } from "../../config.js";
import bcrypt from 'bcrypt';
import { dbCommandWithTimeout } from '../../db/dbProxy.js'
import { doesAccountExist } from "../../db/index.js";
import { badRequest, internalServerError } from '../utility/errorResponse.js';

const router = Router();

router.post('/backoffice/login', async (req, res, next) =>
{
    const username = (req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    const email = "";

    if (!username || !USERNAME_REGEX.test(username) || username.includes("admin"))
        return badRequest(res, "Invalid username.");
    if (!password || !PASSWORD_REGEX.test(password))
        return badRequest(res, "Invalid password.");

    const accountCheckResult = await doesAccountExist(username, email);

    if (accountCheckResult)
        return badRequest(res, "Email or Username exists.");

    const now = new Date().toISOString();
    const data = JSON.stringify({
        username: username,
        email: email || null,
        passwordHash: await bcrypt.hash(password, 10),
        roles: ["user"],
        isEmailVerified: false,
        createdAt: now,
        updatedAt: now,
    });

    const result = await dbCommandWithTimeout(10000, "add", dbDir, "rinocms", "account", `${ username }@@${ email }`, data);

    if (!result)
    {
        // pass it to user already exist
        return internalServerError(res, "Could not create user.");
    }

    return res.redirect(303, "/");
});

export default router;