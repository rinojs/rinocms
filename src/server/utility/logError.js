import path from 'path';
import fsp from 'fs/promises';
import { logDir } from '../config.js';

const logFileName = path.join(logDir, 'server.log');

// Make sure use this between global.ioSemaphore.acquire() and global.ioSemaphore.release()
// So this can be under IO management.
export async function logError(err, context = {})
{
    try
    {
        await fsp.mkdir(logDir, { recursive: true });
        const entry = {
            ts: new Date().toISOString(),
            pid: process.pid,
            ...context,
            err: {
                name: err?.name,
                code: err?.code,
                message: err?.message,
                stack: err?.stack
            }
        };
        await fsp.appendFile(logFileName, JSON.stringify(entry) + '\n', 'utf8');
    }
    catch (e)
    {
        console.error(`LOG FAILED: ${ e }`);
        console.error(`ORIGINAL ERROR: ${ err }, CTX: ${ context }`);
    }
}