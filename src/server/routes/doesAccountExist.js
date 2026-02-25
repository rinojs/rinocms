import { Router } from "express";
import { EMAIL_REGEX, dbDir } from "../config.js";
import { dbCommandWithTimeout } from '../db/dbProxy.js'
import { badRequest } from '../utility/errorResponse.js'

const router = Router();

router.post('/does-account-exist', async (req, res, next) =>
{
    const email = (req.body?.email || "").trim();

    if (!email || !EMAIL_REGEX.test(email))
        return badRequest(res, "Invalid email.");

    const result = await dbCommandWithTimeout(10000, "get", dbDir, "rinocms", "account", email);

    if (!result) return res.status(200).json({ ok: true });
    else return badRequest(res, "Account with the email exists");
});

export default router;