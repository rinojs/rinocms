import { Router } from "express";
import {
    createContent,
    getContentBySlug,
    listContent,
    removeContent,
    updateContent,
} from "../../db/index.js";
import { badRequest, internalServerError, sendSuccess } from "../../utility/errorResponse.js";

const router = Router();

function slugify(input)
{
    return String(input || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function buildContentPayload(body, existingContent, userId)
{
    const now = new Date().toISOString();
    const status = body.status === 'published' ? 'published' : 'draft';
    const wasPublished = existingContent?.status === 'published';

    return {
        title: String(body.title || '').trim(),
        excerpt: String(body.excerpt || '').trim(),
        body: String(body.body || '').trim(),
        status,
        authorId: existingContent?.authorId || userId,
        createdAt: existingContent?.createdAt || now,
        updatedAt: now,
        publishedAt: status === 'published'
            ? (wasPublished ? existingContent?.publishedAt || now : now)
            : null,
    };
}

router.get('/backoffice/content-api', async (req, res) =>
{
    const content = await listContent();
    return sendSuccess(res, { content });
});

router.post('/backoffice/content-api', async (req, res) =>
{
    const title = String(req.body?.title || '').trim();
    const body = String(req.body?.body || '').trim();
    const requestedSlug = String(req.body?.slug || '').trim();
    const currentSlug = String(req.body?.currentSlug || '').trim();
    const slug = slugify(requestedSlug || title);

    if (!title) return badRequest(res, 'Title is required.');
    if (!body) return badRequest(res, 'Body is required.');
    if (!slug) return badRequest(res, 'Slug is required.');

    const existingTarget = await getContentBySlug(slug);
    const existingCurrent = currentSlug ? await getContentBySlug(currentSlug) : null;

    if (!existingCurrent && existingTarget)
        return badRequest(res, 'Slug already exists.');

    if (existingCurrent && currentSlug !== slug && existingTarget)
        return badRequest(res, 'Slug already exists.');

    const payload = buildContentPayload(req.body, existingCurrent, req.user?.userId || null);

    if (!existingCurrent)
    {
        const created = await createContent(slug, payload);
        if (!created) return internalServerError(res, 'Could not create content.');
        return sendSuccess(res, { slug, content: { slug, ...payload } }, 201);
    }

    if (currentSlug && currentSlug !== slug)
    {
        const created = await createContent(slug, payload);
        if (!created) return internalServerError(res, 'Could not update content.');

        const removed = await removeContent(currentSlug);
        if (!removed) return internalServerError(res, 'Could not update content.');
    }
    else
    {
        const updated = await updateContent(slug, payload);
        if (!updated) return internalServerError(res, 'Could not update content.');
    }

    return sendSuccess(res, { slug, content: { slug, ...payload } });
});

router.post('/backoffice/content-api/delete', async (req, res) =>
{
    const slug = slugify(req.body?.slug || '');
    if (!slug) return badRequest(res, 'Slug is required.');

    const existing = await getContentBySlug(slug);
    if (!existing) return badRequest(res, 'Content not found.');

    const removed = await removeContent(slug);
    if (!removed) return internalServerError(res, 'Could not remove content.');

    return sendSuccess(res, { slug });
});

export default router;
