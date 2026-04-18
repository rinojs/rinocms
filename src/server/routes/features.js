import { Router } from "express";
import { sendSuccess } from "../utility/errorResponse.js";

const router = Router();

router.get('/features', (req, res) =>
{
    return sendSuccess(res, {
        features: [
            'session-authentication',
            'role-based-accounts',
            'backoffice-dashboard',
            'content-theme-rendering',
            'content-listing',
            'comment-system-foundation',
            'bulletin-board-foundation'
        ]
    });
});

export default router;
