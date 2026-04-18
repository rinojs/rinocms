import { Router } from "express";
import { deleteSession } from "../utility/session.js";
import { getCookieValue, getSessionCookieClearOptions } from "../utility/cookies.js";

const router = Router();

router.post('/logout', async (req, res) =>
{
    const token = getCookieValue(req.headers.cookie, 'session');

    if (token) await deleteSession(token);

    res.clearCookie('session', getSessionCookieClearOptions());
    return res.redirect(303, '/');
});

export default router;
