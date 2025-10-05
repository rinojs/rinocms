import fsp from "fs/promises";
import { getFileLock } from "../utility/getFileLock.js";
import { logError } from '../utility/logError.js';

export async function sendHTML(res, filePath, status, ctx = {})
{
    const lock = getFileLock(filePath, global.fileLocks);
    await global.ioSemaphore.acquire();
    await lock.acquire();

    try
    {
        const html = await fsp.readFile(filePath, 'utf8');
        res.type('html').status(status).send(html);
        return true;
    }
    catch (e)
    {
        if (e && e.code === 'ENOENT') return false;

        await logError(e, { filePath, intendedStatus: status, ...ctx });

        res.status(500).type('text').send('Internal Server Error');
        return true;
    }
    finally
    {
        await lock.release();
        await global.ioSemaphore.release();
    }
}