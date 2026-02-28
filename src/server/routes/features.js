import { Router } from "express";

const router = Router();

router.get('/features', (req, res) =>
{
    res.status(200).json({
        features: [
            'ai-assistant',
            'conversation-flow',
            'new-feature'
        ]
    });
});

export default router;