import { Router } from "express";
import { sendSuccess } from "../utility/errorResponse.js";

const router = Router();

router.get('/health', (req, res) =>
{
    if (req.query.legacy === 'true')
    {
        return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
    }
    sendSuccess(res, { timestamp: new Date().toISOString() });
});

export default router;