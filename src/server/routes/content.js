import { Router } from "express";
import { getPublishedContentBySlug, listPublishedContent } from "../db/index.js";
import { badRequest, sendError, sendSuccess } from "../utility/errorResponse.js";

const router = Router();

router.get('/content-api', async (req, res) =>
{
    const content = await listPublishedContent();
    return sendSuccess(res, { content });
});

router.get('/content-api/:slug', async (req, res) =>
{
    const slug = String(req.params?.slug || '').trim().toLowerCase();
    if (!slug) return badRequest(res, 'Slug is required.');

    const content = await getPublishedContentBySlug(slug);
    if (!content) return sendError(res, 404, 'Content not found.');

    return sendSuccess(res, { content });
});

export default router;
