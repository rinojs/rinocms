import { logInfo } from './logError.js';

export function requestLogger()
{
    return async (req, res, next) =>
    {
        const start = Date.now();

        res.on('finish', async () =>
        {
            const durationMs = Date.now() - start;
            const context = {
                method: req.method,
                path: req.path,
                status: res.statusCode,
                durationMs
            };

            await global.ioSemaphore.acquire();
            try
            {
                await logInfo(context);
            }
            catch (err)
            {
                // If logging fails, we don't want to break the request
                console.error('Request logging failed:', err);
            }
            finally
            {
                await global.ioSemaphore.release();
            }
        });

        next();
    };
}