import { Router } from "express";

const router = Router();

router.get('/health', (req, res) =>
{
    res.status(200).json({
        ok: true,
        timestamp: new Date().toISOString()
    });
});

export default router;