import { Router } from "express";
import { sendSuccess } from "../utility/errorResponse.js";

const router = Router();

router.get('/health', (req, res) =>
{
    sendSuccess(res, { timestamp: new Date().toISOString() });
});

export default router;