import { dbDir, DB_TIMEOUT } from '../config.js';
import { dbCommandWithTimeout } from './dbProxy.js';

const DB_NAME = 'rinocms';
const TABLE = 'content';

function parseContentEntry(key, value)
{
    try
    {
        return {
            slug: key,
            ...JSON.parse(value),
        };
    }
    catch
    {
        return null;
    }
}

export async function listContent()
{
    const result = await dbCommandWithTimeout(
        DB_TIMEOUT,
        'getall',
        dbDir,
        DB_NAME,
        TABLE
    );

    if (!result || typeof result !== 'object') return [];

    return Object.entries(result)
        .map(([key, value]) => parseContentEntry(key, value))
        .filter(Boolean)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

export async function listPublishedContent()
{
    const content = await listContent();
    return content.filter((item) => item.status === 'published');
}

export async function getContentBySlug(slug)
{
    const result = await dbCommandWithTimeout(
        DB_TIMEOUT,
        'get',
        dbDir,
        DB_NAME,
        TABLE,
        slug
    );

    if (!result) return null;

    return parseContentEntry(slug, result);
}

export async function getPublishedContentBySlug(slug)
{
    const content = await getContentBySlug(slug);
    if (!content || content.status !== 'published') return null;
    return content;
}

export async function createContent(slug, data)
{
    return await dbCommandWithTimeout(
        DB_TIMEOUT,
        'add',
        dbDir,
        DB_NAME,
        TABLE,
        slug,
        JSON.stringify(data)
    );
}

export async function updateContent(slug, data)
{
    return await dbCommandWithTimeout(
        DB_TIMEOUT,
        'update',
        dbDir,
        DB_NAME,
        TABLE,
        slug,
        JSON.stringify(data)
    );
}

export async function removeContent(slug)
{
    return await dbCommandWithTimeout(
        DB_TIMEOUT,
        'remove',
        dbDir,
        DB_NAME,
        TABLE,
        slug
    );
}
